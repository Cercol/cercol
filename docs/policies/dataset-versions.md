# Dataset versions

A personality score is meaningless without the question that produced it. Two
rows reading `presence: 3.4` are the same number and different data if the
items behind them differ. This file is the record of which is which, so that
any later analysis can say "valid up to version N" instead of guessing.

Every row in `results` carries `instrument_version`. The client sends it, not
the Worker: a visitor on a cached bundle answered the items in that bundle, so
their bundle is the authority on what they were asked.

## What bumps the version

- An item's wording, in any of the six languages
- Which items belong to which scale
- The response scale or its labels
- The number or structure of Witness rounds

## What does not

**Norms.** Stored scores are raw means on the instrument's own scale, 1 to 5,
or 1 to 7 for New Moon. Norms are applied when a result is displayed. Renorming
changes what a person sees; it does not change the data, and it can be redone
over the whole history at any time. This is the reason raw means are stored.

**Copy, layout, and translations of the interface.** Only item text counts.

**Administration order.** On 2026-08-24 the on-screen order inside each
domain block changed from facet-grouped (each facet's twin items adjacent, an
artifact of the audit-friendly item files) to facet-rotated
(`src/utils/administration-order.js`), so consecutive items never probe the
same facet — the design principle of the published inventories, whose literal
sequence our sources do not carry. The items, their wording, their keying and
the response scale are identical, answers are keyed by item id, and at the
time of the change version 7 had a single respondent (the operator, that
day), so this was deliberately not treated as a new version.

**Scoring of derived outputs** (role fit, Witness comparison), which are
recomputed from the stored scores rather than stored themselves.

## Versions

### Version 7 — from 2026-08-22

**Every item exists in every language.** No reader meets an English sentence
in a test they chose in another language, which had been true for Danish on
seven items and Spanish on ten.

Those seventeen are not the publishers'. Vedel translated the IPIP-NEO-120 and
Frez Puente and Ortega Luque translated the IPIP-NEO-120, and Cèrcol's short
form is the IPIP-NEO-60, which holds items the 120 does not. Nobody had ever
translated them. They were written to match each publisher's hand and are
listed in `CERCOL_SUPPLIED` in `src/data/instrument-variants.js`, so that
"Cèrcol's Danish is Vedel's" stays a true sentence with a known exception
instead of a slightly false one. They are the first thing to replace if either
publisher supplies them, and the letters in the plan ask.

Two of the Spanish are a different case. Their page carries a different item
where ours has "Feel others' emotions", so there was nothing of theirs to take.
And "Make rash decisions" is a correction rather than a gap: their English
reads "Make **rush** decisions", a typo, and their Spanish follows it with
*decisiones rápidas*, which is fast rather than rash. A fast decision can be a
well-deliberated one, and the facet measures deliberation.

**Four surface defects, corrected, and the line they establish.** Vedel's "Am
always on the go" shipped as `Er altid i gang m ed noget.` with a space inside
*med*: her page splits that word across two `<font>` tags and the extractor put
a space where every tag had been. Checked across all 120 of her strings, it is
the only one affected. Her published text also has two items with no final full
stop and one spelling the Danish *succes* the English way, *success*. All four
are fixed.

So the rule needs its line drawn precisely, because "use it as published" and
"do not ship a misspelling" both sound obvious and pull opposite ways:

**Wording is the publisher's and is never touched. Orthography is corrected.**

Which word, which construction, which intensity, which item a string sits
beside: those are what was validated, and changing any of them quietly makes it
a different instrument. A missing full stop, a doubled space, a word split by a
markup tag, a word spelled the wrong language's way: none of those were
validated, none of them change what an item measures, and leaving them in makes
the set read as sloppy to the only people who would notice — native speakers of
that language.

Two tests hold the line: every string in every language ends in a full stop and
carries no stray whitespace.

### Version 6 — from 2026-08-22

**No language is half in English any more.** The 59 Full Moon and 26 First
Quarter items that arrived with the canonical item sets now have Catalan and
German. Both were written by a philologist against the English and against the
existing set, and both languages are complete at 120 and 60.

Catalan is the one language where translating was unavoidable: no published
translation exists anywhere and none is coming. German is scaffolding with a
known replacement, since Thunsdorff and Treiber's validated translation exists
and a letter asking for it is queued; it gets a reader out of English while
that is answered.

Spanish and Danish stay short where their published sources are short: 118 and
52 for Spanish, 120 and 53 for Danish. Those gaps fall back to English rather
than to something invented, and the counts are pinned by a test so a gap that
grows is noticed.

