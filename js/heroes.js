// Packfall – Helden-Sprites (24×24), jeder mit eigener Silhouette.
// Gezeichnet mit Formen (Ellipse, Polygon, Linie) auf Materialien; Licht kommt von oben links,
// danach automatische Schattierung + farbige Kontur.

const OUT = '#060507';

// Material-Rampen: [Licht, Grund, Schatten, Tiefschatten] – alles mit Grauton gemischt
const MAT = {
  kob: ['#aab38c', '#86906c', '#626b4f', '#414833'],
  kobIn: ['#b89a92', '#9a7c76', '#7a5e5a', '#523e3c'],
  tunic: ['#9a8468', '#76634c', '#544636', '#352c22'],
  leather: ['#8e7258', '#6c5440', '#4c3a2c', '#30241a'],
  wood: ['#9a8060', '#76603f', '#54432c', '#352a1c'],
  ember: ['#b8786a', '#94564a', '#6c3b33', '#46241f'],
  emberL: ['#d4a88c', '#bc8a6e', '#9a6c54', '#6e4a38'],
  flame: ['#ecd2a0', '#d6a464', '#b47a44', '#7c4e2c'],
  flameY: ['#f4ead0', '#ecd8a8', '#d6b47c', '#a8865a'],
  horn: ['#d0c4ac', '#a89a80', '#7c705c', '#4e4638'],
  stone: ['#a8a69f', '#85837c', '#62605b', '#41403c'],
  moss: ['#7e8c68', '#5e6c4c', '#465238', '#2e3626'],
  turt: ['#9aa08a', '#767d68', '#565c4b', '#383c31'],
  rim: ['#c4b494', '#a29274', '#7c6e56', '#52483a'],
  crystal: ['#d4e2e6', '#9fbcc6', '#7092a0', '#4a6470'],
  cloak: ['#5c6070', '#454856', '#33353f', '#22232a'],
  bone: ['#e6e0d0', '#c4bca6', '#958e7a', '#605a4c'],
  ice: ['#d8e6ea', '#aec4cc', '#8aa6b2', '#5e7a86'],
  spider: ['#727a86', '#545b66', '#3c414a', '#272a30'],
  leg: ['#646b76', '#4a505a', '#363a42', '#24272c'],
  quill: ['#a69276', '#82705a', '#5e5040', '#3c3328'],
  quillTip: ['#ece4d0', '#d4c8ae', '#b0a488', '#80765e'],
  face: ['#d2c0a0', '#b4a082', '#8c7a60', '#5e5240'],
  frog: ['#9eae84', '#7a8c62', '#5a6a48', '#3a4630'],
  belly: ['#dcd6b4', '#c0b896', '#98906e', '#686048'],
  acid: ['#d4e6b0', '#aac67e', '#80a058', '#58703c'],
  robe: ['#8c7e9c', '#6a5e7c', '#4c425c', '#302a3c'],
  robeD: ['#5e5470', '#463e56', '#332d40', '#211d2a'],
  hair: ['#c8c4cc', '#a4a0aa', '#7c7884', '#54505a'],
  orb: ['#e4f0f4', '#b4d4e0', '#84aebe', '#587e8e'],
  gold: ['#e6d6a4', '#c6ac72', '#9c844e', '#665634'],
  slug: ['#a8968a', '#86746a', '#64544c', '#423630'],
  shell: ['#a8806a', '#86604c', '#634636', '#402c22'],
  iron: ['#7e7c80', '#5e5c62', '#444248', '#2c2a30'],
  ghost: ['#dce6e4', '#b6c6c2', '#8ca09c', '#627470'],
  lantern: ['#c8ecdc', '#94d0bc', '#68a894', '#467a6a'],
  wing: ['#f0ead8', '#d8ceb0', '#b0a484', '#7e745a'],
  dragon: ['#a8746a', '#86564c', '#643e36', '#422622'],
  dbelly: ['#dcc49c', '#c0a47c', '#9a805c', '#6a5640'],
  memb: ['#7e5a5a', '#634444', '#4a3232', '#302020'],
};

