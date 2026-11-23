#!/usr/bin/env python3
"""
Metro Engine v1.3 — build a study guide into ONE self-contained HTML file.

    python3 tools/build.py <guide-folder> [--fragment] [--min] [--out FILE]

Needs only Python 3.8+ (no installs, no internet).

A guide folder contains:
    guide.json     required  title, lines (colours), texts for the boot screen and title card
    content.html   required  the lines (parts) and stations (chapters), written with the blocks in docs/03
    quiz.json      optional  question bank  (docs/06)
    flash.json     optional  flashcards     (docs/06)
    visuals.js     optional  visuals: kit calls and/or custom drawings (docs/04, docs/05)
    style.css      optional  extra CSS for this guide only (rarely needed)
    assets/        optional  images used by content.html as src="assets/…"; they are inlined

Output: <guide-folder>/out/<id>.html  (or --out FILE)
    --fragment  writes the page without <!doctype>/<html>/<body>, for hosts that add their own skeleton
    --pretty    keeps CSS comments and spacing (bigger file; easier to read in the browser's inspector)

Lighter by default: CSS comments are stripped, and the visual kit (JS + CSS) is
only included when visuals.js calls Kit.something.
"""
import json, re, sys, base64, colorsys, pathlib, mimetypes

ROOT = pathlib.Path(__file__).resolve().parent.parent
ENGINE = ROOT / "engine"

# ---------------------------------------------------------------- colour maths
def h2r(h):
    h = h.strip().lstrip("#")
    if len(h) == 3: h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
def r2h(rgb): return "#" + "".join(f"{max(0, min(255, round(c * 255))):02x}" for c in rgb)
def mix(a, b, t):  # t = share of b
    A, B = h2r(a), h2r(b); return r2h(tuple(x + (y - x) * t for x, y in zip(A, B)))
def lum(h):
    f = lambda c: c / 12.92 if c <= .03928 else ((c + .055) / 1.055) ** 2.4
    r, g, b = (f(c) for c in h2r(h)); return .2126 * r + .7152 * g + .0722 * b
def contrast(a, b):
    x, y = lum(a), lum(b); return (max(x, y) + .05) / (min(x, y) + .05)
def hls(h):
    return colorsys.rgb_to_hls(*h2r(h))
def from_hls(hh, l, s): return r2h(colorsys.hls_to_rgb(hh, max(0, min(1, l)), max(0, min(1, s))))
def rgba(h, a):
    r, g, b = (round(c * 255) for c in h2r(h)); return f"rgba({r},{g},{b},{a})"

PAPER_L, PAPER_D, SURF_D = "#f3f3f1", "#141517", "#202124"
WARN = []

def derive(key, color):
    """Turn one line colour into every token the engine uses, light and dark."""
    f = color.lower()
    hh, l, s = hls(f)
    # light mode: the fill carries white text, so it must reach 4.5:1 against white
    while contrast("#ffffff", f) < 4.5 and l > .05:
        l -= .02; f = from_hls(hh, l, s)
    if f != color.lower(): WARN.append(f"line {key}: {color} was too light for white text; using {f}")
    p = from_hls(hh, l * .9, s)
    while contrast(p, PAPER_L) < 4.8 and l > .05:
        p = from_hls(hh, hls(p)[1] - .02, s)
    light = dict(p=p, f=f, d=from_hls(hh, l * .73, s), on="#ffffff", on2="rgba(255,255,255,.86)",
                 s=f, l=mix(f, "#ffffff", .5), t=mix(f, "#ffffff", .88))
    # dark mode: brighter text colour on near-black, fill carries near-black text
    dp = from_hls(hh, .7, min(1, max(s, .55)))
    while contrast(dp, PAPER_D) < 6 and hls(dp)[1] < .95: dp = from_hls(hh, hls(dp)[1] + .02, hls(dp)[2])
    df = from_hls(hh, min(.62, max(.42, l + .1)), s)
    while contrast("#0b0c0e", df) < 4.5 and hls(df)[1] < .9: df = from_hls(hh, hls(df)[1] + .02, s)
    dark = dict(p=dp, f=df, d=from_hls(hh, l * .62, s), s=dp, t=mix(f, SURF_D, .82),
                on="#0b0c0e", on2="rgba(11,12,14,.78)")
    viz = dict(light=dict(pc=f, pt=rgba(f, .16)), dark=dict(pc=dp, pt=rgba(dp, .16)))
    grad = [mix(f, "#ffffff", .45), f]
    return dict(light=light, dark=dark, viz=viz, grad=grad)

