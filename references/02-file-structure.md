# 02 · Files

## The zip

```
metro-engine-v1/
├── README.md               start here
├── CHANGELOG.md
├── engine/                 the engine (edit only to change every guide)
│   ├── metro.css           all styles: tokens, layout, blocks, visuals, map, explainer, kit
│   ├── metro.js            runtime: navigation, map, themes, progress, players, quizzes, cards, sorter, font loader
│   ├── kit.js              V helpers (always) + the visual kit (only when a guide uses Kit.)
│   ├── explainer.js        boot screen logic, mode picker, explainer mode
│   └── boot.html           boot screen and picker markup ({{PLACEHOLDERS}} filled by build.py)
├── tools/
│   ├── build.py            guide folder → one HTML file
│   ├── check.py            validator
│   ├── new.py              new guide from starter/
│   ├── shots.js            screenshots + layout report (Playwright)
│   ├── docshots.js         rebuilds docs/img + docs/visual-guide.html (Playwright)
│   └── cssprune.py         maintenance: remove unused CSS from engine/metro.css
├── starter/                minimal guide to copy
├── examples/
│   ├── gallery/            demo: every block and kit, 9 subjects, 5 lines
│   └── bio-metro/          Bio Metro on this engine
│       ├── original/           the original Bio Metro source files and build (v13)
│       ├── source-materials/   the teacher's PDFs the guide was written from
│       └── design-references/  the notebook guide, sketch and feedback screenshots
└── docs/                   these documents, visual-guide.html, img/
```

## A guide folder

```
my-guide/
├── guide.json      required
├── content.html    required
├── quiz.json       optional (questions)
├── flash.json      optional (flashcards)
├── visuals.js      optional (visuals)
├── style.css       optional (extra CSS for this guide only)
├── assets/         optional (images: <img src="assets/x.png"> is inlined at build)
└── out/            created by build.py
```

## guide.json reference

```json
{
  "id": "chem-pas-2026",
  "title": "Chem Metro",
  "highlight": "Metro",
  "icon": "Chem",
  "eyebrow": "Grade 12 Chemistry · PAS 2026",
  "lede": "14 stations on four lines, then one review line to the exam.",
  "subtitle": "Chemistry PAS · Grade 12 · 14 stations",
  "description": "Chemistry PAS study guide, Grade 12",
  "terminus": "PAS",
  "lang": "en",
  "checkpoints": true,
  "checkpointText": "The traps the exam sets and a few questions for each station on this line. Open one station at a time.",
  "lines": {
    "1": { "name": "Reaction rates", "color": "#cf450e" },
    "2": { "name": "Equilibrium", "color": "#1b79cd" },
    "R": { "name": "Review", "color": "#0b7285" }
  }
}
```

| Key | Required | Used for |
|---|---|---|
| `id` | yes | File name of the build and the **storage key** for progress. Lowercase, digits, dashes. Change it and saved progress starts fresh. |
| `title` | yes | Boot screen, title card, sidebar, tab title. |
| `highlight` | no | One word of the title shown on a dark label ("Bio **Metro**"). |
| `icon` | no | Not used by v1 (kept so older guide.json files still validate). |
| `eyebrow` | no | Small caps line above the title (boot screen and title card). |
| `lede` | no | Sentence under the title. HTML allowed. |
| `subtitle` | no | Under the guide name in the sidebar and sheets. |
| `description` | no | `<meta name="description">`. |
| `terminus` | no | Name on the end-of-line sign (default `Exam`). |
| `lang` | no | `<html lang>` (default `en`). |
| `checkpoints` | no | `false` turns off the automatic checkpoints. |
| `checkpointText` | no | The big idea line of every automatic checkpoint. |
| `lines` | yes | One entry per part, keyed by its `data-part`. `R` is the review line. Order = map order. |
| `lines.X.name` | yes | Line name (map legend, sidebar). |
| `lines.X.color` | yes | 6-digit hex. Too light for white text → the build darkens it and warns. |
| `lines.X.tokens` | no | Exact overrides: `light`/`dark` objects with `p f d on on2 s l t`, `viz` (`light`/`dark` with `pc pt`, or `null`), `grad` `[top, bottom]`. See [07](07-theme-and-colours.md). |

## The built file

`out/<id>.html` is a complete page: `<!doctype html>`, inlined CSS and JS, inlined
images, nothing loaded from the internet. With `--fragment` it is the same without
`<html>`/`<head>`/`<body>` (for hosts that add their own page skeleton, such as a
Claude artifact).

Order inside the page:

```
<title>, meta
<style>  metro.css (+ kit CSS if used) + generated line tokens + style.css
boot screen (from boot.html)
<main>  title card + map placeholder + content.html (expanded)
<script> window.GUIDE, window.QUIZ, window.FLASH
<script> metro.js
<script> kit.js (V helpers; Kit only if used)
<script> visuals.js
<script> explainer.js
```

## IDs and naming conventions

| Thing | Pattern | Example |
|---|---|---|
| Part section | `part-<key>` (generated if missing) | `part-2` |
| Chapter | `c<line>-<n>` | `c2-3` |
| Review chapters | `r-<name>` | `r-cheat`, `r-cards`, `r-exam`, `r-notes` |
| Checkpoint (auto) | `cp-<key>` | `cp-2` |
| Kit visual | `k-<name>` | `k-molemap` |
| Custom visual | `v-<name>` | `v-strobe` |
| Element inside a custom visual | short prefix of the visual | `st-mode`, `gl-day` |

IDs must be unique across the whole guide.
