// scenes.js — the four hand-drawn picture worlds of Twinkle Harbour.
// Every scene is drawn with canvas shapes only (no image files): a base
// layer that is identical on both panels, plus a list of planted
// differences. Each difference knows how to draw its "original" version
// (left panel) and its "changed" version (right panel), so the right
// picture is the left picture with exactly those spots altered.
//
// Coordinates for differences are shares of the panel (0..1), so a scene
// works at any panel size. Draw functions receive a context already
// translated to the panel's top-left corner, plus the panel width/height.

import { mulberry32, range } from './random.js';

/* ---------- small drawing helpers ---------- */

export function circle(g, x, y, r, fill) {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = fill;
  g.fill();
}

export function ellipse(g, x, y, rx, ry, fill) {
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fillStyle = fill;
  g.fill();
}

export function roundRect(g, x, y, w, h, r, fill) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fillStyle = fill;
  g.fill();
}

export function line(g, x1, y1, x2, y2, stroke, width) {
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.strokeStyle = stroke;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.stroke();
}

export function cloud(g, x, y, s, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, 16 * s, 0, Math.PI * 2);
  g.arc(x + 20 * s, y - 8 * s, 20 * s, 0, Math.PI * 2);
  g.arc(x + 42 * s, y, 15 * s, 0, Math.PI * 2);
  g.arc(x + 21 * s, y + 7 * s, 18 * s, 0, Math.PI * 2);
  g.fill();
}

export function star(g, x, y, r, fill) {
  g.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
  g.fillStyle = fill;
  g.fill();
}

export function pineTree(g, x, y, s, trunk = '#7a4a2b', leaf = '#2e7d4f') {
  roundRect(g, x - 4 * s, y - 18 * s, 8 * s, 18 * s, 2 * s, trunk);
  g.fillStyle = leaf;
  for (let i = 0; i < 3; i += 1) {
    const wdt = (44 - i * 10) * s;
    const top = y - (58 - i * 16) * s;
    g.beginPath();
    g.moveTo(x - wdt / 2, top + 26 * s);
    g.lineTo(x, top);
    g.lineTo(x + wdt / 2, top + 26 * s);
    g.closePath();
    g.fill();
  }
}

export function seagull(g, x, y, s, stroke = '#33506e') {
  g.beginPath();
  g.arc(x - 9 * s, y, 9 * s, Math.PI * 1.15, Math.PI * 1.85);
  g.arc(x + 9 * s, y, 9 * s, Math.PI * 1.15, Math.PI * 1.85);
  g.strokeStyle = stroke;
  g.lineWidth = 2.4 * s;
  g.lineCap = 'round';
  g.stroke();
}

export function flower(g, x, y, s, petal, centre = '#ffd93b') {
  line(g, x, y, x, y + 16 * s, '#3d9950', 2.4 * s);
  for (let i = 0; i < 5; i += 1) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    circle(g, x + Math.cos(a) * 6 * s, y + Math.sin(a) * 6 * s, 5 * s, petal);
  }
  circle(g, x, y, 3.6 * s, centre);
}

function skyGradient(g, w, h, top, bottom) {
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
}

/* ---------- Scene 1: Twinkle Harbour ---------- */

function harbourBase(g, w, h) {
  skyGradient(g, w, h, '#8ed4f2', '#dff6ff');
  // distant hills
  g.fillStyle = '#9fd3a8';
  g.beginPath();
  g.moveTo(0, h * 0.52);
  g.quadraticCurveTo(w * 0.22, h * 0.34, w * 0.46, h * 0.52);
  g.quadraticCurveTo(w * 0.7, h * 0.38, w, h * 0.52);
  g.lineTo(w, h * 0.62);
  g.lineTo(0, h * 0.62);
  g.fill();
  // sea
  const sea = g.createLinearGradient(0, h * 0.6, 0, h);
  sea.addColorStop(0, '#3fa7d6');
  sea.addColorStop(1, '#1d6fb8');
  g.fillStyle = sea;
  g.fillRect(0, h * 0.6, w, h * 0.4);
  // wave sparkles, same seed every draw so both panels match
  const rng = mulberry32(42);
  g.strokeStyle = 'rgba(255,255,255,0.55)';
  g.lineWidth = 2;
  for (let i = 0; i < 26; i += 1) {
    const x = range(rng, 8, w - 30);
    const y = range(rng, h * 0.64, h * 0.96);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 16, y);
    g.stroke();
  }
  // pier
  roundRect(g, 0, h * 0.78, w * 0.52, 12, 5, '#a9743f');
  for (let i = 0; i < 5; i += 1) roundRect(g, 14 + i * (w * 0.1), h * 0.78, 9, h * 0.14, 3, '#8a5a2e');
  // harbour house
  roundRect(g, w * 0.72, h * 0.36, w * 0.2, h * 0.24, 4, '#fff3d6');
  g.fillStyle = '#e5534b';
  g.beginPath();
  g.moveTo(w * 0.7, h * 0.37);
  g.lineTo(w * 0.82, h * 0.27);
  g.lineTo(w * 0.94, h * 0.37);
  g.closePath();
  g.fill();
  roundRect(g, w * 0.8, h * 0.48, w * 0.045, h * 0.12, 3, '#7a4a2b');
  // big boat with striped hull
  const bx = w * 0.3; const by = h * 0.68;
  g.fillStyle = '#e5534b';
  g.beginPath();
  g.moveTo(bx - 62, by);
  g.lineTo(bx + 62, by);
  g.lineTo(bx + 44, by + 26);
  g.lineTo(bx - 44, by + 26);
  g.closePath();
  g.fill();
  g.fillStyle = '#ffffff';
  g.fillRect(bx - 62, by + 8, 124, 6);
  line(g, bx, by, bx, by - 74, '#7a4a2b', 5);
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.moveTo(bx + 4, by - 70);
  g.lineTo(bx + 4, by - 8);
  g.lineTo(bx + 44, by - 8);
  g.closePath();
  g.fill();
  // small boat
  const sx = w * 0.62; const sy = h * 0.74;
  g.fillStyle = '#f5b921';
  g.beginPath();
  g.moveTo(sx - 34, sy);
  g.lineTo(sx + 34, sy);
  g.lineTo(sx + 24, sy + 17);
  g.lineTo(sx - 24, sy + 17);
  g.closePath();
  g.fill();
  line(g, sx, sy, sx, sy - 40, '#7a4a2b', 3.5);
  g.fillStyle = '#7fd1f0';
  g.beginPath();
  g.moveTo(sx + 3, sy - 37);
  g.lineTo(sx + 3, sy - 5);
  g.lineTo(sx + 26, sy - 5);
  g.closePath();
  g.fill();
  // fixed gulls and clouds that are NOT differences
  cloud(g, w * 0.52, h * 0.13, 1.0, 'rgba(255,255,255,0.95)');
  seagull(g, w * 0.36, h * 0.2, 1.0);
  seagull(g, w * 0.44, h * 0.26, 0.75);
}

