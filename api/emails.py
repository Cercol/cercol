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
_GREEN  = "#16a34a"   # positive week-over-week delta
_BORDER = "#e5e7eb"

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
# Weekly digest helpers (English, internal operator email — Phase 17.6.7)
#
# All email-client-safe: <table> layout, inline CSS, no flexbox or web fonts.
# The digest builder consumes a single pre-aggregated `data` dict so this
# module stays presentation-only (no DB imports); the job api/jobs/weekly_digest
# owns all data access. See that file for the `data` shape.
# ---------------------------------------------------------------------------

def _section(title: str, body_html: str) -> str:
    """A titled block separated by a thin blue top rule."""
    return (
        f'<div style="margin-top:28px;padding-top:20px;border-top:2px solid {_BLUE};">'
        f'<h2 style="margin:0 0 12px;font-size:17px;font-weight:700;color:{_DARK};">{title}</h2>'
        f'{body_html}</div>'
    )


def _delta_span(cur: int, prev: int) -> str:
    """A small colored week-over-week delta: ▲ green / ▼ red / – gray."""
    d = cur - prev
    if d > 0:
        arrow, color = "&#9650;", _GREEN     # ▲
    elif d < 0:
        arrow, color = "&#9660;", _RED       # ▼
    else:
        arrow, color = "&#8211;", _GRAY      # –
    pct = f" ({d / prev:+.0%})" if prev else ""
    return (
        f'<span style="font-size:12px;color:{color};white-space:nowrap;">'
        f'{arrow} {d:+d}{pct}</span>'
    )


def _stat_card(label: str, value, delta: str = "") -> str:
    """One KPI cell: big number, small label, optional delta line."""
    delta_html = f'<div style="margin-top:2px;">{delta}</div>' if delta else ""
    return (
        f'<td style="padding:12px 8px;text-align:center;vertical-align:top;'
        f'background:{_LIGHT};border:1px solid {_BORDER};border-radius:8px;">'
        f'<div style="font-size:24px;font-weight:700;color:{_DARK};line-height:1.2;">{value}</div>'
        f'<div style="font-size:12px;color:{_GRAY};margin-top:2px;">{label}</div>'
        f'{delta_html}</td>'
    )


def _metric_row(cards: list[str]) -> str:
    """Lay out stat cards in a single spaced row."""
    cells = '<td style="width:10px;"></td>'.join(cards)
    return (
        '<table width="100%" cellpadding="0" cellspacing="0" '
        f'style="margin:8px 0;"><tr>{cells}</tr></table>'
    )


def _table(headers: list[str], rows: list[list], aligns: list[str] | None = None) -> str:
    """Generic email table. `rows` is a list of cell lists (already stringified)."""
    aligns = aligns or ["left"] * len(headers)
    head = "".join(
        f'<th style="padding:8px 10px;text-align:{a};font-size:12px;color:{_GRAY};'
        f'background:{_LIGHT};border-bottom:1px solid {_BORDER};font-weight:600;">{h}</th>'
        for h, a in zip(headers, aligns)
    )
    body = ""
    for r in rows:
        tds = "".join(
            f'<td style="padding:8px 10px;text-align:{a};font-size:13px;color:{_DARK};'
            f'border-bottom:1px solid {_BORDER};">{c}</td>'
            for c, a in zip(r, aligns)
        )
        body += f"<tr>{tds}</tr>"
    return (
        '<table width="100%" cellpadding="0" cellspacing="0" '
        f'style="border-collapse:collapse;"><thead><tr>{head}</tr></thead>'
        f'<tbody>{body}</tbody></table>'
    )


def _empty(note: str) -> str:
    """Muted placeholder used when a data source is empty or unavailable."""
    return f'<p style="margin:0;font-size:13px;color:{_GRAY};font-style:italic;">{note}</p>'


# Map of role id -> (emoji, English name). Mirrors src/utils/role-scoring.js
# comments and src/locales/en.json roles.*. Kept here so the digest renders a
# literal emoji per cluster (no image asset dependency in email clients).
_ROLE_DISPLAY = {
    "R01": ("\U0001F42C", "Dolphin"),   "R02": ("\U0001F43A", "Wolf"),
    "R03": ("\U0001F418", "Elephant"),  "R04": ("\U0001F989", "Owl"),
    "R05": ("\U0001F985", "Eagle"),     "R06": ("\U0001F985", "Falcon"),
    "R07": ("\U0001F419", "Octopus"),   "R08": ("\U0001F422", "Tortoise"),
    "R09": ("\U0001F41D", "Bee"),       "R10": ("\U0001F43B", "Bear"),
    "R11": ("\U0001F98A", "Fox"),       "R12": ("\U0001F9A1", "Badger"),
}


def _kpi(cur: int, prev: int) -> str:
    return _delta_span(cur, prev)


