// Packfall · Laternenwacht – Figuren (Canvas 2D, aus Einzelteilen, prozedural animiert)
// Ursprung = Fußpunkt, y nach oben negativ. Wächter schauen nach rechts, Schatten nach links.

export const OUT = '#120e0b';
const LW = 4.5;
const TAU = Math.PI * 2;
const S = Math.sin, C = Math.cos;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const pulse = (k, a, b) => (k < a || k > b ? 0 : S((k - a) / (b - a) * Math.PI));
const frac = v => v - Math.floor(v);
const hash = i => frac(S(i * 127.1 + 311.7) * 43758.5453);

// ---------- Paletten ----------
const BRASS = ['#a27a3a', '#6b4e22', '#e6c47a'];
const IRON = ['#4b4c50', '#2c2d31', '#8d9095'];
const DIRON = ['#38383c', '#1f1f23', '#6c6e74'];
const WAX = ['#dccfae', '#a89a7b', '#fff4d6'];
const WOOD = ['#5e4329', '#3b2918', '#8a6a46'];
const STONE = ['#6c6a64', '#45433f', '#9a978e'];
const BRONZE = ['#8a5a2a', '#5a3818', '#d39a5a'];
const FIRE = ['#ff8a2a', '#ffc860', '#fff3cf'];
const FROST = ['#5aa8e8', '#a8dcff', '#f2fbff'];
const BLOOD = ['#c8262e', '#ff6058', '#ffd6cf'];
const WISP = ['#3ac8a0', '#9cffd8', '#f0fff8'];
const STAR = ['#8a6ae8', '#d0c0ff', '#ffffff'];

// ---------- Formen ----------
export function smooth(pts, closed = true) {
  const p = new Path2D(), n = pts.length;
  const P = i => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) p.closePath();
  return p;
}
const poly = pts => { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; };
export function blob(cx, cy, rx, ry, k = [0], n = 12, a0 = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU, m = 1 + k[i % k.length]; pts.push([cx + C(a) * rx * m, cy + S(a) * ry * m]); }
  return smooth(pts);
}
const circ = (x, y, r) => { const p = new Path2D(); p.arc(x, y, r, 0, TAU); return p; };
const ell = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, TAU); return p; };
const rrect = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };

