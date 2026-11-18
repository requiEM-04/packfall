// Pixel-Art für den Booster-Stil: alles prozedural oder als Text-Sprites, nichts Fremdes kopiert.

export const OUT = '#060507';

// Alles gedeckt: Sättigung runter, etwas dunkler
const muteCache = new Map();
export function mute(hex, sf = 0.46, lf = 0.9) {
  if (!hex || hex[0] !== '#' || hex.length !== 7) return hex;
  const key = hex + sf + lf;
  if (muteCache.has(key)) return muteCache.get(key);
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  s *= sf; l *= lf;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p2 = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p2 + (q - p2) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p2 + (q - p2) * (2 / 3 - t) * 6 : p2; };
  const out = '#' + [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  muteCache.set(key, out);
  return out;
}

// ---------- Grundwerkzeuge ----------
function grid(w, h) { return Array.from({ length: h }, () => Array(w).fill(null)); }
function outline(g, col = OUT) {
  const h = g.length, w = g[0].length;
  const o = g.map(r => r.slice());
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g[y][x]) continue;
    if ((g[y - 1]?.[x]) || (g[y + 1]?.[x]) || g[y][x - 1] || g[y][x + 1]) o[y][x] = col;
  }
  return o;
}
function toCanvas(g, scale = 1) {
  const h = g.length, w = g[0].length;
  const c = document.createElement('canvas');
  c.width = w * scale; c.height = h * scale;
  const x = c.getContext('2d');
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    if (!g[yy][xx]) continue;
    x.fillStyle = mute(g[yy][xx]);
    x.fillRect(xx * scale, yy * scale, scale, scale);
  }
  return c;
}
function rowsToGrid(rows, pal) {
  const w = Math.max(...rows.map(r => r.length));
  return rows.map(r => Array.from({ length: w }, (_, i) => pal[r[i]] || null));
}
function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f >= 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  else { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
  return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
}

// Varianten: weißer Blitz, Eis-Tönung
export function variant(canvas, kind) {
  const c = document.createElement('canvas');
  c.width = canvas.width; c.height = canvas.height;
  const x = c.getContext('2d');
  x.drawImage(canvas, 0, 0);
  x.globalCompositeOperation = 'source-atop';
  x.fillStyle = kind === 'flash' ? '#e8e4dc' : kind === 'slow' ? 'rgba(120,170,200,.45)' : kind === 'shadow' ? '#000000' : 'transparent';
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

// ---------- Turm (Basis) ----------
export function towerCanvas() {
  const W = 30, H = 58;
  const g = grid(W, H);
  const rnd = seeded(77);
  const set = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; };
  const stone = ['#5a5a62', '#4c4c54', '#40404a', '#34343c', '#2a2a31'];
  // Felssockel
  for (let y = 50; y < 58; y++) {
    const inset = y < 52 ? 2 : y < 55 ? 1 : 0;
    for (let x = inset; x < W - inset; x++) {
      const v = (x + y * 3) % 7 === 0 ? 4 : x < 9 ? 1 : x > 21 ? 3 : 2;
      set(x, y, stone[v]);
    }
  }
  // Treppe vor der Tür
  for (let y = 52; y < 56; y++) for (let x = 12 - (y - 52); x <= 17 + (y - 52); x++) set(x, y, y % 2 ? '#4a4a52' : '#3a3a42');
  // Schaft mit unregelmäßigen Steinen
  for (let y = 16; y < 50; y++) {
    const taper = y < 20 ? 0 : 0;
    for (let x = 5 + taper; x <= 24 - taper; x++) {
      const row = Math.floor((y - 16) / 3), off = (row % 2) * 3;
      const mortar = (y - 16) % 3 === 2 || ((x - 5 + off) % 6 === 5);
      const shade = x < 9 ? 0 : x < 14 ? 1 : x < 20 ? 2 : 3;
      let c = mortar ? '#1c1c22' : stone[shade];
      if (!mortar && rnd() < 0.08) c = stone[Math.min(4, shade + 1)];
      if (!mortar && x === 5) c = '#66666e';
      set(x, y, c);
    }
  }
  // Moos unten
  for (let x = 5; x <= 24; x++) if (rnd() < 0.55) set(x, 49 - Math.floor(rnd() * 3), rnd() < 0.5 ? '#2e3a2c' : '#26302a');
  // Kragen + Zinnen
  for (let y = 12; y < 16; y++) for (let x = 3; x <= 26; x++) set(x, y, y === 12 ? '#6a6a72' : y === 15 ? '#26262c' : x < 10 ? '#55555d' : '#45454d');
  for (const mx of [3, 9, 15, 21]) for (let y = 6; y < 12; y++) for (let x = mx; x < mx + 4 && x <= 26; x++) set(x, y, x === mx ? '#6a6a72' : y === 6 ? '#5a5a62' : '#45454d');
  // Banner (dunkelrot) links und rechts
  for (const bx of [6, 20]) for (let y = 16; y < 31; y++) for (let x = bx; x < bx + 4; x++) {
    if (y > 27 && ((x - bx) === 1 || (x - bx) === 2) && y > 28) continue;
    set(x, y, x === bx ? '#5a1c1c' : y === 16 ? '#2a0e0e' : '#47161a');
    if (y === 21 && x === bx + 1) set(x, y, '#8a7448');
    if (y === 22 && (x === bx + 1 || x === bx + 2)) set(x, y, '#8a7448');
  }
  // Fensterschlitze mit warmem Licht
  for (const [wx, wy] of [[14, 20], [14, 34]]) for (let y = wy; y < wy + 5; y++) for (let x = wx; x < wx + 2; x++) set(x, y, y === wy ? '#6a4a2a' : '#c08a3a');
  // Tor
  for (let y = 41; y < 50; y++) for (let x = 11; x <= 18; x++) {
    if (y === 41 && (x < 13 || x > 16)) continue;
    if (y === 42 && (x === 11 || x === 18)) continue;
    let c = (x - 11) % 2 ? '#3a2616' : '#2e1e12';
    if (y === 45) c = '#1a120a';
    if (x === 17 && y === 46) c = '#8a7448';
    set(x, y, c);
  }
  // Fackeln
  for (const tx of [9, 20]) { set(tx, 43, '#3a2616'); set(tx, 44, '#3a2616'); set(tx, 42, '#d08a3a'); set(tx, 41, '#f0c070'); }
  return toCanvas(outline(g));
}

