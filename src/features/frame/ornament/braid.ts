import type { PathCommand } from '../frame.path.ts';
import type { Motif } from './motif.ts';
import { quarterRing, sCurveRibbon } from './shapes.ts';

function tile(): PathCommand[] {
  return [
    ...sCurveRibbon([0.1, 0.26], [0.42, 0.58]),
    ...sCurveRibbon([0.42, 0.58], [0.74, 0.9]),
    ...sCurveRibbon([0.74, 0.9], [0.1, 0.26]),
  ];
}

function corner(): PathCommand[] {
  const center = { x: 1, y: 1 };
  return [
    ...quarterRing(center, 0.74, 0.9),
    ...quarterRing(center, 0.42, 0.58),
    ...quarterRing(center, 0.1, 0.26),
  ];
}

export const braid: Motif = {
  id: 'braid',
  isDirectional: true,
  label: 'Braid',
  tile,
  corner,
};
