import { buttonClass } from '../components/button';
import { Link } from '../components/link';

export function NotFound() {
  return (
    <section aria-labelledby="not-found-heading" className="mx-auto max-w-[1240px] px-4 pt-24 pb-32 sm:px-8 lg:pt-32">
      <p className="m-0 font-mono text-label text-ink-faint">404</p>
      <h1 id="not-found-heading" className="mt-3 mb-0 max-w-[15ch] text-[clamp(2.25rem,4.4vw,3.5rem)] leading-[1] font-semibold tracking-[-0.03em]">
        This page isn’t hanging here.
      </h1>
      <p className="mt-5 mb-0 max-w-[44ch] text-lead leading-[1.55] text-ink-soft">The link may be old, or the address mistyped. The docs and the playground are a click away.</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link href="/docs/getting-started" className={buttonClass({ tone: 'primary', size: 'md' })}>
          Read the docs
        </Link>
        <Link href="/" className={buttonClass({ tone: 'outline', size: 'md' })}>
          Go home
        </Link>
      </div>
    </section>
  );
}
