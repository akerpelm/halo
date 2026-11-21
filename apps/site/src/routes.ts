import { sizes } from './lib/package-facts';
import { SITE_URL } from './lib/site';

export type Route = {
  path: string;
  title: string;
  description: string;
  ogImage: string;
  ogAlt: string;
};

export type DocGroup = 'Start' | 'Migrate' | 'Components' | 'Style and motion' | 'More';

export type DocRoute = Route & { slug: string; name: string; group: DocGroup; markdown: string };

const doc = (group: DocGroup, slug: string, name: string, title: string, description: string): DocRoute => ({
  slug,
  name,
  group,
  path: `/docs/${slug}`,
  title,
  description,
  ogImage: `/og/docs-${slug.replace('/', '-')}.png`,
  ogAlt: title.replace(' · Halo', ''),
  markdown: `/docs/${slug}.md`,
});

export const homeRoute: Route = {
  path: '/',
  title: 'Halo: spring-physics toast and drawer for React',
  description: `A spring-physics toast and drawer for React. Takes Sonner's toast() calls, keeps Vaul's part names on a native dialog. Toast ${sizes.toast} kB, no dependencies.`,
  ogImage: '/og/home.png',
  ogAlt: 'Halo: a spring-physics toast and drawer for React',
};

export const docsRoutes: readonly DocRoute[] = [
  doc(
    'Start',
    'getting-started',
    'Getting started',
    'Getting started · Halo',
    'Install halo-ui-react, render one Toaster, call toast() from anywhere, and compose a drawer from parts. React 18.2 or newer, Next.js App Router ready.',
  ),
  doc(
    'Start',
    'nextjs',
    'Next.js and SSR',
    'Next.js App Router setup · Halo',
    "Put the Toaster in the root layout, keep drawers in client components, show toasts after server actions, and follow your app's dark mode.",
  ),
  doc(
    'Migrate',
    'migrate/sonner',
    'Migrate from Sonner',
    'Sonner alternative: migrating to Halo · Halo',
    "Halo takes the same toast() calls as Sonner. Change the import, map richColors and toastOptions, and check the short list of features that don't carry over.",
  ),
  doc(
    'Migrate',
    'migrate/vaul',
    'Migrate from Vaul',
    'Vaul alternative: migrating to Halo’s drawer · Halo',
    "Vaul is unmaintained. Halo's drawer keeps its part names and snap points on a native dialog: delete Portal and Overlay, rename three props, and check what doesn't carry over.",
  ),
  doc(
    'Components',
    'toast',
    'Toast',
    'Toast for React: API and Toaster props · Halo',
    'toast(), toast.promise, toast.undo and toast.stream, every option and Toaster prop, and what the keyboard and screen readers get.',
  ),
  doc(
    'Components',
    'drawer',
    'Drawer',
    'Drawer for React on the native dialog · Halo',
    'A bottom sheet or side panel on <dialog>: snap points picked from flick velocity, a handle that is a real button, and page push-back.',
  ),
  doc(
    'Components',
    'popover',
    'Popover',
    'Popover for React on the native popover API · Halo',
    'A non-modal popover in the top layer, placed by CSS anchor positioning with no positioning library. It grows out of its trigger, and light marks where it attaches.',
  ),
  doc(
    'Components',
    'swipe',
    'Swipe actions',
    'Swipe actions for React list rows · Halo',
    'Swipe a row to reveal actions, or swipe all the way to run one. Every action is a real button, and focus moves on when a row leaves.',
  ),
  doc(
    'Style and motion',
    'worlds',
    'Worlds',
    'Worlds: frosted-glass themes · Halo',
    'Nine glass themes for the toast and drawer, each in light and dark. Pick one with a prop, colour toasts by type, or recolour the edge.',
  ),
  doc(
    'Style and motion',
    'motion',
    'Motion',
    'Motion: springs and reduced motion · Halo',
    `Spring presets with measured settle times, custom springs, six toast entrances, reduced-motion behaviour, and the ${sizes.spring} kB spring engine on its own.`,
  ),
  doc(
    'Style and motion',
    'customize',
    'Customize',
    'Customize: tokens, Tailwind and custom worlds · Halo',
    'Write a world in one CSS selector, extend a built-in one, style each part with Tailwind classNames, and every token and selector Halo exposes.',
  ),
  doc(
    'More',
    'accessibility',
    'Accessibility',
    'Accessibility: keyboard, screen readers and reduced motion · Halo',
    "How Halo's toasts announce to screen readers, what the keyboard does, how the drawer handles focus, reduced motion and transparency, and how it is tested.",
  ),
  doc(
    'More',
    'agents',
    'For agents',
    'For AI agents: llms.txt and prompts · Halo',
    'llms.txt with the whole API, copy-ready prompts for adding toasts, migrating from Sonner or Vaul and setting up Next.js, and the rules that keep it accessible.',
  ),
];

export const docGroups = docsRoutes.reduce<{ group: DocGroup; routes: DocRoute[] }[]>((groups, route) => {
  const last = groups.at(-1);
  if (last?.group === route.group) last.routes.push(route);
  else groups.push({ group: route.group, routes: [route] });
  return groups;
}, []);

export const playgroundRoute: Route = {
  path: '/playground',
  title: 'Playground: build a toast, drawer, popover or swipe row · Halo',
  description: 'Build a toast, drawer, popover or swipe actions: layer on worlds, springs and placement, then copy the code or an agent prompt.',
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
