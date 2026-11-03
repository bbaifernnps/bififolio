/* Shared AEDAR device dataset — used by Dashboard, Devices, Map, Detail.
   Telemetry fields mirror the AED external API (AED list): sn, model,
   netstatus, longitude/latitude (WGS-84), battery, batterytimes,
   electricexpiretime, simcardexpiretime, firstaidtimes, lastreport,
   nettype, netsignal. Customer-editable soft data: name + install address.
   Org model (public-access AEDs across a province):
     Province A  →  เขต/อำเภอ (site)  →  โรงพยาบาล·โรงเรียน·สถานที่ (node)  →  AED */
window.AEDAR_DEVICES = [
  { sn: 'AED8899231201', name: 'AED — ห้องฉุกเฉิน', site: 'District 1', node: 'Hospital A', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'operational', battery: 96, batterytimes: 1, electrodeExp: '2027-03-31', simExp: '2026-11-30', rescues: 2, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -71, lat: 18.7901, lng: 98.9860, seen: '2 min ago', seenv: 2, x: 24, y: 32 },
  { sn: 'AED8899231202', name: 'AED — OPD ชั้น 1', site: 'District 1', node: 'Hospital A', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'operational', battery: 88, batterytimes: 2, electrodeExp: '2027-01-15', simExp: '2026-11-30', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -78, lat: 18.7906, lng: 98.9866, seen: '4 min ago', seenv: 4, x: 32, y: 44 },
  { sn: 'AED8899231203', name: 'AED — อาคารเรียน 1', site: 'District 1', node: 'School A', address: 'Main Rd. District 1 Province A', model: 'C2', status: 'warning', battery: 34, batterytimes: 3, electrodeExp: '2026-08-10', simExp: '2026-10-01', rescues: 1, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -95, lat: 18.7889, lng: 98.9925, seen: '6 min ago', seenv: 6, x: 18, y: 56 },
  { sn: 'AED8899231204', name: 'AED — ICU', site: 'District 1', node: 'Hospital B', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'operational', battery: 72, batterytimes: 1, electrodeExp: '2027-05-20', simExp: '2027-02-28', rescues: 0, lastReport: '2026-07-06 06:00', nettype: 'WIFI', netsignal: -60, lat: 18.7896, lng: 98.9730, seen: '3 min ago', seenv: 3, x: 40, y: 30 },
  { sn: 'AED8899231288', name: 'AED — ห้องฉุกเฉิน', site: 'District 2', node: 'Hospital C', address: 'ถ.Province A-พร้าว District 2 Province A', model: 'C2', status: 'in-use', battery: 61, batterytimes: 2, electrodeExp: '2027-02-01', simExp: '2026-12-15', rescues: 4, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -82, lat: 18.8760, lng: 99.0330, seen: 'now', seenv: 0, x: 66, y: 38 },
  { sn: 'AED8899231289', name: 'AED — วอร์ด 3', site: 'District 2', node: 'Hospital C', address: 'ถ.Province A-พร้าว District 2 Province A', model: 'F2', status: 'operational', battery: 90, batterytimes: 1, electrodeExp: '2027-04-10', simExp: '2027-01-20', rescues: 1, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -69, lat: 18.8764, lng: 99.0336, seen: '1 min ago', seenv: 1, x: 72, y: 46 },
  { sn: 'AED8899231302', name: 'AED — ห้องกายภาพบำบัด', site: 'District 3', node: 'Hospital D', address: 'ถ.Province A-ฮอด District 3 Province A', model: 'C2', status: 'offline', battery: 0, batterytimes: 2, electrodeExp: '2026-09-01', simExp: '2026-09-01', rescues: 0, lastReport: '2026-07-04 06:00', nettype: null, netsignal: null, lat: 18.6900, lng: 98.9200, seen: '2 days ago', seenv: 2880, x: 54, y: 72 },
  { sn: 'AED8899231303', name: 'AED — ห้องฉุกเฉิน', site: 'District 3', node: 'Hospital D', address: 'ถ.Province A-ฮอด District 3 Province A', model: 'F2', status: 'validate', battery: 100, batterytimes: 0, electrodeExp: '2027-06-30', simExp: '2027-03-31', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -74, lat: 18.6906, lng: 98.9206, seen: '12 min ago', seenv: 12, x: 60, y: 66 },
  { sn: 'AED8899231210', name: 'AED — ล็อบบี้', site: 'District 1', node: 'City Hall', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'operational', battery: 81, batterytimes: 1, electrodeExp: '2027-03-01', simExp: '2026-12-01', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -76, lat: 18.7877, lng: 98.9931, seen: '5 min ago', seenv: 5, x: 28, y: 40 },
  { sn: 'AED8899231211', name: 'AED — โรงอาหาร', site: 'District 1', node: 'School A', address: 'Main Rd. District 1 Province A', model: 'C2', status: 'warning', battery: 22, batterytimes: 4, electrodeExp: '2026-07-25', simExp: '2026-11-30', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -98, lat: 18.7884, lng: 98.9930, seen: '9 min ago', seenv: 9, x: 22, y: 48 },
  { sn: 'AED8899231220', name: 'AED — อาคารกีฬา', site: 'District 2', node: 'University A', address: 'ต.หนองหาร District 2 Province A', model: 'F2', status: 'operational', battery: 67, batterytimes: 2, electrodeExp: '2027-02-18', simExp: '2027-01-05', rescues: 0, lastReport: '2026-07-06 06:00', nettype: 'WIFI', netsignal: -58, lat: 18.8940, lng: 99.0130, seen: '7 min ago', seenv: 7, x: 78, y: 34 },
  { sn: 'AED8899231230', name: 'AED — ชั้น G', site: 'District 3', node: 'Shopping Mall A', address: 'Main Rd. District 3 Province A', model: 'F2', status: 'operational', battery: 94, batterytimes: 1, electrodeExp: '2027-05-01', simExp: '2027-02-10', rescues: 1, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -70, lat: 18.7680, lng: 98.9720, seen: '2 min ago', seenv: 2, x: 58, y: 60 },
  { sn: 'AED8899231231', name: 'AED — ชั้น 3 โซนอาหาร', site: 'District 3', node: 'Shopping Mall A', address: 'Main Rd. District 3 Province A', model: 'C2', status: 'warning', battery: 29, batterytimes: 3, electrodeExp: '2026-08-05', simExp: '2026-12-01', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -91, lat: 18.7684, lng: 98.9726, seen: '8 min ago', seenv: 8, x: 62, y: 64 },
  { sn: 'AED8899231232', name: 'AED — ลานจอดรถ B1', site: 'District 3', node: 'Shopping Mall A', address: 'Main Rd. District 3 Province A', model: 'F2', status: 'operational', battery: 85, batterytimes: 1, electrodeExp: '2027-04-12', simExp: '2027-01-30', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -73, lat: 18.7676, lng: 98.9716, seen: '3 min ago', seenv: 3, x: 56, y: 62 },
  { sn: 'AED8899231205', name: 'AED — ห้องผ่าตัด', site: 'District 1', node: 'Hospital B', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'operational', battery: 78, batterytimes: 2, electrodeExp: '2027-03-18', simExp: '2026-12-20', rescues: 1, lastReport: '2026-07-06 06:00', nettype: 'WIFI', netsignal: -62, lat: 18.7899, lng: 98.9734, seen: '5 min ago', seenv: 5, x: 42, y: 33 },
  { sn: 'AED8899231206', name: 'AED — วอร์ดอายุรกรรม', site: 'District 1', node: 'Hospital B', address: 'Main Rd. District 1 Province A', model: 'C2', status: 'validate', battery: 100, batterytimes: 0, electrodeExp: '2027-06-01', simExp: '2027-03-01', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -80, lat: 18.7893, lng: 98.9727, seen: '11 min ago', seenv: 11, x: 38, y: 28 },
  { sn: 'AED8899231207', name: 'AED — แผนกรังสี', site: 'District 1', node: 'Hospital B', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'offline', battery: 0, batterytimes: 2, electrodeExp: '2026-10-10', simExp: '2026-10-10', rescues: 0, lastReport: '2026-07-03 06:00', nettype: null, netsignal: null, lat: 18.7902, lng: 98.9737, seen: '3 days ago', seenv: 4320, x: 44, y: 36 },
  { sn: 'AED8899231208', name: 'AED — ทางเข้าหลัก', site: 'District 1', node: 'Hospital B', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'operational', battery: 91, batterytimes: 1, electrodeExp: '2027-05-15', simExp: '2027-02-15', rescues: 0, lastReport: '2026-07-06 06:00', nettype: 'WIFI', netsignal: -59, lat: 18.7897, lng: 98.9731, seen: '1 min ago', seenv: 1, x: 40, y: 31 },
  { sn: 'AED8899231212', name: 'AED — สนามฟุตบอล', site: 'District 1', node: 'School A', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'operational', battery: 74, batterytimes: 1, electrodeExp: '2027-01-30', simExp: '2026-11-15', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -84, lat: 18.7892, lng: 98.9928, seen: '10 min ago', seenv: 10, x: 20, y: 52 },
  { sn: 'AED8899231213', name: 'AED — หอประชุม', site: 'District 1', node: 'City Hall', address: 'Main Rd. District 1 Province A', model: 'C2', status: 'operational', battery: 66, batterytimes: 2, electrodeExp: '2027-02-25', simExp: '2026-12-10', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -77, lat: 18.7880, lng: 98.9935, seen: '6 min ago', seenv: 6, x: 30, y: 42 },
  { sn: 'AED8899231290', name: 'AED — ห้องคลอด', site: 'District 2', node: 'Hospital C', address: 'ถ.Province A-พร้าว District 2 Province A', model: 'F2', status: 'warning', battery: 41, batterytimes: 3, electrodeExp: '2026-08-20', simExp: '2026-12-25', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -89, lat: 18.8768, lng: 99.0340, seen: '14 min ago', seenv: 14, x: 70, y: 42 },
  { sn: 'AED8899231291', name: 'AED — แผนกทันตกรรม', site: 'District 2', node: 'Hospital C', address: 'ถ.Province A-พร้าว District 2 Province A', model: 'C2', status: 'operational', battery: 83, batterytimes: 1, electrodeExp: '2027-03-05', simExp: '2027-01-10', rescues: 0, lastReport: '2026-07-06 06:00', nettype: 'WIFI', netsignal: -64, lat: 18.8756, lng: 99.0326, seen: '4 min ago', seenv: 4, x: 68, y: 48 },
  { sn: 'AED8899231221', name: 'AED — หอสมุด', site: 'District 2', node: 'University A', address: 'ต.หนองหาร District 2 Province A', model: 'F2', status: 'operational', battery: 88, batterytimes: 1, electrodeExp: '2027-04-22', simExp: '2027-02-05', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -72, lat: 18.8944, lng: 99.0136, seen: '2 min ago', seenv: 2, x: 80, y: 30 },
  { sn: 'AED8899231222', name: 'AED — อาคารเรียนรวม', site: 'District 2', node: 'University A', address: 'ต.หนองหาร District 2 Province A', model: 'C2', status: 'validate', battery: 100, batterytimes: 0, electrodeExp: '2027-06-15', simExp: '2027-03-20', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -79, lat: 18.8936, lng: 99.0124, seen: '13 min ago', seenv: 13, x: 76, y: 38 },
  { sn: 'AED8899231304', name: 'AED — วอร์ดผู้ป่วยใน', site: 'District 3', node: 'Hospital D', address: 'ถ.Province A-ฮอด District 3 Province A', model: 'F2', status: 'operational', battery: 79, batterytimes: 2, electrodeExp: '2027-02-08', simExp: '2026-12-30', rescues: 1, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -75, lat: 18.6910, lng: 98.9210, seen: '7 min ago', seenv: 7, x: 62, y: 68 },
  { sn: 'AED8899231305', name: 'AED — คลินิกนอกเวลา', site: 'District 3', node: 'Hospital D', address: 'ถ.Province A-ฮอด District 3 Province A', model: 'C2', status: 'warning', battery: 31, batterytimes: 3, electrodeExp: '2026-08-15', simExp: '2026-11-20', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -93, lat: 18.6896, lng: 98.9196, seen: '15 min ago', seenv: 15, x: 56, y: 70 },
  { sn: 'AED8899231240', name: 'AED — ห้องฉุกเฉิน 2', site: 'District 1', node: 'Hospital A', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'operational', battery: 92, batterytimes: 1, electrodeExp: '2027-04-30', simExp: '2027-01-25', rescues: 0, lastReport: '2026-07-06 06:00', nettype: 'WIFI', netsignal: -61, lat: 18.7908, lng: 98.9868, seen: '1 min ago', seenv: 1, x: 26, y: 34 },
  { sn: 'AED8899231241', name: 'AED — วอร์ดกุมารเวช', site: 'District 1', node: 'Hospital A', address: 'Main Rd. District 1 Province A', model: 'C2', status: 'in-use', battery: 55, batterytimes: 2, electrodeExp: '2027-01-05', simExp: '2026-12-05', rescues: 3, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -81, lat: 18.7903, lng: 98.9862, seen: 'now', seenv: 0, x: 30, y: 38 },
  { sn: 'AED8899231242', name: 'AED — จุดคัดกรอง', site: 'District 1', node: 'Hospital A', address: 'Main Rd. District 1 Province A', model: 'F2', status: 'operational', battery: 87, batterytimes: 1, electrodeExp: '2027-03-22', simExp: '2027-02-01', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -68, lat: 18.7899, lng: 98.9858, seen: '3 min ago', seenv: 3, x: 22, y: 36 },
  { sn: 'AED8899231250', name: 'AED — ศูนย์อาหารชั้น 4', site: 'District 3', node: 'Shopping Mall A', address: 'Main Rd. District 3 Province A', model: 'C2', status: 'operational', battery: 70, batterytimes: 2, electrodeExp: '2027-02-14', simExp: '2026-12-18', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -74, lat: 18.7688, lng: 98.9730, seen: '9 min ago', seenv: 9, x: 60, y: 58 },
  { sn: 'AED8899231251', name: 'AED — โซนสำนักงาน', site: 'District 2', node: 'University A', address: 'ต.หนองหาร District 2 Province A', model: 'F2', status: 'offline', battery: 0, batterytimes: 2, electrodeExp: '2026-09-20', simExp: '2026-09-20', rescues: 0, lastReport: '2026-07-02 06:00', nettype: null, netsignal: null, lat: 18.8948, lng: 99.0140, seen: '4 days ago', seenv: 5760, x: 82, y: 36 },
  // District-level AEDs — installed directly on the mother group (no sub-group).
  // The parent's device count is therefore NOT just the sum of its sub-groups.
  { sn: 'AED8899231260', name: 'AED — Old Town Gate', site: 'District 1', node: null, address: 'Old Town Gate District 1 Province A', model: 'F2', status: 'operational', battery: 89, batterytimes: 1, electrodeExp: '2027-05-10', simExp: '2027-02-20', rescues: 1, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -70, lat: 18.7880, lng: 98.9930, seen: '2 min ago', seenv: 2, x: 34, y: 46 },
  { sn: 'AED8899231261', name: 'AED — Public Park', site: 'District 1', node: null, address: 'Public Park District 1 Province A', model: 'C2', status: 'warning', battery: 33, batterytimes: 3, electrodeExp: '2026-08-08', simExp: '2026-11-25', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -92, lat: 18.7830, lng: 98.9880, seen: '10 min ago', seenv: 10, x: 30, y: 54 },
  { sn: 'AED8899231270', name: 'AED — District Office', site: 'District 2', node: null, address: 'District Office District 2 Province A', model: 'F2', status: 'operational', battery: 84, batterytimes: 1, electrodeExp: '2027-03-28', simExp: '2027-01-18', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -73, lat: 18.8770, lng: 99.0320, seen: '5 min ago', seenv: 5, x: 74, y: 40 },
  // Province-level AEDs — homed directly on Province A (no district / no sub-group).
  { sn: 'AED8899231280', name: 'AED — City HallProvince A', site: null, node: null, address: 'City HallProvince A Main Rd. Province A', model: 'F2', status: 'operational', battery: 93, batterytimes: 1, electrodeExp: '2027-05-05', simExp: '2027-02-12', rescues: 0, lastReport: '2026-07-06 06:00', nettype: '4G', netsignal: -68, lat: 18.8470, lng: 98.9720, seen: '3 min ago', seenv: 3, x: 48, y: 22 },
  { sn: 'AED8899231281', name: 'AED — ท่าอากาศยานProvince A', site: null, node: null, address: 'ท่าอากาศยานนานาชาติProvince A District 1 Province A', model: 'F2', status: 'warning', battery: 38, batterytimes: 2, electrodeExp: '2026-08-30', simExp: '2026-12-08', rescues: 1, lastReport: '2026-07-06 06:00', nettype: 'WIFI', netsignal: -63, lat: 18.7669, lng: 98.9626, seen: '6 min ago', seenv: 6, x: 44, y: 58 },
];
// Build the province → district → node group hierarchy from the device list.
// Values: 'all' | 'site:<site>' | 'node:<site>|<node>' — shared by the top-nav
// scope picker and the Dashboard group filter so the two stay in sync.
window.AEDAR_GROUP_FOLDER = '<svg class="tree-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>';
window.AEDAR_PROVINCE = 'Province A';
window.AEDAR_buildGroups = function () {
  const bySite = {}, order = [];
  window.AEDAR_DEVICES.forEach(d => {
    if (!d.site) return;
    if (!bySite[d.site]) { bySite[d.site] = []; order.push(d.site); }
    if (d.node && bySite[d.site].indexOf(d.node) < 0) bySite[d.site].push(d.node);
  });
  const out = [
    { value: 'all', label: 'ทั้งหมด', level: 0 },
    { value: 'province:' + window.AEDAR_PROVINCE, label: window.AEDAR_PROVINCE, level: 1, province: window.AEDAR_PROVINCE },
  ];
  order.forEach(site => {
    out.push({ value: 'site:' + site, label: site, level: 2, site });
    bySite[site].forEach(node => out.push({ value: 'node:' + site + '|' + node, label: node, level: 3, site, node }));
  });
  return out;
};
window.AEDAR_groupOptionsHTML = function (selected) {
  const F = window.AEDAR_GROUP_FOLDER;
  return window.AEDAR_buildGroups().map(o =>
    `<div class="combobox-item${o.level ? ' lvl-' + o.level : ''}${o.value === selected ? ' is-selected' : ''}" data-value="${o.value}">${F}<span class="combobox-item-label">${o.label}</span></div>`
  ).join('');
};
window.AEDAR_groupLabel = function (value) {
  const g = window.AEDAR_buildGroups().find(o => o.value === value);
  return g ? g.label : 'ทั้งหมด';
};
// Display label for a device's home group: node → 'district · node', district → 'district',
// province-direct (no site) → the province name.
window.AEDAR_homeLabel = function (d) {
  return d.node ? d.site + ' · ' + d.node : (d.site || window.AEDAR_PROVINCE);
};

