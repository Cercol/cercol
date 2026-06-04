"""
Blog API router for Cèrcol.

Provides public read endpoints and admin write endpoints for blog_posts.
Uses the same DB pool (app.state.pool via Request), auth, and JSON patterns
as main.py.

# Spec: docs/architecture/backend.md
"""

from datetime import datetime, timezone
from typing import Optional

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

import os

from deps import require_admin

router = APIRouter()

# ---------------------------------------------------------------------------
# Auth — admin gate shared via api/deps.py (Phase 17.8, imported above).
# Keep only the JWT_SECRET fail-fast guard, which is independent of the gate.
# ---------------------------------------------------------------------------

_JWT_SECRET = os.environ.get("JWT_SECRET", "")
# Fail fast at import time if JWT_SECRET is missing or too short.
# python-jose accepts an empty key for HS256 without raising, which
# would allow attackers to forge tokens by signing with "" if this
# check were absent. 32 bytes is the minimum for HMAC-SHA256.
if not _JWT_SECRET or len(_JWT_SECRET) < 32:
    raise RuntimeError(
        "JWT_SECRET environment variable must be set with at least "
        f"32 bytes. Current length: {len(_JWT_SECRET)}"
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _row_to_post(row) -> dict:
    """Convert an asyncpg Row from blog_posts into a camelCase dict."""
    # Subscript access for required columns; .get() with canonical defaults
    # for category/complexity so that a transient schema mismatch degrades
    # gracefully instead of raising KeyError.
    return {
        "slug":        row["slug"],
        "status":      row["status"],
        "title":       row["title"],
        "description": row["description"],
        "content":     row["content"],
        "coverUrl":    row["cover_url"],
        "author":      row["author"],
        "publishedAt": row["published_at"].isoformat() if row["published_at"] else None,
        "createdAt":   row["created_at"].isoformat() if row["created_at"] else None,
        "updatedAt":   row["updated_at"].isoformat() if row["updated_at"] else None,
        "viewCount":   row["view_count"],
        "category":    row.get("category", "general"),
        "complexity":  row.get("complexity", "intermediate"),
    }


def _row_to_list_item(row) -> dict:
    """Lighter projection for the list endpoint."""
    return {
        "slug":        row["slug"],
        "status":      row["status"],
        "title":       row["title"],
        "description": row["description"],
        "coverUrl":    row["cover_url"],
        "author":      row["author"],
        "publishedAt": row["published_at"].isoformat() if row["published_at"] else None,
        "viewCount":   row["view_count"],
        "category":    row.get("category", "general"),
        "complexity":  row.get("complexity", "intermediate"),
        # Languages with non-empty content. Feeds window.__BLOG_ARTICLES__
        # so BlogArticlePage can rewrite internal links to a localized URL
        # only when the target actually has that locale (else EN fallback).
        "languages":   list(row["languages"]) if row.get("languages") is not None else [],
    }


async def _lookup_redirect(conn, slug: str) -> str | None:
    """Return the successor slug for a dead slug, or None.

    Defensive: if the blog_slug_redirects table has not been migrated yet
    (the deploy may install new code before the SQL is applied), treat it
    as "no redirect" so /blog/<slug> degrades to a normal 404 instead of
    a 500.
    """
    try:
        return await conn.fetchval(
            "SELECT slug_new FROM blog_slug_redirects WHERE slug_old = $1", slug
        )
    except asyncpg.exceptions.UndefinedTableError:
        return None


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class BlogPostBody(BaseModel):
    slug:        str
    title:       dict
    description: dict
    content:     dict
    cover_url:   Optional[str] = None
    author:      Optional[str] = None
    status:      str = "draft"


class BlogPostUpdateBody(BaseModel):
    title:       Optional[dict] = None
    description: Optional[dict] = None
    content:     Optional[dict] = None
    cover_url:   Optional[str] = None
    author:      Optional[str] = None
    status:      Optional[str] = None


class BlogStatusBody(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# Routes — public
# ---------------------------------------------------------------------------

@router.get("/blog")
async def list_posts(request: Request):
    """Return all published posts, newest first (list projection only)."""
    async with request.app.state.pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT slug, status, title, description, cover_url, author, published_at, view_count,
                   category, complexity,
                   ARRAY(
                       SELECT k FROM jsonb_object_keys(content) AS k
                       WHERE coalesce(length(trim(content ->> k)), 0) > 0
                   ) AS languages
            FROM blog_posts
            WHERE status = 'published'
            ORDER BY published_at DESC NULLS LAST, id DESC
            """
        )
    return [_row_to_list_item(r) for r in rows]


@router.get("/blog/{slug}")
async def get_post(slug: str, request: Request):
    """Return a single post by slug.

    If the slug is unknown, consult blog_slug_redirects: a hit returns a
    308 Permanent Redirect to /blog/<slug_new>, otherwise 404. Only one
    hop is ever followed, and the target must resolve to a live post, so a
    redirect chain or an A->B->A cycle can never loop or land on a 404
    page: a redirect whose target does not exist is reported as 404.
    """
    async with request.app.state.pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT slug, status, title, description, content, cover_url,
                   author, published_at, created_at, updated_at, view_count,
                   category, complexity
            FROM blog_posts
            WHERE slug = $1
            """,
            slug,
        )
        if row:
            return _row_to_post(row)

        new_slug = await _lookup_redirect(conn, slug)
        if new_slug:
            # Single hop only: the successor must itself be a live post.
            # This rejects chains (B is only a redirect, not an article)
            # and cycles (A->B->A never resolves to a real post).
            target_exists = await conn.fetchval(
                "SELECT 1 FROM blog_posts WHERE slug = $1", new_slug
            )
            if target_exists:
                return RedirectResponse(url=f"/blog/{new_slug}", status_code=308)

    raise HTTPException(status_code=404, detail="Post not found")


@router.post("/blog/{slug}/view")
async def increment_view(slug: str, request: Request):
    """Increment view_count by 1. Silent if slug not found."""
    async with request.app.state.pool.acquire() as conn:
        await conn.execute(
            "UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = $1",
            slug,
        )
    return {"ok": True}


# ---------------------------------------------------------------------------
# Routes — admin
# ---------------------------------------------------------------------------

@router.post("/blog")
async def create_post(
    body: BlogPostBody,
    request: Request,
    _: dict = Depends(require_admin),
):
    """Admin: create a new blog post."""
    published_at = None
    if body.status == "published":
        published_at = datetime.now(timezone.utc)

    async with request.app.state.pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO blog_posts
                (slug, status, title, description, content, cover_url, author, published_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                slug, status, title, description, content, cover_url,
                author, published_at, created_at, updated_at, view_count,
                category, complexity
            """,
            body.slug,
            body.status,
            body.title,
            body.description,
            body.content,
            body.cover_url,
            body.author,
            published_at,
        )
    return _row_to_post(row)


@router.put("/blog/{slug}")
async def update_post(
    slug: str,
    body: BlogPostUpdateBody,
    request: Request,
    _: dict = Depends(require_admin),
):
    """Admin: update an existing post. Sets published_at if first publish."""
    async with request.app.state.pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT status, published_at FROM blog_posts WHERE slug = $1", slug
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Post not found")

        updates = body.model_dump(exclude_none=True)
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        # If publishing for the first time, set published_at
        published_at_val = existing["published_at"]
        new_status = updates.get("status", existing["status"])
        if new_status == "published" and published_at_val is None:
            published_at_val = datetime.now(timezone.utc)
            updates["published_at"] = published_at_val

        cols = list(updates.keys())
        vals = list(updates.values())
        set_clause = ", ".join(f"{c} = ${i + 2}" for i, c in enumerate(cols))

        row = await conn.fetchrow(
            f"""
            UPDATE blog_posts
            SET {set_clause}, updated_at = now()
            WHERE slug = $1
            RETURNING
                slug, status, title, description, content, cover_url,
                author, published_at, created_at, updated_at, view_count,
                category, complexity
            """,
            slug, *vals,
        )
    return _row_to_post(row)


@router.patch("/blog/{slug}/status")
async def patch_post_status(
    slug: str,
    body: BlogStatusBody,
    request: Request,
    _: dict = Depends(require_admin),
):
    """Admin: toggle post status between 'published' and 'draft'."""
    if body.status not in ("published", "draft"):
        raise HTTPException(status_code=400, detail="status must be 'published' or 'draft'")

    async with request.app.state.pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT published_at FROM blog_posts WHERE slug = $1", slug
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Post not found")

        published_at_val = existing["published_at"]
        if body.status == "published" and published_at_val is None:
            published_at_val = datetime.now(timezone.utc)

        row = await conn.fetchrow(
            """
            UPDATE blog_posts
            SET status = $2, published_at = $3, updated_at = now()
            WHERE slug = $1
            RETURNING
                slug, status, title, description, content, cover_url,
                author, published_at, created_at, updated_at, view_count,
                category, complexity
            """,
            slug, body.status, published_at_val,
        )
    return _row_to_post(row)
