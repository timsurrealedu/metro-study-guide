# 13 · Accessibility and storage

## Accessibility

| Area | What the engine does | What you do |
|---|---|---|
| Labels | Every button has visible text or an `aria-label`; switches are `role="switch"` with `aria-checked`; segmented controls are groups with labels | Give custom controls `<label for>` or `aria-label` |
| Visuals | The player has labelled buttons; captions are `aria-live` so steps are announced | Set `alt` on every kit, `aria-label` on every custom `<svg role="img">` |
| Images | — | `alt` on every `<img>` (`check.py` warns) |
| Keyboard | Tab through everything; Space/Enter flips cards and opens fold-outs; Esc closes sheets and the font panel; ← → move in explainer mode | Use `<button>` for anything clickable |
| Focus | Sheets focus their first item; quizzes move focus to the next question | — |
| Motion | `prefers-reduced-motion` turns animations off by default; the Animations switch stops every animation, tween, flowing dot and particle | Use `V.tween` and `E.tickers` (they obey the switch) |
| Transparency | `prefers-reduced-transparency` removes glass | — |
| Contrast | Line colours checked at build (white on fill ≥ 4.5 : 1, text on paper ≥ 4.8 : 1); `prefers-contrast: more` strengthens borders | Don't put colour-only meaning in content |
| Colour | Right/wrong also use ✓ / ✗ icons and words | Same in your visuals: label, don't just colour |
| Language | `<html lang>` from `guide.json` `lang` | Set `"lang": "id"` for Indonesian guides |

## What is saved, and where

Everything is saved **in the reader's browser only**, nothing is sent anywhere.

`localStorage`, keys prefixed with the guide's `id` (`<id>:<key>`):

| Key | Holds |
|---|---|
| `done` | Stations marked learned |
| `quiz` | Answers: `{ "<set>|<question id>": {done, ok, sel} }` |
| `theme` | `auto` / `light` / `dark` |
| `motion` | `on` / `off` |
| `side` | Sidebar `shown` / `hidden` |
| `mode` | Last reading mode: `scroll` / `explain` |
| `modeSkip` | "Remember my choice" |
| `exPos` | Last explainer screen |

**IndexedDB** holds fonts the reader loaded (so they persist without re-uploading).

Consequences:
- Changing `id` starts everyone fresh; keep it stable across updates.
- Reordering questions without `id`s can mix up saved answers (ids default to the
  position). Give ids, or accept that answers reset.
- A private window or cleared site data starts fresh; the guide still works (every
  storage call is wrapped in `try`).
- Progress doesn't follow the reader to another device.
