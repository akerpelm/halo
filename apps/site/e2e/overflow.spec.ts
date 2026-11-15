import { expect, test } from '@playwright/test';
import { auditedPaths, openPage } from './site';

const widths = [320, 375, 640, 768, 1024, 1440];

for (const path of auditedPaths) {
  for (const width of widths) {
    test(`${path} has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openPage(page, path);
      const overflow = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        const offenders = [...document.querySelectorAll('body *')]
          .filter((el) => el.getBoundingClientRect().right > limit + 1)
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join('.')}`);
        return { scrollWidth: document.documentElement.scrollWidth, limit, offenders };
      });
      expect(overflow.scrollWidth, `wider than the viewport: ${overflow.offenders.join(', ')}`).toBeLessThanOrEqual(overflow.limit);
    });
  }
}
