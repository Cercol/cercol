-- Migration 029: record the profiles.is_beta column in version control
--
-- is_beta marks a profile that claimed one of the first BETA_TOTAL (500) free
-- premium slots. The column is read and written by ensure_profile() and the
-- /beta endpoint (api/main.py) and referenced by ADR 0012, but it was added
-- directly on the production database during the beta launch and never had a
-- migration. This closes that gap so the schema is reproducible from migrations.
--
-- Idempotent and a no-op on production (the column already exists there).
-- Mirrors the shape of premium (003_premium.sql): boolean, not null, default false.

alter table public.profiles
  add column if not exists is_beta boolean not null default false;
