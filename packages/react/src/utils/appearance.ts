import type { CSSProperties } from 'react';

export type HaloWorld = 'dichroic' | 'partition' | 'smoked' | 'vapor' | 'crystal' | 'ink' | 'opal' | 'mercury' | 'vellum';

/** A built-in world, or the name of one you define in CSS with `[data-halo-world='your-name']`. */
export type HaloWorldName = HaloWorld | (string & {});

export type HaloTheme = 'light' | 'dark' | 'system';

export type HaloDensity = 'compact' | 'comfortable' | 'spacious';

export type HaloRadius = 'square' | 'soft' | 'round' | 'pill' | number;

export const haloWorlds: readonly HaloWorld[] = ['dichroic', 'partition', 'smoked', 'vapor', 'crystal', 'ink', 'opal', 'mercury', 'vellum'];

const RADIUS: Record<Exclude<HaloRadius, number>, number> = { square: 6, soft: 12, round: 18, pill: 999 };

/** A radius preset or number in px. `cap` keeps large surfaces, like drawers, from turning into capsules. */
export function radiusPx(radius: HaloRadius | undefined, cap = Number.POSITIVE_INFINITY): number | undefined {
  if (radius === undefined) return undefined;
  return Math.min(typeof radius === 'number' ? radius : RADIUS[radius], cap);
}

export function radiusStyle(property: string, radius: HaloRadius | undefined, cap?: number): CSSProperties {
  const px = radiusPx(radius, cap);
  return px === undefined ? {} : ({ [property]: `${px}px` } as CSSProperties);
}
