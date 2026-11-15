import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { useSettings } from '../lib/settings';
import { allWorlds, customWorlds, themeFor, worlds } from '../lib/worlds';
import { Segmented } from './segmented';

/** World and theme in one place, so the header carries one control instead of two. */
export function AppearanceMenu() {
  const { world, theme, setWorld, setTheme } = useSettings();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = allWorlds.find((w) => w.value === world);

  // Outside click and Escape close it; these are document-level subscriptions while it is open.
  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLElement>('input:checked, input')?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const option = (w: { value: string; name: string }) => (
    <label
      key={w.value}
      className={cn(
        'grid cursor-pointer justify-items-center gap-1.5 rounded-xl px-1 py-2 text-caption text-[var(--halo-fg)] transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--halo-focus)] pointer-coarse:py-3',
        world === w.value ? 'bg-[color-mix(in_oklch,var(--halo-fg)_12%,transparent)]' : 'hover:bg-[color-mix(in_oklch,var(--halo-fg)_6%,transparent)]',
      )}
    >
      <input type="radio" name={`${panelId}-world`} value={w.value} checked={world === w.value} onChange={() => setWorld(w.value)} className="sr-only" />
      <span data-halo-world={w.value} data-theme={theme} aria-hidden className="halo halo-surface block h-4 w-8 [--halo-radius:6px]" />
      {w.name}
    </label>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 cursor-pointer items-center gap-2 rounded-full bg-ink/[0.06] pr-3 pl-2 text-label text-ink transition-colors duration-150 hover:bg-ink/[0.1] pointer-coarse:h-11 dark:bg-ink/[0.09]"
      >
        <span data-halo-world={world} data-theme={themeFor(world, theme)} aria-hidden className="halo halo-surface block size-5 [--halo-radius:999px]" />
        <span className="max-sm:sr-only">{current?.name ?? 'Appearance'}</span>
        <span className="sr-only">: appearance settings</span>
        <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className={cn('text-ink-soft transition-transform duration-200', open && 'rotate-180')}>
          <path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div id={panelId} data-halo-world={world} data-theme={themeFor(world, theme)} className="halo halo-surface appearance-panel absolute top-full right-0 z-50 mt-2 w-[min(320px,calc(100vw-32px))] p-4 [--halo-radius:20px]">
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2 p-0 text-label font-medium text-[var(--halo-fg)]">World</legend>
            <div className="grid grid-cols-3 gap-1.5">
              {worlds.map(option)}
            </div>
            <p className="m-0 mt-3 mb-1.5 text-caption text-[var(--halo-fg-muted)]">Written in this site’s CSS</p>
            <div className="grid grid-cols-3 gap-1.5">
              {customWorlds.map(option)}
            </div>
          </fieldset>
          <div className="mt-4 [&_legend]:text-[var(--halo-fg)]">
            <Segmented
              label="Theme"
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
