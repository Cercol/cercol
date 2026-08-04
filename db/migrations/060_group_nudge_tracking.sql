-- 060: remember which groups have already been nudged.
--
-- The nudge job (api/jobs/group_nudge.py) writes to a group owner once, when
-- their team has been sitting incomplete for long enough to have stalled
-- rather than merely started slowly. Without a marker it would write every
-- night for as long as the team stayed incomplete, which is the fastest way
-- to turn a helpful email into a filtered one.
--
-- Nullable on purpose: NULL means never nudged, and the job filters on it.
-- Recording the timestamp rather than a boolean leaves the door open to a
-- second nudge on a longer horizon without another migration.

ALTER TABLE groups ADD COLUMN IF NOT EXISTS nudged_at timestamptz;

-- Every existing group predates the job. The UK squadron's group was created
-- on 2026-07-30, so it becomes eligible on 2026-08-14 and will be picked up
-- by the first run after that date.
COMMENT ON COLUMN groups.nudged_at IS
  'When the owner was emailed about an incomplete team. NULL means never.';
