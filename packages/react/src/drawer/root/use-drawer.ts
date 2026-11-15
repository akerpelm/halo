import { useDrawerRootContext } from './drawer-root-context';

/** Imperative access for custom triggers: `const { open, setOpen } = useDrawer()`. */
export function useDrawer() {
  const { open, setOpen, activeSnap, setActiveSnap } = useDrawerRootContext('useDrawer');
  return { open, setOpen, activeSnap, setActiveSnap };
}