export function crystalCanvas() {
  const W = 11, H = 15;
  const g = grid(W, H);
  for (let y = 0; y < H; y++) {
    const hw = y <= 6 ? (y + 1) * 0.72 : (H - 1 - y) * 0.85;
    for (let x = 0; x < W; x++) {
      const dx = x - 5;
      if (Math.abs(dx) > hw) continue;
      let c = dx < 0 ? '#9cc4cc' : dx > 0 ? '#4e7e90' : '#c8dee2';
      if (y < 6 && dx === -1) c = '#e0eef0';
      if (y > 9 && dx > 0) c = '#355e70';
      g[y][x] = c;
    }
  }
  return toCanvas(outline(g, '#0c171c'));
}

// ---------- Helden ----------
const HEADS = {
  hood: ['....kkkk....', '...kHHHhk...', '..kHHHHhhk..', '..khsssshk..'],
  helmet: ['...kkkkkk...', '..kMMMMmmk..', '..kMMMMMmk..', '..kmssssmk..'],
  wizard: ['.......kk...', '......kHk...', '.....kHHk...', '....kHHhk...', '..kkHHHhhkk.', '..khsssshk..'],
  crown: ['...Y.Y.Y....', '...kYYYYk...', '..kMMMMmmk..', '..kmssssmk..'],
};
const FACE = ['..ksesessk..', '...kssssk...'];
const FACE_BEARD = ['..ksesessk..', '..kbbbbbbk..'];
const BODY = [
  '..kAAAAaak..',
  '.kAAAAAaaak.',
  '.ksAAAAaask.',
  '..kBBBBBBk..',
  '..kaAAAaak..',
  '...kLLkllk..',
  '...kLLkllk..',
  '...kkk.kkk..',
];
const WEAPONS = {
  sling: { rows: ['.kk', 'k.k', 'kSk', '.k.'], grip: [1, 3], pal: { S: '#c9ccd2' } },
  torch: { rows: ['.F.', 'FYF', 'FYF', '.w.', '.w.'], grip: [1, 4], pal: { F: '#ff7a2a', Y: '#ffe45c', w: '#5a3a22' } },
  hammer: { rows: ['kkkk', 'kWMk', 'kMmk', 'kkkk', '.w..', '.w..'], grip: [1, 5], pal: { W: '#e6ecf2', M: '#a8b2bd', m: '#6b7480', w: '#5a3a22' } },
  staffIce: { rows: ['.C.', 'CcC', '.C.', '.w.', '.w.', '.w.', '.w.'], grip: [1, 5], pal: { C: '#bff3ff', c: '#ffffff', w: '#4a3520' } },
  crossbow: { rows: ['W....', 'Wwwwk', 'W....'], grip: [1, 1], pal: { W: '#c8ff7a', w: '#6b4a2a' } },
  staffZap: { rows: ['.Z.', 'ZzZ', '.Z.', '.w.', '.w.', '.w.', '.w.'], grip: [1, 5], pal: { Z: '#d9b8ff', z: '#ffffff', w: '#2e2440' } },
  mortar: { rows: ['kkkk', 'kNNk', 'kNnk', 'kkkk'], grip: [0, 3], pal: { N: '#7c8592', n: '#4b525c' } },
  sword: { rows: ['.W.', '.W.', '.W.', '.W.', 'GWG', '.w.'], grip: [1, 5], pal: { W: '#ffffff', G: '#ffd23f', w: '#8a5a1e' } },
};
const HERO_DEF = {
  schleuderer:    { head: 'hood',   weapon: 'sling',    pal: { H: '#8a6a3e', h: '#5e4526', A: '#4f7a3a', a: '#34522a', B: '#6b4a2a', L: '#4a3a2a', l: '#33281d' } },
  funkenwerfer:   { head: 'hood',   weapon: 'torch',    pal: { H: '#d0632a', h: '#8c3a18', A: '#9a2f24', a: '#66201a', B: '#3a2a20', L: '#3a3040', l: '#262030' } },
  steinwache:     { head: 'helmet', weapon: 'hammer',   pal: { M: '#c8d0da', m: '#7c8794', A: '#8c96a3', a: '#5d6673', B: '#4a3a2a', L: '#4b5260', l: '#333844' } },
  frostweberin:   { head: 'wizard', weapon: 'staffIce', pal: { H: '#3a7fd0', h: '#22508c', A: '#2f5fa8', a: '#1f3f73', B: '#c9e8ff', L: '#1f3f73', l: '#152b4f' } },
  dornenschuetze: { head: 'hood',   weapon: 'crossbow', pal: { H: '#3f7a2e', h: '#27501c', A: '#5c6b2e', a: '#3c4720', B: '#6b4a2a', L: '#3a3a28', l: '#26261a' } },
  blitzruferin:   { head: 'wizard', weapon: 'staffZap', pal: { H: '#7a45c9', h: '#4f2a8a', A: '#5c34a0', a: '#3c2070', B: '#ffd23f', L: '#3c2070', l: '#281450' } },
  glutmoerser:    { head: 'helmet', weapon: 'mortar',   beard: true, pal: { M: '#c0392b', m: '#7e1f17', b: '#e8a050', A: '#8a5a2e', a: '#5c3a1c', B: '#2a1a10', L: '#4a3020', l: '#301f14' } },
  sonnenwaechter: { head: 'crown',  weapon: 'sword',    pal: { Y: '#fff2a0', M: '#ffd75e', m: '#c99a1e', A: '#f0c040', a: '#b8861a', B: '#fff2b0', L: '#c99a1e', l: '#8a6a12' } },
};

