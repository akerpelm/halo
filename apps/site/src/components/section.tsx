import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type SectionProps = {
  id: string;
  title: string;
  lede: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Section({ id, title, lede, aside, children, className }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cn('scroll-mt-16 border-t border-line', className)}>
      <div className="mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 px-4 pt-24 pb-24 sm:px-8 lg:grid-cols-12 lg:pt-32">
        <div className="lg:col-span-4">
          <h2 id={headingId} className="m-0 text-[clamp(2.25rem,4.4vw,3.5rem)] leading-[1] font-semibold tracking-[-0.03em]">
            {title}
          </h2>
          <div className="mt-5 max-w-[40ch] text-[17px] leading-[1.55] text-ink-soft">{lede}</div>
          {aside && <div className="mt-10">{aside}</div>}
        </div>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}
