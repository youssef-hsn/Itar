import type { FrameGeometry, RingInset } from './frame.geometry.ts';
import { roundedRectPath } from './frame.path.ts';
import { bandInkPath, type Rect } from './ornament/band.ts';

export type PaintOp = {
  d: string;
  fill: string;
  fillRule: 'nonzero' | 'evenodd';
  clip?: string;
};

export function parseAlpha(color: string): number {
  if (color.length === 9) {
    return Number.parseInt(color.slice(7, 9), 16) / 255;
  }
  return 1;
}

function insetRect(geometry: FrameGeometry, inset: number): Rect {
  const { totalThickness, matBox } = geometry;
  return {
    x: totalThickness - inset,
    y: totalThickness - inset,
    width: matBox.width + inset * 2,
    height: matBox.height + inset * 2,
  };
}

function insetPath(geometry: FrameGeometry, inset: number): string {
  const { x, y, width, height } = insetRect(geometry, inset);
  // Square frames keep square rings, matching the CSS box-shadow preview this replaced.
  const radius = geometry.radius > 0 ? geometry.radius + inset : 0;
  return roundedRectPath(x, y, width, height, radius);
}

function ringOps(geometry: FrameGeometry, ring: RingInset): PaintOp[] {
  const ringPath = insetPath(geometry, ring.outerInset) + insetPath(geometry, ring.innerInset);
  const ops: PaintOp[] = [];

  if (parseAlpha(ring.color) > 0) {
    ops.push({ d: ringPath, fill: ring.color, fillRule: 'evenodd' });
  }

  if (ring.ornament == null) {
    return ops;
  }

  const ink = bandInkPath(insetRect(geometry, ring.outerInset), ring.width, ring.ornament);
  if (ink !== '') {
    ops.push({ d: ink, fill: ring.ornament.ink, fillRule: 'nonzero', clip: ringPath });
  }
  return ops;
}

export function framePaint(geometry: FrameGeometry): PaintOp[] {
  const rings = [...geometry.rings].reverse().flatMap((ring) => ringOps(geometry, ring));
  const mat: PaintOp = {
    d: insetPath(geometry, 0),
    fill: geometry.matColor,
    fillRule: 'nonzero',
  };
  return [...rings, mat];
}
