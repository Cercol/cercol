-- =============================================================================
-- seed_dummy_team.sql — inserts dummy team "Grup de prova — La Ventijol"
-- =============================================================================
-- Prerequisites (apply in Supabase SQL editor first):
--   supabase/migrations/008_witness_identity.sql
--   supabase/migrations/009_groups.sql
--
-- Idempotent: safe to run multiple times.
-- Run in: Supabase dashboard → SQL Editor
--
-- Users (fixed UUIDs for idempotency):
--   a1b2c3d4-0001-0000-0000-000000000001  laia.navarro@ventijol.dev   R05 Eagle
--   a1b2c3d4-0002-0000-0000-000000000002  miquel.ferrer@ventijol.dev  R03 Elephant
--   a1b2c3d4-0003-0000-0000-000000000003  carme.blasco@ventijol.dev   R12 Badger
--   a1b2c3d4-0004-0000-0000-000000000004  arnau.monzo@ventijol.dev    R07 Octopus
--   a1b2c3d4-0005-0000-0000-000000000005  neus.vilar@ventijol.dev     R01 Dolphin
--   a1b2c3d4-0006-0000-0000-000000000006  pau.iborra@ventijol.dev     R02 Wolf
--   a1b2c3d4-0007-0000-0000-000000000007  roser.coll@ventijol.dev     R10 Bear
-- Password for all: ventijol-dev-2026
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. auth.users
-- =============================================================================

INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at, is_sso_user
) VALUES
    ('00000000-0000-0000-0000-000000000000',
     'a1b2c3d4-0001-0000-0000-000000000001',
     'authenticated', 'authenticated', 'laia.navarro@ventijol.dev',
     crypt('ventijol-dev-2026', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}',
     '{"first_name":"Laia"}', false, now(), now(), false),

    ('00000000-0000-0000-0000-000000000000',
     'a1b2c3d4-0002-0000-0000-000000000002',
     'authenticated', 'authenticated', 'miquel.ferrer@ventijol.dev',
     crypt('ventijol-dev-2026', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}',
     '{"first_name":"Miquel"}', false, now(), now(), false),

    ('00000000-0000-0000-0000-000000000000',
     'a1b2c3d4-0003-0000-0000-000000000003',
     'authenticated', 'authenticated', 'carme.blasco@ventijol.dev',
     crypt('ventijol-dev-2026', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}',
     '{"first_name":"Carme"}', false, now(), now(), false),

    ('00000000-0000-0000-0000-000000000000',
     'a1b2c3d4-0004-0000-0000-000000000004',
     'authenticated', 'authenticated', 'arnau.monzo@ventijol.dev',
     crypt('ventijol-dev-2026', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}',
     '{"first_name":"Arnau"}', false, now(), now(), false),

    ('00000000-0000-0000-0000-000000000000',
     'a1b2c3d4-0005-0000-0000-000000000005',
     'authenticated', 'authenticated', 'neus.vilar@ventijol.dev',
     crypt('ventijol-dev-2026', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}',
     '{"first_name":"Neus"}', false, now(), now(), false),

    ('00000000-0000-0000-0000-000000000000',
     'a1b2c3d4-0006-0000-0000-000000000006',
     'authenticated', 'authenticated', 'pau.iborra@ventijol.dev',
     crypt('ventijol-dev-2026', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}',
     '{"first_name":"Pau"}', false, now(), now(), false),

    ('00000000-0000-0000-0000-000000000000',
     'a1b2c3d4-0007-0000-0000-000000000007',
     'authenticated', 'authenticated', 'roser.coll@ventijol.dev',
     crypt('ventijol-dev-2026', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}',
     '{"first_name":"Roser"}', false, now(), now(), false)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. auth.identities  (required for email/password sign-in)
-- =============================================================================

