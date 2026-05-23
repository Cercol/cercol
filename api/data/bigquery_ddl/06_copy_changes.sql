-- Track title/description copy changes for closed-loop SEO impact analysis.
-- Written by api/jobs/seo_copy_impact.py and a manual register script.
-- See ADR 0009 (Accepted) for the broader UI tie-in.
CREATE TABLE IF NOT EXISTS `cercol.cercol_seo.copy_changes` (
    id                      STRING      NOT NULL OPTIONS(description="UUID for this change row"),
    ts                      TIMESTAMP   NOT NULL OPTIONS(description="When the change was recorded"),
    route                   STRING      NOT NULL OPTIONS(description="Route slug, e.g. /science/ or /blog/<slug>/"),
    field                   STRING      NOT NULL OPTIONS(description="'title' | 'description' | 'h1' | 'other'"),
    before_text             STRING                OPTIONS(description="Previous value"),
    after_text              STRING                OPTIONS(description="New value"),
    commit_hash             STRING                OPTIONS(description="git commit SHA that introduced the change"),
    scheduled_measure_ts    TIMESTAMP             OPTIONS(description="When to evaluate impact, default ts + 14 days"),
    measured                BOOL        NOT NULL OPTIONS(description="True once seo_copy_impact has written the result"),
    impact_recent_ctr       FLOAT64               OPTIONS(description="Recent CTR after the change (set by impact job)"),
    impact_prior_ctr        FLOAT64               OPTIONS(description="Prior CTR before the change (set by impact job)"),
    impact_ctr_change_pct   FLOAT64               OPTIONS(description="Percentage change in CTR")
)
PARTITION BY DATE(ts)
CLUSTER BY route
OPTIONS(description="Tracked title/description/h1 changes plus 14-day measured impact");
