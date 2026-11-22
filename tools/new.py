#!/usr/bin/env python3
"""
Metro Engine v1 — start a new guide from the starter.

    python3 tools/new.py <folder> "<Title>" [--id my-guide-2026] [--lines 3]

Copies starter/ to <folder>, sets the id and title in guide.json, and adds
placeholder lines (Line 1 … Line N, each with its own colour) so the map and
boot screen already look right. Then: write content.html, run
tools/check.py <folder>, then tools/build.py <folder>.
"""
import json, re, shutil, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
# a palette that stays readable with white text and is easy to tell apart
PALETTE = ["#cf450e", "#1b79cd", "#a61e4d", "#29823b", "#7048e8", "#b35c00", "#0f766e", "#c2255c", "#5c7cfa"]

def main(a):
    if len(a) < 2 or a[0] in ("-h", "--help"): print(__doc__); return 0
    dest, title = pathlib.Path(a[0]), a[1]
    if dest.exists(): print(f"{dest} already exists; pick a new folder"); return 1
    gid = a[a.index("--id") + 1] if "--id" in a else re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    n = int(a[a.index("--lines") + 1]) if "--lines" in a else 1
    shutil.copytree(ROOT / "starter", dest, ignore=shutil.ignore_patterns("out"))
    g = json.loads((dest / "guide.json").read_text(encoding="utf-8"))
    words = title.split()
    g.update(id=gid, title=title, highlight=words[-1] if len(words) > 1 else "", icon=words[0][:4])
    g["lines"] = {str(i + 1): {"name": f"Line {i + 1} name", "color": PALETTE[i % len(PALETTE)]} for i in range(n)}
    g["lines"]["R"] = {"name": "Review", "color": "#0b7285"}
    (dest / "guide.json").write_text(json.dumps(g, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Created {dest} (id {gid}, {n} line{'s' if n > 1 else ''} + review).")
    print(f"Next: edit {dest}/content.html, then\n  python3 tools/check.py {dest}\n  python3 tools/build.py {dest}")
    return 0

if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
