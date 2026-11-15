import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type SectionProps = {
  id: string;
  title: string;
  lede: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Heading row on top and content across the full width, for tools that need room. */
  wide?: boolean;
};

export function Section({ id, title, lede, aside, children, className, wide = false }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cn('scroll-mt-28 border-t border-line md:scroll-mt-16', className)}>
      <div className="mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 px-4 pt-24 pb-24 sm:px-8 lg:grid-cols-12 lg:pt-32">
        <div className={wide ? 'grid gap-x-12 gap-y-6 lg:col-span-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end' : 'lg:col-span-4'}>
          <h2 id={headingId} className="m-0 text-[clamp(2.25rem,4.4vw,3.5rem)] leading-[1] font-semibold tracking-[-0.03em]">
            {title}
          </h2>
          <div className="mt-5 max-w-[40ch] text-lead leading-[1.55] text-ink-soft">{lede}</div>
          {aside && <div className={wide ? 'lg:col-start-2 lg:row-start-1 lg:row-span-2' : 'mt-10'}>{aside}</div>}
        </div>
        <div className={wide ? 'min-w-0 lg:col-span-12' : 'min-w-0 lg:col-span-8'}>{children}</div>
      </div>
    </section>
  );
}
