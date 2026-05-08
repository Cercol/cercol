#!/usr/bin/env python3
"""Update blog post 3: Blind spots in teams — enriched EN + full translations."""
import asyncio, asyncpg, json, os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://cercol:cercol_db_2026@localhost:5432/cercol")

SVG_BLINDSPOT = """\
<figure style="text-align:center;margin:2rem 0">
<svg width="480" height="160" viewBox="0 0 480 160" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;border-radius:8px;background:#f8fafc">
  <text x="240" y="18" font-size="11" fill="#1a3a6b" font-weight="bold" text-anchor="middle">Self-other agreement in personality ratings (typical range)</text>
  <text x="10" y="42" font-size="9" fill="#374151" font-weight="bold">Extraversion</text>
  <rect x="120" y="30" width="200" height="16" fill="#e5e7eb" rx="3"/>
  <rect x="120" y="30" width="140" height="16" fill="#0047ba" rx="3"/>
  <text x="264" y="42" font-size="9" fill="#1a3a6b" font-weight="bold">r=.45–.60 ✓ high</text>
  <text x="10" y="68" font-size="9" fill="#374151" font-weight="bold">Conscientiousness</text>
  <rect x="120" y="56" width="200" height="16" fill="#e5e7eb" rx="3"/>
  <rect x="120" y="56" width="110" height="16" fill="#427c42" rx="3"/>
  <text x="234" y="68" font-size="9" fill="#374151">r=.40–.55</text>
  <text x="10" y="94" font-size="9" fill="#374151" font-weight="bold">Agreeableness</text>
  <rect x="120" y="82" width="200" height="16" fill="#e5e7eb" rx="3"/>
  <rect x="120" y="82" width="96" height="16" fill="#f1c22f" rx="3"/>
  <text x="220" y="94" font-size="9" fill="#374151">r=.35–.50</text>
  <text x="10" y="120" font-size="9" fill="#374151" font-weight="bold">Openness</text>
  <rect x="120" y="108" width="200" height="16" fill="#e5e7eb" rx="3"/>
  <rect x="120" y="108" width="80" height="16" fill="#8b5cf6" rx="3"/>
  <text x="204" y="120" font-size="9" fill="#374151">r=.30–.45</text>
  <text x="10" y="146" font-size="9" fill="#374151" font-weight="bold">Neuroticism</text>
  <rect x="120" y="134" width="200" height="16" fill="#e5e7eb" rx="3"/>
  <rect x="120" y="134" width="60" height="16" fill="#6b7280" rx="3"/>
  <text x="184" y="146" font-size="9" fill="#374151">r=.20–.40 ⚠ lowest</text>
</svg>
<figcaption style="font-size:0.8rem;color:#6b7280;margin-top:0.5rem">{caption}</figcaption>
</figure>"""

CAPTIONS = {
    "en": "Typical self-other agreement correlations per Big Five dimension. Extraversion (Presence) is the most visible and shows highest agreement; Neuroticism (Depth) is internal and shows lowest agreement — the greatest risk for blind spots.",
    "ca": "Correlacions típiques d'acord entre auto-percepció i percepció de parells per dimensió del Big Five. L'Extraversió (Presència) és la més visible i mostra major acord; el Neuroticisme (Profunditat) és intern i mostra menor acord.",
    "es": "Correlaciones típicas de acuerdo entre autopercepción y percepción de pares por dimensión del Big Five. La Extraversión (Presencia) es la más visible y muestra mayor acuerdo; el Neuroticismo (Profundidad) es interno y muestra menor acuerdo.",
    "fr": "Corrélations d'accord typiques entre auto-perception et perception par les pairs par dimension Big Five. L'Extraversion (Présence) est la plus visible et montre le plus fort accord ; le Névrosisme (Profondeur) est interne et montre le plus faible accord.",
    "de": "Typische Selbst-Fremd-Übereinstimmungskorrelationen pro Big-Five-Dimension. Extraversion (Präsenz) ist am sichtbarsten und zeigt die höchste Übereinstimmung; Neurotizismus (Tiefe) ist intern und zeigt die niedrigste Übereinstimmung.",
    "da": "Typiske selvrapport-peer-overensstemmelseskorrelationer pr. Big Five-dimension. Ekstraversion (Tilstedeværelse) er mest synlig og viser højest overensstemmelse; Neurotisisme (Dybde) er intern og viser lavest overensstemmelse.",
}

def svg(lang):
    return SVG_BLINDSPOT.format(caption=CAPTIONS[lang])