// Teil: Kontur, Grundfarbe, Schatten-Sichel unten rechts, Lichtkante oben links, Glanz, Innenleben
function part(c, path, pal, o = {}) {
  const [base, shade, hi] = pal;
  const lw = o.lw ?? LW;
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (lw) { c.strokeStyle = o.out || OUT; c.lineWidth = lw; c.stroke(path); }
  c.fillStyle = o.fill || base; c.fill(path);
  c.save(); c.clip(path);
  if (shade && ((o.dx ?? 7) !== 0 || (o.dy ?? 8) !== 0)) {
    c.fillStyle = shade; c.fill(path);
    c.save(); c.translate(-(o.dx ?? 7), -(o.dy ?? 8)); c.fillStyle = o.fill || base; c.fill(path); c.restore();
  }
  if (o.inner) o.inner(c);
  if (hi && o.rim !== false) { // Lichtkante
    c.strokeStyle = hi; c.globalAlpha = o.rimA ?? 0.55; c.lineWidth = o.rimW ?? 3;
    c.save(); c.translate(o.rx ?? 2.2, o.ry ?? 2.2); c.stroke(path); c.restore(); c.globalAlpha = 1;
  }
  if (o.hi) { const [x, y, rx, ry, r = -0.5] = o.hi; c.fillStyle = o.hiCol || 'rgba(255,250,230,.32)'; c.beginPath(); c.ellipse(x, y, rx, ry, r, 0, TAU); c.fill(); }
  c.restore();
  if (lw && o.reline) { c.strokeStyle = o.out || OUT; c.lineWidth = lw * 0.6; c.stroke(path); }
}
function stroke(c, path, col, w, outW = LW * 2 - 1) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (outW) { c.strokeStyle = OUT; c.lineWidth = w + outW; c.stroke(path); }
  c.strokeStyle = col; c.lineWidth = w; c.stroke(path);
}
const line = (pts) => { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); return p; };
function rivets(c, pts, r = 2.6) {
  for (const [x, y] of pts) { c.fillStyle = '#1a1714'; c.beginPath(); c.arc(x + 0.6, y + 0.8, r, 0, TAU); c.fill(); c.fillStyle = '#b9b2a2'; c.beginPath(); c.arc(x, y, r * 0.75, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x - r * 0.25, y - r * 0.3, r * 0.28, 0, TAU); c.fill(); }
}
function glow(c, x, y, r, col, a, add = true) {
  if (a <= 0.003) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col.replace('A', a)); g.addColorStop(0.4, col.replace('A', a * 0.45)); g.addColorStop(1, col.replace('A', 0));
  const op = c.globalCompositeOperation; if (add) c.globalCompositeOperation = 'lighter';
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.globalCompositeOperation = op;
}
const rgbaOf = hex => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},A)`; };
// Flamme: Basis bei (x,y), Höhe h, flackert mit t
function flame(c, x, y, w, h, t, pal = FIRE, seed = 0, glowR = 1) {
  const f1 = S(t * 9 + seed) * 0.12 + S(t * 15.3 + seed * 2) * 0.07, f2 = S(t * 7.1 + seed * 3) * 0.15;
  glow(c, x, y - h * 0.4, h * 1.6 * glowR, rgbaOf(pal[0]), 0.35 + f1 * 0.4);
  const layer = (k, col) => {
    const hh = h * k * (1 + f1), ww = w * k;
    const tip = [x + f2 * w * 0.9, y - hh];
    const p = smooth([[x - ww * 0.5, y - hh * 0.12], [x - ww * 0.42, y - hh * 0.45 + f1 * 6], [x - ww * 0.15 + f2 * 5, y - hh * 0.78], tip, [x + ww * 0.2 + f2 * 4, y - hh * 0.72], [x + ww * 0.48, y - hh * 0.42 - f1 * 5], [x + ww * 0.5, y - hh * 0.1], [x, y + ww * 0.08]]);
    c.fillStyle = col; c.fill(p);
  };
  c.save(); c.globalCompositeOperation = 'lighter';
  layer(1, pal[0]); layer(0.72, pal[1]); layer(0.42, pal[2]);
  c.restore();
}
function sparks(c, x, y, t, n, spread, height, col, size = 2.2) {
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const sp = 0.35 + hash(i) * 0.5, ph = frac(t * sp + hash(i + 9));
    const px = x + (hash(i + 3) - 0.5) * spread + S(t * 3 + i) * 4, py = y - ph * height;
    c.fillStyle = col.replace('A', (1 - ph) * 0.9); c.beginPath(); c.arc(px, py, size * (1 - ph * 0.6), 0, TAU); c.fill();
  }
  c.restore();
}
function smoke(c, x, y, t, n = 4, col = 'rgba(70,66,62,A)', big = 1) {
  for (let i = 0; i < n; i++) {
    const ph = frac(t * 0.35 + i / n);
    const px = x + S(t * 1.3 + i * 2) * 6 * ph - ph * 10, py = y - ph * 60 * big, r = (5 + ph * 14) * big;
    c.fillStyle = col.replace('A', (1 - ph) * 0.5); c.beginPath(); c.arc(px, py, r, 0, TAU); c.fill();
  }
}
function eye(c, x, y, r, o = {}) {
  const lx = (o.lx ?? 0) * r * 0.35, ly = (o.ly ?? 0) * r * 0.3;
  part(c, circ(x, y, r), [o.sclera || '#ece6cf', '#bdb79e', null], { lw: 3.2, dx: 2, dy: 3 });
  c.fillStyle = o.pupil || '#16110c';
  c.beginPath(); c.ellipse(x + lx, y + ly, r * (o.pr ?? 0.48), r * (o.pr ?? 0.48) * 1.08, 0, 0, TAU); c.fill();
  if (o.ring) { c.strokeStyle = o.ring; c.lineWidth = r * 0.16; c.beginPath(); c.arc(x + lx, y + ly, r * (o.pr ?? 0.48) * 0.8, 0, TAU); c.stroke(); }
  c.fillStyle = 'rgba(255,255,245,.92)'; c.beginPath(); c.arc(x + lx - r * 0.2, y + ly - r * 0.24, r * 0.17, 0, TAU); c.fill();
  const lid = clamp(o.lid ?? 0, 0, 1), heavy = o.heavy || 0;
  if (lid > 0.02 || heavy) {
    const h = Math.max(lid, heavy);
    c.save(); c.beginPath(); c.arc(x, y, r - 0.8, 0, TAU); c.clip();
    c.fillStyle = o.skin || '#555'; c.fillRect(x - r - 2, y - r - 2, r * 2 + 4, (r * 2 + 4) * h);
    c.strokeStyle = OUT; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x - r, y - r + r * 2 * h); c.lineTo(x + r, y - r + r * 2 * h); c.stroke();
    c.restore();
  }
  if (o.brow != null) { c.save(); c.translate(x, y - r - 2.5); c.rotate(o.brow); c.strokeStyle = OUT; c.lineWidth = 5.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-r, 0); c.lineTo(r, 0); c.stroke(); c.restore(); }
}
const blinkAt = (t, every = 3.4, off = 0) => { const k = (t + off) % every; return k < 0.13 ? S(k / 0.13 * Math.PI) : 0; };
// glühendes Schlitz-/Punktauge (Maschinen, Schatten)
function glowEye(c, x, y, rx, ry, col, a = 1, rot = 0) {
  glow(c, x, y, Math.max(rx, ry) * 3.2, rgbaOf(col), 0.55 * a);
  c.save(); c.globalCompositeOperation = 'lighter';
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fill();
  c.fillStyle = `rgba(255,255,240,${0.85 * a})`; c.beginPath(); c.ellipse(x, y, rx * 0.5, ry * 0.5, rot, 0, TAU); c.fill();
  c.restore();
}
function glass(c, path, tint, a, t) {
  c.save(); c.clip(path);
  const b = path; c.fillStyle = tint.replace('A', a); c.fill(b);
  c.restore();
}
// Bodenschatten-Blätter / Sockelplatte
function plate(c, w = 46) {
  part(c, ell(0, -4, w, 9), STONE, { lw: 4, dx: 0, dy: -3, rim: false });
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -5, w * 0.7, 5, 0, 0.2, Math.PI - 0.2); c.stroke();
}
function legs3(c, t, y0 = -40, spread = 30, col = DIRON) {
  for (const [dx, k] of [[-spread, -0.35], [spread, 0.35], [-spread * 0.2, 0.05]]) {
    const p = line([[k * 10, y0], [dx * 0.7, y0 * 0.45], [dx, -4]]);
    stroke(c, p, col[0], 6.5);
    c.fillStyle = col[1]; c.beginPath(); c.ellipse(dx, -4, 7, 3.5, 0, 0, TAU); c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  }
}

// =====================================================================
// WÄCHTER – Wesen aus reinem Licht (schweben, leuchten, dunkle Augen)
// =====================================================================
const LP = {
  GOLD:   { core: '#fffcee', mid: '#ffdc8c', edge: '#ee9c46', glow: 'rgba(255,192,104,A)', eye: '#5a2c0a', pool: 'rgba(255,196,110,A)' },
  EMBER:  { core: '#fff4d6', mid: '#ffb25c', edge: '#e2522a', glow: 'rgba(255,128,60,A)', eye: '#4a1206', pool: 'rgba(255,130,70,A)' },
  PALE:   { core: '#ffffff', mid: '#e6efff', edge: '#94a9de', glow: 'rgba(196,216,255,A)', eye: '#24305a', pool: 'rgba(196,214,255,A)' },
  PRISM:  { core: '#ffffff', mid: '#dafcff', edge: '#7fd2e2', glow: 'rgba(170,240,255,A)', eye: '#14404a', pool: 'rgba(170,236,255,A)' },
  AZURE:  { core: '#f6fcff', mid: '#bee6ff', edge: '#4f9fe6', glow: 'rgba(126,196,255,A)', eye: '#0e2c56', pool: 'rgba(130,196,255,A)' },
  JADE:   { core: '#f2fff9', mid: '#a6ffd8', edge: '#2fbf98', glow: 'rgba(110,255,200,A)', eye: '#063a2c', pool: 'rgba(110,255,196,A)' },
  CRIM:   { core: '#ffece8', mid: '#ff8c7c', edge: '#c41e2c', glow: 'rgba(255,64,58,A)', eye: '#3a0208', pool: 'rgba(255,70,60,A)' },
  VIOLET: { core: '#ffffff', mid: '#dccdff', edge: '#8466e6', glow: 'rgba(178,148,255,A)', eye: '#24124e', pool: 'rgba(170,140,255,A)' },
  WHITE:  { core: '#ffffff', mid: '#fff4d8', edge: '#e8c27a', glow: 'rgba(255,236,190,A)', eye: '#4a3010', pool: 'rgba(255,230,180,A)' },
};
const act = (st, d) => (st.mode === 'act' ? clamp(st.mt / d, 0, 1) : 0);
// Lichtkörper: weicher Schein entlang der Form, Verlauf von hellem Kern zu farbigem Rand, feine helle Kante
function lb(c, path, P, o = {}) {
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.globalCompositeOperation = 'lighter';
  for (const [w, a] of (o.halo || [[28, 0.045], [16, 0.09], [8, 0.2]])) { c.strokeStyle = P.glow.replace('A', a * (o.glowK ?? 1)); c.lineWidth = w; c.stroke(path); }
  c.restore();
  const g = c.createRadialGradient(o.cx ?? 0, o.cy ?? 0, 0, o.cx ?? 0, o.cy ?? 0, o.r ?? 50);
  g.addColorStop(0, P.core); g.addColorStop(o.mid ?? 0.5, P.mid); g.addColorStop(1, P.edge);
  c.globalAlpha = o.alpha ?? 1; c.fillStyle = g; c.fill(path); c.globalAlpha = 1;
  if (o.inner) { c.save(); c.clip(path); o.inner(c); c.restore(); }
  c.strokeStyle = o.rim || 'rgba(255,253,240,.95)'; c.lineWidth = o.rimW ?? 2.2; c.stroke(path);
}
// fließende Energie-Linien im Körper
function flow(c, t, x, y, w, h, n, col, sp = 0.45) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = col; c.lineWidth = 2.2;
  for (let i = 0; i < n; i++) {
    const ph = frac(t * sp + i / n), yy = y + h * (0.5 - ph);
    c.globalAlpha = S(ph * Math.PI) * 0.65;
    c.beginPath(); c.moveTo(x - w * 0.5, yy + 4); c.bezierCurveTo(x - w * 0.15, yy - 9, x + w * 0.15, yy + 9, x + w * 0.5, yy - 3); c.stroke();
  }
  c.restore();
}
function motes(c, x, y, t, n, r, P, sz = 2.4, sp = 1) {
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const an = t * sp * (0.6 + hash(i) * 0.6) + i * TAU / n, rr = r * (0.75 + hash(i + 5) * 0.4);
    const px = x + C(an) * rr, py = y + S(an) * rr * 0.45 + S(t * 2 + i) * 4;
    const a = 0.5 + 0.5 * S(t * 3 + i * 1.7);
    c.fillStyle = P.glow.replace('A', 0.35 * a); c.beginPath(); c.arc(px, py, sz * 2.6, 0, TAU); c.fill();
    c.fillStyle = `rgba(255,255,245,${0.85 * a})`; c.beginPath(); c.arc(px, py, sz * 0.8, 0, TAU); c.fill();
  }
  c.restore();
}
function rise(c, x, y, t, n, spread, h, P, sz = 2) {
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ph = frac(t * (0.3 + hash(i) * 0.35) + hash(i + 2)), px = x + (hash(i + 7) - 0.5) * spread + S(t * 2 + i) * 5, py = y - ph * h;
    c.fillStyle = P.glow.replace('A', (1 - ph) * 0.5); c.beginPath(); c.arc(px, py, sz * 2.2, 0, TAU); c.fill();
    c.fillStyle = `rgba(255,255,240,${(1 - ph) * 0.9})`; c.beginPath(); c.arc(px, py, sz * 0.7, 0, TAU); c.fill();
  }
  c.restore();
}
// dunkle, ausdrucksstarke Augen auf hellem Körper
function lEye(c, x, y, rx, ry, P, o = {}) {
  const h = Math.max(0.7, ry * (1 - (o.blink || 0) * 0.92));
  c.fillStyle = P.eye; c.beginPath(); c.ellipse(x, y, rx, h, o.rot || 0, 0, TAU); c.fill();
  if (o.brow != null) { c.save(); c.translate(x, y - ry - 2); c.rotate(o.brow); c.fillStyle = P.eye; c.fillRect(-rx * 1.1, -1.6, rx * 2.2, 3.2); c.restore(); }
  if (h > 1.6) { c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.arc(x - rx * 0.28 + (o.lx || 0) * rx * 0.35, y - h * 0.32, Math.min(rx, h) * 0.34, 0, TAU); c.fill(); }
}
const blinkL = (t, off = 0) => blinkAt(t, 3.8, off);
function pool(c, rx, P, a = 0.35, y = -3) {
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(0, y, 0, 0, y, rx); g.addColorStop(0, P.pool.replace('A', a)); g.addColorStop(1, P.pool.replace('A', 0));
  c.fillStyle = g; c.beginPath(); c.ellipse(0, y, rx, rx * 0.28, 0, 0, TAU); c.fill(); c.restore();
}
// leuchtende Schweif-Strähnen nach unten
function trail(c, x, y, t, P, n = 3, len = 40, w = 10) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * w * 0.9, wv = S(t * 3 + i * 1.9) * 7;
    const g = c.createLinearGradient(x, y, x, y + len); g.addColorStop(0, P.glow.replace('A', 0.75)); g.addColorStop(1, P.glow.replace('A', 0));
    c.strokeStyle = g; c.lineWidth = w * (1 - Math.abs(off) / (w * n)); c.beginPath(); c.moveTo(x + off, y); c.quadraticCurveTo(x + off + wv, y + len * 0.5, x + off * 0.4 - wv, y + len); c.stroke();
  }
  c.restore();
}
function ray(c, x, y, len, w, P, a = 1, ang = 0) {
  c.save(); c.translate(x, y); c.rotate(ang); c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(0, 0, len, 0); g.addColorStop(0, P.glow.replace('A', 0.9 * a)); g.addColorStop(1, P.glow.replace('A', 0));
  c.fillStyle = g; c.fillRect(0, -w * 1.8, len, w * 3.6);
  c.fillStyle = `rgba(255,255,248,${0.9 * a})`; c.fillRect(0, -w * 0.35, len * 0.9, w * 0.7);
  c.restore();
}

// Funkling – kleiner Lichtgeist, sammelt Licht
function funkling(c, t, st) {
  const P = LP.GOLD, a = act(st, 1.0), pop = pulse(a, 0, 1);
  const y0 = -66 + S(t * 2.1) * 5 - pop * 8;
  pool(c, 38, P, 0.32 + pop * 0.3);
  trail(c, 0, y0 + 18, t, P, 3, 38, 9);
  c.save(); c.translate(0, y0); c.rotate(S(t * 1.3) * 0.07);
  for (const s of [-1, 1]) {
    const fl = S(t * 7 + (s > 0 ? 0 : 1.4)) * 5;
    lb(c, smooth([[s * 16, -4], [s * 36, -26 - fl], [s * 50, -22 - fl], [s * 42, -6], [s * 26, 10]]), P, { r: 50, cx: s * 20, halo: [[16, 0.06], [8, 0.16]], alpha: 0.85 });
  }
  lb(c, blob(0, 0, 29, 27, [0.04, -0.03, 0.05, -0.02], 12), P, { r: 34, cy: -6, inner: q => flow(q, t, 0, 0, 50, 46, 3, 'rgba(255,255,255,.7)') });
  lb(c, smooth([[-12, -22], [-8, -42], [-2, -32], [4, -52], [9, -34], [14, -40], [14, -20]]), P, { r: 30, cy: -26, halo: [[14, 0.08], [7, 0.18]] });
  const bl = blinkL(t);
  lEye(c, -10, -1, 5, 7, P, { blink: bl, lx: 0.3 }); lEye(c, 10, -1, 5, 7, P, { blink: bl, lx: 0.3 });
  c.fillStyle = 'rgba(255,130,90,.45)'; c.beginPath(); c.ellipse(-17, 9, 5, 3, 0, 0, TAU); c.ellipse(17, 9, 5, 3, 0, 0, TAU); c.fill();
  c.strokeStyle = P.eye; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.arc(0, 8, 4 + pop * 3, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
  if (pop > 0.05) drawOrb(c, 0, -62 - pop * 18, 0.6 + pop * 0.5);
  c.restore();
  motes(c, 0, y0, t, 5, 46, P, 2.2);
}

// Lichtschütze – schwebender Lichtgeist mit Bogen aus Licht
function lichtschuetze(c, t, st) {
  const P = LP.GOLD, a = act(st, 0.45), pull = pulse(a, 0, 0.55), rel = a > 0.5 ? pulse(a, 0.5, 1) : 0;
  const y0 = -18 + S(t * 1.8) * 4;
  pool(c, 44, P, 0.32);
  c.save(); c.translate(-6, y0); c.scale(1.18, 1.18);
  trail(c, -4, -24, t, P, 3, 30, 12);
  // Umhang mit Kapuze (hinten)
  lb(c, smooth([[-2, -126], [-30, -108], [-40, -60], [-30, -22], [-12, -30], [-14, -80]]), P, { r: 46, cx: -18, cy: -70, alpha: 0.85, halo: [[18, 0.05], [9, 0.12]], inner: q => flow(q, t, -22, -70, 30, 90, 3, 'rgba(255,255,255,.45)') });
  // Körper
  lb(c, smooth([[-16, -26], [-20, -60], [-14, -86], [12, -86], [18, -58], [12, -28], [2, -12], [-8, -10]]), P, { r: 38, cy: -64, inner: q => {
    q.strokeStyle = 'rgba(200,110,30,.6)'; q.lineWidth = 2; q.beginPath(); q.moveTo(-14, -60); q.quadraticCurveTo(0, -52, 16, -62); q.stroke();
    flow(q, t, 0, -54, 34, 60, 3, 'rgba(255,255,255,.55)');
  } });
  // Kopf + spitze Kapuze
  lb(c, smooth([[-12, -88], [-18, -104], [-14, -122], [-2, -134], [8, -122], [16, -106], [12, -90], [0, -84]]), P, { r: 30, cx: 4, cy: -108 });
  c.fillStyle = 'rgba(120,50,10,.35)'; c.beginPath(); c.ellipse(5, -106, 10, 12, 0, 0, TAU); c.fill();
  const bl = blinkL(t, 1.1);
  lEye(c, 3, -107, 3.2, 4.6, P, { blink: bl, lx: 0.6, brow: 0.3 }); lEye(c, 12, -107, 2.8, 4.2, P, { blink: bl, lx: 0.6, brow: 0.35 });
  // Bogen
  const cx = 6, by = -66, R = 46, pl = pull * 16;
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = P.glow.replace('A', 0.4); c.lineWidth = 12; c.beginPath(); c.arc(cx, by, R, -1.0, 1.0); c.stroke(); c.restore();
  c.strokeStyle = '#ffe9a8'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(cx, by, R, -1.0, 1.0); c.stroke();
  c.strokeStyle = '#fffdf2'; c.lineWidth = 2; c.beginPath(); c.arc(cx, by, R, -1.0, 1.0); c.stroke();
  const top = [cx + C(-1.0) * R, by + S(-1.0) * R], bot = [cx + C(1.0) * R, by + S(1.0) * R];
  c.strokeStyle = 'rgba(255,250,220,.85)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(top[0], top[1]); c.lineTo(cx + 18 - pl, by); c.lineTo(bot[0], bot[1]); c.stroke();
  stroke(c, smooth([[10, -72], [30, -70], [cx + R + 2, by]], false), P.mid, 5, 0);
  stroke(c, smooth([[-6, -70], [cx + 16 - pl, by - 1]], false), P.mid, 5, 0);
  if (rel < 0.15) ray(c, cx + 16 - pl, by, 60, 2.4, P, 0.95);
  if (rel > 0) glow(c, cx + R + 10, by, 34 * rel + 10, rgbaOf('#ffe8a0'), rel);
  c.restore();
  motes(c, 0, y0 - 70, t, 4, 48, P, 2);
}

// Glutgeist – stämmiger Glutgeist, wirft eine Glutkugel im Bogen
function glutgeist(c, t, st) {
  const P = LP.EMBER, a = act(st, 0.7), wind = pulse(a, 0, 0.35), fl = a > 0.3 ? pulse(a, 0.3, 1) : 0, has = !(a > 0.45 && a < 0.97);
  const y0 = -20 + S(t * 1.9) * 3;
  pool(c, 44, P, 0.34);
  c.save(); c.translate(0, y0);
  trail(c, 0, -14, t, P, 4, 20, 12);
  // Arme hinter dem Kopf (Wurf)
  const lift = 18 - wind * 12 + fl * 6, sw = -wind * 0.4 + fl * 0.9;
  c.save(); c.translate(0, -70); c.rotate(sw);
  for (const s of [-1, 1]) stroke(c, smooth([[s * 26, 10], [s * 34, -18 - lift], [s * 14, -40 - lift]], false), P.mid, 9, 0);
  if (has) { lb(c, circ(0, -52 - lift, 16), P, { r: 18, cy: -56 - lift, halo: [[24, 0.08], [12, 0.2]], inner: q => flow(q, t * 2, 0, -52 - lift, 26, 30, 2, 'rgba(255,255,255,.8)') }); rise(c, 0, -60 - lift, t, 4, 20, 24, P, 1.6); }
  c.restore();
  // Körper
  lb(c, smooth([[-34, -6], [-40, -36], [-28, -70], [0, -82], [28, -70], [40, -36], [34, -6], [0, 4]]), P, { r: 58, cy: -44, inner: q => flow(q, t, 0, -40, 66, 70, 4, 'rgba(255,240,200,.6)') });
  // Flammenkrone
  flame(c, -12, -78, 16, 24, t, FIRE, 1, 0.5); flame(c, 2, -80, 18, 30, t, FIRE, 2.2, 0.5); flame(c, 15, -76, 14, 20, t, FIRE, 3.4, 0.4);
  const bl = blinkL(t, 0.6);
  lEye(c, -12, -48, 5.5, 6.5, P, { blink: bl, lx: 0.5, brow: 0.35 }); lEye(c, 12, -48, 5.5, 6.5, P, { blink: bl, lx: 0.5, brow: -0.35 });
  c.fillStyle = P.eye; c.beginPath(); c.moveTo(-12, -30); c.quadraticCurveTo(0, -20 - fl * 6, 12, -30); c.quadraticCurveTo(0, -26, -12, -30); c.fill();
  c.restore();
  rise(c, 0, y0 - 80, t, 6, 50, 60, P);
}

// Kristallwächter – großer Golem aus Lichtkristall (Wand)
function kristallwaechter(c, t, st) {
  const P = LP.PALE, ICE = { ...LP.PALE, core: '#eef4ff', mid: '#a9bdea', edge: '#5468a8' }, hit = st.flashT || 0, dmg = st.dmg || 0;
  const shake = hit > 0 ? S(hit * 90) * 3 : 0, br = S(t * 1.2) * 0.012;
  pool(c, 64, P, 0.32);
  c.save(); c.translate(shake, 0); c.scale(1 - br * 0.5, 1 + br);
  const facet = (pts, PP, k = 1) => { const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    lb(c, poly(pts), PP, { r: 34 * k, cx: cx - 6, cy: cy - 8, halo: [[12, 0.05], [6, 0.12]], rimW: 1.8, inner: q => { q.strokeStyle = 'rgba(255,255,255,.6)'; q.lineWidth = 1.4; q.beginPath(); q.moveTo(pts[0][0], pts[0][1]); q.lineTo(cx, cy); q.lineTo(pts[2 % pts.length][0], pts[2 % pts.length][1]); q.stroke(); } }); };
  facet([[-40, -2], [-18, -2], [-16, -40], [-38, -36]], ICE); facet([[18, -2], [40, -2], [38, -36], [16, -40]], ICE);
  // Rumpf aus sechs Facetten um das Herz
  const H = [0, -90], ring = [[-46, -34], [46, -34], [58, -96], [34, -144], [-34, -144], [-58, -96]];
  for (let i = 0; i < 6; i++) facet([ring[i], ring[(i + 1) % 6], H], i % 2 ? ICE : P, 1.6);
  if (dmg > 0.33) { c.strokeStyle = 'rgba(30,36,70,.85)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-40, -60); c.lineTo(-28, -66); c.lineTo(-30, -80); c.stroke(); }
  if (dmg > 0.66) { c.beginPath(); c.moveTo(30, -120); c.lineTo(20, -108); c.lineTo(28, -96); c.moveTo(-10, -40); c.lineTo(-4, -52); c.lineTo(-12, -60); c.stroke(); }
  const beat = 0.8 + S(t * 3) * 0.2;
  glow(c, 0, -90, 50 * beat, 'rgba(255,236,170,A)', 0.6 * (1 - dmg * 0.5));
  lb(c, poly([[0, -108], [13, -90], [0, -72], [-13, -90]]), LP.GOLD, { r: 16, cy: -94, halo: [[16, 0.18], [8, 0.35]] });
  facet([[-58, -96], [-34, -144], [-74, -130]], P); facet([[58, -96], [34, -144], [74, -130]], P);
  facet([[-22, -144], [22, -144], [28, -164], [0, -186], [-28, -164]], P, 1.3);
  const bl = blinkL(t, 2);
  lEye(c, -10, -160, 5, 4.5, P, { blink: bl, brow: -0.15 - dmg * 0.2 }); lEye(c, 10, -160, 5, 4.5, P, { blink: bl, brow: 0.15 + dmg * 0.2 });
  for (const s2 of [-1, 1]) facet([[s2 * 62, -114], [s2 * 72, -96], [s2 * 18, -54], [s2 * 6, -66]], ICE);
  c.restore();
  motes(c, 0, -110, t, 6, 74, P, 2);
}

// Prismling – schwebendes Prisma, schießt in drei Bahnen
function prismling(c, t, st) {
  const P = LP.PRISM, a = act(st, 0.45), fl = pulse(a, 0.15, 0.7);
  const y0 = -96 + S(t * 1.6) * 5;
  pool(c, 46, P, 0.34);
  // schwebende Splitter
  for (let i = 0; i < 4; i++) { const an = t * 1.1 + i * TAU / 4, x = C(an) * 58, y = y0 + S(an) * 18; c.save(); c.translate(x, y); c.rotate(an * 2); lb(c, poly([[0, -9], [6, 5], [-6, 5]]), P, { r: 10, halo: [[8, 0.15]], rimW: 1.2 }); c.restore(); }
  c.save(); c.translate(0, y0); c.rotate(S(t * 0.9) * 0.1); c.scale(1.25, 1.25);
  const sq = 0.82 + Math.abs(C(t * 0.8)) * 0.18; c.scale(sq, 1);
  const RB = ['rgba(255,110,120,.55)', 'rgba(255,210,110,.55)', 'rgba(130,255,150,.5)', 'rgba(110,190,255,.55)', 'rgba(200,130,255,.55)'];
  lb(c, poly([[0, -48], [42, 26], [-42, 26]]), { ...P, mid: '#bff4ff', edge: '#4ab4d0' }, { r: 40, cy: -4, inner: q => {
    q.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const k = (i + frac(t * 0.3)) / 5; q.fillStyle = RB[i]; q.beginPath(); q.moveTo(-42 + k * 30, 26); q.lineTo(-30 + k * 50, 26); q.lineTo(-4 + k * 10, -40); q.closePath(); q.fill(); }
    q.strokeStyle = 'rgba(255,255,255,.75)'; q.lineWidth = 1.6; q.beginPath(); q.moveTo(0, -48); q.lineTo(0, 26); q.moveTo(-42, 26); q.lineTo(0, -6); q.lineTo(42, 26); q.stroke();
  } });
  lb(c, poly([[0, -18], [14, 8], [-14, 8]]), LP.WHITE, { r: 14, cy: -2, halo: [[12, 0.2]] });
  const bl = blinkL(t, 0.3);
  lEye(c, -12, 12, 4, 5.2, P, { blink: bl, lx: 0.5 }); lEye(c, 12, 12, 4, 5.2, P, { blink: bl, lx: 0.5 });
  c.restore();
  if (fl > 0) for (const [ang, col] of [[-0.42, '#ff9a9a'], [0, '#fff6c0'], [0.42, '#9adfff']]) ray(c, 24, y0 + 6, 80, 2.8, { glow: rgbaOf(col) }, fl, ang);
  motes(c, 0, y0, t, 5, 52, P, 2);
}

// Frostschimmer – Geist aus kaltem Licht mit Schneeflocken-Krone
function frostschimmer(c, t, st) {
  const P = LP.AZURE, a = act(st, 0.45), fl = pulse(a, 0.1, 0.6);
  const y0 = -30 + S(t * 1.5) * 5;
  pool(c, 40, P, 0.32);
  c.save(); c.translate(0, y0);
  trail(c, 0, -20, t, P, 4, 32, 10);
  // Schleier
  lb(c, smooth([[-24, -24], [-30, -60], [-14, -88], [14, -88], [30, -60], [22, -24], [10, -6], [0, -16], [-10, -4]]), P, { r: 70, cy: -60, alpha: 0.9, inner: q => flow(q, t, 0, -50, 50, 70, 3, 'rgba(255,255,255,.6)') });
  // Kopf
  lb(c, circ(0, -100, 19), P, { r: 24, cy: -104 });
  const bl = blinkL(t, 2.4);
  lEye(c, 0, -100, 3.8, 5, P, { blink: bl, lx: 0.6 }); lEye(c, 10, -100, 3.4, 4.6, P, { blink: bl, lx: 0.6 });
  // Schneeflocke als Krone (dreht sich)
  c.save(); c.translate(0, -126); c.rotate(t * 0.4);
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = P.glow.replace('A', 0.4); c.lineWidth = 7;
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(C(i * TAU / 6) * 20, S(i * TAU / 6) * 20); c.stroke(); }
  c.restore();
  c.strokeStyle = '#ffffff'; c.lineWidth = 2.2; c.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const an = i * TAU / 6, x = C(an) * 20, y = S(an) * 20; c.beginPath(); c.moveTo(0, 0); c.lineTo(x, y); const mx = C(an) * 12, my = S(an) * 12; c.moveTo(mx, my); c.lineTo(mx + C(an + 0.8) * 6, my + S(an + 0.8) * 6); c.moveTo(mx, my); c.lineTo(mx + C(an - 0.8) * 6, my + S(an - 0.8) * 6); c.stroke(); }
  c.restore();
  // Eissplitter kreisen
  for (let i = 0; i < 3; i++) { const an = t * 1.4 + i * TAU / 3, x = C(an) * 36, y = -64 + S(an) * 12; c.save(); c.translate(x, y); c.rotate(an); lb(c, poly([[0, -8], [4, 0], [0, 8], [-4, 0]]), P, { r: 10, halo: [[8, 0.15]] }); c.restore(); }
  if (fl > 0) glow(c, 30, -70, 30, P.glow, fl);
  c.restore();
}

// Flammengeist – Salamander aus Feuerlicht, speit einen Feuerkegel
function flammengeist(c, t, st) {
  const P = LP.EMBER, a = act(st, 0.6), br = pulse(a, 0, 1);
  pool(c, 50, P, 0.38);
  // Wirbelsäule: vom eingerollten Schwanz unten bis zum Kopf oben rechts
  const N = 14, sp = [];
  for (let i = 0; i < N; i++) { const k = i / (N - 1); sp.push([-44 + k * 64 + S(k * 5 + t * 1.8) * 10 * (1 - k), -12 - k * 100 - S(k * 3.2) * 10, 4 + S(Math.min(1, k * 1.25) * Math.PI) * 18 + k * 4]); }
  const L = [], R = [];
  for (let i = 0; i < N; i++) {
    const p0 = sp[Math.max(0, i - 1)], p1 = sp[Math.min(N - 1, i + 1)], dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w = sp[i][2];
    L.push([sp[i][0] + nx * w, sp[i][1] + ny * w]); R.push([sp[i][0] - nx * w, sp[i][1] - ny * w]);
  }
  const body = smooth([...L, ...R.reverse()]);
  // Rückenflammen-Mähne
  for (let i = 3; i < N - 1; i += 2) flame(c, R[N - 1 - i][0], R[N - 1 - i][1], 12, 20 + i, t, FIRE, i, 0.25);
  lb(c, body, P, { r: 50, cx: 0, cy: -70, inner: q => { flow(q, t, -10, -60, 70, 110, 4, 'rgba(255,240,200,.55)'); q.fillStyle = 'rgba(255,250,220,.35)'; for (let i = 2; i < N; i += 2) { q.beginPath(); q.ellipse(sp[i][0], sp[i][1], sp[i][2] * 0.4, sp[i][2] * 0.25, 0, 0, TAU); q.fill(); } } });
  // Arme
  for (const [x, y, k] of [[sp[8][0], sp[8][1], 1], [sp[10][0], sp[10][1], -1]]) stroke(c, smooth([[x + 4, y], [x + 22, y + 10 * k], [x + 30, y + 4 * k]], false), P.mid, 6, 0);
  // Kopf
  const [hx, hy] = sp[N - 1];
  c.save(); c.translate(hx + 8, hy - 6);
  lb(c, smooth([[-22, -8], [-6, -24], [18, -22], [36, -10], [38, 2], [20, 10], [-14, 12]]), P, { r: 30, cx: 4, cy: -10 });
  flame(c, -12, -18, 16, 30, t, FIRE, 5, 0.4); flame(c, 0, -22, 14, 24, t, FIRE, 6.5, 0.3);
  lEye(c, 10, -10, 4.4, 5.4, P, { lx: 0.7, brow: 0.4, blink: blinkL(t, 1.5) });
  c.fillStyle = P.eye; c.beginPath(); c.moveTo(20, 4); c.lineTo(38, 1 + br * 7); c.lineTo(22, 9); c.fill();
  if (br > 0.05) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const k = i / 7, x = 36 + k * 150 * br, y = 4 + S(t * 20 + i) * 6; c.fillStyle = `rgba(255,${150 + k * 70},80,${(1 - k * 0.8) * br * 0.85})`; c.beginPath(); c.ellipse(x, y, 12 + k * 18, 8 + k * 9, 0, 0, TAU); c.fill(); } c.restore(); }
  c.restore();
  rise(c, -10, -60, t, 7, 70, 80, P);
}

// Lichtfalke – Falke aus goldenem Licht, jagt Flieger
function lichtfalke(c, t, st) {
  const P = { ...LP.WHITE, edge: '#e2a85a', mid: '#ffe6b0' }, a = act(st, 0.5), dive = pulse(a, 0.2, 0.8);
  const y0 = -96 + S(t * 2.2) * 6 + dive * 10;
  pool(c, 40, P, 0.3);
  c.save(); c.translate(0, y0); c.rotate(dive * 0.3);
  const flap = S(t * 5.5) * 0.4 - dive * 0.5;
  for (const s of [-1, 1]) {
    c.save(); c.translate(-4, -6); c.rotate(s > 0 ? -0.3 - flap : 0.25 + flap); c.scale(1, s > 0 ? 1 : 0.85);
    lb(c, smooth([[0, 0], [-16, -30], [-46, -56], [-64, -50], [-56, -36], [-62, -26], [-46, -18], [-50, -8], [-24, 2]]), P, { r: 70, cx: -20, cy: -20, alpha: s > 0 ? 1 : 0.75, inner: q => { q.strokeStyle = 'rgba(232,194,122,.7)'; q.lineWidth = 1.6; for (let i = 0; i < 4; i++) { q.beginPath(); q.moveTo(-12 - i * 10, -4 - i * 4); q.lineTo(-30 - i * 8, -30 - i * 6); q.stroke(); } } });
    c.restore();
  }
  // Schwanz
  lb(c, smooth([[-14, 4], [-40, 18], [-46, 30], [-30, 26], [-18, 14]]), P, { r: 40, cx: -24, cy: 14 });
  // Körper
  lb(c, smooth([[-22, 2], [-10, -14], [14, -18], [30, -10], [26, 6], [6, 14]]), LP.GOLD, { r: 26, cy: -6 });
  // Kopf + Schnabel
  lb(c, smooth([[14, -18], [26, -32], [38, -30], [44, -22], [36, -14], [26, -10]]), P, { r: 26, cx: 30, cy: -24 });
  c.fillStyle = '#e8b25a'; c.beginPath(); c.moveTo(42, -26); c.lineTo(54, -22); c.lineTo(42, -18); c.fill();
  lEye(c, 34, -25, 3.2, 3.6, P, { lx: 0.7, brow: 0.4, blink: blinkL(t, 2.7) });
  c.restore();
  motes(c, 0, y0, t, 4, 50, P, 2);
}

// Nova – pulsierender Stern-Geist, explodiert
function nova(c, t, st) {
  const P = LP.VIOLET, a = act(st, 0.9);
  if (st.mode === 'act' && st.mt > 0.9) { boom(c, st.mt - 0.9, '220,200,255'); return; }
  const y0 = -66 + S(t * 2.5) * 4, sw = 1 + ease(a) * 0.35 + S(t * 6) * 0.03, jx = a > 0 ? S(t * 47) * a * 4 : 0;
  pool(c, 40, P, 0.3 + a * 0.4);
  c.save(); c.translate(jx, y0); c.scale(sw, sw);
  const hot = a > 0 && Math.floor(st.mt * 14) % 2 === 0;
  const PP = hot ? LP.WHITE : P;
  const pts = []; for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8 + t * 0.6, r = i % 2 ? 22 : 36 + S(t * 5 + i) * 4; pts.push([C(an) * r, S(an) * r]); }
  lb(c, poly(pts), PP, { r: 40, halo: [[30, 0.06], [16, 0.14], [8, 0.3]] });
  lb(c, circ(0, 0, 20), PP, { r: 22, halo: [[10, 0.2]] });
  lEye(c, -7, -2, 4, 5, PP, { brow: 0.5, lx: 0.3 }); lEye(c, 7, -2, 4, 5, PP, { brow: -0.5, lx: 0.3 });
  c.fillStyle = PP.eye; c.beginPath(); c.moveTo(-6, 8); c.lineTo(6, 8); c.lineTo(3, 11); c.lineTo(-3, 11); c.fill();
  c.restore();
  motes(c, 0, y0, t * (1 + a * 3), 6, 50, P, 2.2);
}

// Strahlenritter – Ritter aus Licht mit Lichtlanze (durchschlägt die ganze Bahn)
function strahlenritter(c, t, st) {
  const P = LP.GOLD, a = act(st, 0.6), thr = pulse(a, 0.25, 0.75), ch = pulse(a, 0, 0.35);
  const y0 = -20 + S(t * 1.6) * 4;
  pool(c, 46, P, 0.32);
  c.save(); c.translate(-thr * 4, y0);
  // Umhang
  const wv = S(t * 2.2) * 6;
  lb(c, smooth([[-6, -112], [-30, -100], [-44 - wv, -50], [-40 - wv, -10], [-16, -24], [-8, -70]]), P, { r: 90, cx: -20, cy: -60, alpha: 0.6, halo: [[16, 0.05], [8, 0.12]] });
  trail(c, 0, -26, t, P, 3, 26, 12);
  // Rüstung
  lb(c, smooth([[-22, -28], [-26, -70], [-18, -100], [18, -100], [26, -70], [20, -28], [0, -16]]), P, { r: 44, cy: -76, inner: q => {
    q.strokeStyle = 'rgba(214,150,70,.85)'; q.lineWidth = 2.2;
    q.beginPath(); q.moveTo(-20, -60); q.quadraticCurveTo(0, -52, 20, -60); q.moveTo(-18, -82); q.quadraticCurveTo(0, -74, 18, -82); q.moveTo(0, -100); q.lineTo(0, -20); q.stroke();
    flow(q, t, 0, -60, 40, 70, 3, 'rgba(255,255,255,.5)');
  } });
  for (const s of [-1, 1]) lb(c, smooth([[s * 14, -100], [s * 34, -104], [s * 36, -88], [s * 22, -84]]), P, { r: 26, cx: s * 24, cy: -96 });
  // Helm
  lb(c, smooth([[-16, -102], [-18, -126], [-8, -142], [10, -140], [18, -124], [16, -102]]), P, { r: 36, cy: -122, inner: q => { q.fillStyle = P.eye; q.fillRect(-2, -126, 22, 5); q.fillRect(6, -126, 4, 14); } });
  glowEye(c, 12, -123, 6, 2, '#fff6c8', 0.9);
  lb(c, smooth([[-6, -140], [-2, -160], [10, -170], [4, -150], [6, -140]]), P, { r: 20, cy: -150, halo: [[10, 0.12]] });
  // Lanze
  c.save(); c.translate(10 + thr * 18, -66);
  stroke(c, line([[-30, 6], [70, -4]]), '#fffbe8', 5, 0);
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = P.glow.replace('A', 0.5); c.lineWidth = 12; c.beginPath(); c.moveTo(-30, 6); c.lineTo(70, -4); c.stroke(); c.restore();
  lb(c, poly([[66, -12], [96, -4], [66, 4]]), LP.WHITE, { r: 20, cx: 70, cy: -4, halo: [[12, 0.2]] });
  glow(c, 90, -4, 20 + ch * 30, 'rgba(255,246,210,A)', 0.4 + ch * 0.6);
  c.restore();
  stroke(c, smooth([[14, -86], [26, -74], [16, -64]], false), P.mid, 7, 0);
  if (thr > 0) ray(c, 100, -70, 240 * thr, 4, P, thr);
  c.restore();
}

// Irrlichtmutter – Geist mit fließendem Haar, schickt suchende Irrlichter los
function irrlichtmutter(c, t, st) {
  const P = LP.JADE, a = act(st, 0.5);
  const y0 = -40 + S(t * 1.5) * 5;
  pool(c, 42, P, 0.32);
  c.save(); c.translate(0, y0);
  // Haar-Strähnen nach hinten
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const y = -110 + i * 6, wv = S(t * 2 + i * 0.8) * 10, len = 50 + i * 8;
    const g = c.createLinearGradient(-6, y, -6 - len, y + 30); g.addColorStop(0, P.glow.replace('A', 0.8)); g.addColorStop(1, P.glow.replace('A', 0));
    c.strokeStyle = g; c.lineWidth = 7 - i * 0.6; c.beginPath(); c.moveTo(-6, y); c.bezierCurveTo(-30, y - 6 + wv, -40 - len * 0.4, y + 20 - wv, -6 - len, y + 30 + wv); c.stroke();
  }
  c.restore();
  trail(c, 0, -14, t, P, 3, 30, 11);
  lb(c, smooth([[-18, -16], [-22, -56], [-12, -84], [12, -84], [22, -56], [16, -16], [0, -4]]), P, { r: 60, cy: -56, inner: q => flow(q, t, 0, -48, 40, 70, 3, 'rgba(255,255,255,.55)') });
  lb(c, smooth([[-14, -88], [-16, -106], [-4, -120], [12, -116], [18, -100], [12, -86]]), P, { r: 30, cy: -104 });
  const bl = blinkL(t, 0.9);
  lEye(c, 2, -102, 3.2, 4.8, P, { blink: bl, lx: 0.5 }); lEye(c, 11, -102, 3, 4.4, P, { blink: bl, lx: 0.5 });
  // Hände formen ein Irrlicht
  stroke(c, smooth([[10, -70], [26, -62], [34, -54]], false), P.mid, 6, 0);
  stroke(c, smooth([[-6, -66], [16, -52], [30, -48]], false), P.mid, 6, 0);
  if (a < 0.3) wisp(c, 38, -60, 6 + a * 8, t);
  // kreisende Irrlichter
  for (let i = 0; i < 3; i++) {
    const an = t * 1.5 + i * TAU / 3, out = i === 0 ? a * 70 : 0;
    wisp(c, C(an) * 44 + out, -64 + S(an) * 16 - out * 0.3, 6, t + i);
  }
  c.restore();
}

// Sonnenhüter – großes Wesen mit Sonnen-Heiligenschein, macht alles hell und stärkt Nachbarn
function sonnenhueter(c, t, st) {
  const P = LP.GOLD;
  const y0 = -10 + S(t * 1.2) * 4;
  pool(c, 70, P, 0.45);
  c.save(); c.translate(0, y0);
  // Sonnenscheibe hinter dem Kopf
  c.save(); c.translate(0, -150);
  c.save(); c.rotate(t * 0.25); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 16; i++) { const an = i * TAU / 16, l = i % 2 ? 50 : 70; c.fillStyle = P.glow.replace('A', 0.35); c.beginPath(); c.moveTo(C(an - 0.08) * 28, S(an - 0.08) * 28); c.lineTo(C(an) * l, S(an) * l); c.lineTo(C(an + 0.08) * 28, S(an + 0.08) * 28); c.fill(); }
  c.restore();
  lb(c, circ(0, 0, 38), P, { r: 40, halo: [[30, 0.08], [14, 0.18]], alpha: 0.85 });
  c.restore();
  // Gewand
  lb(c, smooth([[-30, -8], [-26, -60], [-16, -110], [16, -110], [26, -60], [30, -8], [10, 2], [-10, 2]]), P, { r: 90, cy: -80, inner: q => flow(q, t, 0, -56, 56, 100, 4, 'rgba(255,255,255,.55)') });
  // ausgebreitete Arme
  for (const s of [-1, 1]) stroke(c, smooth([[s * 16, -100], [s * 40, -96], [s * 56, -110 + S(t * 1.5) * 4]], false), P.mid, 9, 0);
  for (const s of [-1, 1]) lb(c, circ(s * 58, -112 + S(t * 1.5) * 4, 7), P, { r: 8, halo: [[12, 0.2]] });
  // Kopf
  lb(c, smooth([[-14, -110], [-16, -134], [0, -146], [16, -134], [14, -110], [0, -104]]), LP.WHITE, { r: 26, cy: -128 });
  c.strokeStyle = P.eye; c.lineWidth = 2.6; c.lineCap = 'round';
  for (const x of [-6, 7]) { c.beginPath(); c.arc(x, -128, 4, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
  c.restore();
  rise(c, 0, -60, t, 10, 120, 140, P);
}

// Sonnenauge – schwebende Lichtsonne mit einem großen Auge, Dauerstrahl
function sonnenauge(c, t, st) {
  const P = LP.GOLD, on = st.mode === 'act', heat = clamp(st.heat || 0, 0, 1);
  const y0 = -100 + S(t * 1.4) * 5;
  pool(c, 48, P, 0.35);
  c.save(); c.translate(0, y0);
  c.save(); c.rotate(t * 0.35); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 12; i++) { const an = i * TAU / 12, l = 60 + (i % 3) * 8 + S(t * 3 + i) * 4; c.fillStyle = P.glow.replace('A', 0.45); c.beginPath(); c.moveTo(C(an - 0.12) * 36, S(an - 0.12) * 36); c.lineTo(C(an) * l, S(an) * l); c.lineTo(C(an + 0.12) * 36, S(an + 0.12) * 36); c.fill(); }
  c.restore();
  lb(c, circ(0, 0, 40), P, { r: 44, halo: [[30, 0.07], [16, 0.16], [8, 0.3]] });
  // Auge
  const open = on ? 1 : 0.75 + S(t * 0.9) * 0.08, bl = on ? 0 : blinkAt(t, 5, 1);
  c.save(); c.beginPath(); c.ellipse(4, 0, 26, 17 * open * (1 - bl * 0.95), 0, 0, TAU); c.clip();
  c.fillStyle = '#fffaf0'; c.fillRect(-30, -24, 60, 48);
  const g = c.createRadialGradient(10, 0, 1, 10, 0, 13); g.addColorStop(0, '#2a1004'); g.addColorStop(0.35, '#8a3a08'); g.addColorStop(1, '#e8902a');
  c.fillStyle = g; c.beginPath(); c.arc(10, 0, 13, 0, TAU); c.fill();
  c.fillStyle = '#140600'; c.beginPath(); c.arc(11, 0, 5 + heat * 1.5, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.arc(6, -4, 3, 0, TAU); c.fill();
  c.restore();
  c.strokeStyle = P.eye; c.lineWidth = 2.6; c.beginPath(); c.ellipse(4, 0, 26, 17 * open * (1 - bl * 0.95), 0, 0, TAU); c.stroke();
  c.restore();
  if (on) { ray(c, 30, y0, 230, 4 + heat * 4, P, 0.7 + heat * 0.3); glow(c, 30, y0, 30 + heat * 30, P.glow, 0.6 + heat * 0.4); }
  motes(c, 0, y0, t, 5, 60, P, 2);
}

// Pulsar – Kern mit kreisenden Ringen, sendet betäubende Lichtwellen
function pulsar(c, t, st) {
  const P = LP.AZURE, a = act(st, 0.8), fl = pulse(a, 0, 0.4);
  const y0 = -98 + S(t * 1.7) * 5;
  pool(c, 46, P, 0.34);
  c.save(); c.translate(0, y0); c.scale(1.2, 1.2);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const s of [-1, 1]) { const g = c.createLinearGradient(0, 0, 0, s * 70); g.addColorStop(0, P.glow.replace('A', 0.8)); g.addColorStop(1, P.glow.replace('A', 0)); c.fillStyle = g; c.beginPath(); c.moveTo(-8, 0); c.lineTo(0, s * (70 + fl * 30)); c.lineTo(8, 0); c.fill(); }
  c.restore();
  const ring = (rx, ry, rot, back) => { c.save(); c.rotate(rot); c.globalCompositeOperation = 'lighter'; c.strokeStyle = P.glow.replace('A', back ? 0.25 : 0.55); c.lineWidth = 9; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, back ? Math.PI : 0, back ? TAU : Math.PI); c.stroke(); c.restore();
    c.save(); c.rotate(rot); c.strokeStyle = back ? 'rgba(220,240,255,.5)' : '#f4fbff'; c.lineWidth = 2.6; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, back ? Math.PI : 0, back ? TAU : Math.PI); c.stroke(); c.restore(); };
  const r1 = t * 1.1, r2 = -t * 0.8 + 1;
  ring(50, 14, r1, true); ring(46, 12, r2, true);
  lb(c, circ(0, 0, 24 + fl * 4), LP.WHITE, { r: 28, halo: [[30, 0.1], [16, 0.22], [8, 0.4]] });
  lEye(c, -7, -1, 3.6, 4.8, P, { blink: blinkL(t, 0.2) }); lEye(c, 7, -1, 3.6, 4.8, P, { blink: blinkL(t, 0.2) });
  ring(50, 14, r1, false); ring(46, 12, r2, false);
  c.restore();
  if (a > 0) for (let i = 0; i < 3; i++) { const k = clamp(a * 1.6 - i * 0.25, 0, 1); if (k <= 0 || k >= 1) continue; c.strokeStyle = `rgba(190,226,255,${(1 - k) * 0.85})`; c.lineWidth = 6 * (1 - k); c.beginPath(); c.ellipse(0, y0 + 40, 40 + k * 150, 14 + k * 50, 0, 0, TAU); c.stroke(); }
}

// Blutmond – roter Sichelmond-Geist
function blutmond(c, t, st) {
  const P = LP.CRIM, a = act(st, 0.6), fl = pulse(a, 0.1, 0.7);
  const y0 = -104 + S(t * 1.3) * 5;
  pool(c, 52, P, 0.36);
  glow(c, 0, y0, 110, 'rgba(255,40,40,A)', 0.2 + fl * 0.3);
  c.save(); c.translate(0, y0); c.rotate(-0.2 + S(t * 0.8) * 0.06);
  const R = 52, r = 44, d = 26, ix = (d * d + R * R - r * r) / (2 * d), iy = Math.sqrt(Math.max(0, R * R - ix * ix));
  const a1 = Math.atan2(iy, ix), a2 = Math.atan2(iy, ix - d);
  const cres = new Path2D(); cres.arc(0, 0, R, a1, TAU - a1, false); cres.arc(d, 0, r, -a2, a2, true); cres.closePath();
  lb(c, cres, P, { r: 56, cx: -34, cy: -10, halo: [[30, 0.07], [16, 0.16], [8, 0.3]], inner: q => {
    q.fillStyle = 'rgba(120,0,20,.4)'; for (const [x, y, rr] of [[-38, -18, 6], [-42, 12, 4.5], [-28, 32, 4], [-26, -36, 3.5]]) { q.beginPath(); q.arc(x, y, rr, 0, TAU); q.fill(); }
    flow(q, t, -32, 0, 34, 100, 3, 'rgba(255,220,220,.5)');
  } });
  lEye(c, -26, -10, 3.8, 5.4, P, { lx: 0.8, brow: 0.3, blink: blinkL(t, 1.3) });
  lEye(c, -24, 10, 3.4, 4.8, P, { lx: 0.8, brow: 0.2, blink: blinkL(t, 1.3) });
  c.strokeStyle = P.eye; c.lineWidth = 2.4; c.beginPath(); c.arc(-14, 0, 9, -0.6, 0.6); c.stroke();
  if (fl > 0) lb(c, circ(14, 0, 6 + fl * 10), LP.CRIM, { r: 16, cx: 14, halo: [[18, 0.2]] });
  c.restore();
  motes(c, 0, y0, t, 7, 70, P, 2.2, 0.8);
}

// Sternenweber – kosmisches Wesen, webt Sternfäden und ruft Sterne herab
function sternenweber(c, t, st) {
  const P = LP.VIOLET, a = act(st, 0.8), fl = pulse(a, 0, 1);
  const y0 = -14 + S(t * 1.2) * 4;
  pool(c, 56, P, 0.36);
  c.save(); c.translate(0, y0);
  trail(c, 0, -18, t, P, 3, 30, 14);
  const body = smooth([[-24, -16], [-30, -70], [-20, -112], [20, -112], [30, -70], [24, -16], [0, -2]]);
  lb(c, body, { ...P, core: '#4a3a8a', mid: '#2e2260', edge: '#8466e6' }, { r: 90, cy: -60, inner: q => {
    for (let i = 0; i < 26; i++) { const x = (hash(i) - 0.5) * 56, y = -10 - hash(i + 3) * 100, tw = 0.5 + 0.5 * S(t * 3 + i); q.fillStyle = `rgba(255,255,255,${0.4 + tw * 0.6})`; q.beginPath(); q.arc(x, y, 0.8 + hash(i + 8) * 1.6, 0, TAU); q.fill(); }
    q.strokeStyle = 'rgba(210,200,255,.55)'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(-14, -90); q.lineTo(-4, -70); q.lineTo(10, -76); q.lineTo(14, -50); q.lineTo(-6, -36); q.stroke();
  } });
  // Kopf
  lb(c, circ(0, -126, 18), { ...P, core: '#4a3a8a', mid: '#2e2260', edge: '#8466e6' }, { r: 20, cy: -128 });
  lEye(c, -6, -126, 3.6, 4.6, { eye: '#ffffff' }, {}); lEye(c, 7, -126, 3.6, 4.6, { eye: '#ffffff' }, {});
  // Sternenkrone (achtzackige Sterne)
  for (const [x, y, r] of [[-16, -148, 5], [0, -156, 7], [16, -148, 5]]) { const pts = []; for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8, rr = i % 2 ? r * 0.35 : (i % 4 ? r * 0.7 : r); pts.push([x + C(an) * rr, y + S(an) * rr]); } lb(c, poly(pts), LP.WHITE, { r: r, cx: x, cy: y, halo: [[10, 0.2]], rimW: 1 }); }
  // Hände mit Sternfäden
  const hy = -80 - fl * 30;
  for (const s of [-1, 1]) { stroke(c, smooth([[s * 18, -100], [s * 34, -90], [s * 40, hy]], false), '#8466e6', 6, 0); lb(c, circ(s * 40, hy, 6), LP.WHITE, { r: 6, halo: [[12, 0.25]] }); }
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(220,210,255,${0.6 + fl * 0.4})`; c.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-40, hy); c.quadraticCurveTo(0, hy + 18 + S(t * 3 + i) * 10 - i * 8, 40, hy); c.stroke(); }
  c.restore();
  if (fl > 0) { const pts = []; for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8 + t, rr = i % 2 ? 6 : (i % 4 ? 12 : 20); pts.push([C(an) * rr * (0.5 + fl), -190 + S(an) * rr * (0.5 + fl)]); } lb(c, poly(pts), LP.WHITE, { r: 20, cy: -190, halo: [[24, 0.2]] }); }
  c.restore();
  motes(c, 0, y0 - 80, t, 8, 70, P, 1.8, 0.7);
}