const harbourDiffs = [
  {
    name: 'The sun put on sunglasses', hint: 'Look high in the sky, left side.',
    x: 0.13, y: 0.16, r: 0.075,
    left(g, w, h) { circle(g, w * 0.13, h * 0.16, 30, '#ffd93b'); circle(g, w * 0.13, h * 0.16, 24, '#ffe873'); },
    right(g, w, h) {
      circle(g, w * 0.13, h * 0.16, 30, '#ffd93b'); circle(g, w * 0.13, h * 0.16, 24, '#ffe873');
      roundRect(g, w * 0.13 - 20, h * 0.16 - 7, 17, 12, 5, '#22304a');
      roundRect(g, w * 0.13 + 3, h * 0.16 - 7, 17, 12, 5, '#22304a');
      line(g, w * 0.13 - 3, h * 0.16 - 2, w * 0.13 + 3, h * 0.16 - 2, '#22304a', 3);
    },
  },
  {
    name: 'The lighthouse changed its stripes', hint: 'The tall tower on the right.',
    x: 0.885, y: 0.72, r: 0.07,
    left(g, w, h) { harbourLighthouse(g, w, h, '#e5534b'); },
    right(g, w, h) { harbourLighthouse(g, w, h, '#3f6fd8'); },
  },
  {
    name: 'An extra seagull joined the flock', hint: 'Count the birds near the top.',
    x: 0.6, y: 0.3, r: 0.06,
    left(g, w, h) { /* no bird here on the left */ },
    right(g, w, h) { seagull(g, w * 0.6, h * 0.3, 0.9, '#22304a'); },
  },
  {
    name: 'The big boat lost its flag', hint: 'Top of the tall mast.',
    x: 0.3, y: 0.545, r: 0.055,
    left(g, w, h) {
      g.fillStyle = '#e5534b';
      g.beginPath();
      g.moveTo(w * 0.3, h * 0.545 - 14);
      g.lineTo(w * 0.3 + 22, h * 0.545 - 8);
      g.lineTo(w * 0.3, h * 0.545 - 2);
      g.closePath();
      g.fill();
    },
    right(g, w, h) { /* flag gone */ },
  },
  {
    name: 'A fish stopped jumping', hint: 'Low, near the pier posts.',
    x: 0.18, y: 0.9, r: 0.06,
    left(g, w, h) {
      ellipse(g, w * 0.18, h * 0.9, 16, 8, '#ff9f43');
      g.fillStyle = '#ff9f43';
      g.beginPath();
      g.moveTo(w * 0.18 + 13, h * 0.9);
      g.lineTo(w * 0.18 + 24, h * 0.9 - 8);
      g.lineTo(w * 0.18 + 24, h * 0.9 + 8);
      g.closePath();
      g.fill();
      circle(g, w * 0.18 - 6, h * 0.9 - 2, 2.4, '#22304a');
    },
    right(g, w, h) { /* only ripples remain */ circle(g, w * 0.18, h * 0.93, 7, 'rgba(255,255,255,0.5)'); },
  },
  {
    name: 'A cloud drifted away', hint: 'Top right corner of the sky.',
    x: 0.82, y: 0.12, r: 0.07,
    left(g, w, h) { cloud(g, w * 0.78, h * 0.12, 0.9, 'rgba(255,255,255,0.95)'); },
    right(g, w, h) { /* clear sky */ },
  },
  {
    name: 'The harbour house lit its window', hint: 'The little house by the shore.',
    x: 0.775, y: 0.44, r: 0.05,
    left(g, w, h) { roundRect(g, w * 0.755, h * 0.405, 24, 24, 3, '#bfe6f5'); },
    right(g, w, h) { roundRect(g, w * 0.755, h * 0.405, 24, 24, 3, '#ffd93b'); },
  },
  {
    name: 'The life ring changed colour', hint: 'Hanging on the pier, far left.',
    x: 0.045, y: 0.83, r: 0.05,
    left(g, w, h) { lifeRing(g, w * 0.045, h * 0.83, '#e5534b'); },
    right(g, w, h) { lifeRing(g, w * 0.045, h * 0.83, '#1fae6b'); },
  },
];

