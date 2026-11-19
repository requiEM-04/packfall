// Packfall – 3D-Schlachtfeld (Three.js): sauberes Raster-Brett, maschinelle Türme mit 5 sichtbaren Ausbaustufen,
// Gegner mit rötlicher Kontur, Kern, Effekte. Dazu ein Icon-Renderer für Karten/Menüs.
import * as THREE from './vendor/three.module.min.js';
import { COLS, ROWS, T, ENEMIES, THEMES } from './core.js?v=0.11-ca2fa47a';

const V3 = THREE.Vector3;
const C = { steel: '#4d545c', dark: '#2b2f34', iron: '#3a3f45', brass: '#a88f5e', copper: '#9a6a4c', stone: '#5a5650', stoneD: '#3d3b37', black: '#17181b', olive: '#4c5246', rust: '#6e4232', gold: '#c7a456' };

// ---------- Materialien ----------
let MAT = null;
function mats() {
  if (MAT) return MAT;
  MAT = {
    metal: new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.72, roughness: 0.36 }),
    paint: new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.18, roughness: 0.6 }),
    dark: new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.05, roughness: 0.9 }),
    glow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    body: new THREE.MeshLambertMaterial({ vertexColors: true }),
  };
  return MAT;
}
function outlineMat(color, w) {
  const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  m.onBeforeCompile = sh => {
    sh.uniforms.uW = { value: w };
    sh.vertexShader = 'uniform float uW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * uW;');
  };
  return m;
}
let HALO = null;
function haloTex() {
  if (HALO) return HALO;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  HALO = new THREE.CanvasTexture(c); HALO.colorSpace = THREE.SRGBColorSpace;
  return HALO;
}
function halo(color, size, opacity = 0.8) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, toneMapped: false }));
  s.scale.setScalar(size);
  return s;
}

// ---------- Baukasten: Teile mit Vertex-Farben zu wenigen Meshes verschmelzen ----------
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new V3(), _s = new V3();
function mergeGeos(list) {
  let n = 0; for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); m.setAttribute('color', new THREE.BufferAttribute(col, 3));
  m.computeBoundingSphere(); m.computeBoundingBox();
  return m;
}
class Kit {
  constructor() { this.parts = { metal: [], paint: [], dark: [], glow: [], body: [] }; }
  add(b, geo, c, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    geo.dispose();
    if (g.attributes.uv) g.deleteAttribute('uv');
    _m.compose(_p.set(p[0], p[1], p[2]), _q.setFromEuler(_e.set(r[0], r[1], r[2])), _s.set(s[0], s[1], s[2]));
    g.applyMatrix4(_m);
    const n = g.attributes.position.count, a = new Float32Array(n * 3), cc = new THREE.Color(c);
    for (let i = 0; i < n; i++) { a[i * 3] = cc.r; a[i * 3 + 1] = cc.g; a[i * 3 + 2] = cc.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    this.parts[b].push(g);
    return this;
  }
  box(b, w, h, d, c, p, r, s) { return this.add(b, new THREE.BoxGeometry(w, h, d), c, p, r, s); }
  cyl(b, rt, rb, h, seg, c, p, r, s) { return this.add(b, new THREE.CylinderGeometry(rt, rb, h, seg), c, p, r, s); }
  sph(b, rad, c, p, s, seg = 14) { return this.add(b, new THREE.SphereGeometry(rad, seg, Math.max(6, Math.round(seg * 0.7))), c, p, [0, 0, 0], s); }
  tor(b, R, tube, c, p, r, seg = 28) { return this.add(b, new THREE.TorusGeometry(R, tube, 8, seg), c, p, r); }
  cone(b, rad, h, seg, c, p, r, s) { return this.add(b, new THREE.ConeGeometry(rad, h, seg), c, p, r, s); }
  oct(b, rad, c, p, r, s) { return this.add(b, new THREE.OctahedronGeometry(rad, 0), c, p, r, s); }
  rock(b, rad, c, p, r, s) { return this.add(b, new THREE.DodecahedronGeometry(rad, 0), c, p, r, s); }
  geo(b) { return this.parts[b].length ? mergeGeos(this.parts[b]) : null; }
  build(shadow = true) {
    const M = mats(), g = new THREE.Group();
    for (const [k, list] of Object.entries(this.parts)) {
      if (!list.length) continue;
      const m = new THREE.Mesh(mergeGeos(list), M[k]);
      m.castShadow = shadow && k !== 'glow'; m.receiveShadow = k !== 'glow';
      g.add(m);
    }
    return g;
  }
}
const muted = (hex, k = 1) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return c; };

// =====================================================================
// TÜRME (jede Ausbaustufe sichtbar)
// =====================================================================
// Seltenheit sieht man: Sockel, Zierringe, Leuchtadern – je seltener, desto krasser
const RS = {
  common:    { base: '#3d3b37', plate: '#3a3f45', trim: '#a88f5e', trim2: '#c7a456', glow: null },
  rare:      { base: '#2c323a', plate: '#36404c', trim: '#7f97b4', trim2: '#a8c4e0', glow: '#6aa8ec' },
  epic:      { base: '#2a2434', plate: '#362c46', trim: '#8a74a8', trim2: '#b49ad8', glow: '#a874ff' },
  legendary: { base: '#3a3122', plate: '#4a3d26', trim: '#c9a456', trim2: '#f0d080', glow: '#ffcc55' },
  mythic:    { base: '#1e171b', plate: '#2c2228', trim: '#8a2a2a', trim2: '#c83a3a', glow: '#ff3232' },
};
function towerBase(k, d, lv, big = false) {
  const R = big ? 0.47 : 0.43, S = RS[d.rarity] || RS.common, rk = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 }[d.rarity] || 0;
  k.cyl('dark', R + 0.03, R + 0.07, 0.1, 8, S.base, [0, 0.05, 0], [0, Math.PI / 8, 0]);
  k.cyl('metal', R - 0.02, R + 0.01, 0.1, 8, S.plate, [0, 0.15, 0], [0, Math.PI / 8, 0]);
  k.cyl('metal', R - 0.01, R - 0.01, 0.022, 8, lv >= 3 ? S.trim2 : S.trim, [0, 0.21, 0], [0, Math.PI / 8, 0]);
  for (let i = 0; i <= lv; i++) { const a = (i - lv / 2) * 0.28; k.sph('glow', 0.026, S.glow || d.accent, [Math.sin(a) * (R + 0.015), 0.15, Math.cos(a) * (R + 0.015)], [1, 1, 1], 8); }
  if (lv >= 2) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; k.box('metal', 0.2, 0.08, 0.04, S.plate, [Math.sin(a) * (R + 0.02), 0.1, Math.cos(a) * (R + 0.02)], [0, a, 0]); }
  if (rk >= 1) k.tor('glow', R - 0.005, 0.009, S.glow, [0, 0.224, 0], [Math.PI / 2, 0, 0], 32);
  if (rk >= 2) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; k.box('glow', 0.012, 0.06, 0.09, S.glow, [Math.sin(a) * (R + 0.052), 0.06, Math.cos(a) * (R + 0.052)], [0, a, 0]); }
  if (rk === 3) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; k.cone('metal', 0.045, 0.2, 6, S.trim2, [Math.sin(a) * (R + 0.05), 0.2, Math.cos(a) * (R + 0.05)]); k.sph('glow', 0.018, S.glow, [Math.sin(a) * (R + 0.05), 0.31, Math.cos(a) * (R + 0.05)], [1, 1, 1], 6); }
  if (rk === 4) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; k.cone('metal', 0.04, 0.22 + (i % 2) * 0.1, 5, '#1a1418', [Math.sin(a) * (R + 0.06), 0.16, Math.cos(a) * (R + 0.06)], [Math.cos(a) * 0.25, 0, -Math.sin(a) * 0.25]); }
}
function rarityAura(root, ud, d) {
  if (d.rarity !== 'mythic' && d.rarity !== 'legendary') return;
  const S = RS[d.rarity], kr = new Kit();
  kr.tor('glow', 0.62, 0.008, S.glow, [0, 0, 0], [Math.PI / 2, 0, 0], 64);
  if (d.rarity === 'mythic') for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; kr.box('glow', 0.06, 0.006, 0.025, S.glow, [Math.sin(a) * 0.62, 0, Math.cos(a) * 0.62], [0, a, 0]); }
  const r = kr.build(false); r.position.y = 0.05; r.userData.orbit = 1; root.add(r); ud.rings.push(r);
  const h = halo(S.glow, 1.6, d.rarity === 'mythic' ? 0.28 : 0.16); h.position.y = 0.3; root.add(h); ud.halos.push(h); h.userData.base = 1;
}
function holder(parent, p) { const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); g.userData.p0 = g.position.clone(); parent.add(g); return g; }
function addMuzzle(ud, parent, p) { const o = new THREE.Object3D(); o.position.set(p[0], p[1], p[2]); parent.add(o); ud.muzzle = o; }

