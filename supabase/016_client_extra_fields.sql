-- ============================================================
-- Migration: Extra client fields
-- Adds the additional client data fields used by the new form:
-- address, city, company name, commercial registry, tax number.
-- Files (ID image, power of attorney) keep using the existing
-- Drive attachments flow under each client's folder.
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

alter table public.clients add column if not exists address text;
alter table public.clients add column if not exists city text;
alter table public.clients add column if not exists company_name text;
alter table public.clients add column if not exists commercial_registry text;
alter table public.clients add column if not exists tax_number text;

-- ============================================================
-- Done
-- ============================================================
