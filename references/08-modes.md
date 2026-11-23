# 08 · Modes: boot, picker, scroll, explainer

## Boot screen

A short animation while fonts load: one track per line draws in, a train runs to the
terminus sign, and the status reads *Laying the track → Painting the lines → Opening
the stations → Ready*. It lasts about 1.5 s (0.25 s with reduced motion) and is built
from `engine/boot.html` with the guide's title, eyebrow, terminus and line colours.

## Mode picker

"How do you want to ride?" with two big cards:

| Choice | What it is |
|---|---|
| **Scroll** | The whole guide on one page (the original layout) |
| **Explainer** (badge "New") | Full screen, one idea at a time, built around the visual |

The card used last time is marked "Last used" and focused. The subtitle shows progress
("3 of 16 stations done") once there is some. **Remember my choice** skips the picker
on the next visit. The top bar's **Explainer** button
and Options › Reading mode switch at any time, keeping your place.

## Scroll mode

| Area | Contents |
|---|---|
| Top bar (floating, glass) | Sidebar toggle (laptops) · where you are (line colour + station) · Explainer · Font · Animations switch · Auto / Light / Dark. On phones: where you are + **Options**. |
| Sidebar (laptops ≥ 1100 px) | Guide name, overall progress bar, then each line as a metro route: badge, name, done count, stations as rings (filled when learned), the checkpoint as a square. Tap to jump. Remembered open/closed. |
| Title card | Line stripe, eyebrow, title with highlighted word, lede |
| Metro map | All lines, stations (links), interchange, review line, terminus; legend with progress; **Next station** + Start |
| Each line | Line opener (band, badge, name, lede, station chips) → stations → checkpoint |
| Each station | Header (sign, eyebrow, tag, title, big idea) → sections → footer ("Mark chapter as learned", "Next: …") |
| Phone bar (phones and tablets) | Progress ring · current station · **Contents** (the route as a bottom sheet) |

Scroll spy keeps the top bar, sidebar and phone bar on the station being read.

## Explainer mode

The same content nodes are **moved** into a full-screen card (and moved back when you
leave), so visuals, quizzes and sliders keep their state.

| Area | Contents |
|---|---|
| Top | **Stations** (the route sheet) · line badge + station name · **Scroll** + **Options** (one capsule; Scroll goes back to the scroll page at the same station, v1.1) · one bar per screen in this station |
| Card | Laptops (wide and landscape): text on the left, the visual on the right. Phones: text above, visual below. Title screens (title card, line openers, station headers) are centred. |
| Bottom | **Back** · **Next** (it says "Start riding" on the map, "Next station" at the end of a station, "Finish" at the very end) · screen count · "Mark as learned" on the last screen of a station |

Keys: → / PageDown next, ← / PageUp back. Swipe left/right on the card (not on a
visual, slider, table or the map). Links inside the explainer jump to the right screen.
The position is remembered.

### How screens are made

The engine walks each station in order:

1. The title card, then the map.
2. Each line opener.
3. Each station header (number, title, big idea).
4. Inside each `.sec`:
   - paragraphs and lists become **text**; a new screen starts when text would pass
     about 520 characters, or after a visual;
   - a visual, table, terms list, steps, cards, sorter or quiz is **media**: it gets the
     screen with the text just before it (normally the `h3` + `p.lead`);
   - `details.more`, `.caption`, `p.small`, `p.muted` stick to the screen above;
   - callouts group two to a screen;
   - each checkpoint row (`details.cp`) becomes short screens (v1.2): its traps two to a
     screen ("Watch out for · 1 of 2"), then its quiz ("Test yourself").
5. Anything outside a `.sec` gets a screen of its own.

So: **lead first, then the block** gives the best explainer screens. A section with a
visual and three long paragraphs after it becomes several screens.

### Fitting (v1.2): no screen ever scrolls

Every screen fits the window on phones, tablets and laptops, in either orientation.
The engine tries these in order and stops as soon as the screen fits:

1. **Arrange.** On wide screens (≥ 900 px and landscape) a visual's caption, player and
   sliders move under the text in the left column (in a box like the visual's), so
   the right column holds only the picture. A heading-only screen that would need
   parts (a quiz on a short laptop) also goes heading-left, content-right.
2. **Sliders to a sheet.** On narrow screens, if a visual's sliders don't fit, they
   move into a **Try it yourself** sheet (button at the bottom right; Done or Esc
   closes it). The picture stays visible above the sheet.
3. **A window that follows the step.** A stepped visual that is still too tall (a
   worked example, a Horner table, a flow with lit boxes) shows a window onto itself
   that scrolls to the current step by itself, with soft fades at the edges.
4. **Shrink the drawing, not the words.** The tallest drawing gets up to 28 % shorter
   (34 % when the visual has the screen to itself).
5. **Shrink a little.** Everything else may zoom down to 74 % (88 % for tables, terms,
   callouts and worked examples; 90 % for quizzes, cards and sorters).
6. **Parts.** Otherwise the screen is split into parts at block, row, list-item or
   option boundaries. **Next** reads **More** until the last part, **Back** goes back a
   part, and the count shows "3 / 8 · part 1 of 2"; the bottom edge fades while more
   follows. On small phones a visual that can't share the screen with its text gets
   the second part to itself (words first, then the whole visual with its player).

Fitting reruns on every visual step, quiz answer, opened `details` and window resize.
On phones the step bars above a visual are hidden in the explainer (the player has its
own count). Check a guide with `node tools/shots.js` (explainer screenshots).

## Sheets

| Sheet | Opens from | Closes with |
|---|---|---|
| Contents (the route) | Phone bar **Contents**, explainer **Stations** | Done, the scrim, Esc, a swipe down, or choosing a station |
| Options | Phone top bar **Options**, explainer **Options** | Done, the scrim, Esc, a swipe down |

Options lists every setting with a short description: **Reading mode** (Scroll page /
Explainer), **Appearance** (Auto / Light / Dark), **Animations**, **Font**. Sheets are
dragged down by their grab handle or header.
