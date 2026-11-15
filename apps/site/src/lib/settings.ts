import { useSyncExternalStore } from 'react';
import type { HaloWorldName } from '@halo-ui/react';
import { allWorlds } from './worlds';

export type SiteTheme = 'light' | 'dark';
type Settings = { world: HaloWorldName; theme: SiteTheme };

const KEY = 'halo-site';
const root = document.documentElement;
const savedWorld = allWorlds.find((w) => w.value === root.dataset.world)?.value;
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
  } catch {}
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
    setWorld: (world: HaloWorldName) => commit({ world }),
    setTheme: (theme: SiteTheme) => commit({ theme }),
  };
}
