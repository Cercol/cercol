-- Migration 021: reset the synthetic view_count baseline
-- One-time data fix. Before the SLICE 1 guard (PR #62, merged), the prerender
-- pass fired trackBlogView for every article route on every build, inflating
-- blog_posts.view_count to a near-uniform ~213 with no relation to real
-- traffic. With the guard now live, future views are genuine; this zeroes the
-- polluted baseline so the public "views" count starts from real data.
--
-- Data-only (no schema change). Idempotent: re-running just re-zeroes.
-- Independent of migrations 019 (events, PR #67) and 020 (title/meta rewrites).
-- This repo has no migration runner; apply manually on the server (see
-- docs/ops/runbook.md):
--   sudo -u postgres psql cercol -f db/migrations/021_reset_view_count.sql

UPDATE blog_posts SET view_count = 0;
