# Cèrcol — Roadmap

<!--
  COMPLETED PHASES SUMMARY (1–7.1)
  Full detail preserved in git history.
-->

## Epochs 1–2: completed phases summary

| Phase | What was built |
|-------|---------------|
| 1 | New Moon Cèrcol MVP (10 items, radar chart). GitHub Pages. |
| 2 | First version 30-item test. Anonymous result logging. i18n foundation. |
| 3 | Dual instrument homepage. Dimension names. UX polish. |
| 3.5 | Bilingual test items (EN + CA structure in data files). |
| 3.6–3.8 | Keyboard nav, Likert fixes, translation feedback, block transitions. |
| 3.9 | Dimension and facet descriptions on results pages. |
| 3.10 | Lunar phase naming. First Quarter Cèrcol (IPIP-NEO-60, 60 items, 30 facets). |
| 3.11–3.13 | Housekeeping: scoring utilities consolidated, domains.js as single source of truth. |
| 3.14 | README.md. |
| 3.15 | Credentials to environment variables. |
| 3.16–3.18 | Display bug fixes. Complete rename to FirstQuarter. Lunar phase map to 4 phases. |
| 3.19 | Custom domain: cercol.team. |
| 4.1 | FastAPI skeleton on Railway. Supabase profiles schema. |
| 4.2 | Magic link auth (frontend + backend). Supabase JWT via JWKS/ES256. |
| 4.3 | Linked results. My Results page. |
| 4.4 | Shared Layout component. HTTPS bug fixes. |
| 4.5 | Stripe infrastructure (checkout + webhook + premium column). |
| 4.6 | Multi-method auth: Google OAuth + password + magic link. |
| 4.7 | FQ gate removed. Freemium model documented. |
| 5 | Beta role scoring in First Quarter. 9-role system (superseded in Phase 8.3). RoleProbabilityBars. |
| 6.1 | Full Moon Cèrcol: IPIP-NEO-120, 120 items, 5 blocks, results page. |
| 6.2 | Full Moon gate (Stripe). Paywall screen. FQ → FM upgrade CTA. |
| 7 | Witness Cèrcol: 100-adjective AB5C corpus, 20 rounds forced choice, up to 12 witnesses, /full-moon/report. |
| 7.1 | Witness fixes: subject name on intro, adjective tooltips, round polarity (70/30, no pole mixing). |

## Epoch 3: documentation and role system

### Phase 8 — Documentation and content site ✅ COMPLETE
Five public routes, no login, bilingual EN + CA:
- /about — philosophy, dimensions, explore-deeper cards, score framing
- /instruments — all three instruments with full Witness documentation
- /roles — role system, scientific grounding, "why not Belbin", GitHub CTA
  (content updated in Phase 8.3)
- /science — scientific foundation, full references
- /faq — privacy, accuracy, Witness, differences, retaking

Layout: two-row header, five nav links, mobile safe.

### Phase 8.2 — Instrument intro screens ✅ COMPLETE
Intro screen before first item on all three instruments.
Scale explanation, guidance sentence, Begin button (Enter/Space).
Redundant first-item banners removed.

### Phase 8.3 — Role system migration: 9 roles → 12 animal roles ✅ COMPLETE
Complete replacement of the role system. The old 9-role system
(R0 Opal through R8 Comet) is fully superseded.

**Scientific basis** (documented in SCIENCE.md):
- 3 balance dimensions (Bell 2007): Presence (E), Bond (A), Vision (O)
- 12 roles covering all six P×B, P×V, B×V intersections at both poles
- Centroids in 5D space (E, A, O, C, N z-scores)
- C and N modulate expression, not balance
- No centre role: profiles near origin described by C/N values
- Euclidean distance in full 5D; softmax probabilities; arc > 15%

| ID  | EN       | CA       | Profile |
|-----|----------|----------|---------|
| R01 | Dolphin  | Dofí     | P+ B+   |
| R02 | Wolf     | Llop     | P+ B-   |
| R03 | Elephant | Elefant  | P- B+   |
| R04 | Owl      | Mussol   | P- B-   |
| R05 | Eagle    | Àguila   | P+ V+   |
| R06 | Falcon   | Falcó    | P+ V-   |
| R07 | Octopus  | Polp     | P- V+   |
| R08 | Tortoise | Tortuga  | P- V-   |
| R09 | Bee      | Abella   | B+ V+   |
| R10 | Bear     | Ós       | B+ V-   |
| R11 | Fox      | Guineu   | B- V+   |
| R12 | Badger   | Teixó    | B- V-   |

