/* ============================================================
   Alphacode — v5 script
   ============================================================ */
(() => {
  'use strict';

  /* ---------- INSTALL TABS ---------- */
  const tabs = document.querySelectorAll('.install__tab');
  const panels = document.querySelectorAll('.install__panel');
  const indicator = document.getElementById('installIndicator');

  function moveIndicator(tab) {
    if (!indicator || !tab) return;
    const pr = tab.parentElement.getBoundingClientRect();
    const r = tab.getBoundingClientRect();
    indicator.style.left = (r.left - pr.left) + 'px';
    indicator.style.width = r.width + 'px';
  }

  function selectTab(tab) {
    const id = tab.dataset.platform;
    tabs.forEach((t) => {
      t.classList.toggle('is-active', t === tab);
      t.setAttribute('aria-selected', String(t === tab));
    });
    panels.forEach((p) => { p.hidden = p.dataset.platform !== id; });
    moveIndicator(tab);
  }

  tabs.forEach((t) => t.addEventListener('click', () => selectTab(t)));
  if (tabs[0]) requestAnimationFrame(() => moveIndicator(tabs[0]));
  window.addEventListener('resize', () => {
    const sel = [...tabs].find((t) => t.classList.contains('is-active'));
    if (sel) moveIndicator(sel);
  });

  /* ---------- COPY BUTTONS ---------- */
  document.querySelectorAll('.code__copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      try { await navigator.clipboard.writeText(text); }
      catch {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); ta.remove();
      }
      const orig = btn.textContent;
      btn.textContent = 'copied';
      btn.classList.add('is-copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('is-copied'); }, 1400);
    });
  });

  /* ---------- HERO TERMINAL DEMO ---------- */
  const body = document.getElementById('demoBody');
  const statusEl = document.getElementById('demoStatus');
  const timeEl = document.getElementById('demoTime');
  const toolsEl = document.getElementById('demoTools');
  const barEl = document.getElementById('demoBar');
  const dotEl = document.querySelector('.demo__foot-dot');

  const SCRIPT = [
    ['p', '> refactor src/auth/session.ts → use Result<T>'],
    ['d', '\n  ⏎ planning · 6 files · 14 callsites'],
    ['o', '\n  ✓ plan: 4 steps, 2 files'],
    ['v', '\n\n  ◇ step 1/4  '], ['i', 'read session.ts + callers'],
    ['d', '\n'],
    ['v', '  ◇ step 2/4  '], ['i', 'introduce Result<T,E>'],
    ['d', '\n'],
    ['v', '  ◇ step 3/4  '], ['i', 'update 6 callers'],
    ['d', '\n'],
    ['v', '  ◇ step 4/4  '], ['i', 'tests + cargo test'],
    ['d', '\n\n'],
    ['o', '  ✓ 142 passed · clippy clean'],
    ['o', '\n  ✓ coverage 91.4% → 94.2%'],
    ['d', '\n\n'],
    ['w', '  src/auth/session.ts       +48  -22'],
    ['w', '\n  src/auth/session.test.ts  +31  -0'],
    ['d', '\n\n'],
    ['o', '  ✓ done in 28.4s · ready to commit'],
  ];

  const CLS = {
    p: 'l-prompt', i: 'l-info', d: 'l-dim',
    o: 'l-ok', w: 'l-warn', v: 'l-violet', r: 'l-rose',
  };

  async function play() {
    if (!body) return;
    body.textContent = '';
    if (statusEl) statusEl.textContent = 'running';
    if (dotEl) dotEl.classList.remove('is-done');

    const start = performance.now();
    const tick = () => {
      if (!timeEl) return;
      timeEl.textContent = ((performance.now() - start) / 1000).toFixed(1) + 's';
      requestAnimationFrame(tick);
    };
    tick();

    const total = SCRIPT.length;
    for (let i = 0; i < SCRIPT.length; i++) {
      const [kind, txt] = SCRIPT[i];
      const cls = CLS[kind] || 'l-info';
      const isLong = txt.length > 6 && (kind === 'i' || kind === 'd' || kind === 'w' || kind === 'o');

      if (isLong) {
        for (let c = 0; c < txt.length; c++) {
          const span = document.createElement('span');
          span.className = cls;
          span.textContent = txt[c];
          body.appendChild(span);
          if (body.textContent.length > 3500) {
            body.textContent = body.textContent.slice(-2500);
          }
          const prog = ((i + c / txt.length) / total) * 100;
          if (barEl) barEl.style.width = prog + '%';
          await new Promise((r) => setTimeout(r, 6));
        }
      } else {
        const span = document.createElement('span');
        span.className = cls;
        span.textContent = txt;
        body.appendChild(span);
        if (barEl) barEl.style.width = ((i + 1) / total) * 100 + '%';
        await new Promise((r) => setTimeout(r, 24));
      }
      if (toolsEl) {
        const p = i / total;
        if (p > 0.4) toolsEl.textContent = '14';
      }
    }
    // append caret
    const caret = document.createElement('span');
    caret.className = 'l-caret';
    body.appendChild(caret);
    if (statusEl) statusEl.textContent = 'done';
    if (dotEl) dotEl.classList.add('is-done');
  }

  async function loop() {
    while (true) {
      await play();
      await new Promise((r) => setTimeout(r, 10000));
    }
  }
  if (body) loop();

  /* ---------- SWARM DAG ---------- */
  const NODES = [
    { id: 'goal',    label: '🎯 migrate auth',       x: 270, y: 20,  w: 130, h: 44, cls: 'dag__node--root' },
    { id: 'plan',    label: '🧭 Planner',           x: 270, y: 95,  w: 130, h: 38, cls: 'dag__node--plan' },
    { id: 'agent-a', label: 'Agent A',              x: 30,  y: 180, w: 100, h: 60, cls: 'dag__node--agent', sub: 'routes 1–4' },
    { id: 'agent-b', label: 'Agent B',              x: 160, y: 180, w: 100, h: 60, cls: 'dag__node--agent', sub: 'routes 5–8' },
    { id: 'agent-c', label: 'Agent C',              x: 290, y: 180, w: 100, h: 60, cls: 'dag__node--agent', sub: 'routes 9–12' },
    { id: 'agent-d', label: 'Agent D',              x: 420, y: 180, w: 100, h: 60, cls: 'dag__node--agent', sub: 'tests + docs' },
    { id: 'done',    label: '🏁 Merged & reviewed', x: 265, y: 290, w: 140, h: 40, cls: 'dag__node--done' },
  ];
  const EDGES = [
    ['goal', 'plan'],
    ['plan', 'agent-a'], ['plan', 'agent-b'], ['plan', 'agent-c'], ['plan', 'agent-d'],
    ['agent-a', 'done'], ['agent-b', 'done'], ['agent-c', 'done'], ['agent-d', 'done'],
  ];

  const dagEdges = document.getElementById('dag-edges');
  const dagNodes = document.getElementById('dag-nodes');
  const dagPkts  = document.getElementById('dag-pkts');
  const overlay  = document.getElementById('swarmOverlay');
  const runBtn   = document.getElementById('swarmRun');

  const nodeById = (id) => NODES.find((n) => n.id === id);

  function buildDag() {
    if (!dagEdges) return;
    dagEdges.innerHTML = '';
    dagNodes.innerHTML = '';
    EDGES.forEach(([f, t]) => {
      const a = nodeById(f), b = nodeById(t);
      const ax = a.x + a.w / 2, ay = a.y + a.h;
      const bx = b.x + b.w / 2, by = b.y;
      const cy = (ay + by) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${ax} ${ay} C ${ax} ${cy}, ${bx} ${cy}, ${bx} ${by}`);
      path.setAttribute('marker-end', 'url(#arr)');
      dagEdges.appendChild(path);
    });
    NODES.forEach((n) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('dag__node');
      if (n.cls) g.classList.add(n.cls);
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', n.x); r.setAttribute('y', n.y);
      r.setAttribute('width', n.w); r.setAttribute('height', n.h);
      r.setAttribute('rx', 6);
      g.appendChild(r);
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', n.x + n.w / 2);
      t.setAttribute('y', n.y + n.h / 2 - (n.sub ? 5 : 4));
      t.setAttribute('text-anchor', 'middle');
      t.textContent = n.label;
      g.appendChild(t);
      if (n.sub) {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        s.setAttribute('x', n.x + n.w / 2);
        s.setAttribute('y', n.y + n.h / 2 + 11);
        s.setAttribute('text-anchor', 'middle');
        s.classList.add('dag__sub');
        s.textContent = n.sub;
        g.appendChild(s);
      }
      dagNodes.appendChild(g);
    });
  }
  buildDag();

  function sendPkt(fromId, toId) {
    return new Promise((res) => {
      const a = nodeById(fromId), b = nodeById(toId);
      const ax = a.x + a.w / 2, ay = a.y + a.h;
      const bx = b.x + b.w / 2, by = b.y;
      const cy = (ay + by) / 2;
      const path = `M ${ax} ${ay} C ${ax} ${cy}, ${bx} ${cy}, ${bx} ${by}`;
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', 4);
      c.classList.add('pkt');
      dagPkts.appendChild(c);
      const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      anim.setAttribute('dur', '0.85s');
      anim.setAttribute('fill', 'freeze');
      anim.setAttribute('path', path);
      c.appendChild(anim);
      setTimeout(() => { c.remove(); res(); }, 850);
    });
  }

  async function runSwarm() {
    if (overlay) overlay.classList.add('is-hidden');
    // reset
    NODES.forEach((n) => {
      const el = dagNodes.querySelector(`g:nth-child(${NODES.indexOf(n) + 1})`);
      if (el) el.classList.remove('dag__node--active', 'dag__node--merged');
    });
    const doneNode = dagNodes.children[dagNodes.children.length - 1];
    if (doneNode) {
      const rect = doneNode.querySelector('rect');
      rect.setAttribute('fill', 'rgba(163,230,53,.10)');
      rect.setAttribute('stroke', '#A3E635');
    }
    dagPkts.innerHTML = '';

    await new Promise((r) => setTimeout(r, 300));
    dagNodes.children[1].classList.add('dag__node--active');
    await sendPkt('goal', 'plan');

    await new Promise((r) => setTimeout(r, 200));
    const agents = ['agent-a', 'agent-b', 'agent-c', 'agent-d'];
    agents.forEach((id) => {
      const idx = NODES.findIndex((n) => n.id === id);
      dagNodes.children[idx].classList.add('dag__node--active');
    });
    await Promise.all([
      sendPkt('plan', 'agent-a'),
      sendPkt('plan', 'agent-b'),
      sendPkt('plan', 'agent-c'),
      sendPkt('plan', 'agent-d'),
    ]);

    await new Promise((r) => setTimeout(r, 600));
    agents.forEach((id) => {
      const idx = NODES.findIndex((n) => n.id === id);
      dagNodes.children[idx].classList.remove('dag__node--active');
    });
    doneNode.classList.add('dag__node--active');
    await Promise.all([
      sendPkt('agent-a', 'done'),
      sendPkt('agent-b', 'done'),
      sendPkt('agent-c', 'done'),
      sendPkt('agent-d', 'done'),
    ]);

    await new Promise((r) => setTimeout(r, 300));
    doneNode.classList.remove('dag__node--active');
    doneNode.classList.add('dag__node--merged');
    const dr = doneNode.querySelector('rect');
    dr.setAttribute('fill', 'rgba(163,230,53,.22)');
  }

  if (runBtn) runBtn.addEventListener('click', runSwarm);
  // also click anywhere on overlay to run
  if (overlay) overlay.addEventListener('click', (e) => {
    if (e.target !== runBtn) runSwarm();
  });

  // auto-run when scrolled into view (once)
  let autoRan = false;
  if ('IntersectionObserver' in window && overlay) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !autoRan) {
          autoRan = true;
          setTimeout(runSwarm, 400);
          io.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io.observe(overlay.parentElement);
  }

  /* ---------- BENCHMARKS ---------- */
  const BENCH = {
    1: [
      { label: 'Alphacode · lean',   mb: 27.8,  best: true,  self: false },
      { label: 'Alphacode · std',    mb: 167.1, best: false, self: true },
      { label: 'Codex CLI',          mb: 140.0, best: false, self: false },
      { label: 'Cursor Agent',       mb: 214.9, best: false, self: false },
      { label: 'Copilot CLI',        mb: 333.3, best: false, self: false },
      { label: 'Claude Code',        mb: 386.6, best: false, self: false },
    ],
    10: [
      { label: 'Alphacode · lean',   mb: 117.0,  best: true,  self: false },
      { label: 'Alphacode · std',    mb: 260.8,  best: false, self: true },
      { label: 'Codex CLI',          mb: 334.8,  best: false, self: false },
      { label: 'Cursor Agent',       mb: 1632.4, best: false, self: false },
      { label: 'Copilot CLI',        mb: 1756.2, best: false, self: false },
      { label: 'Claude Code',        mb: 2300.6, best: false, self: false },
    ],
  };

  document.querySelectorAll('.bench__bars').forEach((wrap) => {
    const which = wrap.dataset.bench;
    const rows = BENCH[which] || [];
    const max = Math.max(...rows.map((r) => r.mb));

    rows.forEach((r) => {
      const row = document.createElement('div');
      row.className = 'bench__row';
      const pct = Math.max(2, (r.mb / max) * 100);
      const cls = r.best ? 'is-best' : (r.self ? 'is-self' : '');
      const labelCls = r.best ? 'is-best' : (r.self ? 'is-self' : '');
      row.innerHTML = `
        <span class="bench__label ${labelCls}">${r.label}</span>
        <span class="bench__bar-wrap"><span class="bench__bar ${cls}" data-w="${pct}"></span></span>
        <span class="bench__val"><b>${r.mb >= 1000 ? (r.mb/1000).toFixed(2)+' GB' : r.mb.toFixed(1)+' MB'}</b></span>
      `;
      wrap.appendChild(row);
    });

    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) {
          wrap.querySelectorAll('.bench__bar').forEach((b, i) => {
            setTimeout(() => { b.style.width = b.dataset.w + '%'; }, i * 60);
          });
          io.unobserve(wrap);
        }
      });
    }, { threshold: 0.3 });
    io.observe(wrap);
  });

  /* ---------- SCROLL REVEAL ---------- */
  const targets = document.querySelectorAll(
    '.section__head, .feat, .demo, .hero__copy > *, .install__card, .bench__card, .footer__inner > *'
  );
  targets.forEach((el) => el.classList.add('reveal'));
  // stagger features
  document.querySelectorAll('.feat').forEach((el, i) => el.setAttribute('data-d', String((i % 3) + 1)));
  document.querySelectorAll('.hero__copy > *').forEach((el, i) => el.setAttribute('data-d', String(i + 1)));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('in'));
  }
})();
