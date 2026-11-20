import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type MouseEvent, useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Swipe } from '../src/swipe';
import { type SwipeGeometry, commitDistance, limit, releaseOutcome, sideFor } from '../src/swipe/root/geometry';

const ROW = 300;
const ACTIONS = 120;

beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({ matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
  Element.prototype.setPointerCapture = () => undefined;
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      const list = (this as HTMLElement).classList;
      if (list.contains('halo-swipe')) return ROW;
      if (list.contains('halo-swipe-actions')) return ACTIONS;
      return 0;
    },
  });
});

afterEach(cleanup);

type Item = { id: number; name: string };

function Inbox({ onArchive = () => {}, onFlag = () => {}, fullSwipe }: { onArchive?: (item: Item) => void; onFlag?: (item: Item) => void; fullSwipe?: boolean }) {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: 'Invoice 41' },
    { id: 2, name: 'Invoice 42' },
    { id: 3, name: 'Invoice 43' },
  ]);
  return (
    <Swipe.Group aria-label="Invoices" fullSwipe={fullSwipe}>
      {items.map((item) => (
        <Swipe.Root key={item.id}>
          <Swipe.Content>
            <a href={`#${item.id}`}>{item.name}</a>
          </Swipe.Content>
          <Swipe.Actions side="end">
            <Swipe.Action aria-label={`Flag ${item.name}`} onClick={() => onFlag(item)}>
              Flag
            </Swipe.Action>
            <Swipe.Action
              commit
              aria-label={`Archive ${item.name}`}
              announce={`${item.name} archived`}
              onClick={() => {
                onArchive(item);
                setItems((all) => all.filter((other) => other.id !== item.id));
              }}
            >
              Archive
            </Swipe.Action>
          </Swipe.Actions>
        </Swipe.Root>
      ))}
    </Swipe.Group>
  );
}

const pause = (ms: number) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));
const contentOf = (name: string) => screen.getByText(name).closest('.halo-swipe-content') as HTMLElement;
const rowOf = (name: string) => screen.getByText(name).closest('.halo-swipe') as HTMLElement;

/** A slow horizontal drag (positive is right), held still before release so only position counts. */
async function dragBy(target: HTMLElement, dx: number, dy = 0) {
  fireEvent.pointerDown(target, { pointerId: 1, clientX: 200, clientY: 100, button: 0, pointerType: 'touch' });
  fireEvent.pointerMove(target, { pointerId: 1, clientX: 200 + dx / 2, clientY: 100 + dy / 2, pointerType: 'touch' });
  fireEvent.pointerMove(target, { pointerId: 1, clientX: 200 + dx, clientY: 100 + dy, pointerType: 'touch' });
  await pause(60);
  fireEvent.pointerUp(target, { pointerId: 1, clientX: 200 + dx, clientY: 100 + dy, pointerType: 'touch' });
}

const offset = (element: HTMLElement) => element.style.transform;

