# Cèrcol — Product Documentation

Instrument map, design decisions, vocabulary, dimension and facet names, role names,
communication style, and brand voice.

Read this file when working on:
- user-facing copy, i18n strings, or locale files
- instrument naming, dimension/facet/role names
- any new instrument or results page
- brand voice or communication style questions

---

## Instrument design decision

All psychometric instruments used in Cèrcol must be free for any use,
including commercial. BFI-2-S was considered but rejected: non-commercial
only. All instruments are based on IPIP (public domain, no restrictions).
Never introduce items from copyrighted instruments (NEO-PI-R, BFI-2, etc.)

---

## Product naming convention

Cèrcol uses lunar phase names for all instruments.
Never expose academic instrument names (TIPI, IPIP, NEO) in user-facing text.
Never use generic names like "test" or "radar" in user-facing text or filenames.

Current instruments:
- "New Moon Cèrcol"      — 10-item quick snapshot (CA: "Cèrcol de Lluna Nova")
- "First Quarter Cèrcol" — 60-item full portrait, 30 facets (CA: "Cèrcol de Quart Creixent")
- "Full Moon Cèrcol"     — 120-item complete portrait + Witness Cèrcol (CA: "Cèrcol de Lluna Plena")

---

## Lunar phase instrument map

Cèrcol uses four lunar phases as instrument names.
Each phase is a standalone user experience with increasing depth.
Witness Cèrcol and ICAR cognitive ability are components of Full Moon,
not standalone phases. Never use "observer" in user-facing text or code
comments — it is Belbin terminology. Always use "Witness" / "Testimoni".

| Phase | Code name    | EN display name         | CA display name               | Instrument                             | Status  |
|-------|--------------|-------------------------|-------------------------------|----------------------------------------|---------|
| 🌑    | NewMoon      | New Moon Cèrcol         | Cèrcol de Lluna Nova          | TIPI — 10 items, 7-point, 5 domains   | Live    |
| 🌓    | FirstQuarter | First Quarter Cèrcol    | Cèrcol de Quart Creixent      | IPIP-NEO-60 — 60 items, 5-point, 30 facets | Live |
| 🌕    | FullMoon     | Full Moon Cèrcol        | Cèrcol de Lluna Plena         | IPIP-NEO-120 + Witness Cèrcol + ICAR g | Live   |
| 🌗    | LastQuarter  | Last Quarter Cèrcol     | Cèrcol de Quart Minvant       | Team report (members FullMoon)         | Planned |

User journey:
NewMoon → FirstQuarter → FullMoon → LastQuarter
(snapshot)  (portrait)   (complete)  (team)

---

## File naming convention

All instrument pages use English phase names as base:
NewMoonPage.jsx, FirstQuarterPage.jsx, FullMoonPage.jsx, LastQuarterPage.jsx
Never use generic names like TestPage.jsx or RadarPage.jsx.

---

## Full Moon + Witness Cèrcol design (definitive)

Full Moon = IPIP-NEO-120 (self-report, 120 items, 5-point Likert)
          + ICAR cognitive ability measure
          + Witness Cèrcol (CA: Testimoni Cèrcol)

### Witness Cèrcol
Adaptive forced-choice adjective selection based on AB5C lexical markers
from the public-domain IPIP item pool (Goldberg). Never called "observer
assessment" in user-facing text or comments.

Flow:
- A person who knows the subject well is given a unique link
- Each round: 5 adjectives shown (one per OCEAN factor); assessor selects
  best fit and worst fit for the subject (forced choice — no Likert scale)
- Forced choice eliminates social desirability bias
- 20 rounds total, fixed 70/30 positive/negative polarity sequence
- Up to 12 Witnesses per subject; scores are averaged across Witnesses

Output of Full Moon + Witness:
- Primary role (self, from IPIP-NEO-120)
- Role consensus (from Witness, averaged across completed Witnesses)
- Convergence score (self vs witness agreement)
- Blind spots: dimensions where self and witness diverge significantly
  (|self_z − witness_z| > 0.8)

### Freemium model (authoritative)

FREE (always):
- New Moon Cèrcol — 10 items, 5 domains, quick snapshot
- First Quarter Cèrcol — 60 items, 5 domains, 30 facets, full portrait

PAID (one-time payment):
- Full Moon Cèrcol — IPIP-NEO-120 + Witness Cèrcol + ICAR cognitive ability;
  definitive role result and team report.
  Stripe infrastructure (checkout endpoint, webhook, premium column) in place.

---

## Dimension names (user-facing)

Applies to all instruments. Internal code keys remain unchanged for research
traceability.

| Academic key                          | Cèrcol name | Valencià    |
|---------------------------------------|-------------|-------------|
| extraversion / Extraversion           | Presence    | Presència   |
| agreeableness / Agreeableness         | Bond        | Vincle      |
| conscientiousness / Conscientiousness | Discipline  | Disciplina  |
| negativeEmotionality / Neuroticism    | Depth       | Profunditat |
| openMindedness / Openness             | Vision      | Visió       |