export function heroCanvas(id, { silhouette = false } = {}) {
  const d = HERO_DEF[id];
  const pal = { k: OUT, s: '#f0c09a', e: '#1a1020', ...d.pal };
  const rows = [...HEADS[d.head], ...(d.beard ? FACE_BEARD : FACE), ...BODY];
  const W = 18, H = rows.length + 4;
  const g = grid(W, H);
  const oy = H - rows.length, ox = 2;
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const c = pal[r[x]]; if (c) g[oy + y][ox + x] = c; } });
  // Waffe an der rechten Hand (Hand bei x=9, y=Körperzeile 2)
  const w = WEAPONS[d.weapon];
  const wp = { k: OUT, ...w.pal };
  const handY = oy + rows.length - BODY.length + 2, handX = ox + 10;
  w.rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) {
    const c = wp[r[x]]; if (!c) continue;
    const gx = handX + x - w.grip[0], gy = handY + y - w.grip[1];
    if (gx >= 0 && gx < W && gy >= 0 && gy < H) g[gy][gx] = c;
  } });
  let out = g;
  if (silhouette) out = g.map(r => r.map(c => (c ? '#2a2138' : null)));
  return toCanvas(out);
}

// ---------- Gegner ----------
const ENEMY = {
  krabbler: {
    pal: { k: OUT, G: '#6a9a3e', g: '#4a7028', H: '#3a2a4a', R: '#ff4a3a', W: '#e8e0c8', A: '#4a3a5a', a: '#352a42', B: '#8a6a3a', L: '#2a2236', S: '#c8d0da', w: '#6b4a2a' },
    frames: [
      ['.........S..', '.k......kSk.', '.kGk.kkkkwk.', '..kGkHHHkwk.', '...kGGGGgkw.', '...kGRGRgkw.', '...kGGGGgkw.', '....kWWWk.w.', '..kAAAAaakw.', '.kGAAAAaaGw.', '.kgkBBBBkgk.', '...kAAAak...', '...kLkkLk...', '...kk..kk...'],
      ['.........S..', '.k......kSk.', '.kGk.kkkkwk.', '..kGkHHHkwk.', '...kGGGGgkw.', '...kGRGRgkw.', '...kGGGGgkw.', '....kWWWk.w.', '..kAAAAaakw.', '.kGAAAAaaGw.', '.kgkBBBBkgk.', '...kAAAak...', '...kLk.kLk..', '..kk.....kk.'],
    ],
  },
  flitzer: {
    pal: { k: OUT, B: '#4a2a5a', W: '#7a4a8c', e: '#ff5a5a' },
    frames: [
      ['k.............k', 'kk...........kk', 'kWk..kkkkk..kWk', '.kWkkBBBBBkkWk.', '..kWWBeBeBWWk..', '...kkBBBBBkk...', '.....kk.kk.....'],
      ['...............', '......kkk......', '.....kBBBk.....', 'kkkkkBeBeBkkkkk', 'kWWWWBBBBBWWWWk', '.kWWkkBBBkkWWk.', '..kk..kk.kk.kk.'],
    ],
  },
  brocken: {
    pal: { k: OUT, G: '#7b8a82', g: '#4e5a54', e: '#8fffd8', m: '#3fbf90' },
    frames: [
      ['.....kkkkkk.....', '....kGGGGggk....', '...kGGeGGeggk...', '...kGGGGGGggk...', '.kkkgGGGGGgggkk.', 'kGGGkkgggggkkGgk', 'kGGGGGkkkkkGGGgk', 'kgGGGGGGGGGGGggk', '.kgGGGmGGmGGggk.', '..kggGGGGGGggk..', '..kgggggggggk...', '..kGGk...kGGk...', '.kGGgk...kGGgk..', '.kkkkk...kkkkk..'],
      ['.....kkkkkk.....', '....kGGGGggk....', '...kGGeGGeggk...', '...kGGGGGGggk...', '.kkkgGGGGGgggkk.', 'kGGGkkgggggkkGgk', 'kGGGGGkkkkkGGGgk', 'kgGGGGGGGGGGGggk', '.kgGGGmGGmGGggk.', '..kggGGGGGGggk..', '..kgggggggggk...', '...kGGk.kGGk....', '..kGGgk.kGGgk...', '..kkkkk.kkkkk...'],
    ],
  },
};

