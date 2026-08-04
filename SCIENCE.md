# Cèrcol — Scientific Foundation

This file documents the role-scoring pipeline, normative statistics, theoretical
centroids, validation plan, and all academic sources used in Cèrcol.

Read this file when working on:
- role-scoring.js or witness-scoring.js
- normative priors or centroid values
- validation milestones or model updates
- any task that references AB5C, Digman, or IPIP sources

---

## Role taxonomy

### Why this system has scientific grounding

The Cèrcol role system does not claim to be a validated team performance
predictor. It claims something more modest and more defensible: that each
step in the pipeline is grounded in published, peer-reviewed research, and
that the connections between steps are principled inferences, not arbitrary
design choices.

The pipeline has three steps:

**Step 1 — Personality measurement**
We measure personality using OCEAN via the IPIP item pool. OCEAN is the most
replicated structure in personality psychology. IPIP items are public domain,
validated against multiple criterion measures, and used in thousands of
published studies. This step has strong scientific grounding.

**Step 2 — Dimension selection and role definition**
From OCEAN, we select the three dimensions that the team composition literature
identifies as requiring balance: Presence (E), Bond (A), and Vision (O). We
define roles as intersections of these three dimensions at both poles, following
the AB5C circumplex structure (Hofstee et al. 1992). The selection of Bond (A) and Vision (O) draws on Bell (2007), which found
team minimum agreeableness and team mean openness to experience among
the strongest composition predictors of team performance in field studies
(from the published abstract; the results tables are behind a paywall and
were not obtained, and a secondary reproduction gives a different figure
for Openness, so treat that one as unsettled), and on
Neuman & Wright (1999), which found Agreeableness predictive of team
performance in 79 four-person work teams. Neither study examined Extraversion,
so the inclusion of Presence (P) is a design decision and not a finding carried
over from those sources. Neither tested a bipolar balance effect either: both
report directional mean- or minimum-level relationships, so the requirement for
representation at both poles is Cèrcol's hypothesis rather than a result
imported from the literature.
The AB5C structure is the published scientific framework — we are applying it,
not inventing it.

**Step 3 — Team balance descriptions**
From the role definitions, we derive descriptions of how each role moves team
balance. These descriptions follow directly from steps 1 and 2. They are not
validated against real team outcomes — that validation does not yet exist for
this specific model. What exists is the logical chain: if P/B/V require balance
(step 2), and a person scores high on P and low on B (step 1), then that person
pushes team balance toward Presence and away from Bond.

**What this system does not claim**
- That roles predict team performance
- That every team needs all 12 roles
- That the theoretical centroids are empirically correct
- That the system is equivalent to or better than Belbin

**What this system does claim**
- That the personality measurement is valid and replicable
- That the dimension selection is grounded in published literature
- That the role definitions follow a principled scientific framework
- That the team balance descriptions are logical derivations, not assertions
- That the entire system is open to scrutiny, replication, and refutation

### Scientific foundation

Cèrcol roles are derived from the AB5C circumplex (Hofstee, De Raad & Goldberg
1992), a model that organises personality as intersections of OCEAN factor pairs.
Each AB5C facet has a known, measured OCEAN profile published in the public domain
(ipip.ori.org).

The translation from AB5C facets to team effects draws on the OCEAN team
composition literature, primarily Bell (2007) and Neuman & Wright (1999), which
establish that Agreeableness, Conscientiousness and Openness matter at team
level. Extraversion is in neither paper's findings. This
is a composition of two evidence bases — AB5C structure and team-level OCEAN
effects — not direct evidence of team roles. It is the most principled inference
available from existing literature.

The system is a working hypothesis, not a validated instrument. All design
decisions are documented and open to refutation.

### Why three balance dimensions

Cèrcol builds its roles from three OCEAN dimensions taken at both poles:
Presence, Bond and Vision. **That is a construction, not a performance claim,
and the evidence is against reading it as one.**

