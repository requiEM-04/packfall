// Packfall – Sound & Musik komplett per WebAudio (keine Dateien)
// Master mit Kompressor, Hall-Send, Effekte mit Bass, Musik mit sauberem Lookahead-Sequencer.
export function createAudio(getSettings) {
  let ctx = null, master = null, sfxBus = null, musBus = null, verb = null, verbSend = null, dly = null, dlySend = null;
  let noiseBuf = null, distCurve = null, gtr = null, lead = null;
  const last = {};
  // Tab im Hintergrund: Browser drosseln Timer → Musik würde stottern. Also pausieren und danach sauber weiter.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().then(() => { nextT = Math.max(nextT, ctx.currentTime + 0.05); }).catch(() => {});
  });

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      build(new AC({ latencyHint: 'playback' })); // größerer Puffer: kein Knacksen, wenn die 3D-Grafik viel zu tun hat
      apply();
    } catch (e) { ctx = null; }
    return ctx;
  }
  function build(c) {
    ctx = c; gtr = null; lead = null;
    {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.22;
      master = ctx.createGain(); master.gain.value = 0.9;
      master.connect(comp); comp.connect(ctx.destination);
      sfxBus = ctx.createGain(); musBus = ctx.createGain();
      const musHp = ctx.createBiquadFilter(); musHp.type = 'highpass'; musHp.frequency.value = 38; musHp.Q.value = 0.7;
      sfxBus.connect(master); musBus.connect(musHp); musHp.connect(master);
      // Hall
      verb = ctx.createConvolver(); verb.buffer = impulse(2.4, 2.6);
      verbSend = ctx.createGain(); verbSend.gain.value = 1;
      const verbOut = ctx.createGain(); verbOut.gain.value = 0.32;
      verbSend.connect(verb); verb.connect(verbOut); verbOut.connect(master);
      // Echo (für Musik-Lead)
      dly = ctx.createDelay(1); dly.delayTime.value = (60 / 148 / 4) * 3;
      const fb = ctx.createGain(); fb.gain.value = 0.32;
      const dlyF = ctx.createBiquadFilter(); dlyF.type = 'lowpass'; dlyF.frequency.value = 2600;
      dlySend = ctx.createGain();
      dlySend.connect(dly); dly.connect(dlyF); dlyF.connect(fb); fb.connect(dly); dlyF.connect(musBus);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      distCurve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; distCurve[i] = Math.tanh(x * 3.2); }
    }
  }
  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  const vol = (s, k, d) => { const v = Number(s[k]); return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : d; };
  function apply() {
    if (!ctx) return;
    const s = getSettings();
    const sv = vol(s, 'sfxVol', 0.5), mvol = vol(s, 'musicVol', 0.4);
    sfxBus.gain.setTargetAtTime(1.7 * sv * sv, ctx.currentTime, 0.02);
    const mv = 0.75 * mvol * mvol;
    musBus.gain.setTargetAtTime(mv, ctx.currentTime, 0.05);
    if (typeof pickTrack === 'function' && ctx) pendingTrack = pickTrack(false);
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
      const t = now(), base = [57, 60, 64, 67, 70][tier] || 57;
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
      const prog = { common: [69, 76], rare: [69, 72, 76, 81], epic: [69, 72, 76, 79, 84], legendary: [62, 66, 69, 74, 78, 81, 86], mythic: [57, 60, 64, 69, 72, 75, 81, 84, 87] }[r] || [69, 76];
      prog.forEach((m, i) => {
        osc('triangle', hz(m), t + i * 0.07, 0.6, 0.11, sfxBus, { send: 0.5 });
        osc('sine', hz(m + 12), t + i * 0.07, 0.4, 0.04, sfxBus, { send: 0.6 });
      });
      if (r === 'epic' || r === 'legendary' || r === 'mythic') {
        const chord = r === 'mythic' ? [38, 45, 50, 53, 57, 60] : r === 'legendary' ? [50, 57, 62, 66, 69] : [45, 52, 57, 60, 64];
        if (r === 'mythic') kick(t, 0.9, sfxBus, 0.8, 90, 30);
        chord.forEach(m => { osc('sawtooth', hz(m), t, 2.6, 0.035, sfxBus, { a: 0.05, detune: -7, filter: 1800, send: 0.5 }); osc('sawtooth', hz(m), t, 2.6, 0.03, sfxBus, { a: 0.05, detune: 7, filter: 1800 }); });
      }
    },
    sparkle: () => { const t = now(); osc('sine', 2200 + Math.random() * 1600, t, 0.12, 0.03, sfxBus, { send: 0.7 }); },
  };
  SFX.rip = () => SFX.burst(0);
  SFX.fanfare = () => SFX.reveal('legendary');
  const MIN_GAP = { shot: 0.06, hit: 0.05, kill: 0.04, coin: 0.08, zap: 0.08, boom: 0.08, shake: 0.06, sparkle: 0.05 };

  // ---------------- Musik ----------------
  // Düsterer Fantasy-Metal in e-Moll, 148 BPM: verzerrte Rhythmusgitarre (Galopp, Palm-Mutes),
  // Lead-Gitarre mit Vibrato, Chor, Bass, Rock-Drums. Menü = Halbzeit-Groove, Run = voller Riff, Boss = Double-Bass.
  // Jedes Stück: Tempo, 4 Akkorde (g = Gitarren-Grundton, b = Bass, ch = Chor, arp = Zupfen), 2 Lead-Melodien,
  // Riffs (O = offener Powerchord, x = Palm-Mute), Schlagzeug-Muster für Run und Menü.
  const TRACKS = [
    { name: 'Turmwacht', bpm: 148,
      prog: [
        { g: 40, b: 40, ch: [64, 67, 71], arp: [52, 55, 59, 64] },
        { g: 48, b: 36, ch: [60, 64, 67], arp: [48, 52, 55, 60] },
        { g: 38, b: 38, ch: [62, 66, 69], arp: [50, 54, 57, 62] },
        { g: 47, b: 35, ch: [63, 66, 71], arp: [47, 51, 54, 59] }],
      mel: [
        [[0, 71, 4], [4, 76, 2], [6, 78, 2], [8, 79, 4], [12, 78, 2], [14, 76, 2]],
        [[0, 79, 4], [4, 81, 2], [6, 79, 2], [8, 76, 6], [14, 72, 2]],
        [[0, 74, 2], [2, 78, 2], [4, 81, 4], [8, 79, 2], [10, 78, 2], [12, 74, 4]],
        [[0, 75, 4], [4, 78, 2], [6, 83, 6], [12, 81, 2], [14, 78, 2]]],
      mel2: [
        [[0, 83, 3], [3, 81, 1], [4, 79, 2], [6, 78, 2], [8, 79, 2], [10, 81, 2], [12, 83, 4]],
        [[0, 84, 4], [4, 83, 2], [6, 81, 2], [8, 79, 4], [12, 76, 4]],
        [[0, 81, 2], [2, 83, 2], [4, 86, 4], [8, 83, 2], [10, 81, 2], [12, 78, 4]],
        [[0, 78, 2], [2, 79, 2], [4, 81, 2], [6, 83, 6], [12, 75, 4]]],
      riff: { run: 'O.xxx.xxO.xxx.xx', fill: 'O.xxx.xxO.O.O.O.', boss: 'xxxxxxxxO.xxO.xx', menu: 'O.......O.......' },
      kick: { run: [0, 2, 8, 10, 11], menu: [0, 10] }, snare: { run: [4, 12], menu: [8] } },
    { name: 'Aschewald', bpm: 132,
      prog: [
        { g: 38, b: 38, ch: [62, 65, 69], arp: [50, 53, 57, 62] },
        { g: 46, b: 34, ch: [58, 62, 65], arp: [46, 50, 53, 58] },
        { g: 48, b: 36, ch: [60, 64, 67], arp: [48, 52, 55, 60] },
        { g: 45, b: 33, ch: [61, 64, 69], arp: [45, 49, 52, 57] }],
      mel: [
        [[0, 69, 4], [4, 74, 2], [6, 76, 2], [8, 77, 6], [14, 76, 2]],
        [[0, 74, 2], [2, 77, 2], [4, 82, 6], [10, 81, 2], [12, 79, 4]],
        [[0, 76, 2], [2, 79, 2], [4, 84, 4], [8, 82, 2], [10, 81, 2], [12, 79, 4]],
        [[0, 73, 4], [4, 76, 2], [6, 81, 6], [12, 79, 2], [14, 76, 2]]],
      mel2: [
        [[0, 86, 3], [3, 84, 1], [4, 81, 4], [8, 77, 2], [10, 81, 2], [12, 86, 4]],
        [[0, 86, 4], [4, 84, 2], [6, 82, 2], [8, 81, 4], [12, 77, 4]],
        [[0, 76, 2], [2, 79, 2], [4, 84, 4], [8, 88, 4], [12, 86, 4]],
        [[0, 85, 6], [6, 81, 2], [8, 81, 4], [12, 76, 4]]],
      riff: { run: 'O..x.xO..x.xO.x.', fill: 'O..x.xO..xO.O.OO', boss: 'xx.xx.xxO.xx.xO.', menu: 'O.......O...O...' },
      kick: { run: [0, 3, 6, 9, 12, 14], menu: [0, 6] }, snare: { run: [8], menu: [8] } },
    { name: 'Sturmlauf', bpm: 166,
      prog: [
        { g: 45, b: 33, ch: [64, 69, 72], arp: [57, 60, 64, 69] },
        { g: 41, b: 41, ch: [65, 69, 72], arp: [53, 57, 60, 65] },
        { g: 43, b: 43, ch: [62, 67, 71], arp: [55, 59, 62, 67] },
        { g: 40, b: 40, ch: [64, 68, 71], arp: [52, 56, 59, 64] }],
      mel: [
        [[0, 76, 2], [2, 81, 2], [4, 84, 2], [6, 83, 2], [8, 81, 2], [10, 76, 2], [12, 72, 2], [14, 76, 2]],
        [[0, 77, 2], [2, 81, 2], [4, 84, 2], [6, 81, 2], [8, 77, 4], [12, 76, 2], [14, 74, 2]],
        [[0, 74, 2], [2, 79, 2], [4, 83, 2], [6, 86, 2], [8, 83, 4], [12, 79, 4]],
        [[0, 80, 4], [4, 83, 2], [6, 88, 6], [12, 86, 2], [14, 83, 2]]],
      mel2: [
        [[0, 81, 6], [6, 84, 2], [8, 88, 6], [14, 86, 2]],
        [[0, 84, 4], [4, 81, 4], [8, 77, 4], [12, 81, 4]],
        [[0, 83, 4], [4, 86, 4], [8, 79, 4], [12, 83, 4]],
        [[0, 80, 6], [6, 81, 2], [8, 83, 8]]],
      riff: { run: 'xxxxxxxxxxxxO.O.', fill: 'xxxxxxxxO.O.O.O.', boss: 'xxxxxxxxxxxxxxxx', menu: 'O...O...O...O.x.' },
      kick: { run: [0, 4, 8, 12], menu: [0, 8] }, snare: { run: [2, 6, 10, 14], menu: [4, 12] } },
    { name: 'Glutschlund', bpm: 120,
      prog: [
        { g: 42, b: 42, ch: [66, 69, 73], arp: [54, 57, 61, 66] },
        { g: 38, b: 38, ch: [62, 66, 69], arp: [50, 54, 57, 62] },
        { g: 40, b: 40, ch: [64, 68, 71], arp: [52, 56, 59, 64] },
        { g: 37, b: 37, ch: [61, 65, 68], arp: [49, 53, 56, 61] }],
      mel: [
        [[0, 73, 4], [4, 78, 4], [8, 81, 6], [14, 80, 2]],
        [[0, 78, 4], [4, 81, 2], [6, 86, 6], [12, 85, 4]],
        [[0, 83, 4], [4, 80, 4], [8, 76, 4], [12, 80, 4]],
        [[0, 77, 4], [4, 80, 4], [8, 85, 8]]],
      mel2: [
        [[0, 85, 6], [6, 83, 2], [8, 81, 4], [12, 78, 4]],
        [[0, 81, 4], [4, 86, 4], [8, 90, 6], [14, 88, 2]],
        [[0, 88, 4], [4, 86, 2], [6, 85, 2], [8, 83, 8]],
        [[0, 85, 4], [4, 80, 4], [8, 77, 4], [12, 73, 4]]],
      riff: { run: 'O..xx.O..xx.O.x.', fill: 'O..xx.O.O.O.OOOO', boss: 'O.xxO.xxO.xxOxxx', menu: 'O.....x.O.......' },
      kick: { run: [0, 3, 4, 6, 9, 10, 12, 14], menu: [0, 6] }, snare: { run: [8], menu: [8] } },
  ];
  let T = TRACKS[0], tIdx = 0, barsInTrack = 0, pendingTrack = -1, lastAnnounced = -1;
  const S16 = () => 60 / T.bpm / 4;
  function pickTrack(force) {
    const want = getSettings().musicTrack;
    if (want !== undefined && want !== 'mix' && TRACKS[+want]) return +want;
    if (!force) return tIdx;
    let n = tIdx;
    while (TRACKS.length > 1 && n === tIdx) n = Math.floor(Math.random() * TRACKS.length);
    return n;
  }
  let mode = 'menu', nextMode = 'menu', timer = null, nextT = 0, step = 0;

  function rig() {
    if (gtr) return;
    const cabChain = (inp, outGain) => {
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 95;
      const lo = ctx.createBiquadFilter(); lo.type = 'peaking'; lo.frequency.value = 130; lo.gain.value = 3;
      const scoop = ctx.createBiquadFilter(); scoop.type = 'peaking'; scoop.frequency.value = 750; scoop.Q.value = 0.8; scoop.gain.value = -5;
      const pres = ctx.createBiquadFilter(); pres.type = 'peaking'; pres.frequency.value = 2600; pres.gain.value = 3;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4800; lp.Q.value = 0.7;
      const out = ctx.createGain(); out.gain.value = outGain;
      inp.connect(hp); hp.connect(lo); lo.connect(scoop); scoop.connect(pres); pres.connect(lp); lp.connect(out);
      return out;
    };
    const heavy = new Float32Array(2048);
    for (let i = 0; i < 2048; i++) { const x = i / 1024 - 1; heavy[i] = Math.tanh(x * 18) / Math.tanh(18); }
    const soft = new Float32Array(2048);
    for (let i = 0; i < 2048; i++) { const x = i / 1024 - 1; soft[i] = Math.tanh(x * 5) / Math.tanh(5); }
    // Rhythmusgitarre, doppelt (links/rechts) für Breite
    const gIn = ctx.createGain(); gIn.gain.value = 1.4;
    const sh = ctx.createWaveShaper(); sh.curve = heavy; sh.oversample = '4x';
    gIn.connect(sh);
    const gOut = cabChain(sh, 0.11);
    const pl = ctx.createStereoPanner(); pl.pan.value = -0.6;
    const pr = ctx.createStereoPanner(); pr.pan.value = 0.6;
    const hd = ctx.createDelay(0.05); hd.delayTime.value = 0.016;
    gOut.connect(pl); pl.connect(musBus); gOut.connect(hd); hd.connect(pr); pr.connect(musBus);
    const gv = ctx.createGain(); gv.gain.value = 0.15; gOut.connect(gv); gv.connect(verbSend);
    gtr = gIn;
    // Lead-Gitarre
    const lIn = ctx.createGain(); lIn.gain.value = 1.2;
    const lsh = ctx.createWaveShaper(); lsh.curve = soft; lsh.oversample = '4x';
    lIn.connect(lsh);
    const lOut = cabChain(lsh, 0.075);
    lOut.connect(musBus);
    const ls = ctx.createGain(); ls.gain.value = 0.55; lOut.connect(ls); ls.connect(dlySend);
    const lv = ctx.createGain(); lv.gain.value = 0.4; lOut.connect(lv); lv.connect(verbSend);
    lead = lIn;
  }

  function chord(t, root, len, open, vel) {
    const g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = open ? 3600 : 820; f.Q.value = open ? 0.7 : 1.4;
    const ivs = open ? [0, 7, 12] : [0, 7];
    const oscs = [];
    for (const iv of ivs) for (const det of [-8, 8]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(root + iv); o.detune.value = det + (Math.random() - 0.5) * 4;
      o.connect(f); oscs.push(o);
    }
    const rel = open ? 0.12 : 0.03;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.004);
    g.gain.setValueAtTime(vel * (open ? 0.85 : 0.7), t + len); g.gain.exponentialRampToValueAtTime(0.0001, t + len + rel);
    f.connect(g); g.connect(gtr);
    oscs.forEach(o => { o.start(t); o.stop(t + len + rel + 0.02); });
  }
  function leadNote(t, m, len, vel) {
    const g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 3000;
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(0, t + 0.12); lg.gain.linearRampToValueAtTime(len > 0.3 ? 22 : 8, t + Math.min(len, 0.5));
    lfo.connect(lg);
    for (const det of [-5, 5]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(hz(m - (len > 0.25 ? 1 : 0)), t); o.frequency.exponentialRampToValueAtTime(hz(m), t + 0.04);
      o.detune.value = det; lg.connect(o.detune); o.connect(f); o.start(t); o.stop(t + len + 0.15);
    }
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.01);
    g.gain.setValueAtTime(vel * 0.8, t + len); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.12);
    f.connect(g); g.connect(lead); lfo.start(t); lfo.stop(t + len + 0.15);
  }
  function choir(t, notes, len, vol) {
    for (const m of notes) {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = hz(m); o2.frequency.value = hz(m); o.detune.value = -6; o2.detune.value = 7;
      const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter();
      f1.type = 'bandpass'; f1.frequency.value = 650; f1.Q.value = 5; f2.type = 'bandpass'; f2.frequency.value = 1080; f2.Q.value = 6;
      o.connect(f1); o2.connect(f1); o.connect(f2); o2.connect(f2); f1.connect(g); f2.connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.45); g.gain.setValueAtTime(vol, t + len - 0.1); g.gain.linearRampToValueAtTime(0.0001, t + len + 0.4);
      g.connect(musBus); const s2 = ctx.createGain(); s2.gain.value = 0.8; g.connect(s2); s2.connect(verbSend);
      [o, o2].forEach(x => { x.start(t); x.stop(t + len + 0.5); });
    }
  }
  function pluck(t, m, vol) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.value = hz(m); o2.frequency.value = hz(m + 12); o.detune.value = 4;
    f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.5);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(musBus);
    const sd = ctx.createGain(); sd.gain.value = 0.5; g.connect(sd); sd.connect(dlySend); const sv = ctx.createGain(); sv.gain.value = 0.5; g.connect(sv); sv.connect(verbSend);
    o.start(t); o2.start(t); o.stop(t + 1); o2.stop(t + 1);
  }
  function bass(t, m, len, vol) {
    const o = ctx.createOscillator(), s = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; s.type = 'sine'; o.frequency.value = hz(m); s.frequency.value = hz(m);
    f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 1.2;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.setValueAtTime(vol * 0.8, t + len); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.05);
    const sg = ctx.createGain(); sg.gain.value = 0.55; s.connect(sg); sg.connect(g);
    o.connect(f); f.connect(g); g.connect(musBus);
    o.start(t); s.start(t); o.stop(t + len + 0.08); s.stop(t + len + 0.08);
  }
  const snare = (t, v) => { nz(t, 0.2, 0.42 * v, musBus, { type: 'bandpass', f: 1900, q: 0.7, send: 0.35 }); nz(t, 0.12, 0.18 * v, musBus, { type: 'highpass', f: 5000 }); osc('triangle', 210, t, 0.12, 0.35 * v, musBus, { slideTo: 150 }); };
  const hat = (t, v) => nz(t, 0.04, 0.09 * v, musBus, { type: 'highpass', f: 8500 });
  const crash = (t, v) => nz(t, 1.6, 0.16 * v, musBus, { type: 'highpass', f: 4200, send: 0.5 });
  const tom = (t, f0) => osc('sine', f0, t, 0.3, 0.5, musBus, { slideTo: f0 * 0.6, send: 0.2 });

  function startMusic() {
    if (!ctx || timer) return;
    rig();
    nextT = ctx.currentTime + 0.1; step = 0;
    timer = setInterval(schedule, 50);
    schedule();
  }
  function stopMusic() { clearInterval(timer); timer = null; }
  // Weit vorausplanen: Hängt der Hauptthread kurz (Laden, 3D), läuft die Musik trotzdem weiter.
  const AHEAD = 0.6;
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const t0 = ctx.currentTime;
    if (nextT < t0 - 0.02) {
      // Verpasste Schritte überspringen statt alle auf einmal abzuspielen (das war das Glitchen)
      const s16 = S16(), miss = Math.ceil((t0 + 0.04 - nextT) / s16);
      nextT += miss * s16; step += miss;
    }
    while (nextT < t0 + AHEAD) { playStep(step, nextT); nextT += S16(); step++; }
  }
  function playStep(s, t) {
    rig();
    const s16 = s % 16;
    if (s16 === 0) {
      const bar0 = Math.floor(s / 16);
      if (bar0 % 4 === 0) {
        mode = nextMode;
        barsInTrack += 4;
        // Stückwechsel: gewünscht (Einstellung/Run-Start) oder nach 32 Takten im Wechsel-Modus
        let n = pendingTrack >= 0 ? pendingTrack : pickTrack(false);
        if (n === tIdx && getSettings().musicTrack === 'mix' && barsInTrack >= 32 && bar0 % 8 === 0 && mode !== 'boss') n = pickTrack(true);
        if (n !== tIdx) { tIdx = n; T = TRACKS[n]; barsInTrack = 0; if (dly) dly.delayTime.setValueAtTime(S16() * 3, t); step = s = 0; }
        pendingTrack = -1;
      }
    }
    const bar = Math.floor(s / 16), b8 = bar % 8, P = T.prog[bar % 4];
    const S = S16();
    const run = mode === 'run', boss = mode === 'boss', full = run || boss;
    const second = b8 >= 4, phrase = Math.floor(bar / 8) % 2;
    // Schlagzeug
    if (full) {
      if (boss ? true : T.kick.run.includes(s16)) kick(t, boss ? 0.55 : 0.8, musBus, 0.22, 165, 48);
      if (T.snare.run.includes(s16)) snare(t, 1);
      if (s16 % 2 === 0) hat(t, s16 % 4 === 0 ? 1 : 0.7);
      if (s16 === 0 && (b8 === 0 || b8 === 4 || boss)) crash(t, 1);
      if (b8 === 7 && s16 >= 12) snare(t, 0.5 + (s16 - 12) * 0.15);
    } else {
      if (T.kick.menu.includes(s16)) kick(t, 0.6, musBus, 0.26, 150, 45);
      if (T.snare.menu.includes(s16)) snare(t, 0.75);
      if (s16 % 2 === 0) hat(t, 0.55);
      if (s16 === 0 && b8 === 0) crash(t, 0.6);
      if (b8 === 7 && s16 >= 12) tom(t, [180, 150, 120, 95][s16 - 12]);
    }
    // Rhythmusgitarre
    const R = T.riff, riff = boss ? R.boss : full ? (b8 === 3 || b8 === 7 ? R.fill : R.run) : R.menu;
    const ch = riff[s16];
    let ring = 0;
    if (ch === 'O') { ring = 1; while (ring < 8 && riff[s16 + ring] === '.') ring++; }
    if (ch === 'O') chord(t, P.g, S * Math.max(1.8, full ? Math.min(ring, 3) - 0.2 : ring - 0.5), true, full ? 0.55 : 0.38);
    else if (ch === 'x') chord(t, P.g, S * 0.7, false, 0.6);
    // Bass folgt der Gitarre
    if (full && ch && ch !== '.') bass(t, P.b, ch === 'O' ? S * 1.8 : S * 0.7, 0.2);
    if (!full && s16 === 0) bass(t, P.b, S * 15, 0.16);
    // Chor über jeden Takt
    if (s16 === 0) choir(t, P.ch, S * 16, full ? 0.03 : 0.045);
    // Menü: gezupfte Arpeggios in der ersten Hälfte
    if (!full && !second && s16 % 2 === 0) pluck(t, P.arp[(s16 / 2) % 4] + 12, 0.07);
    // Lead-Gitarre: zweite Hälfte jeder Phrase
    if (second) {
      const mel = (phrase ? T.mel2 : T.mel)[b8 - 4];
      for (const [st, m, len] of mel) if (st === s16) leadNote(t, m, len * S, full ? 0.5 : 0.36);
    }
    if (boss && s16 % 8 === 0) osc('sawtooth', hz(P.b - 12), t, S * 7, 0.1, musBus, { filter: 220, q: 6 });
  }

  return {
    unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    apply,
    setMode(m) { if (m === 'run' && nextMode !== 'run') pendingTrack = pickTrack(true); nextMode = m; },
    get track() { return T.name; },
    skip() { if (ctx) pendingTrack = pickTrack(true); },
    tracks: TRACKS.map(x => x.name),
    play(name, arg) {
      if (!ctx || ctx.state !== 'running' || !(vol(getSettings(), 'sfxVol', 0.5) > 0)) return;
      const t = ctx.currentTime;
      if (MIN_GAP[name] && last[name] && t - last[name] < MIN_GAP[name]) return;
      last[name] = t;
      try { SFX[name]?.(arg); } catch (e) { /* egal */ }
    },
    stop() { stopMusic(); },
    // Hörprobe: rendert die Musik offline (Menü → Run → Boss) und liefert ein WAV als Base64
    async _render(plan = [[1, 'menu', 4], [1, 'run', 12], [2, 'menu', 4], [2, 'run', 12], [3, 'run', 12], [3, 'boss', 4]]) {
      const saved = { ctx, master, sfxBus, musBus, verb, verbSend, dly, dlySend, noiseBuf, distCurve, gtr, lead, mode, nextMode, T, tIdx, barsInTrack, pendingTrack };
      let sec = 3;
      for (const [ti, , bars] of plan) sec += bars * 16 * (60 / TRACKS[ti].bpm / 4);
      build(new OfflineAudioContext(2, Math.ceil(44100 * sec), 44100));
      musBus.gain.value = 0.6; sfxBus.gain.value = 0;
      let t = 0.05;
      for (const [ti, md, bars] of plan) {
        tIdx = ti; T = TRACKS[ti]; pendingTrack = -1; nextMode = md; mode = md;
        dly.delayTime.setValueAtTime(S16() * 3, t);
        for (let st = 0; st < bars * 16; st++) { barsInTrack = -1000; playStep(st + (md === 'run' ? 64 : 0), t); t += S16(); }
      }
      const buf = await ctx.startRendering();
      ({ ctx, master, sfxBus, musBus, verb, verbSend, dly, dlySend, noiseBuf, distCurve, gtr, lead, mode, nextMode, T, tIdx, barsInTrack, pendingTrack } = saved);
      const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
      const out = new DataView(new ArrayBuffer(44 + n * 4));
      const w = (o, str) => { for (let i = 0; i < str.length; i++) out.setUint8(o + i, str.charCodeAt(i)); };
      w(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
      out.setUint32(24, 44100, true); out.setUint32(28, 44100 * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 4, true);
      let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
      const k = peak > 0.98 ? 0.98 / peak : 1;
      for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i] * k)) * 32767, true); out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i] * k)) * 32767, true); }
      const bytes = new Uint8Array(out.buffer); let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return { b64: btoa(bin), peak };
    },
    _test() { const errs = []; if (!ctx) return ['kein AudioContext']; for (const k of Object.keys(SFX)) { try { SFX[k](k === 'riser' ? 0.5 : k === 'reveal' ? 'legendary' : 2); } catch (e) { errs.push(k + ': ' + e.message); } } try { for (let i = 0; i < 64; i++) { mode = i < 32 ? 'menu' : 'boss'; playStep(i, ctx.currentTime + i * 0.01); } } catch (e) { errs.push('musik: ' + e.message); } return errs; },
  };
}
