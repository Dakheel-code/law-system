-- ============================================================
-- Migration: Court sessions on cases
-- Run this in Supabase Dashboard → SQL Editor after 011
-- ============================================================
--
-- Each item in `sessions` represents a single hearing/meeting:
--   {
--     "id": "<local id>",
--     "mode": "in-person" | "online",
--     "date": "YYYY-MM-DD",
--     "time": "HH:MM",
--     "court": "<court name>",
--     "location": "<address>",     // when mode === 'in-person'
--     "link": "<url>",             // when mode === 'online'
--     "details": "<notes>"
--   }
--
-- Sessions automatically show up in:
--   - /appointments  (مركز المواعيد)
--   - /calendar      (التقويم)
-- via the app's useCalendarEvents() helper.
-- ============================================================

alter table public.cases
  add column if not exists sessions jsonb default '[]'::jsonb;

-- Optional index for filtering sessions by date in the future
create index if not exists cases_sessions_gin_idx
  on public.cases using gin (sessions);

-- ============================================================
-- Done
-- ============================================================
