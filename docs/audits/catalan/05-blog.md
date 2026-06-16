# Auditoria del contingut català — Articles de blog (05-blog)

Auditoria filològica del contingut català (camp `ca`) dels quatre articles de
blog de Cèrcol, comparat amb la font validada en anglès (camp `en`). Model de
llengua: neutre, culte, supradialectal, vàlid alhora per a AVL (DNV/GNV) i IEC
(DIEC2/GIEC). "Valencià" i "català" s'usen com a sinònims absoluts.

Fonts de validació terminològica consultades:

- TERMCAT — Consulteca, fitxa «desitjabilitat social» (tendència de resposta als tests).
- Viquipèdia / materials universitaris (UB, UOC) per a «psicometria», «psicomètric», «model circumplex».
- Diccionaris.cat i WordReference per a «afalac» / «adulació» (cast. *halago*).
- Guia d'estil de Softcatalà i bibliografia sobre el sistema demostratiu (reforçat vs. no reforçat) en el model neutre.

---

## Resum executiu — problemes recurrents (transversals als quatre articles)

Aquests defectes es repeteixen i convé tractar-los de manera unificada abans
d'anar article per article.

### R1 — "psicoemètric" → "psicomètric" [ERRADA · ALTA]
La forma **psicoemètric / psicoemètrica / psicoemètriques** és incorrecta:
no existeix. El terme català és **psicomètric -a** (de *psicometria*; cf. cast.
*psicométrico*, ang. *psychometric*). La *-e-* paràsita sembla un creuament
amb la pronúncia castellana. Apareix sistemàticament:

- Article 1: «l'estàndard psicoemètric» (títol de secció), «model psicoemètric» (×2), «qualitat psicoemètrica» (al castellà es diu correctament «psicométrico»; només el català fa l'error).
- Article 4: «propietats psicoemètriques sòlides», «qualitat psicoemètrica comparable».

Proposta global: substituir totes les ocurrències per **psicomètric/-a/-iques**.
Gravetat ALTA: és el terme tècnic central de tot el domini i l'error és visible
en titulars de secció.

### R2 — "circumflex" → "circumplex" [TERMINOLOGIA/CALC · ALTA]
L'anglès diu **personality circumplex** (model circular de la personalitat).
El català ho tradueix per **circumflex**, que és un fals amic: *circumflex* és
l'accent (^) o un múscul/artèria (p. ex. l'artèria circumflexa), no el model
psicològic. El terme correcte és **circumplex** (model circumplex de la
personalitat), igual que en castellà «circumplejo» i en anglès «circumplex».
Apareix a articles 1, 2 i 3. Gravetat ALTA: error conceptual que canvia el
referent.

### R3 — Incoherència del sistema demostratiu [REGISTRE/COHERÈNCIA · MITJANA]
El model neutre admet tant les formes reforçades (*aquest, aquesta, aquestes*)
com, en registre valencià, les no reforçades (*este, esta, estes*); però no
barrejades dins d'un mateix text ni d'una mateixa col·lecció. Estat actual:

- Articles 1 i 3: **aquest/aquesta/aquestes** (reforçat) de manera coherent.
- Article 2: barreja **esta lògica**, **estes troballes**, **estes cinc dimensions**, **estos efectes** amb «aquesta guia».
- Article 4: usa **aquest/aquesta** majoritàriament però conviu amb la resta.

Proposta: triar UNA sèrie per a tota la col·lecció de blog i aplicar-la. Per a
un model neutre supradialectal recomanat per a divulgació pan-territorial,
la sèrie reforçada (*aquest/aquesta/aquests/aquestes*) és la més segura i
neutra. Gravetat MITJANA (no és error, és coherència de col·lecció).

### R4 — "biaix de deseabilitat social" → "biaix de desitjabilitat social" [TERMINOLOGIA/CALC · ALTA]
A l'article 1 (peu i cos), el calc **deseabilitat social** (del cast.
*deseabilidad*) és incorrecte. El terme normalitzat per TERMCAT és
**desitjabilitat social**, que els articles 2 i 3 SÍ que utilitzen. Cal
unificar a **desitjabilitat social** a tot arreu.

