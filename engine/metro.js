/* =====================================================================
   METRO ENGINE v1.3 — runtime  (docs/02-file-structure.md, docs/05-custom-visuals.md)
   Reads the page structure (.part > .chapter) and builds:
   sidebar + phone bar + sheet, scroll spy, progress, Auto/Light/Dark,
   motion switch, step players, flowing dots, quizzes, flashcards.
   Content pages only provide: window.GUIDE, window.QUIZ, window.FLASH,
   and HTML that follows the chapter template.
   ===================================================================== */
(function(){
"use strict";
const G = window.GUIDE || {id:"guide", title:"Study guide"};
const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const root = document.documentElement;
const store = {
  get(k,d){try{const v=localStorage.getItem(G.id+":"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem(G.id+":"+k,JSON.stringify(v))}catch(e){}}
};
const h=(tag,attrs={},html)=>{const e=document.createElement(tag);for(const k in attrs){if(k==="class")e.className=attrs[k];else if(k.startsWith("on"))e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k])}if(html!=null)e.innerHTML=html;return e};
const ic=(n,c="ic")=>`<svg class="${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

/* ---------- icon sprite ---------- */
const SPRITE=`<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
<symbol id="i-warn" viewBox="0 0 24 24"><path d="M12 3.5L2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/></symbol>
<symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.3"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></symbol>
<symbol id="i-pause" viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-back" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></symbol>
<symbol id="i-next" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></symbol>
<symbol id="i-reset" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></symbol>
<symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></symbol>
<symbol id="i-auto" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/></symbol>
<symbol id="i-sidebar" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M9.5 4.5v15"/></symbol>
<symbol id="i-list" viewBox="0 0 24 24"><path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r=".6" fill="currentColor"/><circle cx="4.5" cy="12" r=".6" fill="currentColor"/><circle cx="4.5" cy="17.5" r=".6" fill="currentColor"/></symbol>
<symbol id="i-bulb" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/></symbol><symbol id="i-sliders" viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/></symbol><symbol id="i-train" viewBox="0 0 24 24"><rect x="5.5" y="2.5" width="13" height="14" rx="3.5"/><path d="M5.5 9.5h13M9 13.5h.01M15 13.5h.01M8.5 16.5 6.5 21M15.5 16.5l2 4.5M7.5 19h9"/></symbol>
<symbol id="i-motion" viewBox="0 0 24 24"><path d="M3 12h3l2.5-6 4 12 3-9 2 3H21"/></symbol>
<symbol id="i-shuffle" viewBox="0 0 24 24"><path d="M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.6 0 2.7-1.6 3.6-3.4M14 10c.8-1.7 1.6-3 2.5-3H20"/><path d="M17.5 4.5L20 7l-2.5 2.5M17.5 14.5L20 17l-2.5 2.5"/></symbol>
</svg>`;
document.body.insertAdjacentHTML("afterbegin",SPRITE);
/* shared glossy gradients for every diagram (fill:url(#g-…)) */
const gr=(id,top,bot)=>`<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`;
document.body.insertAdjacentHTML("afterbegin",`<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><defs>${gr("atp","#ffe45c","#ffc300")}${gr("car","#d98bff","#a23fe0")}${gr("o2","#5cb2ff","#0a6fe0")}${gr("h2o","#7fe0f0","#22a8c8")}${gr("co2","#b8b8bd","#7c7c82")}${gr("glu","#ff7a96","#f0234f")}${Object.entries((window.GUIDE&&GUIDE.lines)||{}).map(([k,l])=>l.grad?gr("p"+k,l.grad[0],l.grad[1]):"").join("")}${gr("leaf","#5fe07e","#1fa346")}${gr("leaf2","#34c759","#17803a")}${gr("soil","#8f6542","#5e3e26")}${gr("seed","#f2d6a4","#cfa86b")}${gr("light","#fff27a","#ffcc00")}</defs></svg>`);
/* ---------- theme (Auto follows the device; Light/Dark override it) ---------- */
let theme = store.get("theme","auto");
function applyTheme(t){theme=t;store.set("theme",t);if(t==="auto")root.removeAttribute("data-theme");else root.setAttribute("data-theme",t);
  $$(".seg-theme button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.t===t)))}
/* ---------- language (en / id) ---------- */
const I18N={
  en:{opt:"Options",done:"Done",mode:"Reading mode",scroll:"Scroll page",explain:"Explainer",
    mode_ex:"Full screen, one idea at a time. Tap Next to move on.",
    mode_sc:"The whole guide on one page. Scroll at your own pace.",
    app:"Appearance",app_d:"Auto matches your device's light or dark setting.",auto:"Auto",light:"Light",dark:"Dark",
    anim:"Animations",anim_d:"Moving parts in the visuals. Turn off to keep everything still.",
    lang:"Language",lang_d:"Translate all guide contents between English and Indonesian.",
    font:"Font",font_d:"Use a font file of your own.",choose:"Aa · Choose",
    contents:"Contents",mark:"Mark chapter as learned",learned:"Learned",next:"Next",
    next_st:"Next station",start:"Start",cont:"Continue",stops:"stops",
    reset:"Start over",step_of:(a,b)=>`Step ${a} of ${b}`,
    q_of:(a,b)=>`Question ${a} of ${b}`,score:"See your score",q_next:"Next question",
    try_again:"Try again",check_ans:"Check answer",ans:"Answer",flip:"Flip",shuffle:"Shuffle",
    stations:"Stations",ex_scroll:"Scroll",back:"Back",finish:"Finish",start_ride:"Start riding",
    try_it:"Try it yourself",try_d:"Drag a slider and watch the visual.",mark_sm:"Mark as learned",
    full_scr:"Full screen",free:"Or try it yourself"},
  id:{opt:"Opsi",done:"Selesai",mode:"Mode baca",scroll:"Gulir halaman",explain:"Penjelas",
    mode_ex:"Layar penuh, satu ide tiap langkah. Ketuk Lanjut.",
    mode_sc:"Seluruh panduan dalam satu halaman. Gulir sesuai ritme Anda.",
    app:"Tampilan",app_d:"Otomatis mengikuti tema terang atau gelap perangkat.",auto:"Otomatis",light:"Terang",dark:"Gelap",
    anim:"Animasi",anim_d:"Gerakan pada visual. Matikan agar tetap diam.",
    lang:"Bahasa",lang_d:"Terjemahkan seluruh isi panduan ke Bahasa Indonesia atau Inggris.",
    font:"Huruf",font_d:"Gunakan berkas huruf Anda sendiri.",choose:"Aa · Pilih",
    contents:"Daftar Isi",mark:"Tandai bab sudah dipelajari",learned:"Sudah dipelajari",next:"Berikutnya",
    next_st:"Stasiun berikutnya",start:"Mulai",cont:"Lanjut",stops:"stasiun",
    reset:"Ulangi",step_of:(a,b)=>`Langkah ${a} dari ${b}`,
    q_of:(a,b)=>`Pertanyaan ${a} dari ${b}`,score:"Lihat skor",q_next:"Pertanyaan berikutnya",
    try_again:"Coba lagi",check_ans:"Periksa jawaban",ans:"Jawaban",flip:"Balik",shuffle:"Acak",
    stations:"Stasiun",ex_scroll:"Gulir",back:"Kembali",finish:"Selesai",start_ride:"Mulai belajar",
    try_it:"Coba sendiri",try_d:"Geser pengatur dan amati visualnya.",mark_sm:"Tandai dipelajari",
    full_scr:"Layar penuh",free:"Atau coba sendiri"}
};
let lang=store.get("lang",root.lang==="id"?"id":"en");
const t=(k,...a)=>{const v=(I18N[lang]||I18N.en)[k]??I18N.en[k]??k;return typeof v==="function"?v(...a):v};
/* ---------- motion ---------- */
const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
let motion = store.get("motion", reduce?"off":"on");
function applyMotion(m){motion=m;store.set("motion",m);root.setAttribute("data-motion",m);
  $$(".btn-motion").forEach(b=>{b.setAttribute("aria-checked",String(m==="on"));b.title=m==="on"?"Animations are on. Tap to pause them all.":"Animations are paused. Tap to turn them on."});
  document.dispatchEvent(new CustomEvent("motionchange",{detail:m}))}
const motionOn=()=>motion==="on";

/* ---------- structure ---------- */
const parts=$$(".part");
const chapters=$$(".chapter");
chapters.forEach(c=>{c._part=c.closest(".part");c.counts=c.dataset.count!=="no"});
const counted=chapters.filter(c=>c.counts);
let done=new Set(store.get("done",[]));

/* ---------- chrome: top bar ---------- */
const main=$("main");
const top=h("div",{class:"topbar",role:"region","aria-label":"Reading controls"});
top.innerHTML=`<div class="topbar-in glass">
 <button class="tb-btn btn-side" type="button" title="Show or hide the sidebar" aria-label="Show or hide the sidebar">${ic("sidebar")}</button>
 <div class="crumb" aria-live="polite"><i class="dot"></i><span class="t"><span class="p"></span><span class="c">${G.title}</span></span></div>
 <button class="tb-btn tb-aa" type="button" aria-haspopup="dialog" aria-label="Fonts" title="Load your own font">Aa<span class="lbl">Font</span></button><button class="tb-btn tb-fs fs-btn" type="button" aria-label="Full screen" title="Full screen" hidden><svg class="ic fs-on" viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg><svg class="ic fs-off" viewBox="0 0 24 24"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg><span class="lbl">Full screen</span></button>
 <button class="switch btn-motion" type="button" role="switch" aria-checked="true" aria-label="Animations"><span class="lbl">Animations</span><span class="tr"></span></button>
 <div class="seg seg-theme" role="group" aria-label="Appearance">
   <button type="button" data-t="auto" title="Follow my device" aria-label="Appearance: follow my device">${ic("auto")}<span class="lbl">Auto</span></button>
   <button type="button" data-t="light" title="Light" aria-label="Appearance: light">${ic("sun")}<span class="lbl">Light</span></button>
   <button type="button" data-t="dark" title="Dark" aria-label="Appearance: dark">${ic("moon")}<span class="lbl">Dark</span></button>
 </div>
 <button class="tb-opt" type="button" aria-haspopup="dialog">${ic("sliders")}<span>Options</span></button></div>`;
main.prepend(top);
$(".btn-side",top).addEventListener("click",()=>{root.classList.toggle("side-hidden");store.set("side",root.classList.contains("side-hidden")?"hidden":"shown")});
if(store.get("side","shown")==="hidden")root.classList.add("side-hidden");
if(!matchMedia("(min-width:1100px)").matches) $(".btn-side",top).hidden=true;
matchMedia("(min-width:1100px)").addEventListener?.("change",e=>{$(".btn-side",top).hidden=!e.matches});
$(".btn-motion",top).addEventListener("click",()=>applyMotion(motionOn()?"off":"on"));
const TH=["auto","light","dark"],compactBar=matchMedia("(max-width:600px)");
$$(".seg-theme button",top).forEach(b=>b.addEventListener("click",()=>{
  /* on phones only the current mode shows; tapping it moves to the next one */
  if(compactBar.matches&&b.dataset.t===theme){const n=TH[(TH.indexOf(theme)+1)%3];applyTheme(n);showToast(`<span class="ti" style="background:var(--lc);color:var(--lc-on)">${ic(n==="auto"?"auto":n==="light"?"sun":"moon")}</span><span>${n==="auto"?"Theme follows your device":n==="light"?"Light theme":"Dark theme"}</span>`)}
  else applyTheme(b.dataset.t)}));

/* ---------- navigation (sidebar + sheet share one builder; max two levels) ---------- */
const lineVars=n=>`--pc:var(--p${n});--pf:var(--p${n}-f);--pon:var(--p${n}-on);--lc:var(--p${n}-f);--lc-ink:var(--p${n});--lc-on:var(--p${n}-on)`;
function navHTML(){
  /* each part is a metro line: a line badge, then a route with one station per chapter */
  let s="";
  parts.forEach(p=>{const n=p.dataset.part;const chs=chapters.filter(c=>c._part===p);const cnt=chs.filter(c=>c.counts);
    s+=`<div class="nav-group" style="${lineVars(n)}"><div class="nav-label"><span class="lbadge">${n}</span><span class="ln">${p.dataset.title}</span>${cnt.length?`<span class="pp" data-pp="${p.id}"></span>`:""}</div><div class="nav-list route">`;
    chs.forEach(c=>{s+=`<a href="#${c.id}" data-ch="${c.id}"><span class="st">${ic("check")}</span><span class="tt"><small>${c.dataset.n||""}</small>${c.dataset.title}</span></a>`});
    s+="</div></div>"});
  return s;
}
const headHTML=`<div class="side-head"><div class="side-title"><span class="appicon" aria-hidden="true"><svg class="ic">${'<use href="#i-train"/>'}</svg></span><div><b>${G.title}</b><div class="side-sub">${G.subtitle||""}</div></div></div>
  <div class="pbar"><i></i></div><div class="pcount"></div></div>`;
const side=h("nav",{class:"side glass","aria-label":"Chapters"},headHTML+`<div class="nav">${navHTML()}</div>`);
document.body.appendChild(side);
const pbar=h("div",{class:"phonebar"});
pbar.innerHTML=`<div class="phonebar-in glass"><svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle class="bgc" cx="18" cy="18" r="14"/><circle class="fg" cx="18" cy="18" r="14" stroke-dasharray="87.96" stroke-dashoffset="87.96" transform="rotate(-90 18 18)"/></svg>
 <div class="pb-where"><b>${G.title}</b><span class="pcount"></span></div>
 <button class="btn-pill" type="button" aria-haspopup="dialog">${ic("list")}Contents</button></div>`;
document.body.appendChild(pbar);
const scrim=h("div",{class:"sheet-scrim"});const sheet=h("div",{class:"sheet glass",role:"dialog","aria-modal":"true","aria-label":"Contents"},`<div class="grab" aria-hidden="true"></div><button class="sheet-done" type="button">Done</button>`+headHTML+`<div class="nav">${navHTML()}</div>`);
document.body.append(scrim,sheet);
function openSheet(o){sheet.classList.toggle("open",o);scrim.classList.toggle("open",o);if(o)$("a",sheet)?.focus({preventScroll:true})}
$(".btn-pill",pbar).addEventListener("click",()=>openSheet(true));
scrim.addEventListener("click",()=>openSheet(false));
$(".sheet-done",sheet).addEventListener("click",()=>openSheet(false));
/* swipe a sheet down by its top area to close it */
function dragClose(panel,close){let y0=null,dy=0;
  panel.addEventListener("touchstart",e=>{if(!e.target.closest(".grab,.side-head,.op-head")||e.target.closest("button"))return;y0=e.touches[0].clientY;dy=0;panel.style.transition="none"},{passive:true});
  panel.addEventListener("touchmove",e=>{if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);panel.style.transform=`translateY(${dy}px)`},{passive:true});
  const end=()=>{if(y0==null)return;panel.style.transition="";panel.style.transform="";if(dy>80)close();y0=null};
  panel.addEventListener("touchend",end);panel.addEventListener("touchcancel",end)}
dragClose(sheet,()=>openSheet(false));
sheet.addEventListener("click",e=>{if(e.target.closest("a"))openSheet(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")openSheet(false)});

/* ---------- options: every setting, labelled and explained (phones, and the explainer) ---------- */
const optScrim=h("div",{class:"sheet-scrim op-scrim"});
const opt=h("div",{class:"optsheet",role:"dialog","aria-modal":"true","aria-label":"Options"});
opt.innerHTML=`<div class="grab" aria-hidden="true"></div><div class="op-head"><b data-tr="opt">${t("opt")}</b><button class="op-done" type="button" data-tr="done">${t("done")}</button></div>
 <div class="op-list">
  <div class="op-item"><div class="op-l"><b data-tr="mode">${t("mode")}</b><span class="op-md"></span></div>
   <div class="segc op-mode" role="group" aria-label="Reading mode"><button type="button" data-m="scroll" data-tr="scroll">${t("scroll")}</button><button type="button" data-m="explain" data-tr="explain">${t("explain")}</button></div></div>
  <div class="op-item"><div class="op-l"><b data-tr="app">${t("app")}</b><span data-tr="app_d">${t("app_d")}</span></div>
   <div class="segc op-theme seg-theme" role="group" aria-label="Appearance"><button type="button" data-t="auto">${ic("auto")} <span data-tr="auto">${t("auto")}</span></button><button type="button" data-t="light">${ic("sun")} <span data-tr="light">${t("light")}</span></button><button type="button" data-t="dark">${ic("moon")} <span data-tr="dark">${t("dark")}</span></button></div></div>
  <div class="op-item"><div class="op-l"><b data-tr="lang">${t("lang")}</b><span class="op-ld" data-tr="lang_d">${t("lang_d")}</span></div>
   <div class="segc op-lang" role="group" aria-label="Language"><button type="button" data-l="en">English</button><button type="button" data-l="id">Indonesia</button></div></div>
  <div class="op-item op-inline"><div class="op-l"><b data-tr="anim">${t("anim")}</b><span data-tr="anim_d">${t("anim_d")}</span></div>
   <button class="switch btn-motion" type="button" role="switch" aria-label="Animations"><span class="tr"></span></button></div>
  <div class="op-item op-inline"><div class="op-l"><b data-tr="font">${t("font")}</b><span data-tr="font_d">${t("font_d")}</span></div>
   <button class="vbtn op-font" type="button" data-tr="choose">${t("choose")}</button></div>
 </div>
 <p class="op-by">by @Dvenmc</p>`;
document.body.append(optScrim,opt);
const isEx=()=>root.classList.contains("mode-ex");
function paintOpt(){$$(".op-mode button",opt).forEach(b=>b.setAttribute("aria-pressed",String((b.dataset.m==="explain")===isEx())));
  $(".op-md",opt).textContent=t(isEx()?"mode_ex":"mode_sc");
  $$(".op-theme button",opt).forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.t===theme)));
  $$(".op-lang button",opt).forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.l===lang)));
  $$("[data-tr]",opt).forEach(el=>{el.textContent=t(el.dataset.tr)})}
function openOptions(o){if(o)paintOpt();opt.classList.toggle("open",o);optScrim.classList.toggle("open",o);if(o)$(".op-done",opt).focus({preventScroll:true})}
$(".tb-opt",top).addEventListener("click",()=>openOptions(true));
$(".op-done",opt).addEventListener("click",()=>openOptions(false));
optScrim.addEventListener("click",()=>openOptions(false));
document.addEventListener("keydown",e=>{if(e.key==="Escape")openOptions(false)});
dragClose(opt,()=>openOptions(false));
$$(".op-mode button",opt).forEach(b=>b.addEventListener("click",()=>{const X=window.Explainer;if(!X)return;
  if(b.dataset.m==="explain"&&!isEx())X.enter();else if(b.dataset.m==="scroll"&&isEx())X.leave(false);paintOpt();setTimeout(()=>openOptions(false),180)}));
$$(".op-theme button",opt).forEach(b=>b.addEventListener("click",()=>{applyTheme(b.dataset.t);paintOpt()}));
$$(".op-lang button",opt).forEach(b=>b.addEventListener("click",()=>{applyLang(b.dataset.l);paintOpt()}));
$(".btn-motion",opt).addEventListener("click",()=>applyMotion(motionOn()?"off":"on"));
$(".op-font",opt).addEventListener("click",e=>{e.stopPropagation();openOptions(false);fontPop.classList.add("open")});

/* ---------- part openers: chapter pills; chapter footers ---------- */
$$(".part").forEach(p=>{const po=$(".part-open",p);if(po&&!$(".lbadge",po))po.insertAdjacentHTML("afterbegin",`<span class="lbadge big" aria-hidden="true">${p.dataset.part}</span><span class="line-band" aria-hidden="true"></span>`);
  const l=$(".plist[data-auto]",p);if(!l)return;
  chapters.filter(c=>c._part===p).forEach(c=>l.insertAdjacentHTML("beforeend",`<a href="#${c.id}" data-ch="${c.id}"><i class="st"></i><b>${c.dataset.n||"•"}</b><span class="pl-n">${c.dataset.n||""}</span>${c.dataset.title}</a>`))});
chapters.forEach((c,i)=>{
  const f=$(".ch-foot[data-auto]",c);if(!f)return;
  const nx=chapters[i+1];
  f.innerHTML=(c.counts?`<button class="donebtn" type="button" data-done="${c.id}" aria-pressed="false">${ic("check")}<span>Mark chapter as learned</span></button>`:"")+
    (nx?`<div class="next">Next: <a href="#${nx.id}">${nx.dataset.n?nx.dataset.n+" ":""}${nx.dataset.title}</a></div>`:"");
});
/* ---------- overview: a metro map. Every line (part) runs into one
   interchange; the Review line (data-part="R") runs on to the terminus.
   Wide screens: lines run left to right. Narrow screens: lines run top to
   bottom in blocks of up to three columns. ---------- */
const ovBox=$(".overview[data-auto]");
let paintOverview=()=>{};
if(ovBox){
  const G=window.GUIDE||{};const TERM=G.terminus||"Exam";
  const ps=parts.filter(p=>chapters.some(c=>c._part===p&&c.counts));
  const rv=parts.find(p=>p.dataset.part==="R");const rvCh=rv?chapters.filter(c=>c._part===rv):[];
  const short=c=>c.dataset.short||c.dataset.title;
  ovBox.innerHTML=`<div class="ov-map"><div class="ov-svg"></div>
    <div class="ov-foot"><div class="ov-leg">${ps.concat(rv?[rv]:[]).map(p=>{const n=p.dataset.part,cs=chapters.filter(c=>c._part===p&&c.counts);
      return `<a href="#${p.id}" style="${lineVars(n)}"><span class="lbadge">${n}</span><span class="ln">${p.dataset.title}</span>${cs.length?`<b data-ov-l="${p.id}"></b>`:`<b>${chapters.filter(c=>c._part===p).length} stops</b>`}</a>`}).join("")}</div>
    <div class="ov-next"><span class="eyebrow">Next station</span><b data-ov-nt></b><a class="vbtn pri" data-ov-nx href="#">Start</a></div></div></div>`;
  const host=$(".ov-svg",ovBox);
  const wrapTxt=(t,max)=>{const w=[];t.split(" ").forEach(x=>{while(x.length>max){w.push(x.slice(0,max-1)+"-");x=x.slice(max-1)}w.push(x)});const L=[];let cur="";w.forEach(x=>{if((cur+(cur.endsWith("-")?"":" ")+x).trim().length>max&&cur){L.push(cur);cur=x}else cur=cur.endsWith("-")?cur+x:(cur+" "+x).trim()});if(cur)L.push(cur);return L};
  const st=(c,x,y,n,lab)=>`<a href="#${c.id}" class="mst" data-ch="${c.id}" style="${lineVars(n)}" aria-label="${c.dataset.n} ${c.dataset.title}"><circle class="mr" cx="${x}" cy="${y}" r="15"/><circle class="md" cx="${x}" cy="${y}" r="8.5"/><path class="mk" d="M${x-4},${y} l3,3 l5,-6"/>${lab}</a>`;
  const badge=(n,x,y,r,dy)=>`<g style="${lineVars(n)}"><circle class="mbadge" cx="${x}" cy="${y}" r="${r}"/><text class="mbt" x="${x}" y="${y+dy}">${n}</text></g>`;
  function draw(){
    const W=Math.max(300,Math.round(host.clientWidth||700));let s="",H;
    const lines=ps.map(p=>({p,n:p.dataset.part,cs:chapters.filter(c=>c._part===p&&c.counts)}));
    const N=lines.length,mid=Math.floor((N-1)/2);
    if(W>=680){
      const big=W>=900,dyL=(big?130:114)-(N>5?26:0),x0=64,hubX=Math.round(W*(big?.62:.66));
      const ys=lines.map((_,i)=>84+i*dyL),yH=84+mid*dyL;H=84+Math.max(0,N-1)*dyL+92;
      /* up to 3 lines all bend onto one diagonal (the Bio Metro look). With 4 or more,
         each line enters the interchange at its own height (off) so the diagonals run
         side by side instead of on top of each other. */
      const G=N>3?22:0,off=i=>(i-mid)*G,offs=lines.map((_,i)=>off(i));
      const xA=(y,i=0)=>hubX-34-Math.abs(yH+off(i)-y);
      const xAmin=Math.min(hubX-34-dyL,...ys.filter((y,i)=>i!==mid).map((y,i2)=>xA(y,ys.indexOf(y))));
      const lab=(x,y,t,code,up)=>`<text class="ml" transform="translate(${x+7},${y+(up?-17:24)}) rotate(${up?-32:32})"><tspan class="mc">${code}</tspan> ${t}</text>`;
      lines.forEach((L,i)=>{const y=ys[i],e=yH+off(i);const d=i===mid?`M${x0},${y} H${hubX}`:`M${x0},${y} H${xA(y,i)} L${xA(y,i)+Math.abs(e-y)},${e} H${hubX}`;
        s+=`<path class="mline" d="${d}" style="stroke:var(--p${L.n}-f)"/>`+badge(L.n,x0-30,y,16,5.5)});
      if(rvCh.length)s+=`<path class="mline" d="M${hubX},${yH} H${W-70}" style="stroke:var(--pR-f)"/>`;
      lines.forEach((L,i)=>{const y=ys[i],k=L.cs.length,x1=x0+34,x2=i===mid?xAmin-(big?80:50):N>3&&i>mid&&i<N-1?Math.min(xA(y,i)-14,(()=>{/* keep the slanted labels clear of the next line's diagonal */const len=Math.max(...L.cs.map(c=>(c.dataset.n+" "+short(c)).length))*7.2;return xA(y,i)+G-(24+len*.53)-10-(len*.85+7)})()):N>3&&i>0&&i<mid?Math.min(xA(y,i)-14,xA(y,i)-9-Math.max(...L.cs.map(c=>(c.dataset.n+" "+short(c)).length))*7.2*.32):xA(y,i)-14;L.cs.forEach((c,j)=>{const x=Math.round(k>1?x1+(x2-x1)*j/(k-1):x1);s+=st(c,x,y,L.n,lab(x,y,short(c),c.dataset.n,i===0&&N>1))})});
      if(rvCh.length){const k=rvCh.length,x1=hubX,x2=W-(big?150:116);
        const o1=Math.min(0,...offs),o2=Math.max(0,...offs);
        s+=`<rect class="mhub" x="${hubX-19}" y="${yH+o1-28}" width="38" height="${o2-o1+56}" rx="19"/>`;
        rvCh.forEach((c,j)=>{const x=Math.round(x1+(x2-x1)*j/Math.max(1,k-1));s+=st(c,x,yH,"R",lab(x,yH+8+(j?0:o2),short(c),c.dataset.n,false))});
        s+=`<g class="mterm"><rect x="${W-78}" y="${yH-17}" width="66" height="34" rx="8"/><text x="${W-45}" y="${yH+5}">${TERM}</text></g>`}
    } else {
      const xG=18,xN=W-107,xE=Math.round(W*.336),y0=74,dy=52;
      const lab=(x,y,t,code,maxW)=>{const L=wrapTxt(t,Math.max(8,Math.floor(maxW/5.9)));return `<text class="ml sm" x="${x+13}" y="${y-3-(L.length-1)*7}"><tspan class="mc">${code}</tspan>${L.map((l,i)=>`<tspan x="${x+13}" dy="${i?13.5:13}">${l}</tspan>`).join("")}</text>`};
      const blocks=[];for(let i=0;i<N;i+=3)blocks.push(lines.slice(i,i+3));
      let yTop=y0,hubY=y0,prevHub=null;
      blocks.forEach((B,bi)=>{
        const k=B.length,xM=Math.round((xE+xN)/2);
        const xs=k===3?(bi?[xG,xM,xN]:[xG,xE,xN]):k===2?[xG,xN]:(bi?[xN]:[xE]);
        const rows=Math.max(6,...B.map(L=>L.cs.length)),yA=yTop+(rows-1)*dy;
        hubY=yA+Math.max(0,...xs.map(x=>Math.abs(xE-x)));
        B.forEach((L,i)=>{const x=xs[i];const d=x===xE?`M${x},${yTop} V${hubY}`:`M${x},${yTop} V${hubY-Math.abs(xE-x)} L${xE},${hubY}`;
          s+=`<path class="mline" d="${d}" style="stroke:var(--p${L.n}-f)"/>`+badge(L.n,x,yTop-36,15,5.5)});
        B.forEach((L,i)=>{const x=xs[i],k2=L.cs.length,y1=yTop+6,y2=yA-6,maxW=(i===k-1?W-4:xs[i+1]-10)-(x+13);
          L.cs.forEach((c,j)=>{const y=Math.round(k2>1?y1+(y2-y1)*j/(k2-1):y1);s+=st(c,x,y,L.n,lab(x,y,short(c),c.dataset.n,maxW))})});
        if(prevHub!=null)s=`<path class="mlink" d="M${xE},${prevHub} V${hubY}"/>`+s;
        if(bi<blocks.length-1){s+=`<circle class="mjoin" cx="${xE}" cy="${hubY}" r="9"/>`;prevHub=hubY;yTop=hubY+96}
      });
      H=hubY+(rvCh.length?Math.max(1,rvCh.length-1)*dy+96:40);
      if(rvCh.length)s+=`<path class="mline" d="M${xE},${hubY} V${hubY+(rvCh.length-1)*dy+44}" style="stroke:var(--pR-f)"/>`;
      if(rvCh.length){s+=`<rect class="mhub" x="${xE-28}" y="${hubY-19}" width="56" height="38" rx="19"/>`;
        rvCh.forEach((c,j)=>{const y=hubY+j*dy;s+=st(c,xE,y,"R",lab(xE+16,y,short(c),c.dataset.n,W-xE-46))});
        const yt=hubY+(rvCh.length-1)*dy+44;s+=`<g class="mterm"><rect x="${xE-33}" y="${yt}" width="66" height="32" rx="8"/><text x="${xE}" y="${yt+21}">${TERM}</text></g>`}
    }
    host.innerHTML=`<svg class="mmap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Metro map of all stations: ${N} line${N>1?"s":""} meet at the review interchange, which runs on to the ${TERM}">${s}</svg>`;
    paintOverview();
  }
  paintOverview=()=>{
    const nx=counted.find(c=>!done.has(c.id));
    $$(".mst",host).forEach(g=>{g.classList.toggle("done",done.has(g.dataset.ch));g.classList.toggle("next",!!nx&&g.dataset.ch===nx.id)});
    ps.forEach(p=>{const cs=chapters.filter(c=>c._part===p&&c.counts),k=cs.filter(c=>done.has(c.id)).length;const e=$(`[data-ov-l="${p.id}"]`,ovBox);if(e)e.textContent=`${k}/${cs.length}`});
    const n=counted.filter(c=>done.has(c.id)).length;const a=$("[data-ov-nx]",ovBox);
    if(nx){$("[data-ov-nt]",ovBox).textContent=`${nx.dataset.n} ${nx.dataset.title}`;a.href="#"+nx.id;a.textContent=n?"Continue":"Start";a.style.cssText=lineVars(nx._part.dataset.part)+";--volt:var(--lc);--von:var(--lc-on)"}
    else{const fin=document.querySelector("[data-final]")||rvCh.find(c=>c.querySelector(".quiz"))||rvCh[0];$("[data-ov-nt]",ovBox).textContent="All stations done. Ride the review line.";a.href=fin?"#"+fin.id:"#top";a.textContent=fin&&fin.dataset.finalLabel||"Practice exam";a.style.cssText=lineVars("R")+";--volt:var(--lc);--von:var(--lc-on)"}};
  let lastW=0;new ResizeObserver(()=>{const w=Math.round(host.clientWidth);if(Math.abs(w-lastW)>4){lastW=w;draw()}}).observe(host);draw();
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-done]");if(!b)return;const id=b.dataset.done;if(done.has(id))done.delete(id);else{done.add(id);learned(id,b)}saveDone()});
/* ---------- toast + celebration ---------- */
const toast=h("div",{class:"toast glass",role:"status"});document.body.appendChild(toast);let toastT=0;
function showToast(html){toast.innerHTML=html;toast.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>toast.classList.remove("show"),2600)}
function learned(id,from){const c=chapters.find(x=>x.id===id);const n=counted.filter(x=>done.has(x.id)).length;
  showToast(`<span class="ti">${ic("check")}</span><span>${c?(c.dataset.n+" "+c.dataset.title):"Chapter"} learned · ${n}/${counted.length}</span>`);if(from)celebrate(from)}
function celebrate(el){if(!motionOn())return;const r=el.getBoundingClientRect();const cv=h("canvas",{class:"confetti"});document.body.appendChild(cv);
  const W=cv.width=innerWidth*devicePixelRatio,H=cv.height=innerHeight*devicePixelRatio;const g=cv.getContext("2d");g.scale(devicePixelRatio,devicePixelRatio);
  const cols=["#ff375f","#ff9f0a","#ffd60a","#30d158","#64d2ff","#0a84ff","#bf5af2"];const P=[];const ox=r.left+r.width/2,oy=r.top+r.height/2;
  for(let k=0;k<90;k++){const a=-Math.PI/2+(Math.random()-.5)*2.2,v=6+Math.random()*7;P.push({x:ox,y:oy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,w:5+Math.random()*5,h:8+Math.random()*6,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[k%cols.length]})}
  let t0=performance.now();(function fr(now){const t=now-t0;g.clearRect(0,0,innerWidth,innerHeight);P.forEach(p=>{p.vy+=.28;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;g.save();g.globalAlpha=Math.max(0,1-t/1700);g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.beginPath();g.roundRect?g.roundRect(-p.w/2,-p.h/2,p.w,p.h,2):g.rect(-p.w/2,-p.h/2,p.w,p.h);g.fill();g.restore()});
    if(t<1700)requestAnimationFrame(fr);else cv.remove()})(t0)}
function saveDone(){store.set("done",[...done]);paintProgress()}
const Engine_markDone=(id)=>{if(!done.has(id)){done.add(id);learned(id);saveDone()}};
function paintProgress(){
  const n=counted.filter(c=>done.has(c.id)).length, t=counted.length, pct=t?Math.round(n/t*100):0;
  $$(".pbar i").forEach(i=>i.style.width=pct+"%");
  $$(".pcount").forEach(e=>e.textContent=`${n} of ${t} stations learned · ${pct}%`);
  $$(".ring .fg").forEach(r=>r.setAttribute("stroke-dashoffset",(87.96*(1-n/(t||1))).toFixed(2)));
  $$("[data-ch]").forEach(a=>a.classList.toggle("done",done.has(a.dataset.ch)));
  $$("[data-done]").forEach(b=>{const on=done.has(b.dataset.done);b.setAttribute("aria-pressed",String(on));b.querySelector("span").textContent=on?"Learned":"Mark chapter as learned"});
  parts.forEach(p=>{const cs=chapters.filter(c=>c._part===p&&c.counts);if(!cs.length)return;const k=cs.filter(c=>done.has(c.id)).length;$$(`[data-pp="${p.id}"]`).forEach(e=>e.textContent=`${k}/${cs.length}`)});
  paintOverview();
  document.dispatchEvent(new CustomEvent("progress",{detail:{done}}));
}

/* ---------- scroll spy ---------- */
const crumbP=$(".crumb .p",top), crumbC=$(".crumb .c",top), crumbDot=$(".crumb .dot",top), pbWhere=$(".pb-where b",pbar);
let current=null;
function setCurrent(el){
  if(current===el)return;current=el;
  const p=el?.closest(".part");
  crumbDot.style.setProperty("--crumb",p?`var(--p${p.dataset.part}-f)`:"var(--tint)");
  root.dataset.zone=p?p.dataset.part:"0";
  if(el&&el.classList.contains("chapter")){crumbP.textContent=(p?p.dataset.title:"")+"  ›  ";crumbC.textContent=(el.dataset.n?el.dataset.n+" ":"")+el.dataset.title;pbWhere.textContent=(el.dataset.n?el.dataset.n+" · ":"")+el.dataset.title}
  else if(p){crumbP.textContent="";crumbC.textContent=p.dataset.kicker+" · "+p.dataset.title;pbWhere.textContent=p.dataset.title}
  else{crumbP.textContent="";crumbC.textContent=G.title;pbWhere.textContent=G.title}
  $$(".nav a").forEach(a=>a.classList.toggle("on",el&&a.dataset.ch===el.id));
  const on=$(".side .nav a.on");if(on){const n=$(".side .nav");const r=on.getBoundingClientRect(),nr=n.getBoundingClientRect();if(r.top<nr.top+40||r.bottom>nr.bottom-40)n.scrollTop+=r.top-nr.top-nr.height/3}
}
const spyTargets=[...$$(".part-open"),...chapters,...$$(".hero")];
const io=new IntersectionObserver(es=>{
  // pick the target closest to the top band
  let best=null,bt=Infinity;
  spyTargets.forEach(t=>{const r=t.getBoundingClientRect();if(r.top<window.innerHeight*.35&&r.bottom>90){const d=window.innerHeight*.35-r.top;if(d<bt){bt=d;best=t}}});
  if(best)setCurrent(best.classList.contains("part-open")?best.closest(".part"):best.classList.contains("hero")?null:best);
},{rootMargin:"0px",threshold:[0,.1,.5,1]});
spyTargets.forEach(t=>io.observe(t));
let spyRaf=0;window.addEventListener("scroll",()=>{if(spyRaf||root.classList.contains("mode-ex"))return;spyRaf=requestAnimationFrame(()=>{spyRaf=0;let best=null,bt=Infinity;spyTargets.forEach(t=>{const r=t.getBoundingClientRect();if(r.top<window.innerHeight*.35&&r.bottom>90){const d=window.innerHeight*.35-r.top;if(d<bt){bt=d;best=t}}});setCurrent(best?(best.classList.contains("part-open")?best.closest(".part"):best.classList.contains("hero")?null:best):null)})},{passive:true});

/* ---------- visibility for animation work ---------- */
const visible=new WeakMap();
const vio=new IntersectionObserver(es=>es.forEach(e=>visible.set(e.target,e.isIntersecting)),{rootMargin:"120px"});
function watch(el){vio.observe(el);visible.set(el,true)}

/* ---------- flowing dots along SVG paths ---------- */
const flows=[];
function flow(path,o={}){
  const svg=path.ownerSVGElement;watch(svg);
  const g=document.createElementNS("http://www.w3.org/2000/svg","g");
  (o.parent||path.parentNode).appendChild(g);
  const n=o.n||3, dots=[];
  for(let i=0;i<n;i++){let d;
    if(o.label){d=document.createElementNS("http://www.w3.org/2000/svg","g");d.innerHTML=`<circle r="${o.r||9}" class="${o.cls||"f-car"}"/><text text-anchor="middle" dy="3.5" class="ts tb" style="fill:${o.ink||"#fff"}">${o.label}</text>`}
    else{d=document.createElementNS("http://www.w3.org/2000/svg","circle");d.setAttribute("r",o.r||4.5);d.setAttribute("class",o.cls||"f-car")}
    g.appendChild(d);dots.push(d)}
  const f={path,g,dots,len:path.getTotalLength(),dur:o.dur||3500,off:Math.random(),active:o.active!==false,svg,once:o.once,t0:null,
    set(a){this.active=a;this.g.style.display=a?"":"none"}};
  f.set(f.active);place(f,0);flows.push(f);return f;
}
function place(f,t){const n=f.dots.length;f.dots.forEach((d,i)=>{let u=((t/f.dur)+f.off+i/n)%1;const p=f.path.getPointAtLength(u*f.len);
  if(d.tagName==="g")d.setAttribute("transform",`translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);else{d.setAttribute("cx",p.x.toFixed(1));d.setAttribute("cy",p.y.toFixed(1))}
  d.style.opacity=(u<.06?u/.06:u>.94?(1-u)/.06:1).toFixed(2)})}
let clock=0,last=performance.now();
function tick(now){const dt=Math.min(64,now-last);last=now;if(motionOn())clock+=dt;
  for(const f of flows){if(!f.active||!motionOn()||visible.get(f.svg)===false)continue;place(f,clock)}
  for(const fn of tickers)if(motionOn())fn(clock,dt);
  requestAnimationFrame(tick)}
const tickers=[];
requestAnimationFrame(tick);

/* ---------- step player: Back · Play · Next, plus page dots that fill while playing ---------- */
const players=[];
function stepper(viz,steps,render,o={}){
  const ms=o.ms||3800;
  const cap=h("div",{class:"viz-cap","aria-live":"polite"});
  const bar=h("div",{class:"player",role:"group","aria-label":"Step player"});
  bar.style.setProperty("--dur",ms+"ms");
  bar.innerHTML=`<div class="pl-l"><button class="pbtn txt" type="button" data-a="reset">${ic("reset")}<span>Start over</span></button></div>
   <div class="pl-mid"><button class="pbtn" type="button" data-a="back" aria-label="Previous step">${ic("back")}</button>
   <button class="pbtn play" type="button" data-a="play" aria-label="Play all steps">${ic("play")}</button>
   <button class="pbtn" type="button" data-a="next" aria-label="Next step">${ic("next")}</button></div>
   <div class="pl-r"><div class="pdots" role="group" aria-label="Steps">${steps.map((s,i)=>`<button type="button" aria-label="Step ${i+1}: ${s.t.replace(/<[^>]+>/g,"")}" data-i="${i}"><i></i></button>`).join("")}</div><span class="pcount2"></span></div>`;
  const stage=$(".viz-stage",viz);
  const anchor=$(".swipe",viz)||stage;anchor.after(cap);cap.after(bar);
  const prog=h("div",{class:"vprog",role:"group","aria-label":"Lesson progress"});prog.style.setProperty("--dur",ms+"ms");
  prog.innerHTML=steps.map((s,k)=>`<button type="button" data-i="${k}" aria-label="Go to step ${k+1}: ${s.t.replace(/<[^>]+>/g,"")}"><i></i></button>`).join("");
  const firstCtl=$(".ctl",viz);(firstCtl&&firstCtl.compareDocumentPosition(stage)&Node.DOCUMENT_POSITION_FOLLOWING?firstCtl:stage).before(prog);
  prog.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;play(false);show(+b.dataset.i)});
  const free=$$(".ctl",viz).find(c=>c.compareDocumentPosition(bar)&Node.DOCUMENT_POSITION_PRECEDING);
  if(free&&!free.dataset.h)free.dataset.h=o.freeLabel||"Or try it yourself";
  let i=0,timer=null;
  const btnPlay=$('[data-a="play"]',bar);
  function refill(){[$('.pdots button[aria-current="true"]',bar),$(".vprog button.now",viz)].forEach(cur=>{if(!cur)return;const old=$("i",cur);const n=document.createElement("i");old.replaceWith(n)})}
  function show(k,fromPlay){const prev=i;i=Math.max(0,Math.min(steps.length-1,k));
    const s=steps[i];cap.innerHTML=`<div class="st">Step ${i+1} of ${steps.length}</div><h4>${s.t.replace(/^\d+\s·\s/,"")}</h4><p>${s.d}</p>`;
    $$(".pdots button",bar).forEach((b,j)=>b.setAttribute("aria-current",String(j===i)));
    $$(".vprog button",viz).forEach((b,j)=>{b.classList.toggle("past",j<i);b.classList.toggle("now",j===i);b.setAttribute("aria-current",String(j===i))});
    $(".pcount2",bar).textContent=`${i+1}/${steps.length}`;
    $('[data-a="back"]',bar).disabled=i===0;$('[data-a="next"]',bar).disabled=i===steps.length-1;
    refill();render(i,prev,!!fromPlay);viz.dispatchEvent(new Event("visualstep",{bubbles:true}));}
  function play(on){clearInterval(timer);timer=null;bar.classList.toggle("playing",on);prog.classList.toggle("playing",on);btnPlay.classList.toggle("on",on);
    btnPlay.querySelector("use").setAttribute("href",on?"#i-pause":"#i-play");btnPlay.setAttribute("aria-label",on?"Pause":"Play all steps");
    if(on){players.forEach(p=>p!==api&&p.stop());if(i===steps.length-1)show(0,true);else refill();timer=setInterval(()=>{if(i>=steps.length-1){play(false);return}show(i+1,true)},ms)}}
  bar.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.i!=null){play(false);show(+b.dataset.i)}
    const a=b.dataset.a;if(a==="back"){play(false);show(i-1)}if(a==="next"){play(false);show(i+1)}if(a==="play")play(!timer);if(a==="reset"){play(false);show(0)}});
  const api={show,stop:()=>play(false),get i(){return i},bar,cap};players.push(api);
  show(0);
  return api;
}

/* ---------- iOS sliders: paint the filled part of the track ---------- */
function rangeFill(el){const mn=+el.min||0,mx=+el.max||100;el.style.setProperty("--fill",((+el.value-mn)/(mx-mn)*100).toFixed(1)+"%")}
document.addEventListener("input",e=>{if(e.target.matches&&e.target.matches('input[type=range]'))rangeFill(e.target)});

/* ---------- segmented controls inside visuals ---------- */
function segSet(el,v){$$("button",el).forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.v===String(v))))}
function segc(el,onchange){el.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;$$("button",el).forEach(x=>x.setAttribute("aria-pressed",String(x===b)));onchange(b.dataset.v,b)});
  const cur=$('button[aria-pressed="true"]',el)||$("button",el);cur.setAttribute("aria-pressed","true");return cur.dataset.v}

/* ---------- quizzes ---------- */
const QUIZ=window.QUIZ||[];
let qstate=store.get("quiz",{});
const L="ABCDEFGH";
function renderQuiz(box){
  box._ch=box._ch||(box.dataset.for&&document.getElementById(box.dataset.for))||box.closest(".chapter");
  const set=box.dataset.set;const items=QUIZ.filter(q=>q.sets.includes(set));
  const K=q=>set+'|'+q.id, st=q=>qstate[K(q)];
  box.innerHTML="";
  if(!items.length){box.innerHTML=`<p class="small muted">No questions in the set "${set}" yet. Add them to quiz.json.</p>`;return}
  /* one question at a time: a step row, the current card, then the score */
  const steps=h("div",{class:"q-steps",role:"tablist","aria-label":"Questions"});box.appendChild(steps);
  const wrap=h("div",{class:"q-stack"});box.appendChild(wrap);
  const cards=items.map((q,k)=>{const c=qCard(q,k,items.length,set);c.hidden=true;wrap.appendChild(c);return c});
  const sc=h("div",{class:"score"});box.appendChild(sc);
  const firstOpen=()=>{const i=items.findIndex(q=>!(st(q)&&st(q).done));return i<0?items.length-1:i};
  let cur=firstOpen();
  function show(i,focus){cur=i;cards.forEach((c,j)=>{c.hidden=j!==i;c.classList.toggle("q-in",j===i&&!!focus)});paintSteps();
    if(focus){const r=cards[i].getBoundingClientRect();if(r.top<70)box.scrollIntoView({block:"start",behavior:motionOn()?"smooth":"auto"});$(".q-text",cards[i])?.focus({preventScroll:true})}}
  function paintSteps(){const open=firstOpen();
    steps.innerHTML=items.map((q,j)=>{const s=st(q);const cls=(s&&s.done?(s.ok?"ok":"no"):"")+(j===cur?" now":"");
      return `<button type="button" role="tab" class="${cls}" aria-selected="${j===cur}" aria-label="Question ${j+1}${s&&s.done?(s.ok?", correct":", wrong"):""}" ${j>open?"disabled":""}><i></i></button>`}).join("")+`<span class="q-count">${cur+1} / ${items.length}</span>`;
    $$("button",steps).forEach((b,j)=>b.onclick=()=>show(j,true))}
  function addNext(){cards.forEach((c,j)=>{const s=st(items[j]);if(!s||!s.done||$(".q-next",c))return;
    const last=j===items.length-1;const b=h("button",{class:"vbtn pri q-next",type:"button"},last?`<span>See your score</span>`:`<span>Next question</span>${ic("next")}`);
    b.onclick=()=>{if(last){sc.scrollIntoView({block:"center",behavior:motionOn()?"smooth":"auto"});sc.classList.remove("pop");void sc.offsetWidth;sc.classList.add("pop")}else show(j+1,true)};c.appendChild(b)})}
  function paint(){const ans=items.filter(q=>st(q)&&st(q).done);const right=ans.filter(q=>st(q).ok).length;
    sc.innerHTML=`<b>${right}/${items.length}</b><span class="sbar" role="progressbar" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${ans.length}" aria-label="Questions answered"><i style="width:${Math.round(ans.length/items.length*100)}%"></i></span><button class="vbtn" type="button">${ic("reset")}<span>Try again</span></button>`;
    if(ans.length===items.length&&right===items.length&&!box.dataset.cheered){box.dataset.cheered="1";celebrate(sc)}
    $("button",sc).onclick=()=>{items.forEach(q=>delete qstate[K(q)]);store.set("quiz",qstate);delete box.dataset.cheered;renderQuiz(box)};
    const ch=box._ch||(box._ch=box.closest(".chapter"));if(ch&&ch.counts&&ans.length===items.length&&right>=Math.ceil(items.length*.6))Engine_markDone(ch.id);
    addNext();paintSteps();box.dispatchEvent(new CustomEvent("quizpaint",{bubbles:true,detail:{right,ans:ans.length,total:items.length}}))}
  box.addEventListener("answered",paint);box.dataset.cheered=items.every(q=>st(q)?.ok)?"1":"";paint();show(cur,false);
}
function qCard(q,k,n,set){
  const multi=!!q.multi;const c=h("div",{class:"q"+(multi?" multi":"")});
  c.innerHTML=`<div class="q-top"><span>Question ${k+1} of ${n}</span>${q.src?`<span class="src">${q.src}</span>`:""}</div><div class="q-text" tabindex="-1">${q.q}</div>${multi?`<div class="q-hint">Select all that are correct, then check.</div>`:""}<div class="opts"></div><div class="q-foot"></div><div class="q-exp" hidden></div>`;
  const opts=$(".opts",c),foot=$(".q-foot",c),exp=$(".q-exp",c);
  const sel=new Set();
  q.o.forEach((o,i)=>{const b=h("button",{class:"opt",type:"button"},`<span class="mk">${L[i]}</span><span>${o[0]}<span class="why" hidden>${o[2]||""}</span></span><span class="tk"></span>`);
    b.addEventListener("click",()=>{if(c.dataset.locked)return;if(multi){sel.has(i)?sel.delete(i):sel.add(i);b.classList.toggle("sel")}else{sel.clear();sel.add(i);grade()}});opts.appendChild(b)});
  if(multi){const chk=h("button",{class:"vbtn pri",type:"button"},"Check answer");chk.onclick=()=>{if(sel.size)grade()};foot.appendChild(chk)}
  function grade(save=true){
    c.dataset.locked="1";const bs=$$(".opt",opts);let ok=true;
    q.o.forEach((o,i)=>{const b=bs[i];b.disabled=true;const chosen=sel.has(i);
      if(o[1]&&chosen)b.classList.add("right");else if(o[1]&&!chosen){b.classList.add(multi?"right":"right");if(multi)ok=false}
      else if(!o[1]&&chosen){b.classList.add("wrong");ok=false}
      if(o[2])$(".why",b).hidden=false;
      if(o[1]||chosen)$(".tk",b).innerHTML=ic(o[1]?"check":"x");
      b.classList.remove("sel")});
    if(!multi)ok=q.o[[...sel][0]][1];
    foot.innerHTML="";
    const right=q.o.filter(o=>o[1]).map(o=>o[0]).join(" · ");
    const praise=["Nice!","Correct!","Exactly.","You got it."][k%4];
    exp.hidden=false;exp.className="q-fb "+(ok?"ok":"no");
    exp.innerHTML=`<span class="fi">${ic(ok?"check":"x")}</span><span class="fh">${ok?praise:"Not quite"}</span><span class="fx">${ok?(q.e||""):`Answer: <b>${right}</b>. ${q.e||""}${q.see?` <a href="#${q.see}">Review the lesson</a>`:""}`}</span>`;
    if(save){qstate[set+'|'+q.id]={done:1,ok,sel:[...sel]};store.set("quiz",qstate);c.closest(".quiz")?.dispatchEvent(new Event("answered"))}
  }
  const st=qstate[set+'|'+q.id];if(st&&st.done){st.sel.forEach(i=>sel.add(i));grade(false)}
  return c;
}

/* ---------- flashcards ---------- */
function flashcards(box){
  let cards=(window.FLASH||[]).slice();let i=0;
  if(!cards.length){box.innerHTML=`<p class="small muted">No flashcards yet. Add them to flash.json.</p>`;return}
  box.innerHTML=`<div class="fc"><div class="fc-card" tabindex="0" role="button" aria-label="Flip card"><div class="fc-face fc-front"><div class="k"></div><div class="v"></div></div><div class="fc-face fc-back"><div class="k">Answer</div><div class="v"></div></div></div></div>
   <div class="fc-bar"><button class="vbtn" type="button" data-a="p" aria-label="Previous card">${ic("back")}</button><button class="vbtn pri" type="button" data-a="f">Flip</button><button class="vbtn" type="button" data-a="n" aria-label="Next card">${ic("next")}</button><span class="caption num" data-c></span><span class="spacer"></span><button class="vbtn" type="button" data-a="s">${ic("shuffle")}<span>Shuffle</span></button></div>`;
  const card=$(".fc-card",box);
  function show(){const c=cards[i];card.classList.remove("flip");$(".fc-front .k",box).textContent=c.k||"Question";$(".fc-front .v",box).innerHTML=c.f;$(".fc-back .v",box).innerHTML=c.b;$("[data-c]",box).textContent=`${i+1} / ${cards.length}`}
  card.addEventListener("click",()=>card.classList.toggle("flip"));
  card.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();card.classList.toggle("flip")}});
  $(".fc-bar",box).addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;if(a==="f")card.classList.toggle("flip");if(a==="n"){i=(i+1)%cards.length;show()}if(a==="p"){i=(i-1+cards.length)%cards.length;show()}if(a==="s"){cards.sort(()=>Math.random()-.5);i=0;show()}});
  show();
}

