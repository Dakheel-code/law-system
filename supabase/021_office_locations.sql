-- ============================================================
-- Migration: Office locations (Phase 1 of Attendance & Leave system)
--
--   office_locations  → مكاتب الشركة (موقع جغرافي + نطاق + أوقات عمل)
--   user_locations    → ربط M:N بين المستخدمين والمواقع
--
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

create table if not exists public.office_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text default '',
  latitude double precision,        -- يتركها فارغة إذا لم يحدّد بعد
  longitude double precision,
  radius_m integer not null default 100,  -- نطاق التحقق GPS بالمتر
  -- أوقات العمل لكل يوم — تخزَّن JSONB لمرونة الإضافة لاحقاً
  -- مثال: { "sun": {"open":"08:00","close":"17:00","off":false}, "fri": {"off":true}, ... }
  working_hours jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Many-to-many — كل مستخدم يمكن ربطه بأكثر من موقع
create table if not exists public.user_locations (
  user_id uuid references public.staff(id) on delete cascade,
  location_id uuid references public.office_locations(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, location_id)
);

create index if not exists user_locations_user_idx on public.user_locations(user_id);
create index if not exists user_locations_location_idx on public.user_locations(location_id);

-- RLS
alter table public.office_locations enable row level security;
alter table public.user_locations enable row level security;

drop policy if exists "auth full access" on public.office_locations;
create policy "auth full access" on public.office_locations
  for all to authenticated using (true) with check (true);

drop policy if exists "auth full access" on public.user_locations;
create policy "auth full access" on public.user_locations
  for all to authenticated using (true) with check (true);

-- Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'office_locations'
  ) then
    alter publication supabase_realtime add table public.office_locations;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_locations'
  ) then
    alter publication supabase_realtime add table public.user_locations;
  end if;
end $$;

-- ============================================================
-- Done
-- ============================================================
