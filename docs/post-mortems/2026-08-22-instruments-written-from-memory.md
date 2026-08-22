# 2026-08-22 — The instruments were built from recall, not from the source

- **Date of incident**: 2026-04-06 to 2026-08-22 (introduced in Phase 6.1,
  found four and a half months later)
- **Severity**: critical
- **Impact**: Cèrcol set out to implement the IPIP-NEO-120 and the IPIP-NEO-60
  and did not. Roughly half the items are the wrong ones, twenty-one Full Moon
  items are not IPIP items at all, three items that are correct sit in the
  wrong facet, and one of those is keyed backwards, so it adds to Depth where
  it should subtract from Discipline. Every score computed since April carries
  that.

The defect is the instrument. Everything downstream — the norms, the
translations, the letters to researchers — is wrong because it faithfully
describes an instrument that was not built as intended. Correcting the
descriptions without rebuilding the instrument would leave the actual problem
in place, so that is not what is being done.

## Timeline

Times in UTC.

- `2026-04-06` — Phase 6.1. `first-quarter.js` and `full-moon.js` are written
  in commit `8d5aa536f`, citing Johnson (2014) and Maples-Keller et al. (2019).
  The citations name what was intended to be built.
- `2026-04-10` — commit `1c35066af` adds all 190 Danish item strings and 1,038
  lines of `da.json` in one bulk change.
- `2026-06-01` — first real response recorded.
- `2026-08-04` — the New Moon prior is corrected and the Witness structure
  changes. Neither touches the item selection.
- `2026-08-22 09:00` — a philologist review of the Catalan items returns 70
  defects in 190 and the judgement that the set is unreviewed machine output.
- `2026-08-22 16:00` — the same review of Danish shows 22 of the 60 shared items
  rendered as two different Danish sentences, which transcription of a
  published list cannot produce. The Danish was never Vedel's.
- `2026-08-22 17:30` — the item sets are compared with the published
  instruments for the first time. Full Moon shares 61 of 120 items with
  Johnson's; 21 of its items are in no IPIP list at all.
- `2026-08-22 19:00` — the canonical sets are pulled from source into
  `src/data/reference/`, cross-checked between two publishers.

## Root cause

**The items were produced from a model's recall of the instrument instead of
transcribed from it, and nothing in the pipeline compared the result with the
source.**

The signature is unmistakable once looked for. The *structure* is perfect: five
domains, thirty facets in the right order with the right names, four items
each. The *items* are real: 99 of 120 exist in the IPIP pool, so nothing was
invented from nothing. But the *selection* — which four of the pool's items
Johnson chose for Self-Efficacy — is arbitrary information, and arbitrary
information is what recall loses. New Moon came through perfectly because ten
items is short enough to reproduce exactly; a hundred and twenty is not.

What is actually true, measured against the published sources:

| instrument | intended | built |
| --- | --- | --- |
| New Moon, 10 items | TIPI (Gosling et al., 2003) | **10 of 10 verbatim** |
| Witness, 100 adjectives | AB5C lexical markers | as documented: 30 published markers, 70 chosen synonyms |
| First Quarter, 60 items | IPIP-NEO-60 (Maples-Keller et al., 2019) | **23** of 60 |
| Full Moon, 120 items | IPIP-NEO-120 (Johnson, 2014) | **61** of 120, and 21 not IPIP items |

Ten of the twenty-one are a real item with a word changed; eleven exist nowhere
in the 3,320-item pool. Some of the edits move the construct: `Seldom feel
joyful` is `Seldom feel blue` with depression swapped for cheerfulness, a
different facet in a different domain.

Three items shared with the published instrument are in the wrong place, which
replacing the item set does not fix by itself — the facet has to be read from
the source too:

| item | built as | published as |
| --- | --- | --- |
| `Act without thinking.` | Immoderation (n5), forward | **Cautiousness (c6), reverse** |
| `Tell the truth.` | Morality (a2) | Dutifulness (c3) |
| `Take advantage of others.` | Cooperation (a4) | Morality (a2) |

The same gap ran three times, in three different places, each time with a real
citation beside generated content: the item selection against Johnson, the
translations against Vedel and Thiry & Piolti, the norms against Kajonius &
Johnson. In every case the citation stated a correct intent and no step ever
checked that the intent had been carried out.

It was cheap to check. Of the sixty English items in both instruments, Danish
renders 22 as two different sentences and German 18, while Catalan, Spanish and
French render all sixty identically. One query.

## Fix applied

- The canonical sets are in the repository, taken from source and cross-checked
  between two independent publishers that agree on 115 of 120 strings:
  `src/data/reference/ipip-neo-120.js` and `ipip-neo-60.js`, with tests that
  fail if a facet does not hold exactly its four or two items.
- `INSTRUMENT_VERSION` and the changelog exist, so an item change is recorded
  and old answers stay distinguishable from new ones.
- My Results offers a retake on a result from an older version.
- Section `a11` of `src/data/distribution-plan.js` carries the rebuild, in
  order, and is first in the plan.

**Not yet done.** Full Moon still changes 59 items and First Quarter 37. Until
that lands, the instrument is still the one described above. The site keeps
describing what it is meant to be, deliberately: rewriting the descriptions now
and rewriting them back after the rebuild would spend the effort on the
symptom.

## Prevention

- [docs/policies/dataset-versions.md](../policies/dataset-versions.md) is the
  record of what each version of the instruments is, and what changes force a
  bump. An item change that leaves the version alone silently makes old and new
  answers incomparable, which is the one defect that cannot be repaired later.
- [docs/policies/conventions.md](../policies/conventions.md) — an instrument,
  scale or norm is never written from recall. It is transcribed from the
  publisher into `src/data/reference/` and read from there. Where a source
  cannot be obtained, that is a finding to report, not a gap to fill in.
- The daily routine's prompt carries the same rule, with this measurement
  attached, since a rule with its scar beside it is followed more reliably than
  a rule alone.

## Lessons learned

**The failure was in the building, not in the describing.** Every citation in
those files states a correct intention: the IPIP-NEO-120 is what Cèrcol should
implement. Nothing was misrepresented on purpose and nothing about the intent
was wrong. What went wrong is that the thing built did not match it, and no
step ever compared the two. Reading this as a documentation problem points at
the wrong fix — softening the claims would leave a mis-scored instrument in
production with a more careful sentence next to it.

**Recall reproduces structure and loses selection.** The domains, the facet
names, the ordering, the item counts all survived intact. What did not survive
is which specific items were chosen, because that is arbitrary and carries no
internal logic to reconstruct from. Anything with that shape — a published item
list, a scoring key, a table of norms — has to be transcribed.

**A short instrument is not evidence for a long one.** New Moon is verbatim
correct and sat beside Full Moon for four months, which made the whole set look
sound. Ten items can be reproduced exactly; a hundred and twenty cannot, and
the two were treated as though the same method worked for both.
