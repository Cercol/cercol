"""
Cèrcol API - FastAPI backend.

# Spec: docs/architecture/backend.md


Phase 4.1:  health check + CORS.
Phase 4.2:  Supabase JWT auth via JWKS (ES256 / P-256 asymmetric).
Phase 4.5:  Stripe Checkout + webhook → premium flag.
Phase 7:    Witness Cèrcol session management.
Phase 10.19: slowapi rate limiting.
Phase 13.19: migrated from Supabase REST to local PostgreSQL (asyncpg).
             Added /results and /me/profile endpoints.
             Fixed N+1 queries, async I/O, JWKS TTL cache, CORS HTTPS-only.
Phase 15:   Replaced Supabase Auth (GoTrue) with self-hosted auth on Hetzner.
             JWT now HS256 / JWT_SECRET (symmetric).  Auth routes live in auth.py.
"""

import asyncio
import json
import os
import secrets
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

import asyncpg
import stripe
from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse, StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field, model_validator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from limiter import limiter, _get_client_ip
from scoring import (
    _NORM, _ROLE_CENTROIDS, _compute_role, _scores_to_zscores,
    DOMAINS, NORM_MIN_SAMPLE, NORM_REFRESH_DAYS, resolve_norm,
)
from emails import (
    send_witness_assigned, send_witness_completed, send_group_invitation,
    send_witness_round_assigned,
)
from deps import require_admin, require_premium
import auth as auth_module
import blog as blog_module
import seo as seo_module


# ---------------------------------------------------------------------------
# DB pool — created on startup, closed on shutdown
# ---------------------------------------------------------------------------

_pool: Optional[asyncpg.Pool] = None

# ---------------------------------------------------------------------------
# Living-model norm cache
# ---------------------------------------------------------------------------

# Populated by _recompute_norms() at startup and every NORM_REFRESH_DAYS days.
# Structure: { instrument: { language: { domain: {mean, sd, n} }, "__all__": {...} } }
_norm_cache: dict = {}
_norm_cache_ts: float = 0.0   # unix timestamp of last successful recompute


async def _recompute_norms() -> None:
    """
    Query the DB to compute empirical means and SDs at two tiers for each
    instrument: per-language and pooled (all languages).  Updates _norm_cache
    in-place so existing requests keep working during the refresh.
    """
    global _norm_cache, _norm_cache_ts

    # Build the SQL aggregate expression for all five domains
    agg_cols = ", ".join(
        f"AVG({d}) AS {d}_mean, STDDEV_SAMP({d}) AS {d}_sd"
        for d in DOMAINS
    )
    query = f"""
        SELECT instrument, language,
               COUNT(*) AS n,
               {agg_cols}
        FROM results
        WHERE {" AND ".join(f"{d} IS NOT NULL" for d in DOMAINS)}
        GROUP BY instrument, language
        ORDER BY instrument, language
    """

    new_cache: dict = {}

    async with _pool.acquire() as conn:
        rows = await conn.fetch(query)

    # Accumulate per-instrument totals for the "__all__" tier
    # We use Welford-style incremental mean/variance merge via (n, sum, sum_sq)
    instr_accum: dict = {}   # instrument -> domain -> {n, s, ss}

    for row in rows:
        instr = row["instrument"]
        lang  = row["language"] or "__unknown__"
        n     = row["n"]
        if n < NORM_MIN_SAMPLE:
            # Too few samples — skip tier-1 entry but still accumulate for tier-2
            pass
        else:
            if instr not in new_cache:
                new_cache[instr] = {}
            new_cache[instr][lang] = {
                d: {
                    "mean": float(row[f"{d}_mean"]),
                    "sd":   float(row[f"{d}_sd"] or 0),
                    "n":    int(n),
                }
                for d in DOMAINS
            }

        # Always accumulate for tier-2 (regardless of NORM_MIN_SAMPLE)
        if instr not in instr_accum:
            instr_accum[instr] = {d: {"n": 0, "s": 0.0, "ss": 0.0} for d in DOMAINS}
        for d in DOMAINS:
            mean_val = row[f"{d}_mean"]
            sd_val   = row[f"{d}_sd"]
            if mean_val is None or sd_val is None:
                continue
            acc = instr_accum[instr][d]
            # Merge: combine (n1, mean1, sd1) + (n2, mean2, sd2) into running totals
            acc["n"]  += n
            acc["s"]  += float(mean_val) * n
            acc["ss"] += (float(sd_val) ** 2 + float(mean_val) ** 2) * n

    # Build "__all__" tier from accumulated totals
    for instr, domains in instr_accum.items():
        total_n = domains[DOMAINS[0]]["n"]  # same n for all domains (same WHERE clause)
        if total_n < NORM_MIN_SAMPLE:
            continue
        if instr not in new_cache:
            new_cache[instr] = {}
        all_norm = {}
        for d in DOMAINS:
            acc  = domains[d]
            n    = acc["n"]
            mean = acc["s"] / n if n else 0
            var  = (acc["ss"] / n) - mean ** 2 if n else 0
            all_norm[d] = {
                "mean": round(mean, 4),
                "sd":   round(var ** 0.5, 4),
                "n":    n,
            }
        new_cache[instr]["__all__"] = all_norm

    _norm_cache    = new_cache
    _norm_cache_ts = time.time()


async def _norm_refresh_loop() -> None:
    """Background task: recompute norms every NORM_REFRESH_DAYS days."""
    interval = NORM_REFRESH_DAYS * 24 * 60 * 60
    while True:
        await asyncio.sleep(interval)
        try:
            await _recompute_norms()
        except Exception as exc:
            # Never crash the server — log and retry next cycle
            print(f"[norms] refresh failed: {exc}")


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
    app.state.pool = _pool  # expose to routers via request.app.state.pool
    # Compute empirical norms on startup (non-fatal if DB has no data yet)
    try:
        await _recompute_norms()
    except Exception as exc:
        print(f"[norms] initial compute failed (using priors): {exc}")
    # Schedule periodic refresh every NORM_REFRESH_DAYS days
    refresh_task = asyncio.create_task(_norm_refresh_loop())
    yield
    refresh_task.cancel()
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


