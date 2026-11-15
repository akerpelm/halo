import { createSpringValue, resolveSpring, useReducedMotion } from 'halo-ui-react/spring';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type CountUpProps = {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
};

const COUNT = resolveSpring({ duration: 0.9, bounce: 0 });

export function CountUp({ value, decimals = 0, suffix = '', className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const format = (n: number) => `${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  const [spring] = useState(() =>
    createSpringValue(0, COUNT, (n) => {
      if (ref.current) ref.current.textContent = format(n);
    }),
  );
  const [seen, setSeen] = useState(false);
  const [settled] = useState(() => format(value));

  useLayoutEffect(() => {
    if (ref.current) ref.current.textContent = format(0);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setSeen(true), { threshold: 0.6 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen]);

  useEffect(() => {
    if (!seen) return;
    if (reducedMotion) spring.set(value);
    else spring.to(value);
  }, [seen, value, reducedMotion]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden className="tabular-nums">
        {settled}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
