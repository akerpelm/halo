import { type PointerEvent, type RefObject, useRef, useState } from 'react';
import { project } from '../../gesture/projection';
import { rubberband } from '../../gesture/rubberband';
import { createVelocityTracker } from '../../gesture/velocity-tracker';
import type { SpringValue } from '../../spring/spring-value';
import type { StackEdge } from '../toaster/toaster-context';
import type { ToastSize, ToastSprings } from './use-toast-motion';

type Axis = 'x' | 'y';

type SwipeState = { x: number; y: number; axis: Axis | null; pointerId: number; armed: boolean };

type Options = {
  enabled: boolean;
  edge: StackEdge;
  horizontal: 'left' | 'center' | 'right';
  size: RefObject<ToastSize>;
  springs: ToastSprings;
  go: (spring: SpringValue, target: number, velocity?: number) => Promise<void>;
  fade: (target: number) => Promise<void>;
  onInteract: (interacting: boolean) => void;
  onSwipeAway: (flight: Promise<unknown>) => void;
};

const SLOP = 5;
const DISMISS_FRACTION = 1 / 3;
const DISMISS_DECELERATION = 0.995;
const FLING_PAST = 80;
const NOT_SWIPEABLE = 'button, a, input, textarea, select, [data-halo-no-drag]';

export function useToastSwipe({ enabled, edge, horizontal, size, springs, go, fade, onInteract, onSwipeAway }: Options) {
  const swipe = useRef<SwipeState | null>(null);
  const [tracker] = useState(createVelocityTracker);

  const allowed = (axis: Axis, sign: number) => {
    if (sign === 0) return false;
    if (axis === 'y') return sign === edge;
    if (horizontal === 'center') return true;
    return horizontal === 'right' ? sign > 0 : sign < 0;
  };
  const sizeOn = (axis: Axis) => (axis === 'x' ? size.current.width : size.current.height) || 1;
  const springOn = (axis: Axis) => (axis === 'x' ? springs.x : springs.dy);

  const onPointerDown = (event: PointerEvent<HTMLLIElement>) => {
    if (!enabled) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest(NOT_SWIPEABLE)) return;
    target.setPointerCapture(event.pointerId);
    swipe.current = { x: event.clientX, y: event.clientY, axis: null, pointerId: event.pointerId, armed: false };
    tracker.reset();
    onInteract(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLLIElement>) => {
    const current = swipe.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.axis) {
      if (Math.hypot(dx, dy) < SLOP || window.getSelection()?.toString()) return;
      current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      event.currentTarget.dataset.swiping = '';
    }
    const raw = current.axis === 'x' ? dx : dy;
    const along = sizeOn(current.axis);
    const toward = allowed(current.axis, Math.sign(raw));
    const value = toward ? raw : rubberband(raw, along);
    springOn(current.axis).set(value);
    tracker.add(value, event.timeStamp);

    const armed = toward && Math.abs(raw) > along * DISMISS_FRACTION;
    if (armed === current.armed) return;
    current.armed = armed;
    if (armed && event.pointerType === 'touch') navigator.vibrate?.(6);
  };

  const release = (event: PointerEvent<HTMLLIElement>, cancelled: boolean) => {
    const current = swipe.current;
    if (!current || current.pointerId !== event.pointerId) return;
    swipe.current = null;
    onInteract(false);
    if (!current.axis) return;
    delete event.currentTarget.dataset.swiping;

    const spring = springOn(current.axis);
    const velocity = cancelled ? 0 : tracker.velocity(event.timeStamp);
    const landing = spring.get() + project(velocity, DISMISS_DECELERATION);
    const along = sizeOn(current.axis);
    const sign = Math.sign(landing);

    if (cancelled || !allowed(current.axis, sign) || Math.abs(landing) <= along * DISMISS_FRACTION) {
      go(spring, 0, velocity);
      return;
    }
    onSwipeAway(Promise.all([go(spring, sign * (along + FLING_PAST), velocity), fade(0)]));
  };

  return {
    isSwiping: () => Boolean(swipe.current?.axis),
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLLIElement>) => release(event, false),
      onPointerCancel: (event: PointerEvent<HTMLLIElement>) => release(event, true),
      onLostPointerCapture: (event: PointerEvent<HTMLLIElement>) => release(event, true),
    },
  };
}