### R5 — Tractament personal incoherent [REGISTRE · MITJANA]
Les guies pràctiques mesclen el tractament de "tu". A l'article 2 («Comença»,
«el teu equip», «Utilitza», «Revisita-ho») és coherent en segona persona del
singular informal. A l'article 3 («Consulteu la pàgina de ciència»,
«Consulteu») apareix el "vós" / imperatiu de cortesia, que contrasta amb el
"tu" usat a la resta. Cal triar un únic tractament per a tota la col·lecció.

---

## Article 1 — "Big Five vs DISC vs Belbin: comparació científica"
(`scripts/update_blog_article_1.py`, claus `ca`)

### 1.1 Títol de secció «l'estàndard psicoemètric» (línia ~121)
- Anglès: "the psychometric standard"
- Català actual: «l'estàndard psicoemètric»
- Categoria: ERRADA · Gravetat ALTA
- Proposta: «l'estàndard psicomètric»
- Justificació: vegeu R1. Error en un titular de secció, molt visible.

### 1.2 «model psicoemètric» (secció DISC, línies ~129, 131, 135)
- Anglès: "psychometric model" / "psychometric personality instrument"
- Català actual: «model psicoemètric», «instrument psicoemètric»
- Categoria: ERRADA · Gravetat ALTA
- Proposta: «model psicomètric», «instrument psicomètric»
- Justificació: R1.

### 1.3 «el circumflex de personalitat» (Nestsiarovich, línia ~143)
- Anglès: "team roles grounded in the personality circumplex"
- Català actual: «els rols d'equip basats en el circumflex de personalitat»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat ALTA
- Proposta: «els rols d'equip basats en el circumplex de personalitat» (o «el model circumplex de la personalitat»)
- Justificació: R2.

### 1.4 «biaix de deseabilitat social» (línia ~149)
- Anglès: "social desirability bias"
- Català actual: «reduint el biaix de deseabilitat social»
- Categoria: CALC/TERMINOLOGIA · Gravetat ALTA
- Proposta: «reduint el biaix de desitjabilitat social»
- Justificació: R4. Forma normalitzada per TERMCAT; coherència amb arts. 2 i 3.

### 1.5 «no es corresponen de manera neta» (secció DISC, línia ~133)
- Anglès: "do not map cleanly onto the Big Five factor structure"
- Català actual: «no es corresponen de manera neta amb l'estructura del Big Five»
- Categoria: CALC · Gravetat MITJANA
- Proposta: «no es corresponen de manera nítida amb l'estructura del Big Five» o «no encaixen netament en l'estructura del Big Five»
- Justificació: «de manera neta» és calc del cast. *limpiamente*/ang. *cleanly*; en català «net» aplicat a una correspondència és semànticament fluix. «Nítida» o «clara» són més precises.

