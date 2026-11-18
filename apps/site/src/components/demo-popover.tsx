import { Popover, type PopoverAlign, type PopoverSide } from 'halo-ui-react/popover';
import type { ReactNode } from 'react';
import { useSettings } from '../lib/settings';
import { type ButtonProps, buttonClass } from './button';
import { CopyButton } from './copy-button';

type DemoPopoverProps = {
  trigger: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  tone?: ButtonProps['tone'];
  size?: ButtonProps['size'];
};

const link = 'haloui.dev/s/spring-launch';
const people = [
  ['Ada Park', 'Can edit'],
  ['Luis Ortega', 'Can view'],
] as const;

export function DemoPopover({ trigger, side = 'bottom', align = 'center', tone = 'quiet', size = 'md' }: DemoPopoverProps) {
  const { world, theme } = useSettings();
  return (
    <Popover.Root side={side} align={align} world={world} theme={theme}>
      <Popover.Trigger className={buttonClass({ tone, size })}>{trigger}</Popover.Trigger>
      <Popover.Popup className="w-[300px]">
        <Popover.Title className="font-display">Share “Spring launch”</Popover.Title>
        <Popover.Description>Anyone with the link can view.</Popover.Description>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-[color-mix(in_oklch,var(--halo-fg)_6%,transparent)] py-1 pr-1 pl-3.5">
          <span className="min-w-0 flex-1 truncate font-mono text-caption text-[var(--halo-fg-muted)]">{link}</span>
          <CopyButton text={`https://${link}`} label="Copy link" className="text-[var(--halo-fg)] hover:text-[var(--halo-fg)]" />
        </div>
        <ul className="m-0 mt-3 list-none p-0">
          {people.map(([name, role]) => (
            <li key={name} className="flex items-center justify-between gap-3 py-1.5 text-ui">
              <span>{name}</span>
              <span className="text-label text-[var(--halo-fg-muted)]">{role}</span>
            </li>
          ))}
        </ul>
        <Popover.Close className="mt-3 h-9 w-full cursor-pointer rounded-full border-0 bg-[var(--halo-control)] font-sans text-ui font-medium text-[var(--halo-control-fg)] pointer-coarse:h-11">
          Done
        </Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  );
}

const sides: ReadonlyArray<{ side: PopoverSide; label: string }> = [
  { side: 'top', label: 'Above' },
  { side: 'right', label: 'Right' },
  { side: 'bottom', label: 'Below' },
  { side: 'left', label: 'Left' },
];

export function PlacementPopovers() {
  const { world, theme } = useSettings();
  return (
    <div className="flex flex-wrap gap-2">
      {sides.map(({ side, label }) => (
        <Popover.Root key={side} side={side} world={world} theme={theme}>
          <Popover.Trigger className={buttonClass({ tone: 'outline', size: 'sm' })}>{label}</Popover.Trigger>
          <Popover.Popup aria-label={`Placed ${label.toLowerCase()}`} className="w-[220px] text-ui">
            The light gathers on the edge that faces the button. If there is no room, the popover flips and the light follows it.
          </Popover.Popup>
        </Popover.Root>
      ))}
    </div>
  );
}
