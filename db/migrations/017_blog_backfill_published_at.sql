-- Migration 017: backfill NULL published_at on published blog posts
-- Bugfix follow-up to PR #49 (deterministic blog ordering).
--
-- Root cause: 25 rows had status = 'published' but published_at IS NULL.
-- Every application write path stamps the date (api/blog.py create_post sets
-- published_at = now() on publish, and the PUT/PATCH publish transitions set it
-- on first publish), so these NULLs could only have come from an out-of-repo
-- bulk write that inserted/published rows directly in the DB, bypassing the API.
--
-- created_at is the honest fallback: it is `TIMESTAMPTZ DEFAULT now()`
-- (db/migrations/013_blog_posts.sql), so it is always populated and records when
-- the row was actually created (the bulk-load timestamp). It is a real,
-- monotonic date, not an invented one and not today's deploy date.
--
-- PR #49 fixed the ordering *symptom* (NULLs no longer sort first); this
-- migration fixes the *data* so the affected articles carry a real published_at
-- (restoring their sitemap <lastmod> and natural ordering position).
--
-- Idempotent: safe to re-run. The WHERE clause only touches rows still missing a
-- date, so a second run updates nothing. Applied manually on the server (this
-- repo has no migration runner; see docs/ops/runbook.md):
--   sudo -u postgres psql cercol -f db/migrations/017_blog_backfill_published_at.sql

UPDATE blog_posts
   SET published_at = created_at
 WHERE status = 'published'
   AND published_at IS NULL
   AND created_at IS NOT NULL;
