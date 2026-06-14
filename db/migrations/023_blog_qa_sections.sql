-- Migration 023: visible "Common questions" Q&A sections on top pages
-- Data-only. Appends an on-page Q&A block (markdown) to the English body of
-- the six highest-impression zero-click articles. This is visible content for
-- GEO and People Also Ask, not structured data.
--
-- Academic instrument names (Big Five, Openness, Conscientiousness, etc.) are
-- expected here: this is science/SEO body content.
--
-- Idempotent: each UPDATE is guarded by a NOT LIKE check on the marker
-- heading, so re-running appends nothing a second time. Per-page, en locale
-- only. Independent of migrations 019-022.
-- This repo has no migration runner; apply via the sanctioned workflow (see
-- docs/ops/runbook.md and .github/workflows/apply-migrations.yml).

UPDATE blog_posts SET
  content = jsonb_set(content, '{en}', to_jsonb(content->>'en' || E'\n\n## Common questions\n\n### Are there real sex differences in Big Five personality?\n\nYes, but most are small. Women tend to score higher on Agreeableness and Neuroticism, while gaps on Openness and Conscientiousness are minimal. The differences are clearer at the facet level than across the broad traits.\n\n### Which Big Five trait shows the largest sex difference?\n\nNeuroticism and Agreeableness show the most consistent gaps, with women scoring higher on average. Even so, the distributions overlap heavily, so a trait score says little about any individual.\n\n### Why are sex differences larger in more gender-equal countries?\n\nStudies repeatedly find the gaps widen, not shrink, in more egalitarian nations, the gender-equality paradox. The causes are debated, from freer self-expression to measurement effects.')),
  updated_at = now()
WHERE slug = 'gender-and-personality-what-big-five-research-says' AND content->>'en' NOT LIKE '%## Common questions%';

UPDATE blog_posts SET
  content = jsonb_set(content, '{en}', to_jsonb(content->>'en' || E'\n\n## Common questions\n\n### Which Big Five trait predicts creativity most?\n\nOpenness to Experience is by far the strongest predictor. It captures imagination, curiosity, and a taste for novelty, the raw material of creative work.\n\n### Are extraverts more creative?\n\nExtraversion has a small positive link, mostly to creative output in social or performance settings rather than to creative ability itself. Openness matters far more.\n\n### Can you be creative with low Openness?\n\nYes. Openness raises the odds, but creativity also draws on expertise, motivation, and the Conscientiousness to follow through. No single trait guarantees or blocks it.')),
  updated_at = now()
WHERE slug = 'creativity-and-personality-what-big-five-research-shows' AND content->>'en' NOT LIKE '%## Common questions%';

UPDATE blog_posts SET
  content = jsonb_set(content, '{en}', to_jsonb(content->>'en' || E'\n\n## Common questions\n\n### Does personality affect what motivates you?\n\nYes. Big Five traits shape which rewards feel meaningful, from recognition and achievement to autonomy and security. The same incentive lands differently across profiles.\n\n### Which trait is most linked to work motivation?\n\nConscientiousness drives sustained effort and goal pursuit, while Extraversion links to reward sensitivity and ambition. Both shape motivation in different ways.\n\n### Can you change what motivates you?\n\nCore drivers are fairly stable, but context shifts them. Matching a role to your profile usually works better than trying to motivate yourself against your grain.')),
  updated_at = now()
WHERE slug = 'personality-and-motivation-what-drives-each-big-five-profile' AND content->>'en' NOT LIKE '%## Common questions%';

UPDATE blog_posts SET
  content = jsonb_set(content, '{en}', to_jsonb(content->>'en' || E'\n\n## Common questions\n\n### What personality trait causes procrastination?\n\nLow Conscientiousness is the strongest correlate, especially weak self-discipline and impulsiveness. Procrastination is a self-regulation gap, not simple laziness.\n\n### Does anxiety cause procrastination?\n\nNeuroticism contributes through avoidance: putting off a threatening task gives short-term relief. It compounds the Conscientiousness effect rather than replacing it.\n\n### Can procrastinators change?\n\nStructure helps more than willpower alone. Breaking tasks down, removing friction, and building routines target the self-regulation gap directly.')),
  updated_at = now()
WHERE slug = 'personality-and-procrastination-what-research-says' AND content->>'en' NOT LIKE '%## Common questions%';

UPDATE blog_posts SET
  content = jsonb_set(content, '{en}', to_jsonb(content->>'en' || E'\n\n## Common questions\n\n### What is a forced-choice personality scale?\n\nA format that makes you pick between equally desirable options instead of rating each one. It removes the chance to simply agree with everything.\n\n### Does forced choice reduce faking?\n\nYes. By pitting traits against each other it blunts social desirability bias and is harder to game, which is why it is used in high-stakes hiring.\n\n### What are the drawbacks of forced choice?\n\nIt can feel harder to complete, and historically produced scores that compared poorly across people. Modern scoring models address much, though not all, of this.')),
  updated_at = now()
WHERE slug = 'forced-choice-personality-assessment-more-honest-data' AND content->>'en' NOT LIKE '%## Common questions%';

UPDATE blog_posts SET
  content = jsonb_set(content, '{en}', to_jsonb(content->>'en' || E'\n\n## Common questions\n\n### What is a personality facet?\n\nA facet is a narrower trait sitting under one of the Big Five. Each broad dimension breaks into several facets that capture more specific tendencies.\n\n### How many facets does the Big Five have?\n\nThe common model has 30, six under each of the five dimensions. They add detail the five broad scores alone cannot show.\n\n### Why do facets matter?\n\nTwo people with the same trait score can differ sharply at the facet level, and facets often predict real-world outcomes more precisely than the broad trait.')),
  updated_at = now()
WHERE slug = 'what-is-a-facet-in-personality-psychology' AND content->>'en' NOT LIKE '%## Common questions%';
