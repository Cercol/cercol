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
the AB5C circumplex structure (Hofstee et al. 1992). The selection of P, B and V
as balance dimensions is grounded in Bell (2007) and Neuman & Wright (1999).
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

The translation from AB5C facets to team effects is grounded in the OCEAN team
composition literature, primarily Bell (2007) and Neuman & Wright (1999). This
is a composition of two evidence bases — AB5C structure and team-level OCEAN
effects — not direct evidence of team roles. It is the most principled inference
available from existing literature.

The system is a working hypothesis, not a validated instrument. All design
decisions are documented and open to refutation.

### Why three balance dimensions

The team composition literature identifies three OCEAN dimensions with a clear
balance effect: teams need representation at both poles.

- **Presence (E)**: initiative and listening must coexist. A team high in
  Presence consumes oxygen; a team low in Presence stalls.
- **Bond (A)**: cohesion without confrontation produces groupthink. Confrontation
  without cohesion destroys. Both poles are necessary.
- **Vision (O)**: innovation without pragmatism never lands. Pragmatism without
  innovation repeats mistakes. No healthy team is homogeneous in Vision.

### Why C and N are not balance dimensions

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

There is evidence that g moderates how an OCEAN profile expresses itself in team
contexts (Furnham, Crump & Whelan 1997; Halfhill et al. 2005), but no study has
integrated AB5C and g to define team roles. Adding g to centroids without specific
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

## Normative priors (IPIP-NEO, 1–5 scale)

Source: Johnson (2014) doi:10.1016/j.jrp.2014.05.003;
        Maples-Keller et al. (2019) doi:10.1080/00223891.2018.1467425

| Factor | Domain     | NORM_MEAN | NORM_SD |
|--------|------------|-----------|---------|
| E      | presence   |   3.3     |  0.72   |
| A      | bond       |   3.9     |  0.58   |
| C      | discipline |   3.7     |  0.62   |
| N      | depth      |   2.8     |  0.72   |
| O      | vision     |   3.7     |  0.60   |

Replace with sample means/SDs at N≥200.

---

## Witness Cèrcol scoring

Implemented in `src/utils/witness-scoring.js`.
Source corpus in `src/data/witness-adjectives.js`.

**Round structure:** 5 adjectives per round (one per OCEAN factor), 20 rounds
total. Witness picks one best fit and one worst fit per round.

**Per-factor vote calculation:**
- Best pick of adjective with valence V on factor F → votes[F] += V
- Worst pick of adjective with valence V on factor F → votes[F] -= V
- Neither picked → 0 contribution

**Domain score:** score[F] = clamp(3 + (sum_votes[F] / N_rounds) × 2, 1, 5)
Centred at 3 (neutral), range [1, 5], compatible with self-report scale.

**Round polarity:** fixed 20-round sequence, 15 positive and 5 negative
rounds (75/25 split). Positive and negative poles never mixed within a round.
N factor is inverted: N− is the positive pole, N+ is the negative pole.
The 100 adjectives in the corpus are distributed as 20 per factor with a
10:10 valence split, so each adjective appears in exactly one round across
the 20-round sequence.

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

**Ongoing correction:** The translation feedback system allows Catalan-speaking users to
suggest corrections. Feedback is stored in the PostgreSQL backend with `language: 'ca'`
and reviewed by maintainers before any item text is updated in the source files.

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

**Validation precedent:** Cupani, M., de Minzi, M. C. R., Pérez, E. R., & Pjurisdición, M. A. (2014).
An assessment of a short measure of personality: The IPIP-NEO-60 in an Argentine sample.
*Psychological Reports, 114*(3), 777–797. This study validated an Argentine Spanish adaptation
of the IPIP-NEO, establishing that the five-factor structure replicates in Spanish-speaking
populations. Cèrcol's translation follows the same item-level translation methodology.
This is not a formally validated translation — it is a principled open-source translation
of public-domain items, documented as such.

**Ongoing correction:** The translation feedback system (visible on all instrument pages)
allows Spanish-speaking users to suggest corrections to individual items. Feedback is
stored in the PostgreSQL backend with the `language` field set to `'es'` and reviewed by
maintainers before any item text is updated in the source files.

