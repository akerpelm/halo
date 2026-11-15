import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Drawer, type DrawerRootProps, type SnapPoint } from '../src/drawer/drawer';

// jsdom has no layout, top layer, or pointer capture. Reduced motion makes every spring settle
// at once, so each test sees the final state without waiting on animation frames.
const PANEL_SIZE = 700;

beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({ matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
  Element.prototype.setPointerCapture = () => undefined;
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      return (this as HTMLElement).classList.contains('halo-drawer-panel') ? PANEL_SIZE : 0;
    },
  });
});

afterEach(cleanup);

function Sheet(props: Partial<DrawerRootProps>) {
  return (
    <Drawer.Root {...props}>
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Title>Share</Drawer.Title>
        <Drawer.Description>Send this to someone.</Drawer.Description>
        <Drawer.Close>Done</Drawer.Close>
      </Drawer.Content>
    </Drawer.Root>
  );
}

const panel = () => document.querySelector('.halo-drawer-panel') as HTMLElement;
const dialog = () => document.querySelector('dialog');

/** A vertical drag on the panel, in screen pixels (positive is down). */
function dragBy(dy: number) {
  const target = panel();
  fireEvent.pointerDown(target, { pointerId: 1, clientX: 100, clientY: 300, button: 0 });
  fireEvent.pointerMove(target, { pointerId: 1, clientX: 100, clientY: 300 + dy / 2 });
  fireEvent.pointerMove(target, { pointerId: 1, clientX: 100, clientY: 300 + dy });
  fireEvent.pointerUp(target, { pointerId: 1, clientX: 100, clientY: 300 + dy });
}

/** Lets the close promise resolve and React commit the unmount. */
const settle = () => act(async () => {});

describe('<Drawer />', () => {
  it('opens a labelled modal dialog from its trigger', () => {
    render(<Sheet />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const element = dialog();
    expect(element?.hasAttribute('open')).toBe(true);
    expect(document.getElementById(element?.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Share');
    expect(document.getElementById(element?.getAttribute('aria-describedby') ?? '')?.textContent).toBe('Send this to someone.');
  });

  it('moves focus into the panel and back to the trigger on close', async () => {
    render(<Sheet />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(panel());

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on Escape and on the overlay, unless it is not dismissible', async () => {
    const { unmount } = render(<Sheet defaultOpen />);
    fireEvent(dialog() as HTMLDialogElement, new Event('cancel', { cancelable: true }));
    await settle();
    expect(dialog()).toBeNull();
    unmount();

    render(<Sheet defaultOpen dismissible={false} />);
    fireEvent(dialog() as HTMLDialogElement, new Event('cancel', { cancelable: true }));
    fireEvent.click(document.querySelector('.halo-drawer-overlay') as Element);
    await settle();
    expect(dialog()?.hasAttribute('open')).toBe(true);
  });

  it('locks page scroll while open and restores it after', async () => {
    document.documentElement.style.overflow = 'clip';
    render(<Sheet defaultOpen />);
    expect(document.documentElement.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await settle();
    expect(document.documentElement.style.overflow).toBe('clip');
    document.documentElement.style.overflow = '';
  });

  it('steps between detents with the handle, and closes past the smallest', async () => {
    const onSnap = vi.fn<(snap: SnapPoint) => void>();
    render(<Sheet defaultOpen snapPoints={[0.3, 0.6]} onActiveSnapPointChange={onSnap} />);
    const handle = screen.getByRole('button', { name: /Resize drawer/ });

    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(onSnap).toHaveBeenLastCalledWith(0.6);

    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(onSnap).toHaveBeenLastCalledWith(0.3);

    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    await settle();
    expect(dialog()).toBeNull();
  });

  it('drags down past the nearest detent to close', async () => {
    render(<Sheet defaultOpen snapPoints={[0.3, 0.6]} defaultSnapPoint={0.6} />);
    // 0.6 of the 768px jsdom viewport is about 461px open; 400px down lands nearest to closed.
    dragBy(400);
    await settle();
    expect(dialog()).toBeNull();
  });

  it('settles a short drag at the nearest detent instead of closing', async () => {
    const onSnap = vi.fn<(snap: SnapPoint) => void>();
    render(<Sheet defaultOpen snapPoints={[0.3, 0.6]} defaultSnapPoint={0.6} onActiveSnapPointChange={onSnap} />);
    dragBy(200);
    await settle();
    expect(dialog()?.hasAttribute('open')).toBe(true);
    expect(onSnap).toHaveBeenLastCalledWith(0.3);
  });

  it('never drags a non-dismissible drawer closed', async () => {
    render(<Sheet defaultOpen dismissible={false} snapPoints={[0.3, 0.6]} />);
    dragBy(700);
    await settle();
    expect(dialog()?.hasAttribute('open')).toBe(true);
  });

  it('ignores a mostly sideways gesture', async () => {
    const onSnap = vi.fn<(snap: SnapPoint) => void>();
    render(<Sheet defaultOpen snapPoints={[0.3, 0.6]} defaultSnapPoint={0.6} onActiveSnapPointChange={onSnap} />);
    const target = panel();
    fireEvent.pointerDown(target, { pointerId: 1, clientX: 100, clientY: 300, button: 0 });
    // Far enough down that, if it counted as a drag, it would settle at the smaller detent.
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 400, clientY: 480 });
    fireEvent.pointerUp(target, { pointerId: 1, clientX: 400, clientY: 480 });
    await settle();
    expect(onSnap).not.toHaveBeenCalled();
    expect(dialog()?.hasAttribute('open')).toBe(true);
  });

  it('throws a clear error when a part is used outside Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Drawer.Title>Lost</Drawer.Title>)).toThrow('<Drawer.Title> must be rendered inside <Drawer.Root>.');
    vi.restoreAllMocks();
  });
});
