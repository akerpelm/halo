import {
  type SpringValue,
  clamp,
  createSpringValue,
  createVelocityTracker,
  resolveSpring,
  rubberband,
  useReducedMotion,
} from '@halo-ui/react/spring';
import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { useSettings } from '../lib/settings';

const PANE_SPRING = resolveSpring({ duration: 0.62, bounce: 0.34 });
const LIGHT_SPRING = resolveSpring({ duration: 0.9, bounce: 0 });
const REACH = 560;
const NUDGE = 1400;

type Rig = { x: SpringValue; y: SpringValue; tilt: SpringValue; lightX: SpringValue; lightY: SpringValue };

type HangingPaneProps = {
  /** Positions the stage. Wires hang from the stage's top edge. */
  className?: string;
  /** Positions and sizes the pane inside the stage, at rest. */
  anchorClassName?: string;
  /** Where the wires are fixed, in px from the stage top (e.g. under a sticky nav). */
  ceiling?: number;
};

/**
 * A pane hung from two wires. Grab it, fling it, let go: the release velocity
 * feeds the same spring solver the toast and drawer use.
 */
export function HangingPane({ className, anchorClassName, ceiling = 0 }: HangingPaneProps) {
  const { world, theme } = useSettings();
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const wiresRef = useRef<SVGSVGElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const etchRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);
  // Pane geometry at rest, cached so the frame loop never reads layout.
  const geometry = useRef({ width: 0, left: 0, top: 0, ceiling });
  const [trackers] = useState(() => ({ x: createVelocityTracker(), y: createVelocityTracker() }));

  const [rig] = useState<Rig>(() => {
    const state = { x: 0, y: 0, tilt: 0, lightX: 0, lightY: 0 };
    let light: Pick<Rig, 'lightX' | 'lightY'> | null = null;

    const render = () => {
      const pane = paneRef.current;
      if (!pane) return;
      pane.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${state.tilt}deg)`;
      pane.style.setProperty('--halo-shift', (state.x / 400 + state.tilt / 30).toFixed(3));
      if (lightRef.current) lightRef.current.style.transform = `translate3d(${state.lightX * 1.15}px, ${state.lightY * 0.5}px, 0)`;

      const wires = wiresRef.current;
      if (!wires) return;
      const paths = wires.querySelectorAll('path');
      const mounts = wires.querySelectorAll('rect');
      // Wires run from mounts on the ceiling to eyelets on the pane's rotated top edge.
      const { width, left, top, ceiling: ceilingY } = geometry.current;
      const angle = (state.tilt * Math.PI) / 180;
      const arm = width * 0.34;
      const centerX = left + width / 2;
      const restLength = top - ceilingY;
      [-1, 1].forEach((side, i) => {
        const ax = centerX + side * arm;
        const ay = ceilingY;
        const bx = centerX + state.x + side * arm * Math.cos(angle);
        const by = top + state.y + side * arm * Math.sin(angle);
        const dx = bx - ax;
        const dy = by - ay;
        const span = Math.hypot(dx, dy) || 1;
        // A cable can't compress: pushed closer than its length, it goes slack and bows outward.
        // Sag from the parabolic cable approximation L ≈ d + 8s²/3d.
        const slack = Math.max(0, restLength - span);
        // Capped so a big shove reads as slack, not a lasso.
        const sag = Math.min(Math.sqrt((3 * span * slack) / 8), 34);
        const nx = (-dy / span) * Math.sign(-dy || 1) * side;
        const ny = (dx / span) * Math.sign(-dy || 1) * side;
        const cx = (ax + bx) / 2 + nx * sag * 2;
        const cy = (ay + by) / 2 + ny * sag * 2;
        paths[i]?.setAttribute('d', `M${ax},${ay} Q${cx},${cy} ${bx},${by}`);
        mounts[i]?.setAttribute('x', String(ax - 9));
        mounts[i]?.setAttribute('y', String(ay - 1));
      });
    };

    const value = (key: keyof typeof state, config = PANE_SPRING) =>
      createSpringValue(0, config, (next) => {
        state[key] = next;
        // The cast light trails the pane on a softer spring.
        if (key === 'x') light?.lightX.to(next);
        if (key === 'y') light?.lightY.to(next);
        render();
      });

    const lightX = value('lightX', LIGHT_SPRING);
    const lightY = value('lightY', LIGHT_SPRING);
    light = { lightX, lightY };
    return { x: value('x'), y: value('y'), tilt: value('tilt'), lightX, lightY };
  });

  useEffect(() => {
    const anchor = anchorRef.current;
    const stage = stageRef.current;
    if (!anchor || !stage) return;
    const measure = () => {
      geometry.current = { width: anchor.offsetWidth, left: anchor.offsetLeft, top: anchor.offsetTop, ceiling };
      rig.x.offset(0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // The held moment: the pane waits at the top of its swing, then is released.
  useEffect(() => {
    if (reducedMotion) return;
    // Held far enough left that the opening swing crosses the headline, frosting real letters.
    rig.x.set(-300);
    rig.y.set(70);
    rig.tilt.set(11);
    const timer = window.setTimeout(() => {
      rig.x.to(0);
      rig.y.to(0);
      rig.tilt.to(0);
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  // Partition world: the pane is etched glass, and it clears in a disc under the pointer.
  useEffect(() => {
    if (world !== 'partition') return;
    const onMove = (event: globalThis.PointerEvent) => {
      const etch = etchRef.current;
      if (!etch) return;
      const box = etch.getBoundingClientRect();
      etch.style.setProperty('--mx', `${event.clientX - box.left}px`);
      etch.style.setProperty('--my', `${event.clientY - box.top}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [world]);

  const showReadout = (vx: number, vy: number) => {
    if (readoutRef.current) readoutRef.current.textContent = `${Math.round(Math.hypot(vx, vy)).toLocaleString('en-US')} px/s`;
  };

  const release = (vx: number, vy: number) => {
    showReadout(vx, vy);
    if (reducedMotion) {
      rig.x.set(0);
      rig.y.set(0);
      rig.tilt.set(0);
      return;
    }
    rig.x.to(0, { velocity: vx });
    rig.y.to(0, { velocity: vy });
    rig.tilt.to(0, { velocity: rig.tilt.getVelocity() - vx * 0.05 });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: rig.x.get(), originY: rig.y.get() };
    trackers.x.reset();
    trackers.y.reset();
    event.currentTarget.dataset.grabbing = '';
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const rawX = current.originX + event.clientX - current.startX;
    const rawY = current.originY + event.clientY - current.startY;
    const distance = Math.hypot(rawX, rawY);
    // The wires resist: the further you pull, the harder it gets.
    const banded = distance === 0 ? 0 : rubberband(distance, REACH, 0.55) / distance;
    const x = rawX * banded;
    const y = rawY * banded;
    rig.x.set(x);
    rig.y.set(y);
    trackers.x.add(x, event.timeStamp);
    trackers.y.add(y, event.timeStamp);
    if (!reducedMotion) rig.tilt.to(clamp(-trackers.x.velocity(event.timeStamp) * 0.006, -14, 14));
  };

  const endDrag = (time: number) => {
    if (!drag.current) return;
    drag.current = null;
    delete paneRef.current?.dataset.grabbing;
    release(trackers.x.velocity(time), trackers.y.velocity(time));
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    endDrag(event.timeStamp);
  };

  // A drag can end without a pointerup: Safari drops capture outside the window, and the OS can
  // steal the gesture (app switch, right-click, native drag). Any of those must still let go.
  useEffect(() => {
    const letGo = () => endDrag(performance.now());
    const onVisibility = () => document.hidden && letGo();
    window.addEventListener('pointerup', letGo);
    window.addEventListener('blur', letGo);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pointerup', letGo);
      window.removeEventListener('blur', letGo);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const impulses: Record<string, [number, number]> = {
      ArrowLeft: [-NUDGE, 0],
      ArrowRight: [NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    };
    const impulse = impulses[event.key];
    if (!impulse) return;
    event.preventDefault();
    release(rig.x.getVelocity() + impulse[0], rig.y.getVelocity() + impulse[1]);
  };

  return (
    <div ref={stageRef} className={cn('pointer-events-none select-none', className)}>
      {/* Light falls on the wall and the wall text alike: multiply tints without washing letters out. */}
      <div ref={lightRef} aria-hidden className={cn('cast absolute z-10 h-56', anchorClassName)}>
        <div className="pool top-[96%] left-[2%] h-[60%] w-[50%] bg-coat-a" />
        <div className="pool top-[104%] right-[0%] h-[64%] w-[48%] bg-coat-b" />
        <div className="pool top-[150%] left-[26%] h-[70%] w-[46%] bg-coat-c" />
      </div>

      <svg ref={wiresRef} aria-hidden className="absolute inset-0 z-10 h-full w-full overflow-visible">
        <path fill="none" stroke="var(--wire)" strokeWidth="1.25" strokeLinecap="round" />
        <path fill="none" stroke="var(--wire)" strokeWidth="1.25" strokeLinecap="round" />
        <rect width="18" height="5" rx="2.5" fill="var(--wire)" />
        <rect width="18" height="5" rx="2.5" fill="var(--wire)" />
      </svg>

      <div ref={anchorRef} className={cn('absolute z-20', anchorClassName)}>

        <div
          ref={paneRef}
          tabIndex={0}
          role="group"
          aria-roledescription="spring demo"
          aria-label="A pane on a spring. Drag and release it, or press the arrow keys to nudge it."
          data-halo-world={world}
          data-theme={theme}
          className="halo halo-surface pointer-events-auto relative isolate cursor-grab touch-none p-6 [--halo-radius:28px] data-[grabbing]:cursor-grabbing partition:bg-transparent partition:backdrop-filter-none sm:p-9"
          style={{ transformOrigin: '50% 0' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onLostPointerCapture={(event) => drag.current?.pointerId === event.pointerId && endDrag(event.timeStamp)}
          onKeyDown={onKeyDown}
        >
          {/* Eyelets live on the pane, so they rotate with it and the wire always meets them. */}
          {[16, 84].map((x) => (
            <span
              key={x}
              aria-hidden
              className="absolute -top-[5px] size-[10px] -translate-x-1/2 rounded-full border-[1.5px] border-wire bg-wall"
              style={{ left: `${x}%` }}
            />
          ))}
          {world === 'partition' && <div ref={etchRef} aria-hidden className="etched absolute inset-0 -z-10 rounded-[inherit]" />}
          <div className="flex items-start gap-4">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden className="mt-1 flex-none text-[var(--halo-success)]">
              <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="m6.5 10.2 2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="min-w-0">
              <p className="m-0 font-display text-[clamp(1.2rem,2.4vw,1.75rem)] leading-tight font-semibold tracking-[-0.015em]">Grab me, then let go.</p>
              <p className="m-0 mt-2 text-[16px] leading-normal text-[var(--halo-fg-muted)]">
                The speed you let go at carries straight into the spring. Nothing here runs on a timer.
              </p>
            </div>
          </div>
          <p className="m-0 mt-5 flex items-baseline justify-between border-t border-[color-mix(in_oklch,var(--halo-fg)_10%,transparent)] pt-3 text-[12px] text-[var(--halo-fg-muted)]">
            <span>Last release</span>
            <span ref={readoutRef} className="font-mono text-[var(--halo-fg)] tabular-nums">
              0 px/s
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
