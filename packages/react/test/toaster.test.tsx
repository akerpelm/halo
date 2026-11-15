import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { toast, toastStore } from '../src/toast/store';
import { Toaster } from '../src/toast/toaster';

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  };
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
});

afterEach(() => {
  cleanup();
  for (const t of toastStore.getSnapshot()) toastStore.remove(t.id);
});

describe('<Toaster />', () => {
  it('renders a labelled landmark with the hotkey in its name', () => {
    render(<Toaster />);
    expect(screen.getByRole('region', { name: 'Notifications (alt+T)' })).toBeTruthy();
  });

  it('renders toasts with a type label for screen readers', () => {
    render(<Toaster />);
    act(() => {
      toast.error('Upload failed', { description: 'Too large' });
    });
    const item = screen.getByText('Upload failed').closest('li');
    expect(item?.getAttribute('data-type')).toBe('error');
    expect(item?.textContent).toContain('Error:');
  });

  it('runs the action and closes unless the action prevents it', () => {
    let clicks = 0;
    render(<Toaster />);
    act(() => {
      toast('Archived', { action: { label: 'Undo', onClick: () => (clicks += 1) } });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(clicks).toBe(1);
    expect(toastStore.getSnapshot()[0]?.dismissed).toBe(true);
  });

  it('dismisses the focused toast with Escape', () => {
    render(<Toaster />);
    act(() => {
      toast('Saved');
    });
    const item = screen.getByText('Saved').closest('li');
    if (!item) throw new Error('toast not rendered');
    fireEvent.keyDown(item, { key: 'Escape' });
    expect(toastStore.getSnapshot()[0]?.dismissed).toBe(true);
  });

  it('only renders toasts addressed to its id', () => {
    render(<Toaster id="side" />);
    act(() => {
      toast('Elsewhere');
      toast('Here', { toasterId: 'side' });
    });
    expect(screen.queryByText('Elsewhere')).toBeNull();
    expect(screen.getByText('Here')).toBeTruthy();
  });
});

describe('timers', () => {
  it('still auto-dismisses when the stack is always expanded', async () => {
    vi.useFakeTimers();
    render(<Toaster expand duration={1000} />);
    act(() => {
      toast('Saved');
    });
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(toastStore.getSnapshot()[0]?.dismissed).toBe(true);
    vi.useRealTimers();
  });
});

describe('appearance props', () => {
  it('hides type icons when icons is false', () => {
    render(<Toaster icons={false} timer={false} />);
    act(() => {
      toast.success('Saved');
    });
    expect(screen.getByText('Saved').closest('li')?.querySelector('.halo-toast-icon')).toBeNull();
  });

  it('marks intent and passes coat colours as custom properties', () => {
    render(<Toaster intent="edge" coat={['red', 'green', 'blue']} />);
    act(() => {
      toast.error('Nope');
    });
    expect(screen.getByText('Nope').closest('li')?.getAttribute('data-intent')).toBe('edge');
    const region = screen.getByRole('region') as HTMLElement;
    expect(region.style.getPropertyValue('--halo-coat-b')).toBe('green');
  });
});

describe('extending', () => {
  it('accepts a custom world name and passes it to the stylesheet hook', () => {
    render(<Toaster world="midnight" />);
    expect(screen.getByRole('region').getAttribute('data-halo-world')).toBe('midnight');
  });

  it('adds classNames to each toast part', () => {
    render(<Toaster classNames={{ toast: 'shadow-xl', title: 'font-bold', close: 'text-red-600' }} />);
    act(() => {
      toast('Styled');
    });
    const item = screen.getByText('Styled').closest('li');
    expect(item?.className).toContain('shadow-xl');
    expect(screen.getByText('Styled').className).toContain('font-bold');
    expect(screen.getByRole('button', { name: 'Dismiss notification' }).className).toContain('text-red-600');
  });

  it('reports whether a toast is still active', () => {
    render(<Toaster />);
    let id: string | number = '';
    act(() => {
      id = toast('Here');
    });
    expect(toast.isActive(id)).toBe(true);
    act(() => {
      toast.dismiss(id);
    });
    expect(toast.isActive(id)).toBe(false);
  });
});

describe('hidden toasts', () => {
  it('marks toasts past the visible count as hidden so they cannot block the page', () => {
    render(<Toaster visibleToasts={2} />);
    act(() => {
      toast('one');
      toast('two');
      toast('three');
    });
    // Newest first: 'one' is now third and out of view.
    expect(screen.getByText('one').closest('li')?.hasAttribute('data-hidden')).toBe(true);
    expect(screen.getByText('three').closest('li')?.hasAttribute('data-hidden')).toBe(false);
  });
});

describe('several toasters on one page', () => {
  it('gives a named toaster its own landmark name and no shared shortcut', () => {
    render(
      <>
        <Toaster />
        <Toaster id="side" />
      </>,
    );
    expect(screen.getByRole('region', { name: 'Notifications (alt+T)' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Notifications: side' })).toBeTruthy();
  });
});

describe('contained', () => {
  it('marks a contained toaster so it positions inside its parent', () => {
    render(<Toaster id="stage" contained />);
    expect(screen.getByRole('region').hasAttribute('data-contained')).toBe(true);
  });
});
