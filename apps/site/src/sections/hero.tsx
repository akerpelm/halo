import { Button } from '../components/button';
import { DemoDrawer } from '../components/demo-drawer';
import { HangingPane } from '../components/hanging-pane';
import { InstallChip } from '../components/install-chip';
import { fireNextDemo } from '../lib/demo-toasts';

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative -mt-16 overflow-x-clip">
      {/* Desktop: the pane hangs in front of the wall text, so the glass frosts real letters. */}
      <HangingPane ceiling={64} className="absolute inset-0 hidden lg:block" anchorClassName="top-[22%] right-[max(4%,calc(50%-600px))] w-[min(560px,40vw)]" />

      <div className="relative z-[15] mx-auto flex max-w-[1240px] flex-col px-4 pt-32 sm:px-8 lg:min-h-[min(100svh,980px)] lg:justify-end lg:pb-24">
        <h1 id="hero-heading" className="m-0 max-w-[15ch] text-[clamp(3rem,7.6vw,6rem)] leading-[0.94] font-semibold tracking-[-0.035em]">
          Surfaces that move like they weigh something.
        </h1>
        <p className="mt-7 mb-0 max-w-[44ch] text-[clamp(17px,1.5vw,19px)] leading-[1.55] text-ink-soft">
          Halo is a toast and a drawer for React, built on one spring engine. Frosted glass, accessible from the first keystroke, and simple to hand
          to an AI agent.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button tone="primary" size="lg" onClick={fireNextDemo}>
            Fire a toast
          </Button>
          <DemoDrawer trigger="Open the drawer" />
          <InstallChip />
        </div>
      </div>

      {/* Small screens: the pane hangs below the copy instead. */}
      <HangingPane className="relative h-[440px] lg:hidden" anchorClassName="inset-x-0 mx-auto top-[110px] w-[min(400px,calc(100%-32px))]" />
    </section>
  );
}
