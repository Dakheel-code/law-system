-- ============================================================
-- Migration: Google Drive integration
-- Run in Supabase Dashboard → SQL Editor after 013_custom_colors.sql
--
-- Stores ONE office-wide Drive connection. The refresh_token is
-- NEVER exposed to the frontend — only the Netlify function (which
-- uses service_role and bypasses RLS) can read it. The frontend
-- reads connection metadata via a SECURITY DEFINER function that
-- exposes only the safe columns.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Office-wide Drive connection (singleton row)
-- ------------------------------------------------------------
create table if not exists public.drive_connection (
  id uuid primary key default gen_random_uuid(),
  refresh_token text not null,        -- SECRET — service_role only
  connected_email text,
  connected_user_id uuid references auth.users(id) on delete set null,
  root_folder_id text,                -- cached "ناصر طريد" root folder id
  root_folder_name text default 'ناصر طريد',
  cases_folder_id text,               -- cached "قضايا" subfolder
  clients_folder_id text,             -- cached "عملاء" subfolder
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Singleton constraint
create unique index if not exists drive_connection_singleton
  on public.drive_connection ((true));

-- Enable RLS and add NO permissive policy for SELECT/INSERT/UPDATE.
-- Service role bypasses RLS so the Netlify function still works.
alter table public.drive_connection enable row level security;

drop policy if exists "auth read drive_connection" on public.drive_connection;
drop policy if exists "auth write drive_connection" on public.drive_connection;
drop policy if exists "auth full access" on public.drive_connection;

-- The frontend may DELETE the connection (the "disconnect" button).
drop policy if exists "auth delete drive_connection" on public.drive_connection;
create policy "auth delete drive_connection" on public.drive_connection
  for delete to authenticated using (true);

-- ------------------------------------------------------------
-- 2) Safe read function: returns connection metadata WITHOUT
-- refresh_token. SECURITY DEFINER so it runs as table owner
-- (which bypasses RLS) but only reveals safe columns.
-- ------------------------------------------------------------
create or replace function public.drive_connection_status()
returns table (
  id uuid,
  connected_email text,
  connected_user_id uuid,
  root_folder_id text,
  root_folder_name text,
  cases_folder_id text,
  clients_folder_id text,
  connected_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    id, connected_email, connected_user_id,
    root_folder_id, root_folder_name,
    cases_folder_id, clients_folder_id,
    connected_at, updated_at
  from public.drive_connection
  limit 1;
$$;

revoke all on function public.drive_connection_status() from public, anon;
grant execute on function public.drive_connection_status() to authenticated;

-- ------------------------------------------------------------
-- 3) Safe update function for folder IDs (called from frontend
-- after auto-creating folders via Drive API). It can update only
-- the non-secret columns, never the refresh_token.
-- ------------------------------------------------------------
create or replace function public.drive_connection_update_folders(
  p_root_folder_id    text,
  p_cases_folder_id   text,
  p_clients_folder_id text
)
returns void
language sql
security definer
set search_path = public
as $$
  -- WHERE required by Supabase's safe-update setting.
  update public.drive_connection
  set root_folder_id    = p_root_folder_id,
      cases_folder_id   = p_cases_folder_id,
      clients_folder_id = p_clients_folder_id,
      updated_at        = now()
  where id is not null;
$$;

revoke all on function public.drive_connection_update_folders(text, text, text) from public, anon;
grant execute on function public.drive_connection_update_folders(text, text, text) to authenticated;

-- ------------------------------------------------------------
-- 4) Entity → Drive folder mapping (cases, clients, ...)
-- ------------------------------------------------------------
create table if not exists public.drive_folders (
  entity_type text not null,          -- 'case' | 'client'
  entity_id uuid not null,
  folder_id text not null,            -- Google Drive folder id
  folder_name text,                   -- display name when created
  created_at timestamptz default now(),
  primary key (entity_type, entity_id)
);

create index if not exists drive_folders_type_idx
  on public.drive_folders(entity_type);

alter table public.drive_folders enable row level security;

drop policy if exists "auth full access" on public.drive_folders;
create policy "auth full access" on public.drive_folders
  for all to authenticated using (true) with check (true);

-- Realtime for folder mapping updates across tabs (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'drive_folders'
  ) then
    alter publication supabase_realtime add table public.drive_folders;
  end if;
end $$;

-- ============================================================
-- Done
-- ============================================================