Peeters, Van Tuijl, Rutte & Reymen (2006) is the direct test. It is a
meta-analysis of Big Five team composition that separated *elevation* (the
team's average) from *variability* (the spread within the team), and
pre-registered the both-poles prediction for Extraversion as its hypothesis
H1b. Corrected population correlations with team performance:

| Trait | Elevation ρ | Variability ρ | 90% CI on variability |
|---|---|---|---|
| Extraversion | 0.04 | **0.05** | −0.06 to 0.18, includes zero |
| Agreeableness | **0.24** | **−0.12** | −0.16 to −0.07 |
| Conscientiousness | **0.20** | **−0.24** | −0.33 to −0.14 |
| Emotional stability | 0.04 | 0.02 | −0.13 to 0.16 |
| Openness | 0.03 | −0.01 | −0.15 to 0.12 |

Their own summary: "the higher the average level of agreeableness and
conscientiousness within teams, and the more similar team members are with
respect to agreeableness and conscientiousness, the better their team
performs".

So, honestly, per dimension:

- **Bond (A): the both-poles reading is contradicted.** Spread on Agreeableness
  is negatively related to performance, and the effect is significant. Teams do
  better when members are *alike* here, and the strongest single result in the
  field literature is Bell's team *minimum* agreeableness (ρ = .37): what
  matters is not having a low member.
- **Vision (O): unsupported.** Variability is ρ = −0.01 overall and
  significantly negative in professional teams (ρ = −0.11, CI −0.14 to −0.08).
- **Presence (E): tested and not confirmed.** The point estimate is in the
  predicted direction and the interval includes zero, across k = 6, N = 332.
  This is the one where the premise is open rather than refuted, and the
  complementarity tradition gives it a theoretical case: the interpersonal
  circumplex holds that dominance is complementary while warmth is reciprocal,
  which would predict exactly this asymmetry between E and A.

**What Cèrcol therefore claims, and does not.** The three dimensions at both
poles are how the twelve roles are laid out, and the roles are a vocabulary
for describing where a person sits. Cèrcol does not claim that a team performs
better with both poles represented; on Bond and Vision the evidence says the
opposite or says nothing. This is consistent with the scope this document
already sets elsewhere, that Cèrcol does not claim roles predict team
performance. The earlier wording of this section was a performance claim
smuggled into a document that disclaims performance prediction.

The three arguments below are the design reasoning, kept because they explain
why the layout is useful for describing a team, not because the literature
endorses them:

- **Presence (E)**: initiative and listening must coexist. A team high in
  Presence consumes oxygen; a team low in Presence stalls.
- **Bond (A)**: cohesion without confrontation produces groupthink. Confrontation
  without cohesion destroys.
- **Vision (O)**: innovation without pragmatism never lands. Pragmatism without
  innovation repeats mistakes.

### Why C and N are not balance dimensions

Conscientiousness is the one dimension where the directional reading holds:
elevation ρ = 0.20 and variability ρ = −0.24, the largest variance penalty of
any trait in Peeters et al. Neuroticism is not: emotional stability elevation
is ρ = 0.04 with an interval including zero, and the authors decline to draw a
conclusion. Cèrcol treats Depth as directional on the individual literature,
not on a team-level finding, and should say so wherever it says it.

**Conscientiousness (Discipline)** is directional upward. Barrick & Mount (1991)
is the most replicated finding in applied personality psychology: C predicts
individual performance across almost all job contexts. Bell (2007) confirms the
effect at team level. There is no evidence that teams benefit from low-C members
as a counterweight.

**Neuroticism (Depth)** is directional downward. Bell (2007) finds a consistent
negative effect of high mean N on team cohesion and performance. There is no
evidence of a team role that requires high N as a desirable characteristic in
itself.

C and N are included in role centroids as dimensions that modulate how each role
is expressed — not as dimensions that define team balance.

### Why g (cognitive ability) is excluded from the role system

No study has integrated AB5C and g to define team roles. Adding g to centroids without specific
evidence of the AB5C×g interaction would introduce arbitrariness disguised as
precision.

g is collected via ICAR as contextual data. At N≥300, the regression
g ~ assigned_role will determine whether g has predictive power over role
assignment beyond OCEAN. Until then, g does not enter the role calculation.

### System structure: 12 roles in 5D space

The 12 roles cover the six intersections of the three balance dimensions
(P×B, P×V, B×V) at both poles each. Every role has a centroid in 5D space
(E, A, O, C, N) in z-scores.

Euclidean distance in 5D space determines assignment. C and N participate in
the calculation: a profile with high Vision but very high N will move away from
the Eagle centroid and closer to Fox or Wolf. The role emerges from the full
profile.

Softmax over negative distances produces probabilities across all 12 roles.
Roles with probability > 15% form the personal arc (secondary roles).

There is no neutral centre role. A person at the centre of P/B/V space moves
no team balance in any direction — they are better described by their C and N
values than assigned a role with no functional content.

---

## Theoretical centroids v2 (order: E, A, O, C, N)

Source: AB5C (Hofstee et al. 1992) + OCEAN team composition literature
(Bell 2007). Replace with empirical centroids at N≥300.

| Role     | Profile | z_E   | z_A   | z_O   | z_C   | z_N   |
|----------|---------|-------|-------|-------|-------|-------|
| Dolphin  | P+ B+   | +1.0  | +1.0  |  0.0  |  0.0  | -0.5  |
| Wolf     | P+ B-   | +1.0  | -1.0  |  0.0  | +0.5  | +0.3  |
| Elephant | P- B+   | -1.0  | +1.0  |  0.0  |  0.0  | -0.8  |
| Owl      | P- B-   | -1.0  | -1.0  |  0.0  | +0.8  | -0.5  |
| Eagle    | P+ V+   | +1.0  |  0.0  | +1.0  | -0.3  | -0.5  |
| Falcon   | P+ V-   | +1.0  |  0.0  | -1.0  | +0.8  | -0.3  |
| Octopus  | P- V+   | -1.0  |  0.0  | +1.0  | -0.8  |  0.0  |
| Tortoise | P- V-   | -1.0  |  0.0  | -1.0  | +1.0  | -0.8  |
| Bee      | B+ V+   |  0.0  | +1.0  | +1.0  | +0.8  | -0.5  |
| Bear     | B+ V-   |  0.0  | +1.0  | -1.0  | +0.5  | -0.8  |
| Fox      | B- V+   |  0.0  | -1.0  | +1.0  | -0.8  | +0.3  |
| Badger   | B- V-   |  0.0  | -1.0  | -1.0  | +0.8  | -0.3  |

### Notes on rare profiles

Fox (B-V+) and Octopus (P-V+) are statistically less frequent because they
run against the natural positive correlations between E, A and O (r ≈ +0.15
to +0.20). Rarity does not invalidate them — they are the profiles that bring
the most unusual and hardest-to-replace imbalance correction to a team.

---

## Scoring pipeline v2

Implemented in `src/utils/role-scoring.js`.

**Step 1** — Normalise OCEAN scores to z-scores using per-domain published
priors (Johnson 2014; Maples-Keller et al. 2019). Replace with sample
statistics at N≥200.

**Step 2** — Euclidean distance in 5D space (E, A, O, C, N) to all 12
theoretical centroids.
d(profile, centroid) = sqrt(Σ(z_i − c_i)²) for i in {E, A, O, C, N}

**Step 3** — Softmax over negative distances → full probability map across
all 12 roles. Roles with probability > 15% form the personal arc.

**Step 4** — No centre rule. Profiles near the P/B/V origin are assigned
the closest centroid by distance. The report explains low maximum probability
as a diffuse profile, not a separate role category.

OCEAN factor → Cèrcol domain key mapping:
E = presence   A = bond   O = vision   C = discipline   N = depth

---

## Cèrcol vocabulary to academic mapping

| Cèrcol name | Academic key          | Symbol |
|-------------|-----------------------|--------|
| Presence    | Extraversion          | E      |
| Bond        | Agreeableness         | A      |
| Vision      | Openness to Experience| O      |
| Discipline  | Conscientiousness     | C      |
| Depth       | Neuroticism           | N      |

Cèrcol names are used in all user-facing text and product documentation.
Academic keys are used in all code, scoring logic, and scientific documentation.
Never mix the two within the same context.

---

## Normative priors

A prior belongs to an instrument, not to the platform. Nothing may z-score
without naming the instrument that produced the numbers, and naming it is not
enough: the prior has to be that instrument's own, looked up rather than
derived from another's.

### New Moon, the TIPI, 1–7 scale

Source: Gosling, S. D., Rentfrow, P. J., & Potter, J. (2014). Norms for the
Ten Item Personality Inventory. Unpublished data, tables published at
<https://gosling.psy.utexas.edu>. N = 278,000 (122,567 male, 155,433
female), reported in six age bands per sex; the figures below pool them with
the between-band variance included.

