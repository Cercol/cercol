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
  use "New Moon Cèrcol" and "First Quarter Cèrcol", never "TIPI", "IPIP", "Big Five", "NEO"

## Claude Code workflow
After every successful npm run deploy, Claude Code must:
1. Mark the current phase as ✅ COMPLETE in this file
2. Update the phase description to reflect exactly what was implemented
   (remove items not done, add relevant notes if needed)
3. Do not modify any other section of CLAUDE.md
4. Run: git add -A && git commit -m "chore: complete [phase name]" && git push origin main
This applies to every phase, without exception.

## Instrument design decision
All psychometric instruments used in Cèrcol must be free for any use,
including commercial. BFI-2-S was considered but rejected: non-commercial
only. All instruments are based on IPIP (public domain, no restrictions).
Never introduce items from copyrighted instruments (NEO-PI-R, BFI-2, etc.)

## Product naming convention
Cèrcol uses lunar phase names for all instruments.
Never expose academic instrument names (TIPI, IPIP, NEO) in user-facing text.
Never use generic names like "test" or "radar" in user-facing text or filenames.

Current instruments:
- "New Moon Cèrcol"      — 10-item quick snapshot (CA: "Cèrcol de Lluna Nova")
- "First Quarter Cèrcol" — 60-item full portrait, 30 facets (CA: "Cèrcol de Quart Creixent")

## Lunar phase instrument map

Cèrcol uses four lunar phases as instrument names.
Each phase is a standalone user experience with increasing depth.
Observer assessment and cognitive ability (ICAR) are components
of FullMoon, not standalone phases.

| Phase | Code name | EN display name | CA display name | Instrument | Status |
|---|---|---|---|---|---|
| 🌑 | NewMoon | New Moon Cèrcol | Cèrcol de Lluna Nova | TIPI — 10 items, 7-point, 5 domains | Live |
| 🌓 | FirstQuarter | First Quarter Cèrcol | Cèrcol de Quart Creixent | IPIP-NEO-60 — 60 items, 5-point, 30 facets | Live |
| 🌕 | FullMoon | Full Moon Cèrcol | Cèrcol de Lluna Plena | IPIP-NEO-120 + Observer + ICAR g | Planned |
| 🌗 | LastQuarter | Last Quarter Cèrcol | Cèrcol de Quart Minvant | Team report (members FullMoon) | Planned |

User journey:
NewMoon → FirstQuarter → FullMoon → LastQuarter
(snapshot)  (portrait)   (complete)  (team)

## File naming convention
All instrument pages use English phase names as base:
NewMoonPage.jsx, FirstQuarterPage.jsx, FullMoonPage.jsx, LastQuarterPage.jsx
Never use generic names like TestPage.jsx or RadarPage.jsx.

## Dimension names (user-facing)
Applies to both NewMoon and FirstQuarter.
Internal code keys remain unchanged for research traceability.

| Academic key | Cèrcol name | Valencià |
|---|---|---|
| extraversion / Extraversion | Presence | Presència |
| agreeableness / Agreeableness | Bond | Vincle |
| conscientiousness / Conscientiousness | Discipline | Disciplina |
| negativeEmotionality / Neuroticism | Depth | Profunditat |
| openMindedness / Openness | Vision | Visió |

## Facet names (FirstQuarter — 30 facets)

DEPTH (Neuroticism):
| NEO facet | Cèrcol name | Valencià |
|---|---|---|
| Anxiety | Vigil | Vigília |
| Angry Hostility | Blaze | Flama |
| Depression | Hollow | Buit |
| Self-Consciousness | Veil | Vel |
| Impulsiveness | Surge | Impuls |
| Vulnerability | Fracture | Escletxa |

PRESENCE (Extraversion):
| NEO facet | Cèrcol name | Valencià |
|---|---|---|
| Warmth | Hearth | Llar |
| Gregariousness | Gather | Aplec |
| Assertiveness | Command | Veu |
| Activity | Drive | Empenta |
| Excitement-Seeking | Thrill | Vertigen |
| Positive Emotions | Radiance | Llum |

VISION (Openness):
| NEO facet | Cèrcol name | Valencià |
|---|---|---|
| Fantasy | Dream | Somni |
| Aesthetics | Craft | Traç |
| Feelings | Resonance | Ressò |
| Actions | Drift | Volta |
| Ideas | Prism | Prisma |
| Values | Compass | Brúixola |

