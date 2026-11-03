/* Register AED — single + three bulk-entry options (A grid, B paste&map, C serials+shared). */
window.addEventListener('DOMContentLoaded', () => {
  const units = window.AEDAR_CP_UNITS, GROUPS = window.AEDAR_CP_GROUPS || {};
  const CUSTS = Object.keys(GROUPS);
  const $ = (id) => document.getElementById(id);
  const staged = [];
  const norm = (s) => (s || '').trim();
  const known = (sn) => units.some((u) => u.sn === sn);
  const snOK = (sn) => /^AED\d{9,12}$/i.test(sn);
  const custOpts = (blank) => (blank ? '<option value="">' + blank + '</option>' : '') + CUSTS.map((c) => '<option value="' + c + '">โครงการ AED ' + c + '</option>').join('');
  const groupOpts = (cust, blank) => '<option value="">' + (blank || (cust ? 'Select group…' : '—')) + '</option>' + (GROUPS[cust] || []).map((g) => '<option value="' + g + '">' + g + '</option>').join('');
  const CHEV = '<svg class="combobox-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  const SEARCH = '<div class="combobox-search">' + (window.__CB_SEARCH_SVG || '') + '<input class="combobox-search-input" placeholder="Search…" /></div>';
  // One combobox (project component) rendered into a grid cell.
  function cb(k, i, value, items, searchable) {
    const sel = items.find((it) => it.v === value);
    return '<div class="combobox cb-cell' + (value ? ' has-value' : '') + '" data-' + (searchable ? 'combobox' : 'select') + ' data-k="' + k + '" data-i="' + i + '">' +
      '<button type="button" class="combobox-trigger"><span class="combobox-value">' + (sel ? sel.l : items[0].l) + '</span>' + CHEV + '</button>' +
      '<div class="combobox-popover' + (searchable ? '' : ' is-select') + '" data-grid="' + i + '-' + k + '" hidden>' + (searchable ? SEARCH : '') +
      '<div class="combobox-list" role="listbox">' + items.map((it) => '<div class="combobox-item' + (it.v === value ? ' is-selected' : '') + '" data-value="' + it.v + '"><span class="combobox-item-label">' + it.l + '</span></div>').join('') + '</div></div></div>';
  }
  const MODEL_ITEMS = [{ v: 'F2', l: 'F2' }, { v: 'C2', l: 'C2' }];
  const CUST_ITEMS = (blankLabel) => [{ v: '', l: blankLabel }].concat(CUSTS.map((c) => ({ v: c, l: 'โครงการ AED ' + c })));
  const GROUP_ITEMS = (cust) => [{ v: '', l: cust ? 'Select group…' : '—' }].concat((GROUPS[cust] || []).map((g) => ({ v: g, l: g })));

  const poolLbl = () => { $('pool-lbl').textContent = units.length + ' units in the pool'; };
  poolLbl();

  function commit(rows, label) {
    rows.forEach((r) => units.unshift({ sn: r.sn, pads: r.pads || '', battery: 100, model: r.model || 'F2', cust: r.cust || '', group: r.cust ? (r.group || '') : '', site: r.site || '' }));
    poolLbl();
    AEDARToast.show({ variant: 'success', title: rows.length + (rows.length === 1 ? ' device registered' : ' devices registered'), description: label });
  }


  /* ---------- A: spreadsheet grid ---------- */
  const COLS = ['sn', 'model', 'cust', 'group', 'site', 'pads'];
  let rows = [];
  const blank = () => ({ sn: '', model: 'F2', cust: '', group: '', site: '', pads: '' });
  const MAX_ROWS = 100;
  const addRows = (n) => { for (let i = 0; i < n && rows.length < MAX_ROWS; i++) rows.push(blank()); };
  addRows(6);
  function rowWhy(r, i) {
    if (!norm(r.sn)) return '';
    if (known(r.sn)) return 'Already in pool';
    if (rows.some((o, j) => j < i && norm(o.sn) === norm(r.sn))) return 'Duplicate row';
    if (r.cust && !r.group) return 'Pick a group';
    return '';
  }
  function rowState(r, i) {
    if (!norm(r.sn)) return 'empty';
    return rowWhy(r, i) ? 'bad' : 'ready';
  }
  function gridRow(r, i) {
    const st = rowState(r, i);
    const why = rowWhy(r, i);
    return '<tr class="' + st + '" data-i="' + i + '"' + (why ? ' title="' + why + '"' : '') + '>' +
      '<td class="ix">' + (i + 1) + '</td>' +
      '<td><input class="cell mono" data-k="sn" value="' + r.sn + '" placeholder="AED8899231XXX" />' + (why ? '<span class="whytag">' + why + '</span>' : '') + '</td>' +
      '<td>' + cb('model', i, r.model, MODEL_ITEMS, false) + '</td>' +
      '<td>' + cb('cust', i, r.cust, CUST_ITEMS('Unassigned'), true) + '</td>' +
      '<td>' + (r.cust ? cb('group', i, r.group, GROUP_ITEMS(r.cust), true) : '<span class="cell" style="display:block;color:var(--colors-light-muted-foreground)">—</span>') + '</td>' +
      '<td><input class="cell" data-k="site" value="' + r.site + '" placeholder="Installation site" /></td>' +
      '<td><button class="rowdel" data-del="' + i + '" aria-label="Remove row"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></td></tr>';
  }
  // combobox.js fires a non-bubbling 'change' on its root, so bind per root.
  function wireCells(scope) {
    window.AEDARCombobox.initAll(scope);
    scope.querySelectorAll('.cb-cell[data-k]').forEach((root) => root.addEventListener('change', (e) => {
      const i = +root.dataset.i, k = root.dataset.k;
      rows[i][k] = (e.detail && e.detail.value !== undefined) ? e.detail.value : '';
      if (k === 'cust') rows[i].group = '';
      repaintRow(i);
      paintSummary();
    }));
  }
  // Re-render ONE row (a 100-row grid holds ~200 comboboxes; rebuilding them all
  // on every pick makes the page crawl).
  function repaintRow(i) {
    const tr = $('grid-body').querySelector('tr[data-i="' + i + '"]');
    if (!tr) return paintGrid();
    ['model', 'cust', 'group'].forEach((k) => {
      const p = document.querySelector('body > .combobox-popover[data-grid="' + i + '-' + k + '"]');
      if (p) p.remove();
    });
    const tmp = document.createElement('tbody');
    tmp.innerHTML = gridRow(rows[i], i);
    tr.replaceWith(tmp.firstElementChild);
    wireCells($('grid-body').querySelector('tr[data-i="' + i + '"]'));
  }
  function paintGrid(focus) {
    // Comboboxes portal their popover to <body>; clear the previous crop first.
    document.querySelectorAll('body > .combobox-popover[data-grid]').forEach((p) => p.remove());
    $('grid-body').innerHTML = rows.map(gridRow).join('');
    wireCells($('grid-body'));
    paintSummary();
    if (focus) { const el = $('grid-body').querySelector('tr[data-i="' + focus.i + '"] input[data-k="' + focus.k + '"]'); if (el) el.focus(); }
  }
  function paintSummary() {
    const ready = rows.filter((r, i) => rowState(r, i) === 'ready').length;
    const bad = rows.filter((r, i) => rowState(r, i) === 'bad').length;
    $('g-sum').innerHTML = '<b>' + ready + '</b> ready' + (bad ? ' · <b style="color:var(--colors-light-destructive)">' + bad + '</b> ' + (bad === 1 ? 'needs' : 'need') + ' attention' : '') + ' · ' + rows.length + (rows.length === 1 ? ' row' : ' rows');
    $('g-save').disabled = !ready;
    $('g-save').textContent = ready ? 'Register ' + ready + (ready === 1 ? ' device' : ' devices') : 'Register devices';
    // At the cap the add-row affordance IS the error: swap it out and disable it.
    const atMax = rows.length >= MAX_ROWS;
    $('g-add').hidden = atMax;
    $('g-add').disabled = atMax;
    $('g-add-err').hidden = !atMax;
    const al = $('g-alert');
    al.hidden = !bad;
    if (bad) {
      const reasons = [...new Set(rows.map((r, i) => rowWhy(r, i)).filter(Boolean))];
      $('g-alert-txt').textContent = bad + (bad === 1 ? ' row needs' : ' rows need') + ' attention before you can register: ' + reasons.join(' · ') + '. Rows marked in red are skipped.';
    }
  }
  // Typing must not rebuild the row (it would kill an open dropdown or the caret):
  // update the model, then refresh only that row's flag + the footer.
  function refreshRow(i) {
    const tr = $('grid-body').querySelector('tr[data-i="' + i + '"]'); if (!tr) return;
    const why = rowWhy(rows[i], i), st = rowState(rows[i], i);
    tr.className = st;
    if (why) tr.title = why; else tr.removeAttribute('title');
    const cell = tr.querySelector('td:nth-child(2)');
    let tag = cell.querySelector('.whytag');
    if (why && !tag) { tag = document.createElement('span'); tag.className = 'whytag'; cell.appendChild(tag); }
    if (tag) { tag.textContent = why; tag.hidden = !why; }
  }
  $('grid-body').addEventListener('input', (e) => {
    const inp = e.target.closest('input[data-k]'); if (!inp) return;
    const i = +inp.closest('tr').dataset.i;
    rows[i][inp.dataset.k] = inp.value;
    if (inp.dataset.k === 'sn') { rows.forEach((r, n) => refreshRow(n)); paintSummary(); }
  });
  $('grid-body').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const tr = e.target.closest('tr'); if (!tr) return;
    const i = +tr.dataset.i, k = e.target.dataset.k;
    if (i === rows.length - 1) {
      if (rows.length >= MAX_ROWS) return;
      addRows(1);
    }
    paintGrid({ i: i + 1, k });
  });
  $('grid-body').addEventListener('click', (e) => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    rows.splice(+b.dataset.del, 1);
    if (!rows.length) addRows(1);
    paintGrid();
  });
  // Paste a rectangular block from Excel: fills from the focused row down.
  $('grid').addEventListener('paste', (e) => {
    const txt = (e.clipboardData || window.clipboardData).getData('text');
    if (!txt || !/[\t\n,;]/.test(txt)) return;
    e.preventDefault();
    const start = e.target.closest('tr') ? +e.target.closest('tr').dataset.i : 0;
    parseBlock(txt).forEach((cells, n) => {
      const i = start + n;
      if (i >= MAX_ROWS) return;
      if (i >= rows.length) rows.push(blank());
      assign(rows[i], cells);
    });
    paintGrid();
    AEDARToast.show({ variant: 'success', title: 'Pasted', description: parseBlock(txt).length + ' rows filled in.' });
  });
  document.querySelectorAll('#grid .fill').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.fill, v = rows[0][k];
    rows.forEach((r) => { r[k] = v; if (k === 'cust') r.group = rows[0].group; });
    paintGrid();
    AEDARToast.show({ variant: 'success', title: 'Filled down', description: 'Row 1 value applied to all ' + rows.length + ' rows.' });
  }));
  $('g-add').addEventListener('click', () => {
    if (rows.length >= MAX_ROWS) return;
    addRows(1); paintGrid({ i: rows.length - 1, k: 'sn' });
  });
  $('g-reset').addEventListener('click', () => {
    const filled = rows.filter((r) => norm(r.sn) || norm(r.site) || r.cust).length;
    if (!filled) return;
    $('clear-desc').textContent = filled + (filled === 1 ? ' row' : ' rows') + ' will be discarded — nothing has been registered yet. This cannot be undone.';
    window.AEDARDialog.open('dlg-clear');
  });
  $('clear-go').addEventListener('click', () => {
    window.AEDARDialog.close(document.getElementById('dlg-clear'));
    rows = []; addRows(6); $('g-limit').hidden = true; paintGrid();
    AEDARToast.show({ variant: 'error', title: 'Grid cleared', description: 'All rows discarded.' });
  });
  $('g-save').addEventListener('click', () => {
    const ok = rows.filter((r, i) => rowState(r, i) === 'ready');
    if (!ok.length) return;
    // Snapshot the rows to keep BEFORE committing — once the serials are in the
    // pool they would re-test as 'already registered'.
    const keep = rows.filter((r, i) => rowState(r, i) === 'bad');
    commit(ok, ok.length + (ok.length === 1 ? ' serial' : ' serials') + ' added to the pool.');
    rows = keep;
    if (!rows.length) addRows(6);
    paintGrid();
  });

  /* CSV / clipboard parsing */
  const DEFAULT_ORDER = ['sn', 'model', 'cust', 'group', 'site', 'pads'];
  const HEADER_MAP = [[/serial|^sn$/i, 'sn'], [/model/i, 'model'], [/customer|โครงการ|ลูกค้า/i, 'cust'], [/group|กลุ่ม/i, 'group'], [/site|location|installation|จุดติดตั้ง/i, 'site'], [/pad|expiry|electrode|แผ่น/i, 'pads']];
  // Column order for the block just parsed: taken from a header row when there is
  // one, otherwise the template order.
  let curOrder = DEFAULT_ORDER;
  function parseBlock(txt) {
    const lines = txt.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
    let out = lines.map((l) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, '')));
    curOrder = DEFAULT_ORDER;
    const head = out[0];
    const looksHeader = !/^AED/i.test(head[0]) && HEADER_MAP.some(([re]) => head.some((c) => re.test(c)));
    if (looksHeader) {
      curOrder = head.map((c) => { const hit = HEADER_MAP.find(([re]) => re.test(c)); return hit ? hit[1] : null; });
      out = out.slice(1);
    }
    return out;
  }
  function assign(row, cells) {
    const order = curOrder;
    cells.forEach((c, n) => { if (order[n]) row[order[n]] = c; });
    if (row.cust && !CUSTS.includes(row.cust)) { const m = CUSTS.find((k) => row.cust.includes(k)); row.cust = m || ''; }
    if (row.model && !['F2', 'C2'].includes(row.model.toUpperCase())) row.model = 'F2'; else if (row.model) row.model = row.model.toUpperCase();
    if (row.pads) { const d = row.pads.replace(/\//g, '-'); row.pads = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : ''; }
    return row;
  }

  /* ---------- CSV upload straight into the grid ---------- */
  function loadCSV(file) {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      const parsed = parseBlock(String(fr.result || ''));
      if (!parsed.length) return AEDARToast.show({ variant: 'error', title: 'Nothing to import', description: 'That file had no readable rows.' });
      // Fill from the first empty row so existing work is never overwritten.
      let at = rows.findIndex((r) => !norm(r.sn));
      if (at < 0) at = rows.length;
      let skipped = 0;
      parsed.forEach((cells, n) => {
        const i = at + n;
        if (i >= MAX_ROWS) { skipped++; return; }
        if (i >= rows.length) rows.push(blank());
        assign(rows[i], cells);
      });
      paintGrid();
      const firstBad = rows.findIndex((r, i) => rowState(r, i) === 'bad');
      if (firstBad > -1) {
        const tr = $('grid-body').querySelector('tr[data-i="' + firstBad + '"]');
        const wrap = $('grid').closest('.grid-wrap');
        if (tr && wrap) wrap.scrollTop = Math.max(0, tr.offsetTop - 60);
      }
      window.AEDARDialog.close(document.getElementById('dlg-upload'));
      const lim = $('g-limit');
      lim.hidden = !skipped;
      if (skipped) {
        const taken = parsed.length - skipped;
        $('g-limit-title').textContent = 'Only the first ' + taken + ' rows were imported';
        $('g-limit-txt').textContent = file.name + ' had ' + parsed.length + ' rows — a batch holds ' + MAX_ROWS + '. The remaining ' + skipped + (skipped === 1 ? ' row was' : ' rows were') + ' rejected: register this batch, then upload the file again to continue from where it stopped.';
        AEDARToast.show({ variant: 'error', title: 'Row limit reached', description: skipped + (skipped === 1 ? ' row' : ' rows') + ' rejected — batch limit is ' + MAX_ROWS + '.' });
      } else AEDARToast.show({ variant: 'success', title: 'File loaded', description: parsed.length + (parsed.length === 1 ? ' row' : ' rows') + ' from ' + file.name });
    };
    fr.readAsText(file);
  }
  // Template mirrors the grid columns, with one filled example row.
  $('dl-template').addEventListener('click', () => {
    const head = ['serial', 'model', 'customer', 'group', 'installation site', 'pad expiry (YYYY-MM-DD)'];
    const ex = ['AED8899231501', 'F2', CUSTS[0] || '', (GROUPS[CUSTS[0]] || [''])[0], 'ล็อบบี้ ชั้น 1', '2029-06-30'];
    const csv = '\uFEFF' + [head, ex].map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n') + '\r\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'aedar-bulk-register-template.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    AEDARToast.show({ variant: 'success', title: 'Template downloaded', description: 'aedar-bulk-register-template.csv — opens in Excel or Sheets.' });
  });
  $('p-file-btn').addEventListener('click', () => $('p-file').click());
  $('p-file').addEventListener('change', (e) => { loadCSV(e.target.files[0]); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => $('p-drop').addEventListener(ev, (e) => { e.preventDefault(); $('p-drop').classList.add('on'); }));
  ['dragleave', 'drop'].forEach((ev) => $('p-drop').addEventListener(ev, () => $('p-drop').classList.remove('on')));
  $('p-drop').addEventListener('drop', (e) => { e.preventDefault(); loadCSV(e.dataTransfer.files[0]); });

  paintGrid();
});
