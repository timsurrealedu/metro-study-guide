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
- `references/`: `02-file-structure.md`, `03-content-blocks.md`, `04-visual-kits.md`, `05-custom-visuals.md`, `06-quizzes-and-review.md`, `07-theme-and-colours.md`, `11-subject-playbook.md`, `12-design-rules.md`

## Workflow

### 1. Unpack the Engine & Read Core Docs

1. Fetch the bundled files from `engine/`, `tools/`, `starter/`, and key `references/` (`03-content-blocks.md`, `04-visual-kits.md`, `05-custom-visuals.md`, `06-quizzes-and-review.md`, `11-subject-playbook.md`, `12-design-rules.md`) using `get_skill_resources`.
2. Write them into a clean temporary directory in the VM (e.g., `/tmp/metro-engine/`), preserving `engine/`, `tools/`, and `starter/`.

### 2. Gather & Reconcile Course Materials

Check all relevant user sources before planning:

- **Gemini Notebooks (`notebooklm`)**: Call `notebooklm:list_notebooks` to find matching course notebooks (e.g., `Sem3-AI-UAS`, `Sem3-NetPen-UTS`, `Sem3-ADA-UTS`, `Sem3-ComPhys-UTS`, `Sem2-CompNet-UTS`, `Sem1-CSF-UAS`). Call `notebooklm:list_sources` on the target notebook, then run multiple targeted `notebooklm:retrieve_relevant_chunks` queries across every session, unit, and learning outcome so no topic is missed.
- **Google Drive (`drive`)**: Search for course folders or slides (e.g., `UAS`, `UTS`, `.pptx`, `.pdf`) with `drive:search_files` and read/download relevant files.
- **Uploaded Files**: Read all pages or slides of any files in `user_uploaded_files/`.
- **Reconcile**: Record exact lecturer terms, formulas, examples, and any conflicts or unclear points between sources to document in Review station `R4 Notes on your materials`.

### 3. Plan Lines, Stations, and Visuals

- Group topics into 2 to 6 thematic lines plus the `R` Review line, with 3 to 7 stations per line (one exam topic per station).
- Pick distinct, high-contrast hex colours for each line in `guide.json` (light and dark variants and contrast are derived automatically).
- Match visuals to the subject using `Kit` calls (`Kit.flow`, `Kit.cycle`, `Kit.timeline`, `Kit.graph`, `Kit.bars`, `Kit.particles`, `Kit.derive`, `Kit.annotate`, `Kit.diagram`).

Subject-specific visual patterns for college CS and Cyber Security:

- **AI & Machine Learning**: `Kit.flow` for fuzzy inference pipelines and search; `Kit.graph` with sliders for membership functions, activation curves, and regression lines; `Kit.derive` for Tsukamoto/Mamdani, ID3 entropy/information gain, and backpropagation; `Kit.diagram` for neural network layers and MDP grid worlds.
- **Cyber Security & Networking**: `Kit.flow` for attack chains, pentest phases, and TLS/TCP handshakes; `Kit.diagram` for network topologies, OSI/TCP-IP layers, and attack surfaces; `Kit.derive` for subnetting/CIDR and RSA/crypto math; short `<pre><code>` blocks for CLI commands.
- **Algorithms, Math, Physics, Stats**: `Kit.flow` for flowcharts; `Kit.bars` for sorting steps and complexity comparisons; `Kit.derive` for recurrences, traces, and proofs; `Kit.graph` for functions and distributions.
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
python3 tools/new.py guides/<slug> "<Title>" --lines <n> --id <unique-id>
```

Author the files in `guides/<slug>/`:

- `guide.json`: `id`, `title`, `highlight`, `eyebrow`, `lede`, `terminus`, and `lines` (names + hex colours). Keep `id` identical when updating an existing guide so browser progress is preserved.
- `content.html`: Use the engine shorthands. Structure each station as:
  1. `<p class="bigidea">` (1 to 2 sentences)
  2. `<dl class="terms">` with `<b>exact term</b>` and `<span class="id">Indonesian term</span>` where helpful
  3. Visuals (`.viz`) each preceded by `<p class="lead">`
  4. Comparison tables (`<div class="tbl-wrap"><table class="tbl">` with an empty first `<th>`)
  5. `<ol class="steps">` or `Kit.derive` for worked examples
  6. Plain, real-life `<div class="callout eg"><b>Example</b><div>...</div></div>` (never metro-themed)
  7. `<div class="traps">` containing `<div class="callout trap">` items (automatically collected into the line's collapsible checkpoint)
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
- Never put traps or quizzes directly inside stations as standalone blocks; always wrap traps in `<div class="traps">` so `build.py` moves them to the line checkpoint.
- Use `references/02-file-structure.md`, `references/04-visual-kits.md`, and `references/05-custom-visuals.md` for exact JSON keys, `Kit.*` signatures, and `V.tween`/`E.stepper` APIs rather than guessing.
