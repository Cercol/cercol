-- Migration 027: grant the app role DML on events
-- Migration 019 created `events` while connected as the postgres superuser and
-- never granted privileges to the `cercol` application role. The role the API
-- and jobs connect with (DATABASE_URL) therefore had NO access: every
-- POST /events insert failed with InsufficientPrivilegeError, which the
-- fire-and-forget client (src/lib/api.js trackEvent) swallowed silently, so the
-- funnel/page_view table sat empty and unnoticed. results/profiles/etc. were
-- granted correctly; only events was missed.
--
-- This grants the same DML set the app role already holds on results:
--   INSERT  — POST /events (api/blog.py)
--   SELECT  — the weekly digest reads (api/jobs/weekly_digest.py)
--   UPDATE/DELETE — parity + ad-hoc maintenance (the 120-day retention DELETE in
--                   the purge cron runs as postgres, so it does not rely on this)
--
-- Idempotent: GRANT is a no-op if the privilege is already held. Apply through
-- the sanctioned pipeline (.github/workflows/apply-migrations.yml) or manually:
--   sudo -u postgres psql cercol -f db/migrations/027_events_grants.sql

GRANT SELECT, INSERT, UPDATE, DELETE ON events TO cercol;
