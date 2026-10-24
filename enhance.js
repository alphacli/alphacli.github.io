/* Hero quick-install: OS-aware command + one-click copy (no inline handlers: CSP-safe) */
(function(){'use strict';
var bar=document.querySelector('.hero__install');if(!bar)return;
var u=bar.querySelector('[data-os=unix]'),w=bar.querySelector('[data-os=win]'),btn=bar.querySelector('.hero__copy');
if(!u||!btn)return;
var win=/Windows/i.test(navigator.userAgent)&&!/Phone/i.test(navigator.userAgent);
if(win&&w){w.hidden=false;u.hidden=true}
var live=btn.querySelector('.sr-only');
function cmd(){return ((win&&w)?w:u).textContent.replace(/^\s*(\$|PS>)\s*/,'').trim()}
function done(){btn.classList.add('is-done');if(live)live.textContent='Copied';setTimeout(function(){btn.classList.remove('is-done');if(live)live.textContent=''},1800)}
function fallback(t){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{if(document.execCommand('copy'))done()}catch(e){}document.body.removeChild(ta)}
btn.addEventListener('click',function(){var t=cmd();if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){fallback(t)})}else{fallback(t)}});
})();
