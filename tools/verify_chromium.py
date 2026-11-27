#!/usr/bin/env python3
"""
Metro Engine · Headless Chromium layout & JS verification (no Playwright needed).
Usage:
  python3 tools/verify_chromium.py <built.html> [--shots <outdir>]
"""
import argparse, base64, hashlib, json, os, socket, struct, subprocess, sys, time, urllib.request

SIZES = {
    "lap": (1440, 900, False),
    "tab": (820, 1180, False),
    "ph":  (390, 844, True),
}

LAYOUT_JS = r"""(function(phone) {
  const W = document.documentElement.clientWidth, bad = [];
  document.querySelectorAll("main *").forEach(e => {
    if (e.closest("svg") && e.tagName !== "svg") return;
    const r = e.getBoundingClientRect();
    if (!r.width || e.closest("[hidden],.eq") || (e.parentElement && e.parentElement.closest(".tbl-wrap"))) return;
    if (r.right > W + 1 || r.left < -1) {
      bad.push(`wider than screen: <${e.tagName.toLowerCase()} class="${e.getAttribute("class") || ""}"> (${Math.round(r.left)}..${Math.round(r.right)}px vs ${W}px)`);
    }
  });
  document.querySelectorAll(".viz-stage > svg").forEach(svg => {
    const f = svg.getBoundingClientRect(), id = svg.closest(".viz")?.id || "?";
    const vb = svg.viewBox && svg.viewBox.baseVal;
    const sc = (vb && vb.width > 0) ? Math.min(1, f.width / vb.width) : 1;
    const padX = 3 * sc, padY = 2 * sc;
    const strokes = [...svg.querySelectorAll("line,path")].filter(s => !s.closest(".hide,[style*='display: none'],defs") && !s.matches(".k-grid,.k-axis,.k-mark,.k-curve,.k-tan,.k-shade,.k-vl,.k-edge,.k-lead,.k-tree-edge,.k-tree-skel,.k-dep-edge,.k-dag-edge,.k-net-edge,.k-venn-ring,.k-dp-arr,.k-sat-edge,.k-axis-arr,.k-prog-line,.k-vec,.k-tan-tri,.k-slash,.k-curve-halo,.k-probe-line")).map(s => s.getBoundingClientRect()).filter(r => r.width || r.height);
    const rects = [...svg.querySelectorAll("rect")].filter(b => !b.closest(".hide,[style*='display: none'],defs") && !b.matches(".k-box,.k-riem,.k-bar,.k-zone,.k-dag-shared,.k-venn-zone,.k-net-bg")).map(b => b.getBoundingClientRect()).filter(r => r.width > 12 * sc && r.height > 12 * sc);
    svg.querySelectorAll("text").forEach(t => {
      if (t.closest(".hide,[style*='display: none'],defs")) return;
      const r = t.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (svg.dataset.camZoom === "1") {
        if (r.right <= f.left || r.left >= f.right || r.bottom <= f.top || r.top >= f.bottom) return;
        if (!t.closest(".on") && (r.left < f.left - 2 || r.right > f.right + 2 || r.top < f.top - 1 || r.bottom > f.bottom + 1)) return;
      }
      if (r.left < f.left - 2 || r.right > f.right + 2 || r.top < f.top - 1 || r.bottom > f.bottom + 1) {
        bad.push(`text sticks out of #${id}: "${t.textContent.trim().slice(0, 40)}"`);
      }
      if (!t.classList.contains("k-halo")) {
        for (const sr of strokes) {
          if (sr.right > r.left + 2 * sc && sr.left < r.right - 2 * sc && sr.bottom > r.top + 2 * sc && sr.top < r.bottom - 2 * sc) {
            bad.push(`stroke pierces text in #${id}: "${t.textContent.trim().slice(0, 40)}"`);
            break;
          }
        }
      }
      const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
      for (const rr of rects) {
        if (cx >= rr.left && cx <= rr.right && cy >= rr.top && cy <= rr.bottom) {
          if (r.left < rr.left + padX || r.right > rr.right - padX || r.top < rr.top + padY || r.bottom > rr.bottom - padY) {
            bad.push(`text tight/overflows box in #${id}: "${t.textContent.trim().slice(0, 40)}"`);
          }
          break;
        }
      }
    });
  });
  document.querySelectorAll("dl.terms").forEach(dl => {
    if (dl.querySelector(":scope > dt, :scope > dd")) {
      bad.push("dl.terms uses bare <dt>/<dd> instead of <div> cards");
    }
    const cards = [...dl.querySelectorAll(":scope > div")].map(d => d.getBoundingClientRect()).filter(r => r.width && r.height);
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i], b = cards[j];
        if (a.left + 2 < b.right && a.right - 2 > b.left && a.top + 2 < b.bottom && a.bottom - 2 > b.top) {
          bad.push("dl.terms cards overlap");
          i = cards.length; break;
        }
      }
    }
  });
  const skipGhost = "i,hr,br,svg,path,rect,circle,line,polygon,polyline,canvas,img,input,textarea,select,.grab,.tr,.dot,.line-band,.hero-lines,.pbar,.sbar,.ex-bars,.od-grip,.pa-roll,.pa-art,.pa-vis,.pa-nav,.boot-bar,.t-bar,.k-cam-sep,.k-np-track,.k-np-bar,.spacer,.st,.tk,.mk,.fi,.ci,.k-qb-cell,.sheet-scrim,.dropover,.toast,.ex-try";
  document.querySelectorAll("main div, main section, main article, main aside, main header, main footer, main nav, main ul, main ol, main dl, main p, main span, main details, main summary").forEach(el => {
    if (el.matches(skipGhost) || el.closest("[hidden],svg,.boot,.pick-art")) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) <= 0.05) return;
    const r = el.getBoundingClientRect();
    if (r.width < 32 || r.height < 18) return;
    if ((el.textContent || "").trim().length === 0 && !el.querySelector("svg,img,canvas,input,button,select,textarea")) {
      const hasBg = cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
      const hasTopBd = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none" && cs.borderTopColor !== "rgba(0, 0, 0, 0)" && cs.borderTopColor !== "transparent";
      const hasBotBd = parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none" && cs.borderBottomColor !== "rgba(0, 0, 0, 0)" && cs.borderBottomColor !== "transparent";
      const hasBd = hasTopBd || hasBotBd;
      const hasSh = cs.boxShadow && cs.boxShadow !== "none";
      if (hasBg || hasBd || hasSh) {
        bad.push(`empty ghost box: <${el.tagName.toLowerCase()} class="${el.getAttribute("class") || ""}"> ${Math.round(r.width)}x${Math.round(r.height)} in #${el.closest(".viz,[id]")?.id || "?"}`);
      }
    }
  });
  document.querySelectorAll("svg use[href], svg use[xlink\\:href]").forEach(u => {
    const href = u.getAttribute("href") || u.getAttribute("xlink:href") || "";
    if (href.startsWith("#") && !document.getElementById(href.slice(1))) {
      bad.push(`broken svg <use> ref: ${href}`);
    }
  });
  document.querySelectorAll(".fc-face").forEach(el => {
    if (el.closest("[hidden]")) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    if (el.scrollHeight > el.clientHeight + 6 && cs.overflowY === "hidden") {
      bad.push(`flashcard .fc-face clipped (${el.scrollHeight} > ${el.clientHeight})`);
    }
  });
  document.querySelectorAll(".viz-stage").forEach(st => {
    const use = st.querySelector(":scope > .k-use"), hud = st.querySelector(":scope > .k-hud");
    if (!use || !hud) return;
    const ur = use.getBoundingClientRect(), hr = hud.getBoundingClientRect();
    if (ur.height > 0 && hr.height > 0 && ur.top < hr.bottom - 2) {
      bad.push(`kit stacking out of order in #${st.closest(".viz")?.id || "?"}: .k-use above .k-hud`);
    }
  });
  document.querySelectorAll(".k-hud, .k-use, .viz-stage svg text").forEach(el => {
    if (el.closest(".hide,[hidden],[style*='display: none'],defs")) return;
    const txt = (el.textContent || "").trim();
    if (/\b(undefined|NaN)\b/.test(txt)) {
      bad.push(`leaked literal in #${el.closest(".viz,[id]")?.id || "?"}: "${txt.slice(0, 40)}"`);
    }
  });
  document.querySelectorAll("main *").forEach(el => {
    if (el.closest("code,pre,script,style,[hidden]") || el.children.length > 0) return;
    const txt = el.textContent || "";
    if (/\[\[[^|\]]+\|[vcfgrkas](?:\|[^\]]+)?\]\]/.test(txt)) {
      bad.push(`unexpanded shorthand leak: "${txt.trim().slice(0, 40)}"`);
    }
  });
  if (phone) {
    document.querySelectorAll("main button, main a.btn, main .opt").forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.width && r.height && Math.min(r.width, r.height) < 36 && !e.closest(".vprog,.pdots,.q-steps")) {
        bad.push(`small tap target (${Math.round(r.width)}x${Math.round(r.height)}): ${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 30)}`);
      }
    });
  }
  if (document.documentElement.scrollWidth > W + 1) {
    bad.unshift(`PAGE SCROLLS SIDEWAYS: ${document.documentElement.scrollWidth}px on ${W}px screen`);
  }
  return [...new Set(bad)].slice(0, 30);
})"""

