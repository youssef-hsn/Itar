import { toPathData, transformCommands } from '../frame.path.ts';
import type { CornerStyle } from '../frame.schema.ts';
import { cornerCommands } from '../ornament/cornerStyle.ts';
import type { Motif } from '../ornament/motif.ts';

type CornerTileProps = {
  motif: Motif;
  style: CornerStyle;
  ground: string;
  ink: string;
  size: number;
};

const CORNER_SHARE = 0.6;

export const CornerTile = ({ motif, style, ground, ink, size }: CornerTileProps) => {
  const piece = size * CORNER_SHARE;
  const corner = transformCommands(cornerCommands(style, motif), {
    origin: { x: 0, y: 0 },
    u: { x: piece, y: 0 },
    v: { x: 0, y: piece },
  });
  const topEdge = transformCommands(motif.tile(), {
    origin: { x: piece, y: 0 },
    u: { x: piece, y: 0 },
    v: { x: 0, y: piece },
  });
  const leftEdge = transformCommands(motif.tile(), {
    origin: { x: 0, y: piece * 2 },
    u: { x: 0, y: -piece },
    v: { x: piece, y: 0 },
  });
  const d = toPathData([...corner, ...topEdge, ...leftEdge]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <rect width={size} height={size} fill={ground} />
      <path d={d} fill={ink} />
    </svg>
  );
};
