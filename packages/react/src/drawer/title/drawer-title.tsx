import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useDrawerRootContext } from '../root/drawer-root-context';

export function DrawerTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDrawerRootContext('Title');
  return <h2 id={titleId} className={cx('halo-drawer-title', className)} {...props} />;
}
