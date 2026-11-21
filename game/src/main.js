// main.js — boots Twinkle Harbour: wires the canvas clicks, the HUD
// buttons and the keyboard to the Game, runs the frame loop, and stages a
// screenshot scene when the page is opened with ?shot=<name>.

import { PANEL, PANEL_X, VIEW } from './config.js';
import { Game, SCREEN } from './game.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const game = new Game(canvas);

const params = new URLSearchParams(location.search);
if (params.has('shot')) {
  stageShot(game, params.get('shot'));
  // screenshots are stills: paint a few frames so markers settle, then stop
  let frames = 0;
  const still = (t) => {
    game.frame(t / 1000, 0);
    frames += 1;
    if (frames < 12) requestAnimationFrame(still);
  };
  requestAnimationFrame(still);
} else {
  let last = performance.now();
  const loop = (t) => {
    const dt = Math.min(0.1, (t - last) / 1000);
    last = t;
    game.frame(t / 1000, dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/** Turn a pointer event into a panel + panel-share coordinates, or null. */
function panelPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * VIEW.width;
  const y = ((event.clientY - rect.top) / rect.height) * VIEW.height;
  for (let panel = 0; panel < 2; panel += 1) {
    const px = PANEL_X[panel];
    if (x >= px && x <= px + PANEL.width && y >= PANEL.y && y <= PANEL.y + PANEL.height) {
      return { panel, x: (x - px) / PANEL.width, y: (y - PANEL.y) / PANEL.height };
    }
  }
  return null;
}

canvas.addEventListener('pointerdown', (event) => {
  const point = panelPoint(event);
  if (point) game.click(point.panel, point.x, point.y);
});

document.getElementById('btn-hint').addEventListener('click', () => game.useHint());
document.getElementById('btn-pause').addEventListener('click', () => {
  if (game.screen === SCREEN.PAUSED) game.resume(); else game.pause();
});
document.getElementById('btn-restart').addEventListener('click', () => game.restartLevel());
document.getElementById('btn-sound').addEventListener('click', (event) => {
  const muted = game.sound.toggleMute();
  event.currentTarget.textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
});
document.getElementById('ov-button').addEventListener('click', () => game.onOverlayButton());

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'h') game.useHint();
  else if (key === 'p' || key === ' ') {
    event.preventDefault();
    if (game.screen === SCREEN.PAUSED) game.resume(); else game.pause();
  } else if (key === 'r') game.restartLevel();
  else if (key === 'enter' && game.screen !== SCREEN.PLAYING) game.onOverlayButton();
  else if (key === 'm') document.getElementById('btn-sound').click();
});
