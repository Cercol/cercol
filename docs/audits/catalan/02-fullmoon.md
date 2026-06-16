# Auditoria filològica — Cèrcol Full Moon (IPIP-NEO-120)

**Fitxer auditat:** `/home/user/cercol/src/data/full-moon.js`
**Abast:** 120 ítems · 5 dominis · 30 facetes (4 ítems/faceta) + metadades de facetes
**Auditor:** Filòleg sènior (model AVL/IEC convergent)
**Data:** 2026-06-15
**Llengua de l'informe:** valencià/català (sinònims absoluts en aquest document)

---

## 0. Metodologia i model de referència

- **Font de veritat:** sempre el camp `en` (ítems IPIP-NEO-120 validats, Johnson 2014). El
  català ha de reproduir el CONSTRUCTE psicològic, no la lletra.
- **Model lingüístic:** neutre, culte, supradialectal; només formes acceptades alhora per
  l'**AVL** (DNV/GNV) i l'**IEC** (DIEC2/GIEC). Quan AVL i IEC divergeixen en la forma
  preferent, es tria la solució compartida pel màxim de parlants.
- **Conflicte morfològic detectat amb el fitxer germà:** `first-quarter.js` usa la
  desinència **-e** de 1a persona del present d'indicatiu (model valencià: «Em preocup**e**»,
  id 1). `full-moon.js` és **internament incoherent**: la major part dels ítems usa **-o**
  (model central: «Em preocup**o**»), però una franja de la segona meitat torna a **-e**
  (vegeu §1 i la llista completa de §5). Aquesta barreja és el defecte estructural més greu
  del fitxer.

---

## 1. Defecte estructural prioritari — incoherència morfològica de 1a persona

**Categoria:** DISCREPÀNCIA · **Gravetat:** ALTA

El fitxer mescla dos models de conjugació de la 1a persona del singular del present
d'indicatiu (i del present de subjuntiu) DINS del mateix instrument:

- **Model -o (central):** ítems 1 «em preocup**o**», 5 «m'enrabi**o**», 6 «m'irrit**o**»,
  9 «em sent**o**», 17 «actu**o**», 18 «menj**o**», 19 «di**c**/dic», 41 «m'encanta»,
  43 «busc**o**», 45 «irradi**o**», 73 «confi**o**», 76 «desconfi**o**», 84 «menyspre**o**»,
  86 «insult**o**», 98... etc.; i les formes «perd**o**» (7, 116), «trenc**o**» (106),
  «menj**o**».
- **Model -e (valencià):** ítems 87 «m'aprofite» (de fet 88), 88 «m'aprofit**e**»,
  92 «presumeixo» (mixt incoatiu), 99 «arrib**e**», 102 «deix**e**», 104 «pos**e**»,
  109 «treball**e**», 110 «dediqu**e**», 113 «comenc**e**», 115 «em pos**e**»,
  117 «pens**e**», 118 «preng**a**» (subj.), 119 «sospes**e**», 120 «em llanc**e**»,
  98 «jutg**e**».

**Decisió obligatòria:** triar UN sol model i aplicar-lo a tot el fitxer **i** harmonitzar-lo
amb `first-quarter.js`. Atès que `first-quarter.js` ja està en **-e** (valencià) i que el
projecte té vocació valenciana (camp `valencian` a les metadades), la recomanació és
**unificar tot en model -e**: «em preocupe, m'enrabie, m'irrite, em sente/sent, actue,
menge, busque, irradie, confie, desconfie, menyspree, insulte, perde, trenque...». La
forma «di**c**» (id 19) és comuna als dos models i no canvia.

