-- Per-page search stats from Bing Webmaster Tools.
-- Written by api/jobs/bing_ingest.py.
CREATE TABLE IF NOT EXISTS `cercol.cercol_seo.bing_page_stats` (
    date            DATE        NOT NULL OPTIONS(description="Stat day (UTC)"),
    page            STRING      NOT NULL OPTIONS(description="Page URL as reported by Bing"),
    impressions     INT64       NOT NULL OPTIONS(description="Search result impressions for this page on this day"),
    clicks          INT64       NOT NULL OPTIONS(description="Clicks for this page on this day"),
    avg_position    FLOAT64               OPTIONS(description="Average SERP position (1.0 = first)"),
    ingested_at     TIMESTAMP   NOT NULL OPTIONS(description="When this row was written by the ingest job")
)
PARTITION BY date
CLUSTER BY page
OPTIONS(description="Bing Webmaster Tools GetPageStats output");
