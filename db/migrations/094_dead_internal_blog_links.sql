-- 094: the six internal /blog/ links in the corpus that answer 404.
--
-- The May audit (docs/seo/links-audit-20260528.md) found these six slugs and
-- filed them under "resolved via redirect, NOT broken". They are broken. The
-- audit probed api.cercol.team, where blog_slug_redirects turns each of them
-- into a 308; but an in-body link is written root-relative, so a reader and a
-- crawler resolve it against cercol.team, a static host that has never heard
-- of that table. GitHub Pages answers public/404.html. Migration 016 built a
-- redirect for a hop nobody makes.
--
-- That is the same shape as the instrument-page bug in #134: a human with JS
-- recovers (the SPA fetches the API, which does honour the redirect), so the
-- links looked fine to everyone who clicked one, while Googlebot logged 66
-- hard 404s. Search Console reported it as a new "Not found (404)" reason.
--
-- Five of the six are doubled-suffix slugs left by an old rename script; the
-- sixth is a genuine rename. Targets are the same ones migration 016 mapped,
-- each re-checked live: all six answer 200 on cercol.team today.
--
-- Substituting the doubled slug is safe in either direction, because the
-- string being replaced strictly contains the string replacing it: a body
-- that already links the correct slug has no occurrence of the longer one.
--
-- blog_slug_redirects is left in place. It is what keeps the old URLs alive
-- for anything already indexed or linked off-site; this migration only stops
-- the corpus from minting new hits on it.

BEGIN;

-- Doubled suffix: "...-what-drives-each-big-five-profile" repeated.
UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  '/blog/personality-and-motivation-what-drives-each-big-five-profile-what-drives-each-big-five-profile',
                  '/blog/personality-and-motivation-what-drives-each-big-five-profile')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE strpos(content::text, '/blog/personality-and-motivation-what-drives-each-big-five-profile-what-drives-each-big-five-profile') > 0;

-- Doubled suffix: "...-what-research-says" repeated.
UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  '/blog/introverts-in-extrovert-workplaces-what-research-says-what-research-says',
                  '/blog/introverts-in-extrovert-workplaces-what-research-says')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE strpos(content::text, '/blog/introverts-in-extrovert-workplaces-what-research-says-what-research-says') > 0;

-- Doubled suffix: "...-what-big-five-predicts" repeated.
UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  '/blog/personality-and-career-choice-what-big-five-predicts-what-big-five-predicts',
                  '/blog/personality-and-career-choice-what-big-five-predicts')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE strpos(content::text, '/blog/personality-and-career-choice-what-big-five-predicts-what-big-five-predicts') > 0;

-- Doubled suffix: "...-beyond-the-introvert-extrovert-binary" repeated.
UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  '/blog/what-is-extraversion-beyond-the-introvert-extrovert-binary-beyond-the-introvert-extrovert-binary',
                  '/blog/what-is-extraversion-beyond-the-introvert-extrovert-binary')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE strpos(content::text, '/blog/what-is-extraversion-beyond-the-introvert-extrovert-binary-beyond-the-introvert-extrovert-binary') > 0;

-- Doubled suffix: "...-more-honest-data" repeated.
UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  '/blog/forced-choice-personality-assessment-more-honest-data-more-honest-data',
                  '/blog/forced-choice-personality-assessment-more-honest-data')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE strpos(content::text, '/blog/forced-choice-personality-assessment-more-honest-data-more-honest-data') > 0;

-- Genuine rename, not a doubled suffix. The article was retitled around the
-- legal/ethical framing and the slug moved with it.
UPDATE blog_posts
   SET content = (
         SELECT jsonb_object_agg(k, to_jsonb(replace(v #>> '{}',
                  '/blog/personality-testing-in-hiring-ethics-and-best-practices',
                  '/blog/personality-testing-in-hiring-what-is-legal-what-is-ethical')))
           FROM jsonb_each(content) AS e(k, v)
       ),
       updated_at = now()
 WHERE strpos(content::text, '/blog/personality-testing-in-hiring-ethics-and-best-practices') > 0;

-- Assert every dead target is gone, and that each replacement target is a
-- slug that actually exists in this database. The second half is the one
-- that matters: a typo in a replacement above would swap 66 crawlable 404s
-- for 66 different crawlable 404s and nothing would notice until the next
-- Search Console mail.
DO $$
DECLARE
  dead text;
  live text;
  n    integer;
BEGIN
  FOREACH dead IN ARRAY ARRAY[
    'personality-and-motivation-what-drives-each-big-five-profile-what-drives-each-big-five-profile',
    'introverts-in-extrovert-workplaces-what-research-says-what-research-says',
    'personality-and-career-choice-what-big-five-predicts-what-big-five-predicts',
    'what-is-extraversion-beyond-the-introvert-extrovert-binary-beyond-the-introvert-extrovert-binary',
    'forced-choice-personality-assessment-more-honest-data-more-honest-data',
    'personality-testing-in-hiring-ethics-and-best-practices'
  ] LOOP
    SELECT count(*) INTO n FROM blog_posts WHERE strpos(content::text, '/blog/' || dead) > 0;
    IF n > 0 THEN
      RAISE EXCEPTION 'blog_posts: % row(s) still link the dead slug %', n, dead;
    END IF;
  END LOOP;

  FOREACH live IN ARRAY ARRAY[
    'personality-and-motivation-what-drives-each-big-five-profile',
    'introverts-in-extrovert-workplaces-what-research-says',
    'personality-and-career-choice-what-big-five-predicts',
    'what-is-extraversion-beyond-the-introvert-extrovert-binary',
    'forced-choice-personality-assessment-more-honest-data',
    'personality-testing-in-hiring-what-is-legal-what-is-ethical'
  ] LOOP
    SELECT count(*) INTO n
      FROM blog_posts WHERE slug = live AND status = 'published';
    IF n <> 1 THEN
      RAISE EXCEPTION 'replacement target % is not a single published article (found %)', live, n;
    END IF;
  END LOOP;

  SELECT count(*) INTO n FROM blog_posts WHERE jsonb_typeof(content) <> 'object';
  IF n > 0 THEN
    RAISE EXCEPTION 'blog_posts: % row(s) with a non-object content', n;
  END IF;
END $$;

COMMIT;
