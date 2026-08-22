-- Progress against the authority catalogue in src/data/authority-targets.js.
--
-- The catalogue itself is not here on purpose: it is research, it belongs in
-- the repository where a change to it is reviewable in a pull request. This
-- table holds only what the operator changes from the admin screen, keyed by
-- the catalogue's own id. A target with no row here has never been touched.
CREATE TABLE IF NOT EXISTS authority_status (
  id           TEXT PRIMARY KEY,
  status       TEXT NOT NULL DEFAULT 'todo',   -- todo | doing | done | dropped
  notes        TEXT,
  issue_number INTEGER,                        -- the GitHub issue, once filed
  updated_at   TEXT NOT NULL
);
