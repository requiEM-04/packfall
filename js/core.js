// Packfall – Spielkern: Tower Defense auf einem Raster (reine Logik, keine Darstellung)
// Welt 1 „Aschewald“: 8 Level + Endlos. Türme aus Boostern, Loadout, Ausbau im Run, Werkstatt dauerhaft.

export const SAVE_KEY = 'packfall.save.v2';
export const COLS = 20, ROWS = 12;

export const RARITIES = {
  common:    { name: 'Gewöhnlich', color: '#8f9093', rank: 0 },
  rare:      { name: 'Selten',     color: '#6a8aa6', rank: 1 },
  epic:      { name: 'Episch',     color: '#8f76a0', rank: 2 },
  legendary: { name: 'Legendär',   color: '#b39a5e', rank: 3 },
};

// ---------- Türme ----------
// Werte je Ausbaustufe (L1–L5). Fehlende Werte werden von der Stufe davor übernommen.
// range = Felder, rate = Schüsse pro Sekunde, cost = Preis dieser Stufe (L1 = Bauen).
export const TOWERS = [
  { id: 'repetierer', name: 'Repetierer', rarity: 'common', kind: 'bullet', air: true, accent: '#d9a45a', limit: 12,
    role: 'Einzelziel · schnell', desc: 'Kurbel-Gatling. Schnell, zuverlässig, holt auch Flieger runter.',
    lv: [{ cost: 150, dmg: 2, rate: 4, range: 3.2 }, { cost: 120, rate: 5.5, name: 'Schnelllader' }, { cost: 300, dmg: 3.5, rate: 6, range: 3.6, name: 'Lange Läufe' },
      { cost: 700, dmg: 6, rate: 7.5, range: 3.8, ap: 0.3, name: 'Zwillingslauf' }, { cost: 1800, dmg: 11, rate: 10, range: 4.2, ap: 0.5, name: 'Sturmkanone' }] },
  { id: 'moerser', name: 'Mörser', rarity: 'common', kind: 'shell', air: false, accent: '#d0874e', limit: 12,
    role: 'Fläche · weit · nur Boden', desc: 'Schwere Granaten im hohen Bogen. Trifft Gruppen, aber keine Flieger.',
    lv: [{ cost: 250, dmg: 9, splash: 0.9, rate: 0.55, range: 5.5, minRange: 1.2 }, { cost: 200, dmg: 13, name: 'Größeres Kaliber' }, { cost: 450, dmg: 20, splash: 1.1, rate: 0.65, name: 'Doppelrohr' },
      { cost: 900, dmg: 34, rate: 0.7, burn: 4, name: 'Brandgranaten' }, { cost: 2200, dmg: 60, splash: 1.4, rate: 0.8, cluster: 3, name: 'Streubomben' }] },
  { id: 'praegewerk', name: 'Prägewerk', rarity: 'common', kind: 'farm', air: false, accent: '#c9b26a', limit: 8,
    role: 'Wirtschaft', desc: 'Prägt zu jeder Welle Münzen. Früh gebaut, zahlt es sich mehrfach aus.',
    lv: [{ cost: 250, income: 50 }, { cost: 200, income: 100, name: 'Zweite Presse' }, { cost: 500, income: 220, name: 'Dampfantrieb' },
      { cost: 1100, income: 480, name: 'Goldschmelze' }, { cost: 2600, income: 1100, name: 'Münzfabrik' }] },
  { id: 'frostwerfer', name: 'Frostwerfer', rarity: 'rare', kind: 'frost', air: true, accent: '#9cc8d8', limit: 12,
    role: 'Verlangsamen · Fläche', desc: 'Schießt Kältekapseln, die Gegner in kleiner Fläche verlangsamen.',
    lv: [{ cost: 300, dmg: 1.5, rate: 1.2, range: 3.0, splash: 0.8, slow: 0.3, slowT: 2 }, { cost: 220, slow: 0.4, name: 'Kühlmittel' }, { cost: 450, dmg: 3, splash: 1.0, range: 3.4, name: 'Druckdüse' },
      { cost: 900, dmg: 6, slow: 0.5, freeze: 0.8, name: 'Schockfrost' }, { cost: 2000, dmg: 14, slow: 0.6, splash: 1.3, freeze: 1.2, name: 'Nullpunkt' }] },
  { id: 'flammer', name: 'Flammer', rarity: 'rare', kind: 'flame', air: false, accent: '#e0703e', limit: 12,
    role: 'Kegel · Brand · nur Boden', desc: 'Kurze Reichweite, aber alles im Flammenkegel brennt weiter.',
    lv: [{ cost: 350, dps: 10, range: 2.4, burn: 3 }, { cost: 250, dps: 15, name: 'Mehr Druck' }, { cost: 550, dps: 26, range: 2.7, name: 'Lange Düse' },
      { cost: 1100, dps: 45, burn: 8, melt: 0.2, name: 'Thermit' }, { cost: 2400, dps: 90, range: 3.0, burn: 18, name: 'Höllenschlund' }] },
  { id: 'tesla', name: 'Tesla-Spule', rarity: 'rare', kind: 'tesla', air: true, accent: '#8fb6e8', limit: 12,
    role: 'Kette · mehrere Ziele', desc: 'Blitze springen von Gegner zu Gegner. Stark gegen Schwärme.',
    lv: [{ cost: 400, dmg: 7, rate: 0.9, range: 3.2, chain: 3 }, { cost: 300, dmg: 9, chain: 4, name: 'Zweite Spule' }, { cost: 650, dmg: 15, rate: 1.0, name: 'Kondensator' },
      { cost: 1300, dmg: 26, rate: 1.15, chain: 5, name: 'Hochspannung' }, { cost: 2800, dmg: 50, chain: 7, stun: 0.25, name: 'Gewitterturm' }] },
  { id: 'flak', name: 'Flak', rarity: 'rare', kind: 'flak', air: true, accent: '#b8b08a', limit: 12,
    role: 'Luftabwehr · Fläche', desc: 'Sprenggeschosse mit Splitterwolke. Dreifacher Schaden gegen Flieger.',
    lv: [{ cost: 350, dmg: 6, rate: 1.4, range: 4.5, splash: 0.6 }, { cost: 250, dmg: 9, name: 'Zeitzünder' }, { cost: 550, dmg: 14, rate: 1.6, range: 5, name: 'Radar' },
      { cost: 1100, dmg: 24, splash: 0.8, name: 'Splitterhülle' }, { cost: 2400, dmg: 45, rate: 2, shots: 2, name: 'Vierling' }] },
  { id: 'railgun', name: 'Railgun', rarity: 'epic', kind: 'rail', air: true, accent: '#7fd0d0', limit: 6,
    role: 'Durchschlag · ignoriert Panzer', desc: 'Magnetgeschoss durch alles in einer Linie. Panzer zählt nicht.',
    lv: [{ cost: 800, dmg: 70, rate: 0.33, range: 6.5 }, { cost: 500, dmg: 100, name: 'Stärkere Spulen' }, { cost: 1000, dmg: 160, rate: 0.38, range: 7, name: 'Langer Lauf' },
      { cost: 2000, dmg: 280, rate: 0.42, name: 'Überladung' }, { cost: 4200, dmg: 600, rate: 0.5, name: 'Sternenbrecher' }] },
  { id: 'raketenwerk', name: 'Raketenwerk', rarity: 'epic', kind: 'missile', air: true, accent: '#d88a6a', limit: 8,
    role: 'Zielsuchend · Fläche', desc: 'Salven zielsuchender Raketen. Trifft Boden und Luft.',
    lv: [{ cost: 900, dmg: 14, rate: 0.7, range: 5, splash: 0.8, n: 2 }, { cost: 600, n: 3, name: 'Dritte Röhre' }, { cost: 1200, dmg: 24, rate: 0.8, name: 'Hohlladung' },
      { cost: 2400, dmg: 40, n: 4, name: 'Schwarmsalve' }, { cost: 4800, dmg: 70, n: 6, splash: 1.1, name: 'Sternfeuer' }] },
  { id: 'verstaerker', name: 'Verstärker', rarity: 'epic', kind: 'support', air: false, accent: '#a98fd8', limit: 4,
    role: 'Unterstützung', desc: 'Strahlt Energie ab: Türme in der Nähe schießen stärker und schneller.',
    lv: [{ cost: 700, range: 2.5, bDmg: 0.15, bRate: 0.1, bRange: 0 }, { cost: 500, bDmg: 0.2, bRate: 0.12, name: 'Resonator' }, { cost: 1000, range: 3, bDmg: 0.25, bRate: 0.15, bRange: 0.05, name: 'Fokuslinse' },
      { cost: 2000, bDmg: 0.35, bRate: 0.2, bRange: 0.08, name: 'Kraftfeld' }, { cost: 4000, bDmg: 0.5, bRate: 0.25, bRange: 0.12, name: 'Leitstern' }] },
  { id: 'laserlanze', name: 'Laserlanze', rarity: 'legendary', kind: 'laser', air: true, accent: '#e05a6a', limit: 3,
    role: 'Dauerstrahl · heizt auf', desc: 'Ein Strahl, der heißer wird, je länger er auf einem Ziel bleibt (bis ×3).',
    lv: [{ cost: 1500, dps: 45, range: 4.5, ramp: 3, rampT: 2.5, ap: 0.5 }, { cost: 1000, dps: 70, name: 'Fokussierung' }, { cost: 2000, dps: 110, range: 5, name: 'Prisma' },
      { cost: 4000, dps: 190, name: 'Plasmakern' }, { cost: 8000, dps: 380, ramp: 4, name: 'Sonnenlanze' }] },
  { id: 'haubitze', name: 'Titan-Haubitze', rarity: 'legendary', kind: 'howitzer', air: false, accent: '#c8a070', limit: 3,
    role: 'Riesige Fläche · betäubt', desc: 'Langsam, laut, gewaltig. Jeder Einschlag betäubt alles drumherum.',
    lv: [{ cost: 2000, dmg: 180, splash: 1.8, rate: 0.22, range: 8, stun: 0.5, minRange: 1.5 }, { cost: 1200, dmg: 260, name: 'Verstärktes Rohr' }, { cost: 2400, dmg: 400, rate: 0.25, name: 'Ladeautomatik' },
      { cost: 4800, dmg: 650, splash: 2.1, name: 'Bunkerbrecher' }, { cost: 9000, dmg: 1200, stun: 1.0, rate: 0.28, name: 'Weltenspalter' }] },
];
for (const t of TOWERS) for (let i = 1; i < t.lv.length; i++) t.lv[i] = { ...t.lv[i - 1], name: undefined, ...t.lv[i] };
for (const t of TOWERS) t.lv[0].name = 'Gebaut';
export const T = Object.fromEntries(TOWERS.map(t => [t.id, t]));
export const MAX_LV = 5;

