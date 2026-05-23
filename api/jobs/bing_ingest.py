"""
Bing Webmaster Tools ingest job.

# Spec: docs/architecture/seo-pipeline.md

Pulls daily search and crawl stats from the Bing Webmaster Tools API
and writes them into `cercol.cercol_seo.bing_*` tables.

Idempotency strategy: for each (date, query) and (date, page) tuple we
DELETE-then-INSERT the day's slice. Bing's API is authoritative for
the whole day's stats, so a re-run on the same day produces the same
state. The DELETE matches the day partition only, so we never touch
older partitions.

Run via cron, see api/deploy/cron/cercol-bing-ingest.
"""

from __future__ import annotations

import logging
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import httpx

from ._config import JobConfig, MissingSecret, load_config, require_secret, table_id

log = logging.getLogger("cercol.bing_ingest")

BING_API_BASE = "https://ssl.bing.com/webmaster/api.svc/json"
DEFAULT_TIMEOUT_S = 30.0
MAX_RETRIES = 3
RETRY_BASE_DELAY_S = 2.0


@dataclass(frozen=True)
class BingQueryRow:
    date: str
    query: str
    impressions: int
    clicks: int
    avg_position: float | None


@dataclass(frozen=True)
class BingPageRow:
    date: str
    page: str
    impressions: int
    clicks: int
    avg_position: float | None


@dataclass(frozen=True)
class BingCrawlRow:
    date: str
    crawled_pages: int
    crawl_errors: int
    blocked: int


def _bing_url(method: str, api_key: str) -> str:
    return f"{BING_API_BASE}/{method}?apikey={api_key}"


def _retryable(status: int) -> bool:
    """True if a status code indicates a transient failure worth retrying."""
    return status in (429, 500, 502, 503, 504)


def _fetch(
    client: httpx.Client,
    method: str,
    api_key: str,
    site_url: str,
) -> dict[str, Any]:
    """Call a Bing WMT method with exponential backoff on transient errors.

    Pure helper so the test can inject a mocked transport.
    """
    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.post(
                _bing_url(method, api_key),
                json={"siteUrl": site_url},
                timeout=DEFAULT_TIMEOUT_S,
            )
            if resp.status_code == 200:
                return resp.json()
            if _retryable(resp.status_code) and attempt < MAX_RETRIES:
                delay = RETRY_BASE_DELAY_S ** attempt
                log.warning(
                    "Bing %s returned %d, retrying in %.1fs (attempt %d/%d)",
                    method, resp.status_code, delay, attempt, MAX_RETRIES,
                )
                time.sleep(delay)
                continue
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            last_exc = exc
            if attempt >= MAX_RETRIES:
                raise
            delay = RETRY_BASE_DELAY_S ** attempt
            log.warning(
                "Bing %s raised %s, retrying in %.1fs", method, exc, delay
            )
            time.sleep(delay)
    # Unreachable in normal flow; satisfy type-checker.
    raise RuntimeError(f"Bing {method} failed after {MAX_RETRIES} attempts: {last_exc}")


def parse_query_stats(payload: dict[str, Any]) -> list[BingQueryRow]:
    """Map Bing GetQueryStats response into our row schema."""
    rows: list[BingQueryRow] = []
    for entry in payload.get("d", []):
        date_raw = entry.get("Date", "")
        # Bing returns "/Date(<epoch_ms>)/" or ISO; handle both.
        rows.append(BingQueryRow(
            date=_normalise_date(date_raw),
            query=entry.get("Query", ""),
            impressions=int(entry.get("Impressions", 0)),
            clicks=int(entry.get("Clicks", 0)),
            avg_position=_maybe_float(entry.get("AvgImpressionPosition")),
        ))
    return rows


def parse_page_stats(payload: dict[str, Any]) -> list[BingPageRow]:
    rows: list[BingPageRow] = []
    for entry in payload.get("d", []):
        rows.append(BingPageRow(
            date=_normalise_date(entry.get("Date", "")),
            page=entry.get("Page", ""),
            impressions=int(entry.get("Impressions", 0)),
            clicks=int(entry.get("Clicks", 0)),
            avg_position=_maybe_float(entry.get("AvgImpressionPosition")),
        ))
    return rows


