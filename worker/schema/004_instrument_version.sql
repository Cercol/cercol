-- Which version of the instruments produced a stored result.
--
-- # Spec: docs/policies/dataset-versions.md
--
-- Every row to date was answered with the same items: the item files have not
-- changed since collection began on 2026-06-01, verified against the git
-- history of src/data/{new-moon,first-quarter,full-moon}.js. The one commit
-- touching them corrected three DOIs in the citations, not an item. So the
-- backfill to 1 is a statement of fact, not an assumption.
--
-- The 2026-08-04 renorming deliberately does not split this: stored scores are
-- raw means on the instrument's own scale, and norms are applied at display.
ALTER TABLE results ADD COLUMN instrument_version INTEGER;
UPDATE results SET instrument_version = 1 WHERE instrument_version IS NULL;
