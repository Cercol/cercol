> **ERRATUM (archived).** The Witness round-polarity conclusions in this file
> (§1B and the §5 "Proposed next steps" item 2) are **inverted and wrong**. They
> claim 70/30 (14 positive + 6 negative); the correct, authoritative value is
> **75/25 = 15 positive + 5 negative**, per the executable `ROUND_POLARITY`
> array in `src/utils/witness-scoring.js:135` (20 entries: 15 'P', 5 'N'). The
> error came from reading a then-stale code comment instead of counting the
> array. The docs were corrected to 75/25 in PR #44 (PRODUCT.md / SCIENCE.md) and
> the code comments in #46. The body is preserved unchanged below as a historical
> record; do not treat its polarity claims as accurate.

# Cèrcol — State Investigation (2026-06-04)

Investigation-only. No code changed, no commits, no server mutations.
Code is treated as source of truth; docs are suspect until verified.
Confidence: **HIGH** = direct string/file check. **LOW** = inferred runtime/prod.

---

## 1. Confirmed documentation drift

### 1A. Full Moon comparison mechanism — README & PRODUCT are STALE (HIGH)

The live code implements an **archetype / ratio-based** self-vs-Witness
comparison ("relevant roles" + "surprises"), exactly as SCIENCE.md describes.
The old z-score "blind spot" + "convergence (Jaccard)" mechanism is gone from
the scoring layer.

Evidence (code = truth):
- `src/utils/witness-scoring.js:28` `ROLE_TOP_ADJECTIVES`, `:59` `getRelevantRoles`
  (ratio threshold: `DOMINANT_RATIO 1.5`, `MIN_ABSOLUTE 0.10`, `RELATIVE_RATIO 0.60`,
  `MAX_RELEVANT 5` — `:44-47`), `:87` `compareRoleViews` returns
  `{ selfRelevant, witnessRelevant, shared, surprises }`.
- No `detectDivergence`, no `ConvergenceMeter`, no Jaccard/Spearman in `src/utils/` or
  `src/components/report/`. `ROADMAP.md:82,40` records `ConvergenceMeter` "removed in
  FM-R.2, commit fe5b29e".
- SCIENCE.md:314-379 documents the archetype/ratio/surprise approach — **matches code**.

Stale passages to fix:
- **README.md:35-36** — "scores are averaged. Divergence > 0.8 SD between self and
  peer on any dimension is flagged as a **blind spot**."
  → Should describe archetype comparison: the report shows each side's *relevant
  roles* (ratio-based threshold) and flags *surprises* (a role relevant on one side
  but not the other). No per-dimension 0.8-SD blind-spot computation exists.
- **PRODUCT.md:96** — "(|self_z − witness_z| > 0.8)" blind-spot rule
  → Same correction; remove the absolute z-score formula.

Note (separate, lower priority): the i18n locales still carry `blindSpots` /
`convergence` copy strings (e.g. `src/locales/en.json:1076-77,1206,1362-63,1224`).
These are user-facing text, not the scoring mechanism; worth auditing whether they
are still rendered, but distinct from the README/PRODUCT factual drift above.

### 1B. Witness round polarity split — SCIENCE & README STALE; PRODUCT correct (HIGH)

Empirical read of `buildRounds` (`src/utils/witness-scoring.js:135,148`):
- `ROUND_POLARITY` = **14 positive ('P'), 6 negative ('N')**, 20 rounds total →
  **70/30 split** (code comment `:121,134` confirms "14 positive, 6 negative").
- **5 adjectives per round**, one per OCEAN factor (`:162` `FACTORS.map`).
- Corpus `src/data/witness-adjectives.js`: **100 adjectives, perfectly balanced
  10 per factor×sign** (E±/A±/C±/N±/O± each 10). Verified by id-prefix count.

Doc comparison:
- **SCIENCE.md:241** "rounds (75/25 split)" + the "15+5" framing → **WRONG** (actual 14+6 = 70/30).
- **README.md** (per brief; "75/25") → **WRONG**.
- **PRODUCT.md:88** "fixed 70/30 positive/negative polarity sequence" → **CORRECT**, matches code.

---

## 2. Test / build health (HIGH — run locally, nothing fixed)

| Check | Result |
|-------|--------|
| `npx vitest run` | **223 passed**, 11 files, 0 fail |
| `python -m pytest` (api/) | **324 passed**, 0 fail |
| `npm run build` | **OK** — built in ~1.5s (index 555.66 kB / 177.76 kB gz; recharts vendor 318.65 kB / 88.46 kB gz) |

No failures anywhere. Build is healthy; main bundle is large (>500 kB) but that is
pre-existing and code-split.

---

## 3. Centroid / oracle parity (HIGH — held)

All three oracle artifacts exist:
`tests/role-oracle.json`, `api/tests/test_role_oracle.py`, `src/utils/__tests__/role-oracle.test.js`.

