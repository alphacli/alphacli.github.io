/* ============================================================
   Alphacode — MCP page script (minimal, isolated)
   ============================================================ */
(() => {
  'use strict';
  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll progress bar + sticky nav elevation + back-to-top */
  (() => {
    const progress = document.createElement('div');
    progress.className = 'progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.prepend(progress);

    const totop = document.createElement('button');
    totop.className = 'totop';
    totop.type = 'button';
    totop.setAttribute('aria-label', 'Back to top');
    totop.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(totop);
    totop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });

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

  /* Smooth anchor focus for same-page hash links */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

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