function harbourLighthouse(g, w, h, stripe) {
  const x = w * 0.885; const base = h * 0.86;
  roundRect(g, x - 17, base - 118, 34, 118, 4, '#ffffff');
  g.fillStyle = stripe;
  g.fillRect(x - 17, base - 96, 34, 18);
  g.fillRect(x - 17, base - 58, 34, 18);
  roundRect(g, x - 21, base - 138, 42, 22, 4, '#22304a');
  circle(g, x, base - 127, 7, '#ffd93b');
  roundRect(g, x - 8, base - 26, 16, 26, 3, '#22304a');
}

function lifeRing(g, x, y, colour) {
  circle(g, x, y, 14, colour);
  circle(g, x, y, 8, '#3fa7d6');
  circle(g, x, y, 13, 'rgba(0,0,0,0)');
}

/* ---------- Scene 2: The Garden Café ---------- */

function cafeBase(g, w, h) {
  skyGradient(g, w, h, '#aee3ff', '#fdf3d8');
  circle(g, w * 0.88, h * 0.14, 26, '#ffd93b');
  cloud(g, w * 0.16, h * 0.12, 0.9, 'rgba(255,255,255,0.95)');
  cloud(g, w * 0.6, h * 0.08, 0.7, 'rgba(255,255,255,0.9)');
  // hedge and lawn
  g.fillStyle = '#57b25e';
  g.fillRect(0, h * 0.62, w, h * 0.38);
  g.fillStyle = '#3d9950';
  for (let x = 0; x < w; x += 46) roundRect(g, x, h * 0.58, 40, 26, 12, '#3d9950');
  // café wall and awning behind the table
  roundRect(g, w * 0.58, h * 0.2, w * 0.36, h * 0.44, 6, '#ffe9c9');
  g.fillStyle = '#ff7a59';
  for (let i = 0; i < 6; i += 1) {
    g.beginPath();
    g.moveTo(w * 0.58 + i * w * 0.06, h * 0.2);
    g.lineTo(w * 0.58 + (i + 1) * w * 0.06, h * 0.2);
    g.lineTo(w * 0.58 + (i + 0.5) * w * 0.06, h * 0.28);
    g.closePath();
    g.fill();
  }
  roundRect(g, w * 0.68, h * 0.36, w * 0.1, h * 0.16, 4, '#bfe6f5');
  line(g, w * 0.73, h * 0.36, w * 0.73, h * 0.52, '#ffffff', 3);
  // fence
  g.fillStyle = '#d9a066';
  for (let x = 6; x < w * 0.5; x += 34) roundRect(g, x, h * 0.5, 10, h * 0.16, 4, '#d9a066');
  roundRect(g, 0, h * 0.55, w * 0.5, 8, 4, '#c78d4e');
  // table
  ellipse(g, w * 0.4, h * 0.66, 92, 20, '#ffffff');
  roundRect(g, w * 0.4 - 6, h * 0.66, 12, h * 0.16, 4, '#8a5a2e');
  ellipse(g, w * 0.4, h * 0.845, 44, 9, '#8a5a2e');
  // two chairs
  chair(g, w * 0.22, h * 0.7, '#3f6fd8');
  chair(g, w * 0.58, h * 0.7, '#3f6fd8');
  // teapot on the table (its steam is a difference, the pot is not)
  roundRect(g, w * 0.44, h * 0.585, 34, 24, 10, '#e5534b');
  circle(g, w * 0.44 + 17, h * 0.578, 5, '#22304a');
  // flower beds
  const rng = mulberry32(7);
  for (let i = 0; i < 14; i += 1) {
    const x = range(rng, 16, w - 16);
    const y = range(rng, h * 0.88, h * 0.97);
    flower(g, x, y, 0.8, ['#ff6b9d', '#c084fc', '#ff9f43'][i % 3]);
  }
  pineTree(g, w * 0.06, h * 0.6, 1.5);
}

function chair(g, x, y, colour) {
  roundRect(g, x - 22, y - 44, 44, 12, 5, colour);
  roundRect(g, x - 22, y - 44, 9, 56, 4, colour);
  roundRect(g, x + 13, y - 44, 9, 56, 4, colour);
  roundRect(g, x - 24, y + 8, 48, 10, 5, colour);
}

