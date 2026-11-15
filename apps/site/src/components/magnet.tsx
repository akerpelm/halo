// Adapted from React Bits "Magnet" (installed via the shadcn CLI, then owned).
// Kept: nearest-magnet arbitration and the falloff curve. Changed: motion runs on Halo's spring engine.
import { type SpringInput, createSpringValue, resolveSpring, useReducedMotion } from '@halo-ui/react/spring';
import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from '../lib/cn';

type MagnetProps = {
  children: ReactNode;
  /** How far outside the element, in px, the cursor starts to pull it. */
  padding?: number;
  /** The offset is the cursor distance divided by this. Higher moves less. */
  strength?: number;
  /** Hard cap on travel in px. */
  maxOffset?: number;
  spring?: SpringInput;
  className?: string;
};

type Entry = { element: HTMLElement; padding: number; update: (pointer: Point | null, owner: boolean) => void };
type Point = { x: number; y: number };

const registry = new Set<Entry>();
let pointer: Point | null = null;
let detach: (() => void) | null = null;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

function distanceOutside(rect: DOMRect, point: Point) {
  const dx = point.x - (rect.left + rect.width / 2);
  const dy = point.y - (rect.top + rect.height / 2);
  return { dx, dy, outside: Math.hypot(Math.max(0, Math.abs(dx) - rect.width / 2), Math.max(0, Math.abs(dy) - rect.height / 2)) };
}

/** Only the nearest magnet in range pulls, so neighbouring buttons never fight. */
function arbitrate() {
  let owner: Entry | null = null;
  let nearest = Number.POSITIVE_INFINITY;
  if (pointer) {
    for (const entry of registry) {
      const { outside } = distanceOutside(entry.element.getBoundingClientRect(), pointer);
      if (outside <= entry.padding && outside < nearest) {
        owner = entry;
        nearest = outside;
      }
    }
  }
  for (const entry of registry) entry.update(pointer, entry === owner);
}

function listen() {
  const onMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    arbitrate();
  };
  const onLeave = () => {
    pointer = null;
    arbitrate();
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('blur', onLeave);
  document.documentElement.addEventListener('pointerleave', onLeave);
  return () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('blur', onLeave);
    document.documentElement.removeEventListener('pointerleave', onLeave);
  };
}

/** Leans its child toward the cursor on a spring, then lets it settle back with a little give. */
export function Magnet({ children, padding = 60, strength = 4, maxOffset = 10, spring = { duration: 0.5, bounce: 0.4 }, className }: MagnetProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner || reducedMotion) return;
    const config = resolveSpring(spring);
    const offset = { x: 0, y: 0 };
    const render = () => {
      inner.style.transform = offset.x || offset.y ? `translate3d(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px, 0)` : '';
    };
    const x = createSpringValue(0, config, (v) => ((offset.x = v), render()));
    const y = createSpringValue(0, config, (v) => ((offset.y = v), render()));

    const entry: Entry = {
      element: wrapper,
      padding,
      update(point, owner) {
        if (!point || !owner) {
          x.to(0);
          y.to(0);
          return;
        }
        const { dx, dy, outside } = distanceOutside(wrapper.getBoundingClientRect(), point);
        const pull = 1 - smoothstep(padding * 0.5, padding, outside);
        let tx = (dx / strength) * pull;
        let ty = (dy / strength) * pull;
        const length = Math.hypot(tx, ty);
        if (length > maxOffset) {
          tx *= maxOffset / length;
          ty *= maxOffset / length;
        }
        x.to(tx);
        y.to(ty);
      },
    };
    registry.add(entry);
    detach ??= listen();
    return () => {
      registry.delete(entry);
      if (registry.size === 0) {
        detach?.();
        detach = null;
      }
    };
  }, [padding, strength, maxOffset, reducedMotion]);

  return (
    <span ref={wrapperRef} className={cn('inline-block', className)}>
      <span ref={innerRef} className="inline-block will-change-transform">
        {children}
      </span>
    </span>
  );
}
