#!/usr/bin/env python3
"""Update blog post 4: What is the IPIP and why does it matter? — enriched EN + full translations."""
import asyncio, asyncpg, json, os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://cercol:cercol_db_2026@localhost:5432/cercol")

SVG_IPIP = """\
<figure style="text-align:center;margin:2rem 0">
<svg width="460" height="130" viewBox="0 0 460 130" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:8px;background:#f0f4ff">
  <text x="230" y="16" font-size="11" fill="#1a3a6b" font-weight="bold" text-anchor="middle">Open vs proprietary personality instruments</text>
  <rect x="8" y="24" width="140" height="96" fill="#0047ba" rx="6"/>
  <text x="78" y="44" font-size="11" fill="white" text-anchor="middle" font-weight="bold">IPIP</text>
  <text x="78" y="60" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">✅ Free forever</text>
  <text x="78" y="74" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">✅ Source auditable</text>
  <text x="78" y="88" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">✅ Replicable</text>
  <text x="78" y="102" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">✅ 3,000+ items</text>
  <text x="78" y="114" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Goldberg et al. 2006</text>
  <rect x="160" y="24" width="140" height="96" fill="#6b7280" rx="6" opacity="0.85"/>
  <text x="230" y="44" font-size="11" fill="white" text-anchor="middle" font-weight="bold">NEO PI-R</text>
  <text x="230" y="60" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">❌ ~€20/person</text>
  <text x="230" y="74" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">❌ Proprietary items</text>
  <text x="230" y="88" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">✅ Well validated</text>
  <text x="230" y="102" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">❌ Licence required</text>
  <text x="230" y="114" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Costa &amp; McCrae</text>
  <rect x="312" y="24" width="140" height="96" fill="#6b7280" rx="6" opacity="0.7"/>
  <text x="382" y="44" font-size="11" fill="white" text-anchor="middle" font-weight="bold">DISC / Hogan</text>
  <text x="382" y="60" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">❌ Commercial</text>
  <text x="382" y="74" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">❌ Not Big Five</text>
  <text x="382" y="88" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">❌ No replication</text>
  <text x="382" y="102" font-size="9" fill="rgba(255,255,255,0.9)" text-anchor="middle">❌ Black box</text>
  <text x="382" y="114" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Various publishers</text>
</svg>
<figcaption style="font-size:0.8rem;color:#6b7280;margin-top:0.5rem">{caption}</figcaption>
</figure>"""

CAPTIONS = {
    "en": "The IPIP (International Personality Item Pool) is the only major Big Five instrument that is fully free, open source, and replicable. Cèrcol uses IPIP items exclusively.",
    "ca": "L'IPIP (International Personality Item Pool) és l'únic gran instrument Big Five que és completament gratuït, de codi obert i replicable. Cèrcol usa ítems IPIP exclusivament.",
    "es": "El IPIP (International Personality Item Pool) es el único instrumento Big Five importante que es completamente gratuito, de código abierto y replicable. Cèrcol usa ítems IPIP exclusivamente.",
    "fr": "L'IPIP (International Personality Item Pool) est le seul grand instrument Big Five entièrement gratuit, open source et reproductible. Cèrcol utilise exclusivement des items IPIP.",
    "de": "Der IPIP (International Personality Item Pool) ist das einzige große Big-Five-Instrument, das vollständig kostenlos, open source und reproduzierbar ist. Cèrcol verwendet ausschließlich IPIP-Items.",
    "da": "IPIP (International Personality Item Pool) er det eneste store Big Five-instrument, der er helt gratis, open source og reproducerbart. Cèrcol bruger udelukkende IPIP-items.",
}

def svg(lang):
    return SVG_IPIP.format(caption=CAPTIONS[lang])

