/* ==========================================================================
   Bloomingbifi — motion & interaction
   Libraries: GSAP + ScrollTrigger (animation), Lenis (smooth scroll)
   Sections: helpers · flower factory · (libs check) · smooth scroll · loader/intro
             · sky · meadow (wind, lean, planting) · mascot · drifting petals · nav
             · marquee · works · experiences · contact garden · cursor
   ========================================================================== */

(() => {
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const isNarrow = matchMedia('(max-width: 900px)').matches;

  // Always open on the meadow (the intro plays from the top), never a half-restored scroll position
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---- Works without any libraries ---- */
  const yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  // Glass highlight follows the pointer (CSS uses --mx / --my)
  document.addEventListener('pointermove', e => {
    const g = e.target.closest && e.target.closest('.glass');
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    g.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ==========================================================================
     Flower factory — flowers drawn in code so any number can bloom, sway and grow.
     Two looks share the same shapes (switch with ?flowers=paper or ?flowers=soft3d):
       paper = bold layered cut-paper · soft3d = glossy, dimensional
     kinds: rose · lily · daisy · sunflower · gerbera · ranunculus · anemone · cosmos · tulip
            · poppy · delphinium · gypsophila · eucalyptus
     ========================================================================== */
  root.classList.add('fs-soft3d'); // the one flower look: glossy soft 3D

  // colour families: d = deep (petal base), m = mid, l = light (petal tip), c = centre
  const FAM = {
    blush:    { d: '#FF5C9A', m: '#FF8FBF', l: '#FFD3E6', c: '#FFC233' },
    ivory:    { d: '#F5E2BE', m: '#FFF3DA', l: '#FFFFFF', c: '#FFB800' },
    lilac:    { d: '#8A5CFF', m: '#B592FF', l: '#E6D9FF', c: '#FFD23F' },
    apricot:  { d: '#FF7A2F', m: '#FFA65C', l: '#FFDDB8', c: '#B4451B' },
    butter:   { d: '#FFB800', m: '#FFD84D', l: '#FFF3B8', c: '#8A4B00' },
    mist:     { d: '#3D6BFF', m: '#7FA0FF', l: '#D6E2FF', c: '#FFD23F' },
    coral:    { d: '#E5233D', m: '#FF5A5F', l: '#FFC2C0', c: '#2B0F1A' },
    sage:     { d: '#2F9E6B', m: '#57C08A', l: '#B7EBCB', c: '#2F9E6B' }
  };
  const DEFAULT_PAL = { rose: 'blush', lily: 'blush', daisy: 'ivory', sunflower: 'butter', gerbera: 'coral', ranunculus: 'apricot', anemone: 'ivory',
                        cosmos: 'blush', tulip: 'blush', poppy: 'coral', delphinium: 'mist', gypsophila: 'ivory', eucalyptus: 'sage' };
  // colours that suit each flower when one is planted at random
  const PALS_OF = {
    rose: ['blush', 'apricot', 'coral', 'ivory', 'lilac'], lily: ['blush', 'ivory', 'apricot', 'lilac'], daisy: ['ivory'], sunflower: ['butter'],
    gerbera: ['coral', 'blush', 'apricot', 'butter'], anemone: ['ivory', 'lilac', 'blush'], cosmos: ['blush', 'lilac', 'ivory', 'apricot'],
    tulip: ['blush', 'butter', 'coral', 'lilac'], poppy: ['coral', 'apricot'], ranunculus: ['apricot', 'butter', 'blush', 'ivory'], delphinium: ['mist', 'lilac']
  };
  const PLANT_KINDS = Object.keys(PALS_OF);

  // Shared gradients: linear (drifting petals) and radial (the 3D look)
  document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    Object.entries(FAM).map(([k, f]) =>
      `<linearGradient id="pg-${k}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${f.d}"/><stop offset=".55" stop-color="${f.m}"/><stop offset="1" stop-color="${f.l}"/></linearGradient>` +
      `<radialGradient id="p3-${k}" cx=".5" cy=".28" r=".85"><stop offset="0" stop-color="${f.l}"/><stop offset=".55" stop-color="${f.m}"/><stop offset="1" stop-color="${f.d}"/></radialGradient>`
    ).join('') + '</defs></svg>');

  // Per-style stems and leaves
  const LOOK = { stem: ['#2F9E6B', 3], leaf: 'fill="url(#p3-sage)" stroke="rgba(255,255,255,.4)" stroke-width=".6"' };

  // How a petal is painted (tone: 0 = outer/light … 1 = inner/deep)
  function paint(p) {
    return `fill="url(#p3-${p})" stroke="rgba(255,255,255,.45)" stroke-width=".6"`;
  }

  // Every petal is a .pp with an index (--i) so petals can unfold one after another
  let PI = 0;
  const C = inner => `<g class="pp" style="--i:${PI++}">${inner}</g>`;
  const one = (d, p, tone, tf = '') => C(`<path transform="${tf}" d="${d}" ${paint(p, tone)}/>`);
  const disc = (r, fill) => C(`<circle r="${r}" fill="${fill}" stroke="none"/>`);

  // A rounded teardrop petal pointing up from the origin
  const petal = (len, wid) =>
    `M0 0 C${-wid} ${-len * .2} ${-wid * 1.05} ${-len * .78} ${-wid * .4} ${-len * .97} Q0 ${-len * 1.05} ${wid * .4} ${-len * .97} C${wid * 1.05} ${-len * .78} ${wid} ${-len * .2} 0 0Z`;
  // A pointed lily petal
  const lilyPetal = (len, wid) => `M0 0 C${-wid} ${-len * .25} ${-wid * 1.1} ${-len * .7} 0 ${-len} C${wid * 1.1} ${-len * .7} ${wid} ${-len * .25} 0 0Z`;
  // n petals around the centre (slightly irregular, so no two flowers match)
  const ringOf = (n, d, p, rot = 0, jitter = 5, tone = .5) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      s += one(d, p, tone, `rotate(${(rot + i * 360 / n + rand(-jitter, jitter)).toFixed(1)}) scale(${rand(0.93, 1.05).toFixed(2)})`);
    }
    return s;
  };
  const dotsAt = (n, r, size, fill) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = i * 2 * Math.PI / n;
      s += `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="${size}" fill="${fill}" stroke="none"/>`;
    }
    return s;
  };

  function headSVG(kind, p) {
    const f = FAM[p];
    switch (kind) {
      case 'rose':
        return ringOf(7, petal(32, 17), p, 0, 5, 0) + ringOf(6, petal(26, 15), p, 26, 5, .25) + ringOf(5, petal(20, 12), p, 8, 5, .5) +
               ringOf(4, petal(14, 9), p, 40, 5, .75) + ringOf(3, petal(8, 6), p, 15, 5, 1) + disc(2.4, f.d);
      case 'lily': {
        let s = '';
        // three outer petals, then three inner ones between them; each with a pale midrib and a few freckles
        [[0, 44, 10, .2], [120, 44, 10, .2], [240, 44, 10, .2], [60, 40, 12, .55], [180, 40, 12, .55], [300, 40, 12, .55]].forEach(([a, len, wid, tone]) => {
          const tf = `rotate(${(a + rand(-4, 4)).toFixed(1)})`;
          let dots = '';
          for (let k = 0; k < 5; k++) dots += `<circle cx="${rand(-3.5, 3.5).toFixed(1)}" cy="${-rand(8, 24).toFixed(1)}" r=".9" fill="${f.d}" opacity=".75"/>`;
          s += one(lilyPetal(len, wid), p, tone, tf) +
               C(`<g transform="${tf}"><path d="M0 -3 L0 ${-len * .72}" stroke="rgba(255,255,255,.55)" stroke-width="1.1" fill="none" stroke-linecap="round"/>${dots}</g>`);
        });
        let st = '';
        for (let i = 0; i < 6; i++) {
          const a = (i * 60 + 15) * Math.PI / 180, x = Math.cos(a) * 19, y = Math.sin(a) * 19;
          st += `<line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#F5E2BE" stroke-width="1.2" stroke-linecap="round"/>` +
                `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="1.7" ry="3" transform="rotate(${(i * 60 + 105)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#B4451B"/>`;
        }
        return s + C(st) + disc(2.4, '#7BC96F');
      }
      case 'daisy':
        return ringOf(16, petal(31, 5.4), p, 0, 4, 0) + ringOf(13, petal(25, 5), p, 14, 4, .5) + disc(9, f.c) + C(dotsAt(9, 5, 1, '#B8862B') + dotsAt(4, 1.6, 1, '#B8862B'));
      case 'sunflower': {
        let seeds = '';
        for (let i = 0; i < 46; i++) { // seeds packed in a sunflower spiral
          const r = Math.sqrt(i) * 2.15, a = i * 2.39996;
          seeds += `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="1" fill="#2A1508" stroke="none"/>`;
        }
        return ringOf(18, petal(38, 7.2), p, 0, 4, .5) + ringOf(16, petal(31, 7), p, 11, 4, .85) + disc(16, '#6B3F1D') + C(seeds);
      }
      case 'gerbera':
        return ringOf(14, petal(31, 7.6), p, 0, 4, .5) + ringOf(12, petal(25, 7), p, 13, 4, .75) + ringOf(10, petal(19, 6), p, 5, 4, 1) +
               disc(8.5, '#3A1F2B') + C(dotsAt(14, 10.4, 1.6, f.c) + dotsAt(9, 6, 1.4, '#FFC233'));
      case 'ranunculus':
        return ringOf(9, petal(28, 12), p, 0, 5, 0) + ringOf(8, petal(24, 11), p, 20, 5, .2) + ringOf(7, petal(20, 10), p, 10, 5, .4) +
               ringOf(6, petal(16, 8), p, 30, 5, .6) + ringOf(5, petal(11, 6), p, 0, 5, .8) + ringOf(4, petal(7, 5), p, 20, 5, 1) + disc(2.2, '#57C08A');
      case 'anemone': {
        const dk = '#2C2846';
        let st = '';
        for (let i = 0; i < 18; i++) {
          const a = i * 20 * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
          st += `<line x1="${(cs * 6).toFixed(1)}" y1="${(sn * 6).toFixed(1)}" x2="${(cs * 11.5).toFixed(1)}" y2="${(sn * 11.5).toFixed(1)}" stroke="${dk}" stroke-width=".8"/>` +
                `<circle cx="${(cs * 12).toFixed(1)}" cy="${(sn * 12).toFixed(1)}" r="1.2" fill="${dk}" stroke="none"/>`;
        }
        return ringOf(7, petal(31, 18), p, 0, 5, 0) + ringOf(6, petal(25, 15), p, 26, 5, .45) + C(st) + disc(6.5, dk);
      }
      case 'cosmos': {
        const notch = 'M0 0 C-13 -6 -15 -22 -10 -32 L-5 -28.5 L0 -33 L5 -28.5 L10 -32 C15 -22 13 -6 0 0Z';
        return ringOf(8, notch, p, 0, 5, .15) + `<g transform="scale(.66)">${ringOf(8, notch, p, 22, 5, .8)}</g>` + disc(4.6, f.c) + C(dotsAt(8, 2.6, .8, '#B8862B'));
      }
      case 'poppy': {
        const W = 'M0 0 C-24 -4 -30 -26 -12 -33 C-4 -36 4 -36 12 -33 C30 -26 24 -4 0 0Z';
        return ringOf(4, W, p, 45, 4, .1) + `<g transform="scale(.82)">${ringOf(4, W, p, 0, 4, .7)}</g>` + disc(5.5, '#2B1B26') + C(dotsAt(10, 8.5, 1.1, '#2B1B26'));
      }
      case 'tulip':
        return one('M0 8 C-22 6 -24 -22 -14 -46 C-6 -33 -2 -16 0 8Z', p, .2) + one('M0 8 C22 6 24 -22 14 -46 C6 -33 2 -16 0 8Z', p, .2) +
               one('M0 10 C-14 -2 -14 -34 0 -58 C14 -34 14 -2 0 10Z', p, .7);
      case 'delphinium': {
        let s = '';
        for (let i = 0; i < 14; i++) {
          const t = i / 13, y = -8 - i * 6, r = 9 - 6 * t, x = (i % 2 ? 1 : -1) * 3 * (1 - t);
          s += `<g transform="translate(${x.toFixed(1)} ${y}) rotate(${(i * 37) % 72})">${ringOf(5, petal(r * 1.25, r * .62), p, 0, 8, .3 + .5 * t)}</g>`;
        }
        return s;
      }
      case 'gypsophila': {
        let s = '';
        for (let b = -3; b <= 3; b++) {
          const a = (b * 16 + rand(-6, 6)) * Math.PI / 180, len = rand(34, 52);
          const x = Math.sin(a) * len, y = -Math.cos(a) * len;
          let br = `<path d="M0 0 Q${(x * .3).toFixed(1)} ${(y * .6).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="#57C08A" stroke-width=".9"/>`;
          for (let k = 0; k < 4; k++) {
            br += `<circle cx="${(x + rand(-9, 9)).toFixed(1)}" cy="${(y + rand(-9, 9)).toFixed(1)}" r="${rand(1.6, 2.8).toFixed(1)}" fill="#FFFFFF" stroke="rgba(120,130,110,.3)" stroke-width=".6"/>`;
          }
          s += C(br);
        }
        return s;
      }
    }
    return '';
  }

  function flowerSVG(kind, p, stem) {
    const headH = kind === 'delphinium' ? 100 : (kind === 'gypsophila' || kind === 'tulip') ? 68 : kind === 'eucalyptus' ? 22 : 60;
    const top = stem + headH, h = top + 10, o = (top / h * 100).toFixed(1);
    const look = LOOK, j = () => rand(-7, 7).toFixed(1);
    const stemPath = `<path d="M0 0 C${j()} ${-stem * .35} ${j()} ${-stem * .7} 0 ${-stem}" fill="none" stroke="${look.stem[0]}" stroke-width="${look.stem[1]}" stroke-linecap="round"/>`;
    let body = '';
    if (kind === 'eucalyptus') {
      const n = Math.max(4, Math.round(stem / 15));
      body += stemPath + `<g ${look.leaf}>`;
      for (let i = 1; i <= n; i++) {
        const y = (-stem * i / (n + 0.6)).toFixed(1), s = i % 2 ? 1 : -1, r = 9 - i * 0.35;
        body += `<ellipse cx="${s * (r + 2)}" cy="${y}" rx="${r.toFixed(1)}" ry="${(r * .85).toFixed(1)}" transform="rotate(${s * 24} 0 ${y})"/>`;
      }
      body += `<ellipse cy="${-stem - 6}" rx="6" ry="8"/></g>`;
    } else if (stem > 0) {
      const ly = -stem * .34, ry = -stem * .6;
      body += stemPath + `<g ${look.leaf}>` +
        `<path d="M0 ${ly} C10 ${ly - 7} 26 ${ly - 9} 38 ${ly - 3} C26 ${ly + 6} 10 ${ly + 7} 0 ${ly}Z"/>` +
        `<path d="M0 ${ry} C-10 ${ry - 7} -26 ${ry - 9} -38 ${ry - 3} C-26 ${ry + 6} -10 ${ry + 7} 0 ${ry}Z"/></g>`;
    }
    PI = 0;
    const head = headSVG(kind, p);
    const st = Math.min(0.07, 1.3 / Math.max(PI, 1)).toFixed(3); // total unfold time stays ~1.3s however many petals
    body += `<g class="head" style="transform-origin:0 ${-stem}px"><g transform="translate(0 ${-stem})" stroke-linejoin="round">${head}</g></g>`;
    return `<svg viewBox="-60 ${-top} 120 ${h}" style="transform-origin:50% ${o}%;--st:${st}s" aria-hidden="true">${body}</svg>`;
  }

  /** Builds a flower element. opts: kind, pal (family key), stem, w (px), x (%), b (% from layer bottom), bloomDelay */
  function makeFlower(o) {
    const kind = o.kind || pick(PLANT_KINDS);
    const el = document.createElement('div');
    el.className = 'fl';
    el.style.setProperty('--w', (o.w || 80) + 'px');
    el.style.setProperty('--d', rand(3.4, 5.4).toFixed(2) + 's');
    el.style.setProperty('--dl', (-rand(0, 4)).toFixed(2) + 's');
    el.style.setProperty('--bd', (o.bloomDelay ?? rand(0, 1.3)).toFixed(2) + 's');
    if (o.x != null) el.style.left = o.x + '%';
    if (o.b != null) el.style.bottom = o.b + '%';
    el.style.translate = '-50% 0';
    el.innerHTML = flowerSVG(kind, o.pal || DEFAULT_PAL[kind], o.stem ?? 80);
    return el;
  }

  // Meadow layouts: [x %, kind, palette, stem, width px, shown on mobile?]
  const SETS = {
    hb: [ [6,'sunflower','butter',96,118,1], [22,'delphinium','mist',70,90,0], [95,'lily','blush',80,96,1] ],
    hf: [ [4,'gerbera','coral',34,96,1], [17,'daisy','ivory',40,92,0], [52,'rose','apricot',30,96,1], [88,'daisy','ivory',36,90,0] ],
    fb: [ [8,'sunflower','butter',100,124,1], [26,'lily','blush',90,110,1], [50,'delphinium','mist',90,104,0], [72,'lily','apricot',86,108,1], [92,'sunflower','butter',96,120,1] ],
    ff: [ [4,'daisy','ivory',44,96,1], [18,'gerbera','coral',48,100,1], [38,'rose','apricot',36,100,0], [58,'daisy','ivory',46,94,1], [76,'gerbera','blush',44,98,0], [94,'rose','blush',34,100,1] ]
  };
  const meadowFlowers = [];
  $$('.meadow').forEach(m => {
    (SETS[m.dataset.set] || []).forEach(([x, kind, pal, stem, w, mobile], i) => {
      if (isNarrow && !mobile) return;
      const f = makeFlower({ x, kind, pal, stem, w, b: 26 + rand(-8, 12), bloomDelay: 0.05 * i + rand(0, 0.6) });
      m.append(f); meadowFlowers.push({ el: f, hero: m.dataset.set[0] === 'h' });
    });
  });

  // Flowers placed by hand in the HTML (loader, cards, timeline): <span data-flower="rose" data-stem="30">
  $$('[data-flower]').forEach(slot => {
    const kind = slot.dataset.flower, stem = parseFloat(slot.dataset.stem || 0);
    slot.insertAdjacentHTML('beforeend', flowerSVG(kind, slot.dataset.pal || DEFAULT_PAL[kind], stem));
  });

  /* ---- Clouds: three drifting layers (far → near) ---- */
  const cloudSVG = flip =>
    `<svg viewBox="0 0 200 84"${flip ? ' style="scale:-1 1"' : ''}><g fill="url(#cloud-fill)">` +
    '<circle cx="46" cy="52" r="26"/><circle cx="84" cy="38" r="32"/><circle cx="126" cy="44" r="28"/><circle cx="160" cy="54" r="22"/>' +
    '<rect x="26" y="50" width="152" height="30" rx="15"/></g></svg>';
  // layer: [count, width range px, opacity, drift seconds range, top % range, blur px]
  const CLOUDS = {
    far:  [6, [260, 420], 0.4,  [150, 200], [2, 46],  10],
    mid:  [5, [380, 560], 0.5,  [90, 130],  [8, 72],  16],
    near: [4, [640, 900], 0.55, [60, 85],   [38, 92], 26]
  };
  Object.entries(CLOUDS).forEach(([layer, [n, w, op, dur, top, blur]]) => {
    const host = $('.cl-' + layer); if (!host) return;
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div'), d = rand(dur[0], dur[1]);
      c.className = 'cl';
      c.style.cssText = `--w:${rand(w[0], w[1]).toFixed(0)}px;--t:${rand(top[0], top[1]).toFixed(1)}%;--o:${op};--dur:${d.toFixed(0)}s;` +
        `--dl:${(-rand(0, d)).toFixed(0)}s;--b:${blur}px;--x:${rand(0, 100).toFixed(0)}vw`;
      c.innerHTML = cloudSVG(Math.random() > 0.5);
      host.append(c);
    }
  });

  /* ---- Fireflies for the golden-hour footer ---- */
  const ffHost = $('.fireflies');
  if (ffHost) for (let i = 0; i < (isNarrow ? 9 : 16); i++) {
    const f = document.createElement('i');
    f.className = 'ff';
    f.style.cssText = `left:${rand(2, 98).toFixed(1)}%;top:${rand(8, 62).toFixed(1)}%;--d:${rand(5, 10).toFixed(1)}s;` +
      `--dx:${rand(-40, 40).toFixed(0)}px;--dy:${rand(-30, 30).toFixed(0)}px;--dl:${(-rand(0, 8)).toFixed(1)}s`;
    ffHost.append(f);
  }

  /* ---- Growing vine (Experiences): path + leaves are built from the list's height ---- */
  const xpWrap = $('.xp-wrap'), vinePath = $('.vine-path'), vineLeaves = $('.vine-leaves'), vineSvg = $('.vine');
  let vineLen = 0, leafData = [], xpMarks = [];
  function buildVine() {
    if (!xpWrap) return;
    const NS = 'http://www.w3.org/2000/svg', H = xpWrap.offsetHeight, step = 120;
    vineSvg.setAttribute('viewBox', `0 0 56 ${H}`);
    let d = 'M28 0';
    for (let y = 0, i = 0; y < H; y += step, i++) {
      const s = i % 2 ? 1 : -1;
      d += ` C${28 + s * 16} ${y + step * 0.3} ${28 - s * 16} ${y + step * 0.7} 28 ${y + step}`;
    }
    vinePath.setAttribute('d', d);
    vineLen = vinePath.getTotalLength();

    vineLeaves.innerHTML = ''; leafData = [];
    for (let at = 70, i = 0; at < vineLen - 30; at += 130, i++) {
      const p = vinePath.getPointAtLength(at), g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${i % 2 ? 1 : -1} 1)`);
      g.innerHTML = '<g class="lf"><path d="M0 0 C10 -14 26 -16 34 -8 C26 4 10 6 0 0Z" fill="#A9BFA0" stroke="#6E8B69" stroke-width="1.2" stroke-linejoin="round"/></g>';
      vineLeaves.append(g); leafData.push({ at, el: g.firstChild });
    }

    // where along the vine each role's flower sits
    xpMarks = $$('.xp li', xpWrap).map(li => {
      const y = li.offsetTop + li.offsetHeight / 2;
      let len = 0; while (len < vineLen && vinePath.getPointAtLength(len).y < y) len += 4;
      return { el: $('.xp-flower', li), len };
    });
  }
  buildVine();
  window.addEventListener('load', buildVine);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildVine);

  /* ---- Safety net: no libraries, or user prefers reduced motion ---- */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasLibs = window.gsap && window.ScrollTrigger && window.Lenis;
  if (!hasLibs || reduceMotion) { root.classList.add('static'); return; }

  gsap.registerPlugin(ScrollTrigger);
  const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.add('pre-bloom'); // meadow heads start closed, bloom after the loader

  /* ---- Helper: wrap every word in a span so it can be animated ---- */
  function splitWords(el) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.append(part);
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$('.w', el);
  }

  /* ---- Smooth scroll (Lenis) wired into GSAP ---- */
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // locked until the loader finishes

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = a.getAttribute('href');
      if (target.length < 2) return e.preventDefault();
      const el = $(target);
      if (el) { e.preventDefault(); lenis.scrollTo(el, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) }); }
    });
  });

  /* ---- Initial hidden states (set here so no-JS visitors still see everything) ---- */
  gsap.set('.hero .line-inner', { yPercent: 115 });
  gsap.set('.hero-eyebrow, .hero-sub, .hero-cta, .hero-tags, .hero-index', { autoAlpha: 0, y: 24 });
  gsap.set('.nav', { autoAlpha: 0, y: -24 });
  gsap.set('.proto', { autoAlpha: 0, y: 70, scale: 0.92, transformOrigin: '50% 100%' });
  gsap.set('.hero .layer-back, .hero .layer-front', { yPercent: 40 });
  gsap.set('.scene-tag', { autoAlpha: 0, y: 20 });

  /* ---- Loader → intro ---- */
  const counter = { v: 0 };
  const countEl = $('[data-count]');
  const bloomMeadow = () => meadowFlowers.forEach(({ el }) => el.classList.add('is-bloom'));
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  intro
    .to('.hero .line-inner', { yPercent: 0, duration: 1.4, stagger: 0.12 })
    .to('.hero .layer-back', { yPercent: 0, duration: 1.6 }, '-=1.3')
    .to('.hero .layer-front', { yPercent: 0, duration: 1.6 }, '<+0.1')
    .to('.hero-eyebrow', { autoAlpha: 1, y: 0, duration: 1 }, '-=1.4')
    .to('.proto', { autoAlpha: 1, y: 0, scale: 1, duration: 1.6, ease: 'back.out(1.3)' }, '-=1.0')
    .add(bloomMeadow, '-=1.1')
    .to('.hero-sub, .hero-cta, .hero-tags, .hero-index', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, '-=1.2')
    .to('.nav', { autoAlpha: 1, y: 0, duration: 1 }, '-=1.2')
    .to('.scene-tag', { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.6');

  gsap.timeline({ onComplete: () => { $('.loader').style.display = 'none'; lenis.start(); } })
    .to(counter, {
      v: 100, duration: 1.9, ease: 'power2.inOut',
      onUpdate: () => {
        countEl.textContent = Math.round(counter.v);
        gsap.set('.loader-flower', { rotation: counter.v * 4.5 });
      }
    })
    .to('.loader-label', { autoAlpha: 0, duration: 0.3 }, '-=0.2')
    .to('.loader', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' })
    .add(() => intro.play(), '-=0.6');

  /* ---- Sky drifts from morning blue toward white as you scroll ---- */
  const wholePage = { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true };
  gsap.fromTo('.sky', { backgroundPositionY: '0%' }, { backgroundPositionY: '100%', ease: 'none', scrollTrigger: wholePage });
  // Clouds drift sideways on their own (CSS); scrolling moves the layers at different depths and thickens the near ones
  [['far', 0.1], ['mid', 0.25], ['near', 0.35]].forEach(([k, s]) => {
    const y = innerHeight * s;
    gsap.fromTo('.cl-' + k, { y }, { y: -y, ease: 'none', scrollTrigger: wholePage });
  });
  gsap.fromTo('.cl-near', { opacity: 0.35 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ==========================================================================
     Story scenes: 01 Morning meadow → 02 Above the clouds → 03 Growing → 04 Golden hour
     ========================================================================== */
  // Golden hour: the sky warms, the sun rises behind the hills, fireflies wake up
  gsap.fromTo('.dusk', { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 90%', end: 'top 25%', scrub: true } });
  gsap.fromTo('.fireflies', { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 60%', end: 'top 25%', scrub: true } });
  gsap.fromTo('.sun', { yPercent: 80 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.garden', start: 'top 95%', end: 'top 35%', scrub: true } });

  // The vine draws itself down the Experiences list, leaves unfurl, each role's flower blooms
  if (xpWrap) {
    const setVine = p => {
      const L = p * vineLen;
      vinePath.style.strokeDashoffset = vineLen - L;
      leafData.forEach(l => { l.el.style.transform = `scale(${gsap.utils.clamp(0, 1, (L - l.at) / 30)})`; });
      xpMarks.forEach(m => m.el.classList.toggle('is-bloom', L >= m.len));
    };
    let vineProgress = 0;
    const prime = () => { vinePath.style.strokeDasharray = vineLen; setVine(vineProgress); };
    prime();
    ScrollTrigger.addEventListener('refreshInit', () => { buildVine(); prime(); });
    ScrollTrigger.create({ trigger: xpWrap, start: 'top 72%', end: 'bottom 62%', scrub: true, onUpdate: s => { vineProgress = s.progress; setVine(s.progress); } });
  }

  // Chapter label follows the scene
  const tagInner = $('.st-inner'), tagNum = $('.st-num'), tagName = $('.st-name');
  [['#hero', '01', 'The meadow'], ['#work', '02', 'Among the clouds'], ['#experiences', '03', 'Growing'], ['#contact', '04', 'Golden hour']]
    .forEach(([sel, num, name]) => ScrollTrigger.create({
      trigger: sel, start: 'top 55%', end: 'bottom 55%',
      onToggle: s => {
        if (!s.isActive || tagName.textContent === name) return;
        gsap.to(tagInner, { y: -8, autoAlpha: 0, duration: 0.2, overwrite: true, onComplete: () => {
          tagNum.textContent = num; tagName.textContent = name;
          gsap.fromTo(tagInner, { y: 8 }, { y: 0, autoAlpha: 1, duration: 0.4 });
        } });
      }
    }));

  /* ---- Hero parallax: hills at different depths ---- */
  const heroScrub = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero-inner', { y: 120, autoAlpha: 0.15, ease: 'none', scrollTrigger: heroScrub });
  gsap.to('.hero .layer-back', { y: 70, ease: 'none', scrollTrigger: heroScrub });
  gsap.to('.hero-visual', { y: 30, ease: 'none', scrollTrigger: heroScrub });

  /* ==========================================================================
     Meadow: flowers lean away from the cursor and sway harder when you scroll
     fast; click the grass to plant a new flower
     ========================================================================== */
  let mouse = { x: -999, y: -999 }, wind = 0, windTarget = 0;
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  lenis.on('scroll', ({ velocity }) => { windTarget = gsap.utils.clamp(-12, 12, velocity * 0.6); });

  const leaners = meadowFlowers.filter(f => f.hero).map(f => ({
    el: f.el, quick: gsap.quickTo(f.el, 'rotation', { duration: 0.7, ease: 'power3' }), cx: 0, base: 0
  }));
  gsap.set(leaners.map(l => l.el), { transformOrigin: '50% 100%' });
  let heroVisible = true;
  ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: s => { heroVisible = s.isActive; } });

  gsap.ticker.add(() => {
    wind += (windTarget - wind) * 0.08;
    windTarget *= 0.92;
    if (!heroVisible) return;
    for (const l of leaners) { const r = l.el.getBoundingClientRect(); l.cx = r.left + r.width / 2; l.base = r.bottom; } // reads
    for (const l of leaners) {                                                                                              // writes
      const dx = l.cx - mouse.x, near = Math.abs(dx) < 220 && Math.abs(l.base - mouse.y) < 320;
      const push = near ? Math.sign(dx) * (1 - Math.abs(dx) / 220) * 16 : 0;
      l.quick(push + wind);
    }
  });

  const planted = $('.planted');
  const plantedList = [];
  function plant(at) { // at = spot inside the hero, recorded at click time
    let k;
    const f = makeFlower({ kind: (k = pick(PLANT_KINDS)), pal: pick(PALS_OF[k]), stem: rand(40, 90), w: k === 'sunflower' ? rand(110, 140) : rand(84, 120), bloomDelay: 0.25 });
    f.style.translate = ''; f.style.left = at.x + 'px'; f.style.top = at.y + 'px';
    planted.append(f); plantedList.push(f);
    if (plantedList.length > 30) plantedList.shift().remove();
    gsap.from(f, { scaleY: 0.05, transformOrigin: '50% 100%', duration: 0.9, ease: 'back.out(2)' });
    requestAnimationFrame(() => f.classList.add('is-bloom'));
  }
  $$('.hero .layer').forEach(l => l.addEventListener('click', e => {
    const hr = $('.hero').getBoundingClientRect(), at = { x: e.clientX - hr.left, y: e.clientY - hr.top };
    if (hasFinePointer) setTimeout(() => plant(at), 260); else plant(at); // the water lands first
  }));

  const petalColors = ['#E3A9B7', '#F3D9A0', '#C9B8E6', '#EDB7C3', '#F9E0E4'];

  /* ==========================================================================
     Drifting petals: a few soft petals fall slowly behind the content
     ========================================================================== */
  const drift = $('.drift');
  if (drift) for (let i = 0; i < (isNarrow ? 7 : 12); i++) {
    const s = rand(14, 34), d = rand(26, 48), pt = document.createElement('i');
    pt.className = 'pt';
    pt.style.cssText = `--x:${rand(0, 100).toFixed(0)}%;--s:${s.toFixed(0)}px;--o:${rand(0.45, 0.85).toFixed(2)};--dur:${d.toFixed(0)}s;` +
      `--dl:${(-rand(0, d)).toFixed(0)}s;--sp:${rand(3, 6).toFixed(1)}s;--dx:${rand(-18, 18).toFixed(0)}vw;--b:${s > 26 ? '1.5px' : '0px'}`;
    pt.innerHTML = `<svg viewBox="0 0 20 14"><path d="M1 7 C4 -1 15 -2 19 6 C15 14 4 15 1 7Z" fill="url(#pg-${pick(['blush', 'ivory', 'lilac', 'apricot'])})"/></svg>`;
    drift.append(pt);
  }

  /* ==========================================================================
     Butterfly cursor: replaces the plain dot; wings beat faster while you move
     ========================================================================== */
  const bfly = $('.butterfly');
  if (hasFinePointer && bfly) {
    gsap.set(bfly, { xPercent: -50, yPercent: -50 });
    const bx = gsap.quickTo(bfly, 'x', { duration: 0.28, ease: 'power3' });
    const by = gsap.quickTo(bfly, 'y', { duration: 0.28, ease: 'power3' });
    const tiltTo = gsap.quickTo(bfly, 'rotation', { duration: 0.5, ease: 'power3' });
    let lastX = innerWidth / 2, settle;
    window.addEventListener('mousemove', e => {
      bx(e.clientX + 6); by(e.clientY + 4);
      tiltTo(gsap.utils.clamp(-28, 28, (e.clientX - lastX) * 1.6)); lastX = e.clientX;
      bfly.style.setProperty('--flap', '.14s');
      clearTimeout(settle);
      settle = setTimeout(() => { bfly.style.setProperty('--flap', '.5s'); tiltTo(0); }, 140);
    });
    gsap.to(bfly, { opacity: 1, duration: 0.8, delay: 4.5 });
    gsap.to('.butterfly svg', { y: -3, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* ==========================================================================
     Watering-can cursor: over the grass the cursor becomes a can that tilts and
     drips (no text needed); clicking pours, then a flower grows
     ========================================================================== */
  const can = $('.can');
  if (hasFinePointer && can) {
    const tiltEl = $('.can-tilt', can);
    const cx = gsap.quickTo(can, 'x', { duration: 0.18, ease: 'power3' });
    const cy = gsap.quickTo(can, 'y', { duration: 0.18, ease: 'power3' });
    window.addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); });
    // Scrolling can move the grass out from under a still mouse without a "mouseleave": re-check
    lenis.on('scroll', () => {
      const inZone = !!(document.elementFromPoint(mouse.x, mouse.y) || document.body).closest('.plant-zone');
      if (inZone === root.classList.contains('is-watering')) return;
      root.classList.toggle('is-watering', inZone);
      gsap.to(tiltEl, { rotation: inZone ? -30 : 0, duration: 0.3 });
    });
    $$('.plant-zone').forEach(z => {
      z.addEventListener('mouseenter', () => { root.classList.add('is-watering'); gsap.to(tiltEl, { rotation: -30, duration: 0.5, ease: 'back.out(2)' }); });
      z.addEventListener('mouseleave', () => { root.classList.remove('is-watering'); gsap.to(tiltEl, { rotation: 0, duration: 0.3 }); });
      z.addEventListener('click', e => {
        gsap.fromTo(tiltEl, { rotation: -30 }, { rotation: -54, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' });
        for (let i = 0; i < 9; i++) {
          const d = document.createElement('span');
          d.className = 'drop-burst';
          d.style.left = (e.clientX + rand(-10, 10)) + 'px'; d.style.top = (e.clientY - 4) + 'px';
          document.body.append(d);
          gsap.to(d, { y: rand(20, 60), x: rand(-14, 14), duration: rand(0.35, 0.6), ease: 'power2.in' });
          gsap.to(d, { autoAlpha: 0, delay: 0.25, duration: 0.3, onComplete: () => d.remove() });
        }
      });
    });
  }

  /* ==========================================================================
     Prototype hero: a phone you can actually use. Pick an amount, tap Confirm,
     get the success screen — and flowers grow out around the phone.
     (Placeholder flow: swap in a real project's screens later.)
     ========================================================================== */
  const proto = $('.proto');
  if (proto) {
    const phone = $('.proto-phone'), sprouts = $('.proto-flowers'), views = { send: $('.pp-send'), done: $('.pp-done') };
    const cta = $('[data-confirm]'), amtEls = $$('[data-amt]'), amt2 = $('[data-amt2]'), amtBox = $('.pp-amt strong');
    const grown = [];
    let amt = 1250, backTimer;
    const fmt = n => n.toLocaleString('en-US');
    const setAmt = n => {
      amt = Math.min(25000, Math.max(250, n));
      amtEls.forEach(el => { el.textContent = fmt(amt); });
      gsap.fromTo(amtBox, { scale: 1.07 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' });
    };
    const show = v => Object.entries(views).forEach(([k, el]) => el.classList.toggle('is-on', k === v));

    $$('.pp-step').forEach(b => b.addEventListener('click', () => setAmt(amt + parseInt(b.dataset.step, 10))));
    $$('.pp-chips button').forEach(b => b.addEventListener('click', () => setAmt(parseInt(b.dataset.set, 10))));

    function grow() {
      for (let i = 0; i < 6; i++) {
        const k = pick(PLANT_KINDS);
        const f = makeFlower({ kind: k, pal: pick(PALS_OF[k]), stem: rand(30, 64), w: k === 'sunflower' ? rand(92, 112) : rand(72, 98), bloomDelay: i * 0.12 });
        f.style.left = (8 + i * 17 + rand(-5, 5)) + '%'; f.style.bottom = rand(-4, 12) + '%';
        sprouts.append(f); grown.push(f);
        if (grown.length > 12) grown.shift().remove();
        gsap.from(f, { y: 90, scale: 0.2, autoAlpha: 0, duration: 0.9, delay: i * 0.1, ease: 'back.out(2)', transformOrigin: '50% 100%' });
        requestAnimationFrame(() => f.classList.add('is-bloom'));
      }
      const r = phone.getBoundingClientRect();
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('span');
        p.className = 'burst';
        p.style.background = petalColors[i % petalColors.length];
        p.style.left = (r.left + r.width / 2) + 'px'; p.style.top = (r.top + r.height * 0.55) + 'px';
        document.body.append(p);
        gsap.to(p, { x: rand(-170, 170), y: rand(-190, 40), rotation: rand(-220, 220), scale: rand(0.6, 1.5), duration: rand(1, 1.6), ease: 'power3.out' });
        gsap.to(p, { autoAlpha: 0, delay: 0.8, duration: 0.6, onComplete: () => p.remove() });
      }
    }

    cta.addEventListener('click', () => {
      if (cta.classList.contains('is-busy')) return;
      cta.classList.add('is-busy');
      setTimeout(() => {
        cta.classList.remove('is-busy');
        amt2.textContent = fmt(amt);
        show('done'); grow();
        clearTimeout(backTimer); backTimer = setTimeout(() => show('send'), 5200);
      }, 800);
    });
    $('[data-again]').addEventListener('click', () => { clearTimeout(backTimer); show('send'); });

    // the phone turns a little toward the cursor
    if (hasFinePointer) {
      gsap.set(phone, { transformPerspective: 900 });
      const rx = gsap.quickTo(phone, 'rotationX', { duration: 0.8, ease: 'power3' });
      const ry = gsap.quickTo(phone, 'rotationY', { duration: 0.8, ease: 'power3' });
      window.addEventListener('mousemove', e => {
        const r = proto.getBoundingClientRect();
        ry(gsap.utils.clamp(-14, 14, (e.clientX - (r.left + r.width / 2)) / innerWidth * 28));
        rx(gsap.utils.clamp(-10, 10, -(e.clientY - (r.top + r.height / 2)) / innerHeight * 20));
      });
    }
  }

  /* ==========================================================================
     Sky that answers the mouse (kept light): a soft glow follows the cursor,
     gentle ripples spread as you move (bigger on click), and the clouds drift
     a little with the cursor at different depths
     ========================================================================== */
  if (hasFinePointer) {
    const glow = $('.glow');
    const gx = gsap.quickTo(glow, 'x', { duration: 0.9, ease: 'power3' });
    const gy = gsap.quickTo(glow, 'y', { duration: 0.9, ease: 'power3' });
    const cloudShift = [['far', 10], ['mid', 22], ['near', 40]].map(([k, depth]) => [gsap.quickTo($('.cl-' + k), 'x', { duration: 1.6, ease: 'power3' }), depth]);
    function ripple(x, y, size) {
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.left = x + 'px'; r.style.top = y + 'px'; r.style.setProperty('--rs', size + 'px');
      r.addEventListener('animationend', () => r.remove());
      document.body.append(r);
    }
    let lx = null, ly = 0, lastAt = 0;
    window.addEventListener('mousemove', e => {
      glow.classList.add('on'); gx(e.clientX); gy(e.clientY);
      cloudShift.forEach(([q, depth]) => q(-(e.clientX / innerWidth - 0.5) * depth));
      if (lx === null) { lx = e.clientX; ly = e.clientY; }
      const d = Math.hypot(e.clientX - lx, e.clientY - ly), now = performance.now();
      if (d > 110 && now - lastAt > 120) { ripple(e.clientX, e.clientY, 150 + Math.min(d, 300) * 0.5); lx = e.clientX; ly = e.clientY; lastAt = now; }
    });
    window.addEventListener('click', e => { ripple(e.clientX, e.clientY, 320); setTimeout(() => ripple(e.clientX, e.clientY, 220), 140); });
  }

  /* ---- Nav: glass pill slides to the hovered link; Bi reacts to it ---- */
  const navPill = $('.nav-pill');
  $$('.nav-links a').forEach(a => {
    a.addEventListener('mouseenter', () => {
      const r = a.getBoundingClientRect(), pr = a.parentElement.getBoundingClientRect();
      gsap.to(navPill, { x: r.left - pr.left, width: r.width, autoAlpha: 1, duration: 0.5, ease: 'expo.out' });
    });
  });
  $('.nav-links').addEventListener('mouseleave', () => {
    gsap.to(navPill, { autoAlpha: 0, duration: 0.3 });
  });

  /* ---- Marquee: drifts on its own, speeds up (and reverses) with scroll ---- */
  const marqueeTween = gsap.to('.marquee-track', { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
  let dir = 1, boost = 0;
  lenis.on('scroll', ({ velocity }) => {
    if (Math.abs(velocity) > 0.4) dir = velocity < 0 ? -1 : 1;
    boost = Math.min(Math.abs(velocity), 24);
  });
  gsap.ticker.add(() => { boost *= 0.94; marqueeTween.timeScale(dir * (1 + boost * 0.7)); });

  /* ---- Generic reveal on scroll ---- */
  $$('.reveal').forEach(el => {
    gsap.from(el, { y: 48, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---- Works: clip-path reveal, image parallax, layered phones, peeking flowers, tilt ---- */
  $$('.work-item').forEach(item => {
    const media = $('.media', item);
    const inner = $('.media-inner', item);
    const peek = $('.peek', item);

    gsap.fromTo(media,
      { clipPath: 'inset(14% 10% 14% 10% round 48px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 32px)', ease: 'none', scrollTrigger: { trigger: media, start: 'top 96%', end: 'top 35%', scrub: true } });

    gsap.fromTo(inner, { yPercent: -9 }, {
      yPercent: 9, ease: 'none',
      scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true }
    });

    $$('.phone[data-speed]', item).forEach(p => {
      gsap.to(p, {
        y: parseFloat(p.dataset.speed) * -160, ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    if (peek) {
      peek.classList.add('is-bloom');
      const s = parseFloat(peek.dataset.speed);
      gsap.fromTo(peek, { y: 70 * s, rotation: -30 }, {
        y: -70 * s, rotation: 40, ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  });

  if (hasFinePointer) {
    $$('.tilt').forEach(el => {
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3' });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 7);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
      });
      el.addEventListener('mouseleave', () => { rx(0); ry(0); });
      gsap.set(el, { transformPerspective: 1200 });
    });
  }

  /* ---- Experiences: words light up as you scroll, rows float in ---- */
  const words = splitWords($('[data-split]'));
  gsap.fromTo(words, { opacity: 0.16 }, {
    opacity: 1, stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.about-text', start: 'top 82%', end: 'bottom 48%', scrub: true }
  });
  gsap.from('.xp li', {
    y: 50, autoAlpha: 0, stagger: 0.12, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.xp', start: 'top 85%' }
  });

  /* ---- Contact: headline, button pop, and the garden grows ---- */
  gsap.from('.contact-title .line-inner', {
    yPercent: 115, duration: 1.4, stagger: 0.12, ease: 'expo.out',
    scrollTrigger: { trigger: '.contact-title', start: 'top 85%' }
  });
  gsap.from('.contact-btn', {
    scale: 0, duration: 1.2, ease: 'elastic.out(1, 0.6)',
    scrollTrigger: { trigger: '.contact-btn', start: 'top 92%' }
  });

  const gardenFlowers = meadowFlowers.filter(f => !f.hero && !f.bouquet).map(f => f.el);
  gsap.set('.garden .layer', { yPercent: 35 });
  gsap.to('.garden .layer', {
    yPercent: 0, duration: 1.6, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.garden', start: 'top 92%', once: true }
  });
  ScrollTrigger.create({
    trigger: '.garden', start: 'top 85%', once: true,
    onEnter: () => {
      gsap.from(gardenFlowers, { scaleY: 0.05, transformOrigin: '50% 100%', duration: 1, stagger: 0.07, ease: 'back.out(2)' });
      gardenFlowers.forEach(el => el.classList.add('is-bloom'));
    }
  });

  if (hasFinePointer) {
    $$('.magnetic').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.4);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---- Custom cursor: dot follows instantly, glass ring follows with lag ---- */
  if (hasFinePointer) {
    root.classList.add('has-cursor');
    const dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('mousemove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });

    $$('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => { label.textContent = el.dataset.cursor; ring.classList.add('is-label'); if (bfly) gsap.to(bfly, { opacity: 0.12, duration: 0.2, overwrite: 'auto' }); });
      el.addEventListener('mouseleave', () => { ring.classList.remove('is-label'); if (bfly) gsap.to(bfly, { opacity: 1, duration: 0.3, overwrite: 'auto' }); });
    });
    $$('[data-cursor-grow]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-grow'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-grow'));
    });
  }

  /* ---- Recalculate scroll positions once fonts/images have loaded ---- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