**Three philologists reached the same conclusion separately.** In Catalan,
French and German, *liberal* names the pro-market centre-right, which is close
to the opposite of the sense "Tend to vote for liberal political candidates"
carries. Left literal, a positively keyed Liberalism item would have attracted
exactly the respondents it is meant to score low. All three say *progressive*.
Gravel's Canadian keeps *libérales*, because there the word carries the party
sense he was writing for.

Four defects in the existing German were found while translating around them:
`Kandidaten*innen` is a malformed gender star, `Nehme es gerne ruhig an` is the
idiom *es ruhig angehen lassen* torn apart and is not German, `Fühle, dass ich`
is an anglicism where German takes *Habe das Gefühl, dass*, and "getting
emotional" had become "letting themselves be guided by feelings", a different
and more judgemental claim.

### Version 5 — from 2026-08-22

**A language can now have more than one variety, and the instrument says which
one was answered.**

The published translations are not written in one variety per language.
Gravel's French is Canadian; the Spanish IPIP-NEO-120 is Mexican. Both are the
real thing and both were taken verbatim, which is exactly why they are worth
having. The choice between publishing someone else's dialect to every reader
and editing a published instrument until it stops being one is a false choice:
keep the source intact and declare the variety.

So the interface stays one language per reader, and the instrument carries a
variety. French offers two:

- **fr-CA**, Gravel as published, unchanged.
- **fr-FR**, an adaptation of it for European readers, which is what Thiry and
  Piolti describe doing and never published. It stores only the strings it
  changes, forty of a hundred and eighty, so the file shows the difference
  instead of a second copy.

Eighteen of those forty are the point médian, which Gravel's masculine-only
text lacks and the other five languages have. Twenty-two are substantive, and
one of them matters more than the rest: in European French *libéral* reads as
pro-market and right-leaning, so Gravel's "valeurs sociales libérales" on a
positively keyed Liberalism item would have attracted exactly the respondents
it is meant to score low. fr-FR says *progressistes*. The conservative item
needed no change, because *traditionnelles* reads the same on both sides of the
Atlantic.

The review also caught one the earlier pass had missed: *sympathiser avec* in
European French means to strike up a friendship, so "Sympathize with the
homeless" read as getting on well with them rather than feeling for them.

Spanish carries es-MX and no choice, because only one variety exists. The
result records the variety it was answered in rather than the bare language,
because two people answering "in French" may not have answered the same
sentences.

### Version 4 — from 2026-08-22

**French and Spanish stop being translations.** Every French string is Mathew
Gravel's published French translation of the IPIP-NEO-300, hosted by the IPIP
itself, 180 of 180 items. Every Spanish string is the Mexican translation of
the IPIP-NEO-120 by David R. Frez Puente and Leticia Ortega Luque, also hosted
by the IPIP: 118 of 120 Full Moon items and 52 of 60 First Quarter items. Both
verbatim, matched on the English source string.

With Danish already Vedel's, three of the five non-English languages now carry
a published translation rather than one of ours.

One Spanish item was deliberately not taken. Their English reads "Make rush
decisions", a typo for "rash", and their Spanish follows it: "Tomo decisiones
rápidas" is *fast*, not *rash*. Copying a published string is right; copying a
construct error because it is published is not.

Three French items were transposed and are now swapped back. Gravel's own
table pairs "Tend to vote for liberal political candidates" with *valeurs
sociales traditionnelles* and the conservative item with *libérales*, and his
key column is corrupt in the same neighbourhood, so those rows are damaged in
his source rather than a choice. Taken verbatim they scored a socially
conservative French respondent as high-Liberalism and the reverse, on two of
the four Full Moon compass items and half of First Quarter's. Swapping them
puts each beside the English it translates and every word remains his.

That is the second published defect this version declines to copy, after the
Spanish "rush/rash". The rule that a published string is taken as published
holds for wording. It does not hold for a string that is demonstrably beside
the wrong item.

What is left: Catalan, where no translation exists anywhere and never will, and
German, where one exists and cannot be downloaded. Thunsdorff and Treiber at
Koblenz-Landau translated and back-translated the 300 IPIP items and validated
them against the German NEO-PI-R, but the items are held by them rather than
published. That is step s12: a letter, not a translation.

### Version 3 — from 2026-08-22

**The instruments became the ones they cite, and the response scale became
theirs too.** Two changes, one version, because no response was recorded
between them.

