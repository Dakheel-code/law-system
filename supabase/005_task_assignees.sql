-- ============================================================
-- Migration: Add multi-assignee support to tasks
-- Run this in Supabase Dashboard → SQL Editor after 004
-- ============================================================

-- Store array of staff IDs (or auth user IDs) that the task is assigned to.
-- We keep the existing `assigned_to` column for the single primary assignee
-- (and backward compatibility) — the new `assignees` array is the source of
-- truth for multi-assignee features.
alter table public.tasks
  add column if not exists assignees jsonb default '[]'::jsonb;

-- Quick lookup index for filtering by assignee in queries
create index if not exists tasks_assignees_gin_idx on public.tasks using gin (assignees);

-- ============================================================
-- Done
-- ============================================================
