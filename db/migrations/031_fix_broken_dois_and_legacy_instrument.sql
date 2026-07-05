-- Migration 031: fix 4 broken DOIs across 5 blog articles + relabel legacy instrument
--
-- PART A — DOI corrections. A weekly external-link check found four DOIs that
-- 404. In every case the citation TEXT (author/year/journal/volume/issue/page)
-- is correct; only the DOI digits are wrong. The corrected DOIs below each
-- resolve (302) and their Crossref metadata matches the printed citation.
--
-- The article bodies live only in the DB (blog_posts.content JSONB, one markdown
-- string per language key: en/ca/es/fr/de/da). The en/es/fr/de/da bodies were
-- seeded via the admin API, not a repo migration, so this data migration is the
-- operative fix. Migration 025 (Catalan rewrites) also carried the broken strings
-- in its {ca} payloads; it has been retro-patched in the same PR for repo/DB
-- consistency, but 025 is NOT re-run — THIS migration is what corrects the DB.
--
-- CRITICAL: the DOI 10.1037/0022-3514.72.3.621 was copy-pasted onto THREE
-- citations for TWO different papers, so it maps to two different correct DOIs.
-- Every UPDATE is therefore scoped by slug; a global replace is forbidden.
--
-- Per-slug mapping (old -> new):
--   sales-personality-what-traits-predict-sales-performance
--       10.1037/0021-9010.81.5.530  -> 10.1037/0021-9010.83.4.586
--       (Vinchur, Schippmann, Switzer & Roth 1998, JAP 83(4), 586-597)
--   personality-in-agile-teams-scrum-and-big-five
--       10.1037/0021-9010.85.6.868  -> 10.1111/j.1744-6570.2000.tb00214.x
--       (LePine, Colquitt & Erez 2000, Personnel Psychology 53(3), 563-593)
--   personality-and-decision-making-how-big-five-shapes-judgment
--       10.1037/0022-3514.72.3.621  -> 10.1037/0022-3514.65.4.757
--       (Zuckerman et al. 1993, JPSP 65(4), 757-768)
--   personality-and-risk-taking-who-takes-risks-at-work
--       10.1037/0022-3514.72.3.621  -> 10.1037/0022-3514.65.4.757
--       (Zuckerman et al. 1993, JPSP 65(4), 757-768)
--   personality-and-burnout-who-is-most-at-risk
--       10.1037/0022-3514.72.3.621  -> 10.1080/02678370903282600
--       (Alarcon, Eschleman & Bowling 2009, Work & Stress 23(3), 244-263)
--
-- Replacing the bare DOI substring also fixes the https://doi.org/<doi> URL form,
-- because the URL contains the bare DOI verbatim.
--
-- PART B — relabel the single legacy results row whose instrument is the
-- pre-rename name "waxingCrescent" (renamed to "firstQuarter" in commit
-- 15dba82c6). It is a genuine First Quarter test taken by the old client before
-- the rename shipped; relabel (not delete) so it counts under the right
-- instrument in the norms/digest aggregates.
--
-- Idempotent: replace() on an absent needle is a no-op, and the PART B UPDATE
-- matches zero rows on re-run. Apply through .github/workflows/apply-migrations.yml.

BEGIN;

-- ---------------------------------------------------------------------------
-- PART A — per-slug DOI corrections across all language keys of content.
-- Each statement rebuilds content by replacing the old DOI in every string
-- value; jsonb_typeof guard leaves any non-string value untouched.
-- ---------------------------------------------------------------------------

-- sales
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/0021-9010.81.5.530', '10.1037/0021-9010.83.4.586'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'sales-personality-what-traits-predict-sales-performance'
  AND content <> '{}'::jsonb;

-- agile
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/0021-9010.85.6.868', '10.1111/j.1744-6570.2000.tb00214.x'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'personality-in-agile-teams-scrum-and-big-five'
  AND content <> '{}'::jsonb;

-- decision-making
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/0022-3514.72.3.621', '10.1037/0022-3514.65.4.757'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'personality-and-decision-making-how-big-five-shapes-judgment'
  AND content <> '{}'::jsonb;

-- risk-taking
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/0022-3514.72.3.621', '10.1037/0022-3514.65.4.757'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'personality-and-risk-taking-who-takes-risks-at-work'
  AND content <> '{}'::jsonb;

-- burnout (DIFFERENT paper -> DIFFERENT DOI than the two above)
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/0022-3514.72.3.621', '10.1080/02678370903282600'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'personality-and-burnout-who-is-most-at-risk'
  AND content <> '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- PART B — relabel the pre-rename legacy instrument value.
-- ---------------------------------------------------------------------------
UPDATE results SET instrument = 'firstQuarter' WHERE instrument = 'waxingCrescent';

COMMIT;
