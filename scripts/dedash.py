#!/usr/bin/env python3
"""Remove em dashes from article bodies, respecting what each one was doing.

# Spec: docs/policies/conventions.md

The project bans em dashes everywhere. A blanket replacement is not safe:
the August 2026 German pass substituted them wholesale and stranded nine
quotation attributions, welding an author's name onto a closing quote.

An em dash does three different jobs and each wants a different replacement.

  A pair bracketing an aside  ->  a pair of commas
  A single one introducing a list or gloss after a short lead-in  ->  a colon
  A single one before a trailing clause  ->  a comma

Blockquote attributions keep a hyphen, which the convention allows, because
there the dash is the citation marker rather than punctuation. HTML comments
and SVG label text take a plain hyphen: no sentence logic applies inside a
drawing.

Used by the migration generator, not run directly against the database.
"""
from __future__ import annotations

import re

_SENTENCE = re.compile(r'(?<=[.!?:])\s+')
_SHORT_LEAD = 30

# An em dash joining two independent clauses cannot become a comma: that is a
# splice. "balance does not mean everyone is similar - it means the team's
# distribution covers the range" needs a colon. Detecting a full clause is not
# tractable with a regex, but the pronoun-plus-verb opening covers almost every
# case the corpus actually contains.
_INDEPENDENT = re.compile(
    r'^(it|they|this|that|these|those|he|she|we|you|there|here)\s+'
    r"(is|are|was|were|means|meant|does|do|did|can|could|will|would|has|have|had|"
    r"makes|make|becomes|become|comes|come|works|work|matters|matter|tends|tend)\b",
    re.IGNORECASE,
)


def _fix_sentence(sentence: str) -> str:
    n = sentence.count("—")
    if n == 0:
        return sentence
    if n >= 2 and n % 2 == 0:
        # An aside in dashes becomes an aside in commas, both sides.
        return re.sub(r'\s*—\s*', ", ", sentence)
    # One dash: a short lead-in is a label and wants a colon; a following
    # independent clause wants a colon too, because a comma would splice it;
    # anything else is a trailing phrase and wants a comma.
    i = sentence.index("—")
    lead = sentence[:i].strip()
    tail = sentence[i + 1:].strip()
    if len(lead) <= _SHORT_LEAD or _INDEPENDENT.match(tail):
        sep = ": "
    else:
        sep = ", "
    sentence = re.sub(r'\s*—\s*', sep, sentence, count=1)
    return re.sub(r'\s*—\s*', ", ", sentence)


def dedash(text: str) -> str:
    out = []
    for line in text.split("\n"):
        if "—" not in line:
            out.append(line)
            continue
        # The dash is the citation marker, not punctuation.
        line = re.sub(r'^(>\s*)—\s*', r'\1- ', line)
        stripped = line.lstrip()
        if stripped.startswith("<!--") or "<text" in line or "<title" in line:
            out.append(line.replace("—", "-"))
            continue
        out.append(_fix_sentence_line(line))
    return "\n".join(out)


def _fix_sentence_line(line: str) -> str:
    """Apply the sentence rule across one line, which may hold several."""
    pieces = _SENTENCE.split(line)
    seps = _SENTENCE.findall(line)
    fixed = [_fix_sentence(p) for p in pieces]
    rebuilt = "".join(a + b for a, b in zip(fixed, seps + [""]))
    # Tidy the seams a substitution can leave behind.
    rebuilt = re.sub(r'\s+([,:;.])', r'\1', rebuilt)
    rebuilt = re.sub(r',\s*,', ",", rebuilt)
    rebuilt = re.sub(r':\s*,', ":", rebuilt)
    return rebuilt


if __name__ == "__main__":
    import sys
    print(dedash(sys.stdin.read()), end="")