const cafeDiffs = [
  {
    name: 'The umbrella changed colour', hint: 'The big umbrella over the table.',
    x: 0.4, y: 0.4, r: 0.085,
    left(g, w, h) { umbrella(g, w, h, '#e5534b'); },
    right(g, w, h) { umbrella(g, w, h, '#12a5a5'); },
  },
  {
    name: 'The cat left its chair', hint: 'Someone small was sitting on the left chair.',
    x: 0.22, y: 0.68, r: 0.06,
    left(g, w, h) { cat(g, w * 0.22, h * 0.685, '#ff9f43'); },
    right(g, w, h) { /* chair is empty */ },
  },
  {
    name: 'A cup vanished from the table', hint: 'On the table, left of the teapot.',
    x: 0.345, y: 0.625, r: 0.05,
    left(g, w, h) { roundRect(g, w * 0.33, h * 0.605, 20, 15, 4, '#3f6fd8'); },
    right(g, w, h) { /* cup gone */ },
  },
  {
    name: 'A butterfly arrived', hint: 'Fluttering over the flower bed, right side.',
    x: 0.84, y: 0.72, r: 0.055,
    left(g, w, h) { /* no butterfly yet */ },
    right(g, w, h) { butterfly(g, w * 0.84, h * 0.72); },
  },
  {
    name: 'The teapot stopped steaming', hint: 'Above the red teapot.',
    x: 0.475, y: 0.53, r: 0.05,
    left(g, w, h) {
      g.strokeStyle = 'rgba(120,140,160,0.8)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(w * 0.465, h * 0.56);
      g.quadraticCurveTo(w * 0.455, h * 0.53, w * 0.468, h * 0.505); g.stroke();
      g.beginPath(); g.moveTo(w * 0.485, h * 0.56);
      g.quadraticCurveTo(w * 0.475, h * 0.53, w * 0.488, h * 0.505); g.stroke();
    },
    right(g, w, h) { /* steam gone */ },
  },
  {
    name: 'The tulips changed colour', hint: 'The potted tulips by the café wall.',
    x: 0.9, y: 0.6, r: 0.06,
    left(g, w, h) { tulipPot(g, w, h, '#ff6b9d'); },
    right(g, w, h) { tulipPot(g, w, h, '#ffd93b'); },
  },
  {
    name: 'The watering can changed colour', hint: 'On the lawn, bottom left.',
    x: 0.13, y: 0.86, r: 0.055,
    left(g, w, h) { wateringCan(g, w * 0.13, h * 0.86, '#3f6fd8'); },
    right(g, w, h) { wateringCan(g, w * 0.13, h * 0.86, '#e5534b'); },
  },
  {
    name: 'A bird landed on the fence', hint: 'Along the wooden fence.',
    x: 0.32, y: 0.5, r: 0.05,
    left(g, w, h) { /* fence is empty */ },
    right(g, w, h) {
      circle(g, w * 0.32, h * 0.5, 9, '#7fd1f0');
      circle(g, w * 0.32 + 8, h * 0.5 - 6, 6, '#7fd1f0');
      g.fillStyle = '#f5b921';
      g.beginPath(); g.moveTo(w * 0.32 + 13, h * 0.5 - 6); g.lineTo(w * 0.32 + 19, h * 0.5 - 3); g.lineTo(w * 0.32 + 13, h * 0.5); g.closePath(); g.fill();
    },
  },
];

function umbrella(g, w, h, colour) {
  line(g, w * 0.4, h * 0.42, w * 0.4, h * 0.66, '#8a5a2e', 5);
  g.fillStyle = colour;
  g.beginPath();
  g.moveTo(w * 0.4 - 104, h * 0.44);
  g.quadraticCurveTo(w * 0.4, h * 0.28, w * 0.4 + 104, h * 0.44);
  g.quadraticCurveTo(w * 0.4 + 52, h * 0.38, w * 0.4, h * 0.44);
  g.quadraticCurveTo(w * 0.4 - 52, h * 0.38, w * 0.4 - 104, h * 0.44);
  g.closePath();
  g.fill();
  circle(g, w * 0.4, h * 0.335, 6, '#ffd93b');
}

function cat(g, x, y, colour) {
  ellipse(g, x, y, 17, 11, colour);
  circle(g, x + 13, y - 9, 9, colour);
  g.fillStyle = colour;
  g.beginPath();
  g.moveTo(x + 6, y - 15); g.lineTo(x + 9, y - 23); g.lineTo(x + 13, y - 16); g.closePath();
  g.moveTo(x + 15, y - 16); g.lineTo(x + 19, y - 23); g.lineTo(x + 21, y - 14); g.closePath();
  g.fill();
  line(g, x - 16, y + 2, x - 26, y - 8, colour, 4);
  circle(g, x + 15, y - 10, 1.8, '#22304a');
}

function butterfly(g, x, y) {
  ellipse(g, x - 8, y, 8, 11, '#c084fc');
  ellipse(g, x + 8, y, 8, 11, '#c084fc');
  ellipse(g, x - 6, y + 8, 6, 8, '#ff6b9d');
  ellipse(g, x + 6, y + 8, 6, 8, '#ff6b9d');
  roundRect(g, x - 2, y - 9, 4, 18, 2, '#22304a');
}

function tulipPot(g, w, h, colour) {
  const x = w * 0.9; const y = h * 0.64;
  g.fillStyle = '#c96f2e';
  g.beginPath();
  g.moveTo(x - 18, y); g.lineTo(x + 18, y); g.lineTo(x + 13, y + 24); g.lineTo(x - 13, y + 24); g.closePath(); g.fill();
  flower(g, x - 11, y - 18, 1.0, colour);
  flower(g, x + 2, y - 24, 1.0, colour);
  flower(g, x + 13, y - 16, 1.0, colour);
}

