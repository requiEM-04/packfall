// Packfall – glatte Vektor-Grafik: Icons, Booster-Packs, Map-Vorschauen (keine Pixel)
import { COLS, ROWS, THEMES } from './core.js?v=0.11-ca2fa47a';

// ---------- Icons (24×24, Linienstil) ----------
const S = (d, extra = '') => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
const F = (d, c) => `<path d="${d}" fill="${c}"/>`;
const ICONS = {
  back: S('M15 5l-7 7 7 7'),
  check: S('M5 12.5l4.5 4.5L19 7'),
  x: S('M6 6l12 12M18 6L6 18'),
  plus: S('M12 5v14M5 12h14'),
  play: F('M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z', 'currentColor'),
  pause: F('M7 5h3.5v14H7zM13.5 5H17v14h-3.5z', 'currentColor'),
  speed: S('M4 7l6 5-6 5V7zM12 7l6 5-6 5V7z'),
  coin: `<circle cx="12" cy="12" r="8.2" fill="#b8954f"/><circle cx="12" cy="12" r="6.2" fill="none" stroke="#e6cf93" stroke-width="1.4"/><path d="M12 8.2v7.6M9.6 10.2h4.8" stroke="#6e5427" stroke-width="1.8" stroke-linecap="round"/>`,
  gem: `<path d="M6.5 4.5h11L21 9.5 12 20 3 9.5z" fill="#6fa3b4"/><path d="M3 9.5h18M9 4.5 7.5 9.5 12 20l4.5-10.5L15 4.5" fill="none" stroke="#c9e6ee" stroke-width="1.1" stroke-linejoin="round"/><path d="M6.5 4.5h11L21 9.5H3z" fill="#a6d0dc" opacity=".55"/>`,
  licht: `<path d="M12 2.8c3.4 4.6 6.6 7.8 6.6 12a6.6 6.6 0 0 1-13.2 0c0-4.2 3.2-7.4 6.6-12z" fill="#ffd27a"/><path d="M12 6.5c2 3 3.8 5 3.8 8a3.8 3.8 0 0 1-7.6 0c0-3 1.8-5 3.8-8z" fill="#fff6dc"/>`,
  heart: `<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z" fill="#b5564c"/>`,
  shield: S('M12 3.5l7 2.6v5.4c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6.1z') + S('M9 12l2.2 2.2L15.5 10'),
  tower: S('M7 20h10M8.5 20l1-10h5l1 10M8 10h8V6.5h-1.6V8h-1.6V6.5h-1.6V8h-1.6V6.5H8z') + S('M12 3v1.5'),
  helm: S('M5 19h14M7 19v-3.5h10V19M8.5 15.5l1-4h5l1 4M10 11.5V8h4v3.5M14 9.5h5.5') + `<circle cx="12" cy="6" r="1.2" fill="currentColor"/>`,
  turret: S('M5 19h14M7 19v-3.5h10V19M8.5 15.5l1-4h5l1 4M10 11.5V8h4v3.5M14 9.5h5.5') + `<circle cx="12" cy="6" r="1.2" fill="currentColor"/>`,
  map: S('M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z M9 4.5v13M15 6.5v13'),
  sword: S('M14.5 4.5H19.5V9.5L10 19l-5-5zM7 12l5 5M4.5 19.5l2-2'),
  target: S('M12 3v4M12 17v4M3 12h4M17 12h4') + `<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>`,
  eye: S('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z') + `<circle cx="12" cy="12" r="2.8" fill="currentColor"/>`,
  flag: S('M5.5 21V4M5.5 4.5h11l-2.2 4 2.2 4h-11'),
  lock: S('M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5') + `<rect x="5" y="10.5" width="14" height="9.5" rx="2" fill="currentColor" opacity=".9"/>`,
  logout: S('M10 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h4M14.5 8l4 4-4 4M18.5 12H9.5'),
  pack: S('M6.5 3.5h11l1 3-1 1v9l1 1-1 3h-11l-1-3 1-1v-9l-1-1z') + S('M9 11.5h6M12 9v5'),
  scroll: S('M7 4.5h10.5a2 2 0 0 1 0 4H16v9.5a2 2 0 0 1-2 2H6.5a2 2 0 0 1 0-4H8V6.5a2 2 0 0 0-2-2M11 9.5h3M11 13h3'),
  skull: S('M12 3.5c-4.4 0-7.5 3-7.5 7 0 2.6 1.3 4.2 2.8 5.1V19h9.4v-3.4c1.5-.9 2.8-2.5 2.8-5.1 0-4-3.1-7-7.5-7zM10 19v-2M14 19v-2') + `<circle cx="9.2" cy="11" r="1.7" fill="currentColor"/><circle cx="14.8" cy="11" r="1.7" fill="currentColor"/>`,
  star: `<path d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.1 6-.7z" fill="currentColor"/>`,
  stern: `<path d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.1 6-.7z" fill="currentColor"/>`,
  trophy: S('M8 4.5h8v4.5a4 4 0 0 1-8 0zM8 6.5H4.5c0 3 1.5 4.5 3.7 4.8M16 6.5h3.5c0 3-1.5 4.5-3.7 4.8M12 13v3.5M8.5 20h7M9.5 20l.8-3.5h3.4l.8 3.5'),
  up: S('M12 19V6M6.5 11.5 12 6l5.5 5.5'),
  user: `<circle cx="12" cy="8" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/>` + S('M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6'),
  anvil: S('M3.5 7.5h11c0 2.5 2 3.5 6 3.5-1 2-3.5 3-6 3H9.5c-2 0-3.5-1.4-3.5-3.2M9 14l-1.5 5.5h9L15 14M3.5 7.5c0 2 1.2 3.3 2.5 3.3'),
  chart: S('M4.5 19.5h15M7 16v-4M11 16V8M15 16v-6M19 16V5'),
  gear: `<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/>` + S('M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6'),
  help: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/>` + S('M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.4') + `<circle cx="12" cy="16.8" r="1.1" fill="currentColor"/>`,
  chest: S('M4 10h16v9H4zM4 10a3.5 3.5 0 0 1 3.5-4h9A3.5 3.5 0 0 1 20 10M10.5 12.5h3v2.5h-3z'),
  crit: S('M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6'),
  bolt: `<path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z" fill="currentColor"/>`,
  sell: S('M12 4v10M8 10l4 4 4-4') + S('M5 17.5h14'),
  wave: S('M3 9c2.2 0 2.2-2 4.5-2S9.8 9 12 9s2.3-2 4.5-2S18.8 9 21 9M3 15c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.3-2 4.5-2 2.3 2 4.5 2'),
  cursor: S('M12 3v4M12 17v4M3 12h4M17 12h4'),
  medal: `<path d="M8 2.5h3l1 5-2.5 1.5zM16 2.5h-3l-1 5 2.5 1.5z" fill="currentColor" opacity=".55"/><circle cx="12" cy="15" r="6.3" fill="currentColor"/><circle cx="12" cy="15" r="4.3" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/><path d="M12 12.4l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3z" fill="rgba(0,0,0,.35)"/>`,
  calendar: S('M5 6h14v14H5zM5 10h14M9 3.5V7M15 3.5V7'),
};
export function iconSVG(name) {
  const d = ICONS[name] || ICONS.help;
  return `<svg class="kw-ic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
}

// ---------- Booster-Packs (Vektor, Folienverpackung) ----------
const PACKS = {
  starter: { a: '#8a7350', b: '#3a2f22', c: '#e2c98c', label: 'GESCHENK' },
  basic: { a: '#5b6b7a', b: '#202830', c: '#b7c9d6', label: 'TURM-BOOSTER' },
  elite: { a: '#7a5f86', b: '#2a1f30', c: '#d7bfe0', label: 'ELITE' },
  green: { a: '#5f7a64', b: '#1f2a22', c: '#bcd6c0', label: 'TURM-BOOSTER' },
  purple: { a: '#80565a', b: '#2c1c1e', c: '#e0bcbc', label: 'TURM-BOOSTER' },
};
export function packSVG(kind) {
  const p = PACKS[kind] || PACKS.basic, id = 'p' + kind;
  const crimp = y => Array.from({ length: 13 }, (_, i) => `${10 + i * 10},${y + (i % 2 ? 4 : 0)}`).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="200" viewBox="0 0 140 200">
  <defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.a}"/><stop offset=".55" stop-color="${p.b}"/><stop offset="1" stop-color="${p.a}"/></linearGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="${id}r" cx=".5" cy=".46" r=".5"><stop offset="0" stop-color="${p.c}" stop-opacity=".5"/><stop offset="1" stop-color="${p.c}" stop-opacity="0"/></radialGradient>
  </defs>
  <polygon points="6,14 ${crimp(10)} 134,14 134,186 ${crimp(190).split(' ').reverse().join(' ')} 6,186" fill="url(#${id}g)" stroke="#0b0b0d" stroke-width="2.5"/>
  <rect x="6" y="24" width="128" height="3" fill="${p.c}" opacity=".35"/><rect x="6" y="173" width="128" height="3" fill="${p.c}" opacity=".35"/>
  <circle cx="70" cy="92" r="46" fill="url(#${id}r)"/>
  <g transform="translate(70 92)" fill="none" stroke="${p.c}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <circle r="30" opacity=".5" stroke-dasharray="4 6"/>
    <path d="M-16 24h32M-12 24l3-24h18l3 24M-14 0h28v-12h-5v5h-6v-5h-6v5h-6v-5h-5z"/>
    <path d="M0 -20v-8" /><circle cy="-32" r="4" fill="${p.c}" stroke="none"/>
  </g>
  <text x="70" y="152" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-weight="900" font-size="19" letter-spacing="1.5" fill="${p.c}">PACKFALL</text>
  <text x="70" y="166" text-anchor="middle" font-family="Barlow Condensed, Arial, sans-serif" font-weight="700" font-size="9.5" letter-spacing="2.6" fill="${p.c}" opacity=".75">${p.label}</text>
  <rect x="6" y="14" width="128" height="172" fill="url(#${id}s)"/>
</svg>`;
}
export const packURL = kind => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(packSVG(kind));

