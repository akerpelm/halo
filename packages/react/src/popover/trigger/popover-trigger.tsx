import { type ButtonHTMLAttributes, type CSSProperties, useLayoutEffect } from 'react';
import { wireInvoker } from '../popup/invoker';
import { usePopoverRootContext } from '../root/popover-root-context';

/** A button wired to the popover as its native invoker, so the browser handles Esc, outside clicks and focus return. */
export function PopoverTrigger({ style, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, popupId, anchorName, triggerRef, popupRef } = usePopoverRootContext('Trigger');

  useLayoutEffect(() => wireInvoker(triggerRef.current, popupRef.current));

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={popupId}
      style={{ anchorName, ...style } as CSSProperties}
      {...props}
    />
  );
}
