#!/usr/bin/env python3
"""Machine-checkable half of the translation policy.

# Spec: docs/policies/translation.md

Reads blog_posts straight from PostgreSQL and reports, per language:

  - em dashes anywhere in title, description or body
  - titles over 60 characters, descriptions over 155
  - English dimension names (Bond, Depth, Presence) left in a non-English body
  - animals that are not one of the twelve in src/utils/role-scoring.js
  - links, DOIs and heading counts that drifted from the English original
  - a language that is missing entirely for a published article

The English-dimension-name check is the one that would have caught the
August 2026 drift on the day it happened rather than a corpus later, which
is the whole reason this file exists.

Usage:
    DATABASE_URL=... python3 scripts/check_translation.py
    DATABASE_URL=... python3 scripts/check_translation.py --lang de
"""
from __future__ import annotations

import asyncio
import json
import os
import pathlib
import re
import sys

import asyncpg

ROOT = pathlib.Path(__file__).resolve().parent.parent
LANGS = ["en", "ca", "es", "fr", "de", "da"]
MAX_TITLE, MAX_DESC = 60, 155

# "Vision" and "Discipline" are ambiguous: they are real words in several of
# the target languages, so flagging them would drown the signal. Bond, Depth
# and Presence are unmistakably English here.
ENGLISH_DIMENSIONS = ["Bond", "Depth", "Presence"]

# CLAUDE.md: the peer-assessment instrument is the Witness, and it has a name
# in every language. The English word appeared 81 times across four of them
# before this check existed. Catalan had none, which is what done looks like.
WITNESS = {"ca": "Testimoni", "es": "Testigo", "fr": "Témoin",
           "de": "Zeug", "da": "Vidne"}

# And never "observer" for this concept: it invites a surveillance reading of
# something that is a colleague choosing to describe you.
#
# The word does have legitimate uses and this check cannot tell them apart,
# so it reports rather than forbids. The three found in this corpus, all
# correct: Belbin's own Observer Assessment, "outside observers" in the
# sentence about Hofstee et al. (1992) where an observer is a rater in a
# published study, and "observer-report" as the field's term of art.
OBSERVER = {"ca": r'observador', "es": r'observador', "fr": r'observateur',
            "de": r'Beobachter', "da": r'observatør'}

# The one article that enumerates the twelve roles, and therefore the one
# that can silently invent them.
ROLES_ARTICLE = "the-12-cercol-team-roles-explained"


def canonical_animals() -> set[str]:
    """The twelve English animal names, read from the scoring module so this
    check cannot disagree with the product."""
    text = (ROOT / "src" / "utils" / "role-scoring.js").read_text()
    block = text.split("const CENTROIDS", 1)[1].split("}", 1)[0]
    return set(re.findall(r'//\s*(\w+)\s', block))


def localised_animals(lang: str) -> set[str]:
    roles = json.loads((ROOT / "src" / "locales" / f"{lang}.json").read_text())["roles"]
    return {v["name"] for k, v in roles.items() if k.startswith("R")}


def links(body: str, lang: str = "en") -> list[str]:
    """External links, with a localised Wikipedia counted as the English one.

    A translation that points at es.wikipedia.org/wiki/Venta where the
    English points at en.wikipedia.org/wiki/Sales has not lost a link, it has
    made a better one: the reader lands on an article they can read. Five
    languages did this on the sales article and were reported as divergent
    until the subdomain and the article slug were normalised away.
    """
    # Collapsed to a bare marker, not to the English URL: the article slugs
    # genuinely differ, so all this can check is that the translation links
    # out to Wikipedia as many times as the English does.
    return sorted(
        re.sub(r'^https?://\w{2}\.wikipedia\.org/wiki/.*$', 'wikipedia', url)
        for url in re.findall(r'\]\((https?://[^)\s]+)\)', body)
    )


def dois(body: str) -> list[str]:
    # Trailing punctuation is part of the sentence, not of the DOI. Without
    # the strip, a citation that ends a sentence in one language and is
    # followed by a colon in another reads as two different DOIs, which is
    # how "10.1207/s15327957pspr0204_5" and the same DOI before a French
    # non-breaking space and colon were once reported as a divergence.
    return sorted(d.rstrip('.,;:') for d in re.findall(r'10\.\d{4,9}/[^\s)\]]+', body))


def headings(body: str) -> int:
    return len(re.findall(r'^#{1,6} ', body, re.M))


# Terms that are correct in English inside a translated article, because the
# SEO policy requires the academic vocabulary to be indexable in every
# language. A chart label made only of these is not evidence of a missed
# translation.
_ACADEMIC = re.compile(
    r'\b(Big[ -]Five|OCEAN|IPIP|NEO|AB5C|HEXACO|MBTI|Myers[ -]Briggs|Dark Triad|'
    r'Openness|Conscientiousness|Extraversion|Agreeableness|Neuroticism|'
    # The reverse pole of Neuroticism, and a factor name in its own right in
    # HEXACO. Same class as the five above and it stays English for the same
    # reason. Two of five translators rendered it in their language before it
    # was written down anywhere, which is what put it on this list.
    r'Emotional Stability|'
    # Spelled the same in enough of these languages that an identical label
    # is not evidence of anything. "Trait" is French for trait, and "item" is
    # the term of art in all six.
    r'Traits?|items?)\b',
    re.I,
)


