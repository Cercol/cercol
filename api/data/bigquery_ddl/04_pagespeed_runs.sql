-- Per-URL PageSpeed Insights run.
-- Written by api/jobs/pagespeed_ingest.py.
-- Partitioned by the run date so longitudinal queries scan only the
-- needed days. `url` clustering supports per-URL trend dashboards.
CREATE TABLE IF NOT EXISTS `cercol.cercol_seo.pagespeed_runs` (
    run_ts                  TIMESTAMP   NOT NULL OPTIONS(description="Exact moment the run was performed"),
    run_date                DATE        NOT NULL OPTIONS(description="Date(run_ts) in UTC, for partitioning"),
    url                     STRING      NOT NULL OPTIONS(description="The page audited"),
    device                  STRING      NOT NULL OPTIONS(description="'mobile' or 'desktop'"),
    lcp_ms                  INT64                OPTIONS(description="Largest Contentful Paint in ms"),
    fid_ms                  INT64                OPTIONS(description="First Input Delay in ms (legacy, may be null)"),
    inp_ms                  INT64                OPTIONS(description="Interaction to Next Paint in ms"),
    cls                     FLOAT64              OPTIONS(description="Cumulative Layout Shift, unitless"),
    fcp_ms                  INT64                OPTIONS(description="First Contentful Paint in ms"),
    ttfb_ms                 INT64                OPTIONS(description="Time To First Byte in ms"),
    performance_score       INT64                OPTIONS(description="Lighthouse performance score 0..100"),
    accessibility_score     INT64                OPTIONS(description="Lighthouse accessibility score 0..100"),
    seo_score               INT64                OPTIONS(description="Lighthouse SEO score 0..100"),
    best_practices_score    INT64                OPTIONS(description="Lighthouse best-practices score 0..100"),
    ingested_at             TIMESTAMP   NOT NULL OPTIONS(description="When this row was written by the ingest job")
)
PARTITION BY run_date
CLUSTER BY url, device
OPTIONS(description="PageSpeed Insights API v5 lab + field metrics per URL");
