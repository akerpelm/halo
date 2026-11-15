import type { CSSProperties } from 'react';

export type HaloDensity = 'compact' | 'comfortable' | 'spacious';
export type HaloRadius = 'square' | 'soft' | 'round' | 'pill' | number;

const RADIUS: Record<Exclude<HaloRadius, number>, number> = { square: 6, soft: 12, round: 18, pill: 999 };

/** Resolve a radius preset or number to px. `cap` keeps large surfaces (drawers) from turning into capsules. */
export function radiusPx(radius: HaloRadius | undefined, cap = Number.POSITIVE_INFINITY): number | undefined {
  if (radius === undefined) return undefined;
  return Math.min(typeof radius === 'number' ? radius : RADIUS[radius], cap);
}

export function appearanceStyle(radiusVar: string, radius: HaloRadius | undefined, cap?: number): CSSProperties {
  const px = radiusPx(radius, cap);
  return px === undefined ? {} : ({ [radiusVar]: `${px}px` } as CSSProperties);
}