# Global 500 handler that preserves CORS headers.
# Starlette's CORSMiddleware adds CORS headers on responses produced
# by the inner app, but when an unhandled exception bubbles up past
# the router the ServerErrorMiddleware emits a bare "Internal Server
# Error" without going through the CORS layer. The frontend then
# sees "Failed to fetch" instead of the actual HTTP 500. This handler
# turns any uncaught exception into a normal JSONResponse, which the
# CORS middleware does decorate.
async def _unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    import logging
    logging.getLogger("cercol.api").exception("Unhandled exception in %s", request.url.path)
    origin = request.headers.get("origin", "")
    headers: dict[str, str] = {}
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
        headers=headers,
    )

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

# Register the unhandled-exception handler AFTER CORS middleware so its
# response goes through the CORS layer on the way out. Register it for
# the base `Exception` class so it catches everything else that does
# not already have a specific handler (HTTPException is handled by
# FastAPI itself with the right CORS behaviour already).
app.add_exception_handler(Exception, _unhandled_exception_handler)

# Auth routes (magic link, password, Google OAuth, refresh, signout)
app.include_router(auth_module.router)

# Blog routes
app.include_router(blog_module.router)
app.include_router(seo_module.router)


# api.cercol.team serves the JSON API only, not crawlable content.
# Without a robots.txt Googlebot keeps probing for one and gets 404,
# wasting crawl budget on a hostname that has nothing to index.
_ROBOTS_TXT = "User-agent: *\nDisallow: /\n"


@app.get("/robots.txt", include_in_schema=False)
async def robots_txt() -> PlainTextResponse:
    """Tell crawlers to leave the API alone."""
    return PlainTextResponse(_ROBOTS_TXT, media_type="text/plain")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

_FRONTEND_URL          = os.environ.get("FRONTEND_URL", "https://cercol.team")
_STRIPE_PRICE_ID       = os.environ.get("STRIPE_PRICE_ID", "")
_STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
_JWT_SECRET            = os.environ.get("JWT_SECRET", "")
# Fail fast at import time if JWT_SECRET is missing or too short.
# python-jose accepts an empty key for HS256 without raising, which
# would allow attackers to forge tokens by signing with "" if this
# check were absent. 32 bytes is the minimum for HMAC-SHA256.
if not _JWT_SECRET or len(_JWT_SECRET) < 32:
    raise RuntimeError(
        "JWT_SECRET environment variable must be set with at least "
        f"32 bytes. Current length: {len(_JWT_SECRET)}"
    )

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")

# ---------------------------------------------------------------------------
# Auth — HS256 symmetric verification (self-hosted, replaces Supabase JWKS)
# ---------------------------------------------------------------------------

_JWT_ALGORITHM = "HS256"
_JWT_AUDIENCE  = "authenticated"

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(
            credentials.credentials,
            _JWT_SECRET,
            algorithms=[_JWT_ALGORITHM],
            audience=_JWT_AUDIENCE,
        )
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
        return jwt.decode(
            credentials.credentials,
            _JWT_SECRET,
            algorithms=[_JWT_ALGORITHM],
            audience=_JWT_AUDIENCE,
        )
    except JWTError:
        return None


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

BETA_TOTAL = 500

# Grant guard: a beta/premium slot is only claimed by an account whose email is
# verified. Magic-link and Google prove ownership by construction (set TRUE at
# account creation); password accounts start FALSE and flip TRUE via
# /auth/verify-email. This closes disposable-email slot-farming on the unverified
# password-signup path. $1 is user_id in both ensure_profile branches. The
# fragment injects only static SQL (no user data), so f-string interpolation is
# safe; asyncpg still binds every value as a numbered parameter.
_EMAIL_VERIFIED_SQL = "COALESCE((SELECT email_verified FROM auth_users WHERE id = $1), FALSE)"


async def ensure_profile(conn: asyncpg.Connection, user_id: str, email: str | None = None) -> None:
    """Create/update profile row, claim beta premium if slots remain, link pending invitations.

    The beta grant must also fire on the ON CONFLICT branch, not only on a fresh
    INSERT. Registration handlers in auth.py create the profiles row first (with
    no premium/beta), so by the time ensure_profile runs (on /me/profile,
    /me/results, /results) the row already exists and the INSERT branch never
    wins. Without granting on conflict, the first ~500 beta users were silently
    left on premium = false and sent to the paywall. The grant condition mirrors
    the INSERT: a slot remains AND the row is not already premium or beta AND the
    account's email is verified (_EMAIL_VERIFIED_SQL). We never revoke an existing
    grant or a paid premium (OR with the current value), and a paid user is never
    relabelled beta (the grant requires NOT premium)."""
    if email:
        await conn.execute(
            f"""
            INSERT INTO profiles (id, email, premium, is_beta)
            SELECT $1, $2,
                ((SELECT COUNT(*) < $3 FROM profiles WHERE is_beta = TRUE) AND {_EMAIL_VERIFIED_SQL}),
                ((SELECT COUNT(*) < $3 FROM profiles WHERE is_beta = TRUE) AND {_EMAIL_VERIFIED_SQL})
            ON CONFLICT (id) DO UPDATE SET
                email   = EXCLUDED.email,
                premium = profiles.premium OR (
                    NOT profiles.premium AND NOT profiles.is_beta
                    AND (SELECT COUNT(*) < $3 FROM profiles WHERE is_beta = TRUE)
                    AND {_EMAIL_VERIFIED_SQL}),
                is_beta = profiles.is_beta OR (
                    NOT profiles.premium AND NOT profiles.is_beta
                    AND (SELECT COUNT(*) < $3 FROM profiles WHERE is_beta = TRUE)
                    AND {_EMAIL_VERIFIED_SQL})
            """,
            user_id, email.lower(), BETA_TOTAL,
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
            f"""
            INSERT INTO profiles (id, premium, is_beta)
            SELECT $1,
                ((SELECT COUNT(*) < $2 FROM profiles WHERE is_beta = TRUE) AND {_EMAIL_VERIFIED_SQL}),
                ((SELECT COUNT(*) < $2 FROM profiles WHERE is_beta = TRUE) AND {_EMAIL_VERIFIED_SQL})
            ON CONFLICT (id) DO UPDATE SET
                premium = profiles.premium OR (
                    NOT profiles.premium AND NOT profiles.is_beta
                    AND (SELECT COUNT(*) < $2 FROM profiles WHERE is_beta = TRUE)
                    AND {_EMAIL_VERIFIED_SQL}),
                is_beta = profiles.is_beta OR (
                    NOT profiles.premium AND NOT profiles.is_beta
                    AND (SELECT COUNT(*) < $2 FROM profiles WHERE is_beta = TRUE)
                    AND {_EMAIL_VERIFIED_SQL})
            """,
            user_id, BETA_TOTAL,
        )