def line_tokens(key, spec):
    t = derive(key, spec["color"])
    o = spec.get("tokens") or {}
    for mode in ("light", "dark"):
        t[mode].update(o.get(mode, {}))
    if "viz" in o:
        for mode in ("light", "dark"):
            if o["viz"] is None: t["viz"] = None
            elif mode in o["viz"]: t["viz"][mode] = o["viz"][mode]
    if "grad" in o: t["grad"] = o["grad"]
    return t

# ---------------------------------------------------------------- generated CSS
def lines_css(lines):
    keys = list(lines)
    toks = {k: line_tokens(k, v) for k, v in lines.items()}
    def decl(k, d, names): return "".join(f"--p{k}{'' if n == 'p' else '-' + n}:{d[n]};" for n in names if n in d)
    order = ["p", "f", "d", "on", "on2", "s", "l", "t"]
    rootL = "".join(decl(k, toks[k]["light"], order) for k in keys)
    rootD = "".join(decl(k, toks[k]["dark"], order) for k in keys)
    content = [k for k in keys if k != "R"] or keys
    ka = [content[0], content[min(1, len(content) - 1)], content[min(2, len(content) - 1)]]
    alias = "".join(f"--k{i+1}-f:var(--p{k}-f);--k{i+1}-t:var(--p{k}-t);--k{i+1}-on:var(--p{k}-on);" for i, k in enumerate(ka))
    seg = 100 / len(keys)
    stripes = ",".join(f"var(--p{k}-f) {round(i*seg,3)}% {round((i+1)*seg,3)}%" for i, k in enumerate(keys))
    css = [f":root{{{rootL}{alias}--stripes:linear-gradient(90deg,{stripes});}}",
           f'@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{{rootD}}}}}',
           f':root[data-theme="dark"]{{{rootD}}}']
    for k in keys:
        css.append(f'.part[data-part="{k}"]{{--pc:var(--p{k});--pt:var(--p{k}-t);--ps:var(--p{k}-s);--pl:var(--p{k}-l);--pf:var(--p{k}-f);'
                   f'--pon:var(--p{k}-on);--pon2:var(--p{k}-on2);--lc:var(--p{k}-f);--lc-d:var(--p{k}-d);--lc-on:var(--p{k}-on);'
                   f'--lc-ink:var(--p{k});--lc-t:var(--p{k}-t);--volt:var(--lc);--volt-d:var(--lc-d);--von:var(--lc-on);'
                   f'--accent:var(--lc);--accent-2:var(--lc);--accent-ink:var(--lc-ink);--on-accent:var(--lc-on)}}')
    for k in keys:
        if toks[k].get("grad"): css.append(f'.part[data-part="{k}"] svg .f-pc{{fill:url(#g-p{k})}}')
    for k in keys:
        v = toks[k].get("viz")
        if not v: continue
        L, D = v["light"], v["dark"]
        css.append(f'.part[data-part="{k}"] .viz{{--pc:{L["pc"]};--ps:{L["pc"]};--pt:{L["pt"]};--pf:{L["pc"]}}}')
        dd = f'--pc:{D["pc"]};--ps:{D["pc"]};--pt:{D["pt"]};--pf:{D["pc"]}'
        css.append(f'@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]) .part[data-part="{k}"] .viz{{{dd}}}}}')
        css.append(f':root[data-theme="dark"] .part[data-part="{k}"] .viz{{{dd}}}')
    return "\n".join(css), toks

# ---------------------------------------------------------------- boot + title card
def boot_svg(keys, terminus):
    content = [k for k in keys if k != "R"]
    n = len(content)
    ys = [75] if n == 1 else [round(30 + i * 90 / (n - 1), 1) for i in range(n)]
    out = []
    for i, (k, y) in enumerate(zip(content, ys)):
        yy = int(y) if float(y).is_integer() else y
        d = f"M18 75 H210" if y == 75 else f"M18 {yy} H140 L185 75 H210"
        out.append(f'<path class="bl" pathLength="1" d="{d}" style="stroke:var(--p{k}-f);animation-delay:{round(.05 + .13 * i, 2)}s"/>')
    if "R" in keys:
        out.append('<path class="bl" pathLength="1" d="M200 75 H280" style="stroke:var(--pR-f);animation-delay:.62s"/>')
    return "\n      ".join(out), terminus

