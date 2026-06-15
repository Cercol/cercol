# Auditoria filològica — `src/locales/ca.json` vs `en.json`

**Abast:** totes les claus de primer nivell de `src/locales/ca.json` (~992 cadenes
fulles) comparades clau a clau amb `src/locales/en.json`. Model de referència:
neutre, culte, supradialectal, vàlid alhora per a AVL (DNV/GNV) i IEC (DIEC2/GIEC).
"Valencià" i "català" són sinònims absoluts; no es marca cap forma per motiu dialectal,
només per **incoherència interna** del conjunt.

**Metodologia:** aplanament JSON i comparació sistemàtica de claus comunes,
absents i sobrants; verificació d'interpolacions `{{var}}`; cerca de noms acadèmics,
del terme prohibit "observador", de castellanismes, d'errates i de variants
dialectals contradictòries. Fonts terminològiques: DNV, DIEC2, TERMCAT, guia
d'estil de Softcatalà.

**Conclusió de tractament:** la interfície fa servir **tu** (segona persona del
singular informal) de manera pràcticament uniforme. No hi ha cap forma de
**vós** ni de **vosté** d'adreçament. Les úniques formes de plural (`lastQuarter`,
`about/notThis/item4`) s'adrecen a l'equip (vosaltres) o trenquen el tractament
(vegeu §2). Les aparicions de "el seu / la seua / les seves" són **3a persona**
(referides a Stripe, als equips, als rols), no adreçament formal: són legítimes.

---

## 0. Resum executiu de problemes sistèmics

1. **Morfologia verbal del subjuntiu barrejada** (ALTA): conviuen formes valencianes
   (`siga`, `conega`, `descriga`, `vulgues`, `s'escalen`, `s'acumulen`) amb formes
   centrals (`sigui`, `siguin`, `hagin`, `pensin`, `s'acumulin`, `existeixin`, `iniciïs`).
   Cal triar-ne una i unificar. La interfície s'inclina majoritàriament a la
   morfologia valenciana (`teua`/`seua`, `prenc`, `preocupe`, `anticipe`),
   per la qual cosa les formes centrals són les minoritàries a esmenar.

2. **Possessius dialectalment incoherents** (MITJANA): domina `teua/teues` (40+) i
   `seua/seues` (3), però queden 3 estragalls amb `teves/seves/seves`.

3. **Demostratius i lèxic de registre barrejats** (MITJANA): `aquest/a` (30) vs
   `eixe/eixa` (6) + `aqueix/a` (en blocs de facetes); `això` (8) vs `açò` (2);
   `alguna cosa` (13) vs `quelcom` (14). Cada bloc tendeix a un patró diferent.

4. **Terme de producte "Testimoni" trencat** (ALTA): la secció `witnessResults` deixa
   "witnesses"/"Witness" **sense traduir** en 5 claus i conté el terme **prohibit
   "observadors"**.

5. **Noms de fase amb ordre i traducció incoherents** (MITJANA): domina
   "Cèrcol de Lluna Plena/Nova/Quart Creixent", però alguns usen l'ordre invers
   ("Lluna Nova Cèrcol", "Quart Minvant Cèrcol") i "First Quarter" es tradueix
   alhora com "Quart Creixent" i "Primer Quart".

6. **Anglès residual** (ALTA): 3 claus amb "Full Moon" sense traduir + 5 amb
   "witnesses"/"Witness" + "peer-reviewed".

7. **Errates i castellanismes greus** (ALTA): `conyides`, `s'arela`, `Deixeixes`,
   `Eres`, `está`, `importan`, `adelantes`, `s'incertifica`, `la drama`, `liderem`.

8. **Terminologia de producte/psicològica divergent** (MITJANA): peer-review
   traduït de 3 maneres; Conscientiousness com "Conscienciositat" vs "Responsabilitat";
   "privadesa" vs "privacitat".

---

## 1. Claus que falten o sense traduir