// ---------- Gegner ----------
export const ENEMIES = {
  laeufer: { name: 'Läufer', hp: 12, speed: 1.3, reward: 4, dmg: 1, size: 0.34, desc: 'Grunzt, rennt, stirbt. Kommt in jeder Welle.' },
  flitzer: { name: 'Flitzer', hp: 8, speed: 2.4, reward: 4, dmg: 1, size: 0.28, desc: 'Sehr schnell und zerbrechlich.' },
  schwarm: { name: 'Schwärmer', hp: 4, speed: 1.9, reward: 1, dmg: 1, size: 0.2, desc: 'Winzig, aber kommt in Massen.' },
  panzer: { name: 'Panzerkäfer', hp: 45, speed: 0.85, reward: 10, dmg: 2, size: 0.42, armor: 0.5, desc: 'Halbiert jeden Schaden. Railgun & Laser helfen.' },
  flieger: { name: 'Aschekrähe', hp: 14, speed: 1.7, reward: 6, dmg: 1, size: 0.3, air: true, desc: 'Fliegt. Nur Türme mit Luftabwehr treffen sie.' },
  heiler: { name: 'Seuchenschamane', hp: 35, speed: 1.0, reward: 12, dmg: 2, size: 0.38, heal: 0.05, desc: 'Heilt Gegner in seiner Nähe. Zuerst ausschalten!' },
  brut: { name: 'Brutmutter', hp: 60, speed: 0.8, reward: 14, dmg: 3, size: 0.46, spawn: 4, desc: 'Platzt beim Tod und lässt vier Schwärmer frei.' },
  koloss: { name: 'Koloss', hp: 550, speed: 0.55, reward: 120, dmg: 20, size: 0.7, armor: 0.25, boss: true, desc: 'Boss. Kommt in jeder 10. Welle und am Levelende.' },
  fuerst: { name: 'Schattenfürst', hp: 2600, speed: 0.45, reward: 600, dmg: 100, size: 0.9, armor: 0.3, boss: true, summon: true, desc: 'Endboss von Welt 1. Ruft unterwegs Läufer herbei.' },
};

// ---------- Level (Welt 1: Aschewald) ----------
// Pfade als Wegpunkte in Feldern; der letzte Punkt ist der Kern.
export const LEVELS = [
  { name: 'Waldrand', waves: 10, hp: 1.0, foes: ['laeufer', 'flitzer'], tip: 'Bau nah an die Kurven – dort sind Gegner am längsten in Reichweite.',
    paths: [[[-1, 3], [6, 3], [6, 9], [13, 9], [13, 4], [18, 4]]] },
  { name: 'Krähenpass', waves: 12, hp: 1.3, foes: ['laeufer', 'flitzer', 'schwarm'], tip: 'Schwärmer kommen in Massen: Fläche und Kette lohnen sich.',
    paths: [[[-1, 9], [4, 9], [4, 2], [10, 2], [10, 9], [15, 9], [15, 5], [18, 5]]] },
  { name: 'Nebelfurt', waves: 14, hp: 1.7, foes: ['laeufer', 'flitzer', 'schwarm', 'flieger'], tip: 'Ab hier fliegen Aschekrähen. Mörser und Flammer treffen sie nicht!',
    paths: [[[20, 1], [15, 1], [15, 5], [3, 5], [3, 10], [17, 10]]] },
  { name: 'Schlackengrube', waves: 16, hp: 2.0, foes: ['laeufer', 'flitzer', 'schwarm', 'flieger', 'panzer'], tip: 'Panzerkäfer halbieren Schaden. Railgun und Laser ignorieren Panzer.',
    paths: [[[-1, 1], [17, 1], [17, 10], [2, 10], [2, 4], [13, 4], [13, 7], [7, 7]]] },
  { name: 'Zwillingsbrücke', waves: 18, hp: 2.5, foes: ['laeufer', 'flitzer', 'schwarm', 'flieger', 'panzer', 'heiler'], tip: 'Zwei Eingänge! Schamanen heilen – Fokus auf sie.',
    paths: [[[-1, 2], [8, 2], [8, 6], [18, 6]], [[-1, 10], [8, 10], [8, 6], [18, 6]]] },
  { name: 'Glutkessel', waves: 20, hp: 3.1, foes: ['laeufer', 'flitzer', 'schwarm', 'flieger', 'panzer', 'heiler', 'brut'], tip: 'Brutmütter platzen in Schwärmer. Fläche hinter die Haupt-Türme.',
    paths: [[[3, -1], [3, 9], [7, 9], [7, 2], [11, 2], [11, 9], [15, 9], [15, 2], [18, 2]]] },
  { name: 'Aschekreuz', waves: 22, hp: 3.8, foes: ['laeufer', 'flitzer', 'schwarm', 'flieger', 'panzer', 'heiler', 'brut'], tip: 'Die Pfade kreuzen sich – dort stehen Türme doppelt gut.',
    paths: [[[-1, 3], [6, 3], [6, 8], [12, 8], [12, 3], [18, 3]], [[10, 12], [10, 10], [16, 10], [16, 3], [18, 3]]] },
  { name: 'Schattentor', waves: 25, hp: 4.6, foes: ['laeufer', 'flitzer', 'schwarm', 'flieger', 'panzer', 'heiler', 'brut'], final: 'fuerst', tip: 'Der Schattenfürst wartet in Welle 25. Spar dir Geld für Legendäre.',
    paths: [[[-1, 1], [16, 1], [16, 4], [3, 4], [3, 7], [16, 7], [16, 10], [2, 10]]] },
];
export const ENDLESS = { name: 'Ewige Wacht', waves: Infinity, hp: 4.6, foes: ['laeufer', 'flitzer', 'schwarm', 'flieger', 'panzer', 'heiler', 'brut'], endless: true, tip: 'So weit du kommst. Zählt für die Bestenliste.',
  paths: [[[-1, 5], [4, 5], [4, 1], [9, 1], [9, 10], [14, 10], [14, 5], [18, 5]]] };
