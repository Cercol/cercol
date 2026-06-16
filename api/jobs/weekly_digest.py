"""
Weekly internal metrics digest. Sent every Monday for the prior Mon-Sun week.

# Spec: docs/architecture/seo-pipeline.md  (ROADMAP Phase 17.6.7)

One branded English email to DIGEST_EMAIL (default hello@cercol.team) with how
cercol.team performed last week: signups, tests (total + by instrument + by the
12 animal clusters), the visit -> read -> test -> signup funnel with conversion
rates, top blog articles, search performance (GSC with Bing fallback), PageSpeed,
broken external links, and week-over-week deltas.

Two data sources, both already in production:
  - PostgreSQL (asyncpg): auth_users, results, events, blog_posts. The job opens
    its OWN short-lived connection (jobs are standalone `python -m ...`, there is
    no shared FastAPI pool).
  - BigQuery: searchconsole.* (GSC) and cercol_seo.* (Bing, PageSpeed, external
    links), the same datasets api/seo.py reads.

Every section degrades gracefully: a quiet week, an unmigrated page_view event,
or an empty/absent BigQuery table renders a placeholder instead of aborting, so
the email always sends.

Run manually (debug):  python -m jobs.weekly_digest
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Any

import asyncpg

from ._config import JobConfig, load_config

# api/ is on sys.path when run as `python -m jobs.weekly_digest` from
# /home/cercol/api/api, so these import directly (same trick as external_links_check).
from scoring import DOMAINS, _compute_role, _scores_to_zscores

log = logging.getLogger("cercol.weekly_digest")

DIGEST_EMAIL = os.getenv("DIGEST_EMAIL", "hello@cercol.team")

# Human-friendly instrument labels (DB values -> display).
_INSTRUMENT_LABELS = {
    "newMoon": "New Moon",
    "firstQuarter": "First Quarter",
    "fullMoon": "Full Moon",
}


# ---------------------------------------------------------------------------
# Week boundaries (UTC)
# ---------------------------------------------------------------------------

def week_bounds(now: datetime | None = None) -> tuple[datetime, datetime, datetime, datetime]:
    """Return (week_start, week_end, prev_start, prev_end) for the last full
    Mon-Sun week in UTC. `week_end`/`prev_end` are exclusive upper bounds.

    Example: run on Mon Jun 16 -> covers Mon Jun 09 00:00 .. Mon Jun 16 00:00.
    """
    now = now or datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    this_monday = today - timedelta(days=today.weekday())
    week_start = this_monday - timedelta(days=7)
    week_end = this_monday                     # exclusive
    prev_start = week_start - timedelta(days=7)
    prev_end = week_start
    return week_start, week_end, prev_start, prev_end


def week_label(ws: datetime, we: datetime) -> str:
    last_day = we - timedelta(days=1)
    return f"{ws:%b %d}–{last_day:%b %d, %Y}"


# ---------------------------------------------------------------------------
# PostgreSQL
# ---------------------------------------------------------------------------

async def _init_connection(conn) -> None:
    """Mirror main.py: decode json/jsonb to dicts (defensive; the digest reads
    scalars and json ->> text, but keep parity with the API connection)."""
    await conn.set_type_codec("json", encoder=json.dumps, decoder=json.loads, schema="pg_catalog")
    await conn.set_type_codec("jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog")


async def _count(conn, sql: str, ws, we) -> int:
    return int(await conn.fetchval(sql, ws, we) or 0)


async def gather_postgres(ws, we, ps, pe) -> dict[str, Any]:
    """Collect all PostgreSQL metrics for the current and prior week."""
    conn = await asyncpg.connect(dsn=os.environ["DATABASE_URL"], init=_init_connection)
    try:
        # KPIs (current + prior for week-over-week deltas).
        signups = (
            await _count(conn, "SELECT COUNT(*) FROM auth_users WHERE created_at >= $1 AND created_at < $2", ws, we),
            await _count(conn, "SELECT COUNT(*) FROM auth_users WHERE created_at >= $1 AND created_at < $2", ps, pe),
        )
        tests = (
            await _count(conn, "SELECT COUNT(*) FROM results WHERE created_at >= $1 AND created_at < $2", ws, we),
            await _count(conn, "SELECT COUNT(*) FROM results WHERE created_at >= $1 AND created_at < $2", ps, pe),
        )
        page_views = (
            await _count(conn, "SELECT COUNT(*) FROM events WHERE name='page_view' AND created_at >= $1 AND created_at < $2", ws, we),
            await _count(conn, "SELECT COUNT(*) FROM events WHERE name='page_view' AND created_at >= $1 AND created_at < $2", ps, pe),
        )
        visitors = (
            await _count(conn, "SELECT COUNT(DISTINCT anon_id) FROM events WHERE name='page_view' AND anon_id IS NOT NULL AND created_at >= $1 AND created_at < $2", ws, we),
            await _count(conn, "SELECT COUNT(DISTINCT anon_id) FROM events WHERE name='page_view' AND anon_id IS NOT NULL AND created_at >= $1 AND created_at < $2", ps, pe),
        )

        # Tests by instrument.
        instr_rows = await conn.fetch(
            "SELECT instrument, COUNT(*) AS n FROM results "
            "WHERE created_at >= $1 AND created_at < $2 GROUP BY instrument ORDER BY n DESC",
            ws, we,
        )
        instruments = [(_INSTRUMENT_LABELS.get(r["instrument"], r["instrument"] or "unknown"), int(r["n"]))
                       for r in instr_rows]

        # Raw domain scores for cluster computation (all five domains present).
        role_rows = await conn.fetch(
            "SELECT presence, bond, discipline, depth, vision FROM results "
            "WHERE created_at >= $1 AND created_at < $2 "
            "AND presence IS NOT NULL AND bond IS NOT NULL AND discipline IS NOT NULL "
            "AND depth IS NOT NULL AND vision IS NOT NULL",
            ws, we,
        )

        # Funnel events.
        funnel_rows = await conn.fetch(
            "SELECT name, COUNT(*) AS n FROM events "
            "WHERE created_at >= $1 AND created_at < $2 "
            "AND name IN ('page_view','article_view','test_start','cta_click') GROUP BY name",
            ws, we,
        )
        funnel = {r["name"]: int(r["n"]) for r in funnel_rows}

        # Top blog articles by reads (article_view events — NOT view_count, which
        # is cumulative-only and cannot yield a weekly figure). Title in English.
        article_rows = await conn.fetch(
            "SELECT e.slug AS slug, COUNT(*) AS reads, "
            "       (SELECT b.title ->> 'en' FROM blog_posts b WHERE b.slug = e.slug) AS title "
            "FROM events e "
            "WHERE e.name='article_view' AND e.slug IS NOT NULL "
            "AND e.created_at >= $1 AND e.created_at < $2 "
            "GROUP BY e.slug ORDER BY reads DESC LIMIT 10",
            ws, we,
        )
        top_articles = [((r["title"] or r["slug"]), int(r["reads"])) for r in article_rows]
    finally:
        await conn.close()

    return {
        "kpis": {
            "signups": signups,
            "tests": tests,
            "page_views": page_views,
            "unique_visitors": visitors,
        },
        "instruments": instruments,
        "role_rows": role_rows,
        "funnel_raw": funnel,
        "tests_total": tests[0],
        "top_articles": top_articles,
    }


def compute_role_counts(role_rows: list) -> list[tuple[str, int]]:
    """Count results per cluster using researcher-prior z-scores (norm=None).

    Priors give stable cross-week clustering without standing up the empirical
    norm cache (which lives in the API process, not in this standalone job).
    Returns [(role_id, count), ...] sorted by count desc, non-zero only.
    """
    from collections import Counter
    counts: Counter[str] = Counter()
    for r in role_rows:
        scores = {d: r[d] for d in DOMAINS}
        z = _scores_to_zscores(scores, norm=None)
        counts[_compute_role(z)] += 1
    return sorted(counts.items(), key=lambda kv: kv[1], reverse=True)


def build_funnel(funnel_raw: dict[str, int], tests_total: int) -> dict[str, Any]:
    """Assemble the funnel block with guarded conversion rates."""
    pv = funnel_raw.get("page_view", 0)
    av = funnel_raw.get("article_view", 0)
    ts = funnel_raw.get("test_start", 0)
    cc = funnel_raw.get("cta_click", 0)

    def rate(num: int, den: int) -> str:
        return f"{num / den:.1%}" if den else "—"

    return {
        "page_view": pv,
        "article_view": av,
        "test_start": ts,
        "cta_click": cc,
        "test_complete": tests_total,
        "conversions": [
            ("Visits → test starts", rate(ts, pv)),
            ("Reads → CTA clicks", rate(cc, av)),
            ("Starts → completions", rate(tests_total, ts)),
        ],
    }


# ---------------------------------------------------------------------------
# BigQuery
# ---------------------------------------------------------------------------

def _bq(bq, sql: str) -> list[dict]:
    """Run a BigQuery query, returning [] on any error (mirrors api/seo._query).

    Dates are job-controlled literals, never user input, so they are inlined.
    """
    try:
        return [dict(r) for r in bq.query(sql).result()]
    except Exception as exc:  # noqa: BLE001 - missing table / no creds degrade to empty
        log.warning("BigQuery query failed (%s)", exc)
        return []


def gather_bigquery(cfg: JobConfig, bq, ws, we, ps, pe) -> dict[str, Any]:
    """Collect search (GSC->Bing), PageSpeed and broken-link metrics from BQ."""
    if bq is None:
        return {"seo": {"pending": True}, "pagespeed": [], "broken_links": []}

    p = cfg.bigquery_project
    sg = cfg.bigquery_dataset_gsc
    sd = cfg.bigquery_dataset_seo
    cw_s, cw_e = ws.date().isoformat(), (we - timedelta(days=1)).date().isoformat()
    pw_s, pw_e = ps.date().isoformat(), (pe - timedelta(days=1)).date().isoformat()

    seo: dict[str, Any] = {"source": None, "impressions": 0, "clicks": 0,
                           "top_queries": [], "top_pages": [], "movers": [], "pending": True}

    gsc_present = bool(_bq(
        bq, f"SELECT 1 AS x FROM `{p}.{sg}.INFORMATION_SCHEMA.TABLES` "
            "WHERE table_name = 'searchdata_url_impression' LIMIT 1"))

    if gsc_present:
        gt = f"`{p}.{sg}.searchdata_url_impression`"
        totals = _bq(bq, f"SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks "
                         f"FROM {gt} WHERE data_date BETWEEN '{cw_s}' AND '{cw_e}'")
        tq = _bq(bq, f"SELECT query, SUM(impressions) AS impressions, SUM(clicks) AS clicks, "
                     f"AVG(sum_position/impressions) AS pos FROM {gt} "
                     f"WHERE data_date BETWEEN '{cw_s}' AND '{cw_e}' "
                     f"GROUP BY query ORDER BY impressions DESC LIMIT 10")
        # Position movers: this week vs prior week, biggest absolute change.
        movers = _bq(bq, f"""
            WITH cur AS (SELECT url, SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos
                         FROM {gt} WHERE data_date BETWEEN '{cw_s}' AND '{cw_e}' GROUP BY url),
                 prev AS (SELECT url, SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) AS pos
                          FROM {gt} WHERE data_date BETWEEN '{pw_s}' AND '{pw_e}' GROUP BY url)
            SELECT cur.url AS url, prev.pos AS before, cur.pos AS now,
                   prev.pos - cur.pos AS improvement
            FROM cur JOIN prev USING (url)
            WHERE cur.pos IS NOT NULL AND prev.pos IS NOT NULL
            ORDER BY ABS(prev.pos - cur.pos) DESC LIMIT 8""")
        t = totals[0] if totals else {}
        seo.update({
            "source": "gsc",
            "impressions": int(t.get("impressions") or 0),
            "clicks": int(t.get("clicks") or 0),
            "top_queries": [(r["query"], int(r["impressions"]), int(r["clicks"]),
                             float(r["pos"]) if r.get("pos") is not None else None) for r in tq],
            "movers": [(r["url"], float(r["before"]), float(r["now"]), float(r["improvement"]))
                       for r in movers],
            "pending": not (totals or tq),
        })
    else:
        bt = f"`{p}.{sd}.bing_query_stats`"
        totals = _bq(bq, f"SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks "
                         f"FROM {bt} WHERE date BETWEEN '{cw_s}' AND '{cw_e}'")
        tq = _bq(bq, f"SELECT query, SUM(impressions) AS impressions, SUM(clicks) AS clicks, "
                     f"AVG(avg_position) AS pos FROM {bt} "
                     f"WHERE date BETWEEN '{cw_s}' AND '{cw_e}' "
                     f"GROUP BY query ORDER BY impressions DESC LIMIT 10")
        t = totals[0] if totals else {}
        seo.update({
            "source": "bing",
            "impressions": int(t.get("impressions") or 0),
            "clicks": int(t.get("clicks") or 0),
            "top_queries": [(r["query"], int(r["impressions"]), int(r["clicks"]),
                             float(r["pos"]) if r.get("pos") is not None else None) for r in tq],
            "pending": not tq,
        })

    # PageSpeed: latest mobile score per URL, worst first (most actionable).
    psi = _bq(bq, f"SELECT url, ANY_VALUE(performance_score HAVING MAX run_ts) AS score, "
                  f"ANY_VALUE(lcp_ms HAVING MAX run_ts) AS lcp_ms "
                  f"FROM `{p}.{sd}.pagespeed_runs` WHERE device='mobile' "
                  f"GROUP BY url ORDER BY score ASC LIMIT 8")
    pagespeed = [(r["url"], r.get("score"), r.get("lcp_ms")) for r in psi]

    # Broken external links from the latest snapshot.
    elt = f"`{p}.{sd}.external_links_status`"
    bl = _bq(bq, f"SELECT DISTINCT url, article_slug, lang, status_code FROM {elt} "
                 f"WHERE broken = TRUE AND ts_date = (SELECT MAX(ts_date) FROM {elt}) "
                 f"ORDER BY url LIMIT 25")
    broken_links = [(r["url"], r["article_slug"], r["lang"], r.get("status_code")) for r in bl]

    return {"seo": seo, "pagespeed": pagespeed, "broken_links": broken_links}


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def run(cfg: JobConfig, *, bq_client, send: bool = True) -> dict[str, Any]:
    """Gather everything, build the digest, and (optionally) email it.

    Returns a small summary dict; with send=False the email is skipped (used by
    tests to build the data without dispatching).
    """
    ws, we, ps, pe = week_bounds()
    pg = asyncio.run(gather_postgres(ws, we, ps, pe))
    bqd = gather_bigquery(cfg, bq_client, ws, we, ps, pe)

    data: dict[str, Any] = {
        "week_label": week_label(ws, we),
        "kpis": pg["kpis"],
        "instruments": pg["instruments"],
        "roles": compute_role_counts(pg["role_rows"]),
        "funnel": build_funnel(pg["funnel_raw"], pg["tests_total"]),
        "top_articles": pg["top_articles"],
        "seo": bqd["seo"],
        "pagespeed": bqd["pagespeed"],
        "broken_links": bqd["broken_links"],
        "gsc_lag_note": bqd["seo"].get("source") == "gsc",
    }

    if send:
        if not DIGEST_EMAIL:
            log.warning("DIGEST_EMAIL unset; digest not emailed")
        else:
            from emails import _send_sync, weekly_digest_html
            _send_sync(DIGEST_EMAIL, f"Cèrcol weekly digest — {data['week_label']}",
                       weekly_digest_html(data))
            log.info("digest emailed to %s", DIGEST_EMAIL)

    return {
        "week": data["week_label"],
        "signups": pg["kpis"]["signups"][0],
        "tests": pg["tests_total"],
        "clusters": len(data["roles"]),
        "broken_links": len(bqd["broken_links"]),
    }


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    cfg = load_config()
    try:
        from google.cloud import bigquery
        bq_client = bigquery.Client()
    except Exception as exc:  # noqa: BLE001 - run with PG-only metrics if BQ unavailable
        log.warning("BigQuery client unavailable (%s); SEO sections will show pending", exc)
        bq_client = None
    counts = run(cfg, bq_client=bq_client)
    log.info("Weekly digest counts: %s", counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