| Clau | Anglès | Català actual | Categoria | Gravetat | Proposta | Justificació |
|---|---|---|---|---|---|---|
| `nav/admin` | Admin | *(absent)* | DISCREPÀNCIA | MITJANA | Afegir `"admin": "Admin"` | Única clau fulla present a en.json i absent a ca.json; el menú d'admin quedarà sense etiqueta o farà *fallback* a l'anglès. |
| `groups/emptyNote` | …share your Full Moon results… | …compartir els resultats de **Full Moon**… | NOM-ACADÈMIC / DISCREPÀNCIA | ALTA | …els resultats de **Lluna Plena**… | Nom de fase sense traduir; trenca la convenció de noms Cèrcol. |
| `lastQuarter/pendingNote` | …completed **Full Moon** yet. | …no ha completat el **Full Moon**. | DISCREPÀNCIA | ALTA | …no ha completat la **Lluna Plena**. | Anglès residual. A més "el Full Moon" → "la Lluna Plena" (gènere). |
| `lastQuarter/pendingNote_plural` | …haven't completed **Full Moon** yet. | …no han completat el **Full Moon**. | DISCREPÀNCIA | ALTA | …no han completat la **Lluna Plena**. | Ídem en plural. |
| `witnessResults/roleViewSection` | How you and your witnesses see you | Com et veieu tu i els teus **witnesses** | DISCREPÀNCIA | ALTA | …i els teus **testimonis** | Terme anglès cru. |
| `witnessResults/selfOnlyNote` | …witnesses don't. | …els **witnesses** no. | DISCREPÀNCIA | ALTA | …els **testimonis** no. | Ídem. |
| `witnessResults/witnessOnlyNote` | Witnesses see this role; you don't. | Els **witnesses** veuen aquest rol; tu no. | DISCREPÀNCIA | ALTA | Els **testimonis** veuen… | Ídem. |
| `witnessResults/witnessViewLabel` | Witnesses see you as | Els **witnesses** et veuen com | DISCREPÀNCIA | ALTA | Els **testimonis** et veuen com | Ídem. |
| `witnessResults/witnessRoleDisclaimer` | The **witness** role… Different **observers**… | El rol del **Witness**… Diferents **observadors**… | DISCREPÀNCIA / NOM-PROHIBIT | ALTA | El rol del **Testimoni**… Diferents **testimonis**… | Doble infracció: "Witness" sense traduir i "observadors" (terme prohibit). |
| `faq/q10/a` | …peer-reviewed methodology… | …la metodologia **peer-reviewed**… | DISCREPÀNCIA | MITJANA | …la metodologia **revisada per experts**… | Anglicisme cru; existeix la forma catalana ja usada en altres claus. |

---

## 2. Inconsistència de tractament (tu / vós / vosté)

**Recompte:** tractament dominant = **tu** (singular informal), present a totes les
seccions d'interfície individual. Formes de **vós** d'adreçament: **0**. Formes de
**vosté** d'adreçament: **0**. Plurals legítims dirigits a l'equip (vosaltres):
secció `lastQuarter/narrative/help/*` (~10 cadenes: "Sigueu", "assigneu", "Reviseu"…),
acceptables perquè s'adrecen al col·lectiu.

**Trencaments puntuals del tractament (tu → vosaltres) a corregir:**

| Clau | Anglès | Català actual | Categoria | Gravetat | Proposta | Justificació |
|---|---|---|---|---|---|---|
| `about/notThis/item4` | …how you tend to operate — not what **you'll achieve**. | …com **soleu** funcionar — no el que **aconseguireu**. | TRACTAMENT | ALTA | …com **sols** funcionar — no el que **aconseguiràs**. | Tota la secció `about` s'adreça en tu singular ("et connectes", "mantens la teua"); aquesta cadena salta a vosaltres sense motiu. La cadena paral·lela `faq/q2/a` usa tu ("Pren les dimensions… tracta el rol"). |

> Nota: dins de `lastQuarter` hi ha dos imperatius mal formats que, a més de
> l'incident verbal (§4), reforcen la sensació d'inconsistència: `Ancorau` i `Rotat`.

---

## 3. Terminologia de producte traduïda de formes diferents

