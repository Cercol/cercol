# Cèrcol — Informe d'auditoria cap a l'excel·lència

**Data:** 16 d'abril de 2026 · Commit auditat: `7f86a07`

> Auditoria exhaustiva de tot el codebase — frontend React, backend FastAPI, tests, arquitectura i seguretat — amb l'objectiu d'identificar tot allò que impedeix que aquest projecte siga una obra eterna.

---

## Llegenda de gravetat

| Nivell | Significat |
|--------|------------|
| 🔴 CRÍTIC | Produeix resultats incorrectes o obre vulnerabilitats reals ara mateix |
| 🟠 GREU | Deute arquitectònic significatiu o risc de seguretat latent |
| 🟡 IMPORTANT | Violació de convencions establertes o codi que s'hauria de refactoritzar |
| 🔵 QUALITAT | Mediocricitat que no afecta el funcionament però rebaixa el nivell |

---

## I. Errors crítics de dades i algorisme

### ✅ ~~🔴 Centroids de rols divergents entre backend i frontend~~ — RESOLT (fase 13.19)

El `_compute_role` de `api/main.py` usa centroids simplificats on **C i N sempre valen 0.0** per a tots els rols:

```python
# Backend (INCORRECTE)
"R01": ( 1.0,  1.0,  0.0,  0.0,  0.0),
"R02": ( 1.0, -1.0,  0.0,  0.0,  0.0),
"R08": (-1.0,  0.0, -1.0,  0.0,  0.0),
```

```js
// Frontend (CORRECTE — citat de role-scoring.js)
R01: [ +1.0, +1.0,  0.0,  0.0, -0.5 ],  // Dolphin
R02: [ +1.0, -1.0,  0.0, +0.5, +0.3 ],  // Wolf
R08: [ -1.0,  0.0, -1.0, +1.0, -0.8 ],  // Tortoise
```

Per a un perfil de Tortoise (R08) — baix E, baix O, alt C, baix N — el backend el calcularà correctament per l'eixo E/O, però ignorarà completament la seua diferenciació respecte a Octopus (R07, baix E, alt O), que té els mateixos components E/O però C i N ben diferenciats als centroids del frontend. **Tots els rols del report grupal (`/groups/:id`) es calculen amb un model equivocat.**

A més, `_compute_role` al backend usa **distància euclidiana mínima**, mentre que el frontend usa **softmax sobre distàncies negades** amb un segon pas per a l'arc. El backend és inconsistent tant en les dades com en l'algorisme.

**Fitxers afectats:** `api/main.py` (`_ROLE_CENTROIDS`, `_compute_role`), `src/utils/role-scoring.js` (font de veritat correcta).

### 🔴 `_NORM` duplicat al backend — no hi ha única font de veritat transversal a l'stack

```python
# api/main.py
_NORM = {
    "presence":   {"mean": 3.3, "sd": 0.72},
    "vision":     {"mean": 3.7, "sd": 0.60},
    ...
}
```

Quan s'actualitzen `NORM_MEAN`/`NORM_SD` al frontend (previst a N≥200), caldrà actualitzar el backend manualment. No hi ha cap mecanisme que ho garantisca ni cap test que ho detecte. Amb el temps, front i back derivaran en silenci.

**Fitxers afectats:** `api/main.py` (`_NORM`), `src/utils/role-scoring.js` (font de veritat).

### ✅ ~~🔴 Inconsistència entre `computeGroupMeans` i `computeDimensionAnalysis`~~ — RESOLT (fase 13.19)

```js
// computeGroupMeans (team-narrative.js, línia 59)
const completed = members.filter(m => m.zscores)

// computeDimensionAnalysis (línies 162–163)
const completed = members.filter(m => m.zscores && m.completed)
```

`computeGroupMeans` inclou membres que tenen `zscores` però `completed=false`. `computeDimensionAnalysis` requereix els dos. Si un membre té `zscores` però `completed=false` (estat teòricament inconsistent però possible per race conditions), entrarà a la mitja de grup però no a l'anàlisi dimensional. El `narrative` i el `dimAnalysis` es calculen sobre poblacions potencialment diferents.

**Fitxer afectat:** `src/utils/team-narrative.js`.

---

## II. Vulnerabilitats de seguretat

### ✅ ~~🟠 CORS accepta `http://cercol.team` (sense TLS)~~ — RESOLT (fase 13.19)

```python
ALLOWED_ORIGINS = [
    "https://cercol.team",
    "http://cercol.team",   # <— risc
    ...
]
```

Qualsevol adversari en una xarxa intermèdia pot fer peticions a l'API des d'una pàgina `http://`. Hauria de ser HTTPS únicament en producció.

