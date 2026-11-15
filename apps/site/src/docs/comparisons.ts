/** Behaviour next to the libraries Halo replaces, each row checked against their source. */
export const vsSonner: ReadonlyArray<readonly [string, string, string]> = [
  ['Flick speed', 'Distance divided by the whole gesture time, so a slow drag that ends in a flick reads as slow.', 'A line fitted through the last 80 ms of pointer samples.'],
  ['After you let go', 'Fixed CSS transitions: a 200 ms exit, a timed snap-back.', 'A spring that starts at your release speed and keeps going.'],
  ['Interruptions', 'A new CSS transition starts from rest.', 'Retargeting keeps the current velocity, so motion never stalls.'],
  ['Stack layout', 'Transitions on transform, opacity, and height.', 'Transform and opacity only. Height clips are offset inside the spring.'],
  ['Hidden toasts', 'Timers run for toasts tucked behind the deck.', 'A toast only counts down while it is visible.'],
  ['Screen readers', 'One polite live region for every type.', 'Polite and assertive regions. Errors interrupt, and every type is announced by name.'],
  ['Entrances', 'One slide-in.', 'Six, all on springs: rise, fade, drop, hinge, focus, and bloom. Each exit reverses its entrance.'],
  ['Time left', 'Not shown.', 'The status icon empties like a timer, and freezes while you read. Or put the ring on the close button.'],
];

export const vsVaul: ReadonlyArray<readonly [string, string, string]> = [
  ['Foundation', 'Radix Dialog with a portal.', 'The native dialog element. No dependencies besides React.'],
  ['After you let go', 'Every release plays the same 0.5 s cubic-bezier.', 'A spring that starts at your release speed.'],
  ['Choosing a detent', 'Threshold rules, such as skipping to the end when velocity is over 2.', 'The detent nearest where your flick would coast to.'],
  ['Overscroll', 'Dampened drag past the edge.', 'Rubber-banding, plus a strip of pane past the edge so no gap ever shows.'],
  ['Handle', 'An aria-hidden div. Clicking cycles detents, but the keyboard cannot reach it.', 'A real button. Press it, or use the arrow keys, to change size.'],
];

/** How a drawer release becomes motion. */
export const releaseSteps = [
  ['Sample', 'While you drag, Halo records where the pane is and when, and keeps only the last 80 ms.'],
  ['Project', 'When you let go, it works out where a flick that fast would coast to, the way a scroll view does.'],
  ['Settle', 'It picks the snap point nearest that landing spot and hands your velocity to a spring, so the pane keeps moving instead of restarting.'],
] as const;
