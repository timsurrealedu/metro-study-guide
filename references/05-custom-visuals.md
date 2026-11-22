# 05 · Custom visuals

Use a custom visual when no kit fits: a growing seedling, a cell with moving carriers,
an enzyme changing shape. You draw SVG; the engine gives you the player, captions,
step bars, colours, the Animations switch, and phone fitting.

Bio Metro's 27 visuals (`examples/bio-metro/visuals.js`) are all custom and are the
best reference. A short one is in `examples/gallery/visuals.js` (`v-strobe`), and a
template in `starter/visuals.js`.

## The pattern

`content.html`:
```html
<div class="viz" id="v-strobe">
  <div class="viz-stage"><svg viewBox="0 0 640 330" role="img" aria-label="What it shows"></svg></div>
  <div class="ctl">…optional sliders / switches…</div>
</div>
```

`visuals.js`:
```js
(function strobe() {
  const E = window.Engine, $ = E.$, svg = V.svg("v-strobe");
  if (!svg) return;                                   // the visual isn't on this page

  V.put(svg, `${V.arrow("st-h")}
    <circle id="st-ball" cx="180" cy="40" r="11" class="f-pc"/>
    ${V.lbl(204, 45, "0.0 s", "ts t2", "start")}`);  // 1. draw once

  const steps = [                                     // 2. the steps
    {t: "Let go", d: "The ball starts at rest."},
    {t: "t = 0.1 s", d: "It has fallen 5 cm."}];

  function render(i, prev, fromPlay) { … }           // 3. show step i

  const P = E.stepper($("#v-strobe"), steps, render, {ms: 1800});
  E.segc($("#st-mode"), v => { mode = v; render(P.i); });   // 4. extra controls
})();
```

Rules:
- Wrap each visual in its own function (no global names), and **return early if the
  SVG isn't found**.
- Prefix every id you create inside a visual with a short code (`st-ball`), because
  ids are global to the page.
- Draw once, then **change classes or attributes** in `render`; don't rebuild the
  whole SVG each step unless it is cheap.
- If a control (slider, switch) changes the picture, call `P.stop()` first so Play
  stops.
- Describe the picture in the SVG's `aria-label`.

## viewBox and phones

| Setting | Laptop | Phone (≤ 700 px) |
|---|---|---|
| `.viz-stage svg` | width 100 %, **min-width 560 px** (scrolls sideways only if the column is narrower) | min-width 0: always fits the screen |
| `.viz.wide` | min-width 660 px | fits |
| `.viz.narrow` | no min-width, max 460 px | fits |

On phones every `<text>` in a visual is enlarged (16.5 units; `.ts` 14.5; `.tl` 19)
and nudged sideways if it would stick out of the frame. Because the drawing scales to
the phone's width, a 640-wide viewBox shows text at about 60 % size: design custom
visuals at **480–640 units wide**, with short labels, and check them with
`node tools/shots.js … --viz`.

## The step player — `E.stepper(viz, steps, render, options)`

| Argument | Meaning |
|---|---|
| `viz` | The `.viz` element (it must contain a `.viz-stage`). |
| `steps` | `[{t: "title", d: "what to notice (HTML)"}, …]` |
| `render(i, prev, fromPlay)` | Called for every step change (and once at the start with `i = 0`). `prev` is the previous step, `fromPlay` is true while playing. |
| `options.ms` | Time per step when playing (default 3800). |
| `options.freeLabel` | Heading above `.ctl` controls placed after the player (default "Or try it yourself"). |

It builds the caption, the step bars above the stage, and the player below, and
returns `{show(i), stop(), i, bar, cap}`. Only one player plays at a time. Each step
change fires a bubbling `visualstep` event on the `.viz`.

## `window.Engine` (alias `E`)

| Member | What it does |
|---|---|
| `$(sel, root?)`, `$$(sel, root?)` | `querySelector` / `querySelectorAll` (as an array) |
| `h(tag, attrs, html)` | Create an element (`onclick` etc. in attrs become listeners) |
| `ic(name, cls?)` | Icon markup: `check x warn info play pause back next reset shuffle list sliders sidebar sun moon auto bulb train motion` |
| `stepper(…)` | The step player (above) |
| `segc(el, onChange)` | Wire a segmented control (`.segc` with `button[data-v]`) |
| `segSet(el, value)` | Set a segmented control's pressed button |
| `rangeFill(input)` | Paint a slider's filled part after you change `.value` in code |
| `flow(path, opts)` | Dots flowing along an SVG `<path>`: `{n, r, dur, cls, label, ink, active, parent, once}`; returns `{set(active)}` |
| `tickers` | Array of `fn(clock, dt)` called every frame while Animations are on |
| `watch(el)`, `visible` | `watch(svg)` then `visible.get(svg)` is false when off screen: skip work then |
| `motionOn()` | Are animations on? |
| `sorter(box, items, bins)` | The sort game (items: `[html, binIndex, why]`) |
| `store.get(k, default)`, `store.set(k, v)` | localStorage under the guide's id |
| `markDone(id)`, `isDone(id)` | Station progress |
| `openSheet(bool)`, `openOptions(bool)` | Phone sheets |
| `applyTheme("auto"|"light"|"dark")`, `getTheme()`, `applyMotion("on"|"off")` | Settings |
| `showToast(html)` | A short message at the bottom |
| `lineVars(key)` | Inline-style string that sets a line's colour variables |
| `chapters`, `parts`, `counted` | The stations, lines, and stations that count toward progress |
| `fitAll()`, `paintProgress()`, `phoneMQ` | Re-fit SVG text; repaint progress; the phone media query |

