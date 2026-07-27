-- Migration 040: grant the app role DML on email_change_tokens, and stop this
-- class of bug from recurring.
--
-- Migration 039 created `email_change_tokens` while connected as the postgres
-- superuser and never granted privileges to the `cercol` application role, so
-- POST /auth/email/change-confirm returned 500 with
-- InsufficientPrivilegeError. This is the *second* time: migration 027 fixed
-- exactly the same oversight on `events` (created by 019).
--
-- So this migration does two things:
--   1. Grants the missing privileges on email_change_tokens (the symptom).
--   2. Sets default privileges for every table postgres creates in `public`
--      from now on (the root cause). A future migration that forgets its GRANT
--      is then still correct by default; a table that genuinely must stay
--      app-inaccessible has to REVOKE deliberately.
--
-- Default privileges only affect tables created AFTER this runs, and only those
-- created by the `postgres` role — which is the role apply_pg_migrations.sh
-- connects as (peer auth, per ADR 0011), so it covers every future migration.
--
-- Idempotent: GRANT and ALTER DEFAULT PRIVILEGES are no-ops when already in
-- place. Apply through .github/workflows/apply-migrations.yml, or manually:
--   sudo -u postgres psql cercol -f db/migrations/040_email_change_tokens_grants.sql

GRANT SELECT, INSERT, UPDATE, DELETE ON email_change_tokens TO cercol;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cercol;
