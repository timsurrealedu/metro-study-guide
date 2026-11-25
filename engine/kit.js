/* =====================================================================
   METRO ENGINE v1.3 · VISUAL KIT
   ---------------------------------------------------------------------
   1) V  — small drawing helpers for hand-drawn (custom) visuals.
   2) Kit — ready-made step visuals you configure with data instead of
            drawing by hand. Every kit gets the standard player
            (Start over · Back · Play · Next), step captions, the light /
            dark theme, the line colour, and the Animations switch.

   Responsive kits (flow, cycle, timeline, graph, bars, particles) redraw
   to the real width of their box, so text stays the same size on a
   phone as on a laptop. They switch to a stacked layout on narrow boxes.
   The diagram kit scales a drawing you supply. derive and annotate are
   HTML, so they wrap like normal text.

   Use in visuals.js:   Kit.flow("v-id", { …options… });
   Full reference:      docs/04-visual-kits.md
   ===================================================================== */
(function(){
const E=window.Engine, $=E.$, $$=E.$$, h=E.h;

/* ---------------------------------------------------------------- V */
const V=window.V={};
V.svg=id=>$("#"+id+" .viz-stage svg")||$("#"+id);
V.put=(svg,html)=>svg.insertAdjacentHTML("beforeend",html);
V.clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
V.lerp=(a,b,t)=>a+(b-a)*t;
V.sm=(a,b,t)=>{const x=V.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x)};
V.arrow=(id,cls="f-arrow")=>`<defs><marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="${cls}"/></marker></defs>`;
V.show=(el,on)=>{if(!el)return;(el.length!=null?[...el]:[el]).forEach(e=>e.classList.toggle("hide",!on))};
V.dim=(el,on)=>{if(!el)return;(el.length!=null?[...el]:[el]).forEach(e=>e.classList.toggle("dim",!!on))};
V.lbl=(x,y,t,cls="",anchor="middle")=>`<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${t}</text>`;
V.wrap=(txt,max)=>{const safe=String(txt).replace(/^(\d+\.|[A-Za-z]\.|Step\s+\d+:?)\s+/,"$1\u00A0").replace(/(\[[^\]]{1,16}\]|\([^)]{1,16}\))/g,m=>m.replace(/ /g,"\u00A0")).replace(/([=≈≤≥≠∈→])\s+(\S+)/g,"$1\u00A0$2");const w=safe.split(" ");const out=[];let line="";w.forEach(x=>{if((line+" "+x).trim().length>max&&line){out.push(line);line=x}else line=(line+" "+x).trim()});if(line)out.push(line);return out};
/* tween helper that respects the Animations switch */
V.tween=(dur,fn,done)=>{if(!E.motionOn()){fn(1);done&&done();return()=>{}}let t0=null,stop=false;function f(now){if(stop)return;if(t0==null)t0=now;const t=Math.min(1,(now-t0)/dur);fn(t);if(t<1)requestAnimationFrame(f);else done&&done()}requestAnimationFrame(f);return()=>{stop=true}};
V.ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

/* @kit-start (build.py drops everything below when visuals.js never calls Kit.) */
/* ---------------------------------------------------------------- shared */
const Kit=window.Kit={version:"1.4"};
const PAL=i=>`var(--c${(i%4)+1})`;
const CW=(fs)=>fs*.53;                                   // average character width in px
const fit=(t,w,fs)=>V.wrap(t,Math.max(6,Math.floor(w/CW(fs))));
const tlines=(x,y,lines,cls,lh,anchor="start")=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?lh:0}">${l}</tspan>`).join("")}</text>`;
let uid=0;
function setup(id,kind){
  const viz=document.getElementById(id);
  if(!viz){console.warn(`Kit.${kind}: no element with id "${id}" in content.html`);return null}
  viz.classList.add("viz","kit","kit-"+kind);
  let stage=$(".viz-stage",viz);if(!stage){stage=h("div",{class:"viz-stage"});viz.prepend(stage)}
  return {viz,stage,uid:"k"+(++uid)};
}
function svgIn(S,alt,cls=""){let svg=$("svg",S.stage);if(!svg){S.stage.innerHTML=`<svg class="${cls}" role="img" aria-label="${(alt||"").replace(/"/g,"&quot;")}"></svg>`;svg=$("svg",S.stage)}return svg}
/* measure the box and redraw when it changes size (phone ↔ laptop, scroll ↔ explainer). */
function responsive(S,layout,box){
  const el=box||$("svg",S.stage)||S.stage;
  const width=()=>{const w=el.getBoundingClientRect().width;return w<60?0:Math.max(260,Math.min(1100,Math.round(w)))};
  let last=0;const run=()=>{const w=width();if(!w)return;if(Math.abs(w-last)>6){last=w;layout(w)}};
  new ResizeObserver(run).observe(box||S.stage);
  const w=width();layout(last=w||640);
}
const markers=(u)=>`<defs><marker id="${u}-on" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="k-head on"/></marker><marker id="${u}-off" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="k-head"/></marker></defs>`;
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
  const parts=$$("[data-part]",svg),labels=$$("[data-label]",svg),builds=$$("[data-step]",svg),onlys=$$("[data-only]",svg);
  labels.forEach(l=>l.classList.add("fade"));
  const steps=stepsOr(o,[{t:"Overview",d:""}]);
  return E.stepper(S.viz,steps,(i)=>{const s=steps[i],f=s.focus;
    parts.forEach(p=>p.classList.toggle("k-faint",!!f&&!f.includes(p.dataset.part)));
    const L=s.labels||f||[];labels.forEach(l=>l.classList.toggle("hide",!L.includes(l.dataset.label)));
    builds.forEach(b=>b.classList.toggle("hide",i<+b.dataset.step));
    onlys.forEach(b=>b.classList.toggle("hide",!b.dataset.only.split(",").map(Number).includes(i)));
    if(o.on)o.on(i,svg,s);},{ms:o.ms});
};

