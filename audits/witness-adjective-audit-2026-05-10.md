# Witness Adjective Audit — 2026-05-10

**File audited:** `src/data/witness-adjectives.js`  
**Auditor:** Read-only analysis; no source files modified.  
**Oracle norms source:** `tests/role-oracle.json` (committed 2026-05-10, merge `a69ef73`)  
**Scoring formula source:** Audit-v2 session memory (line 127 of `src/utils/witness-scoring.js`); not re-read in this session — marked where relevant.

---

## 1. Source Data Summary

### Schema

Every entry in `WITNESS_ADJECTIVES` (lines 23–141) carries exactly these fields:

| Field    | Type              | Domain / Notes |
|----------|-------------------|----------------|
| `id`     | string            | Format `{factor}{sign}{nn}` e.g. `E+01`, `N-07`. Sign is `+` (high on factor) or `-` (low on factor). |
| `en`     | string            | English adjective text |
| `ca`     | string            | Catalan adjective text |
| `factor` | string (1 char)   | `E` \| `A` \| `C` \| `N` \| `O` (single factor, no blends) |
| `valence`| integer           | `+1` or `-1` |
| `tip`    | object `{en, ca}` | Short explanatory phrase for hover UI |

**Fields that do NOT exist:** `polarity` (the file header says "polarity convention" but the schema field is `valence`), `intensity`, `weight`, `secondaryFactor`.

### File-level totals

- **Total adjectives:** 100 (confirmed: `grep -c "valence:"` = 100)
- Per factor: 20 each (10 valence +1, 10 valence −1)
- Factors covered: E (Presence), A (Bond), C (Discipline), N (Depth), O (Vision)

### Polarity convention — N is inverted (file header, lines 14–17)

```
Positive pole: E+, A+, C+, N−, O+  (high E/A/C/O, low N)
Negative pole: E−, A−, C−, N+, O−  (low E/A/C/O, high N)
```

For **all factors except N**, `valence: +1` = high factor = Cèrcol positive pole.  
For **N (Depth)**, `valence: +1` = HIGH neuroticism = Cèrcol **negative** pole; `valence: −1` = LOW neuroticism = Cèrcol positive pole.  
This inversion is documented in the file header but is **not** reflected in the `valence` field — witnesses (and scoring code) must handle it explicitly.

### First 5 entries (lines 23–27)

```js
{ id: 'E+01', en: 'outgoing',     ca: 'obert',      factor: 'E', valence: +1, tip: {…} }
{ id: 'E+02', en: 'talkative',    ca: 'comunicatiu', factor: 'E', valence: +1, tip: {…} }
{ id: 'E+03', en: 'assertive',    ca: 'assertiu',    factor: 'E', valence: +1, tip: {…} }
{ id: 'E+04', en: 'enthusiastic', ca: 'entusiasta',  factor: 'E', valence: +1, tip: {…} }
{ id: 'E+05', en: 'sociable',     ca: 'sociable',    factor: 'E', valence: +1, tip: {…} }
```

### Last 5 entries (lines 136–140)

```js
{ id: 'O-06', en: 'straightforward', ca: 'directe',    factor: 'O', valence: -1, tip: {…} }
{ id: 'O-07', en: 'concrete',        ca: 'concret',    factor: 'O', valence: -1, tip: {…} }
{ id: 'O-08', en: 'conservative',    ca: 'conservador',factor: 'O', valence: -1, tip: {…} }
{ id: 'O-09', en: 'routine',         ca: 'rutinari',   factor: 'O', valence: -1, tip: {…} }
{ id: 'O-10', en: 'predictable',     ca: 'previsible', factor: 'O', valence: -1, tip: {…} }
```

---

## 2. Per-Dimension Tables

**Note:** No `intensity` field exists in the schema. The "Intensity" column is omitted throughout. "SD flag" column notes social-desirability concerns (see §3 for methodology).

### 2.1 E / Presence

