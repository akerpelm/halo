import { type RefObject, useEffect, useRef } from 'react';
import { type PopoverAlign, type PopoverSide, attachPoint, fallbackPosition, isDetached, sideOf, supportsAnchorPositioning } from './placement';

export type Box = { left: number; top: number; width: number; height: number };
export type Boxes = { trigger: Box; popup: Box };

type Options = {
  popupRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  open: boolean;
  side: PopoverSide;
  align: PopoverAlign;
  offset: number;
  /** While the popup is mid-entrance its box is transformed, so measuring would be wrong. */
  isMoving: () => boolean;
  onDetach: () => void;
};

const box = (rect: DOMRect): Box => ({ left: rect.left, top: rect.top, width: rect.width || 1, height: rect.height || 1 });

/**
 * Where the popup sits. CSS anchor positioning places it; this reads back the side it landed on and where the
 * trigger meets its edge (for the edge light), places it by hand where anchor positioning is missing, and
 * closes it once the trigger scrolls away or is covered, e.g. by a sticky header.
 */
export function usePopoverPlacement({ popupRef, triggerRef, open, side, align, offset, isMoving, onDetach }: Options) {
  const live = useRef({ side, align, offset, isMoving, onDetach });
  live.current = { side, align, offset, isMoving, onDetach };

  const measure = (): Boxes | null => {
    const popup = popupRef.current;
    const trigger = triggerRef.current;
    if (!popup || !trigger) return null;
    return { trigger: box(trigger.getBoundingClientRect()), popup: box(popup.getBoundingClientRect()) };
  };

  const place = (): Boxes | null => {
    const popup = popupRef.current;
    const trigger = triggerRef.current;
    if (!popup || !trigger) return null;
    let landed: PopoverSide | null = null;
    if (!supportsAnchorPositioning()) {
      const spot = fallbackPosition(
        box(trigger.getBoundingClientRect()),
        { width: popup.offsetWidth, height: popup.offsetHeight },
        live.current.side,
        live.current.align,
        live.current.offset,
        { width: document.documentElement.clientWidth, height: window.innerHeight },
      );
      popup.style.top = `${spot.top}px`;
      popup.style.left = `${spot.left}px`;
      landed = spot.side;
    }
    const boxes = measure();
    if (!boxes) return null;
    const finalSide = landed ?? sideOf(boxes.trigger, boxes.popup);
    const attach = attachPoint(boxes.trigger, boxes.popup, finalSide);
    popup.dataset.side = finalSide;
    popup.style.setProperty('--halo-attach-x', `${attach.x}%`);
    popup.style.setProperty('--halo-attach-y', `${attach.y}%`);
    return boxes;
  };

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const popup = popupRef.current;
        const trigger = triggerRef.current;
        if (!popup || !trigger) return;
        if (isDetached(trigger, popup)) live.current.onDetach();
        else if (!live.current.isMoving()) place();
      });
    };
    window.addEventListener('resize', follow);
    window.addEventListener('scroll', follow, { capture: true, passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', follow);
      window.removeEventListener('scroll', follow, { capture: true });
    };
  }, [open]);

  return { place, measure };
}
