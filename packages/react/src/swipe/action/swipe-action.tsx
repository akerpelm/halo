import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useSwipeRootContext } from '../root/swipe-root-context';

export type SwipeActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** A full swipe runs this action. One per side. A full swipe clicks this same button, so both paths run your `onClick`. */
  commit?: boolean;
  /** Read out by screen readers after the action runs, e.g. "Invoice 42 archived". Needs a `<Swipe.Group>`. */
  announce?: string;
};

/** A real button: reachable by Tab, which slides the row open so it can be seen. Name the item in its label, e.g. "Archive invoice 42". */
export function SwipeAction({ commit = false, announce, className, onClick, ...props }: SwipeActionProps) {
  const root = useSwipeRootContext('Action');
  return (
    <button
      type="button"
      className={cx('halo-swipe-action', className)}
      data-commit={commit ? '' : undefined}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (announce) root.announce(announce);
        root.motion.close();
      }}
    />
  );
}
