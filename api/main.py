"""
Cèrcol API — FastAPI backend.

Phase 4.1:  health check + CORS.
Phase 4.2:  Supabase JWT auth via JWKS (ES256 / P-256 asymmetric).
Phase 4.5:  Stripe Checkout + webhook → premium flag.
Phase 7:    Witness Cèrcol session management.
Phase 10.19: slowapi rate limiting.
Phase 13.19: migrated from Supabase REST to local PostgreSQL (asyncpg).
             Added /results and /me/profile endpoints.
             Fixed N+1 queries, async I/O, JWKS TTL cache, CORS HTTPS-only.
"""

import json
import math
import os
import secrets
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

import asyncpg
import stripe
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded


# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------

def _get_client_ip(request: Request) -> str:
    """Extract real client IP, respecting Caddy's X-Forwarded-For."""
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=_get_client_ip)


# ---------------------------------------------------------------------------
# DB pool — created on startup, closed on shutdown
# ---------------------------------------------------------------------------

_pool: Optional[asyncpg.Pool] = None


async def _init_connection(conn: asyncpg.Connection) -> None:
    """Register JSON/JSONB codecs so asyncpg returns dicts, not strings."""
    await conn.set_type_codec("json",  encoder=json.dumps, decoder=json.loads, schema="pg_catalog")
    await conn.set_type_codec("jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _pool
    _pool = await asyncpg.create_pool(
        dsn=os.environ.get("DATABASE_URL"),
        min_size=2,
        max_size=10,
        init=_init_connection,
    )
    yield
    await _pool.close()


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Cèrcol API",
    version="0.5.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# HTTPS-only in production; localhost allowed for development
ALLOWED_ORIGINS = [
    "https://cercol.team",
    "http://localhost:5173",
    "http://localhost:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

_SUPABASE_URL          = os.environ.get("SUPABASE_URL", "").rstrip("/")
_FRONTEND_URL          = os.environ.get("FRONTEND_URL", "https://cercol.team")
_STRIPE_PRICE_ID       = os.environ.get("STRIPE_PRICE_ID", "")
_STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")

# ---------------------------------------------------------------------------
# Auth — JWKS-based verification (Supabase ECC P-256 / ES256)
# ---------------------------------------------------------------------------

_JWKS_URL      = f"{_SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_AUDIENCE      = "authenticated"
_JWKS_TTL      = 3600  # seconds — refresh key cache hourly (survives key rotation)
_key_cache: dict = {}
_key_cache_ts: float = 0.0


def _fetch_jwks() -> list[dict]:
    import urllib.request
    with urllib.request.urlopen(_JWKS_URL, timeout=5) as resp:
        return json.loads(resp.read())["keys"]


def _get_key(kid: str, alg: str):
    """Return the JWK for the given kid, refreshing the cache after TTL."""
    global _key_cache, _key_cache_ts
    now = time.monotonic()
    if now - _key_cache_ts > _JWKS_TTL:
        fresh: dict = {}
        for k in _fetch_jwks():
            fresh[k["kid"]] = jwk.construct(k, algorithm=k.get("alg", alg))
        _key_cache    = fresh
        _key_cache_ts = now
    if kid not in _key_cache:
        raise JWTError(f"Unknown kid: {kid!r}")
    return _key_cache[kid]


_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = credentials.credentials
    try:
        header  = jwt.get_unverified_header(token)
        kid     = header.get("kid", "")
        alg     = header.get("alg", "ES256")
        key     = _get_key(kid, alg)
        payload = jwt.decode(token, key, algorithms=[alg], audience=_AUDIENCE)
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> Optional[dict]:
    """Returns the authenticated user payload, or None if unauthenticated."""
    if credentials is None:
        return None
    try:
        header  = jwt.get_unverified_header(credentials.credentials)
        kid     = header.get("kid", "")
        alg     = header.get("alg", "ES256")
        key     = _get_key(kid, alg)
        payload = jwt.decode(credentials.credentials, key, algorithms=[alg], audience=_AUDIENCE)
        return payload
    except JWTError:
        return None


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

async def ensure_profile(conn: asyncpg.Connection, user_id: str, email: str | None = None) -> None:
    """Create/update profile row and claim any pending email-based group invitations."""
    if email:
        await conn.execute(
            """
            INSERT INTO profiles (id, email) VALUES ($1, $2)
            ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
            """,
            user_id, email.lower(),
        )
        # Link pending invitations sent to this email before the user registered
        await conn.execute(
            """
            UPDATE group_members SET user_id = $1
            WHERE invited_email = $2 AND user_id IS NULL AND status = 'pending'
            """,
            user_id, email.lower(),
        )
    else:
        await conn.execute(
            "INSERT INTO profiles (id) VALUES ($1) ON CONFLICT (id) DO NOTHING",
            user_id,
        )


# ---------------------------------------------------------------------------
# Scoring helpers (mirrors src/utils/role-scoring.js — single source of truth)
# ---------------------------------------------------------------------------

# Normative priors for z-score computation (from SCIENCE.md)
_NORM = {
    "presence":   {"mean": 3.3, "sd": 0.72},
    "bond":       {"mean": 3.9, "sd": 0.58},
    "discipline": {"mean": 3.7, "sd": 0.62},
    "depth":      {"mean": 2.8, "sd": 0.72},
    "vision":     {"mean": 3.7, "sd": 0.60},
}

# Role centroids (presence, bond, vision, discipline, depth) — must match role-scoring.js
_ROLE_CENTROIDS = {
    "R01": ( 1.0,  1.0,  0.0,  0.0, -0.5),
    "R02": ( 1.0, -1.0,  0.0,  0.5,  0.3),
    "R03": (-1.0,  1.0,  0.0, -0.3,  0.3),
    "R04": (-1.0, -1.0,  0.0,  0.0,  0.5),
    "R05": ( 1.0,  0.0,  1.0,  0.3, -0.3),
    "R06": ( 1.0,  0.0, -1.0,  0.5,  0.0),
    "R07": (-1.0,  0.0,  1.0,  0.0,  0.8),
    "R08": (-1.0,  0.0, -1.0,  1.0, -0.8),
    "R09": ( 0.0,  1.0,  1.0, -0.3,  0.3),
    "R10": ( 0.0,  1.0, -1.0,  0.5, -0.3),
    "R11": ( 0.0, -1.0,  1.0,  0.0,  0.5),
    "R12": ( 0.0, -1.0, -1.0,  0.3, -0.5),
}


def _scores_to_zscores(scores: dict) -> dict:
    return {
        domain: (scores[domain] - _NORM[domain]["mean"]) / _NORM[domain]["sd"]
        for domain in _NORM
        if domain in scores and scores[domain] is not None
    }


def _compute_role(zscores: dict) -> str:
    """Nearest-centroid role assignment (mirrors frontend role-scoring.js)."""
    vec = (
        zscores.get("presence",   0),
        zscores.get("bond",       0),
        zscores.get("vision",     0),
        zscores.get("discipline", 0),
        zscores.get("depth",      0),
    )
    best_role, best_dist = "R01", float("inf")
    for role, centroid in _ROLE_CENTROIDS.items():
        dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(vec, centroid)))
        if dist < best_dist:
            best_dist = dist
            best_role = role
    return best_role


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class WitnessInput(BaseModel):
    name: str
    email: Optional[str] = None


