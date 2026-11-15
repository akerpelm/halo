/**
 * Release velocity from recent pointer samples.
 *
 * Averaging total distance over total time (what Sonner and Vaul do) under-reports
 * a slow drag that ends in a flick. We fit a line through only the last ~80ms.
 */
export function createVelocityTracker(windowMs = 80) {
  let samples: Array<{ t: number; v: number }> = [];

  return {
    reset() {
      samples = [];
    },
    add(value: number, time = performance.now()) {
      samples.push({ t: time, v: value });
      const cutoff = time - windowMs * 2;
      while (samples.length > 2 && (samples[0]?.t ?? time) < cutoff) samples.shift();
    },
    /** Units per second. Zero if the pointer has been still for a beat. */
    velocity(now = performance.now()) {
      const recent = samples.filter((s) => now - s.t <= windowMs);
      if (recent.length < 2) return 0;
      const last = recent[recent.length - 1];
      if (!last || now - last.t > 40) return 0;
      const meanT = recent.reduce((sum, s) => sum + s.t, 0) / recent.length;
      const meanV = recent.reduce((sum, s) => sum + s.v, 0) / recent.length;
      let numerator = 0;
      let denominator = 0;
      for (const s of recent) {
        numerator += (s.t - meanT) * (s.v - meanV);
        denominator += (s.t - meanT) ** 2;
      }
      return denominator === 0 ? 0 : (numerator / denominator) * 1000;
    },
  };
}

export type VelocityTracker = ReturnType<typeof createVelocityTracker>;

/**
 * iOS-style rubber band: resistance grows the further you pull past an edge,
 * approaching but never reaching `dimension`.
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0) return 0;
  const sign = Math.sign(overshoot);
  const distance = Math.abs(overshoot);
  return sign * (1 - 1 / ((distance * constant) / dimension + 1)) * dimension;
}

/**
 * Where a flick would come to rest under scroll-like deceleration.
 * Used to pick snap points and dismissal from intent, not just position.
 */
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
