"""
PageSpeed Insights (PSI) ingest job.

# Spec: docs/architecture/seo-pipeline.md

Runs PSI v5 against a set of top URLs (mobile + desktop) and writes
one row per (url, device) into `cercol.cercol_seo.pagespeed_runs`.

URL selection:
- After the GSC bulk export has been populated for at least 14 days,
  pick the top-N URLs by impressions from
  `cercol.searchconsole.searchdata_url_impression`.
- Before that, use a hardcoded seed list of the canonical pages.

Per ADR 0007 we run PSI on every cron tick (synthetic, immediate) and
also depend on the CrUX BigQuery export for longitudinal field data;
the CrUX side is a separate (future) job, not this one.

Idempotency: every run produces a new row keyed by `run_ts`. There is
no DELETE-then-INSERT here because we explicitly keep the history.
"""

from __future__ import annotations

import logging
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Iterable

import httpx

from ._config import JobConfig, MissingSecret, load_config, require_secret, table_id

log = logging.getLogger("cercol.pagespeed_ingest")

PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
DEFAULT_TIMEOUT_S = 90.0
MAX_RETRIES = 3
RETRY_BASE_DELAY_S = 2.0

# Seed list used before the GSC bulk export has enough data to rank by
# impressions. Order is editorial, not algorithmic.
SEED_URLS: tuple[str, ...] = (
    "https://cercol.team/",
    "https://cercol.team/science/",
    "https://cercol.team/instruments/",
    "https://cercol.team/roles/",
    "https://cercol.team/about/",
    "https://cercol.team/faq/",
    "https://cercol.team/blog/",
    "https://cercol.team/blog/what-is-agreeableness-the-cooperative-dimension/",
    "https://cercol.team/blog/how-to-build-a-balanced-team/",
)

DEVICES: tuple[str, ...] = ("mobile", "desktop")


@dataclass(frozen=True)
class PageSpeedRow:
    run_ts: str
    run_date: str
    url: str
    device: str
    lcp_ms: int | None
    fid_ms: int | None
    inp_ms: int | None
    cls: float | None
    fcp_ms: int | None
    ttfb_ms: int | None
    performance_score: int | None
    accessibility_score: int | None
    seo_score: int | None
    best_practices_score: int | None


def select_top_urls(bq_client, cfg: JobConfig, *, top_n: int = 20, days: int = 14) -> list[str]:
    """Return up to `top_n` URLs ranked by GSC impressions over the last `days`.

    Falls back to SEED_URLS if the GSC table is empty or the query
    fails (returns an empty result set rather than raising, so a fresh
    GCP project that has not yet ingested any GSC bulk export still
    runs PageSpeed against something useful).
    """
    gsc_table = table_id(
        cfg, "searchdata_url_impression", dataset=cfg.bigquery_dataset_gsc
    )
    sql = (
        f"SELECT url, SUM(impressions) AS impressions "
        f"FROM `{gsc_table}` "
        f"WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY) "
        f"GROUP BY url "
        f"ORDER BY impressions DESC "
        f"LIMIT {top_n}"
    )
    try:
        rows = list(bq_client.query(sql).result())
    except Exception as exc:
        log.warning("GSC top-URL query failed (%s); falling back to seed list", exc)
        return list(SEED_URLS)

    urls = [r["url"] for r in rows] if rows else []
    if not urls:
        log.info("GSC top-URL query returned 0 rows; falling back to seed list")
        return list(SEED_URLS)
    return urls


def _retryable(status: int) -> bool:
    return status in (429, 500, 502, 503, 504)


def _fetch_psi(
    client: httpx.Client,
    url: str,
    device: str,
    api_key: str,
) -> dict[str, Any]:
    """Call PSI for a single (url, device). Retries on transient errors."""
    params = {
        "url": url,
        "strategy": device,
        "category": ["performance", "accessibility", "seo", "best-practices"],
        "key": api_key,
    }
    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.get(PSI_BASE, params=params, timeout=DEFAULT_TIMEOUT_S)
            if resp.status_code == 200:
                return resp.json()
            if _retryable(resp.status_code) and attempt < MAX_RETRIES:
                delay = RETRY_BASE_DELAY_S ** attempt
                log.warning(
                    "PSI %s (%s) returned %d, retrying in %.1fs",
                    url, device, resp.status_code, delay,
                )
                time.sleep(delay)
                continue
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            last_exc = exc
            if attempt >= MAX_RETRIES:
                raise
            time.sleep(RETRY_BASE_DELAY_S ** attempt)
    raise RuntimeError(f"PSI {url} ({device}) failed after {MAX_RETRIES}: {last_exc}")


