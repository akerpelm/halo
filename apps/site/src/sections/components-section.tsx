import type { ReactNode } from 'react';
import { buttonClass } from '../components/button';
import { DemoDrawer } from '../components/demo-drawer';
import { DemoPopover } from '../components/demo-popover';
import { DemoSwipe } from '../components/demo-swipe';
import { Link } from '../components/link';
import { Section } from '../components/section';
import { cn } from '../lib/cn';
import { sizes } from '../lib/package-facts';

type Piece = { title: string; size: number; body: string; href: string; demo: ReactNode; tall?: boolean };

const pieces: ReadonlyArray<Piece> = [
  {
    title: 'Drawer',
    size: sizes.drawer,
    body: 'A sheet from any edge on the native dialog. Flick it and it lands on the detent your momentum was heading for.',
    href: '/docs/drawer',
    demo: <DemoDrawer trigger="Open the drawer" size="sm" />,
  },
  {
    title: 'Popover',
    size: sizes.popover,
    body: 'On the native popover API and CSS anchor positioning. It grows out of its trigger, and the light gathers on the edge that faces it.',
    href: '/docs/popover',
    demo: <DemoPopover trigger="Share" size="sm" />,
  },
  {
    title: 'Swipe actions',
    size: sizes.swipe,
    body: 'Rows that slide to uncover real buttons. A full flick runs the action; Tab reaches the same buttons without a swipe.',
    href: '/docs/swipe',
    demo: <DemoSwipe />,
    tall: true,
  },
];

export function ComponentsSection() {
  return (
    <Section
      id="components"
      title="Three more on the same spring"
      lede="The drawer, popover and swipe actions share the toast’s spring engine and glass, and lean on the browser’s own primitives where one exists."
      wide
    >
      <ul className="m-0 grid list-none gap-x-12 gap-y-12 p-0 lg:grid-cols-2">
        {pieces.map((piece) => (
          <li key={piece.href} className={cn('grid content-start gap-3 border-t border-line pt-4', piece.tall && 'lg:col-start-2 lg:row-span-2 lg:row-start-1')}>
            <h3 className="m-0 flex items-baseline justify-between gap-3 font-display text-title font-semibold tracking-[-0.015em]">
              {piece.title}
              <span className="font-sans text-label font-normal text-ink-faint">{piece.size} kB</span>
            </h3>
            <p className="m-0 text-body leading-[1.55] text-pretty text-ink-soft">{piece.body}</p>
            <div className="mt-1">{piece.demo}</div>
            <Link href={piece.href} className={cn(buttonClass({ tone: 'outline', size: 'sm' }), 'justify-self-start')}>
              {piece.title} docs
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
