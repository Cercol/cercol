-- Phase 7: Witness Cèrcol
-- witness_sessions: one row per unique witness link
-- witness_responses: domain scores submitted by a completed witness

create table if not exists witness_sessions (
  id           uuid        primary key default gen_random_uuid(),
  subject_id   uuid        not null references auth.users(id) on delete cascade,
  token        text        not null unique,
  witness_name text        not null,
  witness_email text,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists witness_responses (
  id           uuid        primary key default gen_random_uuid(),
  session_id   uuid        not null references witness_sessions(id) on delete cascade,
  domain_scores jsonb      not null,
  created_at   timestamptz not null default now()
);

-- RLS
alter table witness_sessions  enable row level security;
alter table witness_responses enable row level security;

-- Subject can read their own sessions
create policy "subject reads own sessions"
  on witness_sessions for select
  using (subject_id = auth.uid());

-- Subject can insert sessions (token validated server-side via service_role)
create policy "authenticated inserts sessions"
  on witness_sessions for insert
  with check (subject_id = auth.uid());

-- witness_responses: anyone can insert (public link flow, no auth)
-- The session token is validated by the API before inserting
create policy "public inserts responses"
  on witness_responses for insert
  with check (true);

-- Only the subject can read responses to their sessions
create policy "subject reads own responses"
  on witness_responses for select
  using (
    session_id in (
      select id from witness_sessions where subject_id = auth.uid()
    )
  );

-- Index for token lookups (hot path: witness page loads)
create index if not exists witness_sessions_token_idx on witness_sessions(token);

-- Index for subject's session list
create index if not exists witness_sessions_subject_idx on witness_sessions(subject_id);
