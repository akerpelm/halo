import type { ReactNode } from 'react';
import { type ToastOptions, type ToastRecord, toastStore } from './toast-store';

type TypedOptions = Omit<ToastOptions, 'type'>;

type PromiseMessages<T> = {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
  description?: ReactNode;
};

type StreamMessages = {
  /** Title while text streams in. */
  title: ReactNode;
  /** Title once the stream ends. Defaults to `title`. */
  success?: ReactNode;
  error?: ReactNode | ((error: unknown) => ReactNode);
};

type UndoOptions = Omit<TypedOptions, 'action'> & {
  onUndo: () => void;
  /** Button text. Defaults to "Undo". */
  label?: ReactNode;
};

const { upsert } = toastStore;

const resolve = <T,>(message: ReactNode | ((value: T) => ReactNode), value: T) =>
  typeof message === 'function' ? message(value) : message;

function promise<T>(input: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>, options: TypedOptions = {}) {
  const id = upsert(messages.loading, { ...options, type: 'loading', duration: Infinity, description: messages.description });
  const run = typeof input === 'function' ? input() : input;
  run.then(
    (value) => upsert(resolve(messages.success, value), { ...options, id, type: 'success', description: undefined }),
    (error: unknown) => upsert(resolve(messages.error, error), { ...options, id, type: 'error', description: undefined }),
  );
  return run;
}

async function* chunks(source: AsyncIterable<string> | ReadableStream<string>): AsyncIterable<string> {
  if (Symbol.asyncIterator in source) {
    yield* source as AsyncIterable<string>;
    return;
  }
  const reader = (source as ReadableStream<string>).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    yield value;
  }
}

function stream(source: AsyncIterable<string> | ReadableStream<string>, messages: StreamMessages, options: TypedOptions = {}) {
  const streaming = { ...options, type: 'loading' as const, duration: Infinity, streaming: true };
  const id = upsert(messages.title, { ...streaming, description: '' });
  const run = (async () => {
    let text = '';
    try {
      for await (const chunk of chunks(source)) {
        text += chunk;
        upsert(messages.title, { ...streaming, id, description: text });
      }
      upsert(messages.success ?? messages.title, { ...options, id, type: 'success', description: text, streaming: false });
    } catch (error) {
      upsert(resolve(messages.error ?? 'Something went wrong', error), { ...options, id, type: 'error', streaming: false });
    }
    return text;
  })();
  return Object.assign(run, { id });
}

function undo(title: ReactNode, { onUndo, label = 'Undo', ...options }: UndoOptions) {
  return upsert(title, { duration: 6000, ...options, undo: true, action: { label, onClick: () => onUndo() } });
}

const typed = (type: ToastRecord['type']) => (title: ReactNode, options?: TypedOptions) => upsert(title, { ...options, type });

/**
 * Show a toast. Works anywhere: inside React, in event handlers, in plain modules.
 *
 * @example
 * toast('Saved');
 * toast.success('Deployed', { description: 'haloui.dev is live' });
 * toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Could not save' });
 */
export const toast = Object.assign((title: ReactNode, options?: ToastOptions) => upsert(title, options), {
  success: typed('success'),
  error: typed('error'),
  warning: typed('warning'),
  info: typed('info'),
  loading: (title: ReactNode, options?: TypedOptions) => upsert(title, { duration: Infinity, ...options, type: 'loading' }),
  /** Show loading, then success or error when the promise settles. */
  promise,
  /** Stream text into a toast as it arrives, such as a model's reply, then settle into success. */
  stream,
  /** An undoable action. The countdown sits on the Undo button: the timer is the undo window. */
  undo,
  /** Update a toast in place. It morphs instead of stacking a new one. */
  update: (id: ToastRecord['id'], title: ReactNode, options?: ToastOptions) => upsert(title, { ...options, id }),
  /** Dismiss one toast, or every toast when called without an id. */
  dismiss: toastStore.dismiss,
  /** Whether a toast is on screen and not on its way out. */
  isActive: toastStore.isActive,
});
