import { lazy } from 'react';

const loadDocs = () => import('../docs/docs-layout');
const loadPlayground = () => import('../sections/playground-page');

export const DocsLayout = lazy(() => loadDocs().then((m) => ({ default: m.DocsLayout })));
export const PlaygroundPage = lazy(() => loadPlayground().then((m) => ({ default: m.PlaygroundPage })));

export function preloadSurface(href: string) {
  if (href.startsWith('/docs')) void loadDocs();
  else if (href.startsWith('/playground')) void loadPlayground();
}
