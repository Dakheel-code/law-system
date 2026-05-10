-- ============================================================
-- Migration: Extend office_settings + add activity_log
-- Run this in Supabase Dashboard → SQL Editor after 003_seed_data.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) Extend office_settings with admin-page fields
-- ------------------------------------------------------------
alter table public.office_settings add column if not exists language text default 'ar';
alter table public.office_settings add column if not exists timezone text default 'asia-riyadh';
alter table public.office_settings add column if not exists currency text default 'sar';
alter table public.office_settings add column if not exists calendar_format text default 'both';
alter table public.office_settings add column if not exists date_format text default 'dmy';

alter table public.office_settings add column if not exists notifications jsonb
  default '{"email":true,"sms":false,"push":true,"sessions":true,"deadlines":true,"payments":true,"newRequests":true,"weekly":false}'::jsonb;

alter table public.office_settings add column if not exists backup_auto boolean default true;
alter table public.office_settings add column if not exists last_backup_at timestamptz;

-- ------------------------------------------------------------
-- 2) Activity log
-- ------------------------------------------------------------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text,
  action text not null,                  -- e.g. 'update_office', 'create_client', 'backup_create'
  category text,                         -- 'office' | 'client' | 'case' | 'task' | 'contract' | 'backup' | 'auth'
  description text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists activity_log_created_at_idx on public.activity_log(created_at desc);
create index if not exists activity_log_category_idx on public.activity_log(category);

alter table public.activity_log enable row level security;
drop policy if exists "auth full access" on public.activity_log;
create policy "auth full access" on public.activity_log for all
  to authenticated using (true) with check (true);

alter publication supabase_realtime add table public.activity_log;

-- ============================================================
-- Done
-- ============================================================
