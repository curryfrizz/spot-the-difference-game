// random.js — a tiny seeded random number generator (mulberry32).
// A level always deals the same decorations for the same seed, which keeps
// the two panels identical except for the planted differences, and makes
// the screenshot scenes reproducible frame for frame.

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random float in [min, max) from the given generator. */
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

/** Random integer in [min, max] inclusive from the given generator. */
export function intRange(rng, min, max) {
  return Math.floor(range(rng, min, max + 1));
}

/** Pick one item from a list with the given generator. */
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}
