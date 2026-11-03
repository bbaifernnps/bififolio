/* AEDAR Control Plane — shared device pool (mock).
   Single source for Inventory rows and the Customers page tiles. */
window.AEDAR_CP_UNITS = [
  { sn: 'AED8899231201', pads: '2028-03-31', battery: 88, model: 'F2', cust: 'Province A', group: 'Hospital A' },
  { sn: 'AED8899231202', pads: '2026-09-30', battery: 62, model: 'F2', cust: 'Province A', group: 'Hospital A' },
  { sn: 'AED8899231203', pads: '2026-06-30', battery: 31, model: 'C2', cust: 'Province A', group: 'School A' },
  { sn: 'AED8899231288', pads: '2029-01-31', battery: 95, model: 'C2', cust: 'Province A', group: 'Hospital C' },
  { sn: 'AED8899231302', pads: '2027-11-30', battery: 74, model: 'C2', cust: 'Province A', group: 'Hospital D' },
  { sn: 'AED8899231320', pads: '2026-10-15', battery: 91, model: 'F2', cust: 'Province B', group: 'Hospital E' },
  { sn: 'AED8899231321', pads: '2028-07-31', battery: 57, model: 'C2', cust: 'Province B', group: 'Hospital E' },
  { sn: 'AED8899231322', pads: '2026-04-30', battery: 83, model: 'F2', cust: 'Province B', group: 'Hospital F' },
  { sn: 'AED8899231390', pads: '2029-06-30', battery: 100, model: 'F2', cust: 'Province C', group: 'Hospital G' },
  { sn: 'AED8899231410', pads: '2029-08-31', battery: 100, model: 'F2', cust: '', group: '' },
  { sn: 'AED8899231411', pads: '2029-08-31', battery: 100, model: 'F2', cust: '', group: '' },
  { sn: 'AED8899231412', pads: '2029-05-31', battery: 100, model: 'C2', cust: '', group: '' },
  { sn: 'AED8899231413', pads: '2029-08-31', battery: 100, model: 'F2', cust: '', group: '' },
  { sn: 'AED8899231414', pads: '2029-05-31', battery: 100, model: 'C2', cust: '', group: '' },
];
window.AEDAR_CP_CUST_KEY = { cmi: 'Province A', cri: 'Province B', pkt: 'Province C' };
window.AEDAR_CP_GROUPS = {
  'Province A': ['Hospital A', 'Hospital B', 'School A', 'City Hall', 'Hospital C', 'University A', 'Hospital D', 'Shopping Mall A'],
  'Province B': ['Hospital E', 'University B', 'Hospital F'],
  'Province C': ['Hospital G'],
};
/* Group hierarchy per customer (mirrors the org chart): mother group (district)
   → sub-groups (sites). Devices and users are homed on a sub-group name, so a
   district filter matches any of its sub-groups. */
window.AEDAR_CP_GROUP_TREE = {
  'Province A': [
    { site: 'District 1', nodes: ['Hospital A', 'Hospital B', 'School A', 'City Hall'] },
    { site: 'District 2', nodes: ['Hospital C', 'University A'] },
    { site: 'District 3', nodes: ['Hospital D', 'Shopping Mall A'] },
  ],
  'Province B': [
    { site: 'District 5', nodes: ['Hospital E', 'University B'] },
    { site: 'District 4', nodes: ['Hospital F'] },
  ],
  'Province C': [
    { site: 'District 6', nodes: ['Hospital G'] },
  ],
};
window.AEDAR_CP_FOLDER_ICO = '<svg class="tree-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7L9 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>';
/* Filter list for one customer: "All groups", then each district and its sub-groups. */
window.AEDAR_CP_groupOptionsHTML = function (custShort) {
  const tree = window.AEDAR_CP_GROUP_TREE[custShort] || [];
  const ico = window.AEDAR_CP_FOLDER_ICO;
  return '<div class="combobox-item is-selected" data-value="all"><span class="combobox-item-label">All groups</span></div>' +
    tree.map((g) => '<div class="combobox-item lvl-1" data-value="site:' + g.site + '">' + ico + '<span class="combobox-item-label">' + g.site + '</span></div>' +
      g.nodes.map((n) => '<div class="combobox-item lvl-2" data-value="node:' + n + '"><span class="combobox-item-label">' + n + '</span></div>').join('')).join('');
};
/* Does a row homed at `group` belong to the picked filter value? */
window.AEDAR_CP_groupMatch = function (filter, group, custShort) {
  if (!filter || filter === 'all') return true;
  if (filter.startsWith('node:')) return group === filter.slice(5);
  const site = filter.slice(5);
  const g = (window.AEDAR_CP_GROUP_TREE[custShort] || []).find((x) => x.site === site);
  return !!g && g.nodes.includes(group);
};
window.AEDAR_CP_groupLabel = function (filter) {
  if (!filter || filter === 'all') return 'All groups';
  return filter.slice(5);
};
window.AEDAR_CP_ROLES = {
  'Province A': ['Org Admin', 'Editor', 'Maintainer', 'Viewer', 'Ward Supervisor'],
  'Province B': ['Org Admin', 'Editor', 'Maintainer', 'Viewer'],
  'Province C': ['Org Admin', 'Editor', 'Maintainer', 'Viewer'],
};

/* Electrode pads have a hard shelf life — a unit with expired pads is not
   rescue-ready even at 100% battery. 90 days is the reorder lead time. */
window.AEDAR_PAD_SOON_DAYS = 90;
window.AEDAR_padStatus = function (iso) {
  if (!iso) return { state: 'unknown', days: null, label: 'Not set', sub: 'add expiry date', color: 'var(--colors-light-muted-foreground)' };
  const days = Math.round((new Date(iso + 'T00:00:00') - new Date(new Date().toDateString())) / 86400000);
  const dt = new Date(iso + 'T00:00:00');
  const label = String(dt.getMonth() + 1).padStart(2, '0') + '/' + dt.getFullYear();
  if (days < 0) return { state: 'expired', days, label, sub: 'expired', color: 'var(--battery-critical)' };
  const mo = Math.round(days / 30);
  const sub = days < 45 ? 'in ' + days + ' days' : 'in ' + mo + ' mo';
  if (days <= window.AEDAR_PAD_SOON_DAYS) return { state: 'soon', days, label, sub, color: 'var(--status-warning)' };
  return { state: 'ok', days, label, sub, color: 'var(--colors-light-foreground)' };
};
window.AEDAR_padDue = (u) => { const s = window.AEDAR_padStatus(u.pads); return s.state === 'expired' || s.state === 'soon'; };
