import type { HTMLAttributes, PointerEvent } from 'react';
import { cx } from '../../utils/cx';
import { useSwipeRootContext } from '../root/swipe-root-context';
import { useSwipeDrag } from './use-swipe-drag';

type PointerHandler = (event: PointerEvent<HTMLDivElement>) => void;

const both = (own: PointerHandler, theirs: PointerHandler | undefined): PointerHandler => (event) => {
  theirs?.(event);
  own(event);
};

/** The glass that slides. Whatever it passes over is blurred by it, so the actions come into focus as it moves away. */
export function SwipeContent({ className, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { contentRef, motion, disabled } = useSwipeRootContext('Content');
  const drag = useSwipeDrag(contentRef, motion, disabled);
  return (
    <div
      ref={contentRef}
      tabIndex={-1}
      className={cx('halo-swipe-content', 'halo-surface', className)}
      {...props}
      onPointerDown={both(drag.onPointerDown, onPointerDown)}
      onPointerMove={both(drag.onPointerMove, onPointerMove)}
      onPointerUp={both(drag.onPointerUp, onPointerUp)}
      onPointerCancel={both(drag.onPointerCancel, onPointerCancel)}
    />
  );
}
