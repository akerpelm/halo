import type { SpringSetting } from '../lib/config';
import { Slider } from './slider';
import { SpringCurve } from './spring-curve';

export function SpringControls({ value, onChange }: { value: SpringSetting; onChange: (value: SpringSetting) => void }) {
  return (
    <div className="grid gap-4">
      <SpringCurve spring={value} />
      <Slider label="Duration" value={value.duration} min={0.15} max={1.2} step={0.01} format={(v) => `${v.toFixed(2)} s`} onChange={(duration) => onChange({ ...value, duration })} />
      <Slider label="Bounce" value={value.bounce} min={0} max={0.6} step={0.01} format={(v) => v.toFixed(2)} onChange={(bounce) => onChange({ ...value, bounce })} />
    </div>
  );
}
