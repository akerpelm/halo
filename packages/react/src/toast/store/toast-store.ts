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
  /** Announce assertively, interrupting the screen reader. Defaults to true for errors only. */
  important?: boolean;
  /** Target a specific `<Toaster id>`. */
  toasterId?: string;
  className?: string;
  /** Launch the toast out of the element that caused it. Pass an element or a ref. */
  from?: Element | { current: Element | null } | null;
  /** Repeats with the same group update one toast and bump its count instead of stacking. */
  group?: string;
  onDismiss?: (toast: ToastRecord) => void;
  onAutoClose?: (toast: ToastRecord) => void;
};

export type ToastRecord = Omit<ToastOptions, 'id' | 'type'> & {
  id: string | number;
  type: ToastType;
  title: ReactNode;
  /** Bumps on every update, so the toast restarts its timer and announces again. */
  revision: number;
  dismissed: boolean;
  /** How many times this toast's group has fired while it was showing. */
  count: number;
  /** Text is still streaming in; intermediate updates are not announced. */
  streaming?: boolean;
  /** The action is an undo, so its button carries the countdown. */
  undo?: boolean;
};

export type UpsertOptions = ToastOptions & Partial<Pick<ToastRecord, 'streaming' | 'undo'>>;

type Listener = () => void;

let counter = 0;
let toasts: readonly ToastRecord[] = [];
const listeners = new Set<Listener>();

function emit(next: readonly ToastRecord[]) {
  toasts = next;
  for (const listener of listeners) listener();
}

function findExisting(options: UpsertOptions) {
  if (options.id !== undefined) return { existing: toasts.find((t) => t.id === options.id), grouped: false };
  if (options.group === undefined) return { existing: undefined, grouped: false };
  const existing = toasts.find((t) => t.group === options.group && t.toasterId === options.toasterId && !t.dismissed);
  return { existing, grouped: existing !== undefined };
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

  upsert(title: ReactNode, options: UpsertOptions = {}): ToastRecord['id'] {
    const { id: requestedId, type: requestedType, ...rest } = options;
    const { existing, grouped } = findExisting(options);
    const type = requestedType ?? existing?.type ?? 'default';

    if (existing) {
      const count = grouped ? existing.count + 1 : existing.count;
      emit(toasts.map((t) => (t.id === existing.id ? { ...t, ...rest, type, title, revision: t.revision + 1, dismissed: false, count } : t)));
      return existing.id;
    }

    counter += 1;
    const id = requestedId ?? counter;
    emit([{ ...rest, id, type, title, revision: 0, dismissed: false, count: 1 }, ...toasts]);
    return id;
  },

  dismiss(id?: ToastRecord['id']) {
    emit(toasts.map((t) => (id === undefined || t.id === id ? { ...t, dismissed: true } : t)));
  },

  remove(id: ToastRecord['id']) {
    emit(toasts.filter((t) => t.id !== id));
  },

  isActive: (id: ToastRecord['id']) => toasts.some((t) => t.id === id && !t.dismissed),
};
