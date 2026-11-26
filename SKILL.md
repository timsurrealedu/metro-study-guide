---
name: metro-study-guide
description: Build interactive, offline-ready Metro Engine HTML study guides with animated visual kits, Scroll and Explainer modes, line checkpoints, flashcards, and practice exams. Use when the user asks for a study guide, Metro guide, interactive learning experience, exam prep (UTS, UAS, quiz), or to turn Gemini Notebooks, Google Drive slides/PDFs, or uploaded class materials into a visual study guide.
---

# Metro Study Guide

Create self-contained, interactive Metro Engine HTML study guides tailored to college courses (including BINUS Cyber Security, CS, math, and general education) using Gemini Notebooks, Google Drive materials, or uploaded files, mirroring the Bio Metro baseline in look, animation, and pedagogy.

## When to Use

- User asks to create, update, or port a Metro study guide or interactive learning experience.
- User asks for an exam prep guide (UTS, UAS, quiz) from a Gemini Notebook, Drive folder, or uploaded slides/PDFs.
- User wants to add a new visual kit or modify an existing Metro guide.

## Bundled Engine, Tools & Reference Files

- `engine/`: `boot.html`, `explainer.js`, `kit.js`, `metro.css`, `metro.js`
- `tools/`: `new.py`, `check.py`, `build.py`, `verify_chromium.py`, `cssprune.py`, `shots.js`
- `starter/`: `content.html`, `flash.json`, `guide.json`, `quiz.json`, `style.css`, `visuals.js`
- `references/`: `01-overview.md`, `02-file-structure.md`, `03-content-blocks.md`, `04-visual-kits.md`, `05-custom-visuals.md`, `06-quizzes-and-review.md`, `07-theme-and-colours.md`, `08-modes.md`, `09-responsive.md`, `10-build-and-check.md`, `11-subject-playbook.md`, `12-design-rules.md`, `13-accessibility-and-storage.md`, `14-troubleshooting.md`

## Workflow

### 1. Unpack the Engine & Read Core Docs

1. Fetch the bundled files from `engine/`, `tools/`, `starter/`, and key `references/` (`03-content-blocks.md`, `04-visual-kits.md`, `05-custom-visuals.md`, `06-quizzes-and-review.md`, `11-subject-playbook.md`, `12-design-rules.md`) using `get_skill_resources`.
2. Write them into a clean temporary directory in the VM (e.g., `/tmp/metro-engine/`), preserving `engine/`, `tools/`, and `starter/`.

### 2. Gather & Reconcile Course Materials (Exhaustive, Zero Skips)

**NotebookLM / Gemini Notebooks (`notebooklm`) is the primary source.** Check all relevant user sources before planning, and **do not skip any part of any source, no matter how small or seemingly unimportant**:

- **Gemini Notebooks (`notebooklm`)**:
  1. Call `notebooklm:list_notebooks` to find matching course notebooks (e.g., `Sem3-AI-UAS`, `Sem3-NetPen-UTS`, `Sem3-ADA-UTS`, `Sem3-ComPhys-UTS`, `Sem2-CompNet-UTS`, `Sem1-CSF-UAS`).
  2. Call `notebooklm:list_sources` on the target notebook to get the complete inventory of every source (slides, PDFs, notes, readings, transcripts).
  3. Query **every single source and every session/unit/subtopic** with multiple targeted `notebooklm:retrieve_relevant_chunks` calls. Explicitly check for minor sections, side notes, edge cases, exceptions, background remarks, small definitions, and worked examples—nothing in any source may be omitted.
- **Google Drive (`drive`)**: Search for course folders or slides (e.g., `UAS`, `UTS`, `.pptx`, `.pdf`) with `drive:search_files` and read/download any additional or matching files.
- **Uploaded Files**: Read all pages or slides of any files in `user_uploaded_files/`.
- **Coverage Audit & Reconcile**: Before planning stations, verify every source from `list_sources` and every detail inside it is mapped to a station. Record exact lecturer terms, formulas, examples, and any conflicts or unclear points between sources to document in Review station `R4 Notes on your materials`.

