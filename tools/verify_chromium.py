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
    if (!r.width || e.closest("[hidden],.tbl-wrap,.eq")) return;
    if (r.right > W + 1 || r.left < -1) {
      bad.push(`wider than screen: <${e.tagName.toLowerCase()} class="${e.getAttribute("class") || ""}"> (${Math.round(r.left)}..${Math.round(r.right)}px vs ${W}px)`);
    }
  });
  document.querySelectorAll(".viz-stage svg").forEach(svg => {
    const f = svg.getBoundingClientRect(), id = svg.closest(".viz")?.id || "?";
    const strokes = [...svg.querySelectorAll("line,path")].filter(s => !s.closest(".hide,[style*='display: none'],defs") && !s.matches(".k-grid,.k-axis,.k-mark,.k-curve,.k-tan,.k-shade,.k-vl,.k-edge,.k-lead,.k-tree-edge,.k-tree-skel,.k-dep-edge,.k-dag-edge,.k-axis-arr,.k-prog-line,.k-vec,.k-tan-tri,.k-slash,.k-curve-halo,.k-probe-line")).map(s => s.getBoundingClientRect()).filter(r => r.width || r.height);
    const rects = [...svg.querySelectorAll("rect")].filter(b => !b.closest(".hide,[style*='display: none'],defs") && !b.matches(".k-box,.k-riem,.k-bar,.k-zone,.k-dag-shared")).map(b => b.getBoundingClientRect()).filter(r => r.width > 12 && r.height > 12);
    svg.querySelectorAll("text").forEach(t => {
      if (t.closest(".hide,[style*='display: none'],defs")) return;
      const r = t.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.left < f.left - 2 || r.right > f.right + 2 || r.top < f.top - 1 || r.bottom > f.bottom + 1) {
        bad.push(`text sticks out of #${id}: "${t.textContent.trim().slice(0, 40)}"`);
      }
      if (!t.classList.contains("k-halo")) {
        for (const sr of strokes) {
          if (sr.right > r.left + 2 && sr.left < r.right - 2 && sr.bottom > r.top + 2 && sr.top < r.bottom - 2) {
            bad.push(`stroke pierces text in #${id}: "${t.textContent.trim().slice(0, 40)}"`);
            break;
          }
        }
      }
      const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
      for (const rr of rects) {
        if (cx >= rr.left && cx <= rr.right && cy >= rr.top && cy <= rr.bottom) {
          if (r.left < rr.left + 3 || r.right > rr.right - 3 || r.top < rr.top + 2 || r.bottom > rr.bottom - 2) {
            bad.push(`text tight/overflows box in #${id}: "${t.textContent.trim().slice(0, 40)}"`);
          }
          break;
        }
      }
    });
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

class CDPClient:
    def __init__(self, ws_url):
        assert ws_url.startswith("ws://")
        rest = ws_url[5:]
        host_port, path = rest.split("/", 1)
        host, port = host_port.split(":")
        self.sock = socket.create_connection((host, int(port)), timeout=15)
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

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--shots", default="")
    args = ap.parse_args()
    html_path = os.path.abspath(args.html)
    if not os.path.exists(html_path):
        print(f"File not found: {html_path}", file=sys.stderr)
        sys.exit(1)
    if args.shots:
        os.makedirs(args.shots, exist_ok=True)

    port = 9231
    proc = subprocess.Popen(
        ["chromium", "--headless", "--no-sandbox", "--disable-gpu", f"--remote-debugging-port={port}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    try:
        ws_url = None
        for _ in range(30):
            try:
                pages = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{port}/json").read().decode())
                if pages:
                    ws_url = pages[0]["webSocketDebuggerUrl"]
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
                    viz_idxs = cdp.eval("(Explainer.screens||[]).map((s,i)=>s.nodes.some(n=>n.matches&&n.matches('.viz')||n.querySelector&&n.querySelector('.viz'))?i:-1).filter(i=>i>=0)") or []
                    for vi in viz_idxs:
                        cdp.eval(f"Explainer.show({vi})")
                        time.sleep(0.25)
                        ex_bad = cdp.eval(r"""(() => {
                          const bad = [];
                          document.querySelectorAll('.ex-media .kd-viz-pane, .ex-media .viz-stage svg').forEach(el => {
                            const r = el.getBoundingClientRect();
                            if (!r.width || !r.height) return;
                            const vid = el.closest('.viz')?.id || '?';
                            for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
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
