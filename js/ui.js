// Packfall – Oberfläche: Hauptmenü (wie Pokélings), Unterseiten, Run-HUD, Booster öffnen, Willkommen
import { UPGRADES, U, G, GUARDIANS, ENEMY_TYPES, RARITIES, BOOSTERS, REALMS, realmOf, fmt, fmtNum, WS_MAX } from './core.js';

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Werkstatt-Baum: Positionen in Prozent
const TREE = {
  schaden: [27, 16], tempo: [27, 39], panzer: [27, 62], zeiger: [27, 85],
  krit: [52, 16], magnet: [52, 39], regen: [52, 62],
  start: [77, 28], gemfund: [77, 50],
};
const ROOT = [6, 50];

const ENEMY_INFO = {
  krabbler: { desc: 'Kriecht stur auf den Turm zu. Kommt in Massen.', from: 1 },
  flitzer: { desc: 'Schnell und zerbrechlich, flattert über alles hinweg.', from: 3 },
  brocken: { desc: 'Langsamer Steinkoloss mit sehr viel Leben.', from: 6 },
  boss: { desc: 'Kommt jede 10. Welle. Hart, aber bringt viele Gems.', from: 10 },
};

const PATCH = [
  ['v0.3', 'Neues Hauptmenü, Werkstatt-Baum, Maus-Schlag, Start-Geschenk, Konten (Cloud)'],
  ['v0.2', 'Booster-Stil: düstere Pixel-Arena mit Turm und Helden'],
  ['v0.1', 'Erster Prototyp: Runs, Münzen, Gems, Booster'],
];