// ---------- Map-Vorschau (für die Levelauswahl) ----------
export function mapPreview(L, w = 400, h = 240) {
  const c = document.createElement('canvas');
  const dpr = 2; c.width = w * dpr; c.height = h * dpr;
  const x = c.getContext('2d'); x.scale(dpr, dpr);
  const TH = THEMES[L.theme] || THEMES.gasse;
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, TH.sky[0]); g.addColorStop(1, TH.sky[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const ox = w * 0.16, oy = h * 0.14, cw = (w * 0.76) / COLS, ch = (h * 0.76) / ROWS;
  const blk = new Map((L.blocks || []).map(b => [b[1] * COLS + b[0], b[2]]));
  for (let r = 0; r < ROWS; r++) for (let q = 0; q < COLS; q++) {
    x.fillStyle = TH.tile[(r + q) % 2]; x.fillRect(ox + q * cw, oy + r * ch, cw + 0.5, ch + 0.5);
    const b = blk.get(r * COLS + q), cx = ox + (q + 0.5) * cw, cy = oy + (r + 0.5) * ch;
    if (b === 'pool') { x.fillStyle = '#10201a'; x.beginPath(); x.ellipse(cx, cy, cw * 0.42, ch * 0.38, 0, 0, 7); x.fill(); }
    else if (b === 'crystal') { x.fillStyle = '#5a3a8a'; x.beginPath(); x.moveTo(cx, cy - ch * 0.38); x.lineTo(cx + cw * 0.2, cy + ch * 0.3); x.lineTo(cx - cw * 0.2, cy + ch * 0.3); x.fill(); }
    else if (b) { x.fillStyle = '#6a6862'; x.beginPath(); x.roundRect(cx - cw * 0.24, cy - ch * 0.36, cw * 0.48, ch * 0.66, 4); x.fill(); }
  }
  // Dunkelheit je nach Lichtstärke der Map, rechts dunkler
  const dk = x.createLinearGradient(ox, 0, ox + cw * COLS, 0); const a = 1 - (L.ambient ?? 1);
  dk.addColorStop(0, `rgba(8,6,20,${a * 0.5})`); dk.addColorStop(1, `rgba(8,6,20,${Math.min(0.85, a * 0.85 + 0.1)})`);
  x.fillStyle = dk; x.fillRect(ox, oy, cw * COLS, ch * ROWS);
  x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1;
  for (let q = 1; q < COLS; q++) { x.beginPath(); x.moveTo(ox + q * cw, oy); x.lineTo(ox + q * cw, oy + ch * ROWS); x.stroke(); }
  // Schattennebel rechts
  const fg = x.createLinearGradient(ox + cw * COLS - 10, 0, w, 0); fg.addColorStop(0, 'rgba(60,30,90,0)'); fg.addColorStop(1, 'rgba(60,30,90,.6)'); x.fillStyle = fg; x.fillRect(ox + cw * COLS - 10, 0, w, h);
  for (let r = 0; r < ROWS; r++) { x.fillStyle = 'rgba(255,90,60,.8)'; x.beginPath(); x.arc(w - 14, oy + (r + 0.5) * ch, 2.2, 0, 7); x.fill(); }
  // Lichtherz links
  const hx = ox * 0.5, hy = h / 2, hg = x.createRadialGradient(hx, hy, 0, hx, hy, h * 0.45); hg.addColorStop(0, 'rgba(255,230,170,.75)'); hg.addColorStop(1, 'rgba(255,230,170,0)');
  x.fillStyle = hg; x.fillRect(0, 0, ox * 1.5, h);
  x.fillStyle = '#fff3d0'; x.beginPath(); x.moveTo(hx, hy - 22); x.lineTo(hx + 12, hy - 4); x.lineTo(hx, hy + 22); x.lineTo(hx - 12, hy - 4); x.closePath(); x.fill();
  return c.toDataURL('image/png');
}
