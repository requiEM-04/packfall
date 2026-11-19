// Packfall – Spielkern: Tower Defense auf einem Raster (reine Logik, keine Darstellung)
// Welt 1 „Aschewald“: 8 Level + Endlos. Türme aus Boostern, Loadout, Ausbau im Run, Werkstatt dauerhaft.

export const SAVE_KEY = 'packfall.save.v2';
export const COLS = 20, ROWS = 12;

export const RARITIES = {
  common:    { name: 'Gewöhnlich', color: '#8f9093', rank: 0 },
  rare:      { name: 'Selten',     color: '#6a8aa6', rank: 1 },
  epic:      { name: 'Episch',     color: '#8f76a0', rank: 2 },
  legendary: { name: 'Legendär',   color: '#b39a5e', rank: 3 },
  mythic:    { name: 'Mythisch',   color: '#d23a40', rank: 4 },
};

// ---------- Türme ----------
// Werte je Ausbaustufe (L1–L5). Fehlende Werte werden von der Stufe davor übernommen.
// range = Felder, rate = Schüsse pro Sekunde, cost = Preis dieser Stufe (L1 = Bauen).
export const TOWERS = [
  { id: 'repetierer', perks: { 5: { ap: 0.25, name: 'Panzerbrechend' }, 10: { rate: 0.25, name: 'Dauerfeuer' } }, name: 'Repetierer', rarity: 'common', kind: 'bullet', air: true, accent: '#d9a45a', limit: 12,
    role: 'Einzelziel · schnell', desc: 'Kurbel-Gatling. Schnell, zuverlässig, holt auch Flieger runter.',
    lv: [{ cost: 150, dmg: 2, rate: 4, range: 3.2 }, { cost: 120, rate: 5.5, name: 'Schnelllader' }, { cost: 300, dmg: 3.5, rate: 6, range: 3.6, name: 'Lange Läufe' },
      { cost: 700, dmg: 6, rate: 7.5, range: 3.8, ap: 0.3, name: 'Zwillingslauf' }, { cost: 1800, dmg: 11, rate: 10, range: 4.2, ap: 0.5, name: 'Sturmkanone' }] },
  { id: 'moerser', perks: { 5: { splash: 0.2, name: 'Größere Ladung' }, 10: { dmg: 0.25, name: 'Schwere Granaten' } }, name: 'Mörser', rarity: 'common', kind: 'shell', air: false, accent: '#d0874e', limit: 12,
    role: 'Fläche · weit · nur Boden', desc: 'Schwere Granaten im hohen Bogen. Trifft Gruppen, aber keine Flieger.',
    lv: [{ cost: 250, dmg: 9, splash: 0.9, rate: 0.55, range: 5.5, minRange: 1.2 }, { cost: 200, dmg: 13, name: 'Größeres Kaliber' }, { cost: 450, dmg: 20, splash: 1.1, rate: 0.65, name: 'Doppelrohr' },
      { cost: 900, dmg: 34, rate: 0.7, burn: 4, name: 'Brandgranaten' }, { cost: 2200, dmg: 60, splash: 1.4, rate: 0.8, cluster: 3, name: 'Streubomben' }] },
  { id: 'praegewerk', perks: { 5: { income: 0.2, name: 'Feinere Prägung' }, 10: { income: 0.35, name: 'Goldader' } }, name: 'Prägewerk', rarity: 'common', kind: 'farm', air: false, accent: '#c9b26a', limit: 8,
    role: 'Wirtschaft', desc: 'Prägt zu jeder Welle Münzen. Früh gebaut, zahlt es sich mehrfach aus.',
    lv: [{ cost: 250, income: 50 }, { cost: 200, income: 100, name: 'Zweite Presse' }, { cost: 500, income: 220, name: 'Dampfantrieb' },
      { cost: 1100, income: 480, name: 'Goldschmelze' }, { cost: 2600, income: 1100, name: 'Münzfabrik' }] },
  { id: 'frostwerfer', perks: { 5: { slow: 0.08, name: 'Tiefkühlung' }, 10: { splash: 0.25, name: 'Eissturm' } }, name: 'Frostwerfer', rarity: 'rare', kind: 'frost', air: true, accent: '#9cc8d8', limit: 12,
    role: 'Verlangsamen · Fläche', desc: 'Schießt Kältekapseln, die Gegner in kleiner Fläche verlangsamen.',
    lv: [{ cost: 300, dmg: 1.5, rate: 1.2, range: 3.0, splash: 0.8, slow: 0.3, slowT: 2 }, { cost: 220, slow: 0.4, name: 'Kühlmittel' }, { cost: 450, dmg: 3, splash: 1.0, range: 3.4, name: 'Druckdüse' },
      { cost: 900, dmg: 6, slow: 0.5, freeze: 0.8, name: 'Schockfrost' }, { cost: 2000, dmg: 14, slow: 0.6, splash: 1.3, freeze: 1.2, name: 'Nullpunkt' }] },
  { id: 'flammer', perks: { 5: { burn: 0.5, name: 'Napalm' }, 10: { range: 0.15, name: 'Langer Atem' } }, name: 'Flammer', rarity: 'rare', kind: 'flame', air: false, accent: '#e0703e', limit: 12,
    role: 'Kegel · Brand · nur Boden', desc: 'Kurze Reichweite, aber alles im Flammenkegel brennt weiter.',
    lv: [{ cost: 350, dps: 10, range: 2.4, burn: 3 }, { cost: 250, dps: 15, name: 'Mehr Druck' }, { cost: 550, dps: 26, range: 2.7, name: 'Lange Düse' },
      { cost: 1100, dps: 45, burn: 8, melt: 0.2, name: 'Thermit' }, { cost: 2400, dps: 90, range: 3.0, burn: 18, name: 'Höllenschlund' }] },
  { id: 'tesla', perks: { 5: { chain: 1, name: 'Weitere Spule' }, 10: { chain: 2, name: 'Kettenblitz' } }, name: 'Tesla-Spule', rarity: 'rare', kind: 'tesla', air: true, accent: '#8fb6e8', limit: 12,
    role: 'Kette · mehrere Ziele', desc: 'Blitze springen von Gegner zu Gegner. Stark gegen Schwärme.',
    lv: [{ cost: 400, dmg: 7, rate: 0.9, range: 3.2, chain: 3 }, { cost: 300, dmg: 9, chain: 4, name: 'Zweite Spule' }, { cost: 650, dmg: 15, rate: 1.0, name: 'Kondensator' },
      { cost: 1300, dmg: 26, rate: 1.15, chain: 5, name: 'Hochspannung' }, { cost: 2800, dmg: 50, chain: 7, stun: 0.25, name: 'Gewitterturm' }] },
  { id: 'flak', perks: { 5: { rate: 0.15, name: 'Schnellladung' }, 10: { splash: 0.25, name: 'Sperrfeuer' } }, name: 'Flak', rarity: 'rare', kind: 'flak', air: true, accent: '#b8b08a', limit: 12,
    role: 'Luftabwehr · Fläche', desc: 'Sprenggeschosse mit Splitterwolke. Dreifacher Schaden gegen Flieger.',
    lv: [{ cost: 350, dmg: 6, rate: 1.4, range: 4.5, splash: 0.6 }, { cost: 250, dmg: 9, name: 'Zeitzünder' }, { cost: 550, dmg: 14, rate: 1.6, range: 5, name: 'Radar' },
      { cost: 1100, dmg: 24, splash: 0.8, name: 'Splitterhülle' }, { cost: 2400, dmg: 45, rate: 2, shots: 2, name: 'Vierling' }] },
  { id: 'railgun', perks: { 5: { rate: 0.15, name: 'Kühlsystem' }, 10: { dmg: 0.3, name: 'Überladung' } }, name: 'Railgun', rarity: 'epic', kind: 'rail', air: true, accent: '#7fd0d0', limit: 6,
    role: 'Durchschlag · ignoriert Panzer', desc: 'Magnetgeschoss durch alles in einer Linie. Panzer zählt nicht.',
    lv: [{ cost: 800, dmg: 70, rate: 0.33, range: 6.5 }, { cost: 500, dmg: 100, name: 'Stärkere Spulen' }, { cost: 1000, dmg: 160, rate: 0.38, range: 7, name: 'Langer Lauf' },
      { cost: 2000, dmg: 280, rate: 0.42, name: 'Überladung' }, { cost: 4200, dmg: 600, rate: 0.5, name: 'Sternenbrecher' }] },
  { id: 'raketenwerk', perks: { 5: { n: 1, name: 'Extra-Röhre' }, 10: { splash: 0.25, name: 'Brandsätze' } }, name: 'Raketenwerk', rarity: 'epic', kind: 'missile', air: true, accent: '#d88a6a', limit: 8,
    role: 'Zielsuchend · Fläche', desc: 'Salven zielsuchender Raketen. Trifft Boden und Luft.',
    lv: [{ cost: 900, dmg: 14, rate: 0.7, range: 5, splash: 0.8, n: 2 }, { cost: 600, n: 3, name: 'Dritte Röhre' }, { cost: 1200, dmg: 24, rate: 0.8, name: 'Hohlladung' },
      { cost: 2400, dmg: 40, n: 4, name: 'Schwarmsalve' }, { cost: 4800, dmg: 70, n: 6, splash: 1.1, name: 'Sternfeuer' }] },
  { id: 'verstaerker', perks: { 5: { bDmg: 0.05, name: 'Resonanz' }, 10: { range: 0.2, name: 'Weites Feld' } }, name: 'Verstärker', rarity: 'epic', kind: 'support', air: false, accent: '#a98fd8', limit: 4,
    role: 'Unterstützung', desc: 'Strahlt Energie ab: Türme in der Nähe schießen stärker und schneller.',
    lv: [{ cost: 700, range: 2.5, bDmg: 0.15, bRate: 0.1, bRange: 0 }, { cost: 500, bDmg: 0.2, bRate: 0.12, name: 'Resonator' }, { cost: 1000, range: 3, bDmg: 0.25, bRate: 0.15, bRange: 0.05, name: 'Fokuslinse' },
      { cost: 2000, bDmg: 0.35, bRate: 0.2, bRange: 0.08, name: 'Kraftfeld' }, { cost: 4000, bDmg: 0.5, bRate: 0.25, bRange: 0.12, name: 'Leitstern' }] },
  { id: 'laserlanze', perks: { 5: { ramp: 0.5, name: 'Fokuslinse' }, 10: { dmg: 0.25, name: 'Sonnenkern' } }, name: 'Laserlanze', rarity: 'legendary', kind: 'laser', air: true, accent: '#e05a6a', limit: 3,
    role: 'Dauerstrahl · heizt auf', desc: 'Ein Strahl, der heißer wird, je länger er auf einem Ziel bleibt (bis ×3).',
    lv: [{ cost: 1500, dps: 45, range: 4.5, ramp: 3, rampT: 2.5, ap: 0.5 }, { cost: 1000, dps: 70, name: 'Fokussierung' }, { cost: 2000, dps: 110, range: 5, name: 'Prisma' },
      { cost: 4000, dps: 190, name: 'Plasmakern' }, { cost: 8000, dps: 380, ramp: 4, name: 'Sonnenlanze' }] },
  { id: 'haubitze', perks: { 5: { stun: 0.3, name: 'Schockwelle' }, 10: { splash: 0.25, name: 'Erdbeben' } }, name: 'Titan-Haubitze', rarity: 'legendary', kind: 'howitzer', air: false, accent: '#c8a070', limit: 3,
    role: 'Riesige Fläche · betäubt', desc: 'Langsam, laut, gewaltig. Jeder Einschlag betäubt alles drumherum.',
    lv: [{ cost: 2000, dmg: 180, splash: 1.8, rate: 0.22, range: 8, stun: 0.5, minRange: 1.5 }, { cost: 1200, dmg: 260, name: 'Verstärktes Rohr' }, { cost: 2400, dmg: 400, rate: 0.25, name: 'Ladeautomatik' },
      { cost: 4800, dmg: 650, splash: 2.1, name: 'Bunkerbrecher' }, { cost: 9000, dmg: 1200, stun: 1.0, rate: 0.28, name: 'Weltenspalter' }] },
  { id: 'plasmareaktor', perks: { 5: { pierce: 1, name: 'Durchschlagkern' }, 10: { rate: 0.2, name: 'Blutrausch' } }, name: 'Blutmond-Reaktor', rarity: 'mythic', kind: 'plasma', air: true, accent: '#ff3b3b', limit: 2,
    role: 'Durchschlag · Explosion', desc: 'Ein instabiler Reaktor feuert rote Plasmakugeln, die durch mehrere Gegner schlagen und am Ende explodieren.',
    lv: [{ cost: 3000, dmg: 60, rate: 1.3, range: 5, splash: 1.0, pierce: 2 }, { cost: 2000, dmg: 90, pierce: 3, name: 'Überdruck' }, { cost: 4000, dmg: 140, rate: 1.5, name: 'Zwillingskern' },
      { cost: 8000, dmg: 240, pierce: 4, splash: 1.3, name: 'Kernschmelze' }, { cost: 15000, dmg: 480, rate: 1.9, pierce: 5, name: 'Blutmond' }] },
  { id: 'himmelsspeer', perks: { 5: { splash: 0.2, name: 'Breiter Strahl' }, 10: { rate: 0.25, name: 'Zweiter Satellit' } }, name: 'Himmelsspeer', rarity: 'mythic', kind: 'orbital', air: true, accent: '#ff4a3a', limit: 1,
    role: 'Orbitalschlag · ganze Map', desc: 'Ruft einen roten Strahl aus dem Himmel auf den stärksten Gegner der ganzen Map. Alles drumherum verglüht.',
    lv: [{ cost: 4000, dmg: 450, rate: 0.25, range: 99, splash: 2.0, stun: 0.6 }, { cost: 2500, dmg: 650, name: 'Zielsatellit' }, { cost: 5000, dmg: 1000, rate: 0.3, name: 'Zweites Auge' },
      { cost: 10000, dmg: 1700, splash: 2.4, name: 'Sonnenbrand' }, { cost: 20000, dmg: 3400, rate: 0.36, stun: 1.2, name: 'Götterspeer' }] },
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
  koloss: { name: 'Koloss', hp: 330, speed: 0.55, reward: 120, dmg: 50, size: 0.7, armor: 0.25, boss: true, desc: 'Boss in jeder 10. Welle und am Ende. Durchgelassen kostet er bis zu 50 Leben – je verletzter, desto weniger.' },
  fuerst: { name: 'Schattenfürst', hp: 2200, speed: 0.45, reward: 600, dmg: 150, size: 0.9, armor: 0.3, boss: true, summon: true, desc: 'Endboss von Welt 1. Ruft unterwegs Läufer herbei.' },
};

