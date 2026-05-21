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

## First sweep: 2026-Q2

Phase 17.5 FASE H, 2026-05-21. Light sweep:

- `audits/full-moon-page-state-2026-05-10.md` -> `audits/2026-Q2/`.
- `audits/full-moon-redesign-2026-05-10.md` -> `audits/2026-Q2/`.
- `audits/witness-adjective-audit-2026-05-10.md` -> `audits/2026-Q2/`.
  All three were one-off audits whose findings landed in the
  Phase 13.18 to 13.22 batch.
- `docs/CLAUDE_EXCELLENCE.md` (477 LOC) -> `audits/2026-Q2/`.
  Findings absorbed in the Phase 13.19 batch (32 issues, 31 resolved).
- `docs/AUDIT-2026-05.md` -> `audits/2026-Q2/`. Structural audit
  superseded by FASE A drift cleanup.
- `docs/AUDIT-CLOSE-2026-05-20.md` -> `audits/2026-Q2/`. Single FAIL
  (H1 missing) closed in FASE A.2 of this sprint.
- `docs/EXPLORATION-2026-05-21.md` -> `audits/2026-Q2/`. Exploration
  whose findings drove the design of this sprint and ADRs 0005 to
  0009.

CLAUDE.md and ROADMAP.md kept in place. ROADMAP rows for phases
older than 3 months are below the 3-month threshold but still
referenced actively by ongoing work; revisit on next sweep
(2026-Q3).