/* =================================================================
   2. flow — a process: boxes joined by arrows, lit one step at a time
   ================================================================= */
Kit.flow=(id,o)=>{
  const S=setup(id,"flow");if(!S)return;
  const svg=svgIn(S,o.alt),N=o.nodes,n=N.length;
  const idx=k=>typeof k==="number"?k:N.findIndex(x=>x.id===k);
  const edges=(o.edges||N.slice(1).map((_,i)=>[i,i+1])).map(e=>[idx(e[0]),idx(e[1]),e[2]||""]);
  const steps=stepsOr(o,N.map((nd,i)=>({t:nd.t,d:nd.d||"",on:[i]})));
  let cur=0;
  function layout(W){
    /* a simple chain (each box leads to the next) may stack in one column on phones;
       a branching flow keeps at least two columns so its arrows can go round the boxes */
    const chain=edges.every(([a,b])=>b===a+1);
    const minNodeW=Math.min(250,Math.max(190,...N.map(nd=>{const first=(nd.t||"").replace(/^(\d+\.)\s+/,"$1\u00A0").split(" ")[0];return Math.ceil(first.length*CW(15))+34})));
    let cols=Math.max(1,Math.min(o.cols||4,n,Math.floor((W+36)/(minNodeW+28))));
    if(chain&&W<540)cols=1;else if(!chain&&n>1)cols=Math.max(2,cols);
    const labW=Math.max(0,...edges.map(e=>e[2]?e[2].length*7+22:0));
    const gap=cols>1?Math.max(labW,Math.min(64,Math.max(40,(W-cols*150)/(cols-1)*.35))):0;
    const bw=Math.min(o.boxWidth||240,(W-8-(cols-1)*gap)/cols);
    const ox=(W-(cols*bw+(cols-1)*gap))/2;
    const wr=N.map(nd=>({t:fit(nd.t,bw-24,15),s:nd.sub?fit(nd.sub,bw-24,13):[]}));
    const hh=wr.map((w,i)=>16+w.t.length*19+(w.s.length?3+w.s.length*17:0)+(N[i].tag?30:0)+14);
    const rows=Math.ceil(n/cols),rowH=[];for(let r=0;r<rows;r++)rowH[r]=Math.max(...hh.slice(r*cols,r*cols+cols));
    const vg=cols===1?40:56;let y=10;const P=[];
    for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){const i=r*cols+c;if(i>=n)break;P[i]={x:ox+c*(bw+gap),y,w:bw,h:rowH[r],r,c}}y+=rowH[r]+vg}
    const H=y-vg+12;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    let s=markers(S.uid);
    edges.forEach(([a,b,lab],k)=>{const A=P[a],B=P[b];if(!A||!B)return;let d;
      const down=B.r>A.r,ax=A.x+A.w/2,bx=B.x+B.w/2,ay=down?A.y+A.h:A.y,by=down?B.y-4:B.y+B.h+4;
      if(A.r===B.r&&B.c>A.c)d=`M${A.x+A.w},${A.y+A.h/2} H${B.x-4}`;
      else if(A.r===B.r)d=`M${A.x},${A.y+A.h/2} H${B.x+B.w+4}`;
      else if(Math.abs(B.r-A.r)===1){d=Math.abs(ax-bx)<1?`M${ax},${ay} V${by}`:`M${ax},${ay} V${down?A.y+A.h+vg/2:A.y-vg/2} H${bx} V${by}`}
      else{/* skips a row: run down the gap between columns so the arrow never crosses a box */
        const cx=A.c<cols-1?A.x+A.w+gap/2:A.x-gap/2,y1=down?A.y+A.h+vg/2:A.y-vg/2,y2=down?B.y-vg/2:B.y+B.h+vg/2;
        d=`M${ax},${ay} V${y1} H${cx} V${y2} H${bx} V${by}`}
      s+=`<path class="k-edge" data-e="${k}" d="${d}"/>`;
      if(lab){const mx=A.r===B.r?(A.x+A.w+B.x)/2:A.x+A.w/2+8,my=A.r===B.r?A.y+A.h/2-9:A.y+A.h+(cols===1||A.c===B.c?vg/2+4:vg/2-6);s+=`<text class="k-s k-elab" data-e="${k}" x="${mx}" y="${my}" text-anchor="${A.r===B.r?"middle":"start"}">${lab}</text>`}});
    N.forEach((nd,i)=>{const p=P[i],w=wr[i];let t=`<g class="k-n" data-i="${i}"><rect class="k-node" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="14"/>`;
      t+=tlines(p.x+12,p.y+28,w.t,"k-t",19);
      if(w.s.length)t+=tlines(p.x+12,p.y+28+w.t.length*19+2,w.s,"k-s",17);
      if(nd.tag)t+=`<g class="k-tag"><rect x="${p.x+12}" y="${p.y+p.h-40}" width="${Math.min(p.w-24,nd.tag.length*8+22)}" height="24" rx="12"/><text class="k-c" x="${p.x+23}" y="${p.y+p.h-23.5}">${nd.tag}</text></g>`;
      s+=t+"</g>"});
    svg.innerHTML=s;render(cur);
  }
  function render(i){cur=i;const s=steps[i]||{},on=(s.on||[i]).map(idx),reach=Math.max(...on,s.upTo!=null?idx(s.upTo):-1);
    $$(".k-n",svg).forEach(g=>{const k=+g.dataset.i;g.classList.toggle("on",on.includes(k));g.classList.toggle("done",k<=reach&&!on.includes(k));g.classList.toggle("todo",k>reach)});
    edges.forEach(([a,b],k)=>{const lit=a<=reach&&b<=reach,into=on.includes(b)&&a<=reach;
      $$(`[data-e="${k}"]`,svg).forEach(e=>{e.classList.toggle("done",lit);e.classList.toggle("todo",!lit);e.classList.toggle("flowline",into&&e.tagName==="path");if(e.tagName==="path")e.setAttribute("marker-end",`url(#${S.uid}-${lit?"on":"off"})`)})});
    if(o.on)o.on(i,svg,s);}
  responsive(S,layout);
  return E.stepper(S.viz,steps,i=>render(i),{ms:o.ms});
};