/* ---------- sort game (two bins) ---------- */
function sorter(box,items,bins){
  let i=0,score=0;const log=[];
  box.innerHTML=`<div class="q-top"><span>Sort it</span><span class="src num" data-c></span></div><div class="sort-item" aria-live="polite"></div><div class="sort-bins">${bins.map((b,k)=>`<button class="vbtn" type="button" data-k="${k}">${b}</button>`).join("")}</div><div class="sort-log"></div>`;
  function show(){if(i>=items.length){$(".sort-item",box).innerHTML=`Done: <b>${score}/${items.length}</b> correct. <button class="vbtn" type="button" data-r>${ic("reset")}<span>Sort again</span></button>`;$(".sort-bins",box).hidden=true;$("[data-r]",box).onclick=()=>{i=0;score=0;log.length=0;$(".sort-bins",box).hidden=false;$(".sort-log",box).innerHTML="";show()};return}
    $(".sort-item",box).innerHTML=items[i][0];$("[data-c]",box).textContent=`${i+1} of ${items.length}`}
  $(".sort-bins",box).addEventListener("click",e=>{const b=e.target.closest("button");if(!b||i>=items.length)return;const k=+b.dataset.k,it=items[i],ok=k===it[1];if(ok)score++;
    $(".sort-log",box).insertAdjacentHTML("afterbegin",`<div class="${ok?"ok":"no"}">${ic(ok?"check":"x")}<span><b>${it[0]}</b> → ${bins[it[1]]}. ${it[2]||""}</span></div>`);i++;show()});
  show();
}


