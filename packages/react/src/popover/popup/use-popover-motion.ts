import { type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { clamp } from '../../gesture/projection';
import { type SpringInput, resolveSpring } from '../../spring/spring-config';
import { createSpringValue } from '../../spring/spring-value';
import { type PopoverAlign, type PopoverSide, attachPoint, fallbackPosition, growFrom, sideOf, supportsAnchorPositioning } from './placement';

type Box = { left: number; top: number; width: number; height: number };

type Options = {
  popupRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
  side: PopoverSide;
  align: PopoverAlign;
  offset: number;
  spring: SpringInput;
  reducedMotion: boolean;
};

const PROGRESS_PRECISION = { restDelta: 0.002, restSpeed: 0.05 };
const EXIT_AT = 0.6;
const EXIT = 'opacity 150ms ease-in, transform 180ms cubic-bezier(0.4, 0, 1, 1), display 180ms allow-discrete, overlay 180ms allow-discrete';

const box = (rect: DOMRect): Box => ({ left: rect.left, top: rect.top, width: rect.width || 1, height: rect.height || 1 });

export function wireInvoker(trigger: HTMLButtonElement | null, popup: HTMLDivElement | null) {
  if (trigger && popup && 'popoverTargetElement' in trigger) trigger.popoverTargetElement = popup;
}

export function usePopoverMotion({ popupRef, triggerRef, open, setOpen, side, align, offset, spring, reducedMotion }: Options) {
  const shown = useRef(false);
  const boxes = useRef<{ trigger: Box; popup: Box } | null>(null);
  const live = useRef({ open, side, align, offset, reducedMotion });
  live.current = { open, side, align, offset, reducedMotion };
  const config = useMemo(() => resolveSpring(spring), [spring]);

  const [progress] = useState(() =>
    createSpringValue(
      0,
      config,
      (p) => {
        const el = popupRef.current;
        const measured = boxes.current;
        if (!el || !measured) return;
        el.style.transform = growFrom(measured.trigger, measured.popup, p);
        el.style.opacity = String(clamp(p * 2.5, 0, 1));
        el.style.setProperty('--halo-popover-reveal', String(clamp((p - 0.35) / 0.5, 0, 1)));
      },
      PROGRESS_PRECISION,
    ),
  );

  const place = () => {
    const el = popupRef.current;
    const trigger = triggerRef.current;
    if (!el || !trigger) return;
    const { side: preferred, align: alignment, offset: gap } = live.current;
    const triggerBox = box(trigger.getBoundingClientRect());
    let landed: PopoverSide | null = null;
    if (!supportsAnchorPositioning()) {
      const spot = fallbackPosition(triggerBox, { width: el.offsetWidth, height: el.offsetHeight }, preferred, alignment, gap, {
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      });
      el.style.top = `${spot.top}px`;
      el.style.left = `${spot.left}px`;
      el.dataset.fallback = '';
      landed = spot.side;
    }
    const popupBox = box(el.getBoundingClientRect());
    const finalSide = landed ?? sideOf(triggerBox, popupBox);
    const attach = attachPoint(triggerBox, popupBox, finalSide);
    el.dataset.side = finalSide;
    el.style.setProperty('--halo-attach-x', `${attach.x}%`);
    el.style.setProperty('--halo-attach-y', `${attach.y}%`);
    boxes.current = { trigger: triggerBox, popup: popupBox };
  };

  const focusInside = (el: HTMLElement) => {
    const preferred = el.querySelector<HTMLElement>('[autofocus], [data-autofocus]');
    (preferred ?? el).focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    const el = popupRef.current;
    if (!el) return;

    const onBeforeToggle = (event: Event) => {
      const opening = (event as ToggleEvent).newState === 'open';
      shown.current = opening;
      if (opening) {
        el.style.transition = 'none';
        el.style.transform = '';
        el.style.opacity = live.current.reducedMotion ? '' : '0';
        return;
      }
      progress.stop();
      if (live.current.reducedMotion) return;
      el.style.transition = EXIT;
      el.style.opacity = '0';
      if (boxes.current) el.style.transform = growFrom(boxes.current.trigger, boxes.current.popup, EXIT_AT);
    };

    const onToggle = (event: Event) => {
      const opened = (event as ToggleEvent).newState === 'open';
      if (opened !== live.current.open) setOpen(opened);
      if (!opened) return;
      place();
      if (!live.current.reducedMotion) {
        progress.set(0);
        progress.to(1, { config });
      }
      focusInside(el);
    };

    el.addEventListener('beforetoggle', onBeforeToggle);
    el.addEventListener('toggle', onToggle);
    return () => {
      el.removeEventListener('beforetoggle', onBeforeToggle);
      el.removeEventListener('toggle', onToggle);
    };
  }, [config]);

  useLayoutEffect(() => {
    const el = popupRef.current;
    if (!el || open === shown.current) return;
    try {
      if (open) el.showPopover();
      else el.hidePopover();
    } catch {
      shown.current = open;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const follow = () => {
      if (progress.isAnimating()) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    window.addEventListener('resize', follow);
    window.addEventListener('scroll', follow, { capture: true, passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', follow);
      window.removeEventListener('scroll', follow, { capture: true });
    };
  }, [open]);
}