# ---------------------------------------------------------------------------
# Scoring helpers live in scoring.py (imported above)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class WitnessInput(BaseModel):
    name: str
    email: Optional[str] = None


class CreateSessionsBody(BaseModel):
    witnesses: List[WitnessInput]


class DomainScores(BaseModel):
    # Witness submissions are always 1-5 (forced-choice averaged scale).
    presence:   float = Field(..., ge=1, le=5)
    bond:       float = Field(..., ge=1, le=5)
    discipline: float = Field(..., ge=1, le=5)
    depth:      float = Field(..., ge=1, le=5)
    vision:     float = Field(..., ge=1, le=5)


class CompleteSessionBody(BaseModel):
    scores: DomainScores


class CreateGroupBody(BaseModel):
    name: str
    emails: List[str] = []


class InviteMembersBody(BaseModel):
    emails: List[str] = []


class AccuracyBody(BaseModel):
    # 1 = "this is not me", 5 = "this is me". Self-rated face validity.
    rating: int


class LogResultBody(BaseModel):
    # Restrict to known instruments. Unknown values must be rejected
    # because they would silently contaminate the results table and
    # _recompute_norms.
    instrument: Literal["newMoon", "firstQuarter", "fullMoon"]
    # Optional language tag for Tier 1 norms. Restrict to supported
    # locales to prevent typos polluting the empirical model.
    language: Optional[Literal["en", "ca", "es", "fr", "de", "da"]] = None
    # Scores: outer bounds [1, 7] cover both TIPI (newMoon, 1-7) and
    # IPIP-NEO (firstQuarter / fullMoon, 1-5). The instrument-specific
    # tighter bound is enforced by the model validator below.
    presence:   Optional[float] = Field(None, ge=1, le=7)
    bond:       Optional[float] = Field(None, ge=1, le=7)
    discipline: Optional[float] = Field(None, ge=1, le=7)
    depth:      Optional[float] = Field(None, ge=1, le=7)
    vision:     Optional[float] = Field(None, ge=1, le=7)
    facets:     Optional[Dict[str, Any]] = None
    # First-touch channel attribution (first-party, never linked to identity).
    # Requires migration 028; the INSERT below writes these columns.
    anon_id:      Optional[str] = None
    utm_source:   Optional[str] = None
    utm_medium:   Optional[str] = None
    utm_campaign: Optional[str] = None
    referrer:     Optional[str] = None

    @model_validator(mode="after")
    def _enforce_instrument_range(self):
        # newMoon uses TIPI 1-7; firstQuarter and fullMoon use IPIP-NEO 1-5.
        max_value = 7 if self.instrument == "newMoon" else 5
        for field_name in ("presence", "bond", "discipline", "depth", "vision"):
            value = getattr(self, field_name)
            if value is not None and value > max_value:
                raise ValueError(
                    f"{field_name}={value} exceeds max {max_value} "
                    f"for instrument={self.instrument}"
                )
        return self


class UpdateProfileBody(BaseModel):
    first_name:       Optional[str]  = None
    last_name:        Optional[str]  = None
    country:          Optional[str]  = None
    native_language:  Optional[str]  = None
    onboarding_seen:  Optional[bool] = None


class PasswordSetBody(BaseModel):
    password:         str
    current_password: Optional[str] = None


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


@app.get("/beta")
async def get_beta_status():
    """Public endpoint — returns remaining beta slots for the launch banner."""
    async with _pool.acquire() as conn:
        used = await conn.fetchval("SELECT COUNT(*) FROM profiles WHERE is_beta = TRUE")
    used = int(used)
    remaining = max(0, BETA_TOTAL - used)
    return {"remaining": remaining, "total": BETA_TOTAL, "active": remaining > 0}


@app.get("/me/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    """Return the authenticated user's full profile, including premium flag and has_password."""
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        await ensure_profile(conn, user_id, user.get("email"))
        row = await conn.fetchrow(
            """
            SELECT p.id, p.premium, p.is_admin, p.is_beta, p.first_name, p.last_name,
                   p.country, p.native_language, p.onboarding_seen,
                   (au.password_hash IS NOT NULL) AS has_password
            FROM profiles p
            JOIN auth_users au ON au.id = p.id
            WHERE p.id = $1
            """,
            user_id,
        )
    return dict(row)


@app.post("/me/password")
@limiter.limit("5/minute")
async def password_set(
    request: Request,
    body: PasswordSetBody,
    user: dict = Depends(get_current_user),
):
    """
    Set or change the password for the authenticated user.
    - If the account has no password yet (Google-only), sets it without requiring the current one.
    - If a password already exists, current_password is required.
    """
    from auth import _pwd_hash, _pwd_verify  # noqa: PLC0415

    new_password     = body.password
    current_password = body.current_password

    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    user_id = user["sub"]
    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT password_hash FROM auth_users WHERE id = $1", user_id
        )
        if row is None:
            raise HTTPException(status_code=404, detail="User not found")

        if row["password_hash"] is not None:
            if not current_password:
                raise HTTPException(status_code=400, detail="Current password required")
            if not _pwd_verify(current_password, row["password_hash"]):
                raise HTTPException(status_code=401, detail="Current password is incorrect")

        hashed = _pwd_hash(new_password)
        await conn.execute(
            "UPDATE auth_users SET password_hash = $1 WHERE id = $2",
            hashed, user_id,
        )
    return {"detail": "Password updated"}


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
# Routes — result anonymisation (user-initiated delete)
# ---------------------------------------------------------------------------

