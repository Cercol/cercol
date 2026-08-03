-- 042: let a respondent say how well their report describes them.
--
-- Why: the platform has never collected a single signal about whether a
-- result lands. That gap matters more than it looks, because 41% of stored
-- results sit close enough to a second centroid that a 0.2 z shift on one
-- domain would rename their animal. Self-rated accuracy (face validity) is
-- the cheapest way to find out whether people notice.
--
-- One column, not a table: it belongs to exactly one result, it is written
-- once, and a join would buy nothing.

ALTER TABLE results
  ADD COLUMN IF NOT EXISTS accuracy_rating smallint,
  ADD COLUMN IF NOT EXISTS accuracy_rated_at timestamptz;

ALTER TABLE results DROP CONSTRAINT IF EXISTS results_accuracy_rating_check;
ALTER TABLE results ADD CONSTRAINT results_accuracy_rating_check
  CHECK (accuracy_rating IS NULL OR accuracy_rating BETWEEN 1 AND 5);

GRANT UPDATE (accuracy_rating, accuracy_rated_at) ON results TO cercol;
