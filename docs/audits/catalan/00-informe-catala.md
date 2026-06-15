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
- **esADIR** (portal lingüístic de la CCMA), per a arbitrar variants lèxiques i de
  registre quan la norma n'admet diverses.
- **IIFV** (Institut Interuniversitari de Filologia Valenciana), convencions
  universitàries, per a fixar la forma valenciana culta quan existeix criteri.
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

### 3.2. Decisió central: eliminar la marca dialectal amb la 2a persona del plural

El conflicte irreductible del codi actual és la **1a persona del singular del
present** (First Quarter en `-e`: *em preocupe*; Full Moon bimodal: *em preocupo* /
*arribe*; `ca.json` amb subjuntius barrejats). Cap tria entre `-e` i `-o` és neutra:
cada una marca un dialecte als ulls de l'altra meitat del domini, i a més la 1a
persona valenciana genera **homògrafs ambigus** (*em sent*, *Sent que…*, *Treball*),
perillosos en un test de lectura ràpida.

**La solució adoptada elimina el problema d'arrel: es reformulen els ítems i les
instruccions de la 1a persona del singular a la 2a persona del plural (tractament de
vós).** Les desinències de 2a persona del plural —`-eu`/`-iu` i les formes
irregulars *sou, teniu, feu, aneu, voleu, sabeu, dieu, veieu*— són **idèntiques a
tot el domini lingüístic** (valencià, central, nord-occidental, balear): no hi ha
divisió `-e`/`-o` ni cap homògraf de 3a persona. És el mateix recurs que la
redacció supradialectal aplica als imperatius i a les instruccions per no marcar
cap variant.

```
Anglès (font)          1a pers. sing. (actual, marcat)       2a pers. pl. / vós (model)
Worry about things.    Em preocupe / Em preocupo per…         Us preocupeu per les coses.
Get angry easily.      M'enfade / M'enrabio amb facilitat.    Us enfadeu amb facilitat.
Often feel blue.       Sovint em sent/em sento trist.         Sovint us sentiu abatut o abatuda.
Am the life of party.  Soc l'ànima de la festa.               Sou l'ànima de la festa.
Don't worry…           No em preocupe / No em preocupo.       No us preocupeu per les coses.
```

**Concordança de gènere.** Es manté el tractament de **vós** (verb en 2a persona
del plural però referent únic), de manera que **l'adjectiu concorda en singular**:
*«Sovint us sentiu abatut o abatuda»*, no *«abatuts/abatudes»*. Així es conserva el
desdoblament binari actual (`/a`, `/da`) sense passar al plural, que seria més
feixuc. Aquesta és la solució recomanada; l'alternativa amb *vosaltres* (plural real
i adjectiu en plural) és viable però menys neta.

> **Acció:** convertir a 2a persona del plural **tots** els ítems amb verb finit de
> `first-quarter.js` (60) i `full-moon.js` (120), les instruccions del flux de test i
> les etiquetes d'escala. **No cal tocar** `new-moon.js` (parells d'adjectius, sense
> verb finit) ni `witness-adjectives.js` (adjectius solts): no tenen el problema.

### 3.2.bis. Les formes de 3a persona i impersonals (no resolubles amb vós)

El recurs de la 2a persona del plural només neutralitza els verbs que es refereixen
a qui respon. Les formes de **3a persona i impersonals** de la interfície (p. ex.
*«perquè el teu perfil siga/sigui útil»*, subjuntius de relatiu) **continuen exigint
una tria de variant**. Per a aquests casos s'aplica el criteri de la §3.1 (forma
acceptada per DNV ∩ DIEC2 i compartida pel màxim de parlants) i, quan hi ha dubte,
es consulta **esADIR** i les **convencions de l'IIFV** (vegeu §2). Cal triar-ne una i
ser-hi coherent a tot `ca.json`.

### 3.3. Quadre de formes del model

