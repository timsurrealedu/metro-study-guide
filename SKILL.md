---
name: metro-study-guide
description: Build interactive, offline-ready Metro Engine HTML study guides with ADHD-first visual pacing, Explainer Beats, Plain Intuition before Exam Depth, non-blocking Micro-Checks, animated visual kits, Checkpoints, flashcards, and practice exams. Use when the user asks for a study guide, Metro guide, interactive learning experience, exam prep (UTS, UAS, quiz), or to turn Gemini Notebooks, Google Drive slides/PDFs, or uploaded class materials into a visual study guide.
---

# Metro Study Guide (v2.0)

Create self-contained, offline-ready Metro Engine HTML study guides (`GLOSSARY.md`, `docs/adr/0001`–`0006`) built for learners with ADHD and low reading stamina: **8-year-old Plain Intuition first, visual and interactive up front, 100% exhaustive Exam Depth one tap away.**

## Core Domain Language (`GLOSSARY.md`)

Always use the canonical Metro terms in user-facing UI and prose (never "Part", "Chapter", "Slide", or "Pop quiz"):
- **Guide**, **Line**, **Station**, **Beat**, **Effort Cue**, **Checkpoint**, **Review Line**, **Terminus**
- **Plain Intuition**, **Name It**, **Exam Depth**, **Micro-Check**, **Tap-to-Predict**, **Weak-Spot Queue**

## Workflow

### 1. Unpack the Engine & Read Core Docs

1. Fetch `engine/`, `tools/`, `starter/`, and key `references/` (`03-content-blocks.md`, `04-visual-kits.md`, `05-custom-visuals.md`, `06-quizzes-and-review.md`, `11-subject-playbook.md`, `12-design-rules.md`) into a clean working directory (preserving `engine/`, `tools/`, `starter/`).

### 2. Gather & Reconcile Course Materials (Exhaustive, Zero Skips)

**NotebookLM / Gemini Notebooks (`notebooklm`) is the primary source.** Check every source before planning, and **never skip any part of any source, no matter how small**:
- **Gemini Notebooks (`notebooklm`)**: `list_notebooks` → `list_sources` → query every session/unit/subtopic with `retrieve_relevant_chunks`. Capture minor remarks, edge cases, exceptions, and worked examples.
- **Google Drive / Uploaded Files**: Read all slides/PDFs in matching Drive folders or `user_uploaded_files/`.
- **Coverage Audit & Reconcile**: Map 100% of every source detail to a **Station**'s **Exam Depth** layer, and document source conflicts or unclear items in Review Station `R4`.

### 3. Plan Lines, Stations, Beats & Visuals

- Group topics into 2 to 6 thematic **Lines** plus the `R` **Review Line**, with 3 to 7 **Stations** per **Line** (`"v2": true` in `guide.json`).
- Pick distinct, high-contrast hex colours in `guide.json` (light/dark tokens and contrast are derived automatically).
- Match visuals to the subject using `Kit.*` (`flow`, `cycle`, `timeline`, `graph`, `bars`, `particles`, `derive`, `annotate`, `diagram`, `tree`, `dag`, `dp`, `network`, `trim`, `venn`).

### 4. ADHD-First Station Rhythm & Interactivity Floor

Every **Station** is authored as explicit `<div class="beat">` blocks following **Hook → Play/See First → Name It → Micro-Check → Exam Depth**:

1. **Station Header**: `<p class="bigidea">` in pure **Plain Intuition** (1–2 everyday sentences, zero unexplained jargon). `build.py` auto-computes the **Effort Cue** (`~2 min · N beats`) on the header.
2. **Beat 1 — Play / See First (Visual-First)**:
   - Open with at most 1–2 short `<p>` sentences (≤ 35 words each, max 2 paragraphs before the first `.viz`) + `<p class="lead">`.
   - Put the lead interactive `.viz` immediately up front. Every Station's lead visual MUST invite direct interaction: either hands-on manipulation (`sliders`, `tabs`, clickable toggles/nodes) OR stepped animation with universal `predict` (**Tap-to-Predict**) steps in `E.stepper` / `Kit.*`.
3. **Beat 2 — Name It & Real-Life Bridge**:
   - Attach the official academic term to what the learner just saw using `<div class="nameit"><span class="nameit-badge">Name it</span><b>Exact Term</b><span class="id">istilah</span><span class="nameit-d">Plain-English bridge...</span></div>`.
   - Add `<div class="callout eg"><b>Example</b><div>...</div></div>` with everyday objects (never metro analogies).
   - Add `data-speak="..."` on complex `<span class="m">` math expressions inside **Plain Intuition** so offline Read-Aloud (TTS) reads them naturally.
