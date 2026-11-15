// Adapted from React Bits "CountUp" (installed via the shadcn CLI, then owned).
// Changed: counts on Halo's spring engine instead of motion, and re-counts from the last value
// whenever `value` changes, so live readouts glide rather than jump.
import { createSpringValue, resolveSpring, useReducedMotion } from '@halo-ui/react/spring';
import { useEffect, useRef, useState } from 'react';

type CountUpProps = {
  value: number;
  /** Decimal places to show. */
  decimals?: number;
  suffix?: string;
  className?: string;
};

const COUNT = resolveSpring({ duration: 0.9, bounce: 0 });

/**
 * A number that springs to its value the first time it scrolls into view, then glides
 * between values. Screen readers get the final value straight away.
 */
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

  // An IntersectionObserver is the outside system here: start counting once the number is visible.
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
        {format(0)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
