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
    <div class="dc-modal" role="dialog" aria-modal="true" aria-labelledby="dcTitle" aria-describedby="dcDesc">
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
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => modal.querySelector('.btn--discord').focus(), 30);
  }
  function close(snooze = true) {
    overlay.classList.remove('is-open');
    document.documentElement.style.overflow = '';
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
    if (e.key === 'Tab') {
      const f = focusables();
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  if (snoozed) { showPill(); return; }

  /* triggers: engaged scroll, 30s on page, or desktop exit intent. Whichever is first, once. */
  const trigger = () => { cleanup(); if (!document.querySelector('.nav.is-open')) open(); };
  const onScroll = () => {
    const d = document.documentElement;
    if ((window.scrollY || d.scrollTop) / Math.max(1, d.scrollHeight - d.clientHeight) > .45) trigger();
  };
  const onLeave = (e) => { if (e.clientY <= 0) trigger(); };
  const timer = setTimeout(trigger, 30000);
  function cleanup() {
    clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('mouseleave', onLeave);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (matchMedia('(hover:hover)').matches) document.addEventListener('mouseleave', onLeave);
})();
