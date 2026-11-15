import { type HTMLAttributes, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { nearest } from '../../gesture/projection';
import { resolveSpring } from '../../spring/spring-config';
import { radiusStyle } from '../../utils/appearance';
import { cx } from '../../utils/cx';
import { lockScroll } from '../../utils/scroll-lock';
import { useReducedMotion } from '../../utils/use-media-query';
import { useDrawerRootContext } from '../root/drawer-root-context';
import { EMPTY_GEOMETRY, isVertical, measureGeometry, restingExtent, snapSizeStyle } from '../utils/geometry';
import { DrawerContentContext } from './drawer-content-context';
import { useDrawerDrag } from './use-drawer-drag';
import { useDrawerExtent } from './use-drawer-extent';
import { useRecess } from './use-recess';

export type DrawerContentProps = HTMLAttributes<HTMLDivElement> & {
  /** Hide the default overlay, e.g. to keep the page visible behind a sheet. */
  overlay?: boolean;
};

export function DrawerContent({ children, className, overlay = true, style, ...props }: DrawerContentProps) {
  const root = useDrawerRootContext('Content');
  const { open, setOpen, side, snapPoints, activeSnap, setActiveSnap, dismissible, recess, triggerRef } = root;
  const reducedMotion = useReducedMotion();
  const config = useMemo(() => resolveSpring(root.spring), [root.spring]);
  const vertical = isVertical(side);
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const restoreTarget = useRef<HTMLElement | null>(null);
  const releaseVelocity = useRef(0);
  const geometry = useRef(EMPTY_GEOMETRY);
  const state = useRef({ open, side, recess, reducedMotion });
  state.current = { open, side, recess, reducedMotion };

  const followRecess = useRecess(state);
  const { extent, go } = useDrawerExtent({ panelRef, overlayRef, geometry, state, config, onProgress: followRecess });

  const measure = useCallback(() => {
    if (panelRef.current) geometry.current = measureGeometry(panelRef.current, snapPoints, vertical);
  }, [snapPoints, vertical]);
  const rest = () => restingExtent(geometry.current, activeSnap, vertical);
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

  const drag = useDrawerDrag({ panelRef, extent, geometry, side, dismissible, present, onSettle: settleAt });

  const stepSnap = (direction: 1 | -1) => {
    measure();
    const { snaps } = geometry.current;
    const index = snaps.indexOf(nearest(snaps, extent.get())) + direction;
    if (index < 0) return requestClose();
    const next = snaps[Math.min(index, snaps.length - 1)];
    if (next !== undefined) settleAt(next, 0);
  };

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (!open || !present || !dialog || !panel) return;
    restoreTarget.current = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current;
    if (!dialog.open) dialog.showModal();
    const unlock = lockScroll();
    measure();
    if (extent.get() === 0) extent.set(0);
    go(rest());
    const preferred = panel.querySelector<HTMLElement>('[autofocus], [data-autofocus]');
    (preferred ?? panel).focus({ preventScroll: true });
    return unlock;
  }, [open, present]);

  useEffect(() => {
    if (open || !present) return;
    const velocity = releaseVelocity.current;
    releaseVelocity.current = 0;
    go(0, velocity).then(() => {
      if (state.current.open) return;
      dialogRef.current?.close();
      setPresent(false);
      const target = restoreTarget.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
    });
  }, [open, present]);

  useEffect(() => {
    if (!open || !present || drag.isDragging()) return;
    measure();
    go(rest());
  }, [activeSnap]);

  useEffect(() => {
    if (!present) return;
    const onResize = () => {
      measure();
      if (open && !drag.isDragging()) extent.set(rest());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [present, open, activeSnap, measure]);

  if (!present) return null;

  return (
    <dialog
      ref={dialogRef}
      className="halo halo-drawer"
      data-halo-world={root.world}
      data-theme={root.theme}
      data-density={root.density}
      data-side={side}
      style={radiusStyle('--halo-drawer-radius', root.radius, 40)}
      aria-labelledby={root.titleId}
      aria-describedby={root.descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
    >
      {overlay && <div ref={overlayRef} className="halo-drawer-overlay" aria-hidden onClick={requestClose} />}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cx('halo-drawer-panel', 'halo-surface', className)}
        data-snaps={snapPoints?.length ? '' : undefined}
        {...props}
        style={{ ...snapSizeStyle(snapPoints, vertical), ...style }}
        {...drag.handlers}
      >
        <DrawerContentContext.Provider value={{ stepSnap, wasDragged: drag.wasDragged }}>{children}</DrawerContentContext.Provider>
      </div>
    </dialog>
  );
}
