type Point = { x: number; y: number; px: number; py: number };

export type Cable = { points: Point[] };

export type Anchor = { x: number; y: number };

export type Edge = { from: Anchor; to: Anchor };

const SEGMENTS = 16;
const GRAVITY = 2600;
const DAMPING = 0.985;
const ITERATIONS = 14;
const STIFFNESS = 0.18;
const MEMORY = 2200;
const TENSION = 0.16;
const CLEARANCE = 1.5;
const LIGHT = normalize({ x: -0.55, y: -1 });

function normalize(v: Anchor): Anchor {
  const length = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / length, y: v.y / length };
}

export function createCable(a: Anchor, b: Anchor): Cable {
  return {
    points: Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const t = i / SEGMENTS;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      return { x, y, px: x, py: y };
    }),
  };
}

function pin(point: Point | undefined, anchor: Anchor) {
  if (!point) return;
  point.x = anchor.x;
  point.y = anchor.y;
  point.px = anchor.x;
  point.py = anchor.y;
}

function link(p: Point, q: Point, rest: number, strength: number) {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const distance = Math.hypot(dx, dy) || 0.0001;
  const push = ((distance - rest) / distance) * 0.5 * strength;
  p.x += dx * push;
  p.y += dy * push;
  q.x -= dx * push;
  q.y -= dy * push;
}

function rest(point: Point, edge: Edge) {
  const { from, to } = edge;
  if (point.x <= from.x || point.x >= to.x) return;
  const t = (point.x - from.x) / (to.x - from.x);
  const surface = from.y + (to.y - from.y) * t - CLEARANCE;
  if (point.y <= surface) return;
  point.y = surface;
  point.py = surface;
}

export function stepCable(cable: Cable, a: Anchor, b: Anchor, length: number, outward: number, dt: number, edge: Edge): number {
  if (length <= 0) return 0;
  const { points } = cable;
  const last = points.length - 1;
  const segment = length / SEGMENTS;
  const slack = Math.max(0, length - Math.hypot(b.x - a.x, b.y - a.y)) / length;
  const lateral = outward * slack * MEMORY;
  let motion = 0;

  for (let i = 1; i < last; i += 1) {
    const p = points[i] as Point;
    const vx = (p.x - p.px) * DAMPING;
    const vy = (p.y - p.py) * DAMPING;
    p.px = p.x;
    p.py = p.y;
    p.x += vx + lateral * dt * dt;
    p.y += vy + GRAVITY * dt * dt;
    motion += Math.abs(vx) + Math.abs(vy);
  }

  for (let k = 0; k < ITERATIONS; k += 1) {
    pin(points[0], a);
    pin(points[last], b);
    for (let i = 0; i < last; i += 1) link(points[i] as Point, points[i + 1] as Point, segment, 1);
    for (let i = 0; i < last - 1; i += 1) link(points[i] as Point, points[i + 2] as Point, segment * 2, STIFFNESS);
    for (let i = 1; i < last; i += 1) rest(points[i] as Point, edge);
  }
  if (slack === 0) {
    for (let i = 1; i < last; i += 1) {
      const p = points[i] as Point;
      const t = i / last;
      p.x += (a.x + (b.x - a.x) * t - p.x) * TENSION;
      p.y += (a.y + (b.y - a.y) * t - p.y) * TENSION;
    }
  }
  pin(points[0], a);
  pin(points[last], b);
  return motion;
}

function smooth(points: readonly Anchor[]) {
  const first = points[0];
  const end = points[points.length - 1];
  if (!first || !end) return '';
  let d = `M${first.x.toFixed(2)},${first.y.toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const p = points[i] as Anchor;
    const next = points[i + 1] as Anchor;
    d += ` Q${p.x.toFixed(2)},${p.y.toFixed(2)} ${((p.x + next.x) / 2).toFixed(2)},${((p.y + next.y) / 2).toFixed(2)}`;
  }
  return `${d} L${end.x.toFixed(2)},${end.y.toFixed(2)}`;
}

function litSide(points: readonly Point[], offset: number): Anchor[] {
  return points.map((p, i) => {
    const before = points[Math.max(0, i - 1)] as Point;
    const after = points[Math.min(points.length - 1, i + 1)] as Point;
    const normal = normalize({ x: -(after.y - before.y), y: after.x - before.x });
    const facing = normal.x * LIGHT.x + normal.y * LIGHT.y >= 0 ? 1 : -1;
    return { x: p.x + normal.x * offset * facing, y: p.y + normal.y * offset * facing };
  });
}

export const CAST = { x: 5, y: 9 };

export function cablePaths(cable: Cable) {
  const { points } = cable;
  return {
    body: smooth(points),
    sheen: smooth(litSide(points, 0.45)),
    shadow: smooth(points.map((p) => ({ x: p.x + CAST.x, y: p.y + CAST.y }))),
  };
}