/* =================================================================
   3. cycle — a loop of stages (Krebs, water cycle, business cycle…)
   ================================================================= */
Kit.cycle=(id,o)=>{
  const S=setup(id,"cycle");if(!S)return;
  const svg=svgIn(S,o.alt),N=o.nodes,n=N.length;
  const steps=stepsOr(o,N.map((nd,i)=>({t:nd.t,d:nd.d||"",on:[i]})));
  let cur=0,P=[];
  function layout(W){
    let s=markers(S.uid);
    if(W>=500){
      const bw=Math.min(170,W*.27),H=Math.round(Math.min(460,Math.max(340,W*.66))),cx=W/2,cy=H/2,rx=Math.min(W/2-bw/2-10,260),ry=H/2-48;
      P=N.map((nd,i)=>{const a=-Math.PI/2+2*Math.PI*i/n;const w=fit(nd.t,bw-20,14.5),sb=nd.sub?fit(nd.sub,bw-20,12.5):[];const hh=14+w.length*18+(sb.length?sb.length*16+4:0)+10;return {x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a),a,w,sb,hh}});
      svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      for(let i=0;i<n;i++){const a1=P[i].a+.32,a2=P[i].a+2*Math.PI/n-.32;const x1=cx+rx*Math.cos(a1),y1=cy+ry*Math.sin(a1),x2=cx+rx*Math.cos(a2),y2=cy+ry*Math.sin(a2);
        s+=`<path class="k-edge" data-e="${i}" d="M${x1.toFixed(1)},${y1.toFixed(1)} A${rx},${ry} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}"/>`}
      if(o.center){const ct=fit(o.center.t,rx*1.1,17),cs=o.center.sub?fit(o.center.sub,rx*1.2,13):[];s+=tlines(cx,cy-((ct.length+cs.length)*18)/2+14,ct,"k-big",22,"middle")+(cs.length?tlines(cx,cy-((ct.length+cs.length)*18)/2+14+ct.length*22,cs,"k-s",17,"middle"):"")}
      P.forEach((p,i)=>{const bx=p.x-bw/2,by=p.y-p.hh/2;s+=`<g class="k-n" data-i="${i}"><rect class="k-node" x="${bx}" y="${by}" width="${bw}" height="${p.hh}" rx="14"/>${tlines(p.x,by+26,p.w,"k-t",18,"middle")}${p.sb.length?tlines(p.x,by+26+p.w.length*18+2,p.sb,"k-s",16,"middle"):""}</g>`;p.cx=p.x;p.cy=by});
    } else {
      /* narrow: a stacked list with a return arrow down the right side */
      const bw=W-56,x0=8;let y=o.center?50:10;const R=[];
      if(o.center)s+=tlines(x0,26,fit(o.center.t,W-16,16),"k-big",20)+(o.center.sub?`<text class="k-s" x="${x0}" y="44">${o.center.sub}</text>`:"");
      P=N.map((nd,i)=>{const w=fit(nd.t,bw-24,14.5),sb=nd.sub?fit(nd.sub,bw-24,12.5):[];const hh=14+w.length*18+(sb.length?sb.length*16+4:0)+10;const p={x:x0,y,w,sb,hh};y+=hh+30;return p});
      const H=y-18;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      for(let i=0;i<n;i++){const A=P[i],B=P[(i+1)%n];
        if(i<n-1)s+=`<path class="k-edge" data-e="${i}" d="M${A.x+bw/2},${A.y+A.hh} V${B.y-4}"/>`;
        else s+=`<path class="k-edge" data-e="${i}" d="M${A.x+bw},${A.y+A.hh/2} H${W-14} Q${W-4},${A.y+A.hh/2} ${W-4},${A.y+A.hh/2-10} V${B.y+B.hh/2+10} Q${W-4},${B.y+B.hh/2} ${W-14},${B.y+B.hh/2} H${A.x+bw+4}"/>`}
      P.forEach((p,i)=>{s+=`<g class="k-n" data-i="${i}"><rect class="k-node" x="${p.x}" y="${p.y}" width="${bw}" height="${p.hh}" rx="14"/>${tlines(p.x+13,p.y+26,p.w,"k-t",18)}${p.sb.length?tlines(p.x+13,p.y+26+p.w.length*18+2,p.sb,"k-s",16):""}</g>`});
    }
    svg.innerHTML=s;render(cur);
  }
  function render(i){cur=i;const s=steps[i]||{},on=s.on||[i],reach=Math.max(...on);
    $$(".k-n",svg).forEach(g=>{const k=+g.dataset.i;g.classList.toggle("on",on.includes(k));g.classList.toggle("done",!on.includes(k)&&(s.all||k<=reach));g.classList.toggle("todo",!s.all&&k>reach)});
    $$(".k-edge",svg).forEach(e=>{const k=+e.dataset.e,lit=s.all||k<reach||(k===n-1&&s.loop);e.classList.toggle("done",lit);e.classList.toggle("todo",!lit);e.classList.toggle("flowline",on.includes((k+1)%n)&&(k<reach||s.loop||s.all));e.setAttribute("marker-end",`url(#${S.uid}-${lit?"on":"off"})`)});
    if(o.on)o.on(i,svg,s);}
  responsive(S,layout);
  return E.stepper(S.viz,steps,i=>render(i),{ms:o.ms});
};

