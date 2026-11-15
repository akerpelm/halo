import type { SpringConfig } from './spring-config';

export type SpringState = { position: number; velocity: number };

/**
 * Position and velocity of a damped spring `t` seconds after release, solved exactly rather than
 * integrated, so every frame is deterministic. `from` and `to` are absolute; `v0` is units per second.
 */
export function solveSpring(config: SpringConfig, from: number, to: number, v0: number, t: number): SpringState {
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
    return {
      position: to + decay * (a * cos + b * sin),
      velocity: decay * ((b * omegaD - zeta * omega0 * a) * cos - (a * omegaD + zeta * omega0 * b) * sin),
    };
  }

  if (zeta === 1) {
    const decay = Math.exp(-omega0 * t);
    const b = v0 + omega0 * x0;
    return { position: to + (x0 + b * t) * decay, velocity: (v0 - omega0 * b * t) * decay };
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

/** Seconds until a spring from 0 to 1 settles, capped at `maxSeconds`. */
export function settlingTime(config: SpringConfig, maxSeconds = 3): number {
  const step = 1 / 120;
  for (let t = 0; t < maxSeconds; t += step) {
    const state = solveSpring(config, 0, 1, 0, t);
    if (Math.abs(state.position - 1) < 0.001 && Math.abs(state.velocity) < 0.01) return t;
  }
  return maxSeconds;
}

/** The spring's curve from 0 to 1 as evenly spaced samples, e.g. to draw it or build a CSS `linear()`. */
export function sampleSpring(config: SpringConfig, samples = 60, maxSeconds = 2): number[] {
  const duration = settlingTime(config, maxSeconds);
  return Array.from({ length: samples }, (_, i) => solveSpring(config, 0, 1, 0, (i / (samples - 1)) * duration).position);
}
