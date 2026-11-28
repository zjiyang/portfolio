// motion.js
// Small math helpers for animation. Pure JavaScript: no p5 needed.
// Any piece can import them, e.g.
//   import { lerp, phase } from '../../js/lib/motion.js';


// clamp
// Input: t, a number; lo and hi, the lower and upper limits (default 0 and 1)
// Returns: t, kept between lo and hi
// What it does: same as p5's constrain(), written here so this file doesn't need p5
export function clamp(t, lo = 0, hi = 1) {
  return Math.min(Math.max(t, lo), hi);
}


// lerp
// Input: a = start value, b = end value, t = progress (0 to 1)
// Returns: the value that is t of the way from a to b
// What it does: same as p5's lerp()
export function lerp(a, b, t) {
  return a + (b - a) * t;
}


// ease
// Input: t, a progress value (can be any number)
// Returns: a number from 0 to 1, the smoothed progress
// What it does:
//   1. Keep t between 0 and 1 (below 0 becomes 0, above 1 becomes 1)
//   2. Turn even progress into "slow - fast - slow"
export function ease(t) {
  t = clamp(t);
  return t * t * (3 - 2 * t);
}


// phase
// Input:
//   s: the current second (inside one loop)
//   a: the second this change starts
//   b: the second this change ends
// Returns: a number from 0 to 1, how much of this change is done (smoothed)
// What it does:
//   1. (s - a) / (b - a) = seconds already passed / total seconds of this change
//      before it starts: below 0; after it ends: above 1
//   2. Pass it to ease: keep it in range + make it smooth
export function phase(s, a, b) {
  return ease((s - a) / (b - a));
}
