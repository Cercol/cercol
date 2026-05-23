"""
Cercol MCP server.

# Spec: docs/architecture/seo-pipeline.md

Exposes SEO observability data over the Model Context Protocol. Runs
as a separate systemd unit (cercol-mcp.service) on the Hetzner VPS,
bound to a localhost port. Operator reaches it via SSH tunnel from
their Claude Code or Claude Desktop client; the public subdomain
mcp.cercol.team is deliberately NOT exposed in this phase.

Auth: a dedicated MCP_API_KEY env var, not the user JWT (see
docs/decisions/0008-mcp-server-location-auth.md).
"""
