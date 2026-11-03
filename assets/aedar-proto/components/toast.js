/* ==================================================================
   AEDAR Toast (Sonner) — reusable
   AEDARToast.show({ title, description, variant, action, duration })
   variant: 'default' | 'success' | 'warning' | 'info' | 'error'
   action: { label, onClick }   duration: ms (default 4500, 0 = sticky)
   Stacks bottom-right, auto-dismisses, closeable.
================================================================== */
(function () {
  const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
  };
  const CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  let viewport = null;
  function ensureViewport() {
    if (!viewport) {
      viewport = document.querySelector('.toast-viewport');
      if (!viewport) { viewport = document.createElement('div'); viewport.className = 'toast-viewport'; document.body.appendChild(viewport); }
    }
    return viewport;
  }

  function show(opts) {
    if (typeof opts === 'string') opts = { title: opts };
    const { title = '', description = '', variant = 'default', action = null, duration = 4500 } = opts;
    const vp = ensureViewport();
    const el = document.createElement('div');
    el.className = 'toast ' + variant;
    const lead = (variant !== 'default' && ICONS[variant]) ? `<span class="toast-lead">${ICONS[variant]}</span>` : '';
    el.innerHTML =
      lead +
      `<div class="toast-content"><span class="toast-title">${title}</span>${description ? `<span class="toast-desc">${description}</span>` : ''}</div>` +
      (action ? `<button class="btn ${variant === 'error' ? 'btn-destructive' : 'btn-outline'} btn-sm toast-action">${action.label}</button>` : '') +
      `<button class="toast-close" aria-label="Dismiss">${CLOSE}</button>`;
    vp.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));

    let timer = null;
    function dismiss() {
      if (!el.isConnected) return;
      el.classList.remove('show'); el.classList.add('hide');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 400);
      clearTimeout(timer);
    }
    el.querySelector('.toast-close').addEventListener('click', dismiss);
    if (action) el.querySelector('.toast-action').addEventListener('click', () => { try { action.onClick && action.onClick(); } finally { dismiss(); } });
    if (duration > 0) {
      timer = setTimeout(dismiss, duration);
      el.addEventListener('mouseenter', () => clearTimeout(timer));
      el.addEventListener('mouseleave', () => { timer = setTimeout(dismiss, 1800); });
    }
    return { dismiss };
  }

  window.AEDARToast = { show };
})();