function boom(c, k, rgb) {
  const r = 30 + k * 280, a = clamp(1 - k / 0.6, 0, 1);
  if (a <= 0) return;
  glow(c, 0, -60, r, `rgba(${rgb},A)`, a);
  c.strokeStyle = `rgba(255,250,230,${a})`; c.lineWidth = 9 * a; c.beginPath(); c.arc(0, -60, r * 0.7, 0, TAU); c.stroke();
  for (let i = 0; i < 14; i++) { const an = i / 14 * TAU, d = r * 0.85; c.fillStyle = `rgba(${i % 2 ? '255,220,140' : '200,140,255'},${a})`; c.beginPath(); c.arc(C(an) * d, -60 + S(an) * d * 0.7, 6 * a + 2, 0, TAU); c.fill(); }
}

export function wisp(c, x, y, r, t) {
  glow(c, x, y, r * 4, 'rgba(120,255,200,A)', 0.6);
  c.save(); c.globalCompositeOperation = 'lighter';
  c.fillStyle = 'rgba(160,255,220,.9)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.fillStyle = 'rgba(160,255,220,.4)'; for (let k = 1; k < 4; k++) { c.beginPath(); c.arc(x - k * r * 0.9, y + S(t * 6 + k) * 2, r * (1 - k * 0.22), 0, TAU); c.fill(); }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r * 0.45, 0, TAU); c.fill();
  c.restore();
}

