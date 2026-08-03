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

# Instrument names live under home.<key>.name and are brand names: they are
# identical in every locale and must stay that way.
INSTRUMENTS = ["newMoon", "firstQuarter", "fullMoon", "lastQuarter"]


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
    instruments = [src["home"][k]["name"] for k in INSTRUMENTS if k in src.get("home", {})]

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
        "## Never translated",
        "",
        "Instrument names are brand names and are identical in every language:",
        "",
        "\n".join(f"- {name}" for name in instruments),
        "",
        "## Required in English, for search",
        "",
        "On the blog only, never in the app interface: Big Five, OCEAN, IPIP, NEO,",
        "AB5C, DISC, MBTI, HEXACO.",
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