export function createUI(root, game, skin, { audio, cloud } = {}) {
  const ic = n => skin.icon(n);
  const sfx = (n, a) => audio?.play(n, a);
  const el = document.createElement('div');
  el.className = `kw s-${skin.name}`;
  el.innerHTML = `
    <section class="kw-stage" aria-label="Arena">
      <div class="kw-hud run-only">
        <div class="kw-cur" title="Gems – bleiben dauerhaft">${ic('gem')}<b data-k="gems">0</b></div>
        <div class="kw-cur kw-cur-coin" title="Münzen – nur in diesem Run">${ic('coin')}<b data-k="coins">0</b></div>
        <div class="kw-hp" title="Turm-Leben"><span class="kw-bar"><i data-k="hpbar"></i></span><b data-k="hp"></b></div>
      </div>
      <div class="kw-strip run-only" data-k="strip" role="group" aria-label="Run-Shop"></div>
      <div class="kw-tip" data-k="tip" hidden></div>
      <div class="kw-tr run-only" data-k="tr"></div>
      <div class="kw-wave run-only" data-k="wavebox"></div>
      <div class="kw-banner" data-k="banner" aria-live="polite"><b></b><small></small></div>
      <div class="kw-hitflash" data-k="hitflash"></div>
    </section>
    <div class="kw-menu" data-k="menu"></div>
    <div class="kw-screen" data-k="screen" hidden></div>
    <div class="kw-ov kw-bo" data-k="bo" hidden>
      <div class="kw-bo-flash" data-k="boflash"></div>
      <div class="kw-bo-in">
        <p class="kw-bo-title" data-k="botitle"></p>
        <button type="button" class="kw-pack" data-k="pack" aria-label="Booster aufreißen">
          <span class="kw-pack-art" data-k="packart"></span>
          <span class="kw-pack-top"></span>
        </button>
        <p class="kw-pack-hint" data-k="packhint">Antippen zum Aufreißen</p>
        <div class="kw-cards" data-k="cards"></div>
        <div class="kw-bo-act">
          <button type="button" class="kw-btn" data-k="boall">Alle aufdecken</button>
          <button type="button" class="kw-btn kw-btn-primary" data-k="boclose">Weiter</button>
        </div>
      </div>
    </div>
    <div class="kw-ov kw-sum" data-k="sum" hidden>
      <div class="kw-box kw-sum-in" role="dialog" aria-labelledby="kwSumTitle">
        <h2 id="kwSumTitle">Der Turm ist gefallen</h2>
        <p class="kw-sum-wave" data-k="sumwave"></p>
        <dl class="kw-sum-list" data-k="sumlist"></dl>
        <button type="button" class="kw-btn kw-btn-primary" data-k="sumclose">Zur Basis</button>
      </div>
    </div>
    <div class="kw-ov kw-intro" data-k="intro" hidden></div>
    <div class="kw-toast" data-k="toast" role="status"></div>
    <div class="kw-open" data-k="open" data-phase="load">
      <div class="kw-load">
        <div class="kw-logo kw-logo-sm" aria-hidden="true"><span>PACK</span><span>FALL</span></div>
        <div class="kw-box kw-loadbox">
          <div class="kw-loadrow"><b data-k="loadlbl">Baue die Welt auf …</b><span data-k="loadpct">0 %</span></div>
          <div class="kw-loadbar"><i data-k="loadbar"></i></div>
        </div>
        <p class="kw-loadtip" data-k="loadtip"></p>
      </div>
      <div class="kw-scene" aria-live="polite">
        <span class="kw-lb-top"></span><span class="kw-lb-bot"></span>
        <p class="kw-il" style="--d:.3s">Die Nacht ist über das Land gefallen …</p>
        <p class="kw-il" style="--d:2.1s">Monster ziehen zum letzten Turm.</p>
        <p class="kw-il" style="--d:3.9s">Nur Helden aus Boostern können ihn noch halten.</p>
        <button type="button" class="kw-skip" data-k="skip">Überspringen ▸</button>
      </div>
      <div class="kw-title">
        <h1 class="kw-logo kw-logo-xl" aria-label="Packfall"><span>PACK</span><span>FALL</span></h1>
        <p class="kw-ribbon">Booster öffnen · Helden sammeln · Turm halten</p>
        <button type="button" class="kw-press" data-k="press">Drücke Start</button>
        <p class="kw-legal">Prototyp v0.3 · Spielstand wird automatisch gespeichert</p>
      </div>
    </div>`;
  root.appendChild(el);

  const k = name => el.querySelector(`[data-k="${name}"]`);
  const E = {};
  ['gems', 'coins', 'hp', 'hpbar', 'strip', 'tip', 'tr', 'wavebox', 'banner', 'hitflash', 'menu', 'screen', 'bo', 'boflash', 'botitle', 'pack', 'packart', 'packhint', 'cards', 'boall', 'boclose', 'sum', 'sumwave', 'sumlist', 'sumclose', 'intro', 'toast', 'open', 'loadlbl', 'loadpct', 'loadbar', 'loadtip', 'skip', 'press'].forEach(n => { E[n] = k(n); });
  const stage = el.querySelector('.kw-stage');

  let screen = null;          // offene Unterseite
  let wsSel = 'schaden';      // gewählter Knoten im Werkstatt-Baum
  let selSlot = 0;
  let resetArm = 0;
  let abandonArm = 0;
  let tipId = null;
  let lbRows = null, lbMsg = '', lbT = 0;
  const last = {};
  let renderT = 0;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  const restartAnim = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };
  const set = (key, node, html) => { if (last[key] !== html) { node.innerHTML = html; last[key] = html; return true; } return false; };
  const costHTML = (icon, v) => `${ic(icon)}<span>${fmt(v)}</span>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Toast & Banner ----------
  let toastT = null;
  function toast(msg) {
    E.toast.textContent = msg;
    restartAnim(E.toast, 'show');
    clearTimeout(toastT);
    toastT = setTimeout(() => E.toast.classList.remove('show'), 2600);
  }
  function banner(big, small = '', variant = '') {
    E.banner.querySelector('b').textContent = big;
    E.banner.querySelector('small').textContent = small;
    E.banner.dataset.variant = variant;
    restartAnim(E.banner, 'show');
  }

  // =====================================================================
  // RUN-HUD
  // =====================================================================
  const RUN_ORDER = ['schaden', 'tempo', 'panzer', 'zeiger', 'regen', 'krit', 'magnet'];
  function stripHTML() {
    const r = game.run;
    return RUN_ORDER.map(id => {
      const u = U[id];
      const L = game.wsLevel(id);
      if (!L) return `<button type="button" class="kw-cell is-locked" data-id="${id}" aria-label="${u.name}: in der Werkstatt freischalten">${ic('lock')}<span class="kw-cell-lv">—</span></button>`;
      const lv = game.runLevel(id), max = game.runMax(id), maxed = lv >= max, cost = game.runCost(id), can = !maxed && r.coins >= cost;
      return `<button type="button" class="kw-cell${can ? ' can' : ''}${maxed ? ' is-max' : ''}" data-act="buyRun" data-id="${id}" aria-label="${u.name}, Stufe ${lv} von ${max}${maxed ? ', voll' : `, kostet ${cost} Münzen`}">
        <span class="kw-cell-ic">${ic(u.icon)}</span>
        <span class="kw-cell-lv">${lv}/${max}</span>
        <span class="kw-cell-cost">${maxed ? 'MAX' : costHTML('coin', cost)}</span>
      </button>`;
    }).join('');
  }
  function tipHTML(id) {
    const u = U[id];
    const L = game.wsLevel(id);
    if (!L) return `<b>${u.name}</b><small>Gesperrt – in der Werkstatt freischalten.</small>`;
    const lv = game.runLevel(id), max = game.runMax(id);
    return `<b>${u.name}</b><small>Jetzt: ${lv ? game.runEffectText(id) : 'nichts'}</small>${lv < max ? `<em>Nächste Stufe: ${game.runEffectText(id, lv + 1)}</em>` : '<em>Max. Stufe für diesen Run</em>'}`;
  }
  function placeTip() {
    if (!tipId) { E.tip.hidden = true; return; }
    const cell = E.strip.querySelector(`[data-id="${tipId}"]`);
    if (!cell) { E.tip.hidden = true; return; }
    set('tip', E.tip, tipHTML(tipId));
    E.tip.hidden = false;
    const sr = stage.getBoundingClientRect(), cr = cell.getBoundingClientRect(), tr = E.tip.getBoundingClientRect();
    const vertical = E.strip.getBoundingClientRect().height > E.strip.getBoundingClientRect().width;
    let x, y;
    if (vertical) { x = cr.right - sr.left + 8; y = cr.top - sr.top + cr.height / 2 - tr.height / 2; }
    else { x = cr.left - sr.left + cr.width / 2 - tr.width / 2; y = cr.top - sr.top - tr.height - 8; }
    x = Math.max(6, Math.min(sr.width - tr.width - 6, x)); y = Math.max(6, Math.min(sr.height - tr.height - 6, y));
    E.tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }
  E.strip.addEventListener('pointerover', e => { const c = e.target.closest('.kw-cell'); if (c && e.pointerType !== 'touch') { tipId = c.dataset.id; placeTip(); } });
  E.strip.addEventListener('pointerleave', () => { tipId = null; placeTip(); });
  E.strip.addEventListener('focusin', e => { const c = e.target.closest('.kw-cell'); if (c) { tipId = c.dataset.id; placeTip(); } });
  E.strip.addEventListener('focusout', () => { tipId = null; placeTip(); });

  function trHTML() {
    const s = game.meta.speed || 1;
    return `<div class="kw-seg" role="group" aria-label="Spieltempo">${[1, 2, 3].map(v => `<button type="button" data-act="speed" data-v="${v}" aria-pressed="${s === v}">${v}×</button>`).join('')}</div>
      <button type="button" class="kw-btn kw-btn-sm${abandonArm > Date.now() ? ' is-warn' : ''}" data-act="abandon">${ic('flag')}<span>${abandonArm > Date.now() ? 'Wirklich?' : 'Aufgeben'}</span></button>`;
  }
  function waveHTML() {
    const r = game.run;
    const w = Math.max(1, r.wave);
    const toBoss = 10 - (w % 10);
    const bossLine = r.boss ? '<small class="is-boss">Boss-Welle!</small>' : `<small>Boss in ${toBoss === 10 ? 10 : toBoss} ${toBoss === 1 ? 'Welle' : 'Wellen'}</small>`;
    return `<b>Welle ${w}</b><span>Reich ${realmOf(w) + 1} · ${REALMS[realmOf(w)].name}</span>${bossLine}<small>Rekord: Welle ${game.meta.best}</small>`;
  }

  // =====================================================================
  // HAUPTMENÜ
  // =====================================================================
  function playerName() { return cloud?.st?.status === 'online' ? cloud.st.name : 'Gast'; }
  function wsAvailable() {
    return UPGRADES.filter(u => !game.wsMaxed(u.id) && game.wsReqMet(u.id) && game.meta.gems >= game.wsCost(u.id)).length;
  }
  function menuHTML() {
    const m = game.meta;
    const owned = Object.keys(m.cards).length;
    const can = game.canStart();
    const affordable = Object.entries(BOOSTERS).some(([kk, b]) => !b.hidden && m.gems >= b.cost);
    const giftOpen = !m.flags.gift;
    const avail = wsAvailable();
    const realm = realmOf(Math.max(1, m.best));
    const mb = (act, v, icon, title, sub, extra = '') => `<button type="button" class="kw-mi${act === 'start' ? ' is-primary' : ''}${act === 'start' && !can ? ' is-off' : ''}" data-act="${act}" ${v ? `data-v="${v}"` : ''}>
      <span class="kw-mi-ic">${ic(icon)}</span><span class="kw-mi-tx"><b>${title}</b><small>${sub}</small></span>${extra}</button>`;
    const badge = t => `<span class="kw-mi-badge">${t}</span>`;
    const lb = lbRows
      ? (lbRows.length ? lbRows.map((r, i) => `<li class="${r.me ? 'is-me' : ''}"><span class="kw-lb-n">${i + 1}</span><span class="kw-lb-name">${esc(r.name)}</span><span class="kw-lb-v">Welle ${r.best_wave}</span><small>${fmt(r.total_gems)} Gems · ${r.heroes || 0} Helden</small></li>`).join('') : '<li class="kw-lb-empty">Noch niemand eingetragen. Sei der Erste!</li>')
      : `<li class="is-me"><span class="kw-lb-n">1</span><span class="kw-lb-name">${esc(playerName())}</span><span class="kw-lb-v">Welle ${m.best}</span><small>${fmt(m.totalGems)} Gems · ${owned} Helden</small></li>`;
    return `<div class="kw-menu-in">
      <aside class="kw-box kw-side kw-side-l">
        <h3>${ic('flag')} Fortschritt</h3>
        <dl class="kw-kv">
          <div><dt>Rekord</dt><dd>Welle ${m.best}</dd></div>
          <div><dt>Reich</dt><dd>${REALMS[realm].name}</dd></div>
          <div><dt>Nächster Boss</dt><dd>Welle ${Math.floor(m.best / 10) * 10 + 10}</dd></div>
          <div><dt>Helden</dt><dd>${owned}/${GUARDIANS.length}</dd></div>
        </dl>
        <h3>${ic('trophy')} Herausforderungen</h3>
        <div class="kw-chal"><div><b>Täglicher Run</b><small>Gleiche Wellen für alle · eigene Bestenliste</small></div><span class="kw-soon">Bald</span></div>
        <div class="kw-chal"><div><b>Wochen-Herausforderung</b><small>Feste Regeln · 3 Versuche pro Woche</small></div><span class="kw-soon">Bald</span></div>
      </aside>
      <main class="kw-center">
        <h1 class="kw-logo" aria-label="Packfall"><span>PACK</span><span>FALL</span></h1>
        <p class="kw-ribbon">Booster öffnen · Helden sammeln · Turm halten</p>
        <div class="kw-pbar">
          <span>${ic('user')}<b>${esc(playerName())}</b></span>
          <span>${ic('gem')}<b>${fmt(m.gems)}</b></span>
          <span>${ic('trophy')}<b>${m.best}</b></span>
          <span>${ic('helm')}<b>${owned}/${GUARDIANS.length}</b></span>
        </div>
        <nav class="kw-box kw-mm" aria-label="Hauptmenü">
          ${mb('start', '', 'sword', 'Kämpfen', can ? `Neuer Run · Reich 1 · ${m.best ? `Rekord Welle ${m.best}` : 'Welle 1'}` : 'Öffne zuerst dein Start-Geschenk')}
          ${mb('open', 'booster', 'pack', 'Booster-Laden', giftOpen ? 'Ein Geschenk wartet auf dich!' : 'Helden-Booster · Elite-Booster', giftOpen ? badge('Geschenk') : affordable ? badge('!') : '')}
          ${mb('open', 'werkstatt', 'anvil', 'Werkstatt', `Upgrade-Baum · ${avail ? `${avail} Ausbau${avail === 1 ? '' : 'ten'} möglich` : 'dauerhafte Verbesserungen'}`, avail ? badge(avail) : '')}
          ${mb('open', 'helden', 'helm', 'Helden', `Sammlung ${owned}/${GUARDIANS.length} · Aufstellung`)}
          ${mb('open', 'bestiarium', 'skull', 'Bestiarium', '4 Gegnerarten · Schattenfürst')}
          ${mb('open', 'statistik', 'chart', 'Statistik', `${fmt(m.runs)} Runs · ${fmt(m.kills)} Gegner besiegt`)}
          ${mb('open', 'einstellungen', 'gear', 'Einstellungen', `Anleitung · Sound · Grafik · ${cloud?.st?.status === 'online' ? 'Abmelden' : 'Login'}`)}
        </nav>
        <p class="kw-loc">${ic('tower')} Reich ${realm + 1} · ${REALMS[realm].name}</p>
      </main>
      <aside class="kw-box kw-side kw-side-r">
        <h3>${ic('trophy')} Bestenliste</h3>
        <ol class="kw-lb">${lb}</ol>
        <p class="kw-note">${lbRows ? 'Aktualisiert sich jede Minute.' : (lbMsg || 'Online-Bestenliste mit Konto auf der echten Spielseite.')}</p>
        <button type="button" class="kw-btn kw-btn-sm" data-act="open" data-v="konto">${ic('user')}<span>${cloud?.st?.status === 'online' ? 'Konto' : 'Einloggen / Registrieren'}</span></button>
      </aside>
    </div>`;
  }

  async function refreshBoard() {
    if (!cloud?.configured()) { lbRows = null; lbMsg = ''; return; }
    const r = await cloud.board();
    if (r.ok) { lbRows = r.rows.map(x => ({ ...x, me: cloud.st.status === 'online' && x.name === cloud.st.name })); lbMsg = ''; }
    else { lbRows = null; lbMsg = r.msg; }
  }

  // Tastatur im Menü (wie Pokémon)
  E.menu.addEventListener('keydown', e => {
    const items = [...E.menu.querySelectorAll('.kw-mi')];
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); items[(i + 1) % items.length].focus(); sfx('nav'); }
    if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); sfx('nav'); }
  });
  E.menu.addEventListener('pointerover', e => { const b = e.target.closest('.kw-mi'); if (b && b !== E.menu._hov) { E.menu._hov = b; sfx('nav'); } });

  // =====================================================================
  // UNTERSEITEN
  // =====================================================================
  const TITLES = { booster: ['pack', 'Booster-Laden'], werkstatt: ['anvil', 'Werkstatt'], helden: ['helm', 'Helden'], bestiarium: ['skull', 'Bestiarium'], statistik: ['chart', 'Statistik'], einstellungen: ['gear', 'Einstellungen'], konto: ['user', 'Konto'] };
  const STATIC = new Set(['konto', 'einstellungen']); // nicht ständig neu zeichnen (Eingabefelder)

  function shopHTML() {
    const m = game.meta;
    const cells = [];
    if (!m.flags.gift) {
      cells.push(`<div class="kw-shopcell is-gift">
        <div class="kw-price is-free">Gratis</div>
        <div class="kw-shopimg">${skin.packArt('starter')}</div>
        <b>Start-Geschenk</b><small>3 Helden zum Start · garantiert 1× Selten</small>
        <button type="button" class="kw-btn kw-btn-primary" data-act="booster" data-v="starter">Öffnen</button></div>`);
    }
    Object.entries(BOOSTERS).filter(([, b]) => !b.hidden).forEach(([kind, b]) => {
      const can = m.gems >= b.cost;
      cells.push(`<div class="kw-shopcell k-${kind}">
        <div class="kw-price">${costHTML('gem', b.cost)}</div>
        <div class="kw-shopimg">${skin.packArt(kind)}</div>
        <b>${b.name}</b><small>${b.cards} Karten${b.guarantee ? ' · mind. 1× Episch' : ''}</small>
        <ul class="kw-odds">${Object.entries(b.odds).map(([r, v]) => `<li style="--rc:${RARITIES[r].color}"><span>${RARITIES[r].name}</span><span>${v} %</span></li>`).join('')}<li class="foil"><span>Glanz</span><span>${Math.round(b.foil * 100)} %</span></li></ul>
        <button type="button" class="kw-btn${can ? ' kw-btn-primary' : ''}" data-act="booster" data-v="${kind}"${can ? '' : ' aria-disabled="true"'}>${can ? 'Öffnen' : `Fehlen ${fmt(b.cost - m.gems)}`}</button></div>`);
    });
    return `<div class="kw-shop">${cells.join('')}</div>
      <p class="kw-hint">Doppelte Karte = +1 Stufe (max. 10, je +25 % Schaden). Glanz-Karten machen dauerhaft +50 % Schaden.</p>
      <button type="button" class="kw-link" data-act="testgems">+300 Gems zum Testen (nur im Prototyp)</button>`;
  }

  function treeHTML() {
    const lines = [];
    const nodes = [`<div class="kw-node is-root" style="left:${ROOT[0]}%;top:${ROOT[1]}%" aria-hidden="true">${ic('tower')}</div>`];
    const elbow = (a, b) => { const mx = (a[0] + b[0]) / 2; return `M${a[0]} ${a[1]} H${mx} V${b[1]} H${b[0]}`; };
    UPGRADES.forEach(u => {
      const pos = TREE[u.id]; if (!pos) return;
      const parent = u.req ? TREE[u.req[0]] : ROOT;
      const met = game.wsReqMet(u.id);
      lines.push(`<path d="${elbow(parent, pos)}" class="${met ? 'on' : ''}"/>`);
      const L = game.wsLevel(u.id);
      const maxed = game.wsMaxed(u.id);
      const can = met && !maxed && game.meta.gems >= game.wsCost(u.id);
      const cls = `kw-node${L ? ' is-owned' : ''}${!met ? ' is-blocked' : ''}${can ? ' can' : ''}${maxed ? ' is-max' : ''}${wsSel === u.id ? ' is-sel' : ''}`;
      nodes.push(`<button type="button" class="${cls}" style="left:${pos[0]}%;top:${pos[1]}%" data-act="selWs" data-id="${u.id}" aria-label="${u.name}, Stufe ${L} von ${WS_MAX}" aria-pressed="${wsSel === u.id}">
        ${ic(!met ? 'lock' : u.icon)}<span class="kw-node-lv">${L}</span></button>`);
    });
    const u = U[wsSel];
    const L = game.wsLevel(wsSel), maxed = game.wsMaxed(wsSel), met = game.wsReqMet(wsSel), cost = game.wsCost(wsSel);
    const can = met && !maxed && game.meta.gems >= cost;
    const req = u.req ? `Benötigt: ${U[u.req[0]].name} Stufe ${u.req[1]}` : '';
    const detail = `<div class="kw-box kw-detail">
      <div class="kw-detail-ic">${ic(u.icon)}</div>
      <div class="kw-detail-tx">
        <b>${u.name} <span>Stufe ${L}/${WS_MAX}</span></b>
        <small>${game.wsEffectText(wsSel)}</small>
        ${!maxed ? `<em>${L === 0 ? `Freischalten: ${u.run ? 'erscheint im Run-Shop' : 'dauerhafter Bonus'}` : `Nächste: ${game.wsEffectText(wsSel, L + 1)}`}</em>` : '<em>Voll ausgebaut</em>'}
        ${!met ? `<small class="is-warn">${req}</small>` : ''}
      </div>
      <button type="button" class="kw-btn${can ? ' kw-btn-primary' : ''}" data-act="buyWs" data-id="${wsSel}"${can ? '' : ' aria-disabled="true"'}>${maxed ? 'Maximal' : `${L === 0 ? 'Freischalten' : 'Ausbauen'} · ${costHTML('gem', cost)}`}</button>
    </div>`;
    return `<p class="kw-hint">Gems bleiben für immer. Freigeschaltete Upgrades kannst du im Run mit Münzen kaufen – bis zur Max. Stufe, die du hier ausbaust.</p>
      <div class="kw-box kw-tree"><svg class="kw-tree-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines.join('')}</svg>${nodes.join('')}</div>
      ${detail}`;
  }

  function heroesHTML() {
    const m = game.meta;
    const owned = Object.keys(m.cards).length;
    const slots = m.lineup.map((id, i) => {
      const d = id && G[id], c = id && m.cards[id];
      const inner = d
        ? `<span class="kw-sart">${skin.cardArt(d, { foil: c.foil })}</span><b>${d.name}</b><small>St. ${c.lvl}${c.foil ? ' · Glanz' : ''}</small>`
        : `<span class="kw-sart is-empty">${ic('plus')}</span><b>Frei</b><small>Platz ${i + 1}</small>`;
      return `<button type="button" class="kw-slot${d ? ` r-${d.rarity}` : ' is-empty'}${selSlot === i ? ' is-sel' : ''}" ${d ? `style="--rc:${RARITIES[d.rarity].color}"` : ''} data-act="slot" data-v="${i}" aria-pressed="${selSlot === i}">${inner}</button>`;
    }).join('');
    const coll = GUARDIANS.map(d => {
      const c = m.cards[d.id];
      if (!c) return `<div class="kw-hcell is-unknown" style="--rc:${RARITIES[d.rarity].color}"><div class="kw-price is-rar">${RARITIES[d.rarity].name}</div><span class="kw-hart">${skin.cardArt(d, { unknown: true })}</span><b>???</b><small>Noch nicht gefunden</small></div>`;
      const st = game.cardStats(d.id);
      const inSlot = m.lineup.indexOf(d.id);
      return `<button type="button" class="kw-hcell${c.foil ? ' foil' : ''}${inSlot >= 0 ? ' in-lineup' : ''}" style="--rc:${RARITIES[d.rarity].color}" data-act="assign" data-id="${d.id}">
        <div class="kw-price is-rar">St. ${c.lvl}${c.foil ? ' · Glanz' : ''}</div>
        <span class="kw-hart">${skin.cardArt(d, { foil: c.foil })}</span>
        <b>${d.name}</b><small>${d.kind === 'beam' ? `${fmtNum(st.dps)} Schaden/s` : `${fmtNum(st.dmg)} Schaden · ${fmtNum(d.rate)}/s`}</small>
        ${inSlot >= 0 ? `<span class="kw-hslot">Platz ${inSlot + 1}</span>` : ''}</button>`;
    }).join('');
    return `<section><h3 class="kw-h3">Aufstellung</h3><p class="kw-hint">Platz wählen, dann unten einen Helden antippen.</p><div class="kw-slots">${slots}</div></section>
      <section><h3 class="kw-h3">Sammlung <span>${owned}/${GUARDIANS.length}</span></h3><div class="kw-hgrid">${coll}</div></section>`;
  }

  function bestiaryHTML() {
    return `<div class="kw-bgrid">${Object.entries(ENEMY_TYPES).map(([id, T]) => `<div class="kw-box kw-bcell${id === 'boss' ? ' is-boss' : ''}">
      <span class="kw-bart">${skin.enemyArt ? skin.enemyArt(id) : ''}</span>
      <div><b>${T.name}</b><small>${ENEMY_INFO[id].desc}</small>
      <ul class="kw-bstats"><li><span>Leben</span><span>×${fmtNum(T.hp)}</span></li><li><span>Tempo</span><span>${T.speed}</span></li><li><span>Turmschaden</span><span>${T.dmg}</span></li><li><span>Ab Welle</span><span>${ENEMY_INFO[id].from}</span></li></ul></div></div>`).join('')}</div>`;
  }

  function statsHTML() {
    const m = game.meta;
    const h = Math.floor((m.playTime || 0) / 3600), mi = Math.floor(((m.playTime || 0) % 3600) / 60);
    const cells = [
      ['Rekord', `Welle ${m.best}`], ['Runs', fmt(m.runs)], ['Gegner besiegt', fmt(m.kills)], ['Bosse besiegt', fmt(m.bossKills || 0)],
      ['Gems gesammelt', fmt(m.totalGems)], ['Booster geöffnet', fmt(m.packs)], ['Helden', `${Object.keys(m.cards).length}/${GUARDIANS.length}`], ['Spielzeit im Run', `${h} h ${mi} min`],
    ];
    return `<div class="kw-sgrid">${cells.map(([a, b]) => `<div class="kw-box kw-scell"><small>${a}</small><b>${b}</b></div>`).join('')}</div>`;
  }

  function settingsHTML() {
    const s = game.meta.settings;
    const seg = (key, opts) => `<div class="kw-seg" role="group">${opts.map(([v, n]) => `<button type="button" data-act="set" data-k="${key}" data-v="${v}" aria-pressed="${String(s[key]) === String(v)}">${n}</button>`).join('')}</div>`;
    const line = (icon, t, sub, ctl) => `<div class="kw-sline"><span class="kw-sline-ic">${ic(icon)}</span><div><b>${t}</b><small>${sub}</small></div>${ctl}</div>`;
    const online = cloud?.st?.status === 'online';
    return `<div class="kw-sgrp kw-box"><h4>${ic('speed')} Audio</h4>
        ${line('speed', 'Soundeffekte', 'Kampf, Klicks, Münzen', seg('sfx', [[0, 'Aus'], [0.3, 'Leise'], [0.5, 'Mittel'], [0.85, 'Laut']]))}
        ${line('play', 'Musik', 'Ruhige Hintergrundmusik', seg('music', [[0, 'Aus'], [1, 'Leise'], [2, 'Mittel']]))}</div>
      <div class="kw-sgrp kw-box"><h4>${ic('eye')} Anzeige</h4>
        ${line('eye', 'Grafik', 'Auto passt sich deinem Gerät an', seg('gfx', [['hoch', 'Hoch'], ['mittel', 'Mittel'], ['niedrig', 'Niedrig'], ['auto', 'Auto']]))}
        ${line('crit', 'Bildschirmwackeln', 'Bei Treffern und Bossen', seg('shake', [['on', 'An'], ['off', 'Aus']]))}
        ${line('sword', 'Schadenszahlen', 'Zahlen über den Gegnern', seg('numbers', [['on', 'An'], ['off', 'Aus']]))}</div>
      <div class="kw-sgrp kw-box"><h4>${ic('play')} Animationen</h4>
        ${line('pack', 'Booster öffnen', 'Schütteln & Aufreißen', seg('boosterAnim', [['show', 'Zeigen'], ['fast', 'Schnell']]))}</div>
      <div class="kw-sgrp kw-box"><h4>${ic('help')} Spiel</h4><div class="kw-chips">
        <button type="button" data-act="help">${ic('help')} Anleitung</button>
        <button type="button" data-act="patch">${ic('scroll')} Patchnotes ${PATCH[0][0]}</button></div>
        <div class="kw-patch" data-k="patch" hidden>${PATCH.map(([v, t]) => `<p><b>${v}</b> ${t}</p>`).join('')}</div></div>
      <div class="kw-sgrp kw-box"><h4>${ic('user')} Konto</h4><div class="kw-acc">
        <span>${online ? `Angemeldet als <b>${esc(cloud.st.name)}</b><br><small class="is-ok">Cloud-Sync aktiv · auf allen Geräten</small>` : 'Nicht angemeldet (Gast)<br><small>Nur auf diesem Gerät gespeichert</small>'}</span>
        <span class="kw-acc-b">${online ? `<button type="button" class="kw-btn kw-btn-sm" data-act="saveNow">${ic('check')}<span>Jetzt speichern</span></button><button type="button" class="kw-btn kw-btn-sm" data-act="logout">${ic('logout')}<span>Abmelden</span></button>` : `<button type="button" class="kw-btn kw-btn-sm kw-btn-primary" data-act="open" data-v="konto">${ic('user')}<span>Zum Login</span></button>`}</span></div></div>
      <div class="kw-ssave">
        <button type="button" class="kw-box" data-act="export">${ic('pack')}<div><b>Spielstand sichern</b><small>Als Datei speichern</small></div></button>
        <label class="kw-box">${ic('up')}<div><b>Spielstand laden</b><small>Sicherung einspielen</small></div><input type="file" accept=".json,application/json" data-act="import" hidden></label>
        <button type="button" class="kw-box is-danger" data-act="reset">${ic('flag')}<div><b data-k="resetlbl">${resetArm > Date.now() ? 'Wirklich alles löschen?' : 'Spielstand zurücksetzen'}</b><small>${resetArm > Date.now() ? 'Nochmal klicken zum Bestätigen' : 'Fängt komplett neu an'}</small></div></button>
      </div>`;
  }

  function kontoHTML() {
    const st = cloud?.st || {};
    if (st.status === 'online') {
      return `<div class="kw-box kw-login">
        <h3 class="kw-h3">Angemeldet als ${esc(st.name)}</h3>
        <p class="kw-hint">Dein Fortschritt wird automatisch in der Cloud gespeichert und ist auf allen Geräten verfügbar.${st.lastSync ? ` Zuletzt gespeichert: ${new Date(st.lastSync).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}.` : ''}</p>
        ${st.msg ? `<p class="kw-msg is-warn">${esc(st.msg)}</p>` : ''}
        <div class="kw-row-btns"><button type="button" class="kw-btn kw-btn-primary" data-act="saveNow">${ic('check')}<span>Jetzt speichern</span></button><button type="button" class="kw-btn" data-act="logout">${ic('logout')}<span>Abmelden</span></button></div>
      </div>`;
    }
    return `<form class="kw-box kw-login" data-k="loginform" novalidate>
      <h3 class="kw-h3">Einloggen oder Konto erstellen</h3>
      <p class="kw-hint">Mit Konto speicherst du deinen Fortschritt in der Cloud, spielst auf allen Geräten weiter und erscheinst in der Bestenliste. Keine E-Mail nötig.</p>
      <label for="kwName">Spielername</label>
      <input id="kwName" name="name" autocomplete="username" maxlength="16" placeholder="3–16 Zeichen">
      <label for="kwPw">Passwort</label>
      <input id="kwPw" name="pw" type="password" autocomplete="current-password" placeholder="mind. 6 Zeichen">
      <p class="kw-msg" data-k="loginmsg" role="alert">${!cloud?.configured() ? 'Die Online-Funktionen werden gerade eingerichtet.' : ''}</p>
      <div class="kw-row-btns">
        <button type="submit" class="kw-btn kw-btn-primary" data-mode="login"${st.busy ? ' disabled' : ''}>${ic('user')}<span>Einloggen</span></button>
        <button type="submit" class="kw-btn" data-mode="signup"${st.busy ? ' disabled' : ''}>${ic('plus')}<span>Registrieren</span></button>
      </div>
      <p class="kw-note">Dein Gast-Fortschritt wird beim Registrieren übernommen.</p>
    </form>`;
  }

  function screenHTML() {
    const [icon, title] = TITLES[screen];
    const body = screen === 'booster' ? shopHTML() : screen === 'werkstatt' ? treeHTML() : screen === 'helden' ? heroesHTML()
      : screen === 'bestiarium' ? bestiaryHTML() : screen === 'statistik' ? statsHTML() : screen === 'einstellungen' ? settingsHTML() : kontoHTML();
    return `<div class="kw-box kw-screen-in kw-scr-${screen}">
      <header class="kw-sh">
        <button type="button" class="kw-btn kw-btn-sm" data-act="close">${ic('back')}<span>Zurück</span></button>
        <h2>${ic(icon)} ${title}</h2>
        <div class="kw-sh-cur">${ic('gem')}<b>${fmt(game.meta.gems)}</b></div>
      </header>
      <div class="kw-sbody">${body}</div>
    </div>`;
  }
  function renderScreen(force) {
    if (!screen) return;
    const html = screenHTML();
    if (force || html !== last.screen) {
      const body = E.screen.querySelector('.kw-sbody');
      const st = body ? body.scrollTop : 0;
      E.screen.innerHTML = html; last.screen = html;
      const nb = E.screen.querySelector('.kw-sbody'); if (nb) nb.scrollTop = st;
    }
  }
  function openScreen(name) {
    screen = name;
    E.screen.hidden = false;
    renderScreen(true);
    E.screen.scrollTop = 0;
    const sb = E.screen.querySelector('.kw-sbody'); if (sb) sb.scrollTop = 0;
    later(() => E.screen.querySelector('[data-act="close"]')?.focus({ preventScroll: true }), 30);
  }
  function closeScreen() { screen = null; E.screen.hidden = true; last.screen = ''; last.menu = ''; }

  // =====================================================================
  // KLICKS
  // =====================================================================
  async function act(b) {
    const a = b.dataset.act, id = b.dataset.id, v = b.dataset.v;
    audio?.unlock();
    switch (a) {
      case 'speed': game.setSpeed(+v); sfx('click'); break;
      case 'buyRun':
        if (!game.buyRun(id)) { sfx('deny'); toast(game.runLevel(id) >= game.runMax(id) ? 'Max. Stufe – in der Werkstatt weiter ausbauen.' : 'Nicht genug Münzen.'); }
        else { sfx('buy'); skin.onBuy?.(id); }
        break;
      case 'abandon':
        if (abandonArm > Date.now()) { abandonArm = 0; game.endRun('abandon'); }
        else { abandonArm = Date.now() + 3000; sfx('click'); later(() => { last.tr = ''; }, 3100); }
        last.tr = '';
        break;
      case 'start':
        if (!game.canStart()) { sfx('deny'); toast('Öffne zuerst dein Start-Geschenk im Booster-Laden.'); openScreen('booster'); break; }
        sfx('wave'); game.startRun(); break;
      case 'open': sfx('click'); openScreen(v); if (v !== 'konto' && v !== 'einstellungen') break; break;
      case 'close': sfx('click'); closeScreen(); break;
      case 'booster': openBooster(v); break;
      case 'testgems': game.addTestGems(300); sfx('coin'); toast('+300 Gems (Test)'); break;
      case 'selWs': wsSel = id; sfx('nav'); break;
      case 'buyWs':
        if (!game.buyWs(id)) { sfx('deny'); toast(!game.wsReqMet(id) ? 'Erst die Voraussetzung ausbauen.' : game.wsMaxed(id) ? 'Schon voll ausgebaut.' : `Dir fehlen ${fmt(game.wsCost(id) - game.meta.gems)} Gems.`); }
        else sfx('buy');
        break;
      case 'slot': selSlot = +v; sfx('nav'); break;
      case 'assign': game.setLineup(selSlot, id); sfx('click'); selSlot = (selSlot + 1) % 4; break;
      case 'set': {
        const key = b.dataset.k;
        const val = isNaN(+v) ? v : +v;
        game.setSetting(key, val); audio?.apply(); sfx('click');
        renderScreen(true);
        break;
      }
      case 'help': showIntro(false); break;
      case 'patch': { const p = E.screen.querySelector('[data-k="patch"]'); if (p) p.hidden = !p.hidden; break; }
      case 'export': exportSave(); break;
      case 'reset':
        if (resetArm > Date.now()) { resetArm = 0; await cloud?.logout(); game.resetSave(); closeScreen(); toast('Spielstand zurückgesetzt.'); showIntro(true); }
        else { resetArm = Date.now() + 4000; sfx('deny'); renderScreen(true); later(() => renderScreen(true), 4100); }
        break;
      case 'saveNow': await cloud?.pushSave(true); toast(cloud?.st?.msg || 'Gespeichert.'); renderScreen(true); break;
      case 'logout': await cloud?.logout(); toast('Abgemeldet.'); renderScreen(true); break;
      case 'gift': game.setFlag('intro', true); E.intro.hidden = true; if (!game.meta.flags.gift) openBooster('starter'); break;
      case 'introClose': game.setFlag('intro', true); E.intro.hidden = true; break;
      default: return;
    }
    if (screen && !['close', 'open', 'set', 'patch', 'reset'].includes(a)) renderScreen(true);
    last.menu = ''; last.strip = '';
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || !el.contains(b) || b.dataset.act === 'import') return;
    if (b.tagName === 'INPUT') return;
    act(b);
  });
  el.addEventListener('change', e => {
    const inp = e.target.closest('input[data-act="import"]');
    if (!inp || !inp.files?.[0]) return;
    const f = inp.files[0];
    f.text().then(t => { if (game.importSave(t)) { toast('Spielstand geladen.'); cloud?.pushSave(true); } else toast('Diese Datei ist kein Packfall-Spielstand.'); renderScreen(true); });
  });
  el.addEventListener('submit', async e => {
    const form = e.target.closest('form[data-k="loginform"]');
    if (!form) return;
    e.preventDefault();
    const mode = e.submitter?.dataset.mode || 'login';
    const msg = form.querySelector('[data-k="loginmsg"]');
    const name = form.elements.name.value, pw = form.elements.pw.value;
    msg.textContent = mode === 'signup' ? 'Konto wird erstellt …' : 'Einloggen …';
    audio?.unlock();
    const r = mode === 'signup' ? await cloud.signup(name, pw) : await cloud.login(name, pw);
    if (r.ok) { toast(mode === 'signup' ? `Willkommen, ${cloud.st.name}!` : `Hallo ${cloud.st.name}!`); sfx('coin'); renderScreen(true); refreshBoard(); }
    else { msg.textContent = r.msg; sfx('deny'); }
  });

  function exportSave() {
    const data = game.exportSave();
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `packfall-spielstand-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Spielstand als Datei gespeichert.');
    } catch (e) {
      navigator.clipboard?.writeText(data).then(() => toast('Spielstand in die Zwischenablage kopiert.'), () => toast('Sichern hat hier nicht geklappt.'));
    }
  }

  // =====================================================================
  // WILLKOMMEN
  // =====================================================================
  function showIntro(withGift) {
    const gift = withGift && !game.meta.flags.gift;
    E.intro.hidden = false;
    E.intro.innerHTML = `<div class="kw-box kw-intro-in" role="dialog" aria-labelledby="kwIntroT">
      <h2 id="kwIntroT">${gift ? 'Willkommen bei Packfall!' : 'So funktioniert Packfall'}</h2>
      <ol class="kw-steps">
        <li>${ic('pack')}<span><b>Booster öffnen</b> und Helden sammeln. Doppelte machen sie stärker.</span></li>
        <li>${ic('tower')}<span>Deine Helden <b>verteidigen den Turm</b> automatisch gegen Monsterwellen.</span></li>
        <li>${ic('cursor')}<span>Mit der <b>Maus oder dem Finger</b> schlägst du selbst zu – der Kreis lädt sich auf.</span></li>
        <li>${ic('coin')}<span><b>Münzen</b> gibt's nur im Run. <b>Gems</b> bleiben für immer: Werkstatt & Booster.</span></li>
      </ol>
      ${gift ? `<div class="kw-gift"><span class="kw-gift-img">${skin.packArt('starter')}</span><p><b>Ein Geschenk zum Start</b><br>Dein erster Booster mit 3 Helden – einer davon garantiert selten.</p></div>
        <button type="button" class="kw-btn kw-btn-primary kw-btn-lg" data-act="gift">${ic('pack')}<span>Geschenk öffnen</span></button>`
        : `<button type="button" class="kw-btn kw-btn-primary kw-btn-lg" data-act="introClose">${ic('check')}<span>Alles klar</span></button>`}
    </div>`;
    later(() => E.intro.querySelector('button')?.focus({ preventScroll: true }), 50);
  }

  // =====================================================================
  // BOOSTER ÖFFNEN
  // =====================================================================
  let bo = null;
  function openBooster(kind) {
    const b = BOOSTERS[kind];
    if (game.run) return;
    if (game.meta.gems < b.cost) { sfx('deny'); toast(`Dir fehlen ${fmt(b.cost - game.meta.gems)} Gems.`); return; }
    const res = game.openBooster(kind);
    if (!res) return;
    const fast = game.meta.settings.boosterAnim === 'fast' || reduceMotion();
    const best = res.reduce((a, r) => (RARITIES[r.rarity].rank > RARITIES[a].rank ? r.rarity : a), 'common');
    bo = { res, kind, flipped: 0, stage: 'pack', fast };
    E.bo.hidden = false;
    E.bo.className = `kw-ov kw-bo k-${kind}`;
    E.bo.dataset.best = best;
    E.bo.style.setProperty('--best', RARITIES[best].color);
    E.botitle.innerHTML = kind === 'starter' ? '<b>Dein Geschenk!</b><span>Start-Booster</span>' : `<b>Neues Paket!</b><span>${b.name}</span>`;
    E.packart.innerHTML = skin.packArt(kind);
    E.cards.innerHTML = '';
    E.boall.hidden = true; E.boclose.hidden = true;
    E.packhint.hidden = false; E.pack.hidden = false;
    later(() => { E.bo.classList.add('st-shake'); sfx('shake'); }, 40);
    later(rip, fast ? 250 : 1700);
    E.pack.focus({ preventScroll: true });
  }
  function cardHTML(r, i) {
    const d = r.def;
    const st = game.cardStats(d.id, r.lvlTo || 1, game.meta.cards[d.id]?.foil);
    const stats = d.kind === 'beam' ? `<span>${fmtNum(st.dps)} Schaden/s</span>` : `<span>${fmtNum(st.dmg)} Schaden</span><span class="kw-rate"> · ${fmtNum(d.rate)}/s</span>`;
    let tag = r.isNew ? 'Neu' : r.refund ? `Max · +${r.refund} Gems` : `Stufe ${r.lvlFrom} → ${r.lvlTo}`;
    if (r.becameFoil) tag += ' · Glanz';
    return `<button type="button" class="kw-card r-${r.rarity}${r.foil ? ' foil' : ''}${r.isNew ? ' is-new' : ''}" style="--i:${i};--rc:${RARITIES[r.rarity].color}" data-i="${i}" aria-label="Karte ${i + 1} aufdecken">
      <span class="kw-card-in">
        <span class="kw-card-back">${skin.cardBack()}</span>
        <span class="kw-card-front">
          <span class="kw-card-rar">${RARITIES[r.rarity].name}</span>${r.foil ? '<span class="kw-card-foil">Glanz</span>' : ''}
          <span class="kw-card-art">${skin.cardArt(d, { foil: r.foil, big: true })}</span>
          <span class="kw-card-name">${d.name}</span>
          <span class="kw-card-stats">${stats}</span>
          <span class="kw-card-desc">${d.desc}</span>
        </span>
      </span>
      <span class="kw-card-tag">${tag}</span>
    </button>`;
  }
  function rip() {
    if (!bo || bo.stage !== 'pack') return;
    bo.stage = 'rip';
    E.bo.classList.remove('st-shake'); E.bo.classList.add('st-rip');
    E.packhint.hidden = true;
    sfx('rip');
    later(() => {
      if (!bo) return;
      E.pack.hidden = true;
      E.cards.innerHTML = bo.res.map(cardHTML).join('');
      E.bo.classList.add('st-cards');
      bo.stage = 'cards';
      E.boall.hidden = false;
      if (bo.fast) revealAll();
    }, bo.fast ? 60 : 560);
  }
  function flip(i) {
    if (!bo || bo.stage !== 'cards') return;
    const c = E.cards.children[i];
    if (!c || c.classList.contains('flipped') || c.classList.contains('charging')) return;
    const r = bo.res[i];
    const rank = RARITIES[r.rarity].rank;
    const doFlip = () => {
      if (!bo) return;
      c.classList.remove('charging'); c.classList.add('flipped');
      c.setAttribute('aria-label', `${r.def.name}, ${RARITIES[r.rarity].name}`);
      bo.flipped++;
      sfx(rank >= 3 ? 'fanfare' : 'reveal', r.rarity);
      if (rank >= 2 || r.foil) { E.boflash.style.setProperty('--fc', RARITIES[r.rarity].color); restartAnim(E.boflash, 'go'); }
      if (bo.flipped === bo.res.length) {
        bo.stage = 'done';
        E.boall.hidden = true; E.boclose.hidden = false;
        E.bo.classList.add('st-done');
        later(() => E.boclose.focus({ preventScroll: true }), 50);
      }
    };
    if (rank >= 3 && !bo.fast) { c.classList.add('charging'); later(doFlip, 950); } else doFlip();
  }
  function revealAll() {
    if (!bo) return;
    let d = 0;
    bo.res.forEach((r, i) => { later(() => flip(i), d); d += RARITIES[r.rarity].rank >= 3 && !bo.fast ? 1200 : bo.fast ? 140 : 320; });
  }
  function closeBooster() {
    const wasStarter = bo?.kind === 'starter';
    E.bo.hidden = true; E.bo.className = 'kw-ov kw-bo'; bo = null;
    last.menu = ''; renderScreen(true);
    if (wasStarter) { closeScreen(); toast('Deine Helden stehen bereit. Auf „Kämpfen“ geht\'s los!'); later(() => E.menu.querySelector('[data-act="start"]')?.focus({ preventScroll: true }), 60); }
  }
  E.pack.addEventListener('click', rip);
  E.cards.addEventListener('click', e => { const c = e.target.closest('.kw-card'); if (c) flip(+c.dataset.i); });
  E.boall.addEventListener('click', revealAll);
  E.boclose.addEventListener('click', closeBooster);

  // ---------- Run-Ende ----------
  function showSummary(s) {
    E.sum.hidden = false;
    E.sum.querySelector('h2').textContent = s.reason === 'abandon' ? 'Run beendet' : 'Der Turm ist gefallen';
    E.sumwave.innerHTML = `Welle <b>${s.wave}</b>${s.record ? ' <span class="kw-rec">Neuer Rekord</span>' : ''}`;
    const min = Math.floor(s.time / 60), sec = Math.floor(s.time % 60);
    E.sumlist.innerHTML = `
      <div><dt>Gems verdient</dt><dd>${ic('gem')}${fmt(s.gems)}</dd></div>
      <div><dt>Gegner besiegt</dt><dd>${fmt(s.kills)}</dd></div>
      <div><dt>Münzen gesammelt</dt><dd>${ic('coin')}${fmt(s.coins)}</dd></div>
      <div><dt>Dauer</dt><dd>${min}:${String(sec).padStart(2, '0')}</dd></div>`;
    later(() => E.sumclose.focus({ preventScroll: true }), 50);
  }
  E.sumclose.addEventListener('click', () => { E.sum.hidden = true; sfx('click'); last.menu = ''; });

  // ---------- Spiel-Ereignisse ----------
  const offs = [
    game.on('runStart', () => { E.sum.hidden = true; closeScreen(); last.strip = ''; }),
    game.on('runEnd', s => { E.banner.classList.remove('show'); sfx('over'); showSummary(s); tipId = null; placeTip(); }),
    game.on('waveStart', w => {
      if (w.realmChanged) banner(REALMS[w.realm].name, `Reich ${w.realm + 1} · Welle ${w.wave}`, 'realm');
      else if (w.boss) { banner(`Welle ${w.wave}`, 'Ein Schattenfürst naht', 'boss'); sfx('boss'); }
      else banner(`Welle ${w.wave}`, w.wave === 1 ? 'Verteidige den Turm' : '', '');
      if (!w.boss) sfx('wave');
    }),
    game.on('record', w => { if (w > 1) toast(`Neuer Rekord: Welle ${w}`); }),
    game.on('gems', d => { if (d?.n) { restartAnim(el.querySelector('.kw-cur'), 'bump'); sfx('coin'); } }),
    game.on('coreHit', () => { restartAnim(E.hitflash, 'go'); sfx('core'); }),
    game.on('shot', () => sfx('shot')),
    game.on('hit', h => { if (h.src !== 'beam') sfx('hit'); }),
    game.on('kill', () => sfx('kill')),
    game.on('boom', () => sfx('boom')),
    game.on('zap', () => sfx('zap')),
    game.on('cursorStrike', () => sfx('strike')),
    game.on('reset', () => { last.menu = ''; }),
    cloud?.on(() => { last.menu = ''; if (screen === 'konto' || screen === 'einstellungen') renderScreen(true); }),
  ].filter(Boolean);

  // ---------- pro Frame ----------
  function frame(dt) {
    const r = game.run;
    el.dataset.mode = r ? 'run' : 'basis';
    el.classList.toggle('has-screen', !!screen);
    if (r) {
      E.gems.textContent = fmt(game.meta.gems);
      E.coins.textContent = fmt(r.coins);
      E.hp.textContent = `${Math.ceil(r.coreHp)}/${Math.round(r.coreMax)}`;
      E.hpbar.style.transform = `scaleX(${Math.max(0, r.coreHp / r.coreMax)})`;
      el.classList.toggle('is-low', r.coreHp / r.coreMax < 0.3);
    } else el.classList.remove('is-low');
    renderT -= dt;
    if (renderT > 0) return;
    renderT = 0.2;
    if (r) {
      set('strip', E.strip, stripHTML());
      set('tr', E.tr, trHTML());
      set('wavebox', E.wavebox, waveHTML());
      if (tipId) placeTip();
    } else {
      set('menu', E.menu, menuHTML());
      if (screen && !STATIC.has(screen)) renderScreen(false);
      lbT -= 0.2;
      if (lbT <= 0) { lbT = 60; refreshBoard().then(() => { last.menu = ''; }); }
    }
  }

  // =====================================================================
  // OPENING: Ladescreen → kurzes Intro → Titelbildschirm → Menü
  // =====================================================================
  const TIPS = [
    'Tipp: Doppelte Karten machen deine Helden stärker.',
    'Tipp: Mit der Maus schlägst du selbst zu – der Kreis lädt sich auf.',
    'Tipp: Münzen verfallen am Run-Ende, Gems bleiben für immer.',
    'Tipp: Jede 10. Welle kommt ein Schattenfürst. Er bringt viele Gems.',
    'Tipp: Glanz-Karten machen dauerhaft +50 % Schaden.',
  ];
  E.loadtip.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  let phase = 'load';
  const setPhase = p => { phase = p; E.open.dataset.phase = p; el.dataset.phase = p === 'out' ? 'menu' : p; };
  el.dataset.phase = 'load';
  function setLoad(p, label) {
    const v = Math.max(0, Math.min(1, p));
    E.loadbar.style.transform = `scaleX(${v})`;
    E.loadpct.textContent = `${Math.round(v * 100)} %`;
    if (label) E.loadlbl.textContent = label;
  }
  function toMenu() {
    if (phase === 'menu') return;
    setPhase('out');
    later(() => {
      setPhase('menu'); E.open.hidden = true; last.menu = '';
      if (!game.meta.flags.intro) later(() => showIntro(true), 250);
      else later(() => E.menu.querySelector('.kw-mi')?.focus({ preventScroll: true }), 80);
    }, 450);
  }
  function toTitle() {
    if (phase === 'title' || phase === 'out' || phase === 'menu') return;
    setPhase('title');
    later(() => E.press.focus({ preventScroll: true }), 50);
  }
  function ready() {
    setLoad(1, 'Fertig!');
    let seen = false;
    try { seen = sessionStorage.getItem('packfall.intro') === '1'; sessionStorage.setItem('packfall.intro', '1'); } catch (e) { /* egal */ }
    later(() => {
      if (seen || reduceMotion()) { toTitle(); return; }
      setPhase('intro');
      later(toTitle, 6400);
    }, 350);
  }
  E.skip.addEventListener('click', toTitle);
  E.press.addEventListener('click', () => { audio?.unlock(); audio?.apply(); sfx('fanfare'); toMenu(); });
  E.open.addEventListener('keydown', e => {
    if (phase === 'intro' && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toTitle(); }
  });

  return {
    el, stage, toast, banner, frame, setLoad, ready,
    get phase() { return phase; },
    destroy() { offs.forEach(f => f()); timers.forEach(t => clearTimeout(t)); clearTimeout(toastT); el.remove(); },
  };
}
