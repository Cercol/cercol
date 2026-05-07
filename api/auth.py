"""
Cèrcol custom auth module — replaces Supabase Auth (GoTrue).

Endpoints
---------
POST /auth/magic-link/request   — send one-time magic link via Resend
POST /auth/magic-link/verify    — verify token, return JWT + refresh token
POST /auth/password/signup      — create account with bcrypt password
POST /auth/password/signin      — verify bcrypt password, return tokens
POST /auth/refresh              — exchange refresh token for new access token
POST /auth/signout              — revoke refresh token
GET  /auth/google               — redirect to Google OAuth2 authorisation URL
GET  /auth/google/callback      — exchange code → user info → tokens → redirect

JWT format (HS256) mirrors the Supabase payload so the rest of main.py works
without changes:
  { "sub": "<uuid>", "email": "<email>", "aud": "authenticated",
    "iat": <unix>, "exp": <unix> }
"""

import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import urlencode

import asyncpg
import httpx
from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from slowapi.errors import RateLimitExceeded  # noqa: F401 — used indirectly via app handler

from emails import send_magic_link
from limiter import limiter

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

_JWT_SECRET    = os.environ.get("JWT_SECRET", "")
_JWT_ALGORITHM = "HS256"
_JWT_AUDIENCE  = "authenticated"
_ACCESS_TTL    = timedelta(hours=1)
_REFRESH_TTL   = timedelta(days=30)
_MAGIC_TTL     = timedelta(minutes=15)

_FRONTEND_URL         = os.environ.get("FRONTEND_URL", "https://cercol.team")
_BACKEND_URL          = os.environ.get("BACKEND_URL",  "https://api.cercol.team")
_GOOGLE_CLIENT_ID     = os.environ.get("GOOGLE_CLIENT_ID", "")
_GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
_GOOGLE_REDIRECT_URI  = f"{_BACKEND_URL}/auth/google/callback"

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------------------------
# Pool accessor (deferred import avoids circular reference with main.py)
# ---------------------------------------------------------------------------

def _pool() -> asyncpg.Pool:
    from main import _pool as p  # noqa: PLC0415
    return p


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def _issue_access_token(user_id: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub":   user_id,
        "email": email,
        "aud":   _JWT_AUDIENCE,
        "iat":   int(now.timestamp()),
        "exp":   int((now + _ACCESS_TTL).timestamp()),
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGORITHM)


async def _issue_refresh_token(conn: asyncpg.Connection, user_id: str) -> str:
    token      = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + _REFRESH_TTL
    await conn.execute(
        """
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        """,
        user_id, token, expires_at,
    )
    return token


def _token_response(user_id: str, email: str, refresh_token: str) -> dict:
    return {
        "access_token":  _issue_access_token(user_id, email),
        "refresh_token": refresh_token,
        "token_type":    "bearer",
    }


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

async def _find_or_create_user(
    conn: asyncpg.Connection,
    email: str,
    google_id: Optional[str] = None,
) -> dict:
    """
    Find an existing auth_user by email (or google_id), or create one.
    Always ensures a matching profiles row exists.
    Returns a dict with at least { id, email }.
    """
    email = email.lower()

    # Try to find by google_id first (if provided), then by email
    row = None
    if google_id:
        row = await conn.fetchrow(
            "SELECT id, email FROM auth_users WHERE google_id = $1", google_id
        )
        if row is None:
            # Existing user with this email but no google_id yet → link it
            row = await conn.fetchrow(
                "SELECT id, email FROM auth_users WHERE email = $1", email
            )
            if row:
                await conn.execute(
                    "UPDATE auth_users SET google_id = $1 WHERE id = $2",
                    google_id, row["id"],
                )
    else:
        row = await conn.fetchrow(
            "SELECT id, email FROM auth_users WHERE email = $1", email
        )

    if row is None:
        # New user
        new_id = str(uuid.uuid4())
        await conn.execute(
            """
            INSERT INTO auth_users (id, email, google_id)
            VALUES ($1, $2, $3)
            """,
            new_id, email, google_id,
        )
        user = {"id": new_id, "email": email}
    else:
        user = {"id": str(row["id"]), "email": row["email"]}

    # Ensure profiles row exists and email is current
    await conn.execute(
        """
        INSERT INTO profiles (id, email) VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
        """,
        user["id"], email,
    )
    # Link any pending group invitations sent before registration
    await conn.execute(
        """
        UPDATE group_members SET user_id = $1
        WHERE invited_email = $2 AND user_id IS NULL AND status = 'pending'
        """,
        user["id"], email,
    )
    # Update last_sign_in_at
    await conn.execute(
        "UPDATE auth_users SET last_sign_in_at = now() WHERE id = $1",
        user["id"],
    )

    return user


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Pydantic models ──────────────────────────────────────────────────────────

