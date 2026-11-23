/* =====================================================================
   BOOT SCREEN · MODE PICKER · FULL-SCREEN EXPLAINER
   Two ways to ride the same stations:
     scroll   – the whole guide on one page (the original layout)
     explain  – full screen, one idea per screen: explainer text on top,
                the visual / table / quiz in the middle, Back + Next below.
   The explainer reuses the real content nodes (moved in and out), so
   every visual, quiz and table keeps working and keeps its state.
   ===================================================================== */
(function(){
const E=window.Engine,$=E.$,$$=E.$$,h=E.h,ic=E.ic,store=E.store;
const root=document.documentElement,G=window.GUIDE;
const parts=E.parts,chapters=E.chapters;
const SVG={
  scroll:'<svg class="ic" viewBox="0 0 24 24"><rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="M8.5 7h7M8.5 10.5h7M8.5 14h4"/><path d="M12 17.5v2.2M10.6 18.4l1.4 1.4 1.4-1.4"/></svg>',
  cards:'<svg class="ic" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 6.5h8"/><rect x="8" y="9" width="8" height="6" rx="1.5"/><path d="M8.5 18h2.5M13 18h2.5"/></svg>',
  map:'<svg class="ic" viewBox="0 0 24 24"><path d="M4 7h7l4 5h5M4 17h16M11 7v10"/><circle cx="4" cy="7" r="1.6"/><circle cx="20" cy="12" r="1.6"/><circle cx="11" cy="17" r="1.6"/></svg>'};

/* ---------------------------------------------------------------- boot */
const boot=$(".boot");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches||root.dataset.motion==="off";
const msg=boot&&$(".boot-msg",boot),bar=boot&&$(".boot-bar i",boot);
const steps=["Laying the track","Painting the lines","Opening the stations","Ready"];
let si=0;const tick=()=>{if(!boot)return;si=Math.min(si+1,steps.length-1);if(msg)msg.textContent=steps[si];if(bar)bar.style.width=((si+1)/steps.length*100)+"%"};
const minT=reduce?250:1500,t0=performance.now();
const tickT=reduce?null:setInterval(tick,minT/steps.length);
const fontsReady=document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]):Promise.resolve();
const ready=Promise.all([fontsReady,new Promise(r=>setTimeout(r,Math.max(0,minT-(performance.now()-t0))))]);

/* -------------------------------------------------------------- picker */
const pick=boot&&$(".pick",boot);
let remember=store.get("modeSkip",false);
function finishBoot(){if(!boot)return;boot.classList.add("gone");root.classList.remove("booting");setTimeout(()=>boot.remove(),600)}
function choose(m){store.set("mode",m);store.set("modeSkip",!!remember);if(m==="explain")enter();else leave(true);finishBoot()}
if(boot){
  ready.then(()=>{clearInterval(tickT);si=steps.length-1;if(msg)msg.textContent=steps[si];if(bar)bar.style.width="100%";
    setTimeout(()=>{
      if(remember){choose(store.get("mode","scroll"));return}
      boot.classList.add("picking");pick.hidden=false;
      const last=store.get("mode","scroll");$$(".pick-opt",pick).forEach(b=>b.classList.toggle("last",b.dataset.mode===last));
      const pos=store.get("exPos",null),dn=E.counted.filter(c=>E.isDone(c.id)).length;
      $(".pick-sub",pick).textContent=dn?`${dn} of ${E.counted.length} stations done. Same stations, two ways to ride.`:"Same stations, two ways to ride.";
      $(`.pick-opt[data-mode="${last}"]`,pick)?.focus({preventScroll:true});
    },reduce?0:250)});
  $$(".pick-opt",boot).forEach(b=>b.addEventListener("click",()=>choose(b.dataset.mode)));
  const sw=$(".pick-rem .switch",boot);
  if(sw){sw.setAttribute("aria-checked",String(remember));sw.addEventListener("click",()=>{remember=!remember;sw.setAttribute("aria-checked",String(remember))})}
}

/* ------------------------------------------------- top-bar mode switch */
const topIn=$(".topbar-in");
if(topIn){const b=h("button",{class:"tb-btn tb-mode",type:"button",title:"Explainer mode: one screen at a time","aria-label":"Switch to explainer mode"},SVG.cards+'<span class="lbl">Explainer</span>');
  topIn.insertBefore(b,$(".tb-aa",topIn));b.addEventListener("click",()=>{store.set("mode","explain");enter()})}