#### Positive pole — high extraversion (valence +1)

| ID    | Adjective (EN) | Adjective (CA) | SD flag |
|-------|----------------|----------------|---------|
| E+01  | outgoing       | obert          | — |
| E+02  | talkative      | comunicatiu    | — |
| E+03  | assertive      | assertiu       | — |
| E+04  | enthusiastic   | entusiasta     | — |
| E+05  | sociable       | sociable       | — |
| E+06  | lively         | animat         | — |
| E+07  | expressive     | expressiu      | — |
| E+08  | bold           | audaç          | — |
| E+09  | energetic      | enèrgic        | — |
| E+10  | gregarious     | gregari        | — |

#### Negative pole — low extraversion (valence −1)

| ID    | Adjective (EN) | Adjective (CA) | SD flag |
|-------|----------------|----------------|---------|
| E-01  | reserved       | reservat       | — |
| E-02  | quiet          | callat         | — |
| E-03  | withdrawn      | retraït        | — |
| E-04  | shy            | tímid          | — |
| E-05  | reflective     | reflexiu       | ⚠ high positive desirability |
| E-06  | solitary       | solitari       | — |
| E-07  | private        | discret        | — |
| E-08  | subdued        | contingut      | — |
| E-09  | reticent       | reticent       | — |
| E-10  | contemplative  | contemplatiu   | ⚠ high positive desirability |

**E-05 note:** "Reflective" and "contemplative" (E-10) are widely valued as positive intellectual traits. A witness endorsing these is signalling admiration as much as accurately rating low extraversion. They also carry a secondary O+ loading in AB5C circumplex models (not captured in the single-factor schema).

---

### 2.2 A / Bond

#### Positive pole — high agreeableness (valence +1)

| ID    | Adjective (EN)  | Adjective (CA)   | SD flag |
|-------|-----------------|------------------|---------|
| A+01  | warm            | càlid            | — |
| A+02  | caring          | atent            | — |
| A+03  | generous        | generós          | — |
| A+04  | cooperative     | cooperatiu       | — |
| A+05  | trusting        | confiat          | — |
| A+06  | empathetic      | empàtic          | — |
| A+07  | supportive      | solidari         | — |
| A+08  | compassionate   | compassiu        | — |
| A+09  | considerate     | considerador     | — |
| A+10  | kind            | amable           | — |

#### Negative pole — low agreeableness (valence −1)

| ID    | Adjective (EN)  | Adjective (CA)   | SD flag |
|-------|-----------------|------------------|---------|
| A-01  | critical        | crític           | — |
| A-02  | competitive     | competitiu       | ⚠ positive in professional contexts |
| A-03  | stubborn        | tossut           | — |
| A-04  | demanding       | exigent          | — |
| A-05  | argumentative   | argumentatiu     | — |
| A-06  | skeptical       | escèptic         | — |
| A-07  | blunt           | directe          | ⚠ often perceived as honest/positive; **CA collision** with O-06 |
| A-08  | detached        | distanciat       | — |
| A-09  | independent     | independent      | ⚠ strongly positive in most contexts |
| A-10  | challenging     | desafiant        | ⚠ positive in leadership/coaching contexts |

**A-07 CA collision:** `blunt` (A-07) and `straightforward` (O-06) both translate to `ca: 'directe'` (lines 65 and 136). In the Catalan instrument, these two adjectives from different factors are indistinguishable to the witness. This is a **construct validity defect** in the Catalan version.

---

### 2.3 C / Discipline

#### Positive pole — high conscientiousness (valence +1)

| ID    | Adjective (EN) | Adjective (CA)   | SD flag |
|-------|----------------|------------------|---------|
| C+01  | organized      | organitzat       | — |
| C+02  | diligent       | diligent         | — |
| C+03  | reliable       | fiable           | — |
| C+04  | thorough       | exhaustiu        | — |
| C+05  | structured     | estructurat      | — |
| C+06  | focused        | enfocat          | — |
| C+07  | methodical     | metòdic          | — |
| C+08  | responsible    | responsable      | — |
| C+09  | persistent     | persistent       | — |
| C+10  | precise        | precís           | — |

