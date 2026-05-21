# Docs maintenance

How the documentation stays readable and current. Without this
policy, docs grow without bound and the signal-to-noise ratio falls
until nobody trusts what is written.

## Core rules

### Code change implies doc check

A PR that modifies code in a subsystem with a dedicated document in
`docs/architecture/<subsystem>.md` must either update that document
or justify in the PR description why no doc change is needed.

Enforced by the PR template checklist (FASE G) and a soft CI check
(`docs-coherence`) that flags such PRs with a `needs-docs-review`
label.

### Spec markers on documented modules

Python modules that have a corresponding architecture document
declare it in the module header:

```python
"""
Module description.

# Spec: docs/architecture/<file>.md
"""
```

A pre-commit hook (FASE G) parses these markers and fails the commit
if the target file does not exist. Same check runs in CI for defence
in depth.

### Quarterly decay sweep

A scheduled chore PR every quarter (15 March, 15 June, 15 September,
15 December) applies the decay table below. The PR is branched as
`chore/docs-decay-YYYY-Qx`. The sweep is a regular PR, reviewed
like any other, so the moves stay visible.

## Decay table

| Document | Trigger for archive | Replacement line in live doc |
|---|---|---|
| `CLAUDE.md` internal sections | Item resolved, more than 6 months old, not actively referenced | `[#N] YYYY-MM-DD Title (archived to docs/archive/decisions/NNNN-slug.md)` |
| `ROADMAP.md` phase row | Phase completed more than 3 months ago | `[DONE YYYY-MM] Title - docs/archive/sprints/YYYY-Qx/<slug>.md` |
| `docs/architecture/X.md` | File exceeds 500 LOC | Split by subarea; `X.md` becomes an index pointing at the children |
| `docs/decisions/*.md` | Status `Superseded` more than 6 months | Move to `docs/archive/decisions/`; the superseding ADR keeps a link to the archived location |
| `audits/*.md` | One-off audit absorbed into other docs | Move to `docs/archive/audits/YYYY-Qx/` with a single-line pointer in the source-of-truth doc |

## Exceptions

The following documents are never archived wholesale; only their
internal sections may be archived:

- `README.md`
- `CLAUDE.md`
- `PRODUCT.md`
- `SCIENCE.md`
- `SEO.md`
- `docs/policies/*.md`

Architecture documents (`docs/architecture/*.md`) are not archived
either, but they may be split or rewritten in place.

## How to run the sweep

1. Branch `chore/docs-decay-YYYY-Qx` off main.
2. Apply the decay table mechanically. Do not include other changes
   in the same PR.
3. Update `docs/archive/README.md` with the new entries.
4. Open the PR. Reviewer checks that the live docs still make sense
   with the archived content removed, and that links resolve.
5. Merge.

The first sweep applied to Cèrcol is the light sweep done in
FASE H of Phase 17.5.
