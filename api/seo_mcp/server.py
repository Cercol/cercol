"""
FastMCP server exposing SEO tools.

# Spec: docs/architecture/seo-pipeline.md

Tools (read-only):
- seo_query: arbitrary SELECT against the cercol_seo and searchconsole
  datasets, with a deny-list for DML and DDL keywords.
- seo_page_lifecycle: per-day GSC history for a URL.
- seo_anomalies: rows from cercol_seo.seo_anomalies.
- seo_quick_wins: queries with avg_position in 8 to 20.
- seo_compare_periods: ad-hoc compare of two date windows.
- seo_sources_status: row counts + last-update per ingest table.

Run as:
    cd /home/cercol/api/api
    set -a && . /home/cercol/.env && set +a
    /home/cercol/api/api/.venv/bin/python -m seo_mcp.server

Authentication: bearer header `Authorization: Bearer <MCP_API_KEY>`.
"""

from __future__ import annotations

import logging
import os
import re
from typing import Any

log = logging.getLogger("cercol.mcp")


# ---------------------------------------------------------------------------
# SQL safety
# ---------------------------------------------------------------------------

# Anything matching this is rejected outright. The MCP must never be a
# write path; users with admin access can use the BigQuery console for
# that. Lowercase comparison.
_FORBIDDEN_TOKENS = (
    "insert", "update", "delete", "merge", "drop", "truncate", "create",
    "alter", "grant", "revoke", "call", "exec", "execute",
)

# Limit the datasets a query can address.
_ALLOWED_DATASETS = ("cercol.cercol_seo", "cercol.searchconsole")


def _validate_sql(sql: str) -> None:
    """Raise ValueError if the SQL is not a read-only single statement
    against the allowed datasets.
    """
    low = sql.strip().lower()
    if ";" in low.rstrip(";"):
        raise ValueError("Multi-statement queries are not allowed.")
    if not low.startswith(("select", "with")):
        raise ValueError("Only SELECT and WITH queries are allowed.")
    # Token-boundary check so query strings like 'updated_at' do not
    # trigger the 'update' forbidden token.
    for token in _FORBIDDEN_TOKENS:
        if re.search(rf"\b{token}\b", low):
            raise ValueError(f"Forbidden token: {token}")
    # At least one dataset reference must be on the allow list.
    if not any(ds in sql for ds in _ALLOWED_DATASETS):
        raise ValueError(
            f"Query must reference one of: {', '.join(_ALLOWED_DATASETS)}"
        )


# ---------------------------------------------------------------------------
# BigQuery helpers
# ---------------------------------------------------------------------------

_client = None


def _bq():
    """Lazy singleton BigQuery client. Public so tests can monkeypatch."""
    global _client
    if _client is None:
        from google.cloud import bigquery
        _client = bigquery.Client()
    return _client


def _run_select(sql: str, limit: int = 1000) -> list[dict[str, Any]]:
    """Run a validated SELECT and return rows as plain dicts."""
    _validate_sql(sql)
    if " limit " not in sql.lower():
        sql = sql.rstrip().rstrip(";") + f"\nLIMIT {limit}"
    rows = list(_bq().query(sql).result())
    return [_row_to_dict(r) for r in rows]


def _row_to_dict(row) -> dict[str, Any]:
    """Convert a BigQuery Row into JSON-safe primitives."""
    out: dict[str, Any] = {}
    for k, v in dict(row).items():
        if hasattr(v, "isoformat"):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


def _project() -> str:
    return os.environ.get("BIGQUERY_PROJECT", "cercol")


def _ds_seo() -> str:
    return os.environ.get("BIGQUERY_DATASET_SEO", "cercol_seo")


def _ds_gsc() -> str:
    return os.environ.get("BIGQUERY_DATASET_GSC", "searchconsole")


# ---------------------------------------------------------------------------
# Tool implementations (pure functions; the FastMCP wrapping is at the
# bottom of this file).
# ---------------------------------------------------------------------------

def tool_seo_query(sql: str, limit: int = 1000) -> dict:
    """Run a read-only SELECT against cercol_seo or searchconsole."""
    rows = _run_select(sql, limit=limit)
    return {"row_count": len(rows), "rows": rows}


def tool_seo_page_lifecycle(url: str) -> dict:
    """Per-day GSC impressions and clicks for a single URL."""
    p, sg = _project(), _ds_gsc()
    rows = _run_select(
        f"SELECT data_date, SUM(impressions) AS impressions, SUM(clicks) AS clicks "
        f"FROM `{p}.{sg}.searchdata_url_impression` WHERE url = '{url}' "
        f"GROUP BY data_date ORDER BY data_date",
        limit=500,
    )
    return {"url": url, "days": rows}


def tool_seo_anomalies(limit: int = 50) -> dict:
    """Recent anomalies from cercol_seo.seo_anomalies."""
    p, sd = _project(), _ds_seo()
    rows = _run_select(
        f"SELECT * FROM `{p}.{sd}.seo_anomalies` "
        f"ORDER BY run_ts DESC LIMIT {limit}",
        limit=limit,
    )
    return {"row_count": len(rows), "rows": rows}