#### Negative pole — low conscientiousness (valence −1)

| ID    | Adjective (EN) | Adjective (CA)   | SD flag |
|-------|----------------|------------------|---------|
| C-01  | impulsive      | impulsiu         | — |
| C-02  | scattered      | dispersat        | — |
| C-03  | careless       | descurat         | — |
| C-04  | disorganized   | desorganitzat    | — |
| C-05  | spontaneous    | espontani        | ⚠ strongly positive in common usage |
| C-06  | flexible       | flexible         | ⚠ highly valued in professional contexts |
| C-07  | casual         | casual           | ⚠ mildly positive / neutral |
| C-08  | carefree       | despreocupat     | ⚠ positive in leisure contexts |
| C-09  | informal       | informal         | neutral-to-positive |
| C-10  | adaptable      | adaptable        | ⚠ strongly positive; a sought-after trait |

**C- concern (highest priority):** 5 of 10 negative-pole adjectives (C-05, C-06, C-08, C-09, C-10) carry positive social desirability in the contexts where witnesses typically know the ratee (teams, workplaces). A witness observing a genuinely low-C colleague may hesitate to endorse "flexible" or "adaptable" as a marker of low discipline.

---

### 2.4 N / Depth

**Polarity reminder:** For this dimension, `valence: +1` = HIGH neuroticism = Cèrcol **negative** pole. `valence: −1` = LOW neuroticism = Cèrcol **positive** pole. The table labels reflect this.

#### High neuroticism (valence +1 = Cèrcol negative pole)

| ID    | Adjective (EN) | Adjective (CA) | SD flag |
|-------|----------------|----------------|---------|
| N+01  | anxious        | ansiós         | — |
| N+02  | sensitive      | sensible       | ⚠ widely positive; literature mixed on N loading |
| N+03  | worried        | preocupat      | — |
| N+04  | reactive       | reactiu        | — |
| N+05  | emotional      | emocional      | ⚠ neutral-to-positive in many contexts |
| N+06  | tense          | tens           | — |
| N+07  | vigilant       | vigilant       | ⚠ clearly positive (attentive, careful) |
| N+08  | intense        | intens         | ⚠ often admired in professional settings |
| N+09  | restless       | inquiet        | — |
| N+10  | troubled       | pertorbat      | — |

#### Low neuroticism (valence −1 = Cèrcol positive pole)

| ID    | Adjective (EN) | Adjective (CA)   | SD flag |
|-------|----------------|------------------|---------|
| N-01  | stable         | estable          | — |
| N-02  | composed       | serè             | — |
| N-03  | resilient      | resilient        | — |
| N-04  | grounded       | arrelat          | — |
| N-05  | unflappable    | impertorbable    | — |
| N-06  | secure         | segur            | — |
| N-07  | steady         | ferm             | — |
| N-08  | serene         | tranquil         | — |
| N-09  | patient        | pacient          | — |
| N-10  | levelheaded    | equilibrat       | — |

**N+02 note:** "Sensitive" is contested in the Big Five literature as a high-N marker. Some frameworks place emotional sensitivity closer to a neutral A or O facet. Its inclusion as a high-N adjective may inflate N witness scores for empathic targets.

**N+07 note:** "Vigilant" loads on high alertness/anxiety in self-report IPIP items, but in a witness context the word primarily connotes positive attentiveness. A witness is unlikely to endorse "vigilant" as meaning "this person is anxious."

---

### 2.5 O / Vision

#### Positive pole — high openness (valence +1)