@app.delete("/me/results/{result_id}")
async def anonymise_result(result_id: str, user: dict = Depends(get_current_user)):
    """
    Anonymise a result owned by the authenticated user.
    Sets user_id = NULL so the row is permanently unlinked from the account.
    The scores are retained for population-level averages.
    Returns 404 if the result does not exist or belongs to another user.
    """
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        result = await conn.fetchrow(
            "SELECT id FROM results WHERE id = $1 AND user_id = $2",
            result_id, user_id,
        )
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        await conn.execute(
            "UPDATE results SET user_id = NULL WHERE id = $1",
            result_id,
        )
    return {"ok": True}


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
        # Full Moon persistence is premium-only (ADR 0018). Free instruments
        # (newMoon, firstQuarter) and anonymous posts stay open by design;
        # client-side scoring is untouched. premium OR is_beta so promo accounts
        # keep access while the "first 500 free" promotion is live. An anonymous
        # or non-entitled Full Moon persist is refused (403), so no ungated
        # fullMoon row can ever be written.
        if body.instrument == "fullMoon":
            prow = (
                await conn.fetchrow(
                    "SELECT premium, is_beta FROM profiles WHERE id = $1", user_id
                )
                if user_id
                else None
            )
            if not prow or not (prow["premium"] or prow["is_beta"]):
                raise HTTPException(status_code=403, detail="Forbidden")
        # Idempotency: a double click or a reload of the results page reposts
        # the same completion. One visitor produced three byte-identical
        # newMoon rows this way, which the digest counted as three tests and
        # the norms as three people. Same identity + same instrument + same
        # five domain scores inside the window is a resubmission, not a
        # retest: nobody answers 60 items again in ten minutes and lands on
        # exactly the same decimals. Return the original id instead of
        # inserting.
        # ponytail: a lookup, not a unique index, because the scores are
        # nullable NUMERICs; swap it for a constraint if this ever gets hot.
        if user_id or body.anon_id:
            dup = await conn.fetchrow(
                """
                SELECT id FROM results
                 WHERE instrument = $1
                   AND user_id IS NOT DISTINCT FROM $2
                   AND anon_id  IS NOT DISTINCT FROM $3
                   AND presence   IS NOT DISTINCT FROM $4
                   AND bond       IS NOT DISTINCT FROM $5
                   AND discipline IS NOT DISTINCT FROM $6
                   AND depth      IS NOT DISTINCT FROM $7
                   AND vision     IS NOT DISTINCT FROM $8
                   AND created_at > now() - interval '10 minutes'
                 ORDER BY created_at DESC LIMIT 1
                """,
                body.instrument, user_id, body.anon_id,
                body.presence, body.bond, body.discipline, body.depth, body.vision,
            )
            if dup:
                return {"id": str(dup["id"]), "duplicate": True}

        row = await conn.fetchrow(
            """
            INSERT INTO results
                (instrument, language, presence, bond, discipline, depth, vision, facets, user_id,
                 anon_id, utm_source, utm_medium, utm_campaign, referrer)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id
            """,
            body.instrument, body.language,
            body.presence, body.bond, body.discipline, body.depth, body.vision,
            body.facets,
            user_id,
            body.anon_id, body.utm_source, body.utm_medium, body.utm_campaign, body.referrer,
        )
    return {"id": str(row["id"])}


@app.post("/results/{result_id}/accuracy")
@limiter.limit("10/minute")
async def rate_result_accuracy(
    request: Request,
    result_id: str,
    body: AccuracyBody,
    user: Optional[dict] = Depends(get_optional_user),
):
    """Record how well a report described its subject, on 1-5.

    Anonymous by design, like the result itself: the caller proves ownership
    with the row's own id, which only the person who just finished the test
    has. Write-once, so a shared link cannot restack the rating.
    """
    if not 1 <= body.rating <= 5:
        raise HTTPException(status_code=400, detail="rating must be between 1 and 5")

    async with _pool.acquire() as conn:
        updated = await conn.execute(
            """
            UPDATE results SET accuracy_rating = $2, accuracy_rated_at = now()
             WHERE id = $1 AND accuracy_rating IS NULL
            """,
            result_id, body.rating,
        )
    if updated.endswith(" 0"):
        # Already rated, or no such row. Same answer either way: nothing to do,
        # and the caller learns nothing about which of the two it was.
        raise HTTPException(status_code=409, detail="Already rated")
    return {"ok": True}


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
    user: dict = Depends(require_premium),
):
    """
    Creates up to 12 witness sessions for the authenticated user.
    Returns an array of { token, name, link }.

    Premium-only (ADR 0018): a witness campaign is Full Moon value. premium OR
    is_beta (promo accounts included). The witness themselves submit via a public
    link and are never gated.
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
            link = f"{_FRONTEND_URL}/witness/{token}"
            created.append({
                "token": token,
                "name":  witness.name.strip(),
                "link":  link,
            })
            # Email the witness their link if we have their address
            if witness.email and witness.email.strip():
                # Look up witness language (they may not have a profile yet)
                witness_lang_row = await conn.fetchrow(
                    "SELECT native_language FROM profiles WHERE email = $1",
                    witness.email.strip().lower(),
                )
                witness_lang = witness_lang_row["native_language"] if witness_lang_row else None
                asyncio.create_task(send_witness_assigned(
                    witness_name    = witness.name.strip(),
                    witness_email   = witness.email.strip(),
                    subject_display = subject_display,
                    link            = link,
                    lang            = witness_lang or "en",
                ))
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
        # Fetch subject info to notify them by email
        subject_row = await conn.fetchrow(
            """
            SELECT ws.witness_name, ws.subject_display, p.email AS subject_email
            FROM witness_sessions ws
            JOIN profiles p ON p.id = ws.subject_id
            WHERE ws.id = $1
            """,
            session_id,
        )

    if subject_row and subject_row["subject_email"]:
        # Look up subject's preferred language
        async with _pool.acquire() as lang_conn:
            subject_lang_row = await lang_conn.fetchrow(
                "SELECT native_language FROM profiles WHERE email = $1",
                subject_row["subject_email"],
            )
        subject_lang = subject_lang_row["native_language"] if subject_lang_row else "en"
        asyncio.create_task(send_witness_completed(
            subject_email = subject_row["subject_email"],
            subject_name  = subject_row["subject_display"] or "",
            witness_name  = subject_row["witness_name"],
            lang          = subject_lang or "en",
        ))

    return {"ok": True}


@app.get("/witness/my-sessions")
async def get_my_sessions(user: dict = Depends(require_premium)):
    """Returns all witness sessions for the authenticated user, with scores for completed ones.

    Premium-only (ADR 0018): serving averaged witness results is Full Moon value.
    premium OR is_beta (promo accounts included).
    """
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

async def _display_name(conn, user_id: str, fallback_email: str | None) -> str:
    """Best available human name for a group inviter."""
    row = await conn.fetchrow(
        "SELECT first_name, last_name FROM profiles WHERE id = $1", user_id
    )
    if row:
        full = f"{row['first_name'] or ''} {row['last_name'] or ''}".strip()
        if full:
            return full
    return fallback_email or "Someone"


async def _invite_emails(conn, group_id, emails: List[str], creator_email: str):
    """Insert pending group_members rows for `emails`.

    Returns (invited, errors). An address that already has an account is
    linked by user_id; anything else is parked on invited_email until the
    person signs up. Shared by POST /groups and POST /groups/{id}/invite.
    """
    invited: List[str] = []
    errors: List[str] = []
    for raw_email in emails:
        email = raw_email.strip().lower()
        if not email or email == creator_email:
            continue
        try:
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
            invited.append(email)
        except Exception:
            errors.append(email)
    return invited, errors


async def _send_group_invitations(invited: List[str], group_name: str, inviter_name: str):
    """Fire-and-forget invitation emails, in each recipient's language."""
    if not invited:
        return
    async with _pool.acquire() as lang_conn:
        lang_rows = await lang_conn.fetch(
            "SELECT email, native_language FROM profiles WHERE email = ANY($1)", invited
        )
    lang_by_email = {r["email"]: r["native_language"] for r in lang_rows}
    for email in invited:
        asyncio.create_task(send_group_invitation(
            invited_email = email,
            group_name    = group_name,
            inviter_name  = inviter_name,
            lang          = lang_by_email.get(email) or "en",
        ))


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

        creator_name = await _display_name(conn, user_id, user.get("email"))
        invited_emails, errors = await _invite_emails(
            conn, group_id, body.emails, (user.get("email") or "").lower()
        )

    # Emails go out after the DB work, fire-and-forget.
    await _send_group_invitations(invited_emails, name, creator_name)

    return {"id": str(group_id), "name": name, "errors": errors}


