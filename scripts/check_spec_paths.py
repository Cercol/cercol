#!/usr/bin/env python3
"""
Validate `# Spec: docs/<path>.md` markers in Python modules.

Used by:
- the pre-commit hook (.pre-commit-config.yaml)
- the CI step in .github/workflows/ci.yml

Behaviour:
- Walks the repo from the current working directory.
- For every *.py file, reads it and looks for lines of the form
  `# Spec: <path>` (path relative to the repo root).
- Fails (exit 1) if the target file does not exist.
- Exits 0 if all targets resolve.

Comments in English per docs/policies/conventions.md.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SPEC_RE = re.compile(r"^\s*#\s*Spec:\s*(\S+)\s*$", re.MULTILINE)

# Skip generated and vendored directories.
SKIP_DIRS = {
    "node_modules",
    ".venv",
    "venv",
    "__pycache__",
    "dist",
    "build",
    ".git",
}


def python_files(root: Path):
    for path in root.rglob("*.py"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path


def check(root: Path) -> list[str]:
    failures: list[str] = []
    for py in python_files(root):
        try:
            text = py.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for match in SPEC_RE.finditer(text):
            target_rel = match.group(1)
            target = (root / target_rel).resolve()
            if not target.is_file():
                line_no = text[: match.start()].count("\n") + 1
                failures.append(
                    f"{py.relative_to(root)}:{line_no}: "
                    f"Spec target does not exist: {target_rel}"
                )
    return failures


def main() -> int:
    root = Path.cwd()
    failures = check(root)
    if failures:
        print("Broken Spec markers:", file=sys.stderr)
        for f in failures:
            print(f"  {f}", file=sys.stderr)
        print(
            "\nFix by either creating the target doc, correcting the path, "
            "or removing the marker.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
