"""
Daily SEO anomaly detector.

# Spec: docs/architecture/seo-pipeline.md

Compares the last 7 days of indexing and ranking signals against the
prior 7 days. Writes any threshold-crossing changes to BigQuery
`cercol_seo.seo_anomalies` and logs a summary.

A future enhancement (Phase 17.6.3+) will fan out alerts via email /
Slack / similar. For now the detector writes a row per anomaly so the
admin dashboard can surface them and the operator can see them in
the log mail cron sends.
"""

from __future__ import annotations

import logging
import sys
from datetime import datetime, timezone

from ._config import JobConfig, load_config, require_secret, table_id

log = logging.getLogger("cercol.seo_anomaly_detect")

# Threshold in absolute percentage points.
DEFAULT_THRESHOLD_PCT = 30.0


def _ensure_anomalies_table(bq, project: str, dataset: str) -> None:
    """Create the anomalies table if it does not yet exist. Idempotent."""
    sql = f"""
    CREATE TABLE IF NOT EXISTS `{project}.{dataset}.seo_anomalies` (
        run_ts          TIMESTAMP NOT NULL,
        run_date        DATE NOT NULL,
        signal          STRING NOT NULL,
        subject         STRING NOT NULL,
        recent_value    FLOAT64,
        prior_value     FLOAT64,
        change_pct      FLOAT64,
        threshold_pct   FLOAT64,
        details         STRING
    )
    PARTITION BY run_date
    CLUSTER BY signal, subject
    OPTIONS(description="Threshold-crossing changes detected by jobs.seo_anomaly_detect")
    """
    bq.query(sql).result()


def detect_impression_anomalies(bq, project: str, ds_gsc: str, threshold_pct: float) -> list[dict]:
    """Pages whose impressions changed by >= threshold_pct between
    the last 7 days and the prior 7 days.

    Returns an empty list if the GSC table does not exist yet.
    """
    # Check the GSC table exists; the bulk export may not have landed.
    present = list(bq.query(
        f"SELECT 1 FROM `{project}.{ds_gsc}.INFORMATION_SCHEMA.TABLES` "
        f"WHERE table_name = 'searchdata_url_impression' LIMIT 1"
    ).result())
    if not present:
        log.info("GSC table not present, skipping impression anomalies")
        return []

    rows = list(bq.query(f"""
        WITH recent AS (
          SELECT url, SUM(impressions) AS impressions
          FROM `{project}.{ds_gsc}.searchdata_url_impression`
          WHERE data_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
          GROUP BY url
        ),
        prior AS (
          SELECT url, SUM(impressions) AS impressions
          FROM `{project}.{ds_gsc}.searchdata_url_impression`
          WHERE data_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
                              AND DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY)
          GROUP BY url
        )
        SELECT r.url, r.impressions AS recent, p.impressions AS prior,
               SAFE_DIVIDE(r.impressions - p.impressions, p.impressions) * 100 AS change_pct
        FROM recent r JOIN prior p USING (url)
        WHERE ABS(SAFE_DIVIDE(r.impressions - p.impressions, p.impressions) * 100) >= {threshold_pct}
        ORDER BY ABS(change_pct) DESC
        LIMIT 200
    """).result())

    out = []
    for r in rows:
        out.append({
            "signal": "impressions_7d",
            "subject": r["url"],
            "recent_value": float(r["recent"]),
            "prior_value": float(r["prior"]),
            "change_pct": float(r["change_pct"]),
            "details": "",
        })
    return out


def detect_psi_regressions(bq, project: str, ds_seo: str, threshold_pct: float) -> list[dict]:
    """Pages whose mobile performance_score dropped by >= threshold_pct
    between the most recent run and the one 7-14 days earlier.

    Only fires when there are at least two runs to compare.
    """
    rows = list(bq.query(f"""
        WITH ranked AS (
          SELECT url, performance_score, run_ts,
                 ROW_NUMBER() OVER (PARTITION BY url ORDER BY run_ts DESC) AS rk
          FROM `{project}.{ds_seo}.pagespeed_runs`
          WHERE device = 'mobile' AND performance_score IS NOT NULL
        )
        SELECT a.url, a.performance_score AS recent, b.performance_score AS prior,
               SAFE_DIVIDE(a.performance_score - b.performance_score, b.performance_score) * 100 AS change_pct
        FROM ranked a JOIN ranked b ON a.url = b.url AND b.rk = a.rk + 1
        WHERE a.rk = 1
          AND ABS(SAFE_DIVIDE(a.performance_score - b.performance_score, b.performance_score) * 100) >= {threshold_pct}
        ORDER BY ABS(change_pct) DESC
        LIMIT 200
    """).result())

    out = []
    for r in rows:
        out.append({
            "signal": "psi_performance_mobile",
            "subject": r["url"],
            "recent_value": float(r["recent"]),
            "prior_value": float(r["prior"]),
            "change_pct": float(r["change_pct"]),
            "details": "",
        })
    return out


def run(cfg: JobConfig, *, bq_client, threshold_pct: float = DEFAULT_THRESHOLD_PCT) -> dict[str, int]:
    """Detect anomalies and persist them. Returns the counts written."""
    project = cfg.bigquery_project
    ds_seo = cfg.bigquery_dataset_seo
    ds_gsc = cfg.bigquery_dataset_gsc

    _ensure_anomalies_table(bq_client, project, ds_seo)

    impr = detect_impression_anomalies(bq_client, project, ds_gsc, threshold_pct)
    psi = detect_psi_regressions(bq_client, project, ds_seo, threshold_pct)
    all_anom = impr + psi

    if not all_anom:
        log.info("No anomalies above %.1f%%", threshold_pct)
        return {"impressions_7d": 0, "psi_performance_mobile": 0}

    now = datetime.now(timezone.utc).isoformat()
    today = now[:10]
    rows = [{
        "run_ts": now,
        "run_date": today,
        "threshold_pct": threshold_pct,
        **a,
    } for a in all_anom]

    errors = bq_client.insert_rows_json(table_id(cfg, "seo_anomalies"), rows)
    if errors:
        raise RuntimeError(f"insert_rows_json seo_anomalies failed: {errors}")

    return {
        "impressions_7d": len(impr),
        "psi_performance_mobile": len(psi),
    }


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    cfg = load_config()
    require_secret("GOOGLE_APPLICATION_CREDENTIALS", cfg.google_application_credentials)
    try:
        from google.cloud import bigquery
        bq = bigquery.Client()
    except ImportError:
        log.error("google-cloud-bigquery not installed; pip install -r api/requirements.txt")
        return 1
    counts = run(cfg, bq_client=bq)
    log.info("anomaly counts: %s", counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
