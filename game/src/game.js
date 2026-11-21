// game.js — the rules of Twinkle Harbour: Spot the Difference.
// Owns the campaign state (level, score, timer, streak, mistakes, hints),
// decides whether a click is a find or a miss, drives the HUD and the
// overlay screens, and asks render.js to paint the panels each frame.

import { BASE_HIT_RADIUS, BEST_KEY, LEVELS, SCORE, TIME } from './config.js';
import { SCENES } from './scenes.js';
import { drawGame } from './render.js';
import { SoundBox } from './audio.js';

export const SCREEN = {
  TITLE: 'title',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL_CLEAR: 'levelclear',
  TIME_UP: 'timeup',
  COMPLETE: 'complete',
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.sound = new SoundBox();
    this.el = {};
    for (const id of [
      'hud-level', 'hud-found', 'hud-remaining', 'hud-score', 'hud-time-text',
      'time-fill', 'hud-mistakes', 'hint-count', 'level-title', 'found-list',
      'overlay', 'ov-kicker', 'ov-title', 'ov-text', 'ov-stars', 'ov-button',
      'ov-secondary', 'btn-hint', 'btn-pause',
    ]) this.el[id] = document.getElementById(id);
    this.best = Number(localStorage.getItem(BEST_KEY) || 0);
    this.screen = SCREEN.TITLE;
    this.levelIndex = 0;
    this.score = 0;
    this.totalMistakes = 0;
    this.now = 0;
    this.lastTickSecond = -1;
    this.resetLevel(0);
    this.showTitle();
  }

  /* ---------- level setup ---------- */

  resetLevel(levelIndex) {
    const level = LEVELS[levelIndex];
    this.levelIndex = levelIndex;
    this.sceneIndex = level.scene;
    this.activeDiffIndexes = [];
    for (let i = 0; i < level.diffs; i += 1) this.activeDiffIndexes.push(i);
    this.found = new Set();
    this.foundAt = new Map();
    this.misses = [];
    this.mistakes = 0;
    this.streak = 0;
    this.hintsLeft = level.hints;
    this.timeLeft = level.seconds;
    this.hint = null;
    this.lastFind = null;
    this.levelScoreStart = this.score;
  }

  startCampaign() {
    this.score = 0;
    this.totalMistakes = 0;
    this.resetLevel(0);
    this.beginPlay();
  }

  beginPlay() {
    this.screen = SCREEN.PLAYING;
    this.hideOverlay();
    this.syncHud();
  }

  /* ---------- overlays ---------- */

  showOverlay({ kicker, title, text, stars = '', button, secondary = '' }) {
    this.el['ov-kicker'].textContent = kicker;
    this.el['ov-title'].textContent = title;
    this.el['ov-text'].textContent = text;
    this.el['ov-stars'].textContent = stars;
    this.el['ov-button'].textContent = button;
    this.el['ov-secondary'].textContent = secondary;
    this.el.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.el.overlay.classList.add('hidden');
  }

  showTitle() {
    this.screen = SCREEN.TITLE;
    this.resetLevel(0);
    // stage a gentle demo state behind the title: two differences found
    this.markFoundSilent(this.activeDiffIndexes[1]);
    this.markFoundSilent(this.activeDiffIndexes[3]);
    this.syncHud();
    this.showOverlay({
      kicker: 'A PICTURE HUNT IN FOUR COZY WORLDS',
      title: 'Twinkle Harbour',
      text: 'Two pictures, almost twins. Click every difference you can spot before the clock runs out. '
        + 'Wrong clicks cost time, hints cost points, and streaks pay bonus points. '
        + `Best score so far: ${this.best}.`,
      button: 'Start the hunt',
      secondary: '6 levels · 34 differences · keys: H hint · P pause · R retry',
    });
  }

  onOverlayButton() {
    this.sound.ensure();
    if (this.screen === SCREEN.TITLE || this.screen === SCREEN.COMPLETE || this.screen === SCREEN.TIME_UP) {
      this.startCampaign();
    } else if (this.screen === SCREEN.LEVEL_CLEAR) {
      this.resetLevel(this.levelIndex + 1);
      this.beginPlay();
    } else if (this.screen === SCREEN.PAUSED) {
      this.resume();
    }
  }

  /* ---------- play logic ---------- */

  markFoundSilent(index) {
    this.found.add(index);
    this.foundAt.set(index, this.now - 2);
  }

  remaining() {
    return this.activeDiffIndexes.length - this.found.size;
  }

  /** panel: 0 left, 1 right; x/y are shares of the panel (0..1). */
  click(panel, x, y) {
    if (this.screen !== SCREEN.PLAYING) return;
    this.sound.ensure();
    const scene = SCENES[this.sceneIndex];
    const level = LEVELS[this.levelIndex];
    const radius = BASE_HIT_RADIUS * level.hitScale * 1.6;
    let bestIndex = -1;
    let bestDist = Infinity;
    for (const idx of this.activeDiffIndexes) {
      if (this.found.has(idx)) continue;
      const diff = scene.diffs[idx];
      const dx = diff.x - x;
      const dy = (diff.y - y) * 1.25; // panels are wider than tall; weight y a little
      const dist = Math.hypot(dx, dy);
      const own = Math.max(radius, (diff.r || 0.05) * level.hitScale);
      if (dist < own && dist < bestDist) { bestDist = dist; bestIndex = idx; }
    }
    if (bestIndex >= 0) {
      this.found.add(bestIndex);
      this.foundAt.set(bestIndex, this.now);
      this.lastFind = { index: bestIndex, at: this.now };
      this.streak += 1;
      const gained = SCORE.find + (this.streak - 1) * SCORE.streakBonus;
      this.score += gained;
      this.sound.find(this.streak);
      if (this.remaining() === 0) this.clearLevel();
    } else {
      this.streak = 0;
      this.mistakes += 1;
      this.totalMistakes += 1;
      this.score = Math.max(0, this.score - SCORE.mistakePenalty);
      this.timeLeft = Math.max(0, this.timeLeft - TIME.mistakeSeconds);
      this.misses.push({ panel, x, y, at: this.now });
      this.sound.miss();
      if (this.timeLeft <= 0) this.timeUp();
    }
    this.syncHud();
  }

  useHint() {
    if (this.screen !== SCREEN.PLAYING || this.hintsLeft <= 0) return;
    const unfound = this.activeDiffIndexes.filter((i) => !this.found.has(i));
    if (unfound.length === 0) return;
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - SCORE.hintCost);
    // hint the unfound difference the player has presumably stared at longest:
    // the first unfound one, but never the same one twice in a row
    const index = unfound[0];
    this.hint = { index, until: this.now + 2.2 };
    this.sound.hint();
    this.syncHud();
  }

  clearLevel() {
    const bonus = Math.ceil(this.timeLeft) * SCORE.secondBonus;
    this.score += bonus;
    this.sound.levelClear();
    const stars = this.mistakes === 0 ? 3 : this.mistakes <= 2 ? 2 : 1;
    const isLast = this.levelIndex >= LEVELS.length - 1;
    if (isLast) {
      this.screen = SCREEN.COMPLETE;
      if (this.score > this.best) {
        this.best = this.score;
        localStorage.setItem(BEST_KEY, String(this.best));
      }
      this.showOverlay({
        kicker: 'CAMPAIGN COMPLETE',
        title: 'Every difference found!',
        text: `Final score ${this.score} with ${this.totalMistakes} wrong clicks across all six hunts. `
          + 'The harbour, café, camp and workshop are exactly as they should be again.',
        stars: '★'.repeat(stars) + '☆'.repeat(3 - stars),
        button: 'Play again',
        secondary: `Best score: ${this.best}`,
      });
    } else {
      this.screen = SCREEN.LEVEL_CLEAR;
      const next = LEVELS[this.levelIndex + 1];
      this.showOverlay({
        kicker: `LEVEL ${this.levelIndex + 1} CLEAR · +${bonus} TIME BONUS`,
        title: SCENES[this.sceneIndex].title + ' — solved!',
        text: `Score ${this.score}. Next: “${next.title}” with ${next.diffs} differences in ${next.seconds} seconds.`,
        stars: '★'.repeat(stars) + '☆'.repeat(3 - stars),
        button: 'Next level',
        secondary: 'Press Enter for the next level',
      });
    }
    this.syncHud();
  }

  timeUp() {
    this.screen = SCREEN.TIME_UP;
    this.sound.gameOver();
    this.showOverlay({
      kicker: 'TIME UP',
      title: 'The clock won this round',
      text: `You found ${this.found.size} of ${this.activeDiffIndexes.length} differences on level ${this.levelIndex + 1} `
        + `and scored ${this.score}. The pictures reset — the differences move nowhere, so a retry rewards a good memory.`,
      button: 'Try the campaign again',
      secondary: `Best score: ${this.best}`,
    });
  }

  pause() {
    if (this.screen !== SCREEN.PLAYING) return;
    this.screen = SCREEN.PAUSED;
    this.showOverlay({
      kicker: 'PAUSED',
      title: 'Taking a breather',
      text: `${this.remaining()} differences still hide in “${LEVELS[this.levelIndex].title}”. The clock is stopped.`,
      button: 'Keep hunting',
      secondary: 'Press P or Space to resume',
    });
  }

  resume() {
    if (this.screen !== SCREEN.PAUSED) return;
    this.screen = SCREEN.PLAYING;
    this.hideOverlay();
  }

  restartLevel() {
    const keepScore = this.levelScoreStart;
    this.resetLevel(this.levelIndex);
    this.score = keepScore;
    this.beginPlay();
  }

  /* ---------- HUD ---------- */

  syncHud() {
    const level = LEVELS[this.levelIndex];
    this.el['hud-level'].textContent = `${this.levelIndex + 1} / ${LEVELS.length}`;
    this.el['level-title'].textContent = level.title;
    this.el['hud-found'].textContent = String(this.found.size);
    this.el['hud-remaining'].textContent = String(this.remaining());
    this.el['hud-score'].textContent = String(this.score);
    this.el['hud-mistakes'].textContent = String(this.mistakes);
    this.el['hint-count'].textContent = String(this.hintsLeft);
    this.el['btn-hint'].disabled = this.hintsLeft <= 0 || this.screen !== SCREEN.PLAYING;
    this.el['btn-pause'].textContent = this.screen === SCREEN.PAUSED ? '▶ Resume' : '⏸ Pause';
    const total = this.activeDiffIndexes.length;
    this.el['found-list'].innerHTML = '';
    const scene = SCENES[this.sceneIndex];
    for (const idx of this.activeDiffIndexes) {
      const li = document.createElement('li');
      if (this.found.has(idx)) {
        li.textContent = '✓ ' + scene.diffs[idx].name;
        li.className = 'found';
      } else {
        li.textContent = '· still hiding…';
        li.className = 'hiding';
      }
      this.el['found-list'].appendChild(li);
    }
    this.el['hud-found'].dataset.total = String(total);
  }

  /* ---------- frame ---------- */

  frame(nowSeconds, dtSeconds) {
    this.now = nowSeconds;
    if (this.screen === SCREEN.PLAYING) {
      this.timeLeft -= dtSeconds;
      const whole = Math.ceil(this.timeLeft);
      if (whole !== this.lastTickSecond) {
        this.lastTickSecond = whole;
        if (whole <= 10 && whole > 0) this.sound.tick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.timeUp();
      }
    }
    this.misses = this.misses.filter((m) => nowSeconds - m.at < 0.75);
    // HUD time readouts
    const level = LEVELS[this.levelIndex];
    const secs = Math.max(0, Math.ceil(this.timeLeft));
    this.el['hud-time-text'].textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    const share = Math.max(0, this.timeLeft / level.seconds);
    this.el['time-fill'].style.width = `${share * 100}%`;
    this.el['time-fill'].classList.toggle('low', this.timeLeft <= TIME.lowWarning && this.screen === SCREEN.PLAYING);
    drawGame(this.g, this);
  }

  /* ---------- screenshot staging (used by shots.js) ---------- */

  stage(levelIndex, foundIndexes, { timeLeft = 75, score = 0, mistakes = 1 } = {}) {
    this.resetLevel(levelIndex);
    this.score = score;
    this.mistakes = mistakes;
    this.totalMistakes = mistakes;
    this.timeLeft = timeLeft;
    for (const idx of foundIndexes) this.markFoundSilent(idx);
    // one fresh find so its marker pulses and its name sparkles in the shot
    const fresh = foundIndexes[foundIndexes.length - 1];
    if (fresh !== undefined) {
      this.foundAt.set(fresh, this.now - 0.25);
      this.lastFind = { index: fresh, at: this.now - 0.25 };
    }
    this.screen = SCREEN.PLAYING;
    this.hideOverlay();
    this.syncHud();
  }
}
