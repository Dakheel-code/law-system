-- ============================================================
-- Migration: Case attachments + multi-lawyer assignment
-- Run this in Supabase Dashboard → SQL Editor after 008
-- ============================================================

-- Attachments column (already exists in schema.sql as default '[]'::jsonb,
-- but we re-declare for safety on installs that pre-date that)
alter table public.cases
  add column if not exists attachments jsonb default '[]'::jsonb;

-- Multi-assignee array of staff IDs (single `assigned_lawyer` stays for
-- backward compatibility / primary lawyer display)
alter table public.cases
  add column if not exists assigned_lawyers jsonb default '[]'::jsonb;

create index if not exists cases_assigned_lawyers_gin_idx
  on public.cases using gin (assigned_lawyers);

-- ============================================================
-- Done
-- ============================================================
