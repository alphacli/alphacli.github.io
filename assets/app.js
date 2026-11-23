/* AlphaCode STUDIO — progressive enhancement, no runtime dependencies */
(() => {
 'use strict';
 const root = document.documentElement;
 const qs = (selector, scope = document) => scope.querySelector(selector);
 const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Tiny, passive reading-position indicator; never runs animations in a timer.
 let pendingProgress = false;
 const updateProgress = () => {
   pendingProgress = false;
   const max = document.documentElement.scrollHeight - window.innerHeight;
   root.style.setProperty('--scroll-progress', max > 0 ? (window.scrollY / max * 100).toFixed(2) + '%' : '0%');
 };
 window.addEventListener('scroll', () => {
   if (!pendingProgress) { pendingProgress = true; requestAnimationFrame(updateProgress); }
 }, { passive: true });
 updateProgress();

 // Mobile navigation; never traps the user in a hidden overlay.
 const menuButton = qs('[data-menu-toggle]');
 const navigation = qs('#site-navigation');
 if (menuButton && navigation) {
   const toggleMenu = (open) => {
     navigation.classList.toggle('is-open', open);
     menuButton.setAttribute('aria-expanded', String(open));
     menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
     menuButton.textContent = open ? '✕' : '☰';
   };
   menuButton.addEventListener('click', () => toggleMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
   navigation.addEventListener('click', (e) => { if (e.target.closest('a')) toggleMenu(false); });
   document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });
   window.matchMedia('(min-width: 1021px)').addEventListener('change', (e) => { if (e.matches) toggleMenu(false); });
 }

 const themeToggle = qs('[data-theme-toggle]');
 if (themeToggle) {
   let theme = 'dark';
   try { theme = localStorage.getItem('alphacode-theme') === 'light' ? 'light' : 'dark'; } catch (_) {}
   root.dataset.theme = theme;
   const showTheme = () => {themeToggle.textContent = root.dataset.theme === 'light' ? '☾' : '☼'; themeToggle.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');};
   showTheme();
   themeToggle.addEventListener('click', () => {root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';try{localStorage.setItem('alphacode-theme', root.dataset.theme);}catch(_){}showTheme();});
 }

 // ARIA tabs share the same utility but remain scoped to each widget.
 const activateTabs = (container, controlSelector, panelSelector, target) => {
   const controls = qsa(controlSelector, container);
   const panels = qsa(panelSelector, container);
   controls.forEach((btn) => {
     const active = (btn.dataset.osTab || btn.dataset.storyTab) === target;
     btn.setAttribute('aria-selected', String(active));
     btn.tabIndex = active ? 0 : -1;
     btn.classList.toggle('active', active);
   });
   panels.forEach((panel) => {panel.hidden = (panel.dataset.osPanel || panel.dataset.storyPanel) !== target;});
 };
 const wireTablist = (container, controlSelector, panelSelector, dataKey) => {
   const tabs = qsa(controlSelector, container);
   if (!tabs.length) return;
   const set = (choice) => activateTabs(container, controlSelector, panelSelector, choice);
   tabs.forEach((tab, index) => {
     tab.addEventListener('click', () => set(tab.dataset[dataKey]));
     tab.addEventListener('keydown', (e) => {
       if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
       e.preventDefault();
       const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
       tabs[next].focus();
       set(tabs[next].dataset[dataKey]);
     });
   });
   return set;
 };

 const demo = qs('[data-demo]');
 if (demo) wireTablist(demo, '[data-story-tab]', '[data-story-panel]', 'storyTab');

 const widgets = qsa('[data-install-widget]');
 const setPlatform = (widget) => wireTablist(widget, '[data-os-tab]', '[data-os-panel]', 'osTab');
 const selectPlatforms = widgets.map(setPlatform);
 // No geolocation; local OS hint is only a convenience, manual selection always works.
 const inferredWindows = /Win/i.test(navigator.userAgent || '');
 if (inferredWindows) selectPlatforms.forEach((set) => {if (typeof set === 'function') set('windows');});

 const announce = (message) => {const live=qs('#global-live-status');if(live)live.textContent=message;};
 const copyText = async (value) => {
   if (navigator.clipboard && window.isSecureContext) {
     await navigator.clipboard.writeText(value); return;
   }
   const t = document.createElement('textarea');
   t.value = value; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;left:-10000px;top:0;';
   document.body.appendChild(t);t.select();
   try {if (!document.execCommand('copy')) throw new Error('Copy blocked');}finally{t.remove();}
 };
 document.addEventListener('click', async (event) => {
   const b = event.target.closest('[data-copy-command]');
   if (!b) return;
   const original = b.textContent;
   const value = b.getAttribute('data-copy-command');
   try {await copyText(value);b.textContent='✓ Copied';announce('Command copied to clipboard');}
   catch (_) {b.textContent='Copy unavailable';announce('Copy failed. Select the displayed command manually.');}
   window.setTimeout(() => {if (b.isConnected) b.textContent = original;}, 1600);
 });


 // Memory archive. Pre-rendered bars remain readable without scripting.
 for (const widget of qsa('[data-benchmark-widget]')) {
   const tabs = qsa('[data-bench-tab]', widget);
   const panels = qsa('[data-bench-panel]', widget);
   const activate = (value) => {
     tabs.forEach(tab => {
       const chosen = tab.dataset.benchTab === value;
       tab.setAttribute('aria-selected', String(chosen));
       tab.classList.toggle('active', chosen);
       tab.tabIndex = chosen ? 0 : -1;
     });
     panels.forEach(panel => {panel.hidden = panel.dataset.benchPanel !== value;});
     const summary = qs('[data-bench-scenario]', widget);
     if (summary) summary.textContent = value === '1' ? '01 ACTIVE SESSION' : '10 ACTIVE SESSIONS';
   };
   tabs.forEach((tab, i) => {
     tab.addEventListener('click', () => activate(tab.dataset.benchTab));
     tab.addEventListener('keydown', (event) => {
       if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
       event.preventDefault();
       const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
       tabs[next].focus(); activate(tabs[next].dataset.benchTab);
     });
   });
 }

 // Gentle entrance transitions, never hide content without script support.
 if (!reduced && 'IntersectionObserver' in window) {
   const targets = qsa('.section-heading,.workflow-card,.feature-card,.quick-install,.demo-layout,.faq-layout,.end-cta-inner');
   const obs = new IntersectionObserver(entries => {
     entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('is-visible');obs.unobserve(entry.target);}});
   }, {rootMargin:'0px 0px 25px 0px',threshold:0.02});
   targets.forEach(node=>{node.dataset.reveal='';obs.observe(node);});
   root.classList.add('has-motion');
 }
})();
