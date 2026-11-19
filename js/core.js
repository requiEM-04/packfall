// Packfall · Laternenwacht – Spielkern (reine Logik, keine Darstellung)
// 6 Bahnen × 9 Felder. Lichtwesen gegen Schatten. Licht ist Ressource UND Waffe:
// Schatten im Dunkeln nehmen kaum Schaden. Booster, Karten-Level, Werkstatt und Abzeichen bleiben dauerhaft.

export const SAVE_KEY = 'packfall.save.v2';
export const COLS = 9, ROWS = 6;

export const RARITIES = {
  common:    { name: 'Gewöhnlich', color: '#8f9093', rank: 0 },
  rare:      { name: 'Selten',     color: '#6a8aa6', rank: 1 },
  epic:      { name: 'Episch',     color: '#8f76a0', rank: 2 },
  legendary: { name: 'Legendär',   color: '#b39a5e', rank: 3 },
  mythic:    { name: 'Mythisch',   color: '#d23a40', rank: 4 },
};

// ---------- Lichtwesen ----------
// cost = Licht zum Setzen, cd = Abklingzeit der Karte (s), hp = Leben, light = Lichtradius (Felder)
// rate = Angriffe pro Sekunde. air = trifft Flieger. from = alte Turm-ID (für faire Übernahme)
export const TOWERS = [
  { id: 'funkling', from: 'praegewerk', name: 'Funkling', rarity: 'common', kind: 'farm', accent: '#ffcf70', cost: 50, cd: 7.5, hp: 300, light: 1.4, income: 25, every: 9,
    role: 'Sammelt Licht', desc: 'Ein kleiner Lichtgeist. Fängt regelmäßig einen Lichttropfen ein – deine wichtigste Lichtquelle.', perks: { 5: { income: 0.2, name: 'Doppelglanz' }, 10: { income: 0.35, name: 'Sonnenfänger' } } },
  { id: 'lichtschuetze', from: 'repetierer', name: 'Lichtschütze', rarity: 'common', kind: 'bolt', accent: '#ffd27a', cost: 100, cd: 7.5, hp: 300, light: 1.1, dmg: 20, rate: 0.7, air: true,
    role: 'Schießt geradeaus', desc: 'Schießt Lichtpfeile die Bahn entlang. Trifft auch Flieger.', perks: { 5: { rate: 0.2, name: 'Schnelle Sehne' }, 10: { dmg: 0.3, name: 'Gleißende Pfeile' } } },
  { id: 'glutgeist', from: 'moerser', name: 'Glutgeist', rarity: 'common', kind: 'lob', accent: '#ff9a50', cost: 125, cd: 7.5, hp: 300, light: 0.9, dmg: 34, rate: 0.36, splash: 0.6,
    role: 'Wirft im Bogen · Fläche', desc: 'Wirft Glutkugeln über Schilde hinweg. Trifft keine Flieger.', perks: { 5: { splash: 0.25, name: 'Größere Glut' }, 10: { dmg: 0.3, name: 'Weißglut' } } },
  { id: 'kristallwaechter', from: null, name: 'Kristallwächter', rarity: 'common', kind: 'wall', accent: '#c4d6ff', cost: 50, cd: 25, hp: 4000, light: 1.2,
    role: 'Hält auf', desc: 'Ein Golem aus Lichtkristall. Hält Schatten lange auf, während andere schießen.', perks: { 5: { hp: 0.3, name: 'Härterer Kristall' }, 10: { hp: 0.5, name: 'Diamantkern' } } },
  { id: 'prismling', from: 'tesla', name: 'Prismling', rarity: 'rare', kind: 'tri', accent: '#a8f0ff', cost: 175, cd: 7.5, hp: 300, light: 1.0, dmg: 18, rate: 0.65, air: true,
    role: 'Drei Bahnen', desc: 'Bricht Licht in drei Strahlen: eigene Bahn und beide Nachbarbahnen.', perks: { 5: { rate: 0.15, name: 'Klarer Schliff' }, 10: { dmg: 0.3, name: 'Regenbogenkern' } } },
  { id: 'frostschimmer', from: 'frostwerfer', name: 'Frostschimmer', rarity: 'rare', kind: 'frost', accent: '#9fd2ff', cost: 150, cd: 7.5, hp: 300, light: 1.1, dmg: 18, rate: 0.65, slow: 0.5, slowT: 3, air: true,
    role: 'Verlangsamt', desc: 'Kaltes Licht. Getroffene Schatten werden für kurze Zeit halb so schnell.', perks: { 5: { slow: 0.1, name: 'Raureif' }, 10: { dmg: 0.3, name: 'Eiskristall' } } },
  { id: 'flammengeist', from: 'flammer', name: 'Flammengeist', rarity: 'rare', kind: 'flame', accent: '#ff8040', cost: 150, cd: 7.5, hp: 400, light: 1.7, dps: 26, range: 2.6, air: true,
    role: 'Feuerkegel · kurz', desc: 'Speit Feuer auf alles in den nächsten Feldern. Ignoriert Schilde.', perks: { 5: { range: 0.2, name: 'Langer Atem' }, 10: { dmg: 0.35, name: 'Höllenglut' } } },
  { id: 'lichtfalke', from: 'flak', name: 'Lichtfalke', rarity: 'rare', kind: 'falcon', accent: '#ffe6b0', cost: 125, cd: 7.5, hp: 300, light: 1.1, dmg: 20, rate: 0.75, airMult: 3, air: true,
    role: 'Jagt Flieger', desc: 'Stürzt sich zuerst auf fliegende Schatten und macht ihnen dreifachen Schaden.', perks: { 5: { rate: 0.2, name: 'Sturzflug' }, 10: { dmg: 0.3, name: 'Goldkrallen' } } },
  { id: 'nova', from: null, name: 'Nova', rarity: 'rare', kind: 'bomb', accent: '#c8b0ff', cost: 150, cd: 35, hp: 9999, light: 2.2, dmg: 1800, air: true,
    role: 'Explodiert 3×3', desc: 'Ein kleiner Stern, der kurz nach dem Setzen alles im Umkreis von einem Feld vernichtet.', perks: { 5: { dmg: 0.25, name: 'Superhell' }, 10: { cost: -0.2, name: 'Sternenstaub' } } },
  { id: 'strahlenritter', from: 'railgun', name: 'Strahlenritter', rarity: 'epic', kind: 'lance', accent: '#ffe08a', cost: 200, cd: 7.5, hp: 400, light: 1.1, dmg: 40, rate: 0.42, air: true,
    role: 'Durchschlägt die Bahn', desc: 'Sticht mit einer Lanze aus Licht durch die ganze Bahn – durch Schilde hindurch.', perks: { 5: { rate: 0.15, name: 'Schnelle Lanze' }, 10: { dmg: 0.3, name: 'Sonnenstahl' } } },
  { id: 'irrlichtmutter', from: 'raketenwerk', name: 'Irrlichtmutter', rarity: 'epic', kind: 'wisp', accent: '#90ffd0', cost: 225, cd: 10, hp: 300, light: 1.3, dmg: 30, rate: 0.55, n: 1, air: true,
    role: 'Zielsuchend · ganze Map', desc: 'Schickt Irrlichter los, die jeden Schatten auf dem Feld finden.', perks: { 5: { n: 1, name: 'Zweites Irrlicht' }, 10: { dmg: 0.3, name: 'Seelenlicht' } } },
  { id: 'sonnenhueter', from: 'verstaerker', name: 'Sonnenhüter', rarity: 'epic', kind: 'beacon', accent: '#ffd070', cost: 175, cd: 20, hp: 700, light: 2.8, bDmg: 0.2,
    role: 'Großes Licht · Bonus', desc: 'Macht alles drumherum hell. Wächter in seinem Licht machen mehr Schaden.', perks: { 5: { light: 0.2, name: 'Weiter Schein' }, 10: { bDmg: 0.1, name: 'Mittagssonne' } } },
  { id: 'sonnenauge', from: 'laserlanze', name: 'Sonnenauge', rarity: 'legendary', kind: 'beam', accent: '#ffb040', cost: 300, cd: 15, hp: 400, light: 1.4, dps: 40, ramp: 3, rampT: 2.5, air: true,
    role: 'Dauerstrahl · heizt auf', desc: 'Ein Strahl, der heißer wird, je länger er auf einem Ziel bleibt (bis ×3).', perks: { 5: { ramp: 0.5, name: 'Brennglas' }, 10: { dmg: 0.25, name: 'Sonnenkern' } } },
  { id: 'pulsar', from: 'haubitze', name: 'Pulsar', rarity: 'legendary', kind: 'pulse', accent: '#a8d4ff', cost: 325, cd: 20, hp: 800, light: 1.1, dmg: 75, rate: 0.25, range: 3.5, stun: 0.8, air: true,
    role: 'Lichtwelle · betäubt', desc: 'Sendet Lichtwellen über drei Bahnen. Alles in Reichweite wird kurz betäubt.', perks: { 5: { stun: 0.3, name: 'Schockwelle' }, 10: { range: 0.25, name: 'Weite Welle' } } },
  { id: 'blutmond', from: 'plasmareaktor', name: 'Blutmond', rarity: 'mythic', kind: 'moon', accent: '#ff4a4a', cost: 400, cd: 20, hp: 500, light: 1.6, dmg: 170, rate: 0.4, pierce: 3, splash: 0.8, air: true,
    role: 'Durchschlag · Explosion', desc: 'Feuert rote Mondkugeln, die durch mehrere Schatten schlagen und am Ende explodieren.', perks: { 5: { pierce: 1, name: 'Blutrausch' }, 10: { rate: 0.2, name: 'Vollmond' } } },
  { id: 'sternenweber', from: 'himmelsspeer', name: 'Sternenweber', rarity: 'mythic', kind: 'star', accent: '#c0a8ff', cost: 450, cd: 25, hp: 400, light: 1.1, dmg: 340, rate: 0.2, splash: 1.1, stun: 0.6, air: true,
    role: 'Sternschlag · ganze Map', desc: 'Ruft Sterne auf den stärksten Schatten der ganzen Map herab.', perks: { 5: { splash: 0.2, name: 'Sternhaufen' }, 10: { rate: 0.25, name: 'Sternregen' } } },
];
export const T = Object.fromEntries(TOWERS.map(t => [t.id, t]));
export const ID_MAP = Object.fromEntries(TOWERS.filter(t => t.from).map(t => [t.from, t.id]));
export const STARTER = ['funkling', 'lichtschuetze'];
const ACT = { farm: 1.0, bolt: 0.45, lob: 0.7, tri: 0.45, frost: 0.45, falcon: 0.5, lance: 0.6, wisp: 0.5, pulse: 0.8, moon: 0.6, star: 0.8, flame: 0.6 };

