# 11 · Subject playbook

How a Metro guide should look for each subject. The engine is the same everywhere;
what changes is how the syllabus is cut into lines and stations, which blocks carry
the content, and which visuals fit. Chemistry and Maths come first because they are
next; every other subject follows the same pattern.

## The recipe for every subject

**Lines** = the big units of the syllabus (usually the teacher's chapters or the exam
topic list), 2–6 lines, plus the review line. **Stations** = one exam topic or one
lesson each, 3–7 per line, each readable in about 10 minutes.

**A station, in order:**

| # | Block | Label (`data-eb`) | Notes |
|---|---|---|---|
| 1 | Big idea | — | 1–2 sentences, plain words |
| 2 | Terms | In plain words | Exact teacher terms + local terms |
| 3 | The visual | See it / Graph / Timeline / Read it | Lead first: what to watch for |
| 4 | Comparison table | Compare | Every "difference between" is a table |
| 5 | Steps or worked example | Steps / Worked example / The method | The process or method, each step with its reason |
| 6 | Example callout | (inside a section) | One real-life example, not themed |
| 7 | Practice block (optional) | Sort it / Try it | Sorter or a slider to play with |
| 8 | Traps | — | `<div class="traps">`, 1–3 per station |

Then 2–4 questions per station in `quiz.json` (`see`), 2–4 flashcards, and the line's
checkpoint is automatic. Not every station needs every block: a short station can be
big idea + visual + table + traps.

**Section labels** used across subjects: In plain words · See it · Compare · Steps ·
The method · Worked example · Graph · Timeline · Causes · Read it · Primary source ·
Who · Sort it · Try it · Why it happens · Exam focus · From your practicum.

## Quick matrix: which kits each subject uses most

| Subject | flow | cycle | timeline | graph | bars | particles | derive | annotate | diagram | tables |
|---|---|---|---|---|---|---|---|---|---|---|
| Chemistry | ●● | ● | | ●● | ● | ●● | ●●● | | ●● | ●●● |
| Mathematics | ● | | | ●●● | ● | | ●●● | | ●● | ●● |
| Physics | ● | ● | | ●●● | ● | ●● | ●●● | | ●●● | ●● |
| Biology | ●● | ●● | ● | ● | ● | ● | | | ●●● | ●●● |
| History | ●● | | ●●● | | ● | | | ●●● | ● | ●● |
| Civics (PPKn) | ●●● | ● | ● | | ● | | | ●●● | ● | ●●● |
| Religion | ● | ● | ●● | | | | | ●●● | | ●●● |
| English | ●● | | ● | | | | | ●●● | | ●●● |
| Bahasa Indonesia | ●● | | | | | | | ●●● | | ●●● |
| Geography | ●● | ●●● | | ●● | ●● | | | | ●●● | ●● |
| Economics | ●● | ●● | | ●●● | ●● | | ●● | ● | | ●● |
| Sociology | ●● | ● | ● | | ●● | | | ●● | | ●●● |
| Informatics | ●●● | ● | | ● | ● | | ● | ● | ●● | ●● |

●●● central · ●● often · ● sometimes

---

## Chemistry

**Lines:** by unit, e.g. *Atomic structure & bonding · Stoichiometry · Rates &
equilibrium · Acids & bases · Redox & electrochemistry · Organic*.

**Stations:** one concept or calculation type each (Collision theory; Factors
affecting rate; Equilibrium & Le Chatelier; Kc and Kp; pH of strong acids; …).

**Visuals:**
- `Kit.particles` for anything about particles: collision theory, temperature,
  concentration, catalysts, gas pressure, diffusion, dynamic equilibrium (two kinds
  reacting both ways).
- `Kit.graph` for concentration–time, volume of gas–time, Maxwell–Boltzmann-style
  curves, titration curves (pH vs volume), energy profiles (a function with a hump;
  a dashed second curve for the catalysed path).
- `Kit.derive` for every calculation type: moles, limiting reagent, % yield,
  concentration, pH, Kc, cell potential. One worked example per type, with `[[ ]]`
  on what changes each line.
