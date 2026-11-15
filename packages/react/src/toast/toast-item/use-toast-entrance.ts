import { type RefObject, useLayoutEffect, useRef } from 'react';
import { type SpringConfig, resolveSpring, scaleSpring } from '../../spring/spring-config';
import type { ToastRecord } from '../store/toast-store';
import type { ToastSize, ToastSprings } from './use-toast-motion';

type Options = {
  ref: RefObject<HTMLLIElement | null>;
  bodyRef: RefObject<HTMLDivElement | null>;
  size: RefObject<ToastSize>;
  toast: ToastRecord;
  visible: boolean;
  springs: ToastSprings;
  config: SpringConfig;
  reducedMotion: boolean;
  reportHeight: (id: ToastRecord['id'], height: number) => void;
};

const FADE = resolveSpring('smooth');
const QUICKER = 0.75;

const originOf = (from: ToastRecord['from']) => (from && 'current' in from ? from.current : from);

export function useToastEntrance({ ref, bodyRef, size, toast, visible, springs, config, reducedMotion, reportHeight }: Options) {
  const launched = useRef(false);

  useLayoutEffect(() => {
    const li = ref.current;
    const body = bodyRef.current;
    if (!li || !body) return;
    const rest = li.getBoundingClientRect();
    const measure = () => {
      size.current = { width: li.offsetWidth, height: body.offsetHeight };
      reportHeight(toast.id, body.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(li);
    observer.observe(body);

    springs.opacity.set(visible ? 1 : 0);
    springs.reveal.set(0);
    springs.reveal.to(1, { config: reducedMotion ? FADE : scaleSpring(config, QUICKER) });

    const origin = originOf(toast.from);
    if (origin && !reducedMotion && !launched.current) {
      launched.current = true;
      const from = origin.getBoundingClientRect();
      springs.x.set(from.left + from.width / 2 - (rest.left + rest.width / 2));
      springs.y.set(from.top + from.height / 2 - (rest.top + rest.height / 2));
      springs.scale.set(Math.max(0.25, Math.min(1, from.width / rest.width)));
      springs.reveal.set(1);
      springs.x.to(0, { config });
    }
    return () => observer.disconnect();
  }, []);
}