INSERT INTO auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
) VALUES
    ('laia.navarro@ventijol.dev',
     'a1b2c3d4-0001-0000-0000-000000000001',
     '{"sub":"a1b2c3d4-0001-0000-0000-000000000001","email":"laia.navarro@ventijol.dev","email_verified":true}',
     'email', now(), now(), now()),

    ('miquel.ferrer@ventijol.dev',
     'a1b2c3d4-0002-0000-0000-000000000002',
     '{"sub":"a1b2c3d4-0002-0000-0000-000000000002","email":"miquel.ferrer@ventijol.dev","email_verified":true}',
     'email', now(), now(), now()),

    ('carme.blasco@ventijol.dev',
     'a1b2c3d4-0003-0000-0000-000000000003',
     '{"sub":"a1b2c3d4-0003-0000-0000-000000000003","email":"carme.blasco@ventijol.dev","email_verified":true}',
     'email', now(), now(), now()),

    ('arnau.monzo@ventijol.dev',
     'a1b2c3d4-0004-0000-0000-000000000004',
     '{"sub":"a1b2c3d4-0004-0000-0000-000000000004","email":"arnau.monzo@ventijol.dev","email_verified":true}',
     'email', now(), now(), now()),

    ('neus.vilar@ventijol.dev',
     'a1b2c3d4-0005-0000-0000-000000000005',
     '{"sub":"a1b2c3d4-0005-0000-0000-000000000005","email":"neus.vilar@ventijol.dev","email_verified":true}',
     'email', now(), now(), now()),

    ('pau.iborra@ventijol.dev',
     'a1b2c3d4-0006-0000-0000-000000000006',
     '{"sub":"a1b2c3d4-0006-0000-0000-000000000006","email":"pau.iborra@ventijol.dev","email_verified":true}',
     'email', now(), now(), now()),

    ('roser.coll@ventijol.dev',
     'a1b2c3d4-0007-0000-0000-000000000007',
     '{"sub":"a1b2c3d4-0007-0000-0000-000000000007","email":"roser.coll@ventijol.dev","email_verified":true}',
     'email', now(), now(), now())

ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. profiles
-- =============================================================================
-- Uses UPSERT so it works whether or not the on-new-user trigger already ran.

INSERT INTO public.profiles (id, first_name, last_name, country, native_language, premium)
VALUES
    ('a1b2c3d4-0001-0000-0000-000000000001', 'Laia',   'Navarro', 'ES', 'ca', true),
    ('a1b2c3d4-0002-0000-0000-000000000002', 'Miquel', 'Ferrer',  'ES', 'ca', true),
    ('a1b2c3d4-0003-0000-0000-000000000003', 'Carme',  'Blasco',  'ES', 'ca', true),
    ('a1b2c3d4-0004-0000-0000-000000000004', 'Arnau',  'Monzó',   'ES', 'ca', true),
    ('a1b2c3d4-0005-0000-0000-000000000005', 'Neus',   'Vilar',   'ES', 'ca', true),
    ('a1b2c3d4-0006-0000-0000-000000000006', 'Pau',    'Iborra',  'ES', 'ca', true),
    ('a1b2c3d4-0007-0000-0000-000000000007', 'Roser',  'Coll',    'ES', 'ca', true)

ON CONFLICT (id) DO UPDATE SET
    first_name      = EXCLUDED.first_name,
    last_name       = EXCLUDED.last_name,
    country         = EXCLUDED.country,
    native_language = EXCLUDED.native_language,
    premium         = EXCLUDED.premium;

-- =============================================================================
-- 4. Full Moon results  (instrument = 'fullMoon', individual domain columns)
--
-- Role assignments verified against CENTROIDS v2 in role-scoring.js:
--   R05 Eagle    P+ V+  : Laia   (presence=4.3, bond=3.9, vision=4.5, disc=2.9, depth=2.5)
--   R03 Elephant P- B+  : Miquel (presence=2.0, bond=4.8, vision=3.5, disc=3.8, depth=2.2)
--   R12 Badger   B- V-  : Carme  (presence=3.3, bond=2.5, vision=2.0, disc=4.5, depth=2.5)
--   R07 Octopus  P- V+  : Arnau  (presence=2.0, bond=3.9, vision=4.6, disc=2.5, depth=3.0)
--   R01 Dolphin  P+ B+  : Neus   (presence=4.5, bond=4.7, vision=3.8, disc=3.5, depth=2.0)
--   R02 Wolf     P+ B-  : Pau    (presence=4.4, bond=2.7, vision=3.5, disc=4.2, depth=3.5)
--   R10 Bear     B+ V-  : Roser  (presence=3.3, bond=4.6, vision=2.3, disc=4.5, depth=1.9)
-- =============================================================================

INSERT INTO public.results (id, user_id, language, instrument, presence, bond, vision, discipline, depth)
SELECT '5e550201-0000-0000-0000-000000000000', 'a1b2c3d4-0001-0000-0000-000000000001', 'ca', 'fullMoon', 4.3, 3.9, 4.5, 2.9, 2.5
WHERE NOT EXISTS (SELECT 1 FROM public.results WHERE user_id = 'a1b2c3d4-0001-0000-0000-000000000001' AND instrument = 'fullMoon');

INSERT INTO public.results (id, user_id, language, instrument, presence, bond, vision, discipline, depth)
SELECT '5e550202-0000-0000-0000-000000000000', 'a1b2c3d4-0002-0000-0000-000000000002', 'ca', 'fullMoon', 2.0, 4.8, 3.5, 3.8, 2.2
WHERE NOT EXISTS (SELECT 1 FROM public.results WHERE user_id = 'a1b2c3d4-0002-0000-0000-000000000002' AND instrument = 'fullMoon');

