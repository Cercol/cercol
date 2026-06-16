# Auditoria filològica catalana/valenciana — Ítems de test

**Abast:** `src/data/new-moon.js` (10 ítems, TIPI) i `src/data/first-quarter.js` (60 ítems, IPIP-NEO-60)
**Mètode:** comparació ítem a ítem del camp font `en` (versió provada i validada) amb el camp `ca`. Model de referència: formes acceptades alhora per l'AVL (DNV/GNV) i l'IEC (DIEC2/GIEC), prioritzant solucions compartides pel màxim de parlants de tot el domini. «Valencià» i «català» s'usen com a sinònims absoluts.
**Auditor:** filòleg sènior, especialitat psicometria EN→CA.
**Data:** 2026-06-15.

---

## 0. Resum executiu

`new-moon.js` està net (cap incidència; són sintagmes adjectivals breus, ben resolts). Tot el pes de l'auditoria recau en `first-quarter.js`, que conté **dues errades objectives confirmades** (ítems 5 i 6), **un bloc gran de discrepància morfològica** (1a persona del present en -e/-ix(c), model valencià) que xoca frontalment amb `full-moon.js` (model central en -o/-eix(o)), i diversos punts de fidelitat/terminologia menors. Cap incidència compromet la validesa del constructe mesurat de manera greu, però els ítems 5 i 6 sí que afecten la lectura natural i, en el cas del 6, contenen una errata ortogràfica visible per a l'usuari.

---

## 1. new-moon.js (TIPI, 10 ítems)

Revisats un per un. Són parells d'adjectius, no oracions amb verb conjugat, de manera que no hi ha problema de morfologia de 1a persona ni de persona verbal. Tots fidels i normatius.

| id | en | ca actual | Valoració |
|----|----|-----------|-----------|
| 1 | Extraverted, enthusiastic. | Extravertit/da, entusiasta. | Correcte. «Extravertit» i «extrovertit» són tots dos al DIEC2/DNV; «extravertit» és preferent. OK. |
| 2 | Critical, quarrelsome. | Crític/a, conflictiu/va. | Acceptable. «Conflictiu» tradueix el constructe; alternativa més literal: «buscabregues/raonador», però «conflictiu» és natural i neutre. OK. |
| 3 | Dependable, self-disciplined. | De confiança, autodisciplinat/da. | Correcte i natural. OK. |
| 4 | Anxious, easily upset. | Ansiós/a, que s'altera fàcilment. | Correcte. OK. |
| 5 | Open to new experiences, complex. | Obert/a a noves experiències, complex/a. | Correcte. OK. |
| 6 | Reserved, quiet. | Reservat/da, tranquil·la. | Vegeu nota baixa més avall (concordança de la doble forma). |
| 7 | Sympathetic, warm. | Empàtic/a, càlid/a. | Correcte. «Empàtic» tradueix bé «sympathetic» (no «simpàtic», fals amic). Bona decisió. OK. |
| 8 | Disorganized, careless. | Desorganitzat/da, descurat/da. | Correcte. OK. |
| 9 | Calm, emotionally stable. | Calmat/da, emocionalment estable. | Correcte. OK. |
| 10 | Conventional, uncreative. | Convencional, poc creatiu/va. | Correcte. OK. |

### Incidència NM-1

- **Ubicació:** new-moon.js · id 6
- **Anglès:** Reserved, quiet.
- **Català actual:** `Reservat/da, tranquil·la.`
- **Categoria:** DISCREPÀNCIA (de patró de gènere)
- **Gravetat:** BAIXA
- **Proposta:** `Reservat/da, tranquil/la.`
- **Justificació:** Tots els altres adjectius del fitxer ofereixen la doble forma de gènere amb barra (`Extravertit/da`, `Crític/a`...). Ací, en canvi, només es dona la forma femenina sencera «tranquil·la», sense oferir la masculina «tranquil». Trenca la consistència del patró «masc/fem» i, de fet, presenta a tots els usuaris (inclosos els homes) la forma femenina. Cal `tranquil/la`. Nota: el masculí és «tranquil» (sense ela geminada); la geminada només apareix en el femení «tranquil·la» i derivats — la proposta és correcta ortogràficament.

---

## 2. first-quarter.js (IPIP-NEO-60, 60 ítems)

### 2.1 ERRADES objectives (altes/mitjanes)

#### Incidència FQ-1 — confirmada

