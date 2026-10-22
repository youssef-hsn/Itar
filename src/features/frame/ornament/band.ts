import { type Affine, type Point, toPathData, transformCommands } from '../frame.path.ts';
import type { Density, Ornament } from '../frame.schema.ts';
import { cornerCommands } from './cornerStyle.ts';
import { MIN_ORNAMENT_WIDTH, MOTIFS } from './motif.ts';

export const DENSITY_SCALE: Record<Density, number> = { tight: 0.75, regular: 1, wide: 1.5 };

export type Rect = { x: number; y: number; width: number; height: number };

type Edge = { origin: Point; along: Point; across: Point; side: number };

function edges({ x, y, width, height }: Rect, t: number): Edge[] {
  return [
    { origin: { x: x + t, y }, along: { x: 1, y: 0 }, across: { x: 0, y: 1 }, side: width },
    {
      origin: { x: x + width, y: y + t },
      along: { x: 0, y: 1 },
      across: { x: -1, y: 0 },
      side: height,
    },
    {
      origin: { x: x + width - t, y: y + height },
      along: { x: -1, y: 0 },
      across: { x: 0, y: -1 },
      side: width,
    },
    {
      origin: { x, y: y + height - t },
      along: { x: 0, y: -1 },
      across: { x: 1, y: 0 },
      side: height,
    },
  ];
}

function corners({ x, y, width, height }: Rect, t: number): Affine[] {
  const scaled = (origin: Point, along: Point, across: Point): Affine => ({
    origin,
    u: { x: along.x * t, y: along.y * t },
    v: { x: across.x * t, y: across.y * t },
  });
  return [
    scaled({ x, y }, { x: 1, y: 0 }, { x: 0, y: 1 }),
    scaled({ x: x + width, y }, { x: 0, y: 1 }, { x: -1, y: 0 }),
    scaled({ x: x + width, y: y + height }, { x: -1, y: 0 }, { x: 0, y: -1 }),
    scaled({ x, y: y + height }, { x: 0, y: -1 }, { x: 1, y: 0 }),
  ];
}

function edgeTiles(edge: Edge, t: number, scale: number, isMirrored: boolean): Affine[] {
  const length = edge.side - 2 * t;
  if (length <= 0) {
    return [];
  }

  const base = Math.max(1, Math.round(length / (t * scale)));
  const count =
    isMirrored && base > 1 ? 2 * Math.max(1, Math.round(length / (2 * t * scale))) : base;
  const tileLength = length / count;
  return Array.from({ length: count }, (_, index) => {
    const isFlipped = isMirrored && 2 * index > count - 1;
    const start = isFlipped ? index + 1 : index;
    const direction = isFlipped ? -1 : 1;
    return {
      origin: {
        x: edge.origin.x + edge.along.x * tileLength * start,
        y: edge.origin.y + edge.along.y * tileLength * start,
      },
      u: { x: edge.along.x * tileLength * direction, y: edge.along.y * tileLength * direction },
      v: { x: edge.across.x * t, y: edge.across.y * t },
    };
  });
}

export function bandInkPath(
  outer: Rect,
  thickness: number,
  pattern: Omit<Ornament, 'ink'>,
): string {
  if (thickness < MIN_ORNAMENT_WIDTH) {
    return '';
  }

  const motif = MOTIFS[pattern.motif];
  const tile = motif.tile();
  const corner = cornerCommands(pattern.corner, motif);
  const scale = DENSITY_SCALE[pattern.density];
  const tilePaths = edges(outer, thickness)
    .flatMap((edge) => edgeTiles(edge, thickness, scale, pattern.mirror))
    .map((affine) => toPathData(transformCommands(tile, affine)));
  const cornerPaths =
    corner.length === 0
      ? []
      : corners(outer, thickness).map((affine) => toPathData(transformCommands(corner, affine)));
  return [...tilePaths, ...cornerPaths].join('');
}
