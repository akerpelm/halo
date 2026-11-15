import type { BuildConfig } from '../lib/build';
import { Directions } from './directions';
import { Hero } from './hero';
import { NextSteps } from './next-steps';
import { ToastSection } from './toast-section';

/** The showcase, kept short: the flick test, what only Halo does, and the worlds. Reference lives in the docs. */
export function Home({ onOpenToast }: { onOpenToast: (config: BuildConfig) => void }) {
  return (
    <div>
      <Hero />
      <ToastSection />
      <Directions onOpenToast={onOpenToast} />
      <NextSteps />
    </div>
  );
}
