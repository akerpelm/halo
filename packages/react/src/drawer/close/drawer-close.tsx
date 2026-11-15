import type { ButtonHTMLAttributes } from 'react';
import { useDrawerRootContext } from '../root/drawer-root-context';

export function DrawerClose({ onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDrawerRootContext('Close');
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
