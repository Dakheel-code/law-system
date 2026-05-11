-- ============================================================
-- Migration: Custom theme colors (primary + accent hex overrides)
-- Run this in Supabase Dashboard → SQL Editor after 012
-- ============================================================
--
-- When set, these override the preset `theme_color` with a custom
-- hex. The app generates a 10-shade Tailwind-style palette from the
-- hex at runtime.
-- ============================================================

alter table public.office_settings
  add column if not exists custom_primary text;

alter table public.office_settings
  add column if not exists custom_accent text;

-- ============================================================
-- Done
-- ============================================================
