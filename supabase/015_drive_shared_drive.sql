-- ============================================================
-- Migration: add shared_drive_id to drive_connection
-- Run in Supabase Dashboard → SQL Editor after 014_drive_integration.sql
--
-- A Shared Drive (Workspace feature) is owned by the organization,
-- not an individual. When configured, the system places folders/files
-- inside the Shared Drive instead of the connected user's "My Drive".
-- ============================================================

alter table public.drive_connection
  add column if not exists shared_drive_id text;

-- Recreate the read function to expose shared_drive_id
create or replace function public.drive_connection_status()
returns table (
  id uuid,
  connected_email text,
  connected_user_id uuid,
  root_folder_id text,
  root_folder_name text,
  cases_folder_id text,
  clients_folder_id text,
  shared_drive_id text,
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
    shared_drive_id,
    connected_at, updated_at
  from public.drive_connection
  limit 1;
$$;

revoke all on function public.drive_connection_status() from public, anon;
grant execute on function public.drive_connection_status() to authenticated;

-- Allow updating the Shared Drive ID from the frontend (no secrets exposed)
create or replace function public.drive_connection_set_shared_drive(
  p_shared_drive_id text
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.drive_connection
  set shared_drive_id = nullif(trim(p_shared_drive_id), ''),
      -- Switching the storage root invalidates the cached folder IDs
      root_folder_id    = null,
      cases_folder_id   = null,
      clients_folder_id = null,
      updated_at        = now();
  -- Also wipe the per-entity folder cache so they re-create under the new root
  delete from public.drive_folders;
$$;

revoke all on function public.drive_connection_set_shared_drive(text) from public, anon;
grant execute on function public.drive_connection_set_shared_drive(text) to authenticated;

-- ============================================================
-- Done
-- ============================================================
