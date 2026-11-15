import { Toaster } from '@halo-ui/react/toast';
import { useState } from 'react';
import { Nav } from './components/nav';
import { type ToastConfig, defaultToastConfig } from './lib/config';
import { useSettings } from './lib/settings';
import { Agents } from './sections/agents';
import { Directions } from './sections/directions';
import { DrawerSection } from './sections/drawer-section';
import { Footer } from './sections/footer';
import { Hero } from './sections/hero';
import { Playground } from './sections/playground';
import { ToastSection } from './sections/toast-section';

export function App() {
  const { world, theme } = useSettings();
  const [toastConfig, setToastConfig] = useState<ToastConfig>(defaultToastConfig);

  return (
    <>
      <a
        href="#toast"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-full bg-ink px-4 py-2 text-[14px] text-wall no-underline focus-visible:translate-y-0"
      >
        Skip to the docs
      </a>
      <div data-halo-recess className="mullions min-h-dvh">
        <Nav />
        <main>
          <Hero />
          <ToastSection />
          <DrawerSection />
          <Directions onApplyToast={setToastConfig} />
          <Playground toastConfig={toastConfig} onToastConfig={setToastConfig} />
          <Agents />
        </main>
        <Footer />
      </div>
      <Toaster {...toastConfig} world={world} theme={theme} />
    </>
  );
}
