import { type PathCommand, type Point, polygonCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';
import { flipVertical, squareQuarterRing } from './shapes.ts';

const STRAND: Point[] = [
  { x: 0, y: 0.15 },
  { x: 0.25, y: 0.15 },
  { x: 0.75, y: 0.65 },
  { x: 1, y: 0.65 },
  { x: 1, y: 0.85 },
  { x: 0.75, y: 0.85 },
  { x: 0.25, y: 0.35 },
  { x: 0, y: 0.35 },
];

function tile(): PathCommand[] {
  return [...polygonCommands(STRAND), ...polygonCommands(flipVertical(STRAND))];
}

function corner(): PathCommand[] {
  const center = { x: 1, y: 1 };
  return [...squareQuarterRing(center, 0.65, 0.85), ...squareQuarterRing(center, 0.15, 0.35)];
}

export const angularInterlace: Motif = {
  id: 'angularInterlace',
  isDirectional: false,
  label: 'Angular interlace',
  tile,
  corner,
};
