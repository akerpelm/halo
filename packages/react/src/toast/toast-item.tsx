import { type PointerEvent, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PIXEL_PRECISION, type SpringValue, createSpringValue } from '../core/animator';
import { createVelocityTracker, project, rubberband } from '../core/gesture';
import { type SpringConfig, resolveSpring } from '../core/spring';
import { CloseIcon, TimerRing, type ToastMotion, type ToastTimer, TypeIcon } from './icons';
import { type ToastRecord, toast as toastApi } from './store';
import type { ToastClassNames } from './toaster';

type Axis = 'x' | 'y';

type ToastItemProps = {
  toast: ToastRecord;
  /** Position among live toasts, 0 is the front. -1 once dismissed. */
  index: number;
  /** +1 when anchored to the bottom edge, -1 for top. */
  edge: 1 | -1;
  horizontal: 'left' | 'center' | 'right';
  expanded: boolean;
  offsetBefore: number;
  frontHeight: number;
  peek: number;
  visible: boolean;
  paused: boolean;
  duration: number;
  config: SpringConfig;
  reducedMotion: boolean;
  closeButton: boolean;
  timer: ToastTimer;
  motionStyle: ToastMotion;
  icons: boolean;
  tint: boolean;
  classNames: ToastClassNames | undefined;
  onHeight: (id: ToastRecord['id'], height: number) => void;
  onRemove: (id: ToastRecord['id']) => void;
  onInteract: (interacting: boolean) => void;
  announce: (message: string, important: boolean) => void;
  restoreFocus: () => void;
};

const TYPE_LABEL: Record<ToastRecord['type'], string> = {
  default: '',
  success: 'Success:',
  error: 'Error:',
  warning: 'Warning:',
  info: 'Info:',
  loading: 'In progress:',
};

const FADE = resolveSpring('smooth');
const EXIT = resolveSpring({ duration: 0.3, bounce: 0 });
const DISMISS_DECELERATION = 0.995;
/** Dismiss once a drag, or where its flick would coast to, passes a third of the toast. */
const DISMISS_FRACTION = 1 / 3;

type Motion = { x: SpringValue; y: SpringValue; dy: SpringValue; scale: SpringValue; opacity: SpringValue; reveal: SpringValue };

const cx = (...parts: Array<string | undefined | false>) => parts.filter(Boolean).join(' ');

const unit = (n: number) => Math.max(0, Math.min(1, n));
/** How far the material's shadow reaches past the pane, in px. */
const SHADOW_BLEED = 64;

/** The same spring character, played faster: stiffness scales by 1/k², damping by 1/k. */
function quicken(config: SpringConfig, k: number): SpringConfig {
  return { ...config, stiffness: config.stiffness / (k * k), damping: config.damping / k };
}

/** One reveal value (0 hidden, 1 shown) read by each motion style. Overshoot past 1 is kept for transforms. */
function revealStyle(style: ToastMotion, p: number, edge: 1 | -1) {
  const q = 1 - p;
  switch (style) {
    case 'fade':
      return { transform: '', opacity: unit(p), filter: '', clip: '' };
    case 'drop':
      return { transform: `translate3d(0, ${-edge * q * 72}px, 0)`, opacity: unit(p * 2.5), filter: '', clip: '' };
    case 'hinge':
      return { transform: `perspective(700px) rotateX(${q * -78}deg)`, opacity: unit(p * 1.6), filter: '', clip: '' };
    case 'focus':
      return { transform: `scale(${1 + q * 0.07})`, opacity: unit(p), filter: q > 0.002 ? `blur(${(unit(q) * 12).toFixed(2)}px)` : '', clip: '' };
    case 'bloom': {
      // The clip reaches past the pane by the shadow's extent and ends fully open, so the shadow
      // grows with the reveal instead of switching on when the clip is removed.
      const side = unit(q);
      const bleed = SHADOW_BLEED * (1 - side);
      return {
        transform: '',
        opacity: unit(p * 3),
        filter: '',
        clip: q > 0.002 ? `inset(-${SHADOW_BLEED}px calc(${(side * 42).toFixed(2)}% - ${bleed.toFixed(1)}px) round var(--halo-radius))` : '',
      };
    }
    default:
      return { transform: `translate3d(0, ${edge * q * 28}px, 0) scale(${0.96 + 0.04 * p})`, opacity: unit(p), filter: '', clip: '' };
  }
}