Files to update: role-scoring.js, RoleResult.jsx, RoleProbabilityBars.jsx,
FirstQuarterResultsPage.jsx, FullMoonResultsPage.jsx, FullMoonReportPage.jsx,
/roles page, en.json, ca.json.

<!--
  EPOCH 4 — Integrated report and living model
-->

### Phase 9.1 — Locale and Belbin fixes ✅ COMPLETE
- en.json: 12 role `ca` fields changed from Valencian to English names
- en.json: `about.intro.founding` translated to English
- en.json + ca.json: `rolesPage.notBelbin` section removed (Belbin not user-facing)
- RolesPage.jsx: "Why not Belbin?" InfoBox removed

### Phase 9 — Full Moon integrated report ✅ COMPLETE
Combines self-report and Witness into a single coherent narrative at /full-moon/report.

- **Convergence score**: Jaccard overlap between self role set (primary+arc) and
  witness role set. Three bands: high ≥60%, moderate 30–59%, low <30%. Plain-language
  sentence per band. Visual progress bar.
- **Consolidated blind spots**: per-dimension descriptions for all 5 dimensions ×
  2 directions (self > witness, witness > self). Brand voice. Full CA translations.
- **Definitive role result**: when ≥2 Witnesses have completed, beta badge replaced
  with "Witness included" indicator + explanatory note. First Quarter and
  FullMoonResultsPage retain the beta badge (no Witness signal there).
- **Narrative page structure**: self role → witness role → convergence → blind spots
  → domain bars → witness session list. Each section clearly headed.
- `computeConvergence()` added to witness-scoring.js.
- `RoleResult` updated with `definitive` prop.

### Phase 9.2 — Pre-Phase 10 audit fixes ✅ COMPLETE
- en.json + ca.json: "nine roles" → "twelve roles" in `about.explore.roles.desc`
- en.json + ca.json: "IPIP" removed from `instruments.firstQuarter.scaleNote`
- RoleProbabilityBars.jsx: 4 hardcoded hex values replaced with design tokens (`colors.arcBar`, `colors.arcLabel`, `colors.border`; bar track inline style replaced with Tailwind `bg-gray-100`)
- tokens.js: added `arcBar` and `arcLabel` tokens
- ca.json: 60 `fqFacets` high/low descriptions translated to Valencian (labels were already translated)

### Phase 10 — Full UX/UI redesign
Brand identity and visual foundation. Sub-phases apply the identity across all pages.

### Phase 10.5 — Results pages dashboard redesign ✅ COMPLETE
Redesigned all four results/report pages as dashboards.

- **Role first**: FQ and FM surface role name (Playfair Display text-4xl/5xl) at the top in a
  full-width Card with 3px left red accent border. Beta badge, essence text, arc chips inline.
- **Two-column layout**: RadarChart card (left) + compact domain rows card (right)
  (`grid-cols-1 md:grid-cols-2`). Domain rows use dividers instead of individual cards.
- **Role probability bars**: Full width, 2×6 grid (`columns={2}` prop on RoleProbabilityBars).
- **Facets**: Two columns of domain cards, compact rows within.
- **Actions**: Share + Start over in a single flex row.
- **NewMoon**: No role/facets. Two-column radar+domains → upgrade CTA → actions row.
- **NewMoon i18n fix**: `domains.${key}.label` (TIPI keys) → `fqDomains.${key}.name`
  (Cèrcol keys, matching remapped scores). New bundle hash forces CDN cache bust.
- **FullMoonReportPage combined role**: Two separate role cards replaced with a single
  combined role card. Combined score = self × 2/3 + witness × 1/3 via
  `computeCombinedRole(selfResult, witnessResult)` in witness-scoring.js.
  Probability bars show 3 stacked rows (combined / self / witness) when ≥1 witness complete;
  single row when no witnesses. Legend with Combined / Self / Witness color keys.
  All witness logic (convergence, blind spots, domain comparison, session list) unchanged.

