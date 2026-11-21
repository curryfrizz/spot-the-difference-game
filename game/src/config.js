// config.js — every tuning number for Twinkle Harbour: Spot the Difference.
// The two picture panels are drawn on one canvas with a fixed logical size;
// the page scales the canvas to the window, so no rule depends on pixels
// reported by the display.

export const VIEW = { width: 1240, height: 560 };

/** Geometry of the two panels inside the canvas, in logical units. */
export const PANEL = { y: 44, width: 596, height: 470, gap: 24, radius: 18 };
export const PANEL_X = [
  (VIEW.width - PANEL.width * 2 - PANEL.gap) / 2,
  (VIEW.width - PANEL.width * 2 - PANEL.gap) / 2 + PANEL.width + PANEL.gap,
];

/** A click counts as a find when it lands within this share of panel width. */
export const BASE_HIT_RADIUS = 0.052;

export const SCORE = {
  find: 100,
  streakBonus: 15, // extra points per consecutive find in the current streak
  mistakePenalty: 25,
  hintCost: 40,
  secondBonus: 2, // points per second left when a level is cleared
};

export const TIME = { mistakeSeconds: 5, lowWarning: 20 };

/**
 * The campaign: six hunts across four hand-drawn scenes. Later hunts revisit
 * a scene with more, smaller and sneakier differences and a tighter clock,
 * so a player who memorised the easy version still has to look again.
 */
export const LEVELS = [
  { scene: 0, diffs: 5, seconds: 150, hints: 3, hitScale: 1.0, title: 'Morning at Twinkle Harbour' },
  { scene: 1, diffs: 5, seconds: 140, hints: 3, hitScale: 1.0, title: 'The Garden Café Opens' },
  { scene: 2, diffs: 6, seconds: 140, hints: 3, hitScale: 0.94, title: 'Starry Camp, First Night' },
  { scene: 3, diffs: 6, seconds: 130, hints: 2, hitScale: 0.94, title: 'The Toy Workshop at Dusk' },
  { scene: 0, diffs: 7, seconds: 120, hints: 2, hitScale: 0.86, title: 'Harbour Festival Evening' },
  { scene: 2, diffs: 8, seconds: 115, hints: 2, hitScale: 0.82, title: 'Starry Camp, Meteor Night' },
];

export const PALETTE = {
  ink: '#22304a',
  paper: '#fff8ec',
  accent: '#ff7a59',
  good: '#1fae6b',
  bad: '#e5484d',
  gold: '#f5b921',
  hudText: '#2b2118',
};

export const BEST_KEY = 'twinkle-harbour-spot.best';
