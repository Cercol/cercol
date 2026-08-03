-- 055: two orphan titles over the 60-character limit.
--
-- Both ran to 64 and are truncated in search results. These four trend
-- articles exist in English only, so this is a straight fix before the
-- translations are made from them rather than after: the roles article
-- needed three correction rounds because the translating started before
-- the English was right.
--
-- The H1 inside each body repeats the title, so it moves with it.

BEGIN;

UPDATE blog_posts SET
  title   = jsonb_set(title, '{en}', '"Run clubs ate the nightclub. Meet the Dolphin."'::jsonb),
  content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', 'Run clubs ate the nightclub. If you love them, meet the Dolphin.', 'Run clubs ate the nightclub. Meet the Dolphin.'))),
  updated_at = now()
 WHERE slug = 'run-clubs-the-dolphin';

UPDATE blog_posts SET
  title   = jsonb_set(title, '{en}', '"Silent book clubs are everywhere. You might be the Octopus."'::jsonb),
  content = jsonb_set(content, '{en}', to_jsonb(replace(content->>'en', 'Everyone is joining silent book clubs. You might be the Octopus.', 'Silent book clubs are everywhere. You might be the Octopus.'))),
  updated_at = now()
 WHERE slug = 'silent-book-clubs-the-octopus';

COMMIT;
