-- Migration 033: fix 5 broken DOIs across 5 blog articles + one journal-name error
--
-- A follow-up to migration 031 (which fixed a different batch). The Jul 20 2026
-- investigation found five more DOIs that 404 in every language version of the
-- article body. In each case the citation TEXT (author/year/title) identifies a
-- real paper; only the DOI digits are wrong. The corrected DOIs below each
-- resolve (302) and their Crossref metadata matches the cited work.
--
-- The article bodies live only in the DB (blog_posts.content JSONB, one markdown
-- string per language key: en/ca/es/fr/de/da). The en/es/fr/de/da bodies were
-- seeded via the admin API, not a repo migration, so THIS data migration is the
-- operative fix. Migration 025 (Catalan rewrites) also carried the broken
-- strings in its {ca} payloads; it has been retro-patched in the same PR for
-- repo/DB consistency, but 025 is NOT re-run.
--
-- Per-slug mapping (old -> new), one paper per DOI (no cross-article reuse):
--   big-five-personality-across-cultures-what-research-shows
--       10.1037/0022-3514.89.3.304  -> 10.1037/0022-3514.89.3.407
--       (McCrae et al. 2005, "Personality profiles of cultures", JPSP 89(3), 407-425)
--   history-of-the-big-five-from-allport-to-goldberg
--       10.1037/0033-2909.116.2.187 -> 10.1111/j.1744-6570.1991.tb00688.x
--       (Barrick & Mount 1991, "The Big Five ... and job performance",
--        Personnel Psychology 44(1), 1-26)
--   creativity-and-personality-what-big-five-research-shows
--       10.1037/0033-2909.123.2.207 -> 10.1207/s15327957pspr0204_5
--       (Feist 1998, "A Meta-Analysis of Personality in Scientific and Artistic
--        Creativity", Personality and Social Psychology Review 2(4), 290-309)
--       PLUS a journal-name fix: the body attributes Feist (1998) to
--       "Psychological Bulletin"; the paper is in Personality and Social
--       Psychology Review. Both `*Psychological Bulletin*` occurrences in this
--       article (inline + block-quote) are the Feist reference; no other paper
--       in this article uses that journal, so the slug-scoped replace is safe.
--   job-satisfaction-personality-what-predicts-it
--       10.1080/10478400109595951   -> 10.1207/s15327965pli1104_01
--       (Deci & Ryan 2000, "The 'What' and 'Why' of Goal Pursuits",
--        Psychological Inquiry 11(4), 227-268)
--   software-engineer-personality-what-research-shows
--       10.1145/1822376.1822380     -> 10.1145/1734103.1734111
--       (Capretz & Ahmed 2010, "Why do we need personality diversity in
--        software engineering?", ACM SIGSOFT SEN 35(2), 1-11)
--
-- Replacing the bare DOI substring also fixes the https://doi.org/<doi> URL
-- form, because the URL contains the bare DOI verbatim.
--
-- Idempotent: replace() on an absent needle is a no-op, so a re-run only
-- refreshes updated_at. Apply through .github/workflows/apply-migrations.yml.

BEGIN;

-- ---------------------------------------------------------------------------
-- Per-slug DOI corrections across all language keys of content. Each statement
-- rebuilds content by replacing the old DOI in every string value; the
-- jsonb_typeof guard leaves any non-string value untouched.
-- ---------------------------------------------------------------------------

-- big-five across cultures
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/0022-3514.89.3.304', '10.1037/0022-3514.89.3.407'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'big-five-personality-across-cultures-what-research-shows'
  AND content <> '{}'::jsonb;

-- history of the big five
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1037/0033-2909.116.2.187', '10.1111/j.1744-6570.1991.tb00688.x'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'history-of-the-big-five-from-allport-to-goldberg'
  AND content <> '{}'::jsonb;

-- creativity: DOI fix AND journal-name fix (nested replace, same rebuild)
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(
                replace(
                  replace(value #>> '{}', '10.1037/0033-2909.123.2.207', '10.1207/s15327957pspr0204_5'),
                  '*Psychological Bulletin*', '*Personality and Social Psychology Review*'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'creativity-and-personality-what-big-five-research-shows'
  AND content <> '{}'::jsonb;

-- job satisfaction
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1080/10478400109595951', '10.1207/s15327965pli1104_01'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'job-satisfaction-personality-what-predicts-it'
  AND content <> '{}'::jsonb;

-- software engineer personality
UPDATE blog_posts SET content = (
  SELECT jsonb_object_agg(
    key,
    CASE WHEN jsonb_typeof(value) = 'string'
         THEN to_jsonb(replace(value #>> '{}', '10.1145/1822376.1822380', '10.1145/1734103.1734111'))
         ELSE value END)
  FROM jsonb_each(content))
WHERE slug = 'software-engineer-personality-what-research-shows'
  AND content <> '{}'::jsonb;

COMMIT;