/* =================================================================
   4. timeline — events in order (history, literature, science)
   ================================================================= */
Kit.timeline=(id,o)=>{
  const S=setup(id,"timeline");if(!S)return;
  const svg=svgIn(S,o.alt),Ev=o.events,n=Ev.length;
  const steps=stepsOr(o,Ev.map((e,i)=>({t:`${e.date} · ${e.t}`,d:e.d||e.sub||"",on:[i]})));
  let cur=0;
  function layout(W){let s="";
    if(W>=600&&n<=9){
      const cw0=Math.min(170,(W-140)/Math.max(1,n-1)*1.8),pad=Math.max(60,cw0/2+8),span=W-2*pad;
      const nums=Ev.map(e=>parseFloat(String(e.date).replace(/[^\d.-]/g,"")));
      const timeScale=o.scale==="time"&&nums.every(v=>!isNaN(v));
      const mn=Math.min(...nums),mx=Math.max(...nums);
      const X=i=>pad+(timeScale&&mx>mn?(nums[i]-mn)/(mx-mn):(n>1?i/(n-1):.5))*span;
      const cw=Math.min(cw0,(span/Math.max(1,n-1))*1.9);
      const cards=Ev.map((e,i)=>({w:fit(e.t,cw,14),sb:e.sub?fit(e.sub,cw,12.5):[]}));
      const up=cards.map(c=>16+c.w.length*18+c.sb.length*16);
      const top=Math.max(...up.filter((_,i)=>i%2===0),0)+34,bot=Math.max(...up.filter((_,i)=>i%2===1),0)+34;
      const ay=top+30,H=ay+bot+36;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      s+=`<line class="k-axis" x1="${pad-40}" y1="${ay}" x2="${W-pad+40}" y2="${ay}"/>`;
      Ev.forEach((e,i)=>{const x=X(i),c=cards[i],isUp=i%2===0,hh=up[i];
        const ty=isUp?ay-30-hh+16:ay+44;
        s+=`<g class="k-ev" data-i="${i}"><line class="k-lead" x1="${x}" y1="${ay}" x2="${x}" y2="${isUp?ay-24:ay+24}"/><circle class="k-dot" cx="${x}" cy="${ay}" r="8"/>`
         +`<text class="k-c" x="${x}" y="${isUp?ay+22:ay-14}" text-anchor="middle">${e.date}</text>`
         +tlines(x,ty,c.w,"k-t",18,"middle")+(c.sb.length?tlines(x,ty+c.w.length*18,c.sb,"k-s",16,"middle"):"")+`</g>`});
    } else {
      const ax=22;let y=20;const rows=Ev.map(e=>{const w=fit(e.t,W-ax-30,14.5),sb=e.sub?fit(e.sub,W-ax-30,12.5):[];const r={y,w,sb,hh:22+w.length*18+sb.length*16};y+=r.hh+18;return r});
      const H=y;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      s+=`<line class="k-axis" x1="${ax}" y1="10" x2="${ax}" y2="${H-10}"/>`;
      Ev.forEach((e,i)=>{const r=rows[i];s+=`<g class="k-ev" data-i="${i}"><circle class="k-dot" cx="${ax}" cy="${r.y+6}" r="8"/><text class="k-c" x="${ax+20}" y="${r.y+10}">${e.date}</text>${tlines(ax+20,r.y+30,r.w,"k-t",18)}${r.sb.length?tlines(ax+20,r.y+30+r.w.length*18,r.sb,"k-s",16):""}</g>`});
    }
    svg.innerHTML=s;render(cur);
  }
  function render(i){cur=i;const s=steps[i]||{},on=s.on||[i],reach=Math.max(...on);
    $$(".k-ev",svg).forEach(g=>{const k=+g.dataset.i;g.classList.toggle("on",on.includes(k));g.classList.toggle("done",!on.includes(k)&&k<=reach);g.classList.toggle("todo",k>reach&&!s.all)});
    if(o.on)o.on(i,svg,s);}
  responsive(S,layout);
  return E.stepper(S.viz,steps,i=>render(i),{ms:o.ms});
};

/* =================================================================
   5. graph — functions, sliders, tangents, Riemann sums, vectors
   ================================================================= */