function painter(W = 26, H = 24, OX = 1) {
  const g = Array.from({ length: H }, () => Array(W).fill(null));
  const set = (x, y, v) => { x = Math.round(x) + OX; y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = v; };
  const p = {
    g, W, H,
    px: (x, y, v) => set(x, y, v),
    rect: (x, y, w, h, v) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, v); },
    ell: (cx, cy, rx, ry, v) => {
      for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const dx = (x - cx) / (rx + 0.45), dy = (y - cy) / (ry + 0.45);
        if (dx * dx + dy * dy <= 1) set(x, y, v);
      }
    },
    ring: (cx, cy, rx, ry, v) => {
      for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const dx = (x - cx) / (rx + 0.45), dy = (y - cy) / (ry + 0.45), d = dx * dx + dy * dy;
        const dx2 = (x - cx) / Math.max(0.1, rx - 0.6), dy2 = (y - cy) / Math.max(0.1, ry - 0.6);
        if (d <= 1 && dx2 * dx2 + dy2 * dy2 > 1) set(x, y, v);
      }
    },
    line: (x0, y0, x1, y1, v) => {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let e = dx + dy;
      for (;;) { set(x0, y0, v); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    },
    poly: (pts, v) => {
      const ys = pts.map(q => q[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
      for (let y = y0; y <= y1; y++) for (let x = -OX; x < W - OX; x++) {
        const X = x + 0.5, Y = y + 0.5; let ins = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if ((yi > Y) !== (yj > Y) && X < ((xj - xi) * (Y - yi)) / (yj - yi) + xi) ins = !ins;
        }
        if (ins) set(x, y, v);
      }
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) p.line(pts[j][0], pts[j][1], pts[i][0], pts[i][1], v);
    },
    clear: (x, y) => set(x, y, null),
    get: (x, y) => g[y]?.[x + OX],
  };
  return p;
}

function darker(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round((n >> 16) * f), gg = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return '#' + ((1 << 24) | (r << 16) | (gg << 8) | b).toString(16).slice(1);
}

// Materialien schattieren, Kontur ziehen, als Canvas ausgeben
function render(p, { silhouette = false, scale = 1 } = {}) {
  const { g, W, H } = p;
  const out = Array.from({ length: H }, () => Array(W).fill(null));
  const same = (x, y, k) => x >= 0 && y >= 0 && x < W && y < H && g[y][x] === k;
  const run = (x, y, dx, dy, k) => { let n = 0; while (n < 4 && same(x + dx * (n + 1), y + dy * (n + 1), k)) n++; return n; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = g[y][x];
    if (!k) continue;
    if (k[0] === '#') { out[y][x] = k; continue; }
    const R = MAT[k];
    if (!R) { out[y][x] = '#ff00ff'; continue; }
    const du = run(x, y, 0, -1, k), dl = run(x, y, -1, 0, k), dd = run(x, y, 0, 1, k), dr = run(x, y, 1, 0, k);
    let s = 1;
    if (du === 0 || (dl === 0 && du <= 2)) s = 0;
    else if (dd === 0 && dr === 0) s = 3;
    else if (dd === 0 || (dr === 0 && dd <= 1)) s = 2;
    else if (dd === 1 && dr <= 1) s = 2;
    // leichte Dither-Kante zwischen Licht und Grund bei großen Flächen
    if (s === 1 && du === 1 && dl >= 1 && ((x + y) & 1)) s = 0;
    out[y][x] = R[s];
  }
  // Kontur: dunkle Version des Nachbarmaterials
  const ol = Array.from({ length: H }, () => Array(W).fill(null));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x]) continue;
    let nb = null;
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < W && yy < H && g[yy][xx]) { nb = g[yy][xx]; break; }
    }
    if (nb) ol[y][x] = nb[0] === '#' || !MAT[nb] ? OUT : darker(MAT[nb][3], 0.42);
  }
  const c = document.createElement('canvas');
  c.width = W * scale; c.height = H * scale;
  const x = c.getContext('2d');
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
    const col = out[yy][xx] || ol[yy][xx];
    if (!col) continue;
    x.fillStyle = silhouette ? (out[yy][xx] ? '#24222a' : '#121116') : col;
    x.fillRect(xx * scale, yy * scale, scale, scale);
  }
  return c;
}