BOND (Agreeableness):
| NEO facet | Cèrcol name | Valencià |
|---|---|---|
| Trust | Faith | Fe |
| Straightforwardness | Edge | Tall |
| Altruism | Gift | Do |
| Compliance | Yield | Cessió |
| Modesty | Shadow | Ombra |
| Tender-Mindedness | Shield | Escut |

DISCIPLINE (Conscientiousness):
| NEO facet | Cèrcol name | Valencià |
|---|---|---|
| Competence | Mastery | Mestria |
| Order | Structure | Trama |
| Dutifulness | Oath | Pacte |
| Achievement Striving | Quest | Cerca |
| Self-Discipline | Will | Voluntat |
| Deliberation | Counsel | Consell |

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

## i18n
User-facing strings live in src/locales/{lang}.json (react-i18next).
One file per language, key-value format.
Test item text (questions) uses { en, ca } structure inside data files.
Future: migrate to a spreadsheet or translation management tool
(Tolgee, Localazy, or Google Sheets export) when languages > 3.

## Roadmap

<!--
  EPOCH 1 — Individual Assessment
  Static frontend, GitHub Pages, no backend.
  Goal: ship both instruments, collect data, validate voice.
-->

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

### Phase 3.7 — Translation feedback context improvement ✅ COMPLETE
- FeedbackButton accepts itemId and itemText props via FeedbackContext
- RadarTestPage and TestPage set item context on each item change
- Payload includes itemId and itemText fields
- Manual step done: columns added to Google Sheet, Apps Script updated

### Phase 3.8 — Keyboard on block transitions ✅ COMPLETE
- Enter and Space trigger handleContinueToNextBlock during transition screens
- Backspace and ArrowLeft do nothing during transitions
- handleContinueToNextBlockRef added using same useRef pattern as other handlers
- keydown effect now depends on [item.id, showTransition] to re-register on state change

### Phase 3.9 — Dimension and facet descriptions on results pages ✅ COMPLETE
- Added "dimensions" namespace to en.json and ca.json: high/low descriptions for all 5 dimensions
- Restructured "facets" namespace: each facet now has label, high, low keys
- ResultsPage: domain cards show description text (high if score ≥ 2.5, low otherwise)
- ResultsPage: facet rows show description text below the bar (muted, xs, same threshold)
- RadarResultsPage: domain cards show description text (high if score ≥ 4 on 1–7 scale)
- All copy follows Brand voice guidelines (direct, warm, non-clinical)
- ca.json descriptions left in English pending Valencian translation

### Phase 3.10 — Instrument rebranding + First Quarter launch ✅ COMPLETE
- All instruments renamed to lunar phases: "New Moon Cèrcol" (was Radar) and "First Quarter Cèrcol" (new)
- File renames: tipi.js→new-moon.js, cercol-big-five.js→first-quarter-v1.js, scoring.js→new-moon-scoring.js
- Pages renamed: RadarTestPage→NewMoonPage, RadarResultsPage→NewMoonResultsPage
- Old TestPage/ResultsPage (30-item v1) retired; replaced by FirstQuarterPage/FirstQuarterResultsPage
- New instrument: first-quarter.js — IPIP-NEO-60, 60 items, 5 domains, 30 facets, 5-point scale
- New scoring: first-quarter-scoring.js — computeFQScores, fqScoreToPercent, fqScoreLabel
- FirstQuarterPage: 5 blocks of 12 items with transitions, keyboard nav, FeedbackContext
- FirstQuarterResultsPage: radar chart, domain cards, 30-facet breakdown, share via URL
- RadarChart updated to accept optional domainKeys and labelFn props (backward compat maintained)
- i18n: new fq.*, fqResults.*, fqDomains.*, fqFacets.* namespaces; newMoon.* and newMoonResults.* updated
- Routes: /new-moon, /new-moon/results, /first-quarter, /first-quarter/results added
  Legacy /radar and /radar/results kept for backward compat with shared links
- CLAUDE.md: Product naming convention replaced with lunar phase map, file naming convention, facet table
- FirstQuarter facet names: Vigil, Blaze, Hollow, Veil, Surge, Fracture (Depth);
  Hearth, Gather, Command, Drive, Thrill, Radiance (Presence);
  Dream, Craft, Resonance, Drift, Prism, Compass (Vision);
  Faith, Edge, Gift, Yield, Shadow, Shield (Bond);
  Mastery, Structure, Oath, Quest, Will, Counsel (Discipline)

