import { useSyncExternalStore } from 'react';
import { type HaloWorld, haloWorlds } from '@halo-ui/react';

export type SiteTheme = 'light' | 'dark';
type Settings = { world: HaloWorld; theme: SiteTheme };

const KEY = 'halo-site';
const root = document.documentElement;
const savedWorld = haloWorlds.find((w) => w === root.dataset.world);
let settings: Settings = {
  world: savedWorld ?? 'dichroic',
  theme: root.dataset.theme === 'dark' ? 'dark' : 'light',
};
const listeners = new Set<() => void>();

function commit(next: Partial<Settings>) {
  settings = { ...settings, ...next };
  root.dataset.world = settings.world;
  root.dataset.theme = settings.theme;
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }
  for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function useSettings() {
  const current = useSyncExternalStore(subscribe, () => settings);
  return {
    ...current,
    setWorld: (world: HaloWorld) => commit({ world }),
    setTheme: (theme: SiteTheme) => commit({ theme }),
  };
}