| ID    | Adjective (EN)  | Adjective (CA) | SD flag |
|-------|-----------------|----------------|---------|
| O+01  | creative        | creatiu        | — |
| O+02  | imaginative     | imaginatiu     | — |
| O+03  | curious         | curiós         | — |
| O+04  | inventive       | inventiu       | — |
| O+05  | original        | original       | — |
| O+06  | visionary       | visionari      | — |
| O+07  | artistic        | artístic       | — |
| O+08  | innovative      | innovador      | — |
| O+09  | perceptive      | perspicaç      | — |
| O+10  | unconventional  | heterodox      | — |

#### Negative pole — low openness (valence −1)

| ID    | Adjective (EN)  | Adjective (CA)   | SD flag |
|-------|-----------------|------------------|---------|
| O-01  | practical       | pràctic          | ⚠ strongly positive in most contexts |
| O-02  | conventional    | convencional     | — |
| O-03  | realistic       | realista         | ⚠ strongly positive |
| O-04  | traditional     | tradicional      | neutral |
| O-05  | pragmatic       | pragmàtic        | ⚠ strongly positive in professional contexts |
| O-06  | straightforward | directe          | ⚠ positive; **CA collision** with A-07 |
| O-07  | concrete        | concret          | ⚠ positive in professional contexts |
| O-08  | conservative    | conservador      | neutral-to-negative |
| O-09  | routine         | rutinari         | — |
| O-10  | predictable     | previsible       | — |

**O- concern (high priority):** 4 of 10 negative-pole adjectives (O-01, O-03, O-05, O-07) are strongly positively valued in the professional contexts where Cèrcol is used. A witness rating a low-O colleague may endorse "practical" and "pragmatic" as compliments, inflating the apparent Vision score.

---

## 3. Balance Diagnostics

### 3.1 Raw counts

| Dimension | Total | Valence +1 | Valence −1 | Ratio (+:−) | Diagnostic |
|-----------|-------|------------|------------|-------------|------------|
| E Presence    | 20 | 10 | 10 | 1.00 | ✓ |
| A Bond        | 20 | 10 | 10 | 1.00 | ✓ |
| C Discipline  | 20 | 10 | 10 | 1.00 | ✓ |
| N Depth       | 20 | 10 | 10 | 1.00 | ✓ |
| O Vision      | 20 | 10 | 10 | 1.00 | ✓ |
| **Total**     | **100** | **50** | **50** | **1.00** | — |

All dimensions are in exact 10:10 balance. No dimension triggers the ratio flag [outside 0.7, 1.4].

### 3.2 Intensity field

**The `intensity` field does not exist in the schema.** Mean intensity cannot be computed. The intensity diagnostic flag (means differ by > factor of 1.5) cannot be applied.

### 3.3 "14P/6N per polarity" memory note

The audit instructions reference a memory note of "14P/6N per polarity."

**This does not match the current data.** Every dimension has exactly 10 valence +1 and 10 valence −1 adjectives. No dimension has 14:6 in any counting scheme visible in the file. The note either:
- Refers to an earlier draft of `witness-adjectives.js` that was superseded, or
- Refers to a different quantity (e.g., some other grouping not present in the current schema), or
- Is erroneous.

The current file header (line 3) explicitly states: "100 adjectives, 20 per OCEAN factor, 10 positive (+1) and 10 negative (−1) valence." This is accurate.

### 3.4 Social-desirability imbalance (qualitative, not flagged by ratio)

Although the numerical balance is exact (10:10), a qualitative concern exists for three dimensions:

| Dimension | Direction of concern | Likely effect on expected mean |
|-----------|----------------------|-------------------------------|
| C Discipline | 5 of 10 negative-pole adjectives are socially desirable (spontaneous, flexible, carefree, informal, adaptable) | Witnesses endorse C− adjectives even for moderate-C targets → expected mean suppressed toward 3.0 |
| O Vision | 4 of 10 negative-pole adjectives are socially desirable (practical, realistic, pragmatic, concrete) | Same suppression mechanism → expected mean suppressed toward 3.0 |
| N Depth | 3 of 10 high-N adjectives carry positive connotations (sensitive, vigilant, intense) | Witnesses endorse N+ adjectives for non-neurotic targets → expected mean inflated above true N level |

