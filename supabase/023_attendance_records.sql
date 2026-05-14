-- ============================================================
-- Migration: Attendance records (Phase 3 of Attendance & Leave system)
--
--   attendance_records → سجلات الحضور والانصراف
--
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.staff(id) on delete cascade,
  location_id uuid not null references public.office_locations(id) on delete cascade,
  date date not null,                       -- YYYY-MM-DD (Local date of check-in)
  check_in_at timestamptz not null default now(),
  check_in_lat double precision,
  check_in_lng double precision,
  check_in_distance_m integer,              -- المسافة عن مركز الموقع وقت التسجيل
  check_out_at timestamptz,
  check_out_lat double precision,
  check_out_lng double precision,
  check_out_distance_m integer,
  status text not null default 'present',   -- present | late | left-early
  notes text default '',
  created_at timestamptz default now(),
  unique (user_id, date)                    -- سجل واحد لكل مستخدم في اليوم
);

create index if not exists attendance_user_idx on public.attendance_records(user_id);
create index if not exists attendance_date_idx on public.attendance_records(date);
create index if not exists attendance_user_date_idx
  on public.attendance_records(user_id, date);

alter table public.attendance_records enable row level security;

drop policy if exists "auth full access" on public.attendance_records;
create policy "auth full access" on public.attendance_records
  for all to authenticated using (true) with check (true);

-- Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'attendance_records'
  ) then
    alter publication supabase_realtime add table public.attendance_records;
  end if;
end $$;

-- ============================================================
-- Done
-- ============================================================
