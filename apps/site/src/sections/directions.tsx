import type { ReactNode } from 'react';
import { Button } from '../components/button';
import { CopyButton } from '../components/copy-button';
import { DemoDrawer } from '../components/demo-drawer';
import { Link } from '../components/link';
import { MaterialSample } from '../components/material-sample';
import { Section } from '../components/section';
import { type BuildConfig, PLAIN, builderPrompt } from '../lib/build';
import { type DrawerConfig, PRINCIPLES, defaultDrawerConfig, drawerPrompt } from '../lib/config';
import { LLMS_URL } from '../lib/site';
import { navigate } from '../lib/router';
import { useSettings } from '../lib/settings';
import { allWorlds, worldName, worlds } from '../lib/worlds';

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
  const current = allWorlds.find((w) => w.value === world) ?? { value: world, name: worldName(world), line: '' };
  return (
    <Section
      id="directions"
      title="Worlds"
      lede={
        <>
          <p className="m-0">
            Nine glass themes, called worlds, each in light and dark. Pick one with a prop, or write your own in one CSS selector.
          </p>
          <p className="m-0 mt-4">Below them, tuned setups you can paste or hand to your agent as a prompt.</p>
        </>
      }
    >
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
        <MaterialSample world={current.value} />
        <div className="grid content-center gap-3" aria-live="polite">
          <h3 className="m-0 text-title font-semibold tracking-[-0.02em]">{current.name}</h3>
          <p className="m-0 text-body leading-[1.55] text-ink-soft">{current.line}</p>
          <code className="text-label text-ink-faint">world="{current.value}"</code>
        </div>
      </div>
      <ul aria-label="Worlds" className="m-0 mt-6 flex list-none flex-wrap gap-1.5 p-0">
        {worlds.map(({ value, name }) => (
          <li key={value}>
            <Button size="sm" tone={value === current.value ? 'primary' : 'quiet'} aria-pressed={value === current.value} onClick={() => setWorld(value)}>
              {name}
            </Button>
          </li>
        ))}
      </ul>
      <p className="mt-6 mb-0 text-body text-ink-soft">
        Picking one restyles the whole site.{' '}
        <Link href="/docs/worlds" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          Compare all nine in the docs
        </Link>
        , with what each one costs to render.
      </p>

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
