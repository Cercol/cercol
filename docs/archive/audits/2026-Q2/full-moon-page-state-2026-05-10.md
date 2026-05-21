# Full Moon Results Page — State Audit (F4.1)
**Date:** 2026-05-10  
**Purpose:** Pre-implementation inspection before F4.2 (Ruta 2 redesign).  
**Mode:** Read-only. No files modified, no commits, no branches.

---

## 1. Page Structure Inventory

**File:** `src/pages/FullMoonResultsPage.jsx`  
**Total lines:** 423

### 1.1 Hooks and state (lines 38–48)

| Hook / variable | Line | Purpose |
|----------------|------|---------|
| `useLocation` | 39 | Reads `location.state` for scores from test |
| `useNavigate` | 40 | Navigation fallback on missing scores |
| `useSearchParams` | 41 | Reads `?r=` shared-link param |
| `useTranslation` | 42 | `t`, `i18n.language` |
| `useAuth` | 43 | `user`, `authLoading` |
| `useState(false)` | 44 | `copied` — share button feedback |
| `useState([])` | 45 | `sessions` — witness session list |
| `useState(null)` | 46 | `loadedDomains` — API fallback domains |
| `useState(null)` | 47 | `loadedFacets` — API fallback facets |
| `useRef(false)` | 48 | `loggedRef` — prevents double-logging |

No `useMemo`. Four `useEffect` calls (lines 72–94, 97–102, 104–107, 110–115).

### 1.2 Derived values (lines 135–156)

```js
// line 136
const selfRole   = computeRole(domains)
// line 143-145
const witnessScores = hasAnyWitness
    ? averageWitnessScores(completedSessions.map(s => s.scores))
    : null
// line 146
const witnessRole = witnessScores ? computeRole(witnessScores) : null
// line 149
const roleResult = computeCombinedRole(selfRole, witnessRole)
// line 151-153
const divergence = hasEnoughWitnesses
    ? detectDivergence(domains, witnessScores)
    : []
// line 154-156
const convergence = (hasEnoughWitnesses && witnessRole)
    ? computeConvergence(selfRole, witnessRole)
    : null
```

### 1.3 Sections and line ranges

| # | Section | Lines | Condition |
|---|---------|-------|-----------|
| — | Header (`ReportPageHeader`) | 168–174 | Always shown |
| 1 | Role card (`RoleCard`) with badge | 176–198 | Always shown |
| 2 | Radar + domain rows + probability bars | 200–247 | Always shown |
| 3 | Facet accordion (`FacetAccordion`) | 249–272 | Only if `facets` is truthy |
| 4 | Convergence meter (`ConvergenceMeter`) | 274–282 | `hasEnoughWitnesses && convergence !== null` |
| 5 | Blind spots (`divergence` list) | 284–326 | `hasEnoughWitnesses` |
| 6 | Witness session list + invite CTA | 328–402 | `showWitnessSection` |
| — | Actions row (share / retake) | 404–413 | Always shown |
| — | Disclaimer | 415–418 | Always shown |

### 1.4 Imports from src/utils/ and src/components/

**Utils:**
```js
// line 22
import { encodeScores, decodeScores, CLIPBOARD_FEEDBACK_MS } from '../utils/share-url'
// line 23
import { fmScoreToPercent, fmScoreLabel } from '../utils/full-moon-scoring'
// line 24
import { logResult } from '../utils/logger'
// line 25
import { computeRole } from '../utils/role-scoring'
// line 26
import { averageWitnessScores, detectDivergence, computeConvergence, computeCombinedRole } from '../utils/witness-scoring'
```

**Components:**
```js
// line 28
import { FullMoonIcon, ShareIcon, DimensionIcon, BlindSpotsIcon } from '../components/MoonIcons'
// line 31
import RoleProbabilityBars from '../components/RoleProbabilityBars'
// line 32
import { Card, Button, Badge, SectionLabel } from '../components/ui'
// line 33
import { DimensionRow, FacetAccordion, ConvergenceMeter, ReportPageHeader, RoleCard, RadarDataCard } from '../components/report'
```

### 1.5 Prop shapes

The component takes no props. It is a route-level component. All data flows through React Router state (`location.state`), URL params (`?r=`), or the auth context + API.

---

## 2. Scoring Utility Inventory

**File:** `src/utils/witness-scoring.js` (lines 1–248)

### 2.1 Exports used by FullMoonResultsPage

