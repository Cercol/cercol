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
import unicodedata

import httpx

# A DOI is "10." + registrant code + "/" + suffix. The suffix runs to the
# first whitespace or markdown delimiter; trailing sentence punctuation is
# stripped below because `[doi:10.x/y](...)` and `(doi: 10.x/y)` both occur
# in the corpus. Balanced parens inside a suffix are real and load-bearing
# (10.1016/S0092-6566(03)00046-1), so ')' is only trimmed when unmatched.
_DOI = re.compile(r"\b(10\.\d{4,9}/[^\s\"'<>\]}]+)", re.IGNORECASE)

# Punctuation that can only be sentence/markdown noise at the end of a DOI.
# `*` and `_` are here because the corpus wraps whole citations in emphasis:
# `*[Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595)*` leaves a `)*`
# tail, and the `*` blocked the paren rule below from ever seeing the `)`.
# Over-trimming a real suffix would only skip a check; under-trimming reports
# a live DOI as dead and blocks a publish, so the loop leans toward trimming.
_TRAILING = ".,;:*_"

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


def crossref_record(client: httpx.Client, doi: str) -> dict | None:
    """First author surname, year and title from Crossref, or None."""
    try:
        r = client.get(f"https://api.crossref.org/works/{doi}", timeout=20)
        if r.status_code != 200:
            return None
        m = r.json()["message"]
        return {
            "authors": [a.get("family", "") for a in (m.get("author") or []) if a.get("family")],
            "year": ((m.get("issued", {}).get("date-parts") or [[None]])[0] or [None])[0],
            "title": (m.get("title") or [""])[0],
            "journal": (m.get("container-title") or [""])[0],
        }
    except (httpx.HTTPError, ValueError, KeyError, IndexError):
        return None


# Capitalised surname tokens, allowing internal hyphens (Jensen-Campbell).
_SURNAME = re.compile(r"\b([A-Z][a-zA-Z]+(?:-[A-Z][a-zA-Z]+)?)\b")

# Capitalised words that are not surnames. Without this, "See also [doi:...]"
# reads "See" as an author and every bare cross-reference reports a mismatch.
# Sentence openers, trait and journal vocabulary; deliberately generous,
# because a missed check is cheaper than a false accusation.
_NOT_A_NAME = {
    "the", "this", "that", "these", "those", "there", "their", "they", "them",
    "see", "also", "both", "and", "but", "for", "from", "with", "when", "where",
    "why", "how", "what", "who", "one", "two", "its", "his", "her", "our",
    "research", "study", "studies", "meta", "analysis", "review", "paper",
    "full", "available", "further", "reading", "sources", "references", "note",
    "big", "five", "ocean", "ipip", "neo", "doi", "url", "http", "https",
    "journal", "personality", "social", "psychology", "psychological",
    "bulletin", "science", "sciences", "american", "european", "british",
    "applied", "personnel", "quarterly", "administrative", "educational",
    "measurement", "occupational", "organizational", "organisational",
    "management", "academy", "human", "resource", "performance", "behavior",
    "behaviour", "health", "work", "stress", "inquiry", "assessment",
    "conscientiousness", "extraversion", "agreeableness", "neuroticism",
    "openness", "team", "teams", "wikipedia", "plos", "pone", "cercol",
}


def _fold(s: str) -> str:
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()


def attribution_mismatch(text: str, doi: str, record: dict | None) -> str | None:
    """Reason the prose's stated author/year disagrees with the DOI's record.

    Returns None when they agree, when the record is unavailable, or when the
    prose names nobody near the DOI (a bare "see also [doi:...]" carries no
    attribution to contradict, and guessing from further away produces false
    positives).

    This catches what resolution cannot. A DOI can be perfectly live and point
    at an entirely unrelated paper: the Jul 2026 corpus audit found 17 of
    those, including a burnout meta-analysis whose DOI resolved to a one-line
    prize announcement. Every one passed the 404 check.
    """
    if not record or not record.get("authors"):
        return None
    i = _fold(text).find(_fold(doi))
    window = text[max(0, i - 260):i + 40] if i >= 0 else text

    def tokens(name: str) -> set[str]:
        # Two characters, not three: real surnames in this corpus include "Oh"
        # (Oh, Wang & Mount 2011), which a length-3 floor silently skipped.
        return {t for t in re.split(r"[-\s]", _fold(name)) if len(t) >= 2}

    actual = set().union(*(tokens(a) for a in record["authors"]))
    stated_names = {_fold(n) for n in _SURNAME.findall(window)} - _NOT_A_NAME
    stated = set().union(*(tokens(n) for n in stated_names)) if stated_names else set()
    # Nothing that looks like a surname: no attribution asserted, nothing to check.
    if not stated:
        return None
    if stated & actual:
        return None

    first = record["authors"][0]
    year = record.get("year")
    return (f"prose cites {sorted(stated_names)[:3]} but {doi} is "
            f"{first} et al. ({year}): {record.get('title', '')[:70]}")


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
