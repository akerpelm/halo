import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useDrawerRootContext } from '../root/drawer-root-context';

export function DrawerDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDrawerRootContext('Description');
  return <p id={descriptionId} className={cx('halo-drawer-description', className)} {...props} />;
}