| Concepte | Variants trobades | Claus afectades | Categoria | Gravetat | Proposta |
|---|---|---|---|---|---|
| **Witness** (terme de producte) | "Testimoni" (correcte, majoritari) vs "witnesses"/"Witness" sense traduir vs "observadors" (prohibit) | `witnessResults/*` (5 claus, §1) | TERMINOLOGIA / NOM-PROHIBIT | ALTA | Unificar sempre a **Testimoni / testimonis**. |
| **First Quarter** (fase) | "Quart Creixent" (majoritari) vs "Primer Quart" | `nudge/firstQuarter/cta`, `nudge/firstQuarter/heading` | TERMINOLOGIA | MITJANA | Usar **Quart Creixent** a tot arreu. |
| **Ordre del nom de fase** | "Cèrcol de Lluna Plena" (majoritari) vs "Lluna Plena Cèrcol" / "Quart Minvant Cèrcol" / "Lluna Nova Cèrcol" | `nudge/firstQuarter/cta`, `nudge/fullMoon/cta`, `myResults/empty/cta`, `home/lastQuarter/name`, `faq/q9/a` (×2) | TERMINOLOGIA | MITJANA | Fixar un patró únic ("Cèrcol de {Fase}") i aplicar-lo. |
| **peer-reviewed** | "revisat/da per experts" vs "revisat/da per parells" / "entre parells" vs "peer-reviewed" | `science/openInstruments/body`, `faq/q2/a` / `seo/*`, `science/.../preprint/desc` / `faq/q10/a` | TERMINOLOGIA | MITJANA | Triar **revisat per experts** (UI/ciència) i mantenir-lo; eliminar l'anglicisme. |
| **Conscientiousness** (nom acadèmic) | "Conscienciositat" vs "Responsabilitat" | `science/dimensions/discipline/academic` vs `faq/q7/a` | TERMINOLOGIA | MITJANA | Unificar; "Responsabilitat" és la forma més assentada en psicologia en català. Mantenir coherència amb la resta (Neuroticisme, Amabilitat, Extraversió, Obertura, ja coincidents). |
| **privacy** | "privacitat" (5×, inclou títol de pàgina) vs "privadesa" (2×, només SEO) | `privacy/title`, `home/privacy`, `cookies/*`, `faq/cat/data` vs `seo/faq/title`, `seo/privacy/title` | TERMINOLOGIA | BAIXA | Unificar a **privacitat** (forma dominant a la UI). Totes dues són vàlides segons TERMCAT, però cal coherència. |
| **completions** | "completaments" (calc) | `science/roles/beta`, `rolesPage/beta/body` | TERMINOLOGIA | BAIXA | "300 **perfils de Lluna Plena completats**" o "300 **finalitzacions**". "Completament" com a substantiu comptable és forçat. |

---

## 4. Errades (errates, concordança, castellanismes, accents, apòstrofs)

| Clau | Anglès | Català actual | Categoria | Gravetat | Proposta | Justificació |
|---|---|---|---|---|---|---|
| `faq/q3/a` | …someone you invite to describe you… | …algú que **conyides** a descriure't… | ERRADA | ALTA | …algú que **convides** a descriure't… | Errata greu i d'aparença vulgar; molt visible (FAQ). |
| `science/roles/body` | …is grounded in the AB5C circumplex… | La taxonomia de rols **s'arela** en el circumplexe… | ERRADA | ALTA | …**s'arrela** en el circumplex… | "Arelar" no existeix; el verb és "arrelar" (doble r). |
| `facets/assertiveness/low` | You give others space to lead… | **Deixeixes** espai als altres per liderar… | ERRADA | ALTA | **Deixes** espai als altres… | Forma verbal inventada. |
| `fqFacets/veil/high` | You're aware of how you come across… | **Eres** conscient de com apareixes… | ERRADA (castellanisme) | ALTA | **Ets** conscient… | "Eres" és castellà/incorrecte. |
| `fqFacets/thrill/low` | …everyone else is distracted by the drama. | …tothom altre **está** distret per **la drama**. | ERRADA | ALTA | …tothom **està** distret pel **drama**. | Accent castellà ("está" → "està") i gènere ("drama" és masculí: "pel drama"). |
| `fqFacets/will/high` | …things that matter actually get finished. | …les coses que **importan**. | ERRADA (castellanisme) | ALTA | …les coses que **importen**. | Conjugació castellana. |
| `fqFacets/vigil/low` | You don't borrow trouble from the future… when things get uncertain. | No **t'adelantes** als problemes… quan tot **s'incertifica**. | ERRADA (castellanisme + invenció) | ALTA | No **t'avances** als problemes… quan tot **es torna incert**. | "Adelantar" és castellanisme; "incertificar-se" no existeix. |
| `fqFacets/command/low` | You let others lead… | Deixes que els altres **liderem**… | ERRADA (concordança) | ALTA | Deixes que els altres **lideren** (val.) / **liderin** (centr.) | "Liderem" és 1a persona del plural; cal 3a persona del plural. |
| `lastQuarter/narrative/help/high_v` | Anchor creative sessions… | **Ancorau** les sessions creatives… | ERRADA (morfologia) | MITJANA | **Ancoreu**… | Imperatiu de vosaltres d'"ancorar" = "ancoreu"; "ancorau" és balear/erroni en model neutre. |
| `lastQuarter/narrative/help/high_p` | Rotate who opens discussion. | **Rotat** qui obre la discussió. | ERRADA (morfologia) | MITJANA | **Roteu** qui obri la discussió. | "Rotat" és participi; cal imperatiu de vosaltres. |
| `dimensions/presence/high` | …stillness isn't your natural state. | …**l'immobilitat** no és el teu estat natural. | ERRADA (apòstrof) | MITJANA | …**la immobilitat** no és… | Els femenins que comencen per i/u àtones no s'apostrofen: "la immobilitat". |
| `roles/R03/misses` | The team can think clearly together… | L'equip pot pensar clarament **junts**… | ERRADA (concordança) | MITJANA | …pot pensar clarament **plegat** / rephrase. | "Equip" (singular) + "junts" (plural masc.) no concorden. |
| `onboarding/firstQuarter/desc` | …broken into 30 facets. | …**desglosades** en 30 facetes. | ERRADA (ortografia) | MITJANA | …**desglossades**… | Doble s; cf. `newMoonResults/upgrade/body` ja escriu "desglossa" bé. |
| `faq/q11/a` | …scores are averaged… | …les puntuacions **es promitgen**. | TERMINOLOGIA | MITJANA | …**es fa la mitjana de les puntuacions**. | "Promitjar" no és normatiu (DNV/DIEC). |
| `fqFacets/counsel/high` | …consequences get mapped. | …les conseqüències **es mapegen**. | TERMINOLOGIA | BAIXA | …es **preveuen** / es **representen**. | "Mapejar" és anglicisme col·loquial; evitar en text formal. |

