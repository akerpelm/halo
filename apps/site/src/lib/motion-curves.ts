import { type SpringConfig, solveSpring } from 'halo-ui-react/spring';

export type MotionState = { position: number; velocity: number };

export type SpringSegment = { start: number; from: number; to: number; velocity: number };
export type CurveSegment = { start: number; from: number; to: number; duration: number };

const EASE = { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 };

const bezier = (u: number, a: number, b: number) => 3 * a * u * (1 - u) ** 2 + 3 * b * u ** 2 * (1 - u) + u ** 3;
const bezierSlope = (u: number, a: number, b: number) => 3 * a * (1 - u) ** 2 + 6 * (b - a) * u * (1 - u) + 3 * (1 - b) * u ** 2;

function easeAt(progress: number): { value: number; slope: number } {
  let u = progress;
  for (let i = 0; i < 8; i++) {
    const slope = bezierSlope(u, EASE.x1, EASE.x2);
    if (Math.abs(slope) < 1e-6) break;
    u -= (bezier(u, EASE.x1, EASE.x2) - progress) / slope;
    u = Math.min(1, Math.max(0, u));
  }
  const dx = bezierSlope(u, EASE.x1, EASE.x2);
  return { value: bezier(u, EASE.y1, EASE.y2), slope: dx === 0 ? 0 : bezierSlope(u, EASE.y1, EASE.y2) / dx };
}

export function springAt(config: SpringConfig, segment: SpringSegment, time: number): MotionState {
  return solveSpring(config, segment.from, segment.to, segment.velocity, Math.max(0, time - segment.start) / 1000);
}

export function curveAt(segment: CurveSegment, time: number): MotionState {
  const progress = (time - segment.start) / segment.duration;
  if (progress >= 1) return { position: segment.to, velocity: 0 };
  const { value, slope } = easeAt(Math.max(0, progress));
  const distance = segment.to - segment.from;
  return { position: segment.from + distance * value, velocity: (distance * slope * 1000) / segment.duration };
}

export function latest<T extends { start: number }>(segments: readonly T[], time: number): T | undefined {
  let found: T | undefined;
  for (const segment of segments) if (segment.start <= time) found = segment;
  return found;
}
