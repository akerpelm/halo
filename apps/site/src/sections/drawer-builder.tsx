import { useState } from 'react';
import { Button } from '../components/button';
import { CodeBlock } from '../components/code-block';
import { DemoDrawer } from '../components/demo-drawer';
import { DrawerStage } from '../components/drawer-stage';
import { Segmented } from '../components/segmented';
import { Slider } from '../components/slider';
import { SpringCurve } from '../components/spring-curve';
import { Toggle } from '../components/toggle';
import { type DrawerConfig, type SpringSetting, defaultDrawerConfig, drawerCode, drawerPrompt } from '../lib/config';
import { useSettings } from '../lib/settings';

function SpringControls({ value, onChange }: { value: SpringSetting; onChange: (value: SpringSetting) => void }) {
  return (
    <div className="grid gap-4">
      <SpringCurve spring={value} />
      <Slider label="Duration" value={value.duration} min={0.15} max={1.2} step={0.01} format={(v) => `${v.toFixed(2)} s`} onChange={(duration) => onChange({ ...value, duration })} />
      <Slider label="Bounce" value={value.bounce} min={0} max={0.6} step={0.01} format={(v) => v.toFixed(2)} onChange={(bounce) => onChange({ ...value, bounce })} />
    </div>
  );
}

export function DrawerBuilder({ output, onOutput }: { output: 'code' | 'prompt'; onOutput: (output: 'code' | 'prompt') => void }) {
  const { world } = useSettings();
  const [config, setConfig] = useState<DrawerConfig>(defaultDrawerConfig);
  const set = (patch: Partial<DrawerConfig>) => setConfig((current) => ({ ...current, ...patch }));

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr]">
      <form className="grid content-start gap-6 border-line p-5 max-lg:border-b lg:border-r" onSubmit={(event) => event.preventDefault()} aria-label="Drawer settings">
        <Segmented
          label="Edge"
          value={config.side}
          onChange={(side) => set({ side, snapPoints: side === 'bottom' || side === 'top' ? config.snapPoints : 'none' })}
          options={[
            { value: 'bottom', label: 'Bottom' },
            { value: 'top', label: 'Top' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ]}
        />
        <Segmented
          label="Detents"
          value={config.snapPoints}
          onChange={(snapPoints) => set({ snapPoints })}
          options={[
            { value: 'none', label: 'Fit' },
            { value: 'two', label: 'Two' },
            { value: 'three', label: 'Three' },
          ]}
        />
        <Segmented
          label="Density"
          value={config.density}
          onChange={(density) => set({ density })}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'comfortable', label: 'Regular' },
            { value: 'spacious', label: 'Spacious' },
          ]}
        />
        <Segmented
          label="Corners"
          value={config.radius}
          onChange={(radius) => set({ radius })}
          options={[
            { value: 'square', label: 'Square' },
            { value: 'soft', label: 'Soft' },
            { value: 'round', label: 'Round' },
            { value: 'large', label: 'Large' },
          ]}
        />
        <SpringControls value={config.spring} onChange={(spring) => set({ spring })} />
        <div className="grid gap-3">
          <Toggle label="Dismissible" checked={config.dismissible} onChange={(dismissible) => set({ dismissible })} />
          <Toggle label="Push page back" checked={config.recess} onChange={(recess) => set({ recess })} />
        </div>
        <Button tone="outline" size="sm" className="justify-self-start" onClick={() => setConfig(defaultDrawerConfig)}>
          Reset to defaults
        </Button>
      </form>
      <div className="min-w-0 max-lg:contents lg:flex lg:flex-col lg:gap-5 lg:p-5">
        <DrawerStage
          config={config}
          className="sticky top-16 z-10 h-[300px] max-lg:order-first max-lg:m-3 max-lg:h-[200px] lg:top-[76px] lg:shadow-[0_0_0_12px_var(--wall)]"
        >
          <DemoDrawer trigger="Open drawer" tone="primary" size="sm" config={config} />
        </DrawerStage>
        <div className="grid gap-5 max-lg:p-5">
        <Segmented
          label="Output"
          hideLabel
          value={output}
          onChange={onOutput}
          options={[
            { value: 'code', label: 'Code' },
            { value: 'prompt', label: 'Agent prompt' },
          ]}
        />
        <CodeBlock
          className="-mx-5 -mb-5 rounded-none bg-transparent shadow-[inset_0_1px_0_var(--line)]"
          code={output === 'code' ? drawerCode(config, world) : drawerPrompt(config, world)}
          label={output === 'code' ? 'drawer.tsx' : 'prompt.md'}
          copyLabel={output === 'code' ? 'Copy code' : 'Copy prompt'}
          wrap={output === 'prompt'}
        />
        </div>
      </div>
    </div>
  );
}
