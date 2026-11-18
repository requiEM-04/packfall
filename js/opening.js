// Packfall – Booster-Opening
// Pack fällt rein → Antippen → Aufladen (Strahlen teasen die Seltenheit Stufe für Stufe an)
// → Riss + Bass-Drop → Held erscheint groß im Licht. Effekte auf eigenem Canvas (flüssig, eigene Schleife).

const TIER_COL = [[176, 172, 162], [126, 164, 196], [166, 138, 200], [222, 186, 108]]; // gewöhnlich, selten, episch, legendär
const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);

export function createOpening(ov, { skin, sfx, settings, info, onClose, onAgain }) {
  const $ = n => ov.querySelector(`[data-k="${n}"]`);
  const cv = $('bofx'), inner = $('boin'), pack = $('pack'), packA = $('packa'), packB = $('packb');
  const title = $('botitle'), hint = $('packhint'), act = $('boact'), again = $('boagain'), close = $('boclose');
  const rv = $('reveal'), flash = $('boflash');
  const cx2 = cv.getContext('2d');
  const buf = document.createElement('canvas'), bx = buf.getContext('2d');
  let img = null, u32 = null, ang = null, dist = null, BW = 0, BH = 0, Q = 3;
  let raf = 0, lastT = 0, st = null;

  function resize() {
    const r = ov.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
    Q = Math.max(2, Math.round(Math.min(cv.width, cv.height) / 260));
    BW = Math.ceil(cv.width / Q); BH = Math.ceil(cv.height / Q);
    buf.width = BW; buf.height = BH;
    img = bx.createImageData(BW, BH); u32 = new Uint32Array(img.data.buffer);
    centre();
  }
  function centre() {
    if (!st) return;
    // Mitte ohne laufende Transforms bestimmen (offset-Kette statt BoundingRect)
    const node = st.stage === 'reveal' ? rv.querySelector('.kw-rv-art') : pack;
    const W = ov.clientWidth || 1, H = ov.clientHeight || 1;
    let px = W / 2, py = H / 2;
    if (node && node.offsetWidth) {
      px = node.offsetWidth / 2; py = node.offsetHeight / 2;
      for (let n = node; n && n !== ov; n = n.offsetParent) { px += n.offsetLeft; py += n.offsetTop; }
    }
    st.cx = (px / W) * BW; st.cy = (py / H) * BH;
    ang = new Float32Array(BW * BH); dist = new Float32Array(BW * BH);
    const R = Math.min(BW, BH);
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
      const dx = x - st.cx, dy = y - st.cy, i = y * BW + x;
      ang[i] = Math.atan2(dy, dx); dist[i] = Math.sqrt(dx * dx + dy * dy) / R;
    }
  }
  const ro = new ResizeObserver(() => { if (st) resize(); });
  ro.observe(ov);

  // ------------------------------------------------------------ Öffnen
  function open(kind, r) {
    const rank = RANK[r.rarity] || 0;
    const s = settings();
    const fast = s.boosterAnim === 'fast' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    st = {
      kind, r, rank, fast, t: 0, stage: 'drop', st0: 0, tier: 0, col: TIER_COL[0].slice(), tcol: TIER_COL[0],
      power: 0.18, tpower: 0.18, rot: 0, spin: 0.15, pulse: 0, shake: 0, flash: 0, parts: [], rings: [],
      steps: [], chargeD: 0, spark: 0, cx: 0, cy: 0,
    };
    ov.hidden = false;
    ov.className = `kw-ov kw-bo k-${kind}`;
    ov.dataset.stage = 'drop';
    ov.style.setProperty('--tc', rgb(TIER_COL[0]));
    title.innerHTML = kind === 'starter' ? '<b>Dein Geschenk!</b><span>Start-Booster</span>' : `<b>${info.packName(kind)}</b><span>Ein Held wartet darin</span>`;
    const art = skin.packArt(kind);
    packA.innerHTML = art; packB.innerHTML = art;
    pack.hidden = false; pack.style.transform = ''; pack.disabled = false;
    rv.hidden = true; rv.className = 'kw-reveal'; act.hidden = true;
    hint.hidden = true; hint.textContent = 'Antippen zum Öffnen';
    resize();
    sfx('whoosh');
    setTimeout(() => { if (st && st.stage === 'drop') { sfx('land'); st.pulse = 0.6; st.shake = 0.35; ring(TIER_COL[0], 0.6); } }, 380);
    setTimeout(() => {
      if (!st || st.stage !== 'drop') return;
      to('idle'); hint.hidden = false;
      if (st.fast) charge();
      pack.focus({ preventScroll: true });
    }, 520);
    lastT = performance.now();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }

  function to(stage) { st.stage = stage; st.st0 = st.t; ov.dataset.stage = stage; }

  function charge() {
    if (!st || (st.stage !== 'idle' && st.stage !== 'drop')) return;
    to('charge');
    hint.hidden = true; pack.disabled = true;
    const first = st.fast ? 0.35 : 0.95, gap = st.fast ? 0.28 : 0.72;
    st.steps = [];
    for (let k = 1; k <= st.rank; k++) st.steps.push({ at: first + (k - 1) * gap, tier: k, done: false });
    st.chargeD = first + Math.max(0, st.rank - 1) * gap + (st.rank ? (st.fast ? 0.25 : 0.55) : (st.fast ? 0 : 0.15)) + (st.rank === 3 && !st.fast ? 0.35 : 0);
    st.tpower = 0.45; st.spin = 0.5;
    sfx('riser', st.chargeD);
  }

  function burst() {
    to('burst');
    const c = TIER_COL[st.rank];
    st.flash = 1; st.pulse = 1; st.shake = 1.2; st.tpower = 1; st.spin = 0.9;
    flash.style.setProperty('--fc', rgb(c));
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
    sfx('burst', st.rank);
    explode(c, 140 + st.rank * 60, 1);
    ring(c, 1.4); ring([235, 230, 220], 1);
    pack.classList.add('ripped');
    setTimeout(reveal, st.fast ? 180 : 380);
  }

  function reveal() {
    if (!st) return;
    to('reveal');
    pack.hidden = true; pack.classList.remove('ripped');
    const r = st.r, d = r.def;
    rv.hidden = false;
    rv.className = `kw-reveal r-${r.rarity}${r.foil ? ' foil' : ''}`;
    rv.style.setProperty('--rc', rgb(TIER_COL[st.rank]));
    rv.innerHTML = `
      <p class="kw-rv-rar">${info.rarName(r.rarity)}${r.foil ? ' · Glanz' : ''}</p>
      <h2 class="kw-rv-name">${d.name}</h2>
      <p class="kw-rv-desc">${d.desc}</p>
      <div class="kw-rv-art">${skin.cardArt(d, { big: true })}</div>
      <p class="kw-rv-stats">${info.stats(r)}</p>
      <p class="kw-rv-tag${r.isNew ? ' is-new' : ''}">${info.tag(r)}</p>`;
    requestAnimationFrame(centre);
    sfx('reveal', r.rarity);
    st.spark = [0.6, 1.2, 2.2, 3.4][st.rank];
    setTimeout(() => {
      if (!st || st.stage !== 'reveal') return;
      act.hidden = false;
      const a = info.again(st.kind);
      again.hidden = !a; if (a) again.innerHTML = a;
      close.focus({ preventScroll: true });
    }, st.fast ? 250 : 650);
  }

  function shut() {
    cancelAnimationFrame(raf); raf = 0;
    st = null; ov.hidden = true; ov.className = 'kw-ov kw-bo';
    cx2.clearRect(0, 0, cv.width, cv.height);
  }

  // ------------------------------------------------------------ Partikel
  function explode(c, n, sp) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (20 + Math.random() * 110) * sp;
      st.parts.push({ x: st.cx, y: st.cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 0.6 + Math.random() * 0.9, max: 1.5, c: mix(c, [240, 236, 228], Math.random() * 0.5), s: Math.random() < 0.25 ? 2 : 1, g: 60 });
    }
  }
  function ring(c, k) { st.rings.push({ r: 4, v: 150 * k, life: 0.7, max: 0.7, c }); }

  // ------------------------------------------------------------ Schleife
  function loop(now) {
    if (!st) return;
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    st.t += dt;
    const lt = st.t - st.st0;

    if (st.stage === 'charge') {
      const k = Math.min(1, lt / st.chargeD);
      for (const s of st.steps) if (!s.done && lt >= s.at) {
        s.done = true; st.tier = s.tier; st.tcol = TIER_COL[s.tier];
        st.pulse = 1; st.flash = 0.35; st.tpower = 0.5 + s.tier * 0.15;
        ov.style.setProperty('--tc', rgb(TIER_COL[s.tier]));
        sfx('tease', s.tier); ring(TIER_COL[s.tier], 0.8 + s.tier * 0.2); explode(TIER_COL[s.tier], 26 + s.tier * 10, 0.6);
      }
      st.shake = Math.max(st.shake, 0.15 + k * (0.5 + st.rank * 0.25));
      if (Math.random() < dt * 9) sfx('shake');
      if (lt >= st.chargeD) burst();
    }
    if (st.stage === 'reveal') {
      st.tpower = 0.85; st.spin = 0.22;
      if (Math.random() < dt * st.spark * 6) {
        const a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 60;
        st.parts.push({ x: st.cx + Math.cos(a) * d, y: st.cy + Math.sin(a) * d * 0.8, vx: 0, vy: -10 - Math.random() * 18, life: 1.2, max: 1.2, c: mix(TIER_COL[st.rank], [245, 240, 230], 0.4), s: 1, g: -4, tw: true });
        if (st.rank >= 2 && Math.random() < 0.15) sfx('sparkle');
      }
    }
    // weich nachziehen
    st.power += (st.tpower - st.power) * Math.min(1, dt * 4);
    for (let i = 0; i < 3; i++) st.col[i] += (st.tcol[i] - st.col[i]) * Math.min(1, dt * 7);
    st.rot += st.spin * dt;
    st.pulse = Math.max(0, st.pulse - dt * 2.2);
    st.flash = Math.max(0, st.flash - dt * 2.8);
    st.shake = st.stage === 'charge' ? st.shake : Math.max(0, st.shake - dt * 2.5);

    // Pack wackeln
    if (st.stage === 'idle' || st.stage === 'charge' || st.stage === 'drop') {
      const amp = st.stage === 'charge' ? st.shake * 7 : 0;
      const bob = st.stage === 'idle' ? Math.sin(st.t * 2.4) * 4 : 0;
      const sx = (Math.random() - 0.5) * amp, sy = (Math.random() - 0.5) * amp + bob, rot = (Math.random() - 0.5) * amp * 0.9;
      const sc = 1 + st.pulse * 0.1 + (st.stage === 'charge' ? Math.min(1, lt / st.chargeD) * 0.06 : 0);
      if (st.stage !== 'drop') pack.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
    }
    // Bildschirm wackeln
    const sh = st.stage === 'burst' || st.stage === 'reveal' ? st.shake * 9 : st.stage === 'drop' ? st.shake * 6 : 0;
    inner.style.transform = sh > 0.2 ? `translate(${((Math.random() - 0.5) * sh).toFixed(1)}px, ${((Math.random() - 0.5) * sh).toFixed(1)}px)` : '';

    draw(dt);
    raf = requestAnimationFrame(loop);
  }

  function draw(dt) {
    if (!u32 || !ang) return;
    const N = 14, col = st.col, pw = st.power, rot = st.rot, pulse = st.pulse;
    const cr = col[0] | 0, cg = col[1] | 0, cb = col[2] | 0;
    const base = (cb << 16) | (cg << 8) | cr;
    const hot = mix(col, [245, 240, 232], 0.55);
    const hotc = ((hot[2] | 0) << 16) | ((hot[1] | 0) << 8) | (hot[0] | 0);
    const haloR = 0.16 + pw * 0.14 + pulse * 0.08;
    for (let y = 0; y < BH; y++) {
      const by = (y & 3) << 2;
      for (let x = 0; x < BW; x++) {
        const i = y * BW + x, d = dist[i];
        // Strahlen
        let a = (ang[i] + rot) * N / (Math.PI * 2); a -= Math.floor(a);
        const wide = ((Math.floor((ang[i] + rot) * N / (Math.PI * 2)) & 1) ? 0.18 : 0.3);
        let ray = a < wide ? 1 - Math.abs(a - wide / 2) / (wide / 2) * 0.35 : 0;
        ray *= Math.max(0, 1 - d * (1.15 - pw * 0.35)) * pw;
        // Lichthof
        const halo = d < haloR ? (1 - d / haloR) * (0.55 + pw * 0.45 + pulse * 0.4) : 0;
        let v = Math.max(ray * (0.42 + 0.5 * Math.max(0, 1 - d * 1.7)), halo);
        const th = BAYER[by + (x & 3)];
        if (v > th) {
          const strong = halo > 0.55 && halo > th + 0.35;
          u32[i] = 0xff000000 | (strong ? hotc : base);
        } else u32[i] = 0;
      }
    }
    bx.putImageData(img, 0, 0);
    // Ringe
    for (const r of st.rings) {
      r.life -= dt; r.r += r.v * dt; r.v *= 0.95;
      if (r.life <= 0) continue;
      const k = r.life / r.max;
      bx.fillStyle = `rgba(${r.c[0] | 0},${r.c[1] | 0},${r.c[2] | 0},${k.toFixed(2)})`;
      const steps = Math.max(24, Math.round(r.r * 6));
      for (let s = 0; s < steps; s++) { const a = (s / steps) * Math.PI * 2; if ((s & 1) && k < 0.5) continue; bx.fillRect(Math.round(st.cx + Math.cos(a) * r.r), Math.round(st.cy + Math.sin(a) * r.r * 0.9), 1, 1); }
    }
    st.rings = st.rings.filter(r => r.life > 0);
    // Partikel
    for (const p of st.parts) {
      p.life -= dt; p.vy += p.g * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0) continue;
      if (p.tw && (Math.floor(p.life * 12) & 1)) continue;
      bx.fillStyle = `rgb(${p.c[0] | 0},${p.c[1] | 0},${p.c[2] | 0})`;
      bx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    }
    st.parts = st.parts.filter(p => p.life > 0);
    if (st.parts.length > 700) st.parts.splice(0, st.parts.length - 700);

    cx2.imageSmoothingEnabled = false;
    cx2.clearRect(0, 0, cv.width, cv.height);
    cx2.drawImage(buf, 0, 0, BW * Q, BH * Q);
    if (st.flash > 0.01) { cx2.fillStyle = `rgba(240,236,228,${(st.flash * 0.5).toFixed(2)})`; cx2.fillRect(0, 0, cv.width, cv.height); }
  }

  // ------------------------------------------------------------ Eingaben
  pack.addEventListener('click', charge);
  ov.addEventListener('click', e => { if (st && st.stage === 'idle' && !e.target.closest('button')) charge(); });
  close.addEventListener('click', () => { sfx('click'); shut(); onClose(); });
  again.addEventListener('click', () => { if (!st) return; const k = st.kind; sfx('click'); shut(); onAgain(k); });

  return { open, get active() { return !!st; }, destroy() { shut(); ro.disconnect(); } };
}

function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
function rgb(c) { return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; }