export const levelDef = i => (i === 'endless' ? ENDLESS : LEVELS[i]);

// ---------- Werkstatt (Gems, dauerhaft) ----------
export const UPGRADES = [
  { id: 'kapital', name: 'Startkapital', icon: 'coin', per: 60, max: 10, wsBase: 30, wsGrowth: 1.35 },
  { id: 'kern', name: 'Kernpanzer', icon: 'heart', per: 10, max: 10, wsBase: 30, wsGrowth: 1.35 },
  { id: 'kaliber', name: 'Kaliber', icon: 'sword', per: 0.04, max: 10, wsBase: 40, wsGrowth: 1.4 },
  { id: 'platz4', name: 'Loadout-Platz 4', icon: 'plus', per: 1, max: 1, unlock: 200 },
  { id: 'kopfgeld', name: 'Kopfgeld', icon: 'chest', per: 0.06, max: 10, wsBase: 45, wsGrowth: 1.4, req: ['kapital', 2] },
  { id: 'ingenieur', name: 'Ingenieure', icon: 'anvil', per: 0.03, max: 5, wsBase: 70, wsGrowth: 1.5, req: ['kapital', 3] },
  { id: 'optik', name: 'Zieloptik', icon: 'eye', per: 0.03, max: 5, wsBase: 80, wsGrowth: 1.5, req: ['kaliber', 2] },
  { id: 'platz5', name: 'Loadout-Platz 5', icon: 'plus', per: 1, max: 1, unlock: 700, req: ['platz4', 1] },
  { id: 'kasse', name: 'Kriegskasse', icon: 'trophy', per: 0.15, max: 5, wsBase: 90, wsGrowth: 1.5, req: ['kopfgeld', 2] },
  { id: 'recycling', name: 'Recycling', icon: 'up', per: 0.05, max: 4, wsBase: 80, wsGrowth: 1.6, req: ['ingenieur', 1] },
  { id: 'gemfund', name: 'Gemfund', icon: 'gem', per: 0.1, max: 10, wsBase: 60, wsGrowth: 1.4, req: ['kopfgeld', 3] },
  { id: 'notschild', name: 'Notschild', icon: 'shield', per: 1, max: 1, unlock: 500, req: ['kern', 4] },
];
export const U = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

export const BOOSTERS = {
  starter: { name: 'Start-Geschenk', cost: 0, odds: { rare: 100 }, hidden: true },
  basic: { name: 'Turm-Booster', cost: 80, foil: 0.04, odds: { common: 62, rare: 28, epic: 8.5, legendary: 1.5 } },
  elite: { name: 'Elite-Booster', cost: 250, foil: 0.08, odds: { rare: 55, epic: 36, legendary: 9 } },
};
export const STAR_COPIES = [0, 1, 2, 4, 8, 15]; // Kopien für ★1 … ★5
export const MAX_STAR = 5;
export const MODES = { first: 'Erster', last: 'Letzter', strong: 'Stärkster', close: 'Nächster' };

// ---------- Hilfen ----------
export function fmt(n) {
  n = Math.floor(n);
  if (Math.abs(n) < 10000) return n.toLocaleString('de-DE');
  const units = ['K', 'M', 'B', 'T'];
  let u = -1, v = n;
  while (Math.abs(v) >= 1000 && u < units.length - 1) { v /= 1000; u++; }
  return (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)).replace('.', ',') + units[u];
}
export function fmtNum(v, d = 1) { return (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('de-DE'); }
function seeded(s) { s = (s >>> 0) || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// Pfad aus Wegpunkten: Segmente, Länge, belegte Felder
export function buildPath(pts) {
  const P = pts.map(([c, r]) => ({ x: c + 0.5, z: r + 0.5 }));
  const segs = []; let len = 0;
  for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], l = Math.hypot(b.x - a.x, b.z - a.z); segs.push({ a, b, l, d0: len }); len += l; }
  const cells = new Set();
  for (let i = 0; i < pts.length - 1; i++) {
    const [c0, r0] = pts[i], [c1, r1] = pts[i + 1];
    const n = Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0));
    for (let k = 0; k <= n; k++) { const c = Math.round(c0 + (c1 - c0) * k / n), r = Math.round(r0 + (r1 - r0) * k / n); if (c >= 0 && r >= 0 && c < COLS && r < ROWS) cells.add(r * COLS + c); }
  }
  const at = d => {
    d = Math.max(0, Math.min(len, d));
    let s = segs[segs.length - 1];
    for (const g of segs) if (d <= g.d0 + g.l) { s = g; break; }
    const k = s.l ? (d - s.d0) / s.l : 0;
    return { x: s.a.x + (s.b.x - s.a.x) * k, z: s.a.z + (s.b.z - s.a.z) * k, dx: (s.b.x - s.a.x) / (s.l || 1), dz: (s.b.z - s.a.z) / (s.l || 1) };
  };
  return { pts, P, segs, len, cells, at, core: pts[pts.length - 1] };
}

// Wellen-Zusammenstellung (deterministisch)
export function waveHp(L, w) {
  let m = L.hp * (1 + 0.15 * (w - 1) + 0.011 * (w - 1) ** 2);
  if (L.endless && w > 25) m *= Math.pow(1.075, w - 25);
  return m;
}
export function waveGroups(L, w, li = 0) {
  const r = seeded(9001 + w * 131 + (L.endless ? 77 : li * 17));
  const has = id => L.foes.includes(id);
  const G = [];
  const add = (type, n, gap) => { if (n > 0) G.push({ type, n: Math.round(n), gap }); };
  const final = !L.endless && w === L.waves;
  add('laeufer', 4 + w * 1.15, 0.75);
  if (has('flitzer') && w >= 3) add('flitzer', w * 0.55, 0.45);
  if (has('schwarm') && w >= 2 && w % 3 !== 1) add('schwarm', 6 + w * 0.7, 0.18);
  if (has('flieger') && w >= 2 && w % 2 === 0) add('flieger', 2 + w * 0.35, 0.8);
  if (has('panzer') && w >= 3) add('panzer', (w - 1) * 0.4, 1.3);
  if (has('heiler') && w >= 4) add('heiler', w / 6, 2.2);
  if (has('brut') && w >= 4) add('brut', (w - 2) / 5, 2.4);
  for (let i = G.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [G[i], G[j]] = [G[j], G[i]]; }
  if (final && L.final) G.push({ type: L.final, n: 1, gap: 1, boss: true });
  else if (w % 10 === 0 || final) G.push({ type: 'koloss', n: w >= 30 ? 2 : 1, gap: 3, boss: true });
  if (L.endless && w % 25 === 0) G.push({ type: 'fuerst', n: 1, gap: 1, boss: true });
  return G;
}

