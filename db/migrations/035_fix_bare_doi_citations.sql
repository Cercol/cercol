-- Migration 035: fix 4 unresolvable DOIs written as bare prose citations
--
-- Fourth batch, and the first one found by asking the resolver about DOIs that
-- are NOT hyperlinks. Every previous batch (031, 033, 034) was sourced from
-- external_links_check, which probes link targets only. A reference written as
--
--     (Connelly & Ones, 2010, DOI: 10.1037/a0021212)
--
-- creates no link, so that job was structurally blind to it and the batches
-- never converged. api/jobs/external_links_check.py now folds bare DOIs into
-- the same probe path, so this class stays visible from here on.
--
-- All four below 404 at doi.org. In each case the citation text (author, year)
-- identifies a real paper whose title and abstract match the claim being made,
-- and the replacement was verified against its Crossref record and returns 302.
--
--   personality-and-communication-style-direct-vs-diplomatic
--       10.1016/S0092-6566(01)00083-5 -> 10.1111/1467-6494.00148
--       (Jensen-Campbell & Graziano 2001, "Agreeableness as a Moderator of
--        Interpersonal Conflict", Journal of Personality 69(2), 323-362)
--   how-to-read-a-big-five-personality-report
--       10.1037/0003-066X.45.12.1216  -> 10.1037/0022-3514.59.6.1216
--       (Goldberg 1990, "An alternative 'description of personality': The
--        Big-Five factor structure", JPSP 59(6), 1216-1229. The broken DOI kept
--        the correct page number 1216 but carried American Psychologist's ISSN
--        0003-066X instead of JPSP's 0022-3514, which is what makes it a
--        digits error rather than a misattribution.)
--   five-personality-science-myths-that-wont-die
--       10.1037/1076-8998.4.3.295     -> 10.1177/00131649921969802
--       (Viswesvaran & Ones 1999, "Meta-Analyses of Fakability Estimates:
--        Implications for Personality Measurement", Educational and
--        Psychological Measurement 59(2), 197-210)
--   what-the-cercol-witness-instrument-measures
--       10.1037/a0021Don't            -> 10.1037/a0021212
--       (Connelly & Ones 2010, "An other perspective on personality:
--        Meta-analytic integration of observers' accuracy and predictive
--        validity", Psychological Bulletin 136(6), 1092-1122. Not a wrong
--        citation but corrupted text: the suffix was truncated mid-string and
--        an apostrophe-bearing word was spliced onto it.)
--
-- DELIBERATELY NOT FIXED HERE. Two further dead DOIs are attribution errors,
-- not digit errors, and a mechanical swap would make them worse: the citation
-- would resolve while pointing at a paper that does not support the sentence,
-- turning a visibly broken link into an invisibly false one.
--
--   five-personality-science-myths-that-wont-die, 10.1037/0021-9010.84.6.929
--       "worse performance in roles requiring creative improvisation
--        (Judge et al., 1999)". The only Big Five paper matching that citation
--        is Judge et al. 1999, Personnel Psychology 52, 621-652, which is
--        about career success (job satisfaction, income, occupational status)
--        and makes no claim about creative improvisation.
--   personality-and-communication-style-direct-vs-diplomatic, 10.1037/0022-3514.89.1.122
--       "Roberts and colleagues (2005) found that Conscientiousness was the
--        strongest Big Five predictor of communication formality, structured
--        documentation habits...". Roberts et al. 2005, Personnel Psychology
--        58, 103-139 is an investigation of the hierarchical factor structure
--        of Conscientiousness and makes no communication claim.
--
-- Both need an editorial decision (find the real source, or soften the claim
-- and drop the citation), which is not something a data migration should make.
-- They remain visible in the weekly digest until resolved.
--
-- Idempotent: replace() on an absent needle is a no-op, so a re-run only
-- refreshes updated_at. Apply through .github/workflows/apply-migrations.yml.
--
-- The DOIs this migration exists to remove, declared so the CI resolution gate
-- (scripts/check_dois.py) does not flag the very strings being deleted:
-- doi-check: retires 10.1016/S0092-6566(01)00083-5
-- doi-check: retires 10.1037/0003-066X.45.12.1216
-- doi-check: retires 10.1037/1076-8998.4.3.295
-- doi-check: retires 10.1037/a0021Don
--
-- The two knowingly-unfixed ones are declared too, so this migration's own
-- header does not fail the gate. Removing these lines is how the next
-- migration re-arms the check once the editorial decision is made:
-- doi-check: retires 10.1037/0021-9010.84.6.929
-- doi-check: retires 10.1037/0022-3514.89.1.122

BEGIN;

-- ---------------------------------------------------------------------------
-- Each statement rebuilds content by replacing the old string in every string
-- value; the jsonb_typeof guard leaves any non-string value untouched.
-- ---------------------------------------------------------------------------

-- Jensen-Campbell & Graziano 2001 (agreeableness and interpersonal conflict)
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1016/S0092-6566(01)00083-5', '10.1111/1467-6494.00148'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'personality-and-communication-style-direct-vs-diplomatic'
  AND content <> '{}'::jsonb;

-- Goldberg 1990 (Big-Five factor structure): right page, wrong journal ISSN
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/0003-066X.45.12.1216', '10.1037/0022-3514.59.6.1216'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'how-to-read-a-big-five-personality-report'
  AND content <> '{}'::jsonb;

-- Viswesvaran & Ones 1999 (fakability meta-analysis)
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/1076-8998.4.3.295', '10.1177/00131649921969802'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'five-personality-science-myths-that-wont-die'
  AND content <> '{}'::jsonb;

-- Connelly & Ones 2010: corrupted suffix. The needle carries a literal
-- apostrophe, doubled per SQL string-literal escaping.
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/a0021Don''t', '10.1037/a0021212'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'what-the-cercol-witness-instrument-measures'
  AND content <> '{}'::jsonb;

COMMIT;
