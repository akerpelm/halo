import type { BuildConfig } from '../lib/build';
import { Agents } from './agents';
import { Directions } from './directions';
import { DrawerSection } from './drawer-section';
import { Hero } from './hero';
import { MakeItYours } from './make-it-yours';
import { PlaygroundTeaser } from './playground-teaser';
import { ToastSection } from './toast-section';

/** The showcase: a story you scroll. Reference lives in the docs; building lives in the playground. */
export function Home({ onOpenToast }: { onOpenToast: (config: BuildConfig) => void }) {
  return (
    <div>
      <Hero />
      <ToastSection />
      <DrawerSection />
      <Directions onOpenToast={onOpenToast} />
      <PlaygroundTeaser />
      <MakeItYours />
      <Agents />
    </div>
  );
}