E Presence and A Bond are less affected: E's negative-pole has two borderline words (reflective, contemplative), and A's positive pole (warm, caring, kind) is strongly differentiated from its negative pole, preserving signal.

---

## 4. Cross-Reference with IPIP-NEO Population Ordering

### 4.1 Target ordering from oracle norms

From `tests/role-oracle.json` norm_assumptions:

| Dimension | Mean | SD   |
|-----------|------|------|
| Bond (A)  | 3.9  | 0.58 |
| Vision (O)| 3.7  | 0.60 |
| Discipline (C) | 3.7 | 0.62 |
| Presence (E) | 3.3 | 0.72 |
| Depth (N) | 2.8  | 0.72 |

**Target ordering:** Bond > Vision = Discipline > Presence > Depth

### 4.2 Expected witness raw score under uniform voting

The witness scoring formula (audit-v2 session memory, `src/utils/witness-scoring.js` line 127):
```
raw_score = 3 + (votes[f] / n_witnesses) × 2
```
where `votes[f]` = net endorsements of positive-pole adjectives minus endorsements of negative-pole adjectives, across all witnesses.

Under perfectly uniform voting (each adjective endorsed by exactly 50% of witnesses regardless of factor):
- `votes[f] = (10 × 0.5n) − (10 × 0.5n) = 0` for every dimension f
- Expected raw score = **3.0 for all five dimensions**

Consequence: with a perfectly balanced adjective list and symmetric formula, **the adjective list alone cannot reproduce the IPIP-NEO population ordering.** The ordering must emerge from actual variance in witness observations. This is by design — the instrument measures individual variation, not population means.

### 4.3 Expected ordering under realistic (non-uniform) voting

Under realistic voting where social desirability of individual adjectives affects endorsement rates:

**Bond (A):** Positive-pole adjectives (warm, caring, compassionate, kind) are strongly positive and will receive high endorsement. Negative-pole adjectives (critical, demanding, argumentative) are clearly negative and will receive low endorsement in professional contexts. Net effect: expected mean **above 3.0** — ordering is preserved.

**Presence (E):** Positive pole (outgoing, enthusiastic, bold) and negative pole are reasonably symmetric in social desirability. Two negative-pole adjectives (reflective, contemplative) are positively regarded. Net effect: expected mean **near 3.0** — modest suppression from contemplative/reflective endorsement.

**Discipline (C):** As noted in §3.4, high social desirability of C− adjectives (flexible, adaptable) will cause extra endorsement on both sides. Expected mean **pulled toward 3.0** from above (C is a high-mean dimension at 3.7). **Risk of inversion with Presence** if suppression exceeds ~0.3 on the raw scale.

**Vision (O):** Similar mechanism to C. O− adjectives (practical, pragmatic) will be endorsed even for genuinely high-O targets. Expected mean **pulled toward 3.0** from above (O is a high-mean dimension at 3.7). **Risk of inversion with Presence** if suppression exceeds ~0.3.

**Depth (N):** At population level, N mean = 2.8 (below 3.0). Most observed people will genuinely score low-N. N+ adjectives (anxious, tense, troubled) will correctly receive low endorsement, pulling N score below 3.0. However, the three ambiguous N+ words (sensitive, vigilant, intense) will receive extra unwarranted endorsement, **partially inflating N** toward 3.0. Net direction: expected mean **below 3.0** but higher than the true population mean. Qualitatively, the N ordering (below Presence) is likely preserved, but the gap may be narrower than in self-report.

### 4.4 Predicted inversions