class CreateSessionsBody(BaseModel):
    witnesses: List[WitnessInput]


class DomainScores(BaseModel):
    presence:   float
    bond:       float
    discipline: float
    depth:      float
    vision:     float


class CompleteSessionBody(BaseModel):
    scores: DomainScores


class CreateGroupBody(BaseModel):
    name: str
    emails: List[str] = []


class LogResultBody(BaseModel):
    instrument: str
    language:   Optional[str] = None
    presence:   Optional[float] = None
    bond:       Optional[float] = None
    discipline: Optional[float] = None
    depth:      Optional[float] = None
    vision:     Optional[float] = None
    facets:     Optional[dict] = None


class UpdateProfileBody(BaseModel):
    first_name:      Optional[str] = None
    last_name:       Optional[str] = None
    country:         Optional[str] = None
    native_language: Optional[str] = None


# ---------------------------------------------------------------------------
# Routes — health + auth
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "version": app.version}


@app.get("/me")
async def me(user: dict = Depends(get_current_user)):
    """Returns the authenticated user's id and email."""
    return {"user_id": user["sub"], "email": user.get("email")}


@app.get("/me/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    """Return the authenticated user's full profile, including premium flag."""
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        await ensure_profile(conn, user_id, user.get("email"))
        row = await conn.fetchrow(
            "SELECT id, premium, first_name, last_name, country, native_language FROM profiles WHERE id = $1",
            user_id,
        )
    return dict(row)


@app.patch("/me/profile")
async def update_profile(
    body: UpdateProfileBody,
    user: dict = Depends(get_current_user),
):
    """Update mutable profile fields."""
    user_id = user["sub"]
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    cols   = list(updates.keys())
    vals   = list(updates.values())
    set_clause = ", ".join(f"{c} = ${i + 2}" for i, c in enumerate(cols))

    async with _pool.acquire() as conn:
        await ensure_profile(conn, user_id, user.get("email"))
        await conn.execute(
            f"UPDATE profiles SET {set_clause}, updated_at = now() WHERE id = $1",
            user_id, *vals,
        )
    return {"ok": True}


@app.get("/me/results")
async def get_my_results(user: dict = Depends(get_current_user)):
    """Return all results for the authenticated user, newest first."""
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, created_at, instrument, language,
                   presence, bond, discipline, depth, vision, facets
            FROM results
            WHERE user_id = $1
            ORDER BY created_at DESC
            """,
            user_id,
        )
    return [
        {**dict(r), "id": str(r["id"]), "created_at": r["created_at"].isoformat()}
        for r in rows
    ]


# ---------------------------------------------------------------------------
# Routes — result logging
# ---------------------------------------------------------------------------

@app.post("/results")
@limiter.limit("30/minute")
async def log_result(
    request: Request,
    body: LogResultBody,
    user: Optional[dict] = Depends(get_optional_user),
):
    """
    Log an instrument result. Supports both anonymous and authenticated calls.
    Replaces the direct Supabase insert previously done from the frontend.
    """
    user_id = user["sub"] if user else None
    async with _pool.acquire() as conn:
        if user_id:
            await ensure_profile(conn, user_id, (user or {}).get("email"))
        row = await conn.fetchrow(
            """
            INSERT INTO results
                (instrument, language, presence, bond, discipline, depth, vision, facets, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
            """,
            body.instrument, body.language,
            body.presence, body.bond, body.discipline, body.depth, body.vision,
            body.facets,
            user_id,
        )
    return {"id": str(row["id"])}


# ---------------------------------------------------------------------------
# Routes — Stripe
# ---------------------------------------------------------------------------

@app.post("/checkout")
async def create_checkout(user: dict = Depends(get_current_user)):
    """Creates a Stripe Checkout session. Returns { url }."""
    if not _STRIPE_PRICE_ID:
        raise HTTPException(status_code=500, detail="Stripe price not configured")
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{"price": _STRIPE_PRICE_ID, "quantity": 1}],
        client_reference_id=user["sub"],
        customer_email=user.get("email"),
        success_url=f"{_FRONTEND_URL}/full-moon?payment=success",
        cancel_url=f"{_FRONTEND_URL}/full-moon?payment=cancelled",
    )
    return {"url": session.url}


@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Receives Stripe events; marks profile premium on checkout.session.completed."""
    payload = await request.body()
    sig     = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, _STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        if user_id:
            async with _pool.acquire() as conn:
                await conn.execute(
                    "UPDATE profiles SET premium = true, updated_at = now() WHERE id = $1",
                    user_id,
                )

    return {"received": True}


# ---------------------------------------------------------------------------
# Routes — Witness Cèrcol
# ---------------------------------------------------------------------------

@app.post("/witness/sessions")
@limiter.limit("20/minute")
async def create_witness_sessions(
    request: Request,
    body: CreateSessionsBody,
    user: dict = Depends(get_current_user),
):
    """
    Creates up to 12 witness sessions for the authenticated user.
    Returns an array of { token, name, link }.
    """
    subject_id = user["sub"]
    async with _pool.acquire() as conn:
        await ensure_profile(conn, subject_id)
        profile = await conn.fetchrow(
            "SELECT first_name, last_name FROM profiles WHERE id = $1", subject_id
        )
        if profile:
            full = f"{profile['first_name'] or ''} {profile['last_name'] or ''}".strip()
            subject_display = full or user.get("email") or subject_id
        else:
            subject_display = user.get("email") or subject_id

        created = []
        for witness in body.witnesses[:12]:
            if not witness.name.strip():
                continue
            token = secrets.token_hex(16)
            await conn.execute(
                """
                INSERT INTO witness_sessions
                    (subject_id, subject_display, token, witness_name, witness_email)
                VALUES ($1, $2, $3, $4, $5)
                """,
                subject_id, subject_display, token,
                witness.name.strip(),
                witness.email.strip() if witness.email else None,
            )
            created.append({
                "token": token,
                "name":  witness.name.strip(),
                "link":  f"{_FRONTEND_URL}/witness/{token}",
            })
    return created


@app.get("/witness/session/{token}")
@limiter.limit("60/minute")
async def get_witness_session(request: Request, token: str):
    """
    Public endpoint — no auth required.
    Returns { witness_name, subject_display, completed } for a given token.
    """
    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT witness_name, subject_display, completed_at FROM witness_sessions WHERE token = $1",
            token,
        )
    if not row:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "witness_name":    row["witness_name"],
        "subject_display": row["subject_display"] or "",
        "completed":       row["completed_at"] is not None,
    }


