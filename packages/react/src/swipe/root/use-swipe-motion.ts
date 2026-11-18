import { type RefObject, useMemo, useRef, useState } from 'react';
import { clamp } from '../../gesture/projection';
import { type SpringInput, resolveSpring } from '../../spring/spring-config';
import { PIXEL_PRECISION, createSpringValue } from '../../spring/spring-value';
import { EMPTY_SWIPE_GEOMETRY, type SwipeSide, commitDistance, directionOf, measureSwipe, releaseOutcome, sideFor } from './geometry';

type Options = {
  rootRef: RefObject<HTMLLIElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  actionsRef: RefObject<Record<SwipeSide, HTMLDivElement | null>>;
  spring: SpringInput;
  reducedMotion: boolean;
  onOpen: () => void;
  onClose: () => void;
};

const FLY_PAST = 24;
const HOLD_LABEL = 0.94;
const HINT_DISTANCE = 28;

export function useSwipeMotion({ rootRef, contentRef, actionsRef, spring, reducedMotion, onOpen, onClose }: Options) {
  const config = useMemo(() => resolveSpring(spring), [spring]);
  const geometry = useRef(EMPTY_SWIPE_GEOMETRY);
  const armed = useRef(false);
  const touching = useRef(false);
  const live = useRef({ config, reducedMotion, onOpen, onClose });
  live.current = { config, reducedMotion, onOpen, onClose };

  const setArmed = (root: HTMLElement, next: boolean) => {
    if (next === armed.current) return;
    armed.current = next;
    if (next) root.dataset.armed = '';
    else delete root.dataset.armed;
    if (next && touching.current) navigator.vibrate?.(6);
  };

  const paint = (value: number) => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;
    const g = geometry.current;
    content.style.transform = value === 0 ? '' : `translate3d(${value}px, 0, 0)`;
    const towardStart = value < 0 === geometry.current.ltr;
    content.style.setProperty('--halo-swipe-hold', towardStart ? `${-value * HOLD_LABEL}px` : '0px');
    if (value === 0) {
      delete root.dataset.showing;
      root.style.setProperty('--halo-swipe-reveal', '0');
      root.style.setProperty('--halo-swipe-arm', '0');
      setArmed(root, false);
      return;
    }
    const side = sideFor(value, g.ltr);
    const width = g[side];
    const distance = Math.abs(value);
    const commitAt = commitDistance(g, side);
    root.dataset.showing = side;
    root.dataset.lead = value < 0 ? 'right' : 'left';
    root.style.setProperty('--halo-swipe-reveal', String(width ? clamp(distance / width, 0, 1) : 0));
    root.style.setProperty('--halo-swipe-arm', String(commitAt === null ? 0 : clamp((distance - width) / (commitAt - width), 0, 1)));
    setArmed(root, commitAt !== null && distance >= commitAt);
  };

  const [x] = useState(() => createSpringValue(0, config, paint, PIXEL_PRECISION));

  const measure = () => {
    if (rootRef.current) geometry.current = measureSwipe(rootRef.current, actionsRef.current);
  };

  const go = (target: number, velocity = 0) => {
    if (live.current.reducedMotion) {
      x.set(target);
      return Promise.resolve();
    }
    return x.to(target, { velocity, config: live.current.config });
  };

  const open = (side: SwipeSide, velocity = 0) => {
    measure();
    const width = geometry.current[side];
    if (width === 0) return;
    live.current.onOpen();
    go(directionOf(side, geometry.current.ltr) * width, velocity);
  };

  const close = (velocity = 0) => {
    if (x.get() === 0 && !x.isAnimating()) return;
    live.current.onClose();
    go(0, velocity);
  };

  const commit = (side: SwipeSide, velocity: number) => {
    const button = actionsRef.current[side]?.querySelector<HTMLButtonElement>('[data-commit]');
    const away = directionOf(side, geometry.current.ltr) * (geometry.current.row + FLY_PAST);
    go(away, velocity).then(() => button?.click());
  };

  const release = (velocity: number) => {
    const outcome = releaseOutcome(x.get(), velocity, geometry.current);
    if (outcome.kind === 'commit') commit(outcome.side, velocity);
    else if (outcome.kind === 'open') open(outcome.side, velocity);
    else close(velocity);
  };

  const hint = () => {
    measure();
    const side: SwipeSide | null = geometry.current.end > 0 ? 'end' : geometry.current.start > 0 ? 'start' : null;
    if (!side || live.current.reducedMotion) return;
    const peek = directionOf(side, geometry.current.ltr) * Math.min(HINT_DISTANCE, geometry.current[side] * 0.4);
    go(peek).then(() => go(0));
  };

  return useMemo(
    () => ({
      x,
      geometry,
      measure,
      open,
      close,
      release,
      hint,
      setTouching: (value: boolean) => {
        touching.current = value;
      },
      isOpen: () => x.get() !== 0,
    }),
    [],
  );
}

export type SwipeMotion = ReturnType<typeof useSwipeMotion>;
