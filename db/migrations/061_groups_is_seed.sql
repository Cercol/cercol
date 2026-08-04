-- 061: mark demo groups, so automation never writes to a fixture account.
--
-- The nudge job's first dry run against production proposed emailing
-- laia.navarro@ventijol.dev about a 115-day-old group with seven members and
-- no completed tests. That is the April demo fixture, and the address is not
-- a person. Migration 041 gave results and witness_sessions an is_seed flag
-- for exactly this reason; groups was missed because nothing read it until
-- now.

ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

UPDATE groups SET is_seed = true
 WHERE created_by::text LIKE 'a1b2c3d4-%'
    OR id::text LIKE 'b9c8d7e6-%';

-- Expected: 1 row, "Grup de prova - La Ventijol".
