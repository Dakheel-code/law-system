-- ============================================================
-- Migration: Case payments
--   payments → سجلّ الدفعات (array of {id, amount, date, method, notes})
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

alter table public.cases
  add column if not exists payments jsonb default '[]'::jsonb;

-- ============================================================
-- Done
-- ============================================================
