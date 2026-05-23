-- Per-query search stats from Bing Webmaster Tools.
-- Written by api/jobs/bing_ingest.py.
-- Partitioned by `date` so daily-scoped queries scan one partition.
-- Clustered by `query` because most analyses are query-first.
CREATE TABLE IF NOT EXISTS `cercol.cercol_seo.bing_query_stats` (
    date            DATE        NOT NULL OPTIONS(description="Stat day (UTC)"),
    query           STRING      NOT NULL OPTIONS(description="Search query string as reported by Bing"),
    impressions     INT64       NOT NULL OPTIONS(description="Search result impressions for this query on this day"),
    clicks          INT64       NOT NULL OPTIONS(description="Clicks for this query on this day"),
    avg_position    FLOAT64               OPTIONS(description="Average SERP position (1.0 = first)"),
    ingested_at     TIMESTAMP   NOT NULL OPTIONS(description="When this row was written by the ingest job")
)
PARTITION BY date
CLUSTER BY query
OPTIONS(description="Bing Webmaster Tools GetQueryStats output");
