-- Core tables for the Cèrcol API on D1, mirrored from Postgres.
--
-- # Spec: docs/architecture/backend.md
--
-- Type mapping, and why:
--   uuid         -> TEXT. Generated in the Worker with crypto.randomUUID();
--                   SQLite has no uuid type and D1 has no gen_random_uuid().
--   timestamptz  -> TEXT, ISO-8601 with offset, written by the Worker as
--                   new Date().toISOString(). Never rely on CURRENT_TIMESTAMP:
--                   it is UTC without an offset marker and the API contract
--                   emits '+00:00', which is what the frontend parses.
--   numeric      -> REAL. Scores are 1..5 with a few decimals; REAL is exact
--                   enough and D1 returns it as a JS number, which is what
--                   the JSON API returned from Postgres already looked like.
--   jsonb        -> TEXT holding JSON. Read with json_extract / json_each.
--   boolean      -> INTEGER 0/1. The Worker maps to true/false on the way
--                   out so the API contract does not change.
--
-- Foreign keys: only the five Postgres actually has (witness_responses ->
-- witness_sessions, group_members -> groups, and the three token tables ->
-- auth_users). A first draft added profiles/results/groups -> auth_users
-- too, and D1 enforces FKs where the Postgres schema never declared them:
-- the load rejected 7 legitimate orphan profiles (deleted accounts) and 6
-- anonymised results. Same constraints as production, no more.
--
-- password_hash is deliberately gone: passwords are being retired in this
-- migration (magic link and Google remain). The column is not created, so
-- there is nothing to leak and nothing to hash within a 10 ms CPU budget.

CREATE TABLE IF NOT EXISTS auth_users (
  id               TEXT PRIMARY KEY,
  email            TEXT NOT NULL UNIQUE COLLATE NOCASE,
  google_id        TEXT UNIQUE,
  created_at       TEXT NOT NULL,
  last_sign_in_at  TEXT,
  email_verified   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS profiles (
  id               TEXT PRIMARY KEY,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  premium          INTEGER NOT NULL DEFAULT 0,
  first_name       TEXT,
  last_name        TEXT,
  country          TEXT,
  native_language  TEXT,
  email            TEXT,
  is_admin         INTEGER NOT NULL DEFAULT 0,
  onboarding_seen  INTEGER NOT NULL DEFAULT 0,
  is_beta          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL,
  revoked_at  TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens (user_id);

CREATE TABLE IF NOT EXISTS magic_tokens (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL,
  used_at     TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_states (
  state       TEXT PRIMARY KEY,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_change_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  new_email   TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL,
  used_at     TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS results (
  id                 TEXT PRIMARY KEY,
  created_at         TEXT NOT NULL,
  language           TEXT,
  instrument         TEXT NOT NULL,
  presence           REAL,
  bond               REAL,
  discipline         REAL,
  depth              REAL,
  vision             REAL,
  user_id            TEXT,
  facets             TEXT,
  anon_id            TEXT,
  utm_source         TEXT,
  utm_medium         TEXT,
  utm_campaign       TEXT,
  referrer           TEXT,
  is_seed            INTEGER NOT NULL DEFAULT 0,
  accuracy_rating    INTEGER,
  accuracy_rated_at  TEXT
);
-- Mirrors the two partial indexes Postgres carried: real results by date,
-- and the per-user lookup that MyResultsPage hits.
CREATE INDEX IF NOT EXISTS results_real_created_idx ON results (created_at) WHERE is_seed = 0;
CREATE INDEX IF NOT EXISTS results_user_idx ON results (user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS events (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  -- The article slug, except on test_progress rows, where it is the tenth of
  -- the instrument the taker had reached ('10'..'90'). See worker/src/writes.js.
  slug        TEXT,
  instrument  TEXT,
  lang        TEXT,
  path        TEXT,
  anon_id     TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_created_idx ON events (created_at);
CREATE INDEX IF NOT EXISTS events_name_created_idx ON events (name, created_at);

CREATE TABLE IF NOT EXISTS groups (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  nudged_at   TEXT,
  is_seed     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id       TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id        TEXT,
  status         TEXT NOT NULL DEFAULT 'pending',
  invited_email  TEXT,
  invited_at     TEXT NOT NULL,
  joined_at      TEXT
);
CREATE INDEX IF NOT EXISTS group_members_group_idx ON group_members (group_id);
CREATE INDEX IF NOT EXISTS group_members_user_idx ON group_members (user_id);

CREATE TABLE IF NOT EXISTS witness_sessions (
  id               TEXT PRIMARY KEY,
  subject_id       TEXT NOT NULL,
  token            TEXT NOT NULL UNIQUE,
  witness_name     TEXT NOT NULL,
  witness_email    TEXT,
  witness_user_id  TEXT,
  subject_display  TEXT,
  completed_at     TEXT,
  created_at       TEXT NOT NULL,
  is_seed          INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS witness_sessions_subject_idx ON witness_sessions (subject_id);

CREATE TABLE IF NOT EXISTS witness_responses (
  id             TEXT PRIMARY KEY,
  session_id     TEXT NOT NULL REFERENCES witness_sessions(id) ON DELETE CASCADE,
  domain_scores  TEXT NOT NULL,
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS witness_responses_session_idx ON witness_responses (session_id);

CREATE TABLE IF NOT EXISTS translation_feedback (
  id           TEXT PRIMARY KEY,
  created_at   TEXT NOT NULL,
  language     TEXT NOT NULL,
  instrument   TEXT,
  context      TEXT,
  suggestion   TEXT NOT NULL,
  item_id      INTEGER,
  item_text    TEXT,
  user_id      TEXT,
  resolved_at  TEXT
);
