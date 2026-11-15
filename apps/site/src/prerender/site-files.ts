import llmsTemplate from '../content/llms.md?raw';
import { reactPeer, sizes } from '../lib/package-facts';
import { absoluteUrl, docsRoutes, homeRoute, playgroundRoute, routes } from '../routes';

const docTitle = (title: string) => title.replace(' · Halo', '');

export function sitemap(): string {
  const urls = routes.map((route) => `  <url><loc>${absoluteUrl(route.path)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function llms(): string {
  const filled = llmsTemplate
    .replaceAll('{{react}}', reactPeer)
    .replaceAll('{{toast}}', String(sizes.toast))
    .replaceAll('{{drawer}}', String(sizes.drawer))
    .replaceAll('{{spring}}', String(sizes.spring))
    .replaceAll('{{styles}}', String(sizes.styles))
    .replaceAll('{{method}}', sizes.method);
  const docs = docsRoutes.map((route) => `- [${route.name}](${absoluteUrl(route.markdown)}): ${route.description}`);
  const optional = [homeRoute, playgroundRoute].map((route) => `- [${docTitle(route.title)}](${absoluteUrl(route.path)}): ${route.description}`);
  return `${filled.trimEnd()}\n\n## Docs\n\n${docs.join('\n')}\n\n## Optional\n\n${optional.join('\n')}\n`;
}

export function headers(): string {
  const markdown = docsRoutes.map(
    (route) => `${route.markdown}\n  Content-Type: text/markdown; charset=utf-8\n  Link: <${absoluteUrl(route.path)}>; rel="canonical"`,
  );
  return `${['/llms.txt\n  Content-Type: text/plain; charset=utf-8', ...markdown].join('\n')}\n`;
}

export function redirects(): string {
  return '/docs /docs/getting-started 301\n/docs/ /docs/getting-started 301\n';
}
