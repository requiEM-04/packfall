// Packfall · Laternenwacht – Kampffeld (Three.js): 5 Bahnen × 9 Felder, Lichtwesen und Schatten als 2D-Figuren,
// Dunkelheit pro Feld, Lichtkreise, Geschosse und Effekte. Dazu Portraits für Karten und Menüs.
import * as THREE from './vendor/three.module.min.js';
import { COLS, ROWS, T, ENEMIES, THEMES } from './core.js?v=0.11-ca2fa47a';
import { CHARS, render, rimRed, drawOrb, drawBolt, PAL, wisp as drawWisp, drawBoom } from './lwchars.js?v=0.11-ca2fa47a';

const U = 1 / 150;          // Welt-Einheiten pro Figur-Einheit
const TAU = Math.PI * 2;
let _seed = 99;
const rnd = () => (_seed = (_seed * 16807) % 2147483647) / 2147483647;

function canvasTex(w, h, paint) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  paint(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const radial = (rgb, soft = 0.5) => canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(soft, `rgba(${rgb},.35)`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fillRect(0, 0, w, h); });

// ---------- Portraits (Karten, Menüs, Booster) ----------
export function portraits(size = 220) {
  const out = { unit: {}, sil: {}, enemy: {} };
  const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
  for (const id of Object.keys(T)) {
    render(cv, id, 0.6, { mode: 'idle', mt: 0 }); out.unit[id] = cv.toDataURL('image/png');
    const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#1c1a22'; c.fillRect(0, 0, size, size); c.globalCompositeOperation = 'source-over';
    out.sil[id] = cv.toDataURL('image/png');
  }
  for (const id of Object.keys(ENEMIES)) { render(cv, id, 0.6, { mode: 'walk', mt: 0, seed: 0.4 }); rimRed(cv, 2); out.enemy[id] = cv.toDataURL('image/png'); }
  return out;
}

