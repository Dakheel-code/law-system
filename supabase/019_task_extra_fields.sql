-- ============================================================
-- Migration: Extra task fields
--   start_date  → تاريخ البداية
--   attachments → المرفقات (Drive-backed metadata)
--   comments    → التعليقات (array of {id, authorId, authorName, text, createdAt})
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

alter table public.tasks add column if not exists start_date date;
alter table public.tasks add column if not exists attachments jsonb default '[]'::jsonb;
alter table public.tasks add column if not exists comments jsonb default '[]'::jsonb;

-- ============================================================
-- Done
-- ============================================================
