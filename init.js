/* Clickjacking fallback for hosts that cannot send X-Frame-Options / frame-ancestors (e.g. GitHub Pages). */
(function(){try{if(window.top!==window.self){window.top.location.replace(window.self.location.href)}}catch(e){document.documentElement.hidden=true}})();
(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})();
