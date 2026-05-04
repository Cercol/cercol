-- Phase 12.1: Witness identity layer
-- Adds witness_user_id to witness_sessions so authenticated witnesses
-- can be linked to their profile for future team features (Last Quarter).

alter table witness_sessions
  add column if not exists witness_user_id uuid references auth.users(id) on delete set null;

-- Index: efficient lookup of sessions a user has completed as a witness
create index if not exists witness_sessions_witness_user_idx
  on witness_sessions(witness_user_id)
  where witness_user_id is not null;

-- RLS: a logged-in witness can read their own contribution records
create policy "witness reads own contributions"
  on witness_sessions for select
  using (witness_user_id = auth.uid());
