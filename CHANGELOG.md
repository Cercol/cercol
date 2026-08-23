# Changelog

Cèrcol keeps its history in git and its phase history in [ROADMAP.md](./ROADMAP.md).
This file is the shorter read: what changed, month by month, from the commits
that changed behaviour. Documentation, tests and chores are left out.

Architecture decisions live in [docs/decisions/](./docs/decisions/) and what went
wrong lives in [docs/post-mortems/](./docs/post-mortems/).

## 2026-08

- **i18n** every localized page sent its reader to the English test
- **sample** /sample was the error boundary, in production, for an hour
- **sample** /sample served the homepage title, and both pages claimed one URL
- **plan** the non-English corpus is machine output nobody read
- **de** the Witness had a feminine article on a masculine noun, 16 times
- **plan** say what the test returns, and count the prose bridges
- **plan** mark the steps the daily routine will never take
- **brief** stop the indexing check re-reporting the same verdict every morning
- **prerender** the build called our own API once per route, twice over
- **prerender** the build was calling our own API once per route
- **science** the two instruments do not share a reliability
- **items** French and Spanish stop being translations
- **scale** the response scale is the instrument's, in six languages
- **items** the instruments are now the ones they cite
- **data** the two canonical item sets, taken from source
- **plan** the roadmap to an instrument that is what it says it is
- **items** the Catalan item set was machine output, and it shows
- **brief** the zero-click rule asked for a rewrite the numbers did not support
- **nav** a French reader's footer was written entirely in English links
- **data** stamp every result with the instrument version that produced it
- **admin** the distribution plan, made operable
- **prerender** the live site was asking visitors for local network access
- **sample** /sample shows the report it claims to show
- **admin** a panel for where Cèrcol should appear, and what it takes
- **admin** the blog table read two fields the API does not send
- **i18n** the footer read as machine translation, in all six languages
- **layout** the home page is the home page in every language
- **nav** the footer credits the design system, not a person
- **nav** one footer on every page, and one definition behind it
- **seo** the header links Google never saw, and a copy verdict from twelve reads
- **seo** the sitemap advertised 108 articles, not 648
- **seo** point the indexing check at the versions nobody sees
- **seo** find the article that works in one language and not another
- **events** article_view records the language, like page_view already does
- **seo** the six blog index URLs shared one English title
- **digest** the filed task list carries the evidence for its own claims
- **digest** a task list that could not be filed says so
- **seo** the indexing check cannot share the invocation that sends the brief
- **seo** ask Google whether it will index the pages, not just how they did
- **seo** the trailing-slash redirect went from 301 to 307 in the move
- **digest** the daily brief leaves its to-do list where the work happens
- **digest** three impressions on one query is weather, not a task
- **funnel** record where a test is abandoned, and stop the prerender from
- **digest** the daily brief opens with what to do, not with what happened
- **digest** the daily brief counts down to the Hetzner decommission and nags from 2026-08-31 until HETZNER_DECOMMISSIONED=1
- **email** a design kit from mm-design tokens; the daily brief rebuilt on it, with richer data
- **digest** a daily brief at 04:00 UTC, with the platform's free-plan caps
- **digest** crawler traffic from Cloudflare analytics, the section crawl_logs never filled
- **web** cercol.team and www served by the cercol-web Worker
- **worker** blog admin writes with the DOI gate, /health, /robots.txt; the route table is complete
- **worker** the six /admin/seo endpoints, and the query that never returned a row
- **web** the frontend as Cloudflare static assets, deployed beside GitHub Pages
- **worker** the seven scheduled jobs on five cron triggers, and an admin lever to run any of them
- **cloudflare** the full API on Workers, behind one switch
- **cloudflare** the strangler Worker, D1 blog, and the origin hostname Caddy needs
- **seo** every internal link was a redirect, and the guard that let 66 be 404s
- **blog** the Danish gloss of Neuroticism, and the diagrams that lagged
- **blog** the Bond dimension had three Danish names
- **blog** Danish determiners on profil, and the genuin family
- **blog** the untranslated Vision in Spanish and Catalan
- **blog** Danish common-gender agreement on profil, and two Vision compounds
- **blog** the untranslated Discipline in Spanish and Catalan
- **blog** Verbundenheit standing in for the Bond dimension in German
- **blog** German dimension names hyphenated to a German head
- **blog** the untranslated Discipline in Danish
- **blog** the grammar migration 065 broke, in German and Danish
- **blog** dimension names inside compounds, Danish and the Romance three
- **blog** German dimension names inside compounds
- **science** close the last four audit items, and the file's own em dashes
- **witness** one adjective was on the wrong factor, and the corpus oversold itself
- **docs** markdown lint, and two citation details in the references
- **science** the balance premise, against the meta-analysis that tested it
- **blog** remove a fabricated citation that was live in six languages
- **scoring** source the IPIP priors to a table that actually reports them
- **scoring** New Moon uses the TIPI's published norms, not a rescale
- **blog** a call to action three languages lacked, and 246 stale link labels
- **blog** the ten spaced en dashes 071 left in English, and count internal links
- **blog** the rankings article in five languages
- **science** SCIENCE.md cited two papers that do not exist
- **blog** the corrected statistics in five more languages, and a tenth article
- **science** correct three DOIs, one of which every z-score depends on
- **seo** emit FAQPage, and stop every article claiming to be the site FAQ
- **blog** source or remove every statistic in nine articles
- **blog** put internal link labels in the reader's language
- **blog** give the Witness its name in every language
- **nudge** describe the owner's real team, not the first group to come due
- **blog** translate the chart labels, and retranslate three drifted articles
- **blog** bring ca, es, fr and da titles and descriptions within the limit
- **blog** shorten English titles, and repair the jsonb 066 flattened
- **witness** thirteen rounds of three picks instead of twenty of two
- **witness** stop the API leaking individual witness answers, and nudge stalled teams

