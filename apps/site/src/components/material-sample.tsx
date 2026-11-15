import type { HaloWorld } from '@halo-ui/react';
import { useSettings } from '../lib/settings';
import { Spotlight } from './spotlight';

/**
 * A swatch of each material over a strip of wall, lit from the pointer like a gallery spot.
 * The light also turns the pane, so the dichroic coat shifts hue the way it does in motion.
 */
export function MaterialSample({ world }: { world: HaloWorld }) {
  const { theme } = useSettings();
  return (
    <Spotlight data-world={world} className="grid h-44 place-items-center rounded-2xl bg-wall-deep px-6">
      <span aria-hidden className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 text-center font-display text-[120px] leading-none font-semibold tracking-[-0.04em] text-ink/25">
        Halo
      </span>
      {world === 'dichroic' && (
        <span aria-hidden className="cast absolute inset-0">
          <span className="pool top-[48%] left-[22%] h-24 w-40 bg-coat-a" />
          <span className="pool top-[54%] right-[18%] h-24 w-40 bg-coat-b" />
        </span>
      )}
      <div
        aria-hidden
        data-halo-world={world}
        data-theme={theme}
        className="halo halo-surface flex w-full max-w-[280px] min-w-0 items-start gap-3 px-4 py-3.5"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="mt-px flex-none text-[var(--halo-success)]">
          <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="m6.5 10.2 2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="min-w-0 text-[14px] leading-snug">
          <span className="block font-semibold">Invite sent</span>
          <span className="block truncate text-[var(--halo-fg-muted)]">mara@studio.example</span>
        </span>
      </div>
    </Spotlight>
  );
}
