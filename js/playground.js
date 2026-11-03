/* ==========================================================================
   Playground page: category filter and a project details modal with
   previous / next (also on the arrow keys). No libraries.
   ========================================================================== */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---- Filter ---- */
  const cards = $$('.pg-card'), empty = $('.pg-empty');
  $$('.seg button').forEach(b => b.addEventListener('click', () => {
    $$('.seg button').forEach(x => x.classList.toggle('on', x === b));
    let shown = 0;
    cards.forEach(c => {
      const hide = b.dataset.f !== 'all' && c.dataset.cat !== b.dataset.f;
      c.classList.toggle('is-hidden', hide);
      if (!hide) { shown++; c.classList.remove('pg-in'); void c.offsetWidth; c.classList.add('pg-in'); }
    });
    if (empty) empty.hidden = shown > 0;
  }));

  /* ---- Details modal ---- */
  const modal = $('.pg-modal'), body = $('.pg-modal-body');
  let lastFocus = null, current = null;
  const visibleCards = () => cards.filter(c => !c.classList.contains('is-hidden'));
  function render(card) {
    current = card;
    const link = card.dataset.link;
    const live = card.dataset.live;
    const linkHtml = link
      ? `<a class="btn dark sm" href="${link}">${card.dataset.linkLabel || 'Read the full case study'} →</a>`
      : live ? `<a class="btn ghost sm" href="${live}" target="_blank" rel="noopener">Open full screen ↗</a>` : '';
    body.innerHTML = `
      ${card.dataset.live
        ? `<div class="pg-modal-cover"><iframe src="${card.dataset.live}" title="${card.dataset.title} (live)" loading="lazy"></iframe><span class="pg-live">Live · try it</span></div>`
        : `<div class="pg-modal-cover is-play">${$('.pg-cover', card).outerHTML}</div>`}
      <div class="pg-modal-text">
        <span class="pg-tag">${card.dataset.label}</span>
        <h2>${card.dataset.title}</h2>
        <div class="pg-meta"><span>${card.dataset.yr}</span><span>${card.dataset.tools}</span></div>
        <p>${card.dataset.desc}</p>
        ${linkHtml}
      </div>`;
  }
  function openModal(card) {
    lastFocus = document.activeElement;
    render(card);
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    $('.pg-close').focus();
  }
  function step(dir) {
    const v = visibleCards();
    if (!v.length) return;
    const next = v[(v.indexOf(current) + dir + v.length) % v.length];
    body.classList.add('swap');
    setTimeout(() => { render(next); body.classList.remove('swap'); }, 180);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    setTimeout(() => { modal.hidden = true; }, 300);
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  cards.forEach(c => {
    c.addEventListener('click', () => openModal(c));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(c); } });
  });
  $('.pg-close').addEventListener('click', closeModal);
  $('.pg-prev').addEventListener('click', () => step(-1));
  $('.pg-next').addEventListener('click', () => step(1));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
})();
