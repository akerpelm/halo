import type { ButtonHTMLAttributes } from 'react';
import { useDrawerRootContext } from '../root/drawer-root-context';

export function DrawerTrigger({ onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useDrawerRootContext('Trigger');
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
    />
  );
}
