"""
Infra guards for the Caddy snippet shipped with this repo.

These tests do NOT touch the network or the server. They only assert
that the snippet file exists and contains the directives the deploy
pipeline depends on, so an accidental rename or deletion fails CI
before reaching production.
"""

from pathlib import Path

import pytest

# Resolve repo root from this file: api/tests/test_infra.py -> ../..
REPO_ROOT = Path(__file__).resolve().parents[2]
SNIPPET = REPO_ROOT / "api" / "deploy" / "caddy" / "cercol-api.caddy"


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