### Phase 3.11 — Housekeeping: consolidate scoring utilities ✅ COMPLETE
- radar-scoring.js deleted; its three exports (computeRadarScores, radarScoreToPercent,
  radarScoreLabel) merged into new-moon-scoring.js
- NewMoonPage and NewMoonResultsPage imports updated to new-moon-scoring.js
- first-quarter-v1.js still referenced by NewMoonResultsPage.jsx and RadarChart.jsx
  (not deleted — cleanup deferred)

### Phase 3.12 — Housekeeping: remove first-quarter-v1.js ✅ COMPLETE
- Added NEW_MOON_DOMAIN_META to new-moon.js (5 remapped display keys, stable order
  for share URL encoding)
- NewMoonResultsPage.jsx: import replaced with NEW_MOON_DOMAIN_META from new-moon.js;
  RadarChart call updated to pass domainKeys and labelFn props explicitly
- RadarChart.jsx: internal import of first-quarter-v1.js removed; DOMAIN_META
  fallback removed — domainKeys and labelFn are now required props
- first-quarter-v1.js deleted

### Phase 3.13 — Centralise domain naming ✅ COMPLETE
- Created src/data/domains.js as single source of truth for all domain metadata
  (DOMAINS object, DOMAIN_KEYS canonical order, TIPI_TO_CERCOL derived map)
- new-moon.js: removed NEW_MOON_DOMAIN_META and DIMENSION_META (now in domains.js)
- new-moon-scoring.js: replaced internal KEY_MAP with TIPI_TO_CERCOL from domains.js
- first-quarter.js: FQ_DOMAIN_META restructured using DOMAINS spread + facets arrays;
  key order now matches DOMAIN_KEYS (presence/bond/discipline/depth/vision)
- logger.js: domain key columns driven by DOMAIN_KEYS.forEach loop, not hardcoded fields
- NewMoonResultsPage.jsx: imports DOMAIN_KEYS from domains.js; fixed DOMAIN_BAR_COLOR
  and description lookup (were using stale academic keys, now use Cèrcol keys)
- FirstQuarterResultsPage.jsx: imports DOMAIN_KEYS for encoding/display;
  FQ_DOMAIN_META retained only for facet list lookup
- Share URL encoding order for both instruments now canonically governed by DOMAIN_KEYS

### Phase 3.14 — README ✅ COMPLETE
- README.md written to repo root (replaced Vite default)
- Covers: what Cèrcol is, both live instruments with links, dimension table,
  scientific foundation with full references, privacy policy, roadmap, contributing, MIT license
- Brand voice applied throughout: direct, warm, no academic jargon in user-facing sections,
  no corporate filler, no em-dashes

#### Manual tasks (Miquel) ✅ COMPLETE
- Verify Supabase logs results correctly for both instruments
- Invite 5-10 known contacts to complete FirstQuarter

### Phase 3.15 — Credentials to environment variables ✅ COMPLETE
- .env created at repo root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- .env.example created with placeholder values
- logger.js and translationFeedback.js updated to use import.meta.env.VITE_* variables
- .env already covered by .gitignore (*.local + explicit .env entry)

### Phase 3.16 — FirstQuarter display bug fixes ✅ COMPLETE
- Block header was showing "DEPTH · FIRST QUARTER CÈRCOL 1 / 5" (fq.subtitle concatenated
  with blockIdx + 1). Fixed: now uses fq.blockLabel key → "DEPTH · Block 1 of 5"
- Item prefix was showing "TEST.ITEMPREFIX" (QuestionCard defaulting to test.itemPrefix).
  Fixed: FirstQuarterPage now passes prefixKey="fq.itemPrefix" to QuestionCard
- fq.blockLabel added to en.json ("Block {{current}} of {{total}}")
  and ca.json ("Bloc {{current}} de {{total}}")

### Phase 3.17 — Suppress moderate score descriptions ✅ COMPLETE
- Domain and facet descriptions now only shown for clearly high or low scores
- FirstQuarter (1-5 scale): description shown if score > 3.5 (high) or < 2.5 (low);
  hidden for moderate scores (2.5-3.5)
- NewMoon (1-7 scale): description shown if score ≥ 5.0 (high) or ≤ 2.9 (low);
  hidden for moderate scores (3.0-4.9)
- Applies to domain cards in both results pages and facet rows in FirstQuarterResultsPage
- Score label (Low / Moderate / High badge) unchanged

