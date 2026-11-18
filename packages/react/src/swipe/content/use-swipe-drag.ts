import { type PointerEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { createVelocityTracker } from '../../gesture/velocity-tracker';
import { limit } from '../root/geometry';
import type { SwipeMotion } from '../root/use-swipe-motion';

type Drag = { x: number; y: number; start: number; axis: 'x' | 'y' | null; pointerId: number };

const SLOP = 6;
const CLICK_WINDOW_MS = 80;
const NOT_DRAGGABLE = 'input, textarea, select, [contenteditable], [data-halo-no-drag]';

function swallowNextClick(element: HTMLElement) {
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  element.addEventListener('click', swallow, { capture: true, once: true });
  setTimeout(() => element.removeEventListener('click', swallow, { capture: true }), CLICK_WINDOW_MS);
}

export function useSwipeDrag(contentRef: RefObject<HTMLDivElement | null>, motion: SwipeMotion, disabled: boolean) {
  const drag = useRef<Drag | null>(null);
  const [tracker] = useState(createVelocityTracker);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const holdScroll = (event: TouchEvent) => {
      if (drag.current?.axis === 'x' && event.cancelable) event.preventDefault();
    };
    content.addEventListener('touchmove', holdScroll, { passive: false });
    return () => content.removeEventListener('touchmove', holdScroll);
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || drag.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if ((event.target as Element).closest(NOT_DRAGGABLE)) return;
    motion.measure();
    motion.x.stop();
    drag.current = { x: event.clientX, y: event.clientY, start: motion.x.get(), axis: null, pointerId: event.pointerId };
    motion.setTouching(event.pointerType === 'touch');
    tracker.reset();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.axis) {
      if (Math.hypot(dx, dy) < SLOP) return;
      current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (current.axis === 'y') {
        drag.current = null;
        motion.close();
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = '';
    }
    const value = limit(current.start + dx, motion.geometry.current);
    motion.x.set(value);
    tracker.add(value, event.timeStamp);
  };

  const release = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    motion.setTouching(false);
    if (current.axis !== 'x') {
      if (!cancelled && current.start !== 0) {
        swallowNextClick(event.currentTarget);
        motion.close();
      }
      return;
    }
    delete event.currentTarget.dataset.dragging;
    swallowNextClick(event.currentTarget);
    motion.release(cancelled ? 0 : tracker.velocity(event.timeStamp));
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => release(event, false),
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => release(event, true),
  };
}
