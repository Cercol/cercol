-- Migration 020: SEO title/meta rewrites for high-impression zero-click pages
-- Data-only rewrite (no schema change). Updates the title and meta description
-- on the RANKING locale for seven blog posts that draw impressions but earn no
-- clicks in Search Console. The new titles are shorter and lead with the search
-- intent; the page appends " . Cercol" itself, so the stored titles exclude it.
--
-- Academic instrument names (Big Five, OCEAN, IPIP) are intentional here: this
-- is title/meta SEO copy, the documented exception to the product-vocabulary
-- rule (CLAUDE.md / SEO.md).
--
-- Per-language jsonb_set touches only the one locale that ranks for each page
-- (en for six, da for the burnout page), leaving the other locales intact.
--
-- Idempotent: jsonb_set on an existing key is safe to re-run; a no-op re-run
-- only refreshes updated_at. Independent of migration 019 (events, PR #67) and
-- of migration 021 (view_count reset).
-- This repo has no migration runner; apply manually on the server (see
-- docs/ops/runbook.md):
--   sudo -u postgres psql cercol -f db/migrations/020_seo_title_meta_rewrites.sql

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Sex differences in the Big Five: the evidence"'::jsonb),
  description = jsonb_set(description, '{en}', '"Sex differences in Big Five traits are real but mostly small. What the meta-analytic evidence says about gender and personality, without the hype."'::jsonb),
  updated_at = now()
WHERE slug = 'gender-and-personality-what-big-five-research-says';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Openness and creativity: the Big Five evidence"'::jsonb),
  description = jsonb_set(description, '{en}', '"Openness to Experience is the strongest Big Five predictor of creativity. What the meta-analyses actually show about personality and creative work."'::jsonb),
  updated_at = now()
WHERE slug = 'creativity-and-personality-what-big-five-research-shows';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Forced-choice scales: how they cut faking"'::jsonb),
  description = jsonb_set(description, '{en}', '"Forced-choice scales make agreeing with everything impossible, cutting social desirability bias. How they work, what they cost, and when to use them."'::jsonb),
  updated_at = now()
WHERE slug = 'forced-choice-personality-assessment-more-honest-data';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"What is a facet? The 30 Big Five facets"'::jsonb),
  description = jsonb_set(description, '{en}', '"Big Five facets explain why two people with the same trait score behave differently. A clear guide to the 30 facets beneath the five dimensions."'::jsonb),
  updated_at = now()
WHERE slug = 'what-is-a-facet-in-personality-psychology';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Does team personality predict performance?"'::jsonb),
  description = jsonb_set(description, '{en}', '"Does the mix of Big Five traits in a team predict how it performs? What a meta-analysis of 60 studies on team composition really concludes."'::jsonb),
  updated_at = now()
WHERE slug = 'does-personality-composition-predict-team-performance';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Social desirability bias in personality tests"'::jsonb),
  description = jsonb_set(description, '{en}', '"Social desirability bias inflates Big Five scores when people answer how they think they should. How it distorts results and how to reduce it."'::jsonb),
  updated_at = now()
WHERE slug = 'social-desirability-bias-personality-tests';

UPDATE blog_posts SET
  title = jsonb_set(title, '{da}', '"Burnout og neurotisme: hvem er i risiko?"'::jsonb),
  description = jsonb_set(description, '{da}', '"Neurotisme er det Big Five-træk, der hænger tættest sammen med burnout. Se hvem der er mest udsat, og hvad forskningen siger om forebyggelse."'::jsonb),
  updated_at = now()
WHERE slug = 'personality-and-burnout-who-is-most-at-risk';
