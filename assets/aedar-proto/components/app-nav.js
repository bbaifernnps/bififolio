/* ==================================================================
   AEDAR Customer App — top nav injector
   Usage: <div data-app-nav data-active="dashboard" data-scope="Province A · District 1"></div>
   Renders the shared shell (logo + org-node scope + primary nav +
   bell + avatar menu) into the placeholder, then wires combobox+menu.
   Requires combobox.js + menu.js loaded (this file loads them if absent).
================================================================== */
(function () {
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', key: 'nav.dashboard', href: 'Dashboard.html', icon: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>' },
    { id: 'orgchart', label: 'Org chart', key: 'nav.orgchart', href: 'OrgChart.html', icon: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-2h14v2"/>' },
    { id: 'alerts', label: 'Alerts', key: 'nav.alerts', href: 'Alerts.html', icon: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>', count: 3 },
    { id: 'users', label: 'Users', key: 'nav.users', href: 'Users.html', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>' },
  ];
  const svg = (inner, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  function render(host) {
    const active = host.getAttribute('data-active') || '';
    const scopeVal = sessionStorage.getItem('aedar_scope') || 'all';
    const scopeLabel = window.AEDAR_groupLabel ? window.AEDAR_groupLabel(scopeVal) : (host.getAttribute('data-scope') || 'ทั้งหมด');
    // Language lives in the account menu as a two-option pick with a check on
    // the current one — the same switch as Account ▸ Language (shared state).
    const i18n = window.AEDARi18n;
    const GLOBE = svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>');
    // One row: label + a TH/EN pill so it reads as switchable at a glance.
    const langItems = i18n ? `
      <div class="menu-item" data-action="lang" role="button" tabindex="0">${GLOBE}<span class="menu-item-label" data-i18n="menu.language">Language</span>
        <span class="menu-lang-seg">${i18n.LANGS.map(l => `<span data-lang="${l.id}">${l.id.toUpperCase()}</span>`).join('')}</span></div>` : '';
    const navItems = NAV.map((n) => `
      <a class="nav-item${n.id === active ? ' active' : ''}" href="${n.href}">${svg(n.icon)}<span data-i18n="${n.key}">${n.label}</span>${n.count ? ` <span class="badge-count is-destructive" style="min-width:18px;height:18px;font-size:10px;">${n.count}</span>` : ''}</a>`).join('');
    host.innerHTML = `
    <div class="appbar">
      <a class="appbar-brand" href="Dashboard.html"><img class="appbar-logo" src="../components/assets/healix-wordmark.svg" alt="Healix" /></a>
      <div class="scope-divider"></div>
      <div class="scope-slot">
        <div class="combobox has-value" data-combobox>
          <button type="button" class="combobox-trigger" aria-haspopup="listbox">
            <svg style="width:16px;height:16px;color:var(--colors-light-muted-foreground);flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            <span class="combobox-value">${scopeLabel}</span>
            <svg class="combobox-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg>
          </button>
          <div class="combobox-popover" hidden>
            <div class="combobox-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="combobox-search-input" data-i18n-ph="scope.search" placeholder="Search groups / places…" /></div>
            <div class="combobox-list" role="listbox">${window.AEDAR_groupOptionsHTML ? window.AEDAR_groupOptionsHTML(scopeVal) : ''}</div>
          </div>
        </div>
      </div>
      <nav class="appbar-nav">${navItems}</nav>
      <span class="appbar-spacer"></span>
      <div class="appbar-right">
        <div data-menu style="position:relative;">
          <button class="avatar menu-trigger" aria-label="Account">อร</button>
          <div class="menu-popover" hidden>
            <div class="menu-label">อรุณี · Org Admin</div>
            <a class="menu-item" href="Profile.html">${svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')}<span class="menu-item-label" data-i18n="menu.profile">Profile &amp; settings</span></a>
            <div class="menu-sep"></div>
            ${langItems}
            <div class="menu-sep"></div>
            <a class="menu-item is-destructive" href="Login.html">${svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>')}<span class="menu-item-label" data-i18n="menu.logout">Log out</span></a>
          </div>
        </div>
      </div>
    </div>`;
    // Capture the language rows BEFORE menu.js portals the popover to <body>;
    // the element refs stay valid after the move, so the menu updates in place
    // on a language change (re-rendering the nav would orphan the popover).
    const langEls = i18n ? [...host.querySelectorAll('[data-action="lang"]')] : [];
    if (window.AEDARCombobox) window.AEDARCombobox.initAll(host);
    if (window.AEDARMenu) window.AEDARMenu.initAll(host);
    if (i18n) {
      const syncLang = () => langEls.forEach(el =>
        el.querySelectorAll('.menu-lang-seg span').forEach(s =>
          s.classList.toggle('on', s.dataset.lang === i18n.get())));
      langEls.forEach(el => el.addEventListener('click', (e) => {
        e.stopPropagation();                     // keep the menu open to show the switch move
        const picked = e.target.closest('[data-lang]');
        i18n.set(picked ? picked.dataset.lang : (i18n.get() === 'th' ? 'en' : 'th'));
      }));
      window.addEventListener('aedar:lang', () => { i18n.apply(); syncLang(); });
      i18n.apply();
      syncLang();
    }
    // Broadcast scope changes so the current page (e.g. Dashboard) can re-filter,
    // and persist so the selection carries across pages.
    const scopeCb = host.querySelector('.scope-slot .combobox');
    if (scopeCb) scopeCb.addEventListener('change', (e) => {
      sessionStorage.setItem('aedar_scope', e.detail.value);
      window.dispatchEvent(new CustomEvent('aedar:scope', { detail: e.detail }));
    });
  }

  function boot() {
    document.querySelectorAll('[data-app-nav]').forEach(render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
