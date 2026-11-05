/* refine.js: header state + pointer spotlight on cards (responds to user input only) */
(function(){
  var nav=document.querySelector('.nav');
  if(nav){var f=function(){nav.classList.toggle('is-scrolled',window.scrollY>8)};f();addEventListener('scroll',f,{passive:true})}
  if(!matchMedia('(hover:hover)').matches)return;
  document.addEventListener('pointermove',function(e){
    var c=e.target.closest&&e.target.closest('.feat,.model,.free__item,.bench__card');if(!c)return;
    var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');
  },{passive:true});
})();
