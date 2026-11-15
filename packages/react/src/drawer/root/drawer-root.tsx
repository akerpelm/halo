import { type ReactNode, useId, useMemo, useRef } from 'react';
import type { SpringInput } from '../../spring/spring-config';
import type { HaloDensity, HaloRadius, HaloTheme, HaloWorldName } from '../../utils/appearance';
import { useControllableState } from '../../utils/use-controllable-state';
import type { DrawerSide, SnapPoint } from '../utils/geometry';
import { DrawerRootContext, type DrawerRootContextValue } from './drawer-root-context';

/** How far the page sinks back (0–1 of its size) and how much it bounces when it settles. */
export type RecessConfig = { depth: number; bounce: number };

export type DrawerRootProps = {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: DrawerSide;
  /** Detents the drawer can rest at, smallest first. Defaults to the content's own size. */
  snapPoints?: readonly SnapPoint[];
  activeSnapPoint?: SnapPoint;
  defaultSnapPoint?: SnapPoint;
  onActiveSnapPointChange?: (snap: SnapPoint) => void;
  /** When false, the drawer cannot be swiped, clicked, or escaped closed. */
  dismissible?: boolean;
  spring?: SpringInput;
  world?: HaloWorldName;
  theme?: HaloTheme;
  density?: HaloDensity;
  /** Corner radius of the open edge: a preset or px, capped at 40px so sheets stay sheets. */
  radius?: HaloRadius;
  /** Push the element marked `data-halo-recess` back as the drawer rises, on its own bouncier spring. */
  recess?: boolean | Partial<RecessConfig>;
};

const DEFAULT_SPRING = { duration: 0.38, bounce: 0.1 };

export function DrawerRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  snapPoints,
  activeSnapPoint,
  defaultSnapPoint,
  onActiveSnapPointChange,
  dismissible = true,
  spring = DEFAULT_SPRING,
  world = 'dichroic',
  theme = 'system',
  recess: recessProp = false,
  density = 'comfortable',
  radius,
}: DrawerRootProps) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [activeSnap, setActiveSnap] = useControllableState<SnapPoint | undefined>(
    activeSnapPoint,
    defaultSnapPoint ?? snapPoints?.[0],
    onActiveSnapPointChange as ((snap: SnapPoint | undefined) => void) | undefined,
  );
  const recessDepth = typeof recessProp === 'object' ? recessProp.depth : undefined;
  const recessBounce = typeof recessProp === 'object' ? recessProp.bounce : undefined;
  const recess = useMemo<RecessConfig | null>(
    () => (recessProp ? { depth: recessDepth ?? 0.06, bounce: recessBounce ?? 0.42 } : null),
    [Boolean(recessProp), recessDepth, recessBounce],
  );
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const value = useMemo<DrawerRootContextValue>(
    () => ({
      open,
      setOpen,
      side,
      snapPoints,
      activeSnap,
      setActiveSnap: setActiveSnap as (snap: SnapPoint) => void,
      dismissible,
      spring,
      world,
      theme,
      recess,
      density,
      radius,
      titleId,
      descriptionId,
      triggerRef,
    }),
    [open, setOpen, side, snapPoints, activeSnap, setActiveSnap, dismissible, spring, world, theme, recess, density, radius, titleId, descriptionId],
  );

  return <DrawerRootContext.Provider value={value}>{children}</DrawerRootContext.Provider>;
}
