/* =====================================================================
   METRO ENGINE v1.5 · VISUAL KIT
   ---------------------------------------------------------------------
   1) V  — small drawing helpers for hand-drawn (custom) visuals.
   2) Kit — ready-made step visuals you configure with data instead of
            drawing by hand. Every kit gets the standard player
            (Start over · Back · Play · Next), step captions, the light /
            dark theme, the line colour, semantic role continuity, and
            the Animations switch.

   Responsive kits (flow, cycle, timeline, graph, bars, particles, tree)
   redraw to the real width of their box, so text stays the same size on
   a phone as on a laptop. They switch to a stacked/indented layout on
   narrow boxes. The diagram kit scales a drawing you supply. derive and
   annotate are HTML, so they wrap like normal text.

   Use in visuals.js:   Kit.flow("v-id", { …options… });
   Full reference:      docs/04-visual-kits.md
   ===================================================================== */
(function(){
const E=window.Engine, $=E.$, $$=E.$$, h=E.h;

/* ---------------------------------------------------------------- V */
const V=window.V={};
V.svg=id=>$("#"+id+" .viz-stage > svg")||$("#"+id);
V.put=(svg,html)=>svg.insertAdjacentHTML("beforeend",html);
V.clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
V.lerp=(a,b,t)=>a+(b-a)*t;
V.sm=(a,b,t)=>{const x=V.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x)};
V.arrow=(id,cls="f-arrow")=>`<defs><marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,1 L9.5,5 L0,9 z" class="${cls}"/></marker></defs>`;
V.show=(el,on)=>{if(!el)return;(el.length!=null?[...el]:[el]).forEach(e=>e.classList.toggle("hide",!on))};
V.dim=(el,on)=>{if(!el)return;(el.length!=null?[...el]:[el]).forEach(e=>e.classList.toggle("dim",!!on))};
V.lbl=(x,y,t,cls="",anchor="middle")=>`<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${t}</text>`;
V.wrap=(txt,max)=>{const safe=String(txt).replace(/^(\d+\.|[A-Za-z]\.|Step\s+\d+:?)\s+/,"$1\u00A0").replace(/(\[[^\]]{1,16}\]|\([^)]{1,16}\))/g,m=>m.replace(/ /g,"\u00A0")).replace(/([=≈≤≥≠∈→])\s+(\S+)/g,"$1\u00A0$2");const w=safe.split(" ");const out=[];let line="";w.forEach(x=>{if((line+" "+x).trim().length>max&&line){out.push(line);line=x}else line=(line+" "+x).trim()});if(line)out.push(line);return out};
/* tween helper that respects the Animations switch */
V.tween=(dur,fn,done)=>{if(!E.motionOn()){fn(1);done&&done();return()=>{}}let t0=null,stop=false;function f(now){if(stop)return;if(t0==null)t0=now;const t=Math.min(1,(now-t0)/dur);fn(t);if(t<1)requestAnimationFrame(f);else done&&done()}requestAnimationFrame(f);return()=>{stop=true}};
V.ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

/* @kit-start (build.py drops everything below when visuals.js never calls Kit.) */
/* ---------------------------------------------------------------- shared */
const Kit=window.Kit={version:"1.5"};
const PAL=i=>`var(--c${(i%6)+1})`;
const CW=(fs)=>fs*.55;                                   // average character width in px
const fit=(t,w,fs)=>V.wrap(t,Math.max(6,Math.floor(w/CW(fs))));
const tlines=(x,y,lines,cls,lh,anchor="start")=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?lh:0}">${l}</tspan>`).join("")}</text>`;
const escAttr=s=>String(s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const escHtml=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const roleKey=r=>{const k=E.ROLE_MAP&&E.ROLE_MAP[String(r||"").trim().toLowerCase()];return k&&k!=="s"?k:""};
const roleCol=(r,def)=>{const k=roleKey(r);return k?`var(--m-${k})`:def};
const roleAttr=r=>{const k=roleKey(r);return k?` data-role="${k}" style="--rc:var(--m-${k})"`:""};
const branchRole=txt=>{const s=String(txt||"").trim();if(/^(yes|true|pass|ok|valid|allow|accept|hit|match|ya|benar)\b/i.test(s))return "r";if(/^(no|false|fail|error|reject|block|deny|prune|cut|miss|tidak|salah)\b/i.test(s))return "k";return ""};
function pillSvg(x,y,txt,o={}){
  const s=String(txt||"").trim();if(!s)return "";
  const W=o.W||640,H=o.H||360,fs=o.fs||12,pw=Math.max(o.minW||32,Math.ceil(s.length*fs*.66)+22),ph=fs+14;
  const minX=o.minX??4,maxX=o.maxX??(W-4),minY=o.minY??4,maxY=o.maxY??(H-4);
  const px=V.clamp(x-pw/2,minX,Math.max(minX,maxX-pw)),py=V.clamp(y-ph/2,minY,Math.max(minY,maxY-ph));
  const rk=roleKey(o.role),st=o.color?`--rc:${o.color};`:rk?`--rc:var(--m-${rk});`:"";
  const cls=o.cls||"k-pill",tcls=o.tcls||"k-pill-t";
  return `<g${o.feat?` class="k-feat" data-feat="${escAttr(o.feat)}"`:""}${rk?` data-role="${rk}"`:""}${o.use?` data-use="${escAttr(o.use)}" data-uname="${escAttr(o.uname||s)}"`:""}${st?` style="${st}"`:""}><rect class="${cls}${o.on?" on":""}" x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw}" height="${ph}" rx="${(ph/2).toFixed(1)}"/><text class="${tcls}" x="${(px+pw/2).toFixed(1)}" y="${(py+ph/2+fs*.35).toFixed(1)}" text-anchor="middle">${escHtml(s)}</text></g>`;
}
function placeClearPill(mx,my,txt,boxes,placed,W,H,fs=10.5,minW=28){
  const s=String(txt||"").trim(),pw=Math.max(minW,Math.ceil(s.length*fs*.66)+22),ph=fs+14;
  const cands=[[0,0],[0,-20],[0,20],[0,-34],[0,34],[26,0],[-26,0],[24,-22],[-24,-22],[24,22],[-24,22],[0,-50],[0,50],[0,-66],[0,66]];
  const hit=(r,a)=>r.x1<a.x2&&r.x2>a.x1&&r.y1<a.y2&&r.y2>a.y1;
  let best=null,bestCost=1e9;
  for(const [dx,dy] of cands){
    const cx=V.clamp(mx+dx,8+pw/2,Math.max(8+pw/2,W-8-pw/2));
    const cy=V.clamp(my+dy,8+ph/2,Math.max(8+ph/2,H-8-ph/2));
    const r={x1:cx-pw/2-3,y1:cy-ph/2-3,x2:cx+pw/2+3,y2:cy+ph/2+3};
    const hb=boxes.filter(b=>hit(r,b)).length,hp=placed.filter(p=>hit(r,p)).length;
    const cost=hb*100+hp*25+Math.hypot(cx-mx,cy-my)*.05;
    if(cost<bestCost){bestCost=cost;best={x:cx,y:cy,pw,ph,moved:dx!==0||dy!==0,r};if(hb===0&&hp===0)break}
  }
  placed.push(best.r);
  return best;
}
function prepEdgeLengths(svg){
  svg.querySelectorAll(".k-tree-edge,.k-dep-edge,.k-dag-edge").forEach(p=>{
    try{const l=p.getTotalLength();if(l)p.style.setProperty("--plen",String(Math.ceil(l)+4))}catch(_){}
  });
}
function swatchSvg(kind="dot"){
  if(kind==="line")return `<svg class="ic" viewBox="0 0 14 10" aria-hidden="true"><line x1="1" y1="5" x2="13" y2="5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  if(kind==="dash")return `<svg class="ic" viewBox="0 0 14 10" aria-hidden="true"><line x1="1" y1="5" x2="13" y2="5" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2.5" stroke-linecap="round"/></svg>`;
  if(kind==="area")return `<svg class="ic" viewBox="0 0 14 10" aria-hidden="true"><rect x="1" y="1.5" width="12" height="7" rx="2" fill="currentColor" fill-opacity=".28" stroke="currentColor" stroke-width="1.3"/></svg>`;
  if(kind==="vec")return `<svg class="ic" viewBox="0 0 14 10" aria-hidden="true"><path d="M1 5h9M7.5 2l3.5 3-3.5 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  if(kind==="open")return `<svg class="ic" viewBox="0 0 14 10" aria-hidden="true"><circle cx="7" cy="5" r="3.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
  if(kind==="dia")return `<svg class="ic" viewBox="0 0 14 10" aria-hidden="true"><polygon points="7,1 11,5 7,9 3,5" fill="currentColor"/></svg>`;
  if(kind==="box")return `<svg class="ic" viewBox="0 0 14 10" aria-hidden="true"><rect x="1.5" y="1.5" width="11" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`;
  if(kind==="cut")return `<svg class="ic" viewBox="0 0 14 10" aria-hidden="true"><path d="M2 8L12 2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  return `<svg class="ic" viewBox="0 0 14 10" aria-hidden="true"><circle cx="7" cy="5" r="3.5" fill="currentColor"/></svg>`;
}
function mountAnatomy(S,o={}){
  const leg=h("div",{class:"k-legend",role:"group","aria-label":"Visual key"});
  const useBox=h("div",{class:"k-use","aria-live":"polite"});
  let items=[],defUse=o.defaultUse||E.t("tap_inspect");
  const showUse=(title,text,color)=>{
    if(!useBox.parentNode)return;
    const msg=text||(title?"":defUse);
    if(!title&&!msg){useBox.hidden=true;useBox.innerHTML="";return}
    useBox.hidden=false;
    const st=color?` style="--rc:${color}"`:"";
    useBox.innerHTML=title?`<b${st}>${escHtml(title)}</b><span>${escHtml(msg||"")}</span>`:`<span>${escHtml(msg)}</span>`;
  };
  function setItems(list){
    items=(list||[]).filter(Boolean);
    if(!items.length){leg.hidden=true;leg.innerHTML="";return}
    leg.hidden=false;
    leg.innerHTML=items.map(it=>{
      const rk=roleKey(it.role),c=it.color||(rk?`var(--m-${rk})`:"var(--pc)");
      return `<button type="button" class="k-leg-item" style="--rc:${c}"${rk?` data-role="${rk}"`:""}${it.feat?` data-feat="${escAttr(it.feat)}"`:""}${it.use?` data-use="${escAttr(it.use)}"`:""} aria-pressed="false"><span class="k-sw-ic">${swatchSvg(it.swatch||"dot")}</span><span>${escHtml(it.label)}</span></button>`;
    }).join("");
    if(!useBox.innerHTML)showUse(null,defUse);
  }
  function wire(svg){
    if(!svg||svg._anWired)return;svg._anWired=true;
    const pick=el=>{
      if(!el)return;
      const title=el.dataset.uname||el.dataset.part||el.textContent.trim().split("\n")[0].slice(0,28);
      const u=el.dataset.use||"";
      const rk=roleKey(el.dataset.role),c=rk?`var(--m-${rk})`:el.style.getPropertyValue("--rc")||"var(--pc)";
      if(u)showUse(title,u,c);
    };
    svg.addEventListener("pointerover",e=>{const el=e.target.closest("[data-use]");if(el)pick(el)});
    svg.addEventListener("click",e=>{const el=e.target.closest("[data-use]");if(el&&!svg._camDragged)pick(el)});
    svg.addEventListener("pointerleave",()=>{const sc=S.stage.closest(".sec,.beat")||S.stage.closest(".viz");if(!sc?.dataset.pinRole&&!sc?.dataset.pinFeat)showUse(null,defUse)});
    svg.addEventListener("focusin",e=>{const el=e.target.closest("[data-use]");if(el)pick(el)});
  }
  leg.addEventListener("pointerover",e=>{const b=e.target.closest(".k-leg-item");if(b&&b.dataset.use)showUse(b.textContent.trim(),b.dataset.use,b.style.getPropertyValue("--rc"))});
  leg.addEventListener("click",e=>{const b=e.target.closest(".k-leg-item");if(b&&b.dataset.use)showUse(b.textContent.trim(),b.dataset.use,b.style.getPropertyValue("--rc"))});
  const hasUse=!!(o.showUse);
  S.stage.prepend(leg);
  if(hasUse||o.legend)S.stage.append(useBox);
  leg.hidden=true;
  useBox.hidden=true;
  if(Array.isArray(o.legend)&&o.legend.length)setItems(o.legend);
  return {leg,useBox,setItems,showUse,wire,ensureUse(){if(useBox.hidden){useBox.hidden=false;if(!useBox.parentNode)S.stage.append(useBox);showUse(null,defUse)}}};
}
function mountTabs(S,tabs,onPick){
  if(!tabs||tabs.length<2)return null;
  const bar=h("div",{class:"k-tabs segc",role:"group","aria-label":"Examples"});
  bar.innerHTML=tabs.map((tb,i)=>`<button type="button" data-tab="${i}" aria-pressed="${i===0}">${escHtml(tb.label||tb.t||("Mode "+(i+1)))}</button>`).join("");
  S.stage.prepend(bar);
  bar.addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(!b)return;const idx=+b.dataset.tab;
    $$("button",bar).forEach((x,j)=>x.setAttribute("aria-pressed",String(j===idx)));onPick(idx);
  });
  return {bar,set(idx){$$("button",bar).forEach((x,j)=>x.setAttribute("aria-pressed",String(j===idx)))}};
}
function mountCamera(S,svg,opts={}){
  svg.classList.add("k-cam");
  let mode="auto",natW=640,natH=360,viewW=640,enabled=true,verticalOnly=false,targetAR=640/360,boxes=[],curVB=null,stopTw=null;
  let userZoom=1,panX=0,panY=0,lastBox=null,lastIsOv=false;
  const bar=h("div",{class:"k-cam-bar",role:"group","aria-label":"View zoom"},
    `<button type="button" class="k-cam-btn" data-cam="auto" aria-pressed="true">Auto</button>`+
    `<button type="button" class="k-cam-btn" data-cam="zoom" aria-pressed="false">Zoomed</button>`+
    `<button type="button" class="k-cam-btn" data-cam="all" aria-pressed="false">Overview</button>`+
    `<span class="k-cam-sep" aria-hidden="true"></span>`+
    `<button type="button" class="k-cam-btn k-cam-zbtn" data-cam="out" aria-label="Zoom out">−</button>`+
    `<span class="k-cam-z" hidden>100%</span>`+
    `<button type="button" class="k-cam-btn k-cam-zbtn" data-cam="in" aria-label="Zoom in">+</button>`
  );
  if(svg.parentNode===S.stage)S.stage.insertBefore(bar,svg);else S.stage.append(bar);
  const zBadge=$(".k-cam-z",bar);
  const setPressed=()=>{$$(".k-cam-btn[data-cam='auto'],.k-cam-btn[data-cam='zoom'],.k-cam-btn[data-cam='all']",bar).forEach(b=>b.setAttribute("aria-pressed",b.dataset.cam===mode?"true":"false"))};
  const syncBadge=active=>{if(!zBadge)return;zBadge.hidden=!active||userZoom<=1.01;zBadge.textContent=Math.round(userZoom*100)+"%"};
  const applyVB=vb=>{curVB=vb;svg.setAttribute("viewBox",vb.map(n=>n.toFixed(1)).join(" "))};
  const focus=(box,cfg={})=>{
    if(stopTw){stopTw();stopTw=null}
    if(!enabled){svg.dataset.camZoom="0";svg.classList.remove("is-zoomed");syncBadge(false);applyVB([0,0,natW,natH]);return}
    if(!cfg.keepManual){userZoom=1;panX=0;panY=0}
    lastBox=box;lastIsOv=!!cfg.isOverview;
    const isOv=!!cfg.isOverview,instant=!!cfg.instant;
    const effBox=box||(mode==="zoom"?{x1:natW*.18,y1:natH*.15,x2:natW*.82,y2:natH*.85}:null);
    const zoomActive=(!!effBox&&mode!=="all"&&!(mode==="auto"&&isOv))||(userZoom>1.01&&mode!=="all");
    let target;
    if(!zoomActive){
      target=[0,0,natW,natH];
    } else if(verticalOnly){
      const padY=42;
      let y1=Math.max(0,effBox.y1-padY),y2=Math.min(natH,effBox.y2+padY);
      if(y2-y1<Math.min(natH,330)){const c=(y1+y2)/2,h=Math.min(natH,340);y1=V.clamp(c-h/2,0,Math.max(0,natH-h));y2=y1+h}
      if(boxes.length){
        const topCut=boxes.find(b=>b.y1<y1&&b.y2>y1&&b.y2<=effBox.y1-2);
        if(topCut)y1=Math.min(effBox.y1-6,topCut.y2+3);
        const botCut=boxes.find(b=>b.y1<y2&&b.y2>y2&&b.y1>=effBox.y2+2);
        if(botCut)y2=Math.max(effBox.y2+6,botCut.y1-3);
      }
      let bw=natW/userZoom,bh=Math.max(120,(y2-y1)/userZoom);
      const cx=natW/2+panX,cy=(y1+y2)/2+panY;
      target=[V.clamp(cx-bw/2,0,Math.max(0,natW-bw)),V.clamp(cy-bh/2,0,Math.max(0,natH-bh)),bw,bh];
    } else {
      const isPhone=viewW<540;
      const padX=isPhone?14:52,padY=isPhone?16:42;
      const minW=isPhone?Math.min(natW,Math.max(225,viewW*.86)):Math.min(natW,Math.max(410,natW*.42));
      const anc=cfg.anchor||effBox;
      const ancW=(anc.x2-anc.x1)+padX*2;
      const maxPhoneW=isPhone?Math.min(natW,Math.max(minW,ancW,Math.floor(viewW*1.18))):natW;
      let bw=Math.min(natW,maxPhoneW,Math.max(minW,(effBox.x2-effBox.x1)+padX*2));
      let bh=Math.min(natH,Math.max(isPhone?170:minW/targetAR,(effBox.y2-effBox.y1)+padY*2));
      const ar=isPhone?V.clamp(bw/Math.max(1,bh),.68,1.24):targetAR;
      if(bw/bh<ar)bw=Math.min(natW,Math.max(maxPhoneW,bw),bh*ar);
      if(bw/bh>ar)bh=Math.min(natH,bw/ar);
      bw=Math.min(natW,Math.max(bw,ancW));bh=Math.min(natH,bh);
      if(userZoom>1.01){bw=Math.max(140,bw/userZoom);bh=Math.max(110,bh/userZoom)}
      const cx=(anc.x1+anc.x2)/2+panX,cy=(anc.y1+anc.y2)/2+panY;
      const vx=V.clamp(cx-bw/2,0,Math.max(0,natW-bw));
      const vy=V.clamp(cy-bh/2,0,Math.max(0,natH-bh));
      target=[vx,vy,bw,bh];
    }
    svg.dataset.camZoom=zoomActive?"1":"0";
    svg.classList.toggle("is-zoomed",zoomActive);
    syncBadge(zoomActive);
    if(instant||!curVB||!E.motionOn()){applyVB(target);return}
    const from=[...curVB];
    stopTw=V.tween(420,p=>{const t=V.ease(p);applyVB(from.map((a,k)=>a+(target[k]-a)*t))},()=>{stopTw=null});
  };
  bar.addEventListener("click",e=>{const b=e.target.closest(".k-cam-btn");if(!b)return;
    const act=b.dataset.cam;
    if(act==="in"||act==="out"){
      if(act==="in"&&mode==="all"){mode="zoom";userZoom=1.35;setPressed()}
      else userZoom=V.clamp(+(userZoom+(act==="in"?.35:-.35)).toFixed(2),1,2.4);
      if(act==="out"&&userZoom<=1.01){panX=0;panY=0}
      focus(lastBox,{isOverview:lastIsOv&&mode==="auto",instant:false,keepManual:true});
      return;
    }
    if(act===mode&&userZoom<=1.01&&!panX&&!panY)return;
    mode=act;userZoom=1;panX=0;panY=0;setPressed();
    if(opts.onMode)opts.onMode(mode);
  });
  const pts=new Map();let pState=null;
  svg.addEventListener("pointerdown",e=>{
    if(e.button>0||svg.dataset.camZoom!=="1"||!curVB)return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){pState={kind:"pan",id:e.pointerId,x0:e.clientX,y0:e.clientY,vb:[...curVB],moved:false}}
    else if(pts.size===2){const a=[...pts.values()];pState={kind:"pinch",d0:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z0:userZoom,vb:[...curVB]}}
  });
  svg.addEventListener("pointermove",e=>{
    if(!pts.has(e.pointerId)||!pState)return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const r=svg.getBoundingClientRect();if(!r.width||!r.height)return;
    if(pState.kind==="pan"&&pts.size===1){
      const dx=e.clientX-pState.x0,dy=e.clientY-pState.y0;
      if(!pState.moved&&Math.hypot(dx,dy)<6)return;
      if(!pState.moved){pState.moved=true;svg._camDragged=true;svg.classList.add("is-dragging");if(stopTw){stopTw();stopTw=null}}
      const sdx=dx*(pState.vb[2]/r.width),sdy=dy*(pState.vb[3]/r.height);
      const nx=V.clamp(pState.vb[0]-sdx,0,Math.max(0,natW-pState.vb[2]));
      const ny=V.clamp(pState.vb[1]-sdy,0,Math.max(0,natH-pState.vb[3]));
      panX+=(nx-curVB[0]);panY+=(ny-curVB[1]);
      applyVB([nx,ny,pState.vb[2],pState.vb[3]]);
    } else if(pState.kind==="pinch"&&pts.size===2){
      const a=[...pts.values()],d1=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
      if(pState.d0>10){
        svg._camDragged=true;
        userZoom=V.clamp(+(pState.z0*(d1/pState.d0)).toFixed(2),1,2.4);
        focus(lastBox,{isOverview:false,instant:true,keepManual:true});
      }
    }
  });
  const endPtr=e=>{pts.delete(e.pointerId);if(!pts.size){svg.classList.remove("is-dragging");pState=null;if(svg._camDragged)setTimeout(()=>{svg._camDragged=false},60)}};
  svg.addEventListener("pointerup",endPtr);svg.addEventListener("pointercancel",endPtr);
  return {
    bar,
    get mode(){return mode},
    setNatural(w,h,cfg={}){natW=w;natH=h;viewW=cfg.viewW||w;enabled=cfg.enabled!==false;verticalOnly=!!(cfg.verticalOnly??cfg.narrow);targetAR=cfg.targetAR||(w/Math.max(1,h));boxes=cfg.boxes||[];bar.hidden=!enabled;if(!curVB||!enabled){applyVB([0,0,natW,natH]);if(!enabled){svg.dataset.camZoom="0";svg.classList.remove("is-zoomed");syncBadge(false)}}},
    focus
  };
}
let uid=0;
function setup(id,kind){
  const viz=document.getElementById(id);
  if(!viz){console.warn(`Kit.${kind}: no element with id "${id}" in content.html`);return null}
  viz.classList.add("viz","kit","kit-"+kind);
  let stage=$(".viz-stage",viz);if(!stage){stage=h("div",{class:"viz-stage"});viz.prepend(stage)}
  return {viz,stage,uid:"k"+(++uid)};
}
function svgIn(S,alt,cls=""){let svg=$(":scope > svg",S.stage);if(!svg){S.stage.insertAdjacentHTML("beforeend",`<svg class="${cls}" role="img" aria-label="${(alt||"").replace(/"/g,"&quot;")}"></svg>`);svg=$(":scope > svg",S.stage)}return svg}
/* measure the box and redraw when it changes size (phone ↔ laptop, scroll ↔ explainer). */
function responsive(S,layout,box){
  const el=box||$(":scope > svg",S.stage)||S.stage;
  const width=()=>{const w=el.getBoundingClientRect().width;return w<60?0:Math.max(260,Math.min(1100,Math.round(w)))};
  let last=0;const run=()=>{const w=width();if(!w)return;if(Math.abs(w-last)>6){last=w;layout(w)}};
  new ResizeObserver(run).observe(box||S.stage);
  const w=width();layout(last=w||640);
}
const markers=(u,col="")=>`<defs><marker id="${u}-on" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="9.5" markerHeight="9.5" orient="auto-start-reverse"><path d="M0,1 L9.5,5 L0,9 z" class="k-head on"${col?` style="fill:${col}"`:""}/></marker><marker id="${u}-off" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="9.5" markerHeight="9.5" orient="auto-start-reverse"><path d="M0,1 L9.5,5 L0,9 z" class="k-head"/></marker></defs>`;
const edgeMarkers=(u,roles=[])=>`<defs>`+
  `<marker id="${u}-on" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,1 L9.5,5 L0,9 z" class="k-head on"/></marker>`+
  `<marker id="${u}-off" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,1 L9.5,5 L0,9 z" class="k-head"/></marker>`+
  roles.map(rk=>`<marker id="${u}-on-${rk}" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,1 L9.5,5 L0,9 z" class="k-head on" style="fill:var(--m-${rk})"/></marker><marker id="${u}-off-${rk}" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,1 L9.5,5 L0,9 z" class="k-head" style="fill:var(--m-${rk});opacity:.55"/></marker>`).join("")+
  `</defs>`;
const stepsOr=(o,def)=>(o.steps&&o.steps.length?o.steps:def);
function ctlRange(S,key,c,onInput){
  let ctl=$(".ctl",S.viz);if(!ctl){ctl=h("div",{class:"ctl"});S.viz.appendChild(ctl)}
  const id=S.uid+"-"+key,dp=c.dp??(String(c.step||1).split(".")[1]||"").length,fmt=c.fmt||(v=>(+v).toFixed(dp).replace("-","−")+(c.unit||""));
  const w=h("div",{},`<label for="${id}">${c.label||key} <output id="${id}-o"></output></label><input id="${id}" type="range" min="${c.min}" max="${c.max}" step="${c.step||1}" value="${c.value}">`);
  ctl.appendChild(w);const inp=$("input",w),out=$("output",w);
  const set=v=>{inp.value=v;out.textContent=fmt(v);E.rangeFill(inp)};
  inp.addEventListener("input",()=>{out.textContent=fmt(inp.value);onInput(+inp.value)});set(c.value);return set;
}
function nice(span,target){const raw=span/target,p=Math.pow(10,Math.floor(Math.log10(raw))),m=raw/p;return (m<1.5?1:m<3?2:m<7?5:10)*p}
const num=v=>{const r=Math.round(v*100)/100;return String(r).replace("-","−")};

/* =================================================================
   1. diagram — your own drawing; steps light up its parts
   ================================================================= */
Kit.diagram=(id,o)=>{
  const S=setup(id,"diagram");if(!S)return;
  const svg=svgIn(S,o.alt);
  if(o.vb)svg.setAttribute("viewBox",o.vb);
  if(o.svg)V.put(svg,o.svg);
  const partsMeta=o.parts||{};
  const parts=$$("[data-part]",svg),labels=$$("[data-label]",svg),builds=$$("[data-step]",svg),onlys=$$("[data-only]",svg);
  labels.forEach(l=>l.classList.add("fade"));
  const steps=stepsOr(o,[{t:"Overview",d:""}]);
  const hasMeta=!!(Object.keys(partsMeta).length||o.legend);
  const an=hasMeta?mountAnatomy(S,{showUse:true,legend:o.legend}):null;
  parts.forEach(p=>{
    const key=p.dataset.part,m=partsMeta[key];
    if(m){
      const rk=roleKey(m.role);
      if(rk){p.dataset.role=rk;p.style.setProperty("--rc",`var(--m-${rk})`)}
      if(m.use){p.dataset.use=m.use;p.dataset.uname=m.label||key}
    }
    if(steps.some(s=>s.focus&&s.focus.includes(key))||(m&&m.use)){
      p.classList.add("clickable");p.setAttribute("tabindex","0");p.setAttribute("role","button");
      if(m&&m.label)p.setAttribute("aria-label",m.label);
    }
  });
  if(an){
    const list=o.legend||Object.entries(partsMeta).map(([k,m])=>({feat:k,role:m.role,label:m.label||k,use:m.use,color:m.color,swatch:m.swatch||"box"}));
    an.setItems(list);an.wire(svg);
  }
  const player=E.stepper(S.viz,steps,(i)=>{const s=steps[i],f=s.focus;
    parts.forEach(p=>{
      const hit=!f||f.includes(p.dataset.part);
      p.classList.toggle("k-faint",!!f&&!hit);
      p.classList.toggle("k-active",!!f&&hit);
    });
    const L=s.labels||f||[];labels.forEach(l=>l.classList.toggle("hide",!L.includes(l.dataset.label)));
    builds.forEach(b=>{const vis=i>=+b.dataset.step,was=b.classList.contains("hide");b.classList.toggle("hide",!vis);if(vis&&was&&E.motionOn())b.classList.add("k-pop")});
    onlys.forEach(b=>{const vis=b.dataset.only.split(",").map(Number).includes(i),was=b.classList.contains("hide");b.classList.toggle("hide",!vis);if(vis&&was&&E.motionOn())b.classList.add("k-pop")});
    if(an&&f&&f.length){const pk=f[f.length-1];if(partsMeta[pk]?.use)an.showUse(partsMeta[pk].label||pk,partsMeta[pk].use,roleCol(partsMeta[pk].role,"var(--pc)"))}
    if(o.on)o.on(i,svg,s);},{ms:o.ms});
  const jumpPart=el=>{
    const key=el.dataset.part;if(!key)return;
    const si=steps.findIndex(s=>s.focus&&s.focus.includes(key));
    if(si>=0){player.stop();player.show(si)}
    if(an&&partsMeta[key]?.use)an.showUse(partsMeta[key].label||key,partsMeta[key].use,roleCol(partsMeta[key].role,"var(--pc)"));
  };
  svg.addEventListener("click",e=>{const p=e.target.closest("[data-part].clickable");if(p)jumpPart(p)});
  svg.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-part].clickable")){e.preventDefault();jumpPart(e.target)}});
  return player;
};

