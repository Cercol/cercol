# Cèrcol — Roadmap

All development phases from inception to present, plus the planned roadmap.
Phase completion criteria are at the bottom.

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

### Phase 4 — Backend + Accounts ✅ COMPLETE

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

### Phase 4.5 — Stripe infrastructure (checkout + webhook + premium column) ✅ COMPLETE
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
- en.json / ca.json: fqResults.unlock.* and fqResults.paymentSuccess added
- .env / .env.example: VITE_API_URL added
- NOTE: The gate was originally placed on FirstQuarter facets, then removed in Phase 4.7.
  The Stripe endpoints and premium column remain — they will gate Full Moon (Phase 6).

#### Manual tasks (Miquel)
- In Supabase SQL editor: run migration 003_premium.sql
- In Stripe dashboard (test mode):
  - Create a product "Full Moon Cèrcol" with a one-time price
  - Copy the price ID (price_...) → set STRIPE_PRICE_ID in Railway
  - Add webhook endpoint: https://api.cercol.team/webhooks/stripe
    Events to listen: checkout.session.completed
  - Copy webhook signing secret (whsec_...) → set STRIPE_WEBHOOK_SECRET in Railway
- In Railway: set STRIPE_SECRET_KEY=sk_test_... and the above two env vars
- NOTE: Stripe secret key provided during dev session — store in Railway only, never commit

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
- public/404.html (original fix): skip redirect for /auth/callback — later found to be wrong,
  see auth bug fix below
- index.html (original fix): companion replaceState also skipped /auth/callback — also wrong

#### Auth bug fixes (post-Phase 4.6)
All three auth methods broken after Phase 4.6. Three root causes found and fixed:
1. public/404.html: removed /auth/callback exclusion — it caused React never to load at that URL
   (GitHub Pages served 404.html but the skip meant no redirect to index.html → blank page).
   404.html now always redirects to /?p=encodedPath+hash, for every path including /auth/callback.
2. index.html: fixed double-slash bug — `'/' + decodeURIComponent(p)` produced `//auth/callback`
   (SecurityError) because p already starts with '/'. Fixed to use `p` directly
   (URLSearchParams.get() already decodes — no additional decodeURIComponent needed). Also
   removed the /auth/callback exclusion check (no longer needed since 404.html always redirects).
