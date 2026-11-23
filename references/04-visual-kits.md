# 04 · Visual kits

A kit is a visual you **describe with data** instead of drawing. One call in
`visuals.js` per visual:

```js
Kit.flow("k-molemap", { nodes: [...], steps: [...] });
```

and an empty box in `content.html`:

```html
<div class="viz" id="k-molemap"></div>
```

Every kit gets the standard player (Start over · Back · Play · Next), the step bars,
the caption ("Step 2 of 4", title, what to notice), light and dark colours, the line
colour, and the Animations switch. Pictures: [visual-guide.html § 4](visual-guide.html#s3).

## How kits stay readable on phones

Kits measure the **real on-screen width** of their box and redraw when it changes
(rotate a phone, open the sidebar, switch to explainer mode). Text is drawn at fixed
pixel sizes (15 px titles, 13 px notes), so a phone gets a re-laid-out picture with
real-size text, never a shrunken laptop drawing:

| Kit | Wide box | Narrow box |
|---|---|---|
| flow | rows of up to 4 boxes (`cols`) | one column for a simple chain (< 480 px); 2 columns for a branching flow |
| cycle | ring of boxes around a centre label (≥ 500 px) | a list with a return arrow down the right side |
| timeline | horizontal axis, cards above and below (≥ 600 px, ≤ 9 events) | vertical list |
| graph | plot 50 % as tall as wide (200–330 px) | same, fewer ticks |
| bars | vertical bars (≥ 520 px, ≤ 8 bars) | horizontal bars |
| particles | box 50 % as tall as wide | same |
| derive, annotate | HTML: wraps like text | same |
| diagram | your SVG, scaled to the width | scaled; keep it ≤ 480 units wide for phones (see below) |

## Choosing a kit

| You want to show… | Kit | Typical subjects |
|---|---|---|
| A process with stages; cause → effect; a method | `flow` | Chemistry methods, law-making, causes of a war, writing process, scientific method |
| A loop that repeats | `cycle` | Water, carbon, nitrogen cycles; business cycle; Krebs; liturgical year |
| Events in time | `timeline` | History, history of science, a novel's plot, a person's life |
| A relationship between two quantities | `graph` | Maths functions, physics motion, rates, supply and demand, population |
| Amounts compared, or one amount changing | `bars` | Moles, energy, population shares, budgets, election results |
| Moving particles | `particles` | Kinetic theory, collision theory, diffusion, gas pressure, equilibrium |
| A worked solution | `derive` | Maths, physics and chemistry calculations, accounting |
| Close reading of a text | `annotate` | English poems and prose, history sources, civics articles (UUD), scripture |
| A labelled picture whose parts light up | `diagram` | Cells, organs, circuits, a free-body diagram, a map, a timeline image |
| Anything else | custom ([05](05-custom-visuals.md)) | A one-off animation |

## Options every kit takes

| Option | Meaning |
|---|---|
| `alt` | What the visual shows, for screen readers. Always set it. |
| `steps` | Array of steps. Every step has `t` (title) and `d` (what to notice; HTML allowed) plus kit-specific fields. If you leave `steps` out, most kits make one step per item. |
| `ms` | Milliseconds per step when playing (default 3800; derive 4200, annotate 4500, particles 5000). |
| `on(i, el, step)` | Optional callback after each step is drawn, to add your own touches. |

Every kit returns the player: `{show(i), stop(), i, bar, cap}`.

Colours: the first item uses the **line colour** (`--pc`); others cycle through the
comparison palette `--c1…--c4` (blue, green, violet, pink). Any colour can be given as
a CSS value, preferably a token: `"var(--c2)"`, `"var(--text-3)"`.

---

## Kit.flow — boxes and arrows

```js
Kit.flow("k-law", {
  alt: "Five stages of law-making.",
  nodes: [
    {t: "Perencanaan", sub: "Planning: listed in Prolegnas"},
    {t: "Penyusunan", sub: "Drafting"},
    {t: "Pembahasan", sub: "Discussion, two levels"},
    {t: "Pengesahan", sub: "Approval and signing"},
    {t: "Pengundangan", sub: "Published", tag: "law"}
  ],
  cols: 3,
  steps: [
    {t: "Planning", d: "Bills are planned in Prolegnas.", on: [0]},
    …
  ]
});
```

| Field | Meaning |
|---|---|
| `nodes[]` | `{t, sub?, tag?, id?}`: title, small note, a pill label, an id for `edges` |
| `edges` | `[[from, to, "label"?], …]` by index or node id. Default: a chain 0→1→2… |
| `cols` | Most boxes per row (default 4; fewer if the box is narrow) |
| `boxWidth` | Widest a box may be (default 240) |
| `steps[].on` | Boxes to light up. Boxes before the furthest lit one show as done; later ones fade. |
| `steps[].upTo` | Treat everything up to this box as done |

Arrows are elbowed; an arrow that would cross a box is routed down the gap between
columns. Arrow labels get room automatically.

## Kit.cycle — a loop

```js
Kit.cycle("k-water-cycle", {
  center: {t: "The water cycle", sub: "powered by the Sun"},
  nodes: [{t: "Evaporation", sub: "liquid → vapour"}, {t: "Condensation"}, {t: "Precipitation"}, {t: "Collection"}],
  steps: [
    {t: "Evaporation", d: "…", on: [0]}, …,
    {t: "And round again", d: "…", on: [0], all: true, loop: true}
  ]
});
```
`steps[].all` marks every stage done; `loop` lights the arrow back to the start.

## Kit.timeline — events in order

```js
Kit.timeline("k-1914", {
  events: [{date: "28 Jun", t: "Franz Ferdinand shot", sub: "in Sarajevo"}, …],
  scale: "time",      // optional: space events by their numeric date (years)
  steps: [{t: "28 June: the trigger", d: "…", on: [0]}, …]
});
```
Without `scale`, events are evenly spaced. With `scale: "time"`, the dates must be
numbers (like `1945`).

## Kit.graph — functions, sliders, points

```js
Kit.graph("k-parabola", {
  x: {min: -6, max: 6, label: "x"},            // step: tick spacing (optional)
  y: {min: -6, max: 10, label: "y"},
  params: {a: {label: "a", min: -3, max: 3, step: .1, value: 1},
           c: {label: "c", min: -5, max: 5, step: .5, value: 0, unit: ""}},
  fns: [{f: (x, p) => p.a * x * x + p.c, label: "y = ax² + c"}],
  points: [[2, 4, "A"]],                        // fixed dots [x, y, label?]
  readout: p => `vertex at (0, ${p.c})`,       // text top-right, updates live
  steps: [
    {t: "y = x²", d: "…", set: {a: 1, c: 0}},
    {t: "Narrower", d: "…", set: {a: 3}},
    {t: "Read a value", d: "…", mark: [{x: 2, label: "y = {y} at x = {x}"}]}
  ]
});
```

| Field | Meaning |
|---|---|
| `fns[]` | `{f(x, p), label?, color?, dash?}`. `p` holds the current parameter values. Breaks in the curve (∞, NaN) are skipped. |
| `params` | Each becomes a slider under the player (`slider: false` hides it). `dp` = decimals shown (default: from `step`), `fmt(v)` = custom text, `unit`. |
| `steps[].set` | Parameter values for this step; they **tween** (0.7 s, or `tween` ms) and the sliders follow. |
| `steps[].show` | Indexes of `fns` to draw (others fade in the legend). |
| `steps[].mark` | Marked points with guide lines: `{x, y?, fn?, label?}`. `x` and `y` may be functions of `p` (a point that moves with the sliders). `{x}` `{y}` in the label are filled in. |
| `readout(p)` | A live text line. |
| `freeLabel` | Heading above the sliders (default "Or try it yourself"). |
| `vlines`, `hlines`, `dots`, `shade` | v1.2: see below. |

### New in v1.2: asymptotes, jumps, endpoint dots and shaded areas

```js
Kit.graph("k-floor", {
  x: {min: -3, max: 5}, y: {min: -3, max: 5},
  fns: [
    {f: x => 1 / (x - 2) + 1, breaks: [2]},            // no vertical stroke at the asymptote
    {f: x => Math.floor(x), breaks: "int"},             // a jump at every whole number
    {f: x => x + 1, domain: [-3, 2]},                   // piecewise: each rule on its own interval
    {f: x => 4, domain: [2, 5]}
  ],
  vlines: [{x: 2, label: "x = 2"}],                     // dashed vertical line (asymptote, bound x = a)
  hlines: [{y: 1, label: "y = 1", at: "left"}],         // dashed horizontal line (asymptote y = b)
  dots: [{x: 2, y: 3, fn: 2, open: true}, {x: 2, y: 4, fn: 3}],   // ○ not included, ● included
  shade: [{fn: 0, from: 3, to: 4, label: "A"}],        // area between a curve and the x-axis
  steps: [{t: "…", d: "…", shade: [], dots: []}]       // a step may replace any of these four
});
```

| Field | Meaning |
|---|---|
| `fns[].domain` | `[a, b]`: draw the curve only for a ≤ x ≤ b (a piece of a piecewise function). `a`, `b` may be functions of `p`. |
| `fns[].breaks` | x values where the curve jumps: the pen lifts there, so floor, ceiling, piecewise and rational graphs are never joined by a vertical stroke. `"int"` = every whole number. The curve stops a hair before each break, so `Math.floor` reads the left piece correctly. |
| `vlines[]` | `{x, label?, dash?, color?, at?, side?}`: a vertical line. Dashed unless `dash: false`. `x` may be a function of `p`. Label at the top (`at: "bottom"` to move it), on whichever side fits (`side: "left"`/`"right"` to choose). `{x}` in the label is filled in. |
| `hlines[]` | `{y, label?, dash?, color?, at?, below?}`: a horizontal line. Label on the right (`at: "left"`), above the line (`below: true` to put it under). |
| `dots[]` | `{x, y?, fn?, open?, label?, color?}`: an endpoint dot. `open: true` draws a hollow circle (endpoint **not** included); otherwise filled (included). Without `y`, the dot sits on curve `fn`. Colour = that curve's colour. |
| `shade` | One area or a list: `{fn?, fn2?, from, to, label?, color?, lx?, ly?}`. Fills between curve `fn` (default 0) and curve `fn2`, or the x-axis if `fn2` is left out, from x = `from` to x = `to`. First area uses the line colour, later ones `--c2…`. Use a second colour for parts below the axis (negative integral). The label sits in the middle (`lx`, `ly` move it). |
| `steps[].vlines`, `hlines`, `dots`, `shade` | Replace the top-level value while that step is shown (`[]` hides them). Leave out to keep the top-level value. |

Shading is drawn under the axes and curves; dots and labels on top. Everything follows
light and dark mode (`.k-vl`, `.k-dot`, `.k-dot.open`, `.k-shade`).

## Kit.bars — amounts

```js
Kit.bars("k-moles12", {
  unit: "mol", max: 7, fmt: v => v.toFixed(1),
  bars: [{t: "Carbon (Mr 12)"}, {t: "Magnesium (Mr 24)"}, {t: "Hydrogen (Mr 2)"}],
  steps: [
    {t: "Guess first", d: "…", v: [null, null, null]},   // null = a "?" bar
    {t: "Carbon", d: "…", v: [1, null, null], hi: [0]},
    …
  ]
});
```
`steps[].v` sets the values (they animate); `null` draws a dashed "?" bar for
predict-first questions; `hi` highlights some bars and fades the rest.

## Kit.particles — moving particles

```js
Kit.particles("k-collide", {
  kinds: [{label: "A", n: 16, color: "var(--c4)"}, {label: "B", n: 16, color: "var(--c1)"}, {label: "product", n: 0, color: "var(--c3)"}],
  react: {a: 0, b: 1, make: 2, ea: 2.1},   // A + B → product when they hit hard enough
  temp: {value: .6, min: .3, max: 3},       // the Temperature slider (slider:false to hide)
  steps: [
    {t: "Cold", d: "…", temp: .6, reset: true},
    {t: "Hot", d: "…", temp: 2.4, reset: true},
    {t: "Catalyst", d: "…", temp: .6, reset: true, catalyst: true}
  ]
});
```
Elastic collisions between particles and with the walls. Without `react` the counter
shows wall hits per second (gas pressure). `catalyst` lowers the energy needed to
react. `n: [16, 16, 0]` in a step re-seeds with new counts. Particles only move while
Animations are on and the box is on screen.

## Kit.derive — a worked solution

```js
Kit.derive("k-water", {
  given: "2H_{2} + O_{2} \\to 2H_{2}O",
  lines: [
    {m: "n = \\frac{m}{Mr} = \\frac{4}{2} = [[2 mol]]", why: "Grams → moles.", t: "Moles of hydrogen"},
    {m: "m = 2 \\times 18 = [[36 g]]", why: "Moles → grams.", t: "Grams of water", final: true}
  ]
});
```

Line syntax (also usable anywhere via `Kit.math("…")`):

| Write | Get |
|---|---|
| `[[x]]` | highlighted change |
| `~~x~~` | crossed out (cancelling) |
| `\frac{a}{b}` | stacked fraction (nesting works) |
| `x^{2}`, `x_{1}` | superscript, subscript |
| `\sqrt{x}` | square root |
| `\times \div \pm \le \ge \neq \approx \to \cdot \pi \theta \Delta \alpha \beta \lambda \mu \omega \rightleftharpoons \infty \degree` | × ÷ ± ≤ ≥ ≠ ≈ → · π θ Δ α β λ μ ω ⇌ ∞ ° |

In a JS string, write the backslash twice: `"\\frac{1}{2}"`. One step per line by
default (title `t`, text = `why`); lines after the current one are blurred, so the
layout never jumps. `final: true` boxes the answer.

## Kit.annotate — a passage with notes

```js
Kit.annotate("k-grey", {
  text: "“[[The lamps are going out|lamps]] [[all over Europe|scale]] …”",
  source: "Sir Edward Grey, <i>Twenty-Five Years</i> (1925)",
  notes: {lamps: {t: "A metaphor", d: "…"}, scale: {t: "How big", d: "…"}},
  steps: [{t: "…", d: "…", hi: ["lamps"]}]     // optional: default one step per note
});
```
`[[words|key]]` marks a phrase; several phrases can share a key. Each note may set its
own `color`. `serif: false` uses the sans-serif font. Use `<br>` for line breaks in
poems. Only quote public-domain or teacher-provided texts.

## Kit.diagram — your drawing, step by step

```js
Kit.diagram("k-fbd", {
  vb: "60 64 480 236",                 // viewBox
  svg: `<g data-part="w">…arrow…</g>
        <text data-label="w" x="314" y="276" class="tb">Weight</text>
        <g data-step="2">…appears from step 2…</g>
        <g data-only="0,3">…only on steps 0 and 3…</g>`,
  steps: [
    {t: "All four forces", d: "…", labels: ["w", "n", "p", "f"]},
    {t: "Up and down cancel", d: "…", focus: ["w", "n"]}
  ]
});
```

| Attribute in your SVG | Behaviour |
|---|---|
| `data-part="x"` | Fades back when a step has `focus` that doesn't include `x` |
| `data-label="x"` | Shown when the step's `labels` (or `focus`) include `x` |
| `data-step="n"` | Hidden before step n |
| `data-only="a,b"` | Shown only on those steps |

Use the SVG classes from [05](05-custom-visuals.md) (`f-pc`, `s-pc`, `tb`, `ts`, …) so
colours follow the theme. For phones, keep the drawing about 480 units wide or add
`class="viz narrow"` for tall drawings: text in SVG drawings scales with the drawing.

---

## When a kit is almost right

- Add your own touch in `on(i, el, step)`: it runs after each step is drawn.
- Wrap a kit call in a function to compute values (the supply-and-demand example in
  `examples/gallery/visuals.js` computes the moving equilibrium).
- Otherwise draw it yourself: [05 Custom visuals](05-custom-visuals.md).