### Phase 3.18 — Complete instrument rename to FirstQuarter + lunar phase map simplification ✅ COMPLETE
- Renamed all "Waxing Crescent" / "WaxingCrescent" identifiers to "First Quarter" / "FirstQuarter"
- Deleted: waxing-crescent.js, waxing-crescent-scoring.js, WaxingCrescentPage.jsx, WaxingCrescentResultsPage.jsx
- Created: first-quarter.js, first-quarter-scoring.js, FirstQuarterPage.jsx, FirstQuarterResultsPage.jsx
- App.jsx: removed /waxing-crescent routes and all legacy /radar routes; added /first-quarter routes
- HomePage.jsx: home.firstQuarter i18n key, navigate('/first-quarter')
- FeedbackButton.jsx: getInstrument updated to match /first-quarter pathname
- NewMoonResultsPage.jsx: upgrade CTA now navigates to /first-quarter
- i18n namespaces renamed: wc→fq, wcResults→fqResults, wcDomains→fqDomains, wcFacets→fqFacets
- Display names updated: EN "First Quarter Cèrcol", CA "Cèrcol de Quart Creixent"
- en.json and ca.json fully rewritten with new namespace keys and display names
- logger.js: instrument value changed from 'waxingCrescent' to 'firstQuarter'
- Lunar phase map simplified from 8 phases to 4 (NewMoon, FirstQuarter, FullMoon, LastQuarter)
- All legacy route aliases removed — no backward compat needed (no shared FirstQuarter links existed yet)
- Exhaustiveness verified: 8 grep patterns all returned CLEAN after rename

### Phase 3.19 — Custom domain: cercol.team ✅ COMPLETE
- vite.config.js: base changed from '/cercol/' to '/'
- public/CNAME created with 'cercol.team' (copied to dist/ on every build)
- public/404.html: redirect script updated — removed /cercol repo prefix, now redirects to /?p=path from root
- index.html: companion replaceState script updated — removed '/cercol' prefix, now restores from '/' root
- App now serves at cercol.team instead of miquelmatoses.github.io/cercol

<!--
  EPOCH 2 — Platform & Infrastructure
  Backend, accounts, payments, custom domain.
  Prerequisite: Epoch 1 complete + data collected.
-->

### Phase 4 — Backend + Accounts

### Phase 4.1 — FastAPI skeleton + Supabase account schema ✅ COMPLETE
- api/ directory created: FastAPI 0.115 skeleton deployable to Railway via Nixpacks
- api/main.py: single /health endpoint; CORS configured for cercol.team and Vite dev ports
- api/requirements.txt: fastapi + uvicorn[standard], pinned versions
- api/railway.toml: nixpacks builder, uvicorn start command, /health healthcheck
- api/.env.example: documents SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service_role, not anon)
- supabase/migrations/001_profiles.sql: profiles table (uuid PK → auth.users), RLS policies
  (select/update own), trigger auto-creates profile on Supabase Auth sign-up
- supabase/migrations/002_results_user_id.sql: adds nullable user_id FK to existing results table;
  sparse index; select policy so authenticated users can read own results; anon insert policy unchanged

#### Manual tasks (Miquel)
- In Railway: create new service, connect to cercol repo, set Root Directory = api/
- In Railway: add env vars SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- In Railway: add custom domain api.cercol.team once service is live
- In Supabase SQL editor: run migrations 001 and 002 in order
- Enable Supabase Auth (Email provider) in project dashboard

### Phase 4.2 — Magic link auth (frontend + backend) ✅ COMPLETE
- src/lib/supabase.js: shared Supabase client extracted (was duplicated in logger.js)
- logger.js: updated to import from src/lib/supabase instead of creating own client
- src/context/AuthContext.jsx: AuthProvider wraps the whole app; exposes user, loading,
  signIn(email), signOut(); session persisted automatically via supabase-js localStorage
- src/pages/AuthPage.jsx: magic link form (form → sending → sent states); consistent with
  existing design (bg-gray-50, white card, rounded-2xl, Tailwind only)
- src/pages/AuthCallbackPage.jsx: handles Supabase redirect after email click;
  waits for SIGNED_IN event via onAuthStateChange, then navigates home
- src/components/AccountButton.jsx: top-left of HomePage; shows "Sign in" when anonymous,
  shows email initial badge + "Sign out" when authenticated
