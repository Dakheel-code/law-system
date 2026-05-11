-- ============================================================
-- Migration: Add multi-assignee support to tasks
-- Run this in Supabase Dashboard → SQL Editor after 004
-- ============================================================

-- Store array of staff IDs that the task is assigned to.
-- Using JSONB array (no FK constraint) lets us reference rows in `staff`
-- (which is the actual employee table) instead of `auth.users`.
alter table public.tasks
  add column if not exists assignees jsonb default '[]'::jsonb;

-- Quick lookup index for filtering by assignee in queries
create index if not exists tasks_assignees_gin_idx on public.tasks using gin (assignees);

-- ------------------------------------------------------------
-- Drop the old FK constraint on assigned_to (it referenced auth.users,
-- but we want to be able to assign tasks to staff rows whose id is NOT
-- an auth user id).
-- ------------------------------------------------------------
alter table public.tasks
  drop constraint if exists tasks_assigned_to_fkey;

-- ============================================================
-- Done
-- ============================================================
