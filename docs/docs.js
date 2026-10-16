// Highlight active TOC item on scroll
  (() => {
    const links = Array.from(document.querySelectorAll('.toc__item'));
    const targets = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    if (!('IntersectionObserver' in window) || !targets.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    targets.forEach(t => io.observe(t));
  })();
