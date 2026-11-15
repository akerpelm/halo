import { type RefObject, useRef, useState } from 'react';
import { type SpringConfig, resolveSpring } from '../../spring/spring-config';
import { PIXEL_PRECISION, type SpringValue, createSpringValue } from '../../spring/spring-value';
import type { StackEdge } from '../toaster/toaster-context';
import type { ToastMotion } from '../types';
import { revealStyle, unit } from './reveal-style';

export type ToastSize = { width: number; height: number };

export type ToastSprings = Record<'x' | 'y' | 'dy' | 'scale' | 'opacity' | 'reveal', SpringValue>;

const FADE = resolveSpring('smooth');
const PIXEL_KEYS = new Set(['x', 'y', 'dy']);

type Options = {
  ref: RefObject<HTMLLIElement | null>;
  size: RefObject<ToastSize>;
  config: SpringConfig;
  reducedMotion: boolean;
  motion: ToastMotion;
  edge: StackEdge;
};

export function useToastMotion({ ref, size, config, reducedMotion, motion, edge }: Options) {
  const look = useRef({ motion, edge });
  look.current = { motion: reducedMotion ? 'fade' : motion, edge };

  const [springs] = useState<ToastSprings>(() => {
    const state = { x: 0, y: 0, dy: 0, scale: 1, opacity: 1, reveal: 0 };
    const render = () => {
      const el = ref.current;
      if (!el) return;
      const reveal = revealStyle(look.current.motion, state.reveal, look.current.edge);
      el.style.transform = `translate3d(${state.x}px, ${state.y + state.dy}px, 0) scale(${state.scale}) ${reveal.transform}`;
      el.style.opacity = String(unit(state.opacity) * reveal.opacity);
      el.style.filter = reveal.filter;
      el.style.clipPath = reveal.clip;
      el.style.setProperty('--halo-shift', (state.x / (size.current.width || 1)).toFixed(3));
    };
    const spring = (key: keyof typeof state) =>
      createSpringValue(
        state[key],
        config,
        (next) => {
          state[key] = next;
          render();
        },
        PIXEL_KEYS.has(key) ? PIXEL_PRECISION : undefined,
      );
    return { x: spring('x'), y: spring('y'), dy: spring('dy'), scale: spring('scale'), opacity: spring('opacity'), reveal: spring('reveal') };
  });

  const go = (spring: SpringValue, target: number, velocity?: number) => {
    if (!reducedMotion) return spring.to(target, { config, velocity });
    spring.set(target);
    return Promise.resolve();
  };

  const fade = (target: number) => (reducedMotion ? springs.opacity.to(target, { config: FADE }) : go(springs.opacity, target));

  return { springs, go, fade };
}