// ---------- Schatten ----------
export const ENEMIES = {
  schatten: { name: 'Schattenläufer', hp: 190, speed: 0.22, bite: 90, core: 10, desc: 'Ein Schatten auf zwei Beinen. Kommt in jeder Welle.' },
  ritter: { name: 'Schattenritter', hp: 190, armor: 370, speed: 0.21, bite: 90, core: 15, desc: 'Trägt eine dunkle Rüstung, die erst zerbrechen muss.' },
  sarg: { name: 'Sargträger', hp: 190, shield: 650, speed: 0.2, bite: 90, core: 15, desc: 'Ein Sargdeckel schützt ihn von vorn. Würfe, Feuer und Lanzen gehen vorbei.' },
  reiter: { name: 'Nebelreiter', hp: 300, speed: 0.55, bite: 90, core: 15, mount: true, desc: 'Schnell zu Ross – springt über den ersten Wächter und läuft dann zu Fuß weiter.' },
  motte: { name: 'Schattenmotten', hp: 140, speed: 0.48, bite: 100, core: 10, air: true, desc: 'Fliegen über alles hinweg zum hellsten Wächter der Bahn.' },
  fresser: { name: 'Lichtfresser', hp: 1100, speed: 0.15, bite: 160, core: 25, aura: 1.6, desc: 'Schluckt das Licht um sich herum. Im Dunkeln kaum zu verletzen.' },
  schattenling: { name: 'Schattenling', hp: 90, speed: 0.42, bite: 60, core: 5, desc: 'Klein und schnell. Kommt in Schwärmen.' },
  koloss: { name: 'Schattenkoloss', hp: 2600, speed: 0.14, bite: 0, core: 50, boss: true, smash: true, desc: 'Zermalmt jeden Wächter mit einem Schlag. Wirft einen Schattenling, wenn er verletzt ist.' },
  fuerst: { name: 'Schattenfürst', hp: 9000, speed: 0.11, bite: 0, core: 100, boss: true, smash: true, summon: true, desc: 'Herr der Schatten. Ruft unterwegs weitere Schatten herbei.' },
};

// ---------- Maps & Schwierigkeit ----------
export const THEMES = {
  gasse:    { name: 'Gasse',    tile: ['#3d4a33', '#35412c'], soil: '#2a2219', sky: ['#141b22', '#34404a'], fog: '#1c231e', deco: 'lamp' },
  wiese:    { name: 'Wiese',    tile: ['#42502f', '#394629'], soil: '#2c2418', sky: ['#151c24', '#36424a'], fog: '#1d241b', deco: 'grass' },
  friedhof: { name: 'Friedhof', tile: ['#3a4136', '#323830'], soil: '#262420', sky: ['#12161c', '#303842'], fog: '#1b2022', deco: 'grave' },
  moor:     { name: 'Moor',     tile: ['#34443a', '#2d3b32'], soil: '#20231d', sky: ['#111a1c', '#2c3c40'], fog: '#18211d', deco: 'reed' },
  markt:    { name: 'Markt',    tile: ['#4a463e', '#403d36'], soil: '#2a2620', sky: ['#16141a', '#3a3438'], fog: '#1e1c1c', deco: 'crate' },
  hof:      { name: 'Hof',      tile: ['#3e3f44', '#36373c'], soil: '#24232a', sky: ['#121218', '#30303c'], fog: '#1b1b22', deco: 'pillar' },
  bruecke:  { name: 'Brücke',   tile: ['#4a3e30', '#40362a'], soil: '#241c14', sky: ['#16121a', '#3a2e30'], fog: '#1e1814', deco: 'rope' },
  tor:      { name: 'Schattentor', tile: ['#352f42', '#2e2939'], soil: '#1e1a26', sky: ['#100c18', '#2c2240'], fog: '#18141f', deco: 'crystal' },
};
export const LEVELS = [
  { name: 'Laternengasse', theme: 'gasse', hp: 1.0, ambient: 1.0, foes: ['schatten'], extra: ['ritter', 'schattenling'], tip: 'Funklinge nach hinten, Lichtschützen davor. Funklinge sammeln das Licht, mit dem du Wächter setzt.' },
  { name: 'Mottenwiese', theme: 'wiese', hp: 1.05, ambient: 0.85, foes: ['schatten', 'motte'], extra: ['ritter', 'schattenling'], focus: 'motte', tip: 'Schattenmotten fliegen zum hellsten Wächter der Bahn. Lichtfalken holen sie dreifach schnell runter.' },
  { name: 'Sargweg', theme: 'friedhof', hp: 1.1, ambient: 0.72, foes: ['schatten', 'ritter', 'sarg'], extra: ['motte', 'reiter'], blocks: [[4, 1, 'grave'], [6, 3, 'grave'], [3, 5, 'grave']], tip: 'Sargträger blocken Schüsse von vorn. Glutgeister werfen drüber, der Strahlenritter sticht durch.' },
  { name: 'Nebelmoor', theme: 'moor', hp: 1.15, ambient: 0.62, foes: ['schatten', 'reiter', 'sarg', 'motte'], extra: ['ritter', 'fresser'], focus: 'reiter', blocks: [[5, 0, 'pool'], [2, 2, 'pool'], [7, 4, 'pool'], [4, 5, 'pool']], tip: 'Nebelreiter springen über den ersten Wächter. Ein Kristallwächter ganz vorn fängt den Sprung ab.' },
  { name: 'Aschenmarkt', theme: 'markt', hp: 1.22, ambient: 0.54, foes: ['schatten', 'ritter', 'fresser', 'schattenling'], extra: ['sarg', 'motte'], focus: 'fresser', blocks: [[6, 1, 'crate'], [4, 3, 'crate'], [6, 5, 'crate']], tip: 'Lichtfresser schlucken das Licht um sich herum. Ein Sonnenhüter in der Nähe hält dagegen.' },
  { name: 'Glockenhof', theme: 'hof', hp: 1.3, ambient: 0.47, foes: ['schatten', 'sarg', 'reiter', 'motte', 'fresser'], extra: ['ritter', 'schattenling'], blocks: [[3, 0, 'pillar'], [5, 2, 'pillar'], [3, 4, 'pillar'], [5, 5, 'pillar']], tip: 'Es wird dunkler. Ohne Licht machen deine Wächter weniger als die Hälfte Schaden.' },
  { name: 'Rabenbrücke', theme: 'bruecke', hp: 1.37, ambient: 0.41, foes: ['schatten', 'ritter', 'sarg', 'reiter', 'motte', 'schattenling'], extra: ['fresser'], blocks: [[2, 0, 'rock'], [6, 2, 'rock'], [2, 4, 'rock'], [6, 5, 'rock']], tip: 'Viele Gegnerarten auf einmal. Misch Flächenschaden, Luftabwehr und Licht.' },
  { name: 'Schattentor', theme: 'tor', hp: 1.45, ambient: 0.35, foes: ['schatten', 'ritter', 'sarg', 'reiter', 'motte', 'fresser', 'schattenling'], extra: [], final: 'fuerst', blocks: [[4, 0, 'crystal'], [7, 2, 'crystal'], [4, 4, 'crystal'], [7, 5, 'crystal']], tip: 'Auf Schwer wartet am Ende der Schattenfürst. Ohne viel Licht hast du keine Chance.' },
];
export const ENDLESS = { name: 'Ewige Nacht', theme: 'tor', waves: Infinity, hp: 1.6, ambient: 0.32, foes: ['schatten', 'ritter', 'sarg', 'reiter', 'motte', 'fresser', 'schattenling'], endless: true, blocks: [[5, 1, 'crystal'], [3, 3, 'crystal'], [5, 5, 'crystal']], tip: 'So weit du kommst. Zählt für die Bestenliste.' };
export const DIFFS = {
  leicht: { name: 'Leicht', waves: 10, hp: 0.85, sky: 1.15, leak: 0.75, medal: 'Bronze' },
  mittel: { name: 'Mittel', waves: 15, hp: 1.0, sky: 1.0, leak: 1, medal: 'Silber' },
  schwer: { name: 'Schwer', waves: 20, hp: 1.25, sky: 0.9, leak: 1.5, medal: 'Gold' },
};
export const DIFF_IDS = Object.keys(DIFFS);
export function levelDef(i, diff = 'leicht') {
  if (i === 'endless') return { ...ENDLESS, skyK: 1, leakK: 1.25, diff: null };
  const M = LEVELS[i], D = DIFFS[diff] || DIFFS.leicht;
  const foes = [...M.foes, ...(diff !== 'leicht' && M.extra[0] ? [M.extra[0]] : []), ...(diff === 'schwer' && M.extra[1] ? [M.extra[1]] : [])];
  return { ...M, foes, waves: D.waves, hp: M.hp * D.hp, skyK: D.sky, leakK: D.leak, diff, final: diff === 'schwer' ? M.final : null, bossN: diff === 'schwer' ? 2 : 1 };
}

