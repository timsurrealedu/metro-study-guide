# 12 · Design rules

The house rules every Metro guide follows. Most are built into the engine; the rest
are about how content is written. `check.py` enforces the ones it can.

## Layout and navigation

| Rule | How |
|---|---|
| A **progress sidebar** on laptops | Built in (metro route, progress per line) |
| **One scrollable page**, no tabs | Built in (scroll mode) |
| **Light / dark** switch (plus Auto) | Built in |
| **Clear breaks** between lines, stations and sections | Line openers, station header signs, section labels (`data-eb`) |
| **Metro theme**: map overview, metro-route sidebar, one colour per line | Built in; colours from `guide.json` |
| **Boot screen**, then a **picker** between Scroll and Explainer | Built in |
| Explainer: progress bar on top, explainer text, then the visual/table, Back/Next, one screen at a time, scaled up on tablets and laptops | Built in |

## Look

| Rule | How |
|---|---|
| Apple Human Interface Guidelines feel: clear hierarchy, generous spacing, SF Pro, plain labels | Built in |
| **Notebook / scrapbook** paper: dot grid, white cards with dark borders and hard shadows, slightly tilted callouts | Built in |
| **Keychron K5 greys** as the base; **each line has its own accent colour** (no single orange accent) | Built in; pick distinct line colours |
| Glass only where natural (floating bars, sheets), subtle | Built in |
| **Visual boxes contrast with the page** and go **light in light mode** | Built in |
| Colours inside diagrams follow the theme | Use SVG classes and tokens, never fixed colours |
| Fonts: SF Pro / system font; **drag-and-drop font loader** | Built in |

## Visuals

| Rule | How |
|---|---|
| **Animated** wherever it helps | Kits animate; custom visuals use `V.tween`, `E.flow`, `E.tickers` |
| **Every visual has Play and Next** (play through, or one step at a time) | Built in (the player) |
| **Structure sections get visuals too** (parts of a seed, of a cell, of a text) | `Kit.diagram`, `Kit.annotate` |
| Visuals fit phone screens: **no sideways scrolling** | Kits redraw; custom SVGs scale; `shots.js` checks |
| An Animations switch turns all motion off; reduced-motion devices start with it off | Built in |

## Content

| Rule | How |
|---|---|
| **Simple, not over-explained**, but with a **lead** before every visual, table or list | `p.lead`; `check.py` warns |
| **More explanation, less clutter** | Short paragraphs; fold-outs for extras; one idea per section |
| **No text walls** (especially on phones) | Paragraphs ≤ ~60 words; terms/steps/cards fold on phones; `check.py` warns over 90 |
| **Comparisons are tables** | Comparison table (empty first header cell) |
| **Simple English with the teacher's exact terms**, plus the class-language term | `<b>term</b>` + `<span class="id">istilah</span>` |
| **Follow the teacher** where materials disagree, and say so | R4 "Notes on your materials" |
| **Flag unclear content** instead of guessing | A `note` in R4 |
| **Examples are plain real-life notes**, titled "Example", never themed to the metro | `.callout.eg` |
| The theme is only the look | No metro analogies in explanations |

## Practice

| Rule | How |
|---|---|
| **Traps and quizzes at the end of each line**, not after every station | `<div class="traps">` → automatic checkpoint |
| **Collapsible** | Checkpoint rows fold |
| **Quizzes show one question at a time**; the next appears after answering | Built in |
| Every wrong option explains why | Third item in each option; `check.py` warns |
| A review line: cheat sheet, flashcards, practice exam, notes | `data-part="R"` |
| **Hands-on practice** where it helps: drag into order, fill in the blanks, find the mistakes, match pairs; everything works by tap as well as drag | `.drill` blocks (v1.3) |

## Controls

| Rule | How |
|---|---|
| **Every control is labelled or described** (no unexplained icons or switches), without adding clutter | Built in: text labels on the top bar; Options sheet with descriptions; aria-labels |
| **Sheets and panels are closable** (Done, scrim, Esc, swipe) | Built in |
| Phones: compact top bar + bottom bar; everything else in Options | Built in |

## When adding something new

- Use an existing block or kit if one fits; extend the engine only when a pattern will
  be reused across subjects.
- New visuals: Play/Next, a lead, theme colours, phone check.
- New controls: a visible label or description.
- New CSS: tokens only, both themes, test 390 px wide.
- Run `check.py`, build, and `shots.js` before sharing.
