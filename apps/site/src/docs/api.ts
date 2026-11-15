/** One source for every prop table in the docs. Keep it in step with the library's types. */
export type PropRow = { name: string; type: string; default?: string; description: string };

export const toastFunctions: PropRow[] = [
  { name: 'toast(title, options?)', type: 'id', description: 'Show a toast. Works anywhere, including outside React.' },
  { name: 'toast.success / error / warning / info', type: 'id', description: 'Typed shortcuts. Errors announce assertively.' },
  { name: 'toast.loading(title, options?)', type: 'id', description: 'Never auto-dismisses. Update it when the work ends.' },
  { name: 'toast.promise(promise, { loading, success, error })', type: 'Promise', description: 'One toast that morphs from loading to the result.' },
  { name: 'toast.stream(source, { title, success?, error? })', type: 'Promise<string> & { id }', description: 'Writes streaming text (AsyncIterable or ReadableStream of strings) live, then settles into success.' },
  { name: 'toast.undo(title, { onUndo, label? })', type: 'id', description: 'An undoable action. The countdown ring sits on the Undo button.' },
  { name: 'toast.update(id, title, options?)', type: 'id', description: 'Change a toast in place. Restarts its clock without replaying the entrance.' },
  { name: 'toast.dismiss(id?)', type: 'void', description: 'Dismiss one toast, or all of them.' },
  { name: 'toast.isActive(id)', type: 'boolean', description: 'Whether a toast is on screen and not on its way out.' },
];

export const toastOptions: PropRow[] = [
  { name: 'id', type: 'string | number', description: 'Reusing an id updates that toast instead of adding one.' },
  { name: 'type', type: "'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'", default: "'default'", description: 'Sets the icon, the colour for intent, and how it is announced.' },
  { name: 'description', type: 'ReactNode', description: 'Secondary line under the title.' },
  { name: 'action', type: '{ label, onClick(event) }', description: 'A button. The toast closes after the click unless onClick calls event.preventDefault().' },
  { name: 'duration', type: 'number', default: 'Toaster duration', description: 'Milliseconds before auto-dismiss. Infinity keeps it open.' },
  { name: 'from', type: 'Element | Ref<Element>', description: 'Launch the toast out of the element that caused it.' },
  { name: 'group', type: 'string', description: 'Repeats with the same group update one toast and bump its count.' },
  { name: 'dismissible', type: 'boolean', default: 'true', description: 'When false: no swipe, close button, or keyboard dismiss.' },
  { name: 'important', type: 'boolean', default: 'errors only', description: 'Announce assertively, interrupting the screen reader.' },
  { name: 'icon', type: 'ReactNode', description: 'Replace the type icon.' },
  { name: 'toasterId', type: 'string', description: 'Send to a specific <Toaster id>.' },
  { name: 'className', type: 'string', description: 'Classes for this toast, e.g. Tailwind utilities.' },
  { name: 'onDismiss / onAutoClose', type: '(toast) => void', description: 'Called when the user dismisses it, or when its timer runs out.' },
];