export function buildTower(id, lv = 0, mastery = 1) {
  const d = T[id], A = d.accent;
  const root = new THREE.Group();
  const BR = (RS[d.rarity] || RS.common).trim, GD = (RS[d.rarity] || RS.common).trim2;
  const kb = new Kit(); towerBase(kb, d, lv, id === 'haubitze'); root.add(kb.build());
  const head = new THREE.Group(); head.position.y = 0.22; root.add(head);
  const ud = { head, spin: [], recoil: [], rings: [], orbs: [], gears: [], press: null, smoke: [], muzzle: null, aimHead: true, halos: [] };
  const k = new Kit();
  const turntable = (r = 0.3) => { k.cyl('metal', r, r + 0.04, 0.08, 16, C.iron, [0, 0.04, 0]); k.tor('metal', r + 0.02, 0.012, BR, [0, 0.08, 0], [Math.PI / 2, 0, 0], 24); };
  switch (id) {
    case 'repetierer': {
      turntable(0.28);
      k.box('paint', 0.42, 0.26, 0.44, C.steel, [0, 0.21, -0.03]);
      k.box('metal', 0.45, 0.035, 0.47, lv >= 3 ? GD : BR, [0, 0.345, -0.03]);
      k.box('paint', 0.11, 0.14, 0.3, C.olive, [0.27, 0.17, -0.06]);
      k.sph('glow', 0.034, A, [-0.13, 0.29, 0.19], [1, 1, 1], 10);
      if (lv >= 1) k.box('metal', 0.5, 0.2, 0.04, C.iron, [0, 0.2, 0.2]);
      if (lv >= 3) { k.cyl('metal', 0.09, 0.09, 0.16, 14, BR, [-0.3, 0.2, -0.04], [0, 0, Math.PI / 2]); k.cyl('metal', 0.09, 0.09, 0.16, 14, BR, [0.36, 0.2, -0.04], [0, 0, Math.PI / 2]); }
      if (lv >= 4) { k.box('paint', 0.5, 0.1, 0.3, C.dark, [0, 0.4, -0.08]); k.sph('glow', 0.03, A, [0.13, 0.29, 0.19], [1, 1, 1], 10); }
      head.add(k.build());
      const n = [3, 4, 6, 6, 6][lv], len = [0.42, 0.46, 0.55, 0.56, 0.68][lv], clusters = lv >= 3 ? [-0.12, 0.12] : [0];
      for (const x of clusters) {
        const rec = holder(head, [x, 0.21, 0.2]);
        const sp = new THREE.Group(); rec.add(sp);
        const kk = new Kit();
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; kk.cyl('metal', 0.022, 0.024, len, 8, C.black, [Math.cos(a) * 0.05, Math.sin(a) * 0.05, len / 2], [Math.PI / 2, 0, 0]); }
        kk.cyl('metal', 0.075, 0.075, 0.04, 14, BR, [0, 0, len * 0.55], [Math.PI / 2, 0, 0]);
        kk.cyl('metal', 0.07, 0.07, 0.03, 14, C.iron, [0, 0, len - 0.02], [Math.PI / 2, 0, 0]);
        kk.cyl('metal', 0.08, 0.08, 0.1, 14, C.iron, [0, 0, 0.04], [Math.PI / 2, 0, 0]);
        sp.add(kk.build());
        ud.spin.push(sp); ud.recoil.push({ o: rec, amt: 0.05 });
      }
      addMuzzle(ud, head, [0, 0.21, 0.2 + len + 0.04]);
      break;
    }
    case 'moerser': {
      turntable(0.32);
      k.cyl('paint', 0.3, 0.34, 0.22, 16, C.steel, [0, 0.19, 0]);
      k.tor('metal', 0.31, 0.02, lv >= 3 ? GD : BR, [0, 0.3, 0], [Math.PI / 2, 0, 0]);
      k.box('metal', 0.12, 0.22, 0.12, C.iron, [-0.2, 0.36, -0.1]); k.box('metal', 0.12, 0.22, 0.12, C.iron, [0.2, 0.36, -0.1]);
      if (lv >= 2) for (let i = 0; i < 3; i++) k.sph('metal', 0.06, C.black, [-0.24 + i * 0.12, 0.33, -0.27], [1, 1, 1], 10);
      head.add(k.build());
      const tubes = lv >= 4 ? [[-0.09, 0.05], [0.09, 0.05], [-0.09, -0.11], [0.09, -0.11]] : lv >= 2 ? [[-0.1, 0], [0.1, 0]] : [[0, 0]];
      const r = lv >= 4 ? 0.075 : 0.1;
      const rec = holder(head, [0, 0.38, -0.05]);
      const piv = new THREE.Group(); piv.rotation.x = -0.85; rec.add(piv);
      const kk = new Kit();
      for (const [x, y] of tubes) {
        kk.cyl('metal', r, r * 1.15, 0.5, 16, C.dark, [x, y, 0.22], [Math.PI / 2, 0, 0]);
        kk.tor('metal', r + 0.01, 0.018, BR, [x, y, 0.46], [0, 0, 0], 18);
        if (lv >= 3) kk.tor('glow', r + 0.012, 0.012, '#e07a3a', [x, y, 0.28], [0, 0, 0], 18);
      }
      piv.add(kk.build());
      ud.recoil.push({ o: rec, amt: 0.06 });
      addMuzzle(ud, piv, [0, 0, 0.5]);
      break;
    }
    case 'praegewerk': {
      ud.aimHead = false;
      const w = 0.5 + lv * 0.03;
      k.box('paint', w + 0.08, 0.3, 0.5, '#4f453c', [0, 0.15, 0]);
      k.box('paint', w + 0.14, 0.04, 0.56, C.stoneD, [0, 0.31, 0]);
      k.box('dark', w + 0.1, 0.06, 0.4, '#2c2622', [0, 0.36, -0.03], [0.3, 0, 0]);
      k.box('glow', 0.14, 0.1, 0.02, '#e09a4a', [0.12, 0.1, 0.255]);
      k.box('metal', 0.18, 0.14, 0.02, C.iron, [0.12, 0.1, 0.25]);
      k.cyl('metal', 0.06, 0.06, 0.04, 16, GD, [-0.14, 0.33, 0.18]); k.cyl('metal', 0.06, 0.06, 0.04, 16, GD, [-0.14, 0.37, 0.18]);
      const chim = lv >= 1 ? [[-0.2, -0.14], [0.2, -0.14]] : [[-0.2, -0.14]];
      if (lv >= 3) chim.push([0, -0.18]);
      for (const [x, z] of chim) { k.cyl('paint', 0.05, 0.06, 0.5 + lv * 0.04, 10, C.stoneD, [x, 0.42, z]); k.cyl('metal', 0.065, 0.065, 0.04, 10, BR, [x, 0.66 + lv * 0.02, z]); ud.smoke.push(new V3(x, 0.92 + lv * 0.04, z)); }
      if (lv >= 4) { k.sph('metal', 0.14, GD, [0.12, 0.42, 0.02], [1, 0.8, 1], 18); k.sph('glow', 0.03, '#f2d48a', [0.12, 0.54, 0.02], [1, 1, 1], 8); }
      if (lv >= 2) for (let i = 0; i < 3; i++) k.box('glow', 0.05, 0.06, 0.01, '#d9a050', [-0.18 + i * 0.12, 0.22, 0.255]);
      head.add(k.build());
      const gear = new THREE.Group(); gear.position.set(w / 2 + 0.06, 0.18, 0.06); head.add(gear);
      const kg = new Kit();
      kg.cyl('metal', 0.13, 0.13, 0.04, 20, BR, [0, 0, 0], [0, 0, Math.PI / 2]);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; kg.box('metal', 0.04, 0.05, 0.05, BR, [0, Math.cos(a) * 0.15, Math.sin(a) * 0.15], [a, 0, 0]); }
      kg.cyl('metal', 0.03, 0.03, 0.08, 10, C.iron, [0, 0, 0], [0, 0, Math.PI / 2]);
      gear.add(kg.build()); ud.gears.push(gear);
      if (lv >= 2) {
        const press = holder(head, [-0.12, 0.42, 0.18]);
        const kp = new Kit(); kp.box('metal', 0.1, 0.16, 0.1, C.iron, [0, 0.08, 0]); kp.cyl('metal', 0.02, 0.02, 0.2, 8, C.steel, [0, 0.24, 0]);
        press.add(kp.build()); ud.press = press;
      }
      break;
    }
    case 'frostwerfer': {
      turntable(0.29);
      k.box('paint', 0.36, 0.2, 0.34, C.steel, [0, 0.17, -0.04]);
      const tanks = lv >= 4 ? [-0.2, 0, 0.2] : [-0.13, 0.13];
      for (const x of tanks) { k.cyl('glow', 0.07, 0.07, 0.26, 14, '#7fb6c8', [x, 0.36, -0.14]); k.cyl('metal', 0.085, 0.085, 0.04, 14, BR, [x, 0.5, -0.14]); k.cyl('metal', 0.085, 0.085, 0.04, 14, BR, [x, 0.22, -0.14]); }
      if (lv >= 4) for (let i = 0; i < 4; i++) k.oct('glow', 0.05, '#cfeff7', [-0.18 + i * 0.12, 0.33, 0.12], [0, 0, 0], [0.6, 1.6, 0.6]);
      head.add(k.build());
      const rec = holder(head, [0, 0.2, 0.12]);
      const kk = new Kit();
      const len = 0.32 + lv * 0.03;
      kk.cyl('metal', 0.06, 0.07, len, 14, C.iron, [0, 0, len / 2], [Math.PI / 2, 0, 0]);
      kk.cone('metal', 0.1, 0.12, 14, C.steel, [0, 0, len + 0.04], [-Math.PI / 2, 0, 0]);
      kk.cyl('glow', 0.045, 0.045, 0.02, 12, '#cfeff7', [0, 0, len + 0.1], [Math.PI / 2, 0, 0]);
      if (lv >= 2) for (let i = 0; i < 3; i++) kk.tor('glow', 0.075, 0.012, '#9fd2e2', [0, 0, 0.1 + i * 0.08], [0, 0, 0], 16);
      rec.add(kk.build());
      ud.recoil.push({ o: rec, amt: 0.04 });
      addMuzzle(ud, rec, [0, 0, len + 0.12]);
      break;
    }
    case 'flammer': {
      turntable(0.29);
      k.box('paint', 0.36, 0.22, 0.32, C.dark, [0, 0.17, 0]);
      const tanks = lv >= 3 ? [-0.14, 0, 0.14] : [-0.09, 0.09];
      for (const x of tanks) { k.cyl('paint', 0.075, 0.075, 0.34, 14, C.rust, [x, 0.33, -0.16], [Math.PI / 2, 0, 0]); k.sph('paint', 0.075, C.rust, [x, 0.33, -0.33], [1, 1, 0.6], 12); k.tor('metal', 0.078, 0.01, BR, [x, 0.33, -0.08], [0, 0, 0], 14); }
      if (lv >= 2) k.box('metal', 0.42, 0.24, 0.04, C.iron, [0, 0.22, 0.17]);
      head.add(k.build());
      const noz = lv >= 4 ? [-0.07, 0.07] : [0];
      const rec = holder(head, [0, 0.2, 0.16]);
      const kk = new Kit();
      const len = 0.3 + lv * 0.04;
      for (const x of noz) {
        kk.cyl('metal', 0.035, 0.045, len, 10, C.black, [x, 0, len / 2], [Math.PI / 2, 0, 0]);
        kk.cyl('metal', 0.06, 0.05, 0.08, 12, C.copper, [x, 0, len], [Math.PI / 2, 0, 0]);
        kk.sph('glow', 0.03, '#ffb060', [x, 0, len + 0.06], [1, 1, 1], 8);
      }
      rec.add(kk.build());
      addMuzzle(ud, rec, [0, 0, len + 0.07]);
      break;
    }
    case 'tesla': {
      ud.aimHead = false;
      const H = 0.7 + lv * 0.08;
      k.cyl('metal', 0.16, 0.24, 0.16, 12, C.iron, [0, 0.08, 0]);
      k.cyl('metal', 0.045, 0.06, H, 10, C.copper, [0, H / 2, 0]);
      const rings = 3 + lv;
      for (let i = 0; i < rings; i++) { const y = 0.2 + i * (H - 0.25) / rings, r = 0.19 - i * 0.012; k.tor('metal', r, 0.03, C.copper, [0, y, 0], [Math.PI / 2, 0, 0], 22); }
      for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; k.cyl('metal', 0.015, 0.015, H * 0.7, 6, BR, [Math.sin(a) * 0.22, H * 0.35, Math.cos(a) * 0.22], [Math.cos(a) * 0.12, 0, -Math.sin(a) * 0.12]); }
      k.tor('metal', 0.14, 0.035, C.steel, [0, H + 0.02, 0], [Math.PI / 2, 0, 0], 20);
      if (lv >= 2) for (const x of [-0.3, 0.3]) { k.cyl('metal', 0.025, 0.035, 0.42, 8, C.copper, [x, 0.21, 0]); k.tor('metal', 0.07, 0.018, C.copper, [x, 0.3, 0], [Math.PI / 2, 0, 0], 14); k.sph('glow', 0.04, A, [x, 0.45, 0], [1, 1, 1], 10); }
      head.add(k.build());
      const orb = new Kit(); orb.sph('glow', 0.1 + lv * 0.012, '#d6e8ff', [0, 0, 0], [1, 1, 1], 18);
      const o = orb.build(false); o.position.y = H + 0.14; head.add(o); ud.orbs.push(o);
      const h = halo(A, 0.9 + lv * 0.1, 0.7); h.position.y = H + 0.14; head.add(h); ud.halos.push(h);
      if (lv >= 4) { const ring = new Kit(); ring.tor('glow', 0.3, 0.012, A, [0, 0, 0], [Math.PI / 2, 0, 0], 40); const rr = ring.build(false); rr.position.y = H - 0.05; head.add(rr); ud.rings.push(rr); }
      addMuzzle(ud, head, [0, H + 0.14, 0]);
      ud.zapY = 0.22 + H + 0.14;
      break;
    }
    case 'flak': {
      turntable(0.29);
      k.box('paint', 0.38, 0.18, 0.34, C.olive, [0, 0.15, 0]);
      k.box('paint', 0.1, 0.2, 0.22, C.olive, [-0.22, 0.27, 0]); k.box('paint', 0.1, 0.2, 0.22, C.olive, [0.22, 0.27, 0]);
      k.cyl('metal', 0.02, 0.02, 0.3, 6, C.iron, [-0.12, 0.38, -0.2]);
      head.add(k.build());
      const dish = new THREE.Group(); dish.position.set(-0.12, 0.55, -0.2); head.add(dish);
      const kd = new Kit(); kd.sph('metal', 0.11 + lv * 0.01, C.steel, [0, 0, 0.02], [1, 1, 0.35], 14); kd.sph('glow', 0.02, A, [0, 0, 0.08], [1, 1, 1], 6);
      dish.add(kd.build()); ud.gears.push(dish); dish.userData.axis = 'y';
      const rec = holder(head, [0.02, 0.3, 0.04]);
      const piv = new THREE.Group(); piv.rotation.x = -0.45; rec.add(piv);
      const kk = new Kit();
      const bar = lv >= 4 ? [[-0.07, 0.04], [0.07, 0.04], [-0.07, -0.04], [0.07, -0.04]] : lv >= 1 ? [[-0.06, 0], [0.06, 0]] : [[0, 0]];
      const len = 0.5 + lv * 0.05;
      kk.box('metal', 0.24, 0.14, 0.18, C.iron, [0, 0, 0]);
      for (const [x, y] of bar) { kk.cyl('metal', 0.022, 0.026, len, 8, C.black, [x, y, len / 2], [Math.PI / 2, 0, 0]); kk.cyl('metal', 0.032, 0.032, 0.07, 8, C.iron, [x, y, len - 0.03], [Math.PI / 2, 0, 0]); }
      if (lv >= 2) kk.box('metal', 0.3, 0.02, 0.14, BR, [0, 0.08, 0.02]);
      piv.add(kk.build());
      ud.recoil.push({ o: rec, amt: 0.04 });
      addMuzzle(ud, piv, [0, 0, len + 0.03]);
      break;
    }
    case 'railgun': {
      turntable(0.3);
      k.box('paint', 0.44, 0.16, 0.42, C.dark, [0, 0.14, -0.04]);
      k.box('metal', 0.18, 0.12, 0.14, C.iron, [-0.15, 0.27, -0.18]); k.box('metal', 0.18, 0.12, 0.14, C.iron, [0.15, 0.27, -0.18]);
      for (const x of [-0.15, 0.15]) k.box('glow', 0.12, 0.02, 0.1, A, [x, 0.34, -0.18]);
      head.add(k.build());
      const rec = holder(head, [0, 0.3, 0.02]);
      const kk = new Kit();
      const len = 0.75 + lv * 0.1;
      for (const x of [-0.075, 0.075]) { kk.box('metal', 0.05, 0.11, len, C.steel, [x, 0, len / 2 - 0.05]); kk.box('metal', 0.054, 0.02, len, lv >= 3 ? GD : BR, [x, 0.065, len / 2 - 0.05]); }
      const coils = 2 + lv;
      for (let i = 0; i < coils; i++) kk.tor('glow', 0.1, 0.016, A, [0, 0, 0.05 + i * (len - 0.15) / coils], [0, 0, 0], 18);
      kk.box('glow', 0.02, 0.02, len * 0.9, '#c8f4f4', [0, 0, len / 2 - 0.03]);
      if (lv >= 4) { kk.tor('metal', 0.16, 0.03, C.iron, [0, 0, 0.05], [0, 0, 0], 20); kk.tor('metal', 0.14, 0.025, C.iron, [0, 0, len - 0.12], [0, 0, 0], 20); }
      rec.add(kk.build());
      ud.recoil.push({ o: rec, amt: 0.12 });
      addMuzzle(ud, rec, [0, 0, len - 0.02]);
      break;
    }
    case 'raketenwerk': {
      turntable(0.3);
      k.box('paint', 0.3, 0.16, 0.3, C.iron, [0, 0.14, 0]);
      k.box('metal', 0.06, 0.24, 0.1, C.steel, [-0.2, 0.25, 0]); k.box('metal', 0.06, 0.24, 0.1, C.steel, [0.2, 0.25, 0]);
      head.add(k.build());
      const rec = holder(head, [0, 0.36, 0]);
      const piv = new THREE.Group(); piv.rotation.x = -0.35; rec.add(piv);
      const kk = new Kit();
      const n = T.raketenwerk.lv[lv].n, cols = n <= 2 ? 2 : n <= 4 ? 2 : 3, rows = Math.ceil(n / cols);
      const W = 0.16 * cols + 0.08, Hh = 0.16 * rows + 0.08;
      kk.box('paint', W, Hh, 0.42, C.olive, [0, 0, 0]);
      kk.box('metal', W + 0.02, 0.025, 0.44, BR, [0, Hh / 2, 0]);
      for (let i = 0; i < n; i++) { const cx = (i % cols - (cols - 1) / 2) * 0.16, cy = (Math.floor(i / cols) - (rows - 1) / 2) * 0.16; kk.cyl('metal', 0.06, 0.06, 0.03, 12, C.black, [cx, cy, 0.215], [Math.PI / 2, 0, 0]); kk.cone('paint', 0.045, 0.09, 10, '#9a3d34', [cx, cy, 0.24], [Math.PI / 2, 0, 0]); }
      if (lv >= 3) kk.sph('glow', 0.025, A, [W / 2 + 0.01, Hh / 2 - 0.04, 0.12], [1, 1, 1], 8);
      piv.add(kk.build());
      ud.recoil.push({ o: rec, amt: 0.04 });
      addMuzzle(ud, piv, [0, 0, 0.3]);
      break;
    }
    case 'verstaerker': {
      ud.aimHead = false;
      const H = 0.55 + lv * 0.05;
      k.cyl('paint', 0.12, 0.22, H, 6, C.stone, [0, H / 2, 0]);
      k.cyl('metal', 0.14, 0.14, 0.05, 6, BR, [0, H, 0]);
      for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; k.box('metal', 0.04, H * 0.8, 0.04, C.iron, [Math.sin(a) * 0.2, H * 0.4, Math.cos(a) * 0.2], [0, a, 0.12]); k.sph('glow', 0.025, A, [Math.sin(a) * 0.17, H * 0.82, Math.cos(a) * 0.17], [1, 1, 1], 8); }
      head.add(k.build());
      const ko = new Kit(); ko.oct('glow', 0.12 + lv * 0.01, '#d9c8ff', [0, 0, 0], [0, 0, 0], [1, 1.6, 1]);
      const o = ko.build(false); o.position.y = H + 0.24; head.add(o); ud.orbs.push(o); o.userData.spinY = 1;
      const h = halo(A, 1.0 + lv * 0.12, 0.65); h.position.y = H + 0.24; head.add(h); ud.halos.push(h);
      const nr = 1 + Math.floor(lv / 2);
      for (let i = 0; i < nr; i++) {
        const kr = new Kit(); kr.tor('glow', 0.24 + i * 0.07, 0.01, A, [0, 0, 0], [Math.PI / 2, 0, 0], 40);
        const r = kr.build(false); r.position.y = H + 0.24; r.rotation.x = 0.4 + i * 0.5; head.add(r); ud.rings.push(r);
      }
      addMuzzle(ud, head, [0, H + 0.24, 0]);
      break;
    }
    case 'laserlanze': {
      turntable(0.26);
      const H = 0.5 + lv * 0.04;
      k.cyl('metal', 0.07, 0.12, H, 10, C.steel, [0, H / 2 + 0.06, 0]);
      k.tor('metal', 0.1, 0.02, GD, [0, H * 0.5, 0], [Math.PI / 2, 0, 0], 16);
      for (const x of [-0.16, 0.16]) k.box('metal', 0.03, H * 0.6, 0.18, C.iron, [x, H * 0.4, -0.02]);
      head.add(k.build());
      const top = holder(head, [0, H + 0.12, 0]);
      const kk = new Kit();
      kk.sph('metal', 0.15, C.dark, [0, 0, -0.02], [1, 0.9, 1.2], 18);
      kk.cyl('metal', 0.07, 0.11, 0.24, 16, C.steel, [0, 0, 0.18], [Math.PI / 2, 0, 0]);
      kk.tor('metal', 0.09, 0.02, GD, [0, 0, 0.3], [0, 0, 0], 18);
      kk.sph('glow', 0.06, '#ff8a8a', [0, 0, 0.31], [1, 1, 0.5], 14);
      for (const x of [-1, 1]) kk.box('metal', 0.18, 0.02, 0.12, C.iron, [x * 0.17, 0, -0.04], [0, 0, x * 0.2]);
      if (lv >= 3) kk.box('glow', 0.32, 0.012, 0.012, A, [0, 0.07, 0]);
      top.add(kk.build());
      const h = halo('#ff6a6a', 0.45, 0.6); h.position.set(0, 0, 0.33); top.add(h); ud.halos.push(h); ud.lens = h;
      if (lv >= 2) for (let i = 0; i < (lv >= 4 ? 3 : 2); i++) { const kr = new Kit(); kr.oct('glow', 0.04, '#ffb0b0', [0.3, 0, 0], [0, 0, 0], [1, 1.6, 1]); const r = kr.build(false); r.rotation.y = i / 3 * Math.PI * 2; top.add(r); ud.rings.push(r); r.userData.orbit = 1; }
      addMuzzle(ud, top, [0, 0, 0.36]);
      ud.laserTop = top;
      break;
    }
    case 'plasmareaktor': {
      turntable(0.32);
      k.cyl('paint', 0.26, 0.32, 0.3, 6, '#2e252b', [0, 0.2, -0.08]);
      k.box('paint', 0.5, 0.12, 0.46, '#3a2e34', [0, 0.38, -0.05]);
      for (const sd of [-1, 1]) { k.box('paint', 0.08, 0.32, 0.42, '#2e252b', [sd * 0.29, 0.26, -0.04], [0, 0, sd * 0.12]); k.box('glow', 0.014, 0.26, 0.36, '#ff3b3b', [sd * 0.338, 0.27, -0.04], [0, 0, sd * 0.12]); }
      for (let i = 0; i < 3 + lv; i++) k.cone('metal', 0.03, 0.2, 5, BR, [-0.2 + i * 0.4 / (2 + lv), 0.5, -0.25], [-0.5, 0, 0]);
      head.add(k.build());
      const co = new Kit(); co.sph('glow', 0.11 + lv * 0.012, '#ff4545', [0, 0, 0], [1, 1, 1], 16);
      const cm = co.build(false); cm.position.set(0, 0.64, -0.08); head.add(cm); ud.orbs.push(cm);
      const hh = halo('#ff2a2a', 0.95 + lv * 0.12, 0.8); hh.position.copy(cm.position); head.add(hh); ud.halos.push(hh);
      for (let i = 0; i < 1 + Math.ceil(lv / 2); i++) { const kr = new Kit(); kr.tor('glow', 0.18 + i * 0.05, 0.012, '#ff5050', [0, 0, 0], [Math.PI / 2, 0, 0], 36); const rr = kr.build(false); rr.position.copy(cm.position); rr.rotation.x = 0.5 + i; head.add(rr); ud.rings.push(rr); }
      const rec = holder(head, [0, 0.3, 0.16]);
      const kk = new Kit(); const len = 0.44 + lv * 0.05;
      for (const x of lv >= 3 ? [-0.15, 0, 0.15] : [-0.1, 0.1]) {
        kk.box('paint', 0.075, 0.09, len, '#33292f', [x, 0, len / 2]);
        kk.box('glow', 0.018, 0.018, len * 0.9, '#ff3a3a', [x, 0.054, len / 2]);
        kk.cyl('metal', 0.05, 0.045, 0.08, 8, BR, [x, 0, len], [Math.PI / 2, 0, 0]);
        kk.sph('glow', 0.03, '#ff8a8a', [x, 0, len + 0.04], [1, 1, 1], 8);
      }
      rec.add(kk.build()); ud.recoil.push({ o: rec, amt: 0.06 }); addMuzzle(ud, rec, [0, 0, len + 0.06]);
      break;
    }
    case 'himmelsspeer': {
      ud.aimHead = false;
      const H = 0.9 + lv * 0.1;
      for (let i = 0; i < 4; i++) { const y0 = i * H / 4, w = 0.32 - i * 0.055; k.box('paint', w, H / 4 + 0.01, w, '#2e252b', [0, y0 + H / 8, 0], [0, i * 0.2, 0]); k.box('glow', w + 0.014, 0.014, w + 0.014, '#ff3a3a', [0, y0 + H / 4, 0], [0, i * 0.2, 0]); }
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; k.box('metal', 0.05, H * 0.7, 0.05, BR, [Math.sin(a) * 0.25, H * 0.35, Math.cos(a) * 0.25], [Math.cos(a) * 0.15, 0, -Math.sin(a) * 0.15]); k.sph('glow', 0.03, '#ff4a4a', [Math.sin(a) * 0.2, H * 0.72, Math.cos(a) * 0.2], [1, 1, 1], 8); }
      head.add(k.build());
      const ko = new Kit(); ko.oct('glow', 0.13 + lv * 0.015, '#ff5a5a', [0, 0, 0], [0, 0, 0], [1, 1.8, 1]);
      const o = ko.build(false); o.position.y = H + 0.34; head.add(o); ud.orbs.push(o); o.userData.spinY = 1;
      const hh = halo('#ff2a2a', 1.25 + lv * 0.15, 0.85); hh.position.y = H + 0.34; head.add(hh); ud.halos.push(hh);
      for (let i = 0; i < 2 + Math.floor(lv / 2); i++) { const kr = new Kit(); kr.tor('glow', 0.22 + i * 0.08, 0.012, '#ff4040', [0, 0, 0], [Math.PI / 2, 0, 0], 40); const rr = kr.build(false); rr.position.y = H + 0.34; rr.rotation.x = 0.3 + i * 0.6; head.add(rr); ud.rings.push(rr); }
      const bk = new Kit(); bk.cyl('glow', 0.012, 0.012, 2.5 + lv * 0.6, 6, '#ff6060', [0, (2.5 + lv * 0.6) / 2, 0]); const bm = bk.build(false); bm.position.y = H + 0.42; bm.userData.skip = true; head.add(bm);
      addMuzzle(ud, head, [0, H + 0.34, 0]);
      break;
    }
    case 'haubitze': {
      turntable(0.36);
      k.box('paint', 0.5, 0.26, 0.56, C.steel, [0, 0.2, -0.05]);
      k.box('metal', 0.56, 0.06, 0.2, C.iron, [0, 0.36, -0.18], [0.3, 0, 0]);
      k.box('metal', 0.08, 0.3, 0.4, C.iron, [-0.29, 0.2, -0.03]); k.box('metal', 0.08, 0.3, 0.4, C.iron, [0.29, 0.2, -0.03]);
      if (lv >= 2) for (let i = 0; i < 6; i++) k.sph('metal', 0.022, BR, [-0.3 + (i % 2) * 0.6, 0.12 + Math.floor(i / 2) * 0.08, 0.17], [1, 1, 1], 6);
      if (lv >= 4) k.box('glow', 0.36, 0.03, 0.02, A, [0, 0.27, 0.23]);
      head.add(k.build());
      const rec = holder(head, [0, 0.27, 0.1]);
      const piv = new THREE.Group(); piv.rotation.x = -0.3; rec.add(piv);
      const kk = new Kit();
      const len = 0.8 + lv * 0.06, r = 0.07 + lv * 0.006;
      kk.cyl('metal', r, r * 1.3, len, 16, C.dark, [0, 0, len / 2], [Math.PI / 2, 0, 0]);
      kk.cyl('metal', r * 1.5, r * 1.5, 0.16, 16, C.iron, [0, 0, 0.1], [Math.PI / 2, 0, 0]);
      kk.box('metal', r * 3.2, r * 1.6, 0.14, C.iron, [0, 0, len], [0, 0, 0]);
      if (lv >= 3) kk.tor('metal', r * 1.25, 0.02, GD, [0, 0, len * 0.6], [0, 0, 0], 16);
      piv.add(kk.build());
      ud.recoil.push({ o: rec, amt: 0.14 });
      addMuzzle(ud, piv, [0, 0, len + 0.1]);
      break;
    }
  }
  rarityAura(root, ud, d);
  // Turm-Level (PvZ2-Stil): ab Level 5 Veteranen-Ring, auf Level 10 Meister-Aura in der Turmfarbe
  if (mastery >= 5) {
    const kv = new Kit(), mc = mastery >= 10 ? d.accent : '#c9a456';
    kv.tor('glow', 0.52, 0.011, mc, [0, 0, 0], [Math.PI / 2, 0, 0], 56);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; kv.oct('glow', 0.03, mc, [Math.sin(a) * 0.52, 0, Math.cos(a) * 0.52], [0, a, 0], [1, 1.6, 1]); }
    const r = kv.build(false); r.position.y = 0.015; root.add(r);
    if (mastery >= 10) { r.userData.orbit = 1; ud.rings.push(r); const h = halo(d.accent, 1.5, 0.32); h.position.y = 0.25; h.userData.base = 1; root.add(h); ud.halos.push(h); ud.master = true; }
  }
  root.userData = ud;
  return root;
}

