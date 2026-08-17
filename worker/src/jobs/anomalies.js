/**
 * Daily SEO anomaly detector, mirroring api/jobs/seo_anomaly_detect.py:
 * last 7 days vs the prior 7 for GSC impressions per URL, and the latest
 * two PSI runs for mobile performance. Threshold-crossing changes are
 * written to cercol_seo.seo_anomalies.
 *
 * # Spec: docs/architecture/seo-pipeline.md
 */

import { query, execute, insertRows } from '../bigquery.js'

const THRESHOLD_PCT = 30.0

export async function runAnomalies(env, { thresholdPct = THRESHOLD_PCT } = {}) {
  const pj = env.BIGQUERY_PROJECT || 'cercol', gsc = env.BIGQUERY_DATASET_GSC || 'searchconsole', seo = env.BIGQUERY_DATASET_SEO || 'cercol_seo'
  await execute(env, `CREATE TABLE IF NOT EXISTS \`${pj}.${seo}.seo_anomalies\` (
      run_ts TIMESTAMP NOT NULL, run_date DATE NOT NULL, signal STRING NOT NULL, subject STRING NOT NULL,
      recent_value FLOAT64, prior_value FLOAT64, change_pct FLOAT64, threshold_pct FLOAT64, details STRING)
    PARTITION BY run_date CLUSTER BY signal, subject
    OPTIONS(description="Threshold-crossing changes detected by jobs.seo_anomaly_detect")`)

  let impr = []
  const present = await query(env, `SELECT 1 AS x FROM \`${pj}.${gsc}.INFORMATION_SCHEMA.TABLES\` WHERE table_name = 'searchdata_url_impression' LIMIT 1`)
  if (present.length) {
    const rows = await query(env, `
      WITH recent AS (SELECT url, SUM(impressions) AS impressions FROM \`${pj}.${gsc}.searchdata_url_impression\`
                      WHERE data_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE() GROUP BY url),
           prior AS (SELECT url, SUM(impressions) AS impressions FROM \`${pj}.${gsc}.searchdata_url_impression\`
                      WHERE data_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY) GROUP BY url)
      SELECT r.url, r.impressions AS recent, p.impressions AS prior,
             SAFE_DIVIDE(r.impressions - p.impressions, p.impressions) * 100 AS change_pct
      FROM recent r JOIN prior p USING (url)
      WHERE ABS(SAFE_DIVIDE(r.impressions - p.impressions, p.impressions) * 100) >= ${thresholdPct}
      ORDER BY ABS(change_pct) DESC LIMIT 200`)
    impr = rows.map((r) => ({ signal: 'impressions_7d', subject: r.url, recent_value: Number(r.recent), prior_value: Number(r.prior), change_pct: Number(r.change_pct), details: '' }))
  }

  const psiRows = await query(env, `
    WITH ranked AS (SELECT url, performance_score, run_ts, ROW_NUMBER() OVER (PARTITION BY url ORDER BY run_ts DESC) AS rk
                    FROM \`${pj}.${seo}.pagespeed_runs\` WHERE device = 'mobile' AND performance_score IS NOT NULL)
    SELECT a.url, a.performance_score AS recent, b.performance_score AS prior,
           SAFE_DIVIDE(a.performance_score - b.performance_score, b.performance_score) * 100 AS change_pct
    FROM ranked a JOIN ranked b ON a.url = b.url AND b.rk = a.rk + 1
    WHERE a.rk = 1 AND ABS(SAFE_DIVIDE(a.performance_score - b.performance_score, b.performance_score) * 100) >= ${thresholdPct}
    ORDER BY ABS(change_pct) DESC LIMIT 200`)
  const psi = psiRows.map((r) => ({ signal: 'psi_performance_mobile', subject: r.url, recent_value: Number(r.recent), prior_value: Number(r.prior), change_pct: Number(r.change_pct), details: '' }))

  const all = [...impr, ...psi]
  if (all.length) {
    const now = new Date().toISOString()
    await insertRows(env, seo, 'seo_anomalies', all.map((a) => ({ run_ts: now, run_date: now.slice(0, 10), threshold_pct: thresholdPct, ...a })))
  }
  return { impressions_7d: impr.length, psi_performance_mobile: psi.length }
}
