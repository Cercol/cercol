# Post-mortems

When to write one, how to write one, and what makes one count.

## When

Mandatory:

- Production incident visible to end users. Outage, data loss,
  silent corruption, security disclosure.
- Decision documented in an ADR that has demonstrably failed and is
  now being superseded under stress (not as part of normal
  evolution).
- A redesign that contradicts a decision shipped in the immediately
  preceding sprint. If we ship X this sprint and rip it out next
  sprint, the next sprint contains a post-mortem.

Not required for: routine bug fixes caught before production,
expected rollback during a feature ramp, deliberate experiments
that did not pan out.

## How

Copy `docs/post-mortems/TEMPLATE.md`. Fill every section. Pay
particular attention to:

### Root cause, not "the test was missing"

"We did not have a test that covered this" is a symptom. The root
cause is the structural reason that test did not exist: was the
failure mode invisible to the team, was the surface considered
covered by other tests, was the area outside the codebase entirely.
The post-mortem names that structural reason.

### Timeline in UTC

For incidents that played out in real time, use UTC. The internal
team is on CET/CEST but production traffic is global; UTC is the
common reference.

For incidents that played out over days or weeks, replace times
with dates or with commit references.

### Prevention link is mandatory

Every post-mortem ends with a Prevention section that links to:

- A policy file in `docs/policies/` that, had it existed and been
  enforced, would have prevented the incident.
- Or an ADR in `docs/decisions/` that locks the new architecture.
- Or a CI check or test asserting against the failure mode.

If no such artefact exists yet, the post-mortem must be paired with
a PR that creates one. A post-mortem with no prevention link is a
regret, not a control.

### Philosophy

The post-mortem is not about who failed; it is about which rule was
absent from the system. Phrasing matters: prefer "we did not have a
hook that catches X" over "developer N did not check X".

## Where the post-mortems live

In `docs/post-mortems/`, not in `docs/archive/`. They stay visible
because the goal is to make every future contributor aware of past
failure modes when they touch the affected subsystem. A post-mortem
moves to archive only when the underlying subsystem has been
entirely replaced (a year or more typically), at which point the
prevention link points into archive too.

## Cèrcol post-mortems to date

See `docs/post-mortems/README.md` for the index.
