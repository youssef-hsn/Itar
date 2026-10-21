import type { PathCommand } from '../frame.path.ts';
import type { MotifId } from '../frame.schema.ts';
import { interlace } from './interlace.ts';
import { khatam } from './khatam.ts';
import { kufic } from './kufic.ts';
import { mihrab } from './mihrab.ts';

export type Motif = {
  id: MotifId;
  label: string;
  tile: () => PathCommand[];
  corner: () => PathCommand[];
};

export const MIN_ORNAMENT_WIDTH = 4;

export const MOTIFS: Record<MotifId, Motif> = { khatam, interlace, kufic, mihrab };
