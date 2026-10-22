import { type PathCommand, rectCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';
import { circle } from './shapes.ts';

function tile(): PathCommand[] {
  return [
    ...circle(0.42, true),
    ...circle(0.26, false),
    ...rectCommands(0, 0.45, 0.12, 0.1),
    ...rectCommands(0.88, 0.45, 0.12, 0.1),
  ];
}

function corner(): PathCommand[] {
  return [
    ...circle(0.3, true),
    ...circle(0.16, false),
    ...rectCommands(0.78, 0.45, 0.22, 0.1),
    ...rectCommands(0.45, 0.78, 0.1, 0.22),
  ];
}

export const chain: Motif = {
  id: 'chain',
  label: 'Chain',
  tile,
  corner,
};