export const toasterProps: PropRow[] = [
  { name: 'position', type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'", default: "'bottom-right'", description: 'Where the stack sits.' },
  { name: 'world', type: 'HaloWorld | string', default: "'dichroic'", description: 'A built-in world or the name of one you define in CSS.' },
  { name: 'motion', type: "'rise' | 'fade' | 'drop' | 'hinge' | 'focus' | 'bloom'", default: "'rise'", description: 'How toasts enter and leave. Reduced-motion users always get fade.' },
  { name: 'spring', type: 'preset | { duration, bounce } | { stiffness, damping, mass }', default: "'snappy'", description: 'Drives entering, stacking, and springing back.' },
  { name: 'timer', type: "'icon' | 'close' | 'edge' | false", default: "'icon'", description: 'How time left is shown. Every style freezes while paused.' },
  { name: 'intent', type: "'tint' | 'edge' | 'glow' | false", default: 'false', description: 'Show the type in colour, so success and error read apart without icons.' },
  { name: 'icons', type: 'boolean', default: 'true', description: 'Show the type icons.' },
  { name: 'closeButton', type: 'boolean', default: 'true', description: 'Show a close button on each toast.' },
  { name: 'density', type: "'compact' | 'comfortable' | 'spacious'", default: "'comfortable'", description: 'Padding, gaps, and type size, together.' },
  { name: 'radius', type: "'square' | 'soft' | 'round' | 'pill' | number", default: "'round'", description: 'Corner radius. pill gives capsule toasts.' },
  { name: 'coat', type: '[string, string, string]', description: 'Recolour the dichroic edge.' },
  { name: 'theme', type: "'light' | 'dark' | 'system'", default: "'system'", description: 'Colour scheme for the toasts.' },
  { name: 'expand', type: 'boolean', default: 'false', description: 'Keep the stack fanned out.' },
  { name: 'visibleToasts', type: 'number', default: '3', description: 'Toasts past this are hidden and inert until they move up.' },
  { name: 'duration', type: 'number', default: '5000', description: 'Default auto-dismiss, in ms.' },
  { name: 'gap', type: 'number', default: '12', description: 'Space between fanned toasts, in px.' },
  { name: 'offset', type: 'number', default: '24', description: 'Distance from the viewport edge, in px.' },
  { name: 'contained', type: 'boolean', default: 'false', description: 'Position inside the nearest positioned ancestor, for previews and panels.' },
  { name: 'hotkey', type: 'string[]', default: "['altKey', 'KeyT']", description: 'Focuses the stack. Toasters with an id get none unless you pass one.' },
  { name: 'label', type: 'string', default: "'Notifications'", description: 'Landmark name for screen readers.' },
  { name: 'id', type: 'string', description: 'Only show toasts sent with this toasterId.' },
  { name: 'classNames', type: '{ toast, body, icon, title, description, action, close }', description: 'Classes for each part of every toast.' },
];

const pick = (names: string[]) => names.map((n) => toasterProps.find((r) => r.name === n)).filter((r): r is PropRow => Boolean(r));

/** Toaster props in reading-sized groups, each one a plaque. */
export const toasterGroups: ReadonlyArray<{ id: string; title: string; rows: PropRow[] }> = [
  { id: 'placement', title: 'Placement', rows: pick(['position', 'offset', 'contained', 'expand', 'visibleToasts', 'gap']) },
  { id: 'look', title: 'Look', rows: pick(['world', 'theme', 'density', 'radius', 'intent', 'coat', 'icons', 'closeButton', 'classNames']) },
  { id: 'motion', title: 'Motion', rows: pick(['motion', 'spring']) },
  { id: 'timing', title: 'Timing', rows: pick(['duration', 'timer']) },
  { id: 'access', title: 'Accessibility and targeting', rows: pick(['label', 'hotkey', 'id']) },
];

export const drawerRootProps: PropRow[] = [
  { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', description: 'Controlled or uncontrolled.' },
  { name: 'side', type: "'bottom' | 'top' | 'left' | 'right'", default: "'bottom'", description: 'The edge it comes from.' },
  { name: 'snapPoints', type: "Array<number | `${number}px`>", description: 'Detents, smallest first. Numbers are viewport fractions. Omit to fit content.' },
  { name: 'activeSnapPoint / defaultSnapPoint / onActiveSnapPointChange', type: 'SnapPoint', description: 'Controlled or uncontrolled detent.' },
  { name: 'dismissible', type: 'boolean', default: 'true', description: 'When false: no swipe-to-close, Esc, or overlay click.' },
  { name: 'recess', type: 'boolean | { depth?, bounce? }', default: 'false', description: 'Zoom the element marked data-halo-recess out behind the drawer, on its own spring.' },
  { name: 'spring', type: 'SpringInput', default: '{ duration: 0.38, bounce: 0.1 }', description: 'Drives opening, dragging, and settling.' },
  { name: 'world / theme / density', type: 'same as Toaster', description: 'Material, colour scheme, and spacing.' },
  { name: 'radius', type: 'preset | number', default: '28px', description: 'Corner radius of the open edge, capped at 40px.' },
];

export const drawerParts: PropRow[] = [
  { name: 'Drawer.Trigger', type: '<button>', description: 'Opens the drawer. Sets aria-expanded and aria-haspopup.' },
  { name: 'Drawer.Content', type: '<dialog> + panel', description: 'The native dialog: top layer, focus trap, Esc. overlay={false} hides the dim layer.' },
  { name: 'Drawer.Handle', type: '<button>', description: 'Press to cycle detents. The arrow keys step toward open or closed.' },
  { name: 'Drawer.Title', type: '<h2>', description: 'Required. It labels the dialog.' },
  { name: 'Drawer.Description', type: '<p>', description: 'Describes the dialog.' },
  { name: 'Drawer.Close', type: '<button>', description: 'Closes the drawer.' },
  { name: 'Drawer.Scroll', type: '<div>', description: 'A scroll area that hands off to dragging at its start.' },
  { name: 'useDrawer()', type: '{ open, setOpen, activeSnap, setActiveSnap }', description: 'For custom triggers, inside Drawer.Root.' },
];

export const tokens: PropRow[] = [
  { name: '--halo-surface', type: 'colour', description: 'Pane fill. Keep it translucent for glass.' },
  { name: '--halo-surface-solid', type: 'colour', description: 'Fallback for reduced transparency and no backdrop-filter.' },
  { name: '--halo-fg / --halo-fg-muted', type: 'colour', description: 'Text and secondary text.' },
  { name: '--halo-blur / --halo-saturate', type: 'length / number', description: 'The frost.' },
  { name: '--halo-world-edge', type: 'colour | gradient', description: 'The edge ring.' },
  { name: '--halo-coat-a / -b / -c', type: 'colour', description: 'Dichroic coat colours, used by the default edge.' },
  { name: '--halo-shadow', type: 'box-shadow', description: 'Depth.' },
  { name: '--halo-radius', type: 'length', description: 'Corner radius.' },
  { name: '--halo-control / --halo-control-fg', type: 'colour', description: 'Action button fill and text.' },
  { name: '--halo-success / error / warning / info', type: 'colour', description: 'Type colours for icons, timers, and intent.' },
];

export const selectors: PropRow[] = [
  { name: '.halo-toast', type: 'class', description: 'Each toast. Parts: -body, -icon, -title, -description, -action, -close.' },
  { name: '[data-type]', type: 'attribute', description: 'default, success, error, warning, info, loading.' },
  { name: '[data-front]', type: 'attribute', description: 'The toast at the front of the stack.' },
  { name: '[data-intent]', type: 'attribute', description: 'tint, edge, or glow.' },
  { name: '[data-hidden]', type: 'attribute', description: 'Past the visible count. Inert, never blocks the page.' },
  { name: '[data-swiping] / [data-streaming]', type: 'attribute', description: 'Mid-swipe; text still arriving.' },
  { name: '.halo-drawer-panel[data-dragging]', type: 'attribute', description: 'A drawer mid-drag.' },
];