// =====================================================================
// GEGNER (je Typ ein verschmolzenes Mesh; Kontur in Rot)
// =====================================================================
const EYE = '#ff5c48';
function enemyKit(type) {
  const k = new Kit();
  const B = 'body', G = 'glow';
  switch (type) {
    case 'laeufer':
      k.sph(B, 0.17, '#4a4039', [0, 0.27, 0], [1, 1.1, 0.95]);
      k.sph(B, 0.12, '#544a42', [0, 0.46, 0.07], [1, 0.95, 1.05]);
      k.cone(B, 0.045, 0.16, 6, '#544a42', [-0.11, 0.55, 0.04], [0, 0, 0.9]); k.cone(B, 0.045, 0.16, 6, '#544a42', [0.11, 0.55, 0.04], [0, 0, -0.9]);
      k.cyl(B, 0.035, 0.03, 0.16, 6, '#352e2a', [-0.07, 0.08, 0]); k.cyl(B, 0.035, 0.03, 0.16, 6, '#352e2a', [0.07, 0.08, 0]);
      k.cyl(B, 0.03, 0.025, 0.22, 6, '#4a4039', [-0.18, 0.25, 0.04], [0.3, 0, 0.35]); k.cyl(B, 0.03, 0.025, 0.22, 6, '#4a4039', [0.18, 0.25, 0.04], [0.3, 0, -0.35]);
      k.sph(G, 0.024, EYE, [-0.045, 0.48, 0.17], [1, 1, 1], 8); k.sph(G, 0.024, EYE, [0.045, 0.48, 0.17], [1, 1, 1], 8);
      break;
    case 'flitzer':
      k.sph(B, 0.12, '#47453a', [0, 0.27, 0], [0.8, 0.85, 1.45]);
      k.sph(B, 0.085, '#545243', [0, 0.36, 0.17], [0.9, 0.9, 1.2]);
      k.cone(B, 0.03, 0.2, 6, '#3a382f', [-0.05, 0.43, 0.08], [-1.0, 0, 0.3]); k.cone(B, 0.03, 0.2, 6, '#3a382f', [0.05, 0.43, 0.08], [-1.0, 0, -0.3]);
      k.cone(B, 0.04, 0.22, 6, '#3a382f', [0, 0.26, -0.24], [-1.4, 0, 0]);
      k.cyl(B, 0.022, 0.018, 0.22, 6, '#2f2d27', [-0.06, 0.11, 0.02], [0.3, 0, 0]); k.cyl(B, 0.022, 0.018, 0.22, 6, '#2f2d27', [0.06, 0.11, 0.02], [-0.3, 0, 0]);
      k.sph(G, 0.02, '#ffb040', [-0.035, 0.38, 0.26], [1, 1, 1], 8); k.sph(G, 0.02, '#ffb040', [0.035, 0.38, 0.26], [1, 1, 1], 8);
      break;
    case 'schwarm':
      k.sph(B, 0.09, '#3d3540', [0, 0.11, 0], [1, 0.7, 1.3]);
      k.sph(B, 0.06, '#4a4050', [0, 0.12, 0.12], [1, 0.9, 1]);
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) k.box(B, 0.12, 0.012, 0.012, '#2a242c', [s * 0.09, 0.06, -0.06 + i * 0.06], [0, s * (0.3 - i * 0.3), s * -0.4]);
      k.sph(G, 0.017, EYE, [-0.025, 0.14, 0.17], [1, 1, 1], 6); k.sph(G, 0.017, EYE, [0.025, 0.14, 0.17], [1, 1, 1], 6);
      break;
    case 'panzer':
      k.sph(B, 0.27, '#3b4246', [0, 0.17, 0], [1, 0.72, 1.25]);
      for (let i = 0; i < 4; i++) k.box(B, 0.4 - i * 0.04, 0.05, 0.08, '#5b6367', [0, 0.33 - Math.abs(i - 1.5) * 0.03, -0.2 + i * 0.13], [0.15 * (i - 1.5), 0, 0]);
      k.sph(B, 0.1, '#30363a', [0, 0.13, 0.31], [1, 0.8, 1]);
      k.cone(B, 0.04, 0.2, 6, '#6a7074', [0, 0.2, 0.42], [1.2, 0, 0]);
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) k.cyl(B, 0.022, 0.018, 0.14, 6, '#262a2d', [s * 0.24, 0.05, -0.12 + i * 0.13], [0, 0, s * 0.9]);
      k.sph(G, 0.022, EYE, [-0.05, 0.17, 0.39], [1, 1, 1], 8); k.sph(G, 0.022, EYE, [0.05, 0.17, 0.39], [1, 1, 1], 8);
      break;
    case 'flieger':
      k.sph(B, 0.11, '#2e2c34', [0, 0, 0], [0.9, 0.8, 1.5]);
      k.sph(B, 0.08, '#36343c', [0, 0.04, 0.16], [1, 1, 1]);
      k.cone(B, 0.03, 0.12, 6, '#8a7a50', [0, 0.03, 0.27], [Math.PI / 2, 0, 0]);
      k.cone(B, 0.07, 0.2, 6, '#26242b', [0, 0.02, -0.25], [-Math.PI / 2, 0, 0], [1, 1, 0.3]);
      k.sph(G, 0.018, EYE, [-0.035, 0.07, 0.22], [1, 1, 1], 6); k.sph(G, 0.018, EYE, [0.035, 0.07, 0.22], [1, 1, 1], 6);
      break;
    case 'heiler':
      k.cone(B, 0.18, 0.44, 10, '#433a2c', [0, 0.22, 0]);
      k.sph(B, 0.1, '#3a3226', [0, 0.47, 0.01], [1, 1.15, 1]);
      k.cone(B, 0.07, 0.14, 8, '#3a3226', [0, 0.6, -0.04], [-0.5, 0, 0]);
      k.cyl(B, 0.014, 0.014, 0.62, 6, '#5a4a32', [0.17, 0.3, 0.06]);
      k.sph(G, 0.055, '#9fe08a', [0.17, 0.64, 0.06], [1, 1, 1], 10);
      k.sph(G, 0.018, '#b8f08a', [-0.035, 0.48, 0.09], [1, 1, 1], 6); k.sph(G, 0.018, '#b8f08a', [0.035, 0.48, 0.09], [1, 1, 1], 6);
      break;
    case 'brut':
      k.sph(B, 0.27, '#45323f', [0, 0.3, -0.02], [1.1, 1, 1.2]);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; k.sph(B, 0.08, '#523a4b', [Math.sin(a) * 0.23, 0.42 + Math.cos(a * 2) * 0.05, Math.cos(a) * 0.22], [1, 1, 1], 10); k.sph(G, 0.035, '#c46aa0', [Math.sin(a + 0.5) * 0.26, 0.32, Math.cos(a + 0.5) * 0.27], [1, 1, 1], 8); }
      k.sph(B, 0.1, '#3a2a35', [0, 0.27, 0.3], [1, 0.9, 1]);
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) k.cyl(B, 0.035, 0.03, 0.16, 6, '#2c2029', [s * 0.18, 0.07, -0.1 + i * 0.2]);
      k.sph(G, 0.022, EYE, [-0.04, 0.3, 0.39], [1, 1, 1], 8); k.sph(G, 0.022, EYE, [0.04, 0.3, 0.39], [1, 1, 1], 8);
      break;
    case 'koloss':
      k.cyl(B, 0.12, 0.1, 0.36, 8, '#3a332e', [-0.17, 0.18, 0]); k.cyl(B, 0.12, 0.1, 0.36, 8, '#3a332e', [0.17, 0.18, 0]);
      k.sph(B, 0.36, '#4a403a', [0, 0.62, 0], [1.1, 1, 0.85]);
      k.box(B, 0.46, 0.34, 0.08, '#5a6064', [0, 0.64, 0.27], [-0.1, 0, 0]);
      for (const s of [-1, 1]) { k.sph(B, 0.17, '#5a6064', [s * 0.4, 0.84, 0], [1, 0.8, 1]); k.cyl(B, 0.1, 0.09, 0.5, 8, '#4a403a', [s * 0.47, 0.52, 0.06], [0.2, 0, s * 0.1]); k.sph(B, 0.13, '#3a332e', [s * 0.5, 0.25, 0.12], [1, 1, 1], 10); }
      k.sph(B, 0.16, '#4a403a', [0, 1.02, 0.12], [1, 0.95, 1]);
      k.cone(B, 0.05, 0.24, 6, '#8a8070', [-0.13, 1.16, 0.08], [-0.3, 0, 0.6]); k.cone(B, 0.05, 0.24, 6, '#8a8070', [0.13, 1.16, 0.08], [-0.3, 0, -0.6]);
      k.sph(G, 0.032, EYE, [-0.06, 1.04, 0.26], [1, 1, 1], 8); k.sph(G, 0.032, EYE, [0.06, 1.04, 0.26], [1, 1, 1], 8);
      break;
    case 'fuerst':
      k.cone(B, 0.48, 1.15, 12, '#251f2c', [0, 0.65, 0]);
      for (const s of [-1, 1]) { k.sph(B, 0.2, '#2e2636', [s * 0.27, 1.12, 0], [1, 0.8, 1]); k.cone(B, 0.07, 0.4, 6, '#2e2636', [s * 0.42, 0.85, 0.12], [0.4, 0, s * 0.4]); k.sph(G, 0.05, '#b48ae0', [s * 0.48, 0.66, 0.2], [1, 1, 1], 8); }
      k.sph(B, 0.2, '#1c1722', [0, 1.34, 0.03], [1, 1.15, 1]);
      for (let i = 0; i < 5; i++) { const a = (i - 2) * 0.45; k.cone(G, 0.035, 0.22, 6, '#a07ad8', [Math.sin(a) * 0.17, 1.58, Math.cos(a) * 0.05 - 0.02], [0, 0, -a * 0.6]); }
      k.sph(G, 0.04, '#ff6a8a', [-0.07, 1.36, 0.19], [1, 0.7, 1], 8); k.sph(G, 0.04, '#ff6a8a', [0.07, 1.36, 0.19], [1, 0.7, 1], 8);
      break;
  }
  return k;
}
function wingGeo(side) {
  const k = new Kit();
  k.box('body', 0.3, 0.02, 0.15, '#26242b', [side * 0.17, 0, 0.01], [0, side * 0.15, 0]);
  k.box('body', 0.16, 0.018, 0.1, '#1e1c22', [side * 0.36, 0, -0.03], [0, side * 0.35, 0]);
  return k.geo('body');
}
const ENEMY_GEO = {};
function enemyGeo(type) {
  if (ENEMY_GEO[type]) return ENEMY_GEO[type];
  const k = enemyKit(type);
  return (ENEMY_GEO[type] = { body: k.geo('body'), glow: k.geo('glow') });
}
const OUTLINE = '#b8463c';
const TS = 1.3, ES = 1.45; // Türme und Gegner auf dem Brett etwas größer – besser lesbar

