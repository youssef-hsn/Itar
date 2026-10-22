import type { PathCommand, Point } from '../frame.path.ts';

const CIRCLE_KAPPA = 0.5523;
const QUARTER_TURNS: Point[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

export function circle(
  radius: number,
  isClockwise: boolean,
  center: Point = { x: 0.5, y: 0.5 },
): PathCommand[] {
  const [east, south, west, north] = QUARTER_TURNS as [Point, Point, Point, Point];
  const turns = isClockwise ? [east, south, west, north] : [east, north, west, south];
  const at = (direction: Point, lean: Point = { x: 0, y: 0 }): Point => ({
    x: center.x + radius * (direction.x + CIRCLE_KAPPA * lean.x),
    y: center.y + radius * (direction.y + CIRCLE_KAPPA * lean.y),
  });
  const arcs = turns.map((from, index): PathCommand => {
    const to = turns[(index + 1) % turns.length] as Point;
    return { op: 'C', c1: at(from, to), c2: at(to, from), to: at(to) };
  });
  return [{ op: 'M', to: at(east) }, ...arcs, { op: 'Z' }];
}

export function quarterRing(center: Point, inner: number, outer: number): PathCommand[] {
  const at = (radius: number, dx: number, dy: number): Point => ({
    x: center.x - radius * dx,
    y: center.y - radius * dy,
  });
  return [
    { op: 'M', to: at(outer, 1, 0) },
    {
      op: 'C',
      c1: at(outer, 1, CIRCLE_KAPPA),
      c2: at(outer, CIRCLE_KAPPA, 1),
      to: at(outer, 0, 1),
    },
    { op: 'L', to: at(inner, 0, 1) },
    {
      op: 'C',
      c1: at(inner, CIRCLE_KAPPA, 1),
      c2: at(inner, 1, CIRCLE_KAPPA),
      to: at(inner, 1, 0),
    },
    { op: 'Z' },
  ];
}
