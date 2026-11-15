import type { ReactNode } from 'react';
import { useSettings } from '../lib/settings';
import { themeFor } from '../lib/worlds';

export function Plaque({ id, title, count, children }: { id: string; title: string; count?: number; children: ReactNode }) {
  const { world, theme } = useSettings();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-10 scroll-mt-32 lg:scroll-mt-24">
      <svg aria-hidden viewBox="0 0 100 28" preserveAspectRatio="none" className="rig block h-7 w-full overflow-visible [mask-image:linear-gradient(to_bottom,transparent,black_70%)]">
        {[12, 88].map((x) => (
          <g key={x}>
            <line className="rig-cable" x1={x} y1="0" x2={x} y2="28" vectorEffect="non-scaling-stroke" />
            <line className="rig-sheen" x1={x} y1="0" x2={x} y2="28" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      <div data-halo-world={world} data-theme={themeFor(world, theme)} className="halo halo-surface relative px-5 pt-4 pb-1 [--halo-radius:18px] sm:px-6">
        {[12, 88].map((x) => (
          <span key={x} aria-hidden className="rig rig-clamp" style={{ left: `${x}%` }} />
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
