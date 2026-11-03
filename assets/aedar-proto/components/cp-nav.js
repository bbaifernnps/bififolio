/* ==================================================================
   AEDAR Control Plane — top nav injector (MediGrowth internal)
   Usage: <div data-cp-nav data-active="customers" data-cp-mode="mg"></div>

   TWO MODES (data-cp-mode, read once at load):
     mg       — MediGrowth/internal. Scope is always "all customers", so
                there is NO customer switcher. Dark inverted bar.
     customer — one client at a time. Customer switcher WITHOUT the
                "all" option; light bar.
     (absent) — legacy single-mode bar: switcher incl. "all", every page.
   The far-right segmented control jumps between the two mode folders.
================================================================== */
(function () {
  const HOST0 = document.querySelector('[data-cp-nav]');
  const MODE = (HOST0 && HOST0.getAttribute('data-cp-mode')) || 'legacy';
  const MODES = {
    mg: { home: 'Customers.html', other: '../control-plane-customer/OrgChart.html' },
    customer: { home: 'OrgChart.html', other: '../control-plane-medigrowth/Customers.html' },
  };
  // Shared customer scope: persisted so the pick carries across CP pages, and
  // broadcast as 'aedar:customer' so each page re-filters (mirrors the
  // customer app's aedar:scope).
  const CUSTOMERS = [
    { id: 'all', label: 'All customers', short: 'all' },
    { id: 'cmi', label: 'โครงการ AED Province A', short: 'Province A' },
    { id: 'cri', label: 'โครงการ AED Province B', short: 'Province B' },
    { id: 'pkt', label: 'โครงการ AED Province C', short: 'Province C' },
  ];
  const Scope = window.AEDARCPScope = {
    CUSTOMERS,
    MODE,
    get() {
      if (MODE === 'mg') return 'all';
      const v = sessionStorage.getItem('aedar_cp_customer') || 'all';
      // Customer view is always scoped to exactly one client.
      if (MODE === 'customer' && (v === 'all' || !CUSTOMERS.some((c) => c.id === v))) return CUSTOMERS[1].id;
      return v;
    },
    find(id) { return CUSTOMERS.find(c => c.id === (id || Scope.get())) || CUSTOMERS[0]; },
    label(id) { return Scope.find(id).label; },
    short(id) { return Scope.find(id).short; },
    set(id) {
      sessionStorage.setItem('aedar_cp_customer', id);
      Scope.paint();
      window.dispatchEvent(new CustomEvent('aedar:customer', { detail: { value: id, label: Scope.label(id), short: Scope.short(id) } }));
    },
    // Any [data-cp-scope-label] on a page shows the current customer.
    paint() {
      const c = Scope.find();
      document.querySelectorAll('[data-cp-scope-label]').forEach(el => { el.textContent = c.label; });
      document.querySelectorAll('.scope-slot .combobox').forEach(cb => {
        const v = cb.querySelector('.combobox-value');
        if (v) v.textContent = c.label;
        cb.querySelectorAll('.combobox-item').forEach(i => i.classList.toggle('is-selected', i.dataset.value === c.id));
      });
    },
  };
  const NAV = [
    { id: 'customers', label: 'Customers', href: 'Customers.html', icon: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>' },
    { id: 'orgchart', label: 'Org chart', href: 'OrgChart.html', icon: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-2h14v2"/>' },
    { id: 'roles', label: 'Roles', href: 'Roles.html', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
    { id: 'inventory', label: 'Devices', href: 'Inventory.html', icon: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>' },
    { id: 'provisioning', label: 'User management', href: 'Provisioning.html', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>' },
  ];
  const NAV_BY_MODE = {
    mg: ['customers', 'roles', 'inventory', 'provisioning'],
    customer: ['orgchart', 'roles', 'inventory', 'provisioning'],
  };
  const svg = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  function render(host) {
    const active = host.getAttribute('data-active') || '';
    const selId = Scope.get();
    const customer = Scope.label(selId);
    const allowed = NAV_BY_MODE[MODE];
    const navItems = NAV.filter((n) => !allowed || allowed.includes(n.id))
      .map((n) => `<a class="nav-item${n.id === active ? ' active' : ''}" href="${n.href}">${svg(n.icon)}<span data-i18n="cpnav.${n.id}">${n.label}</span></a>`).join('');
    // Same one-row TH/EN switch as the customer app, on the same shared state.
    const i18n = window.AEDARi18n;
    const langRow = i18n ? `
            <div class="menu-item" data-action="lang" role="button" tabindex="0">${svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>')}<span class="menu-item-label" data-i18n="menu.language">Language</span>
              <span class="menu-lang-seg">${i18n.LANGS.map(l => `<span data-lang="${l.id}">${l.id.toUpperCase()}</span>`).join('')}</span></div>` : '';
    const allRow = MODE === 'customer' ? '' :
      `<div class="combobox-item${selId === 'all' ? ' is-selected' : ''}" data-value="all">All customers</div>`;
    // MediGrowth view is fixed to every customer at once — no switcher.
    const switcher = MODE === 'mg' ? '' : `
      <div class="scope-divider"></div>
      <div class="scope-slot wide">
        <div class="combobox has-value" data-combobox>
          <button type="button" class="combobox-trigger" aria-haspopup="listbox">
            <svg style="width:16px;height:16px;color:var(--colors-light-muted-foreground);flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM10 6h4M10 10h4M10 14h4M10 18h4"/></svg>
            <span class="combobox-value">${customer}</span>
            <svg class="combobox-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg>
          </button>
          <div class="combobox-popover" hidden>
            <div class="combobox-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="combobox-search-input" placeholder="Switch customer…" /></div>
            <div class="combobox-list" role="listbox">
              ${allRow}
              <div class="combobox-group-label">Customers · ${CUSTOMERS.length - 1}</div>
              ${CUSTOMERS.slice(1).map(c => `<div class="combobox-item${selId === c.id ? ' is-selected' : ''}" data-value="${c.id}">${c.label}</div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
    const M = MODES[MODE];
    const modeSeg = M ? `
        <div class="mode-seg" data-on="${MODE}">
          <span class="mode-thumb"></span>
          <a class="mode-opt${MODE === 'mg' ? ' is-on' : ''}" data-mode="mg" href="${MODE === 'mg' ? M.home : M.other}">MediGrowth</a>
          <a class="mode-opt${MODE === 'customer' ? ' is-on' : ''}" data-mode="customer" href="${MODE === 'customer' ? M.home : M.other}">Customer</a>
        </div>` : '';
    host.innerHTML = `
    <div class="appbar${MODE === 'mg' ? ' is-mg' : ''}">
      <a class="appbar-brand" href="${M ? M.home : 'Customers.html'}"><img class="appbar-logo" src="../components/assets/healix-wordmark.svg" alt="Healix" /><span class="cp-badge">${MODE === 'customer' ? 'Customer view' : 'Control Plane'}</span></a>
      ${switcher}
      <nav class="appbar-nav">${navItems}</nav>
      <span class="appbar-spacer"></span>
      <div class="appbar-right">
        ${modeSeg}
        <span class="bell-wrap"><button class="btn btn-ghost btn-icon" aria-label="Notifications">${svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>')}</button></span>
        <div data-menu style="position:relative;">
          <button class="avatar sq menu-trigger" aria-label="Account">MG</button>
          <div class="menu-popover" hidden>
            <div class="menu-label">MediGrowth · Super Admin</div>
            <div class="menu-item" data-action="profile">${svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')}<span class="menu-item-label" data-i18n="menu.profile">Profile &amp; settings</span></div>
            <div class="menu-sep"></div>
            ${langRow}
            <div class="menu-sep"></div>
            <a class="menu-item is-destructive" href="Login.html">${svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>')}<span class="menu-item-label" data-i18n="menu.logout">Log out</span></a>
          </div>
        </div>
      </div>
    </div>`;
    // Captured before menu.js portals the popover to <body> so the row can be
    // updated in place instead of re-rendering the bar.
    const langEls = i18n ? [...host.querySelectorAll('[data-action="lang"]')] : [];
    if (window.AEDARCombobox) window.AEDARCombobox.initAll(host);
    if (window.AEDARMenu) window.AEDARMenu.initAll(host);
    if (i18n) {
      const syncLang = () => langEls.forEach(el =>
        el.querySelectorAll('.menu-lang-seg span').forEach(s =>
          s.classList.toggle('on', s.dataset.lang === i18n.get())));
      langEls.forEach(el => el.addEventListener('click', (e) => {
        e.stopPropagation();
        const picked = e.target.closest('[data-lang]');
        i18n.set(picked ? picked.dataset.lang : (i18n.get() === 'th' ? 'en' : 'th'));
      }));
      window.addEventListener('aedar:lang', () => { i18n.apply(); syncLang(); });
      i18n.apply();
      syncLang();
    }
    // Mode switch: slide the thumb and cross-fade the bar first, then navigate,
    // so the change reads as one continuous motion across the page load.
    const seg = host.querySelector('.mode-seg');
    if (seg) seg.addEventListener('click', (e) => {
      const opt = e.target.closest('.mode-opt');
      if (!opt || opt.classList.contains('is-on')) return;
      e.preventDefault();
      const next = opt.dataset.mode;
      seg.dataset.on = next;
      seg.querySelectorAll('.mode-opt').forEach(o => o.classList.toggle('is-on', o === opt));
      const bar = host.querySelector('.appbar');
      bar.classList.toggle('is-mg', next === 'mg');
      // The customer switcher only exists in Customer view, so animate the slot
      // out (or a stand-in slot in) — the nav then glides to where it will sit
      // on the page we are about to load instead of jumping there.
      if (next === 'mg') {
        host.querySelectorAll('.scope-divider, .scope-slot').forEach(el => el.classList.add('slot-collapsed'));
      } else {
        const navEl = bar.querySelector('.appbar-nav');
        ['scope-divider', 'scope-slot wide'].forEach(cls => {
          const ghost = document.createElement('div');
          ghost.className = cls + ' slot-collapsed';
          bar.insertBefore(ghost, navEl);
          requestAnimationFrame(() => requestAnimationFrame(() => ghost.classList.remove('slot-collapsed')));
        });
      }
      setTimeout(() => { location.href = opt.getAttribute('href'); }, 260);
    });
    const scopeCb = host.querySelector('.scope-slot .combobox');
    if (scopeCb) scopeCb.addEventListener('change', (e) => Scope.set(e.detail.value));
  }
  function boot() { document.querySelectorAll('[data-cp-nav]').forEach(render); Scope.paint(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
