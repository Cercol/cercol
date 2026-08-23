/**
 * Which version of the instruments produced a stored result.
 *
 * # Spec: docs/policies/dataset-versions.md
 *
 * A score only means something alongside the items that produced it. Change an
 * item, its translation, or the scale it is answered on, and two rows that look
 * identical are answers to different questions. Without a stamp there is no way
 * to tell them apart afterwards, and no way to say "valid up to version N".
 *
 * So every result carries the version of the instruments the respondent
 * actually saw. The client sends it rather than the Worker stamping it,
 * because a visitor on a cached bundle answered the old items: their bundle is
 * the truth about what they were asked, not whatever the Worker was deployed
 * with that morning.
 *
 * This does NOT track norms. Norms are applied when a result is displayed, not
 * when it is stored, and stored scores are raw means on the instrument's own
 * scale (1-5, or 1-7 for New Moon). Renorming changes what a result looks like
 * to its owner; it does not change the data. That is the whole reason to store
 * raw means, and it is why the 2026-08-04 renorming did not bump this number.
 *
 * Bump it, and add an entry to the changelog, when any of these change:
 *   - an item's wording, in any of the six languages
 *   - which items belong to a scale
 *   - the response scale or its labels
 *   - the number or structure of Witness rounds
 *
 * VERSION_HISTORY is newest first; the full record with its reasoning is
 * docs/policies/dataset-versions.md. Summaries in Catalan because their one
 * reader is the operator, same as the plan. Bumping the version IS adding an
 * entry here: the constant is derived from the first row, so the number and
 * its description cannot drift apart.
 */
export const VERSION_HISTORY = [
  {
    version: 7,
    from: '2026-08-22',
    summary:
      "Tot ítem existeix en totes les llengües: cap lector es troba una frase en anglés dins d'un test triat en una altra llengua (passava en danés a 7 ítems i en castellà a 10). Els 17 que cap editor havia traduït mai són de Cèrcol i estan declarats a CERCOL_SUPPLIED, primers a substituir si els editors responen. Quatre defectes superficials del danés publicat de Vedel, corregits, i la regla que ho ordena: la redacció és de l'editor i no es toca mai; l'ortografia es corregeix.",
  },
  {
    version: 6,
    from: '2026-08-22',
    summary:
      "Cap llengua a mitges en anglés: els 59 ítems de Lluna Plena i 26 de Primer Quart que faltaven ara tenen català i alemany, escrits per filòleg contra l'anglés i el joc existent. Tres filòlegs van concloure per separat que 'liberal' en català, francés i alemany anomena el centredreta pro-mercat, quasi el contrari del constructe: tots tres diuen 'progressista'. Quatre defectes de l'alemany anterior trobats i corregits pel camí.",
  },
  {
    version: 5,
    from: '2026-08-22',
    summary:
      "Una llengua pot tindre més d'una varietat i el resultat guarda quina es va respondre. El francés n'ofereix dues: fr-CA (Gravel tal com el va publicar) i fr-FR (adaptació europea de 40 cadenes de 180, que és el que Thiry i Piolti descriuen sense publicar). El castellà porta es-MX, l'única que existeix. La clau: en francés europeu 'libéral' llig com a pro-mercat, així que fr-FR diu 'progressistes'; i 'sympathiser avec' volia dir fer-se amic, no compadir-se.",
  },
  {
    version: 4,
    from: '2026-08-22',
    summary:
      "El francés i el castellà deixen de ser traduccions nostres: cada cadena francesa és la traducció publicada de Gravel (IPIP-NEO-300) i cada castellana la mexicana de Frez Puente i Ortega Luque (IPIP-NEO-120), verbatim. Dos defectes publicats que no es copien: el seu 'rush decisions' (errata de 'rash') i tres ítems francesos que la taula de Gravel té transposats i que, presos tal qual, puntuaven un conservador com a alt en Liberalisme.",
  },
  {
    version: 3,
    from: '2026-08-22',
    summary:
      "Els instruments passen a ser els que citen: Lluna Plena és l'IPIP-NEO-120 de Johnson i Primer Quart l'IPIP-NEO-60 de Maples-Keller, ítem per ítem des de src/data/reference/; els 21 ítems que no existien en cap llista IPIP desapareixen. L'escala passa d'acord a exactitud, que és com es van recollir les normes, amb els cinc punts verbalitzats. El danés esdevé el de Vedel publicat. Res no creua esta frontera: una resposta v1 i una v3 són preguntes diferents en escales diferents. (La v2 prevista per a una correcció francesa i danesa va ser superada per esta reconstrucció i mai es va publicar amb eixe contingut.)",
  },
  {
    version: 2,
    from: '2026-08-22',
    summary:
      "El català, corregit per filòleg: dels 190 ítems, 70 tenien defecte i 14 eren bloquejants — un ítem mesurava el constructe equivocat ('No m'embarbusso' feia de la Franquesa fluïdesa de parla), paraules que no existeixen, dues varietats barrejades dins del mateix banc, i 40 dels 60 ítems compartits amb redaccions diferents entre instruments. Les altres cinc llengües no es toquen: només les files catalanes deixen de ser comparables, i n'hi havia dues.",
  },
  {
    version: 1,
    from: '2026-06-01',
    summary:
      "Els quatre instruments tal com es van llançar: Lluna Nova (10 ítems, 1–7), Primer Quart (60, 1–5), Lluna Plena (120, 1–5) i Testimoni (13 rondes de 3), tot del banc IPIP de domini públic en sis llengües. Tota fila recollida abans del 22/08/2026 porta esta versió, reomplida per worker/schema/004: els fitxers d'ítems no havien canviat des de l'inici de la recollida.",
  },
]

export const INSTRUMENT_VERSION = VERSION_HISTORY[0].version