/* ---------- font loader: drop font files anywhere (or pick them) to restyle the guide ----------
   Fonts stay on this device only (IndexedDB); nothing is uploaded. */
const FONT_FAMILY="GuideUserFont";
const baseFont=getComputedStyle(root).getPropertyValue("--font").trim(), baseFontD=getComputedStyle(root).getPropertyValue("--font-d").trim();
const isFontFile=f=>/\.(otf|ttf|woff2?|OTF|TTF|WOFF2?)$/.test(f.name)||/font/.test(f.type);
function sniff(buf,name){ // weight/italic/family from the font's own tables, filename as fallback
  let weight=400,italic=/italic|oblique/i.test(name),family=name.replace(/\.[^.]+$/,"");
  const w=[["thin|hairline",100],["ultra ?light|extra ?light",200],["light",300],["regular|book|normal|roman",400],["medium",500],["semi ?bold|demi ?bold",600],["extra ?bold|ultra ?bold",800],["heavy|black",900],["bold",700]];
  const nm=name.replace(/[-_]/g," ");for(const [re,v] of w){if(new RegExp(re,"i").test(nm)){weight=v;break}}
  try{const dv=new DataView(buf);const tag=dv.getUint32(0);
    if(tag===0x00010000||tag===0x4F54544F||tag===0x74727565){const nt=dv.getUint16(4);const tabs={};
      for(let k=0;k<nt;k++){const o=12+k*16;const t=String.fromCharCode(dv.getUint8(o),dv.getUint8(o+1),dv.getUint8(o+2),dv.getUint8(o+3));tabs[t]=dv.getUint32(o+8)}
      if(tabs["OS/2"]!=null){weight=dv.getUint16(tabs["OS/2"]+4)||weight;const fs=dv.getUint16(tabs["OS/2"]+62);italic=italic||!!(fs&1)||!!(fs&512)}
      if(tabs.post!=null&&dv.getInt32(tabs.post+4)!==0)italic=true;
      if(tabs.head!=null&&(dv.getUint16(tabs.head+44)&2))italic=true;
      if(tabs.name!=null){const b=tabs.name,cnt=dv.getUint16(b+2),so=b+dv.getUint16(b+4);let best=null;
        for(let k=0;k<cnt;k++){const r=b+6+k*12,pid=dv.getUint16(r),nid=dv.getUint16(r+6),len=dv.getUint16(r+8),off=dv.getUint16(r+10);
          if((nid===16||nid===1)&&(pid===3||pid===0)){let str="";for(let j=0;j<len;j+=2)str+=String.fromCharCode(dv.getUint16(so+off+j));if(!best||nid===16)best=str}}
        if(best)family=best}}}catch(e){}
  return {weight:Math.min(950,Math.max(1,weight)),italic,family};
}
const fontDB={db:null,
  open(){return new Promise(res=>{try{const r=indexedDB.open("guide-fonts",1);r.onupgradeneeded=()=>r.result.createObjectStore("faces",{autoIncrement:true});r.onsuccess=()=>{this.db=r.result;res(this.db)};r.onerror=()=>res(null)}catch(e){res(null)}})},
  async all(){const db=this.db||await this.open();if(!db)return[];return new Promise(res=>{try{const q=db.transaction("faces").objectStore("faces").getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([])}catch(e){res([])}})},
  async add(rec){const db=this.db||await this.open();if(!db)return;try{db.transaction("faces","readwrite").objectStore("faces").add(rec)}catch(e){}},
  async clear(){const db=this.db||await this.open();if(!db)return;try{db.transaction("faces","readwrite").objectStore("faces").clear()}catch(e){}}};