An `engine-ready` event fires on `document` when the engine has loaded.

## `window.V` — drawing helpers

| Helper | What it does |
|---|---|
| `V.svg(id)` | The SVG inside `#id .viz-stage` |
| `V.put(svg, html)` | Append markup |
| `V.lbl(x, y, text, cls?, anchor?)` | A `<text>` (anchor `middle` by default) |
| `V.wrap(text, maxChars)` | Split text into lines |
| `V.arrow(id, cls?)` | An arrowhead `<marker>`; use `marker-end="url(#id)"` |
| `V.show(el or list, bool)` | Toggle class `hide` (fades if the element also has `fade`) |
| `V.dim(el or list, bool)` | Toggle class `dim` (16 % opacity) |
| `V.tween(ms, fn(t), done?)` | Animate t from 0 to 1; instant when Animations are off. Returns a stop function. |
| `V.clamp`, `V.lerp(a, b, t)`, `V.sm(a, b, t)` (smoothstep), `V.ease(t)` | Maths |

`Kit.math("…")` turns the derive syntax (fractions, powers, symbols) into HTML for
labels outside SVG.

## SVG classes (they follow light and dark mode)

Text: plain `<text>` is 13.5 px, weight 500, theme text colour. Add:
`tb` bold · `t2` secondary colour · `ts` small (12) · `tl` large (16).

| Fills | | Strokes | |
|---|---|---|---|
| `f-pc` | line colour (gradient) | `s-pc` | line colour |
| `f-pt` | line tint | `s-line` | thin grey line |
| `f-surf`, `f-s2`, `f-s3` | surfaces | `s-sep` | separator |
| `f-arrow` | arrowheads | `s-arrow` | grey arrow line |
| `f-e` | text colour | `s-root`, `s-light` | science extras |
| `f-bad` | red | | |
| `f-atp f-car f-o2 f-h2o f-co2 f-glu f-leaf f-leaf2 f-soil f-soil2 f-seed f-light f-liver` | science gradients (Bio) | | |

States and motion: `fade` (smooth opacity), `hide`, `dim`, `pulse`, `spin`, `bob`,
`flowline` (marching dashes). All stop when Animations are off.

Colour tokens usable in `style="fill:var(--…)"`: `--pc` `--pt` (line), `--c1…--c4`
(comparison), `--fg` (text in the visual box), `--text-2` `--text-3`, `--surface`,
`--ok` `--bad` `--info`, and the science set `--atp --carrier --o2 --h2o --co2 --glu
--light --leaf --leaf-2 --soil --soil-2 --root --seed` (see [07](07-theme-and-colours.md)).
Never hard-code a colour that must change in dark mode.

## Common recipes

**A slider that scrubs an animation** (Bio `v-germtype`): draw from a single number
`t` (0…1); steps tween `t` to targets; the slider sets `t` directly.

```js
let t = 0, stopT = () => {};
function set(v) { t = v; rng.value = Math.round(v * 100); E.rangeFill(rng); out.textContent = "Day " + Math.round(v * 10); draw(v); }
const targets = [.05, .34, .64, 1];
const P = E.stepper($("#v-germtype"), steps, i => { stopT(); const from = t; stopT = V.tween(1600, k => set(from + (targets[i] - from) * V.sm(0, 1, k))); });
rng.addEventListener("input", () => { P.stop(); stopT(); set(+rng.value / 100); });
```

**Carriers moving along a pathway**: `E.flow(pathElement, {n: 3, cls: "f-car", label: "NADH"})`,
then `f.set(i >= 2)` in `render` to switch it on at a step.

**A continuous simulation**: push a function to `E.tickers`, and check
`E.visible.get(svg) !== false` first so off-screen visuals cost nothing.

**Build-up diagrams**: give parts `class="fade"` and call `V.show(part, i >= k)`.