Full Moon is Johnson's IPIP-NEO-120 and First Quarter is Maples-Keller et
al.'s IPIP-NEO-60, item for item, read from `src/data/reference/`. 59 Full Moon
items and 37 First Quarter items changed, and the 21 Full Moon items that
existed in no IPIP list are gone. Facet and keying come from the reference for
every item, which is what fixed three that were already correct and in the
wrong place: `Act without thinking.` moved from Immoderation forward to
Cautiousness reverse, crossing domain and sign at once.

The scale moved from agreement to the IPIP-NEO's own accuracy format, because
that is what the norms were collected on. Asking whether someone *agrees* and
scoring them against norms collected by asking how *accurately* a statement
describes them is a mismatch no wording fixes. All five points are verbalised
on both viewports now; the desktop layout had shown only the two poles, and a
fully labelled scale and an endpoint-labelled one do not produce the same
distribution.

Danish is no longer a translation: all 120 Full Moon items, 51 of the 60 First
Quarter items, and the scale anchors are Anna Vedel's published Danish, used as
published. The other four languages carry a gap where the English is new and
fall back to English rather than shipping an invented translation.

New Moon is untouched. It is the TIPI, genuinely an agreement instrument,
scored against different norms, and it keeps its 7-point agreement scale.

Nothing crosses this boundary. A version 1 answer and a version 3 answer are
answers to different questions on a different scale, and no rescoring recovers
one from the other.

*Version 2 was reserved for a French and Danish correction that was superseded
by this rebuild and never shipped.*

### Version 2 — from 2026-08-22

The Catalan items, corrected. English, Spanish, French, German and Danish are
untouched, so a row in any of those languages is comparable across this
boundary; only Catalan rows are not. Two Catalan rows existed at the time.

A philologist review of all 190 Catalan items against their English source
found seventy with a defect and fourteen blocking, and judged the set to be
unreviewed machine output. What changed:

- **One item measured the wrong construct.** "Don't beat around the bush" read
  `No m'embarbusso`, which means "I don't get tongue-tied". Straightforwardness
  had become speech fluency.
- **Words that do not exist in Catalan**, formed by attaching Catalan endings
  to Spanish stems: `Em panique`, `No m'ande amb rodeos`, `Em rende`.
- **Grammatical impossibilities**: `Prenga decisions` (subjunctive for
  indicative), `Treball dur` (the noun for the verb), `Em pose a les coses`
  (the construction requires an infinitive).
- **Invented feminine forms** on invariable adjectives, from applying the
  gender-slash template mechanically: `incapaça`, `indiferenta`, and
  `incapaç/incapaç` where the template fired twice on the same word.
- **Typos in production**: `aggrade`, `pendre`.
- **Two varieties in one item bank.** `full-moon.js` was Central Catalan to
  item 86 and Valencian after, with three sentences mixing both inside a single
  clause. Unified to the Valencian used throughout `first-quarter.js`.
- **Forty of the sixty shared items** rendered differently in the two
  instruments. Collapsed to one string each, taken from First Quarter.
- Softenings that changed intensity (`Em molesta` for *Hate to*), calques
  (`cridar l'atenció sobre mi mateix`, `trencar les normes`, `imaginació
  vívida`), and register that was too literary for a spoken-register item.

The English is not touched anywhere, so the constructs are unchanged and the
scoring keys still apply. What changed is which Catalan sentence a respondent
reads.

### Version 1 — from 2026-06-01

The four instruments as launched: New Moon (10 items, 1 to 7), First Quarter
(60 items, 1 to 5), Full Moon (120 items, 1 to 5), Witness (13 rounds of 3
picks). All items from the public-domain IPIP pool, in six languages.

Every row collected before 2026-08-22 carries this version, backfilled by
`worker/schema/004_instrument_version.sql`. That backfill is a statement of
fact rather than an assumption: the item files have not changed since
collection began. The only commit touching them since 2026-06-01 corrected
three DOIs in the citations (`1b34ce1cf`).

Two things did change inside version 1, and neither affects the stored data:

- **2026-08-04, New Moon norms** (`aaaf7650e`). New Moon is the TIPI; its prior
  had been the IPIP 1-to-5 statistics stretched onto a 1-to-7 scale. Replaced
  with the TIPI's own published norms. This changed how results are presented
  and left every stored score untouched.
- **2026-08-04, Witness structure** (`be5761ef5`). Twenty rounds of two picks
  became thirteen rounds of three. This would have split the version, but no
  Witness session had been completed at that point, so version 1 means the
  13-by-3 format throughout.

## Publishing

The open dataset is exported without `user_id`, `anon_id`, `referrer` or the
`utm_*` columns. What leaves is the score, the instrument, the language, the
date, and this version. That export is anonymous whether or not the row was
collected under an account, which is why publication does not depend on who was
signed in at the time.
