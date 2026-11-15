import { type SpringInput, resolveSpring, sampleSpring, settlingTime } from 'halo-ui-react/spring';

type SpringCurveProps = { spring: SpringInput; className?: string };

export function SpringCurve({ spring, className }: SpringCurveProps) {
  const config = resolveSpring(spring);
  const samples = sampleSpring(config, 80, 2.5);
  const seconds = settlingTime(config, 2.5);
  const peak = Math.max(...samples);
  const width = 320;
  const height = 120;
  const top = 14;
  const scaleY = (value: number) => height - 12 - (value / Math.max(peak, 1)) * (height - 12 - top);
  const path = samples.map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / (samples.length - 1)) * width).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ');
  const overshoot = Math.max(0, (peak - 1) * 100);

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible" role="img" aria-labelledby="spring-curve-caption">
        <line x1="0" x2={width} y1={scaleY(1)} y2={scaleY(1)} stroke="var(--line)" strokeDasharray="3 4" />
        <line x1="0" x2={width} y1={scaleY(0)} y2={scaleY(0)} stroke="var(--line)" />
        <path d={path} fill="none" stroke="var(--ink)" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
      <figcaption id="spring-curve-caption" className="mt-2 flex justify-between text-caption text-ink-faint tabular-nums">
        <span>Settles in {Math.round(seconds * 1000)} ms</span>
        <span>{overshoot < 0.5 ? 'No overshoot' : `${overshoot.toFixed(0)}% overshoot`}</span>
      </figcaption>
    </figure>
  );
}
