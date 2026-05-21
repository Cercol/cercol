# Archive

Documents that used to be authoritative but are no longer the source
of truth for current behaviour. Kept for historical context and audit
trail, not for day-to-day reference.

## What lives here

- `decisions/` — ADRs whose status is `Superseded` or `Deprecated`
  for more than 6 months. Active ADRs stay in `docs/decisions/`.
- `sprints/` — Phase / sprint roadmap entries that finished more
  than 3 months ago. Kept as one Markdown file per sprint, grouped
  by quarter (`2026-Q1/`, `2026-Q2/`, etc.).
- `changelog/` — Quarterly compressed changelog. CLAUDE.md and
  ROADMAP.md only keep their last 90 days; older entries fold here.
- `audits/` — One-off audits whose findings have been absorbed
  elsewhere (closed by a sprint, integrated into a policy, etc.).
  Grouped by quarter.

## When to consult

Rarely. Most reasonable questions are answered by the live docs in
`docs/` plus `README.md`, `CLAUDE.md`, `ROADMAP.md`, `PRODUCT.md`,
`SCIENCE.md`, `SEO.md`. Reach here when:

- Investigating a regression that recurs from a closed issue.
- Writing a post-mortem and you need the original context of a
  decision that has since been superseded.
- Auditing what was known and what was assumed at a past date.

## Naming convention

- Sprints: `<original-name>.YYYY-Qx.md`, e.g.
  `seo-perf-sprint.2026-Q2.md`.
- Decisions: keep the original 4-digit number, e.g.
  `0002-railway-to-hetzner-systemd.md` (the ADR stays numbered
  forever; only its location changes).
- Audits: `<original-filename>.md` under the matching quarter
  subdirectory.

## How to archive

Archiving is always done via a regular PR, never by hand on `main`.
Branch name: `chore/docs-decay-YYYY-Qx`. See
`docs/policies/docs-maintenance.md` for the decay rules and
quarterly sweep cadence.
