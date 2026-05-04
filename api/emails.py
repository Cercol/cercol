"""
Transactional email sending via Resend.

All functions are fire-and-forget: they return a coroutine that should be
scheduled with asyncio.create_task() so email failures never block API responses.

Triggers:
  send_witness_assigned  — witness receives their evaluation link
  send_witness_completed — subject is notified when a witness finishes
  send_group_invitation  — invited person receives a group invite
"""
import asyncio
import os
import resend

# ---------------------------------------------------------------------------
# Client setup
# ---------------------------------------------------------------------------

resend.api_key = os.environ.get("RESEND_API_KEY", "")

FROM_ADDRESS  = "Cèrcol <noreply@cercol.team>"
FRONTEND_URL  = os.environ.get("FRONTEND_URL", "https://cercol.team")

# ---------------------------------------------------------------------------
# Shared styles (inline CSS — required for email client compatibility)
# ---------------------------------------------------------------------------

_BLUE   = "#0047ba"
_RED    = "#cf3339"
_YELLOW = "#f1c22f"
_DARK   = "#111111"
_GRAY   = "#6b7280"
_LIGHT  = "#f9fafb"
_WHITE  = "#ffffff"

def _base(content: str) -> str:
    """Wrap content in the shared email shell."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cèrcol</title>
</head>
<body style="margin:0;padding:0;background:{_LIGHT};font-family:Arial,Helvetica,sans-serif;color:{_DARK};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:{_LIGHT};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Header -->
        <tr>
          <td style="background:{_BLUE};border-radius:12px 12px 0 0;padding:20px 32px;">
            <img src="{FRONTEND_URL}/email-logo.png" alt="Cèrcol" width="160" height="67"
                 style="display:block;border:0;" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:{_WHITE};padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            {content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:{_LIGHT};border-radius:0 0 12px 12px;padding:20px 32px;border:1px solid #e5e7eb;border-top:none;">
            <p style="margin:0;font-size:12px;color:{_GRAY};line-height:1.5;">
              You received this email because you are part of Cèrcol.<br>
              <a href="{FRONTEND_URL}/privacy" style="color:{_GRAY};">Privacy policy</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _btn(url: str, label: str) -> str:
    return (
        f'<a href="{url}" style="display:inline-block;background:{_BLUE};color:{_WHITE};'
        f'font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;'
        f'border-radius:8px;margin-top:24px;">{label}</a>'
    )


def _h1(text: str) -> str:
    return f'<h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:{_DARK};">{text}</h1>'


def _p(text: str, muted: bool = False) -> str:
    color = _GRAY if muted else _DARK
    return f'<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:{color};">{text}</p>'


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------

def _witness_assigned_html(witness_name: str, subject_display: str, link: str) -> str:
    return _base(
        _h1(f"Hi {witness_name} — you've been asked to evaluate someone")
        + _p(f"<strong>{subject_display}</strong> has asked you to complete a short personality evaluation as part of their Cèrcol profile.")
        + _p("It takes about 5 minutes and your responses help them understand themselves better through trusted perspectives.")
        + _btn(link, "Start evaluation")
        + _p("If you did not expect this email, you can safely ignore it.", muted=True)
    )


def _witness_completed_html(subject_name: str, witness_name: str) -> str:
    return _base(
        _h1("Your witness has completed their evaluation")
        + _p(f"<strong>{witness_name}</strong> has just finished evaluating your Cèrcol profile.")
        + _p("Head to your results page to see how their perspective compares with your self-assessment.")
        + _btn(f"{FRONTEND_URL}/my-results", "View my results")
    )


def _group_invitation_html(group_name: str, inviter_name: str) -> str:
    return _base(
        _h1(f"You've been invited to join a group")
        + _p(f"<strong>{inviter_name}</strong> has invited you to join the group <strong>{group_name}</strong> on Cèrcol.")
        + _p("Groups let you explore how your personality profile fits with your team — see complementary strengths and potential blind spots.")
        + _btn(f"{FRONTEND_URL}/groups", "Accept invitation")
        + _p("You'll need a Cèrcol account to accept. It only takes a moment to sign up.", muted=True)
    )


# ---------------------------------------------------------------------------
# Send helpers (run in thread — Resend SDK is synchronous)
# ---------------------------------------------------------------------------

REPLY_TO = "hello@cercol.team"

def _send_sync(to: str, subject: str, html: str) -> None:
    resend.Emails.send({
        "from":     FROM_ADDRESS,
        "to":       [to],
        "reply_to": REPLY_TO,
        "subject":  subject,
        "html":     html,
    })


async def _send(to: str, subject: str, html: str) -> None:
    """Send an email in a thread pool so the async event loop is not blocked."""
    try:
        await asyncio.to_thread(_send_sync, to, subject, html)
    except Exception as exc:
        print(f"[email] failed to send to {to}: {exc}")


def _magic_link_html(link: str) -> str:
    return _base(
        _h1("Sign in to Cèrcol")
        + _p("Fes clic al botó per accedir a Cèrcol. L'accés és vàlid durant 15 minuts.")
        + _p("Click the button below to sign in. The link is valid for 15 minutes.")
        + _btn(link, "Sign in / Accedir")
        + _p("If you did not request this link, you can safely ignore this email.", muted=True)
    )


# ---------------------------------------------------------------------------
# Public API — all return coroutines; schedule with asyncio.create_task()
# ---------------------------------------------------------------------------

async def send_magic_link(to_email: str, link: str) -> None:
    """Send a sign-in magic link. Uses asyncio.to_thread so the event loop is not blocked."""
    await _send(
        to      = to_email,
        subject = "El teu accés a Cèrcol / Your Cèrcol sign-in link",
        html    = _magic_link_html(link),
    )


async def send_witness_assigned(
    witness_name: str,
    witness_email: str,
    subject_display: str,
    link: str,
) -> None:
    """Email the witness with their evaluation link."""
    await _send(
        to      = witness_email,
        subject = f"{subject_display} has asked you to evaluate them on Cèrcol",
        html    = _witness_assigned_html(witness_name, subject_display, link),
    )


async def send_witness_completed(
    subject_email: str,
    subject_name: str,
    witness_name: str,
) -> None:
    """Email the subject when a witness finishes their evaluation."""
    await _send(
        to      = subject_email,
        subject = f"{witness_name} has completed your Cèrcol evaluation",
        html    = _witness_completed_html(subject_name, witness_name),
    )


async def send_group_invitation(
    invited_email: str,
    group_name: str,
    inviter_name: str,
) -> None:
    """Email an invited person when they are added to a group."""
    await _send(
        to      = invited_email,
        subject = f"You've been invited to join {group_name} on Cèrcol",
        html    = _group_invitation_html(group_name, inviter_name),
    )
