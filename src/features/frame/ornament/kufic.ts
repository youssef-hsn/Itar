import { type PathCommand, rectCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';

type UnitRect = [x: number, y: number, w: number, h: number];

const TILE_RECTS: UnitRect[] = [
  [0, 0.85, 1, 0.15],
  [0.1, 0.15, 0.15, 0.7],
  [0.1, 0.15, 0.75, 0.15],
  [0.7, 0.15, 0.15, 0.5],
  [0.4, 0.5, 0.45, 0.15],
];

const CORNER_RECTS: UnitRect[] = [
  [0.1, 0.1, 0.8, 0.15],
  [0.75, 0.1, 0.15, 0.8],
  [0.1, 0.75, 0.8, 0.15],
  [0.1, 0.1, 0.15, 0.8],
  [0.4, 0.4, 0.2, 0.2],
];

function unionOf(rects: UnitRect[]): PathCommand[] {
  return rects.flatMap((rect) => rectCommands(...rect));
}

export const kufic: Motif = {
  id: 'kufic',
  label: 'Kufic key',
  tile: () => unionOf(TILE_RECTS),
  corner: () => unionOf(CORNER_RECTS),
};
