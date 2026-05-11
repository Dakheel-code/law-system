-- ============================================================
-- Migration: Per-lawyer roles on case assignments
-- Run this in Supabase Dashboard → SQL Editor after 010
-- ============================================================
--
-- Each item in `assignments` represents a person assigned to the case
-- with a specific role:
--   {
--     "userId": "<staff uuid>",
--     "role": "primary" | "assistant" | "supervisor" | "custom",
--     "customTitle": "<title>"   // only when role === 'custom'
--   }
--
-- The old `assigned_lawyers` jsonb (added in 009) remains for backward
-- compatibility. When `assignments` is empty but `assigned_lawyers` has
-- entries, the app maps the first one to role='primary' and the rest
-- to role='assistant'.
-- ============================================================

alter table public.cases
  add column if not exists assignments jsonb default '[]'::jsonb;

create index if not exists cases_assignments_gin_idx
  on public.cases using gin (assignments);

-- ============================================================
-- Done
-- ============================================================
