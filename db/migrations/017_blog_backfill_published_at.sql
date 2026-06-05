-- Migration 017: backfill NULL published_at on published blog posts
-- Bugfix follow-up to PR #49 (deterministic blog ordering).
--
-- Root cause: 25 rows had status = 'published' but published_at IS NULL.
-- Every application write path stamps the date (api/blog.py create_post sets
-- published_at = now() on publish, and the PUT/PATCH publish transitions set it
-- on first publish), so these NULLs could only have come from an out-of-repo
-- bulk write that inserted/published rows directly in the DB, bypassing the API.
--
-- Product decision: backfill with now() (the apply-time / fix date), NOT the
-- editorial date. The true publish dates were lost with the bulk write, and
-- created_at is the bulk-load timestamp rather than a meaningful editorial date,
-- so stamping the fix date is the honest, simplest choice: it records "this is
-- when the date was set", not a fabricated editorial history.
--
-- PR #49 fixed the ordering *symptom* (NULLs no longer sort first); this
-- migration fixes the *data* so the affected articles carry a real published_at
-- (restoring their sitemap <lastmod> and a defined ordering position).
--
-- Idempotent: safe to re-run. The WHERE clause only touches rows still missing a
-- date, so a second run updates nothing. Applied through the apply-migrations
-- workflow (ADR 0011); see docs/ops/runbook.md.

UPDATE blog_posts
   SET published_at = now()
 WHERE status = 'published'
   AND published_at IS NULL;
