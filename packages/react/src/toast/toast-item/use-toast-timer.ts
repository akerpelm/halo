import { useEffect, useRef } from 'react';
import { toastStore, type ToastRecord } from '../store/toast-store';

export function useToastTimer(toast: ToastRecord, duration: number, running: boolean) {
  const remaining = useRef(duration);

  useEffect(() => {
    remaining.current = duration;
  }, [toast.revision, duration]);

  useEffect(() => {
    if (!running) return;
    const startedAt = performance.now();
    const timer = window.setTimeout(() => {
      toast.onAutoClose?.(toast);
      toastStore.dismiss(toast.id);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= performance.now() - startedAt;
    };
  }, [running, toast.revision]);
}
