import { LLMS_URL } from './site';
import type { DrawerSide, HaloDensity, HaloWorldName } from 'halo-ui-react';
import type { PopoverAlign, PopoverSide } from 'halo-ui-react/popover';

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
  spring: { duration: 0.38, bounce: 0.1 },
};

export const drawerRadius = { square: 6, soft: 14, round: 20, large: 28 } as const;

export const snapPresets = {
  none: undefined,
  two: [0.45, 0.92],
  three: [0.28, 0.6, 0.92],
} as const;

const springLiteral = (s: SpringSetting) => `{ duration: ${s.duration}, bounce: ${s.bounce} }`;
const sameSpring = (a: SpringSetting, b: SpringSetting) => a.duration === b.duration && a.bounce === b.bounce;

export function drawerCode(config: DrawerConfig, world: HaloWorldName) {
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
  return `import { Drawer } from 'halo-ui-react/drawer';
import 'halo-ui-react/styles.css';

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

export const PRINCIPLES = `Rules that keep Halo correct:
- Import 'halo-ui-react/styles.css' once. Don't restyle animation with CSS transitions; motion is driven by springs in JS.
- Customize looks through CSS custom properties (--halo-surface, --halo-fg, --halo-radius, --halo-blur, --halo-coat-a/b/c) or className, never by overriding transform or opacity.
- Keep accessibility intact: don't remove Drawer.Title (it labels the dialog). Use Drawer.Description when there is supporting text. Don't put the only copy of important information in a toast.
- Errors announce assertively by default. Pass { important: true } only for messages that must interrupt.
- Respect user settings: the components already honor prefers-reduced-motion, prefers-reduced-transparency, and prefers-contrast. Don't override them.`;

export function drawerPrompt(config: DrawerConfig, world: HaloWorldName) {
  return `Add a Halo drawer to this React app.

1. Install: npm i halo-ui-react
2. Use this structure:

${drawerCode(config, world)}

3. Snap points are viewport fractions (0–1) or '320px' strings, smallest first. Put long content inside <Drawer.Scroll> so scrolling and dragging cooperate.${config.recess ? "\n   For the recess effect, add data-halo-recess to the app's outermost wrapper element." : ''}
   For a custom trigger, call useDrawer().setOpen(true) from inside <Drawer.Root>.

${PRINCIPLES}

Full reference for agents: ${LLMS_URL}`;
}

export type CornerPreset = 'world' | 'square' | 'soft' | 'round';

const cornerAttr = (radius: CornerPreset) => (radius === 'world' ? [] : [`radius="${radius}"`]);

export type PopoverConfig = {
  side: PopoverSide;
  align: PopoverAlign;
  offset: number;
  density: HaloDensity;
  radius: CornerPreset;
  spring: SpringSetting;
};

export const defaultPopoverConfig: PopoverConfig = {
  side: 'bottom',
  align: 'center',
  offset: 8,
  density: 'comfortable',
  radius: 'world',
  spring: { duration: 0.32, bounce: 0.14 },
};

export function popoverCode(config: PopoverConfig, world: HaloWorldName) {
  const attrs: string[] = [];
  if (config.side !== 'bottom') attrs.push(`side="${config.side}"`);
  if (config.align !== 'center') attrs.push(`align="${config.align}"`);
  if (config.offset !== defaultPopoverConfig.offset) attrs.push(`offset={${config.offset}}`);
  if (world !== 'dichroic') attrs.push(`world="${world}"`);
  if (config.density !== 'comfortable') attrs.push(`density="${config.density}"`);
  attrs.push(...cornerAttr(config.radius));
  if (!sameSpring(config.spring, defaultPopoverConfig.spring)) attrs.push(`spring={${springLiteral(config.spring)}}`);
  const rootProps = attrs.length ? ` ${attrs.join(' ')}` : '';
  return `import { Popover } from 'halo-ui-react/popover';
import 'halo-ui-react/styles.css';

<Popover.Root${rootProps}>
  <Popover.Trigger>Share</Popover.Trigger>
  <Popover.Popup>
    <Popover.Title>Share “Spring launch”</Popover.Title>
    <Popover.Description>Anyone with the link can view.</Popover.Description>
    <Popover.Close>Done</Popover.Close>
  </Popover.Popup>
</Popover.Root>`;
}

export function popoverPrompt(config: PopoverConfig, world: HaloWorldName) {
  return `Add a Halo popover to this React app.

1. Install: npm i halo-ui-react
2. Use this structure:

${popoverCode(config, world)}

3. It is a non-modal dialog on the native popover API: the browser handles Esc, outside clicks and focus return. Name it with <Popover.Title>, or an aria-label on <Popover.Popup> when there is no visible title.
   Focus moves into the popup on open; mark the element that should take it with data-autofocus.
   It needs Chrome or Edge 114, Firefox 125, Safari 17 or later. Offer another path to anything important inside it.

${PRINCIPLES}

Full reference for agents: ${LLMS_URL}`;
}

export type SwipeConfig = {
  actions: 'end' | 'start' | 'both';
  fullSwipe: boolean;
  hint: boolean;
  density: HaloDensity;
  radius: CornerPreset;
  spring: SpringSetting;
};

export const defaultSwipeConfig: SwipeConfig = {
  actions: 'end',
  fullSwipe: true,
  hint: false,
  density: 'comfortable',
  radius: 'world',
  spring: { duration: 0.36, bounce: 0.12 },
};

export function swipeCode(config: SwipeConfig, world: HaloWorldName) {
  const groupAttrs = ['aria-label="Invoices"'];
  if (world !== 'dichroic') groupAttrs.push(`world="${world}"`);
  if (config.density !== 'comfortable') groupAttrs.push(`density="${config.density}"`);
  groupAttrs.push(...cornerAttr(config.radius));
  if (!config.fullSwipe) groupAttrs.push('fullSwipe={false}');
  if (config.hint) groupAttrs.push('hint');
  const rootProps = sameSpring(config.spring, defaultSwipeConfig.spring) ? '' : ` spring={${springLiteral(config.spring)}}`;
  const start =
    config.actions === 'end'
      ? ''
      : `
      <Swipe.Actions side="start">
        <Swipe.Action aria-label={\`Mark invoice \${invoice.id} paid\`} onClick={() => markPaid(invoice)}>
          Paid
        </Swipe.Action>
      </Swipe.Actions>`;
  const end =
    config.actions === 'start'
      ? ''
      : `
      <Swipe.Actions side="end">
        <Swipe.Action aria-label={\`Flag invoice \${invoice.id}\`} onClick={() => flag(invoice)}>
          Flag
        </Swipe.Action>
        <Swipe.Action commit aria-label={\`Archive invoice \${invoice.id}\`} announce={\`Invoice \${invoice.id} archived\`} onClick={() => archive(invoice)}>
          Archive
        </Swipe.Action>
      </Swipe.Actions>`;
  return `import { Swipe } from 'halo-ui-react/swipe';
import 'halo-ui-react/styles.css';

<Swipe.Group ${groupAttrs.join(' ')}>
  {invoices.map((invoice) => (
    <Swipe.Root key={invoice.id}${rootProps}>
      <Swipe.Content>{invoice.client}</Swipe.Content>${start}${end}
    </Swipe.Root>
  ))}
</Swipe.Group>`;
}

export function swipePrompt(config: SwipeConfig, world: HaloWorldName) {
  return `Add Halo swipe actions to a list in this React app.

1. Install: npm i halo-ui-react
2. Use this structure:

${swipeCode(config, world)}

3. Every action is a real button, so name the item in its aria-label ("Archive invoice 42"). Keyboard users reach the actions with Tab, which slides the row open.
   ${config.fullSwipe ? 'A full swipe runs the action marked commit by clicking that same button, so put the whole action in its onClick.' : 'Full swipes are off, so a swipe stops with the actions showing and the commit action needs a tap.'}
   Pair a destructive commit with an undo toast (toast.undo) rather than a confirm dialog. Use announce to tell screen readers what happened.

${PRINCIPLES}

Full reference for agents: ${LLMS_URL}`;
}

export const densityOptions: ReadonlyArray<{ value: HaloDensity; label: string }> = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Regular' },
  { value: 'spacious', label: 'Spacious' },
];

export const cornerOptions: ReadonlyArray<{ value: CornerPreset; label: string }> = [
  { value: 'world', label: 'World' },
  { value: 'square', label: 'Square' },
  { value: 'soft', label: 'Soft' },
  { value: 'round', label: 'Round' },
];

export const cornerRadius = (radius: CornerPreset) => (radius === 'world' ? undefined : radius);
