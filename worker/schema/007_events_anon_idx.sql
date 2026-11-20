-- Per-visitor lookups on events (stitching a reader's article views to their
-- page views, CTA clicks and test starts) had no index to use: every visitor
-- re-read the whole 28-day window. On 2026-11-16 one such query, run once by
-- hand over 1,763 readers and ~22k events, read 15.1 M rows and a second one
-- 3.6 M, and the account hit D1's 5 M rows-read daily limit (Workers Free);
-- reads were blocked until midnight UTC and the nightly frontend deploy failed.
-- With this index the same queries read a few thousand rows.
CREATE INDEX IF NOT EXISTS events_anon_created_idx ON events (anon_id, created_at);
