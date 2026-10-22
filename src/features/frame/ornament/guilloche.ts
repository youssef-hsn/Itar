import type { PathCommand, Point } from '../frame.path.ts';
import type { Motif } from './motif.ts';
import { circle, quarterRing, sCurveRibbon } from './shapes.ts';

const SEAM: [number, number] = [0.4, 0.6];

function arch(crest: [number, number]): PathCommand[] {
  return [...sCurveRibbon(SEAM, crest, 0, 0.5), ...sCurveRibbon(crest, SEAM, 0.5, 1)];
}

function eye(center?: Point): PathCommand[] {
  return [...circle(0.14, true, center), ...circle(0.07, false, center)];
}

function tile(): PathCommand[] {
  return [...arch([0.1, 0.26]), ...arch([0.74, 0.9]), ...eye()];
}

function corner(): PathCommand[] {
  return [...quarterRing({ x: 1, y: 1 }, ...SEAM), ...eye({ x: 0.3, y: 0.3 })];
}

export const guilloche: Motif = {
  id: 'guilloche',
  isDirectional: false,
  label: 'Guilloche',
  tile,
  corner,
};