---

## Facet names (FirstQuarter — 30 facets)

These names apply to both First Quarter and Full Moon (same 30 facets,
same namespace).

### DEPTH (Neuroticism)
| NEO facet          | Cèrcol name | Valencià  |
|--------------------|-------------|-----------|
| Anxiety            | Vigil       | Vigília   |
| Angry Hostility    | Blaze       | Flama     |
| Depression         | Hollow      | Buit      |
| Self-Consciousness | Veil        | Vel       |
| Impulsiveness      | Surge       | Impuls    |
| Vulnerability      | Fracture    | Escletxa  |

### PRESENCE (Extraversion)
| NEO facet          | Cèrcol name | Valencià  |
|--------------------|-------------|-----------|
| Warmth             | Hearth      | Llar      |
| Gregariousness     | Gather      | Aplec     |
| Assertiveness      | Command     | Veu       |
| Activity           | Drive       | Empenta   |
| Excitement-Seeking | Thrill      | Vertigen  |
| Positive Emotions  | Radiance    | Llum      |

### VISION (Openness)
| NEO facet  | Cèrcol name | Valencià  |
|------------|-------------|-----------|
| Fantasy    | Dream       | Somni     |
| Aesthetics | Craft       | Traç      |
| Feelings   | Resonance   | Ressò     |
| Actions    | Drift       | Volta     |
| Ideas      | Prism       | Prisma    |
| Values     | Compass     | Brúixola  |

### BOND (Agreeableness)
| NEO facet             | Cèrcol name | Valencià  |
|-----------------------|-------------|-----------|
| Trust                 | Faith       | Fe        |
| Straightforwardness   | Edge        | Tall      |
| Altruism              | Gift        | Do        |
| Compliance            | Yield       | Cessió    |
| Modesty               | Shadow      | Ombra     |
| Tender-Mindedness     | Shield      | Escut     |

### DISCIPLINE (Conscientiousness)
| NEO facet            | Cèrcol name | Valencià  |
|----------------------|-------------|-----------|
| Competence           | Mastery     | Mestria   |
| Order                | Structure   | Trama     |
| Dutifulness          | Oath        | Pacte     |
| Achievement Striving | Quest       | Cerca     |
| Self-Discipline      | Will        | Voluntat  |
| Deliberation         | Counsel     | Consell   |

---

## Role system (Cèrcol vocabulary)

### Design principles

Cèrcol roles describe how a person moves the balance of a team, not what
kind of person they are. Each role has a profile in Presence/Bond/Vision
space — the three dimensions the team composition literature identifies as
requiring balance. Discipline and Depth modulate how each role is expressed
but do not define team balance by themselves.

The 12 roles cover the six intersections of the three balance dimensions
(P×B, P×V, B×V) at both poles each. Every role name is an animal: concrete,
iconable, culturally readable, and free of hierarchy. No role is better or
worse than another. All are necessary in some team configurations; none is
necessary in all of them.

There is no neutral centre role. A person at the centre of P/B/V space is
better described by their Discipline and Depth values than assigned a role
with no functional content.

See SCIENCE.md for the full scientific grounding, centroid values, and
validation plan.

### Naming constraints for future work
- No animal already used in the 12 roles below
- No animal with strong negative cultural connotation in EN or CA
- Must be iconable with a single recognisable silhouette
- No hierarchy implied between roles

### The twelve roles

| ID  | English  | Valencià | Profile | One-line essence (EN) |
|-----|----------|----------|---------|----------------------|
| R01 | Dolphin  | Dofí     | P+ B+   | When you are in the room, people talk. Not because you ask — because you made it easy. The team warms up with you. |
| R02 | Wolf     | Llop     | P+ B-   | You do not wait for permission. When you see the problem, you say it. The team moves because you do not stay quiet. |
| R03 | Elephant | Elefant  | P- B+   | You do not take up space — you create it. People explain themselves well beside you because they know you are really listening. |
| R04 | Owl      | Mussol   | P- B-   | You see what others miss because you do not need to be at the centre. The distance is useful to you. |
| R05 | Eagle    | Àguila   | P+ V+   | You see far and you move there. You bring the team to places it would not have gone alone. |
| R06 | Falcon   | Falcó    | P+ V-   | It is not vision — it is timing. You know exactly when to move, and when you do, the team notices. |
| R07 | Octopus  | Polp     | P- V+   | The team's best ideas often passed through you first, in silence. You do not always know it yourself. |
| R08 | Tortoise | Tortuga  | P- V-   | You will not make noise. But when you are not there, the team drifts. You are the ground the others build on. |
| R09 | Bee      | Abella   | B+ V+   | Where others see chaos, you see structure. You build bridges between people and ideas no one else would have connected. |
| R10 | Bear     | Ós       | B+ V-   | You do not change under pressure. The team knows you are there, and that knowing frees them to take risks. |
| R11 | Fox      | Guineu   | B- V+   | You see what does not add up — in ideas and in relationships. Your discomfort is productive. |
| R12 | Badger   | Teixó    | B- V-   | You are not interested in what should work. You are interested in what works. The team needs you to stop fooling itself. |

