-- ============================================================
-- Migration: Extended case details fields
-- Adds the legal-narrative columns used by the expanded
-- "تفاصيل القضية" form:
--   موضوع الدعوى، الوقائع، الطلبات، الدفوع، السند النظامي،
--   المواد القانونية، قيمة المطالبة، نسبة الخطورة،
--   ملخص القضية، الاستراتيجية القانونية.
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

alter table public.cases add column if not exists lawsuit_subject text;
alter table public.cases add column if not exists facts text;
alter table public.cases add column if not exists claims text;
alter table public.cases add column if not exists defenses text;
alter table public.cases add column if not exists legal_basis text;
alter table public.cases add column if not exists legal_articles text;
alter table public.cases add column if not exists claim_value numeric;
alter table public.cases add column if not exists risk_level numeric;
alter table public.cases add column if not exists case_summary text;
alter table public.cases add column if not exists legal_strategy text;

-- ============================================================
-- Done
-- ============================================================
