import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
};

export function useDocumentHidden(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.hidden,
    () => false,
  );
}
