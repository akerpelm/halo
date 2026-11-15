import { type SelectHTMLAttributes, useId } from 'react';
import { cn } from '../lib/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string };

/** A native select (keyboard and screen readers for free) with the chevron inset like every other control. */
export function Select({ label, className, children, ...props }: SelectProps) {
  const id = useId();
  return (
    <div className={cn('grid gap-2', className)}>
      <label htmlFor={id} className="text-label text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="h-10 w-full cursor-pointer appearance-none pointer-coarse:h-11 rounded-full border-0 bg-ink/[0.06] pr-10 pl-4 text-ui text-ink transition-colors duration-150 hover:bg-ink/[0.1] dark:bg-ink/[0.09]"
          {...props}
        >
          {children}
        </select>
        <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-soft">
          <path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
