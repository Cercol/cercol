#!/usr/bin/env python3
"""
DOI resolution gate.

# Spec: docs/architecture/seo-pipeline.md

Blog article bodies reach production by two routes, and this script covers
the one the admin API cannot:

  - admin API (POST/PUT /blog): guarded at write time in api/blog.py.
  - content-seeding migration SQL (db/migrations/*.sql): guarded here, run
    by the "DOI resolution" CI job whenever a migration changes.

`--live` additionally sweeps the published corpus, which is how you confirm
a remediation migration actually landed everywhere.

Exit status is 1 if any DOI resolves 404 at doi.org, else 0. Transport
failures never fail the run: see api/doi_check.py for the fail-open rule.

Usage:
    python scripts/check_dois.py db/migrations/034_*.sql
    python scripts/check_dois.py --live [--api https://api.cercol.team]
"""

from __future__ import annotations

import argparse
import pathlib
import re
import sys

import httpx

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "api"))

from doi_check import (  # noqa: E402
    RESOLVER, attribution_mismatch, crossref_record, extract_dois,
    is_unresolvable, resolve,
)

UA = {"User-Agent": "cercol-doi-check/1.0"}

# A remediation migration necessarily NAMES the dead DOIs it removes: once in
# the header mapping, once as the replace() needle. Without an escape hatch,
# every fix for this problem would be blocked by the gate that exists to catch
# it. Such a migration declares what it is retiring:
#
#   -- doi-check: retires 10.1177/1073191106293419
#
# and that DOI is exempt in that file only. The declaration doubles as the
# audit trail of which broken DOI each migration was written to kill.
_RETIRES = re.compile(r"doi-check:\s*retires\s+(10\.\d{4,9}/\S+)", re.IGNORECASE)


def from_files(paths: list[str]) -> dict[str, set[str]]:
    """DOI -> set of file names, for every DOI appearing in the given files.

    DOIs the file explicitly declares as retired are skipped.
    """
    out: dict[str, set[str]] = {}
    for p in paths:
        text = pathlib.Path(p).read_text(encoding="utf-8", errors="replace")
        retired = {m.group(1).rstrip(".,;:").lower() for m in _RETIRES.finditer(text)}
        for doi in extract_dois(text):
            if doi in retired:
                continue
            out.setdefault(doi, set()).add(pathlib.Path(p).name)
    return out


def from_live(client: httpx.Client, api: str) -> dict[str, set[str]]:
    """DOI -> set of "slug [lang]" labels, across every published article."""
    out: dict[str, set[str]] = {}
    for item in client.get(f"{api}/blog", timeout=30).json():
        slug = item["slug"]
        r = client.get(f"{api}/blog/{slug}", timeout=30)
        if r.status_code != 200:
            continue
        content = r.json().get("content") or {}
        for lang, body in content.items():
            if not isinstance(body, str):
                continue
            for doi in extract_dois(body):
                out.setdefault(doi, set()).add(f"{slug} [{lang}]")
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*", help="files to scan for DOIs")
    ap.add_argument("--live", action="store_true", help="scan the published corpus")
    ap.add_argument("--api", default="https://api.cercol.team")
    ap.add_argument("--attribution", action="store_true",
                    help="also report DOIs whose Crossref record contradicts the "
                         "author the prose names (report-only, never fails)")
    args = ap.parse_args()

    if not args.files and not args.live:
        print("nothing to check (no files, no --live)")
        return 0

    with httpx.Client(headers=UA, follow_redirects=False) as client:
        found: dict[str, set[str]] = {}
        if args.files:
            found.update(from_files(args.files))
        if args.live:
            for doi, where in from_live(client, args.api).items():
                found.setdefault(doi, set()).update(where)

        if not found:
            print("no DOIs found")
            return 0

        dead: list[tuple[str, set[str]]] = []
        unknown = 0
        for doi in sorted(found):
            code = resolve(client, doi)
            if is_unresolvable(code):
                dead.append((doi, found[doi]))
            elif code is None:
                unknown += 1

    print(f"checked {len(found)} distinct DOI(s); {len(dead)} unresolvable, {unknown} unreachable")
    if unknown:
        print("note: unreachable DOIs were NOT failed (fail-open on transport errors)")
    for doi, where in dead:
        print(f"\n  UNRESOLVABLE  {RESOLVER}{doi}")
        for w in sorted(where):
            print(f"                in {w}")
    if args.attribution:
        _attribution_pass(args, found)

    if dead:
        print("\nVerify each citation against Crossref (api.crossref.org/works?query.bibliographic=...)")
        print("and correct the digits. The citation text is usually right; the DOI is not.")
        return 1
    return 0


def _attribution_pass(args, found: dict[str, set[str]]) -> None:
    """Report DOIs that resolve but whose record contradicts the stated author.

    Deliberately report-only, and deliberately NOT wired into CI. Measured
    against the Jul 2026 corpus it caught 17 of 17 real wrong-paper citations
    but also flagged one correct one, because it infers the intended author
    from a fixed window of surrounding prose. That precision is fine for an
    audit a human triages and wrong for a gate that blocks a publish.
    """
    print("\n== attribution pass (report-only, needs human triage) ==")
    with httpx.Client(headers=UA, follow_redirects=False) as client:
        texts = _texts_for(args)
        hits = 0
        for doi in sorted(found):
            record = crossref_record(client, doi)
            if not record:
                continue
            for where, text in texts.get(doi, []):
                reason = attribution_mismatch(text, doi, record)
                if reason:
                    hits += 1
                    print(f"  MISMATCH  {doi}\n            in {where}\n            {reason}")
                    break
    print(f"  {hits} possible wrong-paper citation(s). Confirm each by hand before editing.")


def _sentences(line: str):
    """Split a line into sentences, keeping "et al." intact.

    The unit matters. Feeding whole lines to attribution_mismatch loses most
    real hits: a paragraph usually names the correct author somewhere, and a
    260-character window that reaches back into it finds a match and stays
    quiet. Measured on the Jul 2026 corpus, line-level reporting caught 2 of
    10 known wrong-paper citations; sentence-level caught all 10.
    """
    protected = line.replace("et al.", "et al\x00")
    for s in re.split(r"(?<=[.!?])\s+(?=[A-Z*\[])", protected):
        yield s.replace("et al\x00", "et al.")


def _texts_for(args) -> dict[str, list[tuple[str, str]]]:
    """DOI -> [(where, surrounding text)] for the sources being checked."""
    out: dict[str, list[tuple[str, str]]] = {}
    def add(doi, where, text):
        out.setdefault(doi, []).append((where, text))
    if args.live:
        with httpx.Client(headers=UA) as c:
            for item in c.get(f"{args.api}/blog", timeout=30).json():
                slug = item["slug"]
                r = c.get(f"{args.api}/blog/{slug}", timeout=30)
                if r.status_code != 200:
                    continue
                body = (r.json().get("content") or {}).get("en") or ""
                for line in body.split("\n"):
                    for sentence in _sentences(line):
                        for doi in extract_dois(sentence):
                            add(doi, f"{slug} [en]", sentence)
    for p in args.files:
        text = pathlib.Path(p).read_text(encoding="utf-8", errors="replace")
        for line in text.split("\n"):
            for sentence in _sentences(line):
                for doi in extract_dois(sentence):
                    add(doi, pathlib.Path(p).name, sentence)
    return out


if __name__ == "__main__":
    sys.exit(main())
