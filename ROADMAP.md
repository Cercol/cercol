# Cèrcol — Roadmap

<!--
  All completed-phase implementation details live in git history.
  This file is a navigation aid: summary table + pending phases + maintenance rules.
-->

## Completed phases (consolidated)

| Phase | What was built | Notes |
|-------|---------------|-------|
| 1 | New Moon Cèrcol MVP (10 items, radar chart). GitHub Pages. | |
| 2 | First version 30-item test. Anonymous result logging. i18n foundation. | |
| 3 | Dual instrument homepage. Dimension names. UX polish. | |
| 3.5 | Bilingual test items (EN + CA structure in data files). | |
| 3.6–3.8 | Keyboard nav, Likert fixes, translation feedback, block transitions. | |
| 3.9 | Dimension and facet descriptions on results pages. | |
| 3.10 | Lunar phase naming. First Quarter Cèrcol (IPIP-NEO-60, 60 items, 30 facets). | |
| 3.11–3.13 | Housekeeping: scoring utilities consolidated, domains.js as single source of truth. | |
| 3.14 | README.md. | |
| 3.15 | Credentials to environment variables. | |
| 3.16–3.18 | Display bug fixes. Complete rename to FirstQuarter. Lunar phase map to 4 phases. | |
| 3.19 | Custom domain: cercol.team. | |
| 4.1 | FastAPI skeleton on Railway. Supabase profiles schema. | |
| 4.2 | Magic link auth (frontend + backend). Supabase JWT via JWKS/ES256. | |
| 4.3 | Linked results. My Results page. | |
| 4.4 | Shared Layout component. HTTPS bug fixes. | |
| 4.5 | Stripe infrastructure (checkout + webhook + premium column). | |
| 4.6 | Multi-method auth: Google OAuth + password + magic link. | |
| 4.7 | FQ gate removed. Freemium model documented. | |
| 5 | Beta role scoring in First Quarter. 9-role system (superseded in Phase 8.3). RoleProbabilityBars. | |
| 6.1 | Full Moon Cèrcol: IPIP-NEO-120, 120 items, 5 blocks, results page. | |
| 6.2 | Full Moon gate (Stripe). Paywall screen. FQ → FM upgrade CTA. | |
| 7 | Witness Cèrcol: 100-adjective AB5C corpus, 20 rounds forced choice, up to 12 witnesses, /full-moon/report. | |
| 7.1 | Witness fixes: subject name on intro, adjective tooltips, round polarity (70/30, no pole mixing). | |
| 8 | Documentation site: five routes (/about, /instruments, /roles, /science, /faq) — bilingual EN + CA. | |
| 8.2 | Instrument intro screens before first item on all three instruments. | |
| 8.3 | Role system: 9 roles → 12 animal roles (Dolphin–Badger). AB5C-based 5D centroids, softmax assignment, 15% arc threshold. | |
| 9.1 | Locale fixes: 12 role CA fields corrected, founding phrase translated, Belbin section removed from /roles. | |
| 9 | Full Moon integrated report: combined role, convergence score (Jaccard), blind spots, narrative layout at /full-moon/report. | |
| 9.2 | Pre-Phase 10 audit: i18n corrections, design token cleanup, 60 FQ facet CA descriptions translated. | |
| 10.1 | Brand identity foundation + homepage redesign. tokens.js palette + typography. Blue header, CercolLogo. | |
| 10.2 | Homepage card fix + centralized layout container. White content wrapper max-w-4xl. | |
| 10.3 | Purple removal. All purple/violet/indigo Tailwind classes replaced with brand tokens. | |
| 10.4 | Component system (Button, Card, Badge, SectionLabel) + mobile hamburger nav. | |
| 10.5 | Results pages dashboard redesign. Role-first layout, two-column radar+domains, combined role for report. | |
| 10.6 | Test flow pages brand identity. LikertScale, QuestionCard, ProgressBar, intro/transition screens. | |
| 10.7 | Animal JPG illustrations on role cards (superseded by RoleIcon in Phase 10.14). | |
| 10.8 | Moon phase SVG line icons: NewMoonIcon, FirstQuarterIcon, FullMoonIcon, CheckIcon. | |
| 10.9 | Functional line icons: ArrowLeft/Right, Keyboard, InfoCircle, X, ChevronRight, Share, BlindSpots. | |
| 10.10 | Animal role icons (12) + dimension icons (5) in MoonIcons.jsx. RoleIcon + DimensionIcon wrappers. | |
| 10.11 | Animal icon redesign from scratch for recognisability. DimensionIcon on AboutPage. | |
| 10.12 | External potrace SVG animal icons via Vite `?raw` import. Zero new deps. | |
| 10.13 | RoleIcon added to RoleProbabilityBars. | |
| 10.14 | JPG illustrations replaced by RoleIcon (size 96, white on blue bg) on all role cards. | |
| 10.15 | Role card: icon left-sidebar (red, size 64). Radar chart: circular grid + organic Bézier shape. | |
| 10.16 | Homepage: larger moon icons, dynamic animal wallpaper. Science page: Five Dimensions section. | |
| 10.17 | Dynamic wallpaper with collision avoidance. Header: UserIcon dropdown, GlobeIcon language toggle. | |
| 10.18 | User profile feature: first/last name, country, native language. ProfilePage + AuthContext extension. | |
| 10.19 | Legal compliance: Privacy Policy (/privacy) + cookie banner. GDPR-compliant. | |
| 10.20 | Security hardening: premium self-escalation fix, witness_responses open INSERT dropped, rate limiting. | |
| 11.1 | Spanish (ES) UI translation + all 190 test items. | |
| 11.2 | French (FR) + German (DE) UI translations + all 190 test items. | |
| 11.3 | Language selector dropdown (ISO codes). ProfilePage Valencian entry removed. | |
| 11.4 | Catalan test item translations (all 190). Danish (DA) UI + test items + LanguageToggle. | |
| 12.1 | Witness identity layer: optional auth linking, `/witness/my-contributions` endpoint. | |
| 12.2 | Team groups system: groups + group_members schema, CRUD endpoints, GroupsPage, invite flow. | |
| 12.3 | Group detail: LastQuarterPage (team report, balance analysis, narrative), seed scripts. | |
| 12.4 | Homepage 4th card (Last Quarter). LastQuarterIcon. Wallpaper density ↑. | |
| 12.5 | GroupsPage cards clickable. Wallpaper uniform size + upright. AccountButton avatar polish. | |
| 13.1 | Last Quarter report layout redesign: ROLE_COLORS, multi-series RadarChart, two-column Section 1. | |
| 13.2 | Last Quarter: My profile / Team average toggle. Dimension rows. Icon-only member list. | |
| 13.3 | Last Quarter: IconTooltip, radar tooltip precision. Balance analysis full redesign. | |
| 13.4 | Last Quarter: all 27 narrative keys translated to 5 languages. Compact print layout. | |
| 13.5 | Last Quarter: 3-column top [40/30/30] + 2-column bottom [50/50] layout. | |
| 13.6 | Print layout fix: stable class names + @media print grid overrides for Tailwind responsive collapse. | |
| 13.7 | My Results: DimensionIcon rows, Full Moon card clickable. FullMoonReportPage probability bars redesign. | |
| 13.8 | Full Moon report: dot-marker probability bars. Blind spots → bullet list. Dimension rows 2-col grid. | |
| 13.9 | Full Moon report: role name dominance, dot marker colours, dimension bars with witness tick. Last Quarter segmented control + collapsible balance rows. | |
| 13.10 | Full Moon report + First Quarter structural redesign. Collapsible facet accordion. | |
| 13.11 | Shared report components: DimensionRow, FacetAccordion, report/index.js barrel export. | |
| 13.12 | Merge FullMoonResultsPage + FullMoonReportPage. ConvergenceMeter moved to shared components (removed in FM-R.2, commit fe5b29e). | |
| 13.13 | Facet persistence (JSONB column). ReportPageHeader, RoleCard, RadarDataCard shared components. Visual unification across all 4 report pages. | |
| 13.14 | Dimension descriptions in FacetAccordion. RadarDataCard customFirstCol. Last Quarter unified with shared components. | |
| 13.15 | Radar polygon rendering fix: isAnimationActive=false, OrganicRadarShape center derivation. | |
| 13.16 | Audit cleanup: DOMAIN_COLORS/ICON_CLASSES/BG_CLASSES to tokens.js. All inline SVGs to MoonIcons.jsx. Dead files/assets deleted. | |
| 13.17 | Codebase consolidation: NORM constants centralised, scoring-utils.js, share-url.js, dead code removed. | |
| 13.18 | Vitest test suite: 194 tests covering scoring-utils, role-scoring, witness-scoring, team-narrative, witness corpus. | |
| 13.19 | Claude Excellence audit: 32 issues resolved (backend centroids, CORS hardening, CI/CD pipeline, hooks, layer violations). | |
| 13.20 | Living model: 3-tier empirical norm hierarchy with 28-day background refresh. Admin norms tab. | |
| 13.21 | Staff admin dashboard: Overview, Users, Results (paginated + CSV), Norms tabs. is_admin gate. | |
| 13.22 | Transactional email: Resend setup, 3 email templates (witness assigned/completed, group invite). | |
| 13.24 | Homepage wallpaper density: 40 icons, tighter collision radius. | |
| 13.26 | Complete email suite: cercol.team apex domain on Resend, Stalwart relay, hello@cercol.team identity. | |
| 14 | Onboarding: OnboardingModal (once per new user), InstrumentNudge CTA, progressive MyResults empty states. | |
| 14.5 | Self-hosted auth migration: Supabase Auth replaced with FastAPI + HS256 JWT + Resend magic links + Google OAuth. | |
| 15.5.1–15.5.12 | SEO and LLM visibility (10 of 12 complete): README, meta/OG/JSON-LD, sitemap, llms.txt, code splitting, prerendering, 104 blog articles, visual enrichment, blog filters, FAQ categorisation, header nav, My Results redesign. | See pending phases for 15.5.2 and 15.5.5 |
| 17 | Hygiene cleanup (2026-05-16): deleted obsolete Supabase scripts, rewrote .env.example, audited stale references. | |

