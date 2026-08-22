# 2026-08-22 — The instruments were written from memory

- **Date of incident**: 2026-04-06 to 2026-08-22 (introduced in Phase 6.1,
  found four and a half months later)
- **Severity**: critical
- **Impact**: Cèrcol presented itself as an implementation of the IPIP-NEO-120
  and the IPIP-NEO-60. It is not. Roughly half the items are the wrong ones,
  twenty-one of the Full Moon items do not exist in the IPIP pool at all, three
  of the items that are correct sit in the wrong facet, and one of those is
  also keyed the wrong way. On top of that sit population norms from a study of
  a different item set, translations into six languages, and letters to
  researchers saying we follow their work.

## What is actually true

Measured on 2026-08-22 against the published sources, not estimated.

| instrument | claims to be | is |
| --- | --- | --- |
| New Moon, 10 items | TIPI (Gosling et al., 2003) | **Correct. 10 of 10 verbatim.** |
| Witness, 100 adjectives | AB5C lexical markers | **Correct, and already documented honestly**: the file says thirty are published markers and seventy are not. |
| First Quarter, 60 items | IPIP-NEO-60 (Maples-Keller et al., 2019) | 53 of 60 are real IPIP items. **23** are the published instrument's. |
| Full Moon, 120 items | IPIP-NEO-120 (Johnson, 2014) | 99 of 120 are real IPIP items. **61** are the published instrument's. **21 are not IPIP items at all.** |

Of the twenty-one, ten are a real item with a word changed, and eleven exist
nowhere in the 3,320-item pool at `ipip.ori.org/AlphabeticalItemList.htm`:
*Come prepared*, *Do my duty*, *Handle tasks efficiently*, *Don't beat around
the bush*, *Am easily embarrassed*, *Am distant with people*, *Do things at a
leisurely pace*, *Prefer quiet, peaceful settings*, *Have no interest in
poetry*, *Believe that we should be lenient in judging others*, *Get started on
things right away*.

Some of the edits move the construct. `Seldom feel joyful` is `Seldom feel
blue` with depression swapped for cheerfulness — a different facet in a
different domain.

### Three items are in the wrong place right now

These are items we share with the published instrument, so replacing the item
set is not what fixes them; reading the facet from the source is.

| item | where we have it | where it belongs |
| --- | --- | --- |
| `Act without thinking.` | Immoderation (n5), forward | **Cautiousness (c6), reverse** |
| `Tell the truth.` | Morality (a2) | Dutifulness (c3) |
| `Take advantage of others.` | Cooperation (a4) | Morality (a2) |

The first crosses domain *and* sign: it adds to Depth where it should subtract
from Discipline. It is in both instruments, and in First Quarter a facet is two
items rather than four, so it weighs twice as much there.

### The response scale is not the instrument's

The IPIP-NEO asks how *accurate* a description is, from Very Inaccurate to Very
Accurate. Cèrcol asks whether you *agree*. The norms were collected on the
former. Separately, the French scale had dropped the intensity qualifier at
points 2 and 4, so it was not even equidistant with the English one.

## How it happened

Commit `8d5aa536f`, 2026-04-07, "Phase 6.1". The file header cites Johnson
(2014) correctly. The items were not transcribed from that paper's list; they
were produced from a model's recall of it.

The signature is unmistakable once you look for it. The *structure* is perfect:
five domains, thirty facets in the right order with the right names, four items
each. The *items* are real: 99 of 120 exist in the IPIP pool, so nothing was
invented from nothing. But the *selection* — which four of the pool's items
Johnson chose for Self-Efficacy — is arbitrary information, and arbitrary
information is what recall loses. New Moon came through perfectly because ten
items is short enough to remember exactly; a hundred and twenty is not.

## The pattern, which is the actual finding

The same thing happened three times, in three different places, and nobody
noticed any of them until someone opened the source.

| what was generated | what was cited beside it | who checked |
| --- | --- | --- |
| An item selection | Johnson (2014) | nobody |
| Six translations | Vedel (2018), Thiry & Piolti (2023) | nobody |
| Population norms | Kajonius & Johnson (2019) | nobody |

There was no deception. A real citation was placed next to generated content,
and from then on the citation looked like the provenance. The missing step was
never a review of the output — it was opening the cited source and comparing.

The Danish case shows how cheaply it could have been caught. Of the sixty
English items present in both instruments, Danish renders twenty-two of them as
two *different* Danish sentences, and German eighteen; Catalan, Spanish and
French render all sixty identically. You cannot transcribe a published item
list and get two different sentences for the same item. One query would have
shown that the Danish was never Vedel's.

## What was done

- The canonical sets are now in the repository, taken from source and
  cross-checked between two independent publishers that agree on 115 of 120
  strings: `src/data/reference/ipip-neo-120.js` and `ipip-neo-60.js`. Tests
  fail if a facet does not hold exactly its four or two items.
- `INSTRUMENT_VERSION` and `docs/policies/dataset-versions.md` exist, so a
  change to an item is recorded and old answers stay distinguishable from new
  ones rather than silently mixing.
- My Results offers a retake on any result from an older version.
- Section `a11` of `src/data/distribution-plan.js` carries the replacement, in
  order, sources first and documentation last.
- The daily routine's prompt now forbids writing an item, a scale or a norm
  from memory, and says that failing to find one is an acceptable answer.

## What is still wrong as this is written

The instruments are not fixed yet. Full Moon still changes 59 items, First
Quarter 37. Until then the site describes them as things they are not, which is
a deliberate choice: correcting the claims now and correcting them back when
the items change is doing the work twice to end up in the same place.

## The rule that comes out of it

**A citation is not a provenance.** If a file cites a source, someone must have
opened that source and compared it, and the comparison should be recorded
somewhere a later reader can find. Where that is impossible, the honest options
are the two the other instruments already demonstrate: be the published thing
exactly, like New Moon, or be your own and say so plainly, like the Witness
file. What is not available is to be your own and cite someone else's.
