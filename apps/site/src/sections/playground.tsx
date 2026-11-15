import type { HaloWorld, ToastPosition } from '@halo-ui/react';
import { toast } from '@halo-ui/react/toast';
import { useState } from 'react';
import { Button } from '../components/button';
import { CodeBlock } from '../components/code-block';
import { DemoDrawer } from '../components/demo-drawer';
import { Section } from '../components/section';
import { Segmented } from '../components/segmented';
import { Select } from '../components/select';
import { Slider } from '../components/slider';
import { SpringCurve } from '../components/spring-curve';
import { Toggle } from '../components/toggle';
import {
  type DrawerConfig,
  type SpringSetting,
  type ToastConfig,
  defaultDrawerConfig,
  defaultToastConfig,
  drawerCode,
  drawerPrompt,
  toastPrompt,
  toasterCode,
} from '../lib/config';
import { demos } from '../lib/demo-toasts';
import { useSettings } from '../lib/settings';
import { worlds } from '../lib/worlds';

type PlaygroundProps = { toastConfig: ToastConfig; onToastConfig: (config: ToastConfig) => void };

const positions: ReadonlyArray<{ value: ToastPosition; label: string }> = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-center', label: 'Top' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-center', label: 'Bottom' },
  { value: 'bottom-right', label: 'Bottom right' },
];

function SpringControls({ value, onChange }: { value: SpringSetting; onChange: (value: SpringSetting) => void }) {
  return (
    <div className="grid gap-4">
      <SpringCurve spring={value} />
      <Slider label="Duration" value={value.duration} min={0.15} max={1.2} step={0.01} format={(v) => `${v.toFixed(2)} s`} onChange={(duration) => onChange({ ...value, duration })} />
      <Slider label="Bounce" value={value.bounce} min={0} max={0.6} step={0.01} format={(v) => v.toFixed(2)} onChange={(bounce) => onChange({ ...value, bounce })} />
    </div>
  );
}

