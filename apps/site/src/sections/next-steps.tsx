import { buttonClass } from '../components/button';
import { DemoDrawer } from '../components/demo-drawer';
import { Link } from '../components/link';

const doors = [
  { title: 'Build your own', body: 'Start from the plainest toast and layer it up. Take the code or an agent prompt.', href: '/playground', cta: 'Open the playground' },
  { title: 'The drawer', body: 'A sheet from any edge on the native dialog, with projected detents.', href: '/docs/drawer', cta: 'Drawer docs' },
  { title: 'Hand it to an agent', body: 'One plain-text file with the whole API, plus recipes for migrating from Sonner and Vaul.', href: '/docs/agents', cta: 'For agents' },
] as const;

/** Where the home page ends: three doors instead of three more sections. */
export function NextSteps() {
  return (
    <section aria-labelledby="next-steps" className="border-t border-line">
      <div className="mx-auto max-w-[1240px] px-4 py-24 sm:px-8">
        <h2 id="next-steps" className="m-0 text-[clamp(2.25rem,4.4vw,3.5rem)] leading-[1] font-semibold tracking-[-0.03em]">
          Where next
        </h2>
        <ul className="m-0 mt-10 grid list-none gap-x-8 gap-y-10 p-0 md:grid-cols-3">
          {doors.map((door) => (
            <li key={door.href} className="grid content-start gap-3 border-t border-line pt-4">
              <h3 className="m-0 font-display text-title font-semibold tracking-[-0.015em]">{door.title}</h3>
              <p className="m-0 text-body leading-[1.55] text-ink-soft">{door.body}</p>
              <div className="flex flex-wrap gap-2">
                <Link href={door.href} className={buttonClass({ tone: door.href === '/playground' ? 'primary' : 'outline', size: 'sm' })}>
                  {door.cta}
                </Link>
                {door.href === '/docs/drawer' && <DemoDrawer trigger="Open one" size="sm" />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
