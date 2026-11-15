# Halo (halo-ui-react)

> A spring-physics Toast and Drawer for React {{react}}+, on one closed-form spring engine. No dependencies besides React. Toasts announce through polite and assertive live regions and dismiss from the keyboard; the drawer is a native <dialog>. Nine visual worlds: "dichroic" (default), "partition", "smoked", "vapor", "crystal", "ink", "opal", "mercury", "vellum", plus any you define in CSS.

Install: `npm i halo-ui-react`
Styles: import `halo-ui-react/styles.css` once (e.g. in your root layout or main entry).
Human docs: https://haloui.dev/docs/getting-started. Every docs page is also served as Markdown at its URL plus .md (for example https://haloui.dev/docs/toast.md); the full list is at the end of this file. Agent recipes: https://haloui.dev/docs/agents.
Source: https://github.com/akerpelm/halo (MIT).
Sizes, min+gzip: toast {{toast}} kB, drawer {{drawer}} kB (each including the springs), spring engine {{spring}} kB, styles.css {{styles}} kB. {{method}}
Entry points: `halo-ui-react/toast`, `halo-ui-react/drawer`, `halo-ui-react/spring`, or everything from `halo-ui-react`.
All components are client components (the bundle starts with 'use client').

## Toast

Render `<Toaster />` once near the app root. Call `toast()` from anywhere, including outside React.

```tsx
import { Toaster, toast } from 'halo-ui-react/toast';
import 'halo-ui-react/styles.css';

<Toaster />

toast('Draft saved');
toast.success('Invite sent', { description: 'They will get an email shortly' });
toast.error('Upload failed', { action: { label: 'Retry', onClick: retry } });
toast.warning('Storage almost full');
toast.info('New version available');
const id = toast.loading('Exporting…');          // never auto-dismisses
toast.update(id, 'Export ready', { type: 'success' }); // morphs in place
toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Could not save' });
toast.dismiss(id);   // or toast.dismiss() for all
toast.undo('Archived', { onUndo: restore });   // the countdown ring sits on the Undo button
await toast.stream(aiReply, { title: 'Summarising…', success: 'Summary ready' }); // AsyncIterable<string> or ReadableStream<string>
toast('Saved', { from: buttonRef });            // flies out of the trigger and lands in the stack
toast.success('File uploaded', { group: 'uploads' }); // repeats collapse into one toast with a springing count
toast.isActive(id);
```

toast(title, options) returns the toast id. `title` and `description` accept any ReactNode.

Toast options:
- id: string | number. Reusing an id updates that toast instead of adding one.
- type: 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'
- description: ReactNode
- icon: ReactNode (overrides the type icon)
- action: { label: ReactNode; onClick(event) }. The toast closes after the click unless you call event.preventDefault().
- duration: ms. Infinity keeps it open. Defaults to the Toaster's duration.
- dismissible: boolean (default true). When false: no swipe, no close button, no keyboard dismiss.
- important: boolean. Announce assertively. Defaults to true for errors only.
- toasterId: string. Target a specific <Toaster id="...">.
- className: string
- from: Element | Ref<Element>. Launch the toast out of the element that caused it.
- group: string. Repeats with the same group update one toast and bump its count.
- onDismiss(toast): user dismissed it (swipe, close button, keyboard, action).
- onAutoClose(toast): its timer ran out.

