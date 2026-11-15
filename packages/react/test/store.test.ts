import { beforeEach, describe, expect, it } from 'vitest';
import { toast } from '../src/toast';
import { toastStore } from '../src/toast/store/toast-store';

beforeEach(() => {
  for (const t of toastStore.getSnapshot()) toastStore.remove(t.id);
});

describe('toast store', () => {
  it('adds newest first', () => {
    toast('one');
    toast('two');
    expect(toastStore.getSnapshot().map((t) => t.title)).toEqual(['two', 'one']);
  });

  it('updates in place when the id already exists, keeping its type', () => {
    const id = toast.success('Saved', { id: 'save' });
    toast.update(id, 'Saved again');
    const [record] = toastStore.getSnapshot();
    expect(toastStore.getSnapshot()).toHaveLength(1);
    expect(record?.title).toBe('Saved again');
    expect(record?.type).toBe('success');
    expect(record?.revision).toBe(1);
  });

  it('marks dismissed before removal so the exit can animate', () => {
    const id = toast('bye');
    toast.dismiss(id);
    expect(toastStore.getSnapshot()[0]?.dismissed).toBe(true);
    toastStore.remove(id);
    expect(toastStore.getSnapshot()).toHaveLength(0);
  });

  it('morphs a promise toast from loading to success', async () => {
    await toast.promise(Promise.resolve(3), { loading: 'Working', success: (n) => `Done ${n}`, error: 'Failed' });
    await Promise.resolve();
    const [record] = toastStore.getSnapshot();
    expect(record?.type).toBe('success');
    expect(record?.title).toBe('Done 3');
  });
});

describe('new toast types', () => {
  it('groups repeats into one toast with a count', () => {
    toast.success('Uploaded', { group: 'uploads' });
    toast.success('Uploaded', { group: 'uploads' });
    toast.success('Uploaded', { group: 'uploads' });
    const live = toastStore.getSnapshot().filter((t) => !t.dismissed);
    expect(live).toHaveLength(1);
    expect(live[0]?.count).toBe(3);
  });

  it('streams text into the description, then settles into success', async () => {
    async function* words() {
      yield 'Three ';
      yield 'bugs ';
      yield 'fixed.';
    }
    const run = toast.stream(words(), { title: 'Summarising…', success: 'Summary ready' });
    expect(toastStore.getSnapshot()[0]?.type).toBe('loading');
    const text = await run;
    const [record] = toastStore.getSnapshot();
    expect(text).toBe('Three bugs fixed.');
    expect(record?.type).toBe('success');
    expect(record?.description).toBe('Three bugs fixed.');
    expect(record?.streaming).toBe(false);
  });

  it('makes an undo toast whose action calls onUndo', () => {
    let undone = false;
    toast.undo('Archived', { onUndo: () => (undone = true) });
    const [record] = toastStore.getSnapshot();
    expect(record?.undo).toBe(true);
    record?.action?.onClick({} as never);
    expect(undone).toBe(true);
  });
});