/* ------------------------------------------------------ build screens */
const isAside=el=>el.matches("details.more,.caption,p.small,p.muted");
const isText=el=>el.matches("p,ul,ol,h4")&&!el.matches(".steps,.terms")&&!isAside(el);
const len=el=>(el.textContent||"").replace(/\s+/g," ").length;
const CH=520;
let screens=null;const home=new Map();
function keep(n){if(!home.has(n)){const ph=document.createComment("ex");n.before(ph);home.set(n,ph)}return n}
function build(){
  const S=[];const add=s=>{s.nodes.forEach(keep);S.push(s)};
  const hero=$(".hero-card"),ov=$(".overview");
  if(hero)add({kind:"hero",group:"start",nodes:[hero],text:[],part:null,ch:null,label:G.title});
  if(ov)add({kind:"map",group:"start",nodes:[ov],text:[],part:null,ch:null,label:"Route map"});
  parts.forEach(p=>{
    const po=$(".part-open",p);if(po)add({kind:"part",group:p.id,nodes:[po],text:[],part:p,ch:null,label:p.dataset.kicker===p.dataset.title?p.dataset.title:`${p.dataset.kicker} · ${p.dataset.title}`});
    chapters.filter(c=>c._part===p).forEach(c=>{
      const g=c.id,base={group:g,part:p,ch:c,label:`${c.dataset.n} ${c.dataset.short||c.dataset.title}`};
      const head=$(":scope>.ch-head",c);if(head)add({...base,kind:"chapter",nodes:[head],text:[]});
      [...c.children].forEach(el=>{
        if(el.matches(".ch-head,.ch-foot"))return;
        if(!el.matches(".sec")){add({...base,kind:"media",nodes:[el],text:[],h3:null});return}
        const h3=$(":scope>h3",el);let cur=null;
        const start=()=>{cur={...base,kind:"sec",h3,nodes:[],text:[],media:0,calls:0,chars:0};S.push(cur)};
        [...el.children].forEach(b=>{if(b===h3)return;
          if(b.matches(".cp-list")){[...b.children].forEach(d=>{keep(d);start();cur.nodes.push(d);cur.media++});return}
          keep(b);
          if(isAside(b)&&cur){cur.nodes.push(b);cur.media++;return}
          if(isText(b)){if(!cur||cur.media||(cur.text.length&&cur.chars+len(b)>CH))start();cur.nodes.push(b);cur.text.push(b);cur.chars+=len(b)}
          else if(b.matches(".callout")){if(!cur||(cur.media&&!cur.calls)||cur.calls>=2||(cur.calls&&cur.chars+len(b)>CH*1.1))start();cur.nodes.push(b);cur.media++;cur.calls++;cur.chars+=len(b)}
          else{if(!cur||cur.media)start();cur.nodes.push(b);cur.media++}});
      });
    });
  });
  S.forEach((s,i)=>{s.i=i;s.key=s.group+":"+S.filter((x,j)=>j<i&&x.group===s.group).length});
  return S;
}

/* ------------------------------------------------------------- chrome */
const ex=h("div",{class:"ex",role:"region","aria-label":"Explainer","aria-roledescription":"slides"});
ex.innerHTML=`<div class="ex-top">
    <button class="ex-pill ex-menu" type="button" aria-haspopup="dialog">${ic("list")}<span>Stations</span></button>
    <div class="ex-where"><span class="lbadge"></span><span class="ex-wt"></span></div>
    <button class="ex-pill ex-opt" type="button" aria-haspopup="dialog">${ic("sliders")}<span>Options</span></button>
    <div class="ex-bars" aria-hidden="true"></div>
  </div>
  <div class="ex-stage"><div class="ex-card" aria-live="polite"><div class="ex-text"></div><div class="ex-media"></div></div></div>
  <div class="ex-bot">
    <div class="ex-nav"><button class="ex-prev" type="button">${ic("back")}<span>Back</span></button><button class="ex-next" type="button"><span>Next</span>${ic("next")}</button></div>
    <div class="ex-meta"><span class="ex-count"></span><span class="ex-tools"><span class="ex-done"></span></span></div>
  </div>`;
document.body.appendChild(ex);
const card=$(".ex-card",ex),txt=$(".ex-text",ex),med=$(".ex-media",ex),stage=$(".ex-stage",ex);
const bars=$(".ex-bars",ex),wt=$(".ex-wt",ex),badge=$(".ex-where .lbadge",ex),count=$(".ex-count",ex),doneBox=$(".ex-done",ex);
let cur=-1,shown=[];

function returnNodes(){shown.forEach(n=>{const ph=home.get(n);if(ph&&ph.parentNode)ph.parentNode.insertBefore(n,ph);n.style.zoom=""});shown=[];txt.innerHTML="";med.innerHTML="";med.style.zoom="";card.classList.remove("scroll","two","solo","title")}
function setLine(p){
  if(p){ex.classList.add("part");ex.dataset.part=p.dataset.part;ex.style.cssText=E.lineVars(p.dataset.part)}
  else{ex.classList.remove("part");delete ex.dataset.part;ex.style.cssText=""}}
