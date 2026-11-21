import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type WallLabelProps = {
  title: string;
  date: string;
  medium: string;
  rows: ReadonlyArray<readonly [string, ReactNode]>;
  className?: string;
};

export function WallLabel({ title, date, medium, rows, className }: WallLabelProps) {
  return (
    <aside className={cn('max-w-[300px] text-label leading-[1.5]', className)} aria-label={`${title} specification`}>
      <p className="m-0 font-display text-lead font-semibold text-[var(--halo-fg)]">
        <span>{title}</span>, <span className="font-normal text-[var(--halo-fg-muted)]">{date}</span>
      </p>
      <p className="m-0 mt-0.5 text-[var(--halo-fg-muted)] italic">{medium}</p>
      <dl className="m-0 mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {rows.map(([term, detail]) => (
          <div key={term} className="contents">
            <dt className="text-[var(--halo-fg-muted)]">{term}</dt>
            <dd className="m-0 text-[var(--halo-fg)]">{detail}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