## 2026-07

- **auth** keep a changed email when signing in with Google
- **db** grant the app role DML on email_change_tokens
- **auth** let users change their account email, with confirmation
- **scripts** scope the attribution pass to sentences, not whole lines
- **blog** correct DOIs that resolve but cite the wrong paper; audit attribution
- **blog** restore the citations the English bodies lost in SEO rewrites
- **blog** resolve the two DOI attribution errors left open by migration 035
- **blog** catch bare-DOI citations; correct 4 more; leave 2 attribution errors visible
- **blog** correct 4 broken DOIs + dead SHRM link; gate DOIs at both entry points
- **digest** wire the source/channel split to real first-touch data
- **blog** correct 5 broken DOIs + one journal-name error (migration 033)
- **api** enforce Full Moon premium server-side (ADR 0018)
- **auth** require verified email before claiming a beta/premium slot
- **db** migration 032 — auth_users.email_verified for beta-grant gating
- **ops** database backups, ADR 0017 (two-leg: nightly pg_dump + encrypted Drive copy)
- **ci** gate deploys on tests; install pip deps in backend deploy; job timeouts
- **deps** update react-router-dom to 7.18.1; npm audit fix for build-time advisories
- **footer** author credit link to portfolio
- **blog** correct 4 broken DOIs across 5 articles; relabel legacy instrument; anon_id on all events

## 2026-06

- **content** publish 4 Aina Albaida trend-hook articles via migration 030
- **beta** grant free premium on conflict so first ~500 users are unlocked
- **auth** persist user name on Google sign-in
- **seo** public, indexable sample report at /sample (E2)
- **attribution** first-touch channel attribution on completed tests (GATED — do not merge)
- **share** per-role share loop — shared result previews the user's animal
- **blog** early in-article CTA + localize category headlines
- **prerender** isolate language per route (English pages rendered in Danish)
- **witness** nudge the witness to take the free test after completing
- **digest** foreground the north-star (completed tests this week)
- **funnel** emit test_start on First Quarter and Full Moon
- **i18n** sanctioned Witness term, es facet collision, ca nav.admin
- **i18n** drop inaccurate "peer-reviewed" from French adaptation claim
- **digest** cumulative tests as model x language pivot
- **digest** cumulative tests + population norm KPIs
- **digest** asyncpg.connect has no init kwarg
- **db** grant app role DML on events (migration 027)
- **digest** weekly metrics email + page_view tracking (Phase 17.6.7)
- **science** surface explicit N-milestone validation prose
- **blog** category-matched CTA heading (teams/work/leadership)
- **blog** fire cta_click funnel event on the article CTA
- **funnel** first-party events instrumentation (migration unapplied)
- **science** add ScholarlyArticle JSON-LD to /science
- **blog** add end-of-article CTA to the free test
- **blog** emit canonical trailing-slash internal links
- **blog** suppress view_count inflation during prerender
- **ops** apply migrations via stdin so root reads the file, not postgres
- **ops** migration dry-run writes nothing; baseline only on non-dry-run
- **email** hosted PNG icons for the email signature
- **blog** backfill null published_at to now() (017 not yet applied anywhere)
- **ops** workflow_dispatch migration-apply mechanism + ledger; accept ADR 0011
- **scripts** require DATABASE_URL from env, drop embedded default
- **blog** add published_at CHECK constraint (018), accept ADR 0010
- **blog** backfill null published_at (017) + ADR 0010 for DB published_at invariant
- **blog** deterministic ordering, NULL published_at sorts last
- **sitemap** deterministic order + honest lastmod
- **i18n** path-based multilingual top-level pages

