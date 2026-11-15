import { describe, expect, it } from 'vitest';
import { createVelocityTracker, nearest, project, rubberband } from '../src/core/gesture';

describe('velocity tracker', () => {
  it('measures release velocity, not the average of a slow drag', () => {
    const tracker = createVelocityTracker();
    // 500ms of slow drag (20px), then a 60ms flick covering 120px.
    for (let t = 0; t <= 500; t += 16) tracker.add((t / 500) * 20, t);
    for (let t = 516; t <= 576; t += 12) tracker.add(20 + ((t - 516) / 60) * 120, t);
    const velocity = tracker.velocity(576);
    expect(velocity).toBeGreaterThan(1500);
    // Averaged over the whole gesture (Sonner, Vaul) this reads as ~243px/s.
  });

  it('reports zero once the pointer has rested', () => {
    const tracker = createVelocityTracker();
    tracker.add(0, 0);
    tracker.add(100, 16);
    expect(tracker.velocity(120)).toBe(0);
  });
});

describe('rubberband', () => {
  it('resists more the further you pull and never passes the dimension', () => {
    const small = rubberband(20, 300);
    const large = rubberband(2000, 300);
    expect(small).toBeLessThan(20);
    expect(large).toBeLessThan(300);
    expect(rubberband(-50, 300)).toBeCloseTo(-rubberband(50, 300));
  });
});

describe('projection', () => {
  it('projects further for faster flicks and is signed', () => {
    expect(project(2000)).toBeGreaterThan(project(500));
    expect(project(-1000)).toBeLessThan(0);
    expect(nearest([0, 300, 600], 420)).toBe(300);
  });
});
