# 07 · Theme and colours

## The look

| Element | Light | Dark |
|---|---|---|
| Paper | `#f3f3f1` with a 22 px dot grid (notebook paper) | `#141517`, fainter dots |
| Cards, tables, callouts | white, 2 px near-black border, hard offset shadow (`0 4px 0`), slightly rotated callouts (scrapbook) | `#202124`, same borders and shadows |
| Greys | Keychron K5 keyboard greys (`--surface`, `--surface-2`, `--surface-3`, `--line`) | the dark keycap greys |
| Accent | **one colour per line**: everything inside a line (station signs, labels, players, quiz headers) uses that line's colour | brighter version of the same colour |
| Visual boxes | a **light** panel (`#e6e7ea`) in light mode, dark panel (`#1f2023`) in dark mode, so they contrast with the page | |
| Glass | only on the floating bars and sheets, subtle | |
| Type | SF Pro (the system font on Apple devices), else the system UI font; readers can load their own | |

## Line colours

In `guide.json` each line gets one colour:

```json
"lines": { "1": {"name": "Growth", "color": "#00875a"}, … }
```

`build.py` derives every token from it:

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--pN-f` | the colour (darkened until white text on it reaches 4.5 : 1) | a lighter fill with near-black text (≥ 4.5 : 1) | badges, buttons, line on the map, station signs |
| `--pN` | text colour on paper (≥ 4.8 : 1) | bright text colour (≥ 6 : 1) | eyebrows, labels, links |
| `--pN-d` | deeper shade | | pressed states |
| `--pN-on`, `--pN-on2` | white / 86 % white | near-black | text on the fill |
| `--pN-s` | stroke | | |
| `--pN-l` | 50 % lighter | | light accents |
| `--pN-t` | 88 % tint | dark tint | callout and row backgrounds |
| viz `--pc` / `--pt` | the colour / 16 % | bright colour / 16 % | colour inside visual boxes |
| gradient `g-pN` | 45 % lighter → colour | | `f-pc` fills in SVG |

Inside a `.part[data-part="N"]` the engine maps these to generic names, which is what
blocks and visuals use: `--lc` (fill), `--lc-ink` (text), `--lc-on` (text on fill),
`--lc-t` (tint), `--lc-d`, `--accent`, `--volt`/`--von` (play button), `--pc`/`--pt`
(visuals).

### Picking colours

- Pick clearly different hues, mid-dark, saturated: they must carry white text.
  `tools/new.py` uses: `#cf450e` orange · `#1b79cd` blue · `#a61e4d` crimson ·
  `#29823b` green · `#7048e8` violet · `#b35c00` amber · `#0f766e` teal · `#c2255c`
  pink · `#5c7cfa` periwinkle; review `#0b7285`.
- Avoid pure yellow and light cyan (they get darkened a lot).
- If the build warns "too light for white text", it has darkened your colour. Use the
  suggested value to keep the result exact.
- Colours can follow the subject's own conventions (a red line for blood, green for
  plants), but never rely on colour alone to carry meaning.

### Exact overrides

To set tokens by hand (Bio Metro does this to keep its original palette):

```json
"1": {"name": "Growth", "color": "#00875a",
  "tokens": {
    "light": {"p": "#007a4c", "f": "#00875a", "d": "#006343", "on": "#ffffff", "on2": "rgba(255,255,255,.86)", "s": "#00875a", "l": "#7fd3b2", "t": "#e2f4ec"},
    "dark":  {"p": "#3ed49a", "f": "#13ad72", "d": "#0a6e48", "s": "#3ed49a", "t": "#12302a", "on": "#0b0c0e", "on2": "rgba(11,12,14,.78)"},
    "viz":   {"light": {"pc": "#12a882", "pt": "rgba(18,168,130,.16)"}, "dark": {"pc": "#63e6c8", "pt": "rgba(99,230,200,.16)"}},
    "grad":  ["#8ff0da", "#2cc9a8"]
  }}
```
Any key you leave out keeps the derived value. `"viz": null` leaves visuals in that
line with the neutral blue.

## Global tokens

Defined in `engine/metro.css` on `:root`, redefined for dark mode.

| Group | Tokens |
|---|---|
| Surfaces | `--bg` `--surface` `--surface-2` `--surface-3` `--tint` `--line` `--sep` `--sep-strong` `--dot` |
| Text | `--head` `--text` `--text-2` `--text-3` `--ink` (borders) |
| Borders and shadows | `--bd` (2 px ink border) `--bd-soft` `--hard` `--hard-l` (offset shadows) |
| Status | `--ok` `--ok-t` `--bad` `--bad-t` `--info` `--info-t` `--warn-t` `--done` |
| Comparison palette | `--c1` blue · `--c2` green · `--c3` violet · `--c4` pink (comparison-table columns; kit series) |
| Science set (from Bio) | `--atp` `--atp-ink` `--carrier` `--o2` `--h2o` `--co2` `--glu` `--light` `--leaf` `--leaf-2` `--soil` `--soil-2` `--root` `--seed` |
| Inside visual boxes | `--fg` `--fg-rgb` (text colour as "r g b"), plus the surfaces and status tokens re-tuned for the panel |
| Type | `--font` (text) `--font-d` (display) |
| Shape and motion | `--r-s` 12 · `--r-m` 18 · `--r-l` 26 · `--r-xl` 34 · `--ease` · `--spring` |
| Glass | `--glass` `--glass-strong` `--rim` `--rim-soft` |

## How dark mode works

```css
:root { …light… }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { …dark… } }
:root[data-theme="dark"] { …dark… }
```
Auto follows the device; Light and Dark set `data-theme` on `<html>`. Every colour
in your own CSS or SVG must be a token so it switches too.

## Fonts

- Default stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
  "Inter", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
  Nothing is downloaded, so the guide works offline. (SF Pro itself is not bundled:
  its licence only allows it on Apple devices, where it is already the system font.)
- The **Font** button (top bar, or Options on phones) loads `.otf .ttf .woff .woff2`
  files; you can also drop font files anywhere on the page. Weights and italics are
  read from the font files. Fonts are kept in this browser only (IndexedDB) and can be
  reset to the default.

## Per-guide CSS

`style.css` in the guide folder is appended after the engine CSS. Keep it for small,
guide-specific fixes (Bio Metro uses one rule). Use tokens, and scope rules to an id:

```css
@media (max-width:700px){ #lr-prod text{font-size:12.5px} }
```