### Role essences (CA)

| ID  | Essència (CA) |
|-----|---------------|
| R01 | Quan tu ets a la sala, la gent parla. No perquè ho demanes — perquè has fet que siga fàcil. L'equip s'escalfa amb tu. |
| R02 | No esperes que ningú done permís. Quan veus el problema, el dius. L'equip avança perquè tu no calles. |
| R03 | No ocupes espai — el crees. La gent s'explica bé al teu costat perquè sap que l'escoltes de veritat. |
| R04 | Veus el que els altres no veuen perquè no necessites estar al centre. La distància t'és útil. |
| R05 | Veus lluny i t'hi mous. Portes l'equip a llocs on no hauria anat sol. |
| R06 | No és visió — és timing. Saps exactament quan moure's, i quan et mous, l'equip ho nota. |
| R07 | Les millors idees de l'equip sovint han passat primer per tu, en silenci. No ho saps ni tu. |
| R08 | No faràs soroll. Però quan no ets, l'equip deriva. Ets el terra sobre el qual els altres construeixen. |
| R09 | On altres veuen caos, tu veus estructura. Construeixes ponts entre persones i idees que ningú hauria connectat. |
| R10 | No canvies per la pressió. L'equip sap que hi ets, i eixe saber els allibera per arriscar. |
| R11 | Veus el que no quadra — en les idees i en les relacions. La teua incomoditat és productiva. |
| R12 | No t'interessa el que hauria de funcionar. T'interessa el que funciona. L'equip et necessita per no enganyar-se a si mateix. |

### Team balance framing

Each role pushes team balance in a specific direction. The user-facing
report must always frame the role as a contribution to team balance,
not as a fixed identity. Recommended framing:

✗ "You are a Wolf."
✓ "Your profile pushes team balance toward initiative and honest confrontation.
   In a team with high Bond, you are the corrective force."

The report also shows which balance directions the user does not cover —
this is as informative as the role itself.

### Notes on specific roles

**Fox and Octopus** are statistically rare profiles (B-V+ and P-V+ run
against natural OCEAN correlations). When a user receives one of these roles,
the report should acknowledge the rarity explicitly — not to make them feel
special, but to explain why they may feel unusual in most team configurations.

**Bear and Tortoise** are the highest-Discipline roles (C component in
centroid). Users in these roles tend to be the most consistent executors in
a team. The report should frame this as reliability and stability, not rigidity.

**Wolf and Fox** carry negative Bond (A-). The report must never frame low
Bond as a flaw. These roles provide the confrontation and critical distance
that high-Bond teams need to avoid groupthink.

---

## Communication style (user-facing copy)

- Warm, direct, and non-clinical tone
- Avoid psychological jargon in results and descriptions
- Frame all dimensions positively: no score is good or bad,
  each reflects a tendency or preference
- Low scores are not failures — describe both ends of each
  dimension as valid and functional
- Keep sentences short. No corporate filler.
- Dimension names use Cèrcol product vocabulary (see above),
  never academic labels in user-facing text
- Role descriptions always frame the role as a team balance contribution,
  never as a personality label

---

## Brand voice

Cèrcol speaks like a knowledgeable friend, not a consultant.
Direct. A little poetic when it counts. Never cold.

Founding phrase (captures the essence):
"Tot suma, ningú no és imprescindible, però tots som necessaris."

### Four principles

**1. GROUNDED**
Real science, never academic tone.
Sources live in the code, not the interface.
✗ "This instrument assesses interpersonal behavioral tendencies."
✓ "See how you show up when it matters."

**2. ALIVE** — short sentences, active verbs, no passive voice
✗ "A tendency toward leadership was detected."
✓ "You tend to take charge. Others follow."

**3. WARM BUT WITH AN EDGE**
We gently challenge, not validate.
Low scores move you away from mediocrity in a different direction.
No sugarcoating with filler: no "amazing", "incredible", "powerful insights."
✗ "Low Discipline may suggest challenges with structure."
✓ "You work best when the goal is clear but the path is yours."

**4. VALENCIAN SOUL**
Born from the land and the collective.
Direct, warm, a hint of provocation, community over competition.
Ask: would this sound right said out loud in Valencian?
If it sounds like a consulting deck, rewrite it.

### Voice examples

✗ "Gain deep insights into your personality profile."
✓ "See yourself more clearly."

✗ "Your Presence score indicates high extraverted tendencies."
✓ "You bring energy into a room. People notice."

✗ "Congratulations on completing the assessment!"
✓ "That's you, in five dimensions."

✗ "Your role is Wolf."
✓ "Your profile pushes the team toward initiative and honest confrontation."