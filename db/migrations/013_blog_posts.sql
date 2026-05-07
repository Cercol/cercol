-- Migration 013: blog_posts table
-- Stores multilingual blog articles with draft/published workflow.

CREATE TABLE blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'published'
  title         JSONB NOT NULL DEFAULT '{}',        -- {en, ca, es, fr, de, da}
  description   JSONB NOT NULL DEFAULT '{}',        -- meta description per lang
  content       JSONB NOT NULL DEFAULT '{}',        -- markdown per lang
  cover_url     TEXT,                               -- optional image URL
  author        TEXT,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  view_count    INTEGER NOT NULL DEFAULT 0
);