### 1.6 Omissió respecte de l'anglès (secció DISC, línia ~133)
- Anglès: "...the Big Five factor structure, **which means findings from Big Five research do not automatically transfer to DISC interpretations.**"
- Català actual: «...amb l'estructura del Big Five.» (la subordinada explicativa s'ha eliminat)
- Categoria: FIDELITAT · Gravetat MITJANA
- Proposta: afegir «, cosa que significa que les troballes de la investigació sobre el Big Five no es transfereixen automàticament a les interpretacions del DISC.»
- Justificació: es perd una conclusió argumentativa present a la font validada. (El castellà fa la mateixa omissió, però la font canònica és l'anglès.)

### 1.7 «útil marc de comunicació» (secció DISC, línia ~135)
- Anglès: "can serve as a useful communication framework"
- Català actual: «pot servir com a útil marc de comunicació per als equips»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «pot servir com a marc de comunicació útil per als equips»
- Justificació: l'anteposició de l'adjectiu («útil marc») és un calc de l'ordre anglès *useful framework*; en català la posposició («marc útil») és la natural.

### 1.8 «exclusivament per tres raons» (secció "Per què Cèrcol...", línia ~147)
- Anglès: "uses IPIP items exclusively for three reasons"
- Català actual: «utilitza ítems IPIP exclusivament per tres raons»
- Categoria: ERRADA (preposició) · Gravetat BAIXA
- Proposta: «utilitza exclusivament ítems IPIP per tres raons» (millor ordre) i, sobretot, vigilar «per/per a»: ací «per tres raons» (causa) és correcte. El problema real és l'ordre: «ítems IPIP exclusivament» calca l'anglès. Reordenar a «utilitza exclusivament ítems IPIP».
- Justificació: posició de l'adverbi calcada de l'anglès.

### 1.9 «avaluació de parells» (secció final, línia ~149)
- Anglès: "Cèrcol's peer assessment"
- Català actual: «L'avaluació de parells de Cèrcol»
- Categoria: TERMINOLOGIA · Gravetat BAIXA (coherència)
- Proposta: unificar amb «avaluació entre iguals» o mantenir «de parells» de manera coherent. Nota: a l'article 2 es tradueix *peer assessment* per «avaluació de parells» i el constructe es lliga a «Primer Quart»; a l'article 3 s'usa «percepció de parells». «De parells» és acceptable però «entre iguals»/«de companys» sol ser més transparent en divulgació. Cal decidir una sola forma per a la col·lecció.
- Justificació: coherència terminològica inter-article.

### Resum quantitatiu Article 1
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA | 2 | – | 1 |
| TERMINOLOGIA/CALC | 2 | 1 | 2 |
| FIDELITAT | – | 1 | – |
| Total incidències | **4** | **2** | **3** |

---

## Article 2 — "Com construir un equip equilibrat usant la ciència de la personalitat"
(`scripts/update_blog_article_2.py`, claus `ca`)

### 2.1 Demostratius no reforçats barrejats (cos sencer)
- Català actual: «esta lògica» (línia ~122), «Estes cinc dimensions» (~136), «Estes troballes» (~144), «estos efectes» (~144), conviuen amb «aquesta guia» (~112).
- Categoria: REGISTRE/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar a la sèrie reforçada per coherència amb articles 1 i 3: «aquesta lògica», «Aquestes cinc dimensions», «Aquestes troballes», «aquests efectes».
- Justificació: R3. L'error no és de gramàtica (totes dues sèries són normatives) sinó de coherència: dins del mateix text conviuen «aquesta» i «esta».

### 2.2 «usant la ciència de la personalitat» (títol)
- Anglès: "using personality science"
- Català actual: «usant la ciència de la personalitat»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «amb la ciència de la personalitat» o «a partir de la ciència de la personalitat»
- Justificació: el gerundi instrumental «usant» calca l'anglès *using*. En català el complement de mitjà amb «amb» és més idiomàtic en un títol. (Cf. la versió alemanya «mit Persönlichkeitswissenschaft».)

### 2.3 «va estendre esta lògica» (línia ~122)
- Anglès: "extended this logic to the team level"
- Català actual: «va estendre esta lògica al nivell d'equip»
- Categoria: ERRADA (lèxic) + demostratiu · Gravetat MITJANA
- Proposta: «va ampliar aquesta lògica al nivell d'equip» (o «va estendre»)
- Justificació: «estendre» és correcte però «ampliar/fer extensiu» encaixa millor amb *extend* en sentit figurat (estendre una lògica). A més, «esta» → «aquesta» (R3).

### 2.4 «el paper de la diversitat» (títol de secció, línia ~138)
- Anglès: "the role of diversity"
- Català actual: «el paper de la diversitat»
- Categoria: correcte · Gravetat — (sense incidència; «paper» = rol és bon català, es registra per descartar fals positiu).

### 2.5 «un sol membre molt poc amable» / «l'alta Amabilitat» (línia ~140)
- Anglès: "even one very disagreeable member ... other members' high Agreeableness"
- Català actual: «un sol membre molt poc amable ... l'alta Amabilitat dels altres membres»
- Categoria: FIDELITAT/REGISTRE · Gravetat BAIXA
- Proposta: acceptable. Opcionalment «molt poc afable» per evitar la repetició amb la dimensió «Amabilitat». Es manté la coherència amb la dimensió Amabilitat (Bond), per tant es prefereix no tocar.
- Justificació: nota de coherència; no és error.

### 2.6 «cultura de retroalimentació» (línia ~144)
- Anglès: "feedback culture"
- Català actual: «cultura de retroalimentació»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: acceptable; «retroacció» és l'alternativa TERMCAT més curta, però «retroalimentació» és normatiu i transparent. Cap canvi necessari. (Es registra per coherència amb l'art. 3, que parla de «retroalimentació» i «feedback» — vegeu 3.x.)