- `Kit.flow` for methods (the mole map; titration procedure; naming organic
  compounds) and reaction pathways.
- `Kit.bars` for comparing amounts (moles from the same mass, bond energies, ΔH).
- `Kit.diagram` for apparatus (electrolysis cell, titration set-up) and structures
  (orbitals, molecular shapes), with parts lighting up.

**Tables:** element vs compound; strong vs weak acid; endo vs exothermic; galvanic vs
electrolytic cell; isomer types. **Chips** (`.m`) for formulas and ions.

**Traps:** catalyst used up; faster = more product; equilibrium means equal
concentrations; skipping the mole ratio; sign of ΔH; units (cm³ vs dm³).

**Questions:** calculations with 4 numeric options whose wrong answers are the
common slips (ratio skipped, divided the wrong way, units).

## Mathematics

**Lines:** by topic, e.g. *Functions · Quadratics · Trigonometry · Sequences &
series · Calculus · Statistics & probability*.

**Stations:** one technique or one idea (Completing the square; The discriminant;
Chain rule; Normal distribution …).

**Visuals:**
- `Kit.graph` is the main visual: sliders for parameters (a, b, c; amplitude and
  period; gradient and intercept), steps that move one parameter at a time, `mark`
  for roots, turning points, intersections (with `x` as a function of the sliders),
  a second dashed function for comparison (f and f′, before and after a
  transformation).
- `Kit.derive` for every method: factorising, the quadratic formula, solving
  simultaneous equations, differentiating, integrating, proof steps. `why` says the
  rule used; `~~ ~~` shows cancelling; `final: true` boxes the answer.
- `Kit.diagram` for geometry (triangles, the unit circle, angle rules) with parts
  lighting up; `Kit.bars` for data and distributions; `Kit.flow` for decision
  procedures ("which integration method?").

**Tables:** D > 0 / = 0 / < 0; types of transformation; derivative rules; the
probability rules.

**Traps:** dropping ±; sign of b; forgetting + C; dividing by zero; degree vs
radian mode; confusing P(A and B) with P(A or B).

**Questions:** a mix of "which graph", "next line of the working", and final
answers. Put formulas in `<b>` or use `Kit.math` text.

## Physics

**Lines:** *Kinematics · Forces & Newton's laws · Energy & momentum · Waves ·
Electricity · Magnetism · Modern physics*.

**Visuals:** `Kit.graph` for s–t, v–t, a–t (slope and area), I–V characteristics, wave
displacement (sliders for amplitude/frequency); `Kit.diagram` for free-body diagrams,
circuits, ray diagrams, field lines; `Kit.particles` for gases and pressure;
`Kit.derive` for every SUVAT/energy/circuit calculation; a custom visual for motion
(the strobe ball in the gallery is the template).

**Tables:** scalar vs vector; series vs parallel; transverse vs longitudinal;
the SUVAT equations and when to use each.

**Traps:** balanced forces ≠ at rest; mass vs weight; current "used up"; sign
conventions; units and prefixes.

## Biology

Bio Metro (`examples/bio-metro`) is the full reference: custom visuals for processes,
`diagram`-style labelled structures (seed, enzyme, mitochondrion, chloroplast),
comparison tables everywhere, practicum notes, the teacher's terms with Indonesian
terms. With the kit: `cycle` (Krebs, Calvin, cell cycle), `flow` (respiration stages,
protein synthesis), `diagram` (cells, organs), `graph` (enzyme activity vs
temperature/pH), `bars` (ATP yields).

---

## History (Sejarah)

**Lines:** periods or themes, e.g. *Colonialism · National awakening · Japanese
occupation · Independence & revolution · Guided democracy · New Order ·
Reformasi*, or for world history *Causes of WWI · The war · Peace treaties*.

**Stations:** one event, turning point or theme each.

**Station recipe:**
1. Big idea: what happened and why it matters, in two sentences.
2. **Timeline** (`Kit.timeline`): the key dates in order; each step adds one event
   and says what it changed. Use `scale: "time"` for spans of years.
