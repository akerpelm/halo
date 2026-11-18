import { type RefObject, createContext, useContext } from 'react';
import type { SpringInput } from '../../spring/spring-config';
import type { HaloDensity, HaloRadius, HaloTheme, HaloWorldName } from '../../utils/appearance';
import type { PopoverAlign, PopoverSide } from '../popup/placement';

export type PopoverRootContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: PopoverSide;
  align: PopoverAlign;
  offset: number;
  spring: SpringInput;
  world: HaloWorldName;
  theme: HaloTheme;
  density: HaloDensity;
  radius: HaloRadius | undefined;
  popupId: string;
  anchorName: string;
  titleId: string | undefined;
  descriptionId: string | undefined;
  setTitleId: (id: string | undefined) => void;
  setDescriptionId: (id: string | undefined) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  popupRef: RefObject<HTMLDivElement | null>;
};

export const PopoverRootContext = createContext<PopoverRootContextValue | null>(null);

export function usePopoverRootContext(part: string): PopoverRootContextValue {
  const context = useContext(PopoverRootContext);
  if (!context) throw new Error(`<Popover.${part}> must be rendered inside <Popover.Root>.`);
  return context;
}
