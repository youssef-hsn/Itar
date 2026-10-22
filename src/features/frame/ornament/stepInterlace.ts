import { type PathCommand, type Point, polygonCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';
import { flipVertical, squareQuarterRing } from './shapes.ts';

const STRAND: Point[] = [
  { x: 0, y: 0.15 },
  { x: 0.4, y: 0.15 },
  { x: 0.4, y: 0.4 },
  { x: 0.7, y: 0.4 },
  { x: 0.7, y: 0.65 },
  { x: 1, y: 0.65 },
  { x: 1, y: 0.85 },
  { x: 0.6, y: 0.85 },
  { x: 0.6, y: 0.6 },
  { x: 0.3, y: 0.6 },
  { x: 0.3, y: 0.35 },
  { x: 0, y: 0.35 },
];

function tile(): PathCommand[] {
  return [...polygonCommands(STRAND), ...polygonCommands(flipVertical(STRAND))];
}

function corner(): PathCommand[] {
  const center = { x: 1, y: 1 };
  return [...squareQuarterRing(center, 0.65, 0.85), ...squareQuarterRing(center, 0.15, 0.35)];
}

export const stepInterlace: Motif = {
  id: 'stepInterlace',
  isDirectional: false,
  label: 'Step interlace',
  tile,
  corner,
};