export function Playground({ toastConfig, onToastConfig }: PlaygroundProps) {
  const { world, theme, setWorld, setTheme } = useSettings();
  const [component, setComponent] = useState<'toast' | 'drawer'>('toast');
  const [output, setOutput] = useState<'code' | 'prompt'>('code');
  const [drawerConfig, setDrawerConfig] = useState<DrawerConfig>(defaultDrawerConfig);
  const setToast = (patch: Partial<ToastConfig>) => onToastConfig({ ...toastConfig, ...patch });
  const setDrawer = (patch: Partial<DrawerConfig>) => setDrawerConfig((current) => ({ ...current, ...patch }));

  const text =
    component === 'toast'
      ? output === 'code'
        ? toasterCode(toastConfig, world)
        : toastPrompt(toastConfig, world)
      : output === 'code'
        ? drawerCode(drawerConfig, world)
        : drawerPrompt(drawerConfig, world);

  return (
    <Section
      id="playground"
      title="Playground"
      lede={
        <p className="m-0">
          Tune it here, then take the result with you as code or as a prompt for your agent. Toast changes apply to every toast on this page.
        </p>
      }
    >
      <div className="grid overflow-hidden rounded-[24px] shadow-[inset_0_0_0_1px_var(--line)] lg:grid-cols-[320px_1fr]">
        <form className="grid content-start gap-6 border-line p-6 max-lg:border-b lg:border-r" onSubmit={(event) => event.preventDefault()} aria-label="Playground settings">
          <Segmented
            label="Component"
            value={component}
            onChange={setComponent}
            options={[
              { value: 'toast', label: 'Toast' },
              { value: 'drawer', label: 'Drawer' },
            ]}
          />

          <Select label="World" value={world} onChange={(event) => setWorld(event.target.value as HaloWorld)}>
            {worlds.map((w) => (
              <option key={w.value} value={w.value}>
                {w.name}
              </option>
            ))}
          </Select>
          <Segmented
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />

          {component === 'toast' ? (
            <>
              <Select label="Position" value={toastConfig.position} onChange={(event) => setToast({ position: event.target.value as ToastPosition })}>
                {positions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
              <Segmented
                label="Density"
                value={toastConfig.density}
                onChange={(density) => setToast({ density })}
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'comfortable', label: 'Regular' },
                  { value: 'spacious', label: 'Spacious' },
                ]}
              />
              <Segmented
                label="Corners"
                value={toastConfig.radius}
                onChange={(radius) => setToast({ radius })}
                options={[
                  { value: 'square', label: 'Square' },
                  { value: 'soft', label: 'Soft' },
                  { value: 'round', label: 'Round' },
                  { value: 'pill', label: 'Pill' },
                ]}
              />
              <Segmented
                label="Time left"
                value={toastConfig.timer || 'off'}
                onChange={(value) => setToast({ timer: value === 'off' ? false : value })}
                options={[
                  { value: 'icon', label: 'Icon' },
                  { value: 'close', label: 'Close' },
                  { value: 'edge', label: 'Edge' },
                  { value: 'off', label: 'Off' },
                ]}
              />
              <SpringControls value={toastConfig.spring} onChange={(spring) => setToast({ spring })} />
              <Slider label="Visible toasts" value={toastConfig.visibleToasts} min={1} max={6} step={1} onChange={(visibleToasts) => setToast({ visibleToasts })} />
              <Slider label="Gap" value={toastConfig.gap} min={4} max={24} step={1} format={(v) => `${v} px`} onChange={(gap) => setToast({ gap })} />
              <Slider
                label="Auto-dismiss"
                value={toastConfig.duration}
                min={2000}
                max={10000}
                step={500}
                format={(v) => `${(v / 1000).toFixed(1)} s`}
                onChange={(duration) => setToast({ duration })}
              />
              <div className="grid gap-3">
                <Toggle label="Always expanded" checked={toastConfig.expand} onChange={(expand) => setToast({ expand })} />
                <Toggle label="Close button" checked={toastConfig.closeButton} onChange={(closeButton) => setToast({ closeButton })} />
              </div>
            </>
          ) : (
            <>
              <Segmented
                label="Edge"
                value={drawerConfig.side}
                onChange={(side) => setDrawer({ side, snapPoints: side === 'bottom' || side === 'top' ? drawerConfig.snapPoints : 'none' })}
                options={[
                  { value: 'bottom', label: 'Bottom' },
                  { value: 'top', label: 'Top' },
                  { value: 'left', label: 'Left' },
                  { value: 'right', label: 'Right' },
                ]}
              />
              <Segmented
                label="Detents"
                value={drawerConfig.snapPoints}
                onChange={(snapPoints) => setDrawer({ snapPoints })}
                options={[
                  { value: 'none', label: 'Fit' },
                  { value: 'two', label: 'Two' },
                  { value: 'three', label: 'Three' },
                ]}
              />
              <Segmented
                label="Density"
                value={drawerConfig.density}
                onChange={(density) => setDrawer({ density })}
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'comfortable', label: 'Regular' },
                  { value: 'spacious', label: 'Spacious' },
                ]}
              />
              <Segmented
                label="Corners"
                value={drawerConfig.radius}
                onChange={(radius) => setDrawer({ radius })}
                options={[
                  { value: 'square', label: 'Square' },
                  { value: 'soft', label: 'Soft' },
                  { value: 'round', label: 'Round' },
                  { value: 'large', label: 'Large' },
                ]}
              />
              <SpringControls value={drawerConfig.spring} onChange={(spring) => setDrawer({ spring })} />
              <div className="grid gap-3">
                <Toggle label="Dismissible" checked={drawerConfig.dismissible} onChange={(dismissible) => setDrawer({ dismissible })} />
                <Toggle label="Push page back" checked={drawerConfig.recess} onChange={(recess) => setDrawer({ recess })} />
              </div>
            </>
          )}

          <Button
            tone="outline"
            size="sm"
            className="justify-self-start"
            onClick={() => (component === 'toast' ? onToastConfig(defaultToastConfig) : setDrawerConfig(defaultDrawerConfig))}
          >
            Reset to defaults
          </Button>
        </form>

        <div className="grid min-w-0 content-start gap-6 p-6">
          <div className="flex flex-wrap items-center gap-2">
            {component === 'toast' ? (
              <>
                <Button tone="primary" onClick={() => demos.success()}>
                  Fire a toast
                </Button>
                <Button onClick={() => demos.promise()}>Promise</Button>
                <Button onClick={() => demos.error()}>Error</Button>
                <Button onClick={() => [demos.default, demos.info, demos.warning, demos.success].forEach((fire, i) => window.setTimeout(fire, i * 140))}>
                  Burst of four
                </Button>
                <Button tone="outline" onClick={() => toast.dismiss()}>
                  Clear
                </Button>
              </>
            ) : (
              <DemoDrawer trigger="Open drawer" tone="primary" size="md" config={drawerConfig} />
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <Segmented
              label="Output"
              hideLabel
              value={output}
              onChange={setOutput}
              options={[
                { value: 'code', label: 'Code' },
                { value: 'prompt', label: 'Agent prompt' },
              ]}
            />
          </div>
          <CodeBlock className="-mx-6 -mb-6 rounded-none bg-transparent shadow-[inset_0_1px_0_var(--line)]" code={text} label={output === 'code' ? `${component}.tsx` : 'prompt.md'} copyLabel={output === 'code' ? 'Copy code' : 'Copy prompt'} wrap={output === 'prompt'} />
        </div>
      </div>
    </Section>
  );
}
