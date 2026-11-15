import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** A section heading with a copyable anchor, the way docs readers expect. */
export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="group mt-14 mb-3 scroll-mt-32 text-heading font-semibold tracking-[-0.02em] text-ink lg:scroll-mt-24">
      {children}
      <a href={`#${id}`} className="ml-2 text-ink-faint no-underline opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100" aria-label={`Link to ${typeof children === 'string' ? children : 'this section'}`}>
        #
      </a>
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 mb-2 text-title font-semibold tracking-[-0.015em] text-ink">{children}</h3>;
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('my-4 max-w-[68ch] text-body leading-[1.7] text-ink-soft', className)}>{children}</p>;
}

export function C({ children }: { children: ReactNode }) {
  return <code className="rounded-md bg-ink/[0.06] px-1.5 py-0.5 text-[0.88em] text-ink dark:bg-ink/[0.1]">{children}</code>;
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="my-4 grid max-w-[68ch] gap-2 pl-5 text-body leading-[1.6] text-ink-soft marker:text-ink-faint">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** A tip or caveat. Set off by a hairline and a label, never a coloured side-stripe. */
export function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="my-6 max-w-[68ch] rounded-2xl bg-wall-deep/70 p-5 shadow-[inset_0_0_0_1px_var(--line)]">
      <p className="m-0 text-label font-semibold text-ink">{title}</p>
      <div className="mt-1 text-ui leading-[1.6] text-ink-soft">{children}</div>
    </aside>
  );
}
