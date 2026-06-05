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


# ---------------------------------------------------------------------------
# Migration 018: published_at CHECK constraint (ADR 0010)
# ---------------------------------------------------------------------------

MIGRATION_018 = (
    REPO_ROOT / "db" / "migrations" / "018_blog_published_at_check.sql"
)


def test_migration_018_exists():
    assert MIGRATION_018.is_file(), f"missing migration at {MIGRATION_018}"


def test_migration_018_has_check_expression():
    content = MIGRATION_018.read_text(encoding="utf-8")
    # The invariant decided in ADR 0010: a published row must carry a date.
    assert "status <> 'published' OR published_at IS NOT NULL" in content, (
        "018 must add the published_at CHECK expression from ADR 0010"
    )
    # Idempotency guard so the migration is safe to re-run.
    assert "blog_posts_published_has_date" in content
    assert "IF NOT EXISTS" in content


# ---------------------------------------------------------------------------
# No embedded DB credentials in committed scripts
# ---------------------------------------------------------------------------

# Matches a postgres URL that carries an inline user:password@ host, i.e. a
# committed credential. The pattern hardcodes no value of its own.
_DB_CRED_RE = re.compile(r"postgres(?:ql)?://[^\"'\s]*:[^\"'\s]*@")


def test_no_embedded_db_credentials_in_scripts():
    offenders = []
    for py in (REPO_ROOT / "scripts").rglob("*.py"):
        if "__pycache__" in py.parts:
            continue
        if _DB_CRED_RE.search(py.read_text(encoding="utf-8")):
            offenders.append(str(py.relative_to(REPO_ROOT)))
    assert not offenders, (
        f"embedded DB credential URL found in: {offenders}; read the DSN from the "
        f"environment instead (os.environ['DATABASE_URL'])"
    )


# ---------------------------------------------------------------------------
# Migration-apply mechanism (ADR 0011): script + workflow
# ---------------------------------------------------------------------------

APPLY_SCRIPT = REPO_ROOT / "scripts" / "apply_pg_migrations.sh"
APPLY_WORKFLOW = REPO_ROOT / ".github" / "workflows" / "apply-migrations.yml"


def test_apply_script_exists_with_required_modes_and_safety():
    assert APPLY_SCRIPT.is_file(), f"missing apply script at {APPLY_SCRIPT}"
    content = APPLY_SCRIPT.read_text(encoding="utf-8")
    assert "set -euo pipefail" in content, "script must use strict bash mode"
    for mode in ("--list", "--dry-run", "--baseline"):
        assert mode in content, f"script must support {mode}"
    assert "schema_migrations" in content, "script must use the schema_migrations ledger"
    # Halt-on-failure: psql aborts on the first error and set -e propagates it.
    assert "ON_ERROR_STOP=1" in content, "script must halt on the first migration error"


def test_apply_workflow_is_dispatch_only_with_dry_run_default_true():
    assert APPLY_WORKFLOW.is_file(), f"missing workflow at {APPLY_WORKFLOW}"
    content = APPLY_WORKFLOW.read_text(encoding="utf-8")
    assert "workflow_dispatch:" in content, "workflow must be manually dispatchable"
    # No push/deploy trigger: merging must apply nothing.
    assert re.search(r"^\s*push\s*:", content, re.MULTILINE) is None, (
        "apply workflow must NOT have a push trigger"
    )
    # dry_run defaults to true so an accidental run previews rather than applies.
    assert re.search(r"dry_run:.*?default:\s*true", content, re.DOTALL), (
        "dry_run input must default to true"
    )
    # Reuses the existing SSH secret, introduces no new one.
    assert "secrets.HETZNER_SSH_KEY" in content


def test_apply_script_list_orders_numerically(tmp_path):
    import os
    import subprocess

    # Fake NNN_*.sql fixtures created out of order; --list must return them in
    # numeric (NNN) order. --list needs no DB connection (that is why it exists).
    for name in ("010_b.sql", "002_a.sql", "100_c.sql", "009_z.sql", "001_x.sql"):
        (tmp_path / name).write_text("-- fixture\n", encoding="utf-8")

    result = subprocess.run(
        ["bash", str(APPLY_SCRIPT), "--list"],
        env={**os.environ, "MIGRATIONS_DIR": str(tmp_path)},
        capture_output=True,
        text=True,
        check=True,
    )
    got = [ln for ln in result.stdout.splitlines() if ln.strip()]
    assert got == [
        "001_x.sql",
        "002_a.sql",
        "009_z.sql",
        "010_b.sql",
        "100_c.sql",
    ], f"--list out of order: {got}"


def _dry_run_body() -> str:
    content = APPLY_SCRIPT.read_text(encoding="utf-8")
    m = re.search(r"mode_dry_run\(\)\s*\{(.*?)\n\}", content, re.DOTALL)
    assert m, "mode_dry_run function not found"
    return m.group(1)


def test_dry_run_writes_nothing():
    # The preview must be read-only: it guards on to_regclass and never creates
    # the ledger (no ensure_ledger call inside mode_dry_run).
    body = _dry_run_body()
    assert "to_regclass('public.schema_migrations')" in body, (
        "dry-run must check ledger existence with to_regclass, not create it"
    )
    assert "ensure_ledger" not in body, (
        "dry-run must NOT call ensure_ledger (that would create/write the ledger)"
    )


def test_workflow_baseline_only_on_non_dry_run():
    content = APPLY_WORKFLOW.read_text(encoding="utf-8")
    # The --baseline invocation must sit inside the non-dry-run branch: it must
    # appear AFTER the `if DRY_RUN == true` guard (i.e. in the else), so a dry run
    # never records a baseline.
    dry_guard = content.find('if [ "${DRY_RUN}" = "true" ]')
    baseline_call = content.find("--baseline")
    assert dry_guard != -1 and baseline_call != -1, "expected dry-run guard and baseline call"
    assert baseline_call > dry_guard, (
        "--baseline must be gated inside the non-dry-run branch (after the DRY_RUN guard)"
    )
