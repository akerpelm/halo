import { type CSSProperties, useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { type SpringInput, resolveSpring } from '../../spring/spring-config';
import { type HaloDensity, type HaloRadius, type HaloTheme, type HaloWorldName, radiusStyle } from '../../utils/appearance';
import { cx } from '../../utils/cx';
import { useDocumentHidden } from '../../utils/use-document-hidden';
import { useReducedMotion } from '../../utils/use-media-query';
import { toastStore } from '../store/toast-store';
import { ToastItem } from '../toast-item/toast-item';
import type { ToastClassNames, ToastIntent, ToastMotion, ToastPosition, ToastTimer } from '../types';
import { stackLayout } from './stack-layout';
import { ToasterContext, type ToasterContextValue } from './toaster-context';
import { useLiveAnnouncer } from './use-live-announcer';
import { hotkeyLabel, useToasterHotkey } from './use-toaster-hotkey';

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
  world?: HaloWorldName;
  theme?: HaloTheme;
  /** Classes for each toast part. Pair with a layered stylesheet import so utilities win. */
  classNames?: ToastClassNames;
  /** Padding and type size. */
  density?: HaloDensity;
  /** Corner radius: a preset or px. `pill` makes capsule toasts. */
  radius?: HaloRadius;
  /** `KeyboardEvent` modifier names plus a `code`, all pressed together. */
  hotkey?: string[];
  /** Landmark name read by screen readers. */
  label?: string;
  closeButton?: boolean;
  /** How time left is shown. Every style freezes while the stack is hovered, focused, or touched. */
  timer?: ToastTimer;
  /** How toasts enter and leave. */
  motion?: ToastMotion;
  /** Show the type icons (success, error, and so on). */
  icons?: boolean;
  /** Show each toast's type in colour, so success and error read apart even without icons. */
  intent?: ToastIntent;
  /** Override the three dichroic coat colours, e.g. `['#3fd0c9', '#e06bd8', '#f2c14e']`. */
  coat?: readonly [string, string, string];
  /** Distance from the viewport edge in px. */
  offset?: number;
  /** Position inside the nearest positioned ancestor instead of the viewport, for demos and panels. */
  contained?: boolean;
  className?: string;
  style?: CSSProperties;
};

const PEEK = 10;
const DEFAULT_HOTKEY = ['altKey', 'KeyT'];
const NO_HOTKEY: string[] = [];

const coatStyle = (coat: ToasterProps['coat']) =>
  coat ? ({ '--halo-coat-a': coat[0], '--halo-coat-b': coat[1], '--halo-coat-c': coat[2] } as CSSProperties) : {};

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
  classNames,
  hotkey: hotkeyProp,
  label: labelProp,
  closeButton = true,
  timer = 'icon',
  motion = 'rise',
  icons = true,
  intent = false,
  coat,
  offset = 24,
  contained = false,
  className,
  style,
}: ToasterProps) {
  const all = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getServerSnapshot);
  const toasts = useMemo(() => all.filter((t) => t.toasterId === toasterId), [all, toasterId]);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const documentHidden = useDocumentHidden();
  const reducedMotion = useReducedMotion();
  const config = useMemo(() => resolveSpring(spring), [spring]);
  const listRef = useRef<HTMLOListElement>(null);
  const { politeRef, assertiveRef, announce } = useLiveAnnouncer();

  const hotkey = hotkeyProp ?? (toasterId ? NO_HOTKEY : DEFAULT_HOTKEY);
  const label = labelProp ?? (toasterId ? `Notifications: ${toasterId}` : 'Notifications');
  const restoreFocus = useToasterHotkey(hotkey, listRef);

  const [vertical, horizontal] = position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right'];
  const live = toasts.filter((t) => !t.dismissed);
  const expanded = expand || hovered || focused || interacting;
  const paused = hovered || focused || interacting || documentHidden;
  const { offsets, frontHeight, stackHeight } = stackLayout({ live, heights, gap, peek: PEEK, expanded, visibleToasts });

  const reportHeight = useCallback((id: string | number, height: number) => {
    setHeights((current) => (current[String(id)] === height ? current : { ...current, [String(id)]: height }));
  }, []);

  const remove = useCallback((id: string | number) => {
    toastStore.remove(id);
    setHeights(({ [String(id)]: _removed, ...rest }) => rest);
  }, []);

  const context: ToasterContextValue = {
    edge: vertical === 'bottom' ? 1 : -1,
    horizontal,
    peek: PEEK,
    config,
    reducedMotion,
    closeButton,
    timer,
    motion,
    icons,
    intent,
    classNames,
    reportHeight,
    remove,
    setInteracting,
    announce,
    restoreFocus,
  };

  return (
    <section
      aria-label={hotkey.length ? `${label} (${hotkeyLabel(hotkey)})` : label}
      tabIndex={-1}
      className={cx('halo', 'halo-toaster', className)}
      data-halo-world={world}
      data-theme={theme}
      data-density={density}
      data-contained={contained || undefined}
      data-y={vertical}
      data-x={horizontal}
      style={{ '--halo-offset': `${offset}px`, '--halo-gap': `${gap}px`, ...radiusStyle('--halo-radius', radius), ...coatStyle(coat), ...style } as CSSProperties}
    >
      <div ref={politeRef} className="halo-sr-only" aria-live="polite" aria-atomic="true" />
      <div ref={assertiveRef} className="halo-sr-only" aria-live="assertive" aria-atomic="true" />
      <ToasterContext.Provider value={context}>
        <ol
          ref={listRef}
          className="halo-toast-list"
          style={{ height: stackHeight }}
          onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
          onPointerLeave={(event) => event.pointerType === 'mouse' && setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
        >
          {toasts.map((t) => {
            const index = live.indexOf(t);
            return (
              <ToastItem
                key={t.id}
                toast={t}
                index={index}
                expanded={expanded}
                offsetBefore={offsets[index] ?? 0}
                frontHeight={frontHeight}
                visible={index > -1 && index < visibleToasts}
                paused={paused}
                duration={t.duration ?? duration}
              />
            );
          })}
        </ol>
      </ToasterContext.Provider>
    </section>
  );
}