def _pivot_table(cum: dict) -> str:
    """Render a {languages, rows, col_totals, grand_total} pivot: model rows x
    language columns, per-row Total, and a footer Total row."""
    langs = cum["languages"]
    headers = ["Model"] + langs + ["Total"]
    aligns = ["left"] + ["right"] * (len(langs) + 1)
    body_rows = []
    for r in cum["rows"]:
        body_rows.append([r["instrument"]]
                         + [f"{r['per_lang'].get(l, 0):,}" for l in langs]
                         + [f"<strong>{r['total']:,}</strong>"])
    body_rows.append(["<strong>Total</strong>"]
                     + [f"<strong>{cum['col_totals'].get(l, 0):,}</strong>" for l in langs]
                     + [f"<strong>{cum.get('grand_total', 0):,}</strong>"])
    return _table(headers, body_rows, aligns)


def _north_star(kpis: dict, weekly_pivot: dict) -> str:
    """The one number: completed tests this week vs last, with the this-week
    instrument x language pivot underneath and a placeholder for the source
    split (filled once first-touch attribution lands)."""
    cur, prev = kpis.get("tests", (0, 0))
    block = (
        '<div style="text-align:center;padding:12px 0 4px;">'
        f'<div style="font-size:12px;font-weight:600;color:{_GRAY};'
        'text-transform:uppercase;letter-spacing:0.06em;">Completed tests this week</div>'
        f'<div style="font-size:44px;font-weight:700;color:{_BLUE};line-height:1.1;margin:4px 0;">{cur:,}</div>'
        f'<div style="font-size:13px;color:{_GRAY};">{_delta_span(cur, prev)} &nbsp;vs last week ({prev:,})</div>'
        '</div>'
    )
    block += (_pivot_table(weekly_pivot) if (weekly_pivot or {}).get("rows")
              else _empty("No tests completed this week."))
    block += _p('Source / channel split: <em>pending</em> &mdash; lands with first-touch attribution.',
                muted=True)
    return block


