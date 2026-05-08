#!/usr/bin/env python3
"""Update blog post 1: Big Five vs DISC vs Belbin — enriched EN + full translations."""
import asyncio, asyncpg, json, os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://cercol:cercol_db_2026@localhost:5432/cercol")

SVG_OCEAN = """\
<figure style="text-align:center;margin:2rem 0">
<svg width="520" height="90" viewBox="0 0 520 90" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:8px;background:#f0f4ff">
  <rect x="8" y="26" width="90" height="54" fill="#0047ba" rx="5"/>
  <text x="53" y="46" font-size="10" fill="white" text-anchor="middle" font-weight="bold">Openness</text>
  <text x="53" y="59" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">(Vision)</text>
  <text x="53" y="73" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Curiosity · Ideas</text>
  <rect x="108" y="26" width="110" height="54" fill="#427c42" rx="5"/>
  <text x="163" y="46" font-size="10" fill="white" text-anchor="middle" font-weight="bold">Conscientiousness</text>
  <text x="163" y="59" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">(Discipline)</text>
  <text x="163" y="73" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Order · Reliability</text>
  <rect x="228" y="26" width="95" height="54" fill="#cf3339" rx="5"/>
  <text x="275" y="46" font-size="10" fill="white" text-anchor="middle" font-weight="bold">Extraversion</text>
  <text x="275" y="59" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">(Presence)</text>
  <text x="275" y="73" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Energy · Initiative</text>
  <rect x="333" y="26" width="100" height="54" fill="#f1c22f" rx="5"/>
  <text x="383" y="46" font-size="10" fill="#333" text-anchor="middle" font-weight="bold">Agreeableness</text>
  <text x="383" y="59" font-size="9" fill="#555" text-anchor="middle">(Bond)</text>
  <text x="383" y="73" font-size="8" fill="#666" text-anchor="middle">Trust · Warmth</text>
  <rect x="443" y="26" width="72" height="54" fill="#6b7280" rx="5"/>
  <text x="479" y="46" font-size="10" fill="white" text-anchor="middle" font-weight="bold">Neuroticism</text>
  <text x="479" y="59" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">(Depth)</text>
  <text x="479" y="73" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Sensitivity</text>
</svg>
<figcaption style="font-size:0.8rem;color:#6b7280;margin-top:0.5rem">{caption}</figcaption>
</figure>"""

CAPTIONS = {
    "en": "The Big Five (OCEAN) — five statistically independent dimensions of personality, identified through 50+ years of cross-cultural research using the public-domain IPIP instrument.",
    "ca": "El Big Five (OCEAN) — cinc dimensions estadísticament independents de personalitat, identificades en 50+ anys d'investigació transcultural amb l'instrument de domini públic IPIP.",
    "es": "El Big Five (OCEAN) — cinco dimensiones estadísticamente independientes de personalidad, identificadas en 50+ años de investigación transcultural con el instrumento de dominio público IPIP.",
    "fr": "Le Big Five (OCEAN) — cinq dimensions statistiquement indépendantes de la personnalité, identifiées au travers de 50+ années de recherche transculturelle avec l'instrument IPIP en domaine public.",
    "de": "Das Big Five-Modell (OCEAN) — fünf statistisch unabhängige Persönlichkeitsdimensionen, identifiziert in über 50 Jahren transkultureller Forschung mit dem gemeinfreien IPIP-Instrument.",
    "da": "Big Five (OCEAN) — fem statistisk uafhængige personlighedsdimensioner, identificeret i 50+ år med tværkulturel forskning ved hjælp af det offentlige IPIP-instrument.",
}

def svg(lang):
    return SVG_OCEAN.format(caption=CAPTIONS[lang])

