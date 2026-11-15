import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

/** A scroll area that scrolls until it reaches its start, then hands the same gesture to the drawer. */
export function DrawerScroll({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('halo-drawer-scroll', className)} {...props} />;
}