// ---------- Werkstatt (Gems, dauerhaft) – gleiche Knoten wie vorher, neu gedeutet ----------
export const UPGRADES = [
  { id: 'kapital', name: 'Startlicht', icon: 'coin', per: 10, max: 10, wsBase: 30, wsGrowth: 1.35 },
  { id: 'mechanik', name: 'Schnelligkeit', icon: 'gear', per: 0.03, max: 10, wsBase: 35, wsGrowth: 1.38 },
  { id: 'kaliber', name: 'Leuchtkraft', icon: 'sword', per: 0.04, max: 10, wsBase: 40, wsGrowth: 1.4 },
  { id: 'platz4', name: 'Kartenplatz 6', icon: 'plus', per: 1, max: 1, unlock: 200 },
  { id: 'kopfgeld', name: 'Schattenstaub', icon: 'chest', per: 0.06, max: 10, wsBase: 45, wsGrowth: 1.4, req: ['kapital', 2] },
  { id: 'ingenieur', name: 'Sparsamkeit', icon: 'anvil', per: 0.03, max: 5, wsBase: 70, wsGrowth: 1.5, req: ['kapital', 3] },
  { id: 'optik', name: 'Linsen', icon: 'eye', per: 0.04, max: 5, wsBase: 80, wsGrowth: 1.5, req: ['kaliber', 2] },
  { id: 'platz5', name: 'Kartenplatz 7', icon: 'plus', per: 1, max: 1, unlock: 700, req: ['platz4', 1] },
  { id: 'kasse', name: 'Himmelslicht', icon: 'trophy', per: 0.15, max: 5, wsBase: 90, wsGrowth: 1.5, req: ['kopfgeld', 2] },
  { id: 'recycling', name: 'Rückgewinnung', icon: 'up', per: 0.05, max: 4, wsBase: 80, wsGrowth: 1.6, req: ['ingenieur', 1] },
  { id: 'gemfund', name: 'Gemfund', icon: 'gem', per: 0.1, max: 10, wsBase: 60, wsGrowth: 1.4, req: ['kopfgeld', 3] },
  { id: 'notschild', name: 'Notlicht', icon: 'shield', per: 1, max: 1, unlock: 500, req: ['mechanik', 4] },
];
export const U = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

export const BOOSTERS = {
  starter: { name: 'Start-Geschenk', cost: 0, odds: { common: 100 }, hidden: true },
  basic: { name: 'Licht-Booster', cost: 80, odds: { common: 61, rare: 28, epic: 8.6, legendary: 2, mythic: 0.4 } },
  elite: { name: 'Elite-Booster', cost: 250, odds: { rare: 52, epic: 35, legendary: 11, mythic: 2 } },
};
// ---------- Level wie in PvZ2: Karten sammeln, mit Gems aufwerten ----------
export const TLV_MAX = 10;
const CARD_NEED = [0, 0, 4, 8, 15, 25, 40, 60, 90, 130, 180];
const RAR_CARDS = { common: 1, rare: 0.6, epic: 0.4, legendary: 0.25, mythic: 0.15 };
const GEM_COST = [0, 0, 10, 20, 35, 55, 80, 110, 150, 200, 260];
const RAR_GEM = { common: 1, rare: 1.2, epic: 1.5, legendary: 2, mythic: 2.5 };
export const PACK_CARDS = { common: [6, 10], rare: [3, 6], epic: [2, 4], legendary: [1, 2], mythic: [1, 1] };
export const cardsNeed = (id, toLvl) => (toLvl > TLV_MAX ? null : Math.max(1, Math.round(CARD_NEED[toLvl] * RAR_CARDS[T[id].rarity])));
export const lvlGems = (id, toLvl) => Math.round(GEM_COST[toLvl] * RAR_GEM[T[id].rarity] / 5) * 5;
export const LVL_BONUS = 0.08;
const GENERIC = { 3: { light: 0.15, name: 'Hellere Flamme' }, 7: { cost: -0.1, name: 'Leichtes Licht' } };
export const perksOf = id => ({ 3: GENERIC[3], 5: T[id].perks[5], 7: GENERIC[7], 10: T[id].perks[10] });
export function perkText(p) {
  const pc = v => `${Math.round(v * 100)} %`, parts = [];
  if (p.light) parts.push(`+${pc(p.light)} Lichtradius`); if (p.rate) parts.push(`+${pc(p.rate)} Tempo`); if (p.dmg) parts.push(`+${pc(p.dmg)} Schaden`);
  if (p.hp) parts.push(`+${pc(p.hp)} Leben`); if (p.range) parts.push(`+${pc(p.range)} Reichweite`); if (p.splash) parts.push(`+${pc(p.splash)} Fläche`);
  if (p.slow) parts.push(`+${pc(p.slow)} Verlangsamung`); if (p.pierce) parts.push(`+${p.pierce} Durchschlag`); if (p.n) parts.push(`+${p.n} Irrlicht`);
  if (p.income) parts.push(`+${pc(p.income)} Licht`); if (p.cost) parts.push(`${pc(-p.cost)} günstiger`); if (p.stun) parts.push(`+${pc(p.stun)} Betäubung`);
  if (p.ramp) parts.push('heizt stärker auf'); if (p.bDmg) parts.push(`+${pc(p.bDmg)} Schaden-Bonus`);
  return parts.join(', ');
}
// Alte Sterne-Spielstände (vor v0.10) ehrlich umrechnen
function migrateStars(id, t) {
  if (!T[id] || !t || t.lvl) return t;
  const r = T[id].rarity, avg = (PACK_CARDS[r][0] + PACK_CARDS[r][1]) / 2;
  let cards = Math.round(Math.max(0, (t.copies || 1) - 1) * avg), lvl = 1;
  while (lvl < TLV_MAX && cards >= cardsNeed(id, lvl + 1)) { cards -= cardsNeed(id, lvl + 1); lvl++; }
  return { lvl, cards, from: t.copies || 1 };
}

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

export function waveHp(L, w) {
  let m = L.hp * (1 + 0.04 * (w - 1));
  if (L.endless && w > 20) m *= Math.pow(1.06, w - 20);
  return m;
}
export const isBig = (L, w) => (L.endless ? w % 5 === 0 : w % 5 === 0 || w === L.waves);
// Wellen: Liste von {type, at, r}
export function waveGroups(L, w, li = 0) {
  const r = seeded(9001 + w * 131 + (L.endless ? 77 : li * 17));
  const big = isBig(L, w), final = !L.endless && w === L.waves;
  const pool = L.foes.filter(f => !(f === 'fresser' && w < 4) && !(f === 'reiter' && w < 3) && !(f === 'sarg' && w < 2));
  const weight = { schatten: 5, ritter: 2.4, sarg: 1.6, reiter: 1.4, motte: 1.8, fresser: 0.7, schattenling: 1.6 };
  if (L.focus) weight[L.focus] = (weight[L.focus] || 1) * 2;
  const pick = () => { const tot = pool.reduce((a, f) => a + (weight[f] || 1), 0); let x = r() * tot; for (const f of pool) { x -= weight[f] || 1; if (x <= 0) return f; } return pool[0]; };
  const n = Math.round((1.7 + w * 0.85) * (big ? 1.7 : 1));
  const G = [];
  let at = big ? 0.5 : 0;
  for (let i = 0; i < n; i++) {
    let type = i < 2 && w <= 2 ? 'schatten' : pick();
    const row = Math.floor(r() * ROWS);
    if (type === 'schattenling') { for (let k = 0; k < 3; k++) G.push({ type, at: at + k * 0.5, r: (row + k) % ROWS }); }
    else G.push({ type, at, r: row });
    at += big ? 0.55 + r() * 0.5 : 1.6 + r() * 1.6;
  }
  if (final && L.final) G.push({ type: L.final, at: at + 1, r: 2 + Math.floor(r() * 2), boss: true });
  else if (final) for (let k = 0; k < (L.bossN || 1); k++) G.push({ type: 'koloss', at: at + 1 + k * 3, r: k ? 4 : 1, boss: true });
  else if (w % 10 === 0) G.push({ type: 'koloss', at: at + 1, r: Math.floor(r() * ROWS), boss: true });
  if (L.endless && w % 20 === 0) G.push({ type: 'fuerst', at: at + 2, r: 2, boss: true });
  return G.sort((a, b) => a.at - b.at);
}

