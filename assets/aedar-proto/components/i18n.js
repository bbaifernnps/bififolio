/* ==================================================================
   AEDAR — menu/chrome language switch (TH ⇄ EN)
   Scope: navigation, account menu and page chrome only. Device data,
   org names and alert content stay as reported by the system.

   Markup: data-i18n="key" swaps textContent, data-i18n-ph="key" swaps
   an input placeholder, data-i18n-title="key" swaps the title attr.
   State lives in localStorage('aedar_lang'); every change fires the
   'aedar:lang' window event so open pages resync.
================================================================== */
(function () {
  const KEY = 'aedar_lang';
  const DICT = {
    en: {
      'nav.dashboard': 'Dashboard', 'nav.orgchart': 'Org chart', 'nav.alerts': 'Alerts', 'nav.users': 'Users',
      'menu.profile': 'Profile & settings', 'menu.language': 'Language', 'menu.logout': 'Log out',
      'cpnav.customers': 'Customers', 'cpnav.orgchart': 'Org chart', 'cpnav.roles': 'Roles',
      'cpnav.inventory': 'Devices', 'cpnav.provisioning': 'User management',
      'cpmenu.profile': 'Profile',
      'scope.search': 'Search groups / places…',
      'page.dashboard.title': 'Device overview', 'page.dashboard.updated': 'updated 2 min ago',
      'page.orgchart.title': 'Org chart', 'page.orgchart.sub': 'groups & sub-groups you can monitor',
      'page.alerts.title': 'Alerts', 'page.users.title': 'Users',
      'page.account.title': 'Account', 'page.account.sub': 'Manage your profile, language and security.',
      'acct.language': 'Language', 'acct.language.desc': 'Applies to menus and page labels. Device data stays as reported.',
      'toast.lang': 'Language set to English',
    },
    th: {
      'nav.dashboard': 'ภาพรวมเครื่อง', 'nav.orgchart': 'ผังองค์กร', 'nav.alerts': 'การแจ้งเตือน', 'nav.users': 'ผู้ใช้งาน',
      'menu.profile': 'โปรไฟล์และตั้งค่า', 'menu.language': 'ภาษา', 'menu.logout': 'ออกจากระบบ',
      'cpnav.customers': 'ลูกค้า', 'cpnav.orgchart': 'ผังองค์กร', 'cpnav.roles': 'สิททิ์การใช้งาน',
      'cpnav.inventory': 'คลังเครื่อง', 'cpnav.provisioning': 'จัดการผู้ใช้งาน',
      'cpmenu.profile': 'โปรไฟล์',
      'scope.search': 'ค้นหากลุ่ม / สถานที่…',
      'page.dashboard.title': 'ภาพรวมเครื่อง AED', 'page.dashboard.updated': 'อัปเดต 2 นาทีที่แล้ว',
      'page.orgchart.title': 'ผังองค์กร', 'page.orgchart.sub': 'กลุ่มและกลุ่มย่อยที่คุณดูแลได้',
      'page.alerts.title': 'การแจ้งเตือน', 'page.users.title': 'ผู้ใช้งาน',
      'page.account.title': 'บัญชีผู้ใช้', 'page.account.sub': 'จัดการโปรไฟล์ ภาษา และความปลอดภัย',
      'acct.language': 'ภาษา', 'acct.language.desc': 'มีผลกับเมนูและหัวข้อในหน้าจอ ข้อมูลเครื่องยังแสดงตามระบบ',
      'toast.lang': 'เปลี่ยนภาษาเป็นไทยแล้ว',
    },
  };
  const LANGS = [{ id: 'th', label: 'ไทย', sub: 'Thai' }, { id: 'en', label: 'English', sub: 'อังกฤษ' }];

  function get() { return localStorage.getItem(KEY) === 'th' ? 'th' : 'en'; }
  function t(key, lang) { const l = lang || get(); return (DICT[l] && DICT[l][key]) || DICT.en[key] || key; }
  function apply(root) {
    const lang = get(), scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n'), lang); });
    scope.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-ph'), lang); });
    scope.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.getAttribute('data-i18n-title'), lang); });
    if (!root) document.documentElement.lang = lang;
  }
  function set(lang, opts) {
    const next = lang === 'th' ? 'th' : 'en';
    if (next === get() && !(opts && opts.force)) return;
    localStorage.setItem(KEY, next);
    apply();
    window.dispatchEvent(new CustomEvent('aedar:lang', { detail: { value: next } }));
    if (!(opts && opts.silent) && window.AEDARToast) AEDARToast.show({ title: t('toast.lang', next) });
  }
  window.AEDARi18n = { get, set, t, apply, LANGS, label: (id) => (LANGS.find(l => l.id === id) || LANGS[0]).label };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => apply());
  else apply();
})();