CONTENT = {
    "en": f"""\
Three frameworks dominate personality assessment in organisations. Understanding their differences — honestly, without vendor bias — matters for making informed decisions about which tool to use and why.

{svg("en")}

## Scientific foundations at a glance

| Feature | Big Five (IPIP) | DISC | Belbin Team Roles |
|---------|----------------|------|-------------------|
| Foundation | Factor analysis, 1960s–present | Marston's 1928 behavioural theory | Observational research, 1970s |
| Independent peer-reviewed validation | Extensive (thousands of studies) | Limited (mostly proprietary) | Moderate (mixed findings) |
| Public domain | ✅ Yes — [IPIP](https://ipip.ori.org) | ❌ Proprietary | ❌ Proprietary |
| Cross-cultural replication | ✅ 50+ countries | Partial | Limited |
| Maps to Big Five structure | ✅ Direct (it *is* the Big Five) | Partial overlap | Moderate correlation |
| Licence required | ❌ Never | ✅ Yes | ✅ Yes |
| Used in Cèrcol | ✅ | ❌ | ❌ |

## The Big Five (OCEAN): the psychometric standard

The [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) is derived from the [lexical hypothesis](https://en.wikipedia.org/wiki/Lexical_hypothesis): the most important personality differences are encoded in natural language. Systematic factor analysis of personality-descriptive adjectives across cultures reveals a stable five-factor structure: Openness (Vision in Cèrcol), Conscientiousness (Discipline), Extraversion (Presence), Agreeableness (Bond), and Neuroticism (Depth).

What distinguishes the Big Five from other frameworks is not a single study but a cumulative body of evidence spanning more than five decades. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) documented the [International Personality Item Pool (IPIP)](https://ipip.ori.org) — over 3,000 validated public-domain items. Any researcher can audit, replicate, or build on this foundation without a licence fee. That is the foundation [Cèrcol](/science) uses.

> **Meta-analytic finding:** [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) analysed 162 independent samples across multiple countries. Conscientiousness (Discipline in Cèrcol) was the only Big Five dimension predicting job performance consistently across *all* occupational categories studied. Extraversion predicted performance in managerial and sales roles; Agreeableness in team-oriented work.

## DISC: communication framework, not psychometric model

[DISC](https://en.wikipedia.org/wiki/DISC_assessment) describes four behavioural styles — Dominance, Influence, Steadiness, Conscientiousness — based on Marston's 1928 theory of emotional responses. Marston's original work was not designed as a [psychometric](https://en.wikipedia.org/wiki/Psychometrics) personality instrument; it was a theoretical framework about behavioural responses to environment.

Independent validation studies — especially from researchers not affiliated with DISC publishers — are substantially fewer than for Big Five instruments. Most DISC validation research is proprietary or internal. The DISC dimensions do not map cleanly onto the Big Five factor structure, which means findings from Big Five research do not automatically transfer to DISC interpretations.

DISC can serve as a useful communication framework for teams. The important distinction: it is not a psychometric model of personality in the tradition of the Big Five.

## Belbin Team Roles: preferred behaviour, not trait measurement

[Belbin Team Roles](https://en.wikipedia.org/wiki/Team_Role_Inventories) describe nine preferred team behaviours — Plant, Resource Investigator, Co-ordinator, Shaper, Monitor Evaluator, Teamworker, Implementer, Completer Finisher, Specialist — developed through observation at Henley Business School in the 1970s.

Belbin was primarily interested in what behaviours teams need to be effective. The roles describe preferred team behaviour, not underlying personality traits. [Furnham, Steele & Pendleton (1993)](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x) conducted one of the more rigorous independent assessments and found that Belbin scores correlate with Big Five dimensions, but the relationships are complex and the [psychometric](https://en.wikipedia.org/wiki/Psychometrics) properties of the inventory are not straightforward.

> **On Belbin and the Big Five:** [Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) reviewed team roles grounded in the personality circumplex and found that Big Five–based role systems show stronger theoretical and empirical grounding than behaviour-observation frameworks like Belbin.

## Why Cèrcol uses the Big Five and the IPIP

Cèrcol uses [IPIP](https://ipip.ori.org) items exclusively for three reasons: they are public domain (no licence fee, fully auditable), they are scientifically grounded in the Big Five factor structure (every item has documented validity data), and they are reproducible (any researcher can independently verify the results).

Cèrcol's peer assessment — [Witness Cèrcol](/first-quarter) — uses a forced-choice adjective selection task to collect peer perception data on Big Five dimensions, reducing [social desirability bias](https://en.wikipedia.org/wiki/Social_desirability_bias). This is different from both DISC (behavioural self-report) and Belbin (preferred role self-report).

The [science page](/science) documents what has been validated and what has not. The role taxonomy is beta. That transparency is deliberate.

## References

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Furnham, A., Steele, H., & Pendleton, D. (1993). A psychometric assessment of the Belbin Team-Role Self-Perception Inventory. *Journal of Occupational and Organizational Psychology*, 66(3), 245–257. [doi:10.1111/j.2044-8325.1993.tb00535.x](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "ca": f"""\
Tres marcs de referència dominen l'avaluació de la personalitat a les organitzacions. Comprendre les seues diferències — honestament, sense biaix de proveïdor — és fonamental per a prendre decisions informades sobre quin instrument usar i per què.

{svg("ca")}

## Fonaments científics: una visió general

| Característica | Big Five (IPIP) | DISC | Rols d'equip Belbin |
|----------------|----------------|------|---------------------|
| Fonament | Anàlisi factorial, anys 60–actualitat | Teoria de Marston (1928) | Investigació observacional, anys 70 |
| Validació independent revisada per experts | Extensa (milers d'estudis) | Limitada (majoritàriament propietària) | Moderada (resultats mixtos) |
| Domini públic | ✅ Sí — [IPIP](https://ipip.ori.org) | ❌ Propietari | ❌ Propietari |
| Replicació transcultural | ✅ 50+ països | Parcial | Limitada |
| Mapa a l'estructura Big Five | ✅ Directe (és el Big Five) | Solapament parcial | Correlació moderada |
| Llicència necessària | ❌ Mai | ✅ Sí | ✅ Sí |
| Usat a Cèrcol | ✅ | ❌ | ❌ |

## El Big Five (OCEAN): l'estàndard psicoemètric

El [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) es deriva de la [hipòtesi lèxica](https://en.wikipedia.org/wiki/Lexical_hypothesis): les diferències de personalitat més importants estan codificades en el llenguatge natural. L'anàlisi factorial sistemàtica d'adjectius descriptius de la personalitat en diverses cultures revela una estructura estable de cinc factors: Obertura (Visió a Cèrcol), Responsabilitat (Disciplina), Extraversió (Presència), Amabilitat (Vincle) i Neuroticisme (Profunditat).

El que distingeix el Big Five d'altres marcs no és un sol estudi, sinó un cos acumulat d'evidències de més de cinc dècades. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) van documentar l'[IPIP](https://ipip.ori.org) — més de 3.000 ítems validats de domini públic. Qualsevol investigador pot auditar, replicar o construir sobre aquesta base sense cap llicència. Aquesta és la base que utilitza [Cèrcol](/science).

> **Resultat meta-analític:** [Barrick i Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) van analitzar 162 mostres independents de diversos països. La Responsabilitat (Disciplina a Cèrcol) va ser l'única dimensió del Big Five que predeia el rendiment laboral consistentment en *totes* les categories ocupacionals estudiades. L'Extraversió predia el rendiment en rols directius i de vendes; l'Amabilitat en treball d'equip.

## DISC: marc de comunicació, no model psicoemètric

El [DISC](https://en.wikipedia.org/wiki/DISC_assessment) descriu quatre estils conductuals — Dominància, Influència, Estabilitat, Correcció — basats en la teoria de respostes emocionals de Marston de 1928. El treball original de Marston no va ser dissenyat com un instrument [psicoemètric](https://en.wikipedia.org/wiki/Psychometrics) de personalitat; era un marc teòric sobre respostes conductuals a l'entorn.

Els estudis de validació independent — especialment de investigadors no afiliats als editors del DISC — són substancialment menors que per als instruments del Big Five. La majoria de la investigació de validació del DISC és propietària o interna. Les dimensions del DISC no es corresponen de manera neta amb l'estructura del Big Five.

El DISC pot servir com a útil marc de comunicació per als equips. La distinció important: no és un model psicoemètric de personalitat en la tradició del Big Five.

## Rols d'equip Belbin: comportament preferit, no mesura de trets

Els [Rols d'equip Belbin](https://en.wikipedia.org/wiki/Team_Role_Inventories) descriuen nou comportaments d'equip preferits — Creador, Investigador de Recursos, Coordinador, Impulsor, Monitor Avaluador, Cohesionador, Implementador, Finalitzador, Especialista — desenvolupats per observació a la Henley Business School als anys 70.

Belbin estava interessat principalment en quins comportaments necessiten els equips per ser efectius. Els rols descriuen comportament preferit, no trets de personalitat subjacents. [Furnham, Steele i Pendleton (1993)](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x) van realitzar una de les avaluacions independents més rigoroses i van trobar que les puntuacions Belbin correlacionen amb les dimensions del Big Five, però les relacions són complexes.

> **Sobre Belbin i el Big Five:** [Nestsiarovich i Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) van revisar els rols d'equip basats en el circumflex de personalitat i van trobar que els sistemes de rols basats en el Big Five mostren una fonamentació teòrica i empírica més sòlida que els marcs d'observació conductual com Belbin.

## Per què Cèrcol utilitza el Big Five i l'IPIP

Cèrcol utilitza ítems [IPIP](https://ipip.ori.org) exclusivament per tres raons: són de domini públic (sense llicència, completament auditables), estan científicament fonamentats en l'estructura del Big Five (cada ítem té dades de validesa documentades), i són reproduïbles (qualsevol investigador pot verificar independentment els resultats).

L'avaluació de parells de Cèrcol — [Witness Cèrcol](/first-quarter) — utilitza una tasca de selecció forçada d'adjectius per recollir dades de percepció de parells sobre les dimensions del Big Five, reduint el [biaix de deseabilitat social](https://en.wikipedia.org/wiki/Social_desirability_bias). Açò és diferent tant del DISC (autoinforme conductual) com de Belbin (autoinforme de rols preferits).

La [pàgina de ciència](/science) documenta el que s'ha validat i el que no. La taxonomia de rols és beta. Aquesta transparència és deliberada.

## Referències

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Furnham, A., Steele, H., & Pendleton, D. (1993). A psychometric assessment of the Belbin Team-Role Self-Perception Inventory. *Journal of Occupational and Organizational Psychology*, 66(3), 245–257. [doi:10.1111/j.2044-8325.1993.tb00535.x](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "es": f"""\
Tres marcos de referencia dominan la evaluación de la personalidad en las organizaciones. Comprender sus diferencias — honestamente, sin sesgo de proveedor — es fundamental para tomar decisiones informadas sobre qué herramienta usar y por qué.

{svg("es")}

## Fundamentos científicos: una visión general

| Característica | Big Five (IPIP) | DISC | Roles de equipo Belbin |
|----------------|----------------|------|------------------------|
| Fundamento | Análisis factorial, años 60–actualidad | Teoría de Marston (1928) | Investigación observacional, años 70 |
| Validación independiente revisada por pares | Extensa (miles de estudios) | Limitada (mayormente propietaria) | Moderada (resultados mixtos) |
| Dominio público | ✅ Sí — [IPIP](https://ipip.ori.org) | ❌ Propietario | ❌ Propietario |
| Replicación transcultural | ✅ 50+ países | Parcial | Limitada |
| Mapeo a estructura Big Five | ✅ Directo (es el Big Five) | Solapamiento parcial | Correlación moderada |
| Licencia necesaria | ❌ Nunca | ✅ Sí | ✅ Sí |
| Usado en Cèrcol | ✅ | ❌ | ❌ |

## El Big Five (OCEAN): el estándar psicométrico

El [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) se deriva de la [hipótesis léxica](https://en.wikipedia.org/wiki/Lexical_hypothesis): las diferencias de personalidad más importantes están codificadas en el lenguaje natural. El análisis factorial sistemático de adjetivos descriptivos de personalidad en distintas culturas revela una estructura estable de cinco factores: Apertura (Visión en Cèrcol), Responsabilidad (Disciplina), Extraversión (Presencia), Amabilidad (Vínculo) y Neuroticismo (Profundidad).

Lo que distingue al Big Five de otros marcos no es un solo estudio, sino un cuerpo acumulado de evidencias de más de cinco décadas. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) documentaron el [IPIP](https://ipip.ori.org) — más de 3.000 ítems validados de dominio público. Cualquier investigador puede auditar, replicar o construir sobre esta base sin licencia. Esa es la base que usa [Cèrcol](/science).

> **Hallazgo meta-analítico:** [Barrick y Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) analizaron 162 muestras independientes de varios países. La Responsabilidad (Disciplina en Cèrcol) fue la única dimensión del Big Five que predice el rendimiento laboral consistentemente en *todas* las categorías ocupacionales estudiadas. La Extraversión predijo el rendimiento en roles directivos y de ventas; la Amabilidad en trabajo en equipo.

## DISC: marco de comunicación, no modelo psicométrico

El [DISC](https://en.wikipedia.org/wiki/DISC_assessment) describe cuatro estilos conductuales — Dominancia, Influencia, Estabilidad, Consciencia — basados en la teoría de respuestas emocionales de Marston de 1928. El trabajo original de Marston no fue diseñado como un instrumento [psicométrico](https://en.wikipedia.org/wiki/Psychometrics) de personalidad; era un marco teórico sobre respuestas conductuales al entorno.

Los estudios de validación independiente — especialmente de investigadores no afiliados a los editores de DISC — son sustancialmente menores que para los instrumentos Big Five. La mayoría de la investigación de validación de DISC es propietaria o interna. Las dimensiones DISC no se corresponden claramente con la estructura Big Five.

El DISC puede ser útil como marco de comunicación para equipos. La distinción importante: no es un modelo psicométrico de personalidad en la tradición del Big Five.

## Roles de equipo Belbin: comportamiento preferido, no medición de rasgos

Los [Roles de equipo Belbin](https://en.wikipedia.org/wiki/Team_Role_Inventories) describen nueve comportamientos de equipo preferidos — Creador, Investigador de Recursos, Coordinador, Impulsor, Monitor Evaluador, Cohesionador, Implementador, Finalizador, Especialista — desarrollados mediante observación en la Henley Business School en los años 70.

Belbin estaba principalmente interesado en qué comportamientos necesitan los equipos para ser efectivos. Los roles describen comportamiento preferido, no rasgos de personalidad subyacentes. [Furnham, Steele y Pendleton (1993)](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x) realizaron una de las evaluaciones independientes más rigurosas y encontraron que las puntuaciones Belbin correlacionan con las dimensiones Big Five, pero las relaciones son complejas.

> **Sobre Belbin y el Big Five:** [Nestsiarovich y Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) revisaron los roles de equipo basados en el circumplejo de personalidad y encontraron que los sistemas de roles basados en Big Five muestran una fundamentación teórica y empírica más sólida que los marcos de observación conductual como Belbin.

## Por qué Cèrcol usa el Big Five y el IPIP

Cèrcol usa ítems [IPIP](https://ipip.ori.org) exclusivamente por tres razones: son de dominio público (sin licencia, completamente auditables), están científicamente fundamentados en la estructura Big Five (cada ítem tiene datos de validez documentados), y son reproducibles (cualquier investigador puede verificar independientemente los resultados).

La evaluación de pares de Cèrcol — [Witness Cèrcol](/first-quarter) — usa una tarea de selección forzada de adjetivos para recopilar datos de percepción de pares sobre las dimensiones Big Five, reduciendo el [sesgo de deseabilidad social](https://en.wikipedia.org/wiki/Social_desirability_bias). Esto es diferente tanto del DISC (autoinforme conductual) como de Belbin (autoinforme de roles preferidos).

La [página de ciencia](/science) documenta qué se ha validado y qué no. La taxonomía de roles es beta. Esa transparencia es deliberada.

## Referencias

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Furnham, A., Steele, H., & Pendleton, D. (1993). A psychometric assessment of the Belbin Team-Role Self-Perception Inventory. *Journal of Occupational and Organizational Psychology*, 66(3), 245–257. [doi:10.1111/j.2044-8325.1993.tb00535.x](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "fr": f"""\
Trois cadres dominent l'évaluation de la personnalité dans les organisations. Comprendre leurs différences — honnêtement, sans biais de fournisseur — est essentiel pour prendre des décisions éclairées sur l'outil à utiliser et pourquoi.

{svg("fr")}

## Fondements scientifiques : vue d'ensemble

| Caractéristique | Big Five (IPIP) | DISC | Rôles d'équipe Belbin |
|-----------------|----------------|------|-----------------------|
| Fondement | Analyse factorielle, années 1960–aujourd'hui | Théorie de Marston (1928) | Recherche observationnelle, années 1970 |
| Validation indépendante par les pairs | Étendue (milliers d'études) | Limitée (principalement propriétaire) | Modérée (résultats mitigés) |
| Domaine public | ✅ Oui — [IPIP](https://ipip.ori.org) | ❌ Propriétaire | ❌ Propriétaire |
| Réplication transculturelle | ✅ 50+ pays | Partielle | Limitée |
| Correspondance avec le Big Five | ✅ Directe (c'est le Big Five) | Chevauchement partiel | Corrélation modérée |
| Licence requise | ❌ Jamais | ✅ Oui | ✅ Oui |
| Utilisé dans Cèrcol | ✅ | ❌ | ❌ |

## Le Big Five (OCEAN) : la référence psychométrique

Le [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) est dérivé de l'[hypothèse lexicale](https://en.wikipedia.org/wiki/Lexical_hypothesis) : les différences de personnalité les plus importantes sont encodées dans le langage naturel. L'analyse factorielle systématique d'adjectifs descriptifs de personnalité dans de nombreuses cultures révèle une structure stable à cinq facteurs : Ouverture (Vision chez Cèrcol), Conscienciosité (Discipline), Extraversion (Présence), Agréabilité (Lien) et Névrosisme (Profondeur).

Ce qui distingue le Big Five des autres cadres, ce n'est pas une seule étude, mais un corpus de preuves accumulé sur plus de cinq décennies. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) ont documenté l'[IPIP](https://ipip.ori.org) — plus de 3 000 items validés dans le domaine public. Tout chercheur peut auditer, reproduire ou construire sur cette base sans licence. C'est le fondement qu'utilise [Cèrcol](/science).

> **Résultat méta-analytique :** [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) ont analysé 162 échantillons indépendants dans plusieurs pays. La Conscienciosité (Discipline chez Cèrcol) était la seule dimension du Big Five prédisant la performance professionnelle de façon constante dans *toutes* les catégories d'emploi étudiées. L'Extraversion prédisait la performance dans les rôles managériaux et commerciaux ; l'Agréabilité dans le travail en équipe.

## DISC : cadre de communication, pas modèle psychométrique

Le [DISC](https://en.wikipedia.org/wiki/DISC_assessment) décrit quatre styles comportementaux — Dominance, Influence, Stabilité, Conformité — basés sur la théorie des réponses émotionnelles de Marston (1928). Le travail original de Marston n'était pas conçu comme un instrument [psychométrique](https://en.wikipedia.org/wiki/Psychometrics) de personnalité ; c'était un cadre théorique sur les réponses comportementales à l'environnement.

Les études de validation indépendantes — notamment de chercheurs non affiliés aux éditeurs DISC — sont nettement moins nombreuses que pour les instruments Big Five. La plupart des recherches de validation DISC sont propriétaires ou internes. Les dimensions DISC ne correspondent pas clairement à la structure Big Five.

Le DISC peut servir de cadre de communication utile pour les équipes. La distinction essentielle : ce n'est pas un modèle psychométrique de personnalité dans la tradition du Big Five.

## Rôles d'équipe Belbin : comportement préféré, pas mesure de traits

Les [Rôles d'équipe Belbin](https://en.wikipedia.org/wiki/Team_Role_Inventories) décrivent neuf comportements d'équipe préférés — Concepteur, Explorateur de ressources, Coordinateur, Propulseur, Évaluateur-Contrôleur, Soutien, Priseur en charge, Perfectionneur, Spécialiste — développés par observation à la Henley Business School dans les années 1970.

Belbin s'intéressait principalement aux comportements dont les équipes ont besoin pour être efficaces. Les rôles décrivent un comportement préféré, non des traits de personnalité sous-jacents. [Furnham, Steele & Pendleton (1993)](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x) ont réalisé l'une des évaluations indépendantes les plus rigoureuses et ont constaté que les scores Belbin corrèlent avec les dimensions Big Five, mais avec des relations complexes.

> **Sur Belbin et le Big Five :** [Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) ont examiné les rôles d'équipe fondés sur le circonflexe de personnalité et ont constaté que les systèmes de rôles basés sur le Big Five présentent une base théorique et empirique plus solide que les cadres d'observation comportementale comme Belbin.

## Pourquoi Cèrcol utilise le Big Five et l'IPIP

Cèrcol utilise exclusivement des items [IPIP](https://ipip.ori.org) pour trois raisons : ils sont dans le domaine public (sans licence, entièrement auditables), ils sont scientifiquement fondés sur la structure Big Five (chaque item possède des données de validité documentées), et ils sont reproductibles (tout chercheur peut vérifier indépendamment les résultats).

L'évaluation par les pairs de Cèrcol — [Witness Cèrcol](/first-quarter) — utilise une tâche de sélection d'adjectifs à choix forcé pour collecter des données de perception par les pairs sur les dimensions Big Five, réduisant le [biais de désirabilité sociale](https://en.wikipedia.org/wiki/Social_desirability_bias). Cela diffère à la fois de DISC (auto-évaluation comportementale) et de Belbin (auto-évaluation des rôles préférés).

La [page science](/science) documente ce qui a été validé et ce qui ne l'a pas encore été. La taxonomie des rôles est en bêta. Cette transparence est délibérée.

## Références

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Furnham, A., Steele, H., & Pendleton, D. (1993). A psychometric assessment of the Belbin Team-Role Self-Perception Inventory. *Journal of Occupational and Organizational Psychology*, 66(3), 245–257. [doi:10.1111/j.2044-8325.1993.tb00535.x](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "de": f"""\
Drei Frameworks dominieren die Persönlichkeitsbewertung in Organisationen. Ihre Unterschiede zu verstehen — ehrlich, ohne Anbieterverzerrung — ist entscheidend für fundierte Entscheidungen darüber, welches Instrument man verwendet und warum.

{svg("de")}

## Wissenschaftliche Grundlagen: ein Überblick

| Merkmal | Big Five (IPIP) | DISC | Belbin-Teamrollen |
|---------|----------------|------|-------------------|
| Grundlage | Faktorenanalyse, 1960er–heute | Marstons Theorie (1928) | Beobachtungsforschung, 1970er |
| Unabhängige Peer-Review-Validierung | Umfangreich (tausende Studien) | Begrenzt (meist proprietär) | Moderat (gemischte Befunde) |
| Gemeinfreiheit | ✅ Ja — [IPIP](https://ipip.ori.org) | ❌ Proprietär | ❌ Proprietär |
| Transkulturelle Replikation | ✅ 50+ Länder | Teilweise | Begrenzt |
| Zuordnung zur Big-Five-Struktur | ✅ Direkt (es ist das Big Five) | Teilweise Überschneidung | Moderate Korrelation |
| Lizenz erforderlich | ❌ Nie | ✅ Ja | ✅ Ja |
| In Cèrcol verwendet | ✅ | ❌ | ❌ |

## Das Big Five-Modell (OCEAN): der psychometrische Standard

Das [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits)-Modell leitet sich aus der [lexikalischen Hypothese](https://en.wikipedia.org/wiki/Lexical_hypothesis) ab: Die wichtigsten Persönlichkeitsunterschiede sind in der natürlichen Sprache kodiert. Die systematische Faktorenanalyse persönlichkeitsbeschreibender Adjektive in verschiedenen Kulturen offenbart eine stabile Fünf-Faktoren-Struktur: Offenheit (Vision bei Cèrcol), Gewissenhaftigkeit (Disziplin), Extraversion (Präsenz), Verträglichkeit (Bindung) und Neurotizismus (Tiefe).

Was das Big Five-Modell von anderen Frameworks unterscheidet, ist nicht eine einzelne Studie, sondern ein über fünf Jahrzehnte angehäufter Evidenzkorpus. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) dokumentierten den [IPIP](https://ipip.ori.org) — über 3.000 validierte Items im öffentlichen Bereich. Jeder Forscher kann diese Grundlage ohne Lizenz prüfen, replizieren oder darauf aufbauen. Das ist die Grundlage, die [Cèrcol](/science) verwendet.

> **Meta-analytischer Befund:** [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) analysierten 162 unabhängige Stichproben aus mehreren Ländern. Gewissenhaftigkeit (Disziplin bei Cèrcol) war die einzige Big-Five-Dimension, die Arbeitsleistung konsistent in *allen* untersuchten Berufsgruppen vorhersagte. Extraversion sagte die Leistung in Führungs- und Vertriebsrollen vorher; Verträglichkeit in teamorientierten Tätigkeiten.

## DISC: Kommunikationsrahmen, kein psychometrisches Modell

[DISC](https://en.wikipedia.org/wiki/DISC_assessment) beschreibt vier Verhaltensstile — Dominanz, Initiative, Stetigkeit, Gewissenhaftigkeit — basierend auf Marstons Theorie emotionaler Reaktionen von 1928. Marstons ursprüngliche Arbeit war nicht als [psychometrisches](https://en.wikipedia.org/wiki/Psychometrics) Persönlichkeitsinstrument konzipiert; es war ein theoretischer Rahmen über Verhaltensreaktionen auf die Umgebung.

Unabhängige Validierungsstudien — besonders von nicht mit DISC-Verlagen affiliierten Forschern — sind erheblich seltener als bei Big-Five-Instrumenten. Die meisten DISC-Validierungsforschungen sind proprietär oder intern. Die DISC-Dimensionen korrespondieren nicht klar mit der Big-Five-Struktur.

DISC kann als nützlicher Kommunikationsrahmen für Teams dienen. Die wichtige Unterscheidung: Es ist kein psychometrisches Persönlichkeitsmodell in der Tradition des Big Five.

## Belbin-Teamrollen: bevorzugtes Verhalten, keine Eigenschaftsmessung

Die [Belbin-Teamrollen](https://en.wikipedia.org/wiki/Team_Role_Inventories) beschreiben neun bevorzugte Teamverhaltensweisen — Erfinder, Wegbereiter, Koordinator, Macher, Beobachter, Teamarbeiter, Umsetzer, Perfektionist, Spezialist — entwickelt durch Beobachtung an der Henley Business School in den 1970ern.

Belbin interessierte sich hauptsächlich für das Verhalten, das Teams brauchen, um effektiv zu sein. Die Rollen beschreiben bevorzugtes Verhalten, keine zugrundeliegenden Persönlichkeitseigenschaften. [Furnham, Steele & Pendleton (1993)](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x) führten eine der rigoroseren unabhängigen Bewertungen durch und fanden, dass Belbin-Werte mit Big-Five-Dimensionen korrelieren, jedoch mit komplexen Beziehungen.

> **Zu Belbin und dem Big Five:** [Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) prüften Teamrollen basierend auf dem Persönlichkeitszirkumplexmodell und fanden, dass Big-Five-basierte Rollensysteme eine stärkere theoretische und empirische Grundlage zeigen als verhaltensbeobachtungsbasierte Rahmen wie Belbin.

## Warum Cèrcol das Big Five und den IPIP verwendet

Cèrcol verwendet ausschließlich [IPIP](https://ipip.ori.org)-Items aus drei Gründen: Sie sind gemeinfrei (keine Lizenz, vollständig prüfbar), sie sind wissenschaftlich in der Big-Five-Struktur verankert (jedes Item hat dokumentierte Validitätsdaten), und sie sind reproduzierbar (jeder Forscher kann die Ergebnisse unabhängig verifizieren).

Cèrcols Peer-Bewertung — [Witness Cèrcol](/first-quarter) — verwendet ein Forced-Choice-Adjektivauswahlverfahren, um Peer-Wahrnehmungsdaten zu den Big-Five-Dimensionen zu erheben und dabei die [soziale Erwünschtheit](https://en.wikipedia.org/wiki/Social_desirability_bias) zu reduzieren. Dies unterscheidet sich sowohl von DISC (Verhaltens-Selbstbericht) als auch von Belbin (Selbstbericht bevorzugter Rollen).

Die [Wissenschaftsseite](/science) dokumentiert, was validiert wurde und was noch nicht. Die Rollentaxonomie ist beta. Diese Transparenz ist bewusst gewählt.

## Referenzen

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Furnham, A., Steele, H., & Pendleton, D. (1993). A psychometric assessment of the Belbin Team-Role Self-Perception Inventory. *Journal of Occupational and Organizational Psychology*, 66(3), 245–257. [doi:10.1111/j.2044-8325.1993.tb00535.x](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "da": f"""\
Tre rammer dominerer personlighedsvurdering i organisationer. At forstå deres forskelle — ærligt, uden leverandørbias — er afgørende for at træffe informerede beslutninger om, hvilket værktøj man skal bruge og hvorfor.

{svg("da")}

## Videnskabelige grundlag: et overblik

| Funktion | Big Five (IPIP) | DISC | Belbins teamroller |
|----------|----------------|------|--------------------|
| Grundlag | Faktoranalyse, 1960'erne–nu | Marstons teori (1928) | Observationsforskning, 1970'erne |
| Uafhængig fagfællebedømt validering | Omfattende (tusindvis af studier) | Begrænset (mest proprietær) | Moderat (blandede resultater) |
| Offentligt domæne | ✅ Ja — [IPIP](https://ipip.ori.org) | ❌ Proprietær | ❌ Proprietær |
| Tværkulturel replikation | ✅ 50+ lande | Delvis | Begrænset |
| Tilknytning til Big Five-struktur | ✅ Direkte (det er Big Five) | Delvist overlap | Moderat korrelation |
| Licens påkrævet | ❌ Aldrig | ✅ Ja | ✅ Ja |
| Brugt i Cèrcol | ✅ | ❌ | ❌ |

## Big Five (OCEAN): den psykometriske standard

[Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) er afledt af den [leksikalske hypotese](https://en.wikipedia.org/wiki/Lexical_hypothesis): de vigtigste personlighedsforskelle er kodet i naturligt sprog. Systematisk faktoranalyse af personlighedsbeskrivende adjektiver på tværs af kulturer afslører en stabil femfaktorstruktur: Åbenhed (Vision i Cèrcol), Samvittighedsfuldhed (Disciplin), Ekstraversion (Tilstedeværelse), Venlighed (Bånd) og Neurotisisme (Dybde).

Det, der adskiller Big Five fra andre rammer, er ikke et enkelt studie, men et akkumuleret evidenskorpus på over fem årtier. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) dokumenterede [IPIP](https://ipip.ori.org) — over 3.000 validerede items i det offentlige domæne. Enhver forsker kan revidere, replikere eller bygge på dette grundlag uden licens. Det er det grundlag, [Cèrcol](/science) bruger.

> **Meta-analytisk fund:** [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) analyserede 162 uafhængige stikprøver fra flere lande. Samvittighedsfuldhed (Disciplin i Cèrcol) var den eneste Big Five-dimension, der konsekvent forudsagde jobpræstation i *alle* undersøgte erhvervskategorier. Ekstraversion forudsagde præstation i ledelses- og salgsroller; Venlighed i teamorienteret arbejde.

## DISC: kommunikationsramme, ikke psykometrisk model

[DISC](https://en.wikipedia.org/wiki/DISC_assessment) beskriver fire adfærdsstile — Dominans, Indflydelse, Stabilitet, Samvittighedsfuldhed — baseret på Marstons teori om følelsesmæssige reaktioner fra 1928. Marstons oprindelige arbejde var ikke designet som et [psykometrisk](https://en.wikipedia.org/wiki/Psychometrics) personlighedsinstrument; det var et teoretisk framework om adfærdsreaktioner på miljøet.

Uafhængige valideringsstudier — særligt fra forskere uden tilknytning til DISC-udgivere — er væsentligt færre end for Big Five-instrumenter. De fleste DISC-valideringsundersøgelser er proprietære eller interne. DISC-dimensionerne korresponderer ikke klart med Big Five-strukturen.

DISC kan tjene som et nyttigt kommunikationsframework for teams. Den vigtige skelnen: det er ikke en psykometrisk personlighedsmodel i Big Five-traditionen.

## Belbins teamroller: foretrukken adfærd, ikke trækmåling

[Belbins teamroller](https://en.wikipedia.org/wiki/Team_Role_Inventories) beskriver ni foretrukne teamadfærd — Idémager, Ressourcefinder, Koordinator, Former, Analysator, Teamspiller, Iværksætter, Afslutter, Specialist — udviklet gennem observation på Henley Business School i 1970'erne.

Belbin var primært interesseret i, hvilke adfærd teams har brug for for at være effektive. Rollerne beskriver foretrukken adfærd, ikke underliggende personlighedstræk. [Furnham, Steele & Pendleton (1993)](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x) udførte en af de mere stringente uafhængige evalueringer og fandt, at Belbin-scores korrelerer med Big Five-dimensioner, men med komplekse relationer.

> **Om Belbin og Big Five:** [Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) gennemgik teamroller baseret på personlighedscirkulæret og fandt, at Big Five-baserede rollesystemer viser stærkere teoretisk og empirisk grundlag end adfærdsbaserede rammer som Belbin.

## Hvorfor Cèrcol bruger Big Five og IPIP

Cèrcol bruger udelukkende [IPIP](https://ipip.ori.org)-items af tre årsager: de er i det offentlige domæne (ingen licens, fuldt reviderbare), de er videnskabeligt forankret i Big Five-strukturen (hvert item har dokumenterede validitetsdata), og de er reproducerbare (enhver forsker kan uafhængigt verificere resultaterne).

Cèrcols peer-vurdering — [Witness Cèrcol](/first-quarter) — bruger en tvunget-valg adjektivudvælgelsesopgave til at indsamle peer-perceptionsdata om Big Five-dimensioner, hvilket reducerer [social ønskværdighedsbias](https://en.wikipedia.org/wiki/Social_desirability_bias). Dette adskiller sig fra både DISC (adfærds-selvrapport) og Belbin (selvrapport af foretrukne roller).

[Videnskabssiden](/science) dokumenterer, hvad der er valideret, og hvad der endnu ikke er. Rolletaksonomien er beta. Denne transparens er bevidst.

## Referencer

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Furnham, A., Steele, H., & Pendleton, D. (1993). A psychometric assessment of the Belbin Team-Role Self-Perception Inventory. *Journal of Occupational and Organizational Psychology*, 66(3), 245–257. [doi:10.1111/j.2044-8325.1993.tb00535.x](https://doi.org/10.1111/j.2044-8325.1993.tb00535.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",
}

ARTICLE = {
    "title": {
        "en": "Big Five vs DISC vs Belbin: a scientist's comparison",
        "ca": "Big Five vs DISC vs Belbin: comparació científica",
        "es": "Big Five vs DISC vs Belbin: comparación científica",
        "fr": "Big Five vs DISC vs Belbin : une comparaison scientifique",
        "de": "Big Five vs DISC vs Belbin: ein wissenschaftlicher Vergleich",
        "da": "Big Five vs DISC vs Belbin: en videnskabelig sammenligning",
    },
    "description": {
        "en": "Three of the most popular personality frameworks in organisations compared honestly. One has 50+ years of cross-cultural peer-reviewed evidence. Here is what the research actually says.",
        "ca": "Tres dels marcs de personalitat més populars a les organitzacions comparats honestament. Un té 50+ anys d'evidència transcultural revisada per experts. Açò és el que diu realment la investigació.",
        "es": "Tres de los marcos de personalidad más populares en las organizaciones comparados honestamente. Uno tiene 50+ años de evidencia transcultural revisada por pares. Esto es lo que dice realmente la investigación.",
        "fr": "Trois des cadres de personnalité les plus populaires dans les organisations comparés honnêtement. L'un d'eux dispose de 50+ années de preuves transculturelles évaluées par des pairs. Voici ce que dit réellement la recherche.",
        "de": "Drei der beliebtesten Persönlichkeitsframeworks in Organisationen werden ehrlich verglichen. Eines verfügt über 50+ Jahre transkulturelle, peer-reviewed Evidenz. Das sagt die Forschung wirklich.",
        "da": "Tre af de mest populære personlighedsrammer i organisationer sammenlignet ærligt. Én har 50+ års tværkulturel fagfællebedømt evidens. Her er hvad forskningen faktisk siger.",
    },
    "content": CONTENT,
    "cover_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop&q=80",
}


async def main():
    conn = await asyncpg.connect(DATABASE_URL)
    await conn.execute(
        "UPDATE blog_posts SET title=$1::jsonb, description=$2::jsonb, content=$3::jsonb, cover_url=$4, updated_at=now() WHERE slug=$5",
        json.dumps(ARTICLE["title"]),
        json.dumps(ARTICLE["description"]),
        json.dumps(ARTICLE["content"]),
        ARTICLE["cover_url"],
        "big-five-vs-disc-vs-belbin",
    )
    print("✓ big-five-vs-disc-vs-belbin updated (6 languages)")
    await conn.close()


asyncio.run(main())