<Toaster> props (all optional):
- position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' (default 'bottom-right')
- expand: boolean (default false). Keep the stack fanned out.
- visibleToasts: number (default 3)
- gap: number in px (default 12)
- duration: ms (default 5000)
- spring: 'snappy' | 'smooth' | 'bouncy' | 'gentle' | 'stiff' | 'pop' | 'jelly' | 'lazy' | { duration, bounce } | { stiffness, damping, mass } (default 'snappy')
- motion: 'rise' | 'fade' | 'drop' | 'hinge' | 'focus' | 'bloom' (default 'rise'). How toasts enter and leave. rise lifts in from the edge, fade is opacity only, drop falls in from above, hinge swings down from its top edge, focus pulls in from a blur, bloom grows out of a capsule. Reduced-motion users always get fade.
- icons: boolean (default true). Show the type icons.
- intent: 'tint' | 'edge' | 'glow' | false (default false). Show each toast's type in colour, so success and error read apart even with icons off. tint washes the glass, edge colours the edge ring, glow casts light in the type colour.
- coat: [string, string, string]. Override the three dichroic coat colours.
- world: 'dichroic' | 'partition' | 'smoked' | 'vapor' | 'crystal' | 'ink' | 'opal' | 'mercury' | 'vellum', or any custom world name (default 'dichroic'). opal: the whole surface turns iridescent as it moves. mercury: a chrome edge whose highlight slides with motion. vellum: matte drafting film with a printed rule. dichroic: clear with a coated, hue-shifting edge. partition: etched, neutral. smoked: bronze-tinted, always dark. vapor: most diffuse. crystal: clear and bevelled, little blur. ink: solid, no blur (cheapest to render).
- theme: 'light' | 'dark' | 'system' (default 'system')
- density: 'compact' | 'comfortable' | 'spacious' (default 'comfortable'). Padding, gaps, and type size move together.
- radius: 'square' | 'soft' | 'round' | 'pill' | number in px (default 'round', 18px). 'pill' gives capsule toasts.
- hotkey: string[] (default ['altKey', 'KeyT']). Focuses the stack.
- label: string (default 'Notifications'). Landmark name.
- closeButton: boolean (default true)
- timer: 'icon' | 'close' | 'edge' | false (default 'icon'). How time left is shown: the status icon's outline empties like a timer (toasts with no icon use 'close'), a ring around the close button, or the pane edge draining. All freeze while paused.
- offset: number in px from the viewport edge (default 24)
- contained: boolean. Position inside the nearest positioned ancestor instead of the viewport.
- id, className, style

Behavior worth knowing:
- Toasts past visibleToasts are hidden and inert: they never block clicks on the page behind them or take keyboard focus.
- Timers pause while the stack is hovered, focused, or touched, and while the tab is hidden. Toasts tucked behind the deck do not count down until they are visible.
- Swipe toward the nearest screen edge to dismiss. Dismissal is decided by where the flick would land, so a short fast flick works.
- Keyboard: the hotkey focuses the newest toast. Tab moves through toasts and their buttons. Esc dismisses the focused toast, and so do Delete and Backspace when the toast itself has focus.
- Screen readers: messages are announced through separate polite and assertive live regions, prefixed with the type ("Error:", "Success:").

## Drawer

Compound components on the native <dialog> element (top layer, focus trap, Esc). No portal is needed.

```tsx
import { Drawer } from 'halo-ui-react/drawer';
import 'halo-ui-react/styles.css';

<Drawer.Root snapPoints={[0.45, 0.92]} recess>
  <Drawer.Trigger>Share</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Handle />
    <Drawer.Title>Share project</Drawer.Title>
    <Drawer.Description>Anyone with the link can view.</Drawer.Description>
    <Drawer.Scroll>{/* long content */}</Drawer.Scroll>
    <Drawer.Close>Done</Drawer.Close>
  </Drawer.Content>
</Drawer.Root>
```

