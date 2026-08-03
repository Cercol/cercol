# ADR 0019: Witness instrument scoring and round design

- **Number**: 0019
- **Title**: Witness instrument scoring and round design
- **Status**: Proposed
- **Date**: 2026-08-03

## Context

Testing the Witness flow with the demo accounts showed results that looked
like they were converging: different subjects coming back with similar
profiles. This ADR records what that turned out to be, what was fixed, what
was measured about the instrument itself, and what is proposed but not done.

Everything numeric below comes from simulation, because the instrument has
no real responses: all 46 rows in `witness_responses` are April seed data.
The simulation mirrors `computeWitnessScores` and `buildRounds` exactly,
including the fixed 15-positive/5-negative polarity sequence, the N-factor
pole inversion, and `votes[factor] += adj.valence`.

**A caution that cost a full round of wrong conclusions.** The first
simulation of this instrument had inverted signs on the five negative-polarity
rounds and on the N factor, because it added +1 for a "best" pick instead of
adding the adjective's valence. It produced a correlation of 0.47 where the
real figure is 0.84, an SD of 0.50 where the real figure is 0.93, and an
apparent ipsative constraint that does not exist. Every number in that pass
was wrong and several were acted on. Any future model of this instrument
should be diffed against the shipped code before its output is believed.

## What was actually wrong

Not the instrument. The reference its output was measured against.

`computeWitnessScores` returns `3 + (votes/count) * 2`, and `count`
increments for all five factors on every round while at most two receive a
vote. The output is therefore centred on 3.0 whatever the respondent is
like, with an SD near 0.93.

Those scores were z-scored against the self-report priors, whose means run
2.8 to 3.9 with SDs of 0.58 to 0.72. A perfectly neutral witness result did
not land at the centre of the role space. It landed at a fixed point over a
standard deviation out on three domains, and the nearest centroid to that
point is always the same one.

This is the same class of error as New Moon answering on 1-7 and being
measured against 1-5 statistics. Both were fixed together by keying priors
to instruments, so that nothing can z-score without naming the instrument
that produced the numbers.

## What the instrument actually does

With the corrected prior and a faithful model:

| Measure | Value |
|---|---|
| Correlation between recovered and true profile | 0.84 |
| Own distribution | mean 3.00, SD 0.93, near-identical on all five domains |
| Roles reachable | 12 of 12 |
| Self and Witness land on the same role, honest self-report | 52% |
| Same, self-report inflated by 0.8 SD | 29% |
| Same, one-dimension blind spot of 1.5 SD | 33% |

The instrument is good. A 0.84 correlation from twenty forced-choice rounds
is a respectable measurement, and the drop from 52% to 29% when the
self-report is distorted is the sanity-check behaviour the feature was
designed for: a real signal, not noise.

The scores are not strictly ipsative. Because valence carries the direction,
the five domain scores sum to anything from 11 to 19 rather than to a
constant, so the instrument does carry some level information as well as
shape.

One diagnostic worth recording: a witness with perfect perception recovers
*less* signal than a slightly unsure one (0.73 against 0.85). With all five
factors competing every round, a consistent witness picks the same winner
and the same loser twenty times and three factors never move. The design
relies on inconsistency to discover the middle of the ranking.

## Proposed change, not implemented

Each round currently asks for one best and one worst. Adding a second-best
pick, and shortening the instrument, tests better:

| Design | Picks per round | 20 rounds | 14 rounds | 10 rounds |
|---|---|---|---|---|
| best + worst (current) | 2 | 0.844 | 0.833 | 0.824 |
| **best + 2nd + worst** | **3** | **0.850** | **0.851** | **0.841** |
| best + worst + 2nd worst | 3 | 0.852 | 0.844 | 0.841 |
| two best + two worst | 4 | 0.831 | 0.822 | 0.822 |
| full graded rank | 4 | 0.844 | 0.848 | 0.845 |

Two best and two worst is worse than what we have. Two picks of equal weight
cannot distinguish first from second, so it loses ordering information and
costs twice the clicks.

The recommendation is **best + second-best + worst over 12 to 14 rounds**.
It adds one click per round, needs no new interaction pattern, and shortens
the instrument by a third at slightly better accuracy: 42 picks for r=0.851
against the current 40 picks for r=0.844.

The reason to prefer length over precision is that precision is not the
binding constraint. The instrument has never been completed by a real
person. It is something a user asks a colleague to do for them, and the
ask is the barrier.

Implementing it means touching `buildRounds`, `computeWitnessScores`, the
`WitnessPage` interaction, and re-deriving `_NORM_WITNESS` for the new
design, since the prior is specific to the scoring weights.

## Consequences

- Priors are per instrument and `_scores_to_zscores` takes the instrument.
  `to_five_scale` is retired: the New Moon rescale is now the same published
  statistics expressed on the 1-7 scale.
- `_NORM_WITNESS` is mean 3.0, SD 0.93, simulated. It is a Tier 3 prior in
  exactly the sense the published statistics are, and the existing Tier 1/2
  machinery replaces it at `NORM_MIN_SAMPLE`. The first real round is
  therefore also the first chance to check the simulation against people.
- The reporting question is open. At 52% baseline agreement, self and
  Witness disagreeing is the normal case, not an alarm. Any copy that
  presents disagreement as a finding needs a threshold derived from the
  distribution of agreement, not from the fact of a mismatch.
- `api/tests/test_witness_prior.py` sweeps the instrument's reachable range
  and fails if any of the twelve roles becomes unreachable again.
