/* ==================================================================
   AEDAR Dropdown Menu — reusable
   Two ways to use:
   1) Declarative:  <div data-menu><button class="menu-trigger">…</button>
        <div class="menu-popover" hidden>…menu-items…</div></div>
   2) Programmatic:  AEDARMenu.open(triggerEl, items, onSelect)
        items: [{label, icon(svgString), shortcut, destructive, separator, header}]
   Popover is position:fixed and appended to <body>, so it escapes any
   overflow:hidden ancestor (e.g. a table wrapper). Closes on select,
   outside-click, Esc; ↑ ↓ Enter navigate.
================================================================== */
(function () {
  let openState = null; // { popover, trigger, items, onSelect, activeIndex }

  function closeMenu() {
    if (!openState) return;
    const { popover, trigger } = openState;
    document.removeEventListener('mousedown', onOutside, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', closeMenu);
    window.removeEventListener('scroll', closeMenu, true);
    if (popover.__owned) popover.remove(); else popover.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    openState = null;
  }
  function onOutside(e) { if (openState && !openState.popover.contains(e.target) && e.target !== openState.trigger && !openState.trigger.contains(e.target)) closeMenu(); }
  function itemEls() { return Array.from(openState.popover.querySelectorAll('.menu-item')); }
  function setActive(i) {
    const els = itemEls();
    els.forEach((e) => e.classList.remove('is-active'));
    if (i < 0) i = els.length - 1; if (i >= els.length) i = 0;
    openState.activeIndex = i;
    if (els[i]) els[i].classList.add('is-active');
  }
  function onKey(e) {
    if (!openState) return;
    if (e.key === 'Escape') { e.preventDefault(); const t = openState.trigger; closeMenu(); t.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(openState.activeIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(openState.activeIndex - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); const el = itemEls()[openState.activeIndex]; if (el) el.click(); }
  }

  function position(popover, trigger) {
    const r = trigger.getBoundingClientRect();
    popover.style.visibility = 'hidden';
    popover.hidden = false;
    const pw = popover.offsetWidth, ph = popover.offsetHeight;
    let left = r.right - pw;                     // right-aligned to trigger
    if (left < 8) left = r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    let top = r.bottom + 6;
    if (top + ph > window.innerHeight - 8) top = r.top - ph - 6; // flip up
    top = Math.max(8, top);
    popover.style.left = left + 'px';
    popover.style.top = top + 'px';
    popover.style.visibility = '';
  }

  function wire(popover, trigger, onSelect) {
    openState = { popover, trigger, onSelect, activeIndex: -1 };
    trigger.setAttribute('aria-expanded', 'true');
    itemEls().forEach((el, i) => {
      el.addEventListener('mousemove', () => setActive(i));
      el.addEventListener('click', () => {
        const action = el.dataset.action || el.textContent.trim();
        closeMenu();
        if (onSelect) onSelect(action, el);
        trigger.dispatchEvent(new CustomEvent('menu:select', { bubbles: true, detail: { action } }));
      });
    });
    position(popover, trigger);
    document.addEventListener('mousedown', onOutside, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
  }

  function buildPopover(items) {
    const pop = document.createElement('div');
    pop.className = 'menu-popover';
    pop.__owned = true;
    pop.innerHTML = items.map((it) => {
      if (it.separator) return '<div class="menu-sep"></div>';
      if (it.header) return `<div class="menu-label">${it.header}</div>`;
      return `<div class="menu-item${it.destructive ? ' is-destructive' : ''}" data-action="${it.action || it.label}">${it.icon || ''}<span class="menu-item-label">${it.label}</span>${it.shortcut ? `<span class="menu-shortcut">${it.shortcut}</span>` : ''}</div>`;
    }).join('');
    document.body.appendChild(pop);
    return pop;
  }

  function open(trigger, items, onSelect) {
    if (openState && openState.trigger === trigger) { closeMenu(); return; }
    closeMenu();
    wire(buildPopover(items), trigger, onSelect);
  }

  // Declarative init
  function initAll(scope) {
    (scope || document).querySelectorAll('[data-menu]').forEach((root) => {
      if (root.__menuInit) return; root.__menuInit = true;
      const trigger = root.querySelector('.menu-trigger');
      const popover = root.querySelector('.menu-popover');
      if (!trigger || !popover) return;
      if (popover.parentElement !== document.body) document.body.appendChild(popover); // portal out
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (openState && openState.popover === popover) { closeMenu(); return; }
        closeMenu();
        wire(popover, trigger, null);
      });
    });
  }

  window.AEDARMenu = { open, close: closeMenu, initAll };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAll());
  else initAll();
})();