def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def title_html(g, tag_span="span"):
    t, hl = g["title"], g.get("highlight")
    if hl and hl in t:
        a, b = t.split(hl, 1)
        cls = ' class="hl"' if tag_span == "hl" else ""
        return f'{esc(a)}<span{cls}>{esc(hl)}</span>{esc(b)}'
    return esc(t)

# ---------------------------------------------------------------- assets
def inline_assets(html, folder):
    def sub(m):
        attr, path = m.group(1), m.group(2)
        f = folder / path
        if not f.exists(): WARN.append(f"missing asset {path}"); return m.group(0)
        mt = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
        return f'{attr}="data:{mt};base64,{base64.b64encode(f.read_bytes()).decode()}"'
    return re.sub(r'(src|href)="(assets/[^"]+)"', sub, html)

def minify_css(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s*\n\s*", "\n", css)
    return re.sub(r"\n+", "\n", css).strip()


# ---------------------------------------------------------------- shorthands (docs/03 "Shorthands")
# These only fill in what is missing, so a guide written in full HTML (like Bio Metro)
# is left exactly as it is.
ICONS = {"trap": "warn", "note": "info", "eg": "bulb", "good": "check"}

def block_end(s, i, tag="div"):
    """Index just after the element that starts at s[i] (balanced, same tag)."""
    depth, j = 0, i
    pat = re.compile(rf"<{tag}\b|</{tag}>")
    for m in pat.finditer(s, i):
        depth += 1 if m.group(0) != f"</{tag}>" else -1
        if depth == 0: return m.end()
    return len(s)

def attr(tag, name, default=""):
    m = re.search(rf'\b{name}="([^"]*)"', tag); return m.group(1) if m else default

def callout_icons(html):
    def sub(m):
        kinds = m.group(1).split()
        kind = next((k for k in kinds if k in ICONS), "note")
        return m.group(0) + f'<span class="ci"><svg class="ic"><use href="#i-{ICONS[kind]}"/></svg></span>'
    return re.sub(r'<div class="callout\b([^"]*)">(?!\s*<span class="ci">)', sub, html)

def expand(content, g, quiz):
    content = re.sub(r"<!--.*?-->", "", content, flags=re.S)  # comments may mention tags; drop them first
    sets = {x for q in quiz for x in q.get("sets", [])}
    cp_text = g.get("checkpointText", "The traps the exam sets and a few questions for each station on this line. Open one station at a time.")
    out, pos = [], 0
    for pm in re.finditer(r'<section class="part"[^>]*>', content):
        if pm.start() < pos: continue
        end = content.find("</section>", pm.end())
        if end < 0: break
        tag, body = pm.group(0), content[pm.end():end]
        key, title, kicker = attr(tag, "data-part"), attr(tag, "data-title"), attr(tag, "data-kicker")
        if not attr(tag, "id"): tag = tag[:-1] + f' id="part-{key.lower()}">'
        if 'class="part-open"' not in body:
            eb = attr(tag, "data-eyebrow", kicker)
            lede = attr(tag, "data-lede")
            body = (f'\n<div class="part-open">\n  <div class="eyebrow">{eb}</div>\n  <h2>{title}</h2>\n'
                    + (f'  <p class="lede">{lede}</p>\n' if lede else "") + '  <div class="plist" data-auto></div>\n</div>\n' + body)
        traps, chs = {}, []
        def chap(cm):
            ctag, cbody = cm.group(1), cm.group(2)
            cid = attr(ctag, "id")
            if " col" not in attr(ctag, "class") + " ": ctag = ctag.replace('class="chapter', 'class="chapter col', 1)
            # pull the traps out: they are shown in the line's checkpoint
            t = cbody.find('<div class="traps">')
            if t >= 0:
                e = block_end(cbody, t)
                traps[cid] = cbody[t + len('<div class="traps">'):e - len("</div>")].strip()
                cbody = cbody[:t] + cbody[e:]
            if '<header class="ch-head"' not in cbody:
                bm = re.search(r'\s*<p class="bigidea">.*?</p>', cbody, re.S)
                big = bm.group(0).strip() if bm else ""
                if bm: cbody = cbody[:bm.start()] + cbody[bm.end():]
                eb = kicker if key == "R" else f"{kicker} · {title}"
                tg = attr(ctag, "data-tag")
                topic = ' <span class="topic">' + tg + '</span>' if tg else ""
                cbody = (f'\n  <header class="ch-head"><div class="ch-num">{attr(ctag, "data-n")}</div>'
                         f'<div class="eyebrow">{eb}{topic}</div>'
                         f'<h2>{attr(ctag, "data-title")}</h2>{big}</header>' + cbody)
            if '<footer class="ch-foot"' not in cbody:
                cbody = cbody.rstrip() + '\n  <footer class="ch-foot" data-auto></footer>\n'
            if "checkpoint" not in attr(ctag, "class"): chs.append((cid, attr(ctag, "data-n"), attr(ctag, "data-short") or attr(ctag, "data-title")))
            return ctag + cbody + "</article>"
        body = re.sub(r'(<article class="chapter[^>]*>)(.*?)</article>', chap, body, flags=re.S)
        has_cp = 'class="chapter col checkpoint"' in body or "checkpoint" in "".join(re.findall(r'<article class="([^"]*)"', body))
        rows = [(cid, n, short) for cid, n, short in chs if cid in traps or cid in sets]
        if key != "R" and not has_cp and rows and g.get("checkpoints", True):
            det = []
            for cid, n, short in rows:
                tr = traps.get(cid, "")
                k = tr.count('class="callout')
                det.append(f'      <details class="cp" data-cp="{cid}"><summary><span class="cp-n">{n}</span><span class="cp-t">{short}</span>'
                           f'<span class="cp-m" data-traps="{k}"></span></summary><div class="cp-body">\n'
                           + (f'        <h4 class="cp-h">Watch out for</h4>\n        {tr}\n' if tr else "")
                           + (f'        <h4 class="cp-h">Test yourself</h4>\n        <div class="quiz" data-set="{cid}" data-for="{cid}"></div>\n' if cid in sets else "")
                           + f'        <p class="cp-back"><a href="#{cid}">Go back to {n} {short}</a></p>\n      </div></details>')
            body = body.rstrip() + (
                f'\n\n<article class="chapter col checkpoint" id="cp-{key.lower()}" data-short="Checkpoint" data-n="" data-title="{kicker} checkpoint" data-count="no">\n'
                f'  <header class="ch-head"><div class="ch-num"><svg class="ic"><use href="#i-check"/></svg></div><div class="eyebrow">{kicker} · {title} '
                f'<span class="topic">End of the line</span></div><h2>Checkpoint</h2><p class="bigidea">{cp_text}</p></header>\n'
                f'  <div class="sec"><h3 data-eb="Before you change lines">Traps and quick checks</h3>\n    <div class="cp-list">\n'
                + "\n".join(det) + '\n    </div>\n  </div>\n  <footer class="ch-foot" data-auto></footer>\n</article>\n')
        out.append(content[pos:pm.start()] + tag + body + "</section>")
        pos = end + len("</section>")
    out.append(content[pos:])
    return callout_icons("".join(out))

def normalise_quiz(quiz, shuffle=False):
    """Fill in defaults. With shuffle, options are put in a stable random order (seeded by
    the question text, so it is the same on every build and saved answers stay valid).
    A question with "fixed": true keeps its order (use it for "All of the above")."""
    import random, hashlib
    for i, q in enumerate(quiz):
        q.setdefault("id", f"q{i + 1}")
        if "sets" not in q:
            q["sets"] = ([q["see"]] if q.get("see") else []) + (["exam"] if q.get("exam") else [])
        q.pop("exam", None)
        q["o"] = [list(o) + [""] * (3 - len(o)) if isinstance(o, list) else [o, False, ""] for o in q["o"]]
        if shuffle and not q.pop("fixed", False):
            seed = int(hashlib.md5((q["id"] + q.get("q", "")).encode("utf-8")).hexdigest()[:8], 16)
            random.Random(seed).shuffle(q["o"])
        q.pop("fixed", None)
    return quiz

# ---------------------------------------------------------------- main
def build(folder, fragment=False, minify=False, out=None):
    folder = pathlib.Path(folder).resolve()
    g = json.loads((folder / "guide.json").read_text(encoding="utf-8"))
    for req in ("id", "title", "lines"):
        if req not in g: sys.exit(f"guide.json needs '{req}'")
    lines = g["lines"]
    keys = list(lines)
    rd = lambda p: (folder / p).read_text(encoding="utf-8") if (folder / p).exists() else ""
    E = lambda p: (ENGINE / p).read_text(encoding="utf-8")
    gen_css, toks = lines_css(lines)
    vis = rd("visuals.js")
    uses_kit = "Kit." in vis
    base_css = E("metro.css")
    kit_js = E("kit.js")
    if not uses_kit:
        base_css = re.sub(r"/\* @kit-start.*?/\* @kit-end \*/", "", base_css, flags=re.S)
        kit_js = kit_js.split("/* @kit-start")[0] + "})();\n"
    css = base_css + "\n/* ===== generated from guide.json: line colours ===== */\n" + gen_css + "\n" + rd("style.css")
    if minify: css = minify_css(css)
    terminus = g.get("terminus", "Exam")
    svg, _ = boot_svg(keys, terminus)
    boot = (E("boot.html").replace("{{LABEL}}", esc(g["title"])).replace("{{BOOT_LINES}}", svg)
            .replace("{{TERMINUS}}", esc(terminus)).replace("{{TITLE}}", title_html(g))
            .replace("{{EYEBROW}}", esc(g.get("eyebrow", ""))))
    stripes = "".join(f'<i style="background:var(--p{k}-f)"></i>' for k in keys)
    hero = f'''<section class="hero" id="top">
  <div class="hero-card">
    <div class="hero-lines" aria-hidden="true">{stripes}</div>
    <div class="eyebrow">{esc(g.get("eyebrow", ""))}</div>
    <h1>{title_html(g, "hl")}</h1>
    <p class="lede">{g.get("lede", "")}</p>
  </div>
  <div class="overview" data-auto></div>
</section>'''
    quiz = normalise_quiz(json.loads(rd("quiz.json") or "[]"), g.get("shuffle", True))
    content = expand(inline_assets(rd("content.html"), folder), g, quiz)
    flash = json.loads(rd("flash.json") or "[]")
    guide_js = {"id": g["id"], "title": g["title"], "icon": g.get("icon", ""), "subtitle": g.get("subtitle", ""),
                "terminus": terminus,
                "lines": {k: {"name": v.get("name", ""), **({"grad": toks[k]["grad"]} if toks[k].get("grad") else {})} for k, v in lines.items()}}
    data = ("window.GUIDE=" + json.dumps(guide_js, ensure_ascii=False) + ";\n"
            "window.QUIZ=" + json.dumps(quiz, ensure_ascii=False) + ";\n"
            "window.FLASH=" + json.dumps(flash, ensure_ascii=False) + ";")
    head = (f'<title>{esc(g["title"])}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
            f'<meta name="description" content="{esc(g.get("description", g.get("subtitle", "")))}">\n')
    body = (f"{boot}\n<main id=\"main\">\n{hero}\n{content}\n</main>\n"
            f"<script>\n{data}\n</script>\n<script>\n{E('metro.js')}\n</script>\n<script>\n{kit_js}\n</script>\n"
            f"<script>\n{vis}\n</script>\n<script>\n{E('explainer.js')}\n</script>\n")
    if fragment:
        html = head + f"<style>\n{css}\n</style>\n" + body
    else:
        html = (f'<!doctype html>\n<html lang="{g.get("lang", "en")}">\n<head>\n<meta charset="utf-8">\n'
                f'<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
                f"{head}<style>\n{css}\n</style>\n</head>\n<body>\n{body}</body>\n</html>\n")
    outp = pathlib.Path(out) if out else folder / "out" / f"{g['id']}.html"
    outp.parent.mkdir(parents=True, exist_ok=True)
    outp.write_text(html, encoding="utf-8")
    for w in WARN: print("warning:", w)
    n_cp = len(re.findall(r'<article class="chapter[^"]*checkpoint', content))
    n_all = len(re.findall(r'<article class="chapter', content))
    n_st = str(n_all - n_cp) + " stations + " + str(n_cp) + " checkpoints"
    print(f"built {outp}  ({len(html.encode()) // 1024} KB, {len(keys)} lines, {n_st}, "
          f"{len(quiz)} questions, {len(flash)} cards, kit {'included' if uses_kit else 'not used'})")
    return outp

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] in ("-h", "--help"): print(__doc__); sys.exit(0)
    out = a[a.index("--out") + 1] if "--out" in a else None
    build(a[0], "--fragment" in a, "--pretty" not in a, out)
