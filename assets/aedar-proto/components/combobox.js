/* ==================================================================
   AEDAR Combobox — reusable behavior
   Upgrades any [data-combobox] element: open/close, filter, keyboard
   nav (↑ ↓ Enter Esc), selection with check, click-outside to close.
   Markup: see foundations/Inputs.html. Call window.AEDARCombobox.initAll()
   after injecting new comboboxes; auto-runs on DOMContentLoaded.
   Items may be injected into .combobox-list AFTER init — they are read
   live on every open/filter, and clicks are delegated.
   Dispatches a 'change' event on the root with {value, label} in detail.
================================================================== */
(function () {
  const SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
  const CHECK_SVG = '<svg class="combobox-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  function init(root) {
    if (root.__cbInit) return;
    root.__cbInit = true;

    const trigger = root.querySelector('.combobox-trigger');
    const valueEl = root.querySelector('.combobox-value');
    const popover = root.querySelector('.combobox-popover');
    const searchInput = root.querySelector('.combobox-search-input');
    const list = root.querySelector('.combobox-list');
    let emptyEl = root.querySelector('.combobox-empty');

    const itemsOf = () => Array.from(popover.querySelectorAll('.combobox-item'));
    function labelOf(it) {
      let l = it.querySelector('.combobox-item-label');
      if (!l) {
        l = document.createElement('span');
        l.className = 'combobox-item-label';
        l.textContent = it.textContent.trim();
        it.textContent = '';
        it.appendChild(l);
      }
      return l;
    }
    // Items can arrive after init; normalize whatever is present right now.
    function normalize() {
      itemsOf().forEach((it) => {
        labelOf(it);
        if (!it.querySelector('.combobox-check')) {
          const tmp = document.createElement('template');
          tmp.innerHTML = CHECK_SVG;
          it.appendChild(tmp.content.firstChild);
        }
      });
    }
    normalize();
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.className = 'combobox-empty';
      emptyEl.textContent = 'No results found.';
      emptyEl.hidden = true;
      list.after(emptyEl);
    }

    let active = null;

    // Portal the popover to <body> so it escapes any overflow:hidden / scroll ancestor
    if (popover.parentElement !== document.body) document.body.appendChild(popover);

    function position() {
      const r = trigger.getBoundingClientRect();
      // Let the list grow to its content (hierarchy labels can be long) but never
      // narrower than the trigger, and keep it on-screen.
      popover.style.width = 'max-content';
      popover.style.minWidth = r.width + 'px';
      popover.style.maxWidth = Math.min(380, window.innerWidth - 16) + 'px';
      const pw = popover.offsetWidth;
      let left = r.left;
      if (left + pw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - pw);
      popover.style.left = left + 'px';
      popover.style.top = (r.bottom + 6) + 'px';
      const ph = popover.offsetHeight;
      let top = r.bottom + 6;
      if (top + ph > window.innerHeight - 8) { const up = r.top - ph - 6; if (up > 8) top = up; }
      popover.style.top = Math.max(8, top) + 'px';
    }

    function open() {
      normalize();
      popover.hidden = false;
      trigger.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      if (searchInput) { searchInput.value = ''; filter(''); setTimeout(() => searchInput.focus({ preventScroll: true }), 0); }
      else { itemsOf().forEach((i) => { i.hidden = false; }); }
      setActive(itemsOf().find((i) => i.classList.contains('is-selected')) || firstVisible());
      position();
      document.addEventListener('mousedown', onOutside, true);
      window.addEventListener('resize', position);
      window.addEventListener('scroll', position, true);
    }
    function close() {
      popover.hidden = true;
      trigger.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('mousedown', onOutside, true);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    }
    function onOutside(e) { if (!root.contains(e.target) && !popover.contains(e.target)) close(); }

    function visibleItems() { return itemsOf().filter((i) => !i.hidden); }
    function firstVisible() { return visibleItems()[0] || null; }

    function setActive(el) {
      itemsOf().forEach((i) => i.classList.remove('is-active'));
      active = el && !el.hidden ? el : null;
      if (active) { active.classList.add('is-active'); active.scrollIntoView({ block: 'nearest' }); }
    }
    function moveActive(dir) {
      const vis = visibleItems();
      if (!vis.length) return;
      let pos = vis.indexOf(active);
      pos = (pos + dir + vis.length) % vis.length;
      setActive(vis[pos]);
    }

    function apply(item, silent) {
      itemsOf().forEach((i) => i.classList.remove('is-selected'));
      item.classList.add('is-selected');
      valueEl.textContent = labelOf(item).textContent;
      root.classList.add('has-value');
      if (!silent) root.dispatchEvent(new CustomEvent('change', { detail: { value: item.dataset.value || labelOf(item).textContent.trim(), label: valueEl.textContent } }));
    }
    function select(item) {
      apply(item, false);
      close();
      trigger.focus({ preventScroll: true });
    }

    // Programmatic selection (items live in a body-portaled popover, so callers
    // can't reach them through the root). silent=true skips the change event.
    root.setValue = function (value, silent) {
      normalize();
      const it = itemsOf().find((i) => (i.dataset.value || labelOf(i).textContent.trim()) === value);
      if (it) apply(it, silent);
    };
    // Callers that repopulate .combobox-list can re-run item normalization.
    root.refreshItems = function () { normalize(); };

    function filter(q) {
      q = (q || '').trim().toLowerCase();
      let anyVisible = false;
      itemsOf().forEach((it) => {
        const match = !q || labelOf(it).textContent.toLowerCase().includes(q);
        it.hidden = !match;
        if (match) anyVisible = true;
      });
      // group labels: hide if no visible items follow before next label
      popover.querySelectorAll('.combobox-group-label').forEach((lbl) => {
        let el = lbl.nextElementSibling, show = false;
        while (el && !el.classList.contains('combobox-group-label')) {
          if (el.classList.contains('combobox-item') && !el.hidden) { show = true; break; }
          el = el.nextElementSibling;
        }
        lbl.hidden = !show;
      });
      emptyEl.hidden = anyVisible;
      setActive(firstVisible());
    }

    trigger.addEventListener('click', () => { popover.hidden ? open() : close(); });
    trigger.addEventListener('keydown', (e) => {
      if (popover.hidden) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); }
        return;
      }
      // Open + no search field (Select): navigate from the trigger itself
      if (!searchInput) {
        if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (active) select(active); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
      }
    });
    // Delegated so items injected later work without re-binding.
    popover.addEventListener('click', (e) => {
      const it = e.target.closest('.combobox-item');
      if (it && popover.contains(it)) select(it);
    });
    popover.addEventListener('mousemove', (e) => {
      const it = e.target.closest('.combobox-item');
      if (it && popover.contains(it)) setActive(it);
    });
    if (searchInput) {
      searchInput.addEventListener('input', () => filter(searchInput.value));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); if (active) select(active); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); trigger.focus(); }
      });
    }
  }

  function initAll(scope) { (scope || document).querySelectorAll('[data-combobox],[data-select]').forEach(init); }
  window.AEDARCombobox = { init, initAll };
  window.__CB_SEARCH_SVG = SEARCH_SVG;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAll());
  else initAll();
})();
