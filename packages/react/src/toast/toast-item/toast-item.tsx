import { useLayoutEffect, useRef } from 'react';
import { resolveSpring } from '../../spring/spring-config';
import { cx } from '../../utils/cx';
import { type ToastRecord, toastStore } from '../store/toast-store';
import { useToasterContext } from '../toaster/toaster-context';
import { ToastContent, iconFor, ringFor } from './toast-content';
import { useToastAnnouncement } from './use-toast-announcement';
import { useToastEntrance } from './use-toast-entrance';
import { type ToastSize, useToastMotion } from './use-toast-motion';
import { useToastSwipe } from './use-toast-swipe';
import { useToastTimer } from './use-toast-timer';

type ToastItemProps = {
  toast: ToastRecord;
  index: number;
  expanded: boolean;
  offsetBefore: number;
  frontHeight: number;
  visible: boolean;
  paused: boolean;
  duration: number;
};

const EXIT = resolveSpring({ duration: 0.3, bounce: 0 });
const FADE = resolveSpring('smooth');
const LIVE_TOASTS = '[data-halo-toast]:not([data-dismissed])';

export function ToastItem({ toast: t, index, expanded, offsetBefore, frontHeight, visible, paused, duration }: ToastItemProps) {
  const toaster = useToasterContext();
  const { edge, peek, config, reducedMotion } = toaster;
  const ref = useRef<HTMLLIElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const size = useRef<ToastSize>({ width: 0, height: 0 });
  const renderedHeight = useRef<number | null>(null);
  const lastIndex = useRef(index);
  const exiting = useRef(false);
  const dismissed = useRef(t.dismissed);
  if (index > -1) lastIndex.current = index;
  dismissed.current = t.dismissed;

  const dismissible = t.dismissible !== false;
  const clamped = !expanded && index > 0;
  const hidden = !visible || t.dismissed;
  const timed = t.type !== 'loading' && Number.isFinite(duration);
  const running = timed && visible && !paused && !t.dismissed;
  const icon = iconFor(t, toaster.icons);
  const ring = ringFor(t, timed, Boolean(icon), toaster.timer);

  const { springs, go, fade } = useToastMotion({ ref, size, config, reducedMotion, motion: toaster.motion, edge });
  useToastEntrance({ ref, bodyRef, size, toast: t, visible, springs, config, reducedMotion, reportHeight: toaster.reportHeight });
  useToastAnnouncement(t, bodyRef, toaster.announce);
  useToastTimer(t, duration, running);

  const moveFocusAway = () => {
    const li = ref.current;
    if (!li?.contains(document.activeElement)) return;
    const siblings = Array.from(li.parentElement?.querySelectorAll<HTMLElement>(LIVE_TOASTS) ?? []);
    const after = siblings.find((el) => el !== li && siblings.indexOf(el) > siblings.indexOf(li));
    const next = after ?? siblings.find((el) => el !== li);
    if (next) next.focus();
    else toaster.restoreFocus();
  };

  const dismiss = () => {
    moveFocusAway();
    t.onDismiss?.(t);
    toastStore.dismiss(t.id);
  };

  const swipe = useToastSwipe({
    enabled: dismissible && !t.dismissed,
    edge,
    horizontal: toaster.horizontal,
    size,
    springs,
    go,
    fade,
    onInteract: toaster.setInteracting,
    onSwipeAway: (flight) => {
      exiting.current = true;
      t.onDismiss?.(t);
      moveFocusAway();
      toastStore.dismiss(t.id);
      flight.then(() => toaster.remove(t.id));
    },
  });

  useLayoutEffect(() => {
    if (t.dismissed || swipe.isSwiping()) return;
    const nextRendered = clamped ? frontHeight : size.current.height;
    if (renderedHeight.current !== null && renderedHeight.current !== nextRendered) {
      springs.y.offset(edge * (nextRendered - renderedHeight.current));
    }
    renderedHeight.current = nextRendered;
    go(springs.y, expanded ? -edge * offsetBefore : -edge * index * peek);
    go(springs.scale, expanded ? 1 : Math.max(1 - index * 0.05, 0.85));
    fade(visible ? 1 : 0);
  }, [t.dismissed, clamped, frontHeight, expanded, offsetBefore, index, peek, visible, edge, config, reducedMotion]);

  useLayoutEffect(() => {
    if (!t.dismissed || exiting.current) return;
    exiting.current = true;
    springs.reveal.to(0, { config: reducedMotion ? FADE : EXIT }).then(() => {
      if (dismissed.current) toaster.remove(t.id);
      else exiting.current = false;
    });
  }, [t.dismissed]);

  useLayoutEffect(() => {
    if (ref.current) ref.current.inert = hidden;
  }, [hidden]);

  return (
    <li
      ref={ref}
      tabIndex={0}
      data-halo-toast=""
      data-type={t.type}
      data-front={index === 0 || undefined}
      data-clamped={clamped || undefined}
      data-dismissed={t.dismissed || undefined}
      data-hidden={hidden || undefined}
      data-timer-paused={!running || undefined}
      data-intent={toaster.intent || undefined}
      data-streaming={t.streaming || undefined}
      className={cx('halo-toast halo-surface', toaster.classNames?.toast, t.className)}
      style={{ height: clamped ? frontHeight : undefined, zIndex: 1000 - lastIndex.current }}
      {...swipe.handlers}
      onKeyDown={(event) => {
        if (!dismissible) return;
        const onSelf = event.target === event.currentTarget;
        if (event.key === 'Escape' || (onSelf && (event.key === 'Delete' || event.key === 'Backspace'))) {
          event.preventDefault();
          dismiss();
        }
      }}
    >
      <div ref={bodyRef} className={cx('halo-toast-body', toaster.classNames?.body)}>
        <ToastContent toast={t} icon={icon} duration={duration} ring={ring} dismissible={dismissible} onDismiss={dismiss} />
      </div>
      {ring === 'edge' && <span key={t.revision} aria-hidden className="halo-toast-timeline" style={{ animationDuration: `${duration}ms` }} />}
    </li>
  );
}
