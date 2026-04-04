# Cèrcol — Project Brief for Claude Code

## What is this
Cèrcol is an open-source personality assessment platform built on
peer-reviewed psychometric research, with the long-term goal of
providing scientifically grounded team role assessment.

Phase 1-3: individual personality profiling (data collection)
Phase 4+:  team role instrument built on accumulated real data

All scoring algorithms and item sources are documented and citable.

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
- NEVER use academic instrument names in user-facing text or comments:
  use "Cèrcol Radar" and "Cèrcol Test", never "TIPI", "IPIP", "Big Five"

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
Test item text (questions) uses { en, ca } structure inside data files.
Future: migrate to a spreadsheet or translation management tool
(Tolgee, Localazy, or Google Sheets export) when languages > 3.

## Roadmap

### Phase 1 — Quick assessment MVP ✅ COMPLETE
- Cèrcol Radar: 10-item quick assessment, radar chart results
- Deployed at https://miquelmatoses.github.io/cercol/

### Phase 2 — Full assessment + infrastructure ✅ COMPLETE
- react-i18next with en.json and ca.json (UI strings only)
- Cèrcol Test: 30 IPIP items, 5 domains × 3 facets × 2 items
- Results page: domain radar + facet breakdown + share via URL
- Anonymous result logging via Google Apps Script → Google Sheet
  (timestamp, language, instrument, 5 domain scores — no PII)
- Feedback button → pre-filled GitHub Issue

### Phase 3 — UX polish + dual instrument ✅ COMPLETE
- Homepage instrument selection (Cèrcol Radar vs Cèrcol Test)
- Cèrcol Radar results: radar + prompt to upgrade to Cèrcol Test
- Cèrcol Test: 5 blocks of 6 items with transitions
- Cèrcol dimension names applied everywhere in UI

### Phase 3.5 — Multilingual test items ✅ COMPLETE
- Test item text uses { en, ca } structure inside data files
- QuestionCard resolves item.text[i18n.language] ?? item.text.en
- Valencian translations complete for all 40 items (10 Radar + 30 Test)

### Phase 3.6 — UX improvements + translation feedback ✅ COMPLETE
- Likert scale labels fixed: LikertScale accepts scaleLabels prop,
  no internal hardcoded labels. Radar uses 7-point, Test uses 5-point.
  Anchor labels shown only at extremes, fixed position.
- Keyboard navigation: number keys select option, Enter/Space advances,
  Backspace/ArrowLeft goes back. Hint shown on desktop only.
- Translation feedback: "Suggest translation" button (non-English only)
  opens inline panel with current context, textarea, submit.
  Sends to Google Sheet via Apps Script (no-cors GET, fire-and-forget).
  NOTE: context field currently sends only pathname. Needs improvement.

### Phase 3.7 — Translation feedback context improvement (next)
- FeedbackButton must accept optional props: itemId, itemText
- RadarTestPage and TestPage pass current item id and English text
  when user is mid-test; null on other pages
- Payload gains two new fields: itemId, itemText
- Manual step (not Claude Code): add columns itemId and itemText
  to the translation feedback Google Sheet, and update the
  Google Apps Script to read e.parameter.itemId and e.parameter.itemText

### Phase 4 — Backend + Accounts
- FastAPI + PostgreSQL (or Supabase)
- User accounts, result history
- Stripe payment for extended reports
- Custom domain

### Phase 5 — Team Role Instrument (Cèrcol Team)
- Prerequisite: ~300+ Cèrcol Test completions in Google Sheet
- Step 1: represent each user profile in AB5C space
  (Abridged Big Five Circumplex, Hofstee, De Raad & Goldberg 1992)
  Each profile becomes a point in a 10-dimensional space
  (10 pairwise combinations of OCEAN dimensions)
- Step 2: cluster profiles by Euclidean distance in AB5C space
  → identify natural role groupings in real data
- Step 3: cross-reference clusters with team role literature
  (Belbin 1981, Neuman & Wright 1999, Fisher et al. 1998-2002)
  → define role taxonomy with empirical + theoretical grounding
- Step 4: build forced-choice instrument based on IPIP AB5C markers
  (45 AB5C markers available in IPIP, public domain)
- Step 5: add observer assessment (same items rated by peers)
- Step 6: add ICAR cognitive ability test (public domain)
- Step 7: assign user to role by nearest centroid in AB5C space
- Step 8: team composition report (gaps, overlaps, balance)
- Role taxonomy is data-driven + geometrically grounded,
  not assumed from literature alone

### Phase 6 — Branding + Visual identity
- Cèrcol visual identity applied via tokens.js
- AI image generation trained on Cèrcol style

### Phase 7 — Multilingual expansion
- Translate test items into additional languages beyond Valencian
- Translation management via Tolgee or equivalent

## File structure
src/
  components/    # UI components
  pages/         # Route-level components
  design/        # tokens.js and global styles
  data/          # test items, scoring keys (always cite source)
  utils/         # scoring logic, logger.js, translationFeedback.js
  locales/       # i18n translation files (en.json, ca.json, ...)

## Academic sources
- TIPI: Gosling et al. (2003), J. Research in Personality, 37, 504–528
- IPIP: Goldberg et al. (2006), doi:10.1177/1073191106293419
  Full item pool: https://ipip.ori.org
- ICAR: Condon & Revelle (2014), Intelligence, 46, 79–90
- AB5C: Hofstee, De Raad & Goldberg (1992),
  J. Personality and Social Psychology, 63, 146-163
  IPIP AB5C markers: https://ipip.ori.org
- Team roles: Belbin (1981), Neuman & Wright (1999),
  Fisher, Hunter & Macrosson (1998-2002)

## Technical notes
- Cèrcol Test uses 2 items per facet (vs. 10 in full IPIP-NEO).
  Adequate for feedback purposes, not for clinical assessment.
- GitHub Pages + React Router: 404.html redirect workaround in place
  for direct URL access (share links, bookmarks).
- logger.js and translationFeedback.js use GET + no-cors mode to avoid
  CORS issues with Google Apps Script. Fire-and-forget, never block UI.
- Google Apps Script changes must be done manually (not via Claude Code).
  After any Script update, always redeploy as a new version.