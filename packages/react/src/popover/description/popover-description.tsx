import { type HTMLAttributes, useId, useLayoutEffect } from 'react';
import { cx } from '../../utils/cx';
import { usePopoverRootContext } from '../root/popover-root-context';

export function PopoverDescription({ id, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { setDescriptionId } = usePopoverRootContext('Description');
  const generated = useId();
  const descriptionId = id ?? generated;

  useLayoutEffect(() => {
    setDescriptionId(descriptionId);
    return () => setDescriptionId(undefined);
  }, [descriptionId]);

  return <p id={descriptionId} className={cx('halo-popover-description', className)} {...props} />;
}
