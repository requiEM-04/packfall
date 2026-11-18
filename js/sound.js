// Packfall – Sound & Musik komplett per WebAudio (keine Dateien)
// Master mit Kompressor, Hall-Send, Effekte mit Bass, Musik mit sauberem Lookahead-Sequencer.
export function createAudio(getSettings) {
  let ctx = null, master = null, sfxBus = null, musBus = null, verb = null, verbSend = null, dly = null, dlySend = null;
  let noiseBuf = null, distCurve = null;
  const last = {};

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC({ latencyHint: 'interactive' });
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.22;
      master = ctx.createGain(); master.gain.value = 0.9;
      master.connect(comp); comp.connect(ctx.destination);
      sfxBus = ctx.createGain(); musBus = ctx.createGain();
      sfxBus.connect(master); musBus.connect(master);
      // Hall
      verb = ctx.createConvolver(); verb.buffer = impulse(2.4, 2.6);
      verbSend = ctx.createGain(); verbSend.gain.value = 1;
      const verbOut = ctx.createGain(); verbOut.gain.value = 0.32;
      verbSend.connect(verb); verb.connect(verbOut); verbOut.connect(master);
      // Echo (für Musik-Lead)
      dly = ctx.createDelay(1); dly.delayTime.value = 0.375;
      const fb = ctx.createGain(); fb.gain.value = 0.32;
      const dlyF = ctx.createBiquadFilter(); dlyF.type = 'lowpass'; dlyF.frequency.value = 2600;
      dlySend = ctx.createGain();
      dlySend.connect(dly); dly.connect(dlyF); dlyF.connect(fb); fb.connect(dly); dlyF.connect(musBus);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      distCurve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; distCurve[i] = Math.tanh(x * 3.2); }
      apply();
    } catch (e) { ctx = null; }
    return ctx;
  }
  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function apply() {
    if (!ctx) return;
    const s = getSettings();
    sfxBus.gain.setTargetAtTime(Math.min(1, Number(s.sfx) || 0) * 1.1, ctx.currentTime, 0.02);
    const mv = [0, 0.32, 0.6][Number(s.music)] ?? 0;
    musBus.gain.setTargetAtTime(mv, ctx.currentTime, 0.05);
    if (mv > 0) startMusic(); else stopMusic();
  }

  // ---------------- Bausteine ----------------
  const now = () => ctx.currentTime;
  function env(g, t, a, peak, dec, sus = 0.0001) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sus), t + a + dec);
  }
  function osc(type, f, t, dur, vol, out, { a = 0.003, slideTo = 0, slideT = dur, detune = 0, send = 0, filter = 0, q = 0.7 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + slideT);
    env(g, t, a, vol, Math.max(0.01, dur - a));
    let n = o;
    if (filter) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filter; fl.Q.value = q; o.connect(fl); n = fl; }
    n.connect(g); g.connect(out);
    if (send) { const s = ctx.createGain(); s.gain.value = send; g.connect(s); s.connect(verbSend); }
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  function nz(t, dur, vol, out, { type = 'lowpass', f = 2000, fTo = 0, q = 0.8, a = 0.002, send = 0 } = {}) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true;
    fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (fTo) fl.frequency.exponentialRampToValueAtTime(fTo, t + dur);
    env(g, t, a, vol, Math.max(0.01, dur - a));
    s.connect(fl); fl.connect(g); g.connect(out);
    if (send) { const sg = ctx.createGain(); sg.gain.value = send; g.connect(sg); sg.connect(verbSend); }
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  function kick(t, vol, out, len = 0.32, from = 150, to = 42) {
    const o = ctx.createOscillator(), g = ctx.createGain(), ws = ctx.createWaveShaper();
    ws.curve = distCurve;
    o.type = 'sine'; o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + len * 0.45);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(ws); ws.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.05);
    nz(t, 0.012, vol * 0.35, out, { type: 'highpass', f: 3000 });
  }
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  // ---------------- Effekte ----------------
  const SFX = {
    click: () => osc('triangle', 880, now(), 0.05, 0.12, sfxBus, { slideTo: 660 }),
    nav: () => osc('triangle', 620, now(), 0.04, 0.08, sfxBus),
    shot: () => osc('square', 700 + Math.random() * 160, now(), 0.05, 0.022, sfxBus, { slideTo: 380, filter: 2400 }),
    hit: () => nz(now(), 0.05, 0.06, sfxBus, { f: 2400 }),
    kill: () => { const t = now(); osc('square', 240, t, 0.09, 0.05, sfxBus, { slideTo: 110, filter: 1600 }); nz(t, 0.08, 0.05, sfxBus, { f: 1400 }); },
    coin: () => { const t = now(); osc('square', 1320, t, 0.05, 0.035, sfxBus, { filter: 3000 }); osc('square', 1760, t + 0.05, 0.08, 0.035, sfxBus, { filter: 3000 }); },
    buy: () => { const t = now(); osc('triangle', 660, t, 0.08, 0.12, sfxBus); osc('triangle', 990, t + 0.06, 0.12, 0.12, sfxBus, { send: 0.2 }); },
    deny: () => osc('square', 150, now(), 0.14, 0.06, sfxBus, { slideTo: 110, filter: 900 }),
    boom: () => { const t = now(); kick(t, 0.45, sfxBus, 0.35, 120, 38); nz(t, 0.35, 0.14, sfxBus, { f: 900, fTo: 200 }); },
    zap: () => { const t = now(); nz(t, 0.12, 0.08, sfxBus, { type: 'bandpass', f: 5000, fTo: 1500, q: 2 }); osc('sawtooth', 1400, t, 0.08, 0.03, sfxBus, { slideTo: 400 }); },
    strike: () => { const t = now(); kick(t, 0.32, sfxBus, 0.18, 220, 60); nz(t, 0.1, 0.1, sfxBus, { f: 2600 }); },
    core: () => { const t = now(); kick(t, 0.5, sfxBus, 0.4, 100, 34); nz(t, 0.25, 0.08, sfxBus, { f: 500 }); },
    wave: () => { const t = now(); [69, 72, 76].forEach((m, i) => osc('triangle', hz(m), t + i * 0.08, 0.2, 0.1, sfxBus, { send: 0.25 })); },
    boss: () => { const t = now(); kick(t, 0.7, sfxBus, 0.9, 80, 30); osc('sawtooth', 55, t, 1.4, 0.16, sfxBus, { filter: 500, send: 0.3 }); osc('sawtooth', 58.3, t, 1.4, 0.12, sfxBus, { filter: 500 }); },
    over: () => { const t = now(); [67, 64, 60, 55].forEach((m, i) => osc('triangle', hz(m), t + i * 0.2, 0.35, 0.12, sfxBus, { send: 0.35 })); },

    // ---- Booster ----
    whoosh: () => nz(now(), 0.45, 0.22, sfxBus, { type: 'bandpass', f: 3200, fTo: 260, q: 1.4, a: 0.08, send: 0.2 }),
    land: () => { const t = now(); kick(t, 0.55, sfxBus, 0.28, 140, 45); nz(t, 0.12, 0.1, sfxBus, { f: 1200 }); },
    shake: () => nz(now(), 0.07, 0.05, sfxBus, { type: 'bandpass', f: 900, q: 2 }),
    // Aufbau: Rauschen steigt, Sub-Rumpeln, Ton zieht hoch
    riser: dur => {
      const t = now(), d = Math.max(0.4, dur || 1.5);
      nz(t, d, 0.2, sfxBus, { type: 'bandpass', f: 280, fTo: 7000, q: 1.6, a: d * 0.9, send: 0.25 });
      const o = osc('sawtooth', 110, t, d, 0.09, sfxBus, { a: d * 0.95, slideTo: 880, slideT: d, filter: 1800, q: 4 });
      void o;
      const sub = ctx.createOscillator(), sg = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      sub.type = 'sine'; sub.frequency.setValueAtTime(42, t); sub.frequency.linearRampToValueAtTime(58, t + d);
      lfo.frequency.setValueAtTime(5, t); lfo.frequency.linearRampToValueAtTime(18, t + d); lg.gain.value = 0.18;
      sg.gain.setValueAtTime(0.0001, t); sg.gain.linearRampToValueAtTime(0.42, t + d * 0.9); sg.gain.linearRampToValueAtTime(0.0001, t + d + 0.02);
      lfo.connect(lg); lg.connect(sg.gain); sub.connect(sg); sg.connect(sfxBus);
      sub.start(t); lfo.start(t); sub.stop(t + d + 0.1); lfo.stop(t + d + 0.1);
    },
    // Seltenheit steigt eine Stufe
    tease: tier => {
      const t = now(), base = [57, 60, 64, 67][tier] || 57;
      kick(t, 0.5, sfxBus, 0.22, 170, 55);
      [0, 7, 12].forEach((iv, i) => {
        osc('sawtooth', hz(base + 12 + iv), t, 0.42, 0.06, sfxBus, { detune: -8, filter: 3200, send: 0.45 });
        osc('square', hz(base + 12 + iv), t + i * 0.012, 0.32, 0.04, sfxBus, { detune: 9, filter: 2400, send: 0.3 });
      });
      nz(t, 0.5, 0.08, sfxBus, { type: 'highpass', f: 6000, send: 0.5 });
    },
    // Riss + Bass-Drop
    burst: tier => {
      const t = now();
      nz(t, 0.16, 0.3, sfxBus, { type: 'highpass', f: 1800, q: 0.6 });
      kick(t, 1.0, sfxBus, 0.7, 180, 34);
      const o = ctx.createOscillator(), g = ctx.createGain(), ws = ctx.createWaveShaper();
      ws.curve = distCurve;
      o.type = 'sine'; o.frequency.setValueAtTime(62, t); o.frequency.exponentialRampToValueAtTime(36, t + 1.4);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.55, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 + tier * 0.25);
      o.connect(ws); ws.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 2.2);
      nz(t, 1.6 + tier * 0.3, 0.16, sfxBus, { type: 'highpass', f: 5000, fTo: 9000, send: 0.6 });
      nz(t, 0.6, 0.22, sfxBus, { f: 1600, fTo: 120 });
    },
    reveal: r => {
      const t = now();
      const prog = { common: [69, 76], rare: [69, 72, 76, 81], epic: [69, 72, 76, 79, 84], legendary: [62, 66, 69, 74, 78, 81, 86] }[r] || [69, 76];
      prog.forEach((m, i) => {
        osc('triangle', hz(m), t + i * 0.07, 0.6, 0.11, sfxBus, { send: 0.5 });
        osc('sine', hz(m + 12), t + i * 0.07, 0.4, 0.04, sfxBus, { send: 0.6 });
      });
      if (r === 'epic' || r === 'legendary') {
        const chord = r === 'legendary' ? [50, 57, 62, 66, 69] : [45, 52, 57, 60, 64];
        chord.forEach(m => { osc('sawtooth', hz(m), t, 2.6, 0.035, sfxBus, { a: 0.05, detune: -7, filter: 1800, send: 0.5 }); osc('sawtooth', hz(m), t, 2.6, 0.03, sfxBus, { a: 0.05, detune: 7, filter: 1800 }); });
      }
    },
    sparkle: () => { const t = now(); osc('sine', 2200 + Math.random() * 1600, t, 0.12, 0.03, sfxBus, { send: 0.7 }); },
  };
  SFX.rip = () => SFX.burst(0);
  SFX.fanfare = () => SFX.reveal('legendary');
  const MIN_GAP = { shot: 0.06, hit: 0.05, kill: 0.04, coin: 0.08, zap: 0.08, boom: 0.08, shake: 0.06, sparkle: 0.05 };

  // ---------------- Musik ----------------
  // Düsterer Synthwave: Am – F – G – E, 116 BPM, Kick/Clap/Hats, pumpender Bass, Pad, Arp-Lead
  const BPM = 116, S16 = 60 / BPM / 4;
  const CH = [ // Grundton (MIDI), Akkordtöne
    { r: 45, n: [57, 60, 64] }, { r: 41, n: [57, 60, 65] }, { r: 43, n: [55, 59, 62] }, { r: 40, n: [56, 59, 64] },
  ];
  let mode = 'menu', nextMode = 'menu', timer = null, nextT = 0, step = 0;
  function startMusic() {
    if (!ctx || timer) return;
    nextT = ctx.currentTime + 0.08; step = 0;
    timer = setInterval(schedule, 25);
  }
  function stopMusic() { clearInterval(timer); timer = null; }
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    while (nextT < ctx.currentTime + 0.14) { playStep(step, nextT); nextT += S16; step++; }
  }
  function playStep(s, t) {
    const s16 = s % 16, bar = Math.floor(s / 16), ch = CH[bar % 4], sec = Math.floor(bar / 8) % 2;
    if (s16 === 0 && bar % 4 === 0) mode = nextMode;
    const run = mode === 'run', boss = mode === 'boss';
    const full = run || boss;
    const out = musBus;
    // Drums
    if (full ? s16 % 4 === 0 : (s16 === 0 || s16 === 10)) kick(t, full ? 0.8 : 0.55, out, 0.3, 140, 40);
    if (s16 === 4 || s16 === 12) { nz(t, 0.18, full ? 0.32 : 0.18, out, { type: 'bandpass', f: 1600, q: 0.7, send: 0.25 }); osc('triangle', 190, t, 0.1, 0.18, out, { slideTo: 140 }); }
    if (s16 % 2 === 1 || (full && sec)) nz(t, 0.035, full ? (s16 % 4 === 2 ? 0.07 : 0.045) : 0.035, out, { type: 'highpass', f: 8000 });
    if (s16 === 14 && full) nz(t, 0.2, 0.06, out, { type: 'highpass', f: 7000 });
    if (bar % 8 === 7 && s16 >= 12 && full) nz(t, 0.08, 0.12 + (s16 - 12) * 0.03, out, { type: 'bandpass', f: 1800 });
    // Bass: pumpende 16tel (Pause auf dem Kick → Sidechain-Gefühl)
    if (full ? s16 % 4 !== 0 : s16 % 4 === 2) {
      const m = ch.r + (s16 % 8 === 6 ? 12 : 0);
      osc('sawtooth', hz(m), t, S16 * 0.9, full ? 0.16 : 0.11, out, { filter: full ? 520 + (s16 % 4) * 140 : 380, q: 3 });
      osc('square', hz(m - 12), t, S16 * 0.9, 0.08, out, { filter: 200 });
    }
    // Pad (pro Takt)
    if (s16 === 0) ch.n.forEach(m => { osc('sawtooth', hz(m), t, S16 * 16, 0.028, out, { a: 0.6, detune: -9, filter: 1100, send: 0.35 }); osc('sawtooth', hz(m), t, S16 * 16, 0.024, out, { a: 0.6, detune: 9, filter: 1100 }); });
    // Lead-Arp (im Run und im B-Teil)
    if ((full || sec) && s16 % 2 === 0) {
      const seq = [0, 1, 2, 1, 0, 2, 1, 2];
      const m = ch.n[seq[(s16 / 2) % 8]] + 12;
      const g = full ? 0.05 : 0.035;
      const o = osc('square', hz(m), t, S16 * 1.6, g, out, { filter: 2600 });
      void o;
      const sendG = ctx.createGain(); sendG.gain.value = 0.5;
      // Echo-Send
      const og = ctx.createOscillator(), gg = ctx.createGain();
      og.type = 'triangle'; og.frequency.value = hz(m); env(gg, t, 0.003, g * 0.6, S16 * 1.4);
      og.connect(gg); gg.connect(sendG); sendG.connect(dlySend); og.start(t); og.stop(t + S16 * 1.6);
    }
    // Glocken-Melodie im Menü
    if (!full && sec === 0 && (s16 === 0 || s16 === 6 || s16 === 12)) {
      const m = ch.n[(s16 / 6) % 3] + 24;
      osc('sine', hz(m), t, 0.9, 0.05, out, { send: 0.6 });
    }
    if (boss && s16 % 8 === 0) osc('sawtooth', hz(ch.r - 12), t, S16 * 7, 0.12, out, { filter: 260, q: 6 });
  }

  return {
    unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    apply,
    setMode(m) { nextMode = m; },
    play(name, arg) {
      if (!ctx || ctx.state !== 'running' || !(Number(getSettings().sfx) > 0)) return;
      const t = ctx.currentTime;
      if (MIN_GAP[name] && last[name] && t - last[name] < MIN_GAP[name]) return;
      last[name] = t;
      try { SFX[name]?.(arg); } catch (e) { /* egal */ }
    },
    stop() { stopMusic(); },
    _test() { const errs = []; if (!ctx) return ['kein AudioContext']; for (const k of Object.keys(SFX)) { try { SFX[k](k === 'riser' ? 0.5 : k === 'reveal' ? 'legendary' : 2); } catch (e) { errs.push(k + ': ' + e.message); } } try { for (let i = 0; i < 64; i++) { mode = i < 32 ? 'menu' : 'boss'; playStep(i, ctx.currentTime + i * 0.01); } } catch (e) { errs.push('musik: ' + e.message); } return errs; },
  };
}