3. src/pages/AuthPage.jsx: added useNavigate + useEffect(() => { if (user) navigate('/') }, [user])
   — password sign-in and sign-up were succeeding but the page never navigated (onAuthStateChange
   sets user in AuthContext but AuthPage wasn't watching it).

### Phase 4.7 — Product model correction: FQ gate removed, freemium model documented ✅ COMPLETE
- src/pages/FirstQuarterResultsPage.jsx: removed all premium gate logic
  - Deleted: premium state, checkingOut state, paymentParam detection, sessionStorage
    save/restore for facets/domains, handleUnlock(), gate JSX (blurred preview + CTA overlay),
    payment success banner, premium polling useEffect, Supabase premium check, sessionStorage
    cleanup useEffect
  - Deleted imports: supabase, createCheckoutSession, FACETS_SESSION_KEY, DOMAINS_SESSION_KEY
  - All 30 facets now shown unconditionally — First Quarter is a free instrument
  - Result logging (user_id) and ?r= shared links unchanged
- api/main.py: POST /checkout and POST /webhooks/stripe kept — will gate Full Moon (Phase 5)
- supabase profiles.premium column kept — will be used for Full Moon

#### Freemium model (authoritative)
FREE (always):
- New Moon Cèrcol — 10 items, 5 domains, quick snapshot
- First Quarter Cèrcol — 60 items, 5 domains, 30 facets, full portrait

PAID (one-time payment, per session):
- Full Moon Cèrcol — IPIP-NEO-120 + Witness Cèrcol + ICAR cognitive ability;
  definitive role result and team report (Phase 6–7, not yet built)
  Stripe infrastructure (checkout endpoint, webhook, premium column) is already in place.

<!--
  EPOCH 3 — Role intelligence
  Role scoring in the product. Full Moon and Witness when data allows.
  Prerequisite: ~300 FirstQuarter completions in Supabase.
-->

### Phase 5 — Beta role scoring in First Quarter ✅ COMPLETE

Role scoring is live in First Quarter as a clearly labelled beta feature.
The pipeline uses theoretical centroids and will be updated with empirical
values as data accumulates. Built across four sub-phases:

- **5.1** — `computeRole()` scoring module; `RoleResult` card (name, essence, arc chips)
  shown at the end of First Quarter results. Theoretical centroids.
- **5.2** — `RoleWheel` SVG visualisation: all 9 roles plotted in α/β space with user position.
- **5.3** — Pipeline simplified: SECTOR_MAP and sector detection removed; pure Euclidean
  over all 9 centroids. Normalisation priors replaced with per-domain published values
  (Johnson 2014; Maples-Keller et al. 2019).
- **5.4** — `RoleWheel` replaced with `RoleProbabilityBars`: ranked horizontal bars for all
  9 roles sorted by softmax probability. Full Moon + Witness Cèrcol design documented.
  See SCIENCE.md for full pipeline documentation and PRODUCT.md for role vocabulary.

### Phase 5.1 — Role scoring module + beta role display ✅ COMPLETE
- src/utils/role-scoring.js: pure scoring module (no React, no side effects)
  - Theoretical centroids for R0–R8 (z-scores, order E/A/C/N/O)
  - computeRole(domainScores): normalise → detect AB5C sector → lookup candidates
    → resolve by Euclidean distance → softmax probabilities over all 9 roles
  - Centre rule: |z_primary| < 0.5 → R0 (no dominant role)
  - Returns: { role, arc, probabilities, alpha, beta }
  - arc = secondary roles with softmax probability > 15% (excluding primary)
  - Digman α/β axes computed for future visualisation
- src/components/RoleResult.jsx: minimal beta card
  - Beta badge (roles.beta_label) — prominently shown, cannot be missed
  - Role name (roles.{R}.name) — large, bold; essence — body copy
  - Personal arc chips (roles.arc_label + roles.{R}.name per arc role)
  - Design tokens only; Tailwind classes only; no hardcoded values
- src/pages/FirstQuarterResultsPage.jsx: computeRole(domains) called after domains
  are resolved; RoleResult rendered after facet breakdown with section heading
- en.json / ca.json: fqResults.roleSection and roles namespace added
  (R0=Opal/Opàl … R8=Comet/Cometa; beta_label, arc_label, essences)

### Phase 5.2 — Role wheel: α/β 2D visualisation ✅ COMPLETE
- src/utils/role-scoring.js: ROLE_PROJECTIONS exported (Digman α/β per centroid)
- src/components/RoleWheel.jsx: pure SVG; 9 role dots in 3 tiers; user position
  as amber ring+dot; axis labels; no external charting library
- en.json / ca.json: roles.you added
- NOTE: superseded by RoleProbabilityBars in Phase 5.4

### Phase 5.3 — Simplified pipeline + published prior statistics ✅ COMPLETE
- src/utils/role-scoring.js: SECTOR_MAP and all sector detection code removed;
  computeRole() now: normalise → centre rule → Euclidean to all 9 → buildResult
- Per-domain normative priors introduced:
    NORM_MEAN: E=3.3, A=3.9, C=3.7, N=2.8, O=3.7
    NORM_SD:   E=0.72, A=0.58, C=0.62, N=0.72, O=0.60
  Source: Johnson (2014) doi:10.1016/j.jrp.2014.05.003;
          Maples-Keller et al. (2019) doi:10.1080/00223891.2018.1467425
- Return object simplified to { role, arc, probabilities, alpha, beta }

### Phase 5.4 — Probability bars + Full Moon/Witness design documented ✅ COMPLETE
- src/utils/role-scoring.js: ROLE_PROJECTIONS export removed (unused after RoleWheel deleted)
- src/components/RoleWheel.jsx: deleted
- src/components/RoleProbabilityBars.jsx: ranked horizontal bars for all 9 roles,
  sorted by softmax probability descending; primary/arc/background colour tiers;
  percentage shown tabular-nums right-aligned; no SVG, no axes
- src/pages/FirstQuarterResultsPage.jsx: RoleWheel replaced with RoleProbabilityBars
- en.json / ca.json: roles.probability_label added
- CLAUDE.md: lunar phase table updated (Observer → Witness Cèrcol);
  Full Moon + Witness Cèrcol design section added

<!--
  EPOCH 3 — Full instrument suite
  Full Moon, Witness, complete product before redesign.
-->

### Phase 6 — Full Moon Cèrcol (self-report instrument) ✅ COMPLETE

#### Phase 6.1 — IPIP-NEO-120 self-report instrument ✅ COMPLETE
- src/data/full-moon.js: 120-item IPIP-NEO-120 instrument
  - Same 30 facets as First Quarter; 4 items per facet (vs 2 in FQ)
  - FM_ITEMS, FM_SCALE_LABELS, FM_DOMAIN_META, FM_FACET_META
  - All items from public-domain IPIP pool (ipip.ori.org)
  - Source: Johnson (2014) doi:10.1016/j.jrp.2014.05.003
- src/utils/full-moon-scoring.js: computeFMScores, fmScoreToPercent, fmScoreLabel
  - Same logic as First Quarter; domain score = mean of 24 items (6 facets × 4)
- src/pages/FullMoonPage.jsx: 5 blocks of 24 items (one block per domain)
  - Exact same architecture as FirstQuarterPage; keyboard nav, transitions, FeedbackContext
- src/pages/FullMoonResultsPage.jsx: radar + domain cards + 30-facet breakdown + role
  - Facet labels and descriptions reuse fqFacets namespace (same 30 facets)
  - Role result (RoleResult + RoleProbabilityBars) — same computeRole pipeline as FQ
  - Share via ?r=BASE64 encoded domain scores; result logging ('fullMoon' instrument)
- src/App.jsx: /full-moon and /full-moon/results routes added
- src/pages/HomePage.jsx: Full Moon Cèrcol card added (purple accent)
- src/components/FeedbackButton.jsx: /full-moon → 'fullMoon' instrument detection
- en.json / ca.json: fm.*, fmResults.*, fmDomains.*, home.fullMoon.* namespaces added
  (CA fully translated inline)

#### Bug fix (post-6.1) ✅ COMPLETE
- src/pages/MyResultsPage.jsx: ResultCard.instrumentLabel was a binary ternary
  (`newMoon` → NM name, everything else → FQ name). `fullMoon` rows were rendering
  in /my-results but labelled "First Quarter Cèrcol", making them invisible to the user
  as Full Moon completions. Fixed to a three-way switch (newMoon / fullMoon / firstQuarter).
  Added `fullMoon: { min: 1, max: 5 }` to INSTRUMENT_SCALE.
  FullMoonResultsPage.jsx confirmed correct: passes `user?.id ?? null` to logResult
  with instrument string `'fullMoon'`.

### Phase 6.2 — Full Moon gate + polish ✅ COMPLETE
- api/main.py: Stripe success_url and cancel_url updated from /first-quarter/results
  to /full-moon (were left pointing at the old FQ gate from Phase 4.5)
- src/pages/FullMoonPage.jsx: gate added at the top of the page
  - Not logged in → navigate('/auth')
  - Logged in, not premium → paywall screen (🌕 heading, body, includes list, Stripe CTA)
  - ?payment=success in URL → polls profiles.premium up to 8×1.5s; shows processing screen;
    graceful timeout message if webhook is delayed
  - Premium confirmed → show test as normal
  - Keyboard handler guarded so it only fires in gateState='ready'
- src/pages/FirstQuarterResultsPage.jsx: Full Moon CTA section added after role result,
  before share/actions — purple-bordered card, eyebrow label, one-line body, CTA button
- src/pages/HomePage.jsx: InstrumentCard now accepts paid + paidLabel props;
  Full Moon card shows purple "One-time payment" pill, purple hover border + title colour
- en.json / ca.json: fm.paywall.*, fqResults.fullMoonCta.*, home.fullMoon.paid added
  (CA fully translated inline)

### Phase 7 — Witness Cèrcol ✅ COMPLETE
- src/data/witness-adjectives.js: 100-adjective AB5C lexical corpus (public-domain IPIP markers)
  - 20 adjectives per OCEAN factor, 10 positive (+1) and 10 negative (−1) valence
  - Mapped to Cèrcol domain names (E=presence, A=bond, C=discipline, N=depth, O=vision)
  - ADJECTIVES_BY_FACTOR and FACTOR_TO_DOMAIN helpers exported
- supabase/migrations/004_witness.sql: witness_sessions and witness_responses tables
  - witness_sessions: subject_id FK, token (unique hex string), witness_name, optional email, completed_at
  - witness_responses: session_id FK, domain_scores (jsonb)
  - RLS: subject reads own sessions/responses; public insert on responses (API validates token)
  - Indexes on token (hot path) and subject_id
- src/utils/witness-scoring.js: scoring and round generation utilities
  - buildRounds(20): shuffled-cycle algorithm — one adjective per factor per round, no early repeats
  - computeWitnessScores(rounds): net votes per factor → 1–5 scale (score = 3 + mean_vote × 2)
  - computeInterimRole(rounds): live role probabilities from partial completions
  - detectDivergence(self, witness, threshold=0.8): returns blind-spot list by |z-score diff|
  - averageWitnessScores(scoreSets): mean domain scores across multiple witnesses
- api/main.py: 4 new endpoints; version bumped to 0.4.0
  - POST /witness/sessions (auth): creates up to 12 sessions, returns [{token, name, link}]
  - GET /witness/session/{token} (public): returns {witness_name, completed}
  - POST /witness/session/{token}/complete (public): saves domain scores, marks completed
  - GET /witness/my-sessions (auth): returns sessions with scores for completed ones
  - _supabase_get() and _supabase_post() helpers added; _supabase_headers() extracted
  - Pydantic models: WitnessInput, CreateSessionsBody, DomainScores, CompleteSessionBody
- src/lib/api.js: createWitnessSessions(), getWitnessSession(), completeWitnessSession(),
  getMyWitnessSessions() added; publicFetch() helper extracted alongside authFetch()
- src/pages/WitnessSetupPage.jsx: authenticated + premium, form for up to 12 witnesses
  - Gate: not logged in → /auth; not premium → /full-moon
  - Lists existing sessions (pending / completed) with copy-link button
  - Generates share links after submit; refreshes session list
- src/pages/WitnessPage.jsx: public at /witness/:token
  - Phases: loading → intro → instrument (20 rounds) → submitting → complete
  - Each round: 5 adjective cards (one per factor), pick BEST (green) + WORST (red)
  - Progress bar, back navigation, submit on final round
  - Handles 404 / already-completed / error states
- src/pages/FullMoonReportPage.jsx: integrated self + witness report at /full-moon/report
  - Requires auth; fetches FM self-report from results table (most recent fullMoon row)
  - Fetches witness sessions from API; shows pending / complete list
  - ≥2 complete: averaged domain comparison bars + witness role result + divergence section
  - Divergence: domains where |self_z − witness_z| > 0.8 shown as blind spots
  - < 2 complete: prompt to invite more witnesses
- src/pages/FullMoonResultsPage.jsx: Witness Cèrcol CTA added after role section (shown only
  after real test completion via fromTest flag) — "Invite a witness" + "View full report"
- src/App.jsx: /full-moon/report, /witness-setup, /witness/:token routes added
- en.json / ca.json: witness.setup.*, witness.page.*, witnessResults.*, fmResults.witnessCta.*
  namespaces added (CA fully translated inline)

#### Manual tasks (Miquel)
- In Supabase SQL editor: run migration 004_witness.sql
- Deploy API to Railway (api/main.py version 0.4.0)

### Phase 7.1 — Witness Cèrcol: three instrument fixes ✅ COMPLETE

**Fix 1 — Landing screen subject name**
- supabase/migrations/005_witness_subject.sql: adds `subject_display` (text) column to witness_sessions
- api/main.py POST /witness/sessions: stores authenticated user's email (from JWT) as subject_display
- api/main.py GET /witness/session/{token}: now returns subject_display alongside witness_name
- WitnessPage.jsx: intro screen shows two separate fields:
  - "You're describing: [subject_display]" — read-only, populated from API
  - "You are: [witness_name]" — editable text input, pre-filled from session
- Instruction during instrument uses subject_display (the person being described), not witness_name
- New locale keys: witness.page.intro.youAreLabel, witness.page.intro.youArePlaceholder

**Fix 2 — Adjective tooltips**
- witness-adjectives.js: all 100 adjectives now carry `tip: { en, ca }` — a short explanatory phrase
- WitnessPage.jsx AdjCard component: shows a small circular (i) button next to each adjective card
  - Tooltip appears on hover and keyboard focus (group-hover / group-focus-within Tailwind classes)
  - Pure CSS/Tailwind — no external tooltip library; absolute-positioned bubble with downward arrow
  - (i) click does not propagate to the adjective card
- New locale key: witness.page.tooltipLabel (aria-label for the (i) button)

**Fix 3 — Round polarity (critical design fix)**
- witness-adjectives.js: adjective IDs renamed from w001…w100 format to {factor}{sign}{nn}
  (e.g. E+01, E-01, A+01, N+03) — id now encodes factor, pole and sequence number
- witness-scoring.js buildRounds() completely rewritten:
  - Positive pole: E+, A+, C+, N−, O+  (high E/A/C/O = low N = calm)
  - Negative pole: E−, A−, C−, N+, O−  (low E/A/C/O = high N = anxious)
  - Fixed 20-round polarity sequence: P P N P P P N P P N P P P N P P N P P P
    (14 positive, 6 negative — 70/30 split)
  - Each positive round draws from the positive-pole pool for all 5 factors;
    each negative round draws from the negative-pole pool
  - POSITIVE_POLE_SIGN map governs which id sign goes into which pool per factor;
    N factor is inverted (N− is the positive pole, N+ is the negative pole)
  - getPoleAdjectives() helper filters each factor's pool by the correct id sign
  - Shuffled-cycle within each pool — no adjective repeats before the pool is exhausted
  - computeWitnessScores(), computeInterimRole(), detectDivergence(), averageWitnessScores() unchanged

#### Manual tasks (Miquel)
- In Supabase SQL editor: run migration 005_witness_subject.sql

### Phase 8 — Documentation and content site ✅ COMPLETE
Phase 8.1 revision: radical transparency architecture — anyone can read the surface, or go deep.

**Five public doc routes, no login required, fully bilingual (EN + CA):**
- /about        — what Cèrcol is, philosophy ("built in the open"), explore-deeper cards,
                  five dimensions grid, "what Cèrcol is not" list, score framing note
- /instruments  — deep page: New Moon (7-point scale, 3 sample items, get/measures breakdown),
                  First Quarter (5-point, 30 facets), Full Moon as three-part system:
                  Part 1 self-report, Part 2 Witness (why/how/who/privacy/blind spots),
                  Part 3 cognitive ability; start CTAs on all three
- /roles        — nine roles with OCEAN tendency profiles derived from SCIENCE.md centroids,
                  contributes/misses per role, beta disclaimer, "why not Belbin" section,
                  R0/arc/context notes, GitHub issues CTA
- /science      — unchanged from Phase 8
- /faq          — unchanged from Phase 8

**Layout.jsx:** two-row header — row 1 brand + controls, row 2 five nav links (About · Instruments · Roles · Science · FAQ) with overflow-x-auto for mobile; NavLink active state preserved

**Locale changes:**
- en.json: added nav.instruments / nav.roles; reworked about.* (removed instruments subsection,
  added philosophy / explore / notThis); added instruments.* and rolesPage.* namespaces
- ca.json: same structural changes with full Valencian translations throughout

Phase 8.2 addition: instrument intro screens ✅ COMPLETE

**Intro screens added to all three instrument pages** (shown before first item, after any gate):
- NewMoonPage: showIntro state (default true) → centered screen with 🌑 emoji, heading, meta,
  scale card (1–7), guidance sentence, Begin button; transitions to existing test flow
- FirstQuarterPage: same pattern with 🌓, scale 1–5, FQ-specific guidance
- FullMoonPage: same pattern with 🌕, scale 1–5, FM guidance, plus partNote explaining
  this is self-report part 1 of 3 (Witness + cognitive follow)
- Keyboard: Enter/Space on intro screen triggers Begin (same pattern as transition screens)
- Removed redundant first-item instruction banners from all three pages
- Locale keys: newMoon.intro.*, fq.intro.*, fm.intro.* in en.json and ca.json (full EN + CA)

### Phase 9 — Full Moon integrated report
- Combines self-report (Phase 6), Witness (Phase 7), and ICAR into one report
- Convergence score: self vs witness role agreement
- Blind spots: dimensions where self and witness diverge significantly
- ICAR cognitive ability measure integrated
- Final definitive role result replaces beta label

### Phase 10 — Full UX/UI redesign
- Full visual identity applied via tokens.js
- Designed once the full product scope (Phases 6–9) is known and stable

### Phase 11 — Multilingual support
- Translate all items and UI strings beyond Valencian
- Translation management via Tolgee or equivalent

### Phase 12 — Living model
- GitHub Actions job every 28 days: compute sample mean/SD per domain
- Update normalisation priors when N≥200
- Replace theoretical centroids with k-means centroids at N≥300
- Internal validation dashboard

---

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
