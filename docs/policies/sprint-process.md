# Sprint process

When a sprint needs a spec or an ADR before code is written. When
the long-running autonomous-sprint pattern with gates between phases
applies.

## Matrix

| Size | Trigger | Required artefacts | Code start |
|---|---|---|---|
| Small | One vertical, one model, no cross-subsystem coupling | None | Immediately |
| Medium | More than two verticals, more than two models, multi-actor flow, state machine | Mini-spec as a `Proposed` ADR in `docs/decisions/` | After the spec lands |
| Large | More than three weeks of work, structural refactor, new external dependency | Full spec plus multiple ADRs plus pre-flight post-mortem if it overlaps a recent failure | After the spec PR is merged |

The mini-spec for medium sprints is one to two pages. It must
contain the input/output contract, the edge cases that drove the
design, and the alternatives explicitly rejected. It lives in
`docs/decisions/` with status `Proposed`. The status flips to
`Accepted` when the sprint ships.

## Autonomous-sprint pattern with phase gates

Use this pattern when:

- The sprint has at least five phases that can be ordered linearly.
- Each phase has an objective verification criterion (tests pass,
  build passes, lint passes, file exists).
- The work is mostly mechanical or follows an established template,
  so judgement calls per phase are small.

Format of the operator's prompt:

1. `OVERRIDE` clause: explicit permission to skip mid-sprint
   approval. Without this, the model must stop at every checkpoint.
2. Gates between phases. Concrete, automated, non-negotiable. A
   single failed gate stops the sprint until the operator
   intervenes.
3. One commit per phase, on a single feature branch.
4. One PR at the end, never merged automatically. The operator
   reviews and merges.

This sprint (Phase 17.5) is the canonical example. The prompt that
drove it is preserved in `docs/archive/sprints/` when the sprint is
archived later.

## When to write an ADR mid-sprint

If, during a sprint, a decision comes up that was not in the spec
and that meets the ADR criteria in
`docs/decisions/README.md`, the sprint stops and writes the ADR
before continuing. Do not back-fill ADRs after the fact; the
context that justifies them is fresh at the moment of the decision.