- **Ubicació:** first-quarter.js · id 5 (facet hollow / Depression)
- **Anglès:** Often feel blue.
- **Català actual:** `Sovint em sent trist/a.`
- **Categoria:** ERRADA (persona verbal) + FIDELITAT (idiomatisme)
- **Gravetat:** ALTA
- **Proposta:** `Sovint em sent abatut/uda.` (model valencià, vegeu §3) — o `Sovint em sento abatut/uda.` si s'adopta model central.
- **Justificació:**
  1. *Persona verbal.* L'oració és en 1a persona («I feel»), però «em sent» és ambigu/incorrecte: aïllat, «sent» es llig com a 3a persona del present («ell/ella sent»). En valencià normatiu la 1a persona del present de *sentir* és **«sent»/«sento»** (forma plena) i col·loquialment «senc» (velar, no recomanada en registre escrit neutre); la forma central és «sento». La grafia «em sent» sense vocal final fa de mal llegir com a 1a persona i és la principal anomalia detectada. La solució neutra compartida és **«em sento»**; si es manté el model valencià en -e/sense -o de la resta del fitxer, la coherència demanaria «em sent» només si s'accepta aqueix paradigma, però aleshores genera l'ambigüitat amb la 3a persona. Recomanació: **«em sento»** (acceptada per AVL i IEC, sense ambigüitat). Vegeu el debat de model a §3.
  2. *Idiomatisme.* «feel blue» és idiomàtic (sentir-se abatut/decaigut), no «blau». «Trist» és acceptable però pla; el constructe de la faceta és *Depression*, i la traducció establida prefereix «abatut» / «decaigut» / «moix». `full-moon.js` (id 9) tradueix el mateix ítem com «em sento trist/a»: si es vol homogeneïtat entre instruments, alinear ambdós («abatut» o «trist», però la mateixa tria). Marco «trist» com a fidelitat MITJANA dins d'aquesta incidència ALTA per la persona verbal.

#### Incidència FQ-2 — confirmada

- **Ubicació:** first-quarter.js · id 6 (facet hollow / Depression)
- **Anglès:** Dislike myself.
- **Català actual:** `No m'aggrade a mi mateix/a.`
- **Categoria:** ERRADA (errata ortogràfica) + DISCREPÀNCIA (morfologia)
- **Gravetat:** ALTA
- **Proposta:** `No m'agrade a mi mateix/a.` (model valencià) — o `No m'agrado a mi mateix/a.` (model central, com `full-moon.js` id 10).
- **Justificació:** «aggrade» és una **errata** evident: el verb és *agradar* (una sola g). Mot inexistent en català/valencià. A més, el reflexiu «a mi mateix/a» reduplica innecessàriament el pronom (vegeu redundància FQ-R1). `full-moon.js` resol el mateix ítem com «No m'agrado a mi mateix/a». Correcció ortogràfica imprescindible.

#### Incidència FQ-3

- **Ubicació:** first-quarter.js · id 12 (facet fracture / Vulnerability)
- **Anglès:** Feel that I'm unable to deal with things.
- **Català actual:** `Sent que soc incapaç/incapaça de fer front a les coses.`
- **Categoria:** ERRADA (persona verbal) + AMBIGÜITAT
- **Gravetat:** MITJANA
- **Proposta:** `Sento que no soc capaç de fer front a les coses.` o `Sento que soc incapaç de fer front a les coses.`
- **Justificació:** Mateix problema que FQ-1: «Sent» inicial es llig com a 3a persona; cal «Sento» (neutre) o, si model valencià, deixar clar que és 1a persona. A més, la doble forma «incapaç/incapaça» és innecessària perquè *incapaç* és invariable en gènere (l'adjectiu acabat en -aç no fa femení en -aça en l'estàndard: «una persona incapaç»). La barra «incapaç/incapaça» introdueix una forma femenina forçada i no normativa. Nota: `full-moon.js` (id 22) repeteix l'errada amb encara més evidència («incapaç/incapaç», dues vegades igual) — això confirma que cal eliminar la doble forma en tots dos fitxers. Eliminar la barra: només «incapaç».

### 2.2 DISCREPÀNCIES de model (morfologia 1a persona) — vegeu inventari complet a §3

El fitxer sencer adopta sistemàticament el **model valencià** de 1a persona singular del present (desinència -e en la 1a conjugació i incoatius/velars en -ix/-ixc), mentre que `full-moon.js` adopta el **model central** (-o, -eix-/-eixo). Cada forma divergent és, en si mateixa, normativa dins del seu model; el problema és la **manca d'unificació entre fitxers** d'un mateix producte, que un usuari pot percebre com a inconsistència. Les llisto exhaustivament a §3. Gravetat global: MITJANA (no és error, és incoherència de model). Recomanació de model a §4.

