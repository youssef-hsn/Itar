import { type PathCommand, rectCommands } from '../frame.path.ts';
import type { CornerStyle } from '../frame.schema.ts';
import type { Motif } from './motif.ts';
import { circle } from './shapes.ts';

export const CORNER_LABELS: Record<CornerStyle, string> = {
  motif: 'Matched',
  rosette: 'Rosette',
  block: 'Block',
  none: 'Plain',
};

export function cornerCommands(style: CornerStyle, motif: Motif): PathCommand[] {
  switch (style) {
    case 'motif':
      return motif.corner();
    case 'rosette':
      return [...circle(0.4, true), ...circle(0.28, false), ...circle(0.14, true)];
    case 'block':
      return rectCommands(0, 0, 1, 1);
    case 'none':
      return [];
  }
}
