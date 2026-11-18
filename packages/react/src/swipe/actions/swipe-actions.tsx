import { type HTMLAttributes, useCallback } from 'react';
import { cx } from '../../utils/cx';
import type { SwipeSide } from '../root/geometry';
import { useSwipeRootContext } from '../root/swipe-root-context';

export type SwipeActionsProps = HTMLAttributes<HTMLDivElement> & {
  /** Which edge the actions sit under. `end` is uncovered by swiping toward the start (left, in left-to-right text). */
  side?: SwipeSide;
};

export function SwipeActions({ side = 'end', className, ...props }: SwipeActionsProps) {
  const { registerActions } = useSwipeRootContext('Actions');
  const ref = useCallback((element: HTMLDivElement | null) => registerActions(side, element), [side, registerActions]);
  return <div ref={ref} className={cx('halo-swipe-actions', className)} data-side={side} {...props} />;
}
