import type { CSSProperties } from 'react';
import type { FrameGeometry } from './frame.geometry.ts';
import { parseAlpha } from './frame.paint.ts';

export function frameCss(geometry: FrameGeometry): CSSProperties {
  let spread = 0;
  const shadows: string[] = [];

  for (const ring of geometry.rings) {
    if (parseAlpha(ring.color) === 0) {
      continue;
    }
    spread += ring.width;
    shadows.push(`0 0 0 ${spread}px ${ring.color}`);
  }

  return {
    display: 'block',
    boxSizing: 'border-box',
    padding: geometry.matPadding,
    backgroundColor: geometry.matColor,
    borderRadius: geometry.radius,
    boxShadow: shadows.length > 0 ? shadows.join(', ') : undefined,
    margin: geometry.totalThickness,
    overflow: 'hidden',
  };
}
