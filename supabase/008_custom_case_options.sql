-- ============================================================
-- Migration: Customizable case types & court types
-- Run this in Supabase Dashboard → SQL Editor after 007
-- ============================================================
--
-- These columns hold the editable lists shown in the case form.
-- Each item is { "value": "<key>", "label": "<arabic label>" }.
-- Default values mirror the original hardcoded lists in caseConfig.ts.
-- ============================================================

alter table public.office_settings
  add column if not exists case_types jsonb default '[
    {"value":"commercial","label":"تجارية"},
    {"value":"labor","label":"عمالية"},
    {"value":"real-estate","label":"عقارية"},
    {"value":"personal-status","label":"أحوال شخصية"},
    {"value":"criminal","label":"جزائية"},
    {"value":"administrative","label":"إدارية"},
    {"value":"execution","label":"تنفيذية"},
    {"value":"civil","label":"حقوقية"}
  ]'::jsonb;

alter table public.office_settings
  add column if not exists court_types jsonb default '[
    {"value":"general","label":"المحكمة العامة"},
    {"value":"commercial","label":"المحكمة التجارية"},
    {"value":"labor","label":"المحكمة العمالية"},
    {"value":"personal-status","label":"محكمة الأحوال الشخصية"},
    {"value":"criminal","label":"المحكمة الجزائية"},
    {"value":"administrative","label":"ديوان المظالم"},
    {"value":"execution","label":"محكمة التنفيذ"},
    {"value":"appeal","label":"محكمة الاستئناف"},
    {"value":"supreme","label":"المحكمة العليا"}
  ]'::jsonb;

-- ============================================================
-- Done
-- ============================================================
