"""
Internal blog link integrity guard (Phase 17.10).

# Spec: docs/architecture/seo-pipeline.md

Every internal /blog/<slug> link in the prerendered site must resolve:
the target slug is either a live article OR has a row in the
blog_slug_redirects migration (so the API answers 308 instead of 404).
A link that satisfies neither is a silent dead end and fails the build.

The check reads the prerendered dist/ (the same source as test_seo) and
skips cleanly when dist/ has not been built, so backend-only CI is not
affected. The live slug universe is the set of prerendered article
directories; the redirect allowlist is parsed from
db/migrations/016_blog_slug_redirects.sql, which keeps this guard tied to
the single source of truth for redirects. Link parsing reuses
api/blog_links so there is no second, drifting implementation.

External links are intentionally out of scope here (too flaky for CI);
api/jobs/external_links_check.py covers them weekly.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from blog_links import parse_blog_target  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
DIST = REPO_ROOT / "dist"
BLOG_DIR = DIST / "blog"
MIGRATION = REPO_ROOT / "db" / "migrations" / "016_blog_slug_redirects.sql"

HREF = re.compile(r'href="([^"]+)"', re.IGNORECASE)
# First element of each VALUES tuple in the migration is slug_old.
REDIRECT_OLD = re.compile(r"\(\s*'([^']+)'\s*,")


def _has_prerendered() -> bool:
    return BLOG_DIR.is_dir() and any(BLOG_DIR.glob("*/index.html"))


def _live_slugs() -> set[str]:
    return {p.parent.name for p in BLOG_DIR.glob("*/index.html")}


def _redirect_olds() -> set[str]:
    if not MIGRATION.is_file():
        return set()
    sql = MIGRATION.read_text(encoding="utf-8")
    # Drop the CREATE TABLE block so a column name is never mistaken for
    # a value; only scan after the INSERT.
    insert_at = sql.find("INSERT INTO")
    if insert_at != -1:
        sql = sql[insert_at:]
    return set(REDIRECT_OLD.findall(sql))


def _all_blog_html_files() -> list[Path]:
    """Every prerendered blog article HTML, all languages."""
    files = list(BLOG_DIR.glob("*/index.html"))
    for lang in ("ca", "es", "fr", "de", "da"):
        files.extend((DIST / lang / "blog").glob("*/index.html"))
    return files


@pytest.mark.skipif(not _has_prerendered(), reason="dist/ not prerendered; run `npm run build:full` first")
def test_internal_blog_links_resolve():
    live = _live_slugs()
    allow = live | _redirect_olds()
    assert live, "no prerendered blog articles found"

    broken: list[str] = []
    for path in _all_blog_html_files():
        html = path.read_text(encoding="utf-8")
        for href in HREF.findall(html):
            target = parse_blog_target(href)
            if target is None:
                continue
            _, slug = target
            if slug not in allow:
                rel = path.relative_to(DIST)
                broken.append(f"{rel}: /blog/{slug} (no live article, no redirect)")

    # Deduplicate for a readable failure message.
    unique = sorted(set(broken))
    assert not unique, (
        "Internal blog links that resolve to neither a live article nor a "
        "redirect (add the article, fix the link, or add a row to "
        f"db/migrations/016_blog_slug_redirects.sql):\n" + "\n".join(unique)
    )


# ---------------------------------------------------------------------------
# Internal links to non-blog routes
# ---------------------------------------------------------------------------
#
# The check above only ever looked at /blog/<slug>. That is how
# https://cercol.team/first-quarter sat in the corpus while answering HTTP
# 404: the route existed in the router, was missing from prerender.mjs, and
# nothing here looked at links that were not blog links. A route that is not
# pre-rendered is served public/404.html, which recovers for a browser with
# JS and is a hard 404 for every crawler.

# Routes the site links to on purpose and never pre-renders: sign-in and
# per-user pages. The header links to /auth from every page, so these are
# skipped rather than failed. They are a product decision, not a regression,
# and failing on them would fail every article in the corpus.
GATED_ROUTES = {
    "/auth", "/login", "/signup", "/account", "/my-results", "/admin",
    "/witness", "/groups",
    # FullMoonPage sends an anonymous visitor to /auth, so it belongs here
    # rather than in STATIC_ROUTES. See scripts/prerender.mjs.
    "/full-moon",
}

LANG_PREFIXES = ("ca", "es", "fr", "de", "da")

# Only anchors. <link rel=preload/stylesheet> and <script src> point at
# /assets/... and are not navigation; the first version of this guard read
# every href in the document and reported the stylesheet as a dead link.
ANCHOR_HREF = re.compile(r'<a\b[^>]*?\bhref="([^"]+)"', re.IGNORECASE)


def _internal_path(href: str) -> str | None:
    """The site-root path an href points at, or None if it is not internal."""
    for prefix in ("https://cercol.team", "http://cercol.team"):
        if href.startswith(prefix):
            href = href[len(prefix):] or "/"
            break
    else:
        if not href.startswith("/"):
            return None          # external, mailto:, #anchor, or relative
    href = href.split("#", 1)[0].split("?", 1)[0]
    if not href.startswith("/"):
        return None
    # Strip a language prefix: /es/instruments and /instruments are the same
    # route, and only one of them needs to exist for the link to resolve.
    parts = [p for p in href.strip("/").split("/") if p]
    if parts and parts[0] in LANG_PREFIXES:
        parts = parts[1:]
    if not parts:
        return None
    return "/" + "/".join(parts)


@pytest.mark.skipif(not _has_prerendered(), reason="dist/ not prerendered; run `npm run build:full` first")
def test_internal_non_blog_links_are_prerendered():
    broken: list[str] = []
    for path in _all_blog_html_files():
        html = path.read_text(encoding="utf-8")
        for href in ANCHOR_HREF.findall(html):
            if parse_blog_target(href) is not None:
                continue                      # covered by the test above
            target = _internal_path(href)
            if target is None:
                continue
            if target.startswith("/blog"):
                continue                      # index pages, covered elsewhere
            # First path segment only: /groups/<id> is gated as a family.
            if target in GATED_ROUTES or "/" + target.strip("/").split("/")[0] in GATED_ROUTES:
                continue
            if not (DIST / target.strip("/") / "index.html").is_file():
                broken.append(f"{path.relative_to(DIST)}: {target}")

    unique = sorted(set(broken))
    assert not unique, (
        "Internal links pointing at routes with no pre-rendered page. These "
        "answer HTTP 404 to every crawler and link preview even though a "
        "browser with JS recovers, which is exactly how /first-quarter sat "
        "broken in the corpus. Add the route to STATIC_ROUTES in "
        "scripts/prerender.mjs, or fix the link:\n" + "\n".join(unique)
    )