let userFaces=[];
async function addFace(buf,meta,save){
  try{const ff=new FontFace(FONT_FAMILY,buf,{weight:String(meta.weight),style:meta.italic?"italic":"normal"});await ff.load();document.fonts.add(ff);userFaces.push({ff,meta});
    if(save)await fontDB.add({buf,meta});applyUserFont();return true}catch(e){return false}}
function applyUserFont(){const on=userFaces.length>0;
  root.classList.toggle("user-font",on);root.style.setProperty("--font",on?`"${FONT_FAMILY}",${baseFont}`:baseFont);root.style.setProperty("--font-d",on?`"${FONT_FAMILY}",${baseFontD}`:baseFontD);paintFontPop()}
async function loadFiles(files){const list=[...files].filter(isFontFile);if(!list.length){showToast(`<span class="ti" style="background:linear-gradient(160deg,#ff7a70,#e0281c)">${ic("x")}</span><span>That isn't a font file (.otf, .ttf, .woff, .woff2)</span>`);return}
  let ok=0;for(const f of list){const buf=await f.arrayBuffer();const meta=sniff(buf,f.name);if(await addFace(buf,meta,true))ok++}
  const fam=userFaces[userFaces.length-1]?.meta.family||"Font";
  showToast(`<span class="ti">${ic("check")}</span><span>${fam}: ${ok} style${ok===1?"":"s"} loaded</span>`)}
