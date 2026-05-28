-- Migration 016: blog_slug_redirects table + seed redirects
-- Phase 17.10 (link integrity). Maps a dead/renamed blog slug to its
-- live successor so GET /blog/<slug> can answer 308 instead of 404.
--
-- Idempotent: safe to re-run. CREATE TABLE IF NOT EXISTS plus
-- INSERT ... ON CONFLICT DO NOTHING. Applied manually on the server
-- (this repo has no migration runner; see docs/ops/runbook.md):
--   sudo -u postgres psql cercol -f db/migrations/016_blog_slug_redirects.sql

CREATE TABLE IF NOT EXISTS blog_slug_redirects (
  slug_old    TEXT PRIMARY KEY,
  slug_new    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason      TEXT
);

-- Seed: dead slugs found by scripts/audit_blog_links.py on 2026-05-28.
-- Five are "doubled suffix" slugs left by an earlier slug-rename script
-- (confidence 1.0, the live target is the un-doubled slug). One is a
-- genuine rename (confidence 0.63). All targets verified live at audit
-- time. ON CONFLICT keeps a hand-curated row if one already exists.
INSERT INTO blog_slug_redirects (slug_old, slug_new, reason) VALUES
  ('personality-and-motivation-what-drives-each-big-five-profile-what-drives-each-big-five-profile',
   'personality-and-motivation-what-drives-each-big-five-profile',
   'doubled-suffix slug from rename script; audit 2026-05-28'),
  ('personality-and-career-choice-what-big-five-predicts-what-big-five-predicts',
   'personality-and-career-choice-what-big-five-predicts',
   'doubled-suffix slug from rename script; audit 2026-05-28'),
  ('introverts-in-extrovert-workplaces-what-research-says-what-research-says',
   'introverts-in-extrovert-workplaces-what-research-says',
   'doubled-suffix slug from rename script; audit 2026-05-28'),
  ('forced-choice-personality-assessment-more-honest-data-more-honest-data',
   'forced-choice-personality-assessment-more-honest-data',
   'doubled-suffix slug from rename script; audit 2026-05-28'),
  ('what-is-extraversion-beyond-the-introvert-extrovert-binary-beyond-the-introvert-extrovert-binary',
   'what-is-extraversion-beyond-the-introvert-extrovert-binary',
   'doubled-suffix slug from rename script; audit 2026-05-28'),
  ('personality-testing-in-hiring-ethics-and-best-practices',
   'personality-testing-in-hiring-what-is-legal-what-is-ethical',
   'renamed article; audit 2026-05-28 (confidence 0.63)'),
  -- Known case from the sprint brief. Currently DORMANT: the old slug
  -- still resolves to a live published article, so the endpoint returns
  -- it directly and this row only fires if the slug is later removed.
  ('big-five-vs-disc-vs-belbin',
   'disc-vs-big-five-why-four-styles-arent-enough',
   'slug renamed; historical scripts left dead link in published articles, see audit 2026-05-26')
ON CONFLICT (slug_old) DO NOTHING;
