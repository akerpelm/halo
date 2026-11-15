import { useState } from 'react';
import { Section } from '../components/section';
import { Segmented } from '../components/segmented';
import type { BuildConfig } from '../lib/build';
import { DrawerBuilder } from './drawer-builder';
import { ToastBuilder } from './toast-builder';

type PlaygroundProps = { build: BuildConfig; onBuild: (config: BuildConfig) => void };

export function Playground({ build, onBuild }: PlaygroundProps) {
  const [component, setComponent] = useState<'toast' | 'drawer'>('toast');
  const [output, setOutput] = useState<'code' | 'prompt'>('code');

  return (
    <Section
      id="playground"
      wide
      title="Playground"
      lede={
        <>
          <p className="m-0">It starts as the plainest toast there is. Layer on material, motion, springs, and colour until it’s yours.</p>
          <p className="m-0 mt-4">Then take it with you as code, or as a prompt for your agent.</p>
        </>
      }
      aside={
        <Segmented
          label="Building"
          className="w-[240px]"
          value={component}
          onChange={setComponent}
          options={[
            { value: 'toast', label: 'Toast' },
            { value: 'drawer', label: 'Drawer' },
          ]}
        />
      }
    >
      <div className="overflow-hidden rounded-[24px] shadow-[inset_0_0_0_1px_var(--line)] lg:overflow-visible">
        {component === 'toast' ? (
          <ToastBuilder config={build} onChange={onBuild} output={output} onOutput={setOutput} />
        ) : (
          <DrawerBuilder output={output} onOutput={setOutput} />
        )}
      </div>
    </Section>
  );
}
