type Sample = { t: number; v: number };

/**
 * Release velocity from a least-squares line through only the last ~80 ms of pointer samples,
 * so a slow drag that ends in a flick reads as a flick.
 */
export function createVelocityTracker(windowMs = 80) {
  let samples: Sample[] = [];

  return {
    reset() {
      samples = [];
    },
    add(value: number, time = performance.now()) {
      samples.push({ t: time, v: value });
      const cutoff = time - windowMs * 2;
      while (samples.length > 2 && (samples[0]?.t ?? time) < cutoff) samples.shift();
    },
    /** Units per second. Zero once the pointer has been still for a beat. */
    velocity(now = performance.now()) {
      const recent = samples.filter((s) => now - s.t <= windowMs);
      const last = recent[recent.length - 1];
      if (recent.length < 2 || !last || now - last.t > 40) return 0;
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
