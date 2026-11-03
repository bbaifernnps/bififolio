'use strict';

/* =====================================================================
   Headquarters — an Inside Out mood tracker
   ===================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DESKTOP = matchMedia('(min-width: 900px)');
const HOVERABLE = matchMedia('(hover: hover)');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- emotions ---------- */
// fx: what the particles around the orb do for this emotion
const EMOTIONS = [
  { id: 'joy', name: 'Joy', color: '#ffd23f', meaning: 'Something good happened. Light and bright.',
    fx: { rate: 6, kind: 'star', colors: ['#ffd23f', '#fff1a8', '#ffffff'], spawn: 'ring', vx: [-7, 7], vy: [-12, -28], life: [2.2, 3.4], size: [9, 16], spin: [-.5, .5] } },
  { id: 'sadness', name: 'Sadness', color: '#3d9bff', meaning: 'Feeling low, heavy, or a bit tender.',
    fx: { rate: 3.5, kind: 'drop', colors: ['#8ec8ff', '#3d9bff'], spawn: 'top', vx: [-3, 3], vy: [14, 30], g: 22, life: [1.8, 2.6], size: [8, 12] } },
  { id: 'anger', name: 'Anger', color: '#ff4b4b', meaning: 'Something felt unfair or frustrating.',
    fx: { rate: 6, kind: 'glow', colors: ['#ff6b5b', '#ff9a3d', '#ffd08a'], spawn: 'top', vx: [-8, 8], vy: [-20, -44], life: [1.4, 2.2], size: [7, 13] } },
  { id: 'fear', name: 'Fear', color: '#a26bff', meaning: "Worried or unsafe about what's ahead.",
    fx: { rate: 5, kind: 'star', colors: ['#cdb0ff', '#ffffff'], spawn: 'ring', vx: [-4, 4], vy: [-4, 4], life: [1.6, 2.4], size: [7, 12], spin: [-.6, .6] } },
  { id: 'disgust', name: 'Disgust', color: '#7ed348', meaning: 'Something felt off or not right.',
    fx: { rate: 3.5, kind: 'bubble', colors: ['#a9ec7a', '#7ed348'], spawn: 'ring', vy: [-10, -22], sway: 7, life: [2.6, 3.6], size: [10, 18] } },
  { id: 'anxiety', name: 'Anxiety', color: '#ff9a2e', meaning: 'Overthinking all the what-ifs.',
    fx: { rate: 6, kind: 'glow', colors: ['#ffb45c', '#ff9a2e', '#fff0d0'], orbit: true, life: [2, 3], size: [5, 10] } },
  { id: 'envy', name: 'Envy', color: '#22cdbe', meaning: 'Wanting what someone else has.',
    fx: { rate: 4.5, kind: 'star', colors: ['#86f3e8', '#22cdbe', '#ffffff'], spawn: 'ring', vx: [5, 14], vy: [-4, -12], sway: 5, life: [2.2, 3.2], size: [7, 13], spin: [-.4, .4] } },
  { id: 'ennui', name: 'Ennui', color: '#5561e8', meaning: 'Bored, drained, just… meh.',
    fx: { rate: 3, kind: 'glow', colors: ['#8a94ff', '#5561e8'], spawn: 'ring', vy: [4, 10], life: [3, 4.5], size: [8, 14], alpha: .45 } },
  { id: 'embarrassment', name: 'Embarrassed', color: '#ff74b8', meaning: 'Cringing and wanting to hide.',
    fx: { rate: 3.5, kind: 'heart', colors: ['#ff8ec7', '#ffb3d9'], spawn: 'ring', vy: [-12, -26], sway: 7, life: [2.4, 3.4], size: [9, 15] } },
];
// a core memory adds slow golden motes on top of whatever the emotion does
const CORE_FX = { rate: 7, kind: 'star', colors: ['#ffd85e', '#fff2b8', '#ffffff'], spawn: 'ring', vx: [-5, 5], vy: [-8, -20], life: [2.6, 3.8], size: [8, 15], spin: [-.4, .4] };
const BY_ID = Object.fromEntries(EMOTIONS.map(e => [e.id, e]));
const INTENSITY = { 1: 'A little', 2: 'Quite a bit', 3: 'A lot' };
const ORB_SIZE = { 1: 38, 2: 46, 3: 54 };
const GOLD = '#ffd85e';

const mix = (hex, to, t) => {
  const n = parseInt(hex.slice(1), 16), m = parseInt(to.slice(1), 16);
  const c = (s) => Math.round(((n >> s) & 255) * (1 - t) + ((m >> s) & 255) * t);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
};
const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

function paint(el, emotion) {
  if (!emotion) { el.classList.add('empty'); ['--c', '--cl', '--cd', '--glow'].forEach(p => el.style.removeProperty(p)); return; }
  el.classList.remove('empty');
  el.style.setProperty('--c', emotion.color);
  el.style.setProperty('--cl', mix(emotion.color, '#ffffff', .5));
  el.style.setProperty('--cd', mix(emotion.color, '#000000', .38));
  el.style.setProperty('--glow', emotion.color + '99');
}
function makeOrb(emotion, size, core, photoUrl) {
  const o = document.createElement('span');
  o.className = 'orb' + (core ? ' core' : '');
  o.style.setProperty('--s', size + 'px');
  paint(o, emotion);
  applyPhoto(o, photoUrl);
  return o;
}
// a photo shows faintly inside the orb, like the scenes inside memory orbs in the film
function applyPhoto(el, url) {
  el.classList.toggle('has-photo', !!url);
  if (url) el.style.setProperty('--photo', `url("${url}")`); else el.style.removeProperty('--photo');
}

