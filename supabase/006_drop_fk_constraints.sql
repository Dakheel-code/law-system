-- ============================================================
-- Migration: Drop FK constraints that bind to auth.users
-- Run this in Supabase Dashboard → SQL Editor after 005
-- ============================================================
--
-- Reason:
-- Several tables reference auth.users(id) for assigned/created-by/owner
-- columns. But the actual employee records live in the public.staff table
-- (one row per staff member, with optional auth_id linking to a real
-- auth user). The app assigns tasks/cases/etc. by staff.id, so we drop
-- the strict auth.users FKs to allow that.
--
-- Note: we keep the columns themselves (uuid) and the data — only the
-- constraints are removed.
-- ============================================================

-- cases.assigned_lawyer -> auth.users
alter table public.cases
  drop constraint if exists cases_assigned_lawyer_fkey;

-- tasks.assigned_to -> auth.users  (in case 005 hasn't been run yet)
alter table public.tasks
  drop constraint if exists tasks_assigned_to_fkey;

-- created_by columns on various tables — also referenced auth.users.
-- We keep these for now (they're populated by triggers on real signups),
-- but uncomment if they cause issues:
-- alter table public.cases    drop constraint if exists cases_created_by_fkey;
-- alter table public.tasks    drop constraint if exists tasks_created_by_fkey;
-- alter table public.clients  drop constraint if exists clients_created_by_fkey;
-- alter table public.contracts drop constraint if exists contracts_created_by_fkey;

-- ============================================================
-- Done
-- ============================================================
