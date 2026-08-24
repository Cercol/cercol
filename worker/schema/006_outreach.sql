-- Cold-outreach ledger (ops plan t76). One row per company ever written to;
-- the UNIQUE domain is the suppression list: a domain in this table is never
-- contacted again, whatever its status.
CREATE TABLE IF NOT EXISTS outreach (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  source TEXT,
  status TEXT NOT NULL DEFAULT 'sent', -- sent | replied | bounced | complained | opted_out
  subject TEXT,
  queue_file TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  note TEXT
);
