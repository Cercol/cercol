-- Migration 024: SEO title/meta rewrites, tranche 3
-- Data-only rewrite (no schema change). Continues migrations 020 and 022:
-- shorter, intent-leading titles and descriptions on the named locale for
-- eleven more pages (across en, es, da, de) that draw impressions but earn
-- few clicks in Search Console. The page appends " . Cercol" itself, so the
-- stored titles exclude it.
--
-- Academic instrument names (Big Five, Openness, Extraversion) are intentional
-- here: this is title/meta SEO copy, the documented exception to the
-- product-vocabulary rule (CLAUDE.md / SEO.md).
--
-- Per-language jsonb_set touches only the named locale key per statement,
-- leaving other locales intact. The extraversion page is updated twice (da
-- and de), each on its own key.
--
-- Idempotent: jsonb_set on an existing key is safe to re-run; a no-op re-run
-- only refreshes updated_at. Independent of migrations 019, 021, 023.
-- This repo has no migration runner; apply via the sanctioned workflow (see
-- docs/ops/runbook.md and .github/workflows/apply-migrations.yml).

UPDATE blog_posts SET
  title = jsonb_set(title, '{es}', '"¿La personalidad cambia a lo largo de la vida?"'::jsonb),
  description = jsonb_set(description, '{es}', '"Los rasgos del Big Five son estables pero no fijos. Qué muestran 50 años de investigación longitudinal sobre cómo cambia la personalidad con la edad."'::jsonb),
  updated_at = now()
WHERE slug = 'do-personality-traits-change-over-a-lifetime';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"What is Openness to Experience?"'::jsonb),
  description = jsonb_set(description, '{en}', '"Openness to Experience drives imagination, curiosity, and a taste for novelty. What the Big Five trait covers, how it is measured, and where its limits lie."'::jsonb),
  updated_at = now()
WHERE slug = 'what-is-openness-to-experience-creativity-curiosity-and-its-limits';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Self-other agreement in the Big Five"'::jsonb),
  description = jsonb_set(description, '{en}', '"How well do others see your personality as you do? Where self-ratings and observer ratings agree on the Big Five, and which traits show the biggest gaps."'::jsonb),
  updated_at = now()
WHERE slug = 'self-other-agreement-big-five-where-gaps-are-biggest';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Personality testing in hiring: the rules"'::jsonb),
  description = jsonb_set(description, '{en}', '"Personality testing in hiring sits between legal limits and ethical ones. What Big Five assessments can and cannot do, and where the real boundaries are."'::jsonb),
  updated_at = now()
WHERE slug = 'personality-testing-in-hiring-what-is-legal-what-is-ethical';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Critiques of the Big Five, explained"'::jsonb),
  description = jsonb_set(description, '{en}', '"The Big Five is the most replicated personality model, but not beyond criticism. What critics say about its structure, culture, and predictive limits."'::jsonb),
  updated_at = now()
WHERE slug = 'critiques-of-big-five-what-critics-say';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Personality and career choice"'::jsonb),
  description = jsonb_set(description, '{en}', '"Big Five traits predict which careers people choose and stay in. What research shows about matching personality to work, and where the effect is weak."'::jsonb),
  updated_at = now()
WHERE slug = 'personality-and-career-choice-what-big-five-predicts';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"Personality and remote work"'::jsonb),
  description = jsonb_set(description, '{en}', '"Who thrives working remotely and who struggles? What Big Five research suggests about personality, autonomy, and the traits that fit distributed work."'::jsonb),
  updated_at = now()
WHERE slug = 'personality-and-remote-work-who-thrives-who-struggles';

UPDATE blog_posts SET
  title = jsonb_set(title, '{da}', '"Hvad er ekstroversion?"'::jsonb),
  description = jsonb_set(description, '{da}', '"Ekstroversion er mere end introvert eller ekstrovert. Hvad Big Five-trækket dækker, hvordan det måles, og hvorfor det ikke er en enten-eller-skala."'::jsonb),
  updated_at = now()
WHERE slug = 'what-is-extraversion-beyond-the-introvert-extrovert-binary';

UPDATE blog_posts SET
  title = jsonb_set(title, '{de}', '"Was ist Extraversion?"'::jsonb),
  description = jsonb_set(description, '{de}', '"Extraversion ist mehr als introvertiert oder extrovertiert. Was das Big-Five-Merkmal umfasst, wie es gemessen wird und warum es kein Entweder-oder ist."'::jsonb),
  updated_at = now()
WHERE slug = 'what-is-extraversion-beyond-the-introvert-extrovert-binary';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"The Big Five across cultures"'::jsonb),
  description = jsonb_set(description, '{en}', '"Does the Big Five hold up around the world? What cross-cultural research shows about which traits replicate, which shift, and how culture shapes them."'::jsonb),
  updated_at = now()
WHERE slug = 'big-five-personality-across-cultures-what-research-shows';

UPDATE blog_posts SET
  title = jsonb_set(title, '{en}', '"How to read a Big Five report"'::jsonb),
  description = jsonb_set(description, '{en}', '"A Big Five report is percentiles, not labels. How to read your scores across the five traits, what high and low mean, and what the numbers do not say."'::jsonb),
  updated_at = now()
WHERE slug = 'how-to-read-a-big-five-personality-report';