Exemples representatius (no exhaustiu; vegeu taula §3):
- id 1 `Em preocupe` (val.) vs full-moon id 1 `Em preocupo` (cen.)
- id 3 `M'enfade` (val.) vs full-moon id 5 `M'enrabio` (cen., a més canvi lèxic)
- id 7 `M'avergonyesc` (val. incoatiu velar) vs full-moon id 13 `M'avergonyeixo` (cen.)
- id 22/31/32 `Preferixc` (val.) vs full-moon `Prefereixo` (cen.)
- id 53 `Complixc` (val.) vs full-moon no apareix; id 49 `Resolc`, id 17 `Prenc` (formes velars compartides, OK).

### 2.3 TERMINOLOGIA, FIDELITAT, REGISTRE, REDUNDÀNCIA, AMBIGÜITAT (ítem a ítem)

#### FQ-R1 — Redundància del reflexiu

- **Ubicació:** first-quarter.js · id 6 (i, per coherència, id 46)
- **Anglès:** Dislike myself. / Think highly of myself.
- **Català actual:** `No m'aggrade a mi mateix/a.` / `Tinc un alt concepte de mi mateix/a.`
- **Categoria:** REDUNDÀNCIA
- **Gravetat:** BAIXA
- **Proposta:** id 6 → `No m'agrade.` (el pronom reflexiu «m'» ja indica «a mi mateix»; «a mi mateix/a» és pleonàstic en aquest verb pronominal). id 46 és correcte (ahí «de mi mateix» no és reflexiu d'un verb pronominal, sinó complement; mantindre).
- **Justificació:** En *agradar-se*, el pronom feble ja expressa la reflexivitat; «agradar-se a un mateix» només s'usa com a èmfasi marcat. La versió anglesa «Dislike myself» és neutra, sense èmfasi, per tant «No m'agrade» és la traducció fidel i no redundant. Manté el paral·lelisme amb l'es «No me agrado» (que sí porta «a mí mismo/a» per gramàtica castellana, però el català no ho necessita).

#### FQ-4 — «apropar-se» vs «acostar-se»

- **Ubicació:** first-quarter.js · id 8 (facet veil)
- **Anglès:** Find it difficult to approach others.
- **Català actual:** `Em costa apropar-me als altres.`
- **Categoria:** TERMINOLOGIA/REGISTRE (model neutre)
- **Gravetat:** BAIXA
- **Proposta:** Mantindre `apropar-me` o, per a màxima neutralitat, `acostar-me`.
- **Justificació:** Tots dos verbs són normatius (DIEC2 i DNV). «Acostar-se» té implantació més general en tot el domini i és la forma tradicional preferida per alguns llibres d'estil; «apropar-se», tot i ser correcta i molt estesa, ha sigut històricament discutida. Per a un model neutre màximament compartit, «acostar-se» és lleugerament preferible. Decisió de baixa prioritat. (`full-moon.js` id 14 usa també «apropar-me»: coherents entre si, cosa que pesa a favor de deixar-ho.)

#### FQ-5 — «fantasiege» (forma valenciana de *fantasiejar*)

- **Ubicació:** first-quarter.js · id 26 (facet dream)
- **Anglès:** Seldom daydream.
- **Català actual:** `Rares vegades fantasiege.`
- **Categoria:** TERMINOLOGIA/FIDELITAT + DISCREPÀNCIA
- **Gravetat:** MITJANA
- **Proposta:** `Poques vegades somie despert/a.` (val.) o `Poques vegades somio despert/a.` (cen.); alternativa: `Rarament fantasiege/fantasiejo.`
- **Justificació:**
  1. *Fidelitat.* «daydream» = «somiar despert/a», «somiar despert», «fantasiejar». «Fantasiejar» captura el constructe però perd el matís de *daydream* (somieig diürn, no fantasia eròtica/imaginativa pura). `full-moon.js` (id 50) tradueix el mateix ítem com «em perdo en somnis desperts», que és més fidel. Recomane alinear cap a la imatge de «somiar despert».
  2. *Forma verbal.* «fantasiege» és la 1a persona valenciana de *fantasiejar* (verbs en -ejar fan -ege en val.: jo *fantasege/fantasiege*); en central seria «fantasiejo». Coherent amb el model valencià del fitxer, però divergeix de full-moon.
  3. *Registre.* «Rares vegades» és correcte però poc natural com a inici; «Poques vegades» o «Rarament» flueixen millor. (Vegeu també FQ-6.)

