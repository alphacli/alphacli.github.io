/* AlphaCode interactive layer: command palette (Ctrl/Cmd+K or "/"), OS-aware install, demo pause, copy buttons */
(() => {
  'use strict';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const isHome = !!$('#features');
  const isWin = /Win/i.test(navigator.userAgent);
  const INSTALL = isWin
    ? 'iwr -useb https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.ps1 | iex'
    : 'curl -fsSL https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.sh | bash';
  const mod = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent) ? '\u2318' : 'Ctrl';

  const copy = async (t) => {
    try { await navigator.clipboard.writeText(t); return true; }
    catch { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); let ok = false; try { ok = document.execCommand('copy'); } catch {} a.remove(); return ok; }
  };
  const toast = (msg) => {
    let t = $('.ac-toast');
    if (!t) { t = document.createElement('div'); t.className = 'ac-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('is-on'), 2200);
  };

  /* OS-aware install tab: Windows visitors see the PowerShell command first */
  if (isWin && $('#tab-win')) $('#tab-win').click();

  /* Copy buttons on every code block that has none (docs, MCP, guide pages) */
  $$('pre').forEach((pre) => {
    if (pre.closest('.code') || pre.querySelector('.lang-mermaid') || pre.closest('.boot') || pre.closest('.ins')) return;
    pre.classList.add('has-copy');
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pre-copy'; b.textContent = 'Copy'; b.setAttribute('aria-label', 'Copy code block');
    b.addEventListener('click', async () => {
      const ok = await copy(pre.innerText.replace(/\n?Copy$/, ''));
      b.textContent = ok ? 'Copied' : 'Press Ctrl+C'; setTimeout(() => { b.textContent = 'Copy'; }, 1400);
    });
    pre.appendChild(b);
  });

  /* Pause / play control for the animated hero terminal (WCAG 2.2.2) */
  const chrome = $('.boot__chrome');
  if (chrome) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'boot__pause'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Pause demo animation'); b.textContent = 'Pause';
    b.addEventListener('click', () => {
      window.acDemoPaused = !window.acDemoPaused;
      b.setAttribute('aria-pressed', String(window.acDemoPaused));
      b.textContent = window.acDemoPaused ? 'Play' : 'Pause';
      b.setAttribute('aria-label', window.acDemoPaused ? 'Play demo animation' : 'Pause demo animation');
    });
    chrome.insertBefore(b, $('.boot__badge', chrome));
  }

  /* Command palette */
  const go = (hash) => () => { if (isHome) { const el = $(hash); el ? el.scrollIntoView({ behavior: 'smooth' }) : 0; history.replaceState(null, '', hash); } else location.href = '/' + hash; };
  const url = (u, blank) => () => blank ? window.open(u, '_blank', 'noopener') : (location.href = u);
  const items = [
    { g: 'Actions', t: 'Copy install command', h: isWin ? 'Windows PowerShell' : 'macOS / Linux', run: async () => toast((await copy(INSTALL)) ? 'Install command copied' : 'Copy failed') },
    { g: 'Actions', t: 'Join our Discord', h: 'discord.gg/zhXGvgZzf2', run: url('https://discord.gg/zhXGvgZzf2', true) },
    { g: 'Actions', t: 'Star on GitHub', h: 'dragonked2/alphacode', run: url('https://github.com/dragonked2/alphacode', true) },
    { g: 'Actions', t: 'Latest releases', h: 'GitHub', run: url('https://github.com/dragonked2/alphacode/releases', true) },
    { g: 'Pages', t: 'Documentation', h: '/docs/', run: url('/docs/') },
    { g: 'Pages', t: 'MCP servers guide', h: '/mcp/', run: url('/mcp/') },
    { g: 'Pages', t: 'What is an AI coding agent?', h: '/ai-coding-agent/', run: url('/ai-coding-agent/') },
    { g: 'Home', t: 'Features', h: '#features', run: go('#features') },
    { g: 'Home', t: 'Swarm mode', h: '#swarm', run: go('#swarm') },
    { g: 'Home', t: 'Providers', h: '#models', run: go('#models') },
    { g: 'Home', t: 'Install', h: '#install', run: go('#install') },
    { g: 'Home', t: 'Benchmarks', h: '#bench', run: go('#bench') },
    { g: 'Home', t: 'FAQ', h: '#faq', run: go('#faq') },
    { g: 'Home', t: 'Community', h: '#community', run: go('#community') },
  ];
  const ov = document.createElement('div');
  ov.className = 'ac-pal'; ov.hidden = true;
  ov.innerHTML = `<div class="ac-pal__box" role="dialog" aria-modal="true" aria-label="Command palette">
    <input class="ac-pal__in" type="text" role="combobox" aria-expanded="true" aria-controls="acList" aria-autocomplete="list" placeholder="Search pages, sections and actions\u2026" autocomplete="off" spellcheck="false" />
    <ul class="ac-pal__list" id="acList" role="listbox"></ul>
    <div class="ac-pal__foot"><span><kbd>\u2191</kbd><kbd>\u2193</kbd> navigate</span><span><kbd>\u21B5</kbd> open</span><span><kbd>Esc</kbd> close</span></div></div>`;
  document.body.appendChild(ov);
  const inp = $('.ac-pal__in', ov), list = $('#acList', ov);
  let shown = [], idx = 0, last = null;
  const render = () => {
    const q = inp.value.trim().toLowerCase();
    shown = items.filter(i => !q || (i.t + ' ' + i.g + ' ' + i.h).toLowerCase().includes(q));
    idx = Math.min(idx, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length ? shown.map((i, n) => `<li role="option" id="ac-o${n}" data-n="${n}" aria-selected="${n === idx}"><span>${i.t}</span><small>${i.g} \u00B7 ${i.h}</small></li>`).join('') : '<li class="ac-pal__none">No results. Try "docs" or "install".</li>';
    inp.setAttribute('aria-activedescendant', shown.length ? 'ac-o' + idx : '');
    const cur = $('[aria-selected="true"]', list); cur && cur.scrollIntoView({ block: 'nearest' });
  };
  const open = () => { last = document.activeElement; ov.hidden = false; document.documentElement.style.overflow = 'hidden'; inp.value = ''; idx = 0; render(); inp.focus(); };
  const close = () => { ov.hidden = true; document.documentElement.style.overflow = ''; last && last.focus && last.focus({ preventScroll: true }); };
  const pick = (n) => { const i = shown[n]; if (!i) return; close(); setTimeout(i.run, 20); };
  inp.addEventListener('input', () => { idx = 0; render(); });
  list.addEventListener('click', (e) => { const li = e.target.closest('li[data-n]'); li && pick(+li.dataset.n); });
  list.addEventListener('mousemove', (e) => { const li = e.target.closest('li[data-n]'); if (li && +li.dataset.n !== idx) { idx = +li.dataset.n; render(); } });
  ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || '')) || e.target.isContentEditable;
    if ((e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && ov.hidden)) { e.preventDefault(); ov.hidden ? open() : close(); return; }
    if (ov.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); idx = (idx + 1) % Math.max(1, shown.length); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); idx = (idx - 1 + shown.length) % Math.max(1, shown.length); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(idx); }
    else if (e.key === 'Tab') { e.preventDefault(); inp.focus(); }
  });

  /* nav trigger button */
  const cta = $('.nav__cta');
  if (cta) {
    const k = document.createElement('button');
    k.type = 'button'; k.className = 'nav__k'; k.setAttribute('aria-label', 'Open command palette');
    k.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.500-3.500"/></svg><kbd>${mod}K</kbd>`;
    k.addEventListener('click', open);
    cta.insertBefore(k, cta.firstChild);
  }
})();
