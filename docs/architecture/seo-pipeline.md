# SEO data pipeline

End-to-end architecture of the SEO observability surface that Phase
17.6.1a establishes in code. Phase 17.6.1b deploys it; this document
describes the design that lands when both phases ship.

# Spec: docs/architecture/seo-pipeline.md

## Goal

Centralise every SEO signal Cèrcol cares about into one BigQuery
project so dashboards and ad-hoc queries can join across sources.
Sources covered here:

- Google Search Console (impressions, clicks, queries, pages,
  countries, devices). Pushed by Google's own bulk export.
- Bing Webmaster Tools (queries, pages, crawl stats). Pulled by
  us.
- PageSpeed Insights v5 (LCP, INP, CLS, FCP, TTFB, scores per
  device). Pulled by us.
- Caddy crawler hits on `api.cercol.team`. Parsed locally.

The pipeline is intentionally code-first: every transformation has
a Python module and a pytest, every table has a DDL file, every
schedule has a cron file in this repo. Nothing important lives
only on the server.

## GCP project layout

| Item | Value |
|---|---|
| Project id | `cercol` |
| Project number | 607121997818 |
| Region | EU (multi-region) |
| Billing owner | Miquel personal account (provisional, see ADR 0005) |

Two datasets:

- `searchconsole` - Google Search Console bulk export. Tables and
  schema owned by Google; we only read from it.
- `cercol_seo` - everything we write. Five tables, all created from
  the DDL under `api/data/bigquery_ddl/` by
  `scripts/apply_bigquery_ddl.py --apply`.

Tables in `cercol_seo`:

| Table | Source | Partition | Cluster |
|---|---|---|---|
| `bing_query_stats` | Bing WMT GetQueryStats | date | query |
| `bing_page_stats` | Bing WMT GetPageStats | date | page |
| `bing_crawl_stats` | Bing WMT GetCrawlStats | date | - |
| `pagespeed_runs` | PSI API v5 | run_date | url, device |
| `crawl_logs` | Caddy access log parser | ts_date | bot_name, path |

See `docs/data/seo-schema.md` for column-level details.

## Identity and credentials

Service account: `cercol-seo-ingest@cercol.iam.gserviceaccount.com`,
key file stored on the server at
`/home/cercol/.secrets/cercol-seo-ingest.json`, never in this repo. The
.gitignore patterns added in FASE A block accidental commit.

Project ownership is currently on Miquel's personal Gmail account
because creating a new Google Workspace account on
`hello@cercol.team` is blocked at the phone-verification step.
This is conscious technical debt; the migration is tracked as
Phase 17.7 in ROADMAP. The runbook documents which tokens migrate
when the move happens.

Environment variables read by the ingest jobs (see
`api/jobs/_config.py`):

- `BIGQUERY_PROJECT` default `cercol`
- `BIGQUERY_DATASET_GSC` default `searchconsole`
- `BIGQUERY_DATASET_SEO` default `cercol_seo`
- `GOOGLE_APPLICATION_CREDENTIALS` path to the SA key file
- `BING_WMT_API_KEY` Bing Webmaster Tools API key
- `PAGESPEED_API_KEY` PSI API key
- `SEO_SITE_URL` default `https://cercol.team/`

All loaded from `/home/cercol/.env` on the server (per
`docs/ops/runbook.md`).

## Ingest jobs

Three Python modules under `api/jobs/`, invoked from
`/etc/cron.d/cercol-*` files on the server. Not in-process. See
ADR 0006 for the cron-vs-APScheduler decision.

### bing_ingest.py

Cadence: weekly, Sunday 03:00 UTC. Pulls three Bing methods,
parses each, and DELETE-then-INSERTs the affected day partitions
in BigQuery. Idempotent on re-run within the same day.

### pagespeed_ingest.py

Cadence: weekly, Sunday 04:00 UTC. URL selection:

- After the GSC bulk export has at least 14 days of data:
  top-N URLs by impressions over the last 14 days, queried from
  `searchconsole.searchdata_url_impression`.
- Before that: hardcoded `SEED_URLS` list inside the module.

For each URL, two PSI calls (mobile and desktop). Rows append to
`pagespeed_runs`; history is kept for trend dashboards.