#### FQ-6 — «Rares vegades» (registre/naturalitat)

- **Ubicació:** first-quarter.js · id 26
- **Català actual:** `Rares vegades fantasiege.`
- **Categoria:** REGISTRE
- **Gravetat:** BAIXA
- **Proposta:** `Rarament` o `Poques vegades`.
- **Justificació:** «Rares vegades» és gramatical però menys idiomàtic que «rarament» / «poques vegades» en posició inicial absoluta. `full-moon.js` usa «Rarament» de manera consistent (id 50, 60, 20...). Unificar cap a «Rarament» reforça la coherència inter-fitxer.

#### FQ-7 — «No m'ande amb rodeos»

- **Ubicació:** first-quarter.js · id 39 (facet edge)
- **Anglès:** Don't beat around the bush.
- **Català actual:** `No m'ande amb rodeos.`
- **Categoria:** TERMINOLOGIA (calc del castellà) + DISCREPÀNCIA
- **Gravetat:** MITJANA
- **Proposta:** `No m'embolico/embolic amb rodeos` és igualment dubtós; millor un idiomàtic genuí: `Vaig al gra.` (model neutre, sense calc) o `No m'enredo amb voltes.`
- **Justificació:** «andar(se) con rodeos» és una expressió castellana; «anar-se amb rodeos» n'és un calc. El català genuí per a «beat around the bush» és **«anar(-se'n) per les branques»** o, en positiu, **«anar al gra»**. A més «m'ande» (1a persona val. d'*anar*) és correcta morfològicament però l'expressió de base és calcada. `full-moon.js` (id 77) resol el mateix ítem com «No m'embarbusso» (= no quequejo/embarbussar-se), que és **una traducció errònia diferent** (embarbussar-se ≠ anar-se'n per les branques). Tots dos fitxers fallen ací, de manera diferent. Proposta neutra i fidel: **«Vaig al gra.»** (afirmatiu, equivalent funcional de «don't beat around the bush»), present en tot el domini.

#### FQ-8 — «No m'entretinc amb facilitat»