/* ---------- storage ---------- */
const KEY = 'inside-out-mood-v1';
const PREFS_KEY = 'inside-out-prefs-v1';
let memories = [];
let prefs = { vol: 55 };
try { memories = JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { memories = []; }
try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS_KEY)) || {}); } catch (_) { /* keep defaults */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(memories)); } catch (_) { /* private mode */ } };
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (_) { /* private mode */ } };

/* ---------- helpers ---------- */
const fmtDay = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const fmtFull = (ts) => new Date(ts).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const dayKey = (ts) => { const d = new Date(ts); return d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); };
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8z"/></svg>';
const buzz = (ms) => { try { if (navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(ms); } catch (_) { /* unsupported */ } };

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1900);
}
const orbCenter = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; };

/* =====================================================================
   Photos: shrunk in the browser, kept in IndexedDB (bigger than localStorage)
   ===================================================================== */
const Photos = (() => {
  let db = null;
  const urls = new Map();   // memory id -> object URL for this session
  const open = () => new Promise(res => {
    try {
      const rq = indexedDB.open('inside-out-photos', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('p');
      rq.onsuccess = () => { db = rq.result; res(true); };
      rq.onerror = () => res(false);
    } catch (_) { res(false); }
  });
  const req = (mode, fn) => new Promise(res => {
    if (!db) return res(null);
    try { const r = fn(db.transaction('p', mode).objectStore('p')); r.onsuccess = () => res(r.result ?? true); r.onerror = () => res(null); }
    catch (_) { res(null); }
  });
  return {
    url: (id) => urls.get(id) || null,
    async load(list) {
      if (!(await open())) return;
      await Promise.all(list.filter(m => m.photo).map(async m => {
        const blob = await req('readonly', s => s.get(m.id));
        if (blob && blob !== true) urls.set(m.id, URL.createObjectURL(blob));
      }));
    },
    async add(id, blob, url) { urls.set(id, url); await req('readwrite', s => s.put(blob, id)); },   // still shows this session if storage is blocked
    async remove(id) {
      const u = urls.get(id); if (u) URL.revokeObjectURL(u);
      urls.delete(id); await req('readwrite', s => s.delete(id));
    },
  };
})();

// make a chosen picture small: square crop, 640px, JPEG. Keeps the site light and the saved data tiny.
async function shrinkImage(file, size = 640) {
  const bmp = await (window.createImageBitmap
    ? createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => viaImg(file))
    : viaImg(file));
  const w = bmp.width, h = bmp.height, s = Math.min(w, h);
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  cv.getContext('2d').drawImage(bmp, (w - s) / 2, (h - s) / 2, s, s, 0, 0, size, size);
  return new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error('encode')), 'image/jpeg', .82));
}
function viaImg(file) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file), img = new Image();
    img.onload = () => { URL.revokeObjectURL(u); res(img); };
    img.onerror = () => { URL.revokeObjectURL(u); rej(new Error('decode')); };
    img.src = u;
  });
}

/* =====================================================================
   Scene: aligns the orb with the pedestal in the artwork + parallax
   ===================================================================== */
const scene = $('#scene'), tint = $('#tint'), stage = $('#stage');
const IMG = { w: 1200, h: 675, pedX: 612, pedY: 492 };   // pedestal cap in the source image
const MARGIN = 24;                                        // scene bleeds 24px past the viewport (parallax room)

function layoutScene() {
  const d = DESKTOP.matches;
  const W = innerWidth + MARGIN * 2, H = innerHeight + MARGIN * 2;
  const sc = Math.max(W / IMG.w, H / IMG.h);
  let fx = d ? .5 : .14;
  const fy = d ? .5 : .4;
  const span = W - IMG.w * sc;   // negative when the artwork is cropped left/right
  if (d && span < 0) {
    // on narrower desktops, slide the artwork so the pedestal lands in the space left of the control panel
    const free = (innerWidth - (410 + clamp(innerWidth * .04, 24, 64))) / 2;
    if (span * .5 - MARGIN + IMG.pedX * sc > free) fx = clamp((free - IMG.pedX * sc + MARGIN) / span, 0, 1);
  }
  scene.style.backgroundPosition = `${fx * 100}% ${fy * 100}%`;
  const ox = (W - IMG.w * sc) * fx - MARGIN, oy = (H - IMG.h * sc) * fy - MARGIN;
  const px = ox + IMG.pedX * sc, py = oy + IMG.pedY * sc;
  const root = document.documentElement.style;
  root.setProperty('--ped-x', px + 'px');
  root.setProperty('--ped-y', py + 'px');
  tint.style.setProperty('--tint-x', d ? px + 'px' : '50%');
  tint.style.setProperty('--tint-y', d ? (py - 140) + 'px' : '32%');
}

const parallax = { tx: 0, ty: 0, x: 0, y: 0 };
addEventListener('pointermove', (e) => {
  if (REDUCED || !DESKTOP.matches || !HOVERABLE.matches) return;
  parallax.tx = -(e.clientX / innerWidth - .5) * 22;
  parallax.ty = -(e.clientY / innerHeight - .5) * 14;
}, { passive: true });

/* =====================================================================
   FX: particles (ambient dust + per-emotion behaviour + bursts)
   ===================================================================== */
