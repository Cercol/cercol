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

Role taxonomy is derived from the AB5C circumplex (Hofstee, De Raad & Goldberg 1992),
not from Belbin. Belbin is referenced for comparison only.
The model is empirically grounded: hypothesis defined from literature,
validated and refined as real data accumulates.

Two meta-axes from Digman (1997) define the role space:
  α = (z_A + z_E − z_N) / 3   — socialisation axis
  β = (z_C + z_O) / 2          — efficacy/growth axis

Used for visualisation only. Role assignment is always computed in full 5D space.

---

## Scoring pipeline (v1 — theoretical centroids)

Implemented in `src/utils/role-scoring.js`.

**Step 1** — Normalise OCEAN scores to z-scores using per-domain published priors
  (Johnson 2014; Maples-Keller et al. 2019; replaced by sample stats at N≥200)

**Step 2** — Centre rule: if max(|z|) < 0.5 → assign R0 directly

**Step 3** — Euclidean distance to all 9 theoretical centroids → minimum-distance role
  d(profile, centroid) = sqrt(Σ(z_i − c_i)²) for i in {E, A, C, N, O}

**Step 4** — Softmax over negative distances → full probability map
  Roles with prob > 15% = personal arc

**Step 5** — Digman α/β projection (display only; currently unused in UI)

OCEAN factor → Cèrcol domain key mapping:
  E = presence   A = bond   C = discipline   N = depth   O = vision

---

## Normative priors (IPIP-NEO, 1–5 scale)

Source: Johnson (2014) doi:10.1016/j.jrp.2014.05.003;
        Maples-Keller et al. (2019) doi:10.1080/00223891.2018.1467425
Approximate cross-study means for general adult samples.

| Factor | Domain     | NORM_MEAN | NORM_SD |
|--------|------------|-----------|---------|
| E      | presence   |   3.3     |  0.72   |
| A      | bond       |   3.9     |  0.58   |
| C      | discipline |   3.7     |  0.62   |
| N      | depth      |   2.8     |  0.72   |
| O      | vision     |   3.7     |  0.60   |

Replace with sample means/SDs at N≥200.

---

## Theoretical centroids (v1 — to be replaced by empirical centroids at N≥300)

Order: [E, A, C, N, O] = [presence, bond, discipline, depth, vision]

| Role | z_E  | z_A  | z_C  | z_N  | z_O  |
|------|------|------|------|------|------|
| R0   |  0.0 |  0.0 |  0.0 |  0.0 |  0.0 |
| R1   | +1.2 |  0.0 | +1.0 |  0.0 | +0.5 |
| R2   | +1.2 | +0.8 |  0.0 | -0.8 |  0.0 |
| R3   | +0.8 | -1.0 |  0.0 | +0.5 |  0.0 |
| R4   |  0.0 | +1.0 | +1.0 | -0.5 |  0.0 |
| R5   | -0.8 | +1.2 | -0.5 |  0.0 |  0.0 |
| R6   |  0.0 | -0.5 | +1.0 | +0.8 |  0.0 |
| R7   |  0.0 | +0.5 | +0.5 |  0.0 | +1.2 |
| R8   | +0.5 |  0.0 |  0.0 | -0.5 | +1.2 |

Centroids are theoretical approximations derived from AB5C sector midpoints.
Replace with k-means centroids when N≥300 real profiles available.

---

## Witness Cèrcol scoring

Implemented in `src/utils/witness-scoring.js`. Source corpus in `src/data/witness-adjectives.js`.

**Round structure:** 5 adjectives per round (one per OCEAN factor), 20 rounds total.
Witness picks one BEST fit and one WORST fit per round.

**Per-factor vote calculation:**
- BEST pick of adjective with valence V on factor F → votes[F] += V
- WORST pick of adjective with valence V on factor F → votes[F] -= V
- Neither picked → 0 contribution

**Domain score:** score[F] = clamp(3 + (sum_votes[F] / N_rounds) × 2, 1, 5)
- Centred at 3 (neutral), range [1, 5], compatible with self-report scale.

**Divergence detection:** |self_z − witness_z| > 0.8 per domain → flagged as blind spot.
Threshold is configurable; 0.8 is the default (approximately 1 SD difference).

**Round selection:** shuffled-cycle algorithm — each factor's adjective list is shuffled
independently; rounds take one adjective per factor in sequence, reshuffling when exhausted.
This ensures no adjective repeats before all 20 in a factor are used.

---

## Validation plan

- At N≥100: check role distribution; flag if R3 shows a bimodal profile pattern
- At N≥200: update normalisation priors to sample mean/SD per domain
- At N≥300: run k-means (k=9), compare empirical vs theoretical centroids
- If empirical k suggests k≠9: revise taxonomy before Full Moon launch

---

## Technical notes

- Cèrcol First Quarter uses 2 items per facet from the IPIP-NEO-60
  (Maples-Keller et al. 2019). Adequate for feedback purposes,
  not for clinical assessment.
- Cèrcol New Moon uses 10 items across 5 domains (no facets).
  Designed for quick orientation, not detailed profiling.
- GitHub Pages + React Router: 404.html redirect workaround in place
  for direct URL access (share links, bookmarks).
- Result logging and translation feedback use Supabase (anon key,
  RLS-protected inserts). Fire-and-forget, never block UI.

---

## Academic sources

- TIPI: Gosling et al. (2003), J. Research in Personality, 37, 504–528
- IPIP: Goldberg et al. (2006), doi:10.1177/1073191106293419
  Full item pool: https://ipip.ori.org
- ICAR: Condon & Revelle (2014), Intelligence, 46, 79–90
- AB5C: Hofstee, De Raad & Goldberg (1992),
  J. Personality and Social Psychology, 63, 146-163
  IPIP AB5C markers: https://ipip.ori.org
- Digman meta-factors: Digman (1997), JPSP 73, 1246-1256
- Independent team role circumplex: Nestsiarovich & Pons (2020), PMC7071388
- AB5C short form validation: Lanning et al. (2020), JSCP
- Normative priors: Johnson (2014) doi:10.1016/j.jrp.2014.05.003;
  Maples-Keller et al. (2019) doi:10.1080/00223891.2018.1467425
- Team roles (comparison only): Belbin (1981), Neuman & Wright (1999),
  Fisher, Hunter & Macrosson (1998-2002)
