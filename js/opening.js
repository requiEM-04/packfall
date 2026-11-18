// Packfall – Booster-Opening
// Pack fällt rein → Antippen → Aufladen (Strahlen teasen die Seltenheit Stufe für Stufe an)
// → Riss + Bass-Drop → Held erscheint groß im Licht. Effekte auf eigenem Canvas (flüssig, eigene Schleife).

const TIER_COL = [[176, 172, 162], [126, 164, 196], [166, 138, 200], [222, 186, 108]]; // gewöhnlich, selten, episch, legendär
const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 };

export function createOpening(ov, { skin, sfx, settings, info, onClose, onAgain }) {
  const $ = n => ov.querySelector(`[data-k="${n}"]`);
  const cv = $('bofx'), inner = $('boin'), pack = $('pack'), packA = $('packa'), packB = $('packb');
  const title = $('botitle'), hint = $('packhint'), act = $('boact'), again = $('boagain'), close = $('boclose');
  const rv = $('reveal'), flash = $('boflash');
  const cx2 = cv.getContext('2d');
  // Effekte in halber Auflösung, weich hochskaliert (keine Pixelpunkte)
  const buf = document.createElement('canvas'), bx = buf.getContext('2d');
  let BW = 0, BH = 0, Q = 2;
  let raf = 0, lastT = 0, st = null;

  function resize() {
    const r = ov.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
    Q = 2;
    BW = Math.ceil(cv.width / Q); BH = Math.ceil(cv.height / Q);
    buf.width = BW; buf.height = BH;
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
    const k = Math.min(BW, BH) / 400;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (60 + Math.random() * 260) * sp * k;
      st.parts.push({ x: st.cx, y: st.cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30 * k, life: 0.5 + Math.random() * 1.1, max: 1.6, c: mix(c, [255, 250, 240], Math.random() * 0.6), s: (0.8 + Math.random() * 1.8) * Math.max(1, k), g: 90 * k, drag: 0.965 });
    }
  }
  function ring(c, k) { st.rings.push({ r: 6, v: 420 * k * Math.min(BW, BH) / 400, life: 0.75, max: 0.75, c, w: 6 * k }); }

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
      st.tpower = 0.9; st.spin = 0.16;
      if (Math.random() < dt * st.spark * 10) {
        const a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 60;
        const k = Math.min(BW, BH) / 400;
        st.parts.push({ x: st.cx + Math.cos(a) * d * k * 1.6, y: st.cy + Math.sin(a) * d * k * 1.3, vx: (Math.random() - 0.5) * 10 * k, vy: (-14 - Math.random() * 24) * k, life: 1.6, max: 1.6, c: mix(TIER_COL[st.rank], [255, 250, 240], 0.5), s: (1 + Math.random() * 1.4) * Math.max(1, k), g: -6 * k, tw: true, drag: 0.99 });
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

  function rays(n, rot, width, len, alpha, col, soft) {
    const g = bx.createRadialGradient(st.cx, st.cy, 0, st.cx, st.cy, len);
    g.addColorStop(0, rgba(col, alpha)); g.addColorStop(0.18, rgba(col, alpha * 0.75)); g.addColorStop(0.55, rgba(col, alpha * 0.25)); g.addColorStop(1, rgba(col, 0));
    bx.fillStyle = g;
    for (let pass = 0; pass < (soft ? 2 : 1); pass++) {
      const wf = pass === 0 && soft ? 1.9 : 1;
      if (soft) bx.globalAlpha = pass === 0 ? 0.35 : 1;
      bx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = rot + (i / n) * Math.PI * 2, w = width * (i % 2 ? 0.55 : 1) * wf;
        bx.moveTo(st.cx, st.cy);
        bx.lineTo(st.cx + Math.cos(a - w) * len, st.cy + Math.sin(a - w) * len);
        bx.lineTo(st.cx + Math.cos(a + w) * len, st.cy + Math.sin(a + w) * len);
        bx.closePath();
      }
      bx.fill();
    }
    bx.globalAlpha = 1;
  }
  function draw(dt) {
    if (!BW) return;
    const col = st.col, pw = st.power, pulse = st.pulse, M = Math.min(BW, BH);
    const hot = mix(col, [255, 250, 242], 0.6);
    bx.clearRect(0, 0, BW, BH);
    bx.globalCompositeOperation = 'lighter';
    const len = Math.hypot(BW, BH) * 0.8;
    // breite, langsame Strahlen + feine, gegenläufige Strahlen
    rays(10, st.rot, 0.085 + pulse * 0.03, len, 0.42 * pw + pulse * 0.2, col, true);
    rays(16, -st.rot * 0.7 + 0.1, 0.03, len * 0.85, 0.28 * pw + pulse * 0.15, hot, true);
    // Lichtkern
    const r0 = M * (0.22 + pw * 0.16 + pulse * 0.12);
    const g = bx.createRadialGradient(st.cx, st.cy, 0, st.cx, st.cy, r0);
    g.addColorStop(0, rgba(hot, 0.75 * pw + pulse * 0.3)); g.addColorStop(0.3, rgba(col, 0.45 * pw + pulse * 0.2)); g.addColorStop(1, rgba(col, 0));
    bx.fillStyle = g; bx.beginPath(); bx.arc(st.cx, st.cy, r0, 0, Math.PI * 2); bx.fill();
    // Druckwellen
    for (const r of st.rings) {
      r.life -= dt; r.r += r.v * dt; r.v *= 0.94;
      if (r.life <= 0) continue;
      const k = r.life / r.max;
      bx.strokeStyle = rgba(r.c, 0.55 * k); bx.lineWidth = Math.max(1, r.w * k);
      bx.beginPath(); bx.ellipse(st.cx, st.cy, r.r, r.r * 0.92, 0, 0, Math.PI * 2); bx.stroke();
      bx.strokeStyle = rgba([255, 250, 240], 0.35 * k); bx.lineWidth = Math.max(1, r.w * k * 0.35); bx.stroke();
    }
    st.rings = st.rings.filter(r => r.life > 0);
    // Funken mit Schweif
    bx.lineCap = 'round';
    for (const p of st.parts) {
      p.life -= dt; p.vy += p.g * dt; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0) continue;
      const k = Math.min(1, p.life / 0.6);
      const tw = p.tw ? 0.55 + 0.45 * Math.sin(st.t * 14 + p.x) : 1;
      bx.strokeStyle = rgba(p.c, 0.5 * k * tw); bx.lineWidth = p.s;
      bx.beginPath(); bx.moveTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045); bx.lineTo(p.x, p.y); bx.stroke();
      bx.fillStyle = rgba(p.c, 0.18 * k * tw); bx.beginPath(); bx.arc(p.x, p.y, p.s * 3.2, 0, Math.PI * 2); bx.fill();
      bx.fillStyle = rgba([255, 252, 245], 0.9 * k * tw); bx.beginPath(); bx.arc(p.x, p.y, p.s * 0.6, 0, Math.PI * 2); bx.fill();
    }
    st.parts = st.parts.filter(p => p.life > 0);
    if (st.parts.length > 500) st.parts.splice(0, st.parts.length - 500);
    bx.globalCompositeOperation = 'source-over';

    cx2.clearRect(0, 0, cv.width, cv.height);
    cx2.imageSmoothingEnabled = true; cx2.imageSmoothingQuality = 'high';
    cx2.drawImage(buf, 0, 0, BW * Q, BH * Q);
    if (st.flash > 0.01) { cx2.fillStyle = `rgba(250,246,238,${(st.flash * 0.55).toFixed(2)})`; cx2.fillRect(0, 0, cv.width, cv.height); }
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
function rgba(c, a) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`; }
