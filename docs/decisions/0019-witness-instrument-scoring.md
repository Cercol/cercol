# ADR 0019: Witness instrument scoring and round design

- **Number**: 0019
- **Title**: Witness instrument scoring and round design
- **Status**: Accepted
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

## Decision

Priors are keyed by instrument, and `_scores_to_zscores` takes the instrument
that produced the scores. `_NORM_WITNESS` is mean 3.0, SD 0.93. Nothing
z-scores against a reference built for a different instrument.

The round design is thirteen rounds of three picks: best, second best,
worst. `TOTAL_ROUNDS` lives in `witness-scoring.js` next to the weights,
because the prior is derived for both and changing either invalidates it.

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

## The round change, now implemented

Each round used to ask for one best and one worst. Adding a second-best pick
and shortening the instrument tested better:

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

Shipped as thirteen rounds of three picks. `_NORM_WITNESS` was re-derived
for the new weights and length: mean 3.07, SD 1.03 over 15000 simulated
witnesses, r = 0.844, matching the twenty-round design it replaces at 39
picks instead of 40.

The mean is not a round 3.0 because the rank weights are asymmetric
(+1, +0.5, -1). The prior absorbs that rather than the scoring pretending
otherwise, and the tests are anchored to `prior_for("witness")` rather than
to a hardcoded 3.0, so a future change to the weights cannot pass silently.

All three picks are required to advance. Made optional, the second would
simply be skipped and the round would be the old two-pick round with a
longer prompt.

## Alternatives considered

**Leave the scoring alone and lower the ambition of the feature.** Present
the self and Witness roles side by side without combining them, and drop the
claim that the Witness validates anything. Rejected: with the corrected
prior the instrument does discriminate, so there is nothing to lower.

**Rescale the Witness output to a 1-7 base.** Rejected because it changes
nothing. A linear rescale multiplies the score and its SD by the same factor
and the z-score divides by the SD, so the two cancel exactly. Measured:
correlation 0.4835 against 0.4831, identical within noise. This is worth
recording because it is an intuitive fix that cannot work, and the same
argument applies to any future proposal to widen a scale.

**Two best and two worst per round.** Rejected on measurement: 0.831 against
0.844, at twice the clicks. Two picks of equal weight cannot distinguish
first from second, so ordering information is lost rather than gained.

**Full graded ranking of all five each round.** Works (0.844 to 0.848) but
needs a new interaction pattern and a higher cognitive load per round, for
0.003 less than the three-pick option.

**Thurstonian IRT scoring**, which is how modern forced-choice instruments
recover normative estimates. The right long-term answer and a research
project, not a task. The blog already describes this approach in
`forced-choice-personality-assessment-more-honest-data`.

## The same failure, one step further in

Recorded here because this ADR is where the rule lives.

The rule was "nothing may z-score without saying which instrument produced
the numbers". New Moon said so, and was still wrong, because its prior was
manufactured rather than looked up: the 1-5 IPIP statistics rescaled onto
1-7 by x7 = (x5 - 1) * 6/4 + 1.

The arithmetic is correct and the reference is not. A ten-item
adjective-pair instrument does not produce a 120-item inventory's
distribution whatever scale it is written on. Against the TIPI's own
published norms (Gosling, Rentfrow & Potter 2014, N = 278,000) the rescale
put the Bond mean 0.74 of its own SD too high and every SD 25 to 45% too
narrow. Ordinary warmth scored as cold, every z-score was inflated toward
the edges of the role space, and 41% of the real New Moon results held at
the time changed role between the two priors.

So the rule needs its second half: **a prior is looked up from the
instrument's own published norms, or it is derived and labelled as such.**
A derived prior is a placeholder. `api/tests/test_witness_prior.py` now
fails if the 1-7 prior is ever a stretched copy of the 1-5 one again.

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

## Related

- ADR 0003 for the auth layer these accounts sit on.
- `docs/architecture/backend.md` for where scoring lives.
- `forced-choice-personality-assessment-more-honest-data` on the blog, which
  already documents the ipsative-versus-normative tradeoff this instrument
  sits inside.
- `api/tests/test_witness_prior.py`, the regression guard.
