// Packfall – Bühne: Menüszene (2D-Vektor), Schlachtfeld (3D, Three.js), Overlay, Laden der Icons
import { TOWERS, ENEMIES, LEVELS, ENDLESS } from './core.js?v=0.10-199c7e81';
import { createUI } from './ui.js?v=0.10-199c7e81';
import { iconSVG, packURL, mapPreview } from './art.js?v=0.10-199c7e81';
import { createMenuScene } from './menuscene.js?v=0.10-199c7e81';

const tick = () => new Promise(r => setTimeout(r, 16));

export async function mount(root, game, { audio, cloud } = {}) {
  const img = { tower: {}, towerMax: {}, sil: {}, enemy: {}, map: {} };
  const skin = {
    name: 'bph',
    icon: n => iconSVG(n),
    towerArt: (id, { max, unknown } = {}) => `<img class="b-art" src="${(unknown ? img.sil[id] : max ? img.towerMax[id] : img.tower[id]) || ''}" alt="">`,
    cardArt: (d, o = {}) => skin.towerArt(d.id, o),
    packArt: kind => `<img class="b-pack" src="${packURL(kind)}" alt="">`,
    enemyArt: type => `<img class="b-art" src="${img.enemy[type] || ''}" alt="">`,
    mapArt: i => `<img class="b-map" src="${img.map[i] || ''}" alt="">`,
  };
  const ui = createUI(root, game, skin, { audio, cloud });
  const stage = ui.stage;
  const gl = document.createElement('canvas'); gl.className = 'kw-gl';
  const canvas = document.createElement('canvas'); canvas.className = 'kw-canvas';
  stage.prepend(canvas); stage.prepend(gl);
  const ctx = canvas.getContext('2d');
  const menuScene = createMenuScene();
  let battle = null, battleErr = '', land = null, cleared2d = false;
  let sceneT = 0, introT = 0, W = 1, H = 1, cssW = 1, cssH = 1, dpr = 1;
  const quality = () => {
    const g = game.meta.settings.gfx;
    if (g && g !== 'auto') return g;
    const small = Math.min(innerWidth, innerHeight) < 600, dp = window.devicePixelRatio || 1;
    return small || dp > 2 ? 'mittel' : 'hoch';
  };

  // ---------- Laden: Icons aus den 3D-Modellen, Karten, Schlachtfeld ----------
  const loadSteps = [
    ['Schmiede die Türme …', async () => {
      const { createIconRenderer } = await import('./td3d.js?v=0.10-199c7e81');
      const ir = createIconRenderer(256);
      for (const d of TOWERS) { img.tower[d.id] = ir.tower(d.id, 0); img.towerMax[d.id] = ir.tower(d.id, 4); img.sil[d.id] = ir.tower(d.id, 0, { silhouette: true }); await tick(); }
      for (const type of Object.keys(ENEMIES)) img.enemy[type] = ir.enemy(type);
      ir.dispose();
    }],
    ['Zeichne die Karten …', () => { LEVELS.forEach((L, i) => { img.map[i] = mapPreview(L); }); img.map.endless = mapPreview(ENDLESS); }],
    ['Baue das Schlachtfeld …', async () => {
      try { const { createBattle } = await import('./td3d.js?v=0.10-199c7e81'); battle = createBattle(gl, game, { quality }); window.packfallBattle = battle; resize(); }
      catch (e) { console.error(e); battleErr = 'Dein Browser kann die 3D-Grafik gerade nicht darstellen (WebGL).'; }
      try { if (battle) { const { createLandscape } = await import('./landscape.js?v=0.10-199c7e81'); land = createLandscape(battle.renderer, { quality }); resize(); } }
      catch (e) { console.error('Landschaft', e); land = null; }
    }],
    ['Lade Schriften …', async () => { try { await Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* egal */ } }],
  ];
  ui.setBattleCheck(() => battleErr);

  // ---------- Größe ----------
  function resize() {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
    W = Math.round(cssW * dpr); H = Math.round(cssH * dpr);
    canvas.width = W; canvas.height = H;
    battle?.resize(cssW, cssH, window.devicePixelRatio || 1, ui.insets());
    land?.resize(cssW, cssH);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();
  let insetKey = '';
  function checkInsets() {
    const ins = ui.insets(), key = JSON.stringify(ins);
    if (key !== insetKey) { insetKey = key; battle?.resize(cssW, cssH, window.devicePixelRatio || 1, ins); }
  }

  // ---------- Zeiger auf dem Brett ----------
  const local = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  let downAt = null;
  function onMove(e) { if (!battle || !game.run) return; const [x, y] = local(e); ui.boardHover(battle.pick(x, y)); }
  function onDown(e) {
    if (!battle || !game.run) return;
    if (e.button === 2) { ui.boardCancel(); return; }
    const [x, y] = local(e); downAt = [x, y];
    ui.boardHover(battle.pick(x, y));
  }
  function onUp(e) {
    if (!battle || !game.run || !downAt || e.button === 2) return;
    const [x, y] = local(e);
    if (Math.hypot(x - downAt[0], y - downAt[1]) < 14) ui.boardClick(battle.pick(x, y), e.pointerType);
    downAt = null;
  }
  const onLeave = e => { if (e.pointerType === 'mouse') ui.boardHover(null); };
  const noMenu = e => { if (game.run) e.preventDefault(); };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('contextmenu', noMenu);

  // ---------- Frame ----------
  let insT = 0;
  function frame(dt) {
    ui.frame(dt);
    if (ui.busy) return; // Booster-Opening läuft: Bühne ruht
    const inRun = !!(game.run && battle), menu3d = !inRun && !!land;
    if (stage.classList.contains('is-3d') !== (inRun || menu3d)) stage.classList.toggle('is-3d', inRun || menu3d);
    if (menu3d) {
      if (!cleared2d) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); cleared2d = true; }
      land.draw(dt, ui.phase);
      return;
    }
    cleared2d = false;
    if (inRun) {
      insT -= dt; if (insT <= 0) { insT = 0.4; checkInsets(); }
      battle.frame(dt, ui.sel);
      battle.drawOverlay(ctx, cssW, cssH, dpr, game.meta.settings.numbers !== 'off');
      return;
    }
    sceneT += dt;
    const ph = ui.phase;
    let cam = null;
    if (ph === 'intro') {
      introT += dt;
      // Kamerafahrt: Mond → heranziehende Monster → Turm
      const keys = [[0, 1.75, 0.76, 0.22], [2.2, 1.6, 0.74, 0.3], [3.6, 1.45, 0.36, 0.6], [5.0, 1.4, 0.4, 0.62], [6.6, 1.12, 0.66, 0.52]];
      let a = keys[0], b = keys[keys.length - 1];
      for (let i = 0; i < keys.length - 1; i++) if (introT >= keys[i][0] && introT <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
      const k = b[0] === a[0] ? 1 : Math.min(1, Math.max(0, (introT - a[0]) / (b[0] - a[0]))), e = k * k * (3 - 2 * k);
      cam = { zoom: a[1] + (b[1] - a[1]) * e, fx: a[2] + (b[2] - a[2]) * e, fy: a[3] + (b[3] - a[3]) * e, march: true };
    } else if (ph === 'title' || ph === 'auth' || ph === 'load') {
      introT = 0;
      cam = { zoom: 1.06 + Math.sin(sceneT * 0.15) * 0.02, fx: ph === 'title' ? 0.4 : 0.5, fy: 0.5 };
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    menuScene.draw(ctx, W, H, sceneT, dt, quality() === 'niedrig' ? 0.3 : 1, cam);
  }

  // Laden mit Fortschritt
  (async () => {
    const t0 = performance.now();
    for (let i = 0; i < loadSteps.length; i++) {
      ui.setLoad(i / loadSteps.length * 0.85, loadSteps[i][0]);
      await tick();
      try { await loadSteps[i][1](); } catch (e) { console.error(e); }
    }
    const wait = Math.max(0, 1200 - (performance.now() - t0));
    const steps = 6;
    for (let i = 1; i <= steps; i++) { ui.setLoad(0.85 + 0.15 * i / steps); await new Promise(r => setTimeout(r, wait / steps)); }
    ui.ready();
  })();

  return {
    frame,
    destroy() {
      ro.disconnect(); land?.destroy(); battle?.destroy();
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('contextmenu', noMenu);
      ui.destroy();
    },
  };
}
