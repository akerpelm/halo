import { type LiHTMLAttributes, useCallback, useEffect, useMemo, useRef } from 'react';
import type { SpringInput } from '../../spring/spring-config';
import { type HaloDensity, type HaloRadius, type HaloTheme, type HaloWorldName, radiusStyle } from '../../utils/appearance';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../utils/use-media-query';
import { useSwipeGroupContext } from '../group/swipe-group-context';
import type { SwipeSide } from './geometry';
import { SwipeRootContext, type SwipeRootContextValue } from './swipe-root-context';
import { type SwipeMotion, useSwipeMotion } from './use-swipe-motion';

export type SwipeRootProps = LiHTMLAttributes<HTMLLIElement> & {
  /** Turns off the gesture. The actions stay reachable by keyboard. */
  disabled?: boolean;
  spring?: SpringInput;
  /** Appearance, when the row is not inside a `<Swipe.Group>`. */
  world?: HaloWorldName;
  theme?: HaloTheme;
  density?: HaloDensity;
  radius?: HaloRadius;
};

export const SWIPE_HINT_EVENT = 'halo-swipe-hint';

const DEFAULT_SPRING = { duration: 0.36, bounce: 0.12 };

/** One row. Render it inside `<Swipe.Group>`, or your own `<ul>`. */
export function SwipeRoot({
  children,
  className,
  disabled = false,
  spring = DEFAULT_SPRING,
  world = 'dichroic',
  theme = 'system',
  density = 'comfortable',
  radius,
  style,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: SwipeRootProps) {
  const group = useSwipeGroupContext();
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLLIElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<Record<SwipeSide, HTMLDivElement | null>>({ start: null, end: null });
  const motionRef = useRef<SwipeMotion | null>(null);
  const outsideListener = useRef<((event: PointerEvent) => void) | null>(null);
  const closeRow = useCallback(() => motionRef.current?.close(), []);

  const stopListening = () => {
    if (outsideListener.current) document.removeEventListener('pointerdown', outsideListener.current, true);
    outsideListener.current = null;
  };

  const motion = useSwipeMotion({
    rootRef,
    contentRef,
    actionsRef,
    spring,
    reducedMotion,
    onOpen: () => {
      group?.claim(closeRow);
      if (outsideListener.current) return;
      outsideListener.current = (event) => {
        if (!rootRef.current?.contains(event.target as Node)) closeRow();
      };
      document.addEventListener('pointerdown', outsideListener.current, true);
    },
    onClose: stopListening,
  });
  motionRef.current = motion;

  useEffect(() => {
    const root = rootRef.current;
    const onHint = () => motionRef.current?.hint();
    root?.addEventListener(SWIPE_HINT_EVENT, onHint);
    return () => {
      root?.removeEventListener(SWIPE_HINT_EVENT, onHint);
      stopListening();
    };
  }, []);

  const value = useMemo<SwipeRootContextValue>(
    () => ({
      contentRef,
      motion,
      disabled,
      announce: (message) => group?.announce(message),
      registerActions: (side, element) => {
        actionsRef.current[side] = element;
      },
    }),
    [motion, disabled, group],
  );

  const standalone = group === null;

  return (
    <li
      ref={rootRef}
      className={cx('halo-swipe', standalone && 'halo', className)}
      data-halo-world={standalone ? world : undefined}
      data-theme={standalone ? theme : undefined}
      data-density={standalone ? density : undefined}
      data-disabled={disabled ? '' : undefined}
      style={{ ...(standalone ? radiusStyle('--halo-radius', radius) : {}), ...style }}
      {...props}
      onFocus={(event) => {
        onFocus?.(event);
        const actions = (event.target as Element).closest<HTMLElement>('.halo-swipe-actions');
        const side = actions?.dataset.side;
        if (side === 'start' || side === 'end') motion.open(side);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) motion.close();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key !== 'Escape' || !motion.isOpen()) return;
        event.stopPropagation();
        motion.close();
      }}
    >
      <SwipeRootContext.Provider value={value}>{children}</SwipeRootContext.Provider>
    </li>
  );
}
