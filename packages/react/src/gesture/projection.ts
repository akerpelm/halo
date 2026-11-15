/** How far a flick at `velocity` (units per second) would coast under scroll-like deceleration. */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export function nearest(values: readonly number[], target: number): number {
  let best = values[0] ?? target;
  for (const value of values) {
    if (Math.abs(value - target) < Math.abs(best - target)) best = value;
  }
  return best;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