#### `averageWitnessScores(scoreSets)` — lines 234–247
```
@param  Array of {presence, bond, discipline, depth, vision} objects
@returns {presence, bond, discipline, depth, vision} averaged, rounded to 2dp
```
Returns `null` if `scoreSets` is empty.

#### `detectDivergence(selfDomains, witnessDomains, threshold=0.8)` — lines 159–174
```
@param  selfDomains    — {presence, bond, ...} on 1–5
@param  witnessDomains — {presence, bond, ...} on 1–5
@returns Array of { domain, selfScore, witnessScore, selfZ, witnessZ, diff }
         sorted by diff desc, only entries where |selfZ - witnessZ| > threshold
```
Uses `NORM_MEAN` and `NORM_SD` imported from `role-scoring.js`. The `selfZ` and `witnessZ` fields are in the returned objects but not currently displayed in the page's JSX — the page only uses `{ domain, selfScore, witnessScore }` (line 302) to determine direction and lookup i18n text.

#### `computeConvergence(selfResult, witnessResult)` — lines 186–196
```
@param  selfResult    — { role, arc } from computeRole()
@param  witnessResult — { role, arc } from computeRole()
@returns number 0–1 (Jaccard similarity of role sets)
```
Jaccard: `|intersection| / |union|` of `{primary} ∪ {arc roles}`.

#### `computeCombinedRole(selfResult, witnessResult)` — lines 208–226
```
@param  selfResult    — return of computeRole()
@param  witnessResult — return of computeRole(), or null
@returns { role, arc, probabilities }  (same shape as computeRole())
```
Blends probabilities as `(self × 2 + witness) / 3`. Falls back to `selfResult` if `witnessResult` is null.

#### `computeRole(domainScores)` — from `src/utils/role-scoring.js`, line 85
```
@param  domainScores — {presence, bond, vision, discipline, depth} on 1–5
@returns { role: 'R01'–'R12', arc: string[], probabilities: {R01…R12: 0–1} }
```
Returns an **object**, not a plain string. The `role` property carries the role code.

### 2.2 Exports NOT used by FullMoonResultsPage

| Export | File | Notes |
|--------|------|-------|
| `buildRounds` | witness-scoring.js | Used by WitnessPage only |
| `computeWitnessScores` | witness-scoring.js | Used by WitnessPage only |
| `computeInterimRole` | witness-scoring.js | Used by WitnessPage only |

### 2.3 Rank-order / Spearman utilities

**None exist.** `grep -r "spearman" src/` and `grep -r "rankOrder" src/` both return no matches. A Spearman ρ function will need to be written from scratch in F4.2.

---

## 3. Sections to Remove or Replace

### 3.1 Section 4 — Convergence meter (lines 274–282): REPLACE

Currently renders `ConvergenceMeter` which displays a progress bar and Jaccard-based qualitative label.

```jsx
// line 274–282
{hasEnoughWitnesses && convergence !== null && (
  <section>
    <SectionLabel color="gray" className="mb-4">
      {t('witnessResults.convergenceSection')}
    </SectionLabel>
    <ConvergenceMeter ratio={convergence} t={t} />
  </section>
)}
```

**Disposition for Ruta 2:** The section is **kept** in position but the internal mechanism changes. The Jaccard `computeConvergence` → `ConvergenceMeter` pipeline is replaced by a Spearman rank-correlation → `spearmanLabel()` → qualitative text display. The `ConvergenceMeter` component (progress bar with numeric percentage) is replaced by a qualitative card with a rank-order visualization. The `computeConvergence` import and call (lines 26, 154–156) are removed.

### 3.2 Section 5 — Blind spots (lines 284–326): REPLACE

Currently renders a list of dimensions where `|selfZ - witnessZ| > 0.8`. The text displayed (e.g., "Witnesses rate Bond higher than you do") is already qualitative, but the trigger mechanism is z-score arithmetic. The z-score `diff` field from `detectDivergence` is not displayed numerically in the JSX — only `selfScore` and `witnessScore` are used to determine direction. However the **threshold logic** (`diff > 0.8 z-scores`) is the numerically-grounded trigger we want to rethink.

```jsx
// line 284–326
{hasEnoughWitnesses && (
  <section>
    <SectionLabel color="gray" className="mb-1 flex items-center gap-1.5">
      <BlindSpotsIcon size={16} />{t('witnessResults.blindSpotsTitle')}
    </SectionLabel>
    <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
      {t('witnessResults.blindSpotsNote')}   // ← "…differ by more than one standard deviation"
    </p>
    {divergence.length === 0 ? (
      // ... noDivergence message
    ) : (
      <ul>
        {divergence.map(({ domain, selfScore, witnessScore }) => {
```

