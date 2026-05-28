#!/usr/bin/env python3
"""
One-shot blog link integrity audit.

# Spec: docs/architecture/seo-pipeline.md

Reads every published article from the public API, extracts every link in
every language version of the body, and classifies them:

  - internal  (cercol.team / relative /blog/<slug>): validated against the
    live slug set. Reports dead targets and multilingual mismatches (the
    target exists, but not in the language of the article that links it).
  - external  (everything else): probed with HEAD (GET fallback), with a
    short timeout and retries. Distinguishes "broken" (404 / DNS failure)
    from "flaky" (timeout / 5xx / bot-detection 403), which are NOT
    treated as broken.

Output: docs/seo/links-audit-<YYYYMMDD>.md.

The article body is markdown, so links are extracted from markdown
syntax (``[text](url)`` and bare ``<url>``) plus any raw ``href="..."``
embedded HTML. This is more accurate than parsing rendered HTML and
keeps the script dependency-light (httpx only).

Usage:
    python scripts/audit_blog_links.py [--api https://api.cercol.team]
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path

import httpx

REPO_ROOT = Path(__file__).resolve().parents[1]
# Reuse the single source of truth for markdown link parsing (api/blog_links.py).
sys.path.insert(0, str(REPO_ROOT / "api"))
from blog_links import (  # noqa: E402
    LANGS,
    extract_link_targets,
    is_internal,
    langs_with_content,
    parse_blog_target,
)

DEFAULT_API = "https://api.cercol.team"

# Confidence threshold above which a redirect proposal is considered
# actionable rather than "needs human decision".
PROPOSE_THRESHOLD = 0.6


def fetch_article_list(client: httpx.Client) -> list[dict]:
    r = client.get("/blog", timeout=15)
    r.raise_for_status()
    data = r.json()
    if not isinstance(data, list) or not data:
        raise SystemExit("api /blog returned no articles")
    return data


def fetch_article(client: httpx.Client, slug: str) -> dict | None:
    r = client.get(f"/blog/{slug}", timeout=15)
    if r.status_code != 200:
        return None
    return r.json()


def similarity(a: str, b: str) -> float:
    """Blend slug-token overlap with raw string ratio for a 0..1 score."""
    ratio = SequenceMatcher(None, a, b).ratio()
    ta, tb = set(a.split("-")), set(b.split("-"))
    jaccard = len(ta & tb) / len(ta | tb) if (ta | tb) else 0.0
    return max(ratio, jaccard)


def propose_redirect(dead_slug: str, live_slugs: list[str], titles: dict) -> tuple[str | None, float]:
    """Best live slug for a dead one, by slug + title similarity."""
    best_slug, best_score = None, 0.0
    dead_title = titles.get(dead_slug, "").lower()
    for live in live_slugs:
        score = similarity(dead_slug, live)
        if dead_title:
            live_title = titles.get(live, "").lower()
            if live_title:
                score = max(score, similarity(dead_title, live_title))
        if score > best_score:
            best_slug, best_score = live, score
    return best_slug, round(best_score, 2)


def probe_external(client: httpx.Client, url: str) -> tuple[str, int | None]:
    """Return (classification, status_code). classification in broken|flaky|ok."""
    last_status: int | None = None
    for attempt in range(3):
        try:
            r = client.head(url, timeout=10, follow_redirects=True)
            last_status = r.status_code
            # Some servers reject HEAD; retry once with GET.
            if r.status_code in (405, 501):
                r = client.get(url, timeout=10, follow_redirects=True)
                last_status = r.status_code
            if r.status_code == 404:
                return "broken", 404
            if r.status_code < 400:
                return "ok", r.status_code
            if r.status_code in (403, 429) or r.status_code >= 500:
                # Likely bot-detection or transient; do not call it broken.
                return "flaky", r.status_code
            return "broken", r.status_code
        except (httpx.ConnectError, httpx.ConnectTimeout):
            # DNS / connection refused on the last attempt is a real break.
            if attempt == 2:
                return "broken", None
        except httpx.HTTPError:
            if attempt == 2:
                return "flaky", last_status
    return "flaky", last_status


def resolves_via_redirect(client: httpx.Client, slug: str, cache: dict[str, bool]) -> bool:
    """True if /blog/<slug> resolves to a live article, following one 308.

    A slug missing from the live set is not necessarily broken: the
    blog_slug_redirects table may 308 it to a live successor. Probe the API
    (following redirects) and treat a final 200 as resolved.
    """
    if slug in cache:
        return cache[slug]
    try:
        r = client.get(f"/blog/{slug}", timeout=10, follow_redirects=True)
        resolved = r.status_code == 200
    except httpx.HTTPError:
        resolved = False
    cache[slug] = resolved
    return resolved


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default=DEFAULT_API)
    args = ap.parse_args()

    client = httpx.Client(base_url=args.api, headers={"User-Agent": "cercol-link-audit/1.0"})

    listing = fetch_article_list(client)
    live_slugs = sorted(a["slug"] for a in listing)
    live_set = set(live_slugs)
    titles = {a["slug"]: (a.get("title", {}).get("en", "") if isinstance(a.get("title"), dict) else "") for a in listing}

    # Per-slug language availability (needs full content).
    print(f"[audit] fetching {len(live_slugs)} articles ...", file=sys.stderr)
    languages: dict[str, list[str]] = {}
    contents: dict[str, dict] = {}
    for slug in live_slugs:
        art = fetch_article(client, slug)
        if art:
            contents[slug] = art.get("content") or {}
            languages[slug] = langs_with_content(contents[slug])

    internal_broken: list[dict] = []
    internal_redirected: list[dict] = []
    redirect_cache: dict[str, bool] = {}
    mismatches: list[dict] = []
    external_seen: dict[str, tuple[str, int | None]] = {}
    external_broken: list[dict] = []
    external_flaky: list[dict] = []
    total_links = 0
    total_internal = 0
    total_external = 0

    for slug in live_slugs:
        content = contents.get(slug, {})
        for lang in langs_with_content(content):
            for url in extract_link_targets(content[lang]):
                total_links += 1
                if is_internal(url):
                    total_internal += 1
                    target = parse_blog_target(url)
                    if target is None:
                        # Internal but not a /blog/ target (e.g. /science).
                        continue
                    _, target_slug = target
                    if target_slug not in live_set:
                        # Not a live slug, but it may 308 to a live successor.
                        if resolves_via_redirect(client, target_slug, redirect_cache):
                            internal_redirected.append(
                                {"from": slug, "lang": lang, "slug": target_slug}
                            )
                        else:
                            internal_broken.append(
                                {"from": slug, "lang": lang, "url": url, "slug": target_slug}
                            )
                    elif lang not in languages.get(target_slug, []):
                        mismatches.append(
                            {"from": slug, "lang": lang, "target": target_slug,
                             "has": ",".join(languages.get(target_slug, []))}
                        )
                else:
                    total_external += 1
                    if url not in external_seen:
                        external_seen[url] = probe_external(client, url)
                    cls, code = external_seen[url]
                    if cls == "broken":
                        external_broken.append({"from": slug, "lang": lang, "url": url, "code": code})
                    elif cls == "flaky":
                        external_flaky.append({"from": slug, "lang": lang, "url": url, "code": code})

    # Redirect proposals for dead internal slugs (deduped by dead slug).
    dead_slugs = sorted({b["slug"] for b in internal_broken})
    proposals: dict[str, tuple[str | None, float]] = {}
    for ds in dead_slugs:
        proposals[ds] = propose_redirect(ds, live_slugs, titles)

    # ---- Render report -----------------------------------------------------
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    out_path = REPO_ROOT / "docs" / "seo" / f"links-audit-{today}.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []
    lines.append(f"# Blog link integrity audit ({today})")
    lines.append("")
    lines.append("Generated by `scripts/audit_blog_links.py`. One-shot snapshot.")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Articles audited: {len(live_slugs)}")
    lines.append(f"- Links checked: {total_links} ({total_internal} internal, {total_external} external)")
    lines.append(f"- Internal broken: {len(internal_broken)} ({len(dead_slugs)} distinct dead slugs)")
    lines.append(
        f"- Internal resolved via redirect: {len(internal_redirected)} "
        f"({len({r['slug'] for r in internal_redirected})} distinct slugs, not broken)"
    )
    lines.append(f"- External broken: {len(external_broken)}")
    lines.append(f"- External flaky (informational): {len(external_flaky)}")
    lines.append(f"- Multilingual mismatches: {len(mismatches)}")
    lines.append("")

    lines.append("## Internal broken links with redirect proposals")
    lines.append("")
    if internal_broken:
        lines.append("| From article | Lang | Broken link | Dead slug | Proposal | Confidence |")
        lines.append("|---|---|---|---|---|---|")
        for b in internal_broken:
            slug = b["slug"]
            prop, conf = proposals.get(slug, (None, 0.0))
            verdict = prop if (prop and conf >= PROPOSE_THRESHOLD) else "needs human decision"
            lines.append(f"| {b['from']} | {b['lang']} | `{b['url']}` | `{slug}` | {verdict} | {conf} |")
    else:
        lines.append("None.")
    lines.append("")

    lines.append("## Internal links resolved via redirect")
    lines.append("")
    lines.append("Targets not in the live slug set that 308 to a live successor")
    lines.append("via blog_slug_redirects. These are NOT broken.")
    lines.append("")
    redirected_slugs = sorted({r["slug"] for r in internal_redirected})
    if redirected_slugs:
        lines.append("| Dead slug | Instances |")
        lines.append("|---|---|")
        for ds in redirected_slugs:
            n = sum(1 for r in internal_redirected if r["slug"] == ds)
            lines.append(f"| `{ds}` | {n} |")
    else:
        lines.append("None.")
    lines.append("")

    lines.append("## External broken links")
    lines.append("")
    if external_broken:
        lines.append("| From article | Lang | URL | Code |")
        lines.append("|---|---|---|---|")
        for b in external_broken:
            lines.append(f"| {b['from']} | {b['lang']} | {b['url']} | {b['code']} |")
    else:
        lines.append("None.")
    lines.append("")

    lines.append("## External flaky (informational, not urgent)")
    lines.append("")
    if external_flaky:
        lines.append("| From article | Lang | URL | Code |")
        lines.append("|---|---|---|---|")
        for b in external_flaky:
            lines.append(f"| {b['from']} | {b['lang']} | {b['url']} | {b['code']} |")
    else:
        lines.append("None.")
    lines.append("")

    lines.append("## Multilingual mismatches")
    lines.append("")
    lines.append("Internal link target is live, but has no content in the language")
    lines.append("of the article linking it. The render-time rewrite falls back to")
    lines.append("the English URL for these (see BlogArticlePage).")
    lines.append("")
    if mismatches:
        lines.append("| From article | Lang | Target slug | Target has |")
        lines.append("|---|---|---|---|")
        for m in mismatches[:200]:
            lines.append(f"| {m['from']} | {m['lang']} | `{m['target']}` | {m['has']} |")
        if len(mismatches) > 200:
            lines.append(f"| ... | | | {len(mismatches) - 200} more |")
    else:
        lines.append("None.")
    lines.append("")

    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[audit] wrote {out_path.relative_to(REPO_ROOT)}", file=sys.stderr)
    print(f"[audit] internal_broken={len(internal_broken)} dead_slugs={dead_slugs}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
