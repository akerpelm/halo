import type { Page } from '@playwright/test';

export type TransitionRecord = {
  types: string[];
  skipped: boolean;
  namedDuring: string[];
  namedAfter: string[];
  longestAnimationMs: number;
  finished: boolean;
  afterRecorded: boolean;
};

declare global {
  interface Window {
    viewTransitions: TransitionRecord[];
  }
}

export async function recordViewTransitions(page: Page) {
  await page.addInitScript(() => {
    window.viewTransitions = [];
    const start = Document.prototype.startViewTransition;
    const names = () =>
      [...document.querySelectorAll('*')].map((el) => getComputedStyle(el).viewTransitionName).filter((name) => name !== 'none');
    Document.prototype.startViewTransition = function (this: Document, ...args: Parameters<Document['startViewTransition']>) {
      const transition = start.apply(this, args);
      const record: TransitionRecord = { types: [], skipped: false, namedDuring: [], namedAfter: [], afterRecorded: false, longestAnimationMs: 0, finished: false };
      window.viewTransitions.push(record);
      transition.ready.then(
        () => {
          record.types = [...transition.types];
          record.namedDuring = names();
          record.longestAnimationMs = Math.max(
            0,
            ...document
              .getAnimations()
              .filter((a) => a.effect instanceof KeyframeEffect && a.effect.pseudoElement?.startsWith('::view-transition'))
              .map((a) => {
                const timing = a.effect?.getComputedTiming();
                return Number(timing?.endTime ?? 0);
              }),
          );
        },
        () => {
          record.skipped = true;
        },
      );
      transition.finished.finally(() => {
        record.finished = true;
        requestAnimationFrame(() => {
          record.namedAfter = names();
          record.afterRecorded = true;
        });
      });
      return transition;
    };
  });
}

export async function lastTransition(page: Page) {
  await page.waitForFunction(() => {
    const last = window.viewTransitions.at(-1);
    return last?.afterRecorded;
  });
  return page.evaluate(() => window.viewTransitions.at(-1));
}
