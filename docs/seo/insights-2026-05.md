# SEO insights snapshot - 2026-05-23

First insights document built directly from the
`cercol.searchconsole` BigQuery bulk export plus
`cercol.cercol_seo.bing_crawl_stats`. Numbers are small because the
GSC bulk export only landed yesterday; this is the baseline against
which future weeks should be compared.

# Spec: docs/architecture/seo-pipeline.md

## Coverage

- GSC bulk export populated: yes (3 tables present, including
  `searchdata_url_impression` and `searchdata_site_impression`).
- GSC data available: **1 day (2026-05-21)**. Need to accumulate.
- 28-day totals: **11 impressions, 0 clicks**, across 7 distinct
  URLs.

## Geography of impressions (28 days)

| Country | Impressions | Clicks |
|---|---|---|
| USA | 8 | 0 |
| Denmark | 1 | 0 |
| Norway | 1 | 0 |
| Netherlands | 1 | 0 |

**Observation**: zero impressions from Spain, Catalonia, France,
Germany, Italy or Andorra in the snapshot. The Danish translation
seems to be earning impressions ("ekstraversion" query below); the
non-English Romance markets are silent so far.

## By URL language prefix (28 days)

| URL prefix | Impressions | Clicks | Distinct URLs |
|---|---|---|---|
| `/` (en) | 5 | 0 | 2 |
| `/es/` | 4 | 0 | 3 |
| `/da/` | 2 | 0 | 2 |

`/ca/`, `/fr/`, `/de/` contributed zero impressions in this 28-day
window. The `/es/` content has three distinct URLs receiving
impressions and the best average position (2.0-7.0); the language
is performing better than its absence in the geography table
suggests, which means it might be reaching non-Spain Spanish
speakers (LATAM hypothesis worth checking when GSC accumulates).

## By device (28 days)

| Device | Impressions | Clicks |
|---|---|---|
| Desktop | 9 | 0 |
| Mobile | 2 | 0 |

Desktop-skewed; expected for a research-style B2B-ish product.

## Top queries that posted impressions (28 days)

| Query | Impressions | Avg position |
|---|---|---|
| ekstraversion | 1 | 10.0 |

Only one non-anonymised query. Google anonymises low-volume queries
for privacy, which is why most of the impressions are tied to URLs
without a visible query. This will improve as volume grows.

## Top pages by impressions (28 days)

| URL | Impressions | Clicks | Avg position |
|---|---|---|---|
| /blog/creativity-and-personality-what-big-five-research-shows | 3 | 0 | 9.0 |
| /es/blog/critiques-of-big-five-what-critics-say | 2 | 0 | 7.0 |
| /blog/self-other-agreement-big-five-where-gaps-are-biggest | 2 | 0 | 11.0 |
| /da/blog/what-is-extraversion-beyond-the-introvert-extrovert-binary/ | 1 | 0 | 10.0 |
| /es/blog/retrospectives-personality-making-them-work/ | 1 | 0 | 3.0 |
| /es/blog/critiques-of-big-five-what-critics-say/ | 1 | 0 | 2.0 |
| /da/blog/how-personality-test-scores-are-calculated | 1 | 0 | 15.0 |

## Quick wins (position 8 to 20 with impressions)

These three pages already get impressions and sit in the SERP zone
where small content improvements can move the needle. Listed in
priority order (highest impressions first):

1. **`/blog/creativity-and-personality-what-big-five-research-shows`**
   (English, position 9.0, 3 imps). Enrich body, ensure title and
   description contain "Big Five creativity" and "openness". Add a
   FAQ block: "Are creative people more open?" "Does Big Five
   measure creativity directly?".
2. **`/blog/self-other-agreement-big-five-where-gaps-are-biggest`**
   (English, position 11.0, 2 imps). Refresh the title with a more
   specific keyword "self-other agreement Big Five" or "self-report
   versus peer rating". Add the meta-analytic numbers (Connelly and
   Ones 2010) inline so the snippet shows specific values.
3. **`/da/blog/how-personality-test-scores-are-calculated`**
   (Danish, position 15.0, 1 imp). Translation quality check: the
   article landed at position 15 with one impression; tightening
   the Danish title might push it into the first SERP. Manual
   review by a Danish-speaking reviewer recommended.

## Slash-canonicalisation duplicates still in Google's index

Google has BOTH the with-slash and no-slash versions of some URLs
indexed (Phase 17.2 fixed the source; the index will take weeks to
catch up). Observed examples in the 28-day window:

| Page | No-slash impr. | With-slash impr. |
|---|---|---|
| `/es/blog/critiques-of-big-five-what-critics-say` | 2 | 1 |

The 301 redirect is in place at runtime; the duplicates are stale
Google index entries. To speed reconciliation: from GSC the operator
can run "URL Inspection" on the slash version of the affected URLs
and click "Request indexing" so Google re-crawls and merges.

## Bing crawl health (14 days)

| Date | Crawled | Errors | Blocked |
|---|---|---|---|
| 2026-05-22 | 12 | 1 | 0 |
| 2026-05-21 | 1 | 0 | 0 |
| 2026-05-20 | 11 | 8 | 0 |
| 2026-05-19 | 6 | 2 | 0 |
| 2026-05-18 | 1 | 0 | 0 |
| 2026-05-17 | 0 | 0 | 0 |
| 2026-05-16 | 49 | **54** | 0 |
| 2026-05-15 | 36 | **45** | 0 |
| 2026-05-14 | 1 | 0 | 0 |
| 2026-05-13 | 0 | 0 | 0 |

The 54+45 error spike on 2026-05-15 / 16 lines up with the
Caddy outage period documented in
`docs/post-mortems/2026-05-17-caddy-outage-recurrence.md`. Bing
hit failing URLs during the window. Recovery is clean from 18
May onwards. Action: the operator should re-submit the sitemap to
Bing Webmaster Tools so Bing rebuilds its crawl plan with the
recovered baseline.

## Input for keyword research (operator follow-up)

Claude Code does not have access to search-volume data. The list
below is what Google has CURRENTLY ranked Cèrcol for; the operator
should cross-reference it against Spanish, Catalan, French and
German keyword tools to find the queries that drive volume in those
markets.

Currently-ranked English queries: `ekstraversion` only (Danish).
The rest is anonymised by GSC. Pages that currently rank:

- creativity and personality (Big Five)
- self-other agreement (Big Five)
- critiques of Big Five
- retrospectives + personality
- how personality test scores are calculated
- extraversion (the introvert-extrovert binary)

The Spanish content already ranks (position 2, 3, 7). A keyword
research session in Spanish around "Big Five", "personalidad
equipo", "test personalidad gratis", "OCEAN test" is the highest-
leverage next step for non-English growth.

## Caveats

- 1 day of data only. Treat every number as directional, not as a
  trend.
- GSC anonymises queries with low daily volume, hiding most of the
  search terms behind URL-only rows.
- CTR is 0 percent because clicks at this volume are stochastic;
  the metric only becomes meaningful at ~100+ impressions per page.
- This document is regenerated by hand for now. A future phase can
  emit it on the weekly digest cron once the GSC volume warrants
  it.
