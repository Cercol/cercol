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
    "blog/critiques-of-big-five-what-critics-say",
    "ca/blog/personality-and-negotiation-who-wins-and-why",
    "da/blog/personality-science-replication-crisis",
]

# Match opening <h1 ...> case-insensitively. Closing tag not required by the
# regex; the prerendered HTML always emits a closing tag if it emits an
# opening one, so counting opens is enough to detect duplicates.
H1_OPEN = re.compile(r"<h1[\s>]", re.IGNORECASE)
META_DESC = re.compile(r'<meta\b[^>]*\bname="description"', re.IGNORECASE)
LINK_CANON = re.compile(r'<link\b[^>]*\brel="canonical"', re.IGNORECASE)
# Whole <meta property="og:title" ...> tag, in either attribute order.
OG_TITLE_TAG = re.compile(r'<meta\b[^>]*\bproperty="og:title"[^>]*>', re.IGNORECASE)
# content="..." inside a tag we already isolated.
CONTENT_ATTR = re.compile(r'\bcontent="([^"]*)"', re.IGNORECASE)


def _html_path(route: str) -> Path:
    """Map a route to the prerendered file under dist/."""
    if route == "":
        return DIST / "index.html"
    return DIST / route / "index.html"


def _og_title(route: str) -> str:
    """Return the og:title content for a prerendered route."""
    html = _html_path(route).read_text(encoding="utf-8")
    tag = OG_TITLE_TAG.search(html)
    assert tag, f"route /{route or ''}/ has no <meta property=\"og:title\">"
    m = CONTENT_ATTR.search(tag.group(0))
    assert m, f"route /{route or ''}/ og:title tag has no content attribute"
    return m.group(1)


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


@pytest.mark.skipif(not _has_prerendered(), reason="dist/ not prerendered; run `npm run build:full` first")
@pytest.mark.parametrize("route", SAMPLED_ROUTES)
def test_route_has_exactly_one_meta_description(route: str) -> None:
    """A page shipping two <meta name="description"> tags lets Google
    pick the wrong one. Regression source:
    docs/post-mortems/2026-05-23-duplicate-meta-description.md (TBD).
    """
    path = _html_path(route)
    html = path.read_text(encoding="utf-8")
    count = len(META_DESC.findall(html))
    assert count == 1, (
        f"route /{route or ''}/ has {count} <meta name=\"description\"> tags; "
        f"SEO requires exactly one. File: {path}"
    )


@pytest.mark.skipif(not _has_prerendered(), reason="dist/ not prerendered; run `npm run build:full` first")
@pytest.mark.parametrize("route", SAMPLED_ROUTES)
def test_route_has_exactly_one_canonical(route: str) -> None:
    """Two canonicals are worse than none; Google may treat them as a
    conflicting signal and ignore the one we actually want.
    """
    path = _html_path(route)
    html = path.read_text(encoding="utf-8")
    count = len(LINK_CANON.findall(html))
    assert count == 1, (
        f"route /{route or ''}/ has {count} <link rel=\"canonical\"> tags; "
        f"SEO requires exactly one. File: {path}"
    )


@pytest.mark.skipif(not _has_prerendered(), reason="dist/ not prerendered; run `npm run build:full` first")
@pytest.mark.parametrize("route", SAMPLED_ROUTES)
def test_route_has_exactly_one_og_title(route: str) -> None:
    """Each page must ship exactly one <meta property="og:title"> with a
    non-empty content. The earlier bug shipped the tag (from the shell)
    but usePageMeta never mutated it for top-level pages, so the count
    was right but the content was the generic home title; this guard
    pairs with the distinctness check below.
    """
    path = _html_path(route)
    html = path.read_text(encoding="utf-8")
    count = len(OG_TITLE_TAG.findall(html))
    assert count == 1, (
        f"route /{route or ''}/ has {count} <meta property=\"og:title\"> tags; "
        f"SEO requires exactly one. File: {path}"
    )
    assert _og_title(route).strip(), (
        f"route /{route or ''}/ has an empty og:title content. File: {path}"
    )


@pytest.mark.skipif(not _has_prerendered(), reason="dist/ not prerendered; run `npm run build:full` first")
@pytest.mark.parametrize("route", ["about", "science"])
def test_top_level_og_title_differs_from_home(route: str) -> None:
    """Regression guard for the audit finding: /about/ and /science/ kept
    the home's generic og:title because usePageMeta did not mutate og:*.
    A top-level page sharing the home og:title means the fix regressed.
    """
    home_og = _og_title("")
    page_og = _og_title(route)
    assert page_og != home_og, (
        f"route /{route}/ has the same og:title as the home (\"{home_og}\"); "
        f"usePageMeta must set a page-specific og:title."
    )
