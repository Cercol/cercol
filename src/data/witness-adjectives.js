/**
 * Witness Cèrcol — AB5C lexical adjective corpus.
 * 100 adjectives, 20 per OCEAN factor, 10 positive (+1) and 10 negative (−1) valence.
 * Derived from public-domain IPIP lexical markers (Goldberg; ipip.ori.org).
 *
 * Mapping to Cèrcol domain names:
 *   E → presence    A → bond    C → discipline    N → depth    O → vision
 *
 * ID format: {factor}{sign}{nn}  e.g. E+01, E-01, N+03
 *   factor: E | A | C | N | O
 *   sign:   + (high on factor) | - (low on factor)
 *   nn:     01–10
 *
 * Round polarity convention:
 *   Positive pole: E+, A+, C+, N−, O+  (high E/A/C/O, low N)
 *   Negative pole: E−, A−, C−, N+, O−  (low E/A/C/O, high N)
 *
 * tip: short explanatory phrase shown on hover in the instrument.
 */

export const WITNESS_ADJECTIVES = [
  // ── E / Presence — positive (high extraversion) ───────────────────────────
  { id: 'E+01', en: 'outgoing',      ca: 'obert',         factor: 'E', valence: +1, tip: { en: 'Enjoys being around people and seeks social interaction.', ca: 'Gaudeix de la companyia dels altres i busca interaccions socials.' } },
  { id: 'E+02', en: 'talkative',     ca: 'comunicatiu',   factor: 'E', valence: +1, tip: { en: 'Speaks freely and initiates conversations easily.', ca: 'Parla amb fluïdesa i inicia converses fàcilment.' } },
  { id: 'E+03', en: 'assertive',     ca: 'assertiu',      factor: 'E', valence: +1, tip: { en: 'States opinions clearly and takes the lead.', ca: 'Expressa les opinions clarament i pren la iniciativa.' } },
  { id: 'E+04', en: 'enthusiastic',  ca: 'entusiasta',    factor: 'E', valence: +1, tip: { en: 'Brings energy and excitement to situations.', ca: 'Aporta energia i entusiasme a les situacions.' } },
  { id: 'E+05', en: 'sociable',      ca: 'sociable',      factor: 'E', valence: +1, tip: { en: 'Comfortable and at ease in group settings.', ca: 'Se sent còmode i a gust en entorns de grup.' } },
  { id: 'E+06', en: 'lively',        ca: 'animat',        factor: 'E', valence: +1, tip: { en: 'Full of energy and high spirits.', ca: 'Ple d\'energia i bon humor.' } },
  { id: 'E+07', en: 'expressive',    ca: 'expressiu',     factor: 'E', valence: +1, tip: { en: 'Shows feelings and thoughts openly.', ca: 'Mostra sentiments i pensaments obertament.' } },
  { id: 'E+08', en: 'bold',          ca: 'audaç',         factor: 'E', valence: +1, tip: { en: 'Takes initiative without hesitation.', ca: 'Pren la iniciativa sense dubtar.' } },
  { id: 'E+09', en: 'energetic',     ca: 'enèrgic',       factor: 'E', valence: +1, tip: { en: 'Maintains high activity levels throughout the day.', ca: 'Manté un alt nivell d\'activitat durant el dia.' } },
  { id: 'E+10', en: 'gregarious',    ca: 'gregari',       factor: 'E', valence: +1, tip: { en: 'Thrives in the company of others.', ca: 'Floreix en la companyia dels altres.' } },

  // ── E / Presence — negative (low extraversion) ────────────────────────────
  { id: 'E-01', en: 'reserved',      ca: 'reservat',      factor: 'E', valence: -1, tip: { en: 'Keeps thoughts and feelings private.', ca: 'Guarda pensaments i sentiments per a si mateix.' } },
  { id: 'E-02', en: 'quiet',         ca: 'callat',        factor: 'E', valence: -1, tip: { en: 'Prefers listening over speaking.', ca: 'Prefereix escoltar a parlar.' } },
  { id: 'E-03', en: 'withdrawn',     ca: 'retraït',       factor: 'E', valence: -1, tip: { en: 'Tends to pull back from social situations.', ca: 'Tendeix a retirar-se de les situacions socials.' } },
  { id: 'E-04', en: 'shy',           ca: 'tímid',         factor: 'E', valence: -1, tip: { en: 'Feels uneasy in unfamiliar social settings.', ca: 'Se sent incòmode en entorns socials desconeguts.' } },
  { id: 'E-05', en: 'reflective',    ca: 'reflexiu',      factor: 'E', valence: -1, tip: { en: 'Prefers to think before acting or speaking.', ca: 'Prefereix pensar abans d\'actuar o parlar.' } },
  { id: 'E-06', en: 'solitary',      ca: 'solitari',      factor: 'E', valence: -1, tip: { en: 'Prefers spending time alone.', ca: 'Prefereix passar temps sol.' } },
  { id: 'E-07', en: 'private',       ca: 'discret',       factor: 'E', valence: -1, tip: { en: 'Does not share personal information easily.', ca: 'No comparteix informació personal fàcilment.' } },
  { id: 'E-08', en: 'subdued',       ca: 'contingut',     factor: 'E', valence: -1, tip: { en: 'Low-key and restrained in manner.', ca: 'Discret i contingut en la manera de ser.' } },
  { id: 'E-09', en: 'reticent',      ca: 'reticent',      factor: 'E', valence: -1, tip: { en: 'Reluctant to share views or feelings openly.', ca: 'Poc disposat a compartir opinions o sentiments obertament.' } },
  { id: 'E-10', en: 'contemplative', ca: 'contemplatiu',  factor: 'E', valence: -1, tip: { en: 'Spends time in quiet thought and reflection.', ca: 'Dedica temps al pensament tranquil i a la reflexió.' } },

  // ── A / Bond — positive (high agreeableness) ──────────────────────────────
  { id: 'A+01', en: 'warm',          ca: 'càlid',         factor: 'A', valence: +1, tip: { en: 'Shows genuine care and friendliness toward others.', ca: 'Mostra cura genuïna i simpatia cap als altres.' } },
  { id: 'A+02', en: 'caring',        ca: 'atent',         factor: 'A', valence: +1, tip: { en: 'Attentive to the needs and well-being of others.', ca: 'Atent a les necessitats i al benestar dels altres.' } },
  { id: 'A+03', en: 'generous',      ca: 'generós',       factor: 'A', valence: +1, tip: { en: 'Freely gives time, help or resources to others.', ca: 'Dóna lliurement temps, ajuda o recursos als altres.' } },
  { id: 'A+04', en: 'cooperative',   ca: 'cooperatiu',    factor: 'A', valence: +1, tip: { en: 'Works well with others toward shared goals.', ca: 'Treballa bé amb els altres per assolir objectius comuns.' } },
  { id: 'A+05', en: 'trusting',      ca: 'confiat',       factor: 'A', valence: +1, tip: { en: 'Willing to rely on and believe in others.', ca: 'Disposat a confiar i creure en els altres.' } },
  { id: 'A+06', en: 'empathetic',    ca: 'empàtic',       factor: 'A', valence: +1, tip: { en: 'Understands and shares the feelings of others.', ca: 'Comprèn i comparteix els sentiments dels altres.' } },
  { id: 'A+07', en: 'supportive',    ca: 'solidari',      factor: 'A', valence: +1, tip: { en: 'Stands by others and encourages them.', ca: 'Dóna suport als altres i els encoratja.' } },
  { id: 'A+08', en: 'compassionate', ca: 'compassiu',     factor: 'A', valence: +1, tip: { en: "Shows deep concern for others' suffering.", ca: 'Mostra una profunda preocupació pel sofriment dels altres.' } },
  { id: 'A+09', en: 'considerate',   ca: 'considerador',  factor: 'A', valence: +1, tip: { en: 'Thinks carefully about how actions affect others.', ca: 'Pensa amb cura en com les accions afecten els altres.' } },
  { id: 'A+10', en: 'kind',          ca: 'amable',        factor: 'A', valence: +1, tip: { en: 'Acts gently and pleasantly toward others.', ca: 'Actua amb gentilesa i agradablement amb els altres.' } },

  // ── A / Bond — negative (low agreeableness) ───────────────────────────────
  { id: 'A-01', en: 'critical',      ca: 'crític',        factor: 'A', valence: -1, tip: { en: 'Points out faults and shortcomings readily.', ca: 'Assenyala defectes i mancances fàcilment.' } },
  { id: 'A-02', en: 'competitive',   ca: 'competitiu',    factor: 'A', valence: -1, tip: { en: 'Driven to outperform and win against others.', ca: 'Motivat a superar i guanyar als altres.' } },
  { id: 'A-03', en: 'stubborn',      ca: 'tossut',        factor: 'A', valence: -1, tip: { en: 'Holds firmly to positions despite opposition.', ca: 'Manté fermament les seves posicions malgrat l\'oposició.' } },
  { id: 'A-04', en: 'demanding',     ca: 'exigent',       factor: 'A', valence: -1, tip: { en: 'Expects high standards from others.', ca: 'Exigeix alts estàndards dels altres.' } },
  { id: 'A-05', en: 'argumentative', ca: 'argumentatiu',  factor: 'A', valence: -1, tip: { en: 'Enjoys debate and tends toward disagreement.', ca: 'Gaudeix del debat i tendeix al desacord.' } },
  { id: 'A-06', en: 'skeptical',     ca: 'escèptic',      factor: 'A', valence: -1, tip: { en: 'Questions motives and does not take things at face value.', ca: 'Qüestiona les motivacions i no es fia fàcilment de les aparences.' } },
  { id: 'A-07', en: 'blunt',         ca: 'directe',       factor: 'A', valence: -1, tip: { en: 'Speaks directly without softening the message.', ca: 'Parla directament sense suavitzar el missatge.' } },
  { id: 'A-08', en: 'detached',      ca: 'distanciat',    factor: 'A', valence: -1, tip: { en: 'Keeps emotional distance in relationships.', ca: 'Manté distància emocional en les relacions.' } },
  { id: 'A-09', en: 'independent',   ca: 'independent',   factor: 'A', valence: -1, tip: { en: 'Prefers to act alone rather than relying on others.', ca: 'Prefereix actuar sol que dependre dels altres.' } },
  { id: 'A-10', en: 'challenging',   ca: 'desafiant',     factor: 'A', valence: -1, tip: { en: 'Pushes others and questions assumptions.', ca: 'Exigeix als altres i qüestiona les assumpcions.' } },

  // ── C / Discipline — positive (high conscientiousness) ────────────────────
  { id: 'C+01', en: 'organized',     ca: 'organitzat',    factor: 'C', valence: +1, tip: { en: 'Keeps things structured and in order.', ca: 'Manté les coses estructurades i en ordre.' } },
  { id: 'C+02', en: 'diligent',      ca: 'diligent',      factor: 'C', valence: +1, tip: { en: 'Works hard and with sustained effort.', ca: 'Treballa dur i amb esforç sostingut.' } },
  { id: 'C+03', en: 'reliable',      ca: 'fiable',        factor: 'C', valence: +1, tip: { en: 'Can be counted on to do what is expected.', ca: 'Es pot comptar amb ell per fer allò que s\'espera.' } },
  { id: 'C+04', en: 'thorough',      ca: 'exhaustiu',     factor: 'C', valence: +1, tip: { en: 'Pays attention to detail and completes tasks fully.', ca: 'Para atenció als detalls i completa les tasques completament.' } },
  { id: 'C+05', en: 'structured',    ca: 'estructurat',   factor: 'C', valence: +1, tip: { en: 'Follows clear routines and plans.', ca: 'Segueix rutines i plans clars.' } },
  { id: 'C+06', en: 'focused',       ca: 'enfocat',       factor: 'C', valence: +1, tip: { en: 'Stays on task and avoids distraction.', ca: 'Es manté en la tasca i evita les distraccions.' } },
  { id: 'C+07', en: 'methodical',    ca: 'metòdic',       factor: 'C', valence: +1, tip: { en: 'Approaches tasks in a step-by-step, systematic way.', ca: 'Aborda les tasques de manera sistemàtica, pas a pas.' } },
  { id: 'C+08', en: 'responsible',   ca: 'responsable',   factor: 'C', valence: +1, tip: { en: 'Takes ownership of duties and follows through.', ca: 'Assumeix les seves responsabilitats i les compleix.' } },
  { id: 'C+09', en: 'persistent',    ca: 'persistent',    factor: 'C', valence: +1, tip: { en: 'Keeps going despite obstacles or setbacks.', ca: 'Continua endavant malgrat els obstacles o contratemps.' } },
  { id: 'C+10', en: 'precise',       ca: 'precís',        factor: 'C', valence: +1, tip: { en: 'Strives for accuracy in everything done.', ca: 'Busca la precisió en tot allò que fa.' } },

  // ── C / Discipline — negative (low conscientiousness) ────────────────────
  { id: 'C-01', en: 'impulsive',     ca: 'impulsiu',      factor: 'C', valence: -1, tip: { en: 'Acts quickly without pausing to think.', ca: 'Actua ràpidament sense aturar-se a pensar.' } },
  { id: 'C-02', en: 'scattered',     ca: 'dispersat',     factor: 'C', valence: -1, tip: { en: 'Has difficulty maintaining focus or order.', ca: 'Té dificultats per mantenir el focus o l\'ordre.' } },
  { id: 'C-03', en: 'careless',      ca: 'descurat',      factor: 'C', valence: -1, tip: { en: 'Pays little attention to quality or detail.', ca: 'Para poca atenció a la qualitat o als detalls.' } },
  { id: 'C-04', en: 'disorganized',  ca: 'desorganitzat', factor: 'C', valence: -1, tip: { en: 'Struggles to keep things in a clear structure.', ca: 'Li costa mantenir les coses en una estructura clara.' } },
  { id: 'C-05', en: 'spontaneous',   ca: 'espontani',     factor: 'C', valence: -1, tip: { en: 'Prefers to act on instinct rather than plans.', ca: 'Prefereix actuar per instint que seguir plans.' } },
  { id: 'C-06', en: 'flexible',      ca: 'flexible',      factor: 'C', valence: -1, tip: { en: 'Adjusts easily and avoids rigid routines.', ca: 'S\'adapta fàcilment i evita les rutines rígides.' } },
  { id: 'C-07', en: 'casual',        ca: 'casual',        factor: 'C', valence: -1, tip: { en: 'Relaxed and easygoing about tasks and commitments.', ca: 'Relaxat i despreocupat amb les tasques i compromisos.' } },
  { id: 'C-08', en: 'carefree',      ca: 'despreocupat',  factor: 'C', valence: -1, tip: { en: 'Unworried about order or outcomes.', ca: 'Despreocupat per l\'ordre o els resultats.' } },
  { id: 'C-09', en: 'informal',      ca: 'informal',      factor: 'C', valence: -1, tip: { en: 'Relaxed and unstructured in approach.', ca: 'Relaxat i sense estructura en l\'enfocament.' } },
  { id: 'C-10', en: 'adaptable',     ca: 'adaptable',     factor: 'C', valence: -1, tip: { en: 'Comfortable changing course or shifting priorities.', ca: 'Còmode canviant de rumb o de prioritats.' } },

  // ── N / Depth — positive (high neuroticism) ───────────────────────────────
  { id: 'N+01', en: 'anxious',       ca: 'ansiós',        factor: 'N', valence: +1, tip: { en: 'Prone to worry and nervous tension.', ca: 'Propens a la preocupació i la tensió nerviosa.' } },
  { id: 'N+02', en: 'sensitive',     ca: 'sensible',      factor: 'N', valence: +1, tip: { en: 'Deeply affected by emotional experiences and feedback.', ca: 'Profundament afectat per les experiències emocionals i el retorn dels altres.' } },
  { id: 'N+03', en: 'worried',       ca: 'preocupat',     factor: 'N', valence: +1, tip: { en: 'Tends to anticipate problems and feel concerned.', ca: 'Tendeix a anticipar problemes i a sentir-se preocupat.' } },
  { id: 'N+04', en: 'reactive',      ca: 'reactiu',       factor: 'N', valence: +1, tip: { en: 'Responds strongly to stressful or frustrating situations.', ca: 'Respon amb intensitat a situacions d\'estrès o frustració.' } },
  { id: 'N+05', en: 'emotional',     ca: 'emocional',     factor: 'N', valence: +1, tip: { en: 'Experiences and expresses emotions intensely.', ca: 'Experimenta i expressa les emocions amb intensitat.' } },
  { id: 'N+06', en: 'tense',         ca: 'tens',          factor: 'N', valence: +1, tip: { en: 'Often feels wound up or under pressure.', ca: 'Sovint se sent tens o sota pressió.' } },
  { id: 'N+07', en: 'vigilant',      ca: 'vigilant',      factor: 'N', valence: +1, tip: { en: 'Alert to potential threats or problems.', ca: 'Alert davant possibles amenaces o problemes.' } },
  { id: 'N+08', en: 'intense',       ca: 'intens',        factor: 'N', valence: +1, tip: { en: 'Experiences everything with great depth and feeling.', ca: 'Experimenta tot amb gran profunditat i intensitat.' } },
  { id: 'N+09', en: 'restless',      ca: 'inquiet',       factor: 'N', valence: +1, tip: { en: 'Finds it hard to settle and seeks change.', ca: 'Li costa establir-se i busca el canvi.' } },
  { id: 'N+10', en: 'troubled',      ca: 'pertorbat',     factor: 'N', valence: +1, tip: { en: 'Easily unsettled by difficulties or uncertainty.', ca: 'Fàcilment pertorbat per les dificultats o la incertesa.' } },

  // ── N / Depth — negative (low neuroticism) ────────────────────────────────
  { id: 'N-01', en: 'stable',        ca: 'estable',       factor: 'N', valence: -1, tip: { en: 'Maintains emotional equilibrium through highs and lows.', ca: 'Manté l\'equilibri emocional en els moments bons i dolents.' } },
  { id: 'N-02', en: 'composed',      ca: 'serè',          factor: 'N', valence: -1, tip: { en: 'Remains calm and collected under pressure.', ca: 'Es manté tranquil i serè sota pressió.' } },
  { id: 'N-03', en: 'resilient',     ca: 'resilient',     factor: 'N', valence: -1, tip: { en: 'Bounces back quickly after setbacks.', ca: 'Es recupera ràpidament dels contratemps.' } },
  { id: 'N-04', en: 'grounded',      ca: 'arrelat',       factor: 'N', valence: -1, tip: { en: 'Stays connected to reality and inner steadiness.', ca: 'Es manté connectat a la realitat i a la serenitat interior.' } },
  { id: 'N-05', en: 'unflappable',   ca: 'impertorbable', factor: 'N', valence: -1, tip: { en: 'Rarely rattled or thrown off balance.', ca: 'Rarament es desequilibra o es desborda.' } },
  { id: 'N-06', en: 'secure',        ca: 'segur',         factor: 'N', valence: -1, tip: { en: "Has a stable sense of self and isn't easily threatened.", ca: "Té un sentit estable d'un mateix i no es deixa amenaçar fàcilment." } },
  { id: 'N-07', en: 'steady',        ca: 'ferm',          factor: 'N', valence: -1, tip: { en: 'Consistent and dependable in mood and behaviour.', ca: 'Consistent i fiable en l\'humor i el comportament.' } },
  { id: 'N-08', en: 'serene',        ca: 'tranquil',      factor: 'N', valence: -1, tip: { en: 'Radiates calmness and inner peace.', ca: 'Irradia calma i pau interior.' } },
  { id: 'N-09', en: 'patient',       ca: 'pacient',       factor: 'N', valence: -1, tip: { en: 'Tolerates delays or difficulty without agitation.', ca: 'Tolera els retards o les dificultats sense agitar-se.' } },
  { id: 'N-10', en: 'levelheaded',   ca: 'equilibrat',    factor: 'N', valence: -1, tip: { en: 'Makes clear judgements even under stress.', ca: 'Pren decisions clares fins i tot sota estrès.' } },

  // ── O / Vision — positive (high openness) ─────────────────────────────────
  { id: 'O+01', en: 'creative',       ca: 'creatiu',       factor: 'O', valence: +1, tip: { en: 'Generates original ideas and new approaches.', ca: 'Genera idees originals i nous enfocaments.' } },
  { id: 'O+02', en: 'imaginative',    ca: 'imaginatiu',    factor: 'O', valence: +1, tip: { en: 'Envisions possibilities beyond what currently exists.', ca: 'Imagina possibilitats més enllà del que existeix ara.' } },
  { id: 'O+03', en: 'curious',        ca: 'curiós',        factor: 'O', valence: +1, tip: { en: 'Eager to learn and explore new areas.', ca: 'Àvid d\'aprendre i d\'explorar nous àmbits.' } },
  { id: 'O+04', en: 'inventive',      ca: 'inventiu',      factor: 'O', valence: +1, tip: { en: 'Finds unexpected solutions to problems.', ca: 'Troba solucions inesperades als problemes.' } },
  { id: 'O+05', en: 'original',       ca: 'original',      factor: 'O', valence: +1, tip: { en: 'Brings fresh and distinctive perspectives.', ca: 'Aporta perspectives fresques i diferenciades.' } },
  { id: 'O+06', en: 'visionary',      ca: 'visionari',     factor: 'O', valence: +1, tip: { en: 'Sees long-term possibilities and shapes the future.', ca: 'Veu possibilitats a llarg termini i defineix el futur.' } },
  { id: 'O+07', en: 'artistic',       ca: 'artístic',      factor: 'O', valence: +1, tip: { en: 'Has a strong aesthetic sense and love of expression.', ca: 'Té un fort sentit estètic i amor per l\'expressió.' } },
  { id: 'O+08', en: 'innovative',     ca: 'innovador',     factor: 'O', valence: +1, tip: { en: 'Drives change and introduces new ways of doing things.', ca: 'Impulsa el canvi i introdueix noves maneres de fer les coses.' } },
  { id: 'O+09', en: 'perceptive',     ca: 'perspicaç',     factor: 'O', valence: +1, tip: { en: 'Notices subtle details and patterns others miss.', ca: 'Para atenció a detalls i patrons subtils que els altres perden.' } },
  { id: 'O+10', en: 'unconventional', ca: 'heterodox',     factor: 'O', valence: +1, tip: { en: 'Challenges norms and follows an unusual path.', ca: 'Desafia les normes i segueix un camí poc convencional.' } },

  // ── O / Vision — negative (low openness) ──────────────────────────────────
  { id: 'O-01', en: 'practical',      ca: 'pràctic',       factor: 'O', valence: -1, tip: { en: 'Focuses on what works in the real world.', ca: 'Se centra en allò que funciona al món real.' } },
  { id: 'O-02', en: 'conventional',   ca: 'convencional',  factor: 'O', valence: -1, tip: { en: 'Follows established methods and traditions.', ca: 'Segueix mètodes i tradicions establerts.' } },
  { id: 'O-03', en: 'realistic',      ca: 'realista',      factor: 'O', valence: -1, tip: { en: 'Grounded in facts and avoids idealism.', ca: 'Arrelat als fets i evita l\'idealisme.' } },
  { id: 'O-04', en: 'traditional',    ca: 'tradicional',   factor: 'O', valence: -1, tip: { en: 'Values time-tested approaches and customs.', ca: 'Valora els enfocaments i costums provats pel temps.' } },
  { id: 'O-05', en: 'pragmatic',      ca: 'pragmàtic',     factor: 'O', valence: -1, tip: { en: 'Driven by results rather than theory.', ca: 'Motivat pels resultats més que per la teoria.' } },
  { id: 'O-06', en: 'straightforward',ca: 'directe',       factor: 'O', valence: -1, tip: { en: 'Prefers direct, uncomplicated approaches.', ca: 'Prefereix enfocaments directes i senzills.' } },
  { id: 'O-07', en: 'concrete',       ca: 'concret',       factor: 'O', valence: -1, tip: { en: 'Thinks in terms of specific facts and tangible outcomes.', ca: 'Pensa en termes de fets específics i resultats tangibles.' } },
  { id: 'O-08', en: 'conservative',   ca: 'conservador',   factor: 'O', valence: -1, tip: { en: 'Cautious about change, prefers proven ways.', ca: 'Prudent amb el canvi, prefereix les maneres provades.' } },
  { id: 'O-09', en: 'routine',        ca: 'rutinari',      factor: 'O', valence: -1, tip: { en: 'Comfortable with repetition and familiar patterns.', ca: 'Còmode amb la repetició i els patrons familiars.' } },
  { id: 'O-10', en: 'predictable',    ca: 'previsible',    factor: 'O', valence: -1, tip: { en: 'Acts consistently in ways others can anticipate.', ca: 'Actua de manera consistent i previsible per als altres.' } },
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
