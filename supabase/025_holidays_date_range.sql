-- ============================================================
-- Migration: Holidays date range + new types
--
--   • Rename `date` column → `start_date`
--   • Add `end_date` column (NOT NULL, defaults to start_date for old rows)
--   • Migrate legacy type values:
--       official → national
--       local | custom → private
--   • New supported types: ramadan | eid | private | national
--
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

-- Step 1 — rename date → start_date (if not already done)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'holidays'
      and column_name = 'date'
  ) then
    alter table public.holidays rename column date to start_date;
  end if;
end $$;

-- Step 2 — add end_date column (nullable for backfill)
alter table public.holidays
  add column if not exists end_date date;

-- Step 3 — backfill end_date for any existing rows
update public.holidays
  set end_date = start_date
  where end_date is null
    and id is not null;

-- Step 4 — make end_date NOT NULL going forward
alter table public.holidays
  alter column end_date set not null;

-- Step 5 — migrate legacy type values
update public.holidays
  set type = 'national'
  where type = 'official'
    and id is not null;

update public.holidays
  set type = 'private'
  where type in ('local', 'custom')
    and id is not null;

-- Step 6 — refresh indexes
drop index if exists holidays_date_idx;
create index if not exists holidays_start_date_idx on public.holidays(start_date);
create index if not exists holidays_end_date_idx on public.holidays(end_date);

-- ============================================================
-- Done
-- ============================================================
