import { useId } from 'react';
import type { Size } from '../frame.geometry.ts';
import type { PaintOp } from '../frame.paint.ts';

type FrameRingsProps = {
  ops: PaintOp[];
  size: Size;
};

export const FrameRings = ({ ops, size }: FrameRingsProps) => {
  const idPrefix = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ringOps = ops.slice(0, -1);

  return (
    <svg
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      {ringOps.map((op, index) => {
        const path = <path d={op.d} fill={op.fill} fillRule={op.fillRule} />;
        if (op.clip == null) {
          return <g key={index}>{path}</g>;
        }

        const clipId = `${idPrefix}-clip-${index}`;
        return (
          <g key={index}>
            <clipPath id={clipId}>
              <path d={op.clip} clipRule="evenodd" />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>{path}</g>
          </g>
        );
      })}
    </svg>
  );
};