function wateringCan(g, x, y, colour) {
  roundRect(g, x - 18, y - 12, 36, 24, 5, colour);
  line(g, x + 17, y - 8, x + 30, y - 16, colour, 6);
  line(g, x - 17, y - 6, x - 28, y + 4, colour, 6);
  circle(g, x - 31, y + 6, 5, colour);
}

/* ---------- Scene 3: Starry Camp ---------- */

function campBase(g, w, h) {
  skyGradient(g, w, h, '#16264d', '#3a4a7a');
  const rng = mulberry32(99);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 46; i += 1) {
    const x = range(rng, 6, w - 6); const y = range(rng, 6, h * 0.42);
    const r = range(rng, 1, 2.4);
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  // hills and ground
  g.fillStyle = '#1d3a2a';
  g.beginPath();
  g.moveTo(0, h * 0.66);
  g.quadraticCurveTo(w * 0.3, h * 0.54, w * 0.58, h * 0.66);
  g.quadraticCurveTo(w * 0.8, h * 0.56, w, h * 0.66);
  g.lineTo(w, h); g.lineTo(0, h); g.fill();
  g.fillStyle = '#26503a';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  // tree line
  pineTree(g, w * 0.05, h * 0.72, 1.9, '#4a3220', '#1e5c3a');
  pineTree(g, w * 0.13, h * 0.7, 1.4, '#4a3220', '#256b44');
  pineTree(g, w * 0.93, h * 0.71, 1.8, '#4a3220', '#1e5c3a');
  pineTree(g, w * 0.85, h * 0.69, 1.3, '#4a3220', '#256b44');
  // tent body (flap is a difference)
  const tx = w * 0.3; const ty = h * 0.82;
  g.fillStyle = '#ff9f43';
  g.beginPath();
  g.moveTo(tx - 92, ty); g.lineTo(tx, ty - 108); g.lineTo(tx + 92, ty); g.closePath(); g.fill();
  g.fillStyle = '#e07f2e';
  g.beginPath();
  g.moveTo(tx, ty - 108); g.lineTo(tx + 92, ty); g.lineTo(tx + 30, ty); g.closePath(); g.fill();
  line(g, tx - 92, ty, tx - 104, ty + 4, '#d9d9d9', 3);
  line(g, tx + 92, ty, tx + 104, ty + 4, '#d9d9d9', 3);
  // campfire stones and glow (flames shared, logs differ)
  const fx = w * 0.62; const fy = h * 0.84;
  ellipse(g, fx, fy + 16, 52, 14, 'rgba(255,170,60,0.25)');
  g.fillStyle = '#8d99ae';
  for (let i = 0; i < 7; i += 1) {
    const a = (Math.PI * i) / 6 + 0.2;
    ellipse(g, fx + Math.cos(a) * 40, fy + 14 + Math.sin(a) * 6, 9, 6, '#8d99ae');
  }
  flame(g, fx, fy);
  // log bench and lantern
  roundRect(g, w * 0.47, h * 0.86, 64, 14, 7, '#7a4a2b');
  roundRect(g, w * 0.78, h * 0.8, 10, 34, 3, '#4a3220');
  circle(g, w * 0.795, h * 0.79, 9, '#ffd93b');
  roundRect(g, w * 0.78, h * 0.755, 20, 8, 3, '#22304a');
}

function flame(g, x, y) {
  g.fillStyle = '#ff7a59';
  g.beginPath();
  g.moveTo(x - 16, y + 14);
  g.quadraticCurveTo(x - 18, y - 12, x, y - 30);
  g.quadraticCurveTo(x + 18, y - 12, x + 16, y + 14);
  g.quadraticCurveTo(x, y + 22, x - 16, y + 14);
  g.fill();
  g.fillStyle = '#ffd93b';
  g.beginPath();
  g.moveTo(x - 8, y + 14);
  g.quadraticCurveTo(x - 8, y - 4, x, y - 16);
  g.quadraticCurveTo(x + 8, y - 4, x + 8, y + 14);
  g.quadraticCurveTo(x, y + 19, x - 8, y + 14);
  g.fill();
}

