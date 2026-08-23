# What Cèrcol collects, and why publishing it needs no consent flow

**Status:** settled, 2026-08-23. Do not reopen this without new facts.

## What a response is

A completed instrument produces five numbers between 1 and 5, plus which
instrument, which language, and a date. Facet scores are the same five
dimensions at finer grain. That is the whole record.

## What it is not

- **No IP address is stored.** Nothing in `worker/src/` writes one.
- **No free text.** There is no field a person can type themselves into.
- **The email is never published.** It lives on `profiles`, not on `results`,
  and the dataset is the `results` side.
- **The response cannot identify anyone.** Five ordinal scores on a public
  instrument, in one of six languages, on a date. There is no combination of
  those that singles a person out.

## The position

This is an anonymous survey. Publishing the responses is publishing survey
data, which is what survey data is for, and nobody whose answers appear in it
has had a right infringed. The privacy page has always said the de-identified
scores are released as an open dataset, and that statement is accurate and
sufficient.

**Do not add a consent checkbox to the instruments.** It was built on
2026-08-23 and removed the same day. It is friction on the screen that decides
whether someone starts at all, and worse than the friction, it *implies a risk
that does not exist*: a person asked to consent reasonably concludes there is
something to consent to.

**Do not raise this again as a blocker.** If a journal or an archive asks for
an ethics statement later, the statement is this document plus the schema. An
ethics statement is written when a submission needs one, from facts that are
already true. It is not a gate on collecting the data.

## What would change this

Only a change to what is collected. If Cèrcol ever stores an IP, a free-text
field, an open-ended answer, or anything joining a response to a person inside
the published table, this document is void and the question is genuinely open
again. Until then it is not.
