/**
 * Cèrcol First Quarter — IPIP-NEO-60 instrument
 *
 * Source: Maples-Keller, J. L., Williamson, R. L., Sleep, C. E.,
 * Carter, N. T., Campbell, W. K., & Miller, J. D. (2019).
 * Using item response theory to develop a 60-item representation
 * of the NEO PI-R using the International Personality Item Pool:
 * Development of the IPIP-NEO-60.
 * Journal of Personality Assessment, 101(1), 4-15.
 * doi:10.1080/00223891.2017.1381968
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

  // ── DEPTH (Neuroticism) ─────────────────────────
  // Vigil (Anxiety) — n1
  { id: 1,   text: { en: 'Worry about things.', ca: 'Em preocupo per les coses.', es: 'Me preocupo por las cosas.', fr: "Je m'inquiète à propos de choses.", de: 'Mache mir Sorgen um Dinge.', da: 'Bekymrer mig om mange ting.' },
    domain: 'depth', facet: 'vigil', reverse: false },
  { id: 2,   text: { en: 'Get stressed out easily.', es: 'Me estreso fácilmente.', fr: 'Je deviens stressé facilement.', da: 'Bliver let stresset.' },
    domain: 'depth', facet: 'vigil', reverse: false },
  // Blaze (Anger) — n2
  { id: 3,   text: { en: 'Get angry easily.', ca: "M'enfado amb facilitat.", es: 'Me enojo fácilmente.', fr: 'Je me mets en colère facilement.', de: 'Werde leicht wütend.', da: 'Bliver let vred.' },
    domain: 'depth', facet: 'blaze', reverse: false },
  { id: 4,   text: { en: 'Lose my temper.', ca: 'Perdo els nervis.', es: 'Pierdo el temperamento.', fr: 'Je perds patience.', de: 'Verliere die Beherrschung.', da: 'Mister let besindelsen.' },
    domain: 'depth', facet: 'blaze', reverse: false },
  // Hollow (Depression) — n3
  { id: 5,   text: { en: 'Often feel blue.', ca: 'Sovint em sento trist/a.', es: 'A menudo me siento desanimado.', fr: 'Je me sens souvent triste.', de: 'Fühle mich oft niedergeschlagen.', da: 'Er ofte nedtrykt.' },
    domain: 'depth', facet: 'hollow', reverse: false },
  { id: 6,   text: { en: 'Dislike myself.', ca: "No m'agrada com soc.", es: 'No me agrado.', fr: "Je ne m'aime pas.", de: 'Mag mich selbst nicht.', da: 'Bryder mig ikke om mig selv.' },
    domain: 'depth', facet: 'hollow', reverse: false },
  // Veil (Self-Consciousness) — n4
  { id: 7,   text: { en: 'Find it difficult to approach others.', ca: 'Em costa apropar-me als altres.', es: 'Me resulta difícil acercarme a otros.', fr: "J'éprouve de la difficulté à aborder les autres.", de: 'Finde es schwierig, auf andere zuzugehen.', da: 'Har svært ved at indlede en samtale.' },
    domain: 'depth', facet: 'veil', reverse: false },
  { id: 8,   text: { en: 'Am easily intimidated.', fr: 'Je suis facilement intimidé.' },
    domain: 'depth', facet: 'veil', reverse: false },
  // Surge (Immoderation) — n5
  { id: 9,   text: { en: 'Rarely overindulge.', ca: 'Rarament em passo de la ratlla.', es: 'Rara vez cedo a los excesos.', fr: 'Je fais rarement des excès.', de: 'Übertreibe selten.', da: 'Spiser og drikker sjældent for meget.' },
    domain: 'depth', facet: 'surge', reverse: true  },
  { id: 10,  text: { en: 'Am able to control my cravings.', es: 'Soy capaz de controlar mis antojos.', fr: 'Je suis capable de contrôler mes envies.', da: 'Kan styre mine behov' },
    domain: 'depth', facet: 'surge', reverse: true  },
  // Fracture (Vulnerability) — n6
  { id: 11,  text: { en: 'Remain calm under pressure.', ca: 'Em mantinc tranquil/il·la sota pressió.', es: 'Mantengo la calma bajo presión.', fr: 'Je demeure calme sous pression.', de: 'Bleibe unter Druck ruhig.', da: 'Bevarer roen i pressede situationer.' },
    domain: 'depth', facet: 'fracture', reverse: true  },
  { id: 12,  text: { en: 'Am calm even in tense situations.', fr: 'Je suis calme, même dans les situations tendues.' },
    domain: 'depth', facet: 'fracture', reverse: true  },

  // ── PRESENCE (Extraversion) ─────────────────────
  // Hearth (Friendliness) — e1
  { id: 13,  text: { en: 'Make friends easily.', ca: 'Faig amics amb facilitat.', es: 'Hago amigos fácilmente.', fr: 'Je me fais des amis facilement.', de: 'Schließe leicht Freundschaften.', da: 'Har let ved at få venner.' },
    domain: 'presence', facet: 'hearth', reverse: false },
  { id: 14,  text: { en: 'Act comfortably with others.', fr: "J'agis aisément avec les autres." },
    domain: 'presence', facet: 'hearth', reverse: false },
  // Gather (Gregariousness) — e2
  { id: 15,  text: { en: 'Love large parties.', es: 'Me encantan las fiestas grandes.', fr: "J'adore les grandes fêtes.", da: 'Elsker store fester.' },
    domain: 'presence', facet: 'gather', reverse: false },
  { id: 16,  text: { en: 'Avoid crowds.', es: 'Evito las multitudes.', fr: "J'évite les foules.", da: 'Undgår folkemængder.' },
    domain: 'presence', facet: 'gather', reverse: true  },
  // Command (Assertiveness) — e3
  { id: 17,  text: { en: 'Take charge.', ca: 'Prenc les regnes.', es: 'Tomo el mando.', fr: "J'aime prendre en charge.", de: 'Übernehme die Führung.', da: 'Tager føringen.' },
    domain: 'presence', facet: 'command', reverse: false },
  { id: 18,  text: { en: 'Try to lead others.', ca: 'Intento liderar els altres.', es: 'Trato de guiar a otros.', fr: "J'essaie de diriger les autres.", de: 'Versuche, andere zu führen.', da: 'Forsøger at lede andre.' },
    domain: 'presence', facet: 'command', reverse: false },
  // Drive (Activity Level) — e4
  { id: 19,  text: { en: 'Am always busy.', ca: 'Sempre estic ocupat/da.', es: 'Siempre estoy ocupado.', fr: 'Je suis toujours occupé.', de: 'Bin immer beschäftigt.', da: 'Har altid travlt.' },
    domain: 'presence', facet: 'drive', reverse: false },
  { id: 20,  text: { en: 'Am always on the go.', ca: 'Sempre estic en moviment.', es: 'Siempre estoy activo.', fr: 'Je suis toujours en mouvement.', de: 'Bin immer unterwegs.', da: 'Er altid i gang m ed noget.' },
    domain: 'presence', facet: 'drive', reverse: false },
  // Thrill (Excitement-Seeking) — e5
  { id: 21,  text: { en: 'Love excitement.', ca: "M'encanta l'emoció.", es: 'Me encanta la emoción.', fr: "J'adore les sensations fortes.", de: 'Liebe Aufregung.', da: 'Elsker spænding.' },
    domain: 'presence', facet: 'thrill', reverse: false },
  { id: 22,  text: { en: 'Seek adventure.', ca: "Busco l'aventura.", es: 'Me gusta buscar aventuras.', fr: "Je recherche l'aventure.", de: 'Suche das Abenteuer.', da: 'Søger eventyr.' },
    domain: 'presence', facet: 'thrill', reverse: false },
  // Radiance (Cheerfulness) — e6
  { id: 23,  text: { en: 'Have a lot of fun.', ca: "M'ho passo molt bé.", es: 'Me divierto mucho.', fr: "J'ai beaucoup de plaisir.", de: 'Habe sehr viel Spaß.', da: 'Har det ofte sjovt.' },
    domain: 'presence', facet: 'radiance', reverse: false },
  { id: 24,  text: { en: 'Love life.', es: 'Amo la vida.', fr: "J'adore la vie.", da: 'Elsker livet.' },
    domain: 'presence', facet: 'radiance', reverse: false },

  // ── VISION (Openness) ───────────────────────────
  // Dream (Imagination) — o1
  { id: 25,  text: { en: 'Have a vivid imagination.', ca: 'Tinc una imaginació molt viva.', es: 'Tengo una imaginación vivida.', fr: "J'ai une imagination débordante.", de: 'Habe eine lebhafte Fantasie.', da: 'Har en livlig fantasi.' },
    domain: 'vision', facet: 'dream', reverse: false },
  { id: 26,  text: { en: 'Love to daydream.', es: 'Me gusta soñar despierto.', fr: "J'adore rêvasser.", da: 'Elsker at dagdrømme.' },
    domain: 'vision', facet: 'dream', reverse: false },
  // Craft (Artistic Interests) — o2
  { id: 27,  text: { en: 'Believe in the importance of art.', ca: "Crec en la importància de l'art.", es: 'Creo en la importancia del arte.', fr: "Je crois en l'importance de l'art.", de: 'Glaube an die Bedeutung von Kunst.', da: 'Tror på betydningen af kunst.' },
    domain: 'vision', facet: 'craft', reverse: false },
  { id: 28,  text: { en: 'Do not like art.', ca: "No m'agrada l'art.", es: 'No me gusta el arte.', fr: "Je n'aime pas l'art.", de: 'Mag Kunst nicht.', da: 'Kan ikke lide kunst.' },
    domain: 'vision', facet: 'craft', reverse: true  },
  // Resonance (Emotionality) — o3
  { id: 29,  text: { en: 'Experience my emotions intensely.', ca: 'Visc les meves emocions amb intensitat.', es: 'Experimento mis emociones intensamente.', fr: 'Je vis mes émotions intensément.', de: 'Erlebe meine Gefühle intensiv.', da: 'Oplever mine følelser intenst.' },
    domain: 'vision', facet: 'resonance', reverse: false },
  { id: 30,  text: { en: 'Am not easily affected by my emotions.', fr: 'Je ne suis pas facilement affecté par mes émotions.' },
    domain: 'vision', facet: 'resonance', reverse: true  },
  // Drift (Adventurousness) — o4
  { id: 31,  text: { en: 'Prefer to stick with things that I know.', ca: 'Prefereixo quedar-me amb el que conec.', es: 'Prefiero apegarme a las cosas que sé.', fr: "Je préfère m'en tenir aux choses connues.", de: 'Bleibe lieber bei dem, was ich kenne.', da: 'Foretrækker at holde mig til det, jeg kender.' },
    domain: 'vision', facet: 'drift', reverse: true  },
  { id: 32,  text: { en: 'Don’t like the idea of change.', fr: "Je n'aime pas l'idée de changer." },
    domain: 'vision', facet: 'drift', reverse: true  },
  // Prism (Intellect) — o5
  { id: 33,  text: { en: 'Avoid philosophical discussions.', ca: 'Evito les discussions filosòfiques.', es: 'Evito discusiones filosóficas.', fr: "J'évite les discussions philosophiques.", de: 'Vermeide philosophische Diskussionen.', da: 'Undgår filosofiske diskussioner.' },
    domain: 'vision', facet: 'prism', reverse: true  },
  { id: 34,  text: { en: 'Am not interested in theoretical discussions.', es: 'No tengo interés en las discusiones teóricas o hipotéticas.', fr: 'Je ne suis pas intéressé par les discussions théoriques.', da: 'Er ikke interesseret i teoretiske diskussioner.' },
    domain: 'vision', facet: 'prism', reverse: true  },
  // Compass (Liberalism) — o6
  { id: 35,  text: { en: 'Tend to vote for liberal political candidates.', es: 'Tiendo a votar por políticos liberales.', fr: 'J’ai tendance à promouvoir des valeurs sociales libérales.', da: 'Ser mig selv som mest venstreorienteret.' },
    domain: 'vision', facet: 'compass', reverse: false },
  { id: 36,  text: { en: 'Believe in one true religion.', fr: 'Je crois en une seule vraie religion.' },
    domain: 'vision', facet: 'compass', reverse: true  },

  // ── BOND (Agreeableness) ────────────────────────
  // Faith (Trust) — a1
  { id: 37,  text: { en: 'Trust others.', ca: 'Confio en els altres.', es: 'Confío en los demás.', fr: 'Je fais confiance aux autres.', de: 'Vertraue anderen.', da: 'Har tillid til andre.' },
    domain: 'bond', facet: 'faith', reverse: false },
  { id: 38,  text: { en: 'Believe that others have good intentions.', ca: 'Crec que els altres tenen bones intencions.', es: 'Creo que los demás tienen buenas intenciones.', fr: 'Je crois que les autres ont de bonnes intentions.', de: 'Glaube, dass andere gute Absichten haben.', da: 'Tror generelt, andre vil mig det bedste.' },
    domain: 'bond', facet: 'faith', reverse: false },
  // Edge (Morality) — a2
  { id: 39,  text: { en: 'Cheat to get ahead.', es: 'Hago trampa para avanzar.', fr: 'Je triche pour avancer.', da: 'Snyder for at få et forspring.' },
    domain: 'bond', facet: 'edge', reverse: true  },
  { id: 40,  text: { en: 'Take advantage of others.', ca: "M'aprofito dels altres.", es: 'Tomo ventaja de los demás.', fr: 'Je profite des autres.', de: 'Nutze andere aus.', da: 'Udnytter andre.' },
    domain: 'bond', facet: 'edge', reverse: true  },
  // Gift (Altruism) — a3
  { id: 41,  text: { en: 'Love to help others.', es: 'Me gusta ayudar a otros.', fr: "J'adore aider les autres.", da: 'Elsker at hjælpe andre.' },
    domain: 'bond', facet: 'gift', reverse: false },
  { id: 42,  text: { en: 'Am concerned about others.', es: 'Me preocupo por los demás.', fr: 'Je me préoccupe des autres.', da: 'Bekymrer mig om andre.' },
    domain: 'bond', facet: 'gift', reverse: false },
  // Yield (Cooperation) — a4
  { id: 43,  text: { en: 'Insult people.', ca: 'Insulto les persones.', es: 'Insulto a las personas.', fr: "J'insulte les gens.", de: 'Beleidige Menschen.', da: 'Fornærmer folk.' },
    domain: 'bond', facet: 'yield', reverse: true  },
  { id: 44,  text: { en: 'Get back at others.', es: 'Cuando me la hacen me la pagan.', fr: "Je m'en prends aux autres.", da: 'Tager hævn over andre.' },
    domain: 'bond', facet: 'yield', reverse: true  },
  // Shadow (Modesty) — a5
  { id: 45,  text: { en: 'Believe that I am better than others.', es: 'Creo que soy mejor que otros.', fr: 'Je crois être meilleur que les autres.', da: 'Mener, jeg er bedre end andre.' },
    domain: 'bond', facet: 'shadow', reverse: true  },
  { id: 46,  text: { en: 'Think highly of myself.', ca: 'Tinc un alt concepte de mi mateix/a.', es: 'Pienso muy bien de mí mismo.', fr: "J'ai une très grande estime de moi-même.", de: 'Habe eine hohe Meinung von mir selbst.', da: 'Har høje tanker om mig selv.' },
    domain: 'bond', facet: 'shadow', reverse: true  },
  // Shield (Sympathy) — a6
  { id: 47,  text: { en: 'Sympathize with the homeless.', ca: 'Em compadeixo de les persones sense llar.', es: 'Tengo empatía por las personas sin hogar.', fr: 'Je sympathise avec les sans-abri.', de: 'Habe Mitgefühl mit obdachlosen Menschen.', da: 'Har sympati for de hjemløse.' },
    domain: 'bond', facet: 'shield', reverse: false },
  { id: 48,  text: { en: 'Feel sympathy for those who are worse off than myself.', es: 'Siento empatía por aquellos que están más necesitados que yo.', fr: "J'ai de la sympathie pour les gens plus démunis que moi.", da: 'Føler sympati for dem, der har det værre end mig selv.' },
    domain: 'bond', facet: 'shield', reverse: false },

  // ── DISCIPLINE (Conscientiousness) ──────────────
  // Mastery (Self-Efficacy) — c1
  { id: 49,  text: { en: 'Handle tasks smoothly.', es: 'Realizo las tareas sin problemas.', fr: 'Je gère les tâches facilement.', da: 'Håndterer opgaver med lethed.' },
    domain: 'discipline', facet: 'mastery', reverse: false },
  { id: 50,  text: { en: 'Know how to get things done.', es: 'Se cómo hacer las cosas.', fr: 'Je sais comment faire avancer les choses.', da: 'Ved, hvordan man får tingene gjort.' },
    domain: 'discipline', facet: 'mastery', reverse: false },
  // Structure (Orderliness) — c2
  { id: 51,  text: { en: 'Like order.', ca: "M'agrada l'ordre.", es: 'Me gusta el orden.', fr: "J'aime l'ordre.", de: 'Mag Ordnung.', da: 'Kan godt lide orden.' },
    domain: 'discipline', facet: 'structure', reverse: false },
  { id: 52,  text: { en: 'Leave a mess in my room.', ca: 'Deixo la meva habitació desordenada.', es: 'Dejo un desorden en mi espacio.', fr: 'Je laisse ma chambre en désordre.', de: 'Hinterlasse Unordnung in meinem Zimmer.', da: 'Roder derhjemme.' },
    domain: 'discipline', facet: 'structure', reverse: true  },
  // Oath (Dutifulness) — c3
  { id: 53,  text: { en: 'Tell the truth.', ca: 'Dic la veritat.', es: 'Digo la verdad.', fr: 'Je dis la vérité.', de: 'Sage die Wahrheit.', da: 'Fortæller sandheden.' },
    domain: 'discipline', facet: 'oath', reverse: false },
  { id: 54,  text: { en: 'Break my promises.', es: 'Rompo mis promesas.', fr: 'Je ne tiens pas mes promesses.', da: 'Bryder mine løfter.' },
    domain: 'discipline', facet: 'oath', reverse: true  },
  // Quest (Achievement-Striving) — c4
  { id: 55,  text: { en: 'Work hard.', ca: 'Treballo dur.', es: 'Trabajo duro.', fr: 'Je travaille fort.', de: 'Arbeite hart.', da: 'Arbejder hårdt.' },
    domain: 'discipline', facet: 'quest', reverse: false },
  { id: 56,  text: { en: 'Set high standards for myself and others.', fr: 'Je me fixe des standards élevés pour moi-même et les autres.' },
    domain: 'discipline', facet: 'quest', reverse: false },
  // Will (Self-Discipline) — c5
  { id: 57,  text: { en: 'Carry out my plans.', es: 'Llevo a cabo mis planes.', fr: 'Je réalise mes objectifs.', da: 'Fører mine planer ud i livet.' },
    domain: 'discipline', facet: 'will', reverse: false },
  { id: 58,  text: { en: 'Have difficulty starting tasks.', ca: 'Em costa començar les tasques.', es: 'Dificultad para comenzar tareas.', fr: "J'ai de la difficulté à commencer les tâches.", de: 'Habe Schwierigkeiten, Aufgaben zu beginnen.', da: 'Har svært ved at gå i gang med opgaver.' },
    domain: 'discipline', facet: 'will', reverse: true  },
  // Counsel (Cautiousness) — c6
  { id: 59,  text: { en: 'Make rash decisions.', fr: 'Je prends des décisions impulsives.', da: 'Tager forhastede beslutninger.' },
    domain: 'discipline', facet: 'counsel', reverse: true  },
  { id: 60,  text: { en: 'Act without thinking.', ca: 'Actuo sense pensar.', es: 'Actúo sin pensar.', fr: "J'agis sans penser.", de: 'Handle ohne nachzudenken.', da: 'Handler uden at tænke.' },
    domain: 'discipline', facet: 'counsel', reverse: true  },
]

export const FQ_SCALE_LABELS = {
  1: 'Very inaccurate',
  2: 'Moderately inaccurate',
  3: 'Neither accurate nor inaccurate',
  4: 'Moderately accurate',
  5: 'Very accurate',
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