// ---------- Maps (Welt 1) & Schwierigkeitsgrade wie bei Bloons ----------
// Jede Map: eigener Aufbau, eigenes Thema, eigene Gegner. Hindernisse (blocks) sind die einzige Deko auf dem Brett.
export const THEMES = {
  wald:     { name: 'Wald',    tile: [44, 52, 46], path: ['#2a2723', '#6d665a', '#7a7264'], bg: '#0b0d10', side: '#25272a', deco: ['#2a3a2e', '#3a332c'] },
  fels:     { name: 'Fels',    tile: [52, 54, 58], path: ['#26262a', '#6a6660', '#78746c'], bg: '#0c0d10', side: '#2a2b2f', deco: ['#4a4c50', '#3a3c40'] },
  sumpf:    { name: 'Sumpf',   tile: [34, 48, 48], path: ['#24221c', '#6a6150', '#786e5a'], bg: '#0a0e10', side: '#222a2a', deco: ['#284038', '#33302a'] },
  schlacke: { name: 'Schlacke', tile: [42, 40, 40], path: ['#1e1a18', '#5e564e', '#6a6158'], bg: '#0e0b0a', side: '#28221f', deco: ['#3a3430', '#2a2420'], glow: '#e06a2a' },
  bruecke:  { name: 'Brücke',  tile: [54, 46, 38], path: ['#2a2018', '#7a6248', '#8a7054'], bg: '#0d0b0a', side: '#2c241e', deco: ['#4a3a2c', '#3a3a3a'] },
  glut:     { name: 'Glut',    tile: [54, 36, 32], path: ['#1e1414', '#5c4c46', '#6a5850'], bg: '#100909', side: '#2c1c1a', deco: ['#3a2622', '#2a1a18'], glow: '#ff6a2a' },
  asche:    { name: 'Asche',   tile: [68, 66, 62], path: ['#2a2826', '#8a857c', '#98928a'], bg: '#101012', side: '#2e2d2c', deco: ['#5a5650', '#4a4640'] },
  schatten: { name: 'Schatten', tile: [40, 34, 54], path: ['#1c1824', '#5e5670', '#6c6480'], bg: '#0b0910', side: '#221d2c', deco: ['#3a2f50', '#2a2438'], glow: '#9a6ad8' },
};
export const LEVELS = [
  { name: 'Waldrand', theme: 'wald', hp: 1.0, foes: ['laeufer', 'flitzer'], extra: ['schwarm', 'panzer'], tip: 'Bau nah an die Kurven – dort sind Gegner am längsten in Reichweite.',
    paths: [[[-1, 3], [6, 3], [6, 9], [13, 9], [13, 4], [18, 4]]], blocks: [[2, 7, 'tree'], [10, 1, 'tree'], [16, 10, 'rock'], [9, 6, 'tree']] },
  { name: 'Krähenpass', theme: 'fels', hp: 1.15, foes: ['laeufer', 'flieger', 'schwarm'], extra: ['flitzer', 'panzer'], focus: 'flieger', tip: 'Hier fliegen ständig Aschekrähen. Mörser und Flammer treffen sie nicht!',
    paths: [[[-1, 9], [4, 9], [4, 2], [10, 2], [10, 9], [15, 9], [15, 5], [18, 5]]], blocks: [[7, 5, 'rock'], [12, 5, 'rock'], [1, 4, 'rock'], [17, 10, 'ruin']] },
  { name: 'Nebelfurt', theme: 'sumpf', hp: 1.3, foes: ['laeufer', 'schwarm', 'flitzer', 'heiler'], extra: ['flieger', 'brut'], tip: 'Schamanen heilen ihre Freunde – schalte sie zuerst aus.',
    paths: [[[20, 1], [15, 1], [15, 5], [3, 5], [3, 10], [17, 10]]], blocks: [[7, 8, 'pool'], [8, 8, 'pool'], [11, 2, 'pool'], [12, 2, 'pool'], [1, 2, 'tree']] },
  { name: 'Schlackengrube', theme: 'schlacke', hp: 1.5, foes: ['laeufer', 'panzer', 'brut'], extra: ['schwarm', 'heiler'], focus: 'panzer', tip: 'Panzerkäfer halbieren Schaden. Railgun und Laser ignorieren Panzer.',
    paths: [[[-1, 1], [17, 1], [17, 10], [2, 10], [2, 4], [13, 4], [13, 7], [7, 7]]], blocks: [[9, 8, 'lava'], [10, 8, 'lava'], [5, 2, 'lava'], [19, 6, 'rock']] },
  { name: 'Zwillingsbrücke', theme: 'bruecke', hp: 1.7, foes: ['laeufer', 'flitzer', 'panzer', 'flieger'], extra: ['heiler', 'brut'], tip: 'Zwei Eingänge, ein Ausgang: Die Mitte deckt beide Wege ab.',
    paths: [[[-1, 2], [8, 2], [8, 6], [18, 6]], [[-1, 10], [8, 10], [8, 6], [18, 6]]], blocks: [[12, 2, 'rock'], [12, 10, 'rock'], [4, 6, 'ruin'], [15, 3, 'tree']] },
  { name: 'Glutkessel', theme: 'glut', hp: 1.95, foes: ['schwarm', 'brut', 'heiler', 'panzer'], extra: ['flitzer', 'flieger'], focus: 'brut', tip: 'Brutmütter platzen in Schwärmer. Fläche hinter die Haupt-Türme.',
    paths: [[[3, -1], [3, 9], [7, 9], [7, 2], [11, 2], [11, 9], [15, 9], [15, 2], [18, 2]]], blocks: [[9, 5, 'lava'], [13, 5, 'lava'], [5, 5, 'lava'], [17, 8, 'crystal']] },
  { name: 'Aschekreuz', theme: 'asche', hp: 2.2, foes: ['laeufer', 'flitzer', 'flieger', 'panzer', 'heiler'], extra: ['schwarm', 'brut'], tip: 'Die Pfade kreuzen sich – dort stehen Türme doppelt gut.',
    paths: [[[-1, 3], [6, 3], [6, 8], [12, 8], [12, 3], [18, 3]], [[10, 12], [10, 10], [16, 10], [16, 3], [18, 3]]], blocks: [[3, 9, 'ruin'], [14, 6, 'ruin'], [9, 5, 'crystal']] },
  { name: 'Schattentor', theme: 'schatten', hp: 2.5, foes: ['laeufer', 'flitzer', 'schwarm', 'flieger', 'panzer', 'heiler', 'brut'], extra: [], final: 'fuerst', tip: 'Auf Schwer wartet am Ende der Schattenfürst. Spar dir Geld für Legendäre.',
    paths: [[[-1, 1], [16, 1], [16, 4], [3, 4], [3, 7], [16, 7], [16, 10], [2, 10]]], blocks: [[18, 6, 'crystal'], [8, 2, 'crystal'], [10, 9, 'crystal'], [1, 6, 'crystal']] },
];
export const ENDLESS = { name: 'Ewige Wacht', theme: 'schatten', waves: Infinity, hp: 2.6, foes: ['laeufer', 'flitzer', 'schwarm', 'flieger', 'panzer', 'heiler', 'brut'], endless: true, tip: 'So weit du kommst. Zählt für die Bestenliste.',
  paths: [[[-1, 5], [4, 5], [4, 1], [9, 1], [9, 10], [14, 10], [14, 5], [18, 5]]], blocks: [[6, 7, 'crystal'], [11, 4, 'crystal'], [16, 9, 'crystal']] };
