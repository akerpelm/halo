import { toast } from '@halo-ui/react/toast';
import type { ReactNode } from 'react';
import { Button } from '../components/button';
import { CopyButton } from '../components/copy-button';
import { DemoDrawer } from '../components/demo-drawer';
import { MaterialSample } from '../components/material-sample';
import { Section } from '../components/section';
import { type DrawerConfig, type ToastConfig, defaultDrawerConfig, defaultToastConfig, drawerPrompt, toastPrompt } from '../lib/config';
import { useSettings } from '../lib/settings';
import { worldName, worlds } from '../lib/worlds';

type ToastDirection = { name: string; line: string; config: ToastConfig };
type DrawerDirection = { name: string; line: string; config: DrawerConfig };

const toastDirections: ToastDirection[] = [
  { name: 'Deck', line: 'The default. A collapsed stack that fans out on hover, and each status icon empties like a timer.', config: defaultToastConfig },
  {
    name: 'Fan',
    line: 'Always expanded, from the top center. For dashboards where several updates matter at once.',
    config: { ...defaultToastConfig, position: 'top-center', expand: true, visibleToasts: 4, gap: 10 },
  },
  {
    name: 'Hush',
    line: 'No timer and no close button. Bottom center and critically damped, for calm writing tools.',
    config: { ...defaultToastConfig, position: 'bottom-center', timer: false, closeButton: false, duration: 4000, spring: { duration: 0.45, bounce: 0 } },
  },
  {
    name: 'Spring-loaded',
    line: 'More bounce, a quicker clock, and the countdown around the close button. For playful products.',
    config: { ...defaultToastConfig, position: 'top-right', duration: 3500, timer: 'close', spring: { duration: 0.5, bounce: 0.32 } },
  },
];

const drawerDirections: DrawerDirection[] = [
  { name: 'Sheet', line: 'Two detents with the page pushed back behind it. The iOS-native shape.', config: defaultDrawerConfig },
  { name: 'Steps', line: 'Three detents for peek, browse, and focus. Good for maps and media.', config: { ...defaultDrawerConfig, snapPoints: 'three' } },
  {
    name: 'Inspector',
    line: 'A side panel for details and settings. No detents, and the page stays put.',
    config: { ...defaultDrawerConfig, side: 'right', snapPoints: 'none', recess: false },
  },
  {
    name: 'Decision',
    line: 'It can’t be swiped or escaped away. For choices the user has to make.',
    config: { ...defaultDrawerConfig, snapPoints: 'none', dismissible: false, spring: { duration: 0.45, bounce: 0 } },
  },
];

type DirectionsProps = { onApplyToast: (config: ToastConfig) => void };

function Row({ name, line, actions }: { name: string; line: string; actions: ReactNode }) {
  return (
    <li className="grid gap-3 border-b border-line py-5 last:border-0 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-6">
      <h4 className="m-0 font-display text-[19px] font-semibold tracking-[-0.015em]">{name}</h4>
      <p className="m-0 text-[15px] leading-[1.5] text-ink-soft">{line}</p>
      <div className="flex flex-wrap items-center gap-1">{actions}</div>
    </li>
  );
}

export function Directions({ onApplyToast }: DirectionsProps) {
  const { world, setWorld } = useSettings();
  return (
    <Section
      id="directions"
      title="Directions"
      lede={
        <>
          <p className="m-0">Six materials and a handful of tuned setups. Each one is a starting point you can paste, or hand to your agent as a prompt.</p>
          <p className="m-0 mt-4">
            You are looking at <strong className="font-semibold text-ink">{worldName(world)}</strong>.
          </p>
        </>
      }
    >
      <ul className="m-0 grid list-none gap-x-8 gap-y-12 p-0 sm:grid-cols-2">
        {worlds.map(({ value, name, line }) => (
          <li key={value} className="flex flex-col gap-4">
            <MaterialSample world={value} />
            <div className="flex items-center justify-between gap-4">
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em]">{name}</h3>
              <Button size="sm" tone={world === value ? 'primary' : 'quiet'} aria-pressed={world === value} onClick={() => setWorld(value)}>
                {world === value ? 'In use' : 'Use'}
              </Button>
            </div>
            <p className="m-0 text-[15px] leading-[1.55] text-ink-soft">{line}</p>
            <code className="mt-auto text-[13px] text-ink-faint">world="{value}"</code>
          </li>
        ))}
      </ul>

      <h3 className="mt-16 mb-1 text-[24px] font-semibold tracking-[-0.02em]">Toast setups</h3>
      <ul className="m-0 list-none p-0">
        {toastDirections.map((d) => (
          <Row
            key={d.name}
            name={d.name}
            line={d.line}
            actions={
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    onApplyToast(d.config);
                    toast.success(`${d.name} applied`, { description: 'Every toast on this page now uses it.' });
                  }}
                >
                  Try it
                </Button>
                <CopyButton text={toastPrompt(d.config, world)} label="Copy prompt" />
              </>
            }
          />
        ))}
      </ul>

      <h3 className="mt-14 mb-1 text-[24px] font-semibold tracking-[-0.02em]">Drawer setups</h3>
      <ul className="m-0 list-none p-0">
        {drawerDirections.map((d) => (
          <Row
            key={d.name}
            name={d.name}
            line={d.line}
            actions={
              <>
                <DemoDrawer trigger="Try it" size="sm" config={d.config} />
                <CopyButton text={drawerPrompt(d.config, world)} label="Copy prompt" />
              </>
            }
          />
        ))}
      </ul>
    </Section>
  );
}
