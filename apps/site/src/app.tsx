import { Toaster } from 'halo-ui-react/toast';
import { type CSSProperties, useLayoutEffect, useState } from 'react';
import { Nav } from './components/nav';
import { SurfaceTransition } from './components/page-transition';
import { DocsLayout } from './docs/docs-layout';
import { type BuildConfig, PLAIN } from './lib/build';
import { PathContext, usePath } from './lib/router';
import { useSettings } from './lib/settings';
import { Footer } from './sections/footer';
import { Home } from './sections/home';
import { PlaygroundPage } from './sections/playground-page';

export function App() {
  const { world, theme, setWorld } = useSettings();
  const [layers, setLayers] = useState<Omit<BuildConfig, 'world'>>(PLAIN);
  const build: BuildConfig = { ...layers, world };
  const setBuild = ({ world: next, ...rest }: BuildConfig) => {
    setLayers(rest);
    if (next !== world) setWorld(next);
  };
  const path = usePath();
  const surface = path.startsWith('/docs') ? 'docs' : path.startsWith('/playground') ? 'playground' : 'home';
  const docsSlug = surface === 'docs' ? path.split('/')[2] || 'getting-started' : null;

  useLayoutEffect(() => {
    const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [path]);

  return (
    <PathContext.Provider value={path}>
      <a
        href="#main"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-full bg-ink px-4 py-2 text-ui text-wall no-underline focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <div data-halo-recess className="mullions min-h-dvh">
        <Nav />
        <main id="main">
          {surface === 'home' && (
            <SurfaceTransition>
              <Home onOpenToast={setBuild} />
            </SurfaceTransition>
          )}
          {surface === 'docs' && docsSlug && (
            <SurfaceTransition>
              <DocsLayout slug={docsSlug} />
            </SurfaceTransition>
          )}
          {surface === 'playground' && (
            <SurfaceTransition>
              <PlaygroundPage build={build} onBuild={setBuild} />
            </SurfaceTransition>
          )}
        </main>
        <Footer />
      </div>
      <Toaster world={world} theme={theme} duration={3500} style={{ '--vt-name': 'site-toaster' } as CSSProperties} />
    </PathContext.Provider>
  );
}
