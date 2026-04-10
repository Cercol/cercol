-- =============================================================================
-- clear_dummy_team.sql — removes all seed data from seed_dummy_team.sql
-- =============================================================================
-- Idempotent: safe to run multiple times.
-- Run in: Supabase dashboard → SQL Editor
-- =============================================================================

BEGIN;

-- Delete in reverse dependency order to respect foreign keys.

-- 1. Group members
DELETE FROM public.group_members
WHERE group_id = 'b9c8d7e6-0000-0000-0000-000000000001';

-- 2. Group
DELETE FROM public.groups
WHERE id = 'b9c8d7e6-0000-0000-0000-000000000001';

-- 3. Witness responses (via witness_sessions owned by seed subjects)
DELETE FROM public.witness_responses
WHERE session_id IN (
    SELECT id FROM public.witness_sessions
    WHERE subject_id IN (
        'a1b2c3d4-0001-0000-0000-000000000001',
        'a1b2c3d4-0002-0000-0000-000000000002',
        'a1b2c3d4-0003-0000-0000-000000000003',
        'a1b2c3d4-0004-0000-0000-000000000004',
        'a1b2c3d4-0005-0000-0000-000000000005',
        'a1b2c3d4-0006-0000-0000-000000000006',
        'a1b2c3d4-0007-0000-0000-000000000007'
    )
);

-- 4. Witness sessions (as subject or witness)
DELETE FROM public.witness_sessions
WHERE subject_id IN (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'a1b2c3d4-0002-0000-0000-000000000002',
    'a1b2c3d4-0003-0000-0000-000000000003',
    'a1b2c3d4-0004-0000-0000-000000000004',
    'a1b2c3d4-0005-0000-0000-000000000005',
    'a1b2c3d4-0006-0000-0000-000000000006',
    'a1b2c3d4-0007-0000-0000-000000000007'
)
OR witness_user_id IN (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'a1b2c3d4-0002-0000-0000-000000000002',
    'a1b2c3d4-0003-0000-0000-000000000003',
    'a1b2c3d4-0004-0000-0000-000000000004',
    'a1b2c3d4-0005-0000-0000-000000000005',
    'a1b2c3d4-0006-0000-0000-000000000006',
    'a1b2c3d4-0007-0000-0000-000000000007'
);

-- 5. Full Moon results
DELETE FROM public.results
WHERE user_id IN (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'a1b2c3d4-0002-0000-0000-000000000002',
    'a1b2c3d4-0003-0000-0000-000000000003',
    'a1b2c3d4-0004-0000-0000-000000000004',
    'a1b2c3d4-0005-0000-0000-000000000005',
    'a1b2c3d4-0006-0000-0000-000000000006',
    'a1b2c3d4-0007-0000-0000-000000000007'
);

-- 6. Profiles
DELETE FROM public.profiles
WHERE id IN (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'a1b2c3d4-0002-0000-0000-000000000002',
    'a1b2c3d4-0003-0000-0000-000000000003',
    'a1b2c3d4-0004-0000-0000-000000000004',
    'a1b2c3d4-0005-0000-0000-000000000005',
    'a1b2c3d4-0006-0000-0000-000000000006',
    'a1b2c3d4-0007-0000-0000-000000000007'
);

-- 7. Auth identities (must precede auth.users deletion)
DELETE FROM auth.identities
WHERE user_id IN (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'a1b2c3d4-0002-0000-0000-000000000002',
    'a1b2c3d4-0003-0000-0000-000000000003',
    'a1b2c3d4-0004-0000-0000-000000000004',
    'a1b2c3d4-0005-0000-0000-000000000005',
    'a1b2c3d4-0006-0000-0000-000000000006',
    'a1b2c3d4-0007-0000-0000-000000000007'
);

-- 8. Auth users
DELETE FROM auth.users
WHERE id IN (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'a1b2c3d4-0002-0000-0000-000000000002',
    'a1b2c3d4-0003-0000-0000-000000000003',
    'a1b2c3d4-0004-0000-0000-000000000004',
    'a1b2c3d4-0005-0000-0000-000000000005',
    'a1b2c3d4-0006-0000-0000-000000000006',
    'a1b2c3d4-0007-0000-0000-000000000007'
);

COMMIT;
