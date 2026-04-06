"""
Cèrcol API — FastAPI backend.

Phase 4.1: health check + CORS.
Phase 4.2: Supabase JWT auth via JWKS (ES256 / P-256 asymmetric).
Future routes: /results/*, /reports/*
"""

import json
import os
import urllib.request
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt

app = FastAPI(
    title="Cèrcol API",
    version="0.2.0",
    docs_url="/docs",
    redoc_url=None,
)

ALLOWED_ORIGINS = [
    "https://cercol.team",
    "http://localhost:5173",   # Vite dev server
    "http://localhost:4173",   # Vite preview
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Auth — JWKS-based verification (Supabase ECC P-256 / ES256)
# ---------------------------------------------------------------------------

_SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
_JWKS_URL     = f"{_SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_AUDIENCE     = "authenticated"

# In-process key cache keyed by kid.  Avoids a JWKS fetch on every request.
_key_cache: dict = {}


def _fetch_jwks() -> list[dict]:
    with urllib.request.urlopen(_JWKS_URL, timeout=5) as resp:
        return json.loads(resp.read())["keys"]


def _get_key(kid: str, alg: str):
    """Return a jose key for the given kid, fetching JWKS if necessary."""
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
        header = jwt.get_unverified_header(token)
        kid    = header.get("kid", "")
        alg    = header.get("alg", "ES256")
        key    = _get_key(kid, alg)
        payload = jwt.decode(token, key, algorithms=[alg], audience=_AUDIENCE)
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "version": app.version}


@app.get("/me")
def me(user: dict = Depends(get_current_user)):
    """Returns the authenticated user's id and email. Requires a valid Supabase JWT."""
    return {
        "user_id": user["sub"],
        "email":   user.get("email"),
    }
