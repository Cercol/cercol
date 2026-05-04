-- Migration 002: add user_id to results
--
-- Nullable FK so existing anonymous rows are preserved unchanged.
-- Authenticated users will have user_id populated when logging results.
-- Run in Supabase SQL editor after migration 001.

alter table public.results
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists results_user_id_idx
  on public.results (user_id)
  where user_id is not null;

-- Allow authenticated users to read their own results.
-- The existing anonymous insert policy remains unchanged.
create policy "Users can view own results"
  on public.results for select
  using (auth.uid() = user_id);