- **Ubicació:** first-quarter.js · id 24 (facet radiance / Positive Emotions, ítem revers)
- **Anglès:** Am not easily amused.
- **Català actual:** `No m'entretinc amb facilitat.`
- **Categoria:** FIDELITAT
- **Gravetat:** BAIXA
- **Proposta:** `No em diverteixo/divertisc fàcilment.` o `No és fàcil fer-me riure.`
- **Justificació:** «amused» = divertit/entretingut; «entretenir-se» en català té un matís d'«ocupar el temps» més que de «passar-s'ho bé». L'es ho resol amb «No me divierto con facilidad». «Divertir-se» és més fidel al constructe d'emocions positives. `full-moon.js` (id 46) comet la mateixa tria («No m'entretinc»): si es canvia, canviar als dos. Prioritat baixa.

#### FQ-9 — «Visc les meues emocions amb intensitat»

- **Ubicació:** first-quarter.js · id 29 (facet resonance)
- **Anglès:** Experience my emotions intensely.
- **Català actual:** `Visc les meues emocions amb intensitat.`
- **Categoria:** FIDELITAT (acceptable)
- **Gravetat:** BAIXA
- **Proposta:** Mantindre, o `Experimente les meues emocions amb intensitat.`
- **Justificació:** «Viure les emocions» és una bona traducció natural de «experience emotions». No és error. Únic apunt: «meues» és la forma valenciana del possessiu (model -e), coherent amb el fitxer, divergent de full-moon que usa «meves». Vegeu §3.

#### FQ-10 — «Tendixc a votar per candidats... conservadors/es»

- **Ubicació:** first-quarter.js · id 36 (facet compass, revers)
- **Anglès:** Tend to vote for conservative political candidates.
- **Català actual:** `Tendixc a votar per candidats/tes polítics/ques conservadors/es.`
- **Categoria:** REGISTRE (sobrecàrrega de dobles formes) + AMBIGÜITAT
- **Gravetat:** BAIXA
- **Proposta:** `Tendisc/Tendeixo a votar candidats polítics conservadors.` (masculí genèric) o reescriure amb un nom no marcat: `Tendisc a votar opcions polítiques conservadores.`
- **Justificació:** L'acumulació de tres barres de gènere consecutives («candidats/tes polítics/ques conservadors/es») fa l'ítem visualment dens i de lectura feixuga, cosa indesitjable en un test on cal comprensió ràpida. L'objecte del vot no és el subjecte que respon, per tant la flexió de gènere no aporta informació psicomètrica; es pot usar el masculí genèric o un nom epicè. A més «Tendixc» és forma valenciana (incoatiu velar de *tendir*); el central és «Tendeixo». Nota: `full-moon.js` (id 70) divergeix completament del sentit: tradueix «Em veig com a políticament conservador» en compte de «Tendeixo a votar...»: discrepància de FIDELITAT entre fitxers (full-moon s'allunya de l'original). Ací (first-quarter) la fidelitat al `en` és bona; només cal alleugerir les dobles formes.

#### FQ-11 — «Soc indiferent/a»

- **Ubicació:** first-quarter.js · id 42 (facet gift)
- **Anglès:** Am indifferent to the feelings of others.
- **Català actual:** `Soc indiferent/a als sentiments dels altres.`
- **Categoria:** ERRADA (doble forma improcedent)
- **Gravetat:** BAIXA
- **Proposta:** `Soc indiferent als sentiments dels altres.`
- **Justificació:** «indiferent» és adjectiu **invariable en gènere** (com tots els acabats en -ent: «una persona indiferent»). La barra «indiferent/a» crea una forma femenina «indiferenta» inexistent. Eliminar la barra. (Cf. també «insistent» id 43, que sí està ben deixat sense barra.)

#### FQ-12 — «Em pose a les coses de seguida»

- **Ubicació:** first-quarter.js · id 57 (facet will)
- **Anglès:** Get started on things right away.
- **Català actual:** `Em pose a les coses de seguida.`
- **Categoria:** FIDELITAT/REGISTRE
- **Gravetat:** BAIXA
- **Proposta:** `Em pose a fer les coses de seguida.` o `Comence les coses de seguida.`
- **Justificació:** «posar-se a les coses» és lleugerament el·líptic; «get started on things» = «posar-se a fer les coses» / «posar fil a l'agulla». Afegir «fer» millora la naturalitat sense allargar gaire. «Em pose» és forma valenciana (model -e). `full-moon.js` no conté aquest ítem exacte. Prioritat baixa.

#### FQ-13 — «Faig que la gent se senta benvinguda»

- **Ubicació:** first-quarter.js · id 41 (facet gift)
- **Anglès:** Make people feel welcome.
- **Català actual:** `Faig que la gent se senta benvinguda.`
- **Categoria:** TERMINOLOGIA (subjuntiu valencià) — correcte
- **Gravetat:** BAIXA (informatiu)
- **Proposta:** Mantindre `se senta` (val.) o `se senti` (cen.).
- **Justificació:** «(que) se senta» és el present de subjuntiu valencià de *sentir-se*; el central és «se senti». Forma correcta dins del model valencià. La incloc per al recompte del model (§3): és subjuntiu, no indicatiu, però marca igualment la tria dialectal -a/-i.

#### FQ-14 — «Espere que altres prenguen la iniciativa»

- **Ubicació:** first-quarter.js · id 18 (facet command)
- **Anglès:** Wait for others to lead the way.
- **Català actual:** `Espere que altres prenguen la iniciativa.`
- **Categoria:** REGISTRE (article) + model
- **Gravetat:** BAIXA
- **Proposta:** `Espere que els altres prenguen la iniciativa.`
- **Justificació:** «altres» sense article inicial és correcte però menys natural; «els altres» és la forma habitual i la que usa `full-moon.js` (id 34: «Espero que els altres prenguin la iniciativa»). «Espere»/«prenguen» són formes valencianes (indicatiu -e i subjuntiu -en); full-moon usa «Espero»/«prenguin». Afegir l'article per coherència i naturalitat.

#### FQ-15 — «Faig amics/amigues amb facilitat»

- **Ubicació:** first-quarter.js · id 13 (facet hearth)
- **Anglès:** Make friends easily.
- **Català actual:** `Faig amics/amigues amb facilitat.`
- **Categoria:** REGISTRE (doble forma del complement)
- **Gravetat:** BAIXA
- **Proposta:** `Faig amics amb facilitat.` (masculí genèric per al complement) — opcional.
- **Justificació:** Igual que FQ-10: «amics/amigues» és el complement (les persones de qui em faig amic), no el subjecte; la flexió no aporta informació sobre qui respon. El masculí genèric «amics» és suficient i més lleuger. `full-moon.js` (id 25) repeteix «amics/amigues»: és consistent, per tant prioritat molt baixa; només si s'estableix una política de simplificar dobles formes en complements.

### 2.4 Ítems revisats i correctes (sense incidència)

Per a constància que la revisió ha sigut ítem a ítem, aquests han passat sense observacions (model verbal a banda, que es comptabilitza a §3): 1, 2, 3, 4, 9, 10, 11, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25, 27, 28, 30, 31, 32, 33, 34, 35, 37, 38, 40, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 58, 59, 60. Notes puntuals positives: id 48 «Crec en ull per ull» (bona traducció de l'idiomàtic «eye for an eye»); id 40 «Faig servir l'adulació per a progressar» (fidel; «per a + infinitiu» de finalitat, correcte en model valencià — el central admet «per progressar»); id 17/49 «Prenc/Resolc» (formes velars compartides per ambdós models, sense problema).

---

## 3. Inventari complet de formes verbals de 1a persona (per al debat del model neutre)

Llista exhaustiva de les formes de 1a persona singular (indicatiu present, més subjuntius rellevants) de `first-quarter.js`, amb la forma equivalent de `full-moon.js` quan l'ítem hi té parió, per visualitzar la fractura -e/-o.

| id FQ | Forma a first-quarter (val., -e/-ix(c)) | Forma a full-moon (cen., -o/-eix(o)) | Tipus |
|-------|------------------------------------------|--------------------------------------|-------|
| 1 | Em preocupe | Em preocupo (id 1) | 1a conj. -e/-o |
| 3 | M'enfade | M'enrabio (id 5, +lèxic) | 1a conj. -e/-o |
| 4 | M'irrite | M'irrito (id 6) | 1a conj. -e/-o |
| 5 | em sent (→ em sento) | em sento (id 9) | *sentir*, ERRADA val. |
| 6 | m'aggrade (→ m'agrade) | m'agrado (id 10) | 1a conj. -e/-o, ERRATA |
| 7 | M'avergonyesc | M'avergonyeixo (id 13) | incoatiu velar -esc/-eixo |
| 8 | apropar-me (inf.) | apropar-me (id 14) | infinitiu, coincideix |
| 9 | Actue | Actuo (id 17) | 1a conj. -e/-o |
| 10 | menge | menjo (id 18) | 1a conj. -e/-o |
| 11 | Em panique | Em poso en pànic (id 21, +lèxic) | 1a conj. -e/-o |
| 12 | Sent (→ Sento) | Sento (id 22) | *sentir*, ambigu |
| 13 | Faig | (Faig, divers) | velar compartida |
| 18 | Espere / prenguen | Espero / prenguin (id 34) | -e/-o, subj. -en/-in |
| 19 | estic | estic | compartida |
| 20 | prendre-m'ho (inf.) | pendre-m'ho (id 38) | infinitiu: FQ correcte «prendre», FM errada «pendre» |
| 22 | Preferixc | Prefereixo (id 42) | incoatiu velar -ixc/-eixo |
| 23 | Irradie | Irradio (id 45) | 1a conj. -e/-o |
| 24 | m'entretinc | m'entretinc (id 46) | velar compartida |
| 26 | fantasiege | (em perdo en somnis, id 50) | -ejar: -ege/-ejo |
| 29 | Visc / meues | Visc / meves (id 57) | velar compartida; possessiu meues/meves |
| 30 | entenc | (no parió directe) | velar compartida |
| 31 | Preferixc | Prefereixo (id 61) | incoatiu -ixc/-eixo |
| 32 | Preferixc | Prefereixo (id 62) | incoatiu -ixc/-eixo |
| 33 | Comprenc | Entenc (id 65, +lèxic) | velar compartida (lèxic difereix) |
| 36 | Tendixc | (Em veig, id 70, +sentit) | incoatiu -ixc/-eixo |
| 37 | Confie | Confio (id 73) | 1a conj. -e/-o |
| 38 | Sospite | Sospito (id 74) | 1a conj. -e/-o |
| 39 | m'ande | m'embarbusso (id 77, +sentit) | 1a conj. -e/-o (tots dos calc/error) |
| 40 | Faig servir | Faig servir (id 78) | velar compartida |
| 41 | Faig / se senta | (—) / se senta (subj. val.) | subj. -a/-i |
| 44 | Insulte | (no parió) | 1a conj. -e/-o |
| 47 | Simpatitze | (no parió) | 1a conj. -e/-o |
| 49 | Resolc | (no parió) | velar compartida |
| 50 | Avalue | (no parió) | 1a conj. -e/-o |
| 52 | Deixe / meua | (no parió) | -e/-o; possessiu meua/meva |
| 53 | Complixc | (no parió) | incoatiu -ixc/-eixo |
| 54 | Trenque | (no parió) | 1a conj. -e/-o |
| 55 | Treball | (no parió) | 1a conj. -e/-o (treballe? vegeu nota) |
| 56 | Dedique | (no parió) | 1a conj. -e/-o |
| 57 | Em pose | (no parió) | 1a conj. -e/-o |
| 59 | Pense | (no parió) | 1a conj. -e/-o |
| 60 | Prenc | (no parió) | velar compartida |
| 17 | Prenc | Prenc (id 33) | velar compartida |

**Nota crítica de coherència interna FQ (id 55):** «Treball dur» — la forma valenciana de *treballar* en 1a persona és **«treballe»** (jo treballe), no «treball». «Treball» és el substantiu, no la forma verbal valenciana. Açò és, doncs, una possible **ERRADA addicional** dins del propi model valencià del fitxer:

### Incidència FQ-16 — detectada en l'inventari

- **Ubicació:** first-quarter.js · id 55 (facet quest)
- **Anglès:** Work hard.
- **Català actual:** `Treball dur.`
- **Categoria:** ERRADA (forma verbal incoherent amb el model del fitxer) / AMBIGÜITAT
- **Gravetat:** MITJANA
- **Proposta:** `Treballe dur.` (val.) o `Treballo molt.` (cen.).
- **Justificació:** Dins del model valencià -e que segueix tot el fitxer (preocupe, enfade, actue, pense...), la 1a persona de *treballar* és **«treballe»**. «Treball» coincideix formalment amb el substantiu i, en aquest model, **no és la forma verbal**: és, doncs, una incoherència interna (i ambigua: es pot llegir com el nom «treball»). A més, «dur» com a adverbi («treballar dur») és un calc de l'anglès/castellà; el català natural prefereix **«treballar molt»** o «treballar de valent/de ferm». Proposta neutra fidel: «Treballe de valent» / «Treballe molt».

### Síntesi del model

- **Indicatiu present 1a conj. -e (valencià):** ítems 1, 3, 4, 6, 9, 10, 11, 23, 37, 38, 44, 47, 50, 54, 56, 57, 59 (i el problemàtic 55). → en model central serien -o.
- **Incoatius/velars valencians -isc/-ixc / -esc:** 7 (avergonyesc), 22/31/32 (preferixc), 36 (tendixc), 53 (complixc). → en central -eixo/-eixi (m'avergonyeixo, prefereixo, tendeixo, compleixo).
- **Verb *fantasiejar* -ege (val.):** 26. → central -ejo.
- **Possessius valencians:** meues (id 29), meua (id 52). → central meves, meva.
- **Subjuntiu valencià -a/-en:** se senta (41), prenguen (18). → central se senti, prenguin.
- **Formes velars compartides (cap problema, idèntiques en tots dos models):** Faig (13, 25, 40), estic (19), Prenc (17, 60), m'entretinc (24), Visc (29), entenc (30), Comprenc (33), Resolc (49).

---

## 4. Recomanació sobre la morfologia verbal neutra

El conflicte de fons és que **first-quarter.js és íntegrament valencià (-e, -ixc, meua)** i **full-moon.js és íntegrament central (-o, -eixo, meva)**. Cap dels dos és incorrecte; el problema és que conviuen en el mateix producte, i un mateix usuari pot fer els dos instruments i percebre la incoherència.

Hi ha dues vies coherents:

**Opció A — Model central (-o) com a estàndard de tota la web.** Avantatges: és el registre amb més massa de parlants i el més habitual en localització de programari i interfícies; les formes -o, -eixo no generen l'ambigüitat de 3a persona que pateix «em sent» (FQ-1, FQ-3). Les formes velars compartides (Faig, Prenc, Visc) ja són comunes. Inconvenient: implica reescriure first-quarter.js (≈25 formes).

**Opció B — Model valencià (-e) com a estàndard de tota la web.** Avantatges: respecta la identitat «Cèrcol / valencià» del projecte (AVL). Inconvenients: cal vigilar les trampes que ja han aparegut (el «em sent» 3a persona dels ítems 5/12, el «treball» nom vs verb de l'ítem 55); les formes -e en 1a persona poden coincidir amb formes de 3a persona o amb substantius i generar ambigüitat lectora en un test de resposta ràpida.

**La meua recomanació** és l'**Opció A (model central -o) com a base neutra de tota la plataforma**, per dos motius psicomètrics, no identitaris: (1) elimina de soca-rel l'ambigüitat de persona verbal que ja ha produït dues errades de lectura («em sent», «Sent que», «Treball»), crítica en un instrument on la comprensió immediata de la 1a persona és essencial per a la validesa; (2) maximitza la base de parlants i alinea amb la convenció de localització. Sigui quina sigui la decisió, **el requisit no negociable és unificar un sol model a tots els fitxers de dades** (`new-moon.js` no té verbs, però `first-quarter.js` i `full-moon.js` han d'anar igual), i corregir abans, en qualsevol cas, les errades objectives FQ-1, FQ-2, FQ-3, FQ-11, FQ-16 (independents del model).

Com a posició de compromís, si es vol conservar el caràcter valencià: adoptar el **valencià amb desinència plena -e** però substituir totes les ocurrències de *sentir* en 1a persona per «em sento» (forma acceptada per AVL i IEC, sense ambigüitat), evitar les formes verbals homògrafes de substantius (treball→treballe) i mantindre els incoatius en -ix (preferix → preferixc) amb revisió cas a cas. Tot i així, l'Opció A continua sent la més robusta per a un test.

---

## 5. Resum quantitatiu

| Categoria | ALTA | MITJANA | BAIXA | Total |
|-----------|------|---------|-------|-------|
| ERRADA | 2 (FQ-1, FQ-2) | 3 (FQ-3, FQ-16, + FQ-11 doble forma) | 2 (NM-1, FQ-11*) | — |
| DISCREPÀNCIA (model) | 0 | 1 (bloc §3 sencer) | — | — |
| TERMINOLOGIA | 0 | 2 (FQ-5, FQ-7) | 2 (FQ-4, FQ-13) | — |
| FIDELITAT | 0 | 1 (FQ-7 sentit) | 3 (FQ-8, FQ-9, FQ-12) | — |
| REGISTRE | 0 | 0 | 4 (FQ-6, FQ-10, FQ-14, FQ-15) | — |
| REDUNDÀNCIA | 0 | 0 | 1 (FQ-R1) | — |

**Recompte net d'incidències:** 17 entrades (NM-1; FQ-1 a FQ-16 amb FQ-R1).

- **Errades objectives ALTES (cal corregir ja):** 2 → ítem 5 («em sent» persona verbal + idiomatisme «blue») i ítem 6 («aggrade» errata ortogràfica).
- **Errades MITJANES:** ítem 12 («Sent que» + «incapaç/incapaça»), ítem 42 («indiferent/a» forma femenina inexistent), ítem 55 («Treball» nom vs verb + calc «dur»), ítem 39 («No m'ande amb rodeos» calc).
- **Discrepància de model (gran, transversal):** tot first-quarter.js (valencià -e) vs full-moon.js (central -o) — ~25 formes verbals i 2 possessius. No és error però és la incoherència més visible i extensa.
- **new-moon.js:** pràcticament net (1 sola nota baixa de concordança, NM-1).

**Prioritat d'actuació suggerida:** (1) corregir FQ-2 (errata) i FQ-1 (persona verbal) immediatament; (2) corregir FQ-3, FQ-11, FQ-16, FQ-42-doble-forma; (3) decidir i aplicar el model verbal únic a first-quarter.js + full-moon.js; (4) afinar fidelitat/registre (FQ-5, FQ-7, FQ-8...).

---

## Fonts normatives consultades

- AVL — Diccionari Normatiu Valencià (DNV) i Gramàtica Normativa Valenciana (GNV): paradigmes de 1a persona del present (-e 1a conj.; incoatius -ixc; *sentir* → «sent/sento», forma velar «senc» col·loquial no recomanada en registre escrit neutre). https://www.avl.gva.es/gnv/buscador.jsp?gramatica=GNV
- IEC — DIEC2 i GIEC: formes centrals -o / -eixo; «prendre» (no «pendre») com a infinitiu normatiu; adjectius invariables en -aç («incapaç») i en -ent («indiferent», «insistent»). https://dlc.iec.cat/
- Optimot / llibres d'estil: «anar-se'n per les branques» / «anar al gra» com a equivalents genuïns de «beat around the bush» (front al calc «anar-se amb rodeos»); «acostar-se»/«apropar-se» tots dos normatius.
- Comparació interna amb `src/data/full-moon.js` (versió central) com a font de discrepàncies de model.