| Factor | Domain     | NORM_MEAN | NORM_SD |
|--------|------------|-----------|---------|
| E      | presence   |   3.95    |  1.58   |
| A      | bond       |   4.71    |  1.23   |
| C      | discipline |   4.65    |  1.41   |
| N      | depth      |   3.64    |  1.48   |
| O      | vision     |   5.51    |  1.14   |

The TIPI publishes Emotional Stability where Cèrcol keys Neuroticism. On a
1–7 scale the reflection is 8 − x, and a reflection leaves the SD alone.

This table replaced a linear rescale of the IPIP figures below,
x₇ = (x₅ − 1) × 6/4 + 1. The arithmetic was right and the reference was
wrong: a ten-item adjective-pair instrument does not produce a 120-item
inventory's distribution, whatever scale it is written on. Measured against
the TIPI's own norms, the rescale put the Bond mean 0.74 of its own SD too
high and every SD 25 to 45% too narrow, so an ordinary New Moon answer scored
as notably cold and every z-score was inflated toward the edges of the role
space. On the 17 real New Moon results held when this was found, 41% were
assigned a different role by the two priors.

### First Quarter and Full Moon, IPIP-NEO, 1–5 scale

Source: Kajonius, P. J., & Johnson, J. A. (2019). Assessing the structure of
the Five Factor Model of Personality (IPIP-NEO-120) in the public domain.
*Europe's Journal of Psychology, 15*(2), 260–275, Table A1. Open access.
<https://doi.org/10.5964/ejop.v15i2.1671>

