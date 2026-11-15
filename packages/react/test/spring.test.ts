import { describe, expect, it } from 'vitest';
import { fromDuration, resolveSpring, settlingTime, solveSpring } from '../src/spring';

const configs = {
  underdamped: { stiffness: 400, damping: 18, mass: 1 },
  critical: { stiffness: 400, damping: 40, mass: 1 },
  overdamped: { stiffness: 400, damping: 90, mass: 1 },
};

describe('solveSpring', () => {
  for (const [name, config] of Object.entries(configs)) {
    it(`${name}: starts at origin with initial velocity`, () => {
      const s = solveSpring(config, 10, 100, 250, 0);
      expect(s.position).toBeCloseTo(10, 6);
      expect(s.velocity).toBeCloseTo(250, 6);
    });

    it(`${name}: settles at the target`, () => {
      const s = solveSpring(config, 0, 1, 0, 5);
      expect(s.position).toBeCloseTo(1, 4);
      expect(s.velocity).toBeCloseTo(0, 3);
    });

    it(`${name}: velocity is the derivative of position`, () => {
      const t = 0.08;
      const h = 1e-5;
      const a = solveSpring(config, 0, 1, 3, t - h).position;
      const b = solveSpring(config, 0, 1, 3, t + h).position;
      expect(solveSpring(config, 0, 1, 3, t).velocity).toBeCloseTo((b - a) / (2 * h), 3);
    });
  }

  it('underdamped springs overshoot, critically damped ones do not', () => {
    const peak = (config: (typeof configs)['critical']) =>
      Math.max(...Array.from({ length: 200 }, (_, i) => solveSpring(config, 0, 1, 0, i / 100).position));
    expect(peak(configs.underdamped)).toBeGreaterThan(1.05);
    expect(peak(configs.critical)).toBeLessThanOrEqual(1.0000001);
  });
});

describe('fromDuration', () => {
  it('maps bounce 0 to critical damping', () => {
    const c = fromDuration(0.5, 0);
    expect(c.damping / (2 * Math.sqrt(c.stiffness * c.mass))).toBeCloseTo(1, 6);
  });

  it('longer durations settle later', () => {
    expect(settlingTime(fromDuration(0.8, 0))).toBeGreaterThan(settlingTime(fromDuration(0.3, 0)));
  });

  it('resolves presets by name', () => {
    expect(resolveSpring('snappy').stiffness).toBeGreaterThan(resolveSpring('gentle').stiffness);
  });
});

describe('createSpringValue', () => {
  it('advances when retargeted every frame', async () => {
    const { createSpringValue } = await import('../src/spring/spring-value');
    let now = 0;
    const queue: FrameRequestCallback[] = [];
    globalThis.requestAnimationFrame = (cb) => {
      queue.push(cb);
      return queue.length;
    };
    const follower = createSpringValue(0, resolveSpring('smooth'), () => {});
    for (let frame = 0; frame < 30; frame++) {
      follower.to(100);
      now += 16;
      const pending = queue.splice(0);
      for (const cb of pending) cb(now);
    }
    expect(follower.get()).toBeGreaterThan(50);
  });
});
