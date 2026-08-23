-- What a Witness said about the role their own answers produced.
-- Added 2026-08-23.
--
-- Its own table on purpose. This measures the instrument, never the person:
-- nothing in scoring, in the norms or in any report may read it, and keeping
-- it out of `results` and `witness_responses` is what makes that hard to get
-- wrong by accident six months from now.
--
-- computed_role is what the client says its own answers produced. The server
-- keeps witness_responses.domain_scores, so a client that lied can be caught
-- afterwards by recomputing; it is recorded rather than trusted.
CREATE TABLE IF NOT EXISTS witness_role_checks (
  id             TEXT PRIMARY KEY,
  session_id     TEXT NOT NULL REFERENCES witness_sessions(id) ON DELETE CASCADE,
  computed_role  TEXT NOT NULL,
  rival_role     TEXT NOT NULL,
  distant_role   TEXT NOT NULL,
  chosen_role    TEXT NOT NULL,
  -- 1 to 7, optional. Secondary to the forced choice: a bare agreement rating
  -- on a flattering description runs high whatever the description says.
  agreement      INTEGER,
  created_at     TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS witness_role_checks_session_idx
  ON witness_role_checks (session_id);
