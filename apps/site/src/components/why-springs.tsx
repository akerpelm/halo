import { createVelocityTracker, project, resolveSpring, useReducedMotion } from 'halo-ui-react/spring';
import { type KeyboardEvent, type PointerEvent, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { type CurveSegment, type SpringSegment, curveAt, latest, springAt } from '../lib/motion-curves';
import { cn } from '../lib/cn';
import { useSettings } from '../lib/settings';

const SPRING = resolveSpring({ duration: 0.5, bounce: 0.12 });
const CURVE_MS = 400;
const BEFORE_MS = 350;
const AFTER_MS = 1000;
const DOCK_SHARE = 0.2;
const KEY_THROW = 1600;
const STEPS = 160;
const VIEW = { width: 600, height: 160 };

type Episode = {
  anchor: number;
  hand: { t: number; v: number }[];
  springs: SpringSegment[];
  curves: CurveSegment[];
};
type Mark = { t: number; label: string };
type Drag = { pointerId: number; startX: number; spring: number; curve: number; onPane: boolean };

const speed = (v: number) => Math.round(Math.abs(v)).toLocaleString('en-US');

function handAt(hand: Episode['hand'], time: number) {
  let v = 0;
  for (const sample of hand) if (sample.t <= time) v = sample.v;
  return v;
}

function velocitiesAt(episode: Episode, time: number) {
  const spring = latest(episode.springs, time);
  const curve = latest(episode.curves, time);
  if (spring && curve) return { spring: springAt(SPRING, spring, time).velocity, curve: curveAt(curve, time).velocity };
  const hand = handAt(episode.hand, time);
  return { spring: hand, curve: hand };
}

function releaseText(thrown: number, curveStart: number) {
  if (Math.abs(thrown) < 60) return 'You let go without throwing, so both settled the same way. Throw it toward the other side to see them part.';
  const spring = `You let go at ${speed(thrown)} px/s. The spring set off at that same speed and eased into place.`;
  if (Math.abs(curveStart) < 1) return `${spring} The fixed curve was already there, so your throw did nothing to it.`;
  const opposite = Math.sign(curveStart) !== Math.sign(thrown);
  return `${spring} The fixed curve set off at ${speed(curveStart)} px/s${opposite ? ', back the other way' : ', whatever your hand was doing'}.`;
}

function tapText(springSpeed: number, curveStart: number, reduced: boolean) {
  if (reduced) return `With reduced motion both jump straight there. The graph shows what would have happened: the spring keeps its ${speed(springSpeed)} px/s, the fixed curve restarts at ${speed(curveStart)} px/s.`;
  if (Math.abs(springSpeed) < 40) return 'Both were at rest, so they set off together. Tap again while they are moving to see them part.';
  return `Mid-flight at ${speed(springSpeed)} px/s, the spring bent toward the new spot without stopping. The fixed curve threw that away and restarted at ${speed(curveStart)} px/s.`;
}

function Docks() {
  return (
    <>
      <span aria-hidden className="absolute inset-y-3 left-[30%] border-l border-dashed border-line" />
      <span aria-hidden className="absolute inset-y-3 right-[30%] border-l border-dashed border-line" />
    </>
  );
}

export function WhySprings() {
  const { world, theme } = useSettings();
  const reducedMotion = useReducedMotion();
  const readoutId = useId();
  const laneRef = useRef<HTMLDivElement>(null);
  const springRef = useRef<HTMLDivElement>(null);
  const curveRef = useRef<HTMLDivElement>(null);
  const springPathRef = useRef<SVGPathElement>(null);
  const jumpPathRef = useRef<SVGPathElement>(null);
  const springDotsRef = useRef<SVGPathElement>(null);
  const curvePathRef = useRef<SVGPathElement>(null);
  const episode = useRef<Episode | null>(null);
  const drag = useRef<Drag | null>(null);
  const position = useRef({ spring: 0, curve: 0 });
  const rest = useRef(0);
  const frame = useRef(0);
  const [tracker] = useState(createVelocityTracker);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [readout, setReadout] = useState<string | null>(null);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const limit = () => Math.max(0, (laneRef.current?.offsetWidth ?? 400) / 2 - 84);
  const dock = () => Math.min(limit(), (laneRef.current?.offsetWidth ?? 400) * DOCK_SHARE);

  useLayoutEffect(() => {
    position.current = { spring: -dock(), curve: -dock() };
    rest.current = -dock();
    place();
  }, []);

  const dockFor = (from: number, velocity: number) => {
    const landing = from + project(velocity);
    return Math.abs(landing + dock()) <= Math.abs(landing - dock()) ? -dock() : dock();
  };

  const place = () => {
    if (springRef.current) springRef.current.style.transform = `translateX(${position.current.spring}px)`;
    if (curveRef.current) curveRef.current.style.transform = `translateX(${position.current.curve}px)`;
  };

  const draw = (now: number) => {
    const current = episode.current;
    if (!current) return;
    const start = current.anchor - BEFORE_MS;
    const end = reducedMotion ? current.anchor + AFTER_MS : Math.min(now, current.anchor + AFTER_MS);
    const points: { x: number; spring: number; curve: number }[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = start + ((BEFORE_MS + AFTER_MS) * i) / STEPS;
      if (t > end) break;
      points.push({ x: (VIEW.width * i) / STEPS, ...velocitiesAt(current, t) });
    }
    const scale = Math.max(600, ...points.map((p) => Math.max(Math.abs(p.spring), Math.abs(p.curve))));
    const y = (v: number) => VIEW.height / 2 - (v / scale) * (VIEW.height / 2 - 8);
    const path = (key: 'spring' | 'curve') => points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ');
    springPathRef.current?.setAttribute('d', path('spring'));
    curvePathRef.current?.setAttribute('d', path('curve'));
    const events = [...current.springs.map((s) => s.start)].filter((t) => t >= start && t <= end);
    const dot = (x: number, yy: number) => `M${(x - 0.01).toFixed(2)} ${yy.toFixed(1)} L${x.toFixed(2)} ${yy.toFixed(1)}`;
    const xAt = (t: number) => ((t - start) / (BEFORE_MS + AFTER_MS)) * VIEW.width;
    jumpPathRef.current?.setAttribute(
      'd',
      events
        .map((t) => {
          const before = velocitiesAt(current, t - 1).curve;
          const after = velocitiesAt(current, t).curve;
          return `M${xAt(t).toFixed(1)} ${y(before).toFixed(1)} L${xAt(t).toFixed(1)} ${y(after).toFixed(1)} ${dot(xAt(t), y(before))} ${dot(xAt(t), y(after))}`;
        })
        .join(' '),
    );
    springDotsRef.current?.setAttribute('d', events.map((t) => dot(xAt(t), y(velocitiesAt(current, t).spring))).join(' '));
  };

  const tick = () => {
    const current = episode.current;
    const now = performance.now();
    if (current && !drag.current) {
      const time = reducedMotion ? current.anchor + AFTER_MS : now;
      const spring = latest(current.springs, time);
      const curve = latest(current.curves, time);
      if (spring && curve) position.current = { spring: springAt(SPRING, spring, time).position, curve: curveAt(curve, time).position };
    }
    place();
    draw(now);
    const settling = current !== null && now < current.anchor + AFTER_MS;
    if (drag.current || (!reducedMotion && settling)) frame.current = requestAnimationFrame(tick);
  };

  const run = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(tick);
  };

  const setOff = (now: number, to: number, velocity: number, label: string) => {
    const current = episode.current ?? { anchor: now, hand: [], springs: [], curves: [] };
    const springSegment = { start: now, from: position.current.spring, to, velocity };
    const curveSegment = { start: now, from: position.current.curve, to, duration: CURVE_MS };
    current.anchor = now;
    current.springs.push(springSegment);
    current.curves.push(curveSegment);
    episode.current = current;
    rest.current = to;
    setAnchor(now);
    setMarks((list) => [...list.filter((m) => m.t >= now - BEFORE_MS), { t: now, label }]);
    run();
    return curveAt(curveSegment, now).velocity;
  };

  const currentVelocity = (now: number) => {
    const current = episode.current;
    return current ? velocitiesAt(current, now).spring : 0;
  };

  const throwPane = (now: number, velocity: number) =>
    setReadout(releaseText(velocity, setOff(now, dockFor(position.current.spring, velocity), velocity, 'let go')));

  const retarget = (now: number, to: number) => {
    const springSpeed = currentVelocity(now);
    setReadout(tapText(springSpeed, setOff(now, to, springSpeed, 'tap'), reducedMotion));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const onPane = (event.target as Element).closest('[data-pane]') !== null;
    event.currentTarget.setPointerCapture(event.pointerId);
    const now = performance.now();
    if (onPane) {
      const current = episode.current;
      if (current && !reducedMotion) {
        const spring = latest(current.springs, now);
        const curve = latest(current.curves, now);
        if (spring && curve) position.current = { spring: springAt(SPRING, spring, now).position, curve: curveAt(curve, now).position };
      }
      episode.current = { anchor: now, hand: [], springs: [], curves: [] };
      setMarks([]);
      setAnchor(now);
      tracker.reset();
    }
    drag.current = { pointerId: event.pointerId, startX: event.clientX, spring: position.current.spring, curve: position.current.curve, onPane };
    if (onPane) run();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current?.onPane || current.pointerId !== event.pointerId || !episode.current) return;
    const dx = event.clientX - current.startX;
    position.current = { spring: current.spring + dx, curve: current.curve + dx };
    tracker.add(dx, event.timeStamp);
    const now = performance.now();
    episode.current.anchor = now;
    episode.current.hand.push({ t: now, v: tracker.velocity(event.timeStamp) });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    const now = performance.now();
    if (current.onPane) {
      throwPane(now, tracker.velocity(event.timeStamp));
      return;
    }
    const lane = laneRef.current?.getBoundingClientRect();
    if (!lane) return;
    const to = Math.max(-limit(), Math.min(limit(), event.clientX - (lane.left + lane.width / 2)));
    retarget(now, to);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      episode.current = { anchor: now, hand: [], springs: [], curves: [] };
      setMarks([]);
      throwPane(now, event.key === 'ArrowLeft' ? -KEY_THROW : KEY_THROW);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      retarget(now, rest.current > 0 ? -dock() : dock());
    }
  };

  const windowStart = anchor === null ? 0 : anchor - BEFORE_MS;
  const markLeft = (t: number) => `${((t - windowStart) / (BEFORE_MS + AFTER_MS)) * 100}%`;
  const chip = 'absolute top-[calc(50%+10px)] left-1/2 -mt-5 -ml-16 flex h-10 w-32 items-center justify-center rounded-full text-ui font-medium select-none';

  return (
    <figure className="m-0">
      <div
        ref={laneRef}
        tabIndex={0}
        role="group"
        aria-roledescription="motion comparison"
        aria-label="Spring versus fixed curve. Throw the spring pane, or tap the lane to send both somewhere new. With the keyboard, use the arrow keys to throw and Enter to retarget."
        aria-describedby={readoutId}
        className="relative grid cursor-pointer gap-px overflow-hidden rounded-[20px] bg-line select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="relative h-24 bg-wall-deep">
          <Docks />
          <span className="absolute top-2.5 left-4 text-caption text-ink-faint">Fixed {CURVE_MS} ms curve</span>
          <div ref={curveRef} aria-hidden className={cn(chip, 'border border-dashed border-ink-faint text-ink-soft')}>
            Fixed curve
          </div>
        </div>
        <div className="relative h-24 bg-wall-deep">
          <Docks />
          <span className="absolute top-2.5 left-4 text-caption text-ink-faint">Spring</span>
          <div
            ref={springRef}
            data-pane=""
            aria-hidden
            data-halo-world={world}
            data-theme={theme}
            className={cn(chip, 'halo halo-surface cursor-grab touch-none text-[var(--halo-fg)] active:cursor-grabbing [--halo-radius:999px]')}
          >
            Throw me
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-caption text-ink-faint">
          <span className="font-medium text-ink-soft">Speed over time</span>
          <span className="flex items-center gap-2">
            <svg aria-hidden width="22" height="4">
              <line x1="0" y1="2" x2="22" y2="2" className="stroke-ink" strokeWidth="2" />
            </svg>
            Spring
          </span>
          <span className="flex items-center gap-2">
            <svg aria-hidden width="22" height="4">
              <line x1="0" y1="2" x2="22" y2="2" className="stroke-ink-faint" strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            Fixed curve
          </span>
        </div>
        <div className="relative h-40 rounded-2xl bg-wall-deep/70 shadow-[inset_0_0_0_1px_var(--line)]">
          <svg aria-hidden viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <line x1="0" x2={VIEW.width} y1={VIEW.height / 2} y2={VIEW.height / 2} className="stroke-line" vectorEffect="non-scaling-stroke" />
            <path ref={curvePathRef} fill="none" className="stroke-ink-faint" strokeWidth="2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
            <path ref={springPathRef} fill="none" className="stroke-ink" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path ref={jumpPathRef} fill="none" className="stroke-ink-soft" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path ref={springDotsRef} fill="none" className="stroke-ink" strokeWidth="9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {marks.map((mark, i) => (
            <span key={mark.t} aria-hidden className="absolute inset-y-0 border-l border-ink-faint/60" style={{ left: markLeft(mark.t) }}>
              {i === marks.length - 1 && (
                <span className="absolute bottom-1.5 left-1.5 font-mono text-caption whitespace-nowrap text-ink-faint">{mark.label}</span>
              )}
            </span>
          ))}
          {anchor === null && (
            <p className="absolute inset-0 m-0 grid place-items-center px-6 text-center text-ui text-ink-faint">Throw the pane and its speed draws here.</p>
          )}
        </div>
      </div>

      <figcaption id={readoutId} aria-live="polite" className="mt-4 max-w-[64ch] text-ui leading-[1.55] text-ink">
        {readout ?? 'Throw the pane, then tap the lane while it is still moving.'}
      </figcaption>
    </figure>
  );
}
