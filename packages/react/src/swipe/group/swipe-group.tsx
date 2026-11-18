import { type HTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import type { HaloDensity, HaloRadius, HaloTheme, HaloWorldName } from '../../utils/appearance';
import { radiusStyle } from '../../utils/appearance';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../utils/use-media-query';
import { SWIPE_HINT_EVENT } from '../root/swipe-root';
import { SwipeGroupContext, type SwipeGroupContextValue } from './swipe-group-context';
import { useGroupLayout } from './use-group-layout';

export type SwipeGroupProps = HTMLAttributes<HTMLUListElement> & {
  world?: HaloWorldName;
  theme?: HaloTheme;
  density?: HaloDensity;
  radius?: HaloRadius;
  /** Nudge the first row open a little, once, when the list first scrolls into view, so people learn it swipes. */
  hint?: boolean;
  /** When false, a swipe always stops with the actions showing, and the commit action needs a tap. Rows can override it. */
  fullSwipe?: boolean;
};

/**
 * A list of swipeable rows. Only one row is open at a time, rows close the gap a removed row leaves
 * on a spring, focus moves on when a focused row is removed, and each action's `announce` is read out.
 */
export function SwipeGroup({ children, className, world = 'dichroic', theme = 'system', density = 'comfortable', radius, hint = false, fullSwipe = true, style, ...props }: SwipeGroupProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const openRow = useRef<(() => void) | null>(null);
  const [message, setMessage] = useState('');
  const reducedMotion = useReducedMotion();

  useGroupLayout(listRef, reducedMotion);

  useEffect(() => {
    const list = listRef.current;
    if (!hint || reducedMotion || !list || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        list.querySelector('.halo-swipe:not([data-disabled])')?.dispatchEvent(new CustomEvent(SWIPE_HINT_EVENT));
      },
      { threshold: 0.6 },
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, [hint, reducedMotion]);

  const value = useMemo<SwipeGroupContextValue>(
    () => ({
      fullSwipe,
      claim: (close) => {
        if (openRow.current !== close) openRow.current?.();
        openRow.current = close;
      },
      announce: (next) => setMessage((previous) => (previous === next ? `${next}\u00a0` : next)),
    }),
    [fullSwipe],
  );

  return (
    <>
      <ul
        ref={listRef}
        className={cx('halo', 'halo-swipe-group', className)}
        data-halo-world={world}
        data-theme={theme}
        data-density={density}
        style={{ ...radiusStyle('--halo-radius', radius), ...style }}
        {...props}
      >
        <SwipeGroupContext.Provider value={value}>{children}</SwipeGroupContext.Provider>
      </ul>
      <div role="status" className="halo-sr-only">
        {message}
      </div>
    </>
  );
}
