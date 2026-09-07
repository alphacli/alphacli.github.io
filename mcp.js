/* ============================================================
   Alphacode — MCP page script (minimal, isolated)
   ============================================================ */
(() => {
  'use strict';
  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  /* Reveal on scroll */
  const revealEls = $$('.mcp-reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* Copy buttons (data-copy attribute) */
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch {}
        ta.remove();
      }
      const orig = btn.textContent;
      btn.classList.add('is-copied');
      btn.textContent = 'copied';
      setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.textContent = orig;
      }, 1400);
    });
  });
})();