// =====================================================================
// SCHATTEN (schauen nach links)
// =====================================================================
const SH = ['#221c2c', '#0f0b16', '#4a3d62'];
const EYE = '#ff6a3a';
function shadowFill(c, path, o = {}) {
  part(c, path, SH, { out: '#07050a', dx: o.dx ?? -6, dy: o.dy ?? 6, rimA: 0.5, rim: true, inner: q => {
    const g = q.createLinearGradient(0, -200, 0, 0); g.addColorStop(0, 'rgba(110,80,150,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = g; q.fillRect(-200, -260, 400, 280);
    if (o.inner) o.inner(q);
  } });
}
// rauchige Fransen an einer Kante
function tendrils(c, pts, t, len = 18, w = 7) {
  c.lineCap = 'round';
  for (let i = 0; i < pts.length; i++) {
    const [x, y, an] = pts[i], wv = S(t * 3 + i * 1.7) * 0.5;
    const ex = x + C(an + wv) * len, ey = y + S(an + wv) * len;
    const g = c.createLinearGradient(x, y, ex, ey); g.addColorStop(0, 'rgba(26,20,36,.95)'); g.addColorStop(1, 'rgba(26,20,36,0)');
    c.strokeStyle = g; c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + ex) / 2 + S(t * 2 + i) * 5, (y + ey) / 2, ex, ey); c.stroke();
  }
}
function sLimb(c, x, y, a1, l1, a2, l2, w1, w2, foot) {
  c.save(); c.translate(x, y); c.rotate(a1);
  shadowFill(c, smooth([[-w1 / 2, -3], [w1 / 2, -3], [w1 * 0.4, l1 * 0.6], [w2 / 2, l1 + 2], [-w2 / 2, l1 + 2], [-w1 * 0.45, l1 * 0.55]]), { dx: -3, dy: 0 });
  c.translate(0, l1); c.rotate(a2);
  shadowFill(c, smooth([[-w2 / 2, -2], [w2 / 2, -2], [w2 * 0.45, l2], [-w2 * 0.45, l2]]), { dx: -3, dy: 0 });
  c.translate(0, l2);
  if (foot) foot(c);
  c.restore();
}
function claw(c) {
  shadowFill(c, blob(0, 4, 8, 7, [0.05], 8), { dx: -2, dy: 2 });
  c.strokeStyle = '#07050a'; c.lineWidth = 4; c.lineCap = 'round';
  for (const [dx, l] of [[-5, 13], [0, 16], [5, 12]]) { c.beginPath(); c.moveTo(dx, 8); c.quadraticCurveTo(dx - 2, 8 + l * 0.6, dx - 6, 8 + l); c.stroke(); }
}
function sFoot(c) { shadowFill(c, smooth([[8, -5], [6, 5], [-18, 7], [-24, 1], [-12, -5]]), { dx: 0, dy: -3 }); }