INSERT INTO public.results (id, user_id, language, instrument, presence, bond, vision, discipline, depth)
SELECT '5e550203-0000-0000-0000-000000000000', 'a1b2c3d4-0003-0000-0000-000000000003', 'ca', 'fullMoon', 3.3, 2.5, 2.0, 4.5, 2.5
WHERE NOT EXISTS (SELECT 1 FROM public.results WHERE user_id = 'a1b2c3d4-0003-0000-0000-000000000003' AND instrument = 'fullMoon');

INSERT INTO public.results (id, user_id, language, instrument, presence, bond, vision, discipline, depth)
SELECT '5e550204-0000-0000-0000-000000000000', 'a1b2c3d4-0004-0000-0000-000000000004', 'ca', 'fullMoon', 2.0, 3.9, 4.6, 2.5, 3.0
WHERE NOT EXISTS (SELECT 1 FROM public.results WHERE user_id = 'a1b2c3d4-0004-0000-0000-000000000004' AND instrument = 'fullMoon');

INSERT INTO public.results (id, user_id, language, instrument, presence, bond, vision, discipline, depth)
SELECT '5e550205-0000-0000-0000-000000000000', 'a1b2c3d4-0005-0000-0000-000000000005', 'ca', 'fullMoon', 4.5, 4.7, 3.8, 3.5, 2.0
WHERE NOT EXISTS (SELECT 1 FROM public.results WHERE user_id = 'a1b2c3d4-0005-0000-0000-000000000005' AND instrument = 'fullMoon');

INSERT INTO public.results (id, user_id, language, instrument, presence, bond, vision, discipline, depth)
SELECT '5e550206-0000-0000-0000-000000000000', 'a1b2c3d4-0006-0000-0000-000000000006', 'ca', 'fullMoon', 4.4, 2.7, 3.5, 4.2, 3.5
WHERE NOT EXISTS (SELECT 1 FROM public.results WHERE user_id = 'a1b2c3d4-0006-0000-0000-000000000006' AND instrument = 'fullMoon');

INSERT INTO public.results (id, user_id, language, instrument, presence, bond, vision, discipline, depth)
SELECT '5e550207-0000-0000-0000-000000000000', 'a1b2c3d4-0007-0000-0000-000000000007', 'ca', 'fullMoon', 3.3, 4.6, 2.3, 4.5, 1.9
WHERE NOT EXISTS (SELECT 1 FROM public.results WHERE user_id = 'a1b2c3d4-0007-0000-0000-000000000007' AND instrument = 'fullMoon');

-- =============================================================================
-- 5. Witness sessions (42 total: each user witnesses every other user)
--
-- Session ID encoding: 5e5500SW-... where S=subject index, W=witness index (1-7)
-- token encoding matches seed_dummy_team.py: ventijol{last4_subject}{last4_witness}padded32
-- =============================================================================

INSERT INTO public.witness_sessions (
    id, subject_id, subject_display, token,
    witness_name, witness_email, witness_user_id, completed_at
) VALUES

-- Subject: Laia (1)
('5e550012-0000-0000-0000-000000000000','a1b2c3d4-0001-0000-0000-000000000001','Laia Navarro',  'ventijol000100020000000000000000','Miquel Ferrer','miquel.ferrer@ventijol.dev','a1b2c3d4-0002-0000-0000-000000000002',now()),
('5e550013-0000-0000-0000-000000000000','a1b2c3d4-0001-0000-0000-000000000001','Laia Navarro',  'ventijol000100030000000000000000','Carme Blasco', 'carme.blasco@ventijol.dev', 'a1b2c3d4-0003-0000-0000-000000000003',now()),
('5e550014-0000-0000-0000-000000000000','a1b2c3d4-0001-0000-0000-000000000001','Laia Navarro',  'ventijol000100040000000000000000','Arnau Monzó',  'arnau.monzo@ventijol.dev',  'a1b2c3d4-0004-0000-0000-000000000004',now()),
('5e550015-0000-0000-0000-000000000000','a1b2c3d4-0001-0000-0000-000000000001','Laia Navarro',  'ventijol000100050000000000000000','Neus Vilar',   'neus.vilar@ventijol.dev',   'a1b2c3d4-0005-0000-0000-000000000005',now()),
('5e550016-0000-0000-0000-000000000000','a1b2c3d4-0001-0000-0000-000000000001','Laia Navarro',  'ventijol000100060000000000000000','Pau Iborra',   'pau.iborra@ventijol.dev',   'a1b2c3d4-0006-0000-0000-000000000006',now()),
('5e550017-0000-0000-0000-000000000000','a1b2c3d4-0001-0000-0000-000000000001','Laia Navarro',  'ventijol000100070000000000000000','Roser Coll',   'roser.coll@ventijol.dev',   'a1b2c3d4-0007-0000-0000-000000000007',now()),

