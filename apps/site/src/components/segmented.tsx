import { useId } from 'react';
import { cn } from '../lib/cn';

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  hideLabel?: boolean;
  className?: string;
};

/** A radio group drawn as a segmented control. Arrow keys move between options natively. */
export function Segmented<T extends string>({ label, value, options, onChange, hideLabel, className }: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className={cn('mb-2 text-label text-ink-soft', hideLabel && 'sr-only')}>{label}</legend>
      <div className="grid w-full auto-cols-fr grid-flow-col gap-0.5 rounded-full bg-ink/[0.06] p-0.5 dark:bg-ink/[0.09]">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'relative min-w-0 cursor-pointer truncate rounded-full px-2 py-2 text-center text-label leading-none pointer-coarse:py-[15px] transition-colors duration-150 select-none',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink has-[:focus-visible]:outline-offset-1',
              option.value === value ? 'bg-wall text-ink shadow-[0_1px_2px_oklch(0%_0_0/0.12)]' : 'text-ink-soft hover:text-ink',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