function defaultMeta() {
  return {
    v: 2,
    gems: 0, totalGems: 0,
    ws: Object.fromEntries(UPGRADES.map(u => [u.id, 0])),
    towers: { repetierer: { copies: 1, foil: false } },
    loadout: ['repetierer', null, null, null, null],
    levels: {},          // i -> { stars, clears, best }
    best: 0,             // Endlos-Rekord (Bestenliste)
    runs: 0, wins: 0, kills: 0, bossKills: 0, packs: 0, built: 0, playTime: 0,
    speed: 1,
    lastLevel: 0,
    flags: { intro: false, gift: false },
    settings: { sfxVol: 0.5, musicVol: 0.4, musicTrack: 'mix', gfx: 'auto', shake: 'on', numbers: 'on', boosterAnim: 'show', ranges: 'on' },
  };
}
function mergeMeta(m) {
  const d = defaultMeta();
  if (!m || m.v !== 2) return d;
  return { ...d, ...m, ws: { ...d.ws, ...(m.ws || {}) }, towers: m.towers || d.towers, loadout: [...(m.loadout || d.loadout), null, null, null, null, null].slice(0, 5),
    levels: m.levels || {}, flags: { ...d.flags, ...(m.flags || {}) }, settings: { ...d.settings, ...(m.settings || {}) } };
}

