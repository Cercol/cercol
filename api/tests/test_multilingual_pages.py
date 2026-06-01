"""
Path-based multilingual top-level pages (Phase 17.11).

# Spec: docs/policies/conventions.md

Each top-level page now ships a real prerendered HTML per language under a
locale prefix (dist/es/about/index.html, ...). These guards assert the
SEO-critical properties of those localized files:

  - <html lang="<locale>"> matches the locale (not always "en").
  - the canonical points to the localized page itself.
  - the hreflang set covers every language plus x-default.

Reads the prerendered dist/ and skips when it has not been built, exactly
like test_seo.py, so backend-only CI is unaffected.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
DIST = REPO_ROOT / "dist"
BASE = "https://cercol.team"

LANGS = ("en", "ca", "es", "fr", "de", "da")
# (locale, neutral_page, expected_canonical_path)
SAMPLES = [
    ("es", "about", "/es/about/"),
    ("ca", "science", "/ca/science/"),
    ("da", "", "/da/"),          # localized home
    ("fr", "roles", "/fr/roles/"),
]

HTML_TAG = re.compile(r"<html\b[^>]*>", re.IGNORECASE)
LANG_ATTR = re.compile(r'\blang="([^"]+)"', re.IGNORECASE)
CANON = re.compile(r'<link\b[^>]*\brel="canonical"[^>]*>', re.IGNORECASE)
HREF_ATTR = re.compile(r'\bhref="([^"]+)"', re.IGNORECASE)
HREFLANG = re.compile(r'<link\b[^>]*\bhreflang="([^"]+)"[^>]*>', re.IGNORECASE)


def _dist_file(locale: str, page: str) -> Path:
    if locale == "en":
        return DIST / "index.html" if page == "" else DIST / page / "index.html"
    return DIST / locale / "index.html" if page == "" else DIST / locale / page / "index.html"


def _has_prerendered() -> bool:
    return DIST.is_dir() and (DIST / "es" / "about" / "index.html").is_file()


pytestmark = pytest.mark.skipif(
    not _has_prerendered(),
    reason="dist/ not prerendered with localized pages; run `npm run build:full`",
)


@pytest.mark.parametrize("locale,page,canon_path", SAMPLES)
def test_html_lang_matches_locale(locale, page, canon_path):
    html = _dist_file(locale, page).read_text(encoding="utf-8")
    tag = HTML_TAG.search(html)
    assert tag, "no <html> tag"
    m = LANG_ATTR.search(tag.group(0))
    assert m, "<html> has no lang attribute"
    assert m.group(1).startswith(locale), (
        f"/{locale}/{page} has <html lang=\"{m.group(1)}\">, expected \"{locale}\""
    )


@pytest.mark.parametrize("locale,page,canon_path", SAMPLES)
def test_canonical_points_to_self(locale, page, canon_path):
    html = _dist_file(locale, page).read_text(encoding="utf-8")
    tags = CANON.findall(html)
    assert len(tags) == 1, f"expected exactly one canonical, got {len(tags)}"
    href = HREF_ATTR.search(tags[0]).group(1)
    assert href == f"{BASE}{canon_path}", f"canonical {href} != {BASE}{canon_path}"


@pytest.mark.parametrize("locale,page,canon_path", SAMPLES)
def test_hreflang_covers_all_languages(locale, page, canon_path):
    html = _dist_file(locale, page).read_text(encoding="utf-8")
    found = set(HREFLANG.findall(html))
    for lang in LANGS:
        assert lang in found, f"/{locale}/{page} missing hreflang {lang}"
    assert "x-default" in found, f"/{locale}/{page} missing hreflang x-default"
    # No ?lang= alternates should survive in the path-based model. Check the
    # actual link hrefs (alternate + canonical), not raw text, so an HTML
    # comment mentioning ?lang= does not trip the guard.
    link_hrefs = [
        HREF_ATTR.search(t).group(1)
        for t in re.findall(r"<link\b[^>]*>", html, re.IGNORECASE)
        if HREF_ATTR.search(t)
    ]
    offenders = [h for h in link_hrefs if "?lang=" in h]
    assert not offenders, f"/{locale}/{page} still emits ?lang= link hrefs: {offenders}"
