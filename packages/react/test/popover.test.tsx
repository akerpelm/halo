import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Popover, type PopoverRootProps } from '../src/popover';
import { attachPoint, fallbackPosition, growFrom, sideOf } from '../src/popover/popup/placement';

beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({ matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
  const toggle = (element: HTMLElement, newState: 'open' | 'closed') => {
    const before = Object.assign(new Event('beforetoggle'), { newState });
    element.dispatchEvent(before);
    if (newState === 'open') element.setAttribute('data-test-open', '');
    else element.removeAttribute('data-test-open');
    element.dispatchEvent(Object.assign(new Event('toggle'), { newState }));
  };
  const style = document.createElement('style');
  style.textContent = '[popover][data-test-open] { display: block !important; }';
  document.head.append(style);
  HTMLElement.prototype.showPopover = function showPopover() {
    if (this.hasAttribute('data-test-open')) throw new DOMException('already open', 'InvalidStateError');
    toggle(this, 'open');
  };
  HTMLElement.prototype.hidePopover = function hidePopover() {
    if (!this.hasAttribute('data-test-open')) throw new DOMException('already closed', 'InvalidStateError');
    toggle(this, 'closed');
  };
});

afterEach(cleanup);

function Share(props: Partial<PopoverRootProps>) {
  return (
    <Popover.Root {...props}>
      <Popover.Trigger>Share</Popover.Trigger>
      <Popover.Popup>
        <Popover.Title>Share this page</Popover.Title>
        <Popover.Description>Anyone with the link can view it.</Popover.Description>
        <button type="button" data-autofocus>
          Copy link
        </button>
        <Popover.Close>Done</Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  );
}

const trigger = () => screen.getByRole('button', { name: 'Share' });
const popup = () => document.querySelector('.halo-popover') as HTMLElement;

describe('<Popover />', () => {
  it('renders a labelled, non-modal dialog that the trigger controls', () => {
    render(<Share />);
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().getAttribute('aria-controls')).toBe(popup().id);
    expect(popup().getAttribute('popover')).toBe('auto');
    expect(popup().getAttribute('role')).toBe('dialog');
    expect(popup().getAttribute('aria-modal')).toBeNull();
    const title = screen.getByText('Share this page');
    expect(popup().getAttribute('aria-labelledby')).toBe(title.id);
    expect(popup().getAttribute('aria-describedby')).toBe(screen.getByText('Anyone with the link can view it.').id);
  });

  it('anchors the popup to its trigger by a shared anchor name', () => {
    render(<Share />);
    const name = popup().style.getPropertyValue('--halo-anchor');
    expect(name.startsWith('--halo-anchor-')).toBe(true);
    expect(trigger().style.getPropertyValue('anchor-name') || (trigger().style as unknown as { anchorName: string }).anchorName).toBe(name);
  });

  it('syncs state when the browser opens it, and moves focus inside', () => {
    render(<Share />);
    act(() => popup().showPopover());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Copy link' }));
    expect(popup().dataset.side).toBeDefined();
  });

  it('focuses the popup itself when nothing inside asks for focus', () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Info</Popover.Trigger>
        <Popover.Popup aria-label="About this field">Plain text only.</Popover.Popup>
      </Popover.Root>,
    );
    act(() => popup().showPopover());
    expect(document.activeElement).toBe(popup());
    expect(popup().getAttribute('aria-label')).toBe('About this field');
  });

  it('closes from Popover.Close', () => {
    render(<Share defaultOpen />);
    expect(popup().hasAttribute('data-test-open')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(popup().hasAttribute('data-test-open')).toBe(false);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('follows a controlled open prop and reports browser-side closes', () => {
    const changes: boolean[] = [];
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open from outside
          </button>
          <Share
            open={open}
            onOpenChange={(next) => {
              changes.push(next);
              setOpen(next);
            }}
          />
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: 'Open from outside' }));
    expect(popup().hasAttribute('data-test-open')).toBe(true);
    act(() => popup().hidePopover());
    expect(changes).toEqual([false]);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('leaves the reduced-motion fade to CSS instead of switching transitions off', () => {
    render(<Share />);
    act(() => popup().showPopover());
    expect(popup().style.transition).toBe('');
  });

  it('keeps the trigger pointed at the popup when the popup is given its own id', () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Info</Popover.Trigger>
        <Popover.Popup id="mine" aria-label="About">
          Text
        </Popover.Popup>
      </Popover.Root>,
    );
    expect(screen.getByRole('button', { name: 'Info' }).getAttribute('aria-controls')).toBe(popup().id);
  });

  it('does not throw where the popover API is missing', () => {
    const show = HTMLElement.prototype.showPopover;
    const hide = HTMLElement.prototype.hidePopover;
    Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
    Reflect.deleteProperty(HTMLElement.prototype, 'hidePopover');
    try {
      expect(() => render(<Share defaultOpen />)).not.toThrow();
    } finally {
      HTMLElement.prototype.showPopover = show;
      HTMLElement.prototype.hidePopover = hide;
    }
  });

  it('closes when the trigger scrolls away, but not while someone types inside', async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Info</Popover.Trigger>
        <Popover.Popup aria-label="Rename">
          <input aria-label="Name" />
        </Popover.Popup>
      </Popover.Root>,
    );
    act(() => popup().showPopover());
    screen.getByRole('button', { name: 'Info' }).getBoundingClientRect = () => new DOMRect(10, -200, 80, 40);
    act(() => screen.getByRole('textbox', { name: 'Name' }).focus());
    fireEvent.scroll(window);
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(popup().hasAttribute('data-test-open')).toBe(true);
    act(() => popup().focus());
    fireEvent.scroll(window);
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(popup().hasAttribute('data-test-open')).toBe(false);
  });

  it('carries world, theme and placement to the popup', () => {
    render(<Share world="partition" theme="dark" side="right" align="start" />);
    expect(popup().dataset.haloWorld).toBe('partition');
    expect(popup().dataset.theme).toBe('dark');
    expect(popup().dataset.placement).toBe('right');
    expect(popup().dataset.align).toBe('start');
  });
});

