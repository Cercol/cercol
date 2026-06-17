-- Migration 028: first-touch channel attribution on results
-- Adds the opaque visitor id and first-touch channel fields that POST /results
-- now sends (api/main.py LogResultBody + INSERT), so a completed test can be
-- traced to its source. First-party only; anon_id is the same opaque,
-- cookie-less id as the events table and is never linked to an account.
--
-- New data category: this captures referrer + utm. See ADR 0014
-- (docs/decisions/0014-first-party-visit-source-attribution.md). Apply only
-- after sign-off, and ensure the privacy policy copy is updated first.
--
-- Idempotent (ADD COLUMN IF NOT EXISTS). Must be applied BEFORE the matching
-- api/main.py change is live, or the extended INSERT will fail on the missing
-- columns. Apply through .github/workflows/apply-migrations.yml or manually:
--   sudo -u postgres psql cercol -f db/migrations/028_results_attribution.sql

ALTER TABLE results ADD COLUMN IF NOT EXISTS anon_id      TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS utm_source   TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS utm_medium   TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS referrer     TEXT;