/* =================================================================
   2. flow — a process: boxes joined by arrows, lit one step at a time
   ================================================================= */
Kit.flow=(id,o)=>{
  const S=setup(id,"flow");if(!S)return;
  const svg=svgIn(S,o.alt),N=o.nodes,n=N.length;
  const idx=k=>typeof k==="number"?k:N.findIndex(x=>x.id===k);
  const edges=(o.edges||N.slice(1).map((_,i)=>[i,i+1])).map(e=>[idx(e[0]),idx(e[1]),e[2]||"",e[3]||branchRole(e[2])]);
  const steps=stepsOr(o,N.map((nd,i)=>({t:nd.t,d:nd.d||nd.use||"",on:[i]})));
  const hasMeta=!!(o.legend||N.some(nd=>nd.role||nd.kind||nd.use));
  const an=hasMeta?mountAnatomy(S,{showUse:N.some(nd=>nd.use),legend:o.legend}):null;
  if(an){
    const roleNames={v:"Input / Data",c:"Decision / Param",f:"Process / Rule",g:"Group / Stage",r:"Output / Success",k:"Error / Reject",a:"Aux / Accent"};
    const list=o.legend||[...new Map(N.filter(nd=>nd.role).map(nd=>[roleKey(nd.role),{role:roleKey(nd.role),label:roleNames[roleKey(nd.role)]||nd.role,swatch:nd.kind==="decision"?"dia":"box",use:nd.use||""}])).values()];
    an.setItems(list);an.wire(svg);
  }
  const kindGlyph={start:"●",input:"▶",process:"⚙",decision:"◆",output:"✓",error:"✕",end:"■"};
  const hasEquiv=!!(o.equiv||steps.some(s=>s.equiv));
  const equivEl=hasEquiv?h("div",{class:"k-flow-equiv","aria-live":"polite"}):null;
  if(equivEl)S.stage.append(equivEl);
  let cur=0,player=null;
  function layout(W){
    const chain=edges.every(([a,b])=>b===a+1);
    const minNodeW=Math.min(250,Math.max(190,...N.map(nd=>{const first=(nd.t||"").replace(/^(\d+\.)\s+/,"$1\u00A0").split(" ")[0];return Math.ceil(first.length*CW(15))+38})));
    let cols=Math.max(1,Math.min(o.cols||4,n,Math.floor((W+36)/(minNodeW+28))));
    if(chain&&W<540)cols=1;else if(!chain&&n>1)cols=Math.max(2,cols);
    const labW=Math.max(0,...edges.map(e=>e[2]?e[2].length*8+32:0));
    const gap=cols>1?Math.max(labW,Math.min(68,Math.max(44,(W-cols*150)/(cols-1)*.38))):0;
    const bw=Math.min(o.boxWidth||240,(W-8-(cols-1)*gap)/cols);
    const ox=(W-(cols*bw+(cols-1)*gap))/2;
    const wr=N.map(nd=>({t:fit(nd.t,bw-34,15),s:nd.sub?fit(nd.sub,bw-34,13):[]}));
    const hh=wr.map((w,i)=>16+(N[i].kind?15:0)+w.t.length*19+(w.s.length?3+w.s.length*17:0)+(N[i].tag?32:0)+14);
    const rows=Math.ceil(n/cols),rowH=[];for(let r=0;r<rows;r++)rowH[r]=Math.max(...hh.slice(r*cols,r*cols+cols));
    const vg=cols===1?42:58;let y=10;const P=[];
    for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){const i=r*cols+c;if(i>=n)break;P[i]={x:ox+c*(bw+gap),y,w:bw,h:rowH[r],r,c}}y+=rowH[r]+vg}
    const sameRowSkip=edges.some(([a,b])=>P[a]&&P[b]&&P[a].r===P[b].r&&Math.abs(P[a].c-P[b].c)>1&&P[a].r===rows-1);
    const H=y-vg+(sameRowSkip?42:12);svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    const edgeCols=[...new Set(edges.map(e=>roleKey(e[3])).filter(Boolean))];
    let s=edgeMarkers(S.uid,edgeCols);
    const flowBoxes=P.map(p=>p?({x1:p.x-2,y1:p.y-2,x2:p.x+p.w+2,y2:p.y+p.h+2}):null).filter(Boolean),flowPlaced=[];
    let edgePills="";
    edges.forEach(([a,b,lab,er],k)=>{const A=P[a],B=P[b];if(!A||!B)return;let d,mx,my;
      const down=B.r>A.r,ax=A.x+A.w/2,bx=B.x+B.w/2,ay=down?A.y+A.h:A.y,by=down?B.y-1.5:B.y+B.h+1.5;
      if(A.r===B.r&&B.c===A.c+1){d=`M${A.x+A.w},${A.y+A.h/2} H${B.x-1.5}`;mx=(A.x+A.w+B.x)/2;my=A.y+A.h/2}
      else if(A.r===B.r&&B.c===A.c-1){d=`M${A.x},${A.y+A.h/2} H${B.x+B.w+1.5}`;mx=(A.x+B.x+B.w)/2;my=A.y+A.h/2}
      else if(A.r===B.r){const ym=A.y+A.h+vg/2;d=`M${ax},${A.y+A.h} V${ym} H${bx} V${B.y+B.h+1.5}`;mx=(ax+bx)/2;my=ym}
      else if(Math.abs(B.r-A.r)===1){
        if(Math.abs(ax-bx)<1){d=`M${ax},${ay} V${by}`;mx=ax;my=(ay+by)/2}
        else{const ym=down?A.y+A.h+vg/2:A.y-vg/2;d=`M${ax},${ay} V${ym} H${bx} V${by}`;mx=(ax+bx)/2;my=ym}
      } else {
        const cx=A.c<cols-1?A.x+A.w+gap/2:A.x-gap/2,y1=down?A.y+A.h+vg/2:A.y-vg/2,y2=down?B.y-vg/2:B.y+B.h+vg/2;
        d=`M${ax},${ay} V${y1} H${cx} V${y2} H${bx} V${by}`;mx=cx;my=(y1+y2)/2;
      }
      const erk=roleKey(er);
      s+=`<path class="k-edge" data-e="${k}"${erk?` data-er="${erk}" style="--rc:var(--m-${erk})"`:""} d="${d}"/>`;
      if(lab){const pl=placeClearPill(mx,my,lab,flowBoxes,flowPlaced,W,H,11.5,30);edgePills+=pillSvg(pl.x,pl.y,lab,{W,H,fs:11.5,cls:"k-epill",tcls:"k-epill-t",role:erk,minW:30})}
    });
    N.forEach((nd,i)=>{const p=P[i],w=wr[i],rk=roleKey(nd.role),rc=nd.color||(rk?`var(--m-${rk})`:"var(--pc)");
      const rx=nd.kind==="start"||nd.kind==="end"?20:14,kOff=nd.kind?15:0;
      const gId=S.uid+"-nc"+i;
      let t=`<g class="k-n clickable" data-i="${i}" tabindex="0" role="button" aria-label="${escAttr(nd.t)}"${rk?` data-role="${rk}"`:""}${nd.use?` data-use="${escAttr(nd.use)}" data-uname="${escAttr(nd.t)}"`:""} style="--rc:${rc}">`;
      t+=`<clipPath id="${gId}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx}"/></clipPath>`;
      t+=`<rect class="k-node" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx}"/>`;
      t+=`<rect class="k-accent" x="${p.x}" y="${p.y}" width="5.5" height="${p.h}" clip-path="url(#${gId})"/>`;
      if(nd.kind)t+=`<text class="k-kind" x="${p.x+15}" y="${p.y+21}">${kindGlyph[nd.kind]||"•"} ${escHtml(nd.kind.toUpperCase())}</text>`;
      t+=tlines(p.x+15,p.y+27+kOff,w.t,"k-t",19);
      if(w.s.length)t+=tlines(p.x+15,p.y+27+kOff+w.t.length*19+2,w.s,"k-s",17);
      if(nd.tag){const tw=Math.min(p.w-28,Math.ceil(nd.tag.length*8)+22);t+=`<g class="k-tag"><rect x="${p.x+15}" y="${p.y+p.h-38}" width="${tw}" height="24" rx="12"/><text class="k-c" x="${p.x+26}" y="${p.y+p.h-21.5}">${escHtml(nd.tag)}</text></g>`;}
      s+=t+"</g>"});
    s+=edgePills;svg.innerHTML=s;render(cur);
  }
  function render(i){cur=i;const s=steps[i]||{},on=(s.on||[i]).map(idx),reach=Math.max(...on,s.upTo!=null?idx(s.upTo):-1);
    $$(".k-n",svg).forEach(g=>{const k=+g.dataset.i;g.classList.toggle("on",on.includes(k));g.classList.toggle("done",k<=reach&&!on.includes(k));g.classList.toggle("todo",k>reach)});
    edges.forEach(([a,b,,er],k)=>{const lit=a<=reach&&b<=reach,into=on.includes(b)&&a<=reach,erk=roleKey(er);
      $$(`[data-e="${k}"]`,svg).forEach(e=>{e.classList.toggle("done",lit);e.classList.toggle("todo",!lit);e.classList.toggle("flowline",into&&e.tagName==="path");if(e.tagName==="path")e.setAttribute("marker-end",`url(#${S.uid}-${lit?(erk?"on-"+erk:"on"):"off"})`)})});
    if(equivEl){const eq=s.equiv!=null?s.equiv:o.equiv;equivEl.innerHTML=eq?Kit.math(eq):"";equivEl.hidden=!eq}
    if(an&&on.length===1&&N[on[0]]?.use)an.showUse(N[on[0]].t,N[on[0]].use,roleCol(N[on[0]].role,"var(--pc)"));
    if(o.on)o.on(i,svg,s);}
  const jumpNode=g=>{if(svg._camDragged)return;const k=+g.dataset.i,si=steps.findIndex(s=>(s.on||[]).map(idx).includes(k));if(si>=0&&player){player.stop();player.show(si)}if(an&&N[k]?.use)an.showUse(N[k].t,N[k].use,roleCol(N[k].role,"var(--pc)"))};
  svg.addEventListener("click",e=>{const g=e.target.closest(".k-n");if(g)jumpNode(g)});
  svg.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".k-n")){e.preventDefault();jumpNode(e.target)}});
  responsive(S,layout);
  player=E.stepper(S.viz,steps,i=>render(i),{ms:o.ms});
  return player;
};

/* =================================================================
   3. cycle — a loop of stages (Krebs, water cycle, business cycle…)
   ================================================================= */
Kit.cycle=(id,o)=>{
  const S=setup(id,"cycle");if(!S)return;
  const svg=svgIn(S,o.alt),N=o.nodes,n=N.length;
  const steps=stepsOr(o,N.map((nd,i)=>({t:nd.t,d:nd.d||nd.use||"",on:[i]})));
  const hasMeta=!!(o.legend||N.some(nd=>nd.role||nd.use));
  const an=hasMeta?mountAnatomy(S,{showUse:N.some(nd=>nd.use),legend:o.legend}):null;
  if(an){
    const list=o.legend||[...new Map(N.filter(nd=>nd.role).map(nd=>[roleKey(nd.role),{role:roleKey(nd.role),label:nd.t,swatch:"ring",use:nd.use||""}])).values()];
    an.setItems(list);an.wire(svg);
  }
  let cur=0,P=[],player=null;
  function layout(W){
    let s=markers(S.uid);
    if(W>=500){
      const bw=Math.min(176,W*.27),H=Math.round(Math.min(480,Math.max(350,W*.66))),cx=W/2,cy=H/2,rx=Math.min(W/2-bw/2-12,260),ry=H/2-50;
      P=N.map((nd,i)=>{const a=-Math.PI/2+2*Math.PI*i/n;const w=fit(nd.t,bw-24,14.5),sb=nd.sub?fit(nd.sub,bw-24,12.5):[];const hh=14+w.length*18+(sb.length?sb.length*16+4:0)+10;return {x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a),a,w,sb,hh}});
      svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      for(let i=0;i<n;i++){const a1=P[i].a+.32,a2=P[i].a+2*Math.PI/n-.32,am=(a1+a2)/2;const x1=cx+rx*Math.cos(a1),y1=cy+ry*Math.sin(a1),x2=cx+rx*Math.cos(a2),y2=cy+ry*Math.sin(a2);
        const rc=roleCol(N[i].role,"var(--pc)");
        s+=`<path class="k-edge" data-e="${i}" style="--rc:${rc}" d="M${x1.toFixed(1)},${y1.toFixed(1)} A${rx},${ry} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}"/>`;
        const elab=o.edges&&o.edges[i];
        if(elab)s+=pillSvg(cx+rx*Math.cos(am),cy+ry*Math.sin(am),elab,{W,H,fs:11,cls:"k-epill",tcls:"k-epill-t",role:N[i].role,minW:28});
      }
      if(o.center){const ct=fit(o.center.t,rx*1.05,17),cs=o.center.sub?fit(o.center.sub,rx*1.15,13):[];s+=tlines(cx,cy-((ct.length+cs.length)*18)/2+14,ct,"k-big",22,"middle")+(cs.length?tlines(cx,cy-((ct.length+cs.length)*18)/2+14+ct.length*22,cs,"k-s",17,"middle"):"")}
      P.forEach((p,i)=>{const nd=N[i],bx=p.x-bw/2,by=p.y-p.hh/2,rk=roleKey(nd.role),rc=nd.color||(rk?`var(--m-${rk})`:"var(--pc)");
        s+=`<g class="k-n clickable" data-i="${i}" tabindex="0" role="button" aria-label="${escAttr(nd.t)}"${rk?` data-role="${rk}"`:""}${nd.use?` data-use="${escAttr(nd.use)}" data-uname="${escAttr(nd.t)}"`:""} style="--rc:${rc}"><rect class="k-node" x="${bx}" y="${by}" width="${bw}" height="${p.hh}" rx="14"/><rect class="k-accent" x="${bx+16}" y="${by}" width="${bw-32}" height="4" rx="2"/>${tlines(p.x,by+27,p.w,"k-t",18,"middle")}${p.sb.length?tlines(p.x,by+27+p.w.length*18+2,p.sb,"k-s",16,"middle"):""}</g>`;p.cx=p.x;p.cy=by});
    } else {
      const bw=W-56,x0=8;let y=o.center?50:10;
      if(o.center)s+=tlines(x0,26,fit(o.center.t,W-16,16),"k-big",20)+(o.center.sub?`<text class="k-s" x="${x0}" y="44">${o.center.sub}</text>`:"");
      P=N.map((nd,i)=>{const w=fit(nd.t,bw-26,14.5),sb=nd.sub?fit(nd.sub,bw-26,12.5):[];const hh=14+w.length*18+(sb.length?sb.length*16+4:0)+10;const p={x:x0,y,w,sb,hh};y+=hh+32;return p});
      const H=y-18;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      for(let i=0;i<n;i++){const A=P[i],B=P[(i+1)%n],rc=roleCol(N[i].role,"var(--pc)");
        if(i<n-1){s+=`<path class="k-edge" data-e="${i}" style="--rc:${rc}" d="M${A.x+bw/2},${A.y+A.hh} V${B.y-1.5}"/>`;if(o.edges&&o.edges[i])s+=pillSvg(A.x+bw/2,A.y+A.hh+14,o.edges[i],{W,H,fs:11,cls:"k-epill",tcls:"k-epill-t",role:N[i].role,minW:28})}
        else s+=`<path class="k-edge" data-e="${i}" style="--rc:${rc}" d="M${A.x+bw},${A.y+A.hh/2} H${W-14} Q${W-4},${A.y+A.hh/2} ${W-4},${A.y+A.hh/2-10} V${B.y+B.hh/2+10} Q${W-4},${B.y+B.hh/2} ${W-14},${B.y+B.hh/2} H${A.x+bw+1.5}"/>`}
      P.forEach((p,i)=>{const nd=N[i],rk=roleKey(nd.role),rc=nd.color||(rk?`var(--m-${rk})`:"var(--pc)");
        s+=`<g class="k-n clickable" data-i="${i}" tabindex="0" role="button" aria-label="${escAttr(nd.t)}"${rk?` data-role="${rk}"`:""}${nd.use?` data-use="${escAttr(nd.use)}" data-uname="${escAttr(nd.t)}"`:""} style="--rc:${rc}"><rect class="k-node" x="${p.x}" y="${p.y}" width="${bw}" height="${p.hh}" rx="14"/><rect class="k-accent" x="${p.x}" y="${p.y+6}" width="4.5" height="${p.hh-12}" rx="2"/>${tlines(p.x+14,p.y+26,p.w,"k-t",18)}${p.sb.length?tlines(p.x+14,p.y+26+p.w.length*18+2,p.sb,"k-s",16):""}</g>`});
    }
    svg.innerHTML=s;render(cur);
  }
  function render(i){cur=i;const s=steps[i]||{},on=s.on||[i],reach=Math.max(...on);
    $$(".k-n",svg).forEach(g=>{const k=+g.dataset.i;g.classList.toggle("on",on.includes(k));g.classList.toggle("done",!on.includes(k)&&(s.all||k<=reach));g.classList.toggle("todo",!s.all&&k>reach)});
    $$(".k-edge",svg).forEach(e=>{const k=+e.dataset.e,lit=s.all||k<reach||(k===n-1&&s.loop);e.classList.toggle("done",lit);e.classList.toggle("todo",!lit);e.classList.toggle("flowline",on.includes((k+1)%n)&&(k<reach||s.loop||s.all));e.setAttribute("marker-end",`url(#${S.uid}-${lit?"on":"off"})`)});
    if(an&&on.length===1&&N[on[0]]?.use)an.showUse(N[on[0]].t,N[on[0]].use,roleCol(N[on[0]].role,"var(--pc)"));
    if(o.on)o.on(i,svg,s);}
  const jumpStage=g=>{const k=+g.dataset.i,si=steps.findIndex(s=>(s.on||[s._k]).includes(k));if(si>=0&&player){player.stop();player.show(si)}if(an&&N[k]?.use)an.showUse(N[k].t,N[k].use,roleCol(N[k].role,"var(--pc)"))};
  svg.addEventListener("click",e=>{const g=e.target.closest(".k-n");if(g)jumpStage(g)});
  svg.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".k-n")){e.preventDefault();jumpStage(e.target)}});
  responsive(S,layout);
  player=E.stepper(S.viz,steps,i=>render(i),{ms:o.ms});
  return player;
};

/* =================================================================
   4. timeline — events in order (history, literature, science)
   ================================================================= */
Kit.timeline=(id,o)=>{
  const S=setup(id,"timeline");if(!S)return;
  const svg=svgIn(S,o.alt),Ev=o.events,n=Ev.length;
  const steps=stepsOr(o,Ev.map((e,i)=>({t:`${e.date} · ${e.t}`,d:e.d||e.sub||e.use||"",on:[i]})));
  const hasMeta=!!(o.legend||Ev.some(e=>e.role||e.use));
  const an=hasMeta?mountAnatomy(S,{showUse:Ev.some(e=>e.use),legend:o.legend}):null;
  if(an){
    const list=o.legend||[...new Map(Ev.filter(e=>e.role).map(e=>[roleKey(e.role),{role:roleKey(e.role),label:e.tag||e.date,swatch:"dot",use:e.use||""}])).values()];
    an.setItems(list);an.wire(svg);
  }
  let cur=0,Xs=[],Ys=[],wide=true,player=null;
  function layout(W){let s="";Xs=[];Ys=[];
    if(W>=600&&n<=9){wide=true;
      const cw0=Math.min(170,(W-140)/Math.max(1,n-1)*1.8),pad=Math.max(60,cw0/2+8),span=W-2*pad;
      const nums=Ev.map(e=>parseFloat(String(e.date).replace(/[^\d.-]/g,"")));
      const timeScale=o.scale==="time"&&nums.every(v=>!isNaN(v));
      const mn=Math.min(...nums),mx=Math.max(...nums);
      const X=i=>pad+(timeScale&&mx>mn?(nums[i]-mn)/(mx-mn):(n>1?i/(n-1):.5))*span;
      const cw=Math.min(cw0,(span/Math.max(1,n-1))*1.9);
      const cards=Ev.map(e=>({w:fit(e.t,cw,14),sb:e.sub?fit(e.sub,cw,12.5):[]}));
      const up=cards.map(c=>16+c.w.length*18+c.sb.length*16);
      const top=Math.max(...up.filter((_,i)=>i%2===0),0)+34,bot=Math.max(...up.filter((_,i)=>i%2===1),0)+34;
      const ay=top+30,H=ay+bot+36;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      s+=`<line class="k-axis" x1="${pad-40}" y1="${ay}" x2="${W-pad+40}" y2="${ay}"/><line class="k-prog-line" x1="${pad-40}" y1="${ay}" x2="${pad-40}" y2="${ay}"/>`;
      Ev.forEach((e,i)=>{const x=X(i),c=cards[i],isUp=i%2===0,hh=up[i],rk=roleKey(e.role),rc=rk?`var(--m-${rk})`:"var(--pc)";
        Xs[i]=x;Ys[i]=ay;const ty=isUp?ay-30-hh+16:ay+44;
        s+=`<g class="k-ev clickable" data-i="${i}" tabindex="0" role="button" aria-label="${escAttr(e.date+" "+e.t)}"${rk?` data-role="${rk}"`:""}${e.use?` data-use="${escAttr(e.use)}" data-uname="${escAttr(e.date+" · "+e.t)}"`:""} style="--rc:${rc}"><line class="k-lead" x1="${x}" y1="${ay}" x2="${x}" y2="${isUp?ay-24:ay+24}"/><circle class="k-dot" cx="${x}" cy="${ay}" r="8"/>`
         +`<text class="k-c" x="${x}" y="${isUp?ay+22:ay-14}" text-anchor="middle">${escHtml(e.date)}</text>`
         +tlines(x,ty,c.w,"k-t",18,"middle")+(c.sb.length?tlines(x,ty+c.w.length*18,c.sb,"k-s",16,"middle"):"")+`</g>`});
    } else {wide=false;
      const ax=22;let y=20;const rows=Ev.map(e=>{const w=fit(e.t,W-ax-30,14.5),sb=e.sub?fit(e.sub,W-ax-30,12.5):[];const r={y,w,sb,hh:22+w.length*18+sb.length*16};y+=r.hh+18;return r});
      const H=y;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      s+=`<line class="k-axis" x1="${ax}" y1="10" x2="${ax}" y2="${H-10}"/><line class="k-prog-line" x1="${ax}" y1="10" x2="${ax}" y2="10"/>`;
      Ev.forEach((e,i)=>{const r=rows[i],rk=roleKey(e.role),rc=rk?`var(--m-${rk})`:"var(--pc)";Xs[i]=ax;Ys[i]=r.y+6;
        s+=`<g class="k-ev clickable" data-i="${i}" tabindex="0" role="button" aria-label="${escAttr(e.date+" "+e.t)}"${rk?` data-role="${rk}"`:""}${e.use?` data-use="${escAttr(e.use)}" data-uname="${escAttr(e.date+" · "+e.t)}"`:""} style="--rc:${rc}"><circle class="k-dot" cx="${ax}" cy="${r.y+6}" r="8"/><text class="k-c" x="${ax+20}" y="${r.y+10}">${escHtml(e.date)}</text>${tlines(ax+20,r.y+30,r.w,"k-t",18)}${r.sb.length?tlines(ax+20,r.y+30+r.w.length*18,r.sb,"k-s",16):""}</g>`});
    }
    svg.innerHTML=s;render(cur);
  }
  function render(i){cur=i;const s=steps[i]||{},on=s.on||[i],reach=Math.max(...on);
    $$(".k-ev",svg).forEach(g=>{const k=+g.dataset.i;g.classList.toggle("on",on.includes(k));g.classList.toggle("done",!on.includes(k)&&k<=reach);g.classList.toggle("todo",k>reach&&!s.all)});
    const pl=$(".k-prog-line",svg),rk=Ev[reach]?roleKey(Ev[reach].role):"";
    if(pl&&Xs.length){const idx=s.all?n-1:V.clamp(reach,0,n-1);pl.setAttribute(wide?"x2":"y2",wide?Xs[idx]:Ys[idx]);if(rk)pl.style.stroke=`var(--m-${rk})`;else pl.style.stroke=""}
    if(an&&on.length===1&&Ev[on[0]]?.use)an.showUse(`${Ev[on[0]].date} · ${Ev[on[0]].t}`,Ev[on[0]].use,roleCol(Ev[on[0]].role,"var(--pc)"));
    if(o.on)o.on(i,svg,s);}
  const jumpEv=g=>{const k=+g.dataset.i,si=steps.findIndex(s=>(s.on||[]).includes(k));if(si>=0&&player){player.stop();player.show(si)}if(an&&Ev[k]?.use)an.showUse(`${Ev[k].date} · ${Ev[k].t}`,Ev[k].use,roleCol(Ev[k].role,"var(--pc)"))};
  svg.addEventListener("click",e=>{const g=e.target.closest(".k-ev");if(g)jumpEv(g)});
  svg.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".k-ev")){e.preventDefault();jumpEv(e.target)}});
  responsive(S,layout);
  player=E.stepper(S.viz,steps,i=>render(i),{ms:o.ms});
  return player;
};

/* =================================================================
   5. graph — functions, zones, sliders, tangents, Riemann sums, vectors
   ================================================================= */
