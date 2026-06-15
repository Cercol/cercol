# Auditoria filològica del català de Cèrcol — Informe mestre

**Autoria:** equip de revisió filològica (perfil: filòleg de l'AVL, especialista en
llenguatge de la psicologia i en traducció anglès → català/valencià de proves
psicomètriques), assistit per cinc revisors paral·lels.
**Data:** 2026-06-15
**Branca:** `claude/catalan-web-audit-rj8k6u`

> **Premissa de tota l'auditoria.** La versió **anglesa** és la font provada i
> validada (és la redacció original dels ítems IPIP/TIPI i del corpus AB5C). El
> català ha de ser **fidel al significat psicològic** d'aquesta font, no a la seua
> lletra. En aquest informe «valencià» i «català» són **sinònims absoluts**: no
> designen variants enfrontades, sinó la mateixa llengua. L'objectiu és un
> **model culte, precís i supradialectal**.

---

## 1. Resum executiu

S'ha auditat **tot el text català abastable des del repositori**: els quatre
instruments (290 ítems de test), les ~992 cadenes d'interfície (`ca.json`) i els
quatre articles del blog que tenen cos català versionat al codi.

Total d'incidències registrades: **~187**, distribuïdes així:

| Bloc | Fitxer font | Incidències | Detall |
|------|-------------|-------------|--------|
| New Moon + First Quarter (tests) | `src/data/new-moon.js`, `src/data/first-quarter.js` | 17 | [`01-newmoon-firstquarter.md`](01-newmoon-firstquarter.md) |
| Full Moon (test) | `src/data/full-moon.js` | ~71 | [`02-fullmoon.md`](02-fullmoon.md) |
| Testimoni (test) | `src/data/witness-adjectives.js` | 21 | [`03-witness.md`](03-witness.md) |
| Interfície | `src/locales/ca.json` | ~41 | [`04-ui-locales.md`](04-ui-locales.md) |
| Blog (4 articles) | `scripts/update_blog_article_{1..4}.py` | 37 | [`05-blog.md`](05-blog.md) |

**Dues conclusions transversals dominen sobre totes les incidències puntuals:**

1. **No hi ha un model de llengua únic.** La plataforma barreja morfologia
   valenciana (`-e`, `siga`, `teua`) i central (`-o`, `sigui`, `teva`), de vegades
   **dins d'un mateix fitxer i fins i tot d'un mateix ítem** (ex. `full-moon.js`
   id 102: «deixe la meva»). Un usuari que faça First Quarter i després Full Moon
   percep que la llengua «canvia de dialecte» a mitja avaluació. Això és un defecte
   objectiu **independent** de quin model s'esculla. La §3 proposa el model únic.

2. **Hi ha errades objectives que cal corregir ja**, siga quin siga el model
   (errates, persona verbal equivocada, mots inexistents, calcs). Es llisten a la §4.

> ⚠️ **Abast incomplet del blog (acció requerida).** El blog **publicat** té
> ~26 articles, però **només 4 tenen cos català al repositori**. Els altres ~22
> existeixen únicament a la base de dades de producció i no s'han pogut auditar
> perquè la política de xarxa de l'entorn bloqueja `api.cercol.team` i
> `cercol.team`. Vegeu la §6.

---

## 2. Metodologia i fonts

Cada revisor ha comparat el camp `ca` amb el camp `en` ítem a ítem / clau a clau,
sense mostreig, i ha classificat cada incidència per **categoria** (ERRADA,
DISCREPÀNCIA de model, TERMINOLOGIA, REGISTRE, REDUNDÀNCIA, AMBIGÜITAT, FIDELITAT,
CALC, FALS AMIC, NOM-PROHIBIT) i **gravetat** (ALTA / MITJANA / BAIXA), amb una
**proposta concreta** i la seua **justificació normativa**.

Fonts consultades per a les propostes no trivials:

