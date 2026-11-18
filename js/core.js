// Packfall – Spielkern (reine Logik, keine Darstellung)
// Alle drei Stile (Pixel, Clean, 3D) nutzen exakt diese Logik.

export const SAVE_KEY = 'packfall.save.v1';

export const RARITIES = {
  common:    { name: 'Gewöhnlich', color: '#b8c1cc', rank: 0 },
  rare:      { name: 'Selten',     color: '#4aa8ff', rank: 1 },
  epic:      { name: 'Episch',     color: '#b36bff', rank: 2 },
  legendary: { name: 'Legendär',   color: '#ffc23d', rank: 3 },
};

// kind: single | pierce | chain | splash | beam
export const GUARDIANS = [
  { id: 'schleuderer',    name: 'Schleuderer',    rarity: 'common',    kind: 'single', dmg: 4,   rate: 1.5, range: 230, speed: 520, color: '#e0c48c', desc: 'Wirft Steine. Zuverlässig.' },
  { id: 'funkenwerfer',   name: 'Funkenwerfer',   rarity: 'common',    kind: 'single', dmg: 1.8, rate: 3.4, range: 195, speed: 640, color: '#ffa940', desc: 'Viele kleine Funken.' },
  { id: 'steinwache',     name: 'Steinwache',     rarity: 'common',    kind: 'single', dmg: 10,  rate: 0.6, range: 215, speed: 430, color: '#a9b4c2', desc: 'Langsam, aber schwer.' },
  { id: 'frostweberin',   name: 'Frostweberin',   rarity: 'rare',      kind: 'single', dmg: 3.2, rate: 1.4, range: 245, speed: 480, color: '#8fe0ff', slow: 0.45, slowT: 1.6, desc: 'Verlangsamt getroffene Gegner.' },
  { id: 'dornenschuetze', name: 'Dornenschütze',  rarity: 'rare',      kind: 'pierce', dmg: 7,   rate: 1.0, range: 315, speed: 780, color: '#b6f26a', pierce: 3, desc: 'Bolzen durchschlagen 3 Gegner.' },
  { id: 'blitzruferin',   name: 'Blitzruferin',   rarity: 'epic',      kind: 'chain',  dmg: 7,   rate: 1.1, range: 265, color: '#c08cff', chain: 3, desc: 'Blitz springt auf 3 weitere Gegner.' },
  { id: 'glutmoerser',    name: 'Glutmörser',     rarity: 'epic',      kind: 'splash', dmg: 13,  rate: 0.55, range: 335, speed: 360, color: '#ff6a3d', splash: 78, desc: 'Flächenschaden beim Einschlag.' },
  { id: 'sonnenwaechter', name: 'Sonnenwächter',  rarity: 'legendary', kind: 'beam',   dps: 22,  range: 285, color: '#ffe066', desc: 'Dauerstrahl, heizt sich bis ×2 auf.' },
];
export const G = Object.fromEntries(GUARDIANS.map(g => [g.id, g]));

export const ENEMY_TYPES = {
  krabbler: { name: 'Schattengoblin', hp: 1,    speed: 40, r: 11, dmg: 6,  coin: 1,  color: '#8b4dff' },
  flitzer:  { name: 'Nachtflatterer', hp: 0.55, speed: 80, r: 8,  dmg: 4,  coin: 1,  color: '#ff4f93' },
  brocken:  { name: 'Steinkoloss', hp: 3.4,  speed: 24, r: 16, dmg: 16, coin: 3,  color: '#2fc79b' },
  boss:     { name: 'Schattenfürst', hp: 20, speed: 17, r: 28, dmg: 40, coin: 30, color: '#ff3347' },
};

export const REALMS = [
  { name: 'Aschewald' },
  { name: 'Frostgrat' },
  { name: 'Glutschlund' },
  { name: 'Leerenmeer' },
];
export const realmOf = wave => Math.floor((Math.max(1, wave) - 1) / 10) % REALMS.length;

