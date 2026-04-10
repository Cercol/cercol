"""
Cèrcol API — FastAPI backend.

Phase 4.1: health check + CORS.
Phase 4.2: Supabase JWT auth via JWKS (ES256 / P-256 asymmetric).
Phase 4.5: Stripe Checkout + webhook → premium flag in Supabase.
Phase 7:   Witness Cèrcol session management.
Phase 10.19+: slowapi rate limiting on public/sensitive endpoints.
"""

import json
import os
import secrets
import urllib.request
from datetime import datetime, timezone
from typing import List, Optional

import stripe
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded


def _get_client_ip(request: Request) -> str:
    """
    Extract the real client IP for rate limiting.
    Railway (and most proxies) forward the original IP in X-Forwarded-For.
    Fall back to request.client.host if the header is absent.
    """
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=_get_client_ip)

app = FastAPI(
    title="Cèrcol API",
    version="0.4.0",
    docs_url="/docs",
    redoc_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = [
    "https://cercol.team",
    "http://cercol.team",
    "http://localhost:5173",   # Vite dev server
    "https://localhost:5173",
    "http://localhost:4173",   # Vite preview
    "https://localhost:4173",
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

_SUPABASE_URL             = os.environ.get("SUPABASE_URL", "").rstrip("/")
_SUPABASE_SERVICE_KEY     = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
_FRONTEND_URL             = os.environ.get("FRONTEND_URL", "https://cercol.team")
_STRIPE_PRICE_ID          = os.environ.get("STRIPE_PRICE_ID", "")
_STRIPE_WEBHOOK_SECRET    = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")

# ---------------------------------------------------------------------------
# Auth — JWKS-based verification (Supabase ECC P-256 / ES256)
# ---------------------------------------------------------------------------

_JWKS_URL  = f"{_SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_AUDIENCE  = "authenticated"
_key_cache: dict = {}


def _fetch_jwks() -> list[dict]:
    with urllib.request.urlopen(_JWKS_URL, timeout=5) as resp:
        return json.loads(resp.read())["keys"]


def _get_key(kid: str, alg: str):
    if kid not in _key_cache:
        for k in _fetch_jwks():
            _key_cache[k["kid"]] = jwk.construct(k, algorithm=k.get("alg", alg))
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
    """Returns the authenticated user payload, or None if unauthenticated.
    Used by endpoints that support both anonymous and authenticated access."""
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
# Supabase REST helpers (service_role — server-side only)
# ---------------------------------------------------------------------------

def _supabase_headers() -> dict:
    return {
        "apikey": _SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {_SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _supabase_get(table: str, query: str) -> list:
    """SELECT rows from Supabase using service_role key."""
    url = f"{_SUPABASE_URL}/rest/v1/{table}?{query}"
    req = urllib.request.Request(url)
    for k, v in _supabase_headers().items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read())


def _supabase_post(table: str, body: dict) -> dict:
    """INSERT a row and return the inserted representation."""
    url  = f"{_SUPABASE_URL}/rest/v1/{table}"
    data = json.dumps(body).encode()
    req  = urllib.request.Request(url, data=data, method="POST")
    for k, v in _supabase_headers().items():
        req.add_header(k, v)
    req.add_header("Prefer", "return=representation")
    with urllib.request.urlopen(req, timeout=5) as resp:
        rows = json.loads(resp.read())
        return rows[0] if rows else {}


def _supabase_patch(path: str, body: dict) -> None:
    """PATCH rows matching the filter path."""
    url  = f"{_SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode()
    req  = urllib.request.Request(url, data=data, method="PATCH")
    for k, v in _supabase_headers().items():
        req.add_header(k, v)
    req.add_header("Prefer", "return=minimal")
    with urllib.request.urlopen(req, timeout=5):
        pass


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


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "version": app.version}


@app.get("/me")
def me(user: dict = Depends(get_current_user)):
    """Returns the authenticated user's id and email."""
    return {
        "user_id": user["sub"],
        "email":   user.get("email"),
    }


@app.post("/checkout")
def create_checkout(
    user: dict = Depends(get_current_user),
):
    """
    Creates a Stripe Checkout session for Full Moon Cèrcol.
    Returns { url } — the hosted Checkout page.
    """
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
    """
    Receives Stripe events. Verifies signature, then on
    checkout.session.completed marks the user's profile as premium.
    """
    payload   = await request.body()
    sig       = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig, _STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        if user_id:
            try:
                _supabase_patch(
                    f"profiles?id=eq.{user_id}",
                    {"premium": True},
                )
            except Exception:
                raise HTTPException(status_code=500, detail="Failed to update profile")

    return {"received": True}


# ---------------------------------------------------------------------------
# Witness Cèrcol — session management
# ---------------------------------------------------------------------------

@app.post("/witness/sessions")
@limiter.limit("20/minute")
def create_witness_sessions(
    request: Request,
    body: CreateSessionsBody,
    user: dict = Depends(get_current_user),
):
    """
    Creates up to 12 witness sessions for the authenticated user.
    Returns an array of { token, name, link } objects.
    The token is a 32-character hex string; the link is the public witness URL.
    """
    subject_id = user["sub"]

    # Resolve subject display name from profile (falls back to email, then id)
    subject_display = user.get("email") or subject_id
    try:
        profiles = _supabase_get("profiles", f"id=eq.{subject_id}&select=first_name,last_name")
        if profiles:
            p = profiles[0]
            full = f"{p.get('first_name') or ''} {p.get('last_name') or ''}".strip()
            if full:
                subject_display = full
    except Exception:
        pass  # Fall back to email/id if profile lookup fails

    created = []

    for witness in body.witnesses[:12]:
        if not witness.name.strip():
            continue

        token = secrets.token_hex(16)  # 32-char cryptographically random hex

        try:
            _supabase_post("witness_sessions", {
                "subject_id":      subject_id,
                "subject_display": subject_display,
                "token":           token,
                "witness_name":    witness.name.strip(),
                "witness_email":   witness.email.strip() if witness.email else None,
            })
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to create session")

        created.append({
            "token": token,
            "name":  witness.name.strip(),
            "link":  f"{_FRONTEND_URL}/witness/{token}",
        })

    return created


@app.get("/witness/session/{token}")
def get_witness_session(token: str):
    """
    Public endpoint — no auth required.
    Returns { witness_name, completed } for the given token.
    Used by WitnessPage to load session metadata before starting.
    """
    rows = _supabase_get("witness_sessions", f"token=eq.{token}&select=witness_name,subject_display,completed_at")
    if not rows:
        raise HTTPException(status_code=404, detail="Session not found")

    session = rows[0]
    return {
        "witness_name":    session["witness_name"],
        "subject_display": session.get("subject_display") or "",
        "completed":       session["completed_at"] is not None,
    }


@app.post("/witness/session/{token}/complete")
@limiter.limit("10/minute")
def complete_witness_session(
    request: Request,
    token: str,
    body: CompleteSessionBody,
    user: Optional[dict] = Depends(get_optional_user),
):
    """
    Supports both anonymous and authenticated witnesses.
    If the request carries a valid Bearer token, the witness's user_id is stored
    in witness_user_id — enabling team features in Last Quarter.
    Anonymous witnesses (no token) are unaffected; behaviour is identical.
    """
    rows = _supabase_get("witness_sessions", f"token=eq.{token}&select=id,completed_at")
    if not rows:
        raise HTTPException(status_code=404, detail="Session not found")

    session = rows[0]
    if session["completed_at"] is not None:
        raise HTTPException(status_code=409, detail="Session already completed")

    session_id = session["id"]

    # Insert domain scores
    try:
        _supabase_post("witness_responses", {
            "session_id":    session_id,
            "domain_scores": body.scores.model_dump(),
        })
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save response")

    # Mark session as completed; include witness_user_id if authenticated
    now = datetime.now(timezone.utc).isoformat()
    patch_data: dict = {"completed_at": now}
    if user:
        patch_data["witness_user_id"] = user["sub"]
    try:
        _supabase_patch(f"witness_sessions?id=eq.{session_id}", patch_data)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to mark session complete")

    return {"ok": True}


@app.get("/witness/my-contributions")
def get_my_contributions(user: dict = Depends(get_current_user)):
    """
    Returns the witness sessions this user has completed as a witness
    (i.e. where witness_user_id = current user).
    Returns subject_display and completed_at only — no scores.
    """
    user_id = user["sub"]
    sessions = _supabase_get(
        "witness_sessions",
        f"witness_user_id=eq.{user_id}&order=completed_at.desc&select=subject_display,completed_at",
    )
    return sessions


# ---------------------------------------------------------------------------
# Groups — team system (Phase 12.2)
# ---------------------------------------------------------------------------

# Normative priors for z-score computation (from SCIENCE.md)
_NORM = {
    "presence":   {"mean": 3.3, "sd": 0.72},
    "bond":       {"mean": 3.9, "sd": 0.58},
    "discipline": {"mean": 3.7, "sd": 0.62},
    "depth":      {"mean": 2.8, "sd": 0.72},
    "vision":     {"mean": 3.7, "sd": 0.60},
}

# Theoretical role centroids in 5D OCEAN space (presence, bond, vision, discipline, depth)
# Each centroid is (presence, bond, vision, discipline, depth) as z-scores.
# Source: AB5C / Bell 2007 — same as FullMoonReportPage scoring.
_ROLE_CENTROIDS = {
    "R01": ( 1.0,  1.0,  0.0,  0.0,  0.0),
    "R02": ( 1.0, -1.0,  0.0,  0.0,  0.0),
    "R03": (-1.0,  1.0,  0.0,  0.0,  0.0),
    "R04": (-1.0, -1.0,  0.0,  0.0,  0.0),
    "R05": ( 1.0,  0.0,  1.0,  0.0,  0.0),
    "R06": ( 1.0,  0.0, -1.0,  0.0,  0.0),
    "R07": (-1.0,  0.0,  1.0,  0.0,  0.0),
    "R08": (-1.0,  0.0, -1.0,  0.0,  0.0),
    "R09": ( 0.0,  1.0,  1.0,  0.0,  0.0),
    "R10": ( 0.0,  1.0, -1.0,  0.0,  0.0),
    "R11": ( 0.0, -1.0,  1.0,  0.0,  0.0),
    "R12": ( 0.0, -1.0, -1.0,  0.0,  0.0),
}


def _compute_role(z: dict) -> str:
    """Return the nearest role label for a z-score dict."""
    import math
    best_role = "R01"
    best_dist = float("inf")
    vec = (z["presence"], z["bond"], z["vision"], z["discipline"], z["depth"])
    for role, centroid in _ROLE_CENTROIDS.items():
        dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(vec, centroid)))
        if dist < best_dist:
            best_dist = dist
            best_role = role
    return best_role


