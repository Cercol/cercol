# Cèrcol — Project Brief for Claude Code

## What is this
Cèrcol is an open-source personality assessment platform built on
peer-reviewed psychometric research, with the long-term goal of
providing scientifically grounded team role assessment.

Phase 1-3: individual personality profiling (data collection)
Phase 4+:  team role instrument built on accumulated real data

All scoring algorithms and item sources are documented and citable.

## Stack
- React + Vite (frontend — GitHub Pages, cercol.team)
- Tailwind CSS
- FastAPI + uvicorn (backend — Hetzner VPS 188.245.60.20, api.cercol.team, systemd + Caddy) [Phase 4+]
  - Caddy is shared with the topquaranta project on the same VPS. The `api.cercol.team` site block lives at `/etc/caddy/conf.d/cercol-api.caddy`, with its source of truth in this repo at `api/deploy/caddy/cercol-api.caddy`. Topquaranta's main `/etc/caddy/Caddyfile` imports the whole `conf.d/` directory so each project owns its own Caddy snippet. See `docs/decisions/0004-caddy-multi-tenant-conf-d.md` (Accepted).
- PostgreSQL 14 (Hetzner — all data, auth tables included since Phase 15)
- Auth: self-hosted (api/auth.py) — magic link (Resend), password (bcrypt direct, no passlib), Google OAuth (direct)
  - JWT: HS256 / JWT_SECRET env var (replaces Supabase ES256/JWKS). See `docs/decisions/0003-jwt-hs256-self-hosted.md` (Accepted).
  - Tokens: access token in JS module variable, refresh token in localStorage `cercol_rt`
- Supabase: NO LONGER USED. See `docs/decisions/0001-no-supabase-asyncpg-direct.md` (Accepted).
- All scoring happens client-side in JavaScript

## Deployment pipeline

### Frontend (src/**, public/**, index.html, vite.config.js)
Push to `main` → GitHub Action (`deploy-frontend.yml`) → `npm run build` → `gh-pages` → cercol.team

VITE_API_URL is set in `.env.production` (committed, non-secret — it's just the public API URL).

### Backend (api/**)
Push to `main` → GitHub Action (`deploy-backend.yml`) → SSH to Hetzner → `git pull origin main` → install `api/deploy/caddy/cercol-api.caddy` into `/etc/caddy/conf.d/` (only when changed) → `caddy validate` (rollback on failure) → `systemctl reload caddy` → `systemctl restart cercol-api` → external smoke test against `https://api.cercol.team/blog`.

Both actions trigger automatically when their respective paths change.
CI (`ci.yml`) runs on every push and PR: build, bundle sanity, frontend tests, backend tests.

### Manual deploy (emergency only)
Frontend: `npm run deploy` (builds locally and pushes dist/ to gh-pages branch)
Backend: `scp api/*.py root@188.245.60.20:/home/cercol/api/api/ && ssh root@188.245.60.20 "systemctl restart cercol-api"`
Avoid manual deploys — they desync local and server state.

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

After every `gh pr merge`, run `git checkout main && git pull` (or
`git fetch origin main` followed by branching off `origin/main`) before
starting any next branch. The squash-merge collapses your local
feature commits into a single new commit on `main`; without the sync,
the working tree of the next branch can be missing files that already
live on the remote `main` (this caused real "where did
public/og-image.png go?" confusion in Phase 17.6.x). Treat the sync as
non-optional.

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
- `api/` - FastAPI backend. Flat layout, six Python files. See `docs/architecture/backend.md` for the layout rationale and `docs/architecture/auth.md` for the auth surface.
- `.github/workflows/` - `ci.yml`, `ci-docs.yml`, `deploy-frontend.yml`, `deploy-backend.yml`.
- `docs/` - living docs (`policies/`, `architecture/`, `decisions/`, `post-mortems/`, `ops/`) plus `archive/` for decayed content.
- `scripts/` - sitemap, prerender, deploy-api, docs-coherence and spec-path validators, blog article updaters.
- `sql/`, `db/migrations/` - PostgreSQL seeds and migrations (001 through 015).

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
- Code conventions and patterns: docs/policies/conventions.md
- Architecture decisions: docs/decisions/
- Post-mortems: docs/post-mortems/

Read these files when the task requires it. CLAUDE.md is always read first.

## Patterns and pitfalls

Migrated to `docs/policies/conventions.md` (appendix). Read that
before prescribing performance fixes or SEO changes on this stack.
