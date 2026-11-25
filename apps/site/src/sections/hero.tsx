import { Button } from '../components/button';
import { HangingPane } from '../components/hanging-pane';
import { InstallChip } from '../components/install-chip';
import { Link } from '../components/link';
import { Magnet } from '../components/magnet';
import { fireNextDemo } from '../lib/demo-toasts';
import { reactPeer, sizes, version } from '../lib/package-facts';
import { GITHUB_URL, NPM_URL } from '../lib/site';

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative -mt-16 overflow-x-clip">
      <HangingPane ceiling={64} className="absolute inset-0 hidden lg:block" anchorClassName="top-[22%] right-[max(4%,calc(50%-600px))] w-[min(560px,40vw)]" />

      <div className="relative z-[15] mx-auto flex max-w-[1240px] flex-col px-4 pt-28 sm:px-8 md:pt-32 lg:min-h-[min(100svh,980px)] lg:justify-end lg:pb-24">
        <p className="m-0 mb-5 text-ui font-medium text-ink-soft">An alternative to Sonner and Vaul</p>
        <h1 id="hero-heading" className="m-0 max-w-[12ch] text-[clamp(3rem,7.6vw,6rem)] leading-[0.94] font-semibold tracking-[-0.035em]">
          Components that keep the speed of your flick.
        </h1>
        <p className="mt-7 mb-0 max-w-[44ch] text-[clamp(17px,1.5vw,19px)] leading-[1.55] text-ink-soft">
          A spring-physics toast, drawer, popover and swipe actions for React. The toast takes Sonner’s calls, the drawer keeps Vaul’s part names on a
          native dialog, and all four work by keyboard and screen reader.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Magnet>
            <Button tone="primary" size="lg" onClick={(event) => fireNextDemo(event.currentTarget)}>
              Fire a toast
            </Button>
          </Magnet>
          <InstallChip />
          <Link href="/docs/getting-started" className="inline-flex min-h-11 items-center rounded-md px-1 text-ui font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
            Read the docs<span aria-hidden>&nbsp;→</span>
          </Link>
        </div>
        <ul aria-label="At a glance" className="m-0 mt-8 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-label text-ink-faint">
          <li>
            <a href={NPM_URL} className="text-ink-soft no-underline hover:text-ink">
              v{version}
            </a>
          </li>
          <li>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} className="text-ink-soft no-underline hover:text-ink">
              MIT
            </a>
          </li>
          <li>
            Toast {sizes.toast} kB, Drawer {sizes.drawer} kB, Popover {sizes.popover} kB, Swipe {sizes.swipe} kB <span className="sr-only">minified and gzipped</span>
            <span aria-hidden>min+gzip</span>
          </li>
          <li>No dependencies</li>
          <li>React {reactPeer}+</li>
        </ul>
      </div>

      <HangingPane className="relative h-[300px] lg:hidden" anchorClassName="inset-x-0 mx-auto top-[56px] w-[min(400px,calc(100%-32px))]" paneClassName="p-5 [--halo-radius:22px]" />
    </section>
  );
}
