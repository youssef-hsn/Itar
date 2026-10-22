import { type PathCommand, polygonCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';

function tile(): PathCommand[] {
  return polygonCommands([
    { x: 0, y: 0.25 },
    { x: 0.5, y: 0.6 },
    { x: 1, y: 0.25 },
    { x: 1, y: 0.45 },
    { x: 0.5, y: 0.8 },
    { x: 0, y: 0.45 },
  ]);
}

function corner(): PathCommand[] {
  return polygonCommands([
    { x: 1, y: 0.25 },
    { x: 0.25, y: 0.25 },
    { x: 0.25, y: 1 },
    { x: 0.45, y: 1 },
    { x: 0.45, y: 0.45 },
    { x: 1, y: 0.45 },
  ]);
}

export const chevron: Motif = {
  id: 'chevron',
  isDirectional: false,
  label: 'Chevron',
  tile,
  corner,
};