-- Subject: Miquel (2)
('5e550021-0000-0000-0000-000000000000','a1b2c3d4-0002-0000-0000-000000000002','Miquel Ferrer', 'ventijol000200010000000000000000','Laia Navarro',  'laia.navarro@ventijol.dev', 'a1b2c3d4-0001-0000-0000-000000000001',now()),
('5e550023-0000-0000-0000-000000000000','a1b2c3d4-0002-0000-0000-000000000002','Miquel Ferrer', 'ventijol000200030000000000000000','Carme Blasco',  'carme.blasco@ventijol.dev', 'a1b2c3d4-0003-0000-0000-000000000003',now()),
('5e550024-0000-0000-0000-000000000000','a1b2c3d4-0002-0000-0000-000000000002','Miquel Ferrer', 'ventijol000200040000000000000000','Arnau Monzó',   'arnau.monzo@ventijol.dev',  'a1b2c3d4-0004-0000-0000-000000000004',now()),
('5e550025-0000-0000-0000-000000000000','a1b2c3d4-0002-0000-0000-000000000002','Miquel Ferrer', 'ventijol000200050000000000000000','Neus Vilar',    'neus.vilar@ventijol.dev',   'a1b2c3d4-0005-0000-0000-000000000005',now()),
('5e550026-0000-0000-0000-000000000000','a1b2c3d4-0002-0000-0000-000000000002','Miquel Ferrer', 'ventijol000200060000000000000000','Pau Iborra',    'pau.iborra@ventijol.dev',   'a1b2c3d4-0006-0000-0000-000000000006',now()),
('5e550027-0000-0000-0000-000000000000','a1b2c3d4-0002-0000-0000-000000000002','Miquel Ferrer', 'ventijol000200070000000000000000','Roser Coll',    'roser.coll@ventijol.dev',   'a1b2c3d4-0007-0000-0000-000000000007',now()),

-- Subject: Carme (3)
('5e550031-0000-0000-0000-000000000000','a1b2c3d4-0003-0000-0000-000000000003','Carme Blasco',  'ventijol000300010000000000000000','Laia Navarro',  'laia.navarro@ventijol.dev', 'a1b2c3d4-0001-0000-0000-000000000001',now()),
('5e550032-0000-0000-0000-000000000000','a1b2c3d4-0003-0000-0000-000000000003','Carme Blasco',  'ventijol000300020000000000000000','Miquel Ferrer', 'miquel.ferrer@ventijol.dev','a1b2c3d4-0002-0000-0000-000000000002',now()),
('5e550034-0000-0000-0000-000000000000','a1b2c3d4-0003-0000-0000-000000000003','Carme Blasco',  'ventijol000300040000000000000000','Arnau Monzó',   'arnau.monzo@ventijol.dev',  'a1b2c3d4-0004-0000-0000-000000000004',now()),
('5e550035-0000-0000-0000-000000000000','a1b2c3d4-0003-0000-0000-000000000003','Carme Blasco',  'ventijol000300050000000000000000','Neus Vilar',    'neus.vilar@ventijol.dev',   'a1b2c3d4-0005-0000-0000-000000000005',now()),
('5e550036-0000-0000-0000-000000000000','a1b2c3d4-0003-0000-0000-000000000003','Carme Blasco',  'ventijol000300060000000000000000','Pau Iborra',    'pau.iborra@ventijol.dev',   'a1b2c3d4-0006-0000-0000-000000000006',now()),
('5e550037-0000-0000-0000-000000000000','a1b2c3d4-0003-0000-0000-000000000003','Carme Blasco',  'ventijol000300070000000000000000','Roser Coll',    'roser.coll@ventijol.dev',   'a1b2c3d4-0007-0000-0000-000000000007',now()),

