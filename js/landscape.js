// Packfall – Titel-/Menü-Hintergrund: düstere 3D-Landschaft (Berge, Nebeltal, Wald, See mit Mondspiegelung,
// der Kern auf seinem Hügel mit Lichtsäule, Maschinen-Türme als Wache, ferne Horde mit Fackeln).
import * as THREE from './vendor/three.module.min.js';
import { Kit, halo, envMap } from './td3d.js?v=0.10-199c7e81';

const V3 = THREE.Vector3;
function hash(x, y) { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, y, o = 5) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };
const ridged = (x, y, o = 5) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { const n = 1 - Math.abs(vnoise(x * f, y * f) * 2 - 1); s += a * n * n; f *= 2.1; a *= 0.5; } return s; };
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function seeded(s) { s = s >>> 0 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

const K = { x: 10, z: -34 };              // Kernhügel
const WATER = 0.4;
const valleyX = z => Math.sin(z * 0.018) * 14 - 22;
function baseH(x, z) {
  let h = fbm(x * 0.012 + 3, z * 0.012 + 7, 5) * 16 - 4;
  const far = smooth(45, 175, Math.hypot(x * 0.8, z + 10));
  h += far * ridged(x * 0.008 + 11, z * 0.008 + 5, 5) * 100 * (z < 0 ? 1 : 0.5);
  const dv = x - valleyX(z);
  h -= Math.exp(-(dv * dv) / (2 * 14 * 14)) * 11;
  const dk = Math.hypot(x - K.x, z - K.z);
  h += Math.exp(-(dk * dk) / (2 * 17 * 17)) * 15;
  return h;
}
const PLATEAU = baseH(K.x, K.z) + 0.5;
function H(x, z) {
  const dk = Math.hypot(x - K.x, z - K.z);
  const pk = smooth(10, 6, dk);
  return baseH(x, z) * (1 - pk) + PLATEAU * pk;
}

function canvasTex(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

export function createLandscape(renderer, { quality = () => 'hoch' } = {}) {
  const q = quality(), low = q === 'niedrig';
  const scene = new THREE.Scene();
  const FOG = new THREE.Color('#121823');
  scene.fog = new THREE.FogExp2(FOG, 0.0062);
  scene.background = FOG.clone();
  scene.environment = envMap(renderer); scene.environmentIntensity = 0.6;
  const cam = new THREE.PerspectiveCamera(42, 1, 0.5, 2400);

  // ---------- Himmel ----------
  const sky = new THREE.SphereGeometry(1500, 40, 20);
  { const p = sky.attributes.position, col = []; const top = new THREE.Color('#03040a'), mid = new THREE.Color('#0b1019'), hor = FOG.clone().multiplyScalar(1.05);
    for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 1500; const c = y < 0.08 ? hor.clone() : y < 0.35 ? hor.clone().lerp(mid, (y - 0.08) / 0.27) : mid.clone().lerp(top, Math.min(1, (y - 0.35) / 0.5)); col.push(c.r, c.g, c.b); }
    sky.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
  scene.add(new THREE.Mesh(sky, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
  const r0 = seeded(31);
  for (const [n, size, op] of [[1600, 1.4, 0.75], [160, 2.6, 0.95]]) {
    const pos = [];
    for (let i = 0; i < n; i++) { const a = r0() * Math.PI * 2, y = 0.08 + Math.pow(r0(), 0.7) * 0.92, rr = Math.sqrt(1 - y * y); pos.push(Math.cos(a) * rr * 1400, y * 1400, Math.sin(a) * rr * 1400); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#d8dce8', size, sizeAttenuation: false, transparent: true, opacity: op, fog: false, depthWrite: false })));
  }
  // Mond
  const moonDir = new V3(-0.42, 0.3, -1).normalize();
  const moonTex = canvasTex(256, 256, (x, w) => {
    const g = x.createRadialGradient(w * 0.42, w * 0.4, w * 0.05, w / 2, w / 2, w * 0.48);
    g.addColorStop(0, '#f2eee2'); g.addColorStop(0.75, '#c8c2b2'); g.addColorStop(1, '#9a958a');
    x.fillStyle = g; x.beginPath(); x.arc(w / 2, w / 2, w * 0.48, 0, 7); x.fill();
    for (const [cx, cy, r, a] of [[0.38, 0.45, 0.09, 0.12], [0.6, 0.6, 0.07, 0.1], [0.55, 0.3, 0.05, 0.1], [0.33, 0.66, 0.06, 0.08], [0.66, 0.42, 0.04, 0.08]]) { x.fillStyle = `rgba(90,84,74,${a})`; x.beginPath(); x.arc(cx * w, cy * w, r * w, 0, 7); x.fill(); }
  });
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, fog: false, depthWrite: false, toneMapped: false, color: new THREE.Color(1.15, 1.13, 1.08) }));
  moon.position.copy(moonDir).multiplyScalar(1300); moon.scale.setScalar(70); scene.add(moon);
  for (const [s, o] of [[520, 0.18], [190, 0.35]]) { const h = halo('#9aa8c8', s, o); h.material.fog = false; h.position.copy(moon.position).multiplyScalar(0.999); scene.add(h); }

  // ---------- Licht ----------
  scene.add(new THREE.HemisphereLight('#4c5a78', '#0a0a0e', 0.75));
  const moonL = new THREE.DirectionalLight('#b8c6e6', 1.7); moonL.position.copy(moonDir).multiplyScalar(100); scene.add(moonL);

  // ---------- Gelände ----------
  const seg = low ? 120 : 190;
  const tg = new THREE.PlaneGeometry(520, 520, seg, seg); tg.rotateX(-Math.PI / 2); tg.translate(0, 0, -90);
  { const p = tg.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    const cLow = new THREE.Color('#141a17'), cMid = new THREE.Color('#1d2421'), cRock = new THREE.Color('#2e3033'), cHigh = new THREE.Color('#596270');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = H(x, z);
      p.setY(i, h);
      const sl = Math.min(1, Math.hypot(H(x + 1.5, z) - h, H(x, z + 1.5) - h) / 2.2);
      c.copy(cLow).lerp(cMid, smooth(-2, 10, h)).lerp(cRock, sl * 0.85).lerp(cHigh, smooth(42, 85, h) * (0.5 + sl * 0.5));
      c.multiplyScalar(0.85 + vnoise(x * 0.3, z * 0.3) * 0.3);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    tg.setAttribute('color', new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals(); }
  scene.add(new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, flatShading: true })));
  // See
  const water = new THREE.Mesh(new THREE.PlaneGeometry(520, 520).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#070b10', metalness: 0.85, roughness: 0.22, envMapIntensity: 0.35 }));
  water.position.set(0, WATER, -90); scene.add(water);
  const glintTex = canvasTex(64, 512, (x, w, h) => {
    for (let i = 0; i < 160; i++) { const y = Math.random() * h, a = Math.pow(y / h, 1.6) * 0.5 * Math.random(); x.fillStyle = `rgba(230,236,250,${a})`; x.fillRect(w / 2 - (4 + Math.random() * 22) / 2 * (0.4 + y / h), y, (4 + Math.random() * 22) * (0.4 + y / h), 1 + Math.random() * 2); }
  });
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(14, 260).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glintTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85 }));
  glint.position.y = WATER + 0.05; scene.add(glint);

  // ---------- Wald & Felsen ----------
  const pine = new Kit();
  pine.cyl('body', 0.12, 0.18, 1.2, 5, '#1c1612', [0, 0.6, 0]);
  pine.cone('body', 1.2, 2.4, 7, '#18211b', [0, 2.0, 0]); pine.cone('body', 0.95, 2.0, 7, '#1b251e', [0, 3.0, 0]); pine.cone('body', 0.65, 1.6, 7, '#1f2a22', [0, 3.9, 0]);
  const pineGeo = pine.geo('body');
  const treeMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const r = seeded(77);
  const spots = [];
  const maxT = low ? 1200 : 3200;
  for (let i = 0; i < maxT * 6 && spots.length < maxT; i++) {
    const x = -230 + r() * 460, z = -260 + r() * 330;
    const h = H(x, z);
    if (h < WATER + 1.2 || h > 46) continue;
    const sl = Math.hypot(H(x + 1, z) - h, H(x, z + 1) - h);
    if (sl > 0.9) continue;
    if (Math.hypot(x - K.x, z - K.z) < 13) continue;
    if (fbm(x * 0.03 + 40, z * 0.03, 3) < 0.46) continue;
    if (Math.hypot(x + 4, z - 62) < 22) continue; // Blick frei halten
    spots.push([x, h, z, 0.7 + r() * 1.1, r() * 6.28]);
  }
  const trees = new THREE.InstancedMesh(pineGeo, treeMat, spots.length);
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new V3(), c4 = new THREE.Color();
  spots.forEach(([x, h, z, s, a], i) => { m4.compose(new V3(x, h - 0.2, z), q4.setFromAxisAngle(new V3(0, 1, 0), a), s4.set(s, s * (0.9 + r() * 0.4), s)); trees.setMatrixAt(i, m4); trees.setColorAt(i, c4.setScalar(0.75 + r() * 0.5)); });
  scene.add(trees);
  const rockK = new Kit(); rockK.rock('body', 1, '#2e2f31', [0, 0, 0]);
  const rocks = new THREE.InstancedMesh(rockK.geo('body'), treeMat, low ? 120 : 320);
  for (let i = 0; i < rocks.count; i++) { let x, z, h; do { x = -200 + r() * 400; z = -240 + r() * 300; h = H(x, z); } while (h < WATER + 0.5 || Math.hypot(x + 4, z - 62) < 18); const s = 0.6 + r() * 2.4; m4.compose(new V3(x, h - s * 0.3, z), q4.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), s4.set(s, s * (0.5 + r() * 0.6), s)); rocks.setMatrixAt(i, m4); rocks.setColorAt(i, c4.setScalar(0.7 + r() * 0.6)); }
  scene.add(rocks);

  // ---------- Der Kern auf dem Hügel ----------
  const core = new THREE.Group(); core.position.set(K.x, PLATEAU, K.z); scene.add(core);
  const kc = new Kit();
  kc.cyl('paint', 3.3, 3.7, 0.5, 6, '#4a4741', [0, 0.1, 0], [0, Math.PI / 6, 0]);
  kc.cyl('metal', 3.0, 3.0, 0.1, 6, '#a88f5e', [0, 0.38, 0], [0, Math.PI / 6, 0]);
  kc.cyl('metal', 1.0, 1.4, 1.0, 8, '#3a3f45', [0, 0.9, 0]);
  kc.tor('metal', 1.1, 0.1, '#c7a456', [0, 1.4, 0], [Math.PI / 2, 0, 0], 32);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; kc.cyl('paint', 0.22, 0.28, 2.2, 6, '#3d3b37', [Math.sin(a) * 2.6, 1.4, Math.cos(a) * 2.6]); kc.cone('metal', 0.26, 0.45, 6, '#a88f5e', [Math.sin(a) * 2.6, 2.7, Math.cos(a) * 2.6]); kc.sph('glow', 0.12, '#a8e4ee', [Math.sin(a) * 2.6, 3.0, Math.cos(a) * 2.6], [1, 1, 1], 8); }
  core.add(kc.build(false));
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#a6dfe9', emissive: '#5fbccc', emissiveIntensity: 2.2, roughness: 0.15, metalness: 0.1, flatShading: true }));
  crystal.scale.set(1, 1.7, 1); crystal.position.y = 3.9; core.add(crystal);
  const cHalo = halo('#8fd6e6', 16, 0.7); cHalo.position.y = 3.9; core.add(cHalo);
  const cHalo2 = halo('#8fd6e6', 46, 0.22); cHalo2.position.y = 3.9; core.add(cHalo2);
  const beamTex = canvasTex(8, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const beams = [];
  for (const [rt, rb, o] of [[1.2, 0.5, 0.5], [5, 1.4, 0.12]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, 260, 24, 1, true), new THREE.MeshBasicMaterial({ map: beamTex, color: '#8fd6e6', transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }));
    b.position.y = 4 + 130; core.add(b); beams.push(b);
  }
  const rings = [];
  for (let i = 0; i < 2; i++) { const kr = new Kit(); kr.tor('glow', 1.8 + i * 0.5, 0.05, '#8fd6e6', [0, 0, 0], [Math.PI / 2, 0, 0], 64); const m = kr.build(false); m.position.y = 3.9; core.add(m); rings.push(m); }
  const cLight = new THREE.PointLight('#7fd0e0', 900, 90, 1.7); cLight.position.y = 5; core.add(cLight);
  const guards = [];
  // Laternen am Pfad vom Tal zum Kern
  const lampPos = [];
  for (let i = 0; i < 16; i++) {
    const k = i / 15, z = 40 - k * 66, x = valleyX(z) * (1 - k) * 0.6 + K.x * k - 6 * Math.sin(k * 3.1);
    const h = Math.max(H(x, z), WATER + 0.3);
    lampPos.push([x, h, z]);
  }
  const lk = new Kit();
  for (const [x, h, z] of lampPos) { lk.cyl('dark', 0.07, 0.09, 1.6, 5, '#26221e', [x, h + 0.8, z]); lk.sph('glow', 0.16, '#ffb469', [x, h + 1.7, z], [1, 1, 1], 8); }
  scene.add(lk.build(false));
  for (const [x, h, z] of lampPos) { const s = halo('#ff9a50', 3.2, 0.55); s.position.set(x, h + 1.7, z); scene.add(s); }

  // ---------- Ferne Horde (Fackeln im Tal) ----------
  const hordeN = 90, hordeGeo = new THREE.BufferGeometry(), hordeArr = new Float32Array(hordeN * 3);
  const horde = Array.from({ length: hordeN }, () => ({ k: r(), off: (r() - 0.5) * 9, sp: 0.004 + r() * 0.004, f: r() * 6 }));
  hordeGeo.setAttribute('position', new THREE.BufferAttribute(hordeArr, 3).setUsage(THREE.DynamicDrawUsage));
  const hordePts = new THREE.Points(hordeGeo, new THREE.PointsMaterial({ map: (halo('#fff', 1).material.map), color: '#ff6a40', size: 2.4, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 }));
  hordePts.frustumCulled = false; scene.add(hordePts);
  // Glühwürmchen in Kameranähe
  const flyN = low ? 50 : 140, flyGeo = new THREE.BufferGeometry(), flyArr = new Float32Array(flyN * 3);
  const flies = Array.from({ length: flyN }, () => { const x = -50 + r() * 100, z = -10 + r() * 60; return { x, z, y: H(x, z) + 1 + r() * 5, p: r() * 6.28, s: 0.3 + r() * 0.8 }; });
  flyGeo.setAttribute('position', new THREE.BufferAttribute(flyArr, 3).setUsage(THREE.DynamicDrawUsage));
  const flyPts = new THREE.Points(flyGeo, new THREE.PointsMaterial({ map: (halo('#fff', 1).material.map), color: '#b8f0a0', size: 0.9, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85 }));
  flyPts.frustumCulled = false; scene.add(flyPts);
  // Nebelschwaden
  const mistTex = canvasTex(256, 256, (x, w) => {
    const rr = seeded(5);
    for (let i = 0; i < 70; i++) { const cx = rr() * w, cy = rr() * w, rad = 20 + rr() * 60; for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, w], [0, -w]]) { const g = x.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, rad); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(cx + ox - rad, cy + oy - rad, rad * 2, rad * 2); } }
  });
  mistTex.wrapS = mistTex.wrapT = THREE.RepeatWrapping;
  const mists = [];
  for (const [y, o, rep] of [[3, 0.55, 3], [8, 0.4, 2.2], [15, 0.28, 1.6]]) {
    const t = mistTex.clone(); t.needsUpdate = true; t.repeat.set(rep, rep);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(520, 520).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, color: '#8a96aa', transparent: true, opacity: o, depthWrite: false }));
    m.position.set(0, y, -90); scene.add(m); mists.push(m);
  }

  // ---------- Kamera & Animation ----------
  let mx = 0, my = 0, tmx = 0, tmy = 0, t = 0, W = 1, H2 = 1, dist = 1;
  const onMove = e => { tmx = (e.clientX / innerWidth) * 2 - 1; tmy = (e.clientY / innerHeight) * 2 - 1; };
  window.addEventListener('pointermove', onMove, { passive: true });
  const target = new V3(K.x - 6, PLATEAU + 7, K.z - 6);
  const camBase = new V3(-4, 0, 66);
  function resize(w, h) { W = Math.max(1, w); H2 = Math.max(1, h); cam.aspect = W / H2; cam.fov = W / H2 < 0.8 ? 58 : 42; cam.updateProjectionMatrix(); }
  function draw(dt, phase) {
    t += dt;
    mx += (tmx - mx) * Math.min(1, dt * 1.5); my += (tmy - my) * Math.min(1, dt * 1.5);
    const want = phase === 'menu' ? 0.88 : 1;
    dist += (want - dist) * Math.min(1, dt * 1.2);
    const a = Math.sin(t * 0.045) * 0.09 + mx * 0.05;
    const rel = camBase.clone().sub(target).multiplyScalar(dist);
    const ca = Math.cos(a), sa = Math.sin(a);
    const p = new V3(target.x + rel.x * ca - rel.z * sa, 0, target.z + rel.x * sa + rel.z * ca);
    p.y = Math.max(H(p.x, p.z) + 7, 25 * dist + Math.sin(t * 0.07) * 1.2 - my * 2.5);
    cam.position.copy(p);
    cam.lookAt(target.x + mx * 3, target.y - my * 1.5, target.z);
    // Mondspiegelung: Richtung Mond auf der Wasserfläche
    const az = Math.atan2(moonDir.x, moonDir.z);
    glint.position.x = cam.position.x + moonDir.x / Math.hypot(moonDir.x, moonDir.z) * 150;
    glint.position.z = cam.position.z + moonDir.z / Math.hypot(moonDir.x, moonDir.z) * 150;
    glint.rotation.y = az;
    // Kern
    crystal.rotation.y += dt * 0.6; crystal.position.y = 3.9 + Math.sin(t * 1.4) * 0.25;
    cHalo.position.y = cHalo2.position.y = crystal.position.y;
    cHalo.material.opacity = 0.62 + Math.sin(t * 2.1) * 0.08;
    rings.forEach((m, i) => { m.rotation.x = Math.PI / 2 + Math.sin(t * 0.6 + i) * 0.5; m.rotation.y += dt * (i ? -0.9 : 1.1); });
    beams.forEach((b, i) => { b.material.opacity = (i ? 0.1 : 0.42) + Math.sin(t * 1.7 + i) * 0.04; });
    for (const g of guards) {
      const ud = g.userData;
      if (ud.aimHead) ud.head.rotation.y += Math.sin(t * 0.4 + ud.phase) * dt * 0.35;
      for (const s of ud.spin) s.rotation.z += dt * 1.5;
      for (const rr of ud.rings) { if (rr.userData.orbit) rr.rotation.y += dt * 1.5; else rr.rotation.z += dt; }
      for (const o of ud.orbs) o.rotation.y += dt;
    }
    for (const m of mists) { m.material.map.offset.x += dt * 0.004; m.material.map.offset.y += dt * 0.0015; }
    horde.forEach((o, i) => {
      o.k = (o.k + o.sp * dt) % 1;
      const z = -230 + o.k * 150, x = valleyX(z) + o.off, h = Math.max(H(x, z), WATER) + 1.2;
      hordeArr[i * 3] = x; hordeArr[i * 3 + 1] = h + Math.sin(t * 9 + o.f) * 0.08; hordeArr[i * 3 + 2] = z;
    });
    hordeGeo.attributes.position.needsUpdate = true;
    hordePts.material.opacity = 0.75 + Math.sin(t * 13) * 0.08;
    flies.forEach((f, i) => { flyArr[i * 3] = f.x + Math.sin(t * f.s + f.p) * 2; flyArr[i * 3 + 1] = f.y + Math.sin(t * f.s * 1.3 + f.p) * 0.8; flyArr[i * 3 + 2] = f.z + Math.cos(t * f.s * 0.8 + f.p) * 2; });
    flyGeo.attributes.position.needsUpdate = true;
    flyPts.material.opacity = 0.55 + Math.sin(t * 2.3) * 0.3;
    renderer.setRenderTarget(null);
    renderer.render(scene, cam);
  }
  return { draw, resize, destroy() { window.removeEventListener('pointermove', onMove); } };
}
