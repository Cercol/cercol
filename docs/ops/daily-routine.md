# The daily routine, and what it can reach

The Claude Code cloud routine wakes at 07:00, reads the issues the Worker
filed overnight, and works them. Its prompt lives in the routine's own page,
not in this repository, so the repository side is everything below.

## What it reads

| source | filed by | label |
| --- | --- | --- |
| the daily brief | `worker/src/jobs/daily.js`, 04:00 | none |
| plan steps sent to be done | Admin, Pla, "envia a fer" | `pla` |

The label is what makes the second one findable. Without it the routine would
have to read every open issue and infer from the title.

## What closes a step

`syncFiledIssues` runs at 04:00, just before the brief. It asks GitHub once for
the closed issues carrying `pla` and marks the matching steps done. One request
for the whole plan: the Worker gets 50 subrequests per invocation and there are
ninety steps, so polling each one was never possible.

Only steps in `doing` advance. A step deliberately dropped, or already done,
is left alone. So the sequence that works end to end is:

1. You press "envia a fer" on a step. It files an issue and goes to `en marxa`.
2. The routine picks the issue up, does the work, opens a PR, closes the issue.
3. At 04:00 the step goes to `fet` on its own.

Run it now instead of waiting: `POST /admin/jobs/plan-sync` with an admin JWT.

## What it cannot do

Anything needing an account, a signature, or a human decision: creating a
Zenodo record, submitting to a journal, signing a consent form. Those steps
carry a `do` or `link` action in the plan and are yours.

Letters to named people are sendable from the panel, but only after the gates
in the step itself. A translation is never offered to a researcher before a
philologist has passed the actual item strings.

## Adding the plan to the routine's prompt

The routine only reads what its prompt tells it to. To have it work plan steps
as well as the brief, that prompt needs a line naming the second queue:

> Also read the open issues labelled `pla` in Cercol/cercol. Each one is a step
> from the distribution plan in `src/data/distribution-plan.js` and carries its
> own reasoning. Work the ones that are code, content, or verification. Close
> the issue when the work is merged; the plan marks itself done from that.
> Leave anything needing an account, a signature, or a judgement call, and say
> so on the issue.