### Phase 10.4 — Centralized component system + mobile navigation ✅ COMPLETE
**Fix 1 — Component system (src/components/ui/):**
- Button.jsx: variant primary|secondary|ghost, size sm|md|lg, 4px radius
- Card.jsx: white bg + 1px gray border + 4px radius; accent variant = 3px left border only
- Badge.jsx: variant default|beta|paid|free; 4px radius
- SectionLabel.jsx: eyebrow text; color blue|red|green|amber|gray
- index.js: barrel export for clean imports
- index.css: global `button, input, textarea, select { border-radius: 4px }` reset
- All 23 updated files remove hardcoded rounded-2xl/rounded-xl/rounded-lg in favour of
  `rounded` (4px) from the shared components
- Pages updated: AboutPage, InstrumentsPage, RolesPage, SciencePage, FaqPage,
  AuthPage, MyResultsPage, NewMoonResultsPage, FirstQuarterResultsPage,
  FullMoonResultsPage, WitnessSetupPage, WitnessPage, FullMoonReportPage,
  FullMoonPage (paywall section), RoleResult, RoleProbabilityBars
- No page defines its own button or card styles

**Fix 2 — Mobile hamburger navigation:**
- Layout.jsx: hamburger icon button on mobile (below md breakpoint)
- Full-width blue dropdown below header with vertical nav links
- Each link closes menu on click
- Desktop (md+): existing horizontal nav unchanged; hamburger hidden

### Phase 10.3 — Purple removal + homepage vertical centering ✅ COMPLETE
- Removed all Tailwind purple-*, violet-*, indigo-* from every user-facing component and page
- Vision dimension bars: `bg-purple-500` → `bg-[#427c42]` (green) in 5 files
  (MyResultsPage, NewMoonResultsPage, FirstQuarterResultsPage, FullMoonResultsPage, FullMoonReportPage)
- Vision DOMAIN_ACCENT: `bg-purple-500` → `bg-[#427c42]` in FirstQuarterPage, FullMoonPage
- CTA buttons: `bg-purple-600 hover:bg-purple-700` → `bg-[#0047ba] hover:opacity-90 transition-opacity` across
  FirstQuarterResultsPage, FullMoonResultsPage, FullMoonReportPage (×2), WitnessSetupPage, WitnessPage (×2), FullMoonPage
- Secondary buttons: `border-purple-200 text-purple-700 hover:bg-purple-50` → `border-[#0047ba] text-[#0047ba] hover:bg-[#e8eef8]`
  in FullMoonResultsPage, WitnessSetupPage
- Section eyebrows and labels: `text-purple-400/500` → `text-[#0047ba]` across 5 files
- Borders: `border-purple-100` → `border-gray-200` in FirstQuarterResultsPage, FullMoonResultsPage, WitnessSetupPage
- Witness score values: `text-purple-600` → `text-[#0047ba]` in FullMoonReportPage (×2)
- Witness comparison bar: `bg-purple-300` → `bg-[#99b3e0]` in FullMoonReportPage (bar + legend dot)
- Definitive badge: `bg-purple-50 text-purple-700` → `bg-[#e8eef8] text-[#0047ba]` in RoleResult
- RolesPage: R07 Octopus + R11 Fox role accents violet/indigo → `text-[#427c42] bg-[#eaf2ea]`
- WitnessPage progress bar: `bg-purple-500` → `bg-[#0047ba]`; focus ring → `focus:ring-[#99b3e0]`
- FullMoonPage paywall disabled state: `bg-purple-300` → `bg-[#99b3e0]`
- HomePage: cards vertically centered (flex-1 flex items-center; removed fixed 80px top spacer)

### Phase 10.2 — Homepage card fix + centralized layout container ✅ COMPLETE
- HomePage: instrument cards redesigned — white bg, 3px solid left border in instrument color,
  name in instrument color, hover fills with instrument color (text inverts), transition-colors 200ms
- Layout.jsx: centralized white content wrapper (bg-white, max-w-4xl mx-auto, px-4 sm:px-8,
  min-h-[calc(100vh-4rem)]); homepage opts out via useLocation check (pathname === '/')