## 2026-05

- **prerender** expose __BLOG_ARTICLES__ during render for link localization
- **blog** link integrity - audit, redirects, multilingual rewrite, CI guards
- **audit** restore Caddy access log, Decimal z-score 500, og:title per page
- **seo** og-image with real wordmark + single-clone rule
- **blog** prerender injects window.__ARTICLE__; component skips post-hydration re-fetch
- **seo** quick wins - dup meta + og:image 1200x630 + robots.txt + insights
- **seo** admin gate raises 500 on every request + CORS missing on errors
- **mcp** rename api/mcp/ to api/seo_mcp/ to avoid shadowing official MCP SDK
- **seo** Phase 17.6.2-17.6.6 - SEO observability complete (ultra-sprint)
- **seo** real-API corrections caught during Phase 17.6.1b deploy
- **seo** Phase 17.6.1a - SEO data foundation (code only, no deploy)
- **infra** Phase 17.4 Caddy snippet ownership + CI guards
- **perf** inline critical CSS + preload critical fonts via prerender post-process
- **perf,seo** inject blog articles + beta status via window globals, optimize images
- **prerender** add waitForFunction guard for blog routes
- **ci** use npm install instead of npm ci to handle cross-platform lockfile
- **sitemap** strip blog post URLs to stop Google 404s
- **FM-R.2** replace dimension-comparison with role archetype view
- **full-moon** replace Jaccard convergence with Spearman ranks (Ruta 2)
- **witness** redesign 15 adjectives to remove social-desirability bias
- **blog** include category/complexity in RETURNING and defensive row access
- **ops** add daily cron to purge expired auth tokens
- **api** validate input ranges and instrument on POST /results and witness scores
- **security** fail fast at startup if JWT_SECRET is missing or too short
- **groups** include r.language in get_group_report_data SELECT
- **scoring** align backend role centroids with frontend canonical values
- **blog** add status to SELECT in list_posts query to match projection
- **blog** include status field in list projection so admin shows correct published/draft state
- **faq** correct q6 retake behaviour and q9 Last Quarter status (all 6 locales)
- **my-results** redesign with per-instrument sections + anonymise delete
- **nav** group header links into two dropdown macro-sections
- **blog** complexity level filter + dot indicators; fix prerender CI time
- **faq** group questions into four thematic sections
- **i18n** translate blog UI strings in all 6 languages
- **blog** Phase 3 visual enrichment — inline SVG, stat-grid, callout for all 104 articles
- **blog** add visual component CSS for Phase 3 — stat-grid, callout, SVG diagrams
- **blog** multilingual URL subdirectories /ca/blog /es/blog /fr/blog /de/blog /da/blog
- **blog** related articles driven by in-text links, not hardcoded
- **blog** enrich all 4 articles — SVG diagrams, tables, DOI links, 6 languages
- **blog** visual overhaul — cover images, ToC, related articles, better prose styles
- **ci** grant contents:write permission to frontend deploy token
- **ci** use peaceiris/actions-gh-pages for token auth in deploy action
- **ci** search all JS chunks for brand colors, not just index-*.js

## 2026-04

- **emails** add reply-to hello@cercol.team on all transactional emails
- **emails** use PNG logo for Outlook compatibility
- **emails** replace text header with SVG logo
- **test** add Vitest + 80 unit tests for all critical scoring functions
- **docs** add /about, /science, /faq public documentation pages
- **witness** round polarity, adjective tooltips, subject name on landing
