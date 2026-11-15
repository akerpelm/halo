import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { navigate } from '../lib/router';
import { useSettings } from '../lib/settings';
import { themeFor } from '../lib/worlds';
import { type PropRow, drawerParts, drawerRootProps, selectors, toastFunctions, toastOptions, toasterProps, tokens } from './api';
import { docPages } from './pages';
import { propId } from './prop-table';

type Entry = { label: string; kind: 'Page' | 'Section' | 'Function' | 'Option' | 'Prop' | 'Part' | 'Token' | 'Selector'; href: string; hint: string };

function buildIndex(): Entry[] {
  const entries: Entry[] = [
    { label: 'Home', kind: 'Page', href: '/', hint: 'The showcase: flick test, worlds, and what only Halo does.' },
    { label: 'Playground', kind: 'Page', href: '/playground', hint: 'Start from a plain toast and layer it up. Take the code or an agent prompt.' },
  ];
  for (const page of docPages) {
    entries.push({ label: page.title, kind: 'Page', href: `/docs/${page.slug}`, hint: page.lede });
    for (const s of page.sections) entries.push({ label: s.title, kind: 'Section', href: `/docs/${page.slug}#${s.id}`, hint: page.title });
  }
  const rows = (list: readonly PropRow[], kind: Entry['kind'], slug: string, where: string) => {
    for (const r of list) entries.push({ label: r.name, kind, href: `/docs/${slug}#${propId(r.name)}`, hint: `${where} · ${r.description}` });
  };
  rows(toastFunctions, 'Function', 'toast', 'Toast');
  rows(toastOptions, 'Option', 'toast', 'Toast option');
  rows(toasterProps, 'Prop', 'toast', 'Toaster');
  rows(drawerRootProps, 'Prop', 'drawer', 'Drawer.Root');
  rows(drawerParts, 'Part', 'drawer', 'Drawer');
  rows(tokens, 'Token', 'customize', 'Customize');
  rows(selectors, 'Selector', 'customize', 'Customize');
  return entries;
}

function rank(entry: Entry, query: string) {
  const label = entry.label.toLowerCase();
  if (label.startsWith(query)) return 0;
  if (label.includes(query)) return 1;
  if (entry.hint.toLowerCase().includes(query)) return 2;
  return -1;
}

export function DocsSearch() {
  const { world, theme } = useSettings();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.filter((e) => e.kind === 'Page');
    return index
      .map((e) => ({ e, r: rank(e, q) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r)
      .slice(0, 12)
      .map((x) => x.e);
  }, [index, query]);

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery('');
    setActive(0);
    dialog.showModal();
    inputRef.current?.focus();
  };
  const close = () => dialogRef.current?.close();
  const go = (entry: Entry | undefined) => {
    if (!entry) return;
    close();
    navigate(entry.href);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable]');
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const optionId = (i: number) => `${listId}-option-${i}`;

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-keyshortcuts="Meta+K Control+K /"
        className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-full bg-ink/[0.06] pr-2 pl-3.5 max-md:justify-center max-md:px-0 text-ui text-ink-soft transition-colors duration-150 hover:bg-ink/[0.1] hover:text-ink pointer-coarse:h-11 dark:bg-ink/[0.09]"
      >
        <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="flex-1 text-left max-md:sr-only">Search</span>
        <kbd aria-hidden className="rounded-md px-1.5 py-0.5 font-sans text-caption text-ink-faint shadow-[inset_0_0_0_1px_var(--line)] max-md:hidden">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search the docs"
        className="docs-search m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-transparent"
        onClick={(event) => event.target === event.currentTarget && close()}
      >
        <div className="flex h-full items-start justify-center bg-[var(--halo-overlay,oklch(30%_0.03_262/0.24))] px-4 pt-[12vh]" onClick={(event) => event.target === event.currentTarget && close()}>
          <div data-halo-world={world} data-theme={themeFor(world, theme)} className="halo halo-surface docs-search-panel w-full max-w-[600px] overflow-hidden [--halo-radius:20px]">
            <div className="flex items-center gap-3 border-b border-[color-mix(in_oklch,var(--halo-fg)_12%,transparent)] px-4">
              <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-none text-[var(--halo-fg-muted)]">
                <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
                <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={results[active] ? optionId(active) : undefined}
                aria-label="Search pages, props, tokens, and selectors"
                placeholder="Search pages, props, tokens…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setActive((i) => Math.min(i + 1, results.length - 1));
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setActive((i) => Math.max(i - 1, 0));
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    go(results[active]);
                  }
                }}
                className="h-14 flex-1 bg-transparent text-lead text-[var(--halo-fg)] outline-none placeholder:text-[var(--halo-fg-muted)]"
              />
              <kbd className="rounded-md px-1.5 py-0.5 text-caption text-[var(--halo-fg-muted)] shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--halo-fg)_18%,transparent)]">Esc</kbd>
            </div>
            <ul id={listId} role="listbox" aria-label="Results" className="m-0 max-h-[50vh] list-none overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-6 text-center text-ui text-[var(--halo-fg-muted)]">Nothing matches “{query}”.</li>}
              {results.map((entry, i) => (
                <li
                  key={entry.href + entry.label}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(entry)}
                  className={cn('grid cursor-pointer gap-0.5 rounded-xl px-3 py-2.5', i === active && 'bg-[color-mix(in_oklch,var(--halo-fg)_9%,transparent)]')}
                >
                  <span className="flex items-baseline gap-2">
                    <span className={cn('truncate text-ui font-medium text-[var(--halo-fg)]', entry.kind !== 'Page' && entry.kind !== 'Section' && 'font-mono')}>{entry.label}</span>
                    <span className="flex-none text-caption text-[var(--halo-fg-muted)]">{entry.kind}</span>
                  </span>
                  <span className="truncate text-label text-[var(--halo-fg-muted)]">{entry.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </dialog>
    </>
  );
}
