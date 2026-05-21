# Phase 17.2 / 17.3 / 17.4 close-out audit — 2026-05-20

## Context

Sprint per resoldre cinc problemes detectats abans del 2026-05-20: 98 URLs "Discovered, not indexed" a Google Search Console, 19 errors 404, Bing sense indexar amb avisos de "titles too short" / "insufficient content", CTR de 0,45% i una caiguda de TLS a `api.cercol.team` provocada pel desplegament de topquaranta sobreescrivint el `Caddyfile` compartit. S'han fusionat tres PRs:

- **#23 — Phase 17.2 SEO indexability** (`a93457b`): trailing slash al sitemap, `usePageMeta` hook, canonical i hreflang per-pàgina.
- **#24 — Phase 17.3 per-page metadata** (`c74bb96`): namespace `seo` als sis idiomes amb títol i descripció únics per pàgina.
- **#25 — Phase 17.4 Caddy snippet ownership** (`1c2a1e9`): `api/deploy/caddy/cercol-api.caddy` com a source of truth, install + validate + rollback al `deploy-backend.yml`, smoke extern, `caddy validate` a CI i `test_infra.py`.

HEAD del worktree: `1c2a1e9`. Aquest informe és read-only; no s'han fet commits ni s'han modificat fitxers excepte aquest document i la regeneració local de `public/sitemap.xml` (no commitejada).

---

## A. Sitemap

### A.1 — `withTrailingSlash()` a `scripts/generate-sitemap.mjs`

```js
// scripts/generate-sitemap.mjs:34-37
function withTrailingSlash(path) {
  if (!path) return '/'
  return path.endsWith('/') ? path : `${path}/`
}
```

- Tracta la home (`'/'`) correctament (ja acaba en `/`, retorna `/`).
- Si `path` és buit o `undefined`, retorna `'/'` (fallback a la home).
- **No filtra query params**: si arribés un `path` amb `?`, l'append `/` afegiria slash *després* del query, generant URLs malformades. A la pràctica `STATIC_PAGES` no inclou cap path amb query, però `langUrl` (línia 44) construeix `?lang=` *després* d'aplicar `withTrailingSlash`, així que la composició és correcta: `/about/?lang=ca`.

**Resultat**: PASS
**Evidència**: `scripts/generate-sitemap.mjs:34-37`, `scripts/generate-sitemap.mjs:39-45`
**Observacions**: La funció és simple i correcta per als usos actuals. Si en el futur algú passa paths amb query, faria falta defensar-se. No és bloquejant.

### A.2 — Sitemap local regenerat

Sortida de `node scripts/generate-sitemap.mjs`:

```
[sitemap] 104 articles fetched
[sitemap] written to .../public/sitemap.xml — 112 entries
```

- Total `<loc>`: **112**.
- `<loc>` sense `/` final ni `?`: cap (`grep -oE '<loc>[^<]+</loc>' public/sitemap.xml | grep -v '/</loc>$' | grep -v '?'` → buit).
- `<xhtml:link href="...">` sense `/` final i sense `?lang=`: cap (`grep -oE 'hreflang="[^"]+" href="[^"]+"' public/sitemap.xml | grep -v '/"$' | grep -v '?lang'` → buit).

**Resultat**: PASS
**Evidència**: `public/sitemap.xml` regenerat localment, 112 entrades, 0 sense slash.

### A.3 — Sitemap de producció

```
$ curl -s https://cercol.team/sitemap.xml | grep -c "<loc>"
112
```

- 0 `<loc>` sense slash a producció.
- 0 hreflang sense slash a producció.
- `gh run list --workflow=deploy-frontend.yml --limit 5`:

```
26189187833  success  feat(infra): Phase 17.4 ...      2026-05-20T20:50:27Z  11m55s
26186192207  failure  chore: complete Phase 17.3 ...   2026-05-20T19:51:18Z  30s
26185656844  failure  chore: complete Phase 17.2 ...   2026-05-20T19:40:38Z  30s
```