function show(i,dir){
  if(!screens)screens=build();
  i=Math.max(0,Math.min(screens.length-1,i));const s=screens[i];
  returnNodes();card.scrollTop=0;stage.scrollTop=0;cur=i;setLine(s.part);
  // text column: section heading (a copy), then the explainer paragraphs
  if(s.kind==="sec"&&s.h3)txt.appendChild(s.h3.cloneNode(true));
  const textNodes=s.kind==="chapter"?s.nodes:s.nodes.filter(n=>s.text.includes(n));
  const mediaNodes=s.kind==="chapter"?[]:s.nodes.filter(n=>!s.text.includes(n));
  textNodes.forEach(n=>{txt.appendChild(n);shown.push(n)});
  mediaNodes.forEach(n=>{med.appendChild(n);shown.push(n);if(n.matches&&n.matches("details.cp"))n.open=true});
  card.classList.toggle("title",s.kind==="chapter"||s.kind==="hero");
  card.classList.toggle("solo",!txt.childNodes.length||!med.childNodes.length);
  shown.forEach(n=>n.classList&&n.classList.add("in"));
  // chrome
  const grp=screens.filter(x=>x.group===s.group),k=grp.indexOf(s);
  bars.innerHTML=grp.map((x,j)=>`<i class="${j<k?"past":j===k?"now":""}"></i>`).join("");
  wt.textContent=s.label;badge.textContent=s.part?s.part.dataset.part:"";badge.hidden=!s.part;
  count.textContent=`${k+1} / ${grp.length}`;
  $(".ex-prev",ex).disabled=i===0;
  const last=i===screens.length-1,endOfCh=s.ch&&(i===screens.length-1||screens[i+1].group!==s.group);
  const anyDone=E.counted.some(c=>E.isDone(c.id));
  $(".ex-next span",ex).textContent=last?"Finish":endOfCh?"Next station":(s.kind==="map"?(anyDone?"Continue":"Start riding"):"Next");
  doneBox.innerHTML=s.ch&&s.ch.counts&&endOfCh?`<button class="donebtn sm" type="button" data-done="${s.ch.id}" aria-pressed="${E.isDone(s.ch.id)}">${ic("check")}<span>${E.isDone(s.ch.id)?"Learned":"Mark as learned"}</span></button>`:"";
  store.set("exPos",s.key);
  // slide in
  card.classList.remove("in-l","in-r");void card.offsetWidth;if(dir&&E.motionOn())card.classList.add(dir>0?"in-r":"in-l");
  requestAnimationFrame(()=>{card.scrollTop=0;fit();card.scrollTop=0;});setTimeout(()=>{fit();},400);
  E.fitAll&&E.fitAll();
}
/* fit: keep each screen inside the viewport. Media shrinks (zoom) down to a
   floor; only if it still can't fit does the card scroll inside itself. */
function fit(){
  if(cur<0)return;med.style.zoom="";card.classList.remove("scroll");
  const hasBody=[...txt.children].some(n=>n.tagName!=="H3");
  const wide=innerWidth>=1000&&innerWidth>innerHeight*1.15&&hasBody&&med.childNodes.length;
  card.classList.toggle("head-only",!hasBody&&!!txt.childNodes.length);
  card.classList.toggle("two",!!wide);ex.classList.toggle("wide",!!wide);
  const H=stage.clientHeight-8;const tH=wide?0:txt.offsetHeight+(txt.childNodes.length&&med.childNodes.length?14:0);
  const mH=med.scrollHeight;if(!mH)return;
  if(screens[cur].kind==="map"){if(mH>H)card.classList.add("scroll");return}
  const avail=H-tH;let z=1;
  if(mH>avail){const texty=med.querySelector(".quiz,details.cp,.grid2,.grid3,.terms,.steps,.tbl-wrap,.callout,.kit-html");const floor=texty?(med.querySelector(".quiz,details.cp")?1:.86):.6;z=Math.max(floor,avail/mH);med.style.zoom=z.toFixed(3)}
  if((wide?Math.max(txt.offsetHeight,med.scrollHeight*z):tH+med.scrollHeight*z)>H+2)card.classList.add("scroll");
}
med.addEventListener("toggle",()=>requestAnimationFrame(fit),true);
let rT=0;addEventListener("resize",()=>{if(!root.classList.contains("mode-ex"))return;clearTimeout(rT);rT=setTimeout(fit,120)});

