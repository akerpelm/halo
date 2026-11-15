import { clamp } from '../../gesture/projection';

export type DrawerSide = 'bottom' | 'top' | 'left' | 'right';

/** A fraction of the viewport (0–1] or an exact size like `'320px'`. */
export type SnapPoint = number | `${number}px`;

export type DrawerGeometry = {
  size: number;
  snaps: number[];
  firstSnap: number;
  entries: Array<{ snap: SnapPoint; px: number }>;
};

export const EMPTY_GEOMETRY: DrawerGeometry = { size: 0, snaps: [0], firstSnap: 0, entries: [] };

export const isVertical = (side: DrawerSide) => side === 'bottom' || side === 'top';

export const OPEN_SIGN: Record<DrawerSide, 1 | -1> = { bottom: -1, top: 1, left: 1, right: -1 };

export const AWAY: Record<DrawerSide, { x: number; y: number }> = {
  bottom: { x: 0, y: -1 },
  top: { x: 0, y: 1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

export const viewportSize = (vertical: boolean) => (vertical ? window.innerHeight : window.innerWidth);

export function toPixels(snap: SnapPoint, viewport: number, size: number): number {
  const px = typeof snap === 'number' ? snap * viewport : Number.parseFloat(snap);
  return clamp(px, 0, size);
}

export function measureGeometry(panel: HTMLElement, snapPoints: readonly SnapPoint[] | undefined, vertical: boolean): DrawerGeometry {
  const size = vertical ? panel.offsetHeight : panel.offsetWidth;
  const viewport = viewportSize(vertical);
  const entries = (snapPoints ?? []).map((snap) => ({ snap, px: toPixels(snap, viewport, size) })).sort((a, b) => a.px - b.px);
  const snaps = entries.length ? entries.map((e) => e.px) : [size];
  return { size, snaps, firstSnap: snaps[0] ?? size, entries };
}

export function restingExtent(geometry: DrawerGeometry, activeSnap: SnapPoint | undefined, vertical: boolean): number {
  const { size, snaps } = geometry;
  if (activeSnap === undefined) return snaps[snaps.length - 1] ?? size;
  return toPixels(activeSnap, viewportSize(vertical), size);
}

export function snapSizeStyle(snapPoints: readonly SnapPoint[] | undefined, vertical: boolean) {
  if (!snapPoints?.length) return null;
  const sizes = snapPoints.map((s) => (typeof s === 'number' ? `${s * 100}${vertical ? 'dvh' : 'vw'}` : s));
  return { [vertical ? 'height' : 'width']: `max(${sizes.join(', ')})` };
}

export function findScrollable(target: Element | null, boundary: Element, vertical: boolean): HTMLElement | null {
  for (let el = target; el && el !== boundary; el = el.parentElement) {
    if (!(el instanceof HTMLElement)) continue;
    const style = getComputedStyle(el);
    const overflow = vertical ? style.overflowY : style.overflowX;
    const scrollable = vertical ? el.scrollHeight > el.clientHeight : el.scrollWidth > el.clientWidth;
    if (scrollable && (overflow === 'auto' || overflow === 'scroll')) return el;
  }
  return null;
}
