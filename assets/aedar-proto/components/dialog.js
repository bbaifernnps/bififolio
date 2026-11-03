/* ==================================================================
   AEDAR Dialog — reusable open/close behavior
   Triggers:  <button data-dialog-open="myId">
   Overlay:   <div class="dialog-overlay" id="myId" hidden> … </div>
   Close:     any [data-dialog-close] inside, backdrop click, or Esc.
   AEDARDialog.open(id) / .close(id) also available.
================================================================== */
(function () {
  let lastFocus = null;

  function open(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('dialog-open');
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    const first = overlay.querySelector('input, textarea, select, [data-autofocus], button.btn');
    if (first) setTimeout(() => first.focus(), 60);
    overlay.dispatchEvent(new CustomEvent('dialog:open', { bubbles: true }));
  }
  function close(overlay) {
    if (typeof overlay === 'string') overlay = document.getElementById(overlay);
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('dialog-open');
    const done = () => { overlay.hidden = true; overlay.removeEventListener('transitionend', done); };
    overlay.addEventListener('transitionend', done);
    setTimeout(done, 220);
    if (lastFocus) { try { lastFocus.focus(); } catch (e) {} }
    overlay.dispatchEvent(new CustomEvent('dialog:close', { bubbles: true }));
  }
  function openOverlays() { return Array.from(document.querySelectorAll('.dialog-overlay')).filter((o) => !o.hidden); }

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-dialog-open]');
    if (opener) { e.preventDefault(); open(opener.getAttribute('data-dialog-open')); return; }
    const closer = e.target.closest('[data-dialog-close]');
    if (closer) { e.preventDefault(); close(closer.closest('.dialog-overlay')); return; }
    // backdrop click
    if (e.target.classList && e.target.classList.contains('dialog-overlay')) close(e.target);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { const o = openOverlays(); if (o.length) { e.preventDefault(); close(o[o.length - 1]); } }
  });

  window.AEDARDialog = { open, close };
})();
