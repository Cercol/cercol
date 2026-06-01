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


# Languages the site prerenders. The default (English) blog lives at
# dist/blog/, every other language at dist/<lang>/blog/.
LANGS = ["", "ca", "da", "de", "es", "fr"]

# Stable top-level routes. These change rarely, so a small hardcoded list
# is fine, but each is included in the sample only if it actually exists
# in dist/. A renamed or removed page degrades to a skipped sample instead
# of a hard FileNotFoundError that breaks every parametrised case.
TOP_LEVEL_CANDIDATES = ["", "about", "science", "instruments", "roles", "faq", "blog"]


def _discover_routes() -> list[str]:
    """Derive the sampled routes from the prerendered dist/ instead of
    hardcoding blog slugs that rot when content is renamed or removed.

    The selection is deterministic (alphabetical, first per category) so
    the test is reproducible: it fails the same way for everyone. Coverage:
    every existing top-level page plus the first blog article (alphabetical)
    for each language that has any prerendered articles. That keeps the
    sample multilingual without naming a single concrete slug.

    Returns an empty list when dist/ is not prerendered; the skipif on each
    test then skips cleanly (no spurious failures in backend-only CI).
    """
    if not _has_prerendered():
        return []
    routes: list[str] = []
    for route in TOP_LEVEL_CANDIDATES:
        if _html_path(route).is_file():
            routes.append(route)
    # Localized top-level pages (Phase 17.11): /es, /es/about, ... . Each
    # language's home and doc pages now exist as a real prerendered path, so
    # the structural guards (one h1 / meta / canonical / og:title) run on
    # them too. The blog index is covered by the per-language article below.
    for lang in ("ca", "es", "fr", "de", "da"):
        for cand in TOP_LEVEL_CANDIDATES:
            if cand == "blog":
                continue
            route = lang if cand == "" else f"{lang}/{cand}"
            if _html_path(route).is_file():
                routes.append(route)
    for lang in LANGS:
        blog_dir = DIST / "blog" if lang == "" else DIST / lang / "blog"
        if not blog_dir.is_dir():
            continue
        slugs = sorted(
            p.name
            for p in blog_dir.iterdir()
            if p.is_dir() and (p / "index.html").is_file()
        )
        if slugs:
            prefix = "blog" if lang == "" else f"{lang}/blog"
            routes.append(f"{prefix}/{slugs[0]}")
    return routes


# Sampled at import time from the current prerender. Empty when dist/ is not
# built, in which case skipif takes over.
SAMPLED_ROUTES = _discover_routes()

# Top-level pages (excluding the home and the blog index) used by the
# og:title distinctness guard. Derived from the same stable candidate list,
# filtered to what exists in dist/.
TOP_LEVEL_OG_ROUTES = [
    route
    for route in TOP_LEVEL_CANDIDATES
    if route not in ("", "blog") and _html_path(route).is_file()
]


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
@pytest.mark.parametrize("route", TOP_LEVEL_OG_ROUTES)
def test_top_level_og_title_differs_from_home(route: str) -> None:
    """Regression guard for the audit finding: top-level pages such as
    /about/ and /science/ kept the home's generic og:title because
    usePageMeta did not mutate og:*. A top-level page sharing the home
    og:title means the fix regressed.
    """
    home_og = _og_title("")
    page_og = _og_title(route)
    assert page_og != home_og, (
        f"route /{route}/ has the same og:title as the home (\"{home_og}\"); "
        f"usePageMeta must set a page-specific og:title."
    )