**Fitxer afectat:** `api/main.py`.

### ✅ ~~🟠 JWKS cache sense TTL — key rotation trenca l'auth indefinidament~~ — RESOLT (fase 13.19)

```python
_key_cache: dict = {}

def _get_key(kid: str, alg: str):
    if kid not in _key_cache:
        for k in _fetch_jwks():
            _key_cache[k["kid"]] = jwk.construct(k, ...)
```

Si Supabase rota les claus (event documentat del seu calendari de manteniment), les claus velles queden en cache per sempre fins que reinicies el servidor de Railway. No hi ha cap invalidació ni TTL. Durant una rotació de claus, tots els JWT vàlids serien rebutjats amb 401.

**Fitxer afectat:** `api/main.py`.

### ✅ ~~🟠 Enumeració de tokens de Witness — endpoint GET sense rate limiting~~ — RESOLT (fase 13.19)

```python
@app.get("/witness/session/{token}")
def get_witness_session(token: str):
    # No @limiter.limit()
```

Un atacant pot iterar tokens (32 hex chars = 16^32 espai) amb peticions ràpides per validar tokens existents. Els endpoints `POST` estan limitats a 10–20/min però el `GET` no té cap limitació.

**Fitxer afectat:** `api/main.py`.

### ✅ ~~🟠 `colors.blue + '18'` — pattern d'opacitat fràgil i insegur~~ — RESOLT (fase 13.19)

```jsx
// GroupsPage.jsx, línia 52
style={{ backgroundColor: colors.blue + '18', color: colors.blue }}
```

Açò afig `'18'` (hex α ≈ 9.4%) directament al valor hex del token. Si mai `colors.blue` passa a ser un `rgb()`, `hsl()` o una variable CSS, es trenca silenciosament i el fons es pinta negre. Cal usar tokens d'opacitat de mm-design o utilitats Tailwind.

**Fitxer afectat:** `src/pages/GroupsPage.jsx`.

---

## III. Violacions arquitectòniques greus

### ✅ ~~🟠 Quatre consultes Supabase directes en pàgines — violació de la capa `lib/api.js`~~ — RESOLT (fase 13.19)

| Fitxer | Consulta directa |
|--------|-----------------|
| `MyResultsPage.jsx` | `supabase.from('results').select('*')` |
| `FullMoonPage.jsx` | `supabase.from('profiles').select('premium')` |
| `FullMoonPage.jsx` | `supabase.from('results').select('id')` |
| `WitnessSetupPage.jsx` | `supabase.from('profiles').select('premium')` |

Aquesta violació va ser detectada i corregida per a `FullMoonResultsPage` a la fase 13.17, però no s'ha completat sistemàticament. La capa `lib/api.js` existeix precisament perquè cap pàgina no conega l'esquema directament.

### ✅ ~~🟠 Backend FastAPI usa I/O síncrona en context async — bloqueja l'event loop~~ — RESOLT (fase 13.19, migració a asyncpg)

```python
def _supabase_get(table: str, query: str) -> list:
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read())
```

Totes les rutes de FastAPI haurien de ser `async def` amb un client HTTP asíncron (`httpx.AsyncClient`). Amb `urllib.request` síncrona dins rutes que processen moltes sol·licituds concurrents, es bloqueja el worker sencer esperant I/O de xarxa.

**Fitxer afectat:** `api/main.py` (tots els helpers `_supabase_*`).

### ✅ ~~🟠 N+1 queries al backend en `get_my_groups` i `get_group_report_data`~~ — RESOLT (fase 13.19)

**`get_my_groups`:** Per cada grup, per cada membre actiu, fa una consulta `SELECT` per verificar si té resultat Full Moon. Amb 5 grups × 8 membres = 40 consultes seqüencials.

**`get_group_report_data`:** Per cada membre: 1 query de perfil + 1 query de resultats. Hauria d'usar `IN (user_ids)` i una única consulta per taula.

**Fitxer afectat:** `api/main.py`.

### 🟠 `create_group` a l'API té un lookup d'email inoperatiu

```python
try:
    rows = _supabase_get("auth.users", f"email=eq.{email}&select=id")
    # auth.users is not accessible via the REST /rest/v1/ path;
    # use the admin endpoint instead.
    pass  # <— no fa res
except Exception:
    pass
```

El codi reconeix explícitament que no funciona. En la pràctica, les invitacions per email mai es vinculen a un `user_id` existent per als usuaris ja registrats, i la funcionalitat de "invita per email" és parcialment inoperativa.

**Fitxer afectat:** `api/main.py`.

---

## IV. Codi duplicat que viola el principi DRY

