import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PIXEL_PRECISION, type SpringValue, createSpringValue } from '../core/animator';
import { clamp, createVelocityTracker, nearest, project, rubberband } from '../core/gesture';
import { type HaloDensity, type HaloRadius, appearanceStyle } from '../core/appearance';
import { type SpringInput, fromDuration, resolveSpring } from '../core/spring';
import { useReducedMotion } from '../core/use-media-query';
import type { HaloTheme, HaloWorld } from '../toast/toaster';

/** How far the page sinks back (0–1 of its size) and how much it bounces when it settles. */
export type RecessConfig = { depth: number; bounce: number };

export type DrawerSide = 'bottom' | 'top' | 'left' | 'right';
/** A fraction of the viewport (0–1] or an exact size like `'320px'`. */
export type SnapPoint = number | `${number}px`;

type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: DrawerSide;
  snapPoints: readonly SnapPoint[] | undefined;
  activeSnap: SnapPoint | undefined;
  setActiveSnap: (snap: SnapPoint) => void;
  dismissible: boolean;
  spring: SpringInput;
  world: HaloWorld;
  theme: HaloTheme;
  recess: RecessConfig | null;
  density: HaloDensity;
  radius: HaloRadius | undefined;
  titleId: string;
  descriptionId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawerContext(part: string): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) throw new Error(`<Drawer.${part}> must be rendered inside <Drawer.Root>.`);
  return context;
}

/** Imperative access for custom triggers: `const { open, setOpen } = useDrawer()`. */
export function useDrawer() {
  const { open, setOpen, activeSnap, setActiveSnap } = useDrawerContext('useDrawer');
  return { open, setOpen, activeSnap, setActiveSnap };
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, set] as const;
}

export type DrawerRootProps = {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: DrawerSide;
  /** Detents the drawer can rest at, smallest first. Defaults to the content's own size. */
  snapPoints?: readonly SnapPoint[];
  activeSnapPoint?: SnapPoint;
  defaultSnapPoint?: SnapPoint;
  onActiveSnapPointChange?: (snap: SnapPoint) => void;
  /** When false, the drawer cannot be swiped, clicked, or escaped closed. */
  dismissible?: boolean;
  spring?: SpringInput;
  world?: HaloWorld;
  theme?: HaloTheme;
  density?: HaloDensity;
  /** Corner radius of the open edge: a preset or px (capped at 40px so sheets stay sheets). */
  radius?: HaloRadius;
  /**
   * Push the element marked `data-halo-recess` back as the drawer rises.
   * The page rides its own spring, so it sinks and settles with a little give.
   */
  recess?: boolean | Partial<RecessConfig>;
};