// =====================================================================
// Partikel (Punkte mit weichem Rand)
// =====================================================================
class Particles {
  constructor(max, additive) {
    this.max = max; this.n = 0;
    this.p = new Float32Array(max * 3); this.c = new Float32Array(max * 3); this.a = new Float32Array(max); this.s = new Float32Array(max);
    this.v = new Float32Array(max * 3); this.life = new Float32Array(max); this.ml = new Float32Array(max); this.g = new Float32Array(max); this.dr = new Float32Array(max); this.gr = new Float32Array(max); this.a0 = new Float32Array(max); this.s0 = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    this.ap = new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage);
    this.ac = new THREE.BufferAttribute(this.c, 3).setUsage(THREE.DynamicDrawUsage);
    this.aa = new THREE.BufferAttribute(this.a, 1).setUsage(THREE.DynamicDrawUsage);
    this.as = new THREE.BufferAttribute(this.s, 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.ap); geo.setAttribute('pcol', this.ac); geo.setAttribute('palpha', this.aa); geo.setAttribute('psize', this.as);
    geo.boundingSphere = new THREE.Sphere(new V3(COLS / 2, 0, ROWS / 2), 60);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 600 } },
      vertexShader: `attribute vec3 pcol; attribute float palpha; attribute float psize; uniform float uScale; varying vec3 vC; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = psize * uScale / -mv.z; gl_Position = projectionMatrix * mv; vC = pcol; vA = palpha; }`,
      fragmentShader: `varying vec3 vC; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = smoothstep(1.0, 0.0, r); gl_FragColor = vec4(vC, vA * a * a); }`,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.obj = new THREE.Points(geo, this.mat);
    this.obj.frustumCulled = false;
    this.obj.renderOrder = additive ? 5 : 4;
  }
  emit(x, y, z, vx, vy, vz, life, size, col, alpha = 1, grav = 0, drag = 0, grow = 0) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
    this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.c[i * 3] = col.r; this.c[i * 3 + 1] = col.g; this.c[i * 3 + 2] = col.b;
    this.life[i] = this.ml[i] = life; this.s[i] = this.s0[i] = size; this.a[i] = this.a0[i] = alpha; this.g[i] = grav; this.dr[i] = drag; this.gr[i] = grow;
  }
  update(dt) {
    let j = 0;
    for (let i = 0; i < this.n; i++) {
      const l = this.life[i] - dt;
      if (l <= 0) continue;
      if (j !== i) {
        for (let q = 0; q < 3; q++) { this.p[j * 3 + q] = this.p[i * 3 + q]; this.v[j * 3 + q] = this.v[i * 3 + q]; this.c[j * 3 + q] = this.c[i * 3 + q]; }
        this.ml[j] = this.ml[i]; this.s0[j] = this.s0[i]; this.a0[j] = this.a0[i]; this.g[j] = this.g[i]; this.dr[j] = this.dr[i]; this.gr[j] = this.gr[i];
      }
      this.life[j] = l;
      const k = l / this.ml[j], dk = Math.max(0, 1 - this.dr[j] * dt);
      this.v[j * 3] *= dk; this.v[j * 3 + 2] *= dk; this.v[j * 3 + 1] = this.v[j * 3 + 1] * dk - this.g[j] * dt;
      this.p[j * 3] += this.v[j * 3] * dt; this.p[j * 3 + 1] += this.v[j * 3 + 1] * dt; this.p[j * 3 + 2] += this.v[j * 3 + 2] * dt;
      if (this.p[j * 3 + 1] < 0.02) { this.p[j * 3 + 1] = 0.02; this.v[j * 3 + 1] *= -0.3; }
      this.a[j] = this.a0[j] * Math.min(1, k * 2.2) * (k > 0.9 ? (1 - k) * 10 * 0.6 + 0.4 : 1);
      this.s[j] = this.s0[j] * (1 + this.gr[j] * (1 - k));
      j++;
    }
    this.n = j;
    this.obj.geometry.setDrawRange(0, j);
    for (const a of [this.ap, this.ac, this.aa, this.as]) { a.needsUpdate = true; a.clearUpdateRanges?.(); a.addUpdateRange?.(0, j * a.itemSize); }
  }
}

