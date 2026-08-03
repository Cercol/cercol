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


def links(body: str) -> list[str]:
    return sorted(re.findall(r'\]\((https?://[^)\s]+)\)', body))


def dois(body: str) -> list[str]:
    return sorted(re.findall(r'10\.\d{4,9}/[^\s)\]]+', body))


def headings(body: str) -> int:
    return len(re.findall(r'^#{1,6} ', body, re.M))


def check_post(row, lang: str, animals: set[str]) -> list[str]:
    content = row["content"].get(lang) or ""
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
        leaked = [d for d in ENGLISH_DIMENSIONS if re.search(rf'\b{d}\b', content)]
        if leaked:
            problems.append("English dimension name: " + ", ".join(leaked))

    # The article that enumerates the roles must enumerate all of them. A
    # blacklist of wrong animals would only ever catch the mistakes already
    # made; requiring the full set catches any future substitution too.
    if row["slug"] == ROLES_ARTICLE:
        expected = localised_animals(lang) if lang != "en" else animals
        missing = sorted(a for a in expected if not re.search(rf'\b{re.escape(a)}\b', content))
        if missing:
            problems.append("roles article is missing: " + ", ".join(missing))

    if english.strip() and lang != "en":
        if links(content) != links(english):
            problems.append("link set differs from English")
        if dois(content) != dois(english):
            problems.append("DOI set differs from English")
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
