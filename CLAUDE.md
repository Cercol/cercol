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
- PostgreSQL 14 (Hetzner — all data, auth tables included since Phase 15)
- Auth: self-hosted (api/auth.py) — magic link (Resend), password (bcrypt), Google OAuth (direct)
  - JWT: HS256 / JWT_SECRET env var (replaces Supabase ES256/JWKS)
  - Tokens: access token in JS module variable, refresh token in localStorage `cercol_rt`
- Supabase: NO LONGER USED (migrated fully to Hetzner in Phase 15)
- All scoring happens client-side in JavaScript

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
After every successful npm run deploy, Claude Code must:
1. Mark the current phase as ✅ COMPLETE in ROADMAP.md
2. Update the phase description to reflect exactly what was implemented
   (remove items not done, add relevant notes if needed)
3. Do not modify any other section of ROADMAP.md
4. Run: git add -A && git commit -m "chore: complete [phase name]" && git push origin main
This applies to every phase, without exception.

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
src/
  components/    # UI components (AdminRoute.jsx, CercolLogo.jsx, Layout.jsx, …)
    ui/          # Reusable primitives: Button, Card, Badge, SectionLabel
    report/      # Report-specific components: DimensionRow, FacetAccordion, …
  pages/         # Route-level components (includes AdminDashboardPage.jsx)
  context/       # React context providers (AuthContext.jsx, FeedbackContext.jsx)
  hooks/         # Custom React hooks (useInstrumentKeyboard.js, useScaleLabels.js)
  lib/           # Shared service clients (tokens.js, api.js)
  design/        # tokens.js and global styles
  data/          # test items, scoring keys (always cite source)
  utils/         # scoring logic, logger.js, translationFeedback.js
    __tests__/   # Vitest unit tests for all scoring utilities
  locales/       # i18n translation files (en.json, ca.json, …) — 889 keys × 6 languages
  assets/        # static assets: icons/animals/, illustrations/

api/             # FastAPI backend (Python) — deployed to Hetzner VPS via systemd + Caddy
  main.py        # FastAPI app (routes, auth middleware, async DB helpers)
  scoring.py     # Pure Python scoring — mirrors src/utils/role-scoring.js (no external deps)
  emails.py      # Transactional email via Resend SDK
  tests/         # pytest test suite (13 scoring tests)
  railway.toml   # Legacy Railway deployment config — NOT the active deployment (Hetzner is)

docs/            # One-off reference documents (not living project docs)
  email-signature.html   # Spark HTML email signature for hello@cercol.team
  CLAUDE_EXCELLENCE.md   # Full codebase audit (April 2026) — 32 issues, 31 resolved

scripts/         # Utility scripts for seeding/clearing test data
sql/             # Standalone SQL seeds (facet tables)
db/              # PostgreSQL migrations (001–012; was supabase/ before Phase 14.5)

## Extended documentation
- Phase history and roadmap: ROADMAP.md
- Scientific foundation and scoring: SCIENCE.md
- Product vocabulary, instruments and copy: PRODUCT.md

Read these files when the task requires it. CLAUDE.md is always read first.
