// Packfall – Oberfläche: Hauptmenü (wie Pokélings), Unterseiten, Run-HUD, Booster öffnen, Willkommen
import { UPGRADES, U, TOWERS, T, ENEMIES, RARITIES, BOOSTERS, LEVELS, ENDLESS, levelDef, DIFFS, DIFF_IDS, THEMES, MODES, MAX_LV, fmt, fmtNum } from './core.js?v=0.9.1-86e62b3e';
import { createOpening } from './opening.js?v=0.9.1-86e62b3e';
import { createAdmin } from './admin.js?v=0.9.1-86e62b3e';

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Werkstatt-Baum: Positionen in Prozent
const TREE = {
  kapital: [26, 14], kern: [26, 40], kaliber: [26, 64], platz4: [26, 88],
  kopfgeld: [50, 10], ingenieur: [50, 30], notschild: [50, 48], optik: [50, 68], platz5: [50, 88],
  kasse: [74, 8], gemfund: [74, 24], recycling: [74, 40],
};
const ROOT = [7, 50];
const firstLevel = type => (type === 'koloss' ? 1 : type === 'fuerst' ? 8 : LEVELS.findIndex(L => L.foes.includes(type) || L.extra.includes(type)) + 1);
const MEDAL = { leicht: 'bronze', mittel: 'silber', schwer: 'gold' };
const rngTxt = v => (v >= 50 ? 'ganze Map' : fmtNum(v, 1));
const starsHTML = (n, max = 5) => Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('');
const WHY = { cell: 'Hier kann nicht gebaut werden.', cash: 'Nicht genug Münzen.', loadout: 'Dieser Turm ist nicht im Loadout.' };

const PATCH = [
  ['v0.9.1', 'Maps wie bei Bloons: jede Map auf Leicht, Mittel oder Schwer (12/18/25 Wellen) mit Bronze-, Silber- und Gold-Abzeichen; 8 neu gebaute Maps mit eigenem Look, eigenen Gegnern und Hindernissen; neue Seltenheit Mythisch mit Blutmond-Reaktor und Himmelsspeer; seltene Türme sehen jetzt deutlich krasser aus; kein geschenkter Standard-Turm mehr; Intro entfernt, neuer Titel und Menü mit düsterer 3D-Landschaft; Musik stottert und bricht nicht mehr ab'],
  ['v0.9', 'Packfall ist jetzt ein echtes Tower Defense: Welt „Aschewald“ mit 8 Leveln und Endlos-Modus, bis zu 3 Sterne pro Level, Türme frei aufs Raster setzen und bis Stufe 5 ausbauen, Zielwahl, Wellen früher rufen. 12 maschinelle Türme mit sichtbaren Ausbaustufen, Loadout mit bis zu 5 Türmen, 9 Gegnerarten mit roter Kontur und Bosse. Komplett neue 3D-Grafik ohne Pixel, neue Werkstatt, Intro nur noch einmal am Tag, neuer Ladescreen. Weil das Spiel ganz neu ist, startet jeder Spielstand frisch.'],
  ['v0.8', 'Neues Spielprinzip mit Händler, Grundmünzen und Relikten; neue Werkstatt-Äste; neues Hauptmenü mit Nachtlandschaft; Abmelden führt zum Anmeldefenster'],
  ['v0.7', 'Drei neue Musikstücke mit Lautstärkereglern und Stückauswahl; Musik pausiert im Hintergrund; Menü übersichtlicher; lebendigere Welt'],
  ['v0.6', 'Neue Musik: düsterer Fantasy-Metal mit Gitarren-Riffs; Anmeldefenster übersichtlicher, Passwort schon ab 4 Zeichen'],
  ['v0.5', 'Neues Booster-Opening mit Lichtstrahlen und Bass-Sounds; ruhigere Oberfläche; Anmeldefenster beim Start'],
  ['v0.4', 'Neuer, düsterer Look mit gedeckten Farben'],
  ['v0.3', 'Neues Hauptmenü, Werkstatt-Baum, Start-Geschenk, Konten (Cloud)'],
  ['v0.2', 'Booster-Stil: düstere Arena'],
  ['v0.1', 'Erster Prototyp: Runs, Münzen, Gems, Booster'],
];

