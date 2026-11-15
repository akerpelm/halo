import { type RefObject, useState } from 'react';
import { clamp } from '../../gesture/projection';
import type { SpringConfig } from '../../spring/spring-config';
import { PIXEL_PRECISION, createSpringValue } from '../../spring/spring-value';
import { type DrawerGeometry, isVertical } from '../utils/geometry';
import type { RecessState } from './use-recess';

type Options = {
  panelRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  geometry: RefObject<DrawerGeometry>;
  state: RecessState;
  config: SpringConfig;
  onProgress: (progress: number) => void;
};

export function useDrawerExtent({ panelRef, overlayRef, geometry, state, config, onProgress }: Options) {
  const [extent] = useState(() =>
    createSpringValue(
      0,
      config,
      (value) => {
        const panel = panelRef.current;
        if (!panel) return;
        const { size, firstSnap } = geometry.current;
        const { side } = state.current;
        const sign = side === 'bottom' || side === 'right' ? 1 : -1;
        panel.style.transform = `translate${isVertical(side) ? 'Y' : 'X'}(${sign * (size - value)}px)`;
        const progress = clamp(firstSnap > 0 ? value / firstSnap : 0, 0, 1);
        if (overlayRef.current) overlayRef.current.style.opacity = String(progress);
        onProgress(progress);
      },
      PIXEL_PRECISION,
    ),
  );

  const go = (target: number, velocity = 0) => {
    if (!state.current.reducedMotion) return extent.to(target, { config, velocity });
    extent.set(target);
    return Promise.resolve();
  };

  return { extent, go };
}
