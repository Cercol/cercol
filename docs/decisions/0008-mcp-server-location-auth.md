# ADR 0008: MCP server location and authentication

- **Number**: 0008
- **Title**: MCP server location and authentication
- **Status**: Accepted
- **Date**: 2026-05-23

## Context

Phase 17.6.5 introduced a custom MCP (Model Context Protocol) server
that exposes the Cèrcol SEO observability data to Claude Code and
Claude Desktop. Two questions:

- Where does the MCP server live? Same repo as the API, same
  process, separate process, separate repo?
- How does it authenticate clients? Reuse the user JWT, an API
  key, mTLS, something else?

## Decision

- **Location**: same repo, separate process. The MCP server lives
  under `api/mcp/` with `server.py` as the entry point. It runs as
  its own systemd unit `cercol-mcp.service` defined in
  `api/deploy/systemd/cercol-mcp.service`. Shared Python helpers
  with the main API (BigQuery client construction, SQL validation)
  live in the same package but the running processes are
  independent.
- **Hosting**: same Hetzner VPS, bound to `127.0.0.1:8091`. Reached
  from the operator's Claude Code or Claude Desktop client via SSH
  tunnel:

  ```
  ssh -N -L 8091:127.0.0.1:8091 root@188.245.60.20
  ```

  Then the MCP client connects to `http://127.0.0.1:8091`. No
  public subdomain in this phase; Caddy and DNS are not touched.
  A future phase can publish `mcp.cercol.team` if remote operator
  access becomes useful, with a Caddy snippet under
  `/etc/caddy/conf.d/cercol-mcp.caddy` (multi-tenant pattern from
  ADR 0004).
- **Authentication**: dedicated `MCP_API_KEY` env var, validated
  on every request via `Authorization: Bearer <key>` header. NOT
  the user JWT used by `cercol-api`. Reusing the user JWT would
  mix authorization contexts (the JWT carries scopes like
  `is_admin` and `premium` that mean nothing to the MCP surface)
  and risk accidental privilege creep if an MCP tool forgot a
  scope check.
- **SQL safety**: the `seo_query` tool runs arbitrary SELECT but
  only against the `cercol.cercol_seo` and `cercol.searchconsole`
  datasets, and forbids DML/DDL tokens with a word-boundary regex.
  See `api/mcp/server.py:_validate_sql` and its 20 unit tests in
  `api/tests/test_mcp_server.py`.

## Alternatives considered

- **Separate repo for the MCP**. Rejected: doubles the maintenance
  burden (CI, deploy, tests) for a small surface that shares most
  of its data layer with the API.
- **Same process as the FastAPI app**. Rejected: a slow MCP query
  would block the API event loop; clean process boundary is worth
  the small overhead.
- **Public subdomain mcp.cercol.team now**. Rejected for this
  phase: would require touching Caddy on the shared VPS and adding
  a new TLS cert; both possible but neither necessary while the
  operator is the only user. SSH tunnel is sufficient and avoids
  the shared-infra risk surface.
- **Reuse the user JWT**. Rejected for the scope-separation reason
  above.
- **mTLS**. Rejected as overkill for the threat model. SSH tunnel
  plus API key gives two layers; mTLS would add a third with no
  reduction in residual risk.

## Consequences

- One new systemd unit (`cercol-mcp.service`) to install on the
  Hetzner VPS, owned by the `cercol` user, port `127.0.0.1:8091`.
- One new env var `MCP_API_KEY` documented in
  `docs/policies/identities.md` and `docs/ops/runbook.md`.
- Operator workflow change: open an SSH tunnel before using the
  MCP client. Documented in the runbook.
- When the operator's needs change (multiple humans, remote
  access from non-fixed IPs, integration with non-SSH-aware
  clients), revisit the "public subdomain" decision; this ADR
  stays Accepted because the localhost+SSH choice is documented.

## Related

- Phase 17.6.5 code: `api/mcp/server.py`, `api/tests/test_mcp_server.py`.
- ADR 0004 (Caddy multi-tenant pattern; future public subdomain).
- ADR 0005 (BigQuery dataset queried by the MCP).
- `docs/policies/identities.md` (MCP_API_KEY ownership).
- `docs/ops/runbook.md` (SSH-tunnel + Claude Code client setup).