describe('<Swipe />', () => {
  it('renders rows as list items and actions as real, labelled buttons', () => {
    render(<Inbox />);
    expect(screen.getByRole('list', { name: 'Invoices' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Archive Invoice 42' }).hasAttribute('data-commit')).toBe(true);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('opens to the width of the actions after a half-way drag', async () => {
    render(<Inbox />);
    await dragBy(contentOf('Invoice 42'), -80);
    expect(offset(contentOf('Invoice 42'))).toBe(`translate3d(${-ACTIONS}px, 0px, 0px)`);
    expect(rowOf('Invoice 42').dataset.showing).toBe('end');
  });

  it('closes again after a short drag', async () => {
    render(<Inbox />);
    await dragBy(contentOf('Invoice 42'), -40);
    expect(offset(contentOf('Invoice 42'))).toBe('');
  });

  it('runs the commit action on a full swipe, through the same button, and announces it', async () => {
    const onArchive = vi.fn();
    render(<Inbox onArchive={onArchive} />);
    expect(commitDistance({ row: ROW, start: 0, end: ACTIONS, startCommit: false, endCommit: true, ltr: true }, 'end')).toBe(176);
    await dragBy(contentOf('Invoice 42'), -200);
    await act(async () => {});
    expect(onArchive).toHaveBeenCalledWith({ id: 2, name: 'Invoice 42' });
    expect(screen.queryByText('Invoice 42')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Invoice 42 archived');
  });

  it('stops with the actions showing when full swipes are off', async () => {
    const onArchive = vi.fn();
    render(<Inbox onArchive={onArchive} fullSwipe={false} />);
    await dragBy(contentOf('Invoice 42'), -200);
    await act(async () => {});
    expect(onArchive).not.toHaveBeenCalled();
    expect(offset(contentOf('Invoice 42'))).toBe(`translate3d(${-ACTIONS}px, 0px, 0px)`);
    expect(rowOf('Invoice 42').hasAttribute('data-armed')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Archive Invoice 42' }));
    expect(onArchive).toHaveBeenCalledOnce();
  });

  it('ignores vertical movement so the page can scroll', async () => {
    render(<Inbox />);
    await dragBy(contentOf('Invoice 42'), -10, 60);
    expect(offset(contentOf('Invoice 42'))).toBe('');
  });

  it('swallows the click that ends a drag, so a link inside does not open', async () => {
    const clicked = vi.fn();
    render(<Inbox />);
    screen.getByText('Invoice 42').addEventListener('click', clicked);
    await dragBy(contentOf('Invoice 42'), -80);
    fireEvent.click(screen.getByText('Invoice 42'));
    expect(clicked).not.toHaveBeenCalled();
    await pause(100);
    fireEvent.click(screen.getByText('Invoice 41'));
  });

  it('keeps only one row open at a time', async () => {
    render(<Inbox />);
    await dragBy(contentOf('Invoice 41'), -80);
    await dragBy(contentOf('Invoice 43'), -80);
    expect(offset(contentOf('Invoice 41'))).toBe('');
    expect(offset(contentOf('Invoice 43'))).toBe(`translate3d(${-ACTIONS}px, 0px, 0px)`);
  });

  it('slides a row open when keyboard focus reaches its actions, and closes on Escape', () => {
    render(<Inbox />);
    const flag = screen.getByRole('button', { name: 'Flag Invoice 42' });
    act(() => flag.focus());
    expect(offset(contentOf('Invoice 42'))).toBe(`translate3d(${-ACTIONS}px, 0px, 0px)`);
    fireEvent.keyDown(flag, { key: 'Escape' });
    expect(offset(contentOf('Invoice 42'))).toBe('');
  });

  it('moves focus to the next row when the focused row is removed', async () => {
    render(<Inbox />);
    const archive = screen.getByRole('button', { name: 'Archive Invoice 42' });
    act(() => archive.focus());
    fireEvent.click(archive);
    await act(async () => {});
    expect(document.activeElement).toBe(screen.getByText('Invoice 43'));
  });

  it('runs a plain action on click and closes the row', () => {
    const onFlag = vi.fn();
    render(<Inbox onFlag={onFlag} />);
    const flag = screen.getByRole('button', { name: 'Flag Invoice 41' });
    act(() => flag.focus());
    fireEvent.click(flag);
    expect(onFlag).toHaveBeenCalledWith({ id: 1, name: 'Invoice 41' });
    expect(offset(contentOf('Invoice 41'))).toBe('');
  });

  it('turns the gesture off when disabled', async () => {
    render(
      <Swipe.Group>
        <Swipe.Root disabled>
          <Swipe.Content>Locked</Swipe.Content>
          <Swipe.Actions>
            <Swipe.Action>Delete</Swipe.Action>
          </Swipe.Actions>
        </Swipe.Root>
      </Swipe.Group>,
    );
    await dragBy(contentOf('Locked'), -120);
    expect(offset(contentOf('Locked'))).toBe('');
  });

  it('springs back closed when the commit action does not go through', async () => {
    render(<Row onCommit={(event) => event.preventDefault()} />);
    await dragBy(contentOf('Row'), -200);
    await act(async () => {});
    expect(offset(contentOf('Row'))).toBe('');
  });

  it('does not full-swipe into a disabled commit action', async () => {
    render(<Row commitDisabled />);
    await dragBy(contentOf('Row'), -200);
    await act(async () => {});
    expect(offset(contentOf('Row'))).toBe(`translate3d(${-ACTIONS}px, 0px, 0px)`);
  });

  it('does not run the commit when the swipe is interrupted on its way out', async () => {
    const onCommit = vi.fn();
    const reduced = window.matchMedia;
    window.matchMedia = (query: string) =>
      ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
    try {
      render(<Row onCommit={onCommit} />);
      await dragBy(contentOf('Row'), -200);
      fireEvent.keyDown(contentOf('Row'), { key: 'Escape' });
      await pause(1200);
      expect(onCommit).not.toHaveBeenCalled();
      expect(offset(contentOf('Row'))).toBe('');
    } finally {
      window.matchMedia = reduced;
    }
  });

  it('keeps focus visible on the row when Escape or an action closes it', () => {
    render(<Inbox />);
    const flag = screen.getByRole('button', { name: 'Flag Invoice 42' });
    act(() => flag.focus());
    fireEvent.keyDown(flag, { key: 'Escape' });
    expect(document.activeElement).toBe(contentOf('Invoice 42'));
    const next = screen.getByRole('button', { name: 'Flag Invoice 43' });
    act(() => next.focus());
    fireEvent.click(next);
    expect(document.activeElement).toBe(contentOf('Invoice 43'));
  });

  it('moves focus to the next row when the focused row is removed, even with nothing focusable inside', async () => {
    function Plain() {
      const [items, setItems] = useState(['Alpha', 'Beta']);
      return (
        <Swipe.Group aria-label="Plain">
          {items.map((name) => (
            <Swipe.Root key={name}>
              <Swipe.Content>{name}</Swipe.Content>
              <Swipe.Actions>
                <Swipe.Action commit aria-label={`Delete ${name}`} onClick={() => setItems((all) => all.filter((other) => other !== name))}>
                  Delete
                </Swipe.Action>
              </Swipe.Actions>
            </Swipe.Root>
          ))}
        </Swipe.Group>
      );
    }
    render(<Plain />);
    const remove = screen.getByRole('button', { name: 'Delete Alpha' });
    act(() => remove.focus());
    fireEvent.click(remove);
    await act(async () => {});
    expect(document.activeElement).toBe(contentOf('Beta'));
  });

  it('does not drag on hover after a mouse press was released outside the row', () => {
    render(<Row />);
    const content = contentOf('Row');
    fireEvent.pointerDown(content, { pointerId: 1, clientX: 200, clientY: 100, button: 0, buttons: 1, pointerType: 'mouse' });
    fireEvent.pointerUp(document.body, { pointerId: 1, clientX: 203, clientY: 100, pointerType: 'mouse' });
    fireEvent.pointerMove(content, { pointerId: 1, clientX: 120, clientY: 100, buttons: 0, pointerType: 'mouse' });
    expect(offset(content)).toBe('');
  });

  it('runs pointer handlers passed to Content alongside its own', async () => {
    const onPointerDown = vi.fn();
    render(<Row onContentPointerDown={onPointerDown} />);
    await dragBy(contentOf('Row'), -80);
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(offset(contentOf('Row'))).toBe(`translate3d(${-ACTIONS}px, 0px, 0px)`);
  });
});

function Row({
  onCommit,
  commitDisabled,
  onContentPointerDown,
}: {
  onCommit?: (event: MouseEvent<HTMLButtonElement>) => void;
  commitDisabled?: boolean;
  onContentPointerDown?: () => void;
}) {
  return (
    <Swipe.Group aria-label="Rows">
      <Swipe.Root>
        <Swipe.Content onPointerDown={onContentPointerDown}>Row</Swipe.Content>
        <Swipe.Actions>
          <Swipe.Action>Flag</Swipe.Action>
          <Swipe.Action commit disabled={commitDisabled} onClick={onCommit}>
            Archive
          </Swipe.Action>
        </Swipe.Actions>
      </Swipe.Root>
    </Swipe.Group>
  );
}

describe('swipe geometry', () => {
  const geometry: SwipeGeometry = { row: ROW, start: 0, end: ACTIONS, startCommit: false, endCommit: true, ltr: true };

  it('maps direction to side, mirrored in right-to-left text', () => {
    expect(sideFor(-10, true)).toBe('end');
    expect(sideFor(10, true)).toBe('start');
    expect(sideFor(-10, false)).toBe('start');
  });

  it('travels freely to the whole row when a full swipe can commit, and resists past it', () => {
    expect(limit(-250, geometry)).toBe(-250);
    expect(Math.abs(limit(-400, geometry))).toBeLessThan(400);
    expect(Math.abs(limit(-400, geometry))).toBeGreaterThan(ROW);
  });

  it('resists past the actions when there is no commit action, and from the start where there are none', () => {
    const plain = { ...geometry, endCommit: false };
    expect(Math.abs(limit(-200, plain))).toBeLessThan(200);
    expect(Math.abs(limit(-200, plain))).toBeGreaterThan(ACTIONS);
    expect(limit(60, geometry)).toBeLessThan(60);
    expect(commitDistance(plain, 'end')).toBeNull();
  });

  it('commits only when momentum carries past the commit point and the actions were already uncovered', () => {
    expect(releaseOutcome(-200, 0, geometry).kind).toBe('commit');
    expect(releaseOutcome(-130, -1500, geometry).kind).toBe('commit');
    expect(releaseOutcome(-60, -3000, geometry)).toEqual({ kind: 'open', side: 'end' });
    expect(releaseOutcome(-130, 0, geometry).kind).toBe('open');
  });

  it('closes on a short drag or a flick back', () => {
    expect(releaseOutcome(-40, 0, geometry).kind).toBe('close');
    expect(releaseOutcome(-100, 2000, geometry).kind).toBe('close');
    expect(releaseOutcome(40, 0, geometry).kind).toBe('close');
  });
});
