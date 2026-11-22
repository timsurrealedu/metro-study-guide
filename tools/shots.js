#!/usr/bin/env node
/* =====================================================================
   Metro Engine v1 · screenshots + layout report
   ---------------------------------------------------------------------
   node tools/shots.js <built.html> [outdir] [options]

   options
     --sizes lap,tab,ph     which screens (default: all three)
                            lap = 1440×900 laptop, tab = 820×1180 tablet,
                            ph = 390×844 phone
     --themes light,dark    which themes (default: both)
     --viz                  also save one picture of every visual
     --explainer N          how many explainer screens to save (default 4)

   Needs Node 18+ and Playwright with Chromium:
     npm i -D playwright && npx playwright install chromium
   (Claude's workspace already has both.)

   What you get in outdir (default: <guide>/out/shots):
     <size>_<theme>_00pick.png … 2x_explainer.png    the main states
     viz/<size>_<theme>_<id>.png                     with --viz
     report.txt                                      problems found

   The report lists: JavaScript errors, anything wider than the screen
   (sideways scrolling), text inside a visual that sticks out of its frame,
   and buttons smaller than 40 px on phones.
   ===================================================================== */
const path = require("path"), fs = require("fs");
let chromium;
try { ({chromium} = require("playwright")); } catch (e) {
  console.error("Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium"); process.exit(1);
}
const args = process.argv.slice(2);
if (!args[0] || args[0] === "-h" || args[0] === "--help") { console.log(fs.readFileSync(__filename, "utf8").split("*/")[0]); process.exit(0); }
const file = path.resolve(args[0]);
const out = path.resolve(args[1] && !args[1].startsWith("--") ? args[1] : path.join(path.dirname(file), "shots"));
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const SIZES = {lap: [1440, 900], tab: [820, 1180], ph: [390, 844]};
const sizes = String(opt("sizes", "lap,tab,ph")).split(",").filter(s => SIZES[s]);
const themes = String(opt("themes", "light,dark")).split(",");
const allViz = !!opt("viz", false), nEx = +opt("explainer", 4);
fs.mkdirSync(out, {recursive: true}); if (allViz) fs.mkdirSync(path.join(out, "viz"), {recursive: true});

/* screenshots are taken with animations frozen so they are repeatable */
const QUIET = "html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}";
const report = [];