// ---------- Hintergründe ----------
function paintSky(th) {
  return (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, th.sky[0]); g.addColorStop(0.75, th.sky[1]); g.addColorStop(1, '#3a3a44');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const hz = c.createLinearGradient(0, h * 0.45, 0, h * 0.85); hz.addColorStop(0, 'rgba(120,110,150,0)'); hz.addColorStop(1, 'rgba(120,110,150,.22)'); c.fillStyle = hz; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(230,230,255,${rnd() * 0.55})`; const s = rnd() < 0.1 ? 2 : 1.2; c.fillRect(rnd() * w, rnd() * h * 0.5, s, s); }
    const mx = w * 0.62, my = h * 0.2, R = h * 0.06;
    const halo = c.createRadialGradient(mx, my, 0, mx, my, R * 7); halo.addColorStop(0, 'rgba(220,226,240,.28)'); halo.addColorStop(1, 'rgba(220,226,240,0)'); c.fillStyle = halo; c.fillRect(0, 0, w, h);
    c.fillStyle = '#dde0ea'; c.beginPath(); c.arc(mx, my, R, 0, TAU); c.fill();
    c.fillStyle = 'rgba(150,154,170,.5)'; for (const [dx, dy, r] of [[-0.3, -0.2, 0.25], [0.3, 0.25, 0.18], [0.1, -0.45, 0.12]]) { c.beginPath(); c.arc(mx + dx * R, my + dy * R, r * R, 0, TAU); c.fill(); }
    for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(40,40,56,.45)'; c.beginPath(); c.ellipse(rnd() * w, h * (0.1 + rnd() * 0.3), 90 + rnd() * 200, 8 + rnd() * 10, 0, 0, TAU); c.fill(); }
    // ferne Silhouetten je nach Thema
    c.fillStyle = '#0a0b0e';
    const base = h * 0.78;
    c.beginPath(); c.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      let y = base;
      if (th.deco === 'lamp' || th.deco === 'crate') y = base - (Math.floor(x / 60) % 3 === 0 ? 50 : 30) - (x % 60 < 10 ? 18 : 0);
      else if (th.deco === 'grave' || th.deco === 'pillar') y = base - 20 - (x % 140 < 12 ? 60 : 0) - (x % 90 < 6 ? 30 : 0);
      else if (th.deco === 'crystal') y = base - 30 - Math.abs(Math.sin(x * 0.02)) * 60;
      else y = base - 26 - Math.abs(Math.sin(x * 0.013) * 30 + Math.sin(x * 0.05) * 12);
      c.lineTo(x, y);
    }
    c.lineTo(w, h); c.closePath(); c.fill();
  };
}
function paintBoard(th, blocks) {
  return (c, w, h) => {
    const tw = w / COLS, thh = h / ROWS;
    for (let r = 0; r < ROWS; r++) for (let q = 0; q < COLS; q++) { c.fillStyle = th.tile[(r + q) % 2]; c.fillRect(q * tw, r * thh, tw, thh); }
    for (let i = 0; i < 7000; i++) { const x = rnd() * w, y = rnd() * h, l = 3 + rnd() * 8; c.strokeStyle = rnd() < 0.5 ? 'rgba(140,160,120,.16)' : 'rgba(10,12,8,.3)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 4, y - l); c.stroke(); }
    for (let i = 0; i < 50; i++) { const x = rnd() * w, y = rnd() * h, r = 14 + rnd() * 30; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rnd() < 0.5 ? 'rgba(10,12,8,.3)' : 'rgba(160,170,140,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(8,10,6,.4)'; c.lineWidth = 3;
    for (let q = 1; q < COLS; q++) { c.beginPath(); c.moveTo(q * tw, 0); c.lineTo(q * tw, h); c.stroke(); }
    for (let r = 1; r < ROWS; r++) { c.beginPath(); c.moveTo(0, r * thh); c.lineTo(w, r * thh); c.stroke(); }
    for (const [q, r, type] of blocks) {
      const cx = (q + 0.5) * tw, cy = (r + 0.5) * thh;
      if (type === 'pool') { const g = c.createRadialGradient(cx, cy, 4, cx, cy, tw * 0.48); g.addColorStop(0, '#0c1814'); g.addColorStop(0.8, '#14241e'); g.addColorStop(1, 'rgba(20,36,30,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, tw * 0.46, thh * 0.42, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(160,200,190,.15)'; c.lineWidth = 2; c.beginPath(); c.ellipse(cx - 10, cy - 6, tw * 0.2, thh * 0.08, 0, 0, TAU); c.stroke(); }
      else { c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(cx, cy + thh * 0.18, tw * 0.36, thh * 0.18, 0, 0, TAU); c.fill(); }
    }
  };
}
function paintBlock(type) {
  return (c, w, h) => {
    c.lineJoin = 'round'; c.lineWidth = 6; c.strokeStyle = '#0c0b0a';
    const F = (pts, fill, sh) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.stroke(); c.fillStyle = fill; c.fill(); if (sh) { c.save(); c.clip(); c.fillStyle = sh; c.fillRect(w * 0.55, 0, w, h); c.restore(); } };
    if (type === 'grave') { c.beginPath(); c.moveTo(60, 230); c.lineTo(60, 110); c.arc(128, 110, 68, Math.PI, 0); c.lineTo(196, 230); c.closePath(); c.stroke(); c.fillStyle = '#5c5a56'; c.fill(); c.save(); c.clip(); c.fillStyle = '#44423f'; c.fillRect(140, 0, 120, 256); c.fillStyle = 'rgba(80,110,60,.6)'; c.fillRect(56, 200, 150, 40); c.restore(); c.strokeStyle = '#2a2826'; c.lineWidth = 4; for (const y of [120, 140, 160]) { c.beginPath(); c.moveTo(96, y); c.lineTo(160, y); c.stroke(); } c.beginPath(); c.arc(128, 96, 12, 0, TAU); c.stroke(); }
    else if (type === 'crate') { F([[50, 240], [206, 240], [206, 110], [50, 110]], '#5a4430', '#3e2e20'); c.strokeStyle = '#2a1e14'; c.lineWidth = 6; c.beginPath(); c.moveTo(50, 110); c.lineTo(206, 240); c.moveTo(206, 110); c.lineTo(50, 240); c.stroke(); F([[70, 110], [186, 110], [176, 70], [80, 70]], '#6a5038'); }
    else if (type === 'pillar') { F([[80, 244], [176, 244], [168, 40], [88, 40]], '#5a5a62', '#42424a'); F([[66, 50], [190, 50], [190, 22], [66, 22]], '#6a6a72'); F([[66, 250], [190, 250], [190, 228], [66, 228]], '#6a6a72'); }
    else if (type === 'rock') { F([[40, 240], [70, 140], [130, 96], [200, 130], [222, 240]], '#55534e', '#3e3c38'); }
    else if (type === 'crystal') { for (const [x, hh, a] of [[90, 150, -0.2], [140, 200, 0.05], [182, 130, 0.25]]) { c.save(); c.translate(x, 240); c.rotate(a); F([[-22, 0], [22, 0], [16, -hh], [0, -hh - 30], [-16, -hh]], '#3a2a56', '#24183a'); c.restore(); } const g = c.createRadialGradient(140, 140, 0, 140, 140, 110); g.addColorStop(0, 'rgba(160,90,255,.35)'); g.addColorStop(1, 'rgba(160,90,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  };
}
// Lichtherz – was die Schatten verschlingen wollen
function paintHeart(c, w, h) {
  const cx = w / 2, cy = h * 0.44;
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, w * 0.5); g.addColorStop(0, 'rgba(255,236,180,.55)'); g.addColorStop(1, 'rgba(255,236,180,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.save(); c.translate(cx, cy);
  const pts = [[0, -110], [56, -30], [40, 70], [0, 110], [-40, 70], [-56, -30]];
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
  c.lineJoin = 'round'; c.strokeStyle = 'rgba(255,220,150,.35)'; c.lineWidth = 26; c.stroke();
  const f = c.createRadialGradient(-10, -20, 0, 0, 0, 120); f.addColorStop(0, '#ffffff'); f.addColorStop(0.45, '#ffe6a8'); f.addColorStop(1, '#e09a48'); c.fillStyle = f; c.fill();
  c.strokeStyle = 'rgba(255,255,240,.8)'; c.lineWidth = 3; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = 2;
  for (const [a, b] of [[0, 3], [1, 4], [5, 2], [0, 2], [0, 4]]) { c.beginPath(); c.moveTo(...pts[a]); c.lineTo(...pts[b]); c.stroke(); }
  c.restore();
}
function paintWheel(c, w, h) {
  const cx = w / 2, cy = h / 2;
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, w / 2); g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(0.35, 'rgba(255,200,110,.6)'); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#fff6dc'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, w * 0.28, 0, TAU); c.stroke();
  c.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = i * TAU / 6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * w * 0.28, cy + Math.sin(a) * w * 0.28); c.stroke(); }
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx, cy, w * 0.07, 0, TAU); c.fill();
}

// =====================================================================
export function createBattle(canvas, game, { quality = () => 'auto' } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: !!window.__keepGL });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.06;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const camera = new THREE.PerspectiveCamera(26, 16 / 9, 0.1, 140);
  let scene = null, built = null, built0 = null, W = 1, H = 1, ins = { top: 0, bottom: 0, left: 0, right: 0 };
  const views = new Map(), fxViews = [], texts = [];
  const tex = {};
  const PXK = () => (quality() === 'niedrig' ? 0.75 : quality() === 'mittel' ? 0.95 : 1.1);
  let frameNo = 0, clock = 0, shakeT = 0;

  function sharedTex() {
    if (tex.glow) return;
    tex.glow = radial('255,255,255', 0.35); tex.soft = radial('255,255,255', 0.6); tex.shadow = radial('6,4,10', 0.5);
    tex.bolt = canvasTex(96, 48, c => drawBolt(c, 52, 24, 1.6, PAL.FIRE));
    tex.ice = canvasTex(96, 48, c => drawBolt(c, 52, 24, 1.6, PAL.FROST));
    tex.prism = canvasTex(96, 48, c => drawBolt(c, 52, 24, 1.6, ['#c8f6ff', '#ffffff', '#ffffff']));
    tex.falcon = canvasTex(96, 48, c => drawBolt(c, 52, 24, 1.8, ['#ffd27a', '#fff2c0', '#ffffff']));
    tex.lob = canvasTex(96, 96, c => drawOrb(c, 48, 48, 1.4));
    tex.moon = canvasTex(96, 96, c => { const g = c.createRadialGradient(48, 48, 0, 48, 48, 46); g.addColorStop(0, '#fff0ec'); g.addColorStop(0.3, '#ff6a5a'); g.addColorStop(0.6, 'rgba(200,20,30,.6)'); g.addColorStop(1, 'rgba(200,20,30,0)'); c.fillStyle = g; c.fillRect(0, 0, 96, 96); });
    tex.wisp = canvasTex(96, 96, c => drawWisp(c, 56, 48, 10, 0));
    tex.drop = canvasTex(128, 128, c => drawOrb(c, 64, 64, 1.9));
    tex.wheel = canvasTex(128, 128, paintWheel);
    tex.heart = canvasTex(256, 320, paintHeart);
    tex.fog = radial('16,10,26', 0.6);
    tex.ring = canvasTex(256, 256, (c, w, h) => { c.strokeStyle = 'rgba(255,255,255,1)'; c.lineWidth = 10; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 12, 0, TAU); c.stroke(); const g = c.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.35)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  }
  const sprite = (map, o = {}) => { const m = new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, depthTest: o.depthTest ?? true, color: o.color ?? 0xffffff, opacity: o.opacity ?? 1, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, fog: o.fog ?? false }); const s = new THREE.Sprite(m); if (o.center) s.center.set(...o.center); scene.add(s); return s; };
  const flat = (map, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, color: o.color ?? 0xffffff, opacity: o.opacity ?? 1, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending })); m.rotation.x = -Math.PI / 2; scene.add(m); return m; };

  // ---------- Map aufbauen ----------
  function build(R) {
    disposeScene();
    sharedTex();
    _seed = 1234 + (R.li === 'endless' ? 99 : R.li) * 77;
    scene = new THREE.Scene();
    const th = THEMES[R.L.theme] || THEMES.gasse;
    const skyTex = canvasTex(1024, 512, paintSky(th));
    scene.background = skyTex;
    // gemalte Nachtkulisse hinter dem Feld (bei steilem Blick sieht man sonst keinen Himmel)
    built0 = new THREE.Mesh(new THREE.PlaneGeometry(40, 13), new THREE.MeshBasicMaterial({ map: skyTex, fog: false, depthWrite: false }));
    built0.position.set(4, 2.5, -7.5); built0.renderOrder = -10; scene.add(built0);
    scene.fog = new THREE.Fog(th.fog, 15, 34);
    scene.add(new THREE.HemisphereLight(0xb8c4d0, 0x242018, 1.2));
    const moon = new THREE.DirectionalLight(0xdce4f0, 1.5); moon.position.set(-3, 9, 7); scene.add(moon);
    const blocks = R.L.blocks || [];
    const top = canvasTex(1800, 1200, paintBoard(th, blocks));
    const soil = canvasTex(512, 64, (c, w, h) => { c.fillStyle = th.soil; c.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { c.fillStyle = rnd() < 0.5 ? 'rgba(90,76,58,.5)' : 'rgba(8,6,4,.5)'; c.fillRect(rnd() * w, rnd() * h, 3 + rnd() * 6, 2 + rnd() * 3); } });
    soil.wrapS = THREE.RepeatWrapping; soil.repeat.set(4, 1);
    const sideM = new THREE.MeshLambertMaterial({ map: soil });
    const board = new THREE.Mesh(new THREE.BoxGeometry(COLS, 0.34, ROWS), [sideM, sideM, new THREE.MeshLambertMaterial({ map: top }), sideM, sideM, sideM]);
    board.position.set(COLS / 2, -0.17, ROWS / 2); scene.add(board);
    const gtex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#16181a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = rnd() < 0.5 ? 'rgba(60,64,58,.4)' : 'rgba(0,0,0,.4)'; c.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 1 + rnd() * 2); } });
    gtex.wrapS = gtex.wrapT = THREE.RepeatWrapping; gtex.repeat.set(14, 14);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 18), new THREE.MeshLambertMaterial({ map: gtex, color: 0x8a8e88 })); ground.rotation.x = -Math.PI / 2; ground.position.set(4.5, -0.34, 5.5); scene.add(ground);
    const hz = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), new THREE.MeshBasicMaterial({ map: canvasTex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(10,10,14,0)'); g.addColorStop(0.6, 'rgba(10,10,14,.85)'); g.addColorStop(1, 'rgba(10,10,14,1)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, fog: false }));
    hz.rotation.x = -Math.PI / 2; hz.position.set(4.5, -0.33, -3.4); scene.add(hz);
    // Weg der Lichträder + Lichtherz links
    const path = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.26, ROWS + 0.1), new THREE.MeshLambertMaterial({ color: 0x3a3832 })); path.position.set(-0.56, -0.18, ROWS / 2); scene.add(path);
    built = { th, heart: null, heartGlow: null, carts: [], blocks: [], dark: null, darkData: null, fogs: [], hover: null, ghost: null, ghostId: null };
    built.heartGlow = flat(tex.glow, { color: 0xffd890, opacity: 0.55, add: true }); built.heartGlow.position.set(-1.45, 0.02, ROWS / 2); built.heartGlow.scale.set(3.6, 6, 1);
    built.heart = sprite(tex.heart, { center: [0.5, 0.08] }); built.heart.position.set(-1.5, 0, ROWS / 2); built.heart.scale.set(1.3, 1.65, 1); built.heart.renderOrder = 50;
    for (let r = 0; r < ROWS; r++) { const s = sprite(tex.wheel, { add: true }); s.scale.set(0.62, 0.62, 1); s.renderOrder = 60 + r * 10; built.carts.push(s); }
    // Hindernisse
    for (const [q, r, type] of blocks) { if (type === 'pool') continue; const s = sprite(canvasTex(256, 256, paintBlock(type)), { center: [0.5, 0.06], color: 0xb8b8c0 }); s.position.set(q + 0.5, 0, r + 0.5); s.scale.set(0.95, 0.95, 1); s.renderOrder = 100 + Math.round((r + 0.5) * 40) * 10 - 3; built.blocks.push(s); }
    // Dunkelheit pro Feld
    built.darkData = new Uint8Array(COLS * ROWS * 4);
    const dt = new THREE.DataTexture(built.darkData, COLS, ROWS, THREE.RGBAFormat); dt.magFilter = THREE.LinearFilter; dt.minFilter = THREE.LinearFilter; dt.needsUpdate = true;
    built.dark = new THREE.Mesh(new THREE.PlaneGeometry(COLS, ROWS), new THREE.MeshBasicMaterial({ map: dt, transparent: true, depthWrite: false }));
    built.dark.rotation.x = -Math.PI / 2; built.dark.position.set(COLS / 2, 0.012, ROWS / 2); built.dark.renderOrder = 5; scene.add(built.dark);
    // Schattennebel rechts
    for (let i = 0; i < 12; i++) { const s = sprite(tex.fog, { opacity: 0.55 + rnd() * 0.3 }); s.position.set(COLS + 0.4 + rnd() * 2.6, 0.3 + rnd() * 0.6, -0.3 + rnd() * (ROWS + 0.6)); const k = 1.6 + rnd() * 1.6; s.scale.set(k * 1.6, k, 1); s.renderOrder = 900; s.userData.p = rnd() * 6; s.userData.x = s.position.x; built.fogs.push(s); }
    // Markierung beim Setzen
    built.hover = flat(tex.soft, { color: 0xbfe89a, opacity: 0.3 }); built.hover.position.y = 0.02; built.hover.scale.set(1.1, 1.1, 1); built.hover.visible = false; built.hover.renderOrder = 6;
    built.ghost = sprite(null, { opacity: 0.55, center: [0.5, 0.07] }); built.ghost.visible = false; built.ghost.renderOrder = 4000;
    fit();
  }
  function disposeScene() {
    for (const v of views.values()) disposeView(v);
    views.clear(); fxViews.length = 0; texts.length = 0;
    if (scene) scene.traverse(o => { o.geometry?.dispose?.(); const m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach(mm => { if (mm.map && !Object.values(tex).includes(mm.map)) mm.map.dispose(); mm.dispose(); }); });
    scene = null; built = null;
  }

  // ---------- Kamera so einpassen, dass das Brett zwischen die Leisten passt ----------
  const pitch = 0.98, target = new THREE.Vector3(3.7, 0.2, ROWS / 2);
  function fit() {
    if (!W || !H) return;
    camera.aspect = W / H;
    const top = ins.top || 0, bot = ins.bottom || 0, freeH = Math.max(80, H - top - bot);
    camera.setViewOffset(W, H, 0, (bot - top) / 2, W, H);
    const pts = [[-2.05, 0, 0], [COLS + 0.25, 0, 0], [-2.05, 0, ROWS + 0.15], [COLS + 0.25, 0, ROWS + 0.15], [-1.5, 1.7, ROWS / 2], [0.5, 1.25, 0.1], [COLS - 0.5, 1.25, 0.1]].map(p => new THREE.Vector3(...p));
    const dir = new THREE.Vector3(0, Math.sin(pitch), Math.cos(pitch));
    const ok = d => {
      camera.position.copy(target).addScaledVector(dir, d); camera.lookAt(target); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
      const lim = freeH / H;
      return pts.every(p => { const v = p.clone().project(camera); return Math.abs(v.x) <= 0.98 && v.y <= lim * 0.98 + (bot - top) / H && v.y >= -lim * 0.98 + (bot - top) / H; });
    };
    let lo = 5, hi = 60;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (ok(m)) hi = m; else lo = m; }
    ok(hi);
    if (built0) { built0.lookAt(camera.position); const d = camera.position.distanceTo(built0.position), hh = 2 * Math.tan(camera.fov * Math.PI / 360) * d; built0.scale.set(hh * camera.aspect * 1.25 / 40, hh * 1.1 / 13, 1); }
  }

  // ---------- Figuren ----------
  function makeView(id, kind) {
    const d = CHARS[id], k = PXK();
    const cv = document.createElement('canvas'); cv.width = Math.ceil(d.w * k); cv.height = Math.ceil(d.h * k);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const sp = sprite(t, { center: [0.5 + (d.ox || 0) / d.w, d.foot / d.h] });
    sp.scale.set(d.w * U, d.h * U, 1);
    const v = { id, d, cv, t, sp, k, kind, pop: 0, last: -9 };
    if (kind === 'foe') { v.sh = flat(tex.shadow, { opacity: 0.7 }); v.sh.renderOrder = 7; }
    else { v.glow = flat(tex.glow, { color: new THREE.Color(T[id].accent), opacity: 0.32, add: true }); v.glow.renderOrder = 8; }
    return v;
  }
  function disposeView(v) {
    for (const o of [v.sp, v.sh, v.glow]) if (o) { scene?.remove(o); o.geometry?.dispose?.(); o.material.dispose(); }
    v.t.dispose();
  }
  const ro = (z, add) => 100 + Math.round(z * 40) * 10 + add;

  function syncUnits(dt) {
    const seen = new Set();
    for (const u of game.towers) {
      seen.add(u.uid);
      let v = views.get(u.uid);
      if (!v) { v = makeView(u.id, 'unit'); views.set(u.uid, v); puff(u.x, u.z, T[u.id].accent); }
      v.pop = Math.min(1, v.pop + dt * 4);
      const st = { mode: u.st.mode, mt: u.st.mt, heat: u.st.heat, dmg: u.st.dmg, flashT: u.st.flashT, flash: u.flashT > 0.06 ? 1 : 0 };
      if (u.st.flashT) u.st.flashT = Math.max(0, u.st.flashT - dt);
      const busy = st.mode === 'act' || st.flash || v.pop < 1;
      const every = busy ? 1 : quality() === 'niedrig' ? 4 : 2;
      if (frameNo - v.last >= every || v.last < 0) { render(v.cv, u.id, clock + u.uid * 0.37, st, v.k); v.t.needsUpdate = true; v.last = frameNo; }
      const p = v.pop, s = p < 1 ? 0.3 + 0.7 * (1 - Math.pow(1 - p, 3)) + Math.sin(p * Math.PI) * 0.12 : 1;
      v.sp.scale.set(v.d.w * U * s, v.d.h * U * s, 1);
      v.sp.position.set(u.x, 0, u.z); v.sp.renderOrder = ro(u.z, 0);
      const night = game.run?.night ? 0.8 : 1, L = u.s.light * night;
      v.glow.position.set(u.x, 0.03, u.z); v.glow.scale.set(L * 2.4, L * 2.0, 1); v.glow.material.opacity = 0.3 * p;
      // Abriss-Markierung
      const shovel = selRef?.shovel && selRef.hover && selRef.hover.c === u.c && selRef.hover.r === u.r;
      v.sp.material.color.setRGB(1, shovel ? 0.55 : 1, shovel ? 0.5 : 1);
    }
    for (const [uid, v] of views) if (v.kind === 'unit' && !seen.has(uid)) { puff(v.sp.position.x, v.sp.position.z, '#ffe8b0', true); disposeView(v); views.delete(uid); }
  }
  function syncFoes(dt) {
    const seen = new Set();
    for (const e of game.enemies) {
      seen.add(e.uid);
      let v = views.get(e.uid);
      if (!v) { v = makeView(e.type, 'foe'); views.set(e.uid, v); }
      const every = quality() === 'niedrig' ? 3 : e.st.mode === 'walk' && !e.st.flash ? 2 : 1;
      if (frameNo - v.last >= every || v.last < 0) { render(v.cv, e.type, clock + e.seed, e.st, v.k); rimRed(v.cv, 2.2 * v.k); v.t.needsUpdate = true; v.last = frameNo; }
      const x = e.x, z = e.r + 0.5, y = e.air ? 0.15 : e.y || 0;
      v.sp.position.set(x, y, z); v.sp.renderOrder = ro(z, 5);
      const L = game.lightAt ? game.lightAt(e.x, e.r) : 1, k = 0.5 + 0.5 * L;
      v.sp.material.color.setRGB(k, k, k * 1.05);
      v.sp.material.opacity = e.st.mode === 'gone' ? 0 : 1;
      v.sh.position.set(x + 0.04, 0.015, z); const ss = (e.boss ? 1.4 : 0.8) * (e.air ? 0.6 : 1); v.sh.scale.set(ss, ss * 0.4, 1); v.sh.material.opacity = (e.dead ? Math.max(0, 0.7 - e.st.mt * 0.6) : 0.7) * (e.air ? 0.5 : 1);
    }
    for (const [uid, v] of views) if (v.kind === 'foe' && !seen.has(uid)) { disposeView(v); views.delete(uid); }
  }

  // ---------- Geschosse, Tropfen, Effekte ----------
  const pViews = new Map(), dViews = new Map();
  function syncProjectiles() {
    const seen = new Set();
    for (const p of game.projectiles) {
      seen.add(p);
      let s = pViews.get(p);
      if (!s) {
        const map = { bolt: tex.bolt, ice: tex.ice, prism: tex.prism, falcon: tex.falcon, lob: tex.lob, moon: tex.moon, wisp: tex.wisp }[p.kind] || tex.bolt;
        s = sprite(map, { add: p.kind !== 'lob', color: { bolt: 0xffc860, falcon: 0xffe0a0, ice: 0x9fd4ff, prism: 0xe0f8ff }[p.kind] ?? 0xffffff });
        const sz = { lob: [0.42, 0.42], moon: [0.8, 0.8], wisp: [0.5, 0.5] }[p.kind] || [0.62, 0.31];
        s.scale.set(...sz); s.renderOrder = 3000; pViews.set(p, s);
      }
      s.visible = !(p.delay > 0);
      s.position.set(p.x, p.y, p.z ?? p.r + 0.5);
      if (p.kind === 'lob') s.material.rotation += 0.2;
    }
    for (const [p, s] of pViews) if (!seen.has(p)) { scene.remove(s); s.material.dispose(); pViews.delete(p); }
    const dseen = new Set();
    for (const d of game.drops) {
      dseen.add(d.id);
      let s = dViews.get(d.id);
      if (!s) { s = sprite(tex.drop, { add: false }); s.scale.set(0.55, 0.55, 1); s.renderOrder = 3500; s.userData.id = d.id; dViews.set(d.id, s); }
      const bob = Math.sin(clock * 3 + d.id) * 0.05;
      s.position.set(d.x, d.y + bob, d.z + 0.05);
      const k = 1 + Math.sin(clock * 5 + d.id) * 0.05; s.scale.set(0.55 * k, 0.55 * k, 1);
      s.material.opacity = d.t > 5 ? Math.max(0, 6 - d.t) : 1;
    }
    for (const [id, s] of dViews) if (!dseen.has(id)) { scene.remove(s); s.material.dispose(); dViews.delete(id); }
  }
  const COL = { bolt: '#ffd27a', ice: '#a8dcff', prism: '#e8fbff', falcon: '#fff0c0', jade: '#90ffd0' };
  function puff(x, z, col, big) {
    for (let i = 0; i < (big ? 8 : 5); i++) { const s = sprite(tex.glow, { add: true, color: new THREE.Color(col), opacity: 0.8 }); s.position.set(x + (Math.random() - 0.5) * 0.4, 0.3, z + (Math.random() - 0.5) * 0.2); s.renderOrder = 3600; fxViews.push({ s, t: 0, T: 0.6, vx: (Math.random() - 0.5) * 0.9, vy: 0.5 + Math.random() * 0.6, sz: 0.25 }); }
  }
  function burst(x, y, z, col, sz = 0.5, T = 0.35) { const s = sprite(tex.glow, { add: true, color: new THREE.Color(col) }); s.position.set(x, y, z); s.renderOrder = 3700; fxViews.push({ s, t: 0, T, grow: sz }); }
  const seenFx = new WeakSet();
  function syncFx() {
    for (const f of game.fx) {
      if (seenFx.has(f)) continue; seenFx.add(f);
      if (f.kind === 'spark') burst(f.x, f.y ?? 0.6, f.z, COL[f.col] || '#ffe0a0', 0.45, 0.25);
      else if (f.kind === 'ember') { burst(f.x, 0.4, f.z, '#ff9a40', 1.2, 0.45); }
      else if (f.kind === 'moonBoom') burst(f.x, 0.6, f.z, '#ff4040', 1.6 + f.r, 0.5);
      else if (f.kind === 'lance') { const s = sprite(tex.soft, { add: true, color: new THREE.Color('#fff2c8') }); const len = f.x1 - f.x0; s.position.set(f.x0 + len / 2, 0.75, f.z); s.scale.set(len, 0.22, 1); s.renderOrder = 3700; fxViews.push({ s, t: 0, T: f.max, beam: [len, 0.22] }); }
      else if (f.kind === 'pulse') { const m = flat(tex.ring, { add: true, color: new THREE.Color('#a8d4ff') }); m.position.set(f.x + f.r / 2, 0.05, f.z); m.renderOrder = 3650; fxViews.push({ s: m, t: 0, T: f.max, ring: f.r * 2.4 }); }
      else if (f.kind === 'star') { const s = sprite(tex.glow, { add: true, color: new THREE.Color('#d8c8ff') }); s.position.set(f.x, 0.6, f.z); s.renderOrder = 3700; fxViews.push({ s, t: 0, T: f.max, grow: 3 }); const st = sprite(tex.soft, { add: true, color: new THREE.Color('#ffffff') }); st.position.set(f.x, 0.5, f.z); st.scale.set(0.12, 3.2, 1); st.center.set(0.5, 0); st.renderOrder = 3700; fxViews.push({ s: st, t: 0, T: 0.35 }); shakeT = Math.max(shakeT, 0.25); }
    }
    for (let i = fxViews.length - 1; i >= 0; i--) {
      const f = fxViews[i]; f.t += lastDt; const k = f.t / f.T;
      if (k >= 1) { scene.remove(f.s); f.s.geometry?.dispose?.(); f.s.material.dispose(); fxViews.splice(i, 1); continue; }
      if (f.vx != null) { f.s.position.x += f.vx * lastDt; f.s.position.y += f.vy * lastDt; const s = f.sz * (1 + k * 2); f.s.scale.set(s, s, 1); f.s.material.opacity = 0.8 * (1 - k); }
      else if (f.ring) { const s = f.ring * (0.2 + k); f.s.scale.set(s, s * 0.8, 1); f.s.material.opacity = 1 - k; }
      else if (f.beam) { f.s.scale.set(f.beam[0], f.beam[1] * (1 - k * 0.6), 1); f.s.material.opacity = 1 - k; }
      else { const s = (f.grow || 0.5) * (0.4 + k); f.s.scale.set(s, s, 1); f.s.material.opacity = 1 - k; }
    }
  }
  game.on('collect', d => { texts.push({ x: d.x, y: d.y + 0.3, z: d.z, t: 0, s: `+${d.v}`, col: '#ffe9a8' }); });
  game.on('coreHit', () => { shakeT = Math.max(shakeT, 0.3); if (built) built.heartHit = 0.5; });
  game.on('boom', b => { if (b.big) shakeT = Math.max(shakeT, 0.3); burst(b.x, 0.6, b.z, b.big ? '#fff0d0' : '#ffb060', b.big ? 3 : 1.2, b.big ? 0.6 : 0.4); });

  function updateDark() {
    const R = game.run; if (!R || !built) return;
    const D = built.darkData;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const L = R.light[r * COLS + c], i = ((ROWS - 1 - r) * COLS + c) * 4;
      D[i] = 8; D[i + 1] = 6; D[i + 2] = 22; D[i + 3] = Math.round((1 - L) * 0.78 * 255);
    }
    built.dark.material.map.needsUpdate = true;
  }

  // ---------- Zeiger ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), groundPl = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  function pick(x, y) {
    if (!scene) return null;
    ndc.set(x / W * 2 - 1, -(y / H) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    for (const [id, s] of dViews) { if (ray.intersectObject(s).length) return { inside: true, drop: id }; }
    // Tropfen etwas großzügiger treffen
    let best = null, bd = 0.32;
    for (const [id, s] of dViews) { const v = s.position.clone().project(camera); const d = Math.hypot((v.x - ndc.x) * W / 2, (v.y - ndc.y) * H / 2) / Math.min(W, H); if (d < bd) { bd = d; best = id; } }
    if (best != null && bd < 0.05) return { inside: true, drop: best };
    const p = new THREE.Vector3(); if (!ray.ray.intersectPlane(groundPl, p)) return { inside: false };
    const c = Math.floor(p.x), r = Math.floor(p.z);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return { inside: false, x: p.x, z: p.z };
    return { inside: true, c, r };
  }

  // ---------- Frame ----------
  let lastDt = 0, selRef = null, lastRun = null, darkT = 0;
  function frame(dt, sel) {
    const R = game.run;
    lastDt = dt; selRef = sel;
    if (!R) { if (scene) disposeScene(); lastRun = null; return; }
    if (R !== lastRun) { lastRun = R; build(R); }
    frameNo++; clock += dt;
    darkT -= dt; if (darkT <= 0) { darkT = 0.12; updateDark(); }
    syncUnits(dt); syncFoes(dt); syncProjectiles(); syncFx();
    // Lichträder
    for (let r = 0; r < ROWS; r++) { const c = R.carts[r], s = built.carts[r]; s.visible = c.state !== 'used'; s.position.set(c.x, 0.32 + Math.sin(clock * 2 + r) * 0.03, r + 0.5); s.material.rotation = c.state === 'go' ? -clock * 12 : Math.sin(clock + r) * 0.2; }
    // Lichtherz pulsiert, flackert bei Treffern
    const hk = R.coreHp / R.coreMax, beat = 1 + Math.sin(clock * 2.4) * 0.03;
    built.heart.scale.set(1.3 * beat, 1.65 * beat, 1);
    built.heartHit = Math.max(0, (built.heartHit || 0) - dt);
    const hc = 0.45 + 0.55 * hk; built.heart.material.color.setRGB(1, hc + (built.heartHit > 0 ? 0 : 0), hc * (built.heartHit > 0 ? 0.6 : 1));
    built.heartGlow.material.opacity = 0.25 + 0.35 * hk + Math.sin(clock * 2.4) * 0.05;
    for (const s of built.fogs) { s.position.x = s.userData.x + Math.sin(clock * 0.3 + s.userData.p) * 0.4; }
    // Setzen: Markierung + Vorschau
    const h = sel?.hover;
    if ((sel?.place || sel?.shovel) && h && h.inside && h.c != null) {
      built.hover.visible = true; built.hover.position.set(h.c + 0.5, 0.02, h.r + 0.5);
      const bad = sel.place ? !!game.placeCheck(sel.place, h.c, h.r) : !game.unitAt(h.c, h.r);
      built.hover.material.color.set(sel.shovel ? 0xff9070 : bad ? 0xff6050 : 0xbfe89a);
      if (sel.place && !bad) {
        if (built.ghostId !== sel.place) { built.ghostId = sel.place; const d = CHARS[sel.place]; const cv = document.createElement('canvas'); cv.width = Math.ceil(d.w * 0.8); cv.height = Math.ceil(d.h * 0.8); render(cv, sel.place, 0.5, { mode: 'idle' }, 0.8); built.ghost.material.map?.dispose(); built.ghost.material.map = new THREE.CanvasTexture(cv); built.ghost.material.map.colorSpace = THREE.SRGBColorSpace; built.ghost.material.needsUpdate = true; built.ghost.center.set(0.5 + (d.ox || 0) / d.w, d.foot / d.h); built.ghost.scale.set(d.w * U, d.h * U, 1); }
        built.ghost.visible = true; built.ghost.position.set(h.c + 0.5, 0, h.r + 0.5); built.ghost.material.opacity = 0.45 + Math.sin(clock * 5) * 0.08;
      } else built.ghost.visible = false;
    } else { built.hover.visible = false; built.ghost.visible = false; }
    // Wackeln
    shakeT = Math.max(0, shakeT - dt);
    const sx = shakeT > 0 && game.meta.settings.shake !== 'off' ? Math.sin(clock * 80) * shakeT * 0.12 : 0;
    camera.position.x += sx;
    renderer.render(scene, camera);
    camera.position.x -= sx;
  }
  function drawOverlay(ctx, w, h, dpr) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!scene) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Lebensbalken angeknabberter Wächter
    for (const u of game.towers) {
      if (u.hp >= u.maxHp || u.def.kind === 'bomb') continue;
      const v = new THREE.Vector3(u.x, 1.15, u.z).project(camera), x = (v.x + 1) / 2 * w, y = (1 - v.y) / 2 * h, bw = 34;
      ctx.fillStyle = 'rgba(8,6,10,.75)'; ctx.fillRect(x - bw / 2 - 1, y - 1, bw + 2, 6);
      ctx.fillStyle = u.hp / u.maxHp > 0.4 ? '#ffd27a' : '#ff7050'; ctx.fillRect(x - bw / 2, y, bw * Math.max(0, u.hp / u.maxHp), 4);
    }
    // +Licht-Zahlen
    ctx.font = '700 15px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center';
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i]; t.t += lastDt; if (t.t > 0.9) { texts.splice(i, 1); continue; }
      const v = new THREE.Vector3(t.x, t.y + t.t * 0.6, t.z).project(camera), x = (v.x + 1) / 2 * w, y = (1 - v.y) / 2 * h;
      ctx.globalAlpha = 1 - t.t / 0.9; ctx.fillStyle = '#1a1206'; ctx.fillText(t.s, x + 1, y + 1); ctx.fillStyle = t.col; ctx.fillText(t.s, x, y);
    }
    ctx.globalAlpha = 1;
  }
  function resize(cssW, cssH, dpr, insets) {
    W = cssW; H = cssH; if (insets) ins = insets;
    renderer.setPixelRatio(Math.min(2, dpr || 1));
    renderer.setSize(cssW, cssH, false);
    fit();
  }
  return { renderer, frame, drawOverlay, resize, pick, toScreen: (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(camera); return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H }; }, destroy() { disposeScene(); renderer.dispose(); } };
}
