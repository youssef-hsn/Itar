import { type PathCommand, rectCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';

function tile(): PathCommand[] {
  return [...rectCommands(0, 0.8, 1, 0.2), ...rectCommands(0.2, 0.15, 0.6, 0.65)];
}

function corner(): PathCommand[] {
  return [...rectCommands(0.8, 0.8, 0.2, 0.2), ...rectCommands(0.2, 0.2, 0.45, 0.45)];
}

export const dentil: Motif = {
  id: 'dentil',
  label: 'Dentil',
  tile,
  corner,
};
