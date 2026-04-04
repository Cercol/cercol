# Cèrcol — Project Brief for Claude Code

## What is this
Cèrcol is an open-source personality assessment platform.
Phase 1: Big Five personality test (TIPI, 10 items), static,
deployed on GitHub Pages. No backend yet.

## Stack
- React + Vite
- Tailwind CSS
- GitHub Pages (static only, no server-side logic)
- Scoring happens client-side in JavaScript

## Design system
All colors, fonts and spacing live in `src/design/tokens.js`.
NEVER hardcode colors or fonts anywhere else.
Always import from tokens.

## Current branding status
Phase 1 uses a neutral placeholder palette (see tokens.js).
Cèrcol brand identity will be introduced in a future phase.
When that happens, only tokens.js needs updating.

## Code conventions
- Comments and docstrings always in English
- Component names in PascalCase
- All text visible to users can be in Catalan or English
- No inline styles, always Tailwind classes
- Keep components small and single-responsibility

## Current phase: 1 — Big Five MVP
Features in scope:
- TIPI questionnaire (10 items, Likert 1-7)
- Client-side scoring → 5 Big Five dimensions
- Results page with radar chart
- Clean, readable, professional design
- Mobile-first

Out of scope for now:
- Backend, database, authentication
- Payment
- Branding / Cèrcol visual identity
- Observer assessment
- Team roles

## File structure
src/
  components/    # UI components
  pages/         # Route-level components
  design/        # tokens.js and global styles
  data/          # TIPI questions, scoring keys
  utils/         # scoring logic
