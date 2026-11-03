/* ==========================================================================
   Shared by every page. No libraries: nav state, scroll reveals, tab groups,
   side index scroll-spy, experience filter, copy email, clock and year.
   ========================================================================== */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---- Year + Bangkok clock ---- */
  $$('[data-year]').forEach(e => { e.textContent = new Date().getFullYear(); });
  const clocks = $$('[data-clock]');
  const tick = () => { const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' }).format(new Date()); clocks.forEach(c => { c.textContent = t; }); };
  tick(); setInterval(tick, 20000);

  /* ---- Nav gets a hairline once you scroll ---- */
  const nav = $('.nav');
  const stuck = () => nav && nav.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', stuck, { passive: true }); stuck();

  /* ---- Reveal on scroll ---- */
  const rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('in'));

  /* ---- Tab groups: [data-tabs] > [data-tab] buttons switch [data-pane] panels ---- */
  $$('[data-tabs]').forEach(g => {
    const bs = $$('[data-tab]', g), ps = $$('[data-pane]', g);
    const set = i => { bs.forEach((b, j) => b.classList.toggle('on', j === i)); ps.forEach((p, j) => p.classList.toggle('on', j === i)); };
    bs.forEach((b, i) => b.addEventListener('click', () => set(i)));
    set(0);
  });

  /* ---- Case study side index: highlight the section in view ---- */
  const links = $$('.toc a'), secs = links.map(a => $(a.getAttribute('href')));
  if (links.length) {
    const spy = () => {
      let cur = 0;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.35) cur = i; });
      links.forEach((a, i) => a.classList.toggle('on', i === cur));
    };
    addEventListener('scroll', spy, { passive: true }); spy();
  }

  /* ---- Experience filter ---- */
  $$('.xp-intro .seg button').forEach(b => b.addEventListener('click', () => {
    $$('.xp-intro .seg button').forEach(x => x.classList.toggle('on', x === b));
    $$('.xp-row').forEach(r => { r.hidden = b.dataset.f !== 'all' && r.dataset.t !== b.dataset.f; });
  }));

  /* ---- Hero word: types, holds, backspaces, then types the next one ---- */
  const typer = $('.typer');
  if (typer && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const out = $('.typed', typer), words = typer.dataset.words.split('|');
    let w = 0, n = words[0].length, deleting = false;
    const step = () => {
      const word = words[w];
      out.textContent = word.slice(0, n);
      typer.classList.toggle('is-typing', n > 0 && n < word.length || deleting);
      let wait = deleting ? 45 : 90;
      if (!deleting && n === word.length) { deleting = true; wait = 1900; }
      else if (deleting && n === 0) { deleting = false; w = (w + 1) % words.length; wait = 350; }
      else n += deleting ? -1 : 1;
      setTimeout(step, wait);
    };
    setTimeout(() => { deleting = true; step(); }, 1900);
  }

  /* ---- Console in the hero: Bifi, a little flower with feelings ---- */
  const gadget = $('#gadget');
  if (gadget) {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Draw the flower from circles, then add a face for the current mood.
    const W = 20, H = 24, CX = 10, CY = 10.4;
    const inC = (x, y, px, py, r) => (x + .5 - px) ** 2 + (y + .5 - py) ** 2 <= r * r;
    const base = Array.from({ length: H }, () => Array(W).fill('.'));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let on = false;
      for (let k = 0; k < 5; k++) { const a = (-90 + k * 72) * Math.PI / 180; if (inC(x, y, CX + Math.cos(a) * 5.7, CY + Math.sin(a) * 5.7, 2.9)) on = true; }
      if (on) base[y][x] = 'P';
      if (inC(x, y, CX, CY, 4.6)) base[y][x] = 'F';
    }
    const head = base.map(r => r.slice());
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (base[y][x] === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (base[y + dy] || [])[x + dx] && 'PF'.includes(base[y + dy][x + dx]))) head[y][x] = 'O';
    const COL = { P: '#8FB0F5', F: '#F4F8FF', O: '#2A4A95', E: '#0B1730', W: '#FFFFFF', C: '#8FB0F5', M: '#0B1730', H: '#2457D6', T: '#5C86EA', S: '#2A4A95', L: '#5C86EA' };
    const px = (list, ch) => list.map(([x, y]) => [x + 1, y + 1, ch]);
    const EYES = { E: [[6, 9], [7, 9], [6, 10], [7, 10], [10, 9], [11, 9], [10, 10], [11, 10]], W: [[6, 9], [10, 9]] };
    const FACE = {
      happy: [...px(EYES.E, 'E'), ...px(EYES.W, 'W'), ...px([[5, 11], [12, 11]], 'C'), ...px([[7, 12], [10, 12], [8, 13], [9, 13]], 'M')],
      blink: [...px([[6, 10], [7, 10], [10, 10], [11, 10]], 'E'), ...px([[5, 11], [12, 11]], 'C'), ...px([[7, 12], [10, 12], [8, 13], [9, 13]], 'M')],
      sleep: [...px([[6, 10], [7, 10], [10, 10], [11, 10]], 'E'), ...px([[5, 11], [12, 11]], 'C'), ...px([[8, 13], [9, 13]], 'M')],
      sad: [...px(EYES.E, 'E'), ...px(EYES.W, 'W'), ...px([[5, 12]], 'T'), ...px([[8, 12], [9, 12], [7, 13], [10, 13]], 'M')],
      wow: [...px(EYES.E, 'E'), ...px(EYES.W, 'W'), ...px([[5, 11], [12, 11]], 'C'), ...px([[8, 12], [9, 12], [8, 13], [9, 13]], 'M')],
      joy: [...px([[6, 10], [7, 9], [11, 10], [10, 9]], 'E'), ...px([[5, 11], [12, 11]], 'C'), ...px([[7, 12], [10, 12], [8, 13], [9, 13]], 'M')],
      love: [...px([[5, 9], [7, 9], [5, 10], [6, 10], [7, 10], [6, 11], [10, 9], [12, 9], [10, 10], [11, 10], [12, 10], [11, 11]], 'H'), ...px([[4, 11], [13, 11]], 'C'), ...px([[7, 12], [10, 12], [8, 13], [9, 13]], 'M')]
    };
    const STEM = [...px([[8, 18], [9, 18], [8, 19], [9, 19], [8, 20], [9, 20], [8, 21], [9, 21], [8, 22], [9, 22]], 'S'), ...px([[6, 19], [7, 19], [5, 18], [6, 18], [10, 20], [11, 20], [12, 19], [11, 19]], 'L')];
    const rect = (x, y, c) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${COL[c]}"/>`;
    const pet = $('.pet', gadget), stage = $('.lcd-stage', gadget), lcd = $('.lcd', gadget);
    pet.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    let mood = 'happy', lastWater = Date.now(), last = Date.now(), waters = 0, tmp = 0;
    const draw = () => {
      const f = FACE[mood] || FACE.happy;
      const hs = head.map((row, y) => row.map((c, x) => c === '.' ? '' : rect(x, y, c)).join('')).join('');
      pet.innerHTML = `<g>${STEM.map(([x, y, c]) => rect(x, y, c)).join('')}</g><g class="fl">${hs}${f.map(([x, y, c]) => rect(x, y, c)).join('')}</g>`;
      pet.classList.toggle('droop', mood === 'sad');
    };
    const feel = (m, ms) => { mood = m; draw(); if (ms) { clearTimeout(tmp); tmp = setTimeout(() => { mood = baseMood(); draw(); }, ms); } };
    const baseMood = () => { const idle = Date.now() - last, dry = Date.now() - lastWater; return idle > 22000 ? 'sleep' : dry > 14000 ? 'sad' : 'happy'; };
    draw();
    const items = [['WORKS', '5 case studies', '#work'], ['PLAY', 'small things', '#playground'], ['ABOUT', "hi, i'm bi", '#about'], ['JOURNEY', 'experience', '#experience'], ['HELLO', 'say hi', '#contact']];
    const chatter = ["hi, i'm bifi!", 'i design money apps', 'i grow in code', 'water me?', 'tidy files = happy bi', 'pick a folder'];
    const nameEl = $('[data-g-name]', gadget), subEl = $('[data-g-sub]', gadget), say = $('[data-say]', gadget);
    let i = 0, c = 0;
    const show = () => { nameEl.textContent = items[i][0]; subEl.textContent = items[i][1]; };
    const hop = () => { if (calm) return; pet.classList.remove('hop'); void pet.getBoundingClientRect(); pet.classList.add('hop'); };
    const wake = () => { last = Date.now(); if (mood === 'sleep') feel('happy'); };
    const sparks = () => { if (calm) return; for (let k = 0; k < 7; k++) { const s = document.createElement('span'); s.className = 'g-spark'; s.textContent = '✦'; const a = (k / 7) * Math.PI * 2; s.style.setProperty('--dx', Math.round(Math.cos(a) * 80) + 'px'); s.style.setProperty('--dy', Math.round(Math.sin(a) * 70) + 'px'); gadget.append(s); setTimeout(() => s.remove(), 1000); } };
    const water = () => {
      wake(); hop(); lastWater = Date.now(); waters++;
      if (!calm) for (let k = 0; k < 4; k++) { const d = document.createElement('i'); d.className = 'drop'; d.style.left = (30 + Math.random() * 40) + '%'; d.style.top = (4 + Math.random() * 8) + 'px'; stage.append(d); setTimeout(() => d.remove(), 800); }
      if (waters >= 3) { waters = 0; say.textContent = 'i love it! ✦'; feel('love', 3000); lcd.classList.remove('flash'); void lcd.offsetWidth; lcd.classList.add('flash'); sparks(); }
      else { say.textContent = ['thank you!', 'more please', 'almost there'][waters - 1] || 'thank you!'; feel('joy', 1300); }
    };
    stage.addEventListener('click', water);
    const press = {
      prev: () => { i = (i + items.length - 1) % items.length; show(); say.textContent = items[i][1]; },
      next: () => { i = (i + 1) % items.length; show(); say.textContent = items[i][1]; },
      go: () => { say.textContent = 'off we go!'; const t = $(items[i][2]); if (t) t.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' }); }
    };
    $$('[data-g]', gadget).forEach(b => b.addEventListener('click', () => { wake(); press[b.dataset.g](); hop(); feel('wow', 500); }));
    show();
    if (!calm) {
      setInterval(() => { if (mood === 'happy') { feel('blink'); setTimeout(() => { if (mood === 'blink') feel('happy'); }, 160); } }, 3400);
      setInterval(() => {
        const b = baseMood();
        if (!tmp || mood === 'happy' || mood === 'sad' || mood === 'sleep') { if (b !== mood && !['joy', 'love', 'wow', 'blink'].includes(mood)) feel(b); }
        if (mood === 'sleep') say.textContent = 'zzz...';
        else if (mood === 'sad') say.textContent = 'so thirsty...';
        else if (!['joy', 'love', 'wow'].includes(mood)) { c = (c + 1) % chatter.length; say.textContent = chatter[c]; }
      }, 5200);
      const hero = $('.hero');
      if (hero && matchMedia('(hover: hover) and (pointer: fine)').matches) {
        hero.addEventListener('pointermove', e => {
          const r = gadget.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
          gadget.style.setProperty('--ry', (dx * 16).toFixed(1) + 'deg'); gadget.style.setProperty('--rx', (-dy * 12).toFixed(1) + 'deg');
        });
        hero.addEventListener('pointerleave', () => { gadget.style.setProperty('--ry', '0deg'); gadget.style.setProperty('--rx', '0deg'); });
      }
    }
  }

  /* ---- Dock icons: smooth line illustrations in the site's own style ---- */
  const ICONS = {"work": "<svg viewBox=\"0 0 48 48\" fill=\"none\" aria-hidden=\"true\"><path d=\"M6 14a4 4 0 0 1 4-4h9l4 4h15a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z\" fill=\"#8FB0F5\" stroke=\"#2A4A95\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M6 21a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z\" fill=\"#EAF0FD\" stroke=\"#2A4A95\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M24 22.5l1.9 5.2 5.2 1.9-5.2 1.9L24 36.7l-1.9-5.2-5.2-1.9 5.2-1.9z\" fill=\"#2457D6\"/></svg>", "play": "<svg viewBox=\"0 0 48 48\" fill=\"none\" aria-hidden=\"true\"><rect x=\"5\" y=\"13\" width=\"38\" height=\"23\" rx=\"11.5\" fill=\"#C7D7F7\" stroke=\"#2A4A95\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M16 20.5v9M11.5 25h9\" stroke=\"#2457D6\" stroke-width=\"2.8\" stroke-linecap=\"round\"/><circle cx=\"31.5\" cy=\"22.5\" r=\"2.3\" fill=\"#2457D6\"/><circle cx=\"36.5\" cy=\"27.5\" r=\"2.3\" fill=\"#2457D6\"/></svg>", "about": "<svg viewBox=\"0 0 48 48\" fill=\"none\" aria-hidden=\"true\"><g fill=\"#C7D7F7\" stroke=\"#2A4A95\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><ellipse cx=\"24\" cy=\"11.5\" rx=\"6.3\" ry=\"8.3\" transform=\"rotate(0 24 24)\"/><ellipse cx=\"24\" cy=\"11.5\" rx=\"6.3\" ry=\"8.3\" transform=\"rotate(72 24 24)\"/><ellipse cx=\"24\" cy=\"11.5\" rx=\"6.3\" ry=\"8.3\" transform=\"rotate(144 24 24)\"/><ellipse cx=\"24\" cy=\"11.5\" rx=\"6.3\" ry=\"8.3\" transform=\"rotate(216 24 24)\"/><ellipse cx=\"24\" cy=\"11.5\" rx=\"6.3\" ry=\"8.3\" transform=\"rotate(288 24 24)\"/></g><circle cx=\"24\" cy=\"24\" r=\"9.6\" fill=\"#fff\" stroke=\"#2A4A95\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><text x=\"24\" y=\"28.6\" text-anchor=\"middle\" font-family=\"Instrument Serif, Georgia, serif\" font-style=\"italic\" font-size=\"14\" fill=\"#2457D6\">bi</text></svg>", "journey": "<svg viewBox=\"0 0 48 48\" fill=\"none\" aria-hidden=\"true\"><rect x=\"11\" y=\"7\" width=\"26\" height=\"35\" rx=\"4\" fill=\"#EAF0FD\" stroke=\"#2A4A95\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M18 4v6M24 4v6M30 4v6\" stroke=\"#2457D6\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M17 20h14M17 26h14M17 32h8\" stroke=\"#8FB0F5\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></svg>", "hello": "<svg viewBox=\"0 0 48 48\" fill=\"none\" aria-hidden=\"true\"><rect x=\"5\" y=\"13\" width=\"38\" height=\"26\" rx=\"5\" fill=\"#EAF0FD\" stroke=\"#2A4A95\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M7.5 16.5L24 29l16.5-12.5\" fill=\"none\" stroke=\"#2A4A95\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M37.5 6.4c-1.4-1.9-4.3-.9-4.3 1.4 0 2.1 2.7 3.6 4.3 4.9 1.6-1.3 4.3-2.8 4.3-4.9 0-2.3-2.9-3.3-4.3-1.4z\" fill=\"#2457D6\"/></svg>"};
  $$('.ico[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon] || ''; });

  /* ---- Dock: icons swell near the pointer, current section is marked ---- */
  const dock = $('.dock');
  if (dock) {
    const links = $$('a', dock);
    if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dock.addEventListener('pointermove', e => links.forEach(a => {
        const r = a.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2));
        const k = Math.max(0, 1 - d / 120);
        a.style.transform = `scale(${(1 + 0.38 * k).toFixed(3)}) translateY(${(-5 * k).toFixed(1)}px)`;
      }));
      dock.addEventListener('pointerleave', () => links.forEach(a => { a.style.transform = ''; }));
    }
    const secs = links.map(a => $('#' + a.dataset.sec));
    const spy = () => {
      let cur = -1;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.45) cur = i; });
      links.forEach((a, i) => a.classList.toggle('on', i === cur));
    };
    addEventListener('scroll', spy, { passive: true }); spy();
  }

  /* ---- Work cards: animated thumbnails (hover, focus, or in view on touch) ---- */
  const cards = $$('.wcard, .pg-card');
  if (cards.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const timers = new WeakMap();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const clear = card => { (timers.get(card) || []).forEach(clearTimeout); timers.set(card, []); $$('.wtype', card).forEach(e => { e.textContent = ''; }); $$('[data-count]', card).forEach(e => { e.textContent = '0'; }); };
    const play = card => {
      if (card.classList.contains('is-play')) return;
      clear(card); card.classList.add('is-play');
      const list = timers.get(card);
      $$('.wtype', card).forEach(e => {
        const text = e.dataset.type; let n = 0;
        const typeNext = () => { e.textContent = text.slice(0, ++n); if (n < text.length) list.push(setTimeout(typeNext, 60)); };
        list.push(setTimeout(typeNext, 450));
      });
      $$('[data-count]', card).forEach(e => {
        const to = +e.dataset.count, t0 = performance.now() + 450;
        const tick = now => { const k = Math.min(1, Math.max(0, (now - t0) / 1100)); e.textContent = Math.round(to * ease(k)); if (k < 1) list.push(requestAnimationFrame(tick)); };
        list.push(requestAnimationFrame(tick));
      });
    };
    const stop = card => { card.classList.remove('is-play'); clear(card); };
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      cards.forEach(c => { c.addEventListener('mouseenter', () => play(c)); c.addEventListener('mouseleave', () => stop(c)); c.addEventListener('focusin', () => play(c)); c.addEventListener('focusout', () => stop(c)); });
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? play : stop)(e.target)), { threshold: 0.7 });
      cards.forEach(c => io.observe(c));
    }
  }

  /* ---- Live prototype frames: scale the 1440px app to fit, switch pages with the tabs ---- */
  $$('.bwin').forEach(w => {
    const body = $('.bwin-body', w), fr = $('iframe', w), url = $('.bwin-url', w);
    if (!body || !fr) return;
    const fit = () => { fr.style.setProperty('--s', (body.clientWidth / 1440).toFixed(4)); };
    fit(); addEventListener('resize', fit); if ('ResizeObserver' in window) new ResizeObserver(fit).observe(body);
    const group = w.closest('.frames');
    if (group) $$('[data-src]', group).forEach(b => b.addEventListener('click', () => {
      $$('[data-src]', group).forEach(x => x.classList.toggle('on', x === b));
      fr.src = b.dataset.src; if (url) url.textContent = b.dataset.url || url.textContent;
    }));
  });

  /* ---- Own-built clickable prototype: [data-proto] with .ps screens and .hot hotspots ---- */
  $$('[data-proto]').forEach(pr => {
    const screens = $$('.ps', pr), steps = $$('.proto-steps li', pr);
    const go = i => {
      screens.forEach((sc, k) => sc.classList.toggle('on', k === i));
      steps.forEach((st, k) => { st.classList.toggle('on', k === i); st.classList.toggle('done', k < i); });
    };
    $$('.hot', pr).forEach(h => h.addEventListener('click', () => go(+h.dataset.go)));
    $$('[data-reset]', pr).forEach(b => b.addEventListener('click', () => go(0)));
    go(0);
  });

  /* ---- Deck: vertical slides with dots, counter, arrow keys and count-ups ---- */
  const deck = $('[data-deck]');
  if (deck) {
    document.documentElement.classList.add('deck-on');
    const slides = $$('.slide', deck);
    const dots = document.createElement('nav'); dots.className = 'deck-dots'; dots.setAttribute('aria-label', 'Slides');
    slides.forEach((sl, i) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.label = sl.dataset.label || ('Slide ' + (i + 1)); b.setAttribute('aria-label', b.dataset.label); b.addEventListener('click', () => sl.scrollIntoView({ behavior: 'smooth', block: 'start' })); dots.append(b); });
    const count = document.createElement('div'); count.className = 'deck-count';
    const hint = document.createElement('div'); hint.className = 'deck-hint'; hint.textContent = 'Scroll or use ↑ ↓';
    document.body.append(dots, count, hint);
    const ease = t => 1 - Math.pow(1 - t, 3);
    const countUp = el => { const to = +el.dataset.count, t0 = performance.now(); const tick = now => { const k = Math.min(1, (now - t0) / 1300); el.textContent = Math.round(to * ease(k)); if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
    let cur = 0;
    const setCur = i => { cur = i; $$('button', dots).forEach((b, k) => b.classList.toggle('on', k === i)); count.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b> / ' + String(slides.length).padStart(2, '0'); if (i > 0) hint.classList.add('off'); };
    setCur(0);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        setCur(slides.indexOf(e.target));
        if (!e.target.dataset.seen) { e.target.dataset.seen = 1; $$('[data-count]', e.target).forEach(countUp); $$('.go-on-view', e.target).forEach(x => x.classList.add('go')); }
      }), { threshold: 0.55 });
      slides.forEach(sl => io.observe(sl));
    } else { $$('[data-count]', deck).forEach(el => { el.textContent = el.dataset.count; }); $$('.go-on-view', deck).forEach(x => x.classList.add('go')); }
    addEventListener('keydown', e => {
      const t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT|IFRAME)$/.test(t.tagName)) return;
      const go = i => { e.preventDefault(); const k = Math.max(0, Math.min(slides.length - 1, i)); slides[k].scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) go(cur + 1);
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) go(cur - 1);
      else if (e.key === 'Home') go(0); else if (e.key === 'End') go(slides.length - 1);
    });
  }

  /* ---- Copy email ---- */
  const toast = $('.mini-toast') || Object.assign(document.body.appendChild(document.createElement('div')), { className: 'mini-toast', role: 'status' });
  let toastT;
  const say = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 1800); };
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-copy]');
    if (!b) return;
    const text = b.dataset.copy;
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => say('Email copied'), () => say(text));
  });
})();

/* ---- Screen cue lightbox ---- */
(() => {
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-zoom]');
    if (!c) return;
    const o = document.createElement('div');
    o.className = 'zoom'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', c.dataset.name || 'Screen');
    o.innerHTML = '<div class="zoom-box' + (c.dataset.wide ? ' wide' : '') + '"><img src="' + c.dataset.zoom + '" alt="' + (c.dataset.name || '') + '"></div>' + (c.dataset.name ? '<span class="zoom-cap">' + c.dataset.name + '</span>' : '');
    const close = () => { o.classList.remove('on'); setTimeout(() => o.remove(), 250); removeEventListener('keydown', esc); };
    const esc = ev => { if (ev.key === 'Escape') close(); };
    o.addEventListener('click', close); addEventListener('keydown', esc);
    document.body.appendChild(o); requestAnimationFrame(() => o.classList.add('on'));
  });
})();
