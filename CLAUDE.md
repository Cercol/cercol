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
- FastAPI + uvicorn (backend — Railway, api.cercol.team) [Phase 4+]
- Supabase: anonymous result logging (anon key) + user auth + profiles (service_role key, backend only)
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
- NEVER use academic instrument names in user-facing text or comments:
  use "New Moon Cèrcol", "First Quarter Cèrcol", "Full Moon Cèrcol", never "TIPI", "IPIP", "Big Five", "NEO"
- NEVER use "observer" anywhere — always "Witness" / "Testimoni" (see PRODUCT.md)
- All instrument pages use English phase names as base:
  NewMoonPage.jsx, FirstQuarterPage.jsx, FullMoonPage.jsx, LastQuarterPage.jsx
- All instruments are based on IPIP (public domain). Never introduce items from
  copyrighted instruments (NEO-PI-R, BFI-2, etc.)

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
Test item text (questions) uses { en, ca } structure inside data files.
Future: migrate to a spreadsheet or translation management tool
(Tolgee, Localazy, or Google Sheets export) when languages > 3.

## File structure
src/
  components/    # UI components
  pages/         # Route-level components
  context/       # React context providers (AuthContext.jsx, FeedbackContext.jsx)
  lib/           # Shared service clients (supabase.js, api.js)
  design/        # tokens.js and global styles
  data/          # test items, scoring keys (always cite source)
  utils/         # scoring logic, logger.js, translationFeedback.js
  locales/       # i18n translation files (en.json, ca.json, ...)

## Extended documentation
- Phase history and roadmap: ROADMAP.md
- Scientific foundation and scoring: SCIENCE.md
- Product vocabulary, instruments and copy: PRODUCT.md

Read these files when the task requires it. CLAUDE.md is always read first.
