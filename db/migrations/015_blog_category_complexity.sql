-- Migration 015: document blog_posts.category and blog_posts.complexity
--
-- These columns were added directly to production (verified May 2026)
-- without a corresponding migration in the repo. This file makes the
-- schema reproducible and documents the canonical defaults.
--
-- Defaults match production:
--   category   = 'general'
--   complexity = 'intermediate'

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS category   text DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS complexity text DEFAULT 'intermediate';
