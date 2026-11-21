import { useState } from 'react';
import { BuilderOutput, type BuilderOutputKind } from '../components/builder-output';
import { Button } from '../components/button';
import { DemoSwipe } from '../components/demo-swipe';
import { Segmented } from '../components/segmented';
import { SpringControls } from '../components/spring-controls';
import { Toggle } from '../components/toggle';
import { type SwipeConfig, cornerOptions, cornerRadius, defaultSwipeConfig, densityOptions, swipeCode, swipePrompt } from '../lib/config';
import { useSettings } from '../lib/settings';

export function SwipeBuilder({ output, onOutput }: { output: BuilderOutputKind; onOutput: (output: BuilderOutputKind) => void }) {
  const { world } = useSettings();
  const [config, setConfig] = useState<SwipeConfig>(defaultSwipeConfig);
  const set = (patch: Partial<SwipeConfig>) => setConfig((current) => ({ ...current, ...patch }));

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr]">
      <form className="grid content-start gap-6 border-line p-5 max-lg:border-b lg:border-r" onSubmit={(event) => event.preventDefault()} aria-label="Swipe settings">
        <Segmented
          label="Actions"
          value={config.actions}
          onChange={(actions) => set({ actions })}
          options={[
            { value: 'end', label: 'Trailing' },
            { value: 'start', label: 'Leading' },
            { value: 'both', label: 'Both' },
          ]}
        />
        <Segmented label="Density" value={config.density} onChange={(density) => set({ density })} options={densityOptions} />
        <Segmented label="Corners" value={config.radius} onChange={(radius) => set({ radius })} options={cornerOptions} />
        <SpringControls value={config.spring} onChange={(spring) => set({ spring })} />
        <div className="grid gap-3">
          <Toggle label="A full swipe runs Archive" checked={config.fullSwipe} onChange={(fullSwipe) => set({ fullSwipe })} />
          <Toggle label="Hint on first view" checked={config.hint} onChange={(hint) => set({ hint })} />
        </div>
        <Button tone="outline" size="sm" className="justify-self-start" onClick={() => setConfig(defaultSwipeConfig)}>
          Reset to defaults
        </Button>
      </form>
      <div className="min-w-0 max-lg:contents lg:flex lg:flex-col lg:gap-5 lg:p-5">
        <div role="region" aria-label="Swipe preview" data-world={world} className="rounded-2xl bg-wall-deep p-4 max-lg:order-first max-lg:m-3 sm:p-6">
          <DemoSwipe
            key={`${config.actions}-${config.hint}`}
            actions={config.actions}
            fullSwipe={config.fullSwipe}
            hint={config.hint}
            density={config.density}
            radius={cornerRadius(config.radius)}
            spring={config.spring}
          />
        </div>
        <BuilderOutput output={output} onOutput={onOutput} code={swipeCode(config, world)} prompt={swipePrompt(config, world)} file="invoice-list.tsx" />
      </div>
    </div>
  );
}