### 3. Plan Lines, Stations, and Visuals

- Group topics into 2 to 6 thematic lines plus the `R` Review line, with 3 to 7 stations per line (one exam topic per station).
- Pick distinct, high-contrast hex colours for each line in `guide.json` (light and dark variants and contrast are derived automatically).
- Match visuals to the subject using `Kit` calls (`Kit.flow`, `Kit.cycle`, `Kit.timeline`, `Kit.graph`, `Kit.bars`, `Kit.particles`, `Kit.derive`, `Kit.annotate`, `Kit.diagram`, `Kit.tree`).

Subject-specific visual patterns for college CS and Cyber Security:

- **AI & Machine Learning**: `Kit.flow` for fuzzy inference pipelines and search; `Kit.tree` for ID3 decision trees and Minimax/Alpha-Beta pruning; `Kit.graph` with `zones`, `role`, and sliders for membership functions, activation curves, bias-variance, and regression lines; Photomath-style `Kit.derive` (with `[[expr|role|tid]]` color roles, `legend`, multi-frame `frames`, `op` bridges, and `how`/`tip` drawers) for Tsukamoto/Mamdani COG, MDP expected utility, ID3 entropy/information gain, and backpropagation; `Kit.diagram` (with `parts` metadata) for neural network layers and MDP grid worlds.
- **Cyber Security & Networking**: `Kit.flow` (with `kind` and `role` badges) for attack chains, pentest phases, and TLS/TCP handshakes; `Kit.tree` for attack trees and firewall decision trees; `Kit.diagram` for network topologies, OSI/TCP-IP layers, and attack surfaces; Photomath-style `Kit.derive` (`[[expr|role|tid]]`, `frames`, `legend`, `how`/`tip`) for subnetting/CIDR and RSA/crypto math; short `<pre><code>` blocks for CLI commands.
- **Algorithms, Math, Physics, Stats**: `Kit.flow` (with `equiv` for reductions) for flowcharts/pipelines; `Kit.tree` (with `board`, `hud`, `memo`) for recursion/backtracking/branch-and-bound/SDD trees; `Kit.dag` for layered expression/reduction DAGs; `Kit.dp` (`1d`, `2d`, `interval`, `bitmask`, `rolling`) for DP tables; `Kit.network` (`sat`, `parens`, `hud`) for DFS/BFS/Kahn/Dijkstra/Bellman-Ford/Metric TSP/3-SAT gadgets; `Kit.trim` for Subset-Sum FPTAS; `Kit.venn` for Complexity Venn diagrams; `Kit.bars`, `Kit.derive`, `Kit.graph`, `<ol class="proof-tpl">`, and `table.tbl[data-filter]`.
- **Humanities, Civics, Indonesian, Law**: `Kit.annotate` for close reading of articles/texts; `Kit.timeline` for historical/legal sequence; `.sorter` for classification and fact-vs-opinion checks.

### 4. Animations & Interactive Simulators (Mirroring Bio Metro)

To match the Bio Metro baseline, visuals must feel alive and interactive rather than static:

