/* AEDAR Control Plane — shared table pager.
   Same markup, styling and numbering logic as the customer app's list pager
   (Dashboard / DeviceDetail): "Showing x–y of n" + Prev · numbered pages · Next.
   CPPager.render(hostEl, { page, size, total }, { onPage }) */
(function () {
  const PAGE_SIZE = 12;
  function render(host, st, cb) {
    if (!host) return;
    const pages = Math.max(1, Math.ceil(st.total / st.size));
    const page = Math.min(Math.max(0, st.page), pages - 1);
    const start = page * st.size;
    const shown = Math.min(st.size, st.total - start);
    if (st.total <= st.size) {
      host.innerHTML = '<div class="cp-list-foot"><span>' + st.total + ' result' + (st.total === 1 ? '' : 's') + '</span></div>';
      return;
    }
    // Numbered buttons with an ellipsis for long ranges — same rule as the app.
    const nums = [];
    if (pages <= 7) { for (let i = 0; i < pages; i++) nums.push(i); }
    else {
      nums.push(0);
      let lo = Math.max(1, page - 1), hi = Math.min(pages - 2, page + 1);
      if (page <= 2) { lo = 1; hi = 3; }
      if (page >= pages - 3) { lo = pages - 4; hi = pages - 2; }
      if (lo > 1) nums.push('...');
      for (let i = lo; i <= hi; i++) nums.push(i);
      if (hi < pages - 2) nums.push('...');
      nums.push(pages - 1);
    }
    host.innerHTML =
      '<div class="cp-list-foot"><span>Showing ' + (start + 1) + '\u2013' + (start + shown) + ' of ' + st.total + '</span>' +
      '<div class="pager">' +
      '<button class="btn btn-ghost btn-sm" data-go="-1"' + (page === 0 ? ' disabled' : '') + '><svg class="btn-icon-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>Prev</button>' +
      '<span class="pg-nums">' + nums.map(n => n === '...'
        ? '<span class="pg-gap">\u2026</span>'
        : '<button class="pg-num' + (n === page ? ' active' : '') + '" data-page="' + n + '">' + (n + 1) + '</button>').join('') + '</span>' +
      '<button class="btn btn-ghost btn-sm" data-go="1"' + (page >= pages - 1 ? ' disabled' : '') + '>Next <svg class="btn-icon-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>' +
      '</div></div>';
    host.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => cb.onPage(page + (+b.dataset.go))));
    host.querySelectorAll('.pg-num').forEach(b => b.addEventListener('click', () => cb.onPage(+b.dataset.page)));
  }
  window.CPPager = { render, PAGE_SIZE };
})();
