import { expect, test } from '@playwright/test';
import { glassContrastFailures } from './glass-contrast';
import { applySettings, openPage } from './site';

const worlds = ['dichroic', 'partition', 'smoked', 'vapor', 'crystal', 'ink', 'opal', 'mercury', 'vellum', 'midnight'];

for (const theme of ['light', 'dark'] as const) {
  for (const world of worlds) {
    test(`text on glass meets AA in ${world} ${theme}`, async ({ page }) => {
      await applySettings(page, { world, theme });
      for (const path of ['/', '/docs/toast', '/playground']) {
        await openPage(page, path);
        const failures = await page.evaluate(glassContrastFailures);
        expect(failures, `${path} in ${world} ${theme}`).toEqual([]);
      }
    });
  }
}
