import type { JSX } from 'react';
import type { ToastType } from '../store/toast-store';

const svg = { width: 18, height: 18, viewBox: '0 0 20 20', fill: 'none', 'aria-hidden': true, focusable: false } as const;
const stroke = { stroke: 'currentColor', strokeWidth: 1.5 } as const;
const mark = { stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' } as const;

function Success() {
  return (
    <svg {...svg}>
      <circle cx="10" cy="10" r="8.25" {...stroke} />
      <path d="m6.5 10.2 2.3 2.3 4.7-4.9" {...mark} strokeLinejoin="round" />
    </svg>
  );
}

function Failure() {
  return (
    <svg {...svg}>
      <path d="M10 1.9 18.1 16a1 1 0 0 1-.87 1.5H2.77A1 1 0 0 1 1.9 16L10 1.9Z" {...stroke} strokeLinejoin="round" />
      <path d="M10 7.5v3.8" {...mark} />
      <circle cx="10" cy="14.2" r="0.95" fill="currentColor" />
    </svg>
  );
}

function Warning() {
  return (
    <svg {...svg}>
      <circle cx="10" cy="10" r="8.25" {...stroke} />
      <path d="M10 5.8v5" {...mark} />
      <circle cx="10" cy="13.9" r="0.95" fill="currentColor" />
    </svg>
  );
}

function Info() {
  return (
    <svg {...svg}>
      <circle cx="10" cy="10" r="8.25" {...stroke} />
      <path d="M10 9.2v5" {...mark} />
      <circle cx="10" cy="6.2" r="0.95" fill="currentColor" />
    </svg>
  );
}

function Loading() {
  return (
    <svg {...svg} className="halo-spinner">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.8" />
      <path d="M17.5 10A7.5 7.5 0 0 0 10 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const ICONS: Record<ToastType, (() => JSX.Element) | null> = {
  default: null,
  success: Success,
  error: Failure,
  warning: Warning,
  info: Info,
  loading: Loading,
};

export function TypeIcon({ type }: { type: ToastType }) {
  const Icon = ICONS[type];
  return Icon ? <Icon /> : null;
}
