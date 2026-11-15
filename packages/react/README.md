# @halo-ui/react

A spring-physics **Toast** and **Drawer** for React. Frosted glass, accessible by default, no dependencies besides React.

```sh
npm i @halo-ui/react
```

```tsx
import { Toaster, toast } from '@halo-ui/react/toast';
import { Drawer } from '@halo-ui/react/drawer';
import '@halo-ui/react/styles.css';

<Toaster />;
toast.success('Invite sent', { description: 'They will get an email shortly' });

<Drawer.Root snapPoints={[0.45, 0.92]}>
  <Drawer.Trigger>Share</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Handle />
    <Drawer.Title>Share project</Drawer.Title>
    <Drawer.Scroll>…</Drawer.Scroll>
  </Drawer.Content>
</Drawer.Root>;
```

## What's different

- **Motion picks up where your finger leaves off.** Release velocity is fitted over the last 80 ms of pointer samples and handed to a closed-form spring, so motion is interruptible and never restarts from zero.
- **Snapping by intent.** Drawer detents and toast dismissal are chosen from where a flick would coast to, not from fixed thresholds.
- **Transform and opacity only.** Nothing animates layout.
- **Native `<dialog>`.** Top layer, focus trap, and Esc come from the platform. No portal and no Radix.
- **Accessible by default.** Separate polite and assertive live regions with announced types, a hotkey to reach the stack, keyboard dismissal, a handle that is a real button, and support for reduced motion, reduced transparency, and higher contrast.
- **Six materials, out of the box.** `world` is `dichroic`, `partition`, `smoked`, `vapor`, `crystal`, or `ink`. Each is a complete token set, in light and dark.
- **Six entrances and exits, all on springs:** `motion="rise | fade | drop | hinge | focus | bloom"`.
- **Colour presets:** `coat={[a, b, c]}` recolours the dichroic edge; `intent="tint | edge | glow"` shows each toast's type in colour, even with icons off.
- **Density and radius as props.** `density="compact | comfortable | spacious"`, `radius="square | soft | round | pill"` or px.
- **Time left drawn on the edge.** A brighter arc unwinds around the pane and freezes while you read. No progress bar.
- **A page that moves with the drawer.** `recess` pushes your app back on its own bouncier spring.

| Entry | Min + gzip |
| --- | --- |
| `@halo-ui/react/toast` | 5.7 kB (includes springs) |
| `@halo-ui/react/drawer` | 4.8 kB (includes springs) |
| `@halo-ui/react/spring` | 1.6 kB |
| `styles.css` | 2.9 kB |

## Make it yours

A world is one CSS selector. Write your own and pass its name to `world`:

```css
[data-halo-world='midnight'] {
  color-scheme: dark;
  --halo-surface: oklch(24% 0.06 278 / 0.74);
  --halo-fg: oklch(96% 0.02 280);
  --halo-blur: 24px;
  --halo-world-edge: linear-gradient(to bottom, oklch(82% 0.12 290 / 0.65), transparent);
}
```

Halo's token selectors use `:where()`, so they have zero specificity and any selector you write wins.

Extend a built-in world with the same selector (`[data-halo-world='dichroic'] { --halo-radius: 12px }`). With Tailwind, import the stylesheet into a layer (`@import '@halo-ui/react/styles.css' layer(components);`) and use `classNames` for each part, or arbitrary properties like `className="[--halo-blur:8px]"`.

The full API, written for both people and AI agents, lives in [`apps/site/public/llms.txt`](../../apps/site/public/llms.txt).