const FX = (() => {
  const cv = $('#fx'), ctx = cv.getContext('2d');
  const sprites = {};
  let W = 0, H = 0, parts = [], last = 0, current = null, coreOn = false, ambientAcc = 0;
  const acc = {};

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function sprite(kind, color) {
    const key = kind + color;
    if (sprites[key]) return sprites[key];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const glow = (a) => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, rgba(color, a)); gr.addColorStop(1, rgba(color, 0));
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    };
    if (kind === 'glow') {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.22, rgba(color, .95)); gr.addColorStop(1, rgba(color, 0));
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    } else if (kind === 'star') {
      glow(.45);
      g.fillStyle = color; g.beginPath();
      g.moveTo(32, 2); g.quadraticCurveTo(32, 32, 62, 32); g.quadraticCurveTo(32, 32, 32, 62);
      g.quadraticCurveTo(32, 32, 2, 32); g.quadraticCurveTo(32, 32, 32, 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(32, 32, 5, 0, 7); g.fill();
    } else if (kind === 'heart') {
      g.fillStyle = color; g.beginPath(); g.moveTo(32, 56);
      g.bezierCurveTo(2, 34, 10, 6, 32, 22); g.bezierCurveTo(54, 6, 62, 34, 32, 56); g.fill();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(21, 22, 5, 3, -.6, 0, 7); g.fill();
    } else if (kind === 'drop') {
      g.fillStyle = color; g.beginPath(); g.moveTo(32, 4);
      g.bezierCurveTo(40, 20, 52, 30, 52, 42); g.arc(32, 42, 20, 0, Math.PI); g.bezierCurveTo(12, 30, 24, 20, 32, 4); g.fill();
      g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(24, 42, 3.5, 7, .2, 0, 7); g.fill();
    } else if (kind === 'bubble') {
      const gr = g.createRadialGradient(32, 32, 14, 32, 32, 30);
      gr.addColorStop(0, rgba(color, .06)); gr.addColorStop(.85, rgba(color, .5)); gr.addColorStop(1, rgba(color, 0));
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2.5; g.beginPath(); g.arc(32, 32, 24, 0, 7); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(23, 22, 5, 3, -.7, 0, 7); g.fill();
    }
    return (sprites[key] = c);
  }

  function spawn(p) {
    if (parts.length > 420) return;
    parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 0, age: 0, life: 1, size: 10, rot: 0, spin: 0, alpha: 1, sway: 0, sf: rand(2, 4), sp: rand(0, 6), kind: 'glow', color: '#fff' }, p));
  }

  function emit(e, dt) {
    const f = e.fx, o = orbCenter($('#mainOrb'));
    acc[e.id] = (acc[e.id] || 0) + f.rate * dt;
    while (acc[e.id] >= 1) {
      acc[e.id]--;
      const col = pick(f.colors), life = rand(...f.life), size = rand(...f.size);
      const base = { kind: f.kind, color: col, life, size, alpha: (f.alpha || 1) * .8, sway: f.sway || 0, g: f.g || 0, spin: f.spin ? rand(...f.spin) : 0 };
      if (f.orbit) {
        const a = rand(0, 6.283), r = o.r * rand(1.12, 1.4);
        spawn({ ...base, orbit: { cx: o.x, cy: o.y, a, r, w: rand(.5, .9) * (Math.random() < .5 ? 1 : -1) } });
      } else if (f.spawn === 'top') {
        spawn({ ...base, x: o.x + rand(-o.r * .85, o.r * .85), y: o.y - o.r * rand(.85, 1.15), vx: rand(...f.vx), vy: rand(...f.vy) });
      } else {
        const a = rand(0, 6.283), r = o.r * rand(.92, 1.18);
        spawn({ ...base, x: o.x + Math.cos(a) * r, y: o.y + Math.sin(a) * r, vx: f.vx ? rand(...f.vx) : 0, vy: f.vy ? rand(...f.vy) : 0 });
      }
    }
  }

  function ambient() {
    spawn({ x: rand(0, W), y: H + 10, vx: rand(-6, 6), vy: -rand(6, 16), life: rand(14, 22), size: rand(3, 7), alpha: .4, sway: 8, kind: 'glow', color: '#ffffff' });
  }

  function burst(x, y, color, n = 10, opts = {}) {
    if (REDUCED) return;
    for (let i = 0; i < n; i++) {
      const a = rand(0, 6.283), sp = rand(30, opts.speed || 95);
      spawn({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 12, g: 14, drag: 1.3, life: rand(1.2, 2.1), size: rand(6, 14), alpha: .85,
        kind: Math.random() < (opts.stars ?? .5) ? 'star' : 'glow', color: Math.random() < .3 ? '#ffffff' : color, spin: rand(-1, 1) });
    }
  }

  // glowing comet trail behind a flying orb
  function trail(x, y, color) {
    if (REDUCED) return;
    for (let i = 0; i < 2; i++) {
      spawn({ x: x + rand(-4, 4), y: y + rand(-4, 4), vx: rand(-8, 8), vy: rand(-8, 8), life: rand(.6, 1), size: rand(7, 15), alpha: .75,
        kind: Math.random() < .35 ? 'star' : 'glow', color: Math.random() < .3 ? '#ffffff' : color, spin: rand(-1, 1) });
    }
  }
  // grey dust for a forgotten memory, drifting down like the memory dump
  function dust(x, y, n = 18) {
    if (REDUCED) return;
    for (let i = 0; i < n; i++) {
      spawn({ x: x + rand(-18, 18), y: y + rand(-14, 14), vx: rand(-12, 12), vy: rand(-8, 10), g: 16, drag: .4, life: rand(1.4, 2.4), size: rand(3, 8), alpha: .6,
        kind: 'glow', color: pick(['#c9c2d6', '#a89fbb', '#ffffff']) });
    }
  }

  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    // parallax easing
    parallax.x += (parallax.tx - parallax.x) * Math.min(1, dt * 4);
    parallax.y += (parallax.ty - parallax.y) * Math.min(1, dt * 4);
    scene.style.transform = `translate(${parallax.x.toFixed(2)}px, ${parallax.y.toFixed(2)}px)`;
    stage.style.setProperty('--px', parallax.x.toFixed(2) + 'px');
    stage.style.setProperty('--py', parallax.y.toFixed(2) + 'px');

    ambientAcc += dt * 1.1; while (ambientAcc >= 1) { ambientAcc--; ambient(); }
    if (current) emit(current, dt);
    if (coreOn) emit({ id: 'core', fx: CORE_FX }, dt);

    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.age += dt;
      if (p.age >= p.life) { parts.splice(i, 1); continue; }
      if (p.orbit) {
        p.orbit.a += p.orbit.w * dt;
        p.x = p.orbit.cx + Math.cos(p.orbit.a) * p.orbit.r;
        p.y = p.orbit.cy + Math.sin(p.orbit.a) * p.orbit.r * .92;
      } else {
        if (p.drag) { const k = Math.max(0, 1 - p.drag * dt); p.vx *= k; p.vy *= k; }
        p.vy += p.g * dt;
        p.x += p.vx * dt + (p.sway ? Math.sin(p.age * p.sf + p.sp) * p.sway * dt : 0);
        p.y += p.vy * dt;
      }
      p.rot += p.spin * dt;
      const t = p.age / p.life;
      const a = (t < .15 ? t / .15 : 1 - (t - .15) / .85) * p.alpha;
      const s = p.size * (p.kind === 'bubble' ? 1 + t * .25 : 1);
      ctx.globalAlpha = clamp(a, 0, 1);
      const sp = sprite(p.kind, p.color);
      if (p.rot) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.drawImage(sp, -s / 2, -s / 2, s, s); ctx.restore(); }
      else ctx.drawImage(sp, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  function start() {
    if (REDUCED) return;
    resize(); addEventListener('resize', resize);
    for (let i = 0; i < 18; i++) {   // pre-warm ambient motes
      spawn({ x: rand(0, W), y: rand(0, H), vx: rand(-6, 6), vy: -rand(6, 16), life: rand(14, 22), size: rand(3, 7), alpha: .4, sway: 8, kind: 'glow', color: '#ffffff', age: rand(0, 8) });
    }
    requestAnimationFrame(frame);
  }
  return { start, burst, trail, dust, setEmotion: (e) => { current = REDUCED ? null : e; }, setCore: (on) => { coreOn = !REDUCED && on; } };
})();

