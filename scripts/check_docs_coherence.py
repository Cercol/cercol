#!/usr/bin/env python3
"""
Soft coherence check between code changes and documentation.

Given a list of changed files (passed via argv or env var
CHANGED_FILES), emit a warning per documented subsystem touched
without its docs/architecture/<subsystem>.md being touched.

Exit code is ALWAYS 0; this is intended as a warning emitter that
populates a PR label or comment, not as a blocker. CI uses the
output to set a `needs-docs-review` label on the PR if any
warnings are emitted.

# Spec: docs/policies/docs-maintenance.md
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Map of code path prefix to required doc file.
SUBSYSTEMS = {
    "api/main.py": "docs/architecture/backend.md",
    "api/blog.py": "docs/architecture/backend.md",
    "api/auth.py": "docs/architecture/auth.md",
    # Add more entries as docs/architecture/ grows. Keep this table
    # in sync with docs/policies/docs-maintenance.md.
}


def main() -> int:
    if len(sys.argv) > 1:
        changed = sys.argv[1:]
    else:
        env = os.environ.get("CHANGED_FILES", "")
        changed = [line.strip() for line in env.splitlines() if line.strip()]

    if not changed:
        print("check_docs_coherence: no changed files provided; nothing to do")
        return 0

    changed_set = set(changed)
    warnings: list[str] = []
    for code_path, doc_path in SUBSYSTEMS.items():
        if code_path in changed_set and doc_path not in changed_set:
            warnings.append(
                f"Code in {code_path} changed without an update to {doc_path}. "
                f"Either update the doc or justify in the PR description."
            )

    if warnings:
        print("docs-coherence warnings:")
        for w in warnings:
            print(f"  - {w}")
    else:
        print("docs-coherence: no warnings")

    # Always exit 0 (soft check).
    return 0


if __name__ == "__main__":
    sys.exit(main())
