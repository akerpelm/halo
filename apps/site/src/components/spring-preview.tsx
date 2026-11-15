import { type SpringInput, createSpringValue, resolveSpring, useReducedMotion } from 'haloui/spring';
import { useEffect, useRef, useState } from 'react';

export function SpringPreview({ spring }: { spring: SpringInput }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const puckRef = useRef<HTMLSpanElement>(null);
  const side = useRef(0);
  const reducedMotion = useReducedMotion();
  const [puck] = useState(() =>
    createSpringValue(0, resolveSpring('smooth'), (p) => {
      const track = trackRef.current;
      const el = puckRef.current;
      if (!track || !el) return;
      el.style.transform = `translate3d(${p * (track.offsetWidth - el.offsetWidth)}px, 0, 0)`;
    }),
  );

  const play = () => {
    side.current = side.current === 0 ? 1 : 0;
    if (reducedMotion) puck.set(side.current);
    else puck.to(side.current, { config: resolveSpring(spring), velocity: 0 });
  };

  const key = JSON.stringify(spring);
  const shown = useRef(key);
  useEffect(() => {
    if (shown.current === key) return;
    shown.current = key;
    play();
  }, [key]);

  return (
    <div className="flex items-center gap-3">
      <div ref={trackRef} className="relative h-9 flex-1 rounded-full bg-ink/[0.06] p-1 dark:bg-ink/[0.09]">
        <span aria-hidden className="absolute inset-y-1/2 right-5 left-5 h-px bg-line" />
        <span ref={puckRef} aria-hidden className="relative block size-7 rounded-full bg-ink shadow-[0_2px_6px_oklch(0%_0_0/0.25)] will-change-transform" />
      </div>
      <button
        type="button"
        onClick={play}
        className="h-9 cursor-pointer rounded-full bg-ink/[0.06] px-3.5 pointer-coarse:h-11 text-label text-ink transition-colors duration-150 hover:bg-ink/[0.11] dark:bg-ink/[0.09]"
      >
        Replay
      </button>
    </div>
  );
}
