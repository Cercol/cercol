/**
 * Cèrcol First Quarter — IPIP-NEO-60 instrument
 *
 * Source: Maples-Keller, J. L., Williamson, R. L., Sleep, C. E.,
 * Carter, N. T., Campbell, W. K., & Miller, J. D. (2019).
 * Using item response theory to develop a 60-item representation
 * of the NEO PI-R using the International Personality Item Pool:
 * Development of the IPIP-NEO-60.
 * Psychological Assessment, 31(2), 188-203.
 *
 * 60 items · 5 domains · 30 facets · 2 items per facet
 * Scale: 1 (Disagree strongly) → 5 (Agree strongly)
 * Reverse items: score = 6 - rawValue
 *
 * IPIP items are in the public domain with no restrictions on use.
 * Source: https://ipip.ori.org
 */

import { DOMAINS } from './domains'

export const FQ_ITEMS = [

  // ── DEPTH (Neuroticism) ───────────────────────────────────────

  // Vigil (Anxiety)
  { id: 1,  text: { en: 'Worry about things.', ca: 'Em preocupe per les coses.', es: 'Me preocupo por las cosas.', fr: 'Me préoccupe des choses.', de: 'Mache mir Sorgen um Dinge.', da: 'Bekymrer mig over tingene.' },
    domain: 'depth', facet: 'vigil', reverse: false },
  { id: 2,  text: { en: 'Fear for the worst.', ca: 'Tem el pitjor.', es: 'Temo lo peor.', fr: 'Crains le pire.', de: 'Befürchte das Schlimmste.', da: 'Frygter det værste.' },
    domain: 'depth', facet: 'vigil', reverse: false },

  // Blaze (Angry Hostility)
  { id: 3,  text: { en: 'Get angry easily.', ca: "M'enfade amb facilitat.", es: 'Me enfado con facilidad.', fr: 'Me mets en colère facilement.', de: 'Werde leicht wütend.', da: 'Bliver let vred.' },
    domain: 'depth', facet: 'blaze', reverse: false },
  { id: 4,  text: { en: 'Get irritated easily.', ca: "M'irrite amb facilitat.", es: 'Me irrito con facilidad.', fr: "M'irrite facilement.", de: 'Werde leicht gereizt.', da: 'Bliver let irriteret.' },
    domain: 'depth', facet: 'blaze', reverse: false },

  // Hollow (Depression)
  { id: 5,  text: { en: 'Often feel blue.', ca: "Sovint em sent trist/a.", es: 'Con frecuencia me siento triste.', fr: 'Me sens souvent triste.', de: 'Fühle mich oft niedergeschlagen.', da: 'Føler mig ofte nedtrykt.' },
    domain: 'depth', facet: 'hollow', reverse: false },
  { id: 6,  text: { en: 'Dislike myself.', ca: "No m'aggrade a mi mateix/a.", es: 'No me agrado a mí mismo/a.', fr: "Ne m'apprécie pas.", de: 'Mag mich selbst nicht.', da: 'Bryder mig ikke om mig selv.' },
    domain: 'depth', facet: 'hollow', reverse: false },

  // Veil (Self-Consciousness)
  { id: 7,  text: { en: 'Am easily embarrassed.', ca: "M'avergonyesc amb facilitat.", es: 'Me avergüenzo con facilidad.', fr: 'Suis facilement embarrassé·e.', de: 'Bin leicht verlegen.', da: 'Bliver let flov.' },
    domain: 'depth', facet: 'veil', reverse: false },
  { id: 8,  text: { en: 'Find it difficult to approach others.', ca: "Em costa apropar-me als altres.", es: 'Me cuesta acercarme a los demás.', fr: "Trouve difficile d'approcher les autres.", de: 'Finde es schwierig, auf andere zuzugehen.', da: 'Finder det svært at nærme mig andre.' },
    domain: 'depth', facet: 'veil', reverse: false },

  // Surge (Impulsiveness)
  { id: 9,  text: { en: 'Act without thinking.', ca: 'Actue sense pensar.', es: 'Actúo sin pensar.', fr: 'Agis sans réfléchir.', de: 'Handle ohne nachzudenken.', da: 'Handler uden at tænke mig om.' },
    domain: 'depth', facet: 'surge', reverse: false },
  { id: 10, text: { en: 'Often eat too much.', ca: 'Sovint menge massa.', es: 'Con frecuencia como en exceso.', fr: 'Mange souvent trop.', de: 'Esse oft zu viel.', da: 'Spiser ofte for meget.' },
    domain: 'depth', facet: 'surge', reverse: false },

  // Fracture (Vulnerability)
  { id: 11, text: { en: 'Panic easily.', ca: "Em panique amb facilitat.", es: 'Me entra el pánico fácilmente.', fr: 'Panique facilement.', de: 'Bekomme leicht Panik.', da: 'Får let panik.' },
    domain: 'depth', facet: 'fracture', reverse: false },
  { id: 12, text: { en: "Feel that I'm unable to deal with things.", ca: "Sent que soc incapaç/incapaça de fer front a les coses.", es: 'Siento que soy incapaz de hacer frente a las cosas.', fr: 'Sens que je suis incapable de faire face aux choses.', de: 'Fühle mich unfähig, mit den Dingen umzugehen.', da: 'Føler, at jeg ikke kan håndtere tingene.' },
    domain: 'depth', facet: 'fracture', reverse: false },

  // ── PRESENCE (Extraversion) ───────────────────────────────────

  // Hearth (Warmth)
  { id: 13, text: { en: 'Make friends easily.', ca: "Faig amics/amigues amb facilitat.", es: 'Hago amigos/as con facilidad.', fr: "Me lie facilement d'amitié.", de: 'Schließe leicht Freundschaften.', da: 'Får let venner.' },
    domain: 'presence', facet: 'hearth', reverse: false },
  { id: 14, text: { en: 'Am hard to get to know.', ca: 'Soc difícil de conèixer.', es: 'Soy difícil de conocer.', fr: 'Suis difficile à connaître.', de: 'Bin schwer kennenzulernen.', da: 'Er svær at lære at kende.' },
    domain: 'presence', facet: 'hearth', reverse: true },

  // Gather (Gregariousness)
  { id: 15, text: { en: 'Am the life of the party.', ca: "Soc l'ànima de la festa.", es: 'Soy el/la alma de la fiesta.', fr: "Suis l'âme de la fête.", de: 'Bin die Seele der Gesellschaft.', da: 'Er festens midtpunkt.' },
    domain: 'presence', facet: 'gather', reverse: false },
  { id: 16, text: { en: "Don't like to draw attention to myself.", ca: "No m'agrada cridar l'atenció sobre mi mateix/a.", es: 'No me gusta llamar la atención sobre mí mismo/a.', fr: "N'aime pas attirer l'attention sur moi.", de: 'Mag es nicht, Aufmerksamkeit auf mich zu ziehen.', da: 'Kan ikke lide at tiltrække opmærksomhed.' },
    domain: 'presence', facet: 'gather', reverse: true },

  // Command (Assertiveness)
  { id: 17, text: { en: 'Take charge.', ca: 'Prenc les regnes.', es: 'Tomo las riendas.', fr: 'Prends les choses en main.', de: 'Übernehme die Führung.', da: 'Tager styringen.' },
    domain: 'presence', facet: 'command', reverse: false },
  { id: 18, text: { en: 'Wait for others to lead the way.', ca: 'Espere que altres prenguen la iniciativa.', es: 'Espero que otros tomen la iniciativa.', fr: 'Attends que les autres montrent la voie.', de: 'Warte darauf, dass andere den Weg weisen.', da: 'Venter på, at andre viser vejen.' },
    domain: 'presence', facet: 'command', reverse: true },

  // Drive (Activity)
  { id: 19, text: { en: 'Am always busy.', ca: "Sempre estic ocupat/ada.", es: 'Siempre estoy ocupado/a.', fr: 'Suis toujours occupé·e.', de: 'Bin immer beschäftigt.', da: 'Er altid travlt beskæftiget.' },
    domain: 'presence', facet: 'drive', reverse: false },
  { id: 20, text: { en: 'Like to take it easy.', ca: "M'agrada prendre-m'ho amb calma.", es: 'Me gusta tomarme las cosas con calma.', fr: 'Aime prendre les choses tranquillement.', de: 'Nehme es gerne ruhig.', da: 'Kan godt lide at tage det roligt.' },
    domain: 'presence', facet: 'drive', reverse: true },

  // Thrill (Excitement-Seeking)
  { id: 21, text: { en: 'Love excitement.', ca: "M'encanta l'emoció.", es: 'Me encanta la emoción.', fr: 'Adore les sensations fortes.', de: 'Liebe Aufregung.', da: 'Elsker spænding.' },
    domain: 'presence', facet: 'thrill', reverse: false },
  { id: 22, text: { en: 'Prefer quiet, peaceful settings.', ca: 'Preferixc entorns tranquils i pacífics.', es: 'Prefiero entornos tranquilos y pacíficos.', fr: 'Préfère les environnements calmes et paisibles.', de: 'Bevorzuge ruhige, friedliche Umgebungen.', da: 'Foretrækker rolige og fredelige omgivelser.' },
    domain: 'presence', facet: 'thrill', reverse: true },

  // Radiance (Positive Emotions)
  { id: 23, text: { en: 'Radiate joy.', ca: 'Irradie alegria.', es: 'Irradio alegría.', fr: 'Rayonne de joie.', de: 'Strahle Freude aus.', da: 'Udstråler glæde.' },
    domain: 'presence', facet: 'radiance', reverse: false },
  { id: 24, text: { en: 'Am not easily amused.', ca: "No m'entretinc amb facilitat.", es: 'No me divierto con facilidad.', fr: "Ne m'amuse pas facilement.", de: 'Bin nicht leicht zu amüsieren.', da: 'Er ikke let at more.' },
    domain: 'presence', facet: 'radiance', reverse: true },

  // ── VISION (Openness) ─────────────────────────────────────────

  // Dream (Fantasy)
  { id: 25, text: { en: 'Have a vivid imagination.', ca: 'Tinc una imaginació vívida.', es: 'Tengo una imaginación vívida.', fr: 'Ai une imagination vive.', de: 'Habe eine lebhafte Vorstellungskraft.', da: 'Har en livlig fantasi.' },
    domain: 'vision', facet: 'dream', reverse: false },
  { id: 26, text: { en: 'Seldom daydream.', ca: 'Rares vegades fantasiege.', es: 'Rara vez sueño despierto/a.', fr: 'Rêvasse rarement.', de: 'Träume selten mit offenen Augen.', da: 'Dagdrømmer sjældent.' },
    domain: 'vision', facet: 'dream', reverse: true },

  // Craft (Aesthetics)
  { id: 27, text: { en: 'Believe in the importance of art.', ca: "Crec en la importància de l'art.", es: 'Creo en la importancia del arte.', fr: "Crois en l'importance de l'art.", de: 'Glaube an die Wichtigkeit der Kunst.', da: 'Tror på kunstens betydning.' },
    domain: 'vision', facet: 'craft', reverse: false },
  { id: 28, text: { en: 'Do not like art.', ca: "No m'agrada l'art.", es: 'No me gusta el arte.', fr: "N'aime pas l'art.", de: 'Mag Kunst nicht.', da: 'Kan ikke lide kunst.' },
    domain: 'vision', facet: 'craft', reverse: true },

  // Resonance (Feelings)
  { id: 29, text: { en: 'Experience my emotions intensely.', ca: 'Visc les meues emocions amb intensitat.', es: 'Vivo mis emociones con intensidad.', fr: 'Vis mes émotions intensément.', de: 'Erlebe meine Gefühle intensiv.', da: 'Oplever mine følelser intenst.' },
    domain: 'vision', facet: 'resonance', reverse: false },
  { id: 30, text: { en: "Don't understand people who get emotional.", ca: "No entenc les persones que s'emocionen.", es: 'No entiendo a las personas que se emocionan.', fr: "Ne comprends pas les gens qui s'emballent émotionnellement.", de: 'Verstehe Menschen nicht, die emotional werden.', da: 'Forstår ikke folk, der bliver følelsesladede.' },
    domain: 'vision', facet: 'resonance', reverse: true },

  // Drift (Actions)
  { id: 31, text: { en: 'Prefer variety to routine.', ca: 'Preferixc la varietat a la rutina.', es: 'Prefiero la variedad a la rutina.', fr: 'Préfère la variété à la routine.', de: 'Bevorzuge Abwechslung gegenüber Routine.', da: 'Foretrækker variation frem for rutine.' },
    domain: 'vision', facet: 'drift', reverse: false },
  { id: 32, text: { en: 'Prefer to stick with things that I know.', ca: 'Preferixc quedar-me amb el que conec.', es: 'Prefiero quedarme con lo que conozco.', fr: "Préfère m'en tenir à ce que je connais.", de: 'Bleibe lieber bei Dingen, die ich kenne.', da: 'Holder mig helst til det, jeg kender.' },
    domain: 'vision', facet: 'drift', reverse: true },

  // Prism (Ideas)
  { id: 33, text: { en: 'Am quick to understand things.', ca: 'Comprenc les coses ràpidament.', es: 'Comprendo las cosas con rapidez.', fr: 'Comprends les choses rapidement.', de: 'Verstehe Dinge schnell.', da: 'Forstår tingene hurtigt.' },
    domain: 'vision', facet: 'prism', reverse: false },
  { id: 34, text: { en: 'Have difficulty understanding abstract ideas.', ca: "Em costa entendre idees abstractes.", es: 'Me cuesta entender ideas abstractas.', fr: 'Ai du mal à comprendre les idées abstraites.', de: 'Habe Schwierigkeiten, abstrakte Ideen zu verstehen.', da: 'Har svært ved at forstå abstrakte ideer.' },
    domain: 'vision', facet: 'prism', reverse: true },

  // Compass (Values)
  { id: 35, text: { en: 'Believe that there is no absolute right or wrong.', ca: "Crec que no existeix un bé o un mal absolut.", es: 'Creo que no existe un bien o un mal absoluto.', fr: "Crois qu'il n'existe pas de bien ou de mal absolu.", de: 'Glaube, dass es kein absolutes Richtig oder Falsch gibt.', da: 'Tror ikke, der findes et absolut rigtigt eller forkert.' },
    domain: 'vision', facet: 'compass', reverse: false },
  { id: 36, text: { en: 'Tend to vote for conservative political candidates.', ca: 'Tendixc a votar per candidats/tes polítics/ques conservadors/es.', es: 'Tiendo a votar por candidatos políticos conservadores.', fr: 'Ai tendance à voter pour des candidats politiques conservateurs.', de: 'Wähle tendenziell konservative Kandidaten.', da: 'Ser mig selv som overvejende konservativ politisk.' },
    domain: 'vision', facet: 'compass', reverse: true },

  // ── BOND (Agreeableness) ──────────────────────────────────────

  // Faith (Trust)
  { id: 37, text: { en: 'Trust others.', ca: 'Confie en els altres.', es: 'Confío en los demás.', fr: 'Fais confiance aux autres.', de: 'Vertraue anderen.', da: 'Stoler på andre.' },
    domain: 'bond', facet: 'faith', reverse: false },
  { id: 38, text: { en: 'Suspect hidden motives in others.', ca: 'Sospite de les motivacions ocultes dels altres.', es: 'Sospecho de las motivaciones ocultas de los demás.', fr: 'Suspecte des motifs cachés chez les autres.', de: 'Vermute verborgene Motive bei anderen.', da: 'Mistænker skjulte motiver hos andre.' },
    domain: 'bond', facet: 'faith', reverse: true },

  // Edge (Straightforwardness)
  { id: 39, text: { en: "Don't beat around the bush.", ca: "No m'ande amb rodeos.", es: 'No me ando con rodeos.', fr: 'Ne tourne pas autour du pot.', de: 'Rede nicht um den heißen Brei herum.', da: 'Går direkte til sagen.' },
    domain: 'bond', facet: 'edge', reverse: false },
  { id: 40, text: { en: 'Use flattery to get ahead.', ca: "Faig servir l'adulació per a progressar.", es: 'Uso la adulación para progresar.', fr: 'Utilise la flatterie pour progresser.', de: 'Nutze Schmeichelei, um voranzukommen.', da: 'Bruger smiger til at komme videre.' },
    domain: 'bond', facet: 'edge', reverse: true },

  // Gift (Altruism)
  { id: 41, text: { en: 'Make people feel welcome.', ca: 'Faig que la gent se senta benvinguda.', es: 'Hago que la gente se sienta bienvenida.', fr: 'Fais sentir les gens bienvenus.', de: 'Lasse Menschen sich willkommen fühlen.', da: 'Får folk til at føle sig velkomne.' },
    domain: 'bond', facet: 'gift', reverse: false },
  { id: 42, text: { en: 'Am indifferent to the feelings of others.', ca: "Soc indiferent/a als sentiments dels altres.", es: 'Soy indiferente a los sentimientos de los demás.', fr: 'Suis indifférent·e aux sentiments des autres.', de: 'Bin gleichgültig gegenüber den Gefühlen anderer.', da: 'Er ligeglad med andres følelser.' },
    domain: 'bond', facet: 'gift', reverse: true },

  // Yield (Compliance)
  { id: 43, text: { en: 'Hate to seem pushy.', ca: "Em molesta semblar insistent.", es: 'Me disgusta parecer insistente.', fr: 'Déteste paraître insistant·e.', de: 'Hasse es, aufdringlich zu wirken.', da: 'Hader at virke påtrængende.' },
    domain: 'bond', facet: 'yield', reverse: false },
  { id: 44, text: { en: 'Insult people.', ca: 'Insulte les persones.', es: 'Insulto a las personas.', fr: 'Insulte les gens.', de: 'Beleidige Menschen.', da: 'Fornærmer folk.' },
    domain: 'bond', facet: 'yield', reverse: true },

  // Shadow (Modesty)
  { id: 45, text: { en: 'Dislike being the center of attention.', ca: "No m'agrada ser el centre d'atenció.", es: 'No me gusta ser el centro de atención.', fr: "N'aime pas être le centre de l'attention.", de: 'Mag es nicht, im Mittelpunkt der Aufmerksamkeit zu stehen.', da: 'Kan ikke lide at være centrum for opmærksomheden.' },
    domain: 'bond', facet: 'shadow', reverse: false },
  { id: 46, text: { en: 'Think highly of myself.', ca: 'Tinc un alt concepte de mi mateix/a.', es: 'Tengo un alto concepto de mí mismo/a.', fr: 'Ai une haute opinion de moi-même.', de: 'Halte viel von mir selbst.', da: 'Har en høj tanke om mig selv.' },
    domain: 'bond', facet: 'shadow', reverse: true },

  // Shield (Tender-Mindedness)
  { id: 47, text: { en: 'Sympathize with the homeless.', ca: 'Simpatitze amb les persones sense llar.', es: 'Me compadezco de las personas sin hogar.', fr: 'Compatit avec les sans-abri.', de: 'Sympathisiere mit Obdachlosen.', da: 'Har medfølelse med hjemløse.' },
    domain: 'bond', facet: 'shield', reverse: false },
  { id: 48, text: { en: 'Believe in an eye for an eye.', ca: 'Crec en ull per ull.', es: 'Creo en ojo por ojo.', fr: 'Crois à un œil pour un œil.', de: 'Glaube an Auge um Auge.', da: 'Tror på øje for øje.' },
    domain: 'bond', facet: 'shield', reverse: true },

  // ── DISCIPLINE (Conscientiousness) ───────────────────────────

  // Mastery (Competence)
  { id: 49, text: { en: 'Handle tasks efficiently.', ca: 'Resolc les tasques amb eficàcia.', es: 'Resuelvo las tareas con eficacia.', fr: 'Gère les tâches efficacement.', de: 'Erledige Aufgaben effizient.', da: 'Håndterer opgaver effektivt.' },
    domain: 'discipline', facet: 'mastery', reverse: false },
  { id: 50, text: { en: 'Misjudge situations.', ca: 'Avalue malament les situacions.', es: 'Evalúo mal las situaciones.', fr: 'Juge mal les situations.', de: 'Schätze Situationen falsch ein.', da: 'Vurderer situationer forkert.' },
    domain: 'discipline', facet: 'mastery', reverse: true },

  // Structure (Order)
  { id: 51, text: { en: 'Like order.', ca: "M'agrada l'ordre.", es: 'Me gusta el orden.', fr: "Aime l'ordre.", de: 'Mag Ordnung.', da: 'Kan godt lide orden.' },
    domain: 'discipline', facet: 'structure', reverse: false },
  { id: 52, text: { en: 'Leave a mess in my room.', ca: "Deixe la meua habitació desordenada.", es: 'Dejo mi habitación desordenada.', fr: 'Laisse du désordre dans ma chambre.', de: 'Hinterlasse Unordnung in meinem Zimmer.', da: 'Efterlader rod i mit værelse.' },
    domain: 'discipline', facet: 'structure', reverse: true },

  // Oath (Dutifulness)
  { id: 53, text: { en: 'Keep my promises.', ca: 'Complixc les meues promeses.', es: 'Cumplo mis promesas.', fr: 'Tiens mes promesses.', de: 'Halte meine Versprechen.', da: 'Holder mine løfter.' },
    domain: 'discipline', facet: 'oath', reverse: false },
  { id: 54, text: { en: 'Break rules.', ca: 'Trenque les normes.', es: 'Rompo las normas.', fr: 'Enfreins les règles.', de: 'Breche Regeln.', da: 'Bryder regler.' },
    domain: 'discipline', facet: 'oath', reverse: true },

  // Quest (Achievement Striving)
  { id: 55, text: { en: 'Work hard.', ca: 'Treball dur.', es: 'Trabajo duro.', fr: 'Travaille dur.', de: 'Arbeite hart.', da: 'Arbejder hårdt.' },
    domain: 'discipline', facet: 'quest', reverse: false },
  { id: 56, text: { en: 'Put little time and effort into my work.', ca: 'Dedique poc temps i esforç al meu treball.', es: 'Dedico poco tiempo y esfuerzo a mi trabajo.', fr: "Consacre peu de temps et d'efforts à mon travail.", de: 'Investiere wenig Zeit und Mühe in meine Arbeit.', da: 'Bruger lidt tid og kræfter på mit arbejde.' },
    domain: 'discipline', facet: 'quest', reverse: true },

  // Will (Self-Discipline)
  { id: 57, text: { en: 'Get started on things right away.', ca: "Em pose a les coses de seguida.", es: 'Empiezo las cosas de inmediato.', fr: 'Me lance dans les choses tout de suite.', de: 'Fange sofort mit Dingen an.', da: 'Går i gang med tingene med det samme.' },
    domain: 'discipline', facet: 'will', reverse: false },
  { id: 58, text: { en: 'Have difficulty starting tasks.', ca: 'Em costa començar les tasques.', es: 'Me cuesta empezar las tareas.', fr: 'Ai du mal à démarrer les tâches.', de: 'Habe Schwierigkeiten, Aufgaben zu beginnen.', da: 'Har svært ved at komme i gang med opgaver.' },
    domain: 'discipline', facet: 'will', reverse: true },

  // Counsel (Deliberation)
  { id: 59, text: { en: 'Think before I speak.', ca: 'Pense abans de parlar.', es: 'Pienso antes de hablar.', fr: 'Réfléchis avant de parler.', de: 'Denke nach, bevor ich spreche.', da: 'Tænker mig om, før jeg taler.' },
    domain: 'discipline', facet: 'counsel', reverse: false },
  { id: 60, text: { en: 'Make hasty decisions.', ca: 'Prenc decisions precipitades.', es: 'Tomo decisiones precipitadas.', fr: 'Prends des décisions hâtives.', de: 'Treffe voreilige Entscheidungen.', da: 'Træffer forhastede beslutninger.' },
    domain: 'discipline', facet: 'counsel', reverse: true },
]

