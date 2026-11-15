import { buttonClass } from '../components/button';
import { Link } from '../components/link';

/** The home page's door into the playground, instead of the whole builder inline. */
export function PlaygroundTeaser() {
  return (
    <section aria-labelledby="playground-teaser" className="border-t border-line">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-24 sm:px-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h2 id="playground-teaser" className="m-0 text-[clamp(2.25rem,4.4vw,3.5rem)] leading-[1] font-semibold tracking-[-0.03em]">
            Start plain. Build it up.
          </h2>
          <p className="mt-5 mb-0 max-w-[48ch] text-lead leading-[1.55] text-ink-soft">
            The playground opens on the plainest toast there is. Layer on a world, an entrance, a spring, and colour, then take the code or an agent
            prompt.
          </p>
        </div>
        <div className="lg:col-span-5 lg:justify-self-end">
          <Link href="/playground" className={buttonClass({ tone: 'primary', size: 'lg' })}>
            Open the playground
          </Link>
        </div>
      </div>
    </section>
  );
}