CONTENT = {
    "en": f"""\
Everyone carries a theory of themselves. We believe we know how organised, outgoing, or emotionally reactive we are. But when we compare self-ratings to peer ratings on the same dimensions, the correlation is only moderate — typically r=.40–.60 depending on the dimension. That gap is where blind spots live.

{svg("en")}

## What self-other agreement research shows

| Dimension | Typical r | Why |
|-----------|-----------|-----|
| Extraversion (Presence) | .45–.60 | Highly observable — social behaviour visible to all |
| Conscientiousness (Discipline) | .40–.55 | Task behaviour observable in shared work contexts |
| Agreeableness (Bond) | .35–.50 | Context-dependent — varies by relationship closeness |
| Openness (Vision) | .30–.45 | Partially internal — intellectual curiosity not always shown |
| Neuroticism (Depth) | .20–.40 | Mostly internal — emotional reactivity often hidden |

These correlations are not failures of measurement. They reflect something real: some dimensions of personality are simply more visible to outside observers than others. [Hofstee et al. (1992)](https://doi.org/10.1037/0022-3514.63.1.146) showed that the observability of traits depends partly on their position in the personality circumplex — traits anchored to social behaviour are seen more clearly by others than traits anchored to internal emotional states.

> **A blind spot in this context refers to cases where self-assessment is higher than peer assessment — where a person believes they show more of a trait than their peers observe. This is directly actionable information.**

The [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) framework, and the public-domain [IPIP](https://ipip.ori.org) items that operationalise it, provide the scientific foundation for measuring these gaps reliably.

## Why blind spots matter in teams

Teams coordinate around implicit assumptions about who is good at what. When those assumptions are based on self-perception rather than peer perception, coordination errors accumulate. Someone who believes they are highly organised may not implement the systems their team actually needs. Someone who believes they are a strong connector may be missing signals that their team finds them difficult to approach.

[360-degree feedback](https://en.wikipedia.org/wiki/360-degree_feedback) research has documented these patterns for decades. The consistent finding: self-ratings and peer ratings diverge most on the dimensions that are least observable — and people with the largest gaps are often the least aware of them. This is partly a consequence of [self-serving bias](https://en.wikipedia.org/wiki/Self-serving_bias): we attribute our positive behaviours to stable traits and our negative behaviours to situational factors, while observers do the reverse.

The dimensions most at risk:

- **Neuroticism (Depth):** Emotional reactivity is largely invisible — until it isn't. People who rate themselves as calm and stable may be perceived by teammates as unpredictable under pressure.
- **Openness (Vision):** Intellectual curiosity does not always translate into visible behaviour. Someone may believe they are highly creative and open to new ideas while defaulting to familiar patterns in practice.
- **Agreeableness (Bond):** Warmth and cooperation are highly context-dependent. In competitive or high-stakes settings, agreeable people may display behaviours inconsistent with their self-view.

## The problem with traditional rating scales

Most personality assessments — self-report and peer-report alike — use Likert-type rating scales: "How much does this statement describe you? 1–5." These scales are susceptible to two well-documented biases:

- [**Social desirability bias**](https://en.wikipedia.org/wiki/Social_desirability_bias): respondents shift ratings toward what seems socially acceptable, inflating scores on positive traits.
- [**Acquiescence bias**](https://en.wikipedia.org/wiki/Acquiescence_bias): respondents tend to agree with statements regardless of content, creating systematic upward drift.

Both biases affect self-report and peer-report differently, which complicates direct comparison. If peers are socially desirable in their ratings of a colleague, a real gap may be masked. If the self-rater is more inflated, the gap appears larger than it is.

Forced-choice formats — where respondents must choose between equally desirable options — reduce both biases. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) documented the measurement advantages of item formats that eliminate acquiescence as a response strategy. When neither "agree with everything" nor "pick the most flattering option" is available, what remains is more signal and less noise.

## What Witness Cèrcol does differently

[Witness Cèrcol](/first-quarter) is Cèrcol's peer assessment instrument. Rather than asking peers to rate a colleague on a scale, it presents pairs of personality-descriptive adjectives and asks the Witness to select which word best fits the person they are assessing. Both words in each pair are selected to be similarly desirable — so the choice reveals genuine perception rather than flattery.

This forced-choice adjective selection task operationalises [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) dimensions using [IPIP](https://ipip.ori.org)-derived vocabulary. The result: peer data that can be directly compared to self-data from the same framework, with reduced [social desirability bias](https://en.wikipedia.org/wiki/Social_desirability_bias) and [acquiescence bias](https://en.wikipedia.org/wiki/Acquiescence_bias).

The comparison of self-scores (from [New Moon Cèrcol](/first-quarter)) to Witness scores surfaces the gap directly. Where self > peer, a potential blind spot is flagged. Where peer > self, a potential hidden strength is identified. Both are useful, but the first is the one most teams have never seen clearly before.

See the [science page](/science) for the full methodology, item sources, and what has and has not been validated. See [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin) for why the Big Five framework underlies this approach rather than proprietary alternatives.

## Using blind spots constructively

Blind spot data is not a verdict. It is a prompt for a conversation. The most productive use of a self-other gap is not to tell someone they are wrong about themselves, but to open the question: "Here is how your peers experience you on this dimension. Does that match what you intended? If not, what might be driving the gap?"

Teams that have this conversation consistently — rather than once during an off-site — build a shared vocabulary for feedback that accumulates over time. The gap becomes a reference point, not a judgement.

Cèrcol is designed for repeated use. As Witnesses complete more assessments and individuals complete more self-reports, the data becomes richer and the gaps become more interpretable. This is different from a one-time 360 exercise. It is a longitudinal record of how perception evolves.

## References

- Hofstee, W. K. B., de Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. *Journal of Personality and Social Psychology*, 63(1), 146–163. [doi:10.1037/0022-3514.63.1.146](https://doi.org/10.1037/0022-3514.63.1.146)
- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
""",

    "ca": f"""\
Tothom porta una teoria de si mateix. Creiem saber quant d'organitzats, extravertits o emocionalment reactius som. Però quan comparem les autovaloracions amb les valoracions dels parells en les mateixes dimensions, la correlació és tan sols moderada — típicament r=.40–.60 segons la dimensió. En aquesta bretxa és on viuen els punts cecs.

{svg("ca")}

## Què mostra la investigació sobre l'acord entre auto-percepció i percepció de parells

| Dimensió | r típica | Per què |
|----------|----------|---------|
| Extraversió (Presència) | .45–.60 | Molt observable — el comportament social és visible per a tothom |
| Responsabilitat (Disciplina) | .40–.55 | El comportament en tasques és observable en contextos de treball compartits |
| Amabilitat (Vincle) | .35–.50 | Dependent del context — varia segons la proximitat de la relació |
| Obertura (Visió) | .30–.45 | Parcialment interna — la curiositat intel·lectual no sempre es mostra |
| Neuroticisme (Profunditat) | .20–.40 | Majoritàriament interna — la reactivitat emocional sovint és oculta |

Aquestes correlacions no són fallades de mesura. Reflecteixen alguna cosa real: algunes dimensions de la personalitat simplement són més visibles per als observadors externs que d'altres. [Hofstee et al. (1992)](https://doi.org/10.1037/0022-3514.63.1.146) van demostrar que l'observabilitat dels trets depèn en part de la seva posició en el circumflex de personalitat — els trets ancorats al comportament social els veuen els altres amb més claredat que els trets ancorats als estats emocionals interns.

> **Un punt cec en aquest context es refereix als casos on l'autovaloració és superior a la valoració dels parells — on una persona creu que mostra més d'un tret del que els seus parells observen. Aquesta és informació directament accionable.**

El marc [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) i els ítems de domini públic [IPIP](https://ipip.ori.org) que l'operacionalitzen proporcionen la base científica per mesurar aquestes bretxes de manera fiable.

## Per què els punts cecs importen als equips

Els equips es coordinen al voltant d'assumpcions implícites sobre qui és bo en quines coses. Quan aquestes assumpcions es basen en l'autopercepció en lloc de la percepció dels parells, els errors de coordinació s'acumulen. Algú que creu que és molt organitzat potser no implementa els sistemes que el seu equip realment necessita. Algú que creu que és un bon connector potser s'està perdent senyals que el seu equip el troba difícil d'abordar.

La investigació sobre la [retroalimentació 360 graus](https://en.wikipedia.org/wiki/360-degree_feedback) ha documentat aquests patrons durant dècades. La conclusió consistent: les autovaloracions i les valoracions dels parells divergeixen més en les dimensions menys observables — i les persones amb les bretxes més grans sovint són les menys conscients d'elles. Això és en part conseqüència del [biaix d'autoservei](https://en.wikipedia.org/wiki/Self-serving_bias): atribuïm els nostres comportaments positius a trets estables i els negatius a factors situacionals, mentre que els observadors fan el contrari.

Les dimensions amb més risc:

- **Neuroticisme (Profunditat):** La reactivitat emocional és en gran mesura invisible — fins que no ho és. Les persones que es valoren com a calmes i estables pot que les perceben els seus companys d'equip com a imprevisibles sota pressió.
- **Obertura (Visió):** La curiositat intel·lectual no sempre es tradueix en comportament visible. Algú pot creure que és molt creatiu i obert a noves idees mentre en la pràctica recorre a patrons familiars.
- **Amabilitat (Vincle):** La calidesa i la cooperació depenen molt del context. En entorns competitius o d'alt risc, les persones amables poden mostrar comportaments inconsistents amb la seva pròpia visió.

## El problema de les escales de valoració tradicionals

La majoria d'avaluacions de personalitat — tant d'autoinforme com d'informe de parells — utilitzen escales de tipus Likert: "En quina mesura aquesta afirmació et descriu? 1–5." Aquestes escales són susceptibles a dos biaixos ben documentats:

- [**Biaix de desitjabilitat social**](https://en.wikipedia.org/wiki/Social_desirability_bias): els participants desplacen les valoracions cap al que sembla socialment acceptable, inflant les puntuacions en trets positius.
- [**Biaix d'aquiescència**](https://en.wikipedia.org/wiki/Acquiescence_bias): els participants tendeixen a estar d'acord amb les afirmacions independentment del contingut, creant una deriva sistemàtica a l'alça.

Tots dos biaixos afecten l'autoinforme i l'informe de parells de manera diferent, cosa que complica la comparació directa. Els formats de tria forçada — on els participants han de triar entre opcions igualment desitjables — redueixen tots dos biaixos. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) van documentar els avantatges de mesura dels formats d'ítem que eliminen l'aquiescència com a estratègia de resposta.

## Què fa diferent el Testimoni Cèrcol

El [Testimoni Cèrcol](/first-quarter) és l'instrument d'avaluació de parells de Cèrcol. En lloc de demanar als parells que valorin un col·lega en una escala, presenta parelles d'adjectius descriptius de personalitat i demana al Testimoni que seleccioni quina paraula s'ajusta millor a la persona que avalua. Les dues paraules de cada parell es seleccionen per ser igualment desitjables — de manera que l'elecció revela percepció genuïna en lloc d'halago.

Aquesta tasca de selecció forçada d'adjectius operacionalitza les dimensions del [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) utilitzant vocabulari derivat de l'[IPIP](https://ipip.ori.org). El resultat: dades de parells que es poden comparar directament amb les dades d'autoinforme del mateix marc, amb [biaix de desitjabilitat social](https://en.wikipedia.org/wiki/Social_desirability_bias) i [biaix d'aquiescència](https://en.wikipedia.org/wiki/Acquiescence_bias) reduïts.

La comparació de les puntuacions pròpies amb les del Testimoni emergeix la bretxa directament. On autopercepció > percepció de parells, s'assenyala un potencial punt cec. On percepció de parells > autopercepció, s'identifica una fortalesa oculta potencial.

Consulteu la [pàgina de ciència](/science) per a la metodologia completa. Consulteu [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin) per entendre per què el marc del Big Five sustenta aquest enfocament.

## Usar els punts cecs de manera constructiva

Les dades sobre punts cecs no són un veredicte. Són un estímul per a una conversa. L'ús més productiu d'una bretxa entre auto-percepció i percepció de parells no és dir-li a algú que s'equivoca sobre si mateix, sinó obrir la pregunta: "Així és com els teus parells et perceben en aquesta dimensió. Coincideix amb el que pretenies? Si no, què podria estar generant la bretxa?"

Els equips que mantenen aquesta conversa de manera consistent — en lloc d'una sola vegada durant una jornada fora de l'oficina — construeixen un vocabulari compartit per a la retroalimentació que s'acumula amb el temps.

## Referències

- Hofstee, W. K. B., de Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. *Journal of Personality and Social Psychology*, 63(1), 146–163. [doi:10.1037/0022-3514.63.1.146](https://doi.org/10.1037/0022-3514.63.1.146)
- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
""",

    "es": f"""\
Todos llevamos una teoría de nosotros mismos. Creemos saber cuán organizados, extrovertidos o emocionalmente reactivos somos. Pero cuando comparamos las autovaloraciones con las valoraciones de los pares en las mismas dimensiones, la correlación es solo moderada — típicamente r=.40–.60 según la dimensión. En esa brecha es donde viven los puntos ciegos.

{svg("es")}

## Qué muestra la investigación sobre el acuerdo entre autopercepción y percepción de pares

| Dimensión | r típica | Por qué |
|-----------|----------|---------|
| Extraversión (Presencia) | .45–.60 | Muy observable — el comportamiento social es visible para todos |
| Responsabilidad (Disciplina) | .40–.55 | El comportamiento en tareas es observable en contextos de trabajo compartidos |
| Amabilidad (Vínculo) | .35–.50 | Dependiente del contexto — varía según la cercanía de la relación |
| Apertura (Visión) | .30–.45 | Parcialmente interna — la curiosidad intelectual no siempre se muestra |
| Neuroticismo (Profundidad) | .20–.40 | Mayormente interna — la reactividad emocional suele estar oculta |

Estas correlaciones no son fallos de medición. Reflejan algo real: algunas dimensiones de la personalidad son simplemente más visibles para los observadores externos que otras. [Hofstee et al. (1992)](https://doi.org/10.1037/0022-3514.63.1.146) demostraron que la observabilidad de los rasgos depende en parte de su posición en el circumplejo de personalidad — los rasgos anclados al comportamiento social los ven los demás con más claridad que los rasgos anclados a estados emocionales internos.

> **Un punto ciego en este contexto se refiere a los casos donde la autoevaluación es superior a la evaluación de los pares — donde una persona cree que muestra más de un rasgo de lo que sus pares observan. Esta es información directamente accionable.**

El marco [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) y los ítems de dominio público [IPIP](https://ipip.ori.org) que lo operacionalizan proporcionan la base científica para medir estas brechas de manera fiable.

## Por qué los puntos ciegos importan en los equipos

Los equipos se coordinan alrededor de suposiciones implícitas sobre quién es bueno en qué. Cuando esas suposiciones se basan en la autopercepción en lugar de la percepción de los pares, los errores de coordinación se acumulan. Alguien que cree ser muy organizado puede no implementar los sistemas que su equipo realmente necesita. Alguien que cree ser un buen conector puede estar perdiendo señales de que su equipo lo encuentra difícil de abordar.

La investigación sobre la [retroalimentación de 360 grados](https://en.wikipedia.org/wiki/360-degree_feedback) ha documentado estos patrones durante décadas. El hallazgo consistente: las autovaloraciones y las valoraciones de los pares divergen más en las dimensiones menos observables — y las personas con las mayores brechas suelen ser las menos conscientes de ellas. Esto es en parte consecuencia del [sesgo de autoservicio](https://en.wikipedia.org/wiki/Self-serving_bias): atribuimos nuestros comportamientos positivos a rasgos estables y los negativos a factores situacionales, mientras que los observadores hacen lo contrario.

Las dimensiones con mayor riesgo:

- **Neuroticismo (Profundidad):** La reactividad emocional es en gran medida invisible — hasta que no lo es. Las personas que se valoran como calmadas y estables pueden ser percibidas por sus compañeros como impredecibles bajo presión.
- **Apertura (Visión):** La curiosidad intelectual no siempre se traduce en comportamiento visible. Alguien puede creer que es muy creativo y abierto a nuevas ideas mientras en la práctica recurre a patrones familiares.
- **Amabilidad (Vínculo):** La calidez y la cooperación dependen mucho del contexto. En entornos competitivos o de alto riesgo, las personas amables pueden mostrar comportamientos inconsistentes con su propia visión.

## El problema de las escalas de valoración tradicionales

La mayoría de las evaluaciones de personalidad — tanto de autoinforme como de informe de pares — utilizan escalas de tipo Likert: "¿En qué medida esta afirmación te describe? 1–5." Estas escalas son susceptibles a dos sesgos bien documentados:

- [**Sesgo de deseabilidad social**](https://en.wikipedia.org/wiki/Social_desirability_bias): los participantes desplazan las valoraciones hacia lo que parece socialmente aceptable, inflando las puntuaciones en rasgos positivos.
- [**Sesgo de aquiescencia**](https://en.wikipedia.org/wiki/Acquiescence_bias): los participantes tienden a estar de acuerdo con las afirmaciones independientemente del contenido, creando una deriva sistemática al alza.

Ambos sesgos afectan el autoinforme y el informe de pares de manera diferente, lo que complica la comparación directa. Los formatos de elección forzada — donde los participantes deben elegir entre opciones igualmente deseables — reducen ambos sesgos. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) documentaron las ventajas de medición de los formatos de ítem que eliminan la aquiescencia como estrategia de respuesta.

## Qué hace diferente al Testigo Cèrcol

El [Testigo Cèrcol](/first-quarter) es el instrumento de evaluación de pares de Cèrcol. En lugar de pedir a los pares que valoren a un colega en una escala, presenta pares de adjetivos descriptivos de personalidad y pide al Testigo que seleccione qué palabra se ajusta mejor a la persona que está evaluando. Ambas palabras de cada par se seleccionan para ser igualmente deseables — de modo que la elección revela percepción genuina en lugar de halago.

Esta tarea de selección forzada de adjetivos operacionaliza las dimensiones del [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) utilizando vocabulario derivado del [IPIP](https://ipip.ori.org). El resultado: datos de pares que se pueden comparar directamente con los datos de autoinforme del mismo marco, con [sesgo de deseabilidad social](https://en.wikipedia.org/wiki/Social_desirability_bias) y [sesgo de aquiescencia](https://en.wikipedia.org/wiki/Acquiescence_bias) reducidos.

La comparación de las puntuaciones propias con las del Testigo hace emerger la brecha directamente. Donde autopercepción > percepción de pares, se señala un potencial punto ciego. Donde percepción de pares > autopercepción, se identifica una fortaleza oculta potencial.

Consulte la [página de ciencia](/science) para la metodología completa. Consulte [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin) para entender por qué el marco del Big Five sustenta este enfoque.

## Usar los puntos ciegos de manera constructiva

Los datos sobre puntos ciegos no son un veredicto. Son un estímulo para una conversación. El uso más productivo de una brecha entre autopercepción y percepción de pares no es decirle a alguien que se equivoca sobre sí mismo, sino abrir la pregunta: "Así es como tus pares te perciben en esta dimensión. ¿Coincide con lo que pretendías? Si no, ¿qué podría estar generando la brecha?"

Los equipos que mantienen esta conversación de manera consistente — en lugar de una sola vez durante una jornada fuera de la oficina — construyen un vocabulario compartido para la retroalimentación que se acumula con el tiempo.

## Referencias

- Hofstee, W. K. B., de Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. *Journal of Personality and Social Psychology*, 63(1), 146–163. [doi:10.1037/0022-3514.63.1.146](https://doi.org/10.1037/0022-3514.63.1.146)
- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
""",

    "fr": f"""\
Chacun porte une théorie de soi-même. Nous croyons savoir à quel point nous sommes organisés, extravertis ou réactifs émotionnellement. Mais lorsque nous comparons les auto-évaluations aux évaluations par les pairs sur les mêmes dimensions, la corrélation n'est que modérée — typiquement r=.40–.60 selon la dimension. C'est dans cet écart que résident les angles morts.

{svg("fr")}

## Ce que montre la recherche sur l'accord entre auto-perception et perception des pairs

| Dimension | r typique | Pourquoi |
|-----------|-----------|---------|
| Extraversion (Présence) | .45–.60 | Très observable — le comportement social est visible par tous |
| Conscience (Discipline) | .40–.55 | Le comportement dans les tâches est observable dans les contextes de travail partagés |
| Agréabilité (Lien) | .35–.50 | Dépendant du contexte — varie selon la proximité de la relation |
| Ouverture (Vision) | .30–.45 | Partiellement interne — la curiosité intellectuelle n'est pas toujours manifeste |
| Névrosisme (Profondeur) | .20–.40 | Principalement interne — la réactivité émotionnelle est souvent cachée |

Ces corrélations ne sont pas des échecs de mesure. Elles reflètent quelque chose de réel : certaines dimensions de la personnalité sont simplement plus visibles pour les observateurs extérieurs que d'autres. [Hofstee et al. (1992)](https://doi.org/10.1037/0022-3514.63.1.146) ont montré que l'observabilité des traits dépend en partie de leur position dans le circumplexe de personnalité — les traits ancrés au comportement social sont vus plus clairement par les autres que les traits ancrés aux états émotionnels internes.

> **Un angle mort dans ce contexte désigne les cas où l'auto-évaluation est supérieure à l'évaluation des pairs — où une personne croit montrer plus d'un trait que ses pairs n'en observent. C'est une information directement exploitable.**

Le cadre [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) et les items de domaine public [IPIP](https://ipip.ori.org) qui l'opérationnalisent fournissent la base scientifique pour mesurer ces écarts de manière fiable.

## Pourquoi les angles morts comptent dans les équipes

Les équipes se coordonnent autour d'hypothèses implicites sur qui est compétent dans quoi. Lorsque ces hypothèses sont fondées sur l'auto-perception plutôt que sur la perception des pairs, les erreurs de coordination s'accumulent. Quelqu'un qui se croit très organisé peut ne pas mettre en place les systèmes dont son équipe a réellement besoin. Quelqu'un qui se croit un bon connecteur peut rater des signaux indiquant que son équipe le trouve difficile à aborder.

La recherche sur le [feedback 360 degrés](https://en.wikipedia.org/wiki/360-degree_feedback) a documenté ces schémas pendant des décennies. La conclusion constante : les auto-évaluations et les évaluations des pairs divergent le plus sur les dimensions les moins observables — et les personnes présentant les plus grands écarts sont souvent les moins conscientes de ceux-ci. Cela est en partie une conséquence du [biais d'auto-complaisance](https://en.wikipedia.org/wiki/Self-serving_bias) : nous attribuons nos comportements positifs à des traits stables et nos comportements négatifs à des facteurs situationnels, tandis que les observateurs font l'inverse.

Les dimensions les plus à risque :

- **Névrosisme (Profondeur) :** La réactivité émotionnelle est largement invisible — jusqu'à ce qu'elle ne le soit plus. Les personnes qui se perçoivent comme calmes et stables peuvent être perçues par leurs coéquipiers comme imprévisibles sous pression.
- **Ouverture (Vision) :** La curiosité intellectuelle ne se traduit pas toujours en comportement visible. Quelqu'un peut se croire très créatif et ouvert aux nouvelles idées tout en recourant en pratique à des schémas familiers.
- **Agréabilité (Lien) :** La chaleur et la coopération sont très dépendantes du contexte. Dans des environnements compétitifs ou à enjeux élevés, les personnes agréables peuvent afficher des comportements inconsistants avec leur propre vision.

## Le problème des échelles d'évaluation traditionnelles

La plupart des évaluations de personnalité — en auto-rapport comme en évaluation par les pairs — utilisent des échelles de type Likert : "Dans quelle mesure cette affirmation vous décrit-elle ? 1–5." Ces échelles sont susceptibles à deux biais bien documentés :

- [**Biais de désirabilité sociale**](https://en.wikipedia.org/wiki/Social_desirability_bias) : les répondants déplacent leurs évaluations vers ce qui semble socialement acceptable, gonflant les scores sur les traits positifs.
- [**Biais d'acquiescement**](https://en.wikipedia.org/wiki/Acquiescence_bias) : les répondants tendent à approuver les affirmations indépendamment de leur contenu, créant une dérive systématique à la hausse.

Les deux biais affectent l'auto-rapport et l'évaluation par les pairs différemment, ce qui complique la comparaison directe. Les formats à choix forcé — où les répondants doivent choisir entre des options également désirables — réduisent les deux biais. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) ont documenté les avantages de mesure des formats d'items qui éliminent l'acquiescement comme stratégie de réponse.

## Ce que fait différemment le Témoin Cèrcol

Le [Témoin Cèrcol](/first-quarter) est l'instrument d'évaluation par les pairs de Cèrcol. Plutôt que de demander aux pairs de noter un collègue sur une échelle, il présente des paires d'adjectifs descriptifs de personnalité et demande au Témoin de sélectionner quel mot correspond le mieux à la personne évaluée. Les deux mots de chaque paire sont sélectionnés pour être également désirables — ainsi le choix révèle une perception authentique plutôt que de la flatterie.

Cette tâche de sélection d'adjectifs à choix forcé opérationnalise les dimensions du [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits) en utilisant le vocabulaire dérivé de l'[IPIP](https://ipip.ori.org). Le résultat : des données de pairs directement comparables aux données d'auto-rapport du même cadre, avec un [biais de désirabilité sociale](https://en.wikipedia.org/wiki/Social_desirability_bias) et un [biais d'acquiescement](https://en.wikipedia.org/wiki/Acquiescence_bias) réduits.

La comparaison des scores personnels avec les scores du Témoin fait émerger l'écart directement. Là où auto-perception > perception des pairs, un angle mort potentiel est signalé. Là où perception des pairs > auto-perception, une force cachée potentielle est identifiée.

Consultez la [page science](/science) pour la méthodologie complète. Consultez [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin) pour comprendre pourquoi le cadre du Big Five sous-tend cette approche.

## Utiliser les angles morts de manière constructive

Les données sur les angles morts ne sont pas un verdict. Elles sont une invitation à la conversation. L'utilisation la plus productive d'un écart entre auto-perception et perception des pairs n'est pas de dire à quelqu'un qu'il se trompe sur lui-même, mais d'ouvrir la question : "Voilà comment tes pairs te perçoivent sur cette dimension. Est-ce que cela correspond à ce que tu voulais montrer ? Si non, qu'est-ce qui pourrait créer cet écart ?"

Les équipes qui ont cette conversation de manière régulière — plutôt qu'une seule fois lors d'un séminaire hors-site — construisent un vocabulaire partagé pour le feedback qui s'accumule dans le temps.

## Références

- Hofstee, W. K. B., de Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. *Journal of Personality and Social Psychology*, 63(1), 146–163. [doi:10.1037/0022-3514.63.1.146](https://doi.org/10.1037/0022-3514.63.1.146)
- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
""",

    "de": f"""\
Jeder trägt eine Theorie von sich selbst. Wir glauben zu wissen, wie organisiert, extrovertiert oder emotional reaktiv wir sind. Wenn wir jedoch Selbstbewertungen mit Peer-Bewertungen auf denselben Dimensionen vergleichen, ist die Korrelation nur moderat — typischerweise r=.40–.60 je nach Dimension. In dieser Lücke leben die blinden Flecken.

{svg("de")}

## Was die Forschung zur Selbst-Fremd-Übereinstimmung zeigt

| Dimension | Typisches r | Warum |
|-----------|-------------|-------|
| Extraversion (Präsenz) | .45–.60 | Sehr beobachtbar — soziales Verhalten für alle sichtbar |
| Gewissenhaftigkeit (Disziplin) | .40–.55 | Aufgabenverhalten in gemeinsamen Arbeitskontexten beobachtbar |
| Verträglichkeit (Bindung) | .35–.50 | Kontextabhängig — variiert je nach Beziehungsnähe |
| Offenheit (Vision) | .30–.45 | Teilweise intern — intellektuelle Neugier nicht immer sichtbar |
| Neurotizismus (Tiefe) | .20–.40 | Überwiegend intern — emotionale Reaktivität oft verborgen |

Diese Korrelationen sind keine Messfehler. Sie spiegeln etwas Reales wider: Einige Persönlichkeitsdimensionen sind für externe Beobachter schlicht sichtbarer als andere. [Hofstee et al. (1992)](https://doi.org/10.1037/0022-3514.63.1.146) zeigten, dass die Beobachtbarkeit von Eigenschaften teilweise von ihrer Position im Persönlichkeitszirkumplex abhängt — Eigenschaften, die im sozialen Verhalten verankert sind, werden von anderen klarer wahrgenommen als solche, die an inneren emotionalen Zuständen verankert sind.

> **Ein blinder Fleck bezeichnet in diesem Kontext Fälle, in denen die Selbstbewertung höher ist als die Peer-Bewertung — wo eine Person glaubt, mehr von einer Eigenschaft zu zeigen, als ihre Peers beobachten. Das ist direkt verwertbare Information.**

Das [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits)-Framework und die gemeinfreien [IPIP](https://ipip.ori.org)-Items, die es operationalisieren, bilden die wissenschaftliche Grundlage für die zuverlässige Messung dieser Lücken.

## Warum blinde Flecken in Teams wichtig sind

Teams koordinieren sich rund um implizite Annahmen darüber, wer in welchen Bereichen gut ist. Wenn diese Annahmen auf Selbstwahrnehmung statt Peer-Wahrnehmung basieren, häufen sich Koordinationsfehler an. Jemand, der glaubt, sehr organisiert zu sein, implementiert möglicherweise nicht die Systeme, die sein Team tatsächlich braucht. Jemand, der sich für einen guten Vernetzter hält, übersieht möglicherweise Signale, dass sein Team ihn schwer ansprechbar findet.

Die Forschung zum [360-Grad-Feedback](https://en.wikipedia.org/wiki/360-degree_feedback) hat diese Muster seit Jahrzehnten dokumentiert. Der konsistente Befund: Selbst- und Peer-Bewertungen divergieren am stärksten auf den am wenigsten beobachtbaren Dimensionen — und Personen mit den größten Lücken sind sich dieser oft am wenigsten bewusst. Das ist teilweise eine Folge des [Selbstdienlichkeitsbias](https://en.wikipedia.org/wiki/Self-serving_bias): Wir schreiben unser positives Verhalten stabilen Eigenschaften zu und negatives Verhalten situativen Faktoren, während Beobachter das Gegenteil tun.

Die risikobehaftetsten Dimensionen:

- **Neurotizismus (Tiefe):** Emotionale Reaktivität ist weitgehend unsichtbar — bis sie es nicht mehr ist. Personen, die sich selbst als ruhig und stabil einschätzen, werden von Teammitgliedern möglicherweise als unberechenbar unter Druck wahrgenommen.
- **Offenheit (Vision):** Intellektuelle Neugier übersetzt sich nicht immer in sichtbares Verhalten. Jemand kann sich für sehr kreativ und offen für neue Ideen halten und in der Praxis dennoch auf vertraute Muster zurückgreifen.
- **Verträglichkeit (Bindung):** Wärme und Kooperation sind stark kontextabhängig. In wettbewerbsorientierten oder risikoreichen Umgebungen zeigen verträgliche Personen möglicherweise Verhaltensweisen, die ihrem Selbstbild widersprechen.

## Das Problem traditioneller Bewertungsskalen

Die meisten Persönlichkeitsbewertungen — sowohl Selbstbericht als auch Peer-Bericht — verwenden Likert-Skalen: "Wie sehr beschreibt diese Aussage Sie? 1–5." Diese Skalen sind anfällig für zwei gut dokumentierte Biases:

- [**Sozialer Erwünschtheitseffekt**](https://en.wikipedia.org/wiki/Social_desirability_bias): Befragte verschieben Bewertungen in Richtung sozial akzeptabler Antworten und erhöhen die Werte bei positiven Eigenschaften.
- [**Zustimmungsbias**](https://en.wikipedia.org/wiki/Acquiescence_bias): Befragte neigen dazu, Aussagen unabhängig vom Inhalt zuzustimmen, was eine systematische Aufwärtsdrift erzeugt.

Beide Biases beeinflussen Selbst- und Peer-Bericht unterschiedlich, was direkten Vergleich erschwert. Forced-Choice-Formate — bei denen Befragte zwischen gleich wünschenswerten Optionen wählen müssen — reduzieren beide Biases. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) dokumentierten die Messvorteile von Item-Formaten, die Zustimmung als Antwortstrategie ausschließen.

## Was Zeuge/Zeugin Cèrcol anders macht

[Zeuge/Zeugin Cèrcol](/first-quarter) ist Cèrcols Peer-Bewertungsinstrument. Statt Peers zu bitten, einen Kollegen auf einer Skala zu bewerten, präsentiert es Paare persönlichkeitsbeschreibender Adjektive und bittet die Zeugin/den Zeugen, das Wort zu wählen, das am besten zur bewerteten Person passt. Beide Wörter eines Paares sind gleich wünschenswert — sodass die Wahl echte Wahrnehmung statt Schmeichelei offenbart.

Diese Forced-Choice-Adjektivauswahl operationalisiert [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits)-Dimensionen mit [IPIP](https://ipip.ori.org)-abgeleitetem Vokabular. Das Ergebnis: Peer-Daten, die direkt mit Selbstberichtsdaten aus demselben Framework verglichen werden können — mit reduziertem [sozialem Erwünschtheitseffekt](https://en.wikipedia.org/wiki/Social_desirability_bias) und [Zustimmungsbias](https://en.wikipedia.org/wiki/Acquiescence_bias).

Der Vergleich von Selbstwerten mit Zeugenwerten macht die Lücke direkt sichtbar. Wo Selbst > Peer, wird ein potenzieller blinder Fleck markiert. Wo Peer > Selbst, wird eine potenzielle versteckte Stärke identifiziert.

Auf der [Wissenschaftsseite](/science) finden Sie die vollständige Methodik. Auf [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin) erfahren Sie, warum das Big-Five-Framework diesem Ansatz zugrunde liegt.

## Blinde Flecken konstruktiv nutzen

Daten zu blinden Flecken sind kein Urteil. Sie sind ein Anstoß für ein Gespräch. Die produktivste Nutzung einer Selbst-Fremd-Lücke besteht nicht darin, jemandem zu sagen, er liege bei sich selbst falsch, sondern die Frage zu öffnen: "So nehmen dich deine Peers auf dieser Dimension wahr. Stimmt das mit dem überein, was du beabsichtigst zu zeigen? Falls nicht, was könnte die Lücke erzeugen?"

Teams, die dieses Gespräch regelmäßig führen — statt nur einmal während eines Retreats — bauen ein gemeinsames Vokabular für Feedback auf, das sich über die Zeit anreichert.

## Referenzen

- Hofstee, W. K. B., de Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. *Journal of Personality and Social Psychology*, 63(1), 146–163. [doi:10.1037/0022-3514.63.1.146](https://doi.org/10.1037/0022-3514.63.1.146)
- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
""",

    "da": f"""\
Alle bærer en teori om sig selv. Vi tror, vi ved, hvor organiserede, udadvendte eller følelsesmæssigt reaktive vi er. Men når vi sammenligner selvvurderinger med peer-vurderinger på de samme dimensioner, er korrelationen kun moderat — typisk r=.40–.60 afhængigt af dimensionen. I det hul lever de blinde vinkler.

{svg("da")}

## Hvad forskning i selvrapport-peer-overensstemmelse viser

| Dimension | Typisk r | Hvorfor |
|-----------|----------|---------|
| Ekstraversion (Tilstedeværelse) | .45–.60 | Meget observerbar — social adfærd synlig for alle |
| Samvittighedsfuldhed (Disciplin) | .40–.55 | Opgaveadfærd observerbar i delte arbejdskontekster |
| Venlighed (Bånd) | .35–.50 | Kontekstafhængig — varierer med relationens nærhed |
| Åbenhed (Vision) | .30–.45 | Delvist intern — intellektuel nysgerrighed ikke altid synlig |
| Neurotisisme (Dybde) | .20–.40 | Overvejende intern — følelsesmæssig reaktivitet ofte skjult |

Disse korrelationer er ikke målefejl. De afspejler noget reelt: nogle personlighedsdimensioner er simpelthen mere synlige for eksterne observatører end andre. [Hofstee et al. (1992)](https://doi.org/10.1037/0022-3514.63.1.146) viste, at træks observerbarhed delvist afhænger af deres position i personlighedscirkulæret — træk forankret i social adfærd ses tydeligere af andre end træk forankret i indre følelsesmæssige tilstande.

> **En blind vinkel i denne kontekst refererer til tilfælde, hvor selvvurderingen er højere end peer-vurderingen — hvor en person tror, de viser mere af et træk, end deres peers observerer. Dette er direkte handlingsbar information.**

[Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits)-rammen og de offentlige [IPIP](https://ipip.ori.org)-items, der operationaliserer den, udgør det videnskabelige grundlag for pålideligt at måle disse huller.

## Hvorfor blinde vinkler betyder noget i teams

Teams koordinerer sig omkring implicitte antagelser om, hvem der er god til hvad. Når disse antagelser er baseret på selvopfattelse snarere end peer-opfattelse, akkumuleres koordineringsfejl. Nogen der tror, de er meget organiserede, implementerer måske ikke de systemer, deres team faktisk har brug for. Nogen der tror, de er gode forbindere, overser måske signaler om, at deres team finder dem svære at tilgå.

Forskning i [360-graders feedback](https://en.wikipedia.org/wiki/360-degree_feedback) har dokumenteret disse mønstre i årtier. Det konsistente fund: selvvurderinger og peer-vurderinger divergerer mest på de mindst observerbare dimensioner — og personer med de største huller er ofte mindst bevidste om dem. Dette er delvist en konsekvens af [selvtjenende bias](https://en.wikipedia.org/wiki/Self-serving_bias): vi tilskriver vores positive adfærd stabile træk og negativ adfærd situationelle faktorer, mens observatører gør det modsatte.

De mest risikofyldte dimensioner:

- **Neurotisisme (Dybde):** Følelsesmæssig reaktivitet er stort set usynlig — indtil den ikke er det. Personer der vurderer sig selv som rolige og stabile, kan af holdkammerater opleves som uforudsigelige under pres.
- **Åbenhed (Vision):** Intellektuel nysgerrighed omsættes ikke altid til synlig adfærd. Nogen kan tro, de er meget kreative og åbne for nye idéer, mens de i praksis falder tilbage på kendte mønstre.
- **Venlighed (Bånd):** Varme og samarbejde er stærkt kontekstafhængige. I konkurrenceprægede eller høj-indsats-miljøer kan venlige personer udvise adfærd, der er inkonsistent med deres selvbillede.

## Problemet med traditionelle vurderingsskalaer

De fleste personlighedsvurderinger — både selvrapport og peer-rapport — bruger Likert-type skalaer: "I hvilken grad beskriver denne udsagn dig? 1–5." Disse skalaer er modtagelige for to veldokumenterede biases:

- [**Social ønskværdighedsbias**](https://en.wikipedia.org/wiki/Social_desirability_bias): respondenter skubber vurderinger mod det, der virker socialt acceptabelt, og oppuster scores på positive træk.
- [**Acquiescence-bias**](https://en.wikipedia.org/wiki/Acquiescence_bias): respondenter har tendens til at acceptere udsagn uanset indhold, hvilket skaber systematisk opadgående drift.

Begge biases påvirker selvrapport og peer-rapport forskelligt, hvilket komplicerer direkte sammenligning. Forced-choice-formater — hvor respondenter skal vælge mellem lige ønskværdige muligheder — reducerer begge biases. [Goldberg et al. (2006)](https://doi.org/10.1177/1073191106293419) dokumenterede målefordelene ved item-formater, der eliminerer acquiescence som svarstrategi.

## Hvad Vidne Cèrcol gør anderledes

[Vidne Cèrcol](/first-quarter) er Cèrcols peer-vurderingsinstrument. Frem for at bede peers om at vurdere en kollega på en skala præsenterer det par af personlighedsbeskrivende adjektiver og beder Vidnet om at vælge det ord, der bedst passer til den person, der vurderes. Begge ord i hvert par er valgt til at være lige ønskværdige — så valget afslører ægte opfattelse snarere end smiger.

Denne forced-choice adjektivudvælgelsesopgave operationaliserer [Big Five](https://en.wikipedia.org/wiki/Big_Five_personality_traits)-dimensioner ved hjælp af [IPIP](https://ipip.ori.org)-afledt ordforråd. Resultatet: peer-data der direkte kan sammenlignes med selvrapportdata fra samme ramme — med reduceret [social ønskværdighedsbias](https://en.wikipedia.org/wiki/Social_desirability_bias) og [acquiescence-bias](https://en.wikipedia.org/wiki/Acquiescence_bias).

Sammenligningen af selvscores med Vidne-scores gør hullet direkte synligt. Hvor selv > peer, markeres en potentiel blind vinkel. Hvor peer > selv, identificeres en potentiel skjult styrke.

Se [videnskabssiden](/science) for den fulde metodik. Se [Big Five vs DISC vs Belbin](/blog/big-five-vs-disc-vs-belbin) for at forstå, hvorfor Big Five-rammen understøtter denne tilgang.

## Bruge blinde vinkler konstruktivt

Data om blinde vinkler er ikke en dom. De er en invitation til samtale. Den mest produktive brug af et selv-peer-hul er ikke at fortælle nogen, at de tager fejl om sig selv, men at åbne spørgsmålet: "Sådan oplever dine peers dig på denne dimension. Stemmer det overens med, hvad du havde til hensigt at vise? Hvis ikke, hvad kan skabe hullet?"

Teams der fører denne samtale konsekvent — frem for én gang under et retreat — opbygger et fælles vokabular for feedback, der akkumuleres over tid.

## Referencer

- Hofstee, W. K. B., de Raad, B., & Goldberg, L. R. (1992). Integration of the Big Five and circumplex approaches to trait structure. *Journal of Personality and Social Psychology*, 63(1), 146–163. [doi:10.1037/0022-3514.63.1.146](https://doi.org/10.1037/0022-3514.63.1.146)
- Goldberg, L. R., et al. (2006). The International Personality Item Pool and the future of public-domain personality measures. *Journal of Research in Personality*, 40, 84–96. [doi:10.1177/1073191106293419](https://doi.org/10.1177/1073191106293419)
""",
}

