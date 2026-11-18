// Packfall – Menü-/Titel-/Intro-Szene in voller Auflösung (keine Pixel):
// Nachthimmel, Mond, Wolken, drei Bergketten, Nadelwald, Hügel mit detailliertem Turm,
// Nebel, Glühwürmchen, Fledermäuse, Sternschnuppen. Weiche Parallax-Bewegung zur Maus.
const DW = 1600, DH = 900;

function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

export function createMenuScene() {
  const rnd = seeded(20251118);
  const TX = 1080, TY = 655; // Turmfuß

  // ---------- Geometrie einmalig erzeugen ----------
  const ridge = (base, amp, n, seed, rough) => {
    const r = seeded(seed), pts = [];
    let h = 0, v = 0;
    for (let i = 0; i <= n; i++) {
      v += (r() - 0.5) * rough; v *= 0.86; h += v; h *= 0.97;
      const x = -200 + (i / n) * (DW + 400);
      pts.push([x, base + h * amp + Math.sin(i * 0.11 + seed) * amp * 0.25]);
    }
    return pts;
  };
  const far = ridge(478, 46, 46, 3, 1.25);
  const mid = ridge(590, 22, 60, 7, 1.0);
  const pines = Array.from({ length: 90 }, () => { const x = -150 + rnd() * (DW + 300); return { x, h: 28 + rnd() * 46, w: 0.32 + rnd() * 0.12 }; });
  const stars = Array.from({ length: 170 }, () => ({ x: rnd() * DW, y: rnd() * 430, r: rnd() < 0.08 ? 1.6 : 0.6 + rnd() * 0.8, p: rnd() * 6.28, s: 0.6 + rnd() * 1.6 }));
  const clouds = Array.from({ length: 7 }, (_, i) => ({ x: rnd() * DW, y: 120 + rnd() * 260, w: 260 + rnd() * 320, h: 26 + rnd() * 24, v: 4 + rnd() * 7, a: 0.05 + rnd() * 0.06 }));
  const flies = Array.from({ length: 26 }, () => ({ x: TX - 360 + rnd() * 720, y: 640 + rnd() * 230, p: rnd() * 6.28, s: 0.3 + rnd() * 0.7 }));
  const grass = Array.from({ length: 260 }, () => ({ x: rnd() * (DW + 200) - 100, h: 10 + rnd() * 26, l: (rnd() - 0.5) * 8 }));
  const bricks = []; { const r = seeded(91); for (let y = 0; y < 18; y++) for (let k = 0; k < 4; k++) bricks.push({ y, k, d: r() }); }

  let mx = 0, my = 0, tmx = 0, tmy = 0, shoot = null, shootT = 4, bats = [], batT = 3, ash = [];
  window.addEventListener('pointermove', e => { tmx = (e.clientX / innerWidth) * 2 - 1; tmy = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

  function fillRidge(ctx, pts, col1, col2, top, bottom) {
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, col1); g.addColorStop(1, col2);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(pts[0][0], DH + 50);
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      if (i === 0) ctx.lineTo(x, y);
      else { const [px, py] = pts[i - 1]; ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2); }
    }
    ctx.lineTo(pts[pts.length - 1][0], DH + 50); ctx.closePath(); ctx.fill();
  }
  function fogBand(ctx, y, h, a, off) {
    const g = ctx.createLinearGradient(0, y - h, 0, y + h);
    g.addColorStop(0, 'rgba(120,128,142,0)'); g.addColorStop(0.5, `rgba(120,128,142,${a})`); g.addColorStop(1, 'rgba(120,128,142,0)');
    ctx.fillStyle = g; ctx.fillRect(-300, y - h, DW + 600, h * 2);
    // Schwaden
    for (let i = 0; i < 6; i++) {
      const x = ((i * 380 + off) % (DW + 600)) - 300, rr = 220 + (i % 3) * 60;
      const gg = ctx.createRadialGradient(x, y, 0, x, y, rr);
      gg.addColorStop(0, `rgba(130,138,150,${a * 0.9})`); gg.addColorStop(1, 'rgba(130,138,150,0)');
      ctx.fillStyle = gg; ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.22); ctx.translate(-x, -y);
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  function glow(ctx, x, y, r, c, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // ---------- der Turm ----------
  function tower(ctx, t) {
    const x = TX, b = TY;
    ctx.save();
    // Fundament
    let g = ctx.createLinearGradient(x - 70, 0, x + 70, 0);
    g.addColorStop(0, '#3b3c44'); g.addColorStop(0.45, '#2a2b31'); g.addColorStop(1, '#17171b');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x - 74, b + 6); ctx.lineTo(x - 58, b - 34); ctx.lineTo(x + 58, b - 34); ctx.lineTo(x + 74, b + 6); ctx.closePath(); ctx.fill();
    // Schaft (verjüngt)
    const top = b - 290, wB = 46, wT = 38;
    g = ctx.createLinearGradient(x - wB, 0, x + wB, 0);
    g.addColorStop(0, '#585a64'); g.addColorStop(0.22, '#45474f'); g.addColorStop(0.6, '#2c2d33'); g.addColorStop(1, '#18181c');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x - wB, b - 34); ctx.lineTo(x - wT, top); ctx.lineTo(x + wT, top); ctx.lineTo(x + wB, b - 34); ctx.closePath(); ctx.fill();
    // Steinlagen
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(10,10,12,.35)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 18; i++) {
      const yy = b - 40 - i * 14.5;
      ctx.beginPath(); ctx.moveTo(x - 60, yy); ctx.lineTo(x + 60, yy); ctx.stroke();
      for (let k = 0; k < 4; k++) { const bx = x - 40 + k * 24 + (i % 2) * 12; ctx.beginPath(); ctx.moveTo(bx, yy); ctx.lineTo(bx, yy - 14.5); ctx.stroke(); }
    }
    for (const br of bricks) if (br.d < 0.18) { ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(x - 40 + br.k * 24 + (br.y % 2) * 12, b - 54 - br.y * 14.5, 24, 14.5); }
    // Mondlicht-Kante
    const rim = ctx.createLinearGradient(x - wB, 0, x - wB + 10, 0);
    rim.addColorStop(0, 'rgba(190,200,215,.25)'); rim.addColorStop(1, 'rgba(190,200,215,0)');
    ctx.fillStyle = rim; ctx.fillRect(x - wB - 2, top, 14, b - top);
    ctx.restore();
    // Kammer oben mit Konsolen
    const cTop = top - 46;
    g = ctx.createLinearGradient(x - 56, 0, x + 56, 0);
    g.addColorStop(0, '#5a5c66'); g.addColorStop(0.3, '#43454d'); g.addColorStop(1, '#1a1a1e');
    ctx.fillStyle = g; ctx.fillRect(x - 56, cTop, 112, 46);
    ctx.fillStyle = '#1e1e23';
    for (let k = 0; k < 7; k++) { const cx = x - 50 + k * 16.6; ctx.beginPath(); ctx.moveTo(cx - 6, top); ctx.lineTo(cx + 6, top); ctx.lineTo(cx, top + 12); ctx.closePath(); ctx.fill(); }
    // Zinnen
    for (let k = 0; k < 6; k++) { ctx.fillStyle = k < 2 ? '#5f616b' : k < 4 ? '#43454d' : '#232328'; ctx.fillRect(x - 56 + k * 20, cTop - 16, 13, 16); }
    // Spitzdach
    g = ctx.createLinearGradient(x - 50, 0, x + 50, 0);
    g.addColorStop(0, '#3a3542'); g.addColorStop(0.45, '#26222c'); g.addColorStop(1, '#121015');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x - 50, cTop - 14); ctx.lineTo(x, cTop - 160); ctx.lineTo(x + 50, cTop - 14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
    for (let k = 1; k < 6; k++) { const yy = cTop - 14 - k * 24, w = 50 * (1 - (k * 24) / 146); ctx.beginPath(); ctx.moveTo(x - w, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
    ctx.fillStyle = '#1b1820'; ctx.fillRect(x - 1.5, cTop - 190, 3, 32);
    // Fenster (warm)
    const fl = 0.85 + Math.sin(t * 7) * 0.06 + Math.sin(t * 19) * 0.04;
    const win = (wx, wy, w, h) => {
      ctx.fillStyle = '#0c0b0a'; ctx.beginPath(); ctx.moveTo(wx - w / 2 - 2, wy + h); ctx.lineTo(wx - w / 2 - 2, wy); ctx.arc(wx, wy, w / 2 + 2, Math.PI, 0); ctx.lineTo(wx + w / 2 + 2, wy + h); ctx.closePath(); ctx.fill();
      const wg = ctx.createLinearGradient(0, wy - w / 2, 0, wy + h);
      wg.addColorStop(0, `rgba(250,200,120,${0.95 * fl})`); wg.addColorStop(1, `rgba(200,120,60,${0.9 * fl})`);
      ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(wx - w / 2, wy + h); ctx.lineTo(wx - w / 2, wy); ctx.arc(wx, wy, w / 2, Math.PI, 0); ctx.lineTo(wx + w / 2, wy + h); ctx.closePath(); ctx.fill();
    };
    win(x - 4, b - 150, 10, 20); win(x - 3, b - 230, 9, 18);
    for (let k = 0; k < 3; k++) win(x - 26 + k * 26, cTop + 14, 8, 14);
    // Banner
    for (const [bx, ph] of [[x - 44, 0], [x + 36, 1.3]]) {
      const sw = Math.sin(t * 1.6 + ph) * 3;
      const bg = ctx.createLinearGradient(bx, 0, bx + 12, 0); bg.addColorStop(0, '#5e1d1f'); bg.addColorStop(1, '#3a1012');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.moveTo(bx, top + 6); ctx.lineTo(bx + 12, top + 6); ctx.lineTo(bx + 12 + sw, top + 78); ctx.lineTo(bx + 6 + sw, top + 68); ctx.lineTo(bx + sw, top + 78); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(200,170,110,.55)'; ctx.beginPath(); ctx.arc(bx + 6 + sw * 0.4, top + 30, 3, 0, Math.PI * 2); ctx.fill();
    }
    // Tor
    ctx.fillStyle = '#0b0a09'; ctx.beginPath(); ctx.moveTo(x - 15, b - 34); ctx.lineTo(x - 15, b - 62); ctx.arc(x, b - 62, 15, Math.PI, 0); ctx.lineTo(x + 15, b - 34); ctx.closePath(); ctx.fill();
    const dg = ctx.createLinearGradient(0, b - 75, 0, b - 34); dg.addColorStop(0, `rgba(230,160,80,${0.55 * fl})`); dg.addColorStop(1, `rgba(150,80,40,${0.75 * fl})`);
    ctx.fillStyle = dg; ctx.beginPath(); ctx.moveTo(x - 11, b - 34); ctx.lineTo(x - 11, b - 62); ctx.arc(x, b - 62, 11, Math.PI, 0); ctx.lineTo(x + 11, b - 34); ctx.closePath(); ctx.fill();
    // Treppe
    ctx.fillStyle = '#26262c'; for (let k = 0; k < 3; k++) ctx.fillRect(x - 20 - k * 6, b - 34 + k * 7, 40 + k * 12, 7);
    ctx.restore();
    return { top: cTop - 190, chamber: cTop, door: b - 50, fl };
  }

  // ---------- Zeichnen ----------
  function draw(ctx, W, H, t, dt, quality = 1, cam = null) {
    mx += (tmx - mx) * Math.min(1, dt * 2); my += (tmy - my) * Math.min(1, dt * 2);
    const base = Math.max(W / DW, H / DH);
    const zoom = cam?.zoom || 1;
    const sc = base * zoom;
    // Fokus: Hochformat → Turm, sonst Mitte; Kamera kann überschreiben
    const fx = cam?.fx ?? (W / H < 1.2 ? TX / DW : 0.5), fy = cam?.fy ?? 0.5;
    let ox = W / 2 - fx * DW * sc, oy = H / 2 - fy * DH * sc;
    ox = Math.min(0, Math.max(W - DW * sc, ox)); oy = Math.min(0, Math.max(H - DH * sc, oy));
    const L = (depth, fn) => { ctx.save(); ctx.translate(ox - mx * depth * 34 * sc, oy - my * depth * 14 * sc); ctx.scale(sc, sc); fn(); ctx.restore(); };
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    // Himmel
    L(0, () => {
      const g = ctx.createLinearGradient(0, 0, 0, DH);
      g.addColorStop(0, '#05060a'); g.addColorStop(0.35, '#0a0c13'); g.addColorStop(0.62, '#151823'); g.addColorStop(0.78, '#1d202b'); g.addColorStop(1, '#0d0e12');
      ctx.fillStyle = g; ctx.fillRect(-200, -200, DW + 400, DH + 400);
    });
    // Sterne
    L(0.03, () => {
      for (const s of stars) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
        ctx.fillStyle = `rgba(214,216,226,${a * (s.r > 1.2 ? 1 : 0.7)})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.r > 1.2) glow(ctx, s.x, s.y, 8, '200,205,225', 0.25 * a);
      }
      // Sternschnuppe
      shootT -= dt;
      if (shootT <= 0 && !shoot) { shoot = { x: 200 + Math.random() * 900, y: 60 + Math.random() * 160, l: 0 }; shootT = 8 + Math.random() * 12; }
      if (shoot) {
        shoot.l += dt; const k = shoot.l / 0.9, hx = shoot.x + k * 340, hy = shoot.y + k * 140;
        const g = ctx.createLinearGradient(hx - 120, hy - 50, hx, hy); g.addColorStop(0, 'rgba(230,226,214,0)'); g.addColorStop(1, `rgba(240,236,224,${0.9 * (1 - k)})`);
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx - 120, hy - 50); ctx.lineTo(hx, hy); ctx.stroke();
        if (k >= 1) shoot = null;
      }
    });
    // Mond
    L(0.06, () => {
      const mxp = 1210, myp = 185, R = 64;
      glow(ctx, mxp, myp, R * 4, '150,158,180', 0.13);
      glow(ctx, mxp, myp, R * 1.7, '190,196,210', 0.18);
      const g = ctx.createRadialGradient(mxp - 20, myp - 22, 8, mxp, myp, R);
      g.addColorStop(0, '#e2ddd0'); g.addColorStop(0.7, '#bdb7a8'); g.addColorStop(1, '#8f8a7d');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mxp, myp, R, 0, Math.PI * 2); ctx.fill();
      for (const [cx, cy, cr, a] of [[-18, -10, 14, 0.12], [20, 16, 10, 0.1], [8, -28, 7, 0.1], [-26, 24, 9, 0.08], [30, -12, 6, 0.08]]) { ctx.fillStyle = `rgba(80,74,64,${a})`; ctx.beginPath(); ctx.arc(mxp + cx, myp + cy, cr, 0, Math.PI * 2); ctx.fill(); }
      const sh = ctx.createRadialGradient(mxp + 40, myp + 30, R * 0.4, mxp + 20, myp + 10, R * 1.3); sh.addColorStop(0, 'rgba(10,12,18,.45)'); sh.addColorStop(1, 'rgba(10,12,18,0)');
      ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(mxp, myp, R, 0, Math.PI * 2); ctx.fill();
    });
    // Wolken
    L(0.08, () => {
      for (const c of clouds) {
        c.x += c.v * dt; if (c.x - c.w > DW + 200) c.x = -c.w - 200;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.w / 2);
        g.addColorStop(0, `rgba(120,126,140,${c.a})`); g.addColorStop(1, 'rgba(120,126,140,0)');
        ctx.save(); ctx.translate(c.x, c.y); ctx.scale(1, c.h / (c.w / 2)); ctx.translate(-c.x, -c.y);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, c.w / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    });
    // Ferne Berge
    L(0.14, () => { fillRidge(ctx, far, '#1e222e', '#121520', 380, 620); fogBand(ctx, 545, 50, 0.1, t * 6); });
    // Marschierende Monster (nur im Intro)
    if (cam?.march) L(0.2, () => {
      // Horde: geduckte Goblins mit Speeren und glühenden Augen, wippend im Gleichschritt
      for (let i = 0; i < 34; i++) {
        const sp = 0.028 + ((i * 37) % 11) * 0.0012, k = (t * sp + ((i * 0.618) % 1)) % 1;
        const x = 60 + k * 860, sz = 0.75 + ((i * 13) % 7) * 0.06, row = (i % 3) * 9;
        const bob = Math.abs(Math.sin(t * 5 + i)) * 2.2, y = 586 + row - bob;
        ctx.save(); ctx.translate(x, y); ctx.scale(sz, sz);
        ctx.fillStyle = '#06070a';
        const leg = Math.sin(t * 10 + i) * 3;
        ctx.fillRect(-4 + leg, 6, 2.4, 8); ctx.fillRect(2 - leg, 6, 2.4, 8);
        ctx.beginPath(); ctx.ellipse(0, 0, 7, 9, 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, -9, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(1, -12); ctx.lineTo(-3, -18); ctx.lineTo(3, -13); ctx.fill();
        ctx.strokeStyle = '#06070a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(8, 4); ctx.lineTo(14, -22); ctx.stroke();
        ctx.fillStyle = '#5a5f68'; ctx.beginPath(); ctx.moveTo(14, -22); ctx.lineTo(12.5, -17); ctx.lineTo(15.5, -17); ctx.fill();
        if (Math.sin(t * 2 + i * 1.7) > -0.8) { ctx.fillStyle = 'rgba(235,80,60,.95)'; ctx.fillRect(5, -10.5, 1.8, 1.4); ctx.fillRect(7.6, -10.5, 1.8, 1.4); }
        ctx.restore();
      }
    });
    // Mittlere Kette + Nadelwald
    L(0.22, () => {
      fillRidge(ctx, mid, '#151821', '#0c0d12', 520, 720);
      ctx.fillStyle = '#0e1016';
      for (const p of pines) {
        const i = Math.max(0, Math.min(mid.length - 1, Math.round(((p.x + 200) / (DW + 400)) * (mid.length - 1))));
        const y = mid[i][1] + 14;
        ctx.beginPath(); ctx.moveTo(p.x, y - p.h); ctx.lineTo(p.x + p.h * p.w, y); ctx.lineTo(p.x - p.h * p.w, y); ctx.closePath(); ctx.fill();
      }
      fogBand(ctx, 640, 60, 0.12, -t * 9);
    });
    // Hügel mit Turm
    let T = null;
    L(0.4, () => {
      const g = ctx.createLinearGradient(0, 600, 0, DH);
      g.addColorStop(0, '#15161c'); g.addColorStop(1, '#08090b');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(TX - 760, DH + 60);
      ctx.bezierCurveTo(TX - 480, 760, TX - 220, 668, TX - 60, 652);
      ctx.lineTo(TX + 60, 652);
      ctx.bezierCurveTo(TX + 240, 670, TX + 480, 770, TX + 820, DH + 60);
      ctx.closePath(); ctx.fill();
      // Pfad
      ctx.strokeStyle = 'rgba(70,72,80,.35)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(TX - 6, 660); ctx.bezierCurveTo(TX - 60, 720, TX + 40, 780, TX - 90, 900); ctx.stroke();
      T = tower(ctx, t);
      // Glühwürmchen
      for (const f of flies) {
        const on = 0.5 + 0.5 * Math.sin(t * 2.2 * f.s + f.p);
        if (on < 0.35) continue;
        const fx2 = f.x + Math.sin(t * f.s + f.p) * 22, fy2 = f.y + Math.cos(t * f.s * 0.7 + f.p) * 10;
        glow(ctx, fx2, fy2, 14, '190,235,170', 0.22 * on);
        ctx.fillStyle = `rgba(220,250,200,${on})`; ctx.beginPath(); ctx.arc(fx2, fy2, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    });
    // Licht am Turm (additiv)
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    L(0.4, () => {
      glow(ctx, TX, T.door, 70, '220,140,70', 0.32 * T.fl);
      glow(ctx, TX - 4, 505, 40, '230,160,80', 0.22 * T.fl);
      glow(ctx, TX, T.chamber + 20, 70, '230,160,80', 0.16 * T.fl);
      const cy = T.top - 26 + Math.sin(t * 1.8) * 5;
      glow(ctx, TX, cy, 110, '120,160,185', 0.28 + Math.sin(t * 2.3) * 0.06);
      glow(ctx, TX, cy, 26, '220,235,245', 0.6);
    });
    ctx.restore();
    L(0.4, () => {
      const cy = T.top - 26 + Math.sin(t * 1.8) * 5;
      ctx.fillStyle = '#d8ecf2'; ctx.beginPath(); ctx.moveTo(TX, cy - 16); ctx.lineTo(TX + 8, cy); ctx.lineTo(TX, cy + 16); ctx.lineTo(TX - 8, cy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(90,130,150,.8)'; ctx.beginPath(); ctx.moveTo(TX, cy - 16); ctx.lineTo(TX + 8, cy); ctx.lineTo(TX, cy + 16); ctx.closePath(); ctx.fill();
    });
    // Vordergrund: Gras + tote Bäume
    L(0.75, () => {
      const g = ctx.createLinearGradient(0, 820, 0, DH);
      g.addColorStop(0, '#07080a'); g.addColorStop(1, '#030304');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(-200, DH + 40); ctx.lineTo(-200, 850);
      ctx.bezierCurveTo(300, 830, 700, 870, 1000, 860); ctx.bezierCurveTo(1300, 850, 1600, 830, 1900, 845); ctx.lineTo(1900, DH + 40); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#06070a'; ctx.lineWidth = 2.2;
      for (const gr of grass) { const sway = Math.sin(t * 1.4 + gr.x * 0.02) * 2.5; ctx.beginPath(); ctx.moveTo(gr.x, 868); ctx.quadraticCurveTo(gr.x + gr.l * 0.5, 868 - gr.h * 0.6, gr.x + gr.l + sway, 868 - gr.h); ctx.stroke(); }
      const tree = (x, y, s, flip) => {
        ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
        ctx.strokeStyle = '#040406'; ctx.lineCap = 'round';
        const br = (len, ang, w, d) => { if (d > 4) return; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke(); ctx.save(); ctx.translate(0, -len); ctx.rotate(ang); br(len * 0.7, ang * 0.9, w * 0.66, d + 1); ctx.restore(); ctx.save(); ctx.translate(0, -len); ctx.rotate(-ang * 0.8); br(len * 0.62, ang, w * 0.6, d + 1); ctx.restore(); };
        br(120, 0.5, 14, 0); ctx.restore();
      };
      tree(60, 880, 1.4, false); tree(1560, 880, 1.2, true);
    });
    // Fledermäuse
    batT -= dt;
    if (batT <= 0) { batT = 6 + Math.random() * 8; const dir = Math.random() < 0.5 ? 1 : -1, y0 = 180 + Math.random() * 220; for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) bats.push({ x: dir > 0 ? -60 - i * 50 : DW + 60 + i * 50, y: y0 + Math.random() * 60, v: dir * (150 + Math.random() * 70), p: Math.random() * 6 }); }
    L(0.3, () => {
      ctx.fillStyle = '#040406';
      for (const b of bats) {
        b.x += b.v * dt; const yy = b.y + Math.sin(t * 3 + b.p) * 10, f = Math.sin(t * 16 + b.p);
        ctx.beginPath(); ctx.moveTo(b.x - 14, yy - 6 * f); ctx.quadraticCurveTo(b.x - 6, yy - 2, b.x, yy + 2); ctx.quadraticCurveTo(b.x + 6, yy - 2, b.x + 14, yy - 6 * f); ctx.quadraticCurveTo(b.x + 6, yy + 3, b.x, yy + 5); ctx.quadraticCurveTo(b.x - 6, yy + 3, b.x - 14, yy - 6 * f); ctx.fill();
      }
      bats = bats.filter(b => b.x > -300 && b.x < DW + 300);
    });
    // Asche
    if (quality > 0.4) {
      if (ash.length < 50 && Math.random() < 0.5) ash.push({ x: Math.random() * W, y: H + 6, vx: (Math.random() - 0.3) * 16, vy: -(14 + Math.random() * 26), life: 8 + Math.random() * 6, r: 0.8 + Math.random() * 1.4 });
      for (const a of ash) { a.life -= dt; a.x += (a.vx + Math.sin(t + a.y * 0.01) * 10) * dt; a.y += a.vy * dt; ctx.fillStyle = `rgba(200,190,175,${Math.min(1, a.life / 2) * 0.35})`; ctx.beginPath(); ctx.arc(a.x, a.y, a.r * base * 1.3, 0, Math.PI * 2); ctx.fill(); }
      ash = ash.filter(a => a.life > 0 && a.y > -10);
    }
    // Vignette
    const vg = ctx.createRadialGradient(W * 0.6, H * 0.5, Math.min(W, H) * 0.25, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(2,2,3,.7)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }
  return { draw };
}
