# Changelog

## Metro Engine v1.5 — 26 November 2026

**Cohesive semantic color-coding, interactive anatomy inspectors, animated trees, and smart comparison tables across all visuals.**

- **Unified Semantic Continuity (`engine/metro.js`, `engine/metro.css`)**:
  - Extended the comparison palette to `--c5` (amber) and `--c6` (sky) for 5–6 column comparison tables and multi-series visuals.
  - Generalized `setMathFocus` across `.sec` containers so hovering or tapping a legend badge, `.m-tok`, `.t-chip`, table header/row, or SVG feature highlights every matching semantic role (`v`, `c`, `f`, `g`, `r`, `k`, `a`) across equations, graphs, diagrams, flows, trees, and tables simultaneously.
- **Smart Interactive Tables (`engine/metro.js`, `engine/metro.css`)**:
  - Added `.tbl-bar` above comparison tables (`.cmp`) with **column spotlight** pills (plus clickable column headers) and an automatic **Differences** toggle that dims identical rows so differences stand out at a glance.
  - Added `.t-chip[data-role]`, `.t-bar` animated progress meters, `.tbl .mid` amber status cells, `<small>` criterion/header hints, and `tr[data-role]` / `th[data-role]` row and column role accents.
- **Interactive Visual Anatomy & Purpose Inspector (`engine/kit.js`)**:
  - Added `.k-legend` shape-and-color key pills and `.k-use` plain-English "what this part does" inspector across `Kit.graph`, `Kit.diagram`, `Kit.flow`, `Kit.cycle`, `Kit.timeline`, `Kit.bars`, and `Kit.tree`.
- **Upgraded Visual Kits (`engine/kit.js`)**:
  - **`Kit.graph`**: Added semantic `zones`, hatched `shade` (`pattern: "hatch"`), Riemann sample-point dots, pulsing `mark` targets, diamond `dots`, per-vector colored arrowheads, opaque `pillSvg` labels (zero stroke-piercing), axis arrowheads, and an interactive live curve probe.
  - **`Kit.flow` & `Kit.diagram` & `Kit.cycle` & `Kit.timeline` & `Kit.bars`**: Added node `kind` badges (`start`, `input`, `process`, `decision`, `output`, `error`, `end`), left semantic accent bars, opaque edge-label pills with auto `Yes`/`No` coloring, clickable node/part/stage jump-to-step, animated timeline progress fill, and bar target thresholds + step delta badges.
- **New `Kit.tree` (`engine/kit.js`, `tools/check.py`)**:
  - Responsive decision, search, and hierarchy trees (tidy top-down Bezier layout on wide screens; indented cladogram on narrow screens), progressive branch draw-in, root-to-active ancestry path pulse, animated `prune` branch slashes, and interactive ancestry hover.
- **Explainer & Verification (`engine/explainer.js`, `tools/verify_chromium.py`)**:
  - Fixed Explainer `squeeze()` so SVG visuals scale cleanly instead of clipping, and added `Kit.tree` + new SVG classes to `check.py` and `verify_chromium.py`.
- **New showcase guide**: `guides/visual-systems-studio` (**Visual Systems Studio** — Graphs, Architecture Diagrams, Flows, Feedback Cycles, Decision Trees, Minimax Alpha-Beta Pruning, and 5-Column Comparison Tables).

## Metro Engine v1.4 — 25 November 2026

**Photomath-inspired animated math tutorials, semantic equation color-coding, and synced visualizers.**

- **Unified TeX & semantic color engine (`engine/metro.js`)**: `parseTex` and `formatMath` now power `.eq`, inline `<span class="m">`, `Kit.derive`, quizzes, and flashcards from a single parser.
  - Added semantic role tokens `[[expr|role]]` / `[[expr|role|tid]]` (`v`/`var` blue, `c`/`coef` amber, `f`/`fn` violet, `g`/`grp` teal, `r`/`res` green, `k`/`bad` rose, `a`/`acc` sky, `s`/`stay` neutral untouched stay) with interactive hover/tap cross-highlighting and `.eq-legend` / `legend` pills.
  - Added multi-frame differential math animations (`frames` with `from` cloning/distributing, `strike` horizontal sweeps, merge pops, and untouched `s`-token stability) with inline **`‹` / `↻ n/N` / `›`** step-frame controls.
  - Added depth-colored brackets (`()[]{}`), italic math variables, stacked limits on `\int`, `\sum`, `\prod`, `\lim`, nth roots `\sqrt[n]{x}`, `\binom{n}{k}`, `\abs{x}`, `\vec{v}`, `\dot{x}`, and `\dd{x}`.
  - Added expandable `details.eq-why` explanation drawers inside `.eq` blocks.
- **Photomath-style `Kit.derive` (`engine/kit.js`)**:
  - Added `op` operation bridges between lines, clickable step rows, expandable **How** (`how`) and **Why** (`tip`: `title`, `body`, `rule`, `watch`) drawers with smooth CSS Grid `0fr -> 1fr` reveal, and 60fps WAAPI FLIP term-transfer animations (`tid`).
  - Added synchronized visualizers right beside the steps via `graph` (`mountGraph`) or custom `visual` (`{alt, vb, svg, render}`), stacking cleanly on narrow screens and sitting side-by-side on wide containers.
