import { useSyncExternalStore } from 'react';
import type { HaloWorldName } from 'halo-ui-react';
import { allWorlds } from './worlds';

export type SiteTheme = 'light' | 'dark';
type Settings = { world: HaloWorldName; theme: SiteTheme };

const KEY = 'halo-site';
const defaults: Settings = { world: 'dichroic', theme: 'light' };
const root = typeof document === 'undefined' ? null : document.documentElement;
let settings: Settings = root
  ? {
      world: allWorlds.find((w) => w.value === root.dataset.world)?.value ?? defaults.world,
      theme: root.dataset.theme === 'dark' ? 'dark' : 'light',
    }
  : defaults;
const listeners = new Set<() => void>();

function commit(next: Partial<Settings>) {
  settings = { ...settings, ...next };
  if (!root) return;
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
  const current = useSyncExternalStore(subscribe, () => settings, () => defaults);
  return {
    ...current,
    setWorld: (world: HaloWorldName) => commit({ world }),
    setTheme: (theme: SiteTheme) => commit({ theme }),
  };
}
