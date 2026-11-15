/**
 * Closed-form damped harmonic oscillator.
 *
 * Instead of integrating step by step (which drifts and depends on frame rate),
 * we solve the spring equation exactly for any elapsed time. That makes every
 * frame deterministic and lets us re-target mid-flight while keeping velocity.
 */

export type SpringConfig = {
  /** Spring stiffness (k). Higher is faster. */
  stiffness: number;
  /** Damping coefficient (c). Higher settles with less bounce. */
  damping: number;
  /** Mass (m). */
  mass: number;
  /** Below this distance from the target, and below restSpeed, the spring is at rest. */
  restDelta?: number;
  /** Units per second. */
  restSpeed?: number;
};

export type SpringInput =
  | Partial<SpringConfig>
  | { duration: number; bounce?: number }
  | SpringPresetName;

export type SpringPresetName = keyof typeof springPresets;

/**
 * Perceptual presets. `duration` is the approximate time to visually settle,
 * `bounce` is 0 (no overshoot) to ~0.5 (playful).
 */
export const springPresets = {
  snappy: { duration: 0.32, bounce: 0.08 },
  smooth: { duration: 0.45, bounce: 0 },
  bouncy: { duration: 0.5, bounce: 0.32 },
  gentle: { duration: 0.7, bounce: 0.12 },
  /** Quick and firm, with no overshoot at all. */
  stiff: { duration: 0.22, bounce: 0 },
  /** Short and springy: a single confident overshoot. */
  pop: { duration: 0.36, bounce: 0.3 },
  /** Wobbles visibly before settling. */
  jelly: { duration: 0.62, bounce: 0.5 },
  /** Slow and unhurried, for calm products. */
  lazy: { duration: 0.95, bounce: 0.06 },
} as const satisfies Record<string, { duration: number; bounce: number }>;

const DEFAULT_CONFIG: SpringConfig = { stiffness: 400, damping: 38, mass: 1 };

/**
 * Convert a designer-friendly (duration, bounce) pair into physical constants.
 * Same mapping SwiftUI uses: duration is the period of the undamped oscillation.
 */
export function fromDuration(duration: number, bounce = 0, mass = 1): SpringConfig {
  const safeDuration = Math.max(duration, 0.01);
  const dampingRatio = bounce >= 0 ? 1 - bounce : 1 / (1 + bounce);
  const omega = (2 * Math.PI) / safeDuration;
  return {
    stiffness: omega * omega * mass,
    damping: 2 * dampingRatio * omega * mass,
    mass,
  };
}

export function resolveSpring(input: SpringInput | undefined): SpringConfig {
  if (input === undefined) return DEFAULT_CONFIG;
  if (typeof input === 'string') {
    const preset = springPresets[input];
    return fromDuration(preset.duration, preset.bounce);
  }
  if ('duration' in input) return fromDuration(input.duration, input.bounce);
  return { ...DEFAULT_CONFIG, ...input };
}

export type SpringState = { position: number; velocity: number };

/**
 * Position and velocity of a spring `t` seconds after release.
 * `from`/`to` are absolute positions, `v0` is units per second.
 */
export function solveSpring(
  config: SpringConfig,
  from: number,
  to: number,
  v0: number,
  t: number,
): SpringState {
  const { stiffness: k, damping: c, mass: m } = config;
  const x0 = from - to;
  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));

  if (zeta < 1) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega0 * t);
    const a = x0;
    const b = (v0 + zeta * omega0 * x0) / omegaD;
    const cos = Math.cos(omegaD * t);
    const sin = Math.sin(omegaD * t);
    const x = decay * (a * cos + b * sin);
    const v = decay * ((b * omegaD - zeta * omega0 * a) * cos - (a * omegaD + zeta * omega0 * b) * sin);
    return { position: to + x, velocity: v };
  }

  if (zeta === 1) {
    const decay = Math.exp(-omega0 * t);
    const b = v0 + omega0 * x0;
    return {
      position: to + (x0 + b * t) * decay,
      velocity: (v0 - omega0 * b * t) * decay,
    };
  }

  const root = Math.sqrt(zeta * zeta - 1);
  const r1 = -omega0 * (zeta - root);
  const r2 = -omega0 * (zeta + root);
  const a = (v0 - r2 * x0) / (r1 - r2);
  const b = x0 - a;
  const e1 = Math.exp(r1 * t);
  const e2 = Math.exp(r2 * t);
  return { position: to + a * e1 + b * e2, velocity: a * r1 * e1 + b * r2 * e2 };
}

export function isAtRest(config: SpringConfig, state: SpringState, to: number): boolean {
  const restDelta = config.restDelta ?? 0.01;
  const restSpeed = config.restSpeed ?? 0.5;
  return Math.abs(state.position - to) < restDelta && Math.abs(state.velocity) < restSpeed;
}

/** Sample a spring into an array, e.g. to draw its curve or build a CSS linear() easing. */
export function sampleSpring(config: SpringConfig, samples = 60, maxSeconds = 2): number[] {
  const settle = settlingTime(config, maxSeconds);
  return Array.from({ length: samples }, (_, i) => solveSpring(config, 0, 1, 0, (i / (samples - 1)) * settle).position);
}

export function settlingTime(config: SpringConfig, maxSeconds = 3): number {
  const step = 1 / 120;
  for (let t = 0; t < maxSeconds; t += step) {
    const state = solveSpring(config, 0, 1, 0, t);
    if (Math.abs(state.position - 1) < 0.001 && Math.abs(state.velocity) < 0.01) return t;
  }
  return maxSeconds;
}
