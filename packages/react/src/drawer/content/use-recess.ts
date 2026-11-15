import { type RefObject, useCallback, useState } from 'react';
import { fromDuration } from '../../spring/spring-config';
import { createSpringValue } from '../../spring/spring-value';
import type { RecessConfig } from '../root/drawer-root';
import { AWAY, type DrawerSide } from '../utils/geometry';

export type RecessState = RefObject<{ side: DrawerSide; recess: RecessConfig | null; reducedMotion: boolean }>;

const PAGE_SPRING = fromDuration(0.46, 0.32);
const DRIFT = 14;

function placePage(value: number, state: RecessState) {
  const page = document.querySelector<HTMLElement>('[data-halo-recess]');
  if (!page) return;
  if (Math.abs(value) <= 0.0005) {
    page.style.transform = '';
    page.style.transformOrigin = '';
    page.toggleAttribute('data-halo-recessed', false);
    return;
  }
  const { side, recess } = state.current;
  const away = AWAY[side];
  const depth = recess?.depth ?? 0.06;
  page.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`;
  page.style.transform = `translate3d(${away.x * value * DRIFT}px, ${away.y * value * DRIFT}px, 0) scale(${1 - depth * value})`;
  page.toggleAttribute('data-halo-recessed', true);
}

export function useRecess(state: RecessState) {
  const [page] = useState(() => createSpringValue(0, PAGE_SPRING, (value) => placePage(value, state)));

  return useCallback(
    (progress: number) => {
      const { recess, reducedMotion } = state.current;
      if (!recess) return;
      if (reducedMotion) page.set(progress);
      else page.to(progress, { config: fromDuration(0.46, recess.bounce) });
    },
    [page, state],
  );
}
