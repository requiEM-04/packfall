// Booster-Stil: düstere, detaillierte Pixel-Art, Vollbild-Arena mit Turm (Richtung „Booster Pack Heroes“, eigene Grafiken)
import { ARENA, G, realmOf } from './core.js?v=0.8-720520af';
import { createUI } from './ui.js?v=0.8-720520af';
import {
  towerCanvas, crystalCanvas, heroCanvas, enemyCanvas, rockCanvas, treeCanvas, bonesCanvas,
  packCanvas, cardBackCanvas, iconSVG, variant, shade, logoCanvas, titleBackdrop, mute,
} from './bph-art.js?v=0.8-720520af';
import { heroSprite } from './heroes.js?v=0.8-720520af';
import { createMenuScene } from './menuscene.js?v=0.8-720520af';
const M = c => (typeof c === 'string' && c[0] === '#' && c.length === 7 ? mute(c, 0.5, 0.92) : c);

const REALM_RAW = [
  { name: 'Aschewald',  base: '#141b19', d1: '#18211e', d2: '#101614', rock: '#2a332f', tree: '#2e2622', glow: 'rgba(80,200,150,', tuft: '#1f2b25' },
  { name: 'Frostgrat',  base: '#121a26', d1: '#172231', d2: '#0d131c', rock: '#2e3a48', tree: '#2a3140', glow: 'rgba(120,190,255,', tuft: '#c9e4ff' },
  { name: 'Glutschlund', base: '#1d1010', d1: '#261413', d2: '#140a0a', rock: '#3a221e', tree: '#2a1a16', glow: 'rgba(255,110,50,', tuft: '#ff7a2a' },
  { name: 'Leerenmeer', base: '#130f1d', d1: '#191428', d2: '#0d0a14', rock: '#2a2238', tree: '#241c33', glow: 'rgba(170,120,255,', tuft: '#3a2c55' },
];

const REALM = REALM_RAW.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, M(v)])));
const url = c => c.toDataURL('image/png');

const tick = () => new Promise(r => setTimeout(r, 16));

