#!/usr/bin/env python3
"""
Apply (or dry-run) the BigQuery DDL files under api/data/bigquery_ddl/.

Usage:
    python scripts/apply_bigquery_ddl.py               # dry-run, no creds needed
    python scripts/apply_bigquery_ddl.py --apply       # real run, needs creds

In dry-run mode the script parses each file with a minimal syntax check
(matched `CREATE TABLE IF NOT EXISTS`, balanced parens) so CI can call
it without GCP credentials. The Phase 17.6.1b deploy will call it with
--apply on the Hetzner server, where the service-account key is mounted.

# Spec: docs/architecture/seo-pipeline.md
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DDL_DIR = REPO_ROOT / "api" / "data" / "bigquery_ddl"


def discover() -> list[Path]:
    return sorted(DDL_DIR.glob("*.sql"))


def dry_run(files: list[Path]) -> int:
    """Lightweight syntax check that runs without any credentials."""
    failures: list[str] = []
    for f in files:
        text = f.read_text(encoding="utf-8")
        if "CREATE TABLE IF NOT EXISTS" not in text:
            failures.append(f"{f.name}: missing CREATE TABLE IF NOT EXISTS")
            continue
        if text.count("(") != text.count(")"):
            failures.append(f"{f.name}: unbalanced parentheses")
            continue
        if not re.search(r"`cercol\.cercol_seo\.\w+`", text):
            failures.append(f"{f.name}: no fully-qualified `cercol.cercol_seo.<table>` reference")
            continue
        if not text.rstrip().endswith(";"):
            failures.append(f"{f.name}: statement does not end with ';'")
            continue
        print(f"  ok   {f.name}")

    if failures:
        print("DDL dry-run failures:", file=sys.stderr)
        for f in failures:
            print(f"  {f}", file=sys.stderr)
        return 1
    print(f"\n{len(files)} DDL file(s) parsed cleanly. No BigQuery call was made.")
    return 0


def apply_real(files: list[Path]) -> int:
    """Apply each DDL via the BigQuery client. Requires real credentials."""
    try:
        from google.cloud import bigquery
    except ImportError:
        print(
            "google-cloud-bigquery is not installed in this venv. Install "
            "with `pip install -r api/requirements.txt`.",
            file=sys.stderr,
        )
        return 1

    client = bigquery.Client()
    for f in files:
        text = f.read_text(encoding="utf-8")
        print(f"applying {f.name} ...")
        job = client.query(text)
        job.result()
        print(f"  ok   {f.name}")
    print(f"\nApplied {len(files)} DDL file(s) to project={client.project}.")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--apply",
        action="store_true",
        help="Run against real BigQuery. Without this flag, only parses files.",
    )
    args = p.parse_args()

    files = discover()
    if not files:
        print(f"No DDL files found under {DDL_DIR}", file=sys.stderr)
        return 1

    print(f"discovered {len(files)} DDL file(s):")
    for f in files:
        print(f"  {f.relative_to(REPO_ROOT)}")
    print()

    return apply_real(files) if args.apply else dry_run(files)


if __name__ == "__main__":
    sys.exit(main())
