"""
Email change (migration 039): /auth/email/change-request + /auth/email/change-confirm.

No database in CI, so the endpoints run against a fake asyncpg pool (mirrors
test_premium_gate.py) and we assert on the SQL the connection receives.

What matters here is that the address cannot move without two proofs:
  - the requester re-authenticates (password accounts must re-enter it), and
  - the *new* address opens a one-time, TTL'd link.
Plus: the old address is always told, and confirming kills every prior session.
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("JWT_SECRET", "x" * 48)
os.environ.setdefault("DATABASE_URL", "postgresql://example.invalid/email_change_test")

from fastapi.testclient import TestClient  # noqa: E402
from jose import jwt  # noqa: E402

import auth as auth_module  # noqa: E402
import emails as emails_module  # noqa: E402
import main as main_module  # noqa: E402

# Six of these tests hit a 3/minute endpoint from the same fake client IP.
main_module.limiter.enabled = False

_USER_ID = "00000000-0000-0000-0000-0000000000aa"
_OLD     = "old@example.com"
_NEW     = "new@example.com"
_HASH    = auth_module._pwd_hash("correct-horse")


# ── Fakes ────────────────────────────────────────────────────────────────────

class _Tx:
    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False


class FakeConn:
    def __init__(self, *, password_hash=_HASH, taken=False, token_row=None):
        self.password_hash = password_hash
        self.taken         = taken
        self.token_row     = token_row
        self.executed: list = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    def transaction(self):
        return _Tx()

    async def execute(self, query, *args):
        self.executed.append((query, args))
        return "UPDATE 1"

    async def fetchrow(self, query, *args):
        if "FROM auth_users WHERE id" in query:
            return {"email": _OLD, "password_hash": self.password_hash}
        if "FROM email_change_tokens" in query:
            return self.token_row
        if "native_language FROM profiles" in query:
            return {"native_language": "ca"}
        return None

    async def fetchval(self, query, *args):
        if "FROM auth_users WHERE email" in query:
            return 1 if self.taken else None
        return None

    def sql(self) -> str:
        return "\n".join(q for q, _ in self.executed)


class FakePool:
    def __init__(self, conn):
        self._conn = conn

    def acquire(self):
        return self._conn


class MailSpy:
    """Replaces the two send_* coroutines so no Resend call is attempted."""

    def __init__(self):
        self.confirm: list = []
        self.notice: list  = []

    def install(self):
        async def confirm(to_email, link, lang="en"):
            self.confirm.append((to_email, link, lang))

        async def notice(to_email, new_email, lang="en"):
            self.notice.append((to_email, new_email, lang))

        auth_module.send_email_change_confirm = confirm
        auth_module.send_email_change_notice  = notice
        return self


def _client(conn):
    pool = FakePool(conn)
    main_module._pool = pool
    main_module.app.state.pool = pool
    return TestClient(main_module.app, raise_server_exceptions=False)


def _auth():
    token = jwt.encode(
        {"sub": _USER_ID, "email": _OLD, "aud": "authenticated"},
        main_module._JWT_SECRET, algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


def _token_row(*, used_at=None, expires_in=timedelta(minutes=10)):
    return {
        "id":         "00000000-0000-0000-0000-0000000000bb",
        "user_id":    _USER_ID,
        "new_email":  _NEW,
        "expires_at": datetime.now(timezone.utc) + expires_in,
        "used_at":    used_at,
    }


# ── Routes ───────────────────────────────────────────────────────────────────

def test_routes_registered():
    paths = {getattr(r, "path", "") for r in auth_module.router.routes}
    assert "/auth/email/change-request" in paths
    assert "/auth/email/change-confirm" in paths


# ── change-request ───────────────────────────────────────────────────────────

def test_request_requires_authentication():
    conn = FakeConn()
    resp = _client(conn).post("/auth/email/change-request", json={"new_email": _NEW})
    assert resp.status_code == 401


def test_request_requires_current_password_when_account_has_one():
    conn = FakeConn()
    MailSpy().install()
    resp = _client(conn).post(
        "/auth/email/change-request", json={"new_email": _NEW}, headers=_auth(),
    )
    assert resp.status_code == 400
    assert "email_change_tokens" not in conn.sql()


def test_request_refuses_wrong_current_password():
    conn = FakeConn()
    MailSpy().install()
    resp = _client(conn).post(
        "/auth/email/change-request",
        json={"new_email": _NEW, "current_password": "wrong"},
        headers=_auth(),
    )
    assert resp.status_code == 401
    assert "email_change_tokens" not in conn.sql()


def test_request_refuses_address_already_registered():
    conn = FakeConn(taken=True)
    MailSpy().install()
    resp = _client(conn).post(
        "/auth/email/change-request",
        json={"new_email": _NEW, "current_password": "correct-horse"},
        headers=_auth(),
    )
    assert resp.status_code == 409
    assert "email_change_tokens" not in conn.sql()


def test_request_refuses_the_current_address():
    conn = FakeConn()
    MailSpy().install()
    resp = _client(conn).post(
        "/auth/email/change-request",
        json={"new_email": _OLD.upper(), "current_password": "correct-horse"},
        headers=_auth(),
    )
    assert resp.status_code == 400


def test_request_mails_both_addresses_and_stores_a_token():
    conn = FakeConn()
    spy  = MailSpy().install()
    resp = _client(conn).post(
        "/auth/email/change-request",
        json={"new_email": " NEW@Example.com ", "current_password": "correct-horse"},
        headers=_auth(),
    )
    assert resp.status_code == 202
    # The address itself is untouched until the link comes back.
    assert "UPDATE auth_users SET email" not in conn.sql()
    assert "INSERT INTO email_change_tokens" in conn.sql()
    # Confirmation to the new address, heads-up to the old one, both normalised.
    assert [to for to, _, _ in spy.confirm] == [_NEW]
    assert spy.notice == [(_OLD, _NEW, "ca")]
    assert "type=email-change&token=" in spy.confirm[0][1]


def test_request_skips_password_check_for_google_only_accounts():
    conn = FakeConn(password_hash=None)
    spy  = MailSpy().install()
    resp = _client(conn).post(
        "/auth/email/change-request", json={"new_email": _NEW}, headers=_auth(),
    )
    assert resp.status_code == 202
    assert len(spy.confirm) == 1


# ── change-confirm ───────────────────────────────────────────────────────────

def test_confirm_refuses_unknown_token():
    conn = FakeConn(token_row=None)
    resp = _client(conn).post("/auth/email/change-confirm", json={"token": "nope"})
    assert resp.status_code == 401
    assert "UPDATE auth_users SET email" not in conn.sql()


def test_confirm_refuses_used_token():
    conn = FakeConn(token_row=_token_row(used_at=datetime.now(timezone.utc)))
    resp = _client(conn).post("/auth/email/change-confirm", json={"token": "t"})
    assert resp.status_code == 401
    assert "UPDATE auth_users SET email" not in conn.sql()


def test_confirm_refuses_expired_token():
    conn = FakeConn(token_row=_token_row(expires_in=-timedelta(minutes=1)))
    resp = _client(conn).post("/auth/email/change-confirm", json={"token": "t"})
    assert resp.status_code == 401
    assert "UPDATE auth_users SET email" not in conn.sql()


def test_confirm_refuses_when_the_address_got_taken_meanwhile():
    conn = FakeConn(taken=True, token_row=_token_row())
    resp = _client(conn).post("/auth/email/change-confirm", json={"token": "t"})
    assert resp.status_code == 409
    assert "UPDATE auth_users SET email" not in conn.sql()


def test_confirm_moves_the_account_and_revokes_every_session():
    conn = FakeConn(token_row=_token_row())
    resp = _client(conn).post("/auth/email/change-confirm", json={"token": "t"})
    assert resp.status_code == 200

    sql = conn.sql()
    assert "UPDATE email_change_tokens SET used_at" in sql   # one-time
    assert "UPDATE auth_users SET email = $1, email_verified = TRUE" in sql
    assert "UPDATE profiles SET email" in sql
    assert "UPDATE refresh_tokens SET revoked_at" in sql     # old sessions die
    assert "INSERT INTO refresh_tokens" in sql               # fresh pair issued

    claims = jwt.decode(
        resp.json()["access_token"], main_module._JWT_SECRET,
        algorithms=["HS256"], audience="authenticated",
    )
    assert claims["email"] == _NEW
    assert claims["sub"] == _USER_ID


# ── Email rendering ──────────────────────────────────────────────────────────

def test_notice_email_names_the_new_address_and_has_no_confirm_button():
    # The old inbox is told what is happening but must never be able to
    # complete the change from there.
    html = emails_module._email_change_notice_html(_NEW, "en")
    assert _NEW in html
    assert "type=email-change" not in html