// gemeinsames Skelett für Schatten-Läufer
function walker(c, t, st, o = {}) {
  const per = o.period || 1.6;
  const walking = st.mode === 'walk', eating = st.mode === 'eat', dying = st.mode === 'die';
  const ph = (walking ? t * TAU / per : 0) + (st.seed || 0);
  const sw = walking ? S(ph) : 0;
  const bob = walking ? Math.abs(C(ph)) * 5 : eating ? Math.abs(S(st.mt * 9)) * 2 : 0;
  const lean = (o.lean ?? 0.25) + (eating ? 0.16 : 0);
  c.save();
  if (dying) { const k = clamp(st.mt / 0.6, 0, 1); c.globalAlpha *= clamp(1 - st.mt / 1.1, 0, 1); c.translate(0, k * 10); c.scale(1 + k * 0.2, 1 - k * 0.6); }
  const sc = o.scale || 1; c.scale(sc, sc);
  const hip = [6, -(o.legH || 76) - bob];
  const sh = [hip[0] - 22 - lean * 20, hip[1] - (o.torsoH || 58)];
  const legA = o.legAmp ?? 0.45, armB = o.armBase ?? 1.2, armSw = walking ? S(ph + 0.6) * 0.12 : eating ? S(st.mt * 12) * 0.25 : 0;
  // Rauchschleppe
  tendrils(c, [[hip[0] + 14, hip[1] - 10, 0.2], [hip[0] + 18, hip[1] - 30, -0.1], [sh[0] + 30, sh[1] + 6, -0.3]], t, 26, 9);
  // hinten
  c.save(); c.globalAlpha *= 0.85;
  sLimb(c, hip[0] + 4, hip[1], -sw * legA, o.thigh || 38, Math.max(0, S(ph + Math.PI + 0.9)) * -0.5, o.shin || 36, 20, 15, sFoot);
  if (o.backArm) o.backArm(c, sh, ph); else sLimb(c, sh[0] + 8, sh[1] + 4, armB - 0.15 - armSw, 32, -0.25, 30, 14, 11, claw);
  c.restore();
  // Rumpf
  c.save(); c.translate(hip[0], hip[1]); c.rotate(-lean);
  shadowFill(c, smooth([[-20, 6], [-26, -24], [-22, -52], [0, -66], [22, -56], [26, -24], [20, 8]]), { inner: o.torsoInner });
  if (o.torso) o.torso(c, t, st);
  tendrils(c, [[-18, 6, 1.9], [-4, 8, 1.6], [12, 8, 1.3]], t, 14, 8);
  c.restore();
  sLimb(c, hip[0] - 4, hip[1], sw * legA, o.thigh || 38, Math.max(0, S(ph + 0.9)) * -0.5, o.shin || 36, 20, 15, sFoot);
  // Kopf
  c.save(); c.translate(sh[0] - 8, sh[1] - 16 + (walking ? S(ph * 2) * 1.5 : 0));
  c.rotate((eating ? S(st.mt * 9) * 0.14 + 0.12 : S(ph * 2 + 0.5) * 0.05) - lean * 0.3);
  const jaw = eating ? Math.abs(S(st.mt * 9)) * 9 : 2 + S(t * 3) * 1;
  shadowFill(c, blob(0, 0, 27, 30, [0.05, 0.02, -0.04, 0.06, -0.03], 11, 0.2));
  tendrils(c, [[14, -24, -1.2], [22, -10, -0.5], [24, 6, 0.1]], t, 16, 7);
  // Mund: gezackte Kluft
  c.fillStyle = '#05030a'; c.beginPath(); c.moveTo(-26, 10); c.lineTo(-6, 8); c.lineTo(-4, 14 + jaw); c.lineTo(-24, 16 + jaw); c.closePath(); c.fill();
  c.fillStyle = '#d8cfe8'; for (const x of [-22, -16, -10]) { c.beginPath(); c.moveTo(x, 9); c.lineTo(x + 2.5, 14); c.lineTo(x + 5, 9); c.fill(); c.beginPath(); c.moveTo(x, 16 + jaw); c.lineTo(x + 2.5, 11 + jaw); c.lineTo(x + 5, 16 + jaw); c.fill(); }
  const blink = blinkAt(t, 4.2, st.seed || 0);
  glowEye(c, -14, -6, 5.5, 4 * (1 - blink * 0.9), o.eye || EYE, 1, 0.2);
  glowEye(c, 2, -8, 4.4, 3.2 * (1 - blink * 0.9), o.eye || EYE, 1, 0.1);
  if (o.helmet) o.helmet(c, t, st);
  c.restore();
  if (o.frontArm) o.frontArm(c, sh, ph); else sLimb(c, sh[0] - 2, sh[1] + 6, armB + armSw, 32, -0.3, 30, 15, 11, claw);
  c.restore();
}

