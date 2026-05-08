#!/usr/bin/env python3
"""Update blog post 2: How to build a balanced team using personality science — enriched EN + full translations."""
import asyncio, asyncpg, json, os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://cercol:cercol_db_2026@localhost:5432/cercol")

SVG_TEAM = """\
<figure style="text-align:center;margin:2rem 0">
<svg width="520" height="100" viewBox="0 0 520 100" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:8px;background:#f0f4ff">
  <text x="260" y="16" font-size="11" fill="#1a3a6b" font-weight="bold" text-anchor="middle">Five dimensions — team contributions (Bell, 2007)</text>
  <rect x="8" y="24" width="92" height="64" fill="#0047ba" rx="5"/>
  <text x="54" y="46" font-size="10" fill="white" text-anchor="middle" font-weight="bold">Vision</text>
  <text x="54" y="60" font-size="9" fill="rgba(255,255,255,0.85)" text-anchor="middle">Creativity</text>
  <text x="54" y="73" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Innovation</text>
  <text x="54" y="84" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">Ambiguity</text>
  <rect x="110" y="24" width="100" height="64" fill="#427c42" rx="5"/>
  <text x="160" y="46" font-size="10" fill="white" text-anchor="middle" font-weight="bold">Discipline</text>
  <text x="160" y="60" font-size="9" fill="rgba(255,255,255,0.85)" text-anchor="middle">Follow-through</text>
  <text x="160" y="73" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Reliability</text>
  <text x="160" y="84" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">Quality</text>
  <rect x="220" y="24" width="90" height="64" fill="#cf3339" rx="5"/>
  <text x="265" y="46" font-size="10" fill="white" text-anchor="middle" font-weight="bold">Presence</text>
  <text x="265" y="60" font-size="9" fill="rgba(255,255,255,0.85)" text-anchor="middle">Energy</text>
  <text x="265" y="73" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Initiative</text>
  <text x="265" y="84" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">Engagement</text>
  <rect x="320" y="24" width="100" height="64" fill="#f1c22f" rx="5"/>
  <text x="370" y="46" font-size="10" fill="#333" text-anchor="middle" font-weight="bold">Bond</text>
  <text x="370" y="60" font-size="9" fill="#444" text-anchor="middle">Cooperation</text>
  <text x="370" y="73" font-size="8" fill="#555" text-anchor="middle">Trust</text>
  <text x="370" y="84" font-size="8" fill="#666" text-anchor="middle">Cohesion</text>
  <rect x="430" y="24" width="82" height="64" fill="#6b7280" rx="5"/>
  <text x="471" y="46" font-size="10" fill="white" text-anchor="middle" font-weight="bold">Depth</text>
  <text x="471" y="60" font-size="9" fill="rgba(255,255,255,0.85)" text-anchor="middle">Sensitivity</text>
  <text x="471" y="73" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">Caution</text>
  <text x="471" y="84" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">Perception</text>
</svg>
<figcaption style="font-size:0.8rem;color:#6b7280;margin-top:0.5rem">{caption}</figcaption>
</figure>"""

CAPTIONS = {
    "en": "The five Big Five dimensions and their primary contributions to team effectiveness. Bell (2007) found mean Conscientiousness and mean Agreeableness to be the most consistent predictors of team performance.",
    "ca": "Les cinc dimensions del Big Five i les seues principals contribucions a l'eficàcia de l'equip. Bell (2007) va trobar que la Responsabilitat i l'Amabilitat mitjanes eren els predictors més consistents del rendiment de l'equip.",
    "es": "Las cinco dimensiones del Big Five y sus principales contribuciones a la eficacia del equipo. Bell (2007) encontró que la Responsabilidad y la Amabilidad medias eran los predictores más consistentes del rendimiento del equipo.",
    "fr": "Les cinq dimensions du Big Five et leurs contributions principales à l'efficacité d'équipe. Bell (2007) a trouvé que la Conscienciosité et l'Agréabilité moyennes étaient les prédicteurs les plus cohérents de la performance d'équipe.",
    "de": "Die fünf Big-Five-Dimensionen und ihre wichtigsten Beiträge zur Teameffektivität. Bell (2007) fand heraus, dass mittlere Gewissenhaftigkeit und mittlere Verträglichkeit die konsistentesten Prädiktoren der Teamleistung waren.",
    "da": "De fem Big Five-dimensioner og deres primære bidrag til teameffektivitet. Bell (2007) fandt, at gennemsnitlig Samvittighedsfuldhed og gennemsnitlig Venlighed var de mest konsistente forudsigere af teampræstation.",
}


def svg(lang):
    return SVG_TEAM.format(caption=CAPTIONS[lang])