function mountGraph(svg,S,o,pane){
  const X=o.x,Y=o.y,F=o.fns||[];
  const p={};Object.entries(o.params||{}).forEach(([k,c])=>p[k]=c.value);
  const col=(fn,k)=>fn.color||roleCol(fn.role)||(k?PAL(k-1):"var(--pc)");
  const val=(v,d)=>v==null?d:(typeof v==="function"?v(p):v);
  const lab=(t,x,y)=>String(t).replace("{x}",num(x)).replace("{y}",num(y));
  const arr=v=>v==null?[]:(Array.isArray(v)?v:[v]);
  let W0=640,H0=360,leg=[],legH=0,stopT=()=>{},show=F.map((_,i)=>i),prevShow=[],justStepped=false,marks=[],setters={};
  let ex={zones:o.zones||[],vlines:o.vlines||[],hlines:o.hlines||[],dots:o.dots||[],shade:o.shade||[],tangents:o.tangents||[],riemann:o.riemann||[],vectors:o.vectors||[]};
  const standalone=!pane;
  const wantAnatomy=standalone&&o.legend!==false&&(o.legend||F.some(f=>f.role||f.use)||ex.zones.length||ex.shade.length||ex.riemann.length||ex.tangents.length||ex.vectors.length||ex.vlines.length||ex.hlines.length||(o.steps||[]).some(s=>s.zones||s.shade||s.riemann||s.tangents||s.vectors||s.vlines||s.hlines));
  const an=wantAnatomy?mountAnatomy(S,{showUse:true,legend:o.legend,defaultUse:"Hover the curve or tap a legend chip to inspect each graph part."}):null;
  function syncLegend(){
    if(!an)return;
    if(Array.isArray(o.legend)){an.setItems(o.legend);return}
    const items=[];
    F.forEach((fn,k)=>{if(fn.label)items.push({feat:`fn-${k}`,role:fn.role,color:col(fn,k),swatch:fn.dash?"dash":"line",label:fn.label,use:fn.use||`Curve ${fn.label}`})});
    arr(ex.zones).forEach((z,j)=>{if(z.label)items.push({feat:`zone-${j}`,role:z.role,color:z.color||roleCol(z.role,PAL(j)),swatch:"area",label:z.label,use:z.use||`Region: ${z.label}`})});
    arr(ex.shade).forEach((sh,j)=>{items.push({feat:`shade-${j}`,role:sh.role||"g",color:sh.color||roleCol(sh.role,"var(--m-g)"),swatch:"area",label:sh.label||"Shaded area",use:sh.use||"Area accumulated between curves or under the curve."})});
    arr(ex.riemann).forEach((rm,j)=>{items.push({feat:`riem-${j}`,role:rm.role||"c",color:rm.color||roleCol(rm.role,"var(--m-c)"),swatch:"box",label:"Riemann boxes",use:rm.use||"Rectangles approximating the area under the curve."})});
    arr(ex.tangents).forEach((tg,j)=>{items.push({feat:`tan-${j}`,role:tg.role||"c",color:tg.color||roleCol(tg.role,"var(--c4)"),swatch:"dash",label:"Tangent line",use:tg.use||"Straight line showing the instantaneous rate of change (slope)."})});
    arr(ex.vlines).concat(arr(ex.hlines)).forEach((ln,j)=>{if(ln.label)items.push({feat:`line-${j}`,role:ln.role||(ln.asymptote?"k":""),color:ln.color||roleCol(ln.role||(ln.asymptote?"k":""),"var(--text-2)"),swatch:"dash",label:ln.asymptote?`Asymptote (${ln.label})`:ln.label,use:ln.use||(ln.asymptote?"Boundary line the curve approaches but never crosses.":"Reference threshold line.")})});
    arr(ex.vectors).forEach((vc,j)=>{items.push({feat:`vec-${j}`,role:vc.role||"a",color:vc.color||roleCol(vc.role,"var(--c2)"),swatch:"vec",label:vc.label||"Vector",use:vc.use||"Direction and magnitude from start to tip."})});
    if(marks.length)items.push({feat:"mark-0",role:marks[0].role||"r",color:marks[0].color||roleCol(marks[0].role,"var(--pc)"),swatch:"dot",label:"Marked point",use:marks[0].use||"Key coordinate with x and y guide projections."});
    an.setItems(items);
  }
  function layout(W){W0=W;
    leg=[];let lx=0,ly=0;
    if(!an){F.forEach((fn,k)=>{if(!fn.label)return;const w=26+fn.label.length*7.4+18;if(lx&&lx+w>W-60){lx=0;ly+=22}leg.push({k,x:lx,y:ly});lx+=w})}
    legH=leg.length?ly+26:0;H0=Math.round(V.clamp(W*(o.aspect||.5),190,330))+36+46+legH;draw()}
  function pieces(fn){
    let a=val(fn.domain&&fn.domain[0],X.min),b=val(fn.domain&&fn.domain[1],X.max);a=Math.max(a,X.min);b=Math.min(b,X.max);if(!(b>a))return[];
    let br=fn.breaks==="int"?(()=>{const r=[];for(let k=Math.ceil(a);k<=b;k++)r.push(k);return r})():arr(val(fn.breaks,[]));
    const cuts=[a,...br.filter(x=>x>a&&x<b).sort((u,v)=>u-v),b],out=[];
    for(let i=0;i<cuts.length-1;i++)if(cuts[i+1]-cuts[i]>1e-9)out.push([cuts[i],cuts[i+1]]);return out}
  function fval(fn,x){let y;try{y=fn.f(x,p)}catch(e){y=NaN}return y}
  let geom={L:52,R:16,T:36,B:46};
  function draw(){
    const W=W0,H=H0,L=52,R=16,T=36,B=46+legH;geom={L,R,T,B};svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    const sx=x=>L+(x-X.min)/(X.max-X.min)*(W-L-R),sy=y=>H-B-(y-Y.min)/(Y.max-Y.min)*(H-T-B);
    const eps=(X.max-X.min)*1e-6;
    const clx=(x,lw,anchor)=>{if(anchor==="end")return V.clamp(x,L+lw+2,W-R);if(anchor==="middle")return V.clamp(x,L+lw/2+2,W-R-lw/2-2);return V.clamp(x,L+2,W-R-lw-2)};
    const cly=y=>V.clamp(y,T+13,H-B-6);
    const vecs=arr(ex.vectors);
    let s=`<defs><clipPath id="${S.uid}-c"><rect x="${L}" y="${T-4}" width="${W-L-R}" height="${H-T-B+8}"/></clipPath>`
      +`<pattern id="${S.uid}-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" stroke-width="2" stroke-opacity=".35"/></pattern>`
      +`<marker id="${S.uid}-vec" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,1 L9.5,5 L0,9 z" class="k-head on"/></marker>`
      +vecs.map((vc,j)=>{const c=vc.color||roleCol(vc.role,j?PAL(j):"var(--c2)");return `<marker id="${S.uid}-vec-${j}" viewBox="0 0 10 10" refX="8.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,1 L9.5,5 L0,9 z" style="fill:${c}"/></marker>`}).join("")
      +`</defs>`;
    const gx=X.step||nice(X.max-X.min,W<500?5:8),gy=Y.step||nice(Y.max-Y.min,6);
    for(let v=Math.ceil(X.min/gx)*gx;v<=X.max+1e-9;v+=gx)s+=`<line class="k-grid" x1="${sx(v)}" y1="${T}" x2="${sx(v)}" y2="${H-B}"/><text class="k-s" x="${sx(v)}" y="${H-B+18}" text-anchor="middle">${num(v)}</text>`;
    for(let v=Math.ceil(Y.min/gy)*gy;v<=Y.max+1e-9;v+=gy)s+=`<line class="k-grid" x1="${L}" y1="${sy(v)}" x2="${W-R}" y2="${sy(v)}"/><text class="k-s" x="${L-8}" y="${sy(v)+4}" text-anchor="end">${num(v)}</text>`;
    s+=`<g clip-path="url(#${S.uid}-c)">`;
    arr(ex.zones).forEach((z,j)=>{
      const x1=sx(val(z.x1,X.min)),x2=sx(val(z.x2,X.max)),y1=sy(val(z.y2,Y.max)),y2=sy(val(z.y1,Y.min));
      const rw=Math.max(2,x2-x1),rh=Math.max(2,y2-y1),rk=roleKey(z.role),c=z.color||roleCol(z.role,PAL(j));
      s+=`<g class="k-feat" data-feat="zone-${j}"${rk?` data-role="${rk}"`:""}${z.use?` data-use="${escAttr(z.use)}" data-uname="${escAttr(z.label||"Zone")}"`:""}><rect class="k-zone" x="${x1.toFixed(1)}" y="${y1.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" style="fill:${c};stroke:${c}"/></g>`;
    });
    arr(ex.shade).forEach((sh,j)=>{const f1=F[sh.fn||0],f2=sh.fn2!=null?F[sh.fn2]:null;if(!f1)return;
      const a=val(sh.from,X.min),b=val(sh.to,X.max);if(!(b>a))return;const N=Math.max(60,Math.round((sx(b)-sx(a))/3));let top="",bot=[],cy=0,cn=0;
      for(let i=0;i<=N;i++){const x=a+(b-a)*i/N,y1=fval(f1,x),y2=f2?fval(f2,x):0;if(!isFinite(y1)||!isFinite(y2))continue;
        const Y1=V.clamp(sy(y1),-2000,4000),Y2=V.clamp(sy(y2),-2000,4000);top+=(top?"L":"M")+sx(x).toFixed(1)+","+Y1.toFixed(1);bot.unshift(sx(x).toFixed(1)+","+Y2.toFixed(1));cy+=(Y1+Y2)/2;cn++}
      if(!cn)return;const rk=roleKey(sh.role||"g"),c=sh.color||roleCol(sh.role,j?PAL(j):"var(--pc)");
      const d=`${top}L${bot.join("L")}Z`;
      s+=`<g class="k-feat${justStepped&&E.motionOn()?" k-anim-in":""}" data-feat="shade-${j}"${rk?` data-role="${rk}"`:""}${sh.use?` data-use="${escAttr(sh.use)}" data-uname="${escAttr(sh.label||"Area")}"`:""}><path class="k-shade" d="${d}" style="fill:${c};stroke:${c}"/>${sh.pattern==="hatch"?`<path class="k-shade" d="${d}" style="fill:url(#${S.uid}-hatch);stroke:none;color:${c};pointer-events:none"/>`:""}</g>`});
    let riemSum=null,riemN=0;
    arr(ex.riemann).forEach((rm,j)=>{const f1=F[rm.fn||0];if(!f1)return;
      const a=val(rm.from,X.min),b=val(rm.to,X.max),n=Math.max(1,Math.min(80,Math.round(val(rm.n,6)))),mode=rm.mode||"left";
      if(!(b>a))return;const dx=(b-a)/n,rk=roleKey(rm.role||"c"),c=rm.color||roleCol(rm.role,j?PAL(j):"var(--pc)");let sum=0,inner="";
      for(let k=0;k<n;k++){const x0=a+k*dx,xk=mode==="right"?x0+dx:mode==="mid"?x0+dx/2:x0,yk=fval(f1,xk);if(!isFinite(yk))continue;
        sum+=yk*dx;const yTop=sy(Math.max(0,yk)),yBot=sy(Math.min(0,yk)),rx0=sx(x0),rw=Math.max(1.5,sx(x0+dx)-rx0);
        inner+=`<rect class="k-riem" x="${rx0.toFixed(1)}" y="${V.clamp(yTop,-2000,4000).toFixed(1)}" width="${rw.toFixed(1)}" height="${Math.max(1,Math.abs(yBot-yTop)).toFixed(1)}" style="fill:${c};stroke:${c}"/>`;
        if(n<=24)inner+=`<circle class="k-riem-pt" cx="${sx(xk).toFixed(1)}" cy="${V.clamp(sy(yk),-2000,4000).toFixed(1)}" r="3.2" style="fill:${c}"/>`;}
      s+=`<g class="k-feat" data-feat="riem-${j}"${rk?` data-role="${rk}"`:""}${rm.use?` data-use="${escAttr(rm.use)}" data-uname="Riemann sum"`:""}>${inner}</g>`;
      riemSum=sum;riemN=n});
    s+=`</g>`;
    if(X.min<=0&&X.max>=0){const x0=sx(0);s+=`<line class="k-axis" x1="${x0}" y1="${T}" x2="${x0}" y2="${H-B}"/><polygon class="k-axis-arr" points="${x0},${T-6} ${x0-4},${T+2} ${x0+4},${T+2}"/>`}
    if(Y.min<=0&&Y.max>=0){const y0=sy(0);s+=`<line class="k-axis" x1="${L}" y1="${y0}" x2="${W-R}" y2="${y0}"/><polygon class="k-axis-arr" points="${W-R+6},${y0} ${W-R-2},${y0-4} ${W-R-2},${y0+4}"/>`}
    s+=`<text class="k-s k-axl" x="${W-R}" y="${H-B+38}" text-anchor="end">${X.label||"x"}</text><text class="k-s k-axl" x="6" y="18">${Y.label||"y"}</text>`;
    const pb={W,H,fs:11.5,minX:L+2,maxX:W-R-2,minY:T+2,maxY:H-B-2};
    arr(ex.zones).forEach((z,j)=>{if(!z.label)return;const x1=sx(val(z.x1,X.min)),x2=sx(val(z.x2,X.max)),y1=sy(val(z.y2,Y.max));
      s+=pillSvg((x1+x2)/2,Math.max(T+16,y1+18),z.label,{...pb,role:z.role,color:z.color||roleCol(z.role,PAL(j)),feat:`zone-${j}`,use:z.use})});
    arr(ex.vlines).forEach((v,j)=>{const x=val(v.x);if(!isFinite(x)||x<X.min||x>X.max)return;const rk=roleKey(v.role||(v.asymptote?"k":"")),c=v.color||roleCol(rk,"var(--text-2)");
      s+=`<g class="k-feat" data-feat="line-${j}"${rk?` data-role="${rk}"`:""}${v.use?` data-use="${escAttr(v.use)}" data-uname="${escAttr(v.label||"Vertical line")}"`:""}><line class="k-vl" x1="${sx(x)}" y1="${T-4}" x2="${sx(x)}" y2="${H-B}" style="stroke:${c};${v.dash===false?"":"stroke-dasharray:7 6"}"/>`;
      if(v.label){const t=lab(v.label,x,0),py=v.at==="bottom"?H-B-18:T+14;s+=pillSvg(sx(x),py,t,{...pb,role:rk,color:c})}
      s+=`</g>`});
    arr(ex.hlines).forEach((v,j)=>{const y=val(v.y);if(!isFinite(y)||y<Y.min||y>Y.max)return;const rk=roleKey(v.role||(v.asymptote?"k":"")),c=v.color||roleCol(rk,"var(--text-2)");
      s+=`<g class="k-feat" data-feat="line-${arr(ex.vlines).length+j}"${rk?` data-role="${rk}"`:""}${v.use?` data-use="${escAttr(v.use)}" data-uname="${escAttr(v.label||"Horizontal line")}"`:""}><line class="k-vl" x1="${L}" y1="${sy(y)}" x2="${W-R}" y2="${sy(y)}" style="stroke:${c};${v.dash===false?"":"stroke-dasharray:7 6"}"/>`;
      if(v.label){const t=lab(v.label,0,y),px=v.at==="left"?L+54:W-R-54,py=(v.below||sy(y)-14<T+14)?sy(y)+18:sy(y)-16;s+=pillSvg(px,py,t,{...pb,role:rk,color:c})}
      s+=`</g>`});
    s+=`<g clip-path="url(#${S.uid}-c)">`;
    F.forEach((fn,k)=>{if(!show.includes(k))return;let d="";
      pieces(fn).forEach(([a,b])=>{let pen=false;const n=Math.max(40,Math.round(sx(b)-sx(a)));
        for(let j=0;j<=n;j++){let x=a+(b-a)*j/n;if(j===0)x=a+eps;if(j===n)x=b-eps;const y=fval(fn,x);
          if(!isFinite(y)||Math.abs(y)>1e6){pen=false;continue}const yy=V.clamp(sy(y),-2000,4000);d+=(pen?"L":"M")+sx(x).toFixed(1)+","+yy.toFixed(1);pen=true}});
      const anim=justStepped&&o.drawOn!==false&&!prevShow.includes(k)&&!fn.dash&&E.motionOn(),rk=roleKey(fn.role),c=col(fn,k);
      s+=`<g class="k-feat" data-feat="fn-${k}"${rk?` data-role="${rk}"`:""}${fn.use?` data-use="${escAttr(fn.use)}" data-uname="${escAttr(fn.label||"Curve")}"`:""}>`
        +`<path class="k-curve-halo" d="${d}"/>`
        +`<path class="k-curve${anim?" draw":""}"${anim?' pathLength="1"':""} d="${d}" style="stroke:${c};${fn.dash?"stroke-dasharray:7 6":""}"/></g>`});
    arr(ex.tangents).forEach((tg,j)=>{const fn=F[tg.fn||0];if(!fn)return;
      const x0=val(tg.x),y0=tg.y!=null?val(tg.y):fval(fn,x0),dx=(X.max-X.min)*1e-4;
      const m=tg.m!=null?val(tg.m):(fval(fn,x0+dx)-fval(fn,x0-dx))/(2*dx);
      if(!isFinite(x0)||!isFinite(y0)||!isFinite(m))return;
      const half=val(tg.len,(X.max-X.min)*.24),rk=roleKey(tg.role||"c"),c=tg.color||roleCol(tg.role,"var(--c4)");
      s+=`<g class="k-feat" data-feat="tan-${j}"${rk?` data-role="${rk}"`:""}${tg.use?` data-use="${escAttr(tg.use)}" data-uname="Tangent line"`:""}>`;
      if(tg.triangle){const r=val(tg.dx,half*.65);s+=`<path class="k-tan-tri" d="M${sx(x0).toFixed(1)},${sy(y0).toFixed(1)} H${sx(x0+r).toFixed(1)} V${sy(y0+m*r).toFixed(1)} Z" style="fill:${c};stroke:${c}"/>`}
      s+=`<line class="k-tan" x1="${sx(x0-half).toFixed(1)}" y1="${sy(y0-m*half).toFixed(1)}" x2="${sx(x0+half).toFixed(1)}" y2="${sy(y0+m*half).toFixed(1)}" style="stroke:${c}"/>`;
      s+=`<circle class="k-pulse-ring" cx="${sx(x0)}" cy="${sy(y0)}" r="9" style="stroke:${c}"/><circle class="k-pt on" cx="${sx(x0)}" cy="${sy(y0)}" r="5.5" style="fill:${c}"/></g>`;
      if(tg.label){const txt=lab(tg.label,x0,y0).replace("{m}",num(m));s+=pillSvg(sx(x0),sy(y0)-24,txt,{...pb,role:rk,color:c})}});
    vecs.forEach((vc,j)=>{
      const f=val(vc.from),t=val(vc.to);if(!f||!t)return;const rk=roleKey(vc.role||"a"),c=vc.color||roleCol(vc.role,j?PAL(j):"var(--c2)");
      s+=`<g class="k-feat" data-feat="vec-${j}"${rk?` data-role="${rk}"`:""}${vc.use?` data-use="${escAttr(vc.use)}" data-uname="${escAttr(vc.label||"Vector")}"`:""}><line class="k-vec" x1="${sx(f[0]).toFixed(1)}" y1="${sy(f[1]).toFixed(1)}" x2="${sx(t[0]).toFixed(1)}" y2="${sy(t[1]).toFixed(1)}" style="stroke:${c};${vc.dash?"stroke-dasharray:6 5":""}" marker-end="url(#${S.uid}-vec-${j})"/></g>`;
      if(vc.label){const mx=(sx(f[0])+sx(t[0]))/2,my=(sy(f[1])+sy(t[1]))/2-18;s+=pillSvg(mx,my,vc.label,{...pb,role:rk,color:c})}});
    (o.points||[]).forEach(pt=>{s+=`<circle class="k-pt" cx="${sx(pt[0])}" cy="${sy(pt[1])}" r="5.5"/>`+(pt[2]?`<text class="k-s k-halo" x="${clx(sx(pt[0])+9,pt[2].length*6.8,"start")}" y="${cly(sy(pt[1])-8)}">${pt[2]}</text>`:"")});
    s+=`</g>`;
    arr(ex.shade).forEach((sh,j)=>{const f1=F[sh.fn||0];if(!f1||!sh.label)return;const a=val(sh.from,X.min),b=val(sh.to,X.max),mx=val(sh.lx,(a+b)/2),y1=fval(f1,mx),ly=sh.ly!=null?sy(val(sh.ly)):(isFinite(y1)?(sy(y1)+sy(0))/2:(T+H-B)/2);
      s+=pillSvg(sx(mx),ly,sh.label,{...pb,fs:12,role:sh.role||"g",color:sh.color||roleCol(sh.role,j?PAL(j):"var(--pc)"),feat:`shade-${j}`})});
    arr(ex.riemann).forEach((rm,j)=>{if(!rm.label)return;const a=val(rm.from,X.min),b=val(rm.to,X.max),c=rm.color||roleCol(rm.role,j?PAL(j):"var(--pc)");
      const txt=String(rm.label).replace("{n}",riemN).replace("{sum}",num(riemSum??0));s+=pillSvg(sx((a+b)/2),T+18,txt,{...pb,fs:12,role:rm.role||"c",color:c,feat:`riem-${j}`})});
    arr(ex.dots).forEach(dt=>{const x=val(dt.x);let y=dt.y!=null?val(dt.y):(F[dt.fn||0]?fval(F[dt.fn||0],x):NaN);if(!isFinite(x)||!isFinite(y)||x<X.min-1e-9||x>X.max+1e-9||y<Y.min-1e-9||y>Y.max+1e-9)return;
      const rk=roleKey(dt.role),c=dt.color||roleCol(dt.role,col(F[dt.fn||0]||{},dt.fn||0)),cw=6.8,px=sx(x),py=sy(y);
      if(dt.shape==="diamond")s+=`<polygon class="k-dot" points="${px},${py-7} ${px+7},${py} ${px},${py+7} ${px-7},${py}" style="stroke:${c};fill:${dt.open?"var(--kbg)":c}"/>`;
      else s+=`<circle class="k-dot${dt.open?" open":""}" cx="${px}" cy="${py}" r="6" style="stroke:${c};${dt.open?"":"fill:"+c}"/>`;
      if(dt.label){const t=lab(dt.label,x,y),lw=t.length*cw,tx=px+12+lw>W-R?px-12-lw:px+12;s+=`<text class="k-s k-halo" x="${clx(tx,lw,"start")}" y="${cly(py-10)}">${t}</text>`}});
    marks.forEach((m0,mi)=>{const fn=F[m0.fn||0];if(!fn)return;const m={...m0,x:typeof m0.x==="function"?m0.x(p):m0.x};let y;try{y=m.y!=null?(typeof m.y==="function"?m.y(p):m.y):fn.f(m.x,p)}catch(e){return}if(!isFinite(y)||!isFinite(m.x))return;
      const rk=roleKey(m.role||"r"),c=m.color||roleCol(rk,"var(--pc)"),px=sx(m.x),py=sy(y);
      const t=(m.label!=null?m.label.replace("{x}",num(m.x)).replace("{y}",num(y)):`(${num(m.x)}, ${num(y)})`);
      s+=`<g class="k-feat" data-feat="mark-${mi}"${rk?` data-role="${rk}"`:""}${m.use?` data-use="${escAttr(m.use)}" data-uname="Marked point"`:""}><line class="k-mark" x1="${px}" y1="${H-B}" x2="${px}" y2="${py}"/><line class="k-mark" x1="${L}" y1="${py}" x2="${px}" y2="${py}"/><circle class="k-pulse-ring" cx="${px}" cy="${py}" r="10" style="stroke:${c}"/><circle class="k-pt on" cx="${px}" cy="${py}" r="6.5" style="fill:${c}"/></g>`
        +pillSvg(px,py-24,t,{...pb,role:rk,color:c,feat:`mark-${mi}`})});
    leg.forEach(g=>{const fn=F[g.k],y=H-legH+12+g.y;s+=`<g class="k-leg${show.includes(g.k)?"":" off"}"><line x1="${L+g.x}" y1="${y-4}" x2="${L+g.x+20}" y2="${y-4}" style="stroke:${col(fn,g.k)};stroke-width:3.5;stroke-linecap:round;${fn.dash?"stroke-dasharray:5 4":""}"/><text class="k-s" x="${L+g.x+26}" y="${y}">${fn.label}</text></g>`});
    if(o.readout){const rt=String(o.readout(p,{riemannSum:riemSum,riemannN:riemN}));s+=`<text class="k-t k-halo" x="${W-R}" y="18" text-anchor="end">${rt}</text>`}
    s+=`<g class="k-probe" hidden><line class="k-probe-line" x1="0" y1="${T}" x2="0" y2="${H-B}"/><circle class="k-probe-dot" cx="0" cy="0" r="4.5"/></g>`;
    svg.innerHTML=s;justStepped=false;
    syncLegend();
    if(an)an.wire(svg);
  }
  if(standalone&&o.probe!==false&&F.length){
    const updateProbe=ev=>{
      const r=svg.getBoundingClientRect();if(!r.width)return;
      const vx=(ev.clientX-r.left)/r.width*W0,{L,R,T,B}=geom;
      const pr=$(".k-probe",svg);if(!pr)return;
      if(vx<L||vx>W0-R){pr.setAttribute("hidden","");return}
      const x=X.min+(vx-L)/(W0-L-R)*(X.max-X.min),fnIdx=show[0]??0,fn=F[fnIdx];
      if(!fn)return;const y=fval(fn,x);if(!isFinite(y)){pr.setAttribute("hidden","");return}
      const py=H0-B-(y-Y.min)/(Y.max-Y.min)*(H0-T-B);
      if(py<T-4||py>H0-B+4){pr.setAttribute("hidden","");return}
      pr.removeAttribute("hidden");
      const pl=$(".k-probe-line",pr),pd=$(".k-probe-dot",pr),c=col(fn,fnIdx);
      pl.setAttribute("x1",vx.toFixed(1));pl.setAttribute("x2",vx.toFixed(1));
      pd.setAttribute("cx",vx.toFixed(1));pd.setAttribute("cy",py.toFixed(1));pd.style.fill=c;
      if(an){an.ensureUse();const vals=show.map(k=>{const yy=fval(F[k],x);const nm=String(F[k].label||"f").split("=")[0].replace(/\(.*\)$/,"").trim()||"f";return isFinite(yy)?`${nm}(${num(x)}) = ${num(yy)}`:""}).filter(Boolean).join(" · ");an.showUse("Live probe",vals,c)}
    };
    svg.addEventListener("pointermove",updateProbe);
    svg.addEventListener("pointerleave",()=>{const pr=$(".k-probe",svg);if(pr)pr.setAttribute("hidden","");if(an&&!S.stage.closest(".sec,.viz")?.dataset.pinRole)an.showUse(null)});
  }
  Object.entries(o.params||{}).forEach(([k,c])=>{if(c.slider===false)return;setters[k]=ctlRange(S,k,c,v=>{p[k]=v;draw()})});
  responsive(S,layout,pane||svg);
  function apply(s){s=s||{};prevShow=[...show];show=s.show||F.map((_,k)=>k);marks=s.mark||[];justStepped=true;
    ["zones","vlines","hlines","dots","shade","tangents","riemann","vectors"].forEach(k=>ex[k]=s[k]!==undefined?s[k]:(o[k]||[]));
    stopT();const from={...p},to={...p,...(s.set||{})};
    stopT=V.tween(o.tween||700,t=>{const e=V.ease(t);Object.keys(to).forEach(k=>p[k]=from[k]+(to[k]-from[k])*e);draw()},()=>Object.keys(to).forEach(k=>setters[k]&&setters[k](to[k])));
  }
  return {apply,draw,params:p,setters};
}
Kit.graph=(id,o)=>{
  const S=setup(id,"graph");if(!S)return;
  const svg=svgIn(S,o.alt),steps=stepsOr(o,[{t:"The graph",d:""}]);
  const gApi=mountGraph(svg,S,o);
  return E.stepper(S.viz,steps,(i)=>{const s=steps[i];gApi.apply(s);if(o.on)o.on(i,svg,s,gApi.params);},{ms:o.ms,freeLabel:o.freeLabel});
};

/* =================================================================
   6. bars — compare amounts; values change step by step
   ================================================================= */
Kit.bars=(id,o)=>{
  const S=setup(id,"bars");if(!S)return;
  const svg=svgIn(S,o.alt),B=o.bars,n=B.length;
  const steps=stepsOr(o,[{t:"Compare",d:""}]);
  const first=steps[0]&&steps[0].v;
  let vals=B.map((b,k)=>first&&k in first?first[k]:(b.v??0)),prevVals=[...vals],W0=640,stopT=()=>{},hi=null;
  const tgtV=o.target?o.target.v:0;
  const max=o.max||Math.max(tgtV,...B.map(b=>b.v||0),...steps.flatMap(s=>(s.v||[]).filter(v=>v!=null)))*1.12||1;
  const fmt=v=>v==null?"?":(o.fmt?o.fmt(v):num(v))+(o.unit?" "+o.unit:"");
  const cls=i=>`k-b${hi&&!hi.includes(i)?" todo":""}${hi&&hi.includes(i)?" on":""}`;
  const hasMeta=!!(o.legend||B.some(b=>b.role||b.use)||o.target);
  const an=hasMeta?mountAnatomy(S,{showUse:B.some(b=>b.use),legend:o.legend}):null;
  if(an){
    const list=o.legend||B.filter(b=>b.role||b.use).map((b,i)=>({feat:`bar-${i}`,role:b.role,color:b.color||roleCol(b.role,PAL(i)),swatch:"box",label:b.t,use:b.use||""}));
    an.setItems(list);an.wire(svg);
  }
  function layout(W){W0=W;draw()}
  function draw(){const W=W0;let s="";
    if(W>=520&&n<=8){const H=308,L=16,R=16,T=42,Bt=58,gap=Math.min(36,W*.04),bw=(W-L-R-gap*(n-1))/n,ph=H-T-Bt;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      s+=`<line class="k-axis" x1="${L}" y1="${H-Bt}" x2="${W-R}" y2="${H-Bt}"/>`;
      if(o.target){const ty=H-Bt-ph*V.clamp(o.target.v/max,0,1),tc=o.target.color||roleCol(o.target.role||"k","var(--m-k)");
        s+=`<line class="k-vl" x1="${L}" y1="${ty}" x2="${W-R}" y2="${ty}" style="stroke:${tc};stroke-dasharray:6 5"/>`;
        if(o.target.label)s+=pillSvg(W-R-56,ty-14,o.target.label,{W,H,fs:11,role:o.target.role||"k",color:tc})}
      B.forEach((b,i)=>{const v=vals[i],x=L+i*(bw+gap),lab=fit(b.t,bw,13),rk=roleKey(b.role),c=b.color||roleCol(b.role,PAL(i));
        if(v==null){s+=`<g class="${cls(i)}"${rk?` data-role="${rk}"`:""}${b.use?` data-use="${escAttr(b.use)}" data-uname="${escAttr(b.t)}"`:""}><rect class="k-q" x="${x}" y="${H-Bt-ph*.35}" width="${bw}" height="${ph*.35}" rx="8"/><text class="k-t" x="${x+bw/2}" y="${H-Bt-ph*.35/2+6}" text-anchor="middle">?</text>${tlines(x+bw/2,H-Bt+20,lab.slice(0,2),"k-s",15,"middle")}</g>`;return}
        const bh=ph*V.clamp(v/max,0,1),y=H-Bt-bh,dv=prevVals[i]!=null&&v!=null?v-prevVals[i]:0;
        const dTxt=hi&&hi.includes(i)&&Math.abs(dv)>0.01?` (${dv>0?"+":""}${num(dv)})`:"";
        s+=`<g class="${cls(i)} k-feat" data-feat="bar-${i}"${rk?` data-role="${rk}"`:""}${b.use?` data-use="${escAttr(b.use)}" data-uname="${escAttr(b.t)}"`:""} style="--rc:${c}"><rect class="k-bar" x="${x}" y="${y}" width="${bw}" height="${Math.max(0,bh)}" rx="8" style="fill:${c}"/>`
          +`<text class="k-t k-halo" x="${x+bw/2}" y="${Math.max(18,y-9)}" text-anchor="middle">${fmt(v)}${dTxt?`<tspan class="k-delta" style="fill:${dv>0?"var(--ok)":"var(--bad)"}">${dTxt}</tspan>`:""}</text>${tlines(x+bw/2,H-Bt+20,lab.slice(0,2),"k-s",15,"middle")}</g>`});
    } else {const L=Math.min(150,W*.38),R=80,rh=42,H=n*rh+24;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      if(o.target){const tx=L+(W-L-R)*V.clamp(o.target.v/max,0,1),tc=o.target.color||roleCol(o.target.role||"k","var(--m-k)");
        s+=`<line class="k-vl" x1="${tx}" y1="4" x2="${tx}" y2="${H-14}" style="stroke:${tc};stroke-dasharray:6 5"/>`}
      B.forEach((b,i)=>{const v=vals[i],y=8+i*rh,lab=fit(b.t,L-12,13),rk=roleKey(b.role),c=b.color||roleCol(b.role,PAL(i));
        const bw=v==null?(W-L-R)*.35:(W-L-R)*V.clamp(v/max,0,1);
        s+=`<g class="${cls(i)} k-feat" data-feat="bar-${i}"${rk?` data-role="${rk}"`:""}${b.use?` data-use="${escAttr(b.use)}" data-uname="${escAttr(b.t)}"`:""} style="--rc:${c}">${tlines(L-10,y+(lab.length>1?14:23),lab.slice(0,2),"k-s",14,"end")}`
          +(v==null?`<rect class="k-q" x="${L}" y="${y+5}" width="${bw}" height="${rh-14}" rx="7"/><text class="k-t" x="${L+bw/2}" y="${y+25}" text-anchor="middle">?</text>`
                   :`<rect class="k-bar" x="${L}" y="${y+5}" width="${Math.max(0,bw)}" height="${rh-14}" rx="7" style="fill:${c}"/><text class="k-t k-halo" x="${L+bw+8}" y="${y+25}">${fmt(v)}</text>`)+`</g>`});
    }
    svg.innerHTML=s;if(an)an.wire(svg);}
  responsive(S,layout);
  return E.stepper(S.viz,steps,(i)=>{const s=steps[i];hi=s.hi||null;stopT();const from=[...vals],to=s.v||vals;prevVals=[...from];
    const tgt=from.map((v,k)=>k in to?to[k]:v);
    stopT=V.tween(650,t=>{const e=V.ease(t);vals=tgt.map((v,k)=>v==null?null:(from[k]??0)+(v-(from[k]??0))*e);draw()});
    if(an&&hi&&hi.length===1&&B[hi[0]]?.use)an.showUse(B[hi[0]].t,B[hi[0]].use,roleCol(B[hi[0]].role,"var(--pc)"));
    if(o.on)o.on(i,svg,s);},{ms:o.ms});
};

