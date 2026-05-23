"""
Closed-loop measurement of copy changes.

# Spec: docs/architecture/seo-pipeline.md

Walks cercol_seo.copy_changes for rows whose scheduled_measure_ts has
passed and `measured = false`. For each, computes recent CTR from
GSC and prior CTR before the change, writes the result back.

The measurement window is symmetric: same number of days before and
after the change. Defaults to 14 + 14 days. Routes that have less
GSC history than that are skipped (still measured=false) until
enough data accumulates.

Run weekly via cron (api/deploy/cron/cercol-seo-copy-impact, not
installed in this phase; the script is the foundation that the next
phase will wire up).
"""

from __future__ import annotations

import logging
import sys

from ._config import JobConfig, load_config, require_secret

log = logging.getLogger("cercol.seo_copy_impact")

WINDOW_DAYS = 14


def _due_rows(bq, project: str, ds_seo: str) -> list[dict]:
    """Pending copy_changes whose measurement window has passed."""
    rows = list(bq.query(f"""
        SELECT id, route, field, ts, scheduled_measure_ts
        FROM `{project}.{ds_seo}.copy_changes`
        WHERE measured = FALSE
          AND scheduled_measure_ts <= CURRENT_TIMESTAMP()
        ORDER BY scheduled_measure_ts
    """).result())
    return [dict(r) for r in rows]


def _measure(bq, project: str, ds_gsc: str, route: str, ts) -> tuple[float | None, float | None]:
    """Return (recent_ctr, prior_ctr) for the WINDOW_DAYS days after `ts`
    and the WINDOW_DAYS days before `ts`. Either may be None if GSC has
    no rows in that window.
    """
    # Allow either a full URL or just a route slug in the column.
    url_like = f"https://cercol.team{route}" if route.startswith("/") else route

    rows = list(bq.query(f"""
        SELECT
          SUM(CASE WHEN data_date BETWEEN DATE_ADD(DATE(@ts), INTERVAL 1 DAY)
                                      AND DATE_ADD(DATE(@ts), INTERVAL {WINDOW_DAYS} DAY)
                   THEN impressions ELSE 0 END) AS recent_impr,
          SUM(CASE WHEN data_date BETWEEN DATE_ADD(DATE(@ts), INTERVAL 1 DAY)
                                      AND DATE_ADD(DATE(@ts), INTERVAL {WINDOW_DAYS} DAY)
                   THEN clicks ELSE 0 END) AS recent_clicks,
          SUM(CASE WHEN data_date BETWEEN DATE_SUB(DATE(@ts), INTERVAL {WINDOW_DAYS} DAY)
                                      AND DATE_SUB(DATE(@ts), INTERVAL 1 DAY)
                   THEN impressions ELSE 0 END) AS prior_impr,
          SUM(CASE WHEN data_date BETWEEN DATE_SUB(DATE(@ts), INTERVAL {WINDOW_DAYS} DAY)
                                      AND DATE_SUB(DATE(@ts), INTERVAL 1 DAY)
                   THEN clicks ELSE 0 END) AS prior_clicks
        FROM `{project}.{ds_gsc}.searchdata_url_impression`
        WHERE url = @url
    """, job_config=_param_config(url_like, ts)).result())

    if not rows:
        return None, None
    r = rows[0]
    recent = _safe_ctr(r["recent_clicks"], r["recent_impr"])
    prior = _safe_ctr(r["prior_clicks"], r["prior_impr"])
    return recent, prior


def _safe_ctr(clicks, impr) -> float | None:
    if not impr:
        return None
    return float(clicks) / float(impr)


def _param_config(url: str, ts):
    from google.cloud import bigquery
    return bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("url", "STRING", url),
        bigquery.ScalarQueryParameter("ts", "TIMESTAMP", ts),
    ])


def _mark_measured(bq, project: str, ds_seo: str, row_id: str,
                   recent_ctr: float | None, prior_ctr: float | None) -> None:
    change_pct = None
    if recent_ctr is not None and prior_ctr is not None and prior_ctr > 0:
        change_pct = ((recent_ctr - prior_ctr) / prior_ctr) * 100.0

    bq.query(f"""
        UPDATE `{project}.{ds_seo}.copy_changes`
        SET measured = TRUE,
            impact_recent_ctr = {repr(recent_ctr) if recent_ctr is not None else 'NULL'},
            impact_prior_ctr  = {repr(prior_ctr)  if prior_ctr  is not None else 'NULL'},
            impact_ctr_change_pct = {repr(change_pct) if change_pct is not None else 'NULL'}
        WHERE id = '{row_id}'
    """).result()


def run(cfg: JobConfig, *, bq_client) -> dict[str, int]:
    project = cfg.bigquery_project
    ds_seo = cfg.bigquery_dataset_seo
    ds_gsc = cfg.bigquery_dataset_gsc

    due = _due_rows(bq_client, project, ds_seo)
    if not due:
        log.info("No copy_changes due for measurement.")
        return {"measured": 0, "skipped": 0}

    measured = 0
    skipped = 0
    for row in due:
        recent, prior = _measure(bq_client, project, ds_gsc, row["route"], row["ts"])
        if recent is None and prior is None:
            # GSC has no rows for this URL in either window; leave unmeasured.
            skipped += 1
            continue
        _mark_measured(bq_client, project, ds_seo, row["id"], recent, prior)
        measured += 1
        log.info("measured route=%s field=%s recent=%s prior=%s",
                 row["route"], row["field"], recent, prior)

    return {"measured": measured, "skipped": skipped}


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    cfg = load_config()
    require_secret("GOOGLE_APPLICATION_CREDENTIALS", cfg.google_application_credentials)
    try:
        from google.cloud import bigquery
        bq = bigquery.Client()
    except ImportError:
        log.error("google-cloud-bigquery not installed")
        return 1
    counts = run(cfg, bq_client=bq)
    log.info("copy_impact counts: %s", counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
