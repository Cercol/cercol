# Cèrcol — Project Brief for Claude Code

## What is this
Cèrcol is an open-source personality assessment platform built on
peer-reviewed psychometric research, with the long-term goal of
providing scientifically grounded team role assessment.

Phase 1-3: individual personality profiling (data collection)
Phase 4+:  team role instrument built on accumulated real data

All scoring algorithms and item sources are documented and citable.

## Stack (since the Cloudflare migration, 2026-08-17)
- React + Vite (frontend), served as Cloudflare static assets by the Worker `cercol-web` (`web/wrangler.jsonc`) at cercol.team; www 301s to the apex
- Tailwind CSS
- API: Cloudflare Worker `cercol-api` (`worker/`, plain JS, no framework) at api.cercol.team. Cloudflare account "cercol". Free plan: 10 ms CPU per invocation, 50 subrequests, 5 cron triggers, 100k requests/day; the daily brief watches these
- Data: Cloudflare D1 `cercol` (SQLite; schema in `worker/schema/`) and KV `NORMS` (caches, links-sweep cursor). `db/migrations/001..094` are the frozen Postgres history
- Auth: self-hosted (`worker/src/auth.js`): magic link (Resend) and Google OAuth. Passwords retired (410; bcrypt does not fit the CPU budget)
  - JWT: HS256 / JWT_SECRET secret, aud `authenticated`, 1 h. See `docs/decisions/0003-jwt-hs256-self-hosted.md` (Accepted)
  - Tokens: access token in JS module variable, refresh token in localStorage `cercol_rt`
- Mail: Resend sends (noreply@cercol.team); Purelymail holds the mailboxes (hello@, miquel@, admin@). See `docs/ops/email.md`
- SEO data: BigQuery project `cercol` (`worker/src/bigquery.js`, service account, no SDK)
- Hetzner: decommissioned 2026-08-19 (services stopped, Caddy block retired, final Postgres dump at `~/.cercol-migration/backups/`). `api/` is the retired FastAPI, kept in the repo for its tests and history only. See `docs/decisions/0020-cloudflare-workers-d1-purelymail.md`
- Supabase: NO LONGER USED. See `docs/decisions/0001-no-supabase-asyncpg-direct.md` (Accepted).
- All scoring happens client-side in JavaScript

## Deployment pipeline

### Frontend (src/**, public/**, index.html, vite.config.js, scripts/**, db/migrations/**)
Push to `main` → GitHub Action (`deploy-frontend.yml`) → tests → `npm run build:full` (vite + puppeteer prerender of ~650 routes, reading the API) → internal link integrity guard → `wrangler deploy --config web/wrangler.jsonc` → cercol.team. Also nightly at 03:20 UTC. The GitHub Pages fallback publish was dropped on 2026-08-19.

