# Cèrcol — Informe d'auditoria cap a l'excel·lència (v2)

**Data:** 10 de maig de 2026 · Branca auditada: `audit/excellence-v2` · Commit base: `1a1b736`

> Segona auditoria exhaustiva del codebase Cèrcol després de les fases 13.19 (Claude Excellence v1), 14, 14.5 (migració a auth pròpia) i 15.5 (SEO + blog + redisseny). L'objectiu és identificar regressions sobre la primera auditoria, deute nou introduït pels fases 14.x i 15.5.x, incoherències entre documentació i codi, i les peces que encara impedeixen que el projecte siga una obra eterna.
>
> Cap d'aquests problemes ha estat corregit. La intenció d'aquest informe és fer-ne inventari abans d'obrir una fase 13.19-bis dedicada a la regressió + un capítol nou de neteja documental.

---

## Llegenda de gravetat

| Nivell | Significat |
|--------|------------|
| 🔴 CRÍTIC | Produeix resultats incorrectes o obre vulnerabilitats reals ara mateix |
| 🟠 GREU | Deute arquitectònic significatiu o risc de seguretat latent |
| 🟡 IMPORTANT | Violació de convencions establertes o codi que s'hauria de refactoritzar |
| 🔵 QUALITAT | Mediocricitat que no afecta el funcionament però rebaixa el nivell |

---

## I. Errors crítics de dades, scoring i algorisme

### 1. 🔴 Centroids de rols del backend tornen a divergir del frontend — regressió greu

La fase 13.19 va resoldre aquest mateix punt, però la migració a `api/scoring.py` (mòdul nou) ha reintroduït centroids diferents. El frontend (`src/utils/role-scoring.js`) i `SCIENCE.md` defineixen els centroids canònics; `api/scoring.py` no els reprodueix:

| Rol | Frontend `[E,A,O,C,N]` | Backend `_ROLE_CENTROIDS` |
|-----|-------------------------|----------------------------|
| R03 Elephant | `[-1.0, +1.0,  0.0,  0.0, -0.8]` | `(-1.0,  1.0,  0.0, -0.3, +0.3)` |
| R04 Owl      | `[-1.0, -1.0,  0.0, +0.8, -0.5]` | `(-1.0, -1.0,  0.0,  0.0, +0.5)` |
| R07 Octopus  | `[-1.0,  0.0, +1.0, -0.8,  0.0]` | `(-1.0,  0.0,  1.0,  0.0, +0.8)` |
| R09 Bee      | `[ 0.0, +1.0, +1.0, +0.8, -0.5]` | `( 0.0,  1.0,  1.0, -0.3, +0.3)` |
| R10 Bear     | `[ 0.0, +1.0, -1.0, +0.5, -0.8]` | `( 0.0,  1.0, -1.0,  0.5, -0.3)` |
| R11 Fox      | `[ 0.0, -1.0, +1.0, -0.8, +0.3]` | `( 0.0, -1.0,  1.0,  0.0, +0.5)` |
| R12 Badger   | `[ 0.0, -1.0, -1.0, +0.8, -0.3]` | `( 0.0, -1.0, -1.0,  0.3, -0.5)` |

Per a R07 (Octopus) la divergència és especialment greu: el frontend espera N=0 i C=−0.8, però el backend codifica N=+0.8 i C=0 (el signe de N invertit). Açò vol dir que `/admin/results` (CSV i taula d'admin) i `/groups/:id/report-data` (cor del Last Quarter) assignen rols sistemàticament incorrectes.

**Fitxers:** `api/scoring.py` (línies 50-63), `src/utils/role-scoring.js` (font de veritat), `SCIENCE.md` (taula línies 145-156).

### 2. 🔴 Els tests de Python no detecten la divergència amb el frontend

`api/tests/test_scoring.py` només verifica autoconsistència interna del backend (`each_centroid_maps_to_its_own_role`, `centroids_are_unique_nearest_neighbours`). Tots els tests passarien igual amb els centroids correctes o incorrectes, perquè cap test compara els valors numèrics contra una font canònica (frontend/SCIENCE.md). Per tant la regressió #1 no genera cap fallada en CI.

Cal afegir un test que carregue una taula d'expected vectors i la compare amb tolerància 0 contra `_ROLE_CENTROIDS`, o un test que evalue casos coneguts (per exemple: vectors del frontend) i verifique que el rol resultant coincideix.

**Fitxer:** `api/tests/test_scoring.py`.

### 3. 🔴 `detectDivergence` aplica NORM_MEAN/SD del self-report a les puntuacions del Witness — biaix sistemàtic

`computeWitnessScores` produeix puntuacions en escala 1–5 amb una mitjana de població de 3.0 per construcció (`3 + (votes/n) × 2`). Després `detectDivergence` i `computeRole(witnessScores)` les converteixen a z usant `NORM_MEAN` derivat d'IPIP-NEO (Johnson 2014), on per exemple `NORM_MEAN.N = 2.8` i `NORM_MEAN.A = 3.9`.

Conseqüència: un witness perfectament neutre (mai escull el mateix adjectiu com a millor i pitjor) produirà un raw 3.0 a Depth, que es convertirà en `(3.0 - 2.8) / 0.72 ≈ +0.28 z` — apareixerà com a "lleugerament alt en Depth". Per a Bond el biaix és invers: `(3.0 - 3.9) / 0.58 ≈ -1.55 z` — apareixerà com a "molt baix en Bond". A la pràctica, qualsevol grup de witnesses produirà sistemàticament:

- **Depth**: witness ≈ +0.28 z respecte de self
- **Bond**: witness ≈ −1.55 z respecte de self
- **Vision** i **Discipline**: witness ≈ −1.17 z i −1.13 z respecte de self
- **Presence**: witness ≈ −0.42 z respecte de self

Açò viola la idea que "blind spots" siguen reals. Per ser correcte, el Witness necessita o bé el seu propi `NORM_MEAN_W`/`NORM_SD_W` (centrat a 3.0, calibrat empíricament), o una transformació calibrada self↔witness abans de la comparació.

**Fitxers:** `src/utils/witness-scoring.js` (`detectDivergence`, línies 159-174), `src/pages/FullMoonResultsPage.jsx` (línia 146 `computeRole(witnessScores)`).

### 4. 🔴 `get_group_report_data` mai aplica el Tier 1 (per llengua) del living model

```python
rows = await conn.fetch(
    """
    SELECT gm.user_id, p.first_name, p.last_name,
           r.presence, r.bond, r.discipline, r.depth, r.vision
    FROM group_members gm
    LEFT JOIN profiles p ON p.id = gm.user_id
    LEFT JOIN LATERAL (
        SELECT presence, bond, discipline, depth, vision
        FROM results WHERE user_id = gm.user_id AND instrument = 'fullMoon'
        ORDER BY created_at DESC LIMIT 1
    ) r ON true ...
    """
)
...
norm, _ = resolve_norm("fullMoon", row.get("language"), _norm_cache)
```

La consulta no inclou `r.language`, per tant `row.get("language")` retorna sempre `None` (o llança `AttributeError` perquè `asyncpg.Record` no té `.get`; cal verificar a producció). En qualsevol cas Tier 1 mai s'activa per a aquest endpoint, i les empreses amb 5–8 membres en una llengua dominant no obtindran els seus norms específics. La resta del backend (`/admin/results`, `/admin/results/export.csv`) sí que selecciona `r.language` i resol bé Tier 1.

**Fitxer:** `api/main.py` (línies 1043-1071).

### 5. 🔴 `complete_witness_session` accepta scores sense cap validació de rang

L'endpoint accepta `body.scores` (un `DomainScores` Pydantic) i el guarda directament a `witness_responses.domain_scores` sense verificar que cada valor estiga a [1, 5]. Un witness anònim podria fer un POST manual amb `presence: 99999`, contaminant les mitjanes empíriques del Living Model i — si entra en `_recompute_norms` — fent que cap usuari no obtinga rols correctes durant 28 dies (fins al pròxim refresh).

**Fitxer:** `api/main.py` (línies 340-346 i 728-731).

### 6. 🔴 `/results` no valida que els scores siguen a [1, 5] o [1, 7]

Mateix problema per a `log_result`. Els scores arriben amb `Optional[float]` i s'insereixen tal qual. Açò també afecta `_recompute_norms` (l'AVG i STDDEV es calculen sobre dades possiblement enverinades).