const fontPop=h("div",{class:"fontpop glass",role:"dialog","aria-label":"Fonts"});
fontPop.innerHTML=`<h3>Fonts</h3><p>Drop font files here or anywhere on the page. They stay on this device.</p>
  <label class="drop" for="font-input"><b>Drop .otf, .ttf or .woff files</b><span>or click to choose. Add every weight you have.</span></label>
  <input id="font-input" type="file" accept=".otf,.ttf,.woff,.woff2,font/*" multiple hidden>
  <div class="fontnow"></div>`;
document.body.appendChild(fontPop);
function paintFontPop(){const box=$(".fontnow",fontPop);if(!userFaces.length){box.innerHTML=`<div><b>System font</b><span>SF Pro on Apple devices, Inter elsewhere</span></div>`;return}
  const fam=[...new Set(userFaces.map(f=>f.meta.family))].join(", ");const wts=[...new Set(userFaces.filter(f=>!f.meta.italic).map(f=>f.meta.weight))].sort((a,b)=>a-b);const it=userFaces.filter(f=>f.meta.italic).length;
  box.innerHTML=`<div><b>${fam}</b><span>${wts.length} upright weight${wts.length===1?"":"s"} (${wts.join(", ")})${it?` · ${it} italic`:""}</span></div><button class="vbtn" type="button" data-font-reset>Reset</button>`;
  $("[data-font-reset]",box).onclick=async()=>{userFaces.forEach(f=>document.fonts.delete(f.ff));userFaces=[];await fontDB.clear();applyUserFont();showToast(`<span class="ti">${ic("check")}</span><span>Back to the system font</span>`)}}
