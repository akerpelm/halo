import { Toaster } from '@halo-ui/react/toast';
import { useState } from 'react';
import { Nav } from './components/nav';
import { type BuildConfig, PLAIN } from './lib/build';
import { useSettings } from './lib/settings';
import { Agents } from './sections/agents';
import { Directions } from './sections/directions';
import { DrawerSection } from './sections/drawer-section';
import { Footer } from './sections/footer';
import { Hero } from './sections/hero';
import { MakeItYours } from './sections/make-it-yours';
import { Playground } from './sections/playground';
import { ToastSection } from './sections/toast-section';

export function App() {
  const { world, theme } = useSettings();
  // The playground's toast, lifted so Directions can load setups into it.
  const [build, setBuild] = useState<BuildConfig>(PLAIN);

  return (
    <>
      <a
        href="#toast"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-full bg-ink px-4 py-2 text-ui text-wall no-underline focus-visible:translate-y-0"
      >
        Skip to the docs
      </a>
      <div data-halo-recess className="mullions min-h-dvh">
        <Nav />
        <main>
          <Hero />
          <ToastSection />
          <DrawerSection />
          <Directions onOpenToast={setBuild} />
          <Playground build={build} onBuild={setBuild} />
          <MakeItYours />
          <Agents />
        </main>
        <Footer />
      </div>
      <Toaster world={world} theme={theme} />
    </>
  );
}