4. **Beat 3 — Non-Blocking In-Station Micro-Check**:
   - Every counted **Station** MUST have at least 1 non-blocking **Micro-Check** (either `<div class="mcheck">`, a 2–4 item `.drill`/`.sorter`, or `predict:` steps inside `visuals.js`). Never lock Next/Back buttons.
   - Calm, guilt-free feedback only (ADR-0005): crisp checkmarks, encouraging hints, and zero countdown timers, streak-loss penalties, XP, or unsolicited sound effects.
5. **Beat 4 — Progressive Exam Depth (Zero Skips)**:
   - Place formal terminology cards (`<dl class="terms">`), exact formulas, `Kit.derive` step-by-step math, `.proof-tpl` checklists, dense tables, edge cases, and minor lecturer remarks inside inline collapsible `<details class="depth"><summary><b>Formal formula, edge cases &amp; notes</b></summary><div class="depth-body">...</div></details>`.
   - In **Explainer** mode, opening `details.depth` expands inline at 100% readable font size with smooth vertical scroll; the global **Exam Depth** toggle opens all of them for exam cramming.
6. **End-of-Line Traps**: Wrap exam traps in `<div class="traps">` at the end of each Station so `build.py` collects them into the Line **Checkpoint**.

### 5. Author `guide.json`, `content.html`, `quiz.json`, `flash.json`, `visuals.js`

- `guide.json`: `"v2": true`, `id`, `title`, `highlight`, `eyebrow`, `lede`, `terminus`, `lines`. Keep `id` identical when updating an existing guide.
- `content.html`:
  - Wrap each Station screen in `<div class="beat"><h3 data-eb="...">...</h3>...</div>` so **Explainer** steps cleanly one Beat at a time.
  - Keep **Plain Intuition** `<p>` blocks **≤ 35 words** (`check.py` warns over 45 words in v2 guides) and free of raw unexplained notation.
  - Format `Kit.derive` inside **Exam Depth** with `legend`, `[[expr|role|tid]]`, multi-frame `frames`, `op`, and `how`/`tip` drawers.
- `quiz.json`: 2 to 4 questions per station (`"see": "c1-1"`) and 15 to 30 questions marked `"exam": true`, 4–5 options with per-option `[text, isCorrect, why]`, `"e"`, and `"src"`. Missed questions automatically feed the **Weak-Spot Queue**.
- `flash.json`: 2 to 4 cards per station (`{"k": "1.1", "f": "...", "b": "..."}`). Learners track `"Got it"` / `"Still shaky"`; shaky cards resurface and enter the **Weak-Spot Queue**.
- **Review Line (`data-part="R"`)**: `R1` Cheat sheet, `R2` Flashcards (`<div class="flash"></div>`) + `<div class="weak-queue"></div>` (auto-injected by `build.py` if omitted), `R3` Practice exam (`<div class="quiz" data-set="exam"></div>`), `R4` Notes on your materials.

### 6. Check, Build, Verify in Chromium, and Deliver

1. Validate until **0 errors and 0 warnings**:
   ```bash
   python3 tools/check.py guides/<slug>
   ```
2. Build single offline HTML:
   ```bash
   python3 tools/build.py guides/<slug> --out /working_dir/<conv_id>/artifacts/file_generation/ttl=63d/output/<id>.html
   ```
3. Run headless Chromium verification across laptop (`1440x900`), tablet (`820x1180`), and phone (`390x844`) in light and dark modes, Scroll and Explainer, plus `.mcheck` and `details.depth`:
   ```bash
   python3 tools/verify_chromium.py /working_dir/<conv_id>/artifacts/file_generation/ttl=63d/output/<id>.html --shots /tmp/shots
   ```
4. Present the built file via `google:show_file` and summarize the **Lines**, **Stations**, and `R4` notes in chat.

## Gotchas

- **Plain Intuition vs. Exam Depth**: Never leak dense formulas, Big-O proofs, or jargon into Beat 1 opening hooks. Move them into `Name It` + `details.depth` with zero omissions.
- **Fractions & subscripts**: Use stacked `<span class="fr"><span>num</span><span>den</span></span>` or `\\frac{num}{den}` (never horizontal `/`), and wrap full subscripts inside `<sub>...</sub>` or `_{...}`.
- **Every non-depth visual/table/steps/drill needs `<p class="lead">`** immediately before it.
- **No metro analogies in explanations or examples**: Metro theme is strictly navigation and layout.
- **Strict `.mcheck` & `details.depth` markup**: Every `.mcheck` needs `.mc-q` and ≥2 `.mc-opts button` items (at least one `data-ok="1"`, all with `data-why`); every `details.depth` needs `<summary>`.
- **Strict SVG hygiene**: Keep `markerUnits="userSpaceOnUse"`, never pair `pathLength="1"` with `.flowline`/pixel `stroke-dasharray`, keep `zoom: true` + `overview: true` on dense trees/DAGs.