window.AEDAR_STATUS = {
  operational: { cls: 'badge-operational', label: 'Operational' },
  warning:     { cls: 'badge-warning',     label: 'Warning' },
  validate:    { cls: 'badge-validate',    label: 'To validate' },
  'in-use':    { cls: 'badge-in-use',      label: 'In use' },
  offline:     { cls: 'badge-offline',     label: 'Offline' },
};
window.aedarBatteryColor = function (p) {
  if (p === 0) return 'var(--status-offline)';
  if (p <= 35) return 'var(--battery-critical)';
  if (p <= 60) return 'var(--battery-low)';
  return 'var(--battery-good)';
};
/* Minimum guaranteed standby time, derived from the reported battery charge.
   A full AED battery is warranted for 3 years of standby, so the remaining
   guarantee is prorated straight off the percentage (100% = 36 months,
   33% ≈ 1 year). Returns null when there is no reading. */
window.AEDAR_BATTERY_FULL_MONTHS = 36;
window.AEDAR_batteryGuarantee = function (p) {
  if (p == null) return null;
  const months = Math.round(window.AEDAR_BATTERY_FULL_MONTHS * p / 100);
  const y = Math.floor(months / 12), m = months % 12;
  if (months <= 0) return { months: 0, years: 0, rem: 0, short: '0 mo', long: 'no guarantee left' };
  const short = y ? y + ' yr' + (m ? ' ' + m + ' mo' : '') : m + ' mo';
  const long = y ? y + ' year' + (y === 1 ? '' : 's') + (m ? ' ' + m + ' month' + (m === 1 ? '' : 's') : '')
                 : m + ' month' + (m === 1 ? '' : 's');
  return { months, years: y, rem: m, short, long };
};
/* AED map marker (mapkits_aed) — heart shape (currentColor) + white ECG pulse.
   Color via the wrapper's CSS color; sourced from the Figma Vector paths. */
window.aedarMarkerSVG = function () {
  return '<svg viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M 17 11 C 18.49 9.54 20 7.79 20 5.5 C 20 4.041 19.421 2.642 18.389 1.611 C 17.358 0.579 15.959 0 14.5 0 C 12.74 0 11.5 0.5 10 2 C 8.5 0.5 7.26 0 5.5 0 C 4.041 0 2.642 0.579 1.611 1.611 C 0.579 2.642 0 4.041 0 5.5 C 0 7.8 1.5 9.55 3 11 L 10 18 L 13.5 14.5 L 17 11 Z" fill="currentColor"/>' +
    '<path d="M 1.22 9 L 7.5 9 L 8 8 L 10 12.5 L 11 9 L 12 5.5 L 13.5 9 L 18.77 9" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';
};