### 🟡 `computeFQScores` i `computeFMScores` son idèntics al 95%

Els dos fitxers defineixen exactament el mateix algorisme. L'única diferència és la font de dades (`FQ_ITEMS/FQ_DOMAIN_META` vs `FM_ITEMS/FM_DOMAIN_META`). Hauria d'existir una funció genèrica:

```js
export function computeInstrumentScores(answers, items, domainMeta) { ... }
```

**Fitxers afectats:** `src/utils/first-quarter-scoring.js`, `src/utils/full-moon-scoring.js`.

### 🟡 El keyboard handler d'instrument es copia 3 vegades

`NewMoonPage`, `FirstQuarterPage` i `FullMoonPage` contenen pràcticament el mateix `useEffect` de teclat (~30 línies cadascun) amb variacions mínimes. Hauria d'existir un hook:

```js
useInstrumentKeyboard({ onNumber, onNext, onBack, onContinue, showIntroRef, showTransitionRef, scalePoints })
```

**Fitxers afectats:** `src/pages/NewMoonPage.jsx`, `src/pages/FirstQuarterPage.jsx`, `src/pages/FullMoonPage.jsx`.

### 🟡 La computació de `scaleLabels` es repeteix en les 3 pàgines d'instrument

```js
// Repetit idènticament a NewMoonPage, FirstQuarterPage i FullMoonPage
const scaleLabels = Object.fromEntries(
    Object.entries(SCALE_LABELS).map(([k, fallback]) => {
      const translated = t(`scale.${k}`)
      return [k, translated !== `scale.${k}` ? translated : fallback]
    })
)
```

Hauria d'existir `useScaleLabels(namespace, fallbackObj)` o una utilitat pura.

### 🟡 `scorePercent` local a `MyResultsPage` reimplementa utilitats ja existents

```js
function scorePercent(score, instrument) {
    const { min, max } = INSTRUMENT_SCALE[instrument] ?? { min: 1, max: 5 }
    return Math.round(((score - min) / (max - min)) * 100)
}
```

Existeixen `scoreToPercent5` i `radarScoreToPercent`. Caldria usar-les directament per instrument.

**Fitxer afectat:** `src/pages/MyResultsPage.jsx`.

---

## V. Violacions de les convencions del projecte (CLAUDE.md)

### ✅ ~~🟡 Strings en anglès hardcoded a `WitnessSetupPage.jsx` (3 llocs)~~ — RESOLT (fase 13.19)

```jsx
placeholder={`Witness ${index + 1}`}
placeholder="Email (optional)"
{copied ? <span>...<>Copied</></span> : label}
```

`CopyButton` interna mostra "Copied" sense passar per `t()`. Viola la regla d'i18n.

**Fitxer afectat:** `src/pages/WitnessSetupPage.jsx`.

### 🟡 SVG inline a `AuthPage.jsx` — viola la regla de `MoonIcons.jsx`

```jsx
<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
  <path fill="#4285F4" .../>
```

El logo de Google és un SVG inline directament al component. CLAUDE.md estableix "Never create inline SVG outside `MoonIcons.jsx`". Caldria afegir un `GoogleIcon` a mm-design o documentar l'excepció explícitament.

**Fitxer afectat:** `src/pages/AuthPage.jsx`.

### ⚠️ 🟡 Colors hardcoded en 4 fitxers — PARCIAL (WitnessSetupPage resolt; AuthPage.jsx i WitnessPage.jsx pendents)

| Fitxer | Valor hardcodat |
|--------|----------------|
| `AuthPage.jsx` | `focus:border-[#0047ba]`, `focus:ring-[#99b3e0]`, `text-[#0047ba]` |
| `WitnessSetupPage.jsx` | `text-[#0047ba]`, `focus:ring-[#99b3e0]` |
| `WitnessPage.jsx` | `bg-[#0047ba]`, `accent-[#0047ba]` |
| `WitnessSetupPage` `CopyButton` | `text-[#0047ba]`, `hover:text-[#003090]` |

`#003090` ni tan sols és un token del sistema — és una versió fosca del blau que hauria de ser `colors.blueDark` a mm-design.

### ✅ ~~🟡 `i18n` destructurat però no usat a dues pàgines~~ — RESOLT (fase 13.19)

```js
// FirstQuarterPage.jsx — i18n mai usat
const { t, i18n } = useTranslation()

// FullMoonPage.jsx — i18n mai usat
const { t, i18n } = useTranslation()
```

---

## VI. Codi mort i constants sense usar

### ✅ ~~🟡 `DIM_TO_CENTROID` definida i mai usada a `team-narrative.js`~~ — RESOLT (fase 13.19)

