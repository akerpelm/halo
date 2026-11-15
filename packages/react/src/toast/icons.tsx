import type { JSX } from 'react';
import type { ToastType } from './store';

const common = {
  width: 18,
  height: 18,
  viewBox: '0 0 20 20',
  fill: 'none',
  'aria-hidden': true,
  focusable: false,
} as const;

function Success() {
  return (
    <svg {...common}>
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="m6.5 10.2 2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg {...common}>
      <path d="M10 1.9 18.1 16a1 1 0 0 1-.87 1.5H2.77A1 1 0 0 1 1.9 16L10 1.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 7.5v3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="14.2" r="0.95" fill="currentColor" />
    </svg>
  );
}

function Warning() {
  return (
    <svg {...common}>
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 5.8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="13.9" r="0.95" fill="currentColor" />
    </svg>
  );
}

function Info() {
  return (
    <svg {...common}>
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9.2v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="6.2" r="0.95" fill="currentColor" />
    </svg>
  );
}

function Loading() {
  return (
    <svg {...common} className="halo-spinner">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.8" />
      <path d="M17.5 10A7.5 7.5 0 0 0 10 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export type ToastTimer = 'close' | 'icon' | 'edge' | false;

/**
 * How a toast enters and leaves. Every style is one spring from 0 to 1, read differently.
 * rise: lifts in from the edge. fade: opacity only. drop: falls in from above and lands.
 * hinge: swings down from its top edge like a hung sign. focus: pulls into focus from a blur.
 * bloom: grows out of a capsule at its centre.
 */
export type ToastMotion = 'rise' | 'fade' | 'drop' | 'hinge' | 'focus' | 'bloom';

/** A ring that empties over `duration`, anticlockwise from the top, like a kitchen timer. */
export function TimerRing({ duration, restartKey }: { duration: number; restartKey: number }) {
  return (
    <svg className="halo-timer-ring" viewBox="0 0 26 26" aria-hidden focusable={false}>
      <circle className="halo-timer-track" cx="13" cy="13" r="11.5" pathLength={1} />
      <circle key={restartKey} className="halo-timer-progress" cx="13" cy="13" r="11.5" pathLength={1} style={{ animationDuration: `${duration}ms` }} />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden focusable={false}>
      <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const icons: Record<ToastType, (() => JSX.Element) | null> = {
  default: null,
  success: Success,
  error: ErrorIcon,
  warning: Warning,
  info: Info,
  loading: Loading,
};

export function TypeIcon({ type }: { type: ToastType }) {
  const Icon = icons[type];
  return Icon ? <Icon /> : null;
}