// =====================================================================
// Brett-Textur (sauber, ruhig, Pfad hell für Kontrast)
// =====================================================================
function seeded(s) { s = s >>> 0 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function boardTexture(run, renderer) {
  const px = 64, c = document.createElement('canvas'); c.width = COLS * px; c.height = ROWS * px;
  const x = c.getContext('2d'), r = seeded(1234 + (run.li === 'endless' ? 99 : run.li) * 7);
  const TH = THEMES[run.L.theme] || THEMES.wald, tb = TH.tile;
  x.fillStyle = `rgb(${tb[0] - 18},${tb[1] - 18},${tb[2] - 18})`; x.fillRect(0, 0, c.width, c.height);
  for (let rr = 0; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) {
    const g = run.grid[rr * COLS + cc];
    if (g === 1) continue;
    const v = (r() - 0.5) * 7, base = g === 2 ? [tb[0] - 6, tb[1] - 6, tb[2] - 4] : [tb[0] + v, tb[1] + v, tb[2] + v];
    if (g === 4) { blockTile(x, run, cc, rr, px, TH); continue; }
    const X = cc * px + 2, Y = rr * px + 2, S = px - 4;
    const grd = x.createLinearGradient(X, Y, X + S, Y + S);
    grd.addColorStop(0, `rgb(${base[0] + 7},${base[1] + 7},${base[2] + 7})`); grd.addColorStop(1, `rgb(${base[0] - 5},${base[1] - 5},${base[2] - 5})`);
    x.fillStyle = grd;
    x.beginPath(); x.roundRect(X, Y, S, S, 6); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.035)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(X + 6, Y + 1); x.lineTo(X + S - 6, Y + 1); x.stroke();
    for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${0.025 + r() * 0.03})`; x.beginPath(); x.ellipse(X + r() * S, Y + r() * S, 2 + r() * 7, 1 + r() * 4, r() * 3, 0, 7); x.fill(); }
  }
  // Pfad: heller, abgenutzter Stein (Gegner heben sich dunkel davon ab)
  for (const p of run.paths) {
    const pts = p.P.map(q => [q.x * px, q.z * px]);
    const stroke = (w, col) => { x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke(); };
    stroke(px * 1.0, TH.path[0]); stroke(px * 0.9, TH.path[1]); stroke(px * 0.7, TH.path[2]); stroke(px * 0.36, 'rgba(255,255,255,.06)');
    if (TH.glow) { x.save(); x.globalCompositeOperation = 'lighter'; x.shadowColor = TH.glow; x.shadowBlur = 14; x.globalAlpha = 0.35; stroke(px * 0.95, 'rgba(0,0,0,0)'); x.strokeStyle = TH.glow; x.lineWidth = 2; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke(); x.restore(); }
  }
  x.save();
  for (const p of run.paths) {
    for (let d = 0; d < p.len; d += 0.09) {
      const q = p.at(d), off = (r() - 0.5) * 0.8;
      x.fillStyle = `rgba(${r() < 0.5 ? '30,27,23' : '160,150,130'},${0.12 + r() * 0.14})`;
      x.beginPath(); x.ellipse((q.x + q.dz * off * 0.5) * px, (q.z - q.dx * off * 0.5) * px, 2 + r() * 5, 1.5 + r() * 3, r() * 3, 0, 7); x.fill();
    }
  }
  x.restore();
  // Kernplatz
  const cx = run.core.x * px, cz = run.core.z * px;
  const g = x.createRadialGradient(cx, cz, 0, cx, cz, px * 1.6);
  g.addColorStop(0, 'rgba(120,180,195,.35)'); g.addColorStop(1, 'rgba(120,180,195,0)');
  x.fillStyle = g; x.fillRect(cx - px * 2, cz - px * 2, px * 4, px * 4);
  x.strokeStyle = 'rgba(160,210,220,.25)'; x.lineWidth = 2;
  for (const rr of [1.15, 1.42]) { x.beginPath(); x.arc(cx, cz, px * rr, 0, 7); x.stroke(); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.beginPath(); x.moveTo(cx + Math.cos(a) * px * 1.18, cz + Math.sin(a) * px * 1.18); x.lineTo(cx + Math.cos(a) * px * 1.38, cz + Math.sin(a) * px * 1.38); x.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}
function blockTile(x, run, cc, rr, px, TH) {
  const type = (run.L.blocks || []).find(b => b[0] === cc && b[1] === rr)?.[2] || 'rock';
  const X = cc * px, Y = rr * px;
  if (type === 'pool') {
    const g = x.createRadialGradient(X + px / 2, Y + px / 2, 4, X + px / 2, Y + px / 2, px * 0.6);
    g.addColorStop(0, '#1d3a42'); g.addColorStop(0.7, '#13262c'); g.addColorStop(1, '#0c1518');
    x.fillStyle = g; x.beginPath(); x.roundRect(X + 3, Y + 3, px - 6, px - 6, 16); x.fill();
    x.strokeStyle = 'rgba(160,200,210,.18)'; x.lineWidth = 1.5; for (let i = 0; i < 3; i++) { x.beginPath(); x.ellipse(X + px / 2, Y + px / 2, 8 + i * 8, 4 + i * 4, 0, 0, 7); x.stroke(); }
  } else if (type === 'lava') {
    const g = x.createRadialGradient(X + px / 2, Y + px / 2, 2, X + px / 2, Y + px / 2, px * 0.6);
    g.addColorStop(0, '#ffd36a'); g.addColorStop(0.35, '#ff7a24'); g.addColorStop(0.8, '#7a1e0e'); g.addColorStop(1, '#2a0e0a');
    x.fillStyle = g; x.beginPath(); x.roundRect(X + 3, Y + 3, px - 6, px - 6, 14); x.fill();
  } else {
    const tb = TH.tile;
    x.fillStyle = `rgb(${tb[0] - 10},${tb[1] - 10},${tb[2] - 10})`; x.beginPath(); x.roundRect(X + 2, Y + 2, px - 4, px - 4, 6); x.fill();
  }
}
function groundTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d'), g = x.createRadialGradient(256, 256, 40, 256, 256, 256);
  g.addColorStop(0, '#22262a'); g.addColorStop(0.5, '#15181b'); g.addColorStop(1, '#0a0b0d');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  const r = seeded(77);
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${r() * 0.04})`; x.beginPath(); x.arc(r() * 512, r() * 512, 1 + r() * 4, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function swirlTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,120,90,.95)'); g.addColorStop(0.4, 'rgba(160,40,40,.6)'); g.addColorStop(1, 'rgba(60,10,20,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  x.strokeStyle = 'rgba(255,170,140,.35)'; x.lineWidth = 3;
  for (let i = 0; i < 4; i++) { x.beginPath(); for (let a = 0; a < 6; a += 0.1) { const rr = a * 9; x.lineTo(64 + Math.cos(a + i * 1.57) * rr, 64 + Math.sin(a + i * 1.57) * rr); } x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// Umgebungslicht für Metall (Studio-Kuppel)
function envMap(renderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const sc = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 32, 16);
  const cols = []; const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 10; const c = new THREE.Color().lerpColors(new THREE.Color('#121315'), new THREE.Color('#8a94a4'), Math.max(0, y * 0.5 + 0.5) ** 1.6); cols.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  sc.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const lamp = (x, y, z, w, h, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m); };
  lamp(-5, 7, 4, 6, 3, new THREE.Color(2.2, 2.2, 2.4)); lamp(6, 4, -5, 4, 2, new THREE.Color(1.2, 0.9, 0.7));
  const rt = pm.fromScene(sc, 0.04);
  pm.dispose(); geo.dispose();
  return rt.texture;
}
function lights(scene, shadows) {
  scene.add(new THREE.HemisphereLight('#9aa6ba', '#2a2622', 1.25));
  const sun = new THREE.DirectionalLight('#dfe4ee', 2.3);
  sun.position.set(COLS / 2 - 7, 15, ROWS / 2 + 6); sun.target.position.set(COLS / 2, 0, ROWS / 2);
  scene.add(sun, sun.target);
  if (shadows) {
    sun.castShadow = true; sun.shadow.mapSize.set(shadows, shadows);
    const s = sun.shadow.camera; s.left = -14; s.right = 14; s.top = 11; s.bottom = -11; s.near = 2; s.far = 40;
    sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
  }
  const rim = new THREE.DirectionalLight('#7a6a9a', 0.6); rim.position.set(COLS / 2 + 8, 6, -6); scene.add(rim);
  return sun;
}

// =====================================================================
// SCHLACHTFELD
// =====================================================================
export function createBattle(canvas, game, { quality = () => 'auto' } = {}) {
  const q0 = quality();
  const dprMax = q0 === 'niedrig' ? 1 : q0 === 'mittel' ? 1.5 : 2;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: q0 !== 'niedrig', alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const shadowSize = q0 === 'niedrig' ? 0 : q0 === 'mittel' ? 1024 : 2048;
  renderer.shadowMap.enabled = !!shadowSize; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0d10');
  scene.fog = new THREE.Fog('#0b0d10', 22, 52);
  scene.environment = envMap(renderer);
  scene.environmentIntensity = 0.55;
  lights(scene, shadowSize);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 120);
  const M = mats();

  const addP = new Particles(q0 === 'niedrig' ? 1500 : 4000, true);
  const smoke = new Particles(q0 === 'niedrig' ? 600 : 1600, false);
  scene.add(addP.obj, smoke.obj);
  const pq = () => (q0 === 'niedrig' ? 0.45 : q0 === 'mittel' ? 0.75 : 1);

  // Umgebung (bleibt): Boden außen
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1 }));
  outside.rotation.x = -Math.PI / 2; outside.position.set(COLS / 2, -0.62, ROWS / 2); outside.receiveShadow = true;
  scene.add(outside);

  // Pools für Projektile / Strahlen / Ringe
  const MAXB = 500;
  const glowAdd = () => new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const bulletMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.04, 0.3), glowAdd(), MAXB);
  const orbMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), glowAdd(), 200);
  const shellMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshStandardMaterial({ color: '#2a2b2e', metalness: 0.6, roughness: 0.4 }), 120);
  const missileMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 8).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#8a8a84', metalness: 0.5, roughness: 0.4 }), 200);
  const beamMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), glowAdd(), 900);
  const ringMesh = new THREE.InstancedMesh(new THREE.RingGeometry(0.8, 1, 48).rotateX(-Math.PI / 2), glowAdd(), 60);
  for (const m of [bulletMesh, orbMesh, shellMesh, missileMesh, beamMesh, ringMesh]) { m.count = 0; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); }
  for (const m of [bulletMesh, orbMesh, beamMesh, ringMesh]) { m.setColorAt(0, new THREE.Color()); m.instanceColor.setUsage(THREE.DynamicDrawUsage); }
  shellMesh.castShadow = true; missileMesh.castShadow = true;
  beamMesh.renderOrder = 6; ringMesh.renderOrder = 6;

  // Platzieren: Rasterfelder, Reichweite, Hover-Rahmen
  const cellMat = new THREE.MeshBasicMaterial({ color: '#9fd0a0', transparent: true, opacity: 0.12, depthWrite: false });
  const cellMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.9, 0.9).rotateX(-Math.PI / 2), cellMat, COLS * ROWS);
  cellMesh.count = 0; cellMesh.renderOrder = 2; scene.add(cellMesh);
  const hoverMat = new THREE.MeshBasicMaterial({ color: '#e8f2e8', transparent: true, opacity: 0.85, depthWrite: false });
  const hover = new THREE.Group();
  for (const [w, d, x, z] of [[0.96, 0.05, 0, -0.455], [0.96, 0.05, 0, 0.455], [0.05, 0.96, -0.455, 0], [0.05, 0.96, 0.455, 0]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), hoverMat); m.position.set(x, 0, z); hover.add(m); }
  hover.position.y = 0.012; hover.visible = false; hover.renderOrder = 3; scene.add(hover);
  const rangeGrp = new THREE.Group();
  const rangeFill = new THREE.Mesh(new THREE.CircleGeometry(1, 72).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.07, depthWrite: false }));
  const rangeRing = new THREE.Mesh(new THREE.RingGeometry(0.975, 1, 96).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6, depthWrite: false }));
  rangeGrp.add(rangeFill, rangeRing); rangeGrp.position.y = 0.02; rangeGrp.visible = false; rangeGrp.renderOrder = 3; scene.add(rangeGrp);
  const selRing = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.56, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false }));
  selRing.position.y = 0.03; selRing.visible = false; scene.add(selRing);
  const buffLines = new THREE.Group(); scene.add(buffLines);
  const buffGeo = new THREE.BoxGeometry(1, 1, 1), buffMat = new THREE.MeshBasicMaterial({ color: '#a98fd8', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });

  // ---------- Level-Aufbau ----------
  let level = null; // { group, board, core, portals, ... }
  const towers = new Map();
  const enemyPools = {};
  let ghost = null, ghostId = null, ghostMat = null;
  const texts = [];
  let shake = 0, camK = 1, coreFlash = 0, t = 0;
  let W = 1, H = 1, dpr = 1, insets = { top: 70, bottom: 120, left: 0, right: 0 };

  function makeEnemyPool(type) {
    const g = enemyGeo(type), E = ENEMIES[type], max = type === 'schwarm' ? 260 : E.boss ? 6 : 160;
    const body = new THREE.InstancedMesh(g.body, M.body, max);
    const glow = g.glow ? new THREE.InstancedMesh(g.glow, M.glow, max) : null;
    const line = new THREE.InstancedMesh(g.body, outlineMat(OUTLINE, E.boss ? 0.035 : type === 'schwarm' ? 0.016 : 0.022), max);
    const parts = [body, glow, line].filter(Boolean);
    let wings = null;
    if (type === 'flieger') {
      const L = new THREE.InstancedMesh(wingGeo(-1), M.body, max), R = new THREE.InstancedMesh(wingGeo(1), M.body, max);
      const LL = new THREE.InstancedMesh(L.geometry, outlineMat(OUTLINE, 0.014), max), RL = new THREE.InstancedMesh(R.geometry, outlineMat(OUTLINE, 0.014), max);
      wings = { L, R, LL, RL }; parts.push(L, R, LL, RL);
    }
    for (const m of parts) { m.count = 0; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); }
    body.castShadow = true;
    body.setColorAt(0, new THREE.Color()); body.instanceColor.setUsage(THREE.DynamicDrawUsage);
    return (enemyPools[type] = { body, glow, line, wings, max });
  }

  function buildLevel(run) {
    disposeLevel();
    const grp = new THREE.Group(); scene.add(grp);
    const TH = THEMES[run.L.theme] || THEMES.wald;
    scene.background.set(TH.bg); scene.fog.color.set(TH.bg);
    // Brett
    const tex = boardTexture(run, renderer);
    const side = new THREE.MeshStandardMaterial({ color: TH.side, roughness: 0.95 });
    const top = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, metalness: 0.02 });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(COLS, 0.6, ROWS), [side, side, top, side, side, side]);
    slab.position.set(COLS / 2, -0.3, ROWS / 2); slab.receiveShadow = true; grp.add(slab);
    const lip = new Kit();
    lip.box('dark', COLS + 0.3, 0.12, 0.18, '#34363a', [COLS / 2, -0.02, -0.09]); lip.box('dark', COLS + 0.3, 0.12, 0.18, '#34363a', [COLS / 2, -0.02, ROWS + 0.09]);
    lip.box('dark', 0.18, 0.12, ROWS, '#34363a', [-0.09, -0.02, ROWS / 2]); lip.box('dark', 0.18, 0.12, ROWS, '#34363a', [COLS + 0.09, -0.02, ROWS / 2]);
    // Umgebung: ein paar Felsen, tote Bäume, Ruinen – nur AUSSERHALB des Bretts
    const r = seeded(4242 + (run.li === 'endless' ? 9 : run.li));
    for (let i = 0; i < 18; i++) {
      let x, z;
      do { x = -6 + r() * (COLS + 12); z = -5 + r() * (ROWS + 10); } while (x > -1.4 && x < COLS + 1.4 && z > -1.4 && z < ROWS + 1.4);
      const kind = r();
      if (kind < 0.55) lip.rock('dark', 0.3 + r() * 0.6, TH.deco[i % 2], [x, -0.5, z], [r() * 3, r() * 3, r() * 3], [1, 0.6 + r() * 0.5, 1]);
      else if (kind < 0.8) { const h = 1 + r() * 1.4; lip.cyl('dark', 0.05, 0.1, h, 6, '#2a2420', [x, -0.6 + h / 2, z], [r() * 0.2, 0, r() * 0.2]); for (let b = 0; b < 3; b++) lip.cyl('dark', 0.02, 0.04, 0.5, 5, '#2a2420', [x + (r() - 0.5) * 0.3, -0.6 + h * (0.6 + b * 0.12), z], [r() - 0.5, 0, (r() - 0.5) * 2]); }
      else { const h = 0.4 + r() * 1.2; lip.box('dark', 0.36, h, 0.36, '#3a3834', [x, -0.6 + h / 2, z], [0, r(), (r() - 0.5) * 0.15]); }
    }
    // Brücken unter den Pfad-Eingängen
    const portals = [];
    for (const p of run.paths) {
      const a = p.P[0], b = p.P[1];
      const dx = Math.sign(b.x - a.x), dz = Math.sign(b.z - a.z);
      const ex = a.x - dx * 0.4, ez = a.z - dz * 0.4;
      lip.box('dark', dx ? 2.2 : 1.1, 0.5, dz ? 2.2 : 1.1, '#2e2c29', [a.x - dx * 0.6, -0.27, a.z - dz * 0.6]);
      // Tor
      const ang = Math.atan2(dx, dz);
      const px = Math.cos(ang) * 0.62, pz = -Math.sin(ang) * 0.62;
      for (const s of [-1, 1]) { lip.box('paint', 0.22, 1.25, 0.22, '#3a3632', [ex + px * s, 0.62, ez + pz * s], [0, ang, 0]); lip.box('paint', 0.3, 0.12, 0.3, '#2c2a27', [ex + px * s, 1.28, ez + pz * s], [0, ang, 0]); }
      lip.box('paint', 1.6, 0.16, 0.26, '#34302c', [ex, 1.38, ez], [0, ang + Math.PI / 2, 0]);
      const sw = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), new THREE.MeshBasicMaterial({ map: swirlTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      sw.position.set(ex, 0.62, ez); sw.rotation.y = ang; grp.add(sw);
      const hl = halo('#c0453a', 2.4, 0.55); hl.position.set(ex, 0.6, ez); grp.add(hl);
      portals.push({ sw, x: ex, z: ez });
    }
    // Hindernisse auf dem Brett (die einzige Deko)
    const lavaSpots = [];
    for (const [c, rr2, type] of run.L.blocks || []) {
      const x = c + 0.5, z = rr2 + 0.5;
      if (type === 'tree') { lip.cyl('dark', 0.05, 0.08, 0.5, 6, '#2a2018', [x, 0.25, z]); lip.cone('paint', 0.36, 0.7, 7, '#22301f', [x, 0.7, z]); lip.cone('paint', 0.27, 0.55, 7, '#273825', [x, 1.05, z]); lip.cone('paint', 0.17, 0.4, 7, '#2c4029', [x, 1.32, z]); }
      else if (type === 'rock') { lip.rock('dark', 0.34, TH.deco[0], [x - 0.08, 0.16, z], [0.4, 0.8, 0.2], [1, 0.75, 1]); lip.rock('dark', 0.2, TH.deco[1], [x + 0.2, 0.1, z + 0.14], [1, 0.3, 0.6], [1, 0.8, 1]); }
      else if (type === 'ruin') { lip.box('paint', 0.3, 0.9, 0.3, TH.deco[0], [x - 0.1, 0.45, z], [0, 0.3, 0.05]); lip.box('paint', 0.34, 0.1, 0.34, TH.deco[1], [x - 0.1, 0.92, z], [0, 0.3, 0.05]); lip.box('paint', 0.26, 0.24, 0.5, TH.deco[1], [x + 0.18, 0.12, z + 0.1], [0, 1.1, 0.4]); }
      else if (type === 'crystal') { const gc = TH.glow || '#8fd6e6'; lip.rock('dark', 0.26, TH.deco[1], [x, 0.08, z], [0, 0, 0], [1, 0.5, 1]); lip.oct('glow', 0.14, gc, [x, 0.42, z], [0.1, 0.4, 0.15], [1, 2.2, 1]); lip.oct('glow', 0.09, gc, [x + 0.16, 0.24, z + 0.08], [0.4, 0, 0.5], [1, 2, 1]); const h = halo(gc, 1.4, 0.45); h.position.set(x, 0.45, z); grp.add(h); }
      else if (type === 'lava') { const h = halo('#ff7a2a', 1.6, 0.55); h.position.set(x, 0.15, z); grp.add(h); lavaSpots.push([x, z]); }
    }
    const lipMesh = lip.build(true); grp.add(lipMesh);
    // Kern
    const core = new THREE.Group(); core.position.set(run.core.x, 0, run.core.z); grp.add(core);
    const kc = new Kit();
    kc.cyl('paint', 1.05, 1.15, 0.08, 6, C.stone, [0, 0.04, 0], [0, Math.PI / 6, 0]);
    kc.cyl('metal', 0.96, 0.96, 0.03, 6, C.brass, [0, 0.095, 0], [0, Math.PI / 6, 0]);
    kc.cyl('metal', 0.34, 0.46, 0.3, 8, C.iron, [0, 0.25, 0]);
    kc.tor('metal', 0.36, 0.03, C.gold, [0, 0.4, 0], [Math.PI / 2, 0, 0], 28);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; kc.cyl('paint', 0.07, 0.09, 0.62, 6, C.stoneD, [Math.sin(a) * 0.82, 0.39, Math.cos(a) * 0.82]); kc.cone('metal', 0.08, 0.14, 6, C.brass, [Math.sin(a) * 0.82, 0.77, Math.cos(a) * 0.82]); kc.sph('glow', 0.035, '#a8e4ee', [Math.sin(a) * 0.82, 0.86, Math.cos(a) * 0.82], [1, 1, 1], 8); }
    core.add(kc.build());
    const crystalMat = new THREE.MeshStandardMaterial({ color: '#9fdbe6', emissive: '#5fb8c8', emissiveIntensity: 1.6, metalness: 0.1, roughness: 0.15, flatShading: true });
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), crystalMat);
    crystal.scale.set(1, 1.7, 1); crystal.position.y = 1.05; crystal.castShadow = true; core.add(crystal);
    const cHalo = halo('#8fd6e6', 2.6, 0.75); cHalo.position.y = 1.05; core.add(cHalo);
    const cRings = [];
    for (let i = 0; i < 2; i++) { const kr = new Kit(); kr.tor('glow', 0.5 + i * 0.12, 0.012, '#8fd6e6', [0, 0, 0], [Math.PI / 2, 0, 0], 48); const m = kr.build(false); m.position.y = 1.05; core.add(m); cRings.push(m); }
    const cLight = new THREE.PointLight('#7fd0e0', 6, 5, 1.6); cLight.position.y = 1.2; core.add(cLight);
    level = { grp, tex, slab, top, side, core, crystal, crystalMat, cHalo, cRings, cLight, portals, run, lavaSpots };
    for (const t2 of [...towers.values()]) { scene.remove(t2.obj); disposeObj(t2.obj); }
    towers.clear();
    // Platzier-Felder
    let n = 0; const mm = new THREE.Matrix4();
    for (let rr = 0; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) if (run.grid[rr * COLS + cc] === 0) { mm.makeTranslation(cc + 0.5, 0.011, rr + 0.5); cellMesh.setMatrixAt(n++, mm); }
    cellMesh.userData.n = n; cellMesh.count = 0; cellMesh.instanceMatrix.needsUpdate = true;
    camK = 1.45;
    fit();
  }
  function disposeLevel() {
    if (!level) return;
    scene.remove(level.grp);
    level.grp.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && !Object.values(M).includes(o.material)) [].concat(o.material).forEach(m => { m.map?.dispose(); m.dispose(); }); });
    level.tex.dispose();
    level = null;
  }

  // ---------- Kamera: Brett passt immer in den freien Bereich ----------
  const target = new V3(COLS / 2, 0, ROWS / 2);
  let camDir = new V3(), camDist = 20, portrait = false;
  function fit() {
    const availW = W - insets.left - insets.right, availH = H - insets.top - insets.bottom;
    portrait = availH > availW * 1.15;
    const el = portrait ? 0.98 : 0.92; // Blickwinkel (Radiant über dem Horizont)
    camDir = portrait ? new V3(Math.cos(el), Math.sin(el), 0) : new V3(0, Math.sin(el), Math.cos(el));
    camera.aspect = W / H;
    camera.clearViewOffset(); camera.updateProjectionMatrix();
    const corners = [[0, 0, 0], [COLS, 0, 0], [0, 0, ROWS], [COLS, 0, ROWS], [0, 0.9, 0], [COLS, 0.9, 0]].map(c => new V3(...c));
    let lo = 4, hi = 120;
    for (let i = 0; i < 26; i++) {
      const D = (lo + hi) / 2;
      camera.position.copy(target).addScaledVector(camDir, D); camera.lookAt(target); camera.updateMatrixWorld();
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const c of corners) { const p = c.clone().project(camera); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
      const pw = (x1 - x0) / 2 * W, ph = (y1 - y0) / 2 * H;
      if (pw <= availW - 24 && ph <= availH - 16) hi = D; else lo = D;
    }
    camDist = hi;
    scene.fog.near = camDist * 0.95; scene.fog.far = camDist * 2.3; camera.far = camDist * 3 + 20;
    camera.position.copy(target).addScaledVector(camDir, camDist); camera.lookAt(target); camera.updateMatrixWorld();
    // Mitte des Bretts in die Mitte des freien Bereichs schieben
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const c of corners.slice(0, 4)) { const p = c.clone().project(camera); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    const bcx = ((x0 + x1) / 2 * 0.5 + 0.5) * W, bcy = (1 - ((y0 + y1) / 2 * 0.5 + 0.5)) * H;
    const acx = insets.left + availW / 2, acy = insets.top + availH / 2;
    camera.setViewOffset(W, H, Math.round(bcx - acx), Math.round(bcy - acy), W, H);
    camera.updateProjectionMatrix();
  }

  function resize(w, h, d, ins) {
    W = Math.max(1, w); H = Math.max(1, h); dpr = Math.min(dprMax, d || 1);
    if (ins) insets = ins;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    const s = H * dpr / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    addP.mat.uniforms.uScale.value = s; smoke.mat.uniforms.uScale.value = s;
    fit();
  }

  // ---------- Picking ----------
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new V3(0, 1, 0), 0), hit = new V3(), ndc = new THREE.Vector2();
  function pick(px, py) {
    ndc.set(px / W * 2 - 1, -(py / H) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    const c = Math.floor(hit.x), r = Math.floor(hit.z);
    return { c, r, x: hit.x, z: hit.z, inside: c >= 0 && r >= 0 && c < COLS && r < ROWS };
  }
  const _v = new V3();
  function toScreen(x, y, z) { _v.set(x, y, z).project(camera); return { x: (_v.x * 0.5 + 0.5) * W, y: (1 - (_v.y * 0.5 + 0.5)) * H, vis: _v.z < 1 }; }

  // ---------- Effekte ----------
  const col = h => new THREE.Color(h);
  const CO = { spark: col('#ffd08a'), fire: col('#ff8a3a'), fire2: col('#ffcf6a'), ice: col('#bfe8f5'), zap: col('#bcd8ff'), red: col('#e0473a'), blood: col('#8a2a2a'), gold: col('#f0c860'), smoke: col('#3a3a3c'), smokeL: col('#6a6a6c'), dust: col('#7a7266'), white: col('#ffffff'), purple: col('#c8a0ff'), green: col('#a8e890'), cyan: col('#8fd6e6') };
  const R = Math.random;
  function burst(x, y, z, n, c, sp, life, size, opts = {}) {
    const k = Math.max(1, Math.round(n * pq()));
    for (let i = 0; i < k; i++) {
      const a = R() * Math.PI * 2, u = R() * 2 - 1, s = sp * (0.4 + R() * 0.6), h = Math.sqrt(1 - u * u);
      (opts.smoke ? smoke : addP).emit(x, y, z, Math.cos(a) * h * s, Math.abs(u) * s * (opts.up ?? 1) + (opts.lift || 0), Math.sin(a) * h * s, life * (0.6 + R() * 0.6), size * (0.6 + R() * 0.7), c, opts.alpha ?? 1, opts.grav ?? 4, opts.drag ?? 2, opts.grow ?? 0);
    }
  }
  function floatText(x, y, z, txt, color, big = false) { texts.push({ x, y, z, txt, color, life: 1.1, max: 1.1, big }); if (texts.length > 80) texts.shift(); }
  const muzzleWorld = (obj, out = new V3()) => { const ud = obj.userData; return ud.muzzle ? ud.muzzle.getWorldPosition(out) : out.set(obj.position.x, 0.8, obj.position.z); };

  const offs = [
    game.on('runStart', run => { buildLevel(run); }),
    game.on('leave', () => { disposeLevel(); for (const t2 of towers.values()) { scene.remove(t2.obj); disposeObj(t2.obj); } towers.clear(); clearEnemies(); }),
    game.on('kill', ({ e }) => {
      const s = e.E.size * ES, y = e.y + s * 0.6;
      burst(e.x, y, e.z, e.boss ? 60 : 14, CO.red, e.boss ? 4 : 2.2, 0.5, e.boss ? 0.5 : 0.22, { grav: 6 });
      burst(e.x, y, e.z, e.boss ? 30 : 8, CO.smoke, 1.2, 0.8, e.boss ? 0.9 : 0.4, { smoke: true, grav: -0.6, alpha: 0.6, grow: 1.2 });
      if (e.boss) { shake = Math.max(shake, 0.5); ringFx.push({ x: e.x, z: e.z, y: 0.05, r: 2.4, life: 0.6, max: 0.6, c: CO.red }); }
    }),
    game.on('coreHit', () => { coreFlash = 1; shake = Math.max(shake, 0.25); if (level) burst(level.run.core.x, 1, level.run.core.z, 20, CO.red, 2.5, 0.5, 0.25); }),
    game.on('shield', () => { if (level) { ringFx.push({ x: level.run.core.x, z: level.run.core.z, y: 0.5, r: 3, life: 1, max: 1, c: CO.cyan }); burst(level.run.core.x, 1, level.run.core.z, 60, CO.cyan, 4, 0.8, 0.3); } }),
    game.on('place', tw => { burst(tw.x, 0.1, tw.z, 24, CO.dust, 1.6, 0.6, 0.35, { smoke: true, up: 0.3, grav: 0, alpha: 0.5, grow: 1 }); ringFx.push({ x: tw.x, z: tw.z, y: 0.03, r: 0.8, life: 0.4, max: 0.4, c: col(tw.def.accent) }); }),
    game.on('upgrade', tw => { burst(tw.x, 0.5, tw.z, 40, col(tw.def.accent), 2.8, 0.6, 0.18, { grav: 3 }); ringFx.push({ x: tw.x, z: tw.z, y: 0.03, r: 1, life: 0.5, max: 0.5, c: col(tw.def.accent) }); }),
    game.on('sell', tw => { burst(tw.x, 0.3, tw.z, 30, CO.smokeL, 1.8, 0.8, 0.4, { smoke: true, grav: -0.5, alpha: 0.5, grow: 1 }); burst(tw.x, 0.4, tw.z, 16, CO.gold, 2, 0.6, 0.14); }),
    game.on('income', ({ t: tw, n }) => { burst(tw.x, 0.8, tw.z, 14, CO.gold, 1.8, 0.7, 0.14, { up: 2 }); floatText(tw.x, 1.1, tw.z, `+${n}`, '#e8c86a', true); }),
    game.on('shot', ({ t: tw, kind }) => {
      const o = towers.get(tw.uid); if (!o) return;
      const p = muzzleWorld(o.obj);
      if (kind === 'orbital') { const p0 = muzzleWorld(o.obj); burst(p0.x, p0.y, p0.z, 20, CO.red, 2, 0.5, 0.15); return; }
      const c = kind === 'frost' ? CO.ice : kind === 'missile' ? CO.fire : kind === 'plasma' ? CO.red : CO.spark;
      const big = kind === 'howitzer' ? 2.2 : kind === 'shell' ? 1.3 : 0.7;
      for (let i = 0; i < 2; i++) addP.emit(p.x, p.y, p.z, 0, 0, 0, 0.07, 0.5 * big, c, 0.9);
      burst(p.x, p.y, p.z, kind === 'bullet' ? 2 : 6, c, 2, 0.15, 0.08 * big);
      if (kind === 'shell' || kind === 'howitzer') { burst(p.x, p.y, p.z, 10, CO.smokeL, 0.8, 0.9, 0.3 * big, { smoke: true, grav: -0.8, alpha: 0.45, grow: 1.5 }); if (kind === 'howitzer') shake = Math.max(shake, 0.18); }
    }),
  ];
  const ringFx = [];
  function clearEnemies() { for (const p of Object.values(enemyPools)) { p.body.count = 0; if (p.glow) p.glow.count = 0; p.line.count = 0; if (p.wings) Object.values(p.wings).forEach(m => (m.count = 0)); } }

  // ---------- Türme synchronisieren ----------
  function syncTowers(dt) {
    const seen = new Set();
    for (const tw of game.towers) {
      seen.add(tw.uid);
      let o = towers.get(tw.uid);
      if (!o || o.lv !== tw.lv) {
        if (o) { scene.remove(o.obj); disposeObj(o.obj); }
        const obj = buildTower(tw.id, tw.lv, game.towerLevel(tw.id));
        obj.position.set(tw.x, 0, tw.z);
        scene.add(obj);
        o = { obj, lv: tw.lv, born: o ? 0.5 : 0, pop: o ? 1 : 0 };
        towers.set(tw.uid, o);
      }
      const ud = o.obj.userData;
      o.born = Math.min(1, o.born + dt * 3.5);
      const sc = o.pop ? 1 + Math.sin(o.born * Math.PI) * 0.12 : easeBack(o.born);
      o.obj.scale.setScalar(Math.max(0.01, sc) * TS);
      if (ud.aimHead) ud.head.rotation.y = tw.aim;
      for (const r of ud.recoil) r.o.position.z = r.o.userData.p0.z - tw.recoil * r.amt;
      const busy = tw.target ? 1 : 0;
      for (const s of ud.spin) s.rotation.z += dt * (busy ? 26 : 1.5);
      for (const g of ud.gears) { if (g.userData.axis === 'y') g.rotation.y += dt * 1.6; else g.rotation.x += dt * 2.2; }
      if (ud.press) ud.press.position.y = ud.press.userData.p0.y + Math.abs(Math.sin(t * 3 + tw.uid)) * 0.06;
      for (const r of ud.rings) { if (r.userData.orbit) r.rotation.y += dt * 2; else r.rotation.z += dt * (0.8 + busy); }
      for (const ob of ud.orbs) { ob.rotation.y += dt * (ob.userData.spinY ? 1.2 : 0); const f = 0.9 + Math.sin(t * 13 + tw.uid) * 0.06 + (tw.def.kind === 'tesla' && tw.recoil > 0.5 ? 0.3 : 0); ob.scale.setScalar(f); }
      for (const h of ud.halos) if (!h.userData.base) h.material.opacity = 0.45 + (tw.def.kind === 'laser' ? Math.min(1, tw.heat / 2.5) * 0.5 : Math.sin(t * 3 + tw.uid) * 0.12) + (tw.recoil > 0.5 ? 0.3 : 0);
      const rar = tw.def.rarity;
      if (rar === 'legendary' && R() < dt * 2.2 * pq()) { const a = R() * 6.28, rr = 0.3 + R() * 0.3; addP.emit(tw.x + Math.sin(a) * rr, 0.2, tw.z + Math.cos(a) * rr, 0, 0.6 + R() * 0.5, 0, 1.2, 0.07, CO.gold, 0.9, -0.1); }
      else if (rar === 'mythic' && R() < dt * 7 * pq()) { const a = R() * 6.28, rr = 0.25 + R() * 0.4; addP.emit(tw.x + Math.sin(a) * rr, 0.15, tw.z + Math.cos(a) * rr, 0, 0.7 + R() * 0.8, 0, 1.1, 0.08 + R() * 0.05, R() < 0.7 ? CO.red : CO.fire, 0.9, -0.2); }
      if (ud.master && R() < dt * 2 * pq()) { const a = R() * 6.28; addP.emit(tw.x + Math.sin(a) * 0.5, 0.05, tw.z + Math.cos(a) * 0.5, 0, 0.5, 0, 1, 0.07, col(tw.def.accent), 0.8, -0.1); }
      if (rar === 'epic' && R() < dt * 0.9 * pq()) { const a = R() * 6.28; addP.emit(tw.x + Math.sin(a) * 0.4, 0.2, tw.z + Math.cos(a) * 0.4, 0, 0.5, 0, 1.2, 0.06, CO.purple, 0.8, -0.1); }
      if (ud.smoke.length && R() < dt * 2.2 * pq()) { const s = ud.smoke[Math.floor(R() * ud.smoke.length)]; const w = s.clone().applyMatrix4(o.obj.matrixWorld); smoke.emit(w.x, w.y, w.z, (R() - 0.5) * 0.1, 0.35, (R() - 0.5) * 0.1, 2.2, 0.28, CO.smokeL, 0.35, -0.05, 0.3, 2.2); }
      // Flammen
      if (tw.def.kind === 'flame' && tw.flaming > 0.05) {
        const p = muzzleWorld(o.obj), s = game.stats(tw), sp = s.range / 0.38;
        const n = Math.round(5 * pq() * tw.flaming);
        for (let i = 0; i < n; i++) {
          const a = tw.aim + (R() - 0.5) * 0.7, v = sp * (0.7 + R() * 0.4);
          addP.emit(p.x, p.y, p.z, Math.sin(a) * v, (R() - 0.3) * 0.6, Math.cos(a) * v, 0.38, 0.22 + R() * 0.15, R() < 0.5 ? CO.fire : CO.fire2, 0.85, -1.5, 1.2, 2.2);
        }
        if (R() < 0.4) smoke.emit(p.x + Math.sin(tw.aim) * s.range * 0.8, 0.5, p.z + Math.cos(tw.aim) * s.range * 0.8, 0, 0.6, 0, 1, 0.4, CO.smoke, 0.35, -0.4, 0.5, 1.5);
      }
    }
    for (const [id, o] of towers) if (!seen.has(id)) { scene.remove(o.obj); disposeObj(o.obj); towers.delete(id); }
  }
  function disposeObj(obj) { obj.traverse(x => { x.geometry?.dispose(); if (x.isSprite) x.material.dispose(); }); }
  const easeBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };

  // ---------- Gegner (instanziert) ----------
  const _mat = new THREE.Matrix4(), _pos = new V3(), _quat = new THREE.Quaternion(), _sc = new V3(), _eu = new THREE.Euler(), _col = new THREE.Color(), _wm = new THREE.Matrix4();
  function syncEnemies() {
    const by = {};
    for (const e of game.enemies) (by[e.type] ||= []).push(e);
    for (const type of Object.keys(ENEMIES)) {
      const list = by[type];
      const pool = enemyPools[type] || (list ? makeEnemyPool(type) : null);
      if (!pool) continue;
      let n = 0;
      if (list) for (const e of list) {
        if (n >= pool.max) break;
        const moving = e.stunT <= 0 && e.frozenT <= 0;
        const ph = t * (6 + e.speed * 3) + e.wob;
        const bob = e.air ? Math.sin(t * 3 + e.wob) * 0.08 : moving ? Math.abs(Math.sin(ph)) * 0.05 * (e.boss ? 1.6 : 1) : 0;
        const spawnK = Math.min(1, (game.t - e.born) * 4);
        _pos.set(e.x, e.y + bob, e.z);
        _eu.set(moving && !e.air ? 0.08 : 0, e.dir, moving && !e.air ? Math.sin(ph) * 0.07 : (e.air ? Math.sin(t * 2 + e.wob) * 0.15 : 0));
        _quat.setFromEuler(_eu);
        const sq = e.hitT > 0 ? 1 + e.hitT * 0.9 : 1;
        const es = e.boss ? 1.15 : ES;
        _sc.set(spawnK * sq * es, spawnK * (2 - sq) * es, spawnK * sq * es);
        _mat.compose(_pos, _quat, _sc);
        pool.body.setMatrixAt(n, _mat); pool.line.setMatrixAt(n, _mat); if (pool.glow) pool.glow.setMatrixAt(n, _mat);
        if (e.hitT > 0) _col.setRGB(2.6, 2.3, 2.2);
        else if (e.frozenT > 0) _col.setRGB(0.8, 1.5, 2.2);
        else if (e.slowT > 0) _col.setRGB(0.85, 1.05, 1.35);
        else if (e.burnT > 0) _col.setRGB(1.6, 0.95, 0.6);
        else _col.setRGB(1, 1, 1);
        pool.body.setColorAt(n, _col);
        if (pool.wings) {
          const f = Math.sin(t * 14 + e.wob) * 0.7;
          for (const [m, ml, s] of [[pool.wings.L, pool.wings.LL, -1], [pool.wings.R, pool.wings.RL, 1]]) {
            _wm.makeRotationZ(f * s); _wm.premultiply(_mat);
            m.setMatrixAt(n, _wm); ml.setMatrixAt(n, _wm);
          }
        }
        if (e.burnT > 0 && R() < 0.25 * pq()) addP.emit(e.x + (R() - 0.5) * 0.2, e.y + 0.3, e.z + (R() - 0.5) * 0.2, 0, 0.8, 0, 0.4, 0.16, CO.fire, 0.8, -1, 1, 1);
        if (e.frozenT > 0 && R() < 0.15 * pq()) addP.emit(e.x, e.y + 0.3, e.z, (R() - 0.5) * 0.3, 0.3, (R() - 0.5) * 0.3, 0.5, 0.1, CO.ice, 0.8);
        if (e.E.heal && R() < 0.1 * pq()) addP.emit(e.x + (R() - 0.5) * 1.6, 0.15, e.z + (R() - 0.5) * 1.6, 0, 0.5, 0, 0.8, 0.12, CO.green, 0.6, -0.2);
        n++;
      }
      for (const m of [pool.body, pool.glow, pool.line, ...(pool.wings ? Object.values(pool.wings) : [])]) { if (!m) continue; m.count = n; m.instanceMatrix.needsUpdate = true; }
      if (pool.body.instanceColor) pool.body.instanceColor.needsUpdate = true;
    }
  }

  // ---------- Projektile, Strahlen, Ringe ----------
  const _d = new V3(), _up = new V3(0, 1, 0), _a = new V3(), _b = new V3();
  let beamN = 0;
  function beam(ax, ay, az, bx, by, bz, w, c, k = 1) {
    if (beamN >= beamMesh.count + 900 - beamMesh.count || beamN >= 900) return;
    _a.set(ax, ay, az); _b.set(bx, by, bz); _d.subVectors(_b, _a);
    const L = _d.length(); if (L < 1e-4) return;
    _pos.addVectors(_a, _b).multiplyScalar(0.5);
    _quat.setFromUnitVectors(new V3(0, 0, 1), _d.normalize());
    _sc.set(w, w, L);
    _mat.compose(_pos, _quat, _sc);
    beamMesh.setMatrixAt(beamN, _mat);
    _col.copy(c).multiplyScalar(k); beamMesh.setColorAt(beamN, _col);
    beamN++;
  }
  function syncProjectiles(dt) {
    let nb = 0, no = 0, ns = 0, nm = 0;
    for (const p of game.projectiles) {
      if (p.delay > 0) continue;
      if (p.kind === 'bullet' || p.kind === 'flak') {
        if (nb >= MAXB) continue;
        _d.set((p.tx ?? p.x) - p.x, (p.ty ?? 0.3) - p.y, (p.tz ?? p.z) - p.z);
        if (_d.lengthSq() < 1e-6) _d.set(0, 0, 1);
        _quat.setFromUnitVectors(new V3(0, 0, 1), _d.normalize());
        _mat.compose(_pos.set(p.x, p.y, p.z), _quat, _sc.set(1, 1, p.kind === 'flak' ? 0.8 : 1));
        bulletMesh.setMatrixAt(nb, _mat); bulletMesh.setColorAt(nb, p.kind === 'flak' ? _col.setRGB(1.6, 1.4, 0.9) : _col.setRGB(2.2, 1.5, 0.6)); nb++;
      } else if (p.kind === 'frost') {
        _mat.compose(_pos.set(p.x, p.y, p.z), _quat.identity(), _sc.setScalar(0.07)); orbMesh.setMatrixAt(no, _mat); orbMesh.setColorAt(no, _col.setRGB(1.2, 1.8, 2.2)); no++;
        if (R() < 0.6) addP.emit(p.x, p.y, p.z, 0, 0, 0, 0.3, 0.12, CO.ice, 0.6);
      } else if (p.kind === 'shell' || p.kind === 'howitzer') {
        const s = p.kind === 'howitzer' ? 0.12 : 0.075;
        _mat.compose(_pos.set(p.x, p.y, p.z), _quat.identity(), _sc.setScalar(s)); shellMesh.setMatrixAt(ns, _mat); ns++;
        _mat.compose(_pos, _quat, _sc.setScalar(s * 1.6)); orbMesh.setMatrixAt(no, _mat); orbMesh.setColorAt(no, _col.setRGB(1.2, 0.6, 0.25)); no++;
        if (R() < 0.7) smoke.emit(p.x, p.y, p.z, 0, 0.1, 0, 0.6, s * 3, CO.smokeL, 0.35, -0.2, 0.5, 1.4);
      } else if (p.kind === 'plasma') {
        _mat.compose(_pos.set(p.x, p.y, p.z), _quat.identity(), _sc.setScalar(0.13)); orbMesh.setMatrixAt(no, _mat); orbMesh.setColorAt(no, _col.setRGB(2.6, 0.5, 0.45)); no++;
        _mat.compose(_pos, _quat, _sc.setScalar(0.26)); orbMesh.setMatrixAt(no, _mat); orbMesh.setColorAt(no, _col.setRGB(0.7, 0.08, 0.08)); no++;
        for (let q2 = 0; q2 < 2; q2++) addP.emit(p.x + (R() - 0.5) * 0.1, p.y + (R() - 0.5) * 0.1, p.z + (R() - 0.5) * 0.1, (R() - 0.5) * 0.4, (R() - 0.5) * 0.4, (R() - 0.5) * 0.4, 0.35, 0.16, CO.red, 0.9);
      } else if (p.kind === 'missile') {
        _d.set(p.vx, p.vy, p.vz); if (_d.lengthSq() < 1e-6) _d.set(0, 1, 0);
        _quat.setFromUnitVectors(new V3(0, 0, 1), _d.normalize());
        _mat.compose(_pos.set(p.x, p.y, p.z), _quat, _sc.set(1, 1, 1)); missileMesh.setMatrixAt(nm, _mat); nm++;
        const bx = p.x - _d.x * 0.13, by = p.y - _d.y * 0.13, bz = p.z - _d.z * 0.13;
        addP.emit(bx, by, bz, -_d.x * 0.5, -_d.y * 0.5, -_d.z * 0.5, 0.18, 0.16, CO.fire, 0.9);
        if (R() < 0.8) smoke.emit(bx, by, bz, 0, 0.05, 0, 0.9, 0.12, CO.smokeL, 0.4, -0.1, 0.5, 2);
      }
    }
    bulletMesh.count = nb; orbMesh.count = no; shellMesh.count = ns; missileMesh.count = nm;
    for (const m of [bulletMesh, orbMesh, shellMesh, missileMesh]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }

    // Strahlen: Laser, Tesla, Railgun
    beamN = 0;
    for (const tw of game.towers) {
      if (tw.def.kind !== 'laser' || !tw.target || tw.target.dead) continue;
      const o = towers.get(tw.uid); if (!o) continue;
      const p = muzzleWorld(o.obj, new V3()), e = tw.target, hk = Math.min(1, tw.heat / 2.5);
      const ey = e.y + e.E.size * 0.8 * ES;
      const w = 0.035 + hk * 0.05 + Math.sin(t * 40) * 0.006;
      beam(p.x, p.y, p.z, e.x, ey, e.z, w * 3, col('#ff3a3a'), 0.35 + hk * 0.3);
      beam(p.x, p.y, p.z, e.x, ey, e.z, w, col('#ffd0c0'), 1.4);
      if (R() < 0.7) addP.emit(e.x, ey, e.z, (R() - 0.5) * 2, R() * 1.5, (R() - 0.5) * 2, 0.25, 0.12 + hk * 0.1, CO.fire2, 0.9, 3);
      if (o.obj.userData.laserTop) { const lt = o.obj.userData.laserTop; lt.rotation.x = -Math.atan2(ey - p.y, Math.hypot(e.x - p.x, e.z - p.z)) * 0.8; }
    }
    for (const f of game.fx) {
      const k = f.life / f.max;
      if (f.kind === 'zap') {
        if (!f._seen) {
          f._seen = true; for (const p of f.pts.slice(1)) burst(p.x, p.y, p.z, 6, CO.zap, 2, 0.25, 0.1);
          const o = towers.get(f.src); if (o) { const m = muzzleWorld(o.obj, new V3()); f.pts[0] = { x: m.x, y: m.y, z: m.z }; }
        }
        for (let i = 0; i < f.pts.length - 1; i++) {
          const a = f.pts[i], b = f.pts[i + 1];
          let px = a.x, py = a.y, pz = a.z;
          for (let s = 1; s <= 4; s++) {
            const u = s / 4, j = s < 4 ? 0.22 : 0;
            const nx = a.x + (b.x - a.x) * u + (R() - 0.5) * j, ny = a.y + (b.y - a.y) * u + (R() - 0.5) * j, nz = a.z + (b.z - a.z) * u + (R() - 0.5) * j;
            beam(px, py, pz, nx, ny, nz, 0.05, CO.zap, 1.6 * k);
            beam(px, py, pz, nx, ny, nz, 0.14, col('#6a8ad8'), 0.5 * k);
            px = nx; py = ny; pz = nz;
          }
        }
      } else if (f.kind === 'rail') {
        if (!f._seen) { f._seen = true; for (let d = 0; d < 1; d += 0.06) { const x = f.x0 + (f.x1 - f.x0) * d, z = f.z0 + (f.z1 - f.z0) * d; addP.emit(x, 0.66, z, (R() - 0.5) * 0.6, R() * 0.6, (R() - 0.5) * 0.6, 0.5, 0.14, CO.cyan, 0.8); } shake = Math.max(shake, 0.08); }
        beam(f.x0, 0.66, f.z0, f.x1, 0.66, f.z1, 0.04 + 0.1 * k, col('#c8fafa'), 1.8 * k);
        beam(f.x0, 0.66, f.z0, f.x1, 0.66, f.z1, 0.3 * k + 0.05, col(f.col), 0.6 * k);
      } else if (f.kind === 'boom') {
        if (!f._seen) {
          f._seen = true;
          const big = f.big ? 2 : 1, y = (f.y || 0) + 0.15;
          for (let i = 0; i < 3; i++) addP.emit(f.x, y + 0.2, f.z, 0, 0, 0, 0.18, f.r * 2.2 * big, CO.fire2, 0.9);
          burst(f.x, y, f.z, 26 * big, CO.fire, 3 * f.r * big, 0.5, 0.26 * big, { grav: 5 });
          burst(f.x, y, f.z, 16 * big, CO.smoke, 1.2 * f.r, 1.2, 0.5 * big, { smoke: true, grav: -0.5, alpha: 0.6, grow: 1.6 });
          ringFx.push({ x: f.x, z: f.z, y: 0.04, r: f.r * 1.15, life: 0.45, max: 0.45, c: CO.fire2 });
          if (f.big) shake = Math.max(shake, 0.32);
        }
      } else if (f.kind === 'flak') {
        if (!f._seen) { f._seen = true; burst(f.x, f.y, f.z, 10, CO.spark, 2.5, 0.25, 0.1); burst(f.x, f.y, f.z, 5, CO.smoke, 0.8, 0.7, 0.3, { smoke: true, grav: 0, alpha: 0.6, grow: 1.4 }); }
      } else if (f.kind === 'frost') {
        if (!f._seen) { f._seen = true; burst(f.x, f.y, f.z, 14, CO.ice, 1.8, 0.45, 0.12, { grav: 1 }); ringFx.push({ x: f.x, z: f.z, y: 0.04, r: f.r, life: 0.35, max: 0.35, c: CO.ice }); }
      }
    }
    // Orbitalschläge: Zielkreis + dünner Leitstrahl während des Aufladens
    for (const st of game.run?.strikes || []) {
      const k = 1 - Math.max(0, st.t) / st.T;
      beam(st.x, 0.1, st.z, st.x, 30, st.z, 0.03 + k * 0.08, CO.red, 0.6 + k * 1.2);
      if (!st._ring || st._ring < t - 0.12) { st._ring = t; ringFx.push({ x: st.x, z: st.z, y: 0.05, r: st.splash * (1.4 - k * 0.6), life: 0.25, max: 0.25, c: CO.red }); }
    }
    for (const f of game.fx) {
      if (f.kind === 'orbital') {
        const k = f.life / f.max;
        if (!f._seen) { f._seen = true; shake = Math.max(shake, 0.45); burst(f.x, 0.3, f.z, 70, CO.red, 5 * f.r, 0.7, 0.3, { grav: 4 }); burst(f.x, 0.3, f.z, 40, CO.fire2, 3 * f.r, 0.5, 0.25); burst(f.x, 0.2, f.z, 24, CO.smoke, 1.5 * f.r, 1.4, 0.7, { smoke: true, grav: -0.6, alpha: 0.6, grow: 2 }); ringFx.push({ x: f.x, z: f.z, y: 0.05, r: f.r * 1.6, life: 0.7, max: 0.7, c: CO.red }); for (let q2 = 0; q2 < 4; q2++) addP.emit(f.x, 0.5, f.z, 0, 0, 0, 0.25, f.r * 3, CO.fire2, 0.9); }
        beam(f.x, 0, f.z, f.x, 40, f.z, 0.25 + f.r * 0.5 * k, col('#ff2a2a'), 1.2 * k);
        beam(f.x, 0, f.z, f.x, 40, f.z, 0.08 + 0.2 * k, col('#ffd0c8'), 2 * k);
      } else if (f.kind === 'plasmaBoom' && !f._seen) {
        f._seen = true; burst(f.x, 0.5, f.z, 30, CO.red, 3 * f.r, 0.5, 0.2, { grav: 3 }); for (let q2 = 0; q2 < 2; q2++) addP.emit(f.x, 0.5, f.z, 0, 0, 0, 0.2, f.r * 2, CO.red, 0.9); ringFx.push({ x: f.x, z: f.z, y: 0.05, r: f.r * 1.2, life: 0.4, max: 0.4, c: CO.red });
      }
    }
    beamMesh.count = beamN; beamMesh.instanceMatrix.needsUpdate = true; if (beamMesh.instanceColor) beamMesh.instanceColor.needsUpdate = true;
    // Ringe
    let nr = 0;
    for (let i = ringFx.length - 1; i >= 0; i--) { const f = ringFx[i]; f.life -= dt; if (f.life <= 0) { ringFx.splice(i, 1); continue; } }
    for (const f of ringFx) {
      if (nr >= 60) break;
      const k = 1 - f.life / f.max, s = f.r * (0.3 + k * 0.9);
      _mat.compose(_pos.set(f.x, f.y, f.z), _quat.identity(), _sc.set(s, 1, s)); ringMesh.setMatrixAt(nr, _mat); _col.copy(f.c).multiplyScalar(1.4 * (1 - k)); ringMesh.setColorAt(nr, _col); nr++;
    }
    ringMesh.count = nr; ringMesh.instanceMatrix.needsUpdate = true; if (ringMesh.instanceColor) ringMesh.instanceColor.needsUpdate = true;
  }

  // ---------- Auswahl, Vorschau, Reichweite ----------
  function ghostFor(id) {
    if (ghostId === id && ghost) return ghost;
    if (ghost) scene.remove(ghost);
    ghost = buildTower(id, 0); ghostId = id;
    ghostMat ||= new THREE.MeshStandardMaterial({ color: '#cfe8d6', transparent: true, opacity: 0.55, roughness: 0.5, metalness: 0.2, depthWrite: false });
    ghost.traverse(o => { if (o.isMesh) { o.material = ghostMat; o.castShadow = false; } if (o.isSprite) o.visible = false; });
    scene.add(ghost);
    return ghost;
  }
  function syncSelection(sel) {
    const run = game.run;
    const placing = run && run.phase !== 'done' && sel.place;
    cellMesh.count = placing ? cellMesh.userData.n || 0 : 0;
    let rangeAt = null;
    if (placing && sel.hover?.inside) {
      const ok = !game.placeCheck(sel.place, sel.hover.c, sel.hover.r) || game.placeCheck(sel.place, sel.hover.c, sel.hover.r) === 'cash' && false;
      const why = game.placeCheck(sel.place, sel.hover.c, sel.hover.r);
      const g = ghostFor(sel.place); g.visible = true; g.scale.setScalar(TS); g.position.set(sel.hover.c + 0.5, 0, sel.hover.r + 0.5);
      g.userData.head.rotation.y = Math.sin(t * 0.8) * 0.6;
      ghostMat.color.set(why ? '#e08a7a' : '#cfe8d6');
      hover.visible = true; hover.position.set(sel.hover.c + 0.5, 0.012, sel.hover.r + 0.5); hoverMat.color.set(why ? '#ff8a7a' : '#e8f2e8');
      const s = game.towerStats(sel.place, 0);
      if (s.range) rangeAt = { x: sel.hover.c + 0.5, z: sel.hover.r + 0.5, r: s.range, c: why ? '#e07060' : T[sel.place].accent };
      void ok;
    } else {
      if (ghost) ghost.visible = false;
      hover.visible = !!(sel.hover?.inside && run && run.phase !== 'done' && game.towerAt(sel.hover.c, sel.hover.r));
      if (hover.visible) { hover.position.set(sel.hover.c + 0.5, 0.012, sel.hover.r + 0.5); hoverMat.color.set('#e8f2e8'); }
    }
    const st = sel.tower && game.towers.includes(sel.tower) ? sel.tower : null;
    if (!rangeAt && st) { const s = game.stats(st); if (s.range) rangeAt = { x: st.x, z: st.z, r: s.range, c: st.def.accent }; }
    else if (!rangeAt && !placing && sel.hover?.inside) { const h = game.towerAt(sel.hover.c, sel.hover.r); if (h) { const s = game.stats(h); if (s.range) rangeAt = { x: h.x, z: h.z, r: s.range, c: h.def.accent, soft: true }; } }
    if (rangeAt && rangeAt.r >= 50) rangeAt = null;
    rangeGrp.visible = !!rangeAt;
    if (rangeAt) {
      rangeGrp.position.set(rangeAt.x, 0.02, rangeAt.z); rangeGrp.scale.set(rangeAt.r, 1, rangeAt.r);
      rangeFill.material.color.set(rangeAt.c); rangeRing.material.color.set(rangeAt.c);
      rangeFill.material.opacity = rangeAt.soft ? 0.05 : 0.09; rangeRing.material.opacity = rangeAt.soft ? 0.35 : 0.7;
    }
    selRing.visible = !!st;
    if (st) { selRing.position.set(st.x, 0.03, st.z); selRing.material.color.set(st.def.accent); selRing.scale.setScalar(1 + Math.sin(t * 4) * 0.04); }
    // Verstärker-Verbindungen
    let nl = 0;
    if (st && st.def.kind === 'support') for (const o of game.towers) if (o.buff?.by.includes(st.uid)) {
      let m = buffLines.children[nl];
      if (!m) { m = new THREE.Mesh(buffGeo, buffMat); buffLines.add(m); }
      const dx = o.x - st.x, dz = o.z - st.z, L = Math.hypot(dx, dz);
      m.visible = true; m.scale.set(0.03, 0.03, L); m.position.set((o.x + st.x) / 2, 1.1, (o.z + st.z) / 2); m.rotation.y = Math.atan2(dx, dz); nl++;
    }
    if (st) buffMat.color.set(st.def.accent);
    for (let i = nl; i < buffLines.children.length; i++) buffLines.children[i].visible = false;
  }

  // ---------- Frame ----------
  function frame(dt, sel) {
    t += dt;
    const run = game.run;
    if (!run || !level) { renderer.render(scene, camera); return; }
    syncTowers(dt);
    syncEnemies();
    syncProjectiles(dt);
    syncSelection(sel || {});
    // Kern
    const hpK = Math.max(0, run.coreHp / run.coreMax);
    coreFlash = Math.max(0, coreFlash - dt * 2.5);
    level.crystal.rotation.y += dt * 0.8;
    level.crystal.position.y = 1.05 + Math.sin(t * 1.6) * 0.06;
    level.cHalo.position.y = level.crystal.position.y;
    const cc = new THREE.Color('#5fb8c8').lerp(new THREE.Color('#c84a3a'), Math.max(coreFlash, (1 - hpK) * 0.8));
    level.crystalMat.emissive.copy(cc); level.crystalMat.emissiveIntensity = 1.4 + coreFlash * 2 + Math.sin(t * 2) * 0.15;
    level.cHalo.material.color.copy(cc); level.cLight.color.copy(cc);
    level.cRings.forEach((r, i) => { r.rotation.x = Math.PI / 2 + Math.sin(t * 0.7 + i) * 0.5; r.rotation.y += dt * (i ? -1 : 1.3); });
    for (const p of level.portals) p.sw.rotation.z = -t * 2;
    for (const [lx, lz] of level.lavaSpots) if (R() < dt * 2.5 * pq()) addP.emit(lx + (R() - 0.5) * 0.6, 0.1, lz + (R() - 0.5) * 0.6, 0, 0.6 + R() * 0.6, 0, 1, 0.1, CO.fire, 0.8, -0.2);
    if (R() < dt * 3 * pq()) { const p = level.portals[Math.floor(R() * level.portals.length)]; addP.emit(p.x + (R() - 0.5) * 0.8, 0.2 + R() * 1, p.z + (R() - 0.5) * 0.8, 0, 0.3, 0, 1, 0.12, CO.red, 0.7, -0.2); }
    if (R() < dt * 4 * pq()) addP.emit(run.core.x + (R() - 0.5) * 1.6, 0.1, run.core.z + (R() - 0.5) * 1.6, 0, 0.6, 0, 1.6, 0.08, CO.cyan, 0.7, -0.15);
    addP.update(dt); smoke.update(dt);
    for (const x of texts) x.life -= dt;
    while (texts.length && texts[0].life <= 0) texts.shift();
    // Kamera: Anflug + Wackeln
    camK += (1 - camK) * Math.min(1, dt * 2.2);
    shake = Math.max(0, shake - dt * 1.8);
    const sh = game.meta.settings.shake === 'off' ? 0 : shake * shake * 0.35;
    camera.position.copy(target).addScaledVector(camDir, camDist * camK);
    camera.position.x += (R() - 0.5) * sh; camera.position.y += (R() - 0.5) * sh; camera.position.z += (R() - 0.5) * sh;
    camera.lookAt(target);
    renderer.render(scene, camera);
  }

  // ---------- 2D-Overlay: Lebensbalken, Zahlen ----------
  function drawOverlay(ctx, cssW, cssH, d, showNumbers) {
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    const run = game.run; if (!run || !level) return;
    for (const e of game.enemies) {
      if (e.dead) continue;
      const top = e.y + (e.boss ? (e.type === 'fuerst' ? 2.1 : 1.65) : e.E.size * 1.9 * ES + 0.12);
      if (showNumbers && e.dmgAcc > 0) { e.numT -= 1 / 60; if (e.numT <= 0) { floatText(e.x + (R() - 0.5) * 0.2, top, e.z, Math.round(e.dmgAcc) || '<1', e.armor > 0 ? '#c9c2b0' : '#f2ece0', e.dmgAcc > 100); e.dmgAcc = 0; e.numT = 0.3; } } else e.dmgAcc = 0;
      if (e.hp >= e.maxHp - 0.01 && !e.boss) continue;
      const s = toScreen(e.x, top, e.z); if (!s.vis) continue;
      const w = e.boss ? 64 : 26, h = e.boss ? 6 : 4, k = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = 'rgba(8,8,10,.8)'; ctx.fillRect(s.x - w / 2 - 1, s.y - 1, w + 2, h + 2);
      ctx.fillStyle = k > 0.5 ? '#9ac06a' : k > 0.25 ? '#d8b04a' : '#d0544a'; ctx.fillRect(s.x - w / 2, s.y, w * k, h);
      if (e.armor > 0) { ctx.fillStyle = '#b8bcc0'; ctx.fillRect(s.x - w / 2, s.y + h - 1, w * k, 1); }
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const x of texts) {
      const k = 1 - x.life / x.max, s = toScreen(x.x, x.y + k * 0.5, x.z); if (!s.vis) continue;
      ctx.globalAlpha = Math.min(1, x.life / x.max * 2.5);
      ctx.font = `700 ${x.big ? 17 : 13}px "Barlow Condensed", Barlow, sans-serif`;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,10,12,.85)'; ctx.strokeText(x.txt, s.x, s.y);
      ctx.fillStyle = x.color; ctx.fillText(x.txt, s.x, s.y);
    }
    ctx.globalAlpha = 1;
  }

  return {
    frame, resize, pick, toScreen, drawOverlay, renderer, camera,
    get portrait() { return portrait; },
    fit,
    destroy() { offs.forEach(f => f()); disposeLevel(); renderer.dispose(); },
  };
}