- **Animated step players everywhere**: Every visual has **Start over / Back / Play / Next** controls (`Kit.*` or `E.stepper`) and respects the global **Animations** toggle.
- **Smooth custom SVG animations**: When a kit does not fit, use `E.stepper` + `V` (`V.tween(ms, fn)`, `V.sm`, `V.lerp`, `E.flow`, `E.tickers`, SVG `stroke-dashoffset` draw-ins, and CSS `transform`/`opacity` transitions). Always use theme tokens (`var(--c1)`..`var(--c4)`, `var(--pc)`, `var(--fg)`, `var(--surf)`) so visuals adapt to both light and dark modes.
- **Interactive "TRY IT" parameter simulators**: Include at least 1 to 2 interactive parameter simulators per line on quantitative or multi-factor stations:
  - Use `Kit.graph` with `sliders` (`{id, label, min, max, step, val}`) for live curves and thresholds.
  - Or build a custom `.viz` with `.ctl` range sliders (`E.rangeFill(rng)`) and `.segc` segmented tab buttons (`role="group"`, `aria-pressed="true"`), plus `.readout` and `.tally` chips (mirroring Bio Metro station 2.5's tabbed rate-of-reaction simulator).

### 5. Scaffold & Author the Guide

Run from `/tmp/metro-engine/`:

```bash
python3 tools/new.py guides/<semester>/<subject> "<Title>" --lines <n> --id <unique-id>
```

#### Explanation Voice & Pedagogy (Kindergarten-Teacher Clarity, Complete Detail)

- **Teach like a patient teacher explaining to a kindergartener**: Use very basic, everyday words and short, concrete sentences. Never assume prior knowledge or skip steps ("obviously", "simply", "it follows").
- **Be as detailed as possible without walls of text**: Cover 100% of every source—including small remarks, edge cases, exceptions, and background details—by breaking rich explanations into multiple short `<p>` blocks (under ~60 words each), `<ol class="steps">`, or `<details class="more">` fold-outs.
- **Always define complex terms and give context**: Whenever a technical term, acronym, or jargon word appears:
  1. Explain the idea in plain, simple words *first*, then introduce `<b>exact term</b>` (plus `<span class="id">local term</span>` when helpful).
  2. Add a clear, plain-English definition in `<dl class="terms">` (`<div data-role="..."><b>exact term</b><span class="d">…</span></div>`) along with **relevant context**, and highlight key concepts inline with `<b data-role="v|c|f|g|r|k|a">term</b>` + `<em>italic</em>` cues so prose stays scannable and visually linked.
  3. Pair abstract ideas with a concrete, real-world `<div class="callout eg"><b>Example</b><div>...</div></div>` (using everyday objects/situations—never metro analogies).
- **Show every step of math & logic (`Kit.derive` Standard)**: Across every quantitative subject (Math, AI/ML, Physics, Chemistry, Stats, Cyber), author every `Kit.derive` with:
  1. `legend` + semantic color roles `[[expr|role|tid]]` (`v` var, `c` coef/weight, `f` fn, `g` group/inner, `r` result, `k` cancel, `s` untouched stay).
  2. Meaningful multi-frame `frames` (`dur: 1450–1750`, `from` for copies/distributions, `strike` + `~~...~~` for cancellations on **both** sides) so operations animate step by step instead of cramming long arithmetic onto a single static `m` line.
  3. `op` transform bridges and expandable `how` / `tip` (`rule`, `watch`, `body`) drawers explaining the rule behind every move.

#### Files in `guides/<slug>/`

- `guide.json`: `id`, `title`, `highlight`, `eyebrow`, `lede`, `terminus`, and `lines` (names + hex colours). Keep `id` identical when updating an existing guide so browser progress is preserved.
- `content.html`: Use the engine shorthands. Structure each station as:
  1. `<p class="bigidea">` (1 to 2 plain-English sentences)
  2. Plain-words explanation (`<p>` blocks) + `<dl class="terms">` with `<b>exact term</b>`, plain definition, and context
  3. Visuals (`.viz`) each preceded by `<p class="lead">`
  4. Comparison tables (`<div class="tbl-wrap"><table class="tbl">` with an empty first `<th>`)
  5. `<ol class="steps">` or `Kit.derive` for worked examples
  6. Plain, real-life `<div class="callout eg"><b>Example</b><div>...</div></div>` (never metro-themed)
  7. Optional hands-on `.drill` blocks (`order`, `cloze`, `spot`, `match`) preceded by `<p class="lead">`
  8. `<div class="traps">` containing `<div class="callout trap">` items (automatically collected into the line's collapsible checkpoint)
- `quiz.json`: 2 to 4 questions per station (`"see": "c1-1"`) and 15 to 30 questions marked `"exam": true`, using 4 to 5 options (`A-E`) per question. Every option needs `[text, isCorrect, why]`, plus `"e"` explanation and `"src"` source label.
- `flash.json`: 2 to 4 cards per station (`{"k": "1.1", "f": "...", "b": "..."}`).
- `visuals.js`: `Kit.*` and `E.stepper` + `V` calls matching the `.viz` IDs in `content.html`.
- Review line (`data-part="R"`): `R1` Cheat sheet (compressed tables, formulas, orders), `R2` Flashcards (`<div class="flash"></div>`), `R3` Practice exam (`<div class="quiz" data-set="exam"></div>`), `R4` Notes on your materials (source disagreements and unclear points).

### 6. Check, Build, Verify in Chromium, and Deliver

1. Validate until **0 errors and 0 warnings**:

```bash
python3 tools/check.py guides/<slug>
```

2. Build directly to the workspace output directory as a self-contained offline HTML file:

```bash
python3 tools/build.py guides/<slug> --out /working_dir/<conv_id>/artifacts/file_generation/ttl=63d/output/<id>.html
```

3. Run the automated headless-Chromium check across laptop (`1440x900`), tablet (`820x1180`), and phone (`390x844`) in both light and dark modes (plus Explainer mode):

```bash
python3 tools/verify_chromium.py /working_dir/<conv_id>/artifacts/file_generation/ttl=63d/output/<id>.html --shots /tmp/shots
```

Fix any sideways scrolling, clipped SVG text, small phone tap targets, or JS errors until `verify_chromium.py` passes cleanly.
4. Present the built HTML file to the user via `google:show_file` (opens in Canvas and supports offline download).
5. In chat, briefly list the lines and stations included, plus any unclear points or source disagreements flagged in `R4`.

## Gotchas

- Format all divisions in math formulas as stacked fractions (`<span class="fr"><span>num</span><span>den</span></span>` in HTML or `\\frac{num}{den}` in `Kit.derive`), never horizontal `/`.
- Group full subscripts/superscripts inside `<sub>...</sub>` or `_{...}` (e.g. `∑<sub>s'</sub>`, not `∑<sub>s</sub>'`).
- Keep paragraphs under 60 words (`check.py` warns over 90); never create walls of text on phones.
- Every visual, table, and steps block must have a `<p class="lead">` immediately before it.
- Never put metro analogies inside explanations or examples; the metro motif is strictly for navigation and layout.
- Always tag every `Kit.derive` calculation with semantic color roles (`[[expr|role|tid]]`), `legend`, multi-frame `frames` (never one long static overflow line), `op`, and `how`/`tip` drawers (`check.py` warns if any are omitted).
- Never put traps or quizzes directly inside stations as standalone blocks; always wrap traps in `<div class="traps">` so `build.py` moves them to the line checkpoint.
- Always write `<dl class="terms">` with `<div data-role="..."><b>Term</b><span class="d">Definition</span></div>` cards, never bare `<dt>`/`<dd>` tags (`check.py` warns).
- Use `<code>` for API/code identifiers (`Kit.dag`, CLI flags) and keep `<span class="m">` strictly for mathematical expressions.
- Never combine `pathLength="1"` with `.flowline` or pixel `stroke-dasharray` (causes blinking/stretched dashes); use `--plen` real pixel lengths (`prepEdgeLengths`) and `markerUnits="userSpaceOnUse"` on all SVG `<marker>` elements so arrowheads stay flush and unscaled.
- For dense parse-dependency trees (`Kit.tree` with `deps`) and layered DAGs (`Kit.dag`), keep the focus camera enabled (`zoom` defaults on) and end with an `overview: true` step so learners can inspect details zoomed in or switch to `Overview`.
- Highlight key prose concepts with `<b data-role="v|c|f|g|r|k|a">` and `<em>` so prose stays scannable and cross-highlights with diagrams and tables on both desktop and mobile.
- Use `references/02-file-structure.md`, `references/04-visual-kits.md`, and `references/05-custom-visuals.md` for exact JSON keys, `Kit.*` signatures, and `V.tween`/`E.stepper` APIs rather than guessing.
