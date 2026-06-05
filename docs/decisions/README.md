# Architecture Decision Records (ADRs)

An ADR captures an architectural decision big enough that future
maintainers (humans or LLMs) need to know not only what was chosen
but why and what was rejected. Cèrcol uses the lightweight
template by Michael Nygard, lightly extended.

## When to write one

Required for any decision that:

- Locks us into a specific external vendor or service (database,
  payment provider, mail provider, cloud platform).
- Removes an alternative from the table for a long time (more than
  three months of cost to undo).
- Affects how multiple subsystems talk to each other.
- Is reversed later. In that case the new ADR supersedes the old
  one; do not delete the old.

Not required for: small refactors, cosmetic changes, dependency
bumps within the same minor version, choices fully contained inside
a single module.

See `docs/policies/sprint-process.md` for the matrix of
sprint-size to spec/ADR requirements.

## Format

Copy `0000-template.md`, rename with the next number, and fill it
in. Fields:

- **Number** — 4 digits, sequential, never reused.
- **Title** — short noun phrase.
- **Status** — `Proposed` while the sprint is open, `Accepted` on
  merge, `Deprecated` if abandoned, `Superseded by ADR-NNNN` if
  replaced.
- **Date** — ISO date of the decision.
- **Context** — what made the choice necessary. The constraints and
  forces in play.
- **Decision** — what we chose.
- **Alternatives considered** — at least two, with one-line reasons
  for rejection.
- **Consequences** — what this implies day to day, including ugly
  parts.
- **Related** — links to commits, PRs, post-mortems, other ADRs.

Numbering is sequential across the whole project. Never reuse a
number, even if an ADR is later moved to `docs/archive/decisions/`.

## Index

Filled at the end of FASE E.

| # | Title | Status |
|---|---|---|
| 0001 | No Supabase, asyncpg direct | Accepted |
| 0002 | Railway to Hetzner systemd | Accepted |
| 0003 | JWT HS256 self hosted | Accepted |
| 0004 | Caddy multi tenant conf.d | Accepted |
| 0005 | GCP project, BigQuery dataset | Accepted |
| 0006 | Cron pattern for SEO ingest | Accepted |
| 0007 | PageSpeed data source | Accepted |
| 0008 | MCP server location and auth | Accepted |
| 0009 | SEO admin UI rewrite | Accepted |
| 0010 | Enforce published_at invariant for published blog posts | Accepted |
| 0011 | Tracked migration-apply path through the pipeline | Proposed |