(async () => {
  const b = await chromium.launch();
  for (const sz of sizes) for (const theme of themes) {
    const [w, hh] = SIZES[sz], phone = w < 800;
    const ctx = await b.newContext({viewport: {width: w, height: hh}, deviceScaleFactor: 1, isMobile: phone, hasTouch: w < 1100, colorScheme: theme, reducedMotion: "reduce"});
    await ctx.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
    const p = await ctx.newPage();
    const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    await p.goto("file://" + file); await p.addStyleTag({content: QUIET});
    const T = n => path.join(out, `${sz}_${theme}_${n}.png`);
    const shot = async n => { await p.waitForTimeout(250); await p.screenshot({path: T(n)}); };
    const go = async (sel, pad = 100) => p.evaluate(([s, pad]) => { const e = document.querySelector(s); if (!e) return false; scrollTo(0, e.getBoundingClientRect().top + scrollY - pad); document.querySelectorAll(".rv").forEach(x => x.classList.add("in")); return true; }, [sel, pad]);
    const tag = `[${sz} ${theme}]`;

    await p.waitForSelector(".pick:not([hidden])", {timeout: 10000}).catch(() => report.push(`${tag} the boot screen never showed the mode picker`));
    await shot("00pick");
    await p.click('.pick-opt[data-mode="scroll"]').catch(() => {}); await p.waitForTimeout(600);
    await p.evaluate(() => { document.querySelectorAll(".rv").forEach(e => e.classList.add("in")); scrollTo(0, 0); });
    await shot("01top");
    const spots = [[".part .part-open", "02line"], [".chapter:not(.checkpoint) .ch-head", "03station"], [".chapter .viz", "04visual"],
                   [".tbl-wrap", "05table"], [".callout.eg,.callout.note", "06callout"], [".sorter", "07sorter"], ["#r-cards .flash,.flash", "08cards"]];
    for (const [s, n] of spots) if (await go(s)) await shot(n);
    if (await go(".chapter.checkpoint details.cp")) {
      await p.evaluate(() => { const d = document.querySelector(".chapter.checkpoint details.cp"); d.open = true; });
      await p.click(".chapter.checkpoint details.cp .q:not([hidden]) .opt >> nth=0").catch(() => {});
      await shot("09checkpoint");
    }
    if (w < 1100 && await p.$(".btn-pill")) { await p.click(".btn-pill").catch(() => {}); await shot("10contents"); await p.click(".sheet-done").catch(() => {}); }
    if (w <= 760 && await p.$(".tb-opt")) { await p.click(".tb-opt").catch(() => {}); await shot("11options"); await p.click(".op-done").catch(() => {}); }

    /* layout checks in scroll mode */
    const lay = await p.evaluate(phone => {
      const W = document.documentElement.clientWidth, bad = [];
      document.querySelectorAll("main *").forEach(e => {
        if (e.closest("svg") && e.tagName !== "svg") return;
        const r = e.getBoundingClientRect(); if (!r.width || e.closest("[hidden],.tbl-wrap,.eq")) return;
        if (r.right > W + 1 || r.left < -1) bad.push(`wider than the screen: <${e.tagName.toLowerCase()} class="${e.getAttribute("class") || ""}"> (${Math.round(r.left)}…${Math.round(r.right)} px, screen ${W})`);
      });
      document.querySelectorAll(".viz-stage svg").forEach(svg => {
        const f = svg.getBoundingClientRect(); const id = svg.closest(".viz")?.id || "?";
        svg.querySelectorAll("text").forEach(t => { if (t.closest(".hide,[style*='display: none'],defs")) return; const r = t.getBoundingClientRect(); if (!r.width) return;
          if (r.left < f.left - 2 || r.right > f.right + 2) bad.push(`text sticks out of visual #${id}: "${t.textContent.trim().slice(0, 40)}"`); });
      });
      if (phone) document.querySelectorAll("main button, main a.btn, main .opt").forEach(e => { const r = e.getBoundingClientRect(); if (r.width && r.height && Math.min(r.width, r.height) < 36 && !e.closest(".vprog,.pdots,.q-steps")) bad.push(`small tap target (${Math.round(r.width)}×${Math.round(r.height)}): ${e.textContent.trim().slice(0, 30) || e.getAttribute("aria-label")}`); });
      if (document.documentElement.scrollWidth > W + 1) bad.unshift(`PAGE SCROLLS SIDEWAYS: ${document.documentElement.scrollWidth} px wide on a ${W} px screen`);
      return [...new Set(bad)].slice(0, 40);
    }, phone);
    lay.forEach(x => report.push(`${tag} ${x}`));

    if (allViz) {
      const ids = await p.evaluate(() => [...document.querySelectorAll(".viz[id]")].map(e => e.id));
      for (const id of ids) { await go("#" + id, 90); await p.waitForTimeout(300); const el = await p.$("#" + id); if (el) await el.screenshot({path: path.join(out, "viz", `${sz}_${theme}_${id}.png`)}).catch(() => {}); }
    }

    /* explainer mode */
    const ok = await p.evaluate(() => { if (!window.Explainer) return false; Explainer.enter(); return true; });
    if (ok) {
      await p.waitForTimeout(400);
      const n = await p.evaluate(() => Explainer.screens.length);
      const pick = [0, 1, ...Array.from({length: Math.max(0, nEx - 2)}, (_, i) => Math.round((i + 1) * (n - 1) / (nEx - 1)))].slice(0, nEx);
      for (const [k, i] of pick.entries()) { await p.evaluate(i => Explainer.show(i), i); await p.waitForTimeout(450); await shot(`2${k}_explainer${i}`); }
    }
    errs.forEach(e => report.push(`${tag} JavaScript error: ${e}`));
    await ctx.close();
    console.log(`${tag} done`);
  }
  await b.close();
  const txt = report.length ? report.join("\n") : "No problems found.";
  fs.writeFileSync(path.join(out, "report.txt"), txt + "\n");
  console.log(`\nScreenshots in ${out}\n${report.length} problem(s)${report.length ? ":\n" + report.slice(0, 30).join("\n") : ""}`);
})();
