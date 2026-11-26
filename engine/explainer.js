/* =====================================================================
   METRO ENGINE v1.5 · BOOT SCREEN · MODE PICKER · FULL-SCREEN EXPLAINER
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
const minT=reduce?150:950,t0=performance.now();
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
          if(b.matches(".cp-list")){[...b.children].forEach(d=>{
            const body=d.matches("details.cp")&&$(".cp-body",d);
            if(!body){keep(d);start();cur.nodes.push(d);cur.media++;return}
            /* v1.2: a checkpoint becomes short screens: two traps per screen, then its quiz */
            const nm=`${$(".cp-n",d)?.textContent||""} ${$(".cp-t",d)?.textContent||""}`.trim();
            const traps=$$(":scope>.callout",body),quiz=$(":scope>.quiz",body),pages=Math.ceil(traps.length/2);
            const sc=(eb,nodes)=>{const x={...base,kind:"sec",h3:h("h3",{"data-eb":eb},nm),nodes:nodes.map(keep),text:[],media:nodes.length,calls:0,chars:0};S.push(x)};
            for(let k=0;k<traps.length;k+=2)sc(pages>1?`Watch out for · ${k/2+1} of ${pages}`:"Watch out for",traps.slice(k,k+2));
            if(quiz)sc("Test yourself",[quiz]);cur=null});return}
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
    <button class="ex-pill ex-menu" type="button" aria-haspopup="dialog" aria-label="Stations">${ic("list")}<span>Stations</span></button>
    <div class="ex-where"><span class="lbadge"></span><span class="ex-wt"></span></div>
    <div class="ex-acts" role="group" aria-label="Reading mode and options"><button class="ex-pill ex-scroll" type="button" title="Scroll mode: the whole guide on one page" aria-label="Switch to scroll mode">${SVG.scroll}<span>Scroll</span></button><button class="ex-pill ex-opt" type="button" aria-haspopup="dialog" aria-label="Options">${ic("sliders")}<span>Options</span></button><button class="ex-pill ex-fs fs-btn" type="button" aria-label="Full screen" title="Full screen" hidden><svg class="ic fs-on" viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg><svg class="ic fs-off" viewBox="0 0 24 24"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg><span class="lbl">Full screen</span></button></div>
    <div class="ex-bars" aria-hidden="true"></div>
  </div>
  <div class="ex-stage"><div class="ex-card" aria-live="polite"><div class="ex-text"></div><div class="ex-media"></div></div></div>
  <div class="ex-bot">
    <div class="ex-nav"><button class="ex-prev" type="button">${ic("back")}<span>Back</span></button><button class="ex-next" type="button"><span>Next</span>${ic("next")}</button></div>
    <div class="ex-meta"><span class="ex-count"></span><span class="ex-tools"><button class="ex-pill ex-trybtn" type="button" aria-expanded="false" aria-controls="ex-try" hidden>${ic("sliders")}<span>Try it yourself</span></button><span class="ex-done"></span></span></div>
  </div>`;
document.body.appendChild(ex);
/* sliders sheet (narrow screens): the visual's sliders live here while the screen is shown */
const trySheet=h("div",{class:"ex-try",id:"ex-try",role:"dialog","aria-label":"Try it yourself"},`<div class="ex-try-h"><b>Try it yourself</b><span>Drag a slider and watch the visual.</span><button class="ex-pill ex-try-done" type="button">Done</button></div><div class="viz ex-try-b"></div>`);
trySheet.hidden=true;ex.appendChild(trySheet);
const card=$(".ex-card",ex),txt=$(".ex-text",ex),med=$(".ex-media",ex),stage=$(".ex-stage",ex);
const bars=$(".ex-bars",ex),wt=$(".ex-wt",ex),badge=$(".ex-where .lbadge",ex),count=$(".ex-count",ex),doneBox=$(".ex-done",ex);
let cur=-1,shown=[];
const tryBtn=$(".ex-trybtn",ex),tryBody=$(".ex-try-b",trySheet);
let moved=[],made=[],arranged=null,nextBase="Next",pendingLast=false,pgEl=null;const pg={stops:[0],i:0};const painted=new Map();
/* sub-nodes moved for one screen (a visual's caption, player, sliders) go back to their own place */
function moveTo(n,into){const ph=document.createComment("exm");n.before(ph);into.appendChild(n);moved.push([n,ph])}
function restoreMoved(){moved.reverse().forEach(([n,ph])=>{if(ph.parentNode)ph.parentNode.insertBefore(n,ph);ph.remove()});moved=[];made.forEach(m=>m.remove());made=[];
  closeTry();tryBtn.hidden=true;arranged=null;$$(".ex-win",med).forEach(st=>{st.classList.remove("ex-win","ex-win-top","ex-win-bot");st.style.maxHeight=""})}
function returnNodes(){restoreMoved();shown.forEach(n=>{const ph=home.get(n);if(ph&&ph.parentNode)ph.parentNode.insertBefore(n,ph);n.style.zoom=""});shown=[];txt.innerHTML="";txt.style.zoom="";med.innerHTML="";med.style.zoom="";med.style.height="";med.scrollTop=0;med.classList.remove("paged","more");txt.style.height="";txt.scrollTop=0;txt.classList.remove("paged","more");card.style.height="";card.scrollTop=0;card.classList.remove("more");pgEl=null;card.classList.remove("scroll","two","solo","title","paged");pg.stops=[0];pg.i=0;
  painted.forEach((d,q)=>q.dispatchEvent(new CustomEvent("quizpaint",{bubbles:true,detail:d})));painted.clear()}
function openTry(){trySheet.hidden=false;tryBtn.setAttribute("aria-expanded","true");ex.classList.add("trying")}
function closeTry(){trySheet.hidden=true;tryBtn.setAttribute("aria-expanded","false");ex.classList.remove("trying")}
function setLine(p){
  if(p){ex.classList.add("part");ex.dataset.part=p.dataset.part;ex.style.cssText=E.lineVars(p.dataset.part)}
  else{ex.classList.remove("part");delete ex.dataset.part;ex.style.cssText=""}}
function show(i,dir){
  if(!screens)screens=build();
  i=Math.max(0,Math.min(screens.length-1,i));const s=screens[i];
  returnNodes();cur=i;setLine(s.part);
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
  count.textContent=`${k+1} / ${grp.length}`;count.dataset.base=count.textContent;
  $(".ex-prev",ex).disabled=i===0;
  const last=i===screens.length-1,endOfCh=s.ch&&(i===screens.length-1||screens[i+1].group!==s.group);
  const anyDone=E.counted.some(c=>E.isDone(c.id));
  nextBase=last?"Finish":endOfCh?"Next station":(s.kind==="map"?(anyDone?"Continue":"Start riding"):"Next");pendingLast=dir<0;
  $(".ex-next span",ex).textContent=nextBase;
  doneBox.innerHTML=s.ch&&s.ch.counts&&endOfCh?`<button class="donebtn sm" type="button" data-done="${s.ch.id}" aria-pressed="${E.isDone(s.ch.id)}">${ic("check")}<span>${E.isDone(s.ch.id)?"Learned":"Mark as learned"}</span></button>`:"";
  store.set("exPos",s.key);
  // slide in
  card.classList.remove("in-l","in-r");void card.offsetWidth;if(dir&&E.motionOn())card.classList.add(dir>0?"in-r":"in-l");
  requestAnimationFrame(fit);setTimeout(fit,400);
  E.fitAll&&E.fitAll();
}
/* fit (v1.2): every screen fits the viewport with no scrolling.
   1. arrange: on wide screens a visual's caption, player and sliders move into the
      left column, so the right column holds only the picture; on narrow screens the
      sliders move into a "Try it yourself" sheet when they don't fit.
   2. a stepped HTML visual (worked example, table) that is still too tall becomes a
      window that follows the current step.
   3. shrink a little (never below a readable floor).
   4. otherwise split the screen into parts: Next shows the next part ("More"). */
function wideNow(){const hasBody=[...txt.children].some(n=>n.tagName!=="H3"&&!n.classList.contains("ex-vpanel"));
  if(med.querySelector(".cmp-wide"))return false;
  const v=med.querySelector(":scope>.viz");const panel=!!(v&&$(":scope>.player",v));
  return roomy()&&!!med.childNodes.length&&(hasBody||panel)}
function arrange(wide){
  card.classList.toggle("two",!!wide);ex.classList.toggle("wide",!!wide);
  const v=med.querySelector(":scope>.viz");if(!wide||!v)return;
  const parts=[$(":scope>.viz-cap",v),$(":scope>.player",v),...$$(":scope>.ctl",v)].filter(Boolean);if(!parts.some(n=>n.matches(".player")))return;
  const panel=h("div",{class:"viz ex-vpanel"+(v.classList.contains("kit")?" kit":"")});txt.appendChild(panel);made.push(panel);parts.forEach(n=>moveTo(n,panel));
}
function fit(){
  if(cur<0)return;let wide=wideNow();
  if(arranged&&arranged.i===cur&&arranged.room===roomy())wide=arranged.wide;
  if(!arranged||arranged.i!==cur||arranged.wide!==wide){restoreMoved();arrange(wide);arranged={i:cur,wide,room:roomy()}}
  refit(false);
  /* a heading-only screen that needs parts in one column: try heading left, content right */
  if(!wide&&roomy()&&card.classList.contains("paged")&&txt.childNodes.length){restoreMoved();arrange(true);arranged={i:cur,wide:true,room:true};refit(false)}
}
function roomy(){return innerWidth>=900&&innerWidth>innerHeight*1.1}
function resetFit(){
  $$(".ex-win",med).forEach(w=>{w.classList.remove("ex-win","ex-win-top","ex-win-bot");w.style.maxHeight=""});
  $$("svg.ex-fit",med).forEach(g=>{g.classList.remove("ex-fit");g.style.maxHeight=""});med.style.zoom="";
}
function winEdges(w){if(!w)return;w.classList.toggle("ex-win-top",w.scrollTop>4);w.classList.toggle("ex-win-bot",w.scrollTop+w.clientHeight<w.scrollHeight-4)}
/* make the media fit `avail` px without making words smaller: a stepped visual becomes a
   window that follows the step; the tallest drawing gets a little shorter. Returns the px still over. */
function squeeze(avail,keepTop,keep,floor=.72){
  const over=()=>med.scrollHeight-avail;
  const v=med.querySelector(":scope>.viz"),st=v&&$(":scope>.viz-stage",v);
  const hasSplit=!!(st&&st.querySelector(".kd-layout.has-viz"));
  if(hasSplit&&over()>0){
    const vp=st.querySelector(".kd-viz-pane"),sp=st.querySelector(".kd-steps-pane"),vsvg=vp&&$("svg",vp);
    const wideLay=st.clientWidth>=680;
    if(vsvg){const gh=vsvg.getBoundingClientRect().height,cap=wideLay?avail-28:Math.min(gh,Math.max(150,avail*.4));
      if(gh>cap&&cap>=140){vsvg.classList.add("ex-fit");vsvg.style.maxHeight=Math.floor(cap)+"px"}}
    if(sp&&over()>0){
      const vpH=wideLay||!vp?0:vp.offsetHeight+14;
      const want=Math.floor(avail-vpH-36);
      if(want>=120){sp.classList.add("ex-win");sp.style.maxHeight=want+"px";const left=over();if(left>0)sp.style.maxHeight=Math.max(110,want-left)+"px";sp.scrollTop=keepTop;follow(!!keep);winEdges(sp)}
    }
  } else if(over()>0&&st&&$(".player",card)&&!st.querySelector(":scope>svg")){const want=st.offsetHeight-over();
    if(want>=110){st.classList.add("ex-win");st.style.maxHeight=want+"px";const left=over();if(left>0)st.style.maxHeight=(want-left)+"px";st.scrollTop=keepTop;follow(!!keep);winEdges(st)}}
  if(!hasSplit&&over()>0){const svgs=$$("svg",med).filter(g=>!g.closest(".ex-win,.ic,button")&&g.getBoundingClientRect().height>120).sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height);
    if(svgs[0]){const g=svgs[0],gh=g.getBoundingClientRect().height,want=gh-over();if(want/gh>=Math.min(floor,.4)){g.classList.add("ex-fit");g.style.maxHeight=Math.floor(want)+"px"}}}
  return over();
}
function refit(keep){
  if(cur<0)return;
  const w0=$(".ex-win",med),keepTop=w0?w0.scrollTop:0;
  resetFit();txt.style.zoom="";med.style.height="";med.classList.remove("paged","more");txt.style.height="";txt.classList.remove("paged","more");
  card.style.height="";card.scrollTop=0;card.classList.remove("scroll","paged","more");pgEl=med;
  const wide=card.classList.contains("two");
  card.classList.toggle("head-only",![...txt.children].some(n=>n.tagName!=="H3")&&!!txt.childNodes.length);
  const cs=getComputedStyle(stage),H=stage.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-4;
  const parts=()=>{pgEl=card;card.style.height=H+"px";card.classList.add("paged");return setPages(stopsFor(H),keep)};
  if(wide&&txt.scrollHeight>H)txt.style.zoom=Math.max(.82,H/txt.scrollHeight).toFixed(3);
  if(!med.childNodes.length){
    if(txt.scrollHeight>H){const z=H/txt.scrollHeight;if(z>=.8)txt.style.zoom=z.toFixed(3);else return parts()}
    return setPages([0])}
  const tH=wide?0:txt.offsetHeight+(txt.childNodes.length?14:0),avail=H-tH,over=()=>med.scrollHeight-avail;
  const v=med.querySelector(":scope>.viz"),stepped=!!(v&&$(".player",card));
  // narrow screens: sliders to the sheet when they don't fit
  if(!wide&&v&&over()>0&&!tryBody.childNodes.length){const c=$$(":scope>.ctl",v);if(c.length){c.forEach(n=>moveTo(n,tryBody));tryBtn.hidden=false}}
  if(squeeze(avail,keepTop,keep)<=0)return setPages([0]);
  // a visual that can't share a small screen with its words: words first, then the whole visual ("More")
  if(!wide&&stepped&&tH>0){resetFit();
    const after=[...med.children].filter(n=>n!==v&&(v.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_FOLLOWING));
    const extra=after.length?med.scrollHeight-(v.getBoundingClientRect().bottom-med.getBoundingClientRect().top):0;
    if(squeeze(H+extra,keepTop,keep,.66)<=0){pgEl=card;card.style.height=H+"px";card.classList.add("paged");
      const at=n=>Math.round(n.getBoundingClientRect().top-card.getBoundingClientRect().top+card.scrollTop);
      const S=[0,at(v)];if(after.length&&card.scrollHeight-S[1]>H+1)S.push(at(after[0]));return setPages(S,keep)}
    resetFit();squeeze(avail,keepTop,keep)}
  // shrink a little (never below a readable floor)
  const mH=med.scrollHeight,kind=screens[cur].kind;
  const floor=med.querySelector(".quiz,.flash,.sorter")?.9:med.querySelector("details.cp,.grid2,.grid3,.terms,.steps,.tbl-wrap,.callout,.kit-html,.hn,table")?.88:kind==="map"?.8:.74;
  if(avail/mH>=floor){let z=avail/mH;med.style.zoom=z.toFixed(3);
    for(let k=0;k<3;k++){const real=med.getBoundingClientRect().height;if(real<=avail+1)break;z=z*avail/real;if(z<floor)break;med.style.zoom=z.toFixed(3)}
    if(med.getBoundingClientRect().height<=avail+1)return setPages([0]);med.style.zoom=""}
  // split into parts
  if(wide){pgEl=med;med.style.height=avail+"px";med.classList.add("paged");card.classList.add("paged");return setPages(stopsFor(avail),keep)}
  parts();
}
/* where a part may start: the top of a block, a table row, a list item, an option… */
const BREAKS=".ex-media>*,.ex-text>*,.ex-media .viz>*,.callout,tr,li,dl>div,.q-top,.q-text,.q-hint,.opt,.q-foot,.q-exp,.grid2>*,.grid3>*,.hn-b,.hn-end,.kd-given,.kd-legend,.kd-drawer,.k-legend,.k-use,.tbl-bar,.eq-legend,.eq-why,p,h4,.eq,.cp-h,.flash,.sorter";
function stopsFor(H){
  const el=pgEl||med,o=el.getBoundingClientRect().top-el.scrollTop,total=el.scrollHeight;
  const bps=[...new Set($$(BREAKS,el).map(e=>Math.round(e.getBoundingClientRect().top-o-6)).filter(y=>y>0&&y<total))].sort((a,b)=>a-b);
  const S=[0];let s=0,guard=0;
  while(total-s>H&&guard++<40){let best=null;for(const y of bps){if(y<=s+40)continue;if(y-s<=H)best=y;else break}
    if(best==null)best=s+H-28;S.push(best);s=best}
  return S;
}
function setPages(S,keep){
  pg.stops=S;pg.i=pendingLast?S.length-1:keep?Math.min(pg.i,S.length-1):0;pendingLast=false;goPage(pg.i,false);
}
function goPage(i,smooth=true){
  pg.i=Math.max(0,Math.min(pg.stops.length-1,i));const n=pg.stops.length,more=pg.i<n-1;
  const el=pgEl||med;el.scrollTo({top:pg.stops[pg.i],behavior:smooth&&E.motionOn()?"smooth":"auto"});
  el.classList.toggle("more",more&&n>1);
  $(".ex-prev",ex).disabled=cur===0&&pg.i===0;
  $(".ex-next span",ex).textContent=more?"More":nextBase;
  count.textContent=(count.dataset.base||"")+(n>1?` · part ${pg.i+1} of ${n}`:"");
}
function follow(smooth=true){
  const st=$(".ex-win",med);if(!st)return;
  const c=st.querySelector(".hn-on")||st.querySelector(".hn-b.on,.hn-end.on")||st.querySelector("li.on")||st.querySelector(".on");if(!c){winEdges(st);return}
  const r=c.getBoundingClientRect(),sr=st.getBoundingClientRect(),rel=r.top-sr.top+st.scrollTop;
  const top=Math.max(0,Math.min(rel-(st.clientHeight-r.height)/2,st.scrollHeight-st.clientHeight));
  st.scrollTo({top,behavior:smooth&&E.motionOn()?"smooth":"auto"});
  winEdges(st);setTimeout(()=>winEdges(st),260);
}
med.addEventListener("scroll",e=>{if(e.target.classList&&e.target.classList.contains("ex-win"))winEdges(e.target)},true);
med.addEventListener("visualstep",()=>requestAnimationFrame(()=>{refit(true);follow(true)}));
med.addEventListener("quizpaint",e=>{painted.set(e.target,e.detail);requestAnimationFrame(()=>refit(true))});
med.addEventListener("click",e=>{if(e.target.closest(".quiz,.flash,.sorter,.drill"))setTimeout(()=>refit(true),80)});
med.addEventListener("drillchange",()=>setTimeout(()=>refit(true),80)); /* v1.3: drills grow when checked */
tryBtn.addEventListener("click",()=>trySheet.hidden?openTry():closeTry());
$(".ex-try-done",trySheet).addEventListener("click",()=>{closeTry();tryBtn.focus()});
med.addEventListener("toggle",()=>requestAnimationFrame(()=>refit(true)),true);
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
/* back to the scroll page, at the station on screen */
$(".ex-scroll",ex).addEventListener("click",()=>{store.set("mode","scroll");leave()});
function back(){if(pg.i>0){goPage(pg.i-1);return}show(cur-1,-1)}
$(".ex-prev",ex).addEventListener("click",back);
$(".ex-next",ex).addEventListener("click",()=>{
  if(pg.i<pg.stops.length-1){goPage(pg.i+1);return}
  if(screens[cur].kind==="map"){const nx=E.counted.find(c=>!E.isDone(c.id));if(nx&&E.counted.some(c=>E.isDone(c.id))){show(screens.findIndex(s=>s.group===nx.id),1);return}}
  if(cur>=screens.length-1){E.showToast(`<span class="ti">${ic("check")}</span><span>End of the line. Try the practice exam again any time.</span>`);return}show(cur+1,1)});
$(".ex-menu",ex).addEventListener("click",()=>E.openSheet(true));
document.addEventListener("progress",()=>{if(cur>=0&&root.classList.contains("mode-ex")){const s=screens[cur];const b=$(".donebtn",doneBox);if(b&&s.ch){const on=E.isDone(s.ch.id);b.setAttribute("aria-pressed",String(on));b.querySelector("span").textContent=on?E.t("learned"):E.t("mark_sm")}}});
document.addEventListener("langchange",()=>{
  $(".ex-menu span",ex).textContent=E.t("stations");
  $(".ex-scroll span",ex).textContent=E.t("ex_scroll");
  $(".ex-opt span",ex).textContent=E.t("opt");
  $(".ex-fs .lbl",ex).textContent=E.t("full_scr");
  $(".ex-prev span",ex).textContent=E.t("back");
  $(".ex-trybtn span",ex).textContent=E.t("try_it");
  $(".ex-try-h b",trySheet).textContent=E.t("try_it");
  $(".ex-try-h span",trySheet).textContent=E.t("try_d");
  $(".ex-try-done",trySheet).textContent=E.t("done");
  if(cur>=0&&root.classList.contains("mode-ex"))show(cur,0);
});

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
  if(t.closest&&t.closest("input,textarea,select,[contenteditable],.viz,.segc,.q-steps,.drill"))return;
  if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();$(".ex-next",ex).click()}
  else if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();back()}
  else if(e.key==="Escape"&&!trySheet.hidden){closeTry();tryBtn.focus()}});
let sx=0,sy=0,ok=false;
function hasHScroll(el){for(;el&&el!==stage;el=el.parentElement)if(el.scrollWidth>el.clientWidth+2)return true;return false}
stage.addEventListener("touchstart",e=>{const t=e.target;ok=!(t.closest&&t.closest("input,.viz-stage,.ctl,.segc,.tbl-wrap,.mmap,.drill,.eq,.eq-scroll,.kd-m,.sorter"))&&!hasHScroll(t);const p=e.touches[0];sx=p.clientX;sy=p.clientY},{passive:true});
stage.addEventListener("touchend",e=>{if(!ok)return;const p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){if(dx<0)$(".ex-next",ex).click();else back()}},{passive:true});

/* no boot overlay (e.g. stripped page): honour the saved mode straight away */
if(!boot&&store.get("mode","scroll")==="explain")enter();
/* full screen (scroll top bar + explainer): hidden where the browser can't do it */
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
const fsOk=!!(document.fullscreenEnabled||document.webkitFullscreenEnabled);
/* where the browser can't go full screen (iPhone, some in-app views) the button switches to a
   "focus" view instead: the guide's own top bar folds away, a small Exit button stays. */
const fsFloat=h("button",{class:"fs-btn fs-float",type:"button","aria-label":"Exit full screen",title:"Exit full screen"},'<svg class="ic" viewBox="0 0 24 24"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>');
document.body.appendChild(fsFloat);
function fsPaint(){const on=!!fsEl()||root.classList.contains("fs-lite");root.classList.toggle("is-fs",on);$$(".fs-btn").forEach(b=>{b.hidden=false;const l=on?"Exit full screen":"Full screen";b.setAttribute("aria-label",l);b.title=l;const s=b.querySelector(".lbl");if(s)s.textContent=on?"Exit":"Full screen"});
  if(root.classList.contains("mode-ex"))setTimeout(fit,150)}
function fsLite(){root.classList.toggle("fs-lite");fsPaint()}
document.addEventListener("click",e=>{const b=e.target.closest(".fs-btn");if(!b)return;
  if(root.classList.contains("fs-lite"))return fsLite();
  if(!fsOk)return fsLite();
  try{const p=fsEl()?(document.exitFullscreen||document.webkitExitFullscreen).call(document):(root.requestFullscreen||root.webkitRequestFullscreen).call(root);
    if(p&&p.catch)p.catch(()=>{if(!fsEl())fsLite()})}catch(err){fsLite()}});
document.addEventListener("fullscreenchange",fsPaint);
document.addEventListener("webkitfullscreenchange",fsPaint);fsPaint();
window.Explainer={enter,leave,show,get screens(){return screens},get cur(){return cur}};
})();