### crawl_log_parser.py

Cadence: daily 02:00 UTC. Reads
`/var/log/caddy/cercol_api_access.log` incrementally from the
saved offset and inode in
`/home/cercol/.state/crawl_parser_offset`. Filters lines whose
User-Agent matches one of 15 known crawler patterns, classifies
into a normalised `bot_name`, and writes one row per hit.

## Limitation: frontend has no origin logs

The frontend at `cercol.team` is hosted by GitHub Pages. GitHub
does not expose origin logs to the site owner. Consequences:

- The Caddy log parser sees ONLY `api.cercol.team` traffic.
  Google crawls of `/`, `/science/`, `/blog/...` are invisible
  to us at the origin.
- For full-site crawler observability we depend on Search
  Console Crawl Stats (per-day aggregates by file type and
  response code), which is not part of the bulk export and
  requires a separate API call. A future job under
  `api/jobs/gsc_crawl_stats_ingest.py` will fill that gap; not
  in scope for 17.6.1a.

The dashboards explicitly distinguish "API surface" (rich data)
from "frontend surface" (sparse, GSC-only).

## Sequencing

Phase 17.6.1a: code in this repo only. No deploy. No real API
calls.

Phase 17.6.1b: server-side deploy. Steps documented in the
runbook:

1. Place the SA key at `/home/cercol/.secrets/cercol-seo-ingest.json`,
   mode 0400, owner `cercol:cercol`.
2. Add the SEO env vars to `/home/cercol/.env`.
3. Run `scripts/apply_bigquery_ddl.py --apply` once to create
   the `cercol_seo` tables.
4. Install the three cron files (see `api/deploy/cron/README.md`).
5. Wait 48 hours for the GSC bulk export to populate, then
   confirm the first runs landed data in BigQuery.

Phase 17.6.2 onwards: ingest the remaining sources (GSC Crawl
Stats, CrUX BigQuery export), build the admin dashboards (ADR
0009), expose the MCP server (ADR 0008).

## Phase 17.6.2 to 17.6.6 (delivered in one ultra-sprint, 2026-05-23)

Adds the read surfaces on top of the ETL foundation that
17.6.1a/b shipped.

### Admin SEO API (api/seo.py)

Six read-only endpoints under `/admin/seo/*` behind the admin gate
(see `_require_admin` in api/seo.py, an explicit local duplicate
following the same pattern as api/blog.py; TODO Phase 17.8
extracts the dependency to api/deps.py):

- `GET /admin/seo/sources` — row counts and last-update per
  ingest table plus GSC bulk-export readiness.
- `GET /admin/seo/health` — 28-day KPIs across all sources.
- `GET /admin/seo/queries` — top queries, prefers GSC and falls
  back to Bing.
- `GET /admin/seo/pages` — top pages, same preference order.
- `GET /admin/seo/anomalies` — pages with > threshold_pct change
  in 7 days vs prior 7 days.
- `GET /admin/seo/page/{slug}/lifecycle` — per-day history for
  one URL.

Process-local cache with configurable TTL
(`SEO_CACHE_TTL_S`, default 3600). All endpoints return their
normal shape with a `data_pending: true` flag when the underlying
tables are empty; no 500 responses on pending data.

### Admin dashboard (src/pages/AdminDashboardPage.jsx)

Rewrites the SEO tab (previously a hardcoded checklist). New
sections, top to bottom: data-pending banner, source status grid,
28-day overview (4 StatCards), 7-day crawler bar chart, quick-wins
table (queries at SERP position 8 to 20), anomalies list,
auxiliary external-tools and LLM-visibility sections at the
bottom. Uses Recharts, already in package.json.

### Daily anomaly detector (api/jobs/seo_anomaly_detect.py)

Cron `cercol-seo-anomaly` runs at 05:00 UTC. Compares the last
7 days vs prior 7 days for:

- GSC impressions per URL.
- Lighthouse mobile performance score per URL (compares the two
  most recent runs).

Threshold defaults to 30 percent. Writes one row per anomaly into
the auto-created `cercol_seo.seo_anomalies` table. The daily
cron-mail log carries a summary. Weekly digest email was
intentionally deferred to a later phase (ROADMAP 17.6.3+).