ARTICLE = {
    "title": {
        "en": "Blind spots in teams: when self-perception diverges from peer perception",
        "ca": "Punts cecs en equips: quan l'autopercepció divergeix de la percepció dels parells",
        "es": "Puntos ciegos en equipos: cuando la autopercepción diverge de la percepción de los pares",
        "fr": "Angles morts en équipe : quand la perception de soi diverge de la perception des pairs",
        "de": "Blinde Flecken in Teams: wenn Selbstwahrnehmung von Fremdwahrnehmung abweicht",
        "da": "Blinde vinkler i teams: når selvopfattelse afviger fra peer-opfattelse",
    },
    "description": {
        "en": "Self-report and peer assessment of Big Five personality often disagree. Understanding where these gaps occur — and why — can change how a team works together.",
        "ca": "L'autoinforme i l'avaluació de parells de la personalitat del Big Five sovint no coincideixen. Entendre on es produeixen aquestes bretxes — i per què — pot canviar com treballa un equip.",
        "es": "El autoinforme y la evaluación de pares de personalidad Big Five a menudo no coinciden. Entender dónde se producen estas brechas — y por qué — puede cambiar cómo trabaja un equipo.",
        "fr": "L'auto-rapport et l'évaluation par les pairs de la personnalité Big Five divergent souvent. Comprendre où ces écarts se produisent — et pourquoi — peut transformer la façon dont une équipe travaille.",
        "de": "Selbstbericht und Peer-Bewertung der Big-Five-Persönlichkeit stimmen oft nicht überein. Zu verstehen, wo diese Lücken auftreten — und warum — kann verändern, wie ein Team zusammenarbeitet.",
        "da": "Selvrapport og peer-vurdering af Big Five-personlighed er ofte uenige. At forstå, hvor disse huller opstår — og hvorfor — kan ændre, hvordan et team arbejder sammen.",
    },
    "content": CONTENT,
    "cover_url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
}


async def main():
    conn = await asyncpg.connect(DATABASE_URL)
    await conn.execute(
        "UPDATE blog_posts SET title=$1::jsonb, description=$2::jsonb, content=$3::jsonb, cover_url=$4, updated_at=now() WHERE slug=$5",
        json.dumps(ARTICLE["title"]),
        json.dumps(ARTICLE["description"]),
        json.dumps(ARTICLE["content"]),
        ARTICLE["cover_url"],
        "blind-spots-in-teams",
    )
    print("✓ blind-spots-in-teams updated (6 languages)")
    await conn.close()


asyncio.run(main())
