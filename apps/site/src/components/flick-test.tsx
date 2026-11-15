import { createSpringValue, createVelocityTracker, project, resolveSpring, useReducedMotion } from 'haloui/spring';
import { type PointerEvent, type RefObject, useRef, useState } from 'react';
import { useSettings } from '../lib/settings';
import { CountUp } from './count-up';

const SONNER_SWIPE_THRESHOLD = 45;
const SONNER_VELOCITY_THRESHOLD = 0.11;
const SONNER_EXIT = 'transform 200ms ease-out, opacity 200ms ease-out';
const SONNER_SNAP_BACK = 'transform 400ms ease';

const HALO_SPRING = resolveSpring('snappy');
const HALO_DECELERATION = 0.995;
const RESPAWN_MS = 900;

type Verdict = { speed: number; speedNote: string; outcome: string };

function Chip({ label, chipRef }: { label: string; chipRef: RefObject<HTMLDivElement | null> }) {
  const { world, theme } = useSettings();
  return (
    <div
      ref={chipRef}
      data-halo-world={world}
      data-theme={theme}
      className="halo halo-surface pointer-events-none absolute top-1/2 left-1/2 flex w-[min(260px,78%)] items-center gap-3 px-4 py-3.5"
      style={{ translate: '-50% -50%', transform: 'translateX(0px)' }}
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden className="flex-none text-[var(--halo-success)]">
        <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="m6.5 10.2 2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-ui font-semibold">{label}</span>
    </div>
  );
}

export function FlickTest() {
  const reducedMotion = useReducedMotion();
  const laneRef = useRef<HTMLDivElement>(null);
  const sonnerRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; x: number; t: number } | null>(null);
  const [tracker] = useState(createVelocityTracker);
  const [verdicts, setVerdicts] = useState<{ sonner: Verdict; halo: Verdict } | null>(null);
  const [halo] = useState(() => ({
    x: createSpringValue(0, HALO_SPRING, (value) => {
      if (haloRef.current) haloRef.current.style.transform = `translateX(${value}px)`;
    }),
    opacity: createSpringValue(1, resolveSpring('smooth'), (value) => {
      if (haloRef.current) haloRef.current.style.opacity = String(Math.max(0, Math.min(1, value)));
    }),
  }));

  const width = () => laneRef.current?.offsetWidth ?? 400;

  const setSonner = (x: number, transition: string, opacity = 1) => {
    const chip = sonnerRef.current;
    if (!chip) return;
    chip.style.transition = transition;
    chip.style.transform = `translateX(${x}px)`;
    chip.style.opacity = String(opacity);
  };

  const respawn = () => {
    window.setTimeout(() => {
      setSonner(0, 'none', 0);
      halo.x.set(0);
      halo.opacity.set(0);
      requestAnimationFrame(() => {
        setSonner(0, 'opacity 300ms ease', 1);
        halo.opacity.to(1);
      });
    }, RESPAWN_MS);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, x: event.clientX, t: performance.now() };
    tracker.reset();
    halo.x.stop();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    setSonner(dx, 'none');
    halo.x.set(dx);
    tracker.add(dx, event.timeStamp);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    const dx = event.clientX - current.x;
    const lane = width();
    const sign = Math.sign(dx) || 1;
    const off = sign * (lane / 2 + 200);

    const elapsed = Math.max(performance.now() - current.t, 1);
    const averageSpeed = Math.abs(dx) / elapsed;
    const sonnerDismiss = Math.abs(dx) >= SONNER_SWIPE_THRESHOLD || averageSpeed > SONNER_VELOCITY_THRESHOLD;
    if (sonnerDismiss) setSonner(off, SONNER_EXIT, 0);
    else setSonner(0, SONNER_SNAP_BACK);

    const velocity = tracker.velocity(event.timeStamp);
    const landing = dx + project(velocity, HALO_DECELERATION);
    const haloDismiss = Math.abs(landing) > (haloRef.current?.offsetWidth ?? 260) / 3;
    if (reducedMotion) halo.x.set(haloDismiss ? off : 0);
    else halo.x.to(haloDismiss ? off : 0, { velocity });
    if (haloDismiss) halo.opacity.to(0);

    setVerdicts({
      sonner: {
        speed: Math.round(averageSpeed * 1000),
        speedNote: 'px/s, averaged over the drag',
        outcome: sonnerDismiss
          ? Math.abs(dx) >= SONNER_SWIPE_THRESHOLD && averageSpeed <= SONNER_VELOCITY_THRESHOLD
            ? `Dismissed: it passed 45 px, whatever you meant. Exit takes a fixed 200 ms.`
            : 'Dismissed. Exit takes a fixed 200 ms at any speed.'
          : 'Snapped back over a fixed 400 ms.',
      },
      halo: {
        speed: Math.round(Math.abs(velocity)),
        speedNote: 'px/s at the moment you let go',
        outcome: haloDismiss ? 'Dismissed, and it kept your speed on the way out.' : 'Kept. It sprang back carrying your speed.',
      },
    });
    if (sonnerDismiss || haloDismiss) respawn();
  };

  const lanes = [
    { key: 'sonner', title: 'Sonner’s release', note: 'Reimplemented from Sonner’s source', ref: sonnerRef },
    { key: 'halo', title: 'Halo’s release', note: 'The real thing', ref: haloRef },
  ] as const;

  return (
    <figure className="m-0">
      <div
        className="grid cursor-grab touch-none gap-px overflow-hidden rounded-[20px] bg-line select-none active:cursor-grabbing sm:grid-cols-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="application"
        aria-label="Flick test. Drag either chip left or right with a pointer; both run the same gesture."
      >
        {lanes.map((lane) => (
          <div key={lane.key} className="relative h-44 overflow-hidden bg-wall-deep" ref={lane.key === 'halo' ? laneRef : undefined}>
            <p className="absolute top-3 left-4 m-0 text-caption text-ink-faint">
              <span className="font-semibold text-ink">{lane.title}</span> · {lane.note}
            </p>
            <Chip label="Drag me sideways" chipRef={lane.ref} />
          </div>
        ))}
      </div>
      <figcaption className="mt-4 grid gap-4 text-ui leading-[1.5] sm:grid-cols-2" aria-live="polite">
        {verdicts ? (
          (['sonner', 'halo'] as const).map((key) => (
            <p key={key} className="m-0">
              <span className="block font-mono text-caption text-ink-faint">
                <CountUp value={verdicts[key].speed} /> {verdicts[key].speedNote}
              </span>
              <span className={key === 'halo' ? 'text-ink' : 'text-ink-soft'}>{verdicts[key].outcome}</span>
            </p>
          ))
        ) : (
          <p className="m-0 text-ink-soft sm:col-span-2">
            Try a slow 60 px drag, then a quick flick after a pause. Both chips get exactly the same gesture.
          </p>
        )}
      </figcaption>
    </figure>
  );
}
