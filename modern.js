(()=>{const d=document,$=(s,r=d)=>[...r.querySelectorAll(s)];
if(!CSS.supports('animation-timeline','scroll()')){const p=d.createElement('div');p.className='m-progress';d.body.prepend(p);
 addEventListener('scroll',()=>{const h=d.documentElement;p.style.transform=`scaleX(${scrollY/Math.max(1,h.scrollHeight-innerHeight)})`},{passive:true})}
else{const p=d.createElement('div');p.className='m-progress';d.body.prepend(p)}
const b=d.createElement('button');b.className='m-top-btn';b.type='button';b.setAttribute('aria-label','Back to top');b.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
b.onclick=()=>scrollTo({top:0});d.body.append(b);
const nav=$('.nav')[0];addEventListener('scroll',()=>{b.classList.toggle('show',scrollY>700);nav&&nav.classList.toggle('is-scrolled',scrollY>8)},{passive:true});
if(matchMedia('(hover:hover)').matches)d.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.feat,.free__item,.m-card');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')},{passive:true});
const io='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12}):null;
$('.m-reveal').forEach(el=>io?io.observe(el):el.classList.add('in'));
$('.m-badge [data-copy]').forEach(el=>{if(el.dataset.mBound)return;el.dataset.mBound=1;el.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(el.dataset.copy);const t=el.textContent;el.textContent='Copied';setTimeout(()=>el.textContent=t,1500)}catch(_){}})},{once:true});
})();