/* =================================================================
   7. particles — moving particles (kinetic theory, collisions, rates)
   ================================================================= */
Kit.particles=(id,o)=>{
  const S=setup(id,"particles");if(!S)return;
  const svg=svgIn(S,o.alt);E.watch(svg);
  const K=o.kinds||[{label:"particle",n:24}];
  const steps=stepsOr(o,[{t:"Particles",d:""}]);
  let W=640,H=300,ps=[],temp=(o.temp&&o.temp.value)||1,cat=false,hits=0,hitRate=0,reacted=0,acc=0,setT=null;
  const R=7,ea=o.react?(o.react.ea??1.6):0;
  const spawn=(k,x,y)=>{const a=Math.random()*Math.PI*2,sp=(.55+Math.random()*.9)*Math.sqrt(temp);return {k,x:x??R+Math.random()*(W-2*R),y:y??R+Math.random()*(H-2*R),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp}};
  function seed(counts){ps=[];K.forEach((k,i)=>{const c=counts?counts[i]:k.n;for(let j=0;j<(c||0);j++)ps.push(spawn(i))})}
  let gp=null,cnt=null,catEl=null;
  function layout(w){const oW=W,oH=H;W=w;H=Math.round(Math.max(200,Math.min(320,w*.5)));ps.forEach(p=>{p.x=V.clamp(p.x*W/oW,R,W-R);p.y=V.clamp(p.y*H/oH,R,H-R)});svg.setAttribute("viewBox",`0 0 ${W} ${H+40}`);
    const legend=K.map((k,i)=>`<tspan class="k-sw" style="fill:${k.color||PAL(i)}">●</tspan> ${k.label}  `).join("");
    svg.innerHTML=`<rect class="k-box" x="1" y="1" width="${W-2}" height="${H-2}" rx="14"/><g class="k-catg"><rect class="k-cat" x="${W/2-60}" y="${H-12}" width="120" height="8" rx="4"/><text class="k-s" x="${W/2}" y="${H-18}" text-anchor="middle">catalyst</text></g><g class="k-ps"></g><text class="k-s" x="6" y="${H+26}">${legend}</text><text class="k-t k-cnt" x="${W-6}" y="${H+26}" text-anchor="end"></text>`;
    gp=$(".k-ps",svg);cnt=$(".k-cnt",svg);catEl=$(".k-catg",svg);draw()}
  function draw(){if(!gp)return;
    while(gp.childNodes.length<ps.length)gp.appendChild(document.createElementNS("http://www.w3.org/2000/svg","circle"));
    while(gp.childNodes.length>ps.length)gp.lastChild.remove();
    ps.forEach((p,i)=>{const c=gp.childNodes[i];c.setAttribute("cx",p.x.toFixed(1));c.setAttribute("cy",p.y.toFixed(1));c.setAttribute("r",R);c.setAttribute("class","k-p");c.style.fill=K[p.k].color||PAL(p.k)});
    catEl.style.display=cat?"":"none";
    const t=o.react?`reactions: ${reacted}`:`wall hits per second: ${Math.round(hitRate)}`;if(cnt.textContent!==t)cnt.textContent=t}
  function step(dt){const f=dt/16;
    for(const p of ps){p.x+=p.vx*f*1.6;p.y+=p.vy*f*1.6;
      if(p.x<R){p.x=R;p.vx=Math.abs(p.vx);hits++}if(p.x>W-R){p.x=W-R;p.vx=-Math.abs(p.vx);hits++}
      if(p.y<R){p.y=R;p.vy=Math.abs(p.vy);hits++}if(p.y>H-R){p.y=H-R;p.vy=-Math.abs(p.vy);hits++}}
    for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];const dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy;if(d2>4*R*R||d2===0)continue;
      if(o.react&&((a.k===o.react.a&&b.k===o.react.b)||(a.k===o.react.b&&b.k===o.react.a))){const e=(a.vx-b.vx)**2+(a.vy-b.vy)**2;
        if(e>ea*ea*(cat?.35:1)){a.k=o.react.make;a.vx=(a.vx+b.vx)/2;a.vy=(a.vy+b.vy)/2;ps.splice(j,1);reacted++;j--;continue}}
      const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,rv=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(rv<=0)continue;
      a.vx-=rv*nx;a.vy-=rv*ny;b.vx+=rv*nx;b.vy+=rv*ny;const ov=2*R-d;a.x-=nx*ov/2;a.y-=ny*ov/2;b.x+=nx*ov/2;b.y+=ny*ov/2}
    acc+=dt;if(acc>1000){hitRate=hits*1000/acc;hits=0;acc=0}}
  E.tickers.push((t,dt)=>{if(E.visible.get(svg)===false||!svg.isConnected)return;step(dt);draw()});
  function setTemp(t){const k=Math.sqrt(t/temp);ps.forEach(p=>{p.vx*=k;p.vy*=k});temp=t}
  if(o.temp&&o.temp.slider!==false)setT=ctlRange(S,"temp",{label:"Temperature",min:.3,max:3,step:.1,dp:1,fmt:v=>(+v).toFixed(1)+"×",...o.temp},v=>setTemp(v));
  seed();responsive(S,layout);
  return E.stepper(S.viz,steps,(i)=>{const s=steps[i];if(s.temp!=null){setTemp(s.temp);setT&&setT(s.temp)}cat=!!s.catalyst;
    if(s.n){reacted=0;seed(s.n)}if(s.reset){reacted=0;seed()}draw();if(o.on)o.on(i,svg,s);},{ms:o.ms||5000,freeLabel:o.freeLabel});
};

/* =================================================================
   8. derive — Photomath-style animated tutorial, one step at a time
   ================================================================= */
Kit.math=(s,o)=>E.math(s,o);
function splitTopAuto(s){
  const rows=[],rels=[];
  let bd=0,pd=0,md=0,last=0;
  for(let i=0;i<s.length;i++){
    if(s.slice(i,i+7)==="\\begin{"){const em=s.slice(i).match(/^\\begin\{([^}]+)\}/);if(em){const end=`\\end{${em[1]}}`,j=s.indexOf(end,i+em[0].length);if(j>=0){i=j+end.length-1;continue}}}
    if(s.slice(i,i+2)==="[["){md++;i++;continue}
    if(s.slice(i,i+2)==="]]"&&md>0){md--;i++;continue}
    const c=s[i];
    if(c==="{")bd++;else if(c==="}"&&bd>0)bd--;
    else if(c==="(")pd++;else if(c===")"&&pd>0)pd--;
    if(bd||pd||md)continue;
    const br=s.slice(i).match(/^<br\s*\/?>/i);
    if(br||c==="\n"){const p=s.slice(last,i).trim();if(p)rows.push(p);last=i+(br?br[0].length:1);i=last-1;continue}
    const vs=s.slice(i).match(/^\s+vs\.?\s+/i);
    if(vs){const L=s.slice(last,i).trim(),R=s.slice(i+vs[0].length).trim();if(/[=≈≤≥]/.test(L)&&/[=≈≤≥]/.test(R)){rows.push(L);last=i+vs[0].length;i=last-1;continue}}
    if(s.slice(i).match(/^\\(?:implies|Rightarrow)\b/)||s.slice(i,i+2)==="=>"||c==="="||c==="≈"||c==="⇒"){
      if(s[i]==="<"||s.slice(i-1,i+1)==="<=")continue;
      rels.push(i);
      if(s.slice(i).match(/^\\(?:implies|Rightarrow)\b/))i+=s.slice(i).match(/^\\(?:implies|Rightarrow)\b/)[0].length-1;
      else if(s.slice(i,i+2)==="=>")i++;
    }
  }
  const tail=s.slice(last).trim();if(tail)rows.push(tail);
  return {rows,rels};
}
function autoSplitFrames(m){
  if(!m||!String(m).trim())return [{m}];
  const {rows,rels}=splitTopAuto(String(m));
  if(rows.length>=2&&rows.length<=4)
    return rows.map((_,k)=>({m:rows.slice(0,k+1).join(" <br> "),...(k<rows.length-1?{dur:1550}:{}),_autoRow:k}));
  if(rows.length<=1&&rels.length>=2){
    const cuts=rels.length>=3?rels.slice(-2):rels.slice(-1);
    const fs=cuts.map(c=>({m:m.slice(0,c).trim(),dur:1550})).filter(f=>f.m);
    if(fs.length){fs.push({m,_autoTail:true});return fs}
  }
  return [{m}];
}
function getFrames(l){
  let raw;
  if(Array.isArray(l.frames)&&l.frames.length){
    raw=l.frames.map(f=>typeof f==="string"?{m:f}:{...f});
  } else if(/~~/.test(l.m||"")||l.after){
    raw=[{m:l.m,dur:1400}];
    if(/~~/.test(l.m||""))raw.push({strike:true,dur:1550});
    if(l.after)raw.push({m:l.after,dur:1450});
  } else if(l.autoFrames!==false){
    raw=autoSplitFrames(l.m);
  } else raw=[{m:l.m}];
  let lastM=l.m||"";
  return raw.map(f=>{if(f.m!=null)lastM=f.m;return {...f,_m:f.m!=null?f.m:lastM}});
}
function renderDrawerBody(l,frames,idx,total){
  const how=l.how?(Array.isArray(l.how)?`<ol class="kd-how">${l.how.map(x=>`<li>${E.math(x)}</li>`).join("")}</ol>`:`<p>${E.math(l.how)}</p>`):"";
  let tip="";
  if(l.tip){
    if(typeof l.tip==="string")tip=`<p>${E.math(l.tip)}</p>`;
    else tip=(l.tip.title?`<b>${l.tip.title}</b>`:"")+(l.tip.body?`<p>${E.math(l.tip.body)}</p>`:"")+(l.tip.rule?`<div class="kd-rule"><span>${E.t("rule")}</span><div>${E.math(l.tip.rule)}</div></div>`:"")+(l.tip.watch?`<div class="kd-watch"><span>${E.t("watch_out")}</span><div>${E.math(l.tip.watch)}</div></div>`:"");
  }
  const rep=frames.length>1?`<button type="button" class="kd-nbtn kd-rep" data-nav="replay" aria-label="${E.t("replay")}">${E.ic("reset")}<span class="kd-fc">1/${frames.length}</span></button>`:"";
  const nav=`<div class="kd-nav" role="group" aria-label="Step frames"><button type="button" class="kd-nbtn" data-nav="prev" aria-label="${E.t("back")}"${idx===0?" disabled":""}>${E.ic("back")}</button>${rep}<button type="button" class="kd-nbtn" data-nav="next" aria-label="${E.t("next")}"${idx===total-1&&frames.length<=1?" disabled":""}>${E.ic("next")}</button></div>`;
  const tabs=nav+(how?`<button type="button" class="kd-tab" data-panel="how" aria-expanded="false">${E.t("how")}</button>`:"")
    +(tip?`<button type="button" class="kd-tab" data-panel="tip" aria-expanded="false">${E.t("why")}</button>`:"");
  return `<div class="kd-tools">${tabs}</div>${(how||tip)?`<div class="kd-drawer"><div class="kd-drawer-in">${how?`<div class="kd-panel" data-panel="how" hidden>${how}</div>`:""}${tip?`<div class="kd-panel" data-panel="tip" hidden>${tip}</div>`:""}</div></div>`:""}`;
}
Kit.derive=(id,o)=>{
  const S=setup(id,"derive");if(!S)return;
  S.stage.classList.add("kit-html");
  const Ls=o.lines,framesList=Ls.map(getFrames),hasViz=!!(o.graph||o.visual),hasMulti=framesList.some(f=>f.length>1);
  const legHtml=o.legend?`<div class="kd-legend" role="group" aria-label="Color key">${o.legend.map(x=>`<button type="button" class="m-leg-item m-t-${x.role}" data-role="${x.role}" aria-pressed="false"><i></i><span>${x.label}</span></button>`).join("")}</div>`:"";
  const listHtml=(o.given?`<div class="kd-given">${Kit.math(o.given)}</div>`:"")+legHtml
    +`<ol class="kd">${Ls.map((l,i)=>`<li data-i="${i}"${l.final?' class="final"':""}>${l.op?`<div class="kd-op" aria-hidden="true"><span>${Kit.math(l.op)}</span></div>`:""}${l.why?`<div class="kd-why">${Kit.math(l.why)}</div>`:""}<div class="kd-m">${Kit.math(framesList[i][0]._m,{rows:true})}</div>${renderDrawerBody(l,framesList[i],i,Ls.length)}</li>`).join("")}</ol>`;
  if(hasViz){
    S.stage.innerHTML=`<div class="kd-layout has-viz"><div class="kd-viz-pane"></div><div class="kd-steps-pane">${listHtml}</div></div>`;
  } else S.stage.innerHTML=listHtml;
  const vizPane=$(".kd-viz-pane",S.stage);
  let gApi=null,vSvg=null;
  if(o.graph&&vizPane){
    vizPane.innerHTML=`<svg role="img" aria-label="${(o.graph.alt||o.alt||"").replace(/"/g,"&quot;")}"></svg>`;
    vSvg=$("svg",vizPane);gApi=mountGraph(vSvg,S,o.graph,vizPane);
  } else if(o.visual&&vizPane){
    vizPane.innerHTML=`<svg viewBox="${o.visual.vb||"0 0 480 280"}" role="img" aria-label="${(o.visual.alt||o.alt||"").replace(/"/g,"&quot;")}"></svg>`;
    vSvg=$("svg",vizPane);if(o.visual.svg)V.put(vSvg,o.visual.svg);
  }
  const align=()=>{E.alignMath&&E.alignMath(S.stage)};
  requestAnimationFrame(align);if(window.ResizeObserver)new ResizeObserver(align).observe(S.stage);
  function clearTimers(li){(li._tm||[]).forEach(clearTimeout);li._tm=[]}
  function syncNav(li){
    const frames=framesList[+li.dataset.i];if(!frames)return;
    const fi=li._fi??0,rep=$(".kd-rep",li);
    if(rep){
      const playing=!!li._playing&&fi<frames.length-1;
      rep.classList.toggle("playing",playing);
      const u=$("use",rep);
      if(u)u.setAttribute("href",playing?"#i-pause":fi<frames.length-1?"#i-play":"#i-reset");
      rep.setAttribute("aria-label",playing?"Pause":fi<frames.length-1?"Play":E.t("replay"));
    }
    const bp=$('[data-nav="prev"]',li),bn=$('[data-nav="next"]',li);
    if(bp)bp.disabled=+li.dataset.i===0&&fi===0;
    if(bn)bn.disabled=+li.dataset.i===Ls.length-1&&fi===frames.length-1;
  }
  function showFrame(li,fi,animate){
    const idx=+li.dataset.i,frames=framesList[idx];if(!frames)return;
    fi=Math.max(0,Math.min(frames.length-1,fi));
    const prevFi=li._fi;li._fi=fi;
    const fc=$(".kd-fc",li);if(fc)fc.textContent=`${fi+1}/${frames.length}`;
    syncNav(li);
    const f=frames[fi],box=$(".kd-m",li);if(!box)return;
    $$("[data-tid],.m-cancel",box).forEach(el=>el.getAnimations&&el.getAnimations().forEach(a=>a.cancel()));
    if(f.strike&&prevFi===fi-1&&$(".m-cancel",box)){
      $$(".m-cancel",box).forEach(c=>c.setAttribute("data-cstate","strike"));
      return;
    }
    const prevMap=new Map();
    if(animate&&E.motionOn()){
      $$("[data-tid]",box).forEach(el=>{if(!prevMap.has(el.dataset.tid))prevMap.set(el.dataset.tid,{r:el.getBoundingClientRect(),t:el.textContent.replace(/\s+/g," ").trim()})});
    }
    box.innerHTML=Kit.math(f._m,{rows:true});
    const cs=$$(".m-cancel",box);
    cs.forEach(c=>c.setAttribute("data-cstate",(f.strike||!animate||!E.motionOn())?"strike":"show"));
    align();
    if(!animate||!E.motionOn())return;
    if(f._autoRow>0){
      $$(".eq-row",box).slice(f._autoRow).forEach(r=>r.animate([{transform:"translateY(7px)",opacity:0},{transform:"none",opacity:1}],{duration:480,easing:"cubic-bezier(0.23,1,0.32,1)"}));
      return;
    }
    if(f._autoTail){
      const row=$$(".eq-row",box).pop();
      if(row){
        let targets=$$(".eq-tail",row);
        if(!targets.length){
          const kids=[...row.children],ri=kids.map(k=>k.classList.contains("m-rel")).lastIndexOf(true);
          if(ri>=0)targets=kids.slice(ri);
        }
        targets.forEach(t=>t.animate([{transform:"translateY(5px) scale(.95)",opacity:0},{transform:"none",opacity:1}],{duration:520,easing:"cubic-bezier(0.23,1,0.32,1)"}));
        $$(".hi",row).forEach(h=>{h.classList.remove("m-merged");void h.offsetWidth;h.classList.add("m-merged")});
      }
      return;
    }
    if(!prevMap.size)return;
    const els=$$("[data-tid],.m-cancel",box),rects=els.map(el=>el.getBoundingClientRect());
    els.forEach((el,k)=>{
      const dr=rects[k],tid=el.dataset.tid,fromTid=f.from&&tid&&f.from[tid];
      const src=(fromTid&&prevMap.get(fromTid))||(tid&&prevMap.get(tid));
      if(fromTid&&prevMap.get(fromTid)){
        const sr=prevMap.get(fromTid).r,dx=sr.left-dr.left,dy=sr.top-dr.top;
        el.animate([{transform:`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(.86)`,opacity:.45},{transform:"none",opacity:1}],{duration:620,easing:"cubic-bezier(0.23,1,0.32,1)"});
      } else if(src){
        const curT=el.textContent.replace(/\s+/g," ").trim(),dx=src.r.left-dr.left,dy=src.r.top-dr.top;
        if(src.t===curT){
          if(Math.abs(dx)+Math.abs(dy)>1.5)el.animate([{transform:`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`},{transform:"none"}],{duration:520,easing:"cubic-bezier(0.23,1,0.32,1)"});
        } else {
          el.animate([{transform:`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(1.12,.9)`},{transform:"none"}],{duration:560,easing:"cubic-bezier(0.23,1,0.32,1)"});
          el.classList.remove("m-merged");void el.offsetWidth;el.classList.add("m-merged");
        }
      } else {
        el.animate([{transform:"translateY(-6px) scale(.88)",opacity:0},{transform:"none",opacity:1}],{duration:460,easing:"cubic-bezier(0.32,0.72,0,1)"});
      }
    });
  }
  function playFrames(li,startFi=0){
    clearTimers(li);
    const frames=framesList[+li.dataset.i];if(!frames)return;
    if(!E.motionOn()||frames.length<=1){li._playing=false;showFrame(li,frames.length-1,false);return}
    startFi=Math.max(0,Math.min(frames.length-1,startFi));
    li._playing=startFi<frames.length-1;
    showFrame(li,startFi,false);
    let t=0;
    for(let k=startFi+1;k<frames.length;k++){
      const prevF=frames[k-1],hold=prevF.dur?(prevF.dur<1200?Math.max(1450,Math.round(prevF.dur*1.85)):prevF.dur):(prevF.strike?1600:1450);
      t+=hold;
      const fin=k===frames.length-1;
      li._tm.push(setTimeout(()=>{if(fin)li._playing=false;showFrame(li,k,true)},t));
    }
  }
  function setLineMode(li,mode){
    const frames=framesList[+li.dataset.i];
    if(mode==="on"){playFrames(li,0);return}
    clearTimers(li);
    li._playing=false;
    showFrame(li,frames.length-1,false);
  }
  S.stage.addEventListener("click",e=>{
    const nav=e.target.closest(".kd-nbtn");
    if(nav){
      e.stopPropagation();if(player)player.stop();
      const li=nav.closest(".kd > li"),idx=+li.dataset.i,frames=framesList[idx],act=nav.dataset.nav;
      if(!li.classList.contains("on")){if(player)player.show(idx);return}
      clearTimers(li);
      if(act==="replay"){
        if(li._playing){li._playing=false;syncNav(li)}
        else playFrames(li,(li._fi??0)<frames.length-1?li._fi:0);
      } else {
        li._playing=false;
        if(act==="prev"){if(li._fi>0)showFrame(li,li._fi-1,true);else if(idx>0&&player)player.show(idx-1)}
        else if(act==="next"){if(li._fi<frames.length-1)showFrame(li,li._fi+1,true);else if(idx<Ls.length-1&&player)player.show(idx+1)}
      }
      return;
    }
    const tab=e.target.closest(".kd-tab");
    if(tab){
      e.stopPropagation();
      const li=tab.closest(".kd > li"),dr=$(".kd-drawer",li),pn=tab.dataset.panel,was=tab.getAttribute("aria-expanded")==="true";
      $$(".kd-tab",li).forEach(b=>b.setAttribute("aria-expanded","false"));
      $$(".kd-panel",li).forEach(p=>p.hidden=true);
      if(was){dr.classList.remove("open")}
      else{tab.setAttribute("aria-expanded","true");$(`.kd-panel[data-panel="${pn}"]`,li).hidden=false;dr.classList.add("open")}
      S.viz.dispatchEvent(new Event("visualstep",{bubbles:true}));
      setTimeout(()=>S.viz.dispatchEvent(new Event("visualstep",{bubbles:true})),270);
      return;
    }
    if(e.target.closest("button,a,.m-tok,.kd-drawer,.kd-viz-pane"))return;
    const li=e.target.closest(".kd > li[data-i]");
    if(li&&player){player.stop();player.show(+li.dataset.i)}
  });
  function animateTransfer(prev,cur){
    if(!E.motionOn()||prev==null||prev<0||prev===cur)return;
    if(framesList[cur]&&framesList[cur].length>1)return;
    const src=$(`.kd > li[data-i="${prev}"]`,S.stage),dst=$(`.kd > li[data-i="${cur}"]`,S.stage);
    if(!src||!dst)return;
    const sm=new Map();$$("[data-tid]",src).forEach(el=>{if(!sm.has(el.dataset.tid))sm.set(el.dataset.tid,el)});
    const pairs=[];
    $$("[data-tid]",dst).forEach(el=>{const s=sm.get(el.dataset.tid);if(s)pairs.push([s.getBoundingClientRect(),el.getBoundingClientRect(),el])});
    if(!pairs.length){
      const vm=new Map();
      $$(".m-var",src).forEach(el=>{const t=el.textContent.trim();if(t)vm.set(t,vm.has(t)?null:el)});
      $$(".m-var",dst).forEach(el=>{const t=el.textContent.trim(),s=vm.get(t);if(s)pairs.push([s.getBoundingClientRect(),el.getBoundingClientRect(),el])});
      const dm=$(".kd-m",dst);
      if(dm)dm.animate([{transform:"translateY(6px)",opacity:.25},{transform:"none",opacity:1}],{duration:420,easing:"cubic-bezier(0.23,1,0.32,1)"});
      $$(".hi",dst).forEach(h=>{h.classList.remove("m-merged");void h.offsetWidth;h.classList.add("m-merged")});
    }
    pairs.forEach(([sr,dr,el])=>{
      const dx=sr.left-dr.left,dy=sr.top-dr.top;
      if(Math.abs(dx)+Math.abs(dy)<4||Math.abs(dx)+Math.abs(dy)>700)return;
      el.animate([{transform:`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(1.06)`,opacity:.72},{transform:"none",opacity:1}],{duration:560,easing:"cubic-bezier(0.23,1,0.32,1)"});
    });
  }
  const steps=stepsOr(o,Ls.map((l,i)=>({t:l.t||(i?`Step ${i}`:"Start"),d:Kit.math(l.d||l.why||""),line:i})));
  const player=E.stepper(S.viz,steps,(i,prev)=>{const s=steps[i],k=s.line??i,pk=steps[prev]?(steps[prev].line??prev):-1;
    $$(".kd > li",S.stage).forEach(li=>{const j=+li.dataset.i,mode=j===k?"on":j<k?"past":"later";
      li.classList.toggle("on",mode==="on");li.classList.toggle("past",mode==="past");li.classList.toggle("later",mode==="later");
      setLineMode(li,mode)});
    if(gApi)gApi.apply(s.graph||s);
    if(o.visual&&o.visual.render&&vSvg)o.visual.render(i,vSvg,s);
    requestAnimationFrame(()=>{align();animateTransfer(pk,k)});
    if(o.on)o.on(i,S.stage,s,vSvg);},{ms:o.ms||(hasMulti?8200:4200),freeLabel:o.freeLabel});
  player.bar.addEventListener("click",e=>{
    const b=e.target.closest('[data-a="play"]');
    if(b&&!b.classList.contains("on")){
      const li=$(".kd > li.on",S.stage);
      if(li&&li._playing){clearTimers(li);li._playing=false;syncNav(li)}
    }
  });
  return player;
};

/* =================================================================
   9. annotate — a passage with highlighted parts (English, history
      sources, civics articles, religious-studies texts, poems)
      Passage syntax: [[words|key]] marks a phrase for note "key".
   ================================================================= */
Kit.annotate=(id,o)=>{
  const S=setup(id,"annotate");if(!S)return;
  S.stage.classList.add("kit-html");
  const keys=Object.keys(o.notes||{});
  const body=String(o.text).replace(/\[\[(.+?)\|([\w-]+)\]\]/g,(m,t,k)=>`<mark data-k="${k}" style="--kc:${(o.notes[k]&&o.notes[k].color)||PAL(Math.max(0,keys.indexOf(k)))}">${t}</mark>`);
  S.stage.innerHTML=`<blockquote class="ka-text${o.serif===false?"":" serif"}">${body}</blockquote>${o.source?`<div class="ka-src">${o.source}</div>`:""}`;
  const steps=stepsOr(o,keys.map(k=>({t:o.notes[k].t,d:o.notes[k].d||"",hi:[k]})));
  const seen=new Set();
  return E.stepper(S.viz,steps,(i)=>{const s=steps[i],hi=s.hi||[];seen.clear();steps.slice(0,i).forEach(x=>(x.hi||[]).forEach(k=>seen.add(k)));
    $$("mark",S.stage).forEach(m=>{const k=m.dataset.k;m.classList.toggle("on",hi.includes(k));m.classList.toggle("seen",!hi.includes(k)&&seen.has(k))});
    const first=$("mark.on",S.stage);if(first&&S.stage.scrollHeight>S.stage.clientHeight+4)first.scrollIntoView({block:"nearest"});if(o.on)o.on(i,S.stage,s);},{ms:o.ms||4500});
};

/* =================================================================
   10. tree — hierarchical / decision / search / SDD parse trees
   ================================================================= */