function bossGrid(frame) {
  const W = 30, H = 28;
  const g = grid(W, H);
  const cx = 15, cy = 16;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x - cx + 0.5, dy = y - cy + 0.5;
    // Körper
    const body = (dx * dx) / (10.5 * 10.5) + (dy * dy) / (9.5 * 9.5) <= 1;
    // Arme
    const armY = cy + 2 + (frame ? 1 : 0);
    const arm = ((x - 3.5) ** 2) / 9 + ((y - armY) ** 2) / 20 <= 1 || ((x - 26.5) ** 2) / 9 + ((y - armY) ** 2) / 20 <= 1;
    // Hörner
    const hornL = y >= 1 && y <= 9 && Math.abs(x - (8 - (9 - y) * 0.55)) <= Math.max(0.6, (y - 1) * 0.28);
    const hornR = y >= 1 && y <= 9 && Math.abs(x - (21 + (9 - y) * 0.55)) <= Math.max(0.6, (y - 1) * 0.28);
    if (hornL || hornR) { g[y][x] = y < 4 ? '#fff2d0' : '#c9b48a'; continue; }
    if (arm && !body) { g[y][x] = dy > 3 ? '#5a1420' : '#8a2030'; continue; }
    if (!body) continue;
    let c = '#a3263a';
    if (dx < -4 && dy < -2) c = '#c93a4e';
    if (dx > 4 || dy > 5) c = '#6e1626';
    if (dy > 7) c = '#4e0e1a';
    // Bauch-Platten
    if (Math.abs(dx) < 4 && dy > 1 && dy < 7 && (Math.floor(dy) % 2 === 0)) c = '#7a1a2c';
    g[y][x] = c;
  }
  // Augen
  for (const ex of [11, 12, 18, 19]) { g[12][ex] = '#ffec5c'; g[13][ex] = ex === 12 || ex === 19 ? '#fff9c0' : '#ffb52e'; }
  // Maul mit Zähnen
  for (let x = 11; x <= 19; x++) { g[18][x] = '#1a0408'; g[19][x] = '#1a0408'; if (x % 2) g[18][x] = '#fff2d0'; }
  // Flammenkrone
  for (const [x, y] of [[13, 5], [15, 4], [17, 5], [14, 6], [16, 6], [15, 5]]) g[y][x] = y < 5 ? '#ffe45c' : '#ff7a2a';
  // Krallen
  for (const x of [2, 4, 25, 27]) g[cy + 6 + (frame ? 1 : 0)][x] = '#fff2d0';
  return outline(g);
}

const enemyCache = new Map();
export function enemyCanvas(type, frame) {
  const k = `${type}:${frame}`;
  if (enemyCache.has(k)) return enemyCache.get(k);
  let c;
  if (type === 'boss') c = toCanvas(bossGrid(frame));
  else { const d = ENEMY[type]; c = toCanvas(rowsToGrid(d.frames[frame], d.pal)); }
  enemyCache.set(k, c);
  return c;
}

// ---------- Deko ----------
export function rockCanvas(rnd, size, tint = '#3a4440') {
  const W = size + 2, H = Math.max(3, Math.round(size * 0.7)) + 2;
  const g = grid(W, H);
  const rx = size / 2, ry = (H - 2) / 2, cx = W / 2, cy = H / 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
    const r = dx * dx + dy * dy + (rnd() - 0.5) * 0.25;
    if (r > 1) continue;
    g[y][x] = dx + dy < -0.6 ? shade(tint, 0.16) : dx + dy > 0.5 ? shade(tint, -0.4) : tint;
  }
  return toCanvas(outline(g));
}
export function treeCanvas(rnd, tint = '#3b2f2c') {
  const W = 13, H = 18;
  const g = grid(W, H);
  const line = (x0, y0, x1, y1) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); if (g[y] && x >= 0 && x < W) g[y][x] = tint; }
  };
  line(6, 17, 6, 6); line(7, 17, 7, 9);
  line(6, 10, 2, 5 + Math.round(rnd() * 2)); line(7, 9, 11, 4 + Math.round(rnd() * 2));
  line(6, 7, 5, 1); line(4, 7, 1, 8); line(9, 6, 10, 1);
  return toCanvas(outline(g));
}
export function bonesCanvas(rnd) {
  const rows = rnd() < 0.5
    ? ['.kkk.', 'kWWWk', 'kWkWk', '.kWk.', '.k.k.']
    : ['k.....k', 'WkkkkkW', 'k.....k'];
  return toCanvas(rowsToGrid(rows, { k: '#1a1418', W: '#cfc8b8' }));
}

