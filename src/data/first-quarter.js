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
  { id: 1,   text: { en: 'Worry about things.', ca: 'Em preocupo per les coses.', 'es-MX': 'Me preocupo por las cosas.', 'fr-CA': "Je m'inquiète à propos de choses.", de: 'Mache mir Sorgen um Dinge.', da: 'Bekymrer mig om mange ting.' },
    domain: 'depth', facet: 'vigil', reverse: false },
  { id: 2,   text: { en: 'Get stressed out easily.', de: 'Bin schnell gestresst.', ca: "M'estresso amb facilitat.", 'es-MX': 'Me estreso fácilmente.', 'fr-CA': 'Je deviens stressé facilement.', 'fr-FR': 'Je deviens stressé·e facilement.', da: 'Bliver let stresset.' },
    domain: 'depth', facet: 'vigil', reverse: false },
  // Blaze (Anger) — n2
  { id: 3,   text: { en: 'Get angry easily.', ca: "M'enfado amb facilitat.", 'es-MX': 'Me enojo fácilmente.', 'fr-CA': 'Je me mets en colère facilement.', de: 'Werde leicht wütend.', da: 'Bliver let vred.' },
    domain: 'depth', facet: 'blaze', reverse: false },
  { id: 4,   text: { en: 'Lose my temper.', ca: 'Perdo els nervis.', 'es-MX': 'Pierdo el temperamento.', 'fr-CA': 'Je perds patience.', de: 'Verliere die Beherrschung.', da: 'Mister let besindelsen.' },
    domain: 'depth', facet: 'blaze', reverse: false },
  // Hollow (Depression) — n3
  { id: 5,   text: { en: 'Often feel blue.', ca: 'Sovint em sento trist/a.', 'es-MX': 'A menudo me siento desanimado.', 'fr-CA': 'Je me sens souvent triste.', de: 'Fühle mich oft niedergeschlagen.', da: 'Er ofte nedtrykt.' },
    domain: 'depth', facet: 'hollow', reverse: false },
  { id: 6,   text: { en: 'Dislike myself.', ca: "No m'agrada com soc.", 'es-MX': 'No me agrado.', 'fr-CA': "Je ne m'aime pas.", de: 'Mag mich selbst nicht.', da: 'Bryder mig ikke om mig selv.' },
    domain: 'depth', facet: 'hollow', reverse: false },
  // Veil (Self-Consciousness) — n4
  { id: 7,   text: { en: 'Find it difficult to approach others.', ca: 'Em costa apropar-me als altres.', 'es-MX': 'Me resulta difícil acercarme a otros.', 'fr-CA': "J'éprouve de la difficulté à aborder les autres.", de: 'Finde es schwierig, auf andere zuzugehen.', da: 'Har svært ved at indlede en samtale.' },
    domain: 'depth', facet: 'veil', reverse: false },
  { id: 8,   text: { en: 'Am easily intimidated.', de: 'Lasse mich leicht einschüchtern.', ca: "M'intimido amb facilitat.", 'fr-CA': 'Je suis facilement intimidé.', 'fr-FR': 'Je suis facilement intimidé·e.' },
    domain: 'depth', facet: 'veil', reverse: false },
  // Surge (Immoderation) — n5
  { id: 9,   text: { en: 'Rarely overindulge.', ca: 'Rarament em passo de la ratlla.', 'es-MX': 'Rara vez cedo a los excesos.', 'fr-CA': 'Je fais rarement des excès.', de: 'Übertreibe selten.', da: 'Spiser og drikker sjældent for meget.' },
    domain: 'depth', facet: 'surge', reverse: true  },
  { id: 10,  text: { en: 'Am able to control my cravings.', de: 'Kann meine Gelüste kontrollieren.', ca: 'Soc capaç de controlar les meves ganes.', 'es-MX': 'Soy capaz de controlar mis antojos.', 'fr-CA': 'Je suis capable de contrôler mes envies.', da: 'Kan styre mine behov' },
    domain: 'depth', facet: 'surge', reverse: true  },
  // Fracture (Vulnerability) — n6
  { id: 11,  text: { en: 'Remain calm under pressure.', ca: 'Em mantinc tranquil/il·la sota pressió.', 'es-MX': 'Mantengo la calma bajo presión.', 'fr-CA': 'Je demeure calme sous pression.', de: 'Bleibe unter Druck ruhig.', da: 'Bevarer roen i pressede situationer.' },
    domain: 'depth', facet: 'fracture', reverse: true  },
  { id: 12,  text: { en: 'Am calm even in tense situations.', de: 'Bleibe auch in angespannten Situationen ruhig.', ca: 'Estic tranquil/il·la fins i tot en situacions tenses.', 'fr-CA': 'Je suis calme, même dans les situations tendues.' },
    domain: 'depth', facet: 'fracture', reverse: true  },

  // ── PRESENCE (Extraversion) ─────────────────────
  // Hearth (Friendliness) — e1
  { id: 13,  text: { en: 'Make friends easily.', ca: 'Faig amics amb facilitat.', 'es-MX': 'Hago amigos fácilmente.', 'fr-CA': 'Je me fais des amis facilement.', de: 'Schließe leicht Freundschaften.', da: 'Har let ved at få venner.' },
    domain: 'presence', facet: 'hearth', reverse: false },
  { id: 14,  text: { en: 'Act comfortably with others.', de: 'Gehe unbefangen mit anderen um.', ca: 'Actuo amb naturalitat amb els altres.', 'fr-CA': "J'agis aisément avec les autres." },
    domain: 'presence', facet: 'hearth', reverse: false },
  // Gather (Gregariousness) — e2
  { id: 15,  text: { en: 'Love large parties.', de: 'Liebe große Partys.', ca: "M'encanten les festes amb molta gent.", 'es-MX': 'Me encantan las fiestas grandes.', 'fr-CA': "J'adore les grandes fêtes.", da: 'Elsker store fester.' },
    domain: 'presence', facet: 'gather', reverse: false },
  { id: 16,  text: { en: 'Avoid crowds.', de: 'Vermeide Menschenmengen.', ca: 'Evito les multituds.', 'es-MX': 'Evito las multitudes.', 'fr-CA': "J'évite les foules.", da: 'Undgår folkemængder.' },
    domain: 'presence', facet: 'gather', reverse: true  },
  // Command (Assertiveness) — e3
  { id: 17,  text: { en: 'Take charge.', ca: 'Prenc les regnes.', 'es-MX': 'Tomo el mando.', 'fr-CA': "J'aime prendre en charge.", 'fr-FR': 'Je prends les choses en main.', de: 'Übernehme die Führung.', da: 'Tager føringen.' },
    domain: 'presence', facet: 'command', reverse: false },
  { id: 18,  text: { en: 'Try to lead others.', ca: 'Intento liderar els altres.', 'es-MX': 'Trato de guiar a otros.', 'fr-CA': "J'essaie de diriger les autres.", de: 'Versuche, andere zu führen.', da: 'Forsøger at lede andre.' },
    domain: 'presence', facet: 'command', reverse: false },
  // Drive (Activity Level) — e4
  { id: 19,  text: { en: 'Am always busy.', ca: 'Sempre estic ocupat/da.', 'es-MX': 'Siempre estoy ocupado.', 'fr-CA': 'Je suis toujours occupé.', 'fr-FR': 'Je suis toujours occupé·e.', de: 'Bin immer beschäftigt.', da: 'Har altid travlt.' },
    domain: 'presence', facet: 'drive', reverse: false },
  { id: 20,  text: { en: 'Am always on the go.', ca: 'Sempre estic en moviment.', 'es-MX': 'Siempre estoy activo.', 'fr-CA': 'Je suis toujours en mouvement.', de: 'Bin immer unterwegs.', da: 'Er altid i gang m ed noget.' },
    domain: 'presence', facet: 'drive', reverse: false },
  // Thrill (Excitement-Seeking) — e5
  { id: 21,  text: { en: 'Love excitement.', ca: "M'encanta l'emoció.", 'es-MX': 'Me encanta la emoción.', 'fr-CA': "J'adore les sensations fortes.", de: 'Liebe Aufregung.', da: 'Elsker spænding.' },
    domain: 'presence', facet: 'thrill', reverse: false },
  { id: 22,  text: { en: 'Seek adventure.', ca: "Busco l'aventura.", 'es-MX': 'Me gusta buscar aventuras.', 'fr-CA': "Je recherche l'aventure.", de: 'Suche das Abenteuer.', da: 'Søger eventyr.' },
    domain: 'presence', facet: 'thrill', reverse: false },
  // Radiance (Cheerfulness) — e6
  { id: 23,  text: { en: 'Have a lot of fun.', ca: "M'ho passo molt bé.", 'es-MX': 'Me divierto mucho.', 'fr-CA': "J'ai beaucoup de plaisir.", 'fr-FR': "Je m'amuse beaucoup.", de: 'Habe sehr viel Spaß.', da: 'Har det ofte sjovt.' },
    domain: 'presence', facet: 'radiance', reverse: false },
  { id: 24,  text: { en: 'Love life.', de: 'Liebe das Leben.', ca: "M'encanta la vida.", 'es-MX': 'Amo la vida.', 'fr-CA': "J'adore la vie.", da: 'Elsker livet.' },
    domain: 'presence', facet: 'radiance', reverse: false },

  // ── VISION (Openness) ───────────────────────────
  // Dream (Imagination) — o1
  { id: 25,  text: { en: 'Have a vivid imagination.', ca: 'Tinc una imaginació molt viva.', 'es-MX': 'Tengo una imaginación vivida.', 'fr-CA': "J'ai une imagination débordante.", de: 'Habe eine lebhafte Fantasie.', da: 'Har en livlig fantasi.' },
    domain: 'vision', facet: 'dream', reverse: false },
  { id: 26,  text: { en: 'Love to daydream.', de: 'Liebe es, vor mich hin zu träumen.', ca: "M'encanta somiar despert/a.", 'es-MX': 'Me gusta soñar despierto.', 'fr-CA': "J'adore rêvasser.", da: 'Elsker at dagdrømme.' },
    domain: 'vision', facet: 'dream', reverse: false },
  // Craft (Artistic Interests) — o2
  { id: 27,  text: { en: 'Believe in the importance of art.', ca: "Crec en la importància de l'art.", 'es-MX': 'Creo en la importancia del arte.', 'fr-CA': "Je crois en l'importance de l'art.", de: 'Glaube an die Bedeutung von Kunst.', da: 'Tror på betydningen af kunst.' },
    domain: 'vision', facet: 'craft', reverse: false },
  { id: 28,  text: { en: 'Do not like art.', ca: "No m'agrada l'art.", 'es-MX': 'No me gusta el arte.', 'fr-CA': "Je n'aime pas l'art.", de: 'Mag Kunst nicht.', da: 'Kan ikke lide kunst.' },
    domain: 'vision', facet: 'craft', reverse: true  },
  // Resonance (Emotionality) — o3
  { id: 29,  text: { en: 'Experience my emotions intensely.', ca: 'Visc les meves emocions amb intensitat.', 'es-MX': 'Experimento mis emociones intensamente.', 'fr-CA': 'Je vis mes émotions intensément.', de: 'Erlebe meine Gefühle intensiv.', da: 'Oplever mine følelser intenst.' },
    domain: 'vision', facet: 'resonance', reverse: false },
  { id: 30,  text: { en: 'Am not easily affected by my emotions.', de: 'Lasse mich von meinen Gefühlen nicht leicht beeinflussen.', ca: "Les meves emocions no m'afecten amb facilitat.", 'fr-CA': 'Je ne suis pas facilement affecté par mes émotions.', 'fr-FR': 'Je ne suis pas facilement affecté·e par mes émotions.' },
    domain: 'vision', facet: 'resonance', reverse: true  },
  // Drift (Adventurousness) — o4
  { id: 31,  text: { en: 'Prefer to stick with things that I know.', ca: 'Prefereixo quedar-me amb el que conec.', 'es-MX': 'Prefiero apegarme a las cosas que sé.', 'fr-CA': "Je préfère m'en tenir aux choses connues.", de: 'Bleibe lieber bei dem, was ich kenne.', da: 'Foretrækker at holde mig til det, jeg kender.' },
    domain: 'vision', facet: 'drift', reverse: true  },
  { id: 32,  text: { en: 'Don’t like the idea of change.', de: 'Mag den Gedanken an Veränderung nicht.', ca: "No m'agrada la idea de canviar.", 'fr-CA': "Je n'aime pas l'idée de changer." },
    domain: 'vision', facet: 'drift', reverse: true  },
  // Prism (Intellect) — o5
  { id: 33,  text: { en: 'Avoid philosophical discussions.', ca: 'Evito les discussions filosòfiques.', 'es-MX': 'Evito discusiones filosóficas.', 'fr-CA': "J'évite les discussions philosophiques.", de: 'Vermeide philosophische Diskussionen.', da: 'Undgår filosofiske diskussioner.' },
    domain: 'vision', facet: 'prism', reverse: true  },
  { id: 34,  text: { en: 'Am not interested in theoretical discussions.', de: 'Interessiere mich nicht für theoretische Diskussionen.', ca: "No m'interessen les discussions teòriques.", 'es-MX': 'No tengo interés en las discusiones teóricas o hipotéticas.', 'fr-CA': 'Je ne suis pas intéressé par les discussions théoriques.', 'fr-FR': 'Je ne suis pas intéressé·e par les discussions théoriques.', da: 'Er ikke interesseret i teoretiske diskussioner.' },
    domain: 'vision', facet: 'prism', reverse: true  },
  // Compass (Liberalism) — o6
  { id: 35,  text: { en: 'Tend to vote for liberal political candidates.', de: 'Neige dazu, für progressive politische Kandidat*innen zu stimmen.', ca: 'Solc votar candidatures polítiques progressistes.', 'es-MX': 'Tiendo a votar por políticos liberales.', 'fr-CA': 'J’ai tendance à promouvoir des valeurs sociales libérales.', 'fr-FR': "J'ai tendance à promouvoir des valeurs sociales progressistes.", da: 'Ser mig selv som mest venstreorienteret.' },
    domain: 'vision', facet: 'compass', reverse: false },
  { id: 36,  text: { en: 'Believe in one true religion.', de: 'Glaube an eine einzige wahre Religion.', ca: 'Crec que només hi ha una religió veritable.', 'fr-CA': 'Je crois en une seule vraie religion.' },
    domain: 'vision', facet: 'compass', reverse: true  },

  // ── BOND (Agreeableness) ────────────────────────
  // Faith (Trust) — a1
  { id: 37,  text: { en: 'Trust others.', ca: 'Confio en els altres.', 'es-MX': 'Confío en los demás.', 'fr-CA': 'Je fais confiance aux autres.', de: 'Vertraue anderen.', da: 'Har tillid til andre.' },
    domain: 'bond', facet: 'faith', reverse: false },
  { id: 38,  text: { en: 'Believe that others have good intentions.', ca: 'Crec que els altres tenen bones intencions.', 'es-MX': 'Creo que los demás tienen buenas intenciones.', 'fr-CA': 'Je crois que les autres ont de bonnes intentions.', de: 'Glaube, dass andere gute Absichten haben.', da: 'Tror generelt, andre vil mig det bedste.' },
    domain: 'bond', facet: 'faith', reverse: false },
  // Edge (Morality) — a2
  { id: 39,  text: { en: 'Cheat to get ahead.', de: 'Betrüge, um weiterzukommen.', ca: 'Faig trampes per arribar més lluny.', 'es-MX': 'Hago trampa para avanzar.', 'fr-CA': 'Je triche pour avancer.', da: 'Snyder for at få et forspring.' },
    domain: 'bond', facet: 'edge', reverse: true  },
  { id: 40,  text: { en: 'Take advantage of others.', ca: "M'aprofito dels altres.", 'es-MX': 'Tomo ventaja de los demás.', 'fr-CA': 'Je profite des autres.', de: 'Nutze andere aus.', da: 'Udnytter andre.' },
    domain: 'bond', facet: 'edge', reverse: true  },
  // Gift (Altruism) — a3
  { id: 41,  text: { en: 'Love to help others.', de: 'Liebe es, anderen zu helfen.', ca: "M'encanta ajudar els altres.", 'es-MX': 'Me gusta ayudar a otros.', 'fr-CA': "J'adore aider les autres.", da: 'Elsker at hjælpe andre.' },
    domain: 'bond', facet: 'gift', reverse: false },
  { id: 42,  text: { en: 'Am concerned about others.', de: 'Kümmere mich um andere.', ca: 'Em preocupo pels altres.', 'es-MX': 'Me preocupo por los demás.', 'fr-CA': 'Je me préoccupe des autres.', da: 'Bekymrer mig om andre.' },
    domain: 'bond', facet: 'gift', reverse: false },
  // Yield (Cooperation) — a4
  { id: 43,  text: { en: 'Insult people.', ca: 'Insulto les persones.', 'es-MX': 'Insulto a las personas.', 'fr-CA': "J'insulte les gens.", de: 'Beleidige Menschen.', da: 'Fornærmer folk.' },
    domain: 'bond', facet: 'yield', reverse: true  },
  { id: 44,  text: { en: 'Get back at others.', de: 'Zahle es anderen heim.', ca: 'Em venjo dels altres.', 'es-MX': 'Cuando me la hacen me la pagan.', 'fr-CA': "Je m'en prends aux autres.", da: 'Tager hævn over andre.' },
    domain: 'bond', facet: 'yield', reverse: true  },
  // Shadow (Modesty) — a5
  { id: 45,  text: { en: 'Believe that I am better than others.', de: 'Glaube, dass ich besser bin als andere.', ca: 'Crec que soc millor que els altres.', 'es-MX': 'Creo que soy mejor que otros.', 'fr-CA': 'Je crois être meilleur que les autres.', 'fr-FR': 'Je crois être meilleur·e que les autres.', da: 'Mener, jeg er bedre end andre.' },
    domain: 'bond', facet: 'shadow', reverse: true  },
  { id: 46,  text: { en: 'Think highly of myself.', ca: 'Tinc un alt concepte de mi mateix/a.', 'es-MX': 'Pienso muy bien de mí mismo.', 'fr-CA': "J'ai une très grande estime de moi-même.", de: 'Habe eine hohe Meinung von mir selbst.', da: 'Har høje tanker om mig selv.' },
    domain: 'bond', facet: 'shadow', reverse: true  },
  // Shield (Sympathy) — a6
  { id: 47,  text: { en: 'Sympathize with the homeless.', ca: 'Em compadeixo de les persones sense llar.', 'es-MX': 'Tengo empatía por las personas sin hogar.', 'fr-CA': 'Je sympathise avec les sans-abri.', 'fr-FR': "J'ai de la sympathie pour les sans-abri.", de: 'Habe Mitgefühl mit obdachlosen Menschen.', da: 'Har sympati for de hjemløse.' },
    domain: 'bond', facet: 'shield', reverse: false },
  { id: 48,  text: { en: 'Feel sympathy for those who are worse off than myself.', de: 'Habe Mitgefühl mit Menschen, denen es schlechter geht als mir.', ca: 'Em compadeixo dels qui estan pitjor que jo.', 'es-MX': 'Siento empatía por aquellos que están más necesitados que yo.', 'fr-CA': "J'ai de la sympathie pour les gens plus démunis que moi.", da: 'Føler sympati for dem, der har det værre end mig selv.' },
    domain: 'bond', facet: 'shield', reverse: false },

  // ── DISCIPLINE (Conscientiousness) ──────────────
  // Mastery (Self-Efficacy) — c1
  { id: 49,  text: { en: 'Handle tasks smoothly.', de: 'Bewältige Aufgaben mühelos.', ca: 'Faig les tasques sense entrebancs.', 'es-MX': 'Realizo las tareas sin problemas.', 'fr-CA': 'Je gère les tâches facilement.', da: 'Håndterer opgaver med lethed.' },
    domain: 'discipline', facet: 'mastery', reverse: false },
  { id: 50,  text: { en: 'Know how to get things done.', de: 'Weiß, wie man Dinge erledigt.', ca: 'Sé com treure la feina endavant.', 'es-MX': 'Se cómo hacer las cosas.', 'fr-CA': 'Je sais comment faire avancer les choses.', da: 'Ved, hvordan man får tingene gjort.' },
    domain: 'discipline', facet: 'mastery', reverse: false },
  // Structure (Orderliness) — c2
  { id: 51,  text: { en: 'Like order.', ca: "M'agrada l'ordre.", 'es-MX': 'Me gusta el orden.', 'fr-CA': "J'aime l'ordre.", de: 'Mag Ordnung.', da: 'Kan godt lide orden.' },
    domain: 'discipline', facet: 'structure', reverse: false },
  { id: 52,  text: { en: 'Leave a mess in my room.', ca: 'Deixo la meva habitació desordenada.', 'es-MX': 'Dejo un desorden en mi espacio.', 'fr-CA': 'Je laisse ma chambre en désordre.', de: 'Hinterlasse Unordnung in meinem Zimmer.', da: 'Roder derhjemme.' },
    domain: 'discipline', facet: 'structure', reverse: true  },
  // Oath (Dutifulness) — c3
  { id: 53,  text: { en: 'Tell the truth.', ca: 'Dic la veritat.', 'es-MX': 'Digo la verdad.', 'fr-CA': 'Je dis la vérité.', de: 'Sage die Wahrheit.', da: 'Fortæller sandheden.' },
    domain: 'discipline', facet: 'oath', reverse: false },
  { id: 54,  text: { en: 'Break my promises.', de: 'Breche meine Versprechen.', ca: 'Trenco les meves promeses.', 'es-MX': 'Rompo mis promesas.', 'fr-CA': 'Je ne tiens pas mes promesses.', da: 'Bryder mine løfter.' },
    domain: 'discipline', facet: 'oath', reverse: true  },
  // Quest (Achievement-Striving) — c4
  { id: 55,  text: { en: 'Work hard.', ca: 'Treballo dur.', 'es-MX': 'Trabajo duro.', 'fr-CA': 'Je travaille fort.', 'fr-FR': 'Je travaille dur.', de: 'Arbeite hart.', da: 'Arbejder hårdt.' },
    domain: 'discipline', facet: 'quest', reverse: false },
  { id: 56,  text: { en: 'Set high standards for myself and others.', de: 'Lege hohe Maßstäbe an mich und andere an.', ca: 'Poso el llistó alt per a mi i per als altres.', 'fr-CA': 'Je me fixe des standards élevés pour moi-même et les autres.', 'fr-FR': 'Je me fixe des exigences élevées pour moi-même et les autres.' },
    domain: 'discipline', facet: 'quest', reverse: false },
  // Will (Self-Discipline) — c5
  { id: 57,  text: { en: 'Carry out my plans.', de: 'Setze meine Pläne um.', ca: 'Duc a terme els meus plans.', 'es-MX': 'Llevo a cabo mis planes.', 'fr-CA': 'Je réalise mes objectifs.', da: 'Fører mine planer ud i livet.' },
    domain: 'discipline', facet: 'will', reverse: false },
  { id: 58,  text: { en: 'Have difficulty starting tasks.', ca: 'Em costa començar les tasques.', 'es-MX': 'Dificultad para comenzar tareas.', 'fr-CA': "J'ai de la difficulté à commencer les tâches.", de: 'Habe Schwierigkeiten, Aufgaben zu beginnen.', da: 'Har svært ved at gå i gang med opgaver.' },
    domain: 'discipline', facet: 'will', reverse: true  },
  // Counsel (Cautiousness) — c6
  { id: 59,  text: { en: 'Make rash decisions.', de: 'Treffe voreilige Entscheidungen.', ca: 'Prenc decisions precipitades.', 'fr-CA': 'Je prends des décisions impulsives.', da: 'Tager forhastede beslutninger.' },
    domain: 'discipline', facet: 'counsel', reverse: true  },
  { id: 60,  text: { en: 'Act without thinking.', ca: 'Actuo sense pensar.', 'es-MX': 'Actúo sin pensar.', 'fr-CA': "J'agis sans penser.", de: 'Handle ohne nachzudenken.', da: 'Handler uden at tænke.' },
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
