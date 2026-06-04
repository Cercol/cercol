"""
Admin SEO observability endpoints.

# Spec: docs/architecture/seo-pipeline.md

Reads from the BigQuery datasets populated by api/jobs/* and exposes
JSON under /admin/seo/*. All endpoints sit behind the admin gate.

Caching: each handler caches its response in-memory for a short TTL
(default 1 hour). The cache is per-process; with two uvicorn workers
the cache is duplicated, which is acceptable at this volume.

Empty-dataset handling: when the BigQuery dataset has not yet been
populated (the GSC bulk export needs about 48 hours to appear, Bing
needs traffic to accumulate query-level data), endpoints return
their normal shape with a `data_pending: true` flag and empty lists,
not 500.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from deps import require_admin

log = logging.getLogger("cercol.seo")

router = APIRouter(prefix="/admin/seo", tags=["admin-seo"])

# Cache TTL (seconds) for read-only BigQuery queries. Override via env
# for tests.
CACHE_TTL_S = int(os.environ.get("SEO_CACHE_TTL_S", "3600"))

# Single shared BigQuery client. Lazily created so unit tests that
# import this module without GCP credentials don't fail at import.
_bq_client: Any = None
_bq_lock = asyncio.Lock()


# ---------------------------------------------------------------------------
# Admin gate shared via api/deps.py (Phase 17.8, imported above). deps.py
# imports nothing from main/blog/seo, so the circular-import workaround that
# required this local duplicate is no longer needed. deps.require_admin keeps
# this variant's stricter missing-sub 401 check, so the gate is not weakened.
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# BigQuery client + cache helpers
# ---------------------------------------------------------------------------

async def _get_bq():
    """Lazy singleton BigQuery client. None if google-cloud-bigquery missing."""
    global _bq_client
    if _bq_client is not None:
        return _bq_client
    async with _bq_lock:
        if _bq_client is None:
            try:
                from google.cloud import bigquery
                _bq_client = bigquery.Client()
            except Exception as exc:
                log.warning("BigQuery client unavailable: %s", exc)
                _bq_client = False  # sentinel for "tried and failed"
    return _bq_client if _bq_client is not False else None


# Process-local cache. Key = (endpoint_name, sorted_kwargs_repr).
_cache: dict[str, tuple[float, Any]] = {}


async def _cached(key: str, ttl: int, producer: Callable[[], Awaitable[Any]]) -> Any:
    now = time.monotonic()
    entry = _cache.get(key)
    if entry and (now - entry[0]) < ttl:
        return entry[1]
    value = await producer()
    _cache[key] = (now, value)
    return value


def _project() -> str:
    return os.environ.get("BIGQUERY_PROJECT", "cercol")


def _ds_gsc() -> str:
    return os.environ.get("BIGQUERY_DATASET_GSC", "searchconsole")


def _ds_seo() -> str:
    return os.environ.get("BIGQUERY_DATASET_SEO", "cercol_seo")


async def _query(sql: str, params: list | None = None) -> list[dict]:
    """Run a BigQuery query and return rows as plain dicts.

    Returns an empty list on any failure (logged), so callers can
    treat "no data" and "service unavailable" the same way for the
    UI. The endpoint sets `data_pending: true` based on row counts.
    """
    bq = await _get_bq()
    if bq is None:
        return []
    try:
        # Run in a thread; the google-cloud-bigquery client is sync.
        rows = await asyncio.to_thread(_run_sync, bq, sql, params)
        return rows
    except Exception as exc:
        log.warning("BigQuery query failed: %s", exc)
        return []


def _run_sync(bq, sql: str, params: list | None) -> list[dict]:
    # Only import google-cloud-bigquery when actually needed (parametrized
    # query). Tests on dev machines without the dep installed can still
    # exercise the no-params path.
    job_config = None
    if params:
        from google.cloud import bigquery
        job_config = bigquery.QueryJobConfig(query_parameters=params)
    rows = list(bq.query(sql, job_config=job_config).result())
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/sources")
async def sources(_: dict = Depends(require_admin)) -> dict:
    """Status of each ingest source: row counts and most-recent timestamp."""
    async def produce() -> dict:
        p, sd, sg = _project(), _ds_seo(), _ds_gsc()
        out: dict[str, Any] = {"sources": []}

        async def one(name: str, table_fq: str, date_col: str) -> dict:
            rows = await _query(
                f"SELECT COUNT(*) AS n, MAX({date_col}) AS last FROM `{table_fq}`"
            )
            n = rows[0].get("n", 0) if rows else 0
            last = rows[0].get("last") if rows else None
            return {
                "name": name,
                "table": table_fq,
                "row_count": int(n) if n is not None else 0,
                "last_update": last.isoformat() if last is not None else None,
            }

        out["sources"] = [
            await one("bing_query_stats", f"{p}.{sd}.bing_query_stats", "date"),
            await one("bing_page_stats", f"{p}.{sd}.bing_page_stats", "date"),
            await one("bing_crawl_stats", f"{p}.{sd}.bing_crawl_stats", "date"),
            await one("pagespeed_runs", f"{p}.{sd}.pagespeed_runs", "run_date"),
            await one("crawl_logs", f"{p}.{sd}.crawl_logs", "ts_date"),
        ]
        # GSC: optional; the bulk export creates its own tables.
        gsc_rows = await _query(
            f"SELECT table_name FROM `{p}.{sg}.INFORMATION_SCHEMA.TABLES` "
            "WHERE table_name LIKE 'searchdata_%'"
        )
        out["gsc"] = {
            "dataset": f"{p}.{sg}",
            "tables_present": [r["table_name"] for r in gsc_rows],
            "bulk_export_ready": bool(gsc_rows),
        }
        return out

    return await _cached("sources", CACHE_TTL_S, produce)


@router.get("/health")
async def health(_: dict = Depends(require_admin)) -> dict:
    """High-level snapshot. Pulls aggregate KPIs across all sources."""
    async def produce() -> dict:
        p, sd, sg = _project(), _ds_seo(), _ds_gsc()
        out: dict[str, Any] = {"data_pending": False}

        # Bing aggregate (last 28 days).
        bing = await _query(
            f"SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks "
            f"FROM `{p}.{sd}.bing_query_stats` "
            f"WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)"
        )
        bi = bing[0] if bing else {}
        out["bing_28d"] = {
            "impressions": int(bi.get("impressions") or 0),
            "clicks": int(bi.get("clicks") or 0),
        }

        # GSC aggregate, if bulk export is populated.
        gsc_tables = await _query(
            f"SELECT table_name FROM `{p}.{sg}.INFORMATION_SCHEMA.TABLES` "
            "WHERE table_name = 'searchdata_url_impression'"
        )
        if gsc_tables:
            gsc = await _query(
                f"SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks "
                f"FROM `{p}.{sg}.searchdata_url_impression` "
                f"WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)"
            )
            gi = gsc[0] if gsc else {}
            out["gsc_28d"] = {
                "impressions": int(gi.get("impressions") or 0),
                "clicks": int(gi.get("clicks") or 0),
                "available": True,
            }
        else:
            out["gsc_28d"] = {"available": False}
            out["data_pending"] = True

        # PageSpeed: latest score per page (mobile).
        psi = await _query(
            f"SELECT url, MAX(run_ts) AS last_run, "
            f"  ANY_VALUE(performance_score HAVING MAX run_ts) AS performance_score, "
            f"  ANY_VALUE(lcp_ms HAVING MAX run_ts) AS lcp_ms "
            f"FROM `{p}.{sd}.pagespeed_runs` "
            f"WHERE device = 'mobile' "
            f"GROUP BY url ORDER BY last_run DESC LIMIT 20"
        )
        out["pagespeed_latest_mobile"] = [
            {"url": r["url"], "score": r.get("performance_score"), "lcp_ms": r.get("lcp_ms")}
            for r in psi
        ]

        # Crawl: hits per bot in last 7 days.
        crawl = await _query(
            f"SELECT bot_name, COUNT(*) AS hits "
            f"FROM `{p}.{sd}.crawl_logs` "
            f"WHERE ts_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) "
            f"GROUP BY bot_name ORDER BY hits DESC"
        )
        out["crawl_7d_by_bot"] = [
            {"bot": r["bot_name"], "hits": int(r["hits"])} for r in crawl
        ]

        return out

    return await _cached("health", CACHE_TTL_S, produce)


@router.get("/queries")
async def queries(
    period_days: int = Query(28, ge=1, le=180),
    min_impressions: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    _: dict = Depends(require_admin),
) -> dict:
    """Top queries by impressions, joined Bing and (if available) GSC."""
    async def produce() -> dict:
        p, sd, sg = _project(), _ds_seo(), _ds_gsc()
        out: dict[str, Any] = {"period_days": period_days, "queries": [], "data_pending": False}

        gsc_present = bool(await _query(
            f"SELECT 1 AS x FROM `{p}.{sg}.INFORMATION_SCHEMA.TABLES` "
            "WHERE table_name = 'searchdata_url_impression' LIMIT 1"
        ))

        if gsc_present:
            rows = await _query(
                f"SELECT query, SUM(impressions) AS impressions, "
                f"SUM(clicks) AS clicks, AVG(sum_position/impressions) AS avg_position "
                f"FROM `{p}.{sg}.searchdata_url_impression` "
                f"WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL {period_days} DAY) "
                f"GROUP BY query HAVING SUM(impressions) >= {min_impressions} "
                f"ORDER BY impressions DESC LIMIT {limit}"
            )
            out["source"] = "gsc"
            out["queries"] = [
                {
                    "query": r["query"], "impressions": int(r["impressions"]),
                    "clicks": int(r["clicks"]),
                    "avg_position": float(r["avg_position"]) if r["avg_position"] is not None else None,
                    "ctr": (int(r["clicks"]) / int(r["impressions"])) if r["impressions"] else 0,
                }
                for r in rows
            ]
            return out

        # Fallback: Bing.
        rows = await _query(
            f"SELECT query, SUM(impressions) AS impressions, "
            f"SUM(clicks) AS clicks, AVG(avg_position) AS avg_position "
            f"FROM `{p}.{sd}.bing_query_stats` "
            f"WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL {period_days} DAY) "
            f"GROUP BY query HAVING SUM(impressions) >= {min_impressions} "
            f"ORDER BY impressions DESC LIMIT {limit}"
        )
        out["source"] = "bing"
        out["data_pending"] = not rows
        out["queries"] = [
            {
                "query": r["query"], "impressions": int(r["impressions"]),
                "clicks": int(r["clicks"]),
                "avg_position": float(r["avg_position"]) if r["avg_position"] is not None else None,
                "ctr": (int(r["clicks"]) / int(r["impressions"])) if r["impressions"] else 0,
            }
            for r in rows
        ]
        return out

    cache_key = f"queries:{period_days}:{min_impressions}:{limit}"
    return await _cached(cache_key, CACHE_TTL_S, produce)


@router.get("/pages")
async def pages(
    period_days: int = Query(28, ge=1, le=180),
    limit: int = Query(100, ge=1, le=500),
    _: dict = Depends(require_admin),
) -> dict:
    """Top pages by impressions across GSC + Bing."""
    async def produce() -> dict:
        p, sd, sg = _project(), _ds_seo(), _ds_gsc()
        out: dict[str, Any] = {"period_days": period_days, "pages": [], "data_pending": False}

        gsc_present = bool(await _query(
            f"SELECT 1 AS x FROM `{p}.{sg}.INFORMATION_SCHEMA.TABLES` "
            "WHERE table_name = 'searchdata_url_impression' LIMIT 1"
        ))

        if gsc_present:
            rows = await _query(
                f"SELECT url AS page, SUM(impressions) AS impressions, "
                f"SUM(clicks) AS clicks "
                f"FROM `{p}.{sg}.searchdata_url_impression` "
                f"WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL {period_days} DAY) "
                f"GROUP BY url ORDER BY impressions DESC LIMIT {limit}"
            )
            out["source"] = "gsc"
        else:
            rows = await _query(
                f"SELECT page, SUM(impressions) AS impressions, SUM(clicks) AS clicks "
                f"FROM `{p}.{sd}.bing_page_stats` "
                f"WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL {period_days} DAY) "
                f"GROUP BY page ORDER BY impressions DESC LIMIT {limit}"
            )
            out["source"] = "bing"

        out["pages"] = [
            {
                "url": r["page"], "impressions": int(r["impressions"]),
                "clicks": int(r["clicks"]),
                "ctr": (int(r["clicks"]) / int(r["impressions"])) if r["impressions"] else 0,
            }
            for r in rows
        ]
        out["data_pending"] = not rows
        return out

    cache_key = f"pages:{period_days}:{limit}"
    return await _cached(cache_key, CACHE_TTL_S, produce)


@router.get("/anomalies")
async def anomalies(
    threshold_pct: float = Query(30.0, ge=5, le=200),
    _: dict = Depends(require_admin),
) -> dict:
    """Pages whose impressions changed by more than `threshold_pct` percent
    in the last 7 days vs the prior 7 days.
    """
    async def produce() -> dict:
        p, sg = _project(), _ds_gsc()
        out: dict[str, Any] = {"threshold_pct": threshold_pct, "anomalies": [], "data_pending": False}

        gsc_present = bool(await _query(
            f"SELECT 1 AS x FROM `{p}.{sg}.INFORMATION_SCHEMA.TABLES` "
            "WHERE table_name = 'searchdata_url_impression' LIMIT 1"
        ))
        if not gsc_present:
            out["data_pending"] = True
            return out

        rows = await _query(
            f"""
            WITH recent AS (
              SELECT url, SUM(impressions) AS impressions
              FROM `{p}.{sg}.searchdata_url_impression`
              WHERE data_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
              GROUP BY url
            ),
            prior AS (
              SELECT url, SUM(impressions) AS impressions
              FROM `{p}.{sg}.searchdata_url_impression`
              WHERE data_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
                                  AND DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY)
              GROUP BY url
            )
            SELECT r.url, r.impressions AS recent, p.impressions AS prior,
                   SAFE_DIVIDE(r.impressions - p.impressions, p.impressions) * 100 AS change_pct
            FROM recent r JOIN prior p USING (url)
            WHERE ABS(SAFE_DIVIDE(r.impressions - p.impressions, p.impressions) * 100) >= {threshold_pct}
            ORDER BY ABS(change_pct) DESC
            LIMIT 50
            """
        )
        out["anomalies"] = [
            {
                "url": r["url"], "recent_impressions": int(r["recent"]),
                "prior_impressions": int(r["prior"]),
                "change_pct": float(r["change_pct"]),
            }
            for r in rows
        ]
        return out

    cache_key = f"anomalies:{threshold_pct}"
    return await _cached(cache_key, CACHE_TTL_S, produce)


@router.get("/page/{slug:path}/lifecycle")
async def page_lifecycle(slug: str, _: dict = Depends(require_admin)) -> dict:
    """History of impressions/clicks/CTR per day for a single URL."""
    async def produce() -> dict:
        p = _project()
        sg = _ds_gsc()
        url = slug if slug.startswith("http") else f"https://cercol.team/{slug.lstrip('/')}"
        out: dict[str, Any] = {"url": url, "days": [], "data_pending": False}

        gsc_present = bool(await _query(
            f"SELECT 1 AS x FROM `{p}.{sg}.INFORMATION_SCHEMA.TABLES` "
            "WHERE table_name = 'searchdata_url_impression' LIMIT 1"
        ))
        if not gsc_present:
            out["data_pending"] = True
            return out

        rows = await _query(
            f"SELECT data_date, SUM(impressions) AS impressions, SUM(clicks) AS clicks "
            f"FROM `{p}.{sg}.searchdata_url_impression` "
            f"WHERE url = '{url}' "
            f"GROUP BY data_date ORDER BY data_date"
        )
        out["days"] = [
            {
                "date": r["data_date"].isoformat(),
                "impressions": int(r["impressions"]),
                "clicks": int(r["clicks"]),
                "ctr": (int(r["clicks"]) / int(r["impressions"])) if r["impressions"] else 0,
            }
            for r in rows
        ]
        return out

    cache_key = f"lifecycle:{slug}"
    return await _cached(cache_key, CACHE_TTL_S, produce)


def clear_cache() -> None:
    """Test hook: drop the process-local cache between tests."""
    _cache.clear()
