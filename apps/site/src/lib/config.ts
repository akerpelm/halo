import type { DrawerSide, HaloDensity, HaloWorld } from '@halo-ui/react';

export type RadiusPreset = 'square' | 'soft' | 'round' | 'pill';

export type SpringSetting = { duration: number; bounce: number };

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

export const llmsUrl = () => `${window.location.origin}/llms.txt`;

export const PRINCIPLES = `Rules that keep Halo correct:
- Import '@halo-ui/react/styles.css' once. Don't restyle animation with CSS transitions; motion is driven by springs in JS.
- Customize looks through CSS custom properties (--halo-surface, --halo-fg, --halo-radius, --halo-blur, --halo-coat-a/b/c) or className, never by overriding transform or opacity.
- Keep accessibility intact: don't remove Drawer.Title (it labels the dialog). Use Drawer.Description when there is supporting text. Don't put the only copy of important information in a toast.
- Errors announce assertively by default. Pass { important: true } only for messages that must interrupt.
- Respect user settings: the components already honor prefers-reduced-motion, prefers-reduced-transparency, and prefers-contrast. Don't override them.`;

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