// ---------- Booster-Paket (für Menü + Öffnen) ----------
export function packCanvas(kind) {
  const W = 30, H = 42;
  const g = grid(W, H);
  const pal = kind === 'elite'
    ? { a: '#d0b878', b: '#a88c4a', c: '#705c30', d: '#362c16', em: '#ece4cc', em2: '#c8a860' }
    : kind === 'starter'
      ? { a: '#c48a86', b: '#965052', c: '#643034', d: '#30181a', em: '#ece0d0', em2: '#c8ac7c' }
      : kind === 'green'
        ? { a: '#a0b48a', b: '#6a805a', c: '#425438', d: '#1e281a', em: '#e4ecd8', em2: '#b0c494' }
        : kind === 'purple'
          ? { a: '#aaa0c4', b: '#76669a', c: '#4a3e66', d: '#221c30', em: '#e8e2f0', em2: '#c0b4d8' }
          : { a: '#8ca8c0', b: '#5c7894', c: '#3a5064', d: '#1a2632', em: '#dce6ee', em2: '#98b4c4' };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    // gezackte Ränder oben/unten
    const crimp = (y < 3 || y > H - 4);
    if (crimp && ((x + (y < 3 ? y : H - y)) % 2 === 0) && (y === 0 || y === H - 1)) continue;
    if (x < 1 || x > W - 2) continue;
    let c = x < 6 ? pal.a : x > W - 7 ? pal.c : pal.b;
    if (crimp) c = (x % 2) ? pal.a : pal.c;
    if (y === 4 || y === H - 5) c = pal.d;
    if (!crimp && x >= 2 && x <= 3) c = shade(pal.a, 0.35);
    if (!crimp && y >= 33 && y <= 36) c = (x + y) % 2 ? pal.d : shade(pal.d, 0.15);
    g[y][x] = c;
  }
  // Emblem: kleiner Turm mit Kristall
  const em = [
    '....W....',
    '...WEW...',
    '....W....',
    '.D.D.D.D.',
    '.DDDDDDD.',
    '..DDDDD..',
    '..DDEDD..',
    '..DDDDD..',
    '..DDDDD..',
    '.DDDDDDD.',
  ];
  const ep = { W: pal.em, E: pal.em2, D: pal.d };
  em.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (ep[r[x]]) {
    for (const [ax, ay] of [[0, 0], [1, 0], [0, 1], [1, 1]]) g[8 + y * 2 + ay][6 + x * 2 + ax] = ep[r[x]];
  } });
  // Funkeln
  for (const [x, y] of [[5, 9], [24, 14], [22, 27], [7, 26]]) { g[y][x] = '#ffffff'; }
  return toCanvas(outline(g));
}

export function cardBackCanvas() {
  const W = 30, H = 42;
  const g = grid(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if ((x === 0 || x === W - 1) && (y === 0 || y === H - 1)) continue;
    const border = x < 2 || x > W - 3 || y < 2 || y > H - 3;
    g[y][x] = border ? ((x + y) % 2 ? '#c9a227' : '#8a6a12') : ((x + y) % 4 === 0 ? '#2e2140' : '#241a33');
  }
  const cr = [
    '...k...', '..kCk..', '.kCWck.', '.kCWck.', 'kCCWcck', '.kCcck.', '..kck..', '...k...',
  ];
  const cp = { k: '#0a2a3d', C: '#7ff0ff', W: '#e8fdff', c: '#22a6dc' };
  cr.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (cp[r[x]]) g[17 + y][11 + x] = cp[r[x]]; });
  return toCanvas(g);
}