def weekly_digest_html(data: dict) -> str:
    """Build the weekly metrics digest email body (English).

    `data` keys (all optional; each section degrades gracefully):
      week_label   : str                    e.g. "Jun 09–Jun 15, 2026"
      kpis         : {name: (cur, prev)}     signups / tests / page_views / unique_visitors
      instruments  : [(label, count), ...]
      roles        : [(role_id, count), ...] sorted desc; empty -> omitted
      funnel       : {page_view,article_view,test_start,cta_click,test_complete: int,
                      conversions: [(label, "x%"), ...]}
      top_articles : [(title, reads), ...]
      cumulative   : {languages:[lang], rows:[{instrument,per_lang:{lang:n},total}], col_totals, grand_total}
      norms        : [{instrument, lang, n, threshold, empirical, drift:[(domain,mean,delta)]|None}]
      seo          : {source, impressions, clicks, top_queries:[(q,imp,clk,pos)],
                      top_pages:[(url,imp,clk)], movers:[(url,before,now,impr)], pending:bool}
      pagespeed    : [(url, score, lcp_ms), ...]
      broken_links : [(url, slug, lang, status), ...]
      gsc_lag_note : bool
    """
    kpis = data.get("kpis", {})
    def card(name, label):
        cur, prev = kpis.get(name, (0, 0))
        return _stat_card(label, f"{cur:,}", _kpi(cur, prev))
    parts = [
        _h1(f"Weekly digest &mdash; {data.get('week_label', '')}"),
        _north_star(kpis, data.get("weekly_pivot") or {}),
        _p("How cercol.team performed last week (Mon&ndash;Sun, UTC).", muted=True),
        _metric_row([
            card("signups", "Signups"),
            card("tests", "Tests"),
            card("page_views", "Page views"),
            card("unique_visitors", "Visitors"),
        ]),
    ]

    # Tests by instrument
    instruments = data.get("instruments") or []
    if instruments:
        rows = [[lbl, f"{n:,}"] for lbl, n in instruments]
        parts.append(_section("Tests by instrument", _table(["Instrument", "Count"], rows, ["left", "right"])))
    else:
        parts.append(_section("Tests by instrument", _empty("No tests completed this week.")))

    # Tests by cluster (12 animal roles)
    roles = data.get("roles") or []
    if roles:
        rows = []
        for role_id, n in roles:
            emoji, nm = _ROLE_DISPLAY.get(role_id, ("", role_id))
            rows.append([f"{emoji} {nm}", f"{n:,}"])
        parts.append(_section("Tests by cluster", _table(["Cluster", "Count"], rows, ["left", "right"])))
    else:
        parts.append(_section("Tests by cluster", _empty("No completed tests to cluster.")))

    # Cumulative tests (all-time): pivot of model (rows) x language (columns)
    # with a per-row total and a footer totals row.
    cum = data.get("cumulative") or {}
    parts.append(_section(
        "Cumulative tests (all-time)",
        _pivot_table(cum) if cum.get("rows") else _empty("No tests recorded yet."),
    ))

    # Population norms: which (instrument, language) combos self-calibrate, and
    # how their empirical means drift from the researcher priors.
    norms = data.get("norms") or []
    if norms:
        rows = []
        for nm in norms:
            status = "&#10003; empirical" if nm["empirical"] else f"{nm['n']:,} / {nm['threshold']:,}"
            rows.append([nm["instrument"], nm["lang"], f"{nm['n']:,}", status])
        body = _table(["Instrument", "Lang", "N", "Norms"], rows, ["left", "left", "right", "right"])
        for nm in (n for n in norms if n.get("drift")):
            ds = " &middot; ".join(f"{d.capitalize()} {delta:+.2f}" for d, _mean, delta in nm["drift"])
            body += _p(f"<strong>{nm['instrument']} &middot; {nm['lang']}</strong> mean drift vs prior: {ds}",
                       muted=True)
        parts.append(_section("Population norms (validity)", body))
    else:
        parts.append(_section("Population norms (validity)", _empty("No completed-profile data yet.")))

    # Funnel
    f = data.get("funnel") or {}
    if f:
        stages = [
            ("Page views", f.get("page_view", 0)),
            ("Article reads", f.get("article_view", 0)),
            ("Test starts", f.get("test_start", 0)),
            ("Tests completed", f.get("test_complete", 0)),
            ("CTA clicks", f.get("cta_click", 0)),
        ]
        rows = [[lbl, f"{n:,}"] for lbl, n in stages]
        conv = f.get("conversions") or []
        conv_html = "".join(_p(f"{lbl}: <strong>{val}</strong>", muted=True) for lbl, val in conv)
        parts.append(_section("Funnel", _table(["Stage", "Count"], rows, ["left", "right"]) + conv_html))
    else:
        parts.append(_section("Funnel", _empty("No funnel events this week.")))

    # Top blog articles
    arts = data.get("top_articles") or []
    if arts:
        rows = [[t, f"{n:,}"] for t, n in arts]
        parts.append(_section("Top articles (reads)", _table(["Article", "Reads"], rows, ["left", "right"])))
    else:
        parts.append(_section("Top articles (reads)", _empty("No article reads recorded this week.")))

    # Search (GSC / Bing)
    seo = data.get("seo") or {}
    if seo and not seo.get("pending") and (seo.get("top_queries") or seo.get("impressions")):
        src = (seo.get("source") or "search").upper()
        body = _metric_row([
            _stat_card("Impressions", f"{seo.get('impressions', 0):,}"),
            _stat_card("Clicks", f"{seo.get('clicks', 0):,}"),
        ])
        tq = seo.get("top_queries") or []
        if tq:
            rows = [[q, f"{imp:,}", f"{clk:,}", f"{pos:.1f}" if pos is not None else "&ndash;"]
                    for q, imp, clk, pos in tq]
            body += "<div style='margin-top:12px;'></div>" + _table(
                ["Query", "Impr.", "Clicks", "Pos."], rows, ["left", "right", "right", "right"])
        mv = seo.get("movers") or []
        if mv:
            rows = [[u, f"{before:.1f}", f"{now:.1f}", _delta_span(0, 0) if impr == 0 else
                     f'<span style="color:{_GREEN if impr > 0 else _RED};">{impr:+.1f}</span>']
                    for u, before, now, impr in mv]
            body += "<div style='margin-top:12px;'></div>" + _table(
                ["Page", "Was", "Now", "&Delta;pos"], rows, ["left", "right", "right", "right"])
        parts.append(_section(f"Search ({src})", body))
    else:
        parts.append(_section("Search", _empty("Search data pending (export not yet populated).")))

    # PageSpeed
    ps = data.get("pagespeed") or []
    if ps:
        rows = [[u, f"{s}" if s is not None else "&ndash;",
                 f"{int(lcp):,} ms" if lcp is not None else "&ndash;"] for u, s, lcp in ps]
        parts.append(_section("PageSpeed (mobile, lowest scores)",
                              _table(["URL", "Score", "LCP"], rows, ["left", "right", "right"])))
    else:
        parts.append(_section("PageSpeed (mobile, lowest scores)", _empty("No PageSpeed runs.")))

    # Broken external links
    bl = data.get("broken_links") or []
    if bl:
        rows = [[u, f"{slug} [{lang}]", str(status) if status is not None else "conn"]
                for u, slug, lang, status in bl]
        parts.append(_section("Broken external links",
                              _table(["URL", "In article", "Code"], rows)))
    else:
        parts.append(_section("Broken external links", _empty("No broken external links. ✓")))

    if data.get("gsc_lag_note"):
        parts.append(_p("Note: search data has up to ~48h export lag, so the last "
                        "days of the week may be partial.", muted=True))

    return _base("".join(parts), lang="en")


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
