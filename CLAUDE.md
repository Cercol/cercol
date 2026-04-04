# Cèrcol — Project Brief for Claude Code

## What is this
Cèrcol is an open-source personality assessment platform built on
peer-reviewed psychometric research. All scoring algorithms and item
sources are documented and citable.

## Stack
- React + Vite
- Tailwind CSS
- GitHub Pages (static only — no backend until Phase 3)
- All scoring happens client-side in JavaScript

## Design system
All colors, fonts and spacing live in `src/design/tokens.js`.
NEVER hardcode colors or fonts anywhere else.
Always import from tokens.
Cèrcol brand identity will be introduced in a future phase.
When that happens, only tokens.js needs updating.

## Code conventions
- Comments and docstrings always in English
- Component names in PascalCase
- User-facing text in English and Catalan/Valencian (via react-i18next)
- No inline styles, always Tailwind classes
- Keep components small and single-responsibility

## Instrument design decision
All psychometric instruments used in Cèrcol must be free for any use,
including commercial. BFI-2-S was considered but rejected: non-commercial
only. All instruments are based on IPIP (public domain, no restrictions).
Never introduce items from copyrighted instruments (NEO-PI-R, BFI-2, etc.)

## Roadmap

### Phase 1 — Big Five MVP ✅ COMPLETE
- TIPI (10 items, Likert 1-7), client-side scoring
- Radar chart results page
- Deployed at https://miquelmatoses.github.io/cercol/

### Phase 2 — i18n + Full Big Five (current)
- Set up react-i18next with en.json and ca.json (Valencian first)
- Replace TIPI with Cèrcol Big Five (30 IPIP items, public domain)
  - 5 dimensions × 3 facets × 2 items = 30 items total
  - Items selected by highest factor loading per facet from IPIP-NEO item pool
  - Documented in src/data/cercol-big-five.js with full citations
- Richer results page: facet breakdown + dimension scores
- Anonymous result logging via Google Apps Script → Google Sheet
  (timestamp + scores + language only, no PII)
- Share results via URL query params (no backend needed)
- Feedback button → pre-filled GitHub Issue (beta testing log)

### Phase 3 — Backend + Accounts
- FastAPI + PostgreSQL (or Supabase)
- User accounts, result history
- Stripe payment for extended reports
- Custom domain

### Phase 4 — Team Roles (Cèrcol Team)
- Custom forced-choice instrument based on IPIP facets
- Observer assessment (same items rated by peers)
- ICAR cognitive ability test
- Team composition report
- Role taxonomy built from accumulated real data

### Phase 5 — Branding + Visual identity
- Cèrcol visual identity applied via tokens.js
- AI image generation trained on Cèrcol style

## File structure
src/
  components/    # UI components
  pages/         # Route-level components
  design/        # tokens.js and global styles
  data/          # test items, scoring keys (always cite source)
  utils/         # scoring logic
  locales/       # i18n translation files (en.json, ca.json, ...)

## Academic sources
- TIPI: Gosling et al. (2003), J. Research in Personality, 37, 504–528
- IPIP: Goldberg et al. (2006), doi:10.1177/1073191106293419
  Full item pool: https://ipip.ori.org
- ICAR: Condon & Revelle (2014), Intelligence, 46, 79–90

## Known deviations from source
- TIPI dimension 4/9 labelled "Neuroticism" not "Emotional Stability".
  Acceptable convention, note for future review.
- Cèrcol Big Five uses 2 items per facet (vs. 10 in full IPIP-NEO).
  Adequate for feedback purposes, not for clinical assessment.
  Item selection documented in src/data/cercol-big-five.js.