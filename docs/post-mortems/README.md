# Post-mortems

Records of incidents and demonstrably-wrong decisions. The point is
to capture the absent rule that allowed the problem, not to assign
blame.

## When to write one

A post-mortem is mandatory for any of:

- An incident visible to users in production. Outage, data loss,
  silent corruption, security disclosure.
- A redesign that contradicts a decision taken in the immediately
  preceding sprint. If we shipped X last week and tore it out this
  week, the post-mortem records why.
- A decision that has demonstrably gone wrong. Either an ADR is
  superseded under stress, or an assumption baked into a policy
  proved false.

Not required for: minor bugs caught in QA, expected rollbacks during
a feature ramp, deliberate experiments that did not pan out.

## Where they live

Here, not in `docs/archive/`. The point is to be visible whenever
someone touches the affected area. A post-mortem migrates to
archive only when the underlying subsystem has been replaced
entirely and the lessons are no longer applicable to current code.

## Format

Use `TEMPLATE.md`. The non-negotiable section is the **Prevention**
link at the bottom, which points to the policy or ADR that now
prevents recurrence. If no such policy exists yet, the post-mortem
must create one or be paired with a PR that does. A post-mortem
without a prevention link is a regret, not a control.

## Index

| Date | Title | Severity | Prevention |
|---|---|---|---|
| 2026-04-16 | [Caddy 30-day silent outage](2026-04-16-caddy-30day-silent-outage.md) | high | ADR 0004 + smoke test in deploy-backend.yml |
| 2026-05-17 | [Caddy outage recurrence](2026-05-17-caddy-outage-recurrence.md) | high | ADR 0004 + `api/tests/test_infra.py` |
| 2026-05-20 | [H1 tag missing regression](2026-05-20-h1-tag-missing-regression.md) | medium | `api/tests/test_seo.py` + SEO HTML structure rules in `docs/policies/conventions.md` |
| 2026-05-23 | [Mocks diverged from real APIs](2026-05-23-mock-divergence-bing-caddy.md) | medium | "Real contract smoke" rule in `docs/policies/conventions.md` + regression tests in `api/tests/test_bing_ingest.py` and `api/tests/test_crawl_log_parser.py` |