| Comparison | IPIP-NEO ordering | Predicted witness ordering | Inversion risk |
|------------|-------------------|---------------------------|----------------|
| Bond vs Presence | Bond > Presence (3.9 > 3.3) | Bond > Presence | Low — Bond bias robust |
| Vision vs Presence | Vision > Presence (3.7 > 3.3) | Vision ≈ Presence or Vision < Presence | **Medium — Vision may be suppressed below Presence** |
| Discipline vs Presence | Discipline > Presence (3.7 > 3.3) | Discipline ≈ Presence or Discipline < Presence | **Medium — Discipline may be suppressed below Presence** |
| Presence vs Depth | Presence > Depth (3.3 > 2.8) | Presence > Depth | Low — directional preserved |
| Vision vs Discipline | Vision = Discipline (3.7 = 3.7) | Vision ≈ Discipline | Low — both suppressed symmetrically |

**Summary:** The two most likely inversions are Vision < Presence and Discipline < Presence, caused by the positively-valenced low-O and low-C adjectives. These would be empirically detectable by comparing witness scores with self-report scores in a matched sample.

---

## 5. Candidate Edit Areas

These are diagnostic flags for human psychometric review. No specific replacement adjectives are proposed here.

### Priority 1 — C / Discipline negative pole (highest)

5 of 10 negative-pole adjectives carry strong positive social desirability in professional contexts:

| ID    | Adjective | Problem |
|-------|-----------|---------|
| C-05  | spontaneous | Near-universally positive; implies creativity and authenticity |
| C-06  | flexible    | Highly valued competency; most raters endorse this positively |
| C-08  | carefree    | Positive in many contexts; does not feel like a criticism |
| C-09  | informal    | Neutral-to-positive; reduces signal for low-C |
| C-10  | adaptable   | Valued leadership and professional trait |

**Recommended action for review:** Replace 2–3 of these with unambiguous low-C markers (e.g., words conveying unreliability, procrastination, negligence, inconsistency) after psychometric review.

### Priority 1 — O / Vision negative pole (highest)

4 of 10 negative-pole adjectives carry strong positive social desirability:

| ID    | Adjective       | Problem |
|-------|-----------------|---------|
| O-01  | practical       | Strong positive valence; implies effectiveness |
| O-03  | realistic       | Strong positive valence; implies sound judgment |
| O-05  | pragmatic       | Strong positive valence; highly valued in organisations |
| O-07  | concrete        | Positive; implies clarity and precision |

**Additional:** O-06 `straightforward` has the CA collision defect (see below).  
**Recommended action for review:** Replace 2–3 of these with unambiguous low-O markers (e.g., words conveying closed-mindedness, rigidity, lack of imagination).

### Priority 2 — N / Depth positive pole (high-N adjectives)

3 of 10 high-N adjectives carry ambiguous or positive social desirability:

| ID    | Adjective | Problem |
|-------|-----------|---------|
| N+02  | sensitive | Positive in common usage; psychometric loading on N is contested in some models |
| N+07  | vigilant  | Clearly positive (attentive, careful); unlikely to be read as anxious by a witness |
| N+08  | intense   | Often admired in professional settings; does not communicate neuroticism clearly |

**Recommended action for review:** Replace with clearer high-N markers (e.g., terms conveying irritability, moodiness, nervousness, volatility) that are less ambiguous in the witness context.

### Priority 2 — CA translation collision (construct validity defect)

| ID pair | EN text              | CA text (both) | Problem |
|---------|----------------------|----------------|---------|
| A-07 / O-06 | blunt / straightforward | directe / directe | Identical Catalan translations across different factors. A Catalan-language witness cannot distinguish these two adjectives. |

**Recommended action for review:** Assign distinct Catalan translations. Candidates for A-07: `franc`, `tallant`, `sense filtres`. Candidates for O-06: `directe`, `sense embuts`, `pràctic`.

### Priority 3 — E / Presence negative pole

| ID    | Adjective     | Problem |
|-------|---------------|---------|
| E-05  | reflective    | High positive desirability; likely secondary O+ loading in AB5C |
| E-10  | contemplative | High positive desirability; likely secondary O+ loading in AB5C |

