import { expect, test } from '@playwright/test';
import { auditedPaths, openPage } from './site';

const maxStops = 250;

for (const path of auditedPaths) {
  test(`every tab stop on ${path} shows a focus ring`, async ({ page }) => {
    await openPage(page, path);
    const seen: string[] = [];
    for (let stop = 0; stop < maxStops; stop++) {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        const label = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 40) ?? '';
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
  });
}
