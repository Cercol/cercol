"""
Weekly external-link health check for blog articles.

# Spec: docs/architecture/seo-pipeline.md

Pulls every published article from the public API, extracts the external
links from each language body (reusing api/blog_links so the parsing
rules match the audit and the CI guard), probes each unique URL with a
short-timeout HEAD (GET fallback), and appends a snapshot to
cercol.cercol_seo.external_links_status.

"broken" is reserved for hard failures (404 and DNS/connection errors).
403/429/5xx/timeouts are recorded with broken=False because they are
usually bot-detection or transient, not a dead link; calling them broken
would spam the digest.

If this run surfaces URLs that are broken now and were not broken in the
previous snapshot, a digest email is sent via api/emails.py (Resend). The
recipient is LINKS_ALERT_EMAIL; if unset, the digest is logged and
skipped (the job never fails just because no recipient is configured).

Internal links are intentionally out of scope: they are guarded at build
time (api/tests/test_internal_links_integrity.py) and resolved at request
time (blog_slug_redirects).
"""

from __future__ import annotations

import logging
import os
import sys
from datetime import datetime, timezone
from typing import Any

import httpx

from ._config import JobConfig, load_config, table_id

# api/ is on sys.path when run as `python -m jobs.external_links_check`
# from /home/cercol/api/api, so the shared parser imports directly.
from blog_links import extract_link_targets, is_internal, langs_with_content

log = logging.getLogger("cercol.external_links_check")

API_BASE = os.getenv("CERCOL_API_BASE", "https://api.cercol.team")
ALERT_EMAIL = os.getenv("LINKS_ALERT_EMAIL")


def classify_broken(status_code: int | None) -> bool:
    """True only for hard failures: 404 or a connection error (None code).

    403/429/5xx and timeouts are flaky, not broken, so they return False.
    """
    if status_code is None:
        return True
    if status_code == 404:
        return True
    return False


def probe(client: httpx.Client, url: str) -> int | None:
    """Return an HTTP status code, or None on connection failure.

    Tries HEAD first, falls back to GET when HEAD is rejected. Two
    retries on transient transport errors before giving up.
    """
    last: int | None = None
    for attempt in range(3):
        try:
            r = client.head(url, timeout=10, follow_redirects=True)
            last = r.status_code
            if r.status_code in (405, 501):
                r = client.get(url, timeout=10, follow_redirects=True)
                last = r.status_code
            return last
        except (httpx.ConnectError, httpx.ConnectTimeout):
            if attempt == 2:
                return None
        except httpx.HTTPError:
            if attempt == 2:
                return last
    return last


def collect_external_links(http_client: httpx.Client) -> list[tuple[str, str, str]]:
    """Return [(article_slug, lang, url)] for every external link in every body."""
    listing = http_client.get(f"{API_BASE}/blog", timeout=15)
    listing.raise_for_status()
    out: list[tuple[str, str, str]] = []
    for item in listing.json():
        slug = item["slug"]
        detail = http_client.get(f"{API_BASE}/blog/{slug}", timeout=15)
        if detail.status_code != 200:
            continue
        content = detail.json().get("content") or {}
        for lang in langs_with_content(content):
            for url in extract_link_targets(content[lang]):
                if not is_internal(url):
                    out.append((slug, lang, url))
    return out


def get_previous_broken(bq_client, cfg: JobConfig) -> set[str]:
    """URLs marked broken in the most recent prior snapshot (empty on any error)."""
    table = table_id(cfg, "external_links_status")
    sql = (
        f"SELECT DISTINCT url FROM `{table}` "
        f"WHERE broken = TRUE AND ts_date = ("
        f"  SELECT MAX(ts_date) FROM `{table}` WHERE ts_date < CURRENT_DATE()"
        f")"
    )
    try:
        return {row["url"] for row in bq_client.query(sql).result()}
    except Exception as exc:  # noqa: BLE001 - table may not exist yet
        log.warning("previous-broken query failed (%s); treating as none", exc)
        return set()


def _send_digest(new_broken: list[dict[str, Any]]) -> None:
    """Email the operator about newly broken external links."""
    if not ALERT_EMAIL:
        log.warning("LINKS_ALERT_EMAIL unset; %d new broken links not emailed", len(new_broken))
        return
    rows = "".join(
        f"<li><code>{b['url']}</code> ({b['status_code']}) "
        f"in {b['article_slug']} [{b['lang']}]</li>"
        for b in new_broken
    )
    html = (
        f"<p>{len(new_broken)} newly broken external link(s) found in blog articles:</p>"
        f"<ul>{rows}</ul>"
    )
    try:
        from emails import _send_sync  # lazy: avoids import cost when nothing to send
        _send_sync(ALERT_EMAIL, "Cercol: new broken external links", html)
        log.info("digest emailed to %s", ALERT_EMAIL)
    except Exception as exc:  # noqa: BLE001 - email is best-effort
        log.error("digest email failed: %s", exc)


def run(cfg: JobConfig, *, http_client: httpx.Client, bq_client, send_digest: bool = True) -> dict[str, int]:
    """Probe all external links, append a snapshot, email newly broken ones."""
    links = collect_external_links(http_client)
    # Probe each unique URL once.
    statuses: dict[str, int | None] = {}
    for _, _, url in links:
        if url not in statuses:
            statuses[url] = probe(http_client, url)

    now = datetime.now(timezone.utc)
    ts = now.isoformat()
    ts_date = now.date().isoformat()
    rows: list[dict[str, Any]] = []
    for slug, lang, url in links:
        code = statuses[url]
        rows.append({
            "ts": ts,
            "ts_date": ts_date,
            "article_slug": slug,
            "lang": lang,
            "url": url,
            "status_code": code,
            "broken": classify_broken(code),
        })

    if rows:
        errors = bq_client.insert_rows_json(table_id(cfg, "external_links_status"), rows)
        if errors:
            raise RuntimeError(f"insert_rows_json into external_links_status failed: {errors}")

    broken_now = {r["url"]: r for r in rows if r["broken"]}
    if send_digest and broken_now:
        previous = get_previous_broken(bq_client, cfg)
        new_broken = [r for url, r in broken_now.items() if url not in previous]
        if new_broken:
            _send_digest(new_broken)

    return {
        "links": len(rows),
        "unique_urls": len(statuses),
        "broken": len(broken_now),
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
    with httpx.Client(headers={"User-Agent": "cercol-link-check/1.0"}) as http_client:
        counts = run(cfg, http_client=http_client, bq_client=bq_client)
    log.info("External links check counts: %s", counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