class MagicLinkRequestBody(BaseModel):
    email: str


class MagicLinkVerifyBody(BaseModel):
    token: str


class PasswordSignupBody(BaseModel):
    email:    str
    password: str


class PasswordSigninBody(BaseModel):
    email:    str
    password: str


class RefreshBody(BaseModel):
    refresh_token: str


class SignoutBody(BaseModel):
    refresh_token: str


# ── Magic link ───────────────────────────────────────────────────────────────

@router.post("/magic-link/request", status_code=202)
@limiter.limit("3/minute")
async def magic_link_request(request: Request, body: MagicLinkRequestBody):
    """
    Generate a one-time magic link and send it via Resend.
    Always returns 202 (no enumeration of registered emails).
    """
    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    token      = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + _MAGIC_TTL

    user_lang = "en"
    async with _pool().acquire() as conn:
        await conn.execute(
            """
            INSERT INTO magic_tokens (email, token, expires_at)
            VALUES ($1, $2, $3)
            """,
            email, token, expires_at,
        )
        # Look up the user's preferred language (may not have a profile yet)
        lang_row = await conn.fetchrow(
            "SELECT native_language FROM profiles WHERE email = $1", email
        )
        if lang_row:
            user_lang = lang_row["native_language"] or "en"

    link = f"{_FRONTEND_URL}/auth/callback?type=magic&token={token}"

    # send_magic_link uses asyncio.to_thread internally — no event-loop blocking.
    try:
        await send_magic_link(email, link, lang=user_lang)
    except Exception as exc:
        # Log but do not leak error details to the client
        print(f"[auth] magic link email failed for {email}: {exc}")

    return {"detail": "Magic link sent"}


@router.post("/magic-link/verify")
@limiter.limit("10/minute")
async def magic_link_verify(request: Request, body: MagicLinkVerifyBody):
    """
    Verify a magic link token.  On success: mark used, find/create user, return tokens.
    """
    token = body.token.strip()
    now   = datetime.now(timezone.utc)

    async with _pool().acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, email, expires_at, used_at
            FROM magic_tokens
            WHERE token = $1
            """,
            token,
        )

        if row is None:
            raise HTTPException(status_code=401, detail="Invalid or expired magic link")
        if row["used_at"] is not None:
            raise HTTPException(status_code=401, detail="Magic link already used")
        if row["expires_at"] < now:
            raise HTTPException(status_code=401, detail="Magic link has expired")

        # Mark token consumed
        await conn.execute(
            "UPDATE magic_tokens SET used_at = $1 WHERE id = $2",
            now, row["id"],
        )

        user  = await _find_or_create_user(conn, row["email"])
        rt    = await _issue_refresh_token(conn, user["id"])

    return _token_response(user["id"], user["email"], rt)


# ── Password auth ────────────────────────────────────────────────────────────

@router.post("/password/signup", status_code=201)
@limiter.limit("5/minute")
async def password_signup(request: Request, body: PasswordSignupBody):
    """Create a new account with email + password."""
    email    = body.email.strip().lower()
    password = body.password

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    hashed = _pwd.hash(password)

    async with _pool().acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM auth_users WHERE email = $1", email
        )
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        new_id = str(uuid.uuid4())
        await conn.execute(
            """
            INSERT INTO auth_users (id, email, password_hash)
            VALUES ($1, $2, $3)
            """,
            new_id, email, hashed,
        )
        # Create profile row
        await conn.execute(
            "INSERT INTO profiles (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
            new_id, email,
        )
        await conn.execute(
            "UPDATE auth_users SET last_sign_in_at = now() WHERE id = $1", new_id
        )
        rt = await _issue_refresh_token(conn, new_id)

    return _token_response(new_id, email, rt)


@router.post("/password/signin")
@limiter.limit("5/minute")
async def password_signin(request: Request, body: PasswordSigninBody):
    """Sign in with email + password."""
    email    = body.email.strip().lower()
    password = body.password

    async with _pool().acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, email, password_hash FROM auth_users WHERE email = $1", email
        )

        if row is None or row["password_hash"] is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not _pwd.verify(password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_id = str(row["id"])
        await conn.execute(
            "UPDATE auth_users SET last_sign_in_at = now() WHERE id = $1", user_id
        )
        rt = await _issue_refresh_token(conn, user_id)

    return _token_response(user_id, email, rt)


# ── Token refresh + signout ───────────────────────────────────────────────────

@router.post("/refresh")
@limiter.limit("30/minute")
async def refresh_token(request: Request, body: RefreshBody):
    """
    Exchange a valid refresh token for a new access token.
    The refresh token itself is rotated (old revoked, new issued).
    """
    now = datetime.now(timezone.utc)

    async with _pool().acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at,
                   au.email
            FROM refresh_tokens rt
            JOIN auth_users au ON au.id = rt.user_id
            WHERE rt.token = $1
            """,
            body.refresh_token,
        )

        if row is None or row["revoked_at"] is not None or row["expires_at"] < now:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

        # Revoke old token
        await conn.execute(
            "UPDATE refresh_tokens SET revoked_at = $1 WHERE id = $2",
            now, row["id"],
        )

        user_id = str(row["user_id"])
        email   = row["email"]
        rt      = await _issue_refresh_token(conn, user_id)

    return _token_response(user_id, email, rt)