function useToastMotion(
  element: RefObject<HTMLLIElement | null>,
  width: RefObject<number>,
  config: SpringConfig,
  settings: RefObject<{ style: ToastMotion; edge: 1 | -1 }>,
) {
  const [motion] = useState<Motion>(() => {
    const state = { x: 0, y: 0, dy: 0, scale: 1, opacity: 1, reveal: 0 };
    // Springs write straight to the DOM inside the shared frame loop. React never re-renders mid-animation.
    const render = () => {
      const el = element.current;
      if (!el) return;
      const reveal = revealStyle(settings.current.style, state.reveal, settings.current.edge);
      el.style.transform = `translate3d(${state.x}px, ${state.y + state.dy}px, 0) scale(${state.scale}) ${reveal.transform}`;
      el.style.opacity = String(unit(state.opacity) * reveal.opacity);
      el.style.filter = reveal.filter;
      el.style.clipPath = reveal.clip;
      el.style.setProperty('--halo-shift', (state.x / (width.current || 1)).toFixed(3));
    };
    const value = (key: keyof typeof state, initial: number) =>
      createSpringValue(
        initial,
        config,
        (next) => {
          state[key] = next;
          render();
        },
        key === 'scale' || key === 'opacity' || key === 'reveal' ? undefined : PIXEL_PRECISION,
      );
    return {
      x: value('x', 0),
      y: value('y', 0),
      dy: value('dy', 0),
      scale: value('scale', 1),
      opacity: value('opacity', 1),
      reveal: value('reveal', 0),
    };
  });
  return motion;
}