function defaultMeta() {
  return {
    v: 2, lw: 1,
    gems: 0, totalGems: 0,
    ws: Object.fromEntries(UPGRADES.map(u => [u.id, 0])),
    towers: {},
    loadout: [null, null, null, null, null, null, null],
    levels: {}, best: 0,
    runs: 0, wins: 0, kills: 0, bossKills: 0, packs: 0, built: 0, playTime: 0,
    speed: 1, lastLevel: 0, lastDiff: 'leicht',
    flags: { intro: false, gift: false },
    settings: { sfxVol: 0.5, musicVol: 0.4, musicTrack: 'mix', gfx: 'auto', shake: 'on', numbers: 'on', boosterAnim: 'show', ranges: 'on' },
  };
}
// Spielstand einlesen. Alte Tower-Defense-Stände (ohne lw) werden fair übernommen:
// jeder Turm wird zum passenden Lichtwesen mit gleichem Level und gleichen Karten; jeder bekommt Funkling + Lichtschütze.
function mergeMeta(m) {
  const d = defaultMeta();
  if (!m || m.v !== 2) return d;
  const levels = {};
  if (m.ws && m.ws.kern) { let refund = 0; for (let L = 0; L < m.ws.kern; L++) refund += Math.round(30 * Math.pow(1.35, L)); m.gems = (m.gems || 0) + refund; m.ws = { ...m.ws }; delete m.ws.kern; m.refundKern = (m.refundKern || 0) + refund; }
  for (const [k, l] of Object.entries(m.levels || {})) levels[k] = { clears: l.clears || 0, best: l.best || 0, medals: l.medals || (l.clears ? { leicht: true } : {}) };
  let towers = { ...(m.towers || {}) }, loadout = [...(m.loadout || [])];
  let lwNote = m.lwNote || null;
  if (!m.lw) {
    const moved = [];
    const nt = {};
    for (const [old, t] of Object.entries(towers)) {
      const id = ID_MAP[old] || (T[old] ? old : null);
      if (!id) continue;
      const tt = migrateStars(old in ID_MAP ? id : id, t.lvl ? t : t);
      nt[id] = tt?.lvl ? { lvl: tt.lvl, cards: tt.cards || 0, ...(tt.from ? { from: tt.from } : {}) } : { lvl: 1, cards: 0 };
      moved.push([old, id]);
    }
    const added = [];
    for (const id of STARTER) if (!nt[id]) { nt[id] = { lvl: 1, cards: 0 }; added.push(id); }
    towers = nt;
    loadout = loadout.map(x => (x ? ID_MAP[x] || (T[x] ? x : null) : null));
    for (const id of STARTER) if (!loadout.includes(id)) { const f = loadout.findIndex(x => !x); if (f >= 0 && f < 5) loadout[f] = id; else if (loadout.length < 5) loadout.push(id); }
    lwNote = { moved, added };
  }
  return { ...d, ...m, lw: 1, lwNote,
    ws: { ...d.ws, ...(m.ws || {}) },
    towers: Object.fromEntries(Object.entries(towers).filter(([id]) => T[id]).map(([id, t]) => [id, { lvl: Math.max(1, Math.min(TLV_MAX, t.lvl || 1)), cards: Math.max(0, t.cards || 0), ...(t.from ? { from: t.from } : {}) }])),
    loadout: [...loadout, null, null, null, null, null, null, null].slice(0, 7).map(x => (x && T[x] ? x : null)),
    levels, flags: { ...d.flags, ...(m.flags || {}) }, settings: { ...d.settings, ...(m.settings || {}) } };
}

