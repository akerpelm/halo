import { type Route, absoluteUrl, notFoundRoute } from '../routes';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function headFor(route: Route & { markdown?: string }): string {
  const indexable = route !== notFoundRoute;
  const url = absoluteUrl(route.path);
  const image = absoluteUrl(route.ogImage);
  const tags = [
    `<title>${escape(route.title)}</title>`,
    `<meta name="description" content="${escape(route.description)}" />`,
    indexable ? `<link rel="canonical" href="${url}" />` : '<meta name="robots" content="noindex" />',
    route.markdown && `<link rel="alternate" type="text/markdown" href="${absoluteUrl(route.markdown)}" />`,
    '<meta property="og:site_name" content="Halo" />',
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${escape(route.title)}" />`,
    `<meta property="og:description" content="${escape(route.description)}" />`,
    indexable && `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${OG_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${escape(route.ogAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ];
  return tags.filter(Boolean).join('\n    ');
}
