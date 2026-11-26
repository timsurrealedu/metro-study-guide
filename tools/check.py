#!/usr/bin/env python3
"""
Metro Engine v1.5 — check a guide folder before building it.

    python3 tools/check.py <guide-folder>

Needs only Python 3.8+. Prints ERRORS (the guide will break or look wrong)
and WARNINGS (it works, but breaks a house rule from docs/12-design-rules.md).
Exit code 1 if there are errors, so you can chain it:

    python3 tools/check.py my-guide && python3 tools/build.py my-guide
"""
import json, re, sys, pathlib
from html.parser import HTMLParser

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import build  # colour maths and shorthand expansion live there

# class names the engine uses for its own behaviour; content must not reuse them
RESERVED = {"ex": "explainer screen (hides the element)", "rv": "settle-in animation", "hide": "visual helper (hides)",
            "dim": "visual helper (fades)", "in": "settle-in state", "kit": "visual kit", "mst": "metro map station",
            "open": "sheet state", "pick": "mode picker", "boot": "boot screen", "sheet": "contents sheet", "side": "sidebar"}
RESERVED_PREFIX = ("ex-", "k-", "mode-", "kd", "ka-")

class Node:
    def __init__(self, tag, attrs, parent, line):
        self.tag, self.attrs, self.parent, self.line = tag, dict(attrs), parent, line
        self.kids, self.text = [], ""
    @property
    def cls(self): return set((self.attrs.get("class") or "").split())
    def find(self, pred):
        out = []
        for k in self.kids:
            if pred(k): out.append(k)
            out += k.find(pred)
        return out
    def up(self, pred):
        n = self.parent
        while n is not None:
            if pred(n): return n
            n = n.parent
        return None
    def alltext(self): return self.text + " ".join(k.alltext() for k in self.kids)

VOID = {"br", "img", "input", "meta", "link", "hr", "source", "use", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "stop"}

class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", {}, None, 0); self.cur = self.root; self.problems = []
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur, self.getpos()[0]); self.cur.kids.append(n)
        if tag not in VOID: self.cur = n
    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(Node(tag, attrs, self.cur, self.getpos()[0]))
    def handle_endtag(self, tag):
        if tag in VOID: return
        n = self.cur
        while n is not None and n.tag != tag: n = n.parent
        if n is None:
            self.problems.append((self.getpos()[0], f"</{tag}> has no matching <{tag}>")); return
        if n is not self.cur:
            self.problems.append((self.cur.line, f"<{self.cur.tag}> opened on line {self.cur.line} is never closed (closed by </{tag}> on line {self.getpos()[0]})"))
        self.cur = n.parent
    def handle_data(self, data): self.cur.text += data

