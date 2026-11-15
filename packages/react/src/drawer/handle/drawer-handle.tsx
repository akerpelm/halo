import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useDrawerContentContext } from '../content/drawer-content-context';
import { useDrawerRootContext } from '../root/drawer-root-context';
import { type DrawerSide, isVertical } from '../utils/geometry';

const OPEN_KEY: Record<DrawerSide, string> = { bottom: 'ArrowUp', top: 'ArrowDown', left: 'ArrowRight', right: 'ArrowLeft' };
const CLOSE_KEY: Record<DrawerSide, string> = { bottom: 'ArrowDown', top: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight' };

/** The grabber. A real button: press it to cycle detents, or use the arrow keys to step. */
export function DrawerHandle({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { side, snapPoints } = useDrawerRootContext('Handle');
  const content = useDrawerContentContext();
  const multiple = (snapPoints?.length ?? 0) > 1;

  return (
    <button
      type="button"
      data-halo-handle=""
      className={cx('halo-drawer-handle', className)}
      aria-label={multiple ? 'Resize drawer. Press, or use the arrow keys.' : 'Drawer handle. Use the arrow keys to close.'}
      data-orientation={isVertical(side) ? 'horizontal' : 'vertical'}
      onClick={() => {
        if (content?.wasDragged.current || !multiple) return;
        content?.stepSnap(1);
      }}
      onKeyDown={(event) => {
        const direction = event.key === OPEN_KEY[side] ? 1 : event.key === CLOSE_KEY[side] ? -1 : 0;
        if (direction === 0) return;
        event.preventDefault();
        content?.stepSnap(direction);
      }}
      {...props}
    >
      <span aria-hidden className="halo-drawer-grabber" />
    </button>
  );
}
