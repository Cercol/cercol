-- Migration 022: SEO title/meta rewrites, tranche 2
-- Data-only rewrite (no schema change). Continues migration 020: shorter,
-- intent-leading titles and descriptions on the ranking locale for eight more
-- blog posts that draw impressions but earn few clicks in Search Console.
-- The page appends " . Cercol" itself, so stored titles exclude it.
--
-- Academic instrument names (Big Five, OCEAN, IPIP) are intentional here: this
-- is title/meta SEO copy, the documented exception to the product-vocabulary
-- rule (CLAUDE.md / SEO.md).
--
-- Per-language jsonb_set touches only the ranking locale per page (en for six,
-- es for the facet page, da for the social-desirability page), leaving other
-- locales intact.
--
-- Idempotent: jsonb_set on an existing key is safe to re-run; a no-op re-run
-- only refreshes updated_at. Independent of migrations 019 (events) and 021.
-- This repo has no migration runner; apply via the sanctioned workflow (see
-- docs/ops/runbook.md and .github/workflows/apply-migrations.yml).

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"The 5 motivational profiles, explained"'::jsonb),
  description = jsonb_set(description, '{en}', '"What motivates each Big Five profile at work, from drive and recognition to autonomy. The five motivation patterns and how to lead each one."'::jsonb),
  updated_at = now()
WHERE slug = 'personality-and-motivation-what-drives-each-big-five-profile';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Procrastination and personality: the evidence"'::jsonb),
  description = jsonb_set(description, '{en}', '"Procrastination maps onto Big Five traits, not laziness. What the meta-analytic evidence says about Conscientiousness, delay, and how to counter it."'::jsonb),
  updated_at = now()
WHERE slug = 'personality-and-procrastination-what-research-says';

UPDATE blog_posts SET
  title = jsonb_set(title, '{es}', '"Qué son las facetas de la personalidad"'::jsonb),
  description = jsonb_set(description, '{es}', '"Las facetas del Big Five explican por qué dos personas con la misma puntuación actúan distinto. Guía de las 30 facetas bajo las cinco dimensiones."'::jsonb),
  updated_at = now()
WHERE slug = 'what-is-a-facet-in-personality-psychology';

UPDATE blog_posts SET
  title = jsonb_set(title, '{da}', '"Social ønskværdighed i personlighedstests"'::jsonb),
  description = jsonb_set(description, '{da}', '"Social ønskværdighed oppuster Big Five-scorer, når folk svarer, som de tror, de bør. Sådan forvrænger det resultaterne, og hvad man kan gøre."'::jsonb),
  updated_at = now()
WHERE slug = 'social-desirability-bias-personality-tests';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Does personality change over a lifetime?"'::jsonb),
  description = jsonb_set(description, '{en}', '"Big Five traits are stable but not fixed. What 50 years of longitudinal research shows about how personality shifts with age, and what stays put."'::jsonb),
  updated_at = now()
WHERE slug = 'do-personality-traits-change-over-a-lifetime';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Personality and job fit, explained"'::jsonb),
  description = jsonb_set(description, '{en}', '"Person-environment fit underpins personality hiring. What Big Five research says about matching people to roles, and where the limits are."'::jsonb),
  updated_at = now()
WHERE slug = 'personality-and-job-fit-how-to-think-about-person-environment-fit';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"The history of the Big Five"'::jsonb),
  description = jsonb_set(description, '{en}', '"The Big Five took 70 years to build, from Allport and Cattell to Goldberg. How the five-factor model of personality came to dominate psychology."'::jsonb),
  updated_at = now()
WHERE slug = 'history-of-the-big-five-from-allport-to-goldberg';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"The personality of successful CEOs"'::jsonb),
  description = jsonb_set(description, '{en}', '"Successful CEO personality looks nothing like the charismatic-extravert myth. What Big Five research says actually predicts executive performance."'::jsonb),
  updated_at = now()
WHERE slug = 'personality-of-successful-ceos-what-research-says';