**Key observation:** The i18n key `witnessResults.blindSpotsNote` (line 291) currently reads: *"Dimensions where self-report and Witness scores differ by more than one standard deviation."* This exposes the z-score methodology to users. In Ruta 2 this note will need rewording.

**Disposition for Ruta 2:** The section is **kept** with a revised note. The `detectDivergence` call (and its z-score threshold logic) either remains unchanged (the z-score trigger is backend-only and not displayed) or is replaced with a raw-score percentile-based trigger. The visual output (qualitative text per domain) stays; only the `blindSpotsNote` i18n text changes to remove z-score language.

### 3.3 No direct numerical z-score display

The page currently does **not** display raw z-score numbers (e.g., "Bond: −1.55") anywhere in its JSX. The z-scores are computed inside `detectDivergence` but the `selfZ` and `witnessZ` fields are not referenced in the render tree. Audit memory about numerical z-score display is **stale relative to the current code**; the current implementation already uses qualitative text only.

### 3.4 Role-card badge note (lines 188–196): LIGHT CHANGE

```jsx
// line 188–190
<Badge className="self-start bg-blue-100 text-blue-700">
  {t('witnessResults.definitiveLabel')}   // "Witness included"
</Badge>
// line 196
badgeNote={hasEnoughWitnesses ? t('witnessResults.definitiveNote') : undefined}
// "The Witness signal reduces uncertainty in the role assignment. This is your most complete result."
```

**Disposition for Ruta 2:** The `badgeNote` text (`witnessResults.definitiveNote`) is where the role disclaimer would naturally live. The current text is positive/authoritative; Decision 1 requires a disclaimer be added nearby.

---

## 4. New Design Requirements

### 4.1 Decision 1 — Witness role disclaimer

**Where the witness role is currently rendered:**  
Lines 178–197 (`RoleCard`). The combined role (self 2/3 + witness 1/3) is what is shown. The `hasEnoughWitnesses` conditional at line 186 already switches the badge between "Witness included" and "beta".

**Natural placement for the disclaimer:**  
The `badgeNote` prop on `RoleCard` (line 196) is the most natural location — it renders directly below the badge, already styled as a secondary note. The current `witnessResults.definitiveNote` text could be extended or replaced to carry the disclaimer. Alternatively, a small `<p>` immediately below the `<section>` closing tag at line 198 would also work visually.

**Proposed approach:** Replace `witnessResults.definitiveNote` with a two-part note: first the existing "most complete result" message, then the disclaimer. Or add a separate `witnessResults.witnessRoleDisclaimer` key for the second sentence.

### 4.2 Decision 2 — Qualitative convergence label

**Current mechanism:**
- `computeConvergence(selfRole, witnessRole)` → Jaccard 0–1 → `ConvergenceMeter` → progress bar + label
- Three label levels: `convergenceHigh` (≥0.6), `convergenceMod` (0.3–0.6), `convergenceLow` (<0.3)

**New mechanism needed:**
1. **`spearmanRho(selfDomains, witnessDomains)`** — computes Spearman ρ between self and witness rank-orders across the 5 dimensions. Does not exist; must be written.
2. **`spearmanLabel(rho)`** — maps ρ to one of four qualitative labels (e.g. strong/moderate/weak/opposite). Does not exist; thresholds TBD.
3. **Rank-order visualization** — displays the two 5-dimension rankings side by side (or as a parallel lists). No existing component; must be written or wired into `ConvergenceMeter`.

**Inventory:**
- No Spearman function exists anywhere in `src/`.
- `ConvergenceMeter` (Jaccard-based) is the current visualization. It will need to either be replaced or have its interface changed to accept `rho` instead of `ratio`.
- The `computeConvergence` call at line 154–156 and the import at line 26 will be removed.

**Proposed location in page:** Section 4 at lines 274–282 (unchanged position). The `SectionLabel` header at line 277–279 stays; the `ConvergenceMeter` call at line 280 is replaced by the new component.

### 4.3 Decision 3 — Self-contained disclaimer, no link to SCIENCE.md

Two candidate texts (under 25 words each):

**Option A:**  
*"The witness role is a signal, not a verdict. Different observers may perceive the same person differently."*  
(21 words)

**Option B:**  
*"Witness perception reflects one or more observers' views. Treat this as one lens, not an objective measure."*  
(18 words)