### MCP server (api/mcp/server.py + systemd unit)

Separate process under cercol-mcp.service, bound to
`127.0.0.1:8091`. Operator reaches it via SSH tunnel; no public
subdomain (ADR 0008). Six tools: `seo_query`, `seo_page_lifecycle`,
`seo_anomalies`, `seo_quick_wins`, `seo_compare_periods`,
`seo_sources_status`.

SQL safety on the `seo_query` tool: a token-boundary regex blocks
all DML and DDL (INSERT/UPDATE/DELETE/DROP/ALTER/CREATE/etc.) and
constrains every query to address `cercol.cercol_seo` or
`cercol.searchconsole`. Multi-statement and CALL also blocked.
Twenty unit tests cover the safety surface plus the per-tool
behaviour.

Auth: dedicated `MCP_API_KEY` env var, bearer header.

### Closed-loop copy tracking

`cercol_seo.copy_changes` (DDL 06) tracks title/description/h1
changes with a scheduled_measure_ts for the 14-day evaluation.

- `scripts/register_copy_change.py`: manual CLI invoked on the
  server after merging a copy-change PR.
- `api/jobs/seo_copy_impact.py`: weekly job that walks
  `WHERE measured = FALSE AND scheduled_measure_ts <= NOW()`,
  computes 14d-after vs 14d-before CTR for each row from GSC,
  and writes the result back. Skips rows for which GSC has no
  data in either window.
- Cron file not installed in this sprint; install procedure in
  the runbook for the future "go live" of closed-loop.

### Weekly digest funnel: which source feeds which number

The weekly digest (`api/jobs/weekly_digest.py`) funnel mixes two
independent tables, which is easy to misread when querying by hand:

- The four event rows (page views, article reads, test starts, CTA
  clicks) come from the `events` table.
- "Tests completed" (both the funnel row and the north-star headline)
  is a `COUNT(*)` over the `results` table, **not** an event.

The `events` table column is `name` (not `event_type`), and a CHECK
constraint restricts it to exactly four values: `page_view`,
`article_view`, `cta_click`, `test_start`. There is **no**
`test_completed` event, and completions are never counted from
`events`.

False-alarm correction (Jul 2026): a prior ad-hoc query reported
"the events table has zero rows for `cta_click` and `test_completed`".
That was a query artifact — it filtered on `event_type` (the column is
`name`) and on `test_completed` (not a valid event name). Ground truth:
`cta_click` rows do exist, and completions come from `results`. The
digest funnel numbers are accurate.

### DOI resolution gate (Jul 2026)

Three batches of unresolvable DOIs reached production (migrations 031,
033, 034). The pattern was identical every time: the citation text
named a real paper with the right author, year, journal, volume and
pages, and only the DOI digits were wrong. Prose review cannot catch
this, because nothing in the sentence is false. The only thing that
distinguishes a good DOI from a fabricated one is asking the resolver.

`api/doi_check.py` is that check, and both content entry points route
through it:

- **Admin API** (`POST`/`PUT /blog`): `api/blog.py` rejects a body
  carrying a dead DOI with `422 unresolvable_doi`. Set
  `DOI_CHECK_SKIP=1` to bypass in an emergency.
- **Migration SQL** (`db/migrations/*.sql`): the `DOI resolution` CI
  job runs `scripts/check_dois.py` over changed migrations. This is the
  route the API guard cannot see: migration 030 seeded four articles
  directly.

Two rules matter:

- **Do not follow redirects.** A registered DOI answers 302 at
  `doi.org`; an unregistered one answers 404 there. Stopping at the
  resolver sidesteps publisher bot-detection entirely — APA, SAGE and
  JSTOR all serve 403 to non-browser agents, the same noise that made
  `external_links_check` classify 403 as flaky rather than broken.
- **Fail open on transport, closed on 404.** A `doi.org` outage must
  never block publishing; a definitively unregistered DOI always must.

A remediation migration necessarily *names* the DOIs it deletes, once
in the header mapping and once as the `replace()` needle, so it
declares them:

```
-- doi-check: retires 10.1177/1073191106293419
```

Those are exempt in that file only, and the declaration doubles as the
record of which broken DOI each migration was written to kill.