STEPPED_VIZ_JS = r"""(async function() {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const vis = el => {
    if (!el || el.closest(".hide,[hidden],[style*='display: none'],defs")) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) <= 0.2) return false;
    const g = el.closest("g");
    if (g && parseFloat(getComputedStyle(g).opacity) <= 0.2) return false;
    return true;
  };
  const bad = [];
  for (const viz of document.querySelectorAll(".viz")) {
    const svg = viz.querySelector(".viz-stage > svg");
    if (!svg) continue;
    const id = viz.id || "?";
    svg.querySelectorAll("marker").forEach(m => {
      if (m.getAttribute("markerUnits") !== "userSpaceOnUse") {
        bad.push(`marker without userSpaceOnUse in #${id}: #${m.id || "?"}`);
      }
    });
    const resetBtn = viz.querySelector('.player [data-a="reset"]');
    const nextBtn = viz.querySelector('.player [data-a="next"]');
    if (resetBtn && !resetBtn.disabled) { resetBtn.click(); await sleep(40); }
    const auditStep = label => {
      const f = svg.getBoundingClientRect();
      if (!f.width || !f.height) return;
      const vb = svg.viewBox && svg.viewBox.baseVal;
      const sc = (vb && vb.width > 0) ? Math.min(1, f.width / vb.width) : 1;
      const padX = 3 * sc, padY = 2 * sc, ov = 2 * sc;
      svg.querySelectorAll("[pathLength]").forEach(el => {
        if (!vis(el)) return;
        const da = getComputedStyle(el).strokeDasharray;
        if (da && da !== "none" && (el.matches(".flowline,.k-inh-flow") || da.split(/[,\s]+/).filter(Boolean).length > 1)) {
          bad.push(`blinking dash hazard (pathLength + dasharray) in #${id} ${label}`);
        }
      });
      const rects = [...svg.querySelectorAll("rect")]
        .filter(b => vis(b) && !b.matches(".k-box,.k-riem,.k-bar,.k-zone,.k-dag-shared,.k-venn-zone,.k-net-bg"))
        .map(b => b.getBoundingClientRect()).filter(r => r.width > 12 * sc && r.height > 12 * sc);
      if (window.innerWidth <= 420 && svg.closest(".kit-tree") && svg.dataset.camZoom === "1" && vb && vb.width > 0) {
        if (f.width / vb.width < 0.50) {
          bad.push(`mobile zoomed tree too small in #${id} ${label} (scale ${(f.width / vb.width).toFixed(2)})`);
        }
      }
      svg.querySelectorAll("text").forEach(t => {
        if (!vis(t)) return;
        const r = t.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (svg.dataset.camZoom === "1") {
          if (r.right <= f.left || r.left >= f.right || r.bottom <= f.top || r.top >= f.bottom) return;
          if (!t.closest(".on") && (r.left < f.left - 2 || r.right > f.right + 2 || r.top < f.top - 1 || r.bottom > f.bottom + 1)) return;
        }
        if (r.left < f.left - 2 || r.right > f.right + 2 || r.top < f.top - 1 || r.bottom > f.bottom + 1) {
          bad.push(`stepped text sticks out of #${id} ${label}: "${t.textContent.trim().slice(0, 32)}"`);
        }
        const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
        for (const rr of rects) {
          if (cx >= rr.left && cx <= rr.right && cy >= rr.top && cy <= rr.bottom) {
            if (r.left < rr.left + padX || r.right > rr.right - padX || r.top < rr.top + padY || r.bottom > rr.bottom - padY) {
              bad.push(`stepped text tight/overflows box in #${id} ${label}: "${t.textContent.trim().slice(0, 32)}"`);
            }
            break;
          }
        }
      });
      const pills = [...svg.querySelectorAll(".k-dep-pill rect, .k-dag-pill rect, .k-edge-pill rect, rect.k-epill")]
        .filter(p => !p.closest(".k-tag") && vis(p))
        .map(p => ({ el: p, r: p.getBoundingClientRect(), txt: (p.parentElement?.textContent || "").trim().slice(0, 24) }))
        .filter(p => p.r.width > 4 * sc && p.r.height > 4 * sc);
      const targets = [...svg.querySelectorAll(".k-node, .k-ord circle")]
        .filter(n => vis(n))
        .map(n => ({ el: n, host: n.closest(".k-n,.k-tn,.k-dn"), r: n.getBoundingClientRect() }))
        .filter(n => n.r.width > 4 * sc && n.r.height > 4 * sc);
      for (const p of pills) {
        for (const t of targets) {
          if (t.host && p.el.closest(".k-n,.k-tn,.k-dn") === t.host) continue;
          if (p.r.left + ov < t.r.right && p.r.right - ov > t.r.left && p.r.top + ov < t.r.bottom && p.r.bottom - ov > t.r.top) {
            bad.push(`pill overlaps node/badge in #${id} ${label}: "${p.txt}"`);
            break;
          }
        }
      }
    };
    auditStep("step 0");
    let step = 0;
    while (nextBtn && !nextBtn.disabled && step < 25) {
      nextBtn.click();
      await sleep(80);
      step++;
      auditStep("step " + step);
    }
    const allBtn = viz.querySelector('.k-cam-btn[data-cam="all"]');
    const autoBtn = viz.querySelector('.k-cam-btn[data-cam="auto"]');
    if (allBtn) {
      allBtn.click();
      await sleep(100);
      if (svg.dataset.camZoom === "1") bad.push(`camera Overview failed to zoom out in #${id}`);
      auditStep("overview");
      if (autoBtn) { autoBtn.click(); await sleep(40); }
    }
    if (resetBtn && !resetBtn.disabled) { resetBtn.click(); await sleep(40); }
  }
  return [...new Set(bad)].slice(0, 30);
})()"""