```js
// team-narrative.js, línia 128
const DIM_TO_CENTROID = { presence: 'e', bond: 'a', vision: 'o', discipline: 'c', depth: 'n' }
```

Definida, no exportada, no referenciada a cap lloc del fitxer. Codi mort pur.

### ✅ ~~🔵 Redirect innecessari `/full-moon/report → /full-moon/results`~~ — RESOLT (fase 13.19)

```js
// App.jsx
<Route path="/full-moon/report" element={<Navigate to="/full-moon/results" replace />} />
```

I al mateix temps:

```jsx
// FullMoonPage.jsx, línia 290
<Button onClick={() => navigate('/full-moon/report')}>
```

El botó navega a un alias que immediatament redirigeix. Si el destí és `/full-moon/results`, el botó hauria d'anar-hi directament.

---

## VII. Problemes d'accessibilitat

### ✅ ~~🟠 `Button.jsx` no accepta props d'accessibilitat adicionals~~ — RESOLT (fase 13.19)

```js
export default function Button({ variant, size, children, onClick, disabled, type, className }) {
```

El component desestructura props individuals sense `...rest`. Qualsevol `aria-label`, `aria-expanded`, `aria-pressed`, `data-testid` passats a `<Button>` s'ignoren silenciosament. Tots els botons que necessiten atributs accessibles contornen el problema usant `<button>` natiu directament.

**Fitxer afectat:** `src/components/ui/Button.jsx`.

### ✅ ~~🔵 `RadarChart.jsx` usa un ID de gradient hardcodat~~ — RESOLT (fase 13.19)

```jsx
<radialGradient id="cercol-radar-grad" ...>
```

Si mai dos `RadarChart` coexisteixen en la mateixa pàgina (possible a `LastQuarterPage` amb el toggle), tots dos defineixen el mateix `id` al DOM, violant la unicitat HTML i potencialment aplicant el gradient incorrecte.

**Fitxer afectat:** `src/components/RadarChart.jsx`.

---

## VIII. Absències estructurals

### 🟠 Sense CI/CD — no hi ha `.github/workflows/`

No existeix cap pipeline d'integració contínua. Cada deploy és manual. Açò significa:
- Cap verificació automàtica que el build passa abans de desplegar
- Cap execució automàtica dels tests en cada push o PR
- Risc de deploiar codi trencat per distracció o pressa
- Cap historial d'èxits/fallades de tests

### 🟠 Sense Content Security Policy

L'`index.html` no té cap capçalera CSP ni meta tag equivalent. Tota la càrrega de scripts de tercers opera sense cap restricció declarada. Una injecció XSS podria exfiltrar tokens de sessió sense obstacles.

### 🟡 Tests absents per a funcions crítiques

| Funció | Motiu de criticitat |
|--------|---------------------|
| `computeFQScores` / `computeFMScores` | Processen les 180 respostes reals dels usuaris |
| `encodeScores` / `decodeScores` | Determinants per a l'integritat de les URLs compartides |
| `buildRounds` | Algorisme del Witness (shuffled-cycle) pot tenir edge cases |
| `zscoresToRaw` | Conversió inversa usada per mostrar dades al grup |
| `_compute_role` (Python) | Si es corregissen els centroids, hauria de tenir tests propis |

### 🔵 Sense Python tests al backend

`api/main.py` és el codi més crític des del punt de vista de la seguretat (JWT, Stripe webhooks, dades de grup) i no té cap test automatitzat. Cap endpoint verificat per a comportament correcte ni regressió.

---

## IX. Mediocricitats puntuals

### ⚠️ 🔵 `navigate()` cridat durant render en dues pàgines — PARCIAL (NewMoonResultsPage resolt; FullMoonResultsPage pendent)

```jsx
// NewMoonResultsPage.jsx i FullMoonResultsPage.jsx
if (!scores) {
    navigate('/')
    return null
}
```

Crides a `navigate()` fora d'un `useEffect`. React pot renderitzar el component dues vegades en StrictMode, provocant dues navegacions. Caldria moure-ho a un `useEffect`.

**Fitxers afectats:** `src/pages/NewMoonResultsPage.jsx`, `src/pages/FullMoonResultsPage.jsx`.

### ✅ ~~🔵 `MyResultsPage` usa `select('*')` a la consulta de resultats~~ — RESOLT (fase 13.19, migració a API)

```js
supabase.from('results').select('*')
```

Selecciona totes les columnes, incloent `facets` (JSON potencialment gran) per a la vista de llista. Hauria de seleccionar únicament les columnes necessàries.

