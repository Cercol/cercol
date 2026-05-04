-- Migration 011: onboarding_seen flag on profiles
-- Tracks whether the user has seen the welcome onboarding modal.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_seen BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: all existing users are considered already onboarded.
-- New users start at false (the column default) and will see the modal once.
UPDATE public.profiles
  SET onboarding_seen = TRUE
  WHERE created_at < NOW() - INTERVAL '1 second';
