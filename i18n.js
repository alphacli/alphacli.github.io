(()=>{const d=document,L=[['en-us','English (US)','en-US'],['en-gb','English (UK)','en-GB'],['ar-eg','العربية (مصر)','ar-EG'],['ar-sa','العربية (السعودية)','ar-SA'],['ar-ae','العربية (الإمارات)','ar-AE'],['nl-nl','Nederlands','nl-NL'],['de-de','Deutsch','de-DE'],['fr-fr','Français','fr-FR'],['es-es','Español','es-ES'],['pt-br','Português (Brasil)','pt-BR'],['tr-tr','Türkçe','tr-TR']];
const seg=location.pathname.split('/').filter(Boolean)[0]||'',cur=L.find(x=>x[0]===seg);
try{if(cur)localStorage.setItem('lang-pref',cur[0])}catch(_){}
const slot=d.querySelector('.nav__cta');
if(slot){const m=d.createElement('details');m.className='m-lang m-lang--icon';m.innerHTML='<summary aria-label="Language"><span aria-hidden="true">🌐</span></summary><ul>'+L.map(x=>`<li><a href="/${x[0]}/" hreflang="${x[2]}" lang="${x[2]}"${cur&&cur[0]===x[0]?' aria-current="true"':''}>${x[1]}</a></li>`).join('')+'</ul>';slot.prepend(m)}
if(cur||(seg&&seg!=='index.html'))return;
const tzMap={'Africa/Cairo':'ar-eg','Asia/Riyadh':'ar-sa','Asia/Dubai':'ar-ae','Asia/Muscat':'ar-ae','Asia/Kuwait':'ar-sa','Asia/Qatar':'ar-sa','Asia/Bahrain':'ar-sa','Europe/Amsterdam':'nl-nl','Europe/Brussels':'nl-nl','Europe/Berlin':'de-de','Europe/Vienna':'de-de','Europe/Zurich':'de-de','Europe/Paris':'fr-fr','Europe/Madrid':'es-es','America/Sao_Paulo':'pt-br','Europe/Istanbul':'tr-tr','Europe/London':'en-gb'};
const by={ar:'ar-eg',nl:'nl-nl',de:'de-de',fr:'fr-fr',es:'es-es',pt:'pt-br',tr:'tr-tr'};
let tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(_){}
const langs=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'en']).map(x=>x.toLowerCase());
let pick=null;
for(const l of langs){const full=L.find(x=>x[2].toLowerCase()===l);if(full){pick=full[0];break}const b=l.split('-')[0];if(b==='ar'){pick=tzMap[tz]&&tzMap[tz].startsWith('ar')?tzMap[tz]:'ar-eg';break}if(by[b]){pick=(tzMap[tz]&&tzMap[tz].startsWith(b)?tzMap[tz]:by[b]);break}if(b==='en'){pick=(l==='en-gb'||tz==='Europe/London')?'en-gb':null;break}}
if(!pick&&tzMap[tz]&&!/^en/.test(langs[0]))pick=tzMap[tz];
try{if(localStorage.getItem('lang-dismiss')||!pick)return;const p=localStorage.getItem('lang-pref');if(p)pick=p}catch(_){}
if(!pick||pick==='en-us')return;
const M={ar:['عرض الموقع بالعربية؟','نعم','لاحقًا'],nl:['Deze pagina in het Nederlands bekijken?','Ja','Later'],de:['Diese Seite auf Deutsch ansehen?','Ja','Später'],fr:['Voir cette page en français ?','Oui','Plus tard'],es:['¿Ver esta página en español?','Sí','Luego'],pt:['Ver esta página em português?','Sim','Depois'],tr:['Bu sayfa Türkçe görüntülensin mi?','Evet','Sonra'],en:['View the UK English version?','Yes','Later']};
const x=L.find(v=>v[0]===pick),k=pick.slice(0,2),m=M[k]||M.en;
setTimeout(()=>{const b=d.createElement('div');b.className='m-langbar';b.setAttribute('role','region');b.setAttribute('aria-label','Language');b.lang=x[2];b.dir=k==='ar'?'rtl':'ltr';
b.innerHTML=`<span>🌐 ${m[0]}</span><a class="btn btn--primary btn--sm" href="/${pick}/" hreflang="${x[2]}">${m[1]} · ${x[1]}</a><button type="button" class="btn btn--ghost btn--sm">${m[2]}</button>`;
b.querySelector('button').onclick=()=>{try{localStorage.setItem('lang-dismiss','1')}catch(_){}b.remove()};d.body.append(b);requestAnimationFrame(()=>b.classList.add('show'))},3500);
})();