// =====================================================================
// ICONS: Türme & Gegner einmal rendern (für Menüs, Karten, Booster)
// =====================================================================
export function createIconRenderer(size = 256) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(size, size, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.environment = envMap(renderer); scene.environmentIntensity = 0.7;
  scene.add(new THREE.HemisphereLight('#aab4c8', '#2a2622', 1.4));
  const key = new THREE.DirectionalLight('#f0f2f8', 2.6); key.position.set(-3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight('#9a86c0', 1.4); rim.position.set(3, 2, -4); scene.add(rim);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  const sil = new THREE.MeshBasicMaterial({ color: '#0c0d10' });
  const box = new THREE.Box3(), ctr = new V3(), sz = new V3();
  function shoot(obj, { silhouette = false, yaw = -0.6, pitch = 0.42 } = {}) {
    scene.add(obj);
    obj.updateMatrixWorld(true);
    // Bildausschnitt nur aus den echten Modellteilen (ohne Leuchtsprites und Himmelsstrahl)
    box.makeEmpty();
    obj.traverse(o => { if (o.isMesh && !o.userData.skip) { o.geometry.computeBoundingBox(); box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
    obj.traverse(o => { if (o.userData.skip) o.visible = false; });
    box.getCenter(ctr); box.getSize(sz);
    const r = Math.max(sz.x, sz.y * 1.05, sz.z) * 0.62 + 0.05;
    const D = r / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * 1.08;
    cam.position.set(ctr.x + Math.sin(yaw) * Math.cos(pitch) * D, ctr.y + Math.sin(pitch) * D, ctr.z + Math.cos(yaw) * Math.cos(pitch) * D);
    cam.lookAt(ctr); cam.updateProjectionMatrix();
    scene.overrideMaterial = silhouette ? sil : null;
    renderer.render(scene, cam);
    scene.overrideMaterial = null;
    scene.remove(obj);
    return canvas.toDataURL('image/png');
  }
  return {
    tower(id, lv = 0, opts) { const o = buildTower(id, lv); const u = shoot(o, opts); o.traverse(x => { if (x.geometry) x.geometry.dispose(); }); return u; },
    enemy(type, opts) {
      const g = enemyGeo(type), M = mats(), grp = new THREE.Group();
      grp.add(new THREE.Mesh(g.body, M.body));
      if (g.glow) grp.add(new THREE.Mesh(g.glow, M.glow));
      grp.add(new THREE.Mesh(g.body, outlineMat(OUTLINE, ENEMIES[type].boss ? 0.035 : 0.022)));
      if (type === 'flieger') for (const s of [-1, 1]) { const w = new THREE.Mesh(wingGeo(s), M.body); w.rotation.z = s * -0.3; grp.add(w); }
      return shoot(grp, { yaw: 0.55, pitch: 0.25, ...opts });
    },
    dispose() { renderer.dispose(); renderer.forceContextLoss?.(); },
  };
}

export { Kit, halo, envMap };