function mountGraph(svg,S,o,pane){
  const X=o.x,Y=o.y,F=o.fns||[];
  const p={};Object.entries(o.params||{}).forEach(([k,c])=>p[k]=c.value);
  const col=(fn,k)=>fn.color||(k?PAL(k-1):"var(--pc)");
  const val=(v,d)=>v==null?d:(typeof v==="function"?v(p):v);
  const lab=(t,x,y)=>String(t).replace("{x}",num(x)).replace("{y}",num(y));
  const arr=v=>v==null?[]:(Array.isArray(v)?v:[v]);
  let W0=640,H0=360,leg=[],legH=0,stopT=()=>{},show=F.map((_,i)=>i),prevShow=[],justStepped=false,marks=[],setters={};
  let ex={vlines:o.vlines||[],hlines:o.hlines||[],dots:o.dots||[],shade:o.shade||[],tangents:o.tangents||[],riemann:o.riemann||[],vectors:o.vectors||[]};
  function layout(W){W0=W;
    leg=[];let lx=0,ly=0;F.forEach((fn,k)=>{if(!fn.label)return;const w=26+fn.label.length*7.4+18;if(lx&&lx+w>W-60){lx=0;ly+=22}leg.push({k,x:lx,y:ly});lx+=w});
    legH=leg.length?ly+26:0;H0=Math.round(V.clamp(W*(o.aspect||.5),190,330))+34+46+legH;draw()}
  function pieces(fn){
    let a=val(fn.domain&&fn.domain[0],X.min),b=val(fn.domain&&fn.domain[1],X.max);a=Math.max(a,X.min);b=Math.min(b,X.max);if(!(b>a))return[];
    let br=fn.breaks==="int"?(()=>{const r=[];for(let k=Math.ceil(a);k<=b;k++)r.push(k);return r})():arr(val(fn.breaks,[]));
    const cuts=[a,...br.filter(x=>x>a&&x<b).sort((u,v)=>u-v),b],out=[];
    for(let i=0;i<cuts.length-1;i++)if(cuts[i+1]-cuts[i]>1e-9)out.push([cuts[i],cuts[i+1]]);return out}
  function fval(fn,x){let y;try{y=fn.f(x,p)}catch(e){y=NaN}return y}
  function draw(){
    const W=W0,H=H0,L=52,R=16,T=34,B=46+legH;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    const sx=x=>L+(x-X.min)/(X.max-X.min)*(W-L-R),sy=y=>H-B-(y-Y.min)/(Y.max-Y.min)*(H-T-B);
    const eps=(X.max-X.min)*1e-6;
    const clx=(x,lw,anchor)=>{if(anchor==="end")return V.clamp(x,L+lw+2,W-R);if(anchor==="middle")return V.clamp(x,L+lw/2+2,W-R-lw/2-2);return V.clamp(x,L+2,W-R-lw-2)};
    const cly=y=>V.clamp(y,T+13,H-B-6);
    let s=`<defs><clipPath id="${S.uid}-c"><rect x="${L}" y="${T-4}" width="${W-L-R}" height="${H-T-B+8}"/></clipPath>`
      +`<marker id="${S.uid}-vec" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="k-head on"/></marker></defs>`;
    const gx=X.step||nice(X.max-X.min,W<500?5:8),gy=Y.step||nice(Y.max-Y.min,6);
    for(let v=Math.ceil(X.min/gx)*gx;v<=X.max+1e-9;v+=gx)s+=`<line class="k-grid" x1="${sx(v)}" y1="${T}" x2="${sx(v)}" y2="${H-B}"/><text class="k-s" x="${sx(v)}" y="${H-B+18}" text-anchor="middle">${num(v)}</text>`;
    for(let v=Math.ceil(Y.min/gy)*gy;v<=Y.max+1e-9;v+=gy)s+=`<line class="k-grid" x1="${L}" y1="${sy(v)}" x2="${W-R}" y2="${sy(v)}"/><text class="k-s" x="${L-8}" y="${sy(v)+4}" text-anchor="end">${num(v)}</text>`;
    s+=`<g clip-path="url(#${S.uid}-c)">`;
    arr(ex.shade).forEach((sh,j)=>{const f1=F[sh.fn||0],f2=sh.fn2!=null?F[sh.fn2]:null;if(!f1)return;
      const a=val(sh.from,X.min),b=val(sh.to,X.max);if(!(b>a))return;const N=Math.max(60,Math.round((sx(b)-sx(a))/3));let top="",bot=[],cy=0,cn=0;
      for(let i=0;i<=N;i++){const x=a+(b-a)*i/N,y1=fval(f1,x),y2=f2?fval(f2,x):0;if(!isFinite(y1)||!isFinite(y2))continue;
        const Y1=V.clamp(sy(y1),-2000,4000),Y2=V.clamp(sy(y2),-2000,4000);top+=(top?"L":"M")+sx(x).toFixed(1)+","+Y1.toFixed(1);bot.unshift(sx(x).toFixed(1)+","+Y2.toFixed(1));cy+=(Y1+Y2)/2;cn++}
      if(!cn)return;const c=sh.color||(j?PAL(j):"var(--pc)");
      s+=`<path class="k-shade" d="${top}L${bot.join("L")}Z" style="fill:${c};stroke:${c}"/>`;
      if(sh.label){const mx=val(sh.lx,(a+b)/2),ly=sh.ly!=null?sy(val(sh.ly)):cy/cn;s+=`<text class="k-t k-halo" x="${clx(sx(mx),sh.label.length*7.8,"middle")}" y="${cly(ly+5)}" text-anchor="middle">${sh.label}</text>`}});
    let riemSum=null,riemN=0;
    arr(ex.riemann).forEach((rm,j)=>{const f1=F[rm.fn||0];if(!f1)return;
      const a=val(rm.from,X.min),b=val(rm.to,X.max),n=Math.max(1,Math.min(80,Math.round(val(rm.n,6)))),mode=rm.mode||"left";
      if(!(b>a))return;const dx=(b-a)/n,c=rm.color||(j?PAL(j):"var(--pc)");let sum=0;
      for(let k=0;k<n;k++){const x0=a+k*dx,xk=mode==="right"?x0+dx:mode==="mid"?x0+dx/2:x0,yk=fval(f1,xk);if(!isFinite(yk))continue;
        sum+=yk*dx;const yTop=sy(Math.max(0,yk)),yBot=sy(Math.min(0,yk)),rx0=sx(x0),rw=Math.max(1.5,sx(x0+dx)-rx0);
        s+=`<rect class="k-riem" x="${rx0.toFixed(1)}" y="${V.clamp(yTop,-2000,4000).toFixed(1)}" width="${rw.toFixed(1)}" height="${Math.max(1,Math.abs(yBot-yTop)).toFixed(1)}" style="fill:${c};stroke:${c}"/>`}
      riemSum=sum;riemN=n;
      if(rm.label){const txt=String(rm.label).replace("{n}",n).replace("{sum}",num(sum));
        s+=`<text class="k-t k-halo" x="${clx(sx((a+b)/2),txt.length*7.8,"middle")}" y="${cly(T+16)}" text-anchor="middle" style="fill:${c}">${txt}</text>`}});
    s+=`</g>`;
    if(X.min<=0&&X.max>=0)s+=`<line class="k-axis" x1="${sx(0)}" y1="${T}" x2="${sx(0)}" y2="${H-B}"/>`;
    if(Y.min<=0&&Y.max>=0)s+=`<line class="k-axis" x1="${L}" y1="${sy(0)}" x2="${W-R}" y2="${sy(0)}"/>`;
    s+=`<text class="k-s k-axl" x="${W-R}" y="${H-B+38}" text-anchor="end">${X.label||"x"}</text><text class="k-s k-axl" x="6" y="18">${Y.label||"y"}</text>`;
    arr(ex.vlines).forEach(v=>{const x=val(v.x);if(!isFinite(x)||x<X.min||x>X.max)return;const c=v.color||"var(--text-2)";
      s+=`<line class="k-vl" x1="${sx(x)}" y1="${T-4}" x2="${sx(x)}" y2="${H-B}" style="stroke:${c};${v.dash===false?"":"stroke-dasharray:7 6"}"/>`;
      if(v.label){const t=lab(v.label,x,0),lw=t.length*8.2,side=v.side||(sx(x)+8+lw<=W-R?"right":"left"),right=side==="right";s+=`<text class="k-t k-halo" x="${clx(right?sx(x)+8:sx(x)-8,lw,right?"start":"end")}" y="${v.at==="bottom"?H-B-10:T+12}" text-anchor="${right?"start":"end"}" style="fill:${c}">${t}</text>`}});
    arr(ex.hlines).forEach(v=>{const y=val(v.y);if(!isFinite(y)||y<Y.min||y>Y.max)return;const c=v.color||"var(--text-2)";
      s+=`<line class="k-vl" x1="${L}" y1="${sy(y)}" x2="${W-R}" y2="${sy(y)}" style="stroke:${c};${v.dash===false?"":"stroke-dasharray:7 6"}"/>`;
      if(v.label){const t=lab(v.label,0,y),lw=t.length*8.2,ty=(v.below||sy(y)-8<T+10)?sy(y)+20:sy(y)-8,at=v.at||"right";s+=`<text class="k-t k-halo" x="${clx(at==="left"?L+6:W-R-4,lw,at==="left"?"start":"end")}" y="${cly(ty)}" text-anchor="${at==="left"?"start":"end"}" style="fill:${c}">${t}</text>`}});
    s+=`<g clip-path="url(#${S.uid}-c)">`;
    F.forEach((fn,k)=>{if(!show.includes(k))return;let d="";
      pieces(fn).forEach(([a,b])=>{let pen=false;const n=Math.max(40,Math.round(sx(b)-sx(a)));
        for(let j=0;j<=n;j++){let x=a+(b-a)*j/n;if(j===0)x=a+eps;if(j===n)x=b-eps;const y=fval(fn,x);
          if(!isFinite(y)||Math.abs(y)>1e6){pen=false;continue}const yy=V.clamp(sy(y),-2000,4000);d+=(pen?"L":"M")+sx(x).toFixed(1)+","+yy.toFixed(1);pen=true}});
      const anim=justStepped&&o.drawOn!==false&&!prevShow.includes(k)&&!fn.dash&&E.motionOn();
      s+=`<path class="k-curve${anim?" draw":""}"${anim?' pathLength="1"':""} d="${d}" style="stroke:${col(fn,k)};${fn.dash?"stroke-dasharray:7 6":""}"/>`});
    arr(ex.tangents).forEach((tg,j)=>{const fn=F[tg.fn||0];if(!fn)return;
      const x0=val(tg.x),y0=tg.y!=null?val(tg.y):fval(fn,x0),dx=(X.max-X.min)*1e-4;
      const m=tg.m!=null?val(tg.m):(fval(fn,x0+dx)-fval(fn,x0-dx))/(2*dx);
      if(!isFinite(x0)||!isFinite(y0)||!isFinite(m))return;
      const half=val(tg.len,(X.max-X.min)*.24),c=tg.color||"var(--c4)";
      s+=`<line class="k-tan" x1="${sx(x0-half).toFixed(1)}" y1="${sy(y0-m*half).toFixed(1)}" x2="${sx(x0+half).toFixed(1)}" y2="${sy(y0+m*half).toFixed(1)}" style="stroke:${c}"/>`;
      if(tg.triangle){const r=val(tg.dx,half*.65);s+=`<path class="k-mark" d="M${sx(x0).toFixed(1)},${sy(y0).toFixed(1)} H${sx(x0+r).toFixed(1)} V${sy(y0+m*r).toFixed(1)}" style="fill:none;stroke:${c}"/>`}
      s+=`<circle class="k-pt on" cx="${sx(x0)}" cy="${sy(y0)}" r="6" style="fill:${c}"/>`;
      if(tg.label){const txt=lab(tg.label,x0,y0).replace("{m}",num(m)),lw=txt.length*7.8,tx=sx(x0)+12+lw>W-R?sx(x0)-12-lw:sx(x0)+12;
        s+=`<text class="k-t k-halo" x="${clx(tx,lw,"start")}" y="${cly(sy(y0)-12)}" style="fill:${c}">${txt}</text>`}});
    arr(ex.vectors).forEach((vc,j)=>{
      const f=val(vc.from),t=val(vc.to);if(!f||!t)return;const c=vc.color||(j?PAL(j):"var(--c2)");
      s+=`<line class="k-vec" x1="${sx(f[0]).toFixed(1)}" y1="${sy(f[1]).toFixed(1)}" x2="${sx(t[0]).toFixed(1)}" y2="${sy(t[1]).toFixed(1)}" style="stroke:${c};${vc.dash?"stroke-dasharray:6 5":""}" marker-end="url(#${S.uid}-vec)"/>`;
      if(vc.label){const mx=(sx(f[0])+sx(t[0]))/2,my=(sy(f[1])+sy(t[1]))/2-8;s+=`<text class="k-t k-halo" x="${clx(mx,vc.label.length*7.6,"middle")}" y="${cly(my)}" text-anchor="middle" style="fill:${c}">${vc.label}</text>`}});
    (o.points||[]).forEach(pt=>{s+=`<circle class="k-pt" cx="${sx(pt[0])}" cy="${sy(pt[1])}" r="5.5"/>`+(pt[2]?`<text class="k-s k-halo" x="${clx(sx(pt[0])+9,pt[2].length*6.8,"start")}" y="${cly(sy(pt[1])-8)}">${pt[2]}</text>`:"")});
    s+=`</g>`;
    arr(ex.dots).forEach(dt=>{const x=val(dt.x);let y=dt.y!=null?val(dt.y):(F[dt.fn||0]?fval(F[dt.fn||0],x):NaN);if(!isFinite(x)||!isFinite(y)||x<X.min-1e-9||x>X.max+1e-9||y<Y.min-1e-9||y>Y.max+1e-9)return;
      const c=dt.color||col(F[dt.fn||0]||{},dt.fn||0),cw=6.8;
      s+=`<circle class="k-dot${dt.open?" open":""}" cx="${sx(x)}" cy="${sy(y)}" r="6" style="stroke:${c};${dt.open?"":"fill:"+c}"/>`;
      if(dt.label){const t=lab(dt.label,x,y),lw=t.length*cw,tx=sx(x)+12+lw>W-R?sx(x)-12-lw:sx(x)+12;s+=`<text class="k-s k-halo" x="${clx(tx,lw,"start")}" y="${cly(sy(y)-10)}">${t}</text>`}});
    marks.forEach(m0=>{const fn=F[m0.fn||0];if(!fn)return;const m={...m0,x:typeof m0.x==="function"?m0.x(p):m0.x};let y;try{y=m.y!=null?(typeof m.y==="function"?m.y(p):m.y):fn.f(m.x,p)}catch(e){return}if(!isFinite(y)||!isFinite(m.x))return;
      const t=(m.label!=null?m.label.replace("{x}",num(m.x)).replace("{y}",num(y)):`(${num(m.x)}, ${num(y)})`),lw=t.length*8.2,tx=sx(m.x)+12+lw>W-R?sx(m.x)-12-lw:sx(m.x)+12;
      s+=`<line class="k-mark" x1="${sx(m.x)}" y1="${H-B}" x2="${sx(m.x)}" y2="${sy(y)}"/><line class="k-mark" x1="${L}" y1="${sy(y)}" x2="${sx(m.x)}" y2="${sy(y)}"/><circle class="k-pt on" cx="${sx(m.x)}" cy="${sy(y)}" r="7"/>`
        +`<text class="k-t k-halo" x="${clx(tx,lw,"start")}" y="${cly(sy(y)-12)}">${t}</text>`});
    leg.forEach(g=>{const fn=F[g.k],y=H-legH+12+g.y;s+=`<g class="k-leg${show.includes(g.k)?"":" off"}"><line x1="${L+g.x}" y1="${y-4}" x2="${L+g.x+20}" y2="${y-4}" style="stroke:${col(fn,g.k)};stroke-width:3.5;stroke-linecap:round;${fn.dash?"stroke-dasharray:5 4":""}"/><text class="k-s" x="${L+g.x+26}" y="${y}">${fn.label}</text></g>`});
    if(o.readout){const rt=String(o.readout(p,{riemannSum:riemSum,riemannN:riemN}));s+=`<text class="k-t k-halo" x="${W-R}" y="18" text-anchor="end">${rt}</text>`}
    svg.innerHTML=s;justStepped=false;
  }
  Object.entries(o.params||{}).forEach(([k,c])=>{if(c.slider===false)return;setters[k]=ctlRange(S,k,c,v=>{p[k]=v;draw()})});
  responsive(S,layout,pane||svg);
  function apply(s){s=s||{};prevShow=[...show];show=s.show||F.map((_,k)=>k);marks=s.mark||[];justStepped=true;
    ["vlines","hlines","dots","shade","tangents","riemann","vectors"].forEach(k=>ex[k]=s[k]!==undefined?s[k]:(o[k]||[]));
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
  let vals=B.map((b,k)=>first&&k in first?first[k]:(b.v??0)),W0=640,stopT=()=>{},hi=null;
  const max=o.max||Math.max(...B.map(b=>b.v||0),...steps.flatMap(s=>(s.v||[]).filter(v=>v!=null)))*1.1||1;
  const fmt=v=>v==null?"?":(o.fmt?o.fmt(v):num(v))+(o.unit?" "+o.unit:"");
  const cls=i=>`k-b${hi&&!hi.includes(i)?" todo":""}${hi&&hi.includes(i)?" on":""}`;
  function layout(W){W0=W;draw()}
  function draw(){const W=W0;let s="";
    if(W>=520&&n<=8){const H=300,L=16,R=16,T=34,Bt=58,gap=Math.min(36,W*.04),bw=(W-L-R-gap*(n-1))/n,ph=H-T-Bt;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      s+=`<line class="k-axis" x1="${L}" y1="${H-Bt}" x2="${W-R}" y2="${H-Bt}"/>`;
      B.forEach((b,i)=>{const v=vals[i],x=L+i*(bw+gap),lab=fit(b.t,bw,13);
        if(v==null){s+=`<g class="${cls(i)}"><rect class="k-q" x="${x}" y="${H-Bt-ph*.35}" width="${bw}" height="${ph*.35}" rx="8"/><text class="k-t" x="${x+bw/2}" y="${H-Bt-ph*.35/2+6}" text-anchor="middle">?</text>${tlines(x+bw/2,H-Bt+20,lab.slice(0,2),"k-s",15,"middle")}</g>`;return}
        const bh=ph*V.clamp(v/max,0,1),y=H-Bt-bh;
        s+=`<g class="${cls(i)}"><rect class="k-bar" x="${x}" y="${y}" width="${bw}" height="${Math.max(0,bh)}" rx="8" style="fill:${b.color||PAL(i)}"/>`
          +`<text class="k-t" x="${x+bw/2}" y="${y-9}" text-anchor="middle">${fmt(v)}</text>${tlines(x+bw/2,H-Bt+20,lab.slice(0,2),"k-s",15,"middle")}</g>`});
    } else {const L=Math.min(150,W*.38),R=74,rh=40,H=n*rh+16;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
      B.forEach((b,i)=>{const v=vals[i],y=8+i*rh,lab=fit(b.t,L-12,13);
        const bw=v==null?(W-L-R)*.35:(W-L-R)*V.clamp(v/max,0,1);
        s+=`<g class="${cls(i)}">${tlines(L-10,y+(lab.length>1?14:23),lab.slice(0,2),"k-s",14,"end")}`
          +(v==null?`<rect class="k-q" x="${L}" y="${y+5}" width="${bw}" height="${rh-14}" rx="7"/><text class="k-t" x="${L+bw/2}" y="${y+25}" text-anchor="middle">?</text>`
                   :`<rect class="k-bar" x="${L}" y="${y+5}" width="${Math.max(0,bw)}" height="${rh-14}" rx="7" style="fill:${b.color||PAL(i)}"/><text class="k-t" x="${L+bw+8}" y="${y+25}">${fmt(v)}</text>`)+`</g>`});
    }
    svg.innerHTML=s;}
  responsive(S,layout);
  return E.stepper(S.viz,steps,(i)=>{const s=steps[i];hi=s.hi||null;stopT();const from=[...vals],to=s.v||vals;
    const tgt=from.map((v,k)=>k in to?to[k]:v);
    stopT=V.tween(650,t=>{const e=V.ease(t);vals=tgt.map((v,k)=>v==null?null:(from[k]??0)+(v-(from[k]??0))*e);draw()});if(o.on)o.on(i,svg,s);},{ms:o.ms});
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
function getFrames(l){
  let raw;
  if(Array.isArray(l.frames)&&l.frames.length){
    raw=l.frames.map(f=>typeof f==="string"?{m:f}:{...f});
  } else if(/~~/.test(l.m||"")||l.after){
    raw=[{m:l.m,dur:1400}];
    if(/~~/.test(l.m||""))raw.push({strike:true,dur:1550});
    if(l.after)raw.push({m:l.after,dur:1450});
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
    if(!animate||!E.motionOn()||!prevMap.size)return;
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
})();
