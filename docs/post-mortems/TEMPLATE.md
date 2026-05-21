# YYYY-MM-DD — Title

- **Date of incident**: YYYY-MM-DD (or date range if the incident
  lasted across days)
- **Severity**: critical | high | medium | low
- **Impact**: one or two sentences in plain language describing what
  the end user actually saw. Avoid jargon here.

## Timeline

Times in UTC.

- `HH:MM` — what happened
- `HH:MM` — first signal
- `HH:MM` — detection
- `HH:MM` — diagnosis
- `HH:MM` — fix applied
- `HH:MM` — verified resolved

For incidents that played out over days, replace `HH:MM` with the
date or commit reference.

## Root cause

Not "the test was missing". The actual mechanism: what assumption
failed, what coupling was undocumented, what process step was
optional. If there were multiple contributing factors, name them
all and identify the primary.

## Fix applied

What changed to stop the bleeding. Link the PRs or commits. Note
explicitly whether this is a structural fix or a band-aid; if a
band-aid, link the follow-up issue or sprint that owns the
structural fix.

## Prevention

This is the section that justifies the post-mortem existing.

- Policy that now prevents recurrence:
  `docs/policies/<file>.md` section/regla X.
- Or ADR that locks the new architecture:
  `docs/decisions/NNNN-slug.md`.
- Or CI check / test that catches the failure mode next time:
  path to the test file, line of the assertion.

If none of the above exist yet, this post-mortem MUST be paired with
a PR that creates at least one of them. A post-mortem with no
prevention link is just regret.

## Lessons learned

Short. Three to five bullets max. Things future maintainers should
take into their next decision in this area.
