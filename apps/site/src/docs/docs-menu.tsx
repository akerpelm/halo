import { Drawer } from 'halo-ui-react/drawer';
import { type CSSProperties, useState } from 'react';
import { Link } from '../components/link';
import { cn } from '../lib/cn';
import { useSettings } from '../lib/settings';
import { themeFor } from '../lib/worlds';
import { type DocPage, docPages } from './pages';

const item = 'flex min-h-11 items-center rounded-xl px-3 text-body text-[var(--halo-fg)] no-underline';

export function DocsMenu({ page }: { page: DocPage }) {
  const { world, theme } = useSettings();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-wall/72 backdrop-blur-xl backdrop-saturate-150 lg:hidden" style={{ '--vt-name': 'docs-menu' } as CSSProperties}>
      <Drawer.Root open={open} onOpenChange={setOpen} world={world} theme={themeFor(world, theme)}>
        <Drawer.Trigger className="mx-auto flex h-12 w-full max-w-[1240px] cursor-pointer items-center gap-2 border-0 bg-transparent px-4 text-left text-ui text-ink sm:px-8">
          <span className="text-ink-faint">Docs</span>
          <svg aria-hidden width="8" height="8" viewBox="0 0 8 8" className="text-ink-faint">
            <path d="m2.5 1 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="min-w-0 flex-1 truncate font-medium">{page.title}</span>
          <span className="flex items-center gap-1.5 text-label text-ink-soft">
            Contents
            <svg aria-hidden width="10" height="10" viewBox="0 0 10 10">
              <path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Drawer.Trigger>
        <Drawer.Content className="px-4">
          <Drawer.Handle />
          <Drawer.Title className="sr-only">Documentation</Drawer.Title>
          <Drawer.Description className="sr-only">Every docs page, and the sections of {page.title}.</Drawer.Description>
          <Drawer.Scroll className="max-h-[70dvh] pb-6">
            <nav aria-label="Docs pages">
              <p className="m-0 mt-2 mb-1 px-3 text-caption font-medium tracking-[0.02em] text-[var(--halo-fg-muted)] uppercase">Pages</p>
              <ul className="m-0 grid list-none gap-0.5 p-0">
                {docPages.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/docs/${p.slug}`}
                      onClick={close}
                      aria-current={p.slug === page.slug ? 'page' : undefined}
                      className={cn(item, p.slug === page.slug && 'bg-[color-mix(in_oklch,var(--halo-fg)_9%,transparent)] font-medium')}
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="On this page">
              <p className="m-0 mt-5 mb-1 px-3 text-caption font-medium tracking-[0.02em] text-[var(--halo-fg-muted)] uppercase">On this page</p>
              <ul className="m-0 grid list-none gap-0.5 p-0">
                {page.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} onClick={close} className={cn(item, 'text-[var(--halo-fg-muted)]')}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Drawer.Scroll>
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
}
