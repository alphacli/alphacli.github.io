/* ============================================================
   Alphacode — site script v6
   ============================================================ */

(() => {
  'use strict';

  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  /* ------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------ */
  const revealEls = $$('.feat, .stat, .model, .install__card, .bench__card, .swarm__board, .faq__item, .section__head');
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.setAttribute('data-d', String((i % 3) + 1));
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
      btn.textContent = 'copied';
      setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.textContent = orig;
      }, 1400);
    });
  });

  /* ------------------------------------------------------------
     Animated hero demo (typed agent run)
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
      { p: 'alphacode', m: 'sonnet-4.5', text: '<span class="l-dim">›</span> <span class="l-info">scan repo, plan migration to OAuth 2.1</span>' },
      { p: 'plan',      m: 'plan',       text: '<span class="l-violet">[planner]</span> <span class="l-info">decomposing goal…</span> <span class="l-dim">3 agents</span>' },
      { p: 'agent-1',   m: 'haiku-4',    text: '<span class="l-warn">[auth/routes.ts]</span> <span class="l-info">refactor login → authorization code</span>' },
      { p: 'agent-2',   m: 'sonnet-4.5', text: '<span class="l-warn">[auth/tokens.ts]</span> <span class="l-info">add PKCE, refresh-rotation</span>' },
      { p: 'agent-3',   m: 'gpt-5-mini', text: '<span class="l-warn">[auth/db.ts]</span> <span class="l-info">add sessions + audit log</span>' },
      { p: 'tests',     m: 'haiku-4',    text: '<span class="l-info">running</span> <span class="l-dim">cargo test --workspace</span> <span class="l-ok">✓ 142/142</span>' },
      { p: 'review',    m: 'sonnet-4.5', text: '<span class="l-violet">[reviewer]</span> <span class="l-info">diff looks clean, no secrets leaked</span>' },
      { p: 'done',      m: '—',          text: '<span class="l-ok l-bold">✓ ready to commit</span> <span class="l-dim">3 files · 142 tests passed · 0 leaked secrets</span>' },
    ];

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const models = ['sonnet-4.5', 'haiku-4', 'gpt-5-mini', 'opus-4'];

    function setStatus(s) { demoStatus.textContent = s; }
    function setTime(t)   { demoTime.textContent = t.toFixed(1) + 's'; }
    function setTools(n)  { demoTools.textContent = String(n); }
    function setModel(m)  { demoModel.textContent = m; }

    let stepIdx = 0;
    let cancelled = false;

    async function run() {
      cancelled = false;
      demoBody.innerHTML = '';
      setStatus('running');
      demoBar.style.width = '0%';
      demoBarW && demoBarW.setAttribute('aria-valuenow', '0');
      demoFootDot && demoFootDot.classList.remove('is-done');
      setTools(0); setTime(0);

      const start = performance.now();
      const tick = setInterval(() => {
        if (cancelled) return;
        setTime((performance.now() - start) / 1000);
      }, 50);

      for (let i = 0; i < steps.length; i++) {
        if (cancelled) break;
        stepIdx = i;
        const s = steps[i];
        setModel(s.m);
        const line = document.createElement('div');
        line.innerHTML = `<span class="l-prompt">$</span> <span class="l-violet l-bold">${s.p}</span>  ${s.text}<span class="l-caret"></span>`;
        demoBody.appendChild(line);
        setTools(i + 1);
        const pct = ((i + 1) / steps.length) * 100;
        demoBar.style.width = pct + '%';
        demoBarW && demoBarW.setAttribute('aria-valuenow', String(Math.round(pct)));
        await sleep(900 + Math.random() * 500);
        line.querySelector('.l-caret')?.remove();
      }

      clearInterval(tick);
      setStatus('done');
      demoFootDot && demoFootDot.classList.add('is-done');
    }

    function loop() {
      run().then(() => sleep(6000)).then(() => {
        if (!cancelled) loop();
      });
    }

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) loop();

    // Allow re-running by clicking on the terminal
    demoBody.parentElement.addEventListener('click', () => {
      if (cancelled) return;
    });
  }

  /* ------------------------------------------------------------
     Swarm DAG animation
     ------------------------------------------------------------ */
  const dagNodes = $('#dag-nodes');
  const dagEdges = $('#dag-edges');
  const dagPkts  = $('#dag-pkts');

  if (dagNodes && dagEdges) {
    const W = 600, H = 280;
    const nodes = [
      { id: 'root',   x:  40, y: 130, w: 110, h: 50, label: 'Goal',         sub: 'migrate → OAuth 2.1', kind: 'root' },
      { id: 'plan',   x: 180, y: 130, w: 110, h: 50, label: 'Planner',      sub: 'sonnet-4.5',         kind: 'plan' },
      { id: 'a1',     x: 340, y:  40, w: 100, h: 46, label: 'Agent · A',    sub: 'haiku-4',             kind: 'agent' },
      { id: 'a2',     x: 340, y: 130, w: 100, h: 46, label: 'Agent · B',    sub: 'sonnet-4.5',          kind: 'agent' },
      { id: 'a3',     x: 340, y: 220, w: 100, h: 46, label: 'Agent · C',    sub: 'gpt-5-mini',          kind: 'agent' },
      { id: 'merge',  x: 480, y: 130, w:  90, h: 50, label: 'Reviewer',     sub: 'opus-4',              kind: 'merged' },
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

    // edges
    edges.forEach(([from, to]) => {
      const a = center(nodeById[from]);
      const b = center(nodeById[to]);
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', `M${a.x} ${a.y} C ${a.x+40} ${a.y}, ${b.x-40} ${b.y}, ${b.x} ${b.y}`);
      path.setAttribute('marker-end', 'url(#arr)');
      dagEdges.appendChild(path);
    });

    // nodes
    nodes.forEach(n => {
      const g = document.createElementNS(NS, 'g');
      g.classList.add('dag__node', `dag__node--${n.kind}`);
      g.dataset.id = n.id;
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', n.x); rect.setAttribute('y', n.y);
      rect.setAttribute('width', n.w); rect.setAttribute('height', n.h);
      rect.setAttribute('rx', '6');
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
      // reset
      $$('#dag-nodes g').forEach(g => g.classList.remove('is-active', 'is-done'));
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));

      for (const phase of order) {
        $$('#dag-nodes g').forEach(g => g.classList.remove('is-active'));
        phase.forEach(id => {
          const g = $(`#dag-nodes g[data-id="${id}"]`);
          if (g) g.classList.add('is-active');
        });
        // packets: send from each active node to merge
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
          if (g && id !== 'root') g.classList.remove('is-active');
          if (g && id !== 'root') g.classList.add('is-done');
        });
      }
      await sleep(reduced ? 50 : 600);
      setTimeout(() => overlay?.classList.remove('is-hidden'), reduced ? 0 : 1200);
    }

    runBtn?.addEventListener('click', () => swarmRun());
    // Auto-run once on first visibility
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            io.disconnect();
            if (!reduced) swarmRun();
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
      { name: 'Alphacode',  val: 38,  best: true,  self: true  },
      { name: 'Claude Code',val: 180 },
      { name: 'Codex CLI',  val: 240 },
      { name: 'Aider',      val: 310 },
      { name: 'Cursor',     val: 520 },
    ],
    '10': [
      { name: 'Alphacode',  val: 142, best: true,  self: true  },
      { name: 'Claude Code',val: 1100 },
      { name: 'Codex CLI',  val: 1400 },
      { name: 'Aider',      val: 1850 },
      { name: 'Cursor',     val: 3200 },
    ],
  };

  $$('.bench__bars').forEach(host => {
    const which = host.dataset.bench || '1';
    const data = BENCH_DATA[which] || [];
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
      // animate
      requestAnimationFrame(() => {
        const pct = (d.val / max) * 100;
        bar.style.width = pct + '%';
      });
    });
  });

  /* ------------------------------------------------------------
     Live repo stats (graceful fallback)
     ------------------------------------------------------------ */
  fetch('https://api.github.com/repos/dragonked2/alphacode', { headers: { 'Accept': 'application/vnd.github+json' }})
    .then(r => r.ok ? r.json() : null)
    .then(j => {
      if (!j) return;
      const stars = j.stargazers_count;
      const version = (j.name || '') + ' · ' + (j.open_issues_count ?? 0) + ' open issues';
      const ns = $('#navStars');
      const hs = $('#heroVersion');
      const sg = $('#statStars');
      if (ns && stars != null) ns.textContent = '★ ' + stars;
      if (sg && stars != null) sg.textContent = String(stars);
      if (hs) hs.textContent = j.default_branch || hs.textContent;
    })
    .catch(() => {});

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
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
      const focusable = el.querySelector('h1,h2,h3,a,button,input,select,textarea');
      if (focusable) {
        focusable.setAttribute('tabindex', '-1');
        focusable.focus({ preventScroll: true });
      }
    });
  });
})();
