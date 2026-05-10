"""
Blog API router for Cèrcol.

Provides public read endpoints and admin write endpoints for blog_posts.
Uses the same DB pool (app.state.pool via Request), auth, and JSON patterns
as main.py.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

import os

router = APIRouter()

# ---------------------------------------------------------------------------
# Auth — mirrors main.py exactly (HS256, same env vars)
# ---------------------------------------------------------------------------

_JWT_SECRET    = os.environ.get("JWT_SECRET", "")
_JWT_ALGORITHM = "HS256"
_JWT_AUDIENCE  = "authenticated"

_bearer = HTTPBearer(auto_error=False)


def _get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        return jwt.decode(
            credentials.credentials,
            _JWT_SECRET,
            algorithms=[_JWT_ALGORITHM],
            audience=_JWT_AUDIENCE,
        )
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def _require_admin(
    request: Request,
    user: dict = Depends(_get_current_user),
) -> dict:
    """Dependency — raises 403 unless the authenticated user has is_admin = true."""
    user_id = user["sub"]
    async with request.app.state.pool.acquire() as conn:
        row = await conn.fetchrow("SELECT is_admin FROM profiles WHERE id = $1", user_id)
    if not row or not row["is_admin"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _row_to_post(row) -> dict:
    """Convert an asyncpg Row from blog_posts into a camelCase dict."""
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
        "category":    row["category"],
        "complexity":  row["complexity"],
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
        "category":    row["category"],
        "complexity":  row["complexity"],
    }


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
            SELECT slug, title, description, cover_url, author, published_at, view_count,
                   category, complexity
            FROM blog_posts
            WHERE status = 'published'
            ORDER BY published_at DESC
            """
        )
    return [_row_to_list_item(r) for r in rows]


@router.get("/blog/{slug}")
async def get_post(slug: str, request: Request):
    """Return a single post by slug. 404 if not found."""
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
    if not row:
        raise HTTPException(status_code=404, detail="Post not found")
    return _row_to_post(row)


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
    _: dict = Depends(_require_admin),
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
                author, published_at, created_at, updated_at, view_count
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
    _: dict = Depends(_require_admin),
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
                author, published_at, created_at, updated_at, view_count
            """,
            slug, *vals,
        )
    return _row_to_post(row)


@router.patch("/blog/{slug}/status")
async def patch_post_status(
    slug: str,
    body: BlogStatusBody,
    request: Request,
    _: dict = Depends(_require_admin),
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
                author, published_at, created_at, updated_at, view_count
            """,
            slug, body.status, published_at_val,
        )
    return _row_to_post(row)
