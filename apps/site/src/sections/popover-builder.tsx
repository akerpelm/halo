import { useState } from 'react';
import { BuilderOutput, type BuilderOutputKind } from '../components/builder-output';
import { Button } from '../components/button';
import { DemoPopover } from '../components/demo-popover';
import { Segmented } from '../components/segmented';
import { Slider } from '../components/slider';
import { SpringControls } from '../components/spring-controls';
import { type PopoverConfig, cornerOptions, cornerRadius, defaultPopoverConfig, densityOptions, popoverCode, popoverPrompt } from '../lib/config';
import { useSettings } from '../lib/settings';

export function PopoverBuilder({ output, onOutput }: { output: BuilderOutputKind; onOutput: (output: BuilderOutputKind) => void }) {
  const { world } = useSettings();
  const [config, setConfig] = useState<PopoverConfig>(defaultPopoverConfig);
  const set = (patch: Partial<PopoverConfig>) => setConfig((current) => ({ ...current, ...patch }));

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr]">
      <form className="grid content-start gap-6 border-line p-5 max-lg:border-b lg:border-r" onSubmit={(event) => event.preventDefault()} aria-label="Popover settings">
        <Segmented
          label="Side"
          value={config.side}
          onChange={(side) => set({ side })}
          options={[
            { value: 'bottom', label: 'Below' },
            { value: 'top', label: 'Above' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ]}
        />
        <Segmented
          label="Align"
          value={config.align}
          onChange={(align) => set({ align })}
          options={[
            { value: 'start', label: 'Start' },
            { value: 'center', label: 'Center' },
            { value: 'end', label: 'End' },
          ]}
        />
        <Slider label="Offset" value={config.offset} min={0} max={24} step={1} format={(v) => `${v} px`} onChange={(offset) => set({ offset })} />
        <Segmented label="Density" value={config.density} onChange={(density) => set({ density })} options={densityOptions} />
        <Segmented label="Corners" value={config.radius} onChange={(radius) => set({ radius })} options={cornerOptions} />
        <SpringControls value={config.spring} onChange={(spring) => set({ spring })} />
        <Button tone="outline" size="sm" className="justify-self-start" onClick={() => setConfig(defaultPopoverConfig)}>
          Reset to defaults
        </Button>
      </form>
      <div className="min-w-0 max-lg:contents lg:flex lg:flex-col lg:gap-5 lg:p-5">
        <div
          role="region"
          aria-label="Popover preview"
          data-world={world}
          className="grid h-[560px] place-items-center rounded-2xl bg-wall-deep max-lg:order-first max-lg:m-3 max-lg:h-[360px]"
        >
          <DemoPopover
            trigger="Share"
            tone="primary"
            size="sm"
            side={config.side}
            align={config.align}
            offset={config.offset}
            density={config.density}
            radius={cornerRadius(config.radius)}
            spring={config.spring}
          />
        </div>
        <BuilderOutput output={output} onOutput={onOutput} code={popoverCode(config, world)} prompt={popoverPrompt(config, world)} file="share-popover.tsx" />
      </div>
    </div>
  );
}
