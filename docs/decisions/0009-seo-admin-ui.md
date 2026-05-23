# ADR 0009: SEO admin UI rewrite

- **Number**: 0009
- **Title**: SEO admin UI rewrite (replace hardcoded tab with live dashboards)
- **Status**: Accepted
- **Date**: 2026-05-23

## Context

`src/pages/AdminDashboardPage.jsx` already has a tab called "SEO"
(roughly lines 627 to 793 in the current file). The tab is
hardcoded: it shows static checklist items and external links to
GSC, Bing Webmaster, PageSpeed. There is no live data.

Phase 17.6 introduces live ingest of GSC / Bing / PageSpeed /
Caddy-log data into BigQuery. The admin UI is the natural place to
visualise it. Two paths:

- Rewrite the existing tab in place.
- Add a new tab next to it.

## Decision

Rewrite the existing tab in place. The new content is dashboards
fed by `/admin/seo/*` endpoints on the API, which in turn query
BigQuery via the service account from ADR 0005.

Keep the external links (GSC, Bing, PageSpeed) as a small auxiliary
section at the bottom of the tab, not as the main content. The
content above the fold is data.

The dashboards reuse the existing Recharts components and the
`useInfiniteList` and `Sparkline` patterns already present in
AdminDashboardPage.

## Alternatives considered

- **Add a new "SEO Metrics" tab beside the current "SEO Tools" tab**.
  Rejected: fragments the UX; an operator looking for SEO state
  would have to know which of two tabs to open. Also doubles the
  navigation real estate.
- **Build the dashboards on a separate /seo-admin/ route outside
  the admin dashboard**. Rejected: the admin dashboard is the
  canonical home for operator surfaces; adding a parallel route
  would split that.
- **Defer the rewrite to a later sprint; ship dashboards inside a
  brand new tab first**. Rejected: the rewrite is small (the
  existing tab is mostly static markup) and shipping the new
  dashboards alongside the stale checklist would create user
  confusion.

## Consequences

- The 166 lines of the current SEO tab get rewritten. AdminDashboardPage
  is already 1184 lines; the rewrite is mostly a net wash because
  most of those 166 lines are static JSX with the new content
  replacing them.
- New `/admin/seo/*` endpoints in `api/main.py` need their own
  `require_admin` gate.
- The dashboards depend on the BigQuery dataset existing. Phase
  17.6 sequencing: ingest scripts ship first, then dashboards.

## Related

- ADR 0005 (BigQuery dataset).
- ADR 0006 (cron-driven ingest).
- ADR 0007 (PSI plus CrUX).
- `src/pages/AdminDashboardPage.jsx` for the existing tab.
