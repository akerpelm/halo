import type { ButtonHTMLAttributes } from 'react';
import { usePopoverRootContext } from '../root/popover-root-context';

export function PopoverClose({ onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = usePopoverRootContext('Close');
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    />
  );
}
