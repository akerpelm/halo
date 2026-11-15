import { useId } from 'react';

type ToggleProps = { label: string; checked: boolean; onChange: (checked: boolean) => void };

export function Toggle({ label, checked, onChange }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 text-[13px]">
      <label htmlFor={id} className="cursor-pointer text-ink-soft">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="group relative h-6 w-10 flex-none cursor-pointer rounded-full bg-ink/[0.12] transition-colors duration-200 aria-checked:bg-ink"
      >
        <span
          aria-hidden
          className="absolute top-0.5 left-0.5 size-5 rounded-full bg-wall shadow-[0_1px_2px_oklch(0%_0_0/0.25)] transition-transform duration-[620ms] ease-spring group-aria-checked:translate-x-4"
        />
      </button>
    </div>
  );
}