$(".tb-aa",top).addEventListener("click",e=>{e.stopPropagation();fontPop.classList.toggle("open")});
document.addEventListener("click",e=>{if(fontPop.classList.contains("open")&&!fontPop.contains(e.target))fontPop.classList.remove("open")});
document.addEventListener("keydown",e=>{if(e.key==="Escape")fontPop.classList.remove("open")});
$("#font-input",fontPop).addEventListener("change",e=>{loadFiles(e.target.files);e.target.value=""});
const dz=$(".drop",fontPop);["dragenter","dragover"].forEach(t=>dz.addEventListener(t,e=>{e.preventDefault();dz.classList.add("hot")}));["dragleave","drop"].forEach(t=>dz.addEventListener(t,()=>dz.classList.remove("hot")));
const over=h("div",{class:"dropover","aria-hidden":"true"},`<div class="glass">Drop to use this font<span>Applies to the whole guide</span></div>`);document.body.appendChild(over);
let dragDepth=0;const hasFiles=e=>[...(e.dataTransfer?.types||[])].includes("Files");
window.addEventListener("dragenter",e=>{if(!hasFiles(e))return;dragDepth++;over.classList.add("on")});
window.addEventListener("dragover",e=>{if(hasFiles(e))e.preventDefault()});
window.addEventListener("dragleave",e=>{if(!hasFiles(e))return;dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)over.classList.remove("on")});
window.addEventListener("drop",e=>{if(!hasFiles(e))return;e.preventDefault();dragDepth=0;over.classList.remove("on");loadFiles(e.dataTransfer.files)});
(async()=>{const recs=await fontDB.all();for(const r of recs)await addFace(r.buf,r.meta,false);paintFontPop()})();

/* ---------- swipe hint for wide diagrams on small screens ---------- */
function swipeHints(){$$(".viz").forEach(v=>{const st=$(".viz-stage",v);if(!st)return;if(!$(".swipe",v)){st.insertAdjacentHTML("afterend",`<div class="swipe">← Swipe to see the whole diagram →</div>`)}const sc=st.scrollWidth>st.clientWidth+4;v.classList.toggle("scrolls",sc);if(sc&&!st.dataset.centred){st.dataset.centred="1";st.scrollLeft=(st.scrollWidth-st.clientWidth)/2}})}
window.addEventListener("resize",()=>requestAnimationFrame(swipeHints));
/* ---------- compact reading on small screens ----------
   Dense blocks get a title row you can open, so a phone shows a short list
   of titles instead of a wall of text. CSS only folds them under 701px. */
function foldable(el,head){el.classList.add("fold");head.classList.add("fold-h");head.setAttribute("role","button");head.tabIndex=0;head.setAttribute("aria-expanded","false");
  const t=()=>{const o=el.classList.toggle("open");head.setAttribute("aria-expanded",String(o))};
  head.addEventListener("click",e=>{if(!phoneMQ.matches||e.target.closest("a"))return;t()});
  head.addEventListener("keydown",e=>{if(phoneMQ.matches&&(e.key==="Enter"||e.key===" ")){e.preventDefault();t()}})}
function compact(){
  $$(".steps>li").forEach(li=>{const b=li.firstElementChild;if(!b||b.tagName!=="B"||li.querySelector(".sd"))return;
    const sd=h("span",{class:"sd"});while(b.nextSibling)sd.appendChild(b.nextSibling);li.appendChild(sd);foldable(li,b)});
  $$(".grid2>.card,.grid3>.card").forEach(c=>{const h4=c.firstElementChild;if(!h4||h4.tagName!=="H4"||c.querySelector(".cbody"))return;
    const bd=h("div",{class:"cbody"});while(h4.nextSibling)bd.appendChild(h4.nextSibling);c.appendChild(bd);foldable(c,h4)});
  $$(".terms>div").forEach(d=>{const b=d.querySelector("b");if(!b||!d.querySelector(".d"))return;
    const hd=h("span",{class:"th"});while(d.firstChild&&!(d.firstChild.classList&&d.firstChild.classList.contains("d")))hd.appendChild(d.firstChild);d.prepend(hd);foldable(d,hd)});
  $$(".callout>div").forEach(d=>{if(d.textContent.length<300||d.closest(".cp-body"))return;const c=d.parentElement;c.classList.add("long");
    const m=h("button",{class:"more-btn",type:"button","aria-expanded":"false"},"Read more");m.onclick=()=>{const o=c.classList.toggle("open");m.textContent=o?"Show less":"Read more";m.setAttribute("aria-expanded",String(o))};c.appendChild(m)});
  $$("table.tbl").forEach(t=>{const hs=[...t.querySelectorAll("thead th")].map(th=>{const c=th.cloneNode(true);c.querySelectorAll(".id").forEach(x=>x.remove());return c.textContent.trim()});if(!hs.length)return;
    /* comparison table: an empty corner cell, then the things being compared.
       Each compared thing gets its own colour; it stays a real table on phones. */
    if(!hs[0]&&hs.length>=3){t.classList.add("cmp");if(hs.length>=5)t.classList.add("cmp-wide");t.style.setProperty("--n",hs.length-1);t.closest(".tbl-wrap")?.classList.add("cmp-wrap");
      const paint=row=>[...row.children].forEach((c,i)=>{if(i)c.style.setProperty("--cc",`var(--c${i})`)});
      $$("thead tr,tbody tr",t).forEach(paint);return}
    t.classList.add("stackable");$$("tbody tr",t).forEach(tr=>[...tr.children].forEach((td,i)=>{if(hs[i])td.setAttribute("data-label",hs[i])}))});
}
/* ---------- checkpoints: one row per station, traps + quiz inside ---------- */
function paintCp(d,e){const m=$(".cp-m",d);if(!m)return;const tr=+m.dataset.traps||0;const q=$(".quiz",d);
  const det=e&&e.detail;let s=tr?`${tr} trap${tr>1?"s":""}`:"";
  if(det){s+=(s?" · ":"")+(det.ans?`${det.right}/${det.total} right`:`${det.total} questions`);d.classList.toggle("done",det.ans===det.total);d.classList.toggle("perfect",det.ans===det.total&&det.right===det.total)}
  m.textContent=s}
$$("details.cp").forEach(d=>{d.addEventListener("quizpaint",e=>paintCp(d,e));paintCp(d)});
/* ---------- phone fit: keep diagram labels inside the frame ---------- */
const phoneMQ=matchMedia("(max-width:700px)");
function fitSvgText(svg){
  const vb=svg.viewBox&&svg.viewBox.baseVal;if(!vb||!vb.width)return;
  if(!phoneMQ.matches){$$("text[data-fx]",svg).forEach(t=>{t.removeAttribute("dx");t.removeAttribute("data-fx")});return}
  const sc=svg.getScreenCTM();if(!sc)return;const inv=sc.inverse(),M=5;
  $$("text",svg).forEach(t=>{if(t.closest("defs,clipPath,mask"))return;let bb;try{bb=t.getBBox()}catch(e){return}if(!bb.width)return;
    const m=t.getScreenCTM();if(!m)return;const tm=inv.multiply(m);if(Math.abs(tm.b)>.01||Math.abs(tm.c)>.01||!tm.a)return;
    const x0=tm.a*bb.x+tm.e,x1=tm.a*(bb.x+bb.width)+tm.e;let sh=0;
    if(x1-x0>vb.width-2*M)return;
    if(x0<vb.x+M)sh=vb.x+M-x0;else if(x1>vb.x+vb.width-M)sh=vb.x+vb.width-M-x1;
    if(Math.abs(sh)>.4){const nd=(+(t.getAttribute("data-fx")||0))+sh/tm.a;t.setAttribute("dx",nd.toFixed(1));t.setAttribute("data-fx",nd.toFixed(1))}})}
function watchFit(svg){let busy=false;const mo=new MutationObserver(()=>{if(busy)return;busy=true;fitSvgText(svg);mo.takeRecords();busy=false});
  mo.observe(svg,{childList:true,subtree:true,characterData:true});fitSvgText(svg)}
/* kit visuals lay out their own text, so they are skipped (except Kit.diagram, which is hand-drawn) */
const fitSvgs=()=>$$(".viz-stage svg").filter(s=>!s.closest(".kit")||s.closest(".kit-diagram"));
const fitAll=()=>fitSvgs().forEach(fitSvgText);
function bootFit(){fitSvgs().forEach(watchFit)}
compact();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootFit);else setTimeout(bootFit,0);
phoneMQ.addEventListener?.("change",fitAll);window.addEventListener("orientationchange",()=>setTimeout(fitAll,300));
document.addEventListener("visualstep",e=>{const s=e.target.querySelector?.(".viz-stage svg");if(s&&(!s.closest(".kit")||s.closest(".kit-diagram"))){fitSvgText(s);setTimeout(()=>fitSvgText(s),700)}});

/* ---------- boot ---------- */
applyTheme(theme);applyMotion(motion);paintProgress();swipeHints();
$$("input[type=range]").forEach(rangeFill);
/* gentle settle-in for content blocks (always visible; only position eases) */
const rvo=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");rvo.unobserve(e.target)}}),{rootMargin:"0px 0px -6% 0px"});
$$(".card,.viz,.callout,.tbl-wrap,.terms,.steps,.part-open,.eq,.sorter,.drill,.ov-map,details.more").forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight)el.classList.add("in");el.classList.add("rv");rvo.observe(el)});
$$(".quiz[data-set]").forEach(renderQuiz);
/* sorters written in HTML: <div class="sorter" data-bins="A|B"><p data-bin="0" data-why="…">item</p>…</div> */
$$(".sorter[data-bins]").forEach(b=>{const items=$$("[data-bin]",b).map(p=>[p.innerHTML,+p.dataset.bin,p.dataset.why||""]);sorter(b,items,b.dataset.bins.split("|"))});
$$(".q").forEach(q=>q.classList.add("rv","in"));
$$(".flash").forEach(flashcards);
/* ---------- v1.3 drills, written in HTML (docs/06-quizzes-and-review.md § Drills) ----------
   <div class="drill order">   <p>first</p><p>second</p>…           drag or tap-swap into order
   <div class="drill cloze" data-extra="pengecoh|…">  text with <span class="gap" data-alt="…" data-why="…">answer</span>
   <div class="drill spot">    text with <s data-fix="right form" data-why="rule">wrong</s>   tap the mistakes
   <div class="drill match">   <p><b>term</b> meaning</p>…           pair terms with meanings
   Every drill: a header, one short hint, Check / Show answers / Reset where they fit, a live result line. */
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const shufNew=(a,key)=>{let s=a;for(let n=0;n<25;n++){s=shuf(a);if(a.length<2||s.some((x,i)=>key(x)!==key(a[i])))break}return s};
const norm=s=>String(s).replace(/\s+/g," ").trim().toLowerCase();
function drillShell(box,label,hint){box.innerHTML=`<div class="q-top"><span>${label}</span><span class="src num" data-c></span></div>${hint?`<p class="dr-hint">${hint}</p>`:""}`;const body=h("div",{class:"dr-body"});box.appendChild(body);return body}
function drillBar(box,btns){const f=h("div",{class:"dr-bar"});btns.forEach(([t,icon,fn])=>{const b=h("button",{class:"vbtn",type:"button"},`${ic(icon)}<span>${t}</span>`);b.onclick=fn;f.appendChild(b)});box.appendChild(f);return f}
function drillMsg(box){const m=h("div",{class:"dr-msg","aria-live":"polite"});box.appendChild(m);return m}
function pulse(el,c){el.classList.remove(c);void el.offsetWidth;el.classList.add(c);setTimeout(()=>el.classList.remove(c),650)}
/* pointer drag with a floating copy; touch needs touch-action:none on the handle (CSS) */
function dragger(el,{start,move,end}){
  el.addEventListener("pointerdown",e=>{if(e.button>0)return;const r=el.getBoundingClientRect(),x0=e.clientX,y0=e.clientY;let g=null,moved=false;
    const under=ev=>{if(g)g.style.visibility="hidden";const u=document.elementFromPoint(ev.clientX,ev.clientY);if(g)g.style.visibility="";return u};
    const mv=ev=>{const dx=ev.clientX-x0,dy=ev.clientY-y0;if(!moved&&Math.hypot(dx,dy)<6)return;
      if(!moved){moved=true;g=el.cloneNode(true);g.classList.add("dr-ghost");Object.assign(g.style,{width:r.width+"px",left:r.left+"px",top:r.top+"px"});document.body.appendChild(g);el.classList.add("dr-lift");root.classList.add("dr-dragging");getSelection&&getSelection().removeAllRanges();start&&start()}
      ev.preventDefault();g.style.transform=`translate(${dx}px,${dy}px)`;
      if(!root.classList.contains("mode-ex")){const sy=ev.clientY<70?-14:ev.clientY>innerHeight-70?14:0;if(sy)scrollBy(0,sy)}
      move&&move(under(ev),ev)};
    const up=ev=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);removeEventListener("pointercancel",up);if(!moved)return;
      const u=ev.type==="pointercancel"?null:under(ev);g.remove();el.classList.remove("dr-lift");root.classList.remove("dr-dragging");el.dispatchEvent(new CustomEvent("drillchange",{bubbles:true}));el._drag=true;setTimeout(()=>{el._drag=false},60);end&&end(u,ev)};
    addEventListener("pointermove",mv,{passive:false});addEventListener("pointerup",up);addEventListener("pointercancel",up)});
}