CONTENT = {
    "en": f"""\
Walk into most HR departments today and you will find personality assessments that nobody can fully scrutinise. The items are secret. The scoring algorithms are proprietary. If a researcher wanted to replicate the findings, they could not. This is the norm — not the exception — for commercial personality instruments used in organisations.

The International Personality Item Pool (IPIP) was created specifically to break that norm.

{svg("en")}

## The problem with proprietary personality tests

The dominant personality instruments in organisational settings — the NEO PI-R (Costa & McCrae), DISC, Hogan Personality Inventory — share a structural problem: they are black boxes. The items cannot be reproduced, translated, or used in independent research without a licence. The cost of administering the NEO PI-R alone runs to approximately €15–25 per person. For a team of 50, that is a significant budget commitment for data you cannot independently verify.

This creates a [replication crisis](https://en.wikipedia.org/wiki/Replication_crisis) problem. If personality research published in academic journals uses proprietary instruments, other researchers cannot check the work. The findings are built on a foundation that only paying customers can inspect.

[Psychometrics](https://en.wikipedia.org/wiki/Psychometrics) — the science of measuring psychological constructs — has the same standards of transparency expected in any other science. The IPIP was the movement to enforce those standards.

## What the IPIP is

The International Personality Item Pool ([ipip.ori.org](https://ipip.ori.org)) is a public-domain repository of personality items created by [Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) at the Oregon Research Institute. First described formally in [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419), it now contains over 3,000 items measuring personality constructs across the [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) dimensions and their facets.

Every item in the IPIP is in the public domain. There is no licence fee. There is no permission required. Anyone — a researcher, a startup, a clinician, a government agency — can use, translate, modify, and republish the items freely.

> **[Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) (2006):** 'The goal of the IPIP project is to stimulate research on personality measurement by providing investigators with a large set of personality items that can be used without paying a royalty or obtaining permission.' — [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)

## The science behind IPIP items

IPIP items are not arbitrary questions. They are developed and validated against established personality constructs using factor analysis. Each item has documented correlations with the Big Five dimensions (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism — called Vision, Discipline, Presence, Bond, and Depth in Cèrcol) and their 30 facets.

Two validated short-form versions are especially important for applied use:

- **Johnson (2014) 120-item IPIP-NEO:** A 120-item version that provides reliable facet-level measurement. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- **Maples-Keller et al. (2019) 60-item version:** A more concise 60-item version validated for research and applied contexts. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)

Both versions demonstrate strong psychometric properties comparable to proprietary instruments — without the licence cost or the opacity.

## IPIP vs NEO PI-R: the key difference

| Feature | IPIP | NEO PI-R | DISC |
|---------|------|----------|------|
| Cost | Free | ~€15–25/person | Commercial |
| Items publicly available | ✅ Yes | ❌ No | ❌ No |
| Big Five–grounded | ✅ Yes | ✅ Yes | Partial |
| Peer-reviewed validation | ✅ Extensive | ✅ Extensive | Limited |
| Can be translated freely | ✅ Yes | Restricted | Restricted |
| Can be used in research | ✅ Without permission | Requires licence | Requires licence |
| Used in Cèrcol | ✅ | ❌ | ❌ |

The NEO PI-R is a scientifically rigorous instrument. Costa and McCrae's work is well validated and well cited. But the items are proprietary. You cannot independently audit the content of what is being measured without paying for access, and you cannot build on it without a commercial licence.

The IPIP solves exactly this problem. It measures the same Big Five constructs — with comparable psychometric quality — entirely in the open.

## Why open science matters for personality assessment

[Open science](https://en.wikipedia.org/wiki/Open_science) is not just an academic principle. For personality assessment in organisations, it has direct practical consequences:

1. **Auditability.** When items are public, HR teams, employees, and researchers can examine what is actually being measured. There are no hidden constructs.
2. **Replicability.** Findings from IPIP-based research can be reproduced by independent teams. Results can be challenged, extended, and confirmed.
3. **Equity.** A free instrument means organisations of any size — a five-person startup or a multinational — can access the same validated measurement tools.
4. **Scientific cumulation.** Because thousands of researchers worldwide use the same public items, the evidence base grows collectively. Meta-analyses like [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) are possible precisely because researchers were using comparable, documented instruments.

The [replication crisis](https://en.wikipedia.org/wiki/Replication_crisis) in psychology has made clear that science built on proprietary, unauditable instruments is fragile. The IPIP is the infrastructure for personality science that can actually be replicated.

## How Cèrcol uses the IPIP

Cèrcol uses IPIP items exclusively. Every question in the New Moon Cèrcol assessment is drawn from the public-domain IPIP item pool, selected and validated against the Big Five factor structure. The items are documented, citable, and independently verifiable.

Cèrcol's dimension names — Presence (Extraversion), Bond (Agreeableness), Vision (Openness), Discipline (Conscientiousness), Depth (Neuroticism) — are product labels for user-facing communication. The underlying constructs are the standard Big Five factors, measured with IPIP items.

The [science page](/science) documents the specific items used, the scoring methodology, and what has and has not been validated. The [GitHub repository](https://github.com/cercol/cercol) contains the full source code. The assessment is a [First Quarter Cèrcol](/first-quarter) component — a peer-perception instrument that collects how others see you on the same Big Five dimensions.

Everything is open. That is the point.

## References

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. *Journal of Research in Personality*, 51, 78–89. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- Maples-Keller, J. L., et al. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the International Personality Item Pool. *Psychological Assessment*, 31(2), 154–164. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
""",

    "ca": f"""\
Entra en qualsevol departament de recursos humans avui dia i hi trobaràs avaluacions de personalitat que ningú pot escrutinar completament. Els ítems són secrets. Els algoritmes de puntuació són propietaris. Si un investigador volgués replicar els resultats, no podria. Aquesta és la norma — no l'excepció — per als instruments de personalitat comercials usats a les organitzacions.

L'International Personality Item Pool (IPIP) es va crear específicament per trencar aquesta norma.

{svg("ca")}

## El problema amb les proves de personalitat propietàries

Els instruments de personalitat dominants en entorns organitzacionals — el NEO PI-R (Costa i McCrae), DISC, Hogan Personality Inventory — comparteixen un problema estructural: són caixes negres. Els ítems no es poden reproduir, traduir ni usar en investigació independent sense llicència. El cost d'administrar el NEO PI-R sol arriba aproximadament als €15–25 per persona. Per a un equip de 50 persones, és un compromís pressupostari significatiu per a dades que no es poden verificar independentment.

Açò crea un problema de [crisi de replicació](https://en.wikipedia.org/wiki/Replication_crisis). Si la investigació de personalitat publicada en revistes acadèmiques usa instruments propietaris, altres investigadors no poden verificar la feina. Les troballes es construeixen sobre una base que només els clients de pagament poden inspeccionar.

La [psicometria](https://en.wikipedia.org/wiki/Psychometrics) — la ciència de mesurar constructes psicològics — té els mateixos estàndards de transparència que s'esperen en qualsevol altra ciència. L'IPIP va ser el moviment per fer complir aquests estàndards.

## Què és l'IPIP

L'International Personality Item Pool ([ipip.ori.org](https://ipip.ori.org)) és un repositori de domini públic d'ítems de personalitat creat per [Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) a l'Oregon Research Institute. Descrit formalment per primera vegada a [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419), ara conté més de 3.000 ítems que mesuren constructes de personalitat a través de les dimensions del [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) i les seues facetes.

Cada ítem de l'IPIP és de domini públic. No hi ha cap taxa de llicència. No cal cap permís. Qualsevol persona — un investigador, una startup, un clínic, una agència governamental — pot usar, traduir, modificar i tornar a publicar els ítems lliurement.

> **[Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) (2006):** 'L'objectiu del projecte IPIP és estimular la investigació sobre la mesura de la personalitat proporcionant als investigadors un gran conjunt d'ítems de personalitat que es poden usar sense pagar drets d'autor ni obtenir permís.' — [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)

## La ciència darrere dels ítems IPIP

Els ítems IPIP no són preguntes arbitràries. Es desenvolupen i validen contra constructes de personalitat establerts usant anàlisi factorial. Cada ítem té correlacions documentades amb les dimensions del Big Five (Obertura, Responsabilitat, Extraversió, Amabilitat, Neuroticisme — anomenades Visió, Disciplina, Presència, Vincle i Profunditat a Cèrcol) i les seues 30 facetes.

Dues versions curtes validades són especialment importants per a l'ús aplicat:

- **Johnson (2014) IPIP-NEO de 120 ítems:** Una versió de 120 ítems que proporciona mesura fiable a nivell de faceta. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- **Versió de 60 ítems de Maples-Keller et al. (2019):** Una versió més concisa de 60 ítems validada per a contexts de recerca i aplicats. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)

Ambdues versions demostren propietats psicoemètriques sòlides comparables als instruments propietaris — sense el cost de llicència ni l'opacitat.

## IPIP vs NEO PI-R: la diferència clau

| Característica | IPIP | NEO PI-R | DISC |
|----------------|------|----------|------|
| Cost | Gratuït | ~€15–25/persona | Comercial |
| Ítems disponibles públicament | ✅ Sí | ❌ No | ❌ No |
| Basat en Big Five | ✅ Sí | ✅ Sí | Parcial |
| Validació revisada per experts | ✅ Extensa | ✅ Extensa | Limitada |
| Es pot traduir lliurement | ✅ Sí | Restringit | Restringit |
| Es pot usar en recerca | ✅ Sense permís | Requereix llicència | Requereix llicència |
| Usat a Cèrcol | ✅ | ❌ | ❌ |

El NEO PI-R és un instrument científicament rigorós. El treball de Costa i McCrae és ben validat i ben citat. Però els ítems són propietaris. No es pot auditar independentment el contingut del que s'està mesurant sense pagar per l'accés, i no es pot construir sobre ell sense llicència comercial.

L'IPIP resol exactament aquest problema. Mesura els mateixos constructes del Big Five — amb qualitat psicoemètrica comparable — completament en obert.

## Per què la ciència oberta importa per a l'avaluació de la personalitat

La [ciència oberta](https://en.wikipedia.org/wiki/Open_science) no és només un principi acadèmic. Per a l'avaluació de la personalitat a les organitzacions, té conseqüències pràctiques directes:

1. **Auditabilitat.** Quan els ítems són públics, els equips de RRHH, els empleats i els investigadors poden examinar el que s'està mesurant realment. No hi ha constructes ocults.
2. **Replicabilitat.** Les troballes de la investigació basada en IPIP poden ser reproduïdes per equips independents. Els resultats poden ser contestats, ampliats i confirmats.
3. **Equitat.** Un instrument gratuït significa que les organitzacions de qualsevol mida — una startup de cinc persones o una multinacional — poden accedir a les mateixes eines de mesura validades.
4. **Acumulació científica.** Com que milers d'investigadors a tot el món usen els mateixos ítems públics, la base d'evidències creix col·lectivament. Les meta-anàlisis com [Barrick i Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) són possibles precisament perquè els investigadors usaven instruments comparables i documentats.

La [crisi de replicació](https://en.wikipedia.org/wiki/Replication_crisis) en psicologia ha deixat clar que la ciència construïda sobre instruments propietaris i no auditables és fràgil. L'IPIP és la infraestructura per a la ciència de la personalitat que realment pot ser replicada.

## Com Cèrcol usa l'IPIP

Cèrcol usa ítems IPIP exclusivament. Cada pregunta de l'avaluació New Moon Cèrcol és extreta del conjunt d'ítems IPIP de domini públic, seleccionada i validada contra l'estructura factorial del Big Five. Els ítems estan documentats, citats i verificables independentment.

Els noms de dimensions de Cèrcol — Presència (Extraversió), Vincle (Amabilitat), Visió (Obertura), Disciplina (Responsabilitat), Profunditat (Neuroticisme) — són etiquetes de producte per a la comunicació orientada a l'usuari. Els constructes subjacents són els factors estàndard del Big Five, mesurats amb ítems IPIP.

La [pàgina de ciència](/science) documenta els ítems específics usats, la metodologia de puntuació, i el que s'ha validat i el que no. El [repositori GitHub](https://github.com/cercol/cercol) conté el codi font complet. L'avaluació és un component [First Quarter Cèrcol](/first-quarter) — un instrument de percepció de parells que recull com els altres et veuen en les mateixes dimensions del Big Five.

Tot és obert. Aquest és el punt.

## Referències

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. *Journal of Research in Personality*, 51, 78–89. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- Maples-Keller, J. L., et al. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the International Personality Item Pool. *Psychological Assessment*, 31(2), 154–164. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
""",

    "es": f"""\
Entra en cualquier departamento de recursos humanos hoy y encontrarás evaluaciones de personalidad que nadie puede escrutar completamente. Los ítems son secretos. Los algoritmos de puntuación son propietarios. Si un investigador quisiera replicar los hallazgos, no podría. Esta es la norma — no la excepción — para los instrumentos de personalidad comerciales usados en organizaciones.

El International Personality Item Pool (IPIP) fue creado específicamente para romper esa norma.

{svg("es")}

## El problema con las pruebas de personalidad propietarias

Los instrumentos de personalidad dominantes en entornos organizacionales — el NEO PI-R (Costa y McCrae), DISC, Hogan Personality Inventory — comparten un problema estructural: son cajas negras. Los ítems no pueden reproducirse, traducirse ni usarse en investigación independiente sin licencia. El coste de administrar el NEO PI-R solo asciende a aproximadamente €15–25 por persona. Para un equipo de 50 personas, es un compromiso presupuestario significativo para datos que no se pueden verificar independientemente.

Esto crea un problema de [crisis de replicación](https://en.wikipedia.org/wiki/Replication_crisis). Si la investigación de personalidad publicada en revistas académicas usa instrumentos propietarios, otros investigadores no pueden verificar el trabajo. Los hallazgos se construyen sobre una base que solo los clientes de pago pueden inspeccionar.

La [psicometría](https://en.wikipedia.org/wiki/Psychometrics) — la ciencia de medir constructos psicológicos — tiene los mismos estándares de transparencia que se esperan en cualquier otra ciencia. El IPIP fue el movimiento para hacer cumplir esos estándares.

## Qué es el IPIP

El International Personality Item Pool ([ipip.ori.org](https://ipip.ori.org)) es un repositorio de dominio público de ítems de personalidad creado por [Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) en el Oregon Research Institute. Descrito formalmente por primera vez en [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419), ahora contiene más de 3.000 ítems que miden constructos de personalidad a través de las dimensiones del [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) y sus facetas.

Cada ítem del IPIP es de dominio público. No hay ninguna tasa de licencia. No se requiere ningún permiso. Cualquier persona — un investigador, una startup, un clínico, una agencia gubernamental — puede usar, traducir, modificar y volver a publicar los ítems libremente.

> **[Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) (2006):** 'El objetivo del proyecto IPIP es estimular la investigación sobre la medición de la personalidad proporcionando a los investigadores un gran conjunto de ítems de personalidad que pueden usarse sin pagar regalías ni obtener permiso.' — [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)

## La ciencia detrás de los ítems IPIP

Los ítems IPIP no son preguntas arbitrarias. Se desarrollan y validan contra constructos de personalidad establecidos usando análisis factorial. Cada ítem tiene correlaciones documentadas con las dimensiones del Big Five (Apertura, Responsabilidad, Extraversión, Amabilidad, Neuroticismo — llamadas Visión, Disciplina, Presencia, Vínculo y Profundidad en Cèrcol) y sus 30 facetas.

Dos versiones cortas validadas son especialmente importantes para el uso aplicado:

- **Johnson (2014) IPIP-NEO de 120 ítems:** Una versión de 120 ítems que proporciona medida fiable a nivel de faceta. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- **Versión de 60 ítems de Maples-Keller et al. (2019):** Una versión más concisa de 60 ítems validada para contextos de investigación y aplicados. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)

Ambas versiones demuestran propiedades psicométricas sólidas comparables a los instrumentos propietarios — sin el coste de licencia ni la opacidad.

## IPIP vs NEO PI-R: la diferencia clave

| Característica | IPIP | NEO PI-R | DISC |
|----------------|------|----------|------|
| Coste | Gratuito | ~€15–25/persona | Comercial |
| Ítems disponibles públicamente | ✅ Sí | ❌ No | ❌ No |
| Basado en Big Five | ✅ Sí | ✅ Sí | Parcial |
| Validación revisada por pares | ✅ Extensa | ✅ Extensa | Limitada |
| Se puede traducir libremente | ✅ Sí | Restringido | Restringido |
| Se puede usar en investigación | ✅ Sin permiso | Requiere licencia | Requiere licencia |
| Usado en Cèrcol | ✅ | ❌ | ❌ |

El NEO PI-R es un instrumento científicamente riguroso. El trabajo de Costa y McCrae está bien validado y bien citado. Pero los ítems son propietarios. No se puede auditar independientemente el contenido de lo que se está midiendo sin pagar por el acceso, y no se puede construir sobre él sin licencia comercial.

El IPIP resuelve exactamente este problema. Mide los mismos constructos del Big Five — con calidad psicométrica comparable — completamente en abierto.

## Por qué la ciencia abierta importa para la evaluación de la personalidad

La [ciencia abierta](https://en.wikipedia.org/wiki/Open_science) no es solo un principio académico. Para la evaluación de la personalidad en las organizaciones, tiene consecuencias prácticas directas:

1. **Auditabilidad.** Cuando los ítems son públicos, los equipos de RRHH, los empleados y los investigadores pueden examinar lo que realmente se está midiendo. No hay constructos ocultos.
2. **Replicabilidad.** Los hallazgos de la investigación basada en IPIP pueden ser reproducidos por equipos independientes. Los resultados pueden ser cuestionados, ampliados y confirmados.
3. **Equidad.** Un instrumento gratuito significa que las organizaciones de cualquier tamaño — una startup de cinco personas o una multinacional — pueden acceder a las mismas herramientas de medida validadas.
4. **Acumulación científica.** Como miles de investigadores en todo el mundo usan los mismos ítems públicos, la base de evidencias crece colectivamente. Los meta-análisis como [Barrick y Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) son posibles precisamente porque los investigadores usaban instrumentos comparables y documentados.

La [crisis de replicación](https://en.wikipedia.org/wiki/Replication_crisis) en psicología ha dejado claro que la ciencia construida sobre instrumentos propietarios y no auditables es frágil. El IPIP es la infraestructura para la ciencia de la personalidad que realmente puede ser replicada.

## Cómo Cèrcol usa el IPIP

Cèrcol usa ítems IPIP exclusivamente. Cada pregunta de la evaluación New Moon Cèrcol se extrae del conjunto de ítems IPIP de dominio público, seleccionada y validada contra la estructura factorial del Big Five. Los ítems están documentados, citados y verificables independientemente.

Los nombres de dimensiones de Cèrcol — Presencia (Extraversión), Vínculo (Amabilidad), Visión (Apertura), Disciplina (Responsabilidad), Profundidad (Neuroticismo) — son etiquetas de producto para la comunicación orientada al usuario. Los constructos subyacentes son los factores estándar del Big Five, medidos con ítems IPIP.

La [página de ciencia](/science) documenta los ítems específicos usados, la metodología de puntuación, y lo que se ha validado y lo que no. El [repositorio GitHub](https://github.com/cercol/cercol) contiene el código fuente completo. La evaluación es un componente [First Quarter Cèrcol](/first-quarter) — un instrumento de percepción de pares que recoge cómo otros te ven en las mismas dimensiones del Big Five.

Todo es abierto. Ese es el punto.

## Referencias

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. *Journal of Research in Personality*, 51, 78–89. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- Maples-Keller, J. L., et al. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the International Personality Item Pool. *Psychological Assessment*, 31(2), 154–164. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
""",

    "fr": f"""\
Entrez dans n'importe quel département RH aujourd'hui et vous trouverez des évaluations de personnalité que personne ne peut pleinement examiner. Les items sont secrets. Les algorithmes de notation sont propriétaires. Si un chercheur voulait répliquer les résultats, il ne le pourrait pas. C'est la norme — et non l'exception — pour les instruments de personnalité commerciaux utilisés dans les organisations.

L'International Personality Item Pool (IPIP) a été créé précisément pour briser cette norme.

{svg("fr")}

## Le problème avec les tests de personnalité propriétaires

Les instruments de personnalité dominants dans les contextes organisationnels — le NEO PI-R (Costa & McCrae), DISC, Hogan Personality Inventory — partagent un problème structurel : ce sont des boîtes noires. Les items ne peuvent être reproduits, traduits ou utilisés dans des recherches indépendantes sans licence. Le coût d'administration du seul NEO PI-R s'élève à environ €15–25 par personne. Pour une équipe de 50 personnes, c'est un engagement budgétaire significatif pour des données qu'il est impossible de vérifier indépendamment.

Cela crée un problème de [crise de réplication](https://en.wikipedia.org/wiki/Replication_crisis). Si les recherches sur la personnalité publiées dans des revues académiques utilisent des instruments propriétaires, les autres chercheurs ne peuvent pas vérifier le travail. Les résultats reposent sur une base que seuls les clients payants peuvent inspecter.

La [psychométrie](https://en.wikipedia.org/wiki/Psychometrics) — la science de la mesure des construits psychologiques — a les mêmes exigences de transparence que toute autre science. L'IPIP a été le mouvement pour faire respecter ces normes.

## Qu'est-ce que l'IPIP

L'International Personality Item Pool ([ipip.ori.org](https://ipip.ori.org)) est un référentiel d'items de personnalité dans le domaine public, créé par [Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) à l'Oregon Research Institute. Décrit formellement pour la première fois dans [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419), il contient aujourd'hui plus de 3 000 items mesurant des construits de personnalité selon les dimensions du [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) et leurs facettes.

Chaque item de l'IPIP est dans le domaine public. Il n'y a pas de frais de licence. Aucune autorisation n'est requise. Tout le monde — un chercheur, une startup, un clinicien, un organisme gouvernemental — peut utiliser, traduire, modifier et republier les items librement.

> **[Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) (2006) :** 'L'objectif du projet IPIP est de stimuler la recherche sur la mesure de la personnalité en fournissant aux chercheurs un large ensemble d'items de personnalité pouvant être utilisés sans payer de redevance ni obtenir d'autorisation.' — [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)

## La science derrière les items IPIP

Les items IPIP ne sont pas des questions arbitraires. Ils sont développés et validés par rapport à des construits de personnalité établis en utilisant l'analyse factorielle. Chaque item possède des corrélations documentées avec les dimensions du Big Five (Ouverture, Conscienciosité, Extraversion, Agréabilité, Névrosisme — appelées Vision, Discipline, Présence, Lien et Profondeur chez Cèrcol) et leurs 30 facettes.

Deux versions courtes validées sont particulièrement importantes pour une utilisation appliquée :

- **Johnson (2014) IPIP-NEO à 120 items :** Une version de 120 items qui fournit une mesure fiable au niveau des facettes. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- **Version à 60 items de Maples-Keller et al. (2019) :** Une version plus concise de 60 items validée pour les contextes de recherche et appliqués. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)

Les deux versions démontrent de solides propriétés psychométriques comparables aux instruments propriétaires — sans les frais de licence ni l'opacité.

## IPIP vs NEO PI-R : la différence clé

| Caractéristique | IPIP | NEO PI-R | DISC |
|-----------------|------|----------|------|
| Coût | Gratuit | ~€15–25/personne | Commercial |
| Items disponibles publiquement | ✅ Oui | ❌ Non | ❌ Non |
| Ancré dans le Big Five | ✅ Oui | ✅ Oui | Partiel |
| Validation par les pairs | ✅ Étendue | ✅ Étendue | Limitée |
| Peut être traduit librement | ✅ Oui | Restreint | Restreint |
| Peut être utilisé en recherche | ✅ Sans autorisation | Nécessite une licence | Nécessite une licence |
| Utilisé dans Cèrcol | ✅ | ❌ | ❌ |

Le NEO PI-R est un instrument scientifiquement rigoureux. Le travail de Costa et McCrae est bien validé et bien cité. Mais les items sont propriétaires. Il est impossible d'auditer indépendamment le contenu de ce qui est mesuré sans payer pour y accéder, et il est impossible de s'appuyer dessus sans licence commerciale.

L'IPIP résout exactement ce problème. Il mesure les mêmes construits Big Five — avec une qualité psychométrique comparable — entièrement en open source.

## Pourquoi la science ouverte est importante pour l'évaluation de la personnalité

La [science ouverte](https://en.wikipedia.org/wiki/Open_science) n'est pas seulement un principe académique. Pour l'évaluation de la personnalité dans les organisations, elle a des conséquences pratiques directes :

1. **Auditabilité.** Lorsque les items sont publics, les équipes RH, les employés et les chercheurs peuvent examiner ce qui est réellement mesuré. Il n'y a pas de construits cachés.
2. **Reproductibilité.** Les résultats de recherches basées sur l'IPIP peuvent être reproduits par des équipes indépendantes. Les résultats peuvent être contestés, étendus et confirmés.
3. **Équité.** Un instrument gratuit signifie que des organisations de toute taille — une startup de cinq personnes ou une multinationale — peuvent accéder aux mêmes outils de mesure validés.
4. **Cumulation scientifique.** Parce que des milliers de chercheurs dans le monde entier utilisent les mêmes items publics, la base de preuves s'enrichit collectivement. Les méta-analyses comme [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) sont possibles précisément parce que les chercheurs utilisaient des instruments comparables et documentés.

La [crise de réplication](https://en.wikipedia.org/wiki/Replication_crisis) en psychologie a clairement montré que la science construite sur des instruments propriétaires et non auditables est fragile. L'IPIP est l'infrastructure pour une science de la personnalité qui peut réellement être reproduite.

## Comment Cèrcol utilise l'IPIP

Cèrcol utilise exclusivement des items IPIP. Chaque question de l'évaluation New Moon Cèrcol est tirée du pool d'items IPIP du domaine public, sélectionnée et validée par rapport à la structure factorielle du Big Five. Les items sont documentés, citables et vérifiables indépendamment.

Les noms des dimensions de Cèrcol — Présence (Extraversion), Lien (Agréabilité), Vision (Ouverture), Discipline (Conscienciosité), Profondeur (Névrosisme) — sont des étiquettes produit pour la communication orientée utilisateur. Les construits sous-jacents sont les facteurs Big Five standard, mesurés avec des items IPIP.

La [page science](/science) documente les items spécifiques utilisés, la méthodologie de notation et ce qui a et n'a pas été validé. Le [dépôt GitHub](https://github.com/cercol/cercol) contient le code source complet. L'évaluation est un composant [First Quarter Cèrcol](/first-quarter) — un instrument de perception par les pairs qui recueille comment les autres vous perçoivent sur les mêmes dimensions Big Five.

Tout est ouvert. C'est l'essentiel.

## Références

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. *Journal of Research in Personality*, 51, 78–89. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- Maples-Keller, J. L., et al. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the International Personality Item Pool. *Psychological Assessment*, 31(2), 154–164. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
""",

    "de": f"""\
Betreten Sie heute eine HR-Abteilung, werden Sie Persönlichkeitsbewertungen finden, die niemand vollständig prüfen kann. Die Items sind geheim. Die Bewertungsalgorithmen sind proprietär. Wenn ein Forscher die Ergebnisse replizieren wollte, wäre das unmöglich. Das ist die Norm — keine Ausnahme — für kommerzielle Persönlichkeitsinstrumente in Organisationen.

Der International Personality Item Pool (IPIP) wurde genau dafür geschaffen, diese Norm zu durchbrechen.

{svg("de")}

## Das Problem mit proprietären Persönlichkeitstests

Die dominanten Persönlichkeitsinstrumente in organisationalen Umgebungen — das NEO PI-R (Costa & McCrae), DISC, Hogan Personality Inventory — teilen ein strukturelles Problem: Sie sind Black Boxes. Die Items können ohne Lizenz weder reproduziert, übersetzt noch in unabhängiger Forschung verwendet werden. Allein die Kosten für die Durchführung des NEO PI-R betragen etwa €15–25 pro Person. Für ein 50-köpfiges Team ist das eine erhebliche Budgetverpflichtung für Daten, die nicht unabhängig überprüft werden können.

Das schafft ein Problem der [Replikationskrise](https://en.wikipedia.org/wiki/Replication_crisis). Wenn in akademischen Zeitschriften veröffentlichte Persönlichkeitsforschung proprietäre Instrumente verwendet, können andere Forscher die Arbeit nicht überprüfen. Die Ergebnisse basieren auf einem Fundament, das nur zahlende Kunden inspizieren können.

Die [Psychometrie](https://en.wikipedia.org/wiki/Psychometrics) — die Wissenschaft der Messung psychologischer Konstrukte — hat dieselben Transparenzstandards, die in jeder anderen Wissenschaft erwartet werden. Der IPIP war die Bewegung, diese Standards durchzusetzen.

## Was der IPIP ist

Der International Personality Item Pool ([ipip.ori.org](https://ipip.ori.org)) ist ein gemeinfreies Repository von Persönlichkeitsitems, das von [Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) am Oregon Research Institute erstellt wurde. Erstmals formal beschrieben in [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419), enthält er heute über 3.000 Items, die Persönlichkeitskonstrukte entlang der [Big-Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits)-Dimensionen und ihrer Facetten messen.

Jedes Item im IPIP ist gemeinfrei. Es gibt keine Lizenzgebühr. Es ist keine Genehmigung erforderlich. Jeder — ein Forscher, ein Startup, ein Kliniker, eine Behörde — kann die Items frei verwenden, übersetzen, modifizieren und republizieren.

> **[Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) (2006):** 'Das Ziel des IPIP-Projekts ist es, die Forschung zur Persönlichkeitsmessung zu stimulieren, indem Forschern eine große Sammlung von Persönlichkeitsitems zur Verfügung gestellt wird, die ohne Zahlung einer Gebühr oder Einholung einer Genehmigung verwendet werden können.' — [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)

## Die Wissenschaft hinter IPIP-Items

IPIP-Items sind keine willkürlichen Fragen. Sie werden anhand etablierter Persönlichkeitskonstrukte mithilfe von Faktorenanalysen entwickelt und validiert. Jedes Item hat dokumentierte Korrelationen mit den Big-Five-Dimensionen (Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, Neurotizismus — in Cèrcol Vision, Disziplin, Präsenz, Bindung und Tiefe genannt) und ihren 30 Facetten.

Zwei validierte Kurzversionen sind für den angewandten Einsatz besonders wichtig:

- **Johnson (2014) IPIP-NEO mit 120 Items:** Eine 120-Item-Version, die eine zuverlässige Messung auf Facettenebene ermöglicht. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- **60-Item-Version von Maples-Keller et al. (2019):** Eine kompaktere 60-Item-Version, validiert für Forschungs- und Anwendungskontexte. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)

Beide Versionen zeigen starke psychometrische Eigenschaften, vergleichbar mit proprietären Instrumenten — ohne Lizenzkosten oder Intransparenz.

## IPIP vs NEO PI-R: der wesentliche Unterschied

| Merkmal | IPIP | NEO PI-R | DISC |
|---------|------|----------|------|
| Kosten | Kostenlos | ~€15–25/Person | Kommerziell |
| Items öffentlich verfügbar | ✅ Ja | ❌ Nein | ❌ Nein |
| Big-Five-basiert | ✅ Ja | ✅ Ja | Teilweise |
| Peer-reviewed Validierung | ✅ Umfangreich | ✅ Umfangreich | Begrenzt |
| Frei übersetzbar | ✅ Ja | Eingeschränkt | Eingeschränkt |
| In der Forschung verwendbar | ✅ Ohne Genehmigung | Lizenz erforderlich | Lizenz erforderlich |
| In Cèrcol verwendet | ✅ | ❌ | ❌ |

Das NEO PI-R ist ein wissenschaftlich rigoroses Instrument. Die Arbeit von Costa und McCrae ist gut validiert und oft zitiert. Aber die Items sind proprietär. Es ist nicht möglich, den Inhalt des Gemessenen ohne Bezahlung unabhängig zu prüfen, und darauf aufzubauen ist ohne kommerzielle Lizenz nicht möglich.

Der IPIP löst genau dieses Problem. Er misst dieselben Big-Five-Konstrukte — mit vergleichbarer psychometrischer Qualität — vollständig offen.

## Warum offene Wissenschaft für die Persönlichkeitsbewertung wichtig ist

[Offene Wissenschaft](https://en.wikipedia.org/wiki/Open_science) ist nicht nur ein akademisches Prinzip. Für die Persönlichkeitsbewertung in Organisationen hat sie direkte praktische Konsequenzen:

1. **Prüfbarkeit.** Wenn Items öffentlich sind, können HR-Teams, Mitarbeiter und Forscher untersuchen, was tatsächlich gemessen wird. Es gibt keine versteckten Konstrukte.
2. **Reproduzierbarkeit.** Ergebnisse aus IPIP-basierter Forschung können von unabhängigen Teams reproduziert werden. Ergebnisse können angefochten, erweitert und bestätigt werden.
3. **Gerechtigkeit.** Ein kostenloses Instrument bedeutet, dass Organisationen jeder Größe — ein fünfköpfiges Startup oder ein multinationaler Konzern — Zugang zu denselben validierten Messwerkzeugen haben.
4. **Wissenschaftliche Kumulation.** Da tausende Forscher weltweit dieselben öffentlichen Items verwenden, wächst die Evidenzbasis kollektiv. Meta-Analysen wie [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) sind möglich, weil Forscher vergleichbare, dokumentierte Instrumente verwendeten.

Die [Replikationskrise](https://en.wikipedia.org/wiki/Replication_crisis) in der Psychologie hat deutlich gemacht, dass auf proprietären, nicht prüfbaren Instrumenten aufgebaute Wissenschaft fragil ist. Der IPIP ist die Infrastruktur für Persönlichkeitswissenschaft, die tatsächlich repliziert werden kann.

## Wie Cèrcol den IPIP verwendet

Cèrcol verwendet ausschließlich IPIP-Items. Jede Frage der New Moon Cèrcol-Bewertung stammt aus dem gemeinfreien IPIP-Item-Pool, ausgewählt und validiert anhand der Big-Five-Faktorstruktur. Die Items sind dokumentiert, zitierbar und unabhängig überprüfbar.

Cèrcols Dimensionsnamen — Präsenz (Extraversion), Bindung (Verträglichkeit), Vision (Offenheit), Disziplin (Gewissenhaftigkeit), Tiefe (Neurotizismus) — sind Produktbezeichnungen für die nutzerseitige Kommunikation. Die zugrundeliegenden Konstrukte sind die Standard-Big-Five-Faktoren, gemessen mit IPIP-Items.

Die [Wissenschaftsseite](/science) dokumentiert die verwendeten spezifischen Items, die Bewertungsmethodik und was validiert wurde und was nicht. Das [GitHub-Repository](https://github.com/cercol/cercol) enthält den vollständigen Quellcode. Die Bewertung ist eine Komponente von [First Quarter Cèrcol](/first-quarter) — ein Peer-Wahrnehmungsinstrument, das erfasst, wie andere Sie auf denselben Big-Five-Dimensionen sehen.

Alles ist offen. Das ist der Punkt.

## Referenzen

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. *Journal of Research in Personality*, 51, 78–89. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- Maples-Keller, J. L., et al. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the International Personality Item Pool. *Psychological Assessment*, 31(2), 154–164. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
""",

    "da": f"""\
Gå ind i enhver HR-afdeling i dag, og du vil finde personlighedsvurderinger, som ingen kan granske fuldt ud. Itemsene er hemmelige. Scoringsalgoritmerne er proprietære. Hvis en forsker ønskede at replikere resultaterne, ville det ikke være muligt. Dette er normen — ikke undtagelsen — for kommercielle personlighedsinstrumenter, der bruges i organisationer.

International Personality Item Pool (IPIP) blev skabt specifikt for at bryde denne norm.

{svg("da")}

## Problemet med proprietære personlighedstests

De dominerende personlighedsinstrumenter i organisatoriske sammenhænge — NEO PI-R (Costa & McCrae), DISC, Hogan Personality Inventory — deler et strukturelt problem: de er sorte bokse. Itemsene kan ikke reproduceres, oversættes eller bruges i uafhængig forskning uden licens. Omkostningerne ved at administrere NEO PI-R alene er cirka €15–25 per person. For et team på 50 er det en betydelig budgetforpligtelse for data, som man ikke kan verificere uafhængigt.

Dette skaber et problem med [replikationskrisen](https://en.wikipedia.org/wiki/Replication_crisis). Hvis personlighedsforskning udgivet i akademiske tidsskrifter bruger proprietære instrumenter, kan andre forskere ikke kontrollere arbejdet. Resultaterne er bygget på et fundament, som kun betalende kunder kan inspicere.

[Psykometri](https://en.wikipedia.org/wiki/Psychometrics) — videnskaben om at måle psykologiske konstrukter — har de samme gennemsigtighedsstandarder, der forventes i enhver anden videnskab. IPIP var bevægelsen for at håndhæve disse standarder.

## Hvad IPIP er

International Personality Item Pool ([ipip.ori.org](https://ipip.ori.org)) er et repository af personlighedsitems i det offentlige domæne, oprettet af [Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) ved Oregon Research Institute. Første gang formelt beskrevet i [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419), indeholder det nu over 3.000 items, der måler personlighedskonstrukter på tværs af [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits)-dimensionerne og deres facetter.

Hvert item i IPIP er i det offentlige domæne. Der er ingen licensgebyr. Der kræves ingen tilladelse. Alle — en forsker, en startup, en kliniker, en statslig myndighed — kan frit bruge, oversætte, modificere og genudgive itemsene.

> **[Lewis Goldberg](https://en.wikipedia.org/wiki/Lewis_Goldberg) (2006):** 'Målet med IPIP-projektet er at stimulere forskning i personlighedsmåling ved at give forskere et stort sæt personlighedsitems, der kan bruges uden at betale royalties eller indhente tilladelse.' — [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)

## Videnskaben bag IPIP-items

IPIP-items er ikke vilkårlige spørgsmål. De udvikles og valideres mod etablerede personlighedskonstrukter ved hjælp af faktoranalyse. Hvert item har dokumenterede korrelationer med Big Five-dimensionerne (Åbenhed, Samvittighedsfuldhed, Ekstraversion, Venlighed, Neurotisisme — kaldet Vision, Disciplin, Tilstedeværelse, Bånd og Dybde i Cèrcol) og deres 30 facetter.

To validerede kortformversioner er særligt vigtige til anvendt brug:

- **Johnson (2014) IPIP-NEO med 120 items:** En 120-item version, der giver pålidelig måling på facetniveau. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- **60-item version af Maples-Keller et al. (2019):** En mere kortfattet 60-item version valideret til forsknings- og anvendelseskontekster. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)

Begge versioner demonstrerer stærke psykometriske egenskaber, der er sammenlignelige med proprietære instrumenter — uden licensomkostninger eller uigennemsigtighed.

## IPIP vs NEO PI-R: den vigtige forskel

| Funktion | IPIP | NEO PI-R | DISC |
|----------|------|----------|------|
| Omkostning | Gratis | ~€15–25/person | Kommerciel |
| Items offentligt tilgængelige | ✅ Ja | ❌ Nej | ❌ Nej |
| Big Five-baseret | ✅ Ja | ✅ Ja | Delvist |
| Fagfællebedømt validering | ✅ Omfattende | ✅ Omfattende | Begrænset |
| Kan oversættes frit | ✅ Ja | Begrænset | Begrænset |
| Kan bruges i forskning | ✅ Uden tilladelse | Kræver licens | Kræver licens |
| Brugt i Cèrcol | ✅ | ❌ | ❌ |

NEO PI-R er et videnskabeligt stringent instrument. Costa og McCraes arbejde er godt valideret og ofte citeret. Men itemsene er proprietære. Det er ikke muligt at auditere indholdet af det, der måles, uafhængigt uden at betale for adgang, og man kan ikke bygge videre på det uden en kommerciel licens.

IPIP løser præcis dette problem. Det måler de samme Big Five-konstrukter — med sammenlignelig psykometrisk kvalitet — helt åbent.

## Hvorfor åben videnskab er vigtig for personlighedsvurdering

[Åben videnskab](https://en.wikipedia.org/wiki/Open_science) er ikke bare et akademisk princip. For personlighedsvurdering i organisationer har det direkte praktiske konsekvenser:

1. **Revisionsmulighed.** Når items er offentlige, kan HR-teams, medarbejdere og forskere undersøge, hvad der faktisk måles. Der er ingen skjulte konstrukter.
2. **Reproducerbarhed.** Resultater fra IPIP-baseret forskning kan reproduceres af uafhængige teams. Resultater kan udfordres, udvides og bekræftes.
3. **Lighed.** Et gratis instrument betyder, at organisationer af enhver størrelse — en fem-mands startup eller et multinationalt selskab — kan få adgang til de samme validerede målingsværktøjer.
4. **Videnskabelig kumulation.** Fordi tusindvis af forskere verden over bruger de samme offentlige items, vokser evidensbasen kollektivt. Meta-analyser som [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) er mulige præcis fordi forskere brugte sammenlignelige, dokumenterede instrumenter.

[Replikationskrisen](https://en.wikipedia.org/wiki/Replication_crisis) i psykologi har gjort det klart, at videnskab bygget på proprietære, ikke-reviderbare instrumenter er skrøbelig. IPIP er infrastrukturen for personlighedsvidenskab, der faktisk kan replikeres.

## Hvordan Cèrcol bruger IPIP

Cèrcol bruger udelukkende IPIP-items. Hvert spørgsmål i New Moon Cèrcol-vurderingen er trukket fra det offentlige IPIP-item-pool, udvalgt og valideret mod Big Five-faktorstrukturen. Itemsene er dokumenterede, citerbare og uafhængigt verificerbare.

Cèrcols dimensionsnavne — Tilstedeværelse (Ekstraversion), Bånd (Venlighed), Vision (Åbenhed), Disciplin (Samvittighedsfuldhed), Dybde (Neurotisisme) — er produktetiketter til brugervendt kommunikation. De underliggende konstrukter er de standard Big Five-faktorer, målt med IPIP-items.

[Videnskabssiden](/science) dokumenterer de specifikke items, der bruges, scoringsmetodologien og hvad der er og ikke er valideret. [GitHub-repositoriet](https://github.com/cercol/cercol) indeholder den fulde kildekode. Vurderingen er en [First Quarter Cèrcol](/first-quarter)-komponent — et peer-perceptionsinstrument, der indsamler, hvordan andre ser dig på de samme Big Five-dimensioner.

Alt er åbent. Det er pointen.

## Referencer

- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
- Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. *Journal of Research in Personality*, 51, 78–89. [doi:10.1016/j.jrp.2014.05.003](https://doi.org/10.1016/j.jrp.2014.05.003)
- Maples-Keller, J. L., et al. (2019). Using item response theory to develop a 60-item representation of the NEO PI-R using the International Personality Item Pool. *Psychological Assessment*, 31(2), 154–164. [doi:10.1037/pas0000571](https://doi.org/10.1037/pas0000571)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
""",
}