export const DIFFS = {
  leicht: { name: 'Leicht', waves: 12, hp: 0.92, cash: 1.1, leak: 0.75, medal: 'Bronze' },
  mittel: { name: 'Mittel', waves: 18, hp: 1.3, cash: 1.0, leak: 1, medal: 'Silber' },
  schwer: { name: 'Schwer', waves: 25, hp: 1.7, cash: 0.9, leak: 1.5, medal: 'Gold' },
};
export const DIFF_IDS = Object.keys(DIFFS);
export function levelDef(i, diff = 'leicht') {
  if (i === 'endless') return { ...ENDLESS, cashK: 1, leakK: 1.25, diff: null };
  const M = LEVELS[i], D = DIFFS[diff] || DIFFS.leicht;
  const foes = [...M.foes, ...(diff !== 'leicht' && M.extra[0] ? [M.extra[0]] : []), ...(diff === 'schwer' && M.extra[1] ? [M.extra[1]] : [])];
  return { ...M, foes, waves: D.waves, hp: M.hp * D.hp, cashK: D.cash, leakK: D.leak, diff, final: diff === 'schwer' ? M.final : null, bossN: diff === 'schwer' ? 2 : 1 };
}

// ---------- Werkstatt (Gems, dauerhaft) ----------
export const UPGRADES = [
  { id: 'kapital', name: 'Startkapital', icon: 'coin', per: 60, max: 10, wsBase: 30, wsGrowth: 1.35 },
  { id: 'mechanik', name: 'Mechanik', icon: 'gear', per: 0.03, max: 10, wsBase: 35, wsGrowth: 1.38 },
  { id: 'kaliber', name: 'Kaliber', icon: 'sword', per: 0.04, max: 10, wsBase: 40, wsGrowth: 1.4 },
  { id: 'platz4', name: 'Loadout-Platz 4', icon: 'plus', per: 1, max: 1, unlock: 200 },
  { id: 'kopfgeld', name: 'Kopfgeld', icon: 'chest', per: 0.06, max: 10, wsBase: 45, wsGrowth: 1.4, req: ['kapital', 2] },
  { id: 'ingenieur', name: 'Ingenieure', icon: 'anvil', per: 0.03, max: 5, wsBase: 70, wsGrowth: 1.5, req: ['kapital', 3] },
  { id: 'optik', name: 'Zieloptik', icon: 'eye', per: 0.03, max: 5, wsBase: 80, wsGrowth: 1.5, req: ['kaliber', 2] },
  { id: 'platz5', name: 'Loadout-Platz 5', icon: 'plus', per: 1, max: 1, unlock: 700, req: ['platz4', 1] },
  { id: 'kasse', name: 'Kriegskasse', icon: 'trophy', per: 0.15, max: 5, wsBase: 90, wsGrowth: 1.5, req: ['kopfgeld', 2] },
  { id: 'recycling', name: 'Recycling', icon: 'up', per: 0.05, max: 4, wsBase: 80, wsGrowth: 1.6, req: ['ingenieur', 1] },
  { id: 'gemfund', name: 'Gemfund', icon: 'gem', per: 0.1, max: 10, wsBase: 60, wsGrowth: 1.4, req: ['kopfgeld', 3] },
  { id: 'notschild', name: 'Notschild', icon: 'shield', per: 1, max: 1, unlock: 500, req: ['mechanik', 4] },
];
export const U = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

