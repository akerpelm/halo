import { useId } from 'react';

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  onChange: (value: number) => void;
};

export function Slider({ label, value, min, max, step, format = String, onChange }: SliderProps) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-label">
        <label htmlFor={id} className="text-ink-soft">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-caption text-ink tabular-nums">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-6 w-full cursor-pointer pointer-coarse:h-11"
      />
    </div>
  );
}