-- Subject: Arnau (4)
('5e550041-0000-0000-0000-000000000000','a1b2c3d4-0004-0000-0000-000000000004','Arnau Monzó',   'ventijol000400010000000000000000','Laia Navarro',  'laia.navarro@ventijol.dev', 'a1b2c3d4-0001-0000-0000-000000000001',now()),
('5e550042-0000-0000-0000-000000000000','a1b2c3d4-0004-0000-0000-000000000004','Arnau Monzó',   'ventijol000400020000000000000000','Miquel Ferrer', 'miquel.ferrer@ventijol.dev','a1b2c3d4-0002-0000-0000-000000000002',now()),
('5e550043-0000-0000-0000-000000000000','a1b2c3d4-0004-0000-0000-000000000004','Arnau Monzó',   'ventijol000400030000000000000000','Carme Blasco',  'carme.blasco@ventijol.dev', 'a1b2c3d4-0003-0000-0000-000000000003',now()),
('5e550045-0000-0000-0000-000000000000','a1b2c3d4-0004-0000-0000-000000000004','Arnau Monzó',   'ventijol000400050000000000000000','Neus Vilar',    'neus.vilar@ventijol.dev',   'a1b2c3d4-0005-0000-0000-000000000005',now()),
('5e550046-0000-0000-0000-000000000000','a1b2c3d4-0004-0000-0000-000000000004','Arnau Monzó',   'ventijol000400060000000000000000','Pau Iborra',    'pau.iborra@ventijol.dev',   'a1b2c3d4-0006-0000-0000-000000000006',now()),
('5e550047-0000-0000-0000-000000000000','a1b2c3d4-0004-0000-0000-000000000004','Arnau Monzó',   'ventijol000400070000000000000000','Roser Coll',    'roser.coll@ventijol.dev',   'a1b2c3d4-0007-0000-0000-000000000007',now()),

-- Subject: Neus (5)
('5e550051-0000-0000-0000-000000000000','a1b2c3d4-0005-0000-0000-000000000005','Neus Vilar',    'ventijol000500010000000000000000','Laia Navarro',  'laia.navarro@ventijol.dev', 'a1b2c3d4-0001-0000-0000-000000000001',now()),
('5e550052-0000-0000-0000-000000000000','a1b2c3d4-0005-0000-0000-000000000005','Neus Vilar',    'ventijol000500020000000000000000','Miquel Ferrer', 'miquel.ferrer@ventijol.dev','a1b2c3d4-0002-0000-0000-000000000002',now()),
('5e550053-0000-0000-0000-000000000000','a1b2c3d4-0005-0000-0000-000000000005','Neus Vilar',    'ventijol000500030000000000000000','Carme Blasco',  'carme.blasco@ventijol.dev', 'a1b2c3d4-0003-0000-0000-000000000003',now()),
('5e550054-0000-0000-0000-000000000000','a1b2c3d4-0005-0000-0000-000000000005','Neus Vilar',    'ventijol000500040000000000000000','Arnau Monzó',   'arnau.monzo@ventijol.dev',  'a1b2c3d4-0004-0000-0000-000000000004',now()),
('5e550056-0000-0000-0000-000000000000','a1b2c3d4-0005-0000-0000-000000000005','Neus Vilar',    'ventijol000500060000000000000000','Pau Iborra',    'pau.iborra@ventijol.dev',   'a1b2c3d4-0006-0000-0000-000000000006',now()),
('5e550057-0000-0000-0000-000000000000','a1b2c3d4-0005-0000-0000-000000000005','Neus Vilar',    'ventijol000500070000000000000000','Roser Coll',    'roser.coll@ventijol.dev',   'a1b2c3d4-0007-0000-0000-000000000007',now()),

-- Subject: Pau (6)
('5e550061-0000-0000-0000-000000000000','a1b2c3d4-0006-0000-0000-000000000006','Pau Iborra',    'ventijol000600010000000000000000','Laia Navarro',  'laia.navarro@ventijol.dev', 'a1b2c3d4-0001-0000-0000-000000000001',now()),
('5e550062-0000-0000-0000-000000000000','a1b2c3d4-0006-0000-0000-000000000006','Pau Iborra',    'ventijol000600020000000000000000','Miquel Ferrer', 'miquel.ferrer@ventijol.dev','a1b2c3d4-0002-0000-0000-000000000002',now()),
('5e550063-0000-0000-0000-000000000000','a1b2c3d4-0006-0000-0000-000000000006','Pau Iborra',    'ventijol000600030000000000000000','Carme Blasco',  'carme.blasco@ventijol.dev', 'a1b2c3d4-0003-0000-0000-000000000003',now()),
('5e550064-0000-0000-0000-000000000000','a1b2c3d4-0006-0000-0000-000000000006','Pau Iborra',    'ventijol000600040000000000000000','Arnau Monzó',   'arnau.monzo@ventijol.dev',  'a1b2c3d4-0004-0000-0000-000000000004',now()),
('5e550065-0000-0000-0000-000000000000','a1b2c3d4-0006-0000-0000-000000000006','Pau Iborra',    'ventijol000600050000000000000000','Neus Vilar',    'neus.vilar@ventijol.dev',   'a1b2c3d4-0005-0000-0000-000000000005',now()),
('5e550067-0000-0000-0000-000000000000','a1b2c3d4-0006-0000-0000-000000000006','Pau Iborra',    'ventijol000600070000000000000000','Roser Coll',    'roser.coll@ventijol.dev',   'a1b2c3d4-0007-0000-0000-000000000007',now()),

