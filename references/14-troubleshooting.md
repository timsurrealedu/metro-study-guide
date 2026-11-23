# 14 · Troubleshooting and pitfalls

Real problems met while building Bio Metro and the engine, and their fixes.

## Content

| Symptom | Cause | Fix |
|---|---|---|
| A block disappears in explainer mode | It has class `ex` (the explainer hides `.ex`). Bio Metro's examples were once `.callout.ex` | Never use reserved classes (`ex`, `ex-…`, `k-…`, `rv`, `hide`, `dim`…). Examples are `.callout.eg`. `check.py` flags them |
| Weird behaviour on an element called `part` | `class="part"` is how the engine finds lines; also `Element.part` is a built-in DOM property, so never use `el.part` for your own data | Only line sections get `part`; store your own data in `dataset` |
| The page doesn't load (blank after the boot screen) | A JavaScript error. Common: a `Kit.…("id")` with a typo; quiz/flash JSON invalid | Run `check.py`; open the browser console; `shots.js` lists JS errors |
| Shorthands produced broken HTML | Old build: a comment in `content.html` mentioning `<article class="chapter">` was expanded | Fixed in v1 (comments are removed first). Keep comments anyway: they cost nothing |
| A station has no checkpoint row | It has neither `<div class="traps">` nor questions with `"see"` for it | Add one of them |
| Checkpoint missing entirely | The line already has a hand-written checkpoint, or `"checkpoints": false` | — |
| Quiz says "No questions in the set" | `data-set` doesn't match any `see`/`sets` | Fix the id in quiz.json |
| A trap shows inside the station | It isn't inside `<div class="traps">` | Wrap it; `check.py` warns |
| Explainer screens feel crowded | Long paragraphs after a visual; several callouts in a row | Lead → visual; split text; ≤ 2 callouts in a row |
| Saved answers look wrong after editing questions | Answers are saved by question id and option position; editing a question's text reshuffles its options; default ids follow the order | Give stable `id`s; if you edit question text after people started, accept that those answers reset (or set `"fixed": true`) |

## Visuals

| Symptom | Cause | Fix |
|---|---|---|
| Visual is an empty box | Its id isn't used in `visuals.js`, or the script returned early (`V.svg` didn't find it) | `check.py` warns about unused visual ids |
| Phone: diagram text tiny | Custom SVG with a wide viewBox is scaled down | 480–640 units wide, short labels, or a kit; `viz narrow` for tall drawings |
| Laptop: a narrow drawing is huge | `.viz-stage svg` has a 560 px minimum width | `class="viz narrow"` |
| Phone: sideways scrolling | Something wider than the screen (often a wide table without `.tbl-wrap`, a long word, a `pre`) | `shots.js` report names it; wrap tables in `.tbl-wrap` |
| Animation keeps running when off screen | A ticker without a visibility check | `E.watch(svg)` and skip when `E.visible.get(svg) === false` |
| Colours wrong in dark mode | Hard-coded hex in the SVG | Use classes (`f-pc`, `s-line`) or `var(--token)` |
| Kit text small inside the explainer | — | Kits read the on-screen width, so explainer zoom doesn't shrink them; the card scrolls instead |
| Derive line shows `\frac` literally | Single backslash in a JS string | Write `"\\frac{1}{2}"` |

## Engine and build

| Symptom | Cause | Fix |
|---|---|---|
| Leaving the explainer doesn't scroll back to the station | A smooth `scrollBy` cancelled `scrollIntoView` | Fixed: uses `scrollTo({behavior: "instant"})` |
| Page has an 8 px white edge | Full-page builds had no `body{margin:0}` (Bio relied on its host) | Fixed in v1 |
| Legend badges stretched into ovals | `.ov-leg span{flex:1}` hit the badge | Fixed in v1 |
| Map labels cross other lines (4+ lines) | All diagonals on one 45° line | Fixed in v1: separate entry heights and label clearance |
| CSS pruner removed the review line colours | It lower-cased custom properties (`--pR` → `--pr`) | Fixed: custom-property case is kept |
| `build.py` syntax error on Python 3.11 | A backslash inside an f-string expression (only legal from 3.12) | Fixed; keep build.py free of that pattern |
| Line colour came out darker than chosen | Too light for white text; the build darkened it (see the warning) | Use the suggested hex, or set `tokens` by hand |
| Fonts look different on Windows/Android | SF Pro only exists on Apple devices | Expected; the system UI font is used. Readers can load SF Pro or any font with the Font button |

## Checking a guide quickly

```bash
python3 tools/check.py g && python3 tools/build.py g && node tools/shots.js g/out/<id>.html --sizes ph,lap --themes light
```
Then look at `g/out/shots/` and read `report.txt`.