`_ROLE_CENTROIDS` parity verified across all 12 roles (column order E,A,O,C,N):
- `api/scoring.py:50-62` ≡ `src/utils/role-scoring.js:16-27` ≡ SCIENCE.md table `:145-156`.
  Every value matches (e.g. R02 Wolf `(1.0,-1.0,0.0,0.5,0.3)`; R08 Tortoise
  `(-1.0,0.0,-1.0,1.0,-0.8)`). **No drift.** `ARC_PROBABILITY_THRESHOLD = 0.15`
  (`role-scoring.js:58`).

---

## 4. Roadmap vs reality

| Pending item | ROADMAP claim | Code reality | Verdict |
|---|---|---|---|
| Cloudflare Pages migration | pending | `deploy-frontend.yml:53,57` still `peaceiris/actions-gh-pages@v4` → `gh-pages`. Prod `cercol.team` returns `server: GitHub.com`, `cache-control: max-age=600`, no Brotli/HTTP3 header (LOW, external curl). | **PENDING — confirmed** |
| PageSpeed retest | pending (docs) | No code artifact; tracking-only. | **PENDING (doc task)** |
| Phase 13.23 k-means (N≥300) | pending | full_moon result count not queried (no server mutation; read-only DB count not attempted). | **UNKNOWN** |
| Phase 15 Stripe paywall | "checkout skeleton", not enforced | Frontend gate **is live**: `src/pages/FullMoonPage.jsx:56-114` full state machine (`checking→paywall→processing→completed→ready`), paywall + Stripe CTA when `!profile.premium`. Backend: `/checkout` (`api/main.py:657`), `/webhooks/stripe` sets `premium=true` (`:673-689`), `premium` column used throughout. **BUT** no backend enforcement on result endpoints (gate is frontend-only), and beta auto-grant gives first 500 users premium free (`api/main.py:343,351-376` `BETA_TOTAL=500`). | **PARTIAL — more built than ROADMAP says, but effectively free during beta + no server-side gate** |
| Phase 15.5.2 /science enrich | pending | Route live since Phase 8: `src/App.jsx:100,198`, `SciencePage.jsx` (295 lines). "Enrichment" (DOI/AB5C/validation-plan) not separately verified. | **PARTIAL — page live, enrichment claim unverified** |
| Phase 15.5.5 distribution | pending | Marketing/outreach; no code artifact. | **PENDING (non-code)** |
| Phase 17.7 identity migration | planned | GCP/identity ownership — no local code artifact to verify. | **PENDING (ops)** |
| Phase 17.8 require_admin → deps.py | planned | `api/deps.py` **does not exist**. `_require_admin` duplicated: `api/blog.py:61`, `api/seo.py:56`, plus `require_admin` in `api/main.py:1177`. Three copies. | **PENDING — confirmed; clean refactor target** |
| Phase 17.9 performance | planned | Two-axis (mobile LCP ~6s + VPS load) — no local code change; overlaps Cloudflare item. | **PENDING** |

Headline mismatch: **Phase 15** — README implies Full Moon is a live paid product;
ROADMAP calls the paywall a skeleton. Reality is between: a real frontend gate +
Stripe checkout + webhook exist, but (a) there is no backend authorization on the
gated data and (b) the beta auto-grants premium to the first 500 signups, so it is
not actually monetizing yet.

---

## 5. Proposed next steps (ordered; human decides)

1. **Fix README.md:35-36 + PRODUCT.md:96 blind-spot/convergence drift** — `[docs-only]`
   risk **low**, ~20 min. Highest value-per-effort: both files actively misdescribe the
   shipped mechanism; SCIENCE.md already has correct wording to mirror.
2. **Fix SCIENCE.md:241 + README "75/25" polarity claim → 70/30 (14+6)** — `[docs-only]`
   risk **low**, ~15 min. PRODUCT.md is the correct reference. Removes a numeric
   contradiction across three docs.
3. **Reconcile Phase 15 status in ROADMAP + README** — `[docs-only]` risk **low**, ~20 min.
   State plainly: gate live, beta-free, no backend enforcement yet. Prevents future
   confusion about whether Cèrcol is "charging".
4. **Extract `_require_admin` into `api/deps.py` (Phase 17.8)** — `[code]` risk **low**,
   ~1h. Pure dedup of 3 copies; pytest (324) guards regression. Clean, self-contained.
5. **Add backend enforcement to Full Moon gated endpoints (Phase 15)** — `[code]` +
   maybe `[needs-ADR]` for the premium-policy boundary, risk **med**, ~半 day. Real
   security gap: gate is frontend-only today. Decide first whether beta-free changes.
6. **Cloudflare Pages migration (perf)** — `[needs-ADR]` risk **med**, 2–4h. Biggest
   perf lever (Brotli/HTTP3/long cache); confirmed still on GitHub Pages. Do on a
   staging subdomain first; pairs with Phase 17.9.

Not started here. Report uncommitted by design.
