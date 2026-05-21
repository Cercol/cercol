# ADR 0008: MCP server location and authentication

- **Number**: 0008
- **Title**: MCP server location and authentication
- **Status**: Proposed
- **Date**: 2026-05-21

## Context

Phase 17.6 includes a custom MCP (Model Context Protocol) server
that exposes Cèrcol's SEO observability data to Claude Code and
Claude Desktop. Two questions need answering before code:

- Where does the MCP server live? Same repo as the API, same
  process, separate process, separate repo?
- How does it authenticate clients? Reuse the existing JWT, an
  API key, mTLS, something else?

## Decision

- **Location**: same repo, separate process. The MCP server lives
  under `api/mcp/` with its own `mcp_main.py` entry point and its
  own `cercol-mcp.service` systemd unit. It can share Python
  modules with the API (scoring, models, query helpers) without
  duplicating code, but it runs in its own process so a crash or a
  slow MCP query does not impact the main API.
- **Hosting**: same Hetzner VPS, exposed as `mcp.cercol.team` with
  its own Caddy snippet at `/etc/caddy/conf.d/cercol-mcp.caddy`
  following ADR 0004.
- **Authentication**: a dedicated API key, not the user JWT. The
  MCP key is a long random string stored in
  `MCP_API_KEY` on the server, validated on every MCP request. The
  reason: the user JWT carries scopes (admin, premium) for the
  product surface; reusing it for MCP would mix authorization
  contexts and risk accidental elevation if an MCP endpoint forgets
  to check a scope.

## Alternatives considered

- **Separate repo for the MCP**. Rejected: doubles the maintenance
  burden (CI, deploy, tests) for a small surface that shares most
  of its data layer with the API.
- **Same process as the FastAPI app**. Rejected: a slow MCP query
  would block the API event loop; clean process boundary is worth
  the small overhead.
- **Reuse the user JWT for MCP auth**. Rejected for the scope
  separation reason above.
- **mTLS**. Rejected as overkill for the threat model. The MCP
  server is on the open internet but only the operator's Claude
  clients should reach it. A long API key is sufficient.

## Consequences

- One new subdomain (`mcp.cercol.team`) requiring a DNS record at
  Porkbun.
- One new Caddy snippet to ship with the MCP code.
- One new systemd unit and one new env var (`MCP_API_KEY`) to
  document in the runbook.
- Tests for MCP live under `api/tests/` and share fixtures with
  the API tests where it makes sense.

## Related

- ADR 0004 (Caddy multi-tenant pattern; the MCP snippet uses the
  same conf.d/ approach).
- ADR 0005 (GCP project; the MCP queries BigQuery).
- `docs/policies/identities.md` Rule 2 (every token documented).
