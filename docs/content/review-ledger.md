# Content review ledger

One row per article-language pair that has been through a wave review. The
daily brief proposes candidates ranked by exposure ("Content wave" section,
built by `gatherWave` in `worker/src/jobs/daily.js`); the daily maintainer
routine skips any pair reviewed in the last 8 weeks, reviews the rest, and
appends its row here in the same pull request as the fixes.

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
