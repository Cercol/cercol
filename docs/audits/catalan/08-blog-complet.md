# Auditoria del contingut català — Blog complet (08-blog-complet)

Auditoria filològica del contingut català (camp `ca`) dels **100 articles de blog
publicats** de Cèrcol que **no tenen cos català al repositori** i viuen únicament a
la base de dades de producció (`api.cercol.team`). Cada article s'ha comparat amb la
font validada en anglès (camp `en`). Aquesta auditoria continua i tanca el buit
d'abast descrit a la §6 de [`00-informe-catala.md`](00-informe-catala.md): completa
els quatre articles ja auditats a [`05-blog.md`](05-blog.md), que **no es repeteixen
ací** (`big-five-vs-disc-vs-belbin`, `how-to-build-a-balanced-team`,
`blind-spots-in-teams`, `what-is-the-ipip`).

Model de llengua: neutre, culte, supradialectal, vàlid alhora per a AVL (DNV/GNV) i
IEC (DIEC2/GIEC); "valencià" i "català" s'usen com a **sinònims absoluts**. Per als
**verbs referits al lector** s'aplica la **2a persona del plural (tractament de vós)**
fixada a la §3 de l'informe mestre; per a la resta de formes, la solució acceptada per
**DNV ∩ DIEC2** i compartida pel màxim de parlants, arbitrant variants amb **esADIR**
i **IIFV**. En blog/ciència **SÍ es permeten** els noms acadèmics (Big Five, OCEAN,
IPIP, NEO, DISC, MBTI, circumplex…).

> **Nota d'abast.** L'informe mestre estimava ~22 articles pendents (sobre un blog de
> ~26). Quan s'ha pogut accedir a l'API (`GET /blog`), el blog publicat ja conté **104
> articles**: 4 auditats a `05-blog.md` i **100 pendents amb cos català**, tots
> auditats ací. El blog ha crescut molt per damunt de l'estimació original; per això
> aquest fitxer es titula «blog complet».

---

## Resum executiu — problemes transversals (sobre els 100 articles)

La conclusió dominant és **qualitativament nova** respecte de la mostra de quatre
articles de `05-blog.md`. Aquells quatre, versionats al codi, havien rebut retoc humà
i presentaven sobretot calcs i incoherències de model. En canvi, **el gros dels 100
articles només-BD mostra artefactes inequívocs de traducció automàtica no revisada**:
mots inexistents, fragments en anglès o castellà sense traduir, i fins i tot errades
de codificació dins de paraules. Això confirma, ampliat a tota la col·lecció, el
defecte estructural que ja apuntava l'informe mestre.

Defectes recurrents (ordenats per gravetat i freqüència):

### T1 — Tractament tu/vós incoherent [REGISTRE · ALTA/MITJANA]
És **el problema més estès de tota la col·lecció**. La majoria d'articles tracten el
lector de **«tu»** (contra el model de vós de la §3); uns pocs usen **«vós»** de manera
coherent (p. ex. `personality-and-job-fit`, `remote-team-communication-styles-big-five`,
`introversion-energy-management-science`, `personality-in-agile-teams`); i uns altres
**barregen tu i vós dins d'un sol article**, típicament cos en vós i crides a l'acció
(CTA) en tu, o a l'inrevés (`personality-and-mentoring`, `introverts-in-extrovert-workplaces`,
`personality-and-negotiation`, els CTA de gairebé tots). **Acció:** unificar tota la
col·lecció a **vós**, com la resta de la plataforma.

### T2 — Artefactes de traducció automàtica: mots inexistents i errades de codificació [ERRADA · ALTA]
Formes que no existeixen en català, símptoma de MT sense revisió: *subjaú, autoenganye,
sobrietant, esmolaen, s'autogestions, reavaliació, andamatge, autoreempleadores,
s'arrels, factorioanàlitica, esfaçadora, assumpcionadors, neurociencífic, primensament,
sufinvertir, gravituen, es medeia, retaliador, constranyidors, directitud, sobre-enginyeregen,
lluitegen, explonem, confonex, deferien, desavantatgen*. Errades de codificació/edició:
*comprometl't, produeeixin, histò ricament* (espai dins del mot), *Utilisat*. **Acció:**
correcció cas per cas (vegeu cada article); cap és defensable.

### T3 — Anglès i UI sense traduir dins del cos [FIDELITAT/ERRADA · ALTA]
Paraules angleses deixades crues: *slacken, warranted, heightened, Engagement,
developmental, distinct, different, thoroughness, hedged, only, follow-through,
no-yet-existing, weaponitzades*. A més, **targetes d'estadística (`stat-grid`) i cel·les
de taula senceres** i **noms de dimensió/rol de Cèrcol** (*Bond, Vision, Depth,
Presence, Conscientiousness, Neuroticism, Openness…*) que queden en anglès enmig del
text català. **Acció:** traduir-ho tot i fixar la nomenclatura catalana de dimensions.

### T4 — Castellanismes crus [ERRADA/CALC · ALTA]
Recurrents a tota la col·lecció: *respaldo/respaldada, novedós/novedoses, tienen, son
(=són), luego, solo, promig/promedi/promedia/promediar, comenzar, comenzant, casualmente,
angustiants/angustioses, descalificador, exitosa, apertura, contextualmente,
organizacionalment, inmanejable, enroda, reencuadrin, composa, Percibent, abarcar,
instantànea, diferentes*. Verificats com a no normatius (Optimot, Softcatalà, DIEC2).

### T5 — «psicomètric» mal escrit [ERRADA · ALTA]
El terme tècnic central apareix deformat de diverses maneres més enllà del *psicoemètric*
ja documentat a `05-blog.md` (R1): *psicromètrics, psicòmetric, psicometria/psicometrica*
(usat com a adjectiu). **Acció:** sempre **psicomètric -a -s -ques**.

### T6 — «circumflex» → «circumplex» [TERMINOLOGIA · ALTA]
L'error R2 de `05-blog.md` persisteix a la col·lecció, de manera especialment greu a
`the-12-cercol-team-roles-explained` (titulars de secció i fins i tot l'acrònim
**AB5C**). **Acció:** sempre **circumplex**.

### T7 — Falsos amics [TERMINOLOGIA/CALC · MITJANA/ALTA]
Sistemàtics: *nombrar* (per *name*; és «comptar» → cal *anomenar/esmentar*), *accionable*
(per *actionable* → *aplicable*), *mapejar/mapa (verb)* (per *map onto* → *fer correspondre/
associar*), *figures* (→ *xifres*), *careful* (→ *acurat*), *reclamacions* (per *claims*
→ *afirmacions*), *deliver* (→ *lliurar* fora de context), *disagreeable* (→ *poc
agradable*; cal *poc afable*), *principled* (→ *principiats*), *finding* (→ *trobament*;
cal *troballa*), *defer* (→ *defendre/defèn*), *consistent/consistently* (fals amic de
constància). I la recció: *emergir/aflorar* transitivats (cal *fer emergir*), com a
`05-blog.md` 3.4.

### T8 — «deseabilitat» → «desitjabilitat social» i altres incoherències terminològiques [TERMINOLOGIA · MITJANA]
La col·lecció és **internament incoherent**: alguns articles escriuen correctament
*desitjabilitat social* (TERMCAT) i altres el calc *deseabilitat*. Igualment oscil·len,
sense criteri, els noms de dimensió (**Conscientiousness** → *Responsabilitat /
Conscienciositat / Discipline*; **Agreeableness** → *Amabilitat / Afabilitat / Connexió*
enfront del *Vincle* canònic), *research* (*recerca / investigació*), *peer* (*iguals /
parells / companys*) i *feedback / retroalimentació*. **Acció:** fixar un glossari únic
de col·lecció (vegeu §3.4 de l'informe mestre).

### T9 — Ortografia recurrent: apostrofació, diacrítics, concordança [ERRADA · ALTA/MITJANA]
- **Apostrofació** davant de vocal: *de iguals, la afabilitat, la alta, la habilitat,
  la harmonia, la angúnia, l'imatge*, i el cas invers *l'rang*.
- **Diacrític *què*** (relatiu/interrogatiu) i ***per què*** en titulars: *en que, per que,
  per qué*. *llengues* → *llengües*.
- **Concordança de gènere/nombre**: *El sobrecàrrega, la càlcul, una de les majors
  efectes, les troben avorrida, un palanca, una abandonament, avaluació honest*.

### T10 — Infraccions de vocabulari de marca [NOM-PROHIBIT · ALTA]
Reapareix **«observador»** en lloc de **«Testimoni»** (p. ex. a la guia d'ús de Cèrcol)
i **«Witness»** en cru sense traduir en un article sencer. Prohibit per `CLAUDE.md`.

### T11 — Calcs d'estil i convencions tipogràfiques [CALC/REGISTRE · BAIXA/MITJANA]
*Title Case* anglès als titulars, *«a nivell de»* (→ *a escala de / en l'àmbit de*,
molt recurrent), decimals sense zero inicial i símbol *€* segons convenció anglosaxona.

---

## "16Personalities vs Big Five: el test viral que encerta la meitat"
`16personalities-vs-big-five-the-viral-test-that-gets-it-half-right`

### 1.1 «l'auto-informe sol sempre passarà per alt» (secció final, crida a l'acció)
- Anglès: "the blind spots that self-report alone will always miss"
- Català actual: «traient a la llum els punts cecs que l'auto-informe sol sempre passarà per alt»
- Categoria: ERRADA (ortografia) + AMBIGÜITAT · Gravetat MITJANA
- Proposta: «que l'autoinforme tot sol sempre passarà per alt» (o «que només l'autoinforme...»)
- Justificació: doble problema. (a) El prefix *auto-* s'aglutina sense guionet: **autoinforme**, no «auto-informe» (norma de prefixos IEC/AVL; cf. la forma correcta «autoinforme» que sí apareix a altres articles del lot). (b) «el ... sol» reprodueix l'adjectiu *alone*, però juxtaposat a «autoinforme» pot llegir-se com el verb «soler»; «tot sol» o «només» desfà l'ambigüitat.

### 1.2 «encerta la meitat» / «l'encerta a mitges» (títol i enllaços interns)
- Anglès: "the viral test that gets it half right"
- Català actual: títol «el test viral que encerta la meitat»; als altres articles del lot l'enllaç diu «el test viral que l'encerta a mitges»
- Categoria: REGISTRE/COHERÈNCIA · Gravetat BAIXA
- Proposta: unificar a una sola forma per a tota la col·lecció; «que encerta a mitges» és la més idiomàtica.
- Justificació: el mateix article es titula «encerta la meitat» però des de `disc-vs-big-five` i altres es referencia com «l'encerta a mitges». «Encertar la meitat» és literal; «encertar a mitges» (= a mitges, parcialment) és l'expressió feta catalana. Cal triar-ne una.

### 1.3 «emergir com a líders» — fals positiu
- Anglès: (no apareix en aquest article; vegeu art. career)
- Català actual: n/a
- Categoria: correcte · Gravetat —
- Justificació: es registra per descartar; en aquest article no hi ha l'error de transitivitat d'*emergir*.

### 1.4 «Aquesta és una de les dimensions del Big Five més importants» (eix A/T)
- Anglès: "This is one of the most important Big Five dimensions for predicting wellbeing"
- Català actual: «Aquesta és una de les dimensions del Big Five més importants per predir el benestar»
- Categoria: correcte · Gravetat —
- Justificació: traducció fidel i natural; es registra perquè l'ordre «dimensions ... més importants» podria semblar calc, però en català és correcte i clar. Sense incidència.

### 1.5 «porta d'entrada» (secció solapament)
- Anglès: "It is a gateway."
- Català actual: «És una porta d'entrada.»
- Categoria: correcte · Gravetat —
- Justificació: bona traducció idiomàtica de *gateway*; no és calc. Fals positiu registrat.

### Resum quantitatiu Article 1
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA/AMBIGÜITAT (autoinforme, «sol») | – | 1 | – |
| REGISTRE/COHERÈNCIA («encerta la meitat») | – | – | 1 |
| Total incidències | **0** | **1** | **1** |

---

## "DISC vs Big Five: per què quatre estils no són suficients"
`disc-vs-big-five-why-four-styles-arent-enough`

### 2.1 «el respaldo de recerca» (introducció)
- Anglès: "the research backing for DISC as a predictive tool is thin at best"
- Català actual: «el respaldo de recerca que té DISC com a eina predictiva és escàs en el millor dels casos»
- Categoria: TERMINOLOGIA/BARBARISME (castellanisme cru) · Gravetat ALTA
- Proposta: «el suport de recerca que té DISC com a eina predictiva...» (o «el fonament empíric»/«l'aval de la recerca»)
- Justificació: **respaldo** és un castellanisme cru inexistent en català; les formes correctes són «suport», «aval», «base». Error lèxic de primer ordre en un paràgraf clau.

### 2.2 «instrument psicòmetric» (Marston)
- Anglès: "He was not trying to create a psychometric instrument"
- Català actual: «No estava intentant crear un instrument psicòmetric»
- Categoria: ERRADA (accentuació/terme tècnic) · Gravetat ALTA
- Proposta: «un instrument psicomètric»
- Justificació: la forma correcta és **psicomètric** (pla, sense accent gràfic a la *o*: *psi-co-MÈ-tric*). «psicòmetric» desplaça l'accent i és incorrecta. És el terme tècnic central del domini.

### 2.3 «dades normatives diferentes» / «mesuren coses totalment diferentes» (origen DISC; mapatge)
- Anglès: "different ... normative data"; "are not measuring entirely different things"
- Català actual: «cadascuna amb ítems, mètodes de puntuació i dades normatives diferentes»; «no mesuren coses totalment diferentes»
- Categoria: ERRADA (ortografia/castellanisme) · Gravetat ALTA
- Proposta: «diferents» (en tots dos casos)
- Justificació: **diferentes** és la forma castellana; el femení plural català de *diferent* és invariable: «diferents». Errada recurrent (dues ocurrències).

### 2.4 «la qual cosa és una preocupació metodològica significativa» (validesa DISC)
- Anglès: "which is a significant methodological concern"
- Català actual: «la qual cosa és una preocupació metodològica significativa»
- Categoria: correcte · Gravetat —
- Justificació: bona traducció; «la qual cosa» referit a tota la clàusula és correcte. Fals positiu registrat (contrasta amb l'alemany que diu «eine ... Bedenken», amb error de gènere; el català l'evita).

### 2.5 «el respaldo» i la cita de Barrick i Mount inventada — FIDELITAT
- Anglès: la cita literal «"Personality measures that rely on four broad types..."» s'atribueix a Barrick & Mount (1991) en totes les llengües.
- Català actual: igual que l'anglès (cita atribuïda).
- Categoria: correcte · Gravetat —
- Justificació: la traducció de la cita és fidel («Les mesures de personalitat que es basen en quatre tipus amplis...»); sense incidència de traducció. Es registra perquè és un punt sensible (cita acadèmica) i la versió catalana el resol bé.

### 2.6 «es mapa parcialment sobre» / «es mapa sobre» (mapatge DISC→Big Five)
- Anglès: "maps partially onto low Agreeableness"; "maps onto high Extraversion"
- Català actual: «es mapa parcialment sobre baixa Amabilitat», «es mapa sobre alta Extraversió»
- Categoria: TERMINOLOGIA/CALC + REGISTRE · Gravetat MITJANA
- Proposta: «es correspon parcialment amb», «es projecta sobre» o «equival parcialment a» (i unificar amb «es mapegen» del títol de secció)
- Justificació: doble problema. (a) Incoherència interna: el títol de secció diu «es mapegen» (verb *mapejar*) però el cos usa «es mapa» (verb *mapar*), dues conjugacions diferents per al mateix concepte dins del mateix article. (b) *mapar/mapejar* en sentit de *map onto* és un calc tècnic feble; «correspondre's amb»/«projectar-se sobre» és més transparent en divulgació. Cal, com a mínim, unificar la forma verbal.

### 2.7 «té les seves arrels» (origen DISC)
- Anglès: "DISC has its roots in..."
- Català actual: «DISC té les seves arrels en el llibre...»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «DISC té el seu origen en el llibre...» / «arrenca del llibre...»
- Justificació: «tenir les arrels en» és un calc d'*have its roots in*; tot i comprensible, «tenir l'origen en» és més natural i econòmic en català divulgatiu.

### 2.8 «el qual ha superat el paper de marc de comunicació» (crida final)
- Anglès: "teams that have outgrown DISC's communication framework role"
- Català actual: «Per als equips que han superat el paper de marc de comunicació de DISC»
- Categoria: correcte · Gravetat —
- Justificació: «paper» = rol és bon català, i «han superat» tradueix bé *have outgrown*. Fals positiu registrat.

### 2.9 «biaix de desitjabilitat social» (crida final)
- Anglès: "the social desirability bias that inflates self-reported DISC scores"
- Català actual: «el biaix de desitjabilitat social que infla les puntuacions DISC d'autoinforme»
- Categoria: correcte · Gravetat —
- Justificació: usa correctament la forma TERMCAT **desitjabilitat social** (no el calc *deseabilitat*) i **autoinforme** aglutinat. Es registra com a encert de coherència terminològica.

### Resum quantitatiu Article 2
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| TERMINOLOGIA/BARBARISME (respaldo) | 1 | – | – |
| ERRADA (psicòmetric, diferentes) | 2 | – | – |
| TERMINOLOGIA/CALC + coherència (mapa/mapegen) | – | 1 | – |
| REGISTRE/CALC (arrels) | – | – | 1 |
| Total incidències | **3** | **1** | **1** |

---

## "Com dissenyar reunions que funcionin per a tots els tipus de personalitat"
`how-to-design-meetings-for-all-personality-types`

Nota de model: aquest article tracta el lector de **vós** de manera coherent
(*puntueu, us semblarà, vosaltres, doneu, poseu, useu, considereu, executeu*).
És el model recomanat pel brief; per tant, a diferència d'altres articles del
lot, ací NO hi ha incidència de tractament. S'usa com a referència de
coherència per a la resta de la col·lecció.

### 3.1 «una sortida de menor qualitat» / «produeix una sortida de menor qualitat» (processament)
- Anglès: "speaking before that process is complete produces lower-quality output"
- Català actual: «parlar abans que aquest procés estigui complet produeix una sortida de menor qualitat»
- Categoria: FIDELITAT/CALC (fals amic) · Gravetat MITJANA
- Proposta: «produeix un resultat de menor qualitat» (o «un rendiment de menor qualitat»)
- Justificació: **sortida** com a traducció d'*output* és un fals amic ací: en català «sortida» no té el valor de *resultat/producte d'un procés cognitiu*. El sentit és «resultat»/«producte». «Sortida» només val per a *output* en àmbit informàtic/elèctric.

### 3.2 «el resultat és predictible» (pluja d'idees)
- Anglès: "the result is predictable"
- Català actual: «el resultat és predictible»
- Categoria: TERMINOLOGIA (preferència lèxica) · Gravetat BAIXA
- Proposta: «el resultat és previsible»
- Justificació: tot i que *predictible* és admissible, **previsible** és la forma preferent i molt més freqüent en català per a *predictable* en aquest sentit (un resultat que es pot preveure). Recurrent al lot («modes de fallada predictibles» a l'art. PM); convé unificar a «previsible».

### 3.3 «agenda oberta» vs «ordre del dia» (cos)
- Anglès: "an open agenda"; "spontaneous agenda"
- Català actual: conviuen «una agenda oberta» (cos), «ordre del dia» (diagrama, llista) i «Agenda espontània» (taula)
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar: l'equivalent català net d'*agenda* (de reunió) és **ordre del dia**; reservar «agenda» per al sentit de dietari/calendari. Usar «ordre del dia obert», «ordre del dia espontani».
- Justificació: dins del mateix article *agenda* es tradueix unes vegades per «ordre del dia» (correcte) i altres es manté «agenda» (calc/castellanisme en aquest sentit). El DNV/DIEC2 recullen «ordre del dia» com a relació d'assumptes a tractar; «agenda» en aquest sentit és anglicisme. Cal coherència.

### 3.4 «s'autocensurarrien» (aportació anònima)
- Anglès: "participants who would otherwise self-censor in live settings"
- Català actual: «els participants que d'altra manera s'autocensurarrien en entorns en viu»
- Categoria: ERRADA (errata ortogràfica) · Gravetat ALTA
- Proposta: «s'autocensurarien»
- Justificació: errata pura: doble *r* indeguda en el condicional. La forma correcta és **s'autocensurarien** (autocensurar + -ien).

### 3.5 «discussions exploratories» / «companys d'equip més exploratorials» (Visió)
- Anglès: "exploratory, divergent discussion"
- Català actual: «discussions exploratories i divergents» (en aquest article); cf. art. trust «companys d'equip més exploratorials»
- Categoria: ERRADA (lèxic/derivació) · Gravetat MITJANA
- Proposta: «discussions exploratòries» (femení de *exploratori*)
- Justificació: el femení plural de *exploratori* és **exploratòries** (amb accent obert i sense la *-i-* parasitària de «exploratories»). La forma «exploratorials» (art. trust) és directament inexistent. Errada de derivació adjectival.

### 3.6 «el temps d'antena» (durant la reunió)
- Anglès: "managing airtime"
- Català actual: «La facilitació gestiona explícitament el temps d'antena»
- Categoria: CALC · Gravetat BAIXA
- Proposta: «gestiona el temps de paraula» / «el repartiment de la paraula»
- Justificació: *airtime* en una reunió és el «temps de paraula» de cada participant; «temps d'antena» és un calc del registre radiotelevisiu que ací resulta impropi (no hi ha antena en una reunió).

### 3.7 «predictible» i «brainwriting» — manlleus
- Anglès: "silent brainstorm"
- Català actual: «Brainwriting en silenci» (diagrama/taula) i «pluja d'idees ... anònima» (cos)
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: triar una sola designació: o bé «pluja d'idees en silenci/per escrit» o bé el manlleu, però no alternar.
- Justificació: el cos tradueix *brainstorm(ing)* per «pluja d'idees» (correcte) però el diagrama i la taula introdueixen el manlleu cru «brainwriting» sense glossar-lo. Incoherència interna; si s'usa el manlleu, marcar-lo en cursiva i un sol cop.

### 3.8 «els poden semblar» / «els poden semblar desorganitzades» (Disciplina)
- Anglès: "can feel disorganised and unproductive to them"
- Català actual: «Les reunions d'ideació espontànies sense un marc clar els poden semblar desorganitzades i improductives.»
- Categoria: correcte · Gravetat —
- Justificació: bona construcció amb datiu «els poden semblar»; fidel i natural. Fals positiu registrat.

### Resum quantitatiu Article 3
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (autocensurarrien, exploratories) | 1 | 1 | – |
| FIDELITAT/CALC (sortida=output) | – | 1 | – |
| TERMINOLOGIA/COHERÈNCIA (ordre del dia, brainwriting, previsible) | – | 1 | 2 |
| CALC (temps d'antena) | – | – | 1 |
| Total incidències | **1** | **3** | **3** |

---

## "Personalitat i elecció professional: què prediu realment la recerca sobre el Big Five"
`personality-and-career-choice-what-big-five-predicts`

Nota de model: aquest article tracta el lector de **tu** (*et dóna, el teu rol,
aportes, tries, vols*). És coherent internament, però contrasta amb el model de
vós d'altres articles del lot (p. ex. `how-to-design-meetings`): incidència de
coherència de col·lecció (vegeu R-col·lecció al final).

### 4.1 «la alta Profunditat» (Neuroticisme i satisfacció)
- Anglès: "the vigilance and risk-sensitivity that high Depth provides"
- Català actual: «la vigilància i la sensibilitat al risc que la alta Profunditat proporciona»
- Categoria: ERRADA (apostrofació) · Gravetat ALTA
- Proposta: «que l'alta Profunditat proporciona»
- Justificació: davant de mot femení començat per vocal tònica/àtona *a-*, l'article *la* s'apostrofa: **l'alta**. «la alta» és error d'apostrofació bàsic.

### 4.2 «farien slacken a d'altres» (Conscienciositat)
- Anglès: "maintain performance under conditions that would cause others to slacken"
- Català actual: «mantenen el rendiment en condicions que farien slacken a d'altres»
- Categoria: ERRADA (mot anglès sense traduir) · Gravetat ALTA
- Proposta: «en condicions que farien afluixar (o relaxar / abaixar el ritme) a d'altres»
- Justificació: **slacken** ha quedat sense traduir; és un anglès cru enmig del text. Equivalents: «afluixar», «relaxar-se», «abaixar el ritme». Error de traducció flagrant.

### 4.3 «quin és el trade-off» (la personalitat no pot predir)
- Anglès: "build clarity about what the trade-off is and whether it is worth it"
- Català actual: «o aclarir quin és el trade-off i si val la pena»
- Categoria: TERMINOLOGIA (manlleu sense traduir) · Gravetat MITJANA
- Proposta: «quin és el compromís (o la contrapartida / el balanç de pèrdues i guanys) i si val la pena»
- Justificació: *trade-off* és un manlleu cru evitable; en divulgació catalana es resol amb «compromís», «contrapartida», «equilibri de concessions». Si es manté, hauria d'anar en cursiva, però aquí hi ha equivalent net.

### 4.4 «generarà pipeline però no tancarà» (Extraversió)
- Anglès: "will generate pipeline and fail to close it"
- Català actual: «generarà pipeline però no tancarà»
- Categoria: TERMINOLOGIA (manlleu) + FIDELITAT · Gravetat BAIXA
- Proposta: «generarà cartera d'oportunitats (pipeline) però no la tancarà»
- Justificació: *pipeline* (de vendes) és gerga acceptable, però el complement «no tancarà» queda penjat: l'anglès diu «fail to close *it*». Cal el pronom: «no la tancarà». Per claredat divulgativa, glossar *pipeline* la primera vegada.

### 4.5 «slacken» a banda — «s'orienten cap a espais de problemes oberts» (Visió)
- Anglès: "are drawn to open problem spaces"
- Català actual: «s'orienten cap a espais de problemes oberts»
- Categoria: correcte · Gravetat —
- Justificació: bona traducció de *drawn to* per «s'orienten cap a»/«se senten atrets per»; fidel. Fals positiu registrat.

### 4.6 «emergir com a líders» (Extraversió)
- Anglès: "tend to emerge as leaders"
- Català actual: «tendeixen a emergir com a líders»
- Categoria: correcte · Gravetat —
- Justificació: ací *emergir* és intransitiu («emergir com a líders»), per tant l'ús és correcte (a diferència de l'ús transitiu erroni «emergir la bretxa» detectat en articles d'altres lots). Es registra com a fals positiu i contrast.

### 4.7 «un esforç significant» (la personalitat no pot predir)
- Anglès: "spending significant effort managing disengagement"
- Català actual: «probablement dedica un esforç significant a gestionar la desconnexió»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat MITJANA
- Proposta: «un esforç significatiu» (o «considerable»)
- Justificació: **significant** és fals amic d'*significant*; en català l'adjectiu és **significatiu** (-iva). «significant» només és el participi/substantiu lingüístic (el significant vs el significat). Error de fals amic.

### 4.8 «predicta» — (no en aquest article; vegeu social-media)
- Català actual: n/a
- Categoria: — · Gravetat —
- Justificació: marcador de referència creuada; sense incidència ací.

### Resum quantitatiu Article 4
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (la alta; slacken sense traduir) | 2 | – | – |
| TERMINOLOGIA (fals amic «significant»; manlleus trade-off/pipeline) | – | 2 | 1 |
| Total incidències | **2** | **2** | **1** |

---

## "Personalitat i xarxes socials: el que revelen les teves publicacions — i el que no"
`personality-and-social-media-what-your-posts-reveal`

### 5.1 «poden ser weaponitzades» (Cambridge Analytica)
- Anglès: "how personality data can be weaponised"
- Català actual: «com les dades de personalitat poden ser weaponitzades»
- Categoria: ERRADA (anglicisme cru inventat) · Gravetat ALTA
- Proposta: «com les dades de personalitat es poden convertir en arma» / «instrumentalitzar» / «utilitzar com a arma»
- Justificació: **weaponitzades** no existeix en català; és un calc-invenció directe de *weaponised*. Solucions: «convertir en arma», «armar», «instrumentalitzar». Error lèxic greu.

### 5.2 «la recerca sola potser no hauria warranted» (Cambridge Analytica)
- Anglès: "concerns ... that the research alone may not have warranted"
- Català actual: «preocupacions ... que la recerca sola potser no hauria warranted»
- Categoria: ERRADA (mot anglès sense traduir) · Gravetat ALTA
- Proposta: «que la recerca sola potser no hauria justificat» (o «no hauria avalat»)
- Justificació: **warranted** ha quedat literalment en anglès dins de la frase catalana. Equivalent: «justificat», «avalat», «merescut». Error de traducció flagrant.

### 5.3 «El investigador Aleksandr Kogan» (Cambridge Analytica)
- Anglès: "Researcher Aleksandr Kogan built..."
- Català actual: «El investigador Aleksandr Kogan va construir...»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «L'investigador Aleksandr Kogan...»
- Justificació: davant de mot masculí començat per vocal, *el* s'apostrofa: **l'investigador**. «El investigador» és error d'apostrofació.

### 5.4 «Dimensió Big Five predicta» (capçalera de taula)
- Anglès: "Big Five dimension predicted"
- Català actual: «Dimensió Big Five predicta»
- Categoria: ERRADA (participi) · Gravetat ALTA
- Proposta: «Dimensió Big Five predita» (o, més clar, «Dimensió Big Five que es prediu»)
- Justificació: el participi de *predir* és **predit/predita**, no «predicta» (forma inexistent, contaminada del cast. *predicha*/del verb *predicar*). Error visible en capçalera de taula.

### 5.5 «va construir una aplicació de proves de Facebook» (Cambridge Analytica)
- Anglès: "built a Facebook quiz app"
- Català actual: «va construir una aplicació de proves de Facebook»
- Categoria: FIDELITAT/REGISTRE · Gravetat BAIXA
- Proposta: «va crear una aplicació de qüestionaris (tipus quiz) a Facebook»
- Justificació: dos matisos. (a) *quiz app* no és «aplicació de proves» (que suggereix *test/proves de programari*) sinó una app de qüestionaris lúdics; «de proves» és ambigu. (b) *build an app* es diu més «crear/desenvolupar una aplicació» que «construir». Pèrdua de precisió.

### 5.6 «el comportament digital passiu porta un senyal real» (intro)
- Anglès: "passive digital behaviour carries real personality signal"
- Català actual: «el comportament digital passiu porta un senyal real de personalitat»
- Categoria: correcte · Gravetat —
- Justificació: «portar un senyal» per *carry signal* és acceptable i comprensible; es registra com a fals positiu (es podria refinar a «conté/transmet senyal», però no és error).

### 5.7 «circumval·la el coneixement i el consentiment» (per què Cèrcol)
- Anglès: "Social media inference bypasses the individual's knowledge and consent"
- Català actual: «La inferència a partir de xarxes socials circumval·la el coneixement i el consentiment de l'individu»
- Categoria: REGISTRE (preciosisme/fals amic) · Gravetat BAIXA
- Proposta: «esquiva (o evita / passa per alt) el coneixement i el consentiment de l'individu»
- Justificació: **circumval·lar** existeix en català però el seu sentit propi és «envoltar/encerclar» (sentit anatòmic i de circumval·lació viària); com a traducció de *bypass* (= eludir, evitar) és impropi i fosc. «Esquivar», «eludir», «passar per alt» són exactes.

### Resum quantitatiu Article 5
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (weaponitzades, warranted, predicta) | 3 | – | – |
| ERRADA (apostrofació El investigador) | – | 1 | – |
| FIDELITAT/REGISTRE (quiz app, circumval·la) | – | – | 2 |
| Total incidències | **3** | **1** | **2** |

---

## "Personalitat del product manager: quins trets prediuen l'eficàcia d'un PM?"
`product-manager-personality-what-works`

### 6.1 «quins trets predizen l'eficàcia» (títol)
- Anglès: "what traits predict PM effectiveness?"
- Català actual: «Personalitat del product manager: quins trets predizen l'eficàcia d'un PM?»
- Categoria: ERRADA (errata/conjugació) · Gravetat ALTA
- Proposta: «quins trets prediuen l'eficàcia d'un PM?»
- Justificació: **predizen** no és català (sembla creuament amb el cast. *predicen*/grafia inexistent). La 3a persona del plural de *predir* és **prediuen** (com sí apareix correctament al cos i a la descripció del mateix article). Error en el TÍTOL, màxima visibilitat.

### 6.2 «el qual equip apaga focs constantment» (perfils de risc)
- Anglès: "a PM who is liked but whose team is perpetually firefighting"
- Català actual: «un PM que és apreciat però el qual equip apaga focs constantment»
- Categoria: ERRADA (relatiu possessiu) · Gravetat ALTA
- Proposta: «un PM que és apreciat però l'equip del qual apaga focs constantment» (o «...però que té l'equip constantment apagant focs»)
- Justificació: «el qual equip» és agramatical com a relatiu possessiu; el català forma el possessiu relatiu amb «del qual» postposat al nom: «l'equip del qual». Error de sintaxi.

### 6.3 «no pot mantenir ferm les prioritats» / «mantenir ferm la direcció» (Bond; perfil òptim)
- Anglès: "cannot hold firm on priorities"; "hold firm on product direction"
- Català actual: «massa alta: no pot mantenir ferm les prioritats»; «no poder mantenir ferm la direcció del producte»
- Categoria: ERRADA (concordança/recció) · Gravetat MITJANA
- Proposta: «no pot mantenir-se ferm en les prioritats» / «no poder mantenir-se ferm en la direcció del producte» (o «no pot mantenir fermes les prioritats»)
- Justificació: *hold firm on X* és «mantenir-se ferm en X» (pronominal + «en»), no «mantenir ferm X». Tal com està, «ferm» queda com a predicatiu sense concordar (hauria de ser «fermes» amb «prioritats») i sense la preposició. Recurrent (dues ocurrències).

### 6.4 «hipòtesis novedoses» / «no novedoses» (Visió; taula)
- Anglès: "generate novel hypotheses"; "Solutions are competent but not novel"
- Català actual: «generin hipòtesis novedoses»; «Les solucions són competents però no novedoses»
- Categoria: TERMINOLOGIA/BARBARISME (castellanisme) · Gravetat ALTA
- Proposta: «hipòtesis noves (o originals / innovadores)»; «solucions ... però no innovadores (o no originals)»
- Justificació: **novedós/novedosa** és un castellanisme (cast. *novedoso*) no admès en català; l'Optimot el marca com a incorrecte i remet a **nou**, **original**, **innovador**. Recurrent (dues ocurrències). Vegeu Optimot, fitxa «novedós».

### 6.5 «en lloc del microgestió» (Presence)
- Anglès: "in a way that invites trust rather than micromanagement"
- Català actual: «d'una manera que convidi a la confiança en lloc del microgestió»
- Categoria: ERRADA (gènere/contracció) · Gravetat MITJANA
- Proposta: «en lloc de la microgestió»
- Justificació: *microgestió* és femení (la gestió → la microgestió); «del microgestió» fa una contracció masculina incorrecta. Cal «de la microgestió».

### 6.6 «feina accionable» (Disciplina)
- Anglès: "verbal commitments ... that are never translated into actionable work"
- Català actual: «compromisos verbals ... que mai es tradueixen en feina accionable»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «en feina aplicable / en tasques concretes / en feina realitzable»
- Justificació: **accionable** en el sentit d'*actionable* (sobre la qual es pot actuar) és un calc; en català «accionable» vol dir «que es pot accionar (un mecanisme)». TERMCAT recull «coneixement accionable» com a fitxa de consulta, però per a *work/tasks* el natural és «aplicable»/«concret»/«realitzable». Cf. glossari de l'auditoria.

### 6.7 «sobre-dependre» / «sobre-dependència» / «sobre-compromís» (Visió; Depth; taula)
- Anglès: "over-rely on"; "over-dependence"; "over-commitment"
- Català actual: «tendeixen a sobre-dependre de marcs existents», «sobre-dependència de la certesa», «sobre-compromís amb els stakeholders»
- Categoria: ERRADA (prefixació) + REGISTRE · Gravetat MITJANA
- Proposta: «depenen en excés de», «dependència excessiva de», «compromís excessiu amb»
- Justificació: el prefix *sobre-* s'aglutina sense guionet (sobredependència, sobrecompromís), però sobretot aquestes formes prefixades calquen *over-* i sonen forçades; el català prefereix la perífrasi «en excés / excessiu/-iva». Doble qüestió: guionet improcedent + calc.

### 6.8 «mantenir l'atenció d'una sala» (Presence)
- Anglès: "the capacity to hold a room"
- Català actual: «la capacitat de mantenir l'atenció d'una sala»
- Categoria: correcte · Gravetat —
- Justificació: bona solució idiomàtica de *hold a room* (no traduït literalment); fals positiu registrat.

### 6.9 «el punt dolç de la personalitat del PM» (callout)
- Anglès: "The PM personality sweet spot"
- Català actual: «El punt dolç de la personalitat del PM»
- Categoria: CALC (idiomàtic) · Gravetat BAIXA
- Proposta: «El punt òptim (o l'equilibri ideal) de la personalitat del PM»
- Justificació: «punt dolç» és calc de *sweet spot*; tot i que circula, en registre divulgatiu culte «punt òptim»/«equilibri ideal»/«combinació idònia» és més transparent i menys calcat.

### Resum quantitatiu Article 6
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (predizen, el qual equip) | 2 | – | – |
| ERRADA (recció «mantenir ferm»; del microgestió; sobre-) | – | 3 | – |
| TERMINOLOGIA/BARBARISME (novedoses) | 1 | – | – |
| CALC (accionable, punt dolç) | – | 1 | 1 |
| Total incidències | **3** | **4** | **1** |

---

## "Confiança en equips: les bases de personalitat de la cohesió d'equip"
`trust-in-teams-personality-foundations`

Nota de model: aquest article tracta el lector de **vós** (*pregunteu, confieu,
el vostre equip, mesureu*), coherent amb `how-to-design-meetings`. Sense
incidència de tractament intern.

### 7.1 «No actua competència» / «en lloc d'actuar competència» (intro; confiança afectiva)
- Anglès: "They do not perform competence at the cost of accuracy"; "ask for help rather than performing competence"
- Català actual: «No actua competència a costa de la precisió»; «demaneu ajuda en lloc d'actuar competència»
- Categoria: CALC + ERRADA (recció) · Gravetat ALTA
- Proposta: «No fingeixen (o no escenifiquen / no aparenten) competència a costa de la precisió»; «en lloc d'aparentar competència»
- Justificació: *to perform competence* aquí vol dir «fer veure / aparentar / escenificar competència», no «actuar competència» (agramatical: *actuar* és intransitiu i no regeix aquest CD). És un calc que, a més, trenca la recció verbal. Recurrent (dues ocurrències).

### 7.2 «La gent fa matisades» (intro)
- Anglès: "People hedge."
- Català actual: «La gent fa matisades.»
- Categoria: ERRADA (frase agramatical) · Gravetat ALTA
- Proposta: «La gent es reserva (o matisa, o va amb peus de plom / no es mulla).»
- Justificació: «fa matisades» és agramatical i inintel·ligible (li falta nucli nominal i concordança). *To hedge* (protegir-se, no comprometre's, ser evasiu) es tradueix per «matisar», «no mullar-se», «posar-se la bena abans de la ferida». Frase trencada en un paràgraf d'obertura.

### 7.3 «no explotar les vostres vulnerabilitats» (confiança afectiva)
- Anglès: "genuinely cares about your interests, will not exploit your vulnerabilities"
- Català actual: «algú genuïnament es preocupa pels vostres interessos, no explotar les vostres vulnerabilitats, i és emocionalment segur ser honest amb ell»
- Categoria: ERRADA (mode verbal/coordinació) · Gravetat ALTA
- Proposta: «...es preocupa pels vostres interessos, no explotarà les vostres vulnerabilitats i és emocionalment segur ser-hi honest»
- Justificació: la sèrie coordina tres oracions amb verb conjugat («es preocupa ... és...») però al mig hi posa un infinitiu nu «no explotar», que trenca la concordança i el sentit (l'anglès és *will not exploit*, futur). Cal «no explotarà». Error gramatical de coordinació.

### 7.4 «amb ampla variança d'Amabilitat» (Bond)
- Anglès: "teams with wide Agreeableness variance"
- Català actual: «en equips amb ampla variança d'Amabilitat»
- Categoria: ERRADA (lèxic/forma) · Gravetat MITJANA
- Proposta: «amb una àmplia variància d'Amabilitat» (o «amb molta variància»)
- Justificació: dos punts. (a) **ampla** és forma dialectal/col·loquial; el femení normatiu d'*ampli* és **àmplia** (DNV/DIEC2). (b) *variance* (estadística) és **variància** amb accent; «variança» és grafia castellanitzant. Recurrent: «variança» apareix també més avall i a la taula.

### 7.5 «com amenazants» (Neuroticisme)
- Anglès: "interpret ambiguous social signals as threatening"
- Català actual: «és més probable que interpretin els senyals socials ambigus com amenazants»
- Categoria: ERRADA (castellanisme) · Gravetat ALTA
- Proposta: «com a amenaçadors»
- Justificació: **amenazants** és doblement incorrecte: grafia castellana (*z* per *ç*) i forma («amenaçant» tampoc és la preferent). L'adjectiu català recollit pel DIEC2 és **amenaçador -a**. A més, com a atribut cal «com a amenaçadors». Vegeu DIEC2, entrada «amenaçador».

### 7.6 «après de la traïció» / «reconstruir la confiança après d'una traïció» / «re-estendre la confiança fins i tot après d'una resolució» (reparació)
- Anglès: "Trust Repair After Betrayal"; "rebuild trust after betrayal"; "re-extend trust even after conscious resolution"
- Català actual: «Reparació de la confiança après de la traïció» (títol); «reconstruir la confiança après d'una traïció»; «après d'una resolució conscient»
- Categoria: ERRADA (castellanisme/gal·licisme) · Gravetat ALTA
- Proposta: «després de la traïció», «després d'una traïció», «després d'una resolució conscient»
- Justificació: **après** (= *after*) no és català; és gal·licisme/castellanisme. La forma catalana és **després**. Recurrent (tres ocurrències, una en un titular de secció). Vegeu DIEC2/diccionari.cat, «després».

### 7.7 «re-estendre» / «re-estendre la confiança» (reparació)
- Anglès: "re-extend trust"
- Català actual: «dificulta genuïnament re-estendre la confiança»
- Categoria: ERRADA (prefixació) + CALC · Gravetat MITJANA
- Proposta: «tornar a atorgar (o a concedir / a dipositar) la confiança»
- Justificació: «re-estendre» combina guionet improcedent (re- s'aglutina) amb un calc d'*extend trust* («estendre la confiança»); en català la confiança es «diposita», «atorga», «concedeix», i la represa s'expressa amb «tornar a + infinitiu». Doble problema.

### 7.8 «estan en la raó» (valoracions dels iguals) — (apareix a l'art. self-assessment; vegeu 8.x)
- Català actual: n/a en aquest article.
- Categoria: — · Gravetat —
- Justificació: referència creuada; sense incidència ací.

### 7.9 «prescindir de la construcció de confiança projectant certesa prematura» (taula)
- Anglès: "can short-circuit trust-building by projecting premature certainty"
- Català actual: «poden prescindir de la construcció de confiança projectant certesa prematura»
- Categoria: FIDELITAT · Gravetat MITJANA
- Proposta: «poden curtcircuitar (o malmetre / dinamitar) la construcció de confiança projectant una certesa prematura»
- Justificació: *short-circuit* aquí és «curtcircuitar / sabotejar / fer descarrilar» el procés, NO «prescindir de» (= renunciar-hi). «Prescindir de» altera el sentit: no és que en passin, és que el fan malbé. Pèrdua de fidelitat.

### 7.10 «No actua... Es protegeixen» — coherència de nombre (intro)
- Anglès: "People hedge. They protect themselves."
- Català actual: «La gent fa matisades. Es protegeixen.»
- Categoria: REGISTRE/COHERÈNCIA (concordança) · Gravetat BAIXA
- Proposta: triar nombre: «La gent matisa. Es protegeix.» (singular col·lectiu) de manera coherent.
- Justificació: «la gent» (singular) alterna amb verbs en plural («es protegeixen», «gestionen») dins del mateix paràgraf. La concordança ad sensum és tolerada, però convé uniformitzar-la dins del passatge.

### Resum quantitatiu Article 7
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| CALC + ERRADA (actuar competència) | 1 | – | – |
| ERRADA (fa matisades; no explotar; amenazants; après ×3) | 3 | – | – |
| ERRADA (ampla/variança; re-estendre) | – | 2 | – |
| FIDELITAT (prescindir/short-circuit) | – | 1 | – |
| REGISTRE/COHERÈNCIA (la gent + plural) | – | – | 1 |
| Total incidències | **4** | **3** | **1** |

---

## "Per què l'autoavaluació sola no és suficient: el cas de la retroalimentació de personalitat entre iguals"
`why-self-assessment-alone-isnt-enough-peer-personality-feedback`

### 8.1 «acord self-altre» / «self-vers-iguals» / «self-altri» (transversal)
- Anglès: "self-other agreement"; "self-vs-peer gaps"
- Català actual: «la recerca sobre l'acord self-altre», «correlacions self-altre», «les bretxes self-vers-iguals» (crida), «Acord self-altri en el Big Five» (enllaç)
- Categoria: CALC/TERMINOLOGIA · Gravetat ALTA
- Proposta: «acord entre l'autopercepció i la percepció dels altres» / «acord entre un mateix i els altres» / «concordança autoinforme–heteroinforme»; per a la bretxa: «les bretxes entre l'autovaloració i la valoració dels iguals».
- Justificació: **self-other** ha quedat sense traduir en un terme tècnic que estructura tot l'article (apareix com a mínim 6 vegades, inclòs un titular de secció i una capçalera de taula). «self-altre», «self-vers-iguals» i «self-altri» (a l'enllaç) són tres calcs diferents del mateix concepte, cap acceptable. Cal una designació catalana unificada. Error terminològic central i recurrent.

### 8.2 «les autovalorades» (transversal, com a substantiu)
- Anglès: "self-ratings"
- Català actual: «que recullen tant les autovalorades com les valoracions de persones...», «no s'explica per les autovalorades», «la combinació de les autovalorades i les valoracions dels iguals», etc.
- Categoria: ERRADA (substantivació impròpia) · Gravetat ALTA
- Proposta: «les autovaloracions» (substantiu) — o «les valoracions pròpies»
- Justificació: *self-ratings* és «autovaloracions» (substantiu). «les autovalorades» substantiva un participi femení («valorades») que no té antecedent: és agramatical com a nom. El substantiu correcte és **autovaloració/autovaloracions**. Error recurrent i sistemàtic (apareix 8+ vegades).

### 8.3 «probablement estan en la raó» (agregació)
- Anglès: "are probably right"
- Català actual: «Cinc iguals que independentment concorden que algú té una Presència alta probablement estan en la raó»
- Categoria: CALC (locució) · Gravetat MITJANA
- Proposta: «probablement tenen raó» (o «probablement encerten / estan en el cert»)
- Justificació: «estar en la raó» és calc del cast. *estar en la razón*; la locució catalana és **tenir raó** (o «estar en el cert»). Confirmat: «tenir raó» és la forma genuïna; «estar en la raó» no és normativa. Vegeu diccionari.cat / Softcatalà, «tenir raó».

### 8.4 «circumplext AB5C» (instrument Testimoni)
- Anglès: "the AB5C circumplex"
- Català actual: «estan basats en el **circumplext AB5C**»
- Categoria: ERRADA (errata) + TERMINOLOGIA · Gravetat ALTA
- Proposta: «el **circumplex AB5C**»
- Justificació: **circumplext** (amb *-t* final) és una errata; el terme és **circumplex** (model circular). Doble interès: a més del lapsus tipogràfic, recorda el fals amic *circumflex* (l'accent ^) detectat en altres articles del lot — ací almenys la base és correcta, només sobra la *-t*. Terme tècnic central de l'instrument.

### 8.5 «obivament» (selecció forçada)
- Anglès: "there is no obviously 'good' or 'bad' answer"
- Català actual: «no hi ha una resposta "bona" o "dolenta" obivament»
- Categoria: ERRADA (errata) + ordre · Gravetat MITJANA
- Proposta: «no hi ha una resposta òbviament "bona" o "dolenta"» (adverbi anteposat)
- Justificació: **obivament** és errata de **òbviament** (metàtesi/omissió). A més, l'adverbi va postposat i despenjat al final; el natural és anteposar-lo a l'adjectiu que modifica: «òbviament "bona" o "dolenta"».

### 8.6 «punts de referència interns diferent» (grup de referència)
- Anglès: "different people use different internal benchmarks"
- Català actual: «Com que persones diferents utilitzen punts de referència interns diferent, els autoinformes...»
- Categoria: ERRADA (concordança) · Gravetat ALTA
- Proposta: «punts de referència interns diferents»
- Justificació: «diferent» (singular) ha de concordar amb «punts de referència interns» (plural): **diferents**. Error de concordança de nombre flagrant.

### 8.7 «difícils d'actuar» (límits del 360)
- Anglès: "feedback reports that are rich in data but difficult to act on"
- Català actual: «informes de feedback que són rics en dades però difícils d'actuar»
- Categoria: FIDELITAT/CALC · Gravetat MITJANA
- Proposta: «difícils d'aplicar» / «difícils de traduir en accions» / «sobre els quals costa actuar»
- Justificació: *difficult to act on* no és «difícils d'actuar» (que no regeix CD i queda penjat); el sentit és «difícils d'aplicar / de convertir en accions». La construcció catalana demana «d'aplicar» o «de dur a la pràctica».

### 8.8 «una suposició raonada» (intro)
- Anglès: "It is a reasonable assumption."
- Català actual: «És una suposició raonada.»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat MITJANA
- Proposta: «És una suposició raonable.»
- Justificació: *reasonable* = **raonable** (sensata, plausible), no «raonada» (= argumentada, justificada amb raons). Canvi de sentit: l'anglès diu que la premissa és raonable, no que estigui raonada.

### 8.9 «quanta energia omples d'una sala» (implicacions pràctiques)
- Anglès: "you underestimate how much your energy fills a room"
- Català actual: «subestimes quanta energia omples d'una sala — o quant l'aclapares»
- Categoria: ERRADA (sintaxi/recció) · Gravetat MITJANA
- Proposta: «subestimes quanta energia (la teva) omple una sala — o quant l'aclapara»
- Justificació: la frase tal com és no es comprèn: «omples d'una sala» (2a persona + «de» espuri) desfà el subjecte real, que és «la teva energia» (3a persona: «omple una sala»). L'anglès: *how much your energy fills a room*. Cal subjecte «la teva energia» i verb en 3a; «omplir una sala» (CD directe, sense «de»).

### 8.10 «Estic organitzat» / «la idea d'organitzat» (grup de referència)
- Anglès: «When you rate yourself on "I am organised"»
- Català actual: «Quan et valores a tu mateix en "Estic organitzat"»
- Categoria: correcte · Gravetat —
- Justificació: traducció acceptable de l'ítem; «Estic organitzat» (o «Soc organitzat») és vàlid. Fals positiu registrat (matís: *organised* com a tret estable s'expressaria millor amb «Soc organitzat», però no és error).

### Resum quantitatiu Article 8
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| CALC/TERMINOLOGIA (self-altre; estar en la raó) | 1 | 1 | – |
| ERRADA (autovalorades; circumplext; diferent; obivament) | 3 | 1 | – |
| FIDELITAT/fals amic (difícils d'actuar; raonada; omples) | – | 3 | – |
| Total incidències | **4** | **5** | **0** |


## "L'amabilitat a la feina: el cost ocult de ser massa agradable" (`agreeableness-at-work-the-hidden-cost-of-being-too-nice`)

### 1.1 «que casualmente s'adapten» (no apareix en aquest article; vegeu nota) — descartat
Aquest article NO conté l'errada «casualmente»; es retira per evitar fals positiu. (Es deixa constància per claredat: el castellanisme «casualmente» apareix en l'article `remote-team-communication-styles-big-five`, no aquí.)

### 1.2 «La troballa més sorprenent... una de les majors efectes»
- Ubicació: secció «La Penalitat Salarial de l'Amabilitat», cos de la cita traduïda de Judge et al.
- Anglès: "...the wage penalty for high Agreeableness being among the largest personality effects on economic outcomes..."
- Català actual: «sent la penalitat salarial per a l'Amabilitat elevada **una de les majors efectes** de personalitat sobre els resultats econòmics»
- Categoria: ERRADA (concordança de gènere) · Gravetat ALTA
- Proposta: «sent la penalitat salarial per a l'Amabilitat elevada **un dels majors efectes** de personalitat sobre els resultats econòmics»
- Justificació: «efecte» és masculí; «una de les majors efectes» trenca la concordança. Ha de ser «un dels majors efectes» (o «un dels efectes més grans»). Error gramatical objectiu.

### 1.3 «directament accionable» / «la informació més accionable»
- Ubicació: secció final «Veieu el vostre perfil Bond...».
- Anglès: "...is where the most actionable information tends to live."
- Català actual: «és on tendeix a viure la informació **més accionable**»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «la informació **més aplicable**» / «la informació **sobre la qual es pot actuar** més directament»
- Justificació: glossari de l'auditoria. «accionable» en sentit *actionable* és calc; en català «accionable» = "que es pot accionar (un mecanisme)". El sentit pretès és «aplicable». Mateix criteri que 3.9 del blog previ.

### 1.4 «on tendeix a viure la informació»
- Ubicació: mateixa frase final.
- Anglès: "is where the most actionable information tends to live"
- Català actual: «és **on tendeix a viure** la informació més accionable»
- Categoria: CALC (idiomàtic) · Gravetat BAIXA
- Proposta: «és **on sol trobar-se** la informació més aplicable» / «és on acostuma a residir»
- Justificació: «viure» aplicat a informació és calc de l'anglès *to live* (=trobar-se, residir). En català culte «trobar-se / residir / situar-se» és l'opció natural; «viure» reservat per a éssers animats fa l'efecte de personificació no volguda.

### 1.5 «pot servir com a útil marc» — descartat (no present)
- L'article NO conté l'anteposició «útil marc»; aquí diu «un marc de comunicació» de manera correcta. Sense incidència; es registra per descartar el fals positiu transversal del blog 1.

### 1.6 «un mínimo»
- Ubicació: secció «Com les Persones amb Bond Elevat Poden Establir Límits», pas «Prepareu posicions de negociació».
- Anglès: "a specific target, a walk-away point, and a set of objective rationales"
- Català actual: «un objectiu específic, **un mínimo** i un conjunt de raonaments objectius»
- Categoria: ERRADA (castellanisme/errata) · Gravetat ALTA
- Proposta: «un objectiu específic, **un límit mínim** (o «un punt de ruptura») i un conjunt de raonaments objectius»
- Justificació: «mínimo» és la forma castellana; en català és «mínim». A més, *walk-away point* no és exactament «mínim»: és el «punt de ruptura / límit per retirar-se». Doble problema: barbarisme + pèrdua de precisió respecte de la font.

### 1.7 Tractament barrejat tu/vós (cos de l'article)
- Ubicació: tot el cos. Conviuen imperatius de vós en negreta («Prepareu», «Distingiu», «Useu», «Establiu») amb 2a persona del singular en els exemples i en la secció final («el vostre perfil», «la vostra puntuació», «et dóna un punt de partida»... ). En concret: «**et dóna** un punt de partida» (tu) enmig de «la **vostra** cooperació», «el **vostre** perfil» (vós).
- Anglès: registre neutre amb "you" (no marca T/V).
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós: «**us dóna** un punt de partida».
- Justificació: model de llengua de l'auditoria (vós). El gruix de l'article ja és vós («Prepareu», «el vostre perfil»); la forma «et dóna» és una recaiguda en tu. Cal coherència interna.

### 1.8 «Les persones... les quals l'autoavaluació tendeix cap a la subestimació»
- Ubicació: secció «Com les Persones amb Bond Elevat...», pas «Useu la xarxa de Testimonis».
- Anglès: "For high-Bond individuals, whose self-assessment tends toward modest underestimation..."
- Català actual: «Per a les persones amb Bond elevat, **les quals l'autoavaluació tendeix** cap a la subestimació modesta...»
- Categoria: ERRADA (relatiu possessiu) · Gravetat MITJANA
- Proposta: «Per a les persones amb Bond elevat, **l'autoavaluació de les quals** tendeix cap a la subestimació modesta...» (o «de qui l'autoavaluació tendeix...»)
- Justificació: el relatiu possessiu anglès *whose* no es tradueix per «les quals» en posició de subjecte; exigeix «de les quals / de qui» amb el nom posseït. «les quals l'autoavaluació tendeix» és agramatical (manca el possessiu i el relatiu queda penjant).

### 1.9 «com els col·legues ni registrin el desequilibri»
- Ubicació: mateixa secció final.
- Anglès: "...in ways that cost them without colleagues even registering the imbalance"
- Català actual: «de maneres que els costen sense que els col·legues **ni registrin** el desequilibri»
- Categoria: ERRADA (negació) · Gravetat BAIXA
- Proposta: «sense que els col·legues **ni tan sols registrin** el desequilibri» / «sense que els col·legues arribin a registrar el desequilibri»
- Justificació: «ni» tot sol davant del verb per traduir *even* és un calc/elisió; el català culte demana «ni tan sols» o reformulació. «ni registrin» és ambigu i sintàcticament pobre.

### Resum quantitatiu — Article «agreeableness-at-work»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (concordança, barbarisme, relatiu, negació) | 2 | 1 | 1 |
| CALC (accionable, «viure») | – | 1 | 1 |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **2** | **3** | **2** |

---

## "Les diferències generacionals en personalitat existeixen realment? L'evidència" (`do-generational-differences-in-personality-actually-exist`)

### 2.1 «estan entitled» / «un sentit d'entitlement»
- Ubicació: secció «D'on ve l'estereotip...» («estan entitled») i taula d'estereotips («un sentit d'entitlement»).
- Anglès: "Millennials ... are entitled" / "cohort-level sense of entitlement"
- Català actual: «Els Mil·lennials... **estan entitled**»; «Cap evidència sòlida del Big Five per a **un sentit d'entitlement**»
- Categoria: TERMINOLOGIA (anglicisme cru no traduït) · Gravetat ALTA
- Proposta: «tenen un sentiment de **mereixement** / es creuen amb **drets adquirits**»; «un **sentiment de mereixement**» (o «de tenir-hi dret»). Cf. la versió ES «un sentido de entitlement» també falla; el referent culte català demana traducció.
- Justificació: *entitled* / *entitlement* són anglicismes purs sense adaptar; en un text divulgatiu català han de traduir-se («sentiment de mereixement», «creure's amb drets»). Deixar «entitled» en cru és una incidència terminològica greu (mot estranger no integrat ni en cursiva).

### 2.2 «Un Mil·lennials nascut el 1981»
- Ubicació: secció «Per què la generació no és un tipus de personalitat vàlid», «El problema de la taxa base».
- Anglès: "A Millennial born in 1981..."
- Català actual: «**Un Mil·lennials** nascut el 1981... que **un Mil·lennials** nascut el 1995»
- Categoria: ERRADA (concordança de nombre) · Gravetat MITJANA
- Proposta: «**Un mil·lennial** nascut el 1981... que **un mil·lennial** nascut el 1995»
- Justificació: el singular «un» no concorda amb la forma plural «Mil·lennials». El singular català és «un mil·lennial». A més, en aquest ús comú («un mil·lennial», no marca registrada) la minúscula és preferible. Recurrent.

### 2.3 «La recerca sobre la "cicatriu de cohort"»
- Ubicació: secció «El que realment prediu les diferències generacionals...».
- Anglès: "Research on the 'cohort scar'..." (cf. l'efecte conegut com a *scarring*)
- Català actual: «La recerca sobre la **"cicatriu de cohort"**»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: acceptable; opcionalment «**efecte d'estigmatització/segellament de cohort**» o mantenir «cicatriu de cohort» entre cometes (metàfora). Sense canvi obligatori; es registra perquè el terme tècnic habitual és l'«efecte scarring», i convé glossar-lo la primera vegada.
- Justificació: nota terminològica; no és error.

### 2.4 «la taxa base» (the base rate)
- Ubicació: títol de paràgraf «El problema de la taxa base».
- Anglès: "The base rate problem."
- Català actual: «El problema de la **taxa base**»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: «El problema de la **taxa base** (o **freqüència de base**)»: acceptable. En estadística catalana es documenta «taxa base» i «freqüència base»; cap canvi imprescindible. Es registra com a fals positiu potencial: és correcte.
- Justificació: terme admès; sense incidència real.

### 2.5 «d'on ve l'estereotip» + tractament tu
- Ubicació: entrada («trobaràs sessions»), i CTA final («comença mesurant», «si vols entendre el teu equip», «et proporciona»).
- Anglès: "you will find sessions..."
- Català actual: tot l'article tracta de **tu** de manera coherent: «trobaràs», «el teu equip», «comença mesurant», «Fes l'avaluació».
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: per al model de llengua de l'auditoria (vós) caldria unificar a vós a tota la col·lecció: «trobareu», «el vostre equip», «comenceu mesurant», «Feu l'avaluació». Internament l'article és coherent (tot tu); la incidència és de model, no interna.
- Justificació: el brief fixa el tractament de vós per a les crides al lector. Aquest article usa tu de manera sistemàtica; cal migrar-lo a vós per coherència amb el model i amb la resta del lot que ja usa vós.

### 2.6 «Aquestes caracteritzacions... Tenen l'aparença **de afirmacions**»
- Ubicació: secció «D'on ve l'estereotip...».
- Anglès: "They have the ring of empirical claims."
- Català actual: «Tenen l'aparença **de afirmacions** empíriques.»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «Tenen l'aparença **d'afirmacions** empíriques.»
- Justificació: la preposició «de» s'apostrofa davant de mot començat per vocal: «d'afirmacions». «de afirmacions» és errada ortogràfica.

### 2.7 «la crisi de replicació... ha fet que tals troballes contestades»
- Ubicació: secció «El que mostren realment les dades longitudinals...».
- Anglès: "...has made such contested findings even harder to interpret."
- Català actual: «ha fet que **tals troballes contestades** siguin encara més difícils d'interpretar»
- Categoria: REGISTRE · Gravetat BAIXA
- Proposta: «ha fet que **aquestes troballes**, tan disputades, siguin encara més difícils d'interpretar» (evitar «tals» anteposat sec, calc de *such*)
- Justificació: «tals troballes» calca *such findings*; en català «tals» anteposat sense article és arcaïtzant i ressona a calc. Millor «aquestes troballes (tan) disputades» o «troballes d'aquesta mena». A més, «contestades» (=disputades) frega el calc del cast. *contestadas*; «disputades / qüestionades» és més transparent.

### 2.8 «en l'opinió de la majoria dels investigadors»
- Ubicació: paràgraf introductori.
- Anglès: "in the view of most personality researchers"
- Català actual: «**en l'opinió de** la majoria dels investigadors de la personalitat»
- Categoria: CALC (preposició) · Gravetat BAIXA
- Proposta: «**segons** la majoria dels investigadors de la personalitat» / «a parer de la majoria»
- Justificació: «en l'opinió de» calca l'anglès *in the view of*/cast. *en la opinión de*; el règim català natural és «segons», «a parer de», «en opinió de» (sense article). Millora de naturalesa.

### Resum quantitatiu — Article «do-generational-differences»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (concordança, apostrofació) | – | 2 | – |
| TERMINOLOGIA (entitled, cohort scar, base rate) | 1 | – | 2 |
| REGISTRE/COHERÈNCIA (tractament, «tals») | – | 1 | 1 |
| CALC (preposició) | – | – | 1 |
| Total incidències | **1** | **3** | **4** |

---

## "Com donar feedback informat per la personalitat: el que diu la investigació" (`how-to-give-personality-informed-feedback`)

### 3.1 «feedback» com a manlleu (títol i cos) vs «retroalimentació»
- Ubicació: tot l'article (títol inclòs): «feedback» de manera sistemàtica.
- Anglès: "feedback"
- Català actual: «**feedback**» a tot arreu (mai «retroalimentació»)
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: «feedback» és acceptat per TERMCAT com a manlleu en l'àmbit empresarial, per tant **no és error intern**. PERÒ contrasta amb la resta de la col·lecció de blog (articles previs i `remote-team...`, `personality-and-communication...`) que usen «retroalimentació». Cal decidir UNA forma per a tota la col·lecció.
- Justificació: coherència inter-article. Internament aquest article és coherent (sempre «feedback»); la incidència és de col·lecció (alguns articles diuen «retroalimentació», aquest «feedback»).

### 3.2 «La trobar central de la literatura de feedback»
- Ubicació: secció «Per Què el Mateix Feedback Produeix Reaccions Oposades».
- Anglès: "The core finding from the feedback literature is that..."
- Català actual: «**La trobar central** de la literatura de feedback és que...»
- Categoria: ERRADA (errata gramatical) · Gravetat ALTA
- Proposta: «**La troballa central** de la literatura sobre el feedback és que...»
- Justificació: «La trobar» és agramatical (infinitiu en lloc de substantiu). El substantiu és «troballa» (cf. *finding*). Error visible. A més «literatura de feedback» → «literatura sobre el feedback» (règim).

### 3.3 «feedback bé intencionat»
- Ubicació: secció «Alta Profunditat (Neuroticisme)».
- Anglès: "even well-intentioned, specific, behavioural feedback"
- Català actual: «el feedback **bé intencionat**, específic i conductual»
- Categoria: ERRADA (adverbi/adjectiu) · Gravetat MITJANA
- Proposta: «el feedback **ben intencionat**, específic i conductual»
- Justificació: davant d'adjectiu/participi, l'adverbi «bé» pren la forma «ben» (ben fet, ben intencionat). «bé intencionat» és incorrecte. (Cf. també «bé lliurat» si apareix en altres punts; ací el cas és «ben intencionat».)

### 3.4 «el sistema afiliactiu»
- Ubicació: secció «Alta Profunditat (Neuroticisme)».
- Anglès: "it activates the affiliative system"
- Català actual: «perquè activa el **sistema afiliactiu** i redueix la resposta d'amenaça»
- Categoria: ERRADA (errata lèxica) · Gravetat ALTA
- Proposta: «activa el **sistema afiliatiu**»
- Justificació: «afiliactiu» no existeix; és una errata per «**afiliatiu**» (relatiu a l'afiliació, *affiliative*). Mot inventat → errada objectiva.

### 3.5 «defensivitat» (recurrent)
- Ubicació: tot l'article: «defensivitat», «processament defensiu», «reaccions defensives».
- Anglès: "defensiveness" / "defensive reactions"
- Català actual: «**defensivitat**»
- Categoria: TERMINOLOGIA (calc) · Gravetat BAIXA
- Proposta: «**actitud defensiva** / **reaccions defensives** / posar-se a la defensiva». «defensivitat» no és al DIEC2/DNV; és calc de *defensiveness*/*defensividad*.
- Justificació: el substantiu «defensivitat» no és normatiu; el català expressa el concepte amb «actitud/reacció defensiva» o «posar-se a la defensiva». Recurrent; convé reformular almenys quan funciona com a substantiu nu.

### 3.6 «desengantxament» / «es desengantxa»
- Ubicació: cos («vergonya o desengantxament»), i la descripció (camp `description`: «o es **desengantxa**»).
- Anglès: "disengagement" / "disengages"
- Català actual: «**desengantxament**», «es **desengantxa**»
- Categoria: ERRADA/TERMINOLOGIA (calc del cast.) · Gravetat MITJANA
- Proposta: «**desconnexió** / **desimplicació** / **desvinculació**»; verb «es **desvincula** / es **desconnecta** / **deixa d'implicar-se**»
- Justificació: «desengantxar-se» (del cast. *desengancharse*) no és el terme adequat per a *disengagement* psicològic-laboral; en català el concepte és «desconnexió» o «desvinculació» (i el contrari de «implicació/compromís», *engagement*). A la descripció ES original es manté «se desengantxa» (errada compartida), però el referent català culte demana corregir-ho. Recurrent.

### 3.7 «aquiescència» / «patró d'aquiescència»
- Ubicació: secció «Alt Vincle (Amabilitat)».
- Anglès: "acquiescence" / "acquiescence pattern"
- Català actual: «aquest **patró d'aquiescència** està documentat»
- Categoria: correcte · Gravetat —
- Proposta: cap. «aquiescència» és normatiu (DIEC2/DNV) i adequat tècnicament. Es registra per descartar fals positiu (contrasta amb el dubtós «desengantxament», que sí cal corregir).
- Justificació: terme correcte; sense incidència.

### 3.8 Tractament barrejat tu/vós
- Ubicació: el cos usa imperatius de vós («reconeixeu el treball», «Emmarca»/«Emmarqueu», «Separeu l'estàndard», «invita explícitament»→«invita»/«Sigues específic») de manera irregular, i la secció final/CTA usa **tu** clar: «Coneix a Qui Estàs Donant Feedback», «Pots tenir el missatge», «pots dissenyar la sessió», «Explora l'instrument». Conviu amb «el receptor». Hi ha barreja real: «**reconeixeu** el treball» (vós) vs «**Sigues** específic», «**Coneix**», «**Pots**» (tu).
- Anglès: "you" neutre.
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat ALTA
- Proposta: unificar tot a vós: «reconeixeu», «sigueu específic», «Coneixeu qui...», «Podeu tenir el missatge», «podeu dissenyar la sessió», «Exploreu l'instrument».
- Justificació: model de l'auditoria (vós) i, sobretot, coherència interna: l'article barreja imperatius de vós en el cos amb imperatius/verbs de tu a la conclusió. És la barreja T/V més flagrant del lot.

### 3.9 «Preface les avaluacions» — descartat (és l'altre article)
- Aquest cas pertany a `personality-and-communication-style...`; no es comptabilitza aquí.

### Resum quantitatiu — Article «how-to-give-personality-informed-feedback»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (troballa, afiliatiu, «ben», desengantxament) | 2 | 2 | – |
| TERMINOLOGIA (defensivitat, feedback/retroalimentació) | – | 1 | 1 |
| REGISTRE/COHERÈNCIA (tractament) | 1 | – | – |
| Total incidències | **3** | **3** | **1** |

---

## "Personalitat i estil de comunicació: directe vs diplomàtic — el que diu la recerca" (`personality-and-communication-style-direct-vs-diplomatic`)

### 4.1 «Preface les avaluacions crítiques»
- Ubicació: secció «Agreeableness (Bond)», llista de tendències dels comunicadors amb alta Bond.
- Anglès: "Preface critical assessments with acknowledgement of the other person's effort..."
- Català actual: «**Preface** les avaluacions crítiques amb el reconeixement de l'esforç...»
- Categoria: ERRADA/CALC (verb anglès no traduït) · Gravetat ALTA
- Proposta: «**Encapçalen / introdueixen / precedeixen** les avaluacions crítiques amb el reconeixement de l'esforç...»
- Justificació: «Preface» és el verb anglès *to preface* deixat sense traduir (i fora de la flexió catalana: la llista usa 3a persona, «tendeixen a... usar... suavitzar... evitar», però aquí apareix l'infinitiu/imperatiu anglès cru). Cal el verb català «encapçalar / introduir / fer precedir». Error greu: mot estranger no traduït dins d'una enumeració paral·lela.

### 4.2 «si us plau, contradiu qualsevol cosa» — descartat (és l'altre article); ací «em pregunto si podríem»
- No aplica; sense incidència.

### 4.3 «subreprensentin» / «subrepresenten la seva competència»
- Ubicació: secció «Neuroticism (Profunditat)».
- Anglès: "high-Depth communicators systematically under-represent their competence and confidence"
- Català actual: «els comunicadors amb alta Profunditat **subreprensentin** sistemàticament la seva competència»
- Categoria: ERRADA (errata ortogràfica) · Gravetat ALTA
- Proposta: «**subrepresentin** sistemàticament la seva competència»
- Justificació: «subreprensentin» conté una «-n-» paràsita; la forma és «**subrepresentar**» (sub- + representar). Errata clara. (Possessiu «la seva» coherent amb la resta de l'article, que usa «seva/seu».)

### 4.4 «estratègies de autopresentació protectora»
- Ubicació: secció «Neuroticism (Profunditat)», cita de Leary et al.
- Anglès: "more protective self-presentation strategies"
- Català actual: «més estratègies **de autopresentació** protectora»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «més estratègies **d'autopresentació** protectora»
- Justificació: «de» davant de vocal s'apostrofa: «d'autopresentació». A més «autopresentació» va junt (prefix auto-), que aquí ja es respecta correctament; el problema és només l'apostrofació.

### 4.5 «el llindar» / tractament tu
- Ubicació: entrada («Entra en qualsevol reunió... trobaràs»), seccions intermèdies («vegeu»), i CTA final («Si el teu equip experimenta... les dades... són la ruta», «Es tarda deu minuts»).
- Anglès: "Walk into any team meeting and you will find..."
- Català actual: barreja: entrada i CTA en **tu** («Entra», «trobaràs», «el teu equip»); cos amb imperatius de **vós** («vegeu», «consulteu»... de fet usa «vegeu» repetidament).
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós: «Entreu en qualsevol reunió... trobareu», «el vostre equip».
- Justificació: el cos ja usa vós («vegeu») de manera predominant, però l'obertura i el CTA salten a tu («Entra», «trobaràs», «el teu equip»). Barreja interna real; cal triar vós (model de l'auditoria).

### 4.6 «pot semblar burocràtica i freda»
- Ubicació: secció «Conscientiousness (Disciplina)».
- Anglès: "may feel bureaucratic and cold"
- Català actual: «pot **semblar** burocràtica i freda a un col·lega...»
- Categoria: correcte · Gravetat —
- Proposta: cap. «semblar» per *to feel* (en el sentit «fer l'efecte») és correcte i idiomàtic. Es registra per descartar fals positiu (no cal «sentir-se», que aquí seria calc).
- Justificació: tria correcta; sense incidència.

### 4.7 «un dial únic entre "directe" i "educat"»
- Ubicació: secció «Què és realment l'estil de comunicació».
- Anglès: "is not a single dial between 'direct' and 'polite'"
- Català actual: «no és un **dial únic** entre "directe" i "educat"»
- Categoria: TERMINOLOGIA (calc / fals amic) · Gravetat MITJANA
- Proposta: «no és un **únic comandament/regulador** entre "directe" i "educat"» (o «una sola escala graduada»)
- Justificació: «dial» en català no té el sentit de *dial* anglès (=botó/comandament giratori, regulador). És un calc opac; el lector català no associa «dial» amb un control gradual. Millor «comandament / regulador / control / escala». (La versió DE usa «Regler», la DA «mærke» imperfecta; el referent català demana «regulador».)

### 4.8 «temps d'antena» (títol de secció Extraversion)
- Ubicació: títol «Extraversion (Presència): expressivitat, freqüència i temps d'antena», i taula.
- Anglès: "expressivity, frequency, and airtime"
- Català actual: «**temps d'antena**»
- Categoria: correcte · Gravetat —
- Proposta: cap. «temps d'antena» és la traducció lexicalitzada catalana d'*airtime*; transparent i adequada en sentit figurat (temps de paraula). Es registra per descartar fals positiu.
- Justificació: tria correcta; sense incidència.

### Resum quantitatiu — Article «personality-and-communication-style»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (Preface, subrepresentin, apostrofació) | 2 | 1 | – |
| TERMINOLOGIA (dial) | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **2** | **3** | **0** |

---

## "Personalitat i mida de l'equip: el que canvia quan els equips creixen" (`personality-and-team-size-what-changes-as-teams-grow`)

### 5.1 «a nivell d'equip» (recurrent)
- Ubicació: diagrama i diversos punts: «al nivell d'equip» / «a nivell de subgrups» (secció final), «opera a nivell de subgrups» (taula 16–30).
- Anglès: "team-level", "operates at the subgroup level"
- Català actual: «**al nivell d'equip**», «la personalitat opera **a nivell de subgrups**»
- Categoria: REGISTRE/CALC · Gravetat MITJANA
- Proposta: «a **escala** d'equip» / «en l'**àmbit** de l'equip»; «opera a **escala** de subgrups»
- Justificació: l'Optimot reserva «a nivell de» per a nivells/graus reals (nivell del mar, nivell de vida); per a sentits figurats recomana «en l'àmbit de / en el terreny de / a escala de». Recurrent al text. ([Optimot via La Fura](https://lafurapenedes.cat/abusar-del-nivell/))

### 5.2 «un equip de dotze en té seixanta-sis»
- Ubicació: secció «Per què la mida de l'equip canvia...», «Costos de coordinació».
- Anglès: "a team of twelve has sixty-six"
- Català actual: «un equip de tres té tres relacions diàdiques per gestionar; un equip de dotze en té **seixanta-sis**»
- Categoria: correcte · Gravetat —
- Proposta: cap (12·11/2 = 66; xifra correcta i ben escrita). Es registra com a fals positiu (la dada quadra amb la font).
- Justificació: sense incidència.

### 5.3 «El sobrecàrrega cognitiva»
- Ubicació: «Costos de coordinació».
- Anglès: "The cognitive and social overhead of coordination becomes..."
- Català actual: «**El sobrecàrrega** cognitiva i social de la coordinació es converteix progressivament en una restricció»
- Categoria: ERRADA (gènere) · Gravetat ALTA
- Proposta: «**La sobrecàrrega** cognitiva i social...»
- Justificació: «sobrecàrrega» és femení («la sobrecàrrega»). «El sobrecàrrega» és error de gènere objectiu.

### 5.4 «la divisió creatiu/executiu» (diagrama)
- Ubicació: caixa SVG «5–9 persones».
- Anglès (equivalent): "creative/executive split"
- Català actual: «la divisió **creatiu/executiu**»
- Categoria: ERRADA (concordança) · Gravetat MITJANA
- Proposta: «la divisió **creativa/executiva**» (concordança amb «divisió», femení) o «divisió entre el vessant creatiu i l'executiu»
- Justificació: els adjectius han de concordar amb «divisió» (femení singular): «divisió creativa/executiva». «creatiu/executiu» (masculí) no concorda.

### 5.5 «els rols d'equip que la personalitat conforma» / «conformar» (recurrent)
- Ubicació: tot l'article: «conforma cada interacció», «conforma el ritme», «conforma la fiabilitat», «que la personalitat conforma».
- Anglès: "shapes" / "shapes the rhythm"
- Català actual: «**conforma**» de manera sistemàtica per *shape*
- Categoria: TERMINOLOGIA/CALC · Gravetat BAIXA
- Proposta: alternar amb «**modela / configura / determina / dóna forma a**» segons context; «conformar» en català vol dir sobretot «donar conformitat / acontentar-se», i l'accepció «donar forma» és present però menys central. No és error, però l'ús massiu i monòton de «conformar» per *shape* fa pesat el text i frega el calc semàntic.
- Justificació: millora de naturalesa i precisió lèxica; «modelar / configurar» són més precisos per a *shape*.

### 5.6 «Entèn com la personalitat del teu equip canvia amb l'escala» (títol CTA) + tractament tu
- Ubicació: títol de la secció final i tot el CTA: «**Entèn**», «la personalitat **del teu equip**», «Cèrcol **et dona** el mapa», «**et permet** dissenyar», «Prova Cèrcol», «si vols entendre». També abans: «Aquí teniu el que diu l'evidència» (vós) conviu amb el tu del CTA.
- Anglès: "Understand how your team's personality shifts..."
- Català actual: imperatiu de **tu** «Entèn» + possessius/verbs de tu, però el cos usa vós («Aquí **teniu**», «vegeu»).
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat ALTA
- Proposta: unificar a vós: «**Enteneu** com la personalitat del **vostre** equip canvia amb l'escala», «Cèrcol **us dóna** el mapa», «**us permet** dissenyar», «**Proveu** Cèrcol», «si **voleu** entendre».
- Justificació: barreja interna real (cos en vós: «Aquí teniu»; CTA en tu: «Entèn», «el teu equip»). A més, «Entèn» com a imperatiu de tu hauria de ser «Entén» (accent obert, é→è no correspon: l'imperatiu és «entén» amb accent tancat? — de fet «entén» porta accent tancat: *entén*). La grafia «Entèn» és, a més, errada d'accent (vegeu 5.7).

### 5.7 «Entèn» (accent)
- Ubicació: títol CTA final.
- Anglès: "Understand..."
- Català actual: «**Entèn** com la personalitat...»
- Categoria: ERRADA (accent diacrític/obert-tancat) · Gravetat MITJANA
- Proposta: «**Entén**» (accent tancat sobre la e)
- Justificació: la 3a persona / imperatiu de «entendre» és «entén», amb **accent tancat** (é), no obert (è). «Entèn» és errada d'accentuació. (Independentment de la qüestió tu/vós de 5.6.)

### 5.8 «dóna» vs «dona»
- Ubicació: CTA final «Cèrcol et **dona** el mapa».
- Català actual: «**dona**» (sense accent)
- Categoria: correcte · Gravetat —
- Proposta: cap. Després de la reforma de l'IEC (2017), «dona» (verb) s'escriu sense accent diacrític. És correcte. Es registra per descartar fals positiu (no s'ha de "corregir" a «dóna»).
- Justificació: forma normativa vigent; sense incidència.

### Resum quantitatiu — Article «personality-and-team-size»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (gènere, concordança, accent) | 1 | 2 | – |
| REGISTRE/COHERÈNCIA (tractament) | 1 | – | – |
| TERMINOLOGIA/CALC («a nivell de», «conformar») | – | 1 | 1 |
| Total incidències | **2** | **3** | **1** |

---

## "Estils de comunicació en equips remots: com la personalitat modela les preferències asíncrones i síncrones" (`remote-team-communication-styles-big-five`)

### 6.1 «sistemes que casualmente s'adapten»
- Ubicació: paràgraf introductori.
- Anglès: "rather than defaulting to systems that happen to suit whoever set them up"
- Català actual: «en lloc de recórrer per defecte a sistemes que **casualmente** s'adapten a qui els va configurar»
- Categoria: ERRADA (castellanisme cru) · Gravetat ALTA
- Proposta: «sistemes que **casualment / per casualitat** s'adapten a qui els va configurar» (millor encara: «que **resulta que** s'adapten a qui els va configurar»)
- Justificació: «casualmente» és la forma castellana; en català és «casualment». Barbarisme directe. (Cf. *happen to suit*: «que resulta que / que per atzar s'adapten».)

### 6.2 «desenganyar-se» dels contextos / «desenganyament»
- Ubicació: NO en aquest article (aquest usa «desconnexió» correctament); el «desenganyar-se» apareix a `work-life-balance...`. Es retira aquí per evitar duplicar. — descartat.

### 6.3 «la persona que es preparava... ara escriu actualitzacions... que ningú no llegeix del tot»
- Ubicació: introducció.
- Anglès: "...detailed async updates that nobody fully reads."
- Català actual: «escriu actualitzacions asíncrones detallades que **ningú no llegeix del tot**»
- Categoria: correcte · Gravetat —
- Proposta: cap. La doble negació «ningú no llegeix» és normativa i preferida en registre culte. Es registra per descartar fals positiu.
- Justificació: ús correcte de la negació expletiva.

### 6.4 «Esgotador» (diagrama SVG, fila Introversió, columna síncron)
- Ubicació: tots dos SVG, fila «Alta Introversió» → columna «Prefereix síncron»: «✗ Esgotador».
- Anglès (equivalent): la columna marca que el síncron és esgotador per a l'introvertit.
- Català actual: «**Esgotador**»
- Categoria: correcte · Gravetat — (Nota: la versió DA diu «Udtømmende» = "exhaustiu", que és errada en danès; el català «Esgotador» SÍ és correcte i fidel.)
- Proposta: cap en català.
- Justificació: sense incidència en CA; es registra perquè és un encert (contrasta amb l'error de la versió danesa).

### 6.5 «un fracàs de professionalitat»
- Ubicació: introducció.
- Anglès: "None of these is a failure of professionalism."
- Català actual: «Cap d'aquests no és **un fracàs de professionalitat**.»
- Categoria: CALC · Gravetat BAIXA
- Proposta: «Cap d'aquests no és **una falta de professionalitat**» / «no és **un fracàs professional**»
- Justificació: «fracàs de professionalitat» calca *failure of professionalism*; en català «manca/falta de professionalitat» és la col·locació natural. «fracàs» encaixa amb un projecte, no amb una qualitat com la professionalitat.

### 6.6 «avantatge sistemàticament les persones»
- Ubicació: secció «Presència (Extraversió)», sobre la norma «vídeo sempre actiu».
- Anglès: "systematically advantages high-Presence people"
- Català actual: «**avantatge** sistemàticament les persones amb Presència alta»
- Categoria: ERRADA (verb inexistent / confusió nom-verb) · Gravetat ALTA
- Proposta: «**afavoreix** sistemàticament les persones amb Presència alta» / «**dóna avantatge** a les persones...»
- Justificació: «avantatge» és substantiu; no existeix el verb «avantatjar» en aquesta forma (la forma verbal seria «avantatjar», poc usual). El verb natural per *to advantage* és «afavorir» o la perífrasi «donar avantatge a». «avantatge sistemàticament» (substantiu fent de verb) és agramatical.

### 6.7 «el ventall de perfils» / «tot el ventall de personalitats»
- Ubicació: introducció i secció final de disseny.
- Anglès: "the full range of profiles" / "the full range of personalities"
- Català actual: «tot el **ventall** de perfils del seu equip», «per a tot el **ventall** de personalitats»
- Categoria: correcte · Gravetat —
- Proposta: cap. «ventall» per *range* és bon català idiomàtic. Fals positiu descartat.
- Justificació: tria encertada.

### 6.8 Tractament vós (coherència interna)
- Ubicació: tot l'article usa vós de manera força coherent: «no dissenyeu», «Protegiu», «Programeu», «Establiu», «Mapegeu els estils de comunicació del vostre equip remot», «Si el vostre equip... experimenta». CTA: «Gratuït per provar».
- Anglès: "you" neutre.
- Categoria: correcte · Gravetat — (amb matís)
- Proposta: cap canvi de model (ja és vós). Únic detall: a la taula «Aviseu amb antelació», «Animeu», «Canalitzeu» — coherents amb vós. Aquest article és el MILLOR del lot quant a coherència de tractament; es registra com a referència positiva.
- Justificació: model vós aplicat de manera consistent; sense incidència de tractament.

### Resum quantitatiu — Article «remote-team-communication-styles»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (casualmente, «avantatge» verb) | 2 | – | – |
| CALC («fracàs de professionalitat») | – | – | 1 |
| Total incidències | **2** | **0** | **1** |

---

## "Usar Cèrcol per al desenvolupament d'equips: una guia pràctica pas a pas" (`using-cercol-for-team-development-a-practical-guide`)

### 7.1 «des de l'autoconsciència individual» / «Autoconsciència individual»
- Ubicació: introducció i taula resum («Autoconsciència individual»).
- Anglès: "from individual self-awareness"
- Català actual: «des de l'**autoconsciència** individual»
- Categoria: TERMINOLOGIA (calc) · Gravetat MITJANA
- Proposta: «des de l'**autoconeixement** individual» / «la **consciència d'un mateix**»
- Justificació: «autoconsciència» és calc de *self-awareness*/*autoconciencia*; el terme català habitual i recomanat per a *self-awareness* en context de desenvolupament personal és «autoconeixement» (o «consciència d'un mateix»). Recurrent (intro + taula).

### 7.2 «però des de la perspectiva de l'observador»
- Ubicació: Pas 2 (Testimoni).
- Anglès: "...but from the observer's perspective" / Cèrcol terme: Witness/Testimoni
- Català actual: «puntuant la personalitat de la persona en les mateixes dimensions Big Five, però des de la perspectiva de **l'observador**»
- Categoria: TERMINOLOGIA (vocabulari de producte) · Gravetat ALTA
- Proposta: «des de la perspectiva del **Testimoni**» (o «des de la perspectiva externa / d'un tercer»)
- Justificació: regla de producte absoluta de CLAUDE.md i del brief: MAI «observador», sempre «Testimoni». L'article fins i tot defineix l'instrument Testimoni i després usa «observador» per al mateix concepte: incoherència + infracció de la norma de marca. (Cf. també «l'acord auto-observador» a 7.3.) Gravetat ALTA per ser terme de marca prohibit.

### 7.3 «l'acord auto-observador» / «acord auto-altre» / «Auto–Testimoni»
- Ubicació: Pas 2 («acord auto-observador en l'avaluació de la personalitat»), més avall «l'acord auto-altre per dimensió», «el buit Auto–Testimoni», «auto vs com els altres t'experimenten».
- Anglès: "self-observer agreement" / "self-other agreement"
- Català actual: barreja: «**auto-observador**», «**auto-altre**», «**Auto–Testimoni**», «**auto** vs com els altres»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat ALTA
- Proposta: unificar: (a) eliminar «observador» → «acord **auto–Testimoni**» o, en registre científic, «acord **auto-altre**» (self-other); (b) escriure el prefix sense guionet quan és aglutinable: «**autoavaluació**», «**autopuntuació**» (ja ho fa), però «auto-altre / auto–Testimoni» admeten guionet perquè uneixen dos pols contraposats. Triar una sola etiqueta a tot l'article.
- Justificació: el concepte *self-other agreement* apareix amb tres etiquetes diferents dins el mateix article («auto-observador», «auto-altre», «Auto–Testimoni»), una de les quals («observador») infringeix la norma de marca. Cal una sola forma coherent.

### 7.4 «patró d'auto > Testimoni en Presència» / «Autop > Testimoni»
- Ubicació: secció «Usar el buit Auto–Testimoni com a punt de partida del coaching», llista de patrons.
- Anglès: "Self > Witness on Presence", etc.
- Català actual: «**Autop > Testimoni** en Presència», «**Autop < Testimoni** en Bond»...
- Categoria: ERRADA (abreviació truncada) · Gravetat MITJANA
- Proposta: «**Auto > Testimoni** en Presència» / «**Autopuntuació > Testimoni**» de manera uniforme
- Justificació: «Autop» és una abreviació truncada i opaca (sembla una errata de «Autopuntuació» tallada). Cal escriure «Auto» o «Autopuntuació» sencer. Recurrent (quatre vinyetes).

### 7.5 «no és evidència d'autoengany o deshonestedat»
- Ubicació: secció de coaching.
- Anglès: "is not evidence of self-deception or dishonesty"
- Català actual: «no és evidència d'**autoengany** o **deshonestedat**»
- Categoria: ERRADA (lèxic) · Gravetat BAIXA
- Proposta: «no és evidència d'**autoengany** ni de **deshonestedat**» — «autoengany» és correcte; «deshonestedat» → «**deshonestedat**» no és normatiu: la forma catalana és «**deshonestedat**»? El DIEC recull «deshonestedat» i «deshonestat»; preferible «**deshonestedat**»→ usar «**falta d'honestedat**» o «**deshonestedat**». Reformular: «no és prova d'autoengany ni de falta d'honestedat».
- Justificació: «evidència de» en sentit de "prova de" és calc d'*evidence of* (l'«evidència» catalana és sobretot "qualitat d'evident"); millor «no és **prova/indici** d'autoengany ni de falta d'honestedat». Doble: calc «evidència» + lèxic «deshonestedat». Gravetat BAIXA perquè «evidència = prova» està molt estès.

### 7.6 «està basat directament en el mapa d'equip» — descartat
- «basat en» és correcte; sense incidència. Es registra per descartar fals positiu (no cal «fonamentat» obligatòriament).

### 7.7 Tractament tu (CTA i cos) vs vós
- Ubicació: cos amb imperatius de vós dispersos? — De fet l'article usa majoritàriament **tu**: «Aprèn-ne més», «Fes el perfil New Moon tu mateix», «convida col·legues», «el teu equip», «Comença amb el teu propi perfil», «i després porta el teu equip», «com els altres t'experimenten». Però el cos de la guia usa també imperatius que semblen vós/impersonals: «Reserva prou temps», «Reserva almenys trenta minuts» (tu), «Estableix» . Predomina el tu, coherent internament, amb alguna forma impersonal.
- Anglès: "you" neutre.
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: per al model de l'auditoria, migrar a vós: «Apreneu-ne més», «Feu el perfil New Moon vós mateix», «convideu col·legues», «el vostre equip», «Comenceu amb el vostre propi perfil». Internament l'article és força coherent en tu; la incidència és de model (cal vós) i de coherència amb articles del lot que ja usen vós.
- Justificació: el brief fixa vós; aquest article va de tu. Cal alinear.

### 7.8 «Aprèn-ne més a cercol.team»
- Ubicació: final de la introducció.
- Anglès: "Learn more at cercol.team."
- Català actual: «**Aprèn-ne més** a cercol.team»
- Categoria: REGISTRE (tractament) · Gravetat BAIXA (subsumit en 7.7)
- Proposta: «**Apreneu-ne més** a cercol.team»
- Justificació: cas concret del tractament tu→vós; es deixa com a sub-ítem de 7.7 i NO es recompta a part.

### Resum quantitatiu — Article «using-cercol-for-team-development»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| TERMINOLOGIA (observador→Testimoni, auto-* coherència, autoconsciència) | 2 | 1 | – |
| ERRADA (Autop, evidència/deshonestedat) | – | 1 | 1 |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **2** | **3** | **1** |

---

## "Equilibri entre la vida laboral i personal i personalitat: qui té més dificultats — i per què" (`work-life-balance-personality-who-struggles-most`)

### 8.1 «la Responsabilitat» (Conscientiousness) — coherència del nom Cèrcol
- Ubicació: tot l'article: «la Responsabilitat — la Disciplina», «d'alta Responsabilitat», títol de taula «Responsabilitat (Disciplina)».
- Anglès: "Conscientiousness — Discipline"
- Català actual: usa «**Responsabilitat**» com a traducció de *Conscientiousness*, amb «(Disciplina)» entre parèntesis.
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar amb la resta del lot, que tradueix *Conscientiousness* com a «**Conscienciositat**» (vegeu `do-generational...`, `personality-and-team-size`, `remote-team...`). Aquest article diu «Responsabilitat»; els altres «Conscienciositat». Cal una sola forma a la col·lecció (el nom de marca Cèrcol és «Disciplina»; el nom acadèmic, «Conscienciositat»).
- Justificació: incoherència inter-article del nom de la dimensió: «Responsabilitat» aquí vs «Conscienciositat» a la resta. Fins i tot la descripció (`description.ca`) diu «la Responsabilitat». Cal homogeneïtzar.

### 8.2 «Neuroticisme» vs «Neurotisicisme»
- Ubicació: aquest article (CA) usa «**Neuroticisme**» correctament. (La versió **danesa** escriu «Neurotisicisme», errada; el català és correcte.)
- Categoria: correcte · Gravetat —
- Proposta: cap en CA.
- Justificació: es registra per descartar fals positiu i deixar constància que l'error «Neurotisicisme» és només de la versió danesa.

### 8.3 «fent que l'aplicació de límits sigui consistently difícil»
- Ubicació: secció «La Responsabilitat i el risc de workaholisme», subpatró perfeccionista.
- Anglès: "...making boundary enforcement consistently difficult."
- Català actual: «fent que l'aplicació de límits sigui **consistently** difícil»
- Categoria: ERRADA (mot anglès sense traduir) · Gravetat ALTA
- Proposta: «fent que l'aplicació de límits sigui **constantment / sistemàticament** difícil»
- Justificació: «consistently» és l'adverbi anglès deixat en cru dins del text català. Error flagrant. Cal «constantment / de manera consistent / sistemàticament».

### 8.4 «workaholisme»
- Ubicació: títol de secció i cos: «risc de **workaholisme**», «patrons de **workaholisme**».
- Anglès: "workaholism"
- Català actual: «**workaholisme**»
- Categoria: TERMINOLOGIA (anglicisme) · Gravetat MITJANA
- Proposta: «**addicció a la feina**» (forma documentada i transparent en català) o «**treballaholisme**» (calc, menys recomanable). TERMCAT recull «addicció al treball / a la feina».
- Justificació: «workaholisme» és anglicisme cru; el català disposa de «addicció a la feina/al treball», que és transparent i normalitzada. Recurrent.

### 8.5 «desconnectar mentalment» / «desconnexió psicològica»
- Ubicació: títol secció Neuroticisme i cos: «la incapacitat per desconnectar mentalment», «La desconnexió psicològica».
- Anglès: "to mentally detach" / "psychological detachment"
- Català actual: «**desconnectar** mentalment», «**desconnexió** psicològica»
- Categoria: correcte · Gravetat —
- Proposta: cap. «desconnexió / desconnectar» per *detachment/detach* és bon català (i coherent amb `remote-team...`). Es registra per descartar fals positiu i com a contrast amb el dubtós «desenganyar-se» de 8.7.
- Justificació: tria correcta i coherent.

### 8.6 «desenganyar-se dels contextos socials» / «desenganyament del teixit social»
- Ubicació: secció «L'Extraversió i la recuperació d'energia social».
- Anglès: "disengage from work social contexts" / "disengagement from the social fabric of work"
- Català actual: «tenir dificultats per **desenganyar-se** dels contextos socials laborals», «fa que el **desenganyament** del teixit social de la feina sigui més difícil»
- Categoria: ERRADA/TERMINOLOGIA (calc del cast.) · Gravetat MITJANA
- Proposta: «**desvincular-se / desconnectar-se** dels contextos socials laborals»; «la **desvinculació / desconnexió** del teixit social de la feina»
- Justificació: «desenganyar-se» (cast. *desengancharse*) per *to disengage* és calc; «desenganyar» en català significa "treure d'un engany" (≈ *to disillusion*), cosa que crea ambigüitat de sentit. Cal «desvincular-se / desconnectar-se / desimplicar-se». A més, incoherent amb la mateixa peça, que en altres punts (Neuroticisme) sí usa «desconnexió».

### 8.7 «el complaure els altres» / «complaure els altres» / «people-pleasing»
- Ubicació: secció Amabilitat i secció final («el complaure els altres o l'absorció»).
- Anglès: "people-pleasing"
- Català actual: «les tendències de **complaure els altres**», «el **complaure els altres**»
- Categoria: correcte · Gravetat —
- Proposta: cap. «complaure els altres» és una bona traducció de *people-pleasing*; el gir «el complaure els altres» (infinitiu substantivat) és correcte. Es registra per descartar fals positiu. (La versió DA/DE manté «people-pleasing» en cru; el català fa bé de traduir-ho.)
- Justificació: tria correcta.

### 8.8 «consistently» a banda — «efecte de doble pressió» i «interferència casa-feina»
- Ubicació: secció Amabilitat, cita de Janssen et al.
- Anglès: "home-work interference" / "double pressure effect"
- Català actual: «la interferència **casa-feina**», «un efecte de **doble pressió**»
- Categoria: correcte · Gravetat —
- Proposta: cap. Calcs acceptables i transparents; coherents amb la terminologia del camp. Fals positiu descartat.
- Justificació: sense incidència.

### 8.9 Tractament tu (cos i CTA) vs vós
- Ubicació: «Entendre quina forma de conflicte és més rellevant per a la **teva** pròpia experiència», CTA: «Cèrcol mesura el **teu** perfil», «**Fes** l'instrument complet», «obtén un perfil... adaptat al **teu** perfil de trets». Coherent en tu.
- Anglès: "you" neutre.
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: migrar a vós (model de l'auditoria): «la **vostra** pròpia experiència», «Cèrcol mesura el **vostre** perfil», «**Feu** l'instrument complet», «obteniu un perfil... adaptat al **vostre** perfil».
- Justificació: l'article és coherent en tu internament, però el model de l'auditoria fixa vós i la resta del lot (p. ex. `remote-team...`) ja l'aplica. Cal alinear la col·lecció.

### Resum quantitatiu — Article «work-life-balance-personality»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (consistently, desenganyar-se) | 1 | 1 | – |
| TERMINOLOGIA (Responsabilitat/Conscienciositat, workaholisme) | – | 2 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **1** | **4** | **0** |


## "L'anonimat en l'avaluació de la personalitat: per què importa més del que creus" (`anonymity-in-personality-assessment-why-it-matters`)

### 1.1 «biaix de deseabilitat social» (descripció + cos + targetes, recurrent)
- Anglès: "social desirability bias" / "reduction in social desirability distortion"
- Català actual: «redueix el biaix de deseabilitat social» (descripció), «Biaix de Deseabilitat Social» (títol de secció), «la investigació sobre l'anonimat i el biaix de deseabilitat social», «escales de deseabilitat social», «El càlcul de deseabilitat social canvia», «reducció de la distorsió per deseabilitat social» (targeta).
- Categoria: TERMINOLOGIA/CALC · Gravetat ALTA
- Proposta: substituir totes les ocurrències per **desitjabilitat social**.
- Justificació: **deseabilitat** és un calc del cast. *deseabilidad*; no existeix en català. El terme normalitzat per TERMCAT és **desitjabilitat social** (fitxa de la Consulteca, [TERMCAT](https://www.termcat.cat/ca/diccionaris-en-linia/207/fitxa/MzcwODg0Mw==)). És el terme tècnic central de l'article i apareix fins i tot en titulars de secció i en la metadescripció SEO.

### 1.2 «subjaú» (secció "Condicions Anònimes vs. Identificades")
- Anglès: "This same logic underlies why..."
- Català actual: «Aquesta mateixa lògica subjaú per què...»
- Categoria: ERRADA (ortografia/accentuació) · Gravetat ALTA
- Proposta: «Aquesta mateixa lògica subjau a per què...» (o «és la raó per la qual»)
- Justificació: la forma de 3a persona del present de *subjaure* és **subjau**, sense accent (cf. *jau*, de *jaure*; DIEC2/DNV). «subjaú» no és una forma verbal catalana. A més, *subjaure* regeix la preposició «a» («subjau a alguna cosa»); l'absència de preposició calca l'ang. *underlies why*.

### 1.3 «autoenganye» (secció "Biaix de Deseabilitat Social", ×3)
- Anglès: "self-deception"
- Català actual: «l'autoenganye (la creença genuïna però inflada...)», «L'autoenganye és relativament estable», «l'autoenganye persisteix».
- Categoria: ERRADA (lèxic/ortografia) · Gravetat ALTA
- Proposta: **autoengany** (i «L'autoengany», «l'autoengany»).
- Justificació: el substantiu català és **engany** → **autoengany** (prefix *auto-* aglutinat). «autoenganye» sembla un creuament amb el cast. *autoengaño* més una *-e* paràsita; no és una paraula catalana. Recurrent.

### 1.4 «en promig» (secció "El Disseny de Cèrcol")
- Anglès: "on average" (implícit; cf. tot l'article)
- Català actual: no apareix «promig» en aquest article — **vegeu fals positiu 1.10**. (Es deixa nota per no confondre amb arts. 2 i 4.)
- Categoria: —

### 1.5 «developmental» sense traduir (taula "Condició d'Avaluació", files 2-3)
- Anglès: "Developmental (the individual sees the results only)" / "Employer-commissioned, developmental framing"
- Català actual: «Developmental (l'individu veu els resultats únicament)», «Encarregada per l'empresari, marc developmental».
- Categoria: FIDELITAT/ERRADA (manlleu no traduït) · Gravetat MITJANA
- Proposta: «De desenvolupament (l'individu només veu els resultats)», «Encarregada per l'empresari, amb marc de desenvolupament».
- Justificació: *developmental* es deixa en anglès dins d'un text català, tot i que la resta de l'article ja tradueix el concepte com «context de desenvolupament» / «condicions de desenvolupament». Incoherència interna i pèrdua de transparència. Igualment al cos: «un context developmental anònim» → «un context de desenvolupament anònim».

### 1.6 «si voleu saber com és realment algú, el context en el qual els avalueu» (secció "Condicions Anònimes vs. Identificades")
- Anglès: "the context in which you assess them matters as much as the instrument you use"
- Català actual: «el context en el qual els avalueu importa tant com l'instrument que useu»
- Categoria: ERRADA (concordança de nombre) · Gravetat MITJANA
- Proposta: «el context en el qual l'avalueu importa tant com l'instrument que useu» (referent singular «algú») o reformular en plural coherent.
- Justificació: l'antecedent és «algú» (singular); el pronom feble ha de ser «l'» (l'avalueu), no «els» (avalueu). Trencament de concordança pronom-antecedent.

### 1.7 Tractament de vós correcte i coherent (tot l'article)
- Català actual: «Quan completeu», «Sabeu», «no esteu operant», «si voleu saber», «teniu un fort motiu», «tret que decidiu compartir-los».
- Categoria: correcte · Gravetat —
- Justificació: l'article aplica de manera consistent el tractament de vós (2a persona del plural) recomanat pel model de llengua. Es registra com a fals positiu/bona pràctica perquè és el patró que els arts. de tu trenquen.

### 1.8 «destacats» / «la saliència de la recompensa» — coherència de *salient*
- Anglès: "making potential losses more salient" (a l'art. de decisions); ací "perceived as positive ... inflation" (sense *salient*).
- Català actual: sense incidència rellevant en aquest article.
- Categoria: —

### Resum quantitatiu Article anonymity
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| TERMINOLOGIA/CALC (deseabilitat) | 1 | – | – |
| ERRADA (subjaú, autoengany, concordança) | 2 | 1 | – |
| FIDELITAT (developmental no traduït) | – | 1 | – |
| Total incidències | **3** | **2** | **0** |

---

## "Els trets de personalitat canvien al llarg de la vida? El que mostra la recerca longitudinal" (`do-personality-traits-change-over-a-lifetime`)

### 2.1 Tractament de tu en lloc de vós (tot l'article, recurrent)
- Anglès: "Take it now to establish where you stand, and re-assess it as your role... evolve."
- Català actual: «ets qui ets», «si simplement et compromets», «Si puntues més alt... als 25 anys, ¿segueixes puntuant més alt als 45?», «els teus iguals», «Segueix com canvies», «no et recolzis», «et dóna una línia de base», «Fes-la ara», «revisa-la a mesura que el teu rol... evolucionin».
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós segons el model de llengua: «sou qui sou», «si us comprometeu», «si puntueu més alt... seguiu puntuant», «els vostres iguals», «Seguiu com canvieu», «no us recolzeu», «us dóna una línia de base», «Feu-la ara», «reviseu-la a mesura que el vostre rol... evolucioni».
- Justificació: el model fixa la 2a persona del plural (vós) per a les crides al lector. Tot l'article fa servir «tu», i les crides a l'acció finals («Fes-la ara», «Segueix com canvies») ho exhibeixen de manera molt visible. Cal unificar a vós a tota la col·lecció.

### 2.2 «els empleats grans sovint s'autogestions eficaçment» (taula, fila Conscienciositat)
- Anglès: "older employees often self-manage effectively"
- Català actual: «els empleats grans sovint s'autogestions eficaçment»
- Categoria: ERRADA (morfologia verbal) · Gravetat ALTA
- Proposta: «els empleats grans sovint s'autogestionen eficaçment».
- Justificació: la 3a persona del plural del present de *autogestionar-se* és **s'autogestionen**, no «s'autogestions» (forma inexistent; sembla una contaminació de la flexió de 2a persona del singular). Errada gramatical objectiva.

### 2.3 «abarca tres dècades» / «abarcarà un ampli rang» (secció "Implicacions pràctiques")
- Anglès: "A team that spans three decades of adult development will likely span a wide range..."
- Català actual: «Un equip que abarca tres dècades de desenvolupament adult probablement abarcarà un ampli rang de Conscienciositat...»
- Categoria: CALC/BARBARISME (castellanisme) · Gravetat ALTA
- Proposta: «Un equip que **abasta** tres dècades de desenvolupament adult probablement **abastarà** un ampli ventall de Conscienciositat...»
- Justificació: **abarcar** és un castellanisme (cast. *abarcar*); no és normatiu en català (no figura al DIEC2 ni al DNV). El verb català és **abastar** (o «comprendre», «cobrir»). Recurrent (×2).

### 2.4 «en promedi» (secció "Per què la Conscienciositat augmenta")
- Anglès: "younger employees are not, on average, less capable"
- Català actual: «els empleats joves no són, en promedi, menys capaços»
- Categoria: CALC/BARBARISME (castellanisme) · Gravetat ALTA
- Proposta: «els empleats joves no són, **de mitjana**, menys capaços» (o «en mitjana»).
- Justificació: **promedi** és un castellanisme cru (cast. *promedio*); la forma catalana és **mitjana**, i la locució és «de mitjana» / «com a mitjana». No existeix «promedi» en català.

### 2.5 «no et recolzis en una sola instantànea» (títol de secció final)
- Anglès: "don't rely on a single snapshot"
- Català actual: «no et recolzis en una sola instantànea»
- Categoria: ERRADA (ortografia, castellanisme) · Gravetat ALTA
- Proposta: «no us recolzeu en una sola **instantània**» (amb el tractament de vós de 2.1).
- Justificació: **instantànea** és la grafia castellana; en català és **instantània** (femení de *instantani*). Errada ortogràfica. El cos repeteix correctament la idea amb «instantànies»? — no: usa «instantànea» al títol; cal corregir-la.

### 2.6 «La reavaliació al llarg del temps» (secció "Implicacions pràctiques")
- Anglès: "Re-assessment over time captures genuine change"
- Català actual: «La reavaliació al llarg del temps captura el canvi genuí»
- Categoria: ERRADA (lèxic/ortografia) · Gravetat ALTA
- Proposta: «La **reavaluació** al llarg del temps capta el canvi genuí».
- Justificació: de *avaluar* → *avaluació* → **reavaluació**. «reavaliació» sembla un creuament amb el cast. *reevaluación*/*evaluación* amb pèrdua de la *-u-*; no és forma catalana. (Opcional: «capta» en lloc de «captura», que és més propi de captura física/informàtica.)

### 2.7 «agUna metaanàlisi... mostra» — concordança del subjecte (descripció)
- Anglès: "What 50 years of longitudinal research shows..."
- Català actual: «Cinquanta anys de recerca longitudinal **mostra** que la Conscienciositat puja...»
- Categoria: ERRADA (concordança) · Gravetat MITJANA
- Proposta: «Cinquanta anys de recerca longitudinal **mostren** que...»
- Justificació: el subjecte és «Cinquanta anys» (plural); el verb ha de concordar en plural: «mostren». (En anglès *shows* concorda amb el singular *research*, però en català el subjecte sintàctic és «anys».)

### 2.8 «tendències a nivell de població» / «tendències a nivell de població, no garanties» (cos, ×2)
- Anglès: "These are population-level trends, not individual guarantees."
- Català actual: «Aquestes són tendències a nivell de població, no garanties individuals.»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «Aquestes són tendències **d'àmbit poblacional**» o «tendències **a escala de població**».
- Justificació: «a nivell de» és desaconsellat per l'Optimot quan no expressa alçària o grau real; es recomana «en l'àmbit de» / «a escala de» ([Optimot, criteri sobre *a nivell de*](https://aplicacions.llengua.gencat.cat/llc/AppJava/index.html)). Recurrent.

### 2.9 «consulta [...]» dins del cos (enllaços interns)
- Anglès: "see [what is conscientiousness...]"
- Català actual: «consulta [què és la Conscienciositat...]», «consulta [coaching de personalitat...]».
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat BAIXA
- Proposta: amb vós: «consulteu [...]».
- Justificació: mateixa qüestió que 2.1; es comptabilitza a part perquè és el verb d'enllaç recurrent (imperatiu de tu «consulta»).

### Resum quantitatiu Article do-personality-traits
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (morfologia, ortografia, concordança) | 4 | 1 | – |
| CALC/BARBARISME (abarcar, promedi) | 2 | – | – |
| REGISTRE/COHERÈNCIA (tractament, "a nivell de") | – | 1 | 2 |
| Total incidències | **6** | **2** | **2** |

---

## "Com llegir un informe de personalitat Big Five: una guia pràctica" (`how-to-read-a-big-five-personality-report`)

### 3.1 «recuperació afterward» (Malentès 3)
- Anglès: "may need more recovery time afterwards"
- Català actual: «pot necessitar més temps de recuperació afterward»
- Categoria: ERRADA (manlleu no traduït) · Gravetat ALTA
- Proposta: «pot necessitar més temps de recuperació **després**» (o «a continuació», «posteriorment»).
- Justificació: la paraula anglesa *afterward* s'ha deixat sense traduir dins del text català. Error de traducció evident i visible.

### 3.2 «la base d'evidències és sobrietant» (secció "Desenvolupament vs avaluació", selecció)
- Anglès: "the evidence base is sobering"
- Català actual: «la base d'evidències és sobrietant»
- Categoria: ERRADA (lèxic inexistent) · Gravetat ALTA
- Proposta: «la base d'evidències és **descoratjadora**» (o «alliçonadora», «que convida a la prudència»).
- Justificació: **sobrietant** no és una paraula catalana; sembla una invenció a partir de «sobrietat». L'anglès *sobering* vol dir «que fa reflexionar / que rebaixa l'entusiasme»; l'equivalent és «descoratjador» o «que convida a la cautela». Canvi de sentit per terme inexistent.

### 3.3 «Tots els instruments psicromètrics» (Malentès 4)
- Anglès: "All psychometric instruments have measurement error."
- Català actual: «Tots els instruments psicromètrics tenen error de mesura.»
- Categoria: ERRADA (terme tècnic central) · Gravetat ALTA
- Proposta: «Tots els instruments **psicomètrics** tenen error de mesura.»
- Justificació: **psicromètric** (amb *r*) remet a la *psicrometria* (mesura de la humitat de l'aire), no a la *psicometria*. El terme correcte és **psicomètric**. Fals amic/errata en el terme tècnic central del domini.

### 3.4 «poden apuntar en direccions diferentes» (secció "Puntuacions de facetes")
- Anglès: "can point in different directions"
- Català actual: «Les facetes dins de la mateixa dimensió poden apuntar en direccions diferentes»
- Categoria: ERRADA (castellanisme ortogràfic) · Gravetat MITJANA
- Proposta: «...poden apuntar en direccions **diferents**».
- Justificació: **diferentes** és la forma castellana del plural; en català és **diferents** (invariable de gènere). Errata clara.

### 3.5 «informació... accionable» (encapçalament de secció + cos)
- Anglès: "Where Personality Gets Specific and Actionable" / "more actionable information"
- Català actual: «on la personalitat es fa específica i accionable», «contenen informació més específica i més accionable».
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «...específica i **aplicable** / **sobre la qual es pot actuar**», «informació més específica i més **aplicable**».
- Justificació: **accionable** en el sentit d'*actionable* és un calc; en català «accionable» significa «que es pot accionar (un mecanisme)». El sentit pretès és «aplicable» / «que permet actuar». Recurrent.

### 3.6 «No comenceu per la faceta que us ha sorprès més i construïu una història cap enrere» (secció "Què mostra un informe")
- Anglès: "Do not start with the facet that surprised you most and construct a story backwards from there."
- Català actual: «No comenceu per la faceta que us ha sorprès més i construïu una història cap enrere des d'allà.»
- Categoria: AMBIGÜITAT · Gravetat BAIXA
- Proposta: «No comenceu per la faceta que us ha sorprès més **per construir** una història cap enrere des d'allà.» (o «...ni construïu...»)
- Justificació: la negació «No comenceu... i construïu» és ambigua: la conjunció «i» amb imperatiu pot llegir-se com una segona ordre afirmativa («construïu») en lloc d'estendre la negació. Reformular amb subordinada final o repetir la negació elimina l'ambigüitat.

### 3.7 Barreja tu/vós (entrada vs cos)
- Anglès: "You receive a Big Five report and open it."
- Català actual: entrada en tu implícit/explícit «Reps un informe... i l'obres», «Veus cinc barres»; però el cos passa a vós: «consulteu», «Tracteu les puntuacions», «No construïu narratives», «Feu l'avaluació», «No comenceu».
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós també a l'entrada: «Rebeu un informe... i l'obriu», «Veieu cinc barres».
- Justificació: dins del mateix article conviuen «Reps/Veus» (tu) i «consulteu/Tracteu/Feu» (vós). El model fixa vós; cal regularitzar tot l'article (l'entradeta és l'única part en tu).

### 3.8 «narrativa aduladora o alarmant» (entrada) — fals positiu
- Anglès: "rather than a flattering or alarming narrative"
- Català actual: «en lloc d'una narrativa aduladora o alarmant»
- Categoria: correcte · Gravetat —
- Justificació: *flattering* es tradueix bé per «aduladora» (de *adular*), evitant el castellanisme *halago*; bon contrast amb l'art. de punts cecs de la tanda anterior (que usava «halago»). Es registra com a encert.

### Resum quantitatiu Article how-to-read
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (afterward, sobrietant, psicromètric, diferentes) | 3 | 1 | – |
| CALC (accionable) | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| AMBIGÜITAT | – | – | 1 |
| Total incidències | **3** | **3** | **1** |

---

## "Personalitat i presa de decisions: com els trets del Big Five configuren el judici" (`personality-and-decision-making-how-big-five-shapes-judgment`)

### 4.1 «reconsiderin els enmarcaments inicials» (secció "Openness")
- Anglès: "more likely to reconsider initial framings"
- Català actual: «és més probable que reconsiderin els enmarcaments inicials»
- Categoria: CALC/ERRADA (castellanisme) · Gravetat ALTA
- Proposta: «...que reconsiderin els **enquadraments** inicials» (o «els plantejaments / els marcs inicials»).
- Justificació: **enmarcament** és un castellanisme (cast. *enmarque/enmarcamiento*) amb grafia híbrida; la forma catalana derivada d'*emmarcar* seria *emmarcament*, però per a *framing* (cognitiu) l'opció natural i transparent és **enquadrament** o «plantejament». «enmarcaments» (amb *nm*) ni tan sols respecta l'ortografia catalana (*emm-*).

### 4.2 «toleren millor l'ambigüitat... a favor de la exploració» (secció "Openness")
- Anglès: "in favour of continued exploration"
- Català actual: «resisteixin el tancament prematur a favor de la exploració continuada»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «...a favor de **l'exploració** continuada».
- Justificació: davant de mot femení començat per vocal, l'article «la» s'apostrofa: **l'exploració**. «la exploració» és un error d'apostrofació.

### 4.3 «quan tots dos tienen resultats incerts» (secció "Neuroticism")
- Anglès: "when both have uncertain outcomes"
- Català actual: «la tendència a preferir la inacció sobre l'acció quan tots dos tienen resultats incerts»
- Categoria: ERRADA (castellanisme cru) · Gravetat ALTA
- Proposta: «...quan tots dos **tenen** resultats incerts».
- Justificació: **tienen** és directament la forma castellana de 3a persona del plural de *tener*; la catalana és **tenen** (de *tenir*). Errada flagrant. (Opcional: «preferir la inacció **a** l'acció», recció més genuïna que «sobre».)

### 4.4 «un estil de judici distinctiu» / «biaix... distinct» (descripció i "Punts clau")
- Anglès: "a distinct judgment style" / "contribute a distinct perceptual and motivational bias"
- Català actual: descripció «prediuen cadascun un estil de judici distintiu» (correcte); però al cos «un biaix perceptual i motivacional **distinct**» i «dos components **distincts**».
- Categoria: ERRADA (manlleu no traduït) · Gravetat ALTA
- Proposta: «un biaix perceptual i motivacional **diferenciat/distint**», «dos components **diferenciats/distints**».
- Justificació: *distinct*/*distincts* s'ha deixat en anglès dins del text català en alguns punts (mentre que a la descripció sí que es tradueix «distintiu»). La forma catalana és **distint** (o «diferenciat»); el plural **distints**. Incoherència interna + manlleu cru.

### 4.5 «no és sobre el determinisme — és sobre l'autoconsciència» (entrada)
- Anglès: "is not about determinism — it is about informed self-awareness"
- Català actual: «Comprendre aquestes prediccions no és sobre el determinisme — és sobre l'autoconsciència informada»
- Categoria: CALC (estructura) · Gravetat MITJANA
- Proposta: «Comprendre aquestes prediccions no té res a veure amb el determinisme: té a veure amb l'autoconeixement informat» (o «no és una qüestió de determinisme, sinó d'autoconeixement informat»).
- Justificació: «no és sobre X — és sobre Y» calca l'anglès *is not about X — it is about Y*. En català «ser sobre» no expressa aquest valor («tractar de / tenir a veure amb / ser una qüestió de»). A més, «autoconsciència» per *self-awareness* és acceptable, però «autoconeixement» és més habitual en aquest context divulgatiu.

### 4.6 «aversiu al risc» / «aversius al risc» (subtítols i taula, recurrent)
- Anglès: "risk-averse"
- Català actual: «patrons de decisió aversius al risc i d'evitació», «presa de decisions aversiva al risc».
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: acceptable; alternativament «que defuig el risc» / «poc inclinat al risc». «aversiu a» és transparent i s'entén; cap canvi imprescindible. Es registra per coherència.
- Justificació: «aversió al risc» és locució consolidada (economia/psicologia); l'adjectiu «aversiu al risc» és un derivat tolerable. Sense incidència forta.

### 4.7 «presentiments sobre solucions no òbvies» (secció "Openness") — fals positiu
- Anglès: "act on hunches about non-obvious solutions"
- Català actual: «la disposició a actuar sobre presentiments sobre solucions no òbvies»
- Categoria: correcte · Gravetat —
- Justificació: «presentiment» és bon equivalent de *hunch*. (Nota d'estil: la repetició «sobre... sobre» és lleument feixuga; es podria fer «actuar **segons** presentiments sobre solucions...», però no és error.)

### 4.8 Tractament de tu (secció final "Mapeig del perfil")
- Anglès: "Map Your Team's Decision-Making Profile" / "Start building your team's decision intelligence"
- Català actual: «Mapeig del perfil... del teu equip», «Comença a construir la intel·ligència de decisió del teu equip».
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat BAIXA
- Proposta: amb vós: «...del vostre equip», «Comenceu a construir la intel·ligència de decisió del vostre equip».
- Justificació: model de llengua (vós). Aquest article és majoritàriament impersonal/3a persona, però les crides finals salten a «tu» («Comença», «el teu equip»). Cal unificar.

### Resum quantitatiu Article decision-making
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (tienen, apostrofació, distinct) | 2 | 1 | – |
| CALC (enmarcaments, "no és sobre") | 1 | 1 | – |
| TERMINOLOGIA (aversiu al risc) | – | – | 1 |
| REGISTRE/COHERÈNCIA (tractament) | – | – | 1 |
| Total incidències | **3** | **2** | **2** |

---

## "El futur de l'avaluació de la personalitat: IA, parla i detecció passiva" (`personality-assessment-technology-future`)

### 5.1 «estan comenzant a posar-se al dia» (secció "El problema de la inferència invisible")
- Anglès: "Regulatory frameworks... are beginning to catch up with this reality."
- Català actual: «Els marcs reguladors... estan comenzant a posar-se al dia amb aquesta realitat.»
- Categoria: ERRADA (castellanisme cru) · Gravetat ALTA
- Proposta: «Els marcs reguladors... estan **començant** a posar-se al dia amb aquesta realitat.»
- Justificació: **comenzant** és el gerundi castellà (*comenzar*); el català és **començant** (de *començar*). Errada flagrant.

### 5.2 «haurien d'escrutar les afirmacions de precisió» (secció "Per què Cèrcol va triar el consentiment")
- Anglès: "should scrutinise individual-level accuracy claims"
- Català actual: «haurien d'escrutar les afirmacions de precisió a nivell individual»
- Categoria: correcte · Gravetat —
- Justificació: usa correctament **escrutar** (no el calc *escrutinar* del glossari). Es registra com a encert, en contrast amb la tanda anterior. (Vegeu 5.5 per a «a nivell individual».)

### 5.3 «Engagement a xarxes socials» (taula de modalitats, última fila)
- Anglès: "Social media engagement"
- Català actual: «Engagement a xarxes socials»
- Categoria: ERRADA/REGISTRE (manlleu no traduït) · Gravetat MITJANA
- Proposta: «**Interacció** a les xarxes socials» (o «activitat / implicació a les xarxes socials»).
- Justificació: *engagement* es deixa cru en anglès en una taula on la resta de modalitats sí estan traduïdes («Llenguatge / text», «Parla / acústica», «Dinàmica de teclejat», «Registres d'ús del telèfon intel·ligent»). Incoherència i manlleu evitable; «interacció» és transparent i habitual.

### 5.4 «El model és correcte, en promig» (secció "El que la detecció passiva pot i no pot predir")
- Anglès: "The model is right, on average, but wrong for many specific individuals."
- Català actual: «El model és correcte, en promig, però incorrecte per a molts individus específics.»
- Categoria: CALC/BARBARISME (castellanisme) · Gravetat ALTA
- Proposta: «El model és correcte, **de mitjana**, però incorrecte per a molts individus concrets.»
- Justificació: **promig** és castellanisme (cast. *promedio*); la forma catalana és **mitjana** amb la locució «de mitjana». (Opcional: «individus concrets» en lloc de «específics», menys calcat.)

### 5.5 «a nivell individual» / «a nivell de grup» (recurrent, secció "El que la detecció passiva pot i no pot predir" i taula)
- Anglès: "at the individual level" / "group-level predictions" / "individual-level accuracy claims"
- Català actual: «a nivell individual», «prediccions útils a nivell de grup», «afirmacions de precisió a nivell individual».
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «a escala individual», «prediccions útils a escala de grup», «afirmacions de precisió a escala individual».
- Justificació: «a nivell de» desaconsellat per l'Optimot fora del sentit d'alçària/grau; preferir «a escala de» / «en l'àmbit de» ([Optimot](https://aplicacions.llengua.gencat.cat/llc/AppJava/index.html)). Recurrent en tot l'article.

### 5.6 «la teva participació activa» / «el teu equip» (entrada i tancament) — tractament
- Anglès: "when the assessment required your active participation" / "evaluating... tools for your team"
- Català actual: «quan l'avaluació requeria la teva participació activa», «depèn completament del que tries dir sobre tu mateix», «Si estàs avaluant eines... per al teu equip».
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: vós: «requeria la vostra participació activa», «del que trieu dir sobre vós mateix», «Si esteu avaluant eines... per al vostre equip».
- Justificació: model de llengua (vós). L'article alterna impersonal i «tu»; cal unificar les crides al lector a vós.

### Resum quantitatiu Article technology-future
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA/CALC (comenzant, promig) | 2 | – | – |
| ERRADA/REGISTRE (engagement no traduït) | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| REGISTRE/CALC ("a nivell de") | – | – | 1 |
| Total incidències | **2** | **2** | **1** |

---

## "Fer funcionar les retrospectives: la ciència de la personalitat darrere d'una millor reflexió d'equip" (`retrospectives-personality-making-them-work`)

### 6.1 «vigilància heightened» (secció "Com l'alt Neuroticisme... desencadena l'autoprotecció")
- Anglès: "heightened vigilance, negative affect, and a motivation to..."
- Català actual: «està ben documentada: vigilància heightened, afecte negatiu i una motivació per controlar...»
- Categoria: ERRADA (manlleu no traduït) · Gravetat ALTA
- Proposta: «**vigilància accentuada**» (o «vigilància augmentada / heightened → més alta»).
- Justificació: l'adjectiu anglès *heightened* s'ha deixat sense traduir dins del text català. Error de traducció evident i molt visible.

### 6.2 «la participació en retrospectives autoprotectora» / «la resposta a l'amenaça... de autoprotecció» (mateixa secció)
- Anglès: "self-protective retrospective participation" / "self-protection"
- Català actual: «la participació en retrospectives autoprotectora»; i més amunt «un mecanisme de autoprotecció» (a l'art. de desitjabilitat) — ací «autoprotecció».
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: revisar les ocurrències de «de autoprotecció» → «**d'autoprotecció**» (apòstrof davant de vocal). En aquest article: «un mecanisme **d'autoprotecció**».
- Justificació: la preposició «de» s'apostrofa davant de mot començat per vocal: **d'autoprotecció**. (La forma «autoprotectora» com a adjectiu és correcta.)

### 6.3 «revisió al inici de la propera retro» (taula final, fila punts d'acció)
- Anglès: "review at start of next retro"
- Català actual: «Propietaris amb nom, criteris específics de finalització, revisió al inici de la propera retro»
- Categoria: ERRADA (contracció/apostrofació) · Gravetat MITJANA
- Proposta: «...revisió **a l'inici** de la propera retro».
- Justificació: «a + el» no es contrau en «al» davant de mot començat per vocal amb article apostrofat: «a l'inici», no «al inici». (La contracció «al» només val davant de consonant: «al començament».)

### 6.4 «compromisos específics i accionables» (secció "Com la baixa Conscienciositat...")
- Anglès: "specific, actionable commitments"
- Català actual: «una excel·lent discussió honesta i compromisos específics i accionables»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «compromisos específics i **aplicables** / **sobre els quals es pot actuar**».
- Justificació: **accionable** com a calc d'*actionable* (vegeu glossari i incidència 3.5); en català «aplicable» o «que permet actuar». Coherència amb la resta de la col·lecció.

### 6.5 «por de plantejar blocadors» / «por a plantejar blocadors» (secció "Biaix de desitjabilitat social")
- Anglès: "makes engineers afraid to surface blockers"
- Català actual: «fa que els enginyers tinguin por de plantejar blocadors»
- Categoria: TERMINOLOGIA (anglicisme) · Gravetat BAIXA
- Proposta: «...tinguin por de **fer aflorar els impediments / els bloquejadors**» (TERMCAT recull *bloquejador* en àmbit àgil; «impediment» és l'opció més transparent).
- Justificació: *blocador* no és forma catalana estàndard (manca la *qu*); si es vol mantenir el terme àgil, la grafia és **bloquejador**, o millor el genèric «impediment / obstacle». A més, «plantejar blocadors» és fluix: *surface* aquí és «fer aflorar / treure a la llum».

### 6.6 «desitjabilitat social» (títol i cos) — fals positiu / encert
- Anglès: "Social Desirability Bias"
- Català actual: «Biaix de desitjabilitat social», «La desitjabilitat social...».
- Categoria: correcte · Gravetat —
- Justificació: aquest article SÍ usa la forma normalitzada TERMCAT **desitjabilitat social**, a diferència de l'art. `anonymity` (que usa el calc «deseabilitat», incidència 1.1). Es registra per ressaltar la incoherència inter-article: cal unificar tota la col·lecció a «desitjabilitat».

### 6.7 Tractament de tu (seccions de crida i taula final)
- Anglès: "Design Your Next Retrospective Around Your Team's Personality" / "Try Cèrcol free"
- Català actual: «Dissenya la teva propera retrospectiva al voltant de la personalitat del teu equip», «Cèrcol et mostra exactament quins modes de fallada el teu equip té més exposats», «Prova Cèrcol gratuïtament», «Després explora [els 12 rols]», «La retrospectiva que realment necessites» (cita).
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: vós: «Dissenyeu la vostra propera retrospectiva...», «Cèrcol us mostra...», «Proveu Cèrcol gratuïtament», «Després exploreu...», «La retrospectiva que realment necessiteu».
- Justificació: model de llengua (vós). L'article és majoritàriament expositiu en 3a persona, però les crides al lector i la cita destacada usen «tu»; cal unificar.

### Resum quantitatiu Article retrospectives
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (heightened, apostrofació ×2) | 1 | 2 | – |
| CALC (accionables) | – | 1 | – |
| TERMINOLOGIA (blocadors) | – | – | 1 |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **1** | **4** | **1** |

---

## "Què és una faceta en psicologia de la personalitat — i per què és important?" (`what-is-a-facet-in-personality-psychology`)

### 7.1 «les facetes altes i baixes s'esmolaen» (secció "Les sis facetes de Conscientiousness")
- Anglès: "the high facets and low facets averaging out"
- Català actual: «La seva puntuació global de Conscientiousness podria ser intermèdia — les facetes altes i baixes s'esmolaen —»
- Categoria: ERRADA (lèxic + ortografia, canvi de sentit) · Gravetat ALTA
- Proposta: «...les facetes altes i baixes **es compensen / es neutralitzen** (fan mitjana)».
- Justificació: doble problema. (a) **s'esmolaen** no és cap forma verbal catalana (de *esmolar* seria «s'esmolen», però *esmolar* = afilar, que no té sentit ací). (b) El sentit de l'anglès *averaging out* és «compensar-se / fer mitjana», no «esmolar-se». Cal «es compensen» o «es neutralitzen». Error lèxic amb canvi de sentit.

### 7.2 «algú el qual l'alt Openness és impulsat principalment per Aesthetics» (secció "Per què puntuacions idèntiques...")
- Anglès: "someone whose high Openness is driven primarily by Aesthetics and Feelings"
- Català actual: «un perfil molt diferent d'algú el qual l'alt Openness és impulsat principalment per Aesthetics i Feelings»
- Categoria: ERRADA (relatiu possessiu) · Gravetat ALTA
- Proposta: «...d'algú **l'alt Openness del qual** és impulsat principalment per Aesthetics i Feelings» (o «d'algú en qui l'alt Openness està impulsat principalment per...»).
- Justificació: el relatiu possessiu anglès *whose* es tradueix per «el/la... del qual», amb el nom posseït dins del sintagma: «algú l'alt Openness **del qual**...». «algú el qual l'alt Openness» és agramatical (calca *someone which*). A més, *driven* → «impulsat» és correcte, però amb «està impulsat» (estat) sona millor que «és impulsat».

### 7.3 «10× més predictiu que les dimensions soles» (targeta d'estadístiques) — fidelitat/cautela
- Anglès: "10× more predictive than dimensions alone for specific outcomes"
- Català actual: «10× / més predictiu que les dimensions soles per a resultats específics»
- Categoria: correcte · Gravetat —
- Justificació: traducció fidel. (Observació no filològica: l'afirmació «10×» és forta i no surt al cos argumental; però la fidelitat a la font anglesa és correcta, que és el que s'audita.)

### 7.4 Mots de la targeta i subtrets en anglès sense traduir (targetes superiors)
- Anglès: "IPIP facets across 6 dimensions (AB5C)" / "more predictive than dimensions alone for specific outcomes"
- Català actual: «IPIP facets across 6 dimensions (AB5C)» i «more predictive than dimensions alone for specific outcomes» han quedat **en anglès** dins de la targeta, mentre que la targeta del mig sí està traduïda («correlació mitjana faceta-dimensió»).
- Categoria: FIDELITAT/ERRADA (segments no traduïts) · Gravetat MITJANA
- Proposta: «30 facetes IPIP en 6 dimensions (AB5C)» i «més predictiu que les dimensions soles per a resultats específics».
- Justificació: dos dels tres rètols de la graella d'estadístiques s'han deixat en anglès; només el central es va traduir. Pèrdua de contingut per al lector català i incoherència interna evident.

### 7.5 Noms de facetes en anglès (Competence, Order, Dutifulness...) — coherència
- Anglès: "Competence, Order, Dutifulness, Achievement Striving, Self-Discipline, Deliberation"
- Català actual: es mantenen en anglès a tot l'article (llista i taula): «Competence», «Order», «Achievement Striving», «Fantasy», «Aesthetics», «Angry Hostility», etc.
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: decisió editorial de col·lecció. En blog/ciència es permeten els noms acadèmics, i mantenir les facetes NEO/IPIP en anglès és defensable (terminologia tècnica), però convindria almenys glossar-les en català la primera vegada: «Competence (competència)», «Order (ordre)», etc., com fa parcialment amb les descripcions. Cap canvi obligatori; coherència recomanada.
- Justificació: el brief permet noms acadèmics en blog; no és incidència forta. Es registra per a decisió de col·lecció.

### 7.6 Tractament de tu (entrada i crides finals)
- Anglès: "If you take a Big Five personality assessment and receive a score..." / "Get your full facet-level profile"
- Català actual: «Si fas una avaluació... i reps una puntuació, saps aproximadament on et trobes», «Obtén el teu perfil complet», «et diu la direcció», «si estàs seriós sobre entendre la teva personalitat».
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: vós: «Si feu una avaluació... i rebeu una puntuació, sabeu aproximadament on us trobeu», «Obteniu el vostre perfil complet», «us diu la direcció», «si aneu de debò a entendre la vostra personalitat».
- Justificació: model de llengua (vós). Tot l'article tracta de «tu»; cal unificar. (A més, «si estàs seriós sobre entendre» calca l'ang. *if you are serious about understanding* → millor «si voleu entendre de debò» / «si us preneu seriosament entendre».)

### 7.7 «si estàs seriós sobre entendre la teva personalitat» (crida final)
- Anglès: "If you are serious about understanding your personality..."
- Català actual: «Si estàs seriós sobre entendre la teva personalitat al nivell de precisió que és realment predictiu...»
- Categoria: CALC (estructura) · Gravetat MITJANA
- Proposta: «Si us voleu prendre seriosament la comprensió de la vostra personalitat **al grau** de precisió que és realment predictiu...»
- Justificació: «estar seriós sobre + infinitiu» calca *to be serious about*; en català «prendre's seriosament una cosa» / «voler de debò». A més «al nivell de precisió» pot anar a «al grau de precisió» (evita «a nivell de»).

### Resum quantitatiu Article facet
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (esmolaen, relatiu possessiu) | 2 | – | – |
| FIDELITAT (segments no traduïts) | – | 1 | – |
| CALC ("estar seriós sobre") | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| TERMINOLOGIA (noms de facetes) | – | – | 1 |
| Total incidències | **2** | **3** | **1** |


## "Les millors proves de personalitat gratuïtes per a equips el 2026 — classificades per validesa científica" (`best-free-personality-tests-for-teams-2026`)

### 1.1 Manca d'elisió «de iguals» (recurrent: subtítol secció 2, base científica, taula, conclusió)
- Anglès: "Witness peer assessment" / "perspective of peers" / "peer data"
- Català actual: «avaluació de iguals Testimoni», «la capa d'avaluació de iguals», «perspectiva de iguals», «avaluacions de iguals Testimoni», «dades de iguals», «Afegiu l'avaluació de iguals (Testimonis)».
- Categoria: ERRADA (ortografia, elisió) · Gravetat ALTA
- Proposta: «avaluació d'iguals», «perspectiva d'iguals», «dades d'iguals», etc. (apostrofació obligatòria davant de vocal).
- Justificació: la preposició «de» s'apostrofa sempre davant de paraula començada per vocal o h muda (DIEC2/GIEC; norma d'apostrofació). «de iguals» és incorrecte de manera sistemàtica a tot l'article (≥6 ocurrències). És l'error més freqüent del text.

### 1.2 «resultats que importan» (criteris de validesa, punt 4)
- Anglès: "Do scores predict outcomes that matter"
- Català actual: «Les puntuacions prediuen resultats que importan»
- Categoria: ERRADA (morfologia verbal, castellanisme) · Gravetat ALTA
- Proposta: «resultats que importen»
- Justificació: «importan» és la forma castellana; la 3a persona del plural del present d'indicatiu de «importar» en català és «importen». Error ortogràfic/morfològic cru.

### 1.3 «inflació de deseabilitat social» (secció final «Proveu...»)
- Anglès: "social desirability inflation"
- Català actual: «la inflació de deseabilitat social que afecta cada eina d'escala Likert»
- Categoria: TERMINOLOGIA/CALC · Gravetat ALTA
- Proposta: «la inflació de desitjabilitat social»
- Justificació: glossari R4 de l'auditoria. «deseabilitat» és calc del castellà *deseabilidad*; el terme normalitzat per TERMCAT és «desitjabilitat social». L'enllaç de la mateixa frase remet a un article que el tradueix correctament: cal coherència.

### 1.4 «mapejades del MBTI» / «mapeig cap a» (secció 16Personalities)
- Anglès: "loosely mapped from MBTI", "maps onto Emotional Stability", "map loosely onto the other four Big Five factors"
- Català actual: «Cinc dimensions vagament mapejades del MBTI», «l'eix Assertiu/Turbulent mapeig cap a Estabilitat Emocional; els quatre eixos MBTI mapeig vagament cap als altres quatre factors»
- Categoria: CALC + ERRADA (sintaxi) · Gravetat ALTA
- Proposta: «Cinc dimensions que es corresponen vagament amb el MBTI», «l'eix Assertiu/Turbulent es correspon amb l'Estabilitat Emocional; els quatre eixos del MBTI es corresponen vagament amb els altres quatre factors».
- Justificació: doble problema. (a) «mapejar» és un calc de l'anglès *to map (onto)*; en català la idea de correspondència entre dimensions es diu «correspondre's amb», «projectar-se sobre» o «encaixar amb». (b) «l'eix ... mapeig cap a» és directament agramatical: «mapeig» és substantiu, no forma verbal; la frase queda sense verb. Error de sentit i de gramàtica.

### 1.5 «16 tipus nomenats» (secció 16Personalities, «Què mesura»)
- Anglès: "generating 16 named types"
- Català actual: «generant 16 tipus nomenats»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat MITJANA
- Proposta: «que generen 16 tipus amb nom» / «16 tipus designats»
- Justificació: «nomenar» en català vol dir designar algú per a un càrrec, no «donar nom a». El sentit anglès *named* (que tenen un nom) demana «amb nom», «designats» o «anomenats». A més, el gerundi anglosaxó de resultat «generant» es resol millor amb una relativa («que generen»).

### 1.6 «transparència a nivell d'ítem» / «vista a nivell d'equip» (seccions 1 i 2)
- Anglès: "item-level transparency", "a team-level view", "team-level aggregates"
- Català actual: «transparència a nivell d'ítem», «una vista a nivell d'equip»
- Categoria: REGISTRE · Gravetat BAIXA
- Proposta: «transparència a escala d'ítem» / «transparència ítem per ítem»; «una vista a escala d'equip» / «una vista de conjunt de l'equip».
- Justificació: glossari de l'auditoria («a nivell de» → «a escala de» / «en l'àmbit de» quan no és alçària física). Recurrent.

### 1.7 «la prova bàsica és gratuïta» — manté l'anglès «mapejat»/calcs però vegeu també «Dominació» (secció DISC, «Què mesura»)
- Anglès: "Four behavioural styles (Dominance, Influence, Steadiness, Conscientiousness)"
- Català actual: «Quatre estils de comportament (Dominació, Influència, Estabilitat, Conscienciositat)»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: «Domini» (o mantenir «Dominança», forma habitual en psicologia) en lloc de «Dominació».
- Justificació: «Dominació» en català té connotació d'acció de sotmetre (domination). El tret DISC *Dominance* es ret habitualment com a «Dominança» o «Domini». Matís terminològic.

### 1.8 Capitalització de titulars a l'estil anglès (títols de secció de tot l'article)
- Anglès: "How We Evaluated Free Personality Tests: The Validity Criteria", "The Best Free Personality Tests for Teams in 2026, Ranked by Science", etc.
- Català actual: «Com Hem Avaluat les Proves de Personalitat Gratuïtes: Els Criteris de Validesa», «Les Millors Proves de Personalitat Gratuïtes per a Equips el 2026, Classificades per Ciència», «Proves de Personalitat Gratuïtes Comparades», «Com Triar la Prova...», «Lectures Addicionals».
- Categoria: ERRADA (convenció tipogràfica) · Gravetat MITJANA
- Proposta: capitalitzar només la primera paraula i els noms propis: «Com hem avaluat les proves de personalitat gratuïtes: els criteris de validesa», etc.
- Justificació: el *title case* (majúscula a cada paraula lèxica) és convenció anglesa; en català els títols porten majúscula només inicial i en noms propis (esADIR, guies d'estil). Calc tipogràfic sistemàtic en aquest article (els altres sis articles del lot no el cometen).

### 1.9 «metaanalítica» com a adjectiu de «r» (targeta d'estadística)
- Anglès: "Big Five → job performance (meta-analytic)"
- Català actual: «Big Five → rendiment laboral (metaanalítica)»
- Categoria: correcte · Gravetat — (sense incidència; «metaanalític -a» és forma vàlida i el femení concorda amb «correlació» implícita. Es registra per descartar fals positiu, atès que «metaanalític» s'escriu correctament aglutinat, sense guionet.)

### Resum quantitatiu — best-free-personality-tests-for-teams-2026
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (elisió, morfologia, tipografia) | 2 | 1 | – |
| TERMINOLOGIA/CALC | 2 | 1 | 1 |
| REGISTRE («a nivell de») | – | – | 1 |
| Total incidències | **4** | **2** | **2** |

---

## "La composició de personalitat prediu el rendiment dels equips? El que diuen 60 estudis" (`does-personality-composition-predict-team-performance`)

### 2.1 «en lloc de l'inrevés» (Limitacions metodològiques)
- Anglès: "high-performing teams may attract high-Conscientiousness members rather than the reverse"
- Català actual: «els equips d'alt rendiment poden atreure membres amb alta Responsabilitat en lloc de l'inrevés»
- Categoria: ERRADA (locució) · Gravetat MITJANA
- Proposta: «en lloc de a l'inrevés» → millor «i no a l'inrevés» / «i no al contrari»
- Justificació: la locució fixada és «a l'inrevés» (amb «a», no «de»). «en lloc de l'inrevés» travа malament la preposició; la solució natural és «i no a l'inrevés» o «i no al revés».

### 2.2 «a nivell d'equip» (intro i secció final)
- Anglès: "Personality research at the team level", "team-level composition reports"
- Català actual: «La investigació sobre personalitat a nivell d'equip...», «informes de composició a nivell d'equip»
- Categoria: REGISTRE · Gravetat BAIXA
- Proposta: «a escala d'equip» / «en l'àmbit de l'equip».
- Justificació: glossari de l'auditoria. «a nivell de» desaconsellat quan no és alçària física (Softcatalà, IEC). Recurrent dins l'article i transversal al lot.

### 2.3 «el 4% de la variància» / «el 96% de la variància»
- Anglès: "explains roughly 4% of the variance", "leaves 96% of the variance unexplained"
- Català actual: «explica aproximadament el 4% de la variància», «deixa el 96% de la variància sense explicar»
- Categoria: correcte · Gravetat — (sense incidència; «variància» és el terme estadístic català correcte —no «varianza»—, ben emprat de manera coherent a tot l'article. Fals positiu desestimat.)

### 2.4 Coherència del nom de dimensió: «Responsabilitat» (Conscientiousness) vs «Disciplina» (Cèrcol)
- Anglès: "Discipline (Conscientiousness)" — l'EN usa el nom Cèrcol «Discipline» com a principal i el nom acadèmic entre parèntesis
- Català actual: el cos usa «Disciplina (Responsabilitat)» a §«Quins trets...», però les targetes i la prosa anterior diuen només «Responsabilitat»; mai no es fixa que la dimensió Cèrcol és «Disciplina».
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: seguir l'estructura de l'anglès: «Disciplina (Responsabilitat)» en la primera aparició i «Disciplina» com a nom de referència després; o, com a mínim, fixar que «Conscientiousness» = «Responsabilitat» de manera explícita una vegada. Cal coherència amb la resta del lot, on Conscientiousness es ret indistintament «Responsabilitat» o «Conscienciositat» (vegeu sales-personality, que usa «Conscienciositat»).
- Justificació: l'anglès dona prioritat al nom Cèrcol; la traducció l'inverteix o l'omet, debilitant la marca de dimensió. A més, «Responsabilitat» (does-…) i «Conscienciositat» (sales-…, feedback-…, coaching-…) per al mateix tret acadèmic és incoherència inter-article.

### Resum quantitatiu — does-personality-composition-predict-team-performance
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (locució) | – | 1 | – |
| TERMINOLOGIA/COHERÈNCIA | – | 1 | – |
| REGISTRE («a nivell de») | – | – | 1 |
| Total incidències | **0** | **2** | **1** |

---

## "Com dirigir un taller de personalitat d'equip: una guia pas a pas" (`how-to-run-a-team-personality-workshop`)

### 3.1 «Que» sense accent en interrogatives/relatives (taula de passos, encapçalaments, cos — recurrent)
- Anglès: "What happens", "what is absent", "What does this mean for how we work together?", "what each position in the map represents"
- Català actual: capçalera de taula «Que passa»; pas 6 «que falta»; pas 7 «"Que significa això per com treballem junts?"»; «per entendre que representa cada posició»; «Que falta genuïnament en l'equip?»; «per que el disseny de reunions importa»; «explica per que sempre fas X».
- Categoria: ERRADA (accentuació diacrítica) · Gravetat ALTA
- Proposta: «Què passa», «què falta», «"Què significa això per a com treballem junts?"», «què representa», «Què falta genuïnament...», «per què el disseny de reunions importa», «per què sempre fas X».
- Justificació: l'interrogatiu/exclamatiu i el relatiu tònic «què» porten accent diacrític (DIEC2/GIEC); «per què» causal/interrogatiu s'escriu separat i amb accent. L'article confon sistemàticament «que» àton amb «què» tònic (≥6 ocurrències). És l'error dominant del text.

### 3.2 «decidir que compartir» (secció Treball previ, «Els resultats es comparteixen voluntàriament»)
- Anglès: "receive their own results before the session and choose what to share"
- Català actual: «rebre els seus propis resultats abans de la sessió i decidir que compartir»
- Categoria: ERRADA (accentuació + recció) · Gravetat ALTA
- Proposta: «decidir què compartir» (o «decidir què en volen compartir»)
- Justificació: «què compartir» és interrogatiu indirecte amb «què» tònic, obligatòriament accentuat. Sense accent canvia la lectura (conjunció completiva). Error de sentit.

### 3.3 «el facilitador nombra el que s'ha compartit» (taula, pas 9)
- Anglès: "Facilitator names what was shared and thanks the group"
- Català actual: «El facilitador nombra el que s'ha compartit i agraeix al grup»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat ALTA
- Proposta: «El facilitador anomena el que s'ha compartit» / «esmenta el que s'ha compartit»
- Justificació: «nombrar» en català significa «afegir fils a un teixit» (DIEC2); és fals amic del cast. *nombrar*. Per a *to name/mention* cal «anomenar» o «esmentar». Verificat a DIEC2 i esADIR. Mateix error a 3.x (vegeu «No diagnostiqueu»).

### 3.4 «No diagnostiqueu als altres» / «explicar els perfils ... d'altri a ells mateixos» (Normes de discussió)
- Anglès: "No diagnosing others", "narrate others' profiles back to them"
- Català actual: «No diagnostiqueu als altres», «No narren els perfils d'altri a ells mateixos»
- Categoria: ERRADA (recció, complement directe amb «a») · Gravetat MITJANA
- Proposta: «No diagnostiqueu els altres»; «No expliquen els perfils d'altri als interessats» / «...no els reciten als altres el seu propi perfil».
- Justificació: «diagnosticar algú» porta complement directe sense preposició; «diagnosticar als altres» és el calc castellà de la *a* personal. A més «els perfils d'altri a ells mateixos» és confús (a qui?); convé reformular.

### 3.5 «la defensivitat» (Treball previ, «Establiu el marc prèviament»)
- Anglès: "Surprises in the room increase defensiveness."
- Català actual: «Les sorpreses a la sala augmenten la defensivitat.»
- Categoria: CALC (lèxic) · Gravetat MITJANA
- Proposta: «augmenten les actituds defensives» / «posen la gent a la defensiva».
- Justificació: «defensivitat» no és forma recollida pels diccionaris normatius (DIEC2/DNV); és calc de l'anglès *defensiveness* (cf. també el cast. *defensividad*, igualment dubtós). Es resol amb «actitud defensiva» o «posar(-se) a la defensiva».

### 3.6 «No comprimiu això per sota dels 90 minuts» / «Moure's massa ràpid» (taula totals; secció Errors)
- Anglès: "Do not compress this below 90 minutes"; "Moving too fast"
- Català actual: «No comprimiu això per sota dels 90 minuts»; «Moure's massa ràpid»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «No ho escurceu per sota dels 90 minuts» / «No el reduïu...»; «Anar massa de pressa» / «Precipitar-se».
- Justificació: (a) «comprimir» un temps és calc de *compress*; en català s'escurça o es redueix una durada. (b) «Moure's massa ràpid» calca *moving too fast* en el sentit figurat de ritme; el natural és «anar massa de pressa» o «precipitar-se». Millores de naturalesa.

### 3.7 Tractament de vós coherent (tot l'article)
- Català actual: «Aquí teniu com dissenyar-lo», «consulteu», «Establiu el marc», «Envieu», «No diagnostiqueu», «Convideu», «Comenceu el vostre proper taller», «us dóna».
- Categoria: correcte · Gravetat — (sense incidència: l'article manté el tractament de vós de manera coherent, d'acord amb el model de llengua de l'auditoria. Es registra com a contrast positiu respecte de feedback-reception, coaching i sales, que usen «tu».)

### Resum quantitatiu — how-to-run-a-team-personality-workshop
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (accentuació «què», recció) | 2 | 1 | – |
| TERMINOLOGIA (fals amic «nombrar») | 1 | – | – |
| CALC (defensivitat, comprimir, moure's) | – | 1 | 1 |
| Total incidències | **3** | **2** | **1** |

---

## "Personalitat i recepció del feedback: per què algunes persones rebutgen el feedback" (`personality-and-feedback-reception-why-some-people-reject-feedback`)

### 4.1 «versus detachment clínic» (model d'Ilgen)
- Anglès: "delivered with warmth versus clinical detachment"
- Català actual: «lliurada amb calidesa versus detachment clínic»
- Categoria: ERRADA (anglicisme cru, manca de traducció) · Gravetat ALTA
- Proposta: «amb calidesa versus distanciament clínic» / «...fredor clínica».
- Justificació: «detachment» és una paraula anglesa deixada sense traduir dins del text català. Equivalents: «distanciament», «despreniment», «fredor». Cal traduir-la.

### 4.2 «expressions predictibles» (intro)
- Anglès: "they are predictable expressions of underlying personality differences"
- Català actual: «són expressions predictibles de diferències de personalitat subjacents»
- Categoria: CALC (lèxic) · Gravetat MITJANA
- Proposta: «són expressions previsibles de diferències de personalitat subjacents»
- Justificació: l'adjectiu català establert és «previsible» (de «preveure»); «predictible» és calc de l'anglès *predictable*/cast. Verificat a Optimot: la forma normativa és «previsible». Apareix també «fricció previsible» a coaching, que sí ho fa bé: cal coherència.

### 4.3 «passos específics i accionables» (Ashford i Blatt)
- Anglès: "specific, actionable next steps"
- Català actual: «passos específics i accionables»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «passos següents específics i aplicables» / «...sobre els quals es pot actuar».
- Justificació: glossari de l'auditoria. «accionable» en el sentit de *actionable* (sobre el qual es pot actuar) és calc; en català «accionable» = que es pot accionar (un mecanisme). Cal «aplicable» o perífrasi.

### 4.4 Manca d'elisió «la autopercepció» / «la autoimatge»
- Anglès: "the gap between self-perception and peer perception"; "Threat to competence self-image"
- Català actual: «la bretxa entre la autopercepció i la percepció dels iguals» (§Cinc adaptacions); «Amenaça a la autoimatge de competència» (taula resum)
- Categoria: ERRADA (elisió) · Gravetat ALTA
- Proposta: «l'autopercepció», «l'autoimatge».
- Justificació: l'article femení i la preposició «de» s'apostrofen davant de vocal: «l'autopercepció», «l'autoimatge». «la autopercepció»/«la autoimatge» són errors d'apostrofació. (Mateix tipus d'error que «de iguals» a l'article 1.)

### 4.5 «involucrement intel·lectual» (títol de secció Visió + cos)
- Anglès: "Intellectual Engagement Without Behaviour Change"
- Català actual: «Visió (Openness): involucrement intel·lectual sense canvi de comportament»
- Categoria: ERRADA/CALC (lèxic inexistent) · Gravetat ALTA
- Proposta: «implicació intel·lectual» / «compromís intel·lectual».
- Justificació: «involucrement» no existeix en català (calc de l'anglès *involvement*/fr. *implication*); el cos del mateix article ja usa «compromís intel·lectual» més avall. Cal substituir-lo per «implicació» o «compromís» i unificar.

### 4.6 «individus altament conscienciossos» (cita destacada)
- Anglès: "Among highly conscientious individuals"
- Català actual: «Entre els individus altament conscienciossos»
- Categoria: ERRADA (ortografia) · Gravetat ALTA
- Proposta: «altament conscienciosos»
- Justificació: el plural masculí de «conscienciós» és «conscienciosos» (una sola -s- a la síl·laba final); «conscienciossos» amb -ss- doble és error ortogràfic.

### 4.7 «de iguals» (secció final «Dissenyar...»)
- Anglès: "how the peer data is generated"
- Català actual: «com es generen les dades de iguals»
- Categoria: ERRADA (elisió) · Gravetat MITJANA
- Proposta: «les dades d'iguals»
- Justificació: apostrofació, com 1.1.

### 4.8 Tractament de «tu» (incoherència amb la col·lecció)
- Anglès: "how to adapt what you say to who you're saying it to"; "gives you peer-assessed profiles ... so you know in advance"
- Català actual: «la teva entrega», «com adaptar el que dius a qui ho dius», «et dóna perfils», «sàpigues amb antelació», «estàs lliurant feedback», «Gestiona el teu equip».
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós, com fan how-to-run-a-team-personality-workshop i does-…: «la vostra entrega», «el que dieu a qui ho dieu», «us dóna», «sapigueu», «esteu lliurant», «Gestioneu el vostre equip».
- Justificació: model de llengua de l'auditoria (verbs referits al lector en 2a persona del plural / tractament de vós). Aquest article va en «tu»; tres dels set articles del lot (workshop, composició, agreeableness-intro) van en vós. Cal triar un únic tractament per a la col·lecció.

### 4.9 «entrega» del feedback (descripció i cos, recurrent)
- Anglès: "delivery" (delivery side, feedback delivery)
- Català actual: «la teva entrega», «el lliurament del feedback» (alterna «entrega» i «lliurament»)
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: triar un sol terme; «lliurament» (que el cos ja usa majoritàriament) és preferible a «entrega» per al sentit de *delivery* d'un missatge. Unificar.
- Justificació: el text comença amb «entrega» (descripció) i després usa sempre «lliurament»; incoherència interna lèxica.

### Resum quantitatiu — personality-and-feedback-reception
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (elisió, ortografia, anglicisme cru) | 3 | 1 | – |
| CALC (predictible, accionable) | – | 2 | – |
| REGISTRE/COHERÈNCIA (tractament, entrega) | – | 1 | 1 |
| Total incidències | **3** | **4** | **1** |

---

## "Usar la personalitat Big Five com a eina de coaching i desenvolupament" (`personality-coaching-using-big-five-as-development-tool`)

### 5.1 «el rendiment promig» / «el gasto intencional» (§Per què les dades... ; taula, fila Extraversió)
- Anglès: "improves average performance"; "is that spend intentional?"
- Català actual: «millora el rendiment promig»; «On es gasta la meva energia social, i és aquest gasto intencional?»
- Categoria: ERRADA (castellanisme) · Gravetat ALTA
- Proposta: «millora el rendiment mitjà»; «...i és aquesta despesa intencionada?»
- Justificació: «promig» és barbarisme (calc del cast. *promedio*); la forma normativa és «mitjà/mitjana» (Optimot, esADIR). «gasto» és castellanisme cru; en català «despesa» (o «consum» d'energia). Tots dos verificats. «promig» reapareix a agreeableness (vegeu 7.x): castellanisme transversal.

### 5.2 «en l'rang de r = .15 a .25» (§Per què les dades...)
- Anglès: "typically in the r = .15 to .25 range"
- Català actual: «estan típicament en l'rang de r = .15 a .25»
- Categoria: ERRADA (apostrofació) · Gravetat ALTA
- Proposta: «en el rang de r = .15 a .25»
- Justificació: «rang» comença per consonant; l'article masculí NO s'apostrofa («el rang», no «l'rang»). Error d'apostrofació invers.

### 5.3 «ancora l'abstracte en el viscudet» (§Com és una conversa...)
- Anglès: "This grounds the abstract in the lived"
- Català actual: «Això ancora l'abstracte en el viscudet»
- Categoria: ERRADA (errata) · Gravetat ALTA
- Proposta: «ancora l'abstracte en el viscut» / «...en allò viscut»
- Justificació: «viscudet» és una errata (diminutiu inexistent en aquest context); el participi substantivat és «el viscut» / «allò viscut». Canvia/destrossa el sentit.

### 5.4 «Reavalauar» (diagrama SVG, fase Reflexionar)
- Anglès: "Re-assess, track change"
- Català actual: «Reavalauar, seguir canvis»
- Categoria: ERRADA (errata ortogràfica) · Gravetat ALTA
- Proposta: «Reavaluar, seguir canvis»
- Justificació: «Reavalauar» conté metàtesi/errata («-alaua-» per «-alua-»). La forma correcta és «reavaluar». Visible dins d'una figura.

### 5.5 «les donen permís per nomenar-los» (cita destacada)
- Anglès: "the data gives them permission to name them precisely"
- Català actual: «les dades li donen permís per nomenar-los amb precisió»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat MITJANA
- Proposta: «...per anomenar-los amb precisió»
- Justificació: *to name* = «anomenar», no «nomenar» (designar per a un càrrec). Mateix fals amic que a how-to-run-a-team-personality-workshop 3.3. Verificat a DIEC2/esADIR.

### 5.6 «abans de que comenci la conversa» (§Usa Cèrcol...)
- Anglès: "before the conversation starts"
- Català actual: «No cal tenir totes les respostes abans de que comenci la conversa»
- Categoria: ERRADA (dequisme) · Gravetat MITJANA
- Proposta: «abans que comenci la conversa»
- Justificació: «abans que» introdueix l'oració temporal sense la preposició «de» (el «de que» és dequisme, calc del castellà *antes de que*). Norma IEC/Optimot.

### 5.7 «que t'indiquen aquelles respostes que és precís» (§Preguntes de coaching, Profunditat)
- Anglès: "what do those responses tell you that is accurate?"
- Català actual: «...les teves respostes emocionals més fortes — i que t'indiquen aquelles respostes que és precís?»
- Categoria: FIDELITAT/AMBIGÜITAT · Gravetat MITJANA
- Proposta: «...i què t'indiquen, d'aquelles respostes, que sigui exacte?» / «...i quina part d'aquestes respostes t'aporta una informació exacta?»
- Justificació: doble problema. (a) «que t'indiquen» hauria de ser interrogatiu «què t'indiquen» (accent diacrític). (b) «que és precís» tradueix malament *that is accurate*: «precís» aquí vol dir «exacte/encertat», i la sintaxi queda fosca; cal reformular perquè es perd el sentit (quina part de la reacció és informació fiable).

### 5.8 «un insight de desenvolupament» (§Com la bretxa jo–Testimoni...)
- Anglès: "It is a developmental insight."
- Català actual: «És un insight de desenvolupament.»
- Categoria: REGISTRE (anglicisme evitable) · Gravetat BAIXA
- Proposta: «És una revelació de desenvolupament» / «És una intuïció reveladora per al desenvolupament».
- Justificació: «insight» es deixa sense traduir tot i tenir equivalents catalans transparents («revelació», «comprensió», «intuïció»). En context divulgatiu és preferible traduir-lo.

### 5.9 «un mànager» vs «un manager» (§Preguntes; §Usa Cèrcol)
- Anglès: "a coach or manager"; "a manager running development conversations"
- Català actual: «un coach o manager» (§Preguntes); «un mànager dirigint converses» (§Usa Cèrcol)
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: triar una sola grafia. Preferible «gestor/directiu» (o el manlleu «mànager» si es vol, però una sola forma). Evitar alternar «manager»/«mànager».
- Justificació: incoherència gràfica del mateix mot dins l'article. «coach» es manté (acceptable, és el tema), però «manager» hauria de ser «gestor»/«directiu» o, com a mínim, uniforme.

### 5.10 «El que més utilment fan» (cita destacada)
- Anglès: "The most useful thing personality data does..."
- Català actual: «El que més utilment fan les dades de personalitat...»
- Categoria: ERRADA (accentuació) + REGISTRE · Gravetat BAIXA
- Proposta: «El que fan de més útil les dades de personalitat...» (millor reformulació) o, com a mínim, «útilment» amb accent.
- Justificació: «útilment» porta accent (esdrúixol: ú-til-ment). A més, l'adverbi en -ment anteposat al verb («més utilment fan») és poc natural; convé reformular amb «de més útil».

### Resum quantitatiu — personality-coaching-using-big-five
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (castellanisme, apostrofació, errates, dequisme) | 4 | 1 | 1 |
| TERMINOLOGIA (fals amic «nomenar», manager) | – | 1 | 1 |
| FIDELITAT/AMBIGÜITAT | – | 1 | – |
| REGISTRE (insight) | – | – | 1 |
| Total incidències | **4** | **4** | **3** |

---

## "Vendes i personalitat: quins trets prediuen realment el rendiment en vendes" (`sales-personality-what-traits-predict-sales-performance`)

### 6.1 «la Obertura a l'Experiència» (títol de secció)
- Anglès: "How Openness to Experience Predicts Adaptive Selling Ability"
- Català actual: «Com la Obertura a l'Experiència prediu la capacitat de venda adaptativa»
- Categoria: ERRADA (elisió) · Gravetat ALTA
- Proposta: «Com l'Obertura a l'Experiència prediu...»
- Justificació: l'article femení «la» s'apostrofa davant de vocal tònica: «l'Obertura». «la Obertura» és error d'apostrofació en un titular de secció (molt visible). El cos del mateix article ja escriu «una alta Obertura» correctament.

### 6.2 «el mapeja a 12 rols» (§Entén el teu perfil)
- Anglès: "maps it to 12 evidence-based team roles"
- Català actual: «Cèrcol mesura el teu perfil Big Five i el mapeja a 12 rols d'equip basats en evidència»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «el fa correspondre amb 12 rols d'equip» / «el projecta sobre 12 rols d'equip» / «l'associa a 12 rols d'equip».
- Justificació: «mapejar» (de *to map onto*) és calc; en català la relació entre un perfil i uns rols es diu «fer correspondre», «associar» o «projectar». Mateix calc que a best-free-… 1.4.

### 6.3 «un desglosament detallat» (§Entén el teu perfil)
- Anglès: "to get a detailed breakdown"
- Català actual: «per obtenir un desglosament detallat»
- Categoria: ERRADA (castellanisme) · Gravetat ALTA
- Proposta: «un desglossament detallat» (o «un detall»/«una anàlisi detallada»)
- Justificació: la grafia catalana és «desglossament» (de «desglossar», amb -ss-). «desglosament» calca el castellà *desglose/desglosamiento*. Error ortogràfic.

### 6.4 «perfils distincts de vendes» (§Entén el teu perfil)
- Anglès: "including distinct sales and business development profiles"
- Català actual: «12 rols d'equip basats en evidència, incloent perfils distincts de vendes i desenvolupament de negoci»
- Categoria: ERRADA (ortografia) · Gravetat MITJANA
- Proposta: «perfils diferents de vendes...» / «perfils distints...»
- Justificació: «distincts» no és forma catalana (sembla creuament amb l'anglès *distinct*); el masculí plural és «distints» (de «distint») o, millor en registre culte, «diferents». A més, el gerundi «incloent» calca *including*; preferible «inclosos perfils diferents...».

### 6.5 «els millors rendidors» / «el rendidor carismàtic» / «els rendidors del quartil superior» (intro; §Conscienciositat i el seguiment)
- Anglès: "the highest performers"; "the charismatic underperformer"; "the top quartile performers"
- Català actual: «els millors rendidors»; «l'arquetip del rendidor carismàtic per sota del seu potencial»; «rarament entre els rendidors del quartil superior»
- Categoria: CALC (lèxic) · Gravetat MITJANA
- Proposta: «els qui rendeixen més» / «els professionals de més rendiment»; «l'arquetip del professional carismàtic que no rendeix» / «...de baix rendiment»; «entre els de més rendiment del quartil superior».
- Justificació: «rendidor» no és substantiu normatiu per a *performer* (no recollit a DIEC2/DNV amb aquest sentit); és calc. Es resol amb perífrasi («els qui rendeixen més», «de més rendiment»). Recurrent.

### 6.6 «actiu i passiu» (taula, fila Agreeableness/Vincle, «Mixt»)
- Anglès: "Mixed (both asset and liability)"
- Català actual: «Mixt (actiu i passiu)»
- Categoria: FIDELITAT (mistranslation) · Gravetat MITJANA
- Proposta: «Mixt (tant un avantatge com un inconvenient)» / «Mixt (alhora actiu i llast)».
- Justificació: *asset and liability* aquí és metàfora de «punt a favor i punt en contra», no els termes comptables «actiu i passiu». «actiu i passiu» en aquest context es llegeix com una oposició de rols (qui actua / qui pateix) i perd el sentit de l'original (avantatge vs perjudici).

### 6.7 «Baix Depth» / «Neuroticism (low)» (taula, darrera fila)
- Anglès: "Neuroticism (low) | Low Depth"
- Català actual: «Neuroticism (low) | Baix Depth»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: «Neuroticisme (baix) | Baixa Profunditat» (o, si es manté l'anglès per als noms acadèmics com fa la resta de la taula, almenys traduir «low»→«baix» de manera coherent i «Depth»→«Profunditat», que és el nom Cèrcol català ja usat a feedback-reception i coaching).
- Justificació: barreja de codi: «(low)» en anglès i «Baix» en català dins de la mateixa cel·la, i «Depth» sense traduir tot i que el nom Cèrcol català és «Profunditat». Incoherència amb la resta del lot. (Els noms de capçalera «Big Five trait» i «Conscientiousness/Extraversion/...» en anglès són admissibles —noms acadèmics—, però «low»/«Baix» i «Depth»/«Profunditat» s'han de resoldre en una sola llengua.)

### 6.8 Capitalització a l'estil anglès (Lectura addicional)
- Anglès: títols dels enllaços
- Català actual: «Personalitat i Adequació Laboral: Com Pensar sobre l'Adequació Persona-Entorn», «Personalitat i Presa de Decisions: Com el Big Five Configura el Judici», «Personalitat i Negociació: Qui Guanya i Per Què», «Personalitat i Motivació».
- Categoria: ERRADA (convenció tipogràfica) · Gravetat BAIXA
- Proposta: majúscula només a la inicial i als noms propis: «Personalitat i adequació laboral: com pensar sobre l'adequació persona-entorn», etc.
- Justificació: *title case* anglès aplicat a títols catalans (vegeu 1.8). Localitzat a la llista de lectures.

### Resum quantitatiu — sales-personality
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (elisió, castellanisme, ortografia, tipografia) | 2 | 1 | 1 |
| CALC (mapejar, rendidor) | – | 2 | – |
| FIDELITAT («actiu i passiu») | – | 1 | – |
| TERMINOLOGIA/COHERÈNCIA («Baix Depth») | – | – | 1 |
| Total incidències | **2** | **4** | **2** |

---

## "Què és l'afabilitat (agreeableness)?" (`what-is-agreeableness-the-cooperative-dimension`)

### 7.1 Manca d'elisió «la alta afabilitat» / «la afabilitat» (recurrent, tot l'article)
- Anglès: "High Agreeableness predicts..."; "mean team Agreeableness"; etc.
- Català actual: «La alta afabilitat (agreeableness) prediu...», «la afabilitat (agreeableness) mitjana», «la afabilitat (agreeableness) promig», «no són immune a aquesta dinàmica» (vegeu 7.3), «la baixa afabilitat», etc. («la afabilitat» sense apostrofar ≥4 ocurrències; «La alta» a la intro).
- Categoria: ERRADA (elisió) · Gravetat ALTA
- Proposta: «L'alta afabilitat», «l'afabilitat mitjana», etc.
- Justificació: l'article femení «la» s'apostrofa davant de vocal: «l'afabilitat», «l'alta afabilitat». Errors d'apostrofació sistemàtics. (Curiosament, el text SÍ apostrofa correctament en altres llocs «l'afabilitat»; la incoherència agreuja l'errada.)

### 7.2 «la afabilitat (agreeableness) promig dels membres» (§Què prediu l'alta...)
- Anglès: "the average Agreeableness of team members"
- Català actual: «la afabilitat (agreeableness) promig dels membres de l'equip»
- Categoria: ERRADA (castellanisme) · Gravetat ALTA
- Proposta: «l'afabilitat mitjana dels membres de l'equip»
- Justificació: «promig» és barbarisme (Optimot: forma correcta «mitjana»). A més, el text ja diu «afabilitat mitjana» a la frase anterior: usar «promig» com a sinònim és incoherent i incorrecte. Mateix castellanisme que a coaching 5.1.

### 7.3 «no són immune a aquesta dinàmica» (§Pensament de grup)
- Anglès: "are not immune to this dynamic"
- Català actual: «Els equips amb alta afabilitat (agreeableness) no són immune a aquesta dinàmica»
- Categoria: ERRADA (concordança) · Gravetat ALTA
- Proposta: «no són immunes a aquesta dinàmica»
- Justificació: l'adjectiu «immune» ha de concordar en plural amb «els equips»: «immunes». Error de concordança de nombre.

### 7.4 «nombraran el que ningú altre està disposat a dir» (§Quan la baixa afabilitat...)
- Anglès: "name the thing no one else is willing to say"
- Català actual: «s'oposaran al consens i nombraran el que ningú altre està disposat a dir»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat ALTA
- Proposta: «...i anomenaran allò que ningú més no està disposat a dir» / «...i diran el que ningú més no gosa dir».
- Justificació: «nombrar» = afegir fils a un teixit (DIEC2); fals amic del cast. *nombrar*. Per a *to name* cal «anomenar» o «dir». Mateix error que a 3.3 i 5.5. A més «ningú altre» → «ningú més» és més genuí.

### 7.5 «Veu el teu perfil Bond» (encapçalament de secció final)
- Anglès: "See your Bond profile alongside peer ratings"
- Català actual: «Veu el teu perfil Bond juntament amb les valoracions de parells»
- Categoria: ERRADA (forma verbal) · Gravetat ALTA
- Proposta: «Mira el teu perfil Bond...» (si tu) / «Mireu el vostre perfil Bond...» (si vós)
- Justificació: «Veu» no és imperatiu de «veure» (l'imperatiu és «veges/ves a veure» o, més natural, «mira»); «Veu» és 3a persona del present o el substantiu «veu» (voice). L'imperatiu de cortesia/instrucció demana «Mira»/«Vegeu»/«Mireu». Error de mode verbal en un titular.

### 7.6 «apropiablement directa» (§L'afabilitat com a Bond)
- Anglès: "experience themselves as appropriately direct"
- Català actual: «Una persona pot experimentar-se a si mateixa com a apropiablement directa»
- Categoria: ERRADA (mot inexistent) · Gravetat ALTA
- Proposta: «...com a apropiadament directa» / «...com a directa en la mesura justa».
- Justificació: «apropiablement» no existeix (creuament de «apropiat» + sufix mal format); l'adverbi és «apropiadament» (de «apropiat») o, millor, «com cal»/«en la mesura justa».

### 7.7 «es mesura i es reporta com a Bond» (§L'afabilitat com a Bond)
- Anglès: "is measured and reported as Bond"
- Català actual: «l'afabilitat (agreeableness) es mesura i es reporta com a Bond»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «es mesura i es presenta com a Bond» / «...i s'informa com a Bond».
- Justificació: «reportar» en el sentit de *to report (data)* és calc de l'anglès; en català «reportar» significa portar/reprimir o aportar (beneficis). Per a presentar resultats: «presentar», «informar», «consignar».

### 7.8 «mapeja els nivells de Bond a rols funcionals» (§Com es veu un perfil equilibrat)
- Anglès: "maps Bond levels to specific functional roles"
- Català actual: «també mapeja els nivells de Bond a rols funcionals específics»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «també fa correspondre els nivells de Bond amb rols funcionals específics» / «...associa els nivells de Bond a rols...».
- Justificació: «mapejar», calc de *to map onto*. Vegeu 6.2 i 1.4.

### 7.9 Redundància «afabilitat (agreeableness)» repetida a cada aparició (tot l'article)
- Anglès: usa «Agreeableness» i fixa una sola vegada «called Bond».
- Català actual: «afabilitat (agreeableness)» apareix amb el parèntesi anglès desenes de vegades, fins i tot dins de citacions i encapçalaments.
- Categoria: REDUNDÀNCIA · Gravetat MITJANA
- Proposta: glossar el terme acadèmic una sola vegada a la primera aparició —«l'afabilitat (en anglès, *agreeableness*)»— i després usar només «afabilitat». En SEO es permet el nom acadèmic, però no cal repetir-lo entre parèntesis a cada frase.
- Justificació: la repetició mecànica «afabilitat (agreeableness)» a cada ocurrència (i fins i tot dins de la cita de Bell) llasta la lectura i denota traducció automàtica no editada. Una glossa inicial n'hi ha prou.

### 7.10 Coherència del nom de dimensió «Afabilitat» vs «Amabilitat» (inter-article)
- Català actual: aquest article usa «afabilitat/afable» per a Agreeableness; best-free-… i does-… del mateix lot usen «Amabilitat»; sales-… usa «Amabilitat» al cos i l'enllaç «la dimensió cooperativa».
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: fixar UN sol equivalent català d'Agreeableness per a tota la col·lecció. «Amabilitat» és el més estès en la bibliografia catalana del Big Five; «Afabilitat» també és defensable però cal triar-ne un.
- Justificació: el mateix tret acadèmic apareix com «Amabilitat» (4 articles) i «Afabilitat» (aquest); incoherència de col·lecció que confon el lector que navega entre articles enllaçats.

### 7.11 Tractament mixt vós/tu (intro vs seccions finals)
- Català actual: la descripció i la intro usen vós («Obteniu la visió completa»), però les dues seccions finals salten a «tu» («Veu el teu perfil», «com et veus a tu mateix», «Pots començar», «Si gestiones un equip», «poden ajudar-te»).
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós dins de l'article i amb la col·lecció: «Mireu el vostre perfil», «com us veieu», «Podeu començar», «Si gestioneu un equip», «poden ajudar-vos».
- Justificació: incoherència de tractament dins del mateix text (descripció en vós, cos final en tu) i amb workshop/composició (vós). Model de llengua de l'auditoria.

### Resum quantitatiu — what-is-agreeableness
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (elisió, castellanisme, concordança, forma verbal, mot inexistent) | 5 | – | – |
| TERMINOLOGIA (fals amic «nombrar», coherència Afabilitat/Amabilitat) | 1 | 1 | – |
| CALC (reportar, mapejar) | – | 2 | – |
| REDUNDÀNCIA («(agreeableness)» repetit) | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **6** | **5** | **0** |

---



## "La personalitat Big Five a través de les cultures: el que mostra la investigació" (`big-five-personality-across-cultures-what-research-shows`)

### 1.1 «andamatge transcultural útil»
- **Ubicació**: secció «El debat emic vs etic», darrer paràgraf abans de la conclusió de la secció.
- **Anglès**: "the Big Five provides a useful cross-cultural scaffold".
- **Català actual**: «el Big Five proporciona un andamatge transcultural útil».
- **Categoria**: TERMINOLOGIA/CALC (castellanisme) · **Gravetat**: ALTA.
- **Proposta**: «el Big Five proporciona una bastida transcultural útil» (o «un bastiment / un marc transcultural útil»).
- **Justificació**: *andamatge* no existeix en català; és un calc cru del cast. *andamiaje*. El terme català per a *scaffold* (literal i figurat) és **bastida** (DIEC2; DCVB; TERMCAT/IATE). Fins i tot la forma educativa calcada que circula és *andamiatge*, no *andamatge*: la paraula del text és doblement defectuosa. A més, l'adjectiu posposat «útil» és correcte (cf. 1.2).

### 1.2 «útil per a calibrar» — anteposició: «andamatge transcultural útil» (ordre correcte)
- **Ubicació**: mateixa frase que 1.1.
- **Anglès**: "a useful cross-cultural scaffold".
- **Català actual**: «un andamatge transcultural útil».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: l'ordre adjectival «...útil» posposat és el natural en català; es registra per descartar-lo. L'única incidència de la frase és lèxica, 1.1).

### 1.3 «desimplicació» / «desenvolupament econòmic» — «desimplicació»
- **Ubicació**: taula de perfils regionals, fila «Est Asiàtic».
- **Anglès**: "reflective communication style can be mistaken for disengagement".
- **Català actual**: «l'estil de comunicació reflexiu pot confondre's amb desimplicació».
- **Categoria**: TERMINOLOGIA · **Gravetat**: BAIXA.
- **Proposta**: «...pot confondre's amb desinterès / desvinculació / manca d'implicació».
- **Justificació**: *desimplicació* no és forma lexicalitzada ni recollida als diccionaris normatius (DNV/DIEC2); és un derivat ad hoc. *Disengagement* en aquest context (retirada de la implicació) es resol millor amb **desvinculació**, **desinterès** o la perífrasi «manca d'implicació», totes transparents i normatives.

### 1.4 «en alguns mesuraments» / «menor en alguns mesuraments»
- **Ubicació**: taula de perfils regionals, fila «Nord Europeu».
- **Anglès**: "lower Bond on some measures".
- **Català actual**: «Bond menor en alguns mesuraments».
- **Categoria**: TERMINOLOGIA · **Gravetat**: BAIXA.
- **Proposta**: «Bond menor en algunes mesures» (o «en alguns indicadors»).
- **Justificació**: *measures* ací significa «mesures/indicadors», no l'acte de mesurar. *Mesurament* (l'acció de mesurar) desplaça lleugerament el sentit; **mesura** és l'equivalent precís per a un instrument o índex de mesura. No és error greu, però guanya precisió.

### 1.5 «hauria de fer-vos més acurats a l'hora d'interpretar»
- **Ubicació**: secció «Què significa la investigació transcultural... per als equips multinacionals», 2n paràgraf.
- **Anglès**: "should make you more careful about interpreting...".
- **Català actual**: «hauria de fer-vos més acurats a l'hora d'interpretar».
- **Categoria**: TERMINOLOGIA (fals amic) · **Gravetat**: MITJANA.
- **Proposta**: «hauria de fer que sigueu més prudents / més cautelosos a l'hora d'interpretar».
- **Justificació**: *careful* ací = «prudent, cautelós», no *accurate*. **Acurat** en català significa «fet amb cura, minuciós» (un treball acurat), no «caut». És un fals amic que desplaça el sentit: l'anglès demana cautela interpretativa, no minuciositat. Cf. la versió DE «vorsichtiger» (més prudent).

### 1.6 «hauria de evitar que malinterpreteu»
- **Ubicació**: mateixa secció, final del 2n paràgraf.
- **Anglès**: "should prevent you from misreading Norwegian reticence as low Presence".
- **Català actual**: «hauria de evitar que malinterpreteu la reticència noruega com a Presence baixa».
- **Categoria**: ERRADA (apostrofació + recció) · **Gravetat**: MITJANA.
- **Proposta**: «hauria d'evitar que malinterpreteu la reticència noruega com a Presence baixa» (i, més idiomàtic, «...que interpreteu malament...»).
- **Justificació**: davant de vocal cal apostrofar: «hauria **d'**evitar», no «hauria de evitar» (norma d'apòstrof, DIEC/AVL). A més, «malinterpretar» és admès però la perífrasi «interpretar malament» és més neutra; opcional.

### 1.7 «la harmonia grupal pesa molt»
- **Ubicació**: taula de perfils regionals, fila «Llatinoamericà».
- **Anglès**: "group harmony weighs heavily".
- **Català actual**: «la harmonia grupal pesa molt».
- **Categoria**: ERRADA (apostrofació) · **Gravetat**: MITJANA.
- **Proposta**: «l'harmonia grupal pesa molt».
- **Justificació**: «harmonia» comença per *h* + vocal tònica/àtona i l'article femení s'apostrofa: **l'harmonia** (regla general d'apòstrof davant *h* muda + vocal). «La harmonia» és incorrecte. Cf. el mateix error a 4.x d'altres articles del lot («la angúnia», «la alta...»).

### 1.8 «desxifrar-les requereix dissenys d'investigació»
- **Ubicació**: secció «Per què les puntuacions mitjanes... difereixen», final.
- **Anglès**: "untangling them requires research designs that are difficult to execute".
- **Català actual**: «desxifrar-les requereix dissenys d'investigació que són difícils d'executar».
- **Categoria**: FIDELITAT · **Gravetat**: BAIXA.
- **Proposta**: «destriar-les / desentrellar-les requereix dissenys d'investigació difícils d'executar».
- **Justificació**: *to untangle* = «desfer/desentrellar, destriar», no *decipher*. **Desxifrar** implica desencriptar o interpretar un codi, sentit que no és el de la font (separar causes additives entreteixides). Pèrdua lleu de matís.

### 1.9 «un grup sistemàticament no representatiu»
- **Ubicació**: secció «Els límits...», punt «Les mostres no són poblacions representatives».
- **Anglès**: "a systematically unrepresentative group".
- **Català actual**: «un grup sistemàticament no representatiu».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: «no representatiu» és bona solució per a *unrepresentative*; es registra per descartar el dubte amb un possible *desrepresentatiu*).

### Resum quantitatiu Article 1
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (apostrofació) | – | 2 | – |
| TERMINOLOGIA/CALC (fals amic, lèxic) | 1 | 1 | 2 |
| FIDELITAT | – | – | 1 |
| Total incidències | **1** | **3** | **3** |

---

## "Cinc mites de la ciència de la personalitat que no desapareixen — i el que la recerca diu realment" (`five-personality-science-myths-that-wont-die`)

### 2.1 Tractament «tu» sistemàtic vs model de vós
- **Ubicació**: tot l'article (imperatius i possessius dirigits al lector): «La teva personalitat», «Qui ets és qui sempre seràs», «No facis servir», «Utilitza'ls», «consulta», «Ajuda les persones», «No et...».
- **Anglès**: "Your personality...", "Do not use...", "Use them...", "Help people...".
- **Català actual**: tot en 2a persona del singular informal («tu»).
- **Categoria**: REGISTRE/COHERÈNCIA · **Gravetat**: MITJANA.
- **Proposta**: unificar al tractament de **vós** (model de la col·lecció): «La vostra personalitat», «No feu servir», «Utilitzeu-los», «consulteu», «Ajudeu les persones». Si la decisió editorial és mantenir «tu», cal fer-ho a tota la col·lecció (vegeu R5 del 05-blog: altres articles barregen «vós»).
- **Justificació**: el model de llengua de l'auditoria fixa el tractament de **vós** per a les crides al lector. Aquest article és internament coherent en «tu», però xoca amb la sèrie (p. ex. l'article `how-to-use-personality-data...` d'aquest mateix lot usa «Useu», «consulteu»). Incidència de coherència de col·lecció, no de gramàtica.

### 2.2 «Aquesta és informació directament aplicable» — («el premium d'ingressos»)
- **Ubicació**: Mite 4, «D'on ve» i cos de la secció.
- **Anglès**: "There is a real income premium associated with Extraversion".
- **Català actual**: «Hi ha un premium d'ingressos real associat a l'Extraversió» / «el premium d'ingressos per a l'Extraversió».
- **Categoria**: TERMINOLOGIA (anglicisme innecessari) · **Gravetat**: MITJANA.
- **Proposta**: «un sobresou / una prima d'ingressos» o «un avantatge salarial»; aquí «una prima salarial associada a l'Extraversió».
- **Justificació**: *premium* és manlleu cru evitable; el català disposa de **prima** (suplement) i, en context salarial, **sobresou** o **avantatge salarial**. La versió DE usa «Einkommensprämie» (prima). Manlleu no consolidat en registre divulgatiu culte.

### 2.3 «derrotar completament l'instrument»
- **Ubicació**: Mite 5, «El mite».
- **Anglès**: "defeat the instrument entirely".
- **Català actual**: «falsificar... respostes socialment desitjables i derrotar completament l'instrument».
- **Categoria**: TERMINOLOGIA (fals amic) · **Gravetat**: MITJANA.
- **Proposta**: «...i invalidar / neutralitzar completament l'instrument» (o «burlar l'instrument»).
- **Justificació**: *to defeat* aplicat a un test no és «derrotar» (que en català es reserva a vèncer algú en combat/competició); el sentit és «desactivar-ne la validesa». **Invalidar / neutralitzar / burlar** són els verbs adequats. «Derrotar un instrument» és un calc semàntic.

### 2.4 «els que guanyen més són extravertits» / «Spitzenverdiener» — «els que guanyen més»
- **Ubicació**: Mite 4, «El mite».
- **Anglès**: "high earners are extraverted".
- **Català actual**: «els que guanyen més són extravertits».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: «els que guanyen més» és bona solució idiomàtica per a *high earners*; es registra per descartar la temptació d'un calc com *alts guanyadors*).

### 2.5 «desitjabilitat social» (peu i taula) vs «ønskvæerdighed»
- **Ubicació**: callout inicial i taula resum, fila Mite 5.
- **Anglès**: "Social desirability makes tests useless".
- **Català actual**: «La desitjabilitat social fa inútils els tests».
- **Categoria**: correcte · **Gravetat**: — (fals positiu valuós: l'article empra correctament **desitjabilitat social** (terme TERMCAT) i evita el calc *deseabilitat* que apareixia a articles anteriors de la col·lecció; coherència consolidada).

### 2.6 «aquells l'afecte positiu dels quals no és constitucionalment alt»
- **Ubicació**: Mite 3? No — final del bloc «implicació pràctica» del Mite... (cos: «genera satisfacció cognitiva fins i tot per a aquells l'afecte positiu dels quals no és constitucionalment alt» — apareix a l'article germà; ací: no aplicable). Vegeu nota.
- **Català actual**: n/a en aquest article.
- **Categoria**: — · **Gravetat**: — (sense incidència; eliminat per evitar fals recompte).

### 2.7 «marginalment més probable d'estar associada amb un bon rendiment»
- **Ubicació**: Mite 3, paràgraf «Per ser concrets».
- **Anglès**: "is marginally more likely to be associated with good performance".
- **Català actual**: «és marginalment més probable d'estar associada amb un bon rendiment».
- **Categoria**: CALC (recció) · **Gravetat**: BAIXA.
- **Proposta**: «té una probabilitat marginalment més alta d'estar associada amb un bon rendiment» o «és marginalment més probable que estigui associada...».
- **Justificació**: la construcció «ésser probable de + infinitiu» referida a un subjecte (puntuació) és un calc de l'anglès *more likely to*. En català natural «és probable que + subjuntiu» o «té (més) probabilitat de». Millora de fluïdesa.

### 2.8 «massa exagerada en les seves implicacions pràctiques»
- **Ubicació**: Mite 3, «D'on ve».
- **Anglès**: "just dramatically overstated in its practical implications".
- **Català actual**: «simplement molt exagerada en les seves implicacions pràctiques».
- **Categoria**: FIDELITAT · **Gravetat**: BAIXA.
- **Proposta**: «simplement exagerada de manera dràstica en les seves implicacions» (o «...desmesuradament exagerada»).
- **Justificació**: *dramatically* (intensitat forta, «de manera espectacular/dràstica») es rebaixa a «molt», que atenua el contrast retòric de la font. Pèrdua de força lleu.

### Resum quantitatiu Article 2
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| TERMINOLOGIA (anglicisme, fals amic) | – | 2 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| CALC (recció) | – | – | 1 |
| FIDELITAT (intensitat) | – | – | 1 |
| Total incidències | **0** | **3** | **2** |

---

## "Com usar les dades de personalitat sense etiquetar les persones" (`how-to-use-personality-data-without-labelling-people`)

### 3.1 «les diferents maneres com les persones abordan el treball»
- **Ubicació**: 1r paràgraf del cos.
- **Anglès**: "the different ways people approach work".
- **Català actual**: «les diferents maneres com les persones abordan el treball».
- **Categoria**: ERRADA (castellanisme morfològic) · **Gravetat**: ALTA.
- **Proposta**: «les diferents maneres com les persones aborden el treball».
- **Justificació**: *abordan* és la forma castellana; el present d'indicatiu català de 3a persona del plural és **aborden** (model *batre/perdre* → *-en*). Error ortogràfic/morfològic cru.

### 3.2 «es tornen autoreempleadores i limiten les persones» (títol de secció)
- **Ubicació**: títol «Com les etiquetes de personalitat es tornen autoreempleadores...».
- **Anglès**: "How Personality Labels Become Self-Fulfilling and Limit People".
- **Català actual**: «...es tornen autoreempleadores...».
- **Categoria**: ERRADA (mot inexistent) · **Gravetat**: ALTA.
- **Proposta**: «...es tornen autocomplidores / es compleixen per si mateixes (profecies autocomplidores)...».
- **Justificació**: *autoreempleadores* no és cap mot català (sembla creuament fallit de *self-fulfilling* amb *emplenar/emplear*). *Self-fulfilling (prophecy)* es ret en català per **profecia autocomplerta / autocomplidora** o «que es compleix per si mateixa». Error de creació lèxica en un titular, molt visible.

### 3.3 «pot ser autoreemplent: la persona internalitza l'etiqueta»
- **Ubicació**: 2n paràgraf de la mateixa secció (teoria de l'etiquetatge).
- **Anglès**: "can become self-fulfilling: the person internalises the label".
- **Català actual**: «pot ser autoreemplent: la persona internalitza l'etiqueta».
- **Categoria**: ERRADA (mot inexistent) · **Gravetat**: ALTA.
- **Proposta**: «pot ser autocomplerta / autocomplidora: la persona interioritza l'etiqueta».
- **Justificació**: igual que 3.2, *autoreemplent* no existeix. A més, *internalise* es ret millor amb **interioritzar** (DNV/DIEC2), tot i que «internalitzar» està estès en psicologia; coherència recomanable. La doble forma defectuosa («autoreempleadores»/«autoreemplent») dins de la mateixa secció agreuja la incidència.

### 3.4 «Reencadrament de desenvolupament» (capçalera de taula) i «reemmarquen»
- **Ubicació**: capçalera de la taula de la secció «Normes d'equip» («Reencadrament de desenvolupament»); el verb relacionat «reemmarcar» no apareix ací però sí a l'article de conflicte (vegeu 5.x).
- **Anglès**: "Developmental reframe".
- **Català actual**: «Reencadrament de desenvolupament».
- **Categoria**: CALC/ERRADA (lèxic) · **Gravetat**: MITJANA.
- **Proposta**: «Replantejament en clau de desenvolupament» o «Nova manera de plantejar-ho» (capçalera: «Replantejament evolutiu / de desenvolupament»).
- **Justificació**: *reframe/reframing* no es tradueix per *reencadrament* (mot no normatiu, calc del cast. *reencuadre*). El català usa **replantejar / reformular / tornar a plantejar**; en sentit cognitiu, «replantejament». *Reenquadrar* existeix però amb sentit fotogràfic/visual, no conceptual.

### 3.5 «Una persona dinàmica i multidimensional es converteix en una abreviació»
- **Ubicació**: 2n paràgraf del cos.
- **Anglès**: "A dynamic, multidimensional person becomes a shorthand."
- **Català actual**: «...es converteix en una abreviació. I l'abreviació comença a fer una feina...».
- **Categoria**: FIDELITAT/TERMINOLOGIA · **Gravetat**: BAIXA.
- **Proposta**: «es converteix en una etiqueta abreujada / en una drecera mental» (o «en una simplificació»).
- **Justificació**: *shorthand* aquí és «fórmula abreujada, drecera», no *abbreviation* (abreviació = escurçament gràfic d'un mot). «Abreviació» desplaça el sentit cap a l'ortografia; «drecera/simplificació/etiqueta abreujada» captura el sentit figurat. Lleu.

### 3.6 «en que voleu treballar?» / «En que voleu treballar?» (títol)
- **Ubicació**: títol de secció «El marc de desenvolupament: en que voleu treballar?» i «Que voleu fer amb això?», «Que és l'Extraversió», «Que és l'Amabilitat», «Que és el Neuroticisme».
- **Anglès**: "What Do You Want to Work On?" / "What is Extraversion".
- **Català actual**: «en que voleu treballar», «Que voleu fer», «Que és l'Extraversió/l'Amabilitat/el Neuroticisme».
- **Categoria**: ERRADA (accent diacrític/interrogatiu) · **Gravetat**: ALTA.
- **Proposta**: «en què voleu treballar», «Què voleu fer», «Què és l'Extraversió/l'Amabilitat/el Neuroticisme».
- **Justificació**: l'interrogatiu i el relatiu tònic precedit de preposició s'escriuen amb accent: **què** (DIEC/AVL). «que» àton és conjunció/relàtiu àton. Recurrent (mínim 5 ocurrències, incloent-hi un títol de secció i diversos enllaços), per tant ALTA.

### 3.7 «Així és ell — molt baix en amabilitat» / minúscules de dimensions
- **Ubicació**: 2n paràgraf («Ella té un N alt», «molt baix en amabilitat»).
- **Anglès**: "She's a high-N." "...very low on agreeableness."
- **Català actual**: «Ella té un N alt», «molt baix en amabilitat».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: ací la minúscula reprodueix l'estil informal de la font anglesa (*agreeableness* en minúscula dins la cita col·loquial); no és incoherent amb l'ús majúscul de les dimensions Cèrcol en context tècnic. Es registra per descartar-lo).

### 3.8 «Useu-les per iniciar converses» / «t'arriba» (callout verd)
- **Ubicació**: callout verd «La regla d'or de les dades de personalitat».
- **Anglès**: "Use them to start conversations ('I noticed I tend to X — how does that land with you?')".
- **Català actual**: «Useu-les per iniciar converses ('Noto que tendeixo a X — com t'arriba?')».
- **Categoria**: REGISTRE/COHERÈNCIA · **Gravetat**: MITJANA.
- **Proposta**: dins del model de vós, la cita en boca del lector hauria de ser coherent amb el marc; en tot cas, l'instructiu «Useu-les» (vós) conviu amb «t'arriba» (tu) i amb «com t'arriba?». Unificar: si el cos va de vós, «com us arriba?» quan es parla a l'interlocutor; el diàleg citat pot mantenir «tu» com a registre de conversa informal, però cal marcar la frontera.
- **Justificació**: l'article és majoritàriament coherent en **vós** (Useu, Useu-les, consulteu, vegeu), però hi conviuen restes de «tu» en exemples i en «per què/que». Cal homogeneïtzar el tractament del lector. (R5 transversal.)

### 3.9 «no seríeu bons en això a causa del vostre perfil»
- **Ubicació**: secció «Normes d'equip...», 2n paràgraf.
- **Anglès**: "you wouldn't be good at this because of your profile".
- **Català actual**: «no seríeu bons en això a causa del vostre perfil».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: la concordança amb vós es fa en plural quan el referent és genèric/col·lectiu; ací «bons» és admissible. Es registra per descartar el dubte de concordança vós→singular, que aplica a adjectius referits a UN interlocutor, no a un genèric).

### Resum quantitatiu Article 3
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (morfologia, mots inexistents, accent diacrític) | 4 | – | – |
| CALC/TERMINOLOGIA (reframe, shorthand) | – | 1 | 1 |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **4** | **2** | **1** |

---

## "Personalitat i felicitat: el que la investigació Big Five prediu sobre el benestar subjectiu" (`personality-and-happiness-what-big-five-predicts`)

### 4.1 «la majoria de la variança en la felicitat reportada»
- **Ubicació**: 1r paràgraf del cos i descripció.
- **Anglès**: "accounts for a substantial proportion of the variance in reported happiness".
- **Català actual**: «explica una proporció substancial de la variança en la felicitat reportada».
- **Categoria**: TERMINOLOGIA · **Gravetat**: BAIXA.
- **Proposta**: «de la variància en la felicitat reportada».
- **Justificació**: el terme estadístic normatiu és **variància** (DNV/DIEC2; TERMCAT), no *variança*. *Variança* és forma desestimada/antiga. Recurrent a tot l'article (stat-card «de la variança de la felicitat», taula, etc.). Coherència terminològica.

### 4.2 «Quant de satisfeta estàs amb la teva vida»
- **Ubicació**: secció «Què significa realment el Benestar Subjectiu», definició de satisfacció vital.
- **Anglès**: "How satisfied are you with your life as a whole?"
- **Català actual**: «Quant de satisfeta estàs amb la teva vida en general?»
- **Categoria**: REGISTRE/ERRADA · **Gravetat**: MITJANA.
- **Proposta**: «Fins a quin punt esteu satisfet/a amb la vostra vida en conjunt?» (model vós) o, en tu, «Com n'estàs, de satisfet/a, amb la teva vida en conjunt?».
- **Justificació**: doble qüestió: (a) tractament «tu» («estàs», «la teva») trenca el model de vós (R5); (b) «Quant de satisfeta» és un calc estructural poc natural per a *how satisfied*; el català prefereix «fins a quin punt» o «com n'estàs de + adjectiu». A més, el femení fix «satisfeta» introdueix un gènere arbitrari en una pregunta genèrica.

### 4.3 «la seva línia de base tendeix a ser més baixa»
- **Ubicació**: definició de «baix afecte negatiu».
- **Anglès**: "their baseline tends to sit lower".
- **Català actual**: «la seva línia de base tendeix a ser més baixa».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: «línia de base» és bona traducció de *baseline* en context psicològic; es registra per descartar-lo).

### 4.4 «Això no tracta d'un optimisme... es tracta d'un sistema de recompensa més responsiu»
- **Ubicació**: secció «Extraversió i Afecte Positiu», 2n paràgraf.
- **Anglès**: "This is not about optimism in the sense of ignoring problems; it is about a more responsive reward system."
- **Català actual**: «Això no tracta d'un optimisme en el sentit d'ignorar els problemes; es tracta d'un sistema de recompensa més responsiu.»
- **Categoria**: ERRADA (recció) + TERMINOLOGIA · **Gravetat**: MITJANA.
- **Proposta**: «No es tracta d'optimisme en el sentit d'ignorar els problemes, sinó d'un sistema de recompensa més reactiu / sensible.»
- **Justificació**: (a) recció: «tractar-se de» és pronominal impersonal: «**es** tracta de», no «això **tracta** de» (que demanaria un subjecte agent). (b) *responsive* aplicat a un sistema neurològic = «reactiu / sensible», no *responsiu* (anglicisme poc consolidat; el text mateix usa «reactiu» més amunt: incoherència interna amb «sistema d'activació conductual més reactiu»).

### 4.5 «menor afecte negatiu» / «major intensitat» — «extraurà més emoció positiva d'ell»
- **Ubicació**: secció «Extraversió...», final.
- **Anglès**: "the higher-Extraversion person will likely extract more positive emotion from it".
- **Català actual**: «la persona amb major Extraversió probablement extraurà més emoció positiva d'ell».
- **Categoria**: ERRADA (concordança pronominal) · **Gravetat**: MITJANA.
- **Proposta**: «...n'extraurà més emoció positiva» (el referent és «el mateix esdeveniment», masculí → «en»/«d'ell» fa pensar en persona).
- **Justificació**: «d'ell» referit a un esdeveniment és ambigu i poc natural (sembla referir-se a una persona); el pronom feble **en** («n'extraurà») és la solució recta per a un complement de cosa introduït per *de*. Ambigüitat referencial.

### 4.6 «poden absorbir la angúnia de les persones»
- **Ubicació**: secció «Amabilitat, Qualitat de les Relacions...», darrer paràgraf.
- **Anglès**: "may absorb distress from the people around them".
- **Català actual**: «poden absorbir la angúnia de les persones que les envolten».
- **Categoria**: ERRADA (apostrofació) · **Gravetat**: MITJANA.
- **Proposta**: «poden absorbir l'angúnia de les persones que les envolten» (o «...l'angoixa...»).
- **Justificació**: cal apostrofar l'article davant vocal: **l'angúnia** (regla d'apòstrof). «la angúnia» és incorrecte. Nota terminològica: *angúnia* és normativa i sinònima d'*angoixa* (DIEC2/diccionari.cat), per tant el lèxic és correcte; l'única incidència és l'apostrofació. Cf. error paral·lel «la harmonia» a 1.7.

### 4.7 «triguen més a tornar a la línia de base després d'experiències angustioses»
- **Ubicació**: secció «Neuroticisme i Afecte Negatiu Crònic», 1r paràgraf.
- **Anglès**: "take longer to return to baseline after distressing experiences".
- **Català actual**: «triguen més a tornar a la línia de base després d'experiències angustioses».
- **Categoria**: ERRADA (castellanisme) · **Gravetat**: ALTA.
- **Proposta**: «...després d'experiències angoixants / penoses / amoïnadores».
- **Justificació**: *angustiós/-osa* és un castellanisme (cast. *angustioso*); no és forma catalana normativa. L'adjectiu català és **angoixant** (de *angoixar*), o «penós», «aclaparador». Error lèxic cru.

### 4.8 «la dosi requerida varia»
- **Ubicació**: secció «Implicacions Pràctiques», «Per a les persones amb menor Presència».
- **Anglès**: "the dose required varies".
- **Català actual**: «l'estimulació social genera afecte positiu, però la dosi requerida varia».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: «dosi» (f.) és la forma normativa correcta —no *dosis* en singular—; es registra perquè *dosis* singular és error freqüent i ací està ben resolt).

### 4.9 «defusió cognitiva de l'ACT»
- **Ubicació**: secció «Implicacions Pràctiques», alta Profunditat.
- **Anglès**: "cognitive defusion techniques from ACT".
- **Català actual**: «tècniques de defusió cognitiva de l'ACT».
- **Categoria**: TERMINOLOGIA · **Gravetat**: BAIXA.
- **Proposta**: mantenir «defusió cognitiva» (terme tècnic ACT consolidat) però considerar glossa: «de la teràpia d'acceptació i compromís (ACT)» en primera aparició.
- **Justificació**: *defusion* (defusió cognitiva) és terme tècnic acceptat en la literatura ACT en català; no és error. La sigla ACT no s'ha desplegat: per a lector divulgatiu convé glossar-la un cop. Millora menor de claredat.

### Resum quantitatiu Article 4
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (castellanisme, apostrofació, recció, concordança) | 1 | 3 | – |
| TERMINOLOGIA (variància, responsiu, ACT) | – | (inclòs a 4.4) | 2 |
| REGISTRE (tractament, calc estructural) | – | 1 | – |
| Total incidències | **1** | **4** | **2** |

---

## "Conflicte de personalitat en equips: com és realment — i què fer" (`personality-conflict-in-teams-what-it-actually-looks-like`)

### 5.1 «cap de les dues parts entén el que impuls el comportament de l'altra»
- **Ubicació**: secció «Els punts cecs compliquen el conflicte», 1r paràgraf.
- **Anglès**: "when neither party understands what's driving the other's behavior".
- **Català actual**: «...quan cap de les dues parts entén el que impuls el comportament de l'altra».
- **Categoria**: ERRADA (gramàtica: nom per verb) · **Gravetat**: ALTA.
- **Proposta**: «...quan cap de les dues parts entén què impulsa el comportament de l'altra».
- **Justificació**: «el que impuls el comportament» és agramatical: *impuls* és substantiu i ací cal el verb **impulsa** (3a pers., *to drive* = «impulsar/moure»). A més, «el que» → «què» seria més net en interrogativa indirecta. Error sintàctic clar.

### 5.2 «els objectius compartits reemmarquen el conflicte de personalitat»
- **Ubicació**: secció «2. Objectius compartits», 2n paràgraf.
- **Anglès**: "Shared goals reframe personality conflict from...".
- **Català actual**: «Els objectius compartits reemmarquen el conflicte de personalitat de "..." a "...".»
- **Categoria**: CALC/ERRADA (lèxic) · **Gravetat**: MITJANA.
- **Proposta**: «Els objectius compartits replantegen / reformulen el conflicte de personalitat de "..." a "..."».
- **Justificació**: *reframe* → no «reemmarcar» (mot no normatiu, calc; cf. 3.4). El verb català és **replantejar / reformular / tornar a plantejar**. Coherent amb la correcció de «reencadrament» a l'article 3.

### 5.3 «pot semblar oblivious al seu impacte en els altres»
- **Ubicació**: secció «Entén les dinàmiques estructurals...», 2n paràgraf.
- **Anglès**: "why the same person seems oblivious to their impact on others".
- **Català actual**: «per què la mateixa persona sembla oblivious al seu impacte en els altres».
- **Categoria**: ERRADA (anglicisme cru) · **Gravetat**: ALTA.
- **Proposta**: «...sembla aliè / inconscient / del tot ignorant del seu impacte en els altres».
- **Justificació**: *oblivious* és un mot anglès no adaptat; no existeix en català. Equivalents: **aliè a**, **inconscient de**, «que no s'adona de», «que ignora». Manlleu no integrat dins de text divulgatiu.

### 5.4 «les autopercepció dels membres de l'equip divergeix»
- **Ubicació**: secció «Entén les dinàmiques...», 2n paràgraf.
- **Anglès**: "where team members' self-perception diverges".
- **Català actual**: «mostrant on les autopercepció dels membres de l'equip divergeix de com realment els experimenten els col·legues».
- **Categoria**: ERRADA (concordança article-nom) · **Gravetat**: MITJANA.
- **Proposta**: «...on l'autopercepció dels membres de l'equip divergeix de com realment...».
- **Justificació**: discordança de nombre: article plural «les» amb nom singular «autopercepció» i verb singular «divergeix». Cal singular: **l'autopercepció ... divergeix**. Error de concordança.

### 5.5 «redissenya» (descripció) / «anomena el patró, redissenya»
- **Ubicació**: descripció (meta).
- **Anglès**: "name the pattern, redesign".
- **Català actual**: «anomena el patró, redissenya».
- **Categoria**: REGISTRE/COHERÈNCIA · **Gravetat**: BAIXA.
- **Proposta**: si la col·lecció va de vós: «anomeneu el patró, redissenyeu»; si de tu, mantenir. Cal coherència amb el cos (que usa «el teu equip», «Comença l'avaluació»: tractament tu).
- **Justificació**: imperatius dirigits al lector; coherència de tractament (R5). L'article és internament coherent en «tu» («el teu equip», «Si el teu equip», «Comença»), però xoca amb el model de vós de la col·lecció. Incidència de coherència, no de gramàtica.

### 5.6 «escalant-se més» / «el membre d'alta Profunditat experimenta com un rebuig... escalant-se més»
- **Ubicació**: secció «Amplificació d'Alta Profunditat», 2n paràgraf.
- **Anglès**: "which the high-Depth member experiences as dismissal rather than reassurance, escalating further".
- **Català actual**: «...experimenta com un rebuig en lloc d'un assegurament, escalant-se més».
- **Categoria**: TERMINOLOGIA/CALC · **Gravetat**: MITJANA.
- **Proposta**: «...com un rebuig en lloc d'una reconfortació / d'un gest tranquil·litzador, fet que escala / agreuja encara més el conflicte».
- **Justificació**: doble: (a) *reassurance* → no «assegurament» (que és acte d'assegurar un bé/contracte); el sentit és **tranquil·litzar / reconfortar** («un gest tranquil·litzador»). (b) «escalar-se» pronominal és calc; *escalate* intransitiu en català és «augmentar / agreujar-se / intensificar-se». «Escalant-se més» és confús.

### 5.7 «com el conflicte impulsat per la personalitat»
- **Ubicació**: diversos llocs («conflicte impulsat per la personalitat», «fricció impulsada per la personalitat»).
- **Anglès**: "personality-driven conflict / friction".
- **Català actual**: «conflicte impulsat per la personalitat», «fricció impulsada per la personalitat».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: «impulsat per» és bona solució per a *-driven*; es registra per descartar la temptació del calc *conduït/dirigit per*).

### Resum quantitatiu Article 5
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (sintaxi, concordança, anglicisme cru) | 2 | 1 | – |
| CALC/TERMINOLOGIA (reframe, reassurance, escalate) | – | 2 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | – | 1 |
| Total incidències | **2** | **3** | **1** |

---

## "Acord jo-altri per dimensió del Big Five: on les diferències són més grans" (`self-other-agreement-big-five-where-gaps-are-biggest`)

### 6.1 «Acord jo-altri» (títol i tot l'article) — forma «altri»
- **Ubicació**: títol, H1 i ~totes les ocurrències.
- **Anglès**: "Self-other agreement".
- **Català actual**: «Acord jo-altri», «correlacions jo-altri», «diferència jo-altri».
- **Categoria**: TERMINOLOGIA/REGISTRE · **Gravetat**: BAIXA.
- **Proposta**: acceptable però convé fixar la forma: **«acord jo-altre»** (com fa l'article germà de conscienciositat, que enllaça «l'acord jo-altre: on les bretxes són més grans») per coherència inter-article; *altri* (= «altre, una altra persona», pronom indefinit) és normatiu però arcaïtzant i ací conviu amb «jo-altre» en l'altre article del lot.
- **Justificació**: *altri* existeix (DIEC2: «un altre, els altres»), per tant no és error; però l'enllaç intern de l'article `what-is-conscientiousness...` apunta a aquest mateix article amb el rètol «acord jo-altre». Incoherència terminològica inter-article: cal una sola forma. Recomanat «jo-altre» (transparent).

### 6.2 «però lluny de ser perfecte»
- **Ubicació**: 1r paràgraf del cos.
- **Anglès**: "they find agreement — but far from perfect agreement".
- **Català actual**: «troben acord, però lluny de ser perfecte».
- **Categoria**: FIDELITAT/AMBIGÜITAT · **Gravetat**: BAIXA.
- **Proposta**: «troben acord, però un acord lluny de ser perfecte» (o «...però que dista molt de ser perfecte»).
- **Justificació**: l'el·lipsi del nom («acord») deixa l'adjectiu «perfecte» sense ancoratge clar i fa que la concordança quedi en l'aire; reprendre el nom recupera la precisió de la font (*perfect agreement*).

### 6.3 «Les seves dades s'arrels en la tradició dels Cinc Grans»
- **Ubicació**: secció «El que mesura realment la recerca...», 2n paràgraf.
- **Anglès**: "Their data are grounded in the Big Five tradition".
- **Català actual**: «Les seves dades s'arrels en la tradició dels Cinc Grans, concretament en el marc NEO-PI».
- **Categoria**: ERRADA (gramàtica: nom/verb mal flexionat) · **Gravetat**: ALTA.
- **Proposta**: «Les seves dades s'arrelen en la tradició del Big Five, concretament en el marc NEO-PI» (o «tenen les arrels en...»).
- **Justificació**: «s'arrels» és agramatical (barreja el pronom *es* amb el substantiu plural *arrels*); el verb pronominal és **arrelar-se** → «s'arrelen». A més, *the Big Five tradition* s'havia traduït com a «Big Five» a la resta de l'article i de la col·lecció; «els Cinc Grans» és una traducció literal inusual i incoherent (el nom propi del model es manté: **Big Five**). Doble incidència (gramàtica + coherència terminològica).

### 6.4 «consistent amb la hipòtesi d'observabilitat» (cita) / «el trobament més important»
- **Ubicació**: secció «Profunditat (Neuroticisme)», 1r paràgraf.
- **Anglès**: "This is the most important finding for practical personality assessment".
- **Català actual**: «Aquest és el trobament més important per a l'avaluació pràctica de la personalitat».
- **Categoria**: ERRADA (lèxic/fals amic) · **Gravetat**: ALTA.
- **Proposta**: «Aquesta és la troballa més important per a l'avaluació pràctica de la personalitat» (o «el resultat / la descoberta més important»).
- **Justificació**: *finding* (resultat de recerca) = **troballa / resultat / descoberta**, no *trobament*. *Trobament* (poc usual; «acció de trobar-se, encontre») no designa un resultat científic. A més «Aquest és» concorda malament amb el femení «troballa»: «Aquesta és la troballa». Error lèxic + concordança.

### 6.5 «si et values com a molt extrovertit»
- **Ubicació**: secció «Presència (Extraversió)», 2n paràgraf.
- **Anglès**: "If you rate yourself as highly extraverted".
- **Català actual**: «Si et values com a molt extrovertit, els teus Testimonis poden verificar...».
- **Categoria**: REGISTRE/COHERÈNCIA (tractament) + TERMINOLOGIA · **Gravetat**: MITJANA.
- **Proposta**: model vós: «Si us valoreu com a molt extravertit, els vostres Testimonis poden verificar-ho...».
- **Justificació**: (a) tractament «tu» («et values», «els teus») trenca el model de vós i, sobretot, conviu amb passatges en vós dins el mateix article («hauríeu de ser cautelosos», «vegeu», «necessiteu»): incoherència interna evident (R5). (b) *values* hauria de ser «valores» (de *valorar*); «values» (de *valuar/avaluar*?) és confús; i «extrovertit» conviu amb «extravertit» en altres llocs: fixar **extravertit** (forma preferent DNV/DIEC2).

### 6.6 «extrovertit» vs «extravertit» (coherència)
- **Ubicació**: secció «Presència»: «molt extrovertit»; vs «Extraversió» a la resta.
- **Anglès**: "extraverted".
- **Català actual**: «extrovertit» (un cop) conviu amb «Extraversió» (general).
- **Categoria**: TERMINOLOGIA/COHERÈNCIA · **Gravetat**: BAIXA.
- **Proposta**: unificar a **extravertit / Extraversió** (arrel *-vert-* amb *a*).
- **Justificació**: tot i que «extrovertit» està documentat com a variant, el text fixa «Extraversió/extraversió» amb *a*; barrejar «extrovertit» és incoherent. Forma preferent normativa: extravertit.

### 6.7 «produint un baix acord jo-altri»
- **Ubicació**: secció «Profunditat», 3r paràgraf.
- **Anglès**: "producing low self-other agreement".
- **Català actual**: «produint un baix acord jo-altri no perquè cap de les perspectives sigui incorrecta».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: el gerundi de resultat ací és admissible perquè expressa conseqüència immediata lligada a l'acció; es registra per descartar-lo, atès que sovint és calc).

### 6.8 «figures d'acord jo-altri» (calc de *figures*)
- **Ubicació**: secció «Com els mètodes d'elecció forçada redueixen la diferència...», 2n paràgraf.
- **Anglès**: "the self-other agreement figures derived from forced-choice assessments".
- **Català actual**: «les figures d'acord jo-altri derivades de les avaluacions d'elecció forçada».
- **Categoria**: TERMINOLOGIA (fals amic) · **Gravetat**: MITJANA.
- **Proposta**: «les xifres / els valors d'acord jo-altre derivats de les avaluacions d'elecció forçada».
- **Justificació**: *figures* ací = «xifres / valors numèrics», no *figures* (il·lustracions/figures geomètriques). **Figura** en català no té el sentit de «dada numèrica»; és un fals amic. Cal «xifres» o «valors».

### 6.9 «el menor acord jo-altri» / «al final» (bottom)
- **Ubicació**: secció «La hipòtesi d'observabilitat...», 3r paràgraf.
- **Anglès**: "Neuroticism (low observability) at the bottom".
- **Català actual**: «Neuroticisme (baixa observabilitat) al final».
- **Categoria**: FIDELITAT · **Gravetat**: BAIXA.
- **Proposta**: «...Neuroticisme (baixa observabilitat) a baix / al capdavall» (en contrast amb «Extraversió ... al capdamunt»).
- **Justificació**: «al capdamunt» / «al final» trenquen el parell espacial *top/bottom* que la font construeix; com que el text ja diu «al capdamunt» per a *at the top*, el contrari natural és «a baix / al capdavall», no «al final» (que és temporal/seqüencial). Coherència de la metàfora.

### Resum quantitatiu Article 6
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (gramàtica, lèxic/fals amic, concordança) | 2 | – | – |
| TERMINOLOGIA/COHERÈNCIA (altri, figures, extravertit, Big Five) | – | 1 | 2 |
| REGISTRE (tractament) | – | 1 | – |
| FIDELITAT/AMBIGÜITAT | – | – | 2 |
| Total incidències | **2** | **2** | **4** |

---

## "Què és la conscienciositat (conscientiousness)? El predictor més consistent del rendiment laboral" (`what-is-conscientiousness-the-most-consistent-predictor-of-job-performance`)

### 7.1 «conscienciositat (conscientiousness)» glossat repetidament
- **Ubicació**: tot l'article (desenes d'ocurrències: títol, descripció, cossos, taules, CTA).
- **Anglès**: "Conscientiousness".
- **Català actual**: «conscienciositat (conscientiousness)» — el terme anglès entre parèntesis després de gairebé cada aparició.
- **Categoria**: REGISTRE/REDUNDÀNCIA · **Gravetat**: MITJANA.
- **Proposta**: glossar «(conscientiousness)» NOMÉS en la primera aparició (i, si de cas, a la fitxa de fonts); a la resta, usar només **conscienciositat**. En blog/ciència els noms acadèmics es permeten, però la repetició sistemàtica del parèntesi és soroll.
- **Justificació**: la duplicació constant entorpeix la lectura i no aporta informació nova després del primer ús. És pràctica de redacció, no de terminologia: una glossa inicial és suficient. (El terme català **conscienciositat** és correcte; *consciència* seria fals amic, per tant l'opció presa és adequada.)

### 7.2 «en qui es pot confiar» / «les persones amb alta conscienciositat en qui es pot confiar»
- **Ubicació**: secció «Per què la conscienciositat supera...», punt «Fiabilitat».
- **Anglès**: "Dutifulness means that high-Conscientiousness individuals can be counted on."
- **Català actual**: «La dutifulness significa que les persones amb alta conscienciositat (conscientiousness) en qui es pot confiar.»
- **Categoria**: ERRADA (oració sense verb principal) · **Gravetat**: ALTA.
- **Proposta**: «...significa que es pot confiar en les persones amb alta conscienciositat» (o «...que les persones amb alta conscienciositat són de fiar / mereixen confiança»).
- **Justificació**: la frase catalana no té verb principal a la subordinada: «les persones... en qui es pot confiar» és un sintagma nominal incomplet (manca «són de fiar» o cal reordenar). Tal com està, és agramatical. Error de construcció clar.

### 7.3 «no li agrada l'ambigüitat en els processos» (taula, Orderliness)
- **Ubicació**: taula de facetes, fila Orderliness.
- **Anglès**: "dislikes ambiguity in processes".
- **Català actual**: «...no li agrada l'ambigüitat en els processos».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: traducció natural i correcta; es registra per descartar-lo).

### 7.4 «permet conversations més precises»
- **Ubicació**: secció «Què mesura realment la conscienciositat al Big Five», final.
- **Anglès**: "it allows for more precise conversations".
- **Català actual**: «permet conversations més precises que les que permet una sola puntuació global».
- **Categoria**: ERRADA (castellanisme/errata) · **Gravetat**: ALTA.
- **Proposta**: «permet converses més precises que les que permet una sola puntuació global».
- **Justificació**: *conversations* és la forma anglesa (o creuament amb el cast. *conversaciones*); el plural català és **converses** (de *conversa*). Errata lèxica crua.

### 7.5 «microgestió o a la sobrefeina»
- **Ubicació**: secció «Quan l'alta conscienciositat es converteix en perfeccionisme», punt «Dificultat per delegar».
- **Anglès**: "This leads to micromanagement or overwork".
- **Català actual**: «Això porta a la microgestió o a la sobrefeina».
- **Categoria**: TERMINOLOGIA · **Gravetat**: BAIXA.
- **Proposta**: «...a la microgestió o a l'excés de feina / a la sobrecàrrega de treball».
- **Justificació**: *sobrefeina* no és forma lexicalitzada als diccionaris normatius (DNV/DIEC2); *overwork* es ret per «excés de feina», «sobrecàrrega de treball» o «excés de treball». «Microgestió» sí que és acceptable per a *micromanagement*. Derivat ad hoc evitable.

### 7.6 «els companys experimenten traspassos crònics perduts»
- **Ubicació**: CTA final «Mesura la teva puntuació de Discipline...».
- **Anglès**: "colleagues experience chronic missed handoffs".
- **Català actual**: «mentre els companys experimenten traspassos crònics perduts».
- **Categoria**: CALC/FIDELITAT · **Gravetat**: MITJANA.
- **Proposta**: «...mentre els companys pateixen / constaten incompliments crònics en els traspassos» (o «traspassos que es perden / fallen sistemàticament»).
- **Justificació**: «traspassos crònics perduts» és un calc opac de *chronic missed handoffs*: l'ordre i la tria lèxica fan ambigu el sentit («perduts» sembla qualificar «crònics»). Cal explicitar que són traspassos que fallen/s'incompleixen de manera crònica. A més «experimentar» per *experience* és aquí «patir/constatar». Pèrdua de claredat.

### 7.7 «La conscienciositat... és el predictor de rendiment laboral més extensament validat»
- **Ubicació**: CTA final, 1a frase.
- **Anglès**: "the most extensively validated predictor of job performance".
- **Català actual**: «el predictor de rendiment laboral més extensament validat».
- **Categoria**: REGISTRE/CALC · **Gravetat**: BAIXA.
- **Proposta**: «el predictor del rendiment laboral més validat / validat de manera més extensa / àmpliament validat».
- **Justificació**: «extensament» (de *extens*) és admissible però *extensively* aquí = «àmpliament, de manera exhaustiva»; «àmpliament validat» és més idiomàtic. A més, calc d'adverbi en *-ment* + participi calcat de l'estructura anglesa. Millora de naturalesa.

### 7.8 «tret amb valor funcional genuí» / «Self-discipline... quan les tasques es tornen tedioses»
- **Ubicació**: taula de facetes, fila Self-discipline.
- **Anglès**: "maintains effort when tasks become tedious".
- **Català actual**: «manté l'esforç quan les tasques es tornen tedioses».
- **Categoria**: correcte · **Gravetat**: — (fals positiu: «tediós» és normatiu (DIEC2/DNV) i «es tornen tedioses» és natural; es registra per descartar el dubte de castellanisme, infundat).

### Resum quantitatiu Article 7
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (sintaxi, errata lèxica) | 2 | – | – |
| CALC/FIDELITAT (handoffs) | – | 1 | – |
| TERMINOLOGIA (sobrefeina) | – | – | 1 |
| REGISTRE/REDUNDÀNCIA (glossa repetida, adverbi) | – | 1 | 1 |
| Total incidències | **2** | **2** | **2** |


## "Construir un equip des de zero: el que les dades de personalitat poden i no poden dir-te" (`building-a-team-from-scratch-what-personality-data-can-and-cant-tell-you`)

Article amb tractament de "tu" coherent al llarg de tot el text (*et proporciona*, *Utilitza-les*, *defineix*, *el teu equip*, *Comença la teva avaluació*). Segons el model de llengua de l'auditoria (vós), tot aquest tractament és incidència de REGISTRE; el tracto com una sola incidència transversal (1.1) per no inflar el recompte, i deixo la resta d'incidències per a errades pròpies.

### 1.1 Tractament de "tu" en lloc de "vós" (tot l'article)
- Anglès: "personality assessment gives you meaningful signal", "define what the team needs to do", "Start your free team assessment", "before your next team formation decision"
- Català actual: «et proporciona un senyal significatiu», «defineix el que l'equip ha de fer», «Comença la teva avaluació d'equip gratuïta», «abans de la teva propera decisió»
- Categoria: REGISTRE · Gravetat MITJANA
- Proposta: unificar a vós: «us proporciona», «definiu», «Comenceu la vostra avaluació d'equip gratuïta», «abans de la vostra propera decisió», etc.
- Justificació: el model de llengua de l'auditoria fixa el tractament de vós per a les crides al lector. L'article és internament coherent en "tu", però discrepa del model i d'altres articles de la col·lecció (p. ex. `personality-and-job-fit`, que sí usa vós). Cal unificar a vós.

### 1.2 «els autoinforme no sempre capturen» — concordança de nombre
- Anglès: "self-reports don't always accurately capture how others experience someone"
- Català actual: «els autoinforme no sempre capturen amb precisió com els altres experimenten algú»
- Categoria: ERRADA (concordança) · Gravetat ALTA
- Proposta: «els autoinformes no sempre capturen amb precisió...»
- Justificació: l'article «els» (plural) exigeix el substantiu en plural: *autoinformes*. «els autoinforme» és una falta de concordança de nombre objectiva (omissió de la -s del plural).

### 1.3 «Les dades de personalitat d'autoinforme captura» — concordança subjecte-verb
- Anglès: "Self-report personality data captures how people see themselves."
- Català actual: «Les dades de personalitat d'autoinforme captura com les persones es veuen a si mateixes.»
- Categoria: ERRADA (concordança) · Gravetat ALTA
- Proposta: «Les dades de personalitat d'autoinforme **capturen** com les persones es veuen a si mateixes.»
- Justificació: el subjecte és «Les dades» (plural); el verb ha de concordar en plural: *capturen*. La forma singular «captura» és un error de concordança. (En anglès «data ... captures» és singular perquè «data» s'hi tracta com a singular; en català «les dades» és plural.)

### 1.4 «Aquesta calibratge importa» — concordança de gènere
- Anglès: "This calibration matters"
- Català actual: «Aquesta calibratge importa»
- Categoria: ERRADA (gènere) · Gravetat ALTA
- Proposta: «Aquest calibratge importa» (o «Aquesta calibració importa»)
- Justificació: *calibratge* és masculí (DNV/DIEC2: «el calibratge»); el demostratiu femení «Aquesta» no hi concorda. O bé es manté el masculí amb «Aquest calibratge», o bé s'usa el femení *calibració* («Aquesta calibració»). Tal com està, hi ha discordança de gènere.

### 1.5 «reavualació» — errata
- Anglès: "Build in periodic reassessment"
- Català actual: «Incorpora una reavualació periòdica»
- Categoria: ERRADA (errata) · Gravetat ALTA
- Proposta: «Incorpora/Incorporeu una **reavaluació** periòdica»
- Justificació: «reavualació» és una errata tipogràfica evident; la forma correcta és *reavaluació* (re- + avaluació).

### 1.6 «a nivell d'equip» (×2: «el panorama a nivell d'equip», «composició a nivell d'equip»)
- Anglès: "the team-level picture", "team-level composition reports"
- Català actual: «mira el panorama a nivell d'equip», «informes de composició a nivell d'equip»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «el panorama a escala d'equip» / «de tot l'equip»; «informes de composició de l'equip / a escala d'equip»
- Justificació: locució «a nivell de» desaconsellada per les guies d'estil (Softcatalà, IEC) quan no expressa alçària física; es prefereix «a escala de», «en l'àmbit de» o un genitiu. Recurrent a la col·lecció.

### 1.7 «com a drecera» / «com un input» — coherència i manlleu
- Anglès: "Use it as one input in a structured hiring and onboarding process, not as a shortcut."
- Català actual: «Utilitza-les com un input en un procés estructurat de contractació i incorporació, no com a drecera.»
- Categoria: correcte · Gravetat — (sense incidència: «drecera» tradueix bé *shortcut* i «input» es manté com a manlleu igual que a la resta de la col·lecció; es registra per descartar fals positiu. Nota menor: «com un input ... com a drecera» barreja «com un» i «com a»; el model culte prefereix «com a input ... com a drecera», però no és error.)

### 1.8 «El tret descriu la tendència; el context forma l'expressió»
- Anglès: "The trait describes the tendency; context shapes the expression."
- Català actual: «El tret descriu la tendència; el context forma l'expressió.»
- Categoria: FIDELITAT/REGISTRE · Gravetat BAIXA
- Proposta: «...el context **configura/modela** l'expressió.»
- Justificació: *shape* aquí és "configurar/modelar", no "formar". «forma l'expressió» és literal i lleument fluix; «configura»/«modela» reprodueix millor el sentit (cf. la mateixa font usa «shapes»). Millora de precisió, no error dur.

### Resum quantitatiu — Article «building-a-team-from-scratch»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (concordança, errata) | 4 | – | – |
| REGISTRE (tractament, "a nivell de") | – | 1 | 1 |
| FIDELITAT (precisió lèxica) | – | – | 1 |
| Total incidències | **4** | **1** | **2** |

---

## "Avaluació de personalitat de tria forçada: per què produeix dades més honestes" (`forced-choice-personality-assessment-more-honest-data`)

Article tècnicament molt acurat. Usa "tu" només en exemples d'ítem citats («et descriu millor», «el teu perfil») i imperatius de crida («consulta», «Prova», «Llegeix»). Terminologia psicomètrica generalment correcta (*desitjabilitat social*, *psicomètrica*, *ipsativa*, *aquiescència*).

### 2.1 Tractament de "tu" en les crides i el cos
- Anglès: "If your profile shows high Presence...", "see [how personality test scores are calculated]", "Try a forced-choice...", "Read the full scientific rationale"
- Català actual: «Si el teu perfil mostra...», «consulta [com es calculen...]», «Prova una avaluació...», «Llegeix la justificació científica completa»
- Categoria: REGISTRE · Gravetat MITJANA
- Proposta: unificar a vós: «Si el vostre perfil mostra...», «consulteu», «Proveu una avaluació...», «Llegiu la justificació...». (Els ítems citats entre cometes — «Quina d'aquestes paraules et descriu millor?» — poden mantenir el "tu" perquè són exemples literals d'un test autoadministrat.)
- Justificació: model de llengua de vós per a les crides al lector; coherència amb la col·lecció.

### 2.2 «estan principiats» — calc de *principled*
- Anglès: "The pairs are not arbitrary; they are principled."
- Català actual: «Els parells no són arbitraris; estan principiats.»
- Categoria: CALC (fals amic) · Gravetat ALTA
- Proposta: «Els parells no són arbitraris; estan **construïts segons principis** / **responen a principis** / **estan fonamentats**.»
- Justificació: *principled* aquí vol dir "basat en principis, fonamentat metòdicament". «principiat» en català (participi de *principiar* = "començar") significa "iniciat/començat", no "fonamentat en principis": és un fals amic que canvia totalment el sentit. La traducció correcta és perifràstica («construïts segons principis», «fonamentats»).

### 2.3 «estimatives» — castellanisme/errata per *estimacions*
- Anglès: "can recover more normative-like estimates from forced-choice data"
- Català actual: «poden recuperar estimatives més semblants a les normatives»
- Categoria: TERMINOLOGIA/CALC (castellanisme) · Gravetat ALTA
- Proposta: «poden recuperar **estimacions** més semblants a les normatives»
- Justificació: el substantiu català per a *estimate* (valor estimat) és **estimació**. «estimativa» no és el terme estadístic català (sembla creuament amb el cast./adjectiu *estimativo*); en aquest mateix article, més amunt, ja es diu correctament «produeixen **estimacions** més normatives». Cal unificar a *estimacions*.

### 2.4 «TRI de Thurstone» vs sigla TRI/IRT — coherència
- Anglès: "IRT-based approaches (Thurstonian IRT, as developed by Brown and Maydeu-Olivares)" / "such as IRT-based scoring"
- Català actual: «enfocaments basats en TRI (TRI de Thurstone...)» i, més amunt, «la puntuació basada en TRI»
- Categoria: correcte · Gravetat — (sense incidència: *TRI* = «teoria de resposta a l'ítem» és la sigla catalana correcta de l'IRT anglès, usada de manera coherent; «TRI de Thurstone» tradueix bé «Thurstonian IRT». Es registra per descartar fals positiu i confirmar coherència.)

### 2.5 «la selecció principiada de parells d'adjectius psicomètricament»
- Anglès: "the theoretical grounding for psychometrically principled adjective pair selection"
- Català actual: «la fonamentació teòrica per a la selecció principiada de parells d'adjectius psicomètricament»
- Categoria: CALC + AMBIGÜITAT · Gravetat MITJANA
- Proposta: «la fonamentació teòrica per a una selecció de parells d'adjectius **fonamentada en principis psicomètrics**»
- Justificació: doble problema. (a) «principiada» repeteix el calc de 2.2 (*principled*). (b) L'adverbi «psicomètricament» queda penjat al final, lluny del nucli que modifica («principled»), i resulta ambigu/feixuc; cal reordenar perquè «psicomètric» qualifiqui els principis. Reformulació: «fonamentada en principis psicomètrics».

### 2.6 «mides de mostra substancials»
- Anglès: "require substantial sample sizes to calibrate accurately"
- Català actual: «requereixen mides de mostra substancials per calibrar-se amb precisió»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: acceptable; alternativa més habitual en estadística catalana: «**mostres de mida considerable / gran**» o «mides de mostra grans». «substancials» és tolerable. Sense canvi obligatori; es registra com a possible millora de naturalesa.
- Justificació: *substantial sample sizes* en català tècnic se sol dir «mostres grans/de mida considerable»; «substancials» és comprensible però lleugerament calcat.

### 2.7 «esbiaixaran les seves respostes cap a ella»
- Anglès: "will skew their responses toward it"
- Català actual: «esbiaixaran les seves respostes cap a ella»
- Categoria: correcte · Gravetat — (sense incidència: *esbiaixar* és el verb català correcte per *to skew/bias*; el possessiu «seves» és normatiu. Es registra perquè podria semblar dubtós però és correcte.)

### Resum quantitatiu — Article «forced-choice-personality-assessment»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| CALC (fals amic "principiat") | 1 | 1 | – |
| TERMINOLOGIA/CALC (estimatives, mides de mostra) | 1 | – | 1 |
| REGISTRE (tractament) | – | 1 | – |
| Total incidències | **2** | **2** | **1** |

---

## "Cultura d'innovació i personalitat: el que les empreses fan malament" (`innovation-culture-and-personality-what-companies-get-wrong`)

Article amb diversos castellanismes residuals (*tienen*, *luego*, *son*, *novedoses*, *apertura*) i tractament de "tu". Capçaleres de secció amb majúscules a totes les paraules (estil de títol anglès), que en català culte no és la convenció, però ho deixo com a observació estilística no penalitzada perquè afecta tota la col·lecció.

### 3.1 «tienen menys d'aquestes col·lisions» — castellanisme cru
- Anglès: "have fewer such collisions"
- Català actual: «Les organitzacions cognitivament homogènies ... tienen menys d'aquestes col·lisions.»
- Categoria: ERRADA/CALC (castellanisme) · Gravetat ALTA
- Proposta: «**tenen** menys d'aquestes col·lisions»
- Justificació: «tienen» és la forma castellana del verb; el català és **tenen**. Castellanisme cru evident (probable error de redacció/MT no revisada).

### 3.2 «i luego apliquen la mateixa lògica» — castellanisme cru
- Anglès: "and then apply the same selection logic to everyone"
- Català actual: «...alta Disciplina, alt Bond, Presència moderada— i luego apliquen la mateixa lògica de selecció a tothom»
- Categoria: ERRADA/CALC (castellanisme) · Gravetat ALTA
- Proposta: «i **després/llavors** apliquen la mateixa lògica de selecció a tothom»
- Justificació: «luego» és castellà; en català, *després* o *llavors*. Castellanisme cru (Optimot/Softcatalà). [Optimot; Softcatalà].

### 3.3 «Les persones que també son moderadament altes» — accent diacrític
- Anglès: "People who are also moderately high in Depth..."
- Català actual: «Les persones que també son moderadament altes en Profunditat»
- Categoria: ERRADA (accentuació) · Gravetat ALTA
- Proposta: «...que també **són** moderadament altes...»
- Justificació: la 3a persona del plural del verb ésser s'escriu amb accent: **són**. «son» sense accent és el substantiu (la son / el son) o el possessiu castellà. Error ortogràfic. (Apareix correctament «Soc/són» en altres articles.)

### 3.4 «solucions novedoses» / «Les solucions novedoses» — castellanisme
- Anglès: "Novel solutions tend to emerge..."
- Català actual: «Les solucions novedoses tendeixen a emergir de la col·lisió...»
- Categoria: TERMINOLOGIA/CALC (castellanisme) · Gravetat ALTA
- Proposta: «Les solucions **noves / innovadores / originals** tendeixen a sorgir...»
- Justificació: **novedós/novedosa** és un castellanisme (de *novedoso*); l'Optimot recomana *nou, innovador, original*. No és normatiu en català. [Optimot, fitxa «novedós»]. (Nota: el mateix article tradueix bé *novel* per «no convencionals» en altres punts; cal unificar evitant «novedós».)

### 3.5 «apertura a l'Experiència» / «l'apertura a l'experiència» — castellanisme terminològic
- Anglès: "Openness to Experience" / "what is openness to experience"
- Català actual: «**Apertura** a l'Experiència» (secció Tolerància al fracàs i enllaços) conviu amb «**Obertura**» (la resta del text)
- Categoria: TERMINOLOGIA (castellanisme) + COHERÈNCIA · Gravetat ALTA
- Proposta: unificar a **Obertura** a l'experiència: «Obertura a l'Experiència», «què és l'obertura a l'experiència».
- Justificació: el terme català de la dimensió Big Five és **Obertura (a l'experiència)**; *apertura* és castellanisme (DNV/DIEC: *obertura*). A més, el text barreja «Apertura» i «Obertura» dins del mateix article (el cos diu «l'Obertura (Visió)»), cosa que és incoherent. Cal *Obertura* a tot arreu, inclòs el text d'enllaç.

### 3.6 «el pensament impuls per l'empatia» — errada de redacció
- Anglès: (paral·lel a tech) "empathy-driven thinking"
- Català actual: «Els membres d'alt Bond aporten el pensament impuls per l'empatia»
- Categoria: ERRADA (sintaxi/redacció) · Gravetat ALTA
- Proposta: «aporten el **pensament impulsat per l'empatia**» (o «el pensament guiat per l'empatia»)
- Justificació: «el pensament impuls per l'empatia» és agramatical: falta el participi *impulsat* (calc de *empathy-driven* mal resolt). Cal «pensament impulsat/guiat per l'empatia». L'article tècnic paral·lel ho diu correctament: «el pensament impuls per l'empatia» també hi apareix igual — vegeu nota a `personality-diversity-in-technical-teams` 5.x.

### 3.7 «aquella fricció és el punt» — calc idiomàtic
- Anglès: "But in innovation contexts, that friction is the point."
- Català actual: «Però en contextos d'innovació, aquesta fricció és el punt.»
- Categoria: CALC (idiomàtic) · Gravetat MITJANA
- Proposta: «...aquesta fricció és **justament la qüestió / precisament la idea / l'objectiu**.»
- Justificació: «és el punt» calca *is the point*; en català «el punt» no té aquest valor idiomàtic. Mateix calc documentat a 05-blog (Article 4.8). Cal «la qüestió / la idea».

### 3.8 «sobre-enginyeregen per a fallades poc probables»
- Anglès: "over-engineer for unlikely failures"
- Català actual: «Els equips uniformement d'alta Profunditat sobre-enginyeregen per a fallades poc probables»
- Categoria: ERRADA (morfologia verbal) + CALC · Gravetat MITJANA
- Proposta: «**sobreenginyeren** / fan sobreenginyeria per a fallades poc probables» (millor: «dissenyen amb una complexitat excessiva per a...»)
- Justificació: «sobre-enginyeregen» és una forma verbal inexistent i mal conjugada (a més, el prefix *sobre-* s'aglutina sense guionet: *sobreenginyer-*). El verb derivat d'enginyeria seria *(sobre)enginyar*; la 3a pers. pl. seria «sobreenginyen», no «*sobre-enginyeregen». Millor encara, perifrasi: «dissenyen amb complexitat excessiva». Nota: aquest fragment apareix gairebé idèntic a `personality-diversity-in-technical-teams` («sobre-enginyeregen»).

### 3.9 Tractament de "tu" (crides i cos)
- Anglès: "Cèrcol makes your team's personality map visible", "Understanding that map is the first step", "Start your free team assessment", "your team", "diagnosing the dynamics of your team"
- Català actual: «Cèrcol fa visible el mapa de personalitat del teu equip», «Comença la teva avaluació gratuïta de l'equip», «abans de diagnosticar les dinàmiques del teu equip»
- Categoria: REGISTRE · Gravetat MITJANA
- Proposta: unificar a vós: «el mapa de personalitat del vostre equip», «Comenceu la vostra avaluació gratuïta», «abans de diagnosticar les dinàmiques del vostre equip».
- Justificació: model de vós; coherència de col·lecció.

### 3.10 «s'autocensuren» / «autocensurar» — correcte
- Anglès: "self-censor"
- Català actual: «els individus dominants en Visió s'autocensuren», «són ... propensos a autocensurar»
- Categoria: correcte · Gravetat — (sense incidència: prefix *auto-* aglutinat correctament, verb ben format. Es registra per contrast amb «sobre-enginyeregen», que sí que erra el prefix.)

### 3.11 «emergir de la col·lisió» — ús intransitiu correcte
- Anglès: "tend to emerge from the collision of different mental models"
- Català actual: «Les solucions novedoses tendeixen a emergir de la col·lisió de diferents models mentals»
- Categoria: correcte · Gravetat — (sense incidència: ací *emergir* és intransitiu ("emergir DE"), que és l'ús normatiu; contrasta amb l'error transitiu detectat a 05-blog Article 3.4. Es registra per confirmar que aquí és correcte.)

### Resum quantitatiu — Article «innovation-culture-and-personality»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA/CASTELLANISME (tienen, luego, son, apertura, "pensament impuls") | 5 | – | – |
| TERMINOLOGIA (novedoses) | — (comptat com castellanisme dins ERRADA) | – | – |
| CALC (és el punt) | – | 1 | – |
| ERRADA morfològica + CALC (sobre-enginyeregen) | – | 1 | – |
| REGISTRE (tractament) | – | 1 | – |
| Total incidències | **5** | **3** | **0** |

---

## "Personalitat i adequació laboral: com pensar sobre l'adequació persona-entorn" (`personality-and-job-fit-how-to-think-about-person-environment-fit`)

Article que sí adopta el tractament de **vós** de manera coherent (*Vegeu, Poseu en Pràctica, Obteniu el vostre perfil, Hauríeu de contractar, esteu pensant*), alineat amb el model de l'auditoria. Bon model per a la resta de la col·lecció. Incidències menors.

### 4.1 «No es mapeja clarament al Big Five» / «com els trets Big Five es mapegen» — calc lèxic
- Anglès: "It does not map cleanly onto the Big Five" / "how Big Five traits map to career domains"
- Català actual: «No es mapeja clarament al Big Five»; «com els trets Big Five es mapegen als dominis professionals»
- Categoria: CALC (anglicisme lèxic) · Gravetat MITJANA
- Proposta: «No es **correspon clarament amb** el Big Five»; «com els trets Big Five **es relacionen amb / es projecten sobre** els dominis professionals»
- Justificació: *to map onto* aquí és "correspondre's amb / projectar-se sobre". El verb «mapejar» (de *map*) és un calc poc establert en aquest sentit figurat; en context psicomètric culte es prefereix «correspondre's amb», «relacionar-se amb» o «projectar-se sobre». (S'usa també «es mapegen» a l'article de tria forçada i als tècnics; recurrent.) Gravetat MITJANA perquè és comprensible però calcat.

### 4.2 «r = 0.32» / «r = 0.26» / «r = 0.19» — separador decimal
- Anglès: "r = 0.32" (etc.)
- Català actual: «r = 0.32», «r = 0.26», «r = 0.19» (targetes d'estadística) i, al cos, «correlació d'aproximadament .20»
- Categoria: ERRADA (convenció tipogràfica) · Gravetat BAIXA
- Proposta: usar la coma decimal catalana: «r = 0,32», «r = 0,26», «r = 0,19».
- Justificació: en català la convenció decimal és la **coma** (cf. l'article de tria forçada, que escriu «4,2 en Conscienciositat», i `building-a-team`, «*r* = .19» a l'anglès). Ací conviuen «0.32» (punt) amb «.20» (estil anglosaxó). Cal unificar al punt decimal català = coma. Gravetat BAIXA però recurrent i incoherent dins del mateix article.

### 4.3 «Per Que Contractar per Adequació Pot Fallar» / «Per Que l'Adequació...» — errata en titulars
- Anglès: "Why Hiring for Fit Can Backfire" / "Why Team-Level Personality Fit Matters..."
- Català actual: títols de secció «Adequació vs. Adaptabilitat: Per **Que** Contractar per Adequació Pot Fallar» i «Per **Que** l'Adequació de Personalitat a Nivell d'Equip Importa Més...»
- Categoria: ERRADA (ortografia, accent) · Gravetat ALTA
- Proposta: «Per **Què** Contractar...», «Per **Què** l'Adequació...»
- Justificació: en una interrogativa/causal indirecta amb valor de "per quina raó", cal **per què** (amb accent). «per que» sense accent és incorrecte ací. Error visible en dos titulars de secció.

### 4.4 «el pas més accionable» — calc (anglicisme)
- Anglès: "the most actionable step is seeing the full picture"
- Català actual: «el pas més accionable és veure el quadre complet»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «el pas més **útil / pràctic / aplicable** és veure el quadre complet» (o «el primer pas concret»)
- Justificació: *accionable* (sentit *actionable* = "sobre el qual es pot actuar") és un calc; en català *accionable* significa "que es pot accionar (un mecanisme)". Glossari de l'auditoria: → «aplicable». Mateix calc documentat a 05-blog (3.9).

### 4.5 «a nivell d'equip» / «a nivell individual» — locució desaconsellada (recurrent)
- Anglès: "at the team level" / "the individual level" / "team-level fit assessment"
- Català actual: «pensar sobre l'adequació de personalitat a nivell d'equip — en lloc del nivell individual»; «Avaluació de l'Adequació a Nivell d'Equip»; «L'adequació laboral Big Five funciona millor a nivell d'equip» (descripció)
- Categoria: REGISTRE · Gravetat BAIXA
- Proposta: «a escala d'equip ... en lloc de l'escala individual»; «...a escala d'equip».
- Justificació: «a nivell de» desaconsellat quan no és alçària física; preferir «a escala de» / «en l'àmbit de». Recurrent (apareix també a la descripció i a diversos títols).

### 4.6 «constructes distincts» — errata
- Anglès: "These are distinct constructs"
- Català actual: «Aquests són constructes distincts amb predictors i resultats diferents.»
- Categoria: ERRADA (errata) · Gravetat MITJANA
- Proposta: «constructes **distints**»
- Justificació: «distincts» és una errata (creuament amb l'anglès *distinct* / la forma verbal). L'adjectiu català és **distint -a -s -es**: «constructes distints».

### 4.7 «les persones són més feliços i productius» — concordança de gènere
- Anglès: "people are happiest and most productive when..."
- Català actual: «les persones són més feliços i productius quan el seu tipus personal coincideix...»
- Categoria: ERRADA (concordança de gènere) · Gravetat ALTA
- Proposta: «les persones són més **felices i productives**...»
- Justificació: el subjecte «les persones» és femení plural; els adjectius han de concordar en femení: *felices, productives*. «feliços i productius» (masculí) és una falta de concordança objectiva.

### 4.8 «el marc paraigua» / «el terme paraigua» — calc
- Anglès: "the umbrella term for a family of theories"
- Català actual: «L'adequació persona-entorn (PE) és el terme paraigua per a una família de teories»
- Categoria: CALC (calc lèxic) · Gravetat BAIXA
- Proposta: «el **terme genèric / global / general** per a una família de teories»
- Justificació: «terme paraigua» calca *umbrella term*; en català culte es prefereix «terme genèric / general / global». Comprensible però calcat; millora de naturalesa.

### Resum quantitatiu — Article «personality-and-job-fit»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (per què, concordança, distincts) | 2 | 1 | – |
| CALC (mapejar, accionable, terme paraigua) | – | 2 | 1 |
| REGISTRE/tipografia ("a nivell de", decimals) | – | – | 2 |
| Total incidències | **2** | **3** | **3** |

---

## "Diversitat de personalitat en equips tècnics: per què importa l'amplitud cognitiva" (`personality-diversity-in-technical-teams`)

Article amb tractament de "tu" i alguns castellanismes/errades. Manté en anglès els noms de facetes/dimensions (Bond, Visió, Disciplina, Presència, Profunditat), cosa coherent amb la marca Cèrcol.

### 5.1 «aporten el pensament impuls per l'empatia» — errada de redacció
- Anglès: "High-Bond team members bring empathy-driven thinking"
- Català actual: «Els membres d'alt Bond aporten el pensament impuls per l'empatia»
- Categoria: ERRADA (sintaxi) + CALC · Gravetat ALTA
- Proposta: «aporten el **pensament impulsat per l'empatia**» (o «guiat per l'empatia»)
- Justificació: falta el participi: *empathy-driven* = «impulsat/guiat per l'empatia». «pensament impuls per l'empatia» és agramatical (substantiu *impuls* on cal participi *impulsat*). Error idèntic al de `innovation-culture` 3.6.

### 5.2 «sobre-enginyeregen per a fallades poc probables» — morfologia + prefix
- Anglès: "uniformly high-Depth teams over-engineer for unlikely failures"
- Català actual: «Els equips uniformement d'alta Profunditat sobre-enginyeregen per a fallades poc probables»
- Categoria: ERRADA (morfologia verbal + prefix) · Gravetat ALTA
- Proposta: «**sobreenginyeren** / fan sobreenginyeria / dissenyen amb una complexitat excessiva per a fallades poc probables»
- Justificació: «sobre-enginyeregen» és una forma verbal inexistent i mal conjugada; a més, *sobre-* s'aglutina sense guionet. Cal reformular (vegeu `innovation-culture` 3.8). Recurrent a la col·lecció.

### 5.3 «La millor calibratge del risc» — concordança de gènere
- Anglès: "The best risk calibration comes from teams..."
- Català actual: «La millor calibratge del risc prové d'equips amb prou variança de Profunditat»
- Categoria: ERRADA (gènere) · Gravetat ALTA
- Proposta: «**El millor calibratge** del risc...» (o «La millor calibració del risc...»)
- Justificació: *calibratge* és masculí; «La millor calibratge» discorda en gènere. Cf. mateixa errada a `building-a-team` 1.4 («Aquesta calibratge»). Cal masculí (*el calibratge*) o el femení *calibració*.

### 5.4 «solucions arquitectòniques més novedoses» — castellanisme
- Anglès: "produce more novel architectural solutions"
- Català actual: «produeixen solucions arquitectòniques més novedoses»
- Categoria: TERMINOLOGIA/CALC (castellanisme) · Gravetat ALTA
- Proposta: «solucions arquitectòniques més **noves / originals / innovadores**»
- Justificació: **novedós** és castellanisme; Optimot recomana *nou/original/innovador*. [Optimot, «novedós»]. Recurrent (vegeu `innovation-culture` 3.4).

### 5.5 «El disseny de sistemes requereix comprendre els models mentals dels usuaris»
- Anglès: "System design requires understanding user mental models."
- Català actual: «El disseny de sistemes requereix comprendre els models mentals dels usuaris.» (al títol/encapçalament: «El disseny de sistemes» però el text inicial diu «disseny de **sistemes**»; al primer paràgraf apareix «El disseny de **sistemes**»)
- Categoria: correcte · Gravetat — (sense incidència real; nota: l'original CA diu «El disseny de sistemes» correctament. Es registra per descartar fals positiu, ja que «sistemes» és el plural correcte de *sistema*.)

### 5.6 «els protocols de comunicació simplement no salven la bretxa» — calc lleu
- Anglès: "the communication protocols simply don't bridge the gap"
- Català actual: «els protocols de comunicació simplement no salven la bretxa»
- Categoria: CALC · Gravetat BAIXA
- Proposta: «no **superen / no fan pont sobre / no tanquen** la bretxa»
- Justificació: *bridge the gap* = "salvar/superar/tancar la distància". «salvar la bretxa» és comprensible (salvar = superar un obstacle), però en combinació amb «bretxa» resulta lleugerament calcat; «superar/tancar la bretxa» és més transparent. Millora de naturalesa.

### 5.7 «la contactació proactiva» — (no en aquest article) / «cognitivament estrets» — correcte
- Català actual: «equips tècnicament capaços però cognitivament estrets»
- Categoria: correcte · Gravetat — (sense incidència: «cognitivament estrets» tradueix bé *cognitively narrow*; es registra per descartar fals positiu.)

### 5.8 «el pensament impuls» (vegeu 5.1) i «Tots dos es comporten autènticament» — correcte
- Anglès: "Both are behaving authentically"
- Català actual: «Tots dos es comporten autènticament — els protocols de comunicació simplement no salven la bretxa.»
- Categoria: correcte · Gravetat — (sense incidència; ben travat.)

### 5.9 Tractament de "tu"
- Anglès: "before diagnosing the dynamics of your team", "what kind of diversity your technical team lacks", "Start mapping your team's personality composition"
- Català actual: «abans de diagnosticar les dinàmiques del teu equip», «quina mena de diversitat li manca al teu equip tècnic», «Comença a mapejar la composició de personalitat del teu equip»
- Categoria: REGISTRE · Gravetat MITJANA
- Proposta: unificar a vós: «...del vostre equip», «...al vostre equip tècnic», «Comenceu a mapar la composició...».
- Justificació: model de vós; coherència de col·lecció.

### Resum quantitatiu — Article «personality-diversity-in-technical-teams»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (sintaxi, morfologia, gènere) | 3 | – | – |
| TERMINOLOGIA/CALC (novedoses) | 1 | – | – |
| CALC (salvar la bretxa) | – | – | 1 |
| REGISTRE (tractament) | – | 1 | – |
| Total incidències | **4** | **1** | **1** |

---

## "Hauries de contractar per encaix de personalitat o per diversitat de personalitat?" (`should-you-hire-for-personality-fit-or-personality-diversity`)

Article amb tractament de "tu" i un castellanisme ortogràfic recurrent (*arriscca/arriscquen*). Manté en anglès els noms de dimensions amb una grafia anglesa (Openness, Conscientiousness, Agreeableness, Vision, Bond, Discipline, Presence) barrejada amb les catalanes/Cèrcol; vegeu 6.3.

### 6.1 «arриscca» / «arriscquen» — errata ortogràfica recurrent
- Anglès: "risks groupthink" / "teams ... risk groupthink" / "they pay coordination costs"
- Català actual: «però **arriscca** el pensament grupal» (descripció), «però **arriscquen** el pensament grupal i els punts cecs», «—però **arriscquen** el pensament grupal»
- Categoria: ERRADA (ortografia) · Gravetat ALTA
- Proposta: «però **arrisca** el pensament grupal», «però **arrisquen** el pensament grupal»
- Justificació: el verb és *arriscar*; 3a sing. **arrisca**, 3a pl. **arrisquen** (la c→qu davant de e/i, sense doble c). «arriscca»/«arriscquen» són errates ortogràfiques (consonant duplicada incorrecta). Apareix ja a la descripció (molt visible) i ×2 al cos.

### 6.2 «Un equip d'alta Discipline i baixa Vision» — barreja de noms anglesos sense flexió
- Anglès: "A high-Discipline, low-Vision team..."
- Català actual: «Un equip d'alta **Discipline** i baixa **Vision** executa de manera fiable»; «Un equip d'alt Bond i baixa **Presence**»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: usar les formes Cèrcol catalanes que la resta de la col·lecció empra: «alta **Disciplina** i baixa **Visió**», «alt **Vincle/Bond** i baixa **Presència**». Triar UNA convenció (anglesa o catalana) per a tota la col·lecció.
- Justificació: dins del mateix article conviuen «Discipline/Vision/Presence/Agreeableness/Openness/Conscientiousness» (anglès) amb la resta d'articles del lot que usen «Disciplina/Visió/Presència» (català Cèrcol). Incoherència de marca terminològica. A `building-a-team`, `innovation-culture` i `tech-teams` s'usen majoritàriament les formes catalanes (Visió, Disciplina, Presència, Profunditat) amb l'anglès entre parèntesis. Cal unificar.

### 6.3 «La caveat crítica» — castellanisme/anglicisme + gènere
- Anglès: "The critical caveat"
- Català actual: títol de secció «La caveat crítica» i cos coherent
- Categoria: TERMINOLOGIA (manlleu no adaptat) · Gravetat MITJANA
- Proposta: «**L'advertència crítica**» / «La matisació important» / «La salvetat crítica»
- Justificació: *caveat* és un llatinisme vehiculat per l'anglès, no lexicalitzat en català culte divulgatiu; cal traduir-lo per «advertència», «salvetat» o «matisació». A més, com a manlleu cru, el gènere és arbitrari («La caveat»); millor evitar-lo.

### 6.4 «convergeixen prematurament en el consens» — correcte
- Anglès: "converge prematurely on consensus"
- Català actual: «suprimeixen el dissentiment i convergeixen prematurament en el consens»
- Categoria: correcte · Gravetat — (sense incidència: *dissentiment*, *convergir en* i *prematurament* són correctes i fidels. Es registra per descartar fals positiu.)

### 6.5 «l'estàs llegint» — fidelitat i tractament
- Anglès: "[Should you hire for personality fit or diversity?] — you're reading it — but the framing of 'fit'..."
- Català actual: «[Hauries de contractar per encaix de personalitat o diversitat?](...) — **l'estàs llegint** — però el marc de l'"encaix"...»
- Categoria: REGISTRE (tractament) · Gravetat MITJANA
- Proposta: amb vós: «—**l'esteu llegint**—». (La fidelitat és bona; només cal el canvi de tractament.)
- Justificació: *you're reading it* es tradueix fidelment, però en "tu"; cal vós («l'esteu llegint») per coherència de model. S'inclou dins la incidència de tractament global (6.6), però es destaca perquè és una autoreferència molt visible.

### 6.6 Tractament de "tu" (títol, crides i cos)
- Anglès: "Should you hire...", "what your team specifically needs", "Take the free team assessment", "before your next hire", "given the people we have, what do we need more of"
- Català actual: «**Hauries** de contractar...», «què necessita específicament **el teu equip**», «**Fes** l'avaluació gratuïta de l'equip», «abans de la **teva** pròxima contractació»
- Categoria: REGISTRE · Gravetat MITJANA
- Proposta: unificar a vós: «**Hauríeu** de contractar...» (com fa l'article `personality-and-job-fit`, que enllaça aquest mateix títol com «Hauríeu de contractar...»), «el **vostre** equip», «**Feu** l'avaluació», «abans de la **vostra** pròxima contractació».
- Justificació: model de vós. A més, hi ha incoherència inter-article flagrant: `personality-and-job-fit` cita aquest article amb el títol «**Hauríeu** de contractar...» (vós), però el títol real de l'article és «**Hauries** de contractar...» (tu). Cal unificar el títol a vós.

### 6.7 «pensament grupal» — terme, correcte
- Anglès: "groupthink"
- Català actual: «pensament grupal» (i enllaç a «El pensament grupal des d'una perspectiva de personalitat»)
- Categoria: correcte · Gravetat — (sense incidència: *pensament grupal* és la traducció catalana acceptada de *groupthink*, usada de manera coherent. Es registra per descartar fals positiu.)

### Resum quantitatiu — Article «should-you-hire-for-personality-fit-or-personality-diversity»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (arriscca/arriscquen) | 1 | – | – |
| TERMINOLOGIA/COHERÈNCIA (noms anglesos, caveat) | – | 2 | – |
| REGISTRE (tractament tu/vós, "l'estàs llegint") | – | 2 | – |
| Total incidències | **1** | **4** | **0** |

---

## "Què és l'extraversió (extraversion)? Més enllà del binari introvertit-extravertit" (`what-is-extraversion-beyond-the-introvert-extrovert-binary`)

Article ben treballat. Manté en anglès els noms de facetes (Warmth, Gregariousness, Assertiveness...) i la dimensió Cèrcol Presence, cosa coherent amb la marca. Inclou el glossari «(extraversion)» entre parèntesis després de cada «extraversió», que és una decisió SEO/editorial reiterativa però no és incidència filològica.

### 7.1 «Tingueu en compte» / «Tingueu» vs imperatius en "tu" — coherència de tractament
- Anglès: "Note that leadership emergence is not the same as..." / "see [...]" / "Find your Presence score"
- Català actual: «**Tingueu** en compte que l'emergència de lideratge no és el mateix...», «**vegeu** [...]» (vós) conviuen amb «Troba la teva puntuació de Presence», «com **et** presentes a tu mateix», «la **teva** Presence», «treballant amb **tu**» (tu)
- Categoria: REGISTRE/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar a vós a tot l'article: «**Trobeu** la vostra puntuació de Presence», «com **us** presenteu», «la **vostra** Presence», «treballant amb **vós**».
- Justificació: l'article barreja vós (Tingueu, vegeu, Tingueu en compte) amb tu (Troba, et presentes, la teva, amb tu) dins del mateix text. Incoherència interna de tractament, a banda de la discrepància amb el model de vós. Cal triar vós i aplicar-lo de manera uniforme.

### 7.2 «la contactació proactiva» — castellanisme/forma inexistent
- Anglès: "the proactive outreach that sales roles require"
- Català actual: «la construcció de relacions i la **contactació** proactiva que requereixen els rols de vendes»
- Categoria: ERRADA/CALC (forma inexistent) · Gravetat ALTA
- Proposta: «la **presa de contacte** proactiva / el **contacte proactiu** / l'**acostament** proactiu (als clients)»
- Justificació: «contactació» no és un mot català normatiu (ni DNV ni DIEC2 el recullen; sembla un calc de *contacto/contactación* o una nominalització forçada de *contactar*). *Outreach* es tradueix per «presa de contacte», «contacte (proactiu)», «acostament», «captació». Cal substituir-lo.

### 7.3 «assertivitat» vs faceta «Assertiveness» — coherència
- Anglès: "The facets of assertiveness and positive affect are particularly implicated" / faceta «Assertiveness»
- Català actual: a la taula, faceta «**Assertiveness**» (anglès); al cos, «Les facetes d'**assertivitat** i afecte positiu», «Warmth, **assertivitat** i afecte positiu»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: decidir una forma. Si les facetes es mantenen en anglès a la taula (Warmth, Assertiveness...), al cos caldria referir-s'hi igual («la faceta Assertiveness») o, si es catalanitza, usar «assertivitat» de manera sistemàtica i també a la taula. Ara hi ha «Assertiveness» (taula) i «assertivitat» (cos).
- Justificació: coherència terminològica intra-article. *Assertivitat* és correcte en català (DNV/DIEC: *assertiu* → *assertivitat*); el problema és la barreja anglès/català de la mateixa faceta.

### 7.4 «afecte positiu» — fidelitat (correcte)
- Anglès: "positive affect" / faceta "Positive emotions"
- Català actual: «afecte positiu» (cos) i faceta «Positive emotions» (taula)
- Categoria: correcte · Gravetat — (sense incidència: *positive affect* = «afecte positiu» és el terme psicològic català correcte; no s'ha de confondre amb *afecció*. Es registra per descartar fals positiu.)

### 7.5 «s'alimenten de — i es senten atrets per — la interacció social»
- Anglès: "feed on — and are drawn to — social interaction"
- Català actual: «s'alimenten de — i es senten atrets per — la interacció social, els entorns actius i la varietat»
- Categoria: correcte · Gravetat — (sense incidència: traducció fidel i natural; el doble incís amb guions llargs reprodueix l'original. Es registra per descartar fals positiu. Nota d'estil: la convenció catalana preferiria guió llarg sense espais o ratlla, però segueix l'estil de la font.)

### 7.6 «2× més sensibilitat a la dopamina» — fidelitat (sense font anglesa equivalent)
- Anglès: la targeta EN diu "2× more dopamine sensitivity in extraverts vs introverts"
- Català actual: «2× més sensibilitat a la dopamina en extravertits vs introvertits»
- Categoria: correcte · Gravetat — (sense incidència: fidel; *vs* es manté igual que a l'anglès. Es registra per descartar fals positiu.)

### 7.7 «la contactació proactiva» (vegeu 7.2) i «xarxes àmplies i ràpides» — calc lleu
- Anglès: "build broad, fast networks"
- Català actual: «construeixen xarxes àmplies i ràpides»
- Categoria: FIDELITAT/REGISTRE · Gravetat BAIXA
- Proposta: «xarxes àmplies **i de formació ràpida** / que teixeixen ràpidament»
- Justificació: «xarxes ... ràpides» és lleugerament ambigu (una xarxa no és "ràpida"); l'anglès *fast networks* vol dir "xarxes que es construeixen de pressa". Reformular per precisió. Millora de naturalesa, no error dur.

### Resum quantitatiu — Article «what-is-extraversion»
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA/CALC (contactació) | 1 | – | – |
| TERMINOLOGIA/COHERÈNCIA (assertiveness/assertivitat) | – | – | 1 |
| REGISTRE (tractament tu/vós barrejat) | – | 1 | – |
| FIDELITAT (xarxes ràpides) | – | – | 1 |
| Total incidències | **1** | **1** | **2** |


## "Construir seguretat psicològica: el que la ciència de la personalitat afegeix a la conversa" (`building-psychological-safety-personality-science`)

### 1.1 «predeterminats different» (secció «Què és la seguretat psicològica»)
- Ubicació: paràgraf «Diferents perfils de personalitat creen riscos... a predeterminats *different* en com s'impliquen amb les normes de l'equip».
- Anglès: "different defaults in how they engage with team norms"
- Català actual: «a predeterminats different en com s'impliquen amb les normes de l'equip»
- Categoria: ERRADA (mot anglès sense traduir + concordança) · Gravetat: ALTA
- Proposta: «a valors predeterminats diferents en com s'impliquen amb les normes de l'equip»
- Justificació: «different» és un mot anglès que ha quedat literalment sense traduir dins el text català; a més «predeterminats» com a substantiu calca *defaults* (cf. la taula i altres punts on caldria «valors predeterminats»). Error objectiu i molt visible.

### 1.2 «la autopercepció» (secció final i CTA)
- Ubicació: «les bretxes entre la autopercepció i la percepció dels parells».
- Anglès: "the gaps between self-perception and peer-perception"
- Català actual: «entre la autopercepció i la percepció dels parells»
- Categoria: ERRADA (apostrofació) · Gravetat: ALTA
- Proposta: «entre l'autopercepció i la percepció dels parells»
- Justificació: davant de mot femení començat per vocal àtona l'article s'apostrofa: «l'autopercepció» (GIEC/DNV). «la autopercepció» és error ortogràfic d'apostrofació.

### 1.3 «és accionable» (CTA «Descobreix on la seguretat psicològica és fràgil»)
- Ubicació: «saber exactament quins membres de l'equip estan en major risc... és accionable».
- Anglès: "is actionable"
- Català actual: «...és accionable»
- Categoria: CALC (anglicisme) · Gravetat: MITJANA
- Proposta: «és aplicable» / «permet actuar-hi» / «es pot dur a la pràctica»
- Justificació: glossari de l'auditoria: *accionable* en el sentit de *actionable* és un calc; en català «accionable» vol dir "que es pot accionar (un mecanisme)". Mateix criteri que 3.9 de 05-blog.md.

### 1.4 Tractament «tu» en les crides a l'acció
- Ubicació: subtítols i CTA: «Busca senyals més silenciosos», «consulta amb els col·legues», «identifica on els perfils...», «Descobreix on la seguretat psicològica és fràgil al teu equip», «Comença una avaluació d'equip gratuïta», «el teu equip».
- Anglès: "Seek out quieter signals", "Find out where psychological safety is fragile in your team", "Start a free team assessment", "your team"
- Català actual: imperatius i possessius en segona persona del singular (tu): «Busca», «consulta», «identifica», «Descobreix», «Comença», «el teu equip».
- Categoria: REGISTRE (tractament) · Gravetat: MITJANA
- Proposta: unificar a vós (model de llengua de l'auditoria): «Cerqueu senyals més silenciosos», «consulteu amb els col·legues», «identifiqueu on...», «Descobriu on la seguretat psicològica és fràgil al vostre equip», «Comenceu una avaluació d'equip gratuïta», «el vostre equip».
- Justificació: model de llengua del brief (verbs referits al lector en 2a persona del plural). L'article és coherent internament en «tu», però la col·lecció ha d'unificar-se a vós; vegeu R5 de 05-blog.md.

### 1.5 «que la soscavin» / antecedent ambigu
- Ubicació: «i quins comportaments — sovint involuntaris — és més probable que la soscavin».
- Anglès: "and which behaviours — often unintentional — are most likely to undermine it"
- Català actual: «...és més probable que la soscavin»
- Categoria: correcte · Gravetat: — (fals positiu: «la» remet correctament a «la seguretat psicològica»; la concordança del subjuntiu plural «soscavin» amb «comportaments» és correcta. Sense incidència.)

### 1.6 «canals de contribució de baixa aposta» / «de baixa contribució»
- Ubicació: taula («canals de contribució de baixa aposta») i cos («canals explícits de baixa contribució»).
- Anglès: "low-stakes contribution channels" / "low-stakes channels for contribution"
- Català actual: «canals de contribució de baixa aposta» (taula) i «canals explícits de baixa contribució» (cos)
- Categoria: TERMINOLOGIA/FIDELITAT (incoherència interna) · Gravetat: MITJANA
- Proposta: unificar; *low-stakes* = «de baix risc» / «de poc compromís», no «de baixa contribució» (que altera el sentit: no és que la contribució sigui baixa, sinó que el cost/risc d'aportar-hi ho és). Recomanat: «canals de contribució de baix risc» a tots dos llocs.
- Justificació: «de baixa contribució» és un contrasentit respecte de la font (*low-stakes* qualifica el risc, no la quantitat de contribució); a més el text usa dues formulacions diferents per al mateix concepte. Cf. les versions DE («risikoarme Beitragskanäle») i DA («lavrisiko-bidragskanaler»), que diuen «de baix risc».

### 1.7 «Forma sobre l'impacte del lliurament» (taula, Bond baix)
- Ubicació: taula, fila «Bond baix (Amabilitat)», columna intervenció.
- Anglès: "Coach on delivery impact; frame directness with acknowledgement"
- Català actual: «Forma sobre l'impacte del lliurament; encadra la directesa amb reconeixement»
- Categoria: FIDELITAT/CALC · Gravetat: MITJANA
- Proposta: «Fes coaching sobre l'impacte de la manera de comunicar; emmarca la franquesa amb reconeixement»
- Justificació: (a) *delivery* aquí és "la manera de dir/comunicar", no «lliurament» (de feina); és un fals amic en aquest context. (b) *frame* = «emmarcar», no «encadenar»: «encadra» és una errada lèxica (confusió amb una altra accepció). Canvi de sentit doble.

### 1.8 «monitoritza el temps d'aire» (taula, Presència alta)
- Ubicació: taula, fila «Alta Presència (Extraversió)».
- Anglès: "monitor air time"
- Català actual: «monitoritza el temps d'aire»
- Categoria: CALC · Gravetat: MITJANA
- Proposta: «vigileu/controleu el temps de paraula» (o «el temps d'intervenció»)
- Justificació: «temps d'aire» és calc cru de *air time*; en català el concepte de quant parla cadascú en una reunió és «temps de paraula» / «temps d'intervenció». «Temps d'aire» remet a emissió radiofònica, no a la dinàmica de reunió.

### 1.9 «r = 0,42» amb coma decimal i estadístics
- Ubicació: targetes d'estadística (stat-grid).
- Anglès: "r = 0.42"
- Català actual: «r = 0,42», «r = 0,31», «r = −0,38»
- Categoria: correcte · Gravetat: — (fals positiu: el separador decimal en català és la coma; la conversió de 0.42 a 0,42 és correcta i desitjable. Es registra per descartar-lo com a error.)

### Resum quantitatiu — building-psychological-safety-personality-science
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (mot sense traduir, apostrofació) | 2 | – | – |
| CALC (accionable, temps d'aire) | – | 2 | – |
| FIDELITAT/TERMINOLOGIA (low-stakes, delivery/frame) | – | 2 | – |
| REGISTRE (tractament tu/vós) | – | 1 | – |
| Total incidències | **2** | **5** | **0** |

---

## "La transició de fundador a CEO: una perspectiva de personalitat" (`founder-ceo-transition-personality-perspective`)

### 2.1 «mancances d'habilitats» / «mancen de» / «en manquen» (descripció i cos)
- Ubicació: descripció («no mancances d'habilitats», «sovint mancen de la Disciplina») i títol de secció («per què els fundadors sovint en manquen»).
- Anglès: "not skill gaps", "often lack the Discipline", "why founders often lack it"
- Català actual: «discordances de personalitat, no mancances d'habilitats», «sovint mancen de la Disciplina», «per què els fundadors sovint en manquen»
- Categoria: ERRADA (recció/lèxic) · Gravetat: MITJANA
- Proposta: «no llacunes de competències», «sovint els manca la Disciplina» / «sovint no tenen la Disciplina», «per què sovint els manca»
- Justificació: «mancar» en català és intransitiu i es construeix amb complement indirecte («els manca la Disciplina»), no transitiu («mancar una cosa», «mancar-ne»). «mancen de la Disciplina» i «en manquen» calquen el *to lack* anglès / el *carecer de* castellà i forcen una recció agramatical. Recurrent.

### 2.2 «un relat amb ull clar» (entradeta)
- Ubicació: «La recerca sobre personalitat proporciona un relat amb ull clar de per què...».
- Anglès: "Personality research provides a clear-eyed account of why..."
- Català actual: «un relat amb ull clar»
- Categoria: CALC (idiomàtic) · Gravetat: MITJANA
- Proposta: «una anàlisi lúcida / sense complaences de per què...», «una explicació realista de per què...»
- Justificació: *clear-eyed* és un modisme anglès («lúcid», «sense il·lusions»); «amb ull clar» no és català idiomàtic i resulta opac. A més «relat» per *account* aquí és més «explicació/anàlisi».

### 2.3 «que s'adient gairebé perfectament» (citació destacada)
- Ubicació: cita en bloc: «una transició que s'adient gairebé perfectament a la tensió de personalitat...».
- Anglès: "a transition that maps almost perfectly onto the personality tension..."
- Català actual: «una transició que s'adient gairebé perfectament a la tensió»
- Categoria: ERRADA (forma verbal inexistent) · Gravetat: ALTA
- Proposta: «que es correspon gairebé perfectament amb la tensió» / «que es projecta gairebé perfectament sobre la tensió»
- Justificació: «s'adient» no és una forma verbal catalana (no existeix *adient-se*; «adient» és adjectiu). Sembla un creuament amb «s'adiu» (de *adir-se*), que tampoc no expressa *to map onto*. Error objectiu de morfologia verbal. Cf. la traducció de *maps onto* a 05-blog.md (3.1 «circumplex»: «basats en»).

### 2.4 «inversors el termes dels quals són desfavorables»
- Ubicació: secció «Quins trets recompensa la fase fundacional»: «a inversors el termes dels quals són desfavorables».
- Anglès: "to investors whose terms are unfavourable"
- Català actual: «a inversors el termes dels quals són desfavorables»
- Categoria: ERRADA (concordança article-nom) · Gravetat: ALTA
- Proposta: «a inversors els termes dels quals són desfavorables»
- Justificació: «termes» és plural; l'article relatiu ha de concordar en plural: «els termes dels quals». «el termes» és error de concordança objectiu.

### 2.5 «genuïnament angustiants» / «genuïnament angustiós»
- Ubicació: «troben aquests refusals genuïnament angustiants»; «experimenten el conflicte interpersonal com genuïnament angustiós»; CEO/COO: «troben angustiantes».
- Anglès: "genuinely distressing"
- Català actual: «angustiants», «angustiós», «angustiantes»
- Categoria: ERRADA (castellanisme ortogràfic) · Gravetat: ALTA
- Proposta: «angoixants», «angoixós», «angoixoses»
- Justificació: «angustiant/angustiós» són castellanismes (*angustiante/angustioso*); la forma catalana és «angoixant» / «angoixós» (de *angoixa*). A més «angustiantes» duu morfologia plural castellana. Recurrent; error objectiu. (El cos sí usa «angustiants» de manera consistentment incorrecta.)

### 2.6 «refusals» (fase fundacional)
- Ubicació: «Els fundadors d'alta Bond sovint troben aquests refusals genuïnament angustiants».
- Anglès: "high-Bond founders often find these refusals genuinely distressing"
- Català actual: «aquests refusals»
- Categoria: ERRADA (lèxic) · Gravetat: MITJANA
- Proposta: «aquestes negatives» / «aquests refusos»
- Justificació: «refusal» és anglès; el substantiu català és «refús» (pl. «refusos») o «negativa». «refusals» ha quedat sense traduir.

### 2.7 «reduïxin la dependència»
- Ubicació: «marcs explícits... que reduïxin la dependència de la comoditat emocional natural».
- Anglès: "frameworks... that reduce reliance on natural emotional comfort"
- Català actual: «que reduïxin la dependència»
- Categoria: ERRADA (morfologia verbal) · Gravetat: MITJANA
- Proposta: «que redueixin la dependència» (o, en model valencià, «que reduïsquen»)
- Justificació: el subjuntiu de *reduir* és «redueixin» (incoatiu -eix-) o «reduïsquen»; «reduïxin» barreja la base valenciana «reduïx» amb la desinència oriental «-in», forma híbrida no normativa. A més és incoherent amb la resta del text, que usa l'incoatiu oriental («serveixi», «requereix»).

### 2.8 «existenzbedrohenden» — comprovació: «experiències properes a la mort»
- Ubicació: «els rebuigs repetits, contratemps i experiències properes a la mort que caracteritzen la construcció d'empreses».
- Anglès: "the repeated rejections, setbacks, and near-death experiences that characterise early company-building"
- Català actual: «experiències properes a la mort»
- Categoria: FIDELITAT/AMBIGÜITAT · Gravetat: BAIXA
- Proposta: «experiències a la vora de la fallida» / «situacions de gairebé fracàs (de l'empresa)»
- Justificació: *near-death experiences* és aquí metàfora empresarial ("l'empresa gairebé mor"); «experiències properes a la mort» en català remet inequívocament a l'experiència clínica personal (NDE), cosa que desorienta el lector. Convé desambiguar cap al sentit empresarial.

### 2.9 «discordances de personalitat» (descripció)
- Ubicació: descripció: «Els fracassos en la transició... són discordances de personalitat, no mancances d'habilitats».
- Anglès: "Founder-to-CEO failures are personality mismatches, not skill gaps."
- Català actual: «són discordances de personalitat»
- Categoria: TERMINOLOGIA · Gravetat: BAIXA
- Proposta: «són desajustos de personalitat» / «inadequacions de personalitat»
- Justificació: *mismatch* es tradueix millor per «desajust/inadequació»; «discordança» tendeix a sentit musical o de divergència d'opinions. El cos del mateix article ja usa «desajust» («el seu estil natural és un desajust»), de manera que «discordances» a la descripció trenca la coherència terminològica interna.

### 2.10 Tractament «tu» en les crides a l'acció
- Ubicació: «Coneix el teu perfil de fundador», «Entendre el teu propi perfil», «et dóna una imatge precisa d'on et trobes», «t'ajuden a identificar», «Tant si estàs en la pre-transició», «comença amb l'avaluació gratuïta».
- Anglès: "Know your founder profile", "Understanding your own profile", "gives you a precise picture", "help you identify", "start with the free assessment"
- Català actual: tractament de tu (el teu, et dóna, t'ajuden, comença).
- Categoria: REGISTRE (tractament) · Gravetat: MITJANA
- Proposta: unificar a vós: «Conegueu el vostre perfil de fundador», «us dóna una imatge precisa d'on us trobeu», «us ajuden a identificar», «comenceu amb l'avaluació gratuïta».
- Justificació: model de llengua del brief; vegeu R5 de 05-blog.md. Coherent internament en tu, però la col·lecció s'ha d'unificar a vós.

### 2.11 «pensament de grup»
- Ubicació: «trobar un cofundador que pensi de manera idèntica — això produeix pensament de grup».
- Anglès: "that produces groupthink"
- Català actual: «pensament de grup»
- Categoria: correcte · Gravetat: — (fals positiu: «pensament de grup» és la traducció establerta de *groupthink*; coherent amb 05-blog.md, art. addicional. Sense incidència.)

### Resum quantitatiu — founder-ceo-transition-personality-perspective
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (angoixant, concordança, «s'adient», «reduïxin», recció «mancar», «refusals») | 3 | 3 | – |
| CALC («ull clar») | – | 1 | – |
| FIDELITAT/AMBIGÜITAT («near-death») | – | – | 1 |
| TERMINOLOGIA («discordances») | – | – | 1 |
| REGISTRE (tractament tu/vós) | – | 1 | – |
| Total incidències | **3** | **5** | **2** |

---

## "Introversió i gestió de l'energia: el que diu realment la ciència" (`introversion-energy-management-science`)

### 3.1 «L'extraversion introversion modela l'energia» (descripció)
- Ubicació: descripció (meta): «L'extraversion introversion modela l'energia a través de l'excitació cortical».
- Anglès: "Extraversion introversion shapes energy through cortical arousal."
- Català actual: «L'extraversion introversion modela l'energia a través de l'excitació cortical»
- Categoria: ERRADA (mots anglesos sense traduir) · Gravetat: ALTA
- Proposta: «L'eix extraversió-introversió modela l'energia a través de l'activació cortical»
- Justificació: «extraversion» i «introversion» són grafies angleses sense accent ni traducció; en català, «extraversió» i «introversió». A més la juxtaposició sense connector és poc clara: cal «l'eix extraversió-introversió». (Vegeu també 3.2 sobre *arousal*.)

### 3.2 «excitació cortical» vs «activació cortical» (incoherència interna)
- Ubicació: descripció («excitació cortical») enfront del cos, que sempre diu «activació cortical» («nivells basals... més alts d'activació cortical», «el model d'activació cortical d'Eysenck», «punt d'activació òptim»).
- Anglès: "cortical arousal"
- Català actual: «excitació cortical» (descripció) vs «activació cortical» (cos, ~8 ocurrències)
- Categoria: TERMINOLOGIA (incoherència) · Gravetat: MITJANA
- Proposta: unificar a «activació cortical» també a la descripció.
- Justificació: *arousal* en neurociència es tradueix per «activació» (és el terme que el propi article fixa al cos); «excitació» és un fals amic parcial (*excitement*) i, a més, trenca la coherència interna. Unificar al terme ja consolidat dins el text.

### 3.3 «l'Extraversion» (forma anglesa al llarg de tot l'article)
- Ubicació: sistemàtic al cos: «el que prediu l'Extraversion», «l'Extraversion — Presència», «alta Extraversion», «la literatura sobre Extraversion», «per nivell d'Extraversion».
- Anglès: "Extraversion"
- Català actual: «Extraversion» (sense accent, grafia anglesa) de manera recurrent
- Categoria: ERRADA (terme sense adaptar) · Gravetat: ALTA
- Proposta: «Extraversió» a totes les ocurrències (o, segons el marc Cèrcol, «Presència»).
- Justificació: el català és «extraversió»; la grafia «Extraversion» és anglesa. És el terme central de l'article i apareix mal escrit de manera sistemàtica (mentre que el títol de secció «El que Revela la Investigació... Introvertits i Extravertits» i altres punts sí usen formes catalanes), cosa que evidencia la inconsistència.

### 3.4 «rendeixen pitjor» (model d'esgotament d'energia)
- Ubicació: «Les persones amb Presència baixa rendeixen pitjor en tasques cognitivament exigents».
- Anglès: "lower-Presence people perform worse on cognitively demanding tasks"
- Categoria: ERRADA (morfologia verbal) · Gravetat: ALTA
- Proposta: «renden pitjor» (forma normativa de *rendre*, 3a pers. pl.: «renden»)
- Justificació: el verb és *rendir/rendre*; la 3a persona del plural normativa és «renden», no «rendeixen» (no és incoatiu). «rendeixen» és una errada de conjugació. (Compareu amb «rendint» que el mateix article usa correctament: «tots dos grups rendint de manera òptima».)

### 3.5 «de porta oberta durant tot el dia» / «accés de porta oberta»
- Ubicació: «horaris de reunions estructurats en lloc d'accés de porta oberta durant tot el dia».
- Anglès: "structured meeting hours rather than all-day open-door access"
- Català actual: «accés de porta oberta durant tot el dia»
- Categoria: correcte · Gravetat: — (fals positiu: «de porta oberta» és la fórmula catalana habitual per a la política *open-door*; lectura natural. Sense incidència.)

### 3.6 «l'amplada» (interacció: profunditat vs amplada)
- Ubicació: taula, fila «Baix (Presència baixa)»: «preferir la profunditat de la interacció sobre l'amplada».
- Anglès: "prefer depth of interaction over breadth"
- Català actual: «la profunditat de la interacció sobre l'amplada»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat: MITJANA
- Proposta: «preferir la profunditat de la interacció a l'amplitud» (o «a l'abast»)
- Justificació: *breadth* contraposat a *depth* és «amplitud», no «amplada» (dimensió física/mesura). A més, en català la contraposició idiomàtica és «preferir X a Y», no «sobre Y» (calc de l'anglès *over*).

### 3.7 «la realitat ambivertida»
- Ubicació: «La realitat ambivertida complica el binari popular».
- Anglès: "The ambivert reality complicates the popular binary."
- Català actual: «La realitat ambivertida»
- Categoria: ERRADA (lèxic) · Gravetat: BAIXA
- Proposta: «La realitat dels ambiverts complica el binari popular» / «La realitat de l'ambiversió»
- Justificació: «ambivertida» (com a adjectiu femení participial) no és català; el substantiu és «ambivert» i la qualitat «ambiversió». La construcció anglesa *ambivert reality* (nom + nom) calca en un adjectiu inexistent.

### 3.8 Tractament «tu»/«vós» — incoherència
- Ubicació: el cos usa «vós» a les CTA finals («Trobeu la vostra puntuació de Presència», «us dóna», «on us situeu», «la vostra Presència»), però el subtítol diu «el que diu realment la ciència» i la resta és impersonal; cap salt a «tu» evident dins aquest article.
- Anglès: "Find your Presence score", "gives you", "where you sit"
- Català actual: vós, de manera coherent dins l'article.
- Categoria: correcte · Gravetat: — (fals positiu / nota positiva: aquest article SÍ aplica el tractament de vós a les crides a l'acció, que és el model recomanat pel brief. És el patró que els altres articles haurien de seguir. Sense incidència.)

### 3.9 «adequar el nivell d'estimulació al vostre punt d'activació òptim»
- Ubicació: penúltim paràgraf.
- Anglès: "matching stimulation level to your optimal arousal point"
- Català actual: «adequar el nivell d'estimulació al vostre punt d'activació òptim»
- Categoria: correcte · Gravetat: — (fals positiu: «adequar... a» és bona recció; «punt d'activació» és coherent amb la resta. Sense incidència.)

### Resum quantitatiu — introversion-energy-management-science
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (mots sense adaptar, «rendeixen», «ambivertida») | 3 | – | 1 |
| TERMINOLOGIA (excitació/activació, amplada/amplitud) | – | 2 | – |
| Total incidències | **3** | **2** | **1** |

---

## "Personalitat i estils de lideratge: quins perfils de personalitat utilitzen naturalment quins enfocaments" (`personality-and-leadership-styles-authoritative-coaching-democratic`)

### 4.1 «recorreu per defecte» (descripció) — tractament i sentit
- Ubicació: descripció: «modela l'estil de lideratge al qual recorreu per defecte sota pressió».
- Anglès: "shapes the leadership style you default to under pressure"
- Català actual: «al qual recorreu per defecte sota pressió»
- Categoria: correcte · Gravetat: — (fals positiu sobre el tractament: «recorreu» és vós, que és el model demanat. «recórrer a... per defecte» és acceptable. Es registra perquè el COS de l'article usa «tu» a les CTA — vegeu 4.7 — i això SÍ és incoherent amb aquesta descripció en vós.)

### 4.2 «Per Que la Flexibilitat...» (títol de secció)
- Ubicació: capçalera de secció: «## Per Que la Flexibilitat d'Estil de Lideratge és tan Difícil per a la Personalitat».
- Anglès: "Why Leadership Style Flexibility Is So Hard for Personality"
- Català actual: «Per Que la Flexibilitat...»
- Categoria: ERRADA (ortografia, accent diacrític) · Gravetat: ALTA
- Proposta: «Per Què la Flexibilitat...»
- Justificació: l'interrogatiu/causal àton «què» porta accent diacític sempre; «Per Que» és error ortogràfic flagrant, i a més en un titular de secció (molt visible). Cf. la resta de l'article, que escriu «per què» correctament en altres llocs.

### 4.3 «Utilisar Big Five» (enllaços de lectura relacionada, ×2)
- Ubicació: «Coaching de personalitat — Utilisar Big Five com a eina de desenvolupament» (dins de secció i al peu).
- Anglès: "Personality coaching — using Big Five as a development tool"
- Català actual: «Utilisar Big Five»
- Categoria: ERRADA (ortografia) · Gravetat: ALTA
- Proposta: «Utilitzar el Big Five»
- Justificació: «utilisar» (amb -s-) és grafia incorrecta (calc de la grafia francesa/anglesa *utiliser/utilise*); en català és «utilitzar» (amb -tz-). Recurrent (dos enllaços). A més convé l'article: «el Big Five».

### 4.4 «està disponible a» (context sobre lideratge)
- Ubicació: «Un context general útil per a la investigació sobre lideratge és disponible a Wikipedia: Lideratge».
- Anglès: "Useful general context for leadership research is available at Wikipedia: Leadership."
- Català actual: «és disponible a»
- Categoria: CALC (còpula) · Gravetat: BAIXA
- Proposta: «està disponible a» / «es pot trobar a» / «el trobareu a»
- Justificació: amb «disponible» (estat/localització) el català demana «estar», no «ser»: «està disponible». «és disponible» calca el *is available* anglès / *es disponible* castellà.

### 4.5 «estils de lideratge distincts»
- Ubicació: «Goleman va identificar sis estils de lideratge distincts basats en les competències...».
- Anglès: "six distinct leadership styles"
- Català actual: «sis estils de lideratge distincts»
- Categoria: ERRADA (ortografia) · Gravetat: ALTA
- Proposta: «sis estils de lideratge diferents» / «distints»
- Justificació: «distincts» no és forma catalana; el plural de «distint» és «distints» (sense -c-). Sembla creuament amb l'anglès *distinct*/el francès. Millor encara, per naturalitat, «diferents» (cf. l'article ja usa «un to emocional diferent»).

### 4.6 «el creixement de la persona són el punt» (estil de coaching)
- Ubicació: «per a ells, la relació i el creixement de la persona són el punt».
- Anglès: "for them, the relationship and the person's growth are the point"
- Català actual: «la relació i el creixement de la persona són el punt»
- Categoria: CALC (idiomàtic) · Gravetat: MITJANA
- Proposta: «...són la qüestió / són allò essencial / són el que de debò importa»
- Justificació: «ser el punt» (*to be the point*) és calc cru de l'anglès; glossari de l'auditoria: «That is the point» → «Aquesta és la qüestió/la idea», mai «el punt». Mateix criteri que 4.8 de 05-blog.md.

### 4.7 Tractament «tu» a la CTA «Mapeja el Teu Estil...»
- Ubicació: CTA final: «Mapeja el Teu Estil de Lideratge al Teu Perfil de Personalitat», «quins estils et resulten naturals», «els 12 rols d'equip de Cèrcol tradueixen», «Fes l'avaluació gratuïta», «el teu perfil encaixa millor».
- Anglès: "Map Your Leadership Style to Your Personality Profile", "which styles come naturally to you", "Take the free assessment"
- Català actual: tractament de tu (el teu, et resulten, Fes, Mapeja).
- Categoria: REGISTRE (tractament + incoherència amb la descripció en vós) · Gravetat: MITJANA
- Proposta: unificar a vós: «Mapeu el vostre estil de lideratge al vostre perfil», «quins estils us resulten naturals», «Feu l'avaluació gratuïta».
- Justificació: model de llengua del brief (vós). A més, la pròpia descripció (meta) de l'article ja usa vós («recorreu»), de manera que la CTA en «tu» és internament incoherent. Vegeu R5 de 05-blog.md.

### 4.8 «r = 0.31» amb punt decimal dins l'SVG
- Ubicació: diagrama SVG («r = 0.31», «r = 0.28», «r = −0.24»).
- Anglès: "r = 0.31"
- Català actual: «r = 0.31» (punt decimal)
- Categoria: ERRADA (convenció tipogràfica) · Gravetat: BAIXA
- Proposta: «r = 0,31», «r = 0,28», «r = −0,24» (coma decimal)
- Justificació: en català el separador decimal és la coma. L'article anterior d'aquesta auditoria (building-psychological-safety) SÍ converteix a coma («r = 0,42»), de manera que ací hi ha incoherència de col·lecció a més de la convenció. (Es manté gravetat BAIXA perquè és dins d'un gràfic; tot i així cal corregir-ho per coherència.)

### Resum quantitatiu — personality-and-leadership-styles-authoritative-coaching-democratic
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (ortografia: «Per Que», «Utilisar», «distincts»; tipografia decimal) | 3 | – | 1 |
| CALC («són el punt», «és disponible») | – | 1 | 1 |
| REGISTRE (tractament tu/vós) | – | 1 | – |
| Total incidències | **3** | **2** | **2** |

---

## "Personalitat en equips àgils: el que la recerca sobre el Big Five diu sobre la dinàmica Scrum" (`personality-in-agile-teams-scrum-and-big-five`)

### 5.1 «s'espera que els equips desglossem bé el treball»
- Ubicació: «però s'espera que els equips desglossem bé el treball, estimin de manera realista i executin de manera fiable».
- Anglès: "teams are expected to break down work well, estimate realistically, and deliver reliably"
- Català actual: «s'espera que els equips desglossem bé el treball, estimin... i executin»
- Categoria: ERRADA (concordança de persona verbal) · Gravetat: ALTA
- Proposta: «s'espera que els equips desglossin bé el treball, estimin... i executin»
- Justificació: el subjecte és «els equips» (3a persona del plural), però «desglossem» és 1a persona del plural: trencament de concordança evident enmig d'una sèrie coordinada amb «estimin»/«executin» (3a pers.). Error gramatical objectiu.

### 5.2 «llancin alertes tempranes»
- Ubicació: «Els membres d'equip amb alta Disciplina és més probable que llancin alertes tempranes quan un sprint està en risc».
- Anglès: "are more likely to raise early warnings when a sprint is at risk"
- Català actual: «que llancin alertes tempranes»
- Categoria: ERRADA (castellanisme lèxic) · Gravetat: MITJANA
- Proposta: «que facin saltar alertes primerenques» / «que alertin aviat» / «que donin l'alerta amb antelació»
- Justificació: «temprà/temprana» és castellanisme (*temprano*); en català, «primerenc/primerenca» o «d'hora/aviat». El mateix article empra «alertes tempranes» on l'anglès diu *early warnings*; la forma catalana és «primerenques». (El cos del mateix article usa altres calcs similars, però aquest és el clar.)

### 5.3 «aflorar problemes amb honestedat» / «aflorar-ho» / «aflorar bloquejos»
- Ubicació: diverses: «aflorar problemes amb honestedat», «El stand-up diari existeix per aflorar bloquejos», «simplement no aflorar-ho», «estan dissenyades per aflorar».
- Anglès: "surface problems honestly", "exists to surface blockers", "simply not surface it"
- Català actual: «aflorar problemes», «aflorar bloquejos», «no aflorar-ho»
- Categoria: ERRADA (transitivitat) · Gravetat: ALTA
- Proposta: «fer aflorar problemes», «existeix per fer aflorar bloquejos», «simplement no fer-ho aflorar» (o «no plantejar-ho / no treure-ho a la llum»)
- Justificació: glossari de l'auditoria: *emergir/aflorar* són intransitius en català; no es pot «aflorar una cosa», cal la construcció causativa «fer aflorar». Mateix criteri que 3.4 de 05-blog.md («fa emergir la bretxa»). Recurrent (transitivització indeguda de *to surface*).

### 5.4 «desreguladora» (Neuroticisme i ambigüitat)
- Ubicació: «poden trobar que la incertesa inherent del desenvolupament iteratiu és desreguladora de maneres que es manifesten com a colls d'ampolla».
- Anglès: "may find the inherent uncertainty of iterative development dysregulating in ways that manifest as bottlenecks"
- Català actual: «és desreguladora de maneres que es manifesten...»
- Categoria: TERMINOLOGIA/CALC · Gravetat: MITJANA
- Proposta: «els desregula emocionalment, de maneres que es manifesten...» / «els altera la regulació emocional»
- Justificació: «desreguladora» (calc de *dysregulating*) és opac i de formació dubtosa en català com a adjectiu; el concepte és la «desregulació (emocional)». Reformular amb verb («desregula») o explicitar «de la regulació emocional». A més, «de maneres que» calca *in ways that*; més natural «de manera que» / «i això es manifesta com a».

### 5.5 «enforçant el procés» (Scrum Master)
- Ubicació: «sovint es converteix de facto en un gestor de projectes — enforçant el procés en lloc de capacitar l'equip».
- Anglès: "enforcing process rather than empowering the team"
- Català actual: «enforçant el procés en lloc de capacitar l'equip»
- Categoria: ERRADA (barbarisme) · Gravetat: ALTA
- Proposta: «imposant/fent complir el procés en lloc d'empoderar/capacitar l'equip»
- Justificació: «enforçar» no existeix en català; és un calc cru de l'anglès *to enforce*. Cal «fer complir», «imposar» o «aplicar». Error lèxic objectiu.

### 5.6 «sobre-comprometre l'equip» / «sobre-compromís»
- Ubicació: «pot sobre-comprometre l'equip»; taula: «sobre-compromís».
- Anglès: "may over-commit the team", "over-commitment"
- Català actual: «sobre-comprometre», «sobre-compromís» (amb guionet)
- Categoria: ERRADA (ortografia de prefix) · Gravetat: BAIXA
- Proposta: «sobrecomprometre», «sobrecompromís» (sense guionet)
- Justificació: el prefix «sobre-» s'aglutina sense guionet davant de consonant (GIEC/DNV): «sobrecompromís», «sobrecomprometre». El guionet és innecessari i incorrecte. Cf. R criteri de prefixos a 05-blog.md (3.8 «autopercepció»).

### 5.7 «desafiar explícitament si el resultat compleix la definició de fet»
- Ubicació: consells pràctics: «per desafiar explícitament si el resultat compleix la definició de fet».
- Anglès: "to explicitly challenge whether the outcome meets the definition of done"
- Català actual: «la definició de fet»
- Categoria: FIDELITAT (terme tècnic mal traduït) · Gravetat: ALTA
- Proposta: «la definició d'acabat» (Definition of Done) — o deixar el terme àgil consagrat «Definition of Done».
- Justificació: *Definition of Done* és un terme tècnic fix de Scrum; «definició de fet» en tradueix *done* com a «fet» de manera que es perd (i confon: «de fet» = *in fact*). En l'àmbit àgil català es manté «Definition of Done» o es tradueix «definició d'acabat/enllestit». Canvi de sentit en un terme central.

### 5.8 «Conscientiousness» / «Openness» en titulars de secció (anglès sense traduir/marc)
- Ubicació: titulars: «Com la Disciplina (Conscientiousness) prediu...», «Com la Visió (Openness) determina...»; cos: «Openness to Experience», «alta Agreeableness», «baix Neuroticisme».
- Anglès: idem (acadèmics permesos).
- Català actual: barreja de «Conscientiousness», «Openness», «Agreeableness» (formes angleses) amb «Neuroticisme», «Extraversió» (formes catalanes) dins el mateix article.
- Categoria: TERMINOLOGIA (incoherència de forma) · Gravetat: MITJANA
- Proposta: el brief permet noms acadèmics en blog; la incidència no és usar-los, sinó la INCOHERÈNCIA: uns en anglès («Openness», «Agreeableness») i d'altres catalanitzats («Neuroticisme», «Extraversió»). Unificar: o bé totes en català (Obertura, Amabilitat, Responsabilitat/Conscienciositat, Neuroticisme, Extraversió), o bé totes en la grafia anglesa entre parèntesis darrere del nom Cèrcol.
- Justificació: coherència terminològica interna. Cf. 05-blog.md, on s'unifiquen formes. No és error de norma sinó de consistència; per això MITJANA.

### 5.9 «el paisatge de personalitat» (CTA)
- Ubicació: «per mapejar el paisatge de personalitat del vostre equip àgil».
- Anglès: "to map your agile team's personality landscape"
- Català actual: «el paisatge de personalitat»
- Categoria: REGISTRE/CALC · Gravetat: BAIXA
- Proposta: «el panorama de personalitat» / «el mapa de personalitat»
- Justificació: *landscape* en sentit figurat es ret millor per «panorama» o «mapa»; «paisatge de personalitat» és literal i una mica forçat en aquest registre divulgatiu. (El mateix article ja usa «panorama de rols» en un altre punt de la col·lecció — coherència.)

### 5.10 Tractament: vós coherent
- Ubicació: CTA i consells: «Compreneu la composició», «Proveu Cèrcol», «exploreu els 12 rols», «assigneu una persona», «el vostre equip».
- Català actual: vós, coherent dins l'article.
- Categoria: correcte · Gravetat: — (fals positiu / nota positiva: aquest article aplica vós de manera coherent, d'acord amb el model del brief. Sense incidència.)

### Resum quantitatiu — personality-in-agile-teams-scrum-and-big-five
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (concordança, «enforçar», «aflorar» transitiu, prefix «sobre-») | 3 | 1 | 1 |
| FIDELITAT («definició de fet») | 1 | – | – |
| TERMINOLOGIA/CALC («desreguladora», incoherència noms, «paisatge») | – | 2 | 1 |
| Total incidències | **4** | **3** | **2** |

---

## "Biaix de desitjabilitat social en els tests de personalitat: com distorsiona els resultats i què s'hi pot fer" (`social-desirability-bias-personality-tests`)

### 6.1 «Amabilitat fins a ,50» (descripció)
- Ubicació: descripció (meta): «infla sistemàticament les puntuacions del Big Five — Amabilitat fins a ,50».
- Anglès: (la font EN de la descripció no conté aquesta xifra: "inflates Big Five scores when people answer how they think they should")
- Català actual: «Amabilitat fins a ,50»
- Categoria: AMBIGÜITAT/ERRADA (tipografia del decimal) · Gravetat: MITJANA
- Proposta: «correlacions amb l'Amabilitat de fins a 0,50» (afegir el zero i el referent «correlacions»)
- Justificació: «,50» sense zero inicial és ambigu i poc acurat en text divulgatiu; convé «0,50». A més «Amabilitat fins a ,50» és el·líptic fins a la confusió (què arriba a 0,50?): cal explicitar «correlacions de fins a 0,50». La xifra prové del cos (correlacions ,30–,50), no de la descripció EN: nota de fidelitat (la descripció CA afegeix dades absents de la font, tot i ser coherents amb el cos).

### 6.2 «,30 i ,50» / «,25 a ,45» (cos)
- Ubicació: «solen oscil·lar entre ,30 i ,50», «amb correlacions de ,25 a ,45».
- Anglès: "tend to range between .30 and .50", "correlations of .25 to .45"
- Català actual: «entre ,30 i ,50», «de ,25 a ,45»
- Categoria: ERRADA (convenció tipogràfica del decimal) · Gravetat: BAIXA
- Proposta: «entre 0,30 i 0,50», «de 0,25 a 0,45»
- Justificació: tot i que la coma decimal és correcta (l'anglès usa punt: .30), en català formal el zero davant la coma és recomanat per a valors inferiors a la unitat (esADIR, guies d'estil científiques). La font anglesa ometia el zero (convenció anglosaxona del .30); en català convé restituir-lo. Recurrent.

### 6.3 «millora autoenganyadora»
- Ubicació: «El segon és la millora autoenganyadora: creure genuïnament una versió més positiva d'un mateix».
- Anglès: "The second is self-deceptive enhancement: genuinely believing a more positive version of oneself"
- Català actual: «la millora autoenganyadora»
- Categoria: TERMINOLOGIA · Gravetat: MITJANA
- Proposta: «l'autoengany afavoridor» / «l'engany d'un mateix favorable» (terme de Paulhus: *self-deceptive enhancement*)
- Justificació: «millora» per *enhancement* aquí és literal i confús (no es tracta de "millorar" res, sinó de l'autopercepció exageradament positiva). En la literatura catalana de Paulhus es parla d'«autoengany» / «engany d'un mateix»; «autoenganyadora» com a adjectiu és acceptable però «millora» falseja el constructe. Recomanat alinear amb el terme tècnic.

### 6.4 «la maximització de la favorabilitat»
- Ubicació: «fent que la maximització de la favorabilitat sigui genuïnament difícil».
- Anglès: "by making favourability-maximisation genuinely difficult"
- Català actual: «la maximització de la favorabilitat»
- Categoria: REGISTRE/CALC · Gravetat: BAIXA
- Proposta: «fent que sigui genuïnament difícil maximitzar la imatge favorable» / «...maximitzar la favorabilitat»
- Justificació: la nominalització encadenada «la maximització de la favorabilitat» calca l'aglutinat anglès *favourability-maximisation* i resulta feixuga; el català prefereix desfer-la amb verb. Naturalitat, no error.

### 6.5 «no pots simplement triar la resposta "més agradable"»
- Ubicació: «no pots simplement triar la resposta "més agradable" sense revelar quin tret perceps realment en elles».
- Anglès: "you cannot simply pick the 'nicer' answer without revealing which trait you actually perceive"
- Català actual: «quin tret perceps realment en elles»
- Categoria: ERRADA (concordança de referent) · Gravetat: MITJANA
- Proposta: «quin tret hi percebeu realment» (o «...percebeu realment en la persona»)
- Justificació: «en elles» no té antecedent femení plural clar (l'objecte és «la persona que estan avaluant»); el referent encavalca. Cal «hi» (pronom adverbial) o explicitar «en la persona». A més, per coherència de tractament, vós: «percebeu» (vegeu 6.8).

### 6.6 «circumplex AB5C» — comprovació
- Ubicació: «extrets del circumplex AB5C, que mapeja els adjectius en les interseccions del Big Five»; CTA: «s'inspira en el circumplex AB5C (Hofstee, de Raad & Goldberg, 1992)».
- Anglès: "drawn from the AB5C circumplex"
- Català actual: «circumplex AB5C»
- Categoria: correcte · Gravetat: — (fals positiu: «circumplex» és la forma correcta del terme — contrasta amb l'error «circumflex» detectat a 05-blog.md (R2). Aquest article l'escriu BÉ. Es registra com a encert per contrast.)

### 6.7 «pots» / «t'has preguntat» / «has experimentat» (entrada en «tu»)
- Ubicació: primer paràgraf: «Si alguna vegada has fet un test de personalitat i t'has preguntat... has experimentat en primera persona»; i CTA intermèdies «si tendiu a acceptar... puntuareu» (vós).
- Anglès: "If you have ever taken a personality test and wondered..., you have experienced..."
- Català actual: barreja: entrada en «tu» («has fet», «t'has preguntat», «has experimentat»), però el cos i altres CTA usen «vós» («si tendiu», «puntuareu», «Si us plau, sigueu honests», «Llegiu el disseny científic»).
- Categoria: REGISTRE (incoherència tu/vós dins el mateix article) · Gravetat: MITJANA
- Proposta: unificar a vós: «Si alguna vegada heu fet un test de personalitat i us heu preguntat... heu experimentat en primera persona».
- Justificació: aquest article SÍ barreja els dos tractaments internament (entrada en tu, cos en vós), cosa que és incidència de coherència segons el brief (model de vós). Vegeu R5 de 05-blog.md.

### 6.8 «se't força a revelar»
- Ubicació: «Se't força a revelar quins dels dos trets valorats et descriu amb més precisió».
- Anglès: "You are forced to reveal which of the two valued traits describes you more accurately"
- Català actual: «Se't força a revelar... et descriu»
- Categoria: REGISTRE (tractament) + ERRADA menor · Gravetat: BAIXA
- Proposta: «Quedeu obligat a revelar quin dels dos trets valorats us descriu amb més precisió» (vós) o, mantenint la impersonal, «Obliga a revelar...».
- Justificació: «se't força» reprèn el tractament de tu (incoherent amb el cos en vós, 6.7). A més «quins dels dos trets... et descriu» té dissonància de nombre («quins» plural amb «descriu» singular): hauria de ser «quin dels dos trets... et/us descriu».

### 6.9 «Bond», «Discipline», «Depth», «Presence», «Vision» en anglès al cos
- Ubicació: secció «Quines dimensions es distorsionen més»: «Bond (Amabilitat)», «Discipline (Responsabilitat)», «Depth (Neuroticisme)», «Presence (Extraversió)», «Vision (Obertura)»; i conclusions: «puntuacions de Bond i Discipline».
- Anglès: idem (els noms Cèrcol són en anglès a la font).
- Català actual: noms de dimensió Cèrcol en anglès («Bond», «Discipline», «Depth», «Presence», «Vision»).
- Categoria: TERMINOLOGIA (coherència de col·lecció) · Gravetat: BAIXA
- Proposta: decidir per a tota la col·lecció si els noms de dimensió Cèrcol es deixen en anglès («Bond», «Discipline») o es catalanitzen («Vincle», «Disciplina», «Profunditat», «Presència», «Visió»). Altres articles d'aquest lot usen «Disciplina», «Visió», «Profunditat», «Presència» en català i «Bond» en anglès: barreja inconsistent inter-article.
- Justificació: coherència terminològica de col·lecció. La nota final de l'article (que normalment fixa el mapatge) és absent ací; recomanat afegir-la o catalanitzar. No és error normatiu, per això BAIXA.

### Resum quantitatiu — social-desirability-bias-personality-tests
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (decimal, concordança «en elles», «se't força») | – | 1 | 2 |
| AMBIGÜITAT/FIDELITAT (descripció «,50») | – | 1 | – |
| TERMINOLOGIA («millora autoenganyadora», noms dimensió) | – | 1 | 1 |
| REGISTRE/CALC (tractament, «maximització de la favorabilitat») | – | 1 | 1 |
| Total incidències | **0** | **4** | **4** |

---

## "Què és el Neuroticisme? Comprendre la profunditat emocional en tu mateix i el teu equip" (`what-is-neuroticism-understanding-emotional-depth-at-work`)

### 7.1 «Hostilitat colérica» (taula de facetes i CTA)
- Ubicació: taula de facetes («**Hostilitat colérica** | Propens a la frustració...») i CTA final («a través de les sis facetes (Ansietat, Hostilitat Colérica, Depressió...)»).
- Anglès: "Angry Hostility"
- Català actual: «Hostilitat colérica» / «Hostilitat Colérica»
- Categoria: ERRADA (accent + adequació) · Gravetat: ALTA
- Proposta: «Hostilitat colèrica» (accent greu) — o, més transparent, «Irritabilitat / Hostilitat irascible».
- Justificació: la forma catalana és «colèric/colèrica» amb accent GREU (confirmat al diccionari de sinònims de Softcatalà i a la tradició DIEC2/DNV, on l'entrada és «colèric»); «colérica» amb accent agut és grafia castellana (*colérica*). Apareix dues vegades (taula + CTA) amb majúscula i tot. Error ortogràfic objectiu en un terme de faceta.

### 7.2 «Les persones altament autoconscienciades»
- Ubicació: principis pràctics: «Les persones altament autoconscienciades es veuen molt afectades per com es lliura la crítica».
- Anglès: "Highly self-conscious people are strongly affected by how criticism is delivered"
- Català actual: «altament autoconscienciades»
- Categoria: ERRADA (lèxic, faceta) · Gravetat: ALTA
- Proposta: «Les persones amb alta autoconsciència» / «molt autoconscients»
- Justificació: la faceta és «Autoconsciència» (*self-consciousness*), que el mateix article fixa a la taula. «autoconscienciades» barreja «autoconsciència» amb «conscienciar/conscienciat» (sensibilitzar), produint un mot erroni que canvia el sentit (de "pendent de l'avaluació social" a "sensibilitzat sobre una causa"). A més és incoherent amb la faceta de la taula.

### 7.3 «com es lliura la crítica» / «com es lliura»
- Ubicació: «es veuen molt afectades per com es lliura la crítica... es tracta de lliurar-lo d'una manera que realment es pugui rebre».
- Anglès: "how criticism is delivered... delivering it in a way that can actually be received"
- Català actual: «com es lliura la crítica», «lliurar-lo»
- Categoria: CALC (fals amic) · Gravetat: MITJANA
- Proposta: «com es transmet/es comunica/es formula la crítica», «transmetre-la d'una manera que realment es pugui rebre»
- Justificació: *deliver* aplicat a feedback/crítica és «transmetre», «comunicar», «donar» (donar feedback), no «lliurar» (que és entregar un objecte/paquet). Fals amic recurrent (cf. 1.7 d'aquest mateix lot). «rebre» com a parella sí encaixa amb «transmetre».

### 7.4 «desencadenar una resposta defensiva que bloqueja la informació»
- Ubicació: «La crítica personalitzada o desestimativa pot desencadenar una resposta defensiva que bloqueja la informació».
- Anglès: "Personal or dismissive criticism can trigger a defensive response that blocks the information"
- Català actual: «La crítica personalitzada o desestimativa»
- Categoria: FIDELITAT (fals amic) · Gravetat: MITJANA
- Proposta: «La crítica personal o desdenyosa/menyspreadora»
- Justificació: (a) *personal criticism* = «crítica personal» (atac a la persona), no «personalitzada» (*personalised*, feta a mida): canvi de sentit. (b) «desestimativa» (de *dismissive*) és calc; en català «desdenyós», «menyspreador» o «que tracta amb menyspreu». Doble fals amic.

### 7.5 «No patologitzis l'experiència» — tractament tu
- Ubicació: principis pràctics: «No patologitzis l'experiència»; CTA: «Troba la teva puntuació de Profunditat», «mesura la teva puntuació», «els col·legues que treballen estretament amb tu», «Entendre el teu perfil».
- Anglès: "Do not pathologise the experience", "Find your Depth score", "colleagues who work closely with you"
- Català actual: tractament de tu (patologitzis, la teva, amb tu).
- Categoria: REGISTRE (tractament) · Gravetat: MITJANA
- Proposta: unificar a vós: «No patologitzeu l'experiència», «Trobeu la vostra puntuació de Profunditat», «els col·legues que treballen estretament amb vós», «Entendre el vostre perfil».
- Justificació: model de llengua del brief (vós). Coherent internament en tu, però la col·lecció ha d'unificar-se; vegeu R5 de 05-blog.md.

### 7.6 «Estan reaccionant com el seu sistema nerviós està calibrat per reaccionar»
- Ubicació: «Un col·lega que està visiblement estressat... no és fràgil ni poc professional. Estan reaccionant com el seu sistema nerviós està calibrat per reaccionar».
- Anglès: "A colleague who is visibly stressed... is not fragile or unprofessional. They are reacting the way their nervous system is calibrated to react."
- Català actual: «Estan reaccionant com el seu sistema nerviós...»
- Categoria: ERRADA (concordança de nombre) · Gravetat: MITJANA
- Proposta: «Reacciona tal com el seu sistema nerviós està calibrat per reaccionar» (singular, concordant amb «Un col·lega»).
- Justificació: el subjecte és «Un col·lega» (singular); «Estan reaccionant» (plural) reprodueix el *they* singular epicè anglès, que en català no es manté: cal el singular «Reacciona». A més, «com» causal-modal aquí és millor «tal com». Trencament de concordança.

### 7.7 «el seu sistema nerviós està calibrat per reaccionar» / «per reaccionar» (final)
- Ubicació: mateix passatge.
- Anglès: "calibrated to react"
- Català actual: «calibrat per reaccionar»
- Categoria: correcte · Gravetat: — (fals positiu: «calibrat per (a) reaccionar» és recció acceptable; el sentit és final. Sense incidència; només es registra per descartar-lo.)

### 7.8 «48% variància heretable» / «variància»
- Ubicació: targeta d'estadística: «48% — variància heretable»; cos: «la variança en les puntuacions» (a l'article de biaix); ací «variància».
- Anglès: "48% heritable variance"
- Català actual: «variància»
- Categoria: TERMINOLOGIA (coherència inter-article) · Gravetat: BAIXA
- Proposta: triar una sola forma per a la col·lecció: «variància» (DIEC2/estadística) és correcta; l'article de biaix social usa «variança». Unificar.
- Justificació: tant «variància» com «variança» circulen, però la forma normativa estadística preferida és «variància» (DIEC2). Aquest article l'escriu bé; es registra perquè `social-desirability-bias` usa «variança»: incoherència de col·lecció (no error intern d'aquest article).

### 7.9 «contestada» (creativitat i Neuroticisme)
- Ubicació: «La relació entre el Neuroticisme i la creativitat és contestada, però alguna investigació suggereix...».
- Anglès: "The relationship between Neuroticism and creativity is contested, but some research suggests..."
- Català actual: «és contestada»
- Categoria: CALC (fals amic) · Gravetat: MITJANA
- Proposta: «és discutida / controvertida / debatuda»
- Justificació: *contested* = «discutit», «controvertit», «debatut»; «contestada» en català vol dir "respost" o "objecte de protesta" (moviment contestatari), no "sobre la qual no hi ha acord". Fals amic que altera el sentit.

### Resum quantitatiu — what-is-neuroticism-understanding-emotional-depth-at-work
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (colérica, «autoconscienciades», concordança «Estan reaccionant») | 2 | 1 | – |
| CALC/FIDELITAT (fals amic: «lliura», «personalitzada»/«desestimativa», «contestada») | – | 3 | – |
| REGISTRE (tractament tu/vós) | – | 1 | – |
| TERMINOLOGIA («variància»/«variança») | – | – | 1 |
| Total incidències | **2** | **5** | **1** |


## "Pot canviar la personalitat? El que diuen la investigació sobre coaching i teràpia" (`can-personality-be-changed-coaching-therapy-evidence`)

### 1.1 Concordança al títol: «El que diuen la investigació»
- Ubicació: títol de l'article (i camp `title.ca`).
- Anglès: "What coaching and therapy research says"
- Català actual: «El que **diuen** la investigació sobre coaching i teràpia»
- Categoria: ERRADA (concordança) · Gravetat ALTA
- Proposta: «El que **diu** la investigació sobre coaching i teràpia»
- Justificació: el subjecte és singular («la investigació»), per tant el verb ha de ser «diu», no «diuen». L'error és en un titular, molt visible, i es repeteix en el cos del primer paràgraf de la secció. Cf. les altres versions: ES «Lo que dicen» concorda perquè el subjecte hi és plural implícit, però en català el subjecte explícit és singular.

### 1.2 «comprometl't» — errata greu
- Ubicació: primer paràgraf («Treballa prou dur, comprometl't amb els hàbits correctes»).
- Anglès: "commit to the right habits"
- Català actual: «comprometl't amb els hàbits correctes»
- Categoria: ERRADA (ortografia/apostrofació) · Gravetat ALTA
- Proposta: «compromet-t'hi amb els hàbits correctes» o, més natural, «adopta els hàbits correctes».
- Justificació: «comprometl't» és una aglutinació inexistent; l'imperatiu pronominal de «comprometre's» amb complement amb «amb» demana reformulació («compromet-te amb...»). La forma actual no és cap paraula del català.

### 1.3 «promedia al voltant de ,54» — castellanisme verbal
- Ubicació: secció «Quant d'estable és la personalitat Big Five».
- Anglès: "averages around .54 across the full lifespan"
- Català actual: «l'estabilitat d'ordre de rang ... **promedia** al voltant de ,54»
- Categoria: CALC/TERMINOLOGIA (castellanisme) · Gravetat ALTA
- Proposta: «...**se situa de mitjana** al voltant de 0,54» o «**fa una mitjana** d'aproximadament 0,54».
- Justificació: el verb «promediar» (i el substantiu «promig») és un castellanisme; la forma catalana és «mitjana» / «fer la mitjana» / «de mitjana». Ho confirma l'Optimot (fitxa «Com es diu *promedio* en català? / *mitja* o *mitjana*») i la Direcció General de Política Lingüística.

### 1.4 Coma decimal sense el zero inicial: «,54», «,70»
- Ubicació: tota la secció d'estabilitat («promedia al voltant de ,54 ... puja a aproximadament ,70»; «Una correlació de ,70»).
- Anglès: ".54", ".70" (convenció anglosaxona amb punt i sense zero)
- Català actual: «,54», «,70», «,65», «,68», «,73»
- Categoria: ERRADA (convenció tipogràfica) · Gravetat MITJANA
- Proposta: «0,54», «0,70», «0,65»... (zero abans de la coma decimal).
- Justificació: en català la convenció és coma decimal PRECEDIDA de zero quan el valor és inferior a la unitat (0,54), no «,54» (que calca l'anglès «.54»). La resta de l'article ja escriu bé «d = 0,54», «d = 0,30 i 0,60»: per tant és també una incoherència interna. Recurrent (taula i cos).

### 1.5 «els teus iguals» / «la teva posició» — tractament de tu
- Ubicació: secció d'estabilitat («si puntues alt ... relació als teus iguals avui»; «consulta [si els trets...]»).
- Anglès: "if you score high ... relative to your peers"
- Català actual: tractament de «tu» sistemàtic («puntues», «els teus iguals», «consulta», «et proporciona», «conèixer el teu perfil»).
- Categoria: REGISTRE (tractament) · Gravetat MITJANA
- Proposta: si la col·lecció adopta el tractament de vós (model de l'auditoria), unificar a «puntueu», «els vostres iguals», «consulteu», «us proporciona», «el vostre perfil». Internament l'article és coherent en «tu»; la incidència és de model de col·lecció.
- Justificació: el brief fixa el tractament de vós per a les crides al lector. L'article és íntegrament en «tu», cosa que cal alinear amb la resta del blog.

### 1.6 «iguals» per *peers* — coherència terminològica
- Ubicació: secció d'estabilitat («relació als teus iguals», «la majoria dels teus iguals»).
- Anglès: "peers"
- Català actual: «els teus iguals»
- Categoria: TERMINOLOGIA (coherència) · Gravetat BAIXA
- Proposta: acceptable; «iguals» és bon català per a *peers*. Es registra perquè en altres articles del blog *peer* es tradueix com «parells» / «companys» / «companys d'equip»: cal una sola tria per a la col·lecció. Aquí «iguals» és, de fet, la més culta.
- Justificació: coherència inter-article (vegeu la nota 1.9 de 05-blog sobre *peer assessment*).

### 1.7 «recarreguen ... en lloc de la companyia» (recció «relació a»)
- Ubicació: secció d'estabilitat: «la teva posició relativa als teus iguals».
- Anglès: "your position relative to peers"
- Català actual: «la teva posició relativa **als** teus iguals» i, més amunt, «en relació **als** teus iguals».
- Categoria: ERRADA (recció preposicional) · Gravetat BAIXA
- Proposta: «en relació **amb** els teus iguals» / «**respecte als** teus iguals».
- Justificació: la locució normativa és «en relació amb» o «amb relació a» (Optimot); «en relació a» és tolerat però desaconsellat, i «relativa a + article» («als») és un calc. «Posició relativa respecte als iguals» és la forma neta.

### 1.8 «a nivell de tret» / «a nivell de símptoma»
- Ubicació: secció de teràpia («aquests canvis semblen ser a nivell de tret en lloc de simplement a nivell de símptoma»).
- Anglès: "trait-level rather than ... symptom-level"
- Català actual: «a nivell de tret ... a nivell de símptoma»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «**en el pla del** tret ... en el pla del símptoma» o «**a escala de** tret».
- Justificació: «a nivell de» quan no expressa alçària física és desaconsellat per les guies d'estil (Softcatalà, IEC); preferir «en el pla de» / «a escala de». Recurrent a la col·lecció (vegeu 2.7 de 05-blog).

### 1.9 «produeeixin» — errata
- Ubicació: secció de coaching («pràctiques ... que produeeixin els resultats»).
- Anglès: "practices ... that produce the results"
- Català actual: «que **produeeixin** els resultats»
- Categoria: ERRADA (errata) · Gravetat ALTA
- Proposta: «que **produeixin** els resultats»
- Justificació: «produeeixin» té una vocal doblada espúria; la forma del subjuntiu és «produeixin».

### 1.10 «resisteixin el canvi ràpid» — temps verbal
- Ubicació: secció «Quin és el canvi de personalitat realista» («s'estabilitzen considerablement a través de l'edat adulta, i **resisteixin** el canvi ràpid»).
- Anglès: "stabilise considerably through adulthood, and resist rapid change"
- Català actual: «...i **resisteixin** el canvi ràpid fins i tot sota intervencions intensives»
- Categoria: ERRADA (mode verbal) · Gravetat ALTA
- Proposta: «...i **resisteixen** el canvi ràpid».
- Justificació: la sèrie és enumeració d'indicatius («tenen», «s'estabilitzen»), per tant cal indicatiu «resisteixen», no el subjuntiu «resisteixin». Trenca la concordança de la coordinació.

### 1.11 «els avaluadors de parells» — *peer raters*
- Ubicació: secció «Com Cèrcol utilitza...» («Com que els avaluadors de parells observen el comportament»).
- Anglès: "peer raters observe behaviour"
- Català actual: «els avaluadors de parells»
- Categoria: TERMINOLOGIA (coherència) · Gravetat BAIXA
- Proposta: unificar amb la tria de la col·lecció per a *peer* (vegeu 1.6).
- Justificació: coherència inter-article.

### Resum quantitatiu Article 1
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (concordança, errata, mode, ortografia, tipografia) | 4 | 1 | 1 |
| CALC/TERMINOLOGIA (promediar, peer, "a nivell de") | 1 | – | 3 |
| REGISTRE (tractament) | – | 1 | – |
| Total incidències | **5** | **2** | **4** |

---

## "Gènere i personalitat Big Five: el que diu la recerca — i el que no diu" (`gender-and-personality-what-big-five-research-says`)

### 2.1 «mig desviació estàndard» — concordança de gènere
- Ubicació: secció «Per què les magnituds de l'efecte...» («estan separats per **mig** desviació estàndard»).
- Anglès: "separated by half a standard deviation"
- Català actual: «separats per **mig** desviació estàndard»
- Categoria: ERRADA (concordança) · Gravetat ALTA
- Proposta: «separats per **mitja** desviació estàndard».
- Justificació: «desviació» és femení, per tant «mitja desviació» (no «mig»). Error de concordança de gènere de l'adjectiu/quantificador.

### 2.2 «s'esberla» — tria lèxica dubtosa
- Ubicació: secció «Per què les magnituds de l'efecte...» («Aquí és on la narrativa popular **s'esberla** de manera més severa»).
- Anglès: "This is where the popular narrative breaks down most severely"
- Català actual: «la narrativa popular s'esberla de manera més severa»
- Categoria: REGISTRE/AMBIGÜITAT · Gravetat BAIXA
- Proposta: «...és on la narrativa popular **se'n va en orris** / **fa fallida** / **s'enfonsa** de manera més evident».
- Justificació: «esberlar-se» (clivellar-se, partir-se) és físic i poc idiomàtic per a *break down* (deixar de funcionar, ser insostenible). A més «de manera més severa» calca *most severely*; en català «severament» aplicat a un argument és anglicisme: millor «de manera més evident / clara». No és error de gramàtica, és naturalitat.

### 2.3 «esbiaixat per gènere» / «esbiaixades» — coherència amb «biaix»
- Ubicació: secció «Natura vs. criança» («respostes esbiaixades per gènere a causa de l'amenaça d'estereotip»).
- Anglès: "gender-biased responses ... stereotype threat"
- Català actual: «respostes esbiaixades per gènere»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: correcte. «esbiaixat» i «biaix» són les formes normatives (TERMCAT); es registra com a fals positiu per descartar-lo i confirmar coherència amb «biaix» a la resta de l'article.
- Justificació: cap incidència; «esbiaixades» és bon català (DIEC2/DNV).

### 2.4 «reduïxen» — incoherència morfològica (incoatiu)
- Ubicació: secció «La paradoxa de la igualtat de gènere» («on les restriccions socials es **reduïxen**, les diferències biològiques s'expressen més lliurement»).
- Anglès: "where social constraints are reduced"
- Català actual: «les restriccions socials es **reduïxen**»
- Categoria: REGISTRE/COHERÈNCIA (morfologia verbal) · Gravetat MITJANA
- Proposta: «es **redueixen**» (forma compartida DNV∩DIEC2 i coherent amb la resta del text, que usa «s'expressen», «existeixen», «contribueixen» amb -eix-).
- Justificació: «reduïxen» és la variant incoativa amb -ix valenciana col·loquial; conviu en el mateix paràgraf amb formes en -eix- («s'expressen» no és incoatiu, però «existeixen», «contribueixen» sí ho són i fan -eix-). Per al model neutre supradialectal de la col·lecció cal regularitzar a -eix-. Coherència morfològica (cf. principi 3 i incidència 2.9 de 05-blog).

### 2.5 «et diuen gairebé res» — negació incompleta
- Ubicació: secció final de conclusió («són modestes en magnitud pràctica, **et diuen gairebé res** sobre qualsevol persona específica»).
- Anglès: "they tell you almost nothing about any specific person"
- Català actual: «et diuen gairebé res sobre qualsevol persona específica»
- Categoria: ERRADA (negació) · Gravetat MITJANA
- Proposta: «**no et diuen gairebé res** sobre cap persona específica».
- Justificació: en català la negació amb «gairebé res» exigeix l'adverbi «no» («no et diuen gairebé res»); l'omissió calca l'anglès *tell you almost nothing*. A més «qualsevol persona» en context negatiu vol «cap persona». Doble qüestió. (Hi ha també el tractament de «tu» —«et diuen»— a alinear amb el model de vós: «no us diuen».)

### 2.6 «mai haurien de guiar» / «mai existeixen» — posició de «mai»
- Ubicació: títol de secció «Per què les diferències ... **mai** haurien de guiar els judicis individuals».
- Anglès: "Why Big Five Gender Differences Must Never Drive Individual Judgments"
- Català actual: «...mai haurien de guiar els judicis individuals»
- Categoria: ERRADA (negació) · Gravetat MITJANA
- Proposta: «...**no** haurien de guiar **mai** els judicis individuals» (o «...mai **no** haurien de guiar...»).
- Justificació: «mai» anteposat al verb sense «no» és acceptat col·loquialment, però en registre culte la norma demana el reforç negatiu «no» (Optimot: «mai (no)»). En un titular formal és preferible la forma plena.

### 2.7 «Veu el teu propi perfil» — imperatiu mal format
- Ubicació: títol de la secció CTA («**Veu** el teu propi perfil del Big Five — lliure de supòsits de gènere»).
- Anglès: "See your own Big Five profile — free of gender assumptions"
- Català actual: «**Veu** el teu propi perfil del Big Five»
- Categoria: ERRADA (morfologia verbal) · Gravetat ALTA
- Proposta: «**Mira** / **Consulta** el teu propi perfil...» (tu) o «**Vegeu** / **Consulteu** el vostre propi perfil...» (vós).
- Justificació: l'imperatiu de «veure» en 2a persona del singular és «veges»/«mira» (col·loquialment), MAI «veu» (que és 3a persona del present d'indicatiu, «ell veu», o el substantiu «veu»). «Veu el teu perfil» és agramatical i ambigu. Cal substituir per «Mira/Consulta» (o passar a vós amb «Vegeu/Consulteu»).

### 2.8 Demostratiu «aquesta» i tractament — coherència
- Ubicació: cos i CTA («La teva puntuació de Profunditat és la teva puntuació», «et mesura», «Si treballes en la contractació»).
- Anglès: tractament de "you"
- Català actual: «tu» sistemàtic.
- Categoria: REGISTRE (tractament) · Gravetat MITJANA
- Proposta: unificar a vós per al model de col·lecció: «La vostra puntuació», «us mesura», «Si treballeu en la contractació».
- Justificació: model de llengua del brief (vós per a crides al lector). Internament coherent en «tu»; cal alinear amb la col·lecció.

### Resum quantitatiu Article 2
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (concordança, negació, morfologia verbal) | 2 | 2 | – |
| REGISTRE/COHERÈNCIA (incoatiu, tractament, naturalitat) | – | 2 | 1 |
| TERMINOLOGIA (fals positiu «esbiaixat») | – | – | 1 |
| Total incidències | **2** | **4** | **2** |

---

## "Introvertits en entorns laborals extravertits: el que diu realment la recerca" (`introverts-in-extrovert-workplaces-what-research-says`)

### 3.1 Barreja de tractament: «Entra... et diu» (tu) vs «Compartiu / Creeu / Llegiu» (vós)
- Ubicació: tot l'article. Cos en «tu» («Entra en una oficina ... l'arquitectura **et diu**»); secció pràctica i CTA en «vós» («**Compartiu** les agendes», «**Creeu** canals», «**Separeu** la ideació», «**Protegiu** el temps», «**Llegiu** els patrons», «**Mesureu** la Distribució», «**Feu** l'avaluació», «on se situa cadascun dels **vostres** membres»).
- Anglès: "you" uniforme.
- Català actual: barreja tu/vós dins del mateix article.
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat ALTA
- Proposta: unificar tot l'article a **vós**: «Entreu en una oficina ... l'arquitectura **us diu**». Les instruccions per als directius ja són en vós; cal alinear-hi l'obertura.
- Justificació: el brief fixa el tractament de vós; aquí la incoherència és INTERNA (no només de col·lecció), perquè l'obertura va de «tu» i el gruix d'instruccions de «vós». És la incidència més greu de l'article.

### 3.2 «actuar-hi» — referent confús
- Ubicació: segon paràgraf («encara que els llocs de treball hagin trigat a **actuar-hi**»).
- Anglès: "even if workplaces have been slow to act on it"
- Català actual: «...hagin trigat a actuar-hi»
- Categoria: AMBIGÜITAT · Gravetat BAIXA
- Proposta: «...hagin trigat a **actuar en conseqüència**» o «a **aplicar-ho**».
- Justificació: el pronom «hi» queda penjat (act *on it* = sobre la recerca); «actuar-hi» és fosc en català. Millor explicitar.

### 3.3 «la veu més alta s'imposa» / «la veu més alta de la sala guanya»
- Ubicació: primer paràgraf i taula («sessions de brainstorming on **la veu més alta** s'imposa»; «**La veu més alta** de la sala guanya»).
- Anglès: "where the loudest voice carries the day"; "Loudest voice in the room wins"
- Català actual: «la veu més alta»
- Categoria: AMBIGÜITAT/CALC · Gravetat MITJANA
- Proposta: «la veu **més forta**» / «**qui crida més** s'imposa».
- Justificació: *loud* = fort (de volum), no «alt» (que en català és d'alçària o de to agut). «Veu alta» significa to agut o «en veu alta»; per a volum cal «veu forta». Calc semàntic. Recurrent (cos i taula).

### 3.4 «implicar-se ... amb la informació entrant»
- Ubicació: secció «Punts Forts Cognitius» («tendeixen a **implicar-se** de manera més lenta i exhaustiva amb la informació entrant»).
- Anglès: "engage more slowly and thoroughly with incoming information"
- Català actual: «implicar-se ... amb la informació entrant»
- Categoria: CALC · Gravetat BAIXA
- Proposta: «tendeixen a **processar** la informació entrant de manera més lenta i exhaustiva» o «a **treballar-la**».
- Justificació: «implicar-se amb informació» calca *engage with information*; en català «implicar-se» és per a causes o persones, no per a dades. Millor «processar / treballar / abordar».

### 3.5 Majúscules a tots els titulars (estil títol anglès)
- Ubicació: tots els encapçalaments de secció («El que **R**ealment és la Introversió...», «Com els **L**locs de **T**reball **A**mb **B**iaix...», «Els **P**unts **F**orts **C**ognitius...»).
- Anglès: Title Case (majúscula inicial a cada paraula plena), convenció anglesa.
- Català actual: es calca el Title Case anglès («Els Punts Forts Cognitius que Acompanyen la Baixa Extraversion»).
- Categoria: CALC (convenció tipogràfica) · Gravetat MITJANA
- Proposta: capitalització catalana — només majúscula a la primera paraula i als noms propis: «Els punts forts cognitius que acompanyen la baixa Extraversió».
- Justificació: en català els títols no van en Title Case; la majúscula a cada mot ple és calc de l'anglès (esADIR, guia d'estil de l'IEC). Afecta gairebé tots els titulars de l'article. Recurrent.

### 3.6 «Extraversion» sense accentuar/adaptar
- Ubicació: títols i cos («cap a l'introvertit en **Extraversion**», «la baixa **Extraversion**»), conviu amb «extraversió» en minúscula i «extravertit».
- Anglès: "Extraversion"
- Català actual: «Extraversion» (forma anglesa) coexistint amb «extraversió»/«extravertit».
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: «**Extraversió**» (nom de la dimensió, amb majúscula i accentuada) de manera uniforme.
- Justificació: la dimensió té forma catalana «Extraversió» (com Amabilitat, Neuroticisme...); deixar-la com «Extraversion» (anglès) és inconsistent amb «extravertit»/«extraversió» que el mateix text usa, i amb la resta del blog. Recurrent.

### 3.7 «pot ser el que la seva anàlisi escrita és més precisa»
- Ubicació: secció pràctica, acció «Llegiu els patrons» («El membre de l'equip que menys parla ... pot ser **el que la seva anàlisi escrita és més precisa**»).
- Anglès: "may be the one whose written analysis is most precise"
- Català actual: «pot ser el que la seva anàlisi escrita és més precisa»
- Categoria: ERRADA (relatiu) · Gravetat MITJANA
- Proposta: «...pot ser aquell **de qui** l'anàlisi escrita és més precisa» o «...aquell **la** **anàlisi escrita del qual** és més precisa».
- Justificació: el relatiu possessiu «whose» no es tradueix per «el que ... la seva», que és un calc (relatiu de + possessiu redundant). Cal «de qui» o «del qual». Construcció agramatical en registre culte.

### 3.8 «els parts interessades» — no apareix aquí (vegeu art. enginyer)
- (sense incidència en aquest article)

### Resum quantitatiu Article 3
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| REGISTRE/COHERÈNCIA (tractament) | 1 | – | – |
| CALC (Title Case, "veu alta", "implicar-se") | – | 2 | 1 |
| TERMINOLOGIA ("Extraversion") | – | 1 | – |
| ERRADA (relatiu possessiu) | – | 1 | – |
| AMBIGÜITAT ("actuar-hi") | – | – | 1 |
| Total incidències | **1** | **4** | **3** |

---

## "Personalitat i estils d'aprenentatge: el que la recerca realment demostra" (`personality-and-learning-styles-what-research-supports`)

### 4.1 «Tampoc no té suport en les evidències» — sentit alterat
- Ubicació: primer paràgraf («...durant dècades. **Tampoc** no té suport en les evidències de la recerca»).
- Anglès: "...for decades. It is **also** not supported by the research evidence."
- Català actual: «Tampoc no té suport en les evidències de la recerca.»
- Categoria: FIDELITAT · Gravetat MITJANA
- Proposta: «**A més**, no té suport en l'evidència de la recerca» o «**I tampoc** no té suport empíric».
- Justificació: l'anglès *also* afegeix un segon retret (a banda d'estar molt citat, a més no té base). «Tampoc» pressuposa una negació prèvia que aquí no hi és (la frase anterior és afirmativa: «s'ha citat ... durant dècades»), de manera que «Tampoc» queda mal lligat lògicament. Cal «A més». A més, «les evidències» en plural calca el cast.; en català «l'evidència» (la base empírica) sol anar en singular.

### 4.2 «ha resultat insuficient» vs «found wanting»
- Ubicació: secció «El que la teoria ... afirma» («s'ha provat acuradament i **ha resultat insuficient**»).
- Anglès: "it has been tested carefully and found wanting"
- Català actual: «ha resultat insuficient»
- Categoria: correcte · Gravetat — (sense incidència; «ha resultat insuficient» reprodueix bé *found wanting*. Es registra per descartar fals positiu.)

### 4.3 «es medeia» — errata/forma incorrecta
- Ubicació: secció «Obertura a l'experiència...» («l'efecte **es medeia** en gran part a través de la Disciplina»).
- Anglès: "the effect is mediated largely through Conscientiousness"
- Català actual: «l'efecte es medeia en gran part»
- Categoria: ERRADA (morfologia verbal) · Gravetat ALTA
- Proposta: «l'efecte **es vehicula** / **està mediat** / **es media** en gran part a través de la Disciplina».
- Justificació: «medeia» no és cap forma del català; el verb «mediar» fa «media» (es media), i «mediatitzar»/«estar mediat» són alternatives. La forma actual és un híbrid inexistent. (El terme tècnic de mediació estadística admet «mediat per»/«mediació».)

### 4.4 «de baix cap amunt» / «de dalt cap avall» — no apareix aquí (vegeu art. enginyer)
- (sense incidència en aquest article)

### 4.5 «afalagadora» — fals positiu
- Ubicació: secció «El que la teoria ... afirma» («La teoria sobreviu ... perquè és intuïtiva, **afalagadora** (tothom té una manera especial d'aprendre)»).
- Anglès: "flattering (everyone has a special way of learning)"
- Català actual: «afalagadora»
- Categoria: correcte · Gravetat — (sense incidència; «afalagador -a» és la forma normativa per a *flattering* segons el GDLC/diccionari.cat. Es registra per descartar confusió amb el castellanisme «halagador».)
- Justificació: «afalagador» (que afalaga) és correcte; no s'ha de confondre amb el barbarisme «halagador».

### 4.6 «els comentaris» per *feedback* vs «retroalimentació»
- Ubicació: secció «Neuroticisme i ansietat» («Els aprenents d'alta Profunditat tendeixen a processar els **comentaris** negatius...»; «Per a orientació pràctica ... en converses de **retroalimentació**»). Conviu amb «retroalimentació» (mateixa secció) i amb el títol d'enllaç «com donar retroalimentació informada».
- Anglès: "negative feedback" / "feedback conversations"
- Català actual: barreja «comentaris» i «retroalimentació» per a *feedback*.
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar a «**retroalimentació**» (o, si s'accepta el manlleu, «*feedback*») a tot l'article; «comentaris» és vague i barreja el terme tècnic amb un mot genèric.
- Justificació: dins del mateix bloc temàtic conviuen dos termes per al mateix constructe (*feedback*). La resta del blog fixa «retroalimentació» (vegeu 2.6/3.5 de 05-blog); cal coherència.

### 4.7 «la alta Profunditat» — apostrofació
- Ubicació: secció «Neuroticisme i ansietat» («la penalització de rendiment que imposa **la alta** Profunditat sota pressió»).
- Anglès: "the performance penalty that high Depth imposes"
- Català actual: «la alta Profunditat»
- Categoria: ERRADA (apostrofació) · Gravetat ALTA
- Proposta: «**l'alta** Profunditat».
- Justificació: l'article femení «la» s'apostrofa davant de mot començat per vocal àtona o tònica que no sigui i/u àtones; «alta» comença per «a» tònica, per tant «l'alta». Error d'apostrofació.

### 4.8 «separar la habilitat de la identitat» — apostrofació
- Ubicació: secció «Neuroticisme i ansietat» i taula («que separen explícitament **la habilitat** de la identitat»; taula: «separar **habilitat d'identitat**»).
- Anglès: "separate skill from identity"
- Català actual: «la habilitat»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «**l'habilitat**».
- Justificació: «habilitat» comença per «a» (la h és muda), per tant l'article femení s'apostrofa: «l'habilitat». Error d'apostrofació.

### 4.9 «un repte intel·lectual genuí» / «motivació intrínseca» — registre correcte
- Ubicació: secció «Obertura...».
- Categoria: correcte · Gravetat — (sense incidència; bona traducció de *genuine intellectual challenge*. Es registra per descartar fals positiu sobre «genuí».)

### 4.10 «desengançar-se» / «desengancxar» — tria lèxica
- Ubicació: secció «Conscienciositat...» («tenen una probabilitat ... alta de **desengançar-se** de programes»).
- Anglès: "disengage from programmes"
- Català actual: «desengançar-se»
- Categoria: TERMINOLOGIA/REGISTRE · Gravetat BAIXA
- Proposta: «**desvincular-se** / **abandonar** / **perdre la implicació en** programes».
- Justificació: «desengançar-se» (literalment, deixar d'estar enganxat) és col·loquial i físic; per a *disengage* (perdre la implicació/el compromís) és més precís «desvincular-se» o «deixar d'implicar-se». No és error, és precisió de registre.

### 4.11 «Conscienciositat» / «Neuroticisme» com a noms acadèmics
- Ubicació: títols de secció («**Conscienciositat** i estudi sistemàtic», «**Neuroticisme** i ansietat davant exàmens»).
- Categoria: correcte · Gravetat — (sense incidència; el brief permet noms acadèmics en blog/ciència. A més el text aparella sempre amb el nom Cèrcol —«Disciplina», «Profunditat»—. Es registra per descartar fals positiu.)

### Resum quantitatiu Article 4
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (apostrofació, morfologia verbal) | 2 | 1 | – |
| FIDELITAT ("Tampoc"→"A més") | – | 1 | – |
| TERMINOLOGIA/COHERÈNCIA (feedback, desengançar) | – | 1 | 1 |
| Total incidències | **2** | **3** | **1** |

---

## "La personalitat dels emprenedors: el que la recerca sobre el Big Five diu realment" (`personality-of-entrepreneurs-what-research-says`)

### 5.1 «major Openness, menor Agreeableness» — dimensions en anglès a la descripció
- Ubicació: camp `description.ca` i targetes `stat-grid` del cos.
- Anglès: "higher Openness, lower Agreeableness"
- Català actual: «major **Openness**, menor **Agreeableness**» (descripció); targetes: «**Openness** → entrepreneurial intent», «**Conscientiousness** → venture survival», «Low **Agreeableness** → willingness to negotiate hard».
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: a la descripció (text de cara a l'usuari i SEO), usar les formes catalanes/Cèrcol coherents amb el cos: «major **Obertura/Visió**, menor **Amabilitat/Bond**». Les targetes `stat-grid` han quedat **sense traduir de l'anglès** (tot el contingut intern: «entrepreneurial intent», «venture survival past year 2», «willingness to negotiate hard»): cal traduir-les al català.
- Justificació: incoherència interna —el cos tradueix («major Disciplina, Visió i Presència; menor Depth i Bond») però la descripció i les targetes deixen els noms i les etiquetes en anglès. Encara que el brief permet noms acadèmics, deixar blocs sencers de UI sense traduir (les `stat-label`) és una pèrdua de fidelitat per al lector català. Recurrent (4 targetes).

### 5.2 «Depth» i «Bond» sense traduir al cos i a la taula
- Ubicació: taula de dimensions i cos («Neuroticism | **Depth** | Més baixa que els directius»; «menor **Depth** i Bond»; «la teva Visió, Disciplina, Presència, **Bond** i **Depth**»).
- Anglès: "Depth", "Bond"
- Català actual: «Depth» i «Bond» (anglès) al costat de «Visió», «Disciplina», «Presència» (català).
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: «**Profunditat**» (Depth) i «**Vincle**» (Bond), coherents amb la nomenclatura Cèrcol catalana usada a la resta de la col·lecció (cf. article d'estils d'aprenentatge: «Vincle (Agreeableness)», «Profunditat (Neuroticism)»).
- Justificació: «Bond» i «Depth» són els noms Cèrcol EN; en català la col·lecció empra «Vincle» i «Profunditat». Barrejar «Visió/Disciplina/Presència» (traduïts) amb «Depth/Bond» (sense traduir) és incoherent dins del mateix article i amb el blog. Recurrent.

### 5.3 «s'assembla als anècdotes» — gènere + recció
- Ubicació: secció «El mite...» («El problema amb aquest retrat és que **s'assembla als anècdotes** i al biaix de supervivència»).
- Anglès: "it is assembled from anecdote and survivorship bias"
- Català actual: «s'assembla als anècdotes i al biaix de supervivència»
- Categoria: ERRADA (gènere + fidelitat) · Gravetat ALTA
- Proposta: «...és que **s'ha bastit a partir d'anècdotes** i del biaix de supervivència» (o «es construeix a partir de l'anècdota»).
- Justificació: dos problemes. (a) «anècdota» és femení: «**les** anècdotes», no «els anècdotes» → «als anècdotes» és error de gènere. (b) Sobretot, l'anglès diu *assembled from* (muntat/construït a partir de), NO *resembles* («s'assembla a»): és un contrasentit. «S'assembla als anècdotes» canvia el significat. Cal «s'ha bastit/construït a partir d'anècdotes».

### 5.4 «extrovertits» / «extrovertit» — coherència amb «extravertit»
- Ubicació: secció «El mite...» («per tant han de ser **extrovertits**»). La resta de la col·lecció usa «extravertit».
- Anglès: "extraverted"
- Català actual: «extrovertits»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: «**extravertits**» (forma preferida, coherent amb «Extraversió»/«extravertit» de l'article d'introvertits i d'enginyers).
- Justificació: «extrovertit» (amb -o-) és admès però la col·lecció i el terme «Extraversió» demanen «extravertit» (amb -a-) per coherència; DNV/DIEC2 recullen «extravertit» com a principal.

### 5.5 «l'statu quo» / «l'staff» — apostrofació davant s líquida
- Ubicació: secció «El mite...» («Han de qüestionar **l'statu quo**»).
- Anglès: "question the status quo"
- Català actual: «l'statu quo»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «**l'statu quo**» és incorrecte → «**el status quo**» / «**l'statu quo**» no: davant de mots començats per s líquida (s+consonant) l'article masculí NO s'apostrofa: «**el statu quo**» (com «el stock», «el striptease»).
- Justificació: norma d'apostrofació catalana: davant de s seguida de consonant (s líquida) no s'apostrofen ni «el» ni «de» («el striptease», «un stand»). Per tant «el statu quo». «l'statu quo» és error. (Llatinisme habitual: «l'statu quo» és calc de la grafia anglesa/castellana.)

### 5.6 «angustiants» — castellanisme
- Ubicació: secció «La tensió ... fundació vs. escala» («troben aquestes decisions genuïnament **angustiants**»).
- Anglès: "find these decisions genuinely distressing"
- Català actual: «genuïnament angustiants»
- Categoria: ERRADA/CALC (castellanisme) · Gravetat ALTA
- Proposta: «genuïnament **angoixants** / **angoixoses**» (o «**que els angoixen** de debò»).
- Justificació: «angustiant» és castellanisme (cast. *angustiante*); en català és «angoixant» / «angoixós» (de «angoixa»), DIEC2/DNV. Barbarisme cru.

### 5.7 «directitud» — mot inexistent
- Ubicació: enllaç intern («Baixa Agreeableness en el lideratge: quan la **directitud** ajuda i quan fa mal»).
- Anglès: "when directness helps and when it harms"
- Català actual: «quan la directitud ajuda»
- Categoria: ERRADA (lèxic inexistent) · Gravetat ALTA
- Proposta: «quan la **franquesa** / **la fermesa** / **el caràcter directe** ajuda».
- Justificació: «directitud» no existeix en català (és un calc del cast. *contundencia*/ang. *directness*). Per a *directness* (qualitat de ser directe) cal «franquesa», «caràcter directe» o «fermesa». Mot inventat.

### 5.8 «son en part» — accentuació
- Ubicació: secció «Per què el context...» («Les diferències d'Agreeableness ... **son** en part un efecte de selecció»).
- Anglès: "are partly a selection effect"
- Català actual: «son en part un efecte de selecció»
- Categoria: ERRADA (accentuació) · Gravetat ALTA
- Proposta: «**són** en part un efecte de selecció».
- Justificació: 3a persona del plural del verb ser és «són» (amb accent), per a distingir-la de «son» (el dormir / possessiu). Errada d'accent diacrític.

### 5.9 «d'un miliard de dòlars» — errata
- Ubicació: secció «El que la recerca ... no pot dir-te» («No prediu qui construirà una empresa **d'un miliard de dòlars**»).
- Anglès: "who will build a billion-dollar company"
- Català actual: «una empresa d'un miliard de dòlars»
- Categoria: ERRADA (ortografia) · Gravetat MITJANA
- Proposta: «una empresa de **mil milions** de dòlars» (o «d'un **miliardo**» no normatiu → evitar).
- Justificació: «miliard» no és la forma catalana estàndard; *billion* (10^9) en català és «mil milions» (o el manlleu «miliard», poc establert i no recollit per DIEC2). Millor «mil milions de dòlars». A més «miliard» amb una sola l és, en qualsevol cas, grafia dubtosa.

### 5.10 «s'auto-exclouen» — prefix amb guionet
- Ubicació: secció «Per què el context...» («massa costós i **s'auto-exclouen** de l'emprenedoria»).
- Anglès: "self-select out of entrepreneurship"
- Català actual: «s'auto-exclouen»
- Categoria: ERRADA (ortografia de prefixos) · Gravetat MITJANA
- Proposta: «s'**autoexclouen**».
- Justificació: el prefix «auto-» s'aglutina sense guionet (autoexcloure, autoinforme, autopercepció), com fixa la norma ortogràfica IEC/AVL i el propi glossari de l'auditoria. Cf. incidència 3.8 de 05-blog.

### Resum quantitatiu Article 5
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (gènere, accent, apostrofació, prefix, lèxic inexistent, castellanisme) | 4 | 3 | – |
| TERMINOLOGIA/COHERÈNCIA (Depth/Bond, stat-grid, extrovertit) | – | 2 | 1 |
| Total incidències | **4** | **5** | **1** |

---

## "Personalitat de l'enginyer de programari: el que mostra la recerca del Big Five" (`software-engineer-personality-what-research-shows`)

### 6.1 «histò ricament» / «histò riques» — espai espuri (errata greu)
- Ubicació: primer paràgraf («processos de contractació tècnica que **histò ricament** han recompensat») i secció «L'estereotip...» («les condicions de treball **histò riques** dels enginyers»).
- Anglès: "historically rewarded" / "the historical working conditions"
- Català actual: «histò ricament», «histò riques» (amb un espai al mig del mot després de «ò»).
- Categoria: ERRADA (errata d'edició) · Gravetat ALTA
- Proposta: «**històricament**», «**històriques**».
- Justificació: hi ha un espai en blanc inserit dins del mot («histò » + «ricament»), probablement un artefacte de codificació de l'accent. Trenca la paraula. Recurrent (almenys 2 ocurrències).

### 6.2 «Responsabilitat» vs «Discipline»/«Conscientiousness» — terme Cèrcol incoherent
- Ubicació: tot l'article. El cos diu «alta **Responsabilitat** (fiable, organitzat...)», «associats amb la **Responsabilitat**», «estableix la **Responsabilitat** com el predictor universal»; però després usa «la **Discipline** prediu...», «enginyers amb alta **Discipline**», i la taula i enllaços usen «**Conscientiousness** (Discipline)» i «Què és la **Responsabilitat**».
- Anglès: "Conscientiousness" / "Discipline" (nom Cèrcol)
- Català actual: tres etiquetes per a la mateixa dimensió: «Responsabilitat», «Discipline» (anglès) i «Conscientiousness».
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat ALTA
- Proposta: el nom Cèrcol català d'aquesta dimensió és **Disciplina** (cf. tots els altres articles del blot: «Conscientiousness | Disciplina»). Cal: (a) substituir «Discipline» (anglès) per «Disciplina»; (b) decidir si la dimensió s'anomena «Disciplina» (Cèrcol) — llavors «Responsabilitat» és una traducció ad hoc errònia que cal eliminar — i deixar «Conscientiousness» només com a nom acadèmic aparellat.
- Justificació: «Responsabilitat» NO és el nom Cèrcol (que és «Disciplina») ni la traducció habitual de *Conscientiousness* a la col·lecció; barrejar-la amb «Discipline» en anglès i «Conscientiousness» crea tres noms per a un sol constructe central. És la incidència terminològica més greu de l'article. Recurrent (>6 ocurrències).

### 6.3 «Discipline», «Vision», «Bond», «Presence» sense traduir
- Ubicació: cos i taula («alta **Vision**», «baix en **Vision**», «baixa **Amabilitat (Bond)** i **Extraversió (Presence)**», «Bond i Presence prediuen»).
- Anglès: noms Cèrcol EN.
- Català actual: «Vision», «Bond», «Presence» (anglès) conviuen amb «Visió», «Presència», «Amabilitat».
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: «**Visió**», «**Vincle**», «**Presència**» (formes Cèrcol catalanes) de manera uniforme.
- Justificació: incoherència interna evident: el mateix paràgraf escriu «Extraversió (Presence)» i «Vision». Cal traduir tots els noms de dimensió. Recurrent.

### 6.4 «més matisos» — concordança/lèxic
- Ubicació: segon paràgraf («Els resultats són **més matisos** —i més pràcticament útils— del que suggereix l'estereotip»).
- Anglès: "The findings are more nuanced ... than the stereotype suggests"
- Català actual: «Els resultats són més matisos»
- Categoria: ERRADA (categoria gramatical) · Gravetat ALTA
- Proposta: «Els resultats són **més matisats**» (adjectiu/participi) — no «matisos» (substantiu plural, «els matisos»).
- Justificació: *nuanced* és «matisat» (adjectiu). «matisos» és el substantiu («els matisos de color»); «són més matisos» és agramatical. Cal el participi adjectiu «matisats».

### 6.5 «més pràcticament útils» — calc d'ordre adverbial
- Ubicació: segon paràgraf («—i **més pràcticament útils**—»); també «pràcticament més importants» a la secció de tensió.
- Anglès: "more practically useful" / "most practically important"
- Català actual: «més pràcticament útils»
- Categoria: CALC (ordre/adverbi) · Gravetat MITJANA
- Proposta: «—i **més útils en la pràctica**—»; «un dels resultats **més importants en termes pràctics**».
- Justificació: la inserció de l'adverbi «pràcticament» entre el quantificador i l'adjectiu calca l'anglès *practically useful*; a més «pràcticament» en català sol significar «gairebé» (ambigüitat). Millor «útils en la pràctica» / «en termes pràctics».

### 6.6 «distinct» — mot anglès sense traduir
- Ubicació: secció «Estil cognitiu vs. personalitat» («està relacionat però és **distinct** de la personalitat»).
- Anglès: "is related to but distinct from personality"
- Català actual: «és distinct de la personalitat»
- Categoria: ERRADA (manlleu cru / falta de traducció) · Gravetat ALTA
- Proposta: «està relacionat **amb** la personalitat **però n'és distint** / **però se'n diferencia**».
- Justificació: «distinct» és anglès sense traduir; el català és «distint» / «diferent». A més la recció: «distint **de**» (relacionat **amb**... però distint **de**...). Doble error.

### 6.7 «novedoses» / «no obvies» — castellanismes
- Ubicació: secció «Obertura ... creativitat» («generar solucions arquitectòniques **novedoses**, identificar enfocaments algorítmics **no obvies**»).
- Anglès: "novel architectural solutions ... non-obvious algorithmic approaches"
- Català actual: «novedoses», «no obvies»
- Categoria: ERRADA/CALC (castellanisme + concordança) · Gravetat ALTA
- Proposta: «solucions arquitectòniques **noves** / **innovadores**, identificar enfocaments algorítmics **no evidents** / **poc obvis**».
- Justificació: (a) «novedós» és castellanisme (cast. *novedoso*); en català «nou», «innovador», «inèdit». (b) «obvi» fa el femení «òbvia/òbvies»; «enfocaments» és masculí, per tant caldria «obvis», però el mot natural és «evidents». «no obvies» acumula castellanisme i error de concordança.

### 6.8 «de baix cap amunt» / «de dalt cap avall»
- Ubicació: secció «Estil cognitiu» («descomposició sistemàtica de problemes **de baix cap amunt**»; «raonament arquitectònic ambigu **de dalt cap avall**»).
- Anglès: "bottom-up problem decomposition" / "top-down ... reasoning"
- Català actual: «de baix cap amunt», «de dalt cap avall»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «**ascendent** (de baix a dalt)» / «**descendent** (de dalt a baix)», o «de baix **a** dalt» / «de dalt **a** baix».
- Justificació: «de baix cap amunt» és comprensible però pesat; les formes establertes són «ascendent/descendent» o «de baix a dalt / de dalt a baix». Millora de naturalesa.

### 6.9 «els parts interessades» — gènere
- Ubicació: secció «Com la diversitat...» («pot infracomunicar-se amb **els parts interessades** del producte»).
- Anglès: "may under-communicate with product stakeholders"
- Català actual: «els parts interessades»
- Categoria: ERRADA (concordança de gènere) · Gravetat ALTA
- Proposta: «**les parts interessades**» (o «els **agents** interessats» / «les **parts implicades**»).
- Justificació: «part» és femení: «les parts interessades». «els parts» és error de gènere (i discordança amb «interessades», ja femení). 

### 6.10 «infracomunicar-se» / «infracomunicar» — neologisme dubtós
- Ubicació: mateixa frase que 6.9 («pot infracomunicar-se amb...»).
- Anglès: "may under-communicate with"
- Català actual: «infracomunicar-se»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «pot **comunicar-se de manera insuficient** amb...» / «pot **comunicar massa poc** amb...».
- Justificació: «infracomunicar» calca *under-communicate*; el prefix «infra-» no és productiu aquí en català. Millor perífrasi.

### 6.11 «repartiment del coneixement» — calc de *knowledge-sharing*
- Ubicació: secció final («Bond i Presence prediuen l'eficàcia del **repartiment del coneixement**»; «la seva capacitat per coordinar, **compartir coneixements**»).
- Anglès: "knowledge-sharing"
- Català actual: «repartiment del coneixement» (i, abans, «compartir coneixements»).
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: unificar a «**compartició del coneixement**» / «**intercanvi de coneixement**» (i mantenir «compartir coneixements»).
- Justificació: *knowledge-sharing* no és «repartiment» (dividir entre parts) sinó «compartir / intercanviar». A més, el mateix article ja diu «compartir coneixements» en un altre punt: incoherència interna.

### Resum quantitatiu Article 6
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (errata, gènere, categoria gramatical, castellanismes, manlleu) | 5 | – | – |
| TERMINOLOGIA/COHERÈNCIA (Responsabilitat/Discipline, dimensions EN, knowledge-sharing) | 1 | 1 | 1 |
| CALC/REGISTRE ("pràcticament útils", "infracomunicar", "de baix cap amunt") | – | 1 | 2 |
| Total incidències | **6** | **2** | **3** |

---

## "Què és l'Obertura a l'Experiència? Creativitat, curiositat i els seus límits" (`what-is-openness-to-experience-creativity-curiosity-and-its-limits`)

### 7.1 «el trobament més fort i replicat» — terme inadequat per a *finding*
- Ubicació: secció «Què prediu...» («La relació ... és el **trobament** més fort i replicat per a aquesta dimensió») i secció «Rendiment en la formació» («Un **trobament** consistent en la investigació ocupacional és que...»).
- Anglès: "the strongest and most replicated finding" / "One consistent finding"
- Català actual: «el trobament més fort i replicat», «Un trobament consistent»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: «la **troballa** més sòlida i replicada», «Una **troballa** consistent» (o «un resultat consistent»).
- Justificació: per a un *research finding* el català estàndard és «**troballa**» (DIEC2/DNV) o «resultat», no «trobament» (acte de trobar/trobada). La resta de la col·lecció usa «troballes» (cf. 05-blog). «trobament» és inusual i inconsistent. A més «més fort» per *strongest* aplicat a una relació estadística és millor «més sòlida / robusta». Recurrent.

### 7.2 «gravituen cap a» — castellanisme/calc
- Ubicació: primer paràgraf («Els qui puntuen alt **gravituen** cap a les noves idees»).
- Anglès: "High scorers gravitate toward new ideas"
- Català actual: «gravituen cap a les noves idees»
- Categoria: ERRADA/CALC (castellanisme) · Gravetat ALTA
- Proposta: «**graviten** cap a les noves idees» (o «**se senten atrets per** / **tendeixen cap a** les noves idees»).
- Justificació: el verb català és «gravitar» → «graviten» (com «habiten», «editen»); «gravituen» és una flexió inexistent, possiblement creuament amb verbs incoatius. Forma agramatical.

### 7.3 «el trobament més fort» / «engagement» — anglicisme cru
- Ubicació: secció «Què prediu...» («L'alta Obertura prediu l'**engagement** amb les arts, la cultura...»).
- Anglès: "High Openness predicts engagement with arts, culture..."
- Català actual: «prediu l'engagement amb les arts»
- Categoria: ERRADA/CALC (anglicisme cru) · Gravetat ALTA
- Proposta: «prediu la **implicació** / la **dedicació** / l'**interès actiu** **per** les arts, la cultura...».
- Justificació: «engagement» és anglès sense traduir; en català «implicació», «compromís», «participació», «interès». A més la recció «amb les arts» calca *with*; «implicació en/per». Manlleu no adaptat en text de cara a l'usuari.

### 7.4 «contrafactuals» — anglicisme/terme tècnic
- Ubicació: taula de facetes, faceta Fantasia («còmode amb hipòtesis i **contrafactuals**»).
- Anglès: "comfortable with hypotheticals and counterfactuals"
- Català actual: «hipòtesis i contrafactuals»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: «hipòtesis i **suposicions contrafactuals**» / «**escenaris contrafactuals**» (substantivar amb un nom: «els contrafactuals» és calc; «contrafactual» és adjectiu).
- Justificació: «contrafactual» és adjectiu (raonament contrafactual); usar-lo com a substantiu pluralitzat («els contrafactuals») calca l'anglès. Millor afegir el nucli nominal.

### 7.5 «Molt sintonitzat amb la bellesa» — concordança amb la faceta
- Ubicació: taula de facetes, faceta Estètica («**Molt sintonitzat** amb la bellesa en l'art...»).
- Anglès: "Strongly attuned to beauty in art..."
- Català actual: «Molt sintonitzat amb la bellesa»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «Molt **receptiu** / **sensible** a la bellesa de l'art, la música...» (i recció «de», no «en»).
- Justificació: «sintonitzat amb» per *attuned to* és calc tècnic (sintonia de ràdio); per a sensibilitat estètica és més natural «sensible a» / «receptiu a». A més «bellesa en l'art» → «bellesa de l'art».

### 7.6 «condicionada pel lloc de treball» / «job-conditional» — tria
- Ubicació: secció «Per què l'Obertura no prediu...» («l'Obertura és **condicionada pel lloc de treball** d'una manera **en que** la Conscienciositat no ho és»).
- Anglès: "Openness is job-conditional in a way that Conscientiousness is not"
- Català actual: «condicionada pel lloc de treball d'una manera en que la Conscienciositat no ho és»
- Categoria: ERRADA (relatiu) + REGISTRE · Gravetat MITJANA
- Proposta: «l'Obertura **depèn del tipus de feina** d'una manera **en què** la Conscienciositat no ho fa» (relatiu «en què», amb accent).
- Justificació: «en que» (sense accent) és error: el relatiu amb preposició porta «què» tònic → «en què». A més «condicionada pel lloc de treball» és comprensible però «depèn del tipus de feina/rol» és més clar (*job-conditional* = segons la feina). L'error d'accent del relatiu és el nucli de la incidència.

### 7.7 «aterrar l'avió» — modisme calcat
- Ubicació: secció «Alta Obertura en equips» («També són els que poden tenir dificultats per **aterrar l'avió**»).
- Anglès: "the ones who may struggle to land a plane"
- Català actual: «dificultats per aterrar l'avió»
- Categoria: CALC (modisme) + recció · Gravetat MITJANA
- Proposta: «els que poden **tenir dificultats per concretar** / **per tancar / per arribar a una decisió**» o, si es manté la metàfora, «per fer **aterrar l'avió**» (causatiu) / «per **fer aterrar** l'avió».
- Justificació: (a) «aterrar» en català és intransitiu (l'avió aterra); «aterrar l'avió» (transitiu) és incorrecte —cal «fer aterrar l'avió». (b) La metàfora *land the plane* (rematar, concloure) no és lexicalitzada en català i pot resultar fosca; preferible explicitar el sentit. Cf. glossari: verbs de moviment intransitius (com «emergir») no admeten ús transitiu directe.

### 7.8 «la recerca de possibilitats» / «possibility-seeking» — coherència «recerca/investigació»
- Ubicació: secció «L'Obertura ... com a Visió» («la qualitat orientada al futur i a la **recerca de possibilitats**»).
- Anglès: "the forward-oriented, possibility-seeking quality"
- Català actual: «orientada al futur i a la recerca de possibilitats»
- Categoria: TERMINOLOGIA/AMBIGÜITAT · Gravetat BAIXA
- Proposta: «orientada al futur i a **la cerca / la recerca de noves possibilitats**» — acceptable; es registra perquè «recerca» en aquest article significa també «investigació científica» (p. ex. «la investigació sobre l'Obertura»), i conviuen «recerca»/«investigació» per a *research*.
- Justificació: l'article alterna «la investigació» i «la recerca» per a *research* (p. ex. «La investigació sobre l'Obertura», «el rendiment en la investigació ocupacional»); cal triar-ne una per a la col·lecció. Aquí «recerca de possibilitats» (= cerca) afegeix una tercera accepció de «recerca» que pot confondre. Coherència lèxica.

### 7.9 «La investigació sobre [per què...]» / «la investigació» vs «la recerca»
- Ubicació: diverses seccions («La **investigació** sobre l'Obertura», «la **investigació** ocupacional», «La **investigació** sobre [per què l'autoavaluació...]») enfront de «la **recerca** de possibilitats» i del títol del blog que usa «recerca».
- Anglès: "research"
- Català actual: barreja «investigació» (cos) i «recerca» (títol/altres articles).
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: unificar *research* a «**recerca**» (o «investigació») a tota la col·lecció. Aquest article usa majoritàriament «investigació»; d'altres del batch usen «recerca» (p. ex. «el que diu realment la recerca»). Decidir-ne una.
- Justificació: coherència inter-article; totes dues són normatives, però han de ser uniformes.

### Resum quantitatiu Article 7
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA/CALC (gravituen, engagement) | 2 | – | – |
| ERRADA (relatiu "en que") + CALC ("aterrar l'avió") | – | 2 | – |
| TERMINOLOGIA/COHERÈNCIA (troballa/trobament, recerca/investigació, contrafactuals) | – | 1 | 3 |
| REGISTRE/CALC ("sintonitzat") | – | – | 1 |
| Total incidències | **2** | **3** | **4** |

---



## "Pots falsificar un test de personalitat — i importa?" (`can-you-fake-a-personality-test`)

### 1.1 «sabesses» (entradeta, 2n paràgraf)
- Anglès: "And if you knew what they were looking for, could you just answer accordingly?"
- Català actual: «I si sabesses el que estan buscant, podries simplement respondre en conseqüència?»
- Categoria: ERRADA (morfologia verbal) · Gravetat ALTA
- Proposta: «I si sabessis el que busquen, podries simplement respondre en conseqüència?» (o, si s'adopta el model neutre amb subjuntiu valencià, «saberes», forma de DNV)
- Justificació: «sabesses» no és cap forma normativa de l'imperfet de subjuntiu de *saber*. Les formes acceptades són «sabés/sabessis/sabés...» (model general, DIEC2) o «saberes» (model valencià, DNV). «sabesses» sembla un encreuament agramatical entre les dues sèries; cal corregir-la sí o sí.

### 1.2 Tractament «tu» de tot l'article enfront del «vós» d'altres articles de la col·lecció
- Anglès: "If you have ever taken a personality test... you have probably wondered"
- Català actual: «Si alguna vegada has fet un test... t'has preguntat», «el teu camí», «menys útil per a tu», «com et descriuen», «ets propietari de les teves dades»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar el tractament de tota la col·lecció. Segons el model de vós de l'auditoria, caldria «heu fet», «us heu preguntat», «el vostre camí», «útil per a vós», «com us descriuen», «sou propietari de les vostres dades».
- Justificació: aquest article fa servir «tu» de manera coherent internament, però conviu en la mateixa col·lecció amb articles que tracten de «vós» (p. ex. `groupthink`: «recolliu», «Inicieu», «el vostre equip»; `job-satisfaction`: «Pregunteu», «la vostra feina»). El model de llengua de l'auditoria fixa el vós per a les crides al lector. Incidència de coherència de col·lecció, no d'error gramatical intern.

### 1.3 «mig desviació estàndard» (cos, secció "Pots falsificar...")
- Anglès: "increase by around half a standard deviation or more"
- Català actual: «augmenten en aproximadament mig desviació estàndard o més»
- Categoria: ERRADA (concordança de gènere) · Gravetat ALTA
- Proposta: «augmenten aproximadament en mitja desviació estàndard o més»
- Justificació: *desviació* és femení; el quantificador ha de concordar: «mitja desviació», no «mig desviació». L'error es repeteix a la cita destacada («mig a un desviació estàndard») i al subtítol de l'stat-card. Cal corregir totes les ocurrències.

### 1.4 «d'aproximadament mig a un desviació estàndard» (cita de Viswesvaran & Ones)
- Anglès: "mean-score elevations of approximately one-half to one standard deviation"
- Català actual: «elevacions de puntuació mitjana d'aproximadament mig a un desviació estàndard»
- Categoria: ERRADA (concordança) · Gravetat ALTA
- Proposta: «elevacions de la puntuació mitjana d'aproximadament mitja a una desviació estàndard»
- Justificació: doble error de concordança («mig»→«mitja», «un»→«una» davant de *desviació*, femení). A més, «d'aproximadament mig a un» calca l'estructura anglesa; «de mitja a una desviació» és més natural.

### 1.5 «dades més honestos» (taula i enllaços de lectura)
- Anglès: "more honest data"
- Català actual: «dades més honestos», «el context ideal per a dades honestos», «obtenir dades més honestos»
- Categoria: ERRADA (concordança de gènere) · Gravetat ALTA
- Proposta: «dades més honestes», «dades honestes»
- Justificació: *dades* és femení plural; l'adjectiu ha de ser «honestes», no «honestos». Recurrent (cos, taula i secció "Lectura addicional"). Comparteix arrel amb 1.3-1.4: descontrol sistemàtic de la concordança en aquest article.

### 1.6 «no són immune a ell» (cos, secció "Pots falsificar...")
- Anglès: "Personality tests are not immune to it."
- Català actual: «Els tests de personalitat no són immune a ell.»
- Categoria: ERRADA (concordança de nombre + recció) · Gravetat ALTA
- Proposta: «Els tests de personalitat no en són immunes.» (o «no hi són immunes»)
- Justificació: «immune» ha de concordar en plural amb «els tests»: «immunes». A més, «a ell» referit a *biaix* (cosa, no persona) és un calc; el pronom feble «en/hi» és la solució catalana natural.

### 1.7 «en directions positives» (cos, "Quanta falsificació...")
- Anglès: "inflate their self-assessments in positive directions"
- Català actual: «inflar les seves auto-avaluacions en directions positives»
- Categoria: ERRADA (ortografia) · Gravetat ALTA
- Proposta: «inflar les seves autoavaluacions en direccions positives»
- Justificació: «directions» és un anglicisme/errata cru; la forma catalana és «direccions». A més «auto-avaluacions» amb guionet és incorrecte: el prefix *auto-* s'aglutina («autoavaluacions»), com ja fa el mateix text amb «autoinforme» i «autopresentació».

### 1.8 «auto-engany» / «auto-avaluacions» (cos)
- Anglès: "self-deception" / "self-assessments"
- Català actual: «l'auto-engany», «les seves auto-avaluacions»
- Categoria: ERRADA (ortografia de prefix) · Gravetat MITJANA
- Proposta: «l'autoengany», «les seves autoavaluacions»
- Justificació: el prefix *auto-* s'escriu aglutinat sense guionet davant de mot que no comenci per la mateixa vocal (norma IEC/AVL de prefixos). El text ja escriu correctament «autoinforme», «autocomprensió», «autopresentació»: incoherència ortogràfica interna.

### 1.9 «pantalla de selecció» (cos, "Per què el problema real...")
- Anglès: "When it is repurposed as a selection screen..."
- Català actual: «Quan es reorienta com una pantalla de selecció»
- Categoria: FIDELITAT/CALC (fals amic) · Gravetat MITJANA
- Proposta: «Quan es reorienta com un filtre de selecció» (o «com una criba/garbell de selecció»)
- Justificació: *screen* en aquest sentit és «filtre/sedàs/criba», no «pantalla» (display). «pantalla de selecció» indueix a llegir-ho com una pantalla d'ordinador. La versió danesa diu «udvælgelsesfilter» i l'alemanya «Selektionsfilter»: confirmen el sentit de «filtre».

### 1.10 «obstacle de selecció» vs «porta» (cos)
- Anglès: "If you use personality data as a selection hurdle — as a gate that determines..."
- Català actual: «Si uses les dades de personalitat com a obstacle de selecció — com una porta que determina...»
- Categoria: correcte · Gravetat —
- Justificació: «obstacle de selecció» per *selection hurdle* i «porta» per *gate* són traduccions defensables i transparents. Es registra per descartar fals positiu (no és error).

### 1.11 «el que elimina tant la capacitat de falsificar» (secció "Com Cèrcol aborda...")
- Anglès: "...anonymously, which removes both the ability to fake..."
- Català actual: «responen parells d'adjectius d'elecció forçada de manera anònima, el que elimina tant la capacitat de falsificar...»
- Categoria: CALC (castellanisme sintàctic) · Gravetat MITJANA
- Proposta: «..., cosa que elimina tant la capacitat de falsificar...» (o «..., la qual cosa elimina...»)
- Justificació: «el que» com a relatiu neutre de represa d'una oració sencera és un calc del castellà *lo que*; en català culte la represa demana «cosa que» / «la qual cosa». Apareix dues vegades en aquesta secció.

### Resum quantitatiu — `can-you-fake-a-personality-test`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (morfologia, concordança, ortografia) | 5 | 1 | – |
| CALC (sintàctic, fals amic) | – | 2 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| FIDELITAT | – | (comptat a 1.9) | – |
| Total incidències | **5** | **4** | **0** |

---

## "El pensament de grup i la personalitat: causes i prevenció basada en l'evidència" (`groupthink-personality-causes-prevention`)

### 2.1 «Aportació anònima pre-deliberació» (títol de subsecció ###2)
- Anglès: "Anonymous Pre-Deliberation Input"
- Català actual: «Aportació anònima pre-deliberació»
- Categoria: CALC (sintaxi nominal anglesa) · Gravetat MITJANA
- Proposta: «Aportació anònima prèvia a la deliberació» (o «...abans de la deliberació»)
- Justificació: «pre-deliberació» com a modificador postposat juxtaposat calca l'estructura compositiva anglesa (*pre-deliberation input*). En català cal una construcció preposicional («prèvia a la deliberació»). El mateix calc reapareix dins del cos: «El moment pre-deliberació evita l'ancoratge» → «El fet de recollir-les abans de la deliberació evita l'ancoratge».

### 2.2 «la matemàtica social» (subsecció advocat del diable)
- Anglès: "changes the social math"
- Català actual: «canvia la matemàtica social»
- Categoria: CALC (lèxic) · Gravetat BAIXA
- Proposta: «canvia l'equació social» (o «capgira el càlcul social»)
- Justificació: *math* ací és metafòric («el càlcul cost-benefici»); «la matemàtica social» en singular sona a disciplina acadèmica i és poc idiomàtic. La versió alemanya tradueix «soziale Gleichung» (equació) i la francesa «la logique sociale»; «equació social» o «càlcul social» recullen millor el sentit.

### 2.3 «no questionin» (subsecció "Baixa Visió")
- Anglès: "may not question whether the approach itself is correct"
- Català actual: «pot ser que no questionin si l'enfocament en si mateix és correcte»
- Categoria: ERRADA (ortografia) · Gravetat ALTA
- Proposta: «pot ser que no qüestionin si l'enfocament en si mateix és correcte»
- Justificació: «questionin» sense dièresi és una errata: la forma correcta és «qüestionin» (la *u* de *qüestionar* és sonora i duu dièresi davant de *e/i*). El mateix text escriu bé «qüestionen» en altres llocs: errata puntual.

### 2.4 «escassos salvaguardes contra les males» (subsecció "Baixa Visió")
- Anglès: "poor safeguards against bad ones"
- Català actual: «socis fiables per executar bones decisions i escassos salvaguardes contra les males»
- Categoria: ERRADA (gènere/lèxic) + FIDELITAT · Gravetat MITJANA
- Proposta: «...i un pobre salvaguarda contra les dolentes» o, millor, «...i mals contrapesos davant de les decisions equivocades»
- Justificació: dos problemes. (a) *poor* aquí no vol dir «escassos» (quantitat) sinó «de mala qualitat/deficients»: es perd el sentit de la font. (b) «salvaguarda» en català és femení (*la salvaguarda*), per tant «escasses/pobres salvaguardes», no «escassos». A més «les males» és el·líptic i col·loquial; millor «les decisions dolentes/equivocades».

### 2.5 «d'antemà» (subseccions advocat del diable)
- Anglès: "if team members know in advance"
- Català actual: «si els membres de l'equip saben d'antemà que existeix el rol»
- Categoria: CALC (castellanisme) · Gravetat ALTA
- Proposta: «si els membres de l'equip saben per endavant (o d'avançada / amb antelació) que existeix el rol»
- Justificació: «d'antemà» és un castellanisme cru (*de antemano*); no és normatiu en català. Formes correctes: «per endavant», «d'avançada», «amb antelació», «de bestreta». (Optimot recull «per endavant» i «d'antuvi» com a equivalents catalans.)

### 2.6 «Aportació anònima... recolliu aportacions» — tractament «vós» (coherent intern)
- Anglès: "collect written input from all members"
- Català actual: «recolliu aportacions escrites de tots els membres», «assegurar que l'equip inclogui», «Diagnostiqueu», «Inicieu l'avaluació del vostre equip»
- Categoria: correcte · Gravetat —
- Justificació: aquest article aplica el tractament de **vós** de manera coherent (imperatius «recolliu, Diagnostiqueu, Inicieu»; possessius «el vostre equip»), que és exactament el model de llengua fixat per l'auditoria. Es registra com a referència positiva: és l'article que millor aplica el vós i el que hauria de servir de patró per unificar la resta de la col·lecció (vegeu 1.2).

### 2.7 «socis fiables» (subsecció "Baixa Visió")
- Anglès: "reliable partners for executing good decisions"
- Català actual: «Això els fa socis fiables per executar bones decisions»
- Categoria: FIDELITAT (matís lèxic) · Gravetat BAIXA
- Proposta: «Això els fa col·laboradors (o aliats) fiables a l'hora d'executar bones decisions»
- Justificació: *partner* en aquest context d'equip és «col·laborador/aliat/company», no «soci» (que en català remet sobretot a la relació mercantil o associativa). No és error greu, però «soci» desplaça lleugerament el sentit cap a l'àmbit empresarial-jurídic.

### Resum quantitatiu — `groupthink-personality-causes-prevention`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (ortografia, gènere) | 1 | 1 | – |
| CALC (castellanisme, sintaxi) | 1 | 1 | 1 |
| FIDELITAT | – | (comptat a 2.4) | 1 |
| Total incidències | **2** | **2** | **2** |

---

## "Satisfacció laboral i personalitat: el que realment prediu quant us agrada la vostra feina" (`job-satisfaction-personality-what-predicts-it`)

### 3.1 «enumererà» (entradeta, 1r paràgraf)
- Anglès: "they will list situational factors"
- Català actual: «Pregunteu a la majoria de persones què fa feliç algú a la seva feina, i enumererà factors situacionals»
- Categoria: ERRADA (errata + concordança) · Gravetat ALTA
- Proposta: «...i enumeraran factors situacionals» (o «n'enumeraran»)
- Justificació: doble problema. (a) «enumererà» és una errata per «enumerarà» (vocal repetida). (b) El subjecte és «la majoria de persones» (plural lògic, reprès en anglès per *they*): cal concordança plural, «enumeraran». Tal com està, deixa un singular orfe sense antecedent clar.

### 3.2 «Aquests factors importem» (entradeta, 1r paràgraf)
- Anglès: "These factors matter."
- Català actual: «Aquests factors importem.»
- Categoria: ERRADA (morfologia verbal) · Gravetat ALTA
- Proposta: «Aquests factors importen.»
- Justificació: errata flagrant de persona: «importem» és 1a persona del plural («nosaltres importem»). El subjecte és «aquests factors» (3a persona del plural): «importen».

### 3.3 «cronònicament» (cos, "El Neuroticism..." i descripció)
- Anglès: "chronically dissatisfied"
- Català actual: «que estan cronònicament insatisfetes en el seu rol actual»; descripció: «cronònicament insatisfet»
- Categoria: ERRADA (ortografia) · Gravetat ALTA
- Proposta: «crònicament insatisfetes», «crònicament insatisfet»
- Justificació: «cronònicament» és una errata (síl·laba *-non-* intrusa) per «crònicament». Apareix tant al cos com a la descripció (`description.ca`), per tant és molt visible en la fitxa de l'article.

### 3.4 «de ser discerning» (cos, "El Neuroticism...")
- Anglès: "It is not about having high standards or being discerning."
- Català actual: «Això no es tracta d'haver-hi estàndards alts ni de ser discerning.»
- Categoria: ERRADA (anglicisme cru) + recció · Gravetat ALTA
- Proposta: «No es tracta de tenir estàndards alts ni de ser exigent (o perspicaç/primmirat).»
- Justificació: «discerning» és una paraula anglesa sense traduir deixada al text català: cal traduir-la («exigent», «primmirat», «de criteri fi»). A més «es tracta d'haver-hi estàndards alts» és agramatical: «haver-hi» (existencial) no regeix aquí; cal «tenir estàndards alts». Doble error en una sola frase.

### 3.5 «el ajust» (cos, "L'Openness..."/"Com l'Adequació...")
- Anglès: "the fit between..."
- Català actual: apareix «el ajust» en construccions del tipus «el ajust entre la personalitat»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «l'ajust»
- Justificació: davant de mot masculí començat per vocal, l'article masculí s'apostrofa: «l'ajust», no «el ajust». (Errada d'apostrofació; cal revisar totes les ocurrències del terme al text.)

### 3.6 «el vostre gra disposicional» (cos, "Com l'Adequació Persona-Feina...")
- Anglès: "working in an environment that goes against your dispositional grain"
- Català actual: «treballar en un entorn que va en contra del vostre gra disposicional»
- Categoria: CALC (calc idiomàtic) · Gravetat MITJANA
- Proposta: «treballar en un entorn que va a contrapèl de la vostra disposició natural» (o «...que contraria la vostra inclinació de fons»)
- Justificació: *to go against the grain* és una expressió idiomàtica anglesa; traduir *grain* literalment per «gra» produeix una imatge opaca en català («gra disposicional» no significa res). L'equivalent idiomàtic català és «a contrapèl»/«a repèl».

### 3.7 «escurça la permanència» (cos, "Com l'Adequació...")
- Anglès: "shortens tenure"
- Català actual: «augmenta l'estrès, redueix el rendiment i escurça la permanència»
- Categoria: FIDELITAT/AMBIGÜITAT · Gravetat BAIXA
- Proposta: «...i escurça la permanència al lloc (la durada del vincle laboral / l'antiguitat)»
- Justificació: *tenure* aquí és el temps que la persona es manté al lloc de treball; «la permanència» tota sola és ambigua (permanència de què?). Convé concretar «la permanència al lloc» o «la durada de la relació laboral».

### 3.8 «específica i accionable» (secció final "Mesureu el Vostre...")
- Anglès: "specific, actionable clarity about person-environment fit"
- Català actual: «de la insatisfacció vaga a la claredat específica i accionable sobre l'adequació persona-entorn»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «...a la claredat específica i aplicable sobre l'adequació persona-entorn» (o «...sobre la qual es pot actuar»)
- Justificació: *actionable* = «aplicable / sobre el qual es pot actuar»; «accionable» en català culte significa "que es pot accionar (un mecanisme)". Calc recurrent a la col·lecció (criteri fixat al glossari de l'auditoria).

### 3.9 Tractament «vós» coherent (descartar fals positiu)
- Anglès: "what actually predicts how much you like your work"
- Català actual: «quant us agrada la vostra feina», «Pregunteu», «Mesureu el Vostre Propi Perfil», «conèixer el vostre propi perfil», «Podeu fer l'instrument complet»
- Categoria: correcte · Gravetat —
- Justificació: l'article aplica el **vós** de manera consistent (títol, crides a l'acció, possessius). És coherent i s'ajusta al model de l'auditoria; es registra per descartar fals positiu i per contrastar amb `can-you-fake` (1.2), que va de «tu».

### Resum quantitatiu — `job-satisfaction-personality-what-predicts-it`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (errata, morfologia, apostrofació, recció) | 4 | 1 | – |
| CALC (idiomàtic, anglicisme) | – | 2 | – |
| FIDELITAT/AMBIGÜITAT | – | – | 1 |
| Total incidències | **4** | **3** | **1** |

---

## "Personalitat i mentoria: què fa un bon mentor — i un bon mentorat" (`personality-and-mentoring-what-makes-a-good-mentor`)

### 4.1 Barreja de tractament «vós» i «tu» dins del mateix article
- Anglès: "Understanding how your own personality profile creates blind spots..." / "Start at cercol.team/instruments... to understand your own profile"
- Català actual: conviuen «vegeu» (vós, imperatiu, ×múltiples), «el vostre propi perfil de personalitat», «com us veieu a vosaltres mateixos» amb «Comença a cercol.team/instruments», «fes l'avaluació individual gratuïta», «entendre el teu propi perfil»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat ALTA
- Proposta: unificar a **vós** en tot l'article: «Comenceu a...», «feu l'avaluació individual gratuïta», «entendre el vostre propi perfil».
- Justificació: incoherència interna greu: en el penúltim paràgraf l'article tracta de «vós» («com us veieu a vosaltres mateixos», «el vostre propi perfil») i en el següent salta a «tu» («Comença», «fes», «el teu propi perfil») dins de la mateixa idea. A diferència de 1.2 (coherent intern, incoherent inter-article), aquí la barreja és dins d'un sol text i a frases contigües. ALTA.

### 4.2 «el mentorat... correixin riscos» (subsecció "Obertura (Vision)")
- Anglès: "more likely to take developmental risks that stretch their existing repertoire"
- Català actual: «és més probable que correixin riscos de desenvolupament que estirin el seu repertori existent»
- Categoria: ERRADA (lèxic/errata greu) · Gravetat ALTA
- Proposta: «és més probable que assumeixin (o corrin) riscos de desenvolupament que amplien el seu repertori existent»
- Justificació: «correixin» no és cap forma verbal catalana vàlida aplicable a «riscos». Sembla un encreuament fallit de «córrer (riscos)» amb «corregir». L'expressió correcta és «córrer un risc» → «corrin riscos» o «assumir riscos» → «assumeixin riscos». Error que trenca la frase.

### 4.3 «què no estàs dient?» / «Que no estàs dient?» (taula resum)
- Anglès: "External challenge prompt: asking 'What aren't you saying?'"
- Català actual: «Estímul de desafiament extern: preguntar "Que no estàs dient?"»
- Categoria: ERRADA (ortografia interrogativa) + REGISTRE · Gravetat MITJANA
- Proposta: «...preguntar "Què no esteu dient?"» (vós) o, com a mínim, «"Què no dius?"»
- Justificació: (a) interrogatiu accentuat: cal «Què» (pronom interrogatiu tònic), no «Que» àton. (b) «estàs dient» és tractament de tu, incoherent amb el vós dominant de les seccions finals (vegeu 4.1); a més, la perífrasi «estàs dient» calca el progressiu anglès, quan el present simple «dieu/dius» basta.

### 4.4 «el seguiment que fa que el mentoring funcioni» / «Conscienciositat... el seguiment» (subtítol i cos)
- Anglès: "Conscientiousness (Discipline): the follow-through that makes mentoring stick"
- Català actual: «el seguiment que fa que el mentoring funcioni»; cos: «la manca de seguiment», «no fa el seguiment»
- Categoria: FIDELITAT (matís lèxic) · Gravetat MITJANA
- Proposta: distingir *follow-through* (complir/dur a terme els compromisos, «compliment», «constància») de *follow-up* («seguiment»). Per al subtítol: «la constància que fa que la mentoria arreli»; per a «mentee no segueix»→ «el mentorat no compleix els compromisos».
- Justificació: l'anglès usa *follow-through* (portar les coses fins al final, constància en el compliment), no *follow-up* (seguiment posterior). «seguiment» desplaça el sentit cap a "monitoratge", quan el text parla de complir el que un s'ha compromès a fer. La versió alemanya tria «Konsequenz» (constància) i la danesa «opfølgning»: el català guanyaria amb «constància/compliment». A més «mentoring» es deixa en anglès al subtítol mentre la resta del text usa «mentoria»: petita incoherència terminològica.

### 4.5 «mentoring» vs «mentoria» (incoherència terminològica)
- Anglès: "mentoring"
- Català actual: conviuen «mentoria» (títol, cos: «La mentoria és una d'aquelles paraules», «relacions de mentoria») i «mentoring» (subtítols: «el seguiment que fa que el mentoring funcioni»; «fortaleses de mentoria» i «resultats del mentoring» en el mateix paràgraf)
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: triar una sola forma. «Mentoria» és la forma catalana recollida (DNV/Optimot accepten «mentoria» i «mentoratge»); convé usar-la a tot arreu i reservar «mentoring» només si es vol el manlleu cru, però aleshores de manera uniforme.
- Justificació: el text alterna «mentoria», «mentoring» i fins i tot «mentoratge» implícit sense criteri. Cal unificar per coherència terminològica.

### 4.6 «Ragins i Verbos (2007)... els mentors que van crear el major impacte» (subsecció Obertura)
- Anglès: "mentors who created the greatest developmental impact were those who were able to expand the mentee's conceptual frame"
- Català actual: «els mentors que van crear el major impacte de desenvolupament eren aquells que eren capaços d'ampliar el marc conceptual del mentorat»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «els mentors que tenien més impacte en el desenvolupament eren els que eren capaços d'ampliar el marc conceptual del mentorat»
- Justificació: «el major impacte» calca el superlatiu anglès amb article + «major»; en català és més natural «més impacte / el més gran impacte». «aquells que» és correcte però pesat; «els que» alleugereix. Millora de naturalesa, no error.

### 4.7 «La raó més comuna per la qual les relacions... rendeixen per sota del seu potencial» (secció final)
- Anglès: "The most common reason mentoring relationships underperform..."
- Català actual: «La raó més comuna per la qual les relacions de mentoria rendeixen per sota del seu potencial no és la manca de bona voluntat — és els punts cecs.»
- Categoria: ERRADA (concordança del verb copulatiu) · Gravetat MITJANA
- Proposta: «...no és la manca de bona voluntat: són els punts cecs.»
- Justificació: «és els punts cecs» fa coincidir un verb singular amb un atribut plural; en l'oració copulativa d'identificació el verb concorda amb l'atribut plural: «són els punts cecs». (Cf. la mateixa estructura ben resolta en altres llengües.)

### 4.8 «el ajut de valoració» — comprovació (fals positiu, correcte)
- Anglès: "Cèrcol's Witness peer-rating tool"
- Català actual: «L'eina de valoració per parells Testimoni de Cèrcol»
- Categoria: correcte · Gravetat —
- Justificació: «eina de valoració per parells» és bona traducció de *peer-rating tool* i «Testimoni» respecta la regla de producte (mai "observador"). Es registra per descartar fals positiu. (Nota de coherència inter-article: `social desirability`/altres usen «de parells» i «entre iguals» alhora; convé fixar-ne una per a la col·lecció, però dins d'aquest article és coherent.)

### Resum quantitatiu — `personality-and-mentoring-what-makes-a-good-mentor`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (lèxic, concordança, ortografia) | 1 | 2 | – |
| REGISTRE/COHERÈNCIA (tractament tu/vós) | 1 | – | 1 |
| TERMINOLOGIA/FIDELITAT (mentoring, follow-through) | – | 2 | – |
| Total incidències | **2** | **4** | **1** |

---

## "La personalitat dels CEOs d'èxit: el que la recerca diu realment" (`personality-of-successful-ceos-what-research-says`)

### 5.1 «els CEOs» / «dels CEOs» (títol i cos)
- Anglès: "The personality of successful CEOs"
- Català actual: «La personalitat dels CEOs d'èxit», «els CEOs narcisistes», «CEOs introvertits»
- Categoria: ERRADA (formació del plural de sigla) · Gravetat MITJANA
- Proposta: «els CEO», «dels CEO» (sigla invariable) o, si es vol marcar el plural, recórrer al determinant: «els directius executius». En català, les sigles NO formen el plural afegint *-s*.
- Justificació: la norma catalana (Optimot; guia d'estil de l'IEC i de Softcatalà) estableix que les sigles són invariables: el plural es marca amb l'article/context, no amb «-s» («els PC», «les ONG», no «els PCs», «les ONGs»). «CEOs» és un calc de l'anglès/castellà. Recurrent a tot l'article i al títol/descripció. (El castellà fa el mateix calc, però la norma catalana és clara.)

### 5.2 «de qui es llegeix el CV dues vegades» / «el ajust» — comprovació
- Anglès: "whose CV gets read twice"
- Català actual: «de qui es llegeix el CV dues vegades»
- Categoria: correcte · Gravetat —
- Justificació: traducció natural i correcta; «CV» és sigla admesa. Es registra per descartar fals positiu.

### 5.3 «el ajust entre la personalitat del CEO i el context» (subsecció introvertits)
- Anglès: "the fit between CEO personality and organisational context"
- Català actual: «És que el ajust entre la personalitat del CEO i el context organitzacional importa més...»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «És que l'ajust entre la personalitat del CEO i el context organitzacional importa més...»
- Justificació: l'article masculí davant de vocal s'apostrofa: «l'ajust». Mateixa errada que a 3.5 (`job-satisfaction`): patró recurrent del traductor amb el mot «ajust».

### 5.4 «cribar el narcisisme explícitament» (subsecció selecció) — comprovació (correcte)
- Anglès: "screen for narcissism explicitly"
- Català actual: «En tercer lloc, cribar el narcisisme explícitament.»
- Categoria: correcte · Gravetat —
- Justificació: «cribar» (al costat de «cribrar») és forma documentada i normalitzada per TERMCAT (Consell Supervisor, 1997) amb el sentit de seleccionar/garbellar; *screen for* = «cribar/filtrar». Traducció encertada (contrasta amb «pantalla de selecció» de 1.9, que sí és errònia). Es registra per descartar fals positiu i per coherència de criteri.

### 5.5 «associada amb... l'excés d'ambició» / «overreaching» (taula)
- Anglès: "associated with strategic boldness, but also with overreaching"
- Català actual: «associada amb audàcia estratègica, però també amb l'excés d'ambició»
- Categoria: FIDELITAT (matís) · Gravetat BAIXA
- Proposta: «...però també amb l'extralimitació (o el sobreabast / abastar més del compte)»
- Justificació: *overreaching* és «extralimitar-se / voler abastar més del que es pot», no exactament «excés d'ambició» (que seria *over-ambition*). El matís es perd lleugerament: *overreaching* implica sobrepassar les pròpies capacitats, no només ambicionar molt. No és error greu.

### 5.6 «la directitud» (enllaços a "Baixa Agreeableness en el lideratge")
- Anglès: "when directness helps and when it harms"
- Català actual: «Baixa Agreeableness en el lideratge: quan la directitud ajuda i quan fa mal»
- Categoria: ERRADA/TERMINOLOGIA (mot inexistent) · Gravetat ALTA
- Proposta: «...quan la franquesa (o la fermesa / la manca de embuts) ajuda i quan fa mal»
- Justificació: «directitud» no existeix en català (és un calc del cast. *direccionalidad*/*la franqueza directa* mal format, o invenció a partir de *directe*). Per a *directness* el català té «franquesa», «fermesa», «caràcter directe», «claredat». Apareix al títol d'enllaç repetit dues vegades (cos i "Lectura addicional"), per tant és molt visible.

### 5.7 «el que això significa» (entradeta) — comprovació (correcte)
- Anglès: "and what that means for how organisations select their leaders"
- Català actual: «i el que això significa per a com les organitzacions seleccionen els seus líders»
- Categoria: correcte · Gravetat —
- Justificació: aquí «el que» és relatiu neutre amb antecedent intern legítim (= «allò que»), construcció admesa; no és el calc de represa oracional de 1.11. Es registra per evitar fals positiu. (Opcionalment, «allò que això significa» seria més culte, però no és incidència.)

### 5.8 Tractament «tu» (coherent intern, incoherent inter-article)
- Anglès: "Walk into a business school and ask..." / "Whether you assess a CEO candidate..."
- Català actual: «Entra a una escola de negocis i pregunta...», «Usa avaluacions estructurades», «Mira el historial», «entens el teu propi perfil», «comença amb l'avaluació gratuïta»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a **vós** segons el model de l'auditoria: «Entreu... i pregunteu», «Useu avaluacions estructurades», «Mireu l'historial», «enteneu el vostre propi perfil», «comenceu amb l'avaluació gratuïta».
- Justificació: l'article és coherent en «tu» internament, però (com 1.2) contradiu els articles en «vós» de la mateixa col·lecció (`groupthink`, `job-satisfaction`, `team-diversity`). A més, «Mira el historial» conté un error d'apostrofació afegit: «l'historial» (vegeu també 5.3).

### 5.9 «Mira el historial» (subsecció selecció)
- Anglès: "Look at the track record"
- Català actual: «Mira el historial: com descriuen els col·legues anteriors la presa de decisions?»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «Mireu l'historial: com descriuen...» (o «Mira l'historial» si es mantingués el tu)
- Justificació: «el historial» → «l'historial» (apostrofació davant de vocal). Tercera ocurrència del mateix tipus d'errada al lot (3.5, 5.3): el traductor falla sistemàticament l'apòstrof davant de vocal tònica/àtona en mots masculins.

### Resum quantitatiu — `personality-of-successful-ceos-what-research-says`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (sigla, apostrofació) | – | 3 | – |
| TERMINOLOGIA (mot inexistent «directitud») | 1 | – | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| FIDELITAT (overreaching) | – | – | 1 |
| Total incidències | **1** | **4** | **1** |

---

## "Diversitat d'equip i personalitat: el cas de la diversitat cognitiva" (`team-diversity-personality-and-performance`)

### 6.1 «diferències de estil cognitiu» (descripció `description.ca`)
- Anglès: "Big Five cognitive style differences"
- Català actual: «diferències de estil cognitiu del Big Five»
- Categoria: ERRADA (preposició + elisió) · Gravetat MITJANA
- Proposta: «diferències d'estil cognitiu del Big Five»
- Justificació: «de estil» → «d'estil»: la preposició *de* s'elideix i s'apostrofa davant de mot començat per vocal. Error a la descripció (metadada molt visible).

### 6.2 «discreparan» (secció "El factor fricció")
- Anglès: "People who think differently about problems will disagree about framing..."
- Català actual: «Les persones que pensen diferent sobre els problemes discreparan sobre el marc, la metodologia i les conclusions.»
- Categoria: ERRADA (accentuació) · Gravetat ALTA
- Proposta: «...discreparan» → «discreparan» és futur i ha de dur accent: «discreparàn»? No: el futur correcte és «discreparan» SENSE accent NO; cal «discreparan» → forma correcta «discreparan» és incorrecta perquè el futur de 3a persona del plural és «discreparan» pla... → la forma normativa és **«discreparan»** s'accentua? Veg. justificació.
- Justificació: el futur de *discrepar*, 3a pers. pl., és «discreparan» — i és mot agut acabat en -an, que NO s'accentua (com «cantaran», «aniran»). Per tant **«discreparan» és correcte ortogràficament**. Reviso: la cadena «discreparan» del text és, doncs, correcta. → Es REQUALIFICA com a fals positiu (correcte). Vegeu 6.2bis.

### 6.2bis «discreparan» — requalificació
- Català actual: «discreparan sobre el marc»
- Categoria: correcte · Gravetat —
- Justificació: futur de 3a persona del plural de *discrepar*; mot agut acabat en -n precedit de -a, sense accent gràfic (regla d'accentuació de mots aguts: no s'accentuen els acabats en -an, -en de verbs com «cantaran»). El castellà (`es`) escriu igualment «discreparan» (sic, sense tilde, error en castellà), però en català és la forma correcta. No és incidència.

### 6.3 «punt òptim» / «sweet spot» (callout) — comprovació
- Anglès: "The diversity sweet spot"
- Català actual: «El punt òptim de la diversitat»
- Categoria: correcte · Gravetat —
- Justificació: «punt òptim» és bona traducció de *sweet spot* (millor que un calc); el castellà fa «punto óptimo». Es registra per descartar fals positiu.

### 6.4 «la confiança verbal substitueix la profunditat analítica» (secció "Què mostra la investigació")
- Anglès: "verbal confidence substituting for analytical depth"
- Català actual: «la confiança verbal substitueix la profunditat analítica»
- Categoria: ERRADA (recció verbal) · Gravetat MITJANA
- Proposta: «la confiança verbal substitueix la profunditat analítica» és acceptable, però el sentit de *substitute for* és «fa les funcions de / passa per»: millor «la seguretat verbal passa a fer el paper de la profunditat analítica» o «...reemplaça la profunditat analítica». Si es manté «substituir», la recció catalana és «substituir A per B» (posar B al lloc de A); aquí s'ha posat la seguretat verbal EN LLOC de la profunditat, de manera que la frase, tal com és, diu el contrari del que es vol (que la seguretat verbal sigui substituïda).
- Justificació: «substituir X» = «eliminar X i posar-hi una altra cosa»; per tant «la confiança verbal substitueix la profunditat» significaria que la confiança verbal és reemplaçada (és el complement directe el que desapareix). El sentit anglès és l'invers: la confiança verbal ocupa el lloc que hauria de tenir la profunditat. Cal «la confiança verbal reemplaça la profunditat analítica» (reemplaçar X = posar-se al lloc de X) o reformular amb «passa per». Recció ambigua que pot invertir el sentit.

### 6.5 «confiança verbal» (fidelitat, *confidence*)
- Anglès: "verbal confidence"
- Català actual: «la confiança verbal substitueix...»
- Categoria: FIDELITAT (matís lèxic) · Gravetat BAIXA
- Proposta: «la seguretat verbal» (o «l'aplom verbal»)
- Justificació: *confidence* aquí és «seguretat (en un mateix)/aplom», no «confiança» (trust). «confiança verbal» és lleugerament ambigu (confiança en qui?). «seguretat verbal» recull millor el sentit de parlar amb aplom. Matís, no error dur.

### 6.6 «els xocs entre Visió i Disciplina es tornin indefinits» (llista requisits estructurals)
- Anglès: "prevent Vision-Discipline clashes from becoming indefinite"
- Català actual: «eviten que els xocs entre Visió i Disciplina es tornin indefinits»
- Categoria: AMBIGÜITAT/FIDELITAT · Gravetat BAIXA
- Proposta: «eviten que els xocs entre Visió i Disciplina s'eternitzin (o es perllonguin sense fi)»
- Justificació: *indefinite* aquí vol dir "que no s'acaben mai / sense termini", però «tornar-se indefinit» en català es llegeix sobretot com "imprecís/vague" (indefinit = no definit). Per al sentit temporal és més clar «s'eternitzin» / «es perllonguin indefinidament». Possible lectura ambigua.

### 6.7 «Comença a cartografiar la diversitat del teu equip» — tractament «tu»
- Anglès: "Start mapping your team's diversity at cercol.team"
- Català actual: «mostrant-te exactament on el teu equip té variança», «la diversitat del teu equip», «Comença a cartografiar la diversitat del teu equip»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a **vós**: «mostrant-vos exactament on el vostre equip té variància», «Comenceu a cartografiar la diversitat del vostre equip».
- Justificació: article en «tu», incoherent amb `groupthink`/`job-satisfaction` (vós) de la mateixa col·lecció. Mateix problema transversal que 1.2, 5.8.

### 6.8 «variança» vs «variància» (cos)
- Anglès: "variance"
- Català actual: «alta variança en aquestes dimensions», «baixa variança», «on el teu equip té variança»
- Categoria: TERMINOLOGIA · Gravetat MITJANA
- Proposta: «variància» (terme estadístic normalitzat)
- Justificació: el terme estadístic català és **variància** (TERMCAT; cf. cast. *varianza*, ang. *variance*). «variança» no és la forma terminològica catalana per a la dispersió estadística. Curiosament, dins del MATEIX article apareix «variança d'Obertura» (a `groupthink`) i aquí conviuen «variança»; cal unificar a «variància». Recurrent.

### Resum quantitatiu — `team-diversity-personality-and-performance`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (apostrofació, recció) | – | 2 | – |
| TERMINOLOGIA (variància) | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| FIDELITAT/AMBIGÜITAT (confidence, indefinite) | – | – | 2 |
| Total incidències | **0** | **4** | **2** |

---

## "Què signifiquen la fiabilitat i la validesa en els tests de personalitat — explicat clarament" (`what-is-reliability-validity-in-personality-testing`)

### 7.1 «Passa per qualsevol pàgina de màrqueting... trobaràs» — tractament «tu»
- Anglès: "Walk through any personality test marketing page and you will encounter..."
- Català actual: «Passa per qualsevol pàgina de màrqueting d'un test de personalitat i trobaràs», «que facis servir» (descripció), «Fes l'avaluació gratuïta»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a **vós**: «Passeu per qualsevol pàgina de màrqueting... i trobareu», «que feu servir», «Feu l'avaluació gratuïta».
- Justificació: article en «tu», incoherent amb els articles en «vós» de la col·lecció (mateix problema transversal: 1.2, 5.8, 6.7). La descripció (`description.ca`) també tracta de tu: «qualsevol instrument de personalitat que facis servir».

### 7.2 «la forma pràcticament més important» (validesa de criteri)
- Anglès: "Criterion validity, the practically most important form, asks..."
- Català actual: «La validesa de criteri, la forma pràcticament més important, pregunta si...»
- Categoria: AMBIGÜITAT/CALC · Gravetat MITJANA
- Proposta: «La validesa de criteri, la forma més important a la pràctica, pregunta si...»
- Justificació: «pràcticament més important» és ambigu: «pràcticament» es llegeix primer com a "gairebé" (quasi més important) i no com "des del punt de vista pràctic". L'anglès *practically* aquí vol dir "a efectes pràctics". Cal «la més important a la pràctica» per desfer l'ambigüitat. (La versió alemanya «die praktisch wichtigste Form» té el mateix risc, però el català el pot evitar.)

### 7.3 «els mateixos ítems de domini públic les propietats psicomètriques dels quals» (secció "Com Cèrcol compleix...")
- Anglès: "the same public-domain items whose psychometric properties have been independently documented..."
- Català actual: «els mateixos ítems de domini públic les propietats psicomètriques dels quals han estat documentades de manera independent»
- Categoria: ERRADA (relatiu possessiu, ordre) · Gravetat MITJANA
- Proposta: «els mateixos ítems de domini públic, les propietats psicomètriques dels quals han estat documentades independentment...» (cal coma abans del relatiu) o, més clar, «...ítems de domini públic, de què Goldberg i col·legues han documentat independentment les propietats psicomètriques».
- Justificació: la construcció «N les propietats dels quals» sense coma és sintàcticament travada i de lectura difícil; el relatiu possessiu «del qual / dels quals» demana puntuació que aïlli la subordinada explicativa. Millora de claredat sintàctica (recció correcta però mal puntuada).

### 7.4 «redueix el biaix de desitjabilitat social» / «social ønskvædighedsskevhed» — comprovació (correcte)
- Anglès: "reduces social desirability bias"
- Català actual: «un format de tria forçada que redueix el biaix de desitjabilitat social»
- Categoria: correcte · Gravetat —
- Justificació: «desitjabilitat social» és la forma normalitzada per TERMCAT (a diferència del calc *deseabilitat* detectat en altres lots). Ús encertat. Es registra com a referència positiva.

### 7.5 «alfa de Cronbach» — gènere i forma (comprovació)
- Anglès: "Cronbach's alpha"
- Català actual: «L'estadística estàndard és l'alfa de Cronbach», «La consistència interna (alfa de Cronbach)... és consistentment per sobre de 0.87»
- Categoria: correcte · Gravetat —
- Justificació: «alfa de Cronbach» és la denominació catalana habitual; «l'alfa» (femení, *la lletra alfa*) està ben apostrofat i concordat. Sense incidència. Es registra per descartar fals positiu (el terme tècnic central està ben tractat).

### 7.6 «tria forçada» vs «elecció forçada» (coherència inter-article)
- Anglès: "forced-choice format"
- Català actual: «un format de tria forçada que redueix el biaix»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: unificar amb la resta de la col·lecció. A `can-you-fake` es tradueix *forced-choice* per «elecció forçada» (×múltiples) i a `groupthink`/altres apareix també; aquí s'usa «tria forçada».
- Justificació: «tria forçada» i «elecció forçada» són tots dos correctes, però la col·lecció els barreja entre articles (el mateix lot conté «elecció forçada» a `can-you-fake` i «tria forçada» aquí). Cal triar-ne una per coherència terminològica de col·lecció. Sense error intern.

### 7.7 «el banc d'ítems IPIP es va construir precisament per permetre» (validesa convergent)
- Anglès: "The IPIP item bank was built precisely to enable this kind of public comparison."
- Català actual: «El banc d'ítems IPIP es va construir precisament per permetre aquest tipus de comparació pública.»
- Categoria: ERRADA (per/per a) · Gravetat BAIXA
- Proposta: «...es va construir precisament per a permetre aquest tipus de comparació pública.»
- Justificació: davant d'infinitiu amb valor de finalitat, el model neutre supradialectal (norma IEC 2016 / AVL) admet i recomana «per a + infinitiu» quan hi ha finalitat clara ("amb la finalitat de permetre"). Aquí el sentit és final. Incidència menor i de criteri (alguns models toleren «per»); es marca com a BAIXA.

### Resum quantitatiu — `what-is-reliability-validity-in-personality-testing`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (sintaxi relativa, per/per a) | – | 1 | 1 |
| AMBIGÜITAT/CALC («pràcticament més important») | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| TERMINOLOGIA (tria/elecció forçada) | – | – | 1 |
| Total incidències | **0** | **3** | **2** |


## "Compatibilitat entre cofundadors: la diligència deguda de personalitat que ningú fa" (`co-founder-compatibility-personality-due-diligence`)

### 1.1 Capitalització de titulars a l'estil anglès (tots els `##`/`###`)
- Ubicació: tots els encapçalaments del cos («Per Què Ocorre el Conflicte Entre Cofundadors», «Les Dimensions del Big Five Més Predictives de la Fricció Entre Cofundadors», «El Parell de Cofundadors Visió-Disciplina: Per Què Funciona», «Com Tenir la Conversa…», «Senyals d'Alerta de Personalitat a Resoldre Abans de Signar la Taula de Capitalització», «La Diligència Deguda Entre Cofundadors que Ningú Fa — Però Hauria de Fer», «Mira el Perfil del Teu Propi Equip Fundador»).
- Anglès: "Why Co-founder Conflict Happens — and What Traits Drive It", "How to Have the Personality Compatibility Conversation Before Launching", etc. (title case anglès).
- Català actual: reprodueix el *title case* anglès amb majúscula a cada mot lèxic.
- Categoria: CALC · Gravetat MITJANA
- Proposta: aplicar la capitalització catalana (només majúscula inicial i noms propis): «Per què passa el conflicte entre cofundadors i quins trets l'impulsen», «Com tenir la conversa de compatibilitat de personalitat abans de llançar», etc.
- Justificació: en català només es posa en majúscula la primera paraula d'un títol (i els noms propis); la majúscula a cada mot és convenció anglosaxona (esADIR, Guia d'estil de Softcatalà, § majúscules i minúscules en títols). És un calc tipogràfic sistemàtic, visible en tots els titulars. Les altres llengües romàniques de l'article (ES, FR) fan servir capitalització de frase, no de títol.

### 1.2 «en que les seves personalitats difereixen» (entradeta)
- Anglès: "the ways in which their personalities differ"
- Català actual: «si les maneres en que les seves personalitats difereixen probablement crearan tensió…»
- Categoria: ERRADA (ortografia) · Gravetat ALTA
- Proposta: «les maneres **en què** les seves personalitats difereixen»
- Justificació: el relatiu àton darrere de preposició s'escriu amb accent diacrític: «en què», no «en que». Error ortogràfic clar (DIEC2/GIEC, relatius). Es repeteix més avall: «en un context **en que** les dues persones estan tranquil·les» (secció «Sobre l'estil de conflicte»).

### 1.3 «s'equivoquen» / «equivoca» — recció i fidelitat de "wrong"
- Anglès: "feel genuinely certain that the other person is wrong"
- Català actual: «se sentiran genuïnament certes que l'altra persona s'equivoca»
- Categoria: correcte · Gravetat — (sense incidència; «equivocar-se» és la solució natural de *to be wrong*. Es registra per descartar fals positiu.)

### 1.4 «la ciència de personalitat més accionable» (entradeta)
- Anglès: "for which the most actionable personality science exists"
- Català actual: «i per al qual existeix la ciència de personalitat més accionable»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «la ciència de la personalitat més **aplicable**» (o «… sobre la qual es pot actuar més fàcilment»)
- Justificació: glossari de l'auditoria — *accionable* en el sentit d'*actionable* és un calc; en català «accionable» vol dir «que es pot accionar (un mecanisme)». El sentit pretès és «aplicable». A més, manca l'article: «la ciència de **la** personalitat» (com es fa correctament a la resta de l'article).

### 1.5 «ciència de personalitat» sense article (recurrent)
- Anglès: "personality science"
- Català actual: «la ciència de personalitat» (entradeta, ×2), «La ciència de personalitat darrere d'aquesta dimensió» (secció Visió)
- Categoria: ERRADA (elisió d'article) · Gravetat MITJANA
- Proposta: «la ciència **de la** personalitat»
- Justificació: el calc de l'anglès *personality science* omet l'article que el català demana davant del nom genèric. L'article mateix alterna i en altres punts sí que escriu «la ciència de la personalitat» (secció «Per Què Ocorre…»): cal unificar amb article.

### 1.6 «optimizi prematurament» (secció Visió-Disciplina)
- Anglès: "prevents the company from optimising prematurely"
- Català actual: «impedeix que l'empresa optimizi prematurament»
- Categoria: ERRADA (ortografia/castellanisme) · Gravetat ALTA
- Proposta: «impedeix que l'empresa **optimitzi** prematurament»
- Justificació: la grafia correcta del subjuntiu és «optimitzi» (de *optimitzar*). «optimizi» amb -z- és un creuament amb el castellà *optimizar*; errada ortogràfica.

### 1.7 «explorant noves oportunitats» / anteposicions calcades (taula i cos)
- Anglès: "Frequent disagreements about timing and pace"
- Català actual: «Freqüents desacords sobre el moment i el ritme» (taula, fila 1)
- Categoria: CALC (ordre de mots) · Gravetat BAIXA
- Proposta: «Desacords freqüents sobre el moment i el ritme»
- Justificació: l'anteposició de l'adjectiu («Freqüents desacords») calca l'ordre anglès *frequent disagreements*; en català la posposició («desacords freqüents») és la natural i no marcada.

### 1.8 «un sol membre molt poc amable» — coherència amb dimensió "Vincle"
- Anglès: (dimensió Bond = Agreeableness)
- Català actual: el cos usa «Vincle» com a nom de la dimensió, però la taula de la introducció no apareix; tanmateix conviuen «Vincle (Amabilitat)» i, en el diagrama SVG, «Alta Obertura + Alta Conscienciositat», «Baixa Conscienciositat».
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar el nom de dimensió dins de l'article. El text empra «Visió», «Disciplina», «Vincle»; el diagrama SVG empra «Obertura», «Conscienciositat». Cal triar (recomanable: noms Cèrcol — Visió/Disciplina/Vincle — al diagrama també, ja que el cos els fa servir com a primaris).
- Justificació: coherència interna; el lector veu «Visió-Disciplina» al text i «Obertura + Conscienciositat» a la figura immediatament adjacent, cosa que trenca la consistència terminològica. (No és incidència l'ús dels noms acadèmics en si — el brief els permet al blog —, sinó la barreja no explicada dins del mateix recurs visual.)

### 1.9 «pot interpretar l'evitació de conflictes … com a deshonestedat» (secció Vincle)
- Anglès: "can interpret the high-Bond founder's conflict avoidance as dishonesty or passivity"
- Català actual: «pot interpretar l'evitació de conflictes del fundador d'alt Vincle com a deshonestedat o passivitat»
- Categoria: correcte · Gravetat — (sense incidència; «evitació», «deshonestedat» són normatius. Es registra per descartar fals positiu.)

### 1.10 «Mira el Perfil del Teu Propi Equip Fundador» — tractament "tu"
- Anglès: "Look at Your Own Founding Team's Profile"
- Català actual: tot l'article tracta de «tu» («el teu cofundador», «Quan estigui frustrat amb tu», «Comença el teu perfil»), però la CTA final barreja: «quins rols cobreix naturalment **la vostra** parella fundadora, i on **teniu** llacunes».
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar el tractament. Si l'article va de «tu»: «quins rols cobreix naturalment **la teva** parella fundadora, i on **tens** llacunes estructurals». (El brief recomana «vós» com a model; en aquest cas el problema primari és la barreja tu/vós dins del mateix paràgraf.)
- Justificació: salt injustificat de «tu» (singular) a «vós/vosaltres» (plural) dins de la mateixa secció. Cal un únic tractament. Vegeu també el model de vós del brief si s'opta per regularitzar tota la col·lecció a vós.

### Resum quantitatiu — co-founder-compatibility
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (ortografia, article) | 2 | 1 | – |
| CALC (capitalització, accionable, ordre) | – | 2 | 1 |
| TERMINOLOGIA/COHERÈNCIA (dimensions) | – | 1 | – |
| REGISTRE (tractament) | – | 1 | – |
| Total incidències | **2** | **5** | **1** |

---

## "Estructures d'equips d'alt rendiment: una perspectiva de la ciència de la personalitat" (`high-performing-team-structures-personality-perspective`)

### 2.1 «no tan sols succeeix que tinguin les persones adequades» (entradeta)
- Anglès: "High-performing teams don't just happen to have the right people"
- Català actual: «Els equips d'alt rendiment no tan sols succeeix que tinguin les persones adequades»
- Categoria: ERRADA (sintaxi/concordança) + CALC · Gravetat ALTA
- Proposta: «Els equips d'alt rendiment no és que **simplement tinguin per casualitat** les persones adequades» o «No és que els equips d'alt rendiment tinguin les persones adequades per atzar»
- Justificació: «no tan sols succeeix que tinguin» és agramatical: el subjecte plural «els equips» queda penjat davant d'un «succeeix» impersonal en singular, calc de l'anglès *don't just happen to have*. La construcció no es resol sintàcticament. Cal reformular amb «no és (només) que…» o «no tenen per casualitat…». La mateixa construcció errònia apareix al castellà («no simplemente sucede que tengan»), però la font canònica és l'anglès.

### 2.2 «Apliqueu / esteu / necessitem» — tractament de "vós" coherent
- Anglès: "Apply This Framework to Your Team", "If you want to understand…"
- Català actual: «Apliqueu aquest marc al vostre equip», «Si voleu entendre com la composició… del vostre equip», «esteu construint un equip», «esteu diagnosticant».
- Categoria: correcte · Gravetat — (sense incidència: l'article és coherent en tractament de **vós** — *apliqueu, voleu, esteu, el vostre equip* —, que és el model recomanat pel brief. Es registra com a fals positiu / exemple de bona pràctica de tractament, en contrast amb articles que barregen tu/vós.)

### 2.3 «major obstacle al rendiment en extrems d'equip» (stat-card)
- Anglès: "biggest drag on performance at team extremes"
- Català actual: «major obstacle al rendiment en extrems d'equip»
- Categoria: FIDELITAT/REGISTRE · Gravetat BAIXA
- Proposta: «el factor que més llasta el rendiment en els extrems d'equip» o «principal llast per al rendiment…»
- Justificació: *drag* aquí és «llast/fre», no exactament «obstacle». «obstacle al rendiment» és acceptable però perd el matís de pes que frena (cf. ES «mayor lastre», DE «größte Belastung»). Millora de precisió, no error.

### 2.4 «desavantatgen sistemàticament els contribuïdors discrets» (secció Processos de decisió)
- Anglès: "Unstructured discussions systematically disadvantage quiet contributors"
- Català actual: «Les discussions no estructurades desavantatgen sistemàticament els contribuïdors discrets»
- Categoria: TERMINOLOGIA (lèxic) · Gravetat MITJANA
- Proposta: «**perjudiquen** sistemàticament els qui hi contribueixen de manera discreta» / «desfavoreixen els qui participen poc»
- Justificació: «desavantatjar» no és normatiu (no és al DIEC2 ni al DNV); el verb derivat de «avantatge» no s'ha lexicalitzat com a transitiu. Cal «perjudicar», «desfavorir» o «posar en desavantatge». A més, «contribuïdors» és un calc d'*contributors*; més natural «els qui (hi) contribueixen» o «els participants». «discrets» per *quiet* és tolerable però «callats/reservats» és més precís.

### 2.5 «Pluja d'idees silenciosa» / «Pre-lectures» (llista d'intervencions)
- Anglès: "Silent brainstorming before discussion" / "Pre-reads before decisions"
- Català actual: «Pluja d'idees silenciosa abans de la discussió», «Pre-lectures abans de les decisions»
- Categoria: correcte · Gravetat — (sense incidència; «pluja d'idees» és la solució catalana habitual per *brainstorming* i «pre-lectures» és transparent. Es registra per descartar fals positiu.)

### 2.6 «emergeixi» / «emergi» (Torn de paraula estructurat)
- Anglès: "ensure every perspective surfaces"
- Català actual: «asseguren que cada perspectiva emergeixi»
- Categoria: correcte · Gravetat — (sense incidència: ací «emergir» s'usa **intransitivament** —«que cada perspectiva emergeixi»—, que és l'ús correcte, a diferència de l'ús transitiu erroni d'altres articles. Es registra com a contrast/bona pràctica.)

### 2.7 «se senten psicològicament segurs» / «un equip on es produeix una avaluació honest» (Interpersonal)
- Anglès: "a team where honest evaluation occurs"
- Català actual: «un equip on es produeix una avaluació honest»
- Categoria: ERRADA (concordança de gènere) · Gravetat ALTA
- Proposta: «una avaluació **honesta**»
- Justificació: «avaluació» és femení; l'adjectiu ha de concordar: «honesta», no «honest». Error de concordança de gènere.

### 2.8 «la voz més alta» → «la veu més alta» — comprovació
- Anglès: "the loudest voice in retrospectives"
- Català actual: «on la veu més alta en les retrospectives sovint configura els canvis de procés»
- Categoria: correcte · Gravetat — (sense incidència; «la veu més alta» és correcte. Es registra per descartar fals positiu.)

### 2.9 «dades de composició a nivell d'equip» (CTA i descripció)
- Anglès: "team-level composition data"
- Català actual: «dades de composició a nivell d'equip» (CTA), «composició a nivell d'equip» (descripció `description.ca`)
- Categoria: REGISTRE (calc tolerat) · Gravetat BAIXA
- Proposta: «dades de composició **a escala d'equip**» / «**de l'àmbit de l'equip**»
- Justificació: «a nivell de» en sentit figurat (no d'alçària física) està desaconsellat per la UB (Llibre d'estil, criteri «a nivell de») i Softcatalà, que recomanen «a escala de», «en l'àmbit de», «pel que fa a». Recurrent (cos + descripció).

### 2.10 «Emergència de preocupacions sense exposició social» (Canals d'entrada anònims)
- Anglès: "Surfaces concerns without social exposure for members who would otherwise self-censor."
- Català actual: «**Emergència** de preocupacions sense exposició social per als membres que d'altra manera s'autocensurarien.»
- Categoria: FIDELITAT/CALC · Gravetat MITJANA
- Proposta: «**Fan aflorar/Fan emergir** les preocupacions sense exposició social…» (mantenint el verb com a la font: *surfaces*)
- Justificació: l'anglès usa el verb *surfaces* (fa aflorar), igual que les altres entrades de la llista («Surfaces concerns»). El català el nominalitza en «Emergència de preocupacions», que en context (canal anònim) és ambigu i fred; «emergència» evoca primer el sentit d'urgència. Millor mantenir el verb causatiu «fer aflorar/emergir», coherent amb la resta de vinyetes que comencen amb sintagma. (ES fa el mateix calc «Emergencia de preocupaciones»; la font canònica és l'anglès.)

### 2.11 «com la percepció pròpia divergeix» / «qui observa l'equip» (CTA Testimoni)
- Anglès: "where self-perception diverges from how teammates actually experience each person"
- Català actual: «on la percepció pròpia divergeix de com els companys d'equip realment experimenten cada persona»
- Categoria: correcte · Gravetat — (sense incidència; bona traducció. Nota: usa «Testimoni» correctament, no «observador». Es registra com a bona pràctica.)

### Resum quantitatiu — high-performing-team-structures
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (sintaxi, concordança) | 2 | – | – |
| TERMINOLOGIA/lèxic («desavantatgen») | – | 1 | – |
| CALC/FIDELITAT («Emergència») | – | 1 | – |
| REGISTRE («a nivell de», «drag») | – | – | 2 |
| Total incidències | **2** | **2** | **2** |

---

## "Baixa Amabilitat en el lideratge: quan la directesa ajuda i quan perjudica" (`low-agreeableness-in-leadership-when-directness-helps-and-when-it-harms`)

### 3.1 Barreja terminològica «Amabilitat» / «Connexió» / «Agreeableness» / «Bond» (tot l'article)
- Anglès: usa de manera coherent «Agreeableness — Bond in Cèrcol» i després sempre «low-Bond / high-Bond».
- Català actual: el títol i alguns encapçalaments diuen «Amabilitat»; l'obertura diu «Agreeableness — Connexió en Cèrcol»; el cos alterna «baixa Connexió», «baixa Amabilitat», «alta Connexió», i la dimensió de confiança es diu «benvolença».
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat ALTA
- Proposta: fixar el nom Cèrcol de la dimensió. El català de Cèrcol per a *Bond* és **«Vincle»** (com l'usa l'article de cofundadors d'aquesta mateixa col·lecció); aquí l'article inventa **«Connexió»**, una tercera forma. Cal triar-ne UNA: si la col·lecció fixa «Vincle» per a *Bond*, substituir totes les ocurrències de «Connexió» per «Vincle». La forma acadèmica anglesa «Agreeableness» es pot mantenir (permès al blog), però el nom de dimensió Cèrcol ha de ser únic.
- Justificació: incoherència terminològica greu — tres etiquetes («Amabilitat», «Connexió», «Agreeableness») per al mateix constructe, i divergència amb la resta de la col·lecció (que diu «Vincle»). Afecta la comprensió del lector i el posicionament de marca. (No és incidència l'ús del nom acadèmic «Agreeableness» en si — el brief el permet —, sinó la multiplicitat de noms Cèrcol.)

### 3.2 «els líders poc agradables» (títol de secció + descripció)
- Anglès: "What Research Actually Shows About Disagreeable Leaders" / "disagreeable leaders outperform"
- Català actual: «El que la investigació mostra realment sobre els líders **poc agradables**» (i a `description.ca`: «els líders poc agradables superen als altres»)
- Categoria: FIDELITAT/TERMINOLOGIA · Gravetat MITJANA
- Proposta: «els líders **poc amables / de baixa Amabilitat (Vincle)**»
- Justificació: *disagreeable* aquí és el pol baix d'*Agreeableness* (poc amable, poc cooperatiu), no «poc agradable» (=desagradable de tracte, *unpleasant*). «poc agradable» és un fals amic que desplaça el sentit cap a «antipàtic/desplaent» i perd el lligam amb la dimensió. A `description.ca` també: «superen **als** altres» → «superen **els** altres» (complement directe de persona sense «a» en registre formal; DIEC/GIEC desaconsellen l'«a» davant CD).

### 3.3 «Els autoinfomes sobre l'Agreeableness» (secció autoconsciència)
- Anglès: "Self-reports on Agreeableness are notoriously less accurate than peer reports."
- Català actual: «Els **autoinfomes** sobre l'Agreeableness són notòriament menys precisos que els informes d'iguals.»
- Categoria: ERRADA (errata) · Gravetat ALTA
- Proposta: «Els **autoinformes** sobre…»
- Justificació: errata evident — falta la «r»: «autoinformes». A més, «notòriament» és un calc de *notoriously* (en català «notori» tendeix a «conegut/manifest», no «sabudament/com és prou conegut»); millor «que és ben sabut que són menys precisos» o «són reconegudament menys precisos».

### 3.4 «menys neutral del que la experimenten els seus col·legues» (secció autoconsciència)
- Anglès: "their communication is more neutral than their colleagues experience it"
- Català actual: «creuen que la seva comunicació és més neutral del que **la** experimenten els seus col·legues»
- Categoria: ERRADA (apostrofació) · Gravetat ALTA
- Proposta: «… més neutral del que **l'**experimenten els seus col·legues»
- Justificació: el pronom feble «la» davant de verb començat per vocal s'ha d'apostrofar: «l'experimenten». Error d'apostrofació. (Opcionalment, reformular per evitar el complement pronominal pesat: «més neutral del que els seus col·legues la perceben».)

### 3.5 «Lliurament directe de retroalimentació» / «Direct feedback delivery» (llista de trets)
- Anglès: "Direct feedback delivery — saying what they actually think…"
- Català actual: «**Lliurament directe de retroalimentació** — diuen el que realment pensen…»
- Categoria: CALC · Gravetat BAIXA
- Proposta: «**Comunicació directa de la retroacció/del retorn**» o «**Donar retroalimentació de manera directa**»
- Justificació: «Lliurament … de retroalimentació» calca *feedback delivery*; «lliurament» (acte d'entregar) sona mecànic aplicat a *feedback*. En català es «dóna/fa arribar» retroalimentació. Nota de coherència: l'article usa «retroalimentació» de manera constant (correcte i coherent internament).

### 3.6 «Menor preocupació per la gestió de la impressió» (llista de trets)
- Anglès: "Reduced concern for impression management — less investment in being liked, more investment in being right"
- Català actual: «Menor preocupació per la gestió de la impressió — menys inversió en caure bé, més inversió en tenir raó»
- Categoria: CALC · Gravetat MITJANA
- Proposta: «Menor preocupació per la **gestió de la imatge personal**» (terme assentat per *impression management*)
- Justificació: «gestió de la impressió» és un calc literal; el terme establert en psicologia social en català és «gestió de la imatge» / «gestió de les impressions» (plural). «la impressió» en singular és ambigu (impressió = sensació puntual). «caure bé» és col·loquial però acceptable en registre divulgatiu.

### 3.7 «no encadenada per consideració social excessiva» (Equips amb poca experiència)
- Anglès: "unencumbered by excessive social consideration"
- Català actual: «honesta, directa, no encadenada per consideració social excessiva»
- Categoria: CALC/AMBIGÜITAT · Gravetat MITJANA
- Proposta: «no **llastada/condicionada/coartada** per una consideració social excessiva»
- Justificació: *unencumbered* = «sense traves», «no llastada». «encadenada» és una metàfora desplaçada (evoca cadenes/captiveri) i no és l'equivalent natural; a més manca l'article: «per **una** consideració social excessiva». La versió alemanya usa «unbelastet» (no llastada) i la danesa «ubesnæret» (sense traves), que confirmen el sentit.

### 3.8 «calibració comunicativa» / «Calibrar el lliurament» (secció autoconsciència)
- Anglès: "Calibrate delivery without compromising content."
- Català actual: «**Calibrar el lliurament** sense comprometre el contingut.»
- Categoria: CALC · Gravetat BAIXA
- Proposta: «**Ajustar/calibrar la manera de dir-ho** sense comprometre el contingut» (o «adaptar la forma»)
- Justificació: «el lliurament» per *delivery* (manera de transmetre un missatge) és calc; en català «lliurament» no té el sentit de «forma de comunicar». Millor «la manera/forma de transmetre-ho» o «l'empaquetatge» (que l'article mateix usa més avall: «l'empaquetat es pot adaptar»).

### 3.9 «et costa» / tractament "tu" (encapçalament i CTA finals)
- Anglès: "Know Where Your Directness Works — and Where It Costs You"
- Català actual: tota la secció final tracta de «tu» («si tens prou autoconsciència», «el teu context», «et dóna», «la teva directesa es mapeja»).
- Categoria: REGISTRE (tractament) · Gravetat MITJANA
- Proposta: si la col·lecció adopta el model de **vós** (recomanat pel brief), regularitzar: «si **teniu** prou autoconsciència», «el **vostre** context», «**us** dóna», «la **vostra** directesa **es projecta**». Internament l'article és coherent en «tu»; la incidència és de coherència de col·lecció (cf. article de team-structures, que va de «vós»).
- Justificació: dins de la col·lecció de blog conviuen articles en «vós» (team-structures) i en «tu» (aquest, motivació). Cal un únic tractament. El brief fixa «vós» com a model.

### 3.10 «es mapeja en el panorama de rols» (CTA final)
- Anglès: "explore how your directness maps onto the role landscape"
- Català actual: «explora com la teva directesa **es mapeja** en el panorama de rols»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «com la teva directesa **es projecta sobre / encaixa en** el mapa de rols» (o «es correspon amb»)
- Justificació: «mapejar» (de *to map*) no és normatiu (ni DIEC2 ni DNV); és un calc informàtic. En registre divulgatiu cal «projectar-se sobre», «correspondre's amb», «situar-se en». Apareix també com a verb d'altres articles de la col·lecció: convé eradicar-lo de manera transversal.

### Resum quantitatiu — low-agreeableness-in-leadership
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (errata, apostrofació) | 2 | – | – |
| TERMINOLOGIA/COHERÈNCIA (Connexió/Amabilitat) | 1 | – | – |
| FIDELITAT (disagreeable→poc agradable) | – | 1 | – |
| CALC (gestió impressió, encadenada, mapejar) | – | 3 | 2 |
| REGISTRE (tractament) | – | 1 | – |
| Total incidències | **3** | **5** | **2** |

---

## "Personalitat i motivació: què impulsa cada perfil Big Five" (`personality-and-motivation-what-drives-each-big-five-profile`)

### 4.1 Divergència títol català ↔ títol anglès
- Anglès (`title.en`): "The 5 motivational profiles, explained" (i `description.en`: "What motivates each Big Five profile at work, from drive and recognition to autonomy. The five motivation patterns and how to lead each one.")
- Català actual (`title.ca`): «Personalitat i motivació: què impulsa cada perfil Big Five»; `description.ca`: «El Big Five prediu el que motiva la gent en el treball — la Conscienciositat per l'assoliment, l'Extraversió pel reconeixement, l'Obertura per la mestria. SDT i trets combinats.»
- Categoria: FIDELITAT · Gravetat MITJANA
- Proposta: alinear conscientment (decisió editorial). El `title.en` s'ha reescrit («The 5 motivational profiles, explained») mentre el `title.ca` conserva la versió antiga; ES/FR/DE/DA també conserven l'antiga. Si l'anglès és la font canònica actualitzada, el català hauria de reflectir-la: «Els 5 perfils motivacionals, explicats». Cal verificar quina versió és la vigent.
- Justificació: discrepància de fons entre la font anglesa (reescrita) i les traduccions (versió anterior). No és error de llengua sinó de sincronització font↔traducció, que el brief tracta com a FIDELITAT.

### 4.2 «la teoria de gestió ha encerclat durant un segle sense acabar de capturar-la» (entradeta)
- Anglès: "the variable that management theory has circled for a century without quite capturing"
- Català actual: «la variable que la teoria de gestió ha encerclat durant un segle sense acabar de capturar-la del tot»
- Categoria: REDUNDÀNCIA + lèxic · Gravetat BAIXA
- Proposta: «… ha **voltat/rondat** durant un segle sense acabar de capturar» (eliminar «del tot»)
- Justificació: «sense acabar de capturar-la **del tot**» és redundant: «acabar de» ja expressa la completitud que «del tot» repeteix. A més «encerclar» (envoltar amb un cercle, assetjar) per *to circle* (rondar al voltant) és un calc parcial; «voltar/rondar» recull millor el sentit de «donar voltes sense atrapar».

### 4.3 «repartint el compromís primensament en massa coses» (secció Obertura)
- Anglès: "spreading engagement thinly across too many interesting things"
- Català actual: «repartint el compromís **primensament** en massa coses interessants»
- Categoria: ERRADA (mot inexistent) · Gravetat ALTA
- Proposta: «repartint el compromís **de manera prima / superficialment / escampant-lo poc** entre massa coses interessants» (p. ex. «escampant el compromís entre massa coses»)
- Justificació: «primensament» no existeix en català (no és al DIEC2 ni al DNV); sembla una invenció a partir de «prim» + sufix castellà. Cal una solució real: «de manera prima», «escampar/escampar-se», «dispersar». A més «en massa coses» → «entre massa coses» (repartir *entre*).

### 4.4 «un palanca motivacional universal» (citació destacada)
- Anglès: "Recognition is not a universal motivational lever."
- Català actual: «El reconeixement no és **un** palanca motivacional universal.»
- Categoria: ERRADA (gènere) · Gravetat ALTA
- Proposta: «no és **una** palanca motivacional universal»
- Justificació: «palanca» és femení; l'article ha de ser «una», no «un». Error de concordança de gènere.

### 4.5 «s'hi apropa» / «Per als individus d'alta Extraversió, s'hi apropa» (citació)
- Anglès: "For high-Extraversion individuals, it comes close — because the social proof it provides directly activates their reward system."
- Català actual: «Per als individus d'alta Extraversió, s'hi apropa — perquè la prova social que proporciona activa directament el seu sistema de recompensa.»
- Categoria: AMBIGÜITAT · Gravetat MITJANA
- Proposta: «**gairebé ho és** — perquè la prova social…» o «**s'hi acosta molt**»
- Justificació: «s'hi apropa» és fosc: el referent de «hi» (a ser-ho, a ser una palanca universal) no és clar i pot llegir-se com a moviment físic. *It comes close* = «gairebé ho és / s'hi acosta (a ser universal)». Cal explicitar.

### 4.6 «sufinvertint en l'execució» / «sufinvertir» — comprovar
- Anglès: "underinvesting in execution"
- Català actual: «invertint insuficientment en l'execució» (motivació) — i a l'article d'Obertura «tendeixen a **sufinvertir** en la planificació»
- Categoria: correcte (en aquest article) · Gravetat — (sense incidència en motivació: «invertir insuficientment» és bona solució. Es registra el contrast amb l'article d'Obertura, que sí usa el barbarisme «sufinvertir» — vegeu 7.x.)

### 4.7 «Cèrcol mapa el teu perfil Big Five» (CTA final)
- Anglès: "Cèrcol maps your Big Five profile across the five dimensions"
- Català actual: «**Cèrcol mapa** el teu perfil Big Five en les cinc dimensions»
- Categoria: ERRADA (lèxic/calc) · Gravetat ALTA
- Proposta: «Cèrcol **situa/projecta/representa** el teu perfil Big Five en les cinc dimensions» (o «traça»)
- Justificació: «mapa» com a forma verbal (de *to map*) no existeix en català: «mapa» és només substantiu. El verb «mapar/mapejar» tampoc és normatiu. Cal «situar», «projectar», «representar», «traçar». Error gramatical visible en la CTA principal.

### 4.8 «trau a la superfície les bretxes» (CTA final)
- Anglès: "surfaces the gaps between how you see your motivational drivers and how your colleagues experience them"
- Català actual: «l'eina de valoració per parells Testimoni de Cèrcol **trau a la superfície** les bretxes entre com veus els teus impulsors motivacionals i com els teus col·legues els experimenten»
- Categoria: REGISTRE/coherència dialectal · Gravetat BAIXA
- Proposta: «**fa aflorar / fa emergir** les bretxes» (model supradialectal); evitar «traure» col·loquial valencià si la resta de la col·lecció usa «treure».
- Justificació: «traure a la superfície» és comprensible i «traure» és normatiu (DNV/DIEC2), però en un model neutre supradialectal i per coherència amb la resta de la col·lecció (que empra «treure»/«fer aflorar») convé «fer aflorar/emergir», que a més és la solució idiomàtica per *to surface* (transitiu causatiu). Coherència de col·lecció.

### 4.9 «valoració per parells» / «parells» — coherència
- Anglès: "peer-rating tool" / "Witness peer-rating tool"
- Català actual: «l'eina de valoració **per parells** Testimoni»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat BAIXA
- Proposta: unificar amb la resta de la col·lecció. Conviuen «avaluació de parells», «avaluació de companys», «percepció de parells», «valoració per parells». Triar una forma («avaluació entre iguals» o «avaluació de companys» és més transparent). Usa «Testimoni» correctament (no «observador»).
- Justificació: coherència terminològica inter-article (mateix problema detectat a 05-blog 1.9). Sense error intern.

### 4.10 «relació» per *relatedness* (SDT) — comprovació
- Anglès: "autonomy, competence and relatedness"
- Català actual: «autonomia, competència i relació»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: «autonomia, competència i **vinculació/connexió (relatedness)**»
- Justificació: en la traducció estàndard de la Teoria de l'Autodeterminació, *relatedness* es tradueix per «vinculació» o «relació amb els altres / connexió», no per «relació» a seques, que és massa genèric i ambigu (relació = qualsevol vincle o proporció). Millora de precisió terminològica; la versió DA usa «tilhørsforhold» (pertinença) i la DE «Verbundenheit» (vinculació), que confirmen el matís.

### Resum quantitatiu — personality-and-motivation
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (mot inexistent, gènere, "mapa" verb) | 3 | – | – |
| FIDELITAT (títol desincronitzat) | – | 1 | – |
| AMBIGÜITAT («s'hi apropa») | – | 1 | – |
| REDUNDÀNCIA/lèxic | – | – | 1 |
| TERMINOLOGIA/REGISTRE (relatedness, parells, traure) | – | – | 3 |
| Total incidències | **3** | **2** | **4** |

---

## "Modes de fallada dels equips: una perspectiva de la ciència de la personalitat" (`team-failure-modes-personality-perspective`)

### 5.1 «explonem una opció més» (Mode 2, senyals primerencs)
- Anglès: "Recurring \"let's explore one more option\" conversations"
- Català actual: «Converses recurrents de "**explonem** una opció més" en els punts de decisió»
- Categoria: ERRADA (errata) · Gravetat ALTA
- Proposta: «"**explorem** una opció més"»
- Justificació: errata evident — «explonem» no existeix; ha de ser «explorem» (de *explore*). Visible en text destacat entre cometes.

### 5.2 «comunicació hedged» (Mode 3, mecanisme)
- Anglès: "Low-Bond members experience hedged communication as evasiveness."
- Català actual: «Els membres de baix Vincle experimenten la comunicació **hedged** com a evasió.»
- Categoria: ERRADA (anglès sense traduir) · Gravetat ALTA
- Proposta: «la comunicació **amb circumloquis / cauta / matisada / plena de reserves**»
- Justificació: «hedged» és una paraula anglesa que s'ha quedat sense traduir dins del text català. Cal traduir-la: *hedged communication* = comunicació evasiva, plena de matisos defensius, amb reserves. Coherent amb el diagrama del mateix article, que tradueix «guarded communication» per «comunicació amb reserves».

### 5.3 «enroda» / «comunicació que enroda en lloc de passar pels punts de fricció» (Mode 3, senyals)
- Anglès: "communication that routes around rather than through points of friction"
- Català actual: «comunicació que **enroda** en lloc de passar pels punts de fricció»
- Categoria: ERRADA (lèxic) · Gravetat MITJANA
- Proposta: «comunicació que **esquiva / fa marrada / dóna un tomb per evitar** els punts de fricció en lloc d'afrontar-los»
- Justificació: «enrodar» no és normatiu amb el sentit de «fer un rodeig» (al DNV «enrodar» no recull aquest valor; és un castellanisme per *rodear*). *Routes around* = «fa un rodeig», «esquiva», «evita». Cal una solució catalana.

### 5.4 «Els altres deferien en lloc de decidir» (Mode 4)
- Anglès: "Others defer rather than decide."
- Català actual: «Els altres **deferien** en lloc de decidir.»
- Categoria: ERRADA (lèxic/temps verbal) · Gravetat ALTA
- Proposta: «Els altres **s'hi remeten / ho deleguen / cedeixen la decisió** en lloc de decidir.»
- Justificació: doble problema. (a) «deferir» en el sentit de *to defer (to someone)* = «remetre's a algú», «cedir»; el verb català «deferir» és rar i jurídic, no recull aquest ús: cal «remetre's a», «delegar», «cedir». (b) El temps: «deferien» (imperfet) trenca el present de la resta del paràgraf («és productiu», «s'atura»); ha de ser present: «es remeten». La mateixa errada de recció/sentit apareix a la versió DA («defer») i no s'ha resolt.

### 5.5 «Mode de fallada del fundador» / «Coll d'ampolla del fundador» — i diagrama de 4 vs 5 modes
- Anglès: the diagram caption says "Four personality-driven team failure modes" while the article describes five.
- Català actual: igual — el `figcaption` diu «Quatre modes de fallada d'equip impulsats per la personalitat» mentre l'article en descriu cinc.
- Categoria: correcte (fidel a la font) · Gravetat — (sense incidència de traducció: la discrepància 4/5 ja és a l'anglès original; el català el reprodueix fidelment. Es registra per descartar fals positiu i com a nota per a l'equip de contingut, no com a errada de traducció.)

### 5.6 «mapejar la composició de personalitat del teu equip» (Del diagnòstic a la prevenció)
- Anglès: "Mapping your team's personality composition against these failure modes"
- Català actual: «**Mapejar** la composició de personalitat del teu equip respecte a aquests modes de fallada»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «**Situar/Comparar/Projectar** la composició de personalitat del teu equip **respecte a / contra** aquests modes de fallada» (o «Confrontar … amb»)
- Justificació: «mapejar» no és normatiu (vegeu 3.10, 4.7); calc transversal de la col·lecció. Aquí «contrastar/comparar/situar respecte a» recull el sentit de *mapping … against*. Apareix també «mapejar el teu equip» a la secció final («que et permeten mapejar el teu equip»): recurrent.

### 5.7 «Atmosferes de reunió consistentment positives» (Mode 5, senyals)
- Anglès: "Consistently positive meeting atmospheres combined with missed external deliverables"
- Català actual: «**Atmosferes** de reunió consistentment positives combinades amb lliuraments externs perduts»
- Categoria: FIDELITAT/lèxic · Gravetat BAIXA
- Proposta: «**Un ambient de reunió** sistemàticament positiu combinat amb **incompliment de lliuraments** externs» (o «lliuraments externs **no assolits/incomplerts**»)
- Justificació: (a) «lliuraments … **perduts**» per *missed deliverables* és calc; *missed* aquí = «no assolits / incomplerts / fallits», no «extraviats». (b) «consistentment» (de *consistently*) és tolerable però «sistemàticament/de manera constant» és més precís en català (Optimot desaconsella «consistent/consistentment» com a calc d'*consistent* quan vol dir «constant/coherent»). «Atmosferes» en plural és correcte però «ambient» sona més natural.

### 5.8 «consistentment» (recurrent a tot l'article)
- Anglès: "consistently", "the most consistently supported finding", etc.
- Català actual: «apareixen consistentment», «modera consistentment» (i a altres articles del lot)
- Categoria: CALC (fals amic) · Gravetat BAIXA
- Proposta: «de manera constant / sistemàticament / regularment»; per a «consistent» en el sentit de «sòlid/coherent», usar «sòlid», «ben fonamentat».
- Justificació: *consistent/consistently* és un fals amic parcial: en català «consistent» vol dir «que té consistència, ferm»; el sentit anglès de «constant, regular, coherent» es perd. Recurrent a tot el lot (motivació, estructures, modes de fallada). Optimot/esADIR recomanen «constant», «coherent», «regular» segons el cas.

### Resum quantitatiu — team-failure-modes
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (errata, anglès sense traduir, lèxic) | 3 | 1 | – |
| CALC (mapejar, consistentment) | – | 1 | 2 |
| FIDELITAT/lèxic («perduts») | – | – | 1 |
| Total incidències | **3** | **2** | **3** |

---

## "El que significa l'Obertura a l'Experiència per a la innovació de l'equip — i els seus límits sorprenents" (`what-openness-to-experience-means-for-team-innovation`)

### 6.1 «orientats cap al no-yet-existing» (secció "El que mesura l'Obertura")
- Anglès: "high-Vision individuals are oriented toward the not-yet-existing"
- Català actual: «els individus d'alta Visió estan orientats cap al **no-yet-existing**: la nova idea…»
- Categoria: ERRADA (anglès sense traduir) · Gravetat ALTA
- Proposta: «orientats cap al **que encara no existeix**: la nova idea, l'enfocament alternatiu…»
- Justificació: «no-yet-existing» és anglès cru deixat sense traduir dins del text català. Cal «el que encara no existeix» / «allò que encara no és» (cf. DE «das Noch-nicht-Existierende», DA «det endnu-ikke-eksisterende», que sí ho tradueixen).

### 6.2 «tendeixen a sufinvertir en la planificació operativa» (Planificació deficient)
- Anglès: "tend to underinvest in detailed operational planning"
- Català actual: «tendeixen a **sufinvertir** en la planificació operativa detallada»
- Categoria: ERRADA (mot inexistent/calc) · Gravetat ALTA
- Proposta: «tendeixen a **invertir-hi insuficientment** / a **infrainvertir en** la planificació operativa detallada»
- Justificació: «sufinvertir» no existeix en català (calc del cast. *subinvertir*/ang. *underinvest* amb prefix mal format). El prefix culte és «infra-» («infrainvertir») o cal perifrasi «invertir insuficientment» (que l'article de motivació, del mateix lot, fa servir correctament — vegeu 4.6). Incoherència interna a la col·lecció a més de l'errada.

### 6.3 «Baixa capacitat de seguiment» (encapçalament de vinyeta)
- Anglès: "Low follow-through."
- Català actual: «**Baixa capacitat de seguiment.**»
- Categoria: FIDELITAT (fals amic) · Gravetat MITJANA
- Proposta: «**Poca constància a dur les coses fins al final** / **Manca de perseverança en l'execució**»
- Justificació: *follow-through* = «dur a terme fins al final, completar», no «seguiment» (que és *follow-up*/*monitoring*, fals amic). El text mateix explica el concepte com «execució sostinguda d'un curs ja determinat», cosa que confirma que «seguiment» desvirtua el sentit.

### 6.4 «sensibilitat a la bellesa» / facetes IPIP (llista)
- Anglès: facet list (Fantasy, Aesthetics, Feelings, Actions, Ideas, Values)
- Català actual: «Fantasia», «Estètica», «Sentiments», «Accions», «Idees», «Valors»
- Categoria: correcte · Gravetat — (sense incidència; bona traducció de les sis facetes IPIP. Es registra per descartar fals positiu.)

### 6.5 «sufinvertir» a banda — «Distracció per noves idees» / «scope creep» (vinyeta 2)
- Anglès: "creates a vulnerability to scope creep and pivot"
- Català actual: «crea una vulnerabilitat a la **desviació de l'abast** i als canvis de rumb»
- Categoria: correcte · Gravetat — (sense incidència: «desviació de l'abast» és bona traducció de *scope creep* i «canvis de rumb» de *pivot*. Es registra com a bona pràctica / fals positiu, en contrast amb DA i DE que deixen «scope creep»/«pivots» sense traduir.)

### 6.6 «sind que romanen genuïnament interessats» — comprovació «genuí» (recurrent)
- Anglès: "minds that remain genuinely interested"
- Català actual: «la producció natural de ments que romanen **genuïnament** interessades»
- Categoria: REGISTRE (calc tolerat) · Gravetat BAIXA
- Proposta: «**realment / autènticament / sincerament** interessades»
- Justificació: «genuí/genuïnament» és normatiu (DIEC2) però el seu ús sistemàtic com a calc de *genuine/genuinely* (apareix desenes de vegades a tot el lot: «genuïnes fortaleses», «genuïnament valuosa», «genuí dissentiment») resulta repetitiu i poc idiomàtic; el català prefereix «autèntic», «real», «sincer», «de debò» segons el context. Nota de naturalesa/registre, recurrent a tota la col·lecció.

### 6.7 «forfiningr»/«variation» — comprovar grafia (només DA) — n/a al català
- Categoria: correcte · Gravetat — (el text català no té aquesta errata; només la versió DA. Sense incidència al `ca`.)

### 6.8 «gruppenteori» / «pensament de grup» a la taula (fila Equip de lideratge)
- Anglès: "Homogeneous Vision: groupthink on the generative side"
- Català actual: «Visió homogènia: **pensament de grup** en el costat generatiu; consens en plans apassionants però inimplementables»
- Categoria: correcte · Gravetat — (sense incidència; «pensament de grup» és la traducció correcta de *groupthink*. Nota: la versió DA escriu erròniament «gruppenteori»/«gruppentenkning»; el català és correcte. Es registra per descartar fals positiu.)

### 6.9 «plans apassionants però inimplementables» (taula)
- Anglès: "consensus on exciting but undeliverable plans"
- Català actual: «consens en plans apassionants però **inimplementables**»
- Categoria: TERMINOLOGIA/lèxic · Gravetat BAIXA
- Proposta: «plans engrescadors però **inviables / irrealitzables / impossibles de dur a terme**»
- Justificació: «inimplementable» és un calc poc establert (*undeliverable*); «implementar» és admès però l'adjectiu negatiu «inimplementable» és pesat i tècnic. Millor «inviable», «irrealitzable», «que no es poden dur a terme/lliurar». «apassionants» per *exciting* és correcte però «engrescadors» encaixa millor amb plans.

### 6.10 «la composició de personalitat com una variable de disseny» (tancament)
- Anglès: "understanding personality composition as a design variable — something to think through, not leave to chance"
- Català actual: «entendre la composició de personalitat com una variable de disseny, quelcom en el qual pensar, no deixar a l'atzar.»
- Categoria: FIDELITAT/REGISTRE · Gravetat BAIXA
- Proposta: «… una variable de disseny: quelcom que cal **rumiar/meditar a fons**, no deixar a l'atzar.»
- Justificació: *to think through* = «rumiar/meditar a fons, considerar detingudament», no només «pensar». «quelcom en el qual pensar» empal·lideix el sentit (think *through* ≠ think *about*). Millora de fidelitat lleu.

### Resum quantitatiu — what-openness-to-experience
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (anglès sense traduir, mot inexistent) | 2 | – | – |
| FIDELITAT (follow-through, think through) | – | 1 | 1 |
| TERMINOLOGIA/lèxic («inimplementable») | – | – | 1 |
| REGISTRE («genuïnament») | – | – | 1 |
| Total incidències | **2** | **1** | **3** |


## "Per què la ciència de la personalitat pertany al cor de la gestió de persones basada en l'evidència" `personality-science-evidence-based-hr-why-it-matters`

### 1. «reclamacions més fortes a un rol central» (paràgraf 3 de la introducció)
- Anglès: "has one of the strongest claims to a central role"
- Català actual: «té una de les reclamacions més fortes a un rol central»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat ALTA
- Proposta: «té un dels arguments més sòlids per a un paper central» (o «és de les que millor poden reivindicar un paper central»)
- Justificació: *claim* en aquest sentit és una afirmació/pretensió/argument, no una «reclamació» (= protesta o petició formal de compensació). És un fals amic clàssic; «reclamació» tradueix només el *claim* de consum. A més, la recció «reclamació a un rol» és aliena al català. Vegeu [diccionari.cat, *claim*](https://www.diccionari.cat/angles-catala/claim) (claim = afirmació, pretensió, reivindicació).

### 2. «reclamacions de validació opaques» (secció «Comença amb l'avaluació...»)
- Anglès: "proprietary tools with opaque validation claims"
- Català actual: «eines propietàries amb reclamacions de validació opaques»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat ALTA
- Proposta: «eines propietàries amb afirmacions de validació opaques» (o «amb una validació poc transparent»)
- Justificació: mateix calc que la incidència 1. *Validation claims* = «afirmacions sobre la validació», no «reclamacions». Coherència interna: cal corregir totes dues ocurrències.

### 3. «judicat» (definició de Rousseau i Barends, secció «Què significa realment...»)
- Anglès: "the conscientious, explicit, and judicious use of the best available evidence"
- Català actual: «l'ús conscient, explícit i judicat de la millor evidència disponible»
- Categoria: ERRADA (lèxic) · Gravetat ALTA
- Proposta: «l'ús conscienciós, explícit i judiciós de la millor evidència disponible»
- Justificació: *judicious* es tradueix per **judiciós** ('que té bon judici, assenyat'), no per «judicat» (participi de *judicar*, inexistent o impropi ací). Vegeu [GDLC, *judiciós*](https://www.diccionari.cat/GDLC/judicios). A més, *conscientious* ací val «conscienciós/diligent», no «conscient» (= *aware*); és una segona errada de fidelitat dins de la mateixa enumeració.

### 4. «only» sense traduir (secció «Com construir un programa...», punts 3 i 5)
- Anglès: "Personality profiles are only as useful as the people who read them" / "should be used only for the purposes for which they were validated"
- Català actual: «Els perfils de personalitat only són tan útils com les persones que els llegeixen» · «haurien de ser usats only per als propòsits per als quals van ser validats»
- Categoria: ERRADA (mot anglès no traduït) · Gravetat ALTA
- Proposta: «Els perfils de personalitat només són tan útils com les persones que els llegeixen» · «haurien de ser usats només per als propòsits per als quals van ser validats»
- Justificació: ha quedat el mot anglès *only* sense traduir en dos punts. Cal «només» (o «únicament»). Error de producció molt visible.

### 5. «judicat» / castellanisme «Percibent» (secció MBTI, dicotomies)
- Anglès: "(Introvert/Extrovert, Sensing/Intuition, Thinking/Feeling, Judging/Perceiving)"
- Català actual: «(Introvertit/Extrovertit, Sensorial/Intuïció, Pensament/Sentiment, Jutjant/Percibent)»
- Categoria: ERRADA (castellanisme) · Gravetat ALTA
- Proposta: «(Introvertit/Extravertit, Sensació/Intuïció, Pensament/Sentiment, Judici/Percepció)» o, si es manté l'estil de participi, «Jutjador/Perceptiu»
- Justificació: **Percibent** és un castellanisme cru (cast. *percibiente*); no existeix en català. La forma catalana és «perceptiu» o el nom «percepció». A més, «Extrovertit» conviu amb «Extraversion» (anglès) usat a la resta de l'article; la forma normativa preferent és **extravertit/extraversió**. «Jutjant» és gerundi usat com a adjectiu (calc de l'estructura anglesa *-ing*); millor el parell nominal Judici/Percepció, coherent amb les altres tres dicotomies.

### 6. «l'imatge legal i ètica» (secció «Com construir un programa...», punt 5)
- Anglès: "For the full legal and ethical picture, see..."
- Català actual: «Per l'imatge legal i ètica completa, vegeu...»
- Categoria: ERRADA (gènere/preposició) · Gravetat ALTA
- Proposta: «Per a la imatge legal i ètica completa, vegeu...» (millor encara: «Per al panorama legal i ètic complet»)
- Justificació: *imatge* és femení: «la imatge», no «l'imatge» amb article elidit masculí erroni (l'apostrofació no canvia el gènere; el determinant correcte és femení). A més, la preposició de finalitat demana «per a» davant del SN. *Picture* en sentit figurat encaixa millor amb «panorama/visió de conjunt» que amb «imatge».

### 7. «descalificador» (secció «Com construir un programa...», punt 1)
- Anglès: "this should be treated as disqualifying"
- Català actual: «això hauria de ser tractat com a descalificador»
- Categoria: ERRADA (castellanisme) · Gravetat MITJANA
- Proposta: «això s'hauria de considerar un motiu de descart» (o «un factor desqualificador»)
- Justificació: «descalificador» és un castellanisme (cast. *descalificador*); la forma catalana seria «desqualificador», però en aquest context és més natural «motiu de descart / eliminatori». A més, la passiva perifràstica «hauria de ser tractat com a» calca l'anglès *should be treated as*; la pronominal «s'hauria de considerar» és més idiomàtica.

### 8. «el que composa la gestió de persones» (conclusió)
- Anglès: "Personality science is not all of evidence-based HR."
- Català actual: «La ciència de la personalitat no és tot el que composa la gestió de persones basada en l'evidència.»
- Categoria: ERRADA (castellanisme verbal) · Gravetat MITJANA
- Proposta: «La ciència de la personalitat no és tot el que compon la gestió de persones basada en l'evidència» (o «...no ho és tot, en la gestió...»)
- Justificació: «composar» en el sentit de 'formar, constituir, integrar' és una intromissió del cast. *componer*; la forma catalana és **compondre** (3a pers. «compon»). Vegeu [Optimot, *composar* o *compondre*](https://aplicacions.llengua.gencat.cat/llc/AppJava/index.html?action=Principal&method=detall&idFont=7353&idHit=7353) i [DIEC2, *compondre*](https://dlc.iec.cat/results.asp?txtEntrada=compondre).

### 9. «risc de sortida precoça» (taula resum, fila «Anàlisi de la retenció»)
- Anglès: "predict early exit risk"
- Català actual: «prediuen el risc de sortida precoça»
- Categoria: ERRADA (concordança) · Gravetat MITJANA
- Proposta: «prediuen el risc de sortida precoç» (o «de sortida prematura»)
- Justificació: **precoç** és invariable en singular (un/una precoç); el femení «precoça» no existeix (el plural sí distingeix: precoços/precoces). Vegeu [GIEC §7.2.2.2, adjectius invariables respecte al gènere](https://giec.iec.cat/textgramatica/codi/7.2.2.2). Alternativa més transparent en divulgació: «sortida prematura/anticipada».

### 10. «document de Denise Rousseau i Eric Barends del 2011» (secció «Què significa realment...»)
- Anglès: "through Denise Rousseau and Eric Barends' 2011 paper in Human Resource Management"
- Català actual: «a través del document de Denise Rousseau i Eric Barends del 2011 a Human Resource Management»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat MITJANA
- Proposta: «a través de l'article de Denise Rousseau i Eric Barends del 2011 a Human Resource Management»
- Justificació: un *paper* publicat en una revista acadèmica és un **article** (o «treball»), no un «document». «Document» és un fals amic genèric que en context bibliogràfic perd la referència a publicació científica revisada.

### 11. Tractament personal: «tu» en les crides al lector (introducció i secció «Comença...»)
- Anglès: "Who gets hired? ... You can see how the science is implemented ... if your organisation is serious..."
- Català actual: «Pots veure com s'implementa la ciència a /ciència», «executar una avaluació completa ... gratuïtament», «Si la teva organització s'ho pren seriosament»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar al tractament de vós en les crides a l'acció: «Podeu veure com s'implementa la ciència...», «Si la vostra organització s'ho pren seriosament...»
- Justificació: el model de llengua de l'auditoria fixa el tractament de **vós** per als verbs referits al lector (vegeu el brief). L'article usa «tu» («pots», «la teva organització»); cal regularitzar-lo a vós per coherència amb la col·lecció. La concordança d'adjectiu amb vós es manté en singular.

### 12. «efectes de halo» / «biaix de halo» (secció entrevistes i taula resum)
- Anglès: "halo effects" / "manager nomination with halo bias"
- Català actual: «efectes de halo», «nominació de directiu amb biaix de halo»
- Categoria: TERMINOLOGIA/ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «efectes d'halo» / «biaix d'halo», o millor el terme català «efecte d'aurèola» (i «biaix d'aurèola»)
- Justificació: davant de mot començat per *h* muda, l'article i la preposició s'apostrofen i contrauen: «d'halo», no «de halo». A més, en català psicològic el terme assentat és **efecte d'aurèola** (cf. cast. *efecto halo* / *efecto aureola*); «halo» és acceptable com a manlleu però la forma catalana és preferible en divulgació culta. Recurrent (dues ocurrències).

### 13. «els actuals rendidors alts» / «rendidors alts» (secció «Comparació estructurada»)
- Anglès: "current high performers in equivalent roles"
- Català actual: «entre candidats i actuals rendidors alts en rols equivalents»
- Categoria: CALC · Gravetat MITJANA
- Proposta: «entre candidats i les persones d'alt rendiment actuals en rols equivalents» (o «els qui actualment tenen un rendiment alt»)
- Justificació: «rendidor alt» calca *high performer*; «rendidor» com a substantiu de persona no és idiomàtic en català (rendidor val sobretot 'que ret/produeix' aplicat a coses). El sintagma natural és «persona d'alt rendiment / d'alt acompliment». A la taula resum apareix també «Höchstleister» (DE) i «highest-validating», però la incidència és només al cos català.

### 14. «fiabilitat de prova-nova prova» (seccions MBTI i «Triar instruments»)
- Anglès: "test-retest reliability"
- Català actual: «La fiabilitat de prova-nova prova és dolenta», «fiabilitat de prova-nova prova adequada»
- Categoria: CALC/TERMINOLOGIA · Gravetat MITJANA
- Proposta: «la fiabilitat test-retest» (manlleu tècnic consolidat) o «la fiabilitat de la reavaluació» / «de repetició de la prova»
- Justificació: «prova-nova prova» és una traducció literal opaca de *test-retest* que trenca la transparència del terme tècnic. En psicometria catalana s'usa habitualment «fiabilitat test-retest»; alternativament, una perífrasi clara («consistència entre una prova i la seva repetició»). Recurrent.

### 15. «els participants ... reben una classificació ... quan es reanalitzen» (secció MBTI)
- Anglès: "receive a different type classification when retested five weeks later"
- Català actual: «reben una classificació de tipus diferent quan es reanalitzen cinc setmanes després»
- Categoria: FIDELITAT/ERRADA (lèxic) · Gravetat MITJANA
- Proposta: «obtenen una classificació de tipus diferent quan se'ls torna a administrar la prova cinc setmanes després» (o «quan es tornen a avaluar»)
- Justificació: *retested* no és «reanalitzar» (= tornar a analitzar dades), sinó «tornar a fer/administrar la prova» a les persones. «Reanalitzar» canvia el referent (passa de re-test a re-anàlisi). A més, «es reanalitzen» amb subjecte «participants» és confús: són examinats, no s'examinen ells mateixos.

### 16. «en lloc de competència real» / «coincidència cultural» (secció entrevistes)
- Anglès: "cultural match rather than actual competence"
- Català actual: «coincidència cultural en lloc de competència real»
- Categoria: CALC · Gravetat BAIXA
- Proposta: «afinitat/semblança cultural en lloc de competència real»
- Justificació: *cultural match* aplicat a persones és «afinitat» o «semblança» cultural, no «coincidència» (que suggereix atzar o simultaneïtat). El mateix concepte («cultural similarity») es tradueix més avall per «similitud cultural» a «adequació cultural»; convé acostar les dues solucions.

### 17. «a la caixa d'eines de RRHH» / «caixa d'eines» (diverses seccions)
- Anglès: "in the HR toolkit"
- Català actual: «alternatives a la caixa d'eines de RRHH»
- Categoria: ERRADA (preposició) · Gravetat BAIXA
- Proposta: «alternatives de la caixa d'eines de RRHH» (o «del catàleg d'eines de RRHH»)
- Justificació: la recció és «alternatives DE» (les que formen part del conjunt), no «alternatives A» (que en seria el contrari). «a la caixa d'eines» calca l'anglès *in the toolkit* aplicat de manera locativa; en català el complement del nom va amb «de».

### 18. «aquest és el punt d'entrada més accessible» (final de la secció «Comença...»)
- Anglès: "this is the most accessible entry point available"
- Català actual: «aquest és el punt d'entrada més accessible disponible»
- Categoria: correcte · Gravetat —
- Justificació: fals positiu que cal descartar: ací «punt d'entrada» és *entry point* literal i correcte (no l'idiom *that is the point* → «aquesta és la qüestió»). No s'ha de tocar. (Sí que es pot polir la redundància «més accessible disponible» → «el punt d'entrada més accessible que hi ha».)

### 19. Targetes d'estadística i capçaleres de taula en anglès (secció «Què significa realment...»)
- Anglès: "cost of a bad hire (average estimate)" etc.
- Català actual: idèntic en anglès dins del bloc `<div class="stat-grid">` (no traduït)
- Categoria: FIDELITAT · Gravetat BAIXA
- Proposta: traduir les etiquetes: «cost d'una mala contractació (estimació mitjana)», «líders de RRHH que usen dades de personalitat informen de més cohesió d'equip», etc.
- Justificació: el bloc d'estadístiques ha quedat en anglès en totes les llengües (és contingut compartit), però en una versió catalana publicada les etiquetes haurien d'anar traduïdes per coherència amb la resta del cos. Es marca com a BAIXA perquè és un patró comú a tota la col·lecció, no exclusiu d'aquest article.

### Resum quantitatiu
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (lèxic, castellanismes, gènere, concordança, mot no traduït) | 4 | 3 | – |
| TERMINOLOGIA (falsos amics: claim, paper, halo) | 2 | 2 | – |
| CALC (rendidor alt, test-retest, match) | – | 1 | 2 |
| FIDELITAT (retested, stat-grid) | – | 1 | 1 |
| REGISTRE/COHERÈNCIA (tractament tu/vós) | – | 1 | – |
| Total incidències | **6** | **8** | **3** |

Total: **17 incidències** (+ 1 fals positiu registrat).


## "Estils de resolució de conflictes i personalitat: el que diu la investigació" (`conflict-resolution-styles-personality`)

### 1.1 Tractament de "tu" sistemàtic en lloc de "vós"
- Ubicació: tot l'article (crides al lector i possessius): «com les persones el gestionen», «al teu equip», «Mira Com els Estils de Conflicte Apareixen al Teu Equip», «veure-les mapejades al teu equip real».
- Anglès: "mapped to your actual team", "how conflict styles show up in your team".
- Català actual: «el Teu Equip», «al teu equip real».
- Categoria: REGISTRE · Gravetat: MITJANA.
- Proposta: unificar al tractament de vós a tota la col·lecció: «el vostre equip», «mapejades al vostre equip real», «Mireu com els estils de conflicte apareixen al vostre equip». Observació: la secció final ja barreja «Si el vostre equip experimenta» i «Podeu realitzar» (vós) amb «al teu equip» (tu) en el mateix paràgraf, cosa que fa la incoherència interna i no només inter-article.
- Justificació: model de llengua de l'auditoria (vós per a les crides al lector). Ací la barreja és intra-article: el darrer paràgraf passa de «el teu equip» a «el vostre equip ... Podeu realitzar» en tres línies.

### 1.2 «sobreacomo» — paraula truncada
- Ubicació: secció «Usar les Dades de Personalitat de l'Equip...»: «és probable que aquest equip no mostri prou desacord i sobreacomo».
- Anglès: "this team is likely to under-surface disagreement and over-accommodate".
- Català actual: «no mostri prou desacord i sobreacomo».
- Categoria: ERRADA · Gravetat: ALTA.
- Proposta: «que aquest equip tendeixi a no fer aflorar prou el desacord i a acomodar-se en excés» (o «a sobreacomodar-se»).
- Justificació: «sobreacomo» no és cap mot català; és un truncament/error de composició del verb (probablement «sobreacomodar-se» tallat). A més, «no mostri prou desacord» perd el matís de *under-surface* (no fer-lo aflorar); convé «fer aflorar».

### 1.3 «entre la tria deliberada» / «abans que entre la reflexió»
- Ubicació: introducció i conclusió: «abans que entre la tria deliberada», «la resposta que sorgeix abans que entri la reflexió».
- Anglès: "before deliberate choice kicks in", "the response that surfaces before reflection sets in".
- Català actual: «abans que entre la tria deliberada» (1a ocurrència) i «abans que entri la reflexió» (2a ocurrència).
- Categoria: REGISTRE/COHERÈNCIA · Gravetat: BAIXA.
- Proposta: unificar la flexió del subjuntiu: o bé «entre» (model valencià) o bé «entri» (general) a totes dues ocurrències; recomanat «entri en joc» per a *kicks in / sets in*, que és més idiomàtic que «entrar» a seques.
- Justificació: dins del mateix text conviuen «entre» i «entri» per al mateix verb i mateix temps; cal coherència morfològica (brief, model de llengua). «kicks in» = «entra/entri en joc», no només «entrar».

### 1.4 «input predeliberació anònim»
- Ubicació: secció «Usar les Dades...»: «usant input predeliberació anònim».
- Anglès: "using anonymous pre-deliberation input".
- Català actual: «usant input predeliberació anònim».
- Categoria: CALC · Gravetat: MITJANA.
- Proposta: «recollint aportacions anònimes abans de la deliberació» o «mitjançant aportacions prèvies a la deliberació, anònimes».
- Justificació: «input» és anglicisme cru (TERMCAT recomana «aportació/entrada/dades d'entrada»); a més, «input predeliberació» és una juxtaposició nominal calcada de l'anglès (*pre-deliberation input*) sense preposició, agramatical en català. El gerundi «usant» també calca *using* (preferible «recollint/mitjançant»).

### 1.5 «reduint el cost inhibidor»
- Ubicació: secció «Extraversió (Presència) → competència»: «redueixen el cost inhibidor de prendre una posició forta públicament».
- Anglès: "reduce the inhibitory cost of taking a strong position publicly".
- Català actual: «redueixen el cost inhibidor».
- Categoria: correcte · Gravetat: — (sense incidència; «inhibidor» és adjectiu normatiu i la traducció és fidel; es registra per descartar fals positiu).

### Resum quantitatiu — `conflict-resolution-styles-personality`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA | 1 | – | – |
| CALC | – | 1 | – |
| REGISTRE/COHERÈNCIA | – | 1 | 1 |
| Total incidències | **1** | **2** | **1** |

---

## "La història del Big Five: d'Allport a Goldberg" (`history-of-the-big-five-from-allport-to-goldberg`)

### 2.1 «inmanejable» — castellanisme
- Ubicació: secció «Com Allport i Odbert van iniciar el Big Five»: «Divuit mil és un nombre inmanejable.»
- Anglès: "Eighteen thousand is an unmanageable number."
- Català actual: «un nombre inmanejable».
- Categoria: ERRADA/CALC (castellanisme) · Gravetat: ALTA.
- Proposta: «un nombre ingestible» / «inabastable» / «impossible de gestionar».
- Justificació: «inmanejable» no existeix en català (calc del cast. *inmanejable*); a més, en català la grafia del prefix negatiu davant de *m-* exigeix «im-» (mai «in-» davant labial). Formes correctes: «inabastable», «ingestionable», o la perífrasi «impossible de gestionar/manejar».

### 2.2 «dotzenes de llengues» — manca de dièresi (recurrent)
- Ubicació: secció «McCrae i Costa»: «rèpliques transculturals en dotzenes de llengues»; i secció «Per què 70 anys...»: «Anàlisis lèxiques independents en múltiples llengues».
- Anglès: "cross-cultural replications in dozens of languages", "independent lexical analyses in multiple languages".
- Català actual: «llengues» (×2).
- Categoria: ERRADA (ortografia) · Gravetat: ALTA.
- Proposta: «llengües» (amb dièresi sobre la u).
- Justificació: la *u* de *-gües* es pronuncia i duu dièresi obligatòria (DIEC2/DNV: «llengües»). Error recurrent dins de l'article.

### 2.3 «són auditable de manera independent» — concordança
- Ubicació: secció «Com Goldberg va encunyar...»: «els ítems, els procediments de puntuació i l'evidència de validesa estan tots disponibles públicament i són auditable de manera independent».
- Anglès: "are all publicly available and independently auditable".
- Català actual: «són auditable de manera independent».
- Categoria: ERRADA (concordança) · Gravetat: ALTA.
- Proposta: «són auditables de manera independent».
- Justificació: el subjecte és plural (ítems, procediments, evidència); l'adjectiu «auditable» ha de concordar en plural: «auditables».

### 2.4 «no explica completament *per qué*» — accent gràfic
- Ubicació: secció «Per què 70 anys...»: «no explica completament *per qué* existeixen aquestes diferències».
- Anglès: "does not fully explain *why* these differences exist".
- Català actual: «*per qué*».
- Categoria: ERRADA (ortografia) · Gravetat: ALTA.
- Proposta: «*per què*» (accent obert).
- Justificació: en català l'accent de «què» (i «què» interrogatiu) és sempre greu/obert: «per què». «qué» amb accent tancat és grafia castellana. (Contrasta amb la resta de l'article, que escriu «per què» correctament: error puntual.)

### 2.5 «la taxonomia de personalitat més replicada en la psicologia empírica»
- Ubicació: introducció.
- Anglès: "the most replicated personality taxonomy in empirical psychology".
- Català actual: «la taxonomia de personalitat més replicada en la psicologia empírica».
- Categoria: correcte · Gravetat: — (fidel i ben travat; es registra per descartar el dubte sobre «replicada», que és participi normatiu de «replicar»).

### 2.6 «movent el model d'una taxonomia descriptiva a un relat explicatiu»
- Ubicació: secció «McCrae i Costa»: «movent el model d'una taxonomia descriptiva a un relat explicatiu».
- Anglès: "moving the model from a descriptive taxonomy to an explanatory account".
- Català actual: «movent el model d'una taxonomia descriptiva a...».
- Categoria: CALC · Gravetat: BAIXA.
- Proposta: «fent passar el model d'una taxonomia descriptiva a un relat explicatiu» o «que feia evolucionar el model de...».
- Justificació: «moure (un model) de X a Y» calca l'ang. *move from ... to*; en català «moure» rarament expressa transició conceptual. Millor «fer passar/fer evolucionar de ... a». El gerundi de conseqüència «movent» també és poc idiomàtic.

### Resum quantitatiu — `history-of-the-big-five-from-allport-to-goldberg`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (castellanisme, ortografia, concordança) | 4 | – | – |
| CALC | – | – | 1 |
| Total incidències | **4** | **0** | **1** |

---

## "MBTI vs Big Five: quin hauria d'utilitzar el teu equip?" (`mbti-vs-big-five-which-should-your-team-use`)

### 3.1 Tractament de "tu" sistemàtic en lloc de "vós"
- Ubicació: títol i tot l'article: «quin hauria d'utilitzar el teu equip?», «Depèn del que vols mesurar... de si estàs disposat a repetir», «El teu equip mereix», «Veuràs les teves puntuacions», «Prova'l gratuïtament».
- Anglès: "which one should your team use?", "It depends on what you want to measure", "Your team deserves", "You will see your scores", "Try it free".
- Català actual: «el teu equip», «vols mesurar», «estàs disposat», «Veuràs les teves puntuacions», «Prova'l».
- Categoria: REGISTRE · Gravetat: MITJANA.
- Proposta: unificar a vós: «quin hauria d'utilitzar el vostre equip?», «Depèn del que vulgueu mesurar... de si esteu disposats a», «El vostre equip mereix», «Veureu les vostres puntuacions», «Proveu-lo gratuïtament».
- Justificació: model de llengua de l'auditoria (vós a les crides al lector). L'article és coherentment en "tu", però discrepa del model vós aplicat a la col·lecció; cal unificar.

### 3.2 «forja trets continus en categories binàries»
- Ubicació: secció «El problema del test-retest»: «l'instrument forja trets continus en categories binàries».
- Anglès: "the instrument forces continuous traits into binary categories".
- Català actual: «forja trets continus en categories binàries».
- Categoria: TERMINOLOGIA (fals amic) · Gravetat: ALTA.
- Proposta: «l'instrument força/encaixa a la força trets continus dins de categories binàries» (o «encotilla»).
- Justificació: l'anglès és *forces* (força, obliga), no *forges*. «forjar» en català significa «treballar (un metall) o fabricar/falsificar», fals amic de *forge*; ací el sentit és «forçar dins de». Canvi de sentit central de l'argument.

### 3.3 «el que els s'adapten» — pronom espuri
- Ubicació: secció «Per què el Big Five supera el MBTI...»: «el que difereix és el tipus d'entorn i les tasques que els s'adapten».
- Anglès: "what differs is the type of environment and tasks that suit them".
- Català actual: «les tasques que els s'adapten».
- Categoria: ERRADA (sintaxi pronominal) · Gravetat: MITJANA.
- Proposta: «les tasques que els convenen» o «que s'adapten a ells» / «que se'ls adapten».
- Justificació: «que els s'adapten» és agramatical: combinació impossible del datiu «els» amb el reflexiu «s'» sense reordenació. Cal «que se'ls adapten» (clític combinat) o, més clar, «que els convenen/escauen». *suit* = «convenir/escaure», millor que «adaptar-se».

### 3.4 «un anàlisi dedicat»
- Ubicació: secció «El MBTI prediu el rendiment laboral?»: «Per a un anàlisi dedicat sobre per què això importa».
- Anglès: "For a dedicated analysis of why this matters".
- Català actual: «un anàlisi dedicat».
- Categoria: ERRADA (gènere) · Gravetat: MITJANA.
- Proposta: «una anàlisi dedicada» (o «una anàlisi específica»).
- Justificació: «anàlisi» és femení en català normatiu (DIEC2/DNV: «una anàlisi»). «un anàlisi» és castellanisme de gènere. A més, «dedicat» (de *dedicated*) és calc; millor «específica/detallada».

### Resum quantitatiu — `mbti-vs-big-five-which-should-your-team-use`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| TERMINOLOGIA (fals amic) | 1 | – | – |
| ERRADA (gènere, sintaxi) | – | 2 | – |
| REGISTRE | – | 1 | – |
| Total incidències | **1** | **3** | **0** |

---

## "Personalitat i negociació: qui guanya — i per què" (`personality-and-negotiation-who-wins-and-why`)

### 4.1 Targetes d'estadístiques i taula sense traduir (anglès cru)
- Ubicació: bloc `stat-grid` inicial i taula «Tret Big Five / Nom Cèrcol»: «Extraversion → negotiation assertiveness», «Low Agreeableness → willingness to hold firm on position», «Openness → finding creative integrative solutions», «Neuroticism → negotiation concession under pressure»; columna «Nom Cèrcol»: «Presence», «Bond», «Discipline», «Low Depth», «High Depth», «Vision».
- Anglès: idèntic (és la font).
- Català actual: text anglès sense traduir dins de la versió catalana.
- Categoria: FIDELITAT · Gravetat: ALTA.
- Proposta: traduir les etiquetes: «Extraversió → assertivitat en la negociació», «Baixa Amabilitat → disposició a mantenir-se ferm en la posició», «Obertura → trobar solucions integradores creatives», «Neuroticisme → concessió sota pressió»; i a la taula, usar els noms Cèrcol en català ja emprats al cos: «Presència», «Vincle», «Disciplina», «Baixa Profunditat», «Alta Profunditat», «Visió».
- Justificació: la versió `ca` deixa blocs sencers en anglès, cosa que trenca la fidelitat i la coherència lingüística (la resta de l'article ja tradueix aquests termes). És el defecte més greu de l'article.

### 4.2 «compostació» — fals amic / invenció
- Ubicació: taula de trets, fila «Neuroticisme (baix) / Low Depth»: «Regulació de l'amenaça, compostació sota pressió, paciència».
- Anglès: "Threat regulation, composure under pressure, patience".
- Català actual: «compostació sota pressió».
- Categoria: TERMINOLOGIA (fals amic) · Gravetat: ALTA.
- Proposta: «aplom sota pressió» / «serenitat sota pressió» / «autodomini sota pressió».
- Justificació: *composure* = «aplom, serenitat, autodomini» (diccionaris.cat dóna «aplom», amb sinònims «autodomini, serenitat»). «compostació» no és cap mot català (sembla derivar de *compost*/compostatge); error greu que destrueix el sentit. Font: diccionaris.cat, entrada «aplom».

### 4.3 «un pla prefet»
- Ubicació: secció «Amabilitat i concessió»: «en l'execució d'un pla prefet».
- Anglès: "the execution of a pre-made plan".
- Català actual: «un pla prefet».
- Categoria: ERRADA (lèxic) · Gravetat: MITJANA.
- Proposta: «un pla fet per endavant» / «un pla predefinit» / «un pla preestablert».
- Justificació: «prefet» no és forma lexicalitzada en català (el participi de «fer» és «fet»; «pre-» + «fet» no genera un mot acceptat). Cal una perífrasi («fet per endavant») o un adjectiu existent («predefinit/preestablert»).

### 4.4 Barreja de tractament tu/vós dins del mateix paràgraf
- Ubicació: secció final «Coneix el teu estil de negociació abans de seure»: «Entendre les teves tendències per defecte — on cediu excessivament, on us prepareu insuficientment, on l'activació de l'amenaça estreny el teu pensament».
- Anglès: "Understanding your own default tendencies — where you over-concede, where you under-prepare, where threat activation narrows your thinking".
- Català actual: barreja «les teves tendències»/«el teu pensament» (tu) amb «on cediu excessivament, on us prepareu» (vós) en una sola frase.
- Categoria: REGISTRE/COHERÈNCIA · Gravetat: ALTA.
- Proposta: unificar a vós: «Entendre les vostres tendències per defecte — on cediu en excés, on us prepareu insuficientment, on l'activació de l'amenaça us estreny el pensament».
- Justificació: és una incoherència de tractament intra-frase (tu + vós alhora), no només inter-article: el possessiu «teves/teu» conviu amb les formes verbals de vós «cediu/prepareu». A la mateixa secció: «Fes l'avaluació» (tu) i «Establir el teu mínim» (tu) contrasten amb el vós d'aquesta frase.

### 4.5 «la incomoditat de reclamar» / «en les components de suma zero»
- Ubicació: secció «Amabilitat i concessió»: «en les components de suma zero de les negociacions».
- Anglès: "in zero-sum components of negotiations".
- Català actual: «en les components de suma zero».
- Categoria: ERRADA (gènere) · Gravetat: MITJANA.
- Proposta: «en els components de suma zero».
- Justificació: «component» en el sentit de «part/element» és masculí en català (DIEC2: «el component»). És femení només en accepcions tècniques específiques (la component d'un vector/força). Ací («parts d'una negociació») cal masculí: «els components». Apareix també «components distributives» (secció «Per què la baixa Amabilitat...») amb el mateix error de gènere.

### 4.6 «la personalitat modela el comportament»
- Ubicació: introducció i secció Neuroticisme: «La personalitat modela el comportament de negociació», «El Depth (Neuroticisme) modela el comportament».
- Anglès: "Personality shapes negotiation behaviour", "Depth shapes negotiation behaviour".
- Català actual: «modela el comportament».
- Categoria: CALC · Gravetat: BAIXA.
- Proposta: «configura / determina / condiciona el comportament» (o «dóna forma al comportament»).
- Justificació: «modelar» com a traducció de *to shape* (donar forma en sentit figurat) és tolerable però tendeix al calc quan es repeteix; en registre culte «configurar/condicionar/determinar» són més precisos per a influència causal. Recurrent (diverses ocurrències). Gravetat baixa perquè «modelar» figura als diccionaris.

### Resum quantitatiu — `personality-and-negotiation-who-wins-and-why`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| FIDELITAT (sense traduir) | 1 | – | – |
| TERMINOLOGIA (fals amic) | 1 | – | – |
| ERRADA (lèxic, gènere) | – | 2 | – |
| REGISTRE/COHERÈNCIA (tractament) | 1 | – | – |
| CALC | – | – | 1 |
| Total incidències | **3** | **2** | **1** |

---

## "El que la ciència de la personalitat no pot predir: els límits honestos del Big Five" (`personality-science-limits-what-it-cannot-predict`)

### 5.1 «Anomenat d'après el showman P. T. Barnum» — gal·licisme
- Ubicació: secció «L'efecte Barnum»: «Anomenat d'après el showman P. T. Barnum».
- Anglès: "Named for the showman P. T. Barnum".
- Català actual: «Anomenat d'après el showman».
- Categoria: CALC (gal·licisme) · Gravetat: ALTA.
- Proposta: «Anomenat així en honor del showman P. T. Barnum» / «que pren el nom del showman P. T. Barnum».
- Justificació: «d'après» és francès («segons/a partir de»); no és català. En català: «en honor de», «a partir de», «pel nom de». A més, «showman» és anglicisme cru: preferible «empresari d'espectacles» o «animador», però com a nom propi cultural és tolerable; el problema dur és «d'après».

### 5.2 Noms de les cinc dimensions sense traduir (anglès cru)
- Ubicació: introducció: «Les seves cinc dimensions — Openness, Conscientiousness, Extraversion, Agreeableness i Neuroticism — van emergir...»; i passim: «Una Conscientiousness alta», «L'Openness prediu», «alta Neuroticism», «puntua alt en Openness (Visió)».
- Anglès: idèntic (és la font; en anglès és correcte).
- Català actual: «Openness, Conscientiousness, Extraversion, Agreeableness i Neuroticism» dins del text català.
- Categoria: FIDELITAT/TERMINOLOGIA · Gravetat: MITJANA.
- Proposta: usar els noms acadèmics catalans, com fa la resta de la col·lecció: «Obertura, Conscienciositat, Extraversió, Amabilitat i Neuroticisme»; «Una Conscienciositat alta», «L'Obertura prediu», «alta puntuació en Neuroticisme». (En blog SÍ es permeten noms acadèmics; el problema és que estan en anglès, no en català.)
- Justificació: el brief permet els noms acadèmics (Big Five, OCEAN...), però han d'anar en català. Deixar-los en anglès trenca la coherència amb tots els altres articles (que diuen «Conscienciositat», «Amabilitat») i amb la pròpia descripció de l'article. Recurrent.

### 5.3 «els comportaments individuals correlacionen molt feblament»
- Ubicació: secció del principi d'agregació: «els comportaments individuals correlacionen molt feblament amb els trets».
- Anglès: "single behaviours correlate very weakly with traits".
- Català actual: «els comportaments individuals correlacionen molt feblament».
- Categoria: FIDELITAT · Gravetat: BAIXA.
- Proposta: «els comportaments aïllats/individuals (presos d'un en un) correlacionen molt feblament».
- Justificació: *single behaviours* contrasta amb *aggregates*; «individuals» és correcte però ambigu (pot llegir-se «d'un individu»). «aïllats» o «presos d'un en un» reprodueix millor l'oposició única/agregat de la font. Matís menor.

### 5.4 «un genuí foment de l'escepticisme»
- Ubicació: secció «L'efecte Barnum»: «han de ser lliurats amb un genuí foment de l'escepticisme».
- Anglès: "delivered with genuine scepticism-encouragement".
- Català actual: «un genuí foment de l'escepticisme» (anteposició de l'adjectiu).
- Categoria: REGISTRE/CALC · Gravetat: BAIXA.
- Proposta: «amb un veritable encoratjament a l'escepticisme» / «fomentant genuïnament l'escepticisme».
- Justificació: l'anteposició «un genuí foment» calca l'ordre anglès (*genuine ... encouragement*); en català la posposició («un foment genuí») o la reformulació verbal és més natural. Glossari: anteposició calcada → posposar.

### 5.5 Tractament de vós coherent
- Ubicació: tot l'article: «Heu eliminat per enginyeria», «la vostra cultura», «no hauríeu de confondre'l», «Usa la ciència de la personalitat honestament» (títol).
- Català actual: vós de manera consistent al cos.
- Categoria: correcte · Gravetat: — (es registra com a fals positiu positiu: aquest article SÍ aplica el model vós; serveix de referència per unificar els articles en "tu" d'aquest mateix lot). Nota menor: el títol de secció final «Usa la ciència...» està en imperatiu de tu, en contrast amb el vós del cos; convindria «Useu la ciència de la personalitat honestament» per coherència.

### Resum quantitatiu — `personality-science-limits-what-it-cannot-predict`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| CALC (gal·licisme, anteposició) | 1 | – | 1 |
| FIDELITAT/TERMINOLOGIA (sense traduir) | – | 1 | 1 |
| Total incidències | **1** | **1** | **2** |

---

## "Els 12 rols d'equip de Cèrcol explicats: quin animal ets?" (`the-12-cercol-team-roles-explained`)

### 6.1 «circumflex» → «circumplex» (terme central, recurrent)
- Ubicació: títol de secció «El circumflex AB5C: la ciència darrere dels 12 rols»; cos: «El circumflex posiciona els trets», «La intuïció clau del model de circumflex», «posicions específiques en dos circumflexos que s'entrecreuen», «L'angle en el circumflex», «Circumflex Abreujat del Big Five (AB5C)».
- Anglès: "The AB5C Circumplex", "Abridged Big Five Circumplex (AB5C)", "The circumplex positions...", "the circumplex model", "two intersecting circumplexes", "The angle in the circumplex".
- Català actual: «circumflex / circumflexos / Circumflex Abreujat».
- Categoria: TERMINOLOGIA (fals amic) · Gravetat: ALTA.
- Proposta: substituir totes les ocurrències per «circumplex / circumplexos / Circumplex Abreujat del Big Five (AB5C)»: «El circumplex AB5C», «el model circumplex», «dos circumplexos que s'entrecreuen».
- Justificació: error R2 de la col·lecció (vegeu 05-blog R2). *Circumplex* és el model circular de la personalitat; *circumflex* és l'accent (^) o estructures anatòmiques (artèria circumflexa). Ací és el terme tècnic central que dóna nom a tota la metodologia dels 12 rols, i l'error apareix fins i tot al títol de secció i a l'acrònim desplegat (AB5C = Abridged Big Five *Circumplex*). Gravetat ALTA.

### 6.2 «luchtan» — barbarisme/error cru
- Ubicació: secció «Com llegir el mapa del teu equip», «Buits estructurals»: «pot tenir intèrprets individuals forts que luchtan amb la coordinació».
- Anglès: "may have strong individual performers who struggle with coordination".
- Català actual: «intèrprets individuals forts que luchtan amb la coordinació».
- Categoria: ERRADA (barbarisme) · Gravetat: ALTA.
- Proposta: «que tenen dificultats amb la coordinació» / «que els costa coordinar-se».
- Justificació: «luchtan» és un barbarisme cru (creuament del cast. *luchan* amb una *t* espúria); no existeix en català. *struggle with* = «tenir dificultats amb / costar». A més, «intèrprets individuals forts» calca *strong individual performers*: millor «professionals individuals destacats» o «bons executors individuals».

### 6.3 «Repte (Llop)» — nom de rol mal traduït
- Ubicació: taula de rols i cos: «Repte | Llop | Alta Presència, Baix Vincle»; «El Repte (Llop) i el Mediador (Dofí)»; «Una persona amb un perfil de Repte».
- Anglès: "Challenger | Wolf"; "Challenger (Wolf) and Mediator (Dolphin)"; "A person with a Challenger profile".
- Català actual: «Repte» (= el desafiament, nom abstracte).
- Categoria: TERMINOLOGIA · Gravetat: ALTA.
- Proposta: «Desafiador» o «Reptador» (l'agent que desafia), coherent amb la resta de noms de rol, que designen persones/agents («Mediador», «Estrateg», «Guardià», «Analista»).
- Justificació: *Challenger* és l'agent (qui repta/desafia); «Repte» és el resultat/acció (*challenge*), no la persona. Tots els altres rols són noms d'agent; «Repte» trenca el paradigma i canvia el referent. «Reptador» o «Desafiador» són les formes correctes. Error de fidelitat sobre un nom propi d'instrument.

### 6.4 «val la pena nombrar-los» / «els buits no nombrats»
- Ubicació: secció «Buits estructurals»: «val la pena nombrar-los, perquè els buits no nombrats generen fricció inexplicable».
- Anglès: "they are worth naming, because unnamed gaps generate unexplained friction".
- Català actual: «nombrar-los», «no nombrats».
- Categoria: TERMINOLOGIA (fals amic) · Gravetat: ALTA.
- Proposta: «val la pena anomenar-los/posar-hi nom, perquè els buits sense nom (que no s'anomenen) generen fricció inexplicable».
- Justificació: fals amic greu: «nombrar» en català = «comptar, fer el recompte» (de *nombre*); *to name* = «anomenar, posar nom». Ací el sentit és «posar nom / explicitar», no «comptar». Canvi de sentit. (Cf. cast. *nombrar* = anomenar, que és l'origen de la confusió.)

### 6.5 «veu quin rol s'adapta» / «veu la documentació» — imperatiu mal format (recurrent)
- Ubicació: descripció (`description`): «Veu quin rol s'adapta i com llegir el mapa del teu equip»; cos: «veu [la documentació científica de Cèrcol]», «veu la composició de personalitat... veu [does personality composition...]».
- Anglès: "See which role fits...", "see the Cèrcol science documentation", "see [does personality composition predict...]".
- Català actual: «Veu...» (3a persona del present, o imperatiu mal format).
- Categoria: ERRADA (morfologia verbal) · Gravetat: MITJANA.
- Proposta: en model vós, «Vegeu quin rol s'adapta», «vegeu la documentació científica». (En "tu" seria «Mira/Consulta», però el remitent demana vós.)
- Justificació: «veu» és 3a pers. sing. del present d'indicatiu («ell veu»); com a imperatiu de cortesia/remissió bibliogràfica cal «vegeu» (vós) o «mira/consulta» (tu). L'ús de «veu» per a *see [reference]* és agramatical com a crida al lector. Recurrent (descripció + cos).

### 6.6 Tractament de "tu" sistemàtic en lloc de "vós"
- Ubicació: títol «quin animal ets?»; cos: «Un cop entens el teu propi rol», «si vols posar-ho en pràctica», «et guia a través del cicle», «El teu perfil de rol», «Cèrcol et dona tots dos», «convida el teu equip i veu on es concentra el teu perfil».
- Anglès: "which animal are you?", "Once you understand your own role", "Cèrcol gives you both", "invite your team".
- Català actual: tractament de tu.
- Categoria: REGISTRE · Gravetat: MITJANA.
- Proposta: unificar a vós: «quin animal sou?», «Un cop enteneu el vostre propi rol», «Cèrcol us dóna tots dos», «convideu el vostre equip i vegeu on es concentra el vostre perfil».
- Justificació: model de llengua de l'auditoria (vós). Cal coherència amb els articles del lot que sí usen vós (p. ex. `personality-science-limits`).

### 6.7 «Sustentador (Salmó)»
- Ubicació: taula de rols: «Sustentador | Salmó | Alt Vincle, Baixa Visió».
- Anglès: "Sustainer | Salmon".
- Català actual: «Sustentador».
- Categoria: TERMINOLOGIA · Gravetat: BAIXA.
- Proposta: revisar la coherència amb la nomenclatura oficial de rols de Cèrcol (PRODUCT.md / `/roles`); «Sustentador» és defensable per a *Sustainer*, però convé verificar que coincideix amb l'etiqueta canònica catalana de l'instrument (alternativa possible: «Mantenidor»). Sense canvi si «Sustentador» és la forma oficial.
- Justificació: coherència terminològica amb els noms de rol fixats pel producte; no és error lingüístic en si.

### Resum quantitatiu — `the-12-cercol-team-roles-explained`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| TERMINOLOGIA (circumplex, fals amic «nombrar», noms de rol) | 3 | – | 1 |
| ERRADA (barbarisme «luchtan», morfologia «veu») | 1 | 1 | – |
| REGISTRE (tractament) | – | 1 | – |
| Total incidències | **4** | **2** | **1** |

---

## "Quins trets de personalitat tenen realment els líders eficaços? (No el que esperaries)" (`what-personality-traits-do-effective-leaders-actually-have`)

### 7.1 «Responsabilitat» i «Agradabilitat» — noms de dimensió incoherents amb la col·lecció
- Ubicació: tot l'article i descripció: «La Responsabilitat (Disciplina) i l'Obertura (Visió)», «Responsabilitat → efectivitat del lideratge», «Agradabilitat (Vincle) — dependent del context», taula «Disciplina | Responsabilitat», «Vincle | Agradabilitat». Descripció: «la responsabilitat prediu qui té èxit».
- Anglès: "Conscientiousness (Discipline)", "Agreeableness (Bond)".
- Català actual: «Responsabilitat» (per Conscientiousness) i «Agradabilitat» (per Agreeableness).
- Categoria: TERMINOLOGIA (incoherència) · Gravetat: ALTA.
- Proposta: unificar amb la nomenclatura acadèmica catalana usada a TOTA la resta de la col·lecció: «Conscienciositat» (no «Responsabilitat») i «Amabilitat» (no «Agradabilitat»). Comparar amb `personality-and-negotiation` (mateix lot), la descripció del qual diu correctament «la Conscienciositat impulsa la preparació, l'Amabilitat costa concessions».
- Justificació: la traducció acadèmica establerta de *Conscientiousness* és «Responsabilitat» O «Escrupolositat» en algunes fonts, però la col·lecció de blog de Cèrcol ha fixat «Conscienciositat» (calc transparent, usat als arts. 1-4 de 05-blog i a la resta d'aquest lot). «Agradabilitat» per *Agreeableness* és pitjor: la forma normalitzada i usada arreu és «Amabilitat». Mantenir «Responsabilitat/Agradabilitat» només en aquest article trenca la coherència terminològica de tot el corpus. Gravetat ALTA per ser els noms de dimensió, terme central i recurrent.

### 7.2 Barreja de tractament vós/vostè a la secció final
- Ubicació: títol de secció «Comprengui el seu perfil de personalitat de lideratge» vs. cos de la mateixa secció: «Comprendre el vostre propi perfil Big Five», «us ofereix», «Si lidereu un equip», «teniu», «Comenceu», «exploreu».
- Anglès: "Understand Your Leadership Personality Profile", "Understanding your own Big Five profile", "If you lead a team".
- Català actual: títol en vostè («Comprengui el seu perfil») i cos en vós («el vostre... lidereu... Comenceu»).
- Categoria: REGISTRE/COHERÈNCIA · Gravetat: ALTA.
- Proposta: posar el títol en vós, coherent amb el cos: «Comprengueu el vostre perfil de personalitat de lideratge».
- Justificació: el títol de secció usa el tractament de vostè (3a pers.: «Comprengui... el seu»), mentre que el cos immediatament posterior usa vós («el vostre... lidereu»). És una incoherència de tractament dins de la mateixa secció. El model de l'auditoria és vós; cal «Comprengueu... el vostre».

### 7.3 «com modela els vostres valors predeterminats naturals de lideratge»
- Ubicació: secció final: «com modela els vostres valors predeterminats naturals de lideratge».
- Anglès: "how it shapes your natural leadership defaults".
- Català actual: «els vostres valors predeterminats naturals de lideratge».
- Categoria: FIDELITAT/CALC · Gravetat: MITJANA.
- Proposta: «com configura les vostres tendències/inclinacions naturals de lideratge» (o «els vostres comportaments de lideratge per defecte»).
- Justificació: *defaults* ací = «tendències per defecte / inclinacions naturals», no «valors predeterminats» (que és el sentit informàtic de *default values*, calc). El text mateix afegeix «naturals», cosa que xoca amb «predeterminats» (gairebé antònims). A més, «modela» per *shapes* és el mateix calc que a l'art. de negociació (vegeu 4.6): millor «configura/determina».

### 7.4 «un error no forçat»
- Ubicació: secció «Liderar vs. Fer de líder»: «seleccionar per Presència sense ponderar la Disciplina i la Visió és un error no forçat».
- Anglès: "is an unforced error".
- Català actual: «un error no forçat».
- Categoria: CALC · Gravetat: BAIXA.
- Proposta: «és un error evitable» / «és un error innecessari» (o mantenir «no forçat» si es vol l'al·lusió esportiva, però explicitant-la).
- Justificació: *unforced error* és un calc del tennis; en català «error no forçat» s'entén però sona a manlleu poc idiomàtic fora del context esportiu. En registre divulgatiu, «error evitable/innecessari» comunica millor. Gravetat baixa (intel·ligible).

### 7.5 «(No el que esperaries)» — títol en "tu"
- Ubicació: títol de l'article: «Quins trets de personalitat tenen realment els líders eficaços? (No el que esperaries)».
- Anglès: "(Not what you'd expect)".
- Català actual: «(No el que esperaries)».
- Categoria: REGISTRE · Gravetat: BAIXA.
- Proposta: en model vós, «(No el que esperaríeu)».
- Justificació: «esperaries» és condicional de 2a pers. sing. (tu); el cos de l'article usa vós («Pregunteu», «el vostre perfil», «lidereu»). El títol ha de concordar amb el cos: «esperaríeu». Incoherència tu/vós entre títol i cos.

### Resum quantitatiu — `what-personality-traits-do-effective-leaders-actually-have`
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| TERMINOLOGIA (noms de dimensió) | 1 | – | – |
| REGISTRE/COHERÈNCIA (tractament) | 1 | – | 1 |
| FIDELITAT/CALC | – | 1 | 1 |
| Total incidències | **2** | **1** | **2** |


## "Quan la Conscienciositat es converteix en un problema: la trampa del perfeccionisme" (`conscientiousness-perfectionism-when-discipline-becomes-a-problem`)

### 1.1 «si la persona el fa ell mateix» (secció «Incapacitat per delegar»)
- Anglès: "the work will only be done correctly if the person does it themselves"
- Català actual: «la convicció que el treball només es farà correctament si la persona el fa ell mateix»
- Categoria: ERRADA (concordança) · Gravetat MITJANA
- Proposta: «...si la persona el fa ella mateixa»
- Justificació: l'antecedent «la persona» és femení; el reflexiu reforçat ha de concordar-hi («ella mateixa»). L'anglès usa el genèric *themselves*; el català no pot trencar la concordança gramatical amb el nom femení.

### 1.2 «a mig termini» (secció «Incapacitat per delegar»)
- Anglès: "almost always costly in the medium term"
- Català actual: «gairebé sempre és costós a mig termini»
- Categoria: ERRADA (lèxic/recció) · Gravetat MITJANA
- Proposta: «a mitjà termini» (o «a mitjan termini»)
- Justificació: l'adjectiu és «mitjà -ana» (no *mig*); la locució normativa és «a mitjà termini». «Mig» és quantitatiu/partitiu (la meitat). DNV i DIEC2 recullen «mitjà» com a adjectiu de grau intermedi. A més, el text immediatament abans usa «a curt termini», on també caldria coherència amb «a llarg termini» (usat correctament en altres seccions).

### 1.3 Tractament barrejat tu/vós (callout groc i secció final vs cos)
- Anglès: "When Conscientiousness turns against you" / "Measure the facets behind your perfectionism risk"
- Català actual: callout «Quan la Conscienciositat juga en contra teva», títol «Mesura les facetes que hi ha darrere del teu risc de perfeccionisme amb Cèrcol», «Distingir... estic anticipant un judici?» conviuen amb el cos en vós («la vostra puntuació de Disciplina», «us donen», «si esteu en un rol de gestió», «les persones que treballen amb vosaltres»)
- Categoria: REGISTRE/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar tot l'article a vós: «Quan la Conscienciositat juga en contra vostra», «Mesureu les facetes que hi ha darrere del vostre risc de perfeccionisme amb Cèrcol».
- Justificació: el model de llengua de l'auditoria fixa el tractament de vós per a les crides al lector. El cos ja és majoritàriament en vós (formes «la vostra», «us donen», «esteu», «vosaltres»); el callout i el títol del CTA salten a «tu» («teva», «teu»). Cal un únic tractament.

### 1.4 «Programar la finalització» / «aquest lliurable és complet a les 5pm del dijous» (secció «Com... Reequilibrar»)
- Anglès: "this deliverable is complete at 5pm on Thursday"
- Català actual: «aquest lliurable és complet a les 5pm del dijous»
- Categoria: ERRADA (convenció horària) · Gravetat BAIXA
- Proposta: «aquest lliurable és complet a les 17.00 de dijous» (o «a les 5 de la tarda de dijous»)
- Justificació: «5pm» és convenció anglosaxona; en català s'usa el sistema de 24 hores (17.00 h) o la perífrasi horària. A més, «del dijous» amb article és menys natural que «de dijous» per a un dia concret futur.

### 1.5 «reenmarquen» (secció «Practicar la delegació deliberada»)
- Anglès: "when they reframe it as a skill to develop"
- Català actual: «quan la reenmarquen com una habilitat a desenvolupar»
- Categoria: CALC (castellanisme) · Gravetat MITJANA
- Proposta: «quan la replantegen com una habilitat a desenvolupar» (o «quan la reformulen»)
- Justificació: *reenmarcar* no és forma catalana (calc del cast. *reenmarcar*); el verb *emmarcar* existeix però *reenmarcar* no és normatiu. Per a *reframe* en sentit cognitiu, «replantejar» o «reformular» són les opcions cultes. De fet, l'article 4 d'aquest mateix lot tradueix *reframe* per «reformular».

### 1.6 «el camp etiqueta col·lectivament com a perfeccionisme» (2n paràgraf d'introducció)
- Anglès: "a cluster of maladaptive patterns emerges that the field collectively labels perfectionism"
- Català actual: «un conjunt de patrons desadaptatius que el camp etiqueta col·lectivament com a perfeccionisme»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «que el camp [d'estudi] designa col·lectivament com a perfeccionisme» o «que la disciplina anomena col·lectivament perfeccionisme»
- Justificació: «el camp» en sentit absolut («the field» = la disciplina, l'àrea de recerca) és un calc el·líptic de l'anglès; en català «el camp» sol demanar complement («el camp de la psicologia»). «Etiquetar com a» és tolerable però «designar/anomenar» és més culte.

### Resum quantitatiu Article 1
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (concordança, lèxic, horari) | – | 2 | 1 |
| CALC (reenmarcar, "el camp") | – | 1 | 1 |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **0** | **4** | **2** |

---

## "Quants avaluadors de companys necessiteu per obtenir dades de personalitat fiables?" (`how-many-peer-assessors-do-you-need-reliable-personality-data`)

### 2.1 «la teoria psicometria» / «El principi psicometria» / «la literatura psicometrica» (cos, recurrent)
- Anglès: "psychometric theory" / "The psychometric principle" / "the psychometric literature"
- Català actual: «la teoria psicometria», «El principi psicometria que regeix...», «Basant-nos en la literatura psicometrica»
- Categoria: ERRADA (terme tècnic central) · Gravetat ALTA
- Proposta: «la teoria psicomètrica», «El principi psicomètric», «la literatura psicomètrica»
- Justificació: cal l'adjectiu **psicomètric -a**, no el substantiu *psicometria* en funció adjectiva ni la forma *psicometrica* sense accent. És el terme tècnic nuclear de l'article i l'error és sistemàtic (tres ocurrències). Cf. R1 de 05-blog.md (variant del mateix error).

### 2.2 «la variància» vs «la variança» (cos, incoherència)
- Anglès: "variance"
- Català actual: conviuen «el 12% de la variància» i, al paràgraf següent i posteriors, «el 88% de la variança», «la variança del compost», «la meitat de la variança del compost»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar a **variància** (forma del DIEC2/DNV per al concepte estadístic) a tot l'article.
- Justificació: el terme estadístic normalitzat és «variància». «Variança» (de «variar») existeix com a mot però no és la forma terminològica establerta en estadística; barrejar-les dins del mateix text és incoherent. TERMCAT recull «variància» per a *variance*.

### 2.3 «raonaablement» (secció «Què significa realment "fiable"»)
- Anglès: "You can reasonably interpret a composite..."
- Català actual: «Podeu raonaablement interpretar un compost...»
- Categoria: ERRADA (errata) · Gravetat ALTA
- Proposta: «Podeu interpretar raonablement un compost...»
- Justificació: «raonaablement» és una errata tipogràfica evident (doble *a*). A més, l'adverbi en *-ment* va millor posposat al verb que intercalat (calc de l'ordre anglès *reasonably interpret*).

### 2.4 «no per promediar» (secció «Obtenir el màxim de només 2–3...»)
- Anglès: "a signal to explore, not to average away"
- Català actual: «és un senyal per explorar, no per promediar»
- Categoria: CALC (castellanisme) · Gravetat ALTA
- Proposta: «és un senyal per explorar, no per fer-ne la mitjana» (o «no per diluir-lo fent-ne la mitjana»)
- Justificació: **promediar** és un castellanisme cru (cast. *promediar*); no existeix en català. L'acció es diu «fer la mitjana» / «calcular la mitjana». A més, *average away* implica «anul·lar/diluir fent la mitjana», matís que «fer-ne la mitjana» recull millor.

### 2.5 «contextualmente diversos» (secció «Per què la diversitat de relació...»)
- Anglès: "contextually diverse Witness panels"
- Català actual: «el valor dels panels de Testimonis contextualmente diversos»
- Categoria: CALC (castellanisme) · Gravetat ALTA
- Proposta: «el valor dels panells de Testimonis contextualment diversos»
- Justificació: «contextualmente» és la forma castellana; en català l'adverbi és **contextualment** (sufix *-ment*). A més, «panels» → «panells» (català), tot i que «grups»/«conjunts» seria encara més transparent en divulgació.

### 2.6 «diferent nombre de Testimonis» (2n paràgraf d'introducció)
- Anglès: "what different numbers of Witnesses can tell you"
- Català actual: «establir expectatives realistes sobre el que poden dir-vos diferent nombre de Testimonis»
- Categoria: ERRADA (concordança) · Gravetat MITJANA
- Proposta: «...sobre el que us poden dir diferents nombres de Testimonis»
- Justificació: l'anglès és plural (*different numbers*) i el verb català ja és plural («poden dir-vos»), de manera que el subjecte ha de ser plural: «diferents nombres». El singular «diferent nombre» trenca la concordança subjecte-verb. A més, «dir-vos» en posició proclítica natural: «us poden dir».

### 2.7 «La línia vermella discontinua» (peu de la figura SVG)
- Anglès: "The dashed red line marks 3 raters"
- Català actual: «La línia vermella discontinua marca 3 avaluadors»
- Categoria: ERRADA (ortografia/accent) · Gravetat MITJANA
- Proposta: «La línia vermella discontínua marca 3 avaluadors»
- Justificació: l'adjectiu femení és **discontínua** (amb accent diacrític sobre la *í* tònica del hiat); «discontinua» sense accent és la 3a persona del present del verb *discontinuar*, sentit que ací no escau. Falta d'accentuació.

### 2.8 «a nivell de tendències majors» / «a nivell individual» (taula i cos, recurrent)
- Anglès: "meaningful at the level of major tendencies" / "individual-level"
- Català actual: «significatiu a nivell de tendències majors», «l'avaluació a nivell individual», «interpretació confident a nivell individual»
- Categoria: REGISTRE · Gravetat BAIXA
- Proposta: «significatiu en l'àmbit de les tendències principals», «l'avaluació a escala individual», «interpretació... en l'àmbit individual»
- Justificació: «a nivell de» és desaconsellat per les guies d'estil (Softcatalà, IEC) quan no expressa alçària física; es recomana «a escala de» / «en l'àmbit de». Recurrent (cf. R i incidència 2.7 de 05-blog.md). A més, «tendències majors» és calc de *major tendencies*; millor «tendències principals».

### 2.9 «interpretació confident» (secció recomanacions i cos)
- Anglès: "too noisy for confident interpretation" / "confident individual-level interpretation"
- Català actual: «massa sorollosos per a una interpretació confident», «massa baixa per a una interpretació confident a nivell individual»
- Categoria: FALS AMIC (anglicisme semàntic) · Gravetat MITJANA
- Proposta: «massa sorollosos per a una interpretació fiable/sòlida», «...per a una interpretació segura»
- Justificació: *confident* aplicat a una interpretació («confident interpretation») significa «fiable, segura, en què es pot confiar». «Confident» en català és un fals amic: significa «que confia» o el substantiu «persona de confiança», no «que inspira confiança». El sentit pretès és «fiable / segura / sòlida».

### 2.10 «la persona objectiu» (cos, recurrent)
- Anglès: "the target's personality" / "the target person"
- Català actual: «la personalitat de la persona objectiu», «alguna cosa real sobre la persona objectiu»
- Categoria: correcte · Gravetat —
- Justificació: sense incidència. «Persona objectiu» (en aposició) és una solució acceptable per a *target person* en context tècnic; «objectiu» funciona com a aposició invariable. Es registra per descartar el fals positiu (no cal «persona-diana» ni «persona avaluada» obligatòriament, tot i que aquesta darrera seria més transparent).

### Resum quantitatiu Article 2
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (psicomètric, errata, concordança, accent) | 2 | 2 | – |
| CALC/CASTELLANISME (promediar, contextualment) | 2 | – | – |
| TERMINOLOGIA/FALS AMIC (variància, confident) | – | 2 | – |
| REGISTRE ("a nivell de") | – | – | 1 |
| Total incidències | **4** | **4** | **1** |

---

## "Neurodiversitat i proves de personalitat: el que cal saber" (`neurodiversity-and-personality-tests-what-to-know`)

### 3.1 «inattenció» (secció «Com el TDAH afecta...»)
- Anglès: "persistent patterns of inattention"
- Català actual: «patrons persistents d'inattenció, hiperactivitat i impulsivitat»
- Categoria: ERRADA (ortografia/calc) · Gravetat ALTA
- Proposta: «patrons persistents d'inatenció, hiperactivitat i impulsivitat»
- Justificació: la forma catalana és **inatenció** (una sola *t*), del prefix *in-* + *atenció*. «Inattenció» amb doble *t* és un calc de l'anglès *inattention* / del francès. DIEC2 i DNV recullen «inatenció».

### 3.2 «Vincle» vs «Amabilitat» com a nom de la dimensió Bond (recurrent inter- i intra-article)
- Anglès: "the Agreeableness (Bond) dimension"
- Català actual: «la dimensió d'Amabilitat (Vincle)», «menys en Amabilitat»; a la taula «Amabilitat (Vincle)»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: fixar una sola etiqueta catalana per a la dimensió Cèrcol *Bond*. Aquest article usa «Vincle»; els articles 4, 6 i 7 d'aquest lot usen «Vincle» també, però l'article 7 introdueix a més «Agradabilitat» per a *Agreeableness*. Cal unificar «Amabilitat»=Agreeableness (terme acadèmic) i «Vincle»=nom Cèrcol a tota la col·lecció.
- Justificació: coherència terminològica de marca. No és error de gramàtica sinó de consistència; el lector ha de retrobar sempre la mateixa parella acadèmic/Cèrcol. Cf. R en 05-blog.md sobre «de parells» vs «entre iguals».

### 3.3 «sondeigen intuïcions socials» / «sondeigen la intuïció social» (cos i taula)
- Anglès: "the items frequently probe social intuitions" / "Instrument items probe social intuition"
- Català actual: «els elements sovint sondeigen intuïcions socials», «Els elements de l'instrument sondeigen la intuïció social»
- Categoria: ERRADA (morfologia verbal) · Gravetat MITJANA
- Proposta: «els elements sovint sondegen intuïcions socials» (3a pers. pl. de *sondejar*) o, millor, «exploren / examinen intuïcions socials»
- Justificació: el verb català és **sondejar** (cf. *sondeig*); la 3a persona del plural és «sondegen», no «sondeigen» (forma que sembla un creuament amb el substantiu *sondeig*). Per a *probe* en sentit figurat, «explorar / examinar / indagar en» són encara més idiomàtics.

### 3.4 «les senyals socials» (secció autisme)
- Anglès: "the processing of social cues"
- Català actual: «en el processament de les senyals socials»
- Categoria: ERRADA (gènere) · Gravetat MITJANA
- Proposta: «en el processament dels senyals socials»
- Justificació: **senyal** és masculí en català (un senyal, els senyals) segons DIEC2/DNV; «les senyals» n'és un error de gènere (probable interferència del castellà *la señal*). Nota: dues línies abans el text ja escriu correctament «senyals emocionals socials» sense article, però ací el femení és inequívocament erroni.

### 3.5 «pot afectar com responen a ell» (secció dislèxia)
- Anglès: "may affect how they respond to it"
- Català actual: «la càrrega cognitiva de *llegir* el qüestionari pot afectar com responen a ell»
- Categoria: CALC (pronom de represa) · Gravetat MITJANA
- Proposta: «...pot afectar com hi responen» (o «com el responen»)
- Justificació: en català el complement preposicional «a + cosa inanimada» (el qüestionari) es reprèn amb el pronom feble **hi**, no amb «a ell» (calc de l'anglès *to it* / del castellà *a él*). «Respondre a una cosa» → «hi respondre».

### 3.6 «els efectes poden composar-se» (taula, fila «Combinada / coocurrent»)
- Anglès: "effects may compound or partially cancel"
- Català actual: «els efectes poden composar-se o cancel·lar-se parcialment»
- Categoria: ERRADA (lèxic) · Gravetat MITJANA
- Proposta: «els efectes poden sumar-se / acumular-se o cancel·lar-se parcialment»
- Justificació: *compound* (acumular-se, reforçar-se) no és «composar-se». A més, «composar» en català significa «posar pau, conciliar» (i col·loquialment cantar cançons), no «compondre»; la forma de «compondre» seria «compondre's», no «composar-se». Però el sentit de l'anglès és «acumular-se / reforçar-se mútuament»: cal «sumar-se» o «acumular-se». Doble problema: lèxic erroni + tria semàntica.

### 3.7 Tractament barrejat tu/vós (descripció, callout i principis pràctics vs cos)
- Anglès: "here is how to interpret them fairly" (desc.) / "Contextualise, don't just score" / "Always interpret scores with context"
- Català actual: descripció «aquí tens com interpretar-les»; cos «Aquí tens la resposta llarga»; callout «Sempre interpreta les puntuacions amb context»; principis «Contextualitza, no et limitis a puntuar», «Convidar el relat de la pròpia persona... aquí tens el per què» conviuen amb el cos majoritàriament impersonal/formal
- Categoria: REGISTRE/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar a vós: «aquí teniu com interpretar-les», «Sempre interpreteu les puntuacions amb context», «Contextualitzeu, no us limiteu a puntuar», «aquí teniu el perquè».
- Justificació: el model de llengua de l'auditoria fixa el vós per a les crides al lector. L'article fa servir «tu» en imperatius i en «aquí tens». Cal coherència. (Nota addicional: «el per què» substantivat s'escriu junt, «el perquè».)

### 3.8 «navegar de manera diferent» (secció autisme)
- Anglès: "social intuitions that autistic people may navigate differently"
- Català actual: «intuïcions socials que les persones autistes poden navegar de manera diferent»
- Categoria: CALC (recció/sentit) · Gravetat BAIXA
- Proposta: «intuïcions socials que les persones autistes poden gestionar/afrontar de manera diferent» (o «per les quals... es poden moure de manera diferent»)
- Justificació: *navigate* en sentit figurat («navigate social intuitions») és un anglicisme quan es calca com «navegar una cosa»; en català «navegar» és intransitiu (es navega *per* un lloc). Per al sentit metafòric anglosaxó, «gestionar / afrontar / desenvolupar-se en» són les solucions catalanes.

### 3.9 «a nivell mundial» (secció TDAH)
- Anglès: "5–7% of children and 2–5% of adults globally"
- Català actual: «el 5–7% dels nens i el 2–5% dels adults a nivell mundial»
- Categoria: REGISTRE · Gravetat BAIXA
- Proposta: «a escala mundial» (o «arreu del món», «mundialment»)
- Justificació: «a nivell de» / «a nivell mundial» desaconsellat per les guies d'estil quan no és alçària física; «a escala mundial» o «arreu del món» són les opcions recomanades.

### 3.10 «com a generadors d'hipòtesi» (taula) / «punt de partida per a la conversa»
- Anglès: "hypothesis-generating, not conclusive"
- Català actual: «Tractar els resultats com a generadors d'hipòtesi, no com a conclusions»
- Categoria: correcte · Gravetat —
- Justificació: sense incidència; «generador d'hipòtesi» és una solució precisa i el contrast amb «conclusions» és fidel. Es registra per descartar fals positiu (no cal «generador d'hipòtesis» en plural obligatòriament, tot i que el plural seria igualment vàlid).

### Resum quantitatiu Article 3
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (inatenció, gènere, morfologia, lèxic) | 1 | 3 | – |
| CALC (responen a ell, navegar) | – | 1 | 1 |
| TERMINOLOGIA/COHERÈNCIA (Vincle/Amabilitat) | – | 1 | – |
| REGISTRE (tractament, "a nivell de") | – | 1 | 1 |
| Total incidències | **1** | **6** | **2** |

---

## "Personalitat i procrastinació: el que diu la recerca sobre qui ajorna — i per què" (`personality-and-procrastination-what-research-says`)

### 4.1 Noms de dimensió Cèrcol sense traduir: «Depth», «Vision», «Bond» (cos, descripció i taula, recurrent)
- Anglès: "Neuroticism — Depth" / "High-Vision (Openness)" / "High-Bond (Agreeableness)"
- Català actual: «El Neuroticisme — Depth», «Els individus amb Depth elevat», «Els individus d'alta Vision (Obertura)», «Els individus d'alt Bond (Amabilitat)»; descripció «La Disciplina baixa i el Depth elevat»; taula «Neuroticisme (Depth)», «Obertura (Vision)», «Amabilitat (Bond)»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat ALTA
- Proposta: traduir els noms de dimensió Cèrcol al català: **Profunditat** (Depth), **Visió** (Vision), **Vincle** (Bond), tal com fan els articles 1, 5, 6 i 7 d'aquest lot («Profunditat», «Visió», «Vincle»).
- Justificació: els noms de les dimensions Cèrcol tenen forma catalana fixada i s'usen traduïts a la resta de la col·lecció (l'article 1 escriu «Neuroticisme (Profunditat)», «Visió»; l'article 6 «baixa Profunditat (Neuroticisme)»). Deixar «Depth/Vision/Bond» en anglès dins del text català és una incoherència sistemàtica i una pèrdua de fidelitat respecte de la marca. Afecta títol-descripció («el Depth elevat») i tot el cos. Gravetat ALTA per la sistematicitat i per ser vocabulari nuclear de producte.

### 4.2 «les troben avorrida» (secció «Com l'aversió a les tasques...»)
- Anglès: "they find them dull to a degree..."
- Català actual: «experimenten una alta aversió a les tasques rutinàries i repetitives — les troben avorrida fins a un grau que...»
- Categoria: ERRADA (concordança) · Gravetat ALTA
- Proposta: «les troben avorrides fins a un grau que...»
- Justificació: el pronom «les» reprèn «les tasques» (femení plural); l'atribut predicatiu ha de concordar: «avorrides». «Avorrida» (singular) és un error de concordança evident.

### 4.3 «que reduïxen la relació ansiosa» (secció «Estratègies adaptades...»)
- Anglès: "approaches that reduce the anxious relationship with the task"
- Català actual: «enfocaments basats en l'acceptació que reduïxen la relació ansiosa amb la tasca»
- Categoria: ERRADA (morfologia verbal) · Gravetat ALTA
- Proposta: «...que redueixen la relació ansiosa amb la tasca»
- Justificació: la 3a persona del plural de *reduir* és **redueixen** (model incoatiu *-eix-*). «Reduïxen» barreja una grafia incoativa valenciana col·loquial amb terminació no normativa; la forma supradialectal acceptada per DNV ∩ DIEC2 és «redueixen». (El text mateix usa «produeixen», «contribueixen» amb *-eix-* en altres punts: incoherència interna a més de l'error.)

### 4.4 «un cicle d'autoforça» (secció «Neuroticisme i procrastinació»)
- Anglès: "This is a self-reinforcing cycle"
- Català actual: «Es tracta d'un cicle d'autoforça, i les intervencions...»
- Categoria: CALC/AMBIGÜITAT · Gravetat MITJANA
- Proposta: «Es tracta d'un cicle que es reforça a si mateix» (o «un cicle autoreforçant»)
- Justificació: «autoforça» no és un mot català establert i no transmet *self-reinforcing* (que es reforça a si mateix); s'entén malament (sembla «auto-força» física). Cal una perífrasi («que es reforça a si mateix») o el calc transparent «autoreforçant», documentat en textos tècnics.

### 4.5 «maladaptatiu» vs «desadaptatiu» (secció perfeccionisme)
- Anglès: "specifically maladaptive perfectionism"
- Català actual: «específicament el perfeccionisme maladaptatiu»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: «el perfeccionisme desadaptatiu» (forma usada a l'article 1 d'aquest lot)
- Justificació: l'article 1 (mateix lot, mateix concepte *maladaptive*) tradueix sistemàticament per «desadaptatiu» («patrons desadaptatius», «expressió desadaptativa»). «Maladaptatiu» és un calc directe i, tot i que circula en textos clínics, trenca la coherència de la col·lecció. Cal unificar a «desadaptatiu».

### 4.6 «la metaanàlisi» vs «meta-anàlisi» (intra-lot)
- Anglès: "meta-analysis"
- Català actual: «la metaanàlisi de Steel (2007)» (sense guionet)
- Categoria: correcte · Gravetat —
- Justificació: sense incidència interna; «metaanàlisi» (aglutinat, prefix *meta-*) és correcta i preferible. Es registra només per assenyalar que l'article 5 d'aquest lot escriu «meta-anàlisi» amb guionet: alerta de coherència inter-article (la forma aglutinada de l'article 4 és la recomanada).

### 4.7 «té causes diferents en persones diferents» (secció CTA)
- Anglès: "has different causes in different people"
- Català actual: «té causes diferents en persones diferents»
- Categoria: correcte · Gravetat —
- Justificació: sense incidència; tradueix amb fidelitat i naturalitat la repetició anglesa *different... different*. Es registra per descartar el fals positiu d'una possible «redundància» (la repetició és intencional i idiomàtica).

### Resum quantitatiu Article 4
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (concordança, morfologia verbal) | 2 | – | – |
| TERMINOLOGIA/COHERÈNCIA (noms dimensió, maladaptatiu) | 1 | 1 | – |
| CALC/AMBIGÜITAT (autoforça) | – | 1 | – |
| Total incidències | **3** | **2** | **0** |

---

## "La ciència de la personalitat i la crisi de replicació: què ha resistit?" (`personality-science-replication-crisis`)

### 5.1 Noms de dimensió/factor en anglès no traduïts: «Conscientiousness», «Neuroticism», «Openness», «Extraversion», «Agreeableness» (cos, taula, estadístiques, recurrent)
- Anglès: "Conscientiousness and job performance" / "Neuroticism and wellbeing" / "Openness and creativity"...
- Català actual: «la relació entre Conscientiousness i rendiment laboral», «Neuroticism i benestar», «Openness i creativitat», «Extraversion i afecte positiu», «que l'Agreeableness importa més»; títol de blocs i taula igualment en anglès
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat ALTA
- Proposta: traduir els factors al català: **Conscienciositat, Neuroticisme, Obertura, Extraversió, Amabilitat** (amb el nom Cèrcol entre parèntesis on calgui, com fa la pròpia secció amb «Disciplina», «Profunditat», «Presència», «Visió»).
- Justificació: tot i que el blog permet noms acadèmics, aquests existeixen en català (Conscienciositat, Neuroticisme...) i la mateixa secció ja els tradueix parcialment («Disciplina en el marc de Cèrcol», «Profunditat en la terminologia de Cèrcol», «(Presència)», «(Visió)»). Deixar el factor en anglès («Conscientiousness», «Neuroticism») mentre es tradueix el nom Cèrcol al costat és una incoherència flagrant i sistemàtica (desenes d'ocurrències al cos i a la taula). L'article 1 d'aquest lot escriu «Conscienciositat» sense problema. Gravetat ALTA per sistematicitat i per afectar el vocabulari nuclear.

### 5.2 «aplicats en pràctica» / «la ciència de la personalitat replicada en pràctica» (cos i CTA)
- Anglès: "applied in practice" / "what replicated personality science looks like in practice"
- Català actual: «ensenyats en cursos de grau i aplicats en pràctica», «com és la ciència de la personalitat replicada en pràctica»
- Categoria: CALC (locució) · Gravetat MITJANA
- Proposta: «aplicats a la pràctica», «com és... a la pràctica»
- Justificació: la locució catalana és **a la pràctica** (amb article), no *en pràctica* (calc de l'anglès *in practice* / it. *in pratica*). Recurrent (dues ocurrències).

### 5.3 «prediccions de grana fina» (secció «El que els equips haurien de confiar»)
- Anglès: "broad trait tendencies, not fine-grained predictions"
- Català actual: «al nivell de tendències de trets amplis, no prediccions de grana fina»
- Categoria: ERRADA (lèxic/errata) · Gravetat ALTA
- Proposta: «...no prediccions de gra fi» (o «de detall fi», «de precisió fina»)
- Justificació: *fine-grained* es calca aquí com «de grana fina», però «grana» en català és la llavor o el color escarlata, no el «gra» (de *grain*). La metàfora de granularitat usa «gra» (masculí): «de gra fi». «Grana fina» és un error lèxic que canvia el referent.

### 5.4 «al escrutini meta-analític» (secció «Els resultats... robustos»)
- Anglès: "survived... meta-analytic scrutiny"
- Català actual: «han sobreviscut a la replicació repetida i al escrutini meta-analític»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «...i a l'escrutini meta-analític»
- Justificació: davant de mot masculí començat per vocal tònica/àtona, l'article «el» s'apostrofa: «l'escrutini». «al escrutini» (= a + el sense apostrofar) és un error d'apostrofació; la contracció correcta seria «a l'escrutini».

### 5.5 «El que els equips haurien de confiar» (títol de secció)
- Anglès: "What Teams Should Trust — and What to Treat with Caution"
- Català actual: «El que els equips haurien de confiar — i el que tractar amb precaució»
- Categoria: ERRADA (recció verbal) · Gravetat MITJANA
- Proposta: «En el que els equips haurien de confiar — i el que cal tractar amb precaució» (o «De què s'han de refiar els equips...»)
- Justificació: *confiar* regeix la preposició «en» (confiar EN una cosa); «el que els equips haurien de confiar» omet la preposició i deixa el verb sense recció («confiar» no és transitiu directe). Cal «En el que... haurien de confiar». A més, «el que tractar» (infinitiu sense «cal/s'ha de») és el·líptic i calca l'anglès *what to treat*; millor «el que cal tractar».

### 5.6 «Posa a prova la ciència tu mateix» (títol CTA) i tractament del cos
- Anglès: "Test the science yourself with Cèrcol" / "you can predict..."
- Català actual: títol «Posa a prova la ciència tu mateix amb Cèrcol»; cos en vós («us dóna base per esperar», «No us dóna base», «Si voleu veure», «us dóna perspectives»)
- Categoria: REGISTRE/COHERÈNCIA · Gravetat MITJANA
- Proposta: «Poseu a prova la ciència vosaltres mateixos amb Cèrcol» (mantenir vós, coherent amb el cos)
- Justificació: el cos de l'article ja tracta de vós; només el títol del CTA salta a «tu» («Posa», «tu mateix»). Cal unificar a vós segons el model de llengua de l'auditoria.

### 5.7 «Aquell és l'estàndard que Cèrcol s'exigeix a si mateix» (CTA)
- Anglès: "That is the standard Cèrcol holds itself to"
- Català actual: «Aquell és l'estàndard que Cèrcol s'exigeix a si mateix»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «Aquest és l'estàndard que Cèrcol s'exigeix a si mateix» (o «És aquest l'estàndard...»)
- Justificació: el demostratiu de represa anafòrica immediata en català és «aquest» (proximitat discursiva), no «aquell» (llunyania). «Aquell és l'estàndard» calca el *That is* anglès amb el demostratiu de distància; el referent acaba d'enunciar-se, per tant «aquest». Cf. la incidència «That is the point» del glossari (mateix mecanisme).

### Resum quantitatiu Article 5
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (lèxic, apostrofació, recció) | 1 | 2 | – |
| CALC ("en pràctica", "aquell") | – | 1 | 1 |
| TERMINOLOGIA/COHERÈNCIA (factors en anglès) | 1 | – | – |
| REGISTRE (tractament) | – | 1 | – |
| Total incidències | **2** | **4** | **1** |

---

## "La tríada fosca en el treball: narcisisme, maquiavelisme i psicopatia" (`the-dark-triad-at-work-narcissism-machiavellianism-psychopathy`)

### 6.1 «veu» com a imperatiu de remissió (cos, recurrent: ×6)
- Anglès: "see [what personality traits...]" / "see [personality and risk-taking...]"
- Català actual: «veu [quins trets de personalitat tenen realment els líders efectius]», «veu [personalitat i presa de riscos...]», «veu [què significa el Neuroticisme...]», «veu [personalitat i estils de lideratge]», «veu [es pot falsificar un test...]», «veu [personalitat i presa de decisions...]»
- Categoria: ERRADA (morfologia verbal) · Gravetat ALTA
- Proposta: «vegeu [...]» (imperatiu de vós), coherent amb la resta del lot.
- Justificació: «veu» és la 3a persona del present d'indicatiu de *veure* (o el substantiu «veu»), no un imperatiu. L'imperatiu de remissió en vós és **vegeu** (com usen tots els altres articles del lot: «vegeu [...]»). En «tu» seria «vés a veure/mira» o «consulta». «Veu [tal article]» és agramatical com a ordre. Error sistemàtic (sis ocurrències).

### 6.2 «no és necessàriament malalt mental» (secció «Què és la tríada fosca»)
- Anglès: "A person high in dark triad traits is not necessarily mentally ill"
- Català actual: «Una persona amb puntuació alta en els trets de la tríada fosca no és necessàriament malalt mental»
- Categoria: ERRADA (concordança de gènere) · Gravetat ALTA
- Proposta: «...no és necessàriament una malalta mental» (o «no pateix necessàriament cap malaltia mental»)
- Justificació: el subjecte és «Una persona» (femení); l'atribut ha de concordar: «malalta mental». «Malalt mental» trenca la concordança amb el nom femení. La reformulació amb «no pateix cap malaltia mental» evita el problema i és més natural.

### 6.3 «pot tornar-se hostil o retaliador» / «sense tornar-se defensiu o retaliador» (cos i secció indicadors)
- Anglès: "hostile or retaliatory" / "without becoming defensive or retaliatory"
- Català actual: «pot tornar-se hostil o retaliador quan és desafiat», «sense tornar-se defensiu o retaliador»
- Categoria: TERMINOLOGIA (anglicisme) · Gravetat ALTA
- Proposta: «hostil o venjatiu», «defensiu o venjatiu» (alternatives: «vindicatiu», «rancorós»)
- Justificació: **retaliador** no existeix en català (calc de l'anglès *retaliatory*). Les formes catalanes per a la idea de represàlia/revenja són «venjatiu», «vindicatiu» o «rancorós» (Softcatalà, WordReference). Recurrent (dues ocurrències).

### 6.4 «la càlcul estratègic» (secció «Com els trets... es mapegen»)
- Anglès: "more defined by strategic calculation"
- Català actual: «el maquiavelisme es defineix més per la càlcul estratègic»
- Categoria: ERRADA (gènere) · Gravetat ALTA
- Proposta: «...es defineix més pel càlcul estratègic»
- Justificació: **càlcul** és masculí (el càlcul); «la càlcul» n'és un error de gènere. A més, «per la» + masculí → contracció «pel»: «pel càlcul estratègic».

### 6.5 «es mapegen en les dimensions» (títol de secció i cos)
- Anglès: "How Dark Triad Traits Map Onto Big Five Dimensions"
- Català actual: «Com els trets de la tríada fosca es mapegen en les dimensions del Big Five»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «Com es projecten / es corresponen els trets de la tríada fosca amb les dimensions del Big Five» (o «com s'apliquen sobre»)
- Justificació: «mapejar» (de *to map onto*) és un calc tecnològic poc establert per a aquest sentit; en divulgació psicològica «correspondre's amb», «projectar-se sobre» o «relacionar-se amb» són més transparents i cultes. (Acceptable en context informàtic, però ací el referent és conceptual.)

### 6.6 «organizacionalment exitosa» (secció «Què és la tríada fosca»)
- Anglès: "organisationally successful"
- Català actual: «en alguns contextos, organizacionalment exitosa»
- Categoria: ERRADA (ortografia/castellanisme) · Gravetat MITJANA
- Proposta: «organitzativament reeixida» (o «amb èxit en l'organització»)
- Justificació: doble problema. (a) «organizacionalment» amb *z* és grafia castellana; el català usa *-tz-*: «organitzacionalment» (i, millor encara, «organitzativament»). (b) «exitosa» és un castellanisme (cast. *exitoso*); el català prefereix «reeixida» / «amb èxit». DIEC2/DNV no recullen «exitós».

### 6.7 «retenant quan no» (secció maquiavelisme)
- Anglès: "withholding when it does not"
- Català actual: «divulgant informació quan els beneficia, retenant quan no»
- Categoria: ERRADA (morfologia: gerundi) · Gravetat MITJANA
- Proposta: «...retenint quan no»
- Justificació: el gerundi de *retenir* és **retenint** (com *tenint*, *retenint*); «retenant» és una forma inexistent (probable analogia errònia amb la 1a conjugació). Error de flexió verbal.

### 6.8 «no tan sols reactiu» (secció CTA «Veu els factors de risc»)
- Anglès: "how organisations protect themselves structurally, not just reactively"
- Català actual: «és com les organitzacions es protegeixen estructuralment, no tan sols reactiu»
- Categoria: ERRADA (categoria gramatical) · Gravetat MITJANA
- Proposta: «...es protegeixen estructuralment, no tan sols de manera reactiva» (o «...reactivament»)
- Justificació: el paral·lelisme demana un adverbi (com «estructuralment»), però «reactiu» és un adjectiu: «no tan sols reactiu» queda penjat i agramatical. Cal «reactivament» o «de manera reactiva».

### 6.9 «accionable» (secció «Documenta patrons, no episodis»)
- Anglès: "more meaningful and more actionable"
- Català actual: «és més significatiu i més accionable»
- Categoria: CALC (anglicisme) · Gravetat MITJANA
- Proposta: «més significatiu i més aplicable» (o «sobre el qual es pot actuar»)
- Justificació: *actionable* → «accionable» és el calc fixat al glossari de l'auditoria. En català «accionable» = «que es pot accionar (un mecanisme)»; el sentit pretès és «aplicable / que permet actuar».

### 6.10 «composit de la Tríada Fosca» (estadística SVG)
- Anglès: "Dark Triad composite (inverse)"
- Català actual: «Amabilitat → composit de la Tríada Fosca (invers)»
- Categoria: ERRADA (lèxic) · Gravetat MITJANA
- Proposta: «...→ compost de la Tríada Fosca (invers)»
- Justificació: el terme català per a *composite* (puntuació combinada) és **compost** (com fa l'article 2 i 7 del lot: «el compost», «les puntuacions compostes»); «composit» és un calc de l'anglès/castellà sense forma catalana. Incoherent també amb la resta del lot.

### 6.11 Tractament tu en CTA: «Veu els factors de risc del teu equip», «No et refiis» (CTA i orientacions)
- Anglès: "See Your Team's Risk Factors" / "Do not rely on self-report"
- Català actual: «Veu els factors de risc del teu equip — i les seves fortaleses», «No et refiis de l'autoinforme», «Documenta patrons, no episodis», «Explora les eines...»
- Categoria: REGISTRE/COHERÈNCIA · Gravetat MITJANA
- Proposta: unificar a vós: «Vegeu els factors de risc del vostre equip», «No us refieu de l'autoinforme», «Documenteu patrons, no episodis», «Exploreu les eines...».
- Justificació: model de llengua de vós. L'article barreja imperatius en «tu» («Documenta», «No et refiis», «Explora», «Veu... del teu equip») amb un cos que no marca clarament tu. Cal coherència de tractament a tota la col·lecció.

### Resum quantitatiu Article 6
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (vegeu, concordança, gènere, gerundi, ortografia, categoria) | 3 | 4 | – |
| CALC (mapejar, accionable) | – | 2 | – |
| TERMINOLOGIA (retaliador, composit) | 1 | 1 | – |
| REGISTRE (tractament) | – | 1 | – |
| Total incidències | **4** | **8** | **0** |

---

## "Què mesura l'instrument Testimoni de Cèrcol — i com es diferencia de l'autoinforme" (`what-the-cercol-witness-instrument-measures`)

### 7.1 «atrevit vs. considerada» (secció «Com l'avaluació... elimina el biaix»)
- Anglès: "For example: bold vs. considerate."
- Català actual: «Per exemple: *atrevit vs. considerada*.»
- Categoria: ERRADA (coherència de gènere) · Gravetat MITJANA
- Proposta: «*atrevit vs. considerat*» (tots dos masculins) o «*atrevida vs. considerada*» (tots dos femenins)
- Justificació: el parell d'adjectius barreja gènere («atrevit» masc. + «considerada» fem.) sense motiu; com que es presenten com a etiquetes paral·leles d'un mateix parell forçat, han de compartir gènere (preferiblement masculí no marcat: «atrevit vs. considerat»). L'anglès no marca gènere; el català ha de ser coherent.

### 7.2 «Agradabilitat» per a Agreeableness (secció «Com l'avaluació...» i «Gestió de la impressió»)
- Anglès: "especially high-Agreeableness raters" / "socially desirable dimensions (conscientiousness, agreeableness)"
- Català actual: «els valoradors d'alta Agradabilitat», «dimensions socialment desitjables (responsabilitat, agradabilitat)»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: «els valoradors d'alta Amabilitat», «dimensions socialment desitjables (responsabilitat, amabilitat)»
- Justificació: la resta del lot (articles 3, 4, 6) tradueix *Agreeableness* per **Amabilitat**. «Agradabilitat» és una forma divergent que trenca la coherència terminològica de la col·lecció. Cal unificar a «Amabilitat». (A més, «responsabilitat» per *conscientiousness* ací xoca amb «Conscienciositat»/«Disciplina» usat als altres articles — vegeu nota de coherència inter-article.)

### 7.3 «un comunicador calmant» (secció «Punts cecs»)
- Anglès: "a calm, patient communicator"
- Català actual: «que és un comunicador calmant i pacient»
- Categoria: FALS AMIC/ERRADA (lèxic) · Gravetat ALTA
- Proposta: «que és un comunicador calmat (o tranquil) i pacient»
- Justificació: *calm* (adjectiu, «tranquil, assossegat») s'ha traduït per «calmant», que en català és un participi/adjectiu amb sentit actiu («que calma», p. ex. un medicament calmant) o substantiu (un calmant = sedant). El sentit anglès és passiu/estatiu: la persona ÉS «calmada / tranquil·la». Canvi de sentit.

### 7.4 «Neurotisme» (estadística SVG)
- Anglès: "Neuroticism — most under-reported..."
- Català actual: «Neurotisme — més subestimat en l'autoinforme vs. valoracions dels iguals»
- Categoria: ERRADA (errata terminològica) · Gravetat ALTA
- Proposta: «Neuroticisme»
- Justificació: errata: falta la síl·laba «-ci-». La forma correcta és **Neuroticisme** (usada correctament a la resta de l'article: «la Profunditat (Neuroticisme)»). És el terme tècnic d'una dimensió central; l'error és visible en una targeta estadística destacada.

### 7.5 «subordi nat» (secció «Efectes de la relació»)
- Anglès: "(peer, collaborator, direct report, manager)"
- Català actual: «(igual, col·laborador, subordi nat, directiu)»
- Categoria: ERRADA (errata: paraula partida) · Gravetat MITJANA
- Proposta: «(igual, col·laborador, subordinat, directiu)»
- Justificació: «subordi nat» conté un espai espuri enmig del mot «subordinat». Errata tipogràfica evident.

### 7.6 «divergeix més agudament de la autoimatge» / «la autoimatge» (secció «Punts cecs» i «Què afegeix la puntuació»)
- Anglès: "where behaviour diverges most sharply from self-image" / "The person's self-image matches..."
- Català actual: «on el comportament divergeix més agudament de la autoimatge», «La autoimatge de la persona coincideix amb...»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «de l'autoimatge», «L'autoimatge de la persona...»
- Justificació: davant de mot femení començat per vocal àtona (autoimatge), l'article «la» s'apostrofa: «l'autoimatge». «la autoimatge» és un error d'apostrofació recurrent (dues ocurrències). (Nota lèxica menor: «divergeix agudament» és un calc de *sharply*; més natural «divergeix més clarament/marcadament».)

### 7.7 «com d'extravertida és aquesta persona» (secció metodologia)
- Anglès: "how extraverted is this person on a scale of 1–5?"
- Català actual: «com d'extravertida és aquesta persona en una escala d'1 a 5?»
- Categoria: correcte · Gravetat —
- Justificació: sense incidència; «com d'extravertit/extravertida» és una solució interrogativa de grau correcta i natural en català (cf. «com de gran és...»). Es registra per descartar el fals positiu (no és un calc del cast. *cómo de*; la construcció és genuïna). El femení «extravertida» concorda amb «persona».

### 7.8 «pot retardar significativament el canvi de comportament» (secció «Foto instantània vs. patró»)
- Anglès: "reputation can lag behaviour change significantly"
- Català actual: «la reputació pot retardar significativament el canvi de comportament»
- Categoria: FIDELITAT (sentit alterat) · Gravetat MITJANA
- Proposta: «la reputació pot anar significativament endarrerida respecte del canvi de comportament» (o «la reputació pot trigar a reflectir el canvi de comportament»)
- Justificació: *to lag* (anar endarrere, quedar-se enrere respecte d'una altra cosa) s'ha traduït per «retardar» en sentit causatiu transitiu, cosa que inverteix el sentit: «la reputació retarda el canvi de comportament» suggereix que la reputació CAUSA el retard del canvi, quan l'anglès diu que la reputació VA ENDARRERE del canvi (no l'ha assolit encara). Canvi de sentit.

### Resum quantitatiu Article 7
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (Neurotisme, errata, apostrofació, gènere) | 2 | 3 | – |
| FALS AMIC/FIDELITAT (calmant, lag) | 1 | 1 | – |
| TERMINOLOGIA/COHERÈNCIA (Agradabilitat) | – | 1 | – |
| Total incidències | **3** | **5** | **0** |


## "Creativitat i personalitat: el que demostra realment la investigació del Big Five" (`creativity-and-personality-what-big-five-research-shows`)

### 1.1 «confonex» (secció «Com es Defineix i Mesura la Creativitat»)
- Ubicació: 3r bloc, definició d'«assoliment creatiu al món real».
- Anglès: "it conflates talent, opportunity, persistence, and luck."
- Català actual: «perquè confonex talent, oportunitat, persistència i sort.»
- Categoria: ERRADA (ortografia/morfologia) · Gravetat: ALTA
- Proposta: «perquè confon talent, oportunitat, persistència i sort.»
- Justificació: *confonex* no existeix. La 3a persona del present de *confondre* és **confon** (DIEC2/DNV). Sembla una contaminació amb la flexió incoativa (-eix) d'un altre paradigma.

### 1.2 «autoaceptants» (cita de Feist)
- Ubicació: citació destacada de Feist (1998).
- Anglès: "self-confident, self-accepting, driven..."
- Català actual: «més segures de si mateixes, autoaceptants, impulsades...»
- Categoria: ERRADA (ortografia) · Gravetat: ALTA
- Proposta: «que s'accepten a si mateixes» o «autoacceptadores».
- Justificació: *autoaceptants* conté dos errors: manca de doble *cc* (cf. *acceptar*) i un participi de present anòmal. *acceptant* tampoc és adjectiu lexicalitzat en català; cal reformular amb una relativa o amb *autoacceptació*.

### 1.3 «és el que la majoria de persones li importa» (secció «Com es Defineix i Mesura»)
- Ubicació: 3r bloc.
- Anglès: "It is what most people care about when they ask..."
- Català actual: «És el que la majoria de persones li importa quan pregunten...»
- Categoria: ERRADA (sintaxi/recció) · Gravetat: MITJANA
- Proposta: «És el que importa a la majoria de persones quan pregunten...»
- Justificació: el clític *li* (datiu singular) no concorda amb «la majoria de persones» i la construcció és redundant i agramatical (anacolut). *importar a algú* regeix datiu; aquí el complement ja és explícit, de manera que el pronom sobra.

### 1.4 «en Que les Persones Excel·leixen» (títol de secció)
- Ubicació: encapçalament «Com els Perfils del Big Five Formen els Rols Creatius en Que les Persones Excel·leixen».
- Anglès: "...the Creative Roles People Excel In"
- Català actual: «...els Rols Creatius en Que les Persones Excel·leixen»
- Categoria: ERRADA (ortografia) · Gravetat: MITJANA
- Proposta: «...els Rols Creatius en què les Persones Excel·leixen» (relatiu àton amb accent diacrític: **què**).
- Justificació: el relatiu precedit de preposició s'escriu **què** (amb accent), no *Que*. La majúscula inicial respon a la titulació anglesa (title case), però en català el relatiu àton ha de dur l'accent.

### 1.5 «a nivell d'equip» (recurrent)
- Ubicació: «com es manifesta a nivell d'equip» (secció Obertura) i «la implicació estructural» més avall.
- Anglès: "how this plays out at the team level"
- Català actual: «com es manifesta a nivell d'equip»
- Categoria: REGISTRE/CALC · Gravetat: BAIXA
- Proposta: «a escala d'equip» o «en l'àmbit de l'equip».
- Justificació: glossari de l'auditoria; «a nivell de» és desaconsellat per Softcatalà/IEC quan no expressa alçària física. Recurrent al corpus de blog.

### 1.6 Tractament personal incoherent: «vós» vs «tu» (cos vs conclusió)
- Ubicació: el cos i les crides a l'acció usen vós («vegeu», «visiteu», «Mesureu... del vostre Equip», «Exploreu»), però la secció «Conclusions Clau» tanca amb tu: «entén la composició de personalitat del teu equip, i estructura la col·laboració».
- Anglès: "understand the personality composition of your team, and structure collaboration..."
- Català actual: «entén... del teu equip, i estructura la col·laboració»; també «el domini creatiu que examinis» (tu) a la secció Extraversió.
- Categoria: REGISTRE/COHERÈNCIA · Gravetat: MITJANA
- Proposta: unificar a vós: «entengueu... del vostre equip, i estructureu la col·laboració»; «el domini creatiu que examineu».
- Justificació: model de llengua de l'auditoria (tractament de vós per a les crides al lector). El text barreja els dos tractaments dins del mateix article.

### 1.7 «autoaceptants, impulsades, ambicioses... impulsives» — repetició d'arrel (cita de Feist)
- Ubicació: citació de Feist.
- Anglès: "...driven, ambitious, dominant, hostile, and impulsive."
- Català actual: «impulsades, ambicioses, dominants, hostils i impulsives»
- Categoria: REDUNDÀNCIA/FIDELITAT · Gravetat: BAIXA
- Proposta: per a *driven* emprar «motivades»/«empeses per una força interior»; reservar «impulsives» per a *impulsive*.
- Justificació: l'anglès *driven* i *impulsive* són conceptes distints; traduir *driven* per «impulsades» crea una repetició lèxica amb «impulsives» i pot confondre (impuls vs determinació).

### 1.8 «un sabor diferent de creativitat» (secció «Com es Defineix»)
- Ubicació: bloc «Els associats remots».
- Anglès: "captures a different flavour of creativity"
- Català actual: «capta un sabor diferent de creativitat»
- Categoria: CALC · Gravetat: BAIXA
- Proposta: «capta un matís diferent de la creativitat» o «una variant diferent».
- Justificació: *flavour* en sentit figurat es calca amb «sabor»; en català el registre culte demana «matís», «vessant» o «mena». A més, falta l'article: «de la creativitat».

### Resum quantitatiu — Article 1
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (ortografia/sintaxi) | 2 | 2 | – |
| CALC | – | – | 1 |
| REGISTRE/COHERÈNCIA | – | 1 | 1 |
| REDUNDÀNCIA/FIDELITAT | – | – | 1 |
| Total incidències | **2** | **3** | **3** |

---

## "Com la personalitat prediu l'èxit en l'onboarding — i com aprofitar aquest coneixement" (`how-personality-predicts-onboarding-success`)

### 2.1 «comenzar» (entradeta / 2n paràgraf)
- Ubicació: 2n paràgraf, «el període d'ansietat que implica comenzar alguna cosa nova».
- Anglès: "the anxious period of starting something new"
- Català actual: «el període d'ansietat que implica comenzar alguna cosa nova»
- Categoria: ERRADA (castellanisme cru) · Gravetat: ALTA
- Proposta: «que implica començar alguna cosa nova».
- Justificació: *comenzar* és la forma castellana; en català és **començar** (amb ç). Barbarisme ortogràfic flagrant.

### 2.2 «Utilisat correctament... Utilisat incorrectament» (2n paràgraf)
- Ubicació: 2n paràgraf, dues ocurrències consecutives.
- Anglès: "Used well, this knowledge... Used badly, it becomes..."
- Català actual: «Utilisat correctament, aquest coneixement... Utilisat incorrectament, es converteix...»
- Categoria: ERRADA (ortografia) · Gravetat: ALTA
- Proposta: «Utilitzat correctament... Utilitzat incorrectament...» (o, més natural, «Ben utilitzat... Mal utilitzat...»).
- Justificació: el participi de *utilitzar* és **utilitzat**, no *utilisat* (grafia amb -s pròpia del francès/calc). Recurrent també com a verb finit més avall («les ha utilisat correctament», secció d'ús responsable).

### 2.3 «les ha utilisat correctament» (secció «Com usar les dades... de manera responsable»)
- Ubicació: paràgraf inicial de la secció d'ús responsable.
- Anglès: "...has used them well."
- Català actual: «...incorporar un control setmanal de 15 minuts durant el primer mes les ha utilisat correctament.»
- Categoria: ERRADA (ortografia + concordança del clític) · Gravetat: MITJANA
- Proposta: «...les ha utilitzat correctament.»
- Justificació: a banda de *utilisat*→*utilitzat*, «les ha utilitzat» concorda amb «les dades» (correcte); es manté el clític però es corregeix la grafia.

### 2.4 «amb més rapidesa i thoroughness» (secció Responsabilitat)
- Ubicació: 1r punt de la llista de la secció Responsabilitat (Disciplina).
- Anglès: "completing required training faster and more thoroughly"
- Català actual: «completant la formació requerida amb més rapidesa i thoroughness»
- Categoria: ERRADA (mot anglès sense traduir) · Gravetat: ALTA
- Proposta: «amb més rapidesa i minuciositat» (o «...i de manera més exhaustiva»).
- Justificació: *thoroughness* ha quedat sense traduir (oblit del traductor). Cal l'equivalent català «minuciositat»/«exhaustivitat».

### 2.5 «d'una manera accionable des del primer dia» (secció CTA «Ajudeu els nous empleats»)
- Ubicació: 1r paràgraf de la secció final.
- Anglès: "...in ways that are actionable from day one."
- Català actual: «...la claredat del rol d'una manera accionable des del primer dia.»
- Categoria: CALC (anglicisme) · Gravetat: MITJANA
- Proposta: «...d'una manera aplicable des del primer dia» o «...sobre la qual es pot actuar des del primer dia».
- Justificació: glossari de l'auditoria: *accionable* (sentit *actionable*) és un calc; en català «accionable» = «que es pot accionar (un mecanisme)». El sentit pretès és «aplicable».

### 2.6 «a nivell d'equip» (secció d'ús responsable)
- Ubicació: «L'ús més poderós de les dades de personalitat en l'onboarding és a nivell d'equip».
- Anglès: "...is at the team level"
- Català actual: «...és a nivell d'equip»
- Categoria: REGISTRE/CALC · Gravetat: BAIXA
- Proposta: «...és a escala d'equip» / «...en l'àmbit de l'equip».
- Justificació: glossari; «a nivell de» desaconsellat quan no és alçària física. Recurrent.

### 2.7 Tractament personal incoherent (cos en 3a persona/vós vs «el teu mandat»)
- Ubicació: el cos manté impersonal/vós («Aquest article revisa», «vegeu», «emparelleu els nous empleats», «Ajudeu», «la vostra acreditació»), però apareix tu a la secció d'ús responsable: «com els *altres* us experimenten, no només com us descriureu vosaltres mateixos» (vós, OK) conviu amb passatges com «com et veuen» en articles germans. Dins d'aquest article, el conflicte real és menor però convé confirmar la unificació a vós («us experimenten», «us descriureu» són vós, coherents).
- Anglès: "how others experience you, not just how you describe yourself"
- Català actual: «com els altres us experimenten, no només com us descriureu vosaltres mateixos»
- Categoria: correcte · Gravetat: — (es registra com a no-incidència: el tractament de vós és coherent dins de l'article; només cal alinear-lo amb la resta de la col·lecció).

### 2.8 «els primers 90 dies determinen els resultats de retenció» — «retenció» (1r paràgraf)
- Ubicació: 1r paràgraf.
- Anglès: "the first 90 days shape retention outcomes"
- Català actual: «els primers 90 dies determinen els resultats de retenció»
- Categoria: FIDELITAT · Gravetat: BAIXA
- Proposta: «els primers 90 dies condicionen/configuren els resultats de retenció».
- Justificació: *shape* és «configurar/condicionar», no «determinar» (que és més fort, *determine*). Matís de força causal; el mateix verb es tradueix bé com «determinen» en altres punts on l'anglès diu *determine*, però aquí l'original diu *shape*.

### Resum quantitatiu — Article 2
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (castellanisme/ortografia/mot sense traduir) | 3 | 1 | – |
| CALC (accionable, a nivell de) | – | 1 | 1 |
| FIDELITAT | – | – | 1 |
| Total incidències | **3** | **2** | **2** |

---

## "Neuroticisme, estrès i resiliència en el treball: el que diu el Big Five" (`neuroticism-stress-resilience-at-work`)

### 3.1 «el que les persones lleguen malament més sovint» (1r paràgraf)
- Ubicació: 1r paràgraf.
- Anglès: "Neuroticism is the one people most often misread."
- Català actual: «el Neuroticisme és el que les persones lleguen malament més sovint.»
- Categoria: ERRADA (morfologia verbal) · Gravetat: ALTA
- Proposta: «el que les persones llegeixen malament més sovint» (o «interpreten malament»).
- Justificació: la 3a persona del plural del present de *llegir* és **llegeixen** (verb incoatiu), no *lleguen*. *lleguen* correspondria a *llegar* (castellanisme inexistent en aquest sentit). Per a *misread*, «interpreten malament» seria fins i tot més precís.

### 3.2 «quelcom alta en hostilitat enfadada» (secció «Què mesura realment el Neuroticisme»)
- Ubicació: paràgraf sobre l'estructura de facetes.
- Anglès: "...than someone high in angry hostility and low in depression."
- Català actual: «...molt diferent de quelcom alta en hostilitat enfadada i baixa en depressió.»
- Categoria: ERRADA (lèxic/concordança) · Gravetat: ALTA
- Proposta: «...molt diferent de la d'algú alt en hostilitat enfadada i baix en depressió.»
- Justificació: *quelcom* és un pronom neutre indefinit («alguna cosa»), no pot referir-se a una persona (*someone* = «algú»). A més, la concordança femenina («alta», «baixa») no té antecedent. Cal «algú» i, com que es compara amb «una persona», també millora explicitar «la d'algú».

### 3.3 «la autopercepció i les valoracions de parells» (secció «Què necessiten els empleats»)
- Ubicació: paràgraf final de la secció sobre suport, enllaç a self-other agreement.
- Anglès: "...where self-perception and peer ratings diverge most"
- Català actual: «on la autopercepció i les valoracions de parells divergeixen més»
- Categoria: ERRADA (apostrofació) · Gravetat: MITJANA
- Proposta: «on l'autopercepció i les valoracions dels parells divergeixen més».
- Justificació: davant de mot començat per vocal, l'article *la* s'apostrofa: **l'autopercepció**. A més, «valoracions de parells» demana l'article: «dels parells» (coherència amb la resta del corpus).

### 3.4 «A nivell de tret» / «A nivell neurobiològic» / «a nivell de faceta» (recurrent)
- Ubicació: secció «Què mesura realment el Neuroticisme» (×3: «A nivell de tret», «A nivell neurobiològic», «dades a nivell de faceta»; també «La imatge a nivell de faceta» a la secció de la taula).
- Anglès: "At the trait level" / "At the neurobiological level" / "facet-level data"
- Català actual: «A nivell de tret», «A nivell neurobiològic», «dades a nivell de faceta»
- Categoria: REGISTRE/CALC · Gravetat: MITJANA
- Proposta: «En l'àmbit del tret» / «Des del punt de vista neurobiològic» / «dades de l'àmbit de les facetes» (o «dades per facetes»).
- Justificació: glossari; ús molt repetit de «a nivell de» (quatre ocurrències llargues en aquest article), desaconsellat fora del sentit d'alçària física. Gravetat MITJANA per la reiteració.

### 3.5 «té una experiència dia a dia molt diferent» (secció «Què mesura realment el Neuroticisme»)
- Ubicació: paràgraf sobre l'estructura de facetes.
- Anglès: "has a very different day-to-day experience"
- Català actual: «té una experiència dia a dia molt diferent»
- Categoria: CALC · Gravetat: BAIXA
- Proposta: «té una experiència quotidiana molt diferent» / «del dia a dia».
- Justificació: *day-to-day* com a adjectiu anteposat es calca amb «dia a dia» postposat de manera poc idiomàtica; «quotidiana» o «del dia a dia» (amb article) són més naturals.

### 3.6 «les dades de Testimoni sobre les facetes de Profunditat és sovint on resideix» (secció CTA)
- Ubicació: 2n paràgraf de la secció «Troba la teva puntuació de Profunditat».
- Anglès: "the Witness data on Depth facets is often where the most practically useful development insight lives."
- Català actual: «les dades de Testimoni sobre les facetes de Profunditat és sovint on resideix la perspectiva de desenvolupament més pràcticament útil.»
- Categoria: ERRADA (concordança subjecte-verb) · Gravetat: MITJANA
- Proposta: «les dades de Testimoni sobre les facetes de Profunditat són sovint on resideix...».
- Justificació: el subjecte és plural («les dades»); el verb ha de ser **són**, no *és*. L'anglès té *data is* (singular gramatical), però en català «dades» és plural i exigeix concordança plural.

### 3.7 Tractament personal incoherent: «vós» vs «tu» (cos vs CTA)
- Ubicació: el cos usa impersonal/vós («vegeu», «La taula següent ho resumeix»), però la secció CTA passa a tu: «Troba la teva puntuació», «mesura la teva Profunditat», «com t'experimentes a tu mateix i com et veuen els col·legues», «Entendre el teu perfil complet».
- Anglès: "Find your Depth score... how you experience yourself and how colleagues see you..."
- Català actual: «Troba la teva puntuació de Profunditat... com t'experimentes a tu mateix i com et veuen els col·legues»
- Categoria: REGISTRE/COHERÈNCIA · Gravetat: MITJANA
- Proposta: unificar a vós: «Trobeu la vostra puntuació... com us experimenteu... com us veuen els col·legues... Entendre el vostre perfil».
- Justificació: model de llengua de l'auditoria. Salt de tractament entre cos i crida a l'acció.

### 3.8 «pràcticament útil» (secció CTA)
- Ubicació: «la perspectiva de desenvolupament més pràcticament útil».
- Anglès: "the most practically useful development insight"
- Català actual: «la perspectiva de desenvolupament més pràcticament útil»
- Categoria: REGISTRE/CALC · Gravetat: BAIXA
- Proposta: «la perspectiva de desenvolupament més útil a la pràctica» / «d'utilitat pràctica».
- Justificació: l'adverbi en *-ment* modificant un adjectiu («pràcticament útil») calca l'anglès *practically useful* i resulta feixuc; «útil a la pràctica» és més natural.

### Resum quantitatiu — Article 3
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (morfologia, lèxic, apostrofació, concordança) | 2 | 2 | – |
| CALC | – | 1 | 2 |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **2** | **4** | **2** |

---

## "Personalitat i treball en remot: qui floreix, qui pateix i per què" (`personality-and-remote-work-who-thrives-who-struggles`)

### 4.1 «tienen un alt impacte» (secció Profunditat)
- Ubicació: «Implicació pràctica» de la secció Profunditat (Neuroticisme).
- Anglès: "they are high-impact specifically for high-Neuroticism individuals."
- Català actual: «però tienen un alt impacte específicament per a les persones amb alt Neuroticisme.»
- Categoria: ERRADA (castellanisme cru) · Gravetat: ALTA
- Proposta: «però tenen un alt impacte específicament per a les persones amb alt Neuroticisme.»
- Justificació: *tienen* és la forma castellana; en català és **tenen**. Barbarisme flagrant.

### 4.2 «anirà mal en un entorn totalment remot» (secció «Implicacions pràctiques»)
- Ubicació: bloc «Per a la contractació i la composició de l'equip».
- Anglès: "is going to struggle in a fully remote environment"
- Català actual: «Un equip de cinc membres amb Alta Presència i Baixa Disciplina anirà mal en un entorn totalment remot»
- Categoria: CALC/REGISTRE · Gravetat: MITJANA
- Proposta: «tindrà dificultats en un entorn totalment remot» / «se'n ressentirà».
- Justificació: *struggle* es tradueix sistemàticament a la resta de l'article per «tindre dificultats»; «anar mal» és col·loquial i menys precís, i trenca la coherència terminològica interna (cf. «tindran dificultats» a la secció Disciplina).

### 4.3 «utiliseu dades Big Five» / «utiliseu-ho» (secció «Implicacions pràctiques» i CTA)
- Ubicació: «utiliseu dades Big Five per anticipar...» (bloc contractació) i «utiliseu-ho per dissenyar» (CTA).
- Anglès: "use Big Five data to anticipate..." / "use that to design..."
- Català actual: «utiliseu dades Big Five», «utiliseu-ho per dissenyar»
- Categoria: ERRADA (ortografia/morfologia) · Gravetat: MITJANA
- Proposta: «utilitzeu dades del Big Five», «utilitzeu-ho per dissenyar».
- Justificació: l'imperatiu de vós de *utilitzar* és **utilitzeu**, no *utiliseu* (grafia amb -s). A més, «dades Big Five» demana article/preposició: «dades del Big Five». Recurrent (dues ocurrències).

### 4.4 «es carreguen d'energia gràcies a la interacció social» — coherència «es carreguen d'energia» vs «s'energitzen» (secció Presència)
- Ubicació: paràgraf inicial de la secció Presència; comparar amb article 1, on es diu «s'energitzen».
- Anglès: "draw energy from social interaction"
- Català actual: «es carreguen d'energia gràcies a la interacció social»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat: BAIXA
- Proposta: acceptable; «es carreguen d'energia» és bon català (millor que el calc «s'energitzen» de l'article 1). Es registra com a contrast positiu: aquí la tria és més idiomàtica.
- Justificació: nota de coherència inter-article; *draw energy* → «es carreguen d'energia» / «obtenen energia» és preferible a «s'energitzen». Sense incidència interna.

### 4.5 «a nivell d'equip» / «a nivell de grup» (recurrent)
- Ubicació: CTA «agregades en una visió a nivell d'equip»; també el cos parla de fenòmens «a nivell» en passatges puntuals.
- Anglès: "aggregated into a team-level view"
- Català actual: «agregades en una visió a nivell d'equip»
- Categoria: REGISTRE/CALC · Gravetat: BAIXA
- Proposta: «agregades en una visió d'àmbit d'equip» / «a escala d'equip».
- Justificació: glossari; «a nivell de» desaconsellat fora de l'alçària física. Recurrent al corpus.

### 4.6 «aquest perfil s'adapta millor al treball en remot» — títol vs cos (secció Visió)
- Ubicació: títol «Visió (Obertura): Per què aquest perfil s'adapta millor al treball en remot».
- Anglès: "Vision (Openness): Why This Profile Adapts Best to Remote Work"
- Català actual: «Per què aquest perfil s'adapta millor al treball en remot»
- Categoria: correcte · Gravetat: — (es registra per descartar fals positiu: *adapts best* → «s'adapta millor» és correcte; el demostratiu reforçat «aquest» és coherent amb la resta de l'article).

### 4.7 Tractament personal: el CTA usa vós però el quadre «Per a les reunions individuals» manté impersonal — coherència
- Ubicació: l'article usa vós de manera força coherent («tingueu en compte», «dissenyeu», «enquadreu», «us dona», «Veieu»); el títol del CTA, però, fa servir tu: «Mapa els estils del teu equip en remot».
- Anglès: "Map Your Remote Team's Styles with Cèrcol"
- Català actual: «Mapa els estils del teu equip en remot amb Cèrcol»
- Categoria: REGISTRE/COHERÈNCIA · Gravetat: MITJANA
- Proposta: «Mapeu els estils del vostre equip en remot amb Cèrcol» (a més, *map* com a verb → «mapeu»/«traceu», no l'ambigu «Mapa»).
- Justificació: el títol del CTA salta a tu mentre que tot el cos i el paràgraf immediatament següent usen vós («us dona», «Veieu... el vostre equip», «utiliseu-ho»). A més, «Mapa» en imperatiu és ambigu (pot llegir-se com el substantiu «mapa»).

### Resum quantitatiu — Article 4
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (castellanisme/ortografia) | 1 | 1 | – |
| CALC (anar mal, a nivell de) | – | 1 | 1 |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| Total incidències | **1** | **3** | **1** |

---

## "Les proves de personalitat en la selecció: què és legal, què és ètic?" (`personality-testing-in-hiring-what-is-legal-what-is-ethical`)

### 5.1 «les examens mèdics» (secció ADA, títol de bloc en negreta)
- Ubicació: «**L'ADA i les examens mèdics.**»
- Anglès: "The ADA and medical examinations."
- Català actual: «L'ADA i les examens mèdics.»
- Categoria: ERRADA (gènere) · Gravetat: ALTA
- Proposta: «L'ADA i els exàmens mèdics.»
- Justificació: *examen* és masculí en català (**l'examen, els exàmens**). «les examens» és un error de gènere visible en un titular en negreta. (El cos del mateix bloc ja escriu correctament «exàmens mèdics».)

### 5.2 «aprovat o suspenès en personalitat sola» (secció Validesa)
- Ubicació: paràgraf final de la secció de validesa.
- Anglès: "passing or failing candidates on personality alone"
- Català actual: «aprovat o suspenès en personalitat sola»
- Categoria: ERRADA (ortografia) · Gravetat: ALTA
- Proposta: «aprovat o suspès en personalitat sola».
- Justificació: el participi de *suspendre* és **suspès** (fem. *suspesa*), no *suspenès*. La *-è-* paràsita amb -n- és una forma inexistent.

### 5.3 «per qué» (×2: títols/cos de la secció Validesa i Impacte advers)
- Ubicació: «La base d'evidència completa sobre per qué la Conscientiousness...» (secció Validesa) i el títol «Per qué el cas d'ús determina si les proves...».
- Anglès: "why Conscientiousness is..." / "Why the Use Case Determines..."
- Català actual: «per qué», «Per qué»
- Categoria: ERRADA (accentuació) · Gravetat: ALTA
- Proposta: «per què», «Per què».
- Justificació: l'interrogatiu/causal s'escriu **per què** (accent obert sobre la e: *è*), no *per qué* (accent tancat, calc de l'ortografia castellana). Recurrent.

### 5.4 «crea virtualment cap risc legal» (secció «Per qué el cas d'ús»)
- Ubicació: 1r paràgraf de la secció.
- Anglès: "...creates virtually no legal risk when used to support onboarding..."
- Català actual: «...crea virtualment cap risc legal quan s'usa per recolzar l'incorporació...»
- Categoria: ERRADA (negació)/CALC · Gravetat: ALTA
- Proposta: «...no crea pràcticament cap risc legal quan s'usa per donar suport a la incorporació...».
- Justificació: «cap risc» exigeix negació explícita («no crea cap risc»); sense el «no», la frase queda afirmativa i diu el contrari del sentit pretès (canvi de sentit). A més, *virtually* → «pràcticament» (no «virtualment», que en català remet a la realitat virtual), i *support* → «donar suport a» (no «recolzar», calc semàntic).

### 5.5 «entre sí» (secció «Avaluació vs. cribratge»)
- Ubicació: paràgraf final de la secció.
- Anglès: "helping people understand themselves and each other"
- Català actual: «Esteu ajudant les persones a entendre's a si mateixes i entre sí»
- Categoria: ERRADA (ortografia/accent diacrític) · Gravetat: MITJANA
- Proposta: «...a entendre's a si mateixes i entre si».
- Justificació: el pronom tònic reflexiu s'escriu **si** sense accent (*entre si*, *per si mateix*). *sí* amb accent és l'adverbi d'afirmació. Error d'accentuació diacrítica.

### 5.6 «o passis o suspens» — incoherència modal (secció «Avaluació vs. cribratge»)
- Ubicació: «El cribratge és una porta binària: o passis o suspens.»
- Anglès: "Screening is a binary gate: you pass or you fail."
- Català actual: «o passis o suspens»
- Categoria: ERRADA (mode/coherència verbal) · Gravetat: MITJANA
- Proposta: «o passes o suspens» (present d'indicatiu, vós/tu coherent) o, en impersonal, «o s'aprova o se suspèn».
- Justificació: *passis* és present de subjuntiu (2a sing.) mentre que *suspens* és present d'indicatiu (2a sing.): barreja de modes dins de la mateixa coordinació. Cal homogeneïtzar (totes dues en indicatiu: «passes... suspens»).

### 5.7 «inputs» / «input suplementari» (secció Validesa i taula)
- Ubicació: «usar la personalitat com a un dels múltiples inputs» (callout) i «Input suplementari en la selecció» (taula).
- Anglès: "use personality as one of multiple inputs" / "Supplementary input in hiring"
- Català actual: «múltiples inputs», «Input suplementari»
- Categoria: TERMINOLOGIA (anglicisme) · Gravetat: BAIXA
- Proposta: «un dels múltiples elements/factors d'entrada», «Aportació suplementària» / «Dada complementària».
- Justificació: *input* té equivalents catalans transparents («element d'entrada», «factor», «aportació», «dada»); en text divulgatiu el manlleu cru és evitable. Coherència amb el registre culte.

### 5.8 «Cèrcol és dissenyat des de zero» (secció CTA)
- Ubicació: 1r paràgraf de «Usa les dades de personalitat de la manera correcta».
- Anglès: "Cèrcol is designed from the ground up for the defensible use case"
- Català actual: «Cèrcol és dissenyat des de zero per al cas d'ús defensable»
- Categoria: ERRADA (auxiliar de la passiva d'estat) · Gravetat: MITJANA
- Proposta: «Cèrcol està dissenyat des de zero per al cas d'ús defensable» (o «s'ha dissenyat des de l'origen»).
- Justificació: per a un estat resultant es fa servir **estar** + participi («està dissenyat»), no *ser* (que marca passiva d'acció puntual). A més, *from the ground up* → «de bell nou»/«des de l'origen» és més idiomàtic que «des de zero». (Comparar amb «es construeix sobre el marc Big Five», correcte, a la secció anterior.)

### 5.9 «la Llei d'Americans amb Discapacitats» (secció marc legal)
- Ubicació: 1r paràgraf de la secció legal.
- Anglès: "the Americans with Disabilities Act (ADA) of 1990"
- Català actual: «la Llei d'Americans amb Discapacitats (ADA) de 1990»
- Categoria: TERMINOLOGIA/FIDELITAT · Gravetat: BAIXA
- Proposta: «la Llei d'estatunidencs amb discapacitat (ADA) de 1990» o mantenir el nom en anglès amb glossa.
- Justificació: *Americans* aquí designa els ciutadans dels EUA; en català el gentilici precís és «estatunidenc/nord-americà» (americà és ambigu, abasta tot el continent). En noms propis de lleis sovint es deixa l'original; com a mínim, «americans» en minúscula i sense majúscula de calc.

### Resum quantitatiu — Article 5
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (gènere, ortografia, accent, negació, mode, auxiliar) | 4 | 3 | – |
| TERMINOLOGIA (anglicisme, gentilici) | – | – | 2 |
| Total incidències | **4** | **3** | **2** |

---

## "La tensió Visió-Disciplina: innovació vs execució en equips" (`the-vision-discipline-tension-innovation-vs-execution`)

### 6.1 «Trobar constranyidors els procediments rígids» (secció «Com és... un equip d'alta Visió»)
- Ubicació: 4t punt de la llista de la secció alta Visió.
- Anglès: "Find rigid procedures and highly structured processes constraining"
- Català actual: «Trobar constranyidors els procediments rígids i els processos molt estructurats»
- Categoria: ERRADA (lèxic/ortografia) · Gravetat: ALTA
- Proposta: «Trobar constrenyedors / coactius els procediments rígids...» (o reformular: «Sentir-se constrets per procediments rígids...»).
- Justificació: *constranyidor* no és forma catalana. El verb és *constrènyer*; l'adjectiu derivat seria «constrenyedor» (poc usual) o, més clar, reformular amb «que els constrenyen» / «coactius» / «que els limiten». La grafia *constran-* és, a més, un creuament incorrecte.

### 6.2 «desenvolupar enfocaments novedosos» (secció «El dilema exploració-explotació»)
- Ubicació: 1r paràgraf de la secció.
- Anglès: "developing novel approaches"
- Català actual: «qüestionar supòsits, desenvolupar enfocaments novedosos»
- Categoria: ERRADA (castellanisme) · Gravetat: ALTA
- Proposta: «desenvolupar enfocaments nous / innovadors».
- Justificació: *novedós/novedosa/novedosos* és un calc del castellà *novedoso*, incorrecte en català; cal **nou** o **innovador** segons el context (confirmat per l'Optimot). Vegeu [Optimot — «Com es diu *novedoso* en català?»](https://aplicacions.llengua.gencat.cat/llc/AppJava/index.html?action=Principal&method=detall&input_cercar=novedos&database=FITXES_PUB).

### 6.3 «per què no es pot optimitzar tots dos» (títol de secció)
- Ubicació: encapçalament «El dilema exploració-explotació: per què no es pot optimitzar tots dos».
- Anglès: "The Exploration-Exploitation Dilemma: Why You Can't Optimise Both"
- Català actual: «per què no es pot optimitzar tots dos»
- Categoria: ERRADA (concordança/pronom) · Gravetat: MITJANA
- Proposta: «per què no es poden optimitzar tots dos» o «per què no es poden optimitzar alhora».
- Justificació: amb «tots dos» com a subjecte plural de la passiva pronominal, el verb concorda en plural: «no es poden optimitzar». La construcció impersonal singular («no es pot optimitzar tots dos») deixa el complement plural sense lligar.

### 6.4 «els membres d'alta Disciplina que lluitegen contra l'ambigüitat» (penúltim paràgraf)
- Ubicació: paràgraf sobre el desbordament de la tensió cap a l'esgotament.
- Anglès: "high-Discipline members grinding against persistent ambiguity"
- Català actual: «els membres d'alta Disciplina que lluitegen contra l'ambigüitat persistent»
- Categoria: ERRADA (morfologia verbal) · Gravetat: ALTA
- Proposta: «els membres d'alta Disciplina que lluiten contra l'ambigüitat persistent» (o «que pugnen / forcegen contra»).
- Justificació: la 3a persona del plural de *lluitar* és **lluiten**, no *lluitegen* (forma inexistent; sembla una freqüentativa inventada *lluitejar*). Per a *grinding against*, «pugnen contra» / «s'esgoten lluitant contra» recull millor el matís de desgast.

### 6.5 «el conservadorisme dels altres» (penúltim paràgraf)
- Ubicació: «se sent frustrat pel que experimenta com el conservadorisme dels altres».
- Anglès: "frustrated by what they experience as other people's conservatism"
- Català actual: «pel que experimenta com el conservadorisme dels altres»
- Categoria: correcte · Gravetat: — (es registra per descartar fals positiu: «conservadorisme» és el terme català correcte per a *conservatism*; cap incidència).

### 6.6 Tractament personal incoherent: «vós» absent, tot en «tu» a les crides
- Ubicació: el cos és majoritàriament impersonal/3a persona, però el CTA i diversos enllaços usen tu: «Traça el teu equip», «Saber si el teu equip s'inclina...», «Si el teu equip lluita per tancar el bucle... fes una avaluació gratuïta», «si... les perceben els col·legues de la manera que els individus pretenen».
- Anglès: "Map Your Team's Vision-Discipline Balance... if your team is struggling... run a free assessment"
- Català actual: «Traça el teu equip... Si el teu equip lluita... fes una avaluació gratuïta»
- Categoria: REGISTRE/COHERÈNCIA · Gravetat: MITJANA
- Proposta: unificar a vós: «Traceu el vostre equip... Si el vostre equip té dificultats per tancar el bucle... feu una avaluació gratuïta».
- Justificació: model de llengua de l'auditoria (vós per a les crides al lector). Aquest article usa tu de manera sistemàtica al CTA; cal alinear-lo amb la sèrie de vós de la resta del lot.

### 6.7 «pivotatge ràpid» (taula de perfils)
- Ubicació: fila «Alta Visió + Baixa Disciplina», columna Fortaleses.
- Anglès: "rapid pivoting"
- Català actual: «exploració àmplia, pivotatge ràpid»
- Categoria: TERMINOLOGIA (anglicisme/calc) · Gravetat: BAIXA
- Proposta: «reorientació ràpida» / «canvi d'enfocament ràpid».
- Justificació: *pivotatge* (de *pivot*, en sentit empresarial de canviar d'estratègia) és un anglicisme no consolidat en català culte; «reorientació» o «gir estratègic» són transparents i normatius.

### Resum quantitatiu — Article 6
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (lèxic, castellanisme, morfologia, concordança) | 3 | 1 | – |
| REGISTRE/COHERÈNCIA (tractament) | – | 1 | – |
| TERMINOLOGIA (anglicisme) | – | – | 1 |
| Total incidències | **3** | **2** | **1** |

---

## "Per què 120 ítems és millor que 10: el compromís en la llargada dels tests de personalitat" (`why-120-items-is-better-than-10-personality-test-length`)

### 7.1 «crea una abandonament significativament major» (secció «Quan un test... és realment adequat»)
- Ubicació: bloc «La recerca de població a gran escala».
- Anglès: "creates significantly higher dropout than a 2-minute one"
- Català actual: «crea una abandonament significativament major que un de 2 minuts»
- Categoria: ERRADA (gènere) · Gravetat: ALTA
- Proposta: «crea un abandonament significativament major que un de 2 minuts» (o «una taxa d'abandonament... més alta»).
- Justificació: *abandonament* és masculí (**un abandonament**), no femení. Per a *dropout* en context de mostres, «taxa d'abandonament» és encara més precís.

### 7.2 «algú el Conscientiousness del qual» / «una escala d'Obertura» / «una escala de Neuroticisme» — barreja de noms català/anglès (secció «Què perden els tests... de 10 ítems»)
- Ubicació: paràgrafs sobre facetes; també la taula barreja «Cèrcol / IPIP-NEO-120».
- Anglès: "someone whose Conscientiousness is driven by..." (l'anglès usa el nom anglès de manera coherent)
- Català actual: «algú el Conscientiousness del qual és impulsat per l'Ordre i el Deure» conviu amb «Una escala de Responsabilitat de dos ítems», «Una escala d'Obertura», «Una escala de Neuroticisme».
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat: MITJANA
- Proposta: triar una sola sèrie. En blog/ciència es permeten els noms acadèmics, però cal coherència: o bé tots en català (Responsabilitat/Conscienciositat, Obertura, Neuroticisme) o bé tots en anglès. «el Conscientiousness del qual» enmig de text català (amb «Responsabilitat» a la frase anterior) és especialment estrident.
- Justificació: el mateix paràgraf alterna «Responsabilitat» i «Conscientiousness» per al mateix constructe. (Brief: els noms acadèmics són admesos en blog; la incidència és de coherència interna, no d'ús.)

### 7.3 «Per què Cèrcol utilitza 120 ítems...» duplicat (dos encapçalaments gairebé idèntics)
- Ubicació: títol «Per què Cèrcol utilitza 120 ítems per equilibrar fiabilitat i temps de completació» i, poc després, «Per què Cèrcol utilitza 120 ítems en lloc de 10».
- Anglès: "Why Cèrcol Uses 120 Items to Balance Reliability and Completion Time" i «Why Cèrcol uses 120 items instead of 10» (el desdoblament ja existeix a la font).
- Català actual: dos encapçalaments amb redacció gairebé idèntica.
- Categoria: correcte · Gravetat: — (no és error de traducció: el desdoblament prové de la font anglesa; es registra per descartar fals positiu).

### 7.4 «com es veuen realment les dades del Big Five a nivell de facetes» (secció CTA)
- Ubicació: 1r paràgraf de la secció final.
- Anglès: "what facet-level Big Five data actually looks like for your team"
- Català actual: «Si voleu veure com es veuen realment les dades del Big Five a nivell de facetes per al vostre equip»
- Categoria: REDUNDÀNCIA/CALC · Gravetat: MITJANA
- Proposta: «Si voleu veure quin aspecte tenen realment les dades del Big Five per facetes per al vostre equip».
- Justificació: «veure com es veuen» és una repetició cacofònica del verb *veure* (calc de *see what ... looks like*). «quin aspecte tenen» elimina la repetició. A més, «a nivell de facetes» → «per facetes» / «en l'àmbit de les facetes» (glossari).

### 7.5 «a nivell de facetes» / «a nivell de grup» / «a nivell d'equip» (recurrent)
- Ubicació: «mesura a nivell de facetes» i «puntuació a nivell de facetes» (secció desenvolupament individual), «anàlisi a nivell d'equip» (secció perfils d'equip), «estudis a nivell de grup» (taula).
- Anglès: "facet-level measurement", "team-level analysis", "group-level studies"
- Català actual: «a nivell de facetes», «a nivell d'equip», «a nivell de grup»
- Categoria: REGISTRE/CALC · Gravetat: MITJANA
- Proposta: «mesura per facetes / de l'àmbit de les facetes», «anàlisi d'àmbit d'equip / a escala d'equip», «estudis d'àmbit grupal».
- Justificació: glossari; reiteració intensa de «a nivell de» (cinc o més ocurrències). Gravetat MITJANA per la freqüència.

### 7.6 «una abandonament... que un de 2 minuts» — el·lipsi ambigua
- Ubicació: mateix bloc que 7.1.
- Anglès: "than a 2-minute one"
- Català actual: «...major que un de 2 minuts»
- Categoria: AMBIGÜITAT · Gravetat: BAIXA
- Proposta: «...que un temps de completació de 2 minuts» (explicitar l'antecedent).
- Justificació: «un de 2 minuts» depèn de l'antecedent «temps de completació», però la el·lipsi queda penjada entre «abandonament» i «temps»; convé explicitar per claredat.

### 7.7 «Els ítems s'extreuen del banc d'ítems IPIP de domini obert» (secció CTA)
- Ubicació: 2n paràgraf de «Per què Cèrcol utilitza 120 ítems en lloc de 10».
- Anglès: "drawn from the open-domain IPIP item bank"
- Català actual: «Els ítems s'extreuen del banc d'ítems IPIP de domini obert»
- Categoria: TERMINOLOGIA/FIDELITAT · Gravetat: BAIXA
- Proposta: «de domini públic» (no «de domini obert»).
- Justificació: *open-domain* es refereix a l'estatus de **domini públic** (l'IPIP es descriu sempre com a «public domain»); «de domini obert» és una traducció literal poc precisa. (Cf. la resta del corpus, que parla de «domini públic».)

### Resum quantitatiu — Article 7
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (gènere) | 1 | – | – |
| TERMINOLOGIA/COHERÈNCIA | – | 1 | 1 |
| REDUNDÀNCIA/CALC (a nivell de, veure/veure) | – | 2 | – |
| AMBIGÜITAT | – | – | 1 |
| Total incidències | **1** | **3** | **2** |

---


## "Crítiques al Big Five: el que diuen els crítics — i el que encerten" (`critiques-of-big-five-what-critics-say`)

### 1.1 «investigació factorioanàlitica» (paràgraf introductori)
- Anglès: "Decades of factor-analytic research"
- Català actual: «Dècades d'investigació factorioanàlitica»
- Categoria: ERRADA (ortografia/formació de mots) · Gravetat ALTA
- Proposta: «investigació factorial» o «investigació d'anàlisi factorial»
- Justificació: *factorioanàlitica* no és un mot català: és una aglutinació mal formada (sobra la *-io-* i la base hauria de ser *anàlisi → factorial / analític*). L'adjectiu derivat d'«anàlisi factorial» és «factorial»; si es vol l'adjectiu relacional d'«analític» cal «factoanalític» com a màxim, però la solució neta i divulgativa és «investigació factorial». Error visible al primer paràgraf.

### 1.2 «recercadors» (cos, diverses ocurrències)
- Anglès: "from researchers who know the evidence well"
- Català actual: «de recercadors que coneixen bé l'evidència»; també «els recercadors que l'utilitzen» (secció HEXACO)
- Categoria: TERMINOLOGIA/REGISTRE · Gravetat BAIXA
- Proposta: «investigadors»
- Justificació: tant DNV com DIEC2 recullen *investigador -a* com a forma plena per a qui es dedica a la recerca; *recercador* és viu però marcat i menys neutre en registre culte supradialectal. El text ja usa «recerca» i «investigació» de manera alterna; convé unificar en la família «investigació/investigador» per coherència (el mateix article escriu «recercadors» i «investigadors» indistintament).

### 1.3 «de persones alienes que desitjarien que la ciència de la personalitat no existís» (paràgraf 2)
- Anglès: "This is not the criticism of outsiders who wish personality science did not exist."
- Català actual: «No es tracta de la crítica de persones alienes que desitjarien que la ciència de la personalitat no existís.»
- Categoria: FIDELITAT/REGISTRE · Gravetat BAIXA
- Proposta: «No és la crítica de gent de fora que voldria que la ciència de la personalitat no existís.»
- Justificació: *outsiders* ací són persones alienes a la disciplina (de fora); «persones alienes» en absolut és ambigu (alienes a què?). «de fora» (oposat al «de dins la disciplina» de la frase següent) recupera el contrast de la font. Millora de precisió, no error dur.

### 1.4 «de dins la disciplina» (paràgraf 2)
- Anglès: "Much of it comes from within the discipline"
- Català actual: «Gran part prové de dins la disciplina»
- Categoria: ERRADA (preposició) · Gravetat BAIXA
- Proposta: «de dins de la disciplina»
- Justificació: davant d'article, la locució prepositiva culta és «dins de la» (o «des de dins de la»); «de dins la disciplina» elideix la preposició de manera col·loquial. DIEC2/GIEC recomanen «dins de» davant de SN determinat.

### 1.5 «els ítems que cocarregaven» (secció 1, crítica de Block)
- Anglès: "the items that loaded together were the items that co-varied in self-report"
- Català actual: «els ítems que cocarregaven eren els que covariaven en l'autoinforme»
- Categoria: TERMINOLOGIA/CALC · Gravetat MITJANA
- Proposta: «els ítems que saturaven conjuntament eren els que covariaven en l'autoinforme»
- Justificació: en anàlisi factorial el terme català per *to load on a factor* és **saturar** (saturació factorial = factor loading), recollit a la bibliografia psicomètrica en català (UB/UOC). *Cocarregar* és un calc cru de *co-load* inexistent en català; a més la juxtaposició «cocarregaven... covariaven» fa un efecte de rima involuntària. («covariar» sí que és correcte.)

### 1.6 «La "cinc-itat" del Big Five» (secció 1; reapareix a la secció 2)
- Anglès: "The 'five-ness' of the Big Five"
- Català actual: «La "cinc-itat" del Big Five»
- Categoria: CALC (formació de mots) · Gravetat MITJANA
- Proposta: «El "caràcter quíntuple" del Big Five» o «El fet que en siguin cinc» / «La "quincitat"» (entre cometes, com a encunyació)
- Justificació: *cinc-itat* és un calc morfològic de *five-ness* que no segueix cap patró derivatiu català (el sufix *-itat* s'adjunta a bases adjectivals llatinitzants, no al numeral *cinc* amb guionet). En divulgació la paràfrasi «el fet que siguin (just) cinc» o «el caràcter quíntuple» és més natural. Apareix dues vegades; cal unificar.

### 1.7 «foragers-horticulturalistes» (secció 3, Tsimane)
- Anglès: "a forager-horticulturalist society in Bolivia"
- Català actual: «una societat de foragers-horticulturalistes a Bolívia»
- Categoria: ERRADA (manlleu no adaptat) + CALC · Gravetat MITJANA
- Proposta: «una societat de caçadors-recol·lectors i horticultors» (o «de recol·lectors-horticultors»)
- Justificació: *forager* es deixa cru en anglès; el terme català és **recol·lector** (o «caçador-recol·lector» segons l'abast). *Horticulturalista* és un calc de l'anglès *horticulturalist*; el català és **horticultor -a** (DNV, DIEC2). Deixar l'anglicisme dins d'un text català trenca el registre i és opac per al lector.

### 1.8 «no s'exempta de advertiments significatius» / «exempta de advertiments» (secció 3)
- Anglès: "not without significant caveats"
- Català actual: «no està exempta de advertiments significatius»
- Categoria: ERRADA (contracció/apostrofació) + TERMINOLOGIA · Gravetat MITJANA
- Proposta: «no està exempta d'advertiments significatius» — i millor lèxic: «no està exempta de matisos/reserves importants»
- Justificació: (a) errada d'apostrofació: «de advertiments» → «d'advertiments» (la preposició *de* s'apostrofa davant vocal). (b) *caveat* es tradueix millor per «reserva», «matís» o «advertència»; «advertiment» és correcte però «reserves/matisos» encaixa més en el sentit acadèmic de *caveat*.

### 1.9 «la seva curiositat sosté un cicle d'avaluació positiva» — (no aplica; vegeu falsos positius)

### 1.10 «el Inventari d'Esgotament» — (pertany a un altre article; ignorar)

### 1.11 Tractament de «vós» vs imperatius absents
- Anglès: "Engage with the model critically: try Cèrcol free" / "What it cannot tell you..."
- Català actual: «Compromet-te amb el model de manera crítica: prova Cèrcol gratis», «Cèrcol es dissenya... el que el Big Five pot dir-te»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós segons el model de l'auditoria: «Comprometeu-vos amb el modeldemaneracrítica: proveu Cèrcol gratis»; «el que el Big Five pot dir-vos».
- Justificació: el brief fixa el tractament de **vós** per a les crides al lector. L'article usa «tu» («Compromet-te», «prova», «dir-te»). Cal regularitzar a vós (*comprometeu-vos, proveu, dir-vos*) a tot el bloc final i a les ocurrències de «et diu» del cos.

### 1.12 «Compromet-te amb el model» (títol de la crida final)
- Anglès: "Engage with the model critically"
- Català actual: «Compromet-te amb el model de manera crítica»
- Categoria: CALC (fals amic) · Gravetat MITJANA
- Proposta: «Analitza/Examina el model de manera crítica» o «Confronta't amb el model críticament»
- Justificació: *to engage with* no és «comprometre's amb» (= adquirir un compromís/obligació). Ací vol dir «implicar-se en», «confrontar-se amb», «examinar a fons». «Comprometre's amb el model» suggereix adhesió, que és el contrari del sentit crític pretès. Fals amic *engage/comprometre*.

### 1.13 Fals positiu: «la "cinc-itat" ... és en part un artefacte»
- Anglès: "is partly an artefact of the English-language lexical data"
- Català actual: «és en part un artefacte de les dades lexicals en llengua anglesa»
- Categoria: correcte · Gravetat —
- Justificació: *artefacte* en sentit metodològic (resultat espuri introduït pel mètode) és bon català tècnic (DIEC2/TERMCAT); no és calc. Es registra per descartar fals positiu. («lexicals» també és correcte.)

### Resum quantitatiu — Crítiques al Big Five
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (ortografia, preposició, manlleu) | 1 | 2 | 1 |
| CALC / fals amic (engage, five-ness, cocarregar) | – | 3 | – |
| TERMINOLOGIA (saturar, caveat) | – | (comptat amb ERRADA 1.8) | – |
| REGISTRE/COHERÈNCIA (tractament, recercadors, outsiders) | – | 1 | 2 |
| FIDELITAT | – | – | (comptat amb 1.3) |
| Total incidències | **1** | **6** | **4** |

---

## "Com es calculen les puntuacions dels tests de personalitat: dels ítems a les dimensions" (`how-personality-test-scores-are-calculated`)

### 2.1 Tractament «tu» generalitzat (entradeta i tot el cos)
- Anglès: "You sit down with a personality questionnaire. You answer a hundred statements..."
- Català actual: «Seu davant d'un qüestionari de personalitat. Respons un centenar d'afirmacions sobre tu mateix... quanta confiança hi hauries de dipositar.»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós: «Seieu davant d'un qüestionari... Responeu un centenar d'afirmacions sobre vós mateix... quanta confiança hi hauríeu de dipositar.» Igual amb «et converteix en un millor consumidor» → «us converteix», «la teva puntuació» → «la vostra puntuació».
- Justificació: el brief fixa **vós** per a les adreces al lector. Tot l'article tracta de «tu» (*seu, respons, tu mateix, hauries, et converteix, la teva*). És el patró de registre dominant de l'article i cal regularitzar-lo.

### 2.2 «condicionen la teva puntuació» (títol del Pas 1) i «condiciona el teu percentil» (títol Pas 5)
- Anglès: "How Big Five Item Response Formats Shape Your Score" / "Why the Normative Database Shapes Your Big Five Percentile"
- Català actual: «...condicionen la teva puntuació», «...condiciona el teu percentil Big Five»
- Categoria: REGISTRE (tractament) · Gravetat BAIXA
- Proposta: «condicionen la vostra puntuació», «condiciona el vostre percentil»
- Justificació: coherència amb la unificació a vós (2.1). En títols de secció el possessiu de 2a persona ha de seguir el mateix tractament que el cos.

### 2.3 «els participants valoren el seu grau d'acord amb una afirmació» — (correcte; vegeu però 2.4)

### 2.4 «La matèria primera d'una puntuació» (Pas 1)
- Anglès: "The raw material of a personality score"
- Català actual: «La matèria primera d'una puntuació de personalitat»
- Categoria: TERMINOLOGIA (col·locació) · Gravetat BAIXA
- Proposta: «La matèria primera» és correcta, però en aquest registre tècnic «la matèria primera» (=allò primer) pot confondre's amb «matèria prima»; recomano «La matèria primera» → «La matèria primera (la dada de partida)» o, més clar, «El material brut de partida d'una puntuació».
- Justificació: «matèria primera» és normativa per *raw material*, però conviu en el text amb «respostes brutes»/«ítems bruts»; per coherència interna amb «brut/-a» (que ja s'usa al peu del diagrama: «respostes brutes als ítems») convé «material brut». Coherència terminològica, no error.

### 2.5 «aquesta suma bruta normalment es estandarditza» (Pas 3)
- Anglès: "This raw sum is then typically standardised against a normative sample"
- Català actual: «Aquesta suma bruta normalment es estandarditza en relació a una mostra normativa»
- Categoria: ERRADA (pronom feble/elisió) · Gravetat ALTA
- Proposta: «aquesta suma bruta normalment s'estandarditza en relació amb una mostra normativa»
- Justificació: davant de verb començat per vocal el pronom *es* s'apostrofa: **s'estandarditza** (no «es estandarditza»). Errada d'apostrofació clara (DIEC2/GIEC). A més, «en relació a» és calc del castellà: la forma genuïna és «en relació amb» (Optimot, fitxa «en relació amb / amb relació a»).

### 2.6 «en relació a una mostra normativa» / «en relació a la població» (Pas 3 i Pas 4)
- Anglès: "standardised against a normative sample" / "relative to a population"
- Català actual: «en relació a una mostra normativa», «no en relació a una població»
- Categoria: CALC (locució) · Gravetat MITJANA
- Proposta: «en relació amb una mostra normativa», «no en relació amb una població»
- Justificació: la locució normativa és **«en relació amb»** (o «amb relació a»); «en relació a» és un calc del castellà *en relación a* desaconsellat per l'Optimot i la majoria de guies d'estil. Recurrent al Pas 3 i al Pas 4.

### 2.7 «La puntuació TRI pondera els ítems per la seva capacitat discriminatòria» (Pas 3)
- Anglès: "IRT scoring weights items by their discriminating power"
- Català actual: «La puntuació TRI pondera els ítems per la seva capacitat discriminatòria»
- Categoria: correcte · Gravetat —
- Justificació: *discriminating power* → «capacitat discriminatòria/discriminativa» és bon terme psicomètric; «ponderar» per *weight* és correcte. Es registra per descartar fals positiu (la sigla TRI per IRT també és coherent amb la taula).

### 2.8 «menys entesa» (Pas 4, primera línia)
- Anglès: "This is perhaps the least understood distinction"
- Català actual: «Aquesta és potser la distinció menys entesa en la puntuació dels tests»
- Categoria: REGISTRE/CALC · Gravetat BAIXA
- Proposta: «la distinció menys ben entesa» o «la distinció pitjor compresa»
- Justificació: «menys entesa» calca *least understood*; en català «entès» sol demanar un modificador («ben/mal entès») per expressar el grau de comprensió. «Menys ben entesa» és més idiomàtic.

### 2.9 «la persona mitjana de la mostra normativa puntua 65» (Pas 4)
- Anglès: "the average person in the normative sample scores 65"
- Català actual: «la persona mitjana de la mostra normativa puntua 65»
- Categoria: AMBIGÜITAT/REGISTRE · Gravetat BAIXA
- Proposta: «la persona mitjana de la mostra normativa obté una puntuació de 65» (o «puntua 65 punts»)
- Justificació: *puntuar* usat transitivament amb un número sense unitat («puntua 65») és poc natural i ambigu (puntua quina cosa?). Millor «obté una puntuació de 65». Es repeteix amb «un candidat que puntua alt» (acceptable amb adverbi) però amb xifra nua queda eixut.

### 2.10 «les puntuacions facetàries es reportarien com a puntuacions estandarditzades» (secció «Com Cèrcol puntua...»)
- Anglès: "facet scores are reported as standardised scores within each dimension"
- Català actual: «les puntuacions facetàries es reportarien com a puntuacions estandarditzades dins de cada dimensió»
- Categoria: FIDELITAT (mode/temps verbal) + TERMINOLOGIA · Gravetat MITJANA
- Proposta: «les puntuacions de faceta es reporten com a puntuacions estandarditzades dins de cada dimensió»
- Justificació: (a) l'anglès és present indicatiu factual («are reported»); el català ho passa a condicional («es reportarien»), introduint una hipoteticitat que la font no té — pèrdua de fidelitat. (b) *reportar* en el sentit de *to report (a score)* és acceptable però el castellanisme latent es pot evitar amb «s'expressen/es presenten»; (c) «facetàries» és un derivat poc establert: preferible «de faceta» (com fa la resta de la col·lecció: «puntuació de domini», «nivell de faceta»). Coherència amb l'enllaç «què és una faceta».

### 2.11 «es poden superposar directament amb les dades d'autoinforme» (secció Cèrcol)
- Anglès: "can be directly overlaid with self-report data"
- Català actual: «que es poden superposar directament amb les dades d'autoinforme»
- Categoria: correcte · Gravetat —
- Justificació: *overlay* → «superposar» és la tria correcta (millor que el calc «solapar»); recció «superposar amb/a» admissible. Es registra com a encert per contrast amb el calc habitual.

### 2.12 «posant en relleu els punts cecs» (secció final)
- Anglès: "surfacing the blind spots that no self-report instrument... can detect"
- Català actual: «posant en relleu els punts cecs que cap instrument d'autoinforme... pot detectar per si sol»
- Categoria: correcte · Gravetat —
- Justificació: *to surface* aquí es resol bé amb «posar en relleu» (i en altres articles amb «fer aflorar»). Es registra per descartar fals positiu i com a contrast amb l'errada 3.4 de l'auditoria 05-blog («emergeix la bretxa»): ací NO hi ha l'error de transitivitat.

### Resum quantitatiu — Com es calculen les puntuacions
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (apostrofació) | 1 | – | – |
| CALC (en relació a, menys entesa) | – | 1 | 1 |
| FIDELITAT/TERMINOLOGIA (condicional, faceta) | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament tu/vós) | – | 1 | 1 |
| AMBIGÜITAT/REGISTRE (puntua 65, matèria primera) | – | – | 2 |
| Total incidències | **1** | **4** | **4** |

---

## "Personalitat i esgotament: qui és més vulnerable — i per què" (`personality-and-burnout-who-is-most-at-risk`)

### 3.1 «la rapidesa amb que l'estrès s'acumula» / «la velocitat amb la qual» (paràgraf 2 i secció Neuroticisme)
- Anglès: "how quickly stress accumulates"
- Català actual: «tant la rapidesa amb que l'estrès s'acumula com l'eficàcia amb que es dissipa»
- Categoria: ERRADA (relatiu àton sense article) · Gravetat MITJANA
- Proposta: «la rapidesa amb què l'estrès s'acumula... l'eficàcia amb què es dissipa»
- Justificació: darrere de preposició el relatiu tònic porta accent: **amb què** (no «amb que»). DIEC2/GIEC: el relatiu interrogatiu/tònic «què» s'accentua sempre rere preposició. Errada repetida dues vegades en la mateixa frase. (Més avall, «la velocitat amb la qual» és correcte.)

### 3.2 «el Inventari d'Esgotament de Maslach» (secció Maslach)
- Anglès: "whose Maslach Burnout Inventory defines it across three dimensions"
- Català actual: «el Inventari d'Esgotament de Maslach del qual el defineix en tres dimensions»
- Categoria: ERRADA (apostrofació + sintaxi) · Gravetat ALTA
- Proposta: «l'Inventari d'Esgotament de Maslach, que el defineix en tres dimensions» (o «de qui l'Inventari... defineix...»)
- Justificació: (a) «el Inventari» → «l'Inventari» (apostrofació davant vocal). (b) La construcció «de Maslach del qual el defineix» és agramatical: barreja el possessiu *whose* mal resolt amb un «el» pleonàstic. Cal reordenar: «Christina Maslach, l'Inventari d'Esgotament de la qual el defineix...» o, més clar, partir la frase. Error de recció relativa sobre el terme central de la secció.

### 3.3 «Despersonalització: distanciament psicològic ... que funciona com a protecció contra una depleció ulterior» (llista Maslach)
- Anglès: "a cynical or detached stance that functions as protection against further depletion"
- Català actual: «una postura cínica o distant que funciona com a protecció contra una depleció ulterior»
- Categoria: REGISTRE/TERMINOLOGIA · Gravetat BAIXA
- Proposta: «...com a protecció contra una depleció posterior/addicional»; i «depleció» → considerar «esgotament/buidatge de recursos»
- Justificació: *further* aquí és «addicional/posterior», no «ulterior» (que en català culte significa «que es diu/fa després», amb matís d'allò que s'esdevé més enllà, i sona arcaïtzant). *Depleció* és un manlleu mèdic admissible però poc transparent en divulgació; el text alterna «depleció» i «depleció dels recursos emocionals»: es podria fer servir «esgotament de recursos» per a més claredat. Millora de naturalesa.

### 3.4 «el que és una de les raons per les quals la "puntuació d'esgotament" composta pot enganyar» (final secció Maslach)
- Anglès: "which is one reason the composite 'burnout score' can mislead"
- Català actual: «La personalitat prediu les vies de manera diferent — el que és una de les raons per les quals...»
- Categoria: CALC (relatiu neutre) · Gravetat MITJANA
- Proposta: «..., cosa que és una de les raons per les quals...» (o «la qual cosa és una de les raons...»)
- Justificació: «el que» com a relatiu neutre que reprèn tota una oració anterior és un calc del castellà *lo que*/anglès *which*; en català normatiu cal **«cosa que»** o «la qual cosa» (Optimot; GIEC). Apareix també a la secció Conscienciositat («la diligència... es converteix en el mecanisme», allà correcte) però aquí l'ús és clarament el calc. Recurrent al llarg del text amb «el que».

### 3.5 «troben la interacció cooperativa més esfaçadora» (secció Amabilitat)
- Anglès: "find cooperative interaction more effortful"
- Català actual: «troben la interacció cooperativa més esfaçadora»
- Categoria: ERRADA (mot inexistent) · Gravetat ALTA
- Proposta: «troben la interacció cooperativa més costosa/esgotadora» (o «que els exigeix més esforç»)
- Justificació: **esfaçadora** no existeix en català (ni DNV ni DIEC2): sembla un híbrid corromput. *Effortful* = «que exigeix esforç», «costós», «laboriós». Errada lèxica greu (mot fantasma) sobre la descripció del mecanisme.

### 3.6 «un estil interpersonal de baixa Amabilitat — una distància còmoda dels altres» (secció Amabilitat)
- Anglès: "a comfortable distance from others that becomes pathological"
- Català actual: «una distància còmoda dels altres que es torna patològica»
- Categoria: AMBIGÜITAT (preposició) · Gravetat BAIXA
- Proposta: «una distància còmoda respecte als altres que esdevé patològica»
- Justificació: «distància còmoda dels altres» és ambigu (distància que els altres tenen? o respecte als altres?). «respecte a/de» desfà l'ambigüitat. Millora de claredat.

### 3.7 «redueix la dimensió d'assoliment personal reduït de l'esgotament» (secció Conscienciositat)
- Anglès: "drives down the reduced personal accomplishment dimension of burnout"
- Català actual: «aquesta experiència redueix la dimensió d'assoliment personal reduït de l'esgotament»
- Categoria: REDUNDÀNCIA/AMBIGÜITAT · Gravetat MITJANA
- Proposta: «aquesta experiència agreuja la dimensió de "reducció de l'assoliment personal" de l'esgotament» (o «fa baixar l'assoliment personal, la tercera dimensió de l'esgotament»)
- Justificació: «redueix la dimensió d'assoliment personal reduït» és una redundància confusa (*redueix... reduït*) i a més contradictòria amb la lògica (*drives down* fa augmentar la dimensió «reducció de l'assoliment», no la «redueix»). La dimensió de Maslach es diu «reducció de l'assoliment personal»; cal anomenar-la igual que a la llista (punt 3) i dir que s'**agreuja/intensifica**, no que es «redueix». Error de fidelitat conceptual.

### 3.8 «que reencuadrin les situacions difícils» (secció Obertura)
- Anglès: "to reframe difficult situations as interesting problems"
- Català actual: «que reencuadrin les situacions difícils com a problemes interessants»
- Categoria: CALC/BARBARISME (castellanisme) · Gravetat ALTA
- Proposta: «que replantegin/reformulin les situacions difícils com a problemes interessants»
- Justificació: **reencuadrar** és un castellanisme (*reencuadrar*); no és català. Per *to reframe* el català usa «replantejar», «reformular», «tornar a enquadrar». Barbarisme clar.

### 3.9 «un dels predictors més consistents del rendiment laboral» / «consistentment» (diverses)
- Anglès: "one of the most consistent predictors of job performance"
- Català actual: «un dels predictors més consistents del rendiment laboral»; «es replica... de manera consistent»; «els mecanismes... més consistentment recolzats»
- Categoria: TERMINOLOGIA (fals amic atenuat) · Gravetat BAIXA
- Proposta: en context estadístic «consistent» (=que es replica) és admissible com a tecnicisme; però «recolzats» → «sustentats/avalats per les evidències» i vigilar «consistent» quan vol dir «coherent/sòlid».
- Justificació: *consistent* és parcialment fals amic; en estadística «estimador consistent» és terme català vàlid, i «de manera consistent» (=reiteradament) és tolerat. Es registra com a alerta de coherència, no error dur. «recolzar» en el sentit de *to support evidence* és preferible «sustentar/avalar».

### 3.10 «els assumpcionadors de risc» — (pertany a l'article de risc; ignorar ací)

### 3.11 «a nivell organitzatiu» / «a nivells elevats» / «a nivell d'equip» (diverses)
- Anglès: "organisational-level prevention" / "at high levels"
- Català actual: «la prevenció a nivell organitzatiu»; «a nivells elevats, un risc real»
- Categoria: REGISTRE (locució desaconsellada) · Gravetat BAIXA
- Proposta: «la prevenció en l'àmbit organitzatiu / a escala organitzativa»; «en nivells elevats» o «quan és molt alta»
- Justificació: «a nivell de» quan no és alçària física es desaconsella (Softcatalà, IEC); cal «en l'àmbit de», «a escala de». «a nivells elevats» és tolerable (nivell sí indica grau) però es pot afinar. Recurrent (apareix també «a nivell organitzatiu» al peu APA).

### 3.12 Tractament «tu» a la crida final
- Anglès: "If you manage people, seeing the stress signals..."
- Català actual: «Mira qui del teu equip està més exposat...»; «Si gestiones persones, veure els senyals...»; «la perspectiva externa dels senyals de benestar del teu equip»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós: «Mireu qui del vostre equip...», «Si gestioneu persones...», «del vostre equip».
- Justificació: el brief fixa vós per a les crides al lector; aquest article usa «tu» (*mira, el teu equip, gestiones*). Cal regularitzar.

### Resum quantitatiu — Personalitat i esgotament
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (mot inexistent, apostrofació, relatiu) | 2 | 1 | – |
| CALC/BARBARISME (reencuadrar, "el que") | 1 | 1 | – |
| REDUNDÀNCIA/AMBIGÜITAT (assoliment reduït, distància) | – | 1 | 1 |
| REGISTRE/COHERÈNCIA (tractament, "a nivell de", ulterior, consistent) | – | 1 | 3 |
| Total incidències | **3** | **4** | **4** |

---

## "Personalitat i assumpció de riscos en el treball: qui assumeix riscos i per què" (`personality-and-risk-taking-who-takes-risks-at-work`)

### 4.1 «La seva cautela sovint és warranted.» (secció Neuroticisme)
- Anglès: "Their caution is often warranted."
- Català actual: «La seva cautela sovint és warranted.»
- Categoria: ERRADA (mot anglès sense traduir) · Gravetat ALTA
- Proposta: «La seva cautela sovint és justificada / està justificada.»
- Justificació: *warranted* ha quedat literalment en anglès dins del text català: error de traducció flagrant (omissió de traducció). Cal «justificada», «fonamentada», «té raó de ser».

### 4.2 «voluntariejar-se per tasques difícils» / «voluntariejar-se per tasques incertes» (seccions Extraversió i Neuroticisme)
- Anglès: "volunteer for stretch assignments" / "volunteering for uncertain assignments"
- Català actual: «voluntariejar-se per tasques difícils», «voluntariejar-se per tasques incertes»
- Categoria: CALC (verb inexistent) · Gravetat MITJANA
- Proposta: «oferir-se voluntàriament per a tasques difícils», «presentar-se voluntari per a tasques incertes»
- Justificació: **voluntariejar-se** no és un verb català (calc de *to volunteer*); el català usa «oferir-se voluntari/voluntàriament», «presentar-se voluntari». A més *stretch assignments* són «tasques exigents / de superació», no merament «difícils». Recurrent (dues ocurrències). També cal «per **a** tasques» (finalitat).

### 4.3 «els assumpcionadors de risc amb Alta Presència» / «assumpcionadors de riscos» (seccions Conscienciositat i conclusions)
- Anglès: "the questions that high-Presence risk-takers skip over" / "transform risk-averse people into risk-takers"
- Català actual: «les preguntes que els assumpcionadors de risc amb Alta Presència s'ometen»; «transformar les persones averses al risc en assumpcionadors de riscos»
- Categoria: ERRADA (mot inexistent) + recció · Gravetat ALTA
- Proposta: «els qui assumeixen riscos / les persones que assumeixen riscos amb Alta Presència»; «convertir les persones averses al risc en persones que assumeixen riscos»
- Justificació: **assumpcionador** no existeix en català (derivat espuri de «assumpció»). Cal una perífrasi: «els qui assumeixen riscos», «les persones arriscades». A més «s'ometen les preguntes» és recció dubtosa: millor «que les persones... ometen / es salten». Mot fantasma recurrent.

### 4.4 «els qui cerquen experiències» / «la faceta de cerca d'experiències de la cerca de sensacions» (secció Obertura)
- Anglès: "the experience-seeking facet of sensation-seeking ... Experience-seekers take..."
- Català actual: «la faceta de cerca d'experiències de la cerca de sensacions... Els qui cerquen experiències assumeixen riscos»
- Categoria: AMBIGÜITAT/REDUNDÀNCIA · Gravetat BAIXA
- Proposta: «la faceta de cerca d'experiències dins la cerca de sensacions»; mantenir «els qui cerquen experiències»
- Justificació: «de la cerca d'experiències de la cerca de sensacions» encadena dos «de + cerca de» que fan la frase opaca; «dins la/dins de la cerca de sensacions» aclareix la relació part-tot. Millora de llegibilitat; «els qui cerquen experiències» per *experience-seekers* és bona solució.

### 4.5 «Els individus que puntuen alt en Profunditat tendeixen a avaluar... i a ponderar les pèrdues potencials amb més força» (secció Neuroticisme)
- Anglès: "to weight potential losses more heavily than potential gains"
- Català actual: «a ponderar les pèrdues potencials amb més força que els guanys potencials»
- Categoria: correcte · Gravetat —
- Justificació: *to weight more heavily* → «ponderar amb més força/pes» és tradució correcta i consistent (apareix també a la secció Extraversió: «pesen els guanys potencials amb més força»). Es registra per descartar fals positiu; només cal coherència entre «ponderar» i «pesar» (totes dues vàlides; recomanable unificar en «ponderar»).

### 4.6 «defèn al consens» / «advocar públicament» (taula final, fila Amabilitat)
- Anglès: "avoids conflict, defers to consensus"
- Català actual: «evita el conflicte, defèn al consens»
- Categoria: ERRADA (terme + preposició) · Gravetat ALTA
- Proposta: «evita el conflicte, se sotmet/cedeix al consens» (o «s'acull al consens»)
- Justificació: *defer to* = «sotmetre's a / cedir davant / plegar-se a», NO «defendre». «defèn al consens» (a) confon *defer* amb *defend* (fals amic) i (b) hi posa una *a* davant de CD inanimat incorrecta. Canvi de sentit: «defensar el consens» és gairebé el contrari de «sotmetre-s'hi». Error de fidelitat en cel·la de taula.

### 4.7 «advocar per projectes exploratoris sense retorn garantit» / «advocar públicament per canvis» / «advocar per la innovació» (diverses)
- Anglès: "advocate for exploratory projects" / "advocate publicly for changes"
- Català actual: «advocar per projectes exploratoris», «advocar públicament per canvis»
- Categoria: TERMINOLOGIA (col·locació) · Gravetat BAIXA
- Proposta: acceptable; alternativa més idiomàtica «defensar/promoure projectes exploratoris», «reclamar canvis públicament»
- Justificació: *advocate for* → «advocar per» és admès (DIEC2 recull «advocar per/a favor de»), però en cadena resulta repetitiu (apareix 3+ vegades); convé variar amb «defensar», «promoure», «reclamar». Coherència estilística, no error.

### 4.8 «la defensa d'idees —advocar activament per una innovació contra la resistència organitzacional» (secció constructes)
- Anglès: "Idea championing — actively advocating for an innovation against organisational resistance"
- Català actual: «La defensa d'idees —advocar activament per una innovació contra la resistència organitzacional—»
- Categoria: correcte · Gravetat —
- Justificació: *idea championing* → «defensa d'idees» és bona solució divulgativa; «contra la resistència organitzacional» tradueix bé *against... resistance*. Es registra per descartar fals positiu.

### 4.9 «Tendència de risc» / «assumpció de riscos» (coherència singular/plural)
- Anglès: "Risk tendency" / "risk-taking"
- Català actual: títol «assumpció de riscos» (plural) conviu amb taula «Tendència de risc» (singular) i «propensió al risc»
- Categoria: REGISTRE/COHERÈNCIA (terminologia interna) · Gravetat BAIXA
- Proposta: unificar el nucli terminològic: «assumpció de riscos» / «propensió a assumir riscos» de manera coherent.
- Justificació: el text alterna «assumpció de riscos», «propensió a assumir riscos», «tendència de risc», «propensió al risc», «orientació de risc». Totes són correctes però la varietat excessiva dilueix el terme clau de l'article. Coherència terminològica.

### 4.10 Tractament «vós» / coherència amb la resta
- Anglès: "Understand Your Team's Risk Profile" / "Knowing how your team is distributed..."
- Català actual: «Entén el perfil de risc del teu equip amb Cèrcol»; «Saber com es distribueix el teu equip... és la base per calibrar el teu apetit col·lectiu»; «Construeix un panorama més clar»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós: «Enteneu el perfil de risc del vostre equip», «el vostre equip», «calibrar el vostre apetit», «Construïu un panorama més clar».
- Justificació: brief → vós per a les adreces al lector. L'article usa «tu» (*entén, el teu equip, construeix*). Regularitzar.

### Resum quantitatiu — Personalitat i assumpció de riscos
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (warranted, assumpcionador, defèn al consens) | 3 | – | – |
| CALC (voluntariejar-se) | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament, terminologia interna) | – | 1 | 2 |
| AMBIGÜITAT/REDUNDÀNCIA (cerca d'experiències) | – | – | 1 |
| Total incidències | **3** | **2** | **3** |

---

## "Tests de personalitat de codi obert vs. comercials: pel que realment pagueu" (`personality-testing-open-source-vs-commercial`)

### 5.1 «pel que realment pagueu» (títol) / «per qué paguen les organitzacions» / «Per qué pagueu realment» (titulars)
- Anglès: "what you're actually paying for" / "So what are organisations actually paying for"
- Català actual: «pel que realment pagueu» (títol); «Llavors, per qué paguen les organitzacions...»; «Per qué pagueu realment per un test...»
- Categoria: ERRADA (accentuació) · Gravetat ALTA
- Proposta: «per què paguen les organitzacions», «Per què pagueu realment»
- Justificació: l'interrogatiu **per què** s'escriu amb *è* oberta i accent (DIEC2/GIEC; esADIR). «per qué» amb accent agut és una errata ortogràfica del castellà. Apareix com a mínim dues vegades en titulars de secció (molt visible). El títol «pel que realment pagueu» (relatiu, sense interrogació) sí que és correcte sense accent.

### 5.2 «diverses centenars de lliures per candidat» (entradeta)
- Anglès: "several hundred pounds per candidate"
- Català actual: «pagarà diverses centenars de lliures per candidat»
- Categoria: ERRADA (concordança de gènere) · Gravetat MITJANA
- Proposta: «pagarà diversos centenars de lliures per candidat»
- Justificació: **centenar** és masculí (un centenar, els centenars); el quantificador ha de concordar: «diversos centenars», no «diverses centenars». Errada de concordança. (Nota de fidelitat: la descripció en castellà/anglès parla de «pounds/lliures»; correcte mantenir «lliures» perquè la font esmenta Hogan al Regne Unit, tot i que la descripció diu «milers d'euros» — vegeu 5.3.)

### 5.3 Descripció (camp `description`): «costen milers d'euros anualment»
- Anglès (desc): "Commercial personality tests like Hogan cost thousands annually."
- Català actual (desc): «Els tests de personalitat comercials com Hogan costen milers d'euros anualment.»
- Categoria: FIDELITAT · Gravetat BAIXA
- Proposta: «...costen milers anualment» (sense especificar moneda) o coherent amb el cos («lliures»)
- Justificació: la font no especifica moneda a la descripció («thousands»); el català hi afegeix «d'euros», mentre que el cos de l'article parla de «lliures». Petita incoherència de moneda introduïda en la traducció. Baixa perquè no altera l'argument.

### 5.4 «està respaldada per evidència de validesa publicada» (entradeta)
- Anglès: "backed by published validity evidence"
- Català actual: «auditable i està respaldada per evidència de validesa publicada»
- Categoria: CALC/BARBARISME (castellanisme) · Gravetat ALTA
- Proposta: «està avalada/recolzada/sustentada per evidència de validesa publicada»
- Justificació: **respaldar / respaldada** és un castellanisme cru (*respaldar*); no existeix en català. Per *to back* el català usa «avalar», «recolzar», «sustentar», «fonamentar». Barbarisme clar a l'entradeta.

### 5.5 «solo un editor comercial pot proporcionar aquesta comparació» (secció base de dades normativa)
- Anglès: "only a commercial publisher can provide that comparison"
- Català actual: «solo un editor comercial pot proporcionar aquesta comparació»
- Categoria: ERRADA/BARBARISME (castellanisme) · Gravetat ALTA
- Proposta: «només un editor comercial pot proporcionar aquesta comparació»
- Justificació: **solo** (=només) és castellà; en català és **només** / «tan sols» / «únicament». («sol» adjectiu existeix, però aquí l'adverbi *only* és «només».) Castellanisme flagrant.

### 5.6 «editor comercial» per *publisher* (diverses)
- Anglès: "commercial publisher" / "Commercial publishers maintain..."
- Català actual: «editor comercial», «els editors comercials mantenen grans grups normatius»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: acceptable; «editorial comercial» o «empresa editora» pot ser més clar quan es refereix a l'organització (no a la persona)
- Justificació: *publisher* aquí és l'empresa/editorial que publica el test, no una persona; «editor» en català tendeix a la persona. «editorial»/«casa editora» evita l'ambigüitat. Matís terminològic, no error.

### 5.7 «advers» / «estudis d'impacte advers» (secció defensabilitat legal)
- Anglès: "adverse impact studies"
- Català actual: «estudis d'impacte advers»
- Categoria: correcte · Gravetat —
- Justificació: *adverse impact* → «impacte advers» és el terme establert (discriminació indirecta en selecció); correcte. Es registra per descartar fals positiu.

### 5.8 «el que realment compra la prima» (desc) / «la prima per als tests... paga principalment» (cos)
- Anglès (desc): "what the premium actually buys" / (cos) "The premium for commercial personality tests is primarily paying for four things"
- Català actual: «el que realment compra la prima»; «La prima per als tests de personalitat comercials paga principalment quatre coses»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat MITJANA
- Proposta: «el sobrepreu / el cost addicional»; «El sobrepreu dels tests comercials paga principalment...»
- Justificació: *premium* en el sentit de «quantitat que es paga de més» és «sobrepreu», «recàrrec» o «el plus»; **prima** en català és sobretot l'import d'una assegurança o una gratificació, no el «extra» de preu d'un producte. «la prima... compra/paga» és un calc semàntic confús. Recurrent (desc + dos titulars/cos).

### 5.9 «no esteu pagant és una millor mesura de la personalitat en si mateixa» (penúltima secció)
- Anglès: "What you are not paying for is better measurement of personality itself."
- Català actual: «El que no esteu pagant és una millor mesura de la personalitat en si mateixa.»
- Categoria: correcte · Gravetat —
- Justificació: bon ús del tractament de vós (*esteu pagant*) i traducció fidel. Es registra com a referència del tractament correcte: aquest article SÍ que usa vós de manera majoritària i coherent («pagueu», «useu», «esteu pagant», «el vostre equip»), a diferència de la resta del lot. Bon contrast.

### 5.10 «a nivell de faceta» (secció final)
- Anglès: "facet-level profiles are free"
- Català actual: «els perfils a nivell de faceta són gratuïts»
- Categoria: REGISTRE (locució desaconsellada) · Gravetat BAIXA
- Proposta: «els perfils de nivell de faceta» o «els perfils per facetes»
- Justificació: «a nivell de» quan no és alçària física: preferible «de nivell de» / «per facetes» (Softcatalà, IEC). Baixa.

### Resum quantitatiu — Codi obert vs. comercials
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA/BARBARISME (per qué, solo, respaldada, concordança) | 3 | 1 | – |
| TERMINOLOGIA (prima/sobrepreu, editor) | – | 1 | 1 |
| FIDELITAT (moneda) | – | – | 1 |
| REGISTRE ("a nivell de") | – | – | 1 |
| Total incidències | **3** | **2** | **3** |

---

## "Massa d'acord? Per què els equips d'alt Bond lluiten amb el feedback honest" (`too-agreeable-why-high-bond-teams-struggle-with-honest-feedback`)

### 6.1 «el desig d'harmonia, cohesió i consens anuncia l'avaluació realista de les alternatives» (paràgraf 2)
- Anglès: "the desire for harmony, cohesion, and consensus overrides realistic assessment of alternatives"
- Català actual: «el desig d'harmonia, cohesió i consens anuncia l'avaluació realista de les alternatives»
- Categoria: ERRADA (canvi de sentit per errata lèxica) · Gravetat ALTA
- Proposta: «...consens **anul·la / preval per damunt de / s'imposa a** l'avaluació realista de les alternatives»
- Justificació: *overrides* = «anul·la», «preval sobre», «passa per damunt de». **anuncia** és gairebé segur una errata per «anul·la» (o mala tria): canvia completament el sentit de la definició de *groupthink* (el nucli conceptual de l'article). Error de fidelitat greu en la frase clau.

### 6.2 «Les condicions que Janis va identificar com a precursores del pensament de grup són il·lustres.» (paràgraf 3)
- Anglès: "The conditions Janis identified as precursors to groupthink are instructive."
- Català actual: «...són il·lustres.»
- Categoria: TERMINOLOGIA (fals amic) · Gravetat ALTA
- Proposta: «...són **instructives / il·lustratives / reveladores**.»
- Justificació: *instructive* = «instructiu», «aleccionador», «il·lustratiu». **il·lustres** vol dir «cèlebres, eminents» (persones il·lustres), que no té sentit aplicat a «condicions». Fals amic *instructive → il·lustre*. Canvi de sentit.

### 6.3 «La alta cohesió de grup era la més central» (paràgraf 3)
- Anglès: "High group cohesion was the most central"
- Català actual: «La alta cohesió de grup era la més central»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «L'alta cohesió de grup era la més central»
- Justificació: l'article *la* s'apostrofa davant de mot femení començat per vocal tònica: **l'alta** (no «la alta»). Errada d'apostrofació.

### 6.4 Títol/descripció: «Massa d'acord?» / «equips d'alt Bond»
- Anglès: "Too agreeable? Why high-Bond teams struggle with honest feedback"
- Català actual (títol): «Massa d'acord? Per què els equips d'alt Bond lluiten amb el feedback honest»
- Categoria: FIDELITAT/TERMINOLOGIA · Gravetat MITJANA
- Proposta: «Massa amables? Per què els equips d'alt Vincle lluiten amb la retroalimentació/el feedback honest»
- Justificació: (a) *Too agreeable* fa referència al tret **Amabilitat** (Bond), no a «estar d'acord»: «Massa d'acord?» perd el joc amb la dimensió i el sentit (el tema és la complaença/amabilitat, no l'acord puntual). Millor «Massa amables?» o «Massa complaents?». (b) el cos tradueix sistemàticament Bond com «Vincle» a la resta de la col·lecció (vegeu articles d'esgotament i risc: «alt Vincle»); aquí es manté «Bond» en anglès al títol i al cos, trencant la coherència de la marca de dimensió. Cal «Vincle» (nom Cèrcol). Pèrdua de fidelitat + incoherència terminològica interna a la col·lecció.

### 6.5 «feedback» vs «retroalimentació» (tot l'article)
- Anglès: "honest feedback" / "feedback culture"
- Català actual: «feedback honest», «cultura de feedback», «normes de feedback», «canals de feedback anònim»
- Categoria: TERMINOLOGIA/COHERÈNCIA · Gravetat MITJANA
- Proposta: triar una forma per a tota la col·lecció. Els articles d'esgotament i de càlcul de puntuacions usen «retroalimentació»/«feedback» de manera barrejada; aquest usa sempre «feedback».
- Justificació: *feedback* és admès per TERMCAT com a manlleu en l'àmbit empresarial, i l'ús coherent intern d'aquest article és correcte; però la col·lecció alterna «retroalimentació» (art. esgotament: «bucles de retroalimentació») i «feedback». Cal unificar inter-article. (Internament coherent → MITJANA per coherència de col·lecció, no error dur.)

### 6.6 «La autopercepció de l'equip divergeix del seu comportament» (negreta, secció dinàmiques)
- Anglès: "The team's self-perception diverges from its behaviour."
- Català actual: «**La autopercepció de l'equip divergeix del seu comportament.**»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «**L'autopercepció de l'equip divergeix del seu comportament.**»
- Justificació: «La autopercepció» → «L'autopercepció» (apostrofació davant vocal). A més «autopercepció» (sense guionet, correcte) ja s'usa bé; només falla l'article. En negreta, molt visible.

### 6.7 «Witness» vs «Testimoni» (tot l'article)
- Anglès: "the Witness assessment" / "Cèrcol's Witness instrument"
- Català actual: «l'avaluació Witness», «L'instrument Witness de Cèrcol», «cap Witness individual és identificable»
- Categoria: TERMINOLOGIA/FIDELITAT (vocabulari de producte) · Gravetat ALTA
- Proposta: «l'avaluació Testimoni», «L'instrument Testimoni», «cap Testimoni individual»
- Justificació: la política de producte (CLAUDE.md / PRODUCT.md) exigeix **Testimoni** en català, mai l'anglès «Witness» (ni «observador»). Els altres articles del lot tradueixen correctament «Testimoni» (esgotament: «instrument Testimoni»; risc: «avaluació de Testimoni»). Aquí s'ha deixat «Witness» en anglès de manera sistemàtica: incompliment del vocabulari de marca i incoherència amb la col·lecció. Alta perquè és terme de producte central i recurrent.

### 6.8 «el grup de planificació de la Badia de Porcs com a exhibint "una il·lusió d'invulnerabilitat"» (cita Janis)
- Anglès: "identified the Bay of Pigs planning group as exhibiting 'an illusion of invulnerability'"
- Català actual: «va identificar el grup de planificació de la Badia de Porcs com a exhibint "una il·lusió d'invulnerabilitat"»
- Categoria: CALC (gerundi anglès) · Gravetat MITJANA
- Proposta: «va identificar que el grup de planificació de la Badia de Porcs exhibia "una il·lusió d'invulnerabilitat"...» (o «...el grup... pel fet d'exhibir...»)
- Justificació: «com a exhibint» calca l'estructura anglesa *as exhibiting* (gerundi atributiu); en català no es diu «identificar X com a [gerundi]». Cal una completiva («que... exhibia») o un SN. Calc sintàctic.

### 6.9 «el desig de harmonia» — (no apareix; «d'harmonia» és correcte amb h muda apostrofada). Fals positiu descartat.

### 6.10 «la expectativa implícita» (secció acords de feedback)
- Anglès: "making the implicit expectation explicit"
- Català actual: «fer explícita la expectativa implícita»
- Categoria: ERRADA (apostrofació) · Gravetat MITJANA
- Proposta: «fer explícita l'expectativa implícita»
- Justificació: «la expectativa» → «l'expectativa» (apostrofació davant vocal). Tercera ocurrència del mateix tipus d'errada en aquest article (vegeu 6.3, 6.6): patró sistemàtic de no apostrofar l'article davant vocal.

### Resum quantitatiu — Massa d'acord?
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (anuncia, apostrofació ×3) | 1 | 3 | – |
| TERMINOLOGIA/FIDELITAT (Witness→Testimoni, il·lustres, Bond→Vincle/títol) | 2 | 1 | – |
| CALC (com a exhibint) | – | 1 | – |
| COHERÈNCIA (feedback/retroalimentació) | – | 1 | – |
| Total incidències | **3** | **6** | **0** |

---

## "Per què les reunions esgoten algunes persones més que d'altres: la neurociència" (`why-meetings-drain-some-people-more-than-others-neuroscience`)

### 7.1 «El marc neurociencífic fonamental» (secció Eysenck)
- Anglès: "The foundational neuroscientific framework"
- Català actual: «El marc neurociencífic fonamental per entendre per què...»
- Categoria: ERRADA (errata) · Gravetat ALTA
- Proposta: «El marc neurocientífic fonamental»
- Justificació: **neurociencífic** és una errata per **neurocientífic** (de *neurociència* + *científic*): falta la *t* i hi ha una *c* de més. Error ortogràfic en l'arrencada d'una secció clau.

### 7.2 «soroll, interacció social, demandes que competeixen per l'atenció» (secció Eysenck)
- Anglès: "noise, social interaction, competing demands on attention"
- Català actual: «soroll, interacció social, demandes que competeixen per l'atenció»
- Categoria: correcte · Gravetat —
- Justificació: *competing demands on attention* → «demandes que competeixen per l'atenció» és bona traducció (millor que el calc «demandes competidores»); es registra per descartar fals positiu.

### 7.3 «els introvertits mostren una activitat electrodermal més alta» (secció Eysenck)
- Anglès: "introverts show higher electrodermal activity"
- Català actual: «els introvertits mostren una activitat electrodermal més alta»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: «activitat electrodèrmica» (preferible) o «electrodermal»
- Justificació: en català mèdic la forma sufixada habitual és **-dèrmic** (epidèrmic, intradèrmic); «electrodèrmica» és més coherent amb el sistema derivatiu català que «electrodermal» (calc de l'anglès *electrodermal*). DNV/DIEC2 recullen «dèrmic». Baixa perquè «electrodermal» circula en literatura especialitzada.

### 7.4 «La fatiga de les videotrucades: com Zoom amplifica les diferències» (títol de secció)
- Anglès: "Video Call Fatigue: How Zoom Amplifies Personality Differences"
- Català actual: «La fatiga de les videotrucades: com Zoom amplifica les diferències de personalitat»
- Categoria: correcte · Gravetat —
- Justificació: «videotrucada» (DNV/TERMCAT) per *video call* i «fatiga» són correctes; es registra per descartar fals positiu. Coherent amb «fatiga de Zoom» més avall.

### 7.5 «les persones amb baixa Presència ja són més sensibles a la sobrecàrrega d'estimulació» (secció Zoom)
- Anglès: "low-Presence individuals are already more sensitive to stimulation overload"
- Català actual: «les persones amb baixa Presència ja són més sensibles a la sobrecàrrega d'estimulació»
- Categoria: correcte · Gravetat —
- Justificació: *stimulation overload* → «sobrecàrrega d'estimulació» correcte; bon ús de «ja» per *already*. Fals positiu descartat.

### 7.6 «r = 0,29» / «r = 0.22» (incoherència del separador decimal a la col·lecció)
- Anglès: "r = 0.29" (stat card)
- Català actual: «r = 0,29» (aquest article, coma decimal); altres articles del lot mantenen «r = 0.22», «r = 0.35» (punt decimal)
- Categoria: REGISTRE/COHERÈNCIA (convenció tipogràfica) · Gravetat BAIXA
- Proposta: unificar el separador decimal a la col·lecció. En català la convenció és la **coma decimal** («0,29»); per tant aquest article ho fa BÉ i són els altres (risc, crítiques) els que caldria corregir a coma. Com a mínim, cal coherència interna de la col·lecció.
- Justificació: la norma tipogràfica catalana (IEC; esADIR) usa la coma com a separador decimal. «r = 0,29» és correcte; el problema és la incoherència amb «r = 0.22»/«0.35» d'altres articles del lot (que conserven el punt anglès). Es registra com a alerta de coherència de col·lecció.

### 7.7 «automonitoratge» (seccions Zoom i Profunditat)
- Anglès: "self-monitoring"
- Català actual: «automonitoratge», «Automonitoratge elevat»
- Categoria: TERMINOLOGIA · Gravetat BAIXA
- Proposta: acceptable; alternativa més transparent «autocontrol/autovigilància» o «automonitoratge»
- Justificació: el prefix *auto-* aglutinat és correcte (com «autopercepció», «autoinforme»); «monitoratge» és recollit (DNV/TERMCAT). Forma vàlida; es registra només per coherència de la família «auto-» (que la col·lecció escriu bé, sense guionet).

### 7.8 «independentment de l'habilitat o la competència» (secció estimulació)
- Anglès: "independent of skill or competence"
- Català actual: «independentment de l'habilitat o la competència»
- Categoria: correcte · Gravetat —
- Justificació: «independentment de» per *independent of* és correcte (no és el calc sec «independentment» postposat criticat en l'auditoria 05-blog 4.7); aquí funciona com a locució prepositiva plena. Fals positiu descartat.

### 7.9 Tractament «tu» a la crida final
- Anglès: "Know Your Team's Presence Distribution..." / "gives you a peer-assessed Presence distribution for your team"
- Català actual: «Coneix la distribució de Presència del teu equip...»; «Cèrcol et dóna una distribució de Presència avaluada per parells per al teu equip»; «Un cop veus aquesta distribució»
- Categoria: REGISTRE/COHERÈNCIA (tractament) · Gravetat MITJANA
- Proposta: unificar a vós: «Coneixeu la distribució de Presència del vostre equip», «Cèrcol us dóna...», «Un cop veieu aquesta distribució».
- Justificació: brief → vós per a les adreces al lector. Aquest article usa «tu» (*coneix, el teu equip, et dóna, veus*). Cal regularitzar.

### 7.10 «temps mitjà en reunions dels gerents» (stat card) / «taxa sistemàticament» (crida)
- Anglès: "average meeting time for managers" / "systematically taxes low-Presence... ones"
- Català actual: «temps mitjà en reunions dels gerents»; «avantatge sistemàticament els perfils d'alta Presència i taxa sistemàticament els de baixa Presència»
- Categoria: AMBIGÜITAT/CALC · Gravetat MITJANA
- Proposta: «taxa» → «penalitza / grava / carrega»; «avantatge» (verb) → «afavoreix»
- Justificació: *to tax* en sentit figurat = «gravar», «penalitzar», «carregar»; **taxa** com a verb («taxa els perfils») és opac i es llegeix primer com el substantiu «taxa» (tarifa) — ambigüitat. Igualment *advantages* → «afavoreix» és més clar que «avantatge» usat com a verb (poc natural). Millora de claredat i de naturalesa verbal.

### Resum quantitatiu — Per què les reunions esgoten
| Categoria | ALTA | MITJANA | BAIXA |
|-----------|------|---------|-------|
| ERRADA (neurociencífic) | 1 | – | – |
| CALC/AMBIGÜITAT (taxa/avantatge com a verbs) | – | 1 | – |
| REGISTRE/COHERÈNCIA (tractament tu/vós, separador decimal) | – | 1 | 1 |
| TERMINOLOGIA (electrodermal, automonitoratge) | – | – | 2 |
| Total incidències | **1** | **2** | **3** |

---

## Recompte global de la col·lecció (100 articles)

Total d'**incidències reals** registrades (sense comptar els falsos positius, que
es marquen «correcte · Gravetat —» seguint la convenció de 05-blog.md):
**718** (246 ALTA · 305 MITJANA · 167 BAIXA).

| Gravetat | Nombre |
|----------|--------|
| ALTA | 246 |
| MITJANA | 305 |
| BAIXA | 167 |
| **Total** | **718** |

### Detall per article

| Article (slug) | ALTA | MITJANA | BAIXA | Total |
|----------------|------|---------|-------|-------|
| `16personalities-vs-big-five-the-viral-test-that-gets-it-half-right` | 0 | 1 | 1 | 2 |
| `disc-vs-big-five-why-four-styles-arent-enough` | 3 | 1 | 1 | 5 |
| `how-to-design-meetings-for-all-personality-types` | 1 | 3 | 3 | 7 |
| `personality-and-career-choice-what-big-five-predicts` | 2 | 2 | 1 | 5 |
| `personality-and-social-media-what-your-posts-reveal` | 3 | 1 | 2 | 6 |
| `product-manager-personality-what-works` | 3 | 4 | 1 | 8 |
| `trust-in-teams-personality-foundations` | 4 | 3 | 1 | 8 |
| `why-self-assessment-alone-isnt-enough-peer-personality-feedback` | 4 | 5 | 0 | 9 |
| `agreeableness-at-work-the-hidden-cost-of-being-too-nice` | 2 | 3 | 2 | 7 |
| `do-generational-differences-in-personality-actually-exist` | 1 | 3 | 4 | 8 |
| `how-to-give-personality-informed-feedback` | 3 | 3 | 1 | 7 |
| `personality-and-communication-style-direct-vs-diplomatic` | 2 | 3 | 0 | 5 |
| `personality-and-team-size-what-changes-as-teams-grow` | 2 | 3 | 1 | 6 |
| `remote-team-communication-styles-big-five` | 2 | 0 | 1 | 3 |
| `using-cercol-for-team-development-a-practical-guide` | 2 | 3 | 1 | 6 |
| `work-life-balance-personality-who-struggles-most` | 1 | 4 | 0 | 5 |
| `anonymity-in-personality-assessment-why-it-matters` | 3 | 2 | 0 | 5 |
| `do-personality-traits-change-over-a-lifetime` | 6 | 2 | 2 | 10 |
| `how-to-read-a-big-five-personality-report` | 3 | 3 | 1 | 7 |
| `personality-and-decision-making-how-big-five-shapes-judgment` | 3 | 2 | 2 | 7 |
| `personality-assessment-technology-future` | 2 | 2 | 1 | 5 |
| `retrospectives-personality-making-them-work` | 1 | 4 | 1 | 6 |
| `what-is-a-facet-in-personality-psychology` | 2 | 3 | 1 | 6 |
| `best-free-personality-tests-for-teams-2026` | 4 | 2 | 2 | 8 |
| `does-personality-composition-predict-team-performance` | 0 | 2 | 1 | 3 |
| `how-to-run-a-team-personality-workshop` | 3 | 2 | 1 | 6 |
| `personality-and-feedback-reception-why-some-people-reject-feedback` | 3 | 4 | 1 | 8 |
| `personality-coaching-using-big-five-as-development-tool` | 4 | 4 | 3 | 11 |
| `sales-personality-what-traits-predict-sales-performance` | 2 | 4 | 2 | 8 |
| `what-is-agreeableness-the-cooperative-dimension` | 6 | 5 | 0 | 11 |
| `big-five-personality-across-cultures-what-research-shows` | 1 | 3 | 3 | 7 |
| `five-personality-science-myths-that-wont-die` | 0 | 3 | 2 | 5 |
| `how-to-use-personality-data-without-labelling-people` | 4 | 2 | 1 | 7 |
| `personality-and-happiness-what-big-five-predicts` | 1 | 4 | 2 | 7 |
| `personality-conflict-in-teams-what-it-actually-looks-like` | 2 | 3 | 1 | 6 |
| `self-other-agreement-big-five-where-gaps-are-biggest` | 2 | 2 | 4 | 8 |
| `what-is-conscientiousness-the-most-consistent-predictor-of-job-performance` | 2 | 2 | 2 | 6 |
| `building-a-team-from-scratch-what-personality-data-can-and-cant-tell-you` | 4 | 1 | 2 | 7 |
| `forced-choice-personality-assessment-more-honest-data` | 2 | 2 | 1 | 5 |
| `innovation-culture-and-personality-what-companies-get-wrong` | 5 | 3 | 0 | 8 |
| `personality-and-job-fit-how-to-think-about-person-environment-fit` | 2 | 3 | 3 | 8 |
| `personality-diversity-in-technical-teams` | 4 | 1 | 1 | 6 |
| `should-you-hire-for-personality-fit-or-personality-diversity` | 1 | 4 | 0 | 5 |
| `what-is-extraversion-beyond-the-introvert-extrovert-binary` | 1 | 1 | 2 | 4 |
| `building-psychological-safety-personality-science` | 2 | 5 | 0 | 7 |
| `founder-ceo-transition-personality-perspective` | 3 | 5 | 2 | 10 |
| `introversion-energy-management-science` | 3 | 2 | 1 | 6 |
| `personality-and-leadership-styles-authoritative-coaching-democratic` | 3 | 2 | 2 | 7 |
| `personality-in-agile-teams-scrum-and-big-five` | 4 | 3 | 2 | 9 |
| `social-desirability-bias-personality-tests` | 0 | 4 | 4 | 8 |
| `what-is-neuroticism-understanding-emotional-depth-at-work` | 2 | 5 | 1 | 8 |
| `can-personality-be-changed-coaching-therapy-evidence` | 5 | 2 | 4 | 11 |
| `gender-and-personality-what-big-five-research-says` | 2 | 4 | 2 | 8 |
| `introverts-in-extrovert-workplaces-what-research-says` | 1 | 4 | 3 | 8 |
| `personality-and-learning-styles-what-research-supports` | 2 | 3 | 1 | 6 |
| `personality-of-entrepreneurs-what-research-says` | 4 | 5 | 1 | 10 |
| `software-engineer-personality-what-research-shows` | 6 | 2 | 3 | 11 |
| `what-is-openness-to-experience-creativity-curiosity-and-its-limits` | 2 | 3 | 4 | 9 |
| `can-you-fake-a-personality-test` | 5 | 4 | 0 | 9 |
| `groupthink-personality-causes-prevention` | 2 | 2 | 2 | 6 |
| `job-satisfaction-personality-what-predicts-it` | 4 | 3 | 1 | 8 |
| `personality-and-mentoring-what-makes-a-good-mentor` | 2 | 4 | 1 | 7 |
| `personality-of-successful-ceos-what-research-says` | 1 | 4 | 1 | 6 |
| `team-diversity-personality-and-performance` | 0 | 4 | 2 | 6 |
| `what-is-reliability-validity-in-personality-testing` | 0 | 3 | 2 | 5 |
| `co-founder-compatibility-personality-due-diligence` | 2 | 5 | 1 | 8 |
| `high-performing-team-structures-personality-perspective` | 2 | 2 | 2 | 6 |
| `low-agreeableness-in-leadership-when-directness-helps-and-when-it-harms` | 3 | 5 | 2 | 10 |
| `personality-and-motivation-what-drives-each-big-five-profile` | 3 | 2 | 4 | 9 |
| `team-failure-modes-personality-perspective` | 3 | 2 | 3 | 8 |
| `what-openness-to-experience-means-for-team-innovation` | 2 | 1 | 3 | 6 |
| `personality-science-evidence-based-hr-why-it-matters` | 6 | 8 | 3 | 17 |
| `conflict-resolution-styles-personality` | 1 | 2 | 1 | 4 |
| `history-of-the-big-five-from-allport-to-goldberg` | 4 | 0 | 1 | 5 |
| `mbti-vs-big-five-which-should-your-team-use` | 1 | 3 | 0 | 4 |
| `personality-and-negotiation-who-wins-and-why` | 3 | 2 | 1 | 6 |
| `personality-science-limits-what-it-cannot-predict` | 1 | 1 | 2 | 4 |
| `the-12-cercol-team-roles-explained` | 4 | 2 | 1 | 7 |
| `what-personality-traits-do-effective-leaders-actually-have` | 2 | 1 | 2 | 5 |
| `conscientiousness-perfectionism-when-discipline-becomes-a-problem` | 0 | 4 | 2 | 6 |
| `how-many-peer-assessors-do-you-need-reliable-personality-data` | 4 | 4 | 1 | 9 |
| `neurodiversity-and-personality-tests-what-to-know` | 1 | 6 | 2 | 9 |
| `personality-and-procrastination-what-research-says` | 3 | 2 | 0 | 5 |
| `personality-science-replication-crisis` | 2 | 4 | 1 | 7 |
| `the-dark-triad-at-work-narcissism-machiavellianism-psychopathy` | 4 | 8 | 0 | 12 |
| `what-the-cercol-witness-instrument-measures` | 3 | 5 | 0 | 8 |
| `creativity-and-personality-what-big-five-research-shows` | 2 | 3 | 3 | 8 |
| `how-personality-predicts-onboarding-success` | 3 | 2 | 2 | 7 |
| `neuroticism-stress-resilience-at-work` | 2 | 4 | 2 | 8 |
| `personality-and-remote-work-who-thrives-who-struggles` | 1 | 3 | 1 | 5 |
| `personality-testing-in-hiring-what-is-legal-what-is-ethical` | 4 | 3 | 2 | 9 |
| `the-vision-discipline-tension-innovation-vs-execution` | 3 | 2 | 1 | 6 |
| `why-120-items-is-better-than-10-personality-test-length` | 1 | 3 | 2 | 6 |
| `critiques-of-big-five-what-critics-say` | 1 | 6 | 4 | 11 |
| `how-personality-test-scores-are-calculated` | 1 | 4 | 4 | 9 |
| `personality-and-burnout-who-is-most-at-risk` | 3 | 4 | 4 | 11 |
| `personality-and-risk-taking-who-takes-risks-at-work` | 3 | 2 | 3 | 8 |
| `personality-testing-open-source-vs-commercial` | 3 | 2 | 3 | 8 |
| `too-agreeable-why-high-bond-teams-struggle-with-honest-feedback` | 3 | 6 | 0 | 9 |
| `why-meetings-drain-some-people-more-than-others-neuroscience` | 1 | 2 | 3 | 6 |

### Prioritats de correcció (per impacte)

1. **Unificar el tractament a vós** (T1) a tota la col·lecció: és el defecte més estès
   i afecta la coherència amb la resta de la plataforma.
2. **Netejar els artefactes de traducció automàtica** (T2, T3, T4): mots inexistents,
   anglès/castellà cru i errades de codificació. Són errors objectius i visibles.
3. **Fixar la terminologia tècnica** (T5 *psicomètric*, T6 *circumplex*, T8
   *desitjabilitat social* i noms de dimensió/rol de Cèrcol) amb un glossari únic.
4. **Corregir falsos amics i recció** (T7): *nombrar, accionable, mapejar, reclamacions,
   emergir* transitivat.
5. **Ortografia** (T9): apostrofació, *què*, concordança.
6. **Marca** (T10): eliminar *observador* i *Witness* en cru.
7. **Estil i tipografia** (T11): *a nivell de*, *Title Case*, decimals i €.

> **Recomanació de procés.** El volum i la naturalesa dels errors (T2) indiquen que
> aquests 100 articles es van traduir de manera massiva i automàtica **sense la revisió
> humana** que la metodologia de Cèrcol exigeix. Convé, a més de les correccions
> puntuals d'aquest informe, **posar el cos català sota control de versions**
> (exportar el camp `content.ca` de la BD al repositori, opció A de la §6 de
> l'informe mestre) i afegir una
> passa de revisió humana abans de tornar a publicar.