// Upgrades: run=true erscheinen im Run-Shop (Münzen), sobald in der Werkstatt (Gems) freigeschaltet.
// Werkstatt-Stufe L: Max-Stufe im Run = 5·L, plus kleiner dauerhafter Bonus ab L=2.
export const UPGRADES = [
  { id: 'schaden', name: 'Schaden',      icon: 'sword',  run: true,  runBase: 15, runGrowth: 1.30, per: 0.12, unlock: 0,  wsBase: 12, wsGrowth: 1.8,  passive: 0.04 },
  { id: 'tempo',   name: 'Feuerrate',    icon: 'speed',  run: true,  runBase: 20, runGrowth: 1.34, per: 0.07, unlock: 0,  wsBase: 14, wsGrowth: 1.8,  passive: 0.03 },
  { id: 'panzer',  name: 'Kern-Panzer',  icon: 'shield', run: true,  runBase: 14, runGrowth: 1.30, per: 15,   unlock: 0,  wsBase: 10, wsGrowth: 1.75, passive: 10 },
  { id: 'zeiger',  name: 'Zeiger-Schlag', icon: 'cursor', run: true,  runBase: 12, runGrowth: 1.32, per: 0.25, unlock: 0,  wsBase: 12, wsGrowth: 1.8,  passive: 0.05 },
  { id: 'regen',   name: 'Regeneration', icon: 'heart',  run: true,  runBase: 28, runGrowth: 1.42, per: 0.5,  unlock: 25, wsBase: 16, wsGrowth: 1.85, passive: 0.2, req: ['panzer', 2] },
  { id: 'krit',    name: 'Krit-Chance',  icon: 'crit',   run: true,  runBase: 36, runGrowth: 1.48, per: 0.025, unlock: 40, wsBase: 20, wsGrowth: 1.9, passive: 0.01, req: ['schaden', 2] },
  { id: 'magnet',  name: 'Münzmagnet',   icon: 'coin',   run: true,  runBase: 30, runGrowth: 1.45, per: 0.10, unlock: 30, wsBase: 18, wsGrowth: 1.9,  passive: 0.05, req: ['tempo', 2] },
  { id: 'gemfund', name: 'Gem-Fund',     icon: 'gem',    run: false, unlock: 60, wsBase: 34, wsGrowth: 2.1,  passive: 0.10, req: ['magnet', 2] },
  { id: 'start',   name: 'Startkapital', icon: 'chest',  run: false, unlock: 20, wsBase: 15, wsGrowth: 1.9,  passive: 30, req: ['magnet', 1] },
];
export const U = Object.fromEntries(UPGRADES.map(u => [u.id, u]));
export const WS_MAX = 10;

export const BOOSTERS = {
  starter: { name: 'Start-Geschenk', cost: 0, cards: 3, foil: 0, odds: { common: 100 }, hidden: true },
  basic: { name: 'Helden-Booster', cost: 150, cards: 3, foil: 0.03, odds: { common: 70, rare: 24, epic: 5, legendary: 1 } },
  elite: { name: 'Elite-Booster',   cost: 450, cards: 3, foil: 0.06, odds: { common: 28, rare: 45, epic: 21, legendary: 6 }, guarantee: 'epic' },
};
export const CARD_MAX = 10;
export const MAX_DUPE_REFUND = 20;

export const ARENA = {
  spawnR: 560,
  viewR: 540,
  coreR: 34,
  slotR: 110,
  slotAngles: [-0.75 * Math.PI, -0.25 * Math.PI, 0.25 * Math.PI, 0.75 * Math.PI],
};

