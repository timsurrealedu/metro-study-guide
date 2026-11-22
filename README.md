# Metro Study Guide

Interactive, offline-ready HTML study guide workflow built on **Metro Engine v1** and adapted for **Gemini**, **Gemini Notebooks (NotebookLM)**, and **Google Drive** course materials.

## What's Included

- `SKILL.md` — Gemini skill definition for building Metro study guides from Notebooks, Drive, or uploaded materials
- `engine/` — Metro Engine v1 (`metro.css`, `metro.js`, `kit.js`, `explainer.js`, `boot.html`)
- `tools/` — CLI tools (`new.py`, `check.py`, `build.py`, `verify_chromium.py`, `cssprune.py`, `shots.js`)
- `starter/` — Minimal starter guide template
- `references/` — Core Metro Engine documentation and subject playbooks

## Quick Start

Requires Python 3.8+ (no external packages needed):

```bash
python3 tools/new.py guides/my-course "Course Metro" --lines 3 --id my-course-2026
# Edit guides/my-course/{guide.json,content.html,quiz.json,flash.json,visuals.js}
python3 tools/check.py guides/my-course
python3 tools/build.py guides/my-course
python3 tools/verify_chromium.py guides/my-course/out/my-course-2026.html
```

Open `guides/my-course/out/my-course-2026.html` in any browser (works offline).

## Pushing to GitHub

This archive includes an initialized `.git` repository with an initial commit on `main`. After unzipping:

```bash
cd metro-study-guide
git remote add origin https://github.com/<your-username>/metro-study-guide.git
git push -u origin main
```
