import { type HTMLAttributes, useId, useLayoutEffect } from 'react';
import { cx } from '../../utils/cx';
import { usePopoverRootContext } from '../root/popover-root-context';

/** Names the popover for screen readers. Without one, give `<Popover.Popup>` an `aria-label`. */
export function PopoverTitle({ id, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { setTitleId } = usePopoverRootContext('Title');
  const generated = useId();
  const titleId = id ?? generated;

  useLayoutEffect(() => {
    setTitleId(titleId);
    return () => setTitleId(undefined);
  }, [titleId]);

  return <h2 id={titleId} className={cx('halo-popover-title', className)} {...props} />;
}