// Kleine Icons (für HUD/Menü)
export const ICON_ROWS = {
  coin: { pal: { o: '#5a3a10', y: '#ffb52e', w: '#fff1b0', d: '#c97a10' }, rows: ['..oooo..', '.oyyyyo.', 'oyywyyyo', 'oywyyydo', 'oyyyyydo', 'oyyyyddo', '.oyddyo.', '..oooo..'] },
  gem: { pal: { o: '#0f3352', c: '#5fd0ff', w: '#e6fbff', b: '#2a7fd6' }, rows: ['.oooooo.', 'occwwcco', 'obccccbo', '.obccbo.', '..obbo..', '...oo...'] },
  sword: { pal: { s: '#cfd8e6', w: '#ffffff', h: '#b07a3a' }, rows: ['......ss', '.....sws', '....sws.', '.h.sws..', '..hws...', '..hh....', '.h..h...', 'h.......'] },
  speed: { pal: { y: '#ffe14d', o: '#c98a12' }, rows: ['....yyo.', '...yyo..', '..yyo...', '.yyyyyo.', '...yyo..', '..yyo...', '.yyo....', '.yo.....'] },
  shield: { pal: { o: '#1d3566', b: '#5aa0ff', w: '#cfe6ff' }, rows: ['oooooooo', 'obbbbwbo', 'obbbbwbo', 'obbbbbbo', 'obbbbbbo', '.obbbbo.', '..obbo..', '...oo...'] },
  heart: { pal: { o: '#6a1020', r: '#ff4a5e', w: '#ffd0d6' }, rows: ['.oo.oo.', 'orwrrro', 'orrrrro', 'orrrrro', '.orrro.', '..oro..', '...o...'] },
  crit: { pal: { o: '#a23a00', y: '#ff8a3d', w: '#ffffff' }, rows: ['...o...', '...y...', 'o.yyy.o', '.yywyy.', 'o.yyy.o', '...y...', '...o...'] },
  lock: { pal: { o: '#8a8aa6', g: '#c9c9da', k: '#3a3a50' }, rows: ['..ooo..', '.o...o.', '.o...o.', 'ooooooo', 'oggkggo', 'ogggggo', 'ooooooo'] },
  play: { pal: { w: '#ffd23f' }, rows: ['w......', 'ww.....', 'www....', 'wwww...', 'www....', 'ww.....', 'w......'] },
  plus: { pal: { w: '#8f82b0' }, rows: ['..w..', '..w..', 'wwwww', '..w..', '..w..'] },
  cursor: { pal: { W: '#ffd75e', Y: '#ffffff' }, rows: ['...WW...', '..W..W..', '.W....W.', 'WW.YY.WW', 'WW.YY.WW', '.W....W.', '..W..W..', '...WW...'] },
  flag: { pal: { k: '#c8c0d8', R: '#e8434f', r: '#a82838' }, rows: ['kRRRRR.', 'kRRRRRR', 'kRRRRr.', 'k......', 'k......', 'k......', 'kk.....'] },
  trophy: { pal: { Y: '#ffc23d', W: '#fff2b0', k: '#8a5a12' }, rows: ['kYYYYYk', 'YkYWYkY', 'YkYYYkY', '.kYYYk.', '..kYk..', '...Y...', '..YYY..', '.kkkkk.'] },
  user: { pal: { k: '#1a1424', S: '#f0c09a', B: '#5aa8ff', b: '#3a7fd0' }, rows: ['..kkk..', '.kSSSk.', '.kSSSk.', '..kkk..', '.kBBbk.', 'kBBBBbk', 'kBBBBbk'] },
  helm: { pal: { R: '#e8434f', M: '#c8d0da', W: '#ffffff', k: '#3a4250' }, rows: ['...RR...', '..kkkk..', '.kMMMMk.', 'kMWMMMMk', 'kMkkkkMk', 'kMMkkMMk', '.kMMMMk.', '..kkkk..'] },
  pack: { pal: { k: '#1a1020', Y: '#ffd75e', y: '#a8740e', B: '#3a7fd0', W: '#e8fdff', C: '#5fe3ff' }, rows: ['.kkkkkk.', 'kYyYyYyk', 'kBBBBBBk', 'kBBWBBBk', 'kBWCWBBk', 'kBBWBBBk', 'kBBBBBBk', 'kYyYyYyk', '.kkkkkk.'] },
  anvil: { pal: { k: '#2a2836', G: '#9aa3b2', W: '#d8e0ea', O: '#ff8a2a' }, rows: ['.......O.', '.kkkkkk.O', 'kWWGGGGGk', '.kkGGGkk.', '...kGk...', '..kGGGk..', '.kkkkkkk.'] },
  skull: { pal: { k: '#1a1418', W: '#e8e0d0' }, rows: ['.kkkkk.', 'kWWWWWk', 'kWkWkWk', 'kWWkWWk', '.kWWWk.', '.kWkWk.', '..kkk..'] },
  chart: { pal: { k: '#2a2236', R: '#e8434f', B: '#5aa8ff', G: '#6be06b' }, rows: ['.....kkk', '.....kGk', '..kkkkGk', '..kBkkGk', 'kkkBkkGk', 'kRkBkkGk', 'kRkBkkGk', 'kkkkkkkk'] },
  gear: { pal: { k: '#c8c0d8', G: '#6a6280' }, rows: ['...kk...', '.k.kk.k.', '..kkkk..', 'kkkGGkkk', 'kkkGGkkk', '..kkkk..', '.k.kk.k.', '...kk...'] },
  tower: { pal: { k: '#9a98b0', G: '#5a5870', C: '#5fe3ff' }, rows: ['k.k.k.k', 'kkkkkkk', '.kGGGk.', '.kGCGk.', '.kGGGk.', '.kGkGk.', 'kkkkkkk'] },
  back: { pal: { Y: '#ffd75e' }, rows: ['...Y....', '..YY....', '.YYYYYYY', 'YYYYYYYY', '.YYYYYYY', '..YY....', '...Y....'] },
  eye: { pal: { k: '#c8c0d8', W: '#ffffff', B: '#3a7fd0' }, rows: ['..kkkk..', '.kWWWWk.', 'kWWBBWWk', 'kWWBBWWk', '.kWWWWk.', '..kkkk..'] },
  help: { pal: { Y: '#ffd75e' }, rows: ['.YYYY.', 'YY..YY', '....YY', '...YY.', '..YY..', '......', '..YY..'] },
  scroll: { pal: { P: '#e8d5a8', L: '#8a7a5a', k: '#8a6a3a' }, rows: ['kPPPPPk', '.PLLLP.', '.PPPPP.', '.PLLLP.', '.PPPPP.', 'kPPPPPk'] },
  check: { pal: { G: '#6be06b' }, rows: ['......G', '.....GG', 'G...GG.', 'GG.GG..', '.GGG...', '..G....'] },
  logout: { pal: { k: '#c8c0d8', D: '#5a3a22', Y: '#ffd75e' }, rows: ['kkkk....', 'kDDk..Y.', 'kDDkYYYY', 'kDDk..Y.', 'kDDk....', 'kkkk....'] },
  up: { pal: { Y: '#5fd0ff' }, rows: ['...Y...', '..YYY..', '.YYYYY.', 'YYYYYYY', '..YYY..', '..YYY..', '..YYY..'] },
  chest: { pal: { k: '#2a1a10', B: '#8a5a2e', Y: '#ffd75e' }, rows: ['.kkkkkk.', 'kBBBBBBk', 'kYYYYYYk', 'kBBYYBBk', 'kBBYYBBk', 'kBBBBBBk', '.kkkkkk.'] },
};
export function iconSVG(name) {
  const d = ICON_ROWS[name];
  if (!d) return '';
  let rects = '';
  d.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (!d.pal[ch]) { x++; continue; }
      let x2 = x + 1;
      while (x2 < row.length && row[x2] === ch) x2++;
      rects += `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${mute(d.pal[ch], 0.42, 0.9)}"/>`;
      x = x2;
    }
  });
  const w = Math.max(...d.rows.map(r => r.length));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${d.rows.length}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