def parse_crawl_stats(payload: dict[str, Any]) -> list[BingCrawlRow]:
    rows: list[BingCrawlRow] = []
    for entry in payload.get("d", []):
        rows.append(BingCrawlRow(
            date=_normalise_date(entry.get("Date", "")),
            crawled_pages=int(entry.get("CrawledPages", 0)),
            crawl_errors=int(entry.get("CrawlErrors", 0)),
            blocked=int(entry.get("Blocked", 0)),
        ))
    return rows


def _normalise_date(raw: str) -> str:
    """Bing dates come as '/Date(1716163200000)/' (epoch ms) or ISO."""
    if raw.startswith("/Date(") and raw.endswith(")/"):
        ms = int(raw[len("/Date("):-len(")/")].split("+")[0].split("-")[0])
        return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).date().isoformat()
    if "T" in raw:
        return raw.split("T", 1)[0]
    return raw


def _maybe_float(v: Any) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _row_dict_query(r: BingQueryRow, now: str) -> dict[str, Any]:
    return {
        "date": r.date, "query": r.query, "impressions": r.impressions,
        "clicks": r.clicks, "avg_position": r.avg_position, "ingested_at": now,
    }


def _row_dict_page(r: BingPageRow, now: str) -> dict[str, Any]:
    return {
        "date": r.date, "page": r.page, "impressions": r.impressions,
        "clicks": r.clicks, "avg_position": r.avg_position, "ingested_at": now,
    }


def _row_dict_crawl(r: BingCrawlRow, now: str) -> dict[str, Any]:
    return {
        "date": r.date, "crawled_pages": r.crawled_pages,
        "crawl_errors": r.crawl_errors, "blocked": r.blocked, "ingested_at": now,
    }


def _replace_day(bq_client, table_fq: str, dates: set[str], rows: list[dict[str, Any]]) -> None:
    """DELETE the day's partition for each known date, then INSERT new rows.

    The caller passes the set of dates the new rows cover, so the DELETE
    only touches partitions we are about to replace. Older history stays.
    """
    if not dates:
        return
    date_list = ", ".join(f"DATE '{d}'" for d in sorted(dates))
    bq_client.query(
        f"DELETE FROM `{table_fq}` WHERE date IN ({date_list})"
    ).result()
    if rows:
        errors = bq_client.insert_rows_json(table_fq, rows)
        if errors:
            raise RuntimeError(f"insert_rows_json into {table_fq} failed: {errors}")


def run(cfg: JobConfig, *, http: httpx.Client, bq_client) -> dict[str, int]:
    """Run the full Bing ingest. Returns row counts per table.

    Both `http` and `bq_client` are injected so tests can pass mocks.
    """
    key = require_secret("BING_WMT_API_KEY", cfg.bing_wmt_api_key)
    now = datetime.now(timezone.utc).isoformat()

    query_payload = _fetch(http, "GetQueryStats", key, cfg.site_url)
    page_payload = _fetch(http, "GetPageStats", key, cfg.site_url)
    crawl_payload = _fetch(http, "GetCrawlStats", key, cfg.site_url)

    query_rows = parse_query_stats(query_payload)
    page_rows = parse_page_stats(page_payload)
    crawl_rows = parse_crawl_stats(crawl_payload)

    _replace_day(
        bq_client,
        table_id(cfg, "bing_query_stats"),
        {r.date for r in query_rows},
        [_row_dict_query(r, now) for r in query_rows],
    )
    _replace_day(
        bq_client,
        table_id(cfg, "bing_page_stats"),
        {r.date for r in page_rows},
        [_row_dict_page(r, now) for r in page_rows],
    )
    _replace_day(
        bq_client,
        table_id(cfg, "bing_crawl_stats"),
        {r.date for r in crawl_rows},
        [_row_dict_crawl(r, now) for r in crawl_rows],
    )

    return {
        "bing_query_stats": len(query_rows),
        "bing_page_stats": len(page_rows),
        "bing_crawl_stats": len(crawl_rows),
    }


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
    log.info("Bing ingest counts: %s", counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
