# Cèrcol — Roadmap

<!--
  COMPLETED PHASES SUMMARY (1–9.2)
  Full detail preserved in git history.
-->

## Epochs 1–3: completed phases summary

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
| 8 | Documentation site: five routes (/about, /instruments, /roles, /science, /faq) — bilingual EN + CA. |
| 8.2 | Instrument intro screens before first item on all three instruments. |
| 8.3 | Role system: 9 roles → 12 animal roles (Dolphin–Badger). AB5C-based 5D centroids, softmax assignment, 15% arc threshold. |
| 9.1 | Locale fixes: 12 role CA fields corrected, founding phrase translated to English, Belbin section removed from /roles. |
| 9 | Full Moon integrated report: combined role (self × 2/3 + witness × 1/3), convergence score (Jaccard), blind spots per dimension, narrative layout at /full-moon/report. |
| 9.2 | Pre-Phase 10 audit: i18n corrections, design token cleanup, 60 FQ facet CA descriptions translated. |

## Epoch 4: UI redesign, languages, and infrastructure

### Phase 10 — Full UX/UI redesign ✅ COMPLETE
Brand identity and visual foundation. All 20 sub-phases below are complete.

### Phase 10.1 — Brand identity foundation + homepage redesign ✅ COMPLETE
- tokens.js: brand palette (#cf3339 red, #0047ba blue, #f1c22f yellow, #427c42 green, #ffffff, #111111); all generic palette colors replaced
- tokens.js: typography updated — Playfair Display (display/headings) + Roboto (body/UI)
- tokens.js: Big Five dimension colors remapped to brand palette
- index.css: Google Fonts imports (Playfair Display 400/700, Roboto 400/500/700); global h1/h2/h3 rule for Playfair Display; body font → Roboto
- Layout.jsx: single-row blue header (full-width, px-8/px-12); inline SVG logo (CercolLogo.jsx, white); white nav links; border-radius 4px on nav pills
- AccountButton.jsx + LanguageToggle.jsx: updated for blue header context (white text, white-bg active state)
- FeedbackButton: "Report issue" floating link removed; translation feedback panel retained
- HomePage.jsx: full redesign — blue background, 3-column instrument card grid (red/green/yellow cards), no tagline/headline, footer with GitHub + report issue links

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

### Phase 10.9 — Functional line icons across UI ✅ COMPLETE
Extended MoonIcons.jsx with 8 new functional icons in the Cèrcol brand style
(stroke-based, no fills, slightly organic, 24×24 viewBox) and applied them across the UI.

**New icons added to `src/components/MoonIcons.jsx`:**
- `ArrowLeftIcon` — back navigation (shaft + arrowhead, slight curve)
- `ArrowRightIcon` — forward navigation
- `KeyboardIcon` — keyboard body outline + top key-row caps + spacebar
- `InfoCircleIcon` — irregular circle + i dot + i stem (replaces manual `i` text)
- `XIcon` — × cross (worst-fit legend)
- `ChevronRightIcon` — › chevron (list row indicator)
- `ShareIcon` — upload arrow over tray base
- `BlindSpotsIcon` — two arrows diverging outward from a central gap

**Files modified (9 locations):**
- `src/pages/NewMoonPage.jsx` — back/next buttons: `← Back` / `→ Next`;
  added missing `import { colors }` (latent bug fixed)
- `src/pages/FirstQuarterPage.jsx` — back/next buttons in answering screen
- `src/pages/FullMoonPage.jsx` — back/next buttons in answering screen
- `src/components/QuestionCard.jsx` — KeyboardIcon left of keyboard hint (`<p>` → `<p>` flex row)
- `src/pages/WitnessPage.jsx` — InfoCircleIcon replaces manual `i` button; CheckIcon/XIcon replace colored dots in best/worst legend
- `src/pages/FirstQuarterResultsPage.jsx` — ShareIcon inline left of Share button label
- `src/pages/FullMoonResultsPage.jsx` — ShareIcon inline left of Share button label
- `src/pages/MyResultsPage.jsx` — ChevronRightIcon right-aligned in each ResultCard header row
- `src/pages/FullMoonReportPage.jsx` — BlindSpotsIcon inline in blind spots SectionLabel

### Phase 10.10 — Animal role icons + dimension icons ✅ COMPLETE
Extended MoonIcons.jsx with 12 animal role icons and 5 dimension icons, plus two convenience wrapper components.

**New icons added to `src/components/MoonIcons.jsx`:**
- 12 animal role icons (32×32 viewBox): `DolphinIcon`, `WolfIcon`, `ElephantIcon`, `OwlIcon`, `EagleIcon`, `FalconIcon`, `OctopusIcon`, `TortoiseIcon`, `BeeIcon`, `BearIcon`, `FoxIcon`, `BadgerIcon`
- 5 dimension icons (24×24 viewBox): `PresenceIcon` (sun/radial lines), `BondIcon` (interlocking circles), `VisionIcon` (eye), `DepthIcon` (waves + arrow), `DisciplineIcon` (target/concentric circles)
- `RoleIcon({ role, size, className, style })` — wrapper that maps R01–R12 to the correct animal icon
- `DimensionIcon({ domain, size, className, style })` — wrapper that maps domain key to the correct dimension icon

**Files modified:**
- `src/pages/RolesPage.jsx` — RoleIcon (size 28, accent color) added to each RoleCard header in a flex layout with role name + essence
- `src/pages/NewMoonResultsPage.jsx` — DimensionIcon (size 15) preceding domain name in each domain row
- `src/pages/FirstQuarterResultsPage.jsx` — same pattern; DOMAIN_ICON_COLOR map added
- `src/pages/FullMoonResultsPage.jsx` — same pattern; DOMAIN_ICON_COLOR map added
- `src/pages/FirstQuarterPage.jsx` — DimensionIcon (size 16) replaces colored dot span in block section header
- `src/pages/FullMoonPage.jsx` — same
- `src/pages/FullMoonReportPage.jsx` — DimensionIcon added to DomainComparisonRow via new `domainKey` prop; DOMAIN_ICON_COLOR map added

### Phase 10.11 — Animal icon redesign + dimension icons on About page ✅ COMPLETE
All 12 animal role icons redrawn from scratch in MoonIcons.jsx for greater recognisability and uniqueness.
DimensionIcon added to the About page dimension cards.

**Icon redesign principles applied:**
- Every icon shows the **full animal** with its most distinctive silhouette feature
- Eagle and Falcon are now unambiguously different: Eagle is **perched** with a massive hooked beak and folded wings; Falcon is in a **diving stoop** with long swept-back pointed wings and the signature **facial teardrop/malar stripe**
- Dolphin: full leaping arc with long rostrum, dorsal fin, pectoral fin, forked tail flukes
- Wolf: front-facing, very tall sharp ear triangles, elongated muzzle
- Elephant: side view, giant fan ear (left), long curved hanging trunk, short tusk
- Owl: round face disk, two large circle eyes with pupil dots, paired ear tufts
- Bear: front-facing, large round head, small round ears, oval muzzle
- Fox: sitting side profile, one sharp ear, pointed snout, **large bushy tail** sweeping around body
- Badger: front-facing, two thick parallel dark facial stripes flanking the white center stripe
- Octopus, Tortoise, Bee: refined for clarity

**Files modified:**
- `src/components/MoonIcons.jsx` — all 12 animal icon functions replaced with redesigned paths
- `src/pages/AboutPage.jsx` — `DimensionCard` receives `domainKey` prop; `DimensionIcon` added to each dimension card heading (size 14, inherits accent color)

### Phase 10.12 — External potrace SVG animal icons ✅ COMPLETE
Replaced the 12 hand-drawn animal icon functions in MoonIcons.jsx with components
that render the externally-generated potrace SVGs inline, preserving the full
`RoleIcon` API and `currentColor` inheritance.

**Integration approach: Vite `?raw` import + `dangerouslySetInnerHTML`**
- Zero new npm dependencies; no changes to vite.config.js
- Each SVG imported as a raw string at build time via `import ... from '...?raw'`
- `prepareAnimalSvg(raw)` helper runs once at module load: extracts the `viewBox`
  attribute and strips the outer `<svg>`, `<?xml>`, `<!DOCTYPE>`, `<metadata>` wrappers,
  leaving the inner `<g transform fill="currentColor">` content
- Shared `AnimalSvg` component renders `<svg width height viewBox dangerouslySetInnerHTML>`
- Each of the 12 named exports (`DolphinIcon`, `WolfIcon`, …, `BadgerIcon`) is now a
  one-liner that delegates to `AnimalSvg` with its pre-parsed data
- `RoleIcon` wrapper and all call sites unchanged

**Files added:**
- `src/assets/icons/animals/cercol-icon-r01-dolphin.svg` … `cercol-icon-r12-badger.svg`
  (copied from `src/assets/icons_raw/`)

**Files modified:**
- `src/components/MoonIcons.jsx` — animal icon section replaced; 12 `?raw` imports +
  `prepareAnimalSvg` helper + `AnimalSvg` inner component + 12 one-liner exports

### Phase 10.13 — RoleIcon in RoleProbabilityBars ✅ COMPLETE
Added `RoleIcon` (size 18, `currentColor`) inline to the left of each role name
in the probability bar list.

**Files modified:**
- `src/components/RoleProbabilityBars.jsx` — imported `RoleIcon` from `MoonIcons`;
  role name `<span>` changed to `flex items-center gap-1.5`; `<RoleIcon role={r} size={18} />`
  added before the translated name. `r` (the role key R01–R12) was already the
  loop variable from `Object.entries(probabilities)`.

### Phase 10.14 — Replace JPG illustrations with RoleIcon in role cards ✅ COMPLETE
Decision: the technology for generating consistent rice-grain style illustrations
is not mature enough. JPG illustrations replaced by RoleIcon SVG icons on all
role cards. Illustrations remain on disk for future reference.

**Right column of role card** — was: `<img>` on a per-role solid background color.
Now: `<RoleIcon role={...} size={96} className="text-white opacity-90" />` centered
on `colors.blue` background (`w-[120px] sm:w-[160px] shrink-0 flex items-center justify-center`).
`RoleResult.jsx` header — was: full-bleed `<img>` block. Now: `<RoleIcon size={120}>` centered
on brand-blue with `py-8` padding.

**Files modified:**
- `src/data/roles.js` — all 12 JPG imports and `ROLE_ILLUSTRATIONS` export removed; file kept as stub with comment
- `src/components/RoleResult.jsx` — removed `ROLE_ILLUSTRATIONS` import; illustration block replaced with centered `RoleIcon` in blue header; imported `RoleIcon`
- `src/pages/FirstQuarterResultsPage.jsx` — `ROLE_ILLUSTRATIONS` → `RoleIcon`; illustration column replaced
- `src/pages/FullMoonResultsPage.jsx` — same
- `src/pages/FullMoonReportPage.jsx` — same (role variable: `combinedRole.role`)

**Phase 10.7 note:** JPG files remain at `src/assets/illustrations/` but are no longer
imported anywhere. Illustration work to be revisited when generation tooling matures.

### Phase 10.15 — Role card icon repositioning + Cèrcol circle radar ✅ COMPLETE
Two visual upgrades to unify the brand identity across results pages.

**Change 1 — Role card icon:**
- Two-column flex layout: left column = `RoleIcon` (size 64, `colors.red`, `w-24 shrink-0 flex items-center justify-center`) spanning full card height; right column = all content (badge, role name, essence, arc chips).
- No background colour, no divider or border between columns — column boundary implied by spacing alone.
- Card's existing `accent="red"` 3px left border preserved; red icon and red accent form a unified visual system.

**Files modified:**
- `src/pages/FirstQuarterResultsPage.jsx` — two-column layout with icon sidebar; RoleIcon size 64, `style={{ color: colors.red }}`
- `src/pages/FullMoonResultsPage.jsx` — same
- `src/pages/FullMoonReportPage.jsx` — same (role variable: `combinedRole.role`; conditional definitive/beta badge preserved)
- `src/components/RoleResult.jsx` — same; `Card accent="red"` added; full-width blue header from Phase 10.14 removed

**Change 2 — Radar chart → Cèrcol circle:**
- Grid rings: `PolarGrid gridType="circle"` — circular rings replace pentagon.
- Shape: custom `OrganicRadarShape` component renders a smooth closed cubic-Bézier path via `smoothClosedPath()` (Catmull-Rom → cubic Bézier, tension 0.4) instead of Recharts' straight-line polygon.
- Fill: SVG `<radialGradient gradientUnits="userSpaceOnUse">` centred at chart origin; lighter at centre (stopOpacity 0.18), darker at edges (stopOpacity 0.58) — clearly visible moon-like lunar disc effect.
- Stroke colour: `colors.red` (was `colors.primary` blue).

**Files modified:**
- `src/components/RadarChart.jsx` — `smoothClosedPath()` helper added; `OrganicRadarShape` component added; `PolarGrid gridType="circle"`; `Radar shape={<OrganicRadarShape />} stroke={colors.red}`; gradient opacity raised to 0.18/0.38/0.58

### Phase 10.16 — Homepage icon + wallpaper; Science dimensions section ✅ COMPLETE
Three independent UI and content changes.

**Change 1 — Homepage instrument card icons:**
- Moon icon size increased from 44 → 80px on all three instrument cards.
- Icon container: `flex justify-center` added — icons are now horizontally centred within each card. Text remains left-aligned.

**Change 2 — Homepage decorative animal wallpaper:**
- 10 animal RoleIcons scattered as an absolutely-positioned layer behind the instrument cards.
- `position: relative; overflow: hidden` added to `<main>`; decorative layer uses `absolute inset-0 pointer-events-none`.
- Icons: Dolphin, Eagle, Bear, Fox, Octopus, Bee, Owl, Wolf, Tortoise, Badger — varied sizes (68–160px), percentage-based positions, individual rotations.
- Color: white, opacity 0.12 — subtle wallpaper effect visible against the blue background.
- Cards sit in a `relative` wrapper at z-index above the decorative layer.

**Files modified:**
- `src/pages/HomePage.jsx` — RoleIcon imported; `BG_ICONS` array; decorative layer div; icon sizes 80; `flex justify-center`; `relative overflow-hidden` on main; `relative` on card wrapper

**Change 3 — Science page: Five Dimensions section:**
- New section between Five-Factor Model and Role Taxonomy.
- 2-column grid of dimension Cards (1-column on mobile); each card: DimensionIcon + Cèrcol name + academic name (muted) + 2–3 sentence plain-language description + primary reference.
- Dimension descriptions follow brand voice: both poles framed positively, no jargon, direct sentences.
- References: Barrick & Mount (1991) for Discipline; Bell (2007) for Presence, Bond, Vision, Depth.
- Full EN and CA i18n strings added.

**Files modified:**
- `src/pages/SciencePage.jsx` — DimensionIcon + colors imported; DIMENSION_KEYS + DIMENSION_COLOR maps; Five Dimensions section inserted
- `src/locales/en.json` — `science.dimensions` block: eyebrow, heading, intro, and per-dimension academic/body/ref for all 5 dimensions
- `src/locales/ca.json` — same, in Valencian

### Phase 10.17 — Dynamic wallpaper; header icon UI; globe language toggle ✅ COMPLETE
Four independent changes to the homepage and persistent header UI.

**Change 1 — Homepage animal wallpaper: dynamic placement**
- Static `BG_ICONS` array replaced with a `generateWallpaper()` function called once on mount via `useEffect`.
- Algorithm: for each of the 10 animal icons, tries up to 100 random `(x, y)` positions in normalised viewport-% coordinates (with ±6% edge bleed). Rejects positions that overlap the card exclusion zone (centre 64%×64% of viewport) or that are within 1.25× combined radii of any already-placed icon. Falls back to off-screen position if no valid slot found.
- Rotation also randomised per-visit (−40° to +40°). Sizes and opacity unchanged.
- Result: visibly different layout on every page load.

**Files modified:**
- `src/pages/HomePage.jsx` — `generateWallpaper()` + `ICON_DEFS` + `CARD_X/Y` constants; `useState([])` + `useEffect` to populate; removed static `BG_ICONS`

**Change 2 — Header auth UI**
- Signed-out state: "Sign in" text link replaced by `UserIcon` icon button (18px, `hover:bg-white/10`, aria-label).
- Signed-in state: red initial circle retained. "My results" and "Sign out" links removed. Clicking the circle opens a small dropdown (`position: absolute right-0 top-9 z-50 w-44`) with three items: Profile (`/profile`), My Results (`/my-results`), Sign Out. Dropdown closes on outside click (document `mousedown` listener via `useEffect`).
- `/profile` route placeholder: navigation target only; no page built yet.
- `UserIcon` added to `MoonIcons.jsx`: 24×24 viewBox, head circle + shoulder arc.
- i18n key `account.profile` added (EN: "Profile", CA: "Perfil").

**Files modified:**
- `src/components/MoonIcons.jsx` — `UserIcon` exported
- `src/components/AccountButton.jsx` — full rewrite: `UserIcon` signed-out; dropdown for signed-in
- `src/locales/en.json` + `ca.json` — `account.profile` key added

**Change 3 — Language selector: globe icon + language detection**
- EN | CA text toggle replaced by a single `GlobeIcon` button (18px, `hover:bg-white/10`).
- Clicking cycles EN → CA → EN. Selection persisted to `localStorage` key `cercol-lang`.
- `GlobeIcon` added to `MoonIcons.jsx`: 24×24 viewBox, outer circle + equator bow + vertical meridian oval.
- On first load, i18n initialises with: (1) `localStorage['cercol-lang']` if set, else (2) `navigator.language.startsWith('ca')` ? `'ca'` : `'en'`. Manual selection always overrides detection.

**Files modified:**
- `src/components/MoonIcons.jsx` — `GlobeIcon` exported
- `src/components/LanguageToggle.jsx` — full rewrite: `GlobeIcon` button; `localStorage` write on toggle
- `src/i18n.js` — reads `localStorage` + `navigator.language` to set `lng` at init time

### Phase 10.18 — User profile feature ✅ COMPLETE
Collects demographic data (name, country, native language) to enrich the research dataset.
Country and language are scientifically relevant for personality norm validation across populations.

**Database:**
- `supabase/migrations/006_profile_fields.sql` — adds `first_name`, `last_name`, `country`, `native_language` (all nullable TEXT) to `public.profiles`. Existing RLS policies (SELECT + UPDATE own row) already cover these new columns.

**Frontend — ProfilePage (`/profile`):**
- Works as both first-time setup and ongoing editing.
- Reads existing values from `profile` in AuthContext; pre-fills form on load.
- Fields: first name (required), last name (optional), country (select, ~55 ISO-coded options), native language (select, ~40 options including Catalan and Valencian separately).
- Saves via `supabase.from('profiles').update(...)` + calls `refreshProfile()` on success.
- Redirects to `/auth` if not signed in.

**AuthContext extension:**
- Added `profile` state (loaded from Supabase when user resolves).
- Added `refreshProfile()` — public function to re-fetch after a save.
- `fetchProfile(userId)` called on `getSession` resolve and on every `onAuthStateChange`.
- The `loading` flag still tracks only the auth check; profile loads asynchronously in parallel.

**Non-blocking profile completion prompt:**
- Shown when `profile && !profile.first_name` on `MyResultsPage` and `WitnessSetupPage`.
- Amber banner: short prompt text + "Set up profile" link to `/profile`.
- Not a gate — all page functionality remains accessible.

**Backend — API update:**
- `create_witness_sessions` (POST /witness/sessions): before creating sessions, queries `profiles` for the subject's `first_name` + `last_name`. Uses `"first last".strip()` as `subject_display` if available; falls back to email or user id. Profile lookup failure is swallowed to avoid blocking session creation.

**Files modified/added:**
- `supabase/migrations/006_profile_fields.sql` — new migration
- `src/pages/ProfilePage.jsx` — new page
- `src/context/AuthContext.jsx` — added `profile`, `refreshProfile`, `fetchProfile`
- `src/App.jsx` — `/profile` route added
- `src/pages/MyResultsPage.jsx` — `ProfilePrompt` banner + `profile` from `useAuth()`
- `src/pages/WitnessSetupPage.jsx` — same prompt after page header
- `api/main.py` — `create_witness_sessions` updated to resolve first_name for subject_display
- `src/locales/en.json` + `ca.json` — `profile.*` strings; `account.myResults` + `account.signOut` keys

### Phase 10.19 — Legal compliance layer ✅ COMPLETE
Minimum viable GDPR compliance for an EU-facing platform that collects email,
linked personality results, profile fields, and processes payments via Stripe.

**Privacy Policy (`/privacy`):**
- Plain-language policy in Cèrcol brand voice — direct and human, not legal boilerplate.
- Covers: what is collected (email, results, profile fields, payment via Stripe, anonymous scores), why (product function + anonymised research + payment processing), retention (account data until deletion; anonymous scores indefinitely; payment records per Stripe's policy), cookies (strictly necessary only — no consent required), user rights (access, deletion, portability, correction under GDPR), third-party services (Supabase + Stripe, no trackers), and contact email.
- Full EN and CA translations.

**Cookie banner (`CookieBanner.jsx`):**
- Fixed bottom bar, dark background, one line of explanatory text + "OK" dismiss button.
- Dismissed state persisted to `localStorage` (key: `cercol-cookies-ok`) — appears once per browser, never again after dismissal.
- Strictly informational: no accept/reject toggle required because Cèrcol's cookies are strictly necessary (GDPR Article 5(3) exemption).
- Mounted in `AppContent` (renders on all routes).

**Homepage footer:**
- "Privacy" link added alongside GitHub and Report issue.

**Files added/modified:**
- `src/pages/PrivacyPage.jsx` — new page
- `src/components/CookieBanner.jsx` — new component
- `src/App.jsx` — `/privacy` route + `CookieBanner` mount
- `src/pages/HomePage.jsx` — privacy footer link
- `src/locales/en.json` + `ca.json` — `cookies.*`, `privacy.*`, `home.privacy` keys

### Phase 10.20 — Security hardening ✅ COMPLETE
Backend and database security audit. Three real vulnerabilities found and fixed.

**Finding 1 — CRITICAL: Premium self-escalation (fixed)**
The `profiles` UPDATE RLS policy (`auth.uid() = id`) allowed any authenticated user to call
`supabase.from('profiles').update({ premium: true })` and grant themselves paid access without
going through Stripe. RLS has no native column-level restriction. Fixed via a `BEFORE UPDATE`
trigger (`prevent_premium_self_update`) that silently preserves `premium` for all JWT-based
callers (`auth.role() IS NOT NULL`). Service_role (the Stripe webhook) passes through unaffected
because `auth.role()` returns NULL for service_role — it carries no JWT claims.

**Finding 2 — MEDIUM: `witness_responses` open INSERT policy (fixed)**
`WITH CHECK (true)` on `witness_responses` allowed any anon key holder to insert arbitrary rows,
bypassing the API's token validation. The legitimate flow never uses this policy — all writes go
through the backend via service_role (which bypasses RLS anyway). Policy dropped; service_role
inserts continue to work unchanged.

**Finding 3 — MEDIUM: No rate limiting on public endpoints (fixed)**
`POST /witness/session/{token}/complete` (public, no auth) and `POST /witness/sessions` (auth)
had no rate limiting. Added `slowapi==0.1.9`. Custom `_get_client_ip()` reads `X-Forwarded-For`
to get the real IP through Railway's proxy. Limits: 10/min on session completion, 20/min on
session creation.

**Confirmed clean (no changes):**
- CORS: correctly locked to `cercol.team` and localhost dev ports only. No wildcard.
- service_role isolation: only in `api/main.py`, never in the frontend.
- Stripe webhook: signature verified before processing.
- JWT: JWKS-based ES256 via python-jose, audience validated.
- Anon key: correctly public (named `sb_publishable_*`); RLS adequate for its scope.

**Files modified/added:**
- `supabase/migrations/007_security_fixes.sql` — premium trigger + drop open witness_responses policy
- `api/requirements.txt` — added `slowapi==0.1.9`
- `api/main.py` — slowapi imports, `_get_client_ip`, limiter setup, `@limiter.limit` on two routes

**Note — .env tracking:** The `.env` file at the project root appears to be tracked by git.
Its contents are all `VITE_*` variables (intentionally public, embedded in the JS bundle), so
there is no credential exposure, but the file should be added to `.gitignore`.

### Phase 11 — Multilingual support ✅ COMPLETE

Six languages live: EN (source), CA (Catalan/Valencian), ES (Spanish), FR (French), DE (German), DA (Danish).
All UI strings, all 190 test items (10 TIPI + 60 IPIP-NEO-60 + 120 IPIP-NEO-120), and full
instrument name translations in every language. Translation methodology documented in SCIENCE.md.

#### Phase 11.1 — Spanish (ES) ✅ COMPLETE

- `src/locales/es.json` — full UI translation (neutral international Spanish)
- `es` key added to all 190 test items across new-moon.js, first-quarter.js, full-moon.js
- Instrument names: "Cèrcol de Luna Nueva", "Cèrcol de Cuarto Creciente", "Cèrcol de Luna Llena", "Testigo Cèrcol"
- Three hardcoded instrument name strings replaced with `t()` calls in WitnessSetupPage, WitnessPage, FullMoonReportPage
- `src/i18n.js` — ES locale imported; `es*` browser detection added
- `SCIENCE.md` — ES translation methodology section added; Cupani et al. (2014) cited as validation precedent
- `CLAUDE.md` — "Adding new languages" guidelines added

#### Phase 11.2 — French (FR) + German (DE) ✅ COMPLETE

- `src/locales/fr.json` — full UI translation (neutral European French)
- `src/locales/de.json` — full UI translation (Hochdeutsch)
- `fr` and `de` keys added to all 190 test items across new-moon.js, first-quarter.js, full-moon.js
- FR instrument names: "Cèrcol de Nouvelle Lune", "Cèrcol de Premier Quartier", "Cèrcol de Pleine Lune", "Témoin Cèrcol"
- DE instrument names: "Cèrcol des Neumondes", "Cèrcol des Ersten Viertels", "Cèrcol des Vollmondes", "Zeuge Cèrcol"
- `src/i18n.js` — FR and DE locales imported; `fr*` and `de*` browser detection added
- `SCIENCE.md` — FR and DE translation methodology sections added
- FR scientific basis: Thiry & Piolti (2023) IPIP adaptation (University of Mons, ipip.ori.org)
- DE scientific basis: German IPIP adaptations in published literature (ipip.ori.org)

#### Phase 11.3 — Language selector + housekeeping ✅ COMPLETE

- `src/components/LanguageToggle.jsx` — globe-icon cycle (EN→CA→ES) replaced with a dropdown; ISO codes (EN, CA, ES, FR, DE) displayed; active code shown beside GlobeIcon without opening menu; outside-click closes; same pattern as AccountButton.jsx
- `src/pages/ProfilePage.jsx` — separate "Valencian" entry removed from native language selector; Catalan (`ca`) covers both

#### Phase 11.4 — Catalan test item translations + Danish (DA) ✅ COMPLETE

**CA test item translations:**
- All 60 IPIP-NEO-60 items in `src/data/first-quarter.js` translated from English placeholder to Catalan/Valencian
- All 120 IPIP-NEO-120 items in `src/data/full-moon.js` translated from English placeholder to Catalan/Valencian
- AVL/IEC orthographic standard; gender-inclusive slash notation; psychological meaning preserved
- `SCIENCE.md` — CA methodology section updated to reflect all 190 items now translated

**Danish (DA):**
- `src/locales/da.json` — full UI translation (standard Rigsdansk)
- `da` key added to all 190 test items across new-moon.js, first-quarter.js, full-moon.js
- DA instrument names: "Nymåne Cèrcol", "Første Kvartal Cèrcol", "Fuldmåne Cèrcol", "Vidne Cèrcol"
- `src/i18n.js` — DA locale imported; `da*` browser detection added
- `src/components/LanguageToggle.jsx` — DA added to LANGS array (6th option)
- Scientific basis: Vedel, Gøtzsche-Astrup & Holm (2018) validated Danish IPIP-NEO-120 (*Nordic Psychology*)
- Altered items: conservative voting item DA uses Vedel formulation ("Ser mig selv som overvejende konservativ politisk.") per legal requirement
- `SCIENCE.md` — DA methodology section added; Vedel et al. (2018) reference added

### Phase 12.1 — Witness identity layer ✅ COMPLETE

Dual-mode Witness system: anonymous sessions preserved unchanged; authenticated witnesses
can opt in to link the session to their profile, enabling team features in Last Quarter.

**Database (`supabase/migrations/008_witness_identity.sql`):**
- `witness_user_id` (nullable UUID, FK `auth.users`) added to `witness_sessions`
- Index on `witness_user_id WHERE NOT NULL`
- RLS policy: authenticated witness can read rows where `witness_user_id = auth.uid()`

**Backend (`api/main.py`):**
- `get_optional_user` dependency: validates Bearer if present, returns `None` if absent
- `POST /witness/session/{token}/complete`: upgraded to optional auth; if authenticated,
  `witness_user_id` is stored alongside `completed_at` in a single PATCH
- `GET /witness/my-contributions`: new authenticated endpoint returning sessions the
  calling user completed as a witness (`subject_display`, `completed_at` only — no scores)

**Frontend:**
- `src/lib/api.js` — `completeWitnessSession` accepts `linkAsUser` flag; uses `authFetch`
  if true, `publicFetch` otherwise. `getMyWitnessContributions()` added.
- `src/pages/WitnessPage.jsx` — `useAuth` imported; `linkAsUser` state added; authenticated
  users see a checkbox on the intro screen ("Link this session to my profile"); unchecked by
  default; flow and scoring unchanged regardless of choice.
- `src/pages/WitnessSetupPage.jsx` — informational note added: if witnesses are signed in
  they can link the session for team features.
- `src/pages/MyResultsPage.jsx` — "Witness contributions" section added below results list;
  shows list of subjects the user has witnessed (subject_display, read-only, no scores).

**i18n:** New keys added to all 6 locales: `witness.setup.linkedNote`,
`witness.page.intro.linkLabel`, `witness.page.intro.linkNote`,
`myResults.contributionsHeading`, `myResults.contributionsEmpty`, `myResults.contributionItem`.

### Phase 12.2 — Team groups system ✅ COMPLETE

Group infrastructure enabling Last Quarter team reports.

**Database (`supabase/migrations/009_groups.sql`):**
- `groups` table: `id`, `name`, `created_by` (FK `auth.users`), `created_at`
- `group_members` table: `group_id`, `user_id` (nullable), `status` (pending/active),
  `invited_email`, `invited_at`, `joined_at`
- Unique indexes: `(group_id, user_id) WHERE NOT NULL` and `(group_id, invited_email) WHERE NOT NULL`
- RLS: members read own group rows + other active members of shared groups; only creator
  can update/delete group rows

**Backend (`api/main.py`):**
- `CreateGroupBody` Pydantic model
- `POST /groups` — creates group + active membership for creator; invites members by email
  (matched against `profiles` table; stored as `user_id` if found, `invited_email` if not)
- `GET /groups/mine` — returns active groups with member count and Full Moon completion count
- `GET /groups/pending` — returns pending invitations for the calling user
- `POST /groups/{id}/accept` — transitions pending → active membership
- `POST /groups/{id}/decline` — deletes pending membership row
- `GET /groups/{id}/report-data` — active-members-only; returns profile display name, OCEAN
  z-scores (normative priors from SCIENCE.md), and nearest role centroid (R01–R12) for each
  active member with a Full Moon result

**Frontend:**
- `src/lib/api.js` — `createGroup`, `getMyGroups`, `getPendingInvitations`,
  `acceptGroupInvitation`, `declineGroupInvitation`, `getGroupReportData`
- `src/pages/GroupsPage.jsx` — `/groups` route; lists active groups with member/completion
  counts; pending invitations with Accept/Decline; create-group form (name + comma-separated
  emails); redirects to `/auth` if unauthenticated
- `src/App.jsx` — `/groups` and `/groups/:id` routes added (`:id` is Phase 12.3 placeholder)
- `src/components/AccountButton.jsx` — "Groups" link added between My Results and Sign Out

**i18n:** `account.groups` and `groups.*` keys added to all 6 locales (EN/CA/ES/FR/DE/DA).

### Phase 12.3 — Group detail + UX polish ✅ COMPLETE

**Seed data:** `scripts/seed_dummy_team.sql` and `scripts/clear_dummy_team.sql` — direct SQL
inserts for 7 fictional Valencian users, 7 Full Moon results (6+ roles), 42 witness sessions,
and 1 group "Grup de prova — La Ventijol". Safe to run in the Supabase SQL editor.

**AccountButton:** replaced static email initial with `RoleIcon` if the signed-in user has a
Full Moon result; falls back to initial if not. Fetches from Supabase on mount, computes role
client-side via `computeRole`.

**Full Moon gate:** authenticated premium users who already have a `fullMoon` result see a
"you've already completed" screen with a link to their report. New gate state: `'completed'`.

**`src/utils/team-narrative.js`:** `generateNarrative({ p, b, v, c, n })` returns i18n key
suffixes for three sections (move / watchOut / help) using a deterministic decision tree.
Also exports `computeGroupMeans`, `balanceFlagForPBV`, `balanceFlagForC`, `balanceFlagForN`,
`zscoresToRaw` for use in LastQuarterPage.

**`src/pages/LastQuarterPage.jsx`:** `/groups/:id` team report with four sections:
- Team composition: `RoleIcon` + role name + arc chips per member; Pending badge for members
  without a Full Moon result.
- Balance analysis: group mean z-score flags (Balanced / Tilted / Strongly Tilted for P/B/V;
  structural flags for C and N) + RadarChart of reconstructed mean raw scores.
- Team narrative: three deterministic paragraphs (How your group moves / Watch out for /
  What would help) from the decision tree.
- Share: copy-link button + `window.print()` for PDF.

**i18n:** `fm.alreadyCompleted.*` and `lastQuarter.*` (including full narrative paragraphs)
added to all 6 locales. Non-English locales have structural keys translated; long narrative
text falls back to English via `fallbackLng: 'en'`.

### Phase 12.4 — Homepage polish + Last Quarter navigation ✅ COMPLETE

**`LastQuarterIcon`:** new SVG icon in `MoonIcons.jsx` — horizontally mirrored `FirstQuarterIcon`
(left half illuminated, terminator bows gently right). Replaces the temporary `FirstQuarterIcon`
usage in `LastQuarterPage.jsx`.

**4th homepage card:** "Last Quarter Cèrcol" card added to the instrument grid (black accent).
Navigates to `/groups`. Grid changed from `lg:grid-cols-3` to `xl:grid-cols-4`.
`home.lastQuarter.{name, meta, description}` added to all 6 locale files.

**Animal wallpaper density:** ICON_DEFS expanded from 10 to 22 entries (all 12 roles + 10
smaller duplicates); opacity increased from 0.12 → 0.22; min-distance factor reduced from
1.25× to 1.05× for denser non-touching placement; placement attempts increased to 200.

**Danish language toggle:** already fully implemented in Phase 12.3 (LanguageToggle.jsx +
i18n.js + src/locales/da.json). DA appears as the 6th option in the language dropdown.

### Phase 12.5 — GroupsPage navigation fix + wallpaper + avatar polish ✅ COMPLETE

**Bug fix — `/groups` cards not clickable:** `GroupCard` had no navigation handler. Wrapped
in a `<button>` with `onClick={() => navigate('/groups/${id}')}`. Cards now navigate to
`/groups/:id` (LastQuarterPage) on click. Added `hover:shadow-md transition-shadow` feedback.

**Homepage wallpaper redesign:** all 22 icons now the same fixed size (`ICON_SIZE = 80`);
no rotation (all upright); opacity increased from 0.22 → 0.38; `r` computed once outside
the loop since all icons are identical size; placement attempts increased to 300.

**AccountButton avatar:** `RoleIcon` size increased 18 → 26 inside the 28×28px button,
reducing padding from ~5px/side to ~1px/side for a much tighter icon fill.

### Phase 13.1 — Last Quarter report layout redesign ✅ COMPLETE

**`ROLE_COLORS` in `tokens.js`:** 12 distinct colors mapped to R01–R12. Hues are evenly
distributed across the color wheel (30° intervals), all at similar saturation/darkness for
legibility on white. Brand anchors: R01 = brand red (#cf3339), R05 = brand green (#427c42).
Full spectrum: orange, amber, olive, emerald, teal, cerulean, cobalt, indigo, violet, crimson.

**`RadarChart` multi-series extension:** optional `series` prop
(`Array<{id, scores, color, opacity}>`). When provided, renders one `<Radar>` per entry,
each with a colour-keyed `OrganicRadarShape` whose fill and stroke opacity are controlled
by the `seriesOpacity` prop. Single-series API (`scores`, `maxScore`, `domainKeys`, `labelFn`)
is fully preserved — all existing usages unchanged.

**Last Quarter report — two-column Section 1:**
- Left 2/3: `RadarChart` in multi-series mode, one filled shape per completed member in their
  ROLE_COLOR. Default opacity 0.5 for all; on member row hover: hovered shape → 1.0, others → 0.15.
- Right 1/3: `MemberRow` list — 36px role avatar in ROLE_COLOR, primary role name, arc icons
  (16px, muted grey) with native `title` tooltip on hover. Pending members show grey dot + label.
- Hover state (`hoveredMember`) lifted to page level; passed to both column and radar series.
- Mobile: stacks (radar above, list below) via `grid-cols-1 md:grid-cols-3`.
- Page container widened from `max-w-2xl` to full Layout width (4xl).

**i18n:** `lastQuarter.selfLabel` added to all 6 locale files
(EN: "you", CA: "tu", ES: "tú", FR: "toi", DE: "du", DA: "dig").

### Phase 13.2 — Last Quarter report refinements ✅ COMPLETE

**Radar toggle:** replaced multi-series radar with a "My profile / Team average" toggle.
Default is team average. "My profile" is disabled if the current user has no completed
Full Moon result. Toggle buttons use primary (active) / secondary (inactive) styling.

**Dimension rows:** below the radar, five rows showing DimensionIcon + domain name +
coloured bar + `.toFixed(1)` value, reflecting whichever toggle is active.

**Member list — icon-only:** `MemberRow` now renders an icon cluster instead of text roles.
Primary role icon at 30px in ROLE_COLOR; 2nd-arc icon at 20px (0.7 opacity); 3rd-arc icon at
15px (0.5 opacity). Each icon has a native `title` tooltip with the role name. No role-name
text. Member name, self-label, and pending label are still shown.

**RadarChart cleaned up:** `series` prop and multi-series branch removed entirely.
Single-series only: `scores, maxScore, domainKeys, labelFn`.

**i18n:** `lastQuarter.toggleMyProfile` and `lastQuarter.toggleTeamAverage` added to all
6 locale files (EN: "My profile" / "Team average", CA, ES, FR, DE, DA translated).

### Phase 13.3 — Last Quarter report fixes and balance analysis redesign ✅ COMPLETE

**Tooltip fix on member role icons:** replaced native `title` attribute (which shows a `?` cursor
and a long OS-controlled delay) with a local `IconTooltip` React component using CSS transitions
and a `setTimeout(300ms)` delay. Cursor is now `default`. Shows role name (translated via i18n)
for primary and arc icons.

**Radar tooltip precision:** all values in the radar tooltip are now rounded to 1 decimal place.

**Balance analysis section — full redesign:** removed the repeated RadarChart. Replaced with
per-dimension analysis for all 5 dimensions:
- DimensionIcon + dimension name + BalancePill per row.
- Top contributor (member with highest z-score in that dimension) — RoleIcon + first name.
- For P/B/V balanced: brief positive note per dimension.
- For P/B/V tilted: shows the member whose individual z-score is furthest in the compensating
  direction. If no member compensates (all tilt the same way), suggests the best matching role
  profile from SCIENCE.md centroids (RoleIcon + role name).
- For Discipline (low): caution note + top 3 high-C roles (Tortoise, Owl, Bee) as icon row.
- For Depth (high): caution note + top 3 low-N roles (Tortoise, Elephant, Bear) as icon row.
- All balance logic in `team-narrative.js` (`computeDimensionAnalysis`). Deterministic, no AI.
- Thresholds: |mean_z| < 0.5 → balanced, ≥ 0.5 → tilted (same for strongly tilted treatment).

**`computeDimensionAnalysis` in `team-narrative.js`:** new export. Contains `CENTROIDS`,
`SUGGEST_ROLE_FOR_TILT`, `TOP_HIGH_C_ROLES`, `TOP_LOW_N_ROLES` constants.

**i18n:** `lastQuarter.balance.*` object added to all 6 locale files:
`topContributor`, `compensates`, `suggestRole`, `suggestRoles`, and `notes.*` per dimension/state.

### Phase 13.4 — Last Quarter report: compact layout + fixes ✅ COMPLETE

**Narrative translations:** all 27 narrative text keys (`move/*`, `watchOut/*`, `help/*`) added
to all 5 non-English locale files (CA, ES, FR, DE, DA). Previously only the section headings
were translated; the full paragraph text fell back to EN.

**Compact layout for print:** significant whitespace reductions across the page:
- Global section gap: `gap-8` → `gap-4`; card padding: `p-6` → `p-4`
- Member rows: `py-3` → `py-1.5`; icon sizes reduced (30→26px primary, 20→18px arc1, 15→13px arc2)
- Dimension scores: changed from 5 stacked rows to a compact 2-column grid (3+2), thinner bar (h-1.5→h-1)
- Balance analysis: single-line per dimension (icon + name + pill + top contributor); descriptive note
  shown only when tilted/caution, hidden when balanced to save space
- Narrative: `gap-5` → `gap-3`; paragraph font size `text-sm` → `text-xs`
- Share section hidden on print via `print:hidden`
- Print stylesheet in `index.css`: `@page { margin: 1cm }`, `font-size: 11px`, nav hidden, shadows removed

**Dev z-score logging:** `import.meta.env.DEV` guard logs group mean z-scores per dimension and
their computed balance flags to the browser console. Helps verify the balance classification is
working correctly in development.

### Phase 13.5 — Last Quarter layout: 3-column top + 2-column bottom ✅ COMPLETE

**Top section — 3-column grid [40/30/30]:**
- Column 1 (40%): toggle buttons + RadarChart
- Column 2 (30%): 5 stacked dimension score rows with icon, name, bar, value
- Column 3 (30%): member list (icon cluster + name)
- Columns 2 and 3 separated by a subtle left border on md+. Mobile: stacks vertically.
- Uses Tailwind arbitrary column widths: `grid-cols-[4fr_3fr_3fr]`

**Bottom section — 2-column grid [50/50]:**
- Column 1: Balance analysis card
- Column 2: Team narrative card
- Both cards at `h-full` to match heights. Mobile: stacks vertically.

**Print fix — dimension bars:**
- `DomainBAR_HEX` constant replaces Tailwind `bg-*` classes with inline `backgroundColor`.
- Bar fill element: `WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'` inline styles.
- `@media print` in `index.css`: `* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }` as belt-and-suspenders for all colored elements (pills, etc.).

### Phase 13.6 — Print layout fix ✅ COMPLETE

Tailwind's `md:` responsive classes collapse to single-column in print because the browser
renders with a narrow virtual viewport. Fixed by:

- Added stable class names `lq-top-grid` and `lq-bottom-grid` to the two grid containers
  in `LastQuarterPage.jsx`. These are non-Tailwind plain CSS hooks for the print stylesheet.
- `@media print` in `index.css` now explicitly forces:
  - `.lq-top-grid { display: grid; grid-template-columns: 40% 30% 30% }`
  - `.lq-bottom-grid { display: grid; grid-template-columns: 50% 50% }`
  - `break-inside: avoid` on grid children to prevent mid-card page breaks
- Page size set to `A4 landscape` in `@page`.
- Hidden in print: `header`, `nav`, `.fixed` (catches both the cookie banner and the
  feedback button — both use Tailwind's `fixed` class), `.print:hidden` (share card).
- `* { print-color-adjust: exact }` retained for bars and pills.
- Radar SVG has no `print:hidden` — confirmed visible in print.

### Phase 13.7 — My Results + Full Moon report fixes ✅ COMPLETE

**My Results page — dimension icons added:**
`DimensionIcon` (size 13) added before each dimension name in `ResultCard`. Added
`DOMAIN_ICON_COLOR` constant. Dimension label span is now colored to match the domain.

**My Results page — Full Moon card clickable:**
`ResultCard` now wraps in a `<button>` when `result.instrument === 'fullMoon'`, navigating
to `/full-moon/report`. `ChevronRightIcon` is darker (text-gray-500) and a "View report"
link label is shown at the bottom of the card. `hover:shadow-md transition-shadow` on hover.

**Full Moon report — probability bars redesign:**
`CombinedRoleBars` in `FullMoonReportPage.jsx` replaced 3 stacked separate bars with a
single shared track (h-3) containing 3 overlaid layers (all `position: absolute`):
- Layer 1 (base, z=0): combined value — full opacity, brand color (red/blue/gray)
- Layer 2 (z=1): self value — same color, 0.45 opacity
- Layer 3 (z=2): witness average — brand blue (#0047ba), 0.5 opacity
Hovering the bar shows an inline tooltip (dark bg) with all 3 labelled values.
Legend row updated to match: colored dots (full / 0.45 / 0.5) with Combined / Self / Witnesses labels.
`RoleIcon` added back to each row label (was missing from the old combined version).
Single-bar mode (no witnesses) unchanged — only the combined layer renders.

### Phase 13.8 — Full Moon report visual upgrade + translation fixes ✅ COMPLETE

**Dot-marker probability bars — `RoleProbabilityBars.jsx`:**
Replaced filled h-2 bars with a dot-marker system. Track is now a 1px horizontal line inside
a 12px-tall relative container (no overflow clip). One 10×10 filled circular dot per role,
positioned at `left: ${pct}%` with `transform: translate(-50%, -50%)`. Primary dot uses
`colors.primary`, arc dots use `colors.arcBar`, others use `colors.border`. Row opacity:
1 / 0.7 / 0.45 for primary / arc / others. No tooltip, no legend (single data source).

**Dot-marker probability bars — `CombinedRoleBars` in `FullMoonReportPage.jsx`:**
Same thin-track approach with three dots when witnesses present:
- Combined: 10×10 filled circle at `combinedPct%` (brand color)
- Self: 8×8 outlined circle (2px border, same brand color) at `selfPct%`
- Witness: 8×8 outlined circle (2px border, `colors.blue`) at `witnessPct%`
Hover on row shows tooltip: `Combined: X% · Self: X% · Witnesses: X%`.
Legend updated to circular dot swatches (filled / outlined / outlined blue).
No-witness mode: single filled dot only, no legend.

**Blind spots → bullet list:**
Removed `BlindSpotCard` component. Replaced divergence list with a single `Card` containing
a `<ul>`. Each `<li>`: colored `DimensionIcon` + **bold domain name**: plain description text.
Warm, direct format — no card-per-item overhead.

**Dimension rows → 2-col grid in `FullMoonResultsPage.jsx`:**
Changed `flex flex-col divide-y divide-gray-100` to `grid grid-cols-2 gap-x-4 gap-y-2`.
5 domains flow into 3+2 columns. Tighter vertical footprint.

**Missing role name translations fixed:**
- `fr.json`: R01–R12 `name` fields now in French (Dauphin, Loup, Éléphant, Hibou, Aigle,
  Faucon, Pieuvre, Tortue, Abeille, Ours, Renard, Blaireau)
- `da.json`: R01–R12 `name` fields now in Danish (Delfin, Ulv, Elefant, Ugle, Ørn, Falk,
  Blæksprutte, Skildpadde, Bi, Bjørn, Ræv, Grævling)

### Phase 13.9 — Full Moon + Last Quarter visual upgrades ✅ COMPLETE

**Full Moon report — role name dominance:**
`h2` role name increased from `text-4xl sm:text-5xl` to `text-5xl sm:text-6xl`. Already in
Playfair Display via global CSS. Section gap increased from `gap-10` to `gap-14`.

**Full Moon report — dot marker colours fixed:**
Combined dot now always `colors.red` (solid, 10px); Self dot outlined red (1.5px border,
white fill, 8px); Witness dot outlined blue (1.5px border, white fill, 8px). Non-primary
row opacity raised from 0.45 → 0.6 for better readability. Legend updated to match.

**Full Moon report — dimension bars redesigned:**
`DomainComparisonRow` replaced two stacked bars with a single colored bar (self value) and a
narrow blue vertical tick at witness position. Numbers show self + witness side by side.
`DOMAIN_BAR_COLOR` (Tailwind classes) replaced with `DOMAIN_BAR_HEX` (hex values, inline
style, `printColorAdjust: exact`). Domain rows changed from `flex-col divide-y` to
`grid grid-cols-2 gap-x-4 gap-y-3` (3+2 layout). Legend updated: bar swatch for self, tick
line for witness.

**Last Quarter — segmented control:**
Toggle replaced from two `<Button>` components with a pill-shaped segmented control using
native `<button>` elements (active = blue fill, inactive = white + hover bg-gray-50).

**Last Quarter — column section labels:**
`SectionLabel` added to Col 2 (Dimension Scores) and Col 3 (Team Members) using new i18n
keys `compositionDimensionsHeading` / `compositionMembersHeading` — added to all 6 locales.

**Last Quarter — member row redesign:**
`MemberRow` simplified: 28px primary role icon (role color) + name block + single 16px arc
role icon right-aligned with tooltip (55% opacity). Removed 3-icon cluster.

**Last Quarter — balance rows collapsible:**
Extracted `BalanceDimRow` from `BalanceContent` with local `useState` for expand/collapse.
Tilted rows show a rotating chevron button; suggestion content hidden until expanded.
Balanced rows have no chevron.

**Last Quarter — narrative section icons:**
`NarrativeContent` now shows → / △ / ✦ icon + bold uppercase heading before each prose
paragraph. Gap between sections increased from `gap-3` to `gap-4`.

**Last Quarter — share bar:**
Share `Card` replaced with a minimal centered row of two plain text ghost buttons separated
by a 1px vertical divider. No card chrome, no section label.

### Phase 13.10 — Full Moon report + First Quarter report structural redesign ✅ COMPLETE

Both pages rewritten from scratch (JSX structure only — all data logic/hooks preserved).

**Full Moon report (`FullMoonReportPage.jsx`):**
- Section 2: moved from standalone CombinedRoleBars to 2-col [Radar | CombinedRoleBars]
- Section 5: removed radar from domain section; now full-width single Card with 2-col
  `grid grid-cols-2` of `DomainComparisonRow`s. Each row: DimensionIcon + name + self score +
  witness score + single bar + `fmResults.scoreLabels` badge. Added `fmScoreLabel` import
  from `full-moon-scoring.js`. Added `LABEL_STYLES` constant.

**First Quarter results (`FirstQuarterResultsPage.jsx`):**
- Role name bumped to `text-5xl sm:text-6xl` for display dominance
- Section 2: Radar stays left, Domain rows replaced with `RoleProbabilityBars` on the right
- Section 3: Replaced 5-card facet grid with collapsible accordion (per-domain):
  - Domain header: color dot + name + facet count + rotating chevron
  - First domain expanded by default (`expandedDomains` state)
  - Facet grid inside: 2-col, facet score + tinted badge in domain color (`barHex + '22'`)
  - Added `DOMAIN_BAR_HEX` constant, `toggleDomain` helper
- Section 4: CTA changed from plain Card to `Card accent="blue"` with FullMoonIcon layout
- Added `fqResults.facetsCount` i18n key to all 6 locale files

### Phase 13.11 — Centralise report styling into shared components ✅ COMPLETE

Created `src/components/report/` as a shared report component directory.

**New shared components:**
- `DimensionRow.jsx` — two-mode dimension row: standard (FQ/FM: icon + name + score + optional witness tick + badge + bar) and compact (LQ: minimal inline row). Contains internal `DOMAIN_BAR_HEX`, `DOMAIN_ICON_COLOR`, `LABEL_STYLES` so pages stop duplicating them.
- `FacetAccordion.jsx` — collapsible per-domain accordion. First domain open by default. Panel divs carry class `facet-accordion-panel` forced open by `@media print`. Accepts `domainNs`/`labelNs` props so it works for both FQ (`fqDomains`/`fqResults`) and FM (`fmDomains`/`fmResults`).
- `index.js` — barrel export for both components.

**Updated pages:**
- `RoleProbabilityBars.jsx` — replaced dot-marker system with filled horizontal bars (`w-16 h-1.5`) + explicit `{pct}%` text at right. Bar colors: primary=red, arc=blue, others=gray.
- `FullMoonResultsPage.jsx` — imports `DimensionRow` + `FacetAccordion`; removed per-page constants.
- `FirstQuarterResultsPage.jsx` — imports `FacetAccordion`; removed `expandedDomains` state and `toggleDomain` helper.
- `FullMoonReportPage.jsx` — imports `DimensionRow`; removed local `DomainComparisonRow` function.
- `LastQuarterPage.jsx` — imports `DimensionRow` with `compact` prop; removed local `DOMAIN_BAR_HEX`.
- `index.css` — added `.facet-accordion-panel { display: block !important; }` inside `@media print` so all accordion panels are forced open when printing.

### Phase 13.12 — Merge FullMoonResultsPage and FullMoonReportPage ✅ COMPLETE

Unified the two Full Moon pages into a single `FullMoonResultsPage` at `/full-moon/results`.

**Architecture:**
- Phase 1 (instant): renders solo self-report from `location.state` or `?r=` shared link.
- Phase 2 (async): if authenticated and not a shared link, loads Witness sessions via API and layers them on top.
- Shared links (`?r=` present): Phase 2 skipped entirely — no witness loading.

**Render order:** role card → radar + domain rows + probability bars → facet accordion → convergence meter (≥2 witnesses) → blind spots (≥2 witnesses) → witness session list + invite CTA → actions → disclaimer.

**Role card:** shows combined role (self × 2/3 + witness × 1/3) when witnesses present; "Definitive" badge replaces "Beta". Solo role and "Beta" badge otherwise.

**Witness section:** authenticated users see full session list + invite CTA; unauthenticated `fromTest` users see simple invite card (no "View full report" button — already on correct page); hidden for shared links.

**New shared component:** `ConvergenceMeter.jsx` moved from `FullMoonReportPage` to `src/components/report/` and exported from `index.js`.

**Routing:** `/full-moon/report` → `<Navigate to="/full-moon/results" replace />` in `App.jsx`. `FullMoonReportPage.jsx` reduced to a re-export stub.

### Phase 13.13 — Facet persistence + visual unification of all four report pages ✅ COMPLETE

**Part 1 — Facet persistence:**
- `sql/add_facets_column.sql` — migration: `ALTER TABLE results ADD COLUMN IF NOT EXISTS facets JSONB`
- `logger.js` — added `facetScores = null` as 5th parameter; inserted into payload when present
- `FirstQuarterResultsPage` — passes `facets` to `logResult` on test completion
- `FullMoonResultsPage` — passes `stateFacets` to `logResult`; Supabase fallback query now selects `facets`; added `loadedFacets` state (`setLoadedFacets(r.facets ?? null)`); effective `facets = stateFacets ?? loadedFacets`
- `MyResultsPage` — FM card click now navigates to `/full-moon/results` with `{ domains, facets, fromTest: false }` state instead of bare `/full-moon/report`
- `sql/seed_fq_facets.sql` / `sql/seed_fm_facets.sql` — manual seed scripts (Box-Muller, mean=3.0, SD=0.6, clamped [1,5], 2dp) for backfilling null-facets rows

**Part 2 — Shared report components (new):**
- `ReportPageHeader` — moon phase icon + eyebrow (uppercase tracking-widest) + h1 + optional subtitle
- `RoleCard` — unified role card for FQ and FM; role name `text-5xl sm:text-6xl`; accepts `badge` and `badgeNote` props
- `RadarDataCard` — Card wrapping RadarChart + 1 or 2 data columns; auto grid-cols-2 / grid-cols-3

**Part 3 — Visual unification:**
- `DimensionRow` — removed `flex-wrap` from standard header; added `truncate` to name span; added `maxScore` prop (default 5)
- `RoleProbabilityBars` — added `bare` prop to skip Card wrapper when used inside `RadarDataCard`
- `NewMoonResultsPage` — uses `ReportPageHeader` + `RadarDataCard` (2 col) + `DimensionRow maxScore={7}`
- `FirstQuarterResultsPage` — uses `ReportPageHeader` + `RoleCard` + `RadarDataCard` (3 col: Radar | DimensionRows | ProbBars bare); dimension rows added back
- `FullMoonResultsPage` — uses `ReportPageHeader` (subtitle reflects witness presence) + `RoleCard` + `RadarDataCard` (3 col: Radar | DimensionRows | ProbBars bare)
- `LastQuarterPage` — uses `ReportPageHeader` (eyebrow = "Team report", title = group name); top card padding `p-4` → `p-5`
- `report/index.js` — exports `ReportPageHeader`, `RoleCard`, `RadarDataCard`

### Phase 13.14 — Visual polish: dimension descriptions, LQ header, bottom section unification ✅ COMPLETE

- **Dimension descriptions relocated**: moved from `DimensionRow` (inside `RadarDataCard`) into `FacetAccordion` via new `domainDescFn` prop — shown below each domain header before facet rows. `RadarDataCard` now shows no description text in any page.
- **FacetAccordion** — new `domainDescFn?: (key) => string | null` prop; description appears inside the expanded panel above the facet grid.
- **RadarDataCard** — new `customFirstCol` prop for custom first-column content (used by Last Quarter for toggle + radar).
- **Last Quarter header** — eyebrow changed from `lastQuarter.title` ("Team report") to `home.lastQuarter.name` ("Last Quarter Cèrcol"), matching the pattern of all other report pages.
- **Last Quarter radar** — replaced custom Card + `grid-cols-[4fr_3fr_3fr]` with `RadarDataCard` + `customFirstCol` prop; now uses equal `grid-cols-3` proportions matching FQ and FM.
- **Bottom section unified** across all four pages:
  - New Moon: Share upgraded to `variant="primary"`, Retake to `variant="secondary"`, disclaimer moved from `<p>` to gray box.
  - First Quarter / Full Moon: already correct — no changes.
  - Last Quarter: disclaimer gray box added after copy/print row; reuses `fmResults.disclaimer` key.

### Phase 13.15 — Radar polygon rendering fix ✅ COMPLETE

- **Root cause**: Recharts v3.8.1 `useAnimationId` uses reference equality on the entire `props` object, which is a new object every React render. This caused the `JavascriptAnimate` component to remount on every render (via changing `key`), restarting the radar polygon animation from `t=0` (all points at chart center). The polygon was permanently invisible.
- **Fix**: Added `isAnimationActive={false}` to `<Radar>` in `RadarChart.jsx` — `JavascriptAnimate` initialises to `t=1` immediately, rendering the polygon at full size without animation.
- **Gradient fix**: `cx`/`cy`/`outerRadius` are not passed to custom shapes in Recharts v3 (commented out in source). `OrganicRadarShape` now derives `cx`/`cy` from `points[0].cx` / `points[0].cy` (per-point properties) and estimates `outerRadius` as 1.4× the max distance from center to any point.

### Phase 13.16 — Audit cleanup + visual unification ✅ COMPLETE

**Part 1 — Audit cleanup:**
- **Migration consolidated**: `sql/add_facets_column.sql` moved to `supabase/migrations/010_add_facets.sql` — all 10 migrations now in one place.
- **Domain color tokens centralised**: added `DOMAIN_COLORS` (hex for bars), `DOMAIN_ICON_CLASSES` (Tailwind text classes), `DOMAIN_BG_CLASSES` (Tailwind bg classes), and `BALANCE_COLORS` to `tokens.js`. Removed all 8 local `DOMAIN_BAR_HEX` / `DOMAIN_ICON_COLOR` / `DOMAIN_ACCENT` / `BALANCE_COLOR` definitions from `DimensionRow`, `FacetAccordion`, `MyResultsPage`, `FullMoonResultsPage`, `FullMoonPage`, `FirstQuarterPage`, `LastQuarterPage`, `SciencePage`.
- **Inline SVGs moved to `MoonIcons.jsx`**: added `HamburgerIcon`, `CloseIcon`, `ExternalLinkIcon`, `InfoIcon`, `TranslationIcon`. Updated `Layout.jsx`, `InstrumentsPage.jsx`, `RolesPage.jsx`, `SciencePage.jsx`, `AboutPage.jsx`, `WitnessSetupPage.jsx`, `FeedbackButton.jsx`, `FacetAccordion.jsx`. Google logo in `AuthPage.jsx` kept as documented exception.
- **SQL organisation**: added `sql/README.md`. Deleted `scripts/generate-dolphin.js` (one-off icon generation script, already run).
- **Orphan assets deleted**: `src/assets/icons_raw/` (12 duplicates of `icons/animals/`), `src/assets/illustrations/` (12 JPGs + 1 SVG, unused since Phase 10.14), `src/assets/react.svg`, `src/assets/vite.svg`.
- **Dead files deleted**: `src/data/roles.js` (empty, no exports, no imports), `src/pages/FullMoonReportPage.jsx` (stub re-export, route already a `<Navigate>` in `App.jsx`).
- **`sharp` devDependency removed** (`npm uninstall --save-dev sharp`).
- **`homepage` in `package.json` fixed** to `https://cercol.team` (was pointing to `github.io`).
- **Hardcoded hex fixed**: radar toggle buttons in `LastQuarterPage` use `bg-blue-700` instead of `bg-[#0047ba]`; `FullMoonResultsPage` definitive badge uses `bg-blue-100 text-blue-700`; `BALANCE_COLORS` moved to `tokens.js`.
- **`observer` comment in `WitnessPage.jsx`** rewritten to not contain the banned word itself.

**Part 2 — Visual unification:**
- **Last Quarter actions row**: copy/print plain `<button>` elements replaced with `Button` component (`variant="primary"` for Copy, `variant="secondary"` for Print). Matches the same actions row pattern across all four report pages.

### Phase 13.17 — Refactorització i consolidació del codebase ✅ COMPLETE

Exhaustive codebase audit followed by targeted refactoring. No behaviour changes.

**Grup 1 — Scientific constants centralised:**
- `NORM_MEAN`, `NORM_SD` exported from `role-scoring.js` (authoritative). Removed local redefinitions in `witness-scoring.js` (factor-keyed) and `team-narrative.js` (domain-keyed, now derived via `DOMAIN_FACTOR` map). Eliminates desync risk when switching to empirical statistics at N≥200.
- `ARC_PROBABILITY_THRESHOLD = 0.15` exported from `role-scoring.js`; imported in `witness-scoring.js`.
- `DOMAIN_MAP` exported from `role-scoring.js`.

**Grup 2 — Scoring utils unified:**
- Created `src/utils/scoring-utils.js` with `scoreToPercent5` and `scoreLabel5` for 1-5 scale instruments.
- `fqScoreToPercent` / `fqScoreLabel` and `fmScoreToPercent` / `fmScoreLabel` are now aliases — identical implementations removed.
- Inline `pct` formula in `LastQuarterPage.jsx` replaced with `fmScoreToPercent(score)`.

**Grup 3 — i18n bug + SVG + imports:**
- `"Done"` / `"Waiting"` hardcoded English strings in `FullMoonResultsPage` replaced with `t('witnessResults.statusDone')` / `t('witnessResults.statusWaiting')`. Added translations to all 6 locales.
- Inline SVG chevron in `LastQuarterPage` (CLAUDE.md violation) replaced with `<ChevronRightIcon size={12} />`.
- Duplicate `from '../design/tokens'` import in `FullMoonPage` merged into one.

**Grup 4 — Tokens and hardcoded colours:**
- Added `colors.selfBar = '#9ca3af'` and `colors.trackBg = '#f3f4f6'` to `tokens.js`.
- `DimensionRow` progress track background uses `colors.trackBg`.
- `FullMoonResultsPage` witness legend bar uses `colors.selfBar`.
- Radar toggle active buttons in `LastQuarterPage` now use exact brand blue (`colors.blue`) via inline style instead of approximate `bg-blue-700`.
- Orphan ROLE_COLORS docstring block removed from `tokens.js`.

**Grup 5 — Shared utilities:**
- Created `src/utils/share-url.js` with `encodeScores`, `decodeScores`, `CLIPBOARD_FEEDBACK_MS = 2000`. Three result pages (NM, FQ, FM) and `LastQuarterPage` now use this shared module.
- `INSTRUMENT_DOMAIN_ORDER` exported from `src/data/domains.js`; `FirstQuarterPage` and `FullMoonPage` use it instead of a local duplicate.
- `getLatestFullMoonResult(userId)` added to `lib/api.js`. Inline Supabase query removed from `FullMoonResultsPage` (was a layer violation).

**Grup 6 — Dead code:**
- `CENTROIDS` object in `team-narrative.js` was defined but never referenced. Deleted (15 lines).

### Phase 13.18 — Vitest + Unit Tests ✅ COMPLETE

Added Vitest as the test runner and wrote 80 unit tests covering all critical scoring functions.

**Test infrastructure:**
- `vitest` added as devDependency; `"test": "vitest run"` script added to `package.json`.
- `vitest.config.js` created (`environment: 'node'` — utils are pure JS with no browser APIs).
- Test files in `src/utils/__tests__/`.

**Coverage (80 tests, all passing):**
- `scoreToPercent5`, `scoreLabel5` (`scoring-utils.test.js` — 9 tests): scale conversion, boundary values.
- `computeRole`, `DOMAIN_MAP` (`role-scoring.test.js` — 12 tests): return shape, probability invariants, centroid-aligned profiles, arc membership.
- `computeWitnessScores`, `detectDivergence` (`witness-scoring.test.js` — 16 tests): vote formula, clamping, multi-round averaging, z-score diff computation using imported NORM constants.
- `balanceFlagForPBV`, `balanceFlagForC`, `balanceFlagForN`, `generateNarrative`, `computeGroupMeans`, `computeDimensionAnalysis` (`team-narrative.test.js` — 43 tests): all flag boundaries, narrative key selection, structural risk overrides, compensating member and suggestedRole logic.

**Convention:** all expected values derived from implementation; NORM_MEAN/NORM_SD/ARC_PROBABILITY_THRESHOLD imported from source — no hardcoded constants.

### Phase 13.19 — Claude Excellence ✅ COMPLETE

Full systematic resolution of all issues identified in CLAUDE_EXCELLENCE.md, prioritised by severity:

**🔴 Crítics (3):** Backend centroids correctes + algorisme consistent amb frontend; eliminar `_NORM` duplicat del backend (única font de veritat transversal); unificar filtre de membres a `computeGroupMeans` i `computeDimensionAnalysis`.

**🟠 Greus (8):** CORS HTTPS-only; JWKS cache amb TTL; rate limit a GET /witness/session/{token}; migrar consultes Supabase directes de MyResultsPage/FullMoonPage/WitnessSetupPage a lib/api.js; convertir helpers `_supabase_*` a async (httpx); eliminar N+1 amb consultes `IN`; reparar lookup d'email a create_group; afegir CI/CD pipeline (.github/workflows/).

**🟡 Importants (13):** Unificar computeFQScores/computeFMScores; extreure hook useInstrumentKeyboard; extreure hook useScaleLabels; afegir `...rest` a Button; corregir navigate() durant render; corregir DIM_TO_CENTROID dead code; corregir i18n violations; corregir hardcoded colors; eliminar redirect innecessari.

**🔵 Qualitat (8):** CSP header; ErrorBoundary; gradient ID únic; useAuth guard; WitnessRow key estable; tests Python; tests FQScores/FMScores/buildRounds; exportar constants de llindar.

### Phase 13.20 — Living model ✅ COMPLETE

Hierarchical empirical norm system with automatic 28-day background refresh.

- `scoring.py`: `NORM_MIN_SAMPLE = 200`, `NORM_REFRESH_DAYS = 28` (configurable). `resolve_norm(instrument, language, cache)` applies 3-tier hierarchy: (instrument+language) ≥ 200 → instrument-wide ≥ 200 → researcher priors.
- `main.py`: `_recompute_norms()` queries DB at startup and every 28 days via asyncio background task. All role-scoring calls use the resolved tier automatically.
- Admin dashboard → Norms tab: live tier table per instrument×language with colour-coded pills and "Refresh now" button.
- k-means centroid update (N≥300) deferred to Phase 13.23.

### Phase 13.21 — Staff admin dashboard ✅ COMPLETE

- DB: `is_admin BOOLEAN DEFAULT false` column on `profiles`.
- Backend: `require_admin` dependency; `GET /admin/stats`, `GET /admin/users`, `GET /admin/results` (paginated, searchable/filterable), CSV export endpoints, `GET /admin/norms`, `POST /admin/norms/refresh`. `is_admin` included in `/me/profile`.
- Frontend: `AdminRoute` guard (invisible redirect for non-admins); `AdminDashboardPage` with Overview / Users / Results / Norms tabs; IntersectionObserver infinite scroll; CSV download per tab.
- Nav: Admin link only rendered when `profile.is_admin = true`.

### Phase 13.22 — Transactional email + domain setup ✅ COMPLETE

- Sending domain `mail.cercol.team` verified on Resend (DKIM + SPF via Porkbun DNS).
- `api/emails.py`: branded HTML templates + 3 send functions (fire-and-forget via `asyncio.create_task`):
  1. `send_witness_assigned` — witness receives evaluation link on session create
  2. `send_witness_completed` — subject notified when witness finishes
  3. `send_group_invitation` — invited members notified on group create
- `reply_to: hello@cercol.team` on all outgoing emails.
- Email logo: `public/email-logo.png` (320×134 RGBA PNG, converted from SVG via cairosvg).
- `hello@cercol.team` receiving: Porkbun email forwarding → Gmail.
- `hello@cercol.team` sending: Resend SMTP relay configured in Gmail "Send mail as".

### Phase 13.23 — k-means centroid update

Triggered when N≥300 fullMoon results in DB. Run k-means (k=12) in 5D z-score space, compare computed centroids against current `_ROLE_CENTROIDS`, update if divergence is systematic. Admin dashboard Norms tab will expose the comparison.

### Phase 13.24 — Home page wallpaper density ✅ COMPLETE

Increased decorative animal icon count from 22 to 40 (`ICON_DEFS` — 3× full set of 12 + 4). Tightened collision radius (`÷20` instead of `÷13`) and gap multiplier (`1.02×` instead of `1.05×`) so all 40 icons pack densely in the corners and edges around the card grid. Icons remain uniform size (80px) and always upright (no rotation).

### Phase 13.25 — Supabase keep-alive ✅ COMPLETE

GitHub Actions cron workflow (`.github/workflows/supabase-keepalive.yml`) that pings the Supabase REST API every 3 days to prevent automatic project pausing on the free tier. Runs at 08:00 UTC; also triggerable manually. `SUPABASE_URL` and `SUPABASE_ANON_KEY` stored as GitHub repository secrets.

### Phase 13.26 — Complete email suite

Full resolution of email delivery issues and complete configuration of all sending identities for cercol.team.

**Delivery fix (root cause):**
- Brevo DNS records for `cercol.team` missing in Porkbun — outbound mail relayed through Brevo is accepted by the relay (250 OK) but rejected or silently dropped by recipients because SPF/DKIM for Brevo are not published. Add Brevo's required SPF include and DKIM TXT record to Porkbun DNS for `cercol.team`.
- Verify end-to-end delivery to an external address (Gmail, Outlook) from `hello@cercol.team` via Stalwart → Brevo relay.

**Email addresses and identities:**
- Decide on the full set of `@cercol.team` addresses (e.g. `hello@`, `noreply@mail.`, etc.) and create accounts in Stalwart for each.
- Configure display name per address (e.g. "Cèrcol" or "Cèrcol Team") in both Stalwart and the mail client.
- Set up profile photo / avatar for each identity in the mail client (Spark).
- Configure per-identity email signature in Spark.

**Transactional path (Resend):** already working — `noreply@mail.cercol.team` via Resend API. Confirm reply-to header is `hello@cercol.team` on all transactional templates.

**Mail client autoconfig:** `public/.well-known/autoconfig/mail/config-v1.1.xml` already updated to point outgoing SMTP to Stalwart (mail.topquaranta.cat:465). No further changes needed unless new addresses are added.

---

## Phase 14 — Onboarding

Guided first-run experience for new users.

- Welcome screen / modal on first visit explaining the three instruments and the suggested order (New Moon → First Quarter → Full Moon)
- Progress indicator: shows which instruments the user has completed and what comes next
- Contextual nudges: after completing New Moon, prompt towards First Quarter; after First Quarter, towards Full Moon
- Empty state improvements on My Results page when no instruments are done yet
- Optional: short animated intro sequence on the homepage for anonymous visitors

## Phase 15 — Stripe paywall

Define and enforce a premium tier beyond the current checkout skeleton.

- Define which features are gated: e.g. Full Moon instrument, group creation, Witness Cèrcol, PDF export
- Implement frontend guards: locked UI with upgrade prompt for non-premium users
- Backend enforcement on gated endpoints
- Upgrade flow: clear pricing page, one-click checkout (already wired), success/cancel handling
- Admin dashboard: premium conversion metrics

## Phase 16 — HR Suite

Tools for companies and HR teams to use Cèrcol at scale.

- Company account: admin can manage a team workspace with multiple groups
- Bulk member import (CSV upload)
- HR-specific group report: aggregated team profile, role distribution chart, hiring fit analysis
- Candidate assessment flow: invite external candidates to complete instruments, review results in a dedicated pipeline view
- White-label option: custom company name shown to candidates during assessment
- Usage analytics for HR admins: completion rates, time-to-complete, drop-off points

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
