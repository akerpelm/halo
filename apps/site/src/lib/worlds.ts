import type { HaloWorld, HaloWorldName } from '@halo-ui/react';

export const worlds: ReadonlyArray<{ value: HaloWorld; name: string; line: string }> = [
  { value: 'dichroic', name: 'Dichroic', line: 'A clear pane with a coated edge whose hue shifts as it moves. It throws cyan, magenta, and amber light on what sits behind it.' },
  { value: 'partition', name: 'Partition', line: 'Acid-etched glass with an aluminium hairline and no hue. Content behind it softens into silhouette. Suits dense, serious tools.' },
  { value: 'smoked', name: 'Smoked', line: 'Bronze-tinted glass that stays dark on any page. For media, night modes, and anything that sits over imagery.' },
  { value: 'vapor', name: 'Vapor', line: 'Breath on cold glass: the most diffuse world, with an edge you can barely see. For calm, airy products.' },
  { value: 'crystal', name: 'Crystal', line: 'Clear and bevelled, with a pale prismatic edge and little blur, so the page stays readable behind it.' },
  { value: 'ink', name: 'Ink', line: 'Solid and crisp, with no blur at all. The cheapest to render, for dense tools and low-power devices.' },
  { value: 'opal', name: 'Opal', line: 'A milky pane whose whole surface turns iridescent as it moves, not just the edge.' },
  { value: 'mercury', name: 'Mercury', line: 'Liquid metal: a chrome edge whose highlight slides across it as the pane moves.' },
  { value: 'vellum', name: 'Vellum', line: 'Matte drafting film. Barely diffused, very crisp, with a printed rule inset from the edge.' },
];

/** Worlds defined in this site's CSS, not the library: proof that a world is just a selector. */
export const customWorlds: ReadonlyArray<{ value: string; name: string; line: string }> = [
  { value: 'midnight', name: 'Midnight', line: 'Example: a world written in this site’s CSS. The library has never heard of it.' },
];

export const allWorlds = [...worlds, ...customWorlds];

export const worldName = (world: HaloWorldName) =>
  allWorlds.find((w) => w.value === world)?.name ?? world;

/** Dark-only worlds (Midnight sets color-scheme: dark) need the site's dark text tokens on any panel that wears them. */
export const themeFor = <T extends string>(world: HaloWorldName, theme: T): T | 'dark' =>
  customWorlds.some((w) => w.value === world) ? 'dark' : theme;
