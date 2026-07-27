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

from doi_check import RESOLVER, extract_dois, is_unresolvable, resolve  # noqa: E402

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
    if dead:
        print("\nVerify each citation against Crossref (api.crossref.org/works?query.bibliographic=...)")
        print("and correct the digits. The citation text is usually right; the DOI is not.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
