/* ux.js - final UX layer. CSP-safe (no inline code). Safe to run on every page. */
(()=>{'use strict';
const d=document,$=(s,r=d)=>r.querySelector(s),$$=(s,r=d)=>Array.from(r.querySelectorAll(s));

/* toast */
let tEl,tT;
function toast(msg){
  if(!tEl){tEl=d.createElement('div');tEl.className='ux-toast';tEl.setAttribute('role','status');tEl.setAttribute('aria-live','polite');d.body.appendChild(tEl)}
  tEl.textContent=msg;requestAnimationFrame(()=>tEl.classList.add('is-on'));clearTimeout(tT);tT=setTimeout(()=>tEl.classList.remove('is-on'),1800);
}
async function copy(t){
  try{await navigator.clipboard.writeText(t);return true}catch(e){
    const a=d.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';d.body.appendChild(a);a.select();let ok=false;try{ok=d.execCommand('copy')}catch(_){}a.remove();return ok}
}

/* expose real nav height so sticky bars sit exactly under it */
const nav=$('.nav');
const setNav=()=>{if(nav)d.documentElement.style.setProperty('--ux-nav-h',nav.offsetHeight+'px')};
setNav();addEventListener('resize',setNav,{passive:true});

/* language menu: close on outside click / Esc / choosing */
d.addEventListener('click',e=>{$$('details.m-lang[open]').forEach(x=>{if(!x.contains(e.target))x.removeAttribute('open')})});
d.addEventListener('keydown',e=>{if(e.key==='Escape')$$('details.m-lang[open]').forEach(x=>{x.removeAttribute('open');const s=$('summary',x);s&&s.focus()})});

/* docs: collapsible TOC (phones/tablets) with live "current section" label */
const sb=$('.docs__sidebar'),toc=sb&&$('.toc',sb);
if(sb&&toc){
  const inner=$('.docs__sidebar-inner',sb)||sb;
  toc.id=toc.id||'tocPanel';
  const btn=d.createElement('button');btn.type='button';btn.className='toc-toggle';btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls',toc.id);
  btn.innerHTML='<span class="toc-toggle__k">On this page</span><span class="toc-toggle__cur"></span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  inner.insertBefore(btn,inner.firstChild);
  const cur=$('.toc-toggle__cur',btn);
  const label=()=>{const a=$('.toc__item.is-active',toc)||$('.toc__item',toc);cur.textContent=a?a.textContent.replace(/\s+/g,' ').trim():''};
  const setOpen=o=>{sb.classList.toggle('is-open',o);btn.setAttribute('aria-expanded',String(o))};
  btn.addEventListener('click',()=>setOpen(!sb.classList.contains('is-open')));
  toc.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false)});
  d.addEventListener('click',e=>{if(sb.classList.contains('is-open')&&!sb.contains(e.target))setOpen(false)});
  d.addEventListener('keydown',e=>{if(e.key==='Escape'&&sb.classList.contains('is-open')){setOpen(false);btn.focus()}});
  new MutationObserver(label).observe(toc,{subtree:true,attributes:true,attributeFilter:['class']});
  label();
  /* keep the active TOC entry visible inside its own scroll area */
  new MutationObserver(()=>{const a=$('.toc__item.is-active',toc);if(a&&toc.scrollHeight>toc.clientHeight){const r=a.getBoundingClientRect(),t=toc.getBoundingClientRect();if(r.top<t.top||r.bottom>t.bottom)a.scrollIntoView({block:'nearest'})}}).observe(toc,{subtree:true,attributes:true,attributeFilter:['class']});
}

/* docs: reliable scroll-spy (position based; stays correct after anchor jumps) */
if(sb&&toc){
  const links=$$('.toc__item',toc),map=links.map(a=>[a,d.getElementById(decodeURIComponent((a.getAttribute('href')||'').slice(1)))]).filter(x=>x[1]);
  let raf=0,last=null;
  const spy=()=>{raf=0;const off=(nav?nav.offsetHeight:64)+(matchMedia('(max-width:960px)').matches?72:24);let cur=map[0];
    for(const m of map){if(m[1].getBoundingClientRect().top<=off)cur=m;else break}
    if(cur&&cur[0]!==last){last=cur[0];links.forEach(a=>a.classList.toggle('is-active',a===cur[0]))}};
  const req=()=>{if(!raf)raf=requestAnimationFrame(spy)};
  addEventListener('scroll',req,{passive:true});addEventListener('hashchange',()=>setTimeout(spy,60));addEventListener('resize',req,{passive:true});spy();
}

/* docs: copyable heading anchors */
$$('.docs__body :is(h1,h2,h3,h4)[id]').forEach(h=>{
  if($('.h-anchor',h))return;
  const a=d.createElement('a');a.className='h-anchor';a.href='#'+h.id;a.textContent='#';a.setAttribute('aria-label','Copy link to this section');
  a.addEventListener('click',async e=>{e.preventDefault();history.replaceState(null,'','#'+h.id);h.scrollIntoView({behavior:'smooth',block:'start'});toast((await copy(location.href))?'Link copied':'Link ready in address bar')});
  h.appendChild(a);
});
})();
