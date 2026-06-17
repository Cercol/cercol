# ADR 0014: First-party visit-source attribution

- **Number**: 0014
- **Title**: First-party visit-source attribution on results
- **Status**: Accepted
- **Date**: 2026-06-17

## Context

The attribution audit found that a completed test cannot be traced to the
channel that brought the visitor. The first-party `events` table records
`article_view`, `cta_click`, `test_start` and `page_view`, but none of them
carries the visit source, and the `results` table has no source column. No
`utm_*` parameters and no `document.referrer` are read anywhere on the client,
so they are dropped before reaching the backend. The weekly digest has a
placeholder for a source/channel split that nothing can fill.

Cèrcol's standing position is "no third-party analytics" (stated on the home
page and in the privacy policy), and `events.anon_id` is an opaque,
cookie-less id that is never tied to an account.

## Decision

Capture the visit source first-party and attach it to the completed test:

- On first load, read `document.referrer` (external referrers only) and
  `utm_source` / `utm_medium` / `utm_campaign` from the landing URL, and
  persist them once in `localStorage` under `cercol_attribution` (the same
  pattern as `cercol_anon`). This is the first touch and is not overwritten by
  later navigations.
- `POST /results` sends `anon_id` plus those first-touch fields. The `results`
  table gains the columns `anon_id`, `utm_source`, `utm_medium`,
  `utm_campaign`, `referrer` (migration 028).
- The weekly digest can then break completed tests down by source.

## Privacy stance

No PII. `anon_id` is the same opaque, cookie-less, client-generated id used by
`events`, and is never linked to an account or to identity. `referrer` and
`utm_*` are first-party signals: stored on our own backend, never shared with
or sold to third parties, and not joined to any personal record. The privacy
policy documents this under "Visit source" in all six locales. Retention
follows the existing anonymous-results retention.

## Alternatives considered

Third-party analytics (Google Analytics, Plausible, Mixpanel, or similar).
Rejected: it would break the no-third-party-analytics commitment, ship visitor
data to an external processor, and typically rely on cross-site identifiers.
A first-party referrer/utm capture stored on our own results, unlinked to
identity, gives the channel signal we need without any of that.

## Consequences

- Completed tests carry their acquisition channel; the digest source split is
  fillable.
- A new first-party data category (referrer + utm) is captured, documented
  here and in the privacy policy.
- Migration 028 must be applied before the matching `api/main.py` INSERT is
  live, through the sanctioned `apply-migrations.yml` path.

## Related

- ADR 0011 (migration apply mechanism) — the sanctioned path used to apply 028.
- `db/migrations/028_results_attribution.sql` — the columns this decision adds.
- The weekly digest source/channel split placeholder this enables
  (`api/jobs/weekly_digest.py`, `api/emails.py`).
- Privacy policy "Visit source" copy (`privacy.collected.attribution`, six locales).