---

## 5. Fidelitat (sentit alterat)

| Clau | Anglès | Català actual | Categoria | Gravetat | Proposta | Justificació |
|---|---|---|---|---|---|---|
| `faq/q7/a` | …the full item pool and scoring logic are open and **citable**. | …el conjunt d'ítems i la lògica de puntuació són oberts i **citats**. | FIDELITAT | MITJANA | …són oberts i **citables**. | "citable" (que es pot citar) ≠ "citats" (ja citats); canvia el sentit. |
| `roles/R08/essence` | …when you are not there, the team drifts. | …quan **no ets**, l'equip deriva. | FIDELITAT / AMBIGÜITAT | MITJANA | …quan **no hi ets**, l'equip deriva. | "quan no ets" queda truncat (manca el pronom locatiu "hi"); cf. `roles/R01` "Quan tu ets a la sala". |
| `roles/R04/profile` | Independent, **observant**, and precise. | Independent, **observador** i precís. | NOM-PROHIBIT / FIDELITAT | ALTA | Independent, **atent** (o **perspicaç**) i precís. | "observant" és adjectiu (atent), no "observador"; i "observador" és terme prohibit (sempre "Testimoni" per al rol del Witness, i s'ha d'evitar el mot en general). |

---

## 6. Noms acadèmics fora de context SEO/ciència/blog

Segons CLAUDE.md, els noms acadèmics (Big Five, OCEAN, IPIP, NEO, AB5C) estan
permesos a `seo`, `science` i `blog`, i prohibits a la resta. Cal una decisió de
producte sobre la FAQ i la pàgina de rols, perquè **l'anglès original també els
conté** en aquestes claus (no és un error de traducció, sinó una herència de la
font). Es marquen com a observació perquè, en lectura estricta de la norma, són
infraccions a la UI.

| Clau | Català actual | Categoria | Gravetat | Justificació |
|---|---|---|---|---|
| `faq/q7/q` | Cèrcol es basa en el **Big Five (OCEAN)**? | NOM-ACADÈMIC | BAIXA | La FAQ no és `seo`/`science`; però replica l'anglès. Decisió de producte. |
| `faq/q7/a` | …model **OCEAN (Big Five)** a través de l'**IPIP**… | NOM-ACADÈMIC | BAIXA | Ídem. |
| `faq/q8/a` | …els ítems provenen del **Big Five (OCEAN)**… (**IPIP**)… | NOM-ACADÈMIC | BAIXA | Ídem. |
| `rolesPage/intro/body2` | …circumplexe **AB5C**… Tres dimensions **OCEAN**… | NOM-ACADÈMIC | BAIXA | `rolesPage` no és `science`; replica l'anglès. Decisió de producte. |

