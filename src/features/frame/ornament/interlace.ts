import type { PathCommand, Point } from '../frame.path.ts';
import type { Motif } from './motif.ts';

const CIRCLE_KAPPA = 0.5523;
const QUARTER_TURNS: Point[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

function tile(): PathCommand[] {
  return [
    { op: 'M', to: { x: 0, y: 0.15 } },
    { op: 'C', c1: { x: 0.5, y: 0.15 }, c2: { x: 0.5, y: 0.65 }, to: { x: 1, y: 0.65 } },
    { op: 'L', to: { x: 1, y: 0.85 } },
    { op: 'C', c1: { x: 0.5, y: 0.85 }, c2: { x: 0.5, y: 0.35 }, to: { x: 0, y: 0.35 } },
    { op: 'Z' },
    { op: 'M', to: { x: 0, y: 0.65 } },
    { op: 'C', c1: { x: 0.5, y: 0.65 }, c2: { x: 0.5, y: 0.15 }, to: { x: 1, y: 0.15 } },
    { op: 'L', to: { x: 1, y: 0.35 } },
    { op: 'C', c1: { x: 0.5, y: 0.35 }, c2: { x: 0.5, y: 0.85 }, to: { x: 0, y: 0.85 } },
    { op: 'Z' },
  ];
}

function circle(radius: number, isClockwise: boolean): PathCommand[] {
  const [east, south, west, north] = QUARTER_TURNS as [Point, Point, Point, Point];
  const turns = isClockwise ? [east, south, west, north] : [east, north, west, south];
  const at = (direction: Point, lean: Point = { x: 0, y: 0 }): Point => ({
    x: 0.5 + radius * (direction.x + CIRCLE_KAPPA * lean.x),
    y: 0.5 + radius * (direction.y + CIRCLE_KAPPA * lean.y),
  });
  const arcs = turns.map((from, index): PathCommand => {
    const to = turns[(index + 1) % turns.length] as Point;
    return { op: 'C', c1: at(from, to), c2: at(to, from), to: at(to) };
  });
  return [{ op: 'M', to: at(east) }, ...arcs, { op: 'Z' }];
}

function corner(): PathCommand[] {
  return [...circle(0.34, true), ...circle(0.18, false)];
}

export const interlace: Motif = {
  id: 'interlace',
  label: 'Interlace',
  tile,
  corner,
};
