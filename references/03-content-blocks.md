# 03 · Content blocks

Everything in `content.html`, with the markup to copy. Pictures of each block are in
[visual-guide.html § 3](visual-guide.html#s2). The demo guide (`examples/gallery`)
uses every one of them.

---

## 1. The skeleton

```html
<section class="part" data-part="1" data-title="Reaction rates" data-kicker="Line 1"
  data-eyebrow="Line 1 · Topics 1–3" data-lede="What makes a reaction faster or slower.">

  <article class="chapter" id="c1-1" data-n="1.1" data-short="Collisions"
    data-title="Collision theory" data-tag="PAS topic 1">
    <p class="bigidea">One or two sentences: the idea to remember.</p>

    <div class="sec"><h3 data-eb="In plain words">Section heading</h3>
      <p class="lead">What this section shows and what to look for.</p>
      … blocks …
    </div>

    <div class="traps"> … trap callouts … </div>
  </article>

  <article class="chapter" id="c1-2" …> … </article>
</section>

<section class="part" data-part="R" data-title="Review" data-kicker="Review" …>
  … review chapters …
</section>

<p class="foot">Built from your teacher's materials. Progress is saved only in this browser.</p>
```

### Part attributes (`section.part`)

| Attribute | Required | Meaning |
|---|---|---|
| `data-part` | yes | Key in `guide.json` lines: `1`, `2`, … or `R` |
| `data-title` | yes | Line name (shown on the opener, map, sidebar) |
| `data-kicker` | yes | Short label: `Line 1`, `Review` |
| `id` | no | Generated as `part-<key>` |
| `data-eyebrow` | no | Small caps line on the opener (default: the kicker) |
| `data-lede` | no | Sentence on the opener |

### Chapter attributes (`article.chapter`)

| Attribute | Required | Meaning |
|---|---|---|
| `id` | yes | Unique; `c<line>-<n>` by convention |
| `data-n` | yes | Station number shown on the sign: `1.1`, `R2` (empty for checkpoints) |
| `data-title` | yes | Full title |
| `data-short` | recommended | Short name for the map, sidebar and explainer (≤ 18 characters) |
| `data-tag` | no | Small tag next to the eyebrow: exam topic, textbook pages |
| `data-count="no"` | no | Not counted in progress and not on the map (review chapters, checkpoints) |
| `data-final` | no | On a review chapter: where "All stations done" sends the reader (default: the first review chapter with a quiz) |

### Shorthands (build.py fills these in)

They only add what is missing, so full hand-written HTML (like Bio Metro) is untouched.

| If you leave out… | build.py adds |
|---|---|
| `<div class="part-open">` in a part | An opener: eyebrow, `<h2>` title, lede, station chips (`.plist`) |
| `<header class="ch-head">` in a chapter | Number sign, eyebrow `Line 1 · Name` (just `Review` on R), tag, `<h2>`, and moves the first `<p class="bigidea">` into it |
| `<footer class="ch-foot">` | The footer: "Mark chapter as learned" + "Next: …" |
| `class="col"` on a chapter | Added (the reading column) |
| the icon in a callout | `<span class="ci">` with the right icon (trap ⚠, note ⓘ, eg 💡, good ✓) |
| a checkpoint chapter at the end of a line | Built from each station's `<div class="traps">` and its quiz set: one folding row per station |

Write HTML comments freely; they are removed before the shorthands run.

The full form, for reference (what the shorthands produce):

```html
<article class="chapter col" id="c1-1" data-short="Collisions" data-n="1.1" data-title="Collision theory">
  <header class="ch-head"><div class="ch-num">1.1</div>
    <div class="eyebrow">Line 1 · Reaction rates <span class="topic">PAS topic 1</span></div>
    <h2>Collision theory</h2>
    <p class="bigidea">…</p>
  </header>
  …
  <footer class="ch-foot" data-auto></footer>
</article>
```

---

## 2. Text

| Block | Markup | Use it for |
|---|---|---|
| Big idea | `<p class="bigidea">…</p>` | First thing in every station. 1–2 sentences. |
| Section | `<div class="sec"><h3 data-eb="Label">Heading</h3> … </div>` | Every station is made of sections. `data-eb` is the small coloured label ("In plain words", "See it", "Compare", "Steps", "Worked example", "Sort it"). |
| Lead | `<p class="lead">…</p>` | The first paragraph of a section that has a visual, table or steps: what it shows and what to look for. Becomes the explainer text. |
| Paragraph | `<p>…</p>` | Explanations. Keep under ~60 words; `check.py` warns over 90. |
| Exact term | `<b>term</b>` | The teacher's term, bold on first use. |
| Local term | `<span class="id">istilah</span>` | The Indonesian (or class-language) term, in italics. Next to the English term. |
| Small print | `<p class="small muted">…</p>` | Side notes. Attaches to the screen above in explainer mode. |
| Caption | `<p class="caption">…</p>` | Under a visual or image. |
| Sub-heading | `<h4>…</h4>` | Inside a section, rarely. |
| Chip | `<span class="m" style="--mc:var(--c1)">H₂O</span>` | A coloured pill for a molecule, unit or key word. `--mc` can be any colour token. Bio uses `class="m atp"` etc. |
| Footer note | `<p class="foot">…</p>` | Last line of the page. |

---

## 3. Structured blocks

### Terms

```html
<dl class="terms">
  <div><b>Activation energy</b><span class="id">energi aktivasi</span><span class="d">The minimum energy a collision needs.</span></div>
  <div><b>Catalyst</b><span class="d">Speeds a reaction up; not used up.</span></div>
</dl>
```
A grid of definitions. On phones each term folds: tap the term to read the meaning.

### Steps

```html
<ol class="steps">
  <li><b>Step title</b>What happens, and why it comes now.</li>
  <li><b>Next step</b>…</li>
</ol>
```
A numbered process. Each step needs a bold title first, then its reason. On phones
the steps fold to a list of titles.

### Tables

```html
<div class="tbl-wrap"><table class="tbl">
  <thead><tr><th></th><th>Epigeal</th><th>Hypogeal</th></tr></thead>
  <tbody>
    <tr><td>Grows longer</td><td>Hypocotyl</td><td>Epicotyl</td></tr>
    <tr><td>O₂ needed</td><td class="yes">Yes</td><td class="no">No</td></tr>
  </tbody></table></div>
```

- **Comparison table**: leave the first header cell **empty** and compare 2–6 things (`--c1…--c6`, or set `data-role="v|c|f|g|r|k|a"` on `<th>` for semantic cross-highlighting). Each compared column gets its own colour, clickable header spotlight, a top `.tbl-bar` column filter, and an automatic **Differences** filter when rows share identical values (`data-plain` on `<table>` hides `.tbl-bar`).
- **Data table**: a first header with text (`<th>No.</th>`). On phones each row becomes a small card with the header as a label. Add `class="tbl num"` for right-aligned numbers. Supports `data-role` on `<tr>`/`<th>`, `.t-chip` semantic pills, and `.t-bar` progress meters (`<span class="t-bar" data-p="80" data-role="r">80%</span>`).
- `td.yes` / `td.mid` / `td.no` colour a cell green / amber / red.
- Use `<small>` inside `<th>` or `<td>` in the first column to explain what a column or row criterion measures.
- Always wrap in `<div class="tbl-wrap">`.

### Equation

```html
<div class="eq">[[3|c|m3]]([[2x - 4|g|gp]]) + 5 = [[2x|v]] + 9
  <small>Blue = variable · Amber = multiplier · Teal = group</small>
  <div class="eq-legend" role="group" aria-label="Color key">
    <button type="button" class="m-leg-item m-t-c" data-role="c" aria-pressed="false"><i></i><span>Multiplier</span></button>
    <button type="button" class="m-leg-item m-t-g" data-role="g" aria-pressed="false"><i></i><span>Group</span></button>
  </div>
  <details class="eq-why"><summary>Why multiply first?</summary><p>Parentheses group terms before addition.</p></details>
</div>
```
- Inline math anywhere (prose, tables, quizzes, flashcards): `<span class="m">\frac{d}{dx}[[sin|f]]([[x^{2}|g]])</span>`.
- Supports full TeX (`\frac`, `\sqrt[n]{x}`, `\int_{a}^{b}`, `\sum_{k=1}^{n}`, `\lim_{h \to 0}`, `\binom{n}{k}`, `\begin{bmatrix}...\end{bmatrix}`, `\vec`, `\abs`, `\dd{x}`), depth-colored brackets, and semantic role tokens `[[expr|role|tid]]` (`v`/`c`/`f`/`g`/`r`/`k`/`a`).
- For step-by-step animated solutions, use `Kit.derive` ([04](04-visual-kits.md)).

### Key–value list

```html
<dl class="kv"><dt>Independent</dt><dd>What you change</dd><dt>Dependent</dt><dd>What you measure</dd></dl>
```

### Cards

```html
<div class="grid2">     <!-- or grid3 for three narrow columns -->
  <div class="card"><h4>Auxin <span class="id">auksin</span></h4>
    <p class="small muted">Made at shoot tips.</p>
    <ul class="small"><li>Cell elongation</li><li>Phototropism</li></ul></div>
  <div class="card">…</div>
</div>
```
Use when each item has several facts in different shapes. If every item has the same
facts, use a comparison table instead. Cards fold on phones (tap the `<h4>`).

### Fold-out

```html
<details class="more"><summary>Every seed part, in exam words</summary><div>
  … any blocks …
</div></details>
```
For detail some readers want. Attaches to the screen above in explainer mode.

---

## 4. Callouts

```html
<div class="callout eg"><b>Example</b><div>A plain real-life example.</div></div>
<div class="callout note"><b>From your practicum</b><div>…</div></div>
<div class="callout good"><b>Quick check</b><div>…</div></div>
<div class="callout trap"><b>Short statement of the trap</b><div>Why it is wrong; what is right.</div></div>
```

| Kind | Icon | Use for |
|---|---|---|
| `eg` | 💡 bulb, line colour | **Examples**: plain, real-life, not themed (no metro analogies). |
| `note` | ⓘ blue | Background, practicum notes, provenance, "where materials disagree". |
| `good` | ✓ green | A rule of thumb or quick check. |
| `trap` | ⚠ red | Exam traps. Put them in `<div class="traps">` (they move to the checkpoint). |

Callouts longer than 300 characters get a "Read more" button on phones.

---

## 5. Visuals

```html
<div class="viz" id="k-molemap"></div>                <!-- a kit fills it -->
<div class="viz wide" id="v-cell">                    <!-- a custom drawing -->
  <div class="viz-stage"><svg viewBox="0 0 720 400" role="img" aria-label="Describe it"></svg></div>
</div>
```

| Class | Effect |
|---|---|
| `viz` | A visual box: contrasting panel, player, captions. Needs an `id`. |
| `viz wide` | Custom drawings that need more room on laptops (min width 660 px instead of 560). |
| `viz narrow` | Tall, narrow drawings: no minimum width, capped at 460 px. |

Controls under a custom visual:

```html
<div class="ctl" data-h="Or scrub through the days">
  <div><label for="gt-day">Days after sowing <output id="gt-out">Day 0</output></label>
       <input id="gt-day" type="range" min="0" max="100" value="0"></div>
  <div><label>Light</label><div class="segc" id="gl-light" role="group" aria-label="Light">
       <button type="button" data-v="full" aria-pressed="true">Full</button>
       <button type="button" data-v="dark">Dark</button></div></div>
</div>
<div class="readout" id="gl-read"></div>   <!-- a text line your script fills -->
<div class="tally" id="resp-tally"></div>  <!-- counter chips your script fills -->
```

Kits make their own sliders. See [04](04-visual-kits.md) and [05](05-custom-visuals.md).

### Images

```html
<img src="assets/photo.jpg" alt="What the photo shows" style="width:100%;border-radius:14px">
<p class="caption">Source and what to notice.</p>
```
Files in `assets/` are inlined at build time (the guide stays one file). Keep images
small (≤ 200 KB each; JPEG for photos, PNG/SVG for drawings).

---

## 6. Practice blocks

| Block | Markup | Data |
|---|---|---|
| Quiz | `<div class="quiz" data-set="c1-1"></div>` | `quiz.json` items in that set |
| Practice exam | `<div class="quiz" data-set="exam"></div>` | items with `"exam": true` |
| Flashcards | `<div class="flash"></div>` | `flash.json` |
| Sorter | see below | in the HTML |
| Drills (v1.3) | `<div class="drill order">`, `cloze`, `spot`, `match` | in the HTML: drag-to-order, fill in the blanks, find the mistakes, match pairs ([06](06-quizzes-and-review.md#drills-v13)) |

```html
<div class="sorter" data-bins="Element|Compound">
  <p data-bin="0" data-why="One kind of atom.">O₂</p>
  <p data-bin="1">H₂O</p>
</div>
```
`data-bin` is the index of the right bin; `data-why` is shown after sorting. Two or
more bins. Details: [06](06-quizzes-and-review.md).

---

## 7. Traps and checkpoints

```html
<div class="traps">
  <div class="callout trap"><b>A catalyst is not used up</b><div>It comes out unchanged.</div></div>
</div>
```
Last thing in a station. The build moves it into the line's checkpoint (an extra
station at the end of the line, `id="cp-<key>"`) with the station's quiz set.
To hand-write a checkpoint instead, copy the structure from
`examples/bio-metro/content.html` (`#cp-1`); the build then leaves that line alone.

---

## 8. The review line

```html
<section class="part" data-part="R" data-title="Review" data-kicker="Review" data-eyebrow="Review · The night before" data-lede="…">
  <article class="chapter" id="r-cheat" data-n="R1" data-short="Cheat sheet" data-title="Cheat sheet" data-count="no"> … tables … </article>
  <article class="chapter" id="r-cards" data-n="R2" data-short="Flashcards" data-title="Flashcards" data-count="no"><div class="flash"></div></article>
  <article class="chapter" id="r-exam" data-n="R3" data-short="Practice exam" data-title="Practice exam" data-count="no"><div class="quiz" data-set="exam"></div></article>
  <article class="chapter" id="r-notes" data-n="R4" data-short="Notes" data-title="Notes on your materials" data-count="no"> … note callouts … </article>
</section>
```

- **Cheat sheet**: the comparison tables and numbers again, compressed.
- **Flashcards** and **practice exam**: from the JSON files.
- **Notes on your materials**: one `note` callout per place where the sources disagree
  or something was unclear, saying which version the guide follows (normally the
  teacher's) and why.

---

## 9. Class names you must not use

The engine uses these for behaviour; reusing them in content breaks things
(`check.py` flags them): `ex` and anything starting `ex-` (explainer: `.ex` is
hidden!), `k-…`, `kd…`, `ka-…` (kit), `mode-…`, `rv`, `hide`, `dim`, `pick`, `boot`,
`sheet`, `side`, `mst`. Also never put `class="part"` on anything except the line
sections, nor `chapter` on anything except stations. Bio Metro's callout was once
called `ex` and vanished in explainer mode; that is why examples are `eg`.
