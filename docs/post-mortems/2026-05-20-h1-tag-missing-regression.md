# 2026-05-20 - H1 tag missing / duplicated on production routes

- **Date of incident**: discovered 2026-05-20; the underlying
  regression was present since at least 2026-05-10 (probably
  earlier; no commit history pin)
- **Severity**: medium
- **Impact**: Bing Webmaster Tools reported the site as having
  "insufficient content" and flagged one page with no H1. Google
  Search Console reported 98 URLs as "Discovered, currently not
  indexed". The Phase 17.2 SEO indexability sprint (PR #23) fixed
  canonical, hreflang, and trailing-slash issues but did not fix
  the H1 structure, so Bing indexing remained blocked even after
  the sprint shipped. CTR over the prior 3 months was 0.45 percent
  (1 click on 220 impressions), partly attributable to this.

## Timeline

- **Pre-2026-05-10** - HomePage and SciencePage shipped without
  any `<h1>` element. The visual design used Section components
  with their own `<h2>` headings; nobody noticed because the visual
  page still looked complete. The first H1-related sample of the
  blog appeared with two H1 tags (header component plus a leading
  `# Title` in the markdown body), but this was equally
  unintentional.
- **2026-05-16 to 17** - Phase 17.1 (performance + SEO sprint).
  Lighthouse SEO score reported as 100. No H1 audit was performed.
- **2026-05-20** - Phase 17.2 PR #23 merged, fixing canonical,
  hreflang and sitemap trailing-slash issues.
- **2026-05-20** - Phase 17.3 PR #24 merged, adding per-language
  title and description for the six top-level pages.
- **2026-05-20** - Phase 17.4 PR #25 merged, fixing the recurring
  Caddy outage.
- **2026-05-20** - Close-out audit
  `docs/archive/audits/2026-Q2/AUDIT-CLOSE-2026-05-20.md`
  ran `curl` against twelve representative URLs and counted `<h1>`
  in each. Two had zero (home and `/science/`), three had two
  (specific blog articles). Filed as the single FAIL of the
  audit; everything else passed.
- **2026-05-21** - Phase 17.5 FASE A.2 (this sprint) shipped the
  fix.

## Root cause

The repo had no test or audit at any level that checked HTML
structural correctness for SEO. The Phase 17.1 SEO sprint focused
on lighthouse scores, prerender correctness, and bundle size; it
covered every audit that Lighthouse runs but Lighthouse does not
fail on missing H1 alone (it only warns). The Phase 17.2 sprint
focused on canonical, hreflang, and trailing slashes (issues that
GSC reports verbatim). Bing's "insufficient content" signal was
ambiguous and was treated as a content-quality problem rather than
a structural one.

There was no automated guard. No assertion in any test asked "does
this prerendered page contain exactly one `<h1>`". The audit that
caught it was a manual curl-and-grep check ad-hoc.

## Fix applied

- HomePage and SciencePage gained a `<h1 className="sr-only">`
  rendered synchronously by React with new i18n strings
  `home.h1` and `science.h1`, translated to all six languages.
  The visual design is unchanged; screen readers and crawlers
  receive a proper page title.
- BlogArticlePage strips a leading `# Title` from the markdown body
  before passing it to `marked.parse`, eliminating the duplicate.
  Only the first heading is stripped and only when it sits at the
  very top.
- `api/tests/test_seo.py` is a new pytest that asserts exactly one
  `<h1>` in the prerendered HTML for a representative sample of
  routes. It skips locally if `dist/` has not been prerendered and
  runs in CI after `npm run build:full` produces the output.

## Prevention

- Test:
  [`api/tests/test_seo.py`](../../api/tests/test_seo.py) blocks the
  recurrence at CI time for the sampled routes.
- Policy:
  [`docs/policies/conventions.md`](../policies/conventions.md)
  "SEO HTML structure" subsection documents the H1 rule and the
  leading-markdown-header strip.
- Architecture note in
  [`docs/policies/conventions.md`](../policies/conventions.md)
  "Appendix: patterns and pitfalls" warns that visual design
  without a textual page header still needs an H1, and recommends
  `sr-only` as the standard solution.

## Lessons learned

- A Lighthouse SEO score of 100 does not mean the page is properly
  structured for crawlers. Lighthouse audits are necessary but not
  sufficient.
- Manual audits (curl plus grep) catch issues that automated
  audits miss, but only when somebody decides to run them. Turning
  them into tests is the only way they become reliable.
- The repo had no notion of "SEO structural test" before this
  sprint. The `test_seo.py` file should be extended as new
  structural rules become known (one canonical per page, hreflang
  set is complete, og:image present, etc.).
- This is the second post-mortem on a regression that shipped to
  production because the assertion was implicit. The first was the
  Caddy outage; the absent rule there was about file ownership.
  Here the absent rule is about HTML structure. The pattern
  repeats.
