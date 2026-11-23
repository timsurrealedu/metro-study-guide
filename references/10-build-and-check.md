# 10 · Build, check and publish

All tools run from the engine folder. Python tools need Python 3.8+ only; the
screenshot tools need Node 18+ and Playwright (already in Claude's workspace).

## new.py — start a guide

```bash
python3 tools/new.py guides/chem-pas "Chem Metro" --lines 4 --id chem-pas-2026
```
Copies `starter/`, sets the id, title, highlight word, and adds 4 lines with distinct
colours plus the review line. Then edit `content.html` and the JSON files.

## check.py — find mistakes

```bash
python3 tools/check.py guides/chem-pas
```

**Errors** (the guide will break): invalid JSON, missing `id`/`title`/`lines`, bad
colours, unclosed or stray tags, duplicate chapter ids, chapters outside a part, a
part not in `guide.json`, missing `data-n`/`data-title`, reserved class names (`ex`,
`k-…`), `Kit.x("id")` or `V.svg("id")` with no such element, an unknown kit, quiz items
with no question, fewer than 2 options, not exactly one correct answer (unless
`multi`), `see` pointing nowhere, duplicate quiz ids, flashcards without front/back.

**Warnings** (house rules): a visual/table/steps section without a `p.lead`, sections
without `h3`, paragraphs over 90 words, trap callouts outside `.traps`, missing
`data-short` or one over 22 characters, line colours too light for white text, no
review line, lines without parts, visuals never used in `visuals.js`, wrong options
without a reason, questions without an explanation, quiz sets with no questions,
images without alt text. Repeated warnings are grouped.

Exit code 1 when there are errors: `python3 tools/check.py g && python3 tools/build.py g`.

## build.py — make the HTML

```bash
python3 tools/build.py guides/chem-pas               # → guides/chem-pas/out/chem-pas-2026.html
python3 tools/build.py guides/chem-pas --fragment    # no <html>/<head>/<body> (for hosts that add them)
python3 tools/build.py guides/chem-pas --pretty      # keep CSS comments (bigger, easier to inspect)
python3 tools/build.py guides/chem-pas --out x.html  # choose the output path
```

What it does, in order:
1. reads `guide.json`; derives line tokens (warns when a colour is darkened);
2. leaves the kit out if `visuals.js` never says `Kit.` (CSS and JS);
3. removes HTML comments from `content.html`, expands the shorthands, generates
   checkpoints, adds callout icons;
4. normalises `quiz.json` (ids, sets, reasons) and shuffles options (stable);
5. inlines `assets/` images as data URIs;
6. writes the page: CSS (engine + line tokens + `style.css`), boot screen, title
   card, content, data, `metro.js`, `kit.js`, `visuals.js`, `explainer.js`;
7. prints size, lines, stations, questions, cards, and whether the kit is included.

## shots.js — look at it everywhere

```bash
node tools/shots.js guides/chem-pas/out/chem-pas-2026.html [outdir] [--sizes lap,tab,ph] [--themes light,dark] [--viz] [--explainer 4]
```
Saves the main states for each size and theme (picker, top, line opener, station,
visual, table, callout, sorter, cards, checkpoint with an answer, contents and options
sheets on small screens, explainer screens), every visual with `--viz`, and
`report.txt` (sideways scrolling, text outside visuals, small tap targets, JS errors).

## docshots.js — documentation pictures

`node tools/docshots.js` rebuilds `docs/img/*.png` and `docs/visual-guide.html` from the
built gallery and Bio Metro (build both first). Markers are drawn in the page, so no
image library is needed.

## cssprune.py — engine maintenance

After changing the engine, remove CSS no longer used anywhere:
```bash
python3 tools/cssprune.py engine/metro.css /tmp/pruned.css engine/*.js engine/boot.html examples/*/content.html examples/*/visuals.js starter/content.html starter/visuals.js
```
It only drops selectors whose classes and ids appear in none of the given files, and
declarations always overridden by a later identical selector. Read
`pruned.css.removed.txt`, then rebuild the examples and compare screenshots before
replacing `metro.css`.

## Publishing

| Where | How |
|---|---|
| A file | Send `out/<id>.html`. It opens offline in any modern browser. Progress is saved per browser. |
| A Claude artifact | Ask Claude to publish the built file (`--fragment` is fine but not required). Keep the same artifact URL for updates so readers keep the link. Progress is kept per browser on that URL. |
| A website | Upload the single file. |

Progress is stored under the guide's `id`: keep the id the same across updates so
readers keep their progress; change it to start fresh.

## Keeping files small

- The engine is ~165 KB (~200 KB with the kit). Most of a guide's size is its content
  and custom visuals.
- Prefer kits to hand-drawn visuals (a kit call is a few hundred bytes).
- Compress images before putting them in `assets/` (photos: JPEG ~1200 px wide).
- Don't paste the same table twice: the cheat sheet should compress, not copy.

## Regression testing (engine changes)

Bio Metro was ported with screenshot regression: capture every state before and after
a change and compare pixels. `tools/shots.js` gives the captures; compare two folders
with any image diff tool, or a few lines of Python (Pillow `ImageChops.difference`).
Animated frames (particles, flowing dots) never match exactly; ignore them.
