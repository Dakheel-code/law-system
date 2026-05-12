-- ============================================================
-- Migration: Permissions & roles persistence
-- Run in Supabase Dashboard → SQL Editor.
--
-- Stores all permissions configuration in a single singleton row with
-- JSONB columns so the whole page can load/save in one round-trip:
--   role_grants  → { roleKey: [permKey, ...] }
--   custom_roles → [{ key, label }, ...]   (user-defined roles only)
--   bundles      → [{ key, label, description, permissions: [] }, ...]
--   user_grants  → { userId: [permKey, ...] }
-- ============================================================

create table if not exists public.permission_settings (
  id uuid primary key default gen_random_uuid(),
  role_grants  jsonb not null default '{}'::jsonb,
  custom_roles jsonb not null default '[]'::jsonb,
  bundles      jsonb not null default '[]'::jsonb,
  user_grants  jsonb not null default '{}'::jsonb,
  updated_at   timestamptz default now()
);

-- Singleton — only one row allowed
create unique index if not exists permission_settings_singleton
  on public.permission_settings ((true));

-- Seed the singleton row on first run
insert into public.permission_settings (role_grants, custom_roles, bundles, user_grants)
select '{}'::jsonb, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb
where not exists (select 1 from public.permission_settings);

alter table public.permission_settings enable row level security;

drop policy if exists "auth full access" on public.permission_settings;
create policy "auth full access" on public.permission_settings
  for all to authenticated using (true) with check (true);

-- Realtime so other tabs see changes immediately (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'permission_settings'
  ) then
    alter publication supabase_realtime add table public.permission_settings;
  end if;
end $$;

-- ============================================================
-- Done
-- ============================================================
