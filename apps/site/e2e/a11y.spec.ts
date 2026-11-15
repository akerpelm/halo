import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { applySettings, auditedPaths, openPage, type Theme } from './site';

const looks: { world: string; theme: Theme }[] = [
  { world: 'dichroic', theme: 'light' },
  { world: 'dichroic', theme: 'dark' },
  { world: 'ink', theme: 'light' },
  { world: 'midnight', theme: 'dark' },
];

test.use({ reducedMotion: 'reduce' });

for (const path of auditedPaths) {
  for (const look of looks) {
    test(`axe finds no violations on ${path} in ${look.world} ${look.theme}`, async ({ page }) => {
      await applySettings(page, look);
      await openPage(page, path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary).toEqual([]);
    });
  }
}
