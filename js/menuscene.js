// Packfall – lebendige Menü-Szene: Nachtlandschaft mit Parallax (Maus), Turm auf dem Hügel,
// Sterne, Mond, Nebel, Glühwürmchen, Fledermäuse, Sternschnuppen. Pixel-Art in niedriger Auflösung.
const W0 = 400, H0 = 225, PAD = 24;

function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function layer(w = W0 + PAD * 2, h = H0 + PAD) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

export function createMenuScene({ towerCanvas, treeCanvas }) {
  const rnd = seeded(4711);
  const TOWER_X = 268, HILL_Y = 158;

  // ---------- statische Ebenen ----------
  const moon = layer(60, 60);
  {
    const x = moon.getContext('2d');
    for (let y = -16; y <= 16; y++) for (let px = -16; px <= 16; px++) {
      const d = Math.hypot(px, y);
      if (d > 15.5) continue;
      let c = '#a8a498';
      if (px + y > 7) c = '#8d897e';
      if ((px - 5) ** 2 + (y + 4) ** 2 < 12 || (px + 6) ** 2 + (y - 6) ** 2 < 7 || (px + 1) ** 2 + (y - 9) ** 2 < 4 || (px - 8) ** 2 + (y - 3) ** 2 < 3) c = '#7e7a70';
      x.fillStyle = c; x.fillRect(30 + px, 30 + y, 1, 1);
    }
  }
  const ridge = (c, base, amp, col, seed, rough = 1) => {
    const x = c.getContext('2d'), r = seeded(seed);
    x.fillStyle = col;
    let h = base, v = 0;
    for (let px = 0; px < c.width; px++) {
      v += (r() - 0.5) * 1.6 * rough; v *= 0.9; h += v; h += (base - h) * 0.04;
      const top = Math.round(h + Math.sin(px * 0.02 + seed) * amp);
      x.fillRect(px, top, 1, c.height - top);
    }
  };
  const far = layer(); ridge(far, 138, 10, '#121319', 11, 2.2);
  const mid = layer(); ridge(mid, 160, 6, '#0d0e12', 23, 1.4);
  {
    // Nadelwald auf dem mittleren Kamm
    const x = mid.getContext('2d'), r = seeded(77);
    x.fillStyle = '#0d0e12';
    for (let i = 0; i < 70; i++) {
      const tx = Math.floor(r() * mid.width), h = 8 + Math.floor(r() * 12), by = 150 + Math.floor(r() * 14);
      for (let k = 0; k < h; k++) { const w = Math.max(0, Math.floor((k / h) * 4)); x.fillRect(tx - w, by - h + k, w * 2 + 1, 1); }
    }
  }
  const hill = layer();
  {
    const x = hill.getContext('2d');
    x.fillStyle = '#08090b';
    for (let px = 0; px < hill.width; px++) {
      const dx = (px - PAD - TOWER_X) / 70;
      const top = Math.round(HILL_Y + 6 + Math.min(40, dx * dx * 26) + Math.sin(px * 0.3) * 0.6);
      x.fillRect(px, top, 1, hill.height - top);
    }
    const t = towerCanvas;
    x.drawImage(t, PAD + TOWER_X - Math.floor(t.width / 2), HILL_Y + 8 - t.height);
    // Pfad den Hügel hinab
    x.fillStyle = '#16171b';
    for (let k = 0; k < 40; k++) x.fillRect(PAD + TOWER_X - 2 - k * 1.2 + Math.sin(k * 0.4) * 2, HILL_Y + 10 + k * 0.9, 3, 1);
  }
  const front = layer();
  {
    const x = front.getContext('2d'), r = seeded(99);
    x.fillStyle = '#050506';
    for (let px = 0; px < front.width; px++) {
      const edge = Math.min(px, front.width - px);
      const top = Math.round(206 + Math.sin(px * 0.05) * 3 - Math.max(0, 50 - edge) * 0.35 + (r() < 0.2 ? -1 : 0));
      x.fillRect(px, top, 1, front.height - top);
      if (r() < 0.25) x.fillRect(px, top - 1 - Math.floor(r() * 3), 1, 3);
    }
    [[10, 215, 2.2], [42, 220, 1.6], [372, 214, 2.0], [404, 222, 1.5]].forEach(([tx, ty, s]) => {
      const tr = treeCanvas(r, '#050506');
      x.drawImage(tr, tx, ty - tr.height * s, tr.width * s, tr.height * s);
    });
  }
  // weicher Nebel
  const fog = (() => {
    const w = 160, h = 60, c = layer(w, h), x = c.getContext('2d'), img = x.createImageData(w, h), r = seeded(5);
    const G = 6, grid = Array.from({ length: G * G }, () => r());
    const v = (u, q) => { const x0 = Math.floor(u) % G, y0 = Math.floor(q) % G, fx = u - Math.floor(u), fy = q - Math.floor(q), s = t => t * t * (3 - 2 * t);
      const a = grid[y0 * G + x0], b = grid[y0 * G + (x0 + 1) % G], c2 = grid[((y0 + 1) % G) * G + x0], d = grid[((y0 + 1) % G) * G + (x0 + 1) % G];
      return a + (b - a) * s(fx) + (c2 - a) * s(fy) + (a - b - c2 + d) * s(fx) * s(fy); };
    for (let y = 0; y < h; y++) for (let px = 0; px < w; px++) {
      let n = v((px / w) * G, (y / h) * G) * 0.7 + v((px / w) * G * 2, (y / h) * G * 2) * 0.3;
      n = Math.max(0, (n - 0.4) / 0.6) * Math.sin((y / h) * Math.PI);
      const i = (y * w + px) * 4; img.data[i] = 140; img.data[i + 1] = 148; img.data[i + 2] = 160; img.data[i + 3] = Math.round(n * 200);
    }
    x.putImageData(img, 0, 0); return c;
  })();
  const stars = Array.from({ length: 110 }, () => ({ x: rnd() * (W0 + PAD * 2), y: rnd() * 120, b: rnd(), p: rnd() * 6.28, s: rnd() < 0.1 ? 2 : 1 }));
  const flies = Array.from({ length: 22 }, () => ({ x: TOWER_X - 90 + rnd() * 180, y: 150 + rnd() * 50, p: rnd() * 6.28, sp: 0.4 + rnd() * 0.8 }));

  const buf = layer(W0, H0), bx = buf.getContext('2d');
  let mx = 0, my = 0, tmx = 0, tmy = 0, shoot = null, shootT = 5, bats = [], batT = 3, ash = [];
  window.addEventListener('pointermove', e => { tmx = (e.clientX / innerWidth) * 2 - 1; tmy = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

  function draw(ctx, W, H, t, dt, quality = 1) {
    mx += (tmx - mx) * Math.min(1, dt * 2.5); my += (tmy - my) * Math.min(1, dt * 2.5);
    // Himmel
    const g = bx.createLinearGradient(0, 0, 0, H0);
    g.addColorStop(0, '#06070a'); g.addColorStop(0.45, '#0e1016'); g.addColorStop(0.75, '#191b23'); g.addColorStop(1, '#1d1d24');
    bx.fillStyle = g; bx.fillRect(0, 0, W0, H0);
    const P = (d, k = 1) => [-PAD - mx * d * 18 * k, -my * d * 8 * k];
    // Sterne
    const [sx] = P(0.05);
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(t * (1 + s.b * 2) + s.p);
      if (tw < 0.25) continue;
      bx.fillStyle = s.b > 0.85 ? `rgba(200,196,186,${tw})` : `rgba(130,136,150,${tw * 0.8})`;
      bx.fillRect(Math.round(s.x + sx), Math.round(s.y), s.s, s.s);
    }
    // Sternschnuppe
    shootT -= dt;
    if (shootT <= 0 && !shoot) { shoot = { x: 60 + Math.random() * 220, y: 10 + Math.random() * 40, l: 0 }; shootT = 9 + Math.random() * 12; }
    if (shoot) {
      shoot.l += dt;
      const k = shoot.l / 0.8;
      for (let i = 0; i < 14; i++) { const a = (1 - i / 14) * (1 - k); bx.fillStyle = `rgba(220,215,200,${Math.max(0, a)})`; bx.fillRect(Math.round(shoot.x + k * 90 - i * 2), Math.round(shoot.y + k * 40 - i), 1, 1); }
      if (k >= 1) shoot = null;
    }
    // Mond
    const [mox, moy] = P(0.08);
    bx.drawImage(moon, Math.round(300 - 30 + mox + PAD), Math.round(46 - 30 + moy));
    // Ebenen
    const L = (c, d) => { const [ox, oy] = P(d); bx.drawImage(c, Math.round(ox), Math.round(oy)); };
    L(far, 0.12);
    fogBand(t * 4, 128, 0.35);
    L(mid, 0.25);
    fogBand(-t * 6, 150, 0.45);
    L(hill, 0.4);
    // Glühwürmchen am Hügel
    const [hx, hy] = P(0.4);
    for (const f of flies) {
      const on = Math.sin(t * 2 * f.sp + f.p) > 0.3;
      if (!on) continue;
      bx.fillStyle = '#c8e6b8';
      bx.fillRect(Math.round(f.x + Math.sin(t * f.sp + f.p) * 8 + hx + PAD), Math.round(f.y + Math.cos(t * f.sp * 0.7 + f.p) * 4 + hy), 1, 1);
    }
    L(front, 0.7);
    fogBand(t * 9, 196, 0.3);
    // Fledermäuse
    batT -= dt;
    if (batT <= 0) { batT = 6 + Math.random() * 8; const dir = Math.random() < 0.5 ? 1 : -1, y0 = 40 + Math.random() * 60; for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) bats.push({ x: dir > 0 ? -10 - i * 14 : W0 + 10 + i * 14, y: y0 + Math.random() * 20, v: dir * (30 + Math.random() * 14), p: Math.random() * 6 }); }
    bx.fillStyle = '#040405';
    for (const b of bats) {
      b.x += b.v * dt; const yy = Math.round(b.y + Math.sin(t * 3 + b.p) * 3), xx = Math.round(b.x), up = Math.sin(t * 18 + b.p) > 0;
      bx.fillRect(xx, yy, 2, 1); bx.fillRect(xx - 2, yy + (up ? -1 : 1), 2, 1); bx.fillRect(xx + 2, yy + (up ? -1 : 1), 2, 1);
    }
    bats = bats.filter(b => b.x > -40 && b.x < W0 + 40);

    // auf den Bildschirm (Cover, Fokus auf den Turm bei Hochformat)
    const sc = Math.max(W / W0, H / H0);
    const focusX = W / H < 1.2 ? TOWER_X / W0 : 0.5;
    const dw = W0 * sc, dh = H0 * sc;
    const ox = Math.max(W - dw, Math.min(0, W / 2 - dw * focusX)), oy = Math.max(H - dh, Math.min(0, (H - dh) / 2));
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(buf, ox, oy, dw, dh);
    // Licht (additiv): Mond, Turmfenster, Kristall, Fackeln, Glühwürmchen
    const S = (x, y) => [ox + x * sc, oy + y * sc];
    const glow = (x, y, r, c, a) => { const [gx, gy] = S(x, y), rr = r * sc, gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, rr); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = gr; ctx.fillRect(gx - rr, gy - rr, rr * 2, rr * 2); };
    ctx.globalCompositeOperation = 'lighter';
    glow(300 + mox + PAD, 46 + moy, 60, '150,150,165', 0.12);
    const tx = TOWER_X + hx + PAD, ty = HILL_Y + 8 + hy - towerCanvas.height;
    const fl = 0.85 + Math.sin(t * 9) * 0.06 + Math.sin(t * 23) * 0.04;
    glow(tx, ty + 22, 10, '200,140,80', 0.35 * fl);
    glow(tx, ty + 36, 10, '200,140,80', 0.3 * fl);
    glow(tx - 6, ty + 42, 9, '210,140,70', 0.4 * fl);
    glow(tx + 5, ty + 42, 9, '210,140,70', 0.4 * fl);
    glow(tx, ty - 6 + Math.sin(t * 2) * 1.2, 22, '120,150,165', 0.22 + Math.sin(t * 2.2) * 0.05);
    if (quality > 0.5) for (const f of flies) if (Math.sin(t * 2 * f.sp + f.p) > 0.3) glow(f.x + Math.sin(t * f.sp + f.p) * 8 + hx + PAD, f.y + Math.cos(t * f.sp * 0.7 + f.p) * 4 + hy, 4, '190,230,170', 0.25);
    ctx.globalCompositeOperation = 'source-over';
    // Asche
    if (ash.length < 40 && Math.random() < 0.4) ash.push({ x: Math.random() * W, y: H + 5, vx: (Math.random() - 0.3) * 14, vy: -(12 + Math.random() * 22), life: 8 + Math.random() * 6 });
    for (const a of ash) { a.life -= dt; a.x += (a.vx + Math.sin(t + a.y * 0.01) * 10) * dt; a.y += a.vy * dt; ctx.fillStyle = `rgba(190,185,175,${Math.min(1, a.life / 2) * 0.35})`; ctx.fillRect(a.x, a.y, Math.max(1.5, sc * 0.6), Math.max(1.5, sc * 0.6)); }
    ash = ash.filter(a => a.life > 0 && a.y > -10);
    // Vignette
    const vg = ctx.createRadialGradient(W * 0.6, H * 0.5, Math.min(W, H) * 0.2, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(2,2,3,.75)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }
  function fogBand(off, y, a) {
    const w = W0 + 160;
    const o = ((off % w) + w) % w;
    bx.globalAlpha = a;
    bx.imageSmoothingEnabled = true;
    for (let k = -1; k <= 1; k++) bx.drawImage(fog, o + k * w - 160, y - 30, w, 60);
    bx.imageSmoothingEnabled = false;
    bx.globalAlpha = 1;
  }
  return { draw };
}
