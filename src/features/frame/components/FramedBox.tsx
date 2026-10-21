import type { ReactNode } from 'react';
import { frameMatCss } from '../frame.css.ts';
import type { FrameGeometry } from '../frame.geometry.ts';
import { framePaint } from '../frame.paint.ts';
import { FrameRings } from './FrameRings.tsx';

type FramedBoxProps = {
  geometry: FrameGeometry;
  children: ReactNode;
};

export const FramedBox = ({ geometry, children }: FramedBoxProps) => {
  const { composedSize } = geometry;

  return (
    <div
      className="relative flow-root"
      style={{ width: composedSize.width, height: composedSize.height }}
    >
      <FrameRings ops={framePaint(geometry)} size={composedSize} />
      <div className="relative" style={frameMatCss(geometry)}>
        {children}
      </div>
    </div>
  );
};