Drawer.Root props:
- open, defaultOpen, onOpenChange(open): controlled or uncontrolled.
- side: 'bottom' | 'top' | 'left' | 'right' (default 'bottom')
- snapPoints: Array<number | `${number}px`>. Numbers are viewport fractions (0–1]. Omit to size to content.
- activeSnapPoint, defaultSnapPoint, onActiveSnapPointChange(snap): controlled or uncontrolled detent.
- dismissible: boolean (default true). When false: no swipe-to-close, no Esc, no overlay click.
- spring: same values as Toaster (default { duration: 0.5, bounce: 0.12 })
- world, theme, density: same as Toaster.
- radius: same presets or px, for the open edge. Capped at 40px (default 28px).
- recess: boolean | { depth?: number; bounce?: number } (defaults 0.06 and 0.32). Pushes back the element marked with the `data-halo-recess` attribute (put it on your app's outermost wrapper). The page rides its own spring, so it settles with a little bounce.

Parts:
- Drawer.Trigger: a <button>. Sets aria-expanded and aria-haspopup.
- Drawer.Content: the dialog and its panel. Accepts div props, plus overlay={false} to hide the dim layer.
- Drawer.Handle: a real <button>. Press it to cycle detents; the arrow keys step toward open or closed.
- Drawer.Title: required for accessibility. It labels the dialog.
- Drawer.Description: describes the dialog.
- Drawer.Close: a <button> that closes.
- Drawer.Scroll: a scroll area that cooperates with dragging. Use it for any long content.
- useDrawer(): { open, setOpen, activeSnap, setActiveSnap } for custom triggers, inside Drawer.Root.

Focus moves into the panel on open (or to an element with autofocus or data-autofocus) and returns to the trigger on close. Page scroll is locked while open.

## Styling and custom worlds

A world is one CSS selector of custom properties. Define your own and pass its name:

```css
[data-halo-world='midnight'] {
  color-scheme: dark;
  --halo-surface: oklch(24% 0.06 278 / 0.74);
  --halo-surface-solid: oklch(21% 0.06 278);
  --halo-fg: oklch(96% 0.02 280);
  --halo-fg-muted: oklch(80% 0.05 280);
  --halo-blur: 24px;
  --halo-world-edge: linear-gradient(to bottom, oklch(82% 0.12 290 / 0.65), oklch(62% 0.16 305 / 0.18));
  --halo-shadow: 0 22px 44px -22px oklch(22% 0.12 285 / 0.75);
}
```
Halo's token selectors use :where(), so they have zero specificity: any selector you write wins. If you import Halo's stylesheet into a cascade layer, put your world in the same layer after it, or leave it unlayered.
`<Toaster world="midnight" />` and `<Drawer.Root world="midnight">` accept any world name.
Extend a built-in world with the same selector, e.g. `[data-halo-world='dichroic'] { --halo-radius: 12px; }`, or one instance with `style` or a Tailwind arbitrary property: `className="[--halo-blur:8px]"`.
Toaster `classNames={{ toast, body, icon, title, description, action, close }}` adds classes to every toast part. Per toast: `toast('x', { className })`.
State hooks for CSS: `[data-type]`, `[data-front]`, `[data-tint]`, `[data-swiping]`, `[data-dismissed]`; drawer: `.halo-drawer-panel[data-dragging]`.


Everything is CSS custom properties on `.halo` and `.halo-surface`:
--halo-surface, --halo-surface-solid, --halo-fg, --halo-fg-muted, --halo-radius, --halo-blur, --halo-saturate, --halo-coat-a, --halo-coat-b, --halo-coat-c, --halo-edge, --halo-shadow, --halo-focus, --halo-success, --halo-error, --halo-warning, --halo-info, --halo-toast-width, --halo-drawer-width.
Add `className` for layout tweaks. With Tailwind, import the stylesheet into a layer so utilities win: `@import 'halo-ui-react/styles.css' layer(components);`

Do not:
- Override `transform`, `opacity`, or `transition` on toasts or drawer panels. Motion is driven by springs in JavaScript.
- Remove Drawer.Title.
- Put information that exists nowhere else in a toast. Toasts disappear.
- Disable prefers-reduced-motion, prefers-reduced-transparency, or prefers-contrast handling. It is built in.

## Spring engine (halo-ui-react/spring)

- resolveSpring(input) → { stiffness, damping, mass }
- fromDuration(duration, bounce) → config
- solveSpring(config, from, to, velocity, t) → { position, velocity }: closed-form solution.
- createSpringValue(initial, config, onChange) → { to(target, { velocity }), set, offset, stop, get, getVelocity }: one shared rAF loop.
- createVelocityTracker(), rubberband(overshoot, dimension), project(velocity), useReducedMotion()
