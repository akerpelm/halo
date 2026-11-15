import { Drawer } from '@halo-ui/react/drawer';
import type { ReactNode } from 'react';
import { type DrawerConfig, defaultDrawerConfig, drawerRadius, snapPresets } from '../lib/config';
import { useSettings } from '../lib/settings';
import { type ButtonProps, buttonClass } from './button';

type DemoDrawerProps = {
  config?: DrawerConfig;
  trigger: ReactNode;
  tone?: ButtonProps['tone'];
  size?: ButtonProps['size'];
};

const files = [
  ['Brand guidelines.pdf', '4.2 MB'],
  ['Launch film, final cut.mov', '1.1 GB'],
  ['Press kit', '18 files'],
  ['Pricing research.xlsx', '880 KB'],
  ['Interview notes', '6 docs'],
  ['Screens, v4', '42 frames'],
  ['Moodboard', '120 images'],
  ['Copy deck', '3 drafts'],
] as const;

/** A realistic share sheet, so the demo shows snap points, scrolling, and focus with real content. */
export function DemoDrawer({ config = defaultDrawerConfig, trigger, tone = 'quiet', size = 'lg' }: DemoDrawerProps) {
  const { world, theme } = useSettings();
  const snaps = snapPresets[config.snapPoints];
  const vertical = config.side === 'bottom' || config.side === 'top';
  return (
    <Drawer.Root
      side={config.side}
      snapPoints={snaps}
      dismissible={config.dismissible}
      recess={config.recess}
      density={config.density}
      radius={drawerRadius[config.radius]}
      spring={config.spring}
      world={world}
      theme={theme}
    >
      <Drawer.Trigger className={buttonClass({ tone, size })}>{trigger}</Drawer.Trigger>
      <Drawer.Content className={vertical ? 'px-5 sm:px-7' : 'px-7 sm:px-9'}>
        <Drawer.Handle />
        <div className={vertical ? 'pt-1 pb-4' : 'pt-8 pb-4'}>
          <Drawer.Title className="font-display">Share “Spring launch”</Drawer.Title>
          <Drawer.Description>Anyone with the link can view. Editors can change files.</Drawer.Description>
        </div>
        <Drawer.Scroll className="-mx-2 px-2">
          <ul className="m-0 list-none p-0">
            {files.map(([name, meta]) => (
              <li key={name} className="flex items-center justify-between gap-4 border-b border-[color-mix(in_oklch,var(--halo-fg)_8%,transparent)] py-3.5 text-[15px] last:border-0">
                <span className="truncate">{name}</span>
                <span className="flex-none text-[13px] text-[var(--halo-fg-muted)] tabular-nums">{meta}</span>
              </li>
            ))}
          </ul>
        </Drawer.Scroll>
        <div className="flex gap-2 pt-4 pb-6">
          <Drawer.Close className="h-11 flex-1 cursor-pointer rounded-full border-0 bg-[var(--halo-control)] font-sans text-[15px] font-medium text-[var(--halo-control-fg)]">
            Copy link
          </Drawer.Close>
          <Drawer.Close className="h-11 cursor-pointer rounded-full border-0 bg-[color-mix(in_oklch,var(--halo-fg)_8%,transparent)] px-5 font-sans text-[15px] font-medium text-[var(--halo-fg)]">
            {config.dismissible ? 'Cancel' : 'Done'}
          </Drawer.Close>
        </div>
      </Drawer.Content>
    </Drawer.Root>
  );
}