3. **Causes** (`Kit.flow`, branching): long-term causes → trigger → event →
   consequences. Several boxes can feed one.
4. **Who** (`.grid2` cards or a table): key people and groups, what they wanted.
5. **Primary source** (`Kit.annotate`): a short public-domain quote, speech, treaty
   clause or document extract the teacher used; notes on language, purpose and point
   of view; a `note` callout on **provenance** (who, when, why, how reliable).
6. **Compare** (table): two sides, two periods, before vs after.
7. Example callout: a link to something the student knows today.
8. Traps: trigger vs cause; wrong date order; mixing similar names; presentism.

**Questions:** date order, cause/effect, "which source supports…", provenance.
**Flashcards:** date → event, term → meaning, person → role.

## Civics (PPKn / Pendidikan Pancasila)

**Lines:** *Pancasila · UUD 1945 & the constitution · State institutions · Rights
and duties · Law and justice · National integration · Indonesia in the world*.

**Station recipe:**
1. Big idea.
2. **Terms** with the exact legal terms in Indonesian (`span.id`), English beside.
3. **Process** (`Kit.flow`): how a law is made, how an election works, how a case
   goes through court, judicial review at the Constitutional Court. The gallery's
   "How a law is made" station is the template.
4. **Article** (`Kit.annotate`): the exact wording of the UUD article or law clause,
   with notes on what each phrase means. Cite the article and paragraph
   ("Pasal 20 ayat (5)").
5. **Who does what** (table or `.grid2`): institutions, their powers, how members
   are chosen.
6. **Sort it**: functions into institutions, rights vs duties, examples into sila.
7. Example callout: a real, neutral, everyday situation.
8. Traps: which body approves vs proposes; numbers (30 days, 5 years, ⅔ quorum);
   confusing similar institutions (MPR/DPR/DPD; MA/MK/KY).

**Rule:** stay factual and neutral; follow the teacher's materials and the current
law; date anything that can change ("as of the 2002 amendment").

## Religion (Pendidikan Agama)

Religion classes follow one faith, its own scripture, translation and terms. The guide
**follows the teacher's materials exactly** and stays respectful; it explains, it does
not argue.

**Lines:** the units of the class syllabus (e.g. faith, worship, ethics/akhlak,
scripture study, history of the community, contemporary issues).

**Station recipe:**
1. Big idea.
2. **Terms**: the faith's own terms (Arabic, Sanskrit, Greek, Hebrew, Pali …) with
   the Indonesian term and a one-line meaning.
3. **Scripture** (`Kit.annotate`): the verse or passage the teacher uses, **in the
   class's translation**, with the reference; notes on key words, context and the
   lesson drawn from it. Keep quotes short.
4. **Practice** (`Kit.flow` or `ol.steps`): the order of a ritual or practice, each
   step with its meaning, exactly as taught.
5. **Compare** (table): related practices, obligatory vs recommended, conditions.
6. **Timeline**: the history of the community or the life of a key figure.
7. **Cycle**: a yearly calendar of observances.
8. Example callout: how the teaching applies in daily life (school, family).
9. Traps: confusing similar terms, conditions and exceptions, the order of steps.

The gallery's "Golden Rule across traditions" station shows the layout with a
multi-faith comparison; a class guide normally uses one tradition.

## English

**Lines:** *Reading · Grammar · Vocabulary · Writing · Literature* (or by text type:
narrative, report, exposition, discussion, explanation, news item, review).

**Station recipe:**
1. Big idea: the purpose of the text type or the grammar point.
2. **Model text** (`Kit.annotate`): a short text (written for the guide, or a
   public-domain one) with the structure marked: orientation, complication,
   resolution; thesis, arguments, reiteration; with the language features
   highlighted (tense, connectives, passive voice).
3. **Structure** (`Kit.flow`): the generic structure of the text type, step by step.
4. **Grammar** (table): form and use, with right/wrong examples (`td.yes`/`td.no`).
   Use `Kit.derive` to transform a sentence one step at a time (active → passive,
   direct → reported speech).
