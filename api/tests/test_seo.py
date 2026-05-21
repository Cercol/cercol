"""
SEO structural guards for prerendered pages.

# Spec: docs/policies/conventions.md

Bing reported "no H1" on a top-level page during the Phase 17 SEO sprint
(see docs/post-mortems/2026-05-20-h1-tag-missing-regression.md). The fix
landed in Phase 17.5 FASE A.2. This test prevents a regression by counting
<h1> tags in the prerendered HTML produced by `npm run build:full`.

The test reads files from `dist/` and skips gracefully if that directory
does not exist (e.g. on a fresh checkout without a build). CI's frontend
job builds `dist/` before invoking this test, so the guard runs in CI but
is skip-friendly during local backend-only work.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
DIST = REPO_ROOT / "dist"

# Sample of prerendered routes. Mix of: home, two top-level pages that
# previously shipped zero H1s, one blog index, two blog articles that
# previously shipped two H1s, and one localised variant.
SAMPLED_ROUTES = [
    "",                                                       # home
    "about",
    "science",
    "blog",
    "blog/what-is-agreeableness-the-cooperative-dimension",
    "ca/blog/big-five-personality-across-cultures-what-research-shows",
    "da/blog/personality-and-happiness-what-big-five-predicts",
]

# Match opening <h1 ...> case-insensitively. Closing tag not required by the
# regex; the prerendered HTML always emits a closing tag if it emits an
# opening one, so counting opens is enough to detect duplicates.
H1_OPEN = re.compile(r"<h1[\s>]", re.IGNORECASE)


def _html_path(route: str) -> Path:
    """Map a route to the prerendered file under dist/."""
    if route == "":
        return DIST / "index.html"
    return DIST / route / "index.html"


def _has_prerendered() -> bool:
    """True only if the full prerender has run (not just `vite build`).

    `vite build` alone produces dist/index.html but no per-route subdirs.
    The prerender step in `npm run build:full` walks the React router and
    writes `dist/<route>/index.html` for every public path. The presence
    of `dist/about/index.html` is the canary for that.
    """
    return DIST.is_dir() and (DIST / "about" / "index.html").is_file()


@pytest.mark.skipif(not _has_prerendered(), reason="dist/ not prerendered; run `npm run build:full` first")
@pytest.mark.parametrize("route", SAMPLED_ROUTES)
def test_route_has_exactly_one_h1(route: str) -> None:
    path = _html_path(route)
    assert path.is_file(), f"prerendered HTML missing: {path}"
    html = path.read_text(encoding="utf-8")
    count = len(H1_OPEN.findall(html))
    assert count == 1, (
        f"route /{route or ''}/ has {count} <h1> tags in prerendered HTML; "
        f"SEO requires exactly one. File: {path}"
    )