A més, `instrument` es valida només indirectament via `WHERE instrument IN ('newMoon','firstQuarter','fullMoon')` als reports, no a la inserció — un actor maliciós pot crear un instrument inexistent i contaminar la taula `results`.

**Fitxer:** `api/main.py` (línies 357-365 model `LogResultBody`, 544-571 endpoint).

---

## II. Vulnerabilitats de seguretat noves o latents

### 7. 🟠 Tokens d'OAuth de Google s'envien en URL del front (`/auth/callback?access_token=&refresh_token=`)

`auth.py:google_callback` redirigeix a `f"{_FRONTEND_URL}/auth/callback?access_token=…&refresh_token=…"`. Encara que `AuthCallbackPage.jsx` neteja la URL amb `replaceState` immediatament, els tokens passen per:

- Logs d'accés de Caddy a `api.cercol.team` (capçalera `Location` registrada)
- Història de navegació del navegador abans del `replaceState`
- Capçalera `Referer` cap a qualsevol script de tercers (mm-design CSS, fonts) carregat abans del `replaceState`
- Extensions del navegador i barres d'eines que llegeixen URL en `pageshow`

Pràctica recomanada: enviar un *exchange code* d'un sol ús i deixar que el frontend faça `POST /auth/exchange` amb aquest codi. Així els tokens mai surten al log del servidor o la història de navegació.

**Fitxer:** `api/auth.py` (línies 540-547), `src/pages/AuthCallbackPage.jsx` (línies 30-32).

### 8. 🟠 Sense Content Security Policy al frontend

L'antiga auditoria va marcar açò com a resolt amb una capçalera CSP a `api.cercol.team` (Caddy). Però CSP s'aplica a la pàgina que es serveix, i `cercol.team` està a GitHub Pages — el CSP del backend no té cap efecte protector sobre el frontend.