function drillOrder(box){
  const items=$$(":scope>p,:scope>li",box).map((p,i)=>({html:p.innerHTML,i})),why=box.dataset.why||"";
  const body=drillShell(box,"Put in order","Drag the dotted handle, or tap two rows to swap them."),list=h("ol",{class:"od-list"});body.appendChild(list);
  let sel=null;const msg=drillMsg(box),cnt=$("[data-c]",box);
  const clear=()=>{$$(".od-row",list).forEach((r,k)=>{r.classList.remove("ok","no");$(".od-n",r).textContent=k+1});msg.textContent="";cnt.textContent=`${items.length} steps`};
  const pick=r=>{if(sel)sel.classList.remove("sel");sel=r;if(r)r.classList.add("sel")};
  function render(arr){list.innerHTML="";pick(null);arr.forEach(it=>{const li=h("li",{class:"od-row",tabindex:"0"},`<span class="od-n"></span><span class="od-t">${it.html}</span><span class="od-grip" title="Drag to move" aria-hidden="true"></span>`);li.dataset.i=it.i;list.appendChild(li);
      dragger($(".od-grip",li),{start(){pick(null);li.classList.add("od-drag")},move(u){const t=u&&u.closest(".od-row");if(!t||t===li||t.parentNode!==list)return;const rows=[...list.children];if(rows.indexOf(t)>rows.indexOf(li))t.after(li);else t.before(li)},end(){li.classList.remove("od-drag");clear()}});
      li.addEventListener("click",e=>{if(e.target.closest(".od-grip"))return;if(!sel){pick(li);return}if(sel===li){pick(null);return}
        const a=sel,ph=document.createComment("");a.replaceWith(ph);li.replaceWith(a);ph.replaceWith(li);pick(null);clear()});
      li.addEventListener("keydown",e=>{if(e.key==="ArrowUp"&&li.previousElementSibling){e.preventDefault();li.previousElementSibling.before(li);li.focus();clear()}else if(e.key==="ArrowDown"&&li.nextElementSibling){e.preventDefault();li.nextElementSibling.after(li);li.focus();clear()}})});clear()}
  drillBar(box,[["Check","check",()=>{let n=0;$$(".od-row",list).forEach((r,k)=>{const ok=+r.dataset.i===k;n+=ok;r.classList.toggle("ok",ok);r.classList.toggle("no",!ok)});pick(null);
      msg.innerHTML=n===items.length?`${ic("check")}<span><b>All ${n} in order.</b> ${why}</span>`:`${ic("x")}<span><b>${n} of ${items.length}</b> in the right place. Move the red rows and check again.</span>`;msg.className="dr-msg "+(n===items.length?"ok":"no")}],
    ["Show answer","bulb",()=>{render(items);$$(".od-row",list).forEach(r=>r.classList.add("ok"));msg.innerHTML=why?`${ic("info")}<span>${why}</span>`:"";msg.className="dr-msg"}],
    ["Shuffle","shuffle",()=>render(shufNew(items,x=>x.i))]]);
  render(shufNew(items,x=>x.i));
}

function drillCloze(box){
  const gaps=$$(".gap",box),extra=(box.dataset.extra||"").split("|").map(s=>s.trim()).filter(Boolean);
  const ans=gaps.map(g=>({w:g.textContent.trim(),alt:(g.dataset.alt||"").split("|").filter(Boolean),why:g.dataset.why||""}));
  gaps.forEach((g,k)=>{const b=h("button",{class:"cz-gap",type:"button","aria-label":`Blank ${k+1}`},`<span class="cz-k">${k+1}</span><span class="cz-w"></span>`);b.dataset.k=k;g.replaceWith(b)});
  const text=h("div",{class:"cz-text"});while(box.firstChild)text.appendChild(box.firstChild);
  const body=drillShell(box,"Fill in the blanks","Tap a word, then tap a blank. You can also drag a word into a blank. Tap a filled blank to empty it.");
  body.appendChild(text);const bank=h("div",{class:"cz-bank"});body.appendChild(bank);const msg=drillMsg(box),cnt=$("[data-c]",box);
  let sel=null;const G=$$(".cz-gap",text);
  const pickChip=c=>{if(sel)sel.classList.remove("sel");sel=c&&c!==sel?c:null;if(sel)sel.classList.add("sel")};
  const empty=g=>{if(g._chip){g._chip.classList.remove("used");g._chip.disabled=false}g._chip=null;g.dataset.w="";$(".cz-w",g).textContent="";g.classList.remove("full","ok","no")};
  const place=(g,c)=>{if(!c)return;empty(g);g._chip=c;g.dataset.w=c.dataset.w;$(".cz-w",g).textContent=c.dataset.w;g.classList.add("full");c.classList.add("used");c.disabled=true;pickChip(null);msg.textContent="";msg.className="dr-msg";count()};
  const count=()=>{cnt.textContent=`${G.filter(g=>g.dataset.w).length} of ${G.length} filled`};
  function build(){bank.innerHTML="";G.forEach(empty);pickChip(null);shuf([...ans.map(a=>a.w),...extra]).forEach(w=>{const c=h("button",{class:"cz-chip",type:"button"},w);c.dataset.w=w;bank.appendChild(c);
      c.onclick=()=>{if(c._drag)return;pickChip(c)};dragger(c,{start(){pickChip(null)},end(u){const g=u&&u.closest(".cz-gap");if(g&&text.contains(g))place(g,c)}})});msg.textContent="";msg.className="dr-msg";count()}
  G.forEach(g=>g.onclick=()=>{if(sel)place(g,sel);else if(g._chip){empty(g);count()}});
  const right=(g)=>{const a=ans[+g.dataset.k];return [a.w,...a.alt].some(x=>norm(x)===norm(g.dataset.w||""))};
  drillBar(box,[["Check","check",()=>{let n=0;const notes=[];G.forEach(g=>{const ok=right(g);n+=ok;g.classList.toggle("ok",ok);g.classList.toggle("no",!ok);const a=ans[+g.dataset.k];if(!ok&&a.why)notes.push(`<li><b>${+g.dataset.k+1}</b> ${a.why}</li>`)});
      const all=n===G.length;msg.innerHTML=`${ic(all?"check":"x")}<span><b>${n} of ${G.length}</b> correct.${all?"":" Fix the red blanks, or press Show answers."}${notes.length?`<ul>${notes.join("")}</ul>`:""}</span>`;msg.className="dr-msg "+(all?"ok":"no")}],
    ["Show answers","bulb",()=>{G.forEach(g=>{const a=ans[+g.dataset.k];empty(g);const c=$$(".cz-chip:not(.used)",bank).find(c=>c.dataset.w===a.w);if(c)place(g,c);else{g.dataset.w=a.w;$(".cz-w",g).textContent=a.w;g.classList.add("full")}g.classList.add("ok")});
      const notes=ans.map((a,k)=>a.why?`<li><b>${k+1}</b> ${a.why}</li>`:"").join("");msg.innerHTML=notes?`${ic("info")}<span><ul>${notes}</ul></span>`:"";msg.className="dr-msg"}],
    ["Reset","reset",build]]);
  build();
}

function drillSpot(box){
  const tw=document.createTreeWalker(box,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode.closest("s[data-fix]")||!n.nodeValue.trim()?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const tn=[];while(tw.nextNode())tn.push(tw.currentNode);
  tn.forEach(n=>{const f=document.createDocumentFragment();n.nodeValue.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p))f.appendChild(document.createTextNode(p));else f.appendChild(h("span",{class:"sp-w"},p.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[c])))});n.replaceWith(f)});
  const E=$$("s[data-fix]",box).map((s,k)=>{const b=h("span",{class:"sp-err",role:"button",tabindex:"0"},s.innerHTML);b.dataset.k=k;b.dataset.fix=s.dataset.fix;b.dataset.why=s.dataset.why||"";s.replaceWith(b);return b});
  const text=h("div",{class:"sp-text"});while(box.firstChild)text.appendChild(box.firstChild);
  const body=drillShell(box,"Find the mistakes",`Tap every word or part that is wrong. <b>${E.length}</b> mistakes are hidden here.`);body.appendChild(text);
  const msg=drillMsg(box),log=h("ol",{class:"sp-log"}),cnt=$("[data-c]",box);box.appendChild(log);let miss=0;
  const count=()=>{const f=E.filter(e=>e.classList.contains("found")).length;cnt.textContent=`${f} of ${E.length} found`;msg.innerHTML=f===E.length?`${ic("check")}<span><b>All ${E.length} found</b>${miss?` (${miss} wrong ${miss>1?"taps":"tap"})`:""}.</span>`:(miss?`<span>${miss} wrong ${miss>1?"taps":"tap"} so far.</span>`:"");msg.className="dr-msg"+(f===E.length?" ok":"")};
  const reveal=(e,auto)=>{if(e.classList.contains("found"))return;e.classList.add("found");if(auto)e.classList.add("shown");e.insertAdjacentHTML("afterend",`<span class="sp-fix">${e.dataset.fix||"(hapus)"}</span>`);
    const li=h("li",{},`<span class="sp-was">${e.innerHTML}</span> → <b>${e.dataset.fix||"(hapus)"}</b>${e.dataset.why?` <span class="sp-why">${e.dataset.why}</span>`:""}`);li.dataset.k=e.dataset.k;
    const after=[...log.children].find(x=>+x.dataset.k>+e.dataset.k);log.insertBefore(li,after||null);count()};
  text.addEventListener("click",e=>{const er=e.target.closest(".sp-err");if(er){reveal(er);return}const w=e.target.closest(".sp-w");if(w){miss++;pulse(w,"miss");count()}});
  text.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".sp-err")){e.preventDefault();reveal(e.target)}});
  drillBar(box,[["Show all","bulb",()=>E.forEach(e=>reveal(e,true))],["Reset","reset",()=>{E.forEach(e=>{e.classList.remove("found","shown");const f=e.nextElementSibling;if(f&&f.matches(".sp-fix"))f.remove()});log.innerHTML="";miss=0;count();msg.textContent=""}]]);
  count();msg.textContent="";
}

