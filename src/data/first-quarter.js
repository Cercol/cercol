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
  { id: 1,  text: { en: 'Worry about things.', ca: 'Worry about things.', es: 'Me preocupo por las cosas.' },
    domain: 'depth', facet: 'vigil', reverse: false },
  { id: 2,  text: { en: 'Fear for the worst.', ca: 'Fear for the worst.', es: 'Temo lo peor.' },
    domain: 'depth', facet: 'vigil', reverse: false },

  // Blaze (Angry Hostility)
  { id: 3,  text: { en: 'Get angry easily.', ca: 'Get angry easily.', es: 'Me enfado con facilidad.' },
    domain: 'depth', facet: 'blaze', reverse: false },
  { id: 4,  text: { en: 'Get irritated easily.', ca: 'Get irritated easily.', es: 'Me irrito con facilidad.' },
    domain: 'depth', facet: 'blaze', reverse: false },

  // Hollow (Depression)
  { id: 5,  text: { en: 'Often feel blue.', ca: 'Often feel blue.', es: 'Con frecuencia me siento triste.' },
    domain: 'depth', facet: 'hollow', reverse: false },
  { id: 6,  text: { en: 'Dislike myself.', ca: 'Dislike myself.', es: 'No me agrado a mí mismo/a.' },
    domain: 'depth', facet: 'hollow', reverse: false },

  // Veil (Self-Consciousness)
  { id: 7,  text: { en: 'Am easily embarrassed.', ca: 'Am easily embarrassed.', es: 'Me avergüenzo con facilidad.' },
    domain: 'depth', facet: 'veil', reverse: false },
  { id: 8,  text: { en: 'Find it difficult to approach others.', ca: 'Find it difficult to approach others.', es: 'Me cuesta acercarme a los demás.' },
    domain: 'depth', facet: 'veil', reverse: false },

  // Surge (Impulsiveness)
  { id: 9,  text: { en: 'Act without thinking.', ca: 'Act without thinking.', es: 'Actúo sin pensar.' },
    domain: 'depth', facet: 'surge', reverse: false },
  { id: 10, text: { en: 'Often eat too much.', ca: 'Often eat too much.', es: 'Con frecuencia como en exceso.' },
    domain: 'depth', facet: 'surge', reverse: false },

  // Fracture (Vulnerability)
  { id: 11, text: { en: 'Panic easily.', ca: 'Panic easily.', es: 'Me entra el pánico fácilmente.' },
    domain: 'depth', facet: 'fracture', reverse: false },
  { id: 12, text: { en: "Feel that I'm unable to deal with things.", ca: "Feel that I'm unable to deal with things.", es: 'Siento que soy incapaz de hacer frente a las cosas.' },
    domain: 'depth', facet: 'fracture', reverse: false },

  // ── PRESENCE (Extraversion) ───────────────────────────────────

  // Hearth (Warmth)
  { id: 13, text: { en: 'Make friends easily.', ca: 'Make friends easily.', es: 'Hago amigos/as con facilidad.' },
    domain: 'presence', facet: 'hearth', reverse: false },
  { id: 14, text: { en: 'Am hard to get to know.', ca: 'Am hard to get to know.', es: 'Soy difícil de conocer.' },
    domain: 'presence', facet: 'hearth', reverse: true },

  // Gather (Gregariousness)
  { id: 15, text: { en: 'Am the life of the party.', ca: 'Am the life of the party.', es: 'Soy el/la alma de la fiesta.' },
    domain: 'presence', facet: 'gather', reverse: false },
  { id: 16, text: { en: "Don't like to draw attention to myself.", ca: "Don't like to draw attention to myself.", es: 'No me gusta llamar la atención sobre mí mismo/a.' },
    domain: 'presence', facet: 'gather', reverse: true },

  // Command (Assertiveness)
  { id: 17, text: { en: 'Take charge.', ca: 'Take charge.', es: 'Tomo las riendas.' },
    domain: 'presence', facet: 'command', reverse: false },
  { id: 18, text: { en: 'Wait for others to lead the way.', ca: 'Wait for others to lead the way.', es: 'Espero que otros tomen la iniciativa.' },
    domain: 'presence', facet: 'command', reverse: true },

  // Drive (Activity)
  { id: 19, text: { en: 'Am always busy.', ca: 'Am always busy.', es: 'Siempre estoy ocupado/a.' },
    domain: 'presence', facet: 'drive', reverse: false },
  { id: 20, text: { en: 'Like to take it easy.', ca: 'Like to take it easy.', es: 'Me gusta tomarme las cosas con calma.' },
    domain: 'presence', facet: 'drive', reverse: true },

  // Thrill (Excitement-Seeking)
  { id: 21, text: { en: 'Love excitement.', ca: 'Love excitement.', es: 'Me encanta la emoción.' },
    domain: 'presence', facet: 'thrill', reverse: false },
  { id: 22, text: { en: 'Prefer quiet, peaceful settings.', ca: 'Prefer quiet, peaceful settings.', es: 'Prefiero entornos tranquilos y pacíficos.' },
    domain: 'presence', facet: 'thrill', reverse: true },

  // Radiance (Positive Emotions)
  { id: 23, text: { en: 'Radiate joy.', ca: 'Radiate joy.', es: 'Irradio alegría.' },
    domain: 'presence', facet: 'radiance', reverse: false },
  { id: 24, text: { en: 'Am not easily amused.', ca: 'Am not easily amused.', es: 'No me divierto con facilidad.' },
    domain: 'presence', facet: 'radiance', reverse: true },

  // ── VISION (Openness) ─────────────────────────────────────────

  // Dream (Fantasy)
  { id: 25, text: { en: 'Have a vivid imagination.', ca: 'Have a vivid imagination.', es: 'Tengo una imaginación vívida.' },
    domain: 'vision', facet: 'dream', reverse: false },
  { id: 26, text: { en: 'Seldom daydream.', ca: 'Seldom daydream.', es: 'Rara vez sueño despierto/a.' },
    domain: 'vision', facet: 'dream', reverse: true },

  // Craft (Aesthetics)
  { id: 27, text: { en: 'Believe in the importance of art.', ca: 'Believe in the importance of art.', es: 'Creo en la importancia del arte.' },
    domain: 'vision', facet: 'craft', reverse: false },
  { id: 28, text: { en: 'Do not like art.', ca: 'Do not like art.', es: 'No me gusta el arte.' },
    domain: 'vision', facet: 'craft', reverse: true },

  // Resonance (Feelings)
  { id: 29, text: { en: 'Experience my emotions intensely.', ca: 'Experience my emotions intensely.', es: 'Vivo mis emociones con intensidad.' },
    domain: 'vision', facet: 'resonance', reverse: false },
  { id: 30, text: { en: "Don't understand people who get emotional.", ca: "Don't understand people who get emotional.", es: 'No entiendo a las personas que se emocionan.' },
    domain: 'vision', facet: 'resonance', reverse: true },

  // Drift (Actions)
  { id: 31, text: { en: 'Prefer variety to routine.', ca: 'Prefer variety to routine.', es: 'Prefiero la variedad a la rutina.' },
    domain: 'vision', facet: 'drift', reverse: false },
  { id: 32, text: { en: 'Prefer to stick with things that I know.', ca: 'Prefer to stick with things that I know.', es: 'Prefiero quedarme con lo que conozco.' },
    domain: 'vision', facet: 'drift', reverse: true },

  // Prism (Ideas)
  { id: 33, text: { en: 'Am quick to understand things.', ca: 'Am quick to understand things.', es: 'Comprendo las cosas con rapidez.' },
    domain: 'vision', facet: 'prism', reverse: false },
  { id: 34, text: { en: 'Have difficulty understanding abstract ideas.', ca: 'Have difficulty understanding abstract ideas.', es: 'Me cuesta entender ideas abstractas.' },
    domain: 'vision', facet: 'prism', reverse: true },

  // Compass (Values)
  { id: 35, text: { en: 'Believe that there is no absolute right or wrong.', ca: 'Believe that there is no absolute right or wrong.', es: 'Creo que no existe un bien o un mal absoluto.' },
    domain: 'vision', facet: 'compass', reverse: false },
  { id: 36, text: { en: 'Tend to vote for conservative political candidates.', ca: 'Tend to vote for conservative political candidates.', es: 'Tiendo a votar por candidatos políticos conservadores.' },
    domain: 'vision', facet: 'compass', reverse: true },

  // ── BOND (Agreeableness) ──────────────────────────────────────

  // Faith (Trust)
  { id: 37, text: { en: 'Trust others.', ca: 'Trust others.', es: 'Confío en los demás.' },
    domain: 'bond', facet: 'faith', reverse: false },
  { id: 38, text: { en: 'Suspect hidden motives in others.', ca: 'Suspect hidden motives in others.', es: 'Sospecho de las motivaciones ocultas de los demás.' },
    domain: 'bond', facet: 'faith', reverse: true },

  // Edge (Straightforwardness)
  { id: 39, text: { en: "Don't beat around the bush.", ca: "Don't beat around the bush.", es: 'No me ando con rodeos.' },
    domain: 'bond', facet: 'edge', reverse: false },
  { id: 40, text: { en: 'Use flattery to get ahead.', ca: 'Use flattery to get ahead.', es: 'Uso la adulación para progresar.' },
    domain: 'bond', facet: 'edge', reverse: true },

  // Gift (Altruism)
  { id: 41, text: { en: 'Make people feel welcome.', ca: 'Make people feel welcome.', es: 'Hago que la gente se sienta bienvenida.' },
    domain: 'bond', facet: 'gift', reverse: false },
  { id: 42, text: { en: 'Am indifferent to the feelings of others.', ca: 'Am indifferent to the feelings of others.', es: 'Soy indiferente a los sentimientos de los demás.' },
    domain: 'bond', facet: 'gift', reverse: true },

  // Yield (Compliance)
  { id: 43, text: { en: 'Hate to seem pushy.', ca: 'Hate to seem pushy.', es: 'Me disgusta parecer insistente.' },
    domain: 'bond', facet: 'yield', reverse: false },
  { id: 44, text: { en: 'Insult people.', ca: 'Insult people.', es: 'Insulto a las personas.' },
    domain: 'bond', facet: 'yield', reverse: true },

  // Shadow (Modesty)
  { id: 45, text: { en: 'Dislike being the center of attention.', ca: 'Dislike being the center of attention.', es: 'No me gusta ser el centro de atención.' },
    domain: 'bond', facet: 'shadow', reverse: false },
  { id: 46, text: { en: 'Think highly of myself.', ca: 'Think highly of myself.', es: 'Tengo un alto concepto de mí mismo/a.' },
    domain: 'bond', facet: 'shadow', reverse: true },

  // Shield (Tender-Mindedness)
  { id: 47, text: { en: 'Sympathize with the homeless.', ca: 'Sympathize with the homeless.', es: 'Me compadezco de las personas sin hogar.' },
    domain: 'bond', facet: 'shield', reverse: false },
  { id: 48, text: { en: 'Believe in an eye for an eye.', ca: 'Believe in an eye for an eye.', es: 'Creo en ojo por ojo.' },
    domain: 'bond', facet: 'shield', reverse: true },

  // ── DISCIPLINE (Conscientiousness) ───────────────────────────

  // Mastery (Competence)
  { id: 49, text: { en: 'Handle tasks efficiently.', ca: 'Handle tasks efficiently.', es: 'Resuelvo las tareas con eficacia.' },
    domain: 'discipline', facet: 'mastery', reverse: false },
  { id: 50, text: { en: 'Misjudge situations.', ca: 'Misjudge situations.', es: 'Evalúo mal las situaciones.' },
    domain: 'discipline', facet: 'mastery', reverse: true },

  // Structure (Order)
  { id: 51, text: { en: 'Like order.', ca: 'Like order.', es: 'Me gusta el orden.' },
    domain: 'discipline', facet: 'structure', reverse: false },
  { id: 52, text: { en: 'Leave a mess in my room.', ca: 'Leave a mess in my room.', es: 'Dejo mi habitación desordenada.' },
    domain: 'discipline', facet: 'structure', reverse: true },

  // Oath (Dutifulness)
  { id: 53, text: { en: 'Keep my promises.', ca: 'Keep my promises.', es: 'Cumplo mis promesas.' },
    domain: 'discipline', facet: 'oath', reverse: false },
  { id: 54, text: { en: 'Break rules.', ca: 'Break rules.', es: 'Rompo las normas.' },
    domain: 'discipline', facet: 'oath', reverse: true },

  // Quest (Achievement Striving)
  { id: 55, text: { en: 'Work hard.', ca: 'Work hard.', es: 'Trabajo duro.' },
    domain: 'discipline', facet: 'quest', reverse: false },
  { id: 56, text: { en: 'Put little time and effort into my work.', ca: 'Put little time and effort into my work.', es: 'Dedico poco tiempo y esfuerzo a mi trabajo.' },
    domain: 'discipline', facet: 'quest', reverse: true },

  // Will (Self-Discipline)
  { id: 57, text: { en: 'Get started on things right away.', ca: 'Get started on things right away.', es: 'Empiezo las cosas de inmediato.' },
    domain: 'discipline', facet: 'will', reverse: false },
  { id: 58, text: { en: 'Have difficulty starting tasks.', ca: 'Have difficulty starting tasks.', es: 'Me cuesta empezar las tareas.' },
    domain: 'discipline', facet: 'will', reverse: true },

  // Counsel (Deliberation)
  { id: 59, text: { en: 'Think before I speak.', ca: 'Think before I speak.', es: 'Pienso antes de hablar.' },
    domain: 'discipline', facet: 'counsel', reverse: false },
  { id: 60, text: { en: 'Make hasty decisions.', ca: 'Make hasty decisions.', es: 'Tomo decisiones precipitadas.' },
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
