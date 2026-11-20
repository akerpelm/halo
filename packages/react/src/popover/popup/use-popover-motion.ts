import { type RefObject, useMemo, useRef, useState } from 'react';
import { clamp } from '../../gesture/projection';
import { type SpringInput, resolveSpring } from '../../spring/spring-config';
import { createSpringValue } from '../../spring/spring-value';
import { growFrom } from './placement';
import type { Boxes } from './use-popover-placement';

const PROGRESS_PRECISION = { restDelta: 0.002, restSpeed: 0.05 };
const REVEAL_FROM = 0.35;
const EXIT_TO = 0.35;
const EXIT_MS = 220;
const EXIT = `opacity 200ms cubic-bezier(0.4, 0, 1, 1), transform ${EXIT_MS}ms cubic-bezier(0.4, 0, 0.6, 1), display ${EXIT_MS}ms allow-discrete, overlay ${EXIT_MS}ms allow-discrete`;

/**
 * The popup grows out of its trigger's box on a spring, its contents fading in once the glass is mostly open,
 * and shrinks back toward the trigger as it closes. Under reduced motion, CSS fades it instead.
 */
export function usePopoverMotion(popupRef: RefObject<HTMLDivElement | null>, spring: SpringInput, reducedMotion: boolean) {
  const config = useMemo(() => resolveSpring(spring), [spring]);
  const boxes = useRef<Boxes | null>(null);
  const live = useRef({ config, reducedMotion });
  live.current = { config, reducedMotion };

  const [progress] = useState(() =>
    createSpringValue(
      0,
      config,
      (p) => {
        const popup = popupRef.current;
        if (!popup || !boxes.current) return;
        popup.style.transform = growFrom(boxes.current.trigger, boxes.current.popup, p);
        popup.style.opacity = String(clamp(p * 2.5, 0, 1));
        popup.style.setProperty('--halo-popover-reveal', String(clamp((p - REVEAL_FROM) / 0.5, 0, 1)));
      },
      PROGRESS_PRECISION,
    ),
  );

  return useMemo(
    () => ({
      isMoving: () => progress.isAnimating(),
      /** Before the browser shows it: clear the last exit and keep it invisible until it is measured. */
      prepare() {
        const popup = popupRef.current;
        if (!popup) return;
        popup.style.transition = live.current.reducedMotion ? '' : 'none';
        popup.style.transform = '';
        popup.style.removeProperty('--halo-popover-reveal');
        popup.style.opacity = live.current.reducedMotion ? '' : '0';
      },
      enter(measured: Boxes | null) {
        if (live.current.reducedMotion || !measured) return;
        boxes.current = measured;
        progress.set(0);
        progress.to(1, { config: live.current.config });
      },
      exit(measured: Boxes | null) {
        const popup = popupRef.current;
        const midEntrance = progress.isAnimating();
        progress.stop();
        if (!popup || live.current.reducedMotion) return;
        if (measured && !midEntrance) boxes.current = measured;
        popup.style.transition = EXIT;
        popup.style.opacity = '0';
        if (boxes.current) popup.style.transform = growFrom(boxes.current.trigger, boxes.current.popup, EXIT_TO);
      },
    }),
    [],
  );
}

export type PopoverMotion = ReturnType<typeof usePopoverMotion>;
