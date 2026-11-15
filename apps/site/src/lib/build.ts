import type { HaloDensity, HaloWorldName, SpringPresetName, ToastMotion, ToastPosition, ToastTimer } from '@halo-ui/react';
import type { RadiusPreset } from './config';

export type SpringChoice = SpringPresetName | { duration: number; bounce: number };
export type CoatName = 'material' | 'aurora' | 'ember' | 'lagoon' | 'orchid' | 'mono';

/** Everything the playground can layer onto a toast. */
export type BuildConfig = {
  world: HaloWorldName;
  motion: ToastMotion;
  spring: SpringChoice;
  coat: CoatName;
  tint: boolean;
  icons: boolean;
  timer: ToastTimer;
  closeButton: boolean;
  radius: RadiusPreset;
  density: HaloDensity;
  position: ToastPosition;
  expand: boolean;
  duration: number;
};

/** The starting point: the most ordinary toast there is. Everything else is a layer on top. */
export const PLAIN: BuildConfig = {
  world: 'ink',
  motion: 'fade',
  spring: 'smooth',
  coat: 'material',
  tint: false,
  icons: false,
  timer: false,
  closeButton: false,
  radius: 'soft',
  density: 'comfortable',
  position: 'bottom-right',
  expand: false,
  duration: 4000,
};

/** One click to everything on. */
export const MAXED: BuildConfig = {
  ...PLAIN,
  world: 'dichroic',
  motion: 'bloom',
  spring: 'pop',
  coat: 'aurora',
  tint: true,
  icons: true,
  timer: 'icon',
  closeButton: true,
  radius: 'round',
};

/** What the library does with no props at all, so generated code only lists real choices. */
const LIBRARY_DEFAULTS: BuildConfig = {
  world: 'dichroic',
  motion: 'rise',
  spring: 'snappy',
  coat: 'material',
  tint: false,
  icons: true,
  timer: 'icon',
  closeButton: true,
  radius: 'round',
  density: 'comfortable',
  position: 'bottom-right',
  expand: false,
  duration: 5000,
};

export const coats: Record<Exclude<CoatName, 'material'>, { name: string; colors: readonly [string, string, string] }> = {
  aurora: { name: 'Aurora', colors: ['oklch(80% 0.14 198)', 'oklch(69% 0.22 332)', 'oklch(85% 0.14 78)'] },
  ember: { name: 'Ember', colors: ['oklch(68% 0.2 28)', 'oklch(76% 0.17 55)', 'oklch(87% 0.14 92)'] },
  lagoon: { name: 'Lagoon', colors: ['oklch(78% 0.13 185)', 'oklch(64% 0.17 255)', 'oklch(88% 0.17 128)'] },
  orchid: { name: 'Orchid', colors: ['oklch(62% 0.2 300)', 'oklch(72% 0.18 352)', 'oklch(86% 0.09 50)'] },
  mono: { name: 'Mono', colors: ['oklch(88% 0 0)', 'oklch(62% 0 0)', 'oklch(96% 0 0)'] },
};

export const motions: ReadonlyArray<{ value: ToastMotion; name: string; line: string }> = [
  { value: 'fade', name: 'Fade', line: 'Opacity only. The baseline.' },
  { value: 'rise', name: 'Rise', line: 'Lifts in from the edge.' },
  { value: 'drop', name: 'Drop', line: 'Falls from above and lands.' },
  { value: 'hinge', name: 'Hinge', line: 'Swings down like a hung sign.' },
  { value: 'focus', name: 'Focus', line: 'Pulls in from a blur.' },
  { value: 'bloom', name: 'Bloom', line: 'Grows out of a capsule.' },
];

export const springChoices: ReadonlyArray<{ value: SpringPresetName; name: string }> = [
  { value: 'smooth', name: 'Smooth' },
  { value: 'stiff', name: 'Stiff' },
  { value: 'snappy', name: 'Snappy' },
  { value: 'pop', name: 'Pop' },
  { value: 'bouncy', name: 'Bouncy' },
  { value: 'jelly', name: 'Jelly' },
  { value: 'gentle', name: 'Gentle' },
  { value: 'lazy', name: 'Lazy' },
];

const sameSpring = (a: SpringChoice, b: SpringChoice) =>
  typeof a === 'string' || typeof b === 'string' ? a === b : a.duration === b.duration && a.bounce === b.bounce;

const springName = (s: SpringChoice) =>
  typeof s === 'string' ? (springChoices.find((c) => c.value === s)?.name ?? s) : `Custom ${s.duration}s / ${s.bounce}`;