const campDiffs = [
  {
    name: 'The moon filled out', hint: 'The moon, top left.',
    x: 0.1, y: 0.15, r: 0.065,
    left(g, w, h) {
      circle(g, w * 0.1, h * 0.15, 26, '#fdf6d8');
      circle(g, w * 0.1 + 13, h * 0.15 - 7, 22, '#16264d');
    },
    right(g, w, h) {
      circle(g, w * 0.1, h * 0.15, 26, '#fdf6d8');
      circle(g, w * 0.1 - 7, h * 0.15 - 5, 4, '#e8dfba');
      circle(g, w * 0.1 + 8, h * 0.15 + 9, 3, '#e8dfba');
    },
  },
  {
    name: 'The tent flap changed colour', hint: 'The tent doorway in the middle.',
    x: 0.3, y: 0.72, r: 0.07,
    left(g, w, h) { tentFlap(g, w, h, '#7a3b1e'); },
    right(g, w, h) { tentFlap(g, w, h, '#3f6fd8'); },
  },
  {
    name: 'An owl landed on the branch', hint: 'On the bare branch, top right.',
    x: 0.72, y: 0.2, r: 0.06,
    left(g, w, h) { branch(g, w, h); },
    right(g, w, h) { branch(g, w, h); owl(g, w * 0.72, h * 0.185); },
  },
  {
    name: 'The marshmallow stick vanished', hint: 'Leaning by the campfire.',
    x: 0.56, y: 0.76, r: 0.055,
    left(g, w, h) {
      line(g, w * 0.545, h * 0.82, w * 0.575, h * 0.72, '#c9a06a', 3.5);
      roundRect(g, w * 0.568, h * 0.695, 13, 17, 6, '#ffffff');
    },
    right(g, w, h) { /* stick gone */ },
  },
  {
    name: 'A bright star went missing', hint: 'The biggest star, upper middle.',
    x: 0.48, y: 0.12, r: 0.05,
    left(g, w, h) { star(g, w * 0.48, h * 0.12, 11, '#ffe873'); },
    right(g, w, h) { /* star gone */ },
  },
  {
    name: 'The backpack changed colour', hint: 'Beside the tent, on the ground.',
    x: 0.42, y: 0.83, r: 0.055,
    left(g, w, h) { backpack(g, w * 0.42, h * 0.85, '#e5534b'); },
    right(g, w, h) { backpack(g, w * 0.42, h * 0.85, '#12a5a5'); },
  },
  {
    name: 'Fireflies drifted in', hint: 'Low over the grass, far right.',
    x: 0.9, y: 0.88, r: 0.06,
    left(g, w, h) { /* none here yet */ },
    right(g, w, h) {
      circle(g, w * 0.87, h * 0.87, 4, '#ffe873');
      circle(g, w * 0.92, h * 0.9, 3, '#ffe873');
      circle(g, w * 0.9, h * 0.84, 2.6, '#ffe873');
      circle(g, w * 0.95, h * 0.86, 3.4, '#ffe873');
    },
  },
  {
    name: 'A mug appeared by the tent', hint: 'On the ground at the tent door.',
    x: 0.22, y: 0.85, r: 0.045,
    left(g, w, h) { /* no mug */ },
    right(g, w, h) { roundRect(g, w * 0.21, h * 0.83, 17, 15, 3, '#ff6b9d'); },
  },
];

function tentFlap(g, w, h, colour) {
  const tx = w * 0.3; const ty = h * 0.82;
  g.fillStyle = colour;
  g.beginPath();
  g.moveTo(tx, ty - 100);
  g.lineTo(tx + 30, ty);
  g.lineTo(tx - 30, ty);
  g.closePath();
  g.fill();
}

function branch(g, w, h) {
  line(g, w * 0.64, h * 0.24, w * 0.8, h * 0.17, '#4a3220', 6);
  line(g, w * 0.7, h * 0.215, w * 0.74, h * 0.16, '#4a3220', 4);
}

function owl(g, x, y) {
  ellipse(g, x, y, 11, 14, '#a9743f');
  circle(g, x, y - 12, 9, '#c98d54');
  circle(g, x - 3.5, y - 13, 3.4, '#ffffff');
  circle(g, x + 3.5, y - 13, 3.4, '#ffffff');
  circle(g, x - 3.5, y - 13, 1.7, '#22304a');
  circle(g, x + 3.5, y - 13, 1.7, '#22304a');
  g.fillStyle = '#f5b921';
  g.beginPath(); g.moveTo(x - 2, y - 9); g.lineTo(x + 2, y - 9); g.lineTo(x, y - 5); g.closePath(); g.fill();
}

function backpack(g, x, y, colour) {
  roundRect(g, x - 16, y - 26, 32, 30, 9, colour);
  roundRect(g, x - 10, y - 14, 20, 13, 5, 'rgba(0,0,0,0.18)');
  line(g, x - 8, y - 26, x - 8, y - 33, colour, 5);
  line(g, x + 8, y - 26, x + 8, y - 33, colour, 5);
}

/* ---------- Scene 4: The Toy Workshop ---------- */

