// render.js — draws the two picture panels, their labels, the markers on
// found differences, hint pulses and miss marks onto the canvas. All game
// rules live in game.js; this file only paints a state it is handed.

import { PANEL, PANEL_X, VIEW } from './config.js';
import { SCENES } from './scenes.js';

/** Draw one panel: clip to its rounded frame, paint base + differences. */
function drawPanel(g, scene, side, panelIndex, found) {
  const x = PANEL_X[panelIndex];
  const y = PANEL.y;
  const w = PANEL.width;
  const h = PANEL.height;
  g.save();
  // frame shadow and border
  g.beginPath();
  g.roundRect(x - 3, y - 3, w + 6, h + 6, PANEL.radius + 3);
  g.fillStyle = '#22304a';
  g.fill();
  g.beginPath();
  g.roundRect(x, y, w, h, PANEL.radius);
  g.clip();
  g.translate(x, y);
  scene.drawBase(g, w, h);
  for (const diff of scene.diffs) {
    if (side === 0) diff.left(g, w, h); else diff.right(g, w, h);
  }
  // soft inner shading at the edges, same on both panels
  const shade = g.createLinearGradient(0, 0, 0, h);
  shade.addColorStop(0, 'rgba(255,255,255,0.10)');
  shade.addColorStop(0.5, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.10)');
  g.fillStyle = shade;
  g.fillRect(0, 0, w, h);
  g.restore();
  // label chip
  const label = side === 0 ? 'ORIGINAL' : 'SPOT THE CHANGES';
  g.save();
  g.translate(x, y);
  g.beginPath();
  g.roundRect(12, 12, label.length * 8.4 + 22, 28, 14);
  g.fillStyle = 'rgba(34,48,74,0.88)';
  g.fill();
  g.fillStyle = '#fff8ec';
  g.font = 'bold 13px system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText(label, (label.length * 8.4 + 22) / 2 + 12, 31);
  g.restore();
  return { x, y, w, h };
}

/** A satisfying ring marker with a check, drawn on both panels. */
export function drawMarker(g, px, py, ageSeconds) {
  const pulse = ageSeconds < 0.6 ? 1 + Math.sin((ageSeconds / 0.6) * Math.PI) * 0.25 : 1;
  const r = 21 * pulse;
  g.save();
  g.beginPath();
  g.arc(px, py, r + 4, 0, Math.PI * 2);
  g.fillStyle = 'rgba(31,174,107,0.22)';
  g.fill();
  g.beginPath();
  g.arc(px, py, r, 0, Math.PI * 2);
  g.strokeStyle = '#ffffff';
  g.lineWidth = 6;
  g.stroke();
  g.beginPath();
  g.arc(px, py, r, 0, Math.PI * 2);
  g.strokeStyle = '#1fae6b';
  g.lineWidth = 3.5;
  g.stroke();
  // check mark
  g.beginPath();
  g.moveTo(px - 8, py + 0.5);
  g.lineTo(px - 2.5, py + 6.5);
  g.lineTo(px + 9, py - 6);
  g.strokeStyle = '#1fae6b';
  g.lineWidth = 4;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.stroke();
  g.restore();
}

/** A dashed golden ring that breathes around a hinted difference. */
function drawHint(g, px, py, nowSeconds) {
  const r = 30 + Math.sin(nowSeconds * 6) * 5;
  g.save();
  g.beginPath();
  g.arc(px, py, r, 0, Math.PI * 2);
  g.strokeStyle = '#f5b921';
  g.lineWidth = 4;
  g.setLineDash([10, 7]);
  g.stroke();
  g.beginPath();
  g.arc(px, py, r + 9, 0, Math.PI * 2);
  g.strokeStyle = 'rgba(245,185,33,0.45)';
  g.lineWidth = 2.5;
  g.stroke();
  g.restore();
}

/** A fading red X where the player clicked and missed. */
function drawMiss(g, px, py, ageSeconds) {
  const alpha = Math.max(0, 1 - ageSeconds / 0.7);
  const s = 11;
  g.save();
  g.globalAlpha = alpha;
  g.strokeStyle = '#e5484d';
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(px - s, py - s); g.lineTo(px + s, py + s);
  g.moveTo(px + s, py - s); g.lineTo(px - s, py + s);
  g.stroke();
  g.restore();
}

/**
 * Paint the whole canvas for a play state:
 * { level, found:Set(index), misses:[{panel,x,y,at}], hint:{index,until}, now }
 */
export function drawGame(g, state) {
  g.clearRect(0, 0, VIEW.width, VIEW.height);
  const scene = SCENES[state.sceneIndex];
  const panels = [
    drawPanel(g, scene, 0, 0, state.found),
    drawPanel(g, scene, 1, 1, state.found),
  ];
  const now = state.now;
  for (const idx of state.activeDiffIndexes) {
    if (!state.found.has(idx)) continue;
    const diff = scene.diffs[idx];
    for (const p of panels) {
      const px = p.x + diff.x * p.w;
      const py = p.y + diff.y * p.h;
      const foundAt = state.foundAt.get(idx) ?? now;
      drawMarker(g, px, py, now - foundAt);
    }
  }
  if (state.hint && now < state.hint.until) {
    const diff = scene.diffs[state.hint.index];
    for (const p of panels) {
      drawHint(g, p.x + diff.x * p.w, p.y + diff.y * p.h, now);
    }
  }
  for (const miss of state.misses) {
    const p = panels[miss.panel];
    drawMiss(g, p.x + miss.x * p.w, p.y + miss.y * p.h, now - miss.at);
  }
  // "found it!" sparkle text over the newest find for a moment
  if (state.lastFind && now - state.lastFind.at < 1.0 && state.screen === 'playing') {
    const diff = scene.diffs[state.lastFind.index];
    const p = panels[1];
    g.save();
    g.font = 'bold 19px system-ui, sans-serif';
    const halfText = g.measureText(diff.name).width / 2;
    const px = Math.min(p.x + p.w - halfText - 8, Math.max(p.x + halfText + 8, p.x + diff.x * p.w));
    const py = Math.max(p.y + 30, p.y + diff.y * p.h - 38 - (now - state.lastFind.at) * 14);
    g.globalAlpha = 1 - (now - state.lastFind.at);
    g.textAlign = 'center';
    g.fillStyle = '#1fae6b';
    g.strokeStyle = '#ffffff';
    g.lineWidth = 4;
    const text = diff.name;
    g.strokeText(text, px, py);
    g.fillText(text, px, py);
    g.restore();
  }
}
