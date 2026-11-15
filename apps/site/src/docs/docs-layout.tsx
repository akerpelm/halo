import { Toaster } from '@halo-ui/react/toast';
import { Link } from '../components/link';
import { cn } from '../lib/cn';
import { useSettings } from '../lib/settings';
import { type DocPage, docPages } from './pages';
import { DocsSearch } from './search';
import { specimens } from './specimens';

/** Docs: a sidebar of pages, a reading column, and an outline of the current page. */
export function DocsLayout({ slug }: { slug: string }) {
  const { theme } = useSettings();
  const index = Math.max(0, docPages.findIndex((p) => p.slug === slug));
  const page = docPages[index] as DocPage;
  const previous = docPages[index - 1];
  const next = docPages[index + 1];

  return (
    <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-x-12 px-4 pt-6 pb-24 sm:px-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:pt-10 xl:grid-cols-[200px_minmax(0,1fr)_180px]">
      <Toaster id="custom" label="Midnight demo notifications" world="midnight" theme={theme} position="bottom-left" />

      <nav aria-label="Docs" className="min-w-0 max-lg:mb-8 lg:sticky lg:top-24 lg:self-start">
        <div className="mb-5">
          <DocsSearch />
        </div>
        <p className="m-0 mb-3 text-caption font-medium tracking-[0.02em] text-ink-faint uppercase max-lg:sr-only">Documentation</p>
        <ul className="m-0 flex list-none gap-1.5 overflow-x-auto p-0 [scrollbar-width:none] lg:grid lg:gap-0.5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {docPages.map((p) => (
            <li key={p.slug} className="flex-none">
              <Link
                href={`/docs/${p.slug}`}
                aria-current={p.slug === page.slug ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-9 items-center rounded-full px-3.5 text-ui no-underline transition-colors duration-150 pointer-coarse:min-h-11 lg:flex lg:rounded-lg lg:px-3',
                  p.slug === page.slug ? 'bg-ink/[0.08] font-medium text-ink' : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink max-lg:bg-ink/[0.04]',
                )}
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <article className="min-w-0">
        <header className="grid items-end gap-x-8 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div className="pb-2">
            <h1 className="m-0 text-[clamp(2.25rem,4.4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em]">{page.title}</h1>
            <p className="mt-4 mb-0 max-w-[60ch] text-lead leading-[1.55] text-ink-soft">{page.lede}</p>
          </div>
          {specimens[page.slug]?.()}
        </header>
        {page.body()}
        <nav aria-label="Previous and next" className="mt-16 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
          {previous ? (
            <Link href={`/docs/${previous.slug}`} className="group grid rounded-2xl p-4 no-underline shadow-[inset_0_0_0_1px_var(--line)] transition-colors hover:bg-ink/[0.03]">
              <span className="text-label text-ink-faint">Previous</span>
              <span className="text-body font-medium text-ink">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/docs/${next.slug}`} className="grid rounded-2xl p-4 text-right no-underline shadow-[inset_0_0_0_1px_var(--line)] transition-colors hover:bg-ink/[0.03]">
              <span className="text-label text-ink-faint">Next</span>
              <span className="text-body font-medium text-ink">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>

      <nav aria-label="On this page" className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
        <p className="m-0 mb-3 text-caption font-medium tracking-[0.02em] text-ink-faint uppercase">On this page</p>
        <ul className="m-0 grid list-none gap-1.5 border-l border-line p-0">
          {page.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-3 text-label text-ink-soft no-underline hover:border-ink hover:text-ink">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
