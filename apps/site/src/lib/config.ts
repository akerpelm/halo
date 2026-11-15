import type { DrawerSide, HaloDensity, HaloWorld, ToastPosition, ToastTimer } from '@halo-ui/react';

export type RadiusPreset = 'square' | 'soft' | 'round' | 'pill';

export type SpringSetting = { duration: number; bounce: number };

export type ToastConfig = {
  position: ToastPosition;
  expand: boolean;
  visibleToasts: number;
  gap: number;
  duration: number;
  timer: ToastTimer;
  closeButton: boolean;
  density: HaloDensity;
  radius: RadiusPreset;
  spring: SpringSetting;
};

export const defaultToastConfig: ToastConfig = {
  position: 'bottom-right',
  expand: false,
  visibleToasts: 3,
  gap: 12,
  duration: 5000,
  timer: 'icon',
  closeButton: true,
  density: 'comfortable',
  radius: 'round',
  spring: { duration: 0.32, bounce: 0.08 },
};

export type DrawerConfig = {
  side: DrawerSide;
  snapPoints: 'none' | 'two' | 'three';
  dismissible: boolean;
  recess: boolean;
  density: HaloDensity;
  radius: Exclude<RadiusPreset, 'pill'> | 'large';
  spring: SpringSetting;
};

export const defaultDrawerConfig: DrawerConfig = {
  side: 'bottom',
  snapPoints: 'two',
  dismissible: true,
  recess: true,
  density: 'comfortable',
  radius: 'large',
  spring: { duration: 0.5, bounce: 0.12 },
};

/** Drawer radius presets in px; 'large' is the library default (28px). */
export const drawerRadius = { square: 6, soft: 14, round: 20, large: 28 } as const;

export const snapPresets = {
  none: undefined,
  two: [0.45, 0.92],
  three: [0.28, 0.6, 0.92],
} as const;

const springLiteral = (s: SpringSetting) => `{ duration: ${s.duration}, bounce: ${s.bounce} }`;
const sameSpring = (a: SpringSetting, b: SpringSetting) => a.duration === b.duration && a.bounce === b.bounce;

/** Only props that differ from the library defaults, so pasted code stays minimal. */
export function toasterCode(config: ToastConfig, world: HaloWorld) {
  const d = defaultToastConfig;
  const attrs: string[] = [];
  if (config.position !== d.position) attrs.push(`position="${config.position}"`);
  if (world !== 'dichroic') attrs.push(`world="${world}"`);
  if (config.density !== 'comfortable') attrs.push(`density="${config.density}"`);
  if (config.radius !== 'round') attrs.push(`radius="${config.radius}"`);
  if (config.expand) attrs.push('expand');
  if (config.visibleToasts !== d.visibleToasts) attrs.push(`visibleToasts={${config.visibleToasts}}`);
  if (config.gap !== d.gap) attrs.push(`gap={${config.gap}}`);
  if (config.duration !== d.duration) attrs.push(`duration={${config.duration}}`);
  if (config.timer !== 'icon') attrs.push(config.timer ? `timer="${config.timer}"` : 'timer={false}');
  if (!config.closeButton) attrs.push('closeButton={false}');
  if (!sameSpring(config.spring, d.spring)) attrs.push(`spring={${springLiteral(config.spring)}}`);
  const jsx = attrs.length ? `<Toaster\n  ${attrs.join('\n  ')}\n/>` : '<Toaster />';
  return `import { Toaster, toast } from '@halo-ui/react/toast';
import '@halo-ui/react/styles.css';

// Once, at the root of your app:
${jsx}

// Anywhere:
toast.success('Changes saved');`;
}

export function drawerCode(config: DrawerConfig, world: HaloWorld) {
  const snaps = snapPresets[config.snapPoints];
  const attrs: string[] = [];
  if (config.side !== 'bottom') attrs.push(`side="${config.side}"`);
  if (world !== 'dichroic') attrs.push(`world="${world}"`);
  if (snaps) attrs.push(`snapPoints={[${snaps.join(', ')}]}`);
  if (config.density !== 'comfortable') attrs.push(`density="${config.density}"`);
  if (config.radius !== 'large') attrs.push(`radius={${drawerRadius[config.radius]}}`);
  if (!config.dismissible) attrs.push('dismissible={false}');
  if (config.recess) attrs.push('recess');
  if (!sameSpring(config.spring, defaultDrawerConfig.spring)) attrs.push(`spring={${springLiteral(config.spring)}}`);
  const rootProps = attrs.length ? ` ${attrs.join(' ')}` : '';
  const scroll = snaps ? '\n    <Drawer.Scroll>{/* long content */}</Drawer.Scroll>' : '';
  return `import { Drawer } from '@halo-ui/react/drawer';
import '@halo-ui/react/styles.css';

<Drawer.Root${rootProps}>
  <Drawer.Trigger>Share</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Handle />
    <Drawer.Title>Share project</Drawer.Title>
    <Drawer.Description>Anyone with the link can view.</Drawer.Description>${scroll}
    <Drawer.Close>Done</Drawer.Close>
  </Drawer.Content>
</Drawer.Root>`;
}

const llmsUrl = () => `${window.location.origin}/llms.txt`;

const PRINCIPLES = `Rules that keep Halo correct:
- Import '@halo-ui/react/styles.css' once. Don't restyle animation with CSS transitions; motion is driven by springs in JS.
- Customize looks through CSS custom properties (--halo-surface, --halo-fg, --halo-radius, --halo-blur, --halo-coat-a/b/c) or className, never by overriding transform or opacity.
- Keep accessibility intact: don't remove Drawer.Title (it labels the dialog). Use Drawer.Description when there is supporting text. Don't put the only copy of important information in a toast.
- Errors announce assertively by default. Pass { important: true } only for messages that must interrupt.
- Respect user settings: the components already honor prefers-reduced-motion, prefers-reduced-transparency, and prefers-contrast. Don't override them.`;

export function toastPrompt(config: ToastConfig, world: HaloWorld) {
  return `Add Halo toasts to this React app.

1. Install: npm i @halo-ui/react
2. Render this once near the root (inside providers, outside routes):

${toasterCode(config, world)}

3. Replace existing notification calls with toast(), toast.success(), toast.error(), toast.warning(), toast.info(), or toast.promise(promise, { loading, success, error }).
   Use toast.update(id, title) to change a toast in place instead of stacking a new one.
   Give actions as { action: { label, onClick } }; call event.preventDefault() in onClick to keep the toast open.

${PRINCIPLES}

Full reference for agents: ${llmsUrl()}`;
}

export function drawerPrompt(config: DrawerConfig, world: HaloWorld) {
  return `Add a Halo drawer to this React app.

1. Install: npm i @halo-ui/react
2. Use this structure:

${drawerCode(config, world)}

3. Snap points are viewport fractions (0–1) or '320px' strings, smallest first. Put long content inside <Drawer.Scroll> so scrolling and dragging cooperate.${config.recess ? "\n   For the recess effect, add data-halo-recess to the app's outermost wrapper element." : ''}
   For a custom trigger, call useDrawer().setOpen(true) from inside <Drawer.Root>.

${PRINCIPLES}

Full reference for agents: ${llmsUrl()}`;
}
