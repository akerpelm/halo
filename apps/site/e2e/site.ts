import type { Page } from '@playwright/test';

export const auditedPaths = ['/', '/playground', '/docs/toast', '/docs/popover', '/docs/swipe'] as const;

export type Theme = 'light' | 'dark';

export async function applySettings(page: Page, settings: { world: string; theme: Theme }) {
  await page.addInitScript((value) => localStorage.setItem('halo-site', JSON.stringify(value)), settings);
}

export async function openPage(page: Page, path: string) {
  await page.goto(path);
  await page.locator('main#main').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-booting'));
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}

export const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main' });
