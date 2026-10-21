import { type Affine, type Point, toPathData, transformCommands } from '../frame.path.ts';
import { MIN_ORNAMENT_WIDTH, type Motif } from './motif.ts';

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

function edgeTiles(edge: Edge, t: number): Affine[] {
  const length = edge.side - 2 * t;
  if (length <= 0) {
    return [];
  }

  const count = Math.max(1, Math.round(length / t));
  const tileLength = length / count;
  return Array.from({ length: count }, (_, index) => ({
    origin: {
      x: edge.origin.x + edge.along.x * tileLength * index,
      y: edge.origin.y + edge.along.y * tileLength * index,
    },
    u: { x: edge.along.x * tileLength, y: edge.along.y * tileLength },
    v: { x: edge.across.x * t, y: edge.across.y * t },
  }));
}

export function bandInkPath(outer: Rect, thickness: number, motif: Motif): string {
  if (thickness < MIN_ORNAMENT_WIDTH) {
    return '';
  }

  const tile = motif.tile();
  const corner = motif.corner();
  const tilePaths = edges(outer, thickness)
    .flatMap((edge) => edgeTiles(edge, thickness))
    .map((affine) => toPathData(transformCommands(tile, affine)));
  const cornerPaths = corners(outer, thickness).map((affine) =>
    toPathData(transformCommands(corner, affine)),
  );
  return [...tilePaths, ...cornerPaths].join('');
}