function Root({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  snapPoints,
  activeSnapPoint,
  defaultSnapPoint,
  onActiveSnapPointChange,
  dismissible = true,
  spring = { duration: 0.5, bounce: 0.12 },
  world = 'dichroic',
  theme = 'system',
  recess: recessProp = false,
  density = 'comfortable',
  radius,
}: DrawerRootProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [activeSnap, setActiveSnap] = useControllable<SnapPoint | undefined>(
    activeSnapPoint,
    defaultSnapPoint ?? snapPoints?.[0],
    onActiveSnapPointChange as ((snap: SnapPoint | undefined) => void) | undefined,
  );
  const recessDepth = typeof recessProp === 'object' ? recessProp.depth : undefined;
  const recessBounce = typeof recessProp === 'object' ? recessProp.bounce : undefined;
  const recess = useMemo<RecessConfig | null>(
    () => (recessProp ? { depth: recessDepth ?? 0.06, bounce: recessBounce ?? 0.42 } : null),
    [Boolean(recessProp), recessDepth, recessBounce],
  );
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const value = useMemo<DrawerContextValue>(
    () => ({
      open,
      setOpen,
      side,
      snapPoints,
      activeSnap,
      setActiveSnap: setActiveSnap as (snap: SnapPoint) => void,
      dismissible,
      spring,
      world,
      theme,
      recess,
      density,
      radius,
      titleId,
      descriptionId,
      triggerRef,
    }),
    [open, setOpen, side, snapPoints, activeSnap, setActiveSnap, dismissible, spring, world, theme, recess, density, radius, titleId, descriptionId],
  );
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

function Trigger({ onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useDrawerContext('Trigger');
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
    />
  );
}

const VERTICAL: Record<DrawerSide, boolean> = { bottom: true, top: true, left: false, right: false };
/** Which way a positive pointer delta moves along the open direction. */
const OPEN_SIGN: Record<DrawerSide, 1 | -1> = { bottom: -1, top: 1, left: 1, right: -1 };
const SNAP_DECELERATION = 0.992;

let scrollLocks = 0;
let savedOverflow = '';
let savedPadding = '';

function lockScroll() {
  const root = document.documentElement;
  if (scrollLocks === 0) {
    const scrollbar = window.innerWidth - root.clientWidth;
    savedOverflow = root.style.overflow;
    savedPadding = root.style.paddingRight;
    root.style.overflow = 'hidden';
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
  }
  scrollLocks += 1;
  return () => {
    scrollLocks -= 1;
    if (scrollLocks === 0) {
      root.style.overflow = savedOverflow;
      root.style.paddingRight = savedPadding;
    }
  };
}

function toPixels(snap: SnapPoint, viewport: number, size: number): number {
  const px = typeof snap === 'number' ? snap * viewport : Number.parseFloat(snap);
  return clamp(px, 0, size);
}

function findScrollable(target: Element | null, boundary: Element, vertical: boolean): HTMLElement | null {
  for (let el = target; el && el !== boundary; el = el.parentElement) {
    if (!(el instanceof HTMLElement)) continue;
    const style = getComputedStyle(el);
    const overflow = vertical ? style.overflowY : style.overflowX;
    const scrollable = vertical ? el.scrollHeight > el.clientHeight : el.scrollWidth > el.clientWidth;
    if (scrollable && (overflow === 'auto' || overflow === 'scroll')) return el;
  }
  return null;
}

export type DrawerContentProps = HTMLAttributes<HTMLDivElement> & {
  /** Hide the default overlay, e.g. to keep the page visible behind a sheet. */
  overlay?: boolean;
};

function Content({ children, className, overlay = true, style, ...props }: DrawerContentProps) {
  const context = useDrawerContext('Content');
  const { open, setOpen, side, snapPoints, activeSnap, setActiveSnap, dismissible, world, theme, recess, density, radius, titleId, descriptionId, triggerRef } =
    context;
  const reducedMotion = useReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;
  const config = useMemo(() => resolveSpring(context.spring), [context.spring]);
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const geometry = useRef<{ size: number; snaps: number[]; firstSnap: number; entries: Array<{ snap: SnapPoint; px: number }> }>({
    size: 0,
    snaps: [0],
    firstSnap: 0,
    entries: [],
  });
  const latest = useRef({ open, side, recess });
  latest.current = { open, side, recess };
  const releaseVelocity = useRef(0);
  const restoreTarget = useRef<HTMLElement | null>(null);
  const [tracker] = useState(createVelocityTracker);
  const drag = useRef<{
    start: number;
    cross: number;
    startExtent: number;
    pointerId: number;
    scrollable: HTMLElement | null;
    state: 'pending' | 'dragging' | 'ignored';
  } | null>(null);
  const draggedRef = useRef(false);
  const vertical = VERTICAL[side];

  const [extent] = useState<SpringValue>(() =>
    createSpringValue(0, config, (value) => {
      const panel = panelRef.current;
      if (!panel) return;
      const { size, firstSnap } = geometry.current;
      const hidden = size - value;
      const { side: currentSide, recess: currentRecess } = latest.current;
      const axis = VERTICAL[currentSide] ? 'Y' : 'X';
      const sign = currentSide === 'bottom' || currentSide === 'right' ? 1 : -1;
      panel.style.transform = `translate${axis}(${sign * hidden}px)`;
      const progress = clamp(firstSnap > 0 ? value / firstSnap : 0, 0, 1);
      if (overlayRef.current) overlayRef.current.style.opacity = String(progress);
      if (currentRecess) {
        if (reducedMotionRef.current) page.set(progress);
        else page.to(progress, { config: fromDuration(0.62, currentRecess.bounce) });
      }
    }, PIXEL_PRECISION),
  );

  // The page behind rides its own, bouncier spring that chases the drawer's progress.
  const [page] = useState<SpringValue>(() =>
    createSpringValue(0, fromDuration(0.62, 0.32), (value) => {
      const element = document.querySelector<HTMLElement>('[data-halo-recess]');
      const depth = latest.current.recess?.depth ?? 0.06;
      if (!element) return;
      // Clear at rest so the page isn't left as a transformed containing block.
      const active = Math.abs(value) > 0.0005;
      element.style.transform = active ? `scale(${1 - depth * value}) translateY(${value * 12}px)` : '';
      element.toggleAttribute('data-halo-recessed', active);
    }),
  );

  const go = (target: number, velocity = 0) => {
    if (reducedMotion) {
      extent.set(target);
      return Promise.resolve();
    }
    return extent.to(target, { config, velocity });
  };

  const measure = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const size = vertical ? panel.offsetHeight : panel.offsetWidth;
    const viewport = vertical ? window.innerHeight : window.innerWidth;
    const entries = (snapPoints ?? []).map((snap) => ({ snap, px: toPixels(snap, viewport, size) })).sort((a, b) => a.px - b.px);
    const snaps = entries.length ? entries.map((e) => e.px) : [size];
    geometry.current = { size, snaps, firstSnap: snaps[0] ?? size, entries };
  }, [snapPoints, vertical]);

  const activeExtent = () => {
    const { size, snaps } = geometry.current;
    if (activeSnap === undefined) return snaps[snaps.length - 1] ?? size;
    return toPixels(activeSnap, vertical ? window.innerHeight : window.innerWidth, size);
  };

  // Open: enter the top layer, then rise to the active detent.
  useLayoutEffect(() => {
    if (!open || !present) return;
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (!dialog || !panel) return;
    restoreTarget.current = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current;
    if (!dialog.open) dialog.showModal();
    const unlock = lockScroll();
    measure();
    if (extent.get() === 0) extent.set(0);
    go(activeExtent());
    const preferred = panel.querySelector<HTMLElement>('[autofocus], [data-autofocus]');
    (preferred ?? panel).focus({ preventScroll: true });
    return unlock;
  }, [open, present]);

  // Close: carry any release velocity into the exit, then leave the top layer.
  useEffect(() => {
    if (open || !present) return;
    const velocity = releaseVelocity.current;
    releaseVelocity.current = 0;
    go(0, velocity).then(() => {
      // Reopened mid-exit: the same spring is now heading back up.
      if (latest.current.open) return;
      dialogRef.current?.close();
      setPresent(false);
      const target = restoreTarget.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
    });
  }, [open, present]);

  // Follow controlled snap changes and viewport resizes.
  useEffect(() => {
    if (open && present && !drag.current) {
      measure();
      go(activeExtent());
    }
  }, [activeSnap]);

  useEffect(() => {
    if (!present) return;
    const onResize = () => {
      measure();
      if (open && !drag.current) extent.set(activeExtent());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [present, open, activeSnap, measure]);

  // While we own a touch drag, stop iOS from also scrolling the page or a scroll area.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onTouchMove = (event: TouchEvent) => {
      if (drag.current?.state === 'dragging') event.preventDefault();
    };
    panel.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => panel.removeEventListener('touchmove', onTouchMove);
  }, [present]);

  const requestClose = () => {
    if (dismissible) setOpen(false);
  };

  const settleAt = (target: number, velocity: number) => {
    if (target <= 0) {
      releaseVelocity.current = velocity;
      setOpen(false);
      return;
    }
    go(target, velocity);
    const snap = geometry.current.entries.find((e) => e.px === target)?.snap;
    if (snap !== undefined && snap !== activeSnap) setActiveSnap(snap);
  };

  const axisOf = (event: PointerEvent) => (vertical ? event.clientY : event.clientX);
  const crossOf = (event: PointerEvent) => (vertical ? event.clientX : event.clientY);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const target = event.target as Element;
    const interactive = target.closest('button, a, input, textarea, select, [contenteditable], [data-halo-no-drag]');
    if (interactive && !interactive.hasAttribute('data-halo-handle')) return;
    draggedRef.current = false;
    // Capture on the pressed element right away: a drag that starts on the handle leaves the
    // panel on its first move. Capturing the target (not the panel) keeps its clicks working.
    target.setPointerCapture(event.pointerId);
    drag.current = {
      start: axisOf(event),
      cross: crossOf(event),
      startExtent: extent.get(),
      pointerId: event.pointerId,
      scrollable: panelRef.current ? findScrollable(target, panelRef.current, vertical) : null,
      state: 'pending',
    };
    tracker.reset();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId || current.state === 'ignored') return;
    const delta = (axisOf(event) - current.start) * OPEN_SIGN[side];
    const { size, snaps } = geometry.current;
    const maxExtent = snaps[snaps.length - 1] ?? size;

    if (current.state === 'pending') {
      const crossDelta = Math.abs(crossOf(event) - current.cross);
      if (Math.abs(delta) < 5 && crossDelta < 5) return;
      if (crossDelta > Math.abs(delta)) {
        current.state = 'ignored';
        return;
      }
      const scroller = current.scrollable;
      if (scroller) {
        const atStart = (vertical ? scroller.scrollTop : scroller.scrollLeft) <= 0;
        const expanding = delta > 0 && current.startExtent < maxExtent - 1;
        // Closing gestures only take over once the content is scrolled back to its start;
        // opening gestures grow the drawer before the content scrolls.
        const closingFromStart = delta < 0 && atStart && OPEN_SIGN[side] === -1;
        if (!expanding && !closingFromStart) {
          current.state = 'ignored';
          return;
        }
      }
      current.state = 'dragging';
      draggedRef.current = true;
      panelRef.current?.setAttribute('data-dragging', '');
    }

    const minExtent = dismissible ? 0 : (snaps[0] ?? 0);
    let next = current.startExtent + delta;
    if (next > maxExtent) next = maxExtent + rubberband(next - maxExtent, size * 0.5, 0.35);
    if (next < minExtent) next = dismissible ? Math.max(next, 0) : minExtent - rubberband(minExtent - next, size);
    extent.set(next);
    tracker.add(next, event.timeStamp);
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    if (current.state !== 'dragging') return;
    panelRef.current?.removeAttribute('data-dragging');
    const velocity = cancelled ? 0 : tracker.velocity(event.timeStamp);
    const landing = extent.get() + project(velocity, SNAP_DECELERATION);
    const { snaps } = geometry.current;
    const candidates = dismissible ? [0, ...snaps] : snaps;
    settleAt(nearest(candidates, landing), velocity);
  };

  const stepSnap = (direction: 1 | -1) => {
    measure();
    const { snaps } = geometry.current;
    const current = nearest(snaps, extent.get());
    const index = snaps.indexOf(current) + direction;
    if (index < 0) return requestClose();
    const next = snaps[Math.min(index, snaps.length - 1)];
    if (next !== undefined) settleAt(next, 0);
  };

  if (!present) return null;

  return (
    <dialog
      ref={dialogRef}
      className="halo halo-drawer"
      data-halo-world={world}
      data-theme={theme}
      data-density={density}
      data-side={side}
      style={appearanceStyle('--halo-drawer-radius', radius, 40)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
    >
      {overlay && <div ref={overlayRef} className="halo-drawer-overlay" aria-hidden onClick={requestClose} />}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={['halo-drawer-panel', 'halo-surface', className].filter(Boolean).join(' ')}
        data-snaps={snapPoints?.length ? '' : undefined}
        {...props}
        style={{
          ...(snapPoints?.length
            ? {
                [vertical ? 'height' : 'width']: `max(${snapPoints
                  .map((s) => (typeof s === 'number' ? `${s * 100}${vertical ? 'dvh' : 'vw'}` : s))
                  .join(', ')})`,
              }
            : null),
          ...style,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => onPointerEnd(event, false)}
        onPointerCancel={(event) => onPointerEnd(event, true)}
        // Capture can vanish without a pointerup (app switch, OS gesture); settle as if released.
        onLostPointerCapture={(event) => onPointerEnd(event, true)}
      >
        <DrawerStepContext.Provider value={{ stepSnap, dragged: draggedRef }}>{children}</DrawerStepContext.Provider>
      </div>
    </dialog>
  );
}

const DrawerStepContext = createContext<{ stepSnap: (direction: 1 | -1) => void; dragged: RefObject<boolean> } | null>(null);

/**
 * The grabber. A real button: press to cycle detents, arrow keys to step.
 */
function Handle({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { side, snapPoints } = useDrawerContext('Handle');
  const step = useContext(DrawerStepContext);
  const vertical = VERTICAL[side];
  const multiple = (snapPoints?.length ?? 0) > 1;
  const openKey = { bottom: 'ArrowUp', top: 'ArrowDown', left: 'ArrowRight', right: 'ArrowLeft' }[side];
  const closeKey = { bottom: 'ArrowDown', top: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight' }[side];
  return (
    <button
      type="button"
      data-halo-handle=""
      className={['halo-drawer-handle', className].filter(Boolean).join(' ')}
      aria-label={multiple ? 'Resize drawer. Press, or use the arrow keys.' : 'Drawer handle. Use the arrow keys to close.'}
      data-orientation={vertical ? 'horizontal' : 'vertical'}
      onClick={() => {
        if (step?.dragged.current) return;
        if (multiple) step?.stepSnap(1);
      }}
      onKeyDown={(event) => {
        if (event.key === openKey) {
          event.preventDefault();
          step?.stepSnap(1);
        } else if (event.key === closeKey) {
          event.preventDefault();
          step?.stepSnap(-1);
        }
      }}
      {...props}
    >
      <span aria-hidden className="halo-drawer-grabber" />
    </button>
  );
}

function Title({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDrawerContext('Title');
  return <h2 id={titleId} className={['halo-drawer-title', className].filter(Boolean).join(' ')} {...props} />;
}

function Description({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDrawerContext('Description');
  return <p id={descriptionId} className={['halo-drawer-description', className].filter(Boolean).join(' ')} {...props} />;
}

function Close({ onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDrawerContext('Close');
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    />
  );
}

/**
 * A scroll area that cooperates with dragging: it scrolls until it reaches its start,
 * then the same gesture pulls the drawer.
 */
function Scroll({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={['halo-drawer-scroll', className].filter(Boolean).join(' ')} {...props} />;
}

export const Drawer = { Root, Trigger, Content, Handle, Title, Description, Close, Scroll };
