/* ui.js — count-up stats, stagger indices, external-link safety, offline hint. CSP-safe, no inline code. */
(()=>{'use strict';const d=document,$=(s,r=d)=>[...r.querySelectorAll(s)],rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
// stagger index for grids
$('.features__grid,.free__grid,.m-grid,.stats').forEach(g=>{g.setAttribute('data-stagger','');[...g.children].forEach((c,i)=>c.style.setProperty('--i',i))});
// count-up for numeric stats (e.g. "40+", "54", "11")
if(!rm&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const el=e.target,m=el.textContent.trim().match(/^(\d+)(\D*)$/);if(!m)return;const to=+m[1],suf=m[2],t0=performance.now(),dur=900;
const tick=t=>{const p=Math.min(1,(t-t0)/dur),v=Math.round(to*(1-Math.pow(1-p,3)));el.textContent=v+suf;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}),{threshold:.6});$('.stat__num').forEach(n=>/^\d+\D*$/.test(n.textContent.trim())&&io.observe(n))}
// every external link opens safely
$('a[href^="http"]').forEach(a=>{try{if(new URL(a.href).origin!==location.origin){const r=new Set((a.rel||'').split(/\s+/).filter(Boolean));r.add('noopener');if(a.target==='_blank')r.add('noreferrer');a.rel=[...r].join(' ')}}catch(_){}});
// copy buttons: brief busy/ok state + polite announcement
const live=d.createElement('div');live.className='sr-live';live.setAttribute('aria-live','polite');d.body.append(live);
d.addEventListener('click',e=>{const b=e.target.closest('[data-copy],.ins__copy,.copy');if(!b)return;b.classList.add('is-busy');live.textContent='Copied to clipboard';setTimeout(()=>{b.classList.remove('is-busy');live.textContent=''},1200)},{passive:true});
// offline hint
addEventListener('offline',()=>{live.textContent='You are offline. Some features are unavailable.'});addEventListener('online',()=>{live.textContent=''});
})();
