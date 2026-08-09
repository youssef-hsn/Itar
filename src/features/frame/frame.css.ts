import type { CSSProperties } from 'react';
import type { FrameGeometry } from './frame.geometry.ts';

export function frameCss(geometry: FrameGeometry): CSSProperties {
  let spread = 0;
  const shadows: string[] = [];

  for (const ring of geometry.rings) {
    spread += ring.width;
    shadows.push(`0 0 0 ${spread}px ${ring.color}`);
  }

  return {
    padding: geometry.matPadding,
    backgroundColor: geometry.matColor,
    borderRadius: geometry.radius,
    boxShadow: shadows.length > 0 ? shadows.join(', ') : undefined,
  };
}