> Justificació: GIEC §I i GNV admeten ambdues desinències com a normatives, però la barreja
> dins un mateix test trenca l'homogeneïtat de registre i pot fer percebre errades de
> coherència; a més, per a un instrument psicomètric la variació formal no controlada
> introdueix soroll estilístic entre ítems que han de ser percebuts com a equivalents.
> (GIEC, cap. morfologia verbal; GNV de l'AVL, conjugació de la 1a persona.)

A continuació, totes les incidències per ítem. Les marcades amb [model] depenen de la
decisió de §1 i no es repeteixen una per una excepte quan hi ha un problema afegit.

---

## 2. Incidències per ítem

### DEPTH (Neuroticism) — faceta Vigil (Anxiety)

**id 1** · EN: "Worry about things." · CA: «Em preocupo per les coses.»
Categoria: DISCREPÀNCIA (model -o vs first-quarter -e) · Gravetat: ALTA
Proposta: «Em preocupe per les coses.» · Justificació: harmonització amb `first-quarter.js`
id 1 idèntic, que usa «Em preocupe». Cal que els ítems compartits entre instruments siguen
exactament iguals.

**id 2** · EN: "Fear for the worst." · CA: «Temo el pitjor.» · Correcte. (Model -e: «Tem el
pitjor» seria valencià, però «temo» és acceptat; depèn de §1.)

**id 3** · EN: "Am afraid of many things." · CA: «Tinc por de moltes coses.» · Correcte i
idiomàtic.

**id 4** · EN: "Don't worry about things." · CA: «No em preocupo per les coses.»
Igual que id 1 (parell reverse coherent). Aplicar mateix model. OK quant a contingut.

### Faceta Blaze (Angry Hostility)

**id 5** · EN: "Get angry easily." · CA: «M'enrabio amb facilitat.»
Categoria: REGISTRE/DISCREPÀNCIA · Gravetat: BAIXA
Observació: «enrabiar-se» és correcte i viu, però «em rab(i)e/m'enfade» és més neutre. Amb
model -e: «M'enrabie amb facilitat». Acceptable. Coherent amb id 8 (parell).

**id 6** · EN: "Get irritated easily." · CA: «M'irrito amb facilitat.» · Correcte. Model -e:
«M'irrite amb facilitat».

**id 7** · EN: "Lose my temper." · CA: «Perdo els nervis.»
Categoria: FIDELITAT/TERMINOLOGIA · Gravetat: BAIXA
Proposta: «Perd**o** els estreps» (o, amb model -e, «Perd els estreps»).
Justificació: «perdre els estreps» és la locució genuïna i lexicalitzada per a *lose one's
temper* (PCCD; DSFF *exaltar-se*); «perdre els nervis» és sinònim acceptat i transparent.
Mantenir «perdre els nervis» NO és errada, però «perdre els estreps» és més idiomàtic i
distingeix millor el constructe (ira/hostilitat) de l'ansietat. Gravetat baixa perquè ambdós
són correctes.

**id 8** · EN: "Am not easily annoyed." · CA: «No em molesto amb facilitat.»
Categoria: FIDELITAT · Gravetat: MITJANA
Proposta: «No m'irrite/moleste amb facilitat» o, millor per al constructe, «No m'enuge
fàcilment».
Justificació: aquest és el parell reverse de la faceta Blaze (ira). «Molestar-se» (=
ofendre's) s'allunya del nucli *annoyed* (irritació/enuig). Per a coherència lèxica amb id 6
(«irritar-se»), convindria «No m'irrite amb facilitat». Cal coherència intrafaceta entre
l'ítem directe i el revers.

### Faceta Hollow (Depression)

**id 9** · EN: "Often feel blue." · CA: «Sovint em sento trist/a.»
Categoria: FIDELITAT · Gravetat: BAIXA
Observació: *feel blue* = sentir-se abatut/decaigut/moix. «Trist» és correcte i segur;
«abatut» o «moix» recollirien millor el matís de desànim, però «trist» no és errada. OK.
Model -e: «Sovint em sent trist/a».

**id 10** · EN: "Dislike myself." · CA: «No m'agrado a mi mateix/a.»
Categoria: REDUNDÀNCIA/REGISTRE · Gravetat: BAIXA
Proposta: «No m'agrade a mi mateix/a» (model) o, més natural, «No m'agrado gens». El «a mi
mateix/a» és lleugerament redundant amb el pronom reflexiu, però aclareix; acceptable.

**id 11** · EN: "Am often down in the dumps." · CA: «Sovint em sento deprimit/da.»
Categoria: TERMINOLOGIA · Gravetat: MITJANA
Proposta: «Sovint estic moix/a» / «Sovint em sent enfonsat/da».
Justificació: *down in the dumps* és registre col·loquial = estar moix/de capa caiguda.
«Deprimit» introdueix un terme **clínic** (depressió, DSM-5) que NO correspon al to informal
de l'original i, a més, **duplica** el constructe amb «Hollow=Depression» fent l'ítem
gairebé tautològic amb el nom de la faceta. Convé un terme no clínic. (DSM-5 cat. reserva
«depressió» per al trastorn.)

**id 12** · EN: "Feel comfortable with myself." · CA: «Em sento còmode/a amb mi mateix/a.»
Correcte. Parell reverse coherent amb id 10. Model -e: «Em sent còmode/a...».

### Faceta Veil (Self-Consciousness)

**id 13** · EN: "Am easily embarrassed." · CA: «M'avergonyeixo amb facilitat.»
Categoria: DISCREPÀNCIA (incoatiu) · Gravetat: MITJANA
Observació: «avergonyir-se» és incoatiu. Model central: «m'avergony**eix**o»; model valencià:
«m'avergony**isc**». Cal fixar el patró incoatiu de tot el fitxer (vegeu també 31 «gaudeixo»,
46... 92 «presumeixo», 103, 105 «compleixo», 168). Recomanació coherent amb §1 (model -e/-isc
valencià): «m'avergonyisc amb facilitat».

**id 14** · EN: "Find it difficult to approach others." · CA: «Em costa apropar-me als
altres.»
Categoria: REGISTRE · Gravetat: BAIXA
Observació: «apropar-se» és normatiu (DIEC2/DNV). Variant supradialectal igualment vàlida:
«acostar-me». OK.

**id 15** · EN: "Am afraid to draw attention to myself." · CA: «Tinc por de cridar l'atenció
sobre mi.» · Correcte i idiomàtic.

**id 16** · EN: "Am comfortable in unfamiliar situations." · CA: «Em sento còmode/a en
situacions desconegudes.» · Correcte. (DA usa «tryg», però la font és EN.)

### Faceta Surge (Impulsiveness)

**id 17** · EN: "Act without thinking." · CA: «Actuo sense pensar.» · Correcte. Model -e:
«Actue sense pensar».

**id 18** · EN: "Often eat too much." · CA: «Sovint menjo en excés.» · Correcte i idiomàtic.

**id 19** · EN: "Say things without thinking." · CA: «Dic les coses sense pensar.»
Categoria: FIDELITAT · Gravetat: BAIXA
Observació: EN «Say things» (sense article) ≈ «Dic coses sense pensar». «les coses» afig una
determinació no present a l'original; matís mínim. Acceptable.

**id 20** · EN: "Rarely overindulge." · CA: «Rarament em deixo dur pels excessos.»
Categoria: ERRADA (gramatical) · Gravetat: ALTA
Proposta: «Rarament em deix**e** dur pels excessos» (model -e) o «Rarament em deix**o**
portar pels excessos» (model -o).
Justificació: amb model -o la forma correcta és «em deixo», no «em deixo dur» combinat amb la
desinència -o + infinitiu «dur»: aquí «em deixo dur» barreja desinència -o amb «dur», cosa
acceptable, però el verb principal hauria de concordar amb el model triat. A més, *overindulge*
= excedir-se/abusar; «deixar-se dur pels excessos» és vàlid («deixar-se dur/portar»,
Optimot), però és el parell reverse de Surge (impulsivitat amb el menjar/excessos). Coherent.
La incidència real és el **model verbal** «deixo» (-o) enmig de res; fixar segons §1.

### Faceta Fracture (Vulnerability)

**id 21** · EN: "Panic easily." · CA: «Em poso en pànic amb facilitat.»
Categoria: REGISTRE · Gravetat: BAIXA
Proposta: «M'espante fàcilment» o «Entre en pànic amb facilitat». «Posar-se en pànic» és
acceptable; model -e: «Em pose en pànic». OK.

**id 22** · EN: "Feel that I'm unable to deal with things." · CA: «Sento que soc
incapaç/incapaç de fer front a les coses.»
Categoria: ERRADA · Gravetat: ALTA
Proposta: «Sent/Sento que soc incapaç de fer front a les coses.»
Justificació: **DUPLICACIÓ TIPOGRÀFICA** evident: «incapaç/incapaç». «Incapaç» és invariable
en gènere (no té forma femenina diferenciada: *un home incapaç / una dona incapaç*), per
tant la barra de variació gènere sobra del tot. Eliminar «/incapaç». Errada objectiva.

**id 23** · EN: "Become overwhelmed by events." · CA: «Els esdeveniments em desborden.»
Categoria: FIDELITAT · Gravetat: BAIXA
Observació: bon gir idiomàtic (subjecte = events), fidel al constructe (sentir-se
desbordat). Alternativa més literal: «Em desborden els esdeveniments». OK.

**id 24** · EN: "Remain calm under pressure." · CA: «Em mantinc tranquil/la sota pressió.»
Categoria: REGISTRE · Gravetat: BAIXA
Observació: «sota pressió» és calc acceptat; «sota pressió» OK. Alternativa: «quan hi ha
pressió». Correcte.

### PRESENCE (Extraversion) — Faceta Hearth (Warmth)

**id 25** · EN: "Make friends easily." · CA: «Faig amics/amigues amb facilitat.» · Correcte.

**id 26** · EN: "Am hard to get to know." · CA: «Soc difícil de conèixer.» · Correcte.

**id 27** · EN: "Warm up quickly to others." · CA: «M'obro ràpidament als altres.»
Categoria: FIDELITAT/TERMINOLOGIA · Gravetat: MITJANA
Proposta: «Agafe confiança ràpidament amb els altres» / «Em mostre proper/a de seguida».
Justificació: *warm up to others* = agafar confiança / escalfar la relació; «obrir-se a algú»
desplaça el matís cap a *open up* (revelar-se). Recomanable un gir que capte el «to warm up».
Model -e si s'opta per «m'obro»→«m'obri».

**id 28** · EN: "Am distant with people." · CA: «Soc distant amb les persones.» · Correcte.
Parell reverse coherent amb id 26/27.

### Faceta Gather (Gregariousness)

**id 29** · EN: "Am the life of the party." · CA: «Soc l'ànima de la festa.»
Categoria: TERMINOLOGIA (consistència interna) · Gravetat: MITJANA
Observació: correcte i idiomàtic. PERÒ la metadada de faceta `radiance.valencian='Llum'` i
aquesta «ànima» no xoquen; el que cal vigilar és que id 30 (revers) usa «cridar l'atenció»,
igual que id 15 (faceta Veil) i id 89 (faceta Shadow). Vegeu §3 (solapament lèxic
inter-faceta). OK aquest ítem.

**id 30** · EN: "Don't like to draw attention to myself." · CA: «No m'agrada cridar l'atenció
sobre mi.» · Correcte. Vegeu §3 sobre repetició amb 15 i 89.

**id 31** · EN: "Enjoy being part of a group." · CA: «Gaudeixo de formar part d'un grup.»
Categoria: ERRADA (règim verbal) · Gravetat: MITJANA
Proposta: «Gaudisc/Gaudeixo formant part d'un grup» o «M'agrada formar part d'un grup».
Justificació: «gaudir DE + infinitiu» és discutible; el règim natural és «gaudir + gerundi»
o «gaudir d'una cosa» (substantiu). «Gaudeixo de formar part» calca l'anglès *enjoy +
-ing* amb una preposició forçada. Millor «Gaudisc formant part d'un grup» (model -isc/-e) o
«Gaudeixo formant part». (Optimot: *gaudir* + complement nominal o gerundi.)

**id 32** · EN: "Prefer to be alone." · CA: «Prefereixo estar sol/a.» · Correcte. Model -isc:
«Preferisc estar sol/a» (coherència amb §1).

### Faceta Command (Assertiveness)

**id 33** · EN: "Take charge." · CA: «Prenc les regnes.»
Categoria: FIDELITAT/ERRADA ortogràfica · Gravetat: BAIXA
Observació: «prendre les regnes» (no *regnes* amb sentit de regne; aquí «regnes» = brides)
és correcte i idiomàtic per *take charge*. Forma «prenc» és comuna. OK. Atenció: NO confondre
amb «regnes» de governar; la grafia coincideix però el significat (brides) és el correcte.

**id 34** · EN: "Wait for others to lead the way." · CA: «Espero que els altres prenguin la
iniciativa.»
Categoria: DISCREPÀNCIA (model) · Gravetat: MITJANA
Observació: «esper**o**» + subjuntiu «prengu**in**» (central). Model valencià: «Esper**e** que
els altres preng**uen** la iniciativa». Cal unificar segons §1; «prenguin/prenguen» és
marca dialectal de subjuntiu, harmonitzar amb la resta.

**id 35** · EN: "Try to lead others." · CA: «Intento liderar els altres.» · Correcte. Model
-e: «Intente liderar els altres». «Liderar» és normatiu (DNV/DIEC2).

**id 36** · EN: "Let others make the decisions." · CA: «Deixo que els altres prenguin les
decisions.»
Categoria: DISCREPÀNCIA (model) · Gravetat: MITJANA
Igual que id 34: «Deix**e** que els altres preng**uen** les decisions». Unificar subjuntiu i
desinència.

### Faceta Drive (Activity)

**id 37** · EN: "Am always busy." · CA: «Sempre estic ocupat/da.» · Correcte.

**id 38** · EN: "Like to take it easy." · CA: «M'agrada pendre-m'ho amb calma.»
Categoria: ERRADA (ortografia) · Gravetat: ALTA
Proposta: «M'agrada **prendre-m'ho** amb calma.»
Justificació: «**pendre**» és forma incorrecta/no normativa; la forma normativa és
**prendre** (amb -r-). Errada ortogràfica objectiva. (DIEC2/DNV: *prendre*.)

**id 39** · EN: "Am always on the go." · CA: «Sempre estic en moviment.» · Correcte i
idiomàtic.

**id 40** · EN: "Do things at a leisurely pace." · CA: «Faig les coses a un ritme pausat.»
Categoria: REGISTRE · Gravetat: BAIXA
Observació: «a un ritme pausat» correcte; alternativa «amb calma». OK.

### Faceta Thrill (Excitement-Seeking)

**id 41** · EN: "Love excitement." · CA: «M'encanta l'emoció.»
Categoria: TERMINOLOGIA · Gravetat: MITJANA
Proposta: «M'encanten les emocions fortes» / «M'encanta l'excitació».
Justificació: *excitement* (cerca de sensacions) ≠ *emotion* (Resonance, id 57). «L'emoció»
en singular pot llegir-se com a sentiment genèric i **solapa** amb la faceta Resonance
(Feelings). Per a la faceta Thrill (Vertigen / cerca de sensacions) cal el matís
d'«emocions fortes»/«excitació»/«estímul». Coherent amb id 43 «aventura».

**id 42** · EN: "Prefer quiet, peaceful settings." · CA: «Prefereixo entorns tranquils i
pacífics.»
Categoria: TERMINOLOGIA · Gravetat: BAIXA
Proposta: «...entorns tranquils i assossegats» / «...calmats».
Justificació: «pacífic» en català tendeix a 'no violent' (referit a persones/conductes);
per a *peaceful settings* (llocs) escau més «assossegat», «calmat» o «plàcid». Matís.

**id 43** · EN: "Seek adventure." · CA: «Busco l'aventura.» · Correcte. Model -e: «Busque
l'aventura».

**id 44** · EN: "Avoid dangerous situations." · CA: «Evito les situacions perilloses.»
Correcte. Model -e: «Evite les situacions perilloses».

### Faceta Radiance (Positive Emotions)

**id 45** · EN: "Radiate joy." · CA: «Irradio alegria.» · Correcte. Model -e: «Irradie
alegria».

**id 46** · EN: "Am not easily amused." · CA: «No m'entretinc amb facilitat.»
Categoria: FIDELITAT · Gravetat: MITJANA
Proposta: «No em divertisc/diverteixo amb facilitat» / «Costa fer-me riure».
Justificació: *be amused* = divertir-se/passar-ho bé/fer gràcia; «entretenir-se» = ocupar el
temps (ES/CAT 'distraerse'), matís diferent. A més, el parell directe id 47 usa «Ho passo
molt bé» i id 48 «alegre»; per coherència lèxica de faceta convé «divertir-se». L'ES paral·lel
ja diu «No me divierto».

**id 47** · EN: "Have a lot of fun." · CA: «Ho passo molt bé.» · Correcte i idiomàtic. Model
-e: «Ho passe molt bé».

**id 48** · EN: "Seldom feel joyful." · CA: «Rarament em sento alegre.» · Correcte. Model -e:
«Rarament em sent alegre».

### VISION (Openness) — Faceta Dream (Fantasy)

**id 49** · EN: "Have a vivid imagination." · CA: «Tinc una imaginació vívida.»
Categoria: REGISTRE · Gravetat: BAIXA
Observació: «vívid» és normatiu (DNV/DIEC2) però poc usual; alternativa més natural: «una
imaginació viva/desbordant». Acceptable.

**id 50** · EN: "Seldom daydream." · CA: «Rarament em perdo en somnis desperts.»
Categoria: REDUNDÀNCIA/REGISTRE · Gravetat: BAIXA
Proposta: «Rarament somie/somio despert/a» / «Rarament fantasieje».
Justificació: «perdre's en somnis desperts» és una perífrasi recarregada per a *daydream*
(somiar despert / somiquejar / fantasiejar). Simplificar. Model -e si escau.

**id 51** · EN: "Indulge in my fantasies." · CA: «M'abandono a les meves fantasies.»
Categoria: DISCREPÀNCIA (lèxic possessiu) · Gravetat: MITJANA
Observació: «les **meves** fantasies» (forma reforçada central) vs «les **meues**» que
apareix als ítems 87 «la meua voluntat», 92 «les meues virtuts». **Incoherència interna**
del possessiu femení plural: *meves* (id 51, 57, 60) vs *meues* (id 87, 92). Unificar.
Recomanació coherent amb model valencià: «meues». A més «m'abandono» → «m'abandone» (model).

**id 52** · EN: "Have difficulty imagining things." · CA: «Em costa imaginar coses.»
Correcte i natural.

### Faceta Craft (Aesthetics)

**id 53** · EN: "Believe in the importance of art." · CA: «Crec en la importància de l'art.»
Correcte.

**id 54** · EN: "Do not like art." · CA: «No m'agrada l'art.» · Correcte.

**id 55** · EN: "See beauty in things that others might not notice." · CA: «Veig bellesa en
coses que els altres potser no noten.» · Correcte i fidel.

**id 56** · EN: "Have no interest in poetry." · CA: «No tinc cap interès per la poesia.»
Correcte i idiomàtic.

### Faceta Resonance (Feelings)

**id 57** · EN: "Experience my emotions intensely." · CA: «Visc les meves emocions amb
intensitat.»
Categoria: DISCREPÀNCIA (possessiu) · Gravetat: BAIXA
Observació: «les **meves**» (vegeu id 51): unificar a «meues» si s'adopta model valencià.
Contingut correcte i fidel.

**id 58** · EN: "Don't understand people who get emotional." · CA: «No entenc les persones que
s'emocionen.» · Correcte i fidel.

**id 59** · EN: "Am passionate about causes I believe in." · CA: «Soc apassionat/da per les
causes en les quals crec.» · Correcte. (Variant supradialectal: «en què crec».)

**id 60** · EN: "Rarely notice my emotional reactions." · CA: «Rarament noto les meves
reaccions emocionals.»
Categoria: DISCREPÀNCIA (possessiu + model) · Gravetat: BAIXA
«not**o**» (-o) i «meves»: unificar amb §1 i §id51 → «Rarament not**e** les **meues**
reaccions emocionals».

### Faceta Drift (Actions)

**id 61** · EN: "Prefer variety to routine." · CA: «Prefereixo la varietat a la rutina.»
Correcte. Model -isc: «Preferisc...».

**id 62** · EN: "Prefer to stick with things that I know." · CA: «Prefereixo quedar-me amb el
que conec.» · Correcte i natural.

**id 63** · EN: "Like to visit new places." · CA: «M'agrada visitar llocs nous.» · Correcte.

**id 64** · EN: "Am a creature of habit." · CA: «Soc una persona de costums.»
Categoria: FIDELITAT · Gravetat: BAIXA
Observació: bona adaptació de *creature of habit*. Alternativa idiomàtica: «Soc un animal de
costums» (calc) — desaconsellable; «persona de costums» és més neutre. OK.

### Faceta Prism (Ideas)

**id 65** · EN: "Am quick to understand things." · CA: «Entenc les coses ràpidament.»
Correcte.

**id 66** · EN: "Have difficulty understanding abstract ideas." · CA: «Em costa entendre
idees abstractes.» · Correcte.

**id 67** · EN: "Enjoy thinking about things." · CA: «Gaudeixo reflexionant sobre les coses.»
Categoria: TERMINOLOGIA (coherència amb id 31) · Gravetat: BAIXA
Observació: ací «gaudeixo **reflexionant**» (gerundi, règim correcte) contrasta amb id 31
«gaudeixo **de** formar part» (règim discutible). Confirma que id 31 cal corregir per
coherència. Aquest ítem és correcte.

**id 68** · EN: "Avoid philosophical discussions." · CA: «Evito les discussions
filosòfiques.»
Categoria: TERMINOLOGIA · Gravetat: BAIXA
Observació: *discussions* aquí = converses/debats, no «discussions» (=baralles). En català
«discussió» admet ambdós sentits, però per evitar AMBIGÜITAT (baralla) es podria usar
«debats filosòfics». Matís. Model -e: «Evite...».

### Faceta Compass (Values)

**id 69** · EN: "Believe that there is no absolute right or wrong." · CA: «Crec que no
existeix un bé o un mal absoluts.» · Correcte. Concordança «absoluts» (referit als dos)
acceptable.

**id 70** · EN: "Tend to vote for conservative political candidates." · CA: «Tendeixo a votar
per candidats/tes polítics/ques conservadors/es.»
Categoria: ERRADA (desajust EN↔CA) + REGISTRE · Gravetat: ALTA
Observació 1 (registre/abreujament): la triple barra de gènere «candidats/tes
polítics/ques conservadors/es» és **tipogràficament feixuga i de lectura difícil**; a més
«/tes» és una abreujament incorrecte (femení de «candidats» és «candidates», no «-tes»).
Proposta: reformular sense desdoblament, p. ex. «Acostume a votar opcions polítiques
conservadores» o «Tendisc a votar candidatures conservadores».
Observació 2 (CRÍTICA — desajust de traducció en altres llengües): el camp **DE** d'aquest
ítem diu «Ser mig selv som overvejende konservativ politisk» que és **danès**, no alemany, i
a més no tradueix l'original sinó l'ítem reformulat de l'IPIP. Tot i que fora d'abast (camp
`de`/`da`), es deixa constància perquè afecta la integritat de l'ítem. El **ca** és, però,
fidel a l'EN. Prioritat de l'auditoria catalana: simplificar el desdoblament.

**id 71** · EN: "Believe that we should be lenient in judging others." · CA: «Crec que hem de
ser indulgents en jutjar els altres.»
Categoria: REGISTRE · Gravetat: BAIXA
Observació: «en jutjar» (gerundi/infinitiu temporal) correcte; alternativa més clara «a
l'hora de jutjar els altres». OK. «Indulgents» = *lenient*, bona tria terminològica.

**id 72** · EN: "Believe in one true religion." · CA: «Crec en una sola religió vertadera.»
Correcte. «Vertadera» (DNV) = «veritable» (DIEC2), ambdues normatives; «vertadera» és
solució compartida valenciana. OK.

### BOND (Agreeableness) — Faceta Faith (Trust)

**id 73** · EN: "Trust others." · CA: «Confio en els altres.» · Correcte. Model -e: «Confie».

**id 74** · EN: "Suspect hidden motives in others." · CA: «Sospito de les motivacions ocultes
dels altres.»
Categoria: TERMINOLOGIA · Gravetat: BAIXA
Observació: *motives* psicològic = «motius»/«motivacions»; «motivacions ocultes» és correcte.
Alternativa: «segones intencions» (molt idiomàtic per *hidden motives*). Recomanable per
naturalitat: «Sospite que els altres tenen segones intencions».

**id 75** · EN: "Believe that others have good intentions." · CA: «Crec que els altres tenen
bones intencions.» · Correcte. Parell coherent amb id 74 si s'adopta «intencions».

**id 76** · EN: "Distrust people." · CA: «Desconfio de les persones.» · Correcte. Model -e:
«Desconfie de les persones».

### Faceta Edge (Straightforwardness)

**id 77** · EN: "Don't beat around the bush." · CA: «No m'embarbusso.»
Categoria: ERRADA (semàntica greu) · Gravetat: ALTA
Proposta: «No me'n vaig amb embuts» / «No faig voltes» / «Vaig al gra».
Justificació: **«embarbussar-se» NO significa 'anar amb embuts/rodejos'**; significa
**entrebancar-se en parlar / travar-se amb la llengua** (d'ací «embarbussament» =
*tongue-twister*). És una **falsa equivalència** per semblança fònica amb «embuts». El
constructe *beat around the bush* (Straightforwardness = ser directe) demana «anar amb
embuts», «fer voltes», «anar-se'n per les branques» o «vaig al gra». Errada objectiva i
**inversió del significat** (un que s'embarbussa NO és directe). Correcció obligatòria.
(DCVB/DNV: *embarbussar-se* = travar-se en parlar.)

**id 78** · EN: "Use flattery to get ahead." · CA: «Faig servir l'adulació per progressar.»
Categoria: REGISTRE · Gravetat: BAIXA
Observació: correcte. Alternativa més natural: «Use l'afalac per...». «Adulació» és culte i
vàlid. OK.

**id 79** · EN: "Tell the truth." · CA: «Dic la veritat.» · Correcte.

**id 80** · EN: "Pretend to be concerned for others." · CA: «Finjo preocupar-me pels altres.»
Categoria: DISCREPÀNCIA (model) · Gravetat: BAIXA
Observació: «finj**o**» (-o). Model -e/-isc: «**Fingisc** preocupar-me pels altres» (fingir és
incoatiu en valencià: «fingisc»). Unificar. Contingut fidel.

### Faceta Gift (Altruism)

**id 81** · EN: "Make people feel welcome." · CA: «Faig que la gent se senti benvinguda.»
Categoria: DISCREPÀNCIA (model subjuntiu) · Gravetat: BAIXA
Observació: «se sent**i**» (subj. central) vs valencià «se sent**a**». Unificar segons §1:
«Faig que la gent se senta benvinguda». Contingut correcte.

**id 82** · EN: "Am indifferent to the feelings of others." · CA: «Soc indiferent als
sentiments dels altres.» · Correcte.

**id 83** · EN: "Anticipate the needs of others." · CA: «M'anticipo a les necessitats dels
altres.» · Correcte. Model -e: «M'anticipe...».

**id 84** · EN: "Look down on others." · CA: «Menyspreo els altres.»
Categoria: FIDELITAT · Gravetat: BAIXA
Observació: *look down on* = mirar per damunt l'espatla / menysprear. «Menysprear» captura
el sentit; bona tria. Model -e: «Menypree» (compte: «menyspree», amb -ee). OK.

### Faceta Yield (Compliance)

**id 85** · EN: "Hate to seem pushy." · CA: «M'incomoda semblar insistent.»
Categoria: FIDELITAT · Gravetat: MITJANA
Proposta: «Detesto/Deteste semblar insistent» / «No suporte semblar insistent».
Justificació: *hate to* és fort (detestar); «m'incomoda» rebaixa la intensitat. A més, els
paral·lels ES «Me disgusta», FR «Déteste» divergeixen entre si; el FR captura millor *hate*.
Per a fidelitat al constructe (aversió a imposar-se) cal un verb més intens que «incomodar».
«Pushy» = insistent/aclaparador; «insistent» OK.

**id 86** · EN: "Insult people." · CA: «Insulto les persones.» · Correcte. Model -e:
«Insulte les persones».

**id 87** · EN: "Avoid imposing my will on others." · CA: «Evito imposar la meua voluntat als
altres.»
Categoria: DISCREPÀNCIA (model + possessiu) · Gravetat: BAIXA
Observació: ací «la **meua** voluntat» (valencià) conviu amb «evit**o**» (central). Doble
incoherència: el possessiu «meua» és valencià però la desinència «evito» és central. Confirma
la barreja de models de §1. Unificar tot (recom.: «Evite imposar la meua voluntat als
altres»).

**id 88** · EN: "Take advantage of others." · CA: «M'aprofite dels altres.»
Categoria: DISCREPÀNCIA (model) · Gravetat: BAIXA
Observació: «m'aprofit**e**» (valencià) — aquí SÍ en -e, mentre que id 83 «m'anticip**o**» va
en -o. Demostra la incoherència. Contingut correcte.

### Faceta Shadow (Modesty)

**id 89** · EN: "Dislike being the center of attention." · CA: «No m'agrada ser el centre
d'atenció.»
Categoria: AMBIGÜITAT/REDUNDÀNCIA inter-ítem · Gravetat: BAIXA
Observació: solapament temàtic amb id 15 «cridar l'atenció», id 30 «cridar l'atenció».
«Centre d'atenció» vs «cridar l'atenció»: distinció acceptable. Vegeu §3. Correcte.

**id 90** · EN: "Think highly of myself." · CA: «Tinc un alt concepte de mi mateix/a.»
Correcte i idiomàtic.

**id 91** · EN: "Dislike talking about myself." · CA: «No m'agrada parlar de mi mateix/a.»
Correcte.

**id 92** · EN: "Boast about my virtues." · CA: «Presumeixo de les meues virtuts.»
Categoria: DISCREPÀNCIA (incoatiu + possessiu) · Gravetat: BAIXA
Observació: «presum**eix**o» (incoatiu central) + «meues» (possessiu valencià) = barreja de
models en un mateix ítem. Valencià coherent: «**Presumisc** de les meues virtuts». Unificar.

### Faceta Shield (Tender-Mindedness)

**id 93** · EN: "Sympathize with the homeless." · CA: «Em compadeixo de les persones sense
llar.»
Categoria: TERMINOLOGIA · Gravetat: BAIXA
Observació: *sympathize* = compadir-se / sentir empatia. «Compadir-se» pot tindre matís de
condescendència; alternativa «Sent empatia per les persones sense llar». Acceptable. Model
incoatiu: «em compadisc».

**id 94** · EN: "Believe in an eye for an eye." · CA: «Crec en ull per ull.»
Categoria: REGISTRE · Gravetat: BAIXA
Observació: la dita completa és «ull per ull, dent per dent». «Ull per ull» tot sol és
comprensible però truncat. Acceptable per economia; opcional completar. OK.

**id 95** · EN: "Suffer from others' sorrows." · CA: «Sofreixo amb les penes dels altres.»
Categoria: DISCREPÀNCIA (incoatiu) · Gravetat: BAIXA
Observació: «sofr**eix**o»; valencià «**patisc**/sofrisc». A més «sofrir» vs «patir»: «patir»
és més neutre i usual. Proposta: «Patisc amb les penes dels altres». Unificar incoatiu.

**id 96** · EN: "Am not interested in other people's problems." · CA: «No m'interessen els
problemes dels altres.» · Correcte i natural.

### DISCIPLINE (Conscientiousness) — Faceta Mastery (Competence)

**id 97** · EN: "Handle tasks efficiently." · CA: «Resolc les tasques amb eficàcia.»
Categoria: FIDELITAT · Gravetat: BAIXA
Observació: *handle* = gestionar/manejar; «resoldre» és més fort (implica èxit) però
acceptable per al constructe de Competence. ES paral·lel també «Resuelvo». OK.

**id 98** · EN: "Misjudge situations." · CA: «Jutge malament les situacions.»
Categoria: DISCREPÀNCIA (model) · Gravetat: BAIXA
Observació: «jutg**e**» (valencià -e) enmig de la franja central. *Misjudge* = valorar/jutjar
malament; correcte. Unificar model (en model central seria «jutjo»).

**id 99** · EN: "Come prepared." · CA: «Arribe preparat/da.»
Categoria: DISCREPÀNCIA (model) · Gravetat: BAIXA
Observació: «arrib**e**» (-e valencià). *Come prepared* = arribar/presentar-se preparat;
correcte. Coherent amb model -e; xoca amb la franja -o anterior.

**id 100** · EN: "Don't know how to get things done." · CA: «No sé com tirar les coses
endavant.»
Categoria: REGISTRE · Gravetat: BAIXA
Observació: «tirar les coses endavant» idiomàtic i bo per *get things done*. Alternativa
«traure les coses endavant». OK.

### Faceta Structure (Order)

**id 101** · EN: "Like order." · CA: «M'agrada l'ordre.» · Correcte.

**id 102** · EN: "Leave a mess in my room." · CA: «Deixe la meva habitació desordenada.»
Categoria: DISCREPÀNCIA (model + possessiu) · Gravetat: MITJANA
Observació: «deix**e**» (valencià -e) + «la **meva** habitació» (possessiu central). **Barreja
en un mateix ítem**: desinència valenciana però possessiu central. Coherent seria «Deixe la
**meua** habitació desordenada». Incoherència interna clara.

**id 103** · EN: "Keep things tidy." · CA: «Mantinc les coses ordenades.» · Correcte.

**id 104** · EN: "Fail to put things back in their proper place." · CA: «No pose les coses al
seu lloc.»
Categoria: DISCREPÀNCIA (model) + FIDELITAT · Gravetat: BAIXA
Observació: «pos**e**» (valencià). *Fail to put back* matisa el «back» (tornar a posar); «No
torne a posar les coses al seu lloc» seria més literal, però «No pose les coses al seu lloc»
és prou fidel. Model coherent -e.

### Faceta Oath (Dutifulness)

**id 105** · EN: "Keep my promises." · CA: «Compleixo les meves promeses.»
Categoria: DISCREPÀNCIA (incoatiu + possessiu) · Gravetat: BAIXA
Observació: «compl**eix**o» (central) + «meves». Valencià: «**Complisc** les meues promeses».
Unificar.

**id 106** · EN: "Break rules." · CA: «Trenco les normes.»
Categoria: DISCREPÀNCIA (model) + TERMINOLOGIA · Gravetat: BAIXA
Observació: «trenc**o**» (-o). *Break rules* = infringir/saltar-se les normes; «trencar les
normes» és calc acceptat però «infringir/saltar-se» és més precís. Model -e: «Trenque». OK.

**id 107** · EN: "Do my duty." · CA: «Compleixo amb el meu deure.»
Categoria: REDUNDÀNCIA · Gravetat: BAIXA
Observació: «complir AMB el meu deure»: el règim preferit és «complir el deure» (transitiu),
sense «amb». «Complir amb» és calc del castellà *cumplir con*. Proposta: «Compleixo/Complisc
el meu deure». (Optimot: *complir una obligació*, sense preposició.)

**id 108** · EN: "Do the opposite of what is asked." · CA: «Faig el contrari del que se me
demana.»
Categoria: ERRADA (pronom) · Gravetat: MITJANA
Proposta: «Faig el contrari del que **em** demanen» o «...del que **se'm** demana».
Justificació: «se me demana» és combinació pronominal incorrecta/castellanitzada; en català
la forma normativa és «se'm demana» (amb elisió i guionet) o, millor, evitar la passiva
reflexa: «del que em demanen». «se me» juxtaposat no és normatiu. (GIEC, combinacions de
pronoms febles.)

### Faceta Quest (Achievement Striving)

**id 109** · EN: "Work hard." · CA: «Treballe dur.»
Categoria: DISCREPÀNCIA (model) · Gravetat: BAIXA
Observació: «treball**e**» (-e). «Treballar dur» calc lleu; alternativa «Treballe de valent /
molt». Acceptable.

**id 110** · EN: "Put little time and effort into my work." · CA: «Dedique poc temps i esforç
al meu treball.» · Correcte. Model -e coherent.

**id 111** · EN: "Do more than expected." · CA: «Faig més del que s'espera.» · Correcte.

**id 112** · EN: "Give up easily." · CA: «Em rende amb facilitat.»
Categoria: DISCREPÀNCIA (model) · Gravetat: BAIXA
Observació: «em rend**e**» (valencià de «rendir-se»). *Give up* = rendir-se/desistir; correcte.
Coherent amb model -e.

### Faceta Will (Self-Discipline)

**id 113** · EN: "Get started on things right away." · CA: «Comence les coses de seguida.»
Correcte. Model -e coherent.

**id 114** · EN: "Have difficulty starting tasks." · CA: «Em costa començar les tasques.»
Correcte. Idèntic a `first-quarter.js` id 58 — bona coherència inter-fitxer (en aquest cas
SÍ coincideixen).

**id 115** · EN: "Get to work at once." · CA: «Em pose a treballar de seguida.» · Correcte.
Model -e.

**id 116** · EN: "Waste my time." · CA: «Perdo el temps.»
Categoria: DISCREPÀNCIA (model) · Gravetat: BAIXA
Observació: «perd**o**» (-o), enmig de la franja -e (113, 115). Model coherent: «Perd el
temps». *Waste my time* OK.

### Faceta Counsel (Deliberation)

**id 117** · EN: "Think before I speak." · CA: «Pense abans de parlar.» · Correcte. Model -e.

**id 118** · EN: "Make hasty decisions." · CA: «Prenga decisions precipitades.»
Categoria: ERRADA (forma verbal) · Gravetat: ALTA
Proposta: «Pren**c**/Pren**e** decisions precipitades.»
Justificació: «**prenga**» és **present de SUBJUNTIU** («que jo prenga»), no present
d'indicatiu. L'ítem és una afirmació en indicatiu («faig X»): cal «prenc» (central) o
«prene» (valencià indicatiu), NO «prenga». Errada de mode verbal objectiva.

**id 119** · EN: "Weigh the pros and cons." · CA: «Sospese els pros i els contres.»
Correcte. Model -e («sospese» de «sospesar»). OK.

**id 120** · EN: "Rush into things." · CA: «Em llance a les coses sense pensar.»
Categoria: REDUNDÀNCIA · Gravetat: BAIXA
Observació: «sense pensar» afig una glossa no present a *rush into things*; a més
**duplica** el contingut de id 17/19 («sense pensar»). *Rush into* = llançar-se/precipitar-se;
«Em llance a les coses» o «Em precipite» ja basta. El revers de Counsel (Deliberation) és
precipitar-se, no «no pensar» (que és Surge/impulsivitat). Recomanable llevar «sense pensar»
per evitar solapament inter-faceta i redundància.

---

## 3. Solapaments lèxics inter-faceta (coherència de discriminació)

Per a un instrument de 30 facetes, ítems de facetes diferents que comparteixen exactament la
mateixa expressió poden reduir la discriminació percebuda:

- «cridar l'atenció (sobre mi)»: id 15 (Veil), id 30 (Gather), tema afí a id 89 (Shadow,
  «centre d'atenció»). Acceptable perquè l'EN també repeteix *draw attention*, però convé
  vigilar que el matís entre Veil (por), Gather (no agradar) i Shadow (modèstia) quede clar.
- «sense pensar»: id 17, 19 (Surge) i id 120 (Counsel). Recomanat llevar-lo de id 120 (§2).
- «emoció/emocions»: id 41 (Thrill) vs facet Resonance (57-60). Recomanat «emocions fortes»
  a id 41 per evitar solapament (§2).

---

## 4. Coherència de parells reverse/non-reverse dins faceta (lèxic)

Revisió de si l'ítem directe i el seu revers usen lèxic coherent:

- Blaze: id 6 «irritar-se» vs id 8 «molestar-se» → **incoherent**, unificar (§2 id 8).
- Radiance: id 47 «passar-ho bé» / id 48 «alegre» vs id 46 «entretenir-se» → **incoherent**,
  id 46 hauria d'usar «divertir-se» (§2 id 46).
- Faith: id 74 «motivacions ocultes» vs id 75 «intencions» → lleugera asimetria lèxica;
  harmonitzar a «intencions/segones intencions».
- Surge, Hearth, Command, Drive, Thrill, Gift, Shadow, Structure, Quest, Will, Counsel:
  parells lèxicament coherents (cap incidència rellevant més enllà del model verbal).

---

## 5. Llista completa de formes verbals de 1a persona del singular usades

(Indicatiu present excepte indicació; entre claudàtors el model que delaten.)

**Formes en -o (model central):**
preocupo (1, 4), enrabio (5), irrito (6), perdo (7, 116), sento/em sento (9, 12, 16, 48),
agrado (10), actuo (17), menjo (18), dico→«dic» (19, 79; comuna), deixo (20, 36),
poso/em poso (21), busco (43), evito (44, 68), irradio (45), entretinc (46), passo→«ho
passo» (47), abandono (51), visc (57; comuna), noto (60), prefereixo (32, 42, 61),
gaudeixo (31, 67) [incoatiu central], confio (73), desconfio (76), espero (34), intento (35),
finjo (80), anticipo (83), menyspreo (84), insulto (86), evito (87), sofreixo (95) [incoatiu],
compleixo (105, 107) [incoatiu], trenco (106), presumeixo (92) [incoatiu], compadeixo (93)
[incoatiu], m'avergonyeixo (13) [incoatiu], m'obro (27), m'encanta (41), tinc (3, 49, 56, 90),
faig (25, 81, 108, 111), soc (22, 26, 28, 29, 59, 64, 82), crec (53, 69, 71, 72, 75, 94),
veig (55), entenc (65), resolc (97), mantinc (103), prenc (33).

**Formes en -e (model valencià):**
aprofite/m'aprofite (88), arribe (99), jutge (98), pose/em pose (104, 115), deixe (102),
treballe (109), dedique (110), comence (113), pense (117), sospese (119), llance/em llance
(120), rende/em rende (112).

**Possessius femenins plurals:** «meves» (51, 57, 60, 105) [central] vs «meues» (87, 92)
[valencià] · femení singular «meua» (87) vs «meva» (102) → **incoherència**.

**Subjuntius dialectals:** «prenguin» (34, 36) [central] · «senti» (81) [central] ·
«prenga» (118) [ERRADA: usat com a indicatiu].

**Conclusió morfològica:** el fitxer és **bimodal i incoherent**. Predomini de **-o** en la
primera meitat (ítems 1-92 aprox.) i aparició sistemàtica de **-e** a la franja
DISCIPLINE/Yield (88, 98-120). `first-quarter.js` és **-e** consistent. Cal una passada
d'unificació total (recomanació: model -e/-isc valencià per a tot el projecte).

---

## 6. Resum quantitatiu

**Total ítems auditats:** 120 (+ 30 metadades de faceta, sense incidència de traducció).

| Categoria | Incidències | ALTA | MITJANA | BAIXA |
|---|---|---|---|---|
| ERRADA (objectiva) | 6 | 5 | 1 | 0 |
| DISCREPÀNCIA (model intern/inter-fitxer) | ~30 ítems afectats | 1 (estructural) | 6 | 23 |
| TERMINOLOGIA | 9 | 0 | 4 | 5 |
| FIDELITAT | 9 | 0 | 3 | 6 |
| REGISTRE | 11 | 0 | 0 | 11 |
| REDUNDÀNCIA | 4 | 0 | 0 | 4 |
| AMBIGÜITAT | 2 | 0 | 0 | 2 |

**Errades objectives (prioritat màxima de correcció):**
1. **id 77** — «No m'embarbusso» = inversió/falsa equivalència semàntica (ALTA).
2. **id 22** — «incapaç/incapaç» duplicació tipogràfica (ALTA).
3. **id 38** — «pendre» per «prendre», ortografia (ALTA).
4. **id 118** — «prenga» (subjuntiu) per indicatiu (ALTA).
5. **id 70** — desdoblament «/tes» mal format + camp `de` en danès (ALTA; el `de` fora
   d'abast però documentat).
6. **id 108** — «se me demana» per «se'm demana / em demanen» (MITJANA).
7. **id 107** — «complir amb» calc per «complir» (BAIXA).
8. **id 31** — «gaudir de + infinitiu» règim discutible (MITJANA).

**Defecte estructural únic i transversal:** incoherència del model de 1a persona (-o vs -e),
de l'incoatiu (-eix- vs -isc-), del possessiu (meves/meva vs meues/meua) i del subjuntiu
(-in vs -en), tant dins `full-moon.js` com respecte de `first-quarter.js`. Resolució: una
sola passada d'homogeneïtzació a model valencià (-e / -isc / meua-meues / -en).

**Ítems sense cap incidència rellevant:** 2, 3, 23, 25, 26, 28, 37, 39, 52, 53, 54, 55, 56,
62, 63, 65, 66, 79, 82, 90, 91, 96, 101, 103, 111 (correctes de contingut; alguns afectats
només pel model verbal global).

---

## 7. Fonts consultades

- DCVB / DNV (AVL): *embarbussar-se* = travar-se/entrebancar-se en parlar (base de la
  correcció de id 77).
- PCCD (Paremiologia Catalana Comparada Digital) i DSFF (M. T. Espinal): *perdre els
  estreps* / *perdre els nervis* com a locucions sinònimes per *lose one's temper* (id 7).
- Optimot (Generalitat de Catalunya): *deixar-se dur/portar per* (id 20); *complir una
  obligació* sense preposició (id 107); règim de *gaudir* (id 31).
- GIEC (IEC) i GNV (AVL): morfologia verbal de 1a persona (-o/-e), incoatius (-eix-/-isc-),
  combinacions de pronoms febles «se'm» (id 108); modes indicatiu/subjuntiu (id 118).
- DIEC2 / DNV: *prendre* (id 38), *vertader/veritable* (id 72), *liderar*, *vívid*.
