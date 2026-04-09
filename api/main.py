"""
Cèrcol API — FastAPI backend.

Phase 4.1: health check + CORS.
Phase 4.2: Supabase JWT auth via JWKS (ES256 / P-256 asymmetric).
Phase 4.5: Stripe Checkout + webhook → premium flag in Supabase.
Phase 7:   Witness Cèrcol session management.
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

app = FastAPI(
    title="Cèrcol API",
    version="0.4.0",
    docs_url="/docs",
    redoc_url=None,
)

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
def create_witness_sessions(
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
def complete_witness_session(token: str, body: CompleteSessionBody):
    """
    Public endpoint — no auth required.
    Receives domain scores from the witness, inserts a witness_response row,
    and marks the session as completed.
    Called once per witness at the end of the instrument.
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

    # Mark session as completed
    now = datetime.now(timezone.utc).isoformat()
    try:
        _supabase_patch(
            f"witness_sessions?id=eq.{session_id}",
            {"completed_at": now},
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to mark session complete")

    return {"ok": True}


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