### French (FR) test items

The French translation of IPIP items used in Cèrcol follows the same direct translation
methodology as the Spanish adaptation.

**Source language:** English (ipip.ori.org public domain corpus)

**Translation approach:** Direct translation preserving the precise psychological meaning
of each item. Neutral European French is used — no regional variants (not Québécois),
no register elevation that would affect construct measurement. Gender-inclusive forms
(e.g. the mid-dot notation -·e) are used where the source item's meaning requires it.

**Scientific basis:** The French adaptation of the IPIP is the adaptation by Thiry, B.,
& Piolti, M. (2023), University of Mons, listed on ipip.ori.org as a peer-reviewed
adaptation. This constitutes a stronger published scientific basis than the Spanish
adaptation: the five-factor structure has been validated in French-speaking populations
and the item-level translation methodology is documented. Cèrcol's translation follows
the same item-level approach.
This is not a formally validated translation — it is a principled open-source translation
of public-domain items, documented as such.

**Ongoing correction:** Feedback is stored in the PostgreSQL backend with the `language`
field set to `'fr'` and reviewed by maintainers before any item text is updated in the
source files.

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

**Ongoing correction:** Feedback is stored in the PostgreSQL backend with the `language`
field set to `'de'` and reviewed by maintainers before any item text is updated in the
source files.

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

**Ongoing correction:** Feedback is stored in the PostgreSQL backend with the `language`
field set to `'da'` and reviewed by maintainers before any item text is updated in the
source files.

---

## References

- Cupani, M., de Minzi, M. C. R., Pérez, E. R., & Pjurisdición, M. A. (2014).
  An assessment of a short measure of personality: The IPIP-NEO-60 in an
  Argentine sample. *Psychological Reports, 114*(3), 777–797.
  https://doi.org/10.2466/03.PR0.114k25w4

- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions
  and job performance: A meta-analysis. *Personnel Psychology, 44*(1), 1–26.
  https://doi.org/10.1111/j.1744-6570.1991.tb00688.x

- Bell, S. T. (2007). Deep-level composition variables as predictors of team
  performance: A meta-analysis. *Journal of Applied Psychology, 92*(3), 595–615.
  https://doi.org/10.1037/0021-9010.92.3.595

- Condon, D. M., & Revelle, W. (2014). The International Cognitive Ability
  Resource. *Intelligence, 46*, 79–90.
  https://doi.org/10.1016/j.intell.2014.05.004

- Furnham, A., Crump, J., & Whelan, J. (1997). Personality, type A behaviour
  and work success. *European Journal of Personality, 11*(3), 201–213.
  https://doi.org/10.1002/(SICI)1099-0984(199709)11:3<201::AID-PER286>3.0.CO;2-C

- Goldberg, L. R., Johnson, J. A., Eber, H. W., Hogan, R., Ashton, M. C.,
  Cloninger, C. R., & Gough, H. C. (2006). The International Personality Item
  Pool and the future of public-domain personality measures. *Journal of Research
  in Personality, 40*, 84–96.
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
  Item Pool. *Psychological Assessment, 31*(2), 188–203.
  https://doi.org/10.1037/pas0000544

- Neuman, G. A., & Wright, J. (1999). Team effectiveness: Beyond skills and
  cognitive ability. *Journal of Applied Psychology, 84*(3), 376–389.
  https://doi.org/10.1037/0021-9010.84.3.376

- Ostendorf, F., & Angleitner, A. (1994). A comparison of different instruments
  proposed to measure the Big Five. *European Review of Applied Psychology,
  44*(1), 45–53. [German NEO-PI-R validation establishing five-factor replication
  in German-speaking populations.]

- Thiry, B., & Piolti, M. (2023). *Adaptation française de l'IPIP* [French
  adaptation of the IPIP]. University of Mons. Listed on ipip.ori.org as a
  peer-reviewed French IPIP adaptation.

- Vedel, A., Gøtzsche-Astrup, O., & Holm, P. (2018). The Danish IPIP-NEO-120:
  A free, validated five-factor measure of personality. *Nordic Psychology,
  71*(1), 62–77.
  https://doi.org/10.1080/19012276.2018.1470108