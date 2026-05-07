"""
Transactional email sending via Resend.

All functions are fire-and-forget: they return a coroutine that should be
scheduled with asyncio.create_task() so email failures never block API responses.

Triggers:
  send_witness_assigned  — witness receives their evaluation link
  send_witness_completed — subject is notified when a witness finishes
  send_group_invitation  — invited person receives a group invite
  send_magic_link        — one-time sign-in link

Each send_* function accepts a `lang` parameter (ISO 639-1 code).
Supported: en, ca, es, fr, de, da — any other value falls back to 'en'.
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
REPLY_TO      = "hello@cercol.team"

# ---------------------------------------------------------------------------
# Language resolution
# ---------------------------------------------------------------------------

_SUPPORTED_LANGS = {"en", "ca", "es", "fr", "de", "da"}

def _lang(native_language: str | None) -> str:
    """Map a profile native_language code to a supported email language."""
    if native_language and native_language in _SUPPORTED_LANGS:
        return native_language
    return "en"

# ---------------------------------------------------------------------------
# Shared styles (inline CSS — required for email client compatibility)
# ---------------------------------------------------------------------------

_BLUE   = "#0047ba"
_RED    = "#cf3339"
_DARK   = "#111111"
_GRAY   = "#6b7280"
_LIGHT  = "#f9fafb"
_WHITE  = "#ffffff"

# ---------------------------------------------------------------------------
# Multilingual strings
# ---------------------------------------------------------------------------

_S = {
    # ── Footer ──────────────────────────────────────────────────────────────
    "footer_received": {
        "en": "You received this email because you are part of Cèrcol.",
        "ca": "Has rebut aquest correu perquè formes part de Cèrcol.",
        "es": "Recibiste este correo porque formas parte de Cèrcol.",
        "fr": "Vous avez reçu cet e-mail parce que vous faites partie de Cèrcol.",
        "de": "Du hast diese E-Mail erhalten, weil du Teil von Cèrcol bist.",
        "da": "Du har modtaget denne e-mail, fordi du er en del af Cèrcol.",
    },
    "footer_privacy": {
        "en": "Privacy policy",
        "ca": "Política de privacitat",
        "es": "Política de privacidad",
        "fr": "Politique de confidentialité",
        "de": "Datenschutzrichtlinie",
        "da": "Privatlivspolitik",
    },

    # ── Magic link ───────────────────────────────────────────────────────────
    "magic_subject": {
        "en": "Sign in to Cèrcol",
        "ca": "Accedeix a Cèrcol",
        "es": "Accede a Cèrcol",
        "fr": "Connectez-vous à Cèrcol",
        "de": "Bei Cèrcol anmelden",
        "da": "Log ind på Cèrcol",
    },
    "magic_heading": {
        "en": "Sign in to Cèrcol",
        "ca": "Accedeix a Cèrcol",
        "es": "Accede a Cèrcol",
        "fr": "Connexion à Cèrcol",
        "de": "Bei Cèrcol anmelden",
        "da": "Log ind på Cèrcol",
    },
    "magic_body": {
        "en": "Click the button below to sign in. The link is valid for 15 minutes.",
        "ca": "Fes clic al botó per accedir al teu compte. L'accés és vàlid durant 15 minuts.",
        "es": "Haz clic en el botón para acceder a tu cuenta. El enlace es válido durante 15 minutos.",
        "fr": "Cliquez sur le bouton ci-dessous pour vous connecter. Le lien est valide pendant 15 minutes.",
        "de": "Klicke auf die Schaltfläche unten, um dich anzumelden. Der Link ist 15 Minuten gültig.",
        "da": "Klik på knappen nedenfor for at logge ind. Linket er gyldigt i 15 minutter.",
    },
    "magic_button": {
        "en": "Sign in",
        "ca": "Accedir",
        "es": "Acceder",
        "fr": "Se connecter",
        "de": "Anmelden",
        "da": "Log ind",
    },
    "magic_ignore": {
        "en": "If you did not request this link, you can safely ignore this email.",
        "ca": "Si no has sol·licitat aquest accés, pots ignorar aquest correu.",
        "es": "Si no has solicitado este enlace, puedes ignorar este correo.",
        "fr": "Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet e-mail.",
        "de": "Falls du diesen Link nicht angefordert hast, kannst du diese E-Mail ignorieren.",
        "da": "Hvis du ikke har anmodet om dette link, kan du roligt ignorere denne e-mail.",
    },

    # ── Witness assigned ─────────────────────────────────────────────────────
    "wa_subject": {
        "en": "{subject_display} has asked you to evaluate them on Cèrcol",
        "ca": "{subject_display} t'ha demanat que l'avaluïs a Cèrcol",
        "es": "{subject_display} te ha pedido que los evalúes en Cèrcol",
        "fr": "{subject_display} vous a demandé de les évaluer sur Cèrcol",
        "de": "{subject_display} hat dich gebeten, sie bei Cèrcol zu bewerten",
        "da": "{subject_display} har bedt dig om at evaluere dem på Cèrcol",
    },
    "wa_heading": {
        "en": "Hi {witness_name} — you've been asked to evaluate someone",
        "ca": "Hola {witness_name} — t'han demanat que avaluïs algú",
        "es": "Hola {witness_name} — te han pedido que evalúes a alguien",
        "fr": "Bonjour {witness_name} — on vous a demandé d'évaluer quelqu'un",
        "de": "Hallo {witness_name} — du wurdest gebeten, jemanden zu bewerten",
        "da": "Hej {witness_name} — du er blevet bedt om at evaluere nogen",
    },
    "wa_body1": {
        "en": "<strong>{subject_display}</strong> has asked you to complete a short personality evaluation as part of their Cèrcol profile.",
        "ca": "<strong>{subject_display}</strong> t'ha demanat que completis una breu avaluació de personalitat com a part del seu perfil de Cèrcol.",
        "es": "<strong>{subject_display}</strong> te ha pedido que completes una breve evaluación de personalidad como parte de su perfil de Cèrcol.",
        "fr": "<strong>{subject_display}</strong> vous a demandé de compléter une courte évaluation de personnalité dans le cadre de son profil Cèrcol.",
        "de": "<strong>{subject_display}</strong> hat dich gebeten, eine kurze Persönlichkeitsbewertung für ihr Cèrcol-Profil auszufüllen.",
        "da": "<strong>{subject_display}</strong> har bedt dig om at udfylde en kort personlighedsevaluering som en del af deres Cèrcol-profil.",
    },
    "wa_body2": {
        "en": "It takes about 5 minutes and your responses help them understand themselves better through trusted perspectives.",
        "ca": "Triga uns 5 minuts i les teves respostes l'ajuden a entendre's millor a través de perspectives de confiança.",
        "es": "Se tarda unos 5 minutos y tus respuestas les ayudan a entenderse mejor a través de perspectivas de confianza.",
        "fr": "Cela prend environ 5 minutes et vos réponses l'aident à mieux se comprendre grâce à des perspectives de confiance.",
        "de": "Es dauert etwa 5 Minuten und deine Antworten helfen ihr, sich selbst durch vertrauenswürdige Perspektiven besser zu verstehen.",
        "da": "Det tager cirka 5 minutter, og dine svar hjælper dem med at forstå sig selv bedre gennem betroede perspektiver.",
    },
    "wa_button": {
        "en": "Start evaluation",
        "ca": "Comença l'avaluació",
        "es": "Iniciar evaluación",
        "fr": "Commencer l'évaluation",
        "de": "Bewertung starten",
        "da": "Start evaluering",
    },
    "wa_ignore": {
        "en": "If you did not expect this email, you can safely ignore it.",
        "ca": "Si no esperaves aquest correu, pots ignorar-lo.",
        "es": "Si no esperabas este correo, puedes ignorarlo.",
        "fr": "Si vous n'attendiez pas cet e-mail, vous pouvez l'ignorer.",
        "de": "Wenn du diese E-Mail nicht erwartet hast, kannst du sie ignorieren.",
        "da": "Hvis du ikke forventede denne e-mail, kan du roligt ignorere den.",
    },

    # ── Witness completed ────────────────────────────────────────────────────
    "wc_subject": {
        "en": "{witness_name} has completed your Cèrcol evaluation",
        "ca": "{witness_name} ha completat la teva avaluació de Cèrcol",
        "es": "{witness_name} ha completado tu evaluación de Cèrcol",
        "fr": "{witness_name} a complété votre évaluation Cèrcol",
        "de": "{witness_name} hat deine Cèrcol-Bewertung abgeschlossen",
        "da": "{witness_name} har gennemført din Cèrcol-evaluering",
    },
    "wc_heading": {
        "en": "Your witness has completed their evaluation",
        "ca": "El teu testimoni ha completat la seva avaluació",
        "es": "Tu testigo ha completado su evaluación",
        "fr": "Votre témoin a complété son évaluation",
        "de": "Dein Zeuge hat die Bewertung abgeschlossen",
        "da": "Dit vidne har afsluttet deres evaluering",
    },
    "wc_body1": {
        "en": "<strong>{witness_name}</strong> has just finished evaluating your Cèrcol profile.",
        "ca": "<strong>{witness_name}</strong> acaba de finalitzar l'avaluació del teu perfil de Cèrcol.",
        "es": "<strong>{witness_name}</strong> acaba de finalizar la evaluación de tu perfil de Cèrcol.",
        "fr": "<strong>{witness_name}</strong> vient de terminer l'évaluation de votre profil Cèrcol.",
        "de": "<strong>{witness_name}</strong> hat gerade die Bewertung deines Cèrcol-Profils abgeschlossen.",
        "da": "<strong>{witness_name}</strong> har netop afsluttet evalueringen af din Cèrcol-profil.",
    },
    "wc_body2": {
        "en": "Head to your results page to see how their perspective compares with your self-assessment.",
        "ca": "Ves a la pàgina de resultats per veure com la seva perspectiva es compara amb la teva autoavaluació.",
        "es": "Ve a tu página de resultados para ver cómo su perspectiva se compara con tu autoevaluación.",
        "fr": "Rendez-vous sur votre page de résultats pour voir comment leur perspective se compare à votre auto-évaluation.",
        "de": "Gehe zu deiner Ergebnisseite, um zu sehen, wie ihre Perspektive mit deiner Selbsteinschätzung verglichen wird.",
        "da": "Gå til din resultatside for at se, hvordan deres perspektiv sammenlignes med din selvvurdering.",
    },
    "wc_button": {
        "en": "View my results",
        "ca": "Veure els meus resultats",
        "es": "Ver mis resultados",
        "fr": "Voir mes résultats",
        "de": "Meine Ergebnisse anzeigen",
        "da": "Se mine resultater",
    },

    # ── Group invitation ─────────────────────────────────────────────────────
    "gi_subject": {
        "en": "You've been invited to join {group_name} on Cèrcol",
        "ca": "T'han convidat a unir-te a {group_name} a Cèrcol",
        "es": "Te han invitado a unirte a {group_name} en Cèrcol",
        "fr": "Vous avez été invité(e) à rejoindre {group_name} sur Cèrcol",
        "de": "Du wurdest eingeladen, {group_name} auf Cèrcol beizutreten",
        "da": "Du er blevet inviteret til at deltage i {group_name} på Cèrcol",
    },
    "gi_heading": {
        "en": "You've been invited to join a group",
        "ca": "T'han convidat a unir-te a un grup",
        "es": "Te han invitado a unirte a un grupo",
        "fr": "Vous avez été invité(e) à rejoindre un groupe",
        "de": "Du wurdest eingeladen, einer Gruppe beizutreten",
        "da": "Du er blevet inviteret til at deltage i en gruppe",
    },
    "gi_body1": {
        "en": "<strong>{inviter_name}</strong> has invited you to join the group <strong>{group_name}</strong> on Cèrcol.",
        "ca": "<strong>{inviter_name}</strong> t'ha convidat a unir-te al grup <strong>{group_name}</strong> a Cèrcol.",
        "es": "<strong>{inviter_name}</strong> te ha invitado a unirte al grupo <strong>{group_name}</strong> en Cèrcol.",
        "fr": "<strong>{inviter_name}</strong> vous a invité(e) à rejoindre le groupe <strong>{group_name}</strong> sur Cèrcol.",
        "de": "<strong>{inviter_name}</strong> hat dich eingeladen, der Gruppe <strong>{group_name}</strong> auf Cèrcol beizutreten.",
        "da": "<strong>{inviter_name}</strong> har inviteret dig til at deltage i gruppen <strong>{group_name}</strong> på Cèrcol.",
    },
    "gi_body2": {
        "en": "Groups let you explore how your personality profile fits with your team — see complementary strengths and potential blind spots.",
        "ca": "Els grups et permeten explorar com el teu perfil de personalitat encaixa amb el teu equip — veu fortaleses complementàries i possibles punts cecs.",
        "es": "Los grupos te permiten explorar cómo tu perfil de personalidad encaja con tu equipo — ve fortalezas complementarias y posibles puntos ciegos.",
        "fr": "Les groupes vous permettent d'explorer comment votre profil de personnalité s'adapte à votre équipe — voyez les forces complémentaires et les angles morts potentiels.",
        "de": "Gruppen ermöglichen es dir, zu erkunden, wie dein Persönlichkeitsprofil zu deinem Team passt — sieh komplementäre Stärken und potenzielle blinde Flecken.",
        "da": "Grupper giver dig mulighed for at udforske, hvordan din personlighedsprofil passer til dit team — se komplementære styrker og potentielle blinde vinkler.",
    },
    "gi_button": {
        "en": "Accept invitation",
        "ca": "Accepta la invitació",
        "es": "Aceptar invitación",
        "fr": "Accepter l'invitation",
        "de": "Einladung annehmen",
        "da": "Accepter invitation",
    },
    "gi_note": {
        "en": "You'll need a Cèrcol account to accept. It only takes a moment to sign up.",
        "ca": "Necessites un compte de Cèrcol per acceptar. Registrar-te és molt ràpid.",
        "es": "Necesitas una cuenta de Cèrcol para aceptar. Registrarte es muy rápido.",
        "fr": "Vous aurez besoin d'un compte Cèrcol pour accepter. L'inscription ne prend qu'un instant.",
        "de": "Du benötigst ein Cèrcol-Konto, um anzunehmen. Die Registrierung dauert nur einen Moment.",
        "da": "Du skal bruge en Cèrcol-konto for at acceptere. Det tager kun et øjeblik at tilmelde sig.",
    },
}

def _t(key: str, lang: str) -> str:
    """Look up a string. Falls back to 'en' silently if the lang key is missing."""
    return _S[key].get(lang) or _S[key]["en"]

# ---------------------------------------------------------------------------
# HTML helpers
# ---------------------------------------------------------------------------

def _base(content: str, lang: str = "en") -> str:
    """Wrap content in the shared email shell."""
    return f"""<!DOCTYPE html>
