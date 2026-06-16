-- Migration 026: allow the 'page_view' funnel event
-- Widens the events_name_check CHECK constraint to admit 'page_view', the
-- first-party signal fired on every client route change (see api/blog.py
-- _EVENT_NAMES and src/App.jsx usePageViewTracking). This is the general
-- page-visit source the weekly digest needs; the three prior names only
-- covered the article -> test funnel.
--
-- No PII: anon_id remains an opaque client-generated id, never an account id.
--
-- Idempotent: drops and re-adds the constraint each run so the allowed set
-- always matches this file, regardless of which prior name set was in place.
-- This repo has no migration runner; apply through the sanctioned pipeline
-- (.github/workflows/apply-migrations.yml, workflow_dispatch) or manually:
--   sudo -u postgres psql cercol -f db/migrations/026_events_page_view.sql

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_name_check;

ALTER TABLE events
  ADD CONSTRAINT events_name_check
  CHECK (name IN ('article_view', 'cta_click', 'test_start', 'page_view'));
