-- 041: mark demo and seed rows so metrics can exclude them.
--
-- Why: 47 of the 82 rows in `results` were created before 2026-04-20, during
-- the demo phase, and are synthetic. The tell is a constant: 16 firstQuarter
-- rows carry depth = 5.0 exactly and 16 newMoon rows carry depth = 4.0
-- exactly. No human sample does that. Those rows were feeding the cumulative
-- totals, the cluster distribution and the population-norm counters in the
-- weekly digest, and they will feed the empirical norms once a cell reaches
-- NORM_MIN_SAMPLE.
--
-- Marking, not deleting: the flag is reversible and keeps the demo group
-- ("Grup de prova - La Ventijol") usable as a fixture for the team report.
--
-- The same applies to witness_sessions: all 48 rows are from 2026-04-07 to
-- 2026-04-10 and were inserted directly, never through POST /witness/sessions.

BEGIN;

ALTER TABLE results          ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;
ALTER TABLE witness_sessions ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

-- Demo-phase rows: everything before the cutover date.
UPDATE results SET is_seed = true WHERE created_at < TIMESTAMPTZ '2026-04-20 00:00:00+00';

-- Fixture accounts (the La Ventijol demo company) keep the flag whenever they
-- produce anything later.
UPDATE results SET is_seed = true WHERE user_id::text LIKE 'a1b2c3d4-%';

UPDATE witness_sessions SET is_seed = true
 WHERE created_at < TIMESTAMPTZ '2026-04-20 00:00:00+00'
    OR subject_id::text LIKE 'a1b2c3d4-%';

-- Partial index: every metric query filters on `NOT is_seed`, and real rows
-- are the majority, so index the exception rather than the whole column.
CREATE INDEX IF NOT EXISTS results_is_seed_idx ON results (created_at) WHERE NOT is_seed;

COMMIT;

-- Expected after this runs:
--   SELECT count(*) FROM results WHERE is_seed;      -- 47
--   SELECT count(*) FROM results WHERE NOT is_seed;  -- 35