Kit.tree=(id,o)=>{
  const S=setup(id,"tree");if(!S||!o.root)return;
  const svg=svgIn(S,o.alt);
  const nodes=[],byId=new Map();
  function walk(nd,parent,depth){
    const i=nodes.length,cid=nd.id!=null?String(nd.id):"n"+i,ch=nd.children||[];
    const kind=nd.kind||(depth===0?"root":ch.length?"decision":"leaf");
    const role=roleKey(nd.role)||(kind==="leaf"?"r":kind==="pruned"?"k":kind==="term"?"v":kind==="nt"?"":(kind==="root"||kind==="decision"?"c":""));
    const er=roleKey(nd.edgeRole)||branchRole(nd.edge);
    const attrs=(nd.attrs||[]).map((a,ai)=>({ai,k:a.k||"",v:a.v!=null?String(a.v):"",role:roleKey(a.role)||(/^(s|val|v)$/i.test(a.k||"")?"r":/^i/i.test(a.k||"")?"c":"f"),use:a.use||"",pending:a.pending!=null?String(a.pending):"",at:a.at!=null?a.at:null}));
    const item={i,id:cid,parent,depth,t:nd.t||"",sub:nd.sub||"",tag:nd.tag||(kind==="pruned"?"✕ PRUNED":""),kind,role,color:nd.color||"",edge:nd.edge||"",edgeRole:er,use:nd.use||"",attrs,order:nd.order!=null?nd.order:null,children:[]};
    nodes.push(item);byId.set(cid,i);
    if(parent>=0)nodes[parent].children.push(i);
    ch.forEach(c=>walk(c,i,depth+1));
  }
  walk(o.root,-1,0);
  nodes.forEach(nd=>{const anc=[];let p=nd.parent;while(p>=0){anc.unshift(p);p=nodes[p].parent}nd.ancestors=anc});
  function subIds(i){const out=[i];nodes[i].children.forEach(c=>out.push(...subIds(c)));return out}
  nodes.forEach(nd=>nd.subtree=subIds(nd.i));
  const parseEnd=spec=>{const s=String(spec||""),d=s.indexOf(".");return d>0?{id:s.slice(0,d),attr:s.slice(d+1)}:{id:s,attr:null}};
  const deps=(o.deps||[]).map((d,di)=>{const f=parseEnd(d.from),t=parseEnd(d.to),kind=d.kind||(roleKey(d.role)==="c"?"inh":roleKey(d.role)==="f"?"merge":"syn");
    return {di,id:d.id!=null?String(d.id):"d"+di,from:f.id,fromAttr:d.fromAttr||f.attr,to:t.id,toAttr:d.toAttr||t.attr,kind,role:roleKey(d.role)||(kind==="inh"?"c":kind==="merge"?"f":"r"),label:d.label||"",use:d.use||"",curve:d.curve||0};
  });
  const hasDeps=deps.length>0,compact=o.compact!==undefined?!!o.compact:(hasDeps||nodes.length>9);
  const wantCam=o.zoom!==false;
  const bfs=[],q=[0];while(q.length){const u=q.shift();bfs.push(u);nodes[u].children.forEach(c=>q.push(c))}
  const steps=stepsOr(o,bfs.map((u,k)=>({t:nodes[u].t,d:nodes[u].use||nodes[u].sub||"",on:[nodes[u].id],reveal:bfs.slice(0,k+1).map(x=>nodes[x].id)})));
  const idxOf=x=>typeof x==="number"?x:byId.get(String(x));
  const depById=new Map(deps.map(d=>[d.id,d.di]));
  const depIdxOf=x=>typeof x==="number"?x:depById.get(String(x));
  const kindLabel={root:"ROOT",decision:"DECISION",branch:"BRANCH",leaf:"LEAF",pruned:"PRUNED",nt:"NONTERM",term:"TERM"};
  const kindGlyph={root:"◎",decision:"◆",branch:"▸",leaf:"✓",pruned:"✕",nt:"◇",term:"●"};
  const wantLeg=o.legend!==false;
  const an=wantLeg?mountAnatomy(S,{showUse:true,legend:o.legend,defaultUse:hasDeps?"Hover any node to isolate its attribute flow and grammar edges, or tap to jump to its evaluation step.":"Hover or tap any node to trace its path from the root and see its role."}):null;
  const memoHasHud=!!(o.memo&&(o.memo.hud||o.memo.steps?.some(s=>s.hud)));
  const hudEl=(o.hud||steps.some(s=>s.hud)||memoHasHud)?h("div",{class:"k-hud","aria-live":"polite",hidden:true}):null;
  const boardEl=o.board?h("div",{class:"k-tree-board"}):null;
  if(hudEl)S.stage.append(hudEl);
  if(boardEl){S.stage.classList.add("has-board");S.stage.insertBefore(boardEl,svg)}
  const renderHud=list=>{
    if(!hudEl)return;
    const arr=list||o.hud||[];hudEl.hidden=!arr.length;
    hudEl.innerHTML=arr.map(x=>{const rk=roleKey(x.role);return `<span class="k-hud-chip"${rk?` data-role="${rk}" style="--rc:var(--m-${rk})"`:""}><b>${escHtml(x.label)}</b><span>${escHtml(x.val)}</span></span>`}).join("");
  };
  const renderBoard=b=>{
    if(!boardEl||!o.board)return;
    const st=b||{},kind=o.board.kind||"queens",N=o.board.size||4;
    if(kind==="queens"){
      const qs=st.queens||[],tr=st.try,bd=st.bad,qSet=new Set(qs.map(p=>p[0]+","+p[1]));
      const atk=(r,c)=>qs.some(([qr,qc])=>qr===r||qc===c||Math.abs(qr-r)===Math.abs(qc-c));
      let cells="";
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){
        const key=r+","+c,isQ=qSet.has(key),isBad=bd&&bd[0]===r&&bd[1]===c,isTry=tr&&tr[0]===r&&tr[1]===c,isAtk=!isQ&&atk(r,c);
        const cls="k-qb-cell"+((r+c)%2?" dark":"")+(isQ?" is-q":"")+(isBad?" is-bad":"")+(isTry?" is-try":"")+(isAtk?" is-atk":"");
        cells+=`<div class="${cls}">${isQ||isBad||isTry?"♛":(isAtk?"×":"")}</div>`;
      }
      boardEl.innerHTML=`<div class="k-qb-title">${escHtml(st.title||"4-Queens Board")}</div><div class="k-qb-grid" style="--n:${N}">${cells}</div>`;
    } else if(kind==="sudoku"){
      const cellsData=st.cells||[];
      let cells="";
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){
        const idx=r*N+c,raw=cellsData[idx],isBoxR=r===1,isBoxC=c===1;
        let cls="k-sb-cell"+(isBoxR?" br-b":"")+(isBoxC?" br-r":""),inner="";
        if(raw&&typeof raw==="object"&&!Array.isArray(raw)){
          if(raw.v!=null){cls+=(raw.fixed?" is-fix":" is-val")+(raw.role?" is-"+roleKey(raw.role):"");inner=`<b>${escHtml(String(raw.v))}</b>`}
          else{
            const dom=raw.d||[],el=new Set(raw.elim||[]);
            cls+=" is-dom"+(raw.role?" is-"+roleKey(raw.role):"");
            inner=`<span class="k-sb-dom">${[1,2,3,4].map(d=>dom.includes(d)?`<i class="${el.has(d)?"el":""}">${d}</i>`:`<i class="off">·</i>`).join("")}</span>`;
          }
        } else if(Array.isArray(raw)){
          cls+=" is-dom";
          inner=`<span class="k-sb-dom">${[1,2,3,4].map(d=>raw.includes(d)?`<i>${d}</i>`:`<i class="off">·</i>`).join("")}</span>`;
        } else if(raw!=null&&raw!==""){
          cls+=" is-val";inner=`<b>${escHtml(String(raw))}</b>`;
        }
        cells+=`<div class="${cls}">${inner}</div>`;
      }
      boardEl.innerHTML=`<div class="k-qb-title">${escHtml(st.title||"4×4 Sudoku · AC-3 Domains")}</div><div class="k-sb-grid" style="--n:${N}">${cells}</div>`;
    }
  };
  let curP=[],curDepPillBoxes=new Map(),curEdgePillBoxes=new Map(),camEnabled=false;
  let cur=0,prevRev=new Set(nodes.map(n=>n.i)),prevDeps=new Set(),player=null;
  let cam=null;
  const updateCam=(instant=false)=>{
    if(!cam||!camEnabled)return;
    const s=steps[cur]||{},hasOv=steps.some(st=>st.overview);
    const isOv=s.overview===true||(cur===steps.length-1&&!hasOv);
    if((isOv&&cam.mode==="auto")||cam.mode==="all"){cam.focus(null,{isOverview:true,instant});return}
    const focusSet=new Set((s.on||[]).map(idxOf).filter(k=>k!=null));
    if(!hasDeps){
      [...focusSet].forEach(k=>{if(nodes[k].parent>=0)focusSet.add(nodes[k].parent)});
      (s.prune||[]).map(idxOf).filter(k=>k!=null).forEach(k=>{focusSet.add(k);if(nodes[k].parent>=0)focusSet.add(nodes[k].parent)});
    }
    const actD=new Set((s.deps||[]).map(depIdxOf).filter(k=>k!=null));
    deps.forEach(dp=>{if(actD.has(dp.di)){const fi=byId.get(dp.from),ti=byId.get(dp.to);if(fi!=null)focusSet.add(fi);if(ti!=null)focusSet.add(ti)}});
    let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9,any=false;
    focusSet.forEach(k=>{const p=curP[k];if(!p)return;any=true;x1=Math.min(x1,p.x);y1=Math.min(y1,p.y);x2=Math.max(x2,p.x+p.w);y2=Math.max(y2,p.y+p.h);const ep=curEdgePillBoxes.get(k);if(ep){x1=Math.min(x1,ep.x1);y1=Math.min(y1,ep.y1);x2=Math.max(x2,ep.x2);y2=Math.max(y2,ep.y2)}});
    actD.forEach(di=>{const r=curDepPillBoxes.get(di);if(r){any=true;x1=Math.min(x1,r.x1);y1=Math.min(y1,r.y1);x2=Math.max(x2,r.x2);y2=Math.max(y2,r.y2)}});
    let ax1=1e9,ay1=1e9,ax2=-1e9,ay2=-1e9,anyA=false;
    (s.on||[]).map(idxOf).forEach(k=>{const p=curP[k];if(!p)return;anyA=true;ax1=Math.min(ax1,p.x);ay1=Math.min(ay1,p.y);ax2=Math.max(ax2,p.x+p.w);ay2=Math.max(ay2,p.y+p.h)});
    const anchor=anyA?{x1:ax1,y1:ay1,x2:ax2,y2:ay2}:null;
    cam.focus(any?{x1,y1,x2,y2}:null,{isOverview:isOv,instant,anchor});
  };
  cam=wantCam?mountCamera(S,svg,{onMode:()=>updateCam(false)}):null;
  if(hudEl)S.stage.insertBefore(hudEl,cam?cam.bar:svg);
  if(an){
    let defLeg=[];
    if(hasDeps){
      if(deps.some(d=>d.kind==="syn"))defLeg.push({role:"r",label:"Synthesized (.s / .val)",swatch:"line",use:"Bottom-up semantic flow: computed from children or lexical value."});
      if(deps.some(d=>d.kind==="inh"))defLeg.push({role:"c",label:"Inherited (.i)",swatch:"line",use:"Top-down / sibling flow: passed from parent or left sibling before recursing."});
      if(deps.some(d=>d.kind==="merge"))defLeg.push({role:"f",label:"Combined Rule",swatch:"line",use:"Combines parent inherited context with child values."});
      if(nodes.some(nd=>nd.kind==="term"))defLeg.push({role:"v",label:"Terminal Token",swatch:"box",use:"Grammar token leaf along the bottom frontier."});
      defLeg.push({label:"Parse Skeleton",swatch:"line",color:"var(--ink-3)",use:"Quiet structural grammar derivation lines behind the attribute flow."});
    } else {
      const seenR=new Set();
      const roleMapLabel={c:"Split / Decision",r:"Leaf / Target",k:"Pruned / Cut",v:"Input / Variable",f:"Rule / Process",g:"Subtree / Group",a:"Highlight"};
      const roleSwatch={c:"dia",r:"dot",k:"cut",v:"box",f:"box",g:"area",a:"dot"};
      nodes.forEach(nd=>{const rk=nd.role;if(rk&&!seenR.has(rk)){seenR.add(rk);defLeg.push({role:rk,label:roleMapLabel[rk]||rk,swatch:roleSwatch[rk]||"box",use:`Nodes highlighted with the ${roleMapLabel[rk]||rk} role.`})}});
    }
    an.setItems(Array.isArray(o.legend)?o.legend:defLeg);an.wire(svg);
  }
  function countLeaves(i){return nodes[i].children.length?nodes[i].children.reduce((s,c)=>s+countLeaves(c),0):1}
  function layout(W){
    const leafN=countLeaves(0);
    const maxWord=Math.max(4,...nodes.map(nd=>Math.max(...String(nd.t).split(/\s+/).map(w=>w.length))));
    const minBw=Math.max(96,Math.min(156,Math.ceil(maxWord*8.1)+30));
    const isPhone=W<540;
    let gapX=compact?(hasDeps?24:(leafN>8?8:12)):(leafN>4?(isPhone?10:12):(isPhone?12:18));
    const rawBw=Math.floor((W-20-(leafN-1)*gapX)/Math.max(1,leafN));
    const attrTxt=a=>a.v?(a.k?`${a.k} = ${a.v}`:a.v):a.k;
    const estWidth=nd=>{
      if(compact&&nd.kind==="term")return Math.max(40,Math.min(86,Math.max(Math.ceil(nd.t.length*7.6),nd.sub?Math.ceil(nd.sub.length*6.6):0)+22));
      if(compact){
        const aw=nd.attrs.length?Math.max(...nd.attrs.map(a=>Math.ceil(attrTxt(a).length*6.9)+26)):0;
        const tw=Math.ceil(nd.t.length*8.4)+24+(nd.order!=null?24:0);
        const sw=nd.sub?Math.ceil(nd.sub.length*7)+22:0;
        const gW=nd.tag?Math.ceil(nd.tag.length*7.4)+32:0;
        return Math.max(66,Math.min(o.boxWidth||150,Math.max(tw,aw,sw,gW)));
      }
      return Math.min(o.boxWidth||186,Math.max(minBw,rawBw));
    };
    let nodeW=nodes.map(estWidth);
    const computeSubW=(nw,gx)=>{const sw=new Array(nodes.length).fill(0);for(let i=nodes.length-1;i>=0;i--){const nd=nodes[i];if(!nd.children.length)sw[i]=nw[i];else{const cw=nd.children.reduce((a,c)=>a+sw[c],0)+(nd.children.length-1)*gx;sw[i]=Math.max(nw[i],cw)}}return sw};
    let subW=compact?computeSubW(nodeW,gapX):[];
    let totalW=compact?subW[0]:(leafN*nodeW[0]+(leafN-1)*gapX);
    if(compact&&o.zoom===false&&W>=540&&o.orientation!=="left"&&totalW>W-16){
      const sc=Math.max(.68,(W-20)/totalW);
      gapX=Math.max(4,Math.floor(gapX*sc));
      nodeW=nodes.map((nd,i)=>Math.max(nd.kind==="term"?32:54,Math.floor(nodeW[i]*sc)));
      subW=computeSubW(nodeW,gapX);totalW=subW[0];
    }
    const useWide=o.orientation!=="left";
    const P=[];
    let natW=W,natH=200;
    const nodeText=(nd,bw)=>{
      if(compact&&nd.kind==="term")return {t:[nd.t],s:nd.sub?[nd.sub]:[],compact:true,term:true};
      if(compact)return {t:fit(nd.t,bw-(nd.order!=null?34:18),13.5),s:nd.sub?fit(nd.sub,bw-18,11.5):[],compact:true,term:false};
      return {t:fit(nd.t,bw-28,14),s:nd.sub?fit(nd.sub,bw-28,12):[],compact:false,term:false};
    };
    const nodeHeight=(nd,w)=>{
      if(w.term)return 10+16+(w.s.length?14:0)+8;
      if(w.compact)return 8+w.t.length*16+(nd.attrs.length?3+nd.attrs.length*16:0)+(w.s.length?3+w.s.length*14:0)+(nd.tag?24:0)+8;
      return 14+15+w.t.length*18+(w.s.length?3+w.s.length*15.5:0)+(nd.tag?28:0)+12;
    };
    if(useWide){
      natW=compact?Math.max(W,Math.ceil(totalW+(W<540?28:56))):Math.max(W,Math.ceil(totalW+(W<540?18:28)));
      const wr=nodes.map((nd,i)=>nodeText(nd,nodeW[i]));
      const hh=wr.map((w,i)=>nodeHeight(nodes[i],w));
      const maxD=Math.max(...nodes.map(nd=>nd.depth));
      const rowH=[],hasEdge=[];
      for(let d=0;d<=maxD;d++){rowH[d]=Math.max(...nodes.filter(n=>n.depth===d).map(n=>hh[n.i]));hasEdge[d]=nodes.some(n=>n.depth===d&&n.edge)}
      const gapY=hasDeps?46:38;
      const yAt=[];let y=18;for(let d=0;d<=maxD;d++){if(d>0)y+=rowH[d-1]+(hasEdge[d]?64:gapY);yAt[d]=y}
      if(compact){
        const ox=Math.max(24,(natW-totalW)/2);
        const place=(i,leftX)=>{
          const nd=nodes[i],w=nodeW[i],h=nd.kind==="term"?hh[i]:rowH[nd.depth];
          if(!nd.children.length){const cx=leftX+subW[i]/2;P[i]={x:cx-w/2,cx,y:yAt[nd.depth],w,h,wr:wr[i]};return}
          const ch=nd.children,cw=ch.reduce((a,c)=>a+subW[c],0)+(ch.length-1)*gapX;
          let cx0=leftX+(subW[i]-cw)/2;
          ch.forEach(c=>{place(c,cx0);cx0+=subW[c]+gapX});
          const rawCx=(P[ch[0]].cx+P[ch[ch.length-1]].cx)/2;
          const cx=Math.max(leftX+w/2,Math.min(leftX+subW[i]-w/2,rawCx));
          P[i]={x:cx-w/2,cx,y:yAt[nd.depth],w,h,wr:wr[i]};
        };
        place(0,ox);
      } else {
        const bw=nodeW[0],ox=(natW-(leafN*bw+(leafN-1)*gapX))/2;
        let lx=0;
        const assignX=i=>{const nd=nodes[i];
          if(!nd.children.length){const cx=ox+lx*(bw+gapX)+bw/2;lx++;P[i]={x:cx-bw/2,cx,y:yAt[nd.depth],w:bw,h:rowH[nd.depth],wr:wr[i]}}
          else{nd.children.forEach(assignX);const cx=(P[nd.children[0]].cx+P[nd.children[nd.children.length-1]].cx)/2;P[i]={x:cx-bw/2,cx,y:yAt[nd.depth],w:bw,h:rowH[nd.depth],wr:wr[i]}}};
        assignX(0);
      }
      natH=Math.max(...nodes.map(nd=>P[nd.i].y+P[nd.i].h))+26;
    } else {
      const gutter=hasDeps?Math.min(72,Math.max(48,Math.floor(W*.18))):0;
      const indent=Math.min(hasDeps?14:20,Math.max(10,Math.floor(W*(hasDeps?.032:.045))));
      const order=[];(function dfs(i){order.push(i);nodes[i].children.forEach(dfs)})(0);
      let y=12;
      order.forEach((i,k)=>{const nd=nodes[i],x=10+nd.depth*indent,bw=Math.max(134,W-x-10-gutter);
        if(k>0)y+=nd.edge?30:(compact?11:14);
        const w=nodeText(nd,bw),h=nodeHeight(nd,w);
        P[i]={x,cx:x+bw/2,y,w:bw,h,wr:w};y+=h;
      });
      natH=y+16;
    }
    curP=P;curDepPillBoxes=new Map();curEdgePillBoxes=new Map();
    camEnabled=wantCam&&(hasDeps||nodes.length>9||natW>W+4||(W<540&&nodes.length>=4));
    const attrPos=(nd,p)=>{const out={};if(!nd.attrs.length)return out;
      const base=p.y+8+p.wr.t.length*16+3;
      nd.attrs.forEach((a,ai)=>{out[a.k]={y:base+ai*16+8,ai}});
      return out;
    };
    const Apos=nodes.map(nd=>attrPos(nd,P[nd.i]));
    if(cam)cam.setNatural(natW,natH,{enabled:camEnabled,viewW:W,verticalOnly:!useWide,boxes:P.map(p=>({y1:p.y,y2:p.y+p.h}))});else svg.setAttribute("viewBox",`0 0 ${natW} ${natH}`);
    const edgeRoles=[...new Set([...nodes.map(nd=>nd.edgeRole||nd.role),...deps.map(d=>d.role)].filter(Boolean))];
    let s=edgeMarkers(S.uid,edgeRoles);
    const treeBoxes=P.map(p=>({x1:p.x-4,y1:p.y-4,x2:p.x+p.w+4,y2:p.y+p.h+4})),treePlaced=[];
    let edgePillsHtml="";
    s+=`<g class="k-skel-layer">`;
    nodes.forEach(nd=>{
      if(nd.parent<0)return;
      const A=P[nd.parent],B=P[nd.i],erk=nd.edgeRole||nd.role,rc=nd.color||(erk?`var(--m-${erk})`:"var(--pc)");
      let d,px,py;
      if(useWide){
        const x1=A.cx,y1=A.y+A.h,x2=B.cx,y2=B.y-(hasDeps?1:2),ym=(y1+y2)/2,t=.62,mt=1-t;
        d=`M${x1.toFixed(1)},${y1.toFixed(1)} C${x1.toFixed(1)},${ym.toFixed(1)} ${x2.toFixed(1)},${ym.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
        px=(mt**3+3*mt*mt*t)*x1+(3*mt*t*t+t**3)*x2;
        py=mt**3*y1+3*mt*mt*t*ym+3*mt*t*t*ym+t**3*y2;
      } else {
        const sx=A.x+10,sy=A.y+A.h,ex=B.x-1,ey=B.y+B.h/2;
        d=`M${sx.toFixed(1)},${sy.toFixed(1)} V${ey.toFixed(1)} H${ex.toFixed(1)}`;
        const pw=nd.edge?Math.max(28,Math.ceil(nd.edge.length*11*.66)+22):0;
        px=Math.max(B.x+pw/2+4,sx+pw/2+8);py=B.y-15;
      }
      const cls=hasDeps?"k-tree-edge k-tree-skel":"k-tree-edge";
      s+=`<path class="${cls}" data-c="${nd.i}"${erk?` data-er="${erk}"`:""} style="--rc:${rc}" d="${d}"/>`;
      if(nd.edge){
        const pos=placeClearPill(px,py,nd.edge,treeBoxes,treePlaced,natW,natH,11,26);
        curEdgePillBoxes.set(nd.i,pos.r);
        edgePillsHtml+=`<g class="k-edge-pill" data-c="${nd.i}">${pillSvg(pos.x,pos.y,nd.edge,{W:natW,H:natH,fs:11,cls:"k-epill",tcls:"k-epill-t",role:erk,minW:26})}</g>`;
      }
    });
    s+=`</g><g class="k-node-layer">`;
    nodes.forEach(nd=>{
      const p=P[nd.i],w=p.wr,rk=nd.role,rc=nd.color||(rk?`var(--m-${rk})`:"var(--pc)");
      const rx=w.term?12:(nd.kind==="leaf"?18:(compact?10:13)),gId=S.uid+"-tc"+nd.i;
      const cls="k-tn clickable"+(w.term?" k-term":"")+(compact?" k-compact":"");
      let t=`<g class="${cls}" data-i="${nd.i}" tabindex="0" role="button" aria-label="${escAttr(nd.t)}"${rk?` data-role="${rk}"`:""}${nd.use?` data-use="${escAttr(nd.use)}" data-uname="${escAttr(nd.t)}"`:""} style="--rc:${rc}">`;
      t+=`<clipPath id="${gId}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx}"/></clipPath>`;
      if(w.term){
        t+=`<rect class="k-node k-term-box" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx}"/>`;
        t+=`<text class="k-term-t" x="${p.cx}" y="${p.y+(w.s.length?18:p.h/2+4.5)}" text-anchor="middle">${escHtml(nd.t)}</text>`;
        if(w.s.length)t+=`<text class="k-s" x="${p.cx}" y="${p.y+31}" text-anchor="middle">${escHtml(nd.sub)}</text>`;
      } else {
        t+=`<rect class="k-node" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx}"/>`;
        t+=`<rect class="k-accent" x="${p.x}" y="${p.y}" width="${compact?4:5}" height="${p.h}" clip-path="url(#${gId})"/>`;
        const padL=compact?10:14;
        if(!compact)t+=`<text class="k-kind" x="${p.x+padL}" y="${p.y+20}">${kindGlyph[nd.kind]||"•"} ${kindLabel[nd.kind]||nd.kind.toUpperCase()}</text>`;
        const ty=compact?p.y+19:p.y+36,lh=compact?16:18;
        t+=tlines(p.x+padL,ty,w.t,"k-t",lh);
        if(nd.order!=null){const ox=p.x+p.w-12,oy=p.y+12;t+=`<g class="k-ord"><circle cx="${ox}" cy="${oy}" r="8"/><text class="k-ord-t" x="${ox}" y="${oy+3.5}" text-anchor="middle">${escHtml(String(nd.order))}</text></g>`}
        if(nd.attrs.length){
          const ab=p.y+8+w.t.length*16+3;
          nd.attrs.forEach((a,ai)=>{
            const ry=ab+ai*16,col=roleCol(a.role,"var(--pc)"),full=attrTxt(a),pend=a.pending||(a.k?`${a.k} = ?`:"?");
            t+=`<g class="k-attr-row" data-k="${escAttr(a.k)}" data-full="${escAttr(full)}" data-pend="${escAttr(pend)}"><circle class="k-attr-dot" cx="${p.x+10}" cy="${ry+8}" r="2.7" style="fill:${col}"/><text class="k-attr-t" x="${p.x+16}" y="${ry+12}">${escHtml(full)}</text></g>`;
          });
        }
        const sy=compact?(p.y+8+w.t.length*16+(nd.attrs.length?3+nd.attrs.length*16:0)+14):(p.y+36+w.t.length*18+2);
        if(w.s.length)t+=tlines(p.x+padL,sy,w.s,"k-s",compact?14:15.5);
        if(nd.tag){const tw=Math.min(p.w-16,Math.ceil(nd.tag.length*7.2)+20);t+=`<g class="k-tag"><rect x="${p.x+padL}" y="${p.y+p.h-26}" width="${tw}" height="19" rx="9.5"/><text class="k-c" x="${p.x+padL+9}" y="${p.y+p.h-13.5}">${escHtml(nd.tag)}</text></g>`}
        t+=`<line class="k-slash hide" x1="${p.x+8}" y1="${p.y+p.h-8}" x2="${p.x+p.w-8}" y2="${p.y+8}"/>`;
      }
      s+=t+"</g>";
    });
    s+=`</g>`+edgePillsHtml;
    if(hasDeps){
      const boxes=P.map(p=>({x1:p.x-5,y1:p.y-5,x2:p.x+p.w+5,y2:p.y+p.h+5}));
      const placedPills=[];
      const hit=(r,a)=>r.x1<a.x2&&r.x2>a.x1&&r.y1<a.y2&&r.y2>a.y1;
      const sideOut=new Set(),sideIn=new Set();
      if(useWide){
        deps.forEach(dp=>{
          const fi=byId.get(dp.from),ti=byId.get(dp.to);if(fi==null||ti==null)return;
          const fp=P[fi],tp=P[ti];
          if(Math.abs(fp.y-tp.y)<18){
            const lr=tp.cx>=fp.cx,hgap=lr?(tp.x-(fp.x+fp.w)):(fp.x-(tp.x+tp.w));
            const pwEst=dp.label?Math.max(28,Math.ceil(dp.label.length*10.5*.66)+22):28;
            if(hgap>=pwEst+20){sideOut.add(`${fi}:${lr?"R":"L"}`);sideIn.add(`${ti}:${lr?"L":"R"}`)}
          } else if(fp.y>tp.y){
            if(Math.abs(fp.cx-tp.cx)>24)sideIn.add(`${ti}:${fp.cx>tp.cx+24?"R":"L"}`);
          } else if(tp.x>=fp.x+fp.w+18||tp.x+tp.w<=fp.x-18){
            const lr=tp.cx>=fp.cx;sideOut.add(`${fi}:${lr?"R":"L"}`);sideIn.add(`${ti}:${lr?"L":"R"}`);
          }
        });
      }
      s+=`<g class="k-dep-layer">`;
      const pillDefs=[];
      deps.forEach(dp=>{
        const fi=byId.get(dp.from),ti=byId.get(dp.to);if(fi==null||ti==null)return;
        const fp=P[fi],tp=P[ti];
        const fy=dp.fromAttr&&Apos[fi][dp.fromAttr]?Apos[fi][dp.fromAttr].y:fp.y+fp.h/2;
        const ty=dp.toAttr&&Apos[ti][dp.toAttr]?Apos[ti][dp.toAttr].y:tp.y+tp.h/2;
        let x1,y1,x2,y2,c1x,c1y,c2x,c2y,mx,my;
        if(useWide){
          if(Math.abs(fp.y-tp.y)<18){
            const lr=tp.cx>=fp.cx,hgap=lr?(tp.x-(fp.x+fp.w)):(fp.x-(tp.x+tp.w));
            const pwEst=dp.label?Math.max(28,Math.ceil(dp.label.length*10.5*.66)+22):28;
            if(hgap<pwEst+20){
              const xL=Math.min(fp.x,tp.x),xR=Math.max(fp.x+fp.w,tp.x+tp.w);
              const upY=Math.min(fp.y,tp.y)-22,dnY=Math.max(fp.y+fp.h,tp.y+tp.h)+22;
              const upHits=boxes.filter(b=>hit({x1:xL,y1:upY-12,x2:xR,y2:upY+12},b)).length;
              const dnHits=boxes.filter(b=>hit({x1:xL,y1:dnY-12,x2:xR,y2:dnY+12},b)).length;
              const useBelow=dnHits<=upHits;
              x1=fp.x+(lr?fp.w*.78:fp.w*.22);y1=useBelow?fp.y+fp.h:fp.y;
              x2=tp.x+(lr?tp.w*.22:tp.w*.78);y2=useBelow?tp.y+tp.h+1:tp.y-1;
              const arcY=useBelow?dnY+4:upY-4;
              c1x=x1+(x2-x1)*.25;c1y=arcY;c2x=x1+(x2-x1)*.75;c2y=arcY;
            } else {
              const ox=lr?"R":"L",ix=lr?"L":"R";
              x1=lr?fp.x+fp.w:fp.x;y1=sideIn.has(`${fi}:${ox}`)?Math.max(fp.y+8,fy-6):fy;
              x2=lr?tp.x-1:tp.x+tp.w+1;y2=sideOut.has(`${ti}:${ix}`)?Math.min(tp.y+tp.h-8,ty+7):ty;
              const arch=dp.curve||(lr?-18:18);c1x=x1+(x2-x1)*.33;c1y=y1+arch;c2x=x1+(x2-x1)*.67;c2y=y2+arch;
            }
          } else if(fp.y>tp.y){
            if(Math.abs(fp.cx-tp.cx)>24){
              const rightSide=fp.cx>tp.cx+24,side=rightSide?"R":"L";
              x1=rightSide?fp.x+fp.w*.72:fp.x+fp.w*.28;y1=fp.y;
              x2=rightSide?tp.x+tp.w+1:tp.x-1;
              y2=sideOut.has(`${ti}:${side}`)?Math.min(tp.y+tp.h-8,ty+7):ty;
              c1x=x1;c1y=(y1+y2)*.45;c2x=x2+(rightSide?28:-28);c2y=y2;
            } else {
              x1=fp.cx;y1=fp.y;x2=tp.cx;y2=tp.y+tp.h+1;
              const bulge=dp.curve||18;c1x=x1+bulge;c1y=(y1+y2)*.55;c2x=x2+bulge*.35;c2y=y2+16;
            }
          } else if(tp.x>=fp.x+fp.w+18||tp.x+tp.w<=fp.x-18){
            const lr=tp.cx>=fp.cx,ox=lr?"R":"L",ix=lr?"L":"R";
            x1=lr?fp.x+fp.w:fp.x;y1=sideIn.has(`${fi}:${ox}`)?Math.max(fp.y+8,fy-6):fy;
            x2=lr?tp.x-1:tp.x+tp.w+1;y2=sideOut.has(`${ti}:${ix}`)?Math.min(tp.y+tp.h-8,ty+7):ty;
            const b=dp.curve||(lr?22:-22);c1x=x1+b;c1y=y1;c2x=x2-b;c2y=y2;
          } else {
            const lr=tp.cx>=fp.cx;
            x1=fp.x+fp.w*(lr?.72:.28);y1=fp.y+fp.h;
            x2=tp.x+tp.w*(lr?.32:.68);y2=tp.y-1;
            const ym=(y1+y2)/2;c1x=x1;c1y=ym;c2x=x2;c2y=ym;
          }
          mx=(x1+3*c1x+3*c2x+x2)/8;my=(y1+3*c1y+3*c2y+y2)/8;
        } else {
          const laneX=natW-10-(dp.di%4)*9;
          x1=fp.x+fp.w;y1=fy;x2=tp.x+tp.w+1;y2=ty;
          c1x=laneX;c1y=y1;c2x=laneX;c2y=y2;
          mx=laneX-18;my=(y1+y2)/2;
        }
        let px=mx,py=my;
        if(dp.label){
          const pos=placeClearPill(mx,my,dp.label,boxes,placedPills,natW,natH,10.5,28);
          px=pos.x;py=pos.y;curDepPillBoxes.set(dp.di,pos.r);
          if(pos.moved&&useWide){c1x+=(px-mx)*.25;c1y+=(py-my)*.25}
          pillDefs.push({dp,mx:px,my:py});
        }
        const rc=roleCol(dp.role,"var(--pc)");
        const dPath=`M${x1.toFixed(1)},${y1.toFixed(1)} C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
        s+=`<path class="k-dep-edge${dp.use?" clickable":""}" data-d="${dp.di}" data-f="${fi}" data-t="${ti}" data-kind="${dp.kind}" data-role="${dp.role}" style="--rc:${rc}"${dp.use?` data-use="${escAttr(dp.use)}" data-uname="${escAttr(dp.label||dp.kind)}"`:""} d="${dPath}"/>`;
      });
      pillDefs.forEach(({dp,mx,my})=>{
        s+=`<g class="k-dep-pill hide" data-d="${dp.di}">${pillSvg(mx,my,dp.label,{W:natW,H:natH,fs:10.5,cls:"k-epill",tcls:"k-epill-t",role:dp.role,on:true,minW:28})}</g>`;
      });
      s+=`</g>`;
    }
    svg.innerHTML=s;prepEdgeLengths(svg);render(cur,true);
  }
  function render(i,instant=false){cur=i;const s=steps[i]||{};
    const expandAnc=arr=>{const out=new Set();(arr||[]).forEach(x=>{const k=idxOf(x);if(k!=null&&k>=0){out.add(k);nodes[k].ancestors.forEach(a=>out.add(a))}});return out};
    const rev=(s.reveal==="all"||s.reveal==null)?new Set(nodes.map(n=>n.i)):expandAnc(s.reveal);
    const on=new Set((s.on||[]).map(idxOf).filter(k=>k!=null));
    const pruned=new Set();(s.prune||[]).forEach(x=>{const k=idxOf(x);if(k!=null&&k>=0)nodes[k].subtree.forEach(u=>pruned.add(u))});
    nodes.forEach(nd=>{if(nd.kind==="pruned")nd.subtree.forEach(u=>pruned.add(u))});
    const path=s.path?expandAnc(s.path):((!hasDeps&&o.showPath!==false)?expandAnc([...on]):new Set());
    const visit=new Set((s.visit||[]).map(idxOf).filter(k=>k!=null));
    const actDeps=new Set((s.deps||[]).map(depIdxOf).filter(k=>k!=null));
    const doneDeps=new Set((s.doneDeps||[]).map(depIdxOf).filter(k=>k!=null));
    const stepOrder=s.order!=null?s.order:null;
    const revAttrs=s.attrs?new Set(Array.isArray(s.attrs)?s.attrs:Object.keys(s.attrs)):null;
    $$(".k-tn",svg).forEach(g=>{const k=+g.dataset.i,nd=nodes[k],vis=rev.has(k),isNew=vis&&!prevRev.has(k);
      g.classList.toggle("hide",!vis);
      g.classList.toggle("k-pop",isNew&&E.motionOn());
      g.classList.toggle("on",on.has(k));
      g.classList.toggle("pruned",pruned.has(k));
      g.classList.toggle("path",path.has(k)&&!pruned.has(k));
      g.classList.toggle("done",!on.has(k)&&!pruned.has(k)&&(visit.has(k)||path.has(k)||(stepOrder!=null&&nd.order!=null&&nd.order<=stepOrder)));
      g.classList.toggle("todo",vis&&!on.has(k)&&!visit.has(k)&&!path.has(k)&&!pruned.has(k));
      const sl=$(".k-slash",g);if(sl)sl.classList.toggle("hide",!pruned.has(k));
      if(nd.attrs.length){
        $$(".k-attr-row",g).forEach((row,ai)=>{
          const a=nd.attrs[ai];if(!a)return;
          const attrId=`${nd.id}.${a.k}`;
          const showFull=(revAttrs?revAttrs.has(attrId)||revAttrs.has(a.k):true)&&(a.at==null||(stepOrder!=null?a.at<=stepOrder:i>=a.at));
          const tx=$(".k-attr-t",row);if(tx)tx.textContent=showFull?row.dataset.full:row.dataset.pend;
          row.classList.toggle("pend",!showFull);
        });
      }
    });
    $$(".k-tree-edge",svg).forEach(e=>{const k=+e.dataset.c,vis=rev.has(k),isNew=vis&&!prevRev.has(k),isPr=pruned.has(k),isPa=path.has(k)&&!isPr,isDn=isPa||visit.has(k),erk=e.dataset.er,isSk=e.classList.contains("k-tree-skel");
      e.classList.toggle("hide",!vis);
      e.classList.toggle("k-tree-draw",isNew&&E.motionOn());
      e.classList.toggle("pruned",isPr);
      e.classList.toggle("path",isPa);
      e.classList.toggle("done",!isSk&&isDn&&!isPr);
      e.classList.toggle("todo",!isSk&&vis&&!isDn&&!isPr);
      if(!isSk)e.setAttribute("marker-end",`url(#${S.uid}-${isDn&&!isPr?(erk?"on-"+erk:"on"):"off"})`);
    });
    $$(".k-edge-pill",svg).forEach(p=>{const k=+p.dataset.c,vis=rev.has(k);p.classList.toggle("hide",!vis);
      const r=$(".k-epill",p);if(r)r.classList.toggle("on",path.has(k)&&!pruned.has(k))});
    if(hasDeps){
      $$(".k-dep-edge",svg).forEach(e=>{const di=+e.dataset.d,dp=deps[di];if(!dp)return;
        const fi=byId.get(dp.from),ti=byId.get(dp.to),vis=rev.has(fi)&&rev.has(ti);
        const isAct=actDeps.has(di),isDone=doneDeps.has(di)&&!isAct,isNew=isAct&&!prevDeps.has(di);
        e.classList.toggle("hide",!vis);
        e.classList.toggle("on",isAct);
        e.classList.toggle("done",isDone);
        e.classList.toggle("todo",vis&&!isAct&&!isDone);
        e.classList.toggle("k-inh-flow",dp.kind==="inh"&&isAct&&E.motionOn());
        e.classList.toggle("k-tree-draw",dp.kind!=="inh"&&isNew&&E.motionOn());
        e.setAttribute("marker-end",`url(#${S.uid}-${(isAct||isDone)?"on-"+dp.role:"off-"+dp.role})`);
      });
      $$(".k-dep-pill",svg).forEach(p=>{const di=+p.dataset.d;p.classList.toggle("hide",!actDeps.has(di))});
      prevDeps=new Set([...actDeps,...doneDeps]);
    }
    prevRev=rev;
    renderHud(s.hud);
    if(o.board)renderBoard(s.board);
    updateCam(instant);
    if(an&&on.size===1){const u=[...on][0];if(nodes[u]?.use)an.showUse(nodes[u].t,nodes[u].use,roleCol(nodes[u].role,"var(--pc)"))}
    if(o.on)o.on(i,svg,s);
  }
  const jumpTree=g=>{if(svg._camDragged)return;const k=+g.dataset.i,nd=nodes[k];if(!nd)return;
    const si=steps.findIndex(s=>(s.on||[]).map(idxOf).includes(k));
    if(si>=0&&player){player.stop();player.show(si)}
    if(an&&nd.use)an.showUse(nd.t,nd.use,roleCol(nd.role,"var(--pc)"));
  };
  svg.addEventListener("pointerover",e=>{const g=e.target.closest(".k-tn");if(!g||svg.closest(".m-has-focus"))return;
    const k=+g.dataset.i,nd=nodes[k];if(!nd)return;
    if(hasDeps){
      const keepN=new Set([k]),keepD=new Set();
      deps.forEach(dp=>{const fi=byId.get(dp.from),ti=byId.get(dp.to);if(fi===k||ti===k){keepD.add(dp.di);if(fi!=null)keepN.add(fi);if(ti!=null)keepN.add(ti)}});
      if(nd.parent>=0)keepN.add(nd.parent);nd.children.forEach(c=>keepN.add(c));
      $$(".k-tn",svg).forEach(n=>n.style.opacity=keepN.has(+n.dataset.i)?"1":".24");
      $$(".k-tree-skel",svg).forEach(ed=>{const c=+ed.dataset.c,p=nodes[c]?.parent;ed.style.opacity=(c===k||p===k)?".7":".12"});
      $$(".k-dep-edge",svg).forEach(ed=>ed.style.opacity=keepD.has(+ed.dataset.d)?"1":".14");
    } else {
      const anc=new Set([...nd.ancestors,k]);
      $$(".k-tn",svg).forEach(n=>{const m=anc.has(+n.dataset.i);n.style.opacity=m?"1":".3"});
      $$(".k-tree-edge",svg).forEach(ed=>{const m=anc.has(+ed.dataset.c);ed.style.opacity=m?"1":".2"});
    }
  });
  svg.addEventListener("pointerleave",()=>{$$(".k-tn,.k-tree-edge,.k-dep-edge",svg).forEach(n=>n.style.opacity="")});
  svg.addEventListener("click",e=>{const g=e.target.closest(".k-tn");if(g)jumpTree(g)});
  svg.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".k-tn")){e.preventDefault();jumpTree(e.target)}});
  let activeMode=0,lastW=640,dagCore=null,dagSvg=null;
  if(o.memo&&o.memo.nodes?.length){
    dagSvg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    dagSvg.setAttribute("class","hide");
    dagSvg.setAttribute("role","img");
    dagSvg.setAttribute("aria-label",o.memo.alt||"Memoization DAG");
    dagSvg.setAttribute("hidden","");
    S.stage.insertBefore(dagSvg,svg.nextSibling);
    dagCore=mountDagCore(S,dagSvg,o.memo,{an,hudEl,getPlayer:()=>player,mountPlayer:false});
    dagSvg.classList.add("hide");dagSvg.setAttribute("hidden","");
    if(dagCore.cam)dagCore.cam.bar.hidden=true;
    mountTabs(S,[{label:o.memo.treeLabel||"Recursion Tree O(2ⁿ)"},{label:o.memo.dagLabel||"Memoization DAG O(n)"}],idx=>{
      activeMode=idx;
      const isDag=idx===1;
      svg.classList.toggle("hide",isDag);if(isDag)svg.setAttribute("hidden","");else svg.removeAttribute("hidden");
      if(cam)cam.bar.hidden=isDag||!camEnabled;
      dagSvg.classList.toggle("hide",!isDag);if(isDag)dagSvg.removeAttribute("hidden");else dagSvg.setAttribute("hidden","");
      if(dagCore.cam)dagCore.cam.bar.hidden=!isDag||!dagCore.camEnabled;
      if(isDag)dagCore.layout(lastW);else layout(lastW);
      if(player)player.setSteps(isDag?dagCore.steps:steps,0);
    });
  }
  responsive(S,w=>{lastW=w;layout(w);if(dagCore&&activeMode===1)dagCore.layout(w)});
  player=E.stepper(S.viz,steps,(i,prev)=>{if(activeMode===1&&dagCore)dagCore.render(i);else render(i)},{ms:o.ms});
  return player;
};

