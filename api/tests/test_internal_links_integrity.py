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
