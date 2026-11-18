import { type CSSProperties, type HTMLAttributes, useLayoutEffect } from 'react';
import { radiusStyle } from '../../utils/appearance';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../utils/use-media-query';
import { usePopoverRootContext } from '../root/popover-root-context';
import { usePopoverMotion, wireInvoker } from './use-popover-motion';

export type PopoverPopupProps = HTMLAttributes<HTMLDivElement>;

/**
 * The popover itself: a non-modal dialog in the top layer, placed against its trigger with CSS anchor positioning.
 * Focus moves into it on open (to an element marked `autofocus` or `data-autofocus`, otherwise the popup) and back to the trigger on close.
 */
export function PopoverPopup({ children, className, style, ...props }: PopoverPopupProps) {
  const root = usePopoverRootContext('Popup');
  const { popupRef, triggerRef } = root;
  const reducedMotion = useReducedMotion();

  usePopoverMotion({ ...root, reducedMotion });

  useLayoutEffect(() => wireInvoker(triggerRef.current, popupRef.current));

  return (
    <div
      ref={popupRef}
      id={root.popupId}
      popover="auto"
      role="dialog"
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
    >
      <div className="halo-popover-body">{children}</div>
    </div>
  );
}