function schatten(c, t, st) { walker(c, t, st); }
function ritter(c, t, st) {
  const arm = st.armor !== false;
  walker(c, t, st, {
    torso: arm ? q => {
      part(q, smooth([[-22, -4], [-24, -30], [-18, -54], [10, -60], [24, -48], [24, -12], [18, 2]]), ['#3a3446', '#1a1624', '#8a78b8'], { out: '#07050a', dx: -5, dy: 5, inner: k => { k.fillStyle = 'rgba(120,90,170,.35)'; for (const [x, y, r] of [[-10, -40, 6], [8, -20, 5], [-4, -10, 4]]) { k.beginPath(); k.ellipse(x, y, r * 1.4, r, 0.3, 0, TAU); k.fill(); } } });
      rivets(q, [[-14, -48], [14, -50], [-16, -8], [16, -8]], 2.4);
    } : null,
    helmet: arm ? q => {
      part(q, smooth([[-30, 10], [-32, -20], [-20, -36], [10, -38], [28, -26], [30, 6], [22, 16], [-24, 18]]), ['#3e3a4c', '#1c1826', '#9a88c8'], { out: '#07050a', dx: -6, dy: 6, inner: k => {
        k.fillStyle = 'rgba(110,80,160,.35)'; for (const [x, y, r] of [[12, -20, 7], [-18, 4, 5], [16, 8, 4]]) { k.beginPath(); k.ellipse(x, y, r * 1.3, r, 0.2, 0, TAU); k.fill(); }
        k.fillStyle = '#07050a'; k.fillRect(-28, -10, 34, 6); k.fillRect(-12, -10, 5, 22);
        k.strokeStyle = 'rgba(0,0,0,.4)'; k.lineWidth = 2; for (let y = 2; y < 16; y += 4) { k.beginPath(); k.moveTo(-26, y); k.lineTo(-14, y); k.stroke(); }
      } });
      glowEye(q, -20, -7, 4, 2.2, EYE, 1); glowEye(q, -4, -7, 3.4, 2, EYE, 1);
      part(q, poly([[-4, -36], [4, -36], [10, -52], [-2, -46]]), ['#7a2a24', '#4a1612', null], { lw: 3, dx: 0, dy: 0 });
    } : null,
  });
}
function sarg(c, t, st) {
  const lid = st.armor !== false;
  walker(c, t, st, {
    armBase: lid ? 0.9 : 1.2,
    frontArm: lid ? (q, sh, ph) => {
      q.save(); q.translate(sh[0] - 34, sh[1] + 10 + S(ph * 2) * 2); q.rotate(-0.06);
      const p = poly([[-14, -60], [14, -60], [20, -24], [14, 70], [-14, 70], [-20, -24]]);
      part(q, p, ['#33261e', '#17100b', '#6a5040'], { out: '#07050a', dx: -5, dy: 5, inner: k => { k.strokeStyle = 'rgba(0,0,0,.35)'; k.lineWidth = 2; for (let x = -12; x <= 12; x += 8) { k.beginPath(); k.moveTo(x, -60); k.lineTo(x, 70); k.stroke(); } } });
      for (const y of [-34, 30]) stroke(q, line([[-19, y], [19, y]]), IRON[0], 5);
      rivets(q, [[-14, -34], [14, -34], [-14, 30], [14, 30], [0, -2]], 2.4);
      sLimb(q, 30, -14, 1.4, 22, 0.2, 18, 12, 10, claw);
      q.restore();
    } : null,
  });
}
function reiter(c, t, st) {
  if (st.armor === false) { walker(c, t, st, { eye: '#ff8a5a' }); return; }
  // Nebelross: Rumpf, Hals, Kopf, Mähne, Schweif, vier Beine im Galopp
  const walking = st.mode !== 'eat' && st.mode !== 'die', ph = (walking ? t * TAU / 0.75 : 0) + (st.seed || 0);
  c.save();
  if (st.mode === 'die') c.globalAlpha *= clamp(1 - st.mt / 1, 0, 1);
  const bob = Math.abs(S(ph)) * 7;
  c.translate(0, -bob);
  const leg = (x, o, back) => {
    const k = S(ph + o);
    c.save(); c.translate(x, -78); c.rotate(k * 0.55 * (back ? 1 : -1) * -1);
    shadowFill(c, smooth([[-8, -4], [8, -4], [6, 34], [-6, 34]]), { dx: -2, dy: 0 });
    c.translate(0, 32); c.rotate(Math.max(0, -k) * 0.9 * (back ? -1 : 1));
    shadowFill(c, smooth([[-5, 0], [5, 0], [4, 34], [-4, 34]]), { dx: -2, dy: 0 });
    shadowFill(c, smooth([[-7, 32], [6, 32], [7, 42], [-8, 42]]), { dx: 0, dy: -2 });
    c.restore();
  };
  c.save(); c.globalAlpha *= 0.8; leg(-30, 1.6, false); leg(34, 0.2, true); c.restore();
  tendrils(c, [[56, -112, -0.2], [60, -100, 0.15], [56, -90, 0.5]], t, 44, 11);
  shadowFill(c, smooth([[-52, -110], [-20, -122], [30, -120], [58, -108], [54, -80], [24, -72], [-30, -74], [-56, -88]]), { inner: q => { q.fillStyle = 'rgba(160,220,255,.12)'; q.fill(blob(0, -104, 40, 10, [0.1], 9)); } });
  leg(-42, 3.2, false); leg(26, 4.4, true);
  c.save(); c.translate(-50, -108); c.rotate(-0.15 + S(ph) * 0.06);
  shadowFill(c, smooth([[8, 4], [-8, -40], [-22, -58], [-32, -54], [-18, -30], [-6, 10]]));
  c.translate(-26, -56);
  shadowFill(c, smooth([[4, -6], [-10, -10], [-34, 2], [-40, 14], [-30, 20], [-8, 12], [6, 8]]));
  part(c, poly([[-2, -8], [2, -20], [6, -6]]), SH, { lw: 3, dx: 0, dy: 0 });
  glowEye(c, -12, -2, 4, 2.6, '#a8f0ff', 1, 0.2);
  c.fillStyle = '#05030a'; c.beginPath(); c.ellipse(-36, 14, 3, 2, 0, 0, TAU); c.fill();
  c.restore();
  tendrils(c, [[-58, -150, -1.2], [-54, -138, -0.9], [-48, -126, -0.6], [-44, -116, -0.3]], t, 30, 8);
  c.restore();
  // Reiter
  c.save(); c.translate(6, -110 - bob); c.scale(0.85, 0.85);
  walker(c, t, { ...st, mode: 'eat', mt: t * 0.2 }, { legH: 30, legAmp: 0, lean: 0.1, torsoH: 52, armBase: 1.5, eye: '#a8f0ff' });
  c.restore();
}
function motte(c, t, st) {
  const dying = st.mode === 'die';
  c.save(); if (dying) { c.globalAlpha *= clamp(1 - st.mt, 0, 1); c.translate(0, st.mt * 60); }
  for (let i = 0; i < 3; i++) {
    const ph = t * 2 + i * 2.1, x = C(ph) * 26 + (i - 1) * 16, y = -110 + S(ph * 1.3) * 18 + i * 14;
    const flap = Math.abs(S(t * 22 + i * 1.3));
    c.save(); c.translate(x, y); c.scale(0.9 - i * 0.12, 0.9 - i * 0.12);
    glow(c, 0, 0, 30, 'rgba(150,90,220,A)', 0.16);
    for (const s of [-1, 1]) {
      c.save(); c.scale(1, 0.35 + flap * 0.65 * (s > 0 ? 1 : 0.9));
      const w = smooth([[0, 0], [s * -10, -22], [s * -34, -30], [s * -40, -8], [s * -22, 10]]);
      part(c, w, ['#2c2438', '#120e1a', '#6a58a0'], { lw: 3.2, out: '#07050a', dx: s * 3, dy: 2, inner: q => { q.strokeStyle = 'rgba(120,90,180,.45)'; q.lineWidth = 1.4; for (let k = 0; k < 3; k++) { q.beginPath(); q.moveTo(0, 0); q.lineTo(s * (-14 - k * 9), -26 + k * 8); q.stroke(); } q.fillStyle = '#05030a'; q.beginPath(); q.arc(s * -24, -12, 5.5, 0, TAU); q.fill(); q.globalCompositeOperation = 'lighter'; q.fillStyle = '#c070ff'; q.beginPath(); q.arc(s * -24, -12, 2.6, 0, TAU); q.fill(); } });
      c.restore();
    }
    part(c, ell(0, 4, 6, 14), SH, { lw: 3, out: '#07050a', dx: 1, dy: 2 });
    glowEye(c, -3, -8, 2, 2, EYE, 1); glowEye(c, 3, -8, 2, 2, EYE, 1);
    c.strokeStyle = OUT; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-2, -10); c.quadraticCurveTo(-8, -22, -14, -24); c.moveTo(2, -10); c.quadraticCurveTo(8, -22, 14, -24); c.stroke();
    c.restore();
  }
  c.restore();
}
function fresser(c, t, st) {
  const walking = st.mode === 'walk', eating = st.mode === 'eat';
  const ph = (walking ? t * TAU / 2.2 : 0) + (st.seed || 0), bob = Math.abs(S(ph)) * 4;
  c.save();
  if (st.mode === 'die') { c.globalAlpha *= clamp(1 - st.mt / 1.1, 0, 1); c.scale(1 + st.mt * 0.3, 1 - st.mt * 0.5); }
  // Licht wird eingesaugt (Spirale vor dem Maul)
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) { const k = frac(t * 0.6 + i / 10), an = k * 6 + i, r = (1 - k) * 60; c.fillStyle = `rgba(255,220,150,${(1 - k) * 0.5})`; c.beginPath(); c.arc(-56 + C(an) * r * 0.6 - (1 - k) * 30, -70 + S(an) * r * 0.4, 2 + (1 - k) * 2, 0, TAU); c.fill(); }
  c.restore();
  for (const [x, o] of [[-30, 0], [26, Math.PI]]) { const k = S(ph + o) * 0.4; c.save(); c.translate(x, -34); c.rotate(k); shadowFill(c, smooth([[-10, 0], [10, 0], [12, 30], [-14, 30]]), { dx: -2, dy: 0 }); c.restore(); }
  c.save(); c.translate(0, -bob);
  shadowFill(c, blob(0, -78, 64, 58, [0.06, -0.04, 0.08, -0.02, 0.05, -0.06], 14, 0.4), { inner: q => { q.fillStyle = 'rgba(80,50,110,.25)'; for (const [x, y, r] of [[20, -110, 12], [36, -70, 9], [10, -40, 8]]) { q.beginPath(); q.arc(x, y, r, 0, TAU); q.fill(); } } });
  tendrils(c, [[50, -110, -0.8], [62, -80, -0.1], [52, -46, 0.6], [10, -134, -1.5]], t, 24, 10);
  // Maul: schwarzer Strudel
  const open = 0.7 + (eating ? Math.abs(S(st.mt * 6)) * 0.4 : S(t * 1.5) * 0.08);
  c.save(); c.translate(-28, -70);
  c.fillStyle = '#020104'; c.beginPath(); c.ellipse(0, 0, 30, 26 * open, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(120,90,170,.45)'; c.lineWidth = 2.4;
  for (let i = 0; i < 3; i++) { c.beginPath(); for (let k = 0; k < 30; k++) { const an = k * 0.4 + t * 2 + i * 2.1, r = k * 0.8; const x = C(an) * r, y = S(an) * r * open; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  c.fillStyle = '#d8cfe8'; for (let i = 0; i < 7; i++) { const an = Math.PI * 0.6 + i * 0.3; const x = C(an) * 30, y = S(an) * 26 * open; c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x * 0.8, y * 0.7); c.lineTo(x + 3, y); c.fill(); }
  c.restore();
  glowEye(c, -14, -116, 4, 3, '#ffd040', 1); glowEye(c, 4, -120, 3.2, 2.6, '#ffd040', 1); glowEye(c, 18, -112, 2.6, 2, '#ffd040', 0.8);
  c.restore();
  c.restore();
}
function schattenling(c, t, st) { walker(c, t, st, { scale: 0.62, period: 0.8, legAmp: 0.6, eye: '#ffd040' }); }
function koloss(c, t, st) {
  const smash = st.mode === 'smash' ? clamp(st.mt / 1.3, 0, 1) : 0;
  const raise = smash < 0.7 ? ease(smash / 0.7) : 1 - ease((smash - 0.7) / 0.3);
  walker(c, t, st, {
    scale: 1.55, period: 2.4, lean: 0.35, eye: '#ff3a2a',
    torsoInner: q => { q.strokeStyle = 'rgba(255,90,50,.6)'; q.lineWidth = 2.4; q.globalCompositeOperation = 'lighter'; q.beginPath(); q.moveTo(-10, -50); q.lineTo(-2, -34); q.lineTo(-12, -20); q.moveTo(12, -40); q.lineTo(6, -24); q.stroke(); },
    frontArm: (q, sh, ph) => {
      q.save(); q.translate(sh[0] - 2, sh[1] + 6); q.rotate(1.1 - raise * 2.6 + S(ph) * 0.08);
      shadowFill(q, smooth([[-11, -4], [11, -4], [12, 34], [9, 60], [-9, 60], [-12, 34]]));
      q.translate(0, 64);
      part(q, blob(0, 6, 18, 16, [0.12, -0.1, 0.08], 9), STONE, { dx: -3, dy: 4 });
      stroke(q, circ(0, -6, 12), '#4a4a4a', 3.4, 3);
      q.restore();
    },
    helmet: q => { for (const [x, y, a] of [[-8, -28, -2], [6, -30, -1.4], [18, -24, -0.9]]) part(q, poly([[x - 4, y + 4], [x + 4, y + 4], [x + C(a) * 16, y + S(a) * 16]]), ['#2a2236', '#120e1a', '#6a5a8a'], { lw: 3, dx: 0, dy: 0 }); },
  });
}
function fuerst(c, t, st) {
  const sum = st.mode === 'summon' ? clamp(st.mt / 1.2, 0, 1) : 0, up = pulse(sum, 0, 1);
  // Umhang hinten
  const wv = S(t * 2) * 6;
  shadowFill(c, smooth([[10, -230], [50, -200], [70 + wv, -100], [60 + wv, -6], [-10, -10], [-20, -120]]), { inner: q => { q.fillStyle = 'rgba(120,40,160,.25)'; q.fill(smooth([[30, -200], [56 + wv, -100], [46 + wv, -10], [20, -12]])); } });
  walker(c, t, st, {
    scale: 1.7, period: 2.8, lean: 0.12, eye: '#d88aff', legH: 80, torsoH: 70,
    torso: q => { part(q, smooth([[-18, -60], [18, -60], [10, -20], [-10, -20]]), ['#3a2a4a', '#1a1022', '#8a6aaa'], { lw: 3, dx: -2, dy: 2 }); glowEye(q, 0, -44, 5, 7, '#c070ff', 0.8); },
    helmet: q => {
      for (let i = 0; i < 5; i++) { const x = -18 + i * 9, h = 18 + (i === 2 ? 12 : i % 2 ? 4 : 8); part(q, poly([[x - 4, -24], [x + 4, -24], [x, -24 - h]]), ['#5a4a6a', '#2a2036', '#c0a8e0'], { lw: 3, dx: 0, dy: 0 }); }
      part(q, rrect(-24, -28, 48, 8, 3), ['#5a4a6a', '#2a2036', '#c0a8e0'], { lw: 3, dx: 0, dy: 2 });
      glowEye(q, 0, -24, 3, 3, '#ff6ad8', 1);
    },
    frontArm: (q, sh, ph) => {
      q.save(); q.translate(sh[0] - 2, sh[1] + 6); q.rotate(1.0 - up * 1.8 + S(ph) * 0.05);
      shadowFill(q, smooth([[-8, -3], [8, -3], [7, 54], [-7, 54]]));
      q.translate(0, 56); q.rotate(-1.1 + up * 1.4);
      stroke(q, line([[0, 20], [0, -70]]), '#3a2a4a', 5);
      flame(q, 0, -70, 18, 30 + up * 30, t, ['#9a4aff', '#d8a8ff', '#ffffff'], 2, 1 + up);
      q.restore();
    },
  });
}

// =====================================================================
export const CHARS = {
  funkling: { kind: 'unit', w: 220, h: 220, foot: 16, draw: funkling, act: 1.0 },
  lichtschuetze: { kind: 'unit', w: 240, h: 250, foot: 16, draw: lichtschuetze, act: 0.45 },
  glutgeist: { kind: 'unit', w: 240, h: 240, foot: 16, draw: glutgeist, act: 0.7 },
  kristallwaechter: { kind: 'unit', w: 250, h: 270, foot: 16, draw: kristallwaechter, act: 0 },
  prismling: { kind: 'unit', w: 240, h: 240, foot: 16, draw: prismling, act: 0.45 },
  frostschimmer: { kind: 'unit', w: 230, h: 260, foot: 16, draw: frostschimmer, act: 0.45 },
  flammengeist: { kind: 'unit', w: 260, h: 240, foot: 16, draw: flammengeist, act: 0.6, ox: -20 },
  lichtfalke: { kind: 'unit', w: 260, h: 240, foot: 16, draw: lichtfalke, act: 0.5 },
  nova: { kind: 'unit', w: 230, h: 230, foot: 16, draw: nova, act: 1.6 },
  strahlenritter: { kind: 'unit', w: 260, h: 270, foot: 16, draw: strahlenritter, act: 0.6, ox: -20 },
  irrlichtmutter: { kind: 'unit', w: 260, h: 250, foot: 16, draw: irrlichtmutter, act: 0.5, ox: 10 },
  sonnenhueter: { kind: 'unit', w: 260, h: 300, foot: 16, draw: sonnenhueter, act: 0 },
  sonnenauge: { kind: 'unit', w: 260, h: 260, foot: 16, draw: sonnenauge, act: 0 },
  pulsar: { kind: 'unit', w: 260, h: 260, foot: 16, draw: pulsar, act: 0.8 },
  blutmond: { kind: 'unit', w: 260, h: 260, foot: 16, draw: blutmond, act: 0.6 },
  sternenweber: { kind: 'unit', w: 260, h: 300, foot: 16, draw: sternenweber, act: 0.8 },
  schatten: { kind: 'foe', w: 230, h: 260, foot: 16, draw: schatten },
  ritter: { kind: 'foe', w: 230, h: 270, foot: 16, draw: ritter },
  sarg: { kind: 'foe', w: 260, h: 280, foot: 16, draw: sarg, ox: -20 },
  reiter: { kind: 'foe', w: 300, h: 330, foot: 16, draw: reiter },
  motte: { kind: 'foe', w: 200, h: 220, foot: 16, draw: motte },
  fresser: { kind: 'foe', w: 260, h: 240, foot: 16, draw: fresser, ox: -16 },
  schattenling: { kind: 'foe', w: 160, h: 180, foot: 14, draw: schattenling },
  koloss: { kind: 'foe', w: 360, h: 420, foot: 16, draw: koloss },
  fuerst: { kind: 'foe', w: 400, h: 470, foot: 16, draw: fuerst },
};

// Zeichnet eine Figur in ein Canvas. k = Pixel pro Einheit (null = einpassen)
export function render(cv, id, t, st = {}, k = null) {
  const d = CHARS[id], c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  if (k == null) {
    k = Math.min(cv.width / d.w, cv.height / d.h);
    c.setTransform(k, 0, 0, k, (cv.width - d.w * k) / 2 + (d.w / 2 + (d.ox || 0)) * k, (cv.height - d.h * k) / 2 + (d.h - d.foot) * k);
  } else c.setTransform(k, 0, 0, k, cv.width / 2 + (d.ox || 0) * k, cv.height - (st.footPx ?? d.foot * k));
  c.globalAlpha = 1; c.filter = 'none'; c.globalCompositeOperation = 'source-over';
  if (st.scale != null) c.scale(st.scale, st.scale);
  if (st.flash > 0) c.filter = 'brightness(1.5) saturate(0.7)';
  d.draw(c, t, st);
  c.filter = 'none';
}
// roter Umriss um Schatten (für gute Sichtbarkeit im Dunkeln)
const _rim = typeof document !== 'undefined' ? document.createElement('canvas') : null;
export function rimRed(cv, px = 2.2, col = 'rgba(220,60,50,.95)') {
  if (!_rim) return;
  if (_rim.width !== cv.width || _rim.height !== cv.height) { _rim.width = cv.width; _rim.height = cv.height; }
  const r = _rim.getContext('2d');
  r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'source-over'; r.clearRect(0, 0, _rim.width, _rim.height);
  r.drawImage(cv, 0, 0); r.globalCompositeOperation = 'source-in'; r.fillStyle = col; r.fillRect(0, 0, _rim.width, _rim.height);
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-over';
  for (let i = 0; i < 8; i++) { const an = i / 8 * TAU; c.drawImage(_rim, C(an) * px, S(an) * px); }
  c.globalCompositeOperation = 'source-over';
}

// Geschosse
export function drawBolt(c, x, y, s = 1, pal = FIRE) {
  c.save(); c.translate(x, y); c.scale(s, s);
  glow(c, 0, 0, 22, rgbaOf(pal[0]), 0.7);
  c.save(); c.globalCompositeOperation = 'lighter';
  c.fillStyle = pal[1]; c.beginPath(); c.ellipse(-4, 0, 16, 5, 0, 0, TAU); c.fill();
  c.fillStyle = pal[2]; c.beginPath(); c.ellipse(2, 0, 8, 3, 0, 0, TAU); c.fill();
  c.restore(); c.restore();
}
export function drawOrb(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  glow(c, 0, 0, 34, 'rgba(255,220,140,A)', 0.8);
  part(c, circ(0, 0, 12), ['#fff2c8', '#ffc860', '#ffffff'], { lw: 3, dx: 2, dy: 2, hi: [-4, -4, 4, 3] });
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 4); c.fillStyle = 'rgba(255,240,200,.5)'; c.fillRect(-20, -1, 40, 2); c.restore(); } c.restore();
  c.restore();
}
export const PAL = { FIRE, FROST, BLOOD, WISP, STAR };
export { boom as drawBoom, flame as drawFlame, glow as drawGlow };
