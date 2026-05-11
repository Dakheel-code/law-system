-- ============================================================
-- Migration: Extra case fields — roles + extended case details
-- Run this in Supabase Dashboard → SQL Editor after 006
-- ============================================================

-- Parties' roles in the case
-- client_role / opponent_role: 'plaintiff' (مدعي) or 'defendant' (مدعى عليه)
alter table public.cases
  add column if not exists client_role text default 'plaintiff';

alter table public.cases
  add column if not exists opponent_role text default 'defendant';

-- Extended case details
alter table public.cases
  add column if not exists case_number text;          -- رقم القضية الرسمي

alter table public.cases
  add column if not exists claim_subject text;        -- نوع/موضوع المطالبة

alter table public.cases
  add column if not exists circuit_name text;         -- اسم الدائرة القضائية

alter table public.cases
  add column if not exists assignment_date date;      -- تاريخ تكليف القضية

alter table public.cases
  add column if not exists case_date date;            -- تاريخ القضية الرسمي

-- Optional: index on case_number for quick lookup
create index if not exists cases_case_number_idx on public.cases(case_number);

-- ============================================================
-- Done
-- ============================================================
