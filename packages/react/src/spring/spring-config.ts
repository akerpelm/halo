export type SpringConfig = {
  /** Spring stiffness (k). Higher is faster. */
  stiffness: number;
  /** Damping coefficient (c). Higher settles with less bounce. */
  damping: number;
  /** Mass (m). */
  mass: number;
  /** Below this distance from the target, and below `restSpeed`, the spring is at rest. */
  restDelta?: number;
  /** Units per second. */
  restSpeed?: number;
};

export type SpringPresetName = keyof typeof springPresets;

export type SpringInput = Partial<SpringConfig> | { duration: number; bounce?: number } | SpringPresetName;

/**
 * Perceptual presets. `duration` is roughly the time to settle visually, `bounce` runs from
 * 0 (no overshoot) to about 0.5 (playful).
 */
export const springPresets = {
  snappy: { duration: 0.26, bounce: 0.12 },
  smooth: { duration: 0.34, bounce: 0 },
  bouncy: { duration: 0.4, bounce: 0.34 },
  gentle: { duration: 0.5, bounce: 0.1 },
  stiff: { duration: 0.18, bounce: 0 },
  pop: { duration: 0.3, bounce: 0.34 },
  jelly: { duration: 0.5, bounce: 0.48 },
  lazy: { duration: 0.7, bounce: 0.05 },
} as const satisfies Record<string, { duration: number; bounce: number }>;

const DEFAULT_CONFIG: SpringConfig = { stiffness: 400, damping: 38, mass: 1 };

/** Physical constants from a duration in seconds and a bounce, the mapping SwiftUI uses. */
export function fromDuration(duration: number, bounce = 0, mass = 1): SpringConfig {
  const period = Math.max(duration, 0.01);
  const dampingRatio = bounce >= 0 ? 1 - bounce : 1 / (1 + bounce);
  const omega = (2 * Math.PI) / period;
  return { stiffness: omega * omega * mass, damping: 2 * dampingRatio * omega * mass, mass };
}

/** Any spring input (preset name, duration and bounce, or raw constants) as physical constants. */
export function resolveSpring(input: SpringInput | undefined): SpringConfig {
  if (input === undefined) return DEFAULT_CONFIG;
  if (typeof input === 'string') {
    const preset = springPresets[input];
    return fromDuration(preset.duration, preset.bounce);
  }
  if ('duration' in input) return fromDuration(input.duration, input.bounce);
  return { ...DEFAULT_CONFIG, ...input };
}

/** The same spring character, played faster or slower: stiffness scales by 1/k², damping by 1/k. */
export function scaleSpring(config: SpringConfig, k: number): SpringConfig {
  return { ...config, stiffness: config.stiffness / (k * k), damping: config.damping / k };
}
