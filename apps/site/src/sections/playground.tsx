import { useState } from 'react';
import type { BuilderOutputKind } from '../components/builder-output';
import { Segmented } from '../components/segmented';
import type { BuildConfig } from '../lib/build';
import { DrawerBuilder } from './drawer-builder';
import { PopoverBuilder } from './popover-builder';
import { SwipeBuilder } from './swipe-builder';
import { ToastBuilder } from './toast-builder';

type PlaygroundProps = { build: BuildConfig; onBuild: (config: BuildConfig) => void };

type Component = 'toast' | 'drawer' | 'popover' | 'swipe';

const intros: Record<Component, string> = {
  toast: 'Start from the plainest toast, layer it up',
  drawer: 'Pick an edge, detents, and a spring',
  popover: 'Pick a side, an alignment, and a spring',
  swipe: 'Pick the action edges, full swipe, and a spring',
};

export function Playground({ build, onBuild }: PlaygroundProps) {
  const [component, setComponent] = useState<Component>('toast');
  const [output, setOutput] = useState<BuilderOutputKind>('code');

  return (
    <section aria-labelledby="playground-heading" className="mx-auto max-w-[1240px] px-4 pt-8 pb-24 sm:px-8 lg:pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 id="playground-heading" className="m-0 text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
            Playground
          </h1>
          <p className="m-0 mt-2 text-body text-ink-soft">{intros[component]}, then take the code or an agent prompt.</p>
        </div>
        <Segmented
          label="Building"
          hideLabel
          className="w-full sm:w-[400px]"
          value={component}
          onChange={setComponent}
          options={[
            { value: 'toast', label: 'Toast' },
            { value: 'drawer', label: 'Drawer' },
            { value: 'popover', label: 'Popover' },
            { value: 'swipe', label: 'Swipe' },
          ]}
        />
      </div>
      <div className="rounded-[24px] shadow-[inset_0_0_0_1px_var(--line)]">
        {component === 'toast' && <ToastBuilder config={build} onChange={onBuild} output={output} onOutput={setOutput} />}
        {component === 'drawer' && <DrawerBuilder output={output} onOutput={setOutput} />}
        {component === 'popover' && <PopoverBuilder output={output} onOutput={setOutput} />}
        {component === 'swipe' && <SwipeBuilder output={output} onOutput={setOutput} />}
      </div>
    </section>
  );
}
