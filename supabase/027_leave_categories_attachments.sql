-- ============================================================
-- Migration: Leave categories + attachments + case link
--
--   • leave_category: تصنيف فرعي للإجازة (سنوية/مرضية/أمومة/...)
--   • attachments:    مرفقات Drive للطلب (تقرير طبي مثلاً)
--   • case_id:        ربط الانتداب بقضية محددة
--   • session_id:     ربط الانتداب بجلسة محددة (الـ id داخل JSONB)
--
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

alter table public.leave_requests
  add column if not exists leave_category text default 'annual';

alter table public.leave_requests
  add column if not exists attachments jsonb default '[]'::jsonb;

alter table public.leave_requests
  add column if not exists case_id uuid references public.cases(id) on delete set null;

alter table public.leave_requests
  add column if not exists session_id text;

-- Index لتسريع البحث عن الطلبات المرتبطة بقضية
create index if not exists leave_case_idx
  on public.leave_requests(case_id)
  where case_id is not null;

-- ============================================================
-- Done
-- ============================================================
