import { type PathCommand, type Point, polygonCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';

const CENTER = 0.5;
const STAR_RADIUS = 0.46;
const STAR_INNER_RADIUS = (STAR_RADIUS * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8);
const HOLE_RADIUS = 0.16;

function polar(radius: number, angle: number): Point {
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

function star(): PathCommand[] {
  const vertices = Array.from({ length: 16 }, (_, index) =>
    polar(index % 2 === 0 ? STAR_RADIUS : STAR_INNER_RADIUS, (index * Math.PI) / 8),
  );
  const hole = Array.from({ length: 8 }, (_, index) => polar(HOLE_RADIUS, (-index * Math.PI) / 4));
  return [...polygonCommands(vertices), ...polygonCommands(hole)];
}

export const khatam: Motif = {
  id: 'khatam',
  label: '8-point star',
  tile: star,
  corner: star,
};