`scripts/check_dois.py --live` sweeps the published corpus, which is
how you confirm a remediation migration actually landed in every
language.

### Broken-link reporting is per URL, not per instance

The digest's broken-links section used to select one row per
(url, slug, lang) capped at `LIMIT 25`. One dead DOI cited in one
article occupies six rows, one per language, so the Jul 27 2026 digest
spent its entire budget on three DOIs and silently dropped two more
broken URLs — the truncated list looked complete. The query now groups
by URL and carries the affected slugs and language-version count
alongside. One dead link is one fix, however many translations repeat
it.

### Bare DOIs: why three batches never converged

`external_links_check` probes *link targets*. A citation written as
running prose creates no link:

```
(Connelly & Ones, 2010, DOI: 10.1037/a0021212)
```

so the job was structurally blind to it, and migrations 031, 033 and
034 only ever fixed the hyperlinked citations. The Jul 2026 corpus
sweep, which extracts DOIs by pattern rather than by link, found six
more dead DOIs sitting in reference lists as plain text (migration
035). The job now folds bare DOIs into the same probe path, normalising
`doi.org` URLs to lowercase so the linked and prose forms of one paper
collapse to a single row.

### When a broken DOI is not a digits error

Most broken DOIs in this corpus are digit errors: the citation text
names a real paper and only the identifier is wrong, so the fix is
mechanical. Two are not, and migration 035 deliberately leaves them
broken:

- `10.1037/0021-9010.84.6.929` — attributed to Judge et al. (1999) for
  a claim about creative improvisation; that paper is about career
  success.
- `10.1037/0022-3514.89.1.122` — attributed to Roberts et al. (2005)
  for a claim about communication formality; that paper is about the
  factor structure of Conscientiousness.

Swapping in a resolvable DOI would turn a visibly broken link into an
invisibly false citation, and the gate would go green on it. A broken
link is the safer failure. These need an editorial decision — find the
real source, or soften the claim and drop the citation — and stay in
the weekly digest until someone makes it.

### Resolution of the two attribution errors (migration 036)

The two DOIs migration 035 left broken were resolved differently,
because they were not the same kind of problem:

- **Wrong citation, sound claim.** The claim that high Conscientiousness
  predicts worse performance where creative improvisation is required
  is well supported, just not by Judge et al. (1999). LePine, Colquitt &
  Erez (2000, Personnel Psychology 53, 563-593) found exactly it: after
  an unforeseen change of task context, *lower* Conscientiousness
  produced better decisions, traced to the dependability facets. The
  citation was replaced wholesale, author-year and DOI together, rather
  than repointing someone else's name at a DOI that is not theirs.
- **No such study.** The claim that Conscientiousness is the strongest
  Big Five predictor of communication formality and documentation
  habits has no source. Roberts et al. (2005) is about the factor
  structure of Conscientiousness, and no study isolating communication
  formality as a Big Five outcome turned up. There was no correct DOI
  to substitute, because the sentence described research that was never
  done, so the sentence was rewritten in all six languages to keep the
  substance and drop the false empirical framing.

The general rule: when a citation does not support its sentence, find
what the claim is really standing on. If something does, cite that. If
nothing does, the sentence is the thing that has to change. Substituting
a plausible-looking DOI to make the gate go green is the exact failure
this pipeline exists to prevent.

### English lost its citations, not the other way round (migration 037)

An audit of all 108 articles compared citation density across the six
languages. Exactly two are skewed, and in both it is the **English**
body that is missing what the translations kept:

- `big-five-vs-disc-vs-belbin` had no source list at all, only
  "Further reading" internal links, while making falsifiable claims
  about DISC's validity and Belbin's inventory.
