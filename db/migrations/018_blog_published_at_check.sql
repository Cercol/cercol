-- Migration 018: enforce the published_at invariant decided in ADR 0010.
-- A published blog post must always carry a published_at; this rejects any
-- future write (including a direct DB write that bypasses the API) that
-- publishes a row without a date. See docs/decisions/0010-blog-published-at-invariant.md.
--
-- DEPENDS ON 017 BEING APPLIED FIRST. ALTER TABLE ADD CONSTRAINT validates the
-- existing rows, so every published row must already have a published_at when
-- this runs. If 017 has not been applied, this errors and lists the violating
-- rows: apply db/migrations/017_blog_backfill_published_at.sql first, then retry.
--
-- Idempotent: safe to re-run. The DO-block adds the constraint only if it does
-- not already exist (mirrors the IF-NOT-EXISTS idempotency of migration 016).
-- Applied manually on the server (this repo has no migration runner; see
-- docs/ops/runbook.md):
--   sudo -u postgres psql cercol -f db/migrations/018_blog_published_at_check.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blog_posts_published_has_date'
  ) THEN
    ALTER TABLE blog_posts
      ADD CONSTRAINT blog_posts_published_has_date
      CHECK (status <> 'published' OR published_at IS NOT NULL);
  END IF;
END $$;