// ---------------------------------------------------------------- Helden
const DRAW = {
  // Kieselkobold – große Ohren, Lederkappe, Steinschleuder
  schleuderer(p) {
    p.poly([[8, 9], [1, 4], [2, 6], [3, 10]], 'kob');
    p.line(7, 8, 3, 6, 'kobIn');
    p.rect(9, 19, 2, 3, 'kob'); p.rect(13, 19, 2, 3, 'kob');
    p.rect(8, 21, 3, 1, 'kob'); p.rect(13, 21, 3, 1, 'kob');
    p.ell(11.5, 16, 4, 3.5, 'tunic');
    p.rect(8, 17, 8, 1, 'leather');
    p.px(10, 17, '#bba66c');
    p.ell(7, 18, 1.4, 1.4, 'leather');
    p.ell(11, 9.5, 5, 4, 'kob');
    p.ell(15.5, 10.5, 2, 1.6, 'kob');
    p.poly([[13, 7], [18, 2], [17, 5], [16, 8]], 'kob');
    p.line(14, 7, 17, 4, 'kobIn');
    p.ell(10, 6.5, 4.5, 2, 'leather');
    p.rect(6, 7, 3, 1, 'leather');
    p.px(13, 9, '#e8d48a'); p.px(14, 9, '#141210'); p.px(13, 8, '#2a2c22');
    p.px(17, 10, '#3a3a2e');
    p.line(14, 12, 16, 12, '#2a2620'); p.px(15, 12, '#e6e0cc');
    p.line(14, 15, 17, 13, 'kob');
    p.line(19, 15, 19, 11, 'wood'); p.px(18, 10, 'wood'); p.px(20, 10, 'wood'); p.px(18, 9, 'wood'); p.px(20, 9, 'wood');
    p.px(19, 9, '#a09c94'); p.px(19, 16, 'wood');
  },
  // Glutwicht – runder Feuerkobold mit Flammenkrone
  funkenwerfer(p) {
    p.line(7, 19, 3, 16, 'ember'); p.px(2, 15, 'flame'); p.px(2, 14, 'flameY');
    p.rect(9, 20, 2, 2, 'ember'); p.rect(13, 20, 2, 2, 'ember');
    p.poly([[6, 12], [7, 5], [9, 9], [11, 2], [13, 8], [15, 3], [16, 9], [18, 6], [18, 12]], 'flame');
    p.poly([[8, 12], [10, 7], [11, 10], [13, 6], [14, 10], [16, 8], [16, 12]], 'flameY');
    p.ell(12, 15, 6, 5.5, 'ember');
    p.ell(13, 17, 3, 2.5, 'emberL');
    p.px(7, 10, 'horn'); p.px(6, 9, 'horn'); p.px(17, 10, 'horn'); p.px(18, 9, 'horn');
    p.rect(10, 13, 2, 2, '#f4e6b0'); p.rect(14, 13, 2, 2, '#f4e6b0');
    p.px(11, 14, '#2a1612'); p.px(15, 14, '#2a1612');
    p.line(11, 17, 15, 17, '#3a1a14'); p.px(12, 17, '#e8dcc8'); p.px(14, 17, '#e8dcc8');
    p.line(6, 15, 5, 13, 'ember');
    p.line(17, 15, 19, 14, 'ember');
    p.ell(20, 12, 2, 2, 'flame'); p.px(20, 12, '#f8f0d8'); p.px(20, 9, 'flameY'); p.px(21, 10, 'flame');
  },
  // Felskröte – Steinpanzer mit Moos und Kristall
  steinwache(p) {
    p.px(1, 18, 'turt'); p.px(2, 18, 'turt'); p.px(2, 17, 'turt');
    p.rect(4, 19, 3, 3, 'turt'); p.rect(14, 19, 3, 3, 'turt');
    p.px(3, 21, 'turt'); p.px(17, 21, 'turt');
    p.ell(10.5, 14, 8.5, 6, 'stone');
    p.rect(3, 18, 16, 2, 'rim');
    p.line(5, 12, 7, 15, '#4a4844'); p.line(7, 15, 12, 15, '#4a4844'); p.line(12, 15, 14, 11, '#4a4844'); p.line(12, 15, 13, 17, '#4a4844');
    p.line(7, 15, 6, 17, '#4a4844'); p.line(9, 9, 10, 12, '#4a4844'); p.line(14, 11, 17, 13, '#4a4844');
    p.poly([[9, 10], [10, 4], [12, 10]], 'crystal');
    p.poly([[12, 10], [14, 6], [15, 10]], 'crystal');
    [[5, 9], [6, 8], [7, 8], [13, 8], [14, 9], [16, 10], [4, 10], [8, 9]].forEach(([x, y]) => p.px(x, y, 'moss'));
    p.ell(20, 16, 3, 2.2, 'turt');
    p.px(21, 15, '#e0d4a0'); p.px(22, 15, '#141210');
    p.line(20, 18, 22, 17, '#2e3228');
  },
  // Knochenbogner – Skelett in zerrissener Kutte mit Langbogen
  knochenbogner(p) {
    p.poly([[7, 3], [16, 3], [18, 10], [17, 22], [6, 22], [5, 10]], 'cloak');
    [8, 11, 15].forEach(x => p.clear(x, 22));
    p.clear(6, 21); p.clear(16, 21);
    p.ell(11.5, 7.5, 3.6, 3.4, 'bone');
    p.rect(9, 10, 5, 2, 'bone');
    p.px(10, 7, '#141414'); p.px(13, 7, '#141414'); p.px(10, 8, '#141414'); p.px(13, 8, '#141414');
    p.px(13, 7, '#9fd8c8');
    p.px(11, 9, '#2a2826');
    p.px(10, 11, '#3a3632'); p.px(12, 11, '#3a3632');
    p.rect(9, 13, 5, 5, 'bone');
    [14, 16].forEach(y => p.line(9, y, 13, y, '#2e2c2a'));
    p.line(11, 13, 11, 17, '#bdb5a0');
    p.line(13, 14, 17, 12, 'bone');
    p.poly([[18, 3], [20, 6], [21, 12], [20, 18], [18, 21], [19, 18], [20, 12], [19, 6]], 'wood');
    p.line(18, 4, 18, 20, '#bdb5a0');
    p.line(13, 12, 22, 12, 'wood'); p.px(23, 12, '#c8c4bc'); p.px(22, 11, '#c8c4bc'); p.px(22, 13, '#c8c4bc');
    p.px(13, 11, '#9a9890'); p.px(13, 13, '#9a9890');
  },
  // Frostweberin – Eisspinne mit Kristallrücken
  frostweberin(p) {
    [[[10, 15], [5, 11], [3, 22]], [[15, 15], [19, 11], [20, 22]]].forEach(([a, b, c]) => { p.line(...a, ...b, 'leg'); p.line(...b, ...c, 'leg'); });
    p.ell(8, 11.5, 6, 5, 'ice');
    p.poly([[4, 8], [5, 2], [7, 7]], 'crystal');
    p.poly([[7, 7], [9, 1], [11, 7]], 'crystal');
    p.poly([[10, 8], [12, 4], [13, 9]], 'crystal');
    [[6, 11], [8, 13], [10, 11], [5, 14]].forEach(([x, y]) => p.px(x, y, '#7a98a6'));
    p.ell(15, 13.5, 4, 3, 'spider');
    [[[11, 14], [3, 8], [1, 21]], [[12, 15], [7, 9], [6, 22]], [[15, 16], [17, 9], [17, 22]], [[17, 15], [21, 8], [22, 21]]].forEach(([a, b, c]) => { p.line(...a, ...b, 'spider'); p.line(...b, ...c, 'spider'); });
    p.px(17, 12, '#cce8f2'); p.px(18, 12, '#cce8f2'); p.px(18, 13, '#9fcfe0'); p.px(16, 12, '#9fcfe0'); p.px(19, 13, '#cce8f2');
    p.px(19, 15, 'bone'); p.px(19, 16, 'bone'); p.px(17, 16, 'bone');
  },
  // Dornenigel – Stachelkugel, die Dornen verschießt
  dornenschuetze(p) {
    for (let i = 0; i <= 13; i++) {
      const a = Math.PI * (0.94 + i * 0.085), r = 10.5 + (i % 2) * 1.2;
      const x1 = 10.5 + Math.cos(a) * r, y1 = 15 + Math.sin(a) * r * 0.95;
      p.line(10.5, 15, x1, y1, 'quill');
      p.px(x1, y1, 'quillTip');
    }
    p.ell(10.5, 15.5, 7.5, 5.5, 'quill');
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * 0.1); p.line(10.5 + Math.cos(a) * 3, 15.5 + Math.sin(a) * 3, 10.5 + Math.cos(a) * 7, 15.5 + Math.sin(a) * 5.5, i % 2 ? 'quillTip' : 'quill'); }
    p.ell(17.5, 17, 3.5, 2.5, 'face');
    p.ell(13, 19.5, 5, 1.6, 'face');
    p.px(21, 17, '#1a1612'); p.px(21, 16, '#3a3028');
    p.px(17, 15, '#1a1612'); p.px(17, 14, '#d8d0b8');
    p.px(19, 18, '#5a4a3a');
    p.rect(9, 21, 2, 1, 'face'); p.rect(15, 21, 2, 1, 'face');
  },
  // Giftunke – Kröte mit Glubschaugen und Säureblase
  giftkroete(p) {
    p.ell(5, 19, 3.5, 2.5, 'frog');
    p.ell(11, 16, 8.5, 5, 'frog');
    p.ell(12.5, 19, 6, 2, 'belly');
    p.ell(7, 11, 3, 3, 'frog'); p.ell(14.5, 11, 3, 3, 'frog');
    p.ell(7, 10.5, 1.8, 1.8, '#dad2a2'); p.ell(14.5, 10.5, 1.8, 1.8, '#dad2a2');
    p.rect(7, 10, 1, 2, '#141210'); p.rect(15, 10, 1, 2, '#141210');
    p.line(12, 16, 19, 15, '#2c3424'); p.px(19, 14, '#2c3424');
    [[8, 14], [12, 13], [5, 16], [10, 17], [16, 13]].forEach(([x, y]) => p.px(x, y, '#56663e'));
    [[9, 13], [14, 14], [6, 15]].forEach(([x, y]) => p.px(x, y, '#b4c294'));
    p.rect(16, 19, 2, 3, 'frog'); p.rect(15, 21, 4, 1, 'frog');
    p.rect(2, 21, 5, 1, 'frog');
    p.ell(20.5, 9, 2, 2, 'acid'); p.px(20, 8, '#eef6dc');
    p.px(22, 5, 'acid'); p.px(19, 5, 'acid');
  },
  // Sturmhexe – Spitzhut, wallende Robe, Blitzkugel
  blitzruferin(p) {
    p.poly([[8, 11], [15, 11], [19, 22], [4, 22]], 'robe');
    p.line(6, 21, 17, 21, 'robeD');
    p.rect(9, 16, 7, 1, 'gold');
    p.line(9, 11, 7, 17, 'hair'); p.line(14, 11, 16, 16, 'hair'); p.line(8, 11, 6, 15, 'hair');
    p.rect(10, 10, 4, 3, '#24222c');
    p.px(10, 11, '#c4e6f2'); p.px(13, 11, '#c4e6f2');
    p.poly([[8, 9], [16, 9], [13, 4], [10, 0], [6, 1], [9, 3]], 'robeD');
    p.rect(4, 9, 15, 1, 'robeD');
    p.line(9, 8, 15, 8, 'gold');
    p.line(14, 14, 18, 13, 'robe');
    p.ell(20.5, 11, 2.2, 2.2, 'orb'); p.px(20, 10, '#f4fafc'); p.px(21, 11, '#f4fafc');
    p.px(22, 7, '#d8eef6'); p.px(21, 8, '#d8eef6'); p.px(22, 8, '#d8eef6');
    p.px(17, 8, '#d8eef6'); p.px(18, 9, '#d8eef6');
    p.px(23, 13, '#b4d4e0');
  },
  // Magmaschnecke – ihr Haus ist ein Mörser
  glutmoerser(p) {
    p.poly([[2, 22], [22, 22], [22, 19], [18, 16], [6, 18]], 'slug');
    p.ell(18.5, 16, 3, 3, 'slug');
    p.line(18, 13, 17, 9, 'slug'); p.line(20, 13, 21, 10, 'slug');
    p.px(17, 8, '#e8dca0'); p.px(21, 9, '#e8dca0');
    p.line(19, 18, 21, 18, '#3a2c26');
    p.ell(10, 12.5, 7, 6.5, 'shell');
    p.ring(10, 13, 4, 3.8, '#4a3428'); p.ring(10.5, 13.5, 1.6, 1.5, '#4a3428');
    [[6, 9], [14, 15], [8, 17], [15, 10]].forEach(([x, y]) => p.px(x, y, '#e0a060'));
    p.px(5, 14, '#c8804a');
    p.rect(8, 2, 5, 5, 'iron');
    p.rect(7, 2, 7, 1, 'iron');
    p.px(9, 2, '#f0b870'); p.px(10, 2, '#f8d8a0'); p.px(11, 2, '#f0b870');
    p.px(9, 0, '#7a7672'); p.px(11, 1, '#8a8682'); p.px(12, 0, '#6a6662');
  },
  // Laternengeist – schwebender Geist mit Seelenlaterne
  geisterlaterne(p) {
    p.poly([[5, 10], [17, 10], [15, 16], [11, 20], [6, 21], [3, 19], [7, 17]], 'ghost');
    p.ell(11, 8.5, 6, 6, 'ghost');
    p.px(2, 18, 'ghost'); p.px(2, 17, 'ghost');
    p.rect(8, 7, 2, 3, '#1c2422'); p.rect(12, 7, 2, 3, '#1c2422');
    p.px(8, 7, '#3a4a46');
    p.rect(10, 11, 2, 2, '#1c2422');
    p.line(15, 12, 18, 13, 'ghost');
    p.px(19, 13, 'iron'); p.px(19, 14, 'iron');
    p.rect(17, 15, 5, 6, 'iron');
    p.rect(18, 16, 3, 4, 'lantern'); p.px(19, 17, '#e8faf2');
    p.rect(18, 14, 3, 1, 'iron');
    p.px(17, 21, 'iron'); p.px(21, 21, 'iron');
  },
  // Sonnenwächter – schwebendes Auge mit Flügeln und Heiligenschein
  sonnenwaechter(p) {
    p.ring(12, 2, 5, 1.4, 'gold');
    p.poly([[9, 10], [1, 4], [3, 8], [1, 10], [6, 13]], 'wing');
    p.poly([[15, 10], [23, 4], [21, 8], [23, 10], [18, 13]], 'wing');
    p.line(8, 10, 3, 6, 'gold'); p.line(16, 10, 21, 6, 'gold');
    p.poly([[9, 14], [2, 17], [4, 19], [9, 17]], 'wing');
    p.poly([[15, 14], [22, 17], [20, 19], [15, 17]], 'wing');
    p.poly([[11, 16], [13, 16], [12, 22]], 'gold');
    p.ell(12, 11.5, 5, 5, 'gold');
    p.ell(12, 11.5, 3.2, 3.2, '#e8e2d0');
    p.ell(12.5, 11.5, 2, 2, '#c09450');
    p.px(13, 11, '#141210'); p.px(13, 12, '#141210'); p.px(12, 11, '#141210');
    p.px(11, 10, '#ffffff');
    p.px(10, 13, '#cfc6b0'); p.px(14, 14, '#cfc6b0');
  },
  // Aschedrache – junger Drache mit Hörnern und Hautflügeln
  drachenwelpe(p) {
    p.poly([[9, 13], [2, 3], [4, 8], [1, 9], [4, 12], [2, 14], [8, 16]], 'memb');
    p.line(9, 13, 2, 3, 'dragon'); p.line(8, 14, 1, 9, 'dragon'); p.line(8, 15, 2, 14, 'dragon');
    p.line(6, 19, 2, 21, 'dragon'); p.line(2, 21, 1, 19, 'dragon'); p.px(1, 18, 'horn'); p.px(0, 19, 'horn');
    p.ell(10.5, 16.5, 6, 4.5, 'dragon');
    p.ell(12.5, 17.5, 3, 3, 'dbelly');
    [16, 18].forEach(y => p.line(11, y, 14, y, '#9a805c'));
    p.ell(15, 10, 3.5, 3, 'dragon');
    p.rect(17, 9, 5, 3, 'dragon');
    p.line(14, 7, 12, 3, 'horn'); p.line(16, 7, 16, 3, 'horn');
    p.px(17, 9, '#e8c060'); p.px(18, 9, '#141210');
    p.px(21, 9, '#2a1a14');
    p.line(18, 12, 21, 12, '#2a1a14');
    p.px(22, 11, 'flame'); p.px(23, 12, 'flameY');
    p.rect(7, 20, 3, 2, 'dragon'); p.rect(13, 20, 3, 2, 'dragon');
    p.px(10, 21, 'horn'); p.px(16, 21, 'horn');
  },
};

export const HERO_IDS = Object.keys(DRAW);

export function heroSprite(id, { silhouette = false, scale = 1 } = {}) {
  const p = painter();
  (DRAW[id] || DRAW.schleuderer)(p);
  return render(p, { silhouette, scale });
}
