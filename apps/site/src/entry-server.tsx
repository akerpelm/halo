import type { ReactNode } from 'react';
import { prerender } from 'react-dom/static';
import { App } from './app';
import { docPages } from './docs/pages';
import { DocArticle } from './prerender/doc-article';
import { headFor } from './prerender/head';
import { htmlToMarkdown } from './prerender/markdown';
import { headers, llms, redirects, sitemap } from './prerender/site-files';
import { absoluteUrl, docsRoutes, notFoundRoute, playgroundRoute, routes } from './routes';

type OutputFile = { file: string; contents: string };
type Manifest = Record<string, { file: string; imports?: string[]; isEntry?: boolean }>;

const HEAD = /<!--app-head-->[\s\S]*?<!--\/app-head-->/;

async function render(node: ReactNode): Promise<string> {
  const { prelude } = await prerender(node);
  return new Response(prelude).text();
}

const fileFor = (path: string) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);

const surfaceModule = (path: string) =>
  path.startsWith('/docs') ? 'src/docs/docs-layout.tsx' : path === playgroundRoute.path ? 'src/sections/playground-page.tsx' : null;

function preloadsFor(path: string, manifest: Manifest, template: string): string {
  const key = surfaceModule(path);
  if (!key) return '';
  const files = new Set<string>();
  const visit = (name: string) => {
    const chunk = manifest[name];
    if (!chunk || chunk.isEntry || files.has(chunk.file)) return;
    files.add(chunk.file);
    for (const dep of chunk.imports ?? []) visit(dep);
  };
  visit(key);
  if (files.size === 0) throw new Error(`No chunk for ${key} in the Vite manifest`);
  return [...files]
    .filter((file) => !template.includes(`/${file}`))
    .map((file) => `\n    <link rel="modulepreload" crossorigin href="/${file}" />`).join('');
}

function assertDocsMatchRoutes() {
  const pages = docPages.map((p) => `${p.slug}:${p.title}`).join(',');
  const listed = docsRoutes.map((r) => `${r.slug}:${r.name}`).join(',');
  if (pages !== listed) throw new Error(`docPages and docsRoutes disagree.\n  pages:  ${pages}\n  routes: ${listed}`);
}

export async function buildSite(template: string, manifest: Manifest): Promise<OutputFile[]> {
  assertDocsMatchRoutes();
  if (!HEAD.test(template) || !template.includes('<!--app-html-->')) throw new Error('index.html is missing the app-head or app-html markers');
  const page = async (path: string, route: Parameters<typeof headFor>[0]) =>
    template.replace(HEAD, headFor(route) + preloadsFor(path, manifest, template)).replace('<!--app-html-->', await render(<App serverPath={path} />));

  const pages = await Promise.all(routes.map(async (route) => ({ file: fileFor(route.path), contents: await page(route.path, route) })));
  const markdown = await Promise.all(
    docsRoutes.map(async (route) => ({
      file: route.markdown.slice(1),
      contents: `${htmlToMarkdown(await render(<DocArticle slug={route.slug} />), absoluteUrl(route.path))}\nSource: ${absoluteUrl(route.path)}\n`,
    })),
  );

  return [
    ...pages,
    { file: '404.html', contents: await page(notFoundRoute.path, notFoundRoute) },
    ...markdown,
    { file: 'sitemap.xml', contents: sitemap() },
    { file: 'llms.txt', contents: llms() },
    { file: '_headers', contents: headers() },
    { file: '_redirects', contents: redirects() },
  ];
}
