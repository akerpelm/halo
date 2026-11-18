import { type ReactNode, useId, useMemo, useRef, useState } from 'react';
import type { SpringInput } from '../../spring/spring-config';
import type { HaloDensity, HaloRadius, HaloTheme, HaloWorldName } from '../../utils/appearance';
import { useControllableState } from '../../utils/use-controllable-state';
import type { PopoverAlign, PopoverSide } from '../popup/placement';
import { PopoverRootContext, type PopoverRootContextValue } from './popover-root-context';

export type PopoverRootProps = {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The side of the trigger the popover prefers. It flips to the opposite side when there is no room. */
  side?: PopoverSide;
  /** How the popover lines up with the trigger along that side. */
  align?: PopoverAlign;
  /** Gap between the trigger and the popover, in px. */
  offset?: number;
  /** The spring the popover grows out of its trigger on. */
  spring?: SpringInput;
  world?: HaloWorldName;
  theme?: HaloTheme;
  density?: HaloDensity;
  radius?: HaloRadius;
};

const DEFAULT_SPRING = { duration: 0.32, bounce: 0.14 };

export function PopoverRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  align = 'center',
  offset = 8,
  spring = DEFAULT_SPRING,
  world = 'dichroic',
  theme = 'system',
  density = 'comfortable',
  radius,
}: PopoverRootProps) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const popupId = useId();
  const anchorName = `--halo-anchor-${popupId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [titleId, setTitleId] = useState<string>();
  const [descriptionId, setDescriptionId] = useState<string>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const value = useMemo<PopoverRootContextValue>(
    () => ({
      open,
      setOpen,
      side,
      align,
      offset,
      spring,
      world,
      theme,
      density,
      radius,
      popupId,
      anchorName,
      titleId,
      descriptionId,
      setTitleId,
      setDescriptionId,
      triggerRef,
      popupRef,
    }),
    [open, setOpen, side, align, offset, spring, world, theme, density, radius, popupId, anchorName, titleId, descriptionId],
  );

  return <PopoverRootContext.Provider value={value}>{children}</PopoverRootContext.Provider>;
}
