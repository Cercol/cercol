/**
 * Cèrcol Waxing Crescent — IPIP-NEO-60 instrument
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

export const WC_ITEMS = [

  // ── DEPTH (Neuroticism) ───────────────────────────────────────

  // Vigil (Anxiety)
  { id: 1,  text: { en: 'Worry about things.', ca: 'Worry about things.' },
    domain: 'depth', facet: 'vigil', reverse: false },
  { id: 2,  text: { en: 'Fear for the worst.', ca: 'Fear for the worst.' },
    domain: 'depth', facet: 'vigil', reverse: false },

  // Blaze (Angry Hostility)
  { id: 3,  text: { en: 'Get angry easily.', ca: 'Get angry easily.' },
    domain: 'depth', facet: 'blaze', reverse: false },
  { id: 4,  text: { en: 'Get irritated easily.', ca: 'Get irritated easily.' },
    domain: 'depth', facet: 'blaze', reverse: false },

  // Hollow (Depression)
  { id: 5,  text: { en: 'Often feel blue.', ca: 'Often feel blue.' },
    domain: 'depth', facet: 'hollow', reverse: false },
  { id: 6,  text: { en: 'Dislike myself.', ca: 'Dislike myself.' },
    domain: 'depth', facet: 'hollow', reverse: false },

  // Veil (Self-Consciousness)
  { id: 7,  text: { en: 'Am easily embarrassed.', ca: 'Am easily embarrassed.' },
    domain: 'depth', facet: 'veil', reverse: false },
  { id: 8,  text: { en: 'Find it difficult to approach others.', ca: 'Find it difficult to approach others.' },
    domain: 'depth', facet: 'veil', reverse: false },

  // Surge (Impulsiveness)
  { id: 9,  text: { en: 'Act without thinking.', ca: 'Act without thinking.' },
    domain: 'depth', facet: 'surge', reverse: false },
  { id: 10, text: { en: 'Often eat too much.', ca: 'Often eat too much.' },
    domain: 'depth', facet: 'surge', reverse: false },

  // Fracture (Vulnerability)
  { id: 11, text: { en: 'Panic easily.', ca: 'Panic easily.' },
    domain: 'depth', facet: 'fracture', reverse: false },
  { id: 12, text: { en: "Feel that I'm unable to deal with things.", ca: "Feel that I'm unable to deal with things." },
    domain: 'depth', facet: 'fracture', reverse: false },

  // ── PRESENCE (Extraversion) ───────────────────────────────────

  // Hearth (Warmth)
  { id: 13, text: { en: 'Make friends easily.', ca: 'Make friends easily.' },
    domain: 'presence', facet: 'hearth', reverse: false },
  { id: 14, text: { en: 'Am hard to get to know.', ca: 'Am hard to get to know.' },
    domain: 'presence', facet: 'hearth', reverse: true },

  // Gather (Gregariousness)
  { id: 15, text: { en: 'Am the life of the party.', ca: 'Am the life of the party.' },
    domain: 'presence', facet: 'gather', reverse: false },
  { id: 16, text: { en: "Don't like to draw attention to myself.", ca: "Don't like to draw attention to myself." },
    domain: 'presence', facet: 'gather', reverse: true },

  // Command (Assertiveness)
  { id: 17, text: { en: 'Take charge.', ca: 'Take charge.' },
    domain: 'presence', facet: 'command', reverse: false },
  { id: 18, text: { en: 'Wait for others to lead the way.', ca: 'Wait for others to lead the way.' },
    domain: 'presence', facet: 'command', reverse: true },

  // Drive (Activity)
  { id: 19, text: { en: 'Am always busy.', ca: 'Am always busy.' },
    domain: 'presence', facet: 'drive', reverse: false },
  { id: 20, text: { en: 'Like to take it easy.', ca: 'Like to take it easy.' },
    domain: 'presence', facet: 'drive', reverse: true },

  // Thrill (Excitement-Seeking)
  { id: 21, text: { en: 'Love excitement.', ca: 'Love excitement.' },
    domain: 'presence', facet: 'thrill', reverse: false },
  { id: 22, text: { en: 'Prefer quiet, peaceful settings.', ca: 'Prefer quiet, peaceful settings.' },
    domain: 'presence', facet: 'thrill', reverse: true },

  // Radiance (Positive Emotions)
  { id: 23, text: { en: 'Radiate joy.', ca: 'Radiate joy.' },
    domain: 'presence', facet: 'radiance', reverse: false },
  { id: 24, text: { en: 'Am not easily amused.', ca: 'Am not easily amused.' },
    domain: 'presence', facet: 'radiance', reverse: true },

  // ── VISION (Openness) ─────────────────────────────────────────

  // Dream (Fantasy)
  { id: 25, text: { en: 'Have a vivid imagination.', ca: 'Have a vivid imagination.' },
    domain: 'vision', facet: 'dream', reverse: false },
  { id: 26, text: { en: 'Seldom daydream.', ca: 'Seldom daydream.' },
    domain: 'vision', facet: 'dream', reverse: true },

  // Craft (Aesthetics)
  { id: 27, text: { en: 'Believe in the importance of art.', ca: 'Believe in the importance of art.' },
    domain: 'vision', facet: 'craft', reverse: false },
  { id: 28, text: { en: 'Do not like art.', ca: 'Do not like art.' },
    domain: 'vision', facet: 'craft', reverse: true },

  // Resonance (Feelings)
  { id: 29, text: { en: 'Experience my emotions intensely.', ca: 'Experience my emotions intensely.' },
    domain: 'vision', facet: 'resonance', reverse: false },
  { id: 30, text: { en: "Don't understand people who get emotional.", ca: "Don't understand people who get emotional." },
    domain: 'vision', facet: 'resonance', reverse: true },

  // Drift (Actions)
  { id: 31, text: { en: 'Prefer variety to routine.', ca: 'Prefer variety to routine.' },
    domain: 'vision', facet: 'drift', reverse: false },
  { id: 32, text: { en: 'Prefer to stick with things that I know.', ca: 'Prefer to stick with things that I know.' },
    domain: 'vision', facet: 'drift', reverse: true },

  // Prism (Ideas)
  { id: 33, text: { en: 'Am quick to understand things.', ca: 'Am quick to understand things.' },
    domain: 'vision', facet: 'prism', reverse: false },
  { id: 34, text: { en: 'Have difficulty understanding abstract ideas.', ca: 'Have difficulty understanding abstract ideas.' },
    domain: 'vision', facet: 'prism', reverse: true },

  // Compass (Values)
  { id: 35, text: { en: 'Believe that there is no absolute right or wrong.', ca: 'Believe that there is no absolute right or wrong.' },
    domain: 'vision', facet: 'compass', reverse: false },
  { id: 36, text: { en: 'Tend to vote for conservative political candidates.', ca: 'Tend to vote for conservative political candidates.' },
    domain: 'vision', facet: 'compass', reverse: true },

  // ── BOND (Agreeableness) ──────────────────────────────────────

  // Faith (Trust)
  { id: 37, text: { en: 'Trust others.', ca: 'Trust others.' },
    domain: 'bond', facet: 'faith', reverse: false },
  { id: 38, text: { en: 'Suspect hidden motives in others.', ca: 'Suspect hidden motives in others.' },
    domain: 'bond', facet: 'faith', reverse: true },

  // Edge (Straightforwardness)
  { id: 39, text: { en: "Don't beat around the bush.", ca: "Don't beat around the bush." },
    domain: 'bond', facet: 'edge', reverse: false },
  { id: 40, text: { en: 'Use flattery to get ahead.', ca: 'Use flattery to get ahead.' },
    domain: 'bond', facet: 'edge', reverse: true },

  // Gift (Altruism)
  { id: 41, text: { en: 'Make people feel welcome.', ca: 'Make people feel welcome.' },
    domain: 'bond', facet: 'gift', reverse: false },
  { id: 42, text: { en: 'Am indifferent to the feelings of others.', ca: 'Am indifferent to the feelings of others.' },
    domain: 'bond', facet: 'gift', reverse: true },

  // Yield (Compliance)
  { id: 43, text: { en: 'Hate to seem pushy.', ca: 'Hate to seem pushy.' },
    domain: 'bond', facet: 'yield', reverse: false },
  { id: 44, text: { en: 'Insult people.', ca: 'Insult people.' },
    domain: 'bond', facet: 'yield', reverse: true },

  // Shadow (Modesty)
  { id: 45, text: { en: 'Dislike being the center of attention.', ca: 'Dislike being the center of attention.' },
    domain: 'bond', facet: 'shadow', reverse: false },
  { id: 46, text: { en: 'Think highly of myself.', ca: 'Think highly of myself.' },
    domain: 'bond', facet: 'shadow', reverse: true },

  // Shield (Tender-Mindedness)
  { id: 47, text: { en: 'Sympathize with the homeless.', ca: 'Sympathize with the homeless.' },
    domain: 'bond', facet: 'shield', reverse: false },
  { id: 48, text: { en: 'Believe in an eye for an eye.', ca: 'Believe in an eye for an eye.' },
    domain: 'bond', facet: 'shield', reverse: true },

  // ── DISCIPLINE (Conscientiousness) ───────────────────────────

  // Mastery (Competence)
  { id: 49, text: { en: 'Handle tasks efficiently.', ca: 'Handle tasks efficiently.' },
    domain: 'discipline', facet: 'mastery', reverse: false },
  { id: 50, text: { en: 'Misjudge situations.', ca: 'Misjudge situations.' },
    domain: 'discipline', facet: 'mastery', reverse: true },

  // Structure (Order)
  { id: 51, text: { en: 'Like order.', ca: 'Like order.' },
    domain: 'discipline', facet: 'structure', reverse: false },
  { id: 52, text: { en: 'Leave a mess in my room.', ca: 'Leave a mess in my room.' },
    domain: 'discipline', facet: 'structure', reverse: true },

  // Oath (Dutifulness)
  { id: 53, text: { en: 'Keep my promises.', ca: 'Keep my promises.' },
    domain: 'discipline', facet: 'oath', reverse: false },
  { id: 54, text: { en: 'Break rules.', ca: 'Break rules.' },
    domain: 'discipline', facet: 'oath', reverse: true },

  // Quest (Achievement Striving)
  { id: 55, text: { en: 'Work hard.', ca: 'Work hard.' },
    domain: 'discipline', facet: 'quest', reverse: false },
  { id: 56, text: { en: 'Put little time and effort into my work.', ca: 'Put little time and effort into my work.' },
    domain: 'discipline', facet: 'quest', reverse: true },

  // Will (Self-Discipline)
  { id: 57, text: { en: 'Get started on things right away.', ca: 'Get started on things right away.' },
    domain: 'discipline', facet: 'will', reverse: false },
  { id: 58, text: { en: 'Have difficulty starting tasks.', ca: 'Have difficulty starting tasks.' },
    domain: 'discipline', facet: 'will', reverse: true },

  // Counsel (Deliberation)
  { id: 59, text: { en: 'Think before I speak.', ca: 'Think before I speak.' },
    domain: 'discipline', facet: 'counsel', reverse: false },
  { id: 60, text: { en: 'Make hasty decisions.', ca: 'Make hasty decisions.' },
    domain: 'discipline', facet: 'counsel', reverse: true },
]

export const WC_SCALE_LABELS = {
  1: 'Disagree strongly',
  2: 'Disagree a little',
  3: 'Neither agree nor disagree',
  4: 'Agree a little',
  5: 'Agree strongly',
}

export const WC_DOMAIN_META = {
  presence:   { ...DOMAINS.presence,   facets: ['hearth', 'gather', 'command', 'drive', 'thrill', 'radiance'] },
  bond:       { ...DOMAINS.bond,       facets: ['faith', 'edge', 'gift', 'yield', 'shadow', 'shield'] },
  discipline: { ...DOMAINS.discipline, facets: ['mastery', 'structure', 'oath', 'quest', 'will', 'counsel'] },
  depth:      { ...DOMAINS.depth,      facets: ['vigil', 'blaze', 'hollow', 'veil', 'surge', 'fracture'] },
  vision:     { ...DOMAINS.vision,     facets: ['dream', 'craft', 'resonance', 'drift', 'prism', 'compass'] },
}

export const WC_FACET_META = {
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
