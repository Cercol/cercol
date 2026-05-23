"""
Verify the /robots.txt endpoint shipped with api.cercol.team.

# Spec: docs/architecture/seo-pipeline.md
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Importing main has heavy side effects (asyncpg pool setup) so we
# exercise just the constant + endpoint contract via FastAPI's
# TestClient with the app lifespan disabled. fastapi.testclient is
# already a transitive dep via httpx + fastapi.
import importlib  # noqa: E402

from fastapi.testclient import TestClient  # noqa: E402


def _client() -> TestClient:
    # Set required env so the JWT fail-fast in main does not abort import.
    os.environ.setdefault("JWT_SECRET", "x" * 48)
    os.environ.setdefault("DATABASE_URL", "postgresql://example.invalid/seo_test")
    main = importlib.import_module("main")
    # raise_server_exceptions=False lets the test traverse paths whose
    # dependencies need infra we don't spin up here.
    return TestClient(main.app, raise_server_exceptions=False)


def test_robots_txt_returns_200_with_disallow_all():
    client = _client()
    resp = client.get("/robots.txt")
    assert resp.status_code == 200
    body = resp.text
    assert "User-agent: *" in body
    assert "Disallow: /" in body


def test_robots_txt_content_type_is_plain_text():
    client = _client()
    resp = client.get("/robots.txt")
    assert resp.headers["content-type"].startswith("text/plain")
