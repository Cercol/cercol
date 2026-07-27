-- Migration 034: fix 4 broken DOIs + one journal-name error + one dead SHRM URL
--
-- Third batch, after 031 and 033. Surfaced by the Jul 27 2026 weekly digest,
-- confirmed by probing doi.org directly: every DOI below returns 404 at the
-- RESOLVER (not at the publisher), and Crossref reports "Resource not found".
-- As in the previous batches the citation TEXT (author/year/journal/volume/
-- pages) identifies a real paper and only the DOI digits are wrong; each
-- replacement was matched against its Crossref record and returns 302.
--
-- The digest under-reported this batch: its broken-links query was capped at
-- LIMIT 25 with no truncation notice, so 2 of the 5 broken URLs never reached
-- the inbox. That cap is fixed in the same PR (api/jobs/weekly_digest.py).
--
-- The article bodies live only in the DB (blog_posts.content JSONB, one
-- markdown string per language key: en/ca/es/fr/de/da), so THIS data migration
-- is the operative fix.
--
-- Per-slug mapping (old -> new):
--   does-personality-composition-predict-team-performance
--       10.1177/1059601106287988 -> 10.1037/0021-9010.92.3.595
--       (Bell 2007, "Deep-level composition variables as predictors of team
--        performance: A meta-analysis", J. Applied Psychology 92(3), 595-615)
--   what-is-the-ipip, big-five-vs-disc-vs-belbin, blind-spots-in-teams
--       10.1177/1073191106293419 -> 10.1016/j.jrp.2005.08.007
--       (Goldberg et al. 2006, "The International Personality Item Pool and the
--        future of public-domain personality measures", JRP 40, 84-96)
--       All three articles cite the SAME paper with the SAME wrong DOI, and the
--       reference lines already name JRP 40, 84-96 correctly, so this one is
--       replaced corpus-wide rather than per slug.
--   retrospectives-personality-making-them-work
--       10.2307/249549 -> 10.2307/256377
--       (Gallupe et al. 1992, "Electronic brainstorming and group size",
--        Academy of Management Journal 35(2), 350-369)
--   personality-of-successful-ceos-what-research-says
--       10.5465/amj.2011.0377 -> 10.1177/0001839211427534
--       (Chatterjee & Hambrick 2011, "Executive Personality, Capability Cues,
--        and Risk Taking", Administrative Science Quarterly 56(2), 202-237)
--       PLUS a journal-name fix: the body says *Academy of Management Journal*;
--       the paper is in Administrative Science Quarterly. The bogus 10.5465/amj
--       prefix was a fossil of that same misattribution. Exactly one
--       occurrence of the string exists per language in this article and it is
--       the Chatterjee & Hambrick reference, so the slug-scoped replace is safe.
--   personality-testing-in-hiring-what-is-legal-what-is-ethical
--       .../hr-answers/employers-use-preemployment-tests
--    -> .../toolkits/screening-means-pre-employment-testing
--       Not a DOI: SHRM retired the old HR-answers page (hard 404). The
--       replacement is SHRM's current pre-employment testing toolkit, which
--       matches what the sentence promises ("practical frameworks aligned with
--       both legal requirements").
--
-- Replacing the bare DOI substring also fixes the https://doi.org/<doi> URL
-- form, because the URL contains the bare DOI verbatim.
--
-- Idempotent: replace() on an absent needle is a no-op, so a re-run only
-- refreshes updated_at. Apply through .github/workflows/apply-migrations.yml.
--
-- The DOIs this migration exists to remove, declared so the CI resolution gate
-- (scripts/check_dois.py) does not flag the very strings being deleted:
-- doi-check: retires 10.1177/1059601106287988
-- doi-check: retires 10.1177/1073191106293419
-- doi-check: retires 10.2307/249549
-- doi-check: retires 10.5465/amj.2011.0377

BEGIN;

-- ---------------------------------------------------------------------------
-- Each statement rebuilds content by replacing the old string in every string
-- value; the jsonb_typeof guard leaves any non-string value untouched.
-- ---------------------------------------------------------------------------

-- team composition (Bell 2007)
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1177/1059601106287988', '10.1037/0021-9010.92.3.595'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'does-personality-composition-predict-team-performance'
  AND content <> '{}'::jsonb;

-- IPIP (Goldberg et al. 2006) - same paper, same wrong DOI, three articles
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1177/1073191106293419', '10.1016/j.jrp.2005.08.007'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE content::text LIKE '%10.1177/1073191106293419%'
  AND content <> '{}'::jsonb;

-- electronic brainstorming (Gallupe et al. 1992)
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.2307/249549', '10.2307/256377'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'retrospectives-personality-making-them-work'
  AND content <> '{}'::jsonb;

-- CEO personality: DOI fix AND journal-name fix (nested replace, same rebuild)
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(
                replace(
                  replace(value #>> '{}', '10.5465/amj.2011.0377', '10.1177/0001839211427534'),
                  '*Academy of Management Journal*', '*Administrative Science Quarterly*'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'personality-of-successful-ceos-what-research-says'
  AND content <> '{}'::jsonb;

-- SHRM retired page -> current pre-employment testing toolkit
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}',
                'https://www.shrm.org/topics-tools/tools/hr-answers/employers-use-preemployment-tests',
                'https://www.shrm.org/topics-tools/tools/toolkits/screening-means-pre-employment-testing'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'personality-testing-in-hiring-what-is-legal-what-is-ethical'
  AND content <> '{}'::jsonb;

COMMIT;