El desplegament del frontend post-#23 i post-#24 **va fallar** (30s, probablement filter de paths). El primer deploy reeixit després de les fixes és el de PR #25 (`26189187833`, 11m55s), que sí va construir + prerender + publicar. El sitemap de producció reflecteix les fixes.

**Resultat**: PASS
**Evidència**: comanda `gh run list`, sitemap diff local↔prod nul.
**Observacions**: Cal mirar per què el deploy de frontend va fallar als merges de #23 i #24 (30s suggereix workflow `paths:` que no va matchejar). Va quedar resolt en el següent push, però és un risc latent si en un futur un merge no inclou cap fitxer dins del filtre.

---

## B. usePageMeta hook

### B.1 — Comportament

`src/hooks/usePageMeta.js:35-86`:

- **Tags tocats**: `document.title`, `<meta name="description">`, `<link rel="canonical">`, `<link rel="alternate" hreflang>` (6 idiomes + x-default).
- **Neteja d'estat heretat**: línies 50-52 fan `document.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach(el => el.remove())` *abans* d'injectar els nous, eliminant els del shell d'`index.html`.
- **Query params**: el canonical sempre és la versió neta (`${BASE}${cleanPath}`). Els hreflang d'idiomes no-EN afegeixen `?lang=<code>` al canonical (línia 76). EN i x-default usen el canonical sense query.
- **Cleanup en unmount**: línies 81-85 restauren `document.title` i `description`, i eliminen els elements afegits. Marcats amb `dataset.pageMeta = '1'` per traçabilitat.
- **Dependency array**: `[title, description, path]` — re-executa si canvia qualsevol (per ex. canvi d'idioma via i18n).

**Resultat**: PASS
**Evidència**: `src/hooks/usePageMeta.js:35-86`.

### B.2 — Crides a `usePageMeta`

```
src/pages/AboutPage.jsx:43       path: '/about/'
src/pages/SciencePage.jsx:82     path: '/science/'
src/pages/FaqPage.jsx:62         path: '/faq/'
src/pages/InstrumentsPage.jsx:60 path: '/instruments/'
src/pages/RolesPage.jsx:81       path: '/roles/'
src/pages/PrivacyPage.jsx:35     path: '/privacy/'
```

Totes les pàgines passen `title: t('seo.<page>.title')`, `description: t('seo.<page>.description')` i un `path` amb trailing slash que coincideix amb la ruta de la pàgina.

**BlogIndexPage** *no* utilitza `usePageMeta`: implementa la mateixa lògica inline a `src/pages/BlogIndexPage.jsx:106-129` (canonical `https://cercol.team/blog/` o `/${lang}/blog/`, hreflang per cada idioma, x-default). El comportament és anàleg al hook però és codi paral·lel.

**Resultat**: PASS (les sis pàgines invoquen correctament; BlogIndex usa el seu propi codi però compleix la mateixa convenció).
**Evidència**: `grep -rn "usePageMeta(" src/pages/`, fitxers citats.
**Observacions**: Duplicació de lògica entre `usePageMeta`, `BlogIndexPage` i `BlogArticlePage`. Es podria refactoritzar perquè els tres usin el mateix hook. No urgent.

### B.3 — Canonical i hreflang a `BlogArticlePage.jsx`

```js
// src/pages/blog/BlogArticlePage.jsx:228
const canonicalUrl = urlLang === 'en' ? `${BASE}/blog/${slug}/` : `${BASE}/${urlLang}/blog/${slug}/`
```

- **Trailing slash al canonical**: PASS (línia 228, sempre acaba amb `/`).
- **Hreflang loop emet trailing slash**: PASS (línies 288-296, `${BASE}/blog/${slug}/` i `${BASE}/${l}/blog/${slug}/`).
- **x-default amb trailing slash**: PASS (línia 300, `${BASE}/blog/${slug}/`).

**Resultat**: PASS
**Evidència**: `src/pages/blog/BlogArticlePage.jsx:228,288-296,300`.

### B.4 — Absència de `react-helmet`

```
$ grep "helmet" package.json
(empty)
$ grep -rn "react-helmet" src/
src/hooks/usePageMeta.js:12: * (no react-helmet, per CLAUDE.md).
```

Cap dependència `react-helmet*` a `package.json` ni cap import en codi font. L'única menció és comentari explicatiu al hook.

**Resultat**: PASS
**Evidència**: `package.json`, `grep -rn react-helmet src/`.

---

## C. Producció — validació via curl

Tots els 12 URLs retornen HTTP **200** després de `curl -sL`. Resum compacte:

| # | URL | Status | Title únic | Canonical = URL | Hreflang (7) | x-default OK |
|---|---|---|---|---|---|---|
| 1 | `/` | 200 | sí | `https://cercol.team/` | sí | sí |
| 2 | `/about/` | 200 | sí | `https://cercol.team/about/` | sí | sí |
| 3 | `/science/` | 200 | sí | `https://cercol.team/science/` | sí | sí |
| 4 | `/instruments/` | 200 | sí | `https://cercol.team/instruments/` | sí | sí |
| 5 | `/roles/` | 200 | sí | `https://cercol.team/roles/` | sí | sí |
| 6 | `/faq/` | 200 | sí | `https://cercol.team/faq/` | sí | sí |
| 7 | `/privacy/` | 200 | sí | `https://cercol.team/privacy/` | sí | sí |
| 8 | `/blog/` | 200 | sí | `https://cercol.team/blog/` | sí (subdir) | sí |
| 9 | `/blog/what-is-agreeableness…/` | 200 | sí | mateixa URL | sí (subdir) | sí |
| 10 | `/ca/blog/big-five-…/` | 200 | sí (CA) | mateixa URL | sí (subdir) | apunta a `/blog/...` |
| 11 | `/de/blog/how-to-build-…/` | 200 | sí (DE) | mateixa URL | sí (subdir) | apunta a `/blog/...` |
| 12 | `/da/blog/personality-and-happiness-…/` | 200 | sí (DA) | mateixa URL | sí (subdir) | apunta a `/blog/...` |

Exemples extrets directament de l'HTML servit:

```html
<!-- /about/ -->
<title>About Cèrcol: open-source Big Five team assessment</title>
<link rel="canonical" href="https://cercol.team/about/" data-page-meta="1">
<link rel="alternate" hreflang="en" href="https://cercol.team/about/">
<link rel="alternate" hreflang="ca" href="https://cercol.team/about/?lang=ca">
...
<link rel="alternate" hreflang="x-default" href="https://cercol.team/about/">

<!-- /de/blog/how-to-build-a-balanced-team/ -->
<title>Wie man mit Persönlichkeitswissenschaft ein ausgewogenes Team aufbaut · Cèrcol</title>
<link rel="canonical" href="https://cercol.team/de/blog/how-to-build-a-balanced-team/">
<link rel="alternate" hreflang="x-default" href="https://cercol.team/blog/how-to-build-a-balanced-team/">
```

Cap hreflang d'una pàgina interna apunta a `https://cercol.team/` (només la home té aquest valor com a canonical). Tots els canonicals contenen trailing slash.

**Observació sobre prerender**: el risc identificat al prompt (canonical del shell heretat per pàgines internes pre-rendered) **no es materialitza**. El prerender script espera 1500 ms (`scripts/prerender.mjs:312`) després del `networkidle0`, suficient perquè el `useEffect` de `usePageMeta` (i el de `BlogArticlePage`) hagi executat i hagi mutat el `<head>` abans del snapshot. El HTML que curl rep ja conté els tags correctes amb `data-page-meta="1"` i `data-blog-index="1"`, confirmant que el hook va córrer durant el prerender.

**Resultat**: PASS (12/12 URLs amb status 200, canonical i hreflang correctes).
**Evidència**: respostes curl emmagatzemades a `/tmp/audit/*.html`.

---

## D. H1 per pàgina

Comanda: `grep -coiE '<h1[ >]' /tmp/audit/<file>`.

| URL | Count `<h1>` | Resultat |
|---|---|---|
| `/` | **0** | **FAIL** |
| `/about/` | 1 | PASS |
| `/science/` | **0** | **FAIL** |
| `/instruments/` | 1 | PASS |
| `/roles/` | 1 | PASS |
| `/faq/` | 1 | PASS |
| `/privacy/` | 1 | PASS |
| `/blog/` | 1 | PASS |
| `/blog/what-is-agreeableness…/` | **2** | **FAIL** |
| `/ca/blog/big-five-…/` | **2** | **FAIL** |
| `/de/blog/how-to-build-…/` | 1 | PASS |
| `/da/blog/personality-and-happiness-…/` | **2** | **FAIL** |

**D.2 — Pàgines flaggejades per Bing per "no H1"**:

- **Home (`/`)**: la primera capçalera detectable és un `<h2>` ("New Moon Cèrcol"). No hi ha cap `<h1>`. Probable causa del Bing flag.
- **`/science/`**: també sense `<h1>`; primer heading és un `<h2>` ("No proprietary tests."). FAIL clar.
- **3 articles de blog** tenen **2 `<h1>`** (probable: un al header del component + un dins el contingut markdown renderitzat). Això perjudica jerarquia SEO però és menys greu que zero.

**Resultat**: FAIL (5 de 12). La home + science són els casos crítics; el doble H1 a 3 articles és secundari.
**Evidència**: `/tmp/audit/_.html`, `/tmp/audit/_science_.html`.
**Observacions**: No es corregeix en aquest audit. Cal sprint nou per afegir un `<h1>` a `HomePage` (string nou a `seo.home.h1` o similar) i `SciencePage`, i revisar el component d'article del blog per eliminar el `<h1>` duplicat.

---

## E. robots.txt + verification meta

### E.1 — robots.txt

```
$ curl -s https://cercol.team/robots.txt
User-agent: *
Allow: /

# Block admin panel from indexing
Disallow: /admin

# Sitemap
Sitemap: https://cercol.team/sitemap.xml
```

Sitemap declarat sense www. PASS.

**Resultat**: PASS
**Evidència**: sortida curl.

### E.2 — Verification meta

```
$ grep -E "msvalidate|google-site-verification" /tmp/audit/_.html
(empty)
```

Cap meta tag `msvalidate.01` (Bing) ni `google-site-verification` a l'HTML de la home en producció.

**Resultat**: N/A (no és un check PASS/FAIL: es registra l'absència). Si la verificació es fa via DNS-TXT (típic per a GSC), el meta tag és innecessari. Per a Bing Webmaster Tools cal o bé DNS, fitxer `BingSiteAuth.xml`, o meta tag.
**Evidència**: HTML de home buit per a aquests patrons.
**Observacions**: Cal confirmar fora del codi com s'està verificant a Bing. Si no està verificat, és la causa probable que Bing no indexi.

---

## F. Caddy multi-tenant

### F.1 — Snippet del repo

```
$ cat api/deploy/caddy/cercol-api.caddy
api.cercol.team {
    encode zstd gzip
    reverse_proxy 127.0.0.1:8090
}
```

Existeix i és correcte.

**Resultat**: PASS
**Evidència**: `api/deploy/caddy/cercol-api.caddy:1-4`.

### F.2 — `deploy-backend.yml`

(NOTA: el prompt diu `deploy-api.yml`; el fitxer real és `.github/workflows/deploy-backend.yml`.)

Linies 30-39:

```yaml
mkdir -p /etc/caddy/conf.d
if ! cmp -s api/deploy/caddy/cercol-api.caddy /etc/caddy/conf.d/cercol-api.caddy 2>/dev/null; then
    install -m 0644 api/deploy/caddy/cercol-api.caddy /etc/caddy/conf.d/cercol-api.caddy
    if ! caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile; then
        echo "Caddy validation failed, rolling back snippet" >&2
        rm -f /etc/caddy/conf.d/cercol-api.caddy
        exit 1
    fi
    systemctl reload caddy
fi
```

Línies 47-55:

```yaml
for i in 1 2 3 4 5; do
    if curl -fsS -o /dev/null https://api.cercol.team/blog; then
        echo "External smoke test passed"
        exit 0
    fi
    sleep 2
done
```

Tots els elements requerits són presents: `mkdir -p`, `install -m 0644` condicional a `cmp -s`, `caddy validate`, rollback (`rm -f`) en error, smoke extern amb 5 reintents.

**Resultat**: PASS
**Evidència**: `.github/workflows/deploy-backend.yml:30-39,47-55`.

### F.3 — Últim run del deploy-backend

```
$ gh run list --workflow=deploy-backend.yml --limit 5
26189187889  success  feat(infra): Phase 17.4 ...  Deploy backend  main  push  2026-05-20T20:50:27Z  16s
```

Last run: ID `26189187889`, status **success**, 16 segons.

**Resultat**: PASS
**Evidència**: `gh run list`.

---

## G. Documentació

### G.1 — ROADMAP.md files per a 17.2/17.3/17.4

```
$ grep -nE "^\| 17\." ROADMAP.md
99:  | 17.1 | Performance + SEO sprint (2026-05-16/17) ...
100: | 17.2 | SEO indexability fixes (2026-05-20) ...
101: | 17.3 | Per-page SEO metadata in six languages (2026-05-20) ...
102: | 17.4 | Caddy snippet ownership + CI guards (2026-05-20) ...
```

Els tres rows existeixen i descriuen el què-i-per-què.

**Resultat**: PASS
**Evidència**: `ROADMAP.md:100-102`.

### G.2 — CLAUDE.md menció Caddy multi-tenant

```
CLAUDE.md:17  Caddy is shared with the topquaranta project on the same VPS.
              The `api.cercol.team` site block lives at `/etc/caddy/conf.d/cercol-api.caddy`,
              with its source of truth in this repo at `api/deploy/caddy/cercol-api.caddy`.
              Topquaranta's main `/etc/caddy/Caddyfile` imports the whole `conf.d/` directory
              so each project owns its own Caddy snippet.

CLAUDE.md:33  Push to `main` → ... → install `api/deploy/caddy/cercol-api.caddy`
              into `/etc/caddy/conf.d/` (only when changed) → `caddy validate`
              (rollback on failure) → `systemctl reload caddy` → ... → external smoke test.
```

Ownership boundary explicitada (cercol → conf.d snippet; topquaranta → Caddyfile).

**Resultat**: PASS
**Evidència**: `CLAUDE.md:17,33`.

### G.3 — `docs/ops/infra.md`

```
$ ls docs/
AUDIT-2026-05.md  CLAUDE_EXCELLENCE.md  email-signature.html
```

No existeix `docs/ops/`. Cap PR el demanava.

**Resultat**: N/A
**Evidència**: `ls docs/`.

---

## H. Tests

### H.1 — Frontend (`npm test -- --run`)

```
Test Files  8 passed (8)
     Tests  199 passed (199)
  Duration  2.75s
```

Coincideix amb 199/199 que les PRs reivindicaven.

**Resultat**: PASS
**Evidència**: sortida `npm test`.

### H.2 — Backend (`pytest tests/ -v`)

```
============================== 28 passed in 0.13s ==============================
```

28 tests passats. Inclou `test_infra.py` amb dos tests:

- `test_caddy_snippet_exists` (`api/tests/test_infra.py:19`)
- `test_caddy_snippet_has_expected_block` (`api/tests/test_infra.py:23`) — verifica `api.cercol.team {` i `reverse_proxy 127.0.0.1:8090`.

**Coberta**:
- Snippet existeix al repo: PASS (test directe).
- Snippet conté el bloc esperat: PASS.

**No cobert** (intencionalment fora de cercol):
- Que el deploy de cercol no toqui `/etc/caddy/Caddyfile`: N/A — concern de topquaranta side. El snippet és el contracte; el workflow només escriu a `conf.d/cercol-api.caddy`.
- Que `import /etc/caddy/conf.d/*.caddy` estigui al Caddyfile de topquaranta: N/A — depèn del repo topquaranta.

**Validació `caddy validate` a CI** (`.github/workflows/ci.yml:97-108`):

```yaml
echo "import /work/api/deploy/caddy/cercol-api.caddy" > /tmp/wrapper.caddy
...
caddy:2 caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile
```

Últim run de CI:

```
26189187738  success  feat(infra): Phase 17.4 ...  CI  main  push  2026-05-20T20:50:27Z  30s
```

**Resultat**: PASS (28/28, incloent `test_infra.py`; CI verd al darrer commit).
**Evidència**: sortida pytest, `gh run list --workflow=ci.yml`.

---

## I. API stability

### I.1 — `/health`

```
$ curl -s -o /dev/null -w "%{http_code}\n" https://api.cercol.team/health
200
```

Existeix (definit a `api/main.py:416`). PASS.

**Resultat**: PASS
**Evidència**: curl + `api/main.py:416`.

### I.2 — Tres endpoints representatius

```
health=200 blog=200 beta=200
```

- `GET /health` → 200 (`api/main.py:416`).
- `GET /blog` → 200 (endpoint públic del blog).
- `GET /beta` → 200 (`api/main.py:427`, públic).

Els tres responen 200. `HEAD` retorna 405 (els endpoints FastAPI no estan registrats per HEAD, és normal i no és un bug).

**Resultat**: PASS
**Evidència**: sortida curl.

---

## J. Altres objectius del sprint

Encreuament dels 5 problemes citats al context inicial amb el que ha quedat fet:

| # | Problema | Estat | Responsable |
|---|---|---|---|
| 1 | 98 "Discovered, not indexed" a GSC | **Fix tècnic completat** (PR #23: trailing slash + canonical correcte). | Acció humana pendent: a GSC clicar "Validate fix" als 98 URLs afectats. Cal esperar 2-4 setmanes per re-crawl. |
| 2 | 19 404s a GSC | **Probablement fixats** per Phase 17.1 (prerender 624 routes de blog amb HTTP 200 estàtics). PR #23 a més corregeix els canonicals. | Acció humana: validar fix a GSC, monitoritzar. |
| 3 | Bing buit amb "titles too short" / "insufficient content" | **Parcialment fix** (PR #24 dóna títols únics 50-60 chars i descripcions 140-160 chars per a les 6 pàgines top-level). | **Pendent humà**: verificar Bing Webmaster Tools (cap meta `msvalidate.01` al HTML — secció E.2). Sense verificació no es pot resubmetre sitemap. **Pendent sprint futur**: corregir H1 absents a `/` i `/science/` (secció D — el 2on motiu del flag "insufficient content" de Bing). |
| 4 | CTR 0,45% (1 click / 220 impressions, 3 mesos) | **No mesurable encara.** PR #24 millora la qualitat de títol/descripció, però CTR només es pot re-mesurar 4-8 setmanes després del re-crawl. | Pendent sprint futur (juny-juliol). |
| 5 | TLS outage a `api.cercol.team` per sobreescriptura del Caddyfile | **Estructuralment fix** per PR #25: cercol ja no toca el Caddyfile; només escriu a `conf.d/`. Validate + rollback + smoke extern. Test al repo (`test_infra.py`) + CI (`caddy validate`). | Acció paral·lela: requereix PR coordinat al repo de topquaranta que afegeixi `import /etc/caddy/conf.d/*.caddy` al final del seu Caddyfile (ROADMAP 17.4 diu "Coordinated with a matching PR on the topquaranta repo"). Cal verificar manualment que aquest import existeix i es manté en cada deploy de topquaranta. |

**Resultat global de la secció**: PASS per al que el sprint havia de fer; **Pendents** (humà o sprint futur): verificar Bing, "Validate fix" a GSC, H1 absents/duplicats, meta verification de Bing si cal, re-mesurar CTR.

---

## Resum

| Capítol | PASS | FAIL | N/A |
|---|---|---|---|
| A. Sitemap | 3 | 0 | 0 |
| B. usePageMeta hook | 4 | 0 | 0 |
| C. Producció (12 URLs) | 1 | 0 | 0 |
| D. H1 per pàgina | 0 | 1 | 0 |
| E. robots + verification | 1 | 0 | 1 |
| F. Caddy multi-tenant | 3 | 0 | 0 |
| G. Documentació | 2 | 0 | 1 |
| H. Tests | 2 | 0 | 0 |
| I. API stability | 2 | 0 | 0 |
| J. Sprint objectives | 1 | 0 | 0 |
| **Total** | **19** | **1** | **2** |

---

## Pendents

### Acció humana (immediat)

1. **Google Search Console — "Validate fix"** als 98 URLs marcats com a "Discovered: not indexed" i als 19 404s. El fix tècnic és a producció (sitemap amb trailing slash, canonicals correctes, prerender al 200); cal demanar a GSC que faci el re-crawl.
2. **Bing Webmaster Tools — verificació de la propietat**. Cap meta `msvalidate.01` al HTML servit (secció E.2). Confirmar com s'està verificant (DNS-TXT? `BingSiteAuth.xml`?). Si no està verificat, és el motiu pel qual Bing està buit, malgrat els nous títols i descripcions.
3. **Resubmetre sitemap a Bing** un cop verificat.
4. **Verificar manualment** que el deploy de **topquaranta** acaba importing `/etc/caddy/conf.d/*.caddy`. Si no, el snippet de cercol queda al disc però Caddy no el carrega. Sense aquest pas a topquaranta, PR #25 no garanteix per si sol que `api.cercol.team` sobrevisqui al següent deploy de topquaranta.

### Regressió detectada (sprint futur)

5. **H1 absents a la home (`/`) i a `/science/`** — secció D, **única FAIL** d'aquest audit. Conseqüència probable del flag "insufficient content / no H1" que reporta Bing. Afegir `<h1>` als components corresponents (clau `seo.home.h1` i `seo.science.h1` als locales, o usar el títol existent com a `<h1>` amb ARIA-correct hierarchy).
6. **Doble `<h1>`** a 3 articles de blog (cas `BlogArticlePage`): hi ha probablement un `<h1>` al header del component i un altre dins el contingut renderitzat. Revisar i deixar-ne només un.
7. **Frontend deploy va fallar 2 cops als merges de #23 i #24** (30 s, probable filter de `paths:`). Funcionalment es va recuperar amb el deploy de #25, però cal mirar el filter al `deploy-frontend.yml` perquè un PR només-locales o només-hooks podria tornar a saltar el deploy.

### Mesura diferida

8. **CTR re-mesurat 4-8 setmanes després del re-crawl**. No es pot avaluar PR #24 fins llavors.

### Refactor opcional (no bloquejant)

9. **Unificar `usePageMeta`, `BlogIndexPage` (línies 106-129) i `BlogArticlePage` (línies 218-313)** — tres implementacions paral·leles del mateix patró. Migrar BlogIndex i BlogArticle a `usePageMeta` (o una variant que accepti og/json-ld extra) reduiria duplicació.