---

## 5. i18n Keys to Add

All keys are under `witnessResults.*` or a new `fmResults.witnessRole.*` namespace. 6 language files must be updated: `en`, `ca`, `es`, `fr`, `de`, `da`.

| Key name | Purpose | Replaces / new |
|----------|---------|----------------|
| `witnessResults.witnessRoleDisclaimer` | Disclaimer sentence under role badge (Decision 1) | New |
| `witnessResults.convergenceStrong` | Qualitative label for ρ ≥ 0.7 | New (replaces `convergenceHigh` if threshold changes) |
| `witnessResults.convergenceModerate` | Qualitative label for 0.4 ≤ ρ < 0.7 | Replaces `convergenceMod` |
| `witnessResults.convergenceWeak` | Qualitative label for 0.0 ≤ ρ < 0.4 | New (splits from `convergenceLow`) |
| `witnessResults.convergenceOpposite` | Qualitative label for ρ < 0 | New |
| `witnessResults.convergenceSection` | Section header (already exists — may keep) | Keep or update text |
| `witnessResults.convergenceNote` | Explanation below convergence display | Update (remove "role set" Jaccard language) |
| `witnessResults.rankSelf` | Label for self-report rank column | New |
| `witnessResults.rankWitness` | Label for witness rank column | New |
| `witnessResults.blindSpotsNote` | Replaces z-score reference in subtitle | Update text, same key |

**Total new keys needed:** ~8 new + 2 updates across 6 languages = ~48 translation strings.

**Note:** `convergenceHigh`, `convergenceMod`, `convergenceLow` are existing keys used by the current `ConvergenceMeter`. If four levels replace three, at minimum one new key is needed and the existing three may be repurposed or deprecated.

---

## 6. Test Inventory and Impact

### 6.1 Test files touching witness scoring

**`src/utils/__tests__/witness-scoring.test.js`** (176 lines)

Imports: `computeWitnessScores`, `detectDivergence` from `../witness-scoring`.  
Does **not** import or test: `computeConvergence`, `computeCombinedRole`, `averageWitnessScores`, `buildRounds`.

| Test group | What it asserts |
|------------|----------------|
| `computeWitnessScores` (8 tests) | Score formula correctness, N polarity, clamping to [1,5], multi-round averaging |
| `detectDivergence` (7 tests) | Empty on identical inputs, correct z-score math vs NORM constants, selfScore/witnessScore in output, sort order, custom threshold |

### 6.2 Test files touching FullMoonResultsPage

**None.** There are no component-level tests (no `.test.jsx` or `.spec.jsx` files under `src/`). The test suite is utility-only.

### 6.3 Impact on existing tests from F4.2

| Test | Impact |
|------|--------|
| `detectDivergence` tests (7 tests) | **No impact.** `detectDivergence` is kept; only the `blindSpotsNote` i18n text changes. The tests do not assert on i18n text. |
| `computeWitnessScores` tests (8 tests) | **No impact.** Unchanged function. |
| New tests needed | `spearmanRho` (at minimum 3–4 tests: known inputs, tied ranks, ρ=1, ρ=−1), `spearmanLabel` (4 tests for four buckets) |
| `computeConvergence` | Not tested today; if removed in F4.2, nothing breaks. |

---

## 7. Implementation Plan (F4.2)

### Order of operations

1. **Utility** — add `spearmanRho` and `spearmanLabel` to `src/utils/witness-scoring.js`
2. **Tests** — add tests for both new functions in `src/utils/__tests__/witness-scoring.test.js`
3. **Component** — update or replace `ConvergenceMeter` to accept Spearman output
4. **Page** — update `FullMoonResultsPage.jsx`:  
   a. swap `computeConvergence` call → `spearmanRho` call  
   b. add disclaimer to role section  
   c. update `blindSpotsNote` i18n key (text only, no logic change)
5. **Translations** — add ~8 new keys × 6 languages

### File-by-file change list