def parse_psi(payload: dict[str, Any], url: str, device: str, run_ts: str) -> PageSpeedRow:
    """Pull our row out of a PSI v5 response."""
    lighthouse = payload.get("lighthouseResult", {})
    audits = lighthouse.get("audits", {})
    categories = lighthouse.get("categories", {})
    loading = payload.get("loadingExperience", {}).get("metrics", {})

    def _audit_num(name: str) -> int | None:
        v = audits.get(name, {}).get("numericValue")
        if v is None:
            return None
        try:
            return int(round(float(v)))
        except (TypeError, ValueError):
            return None

    def _cls() -> float | None:
        v = audits.get("cumulative-layout-shift", {}).get("numericValue")
        if v is None:
            return None
        try:
            return float(v)
        except (TypeError, ValueError):
            return None

    def _score(cat: str) -> int | None:
        v = categories.get(cat, {}).get("score")
        if v is None:
            return None
        return int(round(float(v) * 100))

    def _field_p75(metric: str) -> int | None:
        v = loading.get(metric, {}).get("percentile")
        return int(v) if isinstance(v, (int, float)) else None

    run_dt = datetime.fromisoformat(run_ts.replace("Z", "+00:00"))
    return PageSpeedRow(
        run_ts=run_ts,
        run_date=run_dt.date().isoformat(),
        url=url,
        device=device,
        lcp_ms=_audit_num("largest-contentful-paint"),
        fid_ms=_field_p75("FIRST_INPUT_DELAY_MS"),
        inp_ms=_field_p75("INTERACTION_TO_NEXT_PAINT"),
        cls=_cls(),
        fcp_ms=_audit_num("first-contentful-paint"),
        ttfb_ms=_audit_num("server-response-time"),
        performance_score=_score("performance"),
        accessibility_score=_score("accessibility"),
        seo_score=_score("seo"),
        best_practices_score=_score("best-practices"),
    )


def _row_dict(r: PageSpeedRow, now: str) -> dict[str, Any]:
    return {
        "run_ts": r.run_ts,
        "run_date": r.run_date,
        "url": r.url,
        "device": r.device,
        "lcp_ms": r.lcp_ms,
        "fid_ms": r.fid_ms,
        "inp_ms": r.inp_ms,
        "cls": r.cls,
        "fcp_ms": r.fcp_ms,
        "ttfb_ms": r.ttfb_ms,
        "performance_score": r.performance_score,
        "accessibility_score": r.accessibility_score,
        "seo_score": r.seo_score,
        "best_practices_score": r.best_practices_score,
        "ingested_at": now,
    }


def run(
    cfg: JobConfig,
    *,
    http: httpx.Client,
    bq_client,
    urls: Iterable[str] | None = None,
) -> dict[str, int]:
    """Run PSI for every (url, device) pair. Returns row count."""
    key = require_secret("PAGESPEED_API_KEY", cfg.pagespeed_api_key)
    now = datetime.now(timezone.utc).isoformat()

    target_urls = list(urls) if urls is not None else select_top_urls(bq_client, cfg)
    if not target_urls:
        log.warning("No target URLs resolved; nothing to do")
        return {"pagespeed_runs": 0}

    rows: list[dict[str, Any]] = []
    for url in target_urls:
        for device in DEVICES:
            payload = _fetch_psi(http, url, device, key)
            row = parse_psi(payload, url, device, now)
            rows.append(_row_dict(row, now))

    if rows:
        errors = bq_client.insert_rows_json(table_id(cfg, "pagespeed_runs"), rows)
        if errors:
            raise RuntimeError(f"insert_rows_json into pagespeed_runs failed: {errors}")

    return {"pagespeed_runs": len(rows)}


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    cfg = load_config()
    try:
        from google.cloud import bigquery
        bq_client = bigquery.Client()
    except ImportError:
        log.error("google-cloud-bigquery not installed; run pip install -r api/requirements.txt")
        return 1
    try:
        with httpx.Client() as http:
            counts = run(cfg, http=http, bq_client=bq_client)
    except MissingSecret as exc:
        log.error("%s", exc)
        return 1
    log.info("PageSpeed ingest counts: %s", counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