- Removed redundant declarations from 13 pages:
  - AboutPage, InstrumentsPage, RolesPage, SciencePage, FaqPage: removed bg-gray-50, min-h-screen,
    max-w-xl mx-auto px-4 outer wrapper; py-12 stays on main
  - NewMoonResultsPage, FirstQuarterResultsPage, FullMoonResultsPage, WitnessSetupPage:
    removed bg-gray-50, min-h-screen, px-4, max-w-xl mx-auto w-full from inner container
  - MyResultsPage: removed bg-gray-50, min-h-screen, flex centering, px-4, max-w-xl from wrapper
  - AuthPage: removed bg-gray-50, min-h-screen, px-4; flex centering kept; min-h-[calc(100vh-4rem)]
  - FullMoonReportPage: removed same from 3 loading/error states and main content wrapper

### Phase 10.1 — Brand identity foundation + homepage redesign ✅ COMPLETE
- tokens.js: brand palette (#cf3339 red, #0047ba blue, #f1c22f yellow, #427c42 green, #ffffff, #111111); all generic palette colors replaced
- tokens.js: typography updated — Playfair Display (display/headings) + Roboto (body/UI)
- tokens.js: Big Five dimension colors remapped to brand palette
- index.css: Google Fonts imports (Playfair Display 400/700, Roboto 400/500/700); global h1/h2/h3 rule for Playfair Display; body font → Roboto
- Layout.jsx: single-row blue header (full-width, px-8/px-12); inline SVG logo (CercolLogo.jsx, white); white nav links; border-radius 4px on nav pills
- AccountButton.jsx + LanguageToggle.jsx: updated for blue header context (white text, white-bg active state)
- FeedbackButton: "Report issue" floating link removed; translation feedback panel retained
- HomePage.jsx: full redesign — blue background, 3-column instrument card grid (red/green/yellow cards), no tagline/headline, footer with GitHub + report issue links

### Phase 10.7 — Animal illustrations on role cards ✅ COMPLETE
12 animal illustrations integrated into the role card on all three results pages.

- `src/assets/illustrations/` — 12 JPGs: `role-r01-dolphin.jpg` through `role-r12-badger.jpg`
  (Fox and Badger converted from ~6MB PNG to JPG quality 85, max 800px via sharp: 92KB / 67KB)
- `src/data/roles.js` — new file; imports all illustrations with `?url`, exports `ROLE_ILLUSTRATIONS`
  map with `{ src, bg }` per role ID. Most `bg: '#0047ba'`; Owl (R04) `bg: '#cf3339'`
- `FirstQuarterResultsPage`, `FullMoonResultsPage`, `FullMoonReportPage`: role card
  (`Card accent="red" overflow-hidden`) is a two-column flex row:
  left column (`flex-1 p-6 sm:p-8`) holds badge + role name + essence + arc chips;
  right column (`w-[120px] sm:w-[160px] shrink-0 overflow-hidden`) holds the illustration
  `object-cover object-center` on a solid brand-color background (`illustrationBg`), flush to
  the card's right/top/bottom edges.
- `RoleResult.jsx` updated consistently (not currently used by any page).

### Phase 10.6 — Test flow pages brand identity ✅ COMPLETE
Applied brand identity to all four test flow pages (NewMoonPage, FirstQuarterPage, FullMoonPage, WitnessPage) and shared test components.

- **LikertScale**: `rounded` (4px), inline styles from `colors.blue` token for selected state (both mobile/desktop), brand hover colors
- **QuestionCard**: `rounded` (4px), no shadow, item prefix uses `style={{ color: colors.blue }}`
- **ProgressBar**: fill bar uses `style={{ backgroundColor: colors.blue }}` from token
- **Intro screens** (all three instruments): removed `min-h-screen bg-gray-50`; info card `rounded`; "Scale" label → `<SectionLabel color="gray">`; CTA → `<Button variant="primary">`; vertically centered via `min-h-[calc(100vh-4rem)]`
- **Transition screens** (FQ + FM): same bg/layout fix; CTA → `<Button variant="primary">`
- **Answering screens** (all three): removed `min-h-screen bg-gray-50`; block header `rounded`, no shadow; back → `<Button variant="secondary">`, next → `<Button variant="primary" disabled>`
- **Gate screens** (FM checking/processing/paywall): removed `min-h-screen bg-gray-50`
- **WitnessPage**: removed `min-h-screen bg-gray-50` from all phase screens; instrument back button → `<Button variant="secondary">`; intro/terminal screens vertically centered via `min-h-[calc(100vh-4rem)]`

### Phase 10.8 — Moon phase SVG line icons ✅ COMPLETE
Replaced all moon emoji (🌑 🌓 🌕) and functional emoji (✓) with custom SVG line icons
drawn in the Cèrcol brand style: stroke-based, currentColor, slightly imperfect bezier paths,
strokeLinecap="round". All icons defined in `src/components/MoonIcons.jsx`.

**Icons created:**
- `NewMoonIcon` — hatched circle (outline + 5 diagonal shade lines through the disc)
- `FirstQuarterIcon` — closed D-shape path (right arc + gentle-bow terminator)
- `FullMoonIcon` — slightly irregular circle + 3 crater ovals (strokeWidth 1.2/1.0)
- `CheckIcon` — single stroke checkmark path

**Files modified (10 locations):**
- `src/components/MoonIcons.jsx` — new file with all four icons
- `src/pages/HomePage.jsx` — 3 instrument cards: emoji → `<NewMoonIcon size={44} />`, `<FirstQuarterIcon size={44} />`, `<FullMoonIcon size={44} />`;
  icon wrapper `div` gets `style={{ color: hovered ? textColor : accentColor }}` so icons track hover color like the name
- `src/pages/InstrumentsPage.jsx` — 3 SectionLabel eyebrows: emoji → inline icon at size 13
- `src/pages/NewMoonPage.jsx` — intro screen: emoji → `<NewMoonIcon size={40} style={{ color: colors.red }} />`
- `src/pages/FirstQuarterPage.jsx` — intro screen: `<FirstQuarterIcon size={40} style={{ color: colors.green }} />`
- `src/pages/FullMoonPage.jsx` — paywall + intro screens: `<FullMoonIcon size={36/40} style={{ color: colors.blue }} />`
- `src/pages/FirstQuarterResultsPage.jsx` — Full Moon CTA eyebrow: `<FullMoonIcon size={13} />`
- `src/pages/FullMoonResultsPage.jsx` — Witness CTA eyebrow: `<FullMoonIcon size={13} />`
- `src/pages/FullMoonReportPage.jsx` — page header SectionLabel: `<FullMoonIcon size={13} />`
- `src/pages/WitnessSetupPage.jsx` — header eyebrow: `<FullMoonIcon size={13} />`; Copied button: ✓ emoji → `<CheckIcon size={12} />`
- `src/pages/WitnessPage.jsx` — done screen: ✓ emoji → `<CheckIcon size={40} style={{ color: colors.green }} />`

### Phase 11 — Multilingual support
Translation management via Tolgee or equivalent.
EN + CA already complete; this phase adds languages beyond Valencian.

### Phase 12 — Living model
- GitHub Actions job every 28 days: update NORM_MEAN/NORM_SD at N≥200
- At N≥300: k-means (k=12) in 5D; update centroids if divergence
  is systematic
- Internal validation dashboard (read-only, authenticated)
- If role model evolves to incorporate g: add ICAR collection then

---

## Roadmap maintenance rules

These rules apply to every phase completion. Follow them without exception.

**On phase/sub-phase completion:**
Mark the phase as `✅ COMPLETE` immediately after `npm run deploy` succeeds.
Update the description to reflect exactly what was implemented — remove items
not done, add relevant notes if needed. Do not modify any other phase.

**On phase splitting:**
If a phase that was defined as a single block requires a second sub-phase,
split the original phase into numbered sub-phases (e.g. 8 → 8.1 + 8.2).
Remove any content from the parent phase entry that is now covered by the
sub-phases. The parent entry should only contain a one-line summary and
links to the sub-phases — never duplicate content at both levels.

**On epoch completion:**
When all phases in an epoch are complete and the next epoch begins, compress
the completed epoch into the summary table format used for Epochs 1–2 in this
file. One row per phase, one-line description. Full detail is preserved in git
history. The goal is to keep the active roadmap readable and under ~150 lines.

## Phase completion criteria

A numbered phase is complete when:
1. All planned features are live at the production URL
2. No known bugs block the core user journey
3. Result logging verified for all active instruments
4. CLAUDE.md reflects the actual codebase state
5. Next phase has defined scope

A sub-phase (x.y) is complete when:
1. npm run build passes
2. npm run deploy succeeds
3. Feature is verifiable at the production URL