/* ---------------------------------------------------------- enter / leave */
function posFromScroll(){
  // the chapter (or part) you are reading in scroll mode
  let best=null,bt=Infinity;[...$$(".part-open"),...chapters].forEach(t=>{const r=t.getBoundingClientRect();if(r.top<innerHeight*.5&&Math.abs(r.top)<bt){bt=Math.abs(r.top);best=t}});
  if(!best||scrollY<200)return null;
  const g=best.classList.contains("part-open")?best.closest(".part").id:best.id;return screens.findIndex(s=>s.group===g)}
function enter(){
  if(!screens)screens=build();
  const fromScroll=root.classList.contains("mode-ex")?null:posFromScroll();
  root.classList.add("mode-ex");store.set("mode","explain");
  let i=fromScroll;if(i==null||i<0){const k=store.get("exPos",null);i=Math.max(0,screens.findIndex(s=>s.key===k))}
  show(i);$(".ex-next",ex).focus({preventScroll:true});
}
function leave(silent){
  if(!root.classList.contains("mode-ex")){if(silent)return;}
  const s=cur>=0&&screens?screens[cur]:null;returnNodes();cur=-1;root.classList.remove("mode-ex");store.set("mode","scroll");
  const target=s?(s.ch||($(".part-open",s.part||document)?.closest(".part"))):null;
  if(target&&!silent)requestAnimationFrame(()=>scrollTo({top:target.getBoundingClientRect().top+scrollY-70,behavior:"instant"}));
  E.fitAll&&E.fitAll();
}
$(".ex-opt",ex).addEventListener("click",()=>E.openOptions(true));
$(".ex-prev",ex).addEventListener("click",()=>show(cur-1,-1));
$(".ex-next",ex).addEventListener("click",()=>{if(card.scrollHeight>card.clientHeight+4&&card.scrollTop+card.clientHeight<card.scrollHeight-4){card.scrollBy({top:Math.max(120,Math.round(card.clientHeight*0.78)),behavior:E.motionOn()?"smooth":"auto"});return;}
  if(screens[cur].kind==="map"){const nx=E.counted.find(c=>!E.isDone(c.id));if(nx&&E.counted.some(c=>E.isDone(c.id))){show(screens.findIndex(s=>s.group===nx.id),1);return}}
  if(cur>=screens.length-1){E.showToast(`<span class="ti">${ic("check")}</span><span>End of the line. Try the practice exam again any time.</span>`);return}show(cur+1,1)});
$(".ex-menu",ex).addEventListener("click",()=>E.openSheet(true));
document.addEventListener("progress",()=>{if(cur>=0&&root.classList.contains("mode-ex")){const s=screens[cur];const b=$(".donebtn",doneBox);if(b&&s.ch){const on=E.isDone(s.ch.id);b.setAttribute("aria-pressed",String(on));b.querySelector("span").textContent=on?"Learned":"Mark as learned"}}});

/* links inside the explainer jump to the matching screen */
document.addEventListener("click",e=>{
  if(!root.classList.contains("mode-ex"))return;const a=e.target.closest('a[href^="#"]');if(!a)return;
  const id=a.getAttribute("href").slice(1);if(!id)return;const t=document.getElementById(id);if(!t)return;
  let i=screens.findIndex(s=>s.group===id);
  if(i<0)i=screens.findIndex(s=>s.nodes.some(n=>n===t||n.contains(t)));
  if(i<0){const ch=t.closest(".chapter");if(ch)i=screens.findIndex(s=>s.group===ch.id)}
  if(i>=0){e.preventDefault();E.openSheet(false);show(i,i>cur?1:-1)}},true);

/* keys and swipes */
document.addEventListener("keydown",e=>{
  if(!root.classList.contains("mode-ex")||e.defaultPrevented)return;const t=e.target;
  if(t.closest&&t.closest("input,textarea,select,[contenteditable],.viz,.segc,.q-steps"))return;
  if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();$(".ex-next",ex).click()}
  else if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();show(cur-1,-1)}});
let sx=0,sy=0,ok=false;
stage.addEventListener("touchstart",e=>{const t=e.target;ok=!(t.closest&&t.closest("input,.viz-stage,.ctl,.segc,.tbl-wrap,.mmap"));const p=e.touches[0];sx=p.clientX;sy=p.clientY},{passive:true});
stage.addEventListener("touchend",e=>{if(!ok)return;const p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){if(dx<0)$(".ex-next",ex).click();else show(cur-1,-1)}},{passive:true});

/* no boot overlay (e.g. stripped page): honour the saved mode straight away */
if(!boot&&store.get("mode","scroll")==="explain")enter();
window.Explainer={enter,leave,show,get screens(){return screens},get cur(){return cur}};
})();
