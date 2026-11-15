import type { HaloWorld } from '@halo-ui/react';
import { useSettings } from '../lib/settings';
import { worlds } from '../lib/worlds';

const links = [
  ['Toast', '#toast'],
  ['Drawer', '#drawer'],
  ['Directions', '#directions'],
  ['Playground', '#playground'],
  ['Customize', '#customize'],
  ['Agents', '#agents'],
] as const;

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" fill="none" aria-hidden className={className}>
      <path d="M9 0v6M19 0v6" stroke="var(--wire)" />
      <rect x="2.75" y="6.75" width="22.5" height="12.5" rx="4.5" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}

export function Nav() {
  const { world, theme, setWorld, setTheme } = useSettings();
  return (
    <header className="sticky top-0 z-40 bg-wall/72 backdrop-blur-xl backdrop-saturate-150">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2 rounded-md text-ink no-underline">
          <Mark className="h-5 w-7" />
          <span className="font-display text-[19px] font-semibold tracking-[-0.02em]">halo</span>
        </a>
        <ul className="m-0 hidden list-none gap-1 p-0 md:flex">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="rounded-full px-3 py-1.5 text-[14px] text-ink-soft no-underline transition-colors duration-150 hover:text-ink">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          {/* The select itself is the whole pill, so a press anywhere on it opens the menu. */}
          <div className="relative h-9 rounded-full bg-ink/[0.06] text-[13px] text-ink transition-colors duration-150 hover:bg-ink/[0.1] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink">
            <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-faint">
              World
            </span>
            <select
              aria-label="Visual world"
              value={world}
              onChange={(event) => setWorld(event.target.value as HaloWorld)}
              className="h-full w-full cursor-pointer appearance-none rounded-full bg-transparent pr-8 pl-[58px] font-medium text-ink outline-none"
            >
              {worlds.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.name}
                </option>
              ))}
            </select>
            <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-soft">
              <path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="grid size-9 cursor-pointer place-items-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-ink/[0.07] hover:text-ink"
          >
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
              {theme === 'dark' ? (
                <>
                  <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ) : (
                <path d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
