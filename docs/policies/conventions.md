# Code conventions

Consolidated rules for code in this repo. CLAUDE.md used to inline
these; that section now points here.

## Language and tone

### Comments and docstrings in English

Without exception. The team works in Catalan but the code lives in
English so that future contributors (humans or LLMs) trained on
multilingual corpora consume a single coherent register.

### No em dashes anywhere

Neither in code, in markdown, in commit messages, nor in PR
descriptions. Use a regular hyphen, a colon, or a pair of commas
instead. Em dashes are easy to inject by accident from autocorrect
or LLM output and clutter searches for plain hyphens.

### Snippets only in PR descriptions

When a PR description quotes code, quote only the snippet that
matters, not the entire file. The reader can click the file in the
PR diff. Big code blocks in descriptions push the actual content of
the PR off the screen.

## Documentation markers

### Spec markers on documented modules

Python modules that have a dedicated architecture document declare
it in the docstring:

```python
"""
What this module does.

# Spec: docs/architecture/<file>.md
"""
```

The pre-commit hook in FASE G validates that the target file
exists. CI also enforces it.

Modules without a dedicated document do not need a marker.

## Examples and mocks

### Labeling required

Any example or mock that uses something that looks like a real user
identifier must be labelled. Either:

- A literal `EXAMPLE` or `MOCK` in the variable name.
- An inline comment `# EXAMPLE` on the same line.
- A `# fmt: off` / `# fmt: on` block clearly marked as fixture data.

Never invent realistic-looking email addresses, phone numbers, or
names of real organisations as filler. Use the `example.com` /
`example.org` / `example.net` reserved domains and obviously
fictional names.

## Migrations

### DB migrations apply immediately after commit

If a PR touches `db/migrations/`, the migration is applied to
production immediately after the merge, not batched with later
work. The reason: a half-applied migration state is harder to
diagnose than a fully-applied one, and the running code expects
the schema described in the most recent migration on disk.

The PR template has a checkbox for this.

## Smoke tests against real APIs

Smoke tests that hit live external APIs use the `qa_smoke@cercol.team`
account (when it exists; see `docs/policies/identities.md`). Never
a real user account, never a developer's own account.

Today no such tests exist; this rule defines the convention for when
they are introduced.

### Real contract check on every new external integration

When a PR introduces code that talks to a NEW external service
(third-party REST/GraphQL/SDK call that the codebase has never
issued before), the PR must include at least one piece of evidence
that the code matches the on-wire shape of the real service. Pure
mocks are insufficient; mocks codify the author's assumption about
the API and a green CI run only proves the code is consistent with
that assumption.

Acceptable forms of evidence:

- A one-shot manual `curl` against the documented endpoint with
  the output (or a redacted summary) captured in the PR
  description.
- A VCR-style recorded cassette played back in the test (only
  acceptable when the cassette was created against the real
  endpoint, not hand-written).
- A `tests/contract/` test that hits the real endpoint with a
  read-only call, guarded by a skip-when-no-creds marker so CI
  passes without secrets but the test runs locally before merge.

Lesson source:
`docs/post-mortems/2026-05-23-mock-divergence-bing-caddy.md`. Two
Phase 17.6.1a jobs shipped with mocks that codified the wrong API
shape (Bing POST vs GET; Caddy exact-match logger name) and only
failed in production. The fix (PR #28) added regression tests that
assert the real on-wire shape.

## Frontend principles

### Prefer HTML and CSS over JavaScript

When the same effect can be achieved with semantic HTML or with
CSS, do not introduce JavaScript. Examples:

- Accordions: `<details>` + `<summary>` over a custom JS
  collapsible.
- Form validation: built-in HTML constraints (`required`, `type`,
  `pattern`) over JS validators.
- Image lazy loading: `loading="lazy"` over an IntersectionObserver.

This matches the project's general posture of small bundle, fast
first paint, accessible by default.

### Tailwind only, no inline styles

Inline `style={{}}` is permitted only for values that have to be
computed at render time (chart colours from data, dynamic positions
from layout). Static styling is in Tailwind classes.

### No new icon inline SVGs

All icons live in `src/components/MoonIcons.jsx`, which re-exports
from `mm-design`. Add new icons to `mm-design` first; they appear
in this repo automatically when the dep is bumped.

## Roots of these rules

Most of these come from lessons baked in across the 2026 sprints.
Where a specific incident motivated a rule, the post-mortem is
linked here:

- "Code change implies doc check" (from
  `docs/policies/docs-maintenance.md`):
  `docs/post-mortems/2026-05-20-h1-tag-missing-regression.md` shows
  how an undocumented assumption about HTML structure shipped to
  production.
- "Spec markers": ditto. Modules with a doc but no marker drift
  silently.
- "No em dashes": consistency rule to keep `grep -F -- "-"`
  reliable for plain hyphens.

## Appendix: patterns and pitfalls of this stack

Hard-won lessons from the 16-17 May 2026 SEO and performance sprint
plus the Phase 17 SEO close-out audit. Read before prescribing
performance fixes or SEO changes on this stack. Migrated here from
CLAUDE.md during Phase 17.5.

### Performance investigation

- When diagnosing LCP, read the LCP breakdown first (Time to First
  Byte, Resource load delay, Resource load duration, Element render
  delay). The names matter: a high "Element render delay" usually
  means render-blocking critical path resources (CSS, fonts), NOT
  React hydration flicker. Confusing the two leads to fixing the
  wrong thing.
- With React hydration on a SPA, LCP has a structural floor of
  roughly 2 to 3 seconds regardless of how much you pre-render.
  Lighthouse re-marks the LCP when main-thread tasks settle, and
  React's hydration is a long task. Performance scores in the 75 to
  85 range for a pre-rendered SPA on GitHub Pages are normal, not a
  bug.
- When Search Console reports "Soft 404" or "Discovered: not
  indexed", use Search Console's live URL inspection as the source
  of truth. `curl -L` can disagree because of cache, followed
  redirects, or false-positive greps.

### Pre-rendering this stack

- Vite + Puppeteer + GitHub Pages: critical CSS extraction MUST run
  after Puppeteer captures each route's full DOM (post-prerender,
  Node API). A Vite plugin only sees the empty SPA shell, so the
  critical CSS block it produces is empty or wrong.
