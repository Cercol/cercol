# Sitemap generator behaviour — investigation (2026-06-04)

Read-only. No code changed, generator NOT run, server untouched.
Confidence: HIGH = direct file read; LOW = inferred runtime / Google behaviour.

## Why a plain build dirties public/sitemap.xml (root cause)

`npm run build` = `node scripts/generate-sitemap.mjs && vite build`
(`package.json:9`). So **any local `npm run build` regenerates the tracked
`public/sitemap.xml`**, producing a reorder + date diff even though the URL set
is identical. (The prior investigation session ran `npm run build`; that is what
left the file modified.)

## STEP 1 — How the generator sets order and lastmod (HIGH)

### lastmod
- `scripts/generate-sitemap.mjs:17` — `const TODAY = new Date().toISOString().slice(0, 10)`.
  A single **build-time date**, not a per-URL content-modification date.
- Applied ONLY to blog entries: blog index (`:99` `lastmod: TODAY`) and blog
  articles (`:115` `lastmod: TODAY`). Static pages get **no** `<lastmod>` (`:93`
  omits it; `urlEntry` `:57` renders lastmod only when passed).
- Consequence: every build re-stamps all blog `<lastmod>` to that day's date,
  regardless of whether the article changed.

### Order
- Static pages: `STATIC_PAGES` (`:20-28`) × `LANGS` (`:18`), nested loops `:91-95`.
  Fixed arrays → **deterministic**, stable across builds.
- Blog index: `LANGS` loop `:98-100` → **deterministic**.
- Blog articles: `:114` iterates `slugs`, which is `posts.map(p => p.slug)` from
  the live API response (`:66-70`, `fetch(https://api.cercol.team/blog)`).
  Emit order = **API response order**, not sorted locally.
- The API list orders by `published_at DESC` with **no secondary tiebreak**
  (`api/blog.py:181` `ORDER BY published_at DESC`). Articles sharing a
  `published_at` (the ~104 bulk-seeded posts) have an undefined intra-tie order
  that Postgres may return differently after table churn/vacuum. → This is the
  genuine, non-deterministic reorder source. (MED confidence it is the tie, HIGH
  that order derives solely from the API response.)

### Inputs read
- `LANGS`, `STATIC_PAGES`: local constants (`:18-28`).
- Blog slugs: live API `https://api.cercol.team/blog` (`:68`); on fetch failure
  it warns and emits zero blog URLs (`:71-74`) — a silent-shrink risk if the API
  is down at build time.

## STEP 2 — Production path (HIGH)

- Deploy builds with `npm run build:full` (`.github/workflows/deploy-frontend.yml:45`)
  = `generate-sitemap.mjs && vite build && prerender.mjs` (`package.json:14`).
  So the **served sitemap is regenerated fresh at deploy time** from the live API;
  its order and lastmod are set then. The committed `public/sitemap.xml` is only a
  snapshot and does not determine what production serves.
- `public/sitemap.xml` is **tracked**, not gitignored (`git check-ignore` → rc 1).
- **No test or validator asserts sitemap contents** — only `generate-sitemap.mjs`
  itself matches "sitemap" under `scripts/`/`api/tests/`. `api/tests/test_seo.py`
  does not reference it.

## STEP 3 — SEO assessment (LOW unless noted)

- lastmod = build date for all blog URLs: every deploy tells crawlers all 104
  articles changed today, even when untouched. LOW-confidence inference: Google
  treats `<lastmod>` as a weak hint and de-weights sources it finds unreliable;
  blanket same-date lastmod is at best neutral, at worst slightly devalues the
  signal. Not harmful to indexation, but it is noise.
- Per-build reordering: entry order in a sitemap is **not** a ranking signal
  (FACT — sitemaps are an unordered set per the protocol). The reorder is
  cosmetic for SEO; its only real cost is git-diff noise and accidental commits.
- URL set is unchanged across builds (verified this session), so coverage is
  unaffected.

## STEP 4 — Options (not implemented)

1. **Deterministic emit — stable sort before writing.** `[code]` risk **low**,
   ~15 min. In `generate-sitemap.mjs`, `slugs.sort()` (or sort by
   `published_at,slug`) before the `:114` loop. Tradeoff: a no-op build becomes a
   no-op diff (kills reorder churn) while order stays SEO-irrelevant. Cheapest,
   highest value. (Alt: add `, slug` tiebreak to `api/blog.py:181`, but that also
   reorders the public blog index and touches the API.)
2. **Real lastmod from content dates.** `[code]` risk **low-med**, ~30-45 min.
   Use each article's `published_at`/`updated_at` (already returned by the API)
   instead of `TODAY`; static pages stay lastmod-less or use git last-commit.
   Tradeoff: honest change signal to crawlers, removes daily date churn; needs the
   date threaded from the API response into `urlEntry`.
3. **Stop tracking `public/sitemap.xml` (gitignore + `git rm --cached`).**
   `[needs-ADR]` risk **low**, ~15 min. Deploy regenerates it via `build:full`, so
   the committed copy is redundant. Tradeoff: tree never dirties again and no stale
   snapshot, but you lose git-reviewable sitemap history and the ability to eyeball
   it in PRs; reverses the current "tracked artifact" convention (hence ADR).
4. **Leave as-is.** `[docs-only]` (or nothing) risk **low**, ~0. Tradeoff: zero
   work, but every local `npm run build` keeps dirtying the tree and inviting
   accidental reorder/lastmod commits — the exact friction that blocked the docs
   PR three times.

### Interaction with the pending Cloudflare Pages migration
Under Cloudflare Pages the build still runs at deploy, so the same regeneration
and snapshot-redundancy apply unchanged. Option 3 (generate-only-at-deploy) pairs
naturally with that migration — fold it in rather than doing it standalone. Options
1 and 2 are orthogonal to the host and can land anytime.

## Recommendation
Do **Option 1** (stable `slugs.sort()`); it directly removes the reorder noise so a
no-op build yields a no-op diff, at near-zero risk — optionally pair with Option 2
for honest lastmod. Defer Option 3 to the Cloudflare migration.
