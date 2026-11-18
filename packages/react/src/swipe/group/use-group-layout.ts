import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { resolveSpring } from '../../spring/spring-config';
import { PIXEL_PRECISION, type SpringValue, createSpringValue } from '../../spring/spring-value';

const CLOSE_GAP = resolveSpring({ duration: 0.4, bounce: 0.08 });
const FOCUSABLE = ':is(a[href], button, input, select, textarea, [tabindex]):not([tabindex="-1"], [disabled])';

const rowsOf = (list: HTMLElement) => Array.from(list.children).filter((el): el is HTMLElement => el.classList.contains('halo-swipe'));

/**
 * Closes the gap a removed row leaves with transforms only: each row that moved starts where it was
 * and springs to its new place. If the removed row held focus, focus moves to the row now in its spot.
 */
export function useGroupLayout(listRef: RefObject<HTMLUListElement | null>, reducedMotion: boolean) {
  const tops = useRef(new WeakMap<HTMLElement, number>());
  const springs = useRef(new WeakMap<HTMLElement, SpringValue>());
  const focused = useRef<{ row: HTMLElement; index: number } | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const onFocusIn = (event: FocusEvent) => {
      const row = (event.target as Element).closest<HTMLElement>('.halo-swipe');
      if (row) focused.current = { row, index: rowsOf(list).indexOf(row) };
    };
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && !list.contains(event.relatedTarget)) focused.current = null;
    };
    list.addEventListener('focusin', onFocusIn);
    list.addEventListener('focusout', onFocusOut);
    return () => {
      list.removeEventListener('focusin', onFocusIn);
      list.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows = rowsOf(list);

    for (const row of rows) {
      const before = tops.current.get(row);
      const now = row.offsetTop;
      tops.current.set(row, now);
      if (before === undefined || before === now || reducedMotion) continue;
      let spring = springs.current.get(row);
      if (!spring) {
        spring = createSpringValue(0, CLOSE_GAP, (y) => {
          row.style.transform = y === 0 ? '' : `translate3d(0, ${y}px, 0)`;
        }, PIXEL_PRECISION);
        springs.current.set(row, spring);
      }
      spring.set(before - now + spring.get());
      spring.to(0);
    }

    const lost = focused.current;
    if (!lost || lost.row.isConnected) return;
    focused.current = null;
    if (document.activeElement && document.activeElement !== document.body) return;
    const next = rows[Math.min(lost.index, rows.length - 1)];
    const target = next?.querySelector<HTMLElement>(`.halo-swipe-content ${FOCUSABLE}, .halo-swipe-content[tabindex]`) ?? list;
    target.focus({ preventScroll: true });
  });
}
