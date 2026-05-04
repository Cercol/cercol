-- Migration 012: Custom authentication tables
-- Replaces Supabase Auth (GoTrue) with self-hosted auth on Hetzner PostgreSQL.
--
-- Run once in the Hetzner PostgreSQL cercol database:
--   sudo -u postgres psql -d cercol -f 012_auth_tables.sql

-- ── auth_users ────────────────────────────────────────────────────────────
-- One row per registered user. UUIDs are preserved from Supabase for existing
-- users so that all FK references in profiles/results/etc. remain intact.

CREATE TABLE IF NOT EXISTS auth_users (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           text        UNIQUE NOT NULL,
    password_hash   text,                          -- NULL for magic-link-only or Google-only users
    google_id       text        UNIQUE,            -- Google subject ID for OAuth users
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_sign_in_at timestamptz
);

CREATE INDEX IF NOT EXISTS auth_users_email_idx  ON auth_users (email);
CREATE INDEX IF NOT EXISTS auth_users_google_idx ON auth_users (google_id) WHERE google_id IS NOT NULL;

-- ── magic_tokens ──────────────────────────────────────────────────────────
-- Short-lived one-time tokens sent via email. Consumed on verification.

CREATE TABLE IF NOT EXISTS magic_tokens (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    email      text        NOT NULL,
    token      text        UNIQUE NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at    timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS magic_tokens_token_idx ON magic_tokens (token);
-- Clean up expired tokens periodically (handled by DELETE in verify endpoint).

-- ── refresh_tokens ────────────────────────────────────────────────────────
-- Opaque tokens for session renewal. Stored server-side so they can be revoked.

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid        NOT NULL REFERENCES auth_users (id) ON DELETE CASCADE,
    token      text        UNIQUE NOT NULL,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx   ON refresh_tokens (token);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx    ON refresh_tokens (user_id);

-- ── Seed existing users from profiles ─────────────────────────────────────
-- Existing profiles already have UUIDs from Supabase. We insert matching rows
-- into auth_users so foreign keys and all result/group/witness data are intact.
-- Users will authenticate via magic link on their first login after migration.

INSERT INTO auth_users (id, email, created_at)
SELECT id, email, created_at
FROM   profiles
WHERE  email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- ── oauth_states ──────────────────────────────────────────────────────────
-- Short-lived CSRF state tokens for the Google OAuth2 flow.

CREATE TABLE IF NOT EXISTS oauth_states (
    state      text        PRIMARY KEY,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
