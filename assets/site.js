/* ============================================================
   AlphaCode — site script v7 "phosphor"
   ============================================================ */

(() => {
  'use strict';

  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     Scroll progress bar + sticky nav elevation + back-to-top
     ------------------------------------------------------------ */
  (() => {
    let progress = $('.progress');
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.prepend(progress);
    }
    let totop = $('.totop');
    if (!totop) {
      totop = document.createElement('button');
      totop.className = 'totop';
      totop.type = 'button';
      totop.setAttribute('aria-label', 'Back to top');
      totop.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
      document.body.appendChild(totop);
      totop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    }
    const navEl2 = $('.nav');
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop;
        const max = doc.scrollHeight - doc.clientHeight;
        const pct = max > 0 ? (scrollTop / max) * 100 : 0;
        progress.style.width = pct + '%';
        navEl2 && navEl2.classList.toggle('is-scrolled', scrollTop > 8);
        totop.classList.toggle('is-visible', scrollTop > 480);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ------------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------------ */
  const navEl = $('.nav');
  const navToggle = $('.nav__toggle');
  const navLinksEl = $('.nav__links');
  if (navEl && navToggle && navLinksEl) {
    const closeNav = () => {
      navEl.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    const openNav = () => {
      navEl.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
    };
    navToggle.addEventListener('click', () => {
      navEl.classList.contains('is-open') ? closeNav() : openNav();
    });
    navLinksEl.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navEl.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 880) closeNav();
    });
  }

  /* ------------------------------------------------------------
     Scroll-spy: highlight the nav link for the section in view
     ------------------------------------------------------------ */
  (() => {
    const navLinkEls = $$('.nav__links a[href^="#"]');
    if (!navLinkEls.length || !('IntersectionObserver' in window)) return;
    const sections = navLinkEls
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);
    if (!sections.length) return;
    const byId = new Map(navLinkEls.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const link = byId.get(e.target.id);
        if (!link) return;
        if (e.isIntersecting) {
          navLinkEls.forEach(a => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'page');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  })();

  /* ------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------ */
  const revealEls = $$('.feat, .stat, .model, .install__card, .bench__card, .swarm__board, .faq__item, .section__head, .free__item');
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    if (!el.hasAttribute('data-d')) el.setAttribute('data-d', String((i % 3) + 1));
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ------------------------------------------------------------
     Install tabs + copy
     ------------------------------------------------------------ */
  const tabs   = $$('.install__tab');
  const panels = $$('.install__panel');
  const indicator = $('#installIndicator');

  function moveIndicator(tab) {
    if (!tab || !indicator) return;
    const r = tab.getBoundingClientRect();
    const parentR = tab.parentElement.getBoundingClientRect();
    indicator.style.left = (r.left - parentR.left) + 'px';
    indicator.style.width = r.width + 'px';
  }

  function selectTab(target) {
    tabs.forEach(t => {
      const active = t.dataset.platform === target;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panels.forEach(p => {
      p.hidden = p.dataset.platform !== target;
    });
    const t = tabs.find(t => t.dataset.platform === target);
    if (t) moveIndicator(t);
  }

  tabs.forEach(t => {
    t.addEventListener('click', () => selectTab(t.dataset.platform));
    t.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(t);
      if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(i + 1) % tabs.length].focus(); tabs[(i + 1) % tabs.length].click(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); tabs[(i - 1 + tabs.length) % tabs.length].focus(); tabs[(i - 1 + tabs.length) % tabs.length].click(); }
    });
  });
  requestAnimationFrame(() => moveIndicator($('.install__tab.is-active')));
  window.addEventListener('resize', () => {
    const t = $('.install__tab.is-active');
    if (t) moveIndicator(t);
  });

  let copyAnnouncer = $('#copyAnnouncer');
  if (!copyAnnouncer) {
    copyAnnouncer = document.createElement('div');
    copyAnnouncer.id = 'copyAnnouncer';
    copyAnnouncer.setAttribute('role', 'status');
    copyAnnouncer.setAttribute('aria-live', 'polite');
    copyAnnouncer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;';
    document.body.appendChild(copyAnnouncer);
  }

  $$('.code__copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch {}
        ta.remove();
      }
      btn.classList.add('is-copied');
      const orig = btn.textContent;
      const origLabel = btn.getAttribute('aria-label') || 'Copy install command';
      btn.textContent = 'copied';
      btn.setAttribute('aria-label', 'Copied to clipboard');
      copyAnnouncer.textContent = 'Command copied to clipboard';
      setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.textContent = orig;
        btn.setAttribute('aria-label', origLabel);
      }, 1400);
    });
  });

  /* Non-critical work (demo, swarm, bench, GitHub stats) runs when the browser is idle → better INP/TBT */
  const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 300));
  idle(() => {
    /* ------------------------------------------------------------
       Animated hero boot sequence — install → first task, on the
       free lane, with no API key. This IS the free-AI pitch, so
       the very first lines make that explicit rather than assuming
       the visitor will infer it from a generic demo.
       ------------------------------------------------------------ */
    const demoBody  = $('#demoBody');
    const demoBar   = $('#demoBar');
    const demoBarW  = $('#demoBarWrap');
    const demoStatus= $('#demoStatus');
    const demoTime  = $('#demoTime');
    const demoTools = $('#demoTools');
    const demoModel = $('#demoModel');
    const demoFootDot = $('.demo__foot-dot');

    if (demoBody) {
      const steps = [
        { p: 'alphacode', m: 'free lane', text: '<span class="l-dim">›</span> <span class="l-info">launching — no API key found, no key needed</span>' },
        { p: 'provider',  m: 'free lane', text: '<span class="l-free">✓ free model provider ready</span> <span class="l-dim">$0 · 0 setup steps</span>' },
        { p: 'you',       m: 'free lane', text: '<span class="l-info">"scan repo, plan migration to OAuth 2.1"</span>' },
        { p: 'plan',      m: 'free lane', text: '<span class="l-warn">[planner]</span> <span class="l-info">decomposing goal…</span> <span class="l-dim">3 agents</span>' },
        { p: 'agent-1',   m: 'free lane', text: '<span class="l-warn">[auth/routes.ts]</span> <span class="l-info">refactor login → authorization code</span>' },
        { p: 'agent-2',   m: 'free lane', text: '<span class="l-warn">[auth/tokens.ts]</span> <span class="l-info">add PKCE, refresh-rotation</span>' },
        { p: 'tests',     m: 'free lane', text: '<span class="l-info">running</span> <span class="l-dim">cargo test --workspace</span> <span class="l-ok">✓ 142/142</span>' },
        { p: 'done',      m: 'free lane', text: '<span class="l-ok l-bold">✓ ready to commit</span> <span class="l-dim">2 files · 142 tests · $0 spent</span>' },
      ];

      const sleep = (ms) => new Promise(r => setTimeout(r, ms));

      function setStatus(s) { demoStatus.textContent = s; }
      function setTime(t)   { demoTime.textContent = t.toFixed(1) + 's'; }
      function setTools(n)  { demoTools.textContent = String(n); }
      function setModel(m)  { demoModel.textContent = m; }

      async function run() {
        demoBody.innerHTML = '';
        setStatus('running');
        demoBar.style.width = '0%';
        demoBarW && demoBarW.setAttribute('aria-valuenow', '0');
        demoFootDot && demoFootDot.classList.remove('is-done');
        setTools(0); setTime(0);

        const start = performance.now();
        const tick = setInterval(() => {
          setTime((performance.now() - start) / 1000);
        }, 50);

        for (let i = 0; i < steps.length; i++) {
          const s = steps[i];
          setModel(s.m);
          const line = document.createElement('div');
          line.innerHTML = `<span class="l-prompt">$</span> <span class="l-bold">${s.p}</span>  ${s.text}<span class="l-caret"></span>`;
          demoBody.appendChild(line);
          setTools(i + 1);
          const pct = ((i + 1) / steps.length) * 100;
          demoBar.style.width = pct + '%';
          demoBarW && demoBarW.setAttribute('aria-valuenow', String(Math.round(pct)));
          await sleep(850 + Math.random() * 450);
          while (window.acDemoPaused) await sleep(200);
          line.querySelector('.l-caret')?.remove();
        }

        clearInterval(tick);
        setStatus('done');
        demoFootDot && demoFootDot.classList.add('is-done');
      }

      function renderStatic() {
        demoBody.innerHTML = '';
        steps.forEach(s => {
          const line = document.createElement('div');
          line.innerHTML = `<span class="l-prompt">$</span> <span class="l-bold">${s.p}</span>  ${s.text}`;
          demoBody.appendChild(line);
        });
        setModel('free lane');
        setTools(steps.length);
        demoBar.style.width = '100%';
        demoBarW && demoBarW.setAttribute('aria-valuenow', '100');
        setStatus('done');
        setTime(5.8);
        demoFootDot && demoFootDot.classList.add('is-done');
      }

      let cancelled = false;
      function loop() {
        run().then(() => sleep(6000)).then(() => {
          if (!cancelled) loop();
        });
      }

      if (reducedMotion) {
        renderStatic();
      } else {
        loop();
      }
    }

    /* ------------------------------------------------------------
       Swarm DAG animation
       ------------------------------------------------------------ */
    const dagNodes = $('#dag-nodes');
    const dagEdges = $('#dag-edges');
    const dagPkts  = $('#dag-pkts');

    if (dagNodes && dagEdges) {
      const nodes = [
        { id: 'root',   x:  40, y: 130, w: 110, h: 50, label: 'Goal',         sub: 'migrate → OAuth 2.1', kind: 'root' },
        { id: 'plan',   x: 180, y: 130, w: 110, h: 50, label: 'Planner',      sub: 'free lane',           kind: 'plan' },
        { id: 'a1',     x: 340, y:  40, w: 100, h: 46, label: 'Agent · A',    sub: 'free lane',           kind: 'agent' },
        { id: 'a2',     x: 340, y: 130, w: 100, h: 46, label: 'Agent · B',    sub: 'free lane',           kind: 'agent' },
        { id: 'a3',     x: 340, y: 220, w: 100, h: 46, label: 'Agent · C',    sub: 'free lane',           kind: 'agent' },
        { id: 'merge',  x: 480, y: 130, w:  90, h: 50, label: 'Reviewer',     sub: 'free lane',           kind: 'merged' },
      ];
      const edges = [
        ['root',  'plan'],
        ['plan',  'a1'],
        ['plan',  'a2'],
        ['plan',  'a3'],
        ['a1',    'merge'],
        ['a2',    'merge'],
        ['a3',    'merge'],
      ];

      const NS = 'http://www.w3.org/2000/svg';
      const center = (n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });
      const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

      edges.forEach(([from, to]) => {
        const a = center(nodeById[from]);
        const b = center(nodeById[to]);
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', `M${a.x} ${a.y} C ${a.x+40} ${a.y}, ${b.x-40} ${b.y}, ${b.x} ${b.y}`);
        path.setAttribute('marker-end', 'url(#arr)');
        dagEdges.appendChild(path);
      });

      nodes.forEach(n => {
        const g = document.createElementNS(NS, 'g');
        g.classList.add('dag__node', `dag__node--${n.kind}`);
        g.dataset.id = n.id;
        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', n.x); rect.setAttribute('y', n.y);
        rect.setAttribute('width', n.w); rect.setAttribute('height', n.h);
        rect.setAttribute('rx', '2');
        g.appendChild(rect);
        const t1 = document.createElementNS(NS, 'text');
        t1.setAttribute('x', n.x + n.w / 2);
        t1.setAttribute('y', n.y + 22);
        t1.setAttribute('text-anchor', 'middle');
        t1.textContent = n.label;
        g.appendChild(t1);
        const t2 = document.createElementNS(NS, 'text');
        t2.setAttribute('x', n.x + n.w / 2);
        t2.setAttribute('y', n.y + 38);
        t2.setAttribute('text-anchor', 'middle');
        t2.classList.add('dag__sub');
        t2.textContent = n.sub;
        g.appendChild(t2);
        dagNodes.appendChild(g);
      });

      const overlay  = $('#swarmOverlay');
      const runBtn   = $('#swarmRun');
      const reduced  = matchMedia('(prefers-reduced-motion: reduce)').matches;

      async function swarmRun() {
        overlay?.classList.add('is-hidden');
        const order = [
          ['root'], ['plan'],
          ['a1','a2','a3'],
          ['a1','a2','a3'],
          ['merge'],
        ];
        $$('#dag-nodes g').forEach(g => g.classList.remove('dag__node--active', 'dag__node--merged'));
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        for (const phase of order) {
          $$('#dag-nodes g').forEach(g => g.classList.remove('dag__node--active'));
          phase.forEach(id => {
            const g = $(`#dag-nodes g[data-id="${id}"]`);
            if (g) g.classList.add('dag__node--active');
          });
          const targets = phase.filter(id => id !== 'merge' && id !== 'plan' && id !== 'root');
          targets.forEach(id => {
            const from = nodeById[id], to = nodeById['merge'];
            if (!from || !to) return;
            const c = document.createElementNS(NS, 'circle');
            c.setAttribute('r', '3');
            c.classList.add('pkt');
            dagPkts.appendChild(c);
            const startX = from.x + from.w;
            const startY = from.y + from.h / 2;
            const endX   = to.x;
            const endY   = to.y + to.h / 2;
            c.setAttribute('cx', startX); c.setAttribute('cy', startY);
            const steps = 24;
            for (let i = 1; i <= steps; i++) {
              const t = i / steps;
              const x = startX + (endX - startX) * t;
              const y = startY + (endY - startY) * t;
              requestAnimationFrame(() => {
                c.setAttribute('cx', x); c.setAttribute('cy', y);
              });
            }
            setTimeout(() => c.remove(), 600);
          });
          await sleep(reduced ? 50 : 700);
          phase.forEach(id => {
            const g = $(`#dag-nodes g[data-id="${id}"]`);
            if (g && id !== 'root') g.classList.remove('dag__node--active');
            if (g && id !== 'root') g.classList.add('dag__node--merged');
          });
        }
        await sleep(reduced ? 50 : 600);
        if (!reduced) {
          setTimeout(() => overlay?.classList.remove('is-hidden'), 1200);
        }
      }

      runBtn?.addEventListener('click', () => {
        overlay?.classList.add('is-hidden');
        swarmRun().then(() => {
          if (reduced) overlay?.classList.remove('is-hidden');
        });
      });
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              io.disconnect();
              swarmRun();
            }
          });
        }, { threshold: 0.3 });
        io.observe($('#swarm'));
      }
    }

    /* ------------------------------------------------------------
       Benchmark bars
       ------------------------------------------------------------ */
    const BENCH_DATA = {
      '1': [
        { name: 'AlphaCode',         val: 27.8,  best: true, self: true },
        { name: 'Codex CLI',         val: 140.0 },
        { name: 'pi',                val: 144.4 },
        { name: 'Cursor Agent',      val: 214.9 },
        { name: 'Antigravity CLI',   val: 243.7 },
        { name: 'OpenCode',          val: 371.5 },
        { name: 'GitHub Copilot CLI',val: 333.3 },
        { name: 'Claude Code',       val: 386.6 },
      ],
      '10': [
        { name: 'AlphaCode',         val: 117.0, best: true, self: true },
        { name: 'Codex CLI',         val: 334.8 },
        { name: 'pi',                val: 833.0 },
        { name: 'Antigravity CLI',   val: 1021.2 },
        { name: 'Cursor Agent',      val: 1632.4 },
        { name: 'GitHub Copilot CLI',val: 1756.5 },
        { name: 'Claude Code',       val: 2300.6 },
        { name: 'OpenCode',          val: 3237.2 },
      ],
    };

    $$('.bench__bars').forEach(host => {
      const which = host.dataset.bench || '1';
      const data = (BENCH_DATA[which] || []).slice().sort((a, b) => a.val - b.val);
      const max = Math.max(...data.map(d => d.val));
      data.forEach(d => {
        const row = document.createElement('div');
        row.className = 'bench__row';
        const label = document.createElement('div');
        label.className = 'bench__label' + (d.best ? ' is-best' : '') + (d.self ? ' is-self' : '');
        label.textContent = d.name;
        const wrap = document.createElement('div');
        wrap.className = 'bench__bar-wrap';
        const bar = document.createElement('div');
        bar.className = 'bench__bar' + (d.best ? ' is-best' : '') + (d.self ? ' is-self' : '');
        wrap.appendChild(bar);
        const val = document.createElement('div');
        val.className = 'bench__val';
        val.innerHTML = `<b>${d.val}</b> MB`;
        row.append(label, wrap, val);
        host.appendChild(row);
        requestAnimationFrame(() => {
          const pct = (d.val / max) * 100;
          bar.style.width = pct + '%';
        });
      });
    });

    /* ------------------------------------------------------------
       Live repo stats (graceful fallback)
       ------------------------------------------------------------ */
    (function () {
      const ns = $('#navStars'), sg = $('#statStars'), lbl = sg && sg.nextElementSibling;
      const show = n => {
        if (ns) ns.textContent = '\u2605 ' + n;
        if (sg) sg.textContent = String(n);
        if (lbl) lbl.textContent = 'GitHub stars';
        try { localStorage.setItem('ac_stars', n); } catch (e) {}
      };
      try { const c = localStorage.getItem('ac_stars'); if (c) show(c); } catch (e) {}
      fetch('https://api.github.com/repos/dragonked2/alphacode')
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => d.stargazers_count)
        .catch(() => fetch('https://img.shields.io/github/stars/dragonked2/alphacode.json').then(r => r.json()).then(d => d.value))
        .then(n => { if (n !== undefined && n !== null && n !== '') show(n); })
        .catch(() => {});
    })();

    fetch('https://api.github.com/repos/dragonked2/alphacode/releases/latest', { headers: { 'Accept': 'application/vnd.github+json' }})
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j || !j.tag_name) return;
        const normalized = /^v/i.test(j.tag_name) ? j.tag_name : ('v' + j.tag_name);
        $$('.js-version').forEach(el => { el.textContent = normalized; });
      })
      .catch(() => {});
  });


  /* ------------------------------------------------------------
     Provider search
     ------------------------------------------------------------ */
  const providerInput = $('#providerSearch');
  const providerGrid  = $('#providerGrid');
  const providerCount = $('#providerCount');
  if (providerInput && providerGrid) {
    const items = $$('.model', providerGrid);
    const total = items.length;
    providerCount && (providerCount.textContent = String(total));
    providerInput.addEventListener('input', () => {
      const q = providerInput.value.trim().toLowerCase();
      let visible = 0;
      items.forEach(el => {
        const name = el.dataset.name || '';
        const match = !q || name.includes(q);
        el.classList.toggle('is-hidden', !match);
        if (match) visible++;
      });
      providerCount && (providerCount.textContent = String(visible));
    });
    providerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { providerInput.value = ''; providerInput.dispatchEvent(new Event('input')); }
    });
  }

  /* ------------------------------------------------------------
     Smooth anchor focus
     ------------------------------------------------------------ */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
      const focusable = el.querySelector('h1,h2,h3,a,button,input,select,textarea');
      if (focusable) {
        focusable.setAttribute('tabindex', '-1');
        focusable.focus({ preventScroll: true });
      }
    });
  });
})();;
/* AlphaCode community popup. Shows once per 7 days, never after joining. */
(() => {
  'use strict';
  const INVITE = 'https://discord.gg/zhXGvgZzf2';
  const SNOOZE_MS = 7 * 864e5;
  const KEY = 'ac_discord';
  document.documentElement.classList.add('js');

  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} },
  };
  const icon = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.4C.6 9.1-.3 13.7.1 18.2a19.9 19.9 0 0 0 6 3l1.3-2.1c-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2.1a19.8 19.8 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.8ZM8 15.5c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.7 8 10.7s2.2 1.1 2.2 2.4S9.2 15.5 8 15.5Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/></svg>`;
  const check = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';

  const state = store.get();
  const joined = !!state.joined;
  const snoozed = state.until && Date.now() < state.until;
  const markJoined = () => store.set({ joined: true });
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[href^="https://discord.gg/"]')) markJoined();
  });
  if (joined) return;

  /* floating pill */
  const pill = document.createElement('a');
  pill.className = 'dc-pill';
  pill.href = INVITE; pill.target = '_blank'; pill.rel = 'noopener noreferrer';
  pill.innerHTML = icon(18) + '<span>Join our Discord</span>';
  document.body.appendChild(pill);
  const showPill = () => pill.classList.add('is-visible');

  /* modal */
  const overlay = document.createElement('div');
  overlay.className = 'dc-overlay';
  overlay.innerHTML = `
    <div class="dc-modal" role="dialog" aria-modal="false" aria-labelledby="dcTitle" aria-describedby="dcDesc">
      <button class="dc-x" type="button" aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="dc-logo">${icon(30)}</div>
      <h2 id="dcTitle">Join the AlphaCode community</h2>
      <p id="dcDesc">Get quick help, share your workflows and shape what we build next.</p>
      <ul class="dc-list">
        <li>${check}Fast answers from maintainers and users</li>
        <li>${check}Early news on releases and new providers</li>
        <li>${check}Request features and report bugs directly</li>
      </ul>
      <div class="dc-actions">
        <a class="btn btn--discord btn--lg" href="${INVITE}" target="_blank" rel="noopener noreferrer">${icon(18)}<span>Join our Discord</span></a>
        <button class="dc-copy" type="button">Copy invite link</button>
        <button class="dc-later" type="button">Maybe later</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const modal = overlay.querySelector('.dc-modal');
  let lastFocus = null;
  let shown = false;

  const focusables = () => Array.from(modal.querySelectorAll('a[href],button')).filter(el => !el.disabled);
  function open() {
    if (shown) return;
    shown = true;
    lastFocus = document.activeElement;
    overlay.classList.add('is-open');
  }
  function close(snooze = true) {
    overlay.classList.remove('is-open');
    if (snooze) store.set({ until: Date.now() + SNOOZE_MS });
    showPill();
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  modal.querySelector('.dc-x').addEventListener('click', () => close());
  modal.querySelector('.dc-later').addEventListener('click', () => close());
  modal.querySelector('.btn--discord').addEventListener('click', () => { markJoined(); close(false); pill.remove(); });
  modal.querySelector('.dc-copy').addEventListener('click', async (e) => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText(INVITE); b.textContent = 'Copied: ' + INVITE.replace('https://', ''); }
    catch { b.textContent = INVITE; }
    setTimeout(() => { b.textContent = 'Copy invite link'; }, 2200);
  });
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  });

  if (snoozed) { showPill(); return; }

  /* Non-blocking toast. Never opens mid-scroll or right after a nav click, never locks scroll or moves focus. */
  let lastScroll = 0, lastNav = 0;
  addEventListener('scroll', () => { lastScroll = Date.now(); }, { passive: true });
  document.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"],.nav__toggle,.install__tab,.ins__tab')) lastNav = Date.now(); });
  const calm = () => Date.now() - lastScroll > 2000 && Date.now() - lastNav > 3000 && !document.querySelector('.nav.is-open') && document.visibilityState === 'visible';
  const attempt = () => { if (shown) return; calm() ? open() : setTimeout(attempt, 1500); };
  setTimeout(attempt, 25000);
})();;
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
})();;
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
})();;
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
if('IntersectionObserver'in window)new IntersectionObserver(e=>{inst=e[0].isIntersecting;up()}).observe(i)})();;
(()=>{const d=document,$=(s,r=d)=>[...r.querySelectorAll(s)];
const hasP=!!d.querySelector('.progress,.scroll-progress,[class*=progress]:not(.demo__bar)');if(hasP){}else if(!CSS.supports('animation-timeline','scroll()')){const p=d.createElement('div');p.className='m-progress';d.body.prepend(p);
 addEventListener('scroll',()=>{const h=d.documentElement;p.style.transform=`scaleX(${scrollY/Math.max(1,h.scrollHeight-innerHeight)})`},{passive:true})}
else{const p=d.createElement('div');p.className='m-progress';d.body.prepend(p)}
const b=d.querySelector('.totop')?d.createElement('i'):d.createElement('button');b.className='m-top-btn';b.type='button';b.setAttribute('aria-label','Back to top');b.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
if(b.tagName==='I')b.remove();else{b.onclick=()=>scrollTo({top:0});d.body.append(b)}
const nav=$('.nav')[0];addEventListener('scroll',()=>{b.classList.toggle('show',scrollY>700);nav&&nav.classList.toggle('is-scrolled',scrollY>8)},{passive:true});
if(matchMedia('(hover:hover)').matches)d.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.feat,.free__item,.m-card');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')},{passive:true});
const io='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12}):null;
$('.m-reveal').forEach(el=>io?io.observe(el):el.classList.add('in'));
$('.m-badge [data-copy]').forEach(el=>{if(el.dataset.mBound)return;el.dataset.mBound=1;el.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(el.dataset.copy);const t=el.textContent;el.textContent='Copied';setTimeout(()=>el.textContent=t,1500)}catch(_){}})},{once:true});
})();;
(()=>{const d=document,L=[['en-us','English (US)','en-US'],['en-gb','English (UK)','en-GB'],['ar-eg','العربية (مصر)','ar-EG'],['ar-sa','العربية (السعودية)','ar-SA'],['ar-ae','العربية (الإمارات)','ar-AE'],['nl-nl','Nederlands','nl-NL'],['de-de','Deutsch','de-DE'],['fr-fr','Français','fr-FR'],['es-es','Español','es-ES'],['pt-br','Português (Brasil)','pt-BR'],['tr-tr','Türkçe','tr-TR']];
const seg=location.pathname.split('/').filter(Boolean)[0]||'',cur=L.find(x=>x[0]===seg);
try{if(cur)localStorage.setItem('lang-pref',cur[0])}catch(_){}
const slot=d.querySelector('.nav__cta');
if(slot){const m=d.createElement('details');m.className='m-lang m-lang--icon';m.innerHTML='<summary aria-label="Language"><span aria-hidden="true">🌐</span></summary><ul>'+L.map(x=>'<li><a href="'+'/'+x[0]+'/" hreflang="'+x[2]+'" lang="'+x[2]+'"'+(cur&&cur[0]===x[0]?' aria-current="true"':'')+'>'+x[1]+'</a></li>').join('')+'</ul>';slot.prepend(m)}
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
b.innerHTML='<span>🌐 '+m[0]+'</span><a class="btn btn--primary btn--sm" href="'+'/'+pick+'/" hreflang="'+x[2]+'">'+m[1]+' · '+x[1]+'</a><button type="button" class="btn btn--ghost btn--sm">'+m[2]+'</button>';
b.querySelector('button').onclick=()=>{try{localStorage.setItem('lang-dismiss','1')}catch(_){}b.remove()};d.body.append(b);requestAnimationFrame(()=>b.classList.add('show'))},3500);
})();;
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
})();;
(function(){document.querySelectorAll('link[data-font]').forEach(function(l){l.media='all'})})();
