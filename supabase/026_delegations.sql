-- ============================================================
-- Migration: Delegations (Phase 6 — extends Leave system)
--
--   تضاف "الانتدابات" كنوع ثالث ضمن جدول leave_requests الموجود:
--     type IN ('leave', 'permission', 'delegation')
--
--   • destination: مكان الانتداب (نصي حر — قد يكون مكتب آخر، محكمة، عميل...)
--   • الانتداب لا يُخصم من رصيد الإجازات السنوي
--   • في تقارير الحضور: تظهر أيام الانتداب بحالة "منتدب" لا "غائب"
--
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

-- Step 1 — extend type check constraint
alter table public.leave_requests
  drop constraint if exists leave_requests_type_check;

alter table public.leave_requests
  add constraint leave_requests_type_check
  check (type in ('leave', 'permission', 'delegation'));

-- Step 2 — add destination column (used by delegations)
alter table public.leave_requests
  add column if not exists destination text default '';

-- ============================================================
-- Done
-- ============================================================
