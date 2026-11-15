import type { CSSProperties, ReactNode } from 'react';
import { type DrawerConfig, drawerRadius, snapPresets } from '../lib/config';
import { useSettings } from '../lib/settings';
import { themeFor } from '../lib/worlds';
import { cn } from '../lib/cn';

/** What "Fit" looks like in the miniature: a sheet sized to its content, or a side panel. */
const FIT = { vertical: 0.5, horizontal: 0.36 };

const padding = { compact: 'p-2', comfortable: 'p-3', spacious: 'p-4' } as const;

/**
 * A miniature screen showing the drawer at rest: its edge, its tallest detent, the other detents
 * as marks, its corners, and the current world. The real drawer opens from the button inside.
 */
export function DrawerStage({ config, children, className }: { config: DrawerConfig; children: ReactNode; className?: string }) {
  const { world, theme } = useSettings();
  const vertical = config.side === 'bottom' || config.side === 'top';
  const fit = vertical ? FIT.vertical : FIT.horizontal;
  const snaps = snapPresets[config.snapPoints] ?? [fit];
  // The drawer opens at its first detent; the larger ones show as marks it can be pulled to.
  const reach = snaps[0] ?? fit;
  // Half size, like everything else in the miniature.
  const radius = `${drawerRadius[config.radius] / 2}px`;
  const corners: Record<DrawerConfig['side'], CSSProperties> = {
    bottom: { borderTopLeftRadius: radius, borderTopRightRadius: radius },
    top: { borderBottomLeftRadius: radius, borderBottomRightRadius: radius },
    left: { borderTopRightRadius: radius, borderBottomRightRadius: radius },
    right: { borderTopLeftRadius: radius, borderBottomLeftRadius: radius },
  };
  // The pane fills the stage and slides in from its edge, so changes animate transform only.
  const hidden = `${(1 - reach) * 100}%`;
  const offset: Record<DrawerConfig['side'], string> = {
    bottom: `translateY(${hidden})`,
    top: `translateY(-${hidden})`,
    left: `translateX(-${hidden})`,
    right: `translateX(${hidden})`,
  };
  const mark = (fraction: number): CSSProperties => ({ [config.side]: `${fraction * 100}%` });

  return (
    <div data-world={world} className={cn('relative overflow-hidden rounded-2xl bg-wall-deep', className)} aria-label="Drawer preview" role="region">
      {snaps.length > 1 &&
        snaps.slice(1).map((fraction) => (
          <span
            key={fraction}
            aria-hidden
            style={mark(fraction)}
            className={cn('pointer-events-none absolute z-10 border-dashed border-ink-faint/60', vertical ? 'inset-x-0 border-t' : 'inset-y-0 border-l')}
          />
        ))}
      <div
        aria-hidden
        data-halo-world={world}
        data-theme={themeFor(world, theme)}
        style={{ ...corners[config.side], transform: offset[config.side], [config.side]: 0 }}
        className={cn(
          'halo halo-surface pointer-events-none absolute grid content-start gap-1.5 transition-transform duration-500 ease-spring motion-reduce:transition-none',
          vertical ? 'inset-x-0 h-full' : 'inset-y-0 w-full',
          padding[config.density],
        )}
      >
        {vertical && <span className="mx-auto mb-1 h-1 w-8 rounded-full bg-[var(--halo-fg-muted)] opacity-50" />}
        <span className="h-2 w-1/3 max-w-40 rounded-full bg-[var(--halo-fg)] opacity-70" />
        <span className="h-1.5 w-1/2 max-w-60 rounded-full bg-[var(--halo-fg-muted)] opacity-50" />
        <span className="h-1.5 w-2/5 max-w-48 rounded-full bg-[var(--halo-fg-muted)] opacity-50" />
      </div>
      {/* Floats in the corner away from the drawer's edge, above the miniature. */}
      <div className={cn('absolute z-20', config.side === 'top' ? 'bottom-3' : 'top-3', config.side === 'right' ? 'left-3' : 'right-3')}>{children}</div>
    </div>
  );
}