/** The layers added on top of PLAIN, each with a label and how to peel it back off. */
export function layers(config: BuildConfig, worldName: (w: HaloWorldName) => string) {
  const list: Array<{ key: keyof BuildConfig; label: string }> = [];
  if (config.world !== PLAIN.world) list.push({ key: 'world', label: `${worldName(config.world)} glass` });
  if (config.motion !== PLAIN.motion) list.push({ key: 'motion', label: `${motions.find((m) => m.value === config.motion)?.name} entrance` });
  if (!sameSpring(config.spring, PLAIN.spring)) list.push({ key: 'spring', label: `${springName(config.spring)} spring` });
  if (config.coat !== PLAIN.coat) list.push({ key: 'coat', label: `${coats[config.coat as Exclude<CoatName, 'material'>].name} coat` });
  if (config.tint) list.push({ key: 'tint', label: 'Tinted by type' });
  if (config.icons) list.push({ key: 'icons', label: 'Icons' });
  if (config.timer) list.push({ key: 'timer', label: `${config.timer === 'icon' ? 'Icon' : config.timer === 'close' ? 'Close' : 'Edge'} timer` });
  if (config.closeButton) list.push({ key: 'closeButton', label: 'Close button' });
  if (config.radius !== PLAIN.radius) list.push({ key: 'radius', label: `${config.radius[0]?.toUpperCase()}${config.radius.slice(1)} corners` });
  if (config.density !== PLAIN.density) list.push({ key: 'density', label: `${config.density[0]?.toUpperCase()}${config.density.slice(1)}` });
  if (config.expand) list.push({ key: 'expand', label: 'Always fanned' });
  return list;
}

const springLiteral = (s: SpringChoice) => (typeof s === 'string' ? `"${s}"` : `{{ duration: ${s.duration}, bounce: ${s.bounce} }}`);

export function builderCode(config: BuildConfig) {
  const d = LIBRARY_DEFAULTS;
  const attrs: string[] = [];
  const str = (name: string, value: string) => attrs.push(`${name}="${value}"`);
  if (config.world !== d.world) str('world', config.world);
  if (config.motion !== d.motion) str('motion', config.motion);
  if (!sameSpring(config.spring, d.spring)) attrs.push(`spring=${springLiteral(config.spring)}`);
  if (config.coat !== 'material') {
    const [a, b, c] = coats[config.coat as Exclude<CoatName, 'material'>].colors;
    attrs.push(`coat={['${a}', '${b}', '${c}']}`);
  }
  if (config.tint) attrs.push('tint');
  if (!config.icons) attrs.push('icons={false}');
  if (config.timer !== d.timer) attrs.push(config.timer ? `timer="${config.timer}"` : 'timer={false}');
  if (!config.closeButton) attrs.push('closeButton={false}');
  if (config.radius !== d.radius) str('radius', config.radius);
  if (config.density !== d.density) str('density', config.density);
  if (config.position !== d.position) str('position', config.position);
  if (config.expand) attrs.push('expand');
  if (config.duration !== d.duration) attrs.push(`duration={${config.duration}}`);
  const jsx = attrs.length ? `<Toaster\n  ${attrs.join('\n  ')}\n/>` : '<Toaster />';
  return `import { Toaster, toast } from '@halo-ui/react/toast';
import '@halo-ui/react/styles.css';

// Once, at the root of your app:
${jsx}

// Anywhere:
toast.success('Changes saved');`;
}

export function builderPrompt(config: BuildConfig, principles: string, llmsUrl: string) {
  return `Add Halo toasts to this React app.

1. Install: npm i @halo-ui/react
2. Render this once near the root (inside providers, outside routes):

${builderCode(config)}

3. Replace existing notification calls with toast(), toast.success(), toast.error(), toast.warning(), toast.info(), or toast.promise(promise, { loading, success, error }).
   Use toast.update(id, title) to change a toast in place instead of stacking a new one.
   Give actions as { action: { label, onClick } }; call event.preventDefault() in onClick to keep the toast open.

${principles}

Full reference for agents: ${llmsUrl}`;
}

export const toToasterProps = (config: BuildConfig) => ({
  world: config.world,
  motion: config.motion,
  spring: config.spring,
  coat: config.coat === 'material' ? undefined : coats[config.coat].colors,
  tint: config.tint,
  icons: config.icons,
  timer: config.timer,
  closeButton: config.closeButton,
  radius: config.radius,
  density: config.density,
  position: config.position,
  expand: config.expand,
  duration: config.duration,
});