/* =====================================================================
   Today
   ===================================================================== */
let activeView = 'today';
let picked = null, preview = null, intensity = 2, core = false;
let pendingPhoto = null;   // { blob, url } chosen on Today, not stored yet
$('#todayDate').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

const mainOrb = $('#mainOrb'), orbWrap = $('#orbWrap'), picker = $('#picker');
EMOTIONS.forEach((e, i) => {
  const b = document.createElement('button');
  b.className = 'pick'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false');
  b.setAttribute('aria-label', `${e.name}: ${e.meaning}`); b.dataset.id = e.id; b.style.setProperty('--i', i);
  b.append(makeOrb(e, 42));
  const s = document.createElement('span'); s.textContent = e.name; b.append(s);
  picker.append(b);
});

// the readout (name + meaning) lives under the orb on phones and inside the panel on desktop
function placeReadout() {
  const r = $('#readout');
  (DESKTOP.matches ? $('#panelHead') : stage).append(r);
}

function shownEmotion() { return BY_ID[preview || picked] || null; }

function renderToday() {
  const e = shownEmotion();
  paint(mainOrb, e);
  applyPhoto(mainOrb, pendingPhoto && pendingPhoto.url);
  EMOTIONS.forEach(m => orbWrap.classList.toggle('mood-' + m.id, !!e && e.id === m.id));
  orbWrap.style.setProperty('--k', .86 + intensity * .09);
  orbWrap.style.setProperty('--glow', e ? e.color + '88' : 'rgba(200,190,255,.35)');
  mainOrb.classList.toggle('core', core && !!picked);
  orbWrap.classList.toggle('core-on', core && !!picked);
  $('#emotionName').textContent = e ? e.name : "How's today feeling?";
  $('#emotionMeaning').textContent = e ? e.meaning : 'Pick the emotion that ran Headquarters today.';
  $$('.pick').forEach(b => b.setAttribute('aria-checked', String(b.dataset.id === picked)));
  picker.classList.toggle('has-pick', !!picked);
  $('#store').disabled = !picked;
  $$('#intensity button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.i === intensity)));
  $('#coreToggle').setAttribute('aria-pressed', String(core));
  syncFx(); applyTint();
}

function syncFx() {
  FX.setEmotion(activeView === 'today' ? shownEmotion() : null);
  FX.setCore(activeView === 'today' && core && !!picked);
}

const retrigger = (cls) => { orbWrap.classList.remove('pop', 'poke', 'next'); void orbWrap.offsetWidth; orbWrap.classList.add(cls); };

function chooseEmotion(id) {
  picked = id; preview = null;
  retrigger('pop'); renderToday();
  const o = orbCenter(mainOrb);
  FX.burst(o.x, o.y, BY_ID[id].color, 12);
  buzz(12);
}

picker.addEventListener('click', ev => { const b = ev.target.closest('.pick'); if (b) chooseEmotion(b.dataset.id); });
// hovering an emotion previews it on the big orb (mouse only)
picker.addEventListener('pointerover', ev => {
  if (!HOVERABLE.matches) return;
  const b = ev.target.closest('.pick');
  if (b && preview !== b.dataset.id) { preview = b.dataset.id; renderToday(); }
});
picker.addEventListener('pointerleave', () => { if (preview) { preview = null; renderToday(); } });

$('#intensity').addEventListener('click', ev => {
  const b = ev.target.closest('button'); if (!b) return;
  intensity = +b.dataset.i; renderToday();
});
$('#coreToggle').addEventListener('click', () => {
  core = !core; renderToday();
  if (core && picked) { const o = orbCenter(mainOrb); FX.burst(o.x, o.y, GOLD, 14, { stars: .8 }); }
});

// poke the orb
$('#orbBtn').addEventListener('click', () => {
  retrigger('poke');
  const o = orbCenter(mainOrb), e = shownEmotion();
  FX.burst(o.x, o.y, e ? e.color : '#d8ccff', 8);
    buzz(8);
});

// the glossy highlight leans toward the cursor (about 7% at most, eased in CSS)
let hlRaf = 0, hlX = 0, hlY = 0;
addEventListener('pointermove', (ev) => {
  hlX = ev.clientX; hlY = ev.clientY;
  if (hlRaf || activeView !== 'today' || REDUCED || !HOVERABLE.matches) return;
  hlRaf = requestAnimationFrame(() => {
    hlRaf = 0;
    const o = orbCenter(mainOrb);
    const dx = clamp((hlX - o.x) / (innerWidth / 2), -1, 1);
    const dy = clamp((hlY - o.y) / (innerHeight / 2), -1, 1);
    mainOrb.style.setProperty('--hx', (30 + dx * 7) + '%');
    mainOrb.style.setProperty('--hy', (24 + dy * 7) + '%');
  });
}, { passive: true });

// ----- optional photo -----
const photoBtn = $('#photoBtn'), photoInput = $('#photoInput'), photoClear = $('#photoClear');
function paintPhotoButton() {
  photoBtn.classList.toggle('has', !!pendingPhoto);
  photoBtn.querySelector('.photo-thumb').style.backgroundImage = pendingPhoto ? `url("${pendingPhoto.url}")` : '';
  photoClear.hidden = !pendingPhoto;
  photoBtn.setAttribute('aria-label', pendingPhoto ? 'Change photo' : 'Add a photo (optional)');
}
function clearPendingPhoto() {
  if (pendingPhoto) URL.revokeObjectURL(pendingPhoto.url);
  pendingPhoto = null; paintPhotoButton(); renderToday();
}
photoBtn.addEventListener('click', () => photoInput.click());
photoClear.addEventListener('click', clearPendingPhoto);
photoInput.addEventListener('change', async () => {
  const file = photoInput.files && photoInput.files[0]; photoInput.value = '';
  if (!file) return;
  try {
    const blob = await shrinkImage(file);
    if (pendingPhoto) URL.revokeObjectURL(pendingPhoto.url);
    pendingPhoto = { blob, url: URL.createObjectURL(blob) };
    paintPhotoButton(); renderToday();
    retrigger('pop');
  } catch (_) { toast("Couldn't read that photo"); }
});

let freshId = null;   // the memory just stored, gets a soft pulse on the shelf

function store() {
  if (!picked) return;
  const e = BY_ID[picked], o = orbCenter(mainOrb), wasCore = core;
  // 1. the orb is "sealed": a ripple spreads out (double + gold for a core memory)
  ripple(o, e.color);
  if (wasCore) { ripple(o, GOLD, 160); flashTint(GOLD, 1800); }
  FX.burst(o.x, o.y, e.color, 14);
  if (wasCore) FX.burst(o.x, o.y, GOLD, 26, { stars: .9, speed: 120 });
  buzz(wasCore ? [12, 40, 20] : 15);
  // 2. it travels to the shelf on a glowing path
  flyToShelf(wasCore ? GOLD : e.color, () => catchOrb(wasCore ? GOLD : e.color));
  const id = Date.now().toString(36); freshId = id;
  const hasPhoto = !!pendingPhoto;
  if (hasPhoto) { Photos.add(id, pendingPhoto.blob, pendingPhoto.url); pendingPhoto = null; paintPhotoButton(); }
  memories.push({ id, ts: Date.now(), emotion: picked, intensity, core, note: $('#note').value.trim(), photo: hasPhoto });
  save();
  toast(wasCore ? 'New core memory formed ★' : `${e.name} memory stored`);
  // 3. a fresh blank orb rolls onto the console
  picked = null; preview = null; intensity = 2; core = false; $('#note').value = '';
  retrigger('next');
  renderToday(); renderChips(); renderShelf(); renderInsights();
}
$('#store').addEventListener('click', store);

function ripple(o, color, delay = 0) {
  if (REDUCED) return;
  const r = document.createElement('span');
  Object.assign(r.style, { position: 'fixed', left: (o.x - o.r) + 'px', top: (o.y - o.r) + 'px', width: o.r * 2 + 'px', height: o.r * 2 + 'px', borderRadius: '50%',
    border: `2px solid ${color}`, boxShadow: `0 0 28px ${color}, inset 0 0 22px ${color}`, pointerEvents: 'none', zIndex: 45, opacity: 0 });
  document.body.append(r);
  r.animate([{ transform: 'scale(.9)', opacity: .85 }, { transform: 'scale(2.1)', opacity: 0 }], { duration: 1000, delay, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => r.remove();
}

// the orb arcs up and over into the Shelf tab, leaving a trail of light
function flyToShelf(color, done) {
  if (REDUCED) { done(); return; }
  const a = mainOrb.getBoundingClientRect(), b = $('#navShelf').getBoundingClientRect();
  const clone = mainOrb.cloneNode(true);
  Object.assign(clone.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', margin: 0, zIndex: 50, pointerEvents: 'none', animation: 'none' });
  document.body.append(clone);
  const sx = a.left + a.width / 2, sy = a.top + a.height / 2, ex = b.left + b.width / 2, ey = b.top + b.height / 2;
  const cx = sx + (ex - sx) * .1, cy = Math.max(24, Math.min(sy, ey) - 110);   // control point: up and over
  const end = 26 / a.width, dur = 1250, t0 = performance.now();
  let lastTrail = 0;
  (function step(now) {
    const k = clamp((now - t0) / dur, 0, 1), t = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;   // ease in-out
    const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex;
    const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey;
    clone.style.transform = `translate(${x - sx}px, ${y - sy}px) scale(${1 + (end - 1) * Math.pow(t, .8)})`;
    if (now - lastTrail > 28) { FX.trail(x, y, color); lastTrail = now; }
    if (k < 1) requestAnimationFrame(step);
    else { clone.remove(); done(); }
  })(t0);
}

// the Shelf tab "catches" the orb
function catchOrb(color) {
  const btn = $('#navShelf');
  btn.style.setProperty('--catch', color);
  btn.classList.remove('catch'); void btn.offsetWidth; btn.classList.add('catch');
  const s = orbCenter(btn);
  FX.burst(s.x, s.y, color, 8, { speed: 70 });
}

// a brief wash of colour over the whole room (core memories light it gold)
let tintHold = 0;
function flashTint(hex, ms) {
  clearTimeout(tintHold);
  tint.style.setProperty('--tint', hex + 'dd');
  tintHold = setTimeout(() => { tintHold = 0; applyTint(); }, ms);
}

/* =====================================================================
   Shelf
   ===================================================================== */
let selected = null, filter = null, shelfEnter = false;

function renderChips() {
  const box = $('#chips'); box.innerHTML = '';
  const present = new Set(memories.map(m => m.emotion));
  if (filter && !present.has(filter)) filter = null;
  if (present.size < 2) { box.style.display = 'none'; return; }
  box.style.display = '';
  const all = document.createElement('button');
  all.className = 'chip all'; all.textContent = 'All'; all.setAttribute('aria-pressed', String(!filter));
  all.onclick = () => { filter = null; renderChips(); renderShelf(); };
  box.append(all);
  EMOTIONS.filter(e => present.has(e.id)).forEach(e => {
    const c = document.createElement('button');
    c.className = 'chip'; c.setAttribute('aria-pressed', String(filter === e.id));
    c.append(makeOrb(e, 18)); c.append(document.createTextNode(e.name));
    c.onclick = () => { filter = filter === e.id ? null : e.id; renderChips(); renderShelf(); };
    box.append(c);
  });
}

function renderShelf() {
  const grid = $('#shelfGrid'); grid.innerHTML = '';
  const all = [...memories].sort((a, b) => b.ts - a.ts);
  const list = filter ? all.filter(m => m.emotion === filter) : all;
  const cores = all.filter(m => m.core).length;
  $('#shelfCount').textContent = all.length
    ? (filter ? `${list.length} of ${all.length}` : `${all.length} ${all.length === 1 ? 'memory' : 'memories'}${cores ? ` · ${cores} core` : ''}`)
    : '';

  if (!all.length) {
    grid.style.display = 'block'; grid.classList.remove('enter');
    grid.innerHTML = `<div class="empty-state"><span class="orb empty"></span><div>Your shelf is empty.<br>Store your first memory from Today.</div><button class="link" id="sampleBtn">Fill with sample memories</button></div>`;
    $('#sampleBtn').onclick = loadSamples;
    $('#detail').classList.remove('show');
    return;
  }
  grid.style.display = '';
  grid.classList.toggle('enter', shelfEnter && !REDUCED); shelfEnter = false;
  list.forEach((m, i) => {
    const b = document.createElement('button');
    b.className = 'mem' + (m.id === selected ? ' sel' : '') + (m.id === freshId ? ' fresh' : ''); b.dataset.id = m.id; b.style.setProperty('--i', i);
    b.setAttribute('aria-label', `${BY_ID[m.emotion].name}, ${fmtDay(m.ts)}${m.core ? ', core memory' : ''}`);
    b.append(makeOrb(BY_ID[m.emotion], ORB_SIZE[m.intensity], m.core, Photos.url(m.id)));
    const s = document.createElement('small'); s.textContent = fmtDay(m.ts); b.append(s);
    b.onclick = () => selectMemory(m.id);
    grid.append(b);
  });
  if (activeView === 'shelf') freshId = null;   // the pulse plays once, when you next look at the shelf
  const m = memories.find(x => x.id === selected), d = $('#detail');
  d.classList.toggle('show', !!m);
  if (m) {
    const e = BY_ID[m.emotion];
    const o = $('#detailOrb'), pUrl = Photos.url(m.id);
    o.className = 'orb' + (m.core ? ' core' : '') + (pUrl ? ' big' : ''); paint(o, e); applyPhoto(o, pUrl);
    o.setAttribute('role', pUrl ? 'button' : ''); o.tabIndex = pUrl ? 0 : -1; o.title = pUrl ? 'View photo' : '';
    $('#detailWhen').textContent = fmtFull(m.ts);
    $('#detailName').innerHTML = `${e.name} · ${INTENSITY[m.intensity].toLowerCase()}${m.core ? ' ' + STAR : ''}`;
    $('#detailNote').textContent = m.note || e.meaning;
  }
}

// selecting a memory "replays" it: the room takes on its color
function selectMemory(id) {
  selected = selected === id ? null : id;
  renderShelf(); applyTint();
  if (!selected) return;
  const m = memories.find(x => x.id === selected);
  requestAnimationFrame(() => {
    const el = $('.mem.sel .orb'); if (!el) return;
    const o = orbCenter(el);
    FX.burst(o.x, o.y, m.core ? GOLD : BY_ID[m.emotion].color, m.core ? 14 : 8, { speed: 80 });
  });
  }
// forgetting: the orb loses its colour, sinks and crumbles to dust (like memories headed for the dump)
let forgetting = false;
$('#detailDel').addEventListener('click', () => {
  if (!selected || forgetting) return;
  forgetting = true;
  const el = $('.mem.sel'), orb = el && $('.orb', el);
  const finish = () => {
    const before = new Map($$('.mem').map(m => [m.dataset.id, m.getBoundingClientRect()]));
    $('#detail').classList.remove('forgetting');   // otherwise the next memory you open stays faded
    Photos.remove(selected);
    memories = memories.filter(m => m.id !== selected); selected = null; save();
    renderChips(); renderShelf(); renderInsights(); applyTint();
    slideIntoPlace(before);
    toast('Memory faded away'); forgetting = false;
  };
  if (REDUCED || !el) { finish(); return; }
  el.classList.add('forgetting'); $('#detail').classList.add('forgetting');
  const o = orbCenter(orb);
  FX.dust(o.x, o.y); setTimeout(() => FX.dust(o.x, o.y + 10, 12), 380);
  setTimeout(finish, 1150);
});

// remaining orbs glide to their new spots instead of jumping (FLIP)
function slideIntoPlace(before) {
  $$('.mem').forEach(m => {
    const old = before.get(m.dataset.id); if (!old) return;
    const now = m.getBoundingClientRect(), dx = old.left - now.left, dy = old.top - now.top;
    if (dx || dy) m.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.25,.8,.3,1)' });
  });
}

function loadSamples() {
  const weights = { joy: 6, sadness: 3, anger: 2, fear: 1, disgust: 1, anxiety: 4, envy: 1, ennui: 3, embarrassment: 1 };
  const bag = Object.entries(weights).flatMap(([k, n]) => Array(n).fill(k));
  const notes = ['Coffee with a friend', 'Deadline moved up', 'Finally shipped the flow', 'Long meeting, no breaks', 'Quiet evening in', 'Someone else got the shout-out', 'Said the wrong name out loud', 'Rainy commute', 'Great feedback from review', "Couldn't switch off tonight"];
  const now = Date.now();
  for (let i = 27; i >= 0; i--) {
    if (Math.random() < .18) continue;
    const ts = now - i * 864e5 - Math.random() * 3e7;
    memories.push({ id: 's' + i + Math.random().toString(36).slice(2, 5), ts, emotion: pick(bag), intensity: 1 + Math.floor(Math.random() * 3), core: Math.random() < .12, note: Math.random() < .55 ? pick(notes) : '' });
  }
  save(); shelfEnter = true; renderChips(); renderShelf(); renderInsights();
}

/* =====================================================================
   Insights
   ===================================================================== */
let range = 7, insightsTop = null;
$('#range').addEventListener('click', ev => {
  const b = ev.target.closest('button'); if (!b) return;
  range = +b.dataset.r;   $$('#range button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
  renderInsights();
});

function countUp(el, to) {
  if (REDUCED || !to) { el.textContent = to; return; }
  const t0 = performance.now();
  (function step(now) {
    const k = clamp((now - t0) / 700, 0, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

function renderInsights() {
  const cutoff = range ? Date.now() - range * 864e5 : 0;
  const list = memories.filter(m => m.ts >= cutoff);
  $('#insightRangeLabel').textContent = range === 7 ? 'Last 7 days' : range === 30 ? 'Last 30 days' : 'All time';
  const body = $('#insightBody');
  if (!list.length) {
    insightsTop = null;
    body.innerHTML = `<div class="card"><div class="empty-state"><span class="orb empty"></span><div>No memories in this range yet.</div></div></div>`;
    applyTint(); return;
  }
  const weight = {}, tally = {};
  list.forEach(m => { weight[m.emotion] = (weight[m.emotion] || 0) + m.intensity; tally[m.emotion] = (tally[m.emotion] || 0) + 1; });
  const top = BY_ID[Object.keys(weight).sort((a, b) => weight[b] - weight[a])[0]];
  insightsTop = top;
  const max = Math.max(...Object.values(tally));

  // streak of consecutive days ending today (or yesterday)
  const days = new Set(memories.map(m => dayKey(m.ts)));
  let streak = 0; const d = new Date(); if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) { streak++; d.setDate(d.getDate() - 1); }
  const cores = list.filter(m => m.core).length;

  body.innerHTML = `
    <div class="insight-grid">
      <div class="col">
        <div class="card hero"><span class="orb" id="heroOrb"></span>
          <div><h3>Mostly ${top.name}</h3><p>${top.meaning}</p></div></div>
        <div class="stats">
          <div class="card stat"><b data-n="${list.length}">0</b><span>Memories</span></div>
          <div class="card stat"><b data-n="${streak}">0</b><span>Day streak</span></div>
          <div class="card stat"><b data-n="${cores}">0</b><span>Core</span></div>
        </div>
        <div class="card week"><h4>This week</h4><div class="week-row" id="weekRow"></div></div>
      </div>
      <div class="col"><div class="card bars" id="bars"></div></div>
    </div>`;
  paint($('#heroOrb'), top);
  $$('.stat b', body).forEach(b => countUp(b, +b.dataset.n));

  const week = $('#weekRow');
  for (let i = 6; i >= 0; i--) {
    const day = new Date(); day.setDate(day.getDate() - i);
    const ms = memories.filter(m => dayKey(m.ts) === dayKey(day)).sort((a, b) => b.ts - a.ts);
    const cell = document.createElement('div'); cell.className = 'day' + (i === 0 ? ' today' : '');
    if (ms.length) cell.append(makeOrb(BY_ID[ms[0].emotion], 32, ms[0].core, Photos.url(ms[0].id)));
    else { const dot = document.createElement('span'); dot.className = 'dot'; cell.append(dot); }
    cell.append(document.createTextNode(day.toLocaleDateString('en-GB', { weekday: 'short' })));
    week.append(cell);
  }

  const bars = $('#bars');
  EMOTIONS.filter(e => tally[e.id]).sort((a, b) => tally[b.id] - tally[a.id]).forEach(e => {
    const r = document.createElement('div'); r.className = 'bar';
    r.append(makeOrb(e, 20));
    const n = document.createElement('span'); n.textContent = e.name; r.append(n);
    r.insertAdjacentHTML('beforeend', `<div class="track"><div class="fill" style="width:0;--c:${e.color};--cd:${mix(e.color, '#000000', .3)}"></div></div><em>${tally[e.id]}</em>`);
    bars.append(r);
    requestAnimationFrame(() => requestAnimationFrame(() => { r.querySelector('.fill').style.width = (tally[e.id] / max * 100) + '%'; }));
  });
  applyTint();
}

/* =====================================================================
   Navigation + ambient tint
   ===================================================================== */
function applyTint() {
  if (tintHold) return;
  let e = null;
  if (activeView === 'today') e = shownEmotion();
  else if (activeView === 'shelf') { const m = memories.find(x => x.id === selected); e = m && BY_ID[m.emotion]; }
  else e = insightsTop;
  tint.style.setProperty('--tint', e ? e.color + 'bb' : 'rgba(183, 156, 255, .32)');
}

function go(view) {
  if (view === activeView) return;
  activeView = view;
  $$('nav button').forEach(x => { if (x.dataset.view === view) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
  if (view === 'shelf') { shelfEnter = true; renderShelf(); }
  if (view === 'insights') renderInsights();
  syncFx(); applyTint();
}
$$('nav button').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));

addEventListener('keydown', (ev) => {
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const tag = ev.target.tagName;
  if (ev.key === 'Escape') { setMusicOpen(false); lightbox.hidden = true; return; }
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (activeView === 'today') {
    if (/^[1-9]$/.test(ev.key)) chooseEmotion(EMOTIONS[+ev.key - 1].id);
    else if (ev.key === 'Enter' && tag !== 'BUTTON') store();
  }
});

/* =====================================================================
   Music (official YouTube embed, loaded only when you open the player)
   ===================================================================== */
const VIDEO_ID = 'O4N0Fsnsr4I';
const Music = { player: null, ready: false, playing: false, wantPlay: false, loading: false, open: false, started: false };
const musicCard = $('#musicCard'), musicBtn = $('#musicBtn'), playBtn = $('#musicPlay');

function setMusicOpen(open) {
  Music.open = open;
  musicCard.classList.toggle('open', open);
  musicCard.setAttribute('aria-hidden', String(!open));
  musicCard.inert = !open;
  musicBtn.setAttribute('aria-expanded', String(open));
}
function paintMusic() {
  musicBtn.classList.toggle('playing', Music.playing);
  playBtn.classList.toggle('on', Music.playing);
  playBtn.setAttribute('aria-label', Music.playing ? 'Pause music' : 'Play music');
}
function musicError() { $('#musicErr').hidden = false; Music.wantPlay = false; }

function loadYT() {
  if (Music.loading) return;
  Music.loading = true;
  if (window.YT && window.YT.Player) return initPlayer();
  window.onYouTubeIframeAPIReady = initPlayer;
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api'; s.onerror = musicError;
  document.head.append(s);
}
function initPlayer() {
  Music.player = new YT.Player('ytHost', {
    width: '100%', height: '100%', videoId: VIDEO_ID,
    playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1, fs: 0, iv_load_policy: 3, loop: 1, playlist: VIDEO_ID },
    events: {
      onReady: () => { Music.ready = true; Music.player.setVolume(prefs.vol); if (Music.wantPlay) Music.player.playVideo(); },
      onStateChange: (e) => { Music.playing = e.data === YT.PlayerState.PLAYING; paintMusic(); },
      onError: musicError,
    },
  });
}
function toggleMusic() {
  if (!Music.ready) { Music.wantPlay = true; loadYT(); return; }
  if (Music.playing) Music.player.pauseVideo(); else Music.player.playVideo();
}

musicBtn.addEventListener('click', () => {
  const open = !Music.open;
  setMusicOpen(open);
  if (open && !Music.started) { Music.started = true; Music.wantPlay = true; loadYT(); }   // first open = press play
});
$('#musicClose').addEventListener('click', () => setMusicOpen(false));
playBtn.addEventListener('click', toggleMusic);
const volSlider = $('#musicVol'), volBtn = $('#volBtn');
function paintVolume() {
  volSlider.value = prefs.vol;
  volSlider.style.setProperty('--v', prefs.vol + '%');
  volBtn.dataset.level = prefs.vol === 0 ? 0 : prefs.vol < 45 ? 1 : 2;
  volBtn.setAttribute('aria-label', prefs.vol === 0 ? 'Unmute music' : 'Mute music');
}
function setVolume(v) {
  prefs.vol = v; savePrefs(); paintVolume();
  if (Music.ready) Music.player.setVolume(v);
}
volSlider.addEventListener('input', (e) => { if (+e.target.value > 0) prefs.lastVol = +e.target.value; setVolume(+e.target.value); });
volBtn.addEventListener('click', () => {
  if (prefs.vol > 0) { prefs.lastVol = prefs.vol; setVolume(0); }
  else setVolume(prefs.lastVol || 55);
});
paintVolume();
setMusicOpen(false);

/* =====================================================================
   Init
   ===================================================================== */
placeReadout(); layoutScene();
DESKTOP.addEventListener('change', () => { placeReadout(); layoutScene(); });
addEventListener('resize', layoutScene);
// tap the orb in a memory's detail card to see the original photo
const lightbox = $('#lightbox');
function openLightbox() {
  const m = memories.find(x => x.id === selected), url = m && Photos.url(m.id);
  if (!url) return;
  $('#lightboxImg').src = url; lightbox.hidden = false;
}
$('#detailOrb').addEventListener('click', openLightbox);
$('#detailOrb').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); } });
lightbox.addEventListener('click', () => { lightbox.hidden = true; });

renderToday(); renderChips(); renderShelf(); renderInsights();
FX.start();
Photos.load(memories).then(() => { if (memories.some(m => m.photo)) { renderShelf(); renderInsights(); } });
