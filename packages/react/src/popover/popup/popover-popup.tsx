import { type CSSProperties, type HTMLAttributes, useLayoutEffect } from 'react';
import { radiusStyle } from '../../utils/appearance';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../utils/use-media-query';
import { usePopoverRootContext } from '../root/popover-root-context';
import { wireInvoker } from './invoker';
import { usePopoverMotion } from './use-popover-motion';
import { usePopoverPlacement } from './use-popover-placement';
import { usePopoverState } from './use-popover-state';

export type PopoverPopupProps = HTMLAttributes<HTMLDivElement>;

/**
 * The popover itself: a non-modal dialog in the top layer, placed against its trigger with CSS anchor positioning.
 * Focus moves into it on open (to an element marked `autofocus` or `data-autofocus`, otherwise the popup) and back to the trigger on close.
 */
export function PopoverPopup({ children, className, style, ...props }: PopoverPopupProps) {
  const root = usePopoverRootContext('Popup');
  const { popupRef, triggerRef, open, setOpen } = root;
  const reducedMotion = useReducedMotion();

  const motion = usePopoverMotion(popupRef, root.spring, reducedMotion);

  const placement = usePopoverPlacement({
    popupRef,
    triggerRef,
    open,
    side: root.side,
    align: root.align,
    offset: root.offset,
    isMoving: motion.isMoving,
    onDetach: () => {
      if (popupRef.current?.contains(document.activeElement)) triggerRef.current?.focus({ preventScroll: true });
      setOpen(false);
    },
  });

  usePopoverState({
    popupRef,
    open,
    setOpen,
    onOpening: motion.prepare,
    onOpened: () => motion.enter(placement.place()),
    onClosing: () => motion.exit(placement.measure()),
  });

  useLayoutEffect(() => wireInvoker(triggerRef.current, popupRef.current));

  return (
    <div
      tabIndex={-1}
      aria-labelledby={root.titleId}
      aria-describedby={root.descriptionId}
      className={cx('halo', 'halo-popover', 'halo-surface', className)}
      data-halo-world={root.world}
      data-theme={root.theme}
      data-density={root.density}
      data-placement={root.side}
      data-align={root.align}
      style={
        {
          '--halo-anchor': root.anchorName,
          '--halo-popover-gap': `${root.offset}px`,
          ...radiusStyle('--halo-radius', root.radius),
          ...style,
        } as CSSProperties
      }
      {...props}
      ref={popupRef}
      id={root.popupId}
      popover="auto"
      role="dialog"
    >
      <div className="halo-popover-body">{children}</div>
    </div>
  );
}
