// Packfall – kleine Retro-Soundeffekte und ruhige Musik, komplett per WebAudio erzeugt (keine Dateien)
export function createAudio(getSettings) {
  let ctx = null, sfxGain = null, musGain = null, musTimer = null, step = 0;
  const last = {};

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      sfxGain = ctx.createGain(); musGain = ctx.createGain();
      sfxGain.connect(ctx.destination); musGain.connect(ctx.destination);
      apply();
    } catch (e) { ctx = null; }
    return ctx;
  }
  function apply() {
    if (!ctx) return;
    const s = getSettings();
    sfxGain.gain.value = Number(s.sfx) || 0;
    musGain.gain.value = [0, 0.045, 0.09][Number(s.music)] || 0;
    if (Number(s.music) > 0) startMusic(); else stopMusic();
  }
  function tone(f, dur, type = 'square', vol = 0.15, slide = 0, delay = 0, out = sfxGain) {
    if (!ctx || !out) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(30, f + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02);
  }
  let noiseBuf = null;
  function noise(dur, vol = 0.12, freq = 1200, delay = 0) {
    if (!ctx) return;
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const t = ctx.currentTime + delay;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + dur + 0.02);
  }
  const SFX = {
    click: () => tone(720, 0.04, 'square', 0.06),
    nav: () => tone(520, 0.03, 'square', 0.05),
    shot: () => tone(900 + Math.random() * 200, 0.05, 'square', 0.025, -400),
    hit: () => noise(0.05, 0.05, 2400),
    kill: () => { tone(260, 0.09, 'square', 0.06, -140); noise(0.07, 0.05, 1400); },
    coin: () => { tone(1320, 0.05, 'square', 0.04); tone(1760, 0.07, 'square', 0.04, 0, 0.05); },
    buy: () => { tone(660, 0.06, 'square', 0.07); tone(990, 0.09, 'square', 0.07, 0, 0.06); },
    deny: () => tone(160, 0.12, 'square', 0.06, -40),
    boom: () => { noise(0.35, 0.16, 700); tone(90, 0.3, 'triangle', 0.15, -50); },
    zap: () => { noise(0.12, 0.08, 5000); tone(1400, 0.08, 'sawtooth', 0.03, -900); },
    strike: () => { noise(0.1, 0.1, 2600); tone(180, 0.12, 'triangle', 0.14, -90); },
    core: () => { tone(110, 0.25, 'sawtooth', 0.09, -40); noise(0.2, 0.08, 500); },
    wave: () => [523, 659, 784].forEach((f, i) => tone(f, 0.12, 'square', 0.05, 0, i * 0.08)),
    boss: () => { tone(80, 0.7, 'sawtooth', 0.12, -20); tone(84, 0.7, 'square', 0.06, -20); },
    shake: () => noise(0.08, 0.05, 900),
    rip: () => { noise(0.25, 0.14, 3200); tone(300, 0.2, 'square', 0.04, 500); },
    reveal: r => {
      const seq = r === 'legendary' ? [523, 659, 784, 1047, 1319] : r === 'epic' ? [523, 659, 784, 1047] : r === 'rare' ? [587, 740, 880] : [440, 554];
      seq.forEach((f, i) => tone(f, 0.16, 'square', 0.06, 0, i * 0.07));
    },
    fanfare: () => [392, 523, 659, 784, 659, 784].forEach((f, i) => tone(f, 0.18, 'square', 0.06, 0, i * 0.11)),
    over: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.1, 0, i * 0.18)),
  };
  const MIN_GAP = { shot: 0.06, hit: 0.05, kill: 0.04, coin: 0.08, zap: 0.08, boom: 0.08 };

  // ruhige Moll-Arpeggios
  const BASS = [110, 110, 87.3, 98];
  const ARP = [[220, 262, 330, 262], [220, 262, 330, 392], [175, 220, 262, 220], [196, 247, 294, 247]];
  function startMusic() {
    if (!ctx || musTimer) return;
    musTimer = setInterval(() => {
      if (!ctx || ctx.state !== 'running') return;
      const bar = Math.floor(step / 8) % 4, s = step % 8;
      if (s === 0) tone(BASS[bar], 1.6, 'triangle', 0.5, 0, 0, musGain);
      if (s % 2 === 0) tone(ARP[bar][(s / 2) % 4] * 2, 0.35, 'square', 0.12, 0, 0, musGain);
      if (s === 5 && Math.random() < 0.5) tone(ARP[bar][3] * 4, 0.25, 'triangle', 0.08, 0, 0, musGain);
      step++;
    }, 210);
  }
  function stopMusic() { clearInterval(musTimer); musTimer = null; }

  return {
    unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    apply,
    play(name, arg) {
      if (!ctx || ctx.state !== 'running' || !(Number(getSettings().sfx) > 0)) return;
      const now = ctx.currentTime;
      if (MIN_GAP[name] && last[name] && now - last[name] < MIN_GAP[name]) return;
      last[name] = now;
      try { SFX[name]?.(arg); } catch (e) { /* egal */ }
    },
    stop() { stopMusic(); },
  };
}
