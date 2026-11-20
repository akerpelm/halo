import { project } from '../../gesture/projection';
import { rubberband } from '../../gesture/rubberband';

export type SwipeSide = 'start' | 'end';

export type SwipeGeometry = { row: number; start: number; end: number; startCommit: boolean; endCommit: boolean; ltr: boolean };

export const EMPTY_SWIPE_GEOMETRY: SwipeGeometry = { row: 0, start: 0, end: 0, startCommit: false, endCommit: false, ltr: true };

const COMMIT_PAST_ACTIONS = 56;
export const COMMIT = '[data-commit]:not(:disabled)';
const COMMIT_ROW_FRACTION = 0.5;

/** The side whose actions a movement of `x` px uncovers: moving the content left uncovers the end side in left-to-right text. */
export function sideFor(x: number, ltr: boolean): SwipeSide {
  return x < 0 === ltr ? 'end' : 'start';
}

export function directionOf(side: SwipeSide, ltr: boolean): 1 | -1 {
  return (side === 'end') === ltr ? -1 : 1;
}

/** How far the content must travel before letting go runs the side's commit action, or null if it has none. */
export function commitDistance(geometry: SwipeGeometry, side: SwipeSide): number | null {
  const commit = side === 'start' ? geometry.startCommit : geometry.endCommit;
  const width = geometry[side];
  if (!commit || width === 0) return null;
  return Math.min(Math.max(width + COMMIT_PAST_ACTIONS, geometry.row * COMMIT_ROW_FRACTION), geometry.row - 16);
}

/** Free travel up to the actions (or the whole row when a full swipe can commit), rubber-banding beyond. */
export function limit(x: number, geometry: SwipeGeometry): number {
  if (x === 0) return 0;
  const side = sideFor(x, geometry.ltr);
  const width = geometry[side];
  const reach = commitDistance(geometry, side) === null ? width : geometry.row;
  const distance = Math.abs(x);
  if (distance <= reach) return x;
  return Math.sign(x) * (reach + rubberband(distance - reach, geometry.row || 1));
}

export function measureSwipe(row: HTMLElement, actions: Record<SwipeSide, HTMLElement | null>, fullSwipe = true): SwipeGeometry {
  return {
    row: row.offsetWidth,
    start: actions.start?.offsetWidth ?? 0,
    end: actions.end?.offsetWidth ?? 0,
    startCommit: fullSwipe && Boolean(actions.start?.querySelector(COMMIT)),
    endCommit: fullSwipe && Boolean(actions.end?.querySelector(COMMIT)),
    ltr: getComputedStyle(row).direction !== 'rtl',
  };
}

export type SwipeOutcome = { kind: 'commit' | 'open' | 'close'; side: SwipeSide };

const RELEASE_DECELERATION = 0.995;

/**
 * Where a released row goes. A full swipe needs both the momentum to carry past the commit point and a drag
 * that already uncovered the actions, so a quick flick on a closed row opens it instead of running an action.
 */
export function releaseOutcome(position: number, velocity: number, geometry: SwipeGeometry): SwipeOutcome {
  const landing = position + project(velocity, RELEASE_DECELERATION);
  const side = sideFor(position || landing, geometry.ltr);
  const width = geometry[side];
  const toward = Math.sign(landing) === directionOf(side, geometry.ltr);
  const commitAt = commitDistance(geometry, side);
  if (commitAt !== null && toward && Math.abs(position) >= width && Math.abs(landing) >= commitAt) return { kind: 'commit', side };
  if (width > 0 && toward && Math.abs(landing) >= width / 2) return { kind: 'open', side };
  return { kind: 'close', side };
}