### 2.7 «agregats a nivell d'equip» (línia ~148)
- Anglès: "team-level aggregates"
- Català actual: «agregats a nivell d'equip»
- Categoria: REGISTRE · Gravetat BAIXA
- Proposta: «dades agregades a escala d'equip» o «valors agregats de l'equip»
- Justificació: «a nivell de» és tolerat però desaconsellat per la majoria de guies d'estil (Softcatalà, IEC) quan no expressa alçària real; es recomana «a escala de» o «en l'àmbit de». Apareix també com «a nivell d'equip» més avall i a l'art. 3. Recurrent.

### 2.8 «No utilises ... per excloure persones» (línia ~154)
- Anglès: "Do not use personality data to exclude people"
- Català actual: «No utilises les dades de personalitat per excloure persones»
- Categoria: ERRADA (preposició) · Gravetat MITJANA
- Proposta: «No utilitzes les dades de personalitat **per a** excloure persones»
- Justificació: davant d'infinitiu de finalitat, el model neutre admet «per a + infinitiu» quan hi ha finalitat (norma IEC 2016/AVL). Ací el sentit és final («amb la finalitat d'excloure»), per tant «per a excloure». La forma verbal «utilises» (incoativa valenciana) és correcta però cal coherència amb «Utilitza» imperatiu de la mateixa secció: millor «utilitzes». Doble qüestió: preposició + coherència morfològica.

### 2.9 Coherència morfològica verbal: «utilises» vs «utilitza» (secció pràctica)
- Català actual: conviuen «No utilises» (subjuntiu/present incoatiu amb -is/-es valencià) i imperatius «Comença», «Analitza», «Identifica», «Revisita-ho».
- Categoria: REGISTRE/COHERÈNCIA · Gravetat MITJANA
- Proposta: regularitzar la flexió incoativa: triar -isc/-eix o -e de manera uniforme. En model neutre, «utilitzes» (no «utilises»). Revisar tota la secció.
- Justificació: principi 3 (coherència de morfologia verbal). «utilises» amb -s i «serveix»/«requereix» en altres punts no s'han d'alternar arbitràriament.

### 2.10 «t'està perdent senyals» — (no en aquest article; vegeu art. 3.x)

### Resum quantitatiu Article 2
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (preposició/lèxic) | – | 2 | – |
| REGISTRE/COHERÈNCIA (demostratius, morfologia, "a nivell de") | – | 2 | 3 |
| Total incidències | **0** | **4** | **3** |

---

## Article 3 — "Punts cecs en equips: quan l'autopercepció divergeix de la percepció dels parells"
(`scripts/update_blog_article_3.py`, claus `ca`)

### 3.1 «la seva posició» / «la seva pròpia visió» (línies ~131, 147)
- Anglès: "their position in the personality circumplex" / "their self-view"
- Català actual: «la seva posició en el circumflex de personalitat», «la seva pròpia visió»
- Categoria: doble: (a) TERMINOLOGIA «circumflex»→«circumplex» (R2, ALTA); (b) COHERÈNCIA possessiu «seva» vs «seua».
- Proposta: «la seua posició en el circumplex de personalitat». Coherència: l'article usa «seva/seves» (línies ~131, 145, 147) però també «seues» (no apareix ací; sí a arts. 1-2 amb «seues»). En el conjunt de la col·lecció conviuen «seva/seua». Cal triar-ne una.
- Justificació: R2 per a «circumflex». Per al possessiu, tant «seva» com «seua» són normatius (IEC/AVL), però han de ser coherents dins de la col·lecció; els articles 1 i 2 usen «seues/seua» i el 3 usa «seva/seves»: incoherència inter-article.

