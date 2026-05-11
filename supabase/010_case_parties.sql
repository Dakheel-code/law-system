-- ============================================================
-- Migration: Multi-party support on cases
-- Run this in Supabase Dashboard → SQL Editor after 009
-- ============================================================
--
-- Each item in `parties` represents one opposing party with:
--   { id, name, role: 'plaintiff'|'defendant', idNumber, phone, address }
--
-- The old `other_party_*` columns remain for backward compatibility
-- (read-only — legacy cases) but the new flow writes to `parties`.
-- ============================================================

alter table public.cases
  add column if not exists parties jsonb default '[]'::jsonb;

-- ============================================================
-- Done
-- ============================================================
