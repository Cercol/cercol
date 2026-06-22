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
| 7.1 | Witness fixes: subject name on intro, adjective tooltips, round polarity (70/30, no pole mixing) (later corrected to 75/25 = 15+5; see #46). | |
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
| 15.5.1–15.5.12 | SEO and LLM visibility: README, meta/OG/JSON-LD, sitemap, llms.txt, code splitting, prerendering, 104 blog articles, visual enrichment, blog filters, FAQ categorisation, header nav, My Results redesign. | 15.5.2 and 15.5.5 still pending |
| 17 | Hygiene cleanup (2026-05-16): deleted obsolete Supabase artifacts, rewrote .env.example, audited stale references. | |
| 17.1 | Performance + SEO sprint (2026-05-16/17). 8 PRs + mm-design v0.2.0 + Caddy fix. (1) Restored API after 30-day silent Caddy outage. (2) Self-hosted Playfair Display + Roboto via mm-design v0.2.0 (no Google Fonts CDN). (3) Pre-rendered 624 multilingual blog article routes (104 slugs × 6 languages) via Puppeteer pool. (4) Eliminated blog index Soft 404 via window.__BLOG_ARTICLES__ injection. (5) BetaBanner 1300ms LCP flash fixed via window.__BETA__ injection. (6) Normalized 91 malformed double-? Unsplash URLs (cover images: 722 KiB → 43 KiB). (7) Inlined above-the-fold CSS via Beasties (Node API, post-Puppeteer per-route). (8) Preloaded 4 critical woff2 fonts (Playfair 400, Roboto 400/500/700) with content-hash extraction at build time. (9) Recharts vendor chunk split. (10) npm install CI fix. (11) Deploy path filter fix (scripts/ trigger). Baseline → after: Landing Performance 71→77, FCP 4.1s→3.5s; Blog LCP 9.1s→6.3s, Performance 66→68. A11y/BP/SEO all 100. | PRs #14–22; 131c986 direct push |
| 17.2 | SEO indexability fixes (2026-05-20). Diagnosed live with curl after Search Console reported 98 blog slugs as "Discovered: not indexed". Root causes: (1) sitemap URLs lacked trailing slash so every entry 301-redirected on GitHub Pages; (2) top-level pages (/about, /science, /faq, /instruments, /roles, /privacy) inherited the index.html canonical pointing to the home, marking them as duplicates of /; (3) blog canonical/hreflang pointed at the unslashed URL; (4) top-level hreflangs pointed at the home, not the page itself. Fixes: trailing slash enforced in `scripts/generate-sitemap.mjs` (both `<loc>` and hreflang hrefs); new `src/hooks/usePageMeta.js` mirrors the BlogArticlePage direct-DOM head pattern and is applied to all six top-level pages with unique title/description plus per-page canonical and hreflang; BlogArticlePage and BlogIndexPage canonicals fixed to include trailing slash. | |
| 17.3 | Per-page SEO metadata in six languages (2026-05-20). The six top-level pages all shipped with the same fallback EN strings in Phase 17.2. Added a `seo` namespace to every locale (`src/locales/{en,ca,es,fr,de,da}.json`) with unique `title` and `description` for `about`, `science`, `faq`, `instruments`, `roles`, `privacy`. Pages now call `t('seo.<page>.title')` / `t('seo.<page>.description')` through the existing `usePageMeta` hook, so language switching also updates head metadata. Titles ≤60 chars, descriptions 140–160 chars (Google SERP-friendly). Academic terms (Big Five, OCEAN, IPIP, AB5C, GDPR/RGPD/DSGVO) preserved per SEO conventions in CLAUDE.md. | |
| 17.4 | Caddy snippet ownership + CI guards (2026-05-20). Cèrcol and topquaranta share one Caddy on the same VPS; topquaranta's deploy re-syncs `/etc/caddy/Caddyfile` from its own repo, which kept silently dropping any in-place `api.cercol.team` block (root cause of the 30-day outage before Phase 17.1 and a second 3-day outage on 2026-05-17). Stable architecture: each project owns its own Caddy snippet under `/etc/caddy/conf.d/` and topquaranta's main Caddyfile ends with `import /etc/caddy/conf.d/*.caddy`. This phase ships the cercol side: `api/deploy/caddy/cercol-api.caddy` is now the source of truth, `deploy-backend.yml` installs it with validate-then-rollback semantics and runs an external smoke test, `ci.yml` runs `caddy validate` inside the `caddy:2` Docker image on every push, and `api/tests/test_infra.py` guards the snippet's existence and contents. Coordinated with a matching PR on the topquaranta repo that adds the `import` directive. | |
| 17.5 | Docs + sustainable process + H1 fix (2026-05-21). Instaurat el sistema docs/process/enforcement aplicat a TopQuaranta, adaptat al baseline més net de cercol. Tanca l'unic FAIL del close-out audit (H1 missing a `/` i `/science/`, duplicat a 3 articles del blog) i blinda la regressió amb `api/tests/test_seo.py`. Drift cleanup de 5 punts. Estructura nova: `docs/{archive,policies,decisions,post-mortems,architecture,ops}`. ADRs: 4 Accepted del passat (Supabase, Railway, JWT, Caddy multi-tenant) + 5 Proposed per Phase 17.6 (GCP+BigQuery, cron pattern, PSI+CrUX, MCP, SEO admin UI). 3 post-mortems d'incidents reals amb prevention links. Enforcement: PR template, CONTRIBUTING, pre-commit (`scripts/check_spec_paths.py`), `ci-docs.yml` (markdownlint, lychee, spec validator, docs coherence). LICENSE creat (MIT). Decay sweep: 7 fitxers d'auditoria arxivats a `docs/archive/audits/2026-Q2/`. | |
| 17.6.1a | SEO data foundation, codi only (2026-05-22). Codi a `api/jobs/{bing_ingest,pagespeed_ingest,crawl_log_parser}.py` amb tests mockejats (40 tests nous), DDL idempotent a `api/data/bigquery_ddl/` per a 5 taules de `cercol.cercol_seo`, fixtures sintètiques etiquetades EXAMPLE/MOCK, `scripts/apply_bigquery_ddl.py` amb dry-run sense credencials, 3 fitxers cron a `api/deploy/cron/cercol-{bing,pagespeed,crawl-parser}` (no instal·lats), gitignore endurit contra service-account keys. Docs: `docs/architecture/seo-pipeline.md` (arquitectura completa amb la limitació explícita "frontend cercol.team no té logs origin"), `docs/data/seo-schema.md` (column-level per a les 5 taules). ADRs 0005, 0006, 0007 promoguts de Proposed a Accepted amb valors reals (project `cercol` num 607121997818, datasets `searchconsole`+`cercol_seo`, budget 30 DKK/mes, identitat de servei provisional sobre compte personal documentada com a deute). Sense deploy, sense crides reals. | |
| 17.6.1b | SEO data foundation, deploy (2026-05-23). Service account key a `/home/cercol/.secrets/cercol-seo-ingest.json`, env vars al `/home/cercol/.env`, DDL aplicat (5 taules a `cercol.cercol_seo`), 3 crons instal·lats. Dos bugs reals atrapats al primer run (Bing GET vs POST, Caddy sublogger) i resolts amb PR #28. Primera ronda de dades: 10 bing_crawl_stats + 6 crawl_logs. GSC bulk export pendent ~48h. PageSpeed degraded (IP restriction a l'API key). | PR #27, #28 |
| 17.6.2-17.6.6 | SEO observability completa (2026-05-23, ultra-sprint). 5 fases en un sol PR: (17.6.2) backend `/admin/seo/*` amb 6 endpoints a `api/seo.py` i cache TTL configurable; (17.6.3) detector d'anomalies diari (`api/jobs/seo_anomaly_detect.py` + cron 05:00 UTC) que escriu a `cercol_seo.seo_anomalies` (auto-creada); (17.6.4) reescriptura de la pestanya SEO de l'AdminDashboard amb Recharts (StatCards, BarChart de crawlers, quick wins, anomalies list); (17.6.5) MCP server `cercol-mcp` amb 6 eines read-only, SQL safety per token-boundary, port intern + SSH tunnel (ADR 0008 Accepted); (17.6.6) closed-loop `copy_changes` DDL + CLI register + job `seo_copy_impact.py` (ADR 0009 Accepted). Weekly digest email deferit a 17.6.7+. | |
| 17.6.q | SEO quick wins (2026-05-23). Tres fixes verificats per curl extern abans del sprint: (a) articles del blog enviaven DOS `<meta name="description">` (la genèrica de l'index.html + la específica de l'article amb data-blog), Google podia agafar la incorrecta; afecta els 624 articles preprerenderitzats; (b) BlogArticlePage emetia `<meta property="og:*">` SENSE el `property=` attribute (perquè `meta[attr] = key` no escriu attribute amb `property` a HTMLMetaElement), els crawlers veien només les og:* genèriques de l'index.html; (c) `api.cercol.team` no tenia robots.txt (Googlebot ja s'hi havia trobat 404). Fixes: BlogArticlePage muta els tags existents via setAttribute en lloc de fer appendChild d'elements mal-formats. Tests nous a `api/tests/test_seo.py` que asserten exactament 1 `<meta name="description">` + 1 canonical per route. Index.html: og:image nova a `/og-image.png` (1200×630 PNG generada per `scripts/generate_og_image.py`), twitter:card pujada a `summary_large_image`. Endpoint `GET /robots.txt` afegit a `api/main.py` retornant "Disallow: /" (l'API no és contingut indexable). PageSpeed key desbloquejada (IP restriction resolta), pagespeed_runs ja té 14 files. docs/seo/insights-2026-05.md amb el primer informe d'observacions GSC. | |
| 17.6.7 | Backlog (planned): públic subdomini `mcp.cercol.team` si l'ús ho justifica, GSC Crawl Stats ingest, CrUX BigQuery export, og:image per ruta amb el title de la pàgina. (Weekly digest email ✅ fet a 17.12.) Editorial quick wins: enriquir `/blog/creativity-and-personality-what-big-five-research-shows` (pos 9), `/blog/self-other-agreement-big-five-where-gaps-are-biggest` (pos 11), `/da/blog/how-personality-test-scores-are-calculated` (pos 15); keyword research ES per Big Five / personalidad equipo. | |
| 17.7 | Identity migration (planned). Migrar la propietat del project GCP `cercol` i tots els tokens documentats a `docs/policies/identities.md` del compte personal de Miquel a un Google Workspace tenant arrelat a `hello@cercol.team`, una vegada Gmail desbloquegi la verificació per telèfon. | |
| 17.8 | ✅ COMPLETE — Extract require_admin to api/deps.py. Nou mòdul `api/deps.py` amb una única `require_admin` (i el seu `get_current_user`) compartida; no importa res de main/blog/seo, així que trenca el cicle d'imports que havia forçat la triple duplicació. Eliminades les tres còpies locals de `_require_admin` (a `api/main.py`, `api/blog.py`, `api/seo.py`) i els helpers morts associats (`_get_current_user`/`_bearer` a blog/seo i els imports JWT que en depenien); `api/blog.py` manté el seu guard de longitud de `JWT_SECRET`. La gate accedeix al pool via `request.app.state.pool` (mateix objecte que el `_pool` global de main). Comportament harmonitzat a la variant més estricta: es manté el check 401 de seo quan falta `sub`, així cap endpoint queda afeblit. Repuntat l'únic test white-box que cridava el símbol eliminat. | |
| 17.9 | Performance optimization (planned, troballes de l'audit 2026-05-26). Dos eixos separats, cap dels dos és un quick win: (a) **PageSpeed LCP mòbil ~6s** (mostres a `cercol_seo.pagespeed_runs`: LCP ~5.6-6.1s, FCP ~3.6-4.4s mòbil; TTFB ~12-16ms, o siga el servidor no és el coll d'ampolla). La causa probable és JS/CSS/fonts render-blocking i el lliurament de GitHub Pages (sense Brotli/HTTP3/cache-control fi). Solapa amb la migració a Cloudflare Pages ja llistada a "Pending phases"; abordar les dues juntes (code-split de rutes pesades, preload de la font crítica, defer del JS no crític, després mesurar amb el nou edge). (b) **Load average sostingut ~16 sobre 2 cores** al VPS Hetzner compartit (`nproc=2`, load 16.19/16.71/16.46, mem 3.7Gi amb 2.3Gi en ús + 1.3Gi swap). NO és causat per cercol-api (0.3% CPU a l'observació); els consumidors són els workers gunicorn de TopQuaranta i una flota de processos postgres. Acció: coordinar amb TopQuaranta per dimensionar el box o moure un dels dos serveis; cercol no pot resoldre-ho unilateralment i no s'ha de matar cap procés del veí. | |
| 17.10 | ✅ COMPLETE — Blog link integrity (2026-05-29). Tres capes perquè els enllaços interns del blog no es trenquin mai en silenci. (A) Auditoria one-shot `scripts/audit_blog_links.py` (httpx, parsing markdown amb parèntesis balancejats per no truncar DOIs) → `docs/seo/links-audit-20260528.md`: 6 slugs interns morts (5 "doblats" per un script de rename antic, 1 rename real) en 60 instàncies, 100 externs 404, 0 mismatches multilingües. (C) Resiliència automàtica: taula `blog_slug_redirects` (migració 016, idempotent, seed dels 6 + el cas `big-five-vs-disc-vs-belbin`); `GET /blog/<slug>` retorna 308 al successor per a slugs morts (un sol salt, sense cicles, degrada a 404 si la taula no existeix); reescriptura d'enllaços interns a la locale activa només si el target té aquell idioma (camp `languages` nou a l'endpoint de llista + `window.__BLOG_ARTICLES__`, exposat també durant el prerender). (B) Guàrdies permanents: `api/tests/test_internal_links_integrity.py` (falla si un enllaç intern no resol ni per article viu ni per redirect) i job setmanal `api/jobs/external_links_check.py` → `cercol_seo.external_links_status` amb digest per email. Lògica de parsing compartida a `api/blog_links.py`. PRs #38, #39, #40. | |
| 17.11 | ✅ COMPLETE — Top-level pages multilingües path-based (2026-06-01). Cada top-level page (home, about, instruments, roles, science, faq, privacy) existeix com a path real per idioma (`/es/`, `/es/about/`, ...), prerenderitzada amb HTML en aquell idioma, perquè Google pugui indexar les homes nacionals com a pàgines independents en lloc de només alternates `?lang=` de l'anglès. Routing `/:lang/<page>` a `src/App.jsx` reutilitzant els components; `useLocaleSync` central sincronitza i18n + `<html lang>` amb la URL (path > `?lang=` > desat/navegador). `usePageMeta` ara fa canonical amb prefix de locale (apunta a si mateixa) i hreflang path-based per als 6 idiomes + x-default (sense `?lang=`); `/about?lang=es` canonicalitza a `/es/about/`. HomePage afegeix `usePageMeta` (EN manté el títol SEO del shell; les homes localitzades componen títol des de strings ja traduïdes). `LanguageToggle` navega path-based per a totes les pàgines localitzables. Prerender genera `STATIC_ROUTES × 5 idiomes`; sitemap passa de 112 a 152 entrades amb un `<loc>` per idioma per cada top-level page + blog index, 0 `?lang=`. Helpers compartits a `src/utils/locale.js`. Backlog documentat: articles del blog encara amb un sol `<loc>` (alternates path-based). Exclosos amb motiu: witness (auth/per-token, sense landing pública), tests d'instruments (interactius, no prerenderitzats), auth/account/admin (privats). PR #42. | |
| 17.12 | ✅ COMPLETE — Weekly metrics digest email (2026-06-16). Tanca el backlog de 17.6.7. Un email setmanal brandejat (anglès) cada dilluns a `hello@cercol.team` amb com ha funcionat cercol.team la setmana anterior (Mon–Sun UTC): altes, tests (total + per instrument + pels 12 clusters animals), funnel visita→lectura→test→CTA amb taxes de conversió, top articles, cerca (GSC amb fallback Bing), PageSpeed, enllaços externs trencats i deltes setmana-a-setmana; cada secció degrada amb gràcia si una font és buida. (A) Nova font de dades que faltava: event first-party `page_view` disparat a cada canvi de ruta (`usePageViewTracking` a `src/App.jsx`, `getAnonId()` sense cookies a `src/lib/api.js`, `page_view` a `_EVENT_NAMES` de `api/blog.py`, migració 026 que eixampla el CHECK; retenció de 120 dies al cron diari de purga). (B) Job `api/jobs/weekly_digest.py` (PostgreSQL + BigQuery, mateix patró que `external_links_check`), builder `weekly_digest_html` a `api/emails.py` reusant el shell `_base`, computació de cluster amb `scoring._compute_role` (z-scores de priors), cron `cercol-weekly-digest` (dilluns 08:00 UTC, ADR 0006). Tests: backend 158 passed, frontend 245 passed. Aplicació: migració 026 via `apply-migrations.yml`; crons instal·lats manualment al VPS. | |
| 18 | ✅ COMPLETE: Design-system unification / DRY consolidation (2026-06-23). Five sequenced PRs that close the "public pages and staff/admin look like two different designs" drift and remove copy-paste across the frontend, least-risk first. (PR1, #100) ADR 0015: the canonical card/component language is the existing local `components/ui` flat `ui/Card` (rounded, gray-200 border, no shadow); the admin area migrates onto it; primitives stay local for now. (PR2, #101) Pixel-identical extractions: `components/report/MethodologyNote` (report disclaimer footnote, 4 sites), `components/ui/DisplayHeading` (the repeated `var(--mm-font-display)` inline style, 7 sites), one `src/design/gradients.js` constant for the brand-blue gradient whose `#00297a` dark stop has no token, and renamed the local `RoleCard` in RolesPage to `RoleSummaryCard` to stop colliding with the shared report `RoleCard`. (PR3, #102) index.css tokenization, option 2: replaced the 11 raw literals that map to an exact-value mm-design token and are semantically coherent; left the bespoke prose-callout palette (11 background/text shades with no token) as documented raw literals with an exception comment. (PR4, #103) Canonical role data: single `ROLE_IDS` in `src/data/roles.js` consumed by both RolesPage and `utils/role-share` (the two prior orderings agreed, R01..R12; share URLs unaffected), and /roles colors now come from `ROLE_COLORS` (mm-design) instead of a divergent local Tailwind palette. (PR5, #104) Admin onto the shared layer: new `components/ui/StatCard` and `components/ui/Sparkline` (token-colored); all 16 hand-rolled `rounded-xl border-gray-100 shadow-sm` card strings removed (14 div shells now use the flat `Card`, 1 `<a>` link card class-aligned to the flat spec); hardcoded `#0047ba`/`#427c42`/`#e5e7eb` replaced with tokens; phantom `var(--mm-font-heading)` dropped. PR5 is presentational only (no admin behavior change); admin runtime visuals are not covered by tests and were left for operator QA on deploy. Gates per PR: 248 frontend tests + build green. | Tailwind gray text utilities left as-is (value-identical to mm-design gray tokens). |

---

## Pending phases

### Cloudflare Pages migration

**Why:** GitHub Pages serves all assets with `cache-control: max-age=600` (10 min) and does not support Brotli or HTTP/3. These are the two remaining gaps to push Performance from ~77 to 85+. Cloudflare Pages offers: long-lived caching for content-hashed assets (`max-age=31536000`), Brotli compression, HTTP/3, global CDN edge, free tier.

**Scope:** DNS migration (CNAME → Cloudflare Pages), update `VITE_API_URL` check, verify prerender + `gh-pages` action or switch to Cloudflare Pages deploy action. Estimated 2–4h. Low risk if prepared on a staging subdomain first.

---

### PageSpeed retest (2–4 weeks from 2026-05-17)

Google needs to re-crawl the 98 blog slugs that were "Discovered: not indexed" due to pre-render errors baked into the HTML. After Google re-crawls, Search Console should show 0 in the "Discovered: not indexed" bucket. Rerun PageSpeed mobile on:
- https://cercol.team (baseline: Performance 77, LCP 3.5s)
- https://cercol.team/blog/<slug> (baseline: Performance 68, LCP 6.3s)

---

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