**Recommended action for review:** Consider replacing with less cross-contaminated low-E markers (e.g., words emphasising preference for solitude or low social engagement without intellectual framing).

### Priority 3 — A / Bond negative pole

| ID    | Adjective    | Problem |
|-------|--------------|---------|
| A-02  | competitive  | Positive in professional contexts, especially teams |
| A-09  | independent  | Strongly positive in most framings |
| A-10  | challenging  | Positive in leadership/coaching contexts |

Less severe than C and O but worth reviewing if empirical data shows A scores suppressed.

### Priority 4 — Missing `intensity` / `weight` field

All 100 adjectives are treated as equally weighted in scoring. In practice, some adjectives are more behaviourally observable (e.g., "outgoing" is directly observable; "grounded" requires inference). Adding an optional `observability` or `weight` field could improve score reliability, especially for small witness pools (n ≤ 3).

### Priority 4 — No cross-loading / AB5C blend support

The schema assigns each adjective to exactly one `factor`. Several adjectives load on multiple factors in the AB5C circumplex (Hofstee et al., 1992). Confirmed examples:

| Adjective | Primary (file) | Secondary (AB5C) |
|-----------|---------------|------------------|
| assertive (E+03) | E | A+ blend |
| competitive (A-02) | A | E+ blend |
| reflective (E-05) | E | O+ blend |
| contemplative (E-10) | E | O+ blend |
| independent (A-09) | A | O+ or C+ blend |

These secondary loadings are currently silent; the scoring formula treats them as pure single-factor signals.

---

## 6. Open Questions for Human Review

1. **Scoring formula verification.** The formula `3 + (votes[f] / n) × 2` is sourced from audit-v2 session memory, not from a re-read of `src/utils/witness-scoring.js`. Before acting on §4 estimates, the actual formula should be confirmed and documented here.

2. **N (Depth) polarity convention in scoring code.** The `valence` field has `+1` = high-N (anxious) = Cèrcol negative pole. Does the scoring code invert this when computing the domain score for Depth, or does it treat all `valence: +1` adjectives as pulling toward positive? A mishandled inversion would cause Depth to be scored in the wrong direction. This needs direct verification against witness-scoring.js.

3. **"14P/6N per polarity" memory note origin.** The current file does not match this note. Was there an earlier version of `witness-adjectives.js` that had unbalanced counts? If so, that version may still exist in git history and may be worth recovering for context. Command: `git log --follow --all -- src/data/witness-adjectives.js`.

4. **Catalan psychometric equivalence.** Are the Catalan translations validated for equivalent factor loading? "Directe" (A-07 and O-06 both) is the clearest defect, but other terms may not carry the same factor connotations in Catalan as their English counterparts. Human review by a Catalan psychologist is recommended before data collection in that language.

5. **`sensitive` (N+02) classification.** Several IPIP lexical studies treat "sensitive" as a blend or as loading on A or O rather than cleanly on N. If the target population reports it as positive, it may systematically inflate N witness scores. A review of the IPIP item bank for the word's actual factor loadings in the published data is warranted.

6. **Minimum witness pool size for stable signal.** With 20 adjectives per dimension and a witness selecting some subset, what is the minimum n_witnesses and minimum adjectives-per-dimension-per-witness to achieve acceptable reliability (e.g., α > 0.7)? This is a power question that requires a simulation or pilot study, not just this audit.

7. **AB5C secondary factor mapping.** Should the schema be extended to support a `secondaryFactor` field for blend adjectives? This would allow the scoring model to decompose AB5C blends rather than treating them as pure single-factor signals. The downside is added complexity for witnesses.

8. **`tip` text validation.** The `tip` field is shown on hover during the instrument. Some tip texts may inadvertently prime the witness before endorsement (e.g., E+03 tip "States opinions clearly and takes the lead" primes for a specific behaviour rather than asking the witness to observe freely). This is a question for psychometric instrument design review, not a code fix.

---

*Report generated: 2026-05-10. Source files not modified. No commits or branches created.*