5. **Sort it**: fact vs opinion, formal vs informal, tense identification.
6. Literature: poems and extracts with `Kit.annotate` (the gallery's Ozymandias is
   the template: device + effect in every note); `Kit.timeline` for plot.
7. Traps: wrong tense in the text type, "device without effect", false friends.

**Questions:** reading comprehension (main idea, reference "it refers to…", word in
context), grammar choice, text structure. **Flashcards:** vocabulary with an example
sentence.

## Bahasa Indonesia

Same layout as English with Indonesian text types (teks eksposisi, argumentasi,
negosiasi, laporan hasil observasi, cerpen, puisi, hikayat, …): `Kit.annotate` for
struktur and kaidah kebahasaan, `Kit.flow` for struktur teks, tables for perbandingan
jenis teks, sorters for fakta/opini and kalimat baku/tidak baku. The guide can be
written in Indonesian: set `"lang": "id"` in `guide.json`.

## Geography

**Lines:** *Lithosphere · Atmosphere & climate · Hydrosphere · Biosphere ·
Population · Regional development · Maps & GIS*.

**Visuals:** `Kit.cycle` for every cycle (water, rock, carbon, demographic
transition); `Kit.bars` for shares and population data; `Kit.graph` for climate
graphs and population growth; `Kit.diagram` for landforms, plate boundaries, map
reading (a simplified SVG map with regions that light up); `Kit.flow` for processes
(weathering → erosion → deposition; disaster mitigation stages).

**Tables:** plate boundary types; climate types; push vs pull factors.
**Traps:** clouds as vapour; weathering vs erosion; birth rate vs growth rate.

## Economics

**Lines:** *Scarcity & choice · Markets · Money & banking · National income ·
Government policy · International trade · Accounting (if taught)*.

**Visuals:** `Kit.graph` for supply and demand (sliders shift the curves; the
equilibrium mark moves; the gallery's station is the template), cost curves, the
Phillips curve; `Kit.cycle` for the circular flow of income and the business cycle;
`Kit.bars` for budgets, GDP components, price indices; `Kit.derive` for calculations
(elasticity, GDP, inflation, journal entries); `Kit.flow` for policy transmission.

**Tables:** shift vs movement; fiscal vs monetary policy; market structures.
**Traps:** own price never shifts its own curve; nominal vs real; stock vs flow.

## Sociology

**Lines:** *Social interaction · Groups · Social change · Social research ·
Inequality · Community empowerment*.

**Visuals:** `Kit.flow` for processes (socialisation, research steps), `Kit.bars`
for survey data, `Kit.annotate` for case studies and interview extracts, sorters to
classify examples into concepts. **Tables** for every typology (types of groups,
conflict, mobility). **Traps:** similar terms (asimilasi vs akulturasi), examples
that fit two categories.

## Informatics

**Lines:** *Computational thinking · Algorithms & programming · Data · Networks ·
Information systems · Social impact*.

**Visuals:** `Kit.flow` for algorithms and flowcharts (decisions as branching
edges with labels "yes"/"no"); `Kit.derive` for tracing an algorithm line by line or
converting number bases; `Kit.bars` for sorting algorithm steps (values change per
step; `hi` marks the compared pair); `Kit.diagram` for network topologies. Code in
`<pre><code>` blocks inside a section (keep them short).

## Arts and other subjects

Use the same recipe: terms, a visual (a `diagram` of a composition, a `timeline`
of movements, `annotate` for a critique), comparison tables, steps for techniques.
Images of artworks go in `assets/` only when the teacher provided them or they are in
the public domain.

---

## Language of the guide

- Simple English (or Indonesian), short sentences, no idioms.
- **Exact teacher terms**, with the class-language term next to the English one
  (`<span class="id">`), at least on first use.
- Where materials disagree, follow the teacher, and add a `note` in R4 saying what
  differs.
- Flag anything unclear in the materials instead of guessing.
