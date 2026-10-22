import { type PathCommand, transformCommands } from '../frame.path.ts';
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

const CORNER_SCALE = 0.7;
const HALF_DIAGONAL = Math.SQRT1_2;

function cornerArch(): PathCommand[] {
  const scaled = CORNER_SCALE * HALF_DIAGONAL;
  return transformCommands(arch(), {
    origin: { x: 0.5 - scaled, y: 0.5 },
    u: { x: scaled, y: -scaled },
    v: { x: scaled, y: scaled },
  });
}

export const mihrab: Motif = {
  id: 'mihrab',
  isDirectional: false,
  label: 'Arches',
  tile: arch,
  corner: cornerArch,
};