@router.post("/signout", status_code=204)
@limiter.limit("30/minute")
async def signout(request: Request, body: SignoutBody):
    """Revoke a refresh token (sign out)."""
    async with _pool().acquire() as conn:
        await conn.execute(
            "UPDATE refresh_tokens SET revoked_at = now() WHERE token = $1",
            body.refresh_token,
        )
    return None


# ── Google OAuth2 ─────────────────────────────────────────────────────────────

@router.get("/google")
@limiter.limit("10/minute")
async def google_auth(request: Request):
    """Redirect the user to Google's OAuth2 authorisation endpoint."""
    if not _GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    state = secrets.token_urlsafe(24)

    # Store state for CSRF validation
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    async with _pool().acquire() as conn:
        await conn.execute(
            "INSERT INTO oauth_states (state, expires_at) VALUES ($1, $2)",
            state, expires_at,
        )
        # Clean up expired states opportunistically
        await conn.execute(
            "DELETE FROM oauth_states WHERE expires_at < now()"
        )

    params = urlencode({
        "client_id":     _GOOGLE_CLIENT_ID,
        "redirect_uri":  _GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope":         "openid email profile",
        "state":         state,
        "access_type":   "online",
        "prompt":        "select_account",
    })
    return RedirectResponse(
        url=f"https://accounts.google.com/o/oauth2/v2/auth?{params}",
        status_code=302,
    )


@router.get("/google/callback")
@limiter.limit("10/minute")
async def google_callback(
    request: Request,
    code:  str = Query(...),
    state: str = Query(...),
    error: Optional[str] = Query(None),
):
    """
    Google redirects here after the user consents.
    Exchange the authorization code for user info, find/create the user,
    then redirect to the frontend with access_token + refresh_token in the URL.
    """
    if error:
        return RedirectResponse(
            url=f"{_FRONTEND_URL}/auth?error=google_denied",
            status_code=302,
        )

    # Validate CSRF state
    async with _pool().acquire() as conn:
        state_row = await conn.fetchrow(
            "SELECT expires_at FROM oauth_states WHERE state = $1", state
        )
        if state_row is None or state_row["expires_at"] < datetime.now(timezone.utc):
            return RedirectResponse(
                url=f"{_FRONTEND_URL}/auth?error=invalid_state",
                status_code=302,
            )
        await conn.execute("DELETE FROM oauth_states WHERE state = $1", state)

        # Exchange code for tokens
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                token_resp = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "code":          code,
                        "client_id":     _GOOGLE_CLIENT_ID,
                        "client_secret": _GOOGLE_CLIENT_SECRET,
                        "redirect_uri":  _GOOGLE_REDIRECT_URI,
                        "grant_type":    "authorization_code",
                    },
                )
                token_resp.raise_for_status()
                token_data = token_resp.json()

                # Fetch user info with the access token
                userinfo_resp = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {token_data['access_token']}"},
                )
                userinfo_resp.raise_for_status()
                userinfo = userinfo_resp.json()
        except httpx.HTTPError:
            return RedirectResponse(
                url=f"{_FRONTEND_URL}/auth?error=google_exchange_failed",
                status_code=302,
            )

        google_id = userinfo.get("id")
        email     = userinfo.get("email", "").lower()

        if not email or not google_id:
            return RedirectResponse(
                url=f"{_FRONTEND_URL}/auth?error=missing_google_email",
                status_code=302,
            )

        user = await _find_or_create_user(conn, email, google_id=google_id)
        rt   = await _issue_refresh_token(conn, user["id"])

    access_token = _issue_access_token(user["id"], user["email"])

    params = urlencode({
        "access_token":  access_token,
        "refresh_token": rt,
    })
    return RedirectResponse(
        url=f"{_FRONTEND_URL}/auth/callback?{params}",
        status_code=302,
    )