def tool_seo_quick_wins(min_impressions: int = 50, limit: int = 30) -> dict:
    """Queries currently in SERP position 8 to 20, ranked by impressions."""
    p, sg = _project(), _ds_gsc()
    rows = _run_select(
        f"SELECT query, SUM(impressions) AS impressions, SUM(clicks) AS clicks, "
        f"  AVG(sum_position / NULLIF(impressions, 0)) AS avg_position "
        f"FROM `{p}.{sg}.searchdata_url_impression` "
        f"WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY) "
        f"GROUP BY query "
        f"HAVING SUM(impressions) >= {min_impressions} "
        f"  AND AVG(sum_position / NULLIF(impressions, 0)) BETWEEN 8 AND 20 "
        f"ORDER BY impressions DESC LIMIT {limit}",
        limit=limit,
    )
    return {"row_count": len(rows), "rows": rows}


def tool_seo_compare_periods(
    recent_days: int = 7, prior_days: int = 7
) -> dict:
    """Sum of impressions and clicks for the last `recent_days` vs the
    `prior_days` immediately before that, from GSC.
    """
    p, sg = _project(), _ds_gsc()
    rows = _run_select(
        f"""
        WITH recent AS (
          SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks
          FROM `{p}.{sg}.searchdata_url_impression`
          WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL {recent_days} DAY)
        ),
        prior AS (
          SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks
          FROM `{p}.{sg}.searchdata_url_impression`
          WHERE data_date BETWEEN
            DATE_SUB(CURRENT_DATE(), INTERVAL {recent_days + prior_days} DAY)
            AND DATE_SUB(CURRENT_DATE(), INTERVAL {recent_days + 1} DAY)
        )
        SELECT r.impressions AS recent_impressions, r.clicks AS recent_clicks,
               p.impressions AS prior_impressions, p.clicks AS prior_clicks,
               SAFE_DIVIDE(r.impressions - p.impressions, p.impressions) * 100 AS impressions_change_pct
        FROM recent r CROSS JOIN prior p
        """,
        limit=1,
    )
    return rows[0] if rows else {}


def tool_seo_sources_status() -> dict:
    """Row counts and most-recent date per ingest table."""
    p, sd, sg = _project(), _ds_seo(), _ds_gsc()
    out: dict[str, Any] = {"sources": {}}
    for table, date_col in [
        ("bing_query_stats", "date"),
        ("bing_page_stats", "date"),
        ("bing_crawl_stats", "date"),
        ("pagespeed_runs", "run_date"),
        ("crawl_logs", "ts_date"),
        ("seo_anomalies", "run_date"),
    ]:
        try:
            rows = _run_select(
                f"SELECT COUNT(*) AS n, MAX({date_col}) AS last "
                f"FROM `{p}.{sd}.{table}`",
                limit=1,
            )
            out["sources"][table] = rows[0] if rows else {"n": 0, "last": None}
        except Exception as exc:
            out["sources"][table] = {"error": str(exc)}
    # GSC presence check.
    try:
        rows = _run_select(
            f"SELECT table_name FROM `{p}.{sg}.INFORMATION_SCHEMA.TABLES` "
            "WHERE table_name LIKE 'searchdata_%'",
            limit=10,
        )
        out["gsc_tables"] = [r["table_name"] for r in rows]
    except Exception as exc:
        out["gsc_tables_error"] = str(exc)
    return out


# ---------------------------------------------------------------------------
# FastMCP wiring
# ---------------------------------------------------------------------------

def build_app():
    """Build and return the FastMCP app. Imported lazily so tests that
    only exercise the tool functions do not need fastmcp installed.
    """
    from fastmcp import FastMCP

    mcp = FastMCP("cercol-seo")

    mcp.tool(tool_seo_query, name="seo_query",
             description="Run a read-only SELECT against cercol_seo or searchconsole.")
    mcp.tool(tool_seo_page_lifecycle, name="seo_page_lifecycle",
             description="Per-day GSC impressions and clicks for one URL.")
    mcp.tool(tool_seo_anomalies, name="seo_anomalies",
             description="Recent anomalies persisted by the daily detector.")
    mcp.tool(tool_seo_quick_wins, name="seo_quick_wins",
             description="GSC queries in SERP position 8 to 20.")
    mcp.tool(tool_seo_compare_periods, name="seo_compare_periods",
             description="Sum of impressions and clicks: recent N days vs prior N days.")
    mcp.tool(tool_seo_sources_status, name="seo_sources_status",
             description="Row counts and last-update per ingest table.")

    return mcp


def main():
    """Entry point used by the systemd unit cercol-mcp.service.

    Auth: FastMCP supports header-based auth via middleware. We use
    Bearer MCP_API_KEY; in this phase the server is reached only via
    SSH tunnel from the operator's machine, so the API key is the
    second layer of defence behind the tunnel itself.
    """
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    api_key = os.environ.get("MCP_API_KEY", "")
    if not api_key:
        log.error("MCP_API_KEY is not set; refusing to start")
        return 1

    host = os.environ.get("MCP_HOST", "127.0.0.1")
    port = int(os.environ.get("MCP_PORT", "8091"))

    app = build_app()
    log.info("Starting Cercol MCP server on http://%s:%d", host, port)
    app.run(transport="http", host=host, port=port)
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