Cal afegir un `<meta http-equiv="Content-Security-Policy" content="…">` a `index.html`. Amb la xarxa actual de tercers (cap CDN d'analytics, cap script extern), una política molt restrictiva és viable: `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.cercol.team; frame-ancestors 'none'`.

**Fitxer:** `index.html`.

### 9. 🟠 `purge-tokens` no té cap planificació real — és un endpoint inert

`api/main.py` documenta:

```python
# Suggested cron (server): run daily via systemd timer or cron job:
#   curl -s -X POST https://api.cercol.team/admin/maintenance/purge-tokens \
```

…però no existeix cap timer systemd al desplegament ni cap GitHub Action que el dispare. Resultat: les taules `magic_tokens`, `refresh_tokens` i `oauth_states` creixen sense límit. Donat que cada signin emet un nou refresh token de 48 bytes amb TTL de 30 dies, una base activa pot arribar a 10⁵ files en pocs mesos.

Recomanació: afegir-lo com a workflow de GitHub Actions amb `schedule: cron: '0 4 * * *'` cridant el endpoint amb un JWT d'admin emmagatzemat com a secret.

**Fitxer:** `api/main.py` (línies 1487-1536).

### 10. 🟠 Cap endpoint del backend valida que l'usuari siga `premium` per a Full Moon ni Witness

Tota la paret de pagament és client-side:

- `FullMoonPage.jsx` consulta `getMyProfile()` i mostra paywall si `!profile.premium`
- `WitnessSetupPage.jsx` redirigeix a `/full-moon` si `!profile.premium`

Però:

- `POST /results` accepta `instrument: 'fullMoon'` sense verificar `profiles.premium`
- `POST /witness/sessions` no verifica premium
- Un usuari pot, amb `curl` i el seu propi JWT, registrar fins i tot 100 resultats Full Moon i crear sessions de witness sense pagar

ROADMAP marca Phase 15 (Stripe paywall) com a "pending" però el conjunt s'anuncia ja en producció ("500 free Full Moon slots for new registrants"). El paywall és per tant una superficial, no una restricció real.

**Fitxers:** `api/main.py` (`log_result` línia 544, `create_witness_sessions` línia 621), ROADMAP.md (línia 1268).

### 11. 🟠 `/results` no usa rate-limit per usuari, només per IP

`@limiter.limit("30/minute")` aplica per IP via `slowapi`. Un actor maliciós amb diversos comptes a la mateixa IP pot acumular `30 × n_comptes/minut` resultats. Combinat amb el problema #6 (sense validació de rang), açò degrada `_recompute_norms` ràpidament.

**Fitxer:** `api/main.py` (línies 544-545), `api/limiter.py`.

### 12. 🟠 `_FRONTEND_URL`/`_BACKEND_URL` per defecte exposen el subdomini real, però `JWT_SECRET=""` per defecte permet arrencar el servidor amb tokens ESM previsibles

```python
_JWT_SECRET = os.environ.get("JWT_SECRET", "")
```

Si l'env var no està definida, el servei s'alça i tots els JWT es signen amb la cadena buida. `jose.jwt.encode("", algorithm="HS256")` no llança error (la majoria de JWT libraries permeten clau buida amb HS256). Cal afegir un check fail-fast al startup: `if not _JWT_SECRET: raise RuntimeError("JWT_SECRET must be set")`.

**Fitxers:** `api/main.py` (línia 234), `api/auth.py` (línia 44), `api/blog.py` (línia 25).

### 13. 🟡 `withCredentials` als CORS però mai s'usen cookies

`CORSMiddleware(allow_credentials=True, allow_origins=[...], allow_methods=["*"], allow_headers=["*"])`. El frontend mai envia cookies (els tokens van per `Authorization: Bearer`). `allow_credentials=True` no aporta res però amplia la superfície d'atac (combinat amb `*` aux mètodes i capçaleres exposa més). Recomanació: `allow_credentials=False` i llistes explícites.

**Fitxer:** `api/main.py` (línies 213-219).

### 14. 🟡 Capçaleres de seguretat HTTP no documentades a Caddy

Encara que s'esmenta CSP a Caddy, no hi ha visibilitat a aquest repo de què hi ha exactament al `Caddyfile` del servidor (HSTS, X-Content-Type-Options, X-Frame-Options, Permissions-Policy, Referrer-Policy). Cal commitejar una còpia versionada del `Caddyfile` (o dels relevant snippets) a `api/deploy/` perquè la configuració de seguretat siga revisable.

---

## III. Coherència entre documentació i codi

### 15. 🟠 SCIENCE.md encara descriu Supabase com a sistema d'emmagatzemament del feedback (5 ocurrències)

Després de la fase 14.5 cap dada s'emmagatzema a Supabase, però SCIENCE.md continua dient (línies 293, 322, 346, 367, 393):

> "Feedback is stored in Supabase with `language: 'ca'` and reviewed…"

A més, l'endpoint que rebria aquest feedback no existeix (`utils/translationFeedback.js` és literalment `return false`). Doble incoherència: la infraestructura citada no s'usa i la funcionalitat citada no està implementada.

**Fitxer:** `SCIENCE.md` (línies 293, 322, 346, 367, 393).

### 16. 🟠 `api/.env.example` encara documenta `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` però no `JWT_SECRET`, `DATABASE_URL`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`/`SECRET`

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
…
# Set by Railway automatically — do not define manually
# PORT=8000
```

Cap d'aquestes variables s'usa al codi actual (`grep -r SUPABASE api/` retorna només l'`.env.example`). Pitjor: les variables reals que cal definir mai s'esmenten. Un mantenidor nou que seguisca `.env.example` no podrà arrencar el backend.

**Fitxer:** `api/.env.example`.

### 17. 🟠 `scripts/seed_dummy_team.py` i `scripts/clear_dummy_team.py` són tot Supabase-only — codi mort

Tots dos scripts importen `supabase-py` i usen `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`. La fase 14.5 va eliminar Supabase del runtime però aquests scripts no es van migrar. No són referenciats per cap test ni workflow. Si algú els executa avui, no funcionaran.

**Fitxers:** `scripts/seed_dummy_team.py`, `scripts/seed_dummy_team.sql` (referencia a `supabase/migrations/`), `scripts/clear_dummy_team.py`, `scripts/clear_dummy_team.sql`.

### 18. 🟡 ROADMAP fase 14 descriu Supabase com a backend d'`onboarding_seen`

> "Visibility controlled by `profile.onboarding_seen` (Supabase) + `localStorage` fallback."

La fase 14.5 (que ve immediatament després) elimina Supabase. La descripció de la fase 14 hauria d'actualitzar-se per reflectir l'estat final del codebase, no l'estat al moment de l'implementació.

**Fitxer:** `ROADMAP.md` (línia 1145).

### 19. 🟡 CLAUDE.md menciona `api/railway.toml` com a fitxer existent però no existeix

> `railway.toml   # Legacy Railway deployment config — NOT the active deployment (Hetzner is)`

`ls api/` no mostra cap `railway.toml`. Estructura de fitxers obsoleta a CLAUDE.md.

**Fitxer:** `CLAUDE.md` (línia 122).

### 20. 🟡 CLAUDE.md menciona `supabase-keepalive.yml` com a eliminat però la ROADMAP encara descriu la Phase 13.25 com a `✅ COMPLETE`

ROADMAP línies 1116-1118 documenten la Phase 13.25 com a completada amb un cron de keep-alive a Supabase. Aquesta fase és funcionalment incoherent amb la fase 14.5 que ve després (eliminació total de Supabase). La fase 13.25 hauria de marcar-se com a "obsoleted by 14.5" o similar, no deixar-la com a `✅ COMPLETE` quan ja no aporta res.

**Fitxer:** `ROADMAP.md` (línies 1116-1118, 1163).

### 21. 🟡 ROADMAP cita constantment "Phase X" pendents que ja són productive (`Phase 13.23 — k-means centroid update`)

La línia 1108 de ROADMAP marca la Phase 13.23 sense l'emoji `✅`. Però la Phase 13.20 (línia 1080) marca el Living model com a `✅ COMPLETE` — incloent la "k-means centroid update" implícita a les revisions trimestrals. Caldria triar: o tancar 13.23 com a obsoleta/ja inclosa, o documentar exactament què hi falta.

**Fitxer:** `ROADMAP.md` (línia 1108).

### 22. 🔵 CLAUDE.md línia 144: `db/   # PostgreSQL migrations (001–012; was supabase/ before Phase 14.5)` — actualment és 001–014

Existeixen `013_blog_posts.sql` i `014_blog_seed.sql`. La descripció documental no s'ha mantingut.

**Fitxer:** `CLAUDE.md` (línia 144).

### 23. 🔵 CLAUDE.md línia 137: `locales/  # i18n translation files (en.json, ca.json, …) — 889 keys × 6 languages`

Comptatge actual: 993 claus a `en.json`. La xifra és estale.

**Fitxer:** `CLAUDE.md` (línia 137).

---

## IV. Funcionalitats a mig fer / mig trencades

### 24. 🟠 `category` i `complexity` al blog: codi referencia columnes que cap migració no crea

`api/blog.py` selecciona `category, complexity` a `list_posts`, `get_post`, i `_row_to_post`. `BlogIndexPage.jsx` les llegeix i fa filtres. Però `db/migrations/013_blog_posts.sql` no inclou aquestes columnes, i no hi ha cap `014`/`015` que faça `ALTER TABLE blog_posts ADD COLUMN category` o `ADD COLUMN complexity`. Existeixen només a producció (es van afegir manualment).

A més, els endpoints `create_post` (`POST /blog`) i `update_post` (`PUT /blog/{slug}`) tenen `RETURNING ... view_count` (sense `category, complexity`) però `_row_to_post(row)` llig `row["category"]` i `row["complexity"]` — això produeix `KeyError` a Python (un `record["x"]` que no existeix llança). Per tant qualsevol acte d'admin de crear o editar un post falla amb 500.

**Fitxers:** `api/blog.py` (línies 65-81, 192-211, 244-255), `db/migrations/013_blog_posts.sql`.

### 25. 🟠 `translationFeedback.js` és un *no-op* permanent

```js
export async function sendTranslationFeedback(_payload) {
  return false
}
```

`FeedbackButton.jsx` mostra el botó "Suggest translation" en totes les llengües no anglesa. Quan l'usuari escriu una suggerència i prem "Submit", el component "tanca silenciosament" la finestra. L'usuari pensa que ha enviat alguna cosa que no ha rebut ningú. Cal:

- Implementar l'endpoint i la migració, **o**
- Eliminar el botó completament fins que estiga implementat

L'estat actual (botó visible + feedback silenciosament descartat) és l'única cosa pitjor que cap dels dos.

**Fitxers:** `src/utils/translationFeedback.js`, `src/components/FeedbackButton.jsx` (línies 76-79).

### 26. 🟠 El paywall de Stripe és un esquelet (com ja s'ha vist a #10)

ROADMAP Phase 15 marca explícitament "Stripe paywall" com a pendent: "Define which features are gated", "Backend enforcement on gated endpoints", "Admin dashboard: premium conversion metrics". L'únic que existeix avui és:

- `POST /checkout` (crea Session de Stripe) — funciona
- Webhook que activa `profiles.premium = true` — funciona
- Una IU client-side que mostra paywall

…però sense cap enforcement real al backend. La promoció "500 Free Full Moon slots" maquilla aquest estat: el comportament actual és exactament "tot és gratis si saps usar curl".

### 27. 🟡 `/admin/maintenance/purge-tokens` definit però mai cridat

Vegeu #9.

### 28. 🟡 Endpoints d'admin per a usuaris (`PATCH /admin/users/{id}`) mai usat al frontend

`patchAdminUser` està exportat a `lib/api.js` i el dashboard d'admin en fa servir per togle premium. Però el cas ja documentat per CSV només existeix per a usuaris reals; no hi ha UI per veure les sessions de witness pendents/completes des d'admin, ni per editar perfils més enllà de premium/admin. No és un bug, és funcionalitat parcial.

### 29. 🟡 `npm run build:full` no regenera el sitemap

```json
"build":      "node scripts/generate-sitemap.mjs && vite build",
"build:full": "vite build && node scripts/prerender.mjs"
```

`build:full` (executat per `deploy-frontend.yml`) salta `generate-sitemap.mjs`. Els nous articles del blog no apareixen al sitemap fins que algú executa manualment `npm run build`. Símptoma observable: `public/sitemap.xml` apareix com a "modified" al `git status` (i de fet ho està ara mateix al `main`).

**Fitxer:** `package.json`, `.github/workflows/deploy-frontend.yml`.

### 30. 🟡 `?lang=` als URLs del sitemap però el frontend no llig el paràmetre

`scripts/generate-sitemap.mjs` produeix entrades com `https://cercol.team/?lang=ca`. `index.html` també afig `<link rel="alternate" hreflang="ca" href="…?lang=ca">`. Però `src/i18n.js` només mira `localStorage` i `navigator.language` — mai `URLSearchParams`. Per tant les URL `?lang=ca` mostraran anglès al primer renderitzat (i el text final dependrà del `localStorage` del visitant). Google indexarà la URL "ca" com a anglès → conflicte d'hreflang i pèrdua de SEO multilingüe.

**Fitxers:** `src/i18n.js`, `scripts/generate-sitemap.mjs` (línia 33), `index.html` (línies 36-42).

### 31. 🔵 `userId` paràmetre de `logResult` és sempre ignorat

`logger.js` accepta `userId` però el comentari indica "no longer needed — the backend reads the user ID from the JWT". Tots els crides al wrapper li passen un valor (`user?.id ?? null`) que mai s'usa. Caldria eliminar-lo de la signatura per evitar confusió.

**Fitxers:** `src/utils/logger.js`, `src/pages/NewMoonResultsPage.jsx`, `src/pages/FirstQuarterResultsPage.jsx`, `src/pages/FullMoonResultsPage.jsx`.

---

## V. Patrons heterogenis i deute arquitectònic

### 32. 🟠 `navigate('/')` durant render torna a `FirstQuarterResultsPage` — regressió de la fase 13.19

La fase 13.19 va corregir aquest patró a `NewMoonResultsPage` (correctament: `useEffect(() => { if (!scores) navigate('/') }, [])`). `FirstQuarterResultsPage` encara té (línies 54-57):

```jsx
if (!domains) {
  navigate('/')
  return null
}
```

A `StrictMode` (activat a `main.jsx`) això provoca dues navigacions consecutives en mode dev. A producció no és un bug funcional crític, però és la mateixa regressió que ja es va corregir.

`FullMoonResultsPage` està bé (usa `useEffect`).

**Fitxer:** `src/pages/FirstQuarterResultsPage.jsx` (línies 54-57).

### 33. 🟠 SVG inline fora de `MoonIcons.jsx` — cinc casos no documentats

CLAUDE.md prohibeix SVG inline excepte el logo de Google a `AuthPage.jsx`. Casos detectats:

| Fitxer | SVG | Motiu |
|--------|-----|-------|
| `src/components/Layout.jsx` (línies 28-39) | Chevron del menú desplegable | Hauria de ser `<ChevronIcon>` a mm-design |
| `src/pages/FaqPage.jsx` (línies 23-33) | Chevron del `<details>` | Mateix |
| `src/pages/blog/BlogArticlePage.jsx` (línies 420-428) | Info icon dels avisos d'idioma | Cal `<InfoCircleIcon>` (ja existeix a MoonIcons) |
| `src/pages/AdminDashboardPage.jsx` (línia 226) | `Sparkline` polyline component | Justificable (és un gràfic, no una icona) però hauria de viure a `src/components/Sparkline.jsx` |
| `src/components/CercolLogo.jsx` (línies 7-…) | Logo principal | Ja és la implementació canònica del logo, però hauria de venir de mm-design (com els altres icones) |

**Recomanació:** afegir `ChevronIcon` (i tipus `down`/`up`/`left`/`right` segons preferència) a mm-design i refactoritzar `Layout.jsx` + `FaqPage.jsx` perquè en facen ús.

### 34. 🟡 `colors hardcoded` retorna a `AdminDashboardPage.jsx`

```jsx
function Sparkline({ data, color = '#0047ba', days = 30 }) { ... }
…
<Sparkline data={activity.registrations} color="#0047ba" days={30} />
<Sparkline data={activity.results}        color="#427c42" days={30} />
```

`#0047ba` i `#427c42` són tokens del sistema (`colors.blue`, `colors.green`). La fase 13.19 els va eliminar de pàgines client; `AdminDashboardPage` (afegit a la fase 13.21, posterior) no va seguir la convenció.

**Fitxer:** `src/pages/AdminDashboardPage.jsx` (línies 200, 307, 316).

### 35. 🟡 `_BLUE`, `_RED`, `_DARK`, `_GRAY`, `_LIGHT`, `_WHITE` hardcoded a `api/emails.py`

```python
_BLUE   = "#0047ba"
_RED    = "#cf3339"
_DARK   = "#111111"
_GRAY   = "#6b7280"
```

És cert que els correus electrònics requereixen CSS inline i no poden referenciar tokens del navegador, **però** aquests valors han de continuar coincidint amb mm-design. No hi ha cap test que ho garantisca: si un dia algú actualitza la paleta de mm-design (`#cf3339` → `#d8333a`), els emails quedaran amb la paleta antiga sense que cap CI ho detecte.

Recomanació: afegir un script `scripts/check_email_palette.py` al `ci.yml` que llegeix els valors de `mm-design/tokens/colors.css` i els compara amb les constants d'`emails.py`.

**Fitxer:** `api/emails.py` (línies 47-52).

### 36. 🟡 ErrorBoundary mostra text en anglès hardcoded

```jsx
<p className="text-gray-500 text-sm">Something went wrong. Please reload the page.</p>
<button …>Reload</button>
```

Passa per damunt de la regla d'i18n. Si l'error es produeix abans que `i18next` arrenque, no es pot usar `t()` de manera segura, però es pot mostrar el text en la llengua del navegador (`navigator.language.startsWith('ca')` etc.) com fa `i18n.js`.

**Fitxer:** `src/App.jsx` (línies 70-86).

### 37. 🟡 `console.log` de debug a `LastQuarterPage.jsx` (gated by `import.meta.env.DEV`, però…)

```jsx
if (import.meta.env.DEV && groupMeans) {
  console.log('[LastQuarter] group mean z-scores:', { ... })
  console.log('[LastQuarter] balance flags:', { ... })
}
```

És correcte que estiga *gated*, però hauria de ser una utilitat de logger reutilitzable (`debugLog`), no `console.log` cru repetit a múltiples pàgines (`AdminDashboardPage` també en té).

**Fitxers:** `src/pages/LastQuarterPage.jsx` (línies 360-376), `src/pages/AdminDashboardPage.jsx` (línies 174, 356).

### 38. 🟡 `MIN_WITNESSES_FOR_REPORT` viu local a `FullMoonResultsPage`, no a `share-url.js` o un `constants.js`

Vegeu finding 31 de l'informe v1 ("constants màgiques"). Encara que la fase 13.19 va exportar `STRUCTURAL_RISK_THRESHOLD` i `PRIMARY_THRESHOLD`, encara hi ha llindars no centralitzats:

- `MIN_WITNESSES_FOR_REPORT = 2` (FullMoonResultsPage.jsx:35)
- `BETA_TOTAL = 500` (api/main.py:286)
- `MAX_POLL_ATTEMPTS`, `POLL_INTERVAL_MS` (FullMoonPage.jsx)
- `_ACCESS_TTL = 1h`, `_REFRESH_TTL = 30d`, `_MAGIC_TTL = 15min` (auth.py)
- `divergence threshold = 0.8` (witness-scoring.js, hardcoded magic number)

Recomanació: un fitxer `src/config/constants.js` (frontend) i `api/config.py` (backend) que aplegue tot allò que no és secret però sí calibrat.

### 39. 🔵 `AdminDashboardPage.jsx` és 1184 línies — manca dividir-lo

El segon fitxer més gran del projecte. Conté `Sparkline`, panells d'usuaris, panells de resultats, panell de norms, panell d'activitat, modals de confirmació… Caldria dividir-lo en `pages/admin/{Stats,Users,Results,Norms,Activity}.jsx` i una pàgina contenidor que els compose.

**Fitxer:** `src/pages/AdminDashboardPage.jsx`.

### 40. 🔵 `index-*.js` chunk principal pesa 555 kB (gzip 176 kB) després de tota la fragmentació

Les pàgines individuals són 5–34 kB. Però el chunk principal (que conté `App.jsx`, `Layout`, `AuthContext`, `i18n` i les locales) és força gran. Potser les locales (993 keys × 6 idiomes = 5958 entrades) es podrien carregar dinàmicament només per a l'idioma actiu.

Recomanació: investigar `i18next-http-backend` o `import.meta.glob('./locales/*.json', { import: 'default' })` amb dynamic imports.

### 41. 🔵 `vendor-*.js` chunk al voltant de 444 kB (138 kB gzip) — `recharts` és el sospitós principal

Recharts pesa molt. Es fa servir només a `RadarChart.jsx` (i potser `Sparkline` no ho usa). Caldria fer `lazy import` només quan es renderitza un report.

### 42. 🔵 Mixed async patterns: `try/catch` vs `.then().catch()` dins el mateix component

`FullMoonResultsPage.jsx` mescla `await` amb `.then(setSessions).catch(() => {})`. `AuthCallbackPage.jsx` també. Cap és incorrecte, però la inconsistència fa la lectura més lenta.

---

## VI. Sistema multilingüe

### 43. 🔴 Adjectius del Witness només en anglès i català — falten 4 idiomes

`src/data/witness-adjectives.js` defineix 100 adjectius, cadascun amb `en`, `ca`, i un `tip` amb `en`/`ca`. **Cap entrada té `es`, `fr`, `de` o `da`.** `WitnessPage.jsx` té (línies 42, 47):

```jsx
const tipText = lang === 'ca' ? adj.tip?.ca : adj.tip?.en
…
{lang === 'ca' ? adj.ca : adj.en}
```

Resultat: si l'usuari té el navegador en alemany, francès, danès o castellà, els adjectius es mostraran en anglès. La pàgina té `t('witness.page.…')` traduït a 6 idiomes per a la resta de la UI però els adjectius — el cor mateix de l'instrument — només hi ha en 2.

**Fitxers:** `src/data/witness-adjectives.js`, `src/pages/WitnessPage.jsx` (línies 42, 47).

### 44. 🟡 Una clau missing a `ca.json`: `nav.admin`

Comparant `en.json` (993 claus) amb `ca.json` (992): falta `nav.admin`. Probablement caigué durant la Phase 15.5.11.

**Fitxer:** `src/locales/ca.json`.

### 45. 🟡 `i18n.js` autodetecció: la docstring diu "fr → FR, de → DE, ca → CA, es → ES, else EN" però el codi també detecta `da`

```js
const browser = navigator.language?.startsWith('fr') ? 'fr'
              : navigator.language?.startsWith('de') ? 'de'
              : navigator.language?.startsWith('ca') ? 'ca'
              : navigator.language?.startsWith('es') ? 'es'
              : navigator.language?.startsWith('da') ? 'da'
              : 'en'
```

La docstring no esmenta `da`. Petit, però l'autodetecció és exactament el component que algú revisaria si un visitant danès es queixa.

**Fitxer:** `src/i18n.js` (línies 4-10, comentari).

### 46. 🟡 No es prioritza `ca` davant d'`es` per a navegadors `ca-ES` i ja està bé, però…

La heurística actual fa la coincidència en l'ordre `fr → de → ca → es → da`. Un navegador amb `Accept-Language: ca-ES,es;q=0.9,en;q=0.8` rep `ca` correctament. Però un navegador `es-ES,en;q=0.9` rep `es` (correcte). Cap problema.

**No cal acció.** Documentat només per completesa de l'auditoria del sistema multilingüe.

### 47. 🟡 Articles del blog: la majoria només estan en anglès

ROADMAP Phase 15.5.8 anuncia que UN article (`self-other-agreement-big-five-where-gaps-are-biggest`) ha estat traduït a tots 6 idiomes. Resta 103 articles només en anglès. `BlogArticlePage.jsx` mostra un avís d'anglès quan l'idioma no coincideix, però l'experiència multilingüe del blog és essencialment monolingüe. Açò és coherent amb l'estat documentat però val la pena recordar-ho com a deute pendent de la fase 15.5.5 ("Distribution") per a llengües minoritàries.

**No és un bug.** Cal decisió estratègica sobre priorització.

### 48. 🔵 Email translations: les 6 llengües estan totes presents per a magic_link, witness_assigned, witness_completed, group_invitation. Cap regressió.

---

## VII. Tests i CI

### 49. 🟠 Tests crítics del Witness encara no escrits — alineat amb el deute previ però no resolt

L'auditoria v1 va flaggar 5 funcions sense tests. La fase 13.19 va escriure tests per `computeFQ/FMScores` (via `scoring-utils`), per `_compute_role` (Python), però NO per:

- `buildRounds` — el cor de l'algorisme del Witness; cap test verifica la propietat de no-repetició dins d'una polaritat o el patró 14P/6N
- `computeCombinedRole` — la fórmula 2/3 self + 1/3 witness mai testejada
- `computeConvergence` — Jaccard similarity sobre rol+arc, mai testejada
- `averageWitnessScores` — mai testejada
- `encodeScores`/`decodeScores` — round-trip mai testejat
- `zscoresToRaw` — la conversió inversa mai testejada (ni el clamp)

**Fitxer:** `src/utils/__tests__/witness-scoring.test.js` només cobreix `computeWitnessScores` i `detectDivergence`.

### 50. 🟠 Cap test integra frontend ↔ backend equivalent algorithmic

L'únic punt on backend i frontend han de produir EXACTAMENT el mateix resultat (rol per a un perfil donat) no té cap test que ho verifique. El finding #1 i el #2 d'aquest informe són conseqüència directa d'aquesta absència. Cal:

- Un fitxer de "vectors d'oracle" `tests/role-oracle.json` amb 50–100 perfils i el rol esperat
- Un test JS que els carregue i comprove
- Un test Python que els carregue i comprove
- CI fa fallar si cap dels dos ix d'acord amb l'altre

### 51. 🟡 No hi ha tests E2E ni d'integració per al fluxe de pagament (Stripe checkout → webhook → premium)

És entenent que Stripe és difícil d'unitestejar, però existeix `stripe-cli` per simular webhooks. El webhook actual no té cap test que verifique:

- Signature válida → `premium=true`
- Signature invàlida → 400
- `client_reference_id` desconegut → no falla, no estableix premium

**Fitxer:** `api/main.py` (línies 594-614). Cap test relacionat.

### 52. 🟡 `eslint.config.js` està definit però no s'executa en CI

`package.json` defineix `"lint": "eslint ."`, però `ci.yml` no crida `npm run lint`. Una regla d'ESLint trencada (per exemple `react-hooks/exhaustive-deps`) no fa fallar la build.

**Fitxer:** `.github/workflows/ci.yml`.

### 53. 🟡 `pytest-asyncio` instal·lat però no usat: cap test és async

`pip install pytest pytest-asyncio httpx` al CI, però `api/tests/test_scoring.py` només prova funcions síncrones pures. Tot el comportament real (queries, transactions, webhooks) està sense tests. Per a un repo que es defineix "open source amb fonament científic", la cobertura del backend és insuficient.

**Fitxer:** `.github/workflows/ci.yml` (línia 75), `api/tests/`.

### 54. 🔵 La sanity check de bundle (`grep -ql "$COLOR" dist/assets/*.js`) és fràgil

Si mm-design renomena els tokens o decideix passar a `oklch()`, els hex strings hexadecimals s'escapen. La protecció actual només cobreix el cas exacte de hex literal a la sortida — no protegeix contra `var(--mm-color-blue)` substituït per `var(--brand-primary)`, ni contra que la classe Tailwind `bg-blue-700` substituïsca el token sense que ningú se n'adone.

---

## VIII. Performance i mètriques

### 55. 🟡 Locales sempre carregades en un sol bundle a l'arrel

Vegeu #40. `src/i18n.js` `import` cadascun dels 6 fitxers. Total: ~993 keys × 6 = ~5958 strings × ~50 bytes = ~300 kB descomprimits. Per a un visitant danès, només necessita `da.json` i `en.json` (fallback). Càrrega dinàmica reduiria fàcilment 80–120 kB del bundle inicial.

### 56. 🟡 `recharts` carregat en el chunk de vendor però només usat en pàgines de resultat

`recharts` ≈ 70 kB gzip. Es podria mou a una `chunk` que es carrega només quan es navega a `/full-moon/results`, `/first-quarter/results`, `/groups/:id`. Vegeu finding #41.

### 57. 🟠 `_recompute_norms` queda silenciosament en pause si la primera invocació del cicle de fons llança una excepció diferent de la primera

```python
async def _norm_refresh_loop():
    interval = NORM_REFRESH_DAYS * 24 * 60 * 60
    while True:
        await asyncio.sleep(interval)
        try: await _recompute_norms()
        except Exception as exc: print(f"…")
```

En realitat el `try/except` cobreix bé el cas de fallada, però `print()` no s'enregistra a un sistema d'observabilitat real (Hetzner systemd journal, sí, però sense alerta). Si `_recompute_norms` falla 3 mesos seguits perquè un canvi a la BD trenca la consulta, ningú no se n'adonarà.

**Fitxer:** `api/main.py` (línies 151-161).

### 58. 🟡 `BetaBanner` fa `getBetaStatus()` a CADA muntatge del Layout

`BetaBanner.jsx` crida `getBetaStatus()` a `useEffect([])`. Si l'usuari navega entre 4 pàgines, fa 4 queries `SELECT COUNT(*) FROM profiles WHERE is_beta = TRUE`. La sol·licitud és barata però predictible — caldria un mateix sessionStorage cache de 5 min.

### 59. 🔵 Prerendering: 7 rutes prerenderitzades (homepage + 6 docs). El blog mai ha estat prerenderitzat per CI (decisió documentada a 15.5.10). Cap acció recomanada.

---

## IX. Accessibilitat i UX

### 60. 🟡 Buttons de paywall no tenen `aria-busy` durant la creació de Stripe Checkout

`FullMoonPage.jsx` mostra `setCheckoutLoading(true)` però el `<Button>` actual només deshabilita; no exposa `aria-busy="true"`. Lectors de pantalla no comuniquen l'estat carregant a l'usuari.

### 61. 🔵 `WitnessPage` no és accessible per teclat per al toggle best/worst

Els adjectius es seleccionen amb `<button onClick=…>` però l'estat (best vs worst vs neutral) només es comunica per color (verd/vermell). Cap `aria-pressed` ni `aria-label` que descriga l'estat actual. Els usuaris amb només lector de pantalla no poden distingir els tres estats.

**Fitxer:** `src/pages/WitnessPage.jsx` (línies 44-48).

### 62. 🔵 Cap `<noscript>` al `index.html`

Si JavaScript falla o està desactivat, l'usuari veu només la pantalla blanca.

---

## X. Observacions menors / qualitat

### 63. 🔵 `_doRefresh` retorna `null` enlloc de llançar — pot amagar problemes de xarxa

`api.js:_doRefresh` fa `try { … } catch { return null }`. El `catch` no diferencia entre 401 (refresh expirat) i `fetch failed` (xarxa caiguda). Tots dos es propaguen com a `Session expired` a l'usuari. Caldria distingir-los per a una millor UX (mostrar "Reintenta" davant d'un error de xarxa, però "Inicia sessió de nou" davant d'una expiració real).

**Fitxer:** `src/lib/api.js` (línies 25-41).

### 64. 🔵 `dist/` està inclòs al repo (segons `ls`), però hauria d'estar al `.gitignore`

`dist/` és l'artefacte de build que CI/Pages publica. Si es committeja, qualsevol membre del repo pot veure assets antics. Comprovat: `.gitignore` no inclou `dist/`.

**Fitxer:** `.gitignore`.

### 65. 🔵 `OnboardingModal` és gestionat per `localStorage` + `profile.onboarding_seen` — duplicat sense font de veritat clara

`AppContent` (App.jsx) decideix mostrar el modal si NI `profile.onboarding_seen` NI `localStorage.cercol_onboarding_seen` són `true`. La inversa: marquem només localStorage si el backend falla. Però si l'usuari neteja `localStorage` i el seu perfil mai s'ha sincronitzat amb un POST `PATCH /me/profile`, veurà el modal de nou (a pesar d'haver-lo descartat). Aquesta lògica funciona però mereix una nota a la documentació o un test.

### 66. 🔵 `PageLoader` no té `role="status"` ni `aria-live`

`<PageLoader />` mostra un spinner però els lectors de pantalla no anuncien "Loading". Mileage may vary; recomanació menor.

### 67. 🔵 `ProfilePage` no té cap test

Cap test de Vitest cobreix interaccions de `ProfilePage` (canvi d'idioma, edició de password, marca onboarding com a vist). Crit fluxes en producció.

### 68. 🔵 Variables locals d'Stripe a `api/main.py` no s'usen a `auth.py` ni `blog.py` però sí que hi ha `stripe.api_key` a `main.py`

Cap dels endpoints d'`auth.py` o `blog.py` necessita Stripe, així doncs no és un bug. Mencionat només perquè el README/`.env.example` ha de deixar clar quines variables són per a quin mòdul.

### 69. 🔵 Comentaris en català vs anglès mesclats

CLAUDE.md diu "Comments and docstrings always in English". Però:

- `team-narrative.js`: la majoria de comentaris estan en anglès, però algunes notes locals en català ("// La heurística…")
- `WitnessPage.jsx`: comentaris essencialment en anglès
- `LastQuarterPage.jsx`: meitat anglès meitat català

No hi ha cap comentari en valencià (això seria coherent amb la regla actual). Petita incoherència.

### 70. 🔵 `i18n` fallback és `'en'` però la persistència a localStorage és la primera opció — un usuari que canvie d'ordinador veurà el mateix idioma "saved" i no la seua llengua del navegador

Comportament intencionat però val la pena documentar-lo a `i18n.js` per a futurs mantenidors.

### 71. 🔵 `tests/__init__.py` és buit i només existeix per a `pytest` — innecessari amb `pytest>=8`. Cap canvi obligatori.

### 72. 🔵 `MoonIcons.jsx` és un re-export shim — funciona, però l'IDE pot mostrar-hi avisos de "imported but never used" si mm-design canvia API

---

## XI. Trobades transversals al stack

### 73. 🟠 `share-url.js encodeScores` no codifica el nom de l'instrument — un link compartit de New Moon es pot "copiar" a Full Moon

Si un usuari comparteix `?r=BASE64` des de `/new-moon/results` i un destinatari el pega a `/full-moon/results`, la URL `decodeScores` produeix valors a [1,7] (escala TIPI) que es renderitzaran erròniament a [1,5] (escala IPIP-NEO). Cal incloure un prefix d'instrument en l'encoding o un check d'escala.

**Fitxer:** `src/utils/share-url.js`.

### 74. 🟠 `OnboardingModal` apareix a usuaris pre-existents si el perfil mai s'ha actualitzat amb la migració 011

Migració `011_onboarding_seen.sql` afig `onboarding_seen BOOLEAN NOT NULL DEFAULT FALSE`. ROADMAP afirma "Existing users backfilled to TRUE so the modal only appears for genuinely new accounts" — però la migració mateixa no fa el backfill explícit (només estableix DEFAULT per a noves files, no actualitza files existents). Cal verificar si es va fer manualment. Si NO es va fer, alguns usuaris veuran el modal incorrectament.

**Fitxer:** `db/migrations/011_onboarding_seen.sql`.

### 75. 🔵 Migracions sense `IF NOT EXISTS` ni `BEGIN/COMMIT`

`db/migrations/*.sql` són SQL crus sense control de re-execució. Si un mantenidor aplica una migració dues vegades per error, llançarà una excepció. Cal tot al menys un sistema de tracking de migracions (`schema_migrations` table) que açò aprèn ja a la fase de validació científica.

---

## XII. Recompte global

```
🔴 CRÍTICS (8)
   1. Centroids del backend divergeixen del frontend (regressió 13.19)
   2. Tests Python no detecten la divergència de centroids
   3. detectDivergence aplica IPIP-NEO NORM al Witness (biaix sistemàtic)
   4. get_group_report_data mai aplica Tier 1 del living model
   5. complete_witness_session no valida rang de scores
   6. /results no valida rang de scores ni nom d'instrument
  43. Adjectius del Witness només en EN+CA (4 idiomes en falta)

🟠 GREUS (16)
   7. OAuth tokens en URL del front-end (logs/history)
   8. Sense CSP a index.html (sols a Caddy del backend)
   9. purge-tokens cron mai planificat
  10. Cap enforcement backend de premium (paywall purament UI)
  11. /results rate-limit només per IP, no per usuari
  12. JWT_SECRET="" per defecte sense fail-fast
  13. CORS allow_credentials=True innecessari
  14. Capçaleres de seguretat HTTP no versionades
  15. SCIENCE.md descriu Supabase 5 vegades
  16. api/.env.example obsolet (sense JWT_SECRET ni DB_URL)
  17. seed_dummy_team i clear_dummy_team són Supabase-only
  24. Columnes blog category/complexity sense migració + create/update fan KeyError
  25. translationFeedback.js és un no-op però el botó es mostra
  26. Stripe paywall és esquelet (Phase 15 pendent)
  32. navigate('/') durant render torna a FirstQuarterResultsPage
  33. SVG inline a 5 fitxers fora de MoonIcons
  49. Tests crítics del Witness encara no escrits (buildRounds, etc.)
  50. Cap test garantitza paritat backend↔frontend
  57. _recompute_norms falla silent (sols print)
  73. encodeScores no inclou nom d'instrument
  74. Modal d'onboarding pot aparèixer a usuaris vells si no es va fer backfill

🟡 IMPORTANTS (20)
  13, 14, 18-23, 27-31, 34-38, 44-47, 51-53, 55-56, 58, 60

🔵 QUALITAT (16)
  39-42, 48, 54, 59, 61-72, 75
```

Total: **~70 troballes numerades**, distribuïdes en 12 àrees temàtiques.

---

## XIII. Decisions estratègiques pendents

Aquestes són decisions que requereixen un acord humà del propietari del projecte. No tenen una resposta tècnica única; depèn de la direcció del producte.

### A. Witness — escala de calibratge

El biaix sistemàtic descrit al finding #3 té tres opcions de resolució, cadascuna amb conseqüències diferents:

1. **Mantenir l'escala 1–5 actual i recalibrar `NORM_MEAN_W`/`NORM_SD_W` empíricament** — requereix N≥200 sessions de witness completes amb el mateix subject de self-report per derivar mitjana i desviació pròpies. Si s'escull, hauria de quedar marcat a SCIENCE.md com "Witness norms (provisional)" amb data de revisió N≥200.

2. **Convertir el Witness a una escala paral·lela calibrada teòricament** — això és el que es fa avui implícitament, però amb les NORM_MEAN del self. Caldria documentar-ho clarament: "Witness scores are reported on the IPIP-NEO scale by mathematical convention, not by empirical calibration. Divergence is therefore a *relative* indicator, not a *normative* one."

3. **Substituir l'algorisme del Witness pel mateix de FullMoon (120 ítems en escala 1–5)** — més precís però perd la idiosincràsia "forced-choice" del disseny actual.

**Pregunta al propietari:** quin és el valor científic més alt que es pot defensar avui amb les dades actuals? L'opció (1) és científicament la més rigorosa però requereix paciència; (2) és una marxa enrere parcial; (3) és un canvi de producte.

### B. Stripe paywall — què s'enforça i quan

Hi ha tres preguntes acumulades:

1. Què queda darrere del paywall? Només Full Moon? També Witness? Els grups (Last Quarter)?
2. Quina interacció amb el "500 free Full Moon slots" actual?
3. La promoció acabarà a una data fixa o quan es completen els 500?

Sense una decisió aquí, és impossible afegir l'enforcement de #10 sense trencar usuaris reals.

### C. ROADMAP — compressió de fases

L'estat actual mescla:

- Fases 1–10: detall complet (èpoques antigues)
- Fases 11–13.x: 25+ subfases amb detall complet
- Fase 13.19: Excellence (la primera auditoria, ja COMPLETA)
- Fase 13.20–13.26: subfases de millora
- Fase 14, 14.5, 15.5: epoch nou (auth pròpia, SEO)
- Fase 15, 16: pendents

**Recomanació:** comprimir Fases 1–10 i 11–13.x al format de taula de l'epoch antic; mantenir només títols + una línia per fase. Movent el detall a `docs/ROADMAP_HISTORY.md`. Així el ROADMAP actiu queda baix de ~150 línies (segons les pròpies regles del projecte) i és llegible.

Pendent també: anunciar oficialment quan s'obre l'epoch 4 (HR Suite, Phase 16).

### D. SEO multilingüe — què fer amb 103 articles només en anglès

Tres opcions:

1. **Traduir-los tots (manualment + revisió humana)** — ~100 hores de feina × 5 idiomes = 500 hores. Inviable a curt termini.
2. **Traducció automàtica + revisió** — ràpid però té el risc de degradar la qualitat. Les regles del projecte (PRODUCT.md, SCIENCE.md) prohibeixen explícitament traducció automàtica per a items de test. Per a articles de blog, podria ser acceptable amb revisió humana mínima.
3. **Mantenir només l'anglès, fer redireccions hreflang clares al fall-back** — accepta que el blog és en anglès. Modifica el sitemap perquè no presente entrades multilingüe per a articles que no existeixen.

L'opció (3) és la més honesta amb l'estat actual. L'opció (2) podria ser un cas justificable de relaxació a la regla de "no machine translation".

### E. Living model — confiança al N≥200

`NORM_MIN_SAMPLE = 200` està fixat. A maig 2026, és probable que `fullMoon` tinga ja N≥200 a totes les llengües? `/admin/norms` té la resposta. Si la resposta és "ja activa Tier 1 a tots els idiomes", llavors:

- Cal una post-fase d'auditoria empírica: comparar les norms empíriques amb les norms teòriques d'IPIP-NEO. Si la divergència és gran (per exemple, mitjana real de E = 3.0 enfront de 3.3), caldria documentar el biaix de la mostra.
- Caldria també fer una nova k-means revision dels centroids. Phase 13.23 ja ho menciona com a pendent.

### F. Llengua de comentaris i documentació

CLAUDE.md prohibeix comentaris en català/valencià, però aquest mateix informe està en valencià (per acord amb el propietari). Cal aclarir:

- Els fitxers `.md` de project-management (ROADMAP, SCIENCE, PRODUCT, SEO, CLAUDE_EXCELLENCE) — quina llengua?
- Els comentaris al codi — anglès (clar segons CLAUDE.md)
- Els missatges de commit — anglès convencional?
- Els emails transaccionals — totes 6 llengües (clar)

Ara mateix l'estat és inconsistent: la primera auditoria és en valencià, ROADMAP és en anglès, SCIENCE en anglès, els commits són en anglès, però la majoria del codi és en anglès amb illes de català.

---

*Aquest informe es va generar a la branca `audit/excellence-v2` el 10 de maig de 2026 com a punt de partida per a una possible Fase 17 — Claude Excellence v2.*
