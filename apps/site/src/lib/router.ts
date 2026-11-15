import { addTransitionType, createContext, startTransition, useContext, useEffect, useState } from 'react';
import { docsRoutes, docsSlugFor } from '../routes';

type Setter = (path: string) => void;
let setPathInReact: Setter | null = null;

const docsIndex = (path: string) => {
  const slug = docsSlugFor(path);
  return slug ? docsRoutes.findIndex((r) => r.slug === slug) : -1;
};

export function transitionTypeFor(from: string, to: string): 'page-next' | 'page-prev' | 'surface' | null {
  if (from === to) return null;
  const a = docsIndex(from);
  const b = docsIndex(to);
  if (a >= 0 && b >= 0) return b > a ? 'page-next' : 'page-prev';
  return 'surface';
}

let renderedPath = typeof window === 'undefined' ? '/' : window.location.pathname;

function go(next: string) {
  const type = transitionTypeFor(renderedPath, next);
  renderedPath = next;
  startTransition(() => {
    if (type) addTransitionType(type);
    setPathInReact?.(next);
  });
}

export function usePath(serverPath: string) {
  const [path, setPath] = useState(() => (typeof window === 'undefined' ? serverPath : window.location.pathname));
  useEffect(() => {
    setPathInReact = setPath;
    const onPop = () => window.setTimeout(() => go(window.location.pathname), 0);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (setPathInReact === setPath) setPathInReact = null;
    };
  }, []);
  return path;
}

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

export const PathContext = createContext('/');
export const useCurrentPath = () => useContext(PathContext);