- When applying beasties to a fleet of HTMLs that share one
  external CSS file, always set `pruneSource: false`. The shared
  file must remain complete; pruning it would corrupt any HTML
  that wasn't processed first.
- To eliminate the API dependency at first paint for pre-rendered
  routes, inject the data as a window global from the prerender
  script and have the component initialize state from
  `window.__VAR__` in `useState(() => ...)`. The pattern
  generalises beyond BetaBanner; any "fetch on mount" on a public
  pre-rendered route is a candidate.
- The prerender server's SPA fallback MUST receive a frozen
  snapshot of the original Vite-built `dist/index.html`. If it
  reads the file from disk on every request, the file gets mutated
  by the first route processed and subsequent routes accumulate
  duplicate injections (for example, 8 font preloads instead of 4).
- Font preloads need explicit `crossorigin` even for same-origin
  fonts (browser spec); without it the preloaded font is discarded
  and re-fetched when CSS references it.
- When using `@fontsource`, content-hashed woff2 filenames change
  every build. Extract them dynamically from the built CSS file
  (`dist/assets/index-*.css`) rather than hardcoding them.

### SEO HTML structure

- Every pre-rendered route must ship exactly one `<h1>`. The home
  and `/science/` shipped zero for a long stretch because the
  visual design has no page header; the fix is a
  `<h1 className="sr-only">` rendered synchronously by React. See
  `api/tests/test_seo.py` and the H1 post-mortem.
- Blog articles whose markdown body opens with `# Title` ship two
  `<h1>` tags (component header plus markdown). Strip the leading
  `# Title` in the renderer, do not modify the source markdown.
- Canonical and hreflang are injected at runtime by `usePageMeta`,
  AFTER React effects run. The prerender script waits for
  `networkidle0` plus 1.5 seconds to capture them.

### Deploy pipeline

- `.github/workflows/deploy-frontend.yml` must include `scripts/**`
  in its `on.push.paths` filter. Otherwise changes to
  `scripts/prerender.mjs` or `scripts/generate-sitemap.mjs` land
  on `main` without ever being deployed.
- Use `npm install` (not `npm ci`) on CI workers. macOS-generated
  lockfiles omit linux-x64 optional native binaries
  (`@esbuild`, `@rollup`, `@tailwindcss/oxide`, `lightningcss`).
  `npm ci` on Ubuntu fails on the missing platform-specific entries.
- Merge pattern: `gh pr checks $PR --watch && gh pr merge $PR
  --squash --delete-branch`. The `&&` ensures the merge only runs
  if checks passed; without it, `gh pr checks --watch` exits 0 on
  completion regardless of pass/fail and the merge happens anyway.

### Workflow ordering

For a "pre-rendered SPA performs poorly" investigation, the audit
order that maximises signal-to-effort:

1. Pre-render audit: what does Googlebot actually receive for each
   route type? If a route serves the empty SPA shell or an error
   fallback, fix that first; nothing else matters until the HTML
   is correct.
2. Critical path audit: what is render-blocking at first paint
   (CSS, fonts, JS)?
3. LCP element audit: which element does Lighthouse pick, and what
   is its render breakdown?
4. Bundle audit: where is the dead weight in the eager chunks?

Doing them in a different order tends to produce fixes that don't
move the metric.
