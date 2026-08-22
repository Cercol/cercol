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

  // ── DEPTH (Neuroticism) ─────────────────────────
  // Vigil (Anxiety) — n1
  { id: 1,   text: { en: 'Worry about things.', ca: 'Em preocupo per les coses.', 'es-MX': 'Me preocupo por las cosas.', 'fr-CA': "Je m'inquiète à propos de choses.", de: 'Mache mir Sorgen um Dinge.', da: 'Bekymrer mig om mange ting.' }, domain: 'depth', facet: 'vigil', reverse: false },
  { id: 2,   text: { en: 'Fear for the worst.', ca: 'Temo el pitjor.', 'es-MX': 'Temo lo peor.', 'fr-CA': 'Je crains le pire.', de: 'Befürchte das Schlimmste.', da: 'Frygter det værste.' }, domain: 'depth', facet: 'vigil', reverse: false },
  { id: 3,   text: { en: 'Am afraid of many things.', ca: 'Tinc por de moltes coses.', 'es-MX': 'Tengo miedo a muchas cosas.', 'fr-CA': "J'ai peur de plusieurs choses.", 'fr-FR': "J'ai peur de beaucoup de choses.", de: 'Habe vor vielen Dingen Angst.', da: 'Er bange for mange ting.' }, domain: 'depth', facet: 'vigil', reverse: false },
  { id: 4,   text: { en: 'Get stressed out easily.', 'es-MX': 'Me estreso fácilmente.', 'fr-CA': 'Je deviens stressé facilement.', 'fr-FR': 'Je deviens stressé·e facilement.', da: 'Bliver let stresset.' }, domain: 'depth', facet: 'vigil', reverse: false },
  // Blaze (Anger) — n2
  { id: 5,   text: { en: 'Get angry easily.', ca: "M'enfado amb facilitat.", 'es-MX': 'Me enojo fácilmente.', 'fr-CA': 'Je me mets en colère facilement.', de: 'Werde leicht wütend.', da: 'Bliver let vred.' }, domain: 'depth', facet: 'blaze', reverse: false },
  { id: 6,   text: { en: 'Get irritated easily.', ca: "M'irrito amb facilitat.", 'es-MX': 'Me irrito fácilmente.', 'fr-CA': 'Je suis irritable facilement.', 'fr-FR': "Je m'irrite facilement.", de: 'Werde leicht gereizt.', da: 'Bliver let irriteret.' }, domain: 'depth', facet: 'blaze', reverse: false },
  { id: 7,   text: { en: 'Lose my temper.', ca: 'Perdo els nervis.', 'es-MX': 'Pierdo el temperamento.', 'fr-CA': 'Je perds patience.', de: 'Verliere die Beherrschung.', da: 'Mister let besindelsen.' }, domain: 'depth', facet: 'blaze', reverse: false },
  { id: 8,   text: { en: 'Am not easily annoyed.', ca: 'No em molesto amb facilitat.', 'es-MX': 'No me molestan fácilmente.', 'fr-CA': 'Je ne suis pas facilement agacé.', 'fr-FR': 'Je ne suis pas facilement agacé·e.', de: 'Bin nicht leicht zu verärgern.', da: 'Bliver sjældent irriteret.' }, domain: 'depth', facet: 'blaze', reverse: true  },
  // Hollow (Depression) — n3
  { id: 9,   text: { en: 'Often feel blue.', ca: 'Sovint em sento trist/a.', 'es-MX': 'A menudo me siento desanimado.', 'fr-CA': 'Je me sens souvent triste.', de: 'Fühle mich oft niedergeschlagen.', da: 'Er ofte nedtrykt.' }, domain: 'depth', facet: 'hollow', reverse: false },
  { id: 10,  text: { en: 'Dislike myself.', ca: "No m'agrada com soc.", 'es-MX': 'No me agrado.', 'fr-CA': "Je ne m'aime pas.", de: 'Mag mich selbst nicht.', da: 'Bryder mig ikke om mig selv.' }, domain: 'depth', facet: 'hollow', reverse: false },
  { id: 11,  text: { en: 'Am often down in the dumps.', ca: 'Sovint em sento deprimit/da.', 'es-MX': 'A menudo me siento abrumado.', 'fr-CA': "Il m'arrive souvent de broyer du noir.", de: 'Bin oft deprimiert.', da: 'Er ofte nede i kulkælderen' }, domain: 'depth', facet: 'hollow', reverse: false },
  { id: 12,  text: { en: 'Feel comfortable with myself.', ca: 'Em sento còmode/a amb mi mateix/a.', 'es-MX': 'Me siento cómodo conmigo mismo.', 'fr-CA': "Je suis à l'aise avec moi-même.", de: 'Fühle mich mit mir selbst wohl.', da: 'Har det godt med mig selv.' }, domain: 'depth', facet: 'hollow', reverse: true  },
  // Veil (Self-Consciousness) — n4
  { id: 13,  text: { en: 'Find it difficult to approach others.', ca: 'Em costa apropar-me als altres.', 'es-MX': 'Me resulta difícil acercarme a otros.', 'fr-CA': "J'éprouve de la difficulté à aborder les autres.", de: 'Finde es schwierig, auf andere zuzugehen.', da: 'Har svært ved at indlede en samtale.' }, domain: 'depth', facet: 'veil', reverse: false },
  { id: 14,  text: { en: 'Am afraid to draw attention to myself.', ca: "Tinc por de cridar l'atenció.", 'es-MX': 'Tengo miedo de llamar la atención.', 'fr-CA': "J'ai peur d'attirer l'attention vers moi.", 'fr-FR': "J'ai peur d'attirer l'attention sur moi.", de: 'Habe Angst, Aufmerksamkeit auf mich zu ziehen.', da: 'Er bange for at gøre opmærksom på mig selv.' }, domain: 'depth', facet: 'veil', reverse: false },
  { id: 15,  text: { en: 'Only feel comfortable with friends.', 'es-MX': 'Solo me siento cómodo con mis amigos.', 'fr-CA': "Je me sens seulement à l'aise avec mes amis.", 'fr-FR': "Je ne me sens à l'aise qu'avec mes amis.", da: 'Har det kun rart med mine venner.' }, domain: 'depth', facet: 'veil', reverse: false },
  { id: 16,  text: { en: 'Am not bothered by difficult social situations.', 'es-MX': 'No me molestan las situaciones sociales difíciles.', 'fr-CA': 'Je ne suis pas dérangé par les situations sociales difficiles.', 'fr-FR': 'Je ne suis pas dérangé·e par les situations sociales difficiles.', da: 'Har ikke noget imod komplekse sociale situationer.' }, domain: 'depth', facet: 'veil', reverse: true  },
  // Surge (Immoderation) — n5
  { id: 17,  text: { en: 'Go on binges.', 'es-MX': 'Tiendo a excederme.', 'fr-CA': 'Je fais des excès.', da: 'Går amok med mad og drikke.' }, domain: 'depth', facet: 'surge', reverse: false },
  { id: 18,  text: { en: 'Easily resist temptations.', 'es-MX': 'Resisto sin dificultad a las tentaciones.', 'fr-CA': 'Je résiste facilement à la tentation.', da: 'Har let ved at modstå fristelser.' }, domain: 'depth', facet: 'surge', reverse: true  },
  { id: 19,  text: { en: 'Rarely overindulge.', ca: 'Rarament em passo de la ratlla.', 'es-MX': 'Rara vez cedo a los excesos.', 'fr-CA': 'Je fais rarement des excès.', de: 'Übertreibe selten.', da: 'Spiser og drikker sjældent for meget.' }, domain: 'depth', facet: 'surge', reverse: true  },
  { id: 20,  text: { en: 'Am able to control my cravings.', 'es-MX': 'Soy capaz de controlar mis antojos.', 'fr-CA': 'Je suis capable de contrôler mes envies.', da: 'Kan styre mine behov' }, domain: 'depth', facet: 'surge', reverse: true  },
  // Fracture (Vulnerability) — n6
  { id: 21,  text: { en: 'Panic easily.', ca: "M'entra el pànic amb facilitat.", 'es-MX': 'Me asusto fácilmente.', 'fr-CA': 'Je panique facilement.', de: 'Gerate leicht in Panik.', da: 'Går let i panik.' }, domain: 'depth', facet: 'fracture', reverse: false },
  { id: 22,  text: { en: 'Become overwhelmed by events.', ca: 'Els esdeveniments em desborden.', 'es-MX': 'Me abrumo por acontecimientos.', 'fr-CA': 'Je me sens dépassé par les événements.', 'fr-FR': 'Je me sens dépassé·e par les événements.', de: 'Werde von Ereignissen überwältigt.', da: 'Bliver let overvældet af begivenheder.' }, domain: 'depth', facet: 'fracture', reverse: false },
  { id: 23,  text: { en: "Feel that I'm unable to deal with things.", ca: 'Sento que soc incapaç de fer front a les coses.', 'es-MX': 'Creo que soy incapaz de lidiar con cosas.', 'fr-CA': 'Je me sens incapable de gérer les choses.', de: 'Fühle, dass ich mit Dingen nicht umgehen kann.', da: 'Føler, at jeg har svært ved at håndtere mange ting.' }, domain: 'depth', facet: 'fracture', reverse: false },
  { id: 24,  text: { en: 'Remain calm under pressure.', ca: 'Em mantinc tranquil/il·la sota pressió.', 'es-MX': 'Mantengo la calma bajo presión.', 'fr-CA': 'Je demeure calme sous pression.', de: 'Bleibe unter Druck ruhig.', da: 'Bevarer roen i pressede situationer.' }, domain: 'depth', facet: 'fracture', reverse: true  },

  // ── PRESENCE (Extraversion) ─────────────────────
  // Hearth (Friendliness) — e1
  { id: 25,  text: { en: 'Make friends easily.', ca: 'Faig amics amb facilitat.', 'es-MX': 'Hago amigos fácilmente.', 'fr-CA': 'Je me fais des amis facilement.', de: 'Schließe leicht Freundschaften.', da: 'Har let ved at få venner.' }, domain: 'presence', facet: 'hearth', reverse: false },
  { id: 26,  text: { en: 'Feel comfortable around people.', 'es-MX': 'Me siento cómodo entre personas.', 'fr-CA': 'Je me sens confortable avec les gens.', 'fr-FR': "Je me sens à l'aise avec les gens.", da: 'Har det godt sammen med andre.' }, domain: 'presence', facet: 'hearth', reverse: false },
  { id: 27,  text: { en: 'Avoid contacts with others.', 'es-MX': 'Evito tener contacto con otros.', 'fr-CA': "J'évite le contact avec les autres.", da: 'Undgår kontakt med andre.' }, domain: 'presence', facet: 'hearth', reverse: true  },
  { id: 28,  text: { en: 'Keep others at a distance.', 'es-MX': 'Mantengo a los demás a distancia.', 'fr-CA': 'Je garde les autres à distance.', da: 'Holder andre på afstand.' }, domain: 'presence', facet: 'hearth', reverse: true  },
  // Gather (Gregariousness) — e2
  { id: 29,  text: { en: 'Love large parties.', 'es-MX': 'Me encantan las fiestas grandes.', 'fr-CA': "J'adore les grandes fêtes.", da: 'Elsker store fester.' }, domain: 'presence', facet: 'gather', reverse: false },
  { id: 30,  text: { en: 'Talk to a lot of different people at parties.', 'es-MX': 'En las reuniones hablo con muchas personas distintas.', 'fr-CA': 'Je parle à plusieurs personnes dans les partys.', 'fr-FR': 'Je parle à beaucoup de personnes différentes lors des fêtes.', da: 'Taler med mange forskellige mennesker til fester.' }, domain: 'presence', facet: 'gather', reverse: false },
  { id: 31,  text: { en: 'Prefer to be alone.', ca: 'Prefereixo estar sol/a.', 'es-MX': 'Prefiero estar solo.', 'fr-CA': 'Je préfère être seul.', 'fr-FR': 'Je préfère être seul·e.', de: 'Bin lieber allein.', da: 'Foretrækker at være alene.' }, domain: 'presence', facet: 'gather', reverse: true  },
  { id: 32,  text: { en: 'Avoid crowds.', 'es-MX': 'Evito las multitudes.', 'fr-CA': "J'évite les foules.", da: 'Undgår folkemængder.' }, domain: 'presence', facet: 'gather', reverse: true  },
  // Command (Assertiveness) — e3
  { id: 33,  text: { en: 'Take charge.', ca: 'Prenc les regnes.', 'es-MX': 'Tomo el mando.', 'fr-CA': "J'aime prendre en charge.", 'fr-FR': 'Je prends les choses en main.', de: 'Übernehme die Führung.', da: 'Tager føringen.' }, domain: 'presence', facet: 'command', reverse: false },
  { id: 34,  text: { en: 'Try to lead others.', ca: 'Intento liderar els altres.', 'es-MX': 'Trato de guiar a otros.', 'fr-CA': "J'essaie de diriger les autres.", de: 'Versuche, andere zu führen.', da: 'Forsøger at lede andre.' }, domain: 'presence', facet: 'command', reverse: false },
  { id: 35,  text: { en: 'Take control of things.', 'es-MX': 'Tomo el control de las cosas.', 'fr-CA': 'Je prends le contrôle des choses.', da: 'Tager kontrollen.' }, domain: 'presence', facet: 'command', reverse: false },
  { id: 36,  text: { en: 'Wait for others to lead the way.', ca: 'Espero que els altres prenguin la iniciativa.', 'es-MX': 'Espero a que otros guíen el camino.', 'fr-CA': "J'attends que les autres prennent les devants.", de: 'Warte darauf, dass andere vorangehen.', da: 'Venter på, at andre viser vejen frem.' }, domain: 'presence', facet: 'command', reverse: true  },
  // Drive (Activity Level) — e4
  { id: 37,  text: { en: 'Am always busy.', ca: 'Sempre estic ocupat/da.', 'es-MX': 'Siempre estoy ocupado.', 'fr-CA': 'Je suis toujours occupé.', 'fr-FR': 'Je suis toujours occupé·e.', de: 'Bin immer beschäftigt.', da: 'Har altid travlt.' }, domain: 'presence', facet: 'drive', reverse: false },
  { id: 38,  text: { en: 'Am always on the go.', ca: 'Sempre estic en moviment.', 'es-MX': 'Siempre estoy activo.', 'fr-CA': 'Je suis toujours en mouvement.', de: 'Bin immer unterwegs.', da: 'Er altid i gang m ed noget.' }, domain: 'presence', facet: 'drive', reverse: false },
  { id: 39,  text: { en: 'Do a lot in my spare time.', 'es-MX': 'Hago muchas cosas en mi tiempo libre.', 'fr-CA': 'Je fais beaucoup de choses dans mes temps libres.', 'fr-FR': 'Je fais beaucoup de choses pendant mon temps libre.', da: 'Laver en masse i min fritid.' }, domain: 'presence', facet: 'drive', reverse: false },
  { id: 40,  text: { en: 'Like to take it easy.', ca: "M'agrada prendre-m'ho amb calma.", 'es-MX': 'Me gusta tomar las cosas con calma.', 'fr-CA': "J'aime prendre ça mollo.", 'fr-FR': "J'aime prendre les choses tranquillement.", de: 'Nehme es gerne ruhig an.', da: 'Kan godt lide at slappe af.' }, domain: 'presence', facet: 'drive', reverse: true  },
  // Thrill (Excitement-Seeking) — e5
  { id: 41,  text: { en: 'Love excitement.', ca: "M'encanta l'emoció.", 'es-MX': 'Me encanta la emoción.', 'fr-CA': "J'adore les sensations fortes.", de: 'Liebe Aufregung.', da: 'Elsker spænding.' }, domain: 'presence', facet: 'thrill', reverse: false },
  { id: 42,  text: { en: 'Seek adventure.', ca: "Busco l'aventura.", 'es-MX': 'Me gusta buscar aventuras.', 'fr-CA': "Je recherche l'aventure.", de: 'Suche das Abenteuer.', da: 'Søger eventyr.' }, domain: 'presence', facet: 'thrill', reverse: false },
  { id: 43,  text: { en: 'Enjoy being reckless.', 'es-MX': 'Disfruto ser imprudente.', 'fr-CA': "J'agis de manière effrénée.", da: 'Nyder at tage vilde chancer.' }, domain: 'presence', facet: 'thrill', reverse: false },
  { id: 44,  text: { en: 'Act wild and crazy.', 'es-MX': 'Me comporto de manera desenfrenada y descontrolada.', 'fr-CA': "J'agis de façon téméraire.", da: 'Opfører mig vildt.' }, domain: 'presence', facet: 'thrill', reverse: false },
  // Radiance (Cheerfulness) — e6
  { id: 45,  text: { en: 'Radiate joy.', ca: 'Irradio alegria.', 'es-MX': 'Irradio alegría.', 'fr-CA': 'Je respire la joie.', de: 'Strahle Freude aus.', da: 'Udstråler glæde.' }, domain: 'presence', facet: 'radiance', reverse: false },
  { id: 46,  text: { en: 'Have a lot of fun.', ca: "M'ho passo molt bé.", 'es-MX': 'Me divierto mucho.', 'fr-CA': "J'ai beaucoup de plaisir.", 'fr-FR': "Je m'amuse beaucoup.", de: 'Habe sehr viel Spaß.', da: 'Har det ofte sjovt.' }, domain: 'presence', facet: 'radiance', reverse: false },
  { id: 47,  text: { en: 'Love life.', 'es-MX': 'Amo la vida.', 'fr-CA': "J'adore la vie.", da: 'Elsker livet.' }, domain: 'presence', facet: 'radiance', reverse: false },
  { id: 48,  text: { en: 'Look at the bright side of life.', 'es-MX': 'Veo el lado positivo de la vida.', 'fr-CA': 'Je regarde le bon côté de la vie.', da: 'Fokuserer på de positive ting i tilværelsen.' }, domain: 'presence', facet: 'radiance', reverse: false },

  // ── VISION (Openness) ───────────────────────────
  // Dream (Imagination) — o1
  { id: 49,  text: { en: 'Have a vivid imagination.', ca: 'Tinc una imaginació molt viva.', 'es-MX': 'Tengo una imaginación vivida.', 'fr-CA': "J'ai une imagination débordante.", de: 'Habe eine lebhafte Fantasie.', da: 'Har en livlig fantasi.' }, domain: 'vision', facet: 'dream', reverse: false },
  { id: 50,  text: { en: 'Enjoy wild flights of fantasy.', 'es-MX': 'Disfruto fantasear.', 'fr-CA': "J'aime me perdre dans mes idées.", da: 'Nyder at fortabe mig i vilde fantasier.' }, domain: 'vision', facet: 'dream', reverse: false },
  { id: 51,  text: { en: 'Love to daydream.', 'es-MX': 'Me gusta soñar despierto.', 'fr-CA': "J'adore rêvasser.", da: 'Elsker at dagdrømme.' }, domain: 'vision', facet: 'dream', reverse: false },
  { id: 52,  text: { en: 'Like to get lost in thought.', 'es-MX': 'Me gusta perderme en mis pensamientos.', 'fr-CA': "J'aime me perdre dans mes pensées.", da: 'Kan godt lide at fortabe mig i mine tanker.' }, domain: 'vision', facet: 'dream', reverse: false },
  // Craft (Artistic Interests) — o2
  { id: 53,  text: { en: 'See beauty in things that others might not notice.', ca: 'Veig bellesa en coses que els altres potser no adverteixen.', 'es-MX': 'Veo la belleza en las cosas que otros no notan.', 'fr-CA': "Je vois une beauté dans les choses que d'autres pourraient ne pas remarquer.", 'fr-FR': "Je vois de la beauté dans des choses que d'autres pourraient ne pas remarquer.", de: 'Sehe Schönheit in Dingen, die andere vielleicht nicht bemerken.', da: 'Ser det smukke i ting, andre måske ikke lægger mærke til.' }, domain: 'vision', facet: 'craft', reverse: false },
  { id: 54,  text: { en: 'Believe in the importance of art.', ca: "Crec en la importància de l'art.", 'es-MX': 'Creo en la importancia del arte.', 'fr-CA': "Je crois en l'importance de l'art.", de: 'Glaube an die Bedeutung von Kunst.', da: 'Tror på betydningen af kunst.' }, domain: 'vision', facet: 'craft', reverse: false },
  { id: 55,  text: { en: 'Do not like poetry.', 'es-MX': 'No me gusta la poesía.', 'fr-CA': "Je n'aime pas la poésie.", da: 'Bryder mig ikke om poesi.' }, domain: 'vision', facet: 'craft', reverse: true  },
  { id: 56,  text: { en: 'Do not enjoy going to art museums.', 'es-MX': 'No disfruto ir a museos de arte.', 'fr-CA': "Je n'apprécie pas aller à des musées d'art.", 'fr-FR': "Je n'apprécie pas d'aller dans des musées d'art.", da: 'Bryder mig ikke om at gå på kunstmuseer.' }, domain: 'vision', facet: 'craft', reverse: true  },
  // Resonance (Emotionality) — o3
  { id: 57,  text: { en: 'Experience my emotions intensely.', ca: 'Visc les meves emocions amb intensitat.', 'es-MX': 'Experimento mis emociones intensamente.', 'fr-CA': 'Je vis mes émotions intensément.', de: 'Erlebe meine Gefühle intensiv.', da: 'Oplever mine følelser intenst.' }, domain: 'vision', facet: 'resonance', reverse: false },
  { id: 58,  text: { en: "Feel others' emotions.", 'fr-CA': 'Je ressens les émotions des autres.', da: 'Fornemmer andres følelser.' }, domain: 'vision', facet: 'resonance', reverse: false },
  { id: 59,  text: { en: 'Rarely notice my emotional reactions.', ca: 'Rarament noto les meves reaccions emocionals.', 'es-MX': 'Raramente me doy cuenta de mis relaciones emocionales.', 'fr-CA': 'Je suis rarement sensible à mes réactions émotives.', de: 'Bemerke meine emotionalen Reaktionen selten.', da: 'Lægger sjældent mærke til mine følelsesmæssige reaktioner.' }, domain: 'vision', facet: 'resonance', reverse: true  },
  { id: 60,  text: { en: "Don't understand people who get emotional.", ca: "No entenc les persones que s'emocionen.", 'es-MX': 'No comprendo a la gente que se pone muy emocional.', 'fr-CA': 'Je ne comprends pas les gens émotifs.', de: 'Verstehe Menschen nicht, die sich von Gefühlen leiten lassen.', da: 'Forstår ikke dem, der bliver følelsesladede.' }, domain: 'vision', facet: 'resonance', reverse: true  },
  // Drift (Adventurousness) — o4
  { id: 61,  text: { en: 'Prefer variety to routine.', ca: 'Prefereixo la varietat a la rutina.', 'es-MX': 'Prefiero la variedad en vez de la rutina.', 'fr-CA': 'Je préfère la variété à la routine.', de: 'Bevorzuge Abwechslung gegenüber Routine.', da: 'Foretrækker afveksling frem for rutine.' }, domain: 'vision', facet: 'drift', reverse: false },
  { id: 62,  text: { en: 'Prefer to stick with things that I know.', ca: 'Prefereixo quedar-me amb el que conec.', 'es-MX': 'Prefiero apegarme a las cosas que sé.', 'fr-CA': "Je préfère m'en tenir aux choses connues.", de: 'Bleibe lieber bei dem, was ich kenne.', da: 'Foretrækker at holde mig til det, jeg kender.' }, domain: 'vision', facet: 'drift', reverse: true  },
  { id: 63,  text: { en: 'Dislike changes.', 'es-MX': 'No me agradan los cambios.', 'fr-CA': "Je n'aime pas les changements.", da: 'Bryder mig ikke om forandringer.' }, domain: 'vision', facet: 'drift', reverse: true  },
  { id: 64,  text: { en: 'Am attached to conventional ways.', 'es-MX': 'Soy apegado a las formas convencionales.', 'fr-CA': 'Je suis attaché aux méthodes conventionnelles.', 'fr-FR': 'Je suis attaché·e aux méthodes conventionnelles.', da: 'Holder mig til traditionerne.' }, domain: 'vision', facet: 'drift', reverse: true  },
  // Prism (Intellect) — o5
  { id: 65,  text: { en: 'Love to read challenging material.', 'es-MX': 'Me encanta leer temas desafiantes.', 'fr-CA': "J'adore lire des documents stimulants.", da: 'Elsker at læse svære tekster.' }, domain: 'vision', facet: 'prism', reverse: false },
  { id: 66,  text: { en: 'Avoid philosophical discussions.', ca: 'Evito les discussions filosòfiques.', 'es-MX': 'Evito discusiones filosóficas.', 'fr-CA': "J'évite les discussions philosophiques.", de: 'Vermeide philosophische Diskussionen.', da: 'Undgår filosofiske diskussioner.' }, domain: 'vision', facet: 'prism', reverse: true  },
  { id: 67,  text: { en: 'Have difficulty understanding abstract ideas.', ca: 'Em costa entendre idees abstractes.', 'es-MX': 'Se me dificulta entender las ideas abstractas.', 'fr-CA': "J'ai de la difficulté à comprendre les idées abstraites.", de: 'Habe Schwierigkeiten, abstrakte Ideen zu verstehen.', da: 'Har svært ved at forstå abstrakte ideer.' }, domain: 'vision', facet: 'prism', reverse: true  },
  { id: 68,  text: { en: 'Am not interested in theoretical discussions.', 'es-MX': 'No tengo interés en las discusiones teóricas o hipotéticas.', 'fr-CA': 'Je ne suis pas intéressé par les discussions théoriques.', 'fr-FR': 'Je ne suis pas intéressé·e par les discussions théoriques.', da: 'Er ikke interesseret i teoretiske diskussioner.' }, domain: 'vision', facet: 'prism', reverse: true  },
  // Compass (Liberalism) — o6
  { id: 69,  text: { en: 'Tend to vote for liberal political candidates.', 'es-MX': 'Tiendo a votar por políticos liberales.', 'fr-CA': 'J’ai tendance à promouvoir des valeurs sociales libérales.', 'fr-FR': "J'ai tendance à promouvoir des valeurs sociales progressistes.", da: 'Ser mig selv som mest venstreorienteret.' }, domain: 'vision', facet: 'compass', reverse: false },
  { id: 70,  text: { en: 'Believe that there is no absolute right and wrong.', 'es-MX': 'Creo que no existe el mal o el bien absoluto.', 'fr-CA': "Je crois qu'il n'y a pas de bon ou de mauvais absolu.", da: 'Mener ikke, der er noget absolut rigtigt eller forkert.' }, domain: 'vision', facet: 'compass', reverse: false },
  { id: 71,  text: { en: 'Tend to vote for conservative political candidates.', ca: 'Solc votar candidatures polítiques conservadores.', 'es-MX': 'Tiendo a votar por candidatos políticos conservadores.', 'fr-CA': 'J’ai tendance à promouvoir des valeurs sociales traditionnelles.', de: 'Neige dazu, für konservative politische Kandidaten*innen zu stimmen.', da: 'Ser mig selv som mest højreorienteret.' }, domain: 'vision', facet: 'compass', reverse: true  },
  { id: 72,  text: { en: 'Believe that we should be tough on crime.', 'es-MX': 'Creo que se debe de ser fuertes contra el crimen.', 'fr-CA': 'Je crois que nous devrions être sévères à propos des crimes.', da: 'Synes, vi skal slå hårdt ned på kriminalitet.' }, domain: 'vision', facet: 'compass', reverse: true  },

  // ── BOND (Agreeableness) ────────────────────────
  // Faith (Trust) — a1
  { id: 73,  text: { en: 'Trust others.', ca: 'Confio en els altres.', 'es-MX': 'Confío en los demás.', 'fr-CA': 'Je fais confiance aux autres.', de: 'Vertraue anderen.', da: 'Har tillid til andre.' }, domain: 'bond', facet: 'faith', reverse: false },
  { id: 74,  text: { en: 'Believe that others have good intentions.', ca: 'Crec que els altres tenen bones intencions.', 'es-MX': 'Creo que los demás tienen buenas intenciones.', 'fr-CA': 'Je crois que les autres ont de bonnes intentions.', de: 'Glaube, dass andere gute Absichten haben.', da: 'Tror generelt, andre vil mig det bedste.' }, domain: 'bond', facet: 'faith', reverse: false },
  { id: 75,  text: { en: 'Trust what people say.', 'es-MX': 'Confío en lo que la gente dice.', 'fr-CA': "J'ai confiance en ce que les gens disent.", da: 'Stoler på, hvad andre siger.' }, domain: 'bond', facet: 'faith', reverse: false },
  { id: 76,  text: { en: 'Distrust people.', ca: 'Desconfio de la gent.', 'es-MX': 'Desconfío de la gente.', 'fr-CA': 'Je ne fais pas confiance aux autres.', de: 'Misstraue Menschen.', da: 'Nærer mistillid til andre.' }, domain: 'bond', facet: 'faith', reverse: true  },
  // Edge (Morality) — a2
  { id: 77,  text: { en: 'Use others for my own ends.', 'es-MX': 'Uso a otros para mi propio interés.', 'fr-CA': "J'utilise les autres pour mes propres fins.", da: 'Bruger andre til at opnå mine egne mål.' }, domain: 'bond', facet: 'edge', reverse: true  },
  { id: 78,  text: { en: 'Cheat to get ahead.', 'es-MX': 'Hago trampa para avanzar.', 'fr-CA': 'Je triche pour avancer.', da: 'Snyder for at få et forspring.' }, domain: 'bond', facet: 'edge', reverse: true  },
  { id: 79,  text: { en: 'Take advantage of others.', ca: "M'aprofito dels altres.", 'es-MX': 'Tomo ventaja de los demás.', 'fr-CA': 'Je profite des autres.', de: 'Nutze andere aus.', da: 'Udnytter andre.' }, domain: 'bond', facet: 'edge', reverse: true  },
  { id: 80,  text: { en: "Obstruct others' plans.", 'es-MX': 'Obstaculizo los planes de otros.', 'fr-CA': "J'entrave les plans des autres.", da: 'Stiller hindringer i vejen for andre.' }, domain: 'bond', facet: 'edge', reverse: true  },
  // Gift (Altruism) — a3
  { id: 81,  text: { en: 'Am concerned about others.', 'es-MX': 'Me preocupo por los demás.', 'fr-CA': 'Je me préoccupe des autres.', da: 'Bekymrer mig om andre.' }, domain: 'bond', facet: 'gift', reverse: false },
  { id: 82,  text: { en: 'Love to help others.', 'es-MX': 'Me gusta ayudar a otros.', 'fr-CA': "J'adore aider les autres.", da: 'Elsker at hjælpe andre.' }, domain: 'bond', facet: 'gift', reverse: false },
  { id: 83,  text: { en: 'Am indifferent to the feelings of others.', ca: 'Soc indiferent als sentiments dels altres.', 'es-MX': 'Soy indiferente a los sentimientos de los demás.', 'fr-CA': 'Je suis indifférent aux sentiments des autres.', 'fr-FR': 'Je suis indifférent·e aux sentiments des autres.', de: 'Bin gleichgültig gegenüber den Gefühlen anderer.', da: 'Er ligeglad med andres følelser.' }, domain: 'bond', facet: 'gift', reverse: true  },
  { id: 84,  text: { en: 'Take no time for others.', 'es-MX': 'No tengo tiempo para lo demás.', 'fr-CA': 'Je ne prends pas de temps pour les autres.', da: 'Bruger ikke tid på andres problemer.' }, domain: 'bond', facet: 'gift', reverse: true  },
  // Yield (Cooperation) — a4
  { id: 85,  text: { en: 'Love a good fight.', 'es-MX': 'Me gusta una buena confrontación.', 'fr-CA': "J'adore une bonne bagarre.", da: 'Elsker en god fight.' }, domain: 'bond', facet: 'yield', reverse: true  },
  { id: 86,  text: { en: 'Yell at people.', 'es-MX': 'Grito a la gente.', 'fr-CA': 'Je crie après les gens.', da: 'Råber ad folk.' }, domain: 'bond', facet: 'yield', reverse: true  },
  { id: 87,  text: { en: 'Insult people.', ca: 'Insulto les persones.', 'es-MX': 'Insulto a las personas.', 'fr-CA': "J'insulte les gens.", de: 'Beleidige Menschen.', da: 'Fornærmer folk.' }, domain: 'bond', facet: 'yield', reverse: true  },
  { id: 88,  text: { en: 'Get back at others.', 'es-MX': 'Cuando me la hacen me la pagan.', 'fr-CA': "Je m'en prends aux autres.", da: 'Tager hævn over andre.' }, domain: 'bond', facet: 'yield', reverse: true  },
  // Shadow (Modesty) — a5
  { id: 89,  text: { en: 'Believe that I am better than others.', 'es-MX': 'Creo que soy mejor que otros.', 'fr-CA': 'Je crois être meilleur que les autres.', 'fr-FR': 'Je crois être meilleur·e que les autres.', da: 'Mener, jeg er bedre end andre.' }, domain: 'bond', facet: 'shadow', reverse: true  },
  { id: 90,  text: { en: 'Think highly of myself.', ca: 'Tinc un alt concepte de mi mateix/a.', 'es-MX': 'Pienso muy bien de mí mismo.', 'fr-CA': "J'ai une très grande estime de moi-même.", de: 'Habe eine hohe Meinung von mir selbst.', da: 'Har høje tanker om mig selv.' }, domain: 'bond', facet: 'shadow', reverse: true  },
  { id: 91,  text: { en: 'Have a high opinion of myself.', 'es-MX': 'Tengo una opinión alta de mí mismo.', 'fr-CA': "J'ai une très bonne opinion de moi-même.", da: 'Er meget glad for mig selv.' }, domain: 'bond', facet: 'shadow', reverse: true  },
  { id: 92,  text: { en: 'Boast about my virtues.', ca: 'Presumeixo de les meves virtuts.', 'es-MX': 'Alardeo de mis virtudes.', 'fr-CA': 'Je me vante de mes vertus.', de: 'Prahle mit meinen Vorzügen.', da: 'Praler med mine gode sider.' }, domain: 'bond', facet: 'shadow', reverse: true  },
  // Shield (Sympathy) — a6
  { id: 93,  text: { en: 'Sympathize with the homeless.', ca: 'Em compadeixo de les persones sense llar.', 'es-MX': 'Tengo empatía por las personas sin hogar.', 'fr-CA': 'Je sympathise avec les sans-abri.', 'fr-FR': "J'ai de la sympathie pour les sans-abri.", de: 'Habe Mitgefühl mit obdachlosen Menschen.', da: 'Har sympati for de hjemløse.' }, domain: 'bond', facet: 'shield', reverse: false },
  { id: 94,  text: { en: 'Feel sympathy for those who are worse off than myself.', 'es-MX': 'Siento empatía por aquellos que están más necesitados que yo.', 'fr-CA': "J'ai de la sympathie pour les gens plus démunis que moi.", da: 'Føler sympati for dem, der har det værre end mig selv.' }, domain: 'bond', facet: 'shield', reverse: false },
  { id: 95,  text: { en: "Am not interested in other people's problems.", ca: "No m'interessen els problemes dels altres.", 'es-MX': 'Desinterés en los problemas de los demás.', 'fr-CA': 'Je ne suis pas intéressé par les problèmes des autres.', 'fr-FR': 'Je ne suis pas intéressé·e par les problèmes des autres.', de: 'Interessiere mich nicht für die Probleme anderer.', da: 'Er ikke interesseret i andres problemer.' }, domain: 'bond', facet: 'shield', reverse: true  },
  { id: 96,  text: { en: 'Try not to think about the needy.', 'es-MX': 'Intento no pensar en las personas necesitadas.', 'fr-CA': 'Je tente de ne pas penser aux gens dans le besoin.', da: 'Forsøger at lade være med at tænke på de fattige.' }, domain: 'bond', facet: 'shield', reverse: true  },

  // ── DISCIPLINE (Conscientiousness) ──────────────
  // Mastery (Self-Efficacy) — c1
  { id: 97,  text: { en: 'Complete tasks successfully.', 'es-MX': 'Completo tareas exitosamente.', 'fr-CA': 'Je complète les tâches avec succès.', 'fr-FR': "J'accomplis les tâches avec succès.", da: 'Fuldfører opgaver med success.' }, domain: 'discipline', facet: 'mastery', reverse: false },
  { id: 98,  text: { en: 'Excel in what I do.', 'es-MX': 'Sobresalgo en lo que hago.', 'fr-CA': "J'excelle dans ce que je fais.", da: 'Udmærker mig i de ting, jeg laver.' }, domain: 'discipline', facet: 'mastery', reverse: false },
  { id: 99,  text: { en: 'Handle tasks smoothly.', 'es-MX': 'Realizo las tareas sin problemas.', 'fr-CA': 'Je gère les tâches facilement.', da: 'Håndterer opgaver med lethed.' }, domain: 'discipline', facet: 'mastery', reverse: false },
  { id: 100, text: { en: 'Know how to get things done.', 'es-MX': 'Se cómo hacer las cosas.', 'fr-CA': 'Je sais comment faire avancer les choses.', da: 'Ved, hvordan man får tingene gjort.' }, domain: 'discipline', facet: 'mastery', reverse: false },
  // Structure (Orderliness) — c2
  { id: 101, text: { en: 'Like to tidy up.', 'es-MX': 'Me gusta ordenar y organizar las cosas.', 'fr-CA': "J'aime faire du rangement.", da: 'Kan godt lide at rydde op.' }, domain: 'discipline', facet: 'structure', reverse: false },
  { id: 102, text: { en: 'Often forget to put things back in their proper place.', 'es-MX': 'A menudo olvido poner las cosas en su lugar.', 'fr-CA': "J'oublie souvent de remettre les choses à leur place.", da: 'Glemmer tit at sætte tingene på plads igen.' }, domain: 'discipline', facet: 'structure', reverse: true  },
  { id: 103, text: { en: 'Leave a mess in my room.', ca: 'Deixo la meva habitació desordenada.', 'es-MX': 'Dejo un desorden en mi espacio.', 'fr-CA': 'Je laisse ma chambre en désordre.', de: 'Hinterlasse Unordnung in meinem Zimmer.', da: 'Roder derhjemme.' }, domain: 'discipline', facet: 'structure', reverse: true  },
  { id: 104, text: { en: 'Leave my belongings around.', 'es-MX': 'Dejo mis pertenecías regadas.', 'fr-CA': 'Je laisse traîner mes choses.', da: 'Efterlader mine ting rundt omkring.' }, domain: 'discipline', facet: 'structure', reverse: true  },
  // Oath (Dutifulness) — c3
  { id: 105, text: { en: 'Keep my promises.', ca: 'Compleixo les meves promeses.', 'es-MX': 'Mantengo mis promesas.', 'fr-CA': 'Je tiens mes promesses.', de: 'Halte meine Versprechen.', da: 'Holder mine løfter.' }, domain: 'discipline', facet: 'oath', reverse: false },
  { id: 106, text: { en: 'Tell the truth.', ca: 'Dic la veritat.', 'es-MX': 'Digo la verdad.', 'fr-CA': 'Je dis la vérité.', de: 'Sage die Wahrheit.', da: 'Fortæller sandheden.' }, domain: 'discipline', facet: 'oath', reverse: false },
  { id: 107, text: { en: 'Break rules.', ca: 'Em salto les normes.', 'es-MX': 'Rompo las reglas.', 'fr-CA': "J'enfreins les règles.", de: 'Breche Regeln.', da: 'Bryder reglerne.' }, domain: 'discipline', facet: 'oath', reverse: true  },
  { id: 108, text: { en: 'Break my promises.', 'es-MX': 'Rompo mis promesas.', 'fr-CA': 'Je ne tiens pas mes promesses.', da: 'Bryder mine løfter.' }, domain: 'discipline', facet: 'oath', reverse: true  },
  // Quest (Achievement-Striving) — c4
  { id: 109, text: { en: "Do more than what's expected of me.", 'es-MX': 'Hago más de lo que se espera de mi.', 'fr-CA': "Je fais plus que ce que l'on attend de moi.", da: 'Gør mere, end hvad der forventes af mig.' }, domain: 'discipline', facet: 'quest', reverse: false },
  { id: 110, text: { en: 'Work hard.', ca: 'Treballo dur.', 'es-MX': 'Trabajo duro.', 'fr-CA': 'Je travaille fort.', 'fr-FR': 'Je travaille dur.', de: 'Arbeite hart.', da: 'Arbejder hårdt.' }, domain: 'discipline', facet: 'quest', reverse: false },
  { id: 111, text: { en: 'Put little time and effort into my work.', ca: 'Dedico poc temps i esforç al meu treball.', 'es-MX': 'Invierto poco tiempo y esfuerzo en mi trabajo.', 'fr-CA': "Je mets peu de temps et d'efforts dans mon travail.", de: 'Investiere wenig Zeit und Mühe in meine Arbeit.', da: 'Bruger mindst muligt tid og energi på opgaver.' }, domain: 'discipline', facet: 'quest', reverse: true  },
  { id: 112, text: { en: 'Do just enough work to get by.', 'es-MX': 'Hago el trabajo mínimo para salir adelante.', 'fr-CA': "Je fais juste assez de travail pour m'en sortir.", da: 'Arbejder kun så meget, at jeg lige kan klare mig.' }, domain: 'discipline', facet: 'quest', reverse: true  },
  // Will (Self-Discipline) — c5
  { id: 113, text: { en: 'Am always prepared.', 'es-MX': 'Siempre estoy preparado.', 'fr-CA': 'Je suis toujours préparé.', 'fr-FR': 'Je suis toujours préparé·e.', da: 'Er altid velforberedt.' }, domain: 'discipline', facet: 'will', reverse: false },
  { id: 114, text: { en: 'Carry out my plans.', 'es-MX': 'Llevo a cabo mis planes.', 'fr-CA': 'Je réalise mes objectifs.', da: 'Fører mine planer ud i livet.' }, domain: 'discipline', facet: 'will', reverse: false },
  { id: 115, text: { en: 'Waste my time.', ca: 'Perdo el temps.', 'es-MX': 'Pierdo mi tiempo.', 'fr-CA': 'Je perds mon temps.', de: 'Verschwende meine Zeit.', da: 'Spilder min tid.' }, domain: 'discipline', facet: 'will', reverse: true  },
  { id: 116, text: { en: 'Have difficulty starting tasks.', ca: 'Em costa començar les tasques.', 'es-MX': 'Dificultad para comenzar tareas.', 'fr-CA': "J'ai de la difficulté à commencer les tâches.", de: 'Habe Schwierigkeiten, Aufgaben zu beginnen.', da: 'Har svært ved at gå i gang med opgaver.' }, domain: 'discipline', facet: 'will', reverse: true  },
  // Counsel (Cautiousness) — c6
  { id: 117, text: { en: 'Jump into things without thinking.', 'es-MX': 'Me aviento a hacer cosas sin pensar.', 'fr-CA': 'Je me lance dans les choses sans réfléchir.', da: 'Springer ud i ting uden at tænke mig om.' }, domain: 'discipline', facet: 'counsel', reverse: true  },
  { id: 118, text: { en: 'Make rash decisions.', 'fr-CA': 'Je prends des décisions impulsives.', da: 'Tager forhastede beslutninger.' }, domain: 'discipline', facet: 'counsel', reverse: true  },
  { id: 119, text: { en: 'Rush into things.', ca: 'Em llanço a les coses de cap.', 'es-MX': 'Me precipito a las cosas.', 'fr-CA': "Je me précipite dans l'action.", de: 'Stürze mich kopflos in Dinge.', da: 'Kaster mig ud i ting.' }, domain: 'discipline', facet: 'counsel', reverse: true  },
  { id: 120, text: { en: 'Act without thinking.', ca: 'Actuo sense pensar.', 'es-MX': 'Actúo sin pensar.', 'fr-CA': "J'agis sans penser.", de: 'Handle ohne nachzudenken.', da: 'Handler uden at tænke.' }, domain: 'discipline', facet: 'counsel', reverse: true  },
]

export const FM_SCALE_LABELS = {
  1: 'Very inaccurate',
  2: 'Moderately inaccurate',
  3: 'Neither accurate nor inaccurate',
  4: 'Moderately accurate',
  5: 'Very accurate',
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