@app.post("/witness/session/{token}/complete")
@limiter.limit("10/minute")
async def complete_witness_session(
    request: Request,
    token: str,
    body: CompleteSessionBody,
    user: Optional[dict] = Depends(get_optional_user),
):
    """
    Completes a witness session. Supports both anonymous and authenticated witnesses.
    If the request carries a valid Bearer token, witness_user_id is stored.
    """
    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, completed_at FROM witness_sessions WHERE token = $1", token
        )
        if not row:
            raise HTTPException(status_code=404, detail="Session not found")
        if row["completed_at"] is not None:
            raise HTTPException(status_code=409, detail="Session already completed")

        session_id      = row["id"]
        witness_user_id = user["sub"] if user else None

        await conn.execute(
            "INSERT INTO witness_responses (session_id, domain_scores) VALUES ($1, $2)",
            session_id, body.scores.model_dump(),
        )
        await conn.execute(
            "UPDATE witness_sessions SET completed_at = $1, witness_user_id = $2 WHERE id = $3",
            datetime.now(timezone.utc), witness_user_id, session_id,
        )
    return {"ok": True}


@app.get("/witness/my-sessions")
async def get_my_sessions(user: dict = Depends(get_current_user)):
    """Returns all witness sessions for the authenticated user, with scores for completed ones."""
    subject_id = user["sub"]
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT s.id, s.token, s.witness_name, s.witness_email,
                   s.completed_at, s.created_at, r.domain_scores
            FROM witness_sessions s
            LEFT JOIN witness_responses r ON r.session_id = s.id
            WHERE s.subject_id = $1
            ORDER BY s.created_at DESC
            """,
            subject_id,
        )
    return [
        {
            "id":            str(s["id"]),
            "token":         s["token"],
            "witness_name":  s["witness_name"],
            "witness_email": s["witness_email"],
            "completed_at":  s["completed_at"].isoformat() if s["completed_at"] else None,
            "created_at":    s["created_at"].isoformat(),
            "scores":        s["domain_scores"],
            "link":          f"{_FRONTEND_URL}/witness/{s['token']}",
        }
        for s in rows
    ]


@app.get("/witness/my-contributions")
async def get_my_contributions(user: dict = Depends(get_current_user)):
    """Returns the witness sessions this user has completed as a witness."""
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT subject_display, completed_at
            FROM witness_sessions
            WHERE witness_user_id = $1
            ORDER BY completed_at DESC
            """,
            user_id,
        )
    return [
        {
            "subject_display": r["subject_display"],
            "completed_at":    r["completed_at"].isoformat() if r["completed_at"] else None,
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# Routes — Groups
# ---------------------------------------------------------------------------

@app.post("/groups")
async def create_group(
    body: CreateGroupBody,
    user: dict = Depends(get_current_user),
):
    """Creates a group and optionally invites members by email."""
    user_id = user["sub"]
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Group name is required")

    async with _pool.acquire() as conn:
        await ensure_profile(conn, user_id, user.get("email"))
        row = await conn.fetchrow(
            "INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING id",
            name, user_id,
        )
        group_id = row["id"]

        await conn.execute(
            """
            INSERT INTO group_members (group_id, user_id, status, joined_at)
            VALUES ($1, $2, 'active', now())
            """,
            group_id, user_id,
        )

        errors = []
        creator_email = (user.get("email") or "").lower()
        for raw_email in body.emails:
            email = raw_email.strip().lower()
            if not email or email == creator_email:
                continue
            try:
                # If this email belongs to a registered user, invite them directly
                existing = await conn.fetchrow(
                    "SELECT id FROM profiles WHERE email = $1", email
                )
                if existing:
                    await conn.execute(
                        """
                        INSERT INTO group_members (group_id, user_id, status, invited_at)
                        VALUES ($1, $2, 'pending', now())
                        ON CONFLICT DO NOTHING
                        """,
                        group_id, existing["id"],
                    )
                else:
                    await conn.execute(
                        """
                        INSERT INTO group_members (group_id, status, invited_email)
                        VALUES ($1, 'pending', $2)
                        ON CONFLICT DO NOTHING
                        """,
                        group_id, email,
                    )
            except Exception:
                errors.append(email)

    return {"id": str(group_id), "name": name, "errors": errors}


@app.get("/groups/mine")
async def get_my_groups(user: dict = Depends(get_current_user)):
    """Returns all groups the authenticated user is an active member of."""
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                g.id, g.name, g.created_by, g.created_at,
                COUNT(DISTINCT gm_all.user_id)
                    FILTER (WHERE gm_all.status = 'active')            AS member_count,
                COUNT(DISTINCT r.user_id)
                    FILTER (WHERE gm_all.status = 'active'
                               AND r.instrument = 'fullMoon')          AS completed
            FROM groups g
            JOIN group_members gm     ON gm.group_id = g.id
                                      AND gm.user_id = $1
                                      AND gm.status  = 'active'
            JOIN group_members gm_all ON gm_all.group_id = g.id
            LEFT JOIN results r       ON r.user_id = gm_all.user_id
            GROUP BY g.id
            ORDER BY g.created_at DESC
            """,
            user_id,
        )
    return [
        {
            "id":           str(r["id"]),
            "name":         r["name"],
            "created_by":   str(r["created_by"]),
            "created_at":   r["created_at"].isoformat(),
            "member_count": r["member_count"],
            "completed":    r["completed"],
            "is_creator":   str(r["created_by"]) == user_id,
        }
        for r in rows
    ]


@app.get("/groups/pending")
async def get_pending_invitations(user: dict = Depends(get_current_user)):
    """Returns all pending group invitations for the authenticated user."""
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT g.id AS group_id, g.name AS group_name, gm.invited_at
            FROM group_members gm
            JOIN groups g ON g.id = gm.group_id
            WHERE gm.user_id = $1 AND gm.status = 'pending'
            ORDER BY gm.invited_at DESC
            """,
            user_id,
        )
    return [
        {
            "group_id":   str(r["group_id"]),
            "group_name": r["group_name"],
            "invited_at": r["invited_at"].isoformat(),
        }
        for r in rows
    ]


@app.post("/groups/{group_id}/accept")
async def accept_group_invitation(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    """Accept a pending group invitation."""
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        result = await conn.execute(
            """
            UPDATE group_members
            SET status = 'active', joined_at = now()
            WHERE group_id = $1 AND user_id = $2 AND status = 'pending'
            """,
            group_id, user_id,
        )
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Pending invitation not found")
    return {"ok": True}


@app.post("/groups/{group_id}/decline")
async def decline_group_invitation(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    """Decline (delete) a pending group invitation."""
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        result = await conn.execute(
            """
            DELETE FROM group_members
            WHERE group_id = $1 AND user_id = $2 AND status = 'pending'
            """,
            group_id, user_id,
        )
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Pending invitation not found")
    return {"ok": True}


@app.get("/groups/{group_id}/report-data")
async def get_group_report_data(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Returns report data for all active members of a group.
    Fetches profiles + latest Full Moon results in a single JOIN query.
    """
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        membership = await conn.fetchrow(
            "SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'",
            group_id, user_id,
        )
        if not membership:
            raise HTTPException(status_code=403, detail="Not a member of this group")

        group = await conn.fetchrow("SELECT id, name FROM groups WHERE id = $1", group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        rows = await conn.fetch(
            """
            SELECT
                gm.user_id,
                p.first_name, p.last_name,
                r.presence, r.bond, r.discipline, r.depth, r.vision
            FROM group_members gm
            LEFT JOIN profiles p ON p.id = gm.user_id
            LEFT JOIN LATERAL (
                SELECT presence, bond, discipline, depth, vision
                FROM results
                WHERE user_id = gm.user_id AND instrument = 'fullMoon'
                ORDER BY created_at DESC
                LIMIT 1
            ) r ON true
            WHERE gm.group_id = $1 AND gm.status = 'active'
            """,
            group_id,
        )

    members_data = []
    for row in rows:
        mid  = str(row["user_id"])
        full = f"{row['first_name'] or ''} {row['last_name'] or ''}".strip()

        has_result = row["presence"] is not None
        if has_result:
            raw = {k: row[k] for k in ("presence", "bond", "discipline", "depth", "vision")}
            zscores = _scores_to_zscores(raw)
            role    = _compute_role(zscores)
        else:
            zscores = None
            role    = None

        members_data.append({
            "user_id":      mid,
            "display_name": full or None,
            "role":         role,
            "zscores":      zscores,
            "completed":    has_result,
            "is_self":      mid == user_id,
        })

    return {
        "group_id":   group_id,
        "group_name": group["name"],
        "members":    members_data,
    }
