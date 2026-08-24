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
