import { createSpringValue, resolveSpring, useReducedMotion } from '@halo-ui/react/spring';
import { type HTMLAttributes, type PointerEvent, useRef, useState } from 'react';
import { cn } from '../lib/cn';

type SpotlightProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

const TRAIL = resolveSpring({ duration: 0.45, bounce: 0 });
const FADE = resolveSpring('smooth');

export function Spotlight({ size = 220, className, children, ...props }: SpotlightProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [light] = useState(() => {
    const state = { x: 0, y: 0, opacity: 0 };
    const render = () => {
      const el = lightRef.current;
      const root = rootRef.current;
      if (!el || !root) return;
      el.style.transform = `translate3d(${state.x - size}px, ${state.y - size}px, 0)`;
      el.style.opacity = String(state.opacity);
      root.style.setProperty('--halo-shift', ((state.x / (root.offsetWidth || 1) - 0.5) * 2).toFixed(3));
    };
    return {
      x: createSpringValue(0, TRAIL, (v) => ((state.x = v), render())),
      y: createSpringValue(0, TRAIL, (v) => ((state.y = v), render())),
      opacity: createSpringValue(0, FADE, (v) => ((state.opacity = v), render())),
    };
  });

  const follow = (event: PointerEvent<HTMLDivElement>, entering = false) => {
    if (event.pointerType === 'touch') return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (entering || reducedMotion) {
      light.x.set(x);
      light.y.set(y);
    } else {
      light.x.to(x);
      light.y.to(y);
    }
    light.opacity.to(1);
  };

  return (
    <div
      ref={rootRef}
      className={cn('relative isolate overflow-hidden', className)}
      onPointerEnter={(event) => follow(event, true)}
      onPointerMove={(event) => follow(event)}
      onPointerLeave={() => light.opacity.to(0)}
      {...props}
    >
      {children}
      <div
        ref={lightRef}
        aria-hidden
        className="spotlight pointer-events-none absolute top-0 left-0 z-10 rounded-full opacity-0"
        style={{ width: size * 2, height: size * 2 }}
      />
    </div>
  );
}
