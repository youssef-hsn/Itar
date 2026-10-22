import type { PathCommand } from '../frame.path.ts';
import type { Motif } from './motif.ts';
import { quarterRing } from './shapes.ts';

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

function corner(): PathCommand[] {
  const center = { x: 1, y: 1 };
  return [...quarterRing(center, 0.65, 0.85), ...quarterRing(center, 0.15, 0.35)];
}

export const interlace: Motif = {
  id: 'interlace',
  label: 'Interlace',
  tile,
  corner,
};
