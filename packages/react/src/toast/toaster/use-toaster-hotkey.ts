import { type RefObject, useCallback, useEffect, useRef } from 'react';

const isPressed = (hotkey: readonly string[], event: KeyboardEvent) =>
  hotkey.every((key) => (event as unknown as Record<string, unknown>)[key] === true || event.code === key);

export const hotkeyLabel = (hotkey: readonly string[]) =>
  hotkey.map((key) => key.replace(/Key$/, '').replace(/^Key/, '').replace(/^Digit/, '')).join('+');

export function useToasterHotkey(hotkey: readonly string[], listRef: RefObject<HTMLOListElement | null>) {
  const focusBefore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (hotkey.length === 0) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPressed(hotkey, event)) return;
      const first = listRef.current?.querySelector<HTMLElement>('[data-halo-toast]:not([data-dismissed])');
      if (!first) return;
      event.preventDefault();
      if (!listRef.current?.contains(document.activeElement)) {
        focusBefore.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }
      first.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hotkey]);

  return useCallback(() => {
    const target = focusBefore.current;
    focusBefore.current = null;
    if (target?.isConnected) target.focus();
  }, []);
}
