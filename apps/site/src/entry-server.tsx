import type { ReactNode } from 'react';
import { prerender } from 'react-dom/static';
import { App } from './app';
import { DocArticle } from './prerender/doc-article';
import { headFor } from './prerender/head';
import { htmlToMarkdown } from './prerender/markdown';
import { headers, llms, redirects, sitemap } from './prerender/site-files';
import { absoluteUrl, docsRoutes, notFoundRoute, routes } from './routes';

type OutputFile = { file: string; contents: string };

const HEAD = /<!--app-head-->[\s\S]*?<!--\/app-head-->/;

async function render(node: ReactNode): Promise<string> {
  const { prelude } = await prerender(node);
  return new Response(prelude).text();
}

const fileFor = (path: string) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);

export async function buildSite(template: string): Promise<OutputFile[]> {
  if (!HEAD.test(template) || !template.includes('<!--app-html-->')) throw new Error('index.html is missing the app-head or app-html markers');
  const page = async (path: string, route: Parameters<typeof headFor>[0]) =>
    template.replace(HEAD, headFor(route)).replace('<!--app-html-->', await render(<App serverPath={path} />));

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