| Categoria | Forma del model | S'evita |
|-----------|-----------------|---------|
| Verb referit a qui respon (tests, instruccions) | **2a pers. pl. / vós**: *us preocupeu, sou, teniu, sentiu* (uniforme a tot el domini) | 1a pers. sing. *preocupe/preocupo* i tot homògraf (*em sent*, *Treball*) |
| Concordança d'adjectiu amb *vós* | **singular**: *abatut/abatuda* | plural *abatuts/abatudes* |
| Subjuntiu/3a pers. impersonal (UI) | una sola variant coherent (DNV ∩ DIEC2; arbitri esADIR/IIFV) | barreja *siga*/*sigui*, *siguen*/*siguin* |
| Possessius (UI, 3a pers.) | una sola sèrie coherent (*seua/seues* o *seva/seves*) | barreja *teua*+*teva* al mateix fitxer |
| Demostratiu | *aquest/aquesta* (compartit, no marcat) | barreja *este/eixe/aqueix* |
| Neutre demostratiu | *això* (compartit) amb coherència | barreja lliure *això/açò* |
| Indefinit | *alguna cosa* (compartit i planer) | *quelcom* (marcat) en text d'usuari |
| Lèxic amb variants (*sortir/eixir*, etc.) | forma compartida i no marcada, segons DNV ∩ DIEC2 / esADIR / IIFV | localismes col·loquials |

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

Les correccions s'expressen ja en el **model de vós** (§3.2). Les que no depenen del
model (errates, falsos sentits, adjectius) es poden aplicar fins i tot abans de la
conversió general.

| Fitxer · id | Actual | Correcció (model vós) | Tipus |
|---|---|---|---|
| `first-quarter.js` · 6 | «No m'**aggrade** a mi mateix/a» | «No **us agradeu a vós mateix**» (esmena l'errata + 2a pers. pl.) | errata + model |
| `first-quarter.js` · 5 | «Sovint em **sent** trist/a» | «Sovint **us sentiu abatut o abatuda**» (idiomàtic + desambigua) | persona verbal + fidelitat |
| `first-quarter.js` · 12 | «**Sent** que soc **incapaça**» | «**Us sentiu incapaç**» (*incapaç* és invariable) | persona + concordança |
| `first-quarter.js` · 42 | «Soc **indiferent/a**» | «**Sou indiferent**» (*indiferent* és invariable) | concordança |
| `full-moon.js` · 77 | «No m'**embarbusso**» | «**No us en aneu amb embuts / Aneu al gra**» | fals sentit (greu) |
| `full-moon.js` · 22 | «soc incapaç/**incapaç**» | «**Sou incapaç**» (sobra el desdoblament) | duplicació |
| `full-moon.js` · 38 | «**pendre**-m'ho» | «**prendre-vos-ho**» (ortografia + model) | ortografia |
| `full-moon.js` · 118 | «**prenga**» (indicatiu) | «**preneu**» | mode verbal |
| `full-moon.js` · 70 | «candidats/**tes**» + camp `de` en danès | desdoblament correcte + revisar el camp alemany | format + idioma |
| `witness-adjectives.js` · A+09 | «**considerador**» | «**considerat**» (adjectiu, sense canvi de model) | forma no normativa |
| `witness-adjectives.js` · C-02 | «**dispersat**» | «**dispers**» (adjectiu, sense canvi de model) | participi mal usat |

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
2. **Conversió al model de vós** (§3.2): reformular a 2a persona del plural tots els
   ítems amb verb finit de `first-quarter.js` (60) i `full-moon.js` (120), més les
   instruccions del flux de test i les etiquetes d'escala de `ca.json`. La proposta
   completa, ítem a ítem, és a [`06-conversio-fq.md`](06-conversio-fq.md) (First
   Quarter) i [`07-conversio-fm.md`](07-conversio-fm.md) (Full Moon).
3. **Unificació de les formes de 3a persona/impersonals** de `ca.json` (§3.2.bis i
   §3.3): subjuntius, possessius, demostratius i lèxic amb variants, arbitrant amb
   esADIR i IIFV i el glossari de la §3.4.
4. **Tancar el buit del blog** (§6, via A o B) i auditar els 22 articles pendents.
5. Opcional: afegir una regla de CI que detecte barreja de morfologia (coexistència
   de `-o`/`-e`, `siga`/`sigui` o 1a persona del singular als ítems de test) per
   evitar regressions.

Les seccions detallades 01–05 contenen cada incidència amb ubicació exacta, text
anglès, text català actual, proposta i justificació.