// =====================================================================
export function createGame({ storage = (typeof localStorage !== 'undefined' ? localStorage : null), rng = Math.random } = {}) {
  const listeners = {};
  const on = (type, fn) => { (listeners[type] ||= new Set()).add(fn); return () => listeners[type].delete(fn); };
  const emit = (type, d) => { listeners[type]?.forEach(f => f(d)); };

  let meta = defaultMeta(), hadSave = false, slotKey = SAVE_KEY;
  try { const raw = storage?.getItem(SAVE_KEY); if (raw) { meta = mergeMeta(JSON.parse(raw)); hadSave = true; } } catch (e) { /* kein Speicher */ }
  const save = () => { try { storage?.setItem(slotKey, JSON.stringify(meta)); } catch (e) { /* egal */ } };
  if (hadSave) save();

  let uid = 1;
  const game = { t: 0, meta, run: null, towers: [], enemies: [], projectiles: [], fx: [], drops: [], on, emit, save, hadSave };

  // ----- Werkstatt -----
  const wsL = id => meta.ws[id] || 0;
  const wsP = id => wsL(id) * (U[id]?.per || 0);
  game.wsLevel = wsL; game.wsPassive = wsP;
  game.wsMax = id => U[id].max;
  game.wsMaxed = id => wsL(id) >= U[id].max;
  game.wsReqMet = id => { const r = U[id].req; return !r || wsL(r[0]) >= r[1]; };
  game.wsCost = id => { const u = U[id], L = wsL(id); if (u.unlock) return u.unlock; return Math.round(u.wsBase * Math.pow(u.wsGrowth, L)); };
  game.wsEffectText = (id, L = wsL(id)) => {
    const u = U[id], v = L * u.per, pc = x => `${Math.round(x * 100)} %`;
    switch (id) {
      case 'kapital': return `Start mit ${fmt(START_LIGHT + v)} Licht`;
      case 'mechanik': return L ? `+${pc(v)} Tempo aller Wächter` : 'Alle Wächter greifen schneller an';
      case 'kaliber': return L ? `+${pc(v)} Schaden aller Wächter` : 'Mehr Schaden für alle Wächter';
      case 'optik': return L ? `+${pc(v)} Lichtradius` : 'Alle Wächter leuchten weiter';
      case 'kopfgeld': return L ? `${pc(v)} Chance: besiegte Schatten lassen Licht fallen` : 'Besiegte Schatten lassen manchmal Licht fallen';
      case 'ingenieur': return L ? `Wächter ${pc(v)} günstiger` : 'Wächter kosten weniger Licht';
      case 'kasse': return L ? `+${pc(v)} Licht vom Himmel` : 'Mehr Licht fällt vom Himmel';
      case 'recycling': return `Wegräumen bringt ${pc(0.25 + v)} Licht zurück`;
      case 'gemfund': return L ? `+${pc(v)} Gems` : 'Mehr Gems pro Welle und Level';
      case 'platz4': return L ? '6. Kartenplatz frei' : 'Ein sechster Wächter im Loadout';
      case 'platz5': return L ? '7. Kartenplatz frei' : 'Ein siebter Wächter im Loadout';
      case 'notschild': return L ? 'Rettet die Laterne 1× pro Level (30 % Leben)' : 'Die Laterne überlebt einmal pro Level';
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
  const START_LIGHT = 150;
  const gemMult = () => 1 + wsP('gemfund');
  game.loadoutSize = () => 5 + wsL('platz4') + wsL('platz5');

  // ----- Sammlung / Level -----
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
  const perkSum = id => {
    const L = tLvl(id) || 1, P = {};
    for (const [lv, p] of Object.entries(perksOf(id))) if (L >= +lv) for (const [k, v] of Object.entries(p)) if (k !== 'name') P[k] = (P[k] || 0) + v;
    return P;
  };
  game.perkSum = perkSum;
  const lvMult = id => 1 + LVL_BONUS * (Math.max(1, tLvl(id)) - 1);
  game.owned = id => !!meta.towers[id];
  game.towerStats = id => {
    const d = T[id], P = perkSum(id), m = lvMult(id), s = { ...d };
    const dm = m * (1 + wsP('kaliber')) * (1 + (P.dmg || 0));
    if (s.dmg) s.dmg *= dm; if (s.dps) s.dps *= dm;
    if (d.kind !== 'bomb') s.hp = Math.round(d.hp * m * (1 + (P.hp || 0)));
    if (s.income) s.income = Math.round(d.income * m * (1 + (P.income || 0)));
    if (s.rate) s.rate *= (1 + (P.rate || 0)) * (1 + wsP('mechanik'));
    if (s.every) s.every /= 1 + wsP('mechanik') * 0.5;
    s.light = d.light * (1 + (P.light || 0)) * (1 + wsP('optik'));
    if (s.splash && P.splash) s.splash *= 1 + P.splash;
    if (s.range && P.range) s.range *= 1 + P.range;
    if (s.slow && P.slow) s.slow = Math.min(0.8, s.slow + P.slow);
    if (s.pierce && P.pierce) s.pierce += P.pierce;
    if (s.n && P.n) s.n += P.n;
    if (s.stun && P.stun) s.stun *= 1 + P.stun;
    if (s.ramp && P.ramp) s.ramp += P.ramp;
    if (s.bDmg) s.bDmg = d.bDmg * (1 + 0.05 * (Math.max(1, tLvl(id)) - 1)) + (P.bDmg || 0);
    return s;
  };
  game.towerCost = id => Math.round(T[id].cost * (1 - wsP('ingenieur')) * (1 + (perkSum(id).cost || 0)) / 5) * 5;
  game.towerCd = id => T[id].cd;
  game.dps = id => {
    const s = game.towerStats(id), d = T[id];
    switch (d.kind) {
      case 'flame': case 'beam': return s.dps;
      case 'tri': return s.dmg * s.rate * 3;
      case 'wisp': return s.dmg * s.rate * s.n;
      case 'moon': return s.dmg * s.rate * (1 + 0.5 * (s.pierce - 1));
      case 'farm': case 'beacon': case 'wall': return 0;
      case 'bomb': return s.dmg;
      default: return (s.dmg || 0) * (s.rate || 0);
    }
  };

  game.setLoadout = (slot, id) => {
    if (game.run || slot >= game.loadoutSize()) return false;
    if (id && !meta.towers[id]) return false;
    const other = meta.loadout.indexOf(id);
    if (id && other >= 0 && other !== slot) meta.loadout[other] = meta.loadout[slot];
    meta.loadout[slot] = id; save(); emit('loadout'); return true;
  };
  game.toggleLoadout = id => {
    if (game.run || !meta.towers[id]) return false;
    const i = meta.loadout.indexOf(id);
    if (i >= 0) { if (meta.loadout.filter(Boolean).length <= 1) return false; meta.loadout[i] = null; }
    else { const free = meta.loadout.findIndex((x, k) => !x && k < game.loadoutSize()); if (free < 0) return false; meta.loadout[free] = id; }
    save(); emit('loadout'); return true;
  };

  // ----- Booster -----
  function pickRarity(odds) {
    const total = Object.values(odds).reduce((a, b) => a + b, 0);
    let x = rng() * total;
    for (const k of Object.keys(odds)) { x -= odds[k]; if (x <= 0) return k; }
    return 'common';
  }
  function grant(def, n, rar) {
    const owned = meta.towers[def.id];
    const res = { id: def.id, def, rarity: rar, isNew: !owned, n, refund: 0 };
    if (!owned) {
      meta.towers[def.id] = { lvl: 1, cards: n - 1 };
      const free = meta.loadout.findIndex((x, k) => !x && k < game.loadoutSize());
      if (free >= 0) { meta.loadout[free] = def.id; res.placed = true; }
    } else if (owned.lvl >= TLV_MAX) { res.refund = n * 3; meta.gems += res.refund; }
    else owned.cards += n;
    res.lvl = meta.towers[def.id].lvl; res.cards = meta.towers[def.id].cards; res.need = game.cardsNeed(def.id);
    return res;
  }
  game.openBooster = kind => {
    const b = BOOSTERS[kind];
    if (!b || meta.gems < b.cost || game.run) return null;
    if (kind === 'starter' && meta.flags.gift) return null;
    meta.gems -= b.cost; meta.packs++;
    let out;
    if (kind === 'starter') { meta.flags.gift = true; out = STARTER.map(id => grant(T[id], 1, T[id].rarity)); }
    else {
      const rar = pickRarity(b.odds);
      const pool = TOWERS.filter(t => t.rarity === rar);
      const def = pool[Math.floor(rng() * pool.length)];
      const [lo, hi] = PACK_CARDS[rar];
      out = [grant(def, lo + Math.floor(rng() * (hi - lo + 1)), rar)];
    }
    save(); emit('booster', out); emit('gems');
    return out;
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
    try { const o = JSON.parse(str); const m = o && o.game === 'packfall' ? o.meta : o; if (!m || m.v !== 2 || !m.towers) return false; replaceMeta(mergeMeta(m), true); return true; }
    catch (e) { return false; }
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
  // LEVEL
  // =====================================================================
  function clearRun() { game.run = null; game.towers = []; game.enemies = []; game.projectiles = []; game.fx = []; game.drops = []; }
  const idx = (c, r) => r * COLS + c;

  game.startLevel = (li, diff = 'leicht') => {
    if (game.run || !game.levelUnlocked(li)) return false;
    if (li !== 'endless' && !DIFFS[diff]) diff = 'leicht';
    const L = levelDef(li, diff);
    clearRun();
    const blocked = new Uint8Array(COLS * ROWS);
    for (const [c, r] of L.blocks || []) blocked[idx(c, r)] = 1;
    game.run = {
      li, diff: L.diff, L, blocked, light: new Float32Array(COLS * ROWS).fill(L.ambient), lightT: 0,
      wave: 0, waves: L.waves, phase: 'prep', prepT: 12, night: false,
      licht: START_LIGHT + wsP('kapital'), coreHp: 100, coreMax: 100, shield: wsL('notschild') > 0,
      carts: Array.from({ length: ROWS }, () => ({ state: 'ready', x: -0.55 })),
      cd: Object.fromEntries(meta.loadout.filter(Boolean).map(id => [id, T[id].kind === 'bomb' || T[id].kind === 'wall' || T[id].rarity === 'legendary' || T[id].rarity === 'mythic' ? T[id].cd * 0.6 : 0])),
      queue: [], spawnT: 0, nextT: 0, skyT: 4, gems: 0, kills: 0, time: 0, earned: 0, leaked: 0, bossAlive: 0,
    };
    meta.lastLevel = li; if (L.diff) meta.lastDiff = L.diff;
    emit('runStart', game.run);
    return true;
  };

  game.unitAt = (c, r) => game.towers.find(u => u.c === c && u.r === r && !u.gone) || null;
  game.towerAt = game.unitAt;
  game.cardReady = id => (game.run?.cd[id] || 0) <= 0;
  game.placeCheck = (id, c, r) => {
    const R = game.run;
    if (!R || R.phase === 'done') return 'run';
    if (!meta.loadout.includes(id)) return 'loadout';
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS || R.blocked[idx(c, r)]) return 'cell';
    if (game.unitAt(c, r)) return 'taken';
    if ((R.cd[id] || 0) > 0) return 'cd';
    if (R.licht < game.towerCost(id)) return 'cash';
    return '';
  };
  game.place = (id, c, r) => {
    const why = game.placeCheck(id, c, r);
    if (why) return { ok: false, why };
    const R = game.run, cost = game.towerCost(id), s = game.towerStats(id);
    R.licht -= cost; R.cd[id] = T[id].cd;
    const u = { uid: uid++, id, def: T[id], c, r, x: c + 0.5, z: r + 0.5, hp: s.hp, maxHp: s.hp, s, cd: T[id].kind === 'farm' ? 4 + rng() * 2 : 0.4, st: { mode: 'idle', mt: 0 }, heat: 0, target: null, flashT: 0, buff: 0, spent: cost, born: game.t, dmgDone: 0, kills: 0 };
    if (u.def.kind === 'bomb') { u.st.mode = 'act'; u.st.mt = 0; }
    game.towers.push(u); meta.built++;
    R.lightT = 0;
    emit('place', u);
    return { ok: true, u };
  };
  game.remove = u => {
    const R = game.run; if (!R || !game.towers.includes(u)) return false;
    const back = Math.floor(u.spent * (0.25 + wsP('recycling')));
    R.licht += back; killUnit(u); emit('remove', { u, back }); return true;
  };
  function killUnit(u) { const i = game.towers.indexOf(u); if (i >= 0) game.towers.splice(i, 1); u.gone = true; if (game.run) game.run.lightT = 0; for (const e of game.enemies) if (e.eating === u) e.eating = null; }

  // ----- Licht -----
  function calcLight() {
    const R = game.run, L = R.L, A = R.night ? L.ambient * 0.6 : L.ambient, nk = R.night ? 0.85 : 1;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      let v = A;
      for (const u of game.towers) {
        const rad = u.s.light * nk * (u.def.kind === 'bomb' && u.st.mt > 0.5 ? 1.6 : 1);
        const d = Math.hypot(u.x - (c + 0.5), (u.z - (r + 0.5)) * 1.1);
        const k = 1.12 - d / rad;
        if (k > v) v = Math.min(1, k);
      }
      for (const e of game.enemies) {
        if (e.dead || !e.E.aura) continue;
        const d = Math.hypot(e.x - (c + 0.5), (e.r + 0.5 - (r + 0.5)) * 1.1);
        if (d < e.E.aura) v *= 1 - 0.75 * (1 - d / e.E.aura);
      }
      R.light[idx(c, r)] = Math.max(0, Math.min(1, v));
    }
    // Sonnenhüter-Bonus
    for (const u of game.towers) u.buff = 0;
    for (const b of game.towers) if (b.def.kind === 'beacon') for (const u of game.towers) if (u !== b && Math.hypot(u.x - b.x, u.z - b.z) <= b.s.light * 0.65) u.buff = Math.max(u.buff, b.s.bDmg);
  }
  game.lightAt = (x, r) => {
    const R = game.run; if (!R) return 1;
    if (x >= COLS) return (R.night ? R.L.ambient * 0.6 : R.L.ambient) * 0.8;
    const c = Math.max(0, Math.min(COLS - 1, Math.floor(x)));
    return R.light[idx(c, Math.max(0, Math.min(ROWS - 1, r)))];
  };
  const dmgFactor = e => 0.35 + 0.65 * game.lightAt(e.x, e.r);

  // ----- Wellen -----
  game.canCall = () => { const R = game.run; return !!R && R.phase === 'prep'; };
  game.callWave = () => { const R = game.run; if (!R || R.phase !== 'prep') return false; R.prepT = 0; return true; };
  function startWave() {
    const R = game.run;
    if (R.wave > 0) R.gems += Math.round((1 + Math.floor(R.wave / 4)) * gemMult());
    R.wave++; R.phase = 'wave';
    const G = waveGroups(R.L, R.wave, R.li === 'endless' ? 0 : R.li);
    R.queue = G; R.qTotal = G.length; R.spawnT = 0; R.nextT = 0; R.timerOn = false;
    R.hpMult = waveHp(R.L, R.wave);
    const big = isBig(R.L, R.wave), boss = G.some(q => q.boss);
    R.night = big && R.L.ambient < 0.95;
    R.lightT = 0;
    emit('waveStart', { wave: R.wave, waves: R.waves, big, boss, night: R.night });
    if (boss) emit('boss', R.wave);
  }
  function spawn(type, r, x = COLS + 0.6) {
    const R = game.run, E = ENEMIES[type];
    const hp = E.hp * (E.boss ? R.L.hp * (1 + 0.02 * (R.wave - 1)) : R.hpMult);
    const e = { uid: uid++, type, E, r, x, y: E.air ? 0.9 : 0, hp, maxHp: hp, armor: (E.armor || 0) * R.hpMult, armorMax: (E.armor || 0) * R.hpMult, shield: (E.shield || 0) * R.hpMult, shieldMax: (E.shield || 0) * R.hpMult,
      speed: E.speed * (0.92 + rng() * 0.16), slow: 0, slowT: 0, stunT: 0, mount: !!E.mount, air: !!E.air, boss: !!E.boss, dead: false, hitT: 0, eating: null,
      st: { mode: 'walk', mt: 0, seed: rng() * 6, armor: true, pole: true }, smashT: 0, summonT: 5, threw: false, seed: rng() * 6, born: game.t };
    if (e.boss) R.bossAlive++;
    game.enemies.push(e);
    emit('spawn', e);
    return e;
  }
  game.spawnTest = (type, r = 2, x) => game.run && spawn(type, r, x);

  // Schaden: Rüstung zuerst, Schild nur bei geraden Schüssen von vorn
  function damage(e, amount, src, o = {}) {
    if (e.dead || amount <= 0) return 0;
    let a = amount * (o.noLight ? 1 : dmgFactor(e)) * (1 + (src?.buff || 0));
    if (o.front && e.shield > 0) { const k = Math.min(e.shield, a); e.shield -= k; a -= k; if (e.shield <= 0) { e.st.armor = false; emit('break', e); } }
    if (a > 0 && e.armor > 0) { const k = Math.min(e.armor, a); e.armor -= k; a -= k; if (e.armor <= 0) { e.st.armor = false; emit('break', e); } }
    e.hp -= a; e.hitT = 0.12;
    if (src) src.dmgDone += amount;
    if (e.hp <= 0) kill(e, src);
    return amount;
  }
  function kill(e, src) {
    if (e.dead) return;
    e.dead = true; e.st.mode = 'die'; e.st.mt = 0; e.eating = null;
    const R = game.run;
    R.kills++; meta.kills++; if (src) src.kills++;
    if (e.boss) { R.bossAlive--; meta.bossKills++; const g = Math.round((e.type === 'fuerst' ? 40 : 10) * gemMult()); R.gems += g; emit('gems', { n: g, why: 'boss' }); }
    if (rng() < wsP('kopfgeld')) addDrop(e.x, e.r + 0.5, 15, 'kill');
    emit('kill', { e });
  }
  function addDrop(x, z, v, from) { const d = { id: uid++, x, z, y: from === 'sky' ? 5 : 1.0, ty: 0.6 + rng() * 0.3, v, t: 0, from }; game.drops.push(d); emit('drop', d); return d; }
  game.collect = id => {
    const R = game.run, i = game.drops.findIndex(d => d.id === id);
    if (!R || i < 0) return false;
    const d = game.drops[i]; game.drops.splice(i, 1); R.licht += d.v; R.earned += d.v; emit('collect', d); return true;
  };

  const inLane = (u, e, ahead = true) => e.r === u.r && !e.dead && (!ahead || e.x > u.x - 0.25) && e.x < COLS + 0.4;
  function firstInLane(u, row, air) { let b = null; for (const e of game.enemies) if (e.r === row && !e.dead && !e.jumping && (air || !e.air) && e.x > u.x - 0.25 && e.x < COLS + 0.4 && (!b || e.x < b.x)) b = e; return b; }
  const shoot = (u, row, kind, o = {}) => { game.projectiles.push({ kind, x: u.x + 0.4, y: kind === 'falcon' ? 1.0 : 0.62, r: row, z: row + 0.5, vx: 7, dmg: u.s.dmg, src: u, air: u.def.air, life: 3, ...o }); };

  function actUnit(u, dt) {
    const s = u.s, k = u.def.kind, R = game.run;
    u.st.mt += dt; u.flashT = Math.max(0, u.flashT - dt);
    if (u.st.mode === 'act' && k !== 'bomb' && k !== 'beam' && u.st.mt > (ACT[k] || 0.6)) u.st.mode = 'idle';
    u.cd -= dt;
    const trigger = () => { u.st.mode = 'act'; u.st.mt = 0; u.fired = false; };
    switch (k) {
      case 'farm':
        if (u.cd <= 0) { u.cd = s.every; trigger(); u.pending = 0.5; }
        if (u.pending != null) { u.pending -= dt; if (u.pending <= 0) { u.pending = null; addDrop(u.x, u.z, s.income, 'unit'); } }
        break;
      case 'bolt': case 'frost': case 'tri': {
        const rows = k === 'tri' ? [u.r - 1, u.r, u.r + 1].filter(r => r >= 0 && r < ROWS) : [u.r];
        const has = rows.some(r => game.enemies.some(e => e.r === r && !e.dead && e.x > u.x - 0.25 && e.x < COLS + 0.4));
        if (u.cd <= 0 && has) { u.cd = 1 / s.rate; trigger(); u.fireAt = 0.2; }
        if (u.fireAt != null && u.st.mt >= u.fireAt) { u.fireAt = null; for (const r of rows) shoot(u, r, k === 'frost' ? 'ice' : k === 'tri' ? 'prism' : 'bolt', k === 'frost' ? { slow: s.slow, slowT: s.slowT } : k === 'tri' && r !== u.r ? { dz: r - u.r } : {}); emit('shot', { u, kind: k }); }
        break;
      }
      case 'falcon': {
        const tg = firstInLane(u, u.r, true);
        if (u.cd <= 0 && tg) { u.cd = 1 / s.rate; trigger(); u.fireAt = 0.2; }
        if (u.fireAt != null && u.st.mt >= u.fireAt) { u.fireAt = null; const air = game.enemies.find(e => e.r === u.r && e.air && !e.dead && e.x > u.x - 0.25); shoot(u, u.r, 'falcon', { preferAir: !!air, vx: 8 }); emit('shot', { u, kind: k }); }
        break;
      }
      case 'lob': {
        const tg = firstInLane(u, u.r, false);
        if (u.cd <= 0 && tg) { u.cd = 1 / s.rate; trigger(); u.tg = tg; u.fireAt = 0.3; }
        if (u.fireAt != null && u.st.mt >= u.fireAt) {
          u.fireAt = null; const t = u.tg && !u.tg.dead ? u.tg : firstInLane(u, u.r, false);
          if (t) { const T0 = 0.95, tx = t.x - (t.eating || t.stunT > 0 ? 0 : t.speed * (1 - t.slow) * T0); game.projectiles.push({ kind: 'lob', x0: u.x + 0.1, x: u.x, y: 1.1, r: u.r, z: u.z, tx, t: 0, T: T0, dmg: s.dmg, splash: s.splash, src: u }); emit('shot', { u, kind: k }); }
        }
        break;
      }
      case 'flame': {
        const hit = game.enemies.filter(e => e.r === u.r && !e.dead && e.x >= u.x - 0.2 && e.x <= u.x + s.range);
        if (hit.length) { if (u.st.mode !== 'act') trigger(); u.st.mt = Math.min(u.st.mt, 0.3); u.flameT = (u.flameT || 0) - dt; if (u.flameT <= 0) { u.flameT = 0.4; for (const e of hit) damage(e, s.dps * 0.4, u); emit('shot', { u, kind: k }); } }
        break;
      }
      case 'bomb':
        if (u.st.mt >= 0.9 && !u.fired) { u.fired = true; for (const e of game.enemies) if (!e.dead && Math.abs(e.r - u.r) <= 1 && Math.abs(e.x - u.x) <= 1.55) damage(e, s.dmg, u, { noLight: true }); emit('boom', { x: u.x, z: u.z, r: 1.5, big: true }); }
        if (u.st.mt >= 1.6) killUnit(u);
        break;
      case 'lance': {
        const has = game.enemies.some(e => inLane(u, e));
        if (u.cd <= 0 && has) { u.cd = 1 / s.rate; trigger(); u.fireAt = 0.3; }
        if (u.fireAt != null && u.st.mt >= u.fireAt) { u.fireAt = null; for (const e of game.enemies) if (inLane(u, e)) damage(e, s.dmg, u); game.fx.push({ kind: 'lance', x0: u.x + 0.6, x1: COLS + 0.6, z: u.z, life: 0.3, max: 0.3 }); emit('shot', { u, kind: k }); }
        break;
      }
      case 'wisp': {
        const any = game.enemies.some(e => !e.dead && e.x < COLS + 0.3);
        if (u.cd <= 0 && any) { u.cd = 1 / s.rate; trigger(); for (let i = 0; i < s.n; i++) game.projectiles.push({ kind: 'wisp', x: u.x + 0.3, y: 1.0, z: u.z, vx: 2, vz: (i - (s.n - 1) / 2) * 1.5, vy: 1.5, dmg: s.dmg, src: u, tg: null, life: 5, delay: i * 0.15 }); emit('shot', { u, kind: k }); }
        break;
      }
      case 'beam': {
        let tg = u.target && !u.target.dead && u.target.r === u.r && u.target.x > u.x - 0.25 && u.target.x < COLS + 0.4 ? u.target : null;
        if (!tg) { tg = firstInLane(u, u.r, true); u.heat = 0; }
        u.target = tg;
        if (!tg) { u.st.mode = 'idle'; u.heat = Math.max(0, u.heat - dt * 2); u.st.heat = 0; break; }
        u.st.mode = 'act'; u.heat += dt; u.st.heat = Math.min(1, u.heat / s.rampT);
        damage(tg, s.dps * (1 + (s.ramp - 1) * Math.min(1, u.heat / s.rampT)) * dt, u, { front: true });
        break;
      }
      case 'pulse': {
        const hit = game.enemies.filter(e => !e.dead && Math.abs(e.r - u.r) <= 1 && e.x >= u.x - 0.6 && e.x <= u.x + s.range);
        if (u.cd <= 0 && hit.length) { u.cd = 1 / s.rate; trigger(); for (const e of hit) { damage(e, s.dmg, u); e.stunT = Math.max(e.stunT, s.stun * (e.boss ? 0.3 : 1)); } game.fx.push({ kind: 'pulse', x: u.x, z: u.z, r: s.range, life: 0.6, max: 0.6 }); emit('boom', { x: u.x, z: u.z, r: s.range }); }
        break;
      }
      case 'moon': {
        const has = game.enemies.some(e => inLane(u, e));
        if (u.cd <= 0 && has) { u.cd = 1 / s.rate; trigger(); u.fireAt = 0.25; }
        if (u.fireAt != null && u.st.mt >= u.fireAt) { u.fireAt = null; game.projectiles.push({ kind: 'moon', x: u.x + 0.4, y: 1.1, r: u.r, z: u.z, vx: 5.5, dmg: s.dmg, pierce: s.pierce, splash: s.splash, hit: new Set(), src: u, air: true }); emit('shot', { u, kind: k }); }
        break;
      }
      case 'star': {
        let best = null; for (const e of game.enemies) if (!e.dead && e.x < COLS + 0.2 && (!best || e.hp + e.armor + e.shield > best.hp + best.armor + best.shield)) best = e;
        if (u.cd <= 0 && best) { u.cd = 1 / s.rate; trigger(); R.strikes = R.strikes || []; R.strikes.push({ tg: best, x: best.x, r: best.r, t: 0.9, T: 0.9, dmg: s.dmg, splash: s.splash, stun: s.stun, src: u }); emit('shot', { u, kind: k }); }
        break;
      }
    }
  }

  function stepProjectiles(dt) {
    const P = game.projectiles;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.life = (p.life ?? 5) - dt;
      if (p.kind === 'lob') {
        p.t += dt; const k = Math.min(1, p.t / p.T);
        p.x = p.x0 + (p.tx - p.x0) * k; p.y = 1.1 * (1 - k) + 0.4 * k + Math.sin(k * Math.PI) * 1.7;
        if (k >= 1) { for (const e of game.enemies) if (!e.dead && !e.air && e.r === p.r && Math.abs(e.x - p.x) <= 0.35 + p.splash) damage(e, p.dmg * (Math.abs(e.x - p.x) <= 0.35 ? 1 : 0.5), p.src); game.fx.push({ kind: 'ember', x: p.x, z: p.z, life: 0.45, max: 0.45 }); emit('boom', { x: p.x, z: p.z, r: p.splash }); P.splice(i, 1); }
        continue;
      }
      if (p.kind === 'wisp') {
        if (!p.tg || p.tg.dead) { let b = null, bd = 1e9; for (const e of game.enemies) { if (e.dead || e.x > COLS + 0.3) continue; const d = Math.hypot(e.x - p.x, e.r + 0.5 - p.z); if (d < bd) { bd = d; b = e; } } p.tg = b; }
        if (!p.tg || p.life <= 0) { P.splice(i, 1); continue; }
        const tx = p.tg.x, tz = p.tg.r + 0.5, ty = p.tg.y + 0.6, dx = tx - p.x, dz = tz - p.z, dy = ty - p.y, d = Math.hypot(dx, dz, dy), sp = 5.5;
        const st = Math.min(1, dt * 4);
        p.vx += (dx / d * sp - p.vx) * st; p.vz += (dz / d * sp - p.vz) * st; p.vy += (dy / d * sp - p.vy) * st;
        p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
        if (d < 0.3) { damage(p.tg, p.dmg, p.src); game.fx.push({ kind: 'spark', x: p.x, z: p.z, y: p.y, col: 'jade', life: 0.35, max: 0.35 }); P.splice(i, 1); }
        continue;
      }
      // gerade Geschosse
      p.x += p.vx * dt;
      if (p.dz) { const want = p.r + 0.5; p.z += (want - p.z) * Math.min(1, dt * 10); }
      if (p.x > COLS + 1 || p.life <= 0) { P.splice(i, 1); continue; }
      if (p.kind === 'moon') {
        for (const e of game.enemies) {
          if (e.dead || e.r !== p.r || p.hit.has(e) || Math.abs(e.x - p.x) > 0.3) continue;
          p.hit.add(e); damage(e, p.dmg, p.src);
          if (p.hit.size >= p.pierce) { p.x = COLS + 2; break; }
        }
        if (p.x >= COLS + 1.5 || p.hit.size >= p.pierce) {
          const bx = Math.min(p.x, COLS + 0.4);
          for (const e of game.enemies) if (!e.dead && e.r === p.r && Math.abs(e.x - bx) <= p.splash) damage(e, p.dmg * 0.6, p.src);
          game.fx.push({ kind: 'moonBoom', x: bx, z: p.z, r: p.splash, life: 0.5, max: 0.5 }); emit('boom', { x: bx, z: p.z, r: p.splash }); P.splice(i, 1);
        }
        continue;
      }
      let tg = null;
      for (const e of game.enemies) {
        if (e.dead || e.r !== p.r || e.jumping || Math.abs(e.x - p.x) > 0.22) continue;
        if (e.air && !p.air) continue;
        if (p.preferAir && !e.air && game.enemies.some(o => o.air && !o.dead && o.r === p.r && o.x > p.x)) continue;
        if (!tg || e.x < tg.x) tg = e;
      }
      if (tg) {
        const mult = p.kind === 'falcon' && tg.air ? p.src.s.airMult || 1 : 1;
        damage(tg, p.dmg * mult, p.src, { front: true });
        if (p.slow && !tg.boss) { tg.slow = Math.max(tg.slow, p.slow); tg.slowT = p.slowT; } else if (p.slow) { tg.slow = Math.max(tg.slow, p.slow * 0.5); tg.slowT = p.slowT; }
        game.fx.push({ kind: 'spark', x: p.x, z: p.z, y: p.y, col: p.kind, life: 0.3, max: 0.3 });
        P.splice(i, 1);
      }
    }
  }

  function stepEnemies(dt) {
    const R = game.run;
    for (const e of game.enemies) {
      e.st.mt += dt;
      if (e.dead) continue;
      if (e.hitT > 0) e.hitT -= dt;
      e.st.flash = e.hitT > 0.06 ? 1 : 0;
      if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slow = 0; }
      if (e.stunT > 0) { e.stunT -= dt; continue; }
      // Fürst ruft Schatten
      if (e.E.summon && e.st.mode !== 'smash') {
        e.summonT -= dt;
        if (e.summonT <= 0 && e.st.mode !== 'summon') { e.st.mode = 'summon'; e.st.mt = 0; }
        if (e.st.mode === 'summon') { if (e.st.mt >= 1.2) { e.summonT = 7; e.st.mode = 'walk'; for (const r of [e.r - 1, e.r + 1]) if (r >= 0 && r < ROWS) spawn('schatten', r, e.x + 0.4); emit('summon', e); } continue; }
      }
      // Koloss wirft Schattenling
      if (e.type === 'koloss' && !e.threw && e.hp < e.maxHp * 0.5) { e.threw = true; const s2 = spawn('schattenling', e.r, Math.max(1, e.x - 3)); s2.hp = s2.maxHp = s2.maxHp * 1.5; emit('throw', e); }
      // Sprung des Nebelreiters
      if (e.jumping) {
        e.jt += dt; const k = Math.min(1, e.jt / 0.8);
        e.x = e.jx0 + (e.jx1 - e.jx0) * k; e.y = Math.sin(k * Math.PI) * 0.9;
        if (k >= 1) { e.jumping = false; e.y = 0; e.mount = false; e.st.armor = false; e.speed = 0.24; e.st.mode = 'walk'; }
        continue;
      }
      // Ziel: Motten fliegen zum hellsten Wächter, Boden-Schatten zum ersten Wächter vor ihnen
      let food = null;
      if (e.air) {
        let best = null; for (const u of game.towers) if (u.r === e.r && !u.gone && u.x < e.x + 0.1 && (!best || u.s.light > best.s.light || (u.s.light === best.s.light && u.x > best.x))) best = u;
        if (best && e.x - best.x <= 0.45) food = best;
      } else {
        for (const u of game.towers) if (u.r === e.r && !u.gone && u.def.kind !== 'bomb' && e.x - u.x <= 0.55 && e.x - u.x > -0.25) { food = u; break; }
      }
      if (food && e.mount && !e.air) { e.jumping = true; e.jt = 0; e.jx0 = e.x; e.jx1 = food.x - 0.75; e.st.mode = 'walk'; emit('jump', e); continue; }
      if (food && e.E.smash) {
        if (e.st.mode !== 'smash') { e.st.mode = 'smash'; e.st.mt = 0; }
        if (e.st.mt >= 1.0 && !e.smashed) { e.smashed = true; food.hp = 0; killUnit(food); emit('smash', { e, u: food }); }
        if (e.st.mt >= 1.3) { e.st.mode = 'walk'; e.smashed = false; }
        continue;
      }
      if (e.st.mode === 'smash') { if (e.st.mt >= 1.3) e.st.mode = 'walk'; else continue; }
      if (food) {
        if (e.st.mode !== 'eat') { e.st.mode = 'eat'; e.st.mt = 0; }
        e.eating = food; food.hp -= e.E.bite * dt; food.flashT = 0.12; food.st.flashT = 0.2;
        if (food.def.kind === 'wall') food.st.dmg = 1 - food.hp / food.maxHp;
        if (food.hp <= 0) { killUnit(food); emit('eaten', { e, u: food }); e.eating = null; }
        continue;
      }
      e.eating = null;
      if (e.st.mode !== 'walk') { e.st.mode = 'walk'; e.st.mt = 0; }
      e.x -= e.speed * (1 - e.slow) * dt;
      // Lichtwagen
      if (e.x < 0.2) { const c = R.carts[e.r]; if (c.state === 'ready') { c.state = 'go'; emit('cart', e.r); } }
      if (e.x < -0.7) {
        e.dead = true; e.leaked = true; e.st.mode = 'gone';
        if (e.boss) R.bossAlive--;
        const base = e.boss ? e.E.core * (0.4 + 0.6 * Math.max(0, e.hp / e.maxHp)) : e.E.core;
        const cd = Math.max(1, Math.round(base * (R.L.leakK || 1)));
        R.coreHp -= cd; R.leaked++;
        emit('coreHit', { e, dmg: cd });
        if (R.coreHp <= 0) {
          if (R.shield) { R.shield = false; R.coreHp = R.coreMax * 0.3; emit('shield'); }
          else { R.coreHp = 0; finish('lose'); return; }
        }
      }
    }
    // Lichtwagen fahren
    for (let r = 0; r < ROWS; r++) {
      const c = R.carts[r];
      if (c.state !== 'go') continue;
      c.x += 4.6 * dt;
      for (const e of game.enemies) if (!e.dead && e.r === r && Math.abs(e.x - c.x) < 0.45) { e.hp = 0; kill(e, null); }
      if (c.x > COLS + 1.2) c.state = 'used';
    }
    if (game.enemies.some(e => e.dead && (e.st.mode === 'gone' || e.st.mt > 1.4))) game.enemies = game.enemies.filter(e => !(e.dead && (e.st.mode === 'gone' || e.st.mt > 1.4)));
  }

  function step(dt) {
    const R = game.run;
    R.time += dt; game.t += dt;
    // Licht
    R.lightT -= dt; if (R.lightT <= 0) { R.lightT = 0.15; calcLight(); }
    // Karten laden auf
    for (const id in R.cd) if (R.cd[id] > 0) R.cd[id] = Math.max(0, R.cd[id] - dt);
    // Himmelslicht
    R.skyT -= dt;
    if (R.skyT <= 0) { R.skyT = (9 + rng() * 3) / (1 + wsP('kasse')) / (R.L.skyK || 1); addDrop(0.5 + rng() * (COLS - 1.5), 0.5 + Math.floor(rng() * ROWS), 25, 'sky'); }
    for (let i = game.drops.length - 1; i >= 0; i--) { const d = game.drops[i]; d.t += dt; if (d.from === 'sky') d.y = Math.max(d.ty, 5 - d.t * 1.3); if (d.t > 6) game.collect(d.id); }
    // Wellen
    if (R.phase === 'prep') { R.prepT -= dt; if (R.prepT <= 0) startWave(); }
    else if (R.phase === 'wave') {
      R.spawnT += dt;
      while (R.queue.length && R.queue[0].at <= R.spawnT) { const q = R.queue.shift(); spawn(q.type, q.r); }
      if (!R.queue.length) {
        const alive = game.enemies.some(e => !e.dead);
        if (!alive && R.waves !== Infinity && R.wave >= R.waves) { finish('win'); return; }
        if (R.waves === Infinity || R.wave < R.waves) {
          if (!R.timerOn) { R.nextT = isBig(R.L, R.wave) ? 22 : 16; R.timerOn = true; }
          if (!alive) { R.nextT = Math.min(R.nextT, 3); if (R.night) { R.night = false; R.lightT = 0; emit('dawn'); } }
          R.nextT -= dt;
          if (R.nextT <= 0) startWave();
        }
      }
    }
    for (const u of [...game.towers]) actUnit(u, dt);
    stepEnemies(dt);
    if (!game.run || R.phase === 'done') return;
    stepProjectiles(dt);
    if (R.strikes) for (let i = R.strikes.length - 1; i >= 0; i--) {
      const s = R.strikes[i]; s.t -= dt;
      if (s.tg && !s.tg.dead && s.t > 0.2) { s.x = s.tg.x; s.r = s.tg.r; }
      if (s.t <= 0) { for (const e of game.enemies) if (!e.dead && Math.abs(e.r - s.r) <= (s.splash > 1 ? 1 : 0) && Math.abs(e.x - s.x) <= s.splash) { damage(e, s.dmg * (e.r === s.r ? 1 : 0.5), s.src, { noLight: true }); e.stunT = Math.max(e.stunT, s.stun * (e.boss ? 0.3 : 1)); } game.fx.push({ kind: 'star', x: s.x, z: s.r + 0.5, r: s.splash, life: 0.8, max: 0.8 }); emit('boom', { x: s.x, z: s.r + 0.5, r: s.splash, big: true }); R.strikes.splice(i, 1); }
    }
    for (const f of game.fx) f.life -= dt;
    game.fx = game.fx.filter(f => f.life > 0);
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
    emit('runEnd', summary); emit('gems');
  }
  game.endRun = (reason = 'abandon') => { if (game.run && game.run.phase !== 'done') finish(reason === 'abandon' ? 'abandon' : reason); };
  game.leaveRun = () => { clearRun(); emit('leave'); };
  game.update = dt => {
    const R = game.run;
    if (!R) { game.t += dt; return; }
    if (R.phase === 'done') { game.t += dt; for (const e of game.enemies) e.st.mt += dt; for (const f of game.fx) f.life -= dt; return; }
    const total = dt * (game.paused ? 0 : (meta.speed || 1));
    const n = Math.max(1, Math.ceil(total / (1 / 45)));
    for (let i = 0; i < n && game.run && game.run.phase !== 'done'; i++) step(total / n);
  };
  game.setPaused = p => { game.paused = !!p; emit('pause', game.paused); };
  return game;
}
