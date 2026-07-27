-- Migration 039: email change tokens
--
-- Lets a signed-in user move their account to a new address. Ownership of the
-- new address is proven exactly like signup proves it: a one-time, short-lived
-- token mailed to that address.
--
-- A dedicated table rather than a `purpose` column on magic_tokens: it makes
-- token confusion impossible by construction (an email-change token can never
-- be presented to /auth/magic-link/verify), and it deploys without touching the
-- four working queries that read magic_tokens.
--
-- Run once in the Hetzner PostgreSQL cercol database:
--   sudo -u postgres psql -d cercol -f 039_email_change_tokens.sql

CREATE TABLE IF NOT EXISTS email_change_tokens (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid        NOT NULL REFERENCES auth_users (id) ON DELETE CASCADE,
    new_email  text        NOT NULL,
    token      text        UNIQUE NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at    timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_change_tokens_token_idx ON email_change_tokens (token);
CREATE INDEX IF NOT EXISTS email_change_tokens_user_idx  ON email_change_tokens (user_id);