async def _assert_group_owner(conn, group_id: str, user_id: str) -> str:
    """Return the group name, or raise if `user_id` did not create the group."""
    row = await conn.fetchrow(
        "SELECT name, created_by FROM groups WHERE id = $1", group_id
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Group not found")
    if str(row["created_by"]) != str(user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    return row["name"]


@app.post("/groups/{group_id}/invite")
async def invite_to_group(
    group_id: str,
    body: InviteMembersBody,
    user: dict = Depends(get_current_user),
):
    """Invite more people to an existing group. Owner only.

    Without this the only way to fix a mistyped invitation was to delete the
    group and rebuild it, which is exactly what the first real team did:
    three groups in eleven minutes because one address had a typo.
    """
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        name = await _assert_group_owner(conn, group_id, user_id)
        invited, errors = await _invite_emails(
            conn, group_id, body.emails, (user.get("email") or "").lower()
        )
        creator_name = await _display_name(conn, user_id, user.get("email"))

    await _send_group_invitations(invited, name, creator_name)
    return {"invited": invited, "errors": errors}


@app.delete("/groups/{group_id}/members")
async def remove_group_member(
    group_id: str,
    email: Optional[str] = None,
    member_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    """Remove one member from a group by invited email or user id. Owner only.

    The owner cannot remove themselves: a group with no owner has no way back.
    """
    user_id = user["sub"]
    if not email and not member_id:
        raise HTTPException(status_code=400, detail="email or member_id is required")
    if member_id and str(member_id) == str(user_id):
        raise HTTPException(status_code=400, detail="The group owner cannot be removed")

    async with _pool.acquire() as conn:
        await _assert_group_owner(conn, group_id, user_id)
        if member_id:
            deleted = await conn.execute(
                "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2",
                group_id, member_id,
            )
        else:
            # A pending invite can sit on either column: invited_email when the
            # address had no account, user_id once it did.
            deleted = await conn.execute(
                """
                DELETE FROM group_members
                 WHERE group_id = $1
                   AND user_id IS DISTINCT FROM $3
                   AND (lower(invited_email) = $2
                        OR user_id = (SELECT id FROM profiles WHERE lower(email) = $2))
                """,
                group_id, email.strip().lower(), user_id,
            )
    if deleted.endswith(" 0"):
        raise HTTPException(status_code=404, detail="Member not found in this group")
    return {"ok": True}


@app.post("/groups/{group_id}/witness-round")
async def start_witness_round(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    """Create a round-robin witness campaign for a group. Owner only.

    Every active member becomes a subject, and every other active member
    becomes one of their witnesses. This is the only path that produces
    self/observer agreement data, which is the check that tells us whether the
    12 roles measure anything: the individual /witness-setup flow has been
    live for months with no real use, because nobody discovers it alone.

    Idempotent per pair: a member who already has an open session for a given
    subject is skipped, so re-running the round chases stragglers instead of
    duplicating everyone's work.
    """
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        group_name = await _assert_group_owner(conn, group_id, user_id)
        members = await conn.fetch(
            """
            SELECT p.id, p.email, p.first_name, p.last_name, p.native_language
              FROM group_members m JOIN profiles p ON p.id = m.user_id
             WHERE m.group_id = $1 AND m.status = 'active' AND m.user_id IS NOT NULL
            """,
            group_id,
        )
        if len(members) < 2:
            raise HTTPException(
                status_code=400,
                detail="A witness round needs at least two active members",
            )

        def display(m):
            full = f"{m['first_name'] or ''} {m['last_name'] or ''}".strip()
            return full or (m["email"] or "A teammate")

        # witness id -> [(subject_display, link), ...]
        assignments: dict[str, list] = {}
        created = 0
        for subject in members:
            for witness in members:
                if subject["id"] == witness["id"]:
                    continue
                existing = await conn.fetchval(
                    """
                    SELECT 1 FROM witness_sessions
                     WHERE subject_id = $1 AND lower(witness_email) = $2
                       AND completed_at IS NULL
                    """,
                    subject["id"], (witness["email"] or "").lower(),
                )
                if existing:
                    continue
                token = secrets.token_urlsafe(32)
                await conn.execute(
                    """
                    INSERT INTO witness_sessions
                        (subject_id, subject_display, token, witness_name, witness_email)
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    subject["id"], display(subject), token,
                    display(witness), witness["email"],
                )
                created += 1
                assignments.setdefault(str(witness["id"]), []).append(
                    (display(subject), f"{_FRONTEND_URL}/witness/{token}")
                )

        inviter_name = await _display_name(conn, user_id, user.get("email"))
        by_id = {str(m["id"]): m for m in members}

    for witness_id, items in assignments.items():
        w = by_id[witness_id]
        asyncio.create_task(send_witness_round_assigned(
            witness_name  = f"{w['first_name'] or ''} {w['last_name'] or ''}".strip() or (w["email"] or ""),
            witness_email = w["email"],
            inviter_name  = inviter_name,
            group_name    = group_name,
            items         = items,
            lang          = w["native_language"] or "en",
        ))

    return {"members": len(members), "sessions_created": created,
            "witnesses_emailed": len(assignments)}


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
    user: dict = Depends(require_premium),
):
    """
    Returns report data for all active members of a group.
    Fetches profiles + latest Full Moon results in a single JOIN query.

    Premium-only (ADR 0018): the Last Quarter team report is Full Moon value.
    The premium/is_beta gate is ON TOP OF the existing active-membership check
    below — a member without premium/is_beta cannot pull the report.
    """
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        membership = await conn.fetchrow(
            "SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'",
            group_id, user_id,
        )
        if not membership:
            raise HTTPException(status_code=403, detail="Not a member of this group")

        group = await conn.fetchrow(
            "SELECT id, name, created_by FROM groups WHERE id = $1", group_id
        )
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        # Pending invitations were invisible to the owner, so a mistyped
        # address could only be "fixed" by rebuilding the group from scratch.
        pending = await conn.fetch(
            """
            SELECT gm.invited_email, gm.user_id, p.email AS account_email
              FROM group_members gm
              LEFT JOIN profiles p ON p.id = gm.user_id
             WHERE gm.group_id = $1 AND gm.status = 'pending'
             ORDER BY gm.invited_at
            """,
            group_id,
        )

        rows = await conn.fetch(
            """
            SELECT
                gm.user_id,
                p.first_name, p.last_name, p.email,
                r.presence, r.bond, r.discipline, r.depth, r.vision, r.language
            FROM group_members gm
            LEFT JOIN profiles p ON p.id = gm.user_id
            LEFT JOIN LATERAL (
                SELECT presence, bond, discipline, depth, vision, language
                FROM results
                WHERE user_id = gm.user_id AND instrument = 'fullMoon'
                ORDER BY created_at DESC
                LIMIT 1
            ) r ON true
            WHERE gm.group_id = $1 AND gm.status = 'active'
            """,
            group_id,
        )

        # Witness round progress. Two directions, and the owner needs both:
        # "given" is what this person still owes the others, "received" is how
        # much outside view their own report has. Without it the owner starts
        # a round and goes blind, with no way to chase the two people holding
        # the whole team up.
        member_ids = [r["user_id"] for r in rows]
        witness_rows = await conn.fetch(
            """
            SELECT ws.subject_id, lower(ws.witness_email) AS witness_email,
                   (ws.completed_at IS NOT NULL) AS done
              FROM witness_sessions ws
             WHERE ws.subject_id = ANY($1::uuid[]) AND NOT ws.is_seed
            """,
            member_ids,
        )

    given, received = {}, {}
    for w in witness_rows:
        sid = str(w["subject_id"])
        received.setdefault(sid, [0, 0])
        received[sid][1] += 1
        if w["done"]:
            received[sid][0] += 1
        email = w["witness_email"]
        if email:
            given.setdefault(email, [0, 0])
            given[email][1] += 1
            if w["done"]:
                given[email][0] += 1

    members_data = []
    for row in rows:
        mid  = str(row["user_id"])
        full = f"{row['first_name'] or ''} {row['last_name'] or ''}".strip()

        has_result = row["presence"] is not None
        if has_result:
            raw  = {k: row[k] for k in ("presence", "bond", "discipline", "depth", "vision")}
            norm, _ = resolve_norm("fullMoon", row.get("language"), _norm_cache)
            zscores = _scores_to_zscores(raw, norm, "fullMoon")
            role    = _compute_role(zscores)
        else:
            zscores = None
            role    = None

        g = given.get((row["email"] or "").lower(), [0, 0])
        rc = received.get(mid, [0, 0])
        members_data.append({
            "user_id":      mid,
            "display_name": full or None,
            "role":         role,
            "zscores":      zscores,
            "completed":    has_result,
            "is_self":      mid == user_id,
            # [done, total]; [0, 0] means no round has reached this person.
            "witness_given":    {"done": g[0],  "total": g[1]},
            "witness_received": {"done": rc[0], "total": rc[1]},
        })

    return {
        "group_id":   group_id,
        "group_name": group["name"],
        "members":    members_data,
        "is_owner":   str(group["created_by"]) == str(user_id),
        "pending": [
            {
                "email":   p["invited_email"] or p["account_email"],
                "user_id": str(p["user_id"]) if p["user_id"] else None,
            }
            for p in pending
        ],
    }


# ---------------------------------------------------------------------------
# Admin helpers
# ---------------------------------------------------------------------------
# require_admin now lives in api/deps.py (Phase 17.8) and is imported above.


def _csv_val(v) -> str:
    """Format a value as a CSV-safe string (minimal quoting)."""
    if v is None:
        return ""
    s = str(v)
    if any(c in s for c in (',', '"', '\n')):
        return '"' + s.replace('"', '""') + '"'
    return s


# ---------------------------------------------------------------------------
# Routes — admin
# ---------------------------------------------------------------------------

@app.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    """Global KPI counters: users and results."""
    async with _pool.acquire() as conn:
        p = await conn.fetchrow(
            """
            SELECT
                COUNT(*)                                      AS total,
                COUNT(*) FILTER (WHERE premium  = true)      AS premium,
                COUNT(*) FILTER (WHERE is_admin = true)      AS admins
            FROM profiles
            """
        )
        r = await conn.fetchrow(
            """
            SELECT
                COUNT(*)                                             AS total,
                COUNT(*) FILTER (WHERE user_id IS NULL)             AS anonymous,
                COUNT(*) FILTER (WHERE instrument = 'newMoon')      AS new_moon,
                COUNT(*) FILTER (WHERE instrument = 'firstQuarter') AS first_quarter,
                COUNT(*) FILTER (WHERE instrument = 'fullMoon')     AS full_moon
            FROM results
            """
        )
    return {
        "users": {
            "total":   p["total"],
            "premium": p["premium"],
            "admins":  p["admins"],
        },
        "results": {
            "total":         r["total"],
            "anonymous":     r["anonymous"],
            "by_instrument": {
                "newMoon":      r["new_moon"],
                "firstQuarter": r["first_quarter"],
                "fullMoon":     r["full_moon"],
            },
        },
    }


@app.get("/admin/users")
async def admin_users(
    offset: int = Query(0, ge=0),
    limit:  int = Query(25, ge=1, le=100),
    search: str = Query(""),
    _: dict = Depends(require_admin),
):
    """Paginated user list. Optional full-text search on email/name."""
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                p.id, p.email, p.first_name, p.last_name,
                p.premium, p.is_admin, p.created_at,
                COUNT(r.id) AS result_count
            FROM profiles p
            LEFT JOIN results r ON r.user_id = p.id
            WHERE $3 = ''
               OR p.email      ILIKE '%' || $3 || '%'
               OR p.first_name ILIKE '%' || $3 || '%'
               OR p.last_name  ILIKE '%' || $3 || '%'
            GROUP BY p.id
            ORDER BY p.created_at DESC NULLS LAST
            LIMIT $1 OFFSET $2
            """,
            limit + 1, offset, search,
        )
        total = await conn.fetchval(
            """
            SELECT COUNT(*) FROM profiles
            WHERE $1 = ''
               OR email      ILIKE '%' || $1 || '%'
               OR first_name ILIKE '%' || $1 || '%'
               OR last_name  ILIKE '%' || $1 || '%'
            """,
            search,
        )

    has_more = len(rows) > limit
    items = rows[:limit]
    return {
        "total":    total,
        "has_more": has_more,
        "items": [
            {
                **{k: v for k, v in dict(r).items() if k not in ("id", "created_at")},
                "id":         str(r["id"]),
                "created_at": r["created_at"].isoformat() if r["created_at"] else None,
                "result_count": r["result_count"],
            }
            for r in items
        ],
    }


@app.get("/admin/norms")
async def admin_norms(_: dict = Depends(require_admin)):
    """
    Returns the current norm cache state: which tier is active per
    (instrument, language) combination and when it was last computed.
    """
    computed_at = (
        datetime.fromtimestamp(_norm_cache_ts, tz=timezone.utc).isoformat()
        if _norm_cache_ts else None
    )

    tiers = {}
    instruments = ["newMoon", "firstQuarter", "fullMoon"]
    languages   = ["en", "ca", "es", "fr", "de", "da"]

    for instr in instruments:
        tiers[instr] = {}
        for lang in languages:
            norm, label = resolve_norm(instr, lang, _norm_cache)
            sample_n = None
            instr_cache = _norm_cache.get(instr, {})
            lang_entry  = instr_cache.get(lang)
            all_entry   = instr_cache.get("__all__")
            if lang_entry:
                sample_n = lang_entry[list(lang_entry.keys())[0]].get("n")
            elif all_entry:
                sample_n = all_entry[list(all_entry.keys())[0]].get("n")
            tiers[instr][lang] = {"tier": label, "n": sample_n}
        # Also show the instrument-wide entry
        all_entry = _norm_cache.get(instr, {}).get("__all__")
        tiers[instr]["__all__"] = {
            "tier": f"empirical:{instr}:*" if all_entry else "prior",
            "n": all_entry[list(all_entry.keys())[0]].get("n") if all_entry else None,
        }

    return {
        "computed_at":       computed_at,
        "norm_min_sample":   NORM_MIN_SAMPLE,
        "norm_refresh_days": NORM_REFRESH_DAYS,
        "tiers":             tiers,
    }


@app.post("/admin/norms/refresh")
async def admin_norms_refresh(_: dict = Depends(require_admin)):
    """Force an immediate recompute of the norm cache."""
    await _recompute_norms()
    return {"ok": True, "computed_at": datetime.fromtimestamp(_norm_cache_ts, tz=timezone.utc).isoformat()}


@app.get("/admin/users/export.csv")
async def admin_users_csv(_: dict = Depends(require_admin)):
    """Full users table as CSV download."""
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                p.id, p.email, p.first_name, p.last_name,
                p.premium, p.is_admin, p.created_at,
                COUNT(r.id) AS result_count
            FROM profiles p
            LEFT JOIN results r ON r.user_id = p.id
            GROUP BY p.id
            ORDER BY p.created_at DESC NULLS LAST
            """
        )

    def generate():
        yield "id,email,first_name,last_name,premium,is_admin,created_at,result_count\n"
        for r in rows:
            yield ",".join([
                _csv_val(r["id"]),
                _csv_val(r["email"]),
                _csv_val(r["first_name"]),
                _csv_val(r["last_name"]),
                _csv_val(r["premium"]),
                _csv_val(r["is_admin"]),
                _csv_val(r["created_at"].isoformat() if r["created_at"] else None),
                _csv_val(r["result_count"]),
            ]) + "\n"

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cercol_users.csv"},
    )


@app.get("/admin/results")
async def admin_results(
    offset:     int = Query(0, ge=0),
    limit:      int = Query(25, ge=1, le=100),
    instrument: str = Query(""),
    _: dict = Depends(require_admin),
):
    """Paginated results list. Optional filter by instrument."""
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                r.id, r.created_at, r.instrument, r.language, r.user_id,
                r.presence, r.bond, r.discipline, r.depth, r.vision,
                p.email AS user_email
            FROM results r
            LEFT JOIN profiles p ON p.id = r.user_id
            WHERE $3 = '' OR r.instrument = $3
            ORDER BY r.created_at DESC
            LIMIT $1 OFFSET $2
            """,
            limit + 1, offset, instrument,
        )
        total = await conn.fetchval(
            "SELECT COUNT(*) FROM results WHERE $1 = '' OR instrument = $1",
            instrument,
        )

    has_more = len(rows) > limit
    items = rows[:limit]

    def _to_item(r):
        role = None
        if r["presence"] is not None:
            raw  = {k: r[k] for k in ("presence", "bond", "discipline", "depth", "vision")}
            norm, _ = resolve_norm(r["instrument"], r["language"], _norm_cache)
            role = _compute_role(_scores_to_zscores(raw, norm, r["instrument"]))
        return {
            "id":         str(r["id"]),
            "created_at": r["created_at"].isoformat(),
            "instrument": r["instrument"],
            "language":   r["language"],
            "user_id":    str(r["user_id"]) if r["user_id"] else None,
            "user_email": r["user_email"],
            "role":       role,
        }

    return {
        "total":    total,
        "has_more": has_more,
        "items":    [_to_item(r) for r in items],
    }


@app.get("/admin/results/export.csv")
async def admin_results_csv(
    instrument: str = Query(""),
    _: dict = Depends(require_admin),
):
    """Full results table as CSV download, optionally filtered by instrument."""
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                r.id, r.created_at, r.instrument, r.language, r.user_id,
                r.presence, r.bond, r.discipline, r.depth, r.vision,
                p.email AS user_email
            FROM results r
            LEFT JOIN profiles p ON p.id = r.user_id
            WHERE $1 = '' OR r.instrument = $1
            ORDER BY r.created_at DESC
            """,
            instrument,
        )

    def _role(r):
        if r["presence"] is None:
            return ""
        raw  = {k: r[k] for k in ("presence", "bond", "discipline", "depth", "vision")}
        norm, _ = resolve_norm(r["instrument"], r["language"], _norm_cache)
        return _compute_role(_scores_to_zscores(raw, norm, r["instrument"]))

    def generate():
        yield "id,created_at,instrument,language,user_id,user_email,presence,bond,discipline,depth,vision,role\n"
        for r in rows:
            yield ",".join([
                _csv_val(r["id"]),
                _csv_val(r["created_at"].isoformat()),
                _csv_val(r["instrument"]),
                _csv_val(r["language"]),
                _csv_val(r["user_id"]),
                _csv_val(r["user_email"]),
                _csv_val(r["presence"]),
                _csv_val(r["bond"]),
                _csv_val(r["discipline"]),
                _csv_val(r["depth"]),
                _csv_val(r["vision"]),
                _csv_val(_role(r)),
            ]) + "\n"

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cercol_results.csv"},
    )


# ---------------------------------------------------------------------------
# Admin — user management
# ---------------------------------------------------------------------------

class AdminPatchUserBody(BaseModel):
    premium:  bool | None = None
    is_admin: bool | None = None

@app.patch("/admin/users/{user_id}")
async def admin_patch_user(
    user_id: str,
    body: AdminPatchUserBody,
    _: dict = Depends(require_admin),
):
    """Toggle premium or is_admin for a specific user."""
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clauses = ", ".join(f"{k} = ${i + 2}" for i, k in enumerate(updates))
    values = list(updates.values())

    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            f"UPDATE profiles SET {set_clauses} WHERE id = $1 "
            f"RETURNING id, email, premium, is_admin",
            user_id, *values,
        )
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id":       str(row["id"]),
        "email":    row["email"],
        "premium":  row["premium"],
        "is_admin": row["is_admin"],
    }


# ---------------------------------------------------------------------------
# Admin — activity time series
# ---------------------------------------------------------------------------

@app.get("/admin/activity")
async def admin_activity(
    days: int = Query(30, ge=7, le=90),
    _: dict = Depends(require_admin),
):
    """Daily registration + test counts for the last N days (for sparklines)."""
    async with _pool.acquire() as conn:
        reg_rows = await conn.fetch(
            """
            SELECT DATE(created_at) AS day, COUNT(*) AS count
            FROM profiles
            WHERE created_at >= NOW() - ($1 * INTERVAL '1 day')
            GROUP BY day ORDER BY day
            """,
            days,
        )
        result_rows = await conn.fetch(
            """
            SELECT DATE(created_at) AS day, COUNT(*) AS count
            FROM results
            WHERE created_at >= NOW() - ($1 * INTERVAL '1 day')
            GROUP BY day ORDER BY day
            """,
            days,
        )
    return {
        "days": days,
        "registrations": [{"day": str(r["day"]), "count": r["count"]} for r in reg_rows],
        "results":       [{"day": str(r["day"]), "count": r["count"]} for r in result_rows],
    }


# ---------------------------------------------------------------------------
# Maintenance — expired token cleanup
# ---------------------------------------------------------------------------
# Suggested cron (server): run daily via systemd timer or cron job:
#   curl -s -X POST https://api.cercol.team/admin/maintenance/purge-tokens \
#        -H "Authorization: Bearer <admin_jwt>"

@app.post("/admin/maintenance/purge-tokens")
@limiter.limit("5/hour")
async def admin_purge_expired_tokens(request: Request, _: dict = Depends(require_admin)):
    """
    Delete expired/used auth tokens to keep auth tables lean.
    Safe to run repeatedly; all operations are idempotent.
    Targets:
      - magic_tokens expired more than 1 day ago (or already used)
      - email_change_tokens expired more than 1 day ago (or already used)
      - refresh_tokens expired or revoked more than 7 days ago
      - oauth_states expired more than 1 day ago
    """
    def _count(status: str) -> int:
        # asyncpg execute() returns a status string like "DELETE 5" → parse the count.
        try:
            return int(status.split()[-1])
        except (IndexError, ValueError):
            return 0

    async with _pool.acquire() as conn:
        magic_status = await conn.execute(
            """
            DELETE FROM magic_tokens
            WHERE used_at IS NOT NULL
               OR expires_at < now() - INTERVAL '1 day'
            """
        )
        email_change_status = await conn.execute(
            """
            DELETE FROM email_change_tokens
            WHERE used_at IS NOT NULL
               OR expires_at < now() - INTERVAL '1 day'
            """
        )
        refresh_status = await conn.execute(
            """
            DELETE FROM refresh_tokens
            WHERE (revoked_at IS NOT NULL AND revoked_at < now() - INTERVAL '7 days')
               OR expires_at < now() - INTERVAL '7 days'
            """
        )
        oauth_status = await conn.execute(
            "DELETE FROM oauth_states WHERE expires_at < now() - INTERVAL '1 day'"
        )

    return {
        "magic_tokens_purged":        _count(magic_status),
        "email_change_tokens_purged": _count(email_change_status),
        "refresh_tokens_purged":      _count(refresh_status),
        "oauth_states_purged":        _count(oauth_status),
    }
