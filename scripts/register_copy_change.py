#!/usr/bin/env python3
"""
Register a title/description/h1 copy change in cercol_seo.copy_changes.

Usage on the production server, run from the cercol user:

    python scripts/register_copy_change.py \\
        --route /science/ \\
        --field title \\
        --before "old title" \\
        --after  "new title" \\
        --commit "$(git rev-parse HEAD)"

Manual invocation only. A future phase can wrap this in a git hook
or PR template step; for now the operator runs it after merging a
PR that changes user-facing meta tags.

# Spec: docs/architecture/seo-pipeline.md
"""

from __future__ import annotations

import argparse
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--route", required=True, help="Route slug, e.g. /science/")
    p.add_argument("--field", required=True, choices=["title", "description", "h1", "other"])
    p.add_argument("--before", default="", help="Previous text")
    p.add_argument("--after", default="", help="New text")
    p.add_argument("--commit", default="", help="git commit SHA")
    p.add_argument("--days-to-measure", type=int, default=14,
                   help="Days from now until seo_copy_impact should measure (default 14)")
    args = p.parse_args()

    try:
        from google.cloud import bigquery
    except ImportError:
        print("google-cloud-bigquery not installed; run pip install -r api/requirements.txt", file=sys.stderr)
        return 1

    now = datetime.now(timezone.utc)
    row = {
        "id": str(uuid.uuid4()),
        "ts": now.isoformat(),
        "route": args.route,
        "field": args.field,
        "before_text": args.before,
        "after_text": args.after,
        "commit_hash": args.commit,
        "scheduled_measure_ts": (now + timedelta(days=args.days_to_measure)).isoformat(),
        "measured": False,
    }

    project = os.environ.get("BIGQUERY_PROJECT", "cercol")
    dataset = os.environ.get("BIGQUERY_DATASET_SEO", "cercol_seo")
    table_fq = f"{project}.{dataset}.copy_changes"

    client = bigquery.Client()
    errors = client.insert_rows_json(table_fq, [row])
    if errors:
        print(f"insert failed: {errors}", file=sys.stderr)
        return 1

    print(f"recorded: {args.route} {args.field} (id={row['id']})")
    print(f"scheduled measurement: {row['scheduled_measure_ts']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
