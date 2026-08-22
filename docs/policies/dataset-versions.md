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

**Scoring of derived outputs** (role fit, Witness comparison), which are
recomputed from the stored scores rather than stored themselves.

## Versions

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
