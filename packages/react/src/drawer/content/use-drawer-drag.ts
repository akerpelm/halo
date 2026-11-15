import { type PointerEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { nearest, project } from '../../gesture/projection';
import { rubberband } from '../../gesture/rubberband';
import { createVelocityTracker } from '../../gesture/velocity-tracker';
import type { SpringValue } from '../../spring/spring-value';
import { type DrawerGeometry, type DrawerSide, OPEN_SIGN, findScrollable, isVertical } from '../utils/geometry';

type DragState = {
  start: number;
  cross: number;
  startExtent: number;
  pointerId: number;
  scrollable: HTMLElement | null;
  phase: 'pending' | 'dragging' | 'ignored';
};

type Options = {
  panelRef: RefObject<HTMLDivElement | null>;
  extent: SpringValue;
  geometry: RefObject<DrawerGeometry>;
  side: DrawerSide;
  dismissible: boolean;
  present: boolean;
  onSettle: (target: number, velocity: number) => void;
};

const SNAP_DECELERATION = 0.992;
const SLOP = 5;
const NOT_DRAGGABLE = 'button, a, input, textarea, select, [contenteditable], [data-halo-no-drag]';

export function useDrawerDrag({ panelRef, extent, geometry, side, dismissible, present, onSettle }: Options) {
  const drag = useRef<DragState | null>(null);
  const wasDragged = useRef(false);
  const [tracker] = useState(createVelocityTracker);
  const vertical = isVertical(side);
  const axisOf = (event: PointerEvent) => (vertical ? event.clientY : event.clientX);
  const crossOf = (event: PointerEvent) => (vertical ? event.clientX : event.clientY);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onTouchMove = (event: TouchEvent) => {
      if (drag.current?.phase === 'dragging') event.preventDefault();
    };
    panel.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => panel.removeEventListener('touchmove', onTouchMove);
  }, [present]);

  const claims = (current: DragState, delta: number, crossDelta: number) => {
    if (crossDelta > Math.abs(delta)) return false;
    const scroller = current.scrollable;
    if (!scroller) return true;
    const { size, snaps } = geometry.current;
    const maxExtent = snaps[snaps.length - 1] ?? size;
    const atStart = (vertical ? scroller.scrollTop : scroller.scrollLeft) <= 0;
    const expanding = delta > 0 && current.startExtent < maxExtent - 1;
    const closingFromStart = delta < 0 && atStart && OPEN_SIGN[side] === -1;
    return expanding || closingFromStart;
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const target = event.target as Element;
    const interactive = target.closest(NOT_DRAGGABLE);
    if (interactive && !interactive.hasAttribute('data-halo-handle')) return;
    wasDragged.current = false;
    target.setPointerCapture(event.pointerId);
    drag.current = {
      start: axisOf(event),
      cross: crossOf(event),
      startExtent: extent.get(),
      pointerId: event.pointerId,
      scrollable: panelRef.current ? findScrollable(target, panelRef.current, vertical) : null,
      phase: 'pending',
    };
    tracker.reset();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId || current.phase === 'ignored') return;
    const delta = (axisOf(event) - current.start) * OPEN_SIGN[side];

    if (current.phase === 'pending') {
      const crossDelta = Math.abs(crossOf(event) - current.cross);
      if (Math.abs(delta) < SLOP && crossDelta < SLOP) return;
      if (!claims(current, delta, crossDelta)) {
        current.phase = 'ignored';
        return;
      }
      current.phase = 'dragging';
      wasDragged.current = true;
      panelRef.current?.setAttribute('data-dragging', '');
    }

    const { size, snaps } = geometry.current;
    const maxExtent = snaps[snaps.length - 1] ?? size;
    const minExtent = dismissible ? 0 : (snaps[0] ?? 0);
    let next = current.startExtent + delta;
    if (next > maxExtent) next = maxExtent + rubberband(next - maxExtent, size * 0.5, 0.35);
    if (next < minExtent) next = dismissible ? Math.max(next, 0) : minExtent - rubberband(minExtent - next, size);
    extent.set(next);
    tracker.add(next, event.timeStamp);
  };

  const end = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    if (current.phase !== 'dragging') return;
    panelRef.current?.removeAttribute('data-dragging');
    const velocity = cancelled ? 0 : tracker.velocity(event.timeStamp);
    const landing = extent.get() + project(velocity, SNAP_DECELERATION);
    const { snaps } = geometry.current;
    onSettle(nearest(dismissible ? [0, ...snaps] : snaps, landing), velocity);
  };

  return {
    wasDragged,
    isDragging: () => drag.current !== null,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => end(event, false),
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => end(event, true),
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => end(event, true),
    },
  };
}