ARTICLE = {
    "title": {
        "en": "What is the IPIP and why does it matter?",
        "ca": "Què és l'IPIP i per què és important?",
        "es": "¿Qué es el IPIP y por qué importa?",
        "fr": "Qu'est-ce que l'IPIP et pourquoi est-il important ?",
        "de": "Was ist der IPIP und warum ist er wichtig?",
        "da": "Hvad er IPIP, og hvorfor er det vigtigt?",
    },
    "description": {
        "en": "Most personality assessments used in organisations are proprietary black boxes. The IPIP is different: 3,000+ free, public-domain items grounded in the Big Five, available to anyone. Here is why that matters.",
        "ca": "La majoria d'avaluacions de personalitat usades a les organitzacions són caixes negres propietàries. L'IPIP és diferent: 3.000+ ítems gratuïts de domini públic basats en el Big Five, disponibles per a tothom.",
        "es": "La mayoría de las evaluaciones de personalidad usadas en organizaciones son cajas negras propietarias. El IPIP es diferente: 3.000+ ítems gratuitos de dominio público basados en el Big Five, disponibles para todos.",
        "fr": "La plupart des évaluations de personnalité utilisées dans les organisations sont des boîtes noires propriétaires. L'IPIP est différent : 3 000+ items gratuits du domaine public ancrés dans le Big Five, disponibles pour tous.",
        "de": "Die meisten in Organisationen verwendeten Persönlichkeitsbewertungen sind proprietäre Black Boxes. Der IPIP ist anders: 3.000+ kostenlose, gemeinfreie Items basierend auf dem Big Five, für alle verfügbar.",
        "da": "De fleste personlighedsvurderinger, der bruges i organisationer, er proprietære sorte bokse. IPIP er anderledes: 3.000+ gratis items i offentligt domæne baseret på Big Five, tilgængelige for alle.",
    },
    "content": CONTENT,
    "cover_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80",
}


async def main():
    conn = await asyncpg.connect(DATABASE_URL)
    await conn.execute(
        "UPDATE blog_posts SET title=$1::jsonb, description=$2::jsonb, content=$3::jsonb, cover_url=$4, updated_at=now() WHERE slug=$5",
        json.dumps(ARTICLE["title"]),
        json.dumps(ARTICLE["description"]),
        json.dumps(ARTICLE["content"]),
        ARTICLE["cover_url"],
        "what-is-the-ipip",
    )
    print("✓ what-is-the-ipip updated (6 languages)")
    await conn.close()


asyncio.run(main())