export async function mount(root, game, { audio, cloud } = {}) {
  // Bilder für Menü und Karten (werden während des Ladescreens erzeugt)
  const heroImg = {}, heroSil = {}, packImg = {}, enemyImg = {};
  let backImg = '', titleImg = '';
  const skin = {
    name: 'bph',
    logo: url(logoCanvas()),
    titleBg: () => `<img src="${titleImg}" alt="">`,
    icon: n => iconSVG(n),
    cardArt: (d, { unknown } = {}) => `<img class="b-art" src="${unknown ? heroSil[d.id] || '' : heroImg[d.id] || ''}" alt="">`,
    packArt: kind => `<img class="b-pack" src="${packImg[kind] || ''}" alt="">`,
    cardBack: () => `<img class="b-back" src="${backImg}" alt="">`,
    enemyArt: type => `<img class="b-art" src="${enemyImg[type] || ''}" alt="">`,
  };
  const ui = createUI(root, game, skin, { audio, cloud });
  const loadSteps = [
    ['Rufe die Helden …', () => { for (const id of Object.keys(G)) { heroImg[id] = url(heroSprite(id)); heroSil[id] = url(heroSprite(id, { silhouette: true })); } }],
    ['Packe die Booster …', () => { for (const k of ['starter', 'basic', 'elite', 'green', 'purple']) packImg[k] = url(packCanvas(k)); backImg = url(cardBackCanvas()); }],
    ['Male den Nachthimmel …', () => { titleImg = url(titleBackdrop()); }],
    ['Wecke die Monster …', () => { for (const t of ['krabbler', 'flitzer', 'brocken', 'boss']) enemyImg[t] = url(enemyCanvas(t, 0)); }],
    ['Lade Schriften …', async () => { try { await Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* egal */ } }],
  ];
  const stage = ui.stage;
  const canvas = document.createElement('canvas');
  canvas.className = 'kw-canvas';
  stage.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const lo = document.createElement('canvas');
  const lx = lo.getContext('2d');
  const ground = document.createElement('canvas');
  const gx = ground.getContext('2d');

  // Sprites
  const TOWER = towerCanvas();
  const menuScene = createMenuScene({ towerCanvas: TOWER, treeCanvas });
  let sceneT = 0;
  const TOWER_FLASH = variant(TOWER, 'flash');
  const CRYSTAL = crystalCanvas();
  const heroes = {};
  const hero = id => (heroes[id] ||= { n: heroSprite(id), f: null });
  const eCache = new Map();
  function enemySprite(type, frame, v) {
    const k = `${type}${frame}${v}`;
    let s = eCache.get(k);
    if (!s) { const base = enemyCanvas(type, frame); s = v ? variant(base, v) : base; eCache.set(k, s); }
    return s;
  }

  let W = 1, H = 1, P = 3, LW = 1, LH = 1, sc = 1, dpr = 1;
  let cx = 0, cy = 0, tcx = 0, tcy = 0;
  let groundKey = '';
  const glowSpots = [];
  // weicher Nebel (kachelbar), einmal erzeugt
  const fog = (() => {
    const w = 192, h = 96, c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'), img = x.createImageData(w, h);
    const rnd = seeded(31337), grid = [];
    const G = 8; for (let i = 0; i < G * G; i++) grid.push(rnd());
    const v = (u, q, f) => { const gx2 = (u * f) % G, gy2 = (q * f) % G, x0 = Math.floor(gx2), y0 = Math.floor(gy2), fx2 = gx2 - x0, fy2 = gy2 - y0, sm = t2 => t2 * t2 * (3 - 2 * t2);
      const a = grid[(y0 % G) * G + (x0 % G)], b = grid[(y0 % G) * G + ((x0 + 1) % G)], c2 = grid[((y0 + 1) % G) * G + (x0 % G)], d = grid[((y0 + 1) % G) * G + ((x0 + 1) % G)];
      return a + (b - a) * sm(fx2) + (c2 - a) * sm(fy2) + (a - b - c2 + d) * sm(fx2) * sm(fy2); };
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const u = (xx / w) * G, q = (yy / h) * G;
      let n = v(u, q, 1) * 0.6 + v(u, q, 2) * 0.3 + v(u, q, 4) * 0.1;
      n = Math.max(0, (n - 0.42) / 0.58); n = n * n * (3 - 2 * n);
      const i = (yy * w + xx) * 4; img.data[i] = 150; img.data[i + 1] = 158; img.data[i + 2] = 170; img.data[i + 3] = Math.round(n * 255);
    }
    x.putImageData(img, 0, 0); return c;
  })();
  const ash = [], bats = [];
  let batT = 6;
  let shake = 0, shakeAmp = 0, towerFlash = 0;
  const parts = [], texts = [], zaps = [], booms = [], smokes = [];
  let viewT = 0;
  let zoom = 1.9;

  function computeView() {
    // Mitte des sichtbaren Spielfelds (Panel rechts oder unten abziehen)
    const sr = stage.getBoundingClientRect();
    let vw = sr.width, vh = sr.height, vx = 0, vy = 0;
    const strip = ui.el.querySelector('.kw-shop2:not([hidden])')?.getBoundingClientRect();
    if (game.run && strip && strip.width && strip.height) vh = Math.max(sr.height * 0.3, strip.top - sr.top);
    tcx = Math.round(((vx + vw / 2) * dpr) / P);
    tcy = Math.round(((vy + vh / 2) * dpr) / P) + 8;
    const short = Math.min(vw, vh) * dpr / P;
    return short;
  }

  function resize() {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W; canvas.height = H;
    // Hochformat (Handy): größere Pixel, damit Turm und Helden nicht winzig werden
    P = Math.max(2, Math.round(Math.min(W, H) / (H > W * 1.25 ? 250 : 360)));
    LW = Math.ceil(W / P); LH = Math.ceil(H / P);
    lo.width = LW; lo.height = LH;
    ground.width = LW + 180; ground.height = LH + 180;
    const short = computeView();
    sc = Math.max(0.2, (short / 2 - 8) / ARENA.viewR);
    cx = tcx; cy = tcy;
    groundKey = '';
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  // Boden wird relativ zur Arenamitte gebaut und beim Zeichnen verschoben
  function buildGround(realm) {
    const R = REALM[realm];
    const GW = ground.width, GH = ground.height;
    const ox = Math.round(GW / 2), oy = Math.round(GH / 2);
    gx.fillStyle = R.base; gx.fillRect(0, 0, GW, GH);
    const rnd = seeded(777 + realm * 31);
    // Bodenflecken
    for (let i = 0; i < (GW * GH) / 90; i++) {
      const x = Math.floor(rnd() * GW), y = Math.floor(rnd() * GH), s = 1 + Math.floor(rnd() * 3);
      gx.fillStyle = rnd() < 0.5 ? R.d1 : R.d2; gx.fillRect(x, y, s, 1);
    }
    for (let i = 0; i < (GW * GH) / 1400; i++) {
      const x = Math.floor(rnd() * GW), y = Math.floor(rnd() * GH);
      gx.fillStyle = R.tuft; gx.globalAlpha = realm === 1 ? 0.5 : 0.8;
      gx.fillRect(x, y, 1, 1); if (rnd() < 0.5) gx.fillRect(x + 1, y - 1, 1, 1);
      gx.globalAlpha = 1;
    }
    // große, weiche Flecken (gedithert) gegen den flachen Look
    const BY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let i = 0; i < (GW * GH) / 2600; i++) {
      const bx = rnd() * GW, by = rnd() * GH, br = 6 + rnd() * 16, col = rnd() < 0.55 ? R.d2 : R.d1;
      gx.fillStyle = col;
      for (let y = Math.floor(by - br); y <= by + br; y++) for (let x = Math.floor(bx - br); x <= bx + br; x++) {
        const d = Math.hypot(x - bx, (y - by) * 1.3) / br;
        if (d < 1 && BY[((y & 3) << 2) + (x & 3)] < (1 - d) * 14) gx.fillRect(x, y, 1, 1);
      }
    }
    // gepflasterter Platz um den Turm
    {
      const prd = seeded(4242 + realm);
      const PR = 30;
      const stoneA = shade(R.rock, -0.08), stoneB = shade(R.rock, -0.2), stoneC = shade(R.rock, 0.06), mort = shade(R.base, -0.35);
      for (let row = -PR; row <= PR; row += 3) {
        const off = ((row / 3) & 1) ? 2 : 0;
        for (let col = -PR - 4 + off; col <= PR; col += 5) {
          const mx = col + 2, my = row + 1;
          const d = Math.hypot(mx, my * 1.25) / PR;
          if (d > 1 - prd() * 0.18) continue;
          if (d > 0.75 && prd() < (d - 0.75) * 2.4) continue;
          const c = prd() < 0.12 ? stoneB : prd() < 0.2 ? stoneC : stoneA;
          gx.fillStyle = mort; gx.fillRect(ox + col - 1, oy + row - 1, 6, 4);
          gx.fillStyle = c; gx.fillRect(ox + col, oy + row, 4, 2);
          gx.fillStyle = shade(c, 0.1); gx.fillRect(ox + col, oy + row, 4, 1);
          if (prd() < 0.15) { gx.fillStyle = R.tuft; gx.fillRect(ox + col + 4, oy + row + 1, 1, 1); }
        }
      }
    }
    // Deko: dichter am Rand, frei in der Mitte
    const items = [];
    const n = Math.round((GW * GH) / 1100);
    for (let i = 0; i < n; i++) {
      const x = rnd() * GW, y = rnd() * GH;
      const d = Math.hypot(x - ox, y - oy) / (ARENA.viewR * sc);
      if (d < 0.45) continue;
      if (rnd() > Math.min(0.9, (d - 0.4) * 0.8)) continue;
      const roll = rnd();
      let s;
      if (roll < 0.86) s = rockCanvas(rnd, 3 + Math.floor(rnd() * (d > 0.95 ? 7 : 4)), shade(R.rock, (rnd() - 0.5) * 0.2));
      else if (roll < 0.95) s = treeCanvas(rnd, R.tree);
      else s = bonesCanvas(rnd);
      items.push({ x: Math.round(x), y: Math.round(y), s });
    }
    items.sort((a, b) => a.y - b.y).forEach(it => {
      gx.fillStyle = 'rgba(0,0,0,.35)';
      gx.fillRect(it.x - Math.floor(it.s.width / 2) + 1, it.y, it.s.width - 1, 2);
      gx.drawImage(it.s, it.x - Math.floor(it.s.width / 2), it.y - it.s.height + 1);
    });
    // Glutrisse im 3. Reich, Eisglitzer im 2.
    if (realm === 2 || realm === 1) {
      for (let i = 0; i < 40; i++) {
        let x = rnd() * GW, y = rnd() * GH;
        gx.fillStyle = M(realm === 2 ? '#b0603a' : '#9fb4c0');
        for (let k = 0; k < 6; k++) { gx.fillRect(Math.round(x), Math.round(y), 1, 1); x += rnd() * 2 - 0.5; y += rnd() * 2 - 1; }
      }
    }
    // Pfad-Ring (wo die Gegner auftauchen)
    const RR = ARENA.spawnR * sc;
    // dunkler Rand-Nebel statt Linie
    void RR;
    // Leben am Boden: Grasbüschel und leuchtende Pilze
    glowSpots.length = 0;
    const rg = seeded(9100 + realm * 7);
    const blade = [M('#2c3a2c'), M('#34442f'), M('#3e5236')];
    for (let i = 0; i < (GW * GH) / 700; i++) {
      const x = Math.floor(rg() * GW), y = Math.floor(rg() * GH);
      const d = Math.hypot(x - ox, y - oy) / (ARENA.viewR * sc);
      if (d < 0.22) continue;
      const n = 2 + Math.floor(rg() * 3);
      for (let k = 0; k < n; k++) { gx.fillStyle = blade[(k + i) % 3]; const h = 1 + Math.floor(rg() * 3); gx.fillRect(x + k - 1, y - h, 1, h); }
    }
    const shroom = [[150, 210, 190], [190, 170, 220], [220, 190, 130]][realm % 3];
    for (let i = 0; i < (GW * GH) / 5200; i++) {
      const x = Math.floor(rg() * GW), y = Math.floor(rg() * GH);
      const d = Math.hypot(x - ox, y - oy) / (ARENA.viewR * sc);
      if (d < 0.35) continue;
      const c = `rgb(${shroom[0]},${shroom[1]},${shroom[2]})`;
      for (let k = 0; k < 1 + Math.floor(rg() * 3); k++) {
        const mx = x + k * 3 - 2, my = y + (k % 2);
        gx.fillStyle = M('#4a4440'); gx.fillRect(mx, my - 1, 1, 2);
        gx.fillStyle = c; gx.fillRect(mx - 1, my - 2, 3, 1); gx.fillStyle = 'rgba(255,255,255,.5)'; gx.fillRect(mx, my - 2, 1, 1);
      }
      glowSpots.push({ x: x - ox, y: y - oy, c: shroom, ph: rg() * 6.28 });
    }
    groundKey = `${realm}:${GW}:${GH}:${sc}`;
  }

  const toLo = (wx, wy) => [Math.round(cx + wx * sc), Math.round(cy + wy * sc * 0.92)];
  const toWorld = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    const lxp = ((clientX - r.left) * dpr) / P, lyp = ((clientY - r.top) * dpr) / P;
    return [(lxp - cx) / sc, (lyp - cy) / (sc * 0.92)];
  };
  let ptrType = 'mouse';
  function onPtr(e) {
    if (!game.run) return;
    ptrType = e.pointerType;
    const [x, y] = toWorld(e.clientX, e.clientY);
    game.setCursor(x, y, true);
  }
  function onLeave(e) { if (e.pointerType === 'mouse') game.setCursor(game.cursor.x, game.cursor.y, false); }
  canvas.addEventListener('pointermove', onPtr);
  canvas.addEventListener('pointerdown', onPtr);
  canvas.addEventListener('pointerleave', onLeave);
  const strikes = [];

  // ----- Effekte -----
  const fx = () => {
    const s = game.meta.settings;
    const g = s.gfx === 'auto' ? (Math.min(W, H) > 1400 ? 'mittel' : 'hoch') : s.gfx;
    return { q: g === 'niedrig' ? 0.35 : g === 'mittel' ? 0.7 : 1, glow: g !== 'niedrig', shake: s.shake !== 'off', numbers: s.numbers !== 'off' };
  };
  function burst(x, y, colors, n, sp = 40, life = 0.5, opts = {}) {
    n = Math.max(1, Math.round(n * fx().q));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = sp * (0.3 + Math.random());
      parts.push({ x, y, z: opts.z ?? 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, vz: (opts.up ?? 30) * (0.4 + Math.random()), life: life * (0.6 + Math.random() * 0.7), max: life, c: M(colors[Math.floor(Math.random() * colors.length)]), size: opts.size ?? 1, g: opts.g ?? 90 });
    }
    if (parts.length > 900) parts.splice(0, parts.length - 900);
  }
  function addText(x, y, txt, color, big) {
    if (!fx().numbers) return;
    if (texts.length > 30) texts.shift();
    texts.push({ x: x + Math.round((Math.random() - 0.5) * 6), y, txt, color, big, life: big ? 1 : 0.75, max: big ? 1 : 0.75 });
  }

  const offs = [
    game.on('hit', h => {
      const [x, y] = toLo(h.x, h.y);
      burst(x, y, ['#ffffff', h.color], h.crit ? 7 : 3, 35, 0.3, { up: 30 });
      if (h.crit || h.amount >= 12 || h.src === 'beam') addText(x, y - 10, Math.round(h.amount).toLocaleString('de-DE'), h.crit ? '#c8b47e' : '#d6d1c6', h.crit);
    }),
    game.on('kill', k => {
      const [x, y] = toLo(k.x, k.y);
      const boss = k.e.type === 'boss';
      const c = k.e.T.color;
      burst(x, y, [c, shade(c, -0.4), shade(c, 0.3), '#ffffff'], boss ? 90 : 16, boss ? 80 : 50, boss ? 1.1 : 0.6, { up: boss ? 90 : 50, size: boss ? 2 : 1 });
      addText(x + 4, y - 6, `+${k.coins}`, '#b39b6c', false);
      if (boss) { shake = 0.6; shakeAmp = 4; booms.push({ x, y, r: 26, life: 0.6, max: 0.6, fire: true }); }
    }),
    game.on('coreHit', () => { shake = Math.max(shake, 0.3); shakeAmp = Math.max(shakeAmp, 3); towerFlash = 0.12; burst(cx, cy - 6, ['#ff4a5e', '#ffffff', '#8a1020'], 16, 50, 0.5, { up: 60 }); }),
    game.on('zap', z => zaps.push({ pts: z.pts.map((p, i) => { const [x, y] = toLo(p.x, p.y); return [x, y - (i === 0 ? 14 : 5)]; }), color: z.color, life: 0.2 })),
    game.on('boom', b => {
      const [x, y] = toLo(b.x, b.y);
      booms.push({ x, y, r: Math.max(5, b.r * sc), life: 0.4, max: 0.4, fire: true });
      burst(x, y, ['#ffe45c', '#ff8a2a', '#ff4a1a', '#ffffff'], 22, 55, 0.5, { up: 60 });
      for (let i = 0; i < 6; i++) smokes.push({ x: x + (Math.random() - 0.5) * 10, y: y - Math.random() * 4, r: 2 + Math.random() * 3, life: 0.9, max: 0.9 });
      shake = Math.max(shake, 0.1); shakeAmp = Math.max(shakeAmp, 1);
    }),
    game.on('cursorStrike', s => {
      const [x, y] = toLo(s.x, s.y);
      strikes.push({ x, y, r: s.r * sc, life: 0.35, max: 0.35 });
      burst(x, y, ['#ffd75e', '#ffffff', '#ffb52e'], 10, 50, 0.4, { up: 50 });
      if (fx().shake) { shake = Math.max(shake, 0.08); shakeAmp = Math.max(shakeAmp, 1); }
    }),
    game.on('runStart', () => game.setCursor(0, 0, false)),
    game.on('spawn', e => { const [x, y] = toLo(e.x, e.y); for (let i = 0; i < 3; i++) smokes.push({ x: x + (Math.random() - 0.5) * 6, y, r: 2 + Math.random() * 2, life: 0.6, max: 0.6, dark: true }); }),
  ];

  function line(x0, y0, x1, y1, color, w = 1) {
    lx.fillStyle = M(color);
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy, n = 0;
    const o = w > 1 ? Math.floor(w / 2) : 0;
    while (n++ < 3000) {
      lx.fillRect(x0 - o, y0 - o, w, w);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }
  function disc(x, y, r, color) {
    lx.fillStyle = M(color);
    const rr = Math.round(r);
    for (let yy = -rr; yy <= rr; yy++) {
      const w = Math.round(Math.sqrt(Math.max(0, r * r - yy * yy)));
      lx.fillRect(Math.round(x) - w, Math.round(y) + Math.round(yy * 0.8), w * 2 + 1, 1);
    }
  }
  function ditherDisc(x, y, r, color, density) {
    lx.fillStyle = M(color);
    const rr = Math.round(r);
    for (let yy = -rr; yy <= rr; yy++) for (let xx = -rr; xx <= rr; xx++) {
      if (xx * xx + yy * yy > r * r) continue;
      if (((xx + yy) & 1) && density < 0.6) continue;
      if (density < 0.3 && ((xx & 1) || (yy & 1))) continue;
      lx.fillRect(Math.round(x) + xx, Math.round(y) + Math.round(yy * 0.8), 1, 1);
    }
  }
  function ringPx(x, y, r, color) {
    lx.fillStyle = M(color);
    const steps = Math.max(16, Math.round(r * 7));
    let px = null, py = null;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const qx = Math.round(x + Math.cos(a) * r), qy = Math.round(y + Math.sin(a) * r * 0.92);
      if (qx === px && qy === py) continue;
      lx.fillRect(qx, qy, 1, 1); px = qx; py = qy;
    }
  }
  function shadow(x, y, w) { lx.fillStyle = 'rgba(0,0,0,.42)'; lx.fillRect(x - Math.floor(w / 2) + 1, y, w - 2, 1); lx.fillRect(x - Math.floor(w / 2) + 2, y + 1, w - 4, 1); }
  function glow(x, y, r, rgba, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba + a + ')'); g.addColorStop(1, rgba + '0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const hexRgba = hex => { hex = M(hex); const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},`; };

  function frame(dt) {
    ui.frame(dt);
    if (ui.busy) return; // Booster-Opening läuft: Arena ruht (kein Ruckeln)
    if (!game.run && (ui.phase === 'menu' || ui.phase === 'out' || ui.phase === 'admin')) {
      sceneT += dt;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      menuScene.draw(ctx, W, H, sceneT, dt, fx().q);
      return;
    }
    const t = game.t;
    const run = game.run;
    const realm = run ? realmOf(run.wave) : 0;
    const R = REALM[realm];

    viewT -= dt;
    if (viewT <= 0) { computeView(); viewT = 0.25; }
    cx += Math.sign(tcx - cx) * Math.min(Math.abs(tcx - cx), Math.max(1, Math.abs(tcx - cx) * dt * 6));
    cy += Math.sign(tcy - cy) * Math.min(Math.abs(tcy - cy), Math.max(1, Math.abs(tcy - cy) * dt * 6));
    cx = Math.round(cx); cy = Math.round(cy);
    if (!groundKey.startsWith(`${realm}:${ground.width}:${ground.height}:${sc}`)) buildGround(realm);
    towerFlash = Math.max(0, towerFlash - dt);

    let ox = 0, oy = 0;
    if (!fx().shake) shake = 0;
    if (shake > 0) { shake -= dt; ox = Math.round((Math.random() * 2 - 1) * shakeAmp); oy = Math.round((Math.random() * 2 - 1) * shakeAmp); }

    lx.imageSmoothingEnabled = false;
    lx.fillStyle = R.base; lx.fillRect(0, 0, LW, LH);
    lx.drawImage(ground, Math.round(cx - ground.width / 2) + ox, Math.round(cy - ground.height / 2) + oy);
    lx.save();
    lx.translate(ox, oy);

    // Bodeneffekte
    for (const b of booms) {
      const k = 1 - b.life / b.max;
      if (k > 0.5) ditherDisc(b.x, b.y, b.r * (0.6 + k * 0.5), 'rgba(20,10,8,.55)', 0.4);
    }

    // Objekte nach y sortiert
    const list = [];
    const bob = Math.round(Math.sin(t * 2) * 1.5);
    list.push({ y: cy + 2, fn: () => {
      shadow(cx, cy + 1, 26);
      const T = towerFlash > 0 ? TOWER_FLASH : TOWER;
      lx.drawImage(T, cx - Math.floor(T.width / 2), cy - T.height + 2);
      lx.drawImage(CRYSTAL, cx - Math.floor(CRYSTAL.width / 2), cy - T.height - CRYSTAL.height - 1 + bob);
      if (run) {
        const k = run.coreHp / run.coreMax, bw = 24, bx = cx - 12, by = cy - T.height - CRYSTAL.height - 6;
        lx.fillStyle = M('#0d0a10'); lx.fillRect(bx - 1, by - 1, bw + 2, 4);
        lx.fillStyle = M('#3a0d18'); lx.fillRect(bx, by, bw, 2);
        lx.fillStyle = M(k < 0.3 ? (Math.floor(t * 8) % 2 ? '#d0605a' : '#e0c0b8') : '#b0524e'); lx.fillRect(bx, by, Math.max(1, Math.round(bw * k)), 2);
        lx.fillStyle = 'rgba(255,255,255,.35)'; lx.fillRect(bx, by, Math.max(1, Math.round(bw * k)), 1);
      }
    } });
    for (const g of game.guardians) {
      let [x, y] = toLo(g.x, g.y);
      const s = hero(g.id).n;
      const flip = Math.cos(g.aim) < 0;
      let lunge = 0;
      if (run && g.fired < 0.1 && g.def.kind !== 'beam') lunge = 1;
      x += Math.round(Math.cos(g.aim) * lunge); y += Math.round(Math.sin(g.aim) * lunge);
      const hb = Math.floor(t * 2 + g.slot) % 2;
      list.push({ y, fn: () => {
        shadow(x, y + 1, 12);
        lx.save();
        lx.translate(x, y - s.height + 2 - hb);
        if (flip) { lx.scale(-1, 1); lx.drawImage(s, -Math.ceil(s.width / 2), 0); } else lx.drawImage(s, -Math.floor(s.width / 2), 0);
        lx.restore();
        if (g.foil) { lx.fillStyle = `hsl(${(t * 220 + g.slot * 90) % 360} 30% 65%)`; lx.fillRect(x + (flip ? 3 : -4), y - s.height + 3 - hb, 1, 1); lx.fillRect(x + (flip ? -5 : 4), y - 6 - hb, 1, 1); }
        if (g.lvl > 1) { lx.fillStyle = M('#ffd23f'); for (let i = 0; i < Math.min(5, g.lvl - 1); i++) lx.fillRect(x - 4 + i * 2, y + 3, 1, 1); }
      } });
    }
    for (const e of game.enemies) {
      const [x, y] = toLo(e.x, e.y);
      const fr = Math.floor(t * (e.type === 'flitzer' ? 9 : 5) + e.seed * 10) % 2;
      const v = e.flash > 0.05 ? 'flash' : e.slowT > 0 ? 'slow' : '';
      const s = enemySprite(e.type, fr, v);
      const fly = e.type === 'flitzer' ? 6 + Math.round(Math.sin(t * 6 + e.seed * 9) * 2) : 0;
      list.push({ y, fn: () => {
        shadow(x, y + 1, Math.max(6, s.width - 2));
        const flip = e.x > 0;
        lx.save();
        lx.translate(x, y - s.height + 2 - fly);
        if (flip) lx.scale(-1, 1);
        lx.drawImage(s, -Math.floor(s.width / 2), 0);
        lx.restore();
        if (e.hp < e.maxHp) {
          const w = Math.max(8, Math.min(24, s.width));
          const bx = x - Math.floor(w / 2), by = y - s.height - 2 - fly;
          lx.fillStyle = M('#0d0a10'); lx.fillRect(bx - 1, by - 1, w + 2, 3);
          lx.fillStyle = M(e.type === 'boss' ? '#b04848' : '#a85450');
          lx.fillRect(bx, by, Math.max(1, Math.round(w * e.hp / e.maxHp)), 1);
        }
      } });
    }
    list.sort((a, b) => a.y - b.y).forEach(o => o.fn());

    // Geschosse
    for (const p of game.projectiles) {
      const [x, y0] = toLo(p.x, p.y);
      let lift = 9;
      if (p.kind === 'splash') {
        const tot = Math.max(1, Math.hypot(p.tx - p.sx, p.ty - p.sy));
        const k = Math.min(1, Math.hypot(p.x - p.sx, p.y - p.sy) / tot);
        lift = Math.round(9 * (1 - k) + Math.sin(k * Math.PI) * 22);
      } else lift = Math.round(9 - Math.min(1, Math.hypot(p.x - p.sx, p.y - p.sy) / 150) * 5);
      const y = y0 - lift;
      const ang = Math.atan2(p.vy * 0.92, p.vx);
      const id = p.gid;
      if (p.kind === 'splash') {
        disc(x, y, 2.2, '#ff7a2a'); disc(x, y, 1.2, '#ffe45c'); lx.fillStyle = M('#ffffff'); lx.fillRect(x, y, 1, 1);
        if (Math.random() < 0.7) burst(x, y, ['#ff7a2a', '#ffb52e', '#5a3a2a'], 1, 6, 0.4, { up: 10, g: -10 });
      } else if (p.kind === 'pierce') {
        line(x - Math.cos(ang) * 5, y - Math.sin(ang) * 5, x, y, '#6b4a2a');
        lx.fillStyle = M('#e8ffd0'); lx.fillRect(x, y, 1, 1);
      } else if (id === 'frostweberin') {
        line(x - Math.cos(ang) * 4, y - Math.sin(ang) * 4, x, y, '#5fd0ff');
        lx.fillStyle = M('#ffffff'); lx.fillRect(x, y, 1, 1);
      } else if (id === 'funkenwerfer') {
        line(x - Math.cos(ang) * 3, y - Math.sin(ang) * 3, x, y, '#ff7a2a');
        lx.fillStyle = M('#ffe45c'); lx.fillRect(x - 1, y - 1, 2, 2);
      } else if (id === 'steinwache') {
        disc(x, y, 1.6, '#8a8f99'); lx.fillStyle = M('#c9ccd2'); lx.fillRect(x - 1, y - 1, 1, 1);
      } else {
        lx.fillStyle = M('#9aa0a6'); lx.fillRect(x - 1, y - 1, 2, 2); lx.fillStyle = M('#e0e4ea'); lx.fillRect(x - 1, y - 1, 1, 1);
      }
    }
    // Strahl
    for (const b of game.beams) {
      const [x1, y1] = toLo(b.x1, b.y1), [x2, y2] = toLo(b.x2, b.y2);
      const w = b.heat > 0.6 ? 3 : 2;
      line(x1, y1 - 16, x2, y2 - 5, b.color, w + 1);
      line(x1, y1 - 16, x2, y2 - 5, '#ffffff', 1);
      for (let i = 0; i < 3; i++) { const k = Math.random(); lx.fillStyle = M('#fff6c0'); lx.fillRect(Math.round(x1 + (x2 - x1) * k + (Math.random() - 0.5) * 4), Math.round(y1 - 16 + (y2 - 5 - y1 + 16) * k + (Math.random() - 0.5) * 4), 1, 1); }
      disc(x2, y2 - 5, 2 + b.heat * 2, '#fff2a0');
    }
    // Blitze
    for (const z of zaps) {
      for (let i = 0; i < z.pts.length - 1; i++) {
        const [ax, ay] = z.pts[i], [bx, by] = z.pts[i + 1];
        let px = ax, py = ay;
        for (let s = 1; s <= 4; s++) {
          const k = s / 4;
          const nx = s === 4 ? bx : ax + (bx - ax) * k + (Math.random() - 0.5) * 8;
          const ny = s === 4 ? by : ay + (by - ay) * k + (Math.random() - 0.5) * 8;
          line(px, py, nx, ny, z.color, 2); line(px, py, nx, ny, '#ffffff', 1);
          px = nx; py = ny;
        }
      }
    }
    // Explosionen
    for (const b of booms) {
      const k = 1 - b.life / b.max;
      const r = b.r * (0.35 + k * 0.75);
      if (k < 0.25) disc(b.x, b.y - 2, r, '#ffffff');
      else {
        ditherDisc(b.x, b.y - 2, r, k < 0.5 ? '#ffb52e' : '#ff5a1a', 1 - k);
        ditherDisc(b.x, b.y - 2, r * 0.6, k < 0.5 ? '#fff2a0' : '#ffb52e', 1 - k);
      }
    }
    // Rauch
    for (const s of smokes) {
      const k = 1 - s.life / s.max;
      ditherDisc(s.x, s.y - k * 10, s.r + k * 3, s.dark ? 'rgba(30,18,40,.8)' : 'rgba(60,52,60,.7)', 1 - k);
    }
    // Partikel
    for (const p of parts) {
      const k = p.life / p.max;
      lx.fillStyle = p.c;
      lx.globalAlpha = k > 0.35 ? 1 : 0.55;
      lx.fillRect(Math.round(p.x), Math.round(p.y - p.z), p.size, p.size);
    }
    lx.globalAlpha = 1;
    // Atmosphäre in der Basis: Glühwürmchen
    if (!run || true) {
      for (let i = 0; i < 26; i++) {
        const a = i * 2.39996, d = 40 + (i * 37) % 120;
        const x = Math.round(cx + Math.cos(a + t * 0.05) * d * 1.4 + Math.sin(t * 0.7 + i) * 6);
        const y = Math.round(cy + Math.sin(a + t * 0.05) * d * 0.8 + Math.cos(t * 0.5 + i) * 4);
        if (Math.sin(t * 2 + i * 1.7) > 0.2) { lx.fillStyle = realm === 2 ? '#ffb52e' : realm === 1 ? '#dff4ff' : '#bfffd8'; lx.fillRect(x, y, 1, 1); }
      }
    }
    lx.restore();

    // ----- hochskalieren -----
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(lo, 0, 0, LW * P, LH * P);

    // ----- Licht (additiv) -----
    const F = fx();
    ctx.globalCompositeOperation = F.glow ? 'lighter' : 'source-over';
    if (!F.glow) ctx.globalAlpha = 0;
    const X = v => (v + ox) * P, Y = v => (v + oy) * P;
    const th = TOWER.height;
    const pulse = 0.45 + Math.sin(t * 2.2) * 0.1 + (towerFlash > 0 ? 0.4 : 0);
    glow(X(cx), Y(cy - th - 8 + bob), 20 * P, 'rgba(110,135,145,', pulse * 0.32);
    glow(X(cx), Y(cy - th - 8 + bob), 6 * P, 'rgba(170,185,190,', 0.18);
    glow(X(cx), Y(cy - 26), 6 * P, 'rgba(190,140,80,', 0.25);
    glow(X(cx - 6), Y(cy - 14), 9 * P, 'rgba(200,140,80,', 0.28 + Math.random() * 0.06);
    glow(X(cx + 5), Y(cy - 14), 9 * P, 'rgba(200,140,80,', 0.28 + Math.random() * 0.06);
    for (const p of game.projectiles) {
      const [x, y] = toLo(p.x, p.y);
      glow(X(x), Y(y - 9), (p.kind === 'splash' ? 10 : 5) * P, hexRgba(p.color), 0.45);
    }
    for (const b of game.beams) {
      const [x1, y1] = toLo(b.x1, b.y1), [x2, y2] = toLo(b.x2, b.y2);
      for (let i = 0; i <= 6; i++) { const k = i / 6; glow(X(x1 + (x2 - x1) * k), Y(y1 - 16 + (y2 - y1 + 11) * k), (6 + b.heat * 5) * P, hexRgba(b.color), 0.3); }
      glow(X(x2), Y(y2 - 5), 12 * P, hexRgba(b.color), 0.45);
    }
    for (const z of zaps) for (const [x, y] of z.pts) glow(X(x), Y(y), 8 * P, hexRgba(z.color), 0.45);
    for (const b of booms) glow(X(b.x), Y(b.y - 2), b.r * 2.2 * P, 'rgba(190,130,80,', (b.life / b.max) * 0.7);
    for (const e of game.enemies) if (e.type === 'boss') { const [x, y] = toLo(e.x, e.y); glow(X(x), Y(y - 12), 24 * P, 'rgba(150,70,70,', 0.25); }
    for (const g of game.guardians) {
      if (!run || g.fired > 0.12 || g.def.kind === 'beam') continue;
      const [x, y] = toLo(g.x, g.y);
      glow(X(x + Math.cos(g.aim) * 6), Y(y - 10 + Math.sin(g.aim) * 4), 7 * P, hexRgba(g.def.color), 0.35);
    }
    // Pilze und Glühwürmchen leuchten
    for (const g of glowSpots) {
      const gx2 = cx + g.x, gy2 = cy + g.y;
      if (gx2 < -10 || gy2 < -10 || gx2 > LW + 10 || gy2 > LH + 10) continue;
      glow(X(gx2), Y(gy2 - 2), 7 * P, `rgba(${g.c[0]},${g.c[1]},${g.c[2]},`, 0.13 + Math.sin(t * 1.3 + g.ph) * 0.05);
    }
    for (let i = 0; i < 26; i++) {
      if (Math.sin(t * 2 + i * 1.7) <= 0.2) continue;
      const a = i * 2.39996, d = 40 + (i * 37) % 120;
      const fxp = cx + Math.cos(a + t * 0.05) * d * 1.4 + Math.sin(t * 0.7 + i) * 6, fyp = cy + Math.sin(a + t * 0.05) * d * 0.8 + Math.cos(t * 0.5 + i) * 4;
      glow(X(fxp), Y(fyp), 5 * P, realm === 2 ? 'rgba(230,170,90,' : realm === 1 ? 'rgba(200,225,235,' : 'rgba(190,235,190,', 0.22);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // Nebelschwaden (weich, zwei Ebenen, ziehen langsam)
    if (F.q > 0.4) {
      ctx.imageSmoothingEnabled = true;
      const fw = Math.max(W, H) * 1.6, fh = fw / 2;
      for (const [sp, al, oyF] of [[9, 0.11, 0.15], [-14, 0.07, 0.45]]) {
        const off = ((t * sp * P) % fw + fw) % fw;
        ctx.globalAlpha = al * (run ? 0.8 : 1);
        for (let k = -1; k <= 1; k++) ctx.drawImage(fog, off + k * fw - fw * 0.25, H * oyF - fh * 0.35, fw, fh);
      }
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = false;
    }
    // treibende Asche
    if (ash.length < (F.q > 0.6 ? 60 : 25) && Math.random() < 0.5) ash.push({ x: Math.random() * W, y: H + 10, vx: (Math.random() - 0.3) * 20, vy: -(15 + Math.random() * 30), life: 6 + Math.random() * 6, s: Math.random() < 0.3 ? 2 : 1 });
    for (const a of ash) {
      a.life -= dt; a.x += (a.vx + Math.sin(t + a.y * 0.01) * 12) * dt; a.y += a.vy * dt;
      const al = Math.min(1, a.life / 2) * 0.55;
      ctx.fillStyle = realm === 2 ? `rgba(220,140,80,${al})` : `rgba(190,185,175,${al * 0.7})`;
      ctx.fillRect(Math.round(a.x), Math.round(a.y), a.s * P * 0.5, a.s * P * 0.5);
    }
    for (let i = ash.length - 1; i >= 0; i--) if (ash[i].life <= 0 || ash[i].y < -10) ash.splice(i, 1);
    // Fledermäuse ziehen im Menü vorbei
    if (!run) {
      batT -= dt;
      if (batT <= 0) { batT = 7 + Math.random() * 9; const dir = Math.random() < 0.5 ? 1 : -1, n = 3 + Math.floor(Math.random() * 4), y0 = H * (0.12 + Math.random() * 0.35);
        for (let i = 0; i < n; i++) bats.push({ x: dir > 0 ? -30 - i * 40 : W + 30 + i * 40, y: y0 + (Math.random() - 0.5) * 60, vx: dir * (90 + Math.random() * 40) * (P / 3), ph: Math.random() * 6, life: 30 }); }
      ctx.fillStyle = 'rgba(8,8,10,.85)';
      for (const b of bats) {
        b.x += b.vx * dt; b.life -= dt; const flap = Math.sin(t * 16 + b.ph) > 0, yy = b.y + Math.sin(t * 3 + b.ph) * 10, u = Math.max(2, Math.round(P * 0.7));
        ctx.fillRect(b.x - u, yy, u * 3, u);
        if (flap) { ctx.fillRect(b.x - u * 3, yy - u, u * 2, u); ctx.fillRect(b.x + u * 2, yy - u, u * 2, u); }
        else { ctx.fillRect(b.x - u * 3, yy + u, u * 2, u); ctx.fillRect(b.x + u * 2, yy + u, u * 2, u); }
      }
      for (let i = bats.length - 1; i >= 0; i--) if (bats[i].life <= 0 || bats[i].x < -200 || bats[i].x > W + 200) bats.splice(i, 1);
    }

    // Dunkle Vignette (Fackelschein in der Mitte)
    const vg = ctx.createRadialGradient(X(cx), Y(cy - 16), Math.min(W, H) * 0.22, X(cx), Y(cy - 16), Math.max(W, H) * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.55, 'rgba(3,3,4,.4)'); vg.addColorStop(1, 'rgba(3,3,4,.9)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    if (run && run.coreHp / run.coreMax < 0.3) { ctx.fillStyle = `rgba(110,40,40,${0.08 + Math.sin(t * 6) * 0.05})`; ctx.fillRect(0, 0, W, H); }

    // ----- Cursor (weich, hochaufgelöst) -----
    for (const s of strikes) {
      const k = 1 - s.life / s.max, sx = X(s.x), sy = Y(s.y), rr = s.r * P * (0.55 + k * 0.75);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const fg = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr);
      fg.addColorStop(0, `rgba(255,236,190,${0.35 * (1 - k)})`); fg.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(sx, sy, rr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255,240,210,${0.9 * (1 - k)})`; ctx.lineWidth = Math.max(1.5, 5 * (1 - k)) * (P / 3);
      ctx.beginPath(); ctx.ellipse(sx, sy, rr, rr * 0.92, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    if (run && game.cursor.on) {
      const [mx, my] = toLo(game.cursor.x, game.cursor.y);
      const cxp = X(mx), cyp = Y(my), R = game.cursor.r * sc * P, ch = game.cursor.charge, full = ch >= 1;
      const u = P / 3, pulse = full ? 0.5 + 0.5 * Math.sin(t * 7) : 0;
      ctx.save();
      // weicher Innenschein
      const ig = ctx.createRadialGradient(cxp, cyp, R * 0.2, cxp, cyp, R);
      ig.addColorStop(0, 'rgba(232,206,140,0)'); ig.addColorStop(1, `rgba(232,206,140,${full ? 0.1 + pulse * 0.06 : 0.04})`);
      ctx.fillStyle = ig; ctx.beginPath(); ctx.ellipse(cxp, cyp, R, R * 0.92, 0, 0, Math.PI * 2); ctx.fill();
      // gestrichelter Außenring, dreht sich
      ctx.setLineDash([R * 0.18, R * 0.1]); ctx.lineDashOffset = -t * R * 0.4;
      ctx.strokeStyle = `rgba(214,196,150,${full ? 0.55 : 0.28})`; ctx.lineWidth = 1.5 * u;
      ctx.beginPath(); ctx.ellipse(cxp, cyp, R, R * 0.92, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      // Ladebogen
      ctx.lineCap = 'round';
      ctx.strokeStyle = full ? `rgba(246,226,170,${0.85 + pulse * 0.15})` : 'rgba(226,200,140,.9)';
      ctx.lineWidth = (full ? 3.5 : 3) * u;
      if (full) { ctx.shadowColor = 'rgba(246,220,150,.8)'; ctx.shadowBlur = 12 * u; }
      ctx.beginPath(); ctx.ellipse(cxp, cyp, R + 3 * u, (R + 3 * u) * 0.92, 0, -Math.PI / 2, -Math.PI / 2 + ch * Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
      // Fadenkreuz
      const g1 = 4 * u, g2 = 10 * u;
      ctx.strokeStyle = 'rgba(245,240,228,.9)'; ctx.lineWidth = 1.5 * u;
      ctx.beginPath();
      ctx.moveTo(cxp - g2, cyp); ctx.lineTo(cxp - g1, cyp); ctx.moveTo(cxp + g1, cyp); ctx.lineTo(cxp + g2, cyp);
      ctx.moveTo(cxp, cyp - g2); ctx.lineTo(cxp, cyp - g1); ctx.moveTo(cxp, cyp + g1); ctx.lineTo(cxp, cyp + g2);
      ctx.stroke();
      ctx.fillStyle = full ? 'rgba(255,236,190,1)' : 'rgba(245,240,228,.7)';
      ctx.beginPath(); ctx.arc(cxp, cyp, 1.6 * u, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Kamerafahrt im Intro / Titel
    const ph = ui.phase;
    const zTarget = ph === 'load' ? 1.9 : ph === 'intro' ? 1.0 : ph === 'title' ? 1.18 : 1;
    zoom += (zTarget - zoom) * Math.min(1, dt * (ph === 'intro' ? 0.45 : 2.2));
    if (zoom > 1.003) {
      ctx.imageSmoothingEnabled = false;
      const zw = W / zoom, zh = H / zoom, zx = X(cx) - zw / 2, zy = Y(cy - 20) - zh / 2;
      ctx.drawImage(canvas, Math.max(0, zx), Math.max(0, zy), zw, zh, 0, 0, W, H);
    }
    // Zahlen (Pixel-Schrift mit Kontur)
    const base = 8 * Math.max(1, Math.round(P * 0.67));
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const tx of texts) {
      const k = 1 - tx.life / tx.max;
      const x = Math.round(X(tx.x)), y = Math.round(Y(tx.y - Math.min(1, k * 2.5) * 7));
      const fs = tx.big ? base * 1.5 : base;
      ctx.font = `700 ${fs}px Silkscreen, monospace`;
      ctx.globalAlpha = tx.life / tx.max > 0.25 ? 1 : 0.5;
      ctx.fillStyle = '#0d0a10';
      for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) ctx.fillText(tx.txt, x + a * Math.max(1, P / 2), y + b * Math.max(1, P / 2));
      ctx.fillStyle = tx.color; ctx.fillText(tx.txt, x, y);
    }
    ctx.globalAlpha = 1;

    // ----- Effekte weiterrechnen -----
    for (const p of parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vz -= p.g * dt; p.z = Math.max(0, p.z + p.vz * dt); p.vx *= 0.97; p.vy *= 0.97; }
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
    for (const tx of texts) tx.life -= dt;
    while (texts.length && texts[0].life <= 0) texts.shift();
    for (const arr of [zaps, booms, smokes, strikes]) { for (const o of arr) o.life -= dt; for (let i = arr.length - 1; i >= 0; i--) if (arr[i].life <= 0) arr.splice(i, 1); }
  }

  // Laden mit Fortschritt (mindestens kurz sichtbar)
  (async () => {
    const t0 = performance.now();
    for (let i = 0; i < loadSteps.length; i++) {
      ui.setLoad(i / loadSteps.length, loadSteps[i][0]);
      await tick();
      await loadSteps[i][1]();
    }
    const wait = Math.max(0, 1400 - (performance.now() - t0));
    const steps = 8;
    for (let i = 1; i <= steps; i++) { ui.setLoad(0.75 + 0.25 * i / steps); await new Promise(r => setTimeout(r, wait / steps)); }
    ui.ready();
  })();

  return { frame, destroy() { offs.forEach(f => f()); ro.disconnect(); canvas.removeEventListener('pointermove', onPtr); canvas.removeEventListener('pointerdown', onPtr); canvas.removeEventListener('pointerleave', onLeave); ui.destroy(); } };
}
