import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useSwipeRootContext } from '../root/swipe-root-context';
import { useSwipeDrag } from './use-swipe-drag';

/** The glass that slides. Whatever it passes over is blurred by it, so the actions come into focus as it moves away. */
export function SwipeContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { contentRef, motion, disabled } = useSwipeRootContext('Content');
  const handlers = useSwipeDrag(contentRef, motion, disabled);
  return <div ref={contentRef} className={cx('halo-swipe-content', 'halo-surface', className)} {...props} {...handlers} />;
}
