import { expect, test } from '@playwright/test';
import { mainNav, openPage } from './site';
import { lastTransition, recordViewTransitions } from './view-transitions';

test.beforeEach(async ({ page }) => {
  await recordViewTransitions(page);
});

test('switching surfaces runs a surface transition with the header held still', async ({ page }) => {
  await openPage(page, '/');
  await mainNav(page).getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page).toHaveURL(/\/docs/);
  const toDocs = await lastTransition(page);
  expect(toDocs?.skipped).toBe(false);
  expect(toDocs?.types).toEqual(['surface']);
  expect(toDocs?.namedDuring).toContain('site-header');
  expect(toDocs?.namedAfter).not.toContain('site-header');
  expect(toDocs?.longestAnimationMs).toBeGreaterThan(0);

  await mainNav(page).getByRole('link', { name: 'Playground', exact: true }).click();
  await expect(page).toHaveURL(/\/playground$/);
  const toPlayground = await lastTransition(page);
  expect(toPlayground?.skipped).toBe(false);
  expect(toPlayground?.types).toEqual(['surface']);
});

test('docs pages slide forward and back by sidebar order', async ({ page }) => {
  await openPage(page, '/docs/toast');
  await page.locator('a[href="/docs/drawer"]:visible').first().click();
  await expect(page).toHaveURL(/\/docs\/drawer$/);
  const forward = await lastTransition(page);
  expect(forward?.skipped).toBe(false);
  expect(forward?.types).toEqual(['page-next']);
  expect(forward?.namedDuring).toContain('docs-sidebar');

  await page.goBack();
  await expect(page).toHaveURL(/\/docs\/toast$/);
  const back = await lastTransition(page);
  expect(back?.skipped).toBe(false);
  expect(back?.types).toEqual(['page-prev']);
});

test('the toaster is named only while a transition runs', async ({ page }) => {
  await openPage(page, '/');
  await mainNav(page).getByRole('link', { name: 'Docs', exact: true }).click();
  const record = await lastTransition(page);
  expect(record?.namedDuring).toContain('site-toaster');
  expect(record?.namedAfter).not.toContain('site-toaster');
});
