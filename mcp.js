/* ============================================================
   Alphacode — MCP page script (minimal, isolated)
   ============================================================ */
(() => {
  'use strict';
  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  /* Mobile nav toggle */
  const navEl = $('.nav');
  const navToggle = $('.nav__toggle');
  const navLinksEl = $('.nav__links');
  if (navEl && navToggle && navLinksEl) {
    const closeNav = () => { navEl.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); };
    const openNav  = () => { navEl.classList.add('is-open'); navToggle.setAttribute('aria-expanded', 'true'); };
    navToggle.addEventListener('click', () => {
      navEl.classList.contains('is-open') ? closeNav() : openNav();
    });
    navLinksEl.addEventListener('click', (e) => { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navEl.classList.contains('is-open')) { closeNav(); navToggle.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 880) closeNav(); });
  }

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
  let copyAnnouncer = $('#copyAnnouncer');
  if (!copyAnnouncer) {
    copyAnnouncer = document.createElement('div');
    copyAnnouncer.id = 'copyAnnouncer';
    copyAnnouncer.setAttribute('role', 'status');
    copyAnnouncer.setAttribute('aria-live', 'polite');
    copyAnnouncer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;';
    document.body.appendChild(copyAnnouncer);
  }

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
      copyAnnouncer.textContent = 'Command copied to clipboard';
      setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.textContent = orig;
      }, 1400);
    });
  });
})();
