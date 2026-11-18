// Packfall – Konten, Cloud-Spielstand und Bestenliste über Supabase (wie bei Pokélings: Benutzername + Passwort)
// Der Name wird intern zu einer Pseudo-Adresse, das Passwort wird vorher gehasht.
export const CLOUD = {
  url: 'https://slbyiduyqfsyterkqzht.supabase.co',
  key: 'sb_publishable_wXWEObdmuEbB37sfVdkeRA_ODpO1rtZ', // öffentlicher Schlüssel, geschützt durch Row Level Security
};
const TOK = 'packfall.cloud';
const GUEST = 'packfall.save.v1';
const NAME_RE = /^[A-Za-z0-9_äöüÄÖÜß-]{3,16}$/;
const RESERVED = /^(admin|packfall-admin|requiem-admin)/i;

async function sha(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const norm = n => String(n).trim().toLowerCase();
const emailFor = async n => 'u' + (await sha('pf:' + norm(n))).slice(0, 28) + '@packfall.app';
const pwFor = (n, pw) => sha('packfall|' + norm(n) + '|' + pw);
const progress = m => (m?.totalGems || 0) + (m?.best || 0) * 50 + (m?.packs || 0) * 20 + Object.keys(m?.cards || {}).length * 30;

export function createCloud(game) {
  const st = { sess: null, name: null, uid: null, status: 'guest', msg: '', lastSync: 0, busy: false, remember: true, restoring: false };
  const store = () => (st.remember ? localStorage : sessionStorage);
  const configured = () => !!(CLOUD.url && CLOUD.key);
  const listeners = new Set();
  const changed = () => listeners.forEach(f => f(st));

  async function api(path, { method = 'GET', body, auth = true, headers = {}, timeout = 10000 } = {}) {
    if (!configured()) return { ok: false, status: 0, offline: true, j: null };
    const h = { apikey: CLOUD.key, 'Content-Type': 'application/json', ...headers };
    if (auth && st.sess) h.Authorization = 'Bearer ' + st.sess.access_token;
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), timeout);
    try {
      const r = await fetch(CLOUD.url + path, { method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined, signal: ctl.signal });
      const tx = await r.text();
      let j = null; try { j = tx ? JSON.parse(tx) : null; } catch (e) { /* kein JSON */ }
      return { ok: r.ok, status: r.status, j };
    } catch (e) {
      return { ok: false, status: 0, net: true, j: null };
    } finally { clearTimeout(to); }
  }

  function setSess(j, name) {
    if (!j?.access_token) return false;
    st.sess = { access_token: j.access_token, refresh_token: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
    st.uid = j.user?.id || st.uid;
    st.name = name || j.user?.user_metadata?.name || st.name;
    st.status = 'online'; st.msg = '';
    try { store().setItem(TOK, JSON.stringify({ rt: st.sess.refresh_token, name: st.name, uid: st.uid })); (st.remember ? sessionStorage : localStorage).removeItem(TOK); } catch (e) { /* egal */ }
    changed();
    return true;
  }
  function netError(r) {
    if (r.offline) return 'Online-Funktionen sind noch nicht eingerichtet.';
    if (r.net) return 'Keine Verbindung zum Server. In der Vorschau geht das nicht, auf der echten Spielseite schon.';
    return r.j?.msg || r.j?.error_description || r.j?.message || 'Unbekannter Fehler';
  }

  async function ready() {
    if (!st.sess) return false;
    if (Date.now() < st.sess.exp - 60000) return true;
    const r = await api('/auth/v1/token?grant_type=refresh_token', { method: 'POST', auth: false, body: { refresh_token: st.sess.refresh_token } });
    if (r.ok && setSess(r.j, st.name)) return true;
    return false;
  }

  async function signup(name, pw, remember = true) {
    st.remember = remember;
    name = String(name || '').trim();
    if (!NAME_RE.test(name)) return { ok: false, msg: 'Name: 3–16 Zeichen, nur Buchstaben, Zahlen, _ und -.' };
    if (String(pw || '').length < 4) return { ok: false, msg: 'Passwort: mindestens 4 Zeichen.' };
    if (RESERVED.test(name)) return { ok: false, msg: 'Dieser Name ist reserviert.' };
    st.busy = true; changed();
    const sv = await settings();
    if (sv.signup === false) { st.busy = false; changed(); return { ok: false, msg: 'Neue Konten sind gerade gesperrt. Versuch es später nochmal.' }; }
    const free = await api('/rest/v1/rpc/name_free', { method: 'POST', auth: false, body: { n: name } });
    if (free.ok && free.j === false) { st.busy = false; changed(); return { ok: false, msg: 'Dieser Name ist schon vergeben.' }; }
    if (!free.ok && (free.net || free.offline)) { st.busy = false; changed(); return { ok: false, msg: netError(free) }; }
    const r = await api('/auth/v1/signup', { method: 'POST', auth: false, body: { email: await emailFor(name), password: await pwFor(name, pw), data: { name } } });
    st.busy = false;
    if (!r.ok) { changed(); return { ok: false, msg: r.status === 422 || r.status === 400 ? 'Dieser Name ist schon vergeben.' : /gesperrt|Database error/i.test(JSON.stringify(r.j || '')) ? 'Neue Konten sind gerade gesperrt.' : netError(r) }; }
    if (!setSess(r.j, name)) { changed(); return { ok: false, msg: 'Konto erstellt, aber keine Sitzung erhalten. Bitte einloggen.' }; }
    game.useSlot(GUEST + '.' + st.uid, true); // neues Konto = neuer Spielstand (mit Einführung + Geschenk)
    await api('/rest/v1/profiles', { method: 'POST', body: { id: st.uid, name }, headers: { Prefer: 'resolution=merge-duplicates' } });
    await pushSave(true);
    return { ok: true };
  }

  async function login(name, pw, remember = true) {
    st.remember = remember;
    name = String(name || '').trim();
    if (!name || !pw) return { ok: false, msg: 'Bitte Name und Passwort eingeben.' };
    st.busy = true; changed();
    const r = await api('/auth/v1/token?grant_type=password', { method: 'POST', auth: false, body: { email: await emailFor(name), password: await pwFor(name, pw) } });
    st.busy = false;
    if (!r.ok) { changed(); return { ok: false, msg: r.status === 400 ? 'Name oder Passwort stimmt nicht.' : netError(r) }; }
    setSess(r.j, r.j?.user?.user_metadata?.name || name);
    const b = await me();
    if (b.banned) { await logout(); return { ok: false, msg: banText(b) }; }
    game.useSlot(GUEST + '.' + st.uid);
    await pullSave();
    return { ok: true };
  }

  async function logout() {
    if (st.sess) await api('/auth/v1/logout', { method: 'POST' });
    st.sess = null; st.uid = null; st.name = null; st.status = 'guest';
    try { localStorage.removeItem(TOK); sessionStorage.removeItem(TOK); } catch (e) { /* egal */ }
    game.useSlot(GUEST);
    changed();
  }

  async function pullSave() {
    if (!(await ready())) return;
    const r = await api(`/rest/v1/saves?user_id=eq.${st.uid}&select=data,updated_at`);
    const remote = r.ok && r.j && r.j[0] ? r.j[0].data : null;
    if (remote && progress(remote) >= progress(game.meta)) game.loadMeta(remote);
    await pushSave(true);
  }

  let pushT = null;
  async function pushSave(now) {
    if (!now) { clearTimeout(pushT); pushT = setTimeout(() => pushSave(true), 4000); return; }
    if (!(await ready())) return;
    const m = game.meta;
    const r = await api('/rest/v1/saves', { method: 'POST', body: { user_id: st.uid, data: m, updated_at: new Date().toISOString() }, headers: { Prefer: 'resolution=merge-duplicates' } });
    await api('/rest/v1/board', { method: 'POST', body: { user_id: st.uid, name: st.name, best_wave: m.best | 0, total_gems: m.totalGems | 0, runs: m.runs | 0, heroes: Object.keys(m.cards || {}).length, updated_at: new Date().toISOString() }, headers: { Prefer: 'resolution=merge-duplicates' } });
    if (r.ok) { st.lastSync = Date.now(); st.msg = ''; } else st.msg = netError(r);
    changed();
  }

  // ---------- Spieler: Sperre, Geschenke, Nachrichten ----------
  const banText = b => `Dein Konto ist gesperrt${b.until && b.until !== 'infinity' ? ' bis ' + new Date(b.until).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}.${b.reason ? ' Grund: ' + b.reason : ''}`;
  async function me() {
    if (!(await ready())) return { banned: false };
    const r = await api('/rest/v1/rpc/pf_me', { method: 'POST', body: {} });
    const j = r.ok ? r.j : null;
    const until = j?.banned_until || null;
    const banned = !!until && (until === 'infinity' || Date.parse(until) > Date.now());
    return { banned, until, reason: j?.reason || '', admin: !!j?.admin };
  }
  async function checkBan() {
    if (!st.sess) return null;
    const b = await me();
    if (b.banned) { const t = banText(b); await logout(); return t; }
    return null;
  }
  async function claim() {
    if (!(await ready())) return [];
    const r = await api('/rest/v1/rpc/pf_claim', { method: 'POST', body: {} });
    const list = r.ok && Array.isArray(r.j) ? r.j : [];
    let sum = 0;
    for (const g of list) sum += Math.max(0, g.gems | 0);
    if (sum > 0) { game.grantGems(sum); pushSave(true); }
    return list;
  }
  async function news() {
    const r = await api('/rest/v1/news?select=id,msg,created_at&order=id.desc&limit=1', { auth: false });
    return r.ok && r.j && r.j[0] ? r.j[0] : null;
  }
  async function settings() {
    const r = await api('/rest/v1/server?select=k,v', { auth: false });
    const o = {};
    if (r.ok && Array.isArray(r.j)) for (const x of r.j) o[x.k] = x.v;
    return o;
  }

  // ---------- Admin (eigene Sitzung, nie gespeichert) ----------
  const ADMIN_NAME = 'packfall-admin';
  const adm = { sess: null };
  async function adminLogin(pw) {
    if (!pw) return { ok: false, msg: 'Passwort eingeben.' };
    const email = await emailFor(ADMIN_NAME), password = await pwFor(ADMIN_NAME, pw);
    let r = await api('/auth/v1/token?grant_type=password', { method: 'POST', auth: false, body: { email, password } });
    if (r.net || r.offline) return { ok: false, msg: netError(r) };
    if (!r.ok) {
      // Gibt es das Admin-Konto noch nicht, wird es jetzt mit diesem Passwort angelegt
      const s = await api('/auth/v1/signup', { method: 'POST', auth: false, body: { email, password, data: { name: 'Admin' } } });
      if (!s.ok || !s.j?.access_token) return { ok: false, msg: 'Admin-Anmeldung fehlgeschlagen: Passwort falsch.' };
      r = s;
    }
    adm.sess = { access_token: r.j.access_token, refresh_token: r.j.refresh_token, exp: Date.now() + (r.j.expires_in || 3600) * 1000 };
    const chk = await admin('is_admin', {});
    if (!chk.ok || chk.j !== true) { adm.sess = null; return { ok: false, msg: 'Dieses Konto hat keine Admin-Rechte (Server-Setup fehlt?).' }; }
    return { ok: true };
  }
  async function admin(fn, body = {}) {
    if (!adm.sess) return { ok: false, msg: 'Nicht als Admin angemeldet.' };
    if (Date.now() > adm.sess.exp - 60000) {
      const r = await api('/auth/v1/token?grant_type=refresh_token', { method: 'POST', auth: false, body: { refresh_token: adm.sess.refresh_token } });
      if (r.ok && r.j?.access_token) adm.sess = { access_token: r.j.access_token, refresh_token: r.j.refresh_token, exp: Date.now() + (r.j.expires_in || 3600) * 1000 };
    }
    const r = await api('/rest/v1/rpc/' + fn, { method: 'POST', body, auth: false, headers: { Authorization: 'Bearer ' + adm.sess.access_token } });
    return { ok: r.ok, j: r.j, msg: r.ok ? '' : (r.j?.message || netError(r)) };
  }
  async function adminLogout() {
    if (adm.sess) await api('/auth/v1/logout', { method: 'POST', auth: false, headers: { Authorization: 'Bearer ' + adm.sess.access_token } });
    adm.sess = null;
  }
  const hashPw = (name, pw) => pwFor(name, pw);

  async function board() {
    const r = await api('/rest/v1/board?select=name,best_wave,total_gems,runs,heroes&order=best_wave.desc,total_gems.desc&limit=20', { auth: false });
    return r.ok ? { ok: true, rows: r.j || [] } : { ok: false, msg: netError(r) };
  }

  // Sitzung vom letzten Mal wiederherstellen
  const restored = (async () => {
    try {
      let t = JSON.parse(localStorage.getItem(TOK) || 'null');
      if (!t) { t = JSON.parse(sessionStorage.getItem(TOK) || 'null'); if (t) st.remember = false; }
      if (t?.rt && configured()) {
        st.restoring = true;
        st.sess = { access_token: '', refresh_token: t.rt, exp: 0 }; st.name = t.name; st.uid = t.uid;
        if (await ready()) { const b = await me(); if (b.banned) { st.banText = banText(b); await logout(); } else { game.useSlot(GUEST + '.' + st.uid); await pullSave(); } } else { st.sess = null; st.status = 'guest'; changed(); }
      }
    } catch (e) { /* egal */ }
    st.restoring = false;
  })();

  // automatisch speichern
  ['runEnd', 'ws', 'booster', 'lineup', 'waveClear'].forEach(ev => game.on(ev, () => { if (st.sess) pushSave(false); }));

  return { st, configured, restored, signup, login, logout, pushSave, board, me, checkBan, claim, news, settings, adminLogin, admin, adminLogout, hashPw, get isAdmin() { return !!adm.sess; }, on: f => { listeners.add(f); return () => listeners.delete(f); } };
}
