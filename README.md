# Metro Engine v1.3

The engine behind **Bio Metro**, cleaned up so any subject can use it. You write the
content (HTML blocks, a few JSON files and short visual calls); the engine builds one
self-contained HTML study guide with:

- a **boot screen** and a **mode picker**: *Scroll* (the whole guide on one page) or
  *Explainer* (full screen, one idea at a time, built around the visual);
- a **metro map** overview and a **metro-route sidebar** (each part is a coloured line,
  each chapter a station, a review line runs to the exam);
- **light / dark / auto** themes, an **Animations** switch, a **font loader**;
- **step visuals** with Play / Back / Next, **checkpoints** (traps + quizzes) at the end
  of each line, **flashcards**, a **practice exam**, **sorters**;
- **drills** (v1.3): drag into order, fill in the blanks, find the mistakes, match pairs;
- progress saved in the browser; works offline; phones, tablets and laptops.

![The demo guide](docs/img/03-title-map.png)

## Quick start (3 commands)

Needs Python 3.8 or newer. Nothing to install.

```bash
python3 tools/new.py my-guide "Chem Metro" --lines 3   # copy the starter
# … write my-guide/content.html, quiz.json, flash.json, visuals.js …
python3 tools/check.py my-guide                         # find mistakes
python3 tools/build.py my-guide                         # → my-guide/out/<id>.html
```

Open the built file in a browser, or publish it as a Claude artifact.
To make a guide **with Claude**, give Claude this zip and the separate
`metro-guide-prompt.md` (fill in the blanks at the top).

## What is in this folder

| Path | What it is |
|---|---|
| `engine/` | The engine: `metro.css`, `metro.js`, `kit.js`, `explainer.js`, `boot.html`. You normally never edit these. |
| `tools/build.py` | Builds a guide folder into one HTML file. |
| `tools/check.py` | Checks a guide folder for errors and house-rule breaks. |
| `tools/new.py` | Starts a new guide from `starter/`. |
| `tools/shots.js` | Screenshots + layout report (sideways scrolling, text out of frame). Needs Playwright. |
| `tools/docshots.js` | Rebuilds the pictures in `docs/img` and `docs/visual-guide.html`. |
| `tools/cssprune.py` | Maintenance: removes unused CSS from the engine. |
| `starter/` | A minimal guide to copy. |
| `examples/gallery/` | Demo guide: every block and every visual kit, with sample stations from 9 subjects on 5 lines. |
| `examples/bio-metro/` | Bio Metro rebuilt on this engine (matches the published v13 apart from the v1.2 fixes), with `original/` (the published source and build), `source-materials/` (the teacher's PDFs it was written from) and `design-references/` (the notebook guide and sketches that shaped the look). |
| `examples/bi-metro/` | BI Metro (Grade 12 Bahasa Indonesia PSAS, v1.3): explanations in Indonesian with an English interface, annotated model texts, sentence fixes, and 17 drills. Sources in `src/` (run `sh src/assemble.sh`). |
| `examples/math-metro/` | Math Metro (Grade 12 Advanced Maths PSAS): a full maths guide using the v1.2 graph options, derive, flow and an HTML Horner-table visual. |
| `docs/` | The documentation (below) and `visual-guide.html` (annotated screenshots). |
| `CHANGELOG.md` | What changed from the Bio Metro engine. |

## Documentation

Start with **01** and **03**, then look things up as you need them.
Open **`docs/visual-guide.html`** in a browser for the annotated pictures.

| | |
|---|---|
| [01 Overview](docs/01-overview.md) | How a guide is put together, and what the engine does for you |
| [02 Files](docs/02-file-structure.md) | Every file, and every key in `guide.json` |
| [03 Content blocks](docs/03-content-blocks.md) | Every HTML block, the shorthands, and when to use each |
| [04 Visual kits](docs/04-visual-kits.md) | `Kit.flow`, `cycle`, `timeline`, `graph`, `bars`, `particles`, `derive`, `annotate`, `diagram` |
| [05 Custom visuals](docs/05-custom-visuals.md) | Drawing your own: the `Engine` and `V` APIs, SVG classes, the step player |
| [06 Quizzes and review](docs/06-quizzes-and-review.md) | `quiz.json`, `flash.json`, sorters, checkpoints, the practice exam |
| [07 Theme and colours](docs/07-theme-and-colours.md) | Line colours, tokens, light and dark, fonts |
| [08 Modes](docs/08-modes.md) | Boot, picker, scroll mode, explainer mode, sheets |
| [09 Responsive rules](docs/09-responsive.md) | Laptop, tablet and phone behaviour |
| [10 Build and check](docs/10-build-and-check.md) | The tools, publishing, keeping file size down |
| [11 Subject playbook](docs/11-subject-playbook.md) | How a guide should look for each subject, STEM and non-STEM |
| [12 Design rules](docs/12-design-rules.md) | The house rules every guide follows |
| [13 Accessibility and storage](docs/13-accessibility-and-storage.md) | Labels, keyboard, motion, what is saved where |
| [14 Troubleshooting](docs/14-troubleshooting.md) | Known pitfalls and their fixes |

## Size

The engine is about 165 KB before content, or about 200 KB when the visual kit is used
(CSS comments are stripped automatically, and the kit is only included when `visuals.js`
calls it). The demo gallery builds to
about 270 KB and Bio Metro to about 420 KB, all as one file that works offline.
