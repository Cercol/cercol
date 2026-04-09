-- Migration 006: extended profile fields
--
-- Adds demographic columns used for personality norm validation across
-- cultures and languages. All fields are nullable (user consent model).
-- Run in Supabase SQL editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name      TEXT,
  ADD COLUMN IF NOT EXISTS last_name       TEXT,
  ADD COLUMN IF NOT EXISTS country         TEXT,
  ADD COLUMN IF NOT EXISTS native_language TEXT;