> No s'ha trobat cap nom acadèmic addicional fora dels contextos permesos a la
> resta del fitxer; tots els altres apareixen a `seo/*` i `science/*` (correcte).

---

## 7. Estragalls dialectals de possessiu (model neutre incoherent)

| Clau | Català actual | Categoria | Gravetat | Proposta |
|---|---|---|---|---|
| `about/explore/roles/desc` | …les **seves** limitacions honestes. | REGISTRE/coherència | MITJANA | …les **seues** limitacions… (per coherència amb el conjunt). |
| `seo/faq/description` | …què fem amb les **teves** dades… | REGISTRE/coherència | BAIXA | …les **teues** dades… |
| `seo/privacy/description` | …gestiona les **teves** dades… els **teus** drets… | REGISTRE/coherència | BAIXA | …les **teues** dades… els **teus** drets… (ja és "teus", coherent; només "teves"→"teues"). |

> Domina `teua/teues` (40+) i `seua/seues` (3). Aquests 3 punts trenquen la
> coherència. Si es preferís el patró central (`teva/seva`), llavors caldria
> canviar els 40+ casos majoritaris; per economia, s'aconsella unificar a la
> forma majoritària `teua/seua`.

---

## 8. Subjuntiu i lèxic de registre incoherents (detall)

**Subjuntiu valencià (-a/-e/-ga) vs central (-i):** triar-ne un. Casos centrals
minoritaris a alinear amb la majoria valenciana:

- `sigui` / `siguin` — `about/dimensions/subheading`?, `privacy/retention/body`
  ("estigui"), `privacy/rights/deletion` ("siguin").
- `hagin` — `fqFacets/radiance/high`.
- `pensin` — `roles/R03/profile` ("pensin en veu alta").
- `acumulin` — `science/roles/beta`, `rolesPage/beta/body`, `lastQuarter/.../low_p`.
- `existeixin` — `science/validation/note`.
- `iniciïs` — `fqResults/unlock/signInNote`.
- Subjuntius `-in`/imperatius centrals diversos a `lastQuarter/narrative/help/*`
  ("s'acumulin", "assigneu"… alguns coherents amb vosaltres, revisar cas a cas).

**Demostratius/lèxic per blocs (coherència):**

- Bloc `facets/*` (Lluna Plena): usa "Aqueix/Aqueixa" + "alguna cosa".
- Bloc `fqFacets/*` (Quart Creixent): usa "Eix/Eixa" + "quelcom".
- Resta de la UI: usa "aquest/aquesta" + "això".

Categoria REGISTRE, gravetat MITJANA. Recomanació: per a microcòpia d'interfície
neutra, preferir **aquest/aquesta** i **això** (supradialectals, sense marca), i
reservar "eixe/aqueix" només si es vol un to deliberadament valencià... però llavors
aplicar-ho de manera uniforme. Ara mateix cada bloc va per lliure.

---

## 9. Resum quantitatiu

| Categoria | Recompte d'incidències |
|---|---|
| ERRADA (errates/concordança/castellanismes/accents/apòstrofs) | 14 |
| DISCREPÀNCIA / anglès residual / clau absent | 10 |
| TERMINOLOGIA (producte i psicològica) | 7 conceptes (afecten ~16 claus) |
| FIDELITAT (sentit alterat) | 3 |
| NOM-PROHIBIT ("observador") | 2 (`roles/R04/profile`, `witnessResults/witnessRoleDisclaimer`) |
| NOM-ACADÈMIC fora de context permès (heretat de l'anglès) | 4 (decisió de producte) |
| TRACTAMENT (trencament tu→vosaltres) | 1 |
| REGISTRE / coherència dialectal (possessius, demostratius, subjuntiu, lèxic) | sistèmic: ~3 possessius + ~9 subjuntius centrals + 3 patrons de bloc divergents |

**Interpolacions `{{var}}`:** cap discrepància (totes les variables d'en.json
es conserven a ca.json). **Espais dobles:** cap.

**Verificacions de tractament:** vós d'adreçament = 0 · vosté d'adreçament = 0 ·
tu = tractament únic i (gairebé) consistent · 1 sol trencament puntual (§2).

---

*Fonts terminològiques consultades:* TERMCAT (Cercaterm: "privacitat"/"privadesa",
totes dues vàlides i sinònimes), DNV i DIEC2 (formes verbals i "arrelar"/"promitjar"),
guia d'estil de Softcatalà per a interfícies (apòstrof davant i/u àtones, imperatius).
