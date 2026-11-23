# 09 · Laptops, tablets and phones

The same file adapts to the screen. Test sizes used by `tools/shots.js`: laptop
1440 × 900, tablet 820 × 1180, phone 390 × 844.

## Breakpoints

| Width | What changes |
|---|---|
| ≥ 1100 px | Sidebar route on the left; sidebar toggle in the top bar |
| 1000 px + landscape | Explainer shows text and visual side by side |
| 761–1099 px | No sidebar; phone bar at the bottom with **Contents**; full top bar (labels shorten between 761 and 900) |
| ≤ 760 px | Compact top bar: where you are + **Options** (all settings move into the Options sheet) |
| ≤ 700 px (phone) | Visuals fit the width (no sideways scrolling), SVG text enlarged and kept inside the frame; terms, steps and cards fold; long callouts get "Read more"; tables restyle |
| ≤ 600 px | Theme switch shows only the current mode (tap to cycle, with a toast) |
| ≤ 560 px | Tighter spacing on openers and headers |
| ≤ 380 px | Smallest phones: a few sizes reduce further |
| map < 680 px | The metro map turns vertical (lines run down, in blocks of three) |

Also honoured: `prefers-reduced-motion` (animations off by default),
`prefers-reduced-transparency` (no glass), `prefers-contrast: more` (stronger borders),
`prefers-color-scheme` (Auto theme).

## Phone rules (built in)

- **No sideways scrolling.** Visual boxes fit the screen width; `shots.js` reports any
  element wider than the screen.
- **No text walls.** Terms, steps and cards fold to a list of titles; tap to open one.
  Callouts over 300 characters collapse with "Read more". `check.py` warns about
  paragraphs over 90 words.
- **One question at a time** in every quiz, with a dot row to move between answered
  questions.
- **Tables**: comparison tables stay tables (with coloured columns); data tables turn
  each row into a labelled card.
- **Sheets** (Contents, Options) slide up from the bottom and close with Done, the
  scrim, Esc or a swipe down.
- Tap targets are at least about 40 px.

## Visuals on phones

| Visual | Phone behaviour |
|---|---|
| Kits | Redraw for the real width with real-size text (see [04](04-visual-kits.md)) |
| Custom SVG | Scales down to the width; text enlarged to 16.5 units (`.ts` 14.5, `.tl` 19) and nudged inside the frame. Design at 480–640 units wide with short labels |
| `viz wide` | Same as custom on phones (the 660 px minimum is laptops only) |
| `viz narrow` | Stays narrow and centred on laptops; fills the width on phones |

## Checking

```bash
node tools/shots.js my-guide/out/my-guide.html                 # all sizes, both themes
node tools/shots.js my-guide/out/my-guide.html --sizes ph --viz # every visual on a phone
```
Read `shots/report.txt`: sideways scrolling, text sticking out of a visual, small
tap targets, JavaScript errors.