class CDPClient:
    def __init__(self, ws_url):
        assert ws_url.startswith("ws://")
        rest = ws_url[5:]
        host_port, path = rest.split("/", 1)
        host, port = host_port.split(":")
        self.sock = socket.create_connection((host, int(port)), timeout=30)
        key = base64.b64encode(os.urandom(16)).decode()
        req = (
            f"GET /{path} HTTP/1.1\r\n"
            f"Host: {host_port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += self.sock.recv(4096)
        self._id = 0
        self.events = []

    def _send_frame(self, text):
        data = text.encode("utf-8")
        header = bytearray([0x81])
        mask = os.urandom(4)
        n = len(data)
        if n < 126:
            header.append(0x80 | n)
        elif n < 65536:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", n))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", n))
        header.extend(mask)
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
        self.sock.sendall(bytes(header) + masked)

    def _recv_exact(self, n):
        buf = bytearray()
        while len(buf) < n:
            chunk = self.sock.recv(n - len(buf))
            if not chunk:
                raise EOFError("WebSocket closed")
            buf.extend(chunk)
        return bytes(buf)

    def _recv_frame(self):
        while True:
            b1, b2 = self._recv_exact(2)
            opcode = b1 & 0x0F
            length = b2 & 0x7F
            if length == 126:
                length = struct.unpack("!H", self._recv_exact(2))[0]
            elif length == 127:
                length = struct.unpack("!Q", self._recv_exact(8))[0]
            if b2 & 0x80:
                mask = self._recv_exact(4)
                payload = bytes(b ^ mask[i % 4] for i, b in enumerate(self._recv_exact(length)))
            else:
                payload = self._recv_exact(length)
            if opcode == 0x8:
                raise EOFError("Close frame")
            if opcode == 0x9:  # ping
                continue
            return json.loads(payload.decode("utf-8"))

    def call(self, method, params=None):
        self._id += 1
        cid = self._id
        self._send_frame(json.dumps({"id": cid, "method": method, "params": params or {}}))
        while True:
            msg = self._recv_frame()
            if msg.get("id") == cid:
                if "error" in msg:
                    raise RuntimeError(msg["error"])
                return msg.get("result", {})
            self.events.append(msg)

    def eval(self, expr):
        res = self.call("Runtime.evaluate", {"expression": expr, "returnByValue": True, "awaitPromise": True})
        if "exceptionDetails" in res:
            raise RuntimeError(str(res["exceptionDetails"]))
        return res.get("result", {}).get("value")

    def close(self):
        self.sock.close()

