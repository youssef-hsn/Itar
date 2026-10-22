import { type PathCommand, type Point, polygonCommands } from '../frame.path.ts';
import type { Motif } from './motif.ts';

const CENTER = 0.5;
const RADIUS = 0.46;

function triangle(degrees: [number, number, number]): PathCommand[] {
  const vertices = degrees.map((degree): Point => {
    const angle = (degree * Math.PI) / 180;
    return { x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle) };
  });
  return polygonCommands(vertices);
}

function tile(): PathCommand[] {
  return [...triangle([-90, 30, 150]), ...triangle([90, 210, 330])];
}

function corner(): PathCommand[] {
  return [...triangle([45, 165, 285]), ...triangle([105, 225, 345])];
}

export const hexagram: Motif = {
  id: 'hexagram',
  label: '6-point star',
  tile,
  corner,
};
