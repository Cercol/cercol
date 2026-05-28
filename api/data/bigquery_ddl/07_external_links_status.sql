-- External links found in published blog article bodies, with their
-- last probed HTTP status. Written by api/jobs/external_links_check.py
-- (weekly). Each run appends a fresh snapshot so trends and "newly
-- broken since last week" diffs are both derivable from history.
-- Internal links are NOT here: they are guarded at build time by
-- api/tests/test_internal_links_integrity.py and resolved at request
-- time by blog_slug_redirects. See docs/architecture/seo-pipeline.md.
CREATE TABLE IF NOT EXISTS `cercol.cercol_seo.external_links_status` (
    ts              TIMESTAMP   NOT NULL OPTIONS(description="When this probe ran"),
    ts_date         DATE        NOT NULL OPTIONS(description="Date(ts) in UTC, for partitioning"),
    article_slug    STRING      NOT NULL OPTIONS(description="Slug of the article containing the link"),
    lang            STRING      NOT NULL OPTIONS(description="Language version the link appears in"),
    url             STRING      NOT NULL OPTIONS(description="The external URL probed"),
    status_code     INT64                OPTIONS(description="HTTP status from HEAD/GET, NULL on connection failure"),
    broken          BOOL        NOT NULL OPTIONS(description="True only for hard failures (404 / DNS), not flaky 403/5xx/timeout")
)
PARTITION BY ts_date
CLUSTER BY broken, article_slug
OPTIONS(description="Weekly external-link health snapshot for blog articles");
