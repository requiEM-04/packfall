// Packfall – Start (lädt Spiel, Sound, Konten und den Pixel-Stil)
import { createGame } from './core.js?v=0.9.1-86e62b3e';
import { createAudio } from './sound.js?v=0.9.1-86e62b3e';
import { createCloud } from './cloud.js?v=0.9.1-86e62b3e';
import { mount } from './style-bph.js?v=0.9.1-86e62b3e';

const game = createGame();
window.packfall = game; // zum Testen in der Konsole
const audio = createAudio(() => game.meta.settings);
window.packfallAudio = audio;
const cloud = createCloud(game);
game.on('runStart', () => audio.setMode('run'));
game.on('boss', () => audio.setMode('boss'));
game.on('waveStart', e => { if (!e?.boss) audio.setMode('run'); });
game.on('runEnd', () => audio.setMode('menu'));

const app = document.getElementById('app');
let current = null;
try {
  app.innerHTML = '';
  current = await mount(app, game, { audio, cloud });
} catch (e) {
  console.error(e);
  app.innerHTML = `<div class="kw-error">Packfall konnte nicht starten.<br>${String(e.message || e)}</div>`;
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  game.update(dt);
  current?.frame(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