export function ToastItem({
  toast: t,
  index,
  edge,
  horizontal,
  expanded,
  offsetBefore,
  frontHeight,
  peek,
  visible,
  paused,
  duration,
  config,
  reducedMotion,
  closeButton,
  timer,
  motionStyle,
  icons,
  tint,
  classNames,
  onHeight,
  onRemove,
  onInteract,
  announce,
  restoreFocus,
}: ToastItemProps) {
  const ref = useRef<HTMLLIElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  const naturalHeight = useRef(0);
  const renderedHeight = useRef<number | null>(null);
  const lastIndex = useRef(index);
  const exiting = useRef(false);
  const dismissedRef = useRef(t.dismissed);
  const drag = useRef<{ x: number; y: number; axis: Axis | null; pointerId: number; armed: boolean } | null>(null);
  const [tracker] = useState(createVelocityTracker);
  const motionSettings = useRef({ style: motionStyle, edge });
  motionSettings.current = { style: reducedMotion ? 'fade' : motionStyle, edge };
  const motion = useToastMotion(ref, width, config, motionSettings);

  const dismissible = t.dismissible !== false;
  const clamped = !expanded && index > 0;
  const timed = t.type !== 'loading' && Number.isFinite(duration);
  if (index > -1) lastIndex.current = index;
  dismissedRef.current = t.dismissed;

  const go = (spring: SpringValue, target: number, velocity?: number) => {
    if (reducedMotion) {
      spring.set(target);
      return Promise.resolve();
    }
    return spring.to(target, { config, velocity });
  };
  const fade = (target: number) => (reducedMotion ? motion.opacity.to(target, { config: FADE }) : go(motion.opacity, target));

  useLayoutEffect(() => {
    const li = ref.current;
    const body = bodyRef.current;
    if (!li || !body) return;
    width.current = li.offsetWidth;
    naturalHeight.current = body.offsetHeight;
    onHeight(t.id, naturalHeight.current);
    const observer = new ResizeObserver(() => {
      width.current = li.offsetWidth;
      naturalHeight.current = body.offsetHeight;
      onHeight(t.id, naturalHeight.current);
    });
    observer.observe(li);
    observer.observe(body);
    // Enter through the chosen motion style. Hidden-behind-the-deck toasts start invisible.
    motion.opacity.set(visible ? 1 : 0);
    motion.reveal.set(0);
    if (reducedMotion) motion.reveal.to(1, { config: FADE });
    else motion.reveal.to(1, { config: quicken(config, 0.75) });
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (t.dismissed || drag.current?.axis) return;
    // Behind-the-front toasts are clipped to the front toast's height. When that clip changes,
    // shift the spring by the difference so the visible edge never jumps.
    const nextRendered = clamped ? frontHeight : naturalHeight.current;
    if (renderedHeight.current !== null && renderedHeight.current !== nextRendered) {
      motion.y.offset(edge * (nextRendered - renderedHeight.current));
    }
    renderedHeight.current = nextRendered;

    go(motion.y, expanded ? -edge * offsetBefore : -edge * index * peek);
    go(motion.scale, expanded ? 1 : Math.max(1 - index * 0.05, 0.85));
    fade(visible ? 1 : 0);
  }, [t.dismissed, clamped, frontHeight, expanded, offsetBefore, index, peek, visible, edge, config, reducedMotion]);

  useLayoutEffect(() => {
    if (!t.dismissed || exiting.current) return;
    exiting.current = true;
    // Leave through the same motion style, reversed, without bounce so it never overshoots past hidden.
    motion.reveal.to(0, { config: reducedMotion ? FADE : EXIT }).then(() => {
      if (dismissedRef.current) onRemove(t.id);
      else exiting.current = false;
    });
  }, [t.dismissed]);

  useEffect(() => {
    if (t.dismissed || !bodyRef.current) return;
    const parts = bodyRef.current.querySelectorAll('.halo-sr-only, .halo-toast-title, .halo-toast-description');
    const text = Array.from(parts, (node) => node.textContent?.trim().replace(/:$/, '') ?? '')
      .filter(Boolean)
      .join('. ');
    announce(text, t.important ?? t.type === 'error');
  }, [t.revision, t.dismissed]);

  // Time left survives pauses. An update (new revision) restarts the clock.
  const remaining = useRef(duration);
  useEffect(() => {
    remaining.current = duration;
  }, [t.revision, duration]);

  // Toasts hidden behind the deck don't expire unseen.
  const running = timed && visible && !paused && !t.dismissed;
  useEffect(() => {
    if (!running) return;
    const startedAt = performance.now();
    const timer = window.setTimeout(() => {
      t.onAutoClose?.(t);
      toastApi.dismiss(t.id);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= performance.now() - startedAt;
    };
  }, [running, t.revision]);

  const moveFocusAway = () => {
    const li = ref.current;
    if (!li?.contains(document.activeElement)) return;
    const siblings = Array.from(li.parentElement?.querySelectorAll<HTMLElement>('[data-halo-toast]:not([data-dismissed])') ?? []);
    const next = siblings.find((el) => el !== li && siblings.indexOf(el) > siblings.indexOf(li)) ?? siblings.find((el) => el !== li);
    if (next) next.focus();
    else restoreFocus();
  };

  const userDismiss = () => {
    moveFocusAway();
    t.onDismiss?.(t);
    toastApi.dismiss(t.id);
  };

  const isAllowed = (axis: Axis, sign: number) => {
    if (sign === 0) return false;
    if (axis === 'y') return sign === edge;
    if (horizontal === 'center') return true;
    return horizontal === 'right' ? sign > 0 : sign < 0;
  };

  const sizeFor = (axis: Axis) => (axis === 'x' ? width.current : naturalHeight.current) || 1;
  const springFor = (axis: Axis) => (axis === 'x' ? motion.x : motion.dy);

  const onPointerDown = (event: PointerEvent<HTMLLIElement>) => {
    if (!dismissible || t.dismissed) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if ((event.target as Element).closest('button, a, input, textarea, select, [data-halo-no-drag]')) return;
    (event.target as Element).setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, axis: null, pointerId: event.pointerId, armed: false };
    tracker.reset();
    onInteract(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLLIElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.axis) {
      if (Math.hypot(dx, dy) < 5 || window.getSelection()?.toString()) return;
      current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      event.currentTarget.dataset.swiping = '';
    }
    const raw = current.axis === 'x' ? dx : dy;
    const size = sizeFor(current.axis);
    const value = isAllowed(current.axis, Math.sign(raw)) ? raw : rubberband(raw, size);
    springFor(current.axis).set(value);
    tracker.add(value, event.timeStamp);

    const armed = isAllowed(current.axis, Math.sign(raw)) && Math.abs(raw) > size * DISMISS_FRACTION;
    if (armed !== current.armed) {
      current.armed = armed;
      if (armed && event.pointerType === 'touch') navigator.vibrate?.(6);
    }
  };

  const release = (event: PointerEvent<HTMLLIElement>, cancelled: boolean) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    onInteract(false);
    if (!current.axis) return;
    delete event.currentTarget.dataset.swiping;

    const spring = springFor(current.axis);
    const position = spring.get();
    const velocity = cancelled ? 0 : tracker.velocity(event.timeStamp);
    const landing = position + project(velocity, DISMISS_DECELERATION);
    const size = sizeFor(current.axis);
    const sign = Math.sign(landing);

    if (!cancelled && isAllowed(current.axis, sign) && Math.abs(landing) > size * DISMISS_FRACTION) {
      // Hand the finger's momentum to the exit. The toast keeps travelling instead of restarting.
      exiting.current = true;
      t.onDismiss?.(t);
      moveFocusAway();
      toastApi.dismiss(t.id);
      Promise.all([go(spring, sign * (size + 80), velocity), fade(0)]).then(() => onRemove(t.id));
      return;
    }
    go(spring, 0, velocity);
  };

  const typeLabel = TYPE_LABEL[t.type];
  const icon = t.icon ?? (t.type === 'default' || !icons ? null : <TypeIcon type={t.type} />);
  // Which timer to draw, if any. Untimed toasts (loading, Infinity) never show one, and a toast
  // with no icon moves its ring to the close button rather than drawing an empty circle.
  const ring = !timed ? false : timer === 'icon' && !icon ? 'close' : timer;

  return (
    <li
      ref={ref}
      tabIndex={0}
      data-halo-toast=""
      data-type={t.type}
      data-front={index === 0 || undefined}
      data-clamped={clamped || undefined}
      data-dismissed={t.dismissed || undefined}
      data-timer-paused={!running || undefined}
      data-tint={tint || undefined}
      className={cx('halo-toast halo-surface', classNames?.toast, t.className)}
      style={{ height: clamped ? frontHeight : undefined, zIndex: 1000 - lastIndex.current }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => release(event, false)}
      onPointerCancel={(event) => release(event, true)}
      // Capture can vanish without a pointerup (app switch, OS gesture); treat it as a cancel.
      onLostPointerCapture={(event) => release(event, true)}
      onKeyDown={(event) => {
        if (!dismissible) return;
        const onSelf = event.target === event.currentTarget;
        if (event.key === 'Escape' || (onSelf && (event.key === 'Delete' || event.key === 'Backspace'))) {
          event.preventDefault();
          userDismiss();
        }
      }}
    >
      <div ref={bodyRef} className={cx('halo-toast-body', classNames?.body)}>
        {(icon || ring === 'icon') && (
          <span key={t.type} className={cx('halo-toast-icon', classNames?.icon)} data-timer={ring === 'icon' || undefined}>
            {ring === 'icon' && <TimerRing duration={duration} restartKey={t.revision} />}
            {icon}
          </span>
        )}
        <div className="halo-toast-text">
          {typeLabel && <span className="halo-sr-only">{typeLabel} </span>}
          <div className={cx('halo-toast-title', classNames?.title)}>{t.title}</div>
          {t.description && <div className={cx('halo-toast-description', classNames?.description)}>{t.description}</div>}
        </div>
        {t.action && (
          <button
            type="button"
            className={cx('halo-toast-action', classNames?.action)}
            onClick={(event) => {
              t.action?.onClick(event);
              if (!event.defaultPrevented) userDismiss();
            }}
          >
            {t.action.label}
          </button>
        )}
        {closeButton && dismissible ? (
          <button type="button" className={cx('halo-toast-close', classNames?.close)} data-timer={ring === 'close' || undefined} aria-label="Dismiss notification" onClick={userDismiss}>
            {ring === 'close' && <TimerRing duration={duration} restartKey={t.revision} />}
            <CloseIcon />
          </button>
        ) : (
          ring === 'close' && (
            <span className="halo-toast-close" data-timer="" aria-hidden>
              <TimerRing duration={duration} restartKey={t.revision} />
            </span>
          )
        )}
      </div>
      {ring === 'edge' && (
        <span
          key={t.revision}
          aria-hidden
          className="halo-toast-timeline"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </li>
  );
}
