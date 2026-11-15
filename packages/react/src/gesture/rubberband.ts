/** Resistance that grows the further you pull past an edge, approaching but never reaching `dimension`. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0) return 0;
  const distance = Math.abs(overshoot);
  return Math.sign(overshoot) * (1 - 1 / ((distance * constant) / dimension + 1)) * dimension;
}
