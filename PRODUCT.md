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
- Each round: 4–6 adjectives shown; assessor selects best fit and worst fit
  for the subject (forced choice — no Likert scale)
- Forced choice eliminates social desirability bias
- Algorithm maintains a Bayesian probability distribution over the 9 roles;
  selects the next adjective set to maximise information gain on remaining
  ambiguities
- Stops at convergence or ~20–25 decisions

Output of Full Moon + Witness:
- Primary role (self, from IPIP-NEO-120)
- Role consensus (from Witness, may be multiple witnesses averaged)
- Convergence score (self vs witness agreement)
- Blind spots: dimensions where self and witness diverge significantly

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

Applies to all instruments. Internal code keys remain unchanged for research traceability.

| Academic key                          | Cèrcol name | Valencià    |
|---------------------------------------|-------------|-------------|
| extraversion / Extraversion           | Presence    | Presència   |
| agreeableness / Agreeableness         | Bond        | Vincle      |
| conscientiousness / Conscientiousness | Discipline  | Disciplina  |
| negativeEmotionality / Neuroticism    | Depth       | Profunditat |
| openMindedness / Openness             | Vision      | Visió       |

---

## Facet names (FirstQuarter — 30 facets)

These names apply to both First Quarter and Full Moon (same 30 facets, same namespace).

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
| NEO facet | Cèrcol name | Valencià  |
|-----------|-------------|-----------|
| Fantasy   | Dream       | Somni     |
| Aesthetics | Craft      | Traç      |
| Feelings  | Resonance   | Ressò     |
| Actions   | Drift       | Volta     |
| Ideas     | Prism       | Prisma    |
| Values    | Compass     | Brúixola  |

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

## Role names (Cèrcol vocabulary)

Each role name follows the same design principles as dimension and facet names:
one word, evocative, translates naturally to Valencian, no role sounds better
or worse than another.

| ID | English | Valencian | One-line essence |
|----|---------|-----------|-----------------|
| R0 | Opal    | Opàl      | No fixed role. Present in different ways without ceasing to be you. |
| R1 | Bolt    | Llamp     | You see the exact moment and go for it. When you move, others know it's time. |
| R2 | Beacon  | Far       | You don't invite anyone. People come because it's easy to let their guard down near you. |
| R3 | Thorn   | Espina    | You say what should have been said two meetings ago. Without you, the team sleeps in easy consensus. |
| R4 | Anchor  | Àncora    | When everything shakes, you stay in place. The team notices most when you're not there. |
| R5 | Heron   | Garça     | You listen to what was left unsaid. The team's harmony runs through you without anyone quite knowing. |
| R6 | Anvil   | Enclusa   | Quality is tested at your side. You are the tool that stops the team from fooling itself. |
| R7 | Loom    | Teler     | Where others see loose threads, you see the web. What comes out is better than any of the parts. |
| R8 | Comet   | Cometa    | You don't ask permission to move outside the expected path. The best decisions passed through your angle first. |

Full descriptions (user-facing, Brand voice) live in src/locales/en.json
and src/locales/ca.json under the `roles` namespace.

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
