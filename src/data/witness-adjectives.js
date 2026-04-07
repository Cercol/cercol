/**
 * Witness Cèrcol — AB5C lexical adjective corpus.
 * 100 adjectives, 20 per OCEAN factor, 10 positive (+1) and 10 negative (−1) valence.
 * Derived from public-domain IPIP lexical markers (Goldberg; ipip.ori.org).
 *
 * Mapping to Cèrcol domain names:
 *   E → presence    A → bond    C → discipline    N → depth    O → vision
 *
 * factor:  'E' | 'A' | 'C' | 'N' | 'O'
 * valence: +1  (high on factor) | -1 (low on factor)
 */

export const WITNESS_ADJECTIVES = [
  // ── E / Presence ──────────────────────────────────────────────────────────
  { id: 'w001', en: 'outgoing',      ca: 'obert',         factor: 'E', valence: +1 },
  { id: 'w002', en: 'talkative',     ca: 'comunicatiu',   factor: 'E', valence: +1 },
  { id: 'w003', en: 'assertive',     ca: 'assertiu',      factor: 'E', valence: +1 },
  { id: 'w004', en: 'enthusiastic',  ca: 'entusiasta',    factor: 'E', valence: +1 },
  { id: 'w005', en: 'sociable',      ca: 'sociable',      factor: 'E', valence: +1 },
  { id: 'w006', en: 'lively',        ca: 'animat',        factor: 'E', valence: +1 },
  { id: 'w007', en: 'expressive',    ca: 'expressiu',     factor: 'E', valence: +1 },
  { id: 'w008', en: 'bold',          ca: 'audaç',         factor: 'E', valence: +1 },
  { id: 'w009', en: 'energetic',     ca: 'enèrgic',       factor: 'E', valence: +1 },
  { id: 'w010', en: 'gregarious',    ca: 'gregari',       factor: 'E', valence: +1 },
  { id: 'w011', en: 'reserved',      ca: 'reservat',      factor: 'E', valence: -1 },
  { id: 'w012', en: 'quiet',         ca: 'callat',        factor: 'E', valence: -1 },
  { id: 'w013', en: 'withdrawn',     ca: 'retraït',       factor: 'E', valence: -1 },
  { id: 'w014', en: 'shy',           ca: 'tímid',         factor: 'E', valence: -1 },
  { id: 'w015', en: 'reflective',    ca: 'reflexiu',      factor: 'E', valence: -1 },
  { id: 'w016', en: 'solitary',      ca: 'solitari',      factor: 'E', valence: -1 },
  { id: 'w017', en: 'private',       ca: 'discret',       factor: 'E', valence: -1 },
  { id: 'w018', en: 'subdued',       ca: 'contingut',     factor: 'E', valence: -1 },
  { id: 'w019', en: 'reticent',      ca: 'reticent',      factor: 'E', valence: -1 },
  { id: 'w020', en: 'contemplative', ca: 'contemplatiu',  factor: 'E', valence: -1 },

  // ── A / Bond ──────────────────────────────────────────────────────────────
  { id: 'w021', en: 'warm',          ca: 'càlid',         factor: 'A', valence: +1 },
  { id: 'w022', en: 'caring',        ca: 'atent',         factor: 'A', valence: +1 },
  { id: 'w023', en: 'generous',      ca: 'generós',       factor: 'A', valence: +1 },
  { id: 'w024', en: 'cooperative',   ca: 'cooperatiu',    factor: 'A', valence: +1 },
  { id: 'w025', en: 'trusting',      ca: 'confiat',       factor: 'A', valence: +1 },
  { id: 'w026', en: 'empathetic',    ca: 'empàtic',       factor: 'A', valence: +1 },
  { id: 'w027', en: 'supportive',    ca: 'solidari',      factor: 'A', valence: +1 },
  { id: 'w028', en: 'compassionate', ca: 'compassiu',     factor: 'A', valence: +1 },
  { id: 'w029', en: 'considerate',   ca: 'considerador',  factor: 'A', valence: +1 },
  { id: 'w030', en: 'kind',          ca: 'amable',        factor: 'A', valence: +1 },
  { id: 'w031', en: 'critical',      ca: 'crític',        factor: 'A', valence: -1 },
  { id: 'w032', en: 'competitive',   ca: 'competitiu',    factor: 'A', valence: -1 },
  { id: 'w033', en: 'stubborn',      ca: 'tossut',        factor: 'A', valence: -1 },
  { id: 'w034', en: 'demanding',     ca: 'exigent',       factor: 'A', valence: -1 },
  { id: 'w035', en: 'argumentative', ca: 'argumentatiu',  factor: 'A', valence: -1 },
  { id: 'w036', en: 'skeptical',     ca: 'escèptic',      factor: 'A', valence: -1 },
  { id: 'w037', en: 'blunt',         ca: 'directe',       factor: 'A', valence: -1 },
  { id: 'w038', en: 'detached',      ca: 'distanciat',    factor: 'A', valence: -1 },
  { id: 'w039', en: 'independent',   ca: 'independent',   factor: 'A', valence: -1 },
  { id: 'w040', en: 'challenging',   ca: 'desafiant',     factor: 'A', valence: -1 },

  // ── C / Discipline ────────────────────────────────────────────────────────
  { id: 'w041', en: 'organized',     ca: 'organitzat',    factor: 'C', valence: +1 },
  { id: 'w042', en: 'diligent',      ca: 'diligent',      factor: 'C', valence: +1 },
  { id: 'w043', en: 'reliable',      ca: 'fiable',        factor: 'C', valence: +1 },
  { id: 'w044', en: 'thorough',      ca: 'exhaustiu',     factor: 'C', valence: +1 },
  { id: 'w045', en: 'structured',    ca: 'estructurat',   factor: 'C', valence: +1 },
  { id: 'w046', en: 'focused',       ca: 'enfocat',       factor: 'C', valence: +1 },
  { id: 'w047', en: 'methodical',    ca: 'metòdic',       factor: 'C', valence: +1 },
  { id: 'w048', en: 'responsible',   ca: 'responsable',   factor: 'C', valence: +1 },
  { id: 'w049', en: 'persistent',    ca: 'persistent',    factor: 'C', valence: +1 },
  { id: 'w050', en: 'precise',       ca: 'precís',        factor: 'C', valence: +1 },
  { id: 'w051', en: 'impulsive',     ca: 'impulsiu',      factor: 'C', valence: -1 },
  { id: 'w052', en: 'scattered',     ca: 'dispersat',     factor: 'C', valence: -1 },
  { id: 'w053', en: 'careless',      ca: 'descurat',      factor: 'C', valence: -1 },
  { id: 'w054', en: 'disorganized',  ca: 'desorganitzat', factor: 'C', valence: -1 },
  { id: 'w055', en: 'spontaneous',   ca: 'espontani',     factor: 'C', valence: -1 },
  { id: 'w056', en: 'flexible',      ca: 'flexible',      factor: 'C', valence: -1 },
  { id: 'w057', en: 'casual',        ca: 'casual',        factor: 'C', valence: -1 },
  { id: 'w058', en: 'carefree',      ca: 'despreocupat',  factor: 'C', valence: -1 },
  { id: 'w059', en: 'informal',      ca: 'informal',      factor: 'C', valence: -1 },
  { id: 'w060', en: 'adaptable',     ca: 'adaptable',     factor: 'C', valence: -1 },

  // ── N / Depth ─────────────────────────────────────────────────────────────
  { id: 'w061', en: 'anxious',       ca: 'ansiós',        factor: 'N', valence: +1 },
  { id: 'w062', en: 'sensitive',     ca: 'sensible',      factor: 'N', valence: +1 },
  { id: 'w063', en: 'worried',       ca: 'preocupat',     factor: 'N', valence: +1 },
  { id: 'w064', en: 'reactive',      ca: 'reactiu',       factor: 'N', valence: +1 },
  { id: 'w065', en: 'emotional',     ca: 'emocional',     factor: 'N', valence: +1 },
  { id: 'w066', en: 'tense',         ca: 'tens',          factor: 'N', valence: +1 },
  { id: 'w067', en: 'vigilant',      ca: 'vigilant',      factor: 'N', valence: +1 },
  { id: 'w068', en: 'intense',       ca: 'intens',        factor: 'N', valence: +1 },
  { id: 'w069', en: 'restless',      ca: 'inquiet',       factor: 'N', valence: +1 },
  { id: 'w070', en: 'troubled',      ca: 'pertorbat',     factor: 'N', valence: +1 },
  { id: 'w071', en: 'stable',        ca: 'estable',       factor: 'N', valence: -1 },
  { id: 'w072', en: 'composed',      ca: 'serè',          factor: 'N', valence: -1 },
  { id: 'w073', en: 'resilient',     ca: 'resilient',     factor: 'N', valence: -1 },
  { id: 'w074', en: 'grounded',      ca: 'arrelat',       factor: 'N', valence: -1 },
  { id: 'w075', en: 'unflappable',   ca: 'impertorbable', factor: 'N', valence: -1 },
  { id: 'w076', en: 'secure',        ca: 'segur',         factor: 'N', valence: -1 },
  { id: 'w077', en: 'steady',        ca: 'ferm',          factor: 'N', valence: -1 },
  { id: 'w078', en: 'serene',        ca: 'tranquil',      factor: 'N', valence: -1 },
  { id: 'w079', en: 'patient',       ca: 'pacient',       factor: 'N', valence: -1 },
  { id: 'w080', en: 'levelheaded',   ca: 'equilibrat',    factor: 'N', valence: -1 },

  // ── O / Vision ────────────────────────────────────────────────────────────
  { id: 'w081', en: 'creative',       ca: 'creatiu',       factor: 'O', valence: +1 },
  { id: 'w082', en: 'imaginative',    ca: 'imaginatiu',    factor: 'O', valence: +1 },
  { id: 'w083', en: 'curious',        ca: 'curiós',        factor: 'O', valence: +1 },
  { id: 'w084', en: 'inventive',      ca: 'inventiu',      factor: 'O', valence: +1 },
  { id: 'w085', en: 'original',       ca: 'original',      factor: 'O', valence: +1 },
  { id: 'w086', en: 'visionary',      ca: 'visionari',     factor: 'O', valence: +1 },
  { id: 'w087', en: 'artistic',       ca: 'artístic',      factor: 'O', valence: +1 },
  { id: 'w088', en: 'innovative',     ca: 'innovador',     factor: 'O', valence: +1 },
  { id: 'w089', en: 'perceptive',     ca: 'perspicaç',     factor: 'O', valence: +1 },
  { id: 'w090', en: 'unconventional', ca: 'heterodox',     factor: 'O', valence: +1 },
  { id: 'w091', en: 'practical',      ca: 'pràctic',       factor: 'O', valence: -1 },
  { id: 'w092', en: 'conventional',   ca: 'convencional',  factor: 'O', valence: -1 },
  { id: 'w093', en: 'realistic',      ca: 'realista',      factor: 'O', valence: -1 },
  { id: 'w094', en: 'traditional',    ca: 'tradicional',   factor: 'O', valence: -1 },
  { id: 'w095', en: 'pragmatic',      ca: 'pragmàtic',     factor: 'O', valence: -1 },
  { id: 'w096', en: 'straightforward',ca: 'directe',       factor: 'O', valence: -1 },
  { id: 'w097', en: 'concrete',       ca: 'concret',       factor: 'O', valence: -1 },
  { id: 'w098', en: 'conservative',   ca: 'conservador',   factor: 'O', valence: -1 },
  { id: 'w099', en: 'routine',        ca: 'rutinari',      factor: 'O', valence: -1 },
  { id: 'w100', en: 'predictable',    ca: 'previsible',    factor: 'O', valence: -1 },
]

// Grouped by factor for efficient lookup
export const ADJECTIVES_BY_FACTOR = {
  E: WITNESS_ADJECTIVES.filter(a => a.factor === 'E'),
  A: WITNESS_ADJECTIVES.filter(a => a.factor === 'A'),
  C: WITNESS_ADJECTIVES.filter(a => a.factor === 'C'),
  N: WITNESS_ADJECTIVES.filter(a => a.factor === 'N'),
  O: WITNESS_ADJECTIVES.filter(a => a.factor === 'O'),
}

export const FACTOR_TO_DOMAIN = {
  E: 'presence',
  A: 'bond',
  C: 'discipline',
  N: 'depth',
  O: 'vision',
}

export const FACTORS = ['E', 'A', 'C', 'N', 'O']
