import { type SpringConfig, isAtRest, solveSpring } from './spring';

type FrameCallback = (now: number) => void;

/** One requestAnimationFrame loop shared by every spring on the page. */
const frameCallbacks = new Set<FrameCallback>();
let frameId = 0;

function tick(now: number) {
  for (const callback of frameCallbacks) callback(now);
  frameId = frameCallbacks.size > 0 ? requestAnimationFrame(tick) : 0;
}

function onFrame(callback: FrameCallback): () => void {
  frameCallbacks.add(callback);
  if (frameId === 0 && typeof requestAnimationFrame !== 'undefined') frameId = requestAnimationFrame(tick);
  return () => {
    frameCallbacks.delete(callback);
  };
}

export const PIXEL_PRECISION = { restDelta: 0.4, restSpeed: 8 };

export type SpringValue = {
  get: () => number;
  getVelocity: () => number;
  /** Animate toward `target`. Velocity carries over from any animation in flight unless given. */
  to: (target: number, options?: { velocity?: number; config?: SpringConfig }) => Promise<void>;
  /** Jump immediately, stopping any animation. */
  set: (value: number) => void;
  /** Shift the current position and target together, preserving the motion. */
  offset: (delta: number) => void;
  stop: () => void;
  isAnimating: () => boolean;
};

/**
 * A single animated number. `onChange` runs inside the shared frame loop,
 * so write to the DOM there directly instead of setting React state.
 */
export function createSpringValue(
  initial: number,
  config: SpringConfig,
  onChange: (value: number) => void,
  /** Rest thresholds in this value's units. Pixels can stop at half a pixel; opacity can't. */
  precision?: { restDelta: number; restSpeed: number },
): SpringValue {
  let position = initial;
  let velocity = 0;
  let target = initial;
  let from = initial;
  let startVelocity = 0;
  let startTime = 0;
  const withPrecision = (next: SpringConfig) => (precision ? { ...next, ...precision } : next);
  let activeConfig = withPrecision(config);
  // When `position` and `velocity` were last computed. A retarget restarts from that instant,
  // so a spring chased every frame (e.g. light following a pane) still advances.
  let stateTime = 0;
  let unsubscribe: (() => void) | null = null;
  let resolvers: Array<() => void> = [];

  const settle = () => {
    unsubscribe?.();
    unsubscribe = null;
    const pending = resolvers;
    resolvers = [];
    for (const resolve of pending) resolve();
  };

  const step = (now: number) => {
    if (startTime === 0) startTime = now;
    const elapsed = (now - startTime) / 1000;
    const state = solveSpring(activeConfig, from, target, startVelocity, elapsed);
    stateTime = now;
    if (isAtRest(activeConfig, state, target)) {
      position = target;
      velocity = 0;
      onChange(position);
      settle();
      return;
    }
    position = state.position;
    velocity = state.velocity;
    onChange(position);
  };

  return {
    get: () => position,
    getVelocity: () => velocity,
    isAnimating: () => unsubscribe !== null,
    to(nextTarget, options) {
      if (options?.config) activeConfig = withPrecision(options.config);
      from = position;
      startVelocity = options?.velocity ?? velocity;
      target = nextTarget;
      startTime = unsubscribe ? stateTime : 0;
      if (position === target && startVelocity === 0) {
        settle();
        return Promise.resolve();
      }
      unsubscribe ??= onFrame(step);
      return new Promise((resolve) => resolvers.push(resolve));
    },
    set(value) {
      position = value;
      target = value;
      velocity = 0;
      onChange(position);
      settle();
    },
    offset(delta) {
      position += delta;
      from += delta;
      target += delta;
      onChange(position);
    },
    stop() {
      target = position;
      velocity = 0;
      settle();
    },
  };
}
