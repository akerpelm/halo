export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/** Extra classes for each part of every toast, e.g. Tailwind utilities. */
export type ToastClassNames = Partial<Record<'toast' | 'body' | 'icon' | 'title' | 'description' | 'action' | 'close', string>>;

/**
 * How time left is shown. `icon`: the status icon's outline empties like a timer. `close`: a ring
 * around the close button. `edge`: the pane's edge drains. `false`: hidden.
 */
export type ToastTimer = 'close' | 'icon' | 'edge' | false;

/** How a toast shows its type in colour: wash the glass, colour the edge ring, or cast coloured light. */
export type ToastIntent = 'tint' | 'edge' | 'glow' | false;

/**
 * How a toast enters and leaves. `rise` lifts in from the edge, `fade` is opacity only, `drop`
 * falls in and lands, `hinge` swings down like a hung sign, `focus` pulls in from a blur, and
 * `bloom` grows out of a capsule.
 */
export type ToastMotion = 'rise' | 'fade' | 'drop' | 'hinge' | 'focus' | 'bloom';