export const BOOSTERS = {
  starter: { name: 'Start-Geschenk', cost: 0, odds: { rare: 100 }, hidden: true },
  basic: { name: 'Turm-Booster', cost: 80, odds: { common: 61, rare: 28, epic: 8.6, legendary: 2, mythic: 0.4 } },
  elite: { name: 'Elite-Booster', cost: 250, odds: { rare: 52, epic: 35, legendary: 11, mythic: 2 } },
};
export const STARTER = ['flammer', 'tesla'];
// ---------- Turm-Level wie in PvZ2: Karten sammeln, mit Gems aufwerten ----------
export const TLV_MAX = 10;
const CARD_NEED = [0, 0, 4, 8, 15, 25, 40, 60, 90, 130, 180];      // Karten für Level i (gewöhnlich)
const RAR_CARDS = { common: 1, rare: 0.6, epic: 0.4, legendary: 0.25, mythic: 0.15 };
const GEM_COST = [0, 0, 10, 20, 35, 55, 80, 110, 150, 200, 260];
const RAR_GEM = { common: 1, rare: 1.2, epic: 1.5, legendary: 2, mythic: 2.5 };
export const PACK_CARDS = { common: [6, 10], rare: [3, 6], epic: [2, 4], legendary: [1, 2], mythic: [1, 1] };
export const cardsNeed = (id, toLvl) => (toLvl > TLV_MAX ? null : Math.max(1, Math.round(CARD_NEED[toLvl] * RAR_CARDS[T[id].rarity])));
export const lvlGems = (id, toLvl) => Math.round(GEM_COST[toLvl] * RAR_GEM[T[id].rarity] / 5) * 5;
export const LVL_BONUS = 0.08; // +8 % Stärke pro Level
const GENERIC = { 3: { range: 0.08, name: 'Zielfernrohr' }, 7: { cost: -0.1, name: 'Serienfertigung' } };
export const perksOf = id => ({ 3: GENERIC[3], 5: T[id].perks[5], 7: GENERIC[7], 10: T[id].perks[10] });
export function perkText(p) {
  const pc = v => `${Math.round(v * 100)} %`;
  const parts = [];
  if (p.range) parts.push(`+${pc(p.range)} Reichweite`); if (p.rate) parts.push(`+${pc(p.rate)} Feuerrate`); if (p.dmg) parts.push(`+${pc(p.dmg)} Schaden`);
  if (p.splash) parts.push(`+${pc(p.splash)} Fläche`); if (p.ap) parts.push(`ignoriert ${pc(p.ap)} Panzerung`); if (p.slow) parts.push(`+${pc(p.slow)} Verlangsamung`);
  if (p.chain) parts.push(`+${p.chain} Sprung${p.chain > 1 ? 'e' : ''}`); if (p.pierce) parts.push(`+${p.pierce} Durchschlag`); if (p.n) parts.push(`+${p.n} Rakete`);
  if (p.income) parts.push(`+${pc(p.income)} Ertrag`); if (p.burn) parts.push(`+${pc(p.burn)} Brandschaden`); if (p.cost) parts.push(`${pc(-p.cost)} günstiger`);
  if (p.stun) parts.push(`+${pc(p.stun)} Betäubung`); if (p.ramp) parts.push(`heizt stärker auf`); if (p.bDmg) parts.push(`+${pc(p.bDmg)} Schaden-Bonus`);
  return parts.join(', ');
}
// Alte Sterne-Spielstände ehrlich umrechnen: jede alte Kopie = ein Booster-Pull = durchschnittliche Kartenzahl dieser Seltenheit.
// Mit den Karten wird gratis aufgelevelt (Duplikate waren vorher auch gratis), der Rest bleibt als Karten.
function migrateTower(id, t) {
  if (!T[id] || !t || t.lvl) return t;
  const r = T[id].rarity, avg = (PACK_CARDS[r][0] + PACK_CARDS[r][1]) / 2;
  let cards = Math.round(Math.max(0, (t.copies || 1) - 1) * avg), lvl = 1;
  while (lvl < TLV_MAX && cards >= cardsNeed(id, lvl + 1)) { cards -= cardsNeed(id, lvl + 1); lvl++; }
  return { lvl, cards, from: t.copies || 1 };
}
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
// Bosse wachsen langsamer als normale Gegner – sonst sind sie ab Welle 10 kaum zu stoppen
export function bossHp(L, w) {
  let m = L.hp * (1 + 0.12 * (w - 1));
  if (L.endless && w > 25) m *= Math.pow(1.05, w - 25);
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
  if (L.focus && w >= 2) add(L.focus, 2 + w * (L.focus === 'brut' ? 0.15 : L.focus === 'panzer' ? 0.3 : 0.4), L.focus === 'flieger' ? 0.6 : 1.1);
  if (final && L.final) G.push({ type: L.final, n: 1, gap: 1, boss: true });
  else if (final) G.push({ type: 'koloss', n: L.bossN || 1, gap: 3, boss: true });
  else if (w % 10 === 0) G.push({ type: 'koloss', n: w >= 30 ? 2 : 1, gap: 3, boss: true });
  if (L.endless && w % 25 === 0) G.push({ type: 'fuerst', n: 1, gap: 1, boss: true });
  return G;
}

