"""
Shared link-extraction helpers for blog content.

# Spec: docs/architecture/seo-pipeline.md

Blog article bodies are markdown. Several tools need to pull every link
out of that markdown and reason about which ones are internal blog
targets: the one-shot audit (scripts/audit_blog_links.py), the weekly
external-link cron (api/jobs/external_links_check.py), and the CI
integrity guard (api/tests/test_internal_links_integrity.py). They all
import from here so the parsing rules live in exactly one place, the same
way the frontend funnels through extractLinkedSlugs in BlogArticlePage.

The non-obvious part is balanced parentheses: CommonMark permits them
inside an unbracketed link destination, and DOIs depend on it
(``10.1016/S0092-6566(03)00046-1``). A naive ``[^)]+`` truncates at the
first inner paren and reports false 404s, so the markdown scanner tracks
paren depth.
"""

from __future__ import annotations

import re

# Languages whose content keys are recognised as real translations.
LANGS = ("en", "ca", "es", "fr", "de", "da")

# Start of a markdown inline link: the "](" that opens the destination.
_MD_LINK_OPEN = re.compile(r"\]\(")
# Bare autolink: <https://...> or </path>.
_AUTOLINK = re.compile(r"<((?:https?://|/)[^>\s]+)>")
# Raw HTML href attribute.
_HREF = re.compile(r"href=\"([^\"]+)\"", re.IGNORECASE)
# Internal blog target, optional language prefix and trailing slash.
_BLOG_PATH = re.compile(
    r"^(?:https?://(?:www\.)?cercol\.team)?/(?:([a-z]{2})/)?blog/([a-z0-9-]+)/?$"
)
# Optional title suffix inside a destination: dest "Title" / dest 'Title'.
_TITLE_SUFFIX = re.compile(r"^(\S+)\s+[\"'].*[\"']$")


def _md_link_targets(markdown: str) -> list[str]:
    """Destinations from markdown ``[text](dest)`` links, parens balanced."""
    targets: list[str] = []
    n = len(markdown)
    for m in _MD_LINK_OPEN.finditer(markdown):
        i = m.end()
        depth = 1
        buf: list[str] = []
        while i < n and depth > 0:
            ch = markdown[i]
            if ch == "(":
                depth += 1
                buf.append(ch)
            elif ch == ")":
                depth -= 1
                if depth > 0:
                    buf.append(ch)
            else:
                buf.append(ch)
            i += 1
        dest = "".join(buf).strip()
        title = _TITLE_SUFFIX.match(dest)
        if title:
            dest = title.group(1)
        dest = dest.strip("<>").strip()
        if dest:
            targets.append(dest)
    return targets


def extract_link_targets(markdown: str) -> list[str]:
    """All link targets from one markdown body (deduped, order preserved).

    Drops pure anchors and mailto/tel. Covers markdown links, autolinks,
    and raw HTML hrefs.
    """
    if not markdown:
        return []
    found: list[str] = _md_link_targets(markdown)
    found.extend(_AUTOLINK.findall(markdown))
    found.extend(_HREF.findall(markdown))
    cleaned = [
        u
        for u in found
        if u and not u.startswith("#") and not u.startswith(("mailto:", "tel:"))
    ]
    return list(dict.fromkeys(cleaned))


def parse_blog_target(url: str) -> tuple[str | None, str] | None:
    """Return (lang_prefix_or_None, slug) for an internal /blog/ link, else None."""
    m = _BLOG_PATH.match(url)
    if not m:
        return None
    return (m.group(1), m.group(2))


def is_internal(url: str) -> bool:
    """True for site-relative or cercol.team links."""
    return url.startswith("/") or "cercol.team" in url


def internal_blog_slugs(markdown: str) -> list[str]:
    """Slugs of every internal /blog/<slug> link in one markdown body."""
    out: list[str] = []
    for url in extract_link_targets(markdown):
        target = parse_blog_target(url)
        if target is not None:
            out.append(target[1])
    return list(dict.fromkeys(out))


def langs_with_content(content: dict | None) -> list[str]:
    """Languages whose content value is present and non-empty."""
    if not isinstance(content, dict):
        return []
    return [l for l in LANGS if isinstance(content.get(l), str) and content[l].strip()]
