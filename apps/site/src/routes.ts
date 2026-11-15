import { sizes } from './lib/package-facts';
import { SITE_URL } from './lib/site';

export type Route = {
  path: string;
  title: string;
  description: string;
  ogImage: string;
  ogAlt: string;
};

type DocRoute = Route & { slug: string; name: string; markdown: string };

const doc = (slug: string, name: string, title: string, description: string): DocRoute => ({
  slug,
  name,
  path: `/docs/${slug}`,
  title,
  description,
  ogImage: `/og/docs-${slug}.png`,
  ogAlt: title.replace(' · Halo', ''),
  markdown: `/docs/${slug}.md`,
});

export const homeRoute: Route = {
  path: '/',
  title: 'Halo: spring-physics toast and drawer for React',
  description: `A toast and drawer for React on real springs. Keeps Sonner's toast() calls and puts the drawer on the native dialog. ${sizes.toast} kB, no dependencies.`,
  ogImage: '/og/home.png',
  ogAlt: 'Halo: a spring-physics toast and drawer for React',
};

export const docsRoutes: readonly DocRoute[] = [
  doc(
    'getting-started',
    'Getting started',
    'Getting started · Halo',
    'Install halo-ui-react, render one Toaster, call toast() from anywhere, and compose a drawer from parts. React 18.2 or newer, Next.js App Router ready.',
  ),
  doc(
    'toast',
    'Toast',
    'Toast for React: API and Toaster props · Halo',
    'toast(), toast.promise, toast.undo and toast.stream, every option and Toaster prop, keyboard and screen-reader behaviour, and how it compares with Sonner.',
  ),
  doc(
    'drawer',
    'Drawer',
    'Drawer for React on the native dialog · Halo',
    'A bottom sheet or side panel on <dialog>: snap points picked from flick velocity, a handle that is a real button, page push-back, and how it compares with Vaul.',
  ),
  doc(
    'worlds',
    'Worlds',
    'Worlds: frosted-glass themes · Halo',
    'Nine glass themes for the toast and drawer, each in light and dark. Pick one with a prop, colour toasts by type, or recolour the edge.',
  ),
  doc(
    'motion',
    'Motion',
    'Motion: springs and reduced motion · Halo',
    `Spring presets with measured settle times, custom springs, six toast entrances, reduced-motion behaviour, and the ${sizes.spring} kB spring engine on its own.`,
  ),
  doc(
    'customize',
    'Customize',
    'Customize: tokens, Tailwind and custom worlds · Halo',
    'Write a world in one CSS selector, extend a built-in one, style each part with Tailwind classNames, and every token and selector Halo exposes.',
  ),
  doc(
    'agents',
    'For agents',
    'For AI agents: llms.txt and prompts · Halo',
    'llms.txt with the whole API, copy-ready prompts for adding toasts, migrating from Sonner or Vaul and setting up Next.js, and the rules that keep it accessible.',
  ),
];

export const playgroundRoute: Route = {
  path: '/playground',
  title: 'Playground: build a toast or drawer · Halo',
  description: 'Start from a plain toast or drawer, layer on worlds, springs, timers and entrances, and copy the code or an agent prompt.',
  ogImage: '/og/playground.png',
  ogAlt: 'The Halo playground',
};

export const notFoundRoute: Route = {
  path: '/404',
  title: 'Page not found · Halo',
  description: 'This page does not exist. Try the docs or the playground.',
  ogImage: '/og/home.png',
  ogAlt: 'Halo',
};

export const routes: readonly Route[] = [homeRoute, ...docsRoutes, playgroundRoute];

export const absoluteUrl = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);

export const docsSlugFor = (path: string): string | null => {
  if (path === '/docs' || path === '/docs/') return 'getting-started';
  return docsRoutes.find((r) => r.path === path)?.slug ?? null;
};

export const routeFor = (path: string): Route => {
  const slug = docsSlugFor(path);
  if (slug) return docsRoutes.find((r) => r.slug === slug) ?? notFoundRoute;
  return routes.find((r) => r.path === path) ?? notFoundRoute;
};
