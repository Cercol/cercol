# Content review ledger

One row per article-language pair that has been through a wave review. The
daily brief proposes candidates ranked by exposure ("Content wave" section,
built by `gatherWave` in `worker/src/jobs/daily.js`, which fetches this
file and drops any pair in the table reviewed in the last 8 weeks before
capping the list); the daily maintainer routine skips reviewed pairs again
itself (the fetch can fail, and then the list arrives unfiltered), reviews
the rest, and appends its row here in the same pull request as the fixes.

The unit is the pair, not the article: `es · how-to-read` and `da ·
how-to-read` are different work with different defects. English pairs get the
non-linguistic half of the review only (indexing, position, CTR, CTA,
internal links); translated pairs also get a native-speaker pass against the
language's glossary in `docs/policies/glossary.<lang>.md`.

Verdicts: `clean` (nothing to fix), `fixed` (defects corrected, listed in the
PR and the issue comment), `needs-operator` (something only the operator can
decide; say what in the notes).

Nothing is unpublished on the basis of this ledger. An article that fails to
perform for lack of interest costs nothing; one that fails because of defects
gets fixed, in exposure order.

| Date | Lang | Slug | Verdict | Notes |
|---|---|---|---|---|
| 2026-08-25 | en | gender-and-personality-what-big-five-research-says | clean | Copy, links and CTA sound; CTR (1/1528 at pos 8.4) below positional expectation but no defect found to pin it on |
| 2026-08-25 | en | personality-and-procrastination-what-research-says | clean | Copy, links and CTA sound; CTR (1/1137 at pos 7.9) low for the position, copy not clearly at fault |
| 2026-08-25 | en | critiques-of-big-five-what-critics-say | fixed | One vocabulary defect in body ("observers" in the Mischel passage, banned term) corrected in D1; CTR healthy (10/527 at pos 9.7) |
| 2026-08-25 | en | big-five-personality-across-cultures-what-research-shows | fixed | Closing CTA linked the home page as an absolute URL instead of the instrument; now routes to /first-quarter. Position 13.6, zero clicks within noise |
| 2026-08-25 | en | what-is-a-facet-in-personality-psychology | fixed | One vocabulary defect in body ("observer data" for the Witness comparison) corrected in D1; links and CTA sound |
| 2026-08-26 | en | history-of-the-big-five-from-allport-to-goldberg | fixed | Closing CTA linked the home page as an absolute URL instead of an instrument; now routes to /first-quarter. Self-referential Further-reading row (mislabelled, no matching article exists) removed. "Observer ratings" in the convergent-evidence list names the method in cited studies, legitimate per glossary |
| 2026-08-26 | en | personality-and-motivation-what-drives-each-big-five-profile | clean | Copy, links and CTA sound; own conversion section routes to /first-quarter; 3 clicks on 359 impressions at position 10.4 is within positional expectation |
| 2026-08-26 | fr | what-is-a-facet-in-personality-psychology | fixed | 24 sentence-level corrections in D1: non-word "genuinement" (x2), one meaning change in a link title, "dessin" for pattern, calqued verb "scorer" (x3), untranslated stat label and two untranslated list rows, canonical instrument name, assorted calques. FAQ section present in EN source is absent in FR (omission, not correction; left for a translation pass). Indexed per today's snapshot, position 6.6 |

## Translation passes

Cross-cutting work outside the wave cadence. Not one row per pair above,
because a pass is one review protocol applied to many pairs at once; the
pairs it touched are listed here so the wave knows they carry the section.

**2026-08-29 — the missing FAQ sections.** The 2026-08-26 FR facet row above
noted the EN "Common questions" section absent in FR and left it for a
translation pass. The omission turned out to be systemic: of the six EN
articles carrying a FAQ (creativity, forced-choice, gender, motivation,
procrastination, facet), every translation lacked it except three Catalan
ones — 27 missing pairs (fr/es/de/da × 6, ca × creativity, forced-choice,
motivation). All 27 were translated from the EN source, passed a
native-speaker review per language (corrections in every language, mostly
calques plus a handful of meaning drifts; before/after in the PR),
and appended in D1 with a targeted idempotent UPDATE, verified by re-reading:
exactly one FAQ heading per pair, 30/30 including the pre-existing Catalan
three. `src/utils/faq-schema.js` detects questions by shape, so the new
sections emit FAQPage JSON-LD from the next prerender.
