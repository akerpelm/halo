import type { ReactNode } from 'react';
import { useSettings } from '../lib/settings';
import { themeFor } from '../lib/worlds';

/**
 * A group of reference, hung like the landing page's wall labels: a pane of the visitor's
 * current world on two short wires. Static, so a page of them costs nothing to scroll.
 */
export function Plaque({ id, title, count, children }: { id: string; title: string; count?: number; children: ReactNode }) {
  const { world, theme } = useSettings();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-10 scroll-mt-32 lg:scroll-mt-24">
      <svg aria-hidden viewBox="0 0 100 28" preserveAspectRatio="none" className="block h-7 w-full overflow-visible">
        <line x1="12" y1="0" x2="12" y2="28" stroke="var(--wire)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="88" y1="0" x2="88" y2="28" stroke="var(--wire)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div data-halo-world={world} data-theme={themeFor(world, theme)} className="halo halo-surface relative px-5 pt-4 pb-1 [--halo-radius:18px] sm:px-6">
        {[12, 88].map((x) => (
          <span key={x} aria-hidden className="absolute -top-[5px] size-[10px] -translate-x-1/2 rounded-full border-[1.5px] border-wire bg-wall" style={{ left: `${x}%` }} />
        ))}
        <h3 id={`${id}-title`} className="m-0 flex items-baseline justify-between gap-4 font-display text-title font-semibold tracking-[-0.015em] text-[var(--halo-fg)]">
          {title}
          {count !== undefined && <span className="font-sans text-label font-normal text-[var(--halo-fg-muted)]">{count} props</span>}
        </h3>
        {children}
      </div>
    </section>
  );
}
