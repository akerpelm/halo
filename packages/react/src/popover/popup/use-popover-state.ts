import { type RefObject, useLayoutEffect, useRef } from 'react';

type Options = {
  popupRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Before the browser shows the popup. */
  onOpening: () => void;
  /** Once it is in the top layer and can be measured. */
  onOpened: () => void;
  /** Before it leaves the top layer, while it can still be measured. */
  onClosing: () => void;
};

const focusInside = (popup: HTMLElement) => {
  const preferred = popup.querySelector<HTMLElement>('[autofocus], [data-autofocus]');
  (preferred ?? popup).focus({ preventScroll: true });
};

/**
 * Keeps React's `open` and the browser's popover state in step. React asks (`open` changes call showPopover or
 * hidePopover); the browser reports (Esc, outside clicks and the trigger arrive as toggle events and call setOpen).
 * Opening moves focus inside, as a non-modal dialog should; the browser returns it to the trigger on close.
 */
export function usePopoverState({ popupRef, open, setOpen, onOpening, onOpened, onClosing }: Options) {
  const shown = useRef(false);
  const live = useRef({ open, setOpen, onOpening, onOpened, onClosing });
  live.current = { open, setOpen, onOpening, onOpened, onClosing };

  useLayoutEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;
    const onBeforeToggle = (event: Event) => {
      const opening = (event as ToggleEvent).newState === 'open';
      shown.current = opening;
      if (opening) live.current.onOpening();
      else live.current.onClosing();
    };
    const onToggle = (event: Event) => {
      const opened = (event as ToggleEvent).newState === 'open';
      if (opened !== live.current.open) live.current.setOpen(opened);
      if (!opened) return;
      live.current.onOpened();
      focusInside(popup);
    };
    popup.addEventListener('beforetoggle', onBeforeToggle);
    popup.addEventListener('toggle', onToggle);
    return () => {
      popup.removeEventListener('beforetoggle', onBeforeToggle);
      popup.removeEventListener('toggle', onToggle);
    };
  }, []);

  useLayoutEffect(() => {
    const popup = popupRef.current;
    if (!popup || open === shown.current) return;
    if (open) popup.showPopover();
    else popup.hidePopover();
  }, [open]);
}