def main(folder):
    folder = pathlib.Path(folder)
    E, W = [], []
    err = lambda m: E.append(m)
    warn = lambda m: W.append(m)
    if not (folder / "guide.json").exists(): print(f"ERROR: {folder}/guide.json not found"); return 1
    try: g = json.loads((folder / "guide.json").read_text(encoding="utf-8"))
    except Exception as e: print(f"ERROR: guide.json is not valid JSON: {e}"); return 1
    for k in ("id", "title", "lines"):
        if k not in g: err(f"guide.json: missing \"{k}\"")
    lines = g.get("lines", {})
    if g.get("id") and not re.fullmatch(r"[a-z0-9][a-z0-9-]*", g["id"]): warn("guide.json: id should be lowercase letters, digits and dashes (it is the storage key and file name)")
    if "R" not in lines: warn("guide.json: no review line \"R\" (cheat sheet, flashcards, practice exam)")
    for k, v in lines.items():
        c = v.get("color", "")
        if not re.fullmatch(r"#[0-9a-fA-F]{6}", c): err(f"line {k}: color must be a 6-digit hex like #1b79cd (got {c!r})"); continue
        if not v.get("name"): warn(f"line {k}: no name")
        if build.contrast("#ffffff", c) < 4.5: warn(f"line {k}: {c} is too light for white text ({build.contrast('#ffffff', c):.1f}:1); the build darkens it. Pick a darker colour to keep yours exactly")
    if len(lines) > 9: warn(f"{len(lines)} lines: the map gets crowded past 7. Merge small lines")

    rd = lambda p: (folder / p).read_text(encoding="utf-8") if (folder / p).exists() else ""
    raw = rd("content.html")
    if not raw: err("content.html is missing or empty")
    try: quiz = json.loads(rd("quiz.json") or "[]")
    except Exception as e: err(f"quiz.json is not valid JSON: {e}"); quiz = []
    try: flash = json.loads(rd("flash.json") or "[]")
    except Exception as e: err(f"flash.json is not valid JSON: {e}"); flash = []
    vis = rd("visuals.js")

    t = Tree(); t.feed(raw)
    for ln, m in t.problems[:12]: err(f"content.html line {ln}: {m}")
    # build's shorthand expansion, so the checks see what the page will contain
    try: html = build.expand(raw, g, build.normalise_quiz(json.loads(json.dumps(quiz))))
    except Exception as e: err(f"shorthand expansion failed: {e}"); html = raw
    T = Tree(); T.feed(html); R = T.root

    parts = R.find(lambda n: n.tag == "section" and "part" in n.cls)
    pkeys = [p.attrs.get("data-part") for p in parts]
    for k in lines:
        if k not in pkeys: warn(f"line {k} is in guide.json but has no <section class=\"part\" data-part=\"{k}\">")
    for p in parts:
        k = p.attrs.get("data-part")
        if k not in lines: err(f"line {p.line}: part data-part=\"{k}\" is not in guide.json lines")
        for a in ("data-title", "data-kicker"):
            if not p.attrs.get(a): warn(f"line {p.line}: part {k} has no {a}")

    chs = R.find(lambda n: n.tag == "article" and "chapter" in n.cls)
    ids = {}
    for c in chs:
        cid = c.attrs.get("id")
        if not cid: err(f"line {c.line}: a chapter has no id"); continue
        if cid in ids: err(f"line {c.line}: duplicate chapter id \"{cid}\"")
        ids[cid] = c
        if not c.up(lambda n: n.tag == "section" and "part" in n.cls): err(f"line {c.line}: chapter {cid} is not inside a <section class=\"part\">")
        for a in ("data-n", "data-title"):
            if a not in c.attrs: err(f"chapter {cid}: missing {a}")
        if "checkpoint" not in c.cls and not c.attrs.get("data-short"): warn(f"chapter {cid}: add data-short (the name on the map and in the contents)")
        if len(c.attrs.get("data-short", "")) > 22: warn(f"chapter {cid}: data-short \"{c.attrs['data-short']}\" is long for the map; aim for 18 characters or fewer")
    all_ids = {n.attrs["id"]: n for n in R.find(lambda n: "id" in n.attrs)}

    for s in R.find(lambda n: "sec" in n.cls):
        h3 = [k for k in s.kids if k.tag == "h3"]
        if not h3: warn(f"line {s.line}: a .sec has no <h3> heading")
        heavy = s.find(lambda n: n.cls & {"viz", "tbl-wrap", "steps", "sorter", "grid2", "grid3", "drill", "proof-tpl"})
        lead = s.find(lambda n: n.tag == "p" and "lead" in n.cls)
        if heavy and not lead and not s.up(lambda n: "checkpoint" in n.cls) and not s.up(lambda n: n.attrs.get("data-part") == "R"):
            warn(f"line {s.line}: section \"{h3[0].alltext().strip() if h3 else '?'}\" has a visual/table/steps but no <p class=\"lead\"> to introduce it")
    for p in R.find(lambda n: n.tag == "p"):
        words = len(p.alltext().split())
        if words > 90: warn(f"line {p.line}: a paragraph of {words} words. Split it, or turn it into steps, terms or a table (no text walls)")
    for tr in R.find(lambda n: "callout" in n.cls and "trap" in n.cls):
        if not tr.up(lambda n: "checkpoint" in n.cls or "cp-body" in n.cls):
            warn(f"line {tr.line}: a trap callout outside the checkpoint. Put traps in <div class=\"traps\"> at the end of the station")
    for dl in R.find(lambda n: n.tag == "dl" and "terms" in n.cls):
        if dl.find(lambda x: x.tag in ("dt", "dd")):
            warn(f"line {dl.line}: <dl class=\"terms\"> should contain <div><b>Term</b><span class=\"d\">Definition</span></div> cards, not <dt>/<dd> tags")
    for tb in R.find(lambda n: n.tag == "table" and bool(n.cls & {"tbl", "cmp"})):
        if not tb.up(lambda x: bool(x.cls & {"tbl-wrap", "cmp-wrap"})):
            warn(f"line {tb.line}: <table> should be wrapped in <div class=\"tbl-wrap\"> (or .cmp-wrap) so phones do not scroll sideways")
    for sp in R.find(lambda n: n.tag == "span" and "m" in n.cls):
        txt = sp.alltext().strip()
        if re.search(r"\b(?:Kit|Engine|console|window|document)\.[A-Za-z_]|https?://|`", txt):
            warn(f"line {sp.line}: <span class=\"m\"> looks like code (\"{txt[:32]}\"); use <code> for code identifiers and <span class=\"m\"> only for math")
    for n in R.find(lambda n: bool(n.cls)):
        if n.up(lambda x: x.tag == "svg") or n.tag == "svg": continue
        for c in n.cls:
            if (c in RESERVED and not (c == "kit")) or (c.startswith(RESERVED_PREFIX) and c not in ("ex-where",)):
                if c == "in" or c == "open": continue
                err(f"line {n.line}: class \"{c}\" is reserved by the engine ({RESERVED.get(c, 'engine internals')}). Rename it")
    # drills (v1.3): order, cloze, spot, match
    for d in R.find(lambda n: "drill" in n.cls):
        kinds = d.cls & {"order", "cloze", "spot", "match"}
        if len(kinds) != 1: err(f"line {d.line}: a .drill needs exactly one kind: order, cloze, spot or match"); continue
        k = kinds.pop(); ps = [x for x in d.kids if x.tag in ("p", "li")]
        if k == "order" and len(ps) < 3: err(f"line {d.line}: an order drill needs at least 3 <p> items, written in the right order")
        if k == "order" and len(ps) > 10: warn(f"line {d.line}: an order drill with {len(ps)} items is long on phones; aim for 10 or fewer")
        if k == "cloze" and not d.find(lambda x: "gap" in x.cls): err(f"line {d.line}: a cloze drill has no <span class=\"gap\">answer</span>")
        if k == "cloze" and len(d.find(lambda x: "gap" in x.cls)) > 10: warn(f"line {d.line}: more than 10 blanks; split the cloze in two")
        if k == "spot" and not d.find(lambda x: x.tag == "s" and "data-fix" in x.attrs): err(f"line {d.line}: a spot drill has no <s data-fix=\"…\">mistake</s>")
        if k == "match":
            if len(ps) < 2: err(f"line {d.line}: a match drill needs at least 2 <p><b>term</b> meaning</p> items")
            if any(not p.find(lambda x: x.tag == "b") for p in ps): err(f"line {d.line}: every match item needs its term in <b>")
            if len(ps) > 8: warn(f"line {d.line}: a match drill with {len(ps)} pairs is long on phones; aim for 6 or fewer")
    for img in R.find(lambda n: n.tag == "img"):
        if not img.attrs.get("alt") and img.attrs.get("alt") != "": warn(f"line {img.line}: <img> without alt text")

    # visuals
    vizs = R.find(lambda n: "viz" in n.cls)
    for v in vizs:
        vid = v.attrs.get("id")
        if not vid: err(f"line {v.line}: a .viz has no id, so visuals.js can't find it"); continue
        if not re.search(r"[\"'`#]" + re.escape(vid) + r"[\"'` ]", vis): warn(f"visual #{vid} is never used in visuals.js (it will be an empty box)")
    for m in re.finditer(r"Kit\.(\w+)\(\s*[\"'`]([\w-]+)[\"'`]", vis):
        kind, vid = m.group(1), m.group(2)
        if kind not in ("diagram", "flow", "cycle", "timeline", "graph", "bars", "particles", "derive", "annotate", "tree", "dag", "dp", "network", "trim", "venn"): err(f"visuals.js: Kit.{kind} does not exist")
        if vid not in all_ids: err(f"visuals.js: Kit.{kind}(\"{vid}\") but content.html has no element with id=\"{vid}\"")
        if kind == "derive":
            bstart = vis.find("{", m.end())
            if bstart >= 0:
                depth, bend = 0, bstart
                while bend < len(vis):
                    if vis[bend] == "{": depth += 1
                    elif vis[bend] == "}":
                        depth -= 1
                        if depth == 0: break
                    bend += 1
                block = vis[bstart:bend + 1]
                if not re.search(r"\[\[[^|\]]+\|[vcfgrkas](?:\|[^\]]+)?\]\]", block):
                    warn(f"visuals.js: Kit.derive(\"{vid}\") has no semantic color roles [[expr|role|tid]]")
                if not re.search(r"\bframes\s*:", block) and "~~" not in block and not re.search(r"\bafter\s*:", block):
                    warn(f"visuals.js: Kit.derive(\"{vid}\") has no micro-frame animations (frames / ~~...~~ / after)")
                if not re.search(r"\b(?:how|tip)\s*:", block):
                    warn(f"visuals.js: Kit.derive(\"{vid}\") has no how or tip explanations")
    for m in re.finditer(r"V\.svg\(\s*[\"'`]([\w-]+)[\"'`]\)", vis):
        if m.group(1) not in all_ids: err(f"visuals.js: V.svg(\"{m.group(1)}\") but there is no element with that id")
    for m in re.finditer(r"<path\b[^>]*>", vis):
        tag_s = m.group(0)
        if re.search(r"\bpathLength\s*=", tag_s) and re.search(r"flowline|stroke-dasharray", tag_s):
            warn("visuals.js: do not combine pathLength=\"1\" with .flowline or pixel stroke-dasharray (causes blinking/stretched dashes); use real pixel lengths (--plen)")
    for m in re.finditer(r"<marker\b[^>]*>", vis):
        tag_s = m.group(0)
        if not re.search(r"markerUnits\s*=\s*[\"']userSpaceOnUse[\"']", tag_s):
            warn("visuals.js: custom <marker> should set markerUnits=\"userSpaceOnUse\" so arrowheads never bloat or detach when stroke-width changes")

    # quiz
    sets_used = {q.attrs.get("data-set") for q in R.find(lambda n: "quiz" in n.cls)}
    qids, sets_have = set(), set()
    for i, q in enumerate(quiz):
        tag = f"quiz.json item {i + 1}" + (f" ({q.get('id')})" if q.get("id") else "")
        if q.get("id") and q.get("id") in qids: err(f"{tag}: duplicate id")
        qids.add(q.get("id"))
        if not q.get("q"): err(f"{tag}: no question text \"q\"")
        o = q.get("o") or []
        if len(o) < 2: err(f"{tag}: needs at least 2 options in \"o\""); continue
        right = sum(1 for x in o if isinstance(x, list) and len(x) > 1 and x[1] is True)
        if q.get("multi"):
            if right < 1: err(f"{tag}: a multi question needs at least one correct option")
        elif right != 1: err(f"{tag}: needs exactly one correct option (found {right}). Set \"multi\": true for select-all")
        if any(isinstance(x, list) and len(x) > 1 and not x[1] and not (len(x) > 2 and x[2]) for x in o): warn(f"{tag}: some wrong options have no reason (third item). Say why each is wrong")
        if not q.get("e"): warn(f"{tag}: no explanation \"e\"")
        see = q.get("see")
        if see and see not in ids: err(f"{tag}: see=\"{see}\" is not a chapter id")
        sets = q.get("sets") or ([see] if see else []) + (["exam"] if q.get("exam") else [])
        if not sets: warn(f"{tag}: not in any set (add \"see\" or \"sets\"), so it never shows")
        sets_have.update(sets)
    for s in sets_used:
        if s and s not in sets_have: warn(f"quiz set \"{s}\" is placed in content.html but has no questions")
    for i, f in enumerate(flash):
        if not f.get("f") or not f.get("b"): err(f"flash.json item {i + 1}: needs \"f\" (front) and \"b\" (back)")
    if flash and not R.find(lambda n: "flash" in n.cls): warn("flash.json has cards but content.html has no <div class=\"flash\">")
    if not quiz: warn("quiz.json is empty: checkpoints and the practice exam will have no questions")

    seen = {}
    for w in W:
        key = re.sub(r"item \d+( \([^)]*\))?", "item N", w)
        seen.setdefault(key, []).append(w)
    for key, ws in seen.items():
        print("warning:", ws[0] if len(ws) == 1 else f"{ws[0]}  (and {len(ws) - 1} more like this)")
    for e in E: print("ERROR:", e)
    n_st = len([c for c in chs if "checkpoint" not in c.cls])
    print(f"\n{folder.name}: {len(parts)} lines, {n_st} stations, {len(vizs)} visuals, {len(quiz)} questions, {len(flash)} cards"
          f" — {len(E)} error(s), {len(W)} warning(s)")
    return 1 if E else 0

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"): print(__doc__); sys.exit(0)
    sys.exit(main(sys.argv[1]))
