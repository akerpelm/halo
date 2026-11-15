import { useCallback, useRef } from 'react';

const ANNOUNCE_DELAY = 60;

export function useLiveAnnouncer() {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, important: boolean) => {
    const region = important ? assertiveRef.current : politeRef.current;
    if (!region || !message) return;
    region.textContent = '';
    window.setTimeout(() => {
      region.textContent = message;
    }, ANNOUNCE_DELAY);
  }, []);

  return { politeRef, assertiveRef, announce };
}
