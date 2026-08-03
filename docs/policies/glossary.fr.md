# Translation glossary: fr

GENERATED FILE. Do not edit by hand: run `python3 scripts/build_glossary.py`.
The source of truth is `src/locales/fr.json`, the same file the running
app renders. If a term here looks wrong, fix the locale, not this file.

## Dimensions

Always use the target-language name in running text. The academic Big Five
term may appear once in parentheses on first mention, for search visibility.

| English | fr |
|---|---|
| Bond | Lien |
| Depth | Profondeur |
| Discipline | Discipline |
| Presence | Présence |
| Vision | Vision |

## Team roles

These twelve, no others. The canonical list lives in
`src/utils/role-scoring.js`; anything not on it does not exist.

| English | fr |
|---|---|
| Dolphin | Dauphin |
| Wolf | Loup |
| Elephant | Éléphant |
| Owl | Hibou |
| Eagle | Aigle |
| Falcon | Faucon |
| Octopus | Pieuvre |
| Tortoise | Tortue |
| Bee | Abeille |
| Bear | Ours |
| Fox | Renard |
| Badger | Blaireau |

## The Witness

The peer-rating concept, in the target language's own word for it.
Never "observer" in any language: `Beobachter`, `observador`,
`observateur` are wrong when they name this concept, and fine when a
cited study genuinely means an observer.

| English | fr |
|---|---|
| Witness | Témoin |
| Witnesses | Témoins |

## Instrument names

Use exactly the form the app uses for this language, shown below.
Whether these should be translated at all is an open product question:
English keeps them as brand names, every other locale translates them.
Until that is settled, match the app so the blog and the interface agree.

| English | fr |
|---|---|
| New Moon Cèrcol | Cèrcol de Nouvelle Lune |
| First Quarter Cèrcol | Cèrcol de Premier Quartier |
| Full Moon Cèrcol | Cèrcol de Pleine Lune |
| Last Quarter Cèrcol | Dernier Quartier Cèrcol |

## Required in English, for search

On the blog only, never in the app interface: Big Five, OCEAN, IPIP, NEO,
AB5C, DISC, MBTI, HEXACO.

This includes the five Big Five factor names when they appear as
academic terms: Openness, Conscientiousness, Extraversion, Agreeableness,
Neuroticism. They stay English in running text and in figure labels.
Cèrcol's own dimension names, in the table at the top of this file, are
the ones that go in the target language. The two are different things:
Bindung is a Cèrcol dimension, Agreeableness is the academic factor it
maps onto.