**Fitxer afectat:** `src/pages/MyResultsPage.jsx`.

### ✅ ~~🔵 `useAuth()` no avisa si s'usa fora del provider~~ — RESOLT (fase 13.19)

```js
export function useAuth() {
    return useContext(AuthContext)  // retorna null si fora del provider
}
```

Si es crida fora d'`AuthProvider`, retorna `null` i l'error es manifesta molt lluny del punt d'origen. Una guarda de desenvolupament evitaria hores de debugging:

```js
if (ctx === null) throw new Error('useAuth used outside AuthProvider')
```

**Fitxer afectat:** `src/context/AuthContext.jsx`.

### ✅ ~~🔵 `WitnessRow` usa index de l'array com a key de React~~ — RESOLT (fase 13.19)

```jsx
{witnesses.map((w, i) => (
    <WitnessRow key={i} ...>
```

Quan s'elimina una fila del mig, React no sap que les files s'han desplaçat i pot reutilitzar DOM incorrectament. Cal un `id` estable per entrada.

**Fitxer afectat:** `src/pages/WitnessSetupPage.jsx`.

### ✅ ~~🔵 `PRIMARY_THRESHOLD` i altres llindars — constants màgiques no exportades~~ — RESOLT (fase 13.19)

Valors com `PRIMARY_THRESHOLD = 0.4` (team-narrative.js), `threshold = 0.8` (detectDivergence), `0.5` (compensating member), `MIN_WITNESSES_FOR_REPORT = 2` viuen aïllats dins funcions o pàgines. No hi ha cap fitxer que done una visió global de tots els paràmetres científics del sistema, dificultant la revisió i futura calibratge.

### ✅ ~~🔵 Error sense boundary a `App.jsx`~~ — RESOLT (fase 13.19)

Un error no capturat en qualsevol component renderitza una pantalla blanca sense cap missatge d'error. Un `<ErrorBoundary>` al nivell d'`AppContent` mostraria un estat d'error amb context i opció de recuperació.

---

## Resum executiu per prioritat

> **Estat: fase 13.19 en curs** — 22/32 ítems resolts, 2 parcials, 8 pendents.

```
🔴 CRÍTICS (3)
   1. ✅ Centroids del backend incorrectes → rols del grup equivocats
   2. ⏳ _NORM duplicat entre JS i Python → derivació garantida al futur
   3. ✅ computeGroupMeans vs computeDimensionAnalysis → poblacions inconsistents

🟠 GREUS (8)
   4. ✅ CORS http:// en producció
   5. ✅ JWKS sense TTL → key rotation trenca l'auth
   6. ✅ GET /witness/session/ sense rate limit → enumeració de tokens
   7. ✅ 4 consultes Supabase directes en pàgines (viola lib/api.js)
   8. ✅ FastAPI usa urllib síncrona → bloqueja l'event loop  [asyncpg]
   9. ✅ N+1 queries a get_my_groups / get_group_report_data
  10. ⏳ lookup d'email per invitació de grup inoperatiu
  11. ⏳ Sense CI/CD pipeline

🟡 IMPORTANTS (13)
  12. ⏳ Inline SVG Google (viola CLAUDE.md)
  13. ✅ Strings hardcoded no traduits (WitnessSetupPage)
  14. ⚠️ Colors #0047ba hardcoded en 4 fitxers  [WitnessSetupPage ✅, AuthPage + WitnessPage ⏳]
  15. ✅ i18n destructurat i no usat (FQ + FM pages)
  16. ✅ DIM_TO_CENTROID dead code
  17. ⏳ computeFQScores / computeFMScores idèntics (DRY)
  18. ⏳ Keyboard handler copiat 3 vegades
  19. ⏳ scaleLabels copiat 3 vegades
  20. ⏳ scorePercent reimplementat localment
  21. ⚠️ navigate() durant render (× 2)  [NewMoonResultsPage ✅, FullMoonResultsPage ⏳]
  22. ✅ Button no accepta aria-* / data-*
  23. ✅ select('*') a MyResultsPage  [migrat a API]
  24. ✅ Redirect /full-moon/report innecessari

🔵 QUALITAT (8)
  25. ⏳ Sense CSP header
  26. ✅ Sense error boundary
  27. ✅ Gradient ID hardcodat (conflicte si 2 radars)
  28. ✅ useAuth sense guarda de context
  29. ✅ WitnessRow key per index
  30. ⏳ Sense tests Python al backend
  31. ✅ Constants màgiques de llindar no exportades
  32. ✅ colors.blue + '18' hack d'opacitat
```

---

*Aquest informe es va generar com a punt de partida per a la Fase 13.19 — Claude Excellence.*
