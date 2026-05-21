"""
Infra and docs structural guards.

These tests do NOT touch the network or the server. They assert
that the files the deploy pipeline and the docs system depend on
exist and follow the agreed format. An accidental rename, deletion,
or format drift fails CI before reaching production.

# Spec: docs/policies/conventions.md
"""

from __future__ import annotations

import re
from pathlib import Path

# Resolve repo root from this file: api/tests/test_infra.py -> ../..
REPO_ROOT = Path(__file__).resolve().parents[2]
SNIPPET = REPO_ROOT / "api" / "deploy" / "caddy" / "cercol-api.caddy"


# ---------------------------------------------------------------------------
# Caddy snippet
# ---------------------------------------------------------------------------

def test_caddy_snippet_exists():
    assert SNIPPET.is_file(), f"missing Caddy snippet at {SNIPPET}"


def test_caddy_snippet_has_expected_block():
    content = SNIPPET.read_text(encoding="utf-8")
    assert "api.cercol.team {" in content, (
        "snippet must declare an api.cercol.team site block"
    )
    assert "reverse_proxy 127.0.0.1:8090" in content, (
        "snippet must reverse_proxy to the local FastAPI uvicorn on :8090"
    )


# ---------------------------------------------------------------------------
# ADR format
# ---------------------------------------------------------------------------

DECISIONS_DIR = REPO_ROOT / "docs" / "decisions"

ADR_REQUIRED_HEADERS = [
    "## Context",
    "## Decision",
    "## Alternatives considered",
    "## Consequences",
    "## Related",
]

ADR_REQUIRED_META = [
    "**Number**:",
    "**Title**:",
    "**Status**:",
    "**Date**:",
]


def _adr_files() -> list[Path]:
    # ADR files are 4-digit numbered, NNNN-slug.md. The 0000-template.md
    # is excluded; the README is excluded.
    files = sorted(DECISIONS_DIR.glob("[0-9][0-9][0-9][0-9]-*.md"))
    return [f for f in files if not f.name.startswith("0000-")]


def test_each_adr_has_all_required_sections():
    for adr in _adr_files():
        content = adr.read_text(encoding="utf-8")
        missing = [h for h in ADR_REQUIRED_HEADERS if h not in content]
        assert not missing, (
            f"ADR {adr.name} is missing sections: {missing}"
        )


def test_each_adr_has_all_required_metadata():
    for adr in _adr_files():
        content = adr.read_text(encoding="utf-8")
        missing = [m for m in ADR_REQUIRED_META if m not in content]
        assert not missing, (
            f"ADR {adr.name} is missing metadata fields: {missing}"
        )


def test_adr_filenames_match_NNNN_slug_format():
    pattern = re.compile(r"^\d{4}-[a-z0-9][a-z0-9-]+\.md$")
    for adr in DECISIONS_DIR.glob("*.md"):
        if adr.name in {"README.md"}:
            continue
        assert pattern.match(adr.name), (
            f"ADR filename does not match NNNN-slug.md: {adr.name}"
        )


# ---------------------------------------------------------------------------
# Post-mortem format
# ---------------------------------------------------------------------------

POST_MORTEMS_DIR = REPO_ROOT / "docs" / "post-mortems"

PM_REQUIRED_SECTIONS = [
    "## Timeline",
    "## Root cause",
    "## Fix applied",
    "## Prevention",
    "## Lessons learned",
]


def _pm_files() -> list[Path]:
    # Post-mortems are YYYY-MM-DD-slug.md. README and TEMPLATE excluded.
    files = sorted(POST_MORTEMS_DIR.glob("[0-9][0-9][0-9][0-9]-*.md"))
    return files


def test_each_post_mortem_has_all_required_sections():
    for pm in _pm_files():
        content = pm.read_text(encoding="utf-8")
        missing = [s for s in PM_REQUIRED_SECTIONS if s not in content]
        assert not missing, (
            f"Post-mortem {pm.name} is missing sections: {missing}"
        )


def test_each_post_mortem_has_prevention_link():
    # Prevention section must contain at least one docs/ link, so the
    # post-mortem is not a regret without a control.
    link_re = re.compile(r"docs/(policies|decisions|architecture|ops)/")
    for pm in _pm_files():
        content = pm.read_text(encoding="utf-8")
        # Capture everything between "## Prevention" and the next "## ".
        match = re.search(r"## Prevention\s+(.+?)(?=\n## |\Z)", content, re.DOTALL)
        assert match, f"Post-mortem {pm.name} has no Prevention section body"
        body = match.group(1)
        assert link_re.search(body), (
            f"Post-mortem {pm.name} Prevention section has no link to "
            f"docs/policies|decisions|architecture|ops"
        )


# ---------------------------------------------------------------------------
# Spec marker dup-check (in addition to the standalone script)
# ---------------------------------------------------------------------------

SPEC_RE = re.compile(r"^\s*#\s*Spec:\s*(\S+)\s*$", re.MULTILINE)


def test_all_spec_markers_resolve():
    failures = []
    for py in (REPO_ROOT / "api").rglob("*.py"):
        if "__pycache__" in py.parts or ".venv" in py.parts:
            continue
        text = py.read_text(encoding="utf-8")
        for match in SPEC_RE.finditer(text):
            target = REPO_ROOT / match.group(1)
            if not target.is_file():
                failures.append(f"{py.relative_to(REPO_ROOT)} -> {match.group(1)}")
    assert not failures, f"Broken Spec markers: {failures}"