// ---------- Hilfen ----------
const pctStr = v => `${Math.round(v * 100)} %`;
export function fmt(n) {
  n = Math.floor(n);
  if (n < 10000) return n.toLocaleString('de-DE');
  const units = ['K', 'M', 'B', 'T', 'Qa', 'Qi'];
  let u = -1;
  let v = n;
  while (v >= 1000 && u < units.length - 1) { v /= 1000; u++; }
  return (v >= 100 ? v.toFixed(0) : v.toFixed(1)).replace('.', ',') + units[u];
}
export function fmtNum(v, d = 1) {
  return (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('de-DE');
}

function defaultMeta() {
  return {
    v: 1,
    gems: 0,
    totalGems: 0,
    ws: { schaden: 1, tempo: 1, panzer: 1, zeiger: 1, regen: 0, krit: 0, magnet: 0, gemfund: 0, start: 0 },
    cards: {},
    lineup: [null, null, null, null],
    best: 0,
    runs: 0,
    kills: 0,
    bossKills: 0,
    packs: 0,
    playTime: 0,
    speed: 1,
    flags: { intro: false, gift: false },
    settings: { sfx: 0.5, music: 1, gfx: 'auto', shake: 'on', numbers: 'on', boosterAnim: 'show' },
  };
}

// ---------- Spiel ----------
export function createGame({ storage = (typeof localStorage !== 'undefined' ? localStorage : null), rng = Math.random } = {}) {
  const listeners = {};
  const on = (type, fn) => { (listeners[type] ||= new Set()).add(fn); return () => listeners[type].delete(fn); };
  const emit = (type, d) => { listeners[type]?.forEach(f => f(d)); };

  let meta = defaultMeta();
  let hadSave = false;
  try {
    const raw = storage?.getItem(SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const d = defaultMeta();
      meta = { ...d, ...s, ws: { ...d.ws, ...(s.ws || {}) }, cards: s.cards || d.cards, lineup: s.lineup || d.lineup, flags: { ...d.flags, ...(s.flags || {}) }, settings: { ...d.settings, ...(s.settings || {}) } };
      hadSave = true;
    }
  } catch (e) { /* kein Speicher verfügbar */ }

  function save() {
    try { storage?.setItem(SAVE_KEY, JSON.stringify(meta)); } catch (e) { /* ignorieren */ }
  }

  let uid = 1;
  const game = {
    cursor: { x: 0, y: 0, on: false, charge: 1, r: 52, interval: 1.0 },
    t: 0,              // Laufzeit (für Animationen)
    meta,
    run: null,         // aktueller Run oder null (= Basis)
    guardians: [],     // aktuelle Aufstellung mit Positionen
    enemies: [],
    projectiles: [],
    beams: [],
    on, emit, save,
    hadSave,
  };

  // ----- abgeleitete Werte -----
  const wsL = id => meta.ws[id] || 0;
  const runL = id => (game.run ? game.run.levels[id] || 0 : 0);
  function wsPassive(id) {
    const u = U[id]; const L = wsL(id);
    return u.run ? Math.max(0, L - 1) * u.passive : L * u.passive;
  }
  game.wsLevel = wsL;
  game.runLevel = runL;
  game.wsPassive = wsPassive;
  game.runMax = id => 5 * wsL(id);
  game.runCost = id => Math.round(U[id].runBase * Math.pow(U[id].runGrowth, runL(id)));
  game.wsCost = id => {
    const u = U[id]; const L = wsL(id);
    if (L === 0) return u.unlock || Math.round(u.wsBase);
    return Math.round(u.wsBase * Math.pow(u.wsGrowth, L - 1));
  };
  game.wsMaxed = id => wsL(id) >= WS_MAX;
  game.wsReqMet = id => { const r = U[id].req; return !r || wsL(r[0]) >= r[1]; };

  const dmgMult = () => (1 + U.schaden.per * runL('schaden')) * (1 + wsPassive('schaden'));
  const rateMult = () => (1 + U.tempo.per * runL('tempo')) * (1 + wsPassive('tempo'));
  const critChance = () => Math.min(0.6, U.krit.per * runL('krit') + wsPassive('krit'));
  const coreMax = () => 100 + U.panzer.per * runL('panzer') + wsPassive('panzer');
  const regen = () => U.regen.per * runL('regen') + wsPassive('regen');
  const coinMult = () => (1 + U.magnet.per * runL('magnet')) * (1 + wsPassive('magnet'));
  const gemMult = () => 1 + wsPassive('gemfund');
  const cursorDmg = () => 4 * dmgMult() * (1 + U.zeiger.per * runL('zeiger')) * (1 + wsPassive('zeiger'));
  game.stats = { dmgMult, rateMult, critChance, coreMax, regen, coinMult, gemMult, cursorDmg };
  game.setCursor = (x, y, on) => { game.cursor.x = x; game.cursor.y = y; game.cursor.on = on; };

  // Text für Effekte
  game.runEffectText = (id, lvl = runL(id)) => {
    const u = U[id];
    switch (id) {
      case 'schaden': return `+${pctStr(u.per * lvl)} Schaden`;
      case 'tempo': return `+${pctStr(u.per * lvl)} Feuerrate`;
      case 'panzer': return `+${u.per * lvl} Kern-HP`;
      case 'regen': return `+${fmtNum(u.per * lvl)} HP/s`;
      case 'krit': return `${pctStr(u.per * lvl)} Krit (×2,5)`;
      case 'magnet': return `+${pctStr(u.per * lvl)} Münzen`;
      case 'zeiger': return `+${pctStr(u.per * lvl)} Zeiger-Schaden`;
      default: return '';
    }
  };
  game.wsEffectText = (id, L = wsL(id)) => {
    const u = U[id];
    if (u.run) {
      if (L === 0) return 'Gesperrt im Run-Shop';
      const p = Math.max(0, L - 1) * u.passive;
      let extra = '';
      if (p > 0) {
        if (id === 'panzer') extra = ` · dauerhaft +${p} HP`;
        else if (id === 'regen') extra = ` · dauerhaft +${fmtNum(p)} HP/s`;
        else extra = ` · dauerhaft +${pctStr(p)}`;
      }
      return `Run-Max. Stufe ${5 * L}${extra}`;
    }
    if (id === 'gemfund') return L ? `+${pctStr(L * u.passive)} Gems` : 'Mehr Gems pro Welle';
    if (id === 'start') return L ? `Start mit ${L * u.passive} Münzen` : 'Münzen zum Run-Start';
    return '';
  };

  // ----- Karten / Wächter -----
  game.cardStats = (id, lvl = meta.cards[id]?.lvl || 1, foil = meta.cards[id]?.foil || false) => {
    const d = G[id];
    const m = (1 + 0.25 * (lvl - 1)) * (foil ? 1.5 : 1);
    return { dmg: (d.dmg || 0) * m, dps: (d.dps || 0) * m, rate: d.rate || 0, range: d.range };
  };
  game.power = id => {
    if (!id || !meta.cards[id]) return 0;
    const s = game.cardStats(id);
    return s.dps ? s.dps : s.dmg * s.rate * (G[id].kind === 'chain' ? 2.5 : G[id].kind === 'splash' ? 2 : G[id].kind === 'pierce' ? 1.6 : 1);
  };

  function buildGuardians() {
    game.guardians = meta.lineup.map((id, slot) => {
      if (!id || !meta.cards[id]) return null;
      const a = ARENA.slotAngles[slot];
      return {
        slot, id, def: G[id], lvl: meta.cards[id].lvl, foil: meta.cards[id].foil,
        x: Math.cos(a) * ARENA.slotR, y: Math.sin(a) * ARENA.slotR,
        aim: a + Math.PI, cd: 0.3 + slot * 0.15, fired: 9, heat: 0, beamTarget: null, beamAcc: 0,
      };
    }).filter(Boolean);
  }
  buildGuardians();

  game.setLineup = (slot, id) => {
    if (game.run) return false;
    if (id && !meta.cards[id]) return false;
    const other = meta.lineup.indexOf(id);
    if (id && other >= 0 && other !== slot) meta.lineup[other] = meta.lineup[slot];
    meta.lineup[slot] = id;
    buildGuardians(); save(); emit('lineup');
    return true;
  };

  // ----- Booster -----
  function pickRarity(odds) {
    const total = Object.values(odds).reduce((a, b) => a + b, 0);
    let r = rng() * total;
    for (const k of Object.keys(odds)) { r -= odds[k]; if (r <= 0) return k; }
    return 'common';
  }
  game.openBooster = kind => {
    const b = BOOSTERS[kind];
    if (!b || meta.gems < b.cost || game.run) return null;
    if (kind === 'starter' && meta.flags.gift) return null;
    meta.gems -= b.cost;
    meta.packs++;
    if (kind === 'starter') meta.flags.gift = true;
    const results = [];
    const starterPool = kind === 'starter' ? GUARDIANS.filter(g => g.rarity === 'common').sort(() => rng() - 0.5) : null;
    for (let i = 0; i < b.cards; i++) {
      if (starterPool) {
        // Geschenk: zwei verschiedene Gewöhnliche + ein Seltener
        const def = i < 2 ? starterPool[i] : GUARDIANS.filter(g => g.rarity === 'rare')[Math.floor(rng() * 2)];
        meta.cards[def.id] = { lvl: 1, foil: false };
        const empty = meta.lineup.indexOf(null);
        if (empty >= 0) meta.lineup[empty] = def.id;
        results.push({ id: def.id, def, rarity: def.rarity, foil: false, isNew: true, lvlFrom: 0, lvlTo: 1, becameFoil: false, refund: 0, placed: true });
        continue;
      }
      let rar = pickRarity(b.odds);
      if (b.guarantee && i === b.cards - 1 && !results.some(r => RARITIES[r.rarity].rank >= RARITIES[b.guarantee].rank)) {
        rar = pickRarity(Object.fromEntries(Object.entries(b.odds).filter(([k]) => RARITIES[k].rank >= RARITIES[b.guarantee].rank)));
      }
      const pool = GUARDIANS.filter(g => g.rarity === rar);
      const def = pool[Math.floor(rng() * pool.length)];
      const foil = rng() < b.foil;
      const owned = meta.cards[def.id];
      const res = { id: def.id, def, rarity: rar, foil, isNew: !owned, lvlFrom: owned ? owned.lvl : 0, lvlTo: 1, becameFoil: false, refund: 0 };
      if (!owned) {
        meta.cards[def.id] = { lvl: 1, foil };
        const empty = meta.lineup.indexOf(null);
        if (empty >= 0) meta.lineup[empty] = def.id;
        else {
          // stärker als der schwächste Wächter? Dann automatisch einsetzen.
          let weakest = 0;
          meta.lineup.forEach((id, i) => { if (game.power(id) < game.power(meta.lineup[weakest])) weakest = i; });
          if (game.power(def.id) > game.power(meta.lineup[weakest])) { res.replaced = meta.lineup[weakest]; meta.lineup[weakest] = def.id; }
        }
        res.placed = meta.lineup.includes(def.id);
      } else {
        if (owned.lvl >= CARD_MAX) { res.refund = MAX_DUPE_REFUND; meta.gems += MAX_DUPE_REFUND; }
        else owned.lvl++;
        res.lvlTo = owned.lvl;
        if (foil && !owned.foil) { owned.foil = true; res.becameFoil = true; }
      }
      results.push(res);
    }
    buildGuardians(); save(); emit('booster', results); emit('gems');
    return results;
  };

  game.buyWs = id => {
    if (game.run || game.wsMaxed(id) || !game.wsReqMet(id)) return false;
    const c = game.wsCost(id);
    if (meta.gems < c) return false;
    meta.gems -= c; meta.ws[id] = wsL(id) + 1;
    save(); emit('ws', id); emit('gems');
    return true;
  };

  game.addTestGems = n => { meta.gems += n; save(); emit('gems'); };
  game.canStart = () => meta.lineup.some(id => id && meta.cards[id]);
  game.setFlag = (k, v) => { meta.flags[k] = v; save(); };
  game.setSetting = (k, v) => { meta.settings[k] = v; save(); emit('settings', k); };
  game.exportSave = () => JSON.stringify({ game: 'packfall', v: 1, at: new Date().toISOString(), meta });
  game.importSave = str => {
    try {
      const o = JSON.parse(str);
      const m = o && (o.game === 'packfall' || o.game === 'kernwacht') ? o.meta : o;
      if (!m || typeof m !== 'object' || !m.ws || !m.cards) return false;
      game.loadMeta(m);
      return true;
    } catch (e) { return false; }
  };
  game.loadMeta = m => {
    const d = defaultMeta();
    const merged = { ...d, ...m, ws: { ...d.ws, ...(m.ws || {}) }, flags: { ...d.flags, ...(m.flags || {}) }, settings: { ...d.settings, ...(m.settings || {}) } };
    Object.keys(meta).forEach(k => delete meta[k]);
    Object.assign(meta, merged);
    game.run = null; game.enemies = []; game.projectiles = []; game.beams = [];
    buildGuardians(); save(); emit('reset');
  };
  game.setSpeed = s => { meta.speed = s; save(); emit('speed'); };
  game.resetSave = () => {
    const d = defaultMeta();
    Object.keys(meta).forEach(k => delete meta[k]);
    Object.assign(meta, d);
    game.run = null; game.enemies = []; game.projectiles = []; game.beams = [];
    buildGuardians(); save(); emit('reset');
  };

  // ----- Run -----
  game.startRun = () => {
    if (game.run || !game.canStart()) return false;
    buildGuardians();
    game.run = {
      wave: 0, phase: 'pause', pauseT: 0.8, toSpawn: 0, spawnT: 0,
      coins: wsPassive('start'), coinsTotal: 0, gems: 0, kills: 0, time: 0,
      levels: Object.fromEntries(UPGRADES.filter(u => u.run).map(u => [u.id, 0])),
      coreHp: 0, coreMax: 0, bossAlive: false, prevBest: meta.best,
    };
    game.run.coreMax = coreMax();
    game.run.coreHp = game.run.coreMax;
    game.enemies = []; game.projectiles = []; game.beams = [];
    game.cursor.charge = 1;
    emit('runStart');
    return true;
  };

  game.buyRun = id => {
    const r = game.run; if (!r) return false;
    if (runL(id) >= game.runMax(id)) return false;
    const c = game.runCost(id);
    if (r.coins < c) return false;
    r.coins -= c; r.levels[id]++;
    if (id === 'panzer') { const old = r.coreMax; r.coreMax = coreMax(); r.coreHp += r.coreMax - old; }
    emit('runBuy', id);
    return true;
  };

  game.endRun = (reason = 'fall') => {
    const r = game.run; if (!r) return;
    meta.runs++;
    const summary = {
      wave: r.wave, kills: r.kills, gems: r.gems, coins: r.coinsTotal, time: r.time,
      record: r.wave > r.prevBest, prevBest: r.prevBest, reason,
    };
    game.run = null;
    game.enemies = []; game.projectiles = []; game.beams = [];
    buildGuardians(); save();
    emit('runEnd', summary);
  };

  function addGems(n, why) {
    n = Math.max(0, Math.round(n));
    if (!n) return;
    meta.gems += n; meta.totalGems += n; game.run.gems += n;
    emit('gems', { n, why });
  }

  function startWave() {
    const r = game.run;
    r.wave++;
    const w = r.wave;
    r.toSpawn = 6 + Math.floor(w * 1.5);
    r.spawnT = 0.2;
    r.phase = 'spawn';
    r.boss = w % 10 === 0;
    if (r.boss) r.bossPending = true;
    const realmChanged = w > 1 && realmOf(w) !== realmOf(w - 1);
    emit('waveStart', { wave: w, boss: r.boss, realm: realmOf(w), realmChanged });
  }

  function spawnEnemy(type) {
    const r = game.run; const w = r.wave;
    const T = ENEMY_TYPES[type];
    const a = rng() * Math.PI * 2;
    const hp = 8 * Math.pow(1.15, w - 1) * T.hp;
    const e = {
      id: uid++, type, T, x: Math.cos(a) * ARENA.spawnR, y: Math.sin(a) * ARENA.spawnR,
      hp, maxHp: hp, r: T.r, speed: T.speed * (0.9 + rng() * 0.2) * (1 + Math.min(0.5, w * 0.008)),
      dmg: T.dmg * (1 + 0.06 * (w - 1)), slowT: 0, slowF: 0, flash: 0, dead: false, born: game.t, seed: rng(),
    };
    game.enemies.push(e);
    emit('spawn', e);
    return e;
  }

  function pickType(w) {
    const x = rng();
    if (w >= 6 && x < 0.15) return 'brocken';
    if (w >= 3 && x < 0.42) return 'flitzer';
    return 'krabbler';
  }

  function damage(e, amount, crit, color, src) {
    if (e.dead) return;
    e.hp -= amount;
    e.flash = 0.12;
    emit('hit', { x: e.x, y: e.y, amount, crit, color, e, src });
    if (e.hp <= 0) kill(e);
  }

  function kill(e) {
    const r = game.run;
    e.dead = true;
    r.kills++; meta.kills++;
    const coins = Math.max(1, Math.round(e.T.coin * Math.ceil(1 + r.wave * 0.35) * coinMult()));
    r.coins += coins; r.coinsTotal += coins;
    emit('kill', { x: e.x, y: e.y, e, coins });
    if (e.type === 'boss') {
      r.bossAlive = false;
      meta.bossKills = (meta.bossKills || 0) + 1;
      addGems((10 + Math.floor(r.wave / 2)) * gemMult(), 'boss');
    }
  }

  function rollCrit() { return rng() < critChance(); }

  function findTarget(g) {
    let best = null; let bd = Infinity;
    for (const e of game.enemies) {
      if (e.dead) continue;
      const dx = e.x - g.x, dy = e.y - g.y;
      if (dx * dx + dy * dy > g.def.range * g.def.range) continue;
      const dc = Math.hypot(e.x, e.y);
      if (dc < bd) { bd = dc; best = e; }
    }
    return best;
  }

  function fire(g, target) {
    const d = g.def; const s = game.cardStats(g.id, g.lvl, g.foil);
    const crit = rollCrit();
    const dmg = s.dmg * dmgMult() * (crit ? 2.5 : 1);
    g.fired = 0;
    if (d.kind === 'chain') {
      const pts = [{ x: g.x, y: g.y }];
      const hit = new Set();
      let cur = target; let f = 1;
      for (let i = 0; i <= d.chain && cur; i++) {
        pts.push({ x: cur.x, y: cur.y });
        hit.add(cur);
        damage(cur, dmg * f, crit, d.color, 'zap');
        f *= 0.85;
        let nb = null, nd = 130 * 130;
        for (const e of game.enemies) {
          if (e.dead || hit.has(e)) continue;
          const dd = (e.x - cur.x) ** 2 + (e.y - cur.y) ** 2;
          if (dd < nd) { nd = dd; nb = e; }
        }
        cur = nb;
      }
      emit('zap', { pts, color: d.color, g });
      return;
    }
    const ang = Math.atan2(target.y - g.y, target.x - g.x);
    const p = {
      id: uid++, kind: d.kind, gid: g.id, x: g.x + Math.cos(ang) * 14, y: g.y + Math.sin(ang) * 14,
      vx: Math.cos(ang) * d.speed, vy: Math.sin(ang) * d.speed, speed: d.speed,
      target, dmg, crit, color: d.color, life: (d.range / d.speed) * 1.6,
      pierce: d.pierce || 0, hitSet: null, splash: d.splash || 0, slow: d.slow || 0, slowT: d.slowT || 0,
      sx: g.x, sy: g.y, tx: target.x, ty: target.y,
    };
    if (p.kind === 'pierce') p.hitSet = new Set();
    game.projectiles.push(p);
    emit('shot', { g, p });
  }

  function stepProjectiles(dt) {
    for (const p of game.projectiles) {
      p.life -= dt;
      if (p.kind !== 'pierce' && p.target && !p.target.dead) {
        const a = Math.atan2(p.target.y - p.y, p.target.x - p.x);
        p.vx = Math.cos(a) * p.speed; p.vy = Math.sin(a) * p.speed;
        p.tx = p.target.x; p.ty = p.target.y;
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.kind === 'pierce') {
        for (const e of game.enemies) {
          if (e.dead || p.hitSet.has(e)) continue;
          if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (e.r + 5) ** 2) {
            p.hitSet.add(e); damage(e, p.dmg, p.crit, p.color, 'pierce');
            if (p.hitSet.size >= p.pierce) { p.life = 0; break; }
          }
        }
      } else if (p.target && !p.target.dead) {
        const e = p.target;
        if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (e.r + 5) ** 2) {
          if (p.kind === 'splash') {
            for (const o of game.enemies) {
              if (!o.dead && (o.x - p.x) ** 2 + (o.y - p.y) ** 2 < (p.splash + o.r) ** 2) damage(o, p.dmg, p.crit, p.color, 'splash');
            }
            emit('boom', { x: p.x, y: p.y, r: p.splash, color: p.color });
          } else {
            if (p.slow) { e.slowT = p.slowT; e.slowF = p.slow; }
            damage(e, p.dmg, p.crit, p.color, p.kind);
          }
          p.life = 0;
        }
      } else if (p.kind === 'splash' && p.life > 0) {
        // Ziel weg: am letzten Zielpunkt einschlagen
        if ((p.tx - p.x) ** 2 + (p.ty - p.y) ** 2 < 100) {
          for (const o of game.enemies) {
            if (!o.dead && (o.x - p.x) ** 2 + (o.y - p.y) ** 2 < (p.splash + o.r) ** 2) damage(o, p.dmg, p.crit, p.color, 'splash');
          }
          emit('boom', { x: p.x, y: p.y, r: p.splash, color: p.color });
          p.life = 0;
        }
      }
    }
    game.projectiles = game.projectiles.filter(p => p.life > 0);
  }

  function step(dt) {
    const r = game.run;
    r.time += dt;
    meta.playTime += dt;
    // Kern-Regeneration
    r.coreHp = Math.min(r.coreMax, r.coreHp + regen() * dt);

    // Wellen-Ablauf
    if (r.phase === 'pause') {
      r.pauseT -= dt;
      if (r.pauseT <= 0) startWave();
    } else if (r.phase === 'spawn') {
      r.spawnT -= dt;
      if (r.spawnT <= 0) {
        if (r.bossPending) { r.bossPending = false; r.bossAlive = true; spawnEnemy('boss'); emit('boss'); }
        spawnEnemy(pickType(r.wave));
        r.toSpawn--;
        r.spawnT = Math.max(0.28, 1.0 - r.wave * 0.025);
        if (r.toSpawn <= 0) r.phase = 'fight';
      }
    } else if (r.phase === 'fight') {
      if (game.enemies.length === 0) {
        // Welle geschafft
        const w = r.wave;
        let gems = (1 + Math.floor(w / 4)) * gemMult();
        if (w > meta.best) { gems += 3 * gemMult(); meta.best = w; emit('record', w); }
        addGems(gems, 'wave');
        save();
        emit('waveClear', { wave: w });
        r.phase = 'pause'; r.pauseT = 1.4;
      }
    }

    // Gegner bewegen
    for (const e of game.enemies) {
      if (e.dead) continue;
      e.flash = Math.max(0, e.flash - dt);
      let sp = e.speed;
      if (e.slowT > 0) { e.slowT -= dt; sp *= 1 - e.slowF; }
      const d = Math.hypot(e.x, e.y);
      if (d <= ARENA.coreR + e.r) {
        e.dead = true;
        r.coreHp -= e.dmg;
        emit('coreHit', { dmg: e.dmg, e });
        if (e.type === 'boss') r.bossAlive = false;
        continue;
      }
      e.x -= (e.x / d) * sp * dt;
      e.y -= (e.y / d) * sp * dt;
    }

    // Wächter
    game.beams = [];
    const rm = rateMult();
    for (const g of game.guardians) {
      g.fired += dt;
      const t = findTarget(g);
      if (t) {
        const want = Math.atan2(t.y - g.y, t.x - g.x);
        let da = want - g.aim;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        g.aim += da * Math.min(1, dt * 14);
      }
      if (g.def.kind === 'beam') {
        if (t) {
          g.heat = g.beamTarget === t ? Math.min(1, g.heat + dt / 3) : 0;
          g.beamTarget = t;
          const s = game.cardStats(g.id, g.lvl, g.foil);
          const amt = s.dps * dmgMult() * rm * (1 + g.heat) * dt;
          g.beamAcc += amt;
          t.hp -= amt; t.flash = Math.max(t.flash, 0.05);
          if (t.hp <= 0) { emit('hit', { x: t.x, y: t.y, amount: g.beamAcc, crit: false, color: g.def.color, e: t, src: 'beam' }); g.beamAcc = 0; kill(t); }
          else if (g.beamAcc > 0 && g.fired > 0.3) { emit('hit', { x: t.x, y: t.y, amount: g.beamAcc, crit: false, color: g.def.color, e: t, src: 'beam' }); g.beamAcc = 0; g.fired = 0; }
          game.beams.push({ g, x1: g.x, y1: g.y, x2: t.x, y2: t.y, heat: g.heat, color: g.def.color });
        } else { g.heat = 0; g.beamTarget = null; }
        continue;
      }
      g.cd -= dt * rm;
      if (g.cd <= 0 && t) { fire(g, t); g.cd = 1 / g.def.rate; }
      else if (g.cd < 0) g.cd = 0;
    }

    // Maus-Cursor: Flächenschlag, sobald geladen und Gegner im Kreis
    const cu = game.cursor;
    cu.charge = Math.min(1, cu.charge + dt / cu.interval);
    if (cu.on && cu.charge >= 1) {
      const inside = game.enemies.filter(e => !e.dead && (e.x - cu.x) ** 2 + (e.y - cu.y) ** 2 < (cu.r + e.r) ** 2);
      if (inside.length) {
        cu.charge = 0;
        const crit = rollCrit();
        const dmg = cursorDmg() * (crit ? 2.5 : 1);
        emit('cursorStrike', { x: cu.x, y: cu.y, r: cu.r, n: inside.length, crit });
        inside.forEach(e => damage(e, dmg, crit, '#ffd75e', 'cursor'));
      }
    }

    stepProjectiles(dt);
    game.enemies = game.enemies.filter(e => !e.dead);

    if (r.coreHp <= 0) { r.coreHp = 0; game.endRun('fall'); }
  }

  game.update = realDt => {
    realDt = Math.min(0.1, Math.max(0, realDt));
    game.t += realDt;
    if (!game.run) return;
    let dt = realDt * (meta.speed || 1);
    while (dt > 0 && game.run) {
      const s = Math.min(dt, 1 / 60);
      step(s);
      dt -= s;
    }
  };

  return game;
}