---

## Pending phases

### Phase 13.23 — k-means centroid update

Triggered when N≥300 fullMoon results in DB. Run k-means (k=12) in 5D z-score space, compare computed centroids against current `_ROLE_CENTROIDS`, update if divergence is systematic. Admin dashboard Norms tab will expose the comparison.

---

### Phase 15 — Stripe paywall

Define and enforce a premium tier beyond the current checkout skeleton.

- Define which features are gated: e.g. Full Moon instrument, group creation, Witness Cèrcol, PDF export
- Implement frontend guards: locked UI with upgrade prompt for non-premium users
- Backend enforcement on gated endpoints
- Upgrade flow: clear pricing page, one-click checkout (already wired), success/cancel handling
- Admin dashboard: premium conversion metrics

---

### Phase 15.5.2 — /science public page (pending)

Make SCIENCE.md content publicly accessible and web-indexable at /science.
Currently only the existing /science route (Phase 8) is live; needs to be
enriched with DOI links, AB5C explanation, and validation plan for LLM indexing.

---

### Phase 15.5.5 — Distribution (pending)

Product Hunt launch, Hacker News "Show HN", Reddit outreach,
ipip.ori.org contact, language-specific media outreach (CA/DA/FR/DE).

---

### Phase 16 — HR Suite

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
