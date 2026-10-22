import type { PathCommand } from '../frame.path.ts';
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

function cornerArch(): PathCommand[] {
  return [
    { op: 'M', to: { x: 0.88, y: 0.88 } },
    { op: 'L', to: { x: 0.4, y: 0.88 } },
    { op: 'L', to: { x: 0.4, y: 0.7 } },
    { op: 'Q', c: { x: 0.4, y: 0.3 }, to: { x: 0.15, y: 0.15 } },
    { op: 'Q', c: { x: 0.3, y: 0.4 }, to: { x: 0.7, y: 0.4 } },
    { op: 'L', to: { x: 0.88, y: 0.4 } },
    { op: 'Z' },
  ];
}

export const mihrab: Motif = {
  id: 'mihrab',
  label: 'Arches',
  tile: arch,
  corner: cornerArch,
};