export function createUI(root, game, skin, { audio, cloud } = {}) {
  const ic = n => skin.icon(n);
  const sfx = (n, a) => audio?.play(n, a);
  const el = document.createElement('div');
  el.className = `kw s-${skin.name}`;
  el.innerHTML = `
    <section class="kw-stage" aria-label="Schlachtfeld">
      <div class="kw-thud run-only">
        <div class="kw-th-lv"><small data-k="lvname"></small><b data-k="wave"></b></div>
        <div class="kw-th-hp" title="Leben des Kerns">${ic('heart')}<span class="kw-bar"><i data-k="hpbar"></i></span><b data-k="hp"></b></div>
        <div class="kw-th-cash" title="Münzen – nur auf dieser Map">${ic('coin')}<b data-k="cash"></b></div>
        <div class="kw-th-gem" title="Gems von dieser Map – bleiben für immer">${ic('gem')}<b data-k="rgems"></b></div>
      </div>
      <div class="kw-tr run-only" data-k="tr"></div>
      <div class="kw-bossbar run-only" data-k="boss" hidden><small data-k="bossname"></small><span><i data-k="bossfill"></i></span></div>
      <p class="kw-phint run-only" data-k="phint" hidden></p>
      <div class="kw-tp run-only" data-k="tp" hidden></div>
      <div class="kw-dock run-only" data-k="dock"></div>
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
    <div class="kw-ov kw-sum" data-k="sum" hidden></div>
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
        <div class="kw-embers" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--x:${(i * 53) % 100}%;--d:${(i * 0.37) % 6}s;--s:${6 + (i % 5)}s"></i>`).join('')}</div>
        <div class="kw-sigil" aria-hidden="true"></div>
        <div class="kw-load-in">
          <div class="kw-wordmark"><b>Packfall</b><small>Die letzte Wacht</small></div>
          <div class="kw-loadrow"><b data-k="loadlbl">Baue die Welt auf …</b><span data-k="loadpct">0 %</span></div>
          <div class="kw-loadbar"><i data-k="loadbar"></i></div>
          <p class="kw-loadtip" data-k="loadtip"></p>
        </div>
      </div>
      <div class="kw-title">
        <span class="kw-title-bg" data-k="titlebg"></span>
        <div class="kw-title-main">
          <h1 class="kw-title-logo"><div class="kw-wordmark"><b>Packfall</b><small>Die letzte Wacht</small></div></h1>
          <div class="kw-fan" data-k="fan" aria-hidden="true"></div>
          <p class="kw-ribbon">Booster öffnen · Türme bauen · Kern halten</p>
          <button type="button" class="kw-press" data-k="press">Drücke Start</button>
        </div>
        <p class="kw-legal">Prototyp v0.9.1 · Spielstand wird automatisch gespeichert</p>
      </div>
      <div class="kw-auth" data-k="auth">
        <div class="kw-auth-in">
          <div class="kw-auth-logo"><div class="kw-wordmark"><b>Packfall</b><small>Die letzte Wacht</small></div></div>
          <p class="kw-ribbon">Booster öffnen · Türme bauen · Kern halten</p>
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
  ['lvname', 'wave', 'hp', 'hpbar', 'cash', 'rgems', 'tr', 'boss', 'bossname', 'bossfill', 'phint', 'tp', 'dock', 'banner', 'hitflash', 'menu', 'screen', 'bo', 'sum', 'intro', 'toast', 'open', 'loadlbl', 'loadpct', 'loadbar', 'loadtip', 'press', 'titlebg', 'fan', 'auth', 'authform', 'authpw2', 'autherr', 'authgo', 'authlb', 'news', 'newsh', 'newstxt', 'newsok'].forEach(n => { E[n] = k(n); });
  const stage = el.querySelector('.kw-stage');

  let screen = null;          // offene Unterseite
  let wsSel = 'kapital';      // gewählter Knoten im Werkstatt-Baum
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
  // KAMPF-HUD
  // =====================================================================
  const sel = { place: null, tower: null, hover: null };
  let battleCheck = () => '';
  const sfxLast = {};
  const sfxT = (n, gap, a) => { const now = performance.now(); if ((sfxLast[n] || 0) + gap * 1000 > now) return; sfxLast[n] = now; sfx(n, a); };
  const loadoutIds = () => game.meta.loadout.slice(0, game.loadoutSize());

  function trHTML() {
    const s = game.meta.speed || 1, p = !!game.paused;
    return `<div class="kw-seg" role="group" aria-label="Tempo">${[1, 2, 3].map(v => `<button type="button" data-act="speed" data-v="${v}" aria-pressed="${s === v && !p}">${v}×</button>`).join('')}<button type="button" data-act="pause" aria-pressed="${p}" title="Pause (P)" aria-label="Pause">${ic(p ? 'play' : 'pause')}</button></div>
      <button type="button" class="kw-btn kw-btn-sm${abandonArm > Date.now() ? ' is-warn' : ''}" data-act="abandon">${ic('flag')}<span>${abandonArm > Date.now() ? 'Wirklich?' : 'Aufgeben'}</span></button>`;
  }
  function dockHTML() {
    const R = game.run;
    if (!R || R.phase === 'done') return '';
    const slots = game.meta.loadout.map((id, i) => {
      if (i >= game.loadoutSize()) return `<div class="kw-ls is-locked" title="Platz ${i + 1} in der Werkstatt freischalten">${ic('lock')}</div>`;
      if (!id) return `<div class="kw-ls is-empty"><kbd>${i + 1}</kbd></div>`;
      const d = T[id], cost = game.towerCost(id), n = R.built[id] || 0, poor = R.cash < cost, full = n >= d.limit;
      return `<button type="button" class="kw-ls r-${d.rarity}${sel.place === id ? ' is-sel' : ''}${poor || full ? ' is-poor' : ''}" style="--ac:${d.accent};--rc:${RARITIES[d.rarity].color}" data-act="pick" data-id="${id}" title="${d.name} · ${d.role}">
        <kbd>${i + 1}</kbd><span class="kw-ls-art">${skin.towerArt(id)}</span><b>${d.name}</b><span class="kw-ls-cost">${ic('coin')}${fmt(cost)}</span><small>${full ? 'Limit' : `${n}/${d.limit}`}</small></button>`;
    }).join('');
    let wb;
    if (R.phase === 'prep') wb = `<button type="button" class="kw-wb is-go" data-act="callWave">${ic('play')}<span><b>Welle 1 starten</b><small>Leertaste</small></span></button>`;
    else if (game.canCall()) { const b = game.callBonus(); wb = `<button type="button" class="kw-wb is-next" data-act="callWave">${ic('speed')}<span><b>Nächste Welle${R.timerOn ? ` · ${Math.ceil(Math.max(0, R.nextT))} s` : ''}</b><small>${b > 0 ? `Früh rufen: +${fmt(b)}` : 'Leertaste'}</small></span></button>`; }
    else wb = `<div class="kw-wb is-run">${ic('wave')}<span><b>${R.waves !== Infinity && R.wave >= R.waves ? 'Letzte Welle!' : 'Welle läuft'}</b><small>${R.queue.length ? `${R.queue.length} Gegner kommen noch` : `${game.enemies.length} Gegner übrig`}</small></span></div>`;
    return `<div class="kw-lsrow">${slots}</div>${wb}`;
  }
  function tpHTML() {
    const tw = sel.tower, R = game.run;
    if (!tw || !R || R.phase === 'done' || !game.towers.includes(tw)) return '';
    const d = tw.def, s = game.stats(tw), next = tw.lv + 1 < MAX_LV ? game.towerStats(tw.id, tw.lv + 1, tw.buff) : null, cost = game.upgradeCost(tw);
    const pc = v => `${Math.round(v * 100)} %`;
    const row = (lbl, a, b, f = v => fmtNum(v, 1)) => (a == null ? '' : `<div><dt>${lbl}</dt><dd>${f(a)}${b != null && f(b) !== f(a) ? `<i>→ ${f(b)}</i>` : ''}</dd></div>`);
    const rows = [];
    if (d.kind === 'farm') rows.push(row('Ertrag pro Welle', s.income, next?.income, v => fmt(v)));
    else if (d.kind === 'support') { rows.push(row('Schaden-Bonus', s.bDmg, next?.bDmg, pc)); rows.push(row('Tempo-Bonus', s.bRate, next?.bRate, pc)); if (s.bRange || next?.bRange) rows.push(row('Reichweite-Bonus', s.bRange, next?.bRange, pc)); }
    else {
      if (s.dps != null) rows.push(row('Schaden/s', s.dps, next?.dps));
      else rows.push(row(d.kind === 'missile' ? 'Schaden je Rakete' : 'Schaden', s.dmg, next?.dmg));
      if (d.kind === 'missile') rows.push(row('Raketen', s.n, next?.n, v => v));
      if (s.rate) rows.push(row('Schüsse/s', s.rate, next?.rate, v => fmtNum(v, 2)));
      if (d.kind === 'tesla') rows.push(row('Sprünge', s.chain, next?.chain, v => v));
      if (d.kind === 'plasma') rows.push(row('Durchschlag', s.pierce, next?.pierce, v => v));
      if (s.slow) rows.push(row('Verlangsamt', s.slow, next?.slow, pc));
      if (s.splash) rows.push(row('Fläche', s.splash, next?.splash));
      if (s.burn) rows.push(row('Brand/s', s.burn, next?.burn));
    }
    if (s.range && d.kind !== 'farm') rows.push(row('Reichweite', s.range, next?.range, rngTxt));
    const pips = Array.from({ length: MAX_LV }, (_, i) => `<i class="${i <= tw.lv ? 'on' : ''}"></i>`).join('');
    const canUp = cost != null && R.cash >= cost;
    const modes = d.kind === 'farm' || d.kind === 'support' ? '' : `<div class="kw-tp-mode"><small>Ziel</small><div class="kw-seg">${Object.entries(MODES).map(([k2, n]) => `<button type="button" data-act="mode" data-v="${k2}" aria-pressed="${tw.mode === k2}">${n}</button>`).join('')}</div></div>`;
    const buff = tw.buff ? `<p class="kw-tp-buff">${ic('up')} Verstärkt: +${Math.round(tw.buff.dmg * 100)} % Schaden, +${Math.round(tw.buff.rate * 100)} % Tempo</p>` : '';
    return `<div class="kw-box kw-tp-in" style="--ac:${d.accent};--rc:${RARITIES[d.rarity].color}">
      <header><span class="kw-tp-art">${skin.towerArt(tw.id, { max: tw.lv >= 4 })}</span><div><b>${d.name}</b><small>${tw.lv ? d.lv[tw.lv].name : d.role}</small><span class="kw-pips">${pips}</span></div><button type="button" class="kw-x" data-act="deselect" aria-label="Schließen">${ic('x')}</button></header>
      <dl class="kw-tp-st">${rows.join('')}</dl>${buff}
      ${d.kind !== 'farm' && d.kind !== 'support' ? '<p class="kw-tp-kills"></p>' : ''}
      ${cost != null ? `<button type="button" class="kw-btn kw-tp-up${canUp ? ' kw-btn-primary' : ''}" data-act="upT"${canUp ? '' : ' aria-disabled="true"'}><span><b>${d.lv[tw.lv + 1].name}</b><small>Ausbau auf Stufe ${tw.lv + 2} · Taste E</small></span><em>${ic('coin')}${fmt(cost)}</em></button>` : '<p class="kw-tp-max">Voll ausgebaut</p>'}
      ${modes}
      <button type="button" class="kw-btn kw-btn-sm kw-tp-sell" data-act="sellT">${ic('sell')}<span>Verkaufen · +${fmt(game.sellValue(tw))}</span></button>
    </div>`;
  }
  function pickTower(id) {
    const R = game.run; if (!R || R.phase === 'done' || !id) return;
    if (sel.place === id) { sel.place = null; sfx('click'); return; }
    sel.place = id; sel.tower = null; sfx('nav');
    if (R.cash < game.towerCost(id)) toast(`${T[id].name} kostet ${fmt(game.towerCost(id))} Münzen.`);
    else if ((R.built[id] || 0) >= T[id].limit) toast(`Maximal ${T[id].limit}× ${T[id].name} pro Map.`);
    last.dock = null;
  }
  function callWave() { if (game.callWave()) { sfx('wave'); last.dock = null; } else sfx('deny'); }
  function upgradeSel() {
    const tw = sel.tower; if (!tw) return;
    const c = game.upgradeCost(tw);
    if (c == null) { sfx('deny'); toast('Schon voll ausgebaut.'); return; }
    if (!game.upgrade(tw)) { sfx('deny'); toast(`Dir fehlen ${fmt(c - game.run.cash)} Münzen.`); return; }
    sfx('reveal', tw.lv >= 4 ? 'legendary' : tw.lv >= 2 ? 'epic' : 'rare'); last.tp = null;
  }
  function sellSel() { const tw = sel.tower; if (!tw) return; game.sell(tw); sel.tower = null; last.tp = null; }
  function boardHover(h) { sel.hover = h; }
  function boardClick(h) {
    const R = game.run; if (!R || R.phase === 'done' || !h) return;
    audio?.unlock();
    if (!h.inside) { sel.tower = null; sel.place = null; return; }
    const tw = game.towerAt(h.c, h.r);
    if (sel.place) {
      if (tw) { sel.place = null; sel.tower = tw; sfx('nav'); return; }
      const why = game.placeCheck(sel.place, h.c, h.r);
      if (why) { sfx('deny'); toast(why === 'limit' ? `Maximal ${T[sel.place].limit}× ${T[sel.place].name} pro Map.` : why === 'cash' ? `Dir fehlen ${fmt(game.towerCost(sel.place) - R.cash)} Münzen.` : WHY[why] || 'Geht hier nicht.'); return; }
      const id = sel.place;
      game.place(id, h.c, h.r);
      if (!shiftDown || R.cash < game.towerCost(id)) sel.place = null;
      last.dock = null;
      return;
    }
    if (tw) { sel.tower = sel.tower === tw ? null : tw; sfx('nav'); } else sel.tower = null;
    last.tp = null;
  }
  function boardCancel() { if (sel.place || sel.tower) sfx('click'); sel.place = null; sel.tower = null; last.dock = null; }
  let shiftDown = false;
  const onKey = e => {
    shiftDown = e.shiftKey;
    const R = game.run;
    if (!R || R.phase === 'done' || e.type !== 'keydown' || e.target?.closest?.('input,textarea') || !E.sum.hidden) return;
    const key = e.key;
    if (key >= '1' && key <= '5') { const i = +key - 1; if (i < game.loadoutSize()) pickTower(game.meta.loadout[i]); }
    else if (key === 'Escape') boardCancel();
    else if (key === ' ') { e.preventDefault(); callWave(); }
    else if (key === 'e' || key === 'E' || key === 'u') upgradeSel();
    else if (key === 'x' || key === 'Delete') sellSel();
    else if (key === 'p' || key === 'P') { game.setPaused(!game.paused); last.tr = null; }
  };
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKey);
  function insets() {
    if (!game.run) return { top: 0, bottom: 0, left: 0, right: 0 };
    const sr = stage.getBoundingClientRect();
    const th = el.querySelector('.kw-thud')?.getBoundingClientRect(), dk = E.dock.getBoundingClientRect();
    return { top: th && th.height ? Math.round(th.bottom - sr.top + 8) : 64, bottom: dk.height ? Math.round(sr.bottom - dk.top + 6) : 110, left: 0, right: 0 };
  }
  function startLevel(li, diff = diffSel) {
    const err = battleCheck();
    if (err) { sfx('deny'); toast(err); return; }
    if (!Object.keys(game.meta.towers).length) { sfx('deny'); toast('Öffne zuerst dein Start-Geschenk im Booster-Laden.'); openScreen('booster'); return; }
    if (!game.levelUnlocked(li)) { sfx('deny'); toast('Diese Map ist noch gesperrt.'); return; }
    if (!loadoutIds().some(Boolean)) { sfx('deny'); toast('Stell zuerst ein Loadout zusammen.'); openScreen('tuerme'); return; }
    sfx('wave'); closeScreen(); E.sum.hidden = true;
    sel.place = sel.tower = null; game.setPaused(false);
    if (game.run) game.leaveRun();
    game.startLevel(li, diff);
  }

  // =====================================================================
  // HAUPTMENÜ
  // =====================================================================
  function playerName() { return cloud?.st?.status === 'online' ? cloud.st.name : 'Gast'; }
  function wsAvailable() {
    return UPGRADES.filter(u => !game.wsMaxed(u.id) && game.wsReqMet(u.id) && game.meta.gems >= game.wsCost(u.id)).length;
  }
  function nextLevelIdx() { for (let i = 0; i < LEVELS.length; i++) if (!game.anyMedal(i)) return i; return 'endless'; }
  function menuHTML() {
    const m = game.meta;
    const owned = Object.keys(m.towers).length;
    const affordable = Object.entries(BOOSTERS).some(([, b]) => !b.hidden && m.gems >= b.cost);
    const giftOpen = !m.flags.gift;
    const avail = wsAvailable();
    const nx = nextLevelIdx();
    const nxName = !Object.keys(m.towers).length ? 'Öffne zuerst dein Start-Geschenk' : nx === 'endless' ? `Kampagne · ${game.totalMedals()}/${LEVELS.length * 3} Abzeichen` : `Map ${nx + 1} · ${LEVELS[nx].name}`;
    const mb = (act, v, icon, title, sub, extra = '', primary = false) => `<button type="button" class="kw-mi${primary ? ' is-primary' : ''}" data-act="${act}" ${v ? `data-v="${v}"` : ''}>
      <span class="kw-mi-ic">${ic(icon)}</span><span class="kw-mi-tx"><b>${title}</b><small>${sub}</small></span>${extra}</button>`;
    const badge = t => `<span class="kw-mi-badge">${t}</span>`;
    const lb = lbRows
      ? (lbRows.length ? lbRows.map((r, i) => `<li class="${r.me ? 'is-me' : ''}"><span class="kw-lb-n">${i + 1}</span><span class="kw-lb-name">${esc(r.name)}</span><span class="kw-lb-v">Welle ${r.best_wave}</span><small>${fmt(r.total_gems)} Gems · ${r.heroes || 0} Türme</small></li>`).join('') : '<li class="kw-lb-empty">Noch niemand eingetragen. Sei der Erste!</li>')
      : `<li class="is-me"><span class="kw-lb-n">1</span><span class="kw-lb-name">${esc(playerName())}</span><span class="kw-lb-v">Welle ${m.best}</span><small>${fmt(m.totalGems)} Gems · ${owned} Türme</small></li>`;
    const stars = game.totalMedals(), cleared = game.levelsCleared();
    return `<div class="kw-menu-in">
      <header class="kw-mhead">
        <h1 class="kw-menu-logo"><div class="kw-wordmark"><b>Packfall</b><small>Die letzte Wacht</small></div></h1>
        <div class="kw-pbar">
          <span>${ic('user')}<b>${esc(playerName())}</b></span>
          <span>${ic('gem')}<b>${fmt(m.gems)}</b></span>
          <span class="is-star">${ic('medal')}<b>${stars}/${LEVELS.length * 3}</b></span>
          <span>${ic('turret')}<b>${owned}/${TOWERS.length}</b></span>
        </div>
      </header>

      <main class="kw-center">
        <nav class="kw-box kw-mm" aria-label="Hauptmenü">
          ${mb('open', 'welt', 'sword', 'Kämpfen', nxName, '', true)}
          ${mb('open', 'booster', 'pack', 'Booster-Laden', giftOpen ? 'Ein Geschenk wartet auf dich!' : 'Turm-Booster · Elite-Booster', giftOpen ? badge('Geschenk') : affordable ? badge('!') : '')}
          ${mb('open', 'werkstatt', 'anvil', 'Werkstatt', avail ? `${avail} Ausbau${avail === 1 ? '' : 'ten'} möglich` : 'Dauerhafte Verbesserungen', avail ? badge(avail) : '')}
          ${mb('open', 'tuerme', 'turret', 'Türme', `Sammlung ${owned}/${TOWERS.length} · Loadout ${loadoutIds().filter(Boolean).length}/${game.loadoutSize()}`)}
          ${mb('open', 'bestiarium', 'skull', 'Bestiarium', `${Object.keys(ENEMIES).length} Gegnerarten`)}
          ${mb('open', 'statistik', 'chart', 'Statistik', `${fmt(m.runs)} Spiele · ${fmt(m.kills)} Gegner besiegt`)}
          ${mb('open', 'einstellungen', 'gear', 'Einstellungen', `Anleitung · Sound · Grafik · ${cloud?.st?.status === 'online' ? 'Abmelden' : 'Login'}`)}
        </nav>
        <p class="kw-loc">${ic('map')} Welt 1 · Aschewald</p>
      </main>
      <div class="kw-sides">
      <aside class="kw-box kw-side kw-side-l">
        <h3>${ic('flag')} Fortschritt</h3>
        <dl class="kw-kv">
          <div><dt>Maps geschafft</dt><dd>${cleared}/${LEVELS.length}</dd></div>
          <div><dt>Abzeichen</dt><dd>${stars}/${LEVELS.length * 3}</dd></div>
          <div><dt>Endlos-Rekord</dt><dd>${game.levelUnlocked('endless') ? `Welle ${m.best}` : 'gesperrt'}</dd></div>
          <div><dt>Türme</dt><dd>${owned}/${TOWERS.length}</dd></div>
        </dl>
        <h3>${ic('trophy')} Herausforderungen</h3>
        <div class="kw-chal"><div><b>Tägliche Map</b><small>Gleiche Map & Wellen für alle</small></div><span class="kw-soon">Bald</span></div>
        <div class="kw-chal"><div><b>Welt 2</b><small>Neue Gegner, neue Maps</small></div><span class="kw-soon">Bald</span></div>
      </aside>
      <aside class="kw-box kw-side kw-side-r">
        <h3>${ic('trophy')} Bestenliste · Endlos</h3>
        <ol class="kw-lb">${lb}</ol>
        <p class="kw-note">${lbRows ? 'Aktualisiert sich jede Minute.' : (lbMsg || 'Online-Bestenliste mit Konto auf der echten Spielseite.')}</p>
        <button type="button" class="kw-btn kw-btn-sm" ${cloud?.st?.status === 'online' ? 'data-act="open" data-v="konto"' : 'data-act="toLogin"'}>${ic('user')}<span>${cloud?.st?.status === 'online' ? 'Konto' : 'Einloggen / Registrieren'}</span></button>
      </aside>
      </div>
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
  const TITLES = { welt: ['map', 'Welt 1 · Aschewald'], booster: ['pack', 'Booster-Laden'], werkstatt: ['anvil', 'Werkstatt'], tuerme: ['turret', 'Türme'], bestiarium: ['skull', 'Bestiarium'], statistik: ['chart', 'Statistik'], einstellungen: ['gear', 'Einstellungen'], konto: ['user', 'Konto'] };
  const STATIC = new Set(['konto', 'einstellungen']); // nicht ständig neu zeichnen (Eingabefelder)

  function shopHTML() {
    const m = game.meta;
    const cells = [];
    if (!m.flags.gift) {
      cells.push(`<div class="kw-shopcell is-gift">
        <div class="kw-price is-free">Gratis</div>
        <div class="kw-shopimg">${skin.packArt('starter')}</div>
        <b>Start-Geschenk</b><small>Ein Turm · garantiert Selten</small>
        <button type="button" class="kw-btn kw-btn-primary" data-act="booster" data-v="starter">Öffnen</button></div>`);
    }
    Object.entries(BOOSTERS).filter(([, b]) => !b.hidden).forEach(([kind, b]) => {
      const can = m.gems >= b.cost;
      cells.push(`<div class="kw-shopcell k-${kind}">
        <div class="kw-price">${costHTML('gem', b.cost)}</div>
        <div class="kw-shopimg">${skin.packArt(kind)}</div>
        <b>${b.name}</b><small>1 Turm${kind === 'elite' ? ' · mind. Selten' : ''}</small>
        <ul class="kw-odds">${Object.entries(b.odds).map(([r, v]) => `<li style="--rc:${RARITIES[r].color}"><span>${RARITIES[r].name}</span><span>${v} %</span></li>`).join('')}<li class="foil"><span>Glanz</span><span>${Math.round(b.foil * 100)} %</span></li></ul>
        <button type="button" class="kw-btn${can ? ' kw-btn-primary' : ''}" data-act="booster" data-v="${kind}"${can ? '' : ' aria-disabled="true"'}>${can ? 'Öffnen' : `Fehlen ${fmt(b.cost - m.gems)}`}</button></div>`);
    });
    return `<div class="kw-shop">${cells.join('')}</div>
      <p class="kw-hint">Jeder Booster enthält einen Turm. Doppelte geben Sterne (bis ★5, je +10 % Stärke). Glanz-Türme sind dauerhaft 10 % stärker.</p>
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
      nodes.push(`<button type="button" class="${cls}" style="left:${pos[0]}%;top:${pos[1]}%" data-act="selWs" data-id="${u.id}" aria-label="${u.name}, Stufe ${L} von ${game.wsMax(u.id)}" aria-pressed="${wsSel === u.id}">
        ${ic(!met ? 'lock' : u.icon)}<span class="kw-node-lv">${L}</span>
        <span class="kw-node-tip${pos[0] > 75 ? ' is-left' : ''}${pos[1] > 70 ? ' is-up' : ''}" role="tooltip"><b>${u.name} <i>Stufe ${L}/${game.wsMax(u.id)}</i></b><small>${game.wsEffectText(u.id)}</small>${maxed ? '<em>Voll ausgebaut</em>' : !met ? `<em class="is-warn">Benötigt: ${U[u.req[0]].name} Stufe ${u.req[1]}</em>` : `<em>${L === 0 ? 'Freischalten' : 'Nächste: ' + game.wsEffectText(u.id, L + 1)} · ${fmt(game.wsCost(u.id))} Gems</em>`}</span></button>`);
    });
    const u = U[wsSel];
    const L = game.wsLevel(wsSel), maxed = game.wsMaxed(wsSel), met = game.wsReqMet(wsSel), cost = game.wsCost(wsSel);
    const can = met && !maxed && game.meta.gems >= cost;
    const req = u.req ? `Benötigt: ${U[u.req[0]].name} Stufe ${u.req[1]}` : '';
    const detail = `<div class="kw-box kw-detail">
      <div class="kw-detail-ic">${ic(u.icon)}</div>
      <div class="kw-detail-tx">
        <b>${u.name} <span>Stufe ${L}/${game.wsMax(wsSel)}</span></b>
        <small>${game.wsEffectText(wsSel)}</small>
        ${!maxed ? `<em>${L === 0 ? 'Freischalten: dauerhafter Bonus' : `Nächste: ${game.wsEffectText(wsSel, L + 1)}`}</em>` : '<em>Voll ausgebaut</em>'}
        ${!met ? `<small class="is-warn">${req}</small>` : ''}
      </div>
      <button type="button" class="kw-btn${can ? ' kw-btn-primary' : ''}" data-act="buyWs" data-id="${wsSel}"${can ? '' : ' aria-disabled="true"'}>${maxed ? 'Maximal' : `${L === 0 ? 'Freischalten' : 'Ausbauen'} · ${costHTML('gem', cost)}`}</button>
    </div>`;
    return `<p class="kw-hint">Gems bleiben für immer. Jeder Ausbau wirkt sofort in allen Leveln. Fahr über einen Knoten für Details.</p>
      <div class="kw-box kw-tree"><svg class="kw-tree-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines.join('')}</svg>${nodes.join('')}</div>
      ${detail}`;
  }

  // ---------- Kampagne: Maps mit Schwierigkeitsgraden (wie Bloons) ----------
  let lvlSel = null, diffSel = 'leicht';
  const medalsHTML = i => `<span class="kw-medals">${DIFF_IDS.map(d => `<i class="m-${MEDAL[d]}${game.hasMedal(i, d) ? ' on' : ''}" title="${DIFFS[d].name}: ${DIFFS[d].medal}">${ic('medal')}</i>`).join('')}</span>`;
  function weltHTML() {
    if (lvlSel == null || (!game.levelUnlocked(lvlSel) && lvlSel !== nextLevelIdx())) lvlSel = nextLevelIdx();
    const ids = [...LEVELS.map((_, i) => i), 'endless'];
    const cards = ids.map(i => {
      const L = i === 'endless' ? ENDLESS : LEVELS[i], open = game.levelUnlocked(i);
      const sub = i === 'endless' ? `<span class="kw-lv-rec">${open ? `Rekord: Welle ${game.meta.best}` : 'Nach Map 8'}</span>` : medalsHTML(i);
      return `<button type="button" class="kw-lv t-${L.theme}${open ? '' : ' is-locked'}${lvlSel === i ? ' is-sel' : ''}${i === 'endless' ? ' is-endless' : ''}" data-act="lvl" data-v="${i}">
        <span class="kw-lv-map">${skin.mapArt(i)}${open ? '' : `<span class="kw-lv-lock">${ic('lock')}</span>`}</span>
        <span class="kw-lv-tx"><small>${i === 'endless' ? 'Endlos' : `Map ${i + 1} · ${THEMES[L.theme].name}`}</small><b>${L.name}</b>${sub}</span></button>`;
    }).join('');
    const i = lvlSel, open = game.levelUnlocked(i), info = game.levelInfo(i);
    const L = levelDef(i, diffSel);
    const foes = i === 'endless' ? [...L.foes, 'koloss', 'fuerst'] : [...L.foes, L.final || 'koloss'];
    const lo = loadoutIds();
    const diffs = i === 'endless' ? '' : `<h4>Schwierigkeit</h4><div class="kw-diffs">${DIFF_IDS.map(d => `<button type="button" class="kw-diff m-${MEDAL[d]}${diffSel === d ? ' is-sel' : ''}${game.hasMedal(i, d) ? ' has' : ''}" data-act="diff" data-v="${d}"><span class="kw-diff-m">${ic('medal')}</span><b>${DIFFS[d].name}</b><small>${DIFFS[d].waves} Wellen</small></button>`).join('')}</div>`;
    const desc = i === 'endless' ? 'Unendlich viele Wellen. Jede 10. Welle ein Koloss, jede 25. der Schattenfürst. Zählt für die Bestenliste.'
      : `${L.paths.length > 1 ? '2 Eingänge · ' : ''}${info.clears ? `${info.clears}× geschafft` : 'noch nicht geschafft'} · Abzeichen ${DIFFS[diffSel].medal}${game.hasMedal(i, diffSel) ? ' ✓' : ''}`;
    return `<div class="kw-welt">
      <div class="kw-lvgrid">${cards}</div>
      <div class="kw-box kw-lvd">
        <div class="kw-lvd-map">${skin.mapArt(i)}</div>
        <small class="kw-lvd-k">${i === 'endless' ? 'Endlos-Modus' : `Welt 1 · Map ${i + 1} · ${THEMES[L.theme].name}`}</small>
        <h3>${L.name}</h3>
        <p class="kw-lvd-desc">${desc}</p>
        ${diffs}
        <p class="kw-lvd-tip">${ic('help')}<span>${L.tip}</span></p>
        <h4>Gegner${i === 'endless' ? '' : ` · ${DIFFS[diffSel].name}`}</h4>
        <div class="kw-foes">${foes.map(f => `<span class="kw-foe${ENEMIES[f].boss ? ' is-boss' : ''}" title="${ENEMIES[f].name}">${skin.enemyArt(f)}</span>`).join('')}</div>
        <h4>Loadout <button type="button" class="kw-link" data-act="open" data-v="tuerme">ändern</button></h4>
        <div class="kw-lvd-lo">${Array.from({ length: 5 }, (_, k2) => (k2 >= game.loadoutSize() ? `<span class="is-locked">${ic('lock')}</span>` : lo[k2] ? `<span class="r-${T[lo[k2]].rarity}" style="--rc:${RARITIES[T[lo[k2]].rarity].color}" title="${T[lo[k2]].name}">${skin.towerArt(lo[k2])}</span>` : '<span class="is-empty"></span>')).join('')}</div>
        <button type="button" class="kw-btn kw-btn-primary kw-btn-lg kw-lvd-go" data-act="play" data-v="${i}"${open ? '' : ' aria-disabled="true"'}>${ic(open ? 'play' : 'lock')}<span>${open ? (i === 'endless' ? 'Starten' : `Starten · ${DIFFS[diffSel].name}`) : i === 'endless' ? 'Schließe Map 8 ab' : `Schließe Map ${i} ab`}</span></button>
      </div>
    </div>`;
  }

  // ---------- Türme: Sammlung & Loadout ----------
  let towSel = null;
  function tuermeHTML() {
    const m = game.meta, size = game.loadoutSize();
    if (!towSel || !T[towSel]) towSel = Object.keys(m.towers)[0] || TOWERS[0].id;
    const lo = m.loadout.map((id, i) => (i >= size ? `<div class="kw-lo is-locked">${ic('lock')}<small>Werkstatt</small></div>`
      : id ? `<button type="button" class="kw-lo r-${T[id].rarity}" style="--rc:${RARITIES[T[id].rarity].color}" data-act="tsel" data-id="${id}"><span class="kw-lo-art">${skin.towerArt(id)}</span><b>${T[id].name}</b><small>${ic('coin')}${fmt(game.towerCost(id))}</small></button>`
        : `<div class="kw-lo is-empty">${ic('plus')}<small>Platz ${i + 1}</small></div>`)).join('');
    const coll = TOWERS.map(d => {
      const own = m.towers[d.id];
      if (!own) return `<button type="button" class="kw-tc r-${d.rarity} is-unknown${towSel === d.id ? ' is-sel' : ''}" style="--rc:${RARITIES[d.rarity].color}" data-act="tsel" data-id="${d.id}"><span class="kw-tc-art">${skin.towerArt(d.id, { unknown: true })}</span><b>???</b><small>${RARITIES[d.rarity].name}</small></button>`;
      const inLo = m.loadout.includes(d.id);
      return `<button type="button" class="kw-tc r-${d.rarity}${towSel === d.id ? ' is-sel' : ''}${inLo ? ' is-in' : ''}${own.foil ? ' foil' : ''}" style="--rc:${RARITIES[d.rarity].color}" data-act="tsel" data-id="${d.id}"><span class="kw-tc-art">${skin.towerArt(d.id)}</span><b>${d.name}</b><span class="kw-tstars">${starsHTML(game.starOf(d.id))}</span>${inLo ? `<em title="Im Loadout">${ic('check')}</em>` : ''}</button>`;
    }).join('');
    const d = T[towSel], own = m.towers[towSel], st = game.starOf(towSel), nxt = game.nextStarAt(towSel), inLo = m.loadout.includes(towSel);
    const val = lv => (d.kind === 'farm' ? `${fmt(game.towerStats(d.id, lv).income)}/Welle` : d.kind === 'support' ? `+${Math.round(game.towerStats(d.id, lv).bDmg * 100)} %` : `${fmtNum(game.dps(d.id, lv), 1)}`);
    const detail = `<div class="kw-box kw-tdet r-${d.rarity}" style="--rc:${RARITIES[d.rarity].color};--ac:${d.accent}">
      <div class="kw-tdet-art">${own ? skin.towerArt(d.id, { max: true }) : skin.towerArt(d.id, { unknown: true })}${own ? '<small>Stufe 5</small>' : ''}</div>
      <small class="kw-tdet-rar">${RARITIES[d.rarity].name} · ${d.role}</small>
      <h3>${own ? d.name : '???'}</h3>
      <p>${own ? d.desc : 'Noch nicht gefunden. Kommt aus Boostern.'}</p>
      ${own ? `<div class="kw-tdet-star"><span class="kw-tstars">${starsHTML(st)}</span><small>${nxt ? `${own.copies}/${nxt} Kopien bis ★${st + 1}` : 'Maximale Sterne'}${own.foil ? ' · Glanz' : ''}</small></div>
      <table class="kw-tdet-tab"><thead><tr><th>Stufe</th><th>Ausbau</th><th>${ic('coin')}</th><th>${d.kind === 'farm' ? 'Ertrag' : d.kind === 'support' ? 'Bonus' : 'Schaden/s'}</th></tr></thead><tbody>${d.lv.map((L, i) => `<tr><td>${i + 1}</td><td>${i ? L.name : 'Bauen'}</td><td>${fmt(game.towerCost(d.id, i))}</td><td>${val(i)}</td></tr>`).join('')}</tbody></table>
      <p class="kw-tdet-meta">${d.kind === 'farm' || d.kind === 'support' ? '' : d.air ? `${ic('check')} Trifft Flieger · ` : `${ic('x')} Keine Flieger · `}max. ${d.limit} pro Map</p>
      <button type="button" class="kw-btn${inLo ? '' : ' kw-btn-primary'}" data-act="tload" data-id="${d.id}">${ic(inLo ? 'x' : 'plus')}<span>${inLo ? 'Aus dem Loadout nehmen' : 'Ins Loadout'}</span></button>` : ''}
    </div>`;
    return `<p class="kw-hint">Dein Loadout sind die Türme, die du auf der Map bauen kannst. Doppelte aus Boostern geben Sterne: jeder Stern macht den Turm 10 % stärker.</p>
      <div class="kw-box kw-lorow"><h4>Loadout</h4>${lo}</div>
      <div class="kw-tw"><div class="kw-tgrid">${coll}</div>${detail}</div>`;
  }

  function bestiaryHTML() {
    return `<div class="kw-bgrid">${Object.entries(ENEMIES).map(([id, E2]) => `<div class="kw-box kw-bcell${E2.boss ? ' is-boss' : ''}">
      <span class="kw-bart">${skin.enemyArt(id)}</span>
      <div><b>${E2.name}</b><small>${E2.desc}</small>
      <ul class="kw-bstats"><li><span>Leben</span><span>${fmt(E2.hp)}</span></li><li><span>Tempo</span><span>${fmtNum(E2.speed)}</span></li><li><span>Kernschaden</span><span>${E2.dmg}</span></li><li><span>Ab Level</span><span>${firstLevel(id)}</span></li>${E2.armor ? `<li><span>Panzer</span><span>${Math.round(E2.armor * 100)} %</span></li>` : ''}${E2.air ? '<li><span>Fliegt</span><span>ja</span></li>' : ''}</ul></div></div>`).join('')}</div>`;
  }

  function statsHTML() {
    const m = game.meta;
    const h = Math.floor((m.playTime || 0) / 3600), mi = Math.floor(((m.playTime || 0) % 3600) / 60);
    const cells = [
      ['Maps geschafft', `${game.levelsCleared()}/${LEVELS.length}`], ['Abzeichen', `${game.totalMedals()}/${LEVELS.length * 3}`], ['Endlos-Rekord', `Welle ${m.best}`], ['Spiele', fmt(m.runs)],
      ['Siege', fmt(m.wins || 0)], ['Gegner besiegt', fmt(m.kills)], ['Bosse besiegt', fmt(m.bossKills || 0)], ['Türme gebaut', fmt(m.built || 0)],
      ['Gems gesammelt', fmt(m.totalGems)], ['Booster geöffnet', fmt(m.packs)], ['Türme gesammelt', `${Object.keys(m.towers).length}/${TOWERS.length}`], ['Spielzeit', `${h} h ${mi} min`],
    ];
    return `<div class="kw-sgrid">${cells.map(([a, b]) => `<div class="kw-box kw-scell"><small>${a}</small><b>${b}</b></div>`).join('')}</div>`;
  }

  function settingsHTML() {
    const s = game.meta.settings;
    const seg = (key, opts) => `<div class="kw-seg" role="group">${opts.map(([v, n]) => `<button type="button" data-act="set" data-k="${key}" data-v="${v}" aria-pressed="${String(s[key]) === String(v)}">${n}</button>`).join('')}</div>`;
    const slider = (key, d) => { const v = Number.isFinite(+s[key]) ? +s[key] : d; return `<label class="kw-vol"><input type="range" min="0" max="1" step="0.05" value="${v}" data-act="vol" data-k="${key}" aria-label="Lautstärke"><span data-k="${key}lbl">${v > 0 ? Math.round(v * 100) + ' %' : 'Aus'}</span></label>`; };
    const line = (icon, t, sub, ctl) => `<div class="kw-sline"><span class="kw-sline-ic">${ic(icon)}</span><div><b>${t}</b><small>${sub}</small></div>${ctl}</div>`;
    const online = cloud?.st?.status === 'online';
    return `<div class="kw-sgrp kw-box"><h4>${ic('speed')} Audio</h4>
        ${line('speed', 'Soundeffekte', 'Kampf, Klicks, Booster', slider('sfxVol', 0.5))}
        ${line('play', 'Musik', 'Lautstärke der Musik', slider('musicVol', 0.4))}
        ${line('scroll', 'Musikstück', `Läuft gerade: <b data-k="nowplaying">${audio?.track || '–'}</b>`, `<div class="kw-seg kw-seg-wrap" role="group">${[['mix', 'Abwechselnd'], ...(audio?.tracks || []).map((n, i) => [i, n])].map(([v, n]) => `<button type="button" data-act="set" data-k="musicTrack" data-v="${v}" aria-pressed="${String(s.musicTrack ?? 'mix') === String(v)}">${n}</button>`).join('')}${(s.musicTrack ?? 'mix') === 'mix' ? '<button type="button" data-act="skipTrack">Nächstes ▸</button>' : ''}</div>`)}</div>
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
        <span class="kw-acc-b">${online ? `<button type="button" class="kw-btn kw-btn-sm" data-act="saveNow">${ic('check')}<span>Jetzt speichern</span></button><button type="button" class="kw-btn kw-btn-sm" data-act="logout">${ic('logout')}<span>Abmelden</span></button>` : `<button type="button" class="kw-btn kw-btn-sm kw-btn-primary" data-act="toLogin">${ic('user')}<span>Zum Login</span></button>`}</span></div></div>
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
    const body = screen === 'booster' ? shopHTML() : screen === 'werkstatt' ? treeHTML() : screen === 'tuerme' ? tuermeHTML() : screen === 'welt' ? weltHTML()
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
      case 'speed': game.setSpeed(+v); if (game.paused) game.setPaused(false); sfx('click'); last.tr = null; break;
      case 'pause': game.setPaused(!game.paused); sfx('click'); last.tr = null; break;
      case 'pick': pickTower(id); break;
      case 'callWave': callWave(); break;
      case 'upT': upgradeSel(); break;
      case 'sellT': sellSel(); break;
      case 'mode': if (sel.tower) { game.setMode(sel.tower, v); sfx('click'); last.tp = null; } break;
      case 'deselect': sel.tower = null; sfx('click'); last.tp = null; break;
      case 'abandon':
        if (abandonArm > Date.now()) { abandonArm = 0; game.endRun('abandon'); }
        else { abandonArm = Date.now() + 3000; sfx('click'); later(() => { last.tr = null; }, 3100); }
        last.tr = null;
        break;
      case 'lvl': lvlSel = v === 'endless' ? 'endless' : +v; sfx('nav'); break;
      case 'diff': diffSel = v; sfx('nav'); break;
      case 'play': startLevel(v === 'endless' ? 'endless' : +v, diffSel); break;
      case 'retry': { const li = game.run?.li ?? game.meta.lastLevel; startLevel(li, game.run?.diff || game.meta.lastDiff || 'leicht'); break; }
      case 'next': { const li = v === 'endless' ? 'endless' : +v; lvlSel = li; startLevel(li, game.meta.lastDiff || 'leicht'); break; }
      case 'toBase': E.sum.hidden = true; game.leaveRun(); sfx('click'); last.menu = ''; break;
      case 'tsel': towSel = id; sfx('nav'); break;
      case 'tload':
        if (!game.toggleLoadout(id)) { sfx('deny'); toast(game.meta.loadout.includes(id) ? 'Mindestens ein Turm muss im Loadout bleiben.' : 'Loadout ist voll. Nimm erst einen Turm heraus oder schalte in der Werkstatt Plätze frei.'); }
        else sfx('click');
        break;
      case 'open': sfx('click'); openScreen(v); if (v !== 'konto' && v !== 'einstellungen') break; break;
      case 'close': sfx('click'); closeScreen(); break;
      case 'booster': openBooster(v); break;
      case 'testgems': game.addTestGems(300); sfx('coin'); toast('+300 Gems (Test)'); break;
      case 'selWs': wsSel = id; sfx('nav'); break;
      case 'buyWs':
        if (!game.buyWs(id)) { sfx('deny'); toast(!game.wsReqMet(id) ? 'Erst die Voraussetzung ausbauen.' : game.wsMaxed(id) ? 'Schon voll ausgebaut.' : `Dir fehlen ${fmt(game.wsCost(id) - game.meta.gems)} Gems.`); }
        else sfx('buy');
        break;
      case 'skipTrack': audio?.skip(); sfx('click'); toast('Nächstes Stück kommt gleich.'); later(() => renderScreen(true), 2600); break;
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
      case 'logout': await cloud?.logout(); try { sessionStorage.removeItem('packfall.guest'); } catch (err) { /* egal */ } closeScreen(); last.menu = ''; showAuth(); toast('Abgemeldet.'); break;
      case 'toLogin': try { sessionStorage.removeItem('packfall.guest'); } catch (err) { /* egal */ } closeScreen(); showAuth(); break;
      case 'gift': game.setFlag('intro', true); E.intro.hidden = true; if (!game.meta.flags.gift) openBooster('starter'); break;
      case 'introClose': game.setFlag('intro', true); E.intro.hidden = true; break;
      default: return;
    }
    if (screen && !['close', 'open', 'set', 'patch', 'reset'].includes(a)) renderScreen(true);
    last.menu = ''; last.strip = '';
  }
  // Kampf-Knöpfe reagieren schon beim Drücken (sie werden laufend neu gezeichnet)
  const FAST = '.kw-dock [data-act], .kw-tp [data-act], .kw-tr [data-act]';
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const b = e.target.closest(FAST);
    if (!b || !el.contains(b)) return;
    b._pd = performance.now(); act(b);
  });
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || !el.contains(b) || b.dataset.act === 'import') return;
    if (b.tagName === 'INPUT') return;
    if (b._pd && performance.now() - b._pd < 800) return;
    act(b);
  });
  el.addEventListener('input', e => {
    const r = e.target.closest('input[data-act="vol"]');
    if (!r) return;
    const v = +r.value;
    game.meta.settings[r.dataset.k] = v;
    audio?.apply();
    const lbl = r.parentElement.querySelector('span');
    if (lbl) lbl.textContent = v > 0 ? Math.round(v * 100) + ' %' : 'Aus';
  });
  el.addEventListener('change', e => {
    const r = e.target.closest('input[data-act="vol"]');
    if (r) { game.setSetting(r.dataset.k, +r.value); if (r.dataset.k === 'sfxVol') sfx('click'); return; }
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
        <li>${ic('pack')}<span><b>Booster</b> bringen neue Türme in deine Sammlung. Doppelte geben Sterne.</span></li>
        <li>${ic('turret')}<span>Vor jeder Map stellst du dein <b>Loadout</b> zusammen – bis zu 5 Türme.</span></li>
        <li>${ic('target')}<span>Auf der Map <b>setzt du Türme aufs Raster</b> neben den Pfad und baust sie bis Stufe 5 aus.</span></li>
        <li>${ic('medal')}<span>Jede Map auf <b>Leicht, Mittel und Schwer</b> – für jede gibt es ein Abzeichen. <b>Gems</b> bleiben für immer.</span></li>
      </ol>
      ${gift ? `<div class="kw-gift"><span class="kw-gift-img">${skin.packArt('starter')}</span><p><b>Ein Geschenk zum Start</b><br>Dein erster Booster – mit einem garantiert seltenen Turm.</p></div>
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
        const d = r.def, st = game.towerStats(d.id, 0);
        return d.kind === 'farm' ? `${fmt(st.income)} Münzen pro Welle · ${d.role}` : d.kind === 'support' ? `+${Math.round(st.bDmg * 100)} % Schaden für Türme in Reichweite`
          : `${fmtNum(game.dps(d.id, 0))} Schaden/s · Reichweite ${rngTxt(st.range)} · ${d.role}`;
      },
      tag: r => {
        let t = r.isNew ? (r.placed ? 'Neu · direkt im Loadout' : 'Neu · in der Sammlung') : r.refund ? `Max. Sterne · +${r.refund} Gems` : r.starTo > r.starFrom ? `Doppelt · ★${r.starFrom} → ★${r.starTo}` : `Doppelt · ${r.copies}/${game.nextStarAt(r.id)} Kopien bis ★${r.starTo + 1}`;
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
    if (wasStarter) { closeScreen(); toast('Dein neuer Turm ist im Loadout. Auf „Kämpfen“ geht\'s los!'); later(() => E.menu.querySelector('[data-act="start"]')?.focus({ preventScroll: true }), 60); }
  }

  // ---------- Level-Ende ----------
  function showSummary(s) {
    const win = s.result === 'win';
    const title = win ? 'Sieg!' : s.result === 'abandon' ? 'Level abgebrochen' : 'Der Kern ist gefallen';
    const nextI = s.li === 'endless' ? null : s.li + 1 < LEVELS.length ? s.li + 1 : (game.levelUnlocked('endless') ? 'endless' : null);
    const min = Math.floor(s.time / 60), sec = Math.floor(s.time % 60);
    E.sum.hidden = false;
    E.sum.innerHTML = `<div class="kw-box kw-sum-in${win ? ' is-win' : ''}" role="dialog" aria-labelledby="kwSumTitle">
      <small class="kw-sum-lv">${s.li === 'endless' ? 'Endlos' : `Map ${s.li + 1} · ${DIFFS[s.diff].name}`} · ${s.name}</small>
      <h2 id="kwSumTitle">${title}</h2>
      ${s.li !== 'endless' && win ? `<div class="kw-sum-medal m-${MEDAL[s.medal]}">${ic('medal')}<b>${DIFFS[s.medal].medal}-Abzeichen</b>${s.newMedal ? '<em>Neu!</em>' : ''}</div>`
        : `<p class="kw-sum-wave">Welle <b>${s.wave}</b>${s.waves !== Infinity ? ` von ${s.waves}` : ''}${s.record ? ' <span class="kw-rec">Neuer Rekord</span>' : ''}</p>`}
      ${win && s.firstClear ? `<p class="kw-sum-first">${ic('trophy')} Map zum ersten Mal geschafft!${nextI != null ? ' Die nächste Map ist frei.' : ''}</p>` : ''}
      <dl class="kw-sum-list">
        <div><dt>Gems verdient</dt><dd>${ic('gem')}${fmt(s.gems)}</dd></div>
        <div><dt>Gegner besiegt</dt><dd>${fmt(s.kills)}</dd></div>
        <div><dt>Kern</dt><dd>${ic('heart')}${Math.ceil(s.coreHp)}/${Math.round(s.coreMax)}</dd></div>
        <div><dt>Dauer</dt><dd>${min}:${String(sec).padStart(2, '0')}</dd></div>
      </dl>
      <div class="kw-sum-btns">
        <button type="button" class="kw-btn" data-act="toBase">${ic('back')}<span>Zur Basis</span></button>
        <button type="button" class="kw-btn${win && nextI != null ? '' : ' kw-btn-primary'}" data-act="retry">${ic('wave')}<span>Nochmal</span></button>
        ${win && nextI != null ? `<button type="button" class="kw-btn kw-btn-primary" data-act="next" data-v="${nextI}">${ic('play')}<span>${nextI === 'endless' ? 'Endlos-Modus' : 'Nächste Map'}</span></button>` : ''}
      </div>
    </div>`;
    if (win && s.medal) later(() => sfx('reveal', s.medal === 'schwer' ? 'legendary' : s.medal === 'mittel' ? 'epic' : 'rare'), 400);
    later(() => E.sum.querySelector('.kw-btn-primary')?.focus({ preventScroll: true }), 80);
  }

  // ---------- Spiel-Ereignisse ----------
  const offs = [
    game.on('runStart', R => {
      E.sum.hidden = true; closeScreen(); sel.place = sel.tower = sel.hover = null; last.dock = last.tp = last.tr = null;
      banner(R.L.name, R.li === 'endless' ? 'Endlos-Modus · baue deine Verteidigung' : `${DIFFS[R.diff].name} · baue deine Verteidigung`, 'realm');
    }),
    game.on('runEnd', s => { E.banner.classList.remove('show'); sel.place = sel.tower = null; sfx(s.result === 'win' ? 'fanfare' : 'over'); later(() => showSummary(s), s.result === 'win' ? 900 : 500); }),
    game.on('waveStart', w => {
      if (w.boss) { banner(`Welle ${w.wave}`, 'Ein Boss naht!', 'boss'); sfx('boss'); }
      else { banner(`Welle ${w.wave}${w.waves !== Infinity ? ` / ${w.waves}` : ''}`, w.income ? `Prägewerke: +${fmt(w.income)} Münzen` : '', ''); sfx('wave'); }
      last.dock = null;
    }),
    game.on('gems', d => { if (d?.n) { restartAnim(el.querySelector('.kw-th-gem'), 'bump'); sfx('coin'); } }),
    game.on('coreHit', () => { restartAnim(E.hitflash, 'go'); sfxT('core', 0.15); }),
    game.on('shield', () => { banner('Notschild!', 'Der Kern wurde gerettet', 'boss'); sfx('reveal', 'legendary'); }),
    game.on('shot', ({ kind }) => sfxT(kind === 'shell' || kind === 'howitzer' ? 'boom' : 'shot', kind === 'bullet' ? 0.07 : 0.11)),
    game.on('kill', () => sfxT('kill', 0.06)),
    game.on('boom', () => sfxT('boom', 0.12)),
    game.on('zap', () => sfxT('zap', 0.1)),
    game.on('rail', () => sfxT('strike', 0.1)),
    game.on('place', () => { sfx('buy'); last.dock = null; }),
    game.on('sell', () => { sfx('coin'); last.dock = null; }),
    game.on('income', () => sfxT('coin', 0.2)),
    game.on('bonus', b => toast(`Früh gerufen: +${fmt(b)} Münzen`)),
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
      txt(E.lvname, r.li === 'endless' ? `Endlos · ${r.L.name}` : `${r.L.name} · ${DIFFS[r.diff].name}`);
      txt(E.wave, r.wave === 0 ? 'Vorbereitung' : r.waves === Infinity ? `Welle ${r.wave}` : `Welle ${r.wave} / ${r.waves}`);
      txt(E.hp, `${Math.ceil(r.coreHp)}`);
      const hk = Math.max(0, r.coreHp / r.coreMax).toFixed(3);
      if (E.hpbar._k !== hk) { E.hpbar._k = hk; E.hpbar.style.transform = `scaleX(${hk})`; }
      txt(E.cash, fmt(r.cash)); txt(E.rgems, `+${fmt(r.gems)}`);
      const low = r.coreHp / r.coreMax < 0.3;
      if (el.classList.contains('is-low') !== low) el.classList.toggle('is-low', low);
      const boss = game.enemies.find(e => e.boss && !e.dead);
      if (E.boss.hidden !== !boss) E.boss.hidden = !boss;
      if (boss) { txt(E.bossname, boss.E.name); E.bossfill.style.transform = `scaleX(${Math.max(0, boss.hp / boss.maxHp).toFixed(3)})`; }
      if (sel.tower && (!game.towers.includes(sel.tower) || r.phase === 'done')) sel.tower = null;
      const hint = r.phase === 'done' ? '' : sel.place ? `${T[sel.place].name}: auf ein freies Feld tippen · Esc oder Rechtsklick bricht ab · Shift hält die Auswahl`
        : r.phase === 'prep' ? 'Wähle unten einen Turm (Taste 1–5) und setz ihn neben den Pfad. Dann starte die erste Welle.' : '';
      if (E.phint.hidden !== !hint) E.phint.hidden = !hint;
      txt(E.phint, hint);
      const kEl = E.tp.querySelector('.kw-tp-kills');
      if (kEl && sel.tower) txt(kEl, `${fmt(sel.tower.kills)} besiegt · ${fmt(sel.tower.dmgDone)} Schaden`);
    } else if (el.classList.contains('is-low')) el.classList.remove('is-low');
    renderT -= dt;
    if (renderT > 0) return;
    renderT = r ? 0.1 : 0.2;
    if (r) {
      set('dock', E.dock, dockHTML());
      const tp = tpHTML();
      if (E.tp.hidden !== !tp) E.tp.hidden = !tp;
      set('tp', E.tp, tp);
      set('tr', E.tr, trHTML());
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
    'Tipp: Kurven sind die besten Bauplätze – dort bleiben Gegner lange in Reichweite.',
    'Tipp: Prägewerke früh bauen. Sie zahlen zu jeder Welle Münzen.',
    'Tipp: Mörser und Flammer treffen keine Flieger.',
    'Tipp: Railgun und Laserlanze ignorieren Panzerung.',
    'Tipp: Mit der Leertaste rufst du die nächste Welle früher – das gibt Bonus-Münzen.',
    'Tipp: Doppelte Türme aus Boostern geben Sterne: +10 % Stärke pro Stern.',
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
    later(toTitle, 350);
  }
  E.press.addEventListener('click', async () => {
    audio?.unlock(); audio?.apply(); sfx('fanfare');
    let guest = false;
    try { guest = sessionStorage.getItem('packfall.guest') === '1'; } catch (e) { /* egal */ }
    if (cloud?.configured() && cloud.st.restoring) await Promise.race([cloud.restored, new Promise(r => setTimeout(r, 2500))]);
    if (!cloud?.configured() || cloud.st.status === 'online' || guest) toMenu(); else showAuth();
  });

  // ---------- Admin ----------
  const adminUI = createAdmin(el, { cloud, sfx, toast, ic, esc, fmt, logo: null, onExit: () => showAuth() });

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
  E.news.addEventListener('click', e => { if (e.target === E.news) { sfx('click'); nextInbox(); } });
  // Klick daneben schließt Unterseiten und Run-Zusammenfassung
  E.screen.addEventListener('click', e => { if (e.target === E.screen) { sfx('click'); closeScreen(); } });
  E.sum.addEventListener('click', e => { if (e.target === E.sum) { E.sum.hidden = true; game.leaveRun(); sfx('click'); last.menu = ''; } });
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
    E.open.hidden = false;
    if (skin.titleBg && !E.titlebg.innerHTML) E.titlebg.innerHTML = skin.titleBg();
    setPhase('auth');
    setAuthMode('login');
    later(() => E.authform.elements.name.focus({ preventScroll: true }), 80);
    await refreshBoard();
    E.authlb.innerHTML = lbRows
      ? (lbRows.length ? lbRows.slice(0, 10).map((r, i) => `<li><span class="kw-lb-n">${i + 1}</span><span class="kw-lb-name">${esc(r.name)}</span><span class="kw-lb-v">Welle ${r.best_wave}</span><small>${fmt(r.total_gems)} Gems · ${r.heroes || 0} Türme</small></li>`).join('') : '<li class="kw-lb-empty">Noch niemand eingetragen. Sei der Erste!</li>')
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
    el, stage, toast, banner, frame, setLoad, ready, sel, insets, boardHover, boardClick, boardCancel,
    setBattleCheck: f => { battleCheck = f; },
    get phase() { return phase; },
    get busy() { return opening.active; },
    destroy() { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); opening.destroy(); offs.forEach(f => f()); timers.forEach(t => clearTimeout(t)); clearTimeout(toastT); el.remove(); },
  };
}
