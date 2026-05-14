-- ============================================================
-- Migration: Leave requests + HR settings (Phase 4 of Attendance & Leave system)
--
--   hr_settings     → إعدادات الموارد البشرية (singleton)
--                    • annual_leave_days: رصيد الإجازات السنوية الافتراضي
--   leave_requests  → طلبات الاستئذان والإجازة
--                    type = 'leave' للإجازة (أيام كاملة)
--                         | 'permission' للاستئذان (ساعات في نفس اليوم)
--
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

-- ----------------------------------------------------------------
-- Settings (singleton row)
-- ----------------------------------------------------------------

create table if not exists public.hr_settings (
  id uuid primary key default gen_random_uuid(),
  annual_leave_days integer not null default 30,
  updated_at timestamptz default now()
);

create unique index if not exists hr_settings_singleton
  on public.hr_settings ((true));

insert into public.hr_settings (annual_leave_days)
select 30 where not exists (select 1 from public.hr_settings);

alter table public.hr_settings enable row level security;
drop policy if exists "auth full access" on public.hr_settings;
create policy "auth full access" on public.hr_settings
  for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------
-- Leave requests
-- ----------------------------------------------------------------

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.staff(id) on delete cascade,
  type text not null check (type in ('leave', 'permission')),
  start_date date not null,
  end_date date not null,           -- = start_date عند الاستئذان
  start_time time,                  -- يُستخدم فقط للاستئذان
  end_time time,
  days numeric,                     -- محسوبة (للإجازة فقط)
  hours numeric,                    -- محسوبة (للاستئذان فقط)
  reason text default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  approved_by uuid references public.staff(id) on delete set null,
  approved_at timestamptz,
  reject_reason text default '',
  created_at timestamptz default now()
);

create index if not exists leave_user_idx on public.leave_requests(user_id);
create index if not exists leave_status_idx on public.leave_requests(status);
create index if not exists leave_dates_idx on public.leave_requests(start_date, end_date);

alter table public.leave_requests enable row level security;
drop policy if exists "auth full access" on public.leave_requests;
create policy "auth full access" on public.leave_requests
  for all to authenticated using (true) with check (true);

-- Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'hr_settings'
  ) then
    alter publication supabase_realtime add table public.hr_settings;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'leave_requests'
  ) then
    alter publication supabase_realtime add table public.leave_requests;
  end if;
end $$;

-- ============================================================
-- Done
-- ============================================================
