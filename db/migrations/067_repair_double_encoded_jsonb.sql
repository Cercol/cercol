-- 067: repair the jsonb 066 double-encoded.
--
-- 066 built its literals by passing json.dumps(obj) into a quoting helper
-- that already applied json.dumps. Each of title, description and content
-- therefore became a jsonb *string* holding the JSON text, rather than the
-- object it had been. 86 of 108 rows.
--
-- Nothing caught it, and it is worth being precise about why, because each
-- guard failed for a different reason:
--
--   The dry run passed, because a JSON string is valid jsonb. Postgres had
--   no reason to object.
--
--   Every UPDATE reported "UPDATE 1", because the writes succeeded. The rows
--   were found and changed exactly as asked.
--
--   The verification queries passed, because they were written as
--   length(title->>'en') > 60. On a jsonb string ->>'en' is NULL, length(NULL)
--   is NULL, and NULL > 60 is not true, so "0 titles over the limit" was
--   reported for a table where no title was readable at all. A count of
--   violations cannot distinguish "clean" from "gone".
--
-- The values survived intact inside the string, so parsing it back with
-- #>> '{}' recovers the object exactly. The CASE makes this idempotent and
-- safe to replay over a corpus that was never corrupted.
--
-- Two habits come out of this, both applied below and in scripts/:
--
--   Assert the shape, not the absence of violations. The DO block at the end
--   fails loudly if any of these columns stops being an object, which is the
--   check that would have caught this inside the dry run's transaction.
--
--   Verify with a positive count as well as a negative one. "0 over the
--   limit" and "108 readable" together say something; either alone does not.

BEGIN;

UPDATE blog_posts
   SET title       = CASE WHEN jsonb_typeof(title)       = 'string' THEN (title       #>> '{}')::jsonb ELSE title       END,
       description = CASE WHEN jsonb_typeof(description) = 'string' THEN (description #>> '{}')::jsonb ELSE description END,
       content     = CASE WHEN jsonb_typeof(content)     = 'string' THEN (content     #>> '{}')::jsonb ELSE content     END
 WHERE jsonb_typeof(title)       = 'string'
    OR jsonb_typeof(description) = 'string'
    OR jsonb_typeof(content)     = 'string';

-- The guard 066 needed. Runs inside the transaction, so a dry run of any
-- future migration that flattens one of these columns rolls back on this
-- line instead of reporting success.
DO $$
DECLARE bad integer;
BEGIN
  SELECT count(*) INTO bad FROM blog_posts
   WHERE jsonb_typeof(title)       <> 'object'
      OR jsonb_typeof(description) <> 'object'
      OR jsonb_typeof(content)     <> 'object';
  IF bad > 0 THEN
    RAISE EXCEPTION 'blog_posts: % row(s) whose title/description/content is not a jsonb object', bad;
  END IF;

  SELECT count(*) INTO bad FROM blog_posts WHERE (title->>'en') IS NULL;
  IF bad > 0 THEN
    RAISE EXCEPTION 'blog_posts: % row(s) with no readable English title', bad;
  END IF;
END $$;

COMMIT;
