# 06 · Quizzes, flashcards, sorters, checkpoints

## quiz.json

A list of questions. Short form (recommended):

```json
[
  {"see": "c1-1", "exam": true, "src": "Exercise PSAS",
   "q": "Why does a catalyst make a reaction faster?",
   "o": [["It gives the reaction a path with a lower activation energy", true, "More collisions now have enough energy."],
         ["It makes the particles move faster", false, "That is what heating does."],
         ["It is used up and releases energy", false, "A catalyst is not used up."],
         ["It increases the amount of product", false, "It only makes the same product sooner."]],
   "e": "A catalyst lowers the activation energy. It is not used up."},

  {"see": "c1-1", "multi": true,
   "q": "Which changes make <b>more</b> collisions happen each second? Select all that apply.",
   "o": [["Raising the concentration", true, "More particles in the same space."],
         ["Adding a catalyst", false, "It makes collisions succeed, not happen more often."]],
   "e": "…"}
]
```

| Field | Required | Meaning |
|---|---|---|
| `q` | yes | Question (HTML allowed: `<b>`, `<i>`, `<sub>`) |
| `o` | yes | Options: `[text, isCorrect, why]`. `why` is shown under the option after answering; write one for every option. |
| `see` | recommended | The station it tests. Puts it in that station's set (checkpoint) and adds a "Review the lesson" link to wrong answers. |
| `exam` | no | `true` also puts it in the practice exam (`data-set="exam"`) |
| `e` | recommended | One-line explanation shown after answering |
| `src` | no | Source label on the card ("Exercise PSAS", "Slide 12", "LKS p. 40") |
| `multi` | no | Select-all question: several correct options and a "Check answer" button |
| `fixed` | no | Keep the options in the written order (for "All of the above") |
| `sets` | no | Long form instead of `see`/`exam`: `["c1-1", "exam"]` (Bio Metro uses this) |
| `id` | no | Stable id (default `q1`, `q2`, …). Saved answers are keyed by set + id, so **give ids if you will reorder questions** after people have started. |

**Options are shuffled at build time** in a stable order (the same every build), so
write the correct answer first if you like. `"shuffle": false` in `guide.json` turns
this off (Bio Metro keeps its published order this way).

`check.py` makes sure each question has exactly one correct option (or at least one
for `multi`), that `see` points to a real station, and warns about missing reasons.

### How a quiz behaves

- One question at a time. A row of dots shows each question (green right, red wrong);
  you can go back to answered questions but not skip ahead.
- Answering locks the card, marks right ✓ and wrong ✗, shows the reasons and the
  explanation, then "Next question" / "See your score".
- Score bar at the bottom, "Try again" resets that set. A perfect set gets a small
  celebration.
- Answers are saved (per guide, in this browser).
- Finishing a station's set with at least 60 % right marks that station as learned.

### Writing good questions (house style)

- Model them on the teacher's exercises and past papers; keep the teacher's terms.
- Wrong options should be the real mistakes students make (the traps), each with a
  one-line reason.
- 2–4 questions per station; 15–30 in the practice exam, covering every station.
- Mix recall, "which is the odd one out", reading a graph or table, and applying the
  idea to a new example.

## flash.json

```json
[
  {"k": "1.1", "f": "What is activation energy?", "b": "The <b>minimum energy</b> a collision needs to react."}
]
```
`k` is a small label (usually the station number), `f` the front, `b` the back.
Place cards with `<div class="flash"></div>` (normally station R2). Buttons:
Previous, Flip, Next, Shuffle; tap the card or press Space/Enter to flip.
Aim for 2–4 cards per station: definitions, the one number to remember, the
difference between two look-alike terms.

## Sorters

```html
<div class="sorter" data-bins="Legislasi|Anggaran|Pengawasan">
  <p data-bin="0" data-why="Making laws is the legislative function.">Discusses a bill with the President</p>
  <p data-bin="1">Approves the state budget</p>
  <p data-bin="2">Calls a minister to explain a policy</p>
</div>
```
One item at a time; the reader taps a bin; the log shows right/wrong with the reason.
"Sort again" restarts. Good for true/false-trap lists, classification (element or
compound, renewable or not, fact or opinion) and matching a function to a body.
From JavaScript: `E.sorter(box, [[html, bin, why], …], ["A", "B"])`.

## Checkpoints

The last station of every line. With the shorthand, each station ends with:

```html
<div class="traps">
  <div class="callout trap"><b>Short statement of the trap</b><div>Why it is wrong, and what is right.</div></div>
</div>
```
and the build creates:

```
Checkpoint (id cp-<line>)
  Traps and quick checks
  ▸ 1.1 Reaction rates      2 traps · 0/2 right
  ▸ 1.2 Moles               1 trap · 0/2 right
     Watch out for   → the station's traps
     Test yourself   → the station's quiz set (questions with "see": "c1-2")
     Go back to 1.2 Moles
```
Rows fold, so the end of the line is a short list; each row shows its score once
answered. In explainer mode each row is its own screen. Checkpoints don't count toward
progress and don't appear on the map.

## The review line

| Station | What goes in it |
|---|---|
| R1 Cheat sheet | Every comparison table again (compressed), key numbers, the order of each process, one line per formula |
| R2 Flashcards | `<div class="flash"></div>` |
| R3 Practice exam | `<div class="quiz" data-set="exam"></div>`: questions with `"exam": true`, in exam style |
| R4 Notes on your materials | One `note` callout per disagreement between sources or unclear point, saying which version the guide follows and why |

When every station is learned, the title card's "Next station" points to the practice
exam (or to a chapter marked `data-final`).
