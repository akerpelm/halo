export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

type Box = { left: number; top: number; width: number; height: number };

const OPPOSITE: Record<PopoverSide, PopoverSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const EDGE_MARGIN = 8;

export const supportsAnchorPositioning = () => typeof CSS !== 'undefined' && CSS.supports('position-anchor', '--halo');

/** Which side of the trigger the popup ended up on, after any flip: the side with the clear gap between them. */
export function sideOf(trigger: Box, popup: Box): PopoverSide {
  const gaps: Record<PopoverSide, number> = {
    bottom: popup.top - (trigger.top + trigger.height),
    top: trigger.top - (popup.top + popup.height),
    right: popup.left - (trigger.left + trigger.width),
    left: trigger.left - (popup.left + popup.width),
  };
  return (Object.keys(gaps) as PopoverSide[]).reduce((best, side) => (gaps[side] > gaps[best] ? side : best), 'bottom');
}

/** Whether the trigger has scrolled out of view or is covered, e.g. by a sticky header, at its centre. */
export function isDetached(trigger: Element, popup: Element): boolean {
  const rect = trigger.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return true;
  const top = document.elementFromPoint?.(x, y);
  if (!top) return false;
  return !trigger.contains(top) && !popup.contains(top);
}

/** Whether someone is typing in the popup, where an on-screen keyboard can scroll the trigger away. */
export function isEditingInside(popup: Element): boolean {
  const active = document.activeElement;
  return active !== null && popup.contains(active) && active.matches('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
}

/** Where the trigger meets the popup's edge, in % of the popup box, so the edge light can gather there. */
export function attachPoint(trigger: Box, popup: Box, side: PopoverSide): { x: number; y: number } {
  const along = (start: number, size: number, center: number) => Math.min(Math.max(((center - start) / size) * 100, 8), 92);
  if (side === 'top' || side === 'bottom') {
    return { x: along(popup.left, popup.width, trigger.left + trigger.width / 2), y: side === 'bottom' ? 0 : 100 };
  }
  return { x: side === 'right' ? 0 : 100, y: along(popup.top, popup.height, trigger.top + trigger.height / 2) };
}

/** A transform, with origin at the popup's top left, that lays the popup over the trigger at progress 0 and leaves it in place at 1. */
export function growFrom(trigger: Box, popup: Box, progress: number): string {
  const rest = 1 - progress;
  const scaleX = trigger.width / popup.width + (1 - trigger.width / popup.width) * progress;
  const scaleY = trigger.height / popup.height + (1 - trigger.height / popup.height) * progress;
  return `translate(${(trigger.left - popup.left) * rest}px, ${(trigger.top - popup.top) * rest}px) scale(${scaleX}, ${scaleY})`;
}

function placeOn(side: PopoverSide, align: PopoverAlign, trigger: Box, size: { width: number; height: number }, gap: number) {
  const vertical = side === 'top' || side === 'bottom';
  const cross = (start: number, length: number, own: number) => {
    if (align === 'start') return start;
    if (align === 'end') return start + length - own;
    return start + length / 2 - own / 2;
  };
  if (vertical) {
    const top = side === 'bottom' ? trigger.top + trigger.height + gap : trigger.top - gap - size.height;
    return { top, left: cross(trigger.left, trigger.width, size.width) };
  }
  const left = side === 'right' ? trigger.left + trigger.width + gap : trigger.left - gap - size.width;
  return { left, top: cross(trigger.top, trigger.height, size.height) };
}

const fits = (spot: { top: number; left: number }, size: { width: number; height: number }, viewport: { width: number; height: number }) =>
  spot.top >= 0 && spot.left >= 0 && spot.top + size.height <= viewport.height && spot.left + size.width <= viewport.width;

/** Placement for browsers without CSS anchor positioning: the preferred side, flipped if it overflows, then kept on screen. */
export function fallbackPosition(
  trigger: Box,
  size: { width: number; height: number },
  side: PopoverSide,
  align: PopoverAlign,
  gap: number,
  viewport: { width: number; height: number },
): { top: number; left: number; side: PopoverSide } {
  const preferred = placeOn(side, align, trigger, size, gap);
  const flipped = placeOn(OPPOSITE[side], align, trigger, size, gap);
  const useFlip = !fits(preferred, size, viewport) && fits(flipped, size, viewport);
  const spot = useFlip ? flipped : preferred;
  const keep = (value: number, own: number, room: number) => Math.min(Math.max(value, EDGE_MARGIN), Math.max(room - own - EDGE_MARGIN, EDGE_MARGIN));
  return {
    top: keep(spot.top, size.height, viewport.height),
    left: keep(spot.left, size.width, viewport.width),
    side: useFlip ? OPPOSITE[side] : side,
  };
}