VITE_API_URL is set in `.env.production` (committed, non-secret — it's just the public API URL).

### API (worker/**)
Push to `main` → GitHub Action (`deploy-worker.yml`) → `vitest run worker/test` → `wrangler deploy --config worker/wrangler.jsonc` → smoke test on `/health` and `/blog`.

Secrets live on the Worker (`wrangler secret put NAME --config worker/wrangler.jsonc`), never in the repo. GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

CI (`ci.yml`) runs on every push and PR: build, bundle sanity, frontend + worker tests, backend tests. `ci-docs.yml`: markdownlint, lychee, docs coherence.

### Manual deploy (emergency only)
API: `CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… npx wrangler deploy --config worker/wrangler.jsonc`
Frontend: same with `web/wrangler.jsonc` after `npm run build:full`.
Avoid manual deploys: they desync local and deployed state. Runbook: `docs/ops/runbook.md`.

### Scheduled jobs
Five cron triggers on `cercol-api` (`worker/src/scheduled.js`): 04:00 daily (purge-tokens, group-nudge, links-tick, daily-brief), 05:00 daily (seo-anomalies), Sun 03:00 (bing-ingest), Sun 04:00 (pagespeed-ingest), Mon 09:00 (weekly-digest). Run any now: `POST /admin/jobs/<name>?dry_run=1` with an admin JWT.

## Design system (mm-design)
All design tokens come from **mm-design** (https://github.com/miquelmatoses/mm-design), installed as an npm git dependency.
GitHub repository: https://github.com/cercol/cercol (transferred to the `cercol` org — April 2026).
`src/design/tokens.js` is a re-export shim — it re-exports everything from mm-design. NEVER add local token values there.
`src/components/MoonIcons.jsx` is a re-export shim — it re-exports from mm-design. NEVER create new icons in this repo.
If a new icon is needed, add it to mm-design first (SVG + React export), then it appears here automatically.
NEVER hardcode hex color values. Always import from tokens or use `var(--mm-*)` CSS custom properties.
Brand palette: `#cf3339` red · `#0047ba` blue · `#f1c22f` yellow · `#427c42` green.
Typography: Playfair Display (headings/display) + Roboto (body/UI).
README badges must use mm-design palette: `cf3339`, `0047ba`, `f1c22f`, `427c42`, `111111`.

## Code conventions

General code conventions (English comments, no em dashes, snippets
only in PR descriptions, `# Spec:` markers) live in
`docs/policies/conventions.md`. The bullets below are the
Cèrcol-specific product conventions that stay here because they are
tied to the instrument vocabulary and assets.

- Comments and docstrings always in English
- Component names in PascalCase
- User-facing text in six languages: English, Catalan/Valencian, Spanish, French, German, Danish (via react-i18next)
- No inline styles, always Tailwind classes
- Keep components small and single-responsibility
- NEVER use academic instrument names in user-facing text or comments:
  use "New Moon Cèrcol", "First Quarter Cèrcol", "Full Moon Cèrcol", never "TIPI", "IPIP", "Big Five", "NEO"
- NEVER use "observer" anywhere — always "Witness" (EN) / "Testimoni" (CA) / "Testigo" (ES) / "Témoin" (FR) / "Zeuge/Zeugin" (DE) / "Vidne" (DA) — see PRODUCT.md
- All instrument pages use English phase names as base:
  NewMoonPage.jsx, FirstQuarterPage.jsx, FullMoonPage.jsx, LastQuarterPage.jsx
- All instruments are based on IPIP (public domain). Never introduce items from
  copyrighted instruments (NEO-PI-R, BFI-2, etc.)
- All icons live in `src/components/MoonIcons.jsx`. Never create inline SVG outside this file.
  Use `RoleIcon({ role, size })` and `DimensionIcon({ domain, size })` wrappers for role/dimension icons.
  Potrace SVGs are imported as `import raw from './path.svg?raw'` (Vite raw string).
- **Exception — Google logo in `AuthPage.jsx`**: The Google OAuth button contains an inline SVG
  with Google's official brand colours (#4285F4, #34A853, #FBBC05, #EA4335). These cannot be
  replaced with mm-design tokens because Google's brand guidelines require exact colour reproduction.
  This is the only permitted inline SVG exception outside MoonIcons.jsx.

## Claude Code workflow
After completing a phase (frontend or backend), Claude Code must:
1. Mark the current phase as ✅ COMPLETE in ROADMAP.md
2. Update the phase description to reflect exactly what was implemented
   (remove items not done, add relevant notes if needed)
3. Do not modify any other section of ROADMAP.md
4. Run: git add -A && git commit -m "chore: complete [phase name]" && git push origin main

GitHub Actions will auto-deploy whatever changed (frontend, backend, or both).
Do NOT run `npm run deploy` manually — the Action does it.
This applies to every phase, without exception.

Work always from the single canonical clone at
`/Users/miquelmatoses/Claude/cercol`. Do NOT create `git worktree`
checkouts of feature branches; they fragment the working tree across
directories and make the squash-merge sync invisible to the operator
who is staring at the canonical clone. The user looks at this path
and expects files merged on `main` to appear here. When a sub-agent
or sprint operates inside a worktree the operator does not see, every
file added on `main` is "missing" from their point of view; this
caused real "where did public/og-image.png go?" confusion in Phase
17.6.x.

After every `gh pr merge`, in the canonical clone, run:

```
git checkout main && git pull
```

Treat the sync as non-optional. Feature branches live on this same
clone; switch back to `main` and create the next branch from there
once a PR merges.

## i18n
User-facing strings live in src/locales/{lang}.json (react-i18next).
One file per language, key-value format.
Test item text (questions) uses { en, ca, es, ... } structure inside data files.
Future: migrate to a spreadsheet or translation management tool
(Tolgee, Localazy, or Google Sheets export) if managing more than five languages.

## Adding new languages

When adding a new language to Cèrcol:
1. Create `src/locales/{lang}.json` with full UI string translations.
2. Add the `{lang}` key to every item's `text` object in `src/data/new-moon.js`,
   `src/data/first-quarter.js`, and `src/data/full-moon.js`.
3. The translation of test items must follow the methodology documented in SCIENCE.md:
   direct translation from English, psychological meaning preserved exactly, reviewed
   by a human with knowledge of both the source language and the psychometric context.
   NEVER use machine translation without human review for test items — item wording
   has direct effects on what construct is being measured.
4. Document the translation methodology in SCIENCE.md.
5. Update `src/i18n.js` to import the new locale and add browser detection.
6. Add the new language code and label to the `LANGS` array in `src/components/LanguageToggle.jsx`.

## File structure

- `src/` - React SPA. `components/` plus `components/ui/` and `components/report/`; `pages/` (route-level, includes `AdminDashboardPage.jsx`); `context/`, `hooks/`, `lib/`, `design/`, `data/`, `utils/` (with `__tests__/`), `locales/` (six languages), `assets/`.
- `worker/` - the API: `src/` (router `index.js`, `auth`, `jwt`, `db`, `writes`, `emails` + `email-ui` design kit, `witness`, `groups`, `scoring`, `norms`, `stripe`, `admin`, `seo`, `blog-admin`, `links`, `bigquery`, `scheduled`), `src/jobs/`, `src/i18n/`, `schema/`, `test/`, `wrangler.jsonc`. See `docs/architecture/backend.md` and `docs/architecture/auth.md`.
- `web/` - `wrangler.jsonc` for the static-assets Worker that serves `dist/`.
- `api/` - the retired FastAPI (Hetzner decommissioned 2026-08-19); `api/tests/test_internal_links_integrity.py` still guards the prerendered dist.
- `.github/workflows/` - `ci.yml`, `ci-docs.yml`, `deploy-frontend.yml`, `deploy-worker.yml`.
- `docs/` - living docs (`policies/`, `architecture/`, `decisions/`, `post-mortems/`, `ops/`) plus `archive/` for decayed content.
- `scripts/` - sitemap, prerender, deploy-api, docs-coherence and spec-path validators, blog article updaters.
- `sql/`, `db/migrations/` - PostgreSQL seeds and migrations (001 through 094), frozen history. New schema goes in `worker/schema/`; content changes go through the blog admin endpoints or `wrangler d1 execute cercol --remote`.

## SEO conventions

Academic instrument names (Big Five, OCEAN, IPIP, NEO, AB5C) are PROHIBITED
in all user-facing product text (CLAUDE.md § Code conventions), but are
REQUIRED in SEO contexts so search engines and LLMs can index Cèrcol correctly.

**Use academic names in:**
- `<title>` and `<meta name="description">` tags
- JSON-LD structured data (WebApplication, FAQPage, Organization)
- `/science` public page and any `/blog` or `/guides` content
- GitHub README.md and llms.txt
- Open Graph tags (og:title, og:description)

**Never use academic names in:**
- Instrument pages (NewMoonPage, FirstQuarterPage, FullMoonPage, WitnessPage)
- Results and report pages
- Role cards, onboarding modal, any UI copy
- i18n locale keys (src/locales/*.json)
- Code comments (use Cèrcol dimension names)

Full SEO and LLM visibility strategy: SEO.md

## Extended documentation
- Phase history and roadmap: ROADMAP.md
- Scientific foundation and scoring: SCIENCE.md
- Product vocabulary, instruments and copy: PRODUCT.md
- SEO and LLM visibility strategy: SEO.md
- Backend architecture: docs/architecture/backend.md
- Auth architecture: docs/architecture/auth.md
- Operations runbook: docs/ops/runbook.md
- Email, Resend and Stalwart: docs/ops/email.md
- Code conventions and patterns: docs/policies/conventions.md
- Architecture decisions: docs/decisions/
- Post-mortems: docs/post-mortems/

Read these files when the task requires it. CLAUDE.md is always read first.

## Patterns and pitfalls

Migrated to `docs/policies/conventions.md` (appendix). Read that
before prescribing performance fixes or SEO changes on this stack.
