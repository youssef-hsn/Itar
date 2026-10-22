import type { PathCommand } from '../frame.path.ts';
import type { MotifId } from '../frame.schema.ts';
import { angularInterlace } from './angularInterlace.ts';
import { chain } from './chain.ts';
import { chevron } from './chevron.ts';
import { dentil } from './dentil.ts';
import { hexagram } from './hexagram.ts';
import { interlace } from './interlace.ts';
import { khatam } from './khatam.ts';
import { kufic } from './kufic.ts';
import { mihrab } from './mihrab.ts';
import { stepInterlace } from './stepInterlace.ts';

export type Motif = {
  id: MotifId;
  label: string;
  isDirectional: boolean;
  tile: () => PathCommand[];
  corner: () => PathCommand[];
};

export const MIN_ORNAMENT_WIDTH = 4;

const GILT_INK = '#c9a227';
const TEAL_INK = '#1a3a3f';

export function defaultOrnamentInk(ground: string): string {
  return ground.slice(0, 7).toLowerCase() === GILT_INK ? TEAL_INK : GILT_INK;
}

export const MOTIFS: Record<MotifId, Motif> = {
  khatam,
  interlace,
  angularInterlace,
  stepInterlace,
  kufic,
  mihrab,
  chevron,
  chain,
  hexagram,
  dentil,
};
