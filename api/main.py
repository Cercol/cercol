"""
Cèrcol API — FastAPI backend.

Phase 4.1: health check + CORS.
Phase 4.2: Supabase JWT auth via JWKS (ES256 / P-256 asymmetric).
Phase 4.5: Stripe Checkout + webhook → premium flag in Supabase.
Future routes: /results/*, /reports/*
"""

import json
import os
import urllib.request
from typing import Optional

import stripe
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt

app = FastAPI(
    title="Cèrcol API",
    version="0.3.0",
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
# Supabase REST helper (service_role — server-side only)
# ---------------------------------------------------------------------------

def _supabase_patch(path: str, body: dict) -> None:
    """PATCH a Supabase row using the service_role key."""
    url  = f"{_SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode()
    req  = urllib.request.Request(url, data=data, method="PATCH")
    req.add_header("apikey", _SUPABASE_SERVICE_KEY)
    req.add_header("Authorization", f"Bearer {_SUPABASE_SERVICE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=minimal")
    with urllib.request.urlopen(req, timeout=5):
        pass


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
    Creates a Stripe Checkout session for the FirstQuarter premium report.
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
                # Log but don't fail — Stripe will retry on non-2xx
                raise HTTPException(status_code=500, detail="Failed to update profile")

    return {"received": True}
