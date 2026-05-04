"""
Shared rate-limiter instance.

Extracted into its own module so both main.py and auth.py can import it
without creating a circular dependency.
"""

from fastapi import Request
from slowapi import Limiter


def _get_client_ip(request: Request) -> str:
    """Extract real client IP, respecting Caddy's X-Forwarded-For header."""
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=_get_client_ip)
