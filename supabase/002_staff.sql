-- ============================================================
-- Migration: Add `staff` table (team members without login)
-- Run this in Supabase Dashboard → SQL Editor after schema.sql
-- ============================================================

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) on delete set null unique,
  user_code text unique not null,
  type text,
  full_name text,
  first_name text,
  middle_name text,
  third_name text,
  last_name text,
  email text,
  phone text,
  id_number text,
  nationality text,
  avatar_data_url text,
  status text default 'active' check (status in ('active','inactive')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists staff_status_idx on public.staff(status);
create index if not exists staff_type_idx on public.staff(type);

-- Auto-touch updated_at
drop trigger if exists trg_touch_staff on public.staff;
create trigger trg_touch_staff before update on public.staff
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.staff enable row level security;
drop policy if exists "auth full access" on public.staff;
create policy "auth full access" on public.staff for all
  to authenticated using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table public.staff;
