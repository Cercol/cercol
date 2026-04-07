/**
 * Cèrcol Full Moon — IPIP-NEO-120 self-report instrument
 *
 * Source: Johnson, J. A. (2014). Measuring thirty facets of the Five Factor
 * Model with a 120-item public domain inventory: Development of the
 * IPIP-NEO-120. Journal of Research in Personality, 51, 78-89.
 * doi:10.1016/j.jrp.2014.05.003
 *
 * Additional item pool source: Goldberg, L. R. et al. (2006).
 * The International Personality Item Pool and the future of public-domain
 * personality measures. Journal of Research in Personality, 40, 84-96.
 * https://ipip.ori.org
 *
 * 120 items · 5 domains · 30 facets · 4 items per facet
 * Scale: 1 (Disagree strongly) → 5 (Agree strongly)
 * Reverse items: score = 6 - rawValue
 *
 * All IPIP items are in the public domain with no restrictions on use.
 */

import { DOMAINS } from './domains'

export const FM_ITEMS = [

  // ── DEPTH (Neuroticism) ───────────────────────────────────────

  // Vigil (Anxiety)
  { id: 1,  text: { en: 'Worry about things.',              ca: 'Worry about things.'              }, domain: 'depth', facet: 'vigil',    reverse: false },
  { id: 2,  text: { en: 'Fear for the worst.',              ca: 'Fear for the worst.'              }, domain: 'depth', facet: 'vigil',    reverse: false },
  { id: 3,  text: { en: 'Am afraid of many things.',        ca: 'Am afraid of many things.'        }, domain: 'depth', facet: 'vigil',    reverse: false },
  { id: 4,  text: { en: "Don't worry about things.",        ca: "Don't worry about things."        }, domain: 'depth', facet: 'vigil',    reverse: true  },

  // Blaze (Angry Hostility)
  { id: 5,  text: { en: 'Get angry easily.',                ca: 'Get angry easily.'                }, domain: 'depth', facet: 'blaze',   reverse: false },
  { id: 6,  text: { en: 'Get irritated easily.',            ca: 'Get irritated easily.'            }, domain: 'depth', facet: 'blaze',   reverse: false },
  { id: 7,  text: { en: 'Lose my temper.',                  ca: 'Lose my temper.'                  }, domain: 'depth', facet: 'blaze',   reverse: false },
  { id: 8,  text: { en: 'Am not easily annoyed.',           ca: 'Am not easily annoyed.'           }, domain: 'depth', facet: 'blaze',   reverse: true  },

  // Hollow (Depression)
  { id: 9,  text: { en: 'Often feel blue.',                 ca: 'Often feel blue.'                 }, domain: 'depth', facet: 'hollow',  reverse: false },
  { id: 10, text: { en: 'Dislike myself.',                  ca: 'Dislike myself.'                  }, domain: 'depth', facet: 'hollow',  reverse: false },
  { id: 11, text: { en: 'Am often down in the dumps.',      ca: 'Am often down in the dumps.'      }, domain: 'depth', facet: 'hollow',  reverse: false },
  { id: 12, text: { en: 'Feel comfortable with myself.',    ca: 'Feel comfortable with myself.'    }, domain: 'depth', facet: 'hollow',  reverse: true  },

  // Veil (Self-Consciousness)
  { id: 13, text: { en: 'Am easily embarrassed.',           ca: 'Am easily embarrassed.'           }, domain: 'depth', facet: 'veil',    reverse: false },
  { id: 14, text: { en: 'Find it difficult to approach others.', ca: 'Find it difficult to approach others.' }, domain: 'depth', facet: 'veil', reverse: false },
  { id: 15, text: { en: 'Am afraid to draw attention to myself.', ca: 'Am afraid to draw attention to myself.' }, domain: 'depth', facet: 'veil', reverse: false },
  { id: 16, text: { en: 'Am comfortable in unfamiliar situations.', ca: 'Am comfortable in unfamiliar situations.' }, domain: 'depth', facet: 'veil', reverse: true },

  // Surge (Impulsiveness)
  { id: 17, text: { en: 'Act without thinking.',            ca: 'Act without thinking.'            }, domain: 'depth', facet: 'surge',   reverse: false },
  { id: 18, text: { en: 'Often eat too much.',              ca: 'Often eat too much.'              }, domain: 'depth', facet: 'surge',   reverse: false },
  { id: 19, text: { en: 'Say things without thinking.',     ca: 'Say things without thinking.'     }, domain: 'depth', facet: 'surge',   reverse: false },
  { id: 20, text: { en: 'Rarely overindulge.',              ca: 'Rarely overindulge.'              }, domain: 'depth', facet: 'surge',   reverse: true  },

  // Fracture (Vulnerability)
  { id: 21, text: { en: 'Panic easily.',                    ca: 'Panic easily.'                    }, domain: 'depth', facet: 'fracture', reverse: false },
  { id: 22, text: { en: "Feel that I'm unable to deal with things.", ca: "Feel that I'm unable to deal with things." }, domain: 'depth', facet: 'fracture', reverse: false },
  { id: 23, text: { en: 'Become overwhelmed by events.',    ca: 'Become overwhelmed by events.'    }, domain: 'depth', facet: 'fracture', reverse: false },
  { id: 24, text: { en: 'Remain calm under pressure.',      ca: 'Remain calm under pressure.'      }, domain: 'depth', facet: 'fracture', reverse: true  },

  // ── PRESENCE (Extraversion) ───────────────────────────────────

  // Hearth (Warmth)
  { id: 25, text: { en: 'Make friends easily.',             ca: 'Make friends easily.'             }, domain: 'presence', facet: 'hearth',   reverse: false },
  { id: 26, text: { en: 'Am hard to get to know.',          ca: 'Am hard to get to know.'          }, domain: 'presence', facet: 'hearth',   reverse: true  },
  { id: 27, text: { en: 'Warm up quickly to others.',       ca: 'Warm up quickly to others.'       }, domain: 'presence', facet: 'hearth',   reverse: false },
  { id: 28, text: { en: 'Am distant with people.',          ca: 'Am distant with people.'          }, domain: 'presence', facet: 'hearth',   reverse: true  },

  // Gather (Gregariousness)
  { id: 29, text: { en: 'Am the life of the party.',        ca: 'Am the life of the party.'        }, domain: 'presence', facet: 'gather',   reverse: false },
  { id: 30, text: { en: "Don't like to draw attention to myself.", ca: "Don't like to draw attention to myself." }, domain: 'presence', facet: 'gather', reverse: true },
  { id: 31, text: { en: 'Enjoy being part of a group.',     ca: 'Enjoy being part of a group.'     }, domain: 'presence', facet: 'gather',   reverse: false },
  { id: 32, text: { en: 'Prefer to be alone.',              ca: 'Prefer to be alone.'              }, domain: 'presence', facet: 'gather',   reverse: true  },

  // Command (Assertiveness)
  { id: 33, text: { en: 'Take charge.',                     ca: 'Take charge.'                     }, domain: 'presence', facet: 'command',  reverse: false },
  { id: 34, text: { en: 'Wait for others to lead the way.', ca: 'Wait for others to lead the way.' }, domain: 'presence', facet: 'command',  reverse: true  },
  { id: 35, text: { en: 'Try to lead others.',              ca: 'Try to lead others.'              }, domain: 'presence', facet: 'command',  reverse: false },
  { id: 36, text: { en: 'Let others make the decisions.',   ca: 'Let others make the decisions.'   }, domain: 'presence', facet: 'command',  reverse: true  },

  // Drive (Activity)
  { id: 37, text: { en: 'Am always busy.',                  ca: 'Am always busy.'                  }, domain: 'presence', facet: 'drive',    reverse: false },
  { id: 38, text: { en: 'Like to take it easy.',            ca: 'Like to take it easy.'            }, domain: 'presence', facet: 'drive',    reverse: true  },
  { id: 39, text: { en: 'Am always on the go.',             ca: 'Am always on the go.'             }, domain: 'presence', facet: 'drive',    reverse: false },
  { id: 40, text: { en: 'Do things at a leisurely pace.',   ca: 'Do things at a leisurely pace.'   }, domain: 'presence', facet: 'drive',    reverse: true  },

  // Thrill (Excitement-Seeking)
  { id: 41, text: { en: 'Love excitement.',                 ca: 'Love excitement.'                 }, domain: 'presence', facet: 'thrill',   reverse: false },
  { id: 42, text: { en: 'Prefer quiet, peaceful settings.', ca: 'Prefer quiet, peaceful settings.' }, domain: 'presence', facet: 'thrill',   reverse: true  },
  { id: 43, text: { en: 'Seek adventure.',                  ca: 'Seek adventure.'                  }, domain: 'presence', facet: 'thrill',   reverse: false },
  { id: 44, text: { en: 'Avoid dangerous situations.',      ca: 'Avoid dangerous situations.'      }, domain: 'presence', facet: 'thrill',   reverse: true  },

  // Radiance (Positive Emotions)
  { id: 45, text: { en: 'Radiate joy.',                     ca: 'Radiate joy.'                     }, domain: 'presence', facet: 'radiance', reverse: false },
  { id: 46, text: { en: 'Am not easily amused.',            ca: 'Am not easily amused.'            }, domain: 'presence', facet: 'radiance', reverse: true  },
  { id: 47, text: { en: 'Have a lot of fun.',               ca: 'Have a lot of fun.'               }, domain: 'presence', facet: 'radiance', reverse: false },
  { id: 48, text: { en: 'Seldom feel joyful.',              ca: 'Seldom feel joyful.'              }, domain: 'presence', facet: 'radiance', reverse: true  },

  // ── VISION (Openness) ─────────────────────────────────────────

  // Dream (Fantasy)
  { id: 49, text: { en: 'Have a vivid imagination.',        ca: 'Have a vivid imagination.'        }, domain: 'vision', facet: 'dream',     reverse: false },
  { id: 50, text: { en: 'Seldom daydream.',                 ca: 'Seldom daydream.'                 }, domain: 'vision', facet: 'dream',     reverse: true  },
  { id: 51, text: { en: 'Indulge in my fantasies.',         ca: 'Indulge in my fantasies.'         }, domain: 'vision', facet: 'dream',     reverse: false },
  { id: 52, text: { en: 'Have difficulty imagining things.', ca: 'Have difficulty imagining things.' }, domain: 'vision', facet: 'dream',   reverse: true  },

  // Craft (Aesthetics)
  { id: 53, text: { en: 'Believe in the importance of art.', ca: 'Believe in the importance of art.' }, domain: 'vision', facet: 'craft',   reverse: false },
  { id: 54, text: { en: 'Do not like art.',                 ca: 'Do not like art.'                 }, domain: 'vision', facet: 'craft',     reverse: true  },
  { id: 55, text: { en: 'See beauty in things that others might not notice.', ca: 'See beauty in things that others might not notice.' }, domain: 'vision', facet: 'craft', reverse: false },
  { id: 56, text: { en: 'Have no interest in poetry.',      ca: 'Have no interest in poetry.'      }, domain: 'vision', facet: 'craft',     reverse: true  },

  // Resonance (Feelings)
  { id: 57, text: { en: 'Experience my emotions intensely.', ca: 'Experience my emotions intensely.' }, domain: 'vision', facet: 'resonance', reverse: false },
  { id: 58, text: { en: "Don't understand people who get emotional.", ca: "Don't understand people who get emotional." }, domain: 'vision', facet: 'resonance', reverse: true },
  { id: 59, text: { en: 'Am passionate about causes I believe in.', ca: 'Am passionate about causes I believe in.' }, domain: 'vision', facet: 'resonance', reverse: false },
  { id: 60, text: { en: 'Rarely notice my emotional reactions.', ca: 'Rarely notice my emotional reactions.' }, domain: 'vision', facet: 'resonance', reverse: true },

  // Drift (Actions)
  { id: 61, text: { en: 'Prefer variety to routine.',       ca: 'Prefer variety to routine.'       }, domain: 'vision', facet: 'drift',     reverse: false },
  { id: 62, text: { en: 'Prefer to stick with things that I know.', ca: 'Prefer to stick with things that I know.' }, domain: 'vision', facet: 'drift', reverse: true },
  { id: 63, text: { en: 'Like to visit new places.',        ca: 'Like to visit new places.'        }, domain: 'vision', facet: 'drift',     reverse: false },
  { id: 64, text: { en: 'Am a creature of habit.',          ca: 'Am a creature of habit.'          }, domain: 'vision', facet: 'drift',     reverse: true  },

  // Prism (Ideas)
  { id: 65, text: { en: 'Am quick to understand things.',   ca: 'Am quick to understand things.'   }, domain: 'vision', facet: 'prism',     reverse: false },
  { id: 66, text: { en: 'Have difficulty understanding abstract ideas.', ca: 'Have difficulty understanding abstract ideas.' }, domain: 'vision', facet: 'prism', reverse: true },
  { id: 67, text: { en: 'Enjoy thinking about things.',     ca: 'Enjoy thinking about things.'     }, domain: 'vision', facet: 'prism',     reverse: false },
  { id: 68, text: { en: 'Avoid philosophical discussions.', ca: 'Avoid philosophical discussions.' }, domain: 'vision', facet: 'prism',     reverse: true  },

  // Compass (Values)
  { id: 69, text: { en: 'Believe that there is no absolute right or wrong.', ca: 'Believe that there is no absolute right or wrong.' }, domain: 'vision', facet: 'compass', reverse: false },
  { id: 70, text: { en: 'Tend to vote for conservative political candidates.', ca: 'Tend to vote for conservative political candidates.' }, domain: 'vision', facet: 'compass', reverse: true },
  { id: 71, text: { en: 'Believe that we should be lenient in judging others.', ca: 'Believe that we should be lenient in judging others.' }, domain: 'vision', facet: 'compass', reverse: false },
  { id: 72, text: { en: 'Believe in one true religion.',    ca: 'Believe in one true religion.'    }, domain: 'vision', facet: 'compass',   reverse: true  },

  // ── BOND (Agreeableness) ──────────────────────────────────────

  // Faith (Trust)
  { id: 73, text: { en: 'Trust others.',                    ca: 'Trust others.'                    }, domain: 'bond', facet: 'faith',     reverse: false },
  { id: 74, text: { en: 'Suspect hidden motives in others.', ca: 'Suspect hidden motives in others.' }, domain: 'bond', facet: 'faith',   reverse: true  },
  { id: 75, text: { en: 'Believe that others have good intentions.', ca: 'Believe that others have good intentions.' }, domain: 'bond', facet: 'faith', reverse: false },
  { id: 76, text: { en: 'Distrust people.',                 ca: 'Distrust people.'                 }, domain: 'bond', facet: 'faith',     reverse: true  },

  // Edge (Straightforwardness)
  { id: 77, text: { en: "Don't beat around the bush.",      ca: "Don't beat around the bush."      }, domain: 'bond', facet: 'edge',      reverse: false },
  { id: 78, text: { en: 'Use flattery to get ahead.',       ca: 'Use flattery to get ahead.'       }, domain: 'bond', facet: 'edge',      reverse: true  },
  { id: 79, text: { en: 'Tell the truth.',                  ca: 'Tell the truth.'                  }, domain: 'bond', facet: 'edge',      reverse: false },
  { id: 80, text: { en: 'Pretend to be concerned for others.', ca: 'Pretend to be concerned for others.' }, domain: 'bond', facet: 'edge', reverse: true },

  // Gift (Altruism)
  { id: 81, text: { en: 'Make people feel welcome.',        ca: 'Make people feel welcome.'        }, domain: 'bond', facet: 'gift',      reverse: false },
  { id: 82, text: { en: 'Am indifferent to the feelings of others.', ca: 'Am indifferent to the feelings of others.' }, domain: 'bond', facet: 'gift', reverse: true },
  { id: 83, text: { en: 'Anticipate the needs of others.',  ca: 'Anticipate the needs of others.'  }, domain: 'bond', facet: 'gift',      reverse: false },
  { id: 84, text: { en: 'Look down on others.',             ca: 'Look down on others.'             }, domain: 'bond', facet: 'gift',      reverse: true  },

  // Yield (Compliance)
  { id: 85, text: { en: 'Hate to seem pushy.',              ca: 'Hate to seem pushy.'              }, domain: 'bond', facet: 'yield',     reverse: false },
  { id: 86, text: { en: 'Insult people.',                   ca: 'Insult people.'                   }, domain: 'bond', facet: 'yield',     reverse: true  },
  { id: 87, text: { en: 'Avoid imposing my will on others.', ca: 'Avoid imposing my will on others.' }, domain: 'bond', facet: 'yield',   reverse: false },
  { id: 88, text: { en: 'Take advantage of others.',        ca: 'Take advantage of others.'        }, domain: 'bond', facet: 'yield',     reverse: true  },

  // Shadow (Modesty)
  { id: 89, text: { en: 'Dislike being the center of attention.', ca: 'Dislike being the center of attention.' }, domain: 'bond', facet: 'shadow', reverse: false },
  { id: 90, text: { en: 'Think highly of myself.',          ca: 'Think highly of myself.'          }, domain: 'bond', facet: 'shadow',    reverse: true  },
  { id: 91, text: { en: 'Dislike talking about myself.',    ca: 'Dislike talking about myself.'    }, domain: 'bond', facet: 'shadow',    reverse: false },
  { id: 92, text: { en: 'Boast about my virtues.',          ca: 'Boast about my virtues.'          }, domain: 'bond', facet: 'shadow',    reverse: true  },

  // Shield (Tender-Mindedness)
  { id: 93, text: { en: 'Sympathize with the homeless.',    ca: 'Sympathize with the homeless.'    }, domain: 'bond', facet: 'shield',    reverse: false },
  { id: 94, text: { en: 'Believe in an eye for an eye.',    ca: 'Believe in an eye for an eye.'    }, domain: 'bond', facet: 'shield',    reverse: true  },
  { id: 95, text: { en: "Suffer from others' sorrows.",     ca: "Suffer from others' sorrows."     }, domain: 'bond', facet: 'shield',    reverse: false },
  { id: 96, text: { en: "Am not interested in other people's problems.", ca: "Am not interested in other people's problems." }, domain: 'bond', facet: 'shield', reverse: true },

  // ── DISCIPLINE (Conscientiousness) ───────────────────────────

  // Mastery (Competence)
  { id: 97,  text: { en: 'Handle tasks efficiently.',       ca: 'Handle tasks efficiently.'        }, domain: 'discipline', facet: 'mastery',   reverse: false },
  { id: 98,  text: { en: 'Misjudge situations.',            ca: 'Misjudge situations.'             }, domain: 'discipline', facet: 'mastery',   reverse: true  },
  { id: 99,  text: { en: 'Come prepared.',                  ca: 'Come prepared.'                   }, domain: 'discipline', facet: 'mastery',   reverse: false },
  { id: 100, text: { en: "Don't know how to get things done.", ca: "Don't know how to get things done." }, domain: 'discipline', facet: 'mastery', reverse: true },

  // Structure (Order)
  { id: 101, text: { en: 'Like order.',                     ca: 'Like order.'                      }, domain: 'discipline', facet: 'structure', reverse: false },
  { id: 102, text: { en: 'Leave a mess in my room.',        ca: 'Leave a mess in my room.'         }, domain: 'discipline', facet: 'structure', reverse: true  },
  { id: 103, text: { en: 'Keep things tidy.',               ca: 'Keep things tidy.'                }, domain: 'discipline', facet: 'structure', reverse: false },
  { id: 104, text: { en: 'Fail to put things back in their proper place.', ca: 'Fail to put things back in their proper place.' }, domain: 'discipline', facet: 'structure', reverse: true },

  // Oath (Dutifulness)
  { id: 105, text: { en: 'Keep my promises.',               ca: 'Keep my promises.'                }, domain: 'discipline', facet: 'oath',      reverse: false },
  { id: 106, text: { en: 'Break rules.',                    ca: 'Break rules.'                     }, domain: 'discipline', facet: 'oath',      reverse: true  },
  { id: 107, text: { en: 'Do my duty.',                     ca: 'Do my duty.'                      }, domain: 'discipline', facet: 'oath',      reverse: false },
  { id: 108, text: { en: 'Do the opposite of what is asked.', ca: 'Do the opposite of what is asked.' }, domain: 'discipline', facet: 'oath',   reverse: true  },

  // Quest (Achievement Striving)
  { id: 109, text: { en: 'Work hard.',                      ca: 'Work hard.'                       }, domain: 'discipline', facet: 'quest',     reverse: false },
  { id: 110, text: { en: 'Put little time and effort into my work.', ca: 'Put little time and effort into my work.' }, domain: 'discipline', facet: 'quest', reverse: true },
  { id: 111, text: { en: 'Do more than expected.',          ca: 'Do more than expected.'           }, domain: 'discipline', facet: 'quest',     reverse: false },
  { id: 112, text: { en: 'Give up easily.',                 ca: 'Give up easily.'                  }, domain: 'discipline', facet: 'quest',     reverse: true  },

  // Will (Self-Discipline)
  { id: 113, text: { en: 'Get started on things right away.', ca: 'Get started on things right away.' }, domain: 'discipline', facet: 'will',   reverse: false },
  { id: 114, text: { en: 'Have difficulty starting tasks.', ca: 'Have difficulty starting tasks.'  }, domain: 'discipline', facet: 'will',      reverse: true  },
  { id: 115, text: { en: 'Get to work at once.',            ca: 'Get to work at once.'             }, domain: 'discipline', facet: 'will',      reverse: false },
  { id: 116, text: { en: 'Waste my time.',                  ca: 'Waste my time.'                   }, domain: 'discipline', facet: 'will',      reverse: true  },

  // Counsel (Deliberation)
  { id: 117, text: { en: 'Think before I speak.',           ca: 'Think before I speak.'            }, domain: 'discipline', facet: 'counsel',   reverse: false },
  { id: 118, text: { en: 'Make hasty decisions.',           ca: 'Make hasty decisions.'            }, domain: 'discipline', facet: 'counsel',   reverse: true  },
  { id: 119, text: { en: 'Weigh the pros and cons.',        ca: 'Weigh the pros and cons.'         }, domain: 'discipline', facet: 'counsel',   reverse: false },
  { id: 120, text: { en: 'Rush into things.',               ca: 'Rush into things.'                }, domain: 'discipline', facet: 'counsel',   reverse: true  },
]

export const FM_SCALE_LABELS = {
  1: 'Disagree strongly',
  2: 'Disagree a little',
  3: 'Neither agree nor disagree',
  4: 'Agree a little',
  5: 'Agree strongly',
}

export const FM_DOMAIN_META = {
  presence:   { ...DOMAINS.presence,   facets: ['hearth', 'gather', 'command', 'drive', 'thrill', 'radiance'] },
  bond:       { ...DOMAINS.bond,       facets: ['faith', 'edge', 'gift', 'yield', 'shadow', 'shield'] },
  discipline: { ...DOMAINS.discipline, facets: ['mastery', 'structure', 'oath', 'quest', 'will', 'counsel'] },
  depth:      { ...DOMAINS.depth,      facets: ['vigil', 'blaze', 'hollow', 'veil', 'surge', 'fracture'] },
  vision:     { ...DOMAINS.vision,     facets: ['dream', 'craft', 'resonance', 'drift', 'prism', 'compass'] },
}

export const FM_FACET_META = {
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
