import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { type HaloDensity, type HaloRadius, appearanceStyle } from '../core/appearance';
import { type SpringInput, resolveSpring } from '../core/spring';
import { useReducedMotion } from '../core/use-media-query';
import { toastStore } from './store';
import { ToastItem } from './toast-item';

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type HaloWorld = 'dichroic' | 'partition' | 'smoked' | 'vapor' | 'crystal' | 'ink';

export const haloWorlds: readonly HaloWorld[] = ['dichroic', 'partition', 'smoked', 'vapor', 'crystal', 'ink'];
export type HaloTheme = 'light' | 'dark' | 'system';

export type ToasterProps = {
  /** Only render toasts sent with this `toasterId`. */
  id?: string;
  position?: ToastPosition;
  /** Keep the stack fanned out instead of collapsing it into a deck. */
  expand?: boolean;
  visibleToasts?: number;
  gap?: number;
  /** Default auto-dismiss time in ms. */
  duration?: number;
  spring?: SpringInput;
  world?: HaloWorld;
  theme?: HaloTheme;
  /** Padding and type size. */
  density?: HaloDensity;
  /** Corner radius: a preset or px. `pill` makes capsule toasts. */
  radius?: HaloRadius;
  /** `KeyboardEvent` modifier names plus a `code`, all pressed together. */
  hotkey?: string[];
  /** Landmark name read by screen readers. */
  label?: string;
  closeButton?: boolean;
  /** The edge drains as time runs out, and visibly freezes on hover or focus. */
  timeline?: boolean;
  /** Distance from the viewport edge in px. */
  offset?: number;
  className?: string;
  style?: CSSProperties;
};

const PEEK = 10;

export function Toaster({
  id: toasterId,
  position = 'bottom-right',
  expand = false,
  visibleToasts = 3,
  gap = 12,
  duration = 5000,
  spring = 'snappy',
  world = 'dichroic',
  theme = 'system',
  density = 'comfortable',
  radius,
  hotkey = ['altKey', 'KeyT'],
  label = 'Notifications',
  closeButton = true,
  timeline = true,
  offset = 24,
  className,
  style,
}: ToasterProps) {
  const all = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getServerSnapshot);
  const toasts = useMemo(() => all.filter((t) => t.toasterId === toasterId), [all, toasterId]);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const documentHidden = useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange);
      return () => document.removeEventListener('visibilitychange', onChange);
    },
    () => document.hidden,
    () => false,
  );
  const reducedMotion = useReducedMotion();
  const config = useMemo(() => resolveSpring(spring), [spring]);
  const listRef = useRef<HTMLOListElement>(null);
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const focusBeforeRef = useRef<HTMLElement | null>(null);

  const [vertical, horizontal] = position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right'];
  const edge = vertical === 'bottom' ? 1 : -1;
  const live = toasts.filter((t) => !t.dismissed);
  const expanded = expand || hovered || focusWithin || interacting;
  const paused = expanded || documentHidden;

  const heightOf = (key: string | number) => heights[String(key)] ?? 0;
  const frontHeight = live[0] ? heightOf(live[0].id) : 0;
  const offsets = live.reduce<number[]>((acc, t, i) => {
    const previous = i === 0 ? 0 : (acc[i - 1] ?? 0) + heightOf(live[i - 1]?.id ?? '') + gap;
    acc.push(previous);
    return acc;
  }, []);
  const visibleCount = Math.min(live.length, visibleToasts);
  const stackHeight = expanded
    ? (offsets[visibleCount - 1] ?? 0) + heightOf(live[visibleCount - 1]?.id ?? '')
    : frontHeight + Math.max(visibleCount - 1, 0) * PEEK;

  const reportHeight = useCallback((key: string | number, height: number) => {
    setHeights((current) => (current[String(key)] === height ? current : { ...current, [String(key)]: height }));
  }, []);

  const remove = useCallback((key: string | number) => {
    toastStore.remove(key);
    setHeights(({ [String(key)]: _removed, ...rest }) => rest);
  }, []);

  const announce = useCallback((message: string, important: boolean) => {
    const region = important ? assertiveRef.current : politeRef.current;
    if (!region || !message) return;
    // Clearing first makes identical consecutive messages announce again.
    region.textContent = '';
    window.setTimeout(() => {
      region.textContent = message;
    }, 60);
  }, []);

  const restoreFocus = useCallback(() => {
    const target = focusBeforeRef.current;
    focusBeforeRef.current = null;
    if (target?.isConnected) target.focus();
  }, []);

  useEffect(() => {
    if (hotkey.length === 0) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const pressed = hotkey.every((key) => (event as unknown as Record<string, unknown>)[key] === true || event.code === key);
      if (!pressed) return;
      const first = listRef.current?.querySelector<HTMLElement>('[data-halo-toast]:not([data-dismissed])');
      if (!first) return;
      event.preventDefault();
      if (!listRef.current?.contains(document.activeElement)) {
        focusBeforeRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }
      first.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hotkey]);

  const hotkeyLabel = hotkey.map((key) => key.replace(/Key$/, '').replace(/^Key/, '').replace(/^Digit/, '')).join('+');

  return (
    <section
      aria-label={`${label} (${hotkeyLabel})`}
      tabIndex={-1}
      className={['halo', 'halo-toaster', className].filter(Boolean).join(' ')}
      data-halo-world={world}
      data-theme={theme}
      data-density={density}
      data-y={vertical}
      data-x={horizontal}
      style={{ '--halo-offset': `${offset}px`, '--halo-gap': `${gap}px`, ...appearanceStyle('--halo-radius', radius), ...style } as CSSProperties}
    >
      <div ref={politeRef} className="halo-sr-only" aria-live="polite" aria-atomic="true" />
      <div ref={assertiveRef} className="halo-sr-only" aria-live="assertive" aria-atomic="true" />
      <ol
          ref={listRef}
          className="halo-toast-list"
          style={{ height: stackHeight }}
          onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
          onPointerLeave={(event) => event.pointerType === 'mouse' && setHovered(false)}
          onFocus={() => setFocusWithin(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false);
          }}
        >
          {toasts.map((t) => {
            const index = live.indexOf(t);
            return (
              <ToastItem
                key={t.id}
                toast={t}
                index={index}
                edge={edge}
                horizontal={horizontal}
                expanded={expanded}
                offsetBefore={offsets[index] ?? 0}
                frontHeight={frontHeight}
                peek={PEEK}
                visible={index > -1 && index < visibleToasts}
                paused={paused}
                duration={t.duration ?? duration}
                config={config}
                reducedMotion={reducedMotion}
                closeButton={closeButton}
                timeline={timeline}
                onHeight={reportHeight}
                onRemove={remove}
                onInteract={setInteracting}
                announce={announce}
                restoreFocus={restoreFocus}
              />
            );
          })}
        </ol>
    </section>
  );
}