CONTENT = {
    "en": f"""\
What happens when a team is full of visionaries but no one follows through? Or when every member is highly conscientious but no one generates new ideas? Personality composition — not just individual fit — shapes how teams perform. A growing body of [meta-analytic](https://en.wikipedia.org/wiki/Meta-analysis) research shows that *which* traits are present in a team, and in what proportion, is a meaningful predictor of outcomes. This guide explains what the science says and how to apply it practically.

{svg("en")}

## What the research says

[Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) conducted a [meta-analysis](https://en.wikipedia.org/wiki/Meta-analysis) of 60 independent studies examining team composition based on the [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) personality model. The review covered a wide range of task types — from project teams to military units — and found that personality composition at the team level predicts performance above and beyond individual-level effects.

> **Meta-analytic finding:** [Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) examined 60 studies on team composition. Mean Conscientiousness and mean Agreeableness showed the most consistent positive relationships with team performance across task types. Effect sizes were in the small-to-moderate range.

Earlier, [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) had already established in a landmark [meta-analysis](https://en.wikipedia.org/wiki/Meta-analysis) that Conscientiousness predicts individual job performance across all occupational categories. Bell's work extended this logic to the team level: the *mean* Conscientiousness of a team — not just its highest scorer — predicts collective performance. Similarly, mean Agreeableness matters for cooperative work.

[Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) further situate team composition within personality circumplex models, confirming that Big Five–based frameworks offer stronger theoretical and empirical grounding than behaviour-observation systems.

## The five dimensions

| Dimension | Team contribution | Risk at low levels | Risk at high levels |
|-----------|------------------|--------------------|---------------------|
| Vision (Openness) | Innovation, creativity, adaptability to change | Rigidity, resistance to new approaches | Unfocused ideation, impractical plans |
| Discipline (Conscientiousness) | Reliability, follow-through, quality | Missed deadlines, poor execution | Inflexibility in fast-changing contexts |
| Presence (Extraversion) | Energy, initiative, external engagement | Passivity, low momentum | Conflict, dominance struggles |
| Bond (Agreeableness) | Cooperation, trust, psychological safety | Interpersonal conflict, low cohesion | Groupthink, avoidance of productive conflict |
| Depth (Neuroticism) | Caution, sensitivity to risk, thoroughness | Overconfidence, blind optimism | Stress contagion, decision paralysis |

These five dimensions correspond to the [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism — OCEAN) as measured by public-domain [IPIP](https://ipip.ori.org) items, which form the scientific basis of the [Cèrcol](/science) assessment.

## Beyond averages: the role of diversity

Bell (2007) also found that *minimum* scores matter in some domains: a team with even one very disagreeable member suffers coordination costs that cannot be offset by other members' high Agreeableness. This is called the minimum-score effect.

Diversity in Openness (Vision) can be an asset when teams face both creative and implementation tasks — a mix of high- and moderate-Vision members can generate ideas *and* evaluate them critically. Diversity in Conscientiousness (Discipline), however, tends to be a liability: when some members follow through and others don't, trust erodes and coordination costs rise.

These are probabilistic findings with small-to-moderate effect sizes. Personality composition provides a statistical signal, not a deterministic outcome. Team processes — norms, leadership, feedback culture — mediate and moderate these effects substantially.

## How to use this practically

**Start with the [Cèrcol](/science) profile.** The [First Quarter](/first-quarter) peer assessment gives you team-level aggregates across all five dimensions, based on how each person is *perceived* by colleagues — a stronger signal than self-report for team dynamics.

**Look at your team's mean scores across the five dimensions.** Where is your team's collective Discipline score? A team building a new product may tolerate lower mean Discipline in early creative phases but will need it higher as delivery milestones approach.

**Flag extreme lows and highs.** A team with very high mean Presence (Extraversion) but low mean Bond (Agreeableness) is energetic but fragile — prone to dominance conflicts. A team with very high mean Discipline but very low mean Vision may execute well on known tasks but struggle to adapt to new challenges.

**Do not use personality data to exclude people.** The research supports team-level composition thinking, not individual gatekeeping. No single personality profile makes someone a good or bad team member in all contexts. Use the data to inform team processes and development, not hiring or firing.

**Revisit as the team evolves.** Team composition changes over time. A quarterly [First Quarter](/first-quarter) peer assessment via [Cèrcol](/first-quarter) gives you a longitudinal view of how collective personality perception shifts as new members join or roles change.

For a broader comparison of personality frameworks, see [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin).

## References

- Bell, S. T. (2007). Deep-level composition variables as predictors of team performance: A meta-analysis. *Journal of Applied Psychology*, 92(3), 595–615. [doi:10.1037/0021-9010.92.3.595](https://doi.org/10.1037/0021-9010.92.3.595)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "ca": f"""\
Què passa quan un equip és ple de visionaris però ningú executa? O quan tots els membres tenen una disciplina molt alta però ningú genera idees noves? La composició de personalitat — no sols l'encaix individual — determina com rendeix un equip. Un nombre creixent d'estudis [meta-analítics](https://en.wikipedia.org/wiki/Meta-analysis) mostra que *quins* trets de personalitat estan presents en un equip, i en quina proporció, és un predictor rellevant dels resultats. Aquesta guia explica el que diu la ciència i com aplicar-ho de manera pràctica.

{svg("ca")}

## El que diu la investigació

[Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) va dur a terme una [meta-anàlisi](https://en.wikipedia.org/wiki/Meta-analysis) de 60 estudis independents sobre composició d'equips basada en el model de personalitat [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits). La revisió va cobrir una àmplia varietat de tipus de tasques — des d'equips de projectes fins a unitats militars — i va trobar que la composició de personalitat a nivell d'equip prediu el rendiment per damunt dels efectes individuals.

> **Resultat meta-analític:** [Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) va examinar 60 estudis sobre composició d'equips. La Responsabilitat (Disciplina) i l'Amabilitat (Vincle) mitjanes van mostrar les relacions positives més consistents amb el rendiment de l'equip en tots els tipus de tasques. Les mides de l'efecte eren de petites a moderades.

Anteriorment, [Barrick i Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) ja havien establert en una [meta-anàlisi](https://en.wikipedia.org/wiki/Meta-analysis) de referència que la Responsabilitat prediu el rendiment laboral individual en totes les categories ocupacionals. El treball de Bell va estendre esta lògica al nivell d'equip: la Responsabilitat *mitjana* d'un equip — no sols la del membre amb la puntuació més alta — prediu el rendiment col·lectiu. De la mateixa manera, l'Amabilitat mitjana importa per al treball cooperatiu.

[Nestsiarovich i Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) situen la composició d'equips dins dels models de circumflex de personalitat, confirmant que els marcs basats en el Big Five ofereixen una fonamentació teòrica i empírica més sòlida que els sistemes d'observació conductual.

## Les cinc dimensions

| Dimensió | Contribució a l'equip | Risc en nivells baixos | Risc en nivells alts |
|----------|-----------------------|------------------------|----------------------|
| Visió (Obertura) | Innovació, creativitat, adaptabilitat al canvi | Rigidesa, resistència als nous enfocaments | Ideació poc enfocada, plans poc pràctics |
| Disciplina (Responsabilitat) | Fiabilitat, seguiment, qualitat | Incompliment de terminis, execució deficient | Inflexibilitat en contextos de canvi ràpid |
| Presència (Extraversió) | Energia, iniciativa, compromís extern | Passivitat, poc impuls | Conflicte, lluites de dominació |
| Vincle (Amabilitat) | Cooperació, confiança, seguretat psicològica | Conflicte interpersonal, poca cohesió | Pensament de grup, evitació del conflicte productiu |
| Profunditat (Neuroticisme) | Cautela, sensibilitat al risc, rigorositat | Excés de confiança, optimisme cec | Contagi d'estrès, paràlisi en la presa de decisions |

Estes cinc dimensions corresponen al [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) (Obertura, Responsabilitat, Extraversió, Amabilitat, Neuroticisme — OCEAN) mesurat amb ítems de domini públic [IPIP](https://ipip.ori.org), que constitueixen la base científica de l'avaluació [Cèrcol](/science).

## Més enllà de les mitjanes: el paper de la diversitat

Bell (2007) també va trobar que les puntuacions *mínimes* importen en alguns dominis: un equip amb fins i tot un sol membre molt poc amable pateix costos de coordinació que no poden compensar-se amb l'alta Amabilitat dels altres membres. Açò s'anomena l'efecte de puntuació mínima.

La diversitat en Visió (Obertura) pot ser un actiu quan els equips s'enfronten a tasques tant creatives com d'implementació — una combinació de membres amb Visió alta i moderada pot generar idees *i* avaluar-les críticament. La diversitat en Disciplina (Responsabilitat), en canvi, tendeix a ser una càrrega: quan alguns membres executen i altres no, la confiança s'erosiona i els costos de coordinació augmenten.

Estes troballes són probabilístiques amb mides de l'efecte de petites a moderades. La composició de personalitat proporciona un senyal estadístic, no un resultat determinístic. Els processos de l'equip — normes, lideratge, cultura de retroalimentació — medien i modifiquen estos efectes de manera substancial.

## Com aplicar-ho de manera pràctica

**Comença amb el perfil [Cèrcol](/science).** L'avaluació de parells del [Primer Quart](/first-quarter) et proporciona agregats a nivell d'equip en les cinc dimensions, basats en com *perceben* cada persona els seus col·legues — un senyal més fort que l'autoinforme per a la dinàmica d'equip.

**Analitza les puntuacions mitjanes del teu equip en les cinc dimensions.** On se situa la Disciplina col·lectiva del teu equip? Un equip que construeix un nou producte pot tolerar una Disciplina mitjana més baixa en les fases creatives inicials, però la necessitarà més alta a mesura que s'acosten les fites de lliurament.

**Identifica els extrems baixos i alts.** Un equip amb una Presència (Extraversió) mitjana molt alta però un Vincle (Amabilitat) mitjà baix és enèrgic però fràgil — propens als conflictes de dominació. Un equip amb una Disciplina mitjana molt alta però una Visió (Obertura) mitjana molt baixa pot executar bé tasques conegudes però tenir dificultats per adaptar-se als nous reptes.

**No utilises les dades de personalitat per excloure persones.** La investigació dóna suport al pensament sobre composició a nivell d'equip, no al control individual. Cap perfil de personalitat únic fa que algú siga un bon o mal membre d'equip en tots els contextos. Utilitza les dades per informar els processos i el desenvolupament de l'equip, no per a la contractació o el comiat.

**Revisita-ho a mesura que l'equip evoluciona.** La composició de l'equip canvia amb el temps. Una avaluació trimestral de parells [Primer Quart](/first-quarter) a través de [Cèrcol](/first-quarter) et dóna una visió longitudinal de com canvia la percepció col·lectiva de la personalitat a mesura que s'uneixen nous membres o canvien els rols.

Per a una comparació més àmplia dels marcs de personalitat, consulta [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin).

## Referències

- Bell, S. T. (2007). Deep-level composition variables as predictors of team performance: A meta-analysis. *Journal of Applied Psychology*, 92(3), 595–615. [doi:10.1037/0021-9010.92.3.595](https://doi.org/10.1037/0021-9010.92.3.595)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "es": f"""\
¿Qué pasa cuando un equipo está lleno de visionarios pero nadie ejecuta? ¿O cuando todos los miembros tienen una disciplina muy alta pero nadie genera ideas nuevas? La composición de personalidad — no solo el encaje individual — determina cómo rinde un equipo. Un número creciente de estudios [meta-analíticos](https://en.wikipedia.org/wiki/Meta-analysis) muestra que *qué* rasgos de personalidad están presentes en un equipo, y en qué proporción, es un predictor relevante de los resultados. Esta guía explica lo que dice la ciencia y cómo aplicarlo de manera práctica.

{svg("es")}

## Lo que dice la investigación

[Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) realizó una [meta-análisis](https://en.wikipedia.org/wiki/Meta-analysis) de 60 estudios independientes sobre composición de equipos basada en el modelo de personalidad [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits). La revisión cubrió una amplia variedad de tipos de tareas — desde equipos de proyectos hasta unidades militares — y encontró que la composición de personalidad a nivel de equipo predice el rendimiento por encima de los efectos individuales.

> **Hallazgo meta-analítico:** [Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) examinó 60 estudios sobre composición de equipos. La Responsabilidad (Disciplina) y la Amabilidad (Vínculo) medias mostraron las relaciones positivas más consistentes con el rendimiento del equipo en todos los tipos de tareas. Los tamaños del efecto fueron de pequeños a moderados.

Anteriormente, [Barrick y Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) ya habían establecido en una [meta-análisis](https://en.wikipedia.org/wiki/Meta-analysis) de referencia que la Responsabilidad predice el rendimiento laboral individual en todas las categorías ocupacionales. El trabajo de Bell extendió esta lógica al nivel de equipo: la Responsabilidad *media* de un equipo — no solo la del miembro con la puntuación más alta — predice el rendimiento colectivo. Del mismo modo, la Amabilidad media importa para el trabajo cooperativo.

[Nestsiarovich y Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) sitúan la composición de equipos dentro de los modelos de circumplejo de personalidad, confirmando que los marcos basados en el Big Five ofrecen una fundamentación teórica y empírica más sólida que los sistemas de observación conductual.

## Las cinco dimensiones

| Dimensión | Contribución al equipo | Riesgo en niveles bajos | Riesgo en niveles altos |
|-----------|------------------------|-------------------------|-------------------------|
| Visión (Apertura) | Innovación, creatividad, adaptabilidad al cambio | Rigidez, resistencia a nuevos enfoques | Ideación poco enfocada, planes poco prácticos |
| Disciplina (Responsabilidad) | Fiabilidad, seguimiento, calidad | Incumplimiento de plazos, ejecución deficiente | Inflexibilidad en contextos de cambio rápido |
| Presencia (Extraversión) | Energía, iniciativa, compromiso externo | Pasividad, poco impulso | Conflicto, luchas de dominación |
| Vínculo (Amabilidad) | Cooperación, confianza, seguridad psicológica | Conflicto interpersonal, poca cohesión | Pensamiento de grupo, evitación del conflicto productivo |
| Profundidad (Neuroticismo) | Cautela, sensibilidad al riesgo, rigurosidad | Exceso de confianza, optimismo ciego | Contagio de estrés, parálisis en la toma de decisiones |

Estas cinco dimensiones corresponden al [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) (Apertura, Responsabilidad, Extraversión, Amabilidad, Neuroticismo — OCEAN) medido con ítems de dominio público [IPIP](https://ipip.ori.org), que constituyen la base científica de la evaluación [Cèrcol](/science).

## Más allá de las medias: el papel de la diversidad

Bell (2007) también encontró que las puntuaciones *mínimas* importan en algunos dominios: un equipo con incluso un solo miembro muy poco amable sufre costes de coordinación que no pueden compensarse con la alta Amabilidad de los demás miembros. Esto se llama el efecto de puntuación mínima.

La diversidad en Visión (Apertura) puede ser un activo cuando los equipos se enfrentan a tareas tanto creativas como de implementación — una combinación de miembros con Visión alta y moderada puede generar ideas *y* evaluarlas críticamente. La diversidad en Disciplina (Responsabilidad), en cambio, tiende a ser una carga: cuando algunos miembros ejecutan y otros no, la confianza se erosiona y los costes de coordinación aumentan.

Estos hallazgos son probabilísticos con tamaños del efecto de pequeños a moderados. La composición de personalidad proporciona una señal estadística, no un resultado determinístico. Los procesos del equipo — normas, liderazgo, cultura de retroalimentación — median y moderan estos efectos de manera sustancial.

## Cómo aplicarlo de manera práctica

**Empieza con el perfil [Cèrcol](/science).** La evaluación de pares del [Primer Cuarto](/first-quarter) te proporciona agregados a nivel de equipo en las cinco dimensiones, basados en cómo *perciben* a cada persona sus colegas — una señal más fuerte que el autoinforme para la dinámica de equipo.

**Analiza las puntuaciones medias de tu equipo en las cinco dimensiones.** ¿Dónde se sitúa la Disciplina colectiva de tu equipo? Un equipo que construye un nuevo producto puede tolerar una Disciplina media más baja en las fases creativas iniciales, pero la necesitará más alta a medida que se acerquen los hitos de entrega.

**Identifica los extremos bajos y altos.** Un equipo con una Presencia (Extraversión) media muy alta pero un Vínculo (Amabilidad) medio bajo es enérgico pero frágil — propenso a los conflictos de dominación. Un equipo con una Disciplina media muy alta pero una Visión (Apertura) media muy baja puede ejecutar bien tareas conocidas pero tener dificultades para adaptarse a nuevos retos.

**No uses los datos de personalidad para excluir personas.** La investigación respalda el pensamiento sobre composición a nivel de equipo, no el control individual. Ningún perfil de personalidad único hace que alguien sea un buen o mal miembro del equipo en todos los contextos. Usa los datos para informar los procesos y el desarrollo del equipo, no para la contratación o el despido.

**Revisítalo a medida que el equipo evoluciona.** La composición del equipo cambia con el tiempo. Una evaluación trimestral de pares [Primer Cuarto](/first-quarter) a través de [Cèrcol](/first-quarter) te da una visión longitudinal de cómo cambia la percepción colectiva de la personalidad a medida que se unen nuevos miembros o cambian los roles.

Para una comparación más amplia de los marcos de personalidad, consulta [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin).

## Referencias

- Bell, S. T. (2007). Deep-level composition variables as predictors of team performance: A meta-analysis. *Journal of Applied Psychology*, 92(3), 595–615. [doi:10.1037/0021-9010.92.3.595](https://doi.org/10.1037/0021-9010.92.3.595)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "fr": f"""\
Que se passe-t-il quand une équipe est remplie de visionnaires mais que personne ne suit jusqu'au bout ? Ou quand tous les membres sont très consciencieux mais que personne ne génère de nouvelles idées ? La composition de personnalité — pas seulement l'adéquation individuelle — détermine la performance d'une équipe. Un nombre croissant d'études [méta-analytiques](https://en.wikipedia.org/wiki/Meta-analysis) montre que *quels* traits de personnalité sont présents dans une équipe, et en quelle proportion, est un prédicteur significatif des résultats. Ce guide explique ce que dit la science et comment l'appliquer concrètement.

{svg("fr")}

## Ce que dit la recherche

[Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) a conduit une [méta-analyse](https://en.wikipedia.org/wiki/Meta-analysis) de 60 études indépendantes sur la composition d'équipes basée sur le modèle de personnalité [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits). La revue a couvert une large variété de types de tâches — des équipes projet aux unités militaires — et a montré que la composition de personnalité au niveau de l'équipe prédit la performance au-delà des effets individuels.

> **Résultat méta-analytique :** [Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) a examiné 60 études sur la composition d'équipes. La Conscienciosité (Discipline) et l'Agréabilité (Lien) moyennes ont montré les relations positives les plus cohérentes avec la performance d'équipe sur tous les types de tâches. Les tailles d'effet étaient de faibles à modérées.

Auparavant, [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) avaient établi dans une [méta-analyse](https://en.wikipedia.org/wiki/Meta-analysis) de référence que la Conscienciosité prédit la performance professionnelle individuelle dans toutes les catégories d'emploi. Le travail de Bell a étendu cette logique au niveau de l'équipe : la Conscienciosité *moyenne* d'une équipe — pas seulement celle du membre au score le plus élevé — prédit la performance collective. De même, l'Agréabilité moyenne compte pour le travail coopératif.

[Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) situent la composition d'équipes dans les modèles de circonflexe de personnalité, confirmant que les cadres basés sur le Big Five offrent une base théorique et empirique plus solide que les systèmes d'observation comportementale.

## Les cinq dimensions

| Dimension | Contribution à l'équipe | Risque à niveaux bas | Risque à niveaux élevés |
|-----------|-------------------------|----------------------|-------------------------|
| Vision (Ouverture) | Innovation, créativité, adaptabilité au changement | Rigidité, résistance aux nouvelles approches | Idéation peu ciblée, plans peu pratiques |
| Discipline (Conscienciosité) | Fiabilité, suivi, qualité | Non-respect des délais, mauvaise exécution | Inflexibilité dans les contextes à changement rapide |
| Présence (Extraversion) | Énergie, initiative, engagement externe | Passivité, faible dynamisme | Conflits, luttes de domination |
| Lien (Agréabilité) | Coopération, confiance, sécurité psychologique | Conflits interpersonnels, faible cohésion | Pensée de groupe, évitement des conflits productifs |
| Profondeur (Névrosisme) | Prudence, sensibilité au risque, rigueur | Excès de confiance, optimisme aveugle | Contagion du stress, paralysie décisionnelle |

Ces cinq dimensions correspondent au [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) (Ouverture, Conscienciosité, Extraversion, Agréabilité, Névrosisme — OCEAN) mesuré avec des items de domaine public [IPIP](https://ipip.ori.org), qui constituent la base scientifique de l'évaluation [Cèrcol](/science).

## Au-delà des moyennes : le rôle de la diversité

Bell (2007) a également constaté que les scores *minimaux* importent dans certains domaines : une équipe avec même un seul membre très peu agréable subit des coûts de coordination que les scores élevés d'Agréabilité des autres membres ne peuvent compenser. C'est ce qu'on appelle l'effet de score minimum.

La diversité en Vision (Ouverture) peut être un atout lorsque les équipes font face à des tâches à la fois créatives et d'implémentation — un mélange de membres avec une Vision élevée et modérée peut générer des idées *et* les évaluer de façon critique. La diversité en Discipline (Conscienciosité), en revanche, tend à être un handicap : quand certains membres suivent et d'autres non, la confiance s'érode et les coûts de coordination augmentent.

Ces résultats sont probabilistes avec des tailles d'effet de faibles à modérées. La composition de personnalité fournit un signal statistique, non un résultat déterministe. Les processus d'équipe — normes, leadership, culture de feedback — médiatisent et modèrent ces effets de manière substantielle.

## Comment l'appliquer concrètement

**Commencez par le profil [Cèrcol](/science).** L'évaluation par les pairs du [Premier Quartier](/first-quarter) vous fournit des agrégats au niveau de l'équipe sur les cinq dimensions, basés sur la façon dont chaque personne est *perçue* par ses collègues — un signal plus fort que l'auto-évaluation pour la dynamique d'équipe.

**Examinez les scores moyens de votre équipe sur les cinq dimensions.** Où se situe la Discipline collective de votre équipe ? Une équipe qui construit un nouveau produit peut tolérer une Discipline moyenne plus faible lors des phases créatives initiales, mais en aura besoin d'une plus élevée à l'approche des jalons de livraison.

**Identifiez les extrêmes bas et élevés.** Une équipe avec une Présence (Extraversion) moyenne très élevée mais un Lien (Agréabilité) moyen faible est énergique mais fragile — sujette aux conflits de domination. Une équipe avec une Discipline moyenne très élevée mais une Vision (Ouverture) moyenne très faible peut bien exécuter des tâches connues mais avoir du mal à s'adapter aux nouveaux défis.

**N'utilisez pas les données de personnalité pour exclure des personnes.** La recherche soutient la réflexion sur la composition au niveau de l'équipe, pas le contrôle individuel. Aucun profil de personnalité unique ne fait de quelqu'un un bon ou mauvais membre d'équipe dans tous les contextes. Utilisez les données pour informer les processus et le développement de l'équipe, pas les embauches ou licenciements.

**Revisitez-le à mesure que l'équipe évolue.** La composition de l'équipe change avec le temps. Une évaluation par les pairs [Premier Quartier](/first-quarter) trimestrielle via [Cèrcol](/first-quarter) vous donne une vision longitudinale de la façon dont la perception collective de la personnalité évolue à mesure que de nouveaux membres rejoignent l'équipe ou que les rôles changent.

Pour une comparaison plus large des cadres de personnalité, voir [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin).

## Références

- Bell, S. T. (2007). Deep-level composition variables as predictors of team performance: A meta-analysis. *Journal of Applied Psychology*, 92(3), 595–615. [doi:10.1037/0021-9010.92.3.595](https://doi.org/10.1037/0021-9010.92.3.595)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "de": f"""\
Was passiert, wenn ein Team voller Visionäre ist, aber niemand umsetzt? Oder wenn alle Mitglieder sehr gewissenhaft sind, aber niemand neue Ideen entwickelt? Die Persönlichkeitszusammensetzung — nicht nur die individuelle Eignung — bestimmt, wie ein Team leistet. Eine wachsende Anzahl von [meta-analytischen](https://en.wikipedia.org/wiki/Meta-analysis) Studien zeigt, dass *welche* Persönlichkeitseigenschaften in einem Team vorhanden sind und in welchem Verhältnis, ein bedeutsamer Prädiktor für Ergebnisse ist. Dieser Leitfaden erklärt, was die Wissenschaft sagt und wie man es praktisch anwendet.

{svg("de")}

## Was die Forschung sagt

[Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) führte eine [Meta-Analyse](https://en.wikipedia.org/wiki/Meta-analysis) von 60 unabhängigen Studien zur Teamzusammensetzung auf Basis des [Big-Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits)-Persönlichkeitsmodells durch. Die Übersicht umfasste eine breite Palette von Aufgabentypen — von Projektteams bis hin zu Militäreinheiten — und fand, dass die Persönlichkeitszusammensetzung auf Teamebene die Leistung über individuelle Effekte hinaus vorhersagt.

> **Meta-analytischer Befund:** [Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) untersuchte 60 Studien zur Teamzusammensetzung. Mittlere Gewissenhaftigkeit (Disziplin) und mittlere Verträglichkeit (Bindung) zeigten die konsistentesten positiven Beziehungen zur Teamleistung über alle Aufgabentypen hinweg. Die Effektgrößen lagen im kleinen bis moderaten Bereich.

Zuvor hatten [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) in einer wegweisenden [Meta-Analyse](https://en.wikipedia.org/wiki/Meta-analysis) bereits festgestellt, dass Gewissenhaftigkeit die individuelle Arbeitsleistung in allen Berufsgruppen vorhersagt. Bells Arbeit erweiterte diese Logik auf die Teamebene: Die *mittlere* Gewissenhaftigkeit eines Teams — nicht nur die des Mitglieds mit der höchsten Punktzahl — sagt die kollektive Leistung voraus. Ebenso ist die mittlere Verträglichkeit für kooperative Arbeit relevant.

[Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) ordnen die Teamzusammensetzung in Persönlichkeitszirkumplexmodelle ein und bestätigen, dass Big-Five-basierte Frameworks eine stärkere theoretische und empirische Grundlage bieten als verhaltensbasierte Beobachtungssysteme.

## Die fünf Dimensionen

| Dimension | Beitrag zum Team | Risiko bei niedrigen Werten | Risiko bei hohen Werten |
|-----------|------------------|------------------------------|--------------------------|
| Vision (Offenheit) | Innovation, Kreativität, Anpassungsfähigkeit | Starrheit, Widerstand gegen neue Ansätze | Unstrukturierte Ideenfindung, unpraktische Pläne |
| Disziplin (Gewissenhaftigkeit) | Zuverlässigkeit, Umsetzung, Qualität | Verpasste Fristen, schlechte Ausführung | Inflexibilität in schnellwandelnden Kontexten |
| Präsenz (Extraversion) | Energie, Initiative, externes Engagement | Passivität, wenig Schwung | Konflikte, Dominanzkämpfe |
| Bindung (Verträglichkeit) | Kooperation, Vertrauen, psychologische Sicherheit | Zwischenmenschliche Konflikte, geringe Kohäsion | Gruppendenken, Vermeidung produktiver Konflikte |
| Tiefe (Neurotizismus) | Vorsicht, Risikoempfindlichkeit, Gründlichkeit | Überkonfidenz, blinder Optimismus | Stressansteckung, Entscheidungslähmung |

Diese fünf Dimensionen entsprechen dem [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) (Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, Neurotizismus — OCEAN), gemessen mit gemeinfreien [IPIP](https://ipip.ori.org)-Items, die die wissenschaftliche Grundlage der [Cèrcol](/science)-Bewertung bilden.

## Über Durchschnittswerte hinaus: die Rolle der Diversität

Bell (2007) fand auch, dass *Mindestwerte* in einigen Bereichen eine Rolle spielen: Ein Team mit auch nur einem einzigen sehr unverträglichen Mitglied leidet unter Koordinationskosten, die durch die hohe Verträglichkeit der anderen Mitglieder nicht ausgeglichen werden können. Dies wird als Mindestwert-Effekt bezeichnet.

Diversität in Vision (Offenheit) kann ein Vorteil sein, wenn Teams sowohl kreative als auch Umsetzungsaufgaben bewältigen müssen — eine Mischung aus Mitgliedern mit hoher und moderater Vision kann Ideen generieren *und* sie kritisch bewerten. Diversität in Disziplin (Gewissenhaftigkeit) hingegen neigt dazu, eine Belastung zu sein: Wenn einige Mitglieder umsetzen und andere nicht, erodiert das Vertrauen und die Koordinationskosten steigen.

Diese Befunde sind probabilistisch mit kleinen bis moderaten Effektgrößen. Die Persönlichkeitszusammensetzung liefert ein statistisches Signal, kein deterministisches Ergebnis. Teamprozesse — Normen, Führung, Feedbackkultur — vermitteln und moderieren diese Effekte erheblich.

## Wie man es praktisch anwendet

**Beginnen Sie mit dem [Cèrcol](/science)-Profil.** Die Peer-Bewertung des [Ersten Quartals](/first-quarter) liefert Ihnen Aggregate auf Teamebene in allen fünf Dimensionen, basierend darauf, wie jede Person von Kollegen *wahrgenommen* wird — ein stärkeres Signal als Selbstberichte für die Teamdynamik.

**Analysieren Sie die durchschnittlichen Scores Ihres Teams in den fünf Dimensionen.** Wo liegt die kollektive Disziplin Ihres Teams? Ein Team, das ein neues Produkt entwickelt, kann in frühen kreativen Phasen eine niedrigere mittlere Disziplin tolerieren, benötigt diese aber höher, wenn Liefermeilensteine näher rücken.

**Identifizieren Sie extreme Tief- und Hochpunkte.** Ein Team mit sehr hoher mittlerer Präsenz (Extraversion) aber niedriger mittlerer Bindung (Verträglichkeit) ist energetisch, aber fragil — anfällig für Dominanzkonflikte. Ein Team mit sehr hoher mittlerer Disziplin aber sehr niedriger mittlerer Vision (Offenheit) kann bekannte Aufgaben gut ausführen, hat aber Schwierigkeiten, sich an neue Herausforderungen anzupassen.

**Verwenden Sie Persönlichkeitsdaten nicht, um Personen auszuschließen.** Die Forschung unterstützt das Denken über Zusammensetzung auf Teamebene, nicht individuelle Kontrolle. Kein einziges Persönlichkeitsprofil macht jemanden in allen Kontexten zu einem guten oder schlechten Teammitglied. Verwenden Sie die Daten, um Teamprozesse und -entwicklung zu informieren, nicht für Einstellungen oder Entlassungen.

**Überprüfen Sie es, wenn das Team sich weiterentwickelt.** Die Teamzusammensetzung ändert sich im Laufe der Zeit. Eine vierteljährliche Peer-Bewertung [Erstes Quartal](/first-quarter) über [Cèrcol](/first-quarter) gibt Ihnen einen longitudinalen Blick darauf, wie sich die kollektive Persönlichkeitswahrnehmung verändert, wenn neue Mitglieder hinzukommen oder sich Rollen ändern.

Für einen umfassenderen Vergleich von Persönlichkeits-Frameworks siehe [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin).

## Referenzen

- Bell, S. T. (2007). Deep-level composition variables as predictors of team performance: A meta-analysis. *Journal of Applied Psychology*, 92(3), 595–615. [doi:10.1037/0021-9010.92.3.595](https://doi.org/10.1037/0021-9010.92.3.595)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",

    "da": f"""\
Hvad sker der, når et team er fyldt med visionærer, men ingen følger op? Eller når alle medlemmer er meget samvittighedsfulde, men ingen genererer nye ideer? Personlighedssammensætning — ikke kun individuel egnethed — bestemmer, hvordan et team præsterer. Et voksende antal [meta-analytiske](https://en.wikipedia.org/wiki/Meta-analysis) studier viser, at *hvilke* personlighedstræk der er til stede i et team, og i hvilken proportion, er en meningsfuld prædiktor for resultater. Denne guide forklarer, hvad videnskaben siger, og hvordan man anvender det i praksis.

{svg("da")}

## Hvad forskningen siger

[Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) gennemførte en [meta-analyse](https://en.wikipedia.org/wiki/Meta-analysis) af 60 uafhængige studier om teamsammensætning baseret på [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits)-personlighedsmodellen. Gennemgangen dækkede en bred vifte af opgavetyper — fra projektteams til militærenheder — og fandt, at personlighedssammensætning på teamniveau forudsiger præstation ud over individuelle effekter.

> **Meta-analytisk fund:** [Bell (2007)](https://doi.org/10.1037/0021-9010.92.3.595) undersøgte 60 studier om teamsammensætning. Gennemsnitlig Samvittighedsfuldhed (Disciplin) og gennemsnitlig Venlighed (Bånd) viste de mest konsistente positive relationer til teampræstation på tværs af alle opgavetyper. Effektstørrelserne var i det lille til moderate område.

Tidligere havde [Barrick & Mount (1991)](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x) allerede etableret i en banebrydende [meta-analyse](https://en.wikipedia.org/wiki/Meta-analysis), at Samvittighedsfuldhed forudsiger individuel jobpræstation på tværs af alle erhvervskategorier. Bells arbejde udvidede denne logik til teamniveau: Den *gennemsnitlige* Samvittighedsfuldhed i et team — ikke kun det højest scorende members — forudsiger kollektiv præstation. Tilsvarende tæller gennemsnitlig Venlighed for kooperativt arbejde.

[Nestsiarovich & Pons (2020)](https://doi.org/10.1371/journal.pone.0230069) placerer teamsammensætning inden for personlighedscirkulærmodeller og bekræfter, at Big Five-baserede rammer tilbyder et stærkere teoretisk og empirisk grundlag end adfærdsbaserede observationssystemer.

## De fem dimensioner

| Dimension | Bidrag til teamet | Risiko ved lave niveauer | Risiko ved høje niveauer |
|-----------|-------------------|--------------------------|--------------------------|
| Vision (Åbenhed) | Innovation, kreativitet, tilpasningsevne | Stivhed, modstand mod nye tilgange | Ufokuseret idéudvikling, upraktiske planer |
| Disciplin (Samvittighedsfuldhed) | Pålidelighed, opfølgning, kvalitet | Overskredet deadlines, dårlig eksekvering | Ufleksibilitet i hurtigt skiftende kontekster |
| Tilstedeværelse (Ekstraversion) | Energi, initiativ, eksternt engagement | Passivitet, lav fremdrift | Konflikter, dominanskampe |
| Bånd (Venlighed) | Samarbejde, tillid, psykologisk sikkerhed | Interpersonel konflikt, lav sammenhæng | Grupmetænkning, undvigelse af produktiv konflikt |
| Dybde (Neuroticisme) | Forsigtighed, risikofølsomhed, grundighed | Overmod, blind optimisme | Stresssmitte, beslutningslammelse |

Disse fem dimensioner svarer til [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) (Åbenhed, Samvittighedsfuldhed, Ekstraversion, Venlighed, Neuroticisme — OCEAN) målt med offentlige domæne [IPIP](https://ipip.ori.org)-items, som udgør det videnskabelige grundlag for [Cèrcol](/science)-vurderingen.

## Ud over gennemsnit: diversitetens rolle

Bell (2007) fandt også, at *minimumsscore* tæller i nogle domæner: Et team med blot ét meget uvenlighed medlem lider under koordinationsomkostninger, der ikke kan opvejes af de andre medlemmers høje Venlighed. Dette kaldes minimumsscoreeffekten.

Diversitet i Vision (Åbenhed) kan være en fordel, når teams står over for både kreative og implementeringsopgaver — en blanding af medlemmer med høj og moderat Vision kan generere ideer *og* evaluere dem kritisk. Diversitet i Disciplin (Samvittighedsfuldhed) derimod har tendens til at være en byrde: Når nogle medlemmer følger op og andre ikke gør, eroderer tilliden, og koordinationsomkostningerne stiger.

Disse er probabilistiske fund med små til moderate effektstørrelser. Personlighedssammensætning giver et statistisk signal, ikke et deterministisk resultat. Teamprocesser — normer, ledelse, feedbackkultur — medierer og modererer disse effekter betydeligt.

## Sådan anvender du det i praksis

**Start med [Cèrcol](/science)-profilen.** Peer-vurderingen i [Første Kvartal](/first-quarter) giver dig aggregater på teamniveau på tværs af alle fem dimensioner, baseret på hvordan hver person *opfattes* af kolleger — et stærkere signal end selvrapport for teamdynamik.

**Se på dit teams gennemsnitsscore på tværs af de fem dimensioner.** Hvor ligger dit teams kollektive Disciplin? Et team, der bygger et nyt produkt, kan tolerere lavere gennemsnitlig Disciplin i tidlige kreative faser, men vil have brug for højere Disciplin, når leverancemilepæle nærmer sig.

**Identificer ekstreme lave og høje punkter.** Et team med meget høj gennemsnitlig Tilstedeværelse (Ekstraversion) men lavt gennemsnitligt Bånd (Venlighed) er energisk men skrøbeligt — tilbøjeligt til dominanskonflikter. Et team med meget høj gennemsnitlig Disciplin men meget lav gennemsnitlig Vision (Åbenhed) kan udføre kendte opgaver godt, men kæmper med at tilpasse sig nye udfordringer.

**Brug ikke personlighedsdata til at udelukke mennesker.** Forskningen støtter tænkning om sammensætning på teamniveau, ikke individuel gatekeeping. Ingen enkelt personlighedsprofil gør nogen til et godt eller dårligt teammedlem i alle sammenhænge. Brug dataene til at informere teamprocesser og -udvikling, ikke ansættelse eller afskedigelse.

**Genovervej det, efterhånden som teamet udvikler sig.** Teamsammensætningen ændrer sig over tid. En kvartalsvis peer-vurdering [Første Kvartal](/first-quarter) via [Cèrcol](/first-quarter) giver dig et longitudinalt overblik over, hvordan kollektiv personlighedsopfattelse skifter, efterhånden som nye medlemmer tilslutter sig, eller roller ændrer sig.

For en bredere sammenligning af personlighedsrammer, se [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin).

## Referencer

- Bell, S. T. (2007). Deep-level composition variables as predictors of team performance: A meta-analysis. *Journal of Applied Psychology*, 92(3), 595–615. [doi:10.1037/0021-9010.92.3.595](https://doi.org/10.1037/0021-9010.92.3.595)
- Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. *Personnel Psychology*, 44(1), 1–26. [doi:10.1111/j.1744-6570.1991.tb00688.x](https://doi.org/10.1111/j.1744-6570.1991.tb00688.x)
- Nestsiarovich, A., & Pons, A. (2020). Team roles grounded in personality circumplex: A systematic review. *PLoS ONE*, 15(3), e0230069. [doi:10.1371/journal.pone.0230069](https://doi.org/10.1371/journal.pone.0230069)
""",
}

ARTICLE = {
    "title": {
        "en": "How to build a balanced team using personality science",
        "ca": "Com construir un equip equilibrat usant la ciència de la personalitat",
        "es": "Cómo construir un equipo equilibrado usando la ciencia de la personalidad",
        "fr": "Comment construire une équipe équilibrée grâce à la science de la personnalité",
        "de": "Wie man mit Persönlichkeitswissenschaft ein ausgewogenes Team aufbaut",
        "da": "Sådan bygger du et afbalanceret team med personlighedsvidenskab",
    },
    "description": {
        "en": "What does the research say about personality composition and team performance? A practical guide grounded in meta-analytic evidence from Bell (2007) and Barrick & Mount (1991).",
        "ca": "Què diu la investigació sobre la composició de personalitat i el rendiment de l'equip? Una guia pràctica fonamentada en l'evidència meta-analítica de Bell (2007) i Barrick i Mount (1991).",
        "es": "¿Qué dice la investigación sobre la composición de personalidad y el rendimiento del equipo? Una guía práctica fundamentada en la evidencia meta-analítica de Bell (2007) y Barrick y Mount (1991).",
        "fr": "Que dit la recherche sur la composition de personnalité et la performance d'équipe ? Un guide pratique fondé sur les preuves méta-analytiques de Bell (2007) et Barrick & Mount (1991).",
        "de": "Was sagt die Forschung über Persönlichkeitszusammensetzung und Teamleistung? Ein praktischer Leitfaden basierend auf meta-analytischer Evidenz von Bell (2007) und Barrick & Mount (1991).",
        "da": "Hvad siger forskningen om personlighedssammensætning og teampræstation? En praktisk guide baseret på meta-analytisk evidens fra Bell (2007) og Barrick & Mount (1991).",
    },
    "content": CONTENT,
    "cover_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
}


async def main():
    conn = await asyncpg.connect(DATABASE_URL)
    await conn.execute(
        "UPDATE blog_posts SET title=$1::jsonb, description=$2::jsonb, content=$3::jsonb, cover_url=$4, updated_at=now() WHERE slug=$5",
        json.dumps(ARTICLE["title"]),
        json.dumps(ARTICLE["description"]),
        json.dumps(ARTICLE["content"]),
        ARTICLE["cover_url"],
        "how-to-build-a-balanced-team",
    )
    print("✓ how-to-build-a-balanced-team updated (6 languages)")
    await conn.close()


asyncio.run(main())
