# ADR 0013: front the static site with Cloudflare for Brotli, HTTP/3, and long-cache

- **Number**: 0013
- **Title**: front the static site with Cloudflare for Brotli, HTTP/3, and long-cache
- **Status**: Proposed
- **Date**: 2026-06-04

## Context

The frontend is a static build (`vite build` + Puppeteer prerender via
`npm run build:full`) published to the `gh-pages` branch by
`peaceiris/actions-gh-pages@v4` (`.github/workflows/deploy-frontend.yml:44-57`)
and served by GitHub Pages on the custom domain (`public/CNAME` = `cercol.team`,
`VITE_API_URL=https://api.cercol.team` in `.env.production`).

GitHub Pages caps frontend performance. Measured externally (2026-06-04):

- A **content-hashed, immutable** asset (`/assets/index-BHH8sNUA.js`) returns
  `cache-control: max-age=600` — a 10-minute cache on a file whose content can
  never change. It should be `max-age=31536000, immutable`.
- `content-encoding: gzip` even when the client offers `Accept-Encoding: br` —
  **no Brotli**.
- No `alt-svc` header — **no HTTP/3** advertised.
- `server: GitHub.com`.

DNS today points the apex at the GitHub Pages anycast IPs
(`cercol.team A → 185.199.108–111.153`) and `www` CNAMEs to
`miquelmatoses.github.io`.

These three gaps (short cache, no Brotli, no HTTP/3) are the remaining lever for
the ~77 landing / ~68 blog performance scores and the mobile LCP work tracked in
Phase 17.9. Because the build output is **fully static**, it is portable to any
static host or CDN as-is — no app changes needed.

## Decision

Front the site with Cloudflare. Three options, with a recommendation.

### Option A (recommended) — migrate hosting to Cloudflare Pages

Cloudflare Pages serves the same static `dist/` from Cloudflare's edge, with
native Brotli, HTTP/3, and per-path cache control via a committed `_headers`
file (immutable long-cache for `/assets/*`, short cache for HTML).

Repo-side work (the only part Claude Code can do):
- Swap the deploy step in `deploy-frontend.yml` from `peaceiris/actions-gh-pages`
  to a Cloudflare Pages deploy (`cloudflare/wrangler-action` / Pages CI), keeping
  `npm run build:full` producing `dist/`.
- Add a `public/_headers` file: `/assets/* → cache-control: public, max-age=31536000, immutable`;
  HTML → a short TTL.
- Decide the fate of `public/CNAME` (GitHub-Pages-specific) and the gh-pages
  branch.

Operator-side (out of repo): create the Cloudflare Pages project, add the build's
deploy credential as a CI secret (a new token — name to be chosen, e.g.
`CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`; **values never in the repo**),
and cut DNS over to the Pages project.

### Option B — keep GitHub Pages, put Cloudflare in front as CDN/proxy

Move `cercol.team` onto Cloudflare's nameservers and enable the proxy (origin =
GitHub Pages). Cloudflare adds Brotli, HTTP/3, and edge caching at the edge
without moving hosting.

Repo-side work: minimal to none (the deploy keeps publishing to gh-pages).
Operator-side: nameserver move, proxy on, enable Brotli/HTTP3, and **cache rules**
to override the origin's `max-age=600` (cache-everything for `/assets/*` with a
long edge TTL; careful short TTL / bypass for HTML so deploys are not served
stale). The origin still reports `max-age=600`, so the win depends entirely on
Cloudflare's cache rules being configured correctly.

### Option C — stay on GitHub Pages

No work; the perf ceiling (short cache, no Brotli, no HTTP/3) remains.

**Recommendation: Option A.** The build is already portable static output, so the
only repo change is the deploy action plus a `_headers` file — and Pages gives
first-class, file-controlled cache headers (true immutable long-cache for hashed
assets) rather than relying on proxy cache rules over a fixed `max-age=600`
origin. Option B is a valid lower-effort interim if the operator wants Brotli/HTTP3
immediately without touching the deploy, but it leaves cache correctness to
edge-rule configuration. Option C is the status quo and does not move Phase 17.9.

## Alternatives considered

- **Option B — Cloudflare proxy in front of GitHub Pages** (detailed above).
  A valid lower-effort interim, but cache correctness depends on edge rules
  layered over a fixed `max-age=600` origin rather than file-controlled headers.
  Kept as a fallback, not the recommendation.
- **Option C — stay on GitHub Pages** (detailed above). Rejected as the answer:
  it does not move the Phase 17.9 perf ceiling at all.
- **Add a `_headers` / cache-config file to the existing GitHub Pages deploy.**
  Rejected: GitHub Pages ignores `_headers` and exposes no cache-control,
  Brotli, or HTTP/3 configuration — the limits are the platform's, not the
  build's, so no repo-only change can lift them.
- **A different static host/CDN (Netlify, Vercel, Fastly, S3+CloudFront).**
  Not pursued here: Cloudflare's free tier covers Brotli/HTTP3/edge-cache and
  Pages natively serves this exact static output; evaluating every vendor is out
  of scope for closing the known perf gap. Re-open if Cloudflare is rejected.

## Migration / cutover plan (for Option A)

1. Build the Pages deploy on a **staging subdomain** (e.g. `staging.cercol.team`
   or the default `*.pages.dev`) wired to the same `dist/` output; verify
   Brotli + HTTP/3 + immutable asset caching and that prerendered routes + the
   sitemap serve correctly.
2. Confirm `VITE_API_URL` still points at `https://api.cercol.team` (the API is
   unchanged and stays on Hetzner).
3. Cut DNS over to Cloudflare Pages for the apex + `www`; keep GitHub Pages as a
   rollback target until the new edge is verified in production.
4. Remove `public/CNAME` / retire the gh-pages publish once stable.

## Consequences

- Brotli + HTTP/3 + immutable long-cache for hashed assets → the remaining
  frontend perf gap closes; pairs directly with Phase 17.9.
- The API (Hetzner) is untouched; only frontend hosting/edge changes.
- **Execution needs the operator**: a Cloudflare account, a deploy credential
  added as a CI secret, and the DNS cutover are all outside the repo. Claude Code
  can only land the repo-side deploy-workflow + `_headers` change; it cannot
  create the account, hold the token, or move DNS.
- New external dependency on Cloudflare (vendor commitment) for hosting (A) or
  edge (B).

## Open questions for sign-off (do NOT decide here)

1. **Which option** — A (migrate to Pages), B (Cloudflare in front of GitHub
   Pages), or C (stay).
2. **Vendor commitment** — is taking on Cloudflare as a hosting/edge dependency
   acceptable.
3. **Account** — whose Cloudflare account, and the credential/secret naming.
4. **DNS cutover timing** — when, and the rollback window kept on GitHub Pages.

## Related

- `.github/workflows/deploy-frontend.yml` (current gh-pages deploy).
- `.env.production` (`VITE_API_URL`), `public/CNAME` (GitHub Pages custom domain).
- Phase 17.9 in ROADMAP.md (mobile LCP / perf) and the "Cloudflare Pages
  migration" pending item — this ADR is that item's decision record.
