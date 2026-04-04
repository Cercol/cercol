# Cèrcol — Project Brief for Claude Code

## What is this
Cèrcol is an open-source personality assessment platform built on
peer-reviewed psychometric research. All scoring algorithms and item
sources are documented and citable.

## Stack
- React + Vite
- Tailwind CSS
- GitHub Pages (static only — no backend until Phase 4)
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

## Product naming convention
Cèrcol uses its own product names, not academic instrument names.
Do not expose "TIPI", "IPIP", "Big Five" or similar as product labels.
Current product names:
- "Cèrcol Radar" — 10-item quick assessment (based on TIPI)
- "Cèrcol Test"  — 30-item full assessment (based on IPIP)
These names appear in all user-facing copy and i18n files.
Academic sources are documented in code comments and README only.

## Communication style (user-facing copy)
- Warm, direct, and non-clinical tone
- Avoid psychological jargon in results and descriptions
- Frame all dimensions positively: no score is good or bad,
  each reflects a tendency or preference
- Low scores are not failures — describe both ends of each
  dimension as valid and functional
- Keep sentences short. No corporate filler.
- Dimension names use Cèrcol product vocabulary (see below),
  never academic labels in user-facing text

## Dimension names (user-facing)
Cèrcol uses its own dimension vocabulary inspired by RPG archetypes.
These names appear in all UI, i18n files, results, and copy.
Internal code and data files keep the original academic keys
for research traceability. Only display labels change.

| Academic key          | Cèrcol name | Valencian   |
|-----------------------|-------------|-------------|
| extraversion          | Presence    | Presència   |
| agreeableness         | Bond        | Vincle      |
| conscientiousness     | Discipline  | Disciplina  |
| negativeEmotionality  | Depth       | Profunditat |
| openMindedness        | Vision      | Visió       |

Facet names follow the same principle: clear, non-clinical,
no academic jargon in user-facing text. Translations pending.

## i18n
User-facing strings live in src/locales/{lang}.json (react-i18next).
One file per language, key-value format.
Test item text (questions) is currently English-only. Translations
for test items are a future task — do not block features on this.
Future: migrate to a spreadsheet or translation management tool
(Tolgee, Localazy, or Google Sheets export) when languages > 3.

## Roadmap

### Phase 1 — Big Five MVP ✅ COMPLETE
- Cèrcol Radar: 10-item quick assessment, radar chart results
- Deployed at https://miquelmatoses.github.io/cercol/

### Phase 2 — i18n + Full Big Five ✅ COMPLETE
- react-i18next with en.json and ca.json (UI strings only, not test items)
- Cèrcol Test: 30 IPIP items, 5 domains × 3 facets × 2 items
- Results page: domain radar + facet breakdown + share via URL
- Anonymous result logging via Google Apps Script → Google Sheet
- Feedback button → pre-filled GitHub Issue

### Phase 3 — UX polish + dual instrument (current)
- Homepage: user chooses between Cèrcol Radar and Cèrcol Test
- Cèrcol Radar results: show radar + prompt to upgrade to Cèrcol Test
- Cèrcol Test: group 30 items into 5 blocks of 6 (one per domain)
  with block header and motivational transition between blocks
- Apply Cèrcol dimension names (Presence, Bond, Discipline, Depth, Vision)
  everywhere in UI — replace any remaining academic labels

### Phase 3.5 — Multilingual test items (future)
- Add translations for test item text (currently English-only)
- Option A: structured as { en: '...', ca: '...' } inside data files
- This is the recommended approach for clean component architecture
- Do not implement until explicitly requested

### Phase 4 — Backend + Accounts
- FastAPI + PostgreSQL (or Supabase)
- User accounts, result history
- Stripe payment for extended reports
- Custom domain

### Phase 5 — Team Roles (Cèrcol Team)
- Custom forced-choice instrument based on IPIP facets
- Observer assessment (same items rated by peers)
- ICAR cognitive ability test
- Team composition report
- Role taxonomy built from accumulated real data

### Phase 6 — Branding + Visual identity
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

## Technical notes
- Cèrcol Test uses 2 items per facet (vs. 10 in full IPIP-NEO).
  Adequate for feedback purposes, not for clinical assessment.
- logger.js: replace PLACEHOLDER_REPLACE_BEFORE_DEPLOY with
  Google Apps Script URL before deploying result logging.

## Code conventions
- Comments and docstrings always in English
- Component names in PascalCase
- User-facing text in English and Catalan/Valencian (via react-i18next)
- No inline styles, always Tailwind classes
- Keep components small and single-responsibility
- NEVER use academic instrument names in user-facing text or comments:
  use "Cèrcol Radar" and "Cèrcol Test", never "TIPI", "IPIP", "Big Five"