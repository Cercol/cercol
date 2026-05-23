-- Daily Bingbot crawl summary.
-- Written by api/jobs/bing_ingest.py.
CREATE TABLE IF NOT EXISTS `cercol.cercol_seo.bing_crawl_stats` (
    date            DATE        NOT NULL OPTIONS(description="Stat day (UTC)"),
    crawled_pages   INT64       NOT NULL OPTIONS(description="Number of pages Bingbot crawled this day"),
    crawl_errors    INT64       NOT NULL OPTIONS(description="Crawl errors (5xx, timeouts, DNS failures) this day"),
    blocked         INT64       NOT NULL OPTIONS(description="Pages Bingbot was blocked from (robots.txt, 4xx)"),
    ingested_at     TIMESTAMP   NOT NULL OPTIONS(description="When this row was written by the ingest job")
)
PARTITION BY date
OPTIONS(description="Bing Webmaster Tools GetCrawlStats output");
