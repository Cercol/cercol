# Translation and language-review policy

This is the brief every translator and language reviewer works from, human
or agent. It exists because prose briefs alone do not hold: in the August
2026 German pass, six reviewers were each given the same instructions and
each invented a different, individually defensible rule for the same five
words. The corpus ended up carrying all of them.

The fix is three things working together, and none of them is enough alone:

1. **This document** says what to do and, where it matters, why.
2. **`docs/policies/glossary.<lang>.md`** says which words to use. It is
   generated from `src/locales/<lang>.json` by
   `scripts/build_glossary.py`, so it cannot drift from what the app shows
   a user.
3. **`scripts/check_translation.py`** enforces what a machine can check.
   Work is not finished until it passes.

Read the glossary for your language before starting. If a term is not in
it, it is not a term: use ordinary language.

## Scope of a language pass

A language reviewer changes wording. That is all.

Never change a fact, a number, an effect size, a study name, an author, a
year, a DOI, a URL, or the structure of the document. If something looks
wrong, leave it and report it. A reviewer who "fixes" a statistic has
produced an error that nobody will catch, because it now reads fluently.

Never add, remove, merge or reorder sections. Every heading, list item,
table row, blockquote and code block stays. Only the words inside change.

## Vocabulary rules

**Dimensions and concepts go in the target language.** Präsenz, not
Presence. Vincle, not Bond. A reader who sees "Bindung" in the app and
"Bond" on the blog has no way to know they are the same thing. The
academic Big Five term may appear once in parentheses on first mention,
because that is what earns the search impression.

**Instrument names follow the app.** Use exactly the form in your
glossary. This rule used to read "never translated", which was wrong: every
non-English locale translates them, so the policy described a product that
does not exist. Whether they should be translated is an open product
question. Until it is settled, the blog matches the interface.

**The peer-rating concept is the Witness**, in the target language's word
for it, and never "observer" in any language. `Beobachter`, `observador`,
`observateur` are wrong when they name this concept. They are fine when a
cited study genuinely means an observer.

**Academic names are required on the blog and forbidden in the app.** Big
Five, OCEAN, IPIP, NEO, AB5C: they must appear in blog titles, meta
descriptions and body text, because that is where search traffic comes
from, and they must never appear in the interface. See CLAUDE.md.

The five factor names work differently from the acronyms. Give the English
form on first mention, then the target language for the rest of the
article. The English earns the search impression once; forcing it through
every inflected sentence afterwards costs fluency and buys nothing. The
Spanish translator made this case with "una Agreeableness baja", which is
what the earlier all-English rule produced, and it was right.

Figure and diagram labels are the exception and stay English: they carry no
grammar, and the coordinates are drawn for those strings.

Cèrcol's own dimension names go in the target language everywhere. The
distinction is easy to miss: Bindung is a Cèrcol dimension, Agreeableness
is the academic factor it maps onto.

**The twelve roles are the twelve in the glossary.** No others. If a draft
names an animal that is not on that list, the draft is wrong, not the
list. This is not hypothetical: `the-12-cercol-team-roles-explained`
shipped in six languages describing five animals that do not exist in
`src/utils/role-scoring.js`.

## Writing rules

**No em dashes anywhere.** Not in titles, descriptions, body text, HTML
comments or SVG labels. Use a hyphen, a colon, or a pair of commas. This
is project-wide (`docs/policies/conventions.md`) and it is checked.

**Titles 60 characters or fewer. Descriptions 155 or fewer.** Longer ones
are truncated in search results. German titles were running to 102
characters, which is the most likely reason 1,765 German impressions
converted at zero clicks.

**Write as a native journalist would, not as a translator does.** The
recurring failures worth naming, because they showed up in almost every
article:

- Calques of "take a test". Use the verb your language actually uses for
  sitting an assessment.
- English word order surviving into a language that does not allow it.
- Nominalisation where the language prefers verbs.
- Filler that only exists because the English had it: "it is important to
  note that", "in this article we will".
- Mixed address. Pick the formal or informal register the article already
  leans on, then hold it to the end, including tables, captions and
  calls to action.
- The typography of the target language: quotation marks, decimal
  separators, thousands separators, spacing before units and percent.

## Changing the source after translation has started

A one-word change in English is not a one-word change downstream. Two
cases from the roles article, both invisible in an English diff:

- Replacing "dimensions" with "factors" in a caption flipped the pronoun
  that followed it in French, from `elles` to `eux`.
- Swapping the worked example from Bee to Owl changed the gender of the
  participle in Catalan, Spanish, French and German, and in French it also
  changed which agreement the phrase "both on the social plane" takes,
  because Presence and Bond are of different genders there.

So a correction round tells translators what changed and why, and lets each
one decide the scope of their own edit. It never ships a diff for them to
apply mechanically, and a reviewer never checks a translation by diffing it
against the previous version of itself.

## Statistical typography

Decimal separators follow the target language: `r = 0,31` in German,
Spanish, Catalan, French and Danish. Apply this only to statistics. DOIs,
version numbers, URLs and SVG coordinates keep their dots, and a comma
inside an SVG path silently breaks the drawing.

## Numbers that change meaning across languages

English **billion** is 10^9. In Catalan, Spanish, French, German and Danish
the cognate is 10^12. A literal rendering inflates the figure a thousandfold
and still looks plausible, because the word is the same. Write out the value
in the target language's own scale, and say in your report that you did.

The same care applies to a term split across a line wrap. Markdown renders
`Big\nFive` and `Big Five` identically, so a wrapped term reads correctly and
is invisible to any literal check, including
`scripts/check_translation.py`. Do not let a required term straddle a line
break.

## Definition of done

1. `python3 scripts/check_translation.py --lang <lang>` passes.
2. Every factual doubt is written down and handed back, not resolved.

The second is not optional. In the German pass the reviewers surfaced
three DOIs pointing at the wrong paper, a corrupted author name, four
articles with no translation at all, and a dozen unsourced statistics that
contradicted their own body text. None of that was in scope, and all of it
mattered more than the wording.
