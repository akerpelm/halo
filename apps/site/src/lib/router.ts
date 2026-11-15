import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
const notify = () => {
  for (const listener of listeners) listener();
};

if (typeof window !== 'undefined') window.addEventListener('popstate', notify);

/** The current path. The site has two kinds of page, so the History API is all it needs. */
export function usePath() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => window.location.pathname,
    () => '/',
  );
}

/** Go to an in-site URL without a reload. A hash scrolls to its target once the page has rendered. */
export function navigate(href: string) {
  const url = new URL(href, window.location.href);
  const samePage = url.pathname === window.location.pathname;
  window.history.pushState(null, '', url.pathname + url.hash);
  notify();
  requestAnimationFrame(() => {
    const target = url.hash ? document.getElementById(url.hash.slice(1)) : null;
    if (target) target.scrollIntoView({ block: 'start', behavior: samePage ? 'auto' : 'instant' });
    else if (!samePage) window.scrollTo({ top: 0, behavior: 'instant' });
  });
}
