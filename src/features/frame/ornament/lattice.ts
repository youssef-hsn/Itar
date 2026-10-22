import { type PathCommand, type Point, polygonCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';

const STRAND: Point[] = [
  { x: 0, y: 0 },
  { x: 0.14, y: 0 },
  { x: 1, y: 0.86 },
  { x: 1, y: 1 },
  { x: 0.86, y: 1 },
  { x: 0, y: 0.14 },
];

const MIRRORED: Point[] = STRAND.map((vertex) => ({ x: 1 - vertex.x, y: vertex.y })).reverse();

function tile(): PathCommand[] {
  return [...polygonCommands(STRAND), ...polygonCommands(MIRRORED)];
}

export const lattice: Motif = {
  id: 'lattice',
  isDirectional: false,
  label: 'Lattice',
  tile,
  corner: tile,
};
