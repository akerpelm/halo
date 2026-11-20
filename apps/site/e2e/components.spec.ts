import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { applySettings, openPage } from './site';

const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

test.describe('popover', () => {
  test('opens from the keyboard, takes focus, and gives it back on Esc', async ({ page }) => {
    await openPage(page, '/docs/popover');
    const trigger = page.getByRole('main').getByRole('button', { name: 'Share', exact: true }).last();
    await trigger.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Share “Spring launch”' });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('stays on screen at 320px and lights the edge that faces the trigger', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openPage(page, '/docs/popover');
    const trigger = page.getByRole('main').getByRole('button', { name: 'Share', exact: true }).last();
    await trigger.click();
    const popup = page.locator('.halo-popover:popover-open');
    await expect(popup).toBeVisible();
    const box = await popup.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
    const side = await popup.getAttribute('data-side');
    const attachY = await popup.evaluate((el) => el.style.getPropertyValue('--halo-attach-y'));
    expect(attachY).toBe(side === 'bottom' ? '0%' : '100%');
  });

  test('closes when its trigger scrolls under the header, without moving the page', async ({ page }) => {
    await openPage(page, '/docs/popover');
    const trigger = page.getByRole('main').getByRole('button', { name: 'Share', exact: true }).last();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const popup = page.locator('.halo-popover:popover-open');
    await expect(popup).toBeVisible();
    const sides = new Set<string | null>();
    const triggerTop = await trigger.evaluate((el) => el.getBoundingClientRect().top);
    for (let step = 0; step < 12; step++) {
      await page.evaluate((dy) => window.scrollBy(0, dy), (triggerTop - 20) / 12);
      await page.waitForTimeout(30);
      if (await popup.count()) sides.add(await popup.getAttribute('data-side'));
    }
    await expect(page.locator('.halo-popover:popover-open')).toHaveCount(0);
    expect([...sides].filter(Boolean)).toEqual(['bottom']);
    const scrollAfterClose = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollAfterClose);
  });

  test('has no axe violations while open, in light and dark', async ({ page }) => {
    for (const theme of ['light', 'dark'] as const) {
      await applySettings(page, { world: 'dichroic', theme });
      await openPage(page, '/docs/popover');
      await page.getByRole('main').getByRole('button', { name: 'Share', exact: true }).last().click();
      await expect(page.locator('.halo-popover:popover-open')).toBeVisible();
      await page.waitForTimeout(500);
      const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
    }
  });
});

test.describe('swipe actions', () => {
  test('Tab reaches the actions and slides the row open; Esc closes it', async ({ page }) => {
    await openPage(page, '/docs/swipe');
    const flag = page.getByRole('button', { name: 'Flag invoice 1043' });
    await flag.focus();
    const row = page.locator('.halo-swipe').filter({ has: flag });
    await expect(row).toHaveAttribute('data-showing', 'end');
    await expect(flag).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(row).not.toHaveAttribute('data-showing', 'end');
  });

  test('a full swipe archives the row, offers undo, and undo brings it back', async ({ page }) => {
    await openPage(page, '/docs/swipe');
    const content = page.locator('.halo-swipe-content').filter({ hasText: 'Harbor & Pine' });
    await content.scrollIntoViewIfNeeded();
    const box = await content.boundingBox();
    if (!box) throw new Error('row not laid out');
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width - 20, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 200, y, { steps: 8 });
    await page.mouse.move(box.x + 20, y, { steps: 12 });
    await page.waitForTimeout(60);
    await page.mouse.up();
    await expect(page.getByText('Harbor & Pine')).toHaveCount(0);
    await page.getByRole('button', { name: /undo/i }).click();
    await expect(page.getByText('Harbor & Pine')).toHaveCount(1);
  });

  test('a vertical drag scrolls instead of opening a row', async ({ page }) => {
    await openPage(page, '/docs/swipe');
    const content = page.locator('.halo-swipe-content').first();
    await content.scrollIntoViewIfNeeded();
    const box = await content.boundingBox();
    if (!box) throw new Error('row not laid out');
    await page.mouse.move(box.x + box.width / 2, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 8, box.y + 70, { steps: 6 });
    await page.mouse.up();
    await expect(page.locator('.halo-swipe').first()).not.toHaveAttribute('data-showing', /.+/);
  });
});
