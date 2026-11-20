import { type RefObject, createContext, useContext } from 'react';
import type { SwipeSide } from './geometry';
import type { SwipeMotion } from './use-swipe-motion';

export type SwipeRootContextValue = {
  contentRef: RefObject<HTMLDivElement | null>;
  motion: SwipeMotion;
  registerActions: (side: SwipeSide, element: HTMLDivElement | null) => void;
  announce: (message: string) => void;
  /** Close the row, moving focus from a hidden action onto the row so it stays visible. */
  dismiss: () => void;
  disabled: boolean;
};

export const SwipeRootContext = createContext<SwipeRootContextValue | null>(null);

export function useSwipeRootContext(part: string): SwipeRootContextValue {
  const context = useContext(SwipeRootContext);
  if (!context) throw new Error(`<Swipe.${part}> must be rendered inside <Swipe.Root>.`);
  return context;
}
