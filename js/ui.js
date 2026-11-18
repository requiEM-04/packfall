// Packfall – Oberfläche: Hauptmenü (wie Pokélings), Unterseiten, Run-HUD, Booster öffnen, Willkommen
import { UPGRADES, U, G, GUARDIANS, ENEMY_TYPES, RARITIES, BOOSTERS, REALMS, realmOf, fmt, fmtNum, WS_MAX } from './core.js?v=0.6.1-6729cd5a';
import { createOpening } from './opening.js?v=0.6.1-6729cd5a';
import { createAdmin } from './admin.js?v=0.6.1-6729cd5a';

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
  ['v0.6', 'Neue Musik: düsterer Fantasy-Metal mit Gitarren-Riffs, Lead-Gitarre und Chor; Anmeldefenster übersichtlicher, Passwort schon ab 4 Zeichen'],
  ['v0.5', 'Neues Booster-Opening: ein Held pro Pack, Lichtstrahlen verraten die Seltenheit, Bass-Sounds; 12 komplett neu gezeichnete Helden (4 neue); neue Synthwave-Musik; ruhigere Oberfläche; Anmeldefenster beim Start; flüssiger'],
  ['v0.4', 'Neuer, düsterer Look: gedeckte Farben mit Grauton, neuer Turm mit Pflasterplatz, neues Titelbild mit Pixel-Logo und Booster-Fächer'],
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
      <canvas class="kw-bo-fx" data-k="bofx"></canvas>
      <div class="kw-bo-in" data-k="boin">
        <p class="kw-bo-title" data-k="botitle"></p>
        <div class="kw-bo-stage">
          <button type="button" class="kw-pack" data-k="pack" aria-label="Booster öffnen">
            <span class="kw-pack-a" data-k="packa"></span><span class="kw-pack-b" data-k="packb"></span>
          </button>
          <div class="kw-reveal" data-k="reveal" hidden></div>
        </div>
        <p class="kw-pack-hint" data-k="packhint">Antippen zum Öffnen</p>
        <div class="kw-bo-act" data-k="boact" hidden>
          <button type="button" class="kw-btn" data-k="boagain"></button>
          <button type="button" class="kw-btn kw-btn-primary" data-k="boclose">Weiter</button>
        </div>
      </div>
      <div class="kw-bo-flash" data-k="boflash"></div>
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
    <div class="kw-ov kw-news" data-k="news" hidden>
      <div class="kw-box kw-news-in" role="dialog" aria-labelledby="kwNewsH">
        <h2 id="kwNewsH" data-k="newsh"></h2>
        <p data-k="newstxt"></p>
        <button type="button" class="kw-btn kw-btn-primary" data-k="newsok">Alles klar</button>
      </div>
    </div>
    <div class="kw-toast" data-k="toast" role="status"></div>
    <div class="kw-open" data-k="open" data-phase="load">
      <div class="kw-load">
        ${skin.logo ? `<img class="kw-logo-img kw-logo-load" src="${skin.logo}" alt="Packfall">` : '<div class="kw-logo kw-logo-sm"><span>PACK</span><span>FALL</span></div>'}
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
        <span class="kw-title-bg" data-k="titlebg"></span>
        <div class="kw-title-main">
          <h1 class="kw-title-logo">${skin.logo ? `<img class="kw-logo-img" src="${skin.logo}" alt="Packfall">` : 'Packfall'}</h1>
          <div class="kw-fan" data-k="fan" aria-hidden="true"></div>
          <p class="kw-ribbon">Booster öffnen · Helden sammeln · Turm halten</p>
          <button type="button" class="kw-press" data-k="press">Drücke Start</button>
        </div>
        <p class="kw-legal">Prototyp v0.6 · Spielstand wird automatisch gespeichert</p>
      </div>
      <div class="kw-auth" data-k="auth">
        <div class="kw-auth-in">
          ${skin.logo ? `<img class="kw-logo-img kw-auth-logo" src="${skin.logo}" alt="Packfall">` : '<h1>Packfall</h1>'}
          <p class="kw-ribbon">Booster öffnen · Helden sammeln · Turm halten</p>
          <div class="kw-auth-wrap">
            <form class="kw-box kw-auth-box" data-k="authform" novalidate>
              <div class="kw-atabs" role="tablist">
                <button type="button" role="tab" data-act="authTab" data-v="login" aria-selected="true">Anmelden</button>
                <button type="button" role="tab" data-act="authTab" data-v="signup" aria-selected="false">Registrieren</button>
              </div>
              <label class="kw-fld">Benutzername<input name="name" maxlength="16" autocomplete="username" spellcheck="false"></label>
              <label class="kw-fld">Passwort<input name="pw" type="password" maxlength="64" autocomplete="current-password"></label>
              <label class="kw-fld" data-k="authpw2" hidden>Passwort wiederholen<input name="pw2" type="password" maxlength="64" autocomplete="new-password"></label>
              <label class="kw-chk"><input type="checkbox" name="remember" checked><span>Angemeldet bleiben</span></label>
              <p class="kw-aerr" data-k="autherr" role="alert"></p>
              <button type="submit" class="kw-btn kw-btn-primary kw-auth-go" data-k="authgo">Anmelden</button>
              <button type="button" class="kw-btn kw-auth-guest" data-act="authGuest">${ic('user')}<span>Als Gast spielen</span></button>
              <p class="kw-note">Konten sind online: Mit Name und Passwort spielst du auf jedem Gerät weiter. Keine E-Mail nötig, das Passwort wird vorher verschlüsselt. Gäste spielen nur lokal in diesem Browser.</p>
            </form>
            <div class="kw-box kw-auth-lb">
              <h3>${ic('trophy')} Bestenliste</h3>
              <ol class="kw-lb" data-k="authlb"><li class="kw-lb-empty">Lädt …</li></ol>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  root.appendChild(el);

  const k = name => el.querySelector(`[data-k="${name}"]`);
  const E = {};
  ['gems', 'coins', 'hp', 'hpbar', 'strip', 'tip', 'tr', 'wavebox', 'banner', 'hitflash', 'menu', 'screen', 'bo', 'sum', 'sumwave', 'sumlist', 'sumclose', 'intro', 'toast', 'open', 'loadlbl', 'loadpct', 'loadbar', 'loadtip', 'skip', 'press', 'titlebg', 'fan', 'auth', 'authform', 'authpw2', 'autherr', 'authgo', 'authlb', 'news', 'newsh', 'newstxt', 'newsok'].forEach(n => { E[n] = k(n); });
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
  const txt = (node, v) => { if (node._t !== v) { node._t = v; node.textContent = v; } };
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
        <h1 class="kw-menu-logo">${skin.logo ? `<img class="kw-logo-img" src="${skin.logo}" alt="Packfall">` : 'Packfall'}</h1>
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
        <b>Start-Geschenk</b><small>Dein erster Held · garantiert Selten</small>
        <button type="button" class="kw-btn kw-btn-primary" data-act="booster" data-v="starter">Öffnen</button></div>`);
    }
    Object.entries(BOOSTERS).filter(([, b]) => !b.hidden).forEach(([kind, b]) => {
      const can = m.gems >= b.cost;
      cells.push(`<div class="kw-shopcell k-${kind}">
        <div class="kw-price">${costHTML('gem', b.cost)}</div>
        <div class="kw-shopimg">${skin.packArt(kind)}</div>
        <b>${b.name}</b><small>1 Held${kind === 'elite' ? ' · mind. Selten' : ''}</small>
        <ul class="kw-odds">${Object.entries(b.odds).map(([r, v]) => `<li style="--rc:${RARITIES[r].color}"><span>${RARITIES[r].name}</span><span>${v} %</span></li>`).join('')}<li class="foil"><span>Glanz</span><span>${Math.round(b.foil * 100)} %</span></li></ul>
        <button type="button" class="kw-btn${can ? ' kw-btn-primary' : ''}" data-act="booster" data-v="${kind}"${can ? '' : ' aria-disabled="true"'}>${can ? 'Öffnen' : `Fehlen ${fmt(b.cost - m.gems)}`}</button></div>`);
    });
    return `<div class="kw-shop">${cells.join('')}</div>
      <p class="kw-hint">Jeder Booster enthält einen Helden. Doppelte = +1 Stufe (max. 10, je +25 % Schaden). Glanz-Helden machen dauerhaft +50 % Schaden.</p>
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
        ${line('play', 'Musik', 'Synthwave, im Run mit vollem Beat', seg('music', [[0, 'Aus'], [1, 'Leise'], [2, 'Laut']]))}</div>
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
      ${gift ? `<div class="kw-gift"><span class="kw-gift-img">${skin.packArt('starter')}</span><p><b>Ein Geschenk zum Start</b><br>Dein erster Booster – mit einem garantiert seltenen Helden.</p></div>
        <button type="button" class="kw-btn kw-btn-primary kw-btn-lg" data-act="gift">${ic('pack')}<span>Geschenk öffnen</span></button>`
        : `<button type="button" class="kw-btn kw-btn-primary kw-btn-lg" data-act="introClose">${ic('check')}<span>Alles klar</span></button>`}
    </div>`;
    later(() => E.intro.querySelector('button')?.focus({ preventScroll: true }), 50);
  }

  // =====================================================================
  // BOOSTER ÖFFNEN
  // =====================================================================
  const opening = createOpening(E.bo, {
    skin, sfx, settings: () => game.meta.settings,
    info: {
      packName: kind => BOOSTERS[kind].name,
      rarName: r => RARITIES[r].name,
      stats: r => {
        const d = r.def, st = game.cardStats(d.id, r.lvlTo || 1, game.meta.cards[d.id]?.foil);
        return d.kind === 'beam' ? `${fmtNum(st.dps)} Schaden/s · Reichweite ${d.range}` : `${fmtNum(st.dmg)} Schaden · ${fmtNum(d.rate)}/s · Reichweite ${d.range}`;
      },
      tag: r => {
        let t = r.isNew ? (r.placed ? 'Neu · steht im Team' : 'Neu · in der Sammlung') : r.refund ? `Max. Stufe · +${r.refund} Gems` : `Doppelt · Stufe ${r.lvlFrom} → ${r.lvlTo}`;
        if (r.becameFoil) t += ' · jetzt mit Glanz';
        return t;
      },
      again: kind => {
        const b = BOOSTERS[kind];
        if (kind === 'starter' || game.meta.gems < b.cost) return '';
        return `Nochmal ${costHTML('gem', b.cost)}`;
      },
    },
    onClose: () => closeBooster(),
    onAgain: kind => openBooster(kind),
  });
  let boKind = null;
  function openBooster(kind) {
    const b = BOOSTERS[kind];
    if (game.run) return;
    if (game.meta.gems < b.cost) { sfx('deny'); toast(`Dir fehlen ${fmt(b.cost - game.meta.gems)} Gems.`); return; }
    const res = game.openBooster(kind);
    if (!res) return;
    boKind = kind;
    opening.open(kind, res[0]);
  }
  function closeBooster() {
    const wasStarter = boKind === 'starter';
    boKind = null;
    last.menu = ''; renderScreen(true);
    if (wasStarter) { closeScreen(); toast('Dein erster Held steht bereit. Auf „Kämpfen“ geht\'s los!'); later(() => E.menu.querySelector('[data-act="start"]')?.focus({ preventScroll: true }), 60); }
  }

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
    const md = r ? 'run' : 'basis';
    if (el.dataset.mode !== md) el.dataset.mode = md;
    if (el.classList.contains('has-screen') !== !!screen) el.classList.toggle('has-screen', !!screen);
    if (r) {
      txt(E.gems, fmt(game.meta.gems));
      txt(E.coins, fmt(r.coins));
      txt(E.hp, `${Math.ceil(r.coreHp)}/${Math.round(r.coreMax)}`);
      const hk = Math.max(0, r.coreHp / r.coreMax).toFixed(3);
      if (E.hpbar._k !== hk) { E.hpbar._k = hk; E.hpbar.style.transform = `scaleX(${hk})`; }
      const low = r.coreHp / r.coreMax < 0.3;
      if (el.classList.contains('is-low') !== low) el.classList.toggle('is-low', low);
    } else if (el.classList.contains('is-low')) el.classList.remove('is-low');
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
      if (lbT <= 0) { lbT = 60; refreshBoard().then(() => { last.menu = ''; }); checkMail(); }
    }
  }

  // =====================================================================
  // OPENING: Ladescreen → kurzes Intro → Titelbildschirm → Menü
  // =====================================================================
  const TIPS = [
    'Tipp: Doppelte Helden steigen eine Stufe auf.',
    'Tipp: Mit der Maus schlägst du selbst zu – der Kreis lädt sich auf.',
    'Tipp: Münzen verfallen am Run-Ende, Gems bleiben für immer.',
    'Tipp: Jede 10. Welle kommt ein Schattenfürst. Er bringt viele Gems.',
    'Tipp: Glanz-Helden machen dauerhaft +50 % Schaden.',
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
      later(checkMail, 900);
      if (!game.meta.flags.intro) later(() => showIntro(true), 250);
      else later(() => E.menu.querySelector('.kw-mi')?.focus({ preventScroll: true }), 80);
    }, 450);
  }
  function toTitle() {
    if (phase === 'title' || phase === 'out' || phase === 'menu' || phase === 'auth') return;
    setPhase('title');
    later(() => E.press.focus({ preventScroll: true }), 50);
  }
  function ready() {
    setLoad(1, 'Fertig!');
    if (skin.titleBg) E.titlebg.innerHTML = skin.titleBg();
    E.fan.innerHTML = ['starter', 'green', 'elite', 'basic', 'purple'].map((kd, i) => `<span class="kw-fan-p" style="--i:${i}">${skin.packArt(kd)}</span>`).join('');
    let seen = false;
    try { seen = sessionStorage.getItem('packfall.intro') === '1'; sessionStorage.setItem('packfall.intro', '1'); } catch (e) { /* egal */ }
    later(() => {
      if (seen || reduceMotion()) { toTitle(); return; }
      setPhase('intro');
      later(toTitle, 6400);
    }, 350);
  }
  E.skip.addEventListener('click', toTitle);
  E.press.addEventListener('click', async () => {
    audio?.unlock(); audio?.apply(); sfx('fanfare');
    let guest = false;
    try { guest = sessionStorage.getItem('packfall.guest') === '1'; } catch (e) { /* egal */ }
    if (cloud?.configured() && cloud.st.restoring) await Promise.race([cloud.restored, new Promise(r => setTimeout(r, 2500))]);
    if (!cloud?.configured() || cloud.st.status === 'online' || guest) toMenu(); else showAuth();
  });

  // ---------- Admin ----------
  const adminUI = createAdmin(el, { cloud, sfx, toast, ic, esc, fmt, logo: skin.logo, onExit: () => showAuth() });

  // ---------- Postfach: Nachrichten an alle, Geschenke, Sperre ----------
  const inbox = [];
  let inboxWait = false;
  function pushInbox(h, t) { inbox.push([h, t]); if (E.news.hidden && !inboxWait) nextInbox(); }
  function nextInbox() {
    if (!E.intro.hidden || !E.bo.hidden) { if (!inboxWait) { inboxWait = true; later(() => { inboxWait = false; nextInbox(); }, 1200); } return; }
    const n = inbox.shift();
    if (!n) { E.news.hidden = true; return; }
    E.newsh.textContent = n[0]; E.newstxt.textContent = n[1];
    E.news.hidden = false; sfx('reveal', 'rare');
    later(() => E.newsok.focus({ preventScroll: true }), 50);
  }
  E.newsok.addEventListener('click', () => { sfx('click'); nextInbox(); });
  let mailBusy = false;
  async function checkMail() {
    if (!cloud?.configured() || mailBusy || phase !== 'menu') return;
    mailBusy = true;
    try {
      if (cloud.st.banText) { pushInbox('Konto gesperrt', cloud.st.banText + ' Du spielst jetzt als Gast weiter.'); cloud.st.banText = ''; }
      if (cloud.st.status === 'online') {
        const ban = await cloud.checkBan();
        if (ban) pushInbox('Konto gesperrt', ban + ' Du spielst jetzt als Gast weiter.');
        const gifts = await cloud.claim();
        const sum = gifts.reduce((a, g) => a + Math.max(0, g.gems | 0), 0);
        if (sum > 0) {
          const msgs = gifts.map(g => g.msg).filter(Boolean);
          pushInbox('Ein Geschenk für dich!', `+${fmt(sum)} Gems von REQUIEM.${msgs.length ? ' „' + msgs.join(' · ') + '“' : ''}`);
          last.menu = '';
        }
      }
      const n = await cloud.news();
      let seen = 0;
      try { seen = +localStorage.getItem('packfall.news') || 0; } catch (e) { /* egal */ }
      if (n && n.id > seen) {
        try { localStorage.setItem('packfall.news', String(n.id)); } catch (e) { /* egal */ }
        pushInbox('Nachricht von REQUIEM', n.msg);
      }
    } finally { mailBusy = false; }
  }

  // ---------- Anmeldefenster (wie Pokélings) ----------
  let authMode = 'login';
  function setAuthMode(m) {
    authMode = m;
    E.auth.querySelectorAll('[data-act="authTab"]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === m)));
    E.authpw2.hidden = m !== 'signup';
    E.authgo.textContent = m === 'signup' ? 'Konto erstellen' : 'Anmelden';
    E.authform.elements.pw.autocomplete = m === 'signup' ? 'new-password' : 'current-password';
    E.autherr.textContent = '';
  }
  async function showAuth() {
    setPhase('auth');
    setAuthMode('login');
    later(() => E.authform.elements.name.focus({ preventScroll: true }), 80);
    await refreshBoard();
    E.authlb.innerHTML = lbRows
      ? (lbRows.length ? lbRows.slice(0, 10).map((r, i) => `<li><span class="kw-lb-n">${i + 1}</span><span class="kw-lb-name">${esc(r.name)}</span><span class="kw-lb-v">Welle ${r.best_wave}</span><small>${fmt(r.total_gems)} Gems · ${r.heroes || 0} Helden</small></li>`).join('') : '<li class="kw-lb-empty">Noch niemand eingetragen. Sei der Erste!</li>')
      : `<li class="kw-lb-empty">${esc(lbMsg || 'Bestenliste gerade nicht erreichbar.')}</li>`;
  }
  E.auth.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'authTab') { sfx('click'); setAuthMode(b.dataset.v); }
    if (b.dataset.act === 'authGuest') {
      sfx('click');
      try { sessionStorage.setItem('packfall.guest', '1'); } catch (err) { /* egal */ }
      toMenu();
    }
  });
  E.authform.addEventListener('submit', async e => {
    e.preventDefault();
    const f = E.authform.elements, name = f.name.value.trim(), pw = f.pw.value;
    if (authMode === 'login' && /^\s*admin\s*$/i.test(name)) {
      E.autherr.textContent = 'Admin-Anmeldung …'; E.authgo.disabled = true;
      const ra = await cloud.adminLogin(pw);
      E.authgo.disabled = false;
      if (ra.ok) { E.autherr.textContent = ''; f.pw.value = ''; sfx('coin'); setPhase('admin'); adminUI.show(); }
      else { E.autherr.textContent = ra.msg; sfx('deny'); }
      return;
    }
    if (authMode === 'signup' && pw !== f.pw2.value) { E.autherr.textContent = 'Die Passwörter sind nicht gleich.'; sfx('deny'); return; }
    E.autherr.textContent = authMode === 'signup' ? 'Konto wird erstellt …' : 'Anmelden …';
    E.authgo.disabled = true;
    const r = authMode === 'signup' ? await cloud.signup(name, pw, f.remember.checked) : await cloud.login(name, pw, f.remember.checked);
    E.authgo.disabled = false;
    if (r.ok) { E.autherr.textContent = ''; f.pw.value = ''; f.pw2.value = ''; sfx('coin'); toast(authMode === 'signup' ? `Willkommen, ${cloud.st.name}!` : `Hallo ${cloud.st.name}!`); refreshBoard(); toMenu(); }
    else { E.autherr.textContent = r.msg; sfx('deny'); }
  });
  E.open.addEventListener('keydown', e => {
    if (phase === 'intro' && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toTitle(); }
  });

  return {
    el, stage, toast, banner, frame, setLoad, ready,
    get phase() { return phase; },
    get busy() { return opening.active; },
    destroy() { opening.destroy(); offs.forEach(f => f()); timers.forEach(t => clearTimeout(t)); clearTimeout(toastT); el.remove(); },
  };
}
