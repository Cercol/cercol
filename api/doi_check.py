"""
DOI resolution guard for blog article bodies.

# Spec: docs/architecture/seo-pipeline.md

Three batches of unresolvable DOIs have shipped to production (migrations
031, 033, 034). In every case the citation TEXT named a real paper and only
the DOI digits were wrong, so no amount of prose review caught it: the only
thing that distinguishes a good DOI from a fabricated one is asking the
resolver.

This module is that ask, and it is the single implementation both entry
points use:

  * api/blog.py  - admin create/update reject a body carrying a dead DOI.
  * scripts/check_dois.py - CI gate over content-seeding migration SQL,
    plus a --live sweep of the published corpus.

Resolution deliberately does NOT follow redirects. A registered DOI answers
302 with a Location pointing at the publisher; an unregistered one answers
404 at doi.org itself. Stopping at the resolver keeps the check fast and
sidesteps publisher bot-detection entirely -- APA, SAGE and JSTOR all serve
403 to non-browser agents, which is exactly the noise that made
external_links_check treat 403 as "flaky, not broken".

Fail-open on transport errors, fail-closed on 404. A doi.org outage must
never block publishing; a definitively unregistered DOI always must.
"""

from __future__ import annotations

import re

import httpx

# A DOI is "10." + registrant code + "/" + suffix. The suffix runs to the
# first whitespace or markdown delimiter; trailing sentence punctuation is
# stripped below because `[doi:10.x/y](...)` and `(doi: 10.x/y)` both occur
# in the corpus. Balanced parens inside a suffix are real and load-bearing
# (10.1016/S0092-6566(03)00046-1), so ')' is only trimmed when unmatched.
_DOI = re.compile(r"\b(10\.\d{4,9}/[^\s\"'<>\]}]+)", re.IGNORECASE)

# Punctuation that can only be sentence/markdown noise at the end of a DOI.
_TRAILING = ".,;:"

RESOLVER = "https://doi.org/"


def _trim(doi: str) -> str:
    """Strip trailing markdown/sentence punctuation, keeping balanced parens."""
    while doi:
        if doi[-1] in _TRAILING:
            doi = doi[:-1]
        elif doi[-1] == ")" and doi.count("(") < doi.count(")"):
            doi = doi[:-1]
        else:
            break
    return doi


def extract_dois(text: str) -> list[str]:
    """Every distinct DOI in one markdown body, order preserved.

    Catches all three forms the corpus uses: a bare `doi:10.x/y`, a
    `[label](https://doi.org/10.x/y)` link destination, and a DOI sitting in
    running prose. Case is normalised because DOIs are case-insensitive and
    the same paper appears both ways across translations.
    """
    if not text:
        return []
    found = (_trim(m.group(1)) for m in _DOI.finditer(text))
    return list(dict.fromkeys(d.lower() for d in found if d))


def dois_in_content(content: dict | None) -> dict[str, list[str]]:
    """Map DOI -> the language keys it appears in, across a content JSONB dict."""
    out: dict[str, list[str]] = {}
    if not isinstance(content, dict):
        return out
    for lang, body in content.items():
        if not isinstance(body, str):
            continue
        for doi in extract_dois(body):
            out.setdefault(doi, []).append(lang)
    return out


def resolve(client: httpx.Client, doi: str) -> int | None:
    """Status code from doi.org for one DOI, or None if it could not be asked.

    None means "no verdict" (timeout, DNS, connection reset), never "bad".
    """
    try:
        r = client.head(f"{RESOLVER}{doi}", timeout=10, follow_redirects=False)
        return r.status_code
    except httpx.HTTPError:
        return None


def is_unresolvable(status_code: int | None) -> bool:
    """True only for a definitive 404 from the resolver.

    Anything else -- 302 (registered), 5xx, or None (unreachable) -- passes.
    Mirrors external_links_check.classify_broken, minus the connection-error
    case: that job probes arbitrary sites where a dead host means a dead
    link, whereas here an unreachable doi.org means an unreachable checker.
    """
    return status_code == 404


def unresolvable_dois(content: dict | None, client: httpx.Client) -> list[tuple[str, list[str]]]:
    """[(doi, langs)] for every DOI in `content` that doi.org reports as 404.

    Each distinct DOI is probed once, however many languages repeat it.
    """
    found = dois_in_content(content)
    return [
        (doi, langs)
        for doi, langs in found.items()
        if is_unresolvable(resolve(client, doi))
    ]
