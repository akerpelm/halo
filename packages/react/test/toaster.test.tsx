import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
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
