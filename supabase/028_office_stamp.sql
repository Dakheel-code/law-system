-- ============================================================
-- Migration: Office electronic stamp
--
--   stamp_data_url → الختم الإلكتروني (data URL base64) يُرفَع من إعدادات
--                    المكتب ويظهر في توقيع تقارير الجلسات.
--
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

alter table public.office_settings
  add column if not exists stamp_data_url text;

-- ============================================================
-- Done
-- ============================================================
