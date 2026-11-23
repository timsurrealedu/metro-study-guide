# 01 · Overview

## The idea in one paragraph

A study guide is a **metro network**. Each **part** of the syllabus is a coloured
**line**; each **chapter** on it is a **station**; every line runs into one
**interchange**, and from there a grey-blue **Review line** (cheat sheet, flashcards,
practice exam, notes) runs to the **terminus**: the exam. The metro theme is only the
look and the navigation. The content itself is plain: simple English, the teacher's
exact terms, examples from real life.

![Title card and map](img/03-title-map.png)

## What you write, what the engine does

| You write | The engine does |
|---|---|
| `guide.json`: title, lines (name + colour), a few texts | Boot screen, mode picker, title card, every colour token in light and dark, the metro map, the sidebar route, the phone bars |
| `content.html`: lines (`section.part`) holding stations (`article.chapter`) made of blocks | Station headers and footers, "Mark as learned", "Next station" links, scroll spy, progress, fold-outs on phones, the checkpoint at the end of each line, explainer screens |
| `quiz.json`, `flash.json` | Quizzes (one question at a time, scored, saved), checkpoints, the practice exam, flashcards |
| `visuals.js`: one `Kit.…` call per visual (or a hand-drawn one) | The player (Start over · Back · Play · Next), captions, step bars, the Animations switch, responsive redraws, light/dark colours |
| `style.css` (rarely) | — |

## The build pipeline

```
guide.json ─┐
content.html┤  tools/check.py  →  errors and warnings
quiz.json   ┤
flash.json  ┤  tools/build.py  →  out/<id>.html   (one file, works offline)
visuals.js  ┤      │
style.css   ┤      ├─ shorthands expanded (headers, footers, icons, checkpoints)
assets/     ┘      ├─ line colours → CSS tokens (light + dark, contrast-checked)
                   ├─ boot screen + title card generated
                   ├─ images in assets/ inlined
                   └─ engine CSS + JS inlined (kit only if used)
```

## The parts of a built guide

1. **Boot screen** (≈1.5 s; instant with reduced motion) → **mode picker**: Scroll or
   Explainer, with "Remember my choice". [docs/08](08-modes.md)
2. **Scroll mode**: top bar with labelled controls; on laptops a sidebar route; title
   card; metro map; then each line: a **line opener**, its **stations**, and its
   **checkpoint**; then the **Review line**.
3. **Explainer mode**: the same content, one idea per screen; the visual is the centre
   of each screen; Back / Next; a Stations sheet and Options.
4. **Phones**: compact top bar with an Options sheet, a bottom bar with progress and a
   Contents sheet, folding terms and steps, one question at a time. [docs/09](09-responsive.md)

## A station, top to bottom

```
station header   number sign · eyebrow (line) · tag · title · big idea
section          small coloured label (data-eb) + heading
                 lead paragraph (what to look at)
                 a block: visual / table / terms / steps / callout …
section          …
footer           Mark chapter as learned · Next: 1.2 …
```

Traps and questions are **not** inside the station. They are collected into the
**checkpoint** at the end of the line (one folding row per station), so stations stay
short and the end of each line is a self-test.

## Where to go next

- Write content: [03 Content blocks](03-content-blocks.md)
- Add visuals: [04 Visual kits](04-visual-kits.md), then [05 Custom visuals](05-custom-visuals.md)
- Plan a subject: [11 Subject playbook](11-subject-playbook.md)
- The house rules: [12 Design rules](12-design-rules.md)
