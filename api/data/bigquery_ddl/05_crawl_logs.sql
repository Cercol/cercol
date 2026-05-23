-- Parsed Caddy access logs filtered to known crawler User-Agents.
-- Written by api/jobs/crawl_log_parser.py.
-- LIMITATION: this table covers ONLY api.cercol.team. The frontend
-- cercol.team is hosted by GitHub Pages and exposes no origin logs.
-- See docs/architecture/seo-pipeline.md "limitations" for context.
CREATE TABLE IF NOT EXISTS `cercol.cercol_seo.crawl_logs` (
    ts              TIMESTAMP   NOT NULL OPTIONS(description="Request timestamp from Caddy"),
    ts_date         DATE        NOT NULL OPTIONS(description="Date(ts) in UTC, for partitioning"),
    remote_ip       STRING               OPTIONS(description="Client IP as seen by Caddy"),
    user_agent      STRING               OPTIONS(description="Raw User-Agent header"),
    bot_name        STRING      NOT NULL OPTIONS(description="Normalised crawler name (googlebot, bingbot, ...)"),
    host            STRING      NOT NULL OPTIONS(description="Request host header, e.g. api.cercol.team"),
    path            STRING      NOT NULL OPTIONS(description="Request URI path"),
    status          INT64       NOT NULL OPTIONS(description="HTTP response status code"),
    duration_ms     INT64                OPTIONS(description="Caddy-reported handling duration in ms"),
    bytes_sent      INT64                OPTIONS(description="Response body bytes sent"),
    ingested_at     TIMESTAMP   NOT NULL OPTIONS(description="When this row was written by the parser")
)
PARTITION BY ts_date
CLUSTER BY bot_name, path
OPTIONS(description="Crawler hits parsed from /var/log/caddy/cercol_api_access.log");
