// Packfall – Konten, Cloud-Spielstand und Bestenliste über Supabase (wie bei Pokélings: Benutzername + Passwort)
// Der Name wird intern zu einer Pseudo-Adresse, das Passwort wird vorher gehasht.
export const CLOUD = {
  url: 'https://slbyiduyqfsyterkqzht.supabase.co',
  key: 'sb_publishable_wXWEObdmuEbB37sfVdkeRA_ODpO1rtZ', // öffentlicher Schlüssel, geschützt durch Row Level Security
};
const TOK = 'packfall.cloud';
const NAME_RE = /^[A-Za-z0-9_äöüÄÖÜß-]{3,16}$/;

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
    if (String(pw || '').length < 6) return { ok: false, msg: 'Passwort: mindestens 6 Zeichen.' };
    st.busy = true; changed();
    const free = await api('/rest/v1/rpc/name_free', { method: 'POST', auth: false, body: { n: name } });
    if (free.ok && free.j === false) { st.busy = false; changed(); return { ok: false, msg: 'Dieser Name ist schon vergeben.' }; }
    if (!free.ok && (free.net || free.offline)) { st.busy = false; changed(); return { ok: false, msg: netError(free) }; }
    const r = await api('/auth/v1/signup', { method: 'POST', auth: false, body: { email: await emailFor(name), password: await pwFor(name, pw), data: { name } } });
    st.busy = false;
    if (!r.ok) { changed(); return { ok: false, msg: r.status === 422 || r.status === 400 ? 'Dieser Name ist schon vergeben.' : netError(r) }; }
    if (!setSess(r.j, name)) { changed(); return { ok: false, msg: 'Konto erstellt, aber keine Sitzung erhalten. Bitte einloggen.' }; }
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
    await pullSave();
    return { ok: true };
  }

  async function logout() {
    if (st.sess) await api('/auth/v1/logout', { method: 'POST' });
    st.sess = null; st.uid = null; st.name = null; st.status = 'guest';
    try { localStorage.removeItem(TOK); sessionStorage.removeItem(TOK); } catch (e) { /* egal */ }
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
        if (await ready()) await pullSave(); else { st.sess = null; st.status = 'guest'; changed(); }
      }
    } catch (e) { /* egal */ }
    st.restoring = false;
  })();

  // automatisch speichern
  ['runEnd', 'ws', 'booster', 'lineup', 'waveClear'].forEach(ev => game.on(ev, () => { if (st.sess) pushSave(false); }));

  return { st, configured, restored, signup, login, logout, pushSave, board, on: f => { listeners.add(f); return () => listeners.delete(f); } };
}
