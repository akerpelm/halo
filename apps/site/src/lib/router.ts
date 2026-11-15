import { addTransitionType, createContext, startTransition, useContext, useEffect, useState } from 'react';

/**
 * The site's three surfaces and their docs pages. The path lives in React state (not an external
 * store) so every navigation can run inside a transition, which is what lets <ViewTransition> animate.
 */
type Setter = (path: string) => void;
let setPathInReact: Setter | null = null;

const docsOrder = ['getting-started', 'toast', 'drawer', 'worlds', 'motion', 'customize', 'agents'];
const docsIndex = (path: string) => (path.startsWith('/docs') ? docsOrder.indexOf(path.split('/')[2] || 'getting-started') : -1);

/** Which animation a move between two paths should play. */
export function transitionTypeFor(from: string, to: string): 'page-next' | 'page-prev' | 'surface' | null {
  if (from === to) return null;
  const a = docsIndex(from);
  const b = docsIndex(to);
  if (a >= 0 && b >= 0) return b > a ? 'page-next' : 'page-prev';
  return 'surface';
}

// The path React last rendered. On popstate the URL has already changed, so direction has to come from here.
let renderedPath = typeof window === 'undefined' ? '/' : window.location.pathname;

function go(next: string) {
  const type = transitionTypeFor(renderedPath, next);
  renderedPath = next;
  startTransition(() => {
    if (type) addTransitionType(type);
    setPathInReact?.(next);
  });
}

/** The current path, kept in React state. Back and forward animate too. */
export function usePath() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    setPathInReact = setPath;
    // React finishes updates started inside a popstate event synchronously (for scroll restoration),
    // which skips the view transition. Starting it just after the event keeps Back and Forward animated.
    const onPop = () => window.setTimeout(() => go(window.location.pathname), 0);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (setPathInReact === setPath) setPathInReact = null;
    };
  }, []);
  return path;
}

/** Go to an in-site URL without a reload. A same-page hash just scrolls. */
export function navigate(href: string) {
  const url = new URL(href, window.location.href);
  if (url.pathname === window.location.pathname) {
    if (url.hash !== window.location.hash) window.history.pushState(null, '', url.hash || url.pathname);
    document.getElementById(url.hash.slice(1))?.scrollIntoView({ block: 'start' });
    return;
  }
  window.history.pushState(null, '', url.pathname + url.hash);
  go(url.pathname);
}


/** App owns the path (one usePath call); everything else reads it from here. */
export const PathContext = createContext('/');
export const useCurrentPath = () => useContext(PathContext);
