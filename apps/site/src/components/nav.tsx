import { type CSSProperties, useId } from 'react';
import { DocsSearch } from '../docs/search';
import { useCurrentPath } from '../lib/router';
import { AppearanceMenu } from './appearance-menu';
import { Link } from './link';

/**
 * The mark: the front arc of a tilted ring. The missing top is what makes it read as 3D.
 * A fixed Dichroic gradient, not the current world's coat, so it never fades into the wall.
 */
export function Mark({ className }: { className?: string }) {
  const gradient = useId();
  return (
    <svg viewBox="0 0 28 10" aria-hidden className={className}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0" stopColor="oklch(80% 0.14 198)" />
          <stop offset="0.55" stopColor="oklch(69% 0.22 332)" />
          <stop offset="1" stopColor="oklch(85% 0.14 78)" />
        </linearGradient>
      </defs>
      <path d="M1 1A13 8 0 0 0 27 1A13 3.6 0 0 1 1 1Z" fill={`url(#${gradient})`} />
    </svg>
  );
}

/** Three surfaces, one search, one appearance menu. Sections belong to the page, not the header. */
const surfaces = [
  ['Docs', '/docs/getting-started', '/docs'],
  ['Playground', '/playground', '/playground'],
] as const;

export function Nav() {
  const path = useCurrentPath();
  return (
    <header className="sticky top-0 z-40 bg-wall/72 backdrop-blur-xl backdrop-saturate-150" style={{ '--vt-name': 'site-header' } as CSSProperties}>
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1240px] items-center gap-2 px-4 sm:gap-6 sm:px-8">
        <Link href="/" aria-label="Halo, home" className="flex items-center gap-2 rounded-md text-ink no-underline pointer-coarse:min-h-11">
          <Mark className="mt-1.5 h-[10px] w-7" />
          <span className="font-display text-title font-semibold tracking-[-0.02em]">halo</span>
        </Link>
        <ul className="m-0 flex list-none gap-0.5 p-0">
          {surfaces.map(([label, href, prefix]) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={path.startsWith(prefix) ? 'page' : undefined}
                className="inline-flex min-h-9 items-center rounded-full px-3 text-ui text-ink-soft no-underline transition-colors duration-150 hover:text-ink aria-[current=page]:bg-ink/[0.06] aria-[current=page]:font-medium aria-[current=page]:text-ink pointer-coarse:min-h-11 dark:aria-[current=page]:bg-ink/[0.09]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-10 sm:w-56">
            <DocsSearch />
          </div>
          <AppearanceMenu />
        </div>
      </nav>
    </header>
  );
}
