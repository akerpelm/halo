import { type RefObject, createContext, useContext } from 'react';
import type { SpringInput } from '../../spring/spring-config';
import type { HaloDensity, HaloRadius, HaloTheme, HaloWorldName } from '../../utils/appearance';
import type { DrawerSide, SnapPoint } from '../utils/geometry';
import type { RecessConfig } from './drawer-root';

export type DrawerRootContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: DrawerSide;
  snapPoints: readonly SnapPoint[] | undefined;
  activeSnap: SnapPoint | undefined;
  setActiveSnap: (snap: SnapPoint) => void;
  dismissible: boolean;
  spring: SpringInput;
  world: HaloWorldName;
  theme: HaloTheme;
  recess: RecessConfig | null;
  density: HaloDensity;
  radius: HaloRadius | undefined;
  titleId: string;
  descriptionId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export const DrawerRootContext = createContext<DrawerRootContextValue | null>(null);

export function useDrawerRootContext(part: string): DrawerRootContextValue {
  const context = useContext(DrawerRootContext);
  if (!context) throw new Error(`<Drawer.${part}> must be rendered inside <Drawer.Root>.`);
  return context;
}
