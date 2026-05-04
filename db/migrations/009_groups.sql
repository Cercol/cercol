-- Phase 12.2: Team groups system
-- groups: named collections of users who share their Full Moon results with each other.
-- group_members: membership rows with a pending/active lifecycle.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists groups (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    created_by  uuid not null references auth.users(id) on delete cascade,
    created_at  timestamptz not null default now()
);

create table if not exists group_members (
    group_id        uuid not null references groups(id) on delete cascade,
    user_id         uuid references auth.users(id) on delete cascade,
    status          text not null check (status in ('pending', 'active')) default 'pending',
    invited_email   text,
    invited_at      timestamptz not null default now(),
    joined_at       timestamptz,
    primary key (group_id, invited_email) -- for unregistered invitees
);

-- Drop the primary key above and replace with a more flexible constraint set.
-- We need two unique constraints:
--   1. (group_id, user_id) when user_id is not null — prevents duplicate membership
--   2. (group_id, invited_email) when invited_email is not null — prevents duplicate invite by email
-- The composite PK above only handles the email case. Use a different approach:

alter table group_members drop constraint group_members_pkey;

create unique index group_members_user_unique
    on group_members (group_id, user_id)
    where user_id is not null;

create unique index group_members_email_unique
    on group_members (group_id, invited_email)
    where invited_email is not null;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists group_members_user_idx
    on group_members (user_id)
    where user_id is not null;

create index if not exists group_members_group_idx
    on group_members (group_id);

create index if not exists groups_created_by_idx
    on groups (created_by);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table groups enable row level security;
alter table group_members enable row level security;

-- groups: a user can read a group if they are an active member of it.
create policy "members read own groups"
    on groups for select
    using (
        exists (
            select 1 from group_members
            where group_members.group_id = groups.id
              and group_members.user_id = auth.uid()
              and group_members.status = 'active'
        )
    );

-- groups: only the creator can update the group row.
create policy "creator updates group"
    on groups for update
    using (created_by = auth.uid());

-- groups: creator can delete their group.
create policy "creator deletes group"
    on groups for delete
    using (created_by = auth.uid());

-- group_members: a user can read their own membership rows and those of active
-- co-members (so they can see who else is in a shared group).
create policy "members read own membership"
    on group_members for select
    using (
        user_id = auth.uid()
        or exists (
            select 1 from group_members gm2
            where gm2.group_id = group_members.group_id
              and gm2.user_id = auth.uid()
              and gm2.status = 'active'
        )
    );

-- group_members: only the creator of the group can remove members.
create policy "creator manages members"
    on group_members for delete
    using (
        exists (
            select 1 from groups
            where groups.id = group_members.group_id
              and groups.created_by = auth.uid()
        )
    );
