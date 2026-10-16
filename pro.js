(()=>{const d=document,r=d.documentElement,$=(s,x=d)=>[...x.querySelectorAll(s)];
try{const t=localStorage.getItem('theme');if(t)r.dataset.theme=t}catch(_){}
const cur=()=>r.dataset.theme||'dark',ico=()=>cur()==='dark'?'☾':'☀';
const tb=d.createElement('button');tb.className='m-theme';tb.type='button';tb.setAttribute('aria-label','Toggle light or dark theme');tb.textContent=ico();
tb.onclick=()=>{const n=cur()==='dark'?'light':'dark';r.dataset.theme=n;tb.textContent=ico();try{localStorage.setItem('theme',n)}catch(_){}};
const slot=$('.nav__cta')[0]||$('.m-head__in')[0];if(slot)slot.prepend(tb);
// install tabs + copy
const tabs=$('.ins__tab');if(tabs.length){const cp=$('.ins__copy')[0],ti=$('#insTitle')[0];
 const sel=t=>{tabs.forEach(x=>x.setAttribute('aria-selected',x===t));$('.ins__panel').forEach(p=>p.hidden=p.dataset.p!==t.dataset.p);ti.textContent=t.dataset.title};
 tabs.forEach((t,i)=>{t.onclick=()=>sel(t);t.onkeydown=e=>{const n=tabs[(i+(e.key==='ArrowRight')-(e.key==='ArrowLeft')+tabs.length)%tabs.length];if(/Arrow(Left|Right)/.test(e.key)){n.focus();sel(n)}}});
 const os=/Win/.test(navigator.platform)?'win':'mac';sel(tabs.find(t=>t.dataset.p===os)||tabs[0]);
 cp.onclick=async()=>{const p=$('.ins__panel:not([hidden])')[0];try{await navigator.clipboard.writeText(p.dataset.cmd)}catch(_){const a=d.createElement('textarea');a.value=p.dataset.cmd;d.body.append(a);a.select();d.execCommand('copy');a.remove()}
  cp.classList.add('ok');cp.textContent=cp.dataset.done||'✓ Copied';setTimeout(()=>{cp.classList.remove('ok');cp.textContent=cp.dataset.label||'Copy command'},1800)}}
// terminal tilt
const b=$('.boot')[0];if(b&&matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches){const h=b.parentElement;
 h.addEventListener('pointermove',e=>{const q=b.getBoundingClientRect();b.style.setProperty('--ry',((e.clientX-q.left)/q.width-.5)*6+'deg');b.style.setProperty('--rx',(.5-(e.clientY-q.top)/q.height)*5+'deg')});
 h.addEventListener('pointerleave',()=>{b.style.setProperty('--rx','0deg');b.style.setProperty('--ry','0deg')})}
// count-up
$('.stat__num').forEach(el=>{const m=el.textContent.trim().match(/^(\d+)(\+?)$/);if(!m||!('IntersectionObserver'in window))return;const n=+m[1];
 new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/1200);el.textContent=Math.round(n*(1-Math.pow(1-k,3)))+m[2];if(k<1)requestAnimationFrame(f)})(t0)}}).observe(el)});
})();
(()=>{const i=document.getElementById('install');if(!i||!document.querySelector('.hero'))return;const d=document.createElement('div');d.className='m-dock';
d.innerHTML='<a class="btn btn--primary" href="#install">Install free</a><a class="btn btn--ghost" href="https://github.com/dragonked2/alphacode" target="_blank" rel="noopener noreferrer">★ GitHub</a>';document.body.append(d);
let past=false,inst=false;const up=()=>d.classList.toggle('show',past&&!inst);
addEventListener('scroll',()=>{past=scrollY>600;up()},{passive:true});
if('IntersectionObserver'in window)new IntersectionObserver(e=>{inst=e[0].isIntersecting;up()}).observe(i)})();