def free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--shots", default="")
    ap.add_argument("--port", type=int, default=0)
    args = ap.parse_args()
    html_path = os.path.abspath(args.html)
    if not os.path.exists(html_path):
        print(f"File not found: {html_path}", file=sys.stderr)
        sys.exit(1)
    if args.shots:
        os.makedirs(args.shots, exist_ok=True)

    port = args.port or free_port()
    proc = subprocess.Popen(
        ["chromium", "--headless=new", "--no-sandbox", "--disable-gpu", f"--remote-debugging-port={port}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    try:
        ws_url = None
        for _ in range(30):
            try:
                pages = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{port}/json").read().decode())
                page = next((p for p in pages if p.get("type") == "page" and not p.get("url", "").startswith("chrome-extension://")), None)
                if page:
                    ws_url = page["webSocketDebuggerUrl"]
                    break
            except Exception:
                time.sleep(0.2)
        if not ws_url:
            raise RuntimeError("Could not connect to Chromium CDP")

        cdp = CDPClient(ws_url)
        cdp.call("Page.enable")
        cdp.call("Runtime.enable")
        problems = []

        for sz, (w, h, phone) in SIZES.items():
            for theme in ("light", "dark"):
                tag = f"[{sz} {theme}]"
                cdp.events.clear()
                cdp.call("Emulation.setDeviceMetricsOverride", {"width": w, "height": h, "deviceScaleFactor": 1, "mobile": phone})
                cdp.call("Emulation.setEmulatedMedia", {"features": [{"name": "prefers-color-scheme", "value": theme}, {"name": "prefers-reduced-motion", "value": "reduce"}]})
                cdp.call("Page.navigate", {"url": "file://" + html_path})
                time.sleep(1.2)
                cdp.eval("try{localStorage.clear()}catch(e){}")

                # Wait for mode picker or enter scroll mode
                has_pick = cdp.eval("!!document.querySelector('.pick-opt[data-mode=\"scroll\"]')")
                if has_pick:
                    cdp.eval("document.querySelector('.pick-opt[data-mode=\"scroll\"]').click()")
                    time.sleep(0.6)
                cdp.eval("document.querySelectorAll('.rv').forEach(e=>e.classList.add('in')); scrollTo(0,0);")
                time.sleep(0.3)

                issues = cdp.eval(f"({LAYOUT_JS})({str(phone).lower()})") or []
                for it in issues:
                    problems.append(f"{tag} {it}")

                if (sz, theme) in (("lap", "dark"), ("ph", "light")):
                    step_bad = cdp.eval(STEPPED_VIZ_JS) or []
                    for it in step_bad:
                        problems.append(f"{tag} {it}")
                    mc_err = cdp.eval(r"""(() => {
                      const b = document.querySelector('.mcheck .mc-opts button');
                      if (!b) return null;
                      b.click();
                      const fb = b.closest('.mcheck')?.querySelector('.mc-fb');
                      return (!fb || fb.hidden) ? 'mcheck feedback did not appear after tap' : null;
                    })()""")
                    if mc_err:
                        problems.append(f"{tag} {mc_err}")

                if args.shots and (sz, theme) in (("lap", "light"), ("ph", "light"), ("ph", "dark")):
                    shot = cdp.call("Page.captureScreenshot", {"format": "png"})
                    with open(os.path.join(args.shots, f"{sz}_{theme}_scroll.png"), "wb") as f:
                        f.write(base64.b64decode(shot["data"]))

                # Check Explainer mode (including every .viz screen for cropping/clipping)
                ex_ok = cdp.eval("window.Explainer ? (Explainer.enter(), true) : false")
                if ex_ok:
                    time.sleep(0.4)
                    if args.shots and (sz, theme) == ("lap", "light"):
                        shot = cdp.call("Page.captureScreenshot", {"format": "png"})
                        with open(os.path.join(args.shots, "lap_light_explainer.png"), "wb") as f:
                            f.write(base64.b64decode(shot["data"]))
                    viz_idxs = cdp.eval("(Explainer.screens||[]).map((s,i)=>s.nodes.some(n=>n.matches&&n.matches('.viz,.tbl-wrap')||n.querySelector&&n.querySelector('.viz,.tbl-wrap'))?i:-1).filter(i=>i>=0)") or []
                    for vi in viz_idxs:
                        cdp.eval(f"Explainer.show({vi})")
                        time.sleep(0.25)
                        if sz == "ph" and theme == "light":
                            has_depth = cdp.eval("!!document.querySelector('.ex-card details.depth')")
                            if has_depth:
                                cdp.eval("document.querySelectorAll('.ex-card details.depth').forEach(d=>d.open=true)")
                                time.sleep(0.15)
                                ov_err = cdp.eval("document.documentElement.scrollWidth > window.innerWidth + 1")
                                if ov_err:
                                    problems.append(f"{tag} explainer horizontal overflow when Exam Depth expanded on screen {vi}")
                                cdp.eval("document.querySelectorAll('.ex-card details.depth').forEach(d=>d.open=false)")
                        ex_bad = cdp.eval(r"""(() => {
                          const bad = [], iw = window.innerWidth;
                          const tx = document.querySelector('.ex-card.two .ex-text'), md = document.querySelector('.ex-card.two .ex-media');
                          if (tx && md) {
                            const tr = tx.getBoundingClientRect(), mr = md.getBoundingClientRect();
                            if (tr.right > mr.left + 2 && tr.left < mr.right - 2 && tr.bottom > mr.top + 2 && tr.top < mr.bottom - 2) {
                              bad.push(`explainer columns overlap (${Math.round(tr.right)} > ${Math.round(mr.left)})`);
                            }
                          }
                          document.querySelectorAll('.ex-media .tbl-wrap, .ex-media .cmp-wrap, .ex-media .terms, .ex-media .viz').forEach(el => {
                            const r = el.getBoundingClientRect();
                            if (!r.width || !r.height) return;
                            if (r.left < -1 || r.right > iw + 1) {
                              bad.push(`explainer overflows viewport: <${el.className}> (${Math.round(r.left)}..${Math.round(r.right)} vs ${iw})`);
                            }
                          });
                          document.querySelectorAll('.ex-media .kd-viz-pane, .ex-media .viz-stage > svg').forEach(el => {
                            const r = el.getBoundingClientRect();
                            if (!r.width || !r.height) return;
                            const vid = el.closest('.viz')?.id || '?';
                            for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
                              if (p.classList.contains('paged')) continue;
                              const ov = getComputedStyle(p).overflowY;
                              if (ov === 'hidden' || ov === 'auto' || ov === 'scroll') {
                                const pr = p.getBoundingClientRect();
                                if (r.top < pr.top - 1 || r.bottom > pr.bottom + 1) {
                                  bad.push(`explainer clips #${vid} (${Math.round(r.top)}..${Math.round(r.bottom)} vs ${Math.round(pr.top)}..${Math.round(pr.bottom)})`);
                                  break;
                                }
                              }
                            }
                          });
                          document.querySelectorAll('.ex-win').forEach(w => {
                            const cs = getComputedStyle(w);
                            if (w.scrollHeight > w.clientHeight + 6 && cs.overflowY === 'hidden') {
                              bad.push(`explainer .ex-win trapped scroll in #${w.closest('.viz')?.id || '?'}`);
                            }
                          });
                          const skipExGhost = "i,hr,br,td,th,svg,path,rect,circle,line,polygon,polyline,canvas,img,input,textarea,select,.grab,.tr,.dot,.line-band,.hero-lines,.pbar,.sbar,.ex-bars,.od-grip,.pa-roll,.pa-art,.pa-vis,.pa-nav,.boot-bar,.t-bar,.k-cam-sep,.k-np-track,.k-np-bar,.spacer,.st,.tk,.mk,.fi,.ci,.k-qb-cell,.k-dp-blank,.sheet-scrim,.dropover,.toast,.ex-try";
                          document.querySelectorAll('.ex-text, .ex-media, .ex-vpanel, .ex .viz-stage *').forEach(el => {
                            if (el.matches(skipExGhost) || el.closest("[hidden],svg,.boot,.pick-art")) return;
                            const cs = getComputedStyle(el);
                            if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) <= 0.05) return;
                            const r = el.getBoundingClientRect();
                            if (r.width < 32 || r.height < 18) return;
                            if ((el.textContent || "").trim().length === 0 && !el.querySelector("svg,img,canvas,input,button,select,textarea")) {
                              const hasBg = cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
                              const hasTopBd = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none" && cs.borderTopColor !== "rgba(0, 0, 0, 0)" && cs.borderTopColor !== "transparent";
                              const hasBotBd = parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none" && cs.borderBottomColor !== "rgba(0, 0, 0, 0)" && cs.borderBottomColor !== "transparent";
                              const hasBd = hasTopBd || hasBotBd;
                              const hasSh = cs.boxShadow && cs.boxShadow !== "none";
                              if (hasBg || hasBd || hasSh) {
                                bad.push(`explainer empty ghost box: <${el.tagName.toLowerCase()} class="${el.getAttribute("class") || ""}"> ${Math.round(r.width)}x${Math.round(r.height)} in #${el.closest(".viz,[id]")?.id || "?"}`);
                              }
                            }
                          });
                          return bad;
                        })()""") or []
                        for it in ex_bad:
                            problems.append(f"{tag} {it}")

                for ev in cdp.events:
                    if ev.get("method") == "Runtime.exceptionThrown":
                        txt = ev.get("params", {}).get("exceptionDetails", {}).get("text", "JS exception")
                        problems.append(f"{tag} JS error: {txt}")

        cdp.close()
        if problems:
            print(f"{len(problems)} issue(s) found:")
            for p in problems[:30]:
                print(" -", p)
            sys.exit(1)
        print("Chromium verification passed: 0 layout/overflow/JS issues across lap, tab, ph (light & dark).")
    finally:
        proc.terminate()

if __name__ == "__main__":
    main()