N = 320,128 (127,695 male, 192,433 female, mean age 28.13). The published
table is on the 4–20 facet metric: a facet is four items answered 1–5, and
each domain figure is the mean of its six facets, so dividing by four puts it
on the item mean Cèrcol scores.

| Factor | Domain     | Published (4–20) | NORM_MEAN | NORM_SD |
|--------|------------|------------------|-----------|---------|
| E      | presence   | 13.69 / 2.36     |   3.42    |  0.59   |
| A      | bond       | 14.87 / 2.01     |   3.72    |  0.50   |
| C      | discipline | 14.95 / 2.34     |   3.74    |  0.59   |
| N      | depth      | 11.10 / 2.66     |   2.78    |  0.67   |
| O      | vision     | 13.71 / 2.06     |   3.43    |  0.52   |

These replaced five figures that had been attributed to Johnson (2014) and
Maples-Keller et al. (2019) and appear in neither. Johnson (2014) reports
alphas, correlations and factor loadings, not domain descriptives. The
largest correction is Openness: the old mean was 0.27 too high and its SD
0.08 too wide, so every respondent's Vision was understated by roughly half a
standard deviation. On the 18 real 1–5 results held when this was found, 55%
were assigned a different role by the two priors.

Two caveats the authors state and Cèrcol should carry rather than bury.
Openness is the most loosely structured of the five factors in this
instrument, with an ECV of .43, and what it measures is intellectual and
artistic curiosity rather than emotion or politics. Read Vision accordingly.

### Sample limitations

Both sources are large self-selected online samples: people who sought out a
personality test. Kajonius & Johnson describe theirs as one of the largest US
public samples to date, mean age 28. The TIPI norms come from the same
tradition of online data collection. That is the standard limitation of open
Big Five norms, and it is the reason the Tier 1 and Tier 2 machinery exists:
these are the starting point, not the destination.

