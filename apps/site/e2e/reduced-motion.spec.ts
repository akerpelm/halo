import { expect, test, type Page } from '@playwright/test';
import { mainNav, openPage } from './site';
import { lastTransition, recordViewTransitions } from './view-transitions';

const heroPaneTransform = (page: Page) =>
  page.locator('[aria-roledescription="spring demo"]').first().evaluate((el) => (el as HTMLElement).style.transform);

const atRest = /^(|translate3d\(0px, 0px, 0px\) rotate\(0deg\))$/;

test.describe('with motion', () => {
  test('the hero pane swings in from the side', async ({ page }) => {
    await openPage(page, '/');
    await expect.poll(() => heroPaneTransform(page)).toContain('-300px');
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the hero pane starts at rest', async ({ page }) => {
    await openPage(page, '/');
    expect(await heroPaneTransform(page)).toMatch(atRest);
    await page.waitForTimeout(900);
    expect(await heroPaneTransform(page)).toMatch(atRest);
  });

  test('page transitions run instantly', async ({ page }) => {
    await recordViewTransitions(page);
    await openPage(page, '/');
    await mainNav(page).getByRole('link', { name: 'Docs', exact: true }).click();
    const record = await lastTransition(page);
    expect(record?.longestAnimationMs).toBe(0);
  });

  test('smooth scrolling is off', async ({ page }) => {
    await openPage(page, '/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  });
});