| File | Change | ±Lines est. |
|------|--------|-------------|
| `src/utils/witness-scoring.js` | Add `spearmanRho(selfDomains, witnessDomains)` and `spearmanLabel(rho)` exports; remove `computeConvergence` export (or keep but no longer call from page) | +30 / −0 |
| `src/utils/__tests__/witness-scoring.test.js` | Add test group for `spearmanRho` (4 cases) and `spearmanLabel` (4 cases) | +60 / 0 |
| `src/components/report/ConvergenceMeter.jsx` | Replace `ratio` prop (Jaccard) with `rho` prop (Spearman); update thresholds for four levels; add rank-order visual; update `convergenceNote` text | +30 / −20 |
| `src/pages/FullMoonResultsPage.jsx` | (a) Add `spearmanRho` to import (line 26); remove `computeConvergence`; (b) change `convergence` variable to `spearmanRho(...)` result; (c) add disclaimer `<p>` near role badge; (d) pass `rho` not `ratio` to ConvergenceMeter | +8 / −5 |
| `src/locales/en.json` | Add `witnessResults.witnessRoleDisclaimer`, `convergenceStrong`, `convergenceModerate`, `convergenceWeak`, `convergenceOpposite`, `rankSelf`, `rankWitness`; update `convergenceNote` and `blindSpotsNote` | +7 / −2 |
| `src/locales/{ca,es,fr,de,da}.json` | Same keys × 5 files | +7 × 5 / −2 × 5 |

**Total estimate:** ~+170 lines added, ~−35 lines removed across all files.

### Risks and open questions

1. **Spearman thresholds:** The four bucket boundaries (ρ ≥ 0.7 / 0.4–0.7 / 0–0.4 / <0) are proposed but not validated against the instrument's actual score distribution. With only 5 dimensions, tied ranks are common (especially at the neutral 3.0 centre), which inflates ρ. Consider whether a 3-level scheme (strong / moderate / divergent) is more appropriate given the small N=5 rank list.

2. **`computeConvergence` (Jaccard) removal:** The function is used in `FullMoonResultsPage` but has no tests. Safe to remove from the call site; the export in `witness-scoring.js` can be kept with a deprecation comment, or removed if no other consumer exists. Confirmed: no other file imports it (`grep -rn "computeConvergence" src/` hits only the page import on line 26 and the function definition on line 186).

3. **Rank-order visualization with N=5:** Showing the two ranked lists side by side is straightforward with 5 items but the ranks may be visually obvious without an icon — especially when all scores are at 3.0 for the witness (tied ranks → arbitrary rank assignment). The component design needs to handle tied ranks gracefully (e.g., equal-rank display, no false precision).

4. **`ConvergenceMeter` reuse vs. new component:** Modifying `ConvergenceMeter` in place is simpler (no import changes in the page) but risks the prop interface becoming confusing (`ratio` vs `rho`). A clean new `ConvergenceCard` component with `rho` and `selfRanks`/`witnessRanks` props may be clearer.

5. **`witnessResults.definitiveNote` text:** Currently reads positively ("reduces uncertainty … most complete result"). Appending a disclaimer to the same text may create a mixed-tone message. Consider whether to split into two props on `RoleCard`.

6. **Minimum witnesses gate:** Currently `MIN_WITNESSES_FOR_REPORT = 2` (line 35) gates both Section 4 and Section 5. If the Spearman computation makes sense with even 1 witness, the gate could be relaxed for Section 4 (convergence) to `hasAnyWitness`. Requires a decision.

---

## 8. Open Questions for Human Review

1. **Three vs four convergence levels:** Is a four-level scheme (strong / moderate / weak / opposite) the right design, or should ρ < 0 ("opposite") be merged into "weak"? With N=5 dimensions, scores of −0.1 look like noise rather than genuine inversion.

2. **Disclaimer wording:** Option A or Option B from §4.3? Or a different text? The chosen English text must be translated into 5 languages.

3. **`blindSpotsNote` replacement text:** The current text says "…differ by more than one standard deviation." The new text should describe the same threshold without z-score language. Proposed: *"Dimensions where your self-report and Witness scores point in noticeably different directions."* Confirm or revise.

4. **Rank-order visual format:** Does the convergence section show (a) two ranked lists side by side with match lines, (b) a table with self-rank and witness-rank per dimension, or (c) something else? The format determines the component design.

5. **`computeConvergence` (Jaccard) keep or remove?** The function has no callers outside the page after this change. Remove from `witness-scoring.js` entirely, or keep with a `@deprecated` comment?

6. **`MIN_WITNESSES_FOR_REPORT` gate for convergence:** Keep at 2, or relax to 1 for the Spearman section? (With N=1 witness the Spearman ρ is still computable and meaningful.)

7. **Translation process:** The 8 new keys × 5 languages = 40 Catalan/Spanish/French/German/Danish strings. Will the human provide translations, or should machine-translated drafts be committed with a "review-needed" comment?

---

*Audit complete. No source files were modified. No commits or branches created.*
