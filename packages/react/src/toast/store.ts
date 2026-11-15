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

function upsert(title: ReactNode, options: ToastOptions = {}): ToastRecord['id'] {
  const { id: requestedId, type: requestedType, ...rest } = options;
  const existing = requestedId === undefined ? undefined : toasts.find((t) => t.id === requestedId);
  const type = requestedType ?? existing?.type ?? 'default';

  if (existing) {
    emit(
      toasts.map((t) =>
        t.id === existing.id
          ? { ...t, ...rest, type, title, revision: t.revision + 1, dismissed: false }
          : t,
      ),
    );
    return existing.id;
  }

  counter += 1;
  const id = requestedId ?? counter;
  const record: ToastRecord = { ...rest, id, type, title, revision: 0, dismissed: false };
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
  /** Update a toast in place. It morphs instead of stacking a new one. */
  update: (id: ToastRecord['id'], title: ReactNode, options?: ToastOptions) => upsert(title, { ...options, id }),
  dismiss,
});
