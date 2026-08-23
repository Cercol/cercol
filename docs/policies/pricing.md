# What Cèrcol costs

**Status:** settled, 2026-08-23.

## Nothing is paid

Every instrument is free. New Moon, First Quarter and Full Moon, including
the Witness ratings that come with Full Moon. No card, no trial, no tier.

An account is needed to reach Full Moon, and the account grants access on
creation while launch slots remain (`BETA_TOTAL` in `worker/src/db.js`). That
is the launch promotion. It is not a price.

## Why this document exists

Reviewers of the ranking and comparison articles told us the "free" claim was
false, because at the time Full Moon was a one-time payment and the articles
said the assessment was free. They were right then.

**They are not right now.** An article that says Cèrcol is free is accurate.
Do not "correct" it back.

## What still exists in the code, and does not contradict this

The Stripe checkout, the paywall screen behind `profile.premium`, and the
privacy sections describing how a payment would be handled are all still
there. Nobody reaches them while launch slots remain. They are dormant
machinery, not a price, and their presence is not evidence that something
costs money.

## What is currently wrong and has not been fixed

The prose call-to-action blocks in the seven most-read blog articles were
rewritten on 2026-08-23, hours before this decision, and they say Full Moon
is "a one-time payment, never a subscription". That is now false, in seven
articles across six languages, 55 sentences. It is logged as a plan step and
is not urgent: it understates the offer rather than overstating it, which is
the safe direction to be wrong in.

## What would change this

A decision to charge. If that happens, this document is rewritten first and
the copy follows it, rather than the copy drifting and the document catching
up.
