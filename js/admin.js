// Packfall – Admin-Bereich (nur für REQUIEM). Alle Rechte prüft der Server (Supabase-Funktionen + Tabelle admins).
const HOURS = [[1, '1 Std.'], [24, '1 Tag'], [168, '7 Tage'], [-1, 'Dauerhaft']];

export function createAdmin(host, { cloud, sfx, toast, ic, esc, fmt, logo, onExit }) {
  const el = document.createElement('div');
  el.className = 'kw-admin';
  el.hidden = true;
  host.appendChild(el);
  const st = { tab: 'players', list: [], q: '', open: null, log: [], news: null, settings: {}, err: '', loading: false, del: null };

  const ago = d => {
    if (!d) return '–';
    const s = (Date.now() - Date.parse(d)) / 1000;
    if (s < 90) return 'gerade eben';
    if (s < 3600) return `vor ${Math.round(s / 60)} Min.`;
    if (s < 86400) return `vor ${Math.round(s / 3600)} Std.`;
    return `vor ${Math.round(s / 86400)} Tg.`;
  };
  const when = d => (d ? new Date(d).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '–');
  const banned = p => !!p.banned_until && (p.banned_until === 'infinity' || Date.parse(p.banned_until) > Date.now());
  const banUntil = p => (p.banned_until === 'infinity' ? 'dauerhaft' : `bis ${when(p.banned_until)}`);

  async function load() {
    st.loading = true; st.err = ''; render();
    if (st.tab === 'players') {
      const r = await cloud.admin('adm_players');
      if (r.ok) st.list = r.j || []; else st.err = r.msg;
    } else if (st.tab === 'log') {
      const r = await cloud.admin('adm_log');
      if (r.ok) st.log = r.j || []; else st.err = r.msg;
    } else if (st.tab === 'msg') {
      st.news = await cloud.news();
    } else if (st.tab === 'server') {
      st.settings = await cloud.settings();
    }
    st.loading = false; render();
  }

  function playersHTML() {
    const q = st.q.trim().toLowerCase();
    const list = st.list.filter(p => !q || p.pname.toLowerCase().includes(q));
    const online = st.list.filter(p => p.last_save && Date.now() - Date.parse(p.last_save) < 300000).length;
    const rows = list.map(p => {
      const open = st.open === p.uid, b = banned(p);
      return `<div class="kw-adm-row${open ? ' is-open' : ''}${b ? ' is-ban' : ''}">
        <button type="button" class="kw-adm-line" data-adm="row" data-id="${p.uid}">
          <span class="kw-adm-name">${esc(p.pname)}${b ? `<em>gesperrt</em>` : ''}</span>
          <span>Welle <b>${p.best_wave}</b></span><span>${ic('gem')}<b>${fmt(p.gems)}</b></span><span><b>${p.heroes}</b> Türme</span><span><b>${p.runs}</b> Runs</span>
          <span class="kw-adm-ago">${ago(p.last_save)}</span>
        </button>
        ${open ? `<div class="kw-adm-detail">
          <p class="kw-adm-meta">Registriert ${when(p.created_at)} · zuletzt gespeichert ${when(p.last_save)} · insgesamt ${fmt(p.total_gems)} Gems gesammelt${b ? ` · <b class="kw-adm-red">gesperrt ${banUntil(p)}${p.ban_reason ? ` (${esc(p.ban_reason)})` : ''}</b>` : ''}</p>
          <form class="kw-adm-f" data-adm-form="gift" data-id="${p.uid}">
            <label>Gems schenken</label><input name="n" type="number" min="1" max="1000000" value="100"><input name="m" maxlength="120" placeholder="Nachricht (optional)"><button class="kw-btn kw-btn-primary">${ic('gem')}<span>Schenken</span></button>
          </form>
          <form class="kw-adm-f" data-adm-form="ban" data-id="${p.uid}">
            <label>Sperren</label><select name="h">${HOURS.map(([h, t]) => `<option value="${h}">${t}</option>`).join('')}</select><input name="m" maxlength="120" placeholder="Grund (optional)"><button class="kw-btn is-warn">${ic('lock')}<span>Sperren</span></button>
            ${b ? `<button type="button" class="kw-btn" data-adm="unban" data-id="${p.uid}">${ic('check')}<span>Entsperren</span></button>` : ''}
          </form>
          <form class="kw-adm-f" data-adm-form="pw" data-id="${p.uid}" data-name="${esc(p.pname)}">
            <label>Neues Passwort</label><input name="pw" type="text" minlength="4" maxlength="64" placeholder="mind. 4 Zeichen" autocomplete="off"><button class="kw-btn">${ic('lock')}<span>Setzen</span></button>
          </form>
          <div class="kw-adm-f">
            <label>Konto</label>
            <button type="button" class="kw-btn" data-adm="board" data-id="${p.uid}">${ic('trophy')}<span>Aus Bestenliste entfernen</span></button>
            <button type="button" class="kw-btn is-warn" data-adm="del" data-id="${p.uid}">${ic('skull')}<span>${st.del === p.uid ? 'Wirklich löschen?' : 'Konto löschen'}</span></button>
          </div>
        </div>` : ''}
      </div>`;
    }).join('');
    return `<div class="kw-adm-bar"><input class="kw-adm-q" data-adm="q" placeholder="Spieler suchen …" value="${esc(st.q)}"><span>${st.list.length} Spieler · ${online} in den letzten 5 Min. aktiv</span></div>
      <div class="kw-adm-list">${rows || `<p class="kw-adm-empty">${st.loading ? 'Lädt …' : 'Keine Spieler gefunden.'}</p>`}</div>`;
  }
  function msgHTML() {
    return `<div class="kw-adm-card">
        <h3>${ic('scroll')} Nachricht an alle</h3>
        <p class="kw-note">Erscheint bei allen Spielern einmal beim nächsten Start (oder innerhalb einer Minute im Menü).</p>
        <form class="kw-adm-f kw-adm-col" data-adm-form="news"><textarea name="m" maxlength="500" rows="4" placeholder="Was sollen alle lesen?"></textarea><button class="kw-btn kw-btn-primary">${ic('play')}<span>An alle senden</span></button></form>
      </div>
      <div class="kw-adm-card">
        <h3>Aktuelle Nachricht</h3>
        ${st.news ? `<p class="kw-adm-news">${esc(st.news.msg)}</p><p class="kw-note">gesendet ${when(st.news.created_at)}</p><button type="button" class="kw-btn is-warn" data-adm="newsdel">${ic('skull')}<span>Entfernen</span></button>` : '<p class="kw-note">Keine Nachricht aktiv.</p>'}
      </div>`;
  }
  function serverHTML() {
    const open = st.settings.signup !== false;
    return `<div class="kw-adm-card">
        <h3>${ic('user')} Neue Konten</h3>
        <p class="kw-note">${open ? 'Jeder kann sich registrieren.' : 'Registrieren ist gesperrt. Anmelden geht weiter.'}</p>
        <div class="kw-seg"><button type="button" data-adm="signup" data-v="1" aria-pressed="${open}">Erlaubt</button><button type="button" data-adm="signup" data-v="0" aria-pressed="${!open}">Gesperrt</button></div>
      </div>
      <div class="kw-adm-card">
        <h3>${ic('gem')} Geschenk an alle</h3>
        <form class="kw-adm-f" data-adm-form="giftall"><input name="n" type="number" min="1" max="1000000" value="100"><input name="m" maxlength="120" placeholder="Nachricht (optional)"><button class="kw-btn kw-btn-primary">${ic('gem')}<span>An alle schenken</span></button></form>
      </div>`;
  }
  function logHTML() {
    return `<div class="kw-adm-list">${st.log.map(l => `<div class="kw-adm-log"><span>${when(l.at)}</span><b>${esc(l.action)}</b><span>${esc(l.target || '')}</span><small>${esc(l.detail || '')}</small></div>`).join('') || `<p class="kw-adm-empty">${st.loading ? 'Lädt …' : 'Noch keine Einträge.'}</p>`}</div>`;
  }
  function render() {
    const tabs = [['players', 'user', 'Spieler'], ['msg', 'scroll', 'Nachricht'], ['server', 'gear', 'Server'], ['log', 'chart', 'Protokoll']];
    const body = st.tab === 'players' ? playersHTML() : st.tab === 'msg' ? msgHTML() : st.tab === 'server' ? serverHTML() : logHTML();
    const focus = document.activeElement?.dataset?.adm === 'q';
    el.innerHTML = `<div class="kw-adm-in">
      <div class="kw-adm-head">
        ${logo ? `<img class="kw-logo-img kw-adm-logo" src="${logo}" alt="Packfall">` : ''}
        <h2>${ic('helm')} Admin</h2><span class="kw-adm-who">${ic('user')} REQUIEM</span>
        <span class="kw-adm-sp"></span>
        <button type="button" class="kw-btn" data-adm="reload">${ic('speed')}<span>Aktualisieren</span></button>
        <button type="button" class="kw-btn" data-adm="exit">${ic('logout')}<span>Abmelden</span></button>
      </div>
      <div class="kw-atabs kw-adm-tabs">${tabs.map(([k, i, n]) => `<button type="button" data-adm="tab" data-v="${k}" aria-selected="${st.tab === k}">${ic(i)}<span>${n}</span></button>`).join('')}</div>
      ${st.err ? `<p class="kw-aerr">${esc(st.err)}</p>` : ''}
      <div class="kw-adm-body">${body}</div>
    </div>`;
    if (focus) { const q = el.querySelector('[data-adm="q"]'); q?.focus(); q?.setSelectionRange(q.value.length, q.value.length); }
  }

  async function run(fn, body, okMsg) {
    const r = await cloud.admin(fn, body);
    if (r.ok) { sfx('buy'); toast(okMsg); } else { sfx('deny'); toast(r.msg || 'Hat nicht geklappt.'); }
    return r.ok;
  }

  el.addEventListener('click', async e => {
    const b = e.target.closest('[data-adm]');
    if (!b) return;
    const a = b.dataset.adm, id = b.dataset.id;
    if (a === 'q') return;
    if (a === 'tab') { sfx('click'); st.tab = b.dataset.v; st.del = null; load(); return; }
    if (a === 'reload') { sfx('click'); load(); return; }
    if (a === 'exit') { sfx('click'); await cloud.adminLogout(); hide(); onExit(); return; }
    if (a === 'row') { sfx('nav'); st.open = st.open === id ? null : id; st.del = null; render(); return; }
    if (a === 'unban') { if (await run('adm_ban', { target: id, hours: 0, reason: '' }, 'Entsperrt.')) load(); return; }
    if (a === 'board') { if (await run('adm_board_remove', { target: id }, 'Aus der Bestenliste entfernt.')) load(); return; }
    if (a === 'del') {
      if (st.del !== id) { st.del = id; sfx('deny'); render(); return; }
      st.del = null; if (await run('adm_delete', { target: id }, 'Konto gelöscht.')) { st.open = null; load(); }
      return;
    }
    if (a === 'newsdel') { if (await run('adm_news', { message: '' }, 'Nachricht entfernt.')) load(); return; }
    if (a === 'signup') { if (await run('adm_setting', { key: 'signup', val: b.dataset.v === '1' }, b.dataset.v === '1' ? 'Neue Konten erlaubt.' : 'Neue Konten gesperrt.')) load(); return; }
  });
  el.addEventListener('input', e => { if (e.target.dataset.adm === 'q') { st.q = e.target.value; render(); } });
  el.addEventListener('submit', async e => {
    const f = e.target.closest('[data-adm-form]');
    if (!f) return;
    e.preventDefault();
    const k = f.dataset.admForm, id = f.dataset.id, v = f.elements;
    if (k === 'gift' || k === 'giftall') {
      const n = Math.floor(+v.n.value);
      if (!(n >= 1 && n <= 1000000)) { toast('Menge: 1 bis 1.000.000.'); return; }
      if (await run('adm_gift', { target: k === 'gift' ? id : null, amount: n, message: v.m.value }, `${fmt(n)} Gems verschenkt.`)) load();
    } else if (k === 'ban') {
      if (await run('adm_ban', { target: id, hours: +v.h.value, reason: v.m.value }, 'Gesperrt.')) load();
    } else if (k === 'pw') {
      const pw = v.pw.value;
      if (pw.length < 4) { toast('Passwort: mindestens 4 Zeichen.'); return; }
      const hash = await cloud.hashPw(f.dataset.name, pw);
      if (await run('adm_set_pw', { target: id, pw: hash }, 'Passwort gesetzt. Gib es dem Spieler weiter.')) v.pw.value = '';
    } else if (k === 'news') {
      const m = v.m.value.trim();
      if (!m) { toast('Erst eine Nachricht schreiben.'); return; }
      if (await run('adm_news', { message: m }, 'Nachricht an alle gesendet.')) load();
    }
  });

  function show() { el.hidden = false; st.tab = 'players'; st.open = null; load(); }
  function hide() { el.hidden = true; el.innerHTML = ''; }
  return { show, hide };
}
