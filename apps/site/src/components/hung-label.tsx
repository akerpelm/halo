import type { ComponentProps } from 'react';
import { HangingPane } from './hanging-pane';
import { WallLabel } from './wall-label';

/** The object label, hung on the same rigging as the hero pane. You can fling it too. */
export function HungLabel(props: ComponentProps<typeof WallLabel>) {
  return (
    <HangingPane
      swingIn={false}
      label={`${props.title} label on a spring. Drag and release it, or press the arrow keys to nudge it.`}
      className="relative h-[330px] max-w-[340px]"
      anchorClassName="inset-x-0 top-[64px] w-full"
      paneClassName="p-5 [--halo-radius:16px]"
    >
      <WallLabel {...props} className="max-w-none" />
    </HangingPane>
  );
}
