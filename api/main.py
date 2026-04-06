"""
Cèrcol API — FastAPI backend.

Phase 4.1: health check + CORS.
Phase 4.2: Supabase JWT auth dependency + /me endpoint.
Future routes: /results/*, /reports/*
"""

import os
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

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
# Auth
# ---------------------------------------------------------------------------

SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
_ALGORITHM = "HS256"
_AUDIENCE  = "authenticated"

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(
            credentials.credentials,
            SUPABASE_JWT_SECRET,
            algorithms=[_ALGORITHM],
            audience=_AUDIENCE,
        )
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
