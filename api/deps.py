"""api/deps.py — shared FastAPI dependencies (Phase 17.8).

Single home for the admin gate that was previously duplicated verbatim in
main.py, blog.py and seo.py. This module imports nothing from main/blog/seo,
so all three can import it without the circular-import problem that forced the
duplication in the first place (main.py imports the blog and seo routers at
module load, so neither router could import main.py at module top).

The pool is reached via ``request.app.state.pool`` (set to the same object as
main.py's module-global ``_pool`` during startup), which keeps this module free
of any import from main.py.

Behaviour is the union of the three former copies: it keeps seo.py's stricter
"missing sub -> 401" check so no endpoint is weakened by the dedup.
"""

import os

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

_JWT_SECRET    = os.environ.get("JWT_SECRET", "")
_JWT_ALGORITHM = "HS256"
_JWT_AUDIENCE  = "authenticated"

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """Validate the bearer JWT and return its payload, or raise 401."""
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


async def require_admin(
    request: Request,
    user: dict = Depends(get_current_user),
) -> dict:
    """Dependency — raises 403 unless the authenticated user has is_admin = true.

    Raises 401 if the token carries no ``sub`` (seo.py's stricter check, kept
    here so the dedup does not weaken any endpoint).
    """
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    async with request.app.state.pool.acquire() as conn:
        row = await conn.fetchrow("SELECT is_admin FROM profiles WHERE id = $1", user_id)
    if not row or not row["is_admin"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


async def require_premium(
    request: Request,
    user: dict = Depends(get_current_user),
) -> dict:
    """Dependency — raises 403 unless the account has premium = true OR
    is_beta = true.

    Gates the server-dependent Full Moon value surfaces (ADR 0018). is_beta is
    accepted alongside premium so the "first 500 free Full Moon" promo accounts
    keep access while the promotion is live. Mirrors require_admin: 401 when the
    token carries no ``sub``, 403 when the account is not entitled.
    """
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    async with request.app.state.pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT premium, is_beta FROM profiles WHERE id = $1", user_id
        )
    if not row or not (row["premium"] or row["is_beta"]):
        raise HTTPException(status_code=403, detail="Forbidden")
    return user
