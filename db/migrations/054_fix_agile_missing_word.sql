-- 054: restore a word the English lost.
--
--   "Low-Vision teams often produce retroactively that generate the same
--    action items every two weeks."
--
-- The sentence has no object. All five translations carry it correctly
-- (Catalan: "produeixen retrospectives que generen"), so the word was lost
-- in the English after the translations were made, not before.
--
-- Found by a translator working on an unrelated removal in the same file,
-- reading the English closely enough to notice a sentence that does not
-- parse. Nothing in the toolchain checks for that: check_translation.py
-- compares structure between languages, and a missing noun leaves the
-- structure intact.

BEGIN;

UPDATE blog_posts
   SET content = jsonb_set(content, '{en}',
         to_jsonb(replace(content->>'en',
           'produce retroactively that generate',
           'produce retrospectives that generate'))),
       updated_at = now()
 WHERE slug = 'personality-in-agile-teams-scrum-and-big-five'
   AND content->>'en' LIKE '%produce retroactively that generate%';

COMMIT;