function drillMatch(box){
  const P=$$(":scope>p",box).map((p,i)=>{const b=$("b",p),t=b?b.innerHTML:"";if(b)b.remove();return {t,d:p.innerHTML.trim(),i}});
  const body=drillShell(box,"Match","Tap a term, then tap its meaning. You can also drag the term onto the meaning.");
  const bank=h("div",{class:"cz-bank mt-bank"}),list=h("div",{class:"mt-list"});body.append(bank,list);const msg=drillMsg(box),cnt=$("[data-c]",box);
  let sel=null,miss=0;
  const pick=c=>{if(sel)sel.classList.remove("sel");sel=c&&c!==sel?c:null;if(sel)sel.classList.add("sel")};
  const count=()=>{const n=$$(".mt-row.ok",list).length;cnt.textContent=`${n} of ${P.length} matched`;if(n===P.length){msg.innerHTML=`${ic("check")}<span><b>All matched</b>${miss?` (${miss} wrong ${miss>1?"tries":"try"})`:""}.</span>`;msg.className="dr-msg ok"}};
  const tryMatch=(c,row)=>{if(!c||row.classList.contains("ok"))return;if(c.dataset.i===row.dataset.i){row.classList.add("ok");$(".mt-slot",row).innerHTML=c.innerHTML;c.classList.add("used");c.disabled=true;pick(null);count()}else{miss++;pulse(row,"no");msg.innerHTML=`<span>Not that one. ${miss} wrong ${miss>1?"tries":"try"}.</span>`;msg.className="dr-msg no"}};
  function build(){bank.innerHTML="";list.innerHTML="";miss=0;pick(null);msg.textContent="";msg.className="dr-msg";
    shuf(P).forEach(p=>{const c=h("button",{class:"cz-chip",type:"button"},p.t);c.dataset.i=p.i;bank.appendChild(c);c.onclick=()=>{if(!c._drag)pick(c)};dragger(c,{start(){pick(null)},end(u){const r=u&&u.closest(".mt-row");if(r&&list.contains(r))tryMatch(c,r)}})});
    shufNew(P,x=>x.i).forEach(p=>{const r=h("button",{class:"mt-row",type:"button"},`<span class="mt-slot">?</span><span class="mt-d">${p.d}</span>`);r.dataset.i=p.i;list.appendChild(r);r.onclick=()=>{if(sel)tryMatch(sel,r)}});count()}
  drillBar(box,[["Reset","reset",build]]);build();
}
const DRILLS={order:drillOrder,cloze:drillCloze,spot:drillSpot,match:drillMatch};
$$(".drill").forEach(b=>{const k=Object.keys(DRILLS).find(k=>b.classList.contains(k));if(k)try{DRILLS[k](b)}catch(e){console.error(e)}});

/* ---------- math formatting: one equation per row, subscripts, semantic colours ---------- */
function mapTextSegs(html,fn){return String(html).split(/(<[^>]+>|&[A-Za-z0-9#]+;)/g).map((s,i)=>i%2?s:fn(s)).join("")}
function subMath(html){return mapTextSegs(html,t=>t.replace(/\^\{([^{}]*)\}/g,"<sup>$1</sup>").replace(/_\{([^{}]*)\}/g,"<sub>$1</sub>").replace(/\^([A-Za-z0-9'*+-])/g,"<sup>$1</sup>").replace(/([A-Za-z0-9\u0370-\u03FF∑∏])_([A-Za-z0-9']+)/g,"$1<sub>$2</sub>").replace(/(\d|\))\s*-\s*(\d|\()/g,"$1 − $2").replace(/((?:(?:for|if|untuk|jika)\s+)?[A-Za-z0-9.]+\s*[≤≥<>]\s*[A-Za-z0-9.]+\s*[≤≥<>]\s*[A-Za-z0-9.]+)/gi,'<span class="nowrap">$1</span>').replace(/(\([^()]{1,22}[→=≤≥<>][^()]{0,22}\))/g,'<span class="nowrap">$1</span>').replace(/([=≈≤≥≠∈]\s*[−-]?[A-Za-z0-9.]+%?)/g,'<span class="nowrap">$1</span>'))}
function hasEqOp(s){return /[=≈≤≥⇒⇔]/.test(s.replace(/<[^>]+>/g,""))}
function trimMath(s){return String(s).replace(/^(?:\s|&emsp;|&ensp;|&thinsp;)+|(?:\s|&emsp;|&ensp;|&thinsp;)+$/gi,"")}
function splitEqRows(html){
  const out=[];
  String(html).split(/<br\s*\/?>|\n/gi).forEach(line=>{
    const s=trimMath(line);if(!s)return;
    let pd=0,td=0,last=0,parts=[];
    for(let i=0;i<s.length;i++){
      const c=s[i];
      if(c==="<"){td++;continue}if(c===">"&&td>0){td--;continue}if(td>0)continue;
      if(c==="&"){const semi=s.indexOf(";",i);if(semi>i&&semi-i<10){i=semi;continue}}
      if(c==="("||c==="["||c==="{")pd++;else if((c===")"||c==="]"||c==="}")&&pd>0)pd--;
      if(pd!==0)continue;
      let sep=0;
      if((c===","&&/^(?:\s|&(?:emsp|ensp|thinsp);)/.test(s.slice(i+1)))||c===";"){
        const m=s.slice(i+1).match(/^(?:\s|&(?:emsp|ensp|thinsp);)*/);
        sep=1+(m?m[0].length:0);
      } else if(s.slice(i).match(/^\s+and\s+/i))sep=s.slice(i).match(/^\s+and\s+/i)[0].length;
      if(sep){const L=trimMath(s.slice(last,i)),R=trimMath(s.slice(i+sep));
        if(hasEqOp(L)&&hasEqOp(R)){parts.push(L);last=i+sep;i+=sep-1}}
    }
    parts.push(trimMath(s.slice(last)));
    parts.forEach(p=>{if(p)out.push(p)});
  });
  return out;
}
function colorMathRow(row){
  let idx=-1,td=0,pd=0;
  for(let i=0;i<row.length;i++){
    const c=row[i];
    if(c==="<"){td++;continue}if(c===">"&&td>0){td--;continue}if(td>0)continue;
    if(c==="("||c==="["||c==="{")pd++;else if((c===")"||c==="]"||c==="}")&&pd>0)pd--;
    if(pd===0&&/[=≈≤≥]/.test(c)){idx=i;break}
  }
  const paintSeg=(seg,inLhs)=>{
    let sub=0,hi=0;
      return seg.split(/(<[^>]+>|&[A-Za-z0-9#]+;)/g).map((tok,i)=>{
      if(i%2){
        if(/^<(sub|sup)\b/i.test(tok))sub++;else if(/^<\/(sub|sup)>/i.test(tok)&&sub>0)sub--;
        if(/^<span class="(?:hi|x)"/i.test(tok))hi++;else if(/^<\/span>/i.test(tok)&&hi>0)hi--;
        return tok;
      }
      if(hi>0)return tok;
      return tok.replace(/([=≈≤≥≠⇒⇔+\-−×÷±→·|()[\]]|\d+(?:\.\d+)?%?)/g,(m,_,off,str)=>{
        if(/^[=≈≤≥≠→⇒⇔]$/.test(m))return `<span class="m-op m-rel">${m}</span>`;
        if(/^[+\-−×÷±]$/.test(m)){
          const op=m==="-"?"−":m;
          const prev=str.slice(0,off).trimEnd().slice(-1);
          const una=/^[+\-−]$/.test(op)&&(!prev||/[(=≈≤≥≠→,[+\-−×÷±]/.test(prev));
          return `<span class="m-op ${una?"m-una":"m-bin"}">${op}</span>`;
        }
        if(/^[·|()[\]]$/.test(m))return `<span class="m-op">${m}</span>`;
        if(inLhs||sub>0)return m;
        return `<span class="m-num">${m}</span>`;
      });
    }).join("");
  };
  if(idx>0){
    const lhs=row.slice(0,idx).trim(),rhs=row.slice(idx);
    if(lhs)return `<span class="m-lhs">${paintSeg(lhs,true)}</span>${paintSeg(rhs,false)}`;
  }
  return paintSeg(row,false);
}
function renderMathRow(r){
  if(r.includes('class="fr"')){
    let td=0,pd=0,frEnd=r.lastIndexOf('class="fr"'),lastEq=-1;
    for(let i=0;i<r.length;i++){
      const c=r[i];
      if(c==="<"){td++;continue}if(c===">"&&td>0){td--;continue}if(td>0)continue;
      if(c==="("||c==="["||c==="{")pd++;else if((c===")"||c==="]"||c==="}")&&pd>0)pd--;
      if(pd===0&&i>frEnd&&(c==="="||c==="≈"))lastEq=i;
    }
    if(lastEq>0){
      const head=trimMath(r.slice(0,lastEq)),tail=trimMath(r.slice(lastEq));
      if(head&&tail&&!tail.includes('class="fr"'))
        return `<span class="eq-row eq-split"><span class="eq-head">${colorMathRow(head)}</span><span class="eq-tail">${colorMathRow(tail)}</span></span>`;
    }
  }
  return `<span class="eq-row">${colorMathRow(r)}</span>`;
}
function formatMath(s,o){
  const h=subMath(s);
  if(!o||!o.rows)return h;
  return splitEqRows(h).map(renderMathRow).join("");
}
$$(".eq").forEach(el=>{
  const sm=[...el.querySelectorAll(":scope>small")];
  sm.forEach(n=>n.remove());
  const rows=splitEqRows(subMath(el.innerHTML));
  if(rows.length>1)el.classList.add("eq-multi");
  el.innerHTML=`<div class="eq-scroll">${rows.map(renderMathRow).join("")}</div>`;
  sm.forEach(n=>el.appendChild(n));
});
function alignMath(rootEl=main){
  $$(".kd-m,.eq.eq-multi .eq-scroll",rootEl).forEach(m=>{
    const rows=$$(".eq-row",m);if(rows.length<2)return;
    const ls=rows.map(r=>$(".m-lhs",r)).filter(Boolean);
    ls.forEach(el=>el.style.minWidth="");
    const ws=ls.map(el=>el.getBoundingClientRect().width).filter(w=>w>0);
    if(!ws.length)return;
    const sorted=[...ws].sort((a,b)=>a-b),med=sorted[Math.floor(sorted.length/2)];
    const cap=Math.min(180,med*2.2);
    const target=Math.max(...ws.filter(w=>w<=cap),0);
    if(target>0)ls.forEach((el,i)=>{if(ws[i]<=cap)el.style.minWidth=Math.ceil(target)+"px"});
  });
}
$$(".cmp td,.tbl td",main).forEach(td=>{if(!td.closest(".eq,.kd-m")&&/[≤≥<>→]/.test(td.textContent))td.innerHTML=subMath(td.innerHTML)});
requestAnimationFrame(()=>alignMath());

const blockEn=new WeakMap(),txtEn=new WeakMap();
let quizEn=null,flashEn=null;
function applyLang(l){
  lang=l==="id"?"id":"en";store.set("lang",lang);root.lang=lang;
  $$("[data-id]").forEach(el=>{if(el.dataset.en==null)el.dataset.en=el.innerHTML;el.innerHTML=lang==="id"?el.dataset.id:el.dataset.en});
  const I=window.GUIDE_I18N;
  if(I){
    if(I.blocks)Object.entries(I.blocks).forEach(([sel,idHtml])=>{$$(sel).forEach(el=>{if(!blockEn.has(el))blockEn.set(el,el.innerHTML);el.innerHTML=lang==="id"?idHtml:blockEn.get(el)})});
    if(I.text){
      const w=document.createTreeWalker(main,NodeFilter.SHOW_TEXT);let n;
      while((n=w.nextNode())){const raw=n.nodeValue.trim();if(!raw)continue;
        if(lang==="id"&&I.text[raw]!=null){if(!txtEn.has(n))txtEn.set(n,n.nodeValue);n.nodeValue=n.nodeValue.replace(raw,I.text[raw])}
        else if(lang==="en"&&txtEn.has(n))n.nodeValue=txtEn.get(n);
      }
    }
    if(I.quiz){if(!quizEn)quizEn=window.QUIZ;window.QUIZ=lang==="id"?I.quiz:quizEn;$$(".quiz[data-set]").forEach(renderQuiz)}
    if(I.flash){if(!flashEn)flashEn=window.FLASH;window.FLASH=lang==="id"?I.flash:flashEn;$$(".flash").forEach(flashcards)}
  }
  $(".tb-opt span",top).textContent=t("opt");
  $(".btn-pill",pbar).lastChild.textContent=t("contents");
  $(".sheet-done",sheet).textContent=t("done");
  $$(".ov-next .eyebrow").forEach(e=>e.textContent=t("next_st"));
  $$("[data-done]").forEach(b=>{const on=done.has(b.dataset.done);b.querySelector("span").textContent=on?t("learned"):t("mark")});
  $$(".player [data-a='reset'] span").forEach(s=>s.textContent=t("reset"));
  paintOpt();
  document.dispatchEvent(new CustomEvent("langchange",{detail:lang}));
}
if(lang==="id")requestAnimationFrame(()=>applyLang("id"));

window.Engine={$,$$,h,ic,store,flow,stepper,segc,segSet,rangeFill,sorter,drills:DRILLS,watch,tickers,motionOn,markDone:id=>Engine_markDone(id),isDone:id=>done.has(id),visible,
  openSheet,openOptions,applyTheme,getTheme:()=>theme,applyMotion,applyLang,getLang:()=>lang,t,showToast,lineVars,chapters,parts,counted,fitAll,paintProgress,phoneMQ,math:formatMath,alignMath};
document.dispatchEvent(new Event("engine-ready"));
})();
