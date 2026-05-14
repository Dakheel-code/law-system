-- ============================================================
-- Migration: Holidays (Phase 2 of Attendance & Leave system)
--
--   holidays  → الإجازات الرسمية والمناسبات (لا يوجد فيها عمل)
--
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  date date not null,            -- تاريخ الإجازة YYYY-MM-DD
  name text not null,            -- اسم الإجازة (مثل: اليوم الوطني)
  type text not null default 'official',  -- official | local | custom
  notes text default '',
  /**
   * إذا كانت الإجازة لمواقع محددة فقط (مكاتب فروع مختلفة).
   * فارغ أو null = الإجازة سارية على كل المواقع.
   */
  location_ids uuid[] default null,
  created_at timestamptz default now()
);

create index if not exists holidays_date_idx on public.holidays(date);

alter table public.holidays enable row level security;

drop policy if exists "auth full access" on public.holidays;
create policy "auth full access" on public.holidays
  for all to authenticated using (true) with check (true);

-- Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'holidays'
  ) then
    alter publication supabase_realtime add table public.holidays;
  end if;
end $$;

-- ============================================================
-- Done
-- ============================================================