describe('popover placement', () => {
  const trigger = { left: 100, top: 100, width: 80, height: 32 };

  it('reads which side the popup landed on', () => {
    expect(sideOf(trigger, { left: 60, top: 140, width: 200, height: 120 })).toBe('bottom');
    expect(sideOf(trigger, { left: 60, top: -30, width: 200, height: 120 })).toBe('top');
    expect(sideOf(trigger, { left: 190, top: 80, width: 200, height: 120 })).toBe('right');
    expect(sideOf(trigger, { left: -110, top: 80, width: 200, height: 120 })).toBe('left');
  });

  it('keeps the side while the two boxes are a frame apart during a scroll', () => {
    expect(sideOf(trigger, { left: 40, top: 128, width: 200, height: 120 })).toBe('bottom');
    expect(sideOf(trigger, { left: 40, top: -16, width: 200, height: 120 })).toBe('top');
  });

  it('gathers the edge light where the trigger meets the popup', () => {
    expect(attachPoint(trigger, { left: 40, top: 140, width: 200, height: 120 }, 'bottom')).toEqual({ x: 50, y: 0 });
    expect(attachPoint(trigger, { left: 120, top: -30, width: 200, height: 120 }, 'top').y).toBe(100);
    expect(attachPoint(trigger, { left: 120, top: -30, width: 200, height: 120 }, 'top').x).toBe(10);
  });

  it('grows from the trigger box to the popup box', () => {
    const popupBox = { left: 40, top: 140, width: 200, height: 128 };
    expect(growFrom(trigger, popupBox, 0)).toBe('translate(60px, -40px) scale(0.4, 0.25)');
    expect(growFrom(trigger, popupBox, 1)).toBe('translate(0px, 0px) scale(1, 1)');
  });

  it('flips to the other side without anchor positioning when the preferred side overflows', () => {
    const low = { left: 100, top: 560, width: 80, height: 32 };
    const spot = fallbackPosition(low, { width: 200, height: 120 }, 'bottom', 'center', 8, { width: 800, height: 600 });
    expect(spot.side).toBe('top');
    expect(spot.top).toBe(560 - 8 - 120);
    expect(spot.left).toBe(100 + 40 - 100);
  });

  it('keeps the fallback position on screen', () => {
    const edge = { left: 0, top: 100, width: 40, height: 32 };
    const spot = fallbackPosition(edge, { width: 200, height: 120 }, 'bottom', 'center', 8, { width: 800, height: 600 });
    expect(spot.left).toBe(8);
  });
});