### 3.2 «pot que les perceben els seus companys» (línia ~145)
- Anglès: "may be perceived by teammates as unpredictable under pressure"
- Català actual: «Les persones que es valoren com a calmes i estables pot que les perceben els seus companys d'equip com a imprevisibles sota pressió.»
- Categoria: ERRADA (sintaxi/concordança) · Gravetat ALTA
- Proposta: «Les persones que es valoren com a calmades i estables poden ser percebudes pels seus companys d'equip com a imprevisibles sota pressió.»
- Justificació: la construcció «pot que les perceben» és agramatical/fosca: barreja una impersonal mal travada amb un subjecte plural. La passiva («poden ser percebudes») reprodueix fidelment l'anglès i és gramatical. A més, «calmes» com a adjectiu és dubtós: millor «calmades» (o «tranquil·les»).

### 3.3 «en lloc d'halago» (línia ~160)
- Anglès: "reveals genuine perception rather than flattery"
- Català actual: «l'elecció revela percepció genuïna en lloc d'halago»
- Categoria: CALC/BARBARISME (castellanisme) · Gravetat ALTA
- Proposta: «l'elecció revela una percepció genuïna en lloc d'afalac» (o «en lloc d'adulació»)
- Justificació: **halago** és un castellanisme cru; no existeix en català. Formes correctes: «afalac» o «adulació». L'article 3 EN diu *flattery*; el millor equivalent ací és «adulació» o «afalac». A més, cal article: «una percepció genuïna».

### 3.4 «emergeix la bretxa directament» (línia ~164)
- Anglès: "surfaces the gap directly"
- Català actual: «La comparació de les puntuacions pròpies amb les del Testimoni emergeix la bretxa directament.»
- Categoria: ERRADA (transitivitat) · Gravetat ALTA
- Proposta: «La comparació de les puntuacions pròpies amb les del Testimoni fa emergir la bretxa directament.» (o «fa aflorar la bretxa»)
- Justificació: «emergir» és intransitiu en català; no es pot «emergir una cosa». Cal una construcció causativa («fa emergir/aflorar») o reformular. Cf. les versions ES i FR, que usen «hace emerger» / «fait émerger». L'error trenca la recció verbal.

### 3.5 «retroalimentació» vs «feedback» (líniees ~141, 172 i peu/cos)
- Anglès: "360-degree feedback" / "feedback"
- Català actual: «retroalimentació 360 graus» (~141), «vocabulari compartit per a la retroalimentació» (~172)
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: coherent dins de l'article (sempre «retroalimentació»). Es manté. Nota: si la col·lecció adopta «feedback» (acceptat per TERMCAT com a manlleu en àmbit empresarial) cal unificar; ara mateix l'article és coherent amb «retroalimentació» i no cal canvi intern.
- Justificació: registre. Sense incidència interna; només alerta de coherència inter-article (l'art. 2 també usa «retroalimentació»: coherent).

### 3.6 «s'està perdent senyals que el seu equip el troba difícil d'abordar» (línia ~139)
- Anglès: "may be missing signals that their team finds them difficult to approach"
- Català actual: «potser s'està perdent senyals que el seu equip el troba difícil d'abordar»
- Categoria: CALC/REGISTRE · Gravetat MITJANA
- Proposta: «potser no capta senyals que indiquen que el seu equip el troba difícil d'abordar» o «potser passa per alt senyals...»
- Justificació: «perdre's senyals» calca l'ang. *to miss signals*; en català «perdre's una cosa» és col·loquial i ambigu (perdre's = esgarriar-se). «No captar / passar per alt / no advertir» és més precís i culte. «Abordar» en el sentit de "dirigir-se a algú" és acceptable però «de tracte difícil»/«difícil d'abordar» pot millorar-se a «que costa d'abordar».

### 3.7 «Consulteu la pàgina de ciència» / «Consulteu» (líniees ~166, tractament)
- Català actual: imperatiu de cortesia «Consulteu» (vós), enmig d'un text en "tu" implícit.
- Categoria: REGISTRE/COHERÈNCIA · Gravetat MITJANA
- Proposta: coherència de tractament: si la col·lecció va de "tu", «Consulta la pàgina de ciència». Vegeu R5.
- Justificació: l'art. 2 tracta de "tu" («Comença», «el teu equip»); l'art. 3 salta a "vós" en les crides a l'acció. Cal un únic tractament.

### 3.8 «valoracions dels parells» / «percepció de parells» / «acord entre auto-percepció i percepció de parells» (títols i cos)
- Anglès: "self-other agreement", "peer ratings", "peer perception"
- Català actual: barreja «percepció de parells», «valoracions dels parells», «auto-percepció», «autopercepció» (amb i sense guionet).
- Categoria: TERMINOLOGIA/ERRADA ortogràfica · Gravetat MITJANA
- Proposta: unificar **autopercepció** (sense guionet; és un mot prefixat amb «auto-», que s'escriu junt) a tot arreu. Apareix «auto-percepció» (~117, ~121 títol) i «autopercepció» (~139). El prefix «auto-» s'aglutina: «autopercepció», «autovaloració», «autoinforme» (aquest darrer ja apareix junt).
- Justificació: norma ortogràfica de prefixos (IEC/AVL): «auto-» s'escriu sense guionet davant de mot començat per consonant o vocal que no sigui la mateixa. «autopercepció» és la forma correcta; «auto-percepció» és errada ortogràfica recurrent.

### 3.9 «directament accionable» (cita destacada, línia ~133)
- Anglès: "This is directly actionable information."
- Català actual: «Aquesta és informació directament accionable.»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «Aquesta és informació directament aplicable» o «...sobre la qual es pot actuar directament»
- Justificació: **accionable** en el sentit de *actionable* (sobre el qual es pot actuar) és un calc de l'anglès. En català «accionable» significa "que es pot accionar/posar en marxa (un mecanisme)". El sentit pretès és «aplicable» / «que permet actuar». Apareix també a les altres llengües amb el mateix calc, però el referent culte català demana «aplicable».

### 3.10 «Tots dos biaixos afecten ... de manera diferent» (línia ~155)
- Anglès: "Both biases affect self-report and peer-report differently, which complicates direct comparison."
- Català actual (art. 3 CA): «Tots dos biaixos afecten l'autoinforme i l'informe de parells de manera diferent, cosa que complica la comparació directa.»
- Categoria: correcte · Gravetat — (sense incidència; ben travat. Observació: aquí l'art. 3 SÍ inclou la subordinada «cosa que...» que l'art. 1 havia omès — bon contrast intern.)

### Resum quantitatiu Article 3
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (sintaxi, transitivitat, ortografia) | 2 | 1 | – |
| CALC/BARBARISME | 1 | 2 | – |
| TERMINOLOGIA (circumplex, possessius) | 1 | 1 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | 1 |
| Total incidències | **4** | **5** | **1** |

---

## Article 4 — "Què és l'IPIP i per què és important?"
(`scripts/update_blog_article_4.py`, claus `ca`)

### 4.1 «propietats psicoemètriques sòlides» (línia ~160)
- Anglès: "strong psychometric properties"
- Català actual: «propietats psicoemètriques sòlides»
- Categoria: ERRADA · Gravetat ALTA
- Proposta: «propietats psicomètriques sòlides»
- Justificació: R1.

### 4.2 «amb qualitat psicoemètrica comparable» (línia ~176)
- Anglès: "with comparable psychometric quality"
- Català actual: «amb qualitat psicoemètrica comparable»
- Categoria: ERRADA · Gravetat ALTA
- Proposta: «amb una qualitat psicomètrica comparable»
- Justificació: R1 + manca d'article indefinit («una qualitat»), més natural en català.

### 4.3 «escrutinar completament» (entradeta, línia ~129)
- Anglès: "that nobody can fully scrutinise"
- Català actual: «que ningú pot escrutinar completament»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «que ningú pot examinar a fons» o «que ningú pot escrutar del tot»
- Justificació: «escrutinar» és un calc/forma poc establerta; el verb català és **escrutar** (examinar atentament) o, més clar en divulgació, «examinar a fons / analitzar minuciosament». «Completament» com a adverbi de tancament és pesat: «a fons / del tot».

### 4.4 «el NEO PI-R sol arriba aproximadament als €15–25 per persona» (línia ~137)
- Anglès: "The cost of administering the NEO PI-R alone runs to approximately €15–25 per person."
- Català actual: «El cost d'administrar el NEO PI-R sol arriba aproximadament als €15–25 per persona.»
- Categoria: AMBIGÜITAT · Gravetat MITJANA
- Proposta: «Només el cost d'administrar el NEO PI-R ja arriba aproximadament als 15–25 € per persona.»
- Justificació: «el NEO PI-R sol» és ambigu: «sol» es pot llegir com el verb «soler» (3a pers.) en lloc de l'adjectiu «sol» (=només). L'anglès vol dir "només el NEO PI-R". Reformular amb «Només... ja» elimina l'ambigüitat. A més, convenció tipogràfica catalana: el símbol d'euro va POSPOSAT i amb espai («15–25 €»), no anteposat («€15–25»), que és convenció anglosaxona. Igual a la taula («~€15–25/persona» → «~15–25 €/persona»). Recurrent a tot l'article (taula i cos).

### 4.5 Símbol d'euro anteposat (taula IPIP vs NEO, i cos)
- Català actual: «€15–25/persona», «als €15–25»
- Categoria: ERRADA (convenció tipogràfica) · Gravetat MITJANA
- Proposta: «15–25 €/persona», «als 15–25 €»
- Justificació: en català (i en la norma de l'euro de la UE per a les llengües romàniques) el símbol va després de la xifra amb espai fi. Anteposar-lo és calc anglosaxó. Recurrent.

### 4.6 «Cada pregunta ... és extreta del conjunt d'ítems IPIP» (línia ~191)
- Anglès: "Every question ... is drawn from the public-domain IPIP item pool, selected and validated..."
- Català actual: «Cada pregunta ... és extreta del conjunt d'ítems IPIP de domini públic, seleccionada i validada...»
- Categoria: REGISTRE · Gravetat BAIXA
- Proposta: «Cada pregunta ... s'extreu del conjunt d'ítems IPIP de domini públic, i se selecciona i es valida...» (veu mitjana/pronominal, més natural que la passiva perifràstica encadenada)
- Justificació: la passiva «és extreta ... seleccionada i validada» calca l'estructura passiva anglesa; en català la pronominal («s'extreu, se selecciona, es valida») és més idiomàtica i àgil. No és error, és fluïdesa.

### 4.7 «Els ítems estan documentats, citats i verificables independentment» (línia ~191)
- Anglès: "The items are documented, citable, and independently verifiable."
- Català actual: «Els ítems estan documentats, citats i verificables independentment.»
- Categoria: FIDELITAT/ERRADA (lèxic) · Gravetat MITJANA
- Proposta: «Els ítems estan documentats, es poden citar i són verificables de manera independent.»
- Justificació: l'anglès diu **citable** (que es pot citar), no *cited* («citats»). «citats» canvia el sentit (afirma que han estat citats, no que es poden citar). Cal «citables» / «es poden citar». A més, coordinació defectuosa: «documentats» i «citats» són participis (estat) però «verificables» és adjectiu de possibilitat; barreja registres. Millor: «...es poden citar i es poden verificar de manera independent». I «independentment» postposat sec és calc; millor «de manera independent».

### 4.8 «Aquest és el punt.» (final, línia ~197)
- Anglès: "Everything is open. That is the point."
- Català actual: «Tot és obert. Aquest és el punt.»
- Categoria: CALC (idiomàtic) · Gravetat MITJANA
- Proposta: «Tot és obert. Aquesta és la qüestió.» o «I aquesta és, justament, la idea.» / «És precisament això.»
- Justificació: «Aquest és el punt» és un calc cru de l'ang. *That is the point*. En català «el punt» no té aquest valor idiomàtic; cal «la qüestió / la idea / l'essència». (Cf. art. 4 FR «C'est l'essentiel», DE «Das ist der Punkt» — l'alemany sí ho admet; el català no.)

### 4.9 «Entra en qualsevol departament ... i hi trobaràs» (entradeta, línia ~129)
- Anglès: "Walk into most HR departments today and you will find..."
- Català actual: «Entra en qualsevol departament de recursos humans avui dia i hi trobaràs...»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat BAIXA
- Proposta: coherent amb el tractament de "tu" si s'adopta per a la col·lecció (vegeu R5). «Entra... i hi trobaràs» és bon "tu". Cal assegurar que tot l'article 4 manté el "tu" (sí ho fa: «trobaràs», «et veuen»). Coherent internament; només cal alinear-lo amb arts. 2 i 3.
- Justificació: nota de coherència inter-article; internament correcte.

### 4.10 «caixes negres» (líniees ~137, secció)
- Anglès: "black boxes"
- Català actual: «són caixes negres»
- Categoria: correcte · Gravetat — («caixa negra» és metàfora lexicalitzada en català tècnic; sense incidència).

### 4.11 Demostratius i «esta/aquesta» (article 4)
- Català actual: usa «aquesta norma», «aquest problema», «aquest és el punt» (reforçat majoritari) — més coherent que l'art. 2.
- Categoria: COHERÈNCIA · Gravetat BAIXA
- Proposta: si s'adopta la sèrie reforçada per a tota la col·lecció (R3), aquest article ja hi és pràcticament alineat; només cal revisar-hi possibles «este» residuals.
- Justificació: R3.

### Resum quantitatiu Article 4
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (psicomètric, lèxic, tipografia €) | 2 | 3 | – |
| CALC ("el punt", passives, "escrutinar") | – | 1 | 2 |
| AMBIGÜITAT ("el NEO PI-R sol") | – | 1 | – |
| FIDELITAT ("citable"→"citats") | – | (comptat com ERRADA 4.7) | – |
| COHERÈNCIA (tractament, demostratius) | – | – | 2 |
| Total incidències | **2** | **5** | **4** |

---

## Recompte global de la col·lecció

| Article | ALTA | MITJANA | BAIXA | Total |
|---------|------|---------|-------|-------|
| 1 — Big Five vs DISC vs Belbin | 4 | 2 | 3 | 9 |
| 2 — Equip equilibrat | 0 | 4 | 3 | 7 |
| 3 — Punts cecs | 4 | 5 | 1 | 10 |
| 4 — Què és l'IPIP | 2 | 5 | 4 | 11 |
| **Total** | **10** | **16** | **11** | **37** |

### Prioritats de correcció (per impacte)

1. **psicoemètric → psicomètric** (R1): articles 1 i 4, terme central, titulars. ALTA.
2. **circumflex → circumplex** (R2): articles 1, 2, 3. Error conceptual. ALTA.
3. **deseabilitat → desitjabilitat social** (R4): article 1. Coherència TERMCAT. ALTA.
4. **halago → afalac/adulació** (3.3): article 3. Castellanisme. ALTA.
5. **«emergeix la bretxa» → «fa emergir la bretxa»** (3.4) i **«pot que les perceben» → passiva** (3.2): article 3. Errades de recció/sintaxi. ALTA.
6. **«citats» → «citables»** (4.7): article 4. Error de fidelitat. MITJANA-ALTA.
7. Coherència transversal: demostratius (R3), tractament "tu"/"vós" (R5), «auto-percepció»→«autopercepció» (3.8), símbol € postposat (4.5), «a nivell de»→«a escala de» (2.7). MITJANA.
