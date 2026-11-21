import { type Page, expect, test } from '@playwright/test';
import { auditedPaths, openPage } from './site';

const maxStops = 250;

for (const path of auditedPaths) {
  test(`every tab stop on ${path} shows a focus ring`, async ({ page }) => {
    await openPage(page, path);
    await walk(page);
  });
}

for (const builder of ['Drawer', 'Popover', 'Swipe']) {
  test(`every tab stop in the ${builder} builder shows a focus ring`, async ({ page }) => {
    await openPage(page, '/playground');
    await page.getByRole('group', { name: 'Building' }).getByText(builder, { exact: true }).click();
    await walk(page);
  });
}

async function walk(page: Page) {
    const seen: string[] = [];
    for (let stop = 0; stop < maxStops; stop++) {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        const labelled = el instanceof HTMLInputElement ? `${el.name} ${el.labels?.[0]?.textContent?.trim() ?? ''}` : null;
        const label = el.getAttribute('aria-label') ?? labelled ?? el.textContent?.trim().slice(0, 40) ?? '';
        return {
          id: `${el.tagName.toLowerCase()} "${label}"`,
          visibleFocus: el.matches(':focus-visible'),
          ring: (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== 'none',
          onScreen: box.width > 0 && box.height > 0,
        };
      });
      if (!focus) break;
      if (seen.length > 0 && focus.id === seen[0]) break;
      seen.push(focus.id);
      expect.soft(focus.visibleFocus, `${focus.id} matches :focus-visible`).toBe(true);
      expect.soft(focus.ring, `${focus.id} draws a focus ring`).toBe(true);
      expect.soft(focus.onScreen, `${focus.id} has a size`).toBe(true);
    }
    expect(seen.length).toBeGreaterThan(5);
}
