import type { MouseEvent, ReactNode } from 'react';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToastAction = {
  label: ReactNode;
  /** Call `event.preventDefault()` to keep the toast open after the action. */
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export type ToastOptions = {
  id?: string | number;
  type?: ToastType;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ToastAction;
  /** Milliseconds before auto-dismiss. `Infinity` keeps it until dismissed. */
  duration?: number;
  dismissible?: boolean;
  /**
   * Announce assertively, interrupting the screen reader.
   * Defaults to true for errors, false for everything else.
   */
  important?: boolean;
  /** Target a specific `<Toaster id>`. */
  toasterId?: string;
  className?: string;
  /**
   * Launch the toast from the element that caused it: it flies out of this element and lands in
   * the stack on a spring. Pass an element or a ref.
   */
  from?: Element | { current: Element | null } | null;
  /**
   * Collapse repeats: a toast sent with the same group while one is showing updates that toast
   * and bumps a springing counter instead of stacking a new one.
   */
  group?: string;
  onDismiss?: (toast: ToastRecord) => void;
  onAutoClose?: (toast: ToastRecord) => void;
};

export type ToastRecord = Omit<ToastOptions, 'id' | 'type'> & {
  id: string | number;
  type: ToastType;
  title: ReactNode;
  /** Bumps on every update so the toast can restart its timer and announce again. */
  revision: number;
  dismissed: boolean;
  /** How many times this toast's group has fired while it was showing. */
  count: number;
  /** Text is still streaming in; intermediate updates are not announced. */
  streaming?: boolean;
  /** The action is an undo: its button carries the countdown ring. */
  undo?: boolean;
};

type Listener = () => void;

let counter = 0;
let toasts: readonly ToastRecord[] = [];
const listeners = new Set<Listener>();

function emit(next: readonly ToastRecord[]) {
  toasts = next;
  for (const listener of listeners) listener();
}

export const toastStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => toasts,
  getServerSnapshot: () => toasts,
  /** Called by the toaster once the exit animation has finished. */
  remove(id: ToastRecord['id']) {
    emit(toasts.filter((t) => t.id !== id));
  },
};

type InternalOptions = ToastOptions & Partial<Pick<ToastRecord, 'streaming' | 'undo'>>;

function upsert(title: ReactNode, options: InternalOptions = {}): ToastRecord['id'] {
  const { id: requestedId, type: requestedType, ...rest } = options;
  const grouped =
    requestedId === undefined && options.group !== undefined
      ? toasts.find((t) => t.group === options.group && t.toasterId === options.toasterId && !t.dismissed)
      : undefined;
  const existing = grouped ?? (requestedId === undefined ? undefined : toasts.find((t) => t.id === requestedId));
  const type = requestedType ?? existing?.type ?? 'default';

  if (existing) {
    emit(
      toasts.map((t) =>
        t.id === existing.id
          ? { ...t, ...rest, type, title, revision: t.revision + 1, dismissed: false, count: grouped ? t.count + 1 : t.count }
          : t,
      ),
    );
    return existing.id;
  }

  counter += 1;
  const id = requestedId ?? counter;
  const record: ToastRecord = { ...rest, id, type, title, revision: 0, dismissed: false, count: 1 };
  emit([record, ...toasts]);
  return id;
}

function dismiss(id?: ToastRecord['id']) {
  emit(toasts.map((t) => (id === undefined || t.id === id ? { ...t, dismissed: true } : t)));
}

type TypedOptions = Omit<ToastOptions, 'type'>;

type PromiseMessages<T> = {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
  description?: ReactNode;
};

function promise<T>(input: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>, options: TypedOptions = {}) {
  const id = upsert(messages.loading, { ...options, type: 'loading', duration: Infinity, description: messages.description });
  const run = typeof input === 'function' ? input() : input;
  run.then(
    (value) => {
      const title = typeof messages.success === 'function' ? messages.success(value) : messages.success;
      upsert(title, { ...options, id, type: 'success', description: undefined });
    },
    (error: unknown) => {
      const title = typeof messages.error === 'function' ? messages.error(error) : messages.error;
      upsert(title, { ...options, id, type: 'error', description: undefined });
    },
  );
  return run;
}

type StreamMessages = {
  /** Title while text streams in. */
  title: ReactNode;
  /** Title once the stream ends. Defaults to `title`. */
  success?: ReactNode;
  error?: ReactNode | ((error: unknown) => ReactNode);
};

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

/** Stream text into a toast as it arrives (an AI reply, a log), then settle into success. */
function stream(source: AsyncIterable<string> | ReadableStream<string>, messages: StreamMessages, options: TypedOptions = {}) {
  const id = upsert(messages.title, { ...options, type: 'loading', duration: Infinity, description: '', streaming: true });
  const run = (async () => {
    let text = '';
    try {
      for await (const chunk of chunks(source)) {
        text += chunk;
        upsert(messages.title, { ...options, id, type: 'loading', duration: Infinity, description: text, streaming: true });
      }
      upsert(messages.success ?? messages.title, { ...options, id, type: 'success', description: text, streaming: false });
    } catch (error) {
      const title = typeof messages.error === 'function' ? messages.error(error) : (messages.error ?? 'Something went wrong');
      upsert(title, { ...options, id, type: 'error', streaming: false });
    }
    return text;
  })();
  return Object.assign(run, { id });
}

type UndoOptions = Omit<TypedOptions, 'action'> & {
  onUndo: () => void;
  /** Button text. Defaults to "Undo". */
  label?: ReactNode;
};

/** An undoable action. The countdown ring sits on the Undo button: the timer is the undo window. */
function undo(title: ReactNode, { onUndo, label = 'Undo', ...options }: UndoOptions) {
  return upsert(title, { duration: 6000, ...options, undo: true, action: { label, onClick: () => onUndo() } });
}

/**
 * Show a toast. Works anywhere: inside React, in event handlers, in plain modules.
 *
 * @example
 * toast('Saved');
 * toast.success('Deployed', { description: 'halo.dev is live' });
 * toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Could not save' });
 */
export const toast = Object.assign((title: ReactNode, options?: ToastOptions) => upsert(title, options), {
  success: (title: ReactNode, options?: TypedOptions) => upsert(title, { ...options, type: 'success' }),
  error: (title: ReactNode, options?: TypedOptions) => upsert(title, { ...options, type: 'error' }),
  warning: (title: ReactNode, options?: TypedOptions) => upsert(title, { ...options, type: 'warning' }),
  info: (title: ReactNode, options?: TypedOptions) => upsert(title, { ...options, type: 'info' }),
  loading: (title: ReactNode, options?: TypedOptions) =>
    upsert(title, { duration: Infinity, ...options, type: 'loading' }),
  promise,
  stream,
  undo,
  /** Update a toast in place. It morphs instead of stacking a new one. */
  update: (id: ToastRecord['id'], title: ReactNode, options?: ToastOptions) => upsert(title, { ...options, id }),
  dismiss,
  /** Whether a toast is on screen and not on its way out. */
  isActive: (id: ToastRecord['id']) => toasts.some((t) => t.id === id && !t.dismissed),
});
