-- Migration 019: first-party funnel events
-- Lightweight, append-only event log for the article -> test funnel. NO
-- third-party analytics: this is the only place funnel signals are stored.
--
-- Events captured (see api/blog.py POST /events):
--   article_view  - a real human opened an article (prerender/bots excluded
--                   client-side via the window.__PRERENDER__ guard)
--   cta_click     - the end-of-article CTA was clicked (wired when the CTA ships)
--   test_start    - a test page (e.g. New Moon) mounted
-- test_complete is intentionally NOT stored here: it is already derivable from
-- results.created_at.
--
-- No PII: anon_id is an opaque client-generated id, never an account id.
--
-- Idempotent: safe to re-run (IF NOT EXISTS on the table, the index and the
-- constraint), mirroring migrations 016 and 018.
-- This repo has no migration runner; apply manually on the server (see
-- docs/ops/runbook.md):
--   sudo -u postgres psql cercol -f db/migrations/019_events.sql

CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,                 -- 'article_view' | 'cta_click' | 'test_start'
  slug        TEXT,                          -- article slug, when applicable
  instrument  TEXT,                          -- e.g. 'newMoon', when applicable
  lang        TEXT,                          -- two-letter locale, when known
  path        TEXT,                          -- request path, when known
  anon_id     TEXT,                          -- opaque client id, never an account id
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_name_created_at_idx ON events (name, created_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_name_check'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_name_check
      CHECK (name IN ('article_view', 'cta_click', 'test_start'));
  END IF;
END $$;