// ---------- Logo (eigene Pixel-Schrift, gestapelt) ----------
const GLYPH = {
  P: ['#####.', '##..##', '##..##', '#####.', '##....', '##....', '##....', '##....'],
  A: ['.####.', '##..##', '##..##', '######', '##..##', '##..##', '##..##', '##..##'],
  C: ['.#####', '##....', '##....', '##....', '##....', '##....', '##....', '.#####'],
  K: ['##..##', '##.##.', '####..', '###...', '####..', '##.##.', '##..##', '##..##'],
  F: ['######', '##....', '##....', '#####.', '##....', '##....', '##....', '##....'],
  L: ['##....', '##....', '##....', '##....', '##....', '##....', '######', '######'],
};
export function logoCanvas(lines = ['PACK', 'FALL']) {
  const S = 2, GW = 6, GH = 8, GAP = 1, LGAP = 3, PAD = 4, SH = 3;
  const lineW = w => (w.length * GW + (w.length - 1) * GAP) * S;
  const W = Math.max(...lines.map(lineW)) + PAD * 2 + SH, H = lines.length * GH * S + (lines.length - 1) * LGAP * S + PAD * 2 + SH;
  const fill = Array.from({ length: H }, () => Array(W).fill(0));
  const owner = Array.from({ length: H }, () => Array(W).fill(-1));
  lines.forEach((word, li) => {
    const ox = PAD + Math.floor((W - PAD * 2 - SH - lineW(word)) / 2);
    const oy = PAD + li * (GH + LGAP) * S;
    [...word].forEach((ch, ci) => {
      const g = GLYPH[ch]; if (!g) return;
      g.forEach((row, y) => [...row].forEach((c, x) => {
        if (c !== '#') return;
        for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) {
          const px = ox + (ci * (GW + GAP) + x) * S + a, py = oy + y * S + b;
          fill[py][px] = 1; owner[py][px] = li;
        }
      }));
    });
  });
  const PAL = [
    { hi: '#e6e1d6', top: '#c9c2b2', mid: '#a59d8c', low: '#7f786b', dark: '#3e3a33' },
    { hi: '#c9a59a', top: '#a26f64', mid: '#84504a', low: '#643a38', dark: '#2e1a1a' },
  ];
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const at = (px, py) => (py >= 0 && py < H && px >= 0 && px < W ? fill[py][px] : 0);
  // Schatten
  x.fillStyle = '#0a0909';
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) if (at(px - SH, py - SH) || at(px - SH + 1, py - SH)) x.fillRect(px, py, 1, 1);
  // Kontur
  x.fillStyle = '#050505';
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    if (at(px, py)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= 3 && at(px + dx, py + dy)) { x.fillRect(px, py, 1, 1); dy = 3; break; }
  }
  // Füllung mit Licht oben, Schatten unten, Bänder
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    if (!at(px, py)) continue;
    const p = PAL[owner[py][px]];
    const oy = PAD + owner[py][px] * (GH + LGAP) * S;
    const k = (py - oy) / (GH * S);
    let col = k < 0.3 ? p.top : k < 0.62 ? p.mid : p.low;
    if (!at(px, py - 1)) col = p.hi;
    else if (!at(px, py + 1)) col = p.dark;
    else if (!at(px - 1, py)) col = k < 0.62 ? p.hi : p.top;
    x.fillStyle = col; x.fillRect(px, py, 1, 1);
  }
  return c;
}