The IPIP project itself declines to publish norms, on the grounds that
"most 'norms' are misleading, and therefore they should not be used"
(<https://ipip.ori.org/newNorms.htm>). Cèrcol uses these figures as an
explicitly labelled Tier 3 prior for exactly that reason, and replaces them
with its own sample as soon as there is one.

### Replacement

All priors are replaced by Cèrcol's own sample means and SDs at
NORM_MIN_SAMPLE = 200 per instrument, via the Tier 1 and Tier 2 machinery in
`api/scoring.py`.

---

## How stable is the assigned role

The twelve roles are an authored layer on a measured profile, and the
assignment is a nearest-centroid label in a continuous space. Near a boundary
between two centroids, ordinary measurement error moves it.

Simulated with the published reliabilities, drawing a true profile and giving
the same person two independent administrations:

| Instrument | Reliability used | Different role on retest |
|---|---|---|
| Full Moon, First Quarter | domain α .82–.90 (Kajonius & Johnson 2019, Table A1) | **47%** |
| New Moon | six-week test-retest r = .72 (Gosling et al. 2003) | **62%** |

A sanity check at near-perfect reliability gives 5%, so essentially all of it
is measurement error crossing a centroid boundary rather than an artefact of
the simulation.

This has to be stated because Cèrcol's own blog criticises the MBTI for a
comparable figure, and a criticism you do not apply to yourself is marketing.

Two things make Cèrcol's position different, and neither is a reason to soften
the number:

- **The role is not the result.** The measurement is the five-dimensional
  profile, which is continuous and does not flip. The role is a label on it.
- **The product already shows the neighbours.** `computeRole` returns a
  softmax probability over all twelve centroids and an `arc` of every role
  above ARC_PROBABILITY_THRESHOLD, and the report renders it. A person near a
  boundary sees both roles, which is the honest presentation of exactly this
  instability.

What follows for the copy: the animal may be introduced as the nearest of
twelve descriptions, never as a category the person belongs to, and any
sentence of the form "you are a Wolf" is wrong by this table. The dimensional
profile is what a second sitting reproduces.

## Witness Cèrcol scoring

Implemented in `src/utils/witness-scoring.js`.
Source corpus in `src/data/witness-adjectives.js`.

**Round structure:** 5 adjectives per round (one per OCEAN factor),
`TOTAL_ROUNDS` = 13. The Witness picks a best fit, a second best and a worst
fit, and all three are required to advance. This replaced a 20-round design
asking for best and worst only; see ADR 0019 for the measurement that chose
it, which reached r = 0.851 at 39 picks against 0.844 at 40.

**Per-factor vote calculation.** `RANK_WEIGHT` is `{best: 1, second: 0.5,
worst: -1}` and the adjective's valence carries the direction, so a
negative-pole adjective picked as best-fitting lowers its factor:
- Best pick, adjective with valence V on factor F → votes[F] += 1 × V
- Second pick → votes[F] += 0.5 × V
- Worst pick → votes[F] += −1 × V
- Not picked → 0 contribution, but `count[F]` still increments

**Domain score:** score[F] = clamp(3 + (sum_votes[F] / N_rounds) × 2, 1, 5)
Centred at 3 (neutral), range [1, 5], compatible with self-report scale.

**Round polarity:** fixed sequence, positive and negative rounds in a
roughly 75/25 split. Positive and negative poles never mixed within a round.
N factor is inverted: N− is the positive pole, N+ is the negative pole.
The 100 adjectives in the corpus are distributed as 20 per factor with a
10:10 valence split. At 13 rounds the sequence draws from that corpus rather
than exhausting it, which the 20-round design did.

**Adjective corpus design.**

The 100 adjectives are organised as 20 per OCEAN factor with a
10:10 valence split (10 high-pole markers, 10 low-pole markers).
Each entry has schema {id, en, ca, factor, valence, tip{en, ca}},
where the id follows the pattern {factor}{sign}{nn} (e.g. `E+01`,
`N-05`).

Markers are descriptive behavioural adjectives, not moral
evaluations. The corpus underwent a design audit aimed at three
sources of measurement noise:

1. *Social desirability imbalance.* The original corpus contained
   several low-pole adjectives that read as socially positive
   (e.g. *spontaneous*, *flexible*, *carefree* on C−; *practical*,
   *realistic*, *pragmatic* on O−), and several high-pole
   adjectives on N that carried positive connotations (e.g.
   *sensitive*, *vigilant*, *intense*). These were replaced by
   less ambiguous markers that load on the same pole without
   eliciting favourable interpretation regardless of the witness's
   prior view of the target.

2. *Translation collisions.* Two English entries mapping to the
   same Catalan word (`directe` was the target of both `blunt` and
   `straightforward`) were resolved by retranslating one entry to
   avoid the collision.

3. *Cross-loadings.* The AB5C circumplex predicts that some
   behavioural markers load on more than one factor (e.g.
   *assertive* on both E+ and A−). The corpus accepts these
   cross-loadings silently: each adjective is assigned to its
   primary factor in the schema, with secondary loadings absorbed
   as measurement noise. Future versions may extend the schema to
   represent secondary loadings explicitly.

The redesigned corpus is the source of truth for both the witness
instrument rounds (via `buildRounds`) and the role-defining
adjective mapping `ROLE_TOP_ADJECTIVES` used in the Full Moon
report.

**Known systematic bias.**

The witness domain score formula

    score[F] = clamp(3 + (sum_votes[F] / N_rounds) × 2, 1, 5)

produces a distribution centred at 3.0 across all five factors,
regardless of the underlying personality the witness is reporting
on. The IPIP-NEO normative means (used as self-report z-score
priors) are not centred at 3.0: E=3.3, A=3.9, O=3.7, C=3.7,
N=2.8 (see Normative priors).

Direct comparison of witness scores to self z-scores derived from
IPIP-NEO priors therefore introduces a systematic offset per
dimension. With balanced witness voting, the implied
witness-minus-self z-difference is approximately:

| Dimension       | Offset (witness − self z) |
|-----------------|---------------------------|
| Bond (A)        | −1.55                     |
| Vision (O)      | −1.17                     |
| Discipline (C)  | −1.13                     |
| Presence (E)    | −0.42                     |
| Depth (N)       | +0.28                     |

These offsets are an artefact of the comparison, not a property of
the witness's perception. For this reason, the Full Moon report
does not display witness-vs-self comparisons as absolute z-score
differences. Comparisons are expressed structurally — as relative
rankings of archetypes — which do not depend on the comparability
of the two scales.

Witness-specific normative statistics (NORM_MEAN, NORM_SD per
dimension, derived from empirical witness data) will replace the
IPIP-NEO priors for witness-scoring purposes at N≥200 (see
Validation plan).

---

## Full Moon report methodology

The Full Moon report is the final user-facing artefact of the
Cèrcol pipeline. It synthesises self-report and witness data
into a comparison of perceived archetypes.

### Why archetypes, not dimensions

The OCEAN dimensions are the internal mathematics of role
assignment, not the product surface. Users do not identify with a
score on Presence or Discipline; they identify with an archetype
(animal). The Full Moon report therefore compares the *relevant
archetypes* on each side (self and witness), not the dimension
rankings that produce those archetypes.

Comparing dimensions directly is also structurally unsound, given
the known systematic bias of witness scoring against IPIP-NEO
priors (see "Known systematic bias"). Comparing archetypes
sidesteps this problem because the archetype assignment is
determined by *which centroid each profile is closest to*, a
purely relative geometric question that does not depend on
matched normative scales.

### Relevance threshold

For each side (self, witness), the report displays only the
archetypes that *genuinely represent* the profile, determined by
a ratio-based threshold:

- If the top role's probability divided by the second role's
  probability is ≥ 1.5, only the top role is displayed (the
  profile is dominated by a single archetype).
- Otherwise, the report displays all archetypes whose probability
  exceeds max(0.10, top × 0.60), capped at 5.

The threshold is ratio-based rather than absolute because the
distribution of probabilities produced by softmax-over-Euclidean-
distance depends on the geometry of the 12 centroids in 5D
z-space. Absolute thresholds (e.g. "show all roles above 15%")
risk being either always or never met depending on calibration.
Ratio-based thresholds adapt to the shape of each individual
probability distribution.

The threshold parameters (1.5, 0.10, 0.60, 5) are working
defaults. Empirical calibration of these parameters against user
feedback and outcome data is part of the validation plan.

### Surprises

A "surprise" is an archetype that appears in one side's relevant
set but not the other's. The report displays surprises with their
direction (witness-only or self-only) and a brief characterisation:
the 5 adjectives from the witness corpus that most strongly
define that archetype.

The role-to-adjective mapping `ROLE_TOP_ADJECTIVES` is derived
from the role centroids and the witness corpus, as follows. For
each role R with centroid C_R = (z_E, z_A, z_O, z_C, z_N) and
each adjective A with factor F and valence V:

    fit(A, R) = z_R[F] × sign(V)

The fit score is positive when the adjective's pole matches the
sign of R's z-score on that adjective's factor. The top 5
adjectives for R are the 5 with the highest fit scores. Ties are
broken by id order, with semantic distinctiveness used as a
secondary criterion (e.g. preferring `creative` over `inventive`
when both have identical fit scores).

### Limitations

- The relevance threshold is heuristic. It has not been
  calibrated against empirical user data. A user whose
  probability distribution is unusual (very flat or very peaked)
  may receive a number of displayed archetypes that does not match
  their intuitive sense of self.
- The role-to-adjective mapping treats all adjectives within a
  factor group as having identical fit. In reality, AB5C
  cross-loadings mean some adjectives are more facet-specific
  than others. The mapping does not currently exploit this
  finer-grained structure.
- The comparison is qualitative (set-based and rank-based), not
  quantitative. Statements like "you are 30% more similar to your
  witnesses than the average user" cannot be derived from the
  current Full Moon report. Such statements would require
  population-level percentiles, which become available only at
  empirical calibration milestones (see Validation plan).

---

## Validation plan

- N≥100: review role distribution; flag if any centroid attracts an anomalous
  proportion of profiles
- N≥200: update normalisation priors (NORM_MEAN, NORM_SD) with sample
  statistics
- N≥200: derive witness-specific NORM_MEAN and NORM_SD per
  dimension from accumulated witness session data. Replace the
  IPIP-NEO priors as the comparison basis for witness scoring.
  Until this calibration is in place, witness/self comparisons
  remain structural (rank-based or set-based), not quantitative
  (z-score based).
- N≥300: run k-means (k=12) in 5D space; compare empirical vs theoretical
  centroids; adjust if divergence is systematic
- N≥300: regression g ~ assigned_role; if g has significant predictive power
  beyond OCEAN, integrate into centroid calculation
- If k-means suggests k≠12: revise taxonomy before any product changes

**Critical limitation**: the ground truth for validation is not the role
assignments Cèrcol has made to date — it is external data on actual team
behaviour. Accumulated data allows refinement of the model's internal geometry,
not validation of it as a predictor of team performance. This distinction is
fundamental and must be explicit in all scientific communication about
the project.

---

## Translation methodology

### Catalan/Valencian (CA) test items

The Catalan/Valencian translation of IPIP items in Cèrcol is in partial progress.

**Current state:**
All 190 items (10 TIPI + 60 IPIP-NEO-60 + 120 IPIP-NEO-120) are translated into Catalan/Valencian
and in production.

**Translation approach (when applied):** Same direct translation methodology as all other
languages — exact psychological meaning preserved, Valencian orthographic standard
(normativa de l'Acadèmia Valenciana de la Llengua), no regional softening or register
elevation that would affect construct measurement. Gender-inclusive Catalan forms
(e.g. -at/ada contracted as -at/da) used where the source item requires it.

**No published IPIP-CA validation study exists** at the time of writing. The translation
methodology follows the same principled approach as the other languages and is documented
here for transparency. Human review by a translator with psychometric context is required
before any item text enters the source files.

**Ongoing correction (planned):** A translation feedback mechanism for Catalan-speaking
users to suggest corrections is planned but not yet implemented. When it ships, suggestions
will be stored with `language: 'ca'` and reviewed by maintainers before any item text is
updated in the source files.

### Spanish (ES) test items

The Spanish translation of IPIP items used in Cèrcol follows a direct translation
approach from the English source items. IPIP items are in the public domain
(Goldberg et al. 2006), and Spanish adaptations are supported by published precedent.

**Source language:** English (ipip.ori.org public domain corpus)

**Translation approach:** Direct translation by a human translator with knowledge of
both the source language and the psychometric context of each item. The translation
preserves the precise psychological meaning of each item without softening, strengthening,
or reframing the construct being measured. Neutral international Spanish is used — neither
localised regionalisms nor formal register that would increase perceived test-taking
difficulty. Gender-inclusive forms (e.g. the slash notation -o/a) are used where the
source item's meaning requires it.

**Precedent:** Cupani, M., Pilatti, A., Urrizaga, A., Chincolla, A., &
Richaud de Minzi, M. C. (2014). Inventario de Personalidad IPIP-NEO: estudios
preliminares de adaptación al español en estudiantes argentinos.
*Revista Mexicana de Investigación en Psicología, 6*(1), 55–73. A Spanish
adaptation of the IPIP-NEO for Argentine students, following the same
item-level translation approach. Note what it does and does not establish: it
covers the 300-item IPIP-NEO rather than the 60-item version Cèrcol uses, its
authors describe it as preliminary, and several scales are flagged there for
revision. It is a precedent for the method, not evidence that the structure
replicates.
This is not a formally validated translation — it is a principled open-source translation
of public-domain items, documented as such.

**Ongoing correction (planned):** A translation feedback mechanism for Spanish-speaking
users to suggest corrections to individual items is planned but not yet implemented. When
it ships, suggestions will be stored with the `language` field set to `'es'` and reviewed
by maintainers before any item text is updated in the source files.

### French (FR) test items

The French translation of IPIP items used in Cèrcol follows the same direct translation
methodology as the Spanish adaptation.

**Source language:** English (ipip.ori.org public domain corpus)

**Translation approach:** Direct translation preserving the precise psychological meaning
of each item. Neutral European French is used — no regional variants (not Québécois),
no register elevation that would affect construct measurement. Gender-inclusive forms
(e.g. the mid-dot notation -·e) are used where the source item's meaning requires it.

**Scientific basis:** The French adaptation of the IPIP is the adaptation by Thiry, B.,
& Piolti, M. (2023), University of Mons, a documented European-French IPIP adaptation
listed on ipip.ori.org. The item-level translation methodology is documented, and
Cèrcol's translation follows the same item-level approach.
This is not a formally validated translation — it is a principled open-source translation
of public-domain items, documented as such.

**Ongoing correction (planned):** A translation feedback mechanism is planned but not yet
implemented. When it ships, suggestions will be stored with the `language` field set to
`'fr'` and reviewed by maintainers before any item text is updated in the source files.

### German (DE) test items

The German translation of IPIP items used in Cèrcol follows the same direct translation
methodology as the Spanish and French adaptations.

**Source language:** English (ipip.ori.org public domain corpus)

**Translation approach:** Direct translation preserving the precise psychological meaning
of each item. Standard High German (Hochdeutsch) is used — no regional variants (not
Austrian, not Swiss German), neutral register. Gender-inclusive forms are used where
the source item's meaning requires it.

**Scientific basis:** German adaptations of the IPIP are referenced in the published
psychometric literature and listed on ipip.ori.org. The five-factor structure replicates
in German-speaking populations (see e.g. Ostendorf & Angleitner 1994 for the German
NEO-PI-R). Cèrcol's translation follows the same item-level direct translation methodology.
This is not a formally validated translation — it is a principled open-source translation
of public-domain items, documented as such.

**Ongoing correction (planned):** A translation feedback mechanism is planned but not yet
implemented. When it ships, suggestions will be stored with the `language` field set to
`'de'` and reviewed by maintainers before any item text is updated in the source files.

### Danish (DA) test items

The Danish translation of IPIP items used in Cèrcol is based on the Vedel, Gøtzsche-Astrup
& Holm (2018) validated Danish IPIP-NEO-120 adaptation, published in *Nordic Psychology* and
listed on ipip.ori.org. This is the strongest scientific basis of any Cèrcol language after
English: the full five-factor structure has been validated in a Danish population with the
specific IPIP-NEO-120 item set.

**Source language:** English (ipip.ori.org public domain corpus)

**Translation approach:** Direct translation following the Vedel et al. (2018) methodology.
Standard Danish (Rigsdansk) is used — no regional variants (not Faroese, not Greenlandic).
Gender-neutral or inclusive forms are used where the source item requires it.

**Altered items (Vedel et al. 2018):** Two items in the Values/Compass facet were altered
for legal reasons related to Danish voting behaviour context. For the item originally reading
"Tend to vote for conservative political candidates.", the Danish translation uses the source
"View myself as predominantly conservative politically." (Vedel formulation) rather than the
original voting formulation. If a liberal item is added in a future update, the same alteration
applies: "View myself as predominantly liberal politically."

This is not a formally validated translation — it is a principled open-source translation
of public-domain items, following the Vedel et al. methodology, documented as such.

**Ongoing correction (planned):** A translation feedback mechanism is planned but not yet
implemented. When it ships, suggestions will be stored with the `language` field set to
`'da'` and reviewed by maintainers before any item text is updated in the source files.

---

## References

- Cupani, M., Pilatti, A., Urrizaga, A., Chincolla, A., & Richaud de Minzi,
  M. C. (2014). Inventario de Personalidad IPIP-NEO: estudios preliminares de
  adaptación al español en estudiantes argentinos. *Revista Mexicana de
  Investigación en Psicología, 6*(1), 55–73.
  https://doi.org/10.32870/rmip.vi.303

- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions
  and job performance: A meta-analysis. *Personnel Psychology, 44*(1), 1–26.
  https://doi.org/10.1111/j.1744-6570.1991.tb00688.x

- Bell, S. T. (2007). Deep-level composition variables as predictors of team
  performance: A meta-analysis. *Journal of Applied Psychology, 92*(3), 595–615.
  https://doi.org/10.1037/0021-9010.92.3.595

- Condon, D. M., & Revelle, W. (2014). The International Cognitive Ability
  Resource. *Intelligence, 46*, 79–90.
  https://doi.org/10.1016/j.intell.2014.01.004

- Goldberg, L. R., Johnson, J. A., Eber, H. W., Hogan, R., Ashton, M. C.,
  Cloninger, C. R., & Gough, H. G. (2006). The International Personality Item
  Pool and the future of public-domain personality measures. *Journal of Research
  in Personality, 40*(1), 84–96.
  https://doi.org/10.1016/j.jrp.2005.08.007

- Gosling, S. D., Rentfrow, P. J., & Swann, W. B., Jr. (2003). A very brief
  measure of the Big Five personality domains. *Journal of Research in
  Personality, 37*, 504–528.
  https://doi.org/10.1016/S0092-6566(03)00046-1

- Halfhill, T., Sundstrom, E., Lahner, J., Calderone, W., & Nielsen, T. M.
  (2005). Group personality composition and group effectiveness. *Small Group
  Research, 36*(1), 83–105.
  https://doi.org/10.1177/1046496404268538

- Hofstee, W. K. B., De Raad, B., & Goldberg, L. R. (1992). Integration of
  the Big Five and circumplex approaches to trait structure. *Journal of
  Personality and Social Psychology, 63*, 146–163.
  https://doi.org/10.1037/0022-3514.63.1.146

- Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with
  a 120-item public domain inventory. *Journal of Research in Personality, 51*,
  78–89.
  https://doi.org/10.1016/j.jrp.2014.05.003

- Maples-Keller, J. L., Williamson, R. L., Sleep, C. E., Carter, N. T.,
  Campbell, W. K., & Miller, J. D. (2019). Using item response theory to develop
  a 60-item representation of the NEO PI-R using the International Personality
  Item Pool. *Journal of Personality Assessment, 101*(1), 4–15.
  https://doi.org/10.1080/00223891.2017.1381968

- Neuman, G. A., & Wright, J. (1999). Team effectiveness: Beyond skills and
  cognitive ability. *Journal of Applied Psychology, 84*(3), 376–389.
  https://doi.org/10.1037/0021-9010.84.3.376

- Ostendorf, F., & Angleitner, A. (1994). A comparison of different instruments
  proposed to measure the Big Five. *European Review of Applied Psychology,
  44*(1), 45–53. [German NEO-PI-R validation establishing five-factor replication
  in German-speaking populations.]

- Peeters, M. A. G., Van Tuijl, H. F. J. M., Rutte, C. G., & Reymen, I. M. M. J.
  (2006). Personality and team performance: A meta-analysis. *European Journal
  of Personality, 20*(5), 377–396. https://doi.org/10.1002/per.588
- Thiry, B., & Piolti, M. (2023). *Adaptation française de l'IPIP* [French
  adaptation of the IPIP]. University of Mons. A documented European-French
  IPIP adaptation listed on ipip.ori.org.

- Vedel, A., Gøtzsche-Astrup, O., & Holm, P. (2018). The Danish IPIP-NEO-120:
  A free, validated five-factor measure of personality. *Nordic Psychology,
  71*(1), 62–77.
  https://doi.org/10.1080/19012276.2018.1470553