/* =================================================================
   11. dag — general directed acyclic graphs (Sugiyama layered DAG)
   ================================================================= */
function mountDagCore(S,svg,o,opts={}){
  const rawN=o.nodes,rawE=o.edges||[];
  const byId=new Map();
  const nodes=rawN.map((nd,i)=>{const cid=nd.id!=null?String(nd.id):"n"+i;byId.set(cid,i);
    return {i,id:cid,t:nd.t||cid,sub:nd.sub||"",tag:nd.tag||"",role:roleKey(nd.role)||"",color:nd.color||"",layer:nd.layer!=null?nd.layer:null,order:nd.order!=null?nd.order:null,shared:nd.shared===true,use:nd.use||"",preds:[],succs:[]};
  });
  const edges=[];
  rawE.forEach((ed,ei)=>{
    const u=byId.get(String(ed.from)),v=byId.get(String(ed.to));
    if(u==null||v==null||u===v)return;
    nodes[u].succs.push(v);nodes[v].preds.push(u);
    edges.push({ei,id:ed.id!=null?String(ed.id):"e"+ei,u,v,label:ed.label||"",role:roleKey(ed.role)||"",kind:ed.kind||"",use:ed.use||""});
  });
  nodes.forEach(nd=>{
    if(nd.preds.length>1)nd.shared=true;
    if(!nd.role)nd.role=nd.preds.length===0?"v":(nd.shared?"f":(nd.succs.length===0?"r":"c"));
  });
  edges.forEach(ed=>{if(!ed.role)ed.role=nodes[ed.v].shared?"f":(nodes[ed.u].role||"c")});
  const indeg=nodes.map(nd=>nd.preds.length),q=[],topo=[];
  indeg.forEach((d,i)=>{if(d===0)q.push(i)});
  while(q.length){const u=q.shift();topo.push(u);nodes[u].succs.forEach(v=>{indeg[v]--;if(indeg[v]===0)q.push(v)})}
  if(topo.length<nodes.length)nodes.forEach(nd=>{if(!topo.includes(nd.i))topo.push(nd.i)});
  const topoRank=new Array(nodes.length).fill(0);
  topo.forEach((u,rk)=>{topoRank[u]=rk;if(nodes[u].order==null&&o.showOrder!==false)nodes[u].order=rk+1});
  const rank=new Array(nodes.length).fill(0);
  topo.forEach(u=>{const nd=nodes[u];if(nd.layer!=null)rank[u]=nd.layer;else if(nd.preds.length)rank[u]=Math.max(...nd.preds.map(p=>rank[p]+1))});
  const maxL=Math.max(0,...rank);
  if(o.rankDir==="BT")rank.forEach((r,i)=>{rank[i]=maxL-r});
  const layers=Array.from({length:maxL+1},()=>[]);
  nodes.forEach(nd=>layers[rank[nd.i]].push(nd.i));
  const barySort=(L,refL,adj)=>{
    const pos=new Map();refL.forEach((u,k)=>pos.set(u,k));
    layers[L].sort((a,b)=>{
      const nsA=adj(a).filter(x=>pos.has(x)),nsB=adj(b).filter(x=>pos.has(x));
      const ba=nsA.length?nsA.reduce((s,x)=>s+pos.get(x),0)/nsA.length:nodes[a].i;
      const bb=nsB.length?nsB.reduce((s,x)=>s+pos.get(x),0)/nsB.length:nodes[b].i;
      return ba-bb||nodes[a].i-nodes[b].i;
    });
  };
  for(let L=1;L<=maxL;L++)barySort(L,layers[L-1],u=>rank[u]>rank[u]?[]:(o.rankDir==="BT"?nodes[u].succs:nodes[u].preds));
  for(let L=maxL-1;L>=0;L--)barySort(L,layers[L+1],u=>o.rankDir==="BT"?nodes[u].preds:nodes[u].succs);
  for(let L=1;L<=maxL;L++)barySort(L,layers[L-1],u=>o.rankDir==="BT"?nodes[u].succs:nodes[u].preds);
  const defSteps=layers.map((arr,L)=>{
    const prevAll=layers.slice(0,L+1).flat();
    return {t:`Layer ${L+1}`,d:arr.some(u=>nodes[u].shared)?"Shared/merge node reuses an already-computed result without duplicating work.":nodes[arr[0]].use||"",on:arr.map(u=>nodes[u].id),visit:layers.slice(0,L).flat().map(u=>nodes[u].id),edges:edges.filter(e=>arr.includes(e.v)).map(e=>e.id),reveal:prevAll.map(u=>nodes[u].id)};
  });
  const steps=stepsOr(o,defSteps);
  const idxOf=x=>typeof x==="number"?x:byId.get(String(x));
  const eById=new Map(edges.map(e=>[e.id,e.ei]));
  const eIdxOf=x=>typeof x==="number"?x:eById.get(String(x));
  const wantLeg=o.legend!==false,wantCam=o.zoom!==false;
  const an=opts.an!==undefined?opts.an:(wantLeg?mountAnatomy(S,{showUse:true,legend:o.legend,defaultUse:"Hover any node to trace every upstream input and downstream dependent."}):null);
  const hasDagHud=!!(o.hud||steps.some(s=>s.hud));
  const dagHudEl=opts.hudEl||(hasDagHud?h("div",{class:"k-hud","aria-live":"polite",hidden:true}):null);
  const renderDagHud=list=>{
    if(!dagHudEl)return;
    const arr=list||o.hud||[];dagHudEl.hidden=!arr.length;
    dagHudEl.innerHTML=arr.map(x=>{const rk=roleKey(x.role);return `<span class="k-hud-chip"${rk?` data-role="${rk}" style="--rc:var(--m-${rk})"`:""}><b>${escHtml(x.label)}</b><span>${escHtml(x.val)}</span></span>`}).join("");
  };
  let curP=[],curPillBoxes=new Map(),camEnabled=false,cur=0,prevRev=new Set(nodes.map(n=>n.i)),prevActEdges=new Set(),player=null,cam=null;
  const getPl=()=>opts.getPlayer?opts.getPlayer():player;
  const updateCam=(instant=false)=>{
    if(!cam||!camEnabled)return;
    const s=steps[cur]||{},hasOv=steps.some(st=>st.overview);
    const isOv=s.overview===true||(cur===steps.length-1&&!hasOv);
    if((isOv&&cam.mode==="auto")||cam.mode==="all"){cam.focus(null,{isOverview:true,instant});return}
    const focusSet=new Set((s.on||[]).map(idxOf).filter(k=>k!=null));
    const actE=new Set((s.edges||[]).map(eIdxOf).filter(k=>k!=null));
    actE.forEach(ei=>{const ed=edges[ei];if(ed){focusSet.add(ed.u);focusSet.add(ed.v)}});
    let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9,any=false;
    focusSet.forEach(k=>{const p=curP[k];if(!p)return;any=true;x1=Math.min(x1,p.x-4);y1=Math.min(y1,p.y-4);x2=Math.max(x2,p.x+p.w+4);y2=Math.max(y2,p.y+p.h+4)});
    actE.forEach(ei=>{const r=curPillBoxes.get(ei);if(r){any=true;x1=Math.min(x1,r.x1);y1=Math.min(y1,r.y1);x2=Math.max(x2,r.x2);y2=Math.max(y2,r.y2)}});
    cam.focus(any?{x1,y1,x2,y2}:null,{isOverview:isOv,instant});
  };
  cam=wantCam?mountCamera(S,svg,{onMode:()=>updateCam(false)}):null;
  if(!opts.hudEl&&dagHudEl)S.stage.insertBefore(dagHudEl,cam?cam.bar:svg);
  if(an){
    const defLeg=[];const seen=new Set();
    const lbl={v:"Source / Input",f:"Shared / Merge (×2+)",c:"Intermediate Op",r:"Output / Sink",g:"Group",k:"Cut",a:"Highlight"};
    const sw={v:"box",f:"box",c:"box",r:"dot",g:"area",k:"cut",a:"dot"};
    nodes.forEach(nd=>{if(nd.role&&!seen.has(nd.role)){seen.add(nd.role);defLeg.push({role:nd.role,label:lbl[nd.role]||nd.role,swatch:sw[nd.role]||"box",use:`Nodes in the ${lbl[nd.role]||nd.role} role.`})}});
    an.setItems(Array.isArray(o.legend)?o.legend:defLeg);an.wire(svg);
  }
  function layout(W){
    const maxPer=Math.max(1,...layers.map(a=>a.length));
    const gapX=maxPer>4?22:32;
    const effW=Math.max(W,560);
    const bw=Math.max(106,Math.min(o.boxWidth||144,Math.floor((effW-56-(maxPer-1)*gapX)/maxPer)));
    const natW=Math.max(W,maxPer*(bw+gapX)+48);
    const P=[];
    const wr=nodes.map(nd=>({t:fit(nd.t,bw-(nd.order!=null?30:18),13.5),s:nd.sub?fit(nd.sub,bw-18,11.5):[]}));
    const hh=wr.map((w,i)=>10+w.t.length*16.5+(w.s.length?3+w.s.length*14.5:0)+(nodes[i].tag?24:0)+10);
    const hasSkip=edges.some(e=>Math.abs(rank[e.v]-rank[e.u])>1);
    const gapY=hasSkip?56:46;
    const rowH=layers.map(arr=>arr.length?Math.max(...arr.map(i=>hh[i])):44);
    const yAt=[];let y=18;for(let L=0;L<=maxL;L++){if(L>0)y+=rowH[L-1]+gapY;yAt[L]=y}
    layers.forEach((arr,L)=>{
      const rw=arr.length*bw+(arr.length-1)*gapX,ox=(natW-rw)/2;
      arr.forEach((i,k)=>{const x=ox+k*(bw+gapX);P[i]={x,cx:x+bw/2,y:yAt[L],w:bw,h:rowH[L],wr:wr[i]}});
    });
    const H=yAt[maxL]+rowH[maxL]+24;
    curP=P;curPillBoxes=new Map();
    camEnabled=wantCam&&(nodes.length>=7||maxL>=3||natW>W+12||(W<540&&nodes.length>=4));
    if(cam)cam.setNatural(natW,H,{enabled:camEnabled,viewW:W,verticalOnly:false,boxes:P.map(p=>({y1:p.y,y2:p.y+p.h}))});else svg.setAttribute("viewBox",`0 0 ${natW} ${H}`);
    const eRoles=[...new Set(edges.map(e=>e.role).filter(Boolean))];
    let s=edgeMarkers(S.uid,eRoles);
    let skipLane=0;const pills=[],boxes=P.map(p=>({x1:p.x-6,y1:p.y-6,x2:p.x+p.w+6,y2:p.y+p.h+6})),placedPills=[];
    s+=`<g class="k-edge-layer">`;
    edges.forEach(ed=>{
      const A=P[ed.u],B=P[ed.v],rc=roleCol(ed.role,"var(--pc)"),lu=rank[ed.u],lv=rank[ed.v];
      let dPath,mx,my;
      const down=B.y>A.y,x1=A.cx,y1=down?A.y+A.h:A.y,x2=B.cx,y2=down?B.y-1:B.y+B.h+1;
      const lMin=Math.min(lu,lv),lMax=Math.max(lu,lv);
      let blocked=false,minX=natW,maxX=0;
      if(lMax-lMin>1){
        const bx1=Math.min(x1,x2)-20,bx2=Math.max(x1,x2)+20;
        nodes.forEach(nd=>{const r=rank[nd.i];if(r>lMin&&r<lMax){const q=P[nd.i];minX=Math.min(minX,q.x);maxX=Math.max(maxX,q.x+q.w);if(q.x<=bx2&&q.x+q.w>=bx1)blocked=true}});
      }
      let corridor=null;
      if(blocked||(!down&&lu===lv)){
        const mids=nodes.filter(nd=>rank[nd.i]>lMin&&rank[nd.i]<lMax).map(nd=>P[nd.i]);
        if(mids.length){
          const spans=[...mids].sort((a,b)=>a.x-b.x);
          const gaps=[];
          for(let gi=0;gi<spans.length-1;gi++){const g0=spans[gi].x+spans[gi].w,g1=spans[gi+1].x;if(g1-g0>=14)gaps.push((g0+g1)/2)}
          const freeGaps=gaps.filter(gx=>!mids.some(q=>gx>q.x-5&&gx<q.x+q.w+5));
          if(freeGaps.length){freeGaps.sort((a,b)=>Math.abs(a-(x1+x2)/2)-Math.abs(b-(x1+x2)/2));corridor=freeGaps[0]}
        }
      }
      if(corridor!=null){
        const sx=x1+(corridor>x1?A.w*.22:-A.w*.22),ex=x2+(corridor>x2?B.w*.22:-B.w*.22),ym=(y1+y2)/2;
        dPath=`M${sx.toFixed(1)},${y1.toFixed(1)} C${corridor.toFixed(1)},${(y1+(ym-y1)*.55).toFixed(1)} ${corridor.toFixed(1)},${(y2-(y2-ym)*.55).toFixed(1)} ${ex.toFixed(1)},${y2.toFixed(1)}`;
        // Anchor skip-corridor pill in the open gap below the source layer so it clears intermediate rows
        mx=(sx+corridor)/2;my=y1+26;
      } else if(blocked){
        const sideR=Math.abs(A.cx-natW/2)>=Math.abs(B.cx-natW/2)?A.cx>=natW/2:B.cx>=natW/2;
        const chX=sideR?Math.min(natW-10,maxX+18+(skipLane%3)*9):Math.max(10,minX-18-(skipLane%3)*9);
        skipLane++;
        const sy1=A.y+A.h/2,sy2=B.y+B.h/2,sx1=sideR?A.x+A.w:A.x,sx2=sideR?B.x+B.w+1:B.x-1;
        dPath=`M${sx1.toFixed(1)},${sy1.toFixed(1)} C${chX.toFixed(1)},${sy1.toFixed(1)} ${chX.toFixed(1)},${sy2.toFixed(1)} ${sx2.toFixed(1)},${sy2.toFixed(1)}`;
        mx=(sx1+6*chX+sx2)/8;my=(sy1+sy2)/2;
      } else {
        const ym=(y1+y2)/2;
        dPath=`M${x1.toFixed(1)},${y1.toFixed(1)} C${x1.toFixed(1)},${ym.toFixed(1)} ${x2.toFixed(1)},${ym.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
        mx=(x1+x2)/2;my=ym;
      }
      s+=`<path class="k-dag-edge" data-e="${ed.ei}" data-f="${ed.u}" data-t="${ed.v}" data-role="${ed.role}" style="--rc:${rc}" d="${dPath}"/>`;
      if(ed.label){
        const pos=placeClearPill(mx,my,ed.label,boxes,placedPills,natW,H,10.5,26);
        curPillBoxes.set(ed.ei,pos.r);pills.push({ed,mx:pos.x,my:pos.y});
      }
    });
    pills.forEach(({ed,mx,my})=>{s+=`<g class="k-dag-pill${o.edgeLabels==="all"?"":" hide"}" data-e="${ed.ei}">${pillSvg(mx,my,ed.label,{W:natW,H,fs:10.5,cls:"k-epill",tcls:"k-epill-t",role:ed.role,on:true,minW:26})}</g>`});
    s+=`</g><g class="k-node-layer">`;
    nodes.forEach(nd=>{
      const p=P[nd.i],w=p.wr,rk=nd.role,rc=nd.color||(rk?`var(--m-${rk})`:"var(--pc)"),rx=12,gId=S.uid+"-dc"+nd.i;
      let t=`<g class="k-dn clickable${nd.shared?" is-shared":""}" data-i="${nd.i}" tabindex="0" role="button" aria-label="${escAttr(nd.t)}"${rk?` data-role="${rk}"`:""}${nd.use?` data-use="${escAttr(nd.use)}" data-uname="${escAttr(nd.t)}"`:""} style="--rc:${rc}">`;
      if(nd.shared)t+=`<rect class="k-dag-shared" x="${p.x-4}" y="${p.y-4}" width="${p.w+8}" height="${p.h+8}" rx="${rx+3}"/>`;
      t+=`<clipPath id="${gId}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx}"/></clipPath>`;
      t+=`<rect class="k-node" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx}"/>`;
      t+=`<rect class="k-accent" x="${p.x}" y="${p.y}" width="4" height="${p.h}" clip-path="url(#${gId})"/>`;
      t+=tlines(p.x+10,p.y+21,w.t,"k-t",16.5);
      if(nd.order!=null){const ox=p.x+p.w-12,oy=p.y+12;t+=`<g class="k-ord"><circle cx="${ox}" cy="${oy}" r="8"/><text class="k-ord-t" x="${ox}" y="${oy+3.5}" text-anchor="middle">${escHtml(String(nd.order))}</text></g>`}
      if(w.s.length)t+=tlines(p.x+10,p.y+21+w.t.length*16.5+1,w.s,"k-s",14.5);
      if(nd.tag){const tw=Math.min(p.w-16,Math.ceil(nd.tag.length*7.2)+20);t+=`<g class="k-tag"><rect x="${p.x+10}" y="${p.y+p.h-26}" width="${tw}" height="19" rx="9.5"/><text class="k-c" x="${p.x+19}" y="${p.y+p.h-13.5}">${escHtml(nd.tag)}</text></g>`}
      s+=t+"</g>";
    });
    svg.innerHTML=s+`</g>`;prepEdgeLengths(svg);render(cur,true);
  }
  function render(i,instant=false){cur=i;const s=steps[i]||{};
    const rev=(s.reveal==="all"||s.reveal==null)?new Set(nodes.map(n=>n.i)):new Set((s.reveal||[]).map(idxOf).filter(k=>k!=null));
    const on=new Set((s.on||[]).map(idxOf).filter(k=>k!=null));
    const visit=new Set((s.visit||[]).map(idxOf).filter(k=>k!=null));
    const actEdges=new Set((s.edges||[]).map(eIdxOf).filter(k=>k!=null));
    $$(".k-dn",svg).forEach(g=>{const k=+g.dataset.i,vis=rev.has(k),isNew=vis&&!prevRev.has(k);
      g.classList.toggle("hide",!vis);
      g.classList.toggle("k-pop",isNew&&E.motionOn());
      g.classList.toggle("on",on.has(k));
      g.classList.toggle("done",!on.has(k)&&visit.has(k));
      g.classList.toggle("todo",vis&&!on.has(k)&&!visit.has(k));
    });
    $$(".k-dag-edge",svg).forEach(e=>{const ei=+e.dataset.e,ed=edges[ei];if(!ed)return;
      const vis=rev.has(ed.u)&&rev.has(ed.v),isAct=actEdges.size?actEdges.has(ei):on.has(ed.v),isDn=!isAct&&(visit.has(ed.v)||on.has(ed.v)),rk=ed.role,isNew=isAct&&!prevActEdges.has(ei);
      e.classList.toggle("hide",!vis);
      e.classList.toggle("on",isAct);
      e.classList.toggle("done",isDn);
      e.classList.toggle("todo",vis&&!isAct&&!isDn);
      e.classList.toggle("k-tree-draw",isNew&&E.motionOn());
      e.setAttribute("marker-end",`url(#${S.uid}-${(isAct||isDn)?(rk?"on-"+rk:"on"):(rk?"off-"+rk:"off")})`);
    });
    $$(".k-dag-pill",svg).forEach(p=>{const ei=+p.dataset.e,ed=edges[ei];if(!ed)return;
      const vis=rev.has(ed.u)&&rev.has(ed.v),isAct=actEdges.size?actEdges.has(ei):on.has(ed.v);
      p.classList.toggle("hide",!vis||(o.edgeLabels!=="all"&&!isAct));
    });
    prevRev=rev;prevActEdges=new Set(actEdges);
    renderDagHud(s.hud);
    updateCam(instant);
    if(an&&on.size===1){const u=[...on][0];if(nodes[u]?.use)an.showUse(nodes[u].t,nodes[u].use,roleCol(nodes[u].role,"var(--pc)"))}
    if(o.on)o.on(i,svg,s);
  }
  const coneOf=k=>{const keep=new Set([k]);
    const walk=(u,fn)=>{adjWalk(u,fn)};
    function adjWalk(u,fn){fn(u).forEach(v=>{if(!keep.has(v)){keep.add(v);adjWalk(v,fn)}})}
    walk(k,u=>nodes[u].preds);walk(k,u=>nodes[u].succs);
    return keep;
  };
  svg.addEventListener("pointerover",e=>{const g=e.target.closest(".k-dn");if(!g||svg.closest(".m-has-focus"))return;
    const k=+g.dataset.i,keep=coneOf(k);
    $$(".k-dn",svg).forEach(n=>n.style.opacity=keep.has(+n.dataset.i)?"1":".22");
    $$(".k-dag-edge",svg).forEach(ed=>ed.style.opacity=(keep.has(+ed.dataset.f)&&keep.has(+ed.dataset.t))?"1":".14");
  });
  svg.addEventListener("pointerleave",()=>{$$(".k-dn,.k-dag-edge",svg).forEach(n=>n.style.opacity="")});
  const jumpDag=g=>{if(svg._camDragged)return;const k=+g.dataset.i,nd=nodes[k];if(!nd)return;
    const pl=getPl();
    const si=steps.findIndex(s=>(s.on||[]).map(idxOf).includes(k));
    if(si>=0&&pl){pl.stop();pl.show(si)}
    if(an&&nd.use)an.showUse(nd.t,nd.use,roleCol(nd.role,"var(--pc)"));
  };
  svg.addEventListener("click",e=>{const g=e.target.closest(".k-dn");if(g)jumpDag(g)});
  svg.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".k-dn")){e.preventDefault();jumpDag(e.target)}});
  if(opts.mountPlayer===false){
    layout(640);
    return {layout,render,steps,cam,get camEnabled(){return camEnabled}};
  }
  responsive(S,layout);
  player=E.stepper(S.viz,steps,i=>render(i),{ms:o.ms});
  return player;
}
Kit.dag=(id,o)=>{
  const S=setup(id,"dag");if(!S||!o.nodes?.length)return;
  const svg=svgIn(S,o.alt);
  return mountDagCore(S,svg,o);
};