function workshopBase(g, w, h) {
  skyGradient(g, w, h, '#ffe3b3', '#fff6e0');
  // wall panels and floor
  g.fillStyle = '#f7c873';
  g.fillRect(0, h * 0.74, w, h * 0.26);
  g.strokeStyle = 'rgba(160,100,30,0.35)'; g.lineWidth = 2;
  for (let i = 1; i < 6; i += 1) { g.beginPath(); g.moveTo((w / 6) * i, h * 0.74); g.lineTo((w / 6) * i - 20, h); g.stroke(); }
  // window with night sky
  roundRect(g, w * 0.76, h * 0.08, w * 0.18, h * 0.34, 8, '#22304a');
  roundRect(g, w * 0.775, h * 0.1, w * 0.15, h * 0.3, 6, '#2c4470');
  star(g, w * 0.81, h * 0.16, 5, '#ffe873');
  star(g, w * 0.89, h * 0.24, 4, '#ffe873');
  star(g, w * 0.84, h * 0.31, 3.4, '#ffe873');
  line(g, w * 0.85, h * 0.08, w * 0.85, h * 0.42, '#22304a', 4);
  // shelf unit
  roundRect(g, w * 0.05, h * 0.1, w * 0.5, h * 0.52, 6, '#b07a45');
  roundRect(g, w * 0.07, h * 0.12, w * 0.46, h * 0.48, 4, '#8a5a2e');
  roundRect(g, w * 0.07, h * 0.27, w * 0.46, 8, 3, '#b07a45');
  roundRect(g, w * 0.07, h * 0.44, w * 0.46, 8, 3, '#b07a45');
  // toy blocks on the top shelf
  roundRect(g, w * 0.1, h * 0.19, 30, 30, 4, '#e5534b');
  roundRect(g, w * 0.1 + 36, h * 0.19, 30, 30, 4, '#3f6fd8');
  roundRect(g, w * 0.1 + 18, h * 0.155, 30, 30, 4, '#1fae6b');
  g.fillStyle = '#ffffff';
  g.font = 'bold 19px system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText('A', w * 0.1 + 15, h * 0.19 + 22);
  g.fillText('B', w * 0.1 + 51, h * 0.19 + 22);
  g.fillText('C', w * 0.1 + 33, h * 0.155 + 22);
  // toy train on the floor (engine colour is shared, one car differs)
  trainEngine(g, w * 0.16, h * 0.9);
  trainCar(g, w * 0.3, h * 0.9, '#3f6fd8');
  // workbench
  roundRect(g, w * 0.58, h * 0.62, w * 0.36, 14, 5, '#8a5a2e');
  roundRect(g, w * 0.6, h * 0.62 + 12, 12, h * 0.2, 4, '#7a4a2b');
  roundRect(g, w * 0.9, h * 0.62 + 12, 12, h * 0.2, 4, '#7a4a2b');
  // half-built toy boat on the bench
  g.fillStyle = '#12a5a5';
  g.beginPath();
  g.moveTo(w * 0.68, h * 0.6); g.lineTo(w * 0.78, h * 0.6); g.lineTo(w * 0.755, h * 0.625); g.lineTo(w * 0.695, h * 0.625); g.closePath(); g.fill();
  line(g, w * 0.73, h * 0.6, w * 0.73, h * 0.545, '#7a4a2b', 3.5);
  // paint pots
  const pots = ['#e5534b', '#3f6fd8', '#1fae6b'];
  pots.forEach((c, i) => {
    roundRect(g, w * 0.83 + i * w * 0.035, h * 0.575, 20, 22, 3, c);
  });
  // garland across the top (one star differs)
  g.strokeStyle = '#7a4a2b'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, h * 0.04); g.quadraticCurveTo(w * 0.35, h * 0.1, w * 0.7, h * 0.03); g.stroke();
}

function trainEngine(g, x, y) {
  roundRect(g, x - 40, y - 26, 66, 26, 5, '#e5534b');
  roundRect(g, x + 8, y - 44, 20, 20, 4, '#e5534b');
  roundRect(g, x - 34, y - 40, 12, 14, 3, '#22304a');
  circle(g, x - 22, y + 3, 10, '#22304a');
  circle(g, x + 12, y + 3, 10, '#22304a');
  circle(g, x - 22, y + 3, 4, '#d9d9d9');
  circle(g, x + 12, y + 3, 4, '#d9d9d9');
}

function trainCar(g, x, y, colour) {
  roundRect(g, x - 30, y - 22, 58, 22, 5, colour);
  circle(g, x - 16, y + 3, 9, '#22304a');
  circle(g, x + 16, y + 3, 9, '#22304a');
}

const workshopDiffs = [
  {
    name: 'The clock tells a different time', hint: 'The round clock on the wall.',
    x: 0.63, y: 0.18, r: 0.065,
    left(g, w, h) { clockFace(g, w * 0.63, h * 0.18, 3, 0); },
    right(g, w, h) { clockFace(g, w * 0.63, h * 0.18, 7, 25); },
  },
  {
    name: 'The rocket changed colour', hint: 'On the middle shelf, standing tall.',
    x: 0.42, y: 0.36, r: 0.06,
    left(g, w, h) { rocket(g, w * 0.42, h * 0.42, '#e5534b'); },
    right(g, w, h) { rocket(g, w * 0.42, h * 0.42, '#12a5a5'); },
  },
  {
    name: 'The teddy lost its bow', hint: 'The bear on the middle shelf.',
    x: 0.18, y: 0.36, r: 0.06,
    left(g, w, h) { teddy(g, w * 0.18, h * 0.4, true); },
    right(g, w, h) { teddy(g, w * 0.18, h * 0.4, false); },
  },
  {
    name: 'The desk lamp switched off', hint: 'The lamp over the workbench.',
    x: 0.66, y: 0.5, r: 0.065,
    left(g, w, h) { lamp(g, w, h, true); },
    right(g, w, h) { lamp(g, w, h, false); },
  },
  {
    name: 'A book left the stack', hint: 'The pile of books on the bottom shelf.',
    x: 0.32, y: 0.54, r: 0.06,
    left(g, w, h) { bookStack(g, w * 0.32, h * 0.6, 4); },
    right(g, w, h) { bookStack(g, w * 0.32, h * 0.6, 3); },
  },
  {
    name: 'The train car changed colour', hint: 'The little train on the floor.',
    x: 0.3, y: 0.885, r: 0.06,
    left(g, w, h) { /* base car already blue; overlay matches */ trainCar(g, w * 0.3, h * 0.9, '#3f6fd8'); },
    right(g, w, h) { trainCar(g, w * 0.3, h * 0.9, '#ff6b9d'); },
  },
  {
    name: 'A garland star changed colour', hint: 'Along the string at the very top.',
    x: 0.35, y: 0.075, r: 0.05,
    left(g, w, h) { star(g, w * 0.35, h * 0.078, 10, '#f5b921'); },
    right(g, w, h) { star(g, w * 0.35, h * 0.078, 10, '#3f6fd8'); },
  },
  {
    name: 'The plant grew a leaf', hint: 'The potted plant by the window.',
    x: 0.72, y: 0.56, r: 0.055,
    left(g, w, h) { plant(g, w * 0.72, h * 0.62, 3); },
    right(g, w, h) { plant(g, w * 0.72, h * 0.62, 4); },
  },
];