def svg_labels(body: str) -> list[str]:
    """The translatable text inside inline SVG charts.

    Charts are written as inline SVG in the article body, so their labels are
    part of the content and have to be translated with it. They are easy to
    miss: a translator working on prose scrolls past a block of markup, and
    27 charts across seven articles shipped with English axis labels sitting
    inside otherwise fully translated pages.

    Academic terms and anything without a real word (numbers, "r = 0.18",
    bullets) are dropped, so a label set that is legitimately identical
    across languages does not register as untranslated.
    """
    out = []
    for raw in re.findall(r'<text[^>]*>([^<]+)</text>', body):
        rest = _ACADEMIC.sub('', raw)
        if re.search(r'[A-Za-zÀ-ÿ]{4,}', rest):
            out.append(_flat(raw).strip())
    return sorted(out)


def _flat(text: str) -> str:
    """Collapse whitespace so a term split across a line wrap still matches.

    Markdown renders "Big\nFive" and "Big Five" identically, but a literal
    search sees only the second. Every content check below runs on the
    flattened text; the raw text is kept for anything line-based.
    """
    return re.sub(r"\s+", " ", text)


def check_post(row, lang: str, animals: set[str]) -> list[str]:
    content = row["content"].get(lang) or ""
    flat = _flat(content)
    title = (row["title"].get(lang) or "").strip()
    desc = (row["description"].get(lang) or "").strip()
    english = row["content"].get("en") or ""

    if not content.strip():
        return ["no content for this language"]

    problems = []
    if "—" in content or "—" in title or "—" in desc:
        problems.append("em dash")
    if len(title) > MAX_TITLE:
        problems.append(f"title {len(title)} chars")
    if len(desc) > MAX_DESC:
        problems.append(f"description {len(desc)} chars")
    if not title or not desc:
        problems.append("missing title or description")

    if lang != "en":
        leaked = [d for d in ENGLISH_DIMENSIONS if re.search(rf'\b{d}\b', flat)]
        if leaked:
            problems.append("English dimension name: " + ", ".join(leaked))

        n = len(re.findall(r'\bWitness\b', flat))
        if n:
            problems.append(f'"Witness" left in English {n}x, should be {WITNESS[lang]}')
        n = len(re.findall(OBSERVER[lang], flat, re.I))
        if n:
            # Reported, not forbidden: see the note on OBSERVER. A reviewer
            # decides whether each one names Cercol's instrument or a rater
            # in somebody else's study.
            problems.append(f'"{OBSERVER[lang]}" appears {n}x, check each against the Witness rule')

    # The article that enumerates the roles must enumerate all of them. A
    # blacklist of wrong animals would only ever catch the mistakes already
    # made; requiring the full set catches any future substitution too.
    if row["slug"] == ROLES_ARTICLE:
        expected = localised_animals(lang) if lang != "en" else animals
        missing = sorted(a for a in expected if not re.search(rf'\b{re.escape(a)}\b', flat))
        if missing:
            problems.append("roles article is missing: " + ", ".join(missing))

    if english.strip() and lang != "en":
        if links(content) != links(english):
            problems.append("link set differs from English")
        if dois(content) != dois(english):
            problems.append("DOI set differs from English")
        labels = svg_labels(content)
        if labels and labels == svg_labels(english):
            problems.append(f"{len(labels)} SVG chart label(s) still in English")
        if headings(content) != headings(english):
            problems.append(
                f"heading count {headings(content)} vs {headings(english)} in English"
            )
    return problems


async def main() -> int:
    langs = LANGS
    if "--lang" in sys.argv:
        langs = [sys.argv[sys.argv.index("--lang") + 1]]

    conn = await asyncpg.connect(dsn=os.environ["DATABASE_URL"])
    await conn.set_type_codec("jsonb", encoder=json.dumps, decoder=json.loads,
                              schema="pg_catalog")
    try:
        rows = await conn.fetch(
            "SELECT slug, title, description, content FROM blog_posts ORDER BY slug"
        )
    finally:
        await conn.close()

    animals = canonical_animals()
    failures = 0
    for lang in langs:
        found = []
        for row in rows:
            problems = check_post(row, lang, animals)
            if problems:
                found.append((row["slug"], problems))
        print(f"\n== {lang}: {len(found)} of {len(rows)} articles with problems ==")
        for slug, problems in found:
            print(f"  {slug}")
            for p in problems:
                print(f"      {p}")
        failures += len(found)

    print(f"\n{failures} article-language pairs need attention")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