/* =================================================================
   12. dp — DP Table & Dependency Fill (1D, 2D/LCS/Knapsack, Interval, Bitmask)
   ================================================================= */
Kit.dp=(id,o)=>{
  const S=setup(id,"dp");if(!S)return;
  S.stage.classList.add("kit-html");
  const tabs=o.tabs&&o.tabs.length?o.tabs:[o];
  let rollMode=0,curCfg=tabs[0],curSteps=[],player=null;
  const wantLeg=o.legend!==false;
  const an=wantLeg?mountAnatomy(S,{showUse:true,legend:o.legend,defaultUse:"Tap any filled cell to jump to its computation step, or hover the legend key."}):null;
  const rollBar=h("div",{class:"k-dp-roll",hidden:true});
  const hudEl=h("div",{class:"k-hud",hidden:true,"aria-live":"polite"});
  const eqEl=h("div",{class:"k-dp-eq",hidden:true,"aria-live":"polite"});
  const splitEl=h("div",{class:"k-dp-split",hidden:true});
  const scrollEl=h("div",{class:"k-dp-scroll"});
  const wrapEl=h("div",{class:"k-dp-wrap"});
  scrollEl.append(wrapEl);
  S.stage.append(rollBar,hudEl,eqEl,scrollEl,splitEl);
  if(an)S.stage.append(an.useBox);

  const dirGlyph=d=>d==="\\"||d==="diag"?"↖":d==="^"||d==="up"?"↑":d==="<"||d==="left"?"←":"";
  const dirRole=d=>d==="\\"||d==="diag"?"r":d==="^"||d==="up"?"c":d==="<"||d==="left"?"v":"";
  const normPair=p=>Array.isArray(p)?`${p[0]},${p[1]}`:String(p);
  const stepsFor=cfg=>{
    if(cfg.rolling){return rollMode===1?(cfg.rolling.ltrSteps||cfg.steps||[]):(cfg.rolling.rtlSteps||cfg.steps||[])}
    return cfg.steps||[{t:"Table",d:""}];
  };
  const syncLegend=cfg=>{
    if(!an)return;
    const m=cfg.mode||"2d";
    const def=cfg.legend||(m==="interval"
      ?[{role:"c",label:"Current (i, j)",swatch:"box",use:"Cell currently being minimized over split k."},{role:"g",label:"Diagonal l",swatch:"area",use:"All intervals of current length l = j − i + 1."},{role:"v",label:"Subproblems",swatch:"box",use:"Already-computed shorter sub-intervals (i,k) and (k+1,j)."},{role:"r",label:"Optimal / Split",swatch:"dot",use:"Best split k* or root r* recorded for reconstruction."}]
      :m==="bitmask"
      ?[{role:"v",label:"Subset S",swatch:"box",use:"Bitmask encoding visited vertices; evaluated in increasing |S| order."},{role:"c",label:"Active dp[S,v]",swatch:"box",use:"Current state minimizing over predecessor u ∈ S \\ {v}."},{role:"r",label:"Optimal Tour",swatch:"dot",use:"Selected transition along the minimum-cost Hamiltonian tour."}]
      :[{role:"c",label:"Active Cell",swatch:"box",use:"State currently being evaluated from its recurrence."},{role:"v",label:"Dependencies",swatch:"box",use:"Smaller subproblem states read by the recurrence."},{role:"r",label:"Traceback / Optimal",swatch:"dot",use:"Reconstructed optimal solution path."},{role:"k",label:"Conflict / Bug",swatch:"cut",use:"Invalid state or overwriting bug (e.g. left-to-right 1D knapsack)."}]);
    an.setItems(def);
  };
  const buildTable=cfg=>{
    curCfg=cfg;const m=cfg.mode||"2d";
    if(cfg.rolling){
      rollBar.hidden=false;
      const r=cfg.rolling;
      rollBar.innerHTML=`<div class="segc" role="group" aria-label="Traversal direction">`+
        `<button type="button" data-roll="0" aria-pressed="${rollMode===0}">${escHtml(r.rtlLabel||"Right → Left (Safe 0/1)")}</button>`+
        `<button type="button" data-roll="1" aria-pressed="${rollMode===1}">${escHtml(r.ltrLabel||"Left → Right (Item Reuse Bug!)")}</button>`+
        `</div><span class="k-dp-rnote" data-role="${rollMode===0?"r":"k"}">${escHtml(rollMode===0?(r.rtlNote||"Reads previous row dp[c − wᵢ] before overwriting."):(r.ltrNote||"Reads updated dp[c − wᵢ] from same row — reuses item!"))}</span>`;
    } else rollBar.hidden=true;
    syncLegend(cfg);
    if(m==="1d"){
      const cols=cfg.cols||cfg.arr.map((_,i)=>String(i));
      const rows=[];
      rows.push({key:"idx",label:cfg.idxLabel||"i",vals:cols,head:true});
      if(cfg.arr)rows.push({key:"arr",label:cfg.arrLabel||"A[i]",vals:cfg.arr,role:"v"});
      rows.push({key:"dp",label:cfg.dpLabel||"dp[i]",vals:cfg.dp||cols.map(()=>"·"),role:"c",dp:true});
      if(cfg.parent)rows.push({key:"par",label:cfg.parentLabel||"parent[i]",vals:cfg.parent,role:"f",par:true});
      (cfg.aux||[]).forEach((ax,ai)=>rows.push({key:"aux"+ai,label:ax.label,vals:ax.vals,role:ax.role||"g"}));
      let html=`<svg class="k-dp-arrs" aria-hidden="true"></svg><table class="k-dp-tbl k-dp-1d"><tbody>`;
      rows.forEach(rw=>{
        html+=`<tr class="${rw.head?"is-idx":rw.dp?"is-dp":""}"><th>${escHtml(rw.label)}</th>`;
        rw.vals.forEach((v,ci)=>{
          html+=`<td data-r="${rw.dp?0:-1}" data-c="${ci}" data-rk="${rw.key}" class="${rw.dp?"k-dp-cell clickable":""}">${escHtml(v==null?"·":String(v))}</td>`;
        });
        html+=`</tr>`;
      });
      html+=`</tbody></table>`;wrapEl.innerHTML=html;
    } else if(m==="bitmask"){
      const rows=cfg.rows||[],cols=cfg.cols||[];
      let html=`<svg class="k-dp-arrs" aria-hidden="true"></svg><table class="k-dp-tbl k-dp-bit"><thead><tr><th>|S|</th><th>Subset S</th>${cols.map(c=>`<th>v=${escHtml(String(c))}</th>`).join("")}</tr></thead><tbody>`;
      let prevSz=null;
      rows.forEach((rw,ri)=>{
        const sz=rw.size!=null?rw.size:(rw.mask?rw.mask.split("").filter(x=>x==="1").length:0);
        const grpStart=prevSz!==sz;prevSz=sz;
        html+=`<tr class="${grpStart?"k-sz-start":""}" data-sz="${sz}">`;
        html+=`<th class="k-sz-col">${grpStart?`|S|=${sz}`:""}</th>`;
        html+=`<th class="k-mask-th"><code class="k-dp-mask">${[...(rw.mask||"")].map(b=>`<i class="${b==="1"?"on":""}">${b}</i>`).join("")}</code><small>${escHtml(rw.set||"")}</small></th>`;
        cols.forEach((_,ci)=>{
          const raw=(cfg.grid&&cfg.grid[ri])?cfg.grid[ri][ci]:null;
          const v=raw&&typeof raw==="object"?raw.v:raw;
          html+=`<td class="k-dp-cell clickable" data-r="${ri}" data-c="${ci}" data-init="${escAttr(v==null?"∞":String(v))}">${escHtml(v==null?"∞":String(v))}</td>`;
        });
        html+=`</tr>`;
      });
      html+=`</tbody></table>`;wrapEl.innerHTML=html;
    } else {
      const isInt=m==="interval";
      const rows=cfg.rows||(isInt?Array.from({length:cfg.n},(_,i)=>String(i+1)):[]);
      const cols=cfg.cols||(isInt?Array.from({length:cfg.n},(_,i)=>String(i+1)):[]);
      let html=`<svg class="k-dp-arrs" aria-hidden="true"></svg><table class="k-dp-tbl${isInt?" k-dp-int":""}"><thead><tr><th>${escHtml(cfg.corner||"i \\ j")}</th>${cols.map(c=>`<th>${escHtml(String(c))}</th>`).join("")}</tr></thead><tbody>`;
      rows.forEach((rw,ri)=>{
        html+=`<tr><th>${escHtml(String(rw))}</th>`;
        cols.forEach((_,ci)=>{
          if(isInt&&ri>ci){html+=`<td class="k-dp-blank" aria-hidden="true"></td>`;return}
          const raw=(cfg.grid&&cfg.grid[ri])?cfg.grid[ri][ci]:null;
          const obj=raw&&typeof raw==="object"?raw:{v:raw};
          const v=obj.v==null?"·":String(obj.v);
          html+=`<td class="k-dp-cell clickable" data-r="${ri}" data-c="${ci}" data-init="${escAttr(v)}"${obj.dir?` data-init-dir="${escAttr(obj.dir)}"`:""}${obj.sub?` data-init-sub="${escAttr(obj.sub)}"`:""}>${escHtml(v)}</td>`;
        });
        html+=`</tr>`;
      });
      html+=`</tbody></table>`;wrapEl.innerHTML=html;
    }
  };
  const drawDpArr=(mode,onCols,fromCols)=>{
    const arrSvg=$(".k-dp-arrs",wrapEl);if(!arrSvg)return;
    const wr=wrapEl.getBoundingClientRect();if(!wr.width){arrSvg.innerHTML="";return}
    arrSvg.setAttribute("viewBox",`0 0 ${Math.ceil(wr.width)} ${Math.ceil(wr.height)}`);
    let paths=`<defs><marker id="${S.uid}-dpa" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,1 L9,5 L0,9 z" class="k-head on" style="fill:var(--m-v)"/></marker></defs>`;
    if(mode==="1d"){
      const dst=onCols.length?$(`.k-dp-tbl td[data-rk="dp"][data-c="${onCols[0]}"]`,wrapEl):null;
      if(dst){
        const dr=dst.getBoundingClientRect(),dx=dr.left-wr.left+dr.width/2,dy=dr.top-wr.top+2;
        fromCols.forEach((fc,fi)=>{
          const src=$(`.k-dp-tbl td[data-rk="dp"][data-c="${fc}"]`,wrapEl);if(!src||fc===onCols[0])return;
          const sr=src.getBoundingClientRect(),sx=sr.left-wr.left+sr.width/2,sy=sr.top-wr.top+2;
          const arch=Math.max(18,Math.min(42,Math.abs(dx-sx)*.26+fi*6));
          const d=`M${sx.toFixed(1)},${sy.toFixed(1)} Q${((sx+dx)/2).toFixed(1)},${Math.max(2,sy-arch).toFixed(1)} ${dx.toFixed(1)},${dy.toFixed(1)}`;
          paths+=`<path class="k-dp-arr" d="${d}" marker-end="url(#${S.uid}-dpa)"/>`;
        });
      }
    } else {
      const dst=$(".k-dp-cell.on",wrapEl),srcs=$$(".k-dp-cell.from",wrapEl);
      if(dst&&srcs.length){
        const dr=dst.getBoundingClientRect(),dcx=dr.left-wr.left+dr.width/2,dcy=dr.top-wr.top+dr.height/2;
        const dhw=Math.max(6,dr.width/2-1),dhh=Math.max(6,dr.height/2-1);
        srcs.forEach((src,fi)=>{
          const sr=src.getBoundingClientRect(),scx=sr.left-wr.left+sr.width/2,scy=sr.top-wr.top+sr.height/2;
          const shw=Math.max(6,sr.width/2-1),shh=Math.max(6,sr.height/2-1);
          const dx=dcx-scx,dy=dcy-scy,dist=Math.hypot(dx,dy);if(dist<4)return;
          const ux=dx/dist,uy=dy/dist;
          const tS=Math.min(Math.abs(ux)>1e-3?shw/Math.abs(ux):1e9,Math.abs(uy)>1e-3?shh/Math.abs(uy):1e9);
          const tD=Math.min(Math.abs(ux)>1e-3?dhw/Math.abs(ux):1e9,Math.abs(uy)>1e-3?dhh/Math.abs(uy):1e9);
          const sx=scx+ux*tS,sy=scy+uy*tS,ex=dcx-ux*(tD+3),ey=dcy-uy*(tD+3);
          const arch=Math.min(18,Math.max(7,Math.hypot(ex-sx,ey-sy)*.18))*(fi%2===0?-1:1);
          const cx=(sx+ex)/2-uy*arch,cy=(sy+ey)/2+ux*arch;
          const d=`M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
          paths+=`<path class="k-dp-arr" d="${d}" marker-end="url(#${S.uid}-dpa)"/>`;
        });
      }
    }
    arrSvg.innerHTML=paths;
    if(E.motionOn())$$(".k-dp-arr",arrSvg).forEach(p=>{try{const l=p.getTotalLength();if(l){p.style.setProperty("--plen",String(Math.ceil(l)+4));p.classList.add("k-tree-draw")}}catch(_){}});
  };
  const render=(i)=>{
    const s=curSteps[i]||{};
    const m=curCfg.mode||"2d";
    const hud=s.hud||curCfg.hud||[];
    hudEl.hidden=!hud.length;
    hudEl.innerHTML=hud.map(x=>{const rk=roleKey(x.role);return `<span class="k-hud-chip"${rk?` data-role="${rk}" style="--rc:var(--m-${rk})"`:""}><b>${escHtml(x.label)}</b><span>${escHtml(x.val)}</span></span>`}).join("");
    if(s.eq){eqEl.hidden=false;eqEl.innerHTML=Kit.math(s.eq)}else eqEl.hidden=true;
    if(s.split){
      splitEl.hidden=false;
      const sp=s.split;
      splitEl.innerHTML=`<span class="k-sp-seg" data-role="v">(${escHtml(String(sp.i))}..${escHtml(String(sp.k))})</span><span class="k-sp-op">+</span><span class="k-sp-seg" data-role="v">(${escHtml(String(sp.k+1))}..${escHtml(String(sp.j))})</span>${sp.cost!=null?`<span class="k-sp-op">→</span><span class="k-sp-seg" data-role="r">${escHtml(String(sp.cost))}</span>`:""}`;
    } else splitEl.hidden=true;

    if(m==="1d"){
      const onC=Array.isArray(s.on)?s.on:(s.on!=null?[s.on]:[]);
      const fromC=s.from||[],traceC=s.trace||[],badC=s.bad||[];
      const dpVals=s.dp||curCfg.dp||[],parVals=s.parent||curCfg.parent||[];
      const revUpto=s.reveal==="all"?999:(s.reveal!=null?s.reveal:(onC.length?Math.max(...onC):999));
      $$(".k-dp-tbl td",wrapEl).forEach(td=>{
        const c=+td.dataset.c,rk=td.dataset.rk;
        if(rk==="dp"){
          const show=s.dp?dpVals[c]!=null:(c<=revUpto);
          td.textContent=show&&dpVals[c]!=null?String(dpVals[c]):"·";
          td.classList.toggle("on",onC.includes(c));
          td.classList.toggle("from",fromC.includes(c)&&!onC.includes(c));
          td.classList.toggle("path",traceC.includes(c));
          td.classList.toggle("bad",badC.includes(c));
          td.classList.toggle("filled",show&&dpVals[c]!=null);
        } else if(rk==="par"){
          const show=s.parent?parVals[c]!=null:(c<=revUpto);
          td.textContent=show&&parVals[c]!=null?String(parVals[c]):"·";
          td.classList.toggle("on",onC.includes(c));
          td.classList.toggle("path",traceC.includes(c));
        }
      });
      requestAnimationFrame(()=>drawDpArr("1d",onC,fromC));
    } else {
      const onSet=new Set((s.on?(Array.isArray(s.on[0])?s.on:[s.on]):[]).map(normPair));
      const fromSet=new Set((s.from||[]).map(normPair));
      const pathSet=new Set((s.path||[]).map(normPair));
      const badSet=new Set((s.bad||[]).map(normPair));
      const diagLen=s.diag!=null?s.diag:null;
      const cellMap=s.cells||{};
      const upto=Array.isArray(s.upto)?s.upto:null;
      $$(".k-dp-cell",wrapEl).forEach(td=>{
        const r=+td.dataset.r,c=+td.dataset.c,k=`${r},${c}`;
        const ov=cellMap[k];
        let val=ov!==undefined?(ov&&typeof ov==="object"?ov.v:ov):null;
        let dir=ov&&typeof ov==="object"?ov.dir:td.dataset.initDir||"";
        let sub=ov&&typeof ov==="object"?ov.sub:td.dataset.initSub||"";
        if(val==null){
          let vis=true;
          if(upto)vis=(r<upto[0]||(r===upto[0]&&c<=upto[1]));
          else if(diagLen!=null&&m==="interval"){const len=c-r+1;vis=len<=diagLen&&!(len===diagLen&&!onSet.has(k)&&s.diagOnly!==false&&c>(s.on?s.on[1]:999));}
          else if(s.size!=null&&m==="bitmask"){const rSz=+(td.closest("tr")?.dataset.sz||0);vis=rSz<=s.size;}
          else if(s.reveal&&Array.isArray(s.reveal))vis=s.reveal.map(normPair).includes(k);
          val=vis?td.dataset.init:(m==="bitmask"?"∞":"·");
          if(!vis){dir="";sub=""}
        }
        const dg=dirGlyph(dir),dr=dirRole(dir);
        td.innerHTML=(dg?`<span class="k-dp-dir"${dr?` data-role="${dr}"`:""}>${dg}</span>`:"")+`<b>${escHtml(String(val))}</b>`+(sub?`<small class="k-dp-sub">${escHtml(String(sub))}</small>`:"");
        td.classList.toggle("on",onSet.has(k));
        td.classList.toggle("from",fromSet.has(k)&&!onSet.has(k));
        td.classList.toggle("path",pathSet.has(k));
        td.classList.toggle("bad",badSet.has(k));
        td.classList.toggle("diag",m==="interval"&&diagLen!=null&&(c-r+1)===diagLen);
        td.classList.toggle("filled",val!=="·"&&val!=="∞");
      });
      if(m==="bitmask"&&s.size!=null){
        $$(".k-dp-bit tbody tr",wrapEl).forEach(tr=>{tr.classList.toggle("is-sz-on",+tr.dataset.sz===s.size)});
      }
      requestAnimationFrame(()=>drawDpArr(m,[],[]));
    }
    if(an&&s.use)an.showUse(s.t,s.use,"var(--pc)");
    if(o.on)o.on(i,S.stage,s);
  };
  rollBar.addEventListener("click",e=>{
    const b=e.target.closest("button[data-roll]");if(!b)return;
    rollMode=+b.dataset.roll;buildTable(curCfg);curSteps=stepsFor(curCfg);
    if(player)player.setSteps(curSteps,0);
  });
  wrapEl.addEventListener("click",e=>{
    const td=e.target.closest(".k-dp-cell");if(!td||!player)return;
    const r=+td.dataset.r,c=+td.dataset.c,k=`${r},${c}`;
    const si=curSteps.findIndex(s=>{
      if((curCfg.mode||"2d")==="1d")return (Array.isArray(s.on)?s.on:[s.on]).includes(c);
      return (s.on?(Array.isArray(s.on[0])?s.on:[s.on]):[]).map(normPair).includes(k);
    });
    if(si>=0){player.stop();player.show(si)}
  });
  if(tabs.length>1){
    mountTabs(S,tabs,idx=>{rollMode=0;buildTable(tabs[idx]);curSteps=stepsFor(tabs[idx]);if(player)player.setSteps(curSteps,0)});
  }
  buildTable(tabs[0]);curSteps=stepsFor(tabs[0]);
  player=E.stepper(S.viz,curSteps,i=>render(i),{ms:o.ms||3600});
  addEventListener("resize",()=>requestAnimationFrame(()=>{const s=curSteps[player?player.i:0]||{};drawDpArr(curCfg.mode||"2d",Array.isArray(s.on)?s.on:(s.on!=null?[s.on]:[]),s.from||[])}));
  return player;
};

/* =================================================================
   13. network — Graph Traversal, Shortest-Path, Metric TSP & 3-SAT Gadget
   ================================================================= */
Kit.network=(id,o)=>{
  const S=setup(id,"network");if(!S)return;
  const svg=svgIn(S,o.alt);
  const tabs=o.tabs&&o.tabs.length?o.tabs:[o];
  let curCfg=tabs[0],curSteps=curCfg.steps||[],cur=0,curW=640,player=null;
  const wantLeg=o.legend!==false,wantCam=o.zoom!==false;
  const an=wantLeg?mountAnatomy(S,{showUse:true,legend:o.legend,defaultUse:"Tap any node or edge to inspect its state, distance, or classification."}):null;
  const satBar=h("div",{class:"k-sat-bar",hidden:true});
  const hudEl=h("div",{class:"k-hud",hidden:true,"aria-live":"polite"});
  const parenEl=h("div",{class:"k-net-parens",hidden:true});
  S.stage.insertBefore(satBar,svg);
  S.stage.insertBefore(hudEl,svg);
  S.stage.append(parenEl);
  let camEnabled=false,curP=[],satAssign={},satPicked={},curNodes=[],curEdges=[];
  const updateCam=(instant=false)=>{
    if(!cam||!camEnabled)return;
    const s=curSteps[cur]||{},hasOv=curSteps.some(st=>st.overview);
    const isOv=s.overview===true||(cur===curSteps.length-1&&!hasOv&&curSteps.length>2);
    if((isOv&&cam.mode==="auto")||cam.mode==="all"){cam.focus(null,{isOverview:true,instant});return}
    const focusIds=new Set([...(s.on||[]),...(s.focus||[])].map(String));
    let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9,any=false;
    curNodes.forEach((nd,ni)=>{if(focusIds.has(nd.id)&&curP[ni]){const p=curP[ni];any=true;x1=Math.min(x1,p.x-36);y1=Math.min(y1,p.y-36);x2=Math.max(x2,p.x+36);y2=Math.max(y2,p.y+42)}});
    cam.focus(any?{x1,y1,x2,y2}:null,{isOverview:isOv,instant});
  };
  const cam=wantCam?mountCamera(S,svg,{onMode:()=>updateCam(false)}):null;

  const compileSat=cfg=>{
    const sat=cfg.sat;
    const clauses=sat.clauses||[],k=clauses.length;
    const nodes=[],edges=[],litPos=[];
    const span=100/Math.max(1,k);
    clauses.forEach((cl,ci)=>{
      const cx=span*(ci+.5),cy=52;
      const ids=[];
      cl.forEach((lit,li)=>{
        const nid=`c${ci}_${li}`,neg=lit.startsWith("!"),v=neg?lit.slice(1):lit;
        const lbl=(neg?"¬":"")+v;
        const ox=li===0?0:(li===1?-span*.3:span*.3),oy=li===0?-28:24;
        nodes.push({id:nid,t:lbl,x:cx+ox,y:cy+oy,ci,li,var:v,neg,clause:ci+1,role:"v",use:`Literal ${lbl} in Clause C${ci+1}.`});
        litPos.push({id:nid,var:v,neg,ci});ids.push(nid);
      });
      edges.push({from:ids[0],to:ids[1],cls:"tri",undir:true});
      edges.push({from:ids[1],to:ids[2],cls:"tri",undir:true});
      edges.push({from:ids[2],to:ids[0],cls:"tri",undir:true});
    });
    for(let i=0;i<litPos.length;i++)for(let j=i+1;j<litPos.length;j++){
      if(litPos[i].ci!==litPos[j].ci&&litPos[i].var===litPos[j].var&&litPos[i].neg!==litPos[j].neg){
        edges.push({from:litPos[i].id,to:litPos[j].id,cls:"conflict",undir:true,label:"conflict",role:"k"});
      }
    }
    return {nodes,edges};
  };

  const syncLegend=cfg=>{
    if(!an)return;
    if(cfg.legend){an.setItems(cfg.legend);an.wire(svg);return}
    if(cfg.sat){
      an.setItems([
        {role:"r",label:"Picked True Vertex",swatch:"dot",use:"One true literal chosen per satisfied clause triangle."},
        {role:"k",label:"Conflict / False",swatch:"cut",use:"Opposite literals (xᵢ ↔ ¬xᵢ) cannot both belong to an Independent Set."},
        {role:"c",label:"Clause Triangle",swatch:"line",use:"At most one vertex per triangle can enter the Independent Set."}
      ]);
    } else if(cfg.kind==="tsp"){
      an.setItems([
        {role:"r",label:"MST Tree Edge",swatch:"line",use:"Minimum Spanning Tree edge giving lower bound OPT ≥ w(MST)."},
        {role:"a",label:"Preorder Walk",swatch:"dash",use:"Euler tour preorder traversal visiting every vertex."},
        {role:"f",label:"Triangle Shortcut",swatch:"vec",use:"Skips already-visited vertices; length ≤ 2·w(MST) ≤ 2·OPT."}
      ]);
    } else if(cfg.kind==="sp"){
      an.setItems([
        {role:"r",label:"Relaxed / Tree Edge",swatch:"vec",use:"Shortens d[v] > d[u] + w(u,v) and updates π[v] = u."},
        {role:"c",label:"Priority / Pass Frontier",swatch:"dot",use:"Current extracted vertex or active relaxation pass."},
        {role:"k",label:"Negative Trap / Cycle",swatch:"cut",use:"Negative-weight edge breaking Dijkstra or negative cycle detected on pass |V|."}
      ]);
    } else {
      an.setItems([
        {role:"r",label:"Tree Edge",swatch:"vec",use:"Discovers a white (unvisited) vertex."},
        {role:"k",label:"Back Edge (Cycle)",swatch:"dash",use:"Points to a gray ancestor — proves a directed cycle exists!"},
        {role:"a",label:"Forward Edge",swatch:"dash",use:"Points to a black descendant already finished."},
        {role:"c",label:"Cross Edge",swatch:"dash",use:"Connects across finished subtrees (no ancestor relation)."}
      ]);
    }
    an.wire(svg);
  };

  const buildNetwork=(cfg,W)=>{
    curCfg=cfg;curW=W;
    let rawN=cfg.nodes||[],rawE=cfg.edges||[];
    if(cfg.sat){const g=compileSat(cfg);rawN=g.nodes;rawE=g.edges}
    const byId=new Map();
    curNodes=rawN.map((nd,i)=>{const id=String(nd.id??i);byId.set(id,i);return {...nd,id,i}});
    const pairSet=new Set(rawE.map(e=>`${e.from}->${e.to}`));
    curEdges=rawE.map((ed,ei)=>{
      const u=byId.get(String(ed.from)),v=byId.get(String(ed.to));
      const rev=pairSet.has(`${ed.to}->${ed.from}`);
      return {...ed,ei,u,v,curve:ed.curve!=null?ed.curve:(rev&&!ed.undir?24:0)};
    }).filter(e=>e.u!=null&&e.v!=null);
    const effW=Math.max(W,cfg.minW||(cfg.sat?Math.max(600,cfg.sat.clauses.length*200):560)),H=Math.max(310,Math.round(effW*(cfg.aspect||.58)));
    const padX=56,padY=52,R=cfg.sat?21:23;
    const P=curNodes.map(nd=>({
      x:padX+(nd.x/100)*(effW-2*padX),
      y:padY+(nd.y/100)*(H-2*padY)
    }));
    curP=P;
    camEnabled=wantCam&&(curNodes.length>=5||effW>W+10||W<540);
    if(cam)cam.setNatural(effW,H,{enabled:camEnabled,viewW:W,verticalOnly:false,boxes:P.map(p=>({y1:p.y-R,y2:p.y+R}))});
    else svg.setAttribute("viewBox",`0 0 ${effW} ${H}`);

    const roles=["r","k","c","v","f","g","a"];
    let s=edgeMarkers(S.uid,roles);
    if(cfg.sat){
      const clN=cfg.sat.clauses.length;
      for(let ci=0;ci<clN;ci++){
        const cx=padX+((ci+.5)/clN)*(effW-2*padX);
        s+=`<text class="k-c" x="${cx.toFixed(1)}" y="24" text-anchor="middle">Clause C${ci+1}</text>`;
      }
    }
    const boxes=P.map(p=>({x1:p.x-R-14,y1:p.y-R-20,x2:p.x+R+14,y2:p.y+R+30}));
    const placed=[];
    let edgePills="";
    s+=`<g class="k-net-edges">`;
    curEdges.forEach(ed=>{
      const A=P[ed.u],B=P[ed.v],dx=B.x-A.x,dy=B.y-A.y,dist=Math.hypot(dx,dy)||1;
      const ux=dx/dist,uy=dy/dist,nx=-uy,ny=ux;
      const sx=A.x+ux*(R+1),sy=A.y+uy*(R+1),ex=B.x-ux*(R+(ed.undir?1:4)),ey=B.y-uy*(R+(ed.undir?1:4));
      let dPath,mx,my;
      if(ed.curve){
        const cx=(sx+ex)/2+nx*ed.curve,cy=(sy+ey)/2+ny*ed.curve;
        dPath=`M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
        mx=(sx+2*cx+ex)/4;my=(sy+2*cy+ey)/4;
      } else {
        dPath=`M${sx.toFixed(1)},${sy.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`;
        mx=(sx+ex)/2;my=(sy+ey)/2;
      }
      const cls="k-net-edge"+(ed.cls?" cls-"+ed.cls:"")+(ed.cls==="conflict"?" k-sat-edge":"");
      const rk=roleKey(ed.role)||"";
      s+=`<path class="${cls}" data-e="${ed.ei}" data-f="${ed.u}" data-t="${ed.v}"${ed.undir?' data-undir="1"':""}${rk?` data-role="${rk}" style="--rc:var(--m-${rk})"`:""} d="${dPath}"/>`;
      const lbl=ed.label!=null&&ed.label!==""?String(ed.label):(ed.w!=null?String(ed.w):"");
      if(lbl&&!cfg.sat){
        const pos=placeClearPill(mx,my,lbl,boxes,placed,effW,H,10.5,24);
        edgePills+=`<g class="k-net-epill" data-e="${ed.ei}">${pillSvg(pos.x,pos.y,lbl,{W:effW,H,fs:10.5,cls:"k-epill",tcls:"k-epill-t",role:rk,minW:24})}</g>`;
      }
    });
    s+=`</g>${edgePills}<g class="k-net-nodes">`;
    curNodes.forEach((nd,ni)=>{
      const p=P[ni],rk=roleKey(nd.role)||"";
      s+=`<g class="k-net-node clickable" data-i="${ni}" data-id="${escAttr(nd.id)}" tabindex="0" role="button" aria-label="${escAttr(nd.t)}"${rk?` data-role="${rk}" style="--rc:var(--m-${rk})"`:""}${nd.use?` data-use="${escAttr(nd.use)}" data-uname="${escAttr(nd.t)}"`:""}>`;
      s+=`<circle class="k-pulse-ring k-net-pulse hide" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${R+4}"/>`;
      s+=`<circle class="k-net-c" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${R}"/>`;
      s+=`<text class="k-net-t" x="${p.x.toFixed(1)}" y="${(p.y+4.5).toFixed(1)}" text-anchor="middle">${escHtml(nd.t)}</text>`;
      s+=`<g class="k-net-top" hidden></g><g class="k-net-bot" hidden></g></g>`;
    });
    s+=`</g>`;
    svg.innerHTML=s;prepEdgeLengths(svg);
    if(cfg.sat){
      satBar.hidden=false;
      satAssign={...(cfg.sat.init||{})};satPicked={};
      satBar.innerHTML=(cfg.sat.vars||[]).map(v=>`<button type="button" class="k-sat-btn" data-v="${escAttr(v)}" aria-pressed="${!!satAssign[v]}"><span>${escHtml(v)}</span><b>${satAssign[v]?"T":"F"}</b></button>`).join("");
    } else satBar.hidden=true;
    syncLegend(cfg);
  };

  const renderSatState=(step)=>{
    const sat=curCfg.sat;if(!sat)return;
    if(step&&step.assign)satAssign={...step.assign};
    $$(".k-sat-btn",satBar).forEach(b=>{const v=b.dataset.v,val=!!satAssign[v];b.setAttribute("aria-pressed",String(val));$("b",b).textContent=val?"T":"F"});
    const litVal=nd=>{const v=!!satAssign[nd.var];return nd.neg?!v:v};
    let satClauses=0;
    const pickedIds=new Set();
    sat.clauses.forEach((_,ci)=>{
      const cNodes=curNodes.filter(n=>n.ci===ci);
      const trues=cNodes.filter(litVal);
      if(trues.length){
        satClauses++;
        const manual=satPicked[ci];
        const chosen=(manual&&trues.some(n=>n.id===manual))?manual:trues[0].id;
        pickedIds.add(chosen);
      }
    });
    const effW=svg.viewBox.baseVal?.width||640,H=svg.viewBox.baseVal?.height||340;
    $$(".k-net-node",svg).forEach(g=>{
      const ni=+g.dataset.i,nd=curNodes[ni],p=curP[ni],isT=litVal(nd),isPick=pickedIds.has(nd.id);
      g.classList.toggle("on",isPick);
      g.classList.toggle("is-ok",isPick);
      g.classList.toggle("is-bad",!isT);
      g.style.setProperty("--rc",isPick?"var(--m-r)":(isT?"var(--m-v)":"var(--m-k)"));
      const top=$(".k-net-top",g);
      top.hidden=false;top.innerHTML=pillSvg(p.x+19,p.y-19,isT?"T":"F",{W:effW,H,fs:10,cls:"k-epill"+(isPick?" on":""),tcls:"k-epill-t",role:isPick?"r":(isT?"v":"k"),minW:22});
    });
    let conflicts=0;
    $$(".k-net-edge",svg).forEach(e=>{
      const ed=curEdges[+e.dataset.e];if(!ed)return;
      if(ed.cls==="conflict"){
        const bad=pickedIds.has(curNodes[ed.u].id)&&pickedIds.has(curNodes[ed.v].id);
        if(bad)conflicts++;
        e.classList.toggle("is-bad",bad);e.classList.toggle("on",bad);
      } else {
        const hasP=pickedIds.has(curNodes[ed.u].id)||pickedIds.has(curNodes[ed.v].id);
        e.classList.toggle("done",hasP);
      }
    });
    const ok=satClauses===sat.clauses.length&&conflicts===0;
    hudEl.hidden=false;
    hudEl.innerHTML=`<span class="k-hud-chip" data-role="${ok?"r":"k"}" style="--rc:var(--m-${ok?"r":"k"})"><b>Clauses</b><span>${satClauses} / ${sat.clauses.length}</span></span>`+
      `<span class="k-hud-chip" data-role="${conflicts?"k":"r"}" style="--rc:var(--m-${conflicts?"k":"r"})"><b>Conflicts</b><span>${conflicts}</span></span>`+
      `<span class="k-hud-chip" data-role="${ok?"r":"c"}" style="--rc:var(--m-${ok?"r":"c"})"><b>IS Size</b><span>${ok?`k = ${pickedIds.size} ✓`:"Blocked"}</span></span>`;
  };

  const render=(i)=>{
    cur=i;const s=curSteps[i]||{};
    if(curCfg.sat){renderSatState(s);updateCam(false);if(o.on)o.on(i,svg,s);return}
    const effW=svg.viewBox.baseVal?.width||640,H=svg.viewBox.baseVal?.height||340;
    const onSet=new Set((s.on||[]).map(String));
    const nState=s.nodes||{};
    const eState=s.edges||{};
    $$(".k-net-node",svg).forEach(g=>{
      const ni=+g.dataset.i,nd=curNodes[ni],p=curP[ni],st=nState[nd.id]||{};
      const col=st.state||st.color||"white";
      const isOn=onSet.has(nd.id);
      g.classList.toggle("on",isOn);
      const pr=$(".k-net-pulse",g);if(pr)pr.classList.toggle("hide",!isOn);
      g.classList.toggle("st-gray",col==="gray");
      g.classList.toggle("st-black",col==="black");
      g.classList.toggle("is-ok",col==="ok");
      g.classList.toggle("is-bad",col==="bad");
      const rk=roleKey(st.role)||(col==="bad"?"k":col==="ok"||col==="black"?"r":col==="gray"?"c":nd.role||"");
      if(rk)g.style.setProperty("--rc",`var(--m-${rk})`);
      const topTxt=st.df||st.top||(st.in!=null?`in=${st.in}`:"");
      const botTxt=st.d!=null?(st.pi?`d=${st.d} π=${st.pi}`:`d=${st.d}`):(st.bot||"");
      const topEl=$(".k-net-top",g),botEl=$(".k-net-bot",g);
      if(topTxt){topEl.hidden=false;topEl.innerHTML=pillSvg(p.x+20,p.y-20,topTxt,{W:effW,H,fs:10,cls:"k-epill"+(isOn?" on":""),tcls:"k-epill-t",role:rk,minW:24})}else{topEl.hidden=true;topEl.innerHTML=""}
      if(botTxt){botEl.hidden=false;botEl.innerHTML=pillSvg(p.x,p.y+38,botTxt,{W:effW,H,fs:10,cls:"k-epill"+(isOn?" on":""),tcls:"k-epill-t",role:col==="bad"?"k":(st.d!=null&&st.d!=="∞"?"r":rk),minW:26})}else{botEl.hidden=true;botEl.innerHTML=""}
    });
    const classRole={tree:"r",mst:"r",relax:"r",back:"k",fail:"k",cycle:"k",forward:"a",walk:"a",cross:"c",shortcut:"f"};
    $$(".k-net-edge",svg).forEach(e=>{
      const ei=+e.dataset.e,ed=curEdges[ei];if(!ed)return;
      const key=`${curNodes[ed.u].id}->${curNodes[ed.v].id}`;
      const st=eState[ed.id]||eState[key]||{};
      const cls=st.cls||(typeof st==="string"?st:"")||ed.cls||"";
      const rk=roleKey(st.role)||classRole[cls]||ed.role||"";
      e.setAttribute("class","k-net-edge"+(cls?" cls-"+cls:"")+(st.on?" on":"")+(st.done?" done":""));
      if(rk)e.style.setProperty("--rc",`var(--m-${rk})`);
      if(!ed.undir){
        const lit=!!(cls||st.on||st.done);
        e.setAttribute("marker-end",`url(#${S.uid}-${lit?(rk?"on-"+rk:"on"):"off"})`);
      }
      const ep=$(`.k-net-epill[data-e="${ei}"] rect`,svg);
      if(ep){
        ep.classList.toggle("on",!!(st.on||cls));
        if(rk)ep.parentElement.style.setProperty("--rc",`var(--m-${rk})`);
      }
    });
    const hud=s.hud||curCfg.hud||[];
    hudEl.hidden=!hud.length;
    hudEl.innerHTML=hud.map(x=>{const rk=roleKey(x.role);return `<span class="k-hud-chip"${rk?` data-role="${rk}" style="--rc:var(--m-${rk})"`:""}><b>${escHtml(x.label)}</b><span>${escHtml(x.val)}</span></span>`}).join("");
    const parens=s.parens||curCfg.parens;
    if(parens&&parens.length){
      parenEl.hidden=false;
      const maxT=Math.max(2,...parens.map(p=>p.f||p.d||1));
      parenEl.innerHTML=`<div class="k-np-head">Parenthesis Theorem Nesting [d, f]</div><div class="k-np-rows">`+
        parens.map(pr=>{
          const d=pr.d||0,f=pr.f,rk=roleKey(pr.role)||(f?"r":"c");
          const left=((d-1)/maxT*100).toFixed(1),width=f?Math.max(6,((f-d+1)/maxT*100)).toFixed(1):Math.max(6,((maxT-d+1)/maxT*100)).toFixed(1);
          return `<div class="k-np-row"><b>${escHtml(pr.label)}</b><div class="k-np-track"><span class="k-np-bar${f?" closed":" open"}" style="left:${left}%;width:${width}%;--rc:var(--m-${rk})">${d}${f?`..${f}`:".."}</span></div></div>`;
        }).join("")+`</div>`;
    } else parenEl.hidden=true;
    updateCam(false);
    if(an&&s.use)an.showUse(s.t,s.use,"var(--pc)");
    if(o.on)o.on(i,svg,s);
  };

  satBar.addEventListener("click",e=>{
    const b=e.target.closest(".k-sat-btn");if(!b||!curCfg.sat)return;
    const v=b.dataset.v;satAssign[v]=!satAssign[v];renderSatState(null);
  });
  svg.addEventListener("click",e=>{
    if(svg._camDragged)return;
    const g=e.target.closest(".k-net-node");if(!g)return;
    const ni=+g.dataset.i,nd=curNodes[ni];if(!nd)return;
    if(curCfg.sat){satPicked[nd.ci]=nd.id;renderSatState(null);return}
    const si=curSteps.findIndex(s=>(s.on||[]).includes(nd.id));
    if(si>=0&&player){player.stop();player.show(si)}
    if(an&&nd.use)an.showUse(nd.t,nd.use,roleCol(nd.role,"var(--pc)"));
  });
  if(tabs.length>1){
    mountTabs(S,tabs,idx=>{buildNetwork(tabs[idx],curW);curSteps=tabs[idx].steps||[];if(player)player.setSteps(curSteps,0)});
  }
  responsive(S,w=>{buildNetwork(curCfg,w);render(cur)});
  player=E.stepper(S.viz,curSteps,i=>render(i),{ms:o.ms||3800});
  return player;
};

/* =================================================================
   14. trim — Subset-Sum List Merging & TRIM(L, δ) FPTAS Simulator
   ================================================================= */
Kit.trim=(id,o)=>{
  const S=setup(id,"trim");if(!S)return;
  S.stage.classList.add("kit-html");
  const items=o.items||[10,12,15,22],t=o.target||30,n=items.length;
  let eps=o.eps??.4,cur=0,player=null;
  const wantLeg=o.legend!==false;
  const an=wantLeg?mountAnatomy(S,{showUse:true,legend:o.legend||[
    {role:"r",label:"Kept Representative",swatch:"dot",use:"Largest gaps preserved; next item stays > last·(1+δ)."},
    {role:"c",label:"Trimmed (within δ)",swatch:"cut",use:"Dropped because y ≤ last·(1+δ); error stays ≤ (1+δ)ⁿ."},
    {role:"k",label:"Over Target (> t)",swatch:"cut",use:"Exceeds target sum t, so safely pruned immediately."}
  ]}):null;
  const hudEl=h("div",{class:"k-hud"});
  const bodyEl=h("div",{class:"k-trim-body"});
  S.stage.append(hudEl,bodyEl);
  if(an){S.stage.append(an.useBox);an.wire(bodyEl)}

  const computeSteps=e=>{
    const delta=e/(2*n);
    const out=[{t:"Start with L₀ = [0]",d:`With ${n} items and target t = ${t}, δ = ε / (2n) = ${delta.toFixed(3)}.`,prev:[0],shift:[],merged:[{v:0,st:"keep"}],kept:[0],delta}];
    let L=[0];
    items.forEach((x,idx)=>{
      const sh=L.map(v=>v+x);
      const raw=[...new Set([...L,...sh])].sort((a,b)=>a-b);
      const merged=[];let last=null;const nextL=[];
      raw.forEach(y=>{
        if(y>t){merged.push({v:y,st:"over"});return}
        if(last==null||y>last*(1+delta)){merged.push({v:y,st:"keep"});nextL.push(y);last=y}
        else merged.push({v:y,st:"trim",ref:last});
      });
      out.push({
        t:`Item x${idx+1} = ${x}: Merge & TRIM`,
        d:`Shift L${idx} by +${x}, cut sums > ${t}, and trim items within ×(1 + ${delta.toFixed(3)}).`,
        x,idx:idx+1,prev:L,shift:sh,merged,kept:nextL,delta
      });
      L=nextL;
    });
    const z=L[L.length-1]||0;
    out.push({t:`Result z* = ${z} (bounded by 1 + ε)`,d:`Kept ${L.length} sums; OPT / z* ≤ (1 + δ)ⁿ ≤ 1 + ${e.toFixed(2)}.`,prev:L,shift:[],merged:L.map(v=>({v,st:v===z?"best":"keep"})),kept:L,delta,z});
    return out;
  };
  let steps=computeSteps(eps);
  const pillRow=(arr,cls="")=>arr.map(v=>`<span class="k-tr-pill ${cls}">${v}</span>`).join("");
  const render=i=>{
    cur=i;const s=steps[i]||steps[0],bd=Math.pow(1+s.delta,n);
    hudEl.innerHTML=`<span class="k-hud-chip" data-role="v" style="--rc:var(--m-v)"><b>δ = ε/(2n)</b><span>${s.delta.toFixed(3)}</span></span>`+
      `<span class="k-hud-chip" data-role="r" style="--rc:var(--m-r)"><b>Kept</b><span>${s.kept.length} / ${s.merged.length}</span></span>`+
      `<span class="k-hud-chip" data-role="f" style="--rc:var(--m-f)"><b>Bound (1+δ)ⁿ</b><span>${bd.toFixed(3)} ≤ ${(1+eps).toFixed(2)}</span></span>`;
    let html=`<div class="k-tr-sec"><b>L${s.idx?s.idx-1:0}</b><div>${pillRow(s.prev)}</div></div>`;
    if(s.shift.length)html+=`<div class="k-tr-sec"><b>L${s.idx-1} + ${s.x}</b><div>${pillRow(s.shift,"is-v")}</div></div>`;
    html+=`<div class="k-tr-sec"><b>TRIM(L, ${s.delta.toFixed(3)})</b><div>`+
      s.merged.map(m=>{
        const note=m.st==="trim"?`Trimmed near ${m.ref} (within ×(1+${s.delta.toFixed(3)}))`:m.st==="over"?`Dropped: exceeds target ${t}`:m.st==="best"?"Final closest subset sum z* ≤ target":"Kept representative in trimmed list";
        const rl=m.st==="trim"?"c":m.st==="over"?"k":"r";
        return `<span class="k-tr-pill is-${m.st}" data-role="${rl}" data-uname="${m.v}" data-use="${escAttr(note)}" title="${escAttr(note)}">${m.v}</span>`;
      }).join("")+
      `</div></div>`;
    bodyEl.innerHTML=html;
  };
  ctlRange(S,"eps",{label:"Tolerance ε",min:.2,max:.8,step:.1,value:eps,dp:1},v=>{
    eps=v;steps=computeSteps(eps);if(player)player.setSteps(steps,Math.min(cur,steps.length-1));
  });
  player=E.stepper(S.viz,steps,i=>render(i),{ms:o.ms||3800});
  return player;
};

/* =================================================================
   15. venn — Complexity Class Venn / Euler Diagram (P, NP, NPC, NP-hard)
   ================================================================= */
Kit.venn=(id,o)=>{
  const S=setup(id,"venn");if(!S)return;
  const svg=svgIn(S,o.alt||"Complexity classes Venn diagram: P, NP, NPC, and NP-hard.");
  let collapsed=false,cur=0,player=null;
  const wantLeg=o.legend!==false;
  const an=wantLeg?mountAnatomy(S,{showUse:true,legend:o.legend||[
    {role:"r",label:"P (Poly-Time)",swatch:"area",use:"Decision problems solvable in O(n^k) deterministic time."},
    {role:"v",label:"NP (Verifiable)",swatch:"area",use:"Decision problems with polynomial-time verifiers."},
    {role:"f",label:"NPC = NP ∩ NP-hard",swatch:"area",use:"Hardest problems in NP; all of NP reduces to them."},
    {role:"k",label:"NP-hard \\ NP",swatch:"area",use:"Optimization/undecidable problems at least as hard as NP."}
  ]}):null;
  mountTabs(S,[{label:"Assume P ≠ NP"},{label:"Assume P = NP"}],idx=>{collapsed=idx===1;draw();render(cur)});
  const steps=stepsOr(o,[
    {t:"P inside NP",d:"Every solvable-in-poly-time problem is also verifiable in poly-time (P ⊆ NP).",focus:["p","np"]},
    {t:"NP-hard & NPC intersection",d:"NPC is the exact overlap NP ∩ NP-hard; optimization problems like TSP-OPT sit above NP.",focus:["npc","nph"]},
    {t:"Under P = NP",d:"If any NPC problem gets a poly-time algorithm, P, NP, and NPC collapse into one set.",focus:["p","np","npc"]}
  ]);
  const draw=()=>{
    const W=640,H=350;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    const pCx=collapsed?240:200,pCy=collapsed?195:245,pRx=collapsed?165:110,pRy=collapsed?115:68;
    const nphCx=410,nphCy=145,nphRx=175,nphRy=115;
    let s=`<defs><clipPath id="${S.uid}-np"><ellipse cx="240" cy="195" rx="185" ry="132"/></clipPath></defs>`;
    s+=`<g class="k-venn-zone" data-part="np" data-role="v" style="--rc:var(--m-v)"><ellipse class="k-venn-ring" cx="240" cy="195" rx="185" ry="132"/><text class="k-t" x="115" y="124" text-anchor="middle">NP</text><text class="k-s" x="115" y="140" text-anchor="middle">Fast to check</text></g>`;
    s+=`<g class="k-venn-zone" data-part="nph" data-role="k" style="--rc:var(--m-k)"><ellipse class="k-venn-ring" cx="${nphCx}" cy="${nphCy}" rx="${nphRx}" ry="${nphRy}"/><text class="k-t" x="495" y="88" text-anchor="middle">NP-hard</text><text class="k-s" x="495" y="104" text-anchor="middle">At least as hard</text></g>`;
    s+=`<g class="k-venn-zone" data-part="npc" data-role="f" clip-path="url(#${S.uid}-np)" style="--rc:var(--m-f)"><ellipse class="k-venn-ring is-npc" cx="${nphCx}" cy="${nphCy}" rx="${nphRx}" ry="${nphRy}"/></g>`;
    s+=`<g class="k-venn-zone" data-part="p" data-role="r" style="--rc:var(--m-r)"><ellipse class="k-venn-ring" cx="${pCx}" cy="${pCy}" rx="${pRx}" ry="${pRy}"/><text class="k-t" x="${pCx}" y="${pCy+(collapsed?-65:-32)}" text-anchor="middle">${collapsed?"P = NP = NPC":"P"}</text><text class="k-s" x="${pCx}" y="${pCy+(collapsed?-49:-16)}" text-anchor="middle">${collapsed?"All collapse together":"Fast to solve"}</text></g>`;
    const pills=collapsed
      ?[{x:200,y:175,t:"3-SAT",r:"r",use:"Under P = NP, every NP-complete problem becomes fast to solve."},{x:285,y:175,t:"Shortest Path",r:"r",use:"Solved in O(V+E) or O((V+E) log V) — solidly in P."},{x:240,y:215,t:"2-Coloring",r:"r",use:"Checked by one BFS/DFS pass — polynomial time (P)."},{x:490,y:145,t:"TSP-OPT",r:"k",use:"Optimization (find min tour cost, not Yes/No) sits above NP."},{x:490,y:185,t:"Halting",r:"k",use:"Undecidable: outside NP even if P = NP."}]
      :[{x:165,y:248,t:"Shortest Path",r:"r",use:"Solved in O(V+E) or O((V+E) log V) — fast to solve (P)."},{x:260,y:248,t:"2-Coloring",r:"r",use:"Solved in O(V+E) by BFS/DFS — fast to solve (P)."},{x:148,y:168,t:"Graph Iso?",r:"v",use:"Easy to check a bijection (in NP), not proven in P or NPC."},{x:320,y:132,t:"3-SAT",r:"f",use:"Canonical NPC problem: every NP problem reduces to 3-SAT."},{x:320,y:168,t:"Vertex Cover",r:"f",use:"NPC: easy to check a cover, hard to find minimum k vertices."},{x:495,y:145,t:"TSP-OPT",r:"k",use:"Optimization (not Yes/No decision) — sits in NP-hard \\ NP."},{x:495,y:185,t:"Halting",r:"k",use:"Undecidable: at least as hard as NP, not even verifiable."}];
    pills.forEach(pl=>{s+=pillSvg(pl.x,pl.y,pl.t,{W,H,fs:11,cls:"k-epill clickable on",tcls:"k-epill-t",role:pl.r,minW:34,use:pl.use,uname:pl.t})});
    if(!collapsed)s+=`<text class="k-c" x="320" y="92" text-anchor="middle" style="fill:var(--m-f)">NPC = NP ∩ NP-hard</text><text class="k-s" x="320" y="106" text-anchor="middle">Hardest Yes/No problems in NP</text>`;
    svg.innerHTML=s;if(an)an.wire(svg);
  };
  const render=i=>{
    cur=i;const s=steps[i]||{},f=s.focus||[];
    $$("[data-part]",svg).forEach(el=>{const on=!f.length||f.includes(el.dataset.part);el.classList.toggle("k-faint",!on);el.classList.toggle("k-active",on&&f.length<4)});
    if(o.on)o.on(i,svg,s);
  };
  draw();
  player=E.stepper(S.viz,steps,i=>render(i),{ms:o.ms||3800});
  return player;
};
})();