<html lang="{lang}">
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
              {_t("footer_received", lang)}<br>
              <a href="{FRONTEND_URL}/privacy" style="color:{_GRAY};">{_t("footer_privacy", lang)}</a>
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

def _magic_link_html(link: str, lang: str) -> str:
    return _base(
        _h1(_t("magic_heading", lang))
        + _p(_t("magic_body", lang))
        + _btn(link, _t("magic_button", lang))
        + _p(_t("magic_ignore", lang), muted=True),
        lang=lang,
    )


def _witness_assigned_html(
    witness_name: str, subject_display: str, link: str, lang: str
) -> str:
    return _base(
        _h1(_t("wa_heading", lang).format(witness_name=witness_name))
        + _p(_t("wa_body1", lang).format(subject_display=subject_display))
        + _p(_t("wa_body2", lang))
        + _btn(link, _t("wa_button", lang))
        + _p(_t("wa_ignore", lang), muted=True),
        lang=lang,
    )


def _witness_completed_html(witness_name: str, lang: str) -> str:
    return _base(
        _h1(_t("wc_heading", lang))
        + _p(_t("wc_body1", lang).format(witness_name=witness_name))
        + _p(_t("wc_body2", lang))
        + _btn(f"{FRONTEND_URL}/my-results", _t("wc_button", lang)),
        lang=lang,
    )


