import { type RefObject, useEffect } from 'react';
import type { ToastRecord } from '../store/toast-store';

const SPOKEN_PARTS = '.halo-sr-only, .halo-toast-title, .halo-toast-description';

export function useToastAnnouncement(toast: ToastRecord, bodyRef: RefObject<HTMLDivElement | null>, announce: (message: string, important: boolean) => void) {
  useEffect(() => {
    if (toast.dismissed || toast.streaming || !bodyRef.current) return;
    const text = Array.from(bodyRef.current.querySelectorAll(SPOKEN_PARTS), (node) => node.textContent?.trim().replace(/:$/, '') ?? '')
      .filter(Boolean)
      .join('. ');
    announce(text, toast.important ?? toast.type === 'error');
  }, [toast.revision, toast.dismissed]);
}
