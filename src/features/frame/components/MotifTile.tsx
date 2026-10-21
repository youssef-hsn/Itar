import { toPathData, transformCommands } from '../frame.path.ts';
import type { Motif } from '../ornament/motif.ts';

type MotifTileProps = {
  motif: Motif;
  ground: string;
  ink: string;
  size: number;
};

export const MotifTile = ({ motif, ground, ink, size }: MotifTileProps) => {
  const d = toPathData(
    transformCommands(motif.tile(), {
      origin: { x: 0, y: 0 },
      u: { x: size, y: 0 },
      v: { x: 0, y: size },
    }),
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <rect width={size} height={size} fill={ground} />
      <path d={d} fill={ink} />
    </svg>
  );
};
