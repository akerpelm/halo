import type { ReactNode } from 'react';
import { CopyButton } from '../components/copy-button';
import { DemoDrawer } from '../components/demo-drawer';
import { HangingPane } from '../components/hanging-pane';
import { SpringPreview } from '../components/spring-preview';
import { demos } from '../lib/demo-toasts';
import { useSettings } from '../lib/settings';
import { worldName } from '../lib/worlds';
import { LLMS_URL } from '../lib/site';

/** Each docs page opens with its component hung on the site's rigging, live. */
function Specimen({ children, world, label }: { children: ReactNode; world?: string; label: string }) {
  return (
    <HangingPane
      swingIn={false}
      light={false}
      world={world}
      label={`${label}. A live example on a spring: drag it, or use its controls.`}
      className="relative h-[250px] w-full"
      anchorClassName="inset-x-0 top-[54px] mx-auto w-full max-w-[340px]"
      paneClassName="p-5 [--halo-radius:20px]"
    >
      {children}
    </HangingPane>
  );
}

const fire = 'inline-flex h-9 cursor-pointer items-center rounded-full bg-[var(--halo-control)] px-4 text-label font-medium text-[var(--halo-control-fg)] pointer-coarse:h-11';

function Line({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <p className="m-0 font-display text-title font-semibold tracking-[-0.015em] text-[var(--halo-fg)]">{title}</p>
      <div className="mt-1.5 text-ui leading-[1.5] text-[var(--halo-fg-muted)]">{children}</div>
    </>
  );
}

function WorldSpecimen() {
  const { world } = useSettings();
  return (
    <Specimen label="The current world">
      <Line title={`This pane is ${worldName(world)}.`}>Switch worlds in the header and it changes with them.</Line>
    </Specimen>
  );
}

function MotionSpecimen() {
  return (
    <Specimen label="A spring">
      <Line title="Snappy, live">Replay to watch the default spring.</Line>
      <div className="mt-3">
        <SpringPreview spring="snappy" />
      </div>
    </Specimen>
  );
}

export const specimens: Record<string, () => ReactNode> = {
  'getting-started': () => (
    <Specimen label="Install">
      <Line title="One package">No dependencies besides React.</Line>
      <div className="mt-3 flex items-center gap-2 font-mono text-label text-[var(--halo-fg)]">
        npm i @halo-ui/react <CopyButton text="npm i @halo-ui/react" />
      </div>
    </Specimen>
  ),
  toast: () => (
    <Specimen label="A toast">
      <Line title="Fire one from here">It launches out of the button.</Line>
      <button type="button" className={`mt-3 ${fire}`} onClick={(event) => demos.success(event.currentTarget)}>
        Fire a toast
      </button>
    </Specimen>
  ),
  drawer: () => (
    <Specimen label="A drawer">
      <Line title="A share sheet">Two detents, and the page zooms back.</Line>
      <div className="mt-3">
        <DemoDrawer trigger="Open the drawer" size="sm" tone="primary" />
      </div>
    </Specimen>
  ),
  worlds: () => <WorldSpecimen />,
  motion: () => <MotionSpecimen />,
  customize: () => (
    <Specimen label="A custom world" world="midnight">
      <Line title="Midnight">One CSS selector in this site. The library has never heard of it.</Line>
    </Specimen>
  ),
  agents: () => (
    <Specimen label="A prompt">
      <Line title="Hand it to your agent">One line, and it reads the whole API from llms.txt.</Line>
      <div className="mt-3">
        <CopyButton text={`Read ${LLMS_URL}, then replace this app's notifications with Halo toasts. Keep every existing message and its meaning.`} label="Copy prompt" />
      </div>
    </Specimen>
  ),
};
