import { expect, test } from '@playwright/test';
import { absoluteUrl, docsRoutes, notFoundRoute, routes } from '../src/routes';
import { applySettings, type Theme } from './site';

test('every route has a unique title and description', () => {
  const titles = new Set(routes.map((r) => r.title));
  const descriptions = new Set(routes.map((r) => r.description));
  expect(titles.size).toBe(routes.length);
  expect(descriptions.size).toBe(routes.length);
});

for (const route of routes) {
  test(`${route.path} ships its own head and content without JavaScript`, async ({ request }) => {
    const response = await request.get(route.path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(`<link rel="canonical" href="${absoluteUrl(route.path)}" />`);
    expect(html).toContain(`<title>${route.title.replace(/&/g, '&amp;')}</title>`);
    expect(html).toContain(`<meta property="og:image" content="${absoluteUrl(route.ogImage)}" />`);
    expect(html).toMatch(/<h1[^>]*>[^<]+/);
    expect(html.match(/<link rel="canonical"/g)).toHaveLength(1);
  });
}

test('robots.txt points at the sitemap, which lists every route', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots.trimEnd().endsWith('Sitemap: https://haloui.dev/sitemap.xml')).toBe(true);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs).toEqual(routes.map((r) => absoluteUrl(r.path)));
});

test('llms.txt links every docs page as Markdown, and each one is served', async ({ request }) => {
  const llms = await (await request.get('/llms.txt')).text();
  expect(llms).not.toMatch(/\{\{(react|toast|drawer|spring|styles|method)\}\}/);
  for (const route of docsRoutes) {
    expect(llms).toContain(absoluteUrl(route.markdown));
    const md = await request.get(route.markdown);
    expect(md.status()).toBe(200);
    const body = await md.text();
    expect(body.startsWith('# ')).toBe(true);
    expect(body).toContain(`Source: ${absoluteUrl(route.path)}`);
  }
});

test('the 404 page is not indexable and hydrates', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  const html = await (await page.request.get('/404.html')).text();
  expect(html).toContain('<meta name="robots" content="noindex" />');
  expect(html).not.toContain('rel="canonical"');
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/isn’t hanging here/);
  await expect(page).toHaveTitle(notFoundRoute.title);
  expect(errors).toEqual([]);
});

const looks: { world: string; theme: Theme }[] = [
  { world: 'dichroic', theme: 'light' },
  { world: 'ink', theme: 'dark' },
];

for (const look of looks) {
  for (const route of routes) {
    test(`${route.path} hydrates cleanly in ${look.world} ${look.theme}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(e.message));
      await applySettings(page, look);
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('html')).not.toHaveAttribute('data-booting');
      await expect(page).toHaveTitle(route.title);
      if (route.path === '/') {
        const pane = page.locator('[aria-roledescription="spring demo"]').first();
        await expect(pane).toHaveAttribute('data-halo-world', look.world);
        await expect(pane).toHaveAttribute('data-theme', look.theme);
      }
      expect(errors).toEqual([]);
    });
  }
}