- **Upgraded `Kit.graph`**: Added animated curve draw-on (`drawOn`), `tangents` (with slope readout and optional rise/run triangle), live `riemann` sum rectangles (`left`/`right`/`mid`), and `vectors`, with strict SVG label clamping.
- **Accessible 60fps motion**: Removed `filter: blur()` from `.kd li.later`, added keyboard Arrow/Space navigation inside visuals, tactile press feedback, and tiered `prefers-reduced-motion` / `data-motion="off"` handling.
- **New showcase guide**: `guides/math-photomath-demo` (**Math Studio** — Algebra, Chain Rule, Riemann Sums, Matrices, and Complex Equations).

## Metro Engine v1.3 — 23 November 2026

**Drills: hands-on practice written in plain HTML** (made for BI Metro, the Grade 12
Bahasa Indonesia PSAS guide). See [06](docs/06-quizzes-and-review.md#drills-v13).

- `<div class="drill order">`: put items in order. Drag the dotted handle, tap two rows
  to swap, or move a focused row with the arrow keys. Check / Show answer / Shuffle.
- `<div class="drill cloze">`: fill in the blanks from a word bank with distractors
  (`data-extra`), other accepted answers (`data-alt`) and a rule per blank (`data-why`).
  Tap a word then a blank, or drag. Check / Show answers / Reset.
- `<div class="drill spot">`: find the mistakes. Wrap each mistake in
  `<s data-fix="…" data-why="…">`; every other word is tappable, wrong taps are counted,
  each find shows the fix and the rule. Show all / Reset.
- `<div class="drill match">`: pair terms with meanings by tap or drag. Reset.
- Dragging uses pointer events with a floating copy, scrolls the page near the top and
  bottom edges, and never selects text; tap always works too.
- Explainer: drills are compact; a split drill keeps its word bank in view; drill
  actions refit the screen; swipes and arrow keys inside a drill don't change screens.
- `check.py` validates drills (kind, items, blanks, mistakes, pairs, sizes) and counts
  them as blocks that need a `p.lead`.
- New example: `examples/bi-metro` (BI Metro: 5 lines, 20 stations, 17 drills).
  The gallery gained an order drill (3.2) and a cloze drill (5.1).
- Existing guides rebuild unchanged apart from the version marks.

## Metro Engine v1.2 — 22 November 2026 (update)

**Explainer screens now fit every window without scrolling** (phones, tablets,
laptops, both orientations). See [08](docs/08-modes.md#fitting-v12-no-screen-ever-scrolls).

- Wide screens: a visual's caption, player and sliders sit under the text in the left
  column; the picture gets the right column.
- Narrow screens: sliders that don't fit move to a **Try it yourself** sheet.
- Stepped visuals taller than the screen (worked examples, Horner tables, flows) show
  a window that follows the current step.
- The drawing shrinks before the words do; zoom floors raised (74–90 %).
- Last resort: the screen splits into parts (**More** / Back, "part 1 of 2").
- Checkpoints become short screens: traps two at a time, then the quiz.
- Fitting reruns on visual steps, quiz answers, `details` toggles and resize.
- **Full-screen button** in the scroll top bar and the explainer top bar.
- Where a browser can't go full screen (iPhone, in-app views) the button switches to a focus view: the top bar folds away and a small Exit button stays in the corner.
- The sidebar button only shows on screens wide enough for the sidebar (≥ 1100 px).
- Title highlight box no longer touches the line above when the title wraps.
- Table row hover now shows in dark mode.
- A small "by @Dvenmc" line at the bottom of the Options sheet.
- **Fix:** quiz reasons were visible before answering (`.opt .why` overrode `[hidden]`).
  Now every option's reason appears after you answer.
- Measured: Math Metro (209 screens) at 1280×800, 1366×680, 820×1180, 1180×820,
  390×844 and 375×667, and Bio Metro (160 screens) at 1280×800, 820×1180 and 390×844:
  no screen scrolls.

### Earlier in v1.2

`Kit.graph` can now draw everything a maths exam on functions and integrals needs
(made for Math Metro, the Grade 12 Advanced Maths PSAS guide):

- **Vertical and horizontal lines**: `vlines: [{x, label, dash}]` and
  `hlines: [{y, label, dash}]` for asymptotes (x = a, y = b) and integral bounds.
- **Open and closed endpoint dots**: `dots: [{x, y, fn, open}]` (○ not included,
  ● included) for piecewise, floor and ceiling graphs.
- **Jumps**: `domain: [a, b]` on a function draws one piece only; `breaks: [x…]` (or
  `"int"`) lifts the pen at a jump, so step graphs and rational graphs are never joined
  by vertical strokes. Pieces are sampled a hair inside their ends.
- **Shaded areas**: `shade: {fn, fn2?, from, to, label, color}` (or a list) fills under
  a curve or between two curves, under the axes, with a centred label.
- A step can replace any of the four (`steps[].shade`, `dots`, `vlines`, `hlines`).
- Curves are sampled per piece at about one point per pixel.
- New CSS (kit block only): `.k-vl`, `.k-dot`, `.k-dot.open`, `.k-shade`.
- Gallery: station 2.1 shows both (`k-pieces`, `k-area`). Docs: [04](docs/04-visual-kits.md).
- New example: `examples/math-metro` (the full Math Metro guide), including an HTML
  custom visual (`MM.horner`, an animated Horner table).
- Bio Metro rebuilds byte-for-byte identical apart from the version marks (it does not
  use the kit). Existing `Kit.graph` calls need no changes.

## Metro Engine v1.1 — 22 November 2026 (update)

- **Scroll button in explainer mode.** The way back to the scroll page no longer hides
  in Options: a **Scroll** button now sits next to **Options**, sharing one capsule
  on the right of the explainer top bar (still three items in the bar, so no extra
  clutter). It leaves the explainer at the same station. On very narrow phones
  (≤ 340 px) both show as icons, with accessible names.
- Explainer **Stations** and **Options** buttons got `aria-label`s for the
  icon-only layout.
- Version marks updated in the engine files. No content or API changes: guides built
  with v1 rebuild unchanged apart from the explainer top bar.

## Metro Engine v1 — 22 November 2026

First standalone release, extracted from the Bio Metro study guide (its "engine v3").
Bio Metro rebuilt on v1 is pixel-identical to the published v13 in 97 regression
screenshots (laptop, tablet and phone; light and dark; every UI state), apart from
one animated frame that never matches twice.

### Works for any subject and any number of lines
- **Line colours come from `guide.json`.** One hex colour per line; the build derives
  every light and dark token from it and checks contrast (white text on the line colour
  ≥ 4.5 : 1; text colour on the paper ≥ 4.8 : 1). Exact tokens can still be set by hand
  (`tokens`), which is how Bio Metro keeps its original colours.
- **Metro map for any number of lines** (tested with 1, 2, 3, 4, 5 and 7). Up to three lines bend onto one diagonal (the Bio
  look). With four or more, each line enters the interchange at its own height, so the
  diagonals run side by side, and station labels keep clear of neighbouring lines.
  Phones stack lines in blocks of three, joined by dashed transfers.
- **Boot screen and title card are generated**: the boot animation draws one track per
  line, the stripe on the title card has one band per line.
- **Terminus name** (`"terminus": "PSAS"`) and the highlighted title word are settings.

### Lighter and quicker to write
- **Shorthands** (all optional, docs/03): part openers from `data-` attributes, chapter
  headers and footers generated, callout icons added, and traps written inside each
  station (`<div class="traps">`) are collected into an automatic **checkpoint** at the
  end of each line.
- **Sorters in plain HTML**: `<div class="sorter" data-bins="A|B">` with one `<p>` per item.
- **`quiz.json` shorthand**: `"see": "c1-1"` plus `"exam": true` instead of a `sets`
  list; ids are optional.
- **Visual kit** (`kit.js`): nine ready-made, data-driven visuals (flow, cycle,
  timeline, graph, bars, particles, derive, annotate, diagram). They draw at the real
  width of their box, so phone versions have real-size text instead of a shrunken
  laptop drawing.
- **Smaller files**: the CSS was pruned (99 dead selectors and 347 overridden
  declarations removed, 115 KB → 91 KB), CSS comments are stripped at build time, and
  the kit is left out when a guide does not use it.
- **Works offline**: the Google Fonts link is gone. SF Pro (the system font on Apple
  devices) is used where available; everything else falls back to the system UI font.
  The font loader still lets a reader drop in any font file.

### Tools
- `tools/new.py` (new guide from the starter), `tools/check.py` (validator),
  `tools/build.py` (builder), `tools/shots.js` (screenshots + layout report),
  `tools/docshots.js` (documentation pictures), `tools/cssprune.py` (maintenance).

### Fixes
- Empty quiz sets and an empty `flash.json` no longer stop the page from loading; they
  show a short "nothing here yet" note instead.
- Full-page builds set `body{margin:0}` (Bio Metro relied on its host for this).
- Legend badges on the map no longer stretch into ovals when a line name wraps.
- A duplicated `rangeFill`/`segSet` block in the runtime was removed.
- HTML comments in `content.html` can mention tags safely (they are removed before the
  shorthands run).

### Carried over from Bio Metro v13 (unchanged behaviour)
Progress sidebar, single scrollable page, metro map, light/dark/auto, Animations switch,
font loader, notebook dotted paper, Keychron-style greys with one colour per line,
subtle glass only, light visual boxes in light mode, step players on every visual,
one question at a time, collapsible checkpoints, labelled controls, closable sheets,
boot screen and mode picker, the explainer mode.