export const FQ_SCALE_LABELS = {
  1: 'Disagree strongly',
  2: 'Disagree a little',
  3: 'Neither agree nor disagree',
  4: 'Agree a little',
  5: 'Agree strongly',
}

export const FQ_DOMAIN_META = {
  presence:   { ...DOMAINS.presence,   facets: ['hearth', 'gather', 'command', 'drive', 'thrill', 'radiance'] },
  bond:       { ...DOMAINS.bond,       facets: ['faith', 'edge', 'gift', 'yield', 'shadow', 'shield'] },
  discipline: { ...DOMAINS.discipline, facets: ['mastery', 'structure', 'oath', 'quest', 'will', 'counsel'] },
  depth:      { ...DOMAINS.depth,      facets: ['vigil', 'blaze', 'hollow', 'veil', 'surge', 'fracture'] },
  vision:     { ...DOMAINS.vision,     facets: ['dream', 'craft', 'resonance', 'drift', 'prism', 'compass'] },
}

export const FQ_FACET_META = {
  // DEPTH
  vigil:     { cercol: 'Vigil',     valencian: 'Vigília',   academic: 'Anxiety',              domain: 'depth' },
  blaze:     { cercol: 'Blaze',     valencian: 'Flama',     academic: 'Angry Hostility',      domain: 'depth' },
  hollow:    { cercol: 'Hollow',    valencian: 'Buit',      academic: 'Depression',           domain: 'depth' },
  veil:      { cercol: 'Veil',      valencian: 'Vel',       academic: 'Self-Consciousness',   domain: 'depth' },
  surge:     { cercol: 'Surge',     valencian: 'Impuls',    academic: 'Impulsiveness',        domain: 'depth' },
  fracture:  { cercol: 'Fracture',  valencian: 'Escletxa',  academic: 'Vulnerability',        domain: 'depth' },
  // PRESENCE
  hearth:    { cercol: 'Hearth',    valencian: 'Llar',      academic: 'Warmth',               domain: 'presence' },
  gather:    { cercol: 'Gather',    valencian: 'Aplec',     academic: 'Gregariousness',       domain: 'presence' },
  command:   { cercol: 'Command',   valencian: 'Veu',       academic: 'Assertiveness',        domain: 'presence' },
  drive:     { cercol: 'Drive',     valencian: 'Empenta',   academic: 'Activity',             domain: 'presence' },
  thrill:    { cercol: 'Thrill',    valencian: 'Vertigen',  academic: 'Excitement-Seeking',   domain: 'presence' },
  radiance:  { cercol: 'Radiance',  valencian: 'Llum',      academic: 'Positive Emotions',    domain: 'presence' },
  // VISION
  dream:     { cercol: 'Dream',     valencian: 'Somni',     academic: 'Fantasy',              domain: 'vision' },
  craft:     { cercol: 'Craft',     valencian: 'Traç',      academic: 'Aesthetics',           domain: 'vision' },
  resonance: { cercol: 'Resonance', valencian: 'Ressò',     academic: 'Feelings',             domain: 'vision' },
  drift:     { cercol: 'Drift',     valencian: 'Volta',     academic: 'Actions',              domain: 'vision' },
  prism:     { cercol: 'Prism',     valencian: 'Prisma',    academic: 'Ideas',                domain: 'vision' },
  compass:   { cercol: 'Compass',   valencian: 'Brúixola',  academic: 'Values',               domain: 'vision' },
  // BOND
  faith:     { cercol: 'Faith',     valencian: 'Fe',        academic: 'Trust',                domain: 'bond' },
  edge:      { cercol: 'Edge',      valencian: 'Tall',      academic: 'Straightforwardness',  domain: 'bond' },
  gift:      { cercol: 'Gift',      valencian: 'Do',        academic: 'Altruism',             domain: 'bond' },
  yield:     { cercol: 'Yield',     valencian: 'Cessió',    academic: 'Compliance',           domain: 'bond' },
  shadow:    { cercol: 'Shadow',    valencian: 'Ombra',     academic: 'Modesty',              domain: 'bond' },
  shield:    { cercol: 'Shield',    valencian: 'Escut',     academic: 'Tender-Mindedness',    domain: 'bond' },
  // DISCIPLINE
  mastery:   { cercol: 'Mastery',   valencian: 'Mestria',   academic: 'Competence',           domain: 'discipline' },
  structure: { cercol: 'Structure', valencian: 'Trama',     academic: 'Order',                domain: 'discipline' },
  oath:      { cercol: 'Oath',      valencian: 'Pacte',     academic: 'Dutifulness',          domain: 'discipline' },
  quest:     { cercol: 'Quest',     valencian: 'Cerca',     academic: 'Achievement Striving', domain: 'discipline' },
  will:      { cercol: 'Will',      valencian: 'Voluntat',  academic: 'Self-Discipline',      domain: 'discipline' },
  counsel:   { cercol: 'Counsel',   valencian: 'Consell',   academic: 'Deliberation',         domain: 'discipline' },
}