// ---------- Titelbild: Nachtszene mit Mond, Bergen und Turm ----------
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function titleBackdrop() {
  const W = 320, H = 180;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const rnd = seeded(2026);
  const sky = ['#06070a', '#090a0e', '#0d0e13', '#121318', '#17181e', '#1d1d23'];
  for (let y = 0; y < 132; y++) {
    const f = Math.min(sky.length - 1.001, (y / 132) * (sky.length - 1));
    const i = Math.floor(f), t = f - i;
    for (let px = 0; px < W; px++) {
      x.fillStyle = t * 16 > BAYER[(y % 4) * 4 + (px % 4)] ? sky[i + 1] : sky[i];
      x.fillRect(px, y, 1, 1);
    }
  }
  // Sterne
  for (let i = 0; i < 90; i++) {
    const sx = Math.floor(rnd() * W), sy = Math.floor(rnd() * 110);
    x.fillStyle = rnd() < 0.2 ? '#a8a49a' : rnd() < 0.5 ? '#7c7f88' : '#45474f';
    x.fillRect(sx, sy, 1, 1);
    if (rnd() < 0.06) { x.fillRect(sx - 1, sy, 3, 1); x.fillRect(sx, sy - 1, 1, 3); }
  }
  // Mond mit Halo
  const mx = 248, my = 38, mr = 15;
  for (let y = -mr - 10; y <= mr + 10; y++) for (let px = -mr - 10; px <= mr + 10; px++) {
    const d = Math.hypot(px, y);
    if (d <= mr) {
      let col = '#a7a397';
      if (px + y > 8) col = '#8c887d';
      if ((px - 4) ** 2 + (y + 3) ** 2 < 10 || (px + 6) ** 2 + (y - 5) ** 2 < 6 || (px - 1) ** 2 + (y - 8) ** 2 < 4) col = '#7f7b71';
      x.fillStyle = col; x.fillRect(mx + px, my + y, 1, 1);
    } else if (d <= mr + 10 && BAYER[((y + 40) % 4) * 4 + ((px + 40) % 4)] < (1 - (d - mr) / 10) * 5) {
      x.fillStyle = '#25262c'; x.fillRect(mx + px, my + y, 1, 1);
    }
  }
  // Berge (zwei Ebenen)
  const ridge = (base, amp, col, seed) => {
    const r2 = seeded(seed);
    let h = base;
    x.fillStyle = col;
    for (let px = 0; px < W; px++) {
      h += (r2() - 0.5) * amp; h = Math.max(base - 22, Math.min(base + 6, h));
      x.fillRect(px, Math.round(h), 1, H - Math.round(h));
    }
  };
  ridge(112, 3.2, '#111216', 7);
  ridge(128, 2.4, '#0c0d10', 11);
  // Hügel rechts mit Turm
  x.fillStyle = '#070709';
  for (let px = 0; px < W; px++) {
    const hy = 150 - Math.max(0, Math.sin(((px - 150) / 190) * Math.PI) * 30) + (px < 150 ? 4 : 0);
    x.fillRect(px, Math.round(hy), 1, H - Math.round(hy));
    if (rnd() < 0.5) { x.fillStyle = '#1a1e1b'; x.fillRect(px, Math.round(hy) - (rnd() < 0.3 ? 1 : 0), 1, 1); x.fillStyle = '#070709'; }
  }
  const tw = towerCanvas(), cr = crystalCanvas();
  const tx = 238, ty = 123;
  // Glühen um den Kristall (gerastert)
  for (let y = -26; y <= 26; y++) for (let px = -26; px <= 26; px++) {
    const d = Math.hypot(px, y) / 26;
    if (d < 1 && BAYER[((y + 52) % 4) * 4 + ((px + 52) % 4)] < (1 - d) * 5) { x.fillStyle = '#1c2a30'; x.fillRect(tx + px, ty - tw.height - 8 + y, 1, 1); }
  }
  x.drawImage(tw, tx - Math.floor(tw.width / 2), ty - tw.height + 2);
  x.drawImage(cr, tx - Math.floor(cr.width / 2), ty - tw.height - cr.height - 2);
  // tote Bäume links
  const r3 = seeded(5);
  [[30, 152], [58, 150], [96, 154]].forEach(([bx, by]) => { const t = treeCanvas(r3, '#050506'); x.drawImage(t, bx, by - t.height); });
  return c;
}
