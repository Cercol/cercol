-- Migration 032: auth_users.email_verified — prove email ownership before a
-- beta/premium slot can be claimed.
--
-- The "first 500 free Full Moon" grant in ensure_profile() (api/main.py) fires
-- for any authenticated account. Password signup (api/auth.py) creates an
-- account with no email verification, so one person can farm slots with
-- disposable emails. This column lets the grant require a verified email.
-- Magic-link and Google OAuth prove ownership by construction and set this TRUE
-- at account creation; password accounts start FALSE and flip TRUE on verify.
--
-- Backfill without revocation: every account that predates this migration was
-- created under the prior rules and keeps its standing (including any
-- is_beta = TRUE grant). We do this by adding the column with default TRUE
-- (Postgres fills all existing rows), then flipping the default to FALSE so
-- only NEW rows must earn verification.
--
-- Idempotent: `add column if not exists` is a no-op on re-run (it never touches
-- existing data once the column exists), and `set default false` is a no-op.
-- A re-run therefore never clobbers a legitimately-unverified newer account.

alter table public.auth_users
  add column if not exists email_verified boolean not null default true;

alter table public.auth_users
  alter column email_verified set default false;