- App.jsx: AuthProvider wraps FeedbackProvider; routes /auth and /auth/callback added
- HomePage.jsx: AccountButton added top-left (symmetric with LanguageToggle top-right)
- public/404.html: updated to forward window.location.hash through the redirect
  (needed for Supabase implicit flow: hash carries access_token)
- index.html: replaceState now appends window.location.hash after restoring the path
- en.json / ca.json: auth namespace added (signIn, signOut, form labels, sent state, error)
- api/main.py: Supabase JWT dependency (get_current_user) via JWKS endpoint (ES256 / P-256);
  JWKS URL derived from SUPABASE_URL — no shared secret needed; keys cached in-process by kid;
  supports key rotation (re-fetches JWKS on unknown kid); GET /me returns user_id and email;
  version 0.2.0
- api/requirements.txt: python-jose[cryptography]==3.3.0 added (EC key support)
- api/.env.example: SUPABASE_JWT_SECRET removed; SUPABASE_URL is the only JWT-related var needed
- NOTE: initial implementation used HS256 + shared secret; corrected to JWKS/ES256 because
  Supabase migrated to ECC P-256 asymmetric signing keys

#### Manual tasks (Miquel)
- In Railway: ensure SUPABASE_URL is set (already documented in Phase 4.1); remove SUPABASE_JWT_SECRET if added
- In Supabase Auth dashboard: enable Email provider; set Site URL to https://cercol.team;
  add https://cercol.team/auth/callback to "Redirect URLs" allowlist

### Phase 4.3 — Linked results + My Results page ✅ COMPLETE
- logger.js: added optional userId param (4th arg); populates user_id column when non-null
- NewMoonResultsPage.jsx: imports useAuth; passes user?.id to logResult on test completion
- FirstQuarterResultsPage.jsx: same — user?.id passed to logResult
- Anonymous completions (user not signed in) continue to work unchanged (user_id left null)
- src/pages/MyResultsPage.jsx: fetches own results via Supabase anon client; RLS filters
  to rows where user_id = auth.uid(); displays instrument name, date, domain bar chart
  for each result; empty state + "Start an assessment" CTA; redirects to /auth if not signed in
- src/components/AccountButton.jsx: when signed in, now shows initial badge + "My results"
  link + "Sign out" (was just badge + sign out)
- App.jsx: /my-results route added
- en.json / ca.json: myResults namespace added (link, heading, loading, error, empty, startCta)

### Phase 4.4 — Shared Layout component + HTTPS bug fixes ✅ COMPLETE
- Three HTTPS bugs fixed after custom domain went live (see below)
- src/components/Layout.jsx: persistent header (brand link left, AccountButton + LanguageToggle right);
  children rendered below in normal flow; uses only Tailwind classes, no hardcoded values
- App.jsx: all routes wrapped in Layout via AppContent; single source of nav shell
- HomePage: removed AccountButton + LanguageToggle imports and absolute top-4 divs
- AuthPage: removed LanguageToggle import + absolute div; removed brand button (Layout owns it);
  removed unused useNavigate
- MyResultsPage: removed AccountButton + LanguageToggle imports + absolute divs; removed brand button
- NewMoonPage: removed LanguageToggle import + inline header row (brand span + LanguageToggle)
- FirstQuarterPage: same — removed LanguageToggle import + inline header row
- NewMoonResultsPage: removed LanguageToggle import; inline header collapsed to h1 + subtitle only
- FirstQuarterResultsPage: same

### Phase 4.6 — Multi-method auth (Google OAuth + password + magic link) ✅ COMPLETE
- src/context/AuthContext.jsx: added signInWithPassword(email, password), signUp(email, password),
  signInWithGoogle(); signUp returns { needsConfirmation } so UI can show confirm-email state
- src/pages/AuthPage.jsx: redesigned with three methods in one form:
  - Google OAuth button (top)
  - "or" divider
  - Email field (shared)
  - Two-tab method switcher: "Password" | "Magic link"
  - Password field + sign-in/sign-up toggle (password method only)
  - Single submit button adapts label to current method + mode
  - Sent/confirm state shows appropriate message for magic link vs email confirmation
- AuthCallbackPage unchanged — onAuthStateChange already handles OAuth and password sessions
- en.json / ca.json: auth namespace expanded (Google CTA, method labels, password labels,
  sign-up toggle, confirm-email state, tryAgain)