def _scores_to_zscores(scores: dict) -> dict:
    """Convert raw 1-5 domain scores to z-scores using normative priors."""
    return {
        domain: (scores[domain] - _NORM[domain]["mean"]) / _NORM[domain]["sd"]
        for domain in _NORM
        if domain in scores
    }


@app.post("/groups")
def create_group(
    body: CreateGroupBody,
    user: dict = Depends(get_current_user),
):
    """
    Creates a group and optionally invites members by email.
    The creator is added as an active member automatically.
    Invited emails are matched against auth.users; if found the user_id is stored;
    otherwise only invited_email is stored (for future registration matching).
    """
    user_id = user["sub"]
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Group name is required")

    # Create the group row
    try:
        group = _supabase_post("groups", {"name": name, "created_by": user_id})
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create group")

    group_id = group["id"]

    # Add creator as active member
    try:
        _supabase_post("group_members", {
            "group_id":  group_id,
            "user_id":   user_id,
            "status":    "active",
            "joined_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to add creator as member")

    # Invite each email
    errors = []
    for raw_email in body.emails:
        email = raw_email.strip().lower()
        if not email:
            continue
        if email == (user.get("email") or "").lower():
            continue  # Skip self-invite

        # Try to resolve email to a user_id via auth.users (service_role only)
        invited_user_id = None
        try:
            rows = _supabase_get("auth.users", f"email=eq.{email}&select=id")
            # auth.users is not accessible via the REST /rest/v1/ path;
            # use the admin endpoint instead.
            pass
        except Exception:
            pass

        # Query via profiles table which mirrors auth.users emails via triggers
        try:
            profile_rows = _supabase_get("profiles", f"email=eq.{email}&select=id")
            if profile_rows:
                invited_user_id = profile_rows[0]["id"]
        except Exception:
            pass

        member_row: dict = {
            "group_id":      group_id,
            "status":        "pending",
            "invited_email": email,
            "invited_at":    datetime.now(timezone.utc).isoformat(),
        }
        if invited_user_id:
            member_row["user_id"] = invited_user_id

        try:
            _supabase_post("group_members", member_row)
        except Exception:
            errors.append(email)

    return {"id": group_id, "name": name, "errors": errors}


@app.get("/groups/mine")
def get_my_groups(user: dict = Depends(get_current_user)):
    """
    Returns all groups the authenticated user is an active member of,
    with basic stats: member count (active) and completion count.
    """
    user_id = user["sub"]

    # Find all groups where this user has an active membership
    memberships = _supabase_get(
        "group_members",
        f"user_id=eq.{user_id}&status=eq.active&select=group_id",
    )
    group_ids = [m["group_id"] for m in memberships]

    if not group_ids:
        return []

    result = []
    for gid in group_ids:
        # Get group metadata
        groups = _supabase_get("groups", f"id=eq.{gid}&select=id,name,created_by,created_at")
        if not groups:
            continue
        g = groups[0]

        # Count active members
        active_members = _supabase_get(
            "group_members",
            f"group_id=eq.{gid}&status=eq.active&select=user_id",
        )
        member_count = len(active_members)

        # Count how many active members have completed Full Moon (have a result)
        completed = 0
        for m in active_members:
            if not m["user_id"]:
                continue
            fm_results = _supabase_get(
                "results",
                f"user_id=eq.{m['user_id']}&instrument=eq.fullMoon&select=presence&limit=1",
            )
            if fm_results:
                completed += 1

        result.append({
            "id":           g["id"],
            "name":         g["name"],
            "created_by":   g["created_by"],
            "created_at":   g["created_at"],
            "member_count": member_count,
            "completed":    completed,
            "is_creator":   g["created_by"] == user_id,
        })

    return result


@app.get("/groups/pending")
def get_pending_invitations(user: dict = Depends(get_current_user)):
    """
    Returns all pending group invitations for the authenticated user.
    """
    user_id = user["sub"]

    pending = _supabase_get(
        "group_members",
        f"user_id=eq.{user_id}&status=eq.pending&select=group_id,invited_at",
    )

    result = []
    for p in pending:
        groups = _supabase_get("groups", f"id=eq.{p['group_id']}&select=id,name,created_by")
        if not groups:
            continue
        g = groups[0]
        result.append({
            "group_id":   g["id"],
            "group_name": g["name"],
            "invited_at": p["invited_at"],
        })

    return result


@app.post("/groups/{group_id}/accept")
def accept_group_invitation(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    """Accept a pending group invitation."""
    user_id = user["sub"]

    rows = _supabase_get(
        "group_members",
        f"group_id=eq.{group_id}&user_id=eq.{user_id}&status=eq.pending&select=group_id",
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Pending invitation not found")

    try:
        _supabase_patch(
            f"group_members?group_id=eq.{group_id}&user_id=eq.{user_id}&status=eq.pending",
            {"status": "active", "joined_at": datetime.now(timezone.utc).isoformat()},
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to accept invitation")

    return {"ok": True}


@app.post("/groups/{group_id}/decline")
def decline_group_invitation(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    """Decline (delete) a pending group invitation."""
    user_id = user["sub"]

    rows = _supabase_get(
        "group_members",
        f"group_id=eq.{group_id}&user_id=eq.{user_id}&status=eq.pending&select=group_id",
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Pending invitation not found")

    try:
        url = f"{_SUPABASE_URL}/rest/v1/group_members?group_id=eq.{group_id}&user_id=eq.{user_id}&status=eq.pending"
        data = b""
        req = urllib.request.Request(url, data=data, method="DELETE")
        for k, v in _supabase_headers().items():
            req.add_header(k, v)
        with urllib.request.urlopen(req, timeout=5):
            pass
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to decline invitation")

    return {"ok": True}


@app.get("/groups/{group_id}/report-data")
def get_group_report_data(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Returns report data for all active members of a group.
    Requires the requesting user to be an active member.
    For each member with a Full Moon result: profile display name, role (R01–R12),
    and OCEAN z-scores.
    """
    user_id = user["sub"]

    # Verify requester is an active member
    membership = _supabase_get(
        "group_members",
        f"group_id=eq.{group_id}&user_id=eq.{user_id}&status=eq.active&select=group_id",
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    # Get group name
    groups = _supabase_get("groups", f"id=eq.{group_id}&select=id,name")
    if not groups:
        raise HTTPException(status_code=404, detail="Group not found")
    group_name = groups[0]["name"]

    # Get all active members
    active_members = _supabase_get(
        "group_members",
        f"group_id=eq.{group_id}&status=eq.active&select=user_id",
    )

    members_data = []
    for m in active_members:
        mid = m["user_id"]
        if not mid:
            continue

        # Get display name from profile
        display_name = None
        try:
            profiles = _supabase_get("profiles", f"id=eq.{mid}&select=first_name,last_name")
            if profiles:
                p = profiles[0]
                full = f"{p.get('first_name') or ''} {p.get('last_name') or ''}".strip()
                if full:
                    display_name = full
        except Exception:
            pass

        # Get Full Moon result (latest)
        results = _supabase_get(
            "results",
            f"user_id=eq.{mid}&instrument=eq.fullMoon&order=created_at.desc&select=presence,bond,vision,discipline,depth&limit=1",
        )
        if not results:
            members_data.append({
                "user_id":      mid,
                "display_name": display_name,
                "role":         None,
                "zscores":      None,
                "completed":    False,
                "is_self":      mid == user_id,
            })
            continue

        r = results[0]
        raw_scores = {
            "presence":   r["presence"],
            "bond":       r["bond"],
            "vision":     r["vision"],
            "discipline": r["discipline"],
            "depth":      r["depth"],
        }
        zscores = _scores_to_zscores(raw_scores)
        role = _compute_role(zscores)

        members_data.append({
            "user_id":      mid,
            "display_name": display_name,
            "role":         role,
            "zscores":      zscores,
            "completed":    True,
            "is_self":      mid == user_id,
        })

    return {
        "group_id":   group_id,
        "group_name": group_name,
        "members":    members_data,
    }


@app.get("/witness/my-sessions")
def get_my_sessions(user: dict = Depends(get_current_user)):
    """
    Returns all witness sessions for the authenticated user,
    including domain_scores for completed sessions.
    """
    subject_id = user["sub"]

    sessions = _supabase_get(
        "witness_sessions",
        f"subject_id=eq.{subject_id}&order=created_at.desc&select=id,token,witness_name,witness_email,completed_at,created_at",
    )

    # For completed sessions, fetch scores
    result = []
    for s in sessions:
        entry = {
            "id":            s["id"],
            "token":         s["token"],
            "witness_name":  s["witness_name"],
            "witness_email": s.get("witness_email"),
            "completed_at":  s["completed_at"],
            "created_at":    s["created_at"],
            "scores":        None,
            "link":          f"{_FRONTEND_URL}/witness/{s['token']}",
        }
        if s["completed_at"]:
            responses = _supabase_get(
                "witness_responses",
                f"session_id=eq.{s['id']}&select=domain_scores&limit=1",
            )
            if responses:
                entry["scores"] = responses[0]["domain_scores"]
        result.append(entry)

    return result
