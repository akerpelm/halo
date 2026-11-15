import type { ReactNode } from 'react';
import { Button } from '../components/button';
import { CopyButton } from '../components/copy-button';
import { DemoDrawer } from '../components/demo-drawer';
import { MaterialSample } from '../components/material-sample';
import { Section } from '../components/section';
import { type BuildConfig, PLAIN, builderPrompt } from '../lib/build';
import { type DrawerConfig, PRINCIPLES, defaultDrawerConfig, drawerPrompt } from '../lib/config';
import { LLMS_URL } from '../lib/site';
import { navigate } from '../lib/router';
import { useSettings } from '../lib/settings';
import { worldName, worlds } from '../lib/worlds';

type ToastDirection = { name: string; line: string; config: BuildConfig };
type DrawerDirection = { name: string; line: string; config: DrawerConfig };

const toastDirections: ToastDirection[] = [
  {
    name: 'Deck',
    line: 'The library default. Dichroic glass that rises in, a collapsed stack, and an icon timer.',
    config: { ...PLAIN, world: 'dichroic', motion: 'rise', spring: 'snappy', icons: true, timer: 'icon', closeButton: true, radius: 'round', duration: 5000 },
  },
  {
    name: 'Fan',
    line: 'Always fanned out from the top centre, in etched Partition glass. For dashboards.',
    config: { ...PLAIN, world: 'partition', motion: 'drop', spring: 'snappy', icons: true, timer: 'close', closeButton: true, radius: 'round', position: 'top-center', expand: true },
  },
  {
    name: 'Hush',
    line: 'Vapor glass that pulls into focus, no timer, critically damped. For calm writing tools.',
    config: { ...PLAIN, world: 'vapor', motion: 'focus', spring: 'gentle', icons: true, radius: 'round', position: 'bottom-center' },
  },
  {
    name: 'Showtime',
    line: 'Blooms out of a capsule on a jelly spring, with glass tinted by type. For playful products.',
    config: { ...PLAIN, world: 'dichroic', motion: 'bloom', spring: 'jelly', coat: 'orchid', intent: 'tint', icons: true, timer: 'icon', closeButton: true, radius: 'pill' },
  },
  {
    name: 'Signage',
    line: 'Smoked glass that swings down on a hinge, top right. For media and night modes.',
    config: { ...PLAIN, world: 'smoked', motion: 'hinge', spring: 'pop', icons: true, timer: 'icon', closeButton: true, radius: 'soft', position: 'top-right' },
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

type DirectionsProps = { onOpenToast: (config: BuildConfig) => void };

function Row({ name, line, actions }: { name: string; line: string; actions: ReactNode }) {
  return (
    <li className="grid gap-3 border-b border-line py-5 last:border-0 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-6">
      <h4 className="m-0 font-display text-title font-semibold tracking-[-0.015em]">{name}</h4>
      <p className="m-0 text-body leading-[1.5] text-ink-soft">{line}</p>
      <div className="flex flex-wrap items-center gap-1">{actions}</div>
    </li>
  );
}

export function Directions({ onOpenToast }: DirectionsProps) {
  const { world, setWorld } = useSettings();
  return (
    <Section
      id="directions"
      title="Worlds"
      lede={
        <>
          <p className="m-0">Nine worlds and a handful of tuned setups. Each one is a starting point you can paste, or hand to your agent as a prompt.</p>
          <p className="m-0 mt-4">
            You are looking at <strong className="font-semibold text-ink">{worldName(world)}</strong>.
          </p>
        </>
      }
    >
      <ul className="m-0 grid list-none gap-x-8 gap-y-12 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {worlds.map(({ value, name, line }) => (
          <li key={value} className="flex flex-col gap-4">
            <MaterialSample world={value} />
            <div className="flex items-center justify-between gap-4">
              <h3 className="m-0 text-title font-semibold tracking-[-0.02em]">{name}</h3>
              <Button size="sm" tone={world === value ? 'primary' : 'quiet'} aria-pressed={world === value} onClick={() => setWorld(value)}>
                {world === value ? 'In use' : 'Use'}
              </Button>
            </div>
            <p className="m-0 text-body leading-[1.55] text-ink-soft">{line}</p>
            <code className="mt-auto text-label text-ink-faint">world="{value}"</code>
          </li>
        ))}
      </ul>

      <h3 className="mt-16 mb-1 text-heading font-semibold tracking-[-0.02em]">Toast setups</h3>
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
                    onOpenToast(d.config);
                    navigate('/playground');
                  }}
                >
                  Open in playground
                </Button>
                <CopyButton text={builderPrompt(d.config, PRINCIPLES, LLMS_URL)} label="Copy prompt" />
              </>
            }
          />
        ))}
      </ul>

      <h3 className="mt-14 mb-1 text-heading font-semibold tracking-[-0.02em]">Drawer setups</h3>
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
