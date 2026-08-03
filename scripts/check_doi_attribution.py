#!/usr/bin/env python3
"""Catch DOIs that resolve but point at a different paper than the citation says.

# Spec: docs/policies/conventions.md

`scripts/check_dois.py` answers "does this DOI resolve". That is the easy
half. The failure that actually reaches readers is a DOI that resolves
perfectly and belongs to somebody else's paper, so the article looks
impeccably sourced while crediting the wrong work. Migrations 031, 033,
034, 036 and 038 all exist because of it, and each was found by hand.

This finds them mechanically. Crossref returns the author, year, title and
container for any DOI. The citation text next to the link states an author
and a year. Comparing the two is a string comparison, not a judgement call:

    "Widiger et al. (2014), doi:10.1016/j.jrp.2014.05.003"
     -> Crossref: Johnson, 2014, Journal of Research in Personality
     -> surname mismatch, reported

Reports rather than fails on a near miss. "Judge and Bono" against a
Crossref record listing six authors is normal citation practice, and a
tool that cries wolf on those gets muted.

Usage:
    DATABASE_URL=... python3 scripts/check_doi_attribution.py
    DATABASE_URL=... python3 scripts/check_doi_attribution.py --lang en --limit 20
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import sys
import time

import asyncpg
import httpx

CROSSREF = "https://api.crossref.org/works/"
UA = {"User-Agent": "cercol-doi-attribution/1.0 (mailto:hello@cercol.team)"}

# The citation normally sits just before the link. 220 characters is enough
# for "Author et al. (Year), *Journal*" and short enough not to drag in the
# previous sentence's authors.
LOOKBACK = 220

_YEAR = re.compile(r"\b(19|20)\d{2}\b")
# A surname: capitalised, at least three letters, not a sentence opener we
# care about. Accented characters are in, because the corpus cites them.
_SURNAME = re.compile(r"\b([A-ZÀ-Ý][a-zà-ÿ]{2,})\b")

# Words that look like surnames in the lookback window but never are.
_STOPWORDS = {
    "The", "This", "That", "These", "Those", "Research", "Studies", "Study",
    "Meta", "Analysis", "Journal", "Personality", "Psychology", "Applied",
    "Social", "Review", "Bulletin", "Assessment", "Science", "Big", "Five",
    "Both", "One", "Two", "Their", "There", "When", "What", "While", "For",
    "See", "According", "Source", "Sources", "Further", "Reading", "Cercol",
}


def fetch(client: httpx.Client, doi: str) -> dict | None:
    try:
        r = client.get(CROSSREF + doi, headers=UA, timeout=20)
        if r.status_code != 200:
            return None
        m = r.json()["message"]
    except Exception:
        return None
    authors = [a.get("family", "") for a in m.get("author", []) if a.get("family")]
    parts = (m.get("issued", {}).get("date-parts") or [[None]])[0]
    container = (m.get("container-title") or [""])[0]
    return {
        "authors": authors,
        "year": parts[0] if parts else None,
        "title": (m.get("title") or [""])[0],
        "container": container,
    }


def _strip(doi: str) -> str:
    """Drop trailing prose punctuation, keeping parentheses that belong."""
    while doi:
        if doi[-1] in ".,;:*_":
            doi = doi[:-1]
        elif doi[-1] == ")" and doi.count("(") < doi.count(")"):
            doi = doi[:-1]
        else:
            break
    return doi


def citation_context(body: str, doi: str) -> str:
    """The text immediately preceding a DOI mention."""
    idx = body.lower().find(doi.lower())
    if idx < 0:
        return ""
    return body[max(0, idx - LOOKBACK):idx]


# "a meta-analysis of X" is a claim about the strength of the evidence, not
# a flourish. A paper that is one nearly always says so in its own title or
# subtitle, so the absence of that word is a reliable prompt to check.
# Two things the obvious pattern gets wrong. Crossref titles use
# typographic dashes rather than the ASCII hyphen, so "META-ANALYSIS" needs
# the whole dash range. And a title far more often says "meta-analytic
# review" than "meta-analysis", so the stem cannot end at analys/analyz.
# Both bugs made the check report real meta-analyses as mislabelled.
# ASCII hyphen last: anywhere else in the class it opens a character range.
_DASHES = "\u2010\u2011\u2012\u2013\u2014\u2015\u2212-"
_META = re.compile(rf"meta[\s{_DASHES}]?analy", re.IGNORECASE)


def compare(context: str, record: dict) -> list[str]:
    problems = []

    if _META.search(context) and not _META.search(record["title"]):
        problems.append(
            f"cited as a meta-analysis; Crossref title does not say so: "
            f"{record['title'][:80]!r}"
        )
    surnames = {s.lower() for s in _SURNAME.findall(context) if s not in _STOPWORDS}
    # Crossref returns some records in full uppercase (BARRICK, MOUNT), which
    # a case-sensitive comparison never matches.
    crossref_authors = {a.split()[-1].lower() for a in record["authors"]}

    if crossref_authors and surnames:
        # A hit on any author is enough: "Judge et al." naming only the first
        # of six is correct citation practice, not an error.
        if not (surnames & crossref_authors):
            problems.append(
                f"no cited surname matches Crossref authors "
                f"{sorted(crossref_authors)[:4]}; text mentions {sorted(surnames)[:4]}"
            )

    years = {int(y) for y in re.findall(r"\b(?:19|20)\d{2}\b", context)}
    if record["year"] and years and record["year"] not in years:
        # Preprint and issue years differ by one often enough to be noise.
        if all(abs(record["year"] - y) > 1 for y in years):
            problems.append(f"cited year {sorted(years)} vs Crossref {record['year']}")

    return problems


async def load(langs: list[str]) -> list[tuple[str, str, str]]:
    conn = await asyncpg.connect(dsn=os.environ["DATABASE_URL"])
    await conn.set_type_codec("jsonb", encoder=json.dumps, decoder=json.loads,
                              schema="pg_catalog")
    try:
        rows = await conn.fetch("SELECT slug, content FROM blog_posts ORDER BY slug")
    finally:
        await conn.close()
    out = []
    for r in rows:
        for lang in langs:
            body = (r["content"] or {}).get(lang)
            if body:
                out.append((r["slug"], lang, body))
    return out


async def main() -> int:
    langs = [sys.argv[sys.argv.index("--lang") + 1]] if "--lang" in sys.argv else ["en"]
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else 0

    bodies = await load(langs)

    # DOI -> [(slug, lang, context)]. One Crossref call per distinct DOI, not
    # per occurrence: the corpus reuses the same twenty papers everywhere.
    # Parentheses are legal inside a DOI: 10.1016/S0092-6566(03)00046-1 is a
    # real identifier. Excluding ")" truncated three of them and reported
    # live DOIs as unknown, so the class allows a balanced pair and the
    # trailing strip below removes an unbalanced closer picked up from prose.
    doi_re = re.compile(r"\b(10\.\d{4,9}/[^\s\\\"'<>\]},]+)", re.IGNORECASE)
    seen: dict[str, list] = {}
    for slug, lang, body in bodies:
        for doi in {_strip(m.group(1)).lower() for m in doi_re.finditer(body)}:
            seen.setdefault(doi, []).append((slug, lang, citation_context(body, doi)))

    dois = sorted(seen)
    if limit:
        dois = dois[:limit]
    print(f"{len(dois)} distinct DOIs across {len(bodies)} bodies\n")

    flagged = 0
    with httpx.Client(follow_redirects=True) as client:
        for doi in dois:
            record = fetch(client, doi)
            time.sleep(0.2)   # Crossref asks for politeness, not a rate limit
            if record is None:
                print(f"  UNKNOWN   {doi}  (Crossref returned nothing)")
                continue
            for slug, lang, context in seen[doi]:
                problems = compare(context, record)
                if problems:
                    flagged += 1
                    print(f"  MISMATCH  {doi}")
                    print(f"            {slug} [{lang}]")
                    print(f"            Crossref: {', '.join(record['authors'][:3])} "
                          f"({record['year']}) {record['title'][:70]}")
                    for p in problems:
                        print(f"            {p}")
                    break   # one report per DOI is enough to act on

    print(f"\n{flagged} DOIs whose citation text disagrees with Crossref")
    return 1 if flagged else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
