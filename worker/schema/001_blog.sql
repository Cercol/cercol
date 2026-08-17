-- blog_posts a D1. Els jsonb de Postgres passen a TEXT amb JSON dins:
-- SQLite els llegeix amb json_extract, que és el que fa falta per a
-- title/description/content, que són {lang: valor}.
CREATE TABLE IF NOT EXISTS blog_posts (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'draft',
  title        TEXT NOT NULL DEFAULT '{}',
  description  TEXT NOT NULL DEFAULT '{}',
  content      TEXT NOT NULL DEFAULT '{}',
  cover_url    TEXT,
  author       TEXT,
  published_at TEXT,
  created_at   TEXT,
  updated_at   TEXT,
  view_count   INTEGER NOT NULL DEFAULT 0,
  category     TEXT DEFAULT 'general',
  complexity   TEXT DEFAULT 'intermediate'
);
-- L'endpoint de llistat ordena per published_at entre els publicats.
CREATE INDEX IF NOT EXISTS blog_posts_published_idx
  ON blog_posts (status, published_at DESC);

CREATE TABLE IF NOT EXISTS blog_slug_redirects (
  slug_old   TEXT PRIMARY KEY,
  slug_new   TEXT NOT NULL,
  created_at TEXT,
  reason     TEXT
);
