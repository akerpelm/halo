import { type ReactNode, ViewTransition } from 'react';

export function SurfaceTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={{ surface: 'surface-in', default: 'none' }} exit={{ surface: 'surface-out', default: 'none' }} default="none">
      {children}
    </ViewTransition>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ 'page-next': 'page-from-right', 'page-prev': 'page-from-left', default: 'none' }}
      exit={{ 'page-next': 'page-to-left', 'page-prev': 'page-to-right', default: 'none' }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