#### HTTPS bug fixes (post-custom-domain)
- api/main.py: added http://cercol.team and both http/https localhost variants to CORS origins
  (only https://cercol.team was listed; http variant and https localhost were missing)
- src/utils/translationFeedback.js: removed duplicate createClient() call; now imports shared
  supabase instance from src/lib/supabase.js (was the source of "multiple GoTrueClient" warning)
- public/404.html: skip redirect for /auth/callback paths so Supabase can handle its own
  magic link redirect without the SPA script mangling the hash fragment
- index.html: companion replaceState script also skips /auth/callback paths

### Phase 4.5 — Stripe Checkout + premium facet gate ✅ COMPLETE
- supabase/migrations/003_premium.sql: adds `premium boolean default false` to profiles
- api/requirements.txt: stripe==12.1.0 added
- api/main.py: two new endpoints; version bumped to 0.3.0
  - POST /checkout (authenticated): creates Stripe Checkout session (mode=payment),
    sets client_reference_id=user_id, customer_email pre-filled; returns { url }
  - POST /webhooks/stripe: verifies Stripe-Signature; on checkout.session.completed
    calls Supabase REST PATCH via service_role key to set profiles.premium=true
  - _supabase_patch() helper: service_role REST calls using stdlib urllib (no extra deps)
- api/.env.example: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID, FRONTEND_URL documented
- src/lib/api.js: authenticated fetch helper; createCheckoutSession() wraps POST /checkout
- src/pages/FirstQuarterResultsPage.jsx: premium gate on facet breakdown
  - Checks profiles.premium from Supabase on mount (anon client, RLS filters to own row)
  - Non-premium + has facets: shows blurred first-domain preview + CTA overlay
  - CTA: saves facets to sessionStorage, calls createCheckoutSession(), redirects to Stripe
  - On return (?payment=success): restores facets from sessionStorage; shows success banner;
    clears sessionStorage once premium confirmed
  - Premium users: full 30-facet breakdown shown as before
- en.json / ca.json: fqResults.unlock.* and fqResults.paymentSuccess added
- .env / .env.example: VITE_API_URL added

#### Manual tasks (Miquel)
- In Supabase SQL editor: run migration 003_premium.sql
- In Stripe dashboard (test mode):
  - Create a product "First Quarter Full Report" with a one-time price
  - Copy the price ID (price_...) → set STRIPE_PRICE_ID in Railway
  - Add webhook endpoint: https://api.cercol.team/webhooks/stripe
    Events to listen: checkout.session.completed
  - Copy webhook signing secret (whsec_...) → set STRIPE_WEBHOOK_SECRET in Railway
- In Railway: set STRIPE_SECRET_KEY=sk_test_... and the above two env vars
- NOTE: Stripe secret key provided during dev session — store in Railway only, never commit

<!--
  EPOCH 3 — Team Intelligence
  Role instrument, observer, team reports.
  Prerequisite: ~300 WaxingCrescent completions analysed.
-->

### Phase 5 — Team Role Instrument (Cèrcol Full Moon)

<!--
  Prerequisite: ~300 WaxingCrescent completions in Supabase.
  Theoretical foundation documented below.
  Implementation pending data collection.
-->

#### Scientific foundation

Role taxonomy derived from the AB5C circumplex (Hofstee, De Raad & Goldberg 1992),
not from Belbin. Belbin is referenced for comparison only, not as a design source.
The model is empirically grounded: hypothesis defined from literature,
validated and refined with real accumulated data.

Two meta-axes from Digman (1997) structure the role space:
  α = (z_A + z_E - z_N) / 3   — socialisation axis (horizontal)
  β = (z_C + z_O) / 2          — efficacy/growth axis (vertical)

Used for visualisation only. Role assignment always computed in full 5D space.

#### Pipeline: from OCEAN to role (v1 — theoretical centroids)

Step 1 — Normalise OCEAN scores to z-scores
  (population mean=3, SD=0.6 as prior; replaced by sample stats at N≥300)

Step 2 — Detect AB5C sector
  Primary factor = highest |z|. Secondary = second highest |z|.
  If |z_primary| < 0.5 → assign directly to R0 (Integrator)
  If |z_secondary| < 0.3 → treat as pure pole (no secondary)
  NOTE: thresholds are calibration parameters, not theoretical constants.

Step 3 — Lookup sector → role candidate(s)
  34 empirically supported sectors (11 excluded — no robust evidence)
  Each sector maps to 1 or 2 role candidates:

  | ID | Primary | Typical secondaries | AB5C sectors |
  |----|---------|---------------------|--------------|
  | R1 | E+      | C+, O+              | E+/C+, E+/O+, C+/E+, O+/E+ |
  | R2 | E+      | A+, N-              | E+/A+, A+/E+, E+/N-, N-/E+ |
  | R3 | E+ or A-| A- or N+            | E+/A-, A-/E+, E+/N+, N-/A- |
  | R4 | A+ or C+| C+ or A+            | A+/C+, C+/A+, A+/N-, N-/C+ |
  | R5 | A+      | E-, C-              | A+/E-, E-/A+, A+/C-, C-/A+ |
  | R6 | C+      | N+, A-              | C+/N+, N+/C+, C+/A-, A-/C+ |
  | R7 | O+      | C+, A+              | O+/C+, C+/O+, O+/A+, A+/O+ |
  | R8 | O+      | E+, N-, A-          | O+/E+, O+/N-, O+/A-, E-/O+ |
  | R0 | —       | all moderate        | residual sectors + centre |

  Boundary sectors (return 2 candidates, resolved at Step 4):
  E+/O+, O+/E+ → R1, R8
  A+/O+, O+/A+ → R5, R7
  N-/E+, E+/N- → R1, R2
  E+/A-, A-/C+ → R3, R6

  Known fragility: R3 aggregates conductually distant profiles.
  Likely to split into two roles when real data available.

Step 4 — Tiebreak by 5D Euclidean distance to theoretical centroids
  d(profile, centroid) = sqrt(Σ(z_i - c_i)²) for i in {E,A,C,N,O}
  Assign role with minimum distance.

Step 5 — Full probability profile (softmax over negative distances)
  prob_i = softmax(-distances)[i] for all 9 roles
  Roles with prob > 15% = personal arc (natural secondary roles)

Step 6 — 2D projection for visualisation (α/β axes, display only)

Output per profile:
  - Primary role (label + Cèrcol name)
  - Personal arc (2-3 roles with prob > 15%)
  - Full probability vector (9 values)
  - α/β coordinates for wheel visualisation
  - AB5C sector code (traceable to literature)

#### Theoretical centroids (v1 — to be replaced by empirical centroids at N≥300)

| Role | z_E | z_A | z_C | z_N | z_O |
|------|-----|-----|-----|-----|-----|
| R0   |  0.0|  0.0|  0.0|  0.0|  0.0|
| R1   | +1.2|  0.0| +1.0|  0.0| +0.5|
| R2   | +1.2| +0.8|  0.0| -0.8|  0.0|
| R3   | +0.8| -1.0|  0.0| +0.5|  0.0|
| R4   |  0.0| +1.0| +1.0| -0.5|  0.0|
| R5   | -0.8| +1.2| -0.5|  0.0|  0.0|
| R6   |  0.0| -0.5| +1.0| +0.8|  0.0|
| R7   |  0.0| +0.5| +0.5|  0.0| +1.2|
| R8   | +0.5|  0.0|  0.0| -0.5| +1.2|

Centroids are theoretical approximations derived from AB5C sector midpoints.
Replace with k-means centroids when N≥300 real profiles available.

#### Validation plan
- At N≥100: check sector distribution, flag if R3 shows bimodal pattern
- At N≥300: run k-means (k=9), compare empirical vs theoretical centroids
- If empirical k suggests k≠9: revise taxonomy before launch
- AB5C sector codes preserved in Supabase for full reanalysis at any point

#### Role names (Cèrcol vocabulary)

Each role name follows the same design principles as dimension and facet names:
one word, evocative, translates naturally to Valencian, no role sounds better
or worse than another.

| ID | English | Valencian | One-line essence |
|----|---------|-----------|-----------------|
| R0 | Opal    | Opàl      | No fixed role. Present in different ways without ceasing to be you. |
| R1 | Bolt    | Llamp     | You see the exact moment and go for it. When you move, others know it's time. |
| R2 | Beacon  | Far       | You don't invite anyone. People come because it's easy to let their guard down near you. |
| R3 | Thorn   | Espina    | You say what should have been said two meetings ago. Without you, the team sleeps in easy consensus. |
| R4 | Anchor  | Àncora    | When everything shakes, you stay in place. The team notices most when you're not there. |
| R5 | Heron   | Garça     | You listen to what was left unsaid. The team's harmony runs through you without anyone quite knowing. |
| R6 | Anvil   | Enclusa   | Quality is tested at your side. You are the tool that stops the team from fooling itself. |
| R7 | Loom    | Teler     | Where others see loose threads, you see the web. What comes out is better than any of the parts. |
| R8 | Comet   | Cometa    | You don't ask permission to move outside the expected path. The best decisions passed through your angle first. |

Full descriptions (user-facing, Brand voice) live in src/locales/en.json
and src/locales/ca.json under the roles namespace (Phase 5 implementation).

#### Implementation steps (when data prerequisite met)
1. Build role scoring module (scoring/role-scoring.js)
2. Add role result to FirstQuarter results page (provisional, labelled as beta)
3. Build observer assessment instrument (FullMoon observer component)
4. Add ICAR cognitive ability test (public domain, Condon & Revelle 2014)
5. Build FullMoon integrated report
6. Replace theoretical centroids with empirical centroids
7. Build LastQuarter team composition report

#### Academic sources
- AB5C: Hofstee, De Raad & Goldberg (1992), JPSP 63, 146-163
- Digman meta-factors: Digman (1997), JPSP 73, 1246-1256
- Independent team role circumplex: Nestsiarovich & Pons (2020), PMC7071388
- AB5C short form validation: Lanning et al. (2020), JSCP

<!--
  EPOCH 4 — Brand & Expansion
-->

### Phase 6 — Branding + Visual identity
- Cèrcol visual identity applied via tokens.js
- AI image generation trained on Cèrcol style

### Phase 7 — Multilingual expansion
- Translate test items into additional languages beyond Valencian
- Translation management via Tolgee or equivalent

## Phase completion criteria

A numbered phase (1, 2, 3, 4...) is considered complete when:

1. All planned features are live at the production URL
2. No known bugs block the core user journey
3. Result logging is verified working for all active instruments
4. CLAUDE.md reflects the actual state of the codebase accurately
5. The next phase has a defined scope (even if not started)

A sub-phase (3.x) is complete when:
1. npm run build passes with no errors
2. npm run deploy succeeds
3. The specific feature described is verifiable at the production URL

Phase 3 (Epoch 1) closes when:
- Both NewMoon and FirstQuarter are fully functional end-to-end
- Supabase logs both instrument values correctly
- README is published and accurate
- At least one real external user has completed FirstQuarter

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
- Cèrcol First Quarter uses 2 items per facet from the IPIP-NEO-60
  (Maples-Keller et al. 2019). Adequate for feedback purposes,
  not for clinical assessment.
- Cèrcol New Moon uses 10 items across 5 domains (no facets).
  Designed for quick orientation, not detailed profiling.
- GitHub Pages + React Router: 404.html redirect workaround in place
  for direct URL access (share links, bookmarks).
- Result logging and translation feedback use Supabase (anon key,
  RLS-protected inserts). Fire-and-forget, never block UI.

## Brand voice

Cèrcol speaks like a knowledgeable friend, not a consultant.
Direct. A little poetic when it counts. Never cold.

Founding phrase (captures the essence):
"Tot suma, ningú no és imprescindible, però tots som necessaris."

Four principles:

1. GROUNDED
   Real science, never academic tone.
   Sources live in the code, not the interface.
   ✗ "This instrument assesses interpersonal behavioral tendencies."
   ✓ "See how you show up when it matters."

2. ALIVE — short sentences, active verbs, no passive voice
   ✗ "A tendency toward leadership was detected."
   ✓ "You tend to take charge. Others follow."

3. WARM BUT WITH AN EDGE
   We gently challenge, not validate.
   Low scores move you away from mediocrity in a different direction.
   No sugarcoating with filler: no "amazing", "incredible", "powerful insights."
   ✗ "Low Discipline may suggest challenges with structure."
   ✓ "You work best when the goal is clear but the path is yours."

4. VALENCIAN SOUL
   Born from the land and the collective.
   Direct, warm, a hint of provocation, community over competition.
   Ask: would this sound right said out loud in Valencian?
   If it sounds like a consulting deck, rewrite it.

Voice examples:
  ✗ "Gain deep insights into your personality profile."
  ✓ "See yourself more clearly."

  ✗ "Your Presence score indicates high extraverted tendencies."
  ✓ "You bring energy into a room. People notice."

  ✗ "Congratulations on completing the assessment!"
  ✓ "That's you, in five dimensions."