import type { PathCommand } from '../frame.path.ts';
import type { Motif } from './motif.ts';
import { quarterRing, sCurveRibbon } from './shapes.ts';

function tile(): PathCommand[] {
  return [...sCurveRibbon([0.15, 0.35], [0.65, 0.85]), ...sCurveRibbon([0.65, 0.85], [0.15, 0.35])];
}

function corner(): PathCommand[] {
  const center = { x: 1, y: 1 };
  return [...quarterRing(center, 0.65, 0.85), ...quarterRing(center, 0.15, 0.35)];
}

export const interlace: Motif = {
  id: 'interlace',
  isDirectional: false,
  label: 'Interlace',
  tile,
  corner,
};