def _group_invitation_html(group_name: str, inviter_name: str, lang: str) -> str:
    return _base(
        _h1(_t("gi_heading", lang))
        + _p(_t("gi_body1", lang).format(inviter_name=inviter_name, group_name=group_name))
        + _p(_t("gi_body2", lang))
        + _btn(f"{FRONTEND_URL}/groups", _t("gi_button", lang))
        + _p(_t("gi_note", lang), muted=True),
        lang=lang,
    )


# ---------------------------------------------------------------------------
# Send helpers (run in thread — Resend SDK is synchronous)
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Public API — all return coroutines; schedule with asyncio.create_task()
# ---------------------------------------------------------------------------

async def send_magic_link(to_email: str, link: str, lang: str = "en") -> None:
    """Send a sign-in magic link."""
    l = _lang(lang)
    await _send(
        to      = to_email,
        subject = _t("magic_subject", l),
        html    = _magic_link_html(link, l),
    )


async def send_witness_assigned(
    witness_name: str,
    witness_email: str,
    subject_display: str,
    link: str,
    lang: str = "en",
) -> None:
    """Email the witness with their evaluation link."""
    l = _lang(lang)
    await _send(
        to      = witness_email,
        subject = _t("wa_subject", l).format(subject_display=subject_display),
        html    = _witness_assigned_html(witness_name, subject_display, link, l),
    )


async def send_witness_completed(
    subject_email: str,
    subject_name: str,
    witness_name: str,
    lang: str = "en",
) -> None:
    """Email the subject when a witness finishes their evaluation."""
    l = _lang(lang)
    await _send(
        to      = subject_email,
        subject = _t("wc_subject", l).format(witness_name=witness_name),
        html    = _witness_completed_html(witness_name, l),
    )


async def send_group_invitation(
    invited_email: str,
    group_name: str,
    inviter_name: str,
    lang: str = "en",
) -> None:
    """Email an invited person when they are added to a group."""
    l = _lang(lang)
    await _send(
        to      = invited_email,
        subject = _t("gi_subject", l).format(group_name=group_name),
        html    = _group_invitation_html(group_name, inviter_name, l),
    )
