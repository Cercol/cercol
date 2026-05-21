# Cèrcol — Exploració pre-sprint SEO observability (2026-05-21)

**Abast:** inventari read-only del repo i del VPS Hetzner per evitar duplicacions i col·lisions amb el futur sprint d'observabilitat SEO (GSC + Bing + PageSpeed + crawl logs → BigQuery → dashboards + MCP). HEAD: `1c2a1e9`. No s'ha modificat cap fitxer del repo ni cap recurs al servidor (excepte la creació d'aquest document).

---

## 1. Inventari complet de docs

Resultat de `find . -name "*.md" ...`:

| Path | LOC | Últim commit | Primera línia | Estat |
|------|-----|--------------|---------------|-------|
| `CLAUDE.md` | 210 | 2026-05-20 | `# Cèrcol — Project Brief for Claude Code` | viu |
| `PRODUCT.md` | 339 | 2026-04-10 | `# Cèrcol — Product Documentation` | viu |
| `README.md` | 188 | 2026-05-07 | `# Cèrcol — Open-Source Team Personality Assessment` | viu |
| `ROADMAP.md` | 204 | 2026-05-20 | `# Cèrcol — Roadmap` | viu |
| `SCIENCE.md` | 645 | 2026-05-11 | `# Cèrcol — Scientific Foundation` | viu |
| `SEO.md` | 330 | 2026-05-08 | `# Cèrcol — SEO & LLM Visibility Strategy` | viu |
| `api/.pytest_cache/README.md` | — | — | (cache) | ignora |
| `api/deploy/caddy/README.md` | 70 | 2026-05-20 | `# Cèrcol — Caddy snippet` | viu |
| `api/deploy/cron/README.md` | 42 | 2026-05-10 | `# Cèrcol — Cron jobs` | viu |
| `audits/full-moon-page-state-2026-05-10.md` | 381 | 2026-05-10 | `# Full Moon Results Page — State Audit (F4.1)` | puntual |
| `audits/full-moon-redesign-2026-05-10.md` | 875 | 2026-05-11 | `# FM-R.1 — Full Moon Results Page Redesign Audit` | puntual |
| `audits/witness-adjective-audit-2026-05-10.md` | 467 | 2026-05-10 | `# Witness Adjective Audit — 2026-05-10` | puntual |
| `docs/AUDIT-2026-05.md` | 283 | 2026-05-20 | `# Cèrcol — Auditoria del projecte (maig 2026)` | viu |
| `docs/AUDIT-CLOSE-2026-05-20.md` | 508 | (uncommitted, untracked al gitstatus) | `# Phase 17.2 / 17.3 / 17.4 close-out audit — 2026-05-20` | viu |
| `docs/CLAUDE_EXCELLENCE.md` | 477 | 2026-04-30 | `# Cèrcol — Informe d'auditoria cap a l'excel·lència` | recent |
| `sql/README.md` | 1 | 2026-04-14 | `Manual SQL scripts — run once in the Supabase SQL editor (not managed by supabase/migrations/).` | **stale (cita Supabase)** |

Cap document amb últim commit > 3 mesos (cutoff 2026-02-21). `sql/README.md` només té 1 línia però fa referència explícita a Supabase, que ja no s'utilitza (vegeu §3 i §15).

---

## 2. Estructura de `docs/`

```
docs/
├── AUDIT-2026-05.md
├── AUDIT-CLOSE-2026-05-20.md
├── CLAUDE_EXCELLENCE.md
└── email-signature.html
```

Cap subdirectori. No hi ha `docs/architecture/`, `docs/ops/`, `docs/history/`, `docs/adr/` ni similars. Tot són fitxers plans.

---

## 3. CLAUDE.md

Lectura completa (210 línies).

**Convencions Claude-specific:**
- Secció `## Claude Code workflow` (línies 75–85): després de cada fase, marcar `✅ COMPLETE` a `ROADMAP.md`, no modificar altres seccions, commit i push directe a `main` per disparar Actions.
- `## Patterns and pitfalls` (línies 177–210): lliçons del sprint 16–17 maig (LCP, beasties, font preloads, deploy paths, `npm install` vs `npm ci`).

**Subsistemes referenciats:**
- Stack: React+Vite (frontend), FastAPI+uvicorn+Caddy+systemd (backend), PostgreSQL 14, Resend, Google OAuth, JWT HS256.
- Caddy multi-tenant amb topquaranta (línia 17): conf.d snippets.
- mm-design extern com a font de tokens i icones.
- Pipeline de deploy: Actions per cada vertical (frontend i backend independents).

**Cross-links a altres `.md`** (línies 169–173):
- `ROADMAP.md` ✓ existeix
- `SCIENCE.md` ✓ existeix
- `PRODUCT.md` ✓ existeix
- `SEO.md` ✓ existeix

Tots els links funcionen.

**Drift detectat dins de CLAUDE.md:**
- Línia 132 cita `api/railway.toml` com a "Legacy Railway deployment config — NOT the active deployment". `find api -name "*.toml"` no retorna cap fitxer; el `railway.toml` ja **no existeix** al repo. Referència obsoleta.
- Línia 22 i 132 confirmen Supabase eliminat (coherent amb la realitat); però `sql/README.md` encara cita "Supabase SQL editor".

Cap altra referència a Supabase/Railway viva.

---

## 4. README.md

188 línies, públic. Veu de marca: brand-led + científica.

**Què documenta:**
- Posicionament (taula comparativa contra Belbin/DISC/StrengthsFinder).
- Witness peer assessment (forced-choice, blind spots).
- Taula d'instruments (4 fases lunars, preus).
- Mapping OCEAN→Cèrcol (5 dimensions amb noms propis).
- Taula de 12 rols amb perfil i frase essencial.
- Fonament científic + referències DOI completes.
- Validació lingüística per idioma (6).
- Privadesa, stack, roadmap link, licencia MIT.

**Què falta per a un nouvingut tècnic:** no hi ha secció "How to develop locally" (npm install / setup .env), tampoc menció a `db/migrations/`. Per a desenvolupador extern és thin — només descriu el producte, no el repo.

Convenció SEO (CLAUDE.md § SEO conventions): README **ha d'usar noms acadèmics**. README els usa correctament (Big Five, OCEAN, IPIP, AB5C explícitament citats).

---

## 5. ROADMAP.md — Phase 15+

Estat de cada fase ≥15:

| Fase | Estat | Notes |
|------|-------|-------|
| 15.5.1–15.5.12 | Complete (taula) — excepte 15.5.2 i 15.5.5 (marcats "still pending") | Línia 97 |
| 17 (Hygiene cleanup, 2026-05-16) | Complete | Línia 98 |
| 17.1 (Perf + SEO sprint) | Complete | Línia 99 |
| 17.2 (SEO indexability) | Complete | Línia 100 |
| 17.3 (Per-page SEO metadata 6 idiomes) | Complete | Línia 101 |
| 17.4 (Caddy snippet ownership) | Complete | Línia 102 |
| Cloudflare Pages migration | **Pending** | Línies 108–112 |
| PageSpeed retest (2–4 setmanes des de 2026-05-17) | **Pending** | Línies 116–120 |
| Phase 13.23 — k-means centroid update | **Pending** (trigger: N≥300 fullMoon) | Línies 124–126 |
| Phase 15 — Stripe paywall | **Pending** | Línies 130–138 |
| Phase 15.5.2 — `/science` public page | **Pending** | Línies 142–146 |
| Phase 15.5.5 — Distribution | **Pending** | Línies 150–154 |
| Phase 16 — HR Suite | **Pending** | Línies 158–166 |

**Search per termes específics (`grep -niE "BigQuery|GCP|SEO observability|monitoring|analytics|admin dashboard"`):**

```
ROADMAP.md:91:| 13.21 | Staff admin dashboard: Overview, Users, Results (paginated + CSV), Norms tabs. is_admin gate. |
ROADMAP.md:126:Triggered when N≥300 fullMoon results in DB. Run k-means … Admin dashboard Norms tab will expose the comparison.
ROADMAP.md:138:- Admin dashboard: premium conversion metrics
ROADMAP.md:166:- Usage analytics for HR admins: completion rates, time-to-complete, drop-off points
```

**Cap referència a "BigQuery", "GCP", "SEO observability", "monitoring"** al roadmap. Hi ha menció genèrica a "admin dashboard" (ja existeix amb 6 pestanyes — vegeu §11) i "analytics" només dins de Phase 16 HR Suite (no relacionat amb SEO).

---

## 6. Backend structure

```
api/
├── auth.py
├── blog.py
├── emails.py
├── limiter.py
├── main.py
├── scoring.py
├── requirements.txt
├── deploy/caddy/cercol-api.caddy + README.md
├── deploy/cron/cercol-purge-tokens + README.md
└── tests/
    ├── __init__.py
    ├── test_infra.py
    ├── test_role_oracle.py
    └── test_scoring.py
```

**Estructura plana** (no nested `routers/`, `services/`, `models/`, `crud/`). Tot el backend són 6 fitxers `.py` al nivell `api/`.

**FastAPI 0.115.12** (`api/requirements.txt:1`). Stack complet:

```
fastapi==0.115.12
uvicorn[standard]==0.34.2
python-jose[cryptography]==3.3.0
stripe==12.1.0
slowapi==0.1.9
asyncpg==0.30.0
resend==2.10.0
bcrypt==5.0.0
httpx==0.28.1
```

**Endpoint inventory** (`grep -rnE "@app\.|@router\."`):

- `api/auth.py` (8): magic link request/verify, password signup/signin, refresh, signout, google oauth + callback.
- `api/blog.py` (5): list, get, view, create (admin), update (admin), status patch (admin).
- `api/main.py` (29 endpoints, sobre `@app.`): health/beta, me/profile/password/results, witness, groups, stripe, **i 10 endpoints `/admin/*`**.

Endpoints admin (`api/main.py`):
```
@app.get  /admin/stats                main.py:1153
@app.get  /admin/users                main.py:1195
@app.get  /admin/norms                main.py:1250
@app.post /admin/norms/refresh        main.py:1293
@app.get  /admin/users/export.csv     main.py:1300
@app.get  /admin/results              main.py:1338
@app.get  /admin/results/export.csv   main.py:1392
@app.patch /admin/users/{user_id}     main.py:1453
@app.get  /admin/activity             main.py:1487
@app.post /admin/maintenance/purge-tokens   main.py:1526
```

**No existeixen** `api/jobs/`, `api/crons/`, `api/tasks/`, `api/cli/`, `api/admin/`. Tot l'"admin" són endpoints inline a `main.py` amb un únic depèn shared `require_admin` (vegeu §7).

---

## 7. Auth + admin

**Backend auth:** self-hosted JWT HS256 amb `JWT_SECRET` (≥32 bytes, fail-fast a l'arrencada). `api/auth.py:44-54`, `api/main.py:234-252`, `api/blog.py:25-35` — tres còpies del mateix bloc de constants JWT (`_JWT_SECRET`, `_JWT_ALGORITHM = "HS256"`, `_JWT_AUDIENCE = "authenticated"`). Coherent amb CLAUDE.md línia 20.

**Admin/staff:** sense concepte "staff" — només `is_admin: bool` a la taula `profiles`. Es promociona manualment via SQL o via `PATCH /admin/users/{user_id}` (`api/main.py:1453`, l'únic camí programat per pujar `is_admin` però aquest endpoint **ja requereix `require_admin`** → bootstrap obligatori via SQL).

**Pattern d'admin gate (`api/main.py:1129-1135`):**

```python
async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Dependency — raises 403 unless the authenticated user has is_admin = true."""
    user_id = user["sub"]
    async with _pool.acquire() as conn:
        row = await conn.fetchrow("SELECT is_admin FROM profiles WHERE id = $1", user_id)
    if not row or not row["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user
```

Exemple d'aplicació (`api/main.py:1153-1156`):

```python
@app.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    """Global KPI counters: users and results."""
    async with _pool.acquire() as conn:
        ...
```

`api/blog.py` defineix la **seva pròpia còpia** `_require_admin` (línies 59–65) duplicant la mateixa lògica — duplicació coneguda.

---

## 8. Jobs / crons

**Repo-side:**
- `grep "APScheduler|BackgroundScheduler|@scheduled"` → **cap match**. No hi ha cap scheduler in-process.
- `asyncio.create_task` apareix només per a side-effects no-bloqueig (emails, refresh de normes). `api/main.py:185` arrenca `_norm_refresh_loop()` com a task de fons al startup — és una loop in-process que recalcula normes cada 28 dies (Fase 13.20).
- `.github/workflows/*.yml`: **cap `cron:` schedule** (`grep -rn "cron:" .github/workflows/` → buit).

**Server-side (`ssh root@188.245.60.20`):**
```
/etc/cron.d/:
-rw-r--r-- 1 root root  1183 May 10 15:03 cercol-purge-tokens
-rw-r--r-- 1 root root 16690 May  7 23:36 topquaranta
(+ system: e2scrub_all, sysstat, .placeholder)

systemctl list-timers --all | grep -iE "cercol|caddy" → no_matches
```

**Contingut de `api/deploy/cron/cercol-purge-tokens`** (al repo):
```
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Daily at 04:00 UTC, run as postgres (peer auth to local PostgreSQL).
0 4 * * * postgres psql -d cercol -c "DELETE FROM magic_tokens WHERE expires_at < NOW(); DELETE FROM refresh_tokens WHERE expires_at < NOW(); DELETE FROM oauth_states WHERE created_at < NOW() - INTERVAL '1 hour';"
```

**Verificació d'instal·lació al servidor:** existeix `/etc/cron.d/cercol-purge-tokens` (1183 bytes, instal·lat el 2026-05-10). Coincideix amb la cadència del README (`api/deploy/cron/README.md:14-17`).

**Veredicte:** existeix UN mecanisme de jobs — **system cron via `/etc/cron.d/`, instal·lat manualment**. La instal·lació no és automàtica (CLAUDE.md i `api/deploy/cron/README.md:37-42` ho documenten explícitament: trade-off acceptat). No hi ha cap scheduler de procés (APScheduler) ni workflow programat per cron a GitHub Actions.

---

## 9. Secrets management

**`.env.example`** (arrel del repo, 1437 bytes, vist a §9 del raw output):
- Frontend: `VITE_API_URL`.
- Backend: `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`, `BACKEND_URL`.
- Stripe (no live): `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`.

**`api/.env.example`** (700 bytes — **stale**): cita `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, comentari "Set by Railway automatically". Drift evident respecte CLAUDE.md.

**Variables realment carregades pel codi** (`grep "os.getenv|os.environ" api/`):
```
api/main.py:    DATABASE_URL, FRONTEND_URL, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET,
                JWT_SECRET, STRIPE_SECRET_KEY
api/auth.py:    JWT_SECRET, FRONTEND_URL, BACKEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
api/blog.py:    JWT_SECRET
api/emails.py:  RESEND_API_KEY, FRONTEND_URL
```

**A servidor (`/home/cercol/.env`, 983 bytes, mode 600):**
```
BACKEND_URL=
DATABASE_URL=
FRONTEND_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
PORKBUN_API_KEY=
PORKBUN_API_SECRET=
PORKBUN_API_TITLE=
RESEND_API_KEY=
STRIPE_PRICE_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Hi ha **3 vars al servidor que no apareixen a `.env.example`**: `PORKBUN_API_KEY`, `PORKBUN_API_SECRET`, `PORKBUN_API_TITLE` (Porkbun és el registrador DNS — usat per a verificació DNS-TXT de GSC segons `SEO.md:17`). El codi del repo **no llegeix** aquestes vars (no surt cap match a `grep PORKBUN`); s'usen fora del procés de l'app (probablement scripts manuals).

**GitHub Actions secrets** (`grep "secrets\." .github/workflows/`):
```
.github/workflows/deploy-frontend.yml:55:    github_token: ${{ secrets.GITHUB_TOKEN }}
.github/workflows/deploy-backend.yml:20:    key:          ${{ secrets.HETZNER_SSH_KEY }}
```

Només 2 secrets: el `GITHUB_TOKEN` automàtic i `HETZNER_SSH_KEY`. **Cap `GOOGLE_*`, `GCP_*`, `GSC_*`, `BIGQUERY_*` configurat**.

---

## 10. External integrations

**Backend (`api/`):**
```
api/auth.py: Google OAuth2 (httpx contra accounts.google.com i www.googleapis.com)
```
Cap altra integració Google. No hi ha `bigquery`, `googleapis-python-client`, `google-cloud-*` a `api/requirements.txt`.

**Frontend (`package.json`):** `grep -ni "google|gcp|bigquery|googleapis" package.json` → **0 matches**.

**Resum d'integracions Google actives:** *només* Google OAuth per sign-in (`api/auth.py:437-525`). Cap altra superfície Google (Analytics, Tag Manager, Search Console API, BigQuery, GSC client) està connectada des de codi.

**Integracions externes confirmades en producció:**
- Resend (email transaccional) — `api/emails.py`.
- Stripe (checkout + webhook) — `api/main.py:609`, `api/main.py:625`.
- Google OAuth (auth) — `api/auth.py:437`.
- Porkbun (DNS, via vars `.env` al servidor — no via codi).

---

## 11. Frontend admin

**Rutes (`grep "/admin" src/`):**
```
src/App.jsx:170: <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
src/components/Layout.jsx:157, 278: NavLink to "/admin" (hamburger + desktop)
src/pages/AdminDashboardPage.jsx:660: 'robots.txt — allows all, blocks /admin'
```

**`src/components/AdminRoute.jsx`** (19 línies): wrapper trivial — `if (!profile?.is_admin) return <Navigate to="/" replace />`. Espera la càrrega del perfil abans de decidir.

**`src/pages/AdminDashboardPage.jsx`** (1184 línies) — pestanyes (`TABS` a línia 1141):
```js
{ id: 'overview', label: 'Overview' },
{ id: 'users',    label: 'Users'    },
{ id: 'results',  label: 'Results'  },
{ id: 'norms',    label: 'Norms'    },
{ id: 'blog',     label: 'Blog'     },
{ id: 'seo',      label: 'SEO'      },
```

**Pestanya SEO ja existeix** (línies 627–793). Conté:
- `SEO_LINKS` (línies 630–637): 6 enllaços externs (GSC, Bing Webmaster Tools, PageSpeed, Rich Results, Mobile-Friendly Test, Ahrefs).
- `LLM_QUERIES` + `LLM_ENGINES` (línies 639–652): generador de queries cap a ChatGPT/Claude/Gemini/Perplexity per a visibilitat LLM.
- `SEO_CHECKLIST` (línies 654–680): 25 items hardcoded (19 fets / 6 pendents), llista no-interactiva.

Tot són enllaços externs i checklist estàtic; **cap dada empírica** (impressions, clicks, posicions) es renderitza dins l'app.

**Llibreria de gràfics:** `recharts ^3.8.1` (`package.json:31`). Ja s'usa per a `RadarChart` als reports i `Sparkline` (component custom a `src/pages/AdminDashboardPage.jsx:200-223`, SVG inline a partir de `bytes` però fora del patró MoonIcons — vegeu §A).

**Primitius UI reutilitzables:**

```
src/components/ui/      Badge.jsx, Button.jsx, Card.jsx, SectionLabel.jsx, index.js
src/components/report/  DimensionRow.jsx, FacetAccordion.jsx, RadarDataCard.jsx,
                        ReportPageHeader.jsx, RoleCard.jsx, RoleComparisonView.jsx,
                        SurprisesPanel.jsx, index.js
```

També dins de `AdminDashboardPage.jsx`: `StatCard`, `TabButton`, `Badge` local, `ExportButton`, `LoadingRow`, `Th/Td`, `useInfiniteList` (hook scroll-load), `Sparkline`. **No exportats** com a primitius reutilitzables — viuen inline al fitxer.

---

## 12. Caddy + server logs

**Caddy live (read-only `ssh root@188.245.60.20`):**

```
/etc/caddy/:
Caddyfile           9816 bytes (May 20 20:48)
Caddyfile.bak       1003 bytes (Apr 14)
Caddyfile.bak-20260416-175640
Caddyfile.bak.20260516 (9594 bytes, pre-17.4)
Caddyfile.bak-pre-s6-20260416-202417
conf.d/

/etc/caddy/conf.d/:
cercol-api.caddy    74 bytes (May 20 20:50)
```

Multi-tenant import a `/etc/caddy/Caddyfile:221-223`:
```
# Per-project Caddy snippets owned by other repos installed at
# /etc/caddy/conf.d/. Each project ships and reloads its own
# snippet independently. tq-sync-infra MUST NOT touch this dir.
import /etc/caddy/conf.d/*.caddy
```

Coherent amb CLAUDE.md línia 17 i amb PR #25.

**Contingut de `/etc/caddy/conf.d/cercol-api.caddy`** (idèntic al repo):
```
api.cercol.team {
    encode zstd gzip
    reverse_proxy 127.0.0.1:8090
}
```

**Access logs (`/var/log/caddy/`):**
```
/var/log/caddy/cercol_api_access.log              4.5 MB  (live, May 11 timestamp)
/var/log/caddy/cercol_api_access-2026-05-10T10-04-52.669.log.gz  (rotated)
/var/log/caddy/cercol_api_access-2026-05-08T23-25-06.660.log.gz  (rotated)
/var/log/caddy/topquaranta_access.log             (live)
/var/log/caddy/topquaranta_access-*.log.gz        (4 rotated)
/var/log/caddy/access.log                         381 KB  (default Caddy log)
```

Total `/var/log/caddy/`: **20 MB**. Disc `/`: 27/38 GB ocupats.

Format: **JSON estructurat** (`logger=http.log.access.log0`, camps `request.{method,host,uri,headers,remote_ip}`, `tls`, `status`, `duration`, `bytes_read`, `size`). Mostra real:
```
{"level":"info","ts":1778513209.0993252,"logger":"http.log.access.log0",
 "msg":"handled request","request":{"remote_ip":"3.142.140.182","method":"GET",
 "host":"api.cercol.team","uri":"/administrator/phpinfo.php",...},"tls":{...}}
```

**Log rotation:** `ls /etc/logrotate.d/ | grep -i caddy` → **no match**. Els fitxers `.gz` són rotacions natives de Caddy (Caddy `log` directive amb `rotate` opcional). No hi ha logrotate sistema definit.

**Cap log de cercol.team (frontend):** el frontend és a GitHub Pages, no passa per Caddy. **Els logs Caddy del repo cobreixen NOMÉS `api.cercol.team` (backend), no `cercol.team` (frontend SEO target).** Fet rellevant per un sprint d'observabilitat SEO basada en crawl logs.

**Journal (`journalctl -u caddy --since "1 hour ago"`):** retorna access logs (escriu tant a file com a journal).

---

## 13. Tests

**Frontend (vitest):**
- `vitest.config.js`: `{ environment: 'node' }`. Cap configuració de cobertura.
- Fitxers: 7 fitxers `*.test.js` sota `src/`:
  ```
  src/data/__tests__/witness-adjectives.test.js
  src/utils/__tests__/role-oracle.test.js
  src/utils/__tests__/role-scoring.test.js
  src/utils/__tests__/scoring-utils.test.js
  src/utils/__tests__/team-narrative.test.js
  src/utils/__tests__/tokens.test.js
  src/utils/__tests__/unsplash.test.js
  src/utils/__tests__/witness-scoring.test.js
  ```
- ROADMAP línia 88 cita **194 tests** (Fase 13.18). Cobertura: no documentada.

**Backend (pytest):**
- `api/tests/` (4 fitxers, 222 línies totals):
  - `__init__.py` (0 línies)
  - `test_infra.py` (30 línies) — guarda l'existència i contingut del snippet Caddy.
  - `test_role_oracle.py` (60 línies) — `test_norm_assumptions_match_backend`, `test_role_oracle`.
  - `test_scoring.py` (132 línies) — 13 tests de scoring (z-score, centroides).
- **Cap `conftest.py`** al repo (`find api -name "conftest.py"` → buit).
- **Cap fixture `httpx_mock` / `responses`**: backend tests són purament unitaris contra `api/scoring.py` (Python pur) i lectura de fitxers (`test_infra.py`); cap test toca la DB ni HTTP extern.
- Cap test sobre endpoints FastAPI (no hi ha `TestClient(app)` enlloc).

**Estat CI (`gh run list --workflow=ci.yml --limit 3`):**
```
26189187738  success  feat(infra): Phase 17.4 Caddy snippet ownership + CI guards (#25)   2026-05-20T20:50:27Z  30s
26188397275  success  feat(infra): Phase 17.4 Caddy snippet ownership + CI guards          2026-05-20T20:34:53Z  27s
26188337095  failure  feat(infra): Phase 17.4 Caddy snippet ownership + CI guards          2026-05-20T20:33:41Z  27s
```

Última `main` CI = success.

---

## 14. CI/CD

3 workflows a `.github/workflows/`.

### 14.1 `ci.yml` (109 línies)

- Triggers: `push: [main]` i `pull_request: [main]`.
- Jobs:
  - `build`: `npm install` (no `npm ci` — comentari explica el motiu macOS/linux-x64). `npm run build`. Bundle sanity check: confirma 6 hex colors (`0047ba`, `cf3339`, `f1c22f`, `427c42`, `ffffff`, `111111`) presents en algun chunk `dist/assets/*.js`.
  - `test-frontend`: `npm test -- --run`.
  - `test-backend`: `python -m pytest api/tests/ -v` (Python 3.11) **+ Validate Caddy snippet** (línies 95–108): construeix un wrapper `import /work/api/deploy/caddy/cercol-api.caddy` i corre `caddy validate` dins de `docker run caddy:2 ...`.
- Secrets: cap (només `GITHUB_TOKEN` implícit, no referenciat).
- Touchpoints GCP: cap.

### 14.2 `deploy-backend.yml` (56 línies)

- Triggers: `workflow_dispatch` + `push: branches:[main] paths: ['api/**', '.github/workflows/deploy-backend.yml']`.
- Step únic: `appleboy/ssh-action@v1.2.0` contra `root@188.245.60.20` amb `secrets.HETZNER_SSH_KEY`. Script:
  1. `git pull origin main` a `/home/cercol/api`.
  2. Si `api/deploy/caddy/cercol-api.caddy` ha canviat: `install` a `/etc/caddy/conf.d/`, `caddy validate` (rollback si falla), `systemctl reload caddy`.
  3. `systemctl restart cercol-api` + `is-active`.
  4. **Smoke test extern**: bucle 5 intents amb `curl -fsS https://api.cercol.team/blog`.
- Touchpoints GCP: cap.

### 14.3 `deploy-frontend.yml` (58 línies)

- Triggers: `workflow_dispatch` + `push: branches:[main] paths: ['src/**', 'public/**', 'index.html', 'vite.config.js', 'package.json', 'package-lock.json', '.env.production', 'scripts/**']`.
- `npm install` (mateixa raó), `npm run build:full` (vite + prerender Puppeteer), `peaceiris/actions-gh-pages@v4` cap a branca `gh-pages`.
- `CHROME_PATH=/usr/bin/google-chrome-stable` per Puppeteer.
- Secrets: només `secrets.GITHUB_TOKEN`.
- Touchpoints GCP: cap.

---

## 15. ADRs, post-mortems, policies

```
find . -iname "ADR*" -o -iname "DECISION*" -o -path "*decisions*" -o -path "*post-mortems*" -o -path "*policies*" → buit
```

**Carpetes candidates:**
- `audits/` — 3 auditories puntuals del 10–11 maig 2026 (Full Moon, Witness). No són ADRs, són anàlisis ad-hoc.
- `docs/` — 3 documents: `AUDIT-2026-05.md`, `AUDIT-CLOSE-2026-05-20.md`, `CLAUDE_EXCELLENCE.md`. Tots són auditories, no decisions records.

**Gap pur:** el repo no té cap mecanisme ADR (ni format, ni carpeta, ni convenció). Les decisions arquitectòniques significatives (eliminar Supabase, abandonar Railway, multi-tenant Caddy, JWT HS256) viuen disperses entre `CLAUDE.md`, entrades de `ROADMAP.md` i missatges de commit. No hi ha post-mortems formals (les caigudes de Caddy del 30 dies / 3 dies del Phase 17.1/17.4 estan documentades dins de la mateixa entrada del roadmap, no en cap document separat).

---

## A. Reusable

Estructures ja al repo que un sprint d'observabilitat SEO hauria de reaprofitar.

- **Admin gate.** `require_admin` dependency a `api/main.py:1129-1135` (i la seva còpia a `api/blog.py:59-65`). Qualsevol nou endpoint `/admin/seo/*` ha d'usar aquest dependency.
- **Frontend admin route.** `src/components/AdminRoute.jsx` + `src/pages/AdminDashboardPage.jsx`. La pàgina ja té sistema de pestanyes (`TABS` a línia 1141) i ja exposa una pestanya `seo` (línies 627–793) actualment només amb enllaços externs + checklist — substrat natural per inserir-hi dashboards reals.
- **Recharts.** Ja dependència (`package.json:31`, `recharts ^3.8.1`). Vendor chunk separat (Fase 17.1). Reutilitzable per a sèries temporals d'impressions/clicks/posicions.
- **`Sparkline`.** Component SVG inline a `src/pages/AdminDashboardPage.jsx:200-223`, ja en producció a la pestanya Overview. Pattern reutilitzable.
- **`useInfiniteList`.** Hook scroll-load a `src/pages/AdminDashboardPage.jsx:144`. Si calen taules paginades de queries GSC, ja existeix la primitiva.
- **JWT HS256 + asyncpg pool.** Tota l'autenticació i accés DB ja resolts. Qualsevol endpoint nou pot usar `Depends(get_current_user)` + `async with _pool.acquire()`.
- **Resend per emails transaccionals.** `api/emails.py` ja envia en 6 idiomes amb `asyncio.create_task`. Si calen alertes SEO per email, infra disponible.
- **Cron pattern.** `api/deploy/cron/cercol-purge-tokens` + `api/deploy/cron/README.md` defineixen el patró acceptat: fitxer al repo, instal·lació manual `/etc/cron.d/`. Coherent amb topquaranta. Si l'ingest GSC→BigQuery cal cadència diària, aquest patró és el que ja existeix.
- **Caddy logs estructurats JSON.** `/var/log/caddy/cercol_api_access.log` + rotats `.gz` ja generen JSON parsejable. Per a observability del **backend** són immediatament ingestables.
- **GitHub Actions com a runner.** 3 workflows ja a `.github/workflows/`. Patró `workflow_dispatch` + filtrat per paths ja en ús; afegir un workflow amb `schedule: cron:` és consistent.
- **Test infra-as-code.** `api/tests/test_infra.py` és precedent per testar fitxers de configuració (Caddy snippet). Es pot estendre el pattern a verificar `.github/workflows/*.yml`, sitemap o robots.

## B. Conflictes potencials

- **Jobs in-process vs cron system.** El repo ja té decidit el patró: cron a `/etc/cron.d/` instal·lat manualment (`api/deploy/cron/README.md:37-42` ho justifica explícitament). Introduir APScheduler o `BackgroundScheduler` violaria aquesta decisió. L'única excepció existent és `_norm_refresh_loop` (`api/main.py:185`) — task de fons in-process per refresh de normes — i és un cas considerat acceptable perquè és cadència de 28 dies. Ingestes diàries/hores haurien d'anar via cron.
- **Caddyfile sota gestió de topquaranta.** `/etc/caddy/Caddyfile` és re-escrit pel deploy de topquaranta (causa del 30-day outage i del segon outage del 17 maig, vegeu ROADMAP 17.4). **Qualsevol bloc Caddy nou per cercol ha d'anar a `/etc/caddy/conf.d/cercol-*.caddy`** — el fitxer `cercol-api.caddy` és el patró canònic. Afegir directives al Caddyfile principal les esborraria.
- **`/etc/cron.d/topquaranta`** (16.7 KB) ja viu al servidor compartit. Els noms de fitxer cron de cercol han de ser prefixats `cercol-*` per evitar col·lisió.
- **Pestanya SEO existent al dashboard.** `src/pages/AdminDashboardPage.jsx:627-793` ja s'anomena "SEO". Si el sprint introdueix dashboards SEO empírics, decidir si reescriure aquesta pestanya (substituint enllaços+checklist hardcodejats) o crear una pestanya nova (p.ex. "SEO Metrics"). Coexistència parcial generaria confusió.
- **`api/blog.py` duplica `_require_admin`.** Si es crea un `api/seo.py` nou, hi ha precedent (no recomanable) de duplicar el dependency en comptes d'importar-lo. Decisió a explicitar.
- **GitHub Actions `secrets.HETZNER_SSH_KEY` és l'únic secret de producció no-GH.** Afegir `GCP_SERVICE_ACCOUNT_JSON` o `GSC_OAUTH_REFRESH_TOKEN` és el primer secret extern al servidor SSH; cal decidir si viu només a GitHub Actions secrets o també a `/home/cercol/.env` (i actualitzar `.env.example`, que per cert ja conté drift Porkbun no documentat).
- **`api/.env.example` està stale** (cita Supabase i Railway). Afegir noves vars sense rectificar primer aquest fitxer perpetua el drift.
- **`AdminDashboardPage.jsx` ja és de 1184 línies.** Inserir-hi dashboards GSC/BigQuery sense extreure components el fa créixer més; els primitius `StatCard`/`TabButton`/`Sparkline`/`useInfiniteList` viuen inline, no a `src/components/ui/`. Hi ha un cost de refactor implícit.
- **Frontend sense logs Caddy.** El frontend cercol.team està a GitHub Pages → **no hi ha access logs propis**. Crawl logs del frontend depenen exclusivament de GSC Crawl Stats API; no es pot complementar amb logs origin com es faria amb el backend. Limitació estructural.
- **`google-site-verification` no és visible al HTML** (`grep "google-site-verification|msvalidate" index.html` → 0 matches; SEO.md diu que GSC s'ha verificat via DNS-TXT a Porkbun). La verificació no està al codi — si algú regenera DNS, es perd silentment. Cap test la cobreix.

## C. Decisions pendents

Preguntes a resoldre abans de planificar el sprint d'observabilitat SEO, sense respondre-les aquí.

1. **GCP project ownership.** Qui és el billing owner del nou GCP project? Es crearà un compte nou (org `cercol`?) o es reutilitzarà algun existent?
2. **Pressupost cloud mensual.** Quin sostre de cost mensual és tolerable per a BigQuery (storage + queries) + Cloud Functions/Scheduler? GSC API és gratis, però l'ingest i les dashboards no.
3. **Identitat verificadora de GSC i Bing.** Quin compte Google té actualment "verified owner" a GSC per a `cercol.team`? Pot delegar accés API o cal re-verificar? Idem Bing Webmaster.
4. **Domini BigQuery.** Les taules van a dataset `cercol_seo`, `analytics`, `observability`? Hi ha cap convenció prèvia (de topquaranta o un altre projecte) que valgui la pena seguir?
5. **PageSpeed Insights data source.** Es prefereix l'API PSI v5 (`pagespeedonline.googleapis.com`) o CrUX BigQuery export? Les dues tenen latències diferents (PSI: on-demand sintètic; CrUX: ~28 dies field data).
6. **Custom MCP — repo o separat.** El servidor MCP viu dins d'aquest repo (`api/mcp/` o paquet nou) o és un repo independent? Si separat, ¿com es publica? Si dins, ¿s'hi inclou un nou Dockerfile o entry-point uvicorn?
7. **Autenticació del MCP.** Reaprofita JWT cercol o és un canal independent (API key, mTLS, OAuth client_credentials)?
8. **Frontend o backend del nou dashboard.** Els dashboards d'observabilitat SEO viuen com a pestanya nova de `AdminDashboardPage`, o com a routes separades (`/admin/seo/queries`, `/admin/seo/coverage`)?
9. **Reescriure la pestanya SEO actual.** ¿S'enterra la pestanya `seo` actual (links externs + checklist hardcoded) i es substitueix per la nova, o coexisteixen com a "SEO Tools" i "SEO Metrics"?
10. **Ingest del backend Caddy access log.** El sprint inclou parsejar els JSON logs de `/var/log/caddy/cercol_api_access.log` (rate-limit, errors, bot patterns) o queda fora d'abast (només GSC/Bing/PSI)?
11. **Frequency.** Refresh diari (cron 02:00 UTC?) o més freqüent? GSC té delay ~2 dies → diari pot ser suficient.
12. **Política de retenció.** Quants mesos de dades a BigQuery? GSC només dona ~16 mesos retroactius; cal capturar-los des d'avui en endavant.
13. **Mecanisme ADR.** Aquest sprint és prou estructural per introduir el primer ADR del repo? (gap documentat a §15). Si sí, ¿format `docs/adr/NNNN-titol.md` o `docs/decisions/`?
14. **Notificacions / alertes.** Si una mètrica cau (impressions, posició mitjana, errors 404 al sitemap), el sistema notifica via Resend (infra existent) o no notifica?

---

## Drift detectat

Discrepàncies respecte `docs/AUDIT-2026-05.md` i `docs/AUDIT-CLOSE-2026-05-20.md`.

| # | Discrepància | Font(s) |
|---|--------------|---------|
| 1 | `CLAUDE.md:132` cita `api/railway.toml` ("Legacy Railway deployment config"). Aquest fitxer **ja no existeix** al repo (`find api -name "*.toml"` → buit). `docs/AUDIT-2026-05.md:32` confirma que Railway no és el deployment actiu però no menciona la referència obsoleta a CLAUDE.md. | `CLAUDE.md:132`, `docs/AUDIT-2026-05.md:32` |
| 2 | `api/.env.example` (700 bytes) encara llista `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` i comentari "Set by Railway automatically". `CLAUDE.md:22` afirma "Supabase: NO LONGER USED" i `docs/AUDIT-2026-05.md` confirma migració completa. L'`.env.example` arrel (1437 bytes) sí està actualitzat; el del subdir `api/` és stale. | `api/.env.example`, `CLAUDE.md:22`, `docs/AUDIT-2026-05.md:56` |
| 3 | `sql/README.md` (1 línia): "Manual SQL scripts — run once in the Supabase SQL editor". Stale post migració. | `sql/README.md:1` |
| 4 | `.env` del servidor (`/home/cercol/.env`) conté `PORKBUN_API_KEY`, `PORKBUN_API_SECRET`, `PORKBUN_API_TITLE`. Aquestes vars **no apareixen ni a `.env.example` ni a `api/.env.example` ni són llegides per cap codi** (`grep PORKBUN api/ -r` → buit). Drift entre estat del servidor i exemple commitejat. | `.env.example`, `/home/cercol/.env` |
| 5 | `docs/AUDIT-CLOSE-2026-05-20.md:185-210` flag H1 FAIL: `/` i `/science/` no tenen `<h1>` (5 de 12 pàgines auditades fallen, 2 crítiques). No s'ha resolt — segueix obert i és **única FAIL** del close-out audit. Cap menció a ROADMAP. | `docs/AUDIT-CLOSE-2026-05-20.md:185-210, 461, 498` |
| 6 | `docs/AUDIT-CLOSE-2026-05-20.md:60-72` reporta que el deploy de frontend va **fallar** (30 s, paths filter no match) als merges de PR #23 i #24. Es va resoldre al merge de #25 perquè aquest sí tocava `scripts/`/`api/`/`.github/`. La causa-arrel (paths filter de `deploy-frontend.yml`) no s'ha mitigat: si un futur PR només toca `src/locales/*.json` sense tocar res a `paths:` declarats... espera, `src/**` sí cobreix. El problema concret era que els PRs #23/#24 tocaven `scripts/generate-sitemap.mjs` i `src/hooks/usePageMeta.js` (presumiblement sí dins de paths). La fallida concreta segueix sense diagnòstic documentat. | `docs/AUDIT-CLOSE-2026-05-20.md:60-72` |
| 7 | El gitstatus indica `docs/AUDIT-CLOSE-2026-05-20.md` com a **untracked** (?? prefix), però `wc -l` retorna 508 línies vàlides i es referencia al brief com a font autoritzada. Mai s'ha commitejat. | `git status`, `docs/AUDIT-CLOSE-2026-05-20.md` |
| 8 | `docs/AUDIT-2026-05.md:42` enumera els endpoints `/admin/*` però **no menciona** `POST /admin/maintenance/purge-tokens` (`api/main.py:1526`). L'audit cobreix 9 de 10 endpoints admin. | `docs/AUDIT-2026-05.md:42`, `api/main.py:1526` |
