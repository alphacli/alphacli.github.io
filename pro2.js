(()=>{const d=document,$=(s,x=d)=>[...x.querySelectorAll(s)],fine=matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches;
// hero cursor glow
const h=$('.hero')[0];if(h&&fine)h.addEventListener('pointermove',e=>{const r=h.getBoundingClientRect();h.style.setProperty('--gx',e.clientX-r.left+'px');h.style.setProperty('--gy',e.clientY-r.top+'px')},{passive:true});
// magnetic buttons
if(fine)$('.btn--lg,.btn--primary').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.2-2}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});
// provider marquee
const st=$('.stats')[0];if(st){const names=['Claude','GPT','Gemini','DeepSeek','Mistral','xAI','Groq','Ollama','LM Studio','OpenRouter','Bedrock','Copilot','Any OpenAI-compatible API','MCP servers','Firefox automation','Swarm mode','Resumable sessions'];
 const m=d.createElement('div');m.className='m-marq';m.setAttribute('aria-hidden','true');const t=d.createElement('div');t.className='m-marq__t';t.innerHTML=[...names,...names].map(n=>`<span>${n}</span>`).join('');m.append(t);st.after(m)}
// smart hint: keyboard shortcuts
if(fine&&$('.hero')[0]){const k=d.createElement('div');k.className='m-kbd';k.textContent='Tip: press / to search · G then D for docs';d.body.append(k);
 setTimeout(()=>k.classList.add('show'),4000);setTimeout(()=>k.classList.remove('show'),11000);let g=0;
 d.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)||e.metaKey||e.ctrlKey)return;
  if(e.key==='/'){const s=$('#providerSearch')[0]||$('.nav__search,[data-search]')[0];if(s){e.preventDefault();s.scrollIntoView({block:'center'});s.focus&&s.focus()}}
  if(e.key==='g'){g=Date.now();return}
  if(Date.now()-g<900){const go={d:'/docs/',m:'/mcp/',a:'/about/',i:'#install',h:'/'}[e.key];if(go)location.href=go}})}
})();
