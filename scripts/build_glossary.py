#!/usr/bin/env python3
"""Generate the per-language translation glossary from the app's own locales.

# Spec: docs/policies/translation.md

Why this is generated and not written by hand: during the August 2026 German
language pass, six independent reviewers were each given the same prose brief
and each inferred a different rule for the five Cercol dimension names. Some
kept "Bond", some wrote "Bindung", some wrote "Verbindung". Every one of them
was defensible, and the corpus ended up carrying all three.

A prose brief cannot prevent that. A generated glossary can: the source of
truth is src/locales/<lang>.json, which is also what the running app renders,
so a translator reading the glossary and a user reading the interface cannot
disagree. Change the locale and the glossary follows on the next run.

Usage:
    python3 scripts/build_glossary.py            # write docs/policies/glossary.<lang>.md
    python3 scripts/build_glossary.py --check    # fail if any file is stale (CI)
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOCALES = ROOT / "src" / "locales"
DOCS = ROOT / "docs" / "policies"
LANGS = ["en", "ca", "es", "fr", "de", "da"]

# Instrument names live under home.<key>.name. Each language uses its own
# form, following its own pattern, and the locale is the authority. Witness
# is here because it had no canonical name at all until August 2026, which
# is why five translators invented five different ones for it.
INSTRUMENTS = ["newMoon", "firstQuarter", "fullMoon", "lastQuarter", "witness"]


def load(lang: str) -> dict:
    return json.loads((LOCALES / f"{lang}.json").read_text())


def table(rows: list[tuple[str, str]], headers: tuple[str, str]) -> str:
    out = [f"| {headers[0]} | {headers[1]} |", "|---|---|"]
    out += [f"| {a} | {b} |" for a, b in rows]
    return "\n".join(out)


def build(lang: str) -> str:
    src, tgt = load("en"), load(lang)

    dimensions = [
        (src["fmDomains"][k]["name"], tgt["fmDomains"][k]["name"])
        for k in sorted(src.get("fmDomains", {}))
    ]
    roles = [
        (src["roles"][k]["name"], tgt["roles"][k]["name"])
        for k in sorted(src.get("roles", {}))
        if k.startswith("R")
    ]
    # Shown as the app renders them, per language.
    instruments = [
        (src["home"][k]["name"], tgt["home"][k]["name"])
        for k in INSTRUMENTS
        if k in src.get("home", {}) and k in tgt.get("home", {})
    ]

    parts = [
        f"# Translation glossary: {lang}",
        "",
        "GENERATED FILE. Do not edit by hand: run `python3 scripts/build_glossary.py`.",
        f"The source of truth is `src/locales/{lang}.json`, the same file the running",
        "app renders. If a term here looks wrong, fix the locale, not this file.",
        "",
        "## Dimensions",
        "",
        "Always use the target-language name in running text. The academic Big Five",
        "term may appear once in parentheses on first mention, for search visibility.",
        "",
        table(dimensions, ("English", lang)),
        "",
        "## Team roles",
        "",
        "These twelve, no others. The canonical list lives in",
        "`src/utils/role-scoring.js`; anything not on it does not exist.",
        "",
        table(roles, ("English", lang)),
        "",
        "## The Witness",
        "",
        "The peer-rating concept, in the target language's own word for it.",
        "Never \"observer\" in any language: `Beobachter`, `observador`,",
        "`observateur` are wrong when they name this concept, and fine when a",
        "cited study genuinely means an observer.",
        "",
        table(
            [(src["witness"]["term"], tgt["witness"]["term"]),
             (src["witness"]["termPlural"], tgt["witness"]["termPlural"])],
            ("English", lang),
        ),
        "",
        "## Instrument names",
        "",
        "Each language has its own form and they are settled. Use exactly what",
        "is below, and never invent one: until August 2026 the Witness had no",
        "canonical name in any locale, and five translators of one article",
        "produced five different names for it.",
        "",
        table(instruments, ("English", lang)),
        "",
        "## Required in English, for search",
        "",
        "On the blog only, never in the app interface: Big Five, OCEAN, IPIP, NEO,",
        "AB5C, DISC, MBTI, HEXACO.",
        "",
        "The five Big Five factor names work differently from the acronyms.",
        "Give the English form on first mention, then use the target language",
        "for the rest of the article: the English earns the search impression",
        "once, and forcing it through every inflected sentence afterwards costs",
        "fluency for nothing. Figure and diagram labels stay English, because",
        "they carry no grammar and the coordinates are drawn for those strings.",
        "",
        "Cèrcol's own dimension names, in the table at the top of this file, go",
        "in the target language everywhere. The two are different things:",
        f"{dict(dimensions).get('Bond', 'Bond')} is a Cèrcol dimension, Agreeableness is the academic",
        "factor it maps onto.",
        "",
    ]
    # Collapse blank-line runs rather than tuning the spacing of every
    # section: markdownlint MD012 rejects doubles, and composing the sections
    # by hand means one more section is one more chance to get it wrong.
    return re.sub(r"\n{3,}", "\n\n", "\n".join(parts)).rstrip("\n") + "\n"


def main() -> int:
    check = "--check" in sys.argv
    stale = []
    for lang in LANGS:
        path = DOCS / f"glossary.{lang}.md"
        content = build(lang)
        if check:
            if not path.exists() or path.read_text() != content:
                stale.append(path.name)
        else:
            path.write_text(content)
            print(f"wrote {path.relative_to(ROOT)}")
    if check:
        if stale:
            print("stale glossaries: " + ", ".join(stale))
            print("run: python3 scripts/build_glossary.py")
            return 1
        print(f"{len(LANGS)} glossaries up to date")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