- **AVL** — *Diccionari normatiu valencià* (DNV), *Gramàtica normativa valenciana* (GNV).
- **IEC** — *DIEC2*, *Gramàtica de la llengua catalana* (GIEC).
- **Optimot** (consultes lingüístiques de la Generalitat).
- **TERMCAT** (terminologia de psicologia i d'informàtica).
- **Softcatalà** (guia d'estil, per a microcòpia d'interfície).
- *DCVB* (Alcover-Moll), *PCCD/DSFF* (fraseologia) per a locucions.
- Terminologia de psicometria establida en català i adaptacions del model dels
  cinc factors (Big Five) quan calia fixar un terme tècnic.

Les restriccions de producte de `CLAUDE.md` s'han respectat com a criteri d'errada:
mai noms acadèmics d'instrument en text d'usuari (sí en SEO/ciència/blog), i mai
«observador» (sempre «Testimoni»).

---

## 3. El model de llengua neutre (proposta editorial)

L'encàrrec demana «un model de valencià/català que sone neutre, que supere barreres
dialectals i no genere ambigüitats, vàlid per a qualsevol parlant de tot el domini,
usant una variant culta i precisa». Aquesta secció el fixa.

### 3.1. Principi rector

Un text escrit no pot ser fonèticament neutre per a tothom (cap forma de 1a persona
del present es pronuncia igual a tot el domini). La neutralitat assolible és la
**neutralitat del registre culte**: triar, dins de l'estàndard, les formes
**acceptades alhora per l'AVL i l'IEC** i, quan la norma admet variants, preferir
**la solució compartida pel màxim de parlants** i evitar els localismes col·loquials
i les formes ambigües.

### 3.2. Decisió central: la morfologia verbal

És el punt on el codi actual es contradiu més (First Quarter en `-e`; Full Moon
bimodal; `ca.json` amb subjuntius barrejats). **Cal un sol paradigma a tota la
plataforma.** Els dos revisors de test van arribar a recomanacions oposades, i les
reconcilie així:

- El revisor de Full Moon recomana **unificar en model valencià (`-e` / `-isc` /
  `meua`)**: és el registre majoritari del codi (UI, First Quarter), coincideix amb
  la identitat del projecte i amb el registre del responsable, i —per l'axioma
  valencià = català— **no és una marca dialectal sinó una tria legítima de
  l'estàndard compartit**.
- El revisor de First Quarter recomana **model central (`-o`)** per una raó
  psicomètrica seriosa: el valencià `em sent`, `Sent que…`, `Treball` són
  **homògrafs ambigus** (es poden llegir com a 3a persona o com a substantiu), cosa
  perillosa en un test de lectura ràpida. Ja ha provocat dues errades reals.

**Arbitratge.** S'adopta el **model valencià formal** com a model únic, perquè és el
que ja domina el conjunt del codi i el que millor encaixa amb la identitat i
l'axioma de l'encàrrec; **però s'incorpora l'exigència de desambiguació** del
segon revisor com a regla no negociable: **cap ítem pot dependre d'una forma verbal
homògrafa o ambigua**. On la 1a persona valenciana és ambigua, es reescriu l'ítem
per evitar-la (p. ex. «feel blue» → «Sovint estic abatut/da», que elimina
l'ambigüitat de *sent* sense canviar el constructe). Així es conserven les dues
prioritats: coherència de model **i** claredat psicomètrica.

> Aquesta és **l'única decisió estratègica de l'informe que el responsable pot voler
> validar o invertir** (model valencià vs central). La recomanació és el model
> valencià desambiguat; si es prioritzàs que cap lector no valencià hi percebés cap
> marca, l'alternativa coherent seria el central `-o`. Sigui quina sigui la tria, la
> regla inamovible és **un sol model a `first-quarter.js`, `full-moon.js`,
> `new-moon.js`, `witness-adjectives.js` i `ca.json`**.

### 3.3. Quadre de formes del model (valencià formal desambiguat)

| Categoria | Forma del model | S'evita |
|-----------|-----------------|---------|
| 1a pers. sing. present (1a conj.) | `-e`: *preocupe, pense, arribe* | `-o`: *preocupo, penso* |
| 1a pers. sing. (verbs amb arrel ambigua) | reescriptura per evitar l'homògraf (*estic abatut* en lloc de *em sent*) | *em sent, Sent que, Treball* (ambigus) |
| Incoatius | `-isc`/`-ix`: *preferisc, complisc, s'avergonyisc* | `-eixo`: *prefereixo* |
| Subjuntiu *ser* | *siga, siguen* | *sigui, siguin* |
| Possessius | *meua/meues, teua/teues, seua/seues* | *meva, teva, seva* |
| Demostratiu | *aquest/aquesta* (compartit, no marcat) | barreja *este/eixe/aqueix* |
| Neutre demostratiu | preferència per *això* (compartit); *açò* admès però amb coherència | barreja lliure *això/açò* |
| Indefinit | *alguna cosa* (compartit i planer) | *quelcom* (cult però marcat) en text d'usuari |
| Verb «sortir/eixir», etc. | preferir la forma compartida i no marcada en cada cas, segons DNV ∩ DIEC2 | localismes col·loquials |

El detall, fitxer a fitxer, de cada forma divergent detectada és a les seccions
01, 02 i 04.

### 3.4. Terminologia de producte i de psicologia (glossari a fixar)

Termes que el codi tradueix de més d'una manera i que cal **unificar**:

- **Witness** → sempre **«Testimoni»**. Eliminar «observador/observant» (terme
  prohibit, 2 casos a `ca.json`) i els «witnesses/Witness» en cru no traduïts.
- **Fases**: ordre i nom consistents (*«X Cèrcol»* vs *«Cèrcol de X»*; *«Primer
  Quart»* vs *«Quart Creixent»* → triar-ne un).
- **Conscientiousness** → fixar **un** terme (*«Responsabilitat»* recomanat per a UI;
  evitar l'alternança amb *«Conscienciositat»*).
- **peer-reviewed** → una sola fórmula (*«revisat per experts»* / *«amb revisió
  d'experts»*); ara n'hi ha tres variants i un cas sense traduir.
- **privacitat** vs **privadesa** (totes dues vàlides per TERMCAT) → triar-ne una.
- **circumplex** (model de personalitat), no *«circumflex»* (errada de terme greu
  al blog). **desitjabilitat social**, no *«deseabilitat»* (castellanisme). **afalac/
  adulació**, no *«halago»*.

---

## 4. Llista de prioritat: errades objectives a corregir ja

Aquestes són independents del model triat. Ordre suggerit d'execució.

### 4.1. Tests (màxima prioritat — afecten la validesa de l'instrument)

| Fitxer · id | Actual | Correcció | Tipus |
|---|---|---|---|
| `first-quarter.js` · 6 | «No m'**aggrade** a mi mateix/a» | «No m'**agrade**» (+ llevar el reflexiu redundant) | errata |
| `first-quarter.js` · 5 | «Sovint em **sent** trist/a» | «Sovint **estic abatut/da**» (desambigua + idiomàtic) | persona verbal + fidelitat |
| `first-quarter.js` · 12 | «**Sent** que soc **incapaça**» | «**Sento/Note** que soc incapaç» (*incapaç* és invariable) | persona + concordança |
| `first-quarter.js` · 42 | «Soc **indiferent/a**» | «Soc indiferent» (*indiferent* és invariable) | concordança |
| `full-moon.js` · 77 | «No m'**embarbusso**» | «No me'n vaig amb embuts / Vaig al gra» | fals sentit (greu) |
| `full-moon.js` · 22 | «soc incapaç/**incapaç**» | «soc incapaç» (sobra el desdoblament) | duplicació |
| `full-moon.js` · 38 | «**pendre**-m'ho» | «**prendre**-m'ho» | ortografia |
| `full-moon.js` · 118 | «**prenga**» (indicatiu) | «**prenc/prene**» | mode verbal |
| `full-moon.js` · 70 | «candidats/**tes**» + camp `de` en danès | desdoblament correcte + revisar el camp alemany | format + idioma |
| `witness-adjectives.js` · A+09 | «**considerador**» | «**considerat**» | forma no normativa |
| `witness-adjectives.js` · C-02 | «**dispersat**» | «**dispers**» | participi mal usat |

### 4.2. Interfície (`ca.json`)

Errades tipogràfiques/gramaticals: `conyides`→**convides**, `s'arela`→**s'arrela**,
`Deixeixes`→**Deixes**, `Eres`→**Ets/Eres**(segons cas), `está`→**està**,
`la drama`→**el drama**, `importan`→**importen**, `t'adelantes`→**t'avances**,
`s'incertifica`→(reescriure), `liderem`→(revisar), `l'immobilitat`→**la immobilitat**.
Claus sense traduir: 3 «Full Moon», 5 «witnesses/Witness» en cru, «peer-reviewed»,
i `nav/admin` absent. Terme prohibit «observador»: `roles/R04/profile` (a més
mal traduït, *observant* = atent) i `witnessResults/witnessRoleDisclaimer`.

### 4.3. Blog (4 articles versionats)

`psicoemètric`→**psicomètric** (titulars, arts. 1 i 4), `circumflex`→**circumplex**
(arts. 1-3), `deseabilitat`→**desitjabilitat** (art. 1), `halago`→**afalac/adulació**
(art. 3), passiva mal construïda i *emergir* transitivat (art. 3), `citats`→**citables**
i calc «Aquest és el punt»→«Aquesta és la qüestió» (art. 4).

---

## 5. Síntesi per categoria

- **ERRADES objectives:** ~25 (les més greus, a la §4). Cap depèn del model.
- **DISCREPÀNCIA de model:** el defecte més estès (~55 formes verbals/possessius/
  demostratius divergents entre fitxers i dins de fitxers). Es resol aplicant la §3.
- **TERMINOLOGIA:** ~25 (glossari de la §3.4 + falsos amics del Testimoni).
- **FALSOS AMICS / CALCS:** concentrats al Testimoni (`obert`, `gregari`, `casual`,
  `heterodox`) i al blog (`circumflex`, `halago`, `deseabilitat`, «anar amb embuts»).
- **FIDELITAT a l'anglès:** ~15 (idiomàtics mal resolts: *feel blue*, *beat around
  the bush*, *citable*, *that is the point*).
- **REGISTRE / REDUNDÀNCIA / AMBIGÜITAT:** la resta; millores de naturalesa i de to.

---

## 6. Buit d'abast: el blog complet (acció requerida)

El blog publicat conté **~26 articles**. Només **4 tenen cos català al repositori**
i s'han auditat:

1. `big-five-vs-disc-vs-belbin`
2. `how-to-build-a-balanced-team`
3. `blind-spots-in-teams`
4. `what-is-the-ipip`

Els **22 articles restants** es referencien per *slug* a les migracions SEO/QA
(`020`, `022`, `023`, `024`), però aquestes migracions **només toquen anglès i
danès**; el seu **cos català viu exclusivament a la base de dades de producció** i
**no és al codi**. A més, l'entorn d'aquesta sessió **bloqueja l'eixida de xarxa**
cap a `api.cercol.team` i `cercol.team`, de manera que no s'han pogut llegir ni
auditar. Articles pendents:

```
big-five-personality-across-cultures-what-research-shows
creativity-and-personality-what-big-five-research-shows
critiques-of-big-five-what-critics-say
do-personality-traits-change-over-a-lifetime
does-personality-composition-predict-team-performance
forced-choice-personality-assessment-more-honest-data
gender-and-personality-what-big-five-research-says
history-of-the-big-five-from-allport-to-goldberg
how-to-read-a-big-five-personality-report
personality-and-burnout-who-is-most-at-risk
personality-and-career-choice-what-big-five-predicts
personality-and-job-fit-how-to-think-about-person-environment-fit
personality-and-motivation-what-drives-each-big-five-profile
personality-and-procrastination-what-research-says
personality-and-remote-work-who-thrives-who-struggles
personality-of-successful-ceos-what-research-says
personality-testing-in-hiring-what-is-legal-what-is-ethical
self-other-agreement-big-five-where-gaps-are-biggest
social-desirability-bias-personality-tests
what-is-a-facet-in-personality-psychology
what-is-extraversion-beyond-the-introvert-extrovert-binary
what-is-openness-to-experience-creativity-curiosity-and-its-limits
```

**Per tancar aquest buit, cal una d'aquestes dues vies:**

- **(A) Exportar** el camp `content->>'ca'` (i `title`, `description`) d'aquests 22
  articles de la base de dades a un fitxer del repositori, i tornar a executar el
  revisor de blog sobre eixe fitxer. És l'opció recomanada: a més d'auditar-los,
  posa el contingut sota control de versions.
- **(B) Afegir** `api.cercol.team` / `cercol.team` a l'allowlist d'eixida de xarxa
  de l'entorn perquè l'auditor puga llegir-los del lloc publicat.

---

## 7. Següents passos recomanats

1. **Aplicar la §4** (errades objectives) — canvi de baix risc, alt impacte; es pot
   fer immediatament i per separat.
2. **Validar la decisió de model** de la §3.2 (valencià desambiguat vs central).
3. **Passada d'unificació** del model triat a tots els fitxers de test i a `ca.json`,
   amb el quadre de la §3.3 i el glossari de la §3.4 com a referència.
4. **Tancar el buit del blog** (§6, via A o B) i auditar els 22 articles pendents.
5. Opcional: afegir una regla de CI que detecte barreja de morfologia (p. ex.
   coexistència de `-o`/`-e` o `siga`/`sigui`) per evitar regressions.

Les seccions detallades 01–05 contenen cada incidència amb ubicació exacta, text
anglès, text català actual, proposta i justificació.