- `blind-spots-in-teams` had the richer list of the two languages (four
  entries against Catalan's two) but no DOIs on any of them.

This is the tail of the SEO rewrite tranches (migrations 020-024): the
English bodies were restructured for search and their reference
apparatus did not survive. English is the SEO-primary language and the
one an LLM is most likely to quote, so it is the worst place in the
corpus to carry uncited claims.

Kenny & West (2008) stays without a DOI: it is a Guilford book chapter
with none registered. A missing DOI is honest; an approximate one is
not.

### Content migrations are not idempotent by default

Migrations 034-036 replaced a dead DOI with a live one. Old and new
were disjoint, so a re-run found no needle and changed nothing.

A migration that *adds* text around a needle it keeps has the opposite
property: the replacement contains the needle, so a second run inserts
a second copy. The first draft of migration 037 did exactly this and
produced two `## Sources` headings. Such statements need a `WHERE`
guard on the text they add.

`scripts/test_content_migration.sh` is the harness: it seeds a
throwaway Postgres from the live API, applies the migration twice, and
fails if the second run changes anything. Run it on any migration that
touches `blog_posts.content` before shipping.

```
scripts/test_content_migration.sh db/migrations/037_*.sql slug-one slug-two
```

### Resolution is not attribution (migration 038)

Every batch through 037 fixed DOIs that were **dead**. A full-corpus
attribution audit (168 citation instances, 65 distinct DOIs, all 108
articles) found a worse class: DOIs that are perfectly **alive** and
cite the wrong paper. 17 of them.

The resolution gate cannot see these by construction. It asks "does
this identifier exist", never "is this the paper you named". The worst
example: a Neuroticism article cited "Alarcon et al. (2009)
meta-analysis" against `10.1002/job.4030140402`, which resolves to a
1993 one-line notice titled "Best paper prize 1992 ($750 prize)". It
passed every check the pipeline had.

`doi_check.attribution_mismatch` compares the author the prose names
against the Crossref record for the DOI it prints:

```
scripts/check_dois.py --live --attribution
```

**Report-only, deliberately not in CI.** Measured against the Jul 2026
corpus it caught 17 of 17 real wrong-paper citations but also flagged
one correct one, because it infers the intended author from a fixed
window of surrounding prose. That precision is right for an audit a
human triages and wrong for a gate that blocks publishing. Resolution
stays the hard gate; attribution is the periodic sweep.

Two rules learned from the batch:

- **Scope replaces to the slug when the wrong DOI is right elsewhere.**
  `what-is-agreeableness` cited Bell (2007)'s DOI for a Judge (2013)
  paper. Bell is correctly cited in three other articles, so a
  corpus-wide replace would have broken them.
- **A fabricated reference is removed, not repointed.** "Nestsiarovich
  & Pons (2020), *PLoS ONE* 15(3)" does not exist in any form. Their
  real 2020 paper is a five-team observational study that supports
  nothing the article claims, so substituting it would have been
  laundering. The entry is gone.

### Fixing a DOI does not fix a claim

11 of the 17 mismatches could not be resolved with a DOI swap, because
the *correctly*-attributed paper does not support the sentence. Examples:
a "meta-analysis" that is four original studies, a mapping study whose
stated conclusion is the opposite of what the article reports it
concluding, and a work-home interference paper that measures no
personality traits at all.

Swapping the DOI in those cases makes a false claim look sourced, which
is strictly worse than a broken link. They need prose rewrites and are
tracked separately.

## Internal link canonicalisation (Aug 2026)

Search Console opened two new indexing reasons in the same week,
"Page with redirect" and "Not found (404)", four days after it validated
the 98 pages the instrument-page fix (#134) recovered. A crawl of the
site from the sitemap outward found 767 distinct internal link targets:
103 answered 200, 656 answered 301, and 8 answered 404.

### The redirect half: the router's paths are not URLs

Every prerendered route is written as `<route>/index.html`, so GitHub
Pages 301s the extension-less form. The sitemap, the canonical tag and
every hreflang emit the slash form. React Router's `to` props do not,
and to the router they are not wrong: `/roles` and `/roles/` are the
same route, and a client-side navigation issues no HTTP request at all,
so a reader never sees the hop. A crawler follows the links as written
and takes a 301 on all of them, and reports the non-canonical form.

Article bodies were already normalised (`localizeBlogLinks` in
BlogArticlePage) and component links never were, which is why the
related-article cards and the body prose on the same page disagreed
about the same URL.

The slash is added in `scripts/lib/canonical-links.mjs`, called from
prerender after Beasties, rather than on thirty-odd `to` props. That is
the single point where router paths become URLs a host has to serve,
and a rule applied there cannot be regressed by the next `<Link>`.

### The 404 half: a redirect on the wrong host

Six of the eight 404s were `/blog/<slug>` targets, 66 instances across
10 articles and all six languages. All six had a row in
`blog_slug_redirects`, and both guards that should have caught them
treated that row as an exemption:
`scripts/audit_blog_links.py` probed api.cercol.team and filed them
under "resolved via redirect, NOT broken", and
`api/tests/test_internal_links_integrity.py` allowlisted every
`slug_old` parsed out of migration 016.

The row is real and the 308 is real. It is served by the API. An
in-body link is root-relative, so a reader and a crawler resolve it
against cercol.team, a static host with no redirect table, which
answers public/404.html. The redirect existed for a hop nobody makes.
A human with JS still reached the article, because the SPA fetches the
API and the API does honour the redirect. That is the same shape as
the instrument-page bug: working for everyone who clicked, 404 for
everyone who crawled.

Migration 094 fixes the bodies. Both guards lost the exemption.
`blog_slug_redirects` stays, because it is the right mechanism for a
URL already indexed or linked from off-site; it just cannot excuse a
link inside the corpus.

The remaining two 404s are `/auth` and `/full-moon`, which are
deliberately not prerendered and are linked from public pages: the beta
banner links `/auth` from all 168 of them. Both links carry
`rel="nofollow"` now. Prerendering them was rejected for the reason
given in scripts/prerender.mjs.

### The guard had never run

`test_internal_links_integrity.py` skips unless `dist/` is prerendered.
`ci.yml` runs `npm run build`, not `build:full`, so the skip fired on
every run since the test was written and the assertion had never once
executed. It is now a step in `deploy-frontend.yml`, after `build:full`
and before the gh-pages push, which is the only job in the repo where a
prerendered `dist/` exists.

### The 307 half: the same redirect, downgraded by the move (Aug 2026)

Cloudflare static assets canonicalise the slash themselves
(`html_handling: auto-trailing-slash` in `web/wrangler.jsonc`), and
`web/wrangler.jsonc` said that matched what GitHub Pages did. It does
not. GitHub Pages answered **301**; Cloudflare answers **307**.

A 307 is temporary. It tells Google to keep the slashless URL in the
index and to pass nothing to the canonical one, which is the opposite of
what a canonicalisation redirect is for. On 2026-08-17 the frontend moved
and on 2026-08-18 the "Page with redirect" validation failed with 276
example URLs, most of them the slashless form of a prerendered page.

`scripts/generate-redirects.mjs` writes `dist/_redirects` after prerender:
one `\<path\> \<path\>/ 301` line per page, generated by walking the
directories prerender actually wrote rather than from a second list that
could drift. A local probe (`wrangler dev` over a fixture tree) confirmed
the order: `_redirects` is evaluated before `html_handling`, the slashed
form still serves 200 so there is no loop, and routes that are not
prerendered keep the 307, which is right because they have no canonical
page to point at.

Cloudflare's limit is 2,000 static rules; the build emits about 730 and
the script throws if it ever crosses that, at which point the answer is
one zone-level redirect rule instead of a file.

### Asking Google directly (Aug 2026)

The 307 above was live for eleven days and the first anyone heard of it
was a validation-failed email. The BigQuery export cannot catch that
class of fault: it reports how a page performed, not whether Google is
willing to index it, and a page Google has dropped simply stops
appearing in the data.

There is no API for the "Page indexing" report itself. Two others carry
the same signal, and `worker/src/jobs/indexing.js` reads both on the
05:00 run:

- **Sitemaps** (`/webmasters/v3/sites/{site}/sitemaps`): error and
  warning counts, and when Google last downloaded it. One request.
- **URL Inspection** (`/v1/urlInspection/index:inspect`): per URL, the
  verdict, the coverage state, and the canonical Google chose. A
  canonical that is not the URL asked about is exactly what a 307 looks
  like from Google's side. The quota is 2,000 a day; the brief spends
  `INSPECT_LIMIT` on the home page and the pages that had traffic
  yesterday, because an indexing fault only costs something where there
  was traffic to lose.

It runs on the **05:00** trigger and leaves the snapshot in KV
(`seo:indexing`), not inside the 04:00 one that sends the brief. The free
plan allows 50 subrequests per invocation, that trigger already carries
four jobs, and the link sweep is paced at 15 probes for exactly this
reason: nine more could have taken the brief down with it. The brief
reads the snapshot with one KV get, a few hours old, which is the same
verdict Google would give it live.

Asking daily has the same hazard the language job below names: Google
sits on a fix for days or weeks, and the identical verdict would come
back every morning until it moves: `/fr/blog/` was diagnosed and fixed
on 2026-08-22, and the 2026-08-23 brief asked for it again unchanged. So
a problem is reported once and then held for `RENOTIFY_DAYS` (14). It is
said again at once when its coverage state or the canonical Google chose
changes, and a page is only marked healed on a run that actually
inspected it: the inspection budget rotates with traffic, and a page
merely not asked about today has not been fixed. The memory lives in
its own KV key, not in the snapshot: the snapshot expires after three
days so that a job that stops running makes the brief go quiet rather
than repeat an old verdict as this morning's, and a fourteen-day hold
kept in a three-day key stops holding on the fourth day.

At most half of `INSPECT_LIMIT` goes to the language-gap list (below)
before the traffic pages, because a version that took no impressions is
where "is this even indexed" is an open question. That list is ordered
by expected impressions and the order is stable, so the slots are not
its head: fresh gaps (the ones the next brief will carry) go first, and
a URL whose identical verdict is still inside its `RENOTIFY_DAYS` hold
gives its slot to one that has no verdict yet. Before that rule, the
same top gaps were re-inspected every morning to no effect, and on
2026-08-27 and 2026-08-28 the brief reported a gap whose URL the
inspector had never asked about, sending the operator to Search Console
for a verdict the job exists to fetch (`gapInspectionPaths`).

Both use the BigQuery service account, which is why `accessToken` in
`worker/src/bigquery.js` takes a scope and caches one token per scope: a
token minted for BigQuery is refused by searchconsole.googleapis.com.

The account needs to be a user of the property (Search Console,
Settings, Users and permissions, Restricted). Until it is, every call is
a 403, `gatherIndexing` returns `{ pending: true }` and the brief says
nothing: a permission that has not been granted yet is not a daily task.

### An article against itself (Aug 2026)

"This article is weak" is a judgement. "This article is invisible in
German while its Spanish and French versions do their normal numbers"
is a defect with a short list of causes: that version is not indexed,
its title and description do not match what a German searcher types, or
the translation reads badly. `worker/src/jobs/languages.js` looks for
the second kind.

First-party reads cannot answer it. 108 articles in six languages is 648
pages taking about 0.76 reads each per month; every comparison would be
noise. Search Console impressions are roughly twenty times richer and
exist even where nobody clicked, which is the case worth catching.

The comparison is against the blog's own language mix rather than
between versions raw. German pages are some share of all blog
impressions; an article whose German version is far under that share,
while its other versions sit at theirs, has something wrong with the
version rather than with the German market. An article needs
`MIN_ARTICLE_IMPRESSIONS` (50) across all versions in 28 days before its
split is allowed to mean anything, and a gap is only a gap when the
version took **none** of the `MIN_EXPECTED` (5) impressions predicted
for it: a version at half its share is a copy question, one at zero is
usually broken.

It runs at 05:00 with the indexing check and leaves its answer in KV,
because the 04:00 invocation that sends the brief has no subrequests to
spare.

The hazard of a daily job on a 28-day window is repetition: the same gap
every morning until it is fixed. Each one is reported once and then held
for `RENOTIFY_DAYS` (30), and a gap that closes is forgotten so that a
recurrence reads as news. The brief carries the single worst unreported
gap, not the list: a list of nine translations to look at is a list
nobody starts.

## The Cloudflare migration (Aug 2026)

Cèrcol shared seven things with topquaranta on one Hetzner box: Caddy,
the Postgres cluster, the mail server, the MX of its own domain, the SPF
that authorised that server to send as cercol.team, the DKIM keys, and
the OS. On 2026-08-17 all of them were cut, in this order, each step
verified before the next and each reversible on its own:

1. **DNS to Cloudflare.** Zone replicated, all A/AAAA/CNAME records set
   DNS-only so nothing changed behaviour, three TXTs the scanner missed
   added, and every answer compared between the Porkbun and Cloudflare
   nameservers before the delegation moved. Identical.
2. **Mail to Purelymail.** hello@, miquel@ and admin@ as real IMAP
   mailboxes; MX, SPF and DMARC repointed. Verified end to end: a message
   sent before the cutover landed on Stalwart, one sent after landed on
   all three new inboxes with dkim=pass spf=pass, and authenticated SMTP
   from hello@ signs with Purelymail's selector. Stalwart untouched;
   rollback is one MX record.
3. **The strangler Worker on api.cercol.team.** `worker/src/index.js`
   answers what it owns from D1 and forwards the rest to Hetzner through
   `origin.cercol.team` (Caddy holds its certificate). The list of owned
   routes is the migration; removing a line is the rollback.
4. **Blog on D1.** 108 articles, ids transferred and md5-verified, 648
   language bodies length-compared. `scripts/diff-api.mjs`: 111 endpoints,
   0 differences.
5-7. **Every other endpoint**, behind one `WRITES_LIVE` switch, flipped
   the same day: events, results, auth (magic link, Google; passwords
   retired, 410), profiles, witness, groups, Stripe, admin. Verified with a
   real magic-link sign-in through the production Worker; the JWT it
   issued also validated on Hetzner. Secrets travelled server-to-Cloudflare
   through a one-hour, scripts-only token placed on the box over ssh
   stdin and revoked after; the same for the D1 data load. Nothing passed
   through the operator or the assistant.
8. **Seven scheduled jobs on five cron triggers.** BigQuery via a
   service-account client with no SDK. All verified from the Worker
   except PageSpeed, whose API key is IP-restricted to Hetzner in the
   Google Cloud console (403 from Cloudflare, 200 from the box) and cannot
   be changed with the BigQuery service account. That one Hetzner cron
   stays alive until the key's application restriction is removed.
9. **Frontend as Cloudflare static assets** (`web/wrangler.jsonc`),
   dual-published with GitHub Pages by `deploy-frontend.yml`. SPA routes
   answer 200 with the app instead of GitHub Pages' 404 shim.

9b. **cercol.team and www on the Worker** (custom domains, 21:15 UTC).
   The nine GitHub Pages records are saved locally for rollback; the
   gh-pages publish still runs as a warm fallback. A zone redirect rule
   sends www to the apex with a 301, as GitHub Pages did.

10. **Decommission (2026-08-19).** The origin's access log showed 2,631
   requests in 40 hours, every one a scanner or a probe of ours: no real
   traffic. `scripts/decommission-hetzner.sh` took the final Postgres dump
   (copied off the box, md5-verified), stopped and disabled cercol-api and
   cercol-mcp, retired the Caddy block. The Worker's proxy fallback,
   `deploy-backend.yml` and the gh-pages publish went the same day. The
   database and `/home/cercol` are still on the box, harmless, for a
   deliberate `dropdb` later.

### Two limits of the free plan that shaped the code

**50 subrequests per invocation.** The external-links sweep probes 15
URLs per tick and keeps its cursor in KV, advancing on every daily
trigger; a full sweep of 207 URLs takes about five days. Self-chaining
does not work: a Worker fetching its own routed hostname is refused as a
loop, and a hop via workers.dev never arrived from a cron context. The
first sweep, before the pacing, marked 100 live URLs null when the cap
hit mid-loop; the tick now returns its probe errors so that cannot hide.

**10 ms CPU per invocation.** bcrypt does not fit, so password sign-in is
retired rather than downgraded to PBKDF2 at 20-80k iterations. WebCrypto
HMAC and RSA signing are native and do not count in any way that matters.

### Operating it

- `POST /admin/jobs/<name>[?dry_run=1]` runs any scheduled job now. It is
  the Worker's `python -m jobs.<name>`.
- `GET /admin/probe?url=` is one link probe with the raw error, for when
  the sweep reports something odd.
- Rollback of the whole API: `WRITES_LIVE` to `0` (writes and auth return
  to Hetzner) or api.cercol.team's DNS record to grey (everything does).