function defaultMeta() {
  return {
    v: 2,
    gems: 0, totalGems: 0,
    ws: Object.fromEntries(UPGRADES.map(u => [u.id, 0])),
    towers: {},
    loadout: [null, null, null, null, null],
    levels: {},          // i -> { stars, clears, best }
    best: 0,             // Endlos-Rekord (Bestenliste)
    runs: 0, wins: 0, kills: 0, bossKills: 0, packs: 0, built: 0, playTime: 0,
    speed: 1,
    lastLevel: 0, lastDiff: 'leicht',
    flags: { intro: false, gift: false },
    settings: { sfxVol: 0.5, musicVol: 0.4, musicTrack: 'mix', gfx: 'auto', shake: 'on', numbers: 'on', boosterAnim: 'show', ranges: 'on' },
  };
}
function mergeMeta(m) {
  const d = defaultMeta();
  if (!m || m.v !== 2) return d;
  const levels = {};
  if (m.ws && m.ws.kern) { let refund = 0; for (let L = 0; L < m.ws.kern; L++) refund += Math.round(30 * Math.pow(1.35, L)); m.gems = (m.gems || 0) + refund; m.ws = { ...m.ws }; delete m.ws.kern; m.refundKern = (m.refundKern || 0) + refund; }
  for (const [k, l] of Object.entries(m.levels || {})) levels[k] = { clears: l.clears || 0, best: l.best || 0, medals: l.medals || (l.clears ? { leicht: true } : {}) };
  return { ...d, ...m, ws: { ...d.ws, ...(m.ws || {}) }, towers: Object.fromEntries(Object.entries(m.towers || d.towers).filter(([id]) => T[id]).map(([id, t]) => [id, migrateTower(id, t)])), loadout: [...(m.loadout || d.loadout), null, null, null, null, null].slice(0, 5),
    levels, flags: { ...d.flags, ...(m.flags || {}) }, settings: { ...d.settings, ...(m.settings || {}) } };
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
      case 'mechanik': return L ? `+${pc(v)} Feuerrate aller Türme` : 'Alle Türme schießen schneller';
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
  const lvlCash = () => Math.pow(game.run?.L.hp || 1, 0.75) * (game.run?.L.cashK || 1);
  const coreMax = () => 100; // Kern hat immer 100 Leben
  const gemMult = () => 1 + wsP('gemfund');
  game.loadoutSize = () => 3 + wsL('platz4') + wsL('platz5');

  // ----- Sammlung / Sterne -----
  const tLvl = id => meta.towers[id]?.lvl || 0;
  game.towerLevel = tLvl;
  game.towerCards = id => meta.towers[id]?.cards || 0;
  game.cardsNeed = id => (tLvl(id) >= TLV_MAX ? null : cardsNeed(id, tLvl(id) + 1));
  game.lvlCost = id => (tLvl(id) >= TLV_MAX ? null : lvlGems(id, tLvl(id) + 1));
  game.cardsReady = id => !!meta.towers[id] && tLvl(id) < TLV_MAX && game.towerCards(id) >= game.cardsNeed(id);
  game.canLevel = id => game.cardsReady(id) && meta.gems >= game.lvlCost(id) && !game.run;
  game.readyCount = () => Object.keys(meta.towers).filter(id => game.cardsReady(id)).length;
  game.levelUp = id => {
    if (!game.canLevel(id)) return false;
    const t = meta.towers[id];
    meta.gems -= game.lvlCost(id); t.cards -= game.cardsNeed(id); t.lvl++;
    save(); emit('levelup', id); emit('gems');
    return true;
  };
  // aktive Level-Belohnungen zusammenrechnen
  const perkSum = id => {
    const L = tLvl(id) || 1, P = {};
    for (const [lv, p] of Object.entries(perksOf(id))) if (L >= +lv) for (const [k, v] of Object.entries(p)) if (k !== 'name') P[k] = (P[k] || 0) + v;
    return P;
  };
  game.perkSum = perkSum;
  const starMult = id => 1 + LVL_BONUS * (Math.max(1, tLvl(id)) - 1);
  game.owned = id => !!meta.towers[id];

  // Werte eines Turms auf Stufe lv (0-basiert) inkl. Sterne & Werkstatt
  game.towerStats = (id, lv = 0, buff = null) => {
    const d = T[id], s = { ...d.lv[lv] }, P = perkSum(id), m = dmgMult() * starMult(id) * (1 + (P.dmg || 0)) * (1 + (buff?.dmg || 0));
    if (s.dmg) s.dmg *= m;
    if (s.dps) s.dps *= m;
    if (s.burn) s.burn *= m;
    if (s.burn && P.burn) s.burn *= 1 + P.burn;
    if (s.income) s.income = Math.round(s.income * starMult(id) * (1 + (P.income || 0)));
    if (s.bDmg) { const k = 1 + 0.05 * (Math.max(1, tLvl(id)) - 1); s.bDmg = s.bDmg * k + (P.bDmg || 0); s.bRate *= k; }
    if (s.splash && P.splash) s.splash *= 1 + P.splash;
    if (P.ap) s.ap = (s.ap || 0) + P.ap;
    if (s.slow && P.slow) s.slow = Math.min(0.8, s.slow + P.slow);
    if (s.chain && P.chain) s.chain += P.chain;
    if (s.pierce && P.pierce) s.pierce += P.pierce;
    if (s.n && P.n) s.n += P.n;
    if (s.stun && P.stun) s.stun *= 1 + P.stun;
    if (s.ramp && P.ramp) s.ramp += P.ramp;
    if (P.rate && s.rate) s.rate *= 1 + P.rate;
    if (s.rate) s.rate *= (1 + (buff?.rate || 0)) * (1 + wsP('mechanik'));
    if (s.range) s.range *= rangeMult() * (1 + (buff?.range || 0)) * (s.range < 50 ? 1 + (P.range || 0) : 1);
    return s;
  };
  game.towerCost = (id, lv = 0) => Math.round(T[id].lv[lv].cost * costMult() * (1 + (perkSum(id).cost || 0)) / 5) * 5;
  game.dps = (id, lv = 0) => {
    const s = game.towerStats(id, lv), d = T[id];
    switch (d.kind) {
      case 'flame': case 'laser': return s.dps;
      case 'missile': return s.dmg * s.n * s.rate;
      case 'tesla': return s.dmg * s.rate * (1 + 0.85 * (s.chain - 1) * 0.6);
      case 'flak': return s.dmg * s.rate * (s.shots || 1);
      case 'plasma': return s.dmg * s.rate * (1 + 0.45 * (s.pierce - 1));
      case 'orbital': return s.dmg * s.rate * 1.5;
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
    if (kind === 'starter') pool = pool.filter(t => STARTER.includes(t.id));
    const def = pool[Math.floor(rng() * pool.length)];
    const [lo, hi] = PACK_CARDS[rar];
    const n = lo + Math.floor(rng() * (hi - lo + 1));
    const owned = meta.towers[def.id];
    const res = { id: def.id, def, rarity: rar, isNew: !owned, n, refund: 0 };
    if (!owned) {
      meta.towers[def.id] = { lvl: 1, cards: n - 1 };
      const free = meta.loadout.findIndex((x, k) => !x && k < game.loadoutSize());
      if (free >= 0) { meta.loadout[free] = def.id; res.placed = true; }
    } else if (owned.lvl >= TLV_MAX) { res.refund = n * 3; meta.gems += res.refund; }
    else owned.cards += n;
    res.lvl = meta.towers[def.id].lvl; res.cards = meta.towers[def.id].cards; res.need = game.cardsNeed(def.id);
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
  const medalsOf = i => meta.levels[i]?.medals || {};
  game.levelInfo = i => meta.levels[i] || { clears: 0, best: 0, medals: {} };
  game.hasMedal = (i, d) => !!medalsOf(i)[d];
  game.anyMedal = i => Object.values(medalsOf(i)).some(Boolean);
  game.levelUnlocked = i => (i === 'endless' ? game.anyMedal(LEVELS.length - 1) : i === 0 || game.anyMedal(i - 1));
  game.totalMedals = () => LEVELS.reduce((a, _, i) => a + Object.values(medalsOf(i)).filter(Boolean).length, 0);
  game.levelsCleared = () => LEVELS.filter((_, i) => game.anyMedal(i)).length;

  // =====================================================================
  // RUN
  // =====================================================================
  function clearRun() { game.run = null; game.towers = []; game.enemies = []; game.projectiles = []; game.fx = []; }

  game.startLevel = (li, diff = 'leicht') => {
    if (game.run || !game.levelUnlocked(li)) return false;
    if (li !== 'endless' && !DIFFS[diff]) diff = 'leicht';
    const L = levelDef(li, diff);
    const paths = L.paths.map(buildPath);
    const grid = new Uint8Array(COLS * ROWS);
    for (const p of paths) for (const c of p.cells) grid[c] = 1;
    for (const [c, r] of L.blocks || []) if (!grid[r * COLS + c]) grid[r * COLS + c] = 4;
    const [cc, cr] = paths[0].core;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const c = cc + dc, r = cr + dr; if (c >= 0 && r >= 0 && c < COLS && r < ROWS && !grid[r * COLS + c]) grid[r * COLS + c] = 2; }
    clearRun();
    game.run = {
      li, diff: L.diff, L, paths, grid, strikes: [], wave: 0, waves: L.waves, phase: 'prep',
      cash: startCash() + (li === 'endless' ? 1000 : li * 120), coreHp: coreMax(), coreMax: coreMax(), core: { x: cc + 0.5, z: cr + 0.5 },
      queue: [], spawnT: 0, nextT: 0, gems: 0, kills: 0, time: 0, built: {}, shield: wsL('notschild') > 0, earned: 0, leaked: 0, pathTurn: 0, bossAlive: 0,
    };
    meta.lastLevel = li; if (L.diff) meta.lastDiff = L.diff;
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
    const t = { uid: uid++, id, def: T[id], lv: 0, c, r, x: c + 0.5, z: r + 0.5, cd: 0.2, aim: Math.atan2(R.core.x - (c + 0.5), R.core.z - (r + 0.5)), mode: T[id].kind === 'orbital' ? 'strong' : 'first', target: null, heat: 0, spent: cost, dmgDone: 0, kills: 0, buff: null, fireT: 0, flaming: 0, recoil: 0, shot: 0, built: game.t };
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
    R.hpMult = waveHp(R.L, R.wave); R.bossMult = bossHp(R.L, R.wave);
    const boss = R.queue.some(q => ENEMIES[q.type].boss);
    emit('waveStart', { wave: R.wave, waves: R.waves, boss, income: inc });
    if (boss) emit('boss', R.wave);
  }

  function spawn(type, d = 0, pi = null) {
    const R = game.run, E = ENEMIES[type];
    if (pi == null) { pi = R.pathTurn % R.paths.length; R.pathTurn++; }
    const hp = E.hp * (E.boss ? R.bossMult : R.hpMult);
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
    const aligned = k === 'orbital' ? true : aimAt(t, tg, dt, k === 'howitzer' || k === 'shell' ? 5 : 12);
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
      case 'plasma': {
        const lead = tg.stunT > 0 || tg.frozenT > 0 ? 0 : tg.speed * (1 - tg.slow) * Math.hypot(tg.x - t.x, tg.z - t.z) / 13;
        const p = tg.path.at(tg.d + lead), ang = Math.atan2(p.x - muzzle.x, p.z - muzzle.z);
        game.projectiles.push({ kind: 'plasma', x: muzzle.x, z: muzzle.z, y: 0.85, vx: Math.sin(ang) * 13, vz: Math.cos(ang) * 13, dist: 0, max: s.range + 0.8, dmg: s.dmg, splash: s.splash, pierce: s.pierce, hit: new Set(), src: t });
        emit('shot', { t, kind: 'plasma' }); break;
      }
      case 'orbital':
        game.run.strikes.push({ x: tg.x, z: tg.z, tg, t: 1.0, T: 1.0, dmg: s.dmg, splash: s.splash, stun: s.stun, src: t });
        emit('shot', { t, kind: 'orbital' }); break;
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
      if (p.kind === 'plasma') {
        p.x += p.vx * dt; p.z += p.vz * dt; p.dist += 13 * dt;
        for (const e of game.enemies) {
          if (e.dead || p.hit.has(e) || Math.hypot(e.x - p.x, e.z - p.z) > 0.45) continue;
          p.hit.add(e); damage(e, p.dmg, 0.3, p.src);
          if (p.hit.size >= p.pierce) { p.dist = p.max; break; }
        }
        if (p.dist >= p.max) {
          splash(p.x, p.z, p.splash, p.dmg * 0.8, p.src, { air: true });
          game.fx.push({ kind: 'plasmaBoom', x: p.x, z: p.z, r: p.splash, life: 0.5, max: 0.5 });
          emit('boom', { x: p.x, z: p.z, r: p.splash });
          P.splice(i, 1);
        }
        continue;
      }
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
        // Bosse: Schaden je nach verbleibendem Leben (wie bei Bloons) – unverletzt voller Schaden
        const base = e.boss ? e.E.dmg * (0.4 + 0.6 * Math.max(0, e.hp / e.maxHp)) : e.E.dmg;
        const cd = Math.max(1, Math.round(base * (R.L.leakK || 1)));
        R.coreHp -= cd; R.leaked++;
        emit('coreHit', { e, dmg: cd });
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
    for (let i = R.strikes.length - 1; i >= 0; i--) {
      const st = R.strikes[i];
      st.t -= dt;
      if (st.tg && !st.tg.dead && st.t > 0.25) { st.x = st.tg.x; st.z = st.tg.z; }
      if (st.t <= 0) {
        splash(st.x, st.z, st.splash, st.dmg, st.src, { air: true, stun: st.stun });
        game.fx.push({ kind: 'orbital', x: st.x, z: st.z, r: st.splash, life: 0.9, max: 0.9 });
        emit('boom', { x: st.x, z: st.z, r: st.splash, big: true });
        R.strikes.splice(i, 1);
      }
    }
    for (const f of game.fx) f.life -= dt;
    game.fx = game.fx.filter(f => f.life > 0);
    if (game.enemies.some(e => e.dead)) game.enemies = game.enemies.filter(e => !e.dead);
  }

  function finish(result) {
    const R = game.run;
    if (!R || R.phase === 'done') return;
    R.phase = 'done';
    const L = R.L;
    let medal = null, newMedal = false, firstClear = false, record = false;
    if (result === 'win' && R.li !== 'endless') {
      const info = meta.levels[R.li] || (meta.levels[R.li] = { clears: 0, best: 0, medals: {} });
      firstClear = !Object.values(info.medals).some(Boolean);
      medal = R.diff; newMedal = !info.medals[R.diff];
      info.medals[R.diff] = true; info.clears++; info.best = Math.max(info.best, R.waves);
      const base = { leicht: [25, 5], mittel: [45, 8], schwer: [80, 12] }[R.diff];
      const bonus = newMedal ? base[0] + base[1] * R.li : 6 + R.li;
      R.gems += Math.round((bonus + 1 + Math.floor(R.wave / 4)) * gemMult());
      meta.wins++;
      const pool = meta.loadout.filter(id => id && meta.towers[id] && meta.towers[id].lvl < TLV_MAX);
      if (pool.length) { const id = pool[Math.floor(rng() * pool.length)]; const nC = { leicht: 3, mittel: 5, schwer: 8 }[R.diff] * (newMedal ? 2 : 1); meta.towers[id].cards += nC; R.cardReward = { id, n: nC }; }
    } else if (R.li !== 'endless') {
      const info = meta.levels[R.li] || (meta.levels[R.li] = { clears: 0, best: 0, medals: {} });
      info.best = Math.max(info.best, R.wave - 1);
    }
    if (L.endless) { const w = Math.max(0, R.wave - (result === 'win' ? 0 : 1)); if (w > meta.best) { meta.best = w; record = true; } }
    meta.gems += R.gems; meta.totalGems += R.gems;
    meta.runs++; meta.playTime += R.time;
    save();
    const summary = { result, cards: R.cardReward || null, li: R.li, diff: R.diff, name: L.name, wave: R.wave, waves: R.waves, medal, newMedal, firstClear, record, gems: R.gems, kills: R.kills, time: R.time, coreHp: R.coreHp, coreMax: R.coreMax, earned: R.earned };
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
