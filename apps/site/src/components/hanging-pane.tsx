import {
  type SpringValue,
  clamp,
  createSpringValue,
  createVelocityTracker,
  resolveSpring,
  rubberband,
  useReducedMotion,
} from 'halo-ui-react/spring';
import { type KeyboardEvent, type PointerEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { type Anchor, type Cable, type Edge, cablePaths, createCable, stepCable } from '../lib/cable';
import { useSettings } from '../lib/settings';

const PANE_SPRING = resolveSpring({ duration: 0.48, bounce: 0.36 });
const LIGHT_SPRING = resolveSpring({ duration: 0.9, bounce: 0 });
const REACH = 560;
const NUDGE = 1400;
const TAUT = 0.994;

type Rig = { x: SpringValue; y: SpringValue; tilt: SpringValue; lightX: SpringValue; lightY: SpringValue };

type HangingPaneProps = {
  className?: string;
  anchorClassName?: string;
  ceiling?: number;
  children?: ReactNode;
  label?: string;
  paneClassName?: string;
  swingIn?: boolean;
  world?: string;
  light?: boolean;
};

function CeilingMount() {
  return (
    <g data-mount="">
      <rect className="rig-shadow-fill" x="-6" y="5" width="16" height="9" rx="3" />
      <rect className="rig-plate" x="-9" y="-1" width="18" height="3" rx="1" />
      <rect className="rig-plate-edge" x="-9" y="1.5" width="18" height="0.75" rx="0.375" />
      <rect className="rig-barrel" x="-2.75" y="2" width="5.5" height="7" rx="1.5" />
      <rect className="rig-glint" x="-1.6" y="2.6" width="1.1" height="5.6" rx="0.55" />
    </g>
  );
}

export function HangingPane({
  className,
  anchorClassName,
  ceiling = 0,
  children,
  label = 'A pane on a spring. Drag and release it, or press the arrow keys to nudge it.',
  paneClassName = 'p-6 [--halo-radius:28px] sm:p-9',
  swingIn = true,
  world: worldOverride,
  light = true,
}: HangingPaneProps) {
  const settings = useSettings();
  const world = worldOverride ?? settings.world;
  const theme = settings.theme;
  const reducedMotion = useReducedMotion();
  const still = useRef(reducedMotion);
  still.current = reducedMotion;
  const stageRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const wiresRef = useRef<SVGSVGElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const etchRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const geometry = useRef({ width: 0, left: 0, top: 0, ceiling });
  const [trackers] = useState(() => ({ x: createVelocityTracker(), y: createVelocityTracker() }));

  const [rig] = useState<Rig>(() => {
    const state = { x: 0, y: 0, tilt: 0, lightX: 0, lightY: 0 };
    let light: Pick<Rig, 'lightX' | 'lightY'> | null = null;
    const rope = { cables: [] as Cable[], sides: [] as Array<{ a: Anchor; b: Anchor; length: number; outward: number }>, edge: null as Edge | null, frame: 0, last: 0, quiet: 0 };

    const draw = () => {
      const wires = wiresRef.current;
      if (!wires) return;
      const bodies = wires.querySelectorAll('[data-cable]');
      const sheens = wires.querySelectorAll('[data-cable-sheen]');
      const shadows = wires.querySelectorAll('[data-cable-shadow]');
      rope.cables.forEach((cable, i) => {
        const paths = cablePaths(cable);
        bodies[i]?.setAttribute('d', paths.body);
        sheens[i]?.setAttribute('d', paths.sheen);
        shadows[i]?.setAttribute('d', paths.shadow);
      });
    };

    const tick = (now: number) => {
      const dt = Math.min((now - rope.last) / 1000, 1 / 30);
      rope.last = now;
      let motion = 0;
      rope.cables.forEach((cable, i) => {
        const side = rope.sides[i];
        if (!side || !rope.edge) return;
        motion += stepCable(cable, side.a, side.b, side.length, side.outward, dt / 2, rope.edge);
        motion += stepCable(cable, side.a, side.b, side.length, side.outward, dt / 2, rope.edge);
      });
      draw();
      rope.quiet = motion < 0.04 ? rope.quiet + 1 : 0;
      rope.frame = rope.quiet > 30 ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      if (rope.frame || still.current) return;
      rope.last = performance.now();
      rope.quiet = 0;
      rope.frame = requestAnimationFrame(tick);
    };

    const render = () => {
      const pane = paneRef.current;
      if (!pane) return;
      pane.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${state.tilt}deg)`;
      pane.style.setProperty('--halo-shift', (state.x / 400 + state.tilt / 30).toFixed(3));
      if (lightRef.current) lightRef.current.style.transform = `translate3d(${state.lightX * 1.15}px, ${state.lightY * 0.5}px, 0)`;

      const wires = wiresRef.current;
      if (!wires) return;
      const mounts = wires.querySelectorAll('[data-mount]');
      const { width, left, top, ceiling: ceilingY } = geometry.current;
      const angle = (state.tilt * Math.PI) / 180;
      const arm = width * 0.34;
      const centerX = left + width / 2;
      const length = (top - ceilingY) * TAUT;
      const half = width / 2;
      rope.edge = {
        from: { x: centerX + state.x - half * Math.cos(angle), y: top + state.y - half * Math.sin(angle) },
        to: { x: centerX + state.x + half * Math.cos(angle), y: top + state.y + half * Math.sin(angle) },
      };
      rope.sides = [-1, 1].map((side) => ({
        a: { x: centerX + side * arm, y: ceilingY },
        b: { x: centerX + state.x + side * arm * Math.cos(angle), y: top + state.y + side * arm * Math.sin(angle) },
        length,
        outward: side,
      }));
      rope.sides.forEach((side, i) => {
        mounts[i]?.setAttribute('transform', `translate(${side.a.x} ${side.a.y})`);
        const cable = rope.cables[i];
        const ceilingMoved = cable && (cable.points[0]?.x !== side.a.x || cable.points[0]?.y !== side.a.y);
        if (!cable || ceilingMoved || still.current) {
          rope.cables[i] = createCable(side.a, side.b);
          return;
        }
        const first = cable.points[0];
        const end = cable.points[cable.points.length - 1];
        if (first) Object.assign(first, { x: side.a.x, y: side.a.y, px: side.a.x, py: side.a.y });
        if (end) Object.assign(end, { x: side.b.x, y: side.b.y, px: side.b.x, py: side.b.y });
      });
      draw();
      wake();
    };

    const value = (key: keyof typeof state, config = PANE_SPRING) =>
      createSpringValue(0, config, (next) => {
        state[key] = next;
        if (key === 'x') light?.lightX.to(next);
        if (key === 'y') light?.lightY.to(next);
        render();
      });

    const lightX = value('lightX', LIGHT_SPRING);
    const lightY = value('lightY', LIGHT_SPRING);
    light = { lightX, lightY };
    return { x: value('x'), y: value('y'), tilt: value('tilt'), lightX, lightY };
  });

  useLayoutEffect(() => {
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

  useEffect(() => {
    if (!swingIn || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    if ((event.target as Element).closest('button, a, input, select, textarea, [data-no-drag]')) return;
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
      <div ref={lightRef} aria-hidden className={cn('cast absolute z-10 h-56', anchorClassName, !light && 'hidden')}>
        <div className="pool top-[96%] left-[2%] h-[60%] w-[50%] bg-coat-a" />
        <div className="pool top-[104%] right-[0%] h-[64%] w-[48%] bg-coat-b" />
        <div className="pool top-[150%] left-[26%] h-[70%] w-[46%] bg-coat-c" />
      </div>

      <svg ref={wiresRef} aria-hidden className="rig absolute inset-0 z-10 h-full w-full overflow-visible">
        {[0, 1].map((i) => (
          <path key={i} data-cable-shadow="" className="rig-shadow" />
        ))}
        {[0, 1].map((i) => (
          <g key={i}>
            <path data-cable="" className="rig-cable" />
            <path data-cable-sheen="" className="rig-sheen" />
          </g>
        ))}
        {[0, 1].map((i) => (
          <CeilingMount key={i} />
        ))}
      </svg>

      <div ref={anchorRef} className={cn('absolute z-20', anchorClassName)}>

        <div
          ref={paneRef}
          tabIndex={0}
          role="group"
          aria-roledescription="spring demo"
          aria-label={label}
          data-halo-world={world}
          data-theme={theme}
          className={cn(
            'halo halo-surface pointer-events-auto relative isolate cursor-grab touch-none data-[grabbing]:cursor-grabbing partition:bg-transparent partition:backdrop-filter-none',
            paneClassName,
          )}
          style={{ transformOrigin: '50% 0' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onLostPointerCapture={(event) => drag.current?.pointerId === event.pointerId && endDrag(event.timeStamp)}
          onKeyDown={onKeyDown}
        >
          {[16, 84].map((x) => (
            <span key={x} aria-hidden className="rig rig-clamp" style={{ left: `${x}%` }} />
          ))}
          {world === 'partition' && <div ref={etchRef} aria-hidden className="etched absolute inset-0 -z-10 rounded-[inherit]" />}
          {children ?? (
          <>
          <div className="flex items-start gap-4">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden className="mt-1 flex-none text-[var(--halo-success)]">
              <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="m6.5 10.2 2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="min-w-0">
              <p className="m-0 font-display text-[clamp(1.2rem,2.4vw,1.75rem)] leading-tight font-semibold tracking-[-0.015em]">Grab me, then let go.</p>
              <p className="m-0 mt-2 text-body leading-normal text-[var(--halo-fg-muted)]">
                Throw it. The readout shows the speed it kept.
              </p>
            </div>
          </div>
          <p className="m-0 mt-5 flex items-baseline justify-between border-t border-[color-mix(in_oklch,var(--halo-fg)_10%,transparent)] pt-3 text-caption text-[var(--halo-fg-muted)]">
            <span>Release speed</span>
            <span ref={readoutRef} className="font-mono text-[var(--halo-fg)] tabular-nums">
              0 px/s
            </span>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