function clockFace(g, x, y, hour, minute) {
  circle(g, x, y, 30, '#ffffff');
  g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.strokeStyle = '#22304a'; g.lineWidth = 4; g.stroke();
  const ha = ((hour % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  const ma = (minute / 60) * Math.PI * 2 - Math.PI / 2;
  line(g, x, y, x + Math.cos(ha) * 15, y + Math.sin(ha) * 15, '#22304a', 4);
  line(g, x, y, x + Math.cos(ma) * 22, y + Math.sin(ma) * 22, '#e5534b', 3);
  circle(g, x, y, 3.4, '#22304a');
}

function rocket(g, x, yBase, colour) {
  g.fillStyle = colour;
  g.beginPath();
  g.moveTo(x, yBase - 62);
  g.quadraticCurveTo(x + 15, yBase - 34, x + 13, yBase);
  g.lineTo(x - 13, yBase);
  g.quadraticCurveTo(x - 15, yBase - 34, x, yBase - 62);
  g.fill();
  circle(g, x, yBase - 34, 6.5, '#bfe6f5');
  g.fillStyle = '#f5b921';
  g.beginPath();
  g.moveTo(x - 13, yBase); g.lineTo(x - 22, yBase + 12); g.lineTo(x - 6, yBase + 4); g.closePath();
  g.moveTo(x + 13, yBase); g.lineTo(x + 22, yBase + 12); g.lineTo(x + 6, yBase + 4); g.closePath();
  g.fill();
}

function teddy(g, x, yBase, withBow) {
  circle(g, x - 13, yBase - 44, 8, '#a9743f');
  circle(g, x + 13, yBase - 44, 8, '#a9743f');
  circle(g, x, yBase - 38, 15, '#c98d54');
  ellipse(g, x, yBase - 12, 16, 19, '#c98d54');
  ellipse(g, x, yBase - 10, 9, 11, '#ecd3ac');
  circle(g, x - 4.5, yBase - 40, 2.2, '#22304a');
  circle(g, x + 4.5, yBase - 40, 2.2, '#22304a');
  ellipse(g, x, yBase - 33, 4.6, 3.4, '#8a5a2e');
  if (withBow) {
    g.fillStyle = '#e5534b';
    g.beginPath();
    g.moveTo(x, yBase - 24); g.lineTo(x - 10, yBase - 30); g.lineTo(x - 10, yBase - 18); g.closePath();
    g.moveTo(x, yBase - 24); g.lineTo(x + 10, yBase - 30); g.lineTo(x + 10, yBase - 18); g.closePath();
    g.fill();
    circle(g, x, yBase - 24, 3, '#c22f28');
  }
}

function lamp(g, w, h, on) {
  const x = w * 0.66; const y = h * 0.47;
  line(g, x, h * 0.4, x, y, '#22304a', 4);
  g.fillStyle = '#22304a';
  g.beginPath();
  g.moveTo(x - 20, y + 14); g.lineTo(x, y - 8); g.lineTo(x + 20, y + 14); g.closePath(); g.fill();
  if (on) {
    ellipse(g, x, y + 34, 30, 20, 'rgba(255,217,59,0.4)');
    circle(g, x, y + 12, 6, '#ffd93b');
  }
}

function bookStack(g, x, yBase, count) {
  const colours = ['#3f6fd8', '#1fae6b', '#e5534b', '#f5b921'];
  for (let i = 0; i < count; i += 1) {
    roundRect(g, x - 26 + (i % 2) * 4, yBase - 13 * (i + 1), 52, 12, 3, colours[i]);
  }
}

function plant(g, x, yBase, leaves) {
  g.fillStyle = '#c96f2e';
  g.beginPath();
  g.moveTo(x - 15, yBase - 20); g.lineTo(x + 15, yBase - 20); g.lineTo(x + 11, yBase); g.lineTo(x - 11, yBase); g.closePath(); g.fill();
  g.strokeStyle = '#3d9950'; g.lineWidth = 3;
  for (let i = 0; i < leaves; i += 1) {
    const dx = (i - (leaves - 1) / 2) * 11;
    g.beginPath(); g.moveTo(x, yBase - 18);
    g.quadraticCurveTo(x + dx, yBase - 34, x + dx * 1.5, yBase - 42 - (i % 2) * 6); g.stroke();
    circle(g, x + dx * 1.5, yBase - 42 - (i % 2) * 6, 4.4, '#57b25e');
  }
}

/* ---------- scene registry ---------- */

export const SCENES = [
  { id: 'harbour', title: 'Twinkle Harbour', drawBase: harbourBase, diffs: harbourDiffs },
  { id: 'cafe', title: 'The Garden Café', drawBase: cafeBase, diffs: cafeDiffs },
  { id: 'camp', title: 'Starry Camp', drawBase: campBase, diffs: campDiffs },
  { id: 'workshop', title: 'The Toy Workshop', drawBase: workshopBase, diffs: workshopDiffs },
];
