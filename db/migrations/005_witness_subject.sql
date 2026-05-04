-- Phase 7 fix: add subject_display to witness_sessions
-- Stores the subject's display name (email) so the public witness page
-- can show who is being described without exposing auth.users directly.

alter table witness_sessions
  add column if not exists subject_display text;
