import { type ReactNode, ViewTransition } from 'react';

/**
 * A surface (Home, Docs, Playground) entering or leaving. Surfaces are lateral, so they fade
 * with a small rise rather than slide: there is no depth between them to imply.
 */
export function SurfaceTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={{ surface: 'surface-in', default: 'none' }} exit={{ surface: 'surface-out', default: 'none' }} default="none">
      {children}
    </ViewTransition>
  );
}

/** A docs page inside the persistent docs layout. Pages are an ordered sequence, so they slide. */
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
