import { DocsSearch } from '../docs/search';
import { useCurrentPath } from '../lib/router';
import { AppearanceMenu } from './appearance-menu';
import { Link } from './link';

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden className={className}>
      <path d="M9 0v6M19 0v6" stroke="var(--wire)" />
      <rect x="2.75" y="6.75" width="22.5" height="12.5" rx="4.5" stroke="var(--ink)" strokeWidth="1.5" />
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
    <header className="sticky top-0 z-40 bg-wall/72 backdrop-blur-xl backdrop-saturate-150" style={{ viewTransitionName: 'site-header' }}>
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1240px] items-center gap-2 px-4 sm:gap-6 sm:px-8">
        <Link href="/" aria-label="Halo, home" className="flex items-center gap-2 rounded-md text-ink no-underline pointer-coarse:min-h-11">
          <Mark className="h-5 w-7" />
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
