import type { HaloWorld } from '@halo-ui/react';

export const worlds: ReadonlyArray<{ value: HaloWorld; name: string; line: string }> = [
  { value: 'dichroic', name: 'Dichroic', line: 'A clear pane with a coated edge whose hue shifts as it moves. It throws cyan, magenta, and amber light on what sits behind it.' },
  { value: 'partition', name: 'Partition', line: 'Acid-etched glass with an aluminium hairline and no hue. Content behind it softens into silhouette. Suits dense, serious tools.' },
  { value: 'smoked', name: 'Smoked', line: 'Bronze-tinted glass that stays dark on any page. For media, night modes, and anything that sits over imagery.' },
  { value: 'vapor', name: 'Vapor', line: 'Breath on cold glass: the most diffuse world, with an edge you can barely see. For calm, airy products.' },
  { value: 'crystal', name: 'Crystal', line: 'Clear and bevelled, with a pale prismatic edge and little blur, so the page stays readable behind it.' },
  { value: 'ink', name: 'Ink', line: 'Solid and crisp, with no blur at all. The cheapest to render, for dense tools and low-power devices.' },
];

export const worldName = (world: HaloWorld) => worlds.find((w) => w.value === world)?.name ?? world;
