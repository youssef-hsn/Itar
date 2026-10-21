import { type PathCommand, polygonCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';

function arch(): PathCommand[] {
  return [
    { op: 'M', to: { x: 0.12, y: 1 } },
    { op: 'L', to: { x: 0.12, y: 0.55 } },
    { op: 'Q', c: { x: 0.12, y: 0.2 }, to: { x: 0.5, y: 0.12 } },
    { op: 'Q', c: { x: 0.88, y: 0.2 }, to: { x: 0.88, y: 0.55 } },
    { op: 'L', to: { x: 0.88, y: 1 } },
    { op: 'Z' },
  ];
}

function diamond(): PathCommand[] {
  return polygonCommands([
    { x: 0.5, y: 0.15 },
    { x: 0.85, y: 0.5 },
    { x: 0.5, y: 0.85 },
    { x: 0.15, y: 0.5 },
  ]);
}

export const mihrab: Motif = {
  id: 'mihrab',
  label: 'Arches',
  tile: arch,
  corner: diamond,
};