-- Subject: Roser (7)
('5e550071-0000-0000-0000-000000000000','a1b2c3d4-0007-0000-0000-000000000007','Roser Coll',    'ventijol000700010000000000000000','Laia Navarro',  'laia.navarro@ventijol.dev', 'a1b2c3d4-0001-0000-0000-000000000001',now()),
('5e550072-0000-0000-0000-000000000000','a1b2c3d4-0007-0000-0000-000000000007','Roser Coll',    'ventijol000700020000000000000000','Miquel Ferrer', 'miquel.ferrer@ventijol.dev','a1b2c3d4-0002-0000-0000-000000000002',now()),
('5e550073-0000-0000-0000-000000000000','a1b2c3d4-0007-0000-0000-000000000007','Roser Coll',    'ventijol000700030000000000000000','Carme Blasco',  'carme.blasco@ventijol.dev', 'a1b2c3d4-0003-0000-0000-000000000003',now()),
('5e550074-0000-0000-0000-000000000000','a1b2c3d4-0007-0000-0000-000000000007','Roser Coll',    'ventijol000700040000000000000000','Arnau Monzó',   'arnau.monzo@ventijol.dev',  'a1b2c3d4-0004-0000-0000-000000000004',now()),
('5e550075-0000-0000-0000-000000000000','a1b2c3d4-0007-0000-0000-000000000007','Roser Coll',    'ventijol000700050000000000000000','Neus Vilar',    'neus.vilar@ventijol.dev',   'a1b2c3d4-0005-0000-0000-000000000005',now()),
('5e550076-0000-0000-0000-000000000000','a1b2c3d4-0007-0000-0000-000000000007','Roser Coll',    'ventijol000700060000000000000000','Pau Iborra',    'pau.iborra@ventijol.dev',   'a1b2c3d4-0006-0000-0000-000000000006',now())

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. Witness responses  (domain_scores = noisy version of subject's self-report)
--
-- Response ID encoding: 5e5501SW-... matching the session above.
-- Noise ≈ ±0.3, clamped to [1,5].
-- =============================================================================

INSERT INTO public.witness_responses (id, session_id, domain_scores)
VALUES

-- Responses about Laia (P=4.3 B=3.9 V=4.5 D=2.9 N=2.5)
('5e550112-0000-0000-0000-000000000000','5e550012-0000-0000-0000-000000000000','{"presence":4.1,"bond":4.2,"vision":4.3,"discipline":3.2,"depth":2.3}'),
('5e550113-0000-0000-0000-000000000000','5e550013-0000-0000-0000-000000000000','{"presence":4.5,"bond":3.7,"vision":4.8,"discipline":2.7,"depth":2.8}'),
('5e550114-0000-0000-0000-000000000000','5e550014-0000-0000-0000-000000000000','{"presence":4.0,"bond":4.1,"vision":4.4,"discipline":3.0,"depth":2.2}'),
('5e550115-0000-0000-0000-000000000000','5e550015-0000-0000-0000-000000000000','{"presence":4.4,"bond":3.8,"vision":4.6,"discipline":2.6,"depth":2.7}'),
('5e550116-0000-0000-0000-000000000000','5e550016-0000-0000-0000-000000000000','{"presence":4.2,"bond":3.6,"vision":4.3,"discipline":3.1,"depth":2.4}'),
('5e550117-0000-0000-0000-000000000000','5e550017-0000-0000-0000-000000000000','{"presence":4.6,"bond":4.0,"vision":4.7,"discipline":2.8,"depth":2.6}'),

-- Responses about Miquel (P=2.0 B=4.8 V=3.5 D=3.8 N=2.2)
('5e550121-0000-0000-0000-000000000000','5e550021-0000-0000-0000-000000000000','{"presence":2.2,"bond":4.6,"vision":3.3,"discipline":4.0,"depth":2.0}'),
('5e550123-0000-0000-0000-000000000000','5e550023-0000-0000-0000-000000000000','{"presence":1.8,"bond":5.0,"vision":3.7,"discipline":3.6,"depth":2.4}'),
('5e550124-0000-0000-0000-000000000000','5e550024-0000-0000-0000-000000000000','{"presence":2.3,"bond":4.7,"vision":3.4,"discipline":3.9,"depth":2.1}'),
('5e550125-0000-0000-0000-000000000000','5e550025-0000-0000-0000-000000000000','{"presence":1.9,"bond":4.9,"vision":3.6,"discipline":3.7,"depth":2.5}'),
('5e550126-0000-0000-0000-000000000000','5e550026-0000-0000-0000-000000000000','{"presence":2.1,"bond":4.5,"vision":3.2,"discipline":4.1,"depth":1.9}'),
('5e550127-0000-0000-0000-000000000000','5e550027-0000-0000-0000-000000000000','{"presence":2.4,"bond":4.8,"vision":3.8,"discipline":3.5,"depth":2.3}'),

-- Responses about Carme (P=3.3 B=2.5 V=2.0 D=4.5 N=2.5)
('5e550131-0000-0000-0000-000000000000','5e550031-0000-0000-0000-000000000000','{"presence":3.5,"bond":2.3,"vision":2.2,"discipline":4.3,"depth":2.7}'),
('5e550132-0000-0000-0000-000000000000','5e550032-0000-0000-0000-000000000000','{"presence":3.1,"bond":2.7,"vision":1.8,"discipline":4.7,"depth":2.3}'),
('5e550134-0000-0000-0000-000000000000','5e550034-0000-0000-0000-000000000000','{"presence":3.4,"bond":2.4,"vision":2.1,"discipline":4.4,"depth":2.6}'),
('5e550135-0000-0000-0000-000000000000','5e550035-0000-0000-0000-000000000000','{"presence":3.2,"bond":2.6,"vision":2.3,"discipline":4.6,"depth":2.4}'),
('5e550136-0000-0000-0000-000000000000','5e550036-0000-0000-0000-000000000000','{"presence":3.6,"bond":2.2,"vision":1.9,"discipline":4.8,"depth":2.8}'),
('5e550137-0000-0000-0000-000000000000','5e550037-0000-0000-0000-000000000000','{"presence":3.0,"bond":2.8,"vision":2.4,"discipline":4.3,"depth":2.2}'),

-- Responses about Arnau (P=2.0 B=3.9 V=4.6 D=2.5 N=3.0)
('5e550141-0000-0000-0000-000000000000','5e550041-0000-0000-0000-000000000000','{"presence":2.2,"bond":3.7,"vision":4.4,"discipline":2.7,"depth":2.8}'),
('5e550142-0000-0000-0000-000000000000','5e550042-0000-0000-0000-000000000000','{"presence":1.8,"bond":4.1,"vision":4.8,"discipline":2.3,"depth":3.2}'),
('5e550143-0000-0000-0000-000000000000','5e550043-0000-0000-0000-000000000000','{"presence":2.3,"bond":3.8,"vision":4.5,"discipline":2.6,"depth":2.9}'),
('5e550145-0000-0000-0000-000000000000','5e550045-0000-0000-0000-000000000000','{"presence":1.9,"bond":4.0,"vision":4.7,"discipline":2.4,"depth":3.1}'),
('5e550146-0000-0000-0000-000000000000','5e550046-0000-0000-0000-000000000000','{"presence":2.1,"bond":3.6,"vision":4.3,"discipline":2.8,"depth":2.7}'),
('5e550147-0000-0000-0000-000000000000','5e550047-0000-0000-0000-000000000000','{"presence":2.4,"bond":4.2,"vision":4.9,"discipline":2.2,"depth":3.3}'),

-- Responses about Neus (P=4.5 B=4.7 V=3.8 D=3.5 N=2.0)
('5e550151-0000-0000-0000-000000000000','5e550051-0000-0000-0000-000000000000','{"presence":4.3,"bond":4.5,"vision":3.6,"discipline":3.7,"depth":1.8}'),
('5e550152-0000-0000-0000-000000000000','5e550052-0000-0000-0000-000000000000','{"presence":4.7,"bond":4.9,"vision":4.0,"discipline":3.3,"depth":2.2}'),
('5e550153-0000-0000-0000-000000000000','5e550053-0000-0000-0000-000000000000','{"presence":4.4,"bond":4.6,"vision":3.7,"discipline":3.6,"depth":1.9}'),
('5e550154-0000-0000-0000-000000000000','5e550054-0000-0000-0000-000000000000','{"presence":4.6,"bond":4.8,"vision":3.9,"discipline":3.4,"depth":2.1}'),
('5e550156-0000-0000-0000-000000000000','5e550056-0000-0000-0000-000000000000','{"presence":4.2,"bond":4.4,"vision":3.5,"discipline":3.8,"depth":1.7}'),
('5e550157-0000-0000-0000-000000000000','5e550057-0000-0000-0000-000000000000','{"presence":4.8,"bond":5.0,"vision":4.1,"discipline":3.2,"depth":2.3}'),

-- Responses about Pau (P=4.4 B=2.7 V=3.5 D=4.2 N=3.5)
('5e550161-0000-0000-0000-000000000000','5e550061-0000-0000-0000-000000000000','{"presence":4.2,"bond":2.9,"vision":3.3,"discipline":4.4,"depth":3.3}'),
('5e550162-0000-0000-0000-000000000000','5e550062-0000-0000-0000-000000000000','{"presence":4.6,"bond":2.5,"vision":3.7,"discipline":4.0,"depth":3.7}'),
('5e550163-0000-0000-0000-000000000000','5e550063-0000-0000-0000-000000000000','{"presence":4.3,"bond":2.8,"vision":3.4,"discipline":4.3,"depth":3.4}'),
('5e550164-0000-0000-0000-000000000000','5e550064-0000-0000-0000-000000000000','{"presence":4.5,"bond":2.6,"vision":3.6,"discipline":4.1,"depth":3.6}'),
('5e550165-0000-0000-0000-000000000000','5e550065-0000-0000-0000-000000000000','{"presence":4.1,"bond":3.0,"vision":3.2,"discipline":4.5,"depth":3.2}'),
('5e550167-0000-0000-0000-000000000000','5e550067-0000-0000-0000-000000000000','{"presence":4.7,"bond":2.4,"vision":3.8,"discipline":3.9,"depth":3.8}'),

-- Responses about Roser (P=3.3 B=4.6 V=2.3 D=4.5 N=1.9)
('5e550171-0000-0000-0000-000000000000','5e550071-0000-0000-0000-000000000000','{"presence":3.5,"bond":4.4,"vision":2.1,"discipline":4.7,"depth":1.7}'),
('5e550172-0000-0000-0000-000000000000','5e550072-0000-0000-0000-000000000000','{"presence":3.1,"bond":4.8,"vision":2.5,"discipline":4.3,"depth":2.1}'),
('5e550173-0000-0000-0000-000000000000','5e550073-0000-0000-0000-000000000000','{"presence":3.4,"bond":4.5,"vision":2.2,"discipline":4.6,"depth":1.8}'),
('5e550174-0000-0000-0000-000000000000','5e550074-0000-0000-0000-000000000000','{"presence":3.2,"bond":4.7,"vision":2.4,"discipline":4.4,"depth":2.0}'),
('5e550175-0000-0000-0000-000000000000','5e550075-0000-0000-0000-000000000000','{"presence":3.6,"bond":4.3,"vision":2.0,"discipline":4.8,"depth":1.6}'),
('5e550176-0000-0000-0000-000000000000','5e550076-0000-0000-0000-000000000000','{"presence":3.0,"bond":4.9,"vision":2.6,"discipline":4.2,"depth":2.2}')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. Group
-- =============================================================================

INSERT INTO public.groups (id, name, created_by, created_at)
VALUES (
    'b9c8d7e6-0000-0000-0000-000000000001',
    'Grup de prova — La Ventijol',
    'a1b2c3d4-0001-0000-0000-000000000001',  -- Laia is the creator
    now()
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. Group members  (all 7 users, status = active)
-- group_members has no primary key; use WHERE NOT EXISTS for idempotency.
-- =============================================================================

INSERT INTO public.group_members (group_id, user_id, invited_email, status, invited_at, joined_at)
SELECT 'b9c8d7e6-0000-0000-0000-000000000001', u.id, u.email, 'active', now(), now()
FROM (VALUES
    ('a1b2c3d4-0001-0000-0000-000000000001'::uuid, 'laia.navarro@ventijol.dev'),
    ('a1b2c3d4-0002-0000-0000-000000000002'::uuid, 'miquel.ferrer@ventijol.dev'),
    ('a1b2c3d4-0003-0000-0000-000000000003'::uuid, 'carme.blasco@ventijol.dev'),
    ('a1b2c3d4-0004-0000-0000-000000000004'::uuid, 'arnau.monzo@ventijol.dev'),
    ('a1b2c3d4-0005-0000-0000-000000000005'::uuid, 'neus.vilar@ventijol.dev'),
    ('a1b2c3d4-0006-0000-0000-000000000006'::uuid, 'pau.iborra@ventijol.dev'),
    ('a1b2c3d4-0007-0000-0000-000000000007'::uuid, 'roser.coll@ventijol.dev')
) AS u(id, email)
WHERE NOT EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = 'b9c8d7e6-0000-0000-0000-000000000001'
      AND gm.user_id  = u.id
);

COMMIT;
