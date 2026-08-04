-- 064: the table the "suggest a translation" widget has been waiting for.
--
-- The panel has been built since Phase 13 and hidden behind a flag ever
-- since, because sending it anywhere would have discarded what people typed.
-- Hiding it was the honest choice at the time. It is the wrong one now: this
-- corpus turned out to carry a corrupted machine-translation token across
-- dozens of German passages, French words inside Spanish text, an
-- ungrammatical declension of "die Big Five" through whole articles, and
-- four articles with no translation at all. Six languages ship and a reader
-- who spots any of that has no way to tell us.
--
-- Deliberately anonymous. A suggestion is worth having whether or not the
-- person is signed in, and asking for an account to report a typo is how you
-- get no reports. user_id is recorded when a token happens to be present and
-- is never required.

BEGIN;

CREATE TABLE IF NOT EXISTS translation_feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  language    text NOT NULL,
  instrument  text,
  context     text,
  suggestion  text NOT NULL,
  item_id     integer,
  item_text   text,
  user_id     uuid REFERENCES auth_users(id) ON DELETE SET NULL,
  resolved_at timestamptz
);

-- The operator reads this newest-first, filtered by language, and wants the
-- unresolved ones. Partial index: resolved rows are the ones that stop
-- mattering, and they accumulate.
CREATE INDEX IF NOT EXISTS translation_feedback_open_idx
  ON translation_feedback (language, created_at DESC)
  WHERE resolved_at IS NULL;

GRANT SELECT, INSERT, UPDATE ON translation_feedback TO cercol;

COMMIT;