// =====================================================================
export function createGame({ storage = (typeof localStorage !== 'undefined' ? localStorage : null), rng = Math.random } = {}) {
  const listeners = {};
  const on = (type, fn) => { (listeners[type] ||= new Set()).add(fn); return () => listeners[type].delete(fn); };
  const emit = (type, d) => { listeners[type]?.forEach(f => f(d)); };

  let meta = defaultMeta();
  let hadSave = false;
  let slotKey = SAVE_KEY;
  try { const raw = storage?.getItem(SAVE_KEY); if (raw) { meta = mergeMeta(JSON.parse(raw)); hadSave = true; } } catch (e) { /* kein Speicher */ }
  const save = () => { try { storage?.setItem(slotKey, JSON.stringify(meta)); } catch (e) { /* egal */ } };

  let uid = 1;
  const game = {
    t: 0, meta, run: null, towers: [], enemies: [], projectiles: [], fx: [],
    on, emit, save, hadSave,
  };

  // ----- Werkstatt -----
  const wsL = id => meta.ws[id] || 0;
  const wsP = id => wsL(id) * (U[id]?.per || 0);
  game.wsLevel = wsL;
  game.wsPassive = wsP;
  game.wsMax = id => U[id].max;
  game.wsMaxed = id => wsL(id) >= U[id].max;
  game.wsReqMet = id => { const r = U[id].req; return !r || wsL(r[0]) >= r[1]; };
  game.wsCost = id => { const u = U[id], L = wsL(id); if (u.unlock) return u.unlock; return Math.round(u.wsBase * Math.pow(u.wsGrowth, L)); };
  game.wsEffectText = (id, L = wsL(id)) => {
    const u = U[id], v = L * u.per, pc = x => `${Math.round(x * 100)} %`;
    switch (id) {
      case 'kapital': return `Start mit ${fmt(400 + v)} Münzen`;
      case 'kern': return `Kern hat ${100 + v} Leben`;
      case 'kaliber': return L ? `+${pc(v)} Schaden aller Türme` : 'Mehr Schaden für alle Türme';
      case 'optik': return L ? `+${pc(v)} Reichweite aller Türme` : 'Mehr Reichweite für alle Türme';
      case 'kopfgeld': return L ? `+${pc(v)} Münzen pro Gegner` : 'Mehr Münzen pro besiegtem Gegner';
      case 'ingenieur': return L ? `Bauen & Ausbauen ${pc(v)} günstiger` : 'Türme günstiger bauen und ausbauen';
      case 'kasse': return L ? `+${pc(v)} Wellenbonus` : 'Mehr Münzen zu jeder Welle';
      case 'recycling': return `Verkaufen bringt ${pc(0.6 + v)} zurück`;
      case 'gemfund': return L ? `+${pc(v)} Gems` : 'Mehr Gems pro Welle und Level';
      case 'platz4': return L ? '4. Loadout-Platz frei' : 'Ein vierter Turm im Loadout';
      case 'platz5': return L ? '5. Loadout-Platz frei' : 'Ein fünfter Turm im Loadout';
      case 'notschild': return L ? 'Rettet den Kern 1× pro Run (30 % Leben)' : 'Kern überlebt einmal pro Run den Fall';
    }
    return '';
  };
  game.buyWs = id => {
    if (game.run || game.wsMaxed(id) || !game.wsReqMet(id)) return false;
    const c = game.wsCost(id);
    if (meta.gems < c) return false;
    meta.gems -= c; meta.ws[id] = wsL(id) + 1;
    save(); emit('ws', id); emit('gems');
    return true;
  };
  const dmgMult = () => 1 + wsP('kaliber');
  const rangeMult = () => 1 + wsP('optik');
  const costMult = () => 1 - wsP('ingenieur');
  const sellRate = () => 0.6 + wsP('recycling');
  const startCash = () => 400 + wsP('kapital');
  const lvlCash = () => Math.pow(game.run?.L.hp || 1, 0.75);
  const coreMax = () => 100 + wsP('kern');
  const gemMult = () => 1 + wsP('gemfund');
  game.loadoutSize = () => 3 + wsL('platz4') + wsL('platz5');

  // ----- Sammlung / Sterne -----
  const starOf = id => { const c = meta.towers[id]?.copies || 0; let s = 0; for (let i = 1; i <= MAX_STAR; i++) if (c >= STAR_COPIES[i]) s = i; return s; };
  game.starOf = starOf;
  game.nextStarAt = id => { const s = starOf(id); return s >= MAX_STAR ? null : STAR_COPIES[s + 1]; };
  const starMult = id => 1 + 0.1 * (Math.max(1, starOf(id)) - 1) + (meta.towers[id]?.foil ? 0.1 : 0);
  game.owned = id => !!meta.towers[id];

  // Werte eines Turms auf Stufe lv (0-basiert) inkl. Sterne & Werkstatt
  game.towerStats = (id, lv = 0, buff = null) => {
    const d = T[id], s = { ...d.lv[lv] }, m = dmgMult() * starMult(id) * (1 + (buff?.dmg || 0));
    if (s.dmg) s.dmg *= m;
    if (s.dps) s.dps *= m;
    if (s.burn) s.burn *= m;
    if (s.income) s.income = Math.round(s.income * starMult(id));
    if (s.bDmg) { const k = starMult(id); s.bDmg *= k; s.bRate *= k; }
    if (s.rate) s.rate *= 1 + (buff?.rate || 0);
    if (s.range) s.range *= rangeMult() * (1 + (buff?.range || 0));
    return s;
  };
  game.towerCost = (id, lv = 0) => Math.round(T[id].lv[lv].cost * costMult() / 5) * 5;
  game.dps = (id, lv = 0) => {
    const s = game.towerStats(id, lv), d = T[id];
    switch (d.kind) {
      case 'flame': case 'laser': return s.dps;
      case 'missile': return s.dmg * s.n * s.rate;
      case 'tesla': return s.dmg * s.rate * (1 + 0.85 * (s.chain - 1) * 0.6);
      case 'flak': return s.dmg * s.rate * (s.shots || 1);
      case 'farm': case 'support': return 0;
      default: return (s.dmg || 0) * (s.rate || 0);
    }
  };

  game.setLoadout = (slot, id) => {
    if (game.run || slot >= game.loadoutSize()) return false;
    if (id && !meta.towers[id]) return false;
    const other = meta.loadout.indexOf(id);
    if (id && other >= 0 && other !== slot) meta.loadout[other] = meta.loadout[slot];
    meta.loadout[slot] = id;
    save(); emit('loadout');
    return true;
  };
  game.toggleLoadout = id => {
    if (game.run || !meta.towers[id]) return false;
    const i = meta.loadout.indexOf(id);
    if (i >= 0) { if (meta.loadout.filter(Boolean).length <= 1) return false; meta.loadout[i] = null; }
    else { const free = meta.loadout.findIndex((x, k) => !x && k < game.loadoutSize()); if (free < 0) return false; meta.loadout[free] = id; }
    save(); emit('loadout');
    return true;
  };

  // ----- Booster -----
  function pickRarity(odds) {
    const total = Object.values(odds).reduce((a, b) => a + b, 0);
    let x = rng() * total;
    for (const k of Object.keys(odds)) { x -= odds[k]; if (x <= 0) return k; }
    return 'common';
  }
  game.openBooster = kind => {
    const b = BOOSTERS[kind];
    if (!b || meta.gems < b.cost || game.run) return null;
    if (kind === 'starter' && meta.flags.gift) return null;
    meta.gems -= b.cost; meta.packs++;
    if (kind === 'starter') meta.flags.gift = true;
    const rar = pickRarity(b.odds);
    let pool = TOWERS.filter(t => t.rarity === rar);
    if (kind === 'starter') pool = pool.filter(t => t.id !== 'flak');
    const def = pool[Math.floor(rng() * pool.length)];
    const foil = !!b.foil && rng() < b.foil;
    const owned = meta.towers[def.id];
    const res = { id: def.id, def, rarity: rar, foil, isNew: !owned, starFrom: owned ? starOf(def.id) : 0, starTo: 1, refund: 0, becameFoil: false };
    if (!owned) {
      meta.towers[def.id] = { copies: 1, foil };
      const free = meta.loadout.findIndex((x, k) => !x && k < game.loadoutSize());
      if (free >= 0) { meta.loadout[free] = def.id; res.placed = true; }
    } else {
      if (starOf(def.id) >= MAX_STAR) { res.refund = 20; meta.gems += 20; }
      else owned.copies++;
      if (foil && !owned.foil) { owned.foil = true; res.becameFoil = true; }
    }
    res.starTo = starOf(def.id);
    res.copies = meta.towers[def.id].copies;
    save(); emit('booster', [res]); emit('gems');
    return [res];
  };

  game.addTestGems = n => { meta.gems += n; save(); emit('gems'); };
  game.grantGems = n => { meta.gems += Math.max(0, Math.floor(n)); save(); emit('gems'); };
  game.setFlag = (k, v) => { meta.flags[k] = v; save(); };
  game.setSetting = (k, v) => { meta.settings[k] = v; save(); emit('settings', k); };
  game.setSpeed = s => { meta.speed = s; save(); emit('speed'); };
  game.exportSave = () => JSON.stringify({ game: 'packfall', v: 2, at: new Date().toISOString(), meta });
  const replaceMeta = (m, keepSettings) => {
    const keep = { ...meta.settings };
    Object.keys(meta).forEach(k => delete meta[k]);
    Object.assign(meta, m);
    if (keepSettings) meta.settings = { ...meta.settings, ...keep };
    clearRun(); save(); emit('reset');
  };
  game.importSave = str => {
    try {
      const o = JSON.parse(str);
      const m = o && o.game === 'packfall' ? o.meta : o;
      if (!m || m.v !== 2 || !m.towers) return false;
      replaceMeta(mergeMeta(m), true); return true;
    } catch (e) { return false; }
  };
  game.useSlot = (key, fresh = false) => {
    if (key === slotKey && !fresh) return;
    save(); slotKey = key;
    let m = null;
    if (!fresh) { try { const raw = storage?.getItem(key); m = raw ? JSON.parse(raw) : null; } catch (e) { m = null; } }
    replaceMeta(mergeMeta(m), true);
  };
  game.slot = () => slotKey;
  game.loadMeta = (m, keepSettings = true) => { if (!m || m.v !== 2) return false; replaceMeta(mergeMeta(m), keepSettings); return true; };
  game.resetSave = () => replaceMeta(defaultMeta(), true);

  // ----- Level-Fortschritt -----
  game.levelInfo = i => meta.levels[i] || { stars: 0, clears: 0, best: 0 };
  game.levelUnlocked = i => i === 'endless' ? (meta.levels[LEVELS.length - 1]?.clears || 0) > 0 : i === 0 || (meta.levels[i - 1]?.clears || 0) > 0;
  game.totalStars = () => LEVELS.reduce((a, _, i) => a + (meta.levels[i]?.stars || 0), 0);
  game.levelsCleared = () => LEVELS.filter((_, i) => meta.levels[i]?.clears).length;

  // =====================================================================
  // RUN
  // =====================================================================
  function clearRun() { game.run = null; game.towers = []; game.enemies = []; game.projectiles = []; game.fx = []; }

  game.startLevel = li => {
    if (game.run || !game.levelUnlocked(li)) return false;
    const L = levelDef(li);
    const paths = L.paths.map(buildPath);
    const grid = new Uint8Array(COLS * ROWS);
    for (const p of paths) for (const c of p.cells) grid[c] = 1;
    const [cc, cr] = paths[0].core;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const c = cc + dc, r = cr + dr; if (c >= 0 && r >= 0 && c < COLS && r < ROWS && !grid[r * COLS + c]) grid[r * COLS + c] = 2; }
    clearRun();
    game.run = {
      li, L, paths, grid, wave: 0, waves: L.waves, phase: 'prep',
      cash: startCash() + (li === 'endless' ? 1000 : li * 120), coreHp: coreMax(), coreMax: coreMax(), core: { x: cc + 0.5, z: cr + 0.5 },
      queue: [], spawnT: 0, nextT: 0, gems: 0, kills: 0, time: 0, built: {}, shield: wsL('notschild') > 0, earned: 0, leaked: 0, pathTurn: 0, bossAlive: 0,
    };
    meta.lastLevel = li;
    emit('runStart', game.run);
    return true;
  };

  const cellOf = (c, r) => (c >= 0 && r >= 0 && c < COLS && r < ROWS ? r * COLS + c : -1);
  game.cellFree = (c, r) => { const r0 = game.run; const i = cellOf(c, r); return !!r0 && i >= 0 && r0.grid[i] === 0; };
  game.towerAt = (c, r) => game.towers.find(t => t.c === c && t.r === r) || null;
  game.placeCheck = (id, c, r) => {
    const R = game.run;
    if (!R) return 'run';
    if (!meta.loadout.includes(id)) return 'loadout';
    if (!game.cellFree(c, r)) return 'cell';
    if ((R.built[id] || 0) >= T[id].limit) return 'limit';
    if (R.cash < game.towerCost(id, 0)) return 'cash';
    return '';
  };
  game.place = (id, c, r) => {
    const why = game.placeCheck(id, c, r);
    if (why) return { ok: false, why };
    const R = game.run, cost = game.towerCost(id, 0);
    R.cash -= cost;
    R.grid[cellOf(c, r)] = 3;
    R.built[id] = (R.built[id] || 0) + 1;
    const t = { uid: uid++, id, def: T[id], lv: 0, c, r, x: c + 0.5, z: r + 0.5, cd: 0.2, aim: Math.atan2(R.core.x - (c + 0.5), R.core.z - (r + 0.5)), mode: 'first', target: null, heat: 0, spent: cost, dmgDone: 0, kills: 0, buff: null, fireT: 0, flaming: 0, recoil: 0, shot: 0, built: game.t };
    game.towers.push(t);
    meta.built++;
    recalcBuffs();
    emit('place', t);
    return { ok: true, t };
  };
  game.upgradeCost = t => (t.lv + 1 < MAX_LV ? game.towerCost(t.id, t.lv + 1) : null);
  game.upgrade = t => {
    const R = game.run;
    const c = game.upgradeCost(t);
    if (!R || c == null || R.cash < c) return false;
    R.cash -= c; t.spent += c; t.lv++;
    recalcBuffs();
    emit('upgrade', t);
    return true;
  };
  game.sellValue = t => Math.floor(t.spent * sellRate());
  game.sell = t => {
    const R = game.run;
    if (!R) return false;
    const i = game.towers.indexOf(t); if (i < 0) return false;
    R.cash += game.sellValue(t);
    R.grid[cellOf(t.c, t.r)] = 0;
    R.built[t.id]--;
    game.towers.splice(i, 1);
    recalcBuffs();
    emit('sell', t);
    return true;
  };
  game.setMode = (t, m) => { if (MODES[m]) { t.mode = m; t.target = null; emit('mode', t); } };
  game.stats = t => game.towerStats(t.id, t.lv, t.buff);

  function recalcBuffs() {
    for (const t of game.towers) t.buff = null;
    for (const s of game.towers) {
      if (s.def.kind !== 'support') continue;
      const st = game.towerStats(s.id, s.lv);
      for (const t of game.towers) {
        if (t === s || t.def.kind === 'support' || t.def.kind === 'farm') continue;
        if (Math.hypot(t.x - s.x, t.z - s.z) > st.range + 0.01) continue;
        const b = t.buff || (t.buff = { dmg: 0, rate: 0, range: 0, by: [] });
        b.dmg = Math.max(b.dmg, st.bDmg); b.rate = Math.max(b.rate, st.bRate); b.range = Math.max(b.range, st.bRange); b.by.push(s.uid);
      }
    }
  }

  // ----- Wellen -----
  game.canCall = () => { const R = game.run; return !!R && R.phase !== 'done' && R.queue.length === 0 && (R.waves === Infinity || R.wave < R.waves); };
  game.callBonus = () => { const R = game.run; return R && R.phase === 'wave' ? Math.round(Math.max(0, R.nextT) * 6 * (1 + R.wave * 0.05)) : 0; };
  game.callWave = () => {
    if (!game.canCall()) return false;
    const R = game.run;
    if (R.phase === 'wave') { const b = game.callBonus(); if (b > 0) { R.cash += b; emit('bonus', b); } }
    startWave();
    return true;
  };
  function startWave() {
    const R = game.run;
    if (R.wave > 0) {
      // Bonus für die überstandene Welle + Ertrag der Prägewerke
      const bonus = Math.round((60 + R.wave * 12) * lvlCash() * (1 + wsP('kasse')));
      R.cash += bonus;
      const g = Math.round((1 + Math.floor(R.wave / 4)) * gemMult());
      R.gems += g;
    }
    R.wave++;
    R.phase = 'wave'; R.timerOn = false;
    let inc = 0;
    for (const t of game.towers) if (t.def.kind === 'farm') { const n = game.towerStats(t.id, t.lv).income; inc += n; R.cash += n; emit('income', { t, n }); }
    R.queue = [];
    let delay = 0;
    for (const g of waveGroups(R.L, R.wave, R.li === 'endless' ? 0 : R.li)) {
      for (let i = 0; i < g.n; i++) { R.queue.push({ type: g.type, at: delay }); delay += g.gap; }
      delay += 1.2;
    }
    R.queue.sort((a, b) => a.at - b.at);
    R.spawnT = 0;
    R.nextT = 0;
    R.hpMult = waveHp(R.L, R.wave);
    const boss = R.queue.some(q => ENEMIES[q.type].boss);
    emit('waveStart', { wave: R.wave, waves: R.waves, boss, income: inc });
    if (boss) emit('boss', R.wave);
  }

  function spawn(type, d = 0, pi = null) {
    const R = game.run, E = ENEMIES[type];
    if (pi == null) { pi = R.pathTurn % R.paths.length; R.pathTurn++; }
    const hp = E.hp * R.hpMult * (E.boss ? 1 : 1);
    const e = { uid: uid++, type, E, hp, maxHp: hp, armor: E.armor || 0, speed: E.speed, d, pi, path: R.paths[pi], x: 0, z: 0, y: E.air ? 1.1 : 0,
      slow: 0, slowT: 0, frozenT: 0, stunT: 0, burn: 0, burnT: 0, melt: 0, meltT: 0, air: !!E.air, boss: !!E.boss, dead: false, hitT: 0, dmgAcc: 0, numT: 0,
      wob: rng() * 6.28, off: (rng() - 0.5) * 0.36, summonT: 3, dir: 0, born: game.t };
    const p = e.path.at(d); e.x = p.x; e.z = p.z; e.dir = Math.atan2(p.dx, p.dz);
    if (e.boss) R.bossAlive++;
    game.enemies.push(e);
    emit('spawn', e);
    return e;
  }

  function damage(e, amount, ap = 0, src = null) {
    if (e.dead || amount <= 0) return 0;
    const arm = Math.max(0, e.armor - ap - e.melt);
    const eff = amount * (1 - arm);
    e.hp -= eff; e.hitT = 0.12; e.dmgAcc += eff;
    if (src) src.dmgDone += eff;
    if (e.hp <= 0) kill(e, src);
    return eff;
  }
  function kill(e, src) {
    if (e.dead) return;
    e.dead = true;
    const R = game.run;
    const cash = Math.round(e.E.reward * (1 + (R.wave - 1) * 0.04) * lvlCash() * (1 + wsP('kopfgeld')));
    R.cash += cash; R.earned += cash; R.kills++; meta.kills++;
    if (src) src.kills++;
    if (e.boss) {
      R.bossAlive--; meta.bossKills++;
      const g = Math.round((e.type === 'fuerst' ? 40 : 10) * gemMult());
      R.gems += g; emit('gems', { n: g, why: 'boss' });
    }
    if (e.E.spawn) for (let i = 0; i < e.E.spawn; i++) { const c = spawn('schwarm', Math.max(0, e.d - i * 0.25), e.pi); c.hp = c.maxHp = c.maxHp * 0.8; }
    emit('kill', { e, cash });
  }

  function enemiesInRange(t, range, air) {
    const out = [];
    for (const e of game.enemies) { if (e.dead || (e.air && !air)) continue; const d = Math.hypot(e.x - t.x, e.z - t.z); if (d <= range) out.push([e, d]); }
    return out;
  }
  function pickTarget(t, range, air, minRange = 0) {
    let best = null, bv = -Infinity;
    for (const e of game.enemies) {
      if (e.dead || (e.air && !air)) continue;
      const d = Math.hypot(e.x - t.x, e.z - t.z);
      if (d > range || d < minRange) continue;
      const rem = e.path.len - e.d;
      const v = t.mode === 'last' ? -rem - (e.boss ? 0 : 0) : t.mode === 'strong' ? e.hp : t.mode === 'close' ? -d : (100000 - rem);
      if (v > bv) { bv = v; best = e; }
    }
    return best;
  }
  const aimAt = (t, e, dt, speed = 10) => {
    const want = Math.atan2(e.x - t.x, e.z - t.z);
    let dd = want - t.aim; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI;
    t.aim += dd * Math.min(1, dt * speed);
    return Math.abs(dd) < 0.5;
  };
  function splash(x, z, r, dmg, src, { air = false, burn = 0, stun = 0, ap = 0 } = {}) {
    for (const e of game.enemies) {
      if (e.dead || (e.air && !air)) continue;
      const d = Math.hypot(e.x - x, e.z - z);
      if (d > r) continue;
      damage(e, dmg * (1 - 0.35 * (d / r)), ap, src);
      if (burn) { e.burn = Math.max(e.burn, burn); e.burnT = 2; }
      if (stun && !e.boss) e.stunT = Math.max(e.stunT, stun);
      else if (stun) e.stunT = Math.max(e.stunT, stun * 0.25);
    }
  }

  function fire(t, s, dt) {
    const d = t.def, k = d.kind;
    if (k === 'farm' || k === 'support') return;
    if (k === 'flame') {
      const tg = pickTarget(t, s.range, false);
      t.target = tg;
      if (!tg) { t.flaming = Math.max(0, t.flaming - dt * 4); return; }
      aimAt(t, tg, dt, 8);
      t.flaming = Math.min(1, t.flaming + dt * 5);
      t.fireT -= dt;
      if (t.fireT <= 0) {
        t.fireT = 0.2;
        for (const [e, dist] of enemiesInRange(t, s.range, false)) {
          const a = Math.atan2(e.x - t.x, e.z - t.z);
          let da = a - t.aim; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
          if (Math.abs(da) > 0.5 && dist > 0.6) continue;
          damage(e, s.dps * 0.2, 0, t);
          e.burn = Math.max(e.burn, s.burn); e.burnT = 2;
          if (s.melt) { e.melt = s.melt; e.meltT = 2; }
        }
      }
      return;
    }
    if (k === 'laser') {
      let tg = t.target && !t.target.dead && Math.hypot(t.target.x - t.x, t.target.z - t.z) <= s.range ? t.target : null;
      if (!tg) { tg = pickTarget(t, s.range, true); t.heat = 0; }
      t.target = tg;
      if (!tg) { t.heat = Math.max(0, t.heat - dt * 2); return; }
      aimAt(t, tg, dt, 14);
      t.heat += dt;
      const mult = 1 + (s.ramp - 1) * Math.min(1, t.heat / s.rampT);
      damage(tg, s.dps * mult * dt, s.ap, t);
      return;
    }
    t.cd -= dt;
    const tg = pickTarget(t, s.range, d.air, s.minRange || 0);
    t.target = tg;
    if (!tg) return;
    const aligned = aimAt(t, tg, dt, k === 'howitzer' || k === 'shell' ? 5 : 12);
    if (t.cd > 0 || !aligned) return;
    t.cd = 1 / s.rate;
    t.recoil = 1; t.shot++;
    const muzzle = { x: t.x + Math.sin(t.aim) * 0.45, z: t.z + Math.cos(t.aim) * 0.45 };
    switch (k) {
      case 'bullet':
        game.projectiles.push({ kind: 'bullet', x: muzzle.x, z: muzzle.z, y: 0.75, tg, tx: tg.x, tz: tg.z, speed: 20, dmg: s.dmg, ap: s.ap || 0, src: t, life: 1.2 });
        emit('shot', { t, kind: 'bullet' }); break;
      case 'flak':
        for (let i = 0; i < (s.shots || 1); i++) game.projectiles.push({ kind: 'flak', x: muzzle.x + (i ? 0.12 : 0), z: muzzle.z, y: 0.9, tg, tx: tg.x, tz: tg.z, speed: 15, dmg: s.dmg, splash: s.splash, src: t, life: 1.5, delay: i * 0.08 });
        emit('shot', { t, kind: 'flak' }); break;
      case 'frost':
        game.projectiles.push({ kind: 'frost', x: muzzle.x, z: muzzle.z, y: 0.7, tg, tx: tg.x, tz: tg.z, speed: 11, dmg: s.dmg, splash: s.splash, slow: s.slow, slowT: s.slowT, freeze: (t.shot % 4 === 0) ? s.freeze || 0 : 0, src: t, life: 1.5 });
        emit('shot', { t, kind: 'frost' }); break;
      case 'shell': case 'howitzer': {
        const lead = tg.speed * (1 - tg.slow) * 0.8;
        const p = tg.path.at(tg.d + (tg.stunT > 0 || tg.frozenT > 0 ? 0 : lead));
        const dist = Math.hypot(p.x - t.x, p.z - t.z);
        game.projectiles.push({ kind: k, x0: muzzle.x, z0: muzzle.z, x: muzzle.x, z: muzzle.z, y: 0.9, tx: p.x, tz: p.z, t: 0, T: 0.7 + dist * 0.06, dmg: s.dmg, splash: s.splash, burn: s.burn || 0, stun: s.stun || 0, cluster: s.cluster || 0, src: t, h: 1.6 + dist * 0.35 });
        emit('shot', { t, kind: k }); break;
      }
      case 'missile': {
        const pool = enemiesInRange(t, s.range, true).map(([e]) => e).sort((a, b) => (a.path.len - a.d) - (b.path.len - b.d)).slice(0, s.n);
        for (let i = 0; i < s.n; i++) {
          const target = pool[i % Math.max(1, pool.length)] || tg;
          const a = t.aim + (i - (s.n - 1) / 2) * 0.5;
          game.projectiles.push({ kind: 'missile', x: t.x, z: t.z, y: 0.9, vx: Math.sin(a) * 2, vz: Math.cos(a) * 2, vy: 3.2, tg: target, tx: target.x, tz: target.z, speed: 2, dmg: s.dmg, splash: s.splash, src: t, life: 4, delay: i * 0.07 });
        }
        emit('shot', { t, kind: 'missile' }); break;
      }
      case 'tesla': {
        const pts = [{ x: t.x, z: t.z, y: 1.35 }];
        const hit = new Set();
        let cur = tg, dmg = s.dmg;
        for (let i = 0; i < s.chain && cur; i++) {
          hit.add(cur); pts.push({ x: cur.x, z: cur.z, y: cur.y + 0.4 });
          damage(cur, dmg, 0, t);
          if (s.stun && !cur.boss) cur.stunT = Math.max(cur.stunT, s.stun);
          dmg *= 0.85;
          let nb = null, nd = 1.9;
          for (const e of game.enemies) { if (e.dead || hit.has(e)) continue; const dd = Math.hypot(e.x - cur.x, e.z - cur.z); if (dd < nd) { nd = dd; nb = e; } }
          cur = nb;
        }
        game.fx.push({ kind: 'zap', pts, src: t.uid, life: 0.22, max: 0.22 });
        emit('zap', { t }); break;
      }
      case 'rail': {
        const dx = Math.sin(t.aim), dz = Math.cos(t.aim), L = s.range + 0.5;
        for (const e of game.enemies) {
          if (e.dead) continue;
          const px = e.x - t.x, pz = e.z - t.z, along = px * dx + pz * dz;
          if (along < 0 || along > L) continue;
          if (Math.abs(px * dz - pz * dx) < 0.38) damage(e, s.dmg, 1, t);
        }
        game.fx.push({ kind: 'rail', x0: muzzle.x, z0: muzzle.z, x1: t.x + dx * L, z1: t.z + dz * L, life: 0.35, max: 0.35, col: d.accent });
        emit('rail', { t }); break;
      }
    }
  }

  function stepProjectiles(dt) {
    const P = game.projectiles;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      if (p.delay > 0) { p.delay -= dt; continue; }
      if (p.kind === 'shell' || p.kind === 'howitzer') {
        p.t += dt; const k = Math.min(1, p.t / p.T);
        p.x = p.x0 + (p.tx - p.x0) * k; p.z = p.z0 + (p.tz - p.z0) * k; p.y = 0.9 + p.h * 4 * k * (1 - k) - 0.9 * k;
        if (k >= 1) {
          splash(p.tx, p.tz, p.splash, p.dmg, p.src, { burn: p.burn, stun: p.stun });
          game.fx.push({ kind: 'boom', x: p.tx, z: p.tz, r: p.splash, life: 0.5, max: 0.5, big: p.kind === 'howitzer' });
          emit('boom', { x: p.tx, z: p.tz, r: p.splash, big: p.kind === 'howitzer' });
          for (let c = 0; c < p.cluster; c++) {
            const a = c / p.cluster * 6.28 + rng(), rr = p.splash * 0.9;
            game.projectiles.push({ kind: 'shell', x0: p.tx, z0: p.tz, x: p.tx, z: p.tz, y: 0, tx: p.tx + Math.sin(a) * rr, tz: p.tz + Math.cos(a) * rr, t: 0, T: 0.35, dmg: p.dmg * 0.4, splash: p.splash * 0.6, burn: p.burn, stun: 0, cluster: 0, src: p.src, h: 0.8 });
          }
          P.splice(i, 1);
        }
        continue;
      }
      if (p.kind === 'missile') {
        p.life -= dt;
        if (p.tg && !p.tg.dead) { p.tx = p.tg.x; p.tz = p.tg.z; p.ty = p.tg.y + 0.25; } else p.ty = 0;
        p.speed = Math.min(9, p.speed + dt * 9);
        const dx = p.tx - p.x, dz = p.tz - p.z, dy = (p.ty || 0.2) - p.y, dist = Math.hypot(dx, dz, dy);
        const steer = Math.min(1, dt * 5);
        p.vx += (dx / dist * p.speed - p.vx) * steer; p.vz += (dz / dist * p.speed - p.vz) * steer; p.vy += (dy / dist * p.speed - p.vy) * steer;
        p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
        if (dist < 0.25 || p.life <= 0 || p.y < 0) {
          splash(p.x, p.z, p.splash, p.dmg, p.src, { air: true });
          game.fx.push({ kind: 'boom', x: p.x, z: p.z, y: Math.max(0, p.y), r: p.splash, life: 0.4, max: 0.4 });
          emit('boom', { x: p.x, z: p.z, r: p.splash });
          P.splice(i, 1);
        }
        continue;
      }
      // Kugeln, Flak, Frost: zielsuchend
      p.life -= dt;
      if (p.tg && !p.tg.dead) { p.tx = p.tg.x; p.tz = p.tg.z; p.ty = p.tg.y + 0.3; }
      const dx = p.tx - p.x, dz = p.tz - p.z, dy = (p.ty ?? 0.3) - p.y, dist = Math.hypot(dx, dz, dy), step = p.speed * dt;
      if (dist <= step || p.life <= 0) {
        if (p.kind === 'bullet') { if (p.tg && !p.tg.dead) damage(p.tg, p.dmg, p.ap, p.src); }
        else if (p.kind === 'flak') {
          for (const e of game.enemies) { if (e.dead) continue; const d = Math.hypot(e.x - p.tx, e.z - p.tz); if (d <= p.splash) damage(e, p.dmg * (e.air ? 3 : 1) * (1 - 0.3 * d / p.splash), 0, p.src); }
          game.fx.push({ kind: 'flak', x: p.tx, z: p.tz, y: p.ty ?? 0.3, r: p.splash, life: 0.3, max: 0.3 });
        } else if (p.kind === 'frost') {
          for (const e of game.enemies) {
            if (e.dead) continue; const d = Math.hypot(e.x - p.tx, e.z - p.tz); if (d > p.splash) continue;
            damage(e, p.dmg, 0, p.src);
            const sl = e.boss ? p.slow * 0.5 : p.slow;
            if (sl >= e.slow || e.slowT < 0.3) { e.slow = sl; e.slowT = p.slowT; }
            if (p.freeze && !e.boss) e.frozenT = Math.max(e.frozenT, p.freeze);
          }
          game.fx.push({ kind: 'frost', x: p.tx, z: p.tz, y: p.ty ?? 0.3, r: p.splash, life: 0.4, max: 0.4 });
        }
        P.splice(i, 1);
        continue;
      }
      p.x += dx / dist * step; p.z += dz / dist * step; p.y += dy / dist * step;
    }
  }

  function step(dt) {
    const R = game.run;
    R.time += dt; game.t += dt;
    // Spawnen
    if (R.phase === 'wave') {
      R.spawnT += dt;
      while (R.queue.length && R.queue[0].at <= R.spawnT) spawn(R.queue.shift().type);
      if (!R.queue.length) {
        const alive = game.enemies.length > 0;
        if (!alive && R.waves !== Infinity && R.wave >= R.waves) { victory(); return; }
        if (R.waves === Infinity || R.wave < R.waves) {
          if (R.nextT <= 0 && !R.timerOn) { R.nextT = 14; R.timerOn = true; }
          if (!alive) R.nextT = Math.min(R.nextT, 4);
          R.nextT -= dt;
          if (R.nextT <= 0) { R.timerOn = false; startWave(); }
        }
      } else R.timerOn = false;
    }
    // Gegner bewegen
    for (const e of game.enemies) {
      if (e.dead) continue;
      if (e.hitT > 0) e.hitT -= dt;
      if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slow = 0; }
      if (e.meltT > 0) { e.meltT -= dt; if (e.meltT <= 0) e.melt = 0; }
      if (e.burnT > 0) { e.burnT -= dt; damage(e, e.burn * dt, 0, null); if (e.dead) continue; }
      if (e.E.heal) for (const o of game.enemies) if (o !== e && !o.dead && o.hp < o.maxHp && Math.hypot(o.x - e.x, o.z - e.z) < 1.6) o.hp = Math.min(o.maxHp, o.hp + o.maxHp * e.E.heal * dt);
      if (e.E.summon) { e.summonT -= dt; if (e.summonT <= 0) { e.summonT = 4; for (let i = 0; i < 3; i++) spawn('laeufer', Math.max(0, e.d - 0.4 - i * 0.3), e.pi); } }
      let sp = e.speed * (1 - e.slow);
      if (e.stunT > 0) { e.stunT -= dt; sp = 0; }
      if (e.frozenT > 0) { e.frozenT -= dt; sp = 0; }
      e.d += sp * dt;
      const p = e.path.at(e.d);
      e.x = p.x + p.dz * e.off; e.z = p.z - p.dx * e.off;
      const want = Math.atan2(p.dx, p.dz);
      let dd = want - e.dir; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI;
      e.dir += dd * Math.min(1, dt * 8);
      if (e.d >= e.path.len) {
        e.dead = true; e.leaked = true;
        if (e.boss) R.bossAlive--;
        R.coreHp -= e.E.dmg; R.leaked++;
        emit('coreHit', { e, dmg: e.E.dmg });
        if (R.coreHp <= 0) {
          if (R.shield) { R.shield = false; R.coreHp = R.coreMax * 0.3; emit('shield'); }
          else { R.coreHp = 0; defeat(); return; }
        }
      }
    }
    // Türme
    for (const t of game.towers) {
      if (t.recoil > 0) t.recoil = Math.max(0, t.recoil - dt * 6);
      fire(t, game.towerStats(t.id, t.lv, t.buff), dt);
    }
    stepProjectiles(dt);
    for (const f of game.fx) f.life -= dt;
    game.fx = game.fx.filter(f => f.life > 0);
    if (game.enemies.some(e => e.dead)) game.enemies = game.enemies.filter(e => !e.dead);
  }

  function finish(result) {
    const R = game.run;
    if (!R || R.phase === 'done') return;
    R.phase = 'done';
    const L = R.L;
    let stars = 0, newStars = 0, firstClear = false, record = false;
    if (result === 'win') {
      const hpK = R.coreHp / R.coreMax;
      stars = hpK >= 0.999 && R.leaked === 0 ? 3 : hpK >= 0.5 ? 2 : 1;
      const info = meta.levels[R.li] || (meta.levels[R.li] = { stars: 0, clears: 0, best: 0 });
      firstClear = !info.clears;
      newStars = Math.max(0, stars - info.stars);
      info.stars = Math.max(info.stars, stars); info.clears++; info.best = R.waves;
      const bonus = firstClear ? 25 + 15 * R.li : 8 + 2 * R.li;
      R.gems += Math.round((bonus + newStars * 10 + (1 + Math.floor(R.wave / 4))) * gemMult());
      meta.wins++;
    } else if (R.li !== 'endless') {
      const info = meta.levels[R.li] || (meta.levels[R.li] = { stars: 0, clears: 0, best: 0 });
      info.best = Math.max(info.best, R.wave - 1);
    }
    if (L.endless) { const w = Math.max(0, R.wave - (result === 'win' ? 0 : 1)); if (w > meta.best) { meta.best = w; record = true; } }
    meta.gems += R.gems; meta.totalGems += R.gems;
    meta.runs++; meta.playTime += R.time;
    save();
    const summary = { result, li: R.li, name: L.name, wave: R.wave, waves: R.waves, stars, newStars, firstClear, record, gems: R.gems, kills: R.kills, time: R.time, coreHp: R.coreHp, coreMax: R.coreMax, earned: R.earned };
    emit('runEnd', summary);
    emit('gems');
  }
  function victory() { finish('win'); }
  function defeat() { finish('lose'); }
  game.endRun = (reason = 'abandon') => { if (game.run && game.run.phase !== 'done') finish(reason === 'abandon' ? 'abandon' : reason); };
  game.leaveRun = () => { clearRun(); emit('leave'); };

  game.update = dt => {
    const R = game.run;
    if (!R) { game.t += dt; return; }
    if (R.phase === 'done') { game.t += dt; for (const f of game.fx) f.life -= dt; return; }
    const total = dt * (game.paused ? 0 : (meta.speed || 1));
    const n = Math.max(1, Math.ceil(total / (1 / 45)));
    for (let i = 0; i < n && game.run && game.run.phase !== 'done'; i++) step(total / n);
  };
  game.setPaused = p => { game.paused = !!p; emit('pause', game.paused); };

  return game;
}
